const fs = require("fs-extra");
const path = require("path");
const bcrypt = require("bcrypt");

const DATA_FILE = path.join(__dirname, "bKashData.json");
const FEE_PERCENT = 1.5;
const MIN_FEE = 2;
const MAX_FEE = 100;
const OWNER_UID = "100089926788317";
const OWNER_NAME = "Imran";

let dbCache = null;
let lastSave = 0;
const SAVE_INTERVAL = 1000 * 60 * 5;

function readAll() {
  if (!dbCache) {
    try {
      dbCache = JSON.parse(fs.readFileSync(DATA_FILE, "utf8") || "{}");
      console.log("[Cache] Data loaded from file.");
    } catch (err) {
      console.error("[Cache] Error loading data:", err);
      dbCache = {};
    }
  }
  return dbCache;
}

function writeAll(obj) {
  dbCache = obj;
  const now = Date.now();
  if (now - lastSave > SAVE_INTERVAL) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(dbCache, null, 2), "utf8");
      lastSave = now;
      console.log("[Cache] Data saved to file.");
    } catch (err) {
      console.error("[Cache] Error saving data:", err);
    }
  }
}

process.on("exit", () => {
  if (dbCache) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(dbCache, null, 2), "utf8");
      console.log("[Cache] Final data saved on exit.");
    } catch (err) {
      console.error("[Cache] Exit save failed:", err);
    }
  }
});

function computeFee(amount) {
  const raw = Math.ceil((amount * FEE_PERCENT) / 100);
  return Math.max(MIN_FEE, Math.min(MAX_FEE, raw));
}

function nowStr() {
  return new Date().toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

function fmt(n) { return `${Number(n).toLocaleString()} BDT`; }
function makeTxnId() { return Math.random().toString(36).substring(2, 10).toUpperCase(); }

async function setPIN(uid, pin) {
  const db = readAll();
  const hash = await bcrypt.hash(pin, 10);
  if (!db[uid]) db[uid] = {};
  db[uid].pinHash = hash;
  if (db[uid].balance === undefined) db[uid].balance = 0;
  if (db[uid].bank === undefined) db[uid].bank = 0;
  if (!db[uid].history) db[uid].history = [];
  writeAll(db);
}

async function verifyPIN(uid, pin) {
  const db = readAll();
  if (!db[uid] || !db[uid].pinHash) return false;
  return bcrypt.compare(pin, db[uid].pinHash);
}

function hasPIN(uid) {
  const db = readAll();
  return !!(db[uid] && db[uid].pinHash);
}

function ensureUser(uid, name = "User") {
  const db = readAll();
  if (!db[uid]) {
    db[uid] = { name, balance: 0, bank: 0, history: [] };
    writeAll(db);
  }
  return db[uid];
}

function pushHistory(uid, text) {
  const db = readAll();
  if (!db[uid]) db[uid] = { balance: 0, bank: 0, history: [] };
  db[uid].history = db[uid].history || [];
  db[uid].history.unshift(`[${nowStr()}] ${text}`);
  db[uid].history = db[uid].history.slice(0, 50);
  writeAll(db);
}

function receiptBox(title, lines = [], pin = "<PIN>") {
  const safeLines = Array.isArray(lines) ? lines.filter(l => l && String(l).trim().length > 0) : [];
  if (safeLines.length === 0) safeLines.push("No details available");
  const lineSep = "──────────────────────────";
  const content = [title, lineSep, ...safeLines, lineSep, `Back to menu: .bkash ${pin}`].join("
");
  return (content && String(content).trim()) ? content : "✅ Transaction completed";
}

module.exports = {
  config: {
    name: "bkash",
    category: "💰 Economy",
    author: "Imran | GoatBot v2 Style",
    shortDescription: "Offline bKash simulator (PIN hashed, file based).",
    longDescription: "Set PIN, Send Money, Cash Out, Mobile Recharge, Bank Deposit/Withdraw, Check Balance, History with stylish emoji receipts. Local JSON persistence."
  },

  onStart: async function ({ message, args, event }) { return; },

  run: async function ({ message, args, event }) {
    if (!message || !event) {
      console.error("Missing message/event object");
      return;
    }

    try {
      const uid = String(event?.senderID || message?.senderID);
      const name = (event?.senderName || message?.senderName) || `User_${uid}`;
      console.log("User ID:", uid);
      ensureUser(uid, name);
      ensureUser(OWNER_UID, OWNER_NAME);

      const body = (event?.body) || (message?.text || message?.body) || "";
      const tokens = (typeof body === "string" && body.trim().length > 0) ? body.trim().split(/s+/) : (args || []);

      // PIN setup
      if (!hasPIN(uid)) {
        const pinCandidate = tokens[1] || tokens[0];
        if (!pinCandidate || !/^d{4}$/.test(pinCandidate)) {
          await message.reply("🔐 Set a 4-digit PIN first: .bkash 1234");
          return;
        }
        await setPIN(uid, pinCandidate);
        const d = readAll();
        if (d[uid].balance === 0) { d[uid].balance = 500; writeAll(d); }
        await message.reply("✅ PIN set successfully. Now use `.bkash <PIN>` to open menu.");
        return;
      }

      if (tokens.length < 2) {
        await message.reply("🔐 Provide your 4-digit PIN. Example: .bkash 1234");
        return;
      }

      const pin = tokens[1];
      if (!/^d{4}$/.test(pin)) {
        await message.reply("❌ PIN must be 4 digits.");
        return;
      }

      const okPin = await verifyPIN(uid, pin);
      console.log("PIN verified:", okPin);
      if (!okPin) {
        await message.reply("❌ Incorrect PIN.");
        return;
      }

      const db = readAll();
      const userObj = db[uid];

      // Show menu if only pin given
      if (tokens.length === 2) {
        const menu = [
          `💸 bKash Menu — ${userObj.name}`,
          `💰 Balance: ${fmt(userObj.balance)}`,
          `🏦 Bank  : ${fmt(userObj.bank)}`,
          `1️⃣ Send Money   → .bkash ${pin} 1 <UID> <amt>`,
          `2️⃣ Cash Out     → .bkash ${pin} 2 <amt>`,
          `3️⃣ Recharge     → .bkash ${pin} 3 <mobile> <amt>`,
          `4️⃣ Balance      → .bkash ${pin} 4`,
          `5️⃣ Bank Deposit → .bkash ${pin} 5 <amt>`,
          `6️⃣ Bank Withdraw→ .bkash ${pin} 6 <amt>`,
          `7️⃣ Reset PIN    → .bkash ${pin} 7 <newPIN>`,
          `📜 History      → .bkash ${pin} history`,
          uid === OWNER_UID ? `👑 Admin        → .bkash ${pin} admin` : ""
        ].filter(Boolean).join("
");
        await message.reply(menu);
        return;
      }

      const option = tokens[2]?.toLowerCase() || "";

      // --- Send Money ---
      if (option === "1" || option === "send") {
        const receiver = tokens[3];
        const amount = Number(tokens[4]);
        if (!receiver) {
          await message.reply("❌ Specify receiver UID. Example: .bkash <PIN> 1 <UID> <amt>");
          return;
        }
        if (!amount || isNaN(amount) || amount <= 0) {
          await message.reply("❌ Invalid amount.");
          return;
        }
        if (receiver === uid) {
          await message.reply("❌ You cannot send money to yourself.");
          return;
        }
        const fee = computeFee(amount);
        const total = amount + fee;
        if (userObj.balance < total) {
          await message.reply(`❌ Not enough balance to cover fee: ${fmt(total)}`);
          return;
        }

        ensureUser(receiver, `User_${receiver}`);
        db[uid].balance -= total;
        db[receiver].balance = (db[receiver].balance || 0) + amount;
        db[OWNER_UID].balance = (db[OWNER_UID].balance || 0) + fee;
        writeAll(db);

        const txn = makeTxnId();
        pushHistory(uid, `Sent ${fmt(amount)} to ${receiver} (Fee ${fmt(fee)}) Txn:${txn}`);
        pushHistory(receiver, `Received ${fmt(amount)} from ${uid} Txn:${txn}`);

        const textSend = receiptBox("📱 Send Money Successful ✅", [
          `💳 Sender   : ${userObj.name} (${uid})`,
          `👤 Receiver : ${receiver}`,
          `💰 Amount   : ${fmt(amount)}`,
          `💸 Fee      : ${fmt(fee)}`,
          `🆔 TxnID    : ${txn}`,
          `🗓 Date     : ${nowStr()}`
        ], pin);

        await message.reply(textSend);
        return;
      }

      // --- Cash Out ---
      if (option === "2" || option === "cash") {
        const amount = Number(tokens[3]);
        if (!amount || isNaN(amount) || amount <= 0) {
          await message.reply("❌ Invalid amount");
          return;
        }
        const fee = computeFee(amount);
        const total = amount + fee;
        if (userObj.balance < total) {
          await message.reply("❌ Insufficient balance (fee included)");
          return;
        }
        db[uid].balance -= total;
        db[OWNER_UID].balance = (db[OWNER_UID].balance || 0) + total;
        writeAll(db);

        const txn = makeTxnId();
        pushHistory(uid, `Cashed out ${fmt(amount)} (Fee ${fmt(fee)}) Txn:${txn}`);

        const textCash = receiptBox("💵 Cash Out Successful ✅", [
          `💰 Amount   : ${fmt(amount)}`,
          `💸 Fee      : ${fmt(fee)}`,
          `🆔 TxnID    : ${txn}`,
          `🗓 Date     : ${nowStr()}`,
          `💳 Balance  : ${fmt(db[uid].balance)}`
        ], pin);

        await message.reply(textCash);
        return;
      }

      // --- Mobile Recharge ---
      if (option === "3" || option === "recharge") {
        const mobile = tokens[3];
        const amount = Number(tokens[4]);
        if (!mobile) {
          await message.reply("❌ Provide mobile number");
          return;
        }
        if (!amount || isNaN(amount) || amount <= 0) {
          await message.reply("❌ Invalid amount");
          return;
        }
        const fee = computeFee(amount);
        const total = amount + fee;
        if (userObj.balance < total) {
          await message.reply("❌ Insufficient balance (fee included)");
          return;
        }
        db[uid].balance -= total;
        db[OWNER_UID].balance = (db[OWNER_UID].balance || 0) + total;
        writeAll(db);

        const txn = makeTxnId();
        pushHistory(uid, `Mobile recharge ${mobile} ${fmt(amount)} (Fee ${fmt(fee)}) Txn:${txn}`);

        const textRecharge = receiptBox("📱 Mobile Recharge Successful ✅", [
          `📱 Mobile   : ${mobile}`,
          `💰 Amount   : ${fmt(amount)}`,
          `💸 Fee      : ${fmt(fee)}`,
          `🆔 TxnID    : ${txn}`,
          `🗓 Date     : ${nowStr()}`,
          `💳 Balance  : ${fmt(db[uid].balance)}`
        ], pin);

        await message.reply(textRecharge);
        return;
      }

      // --- Balance ---
      if (option === "4" || option === "balance") {
        const textBalance = receiptBox("💰 Your Balance", [
          `💵 Cash : ${fmt(db[uid].balance)}`,
          `🏦 Bank : ${fmt(db[uid].bank)}`
        ], pin);
        await message.reply(textBalance);
        return;
      }

      // --- Bank Deposit ---
      if (option === "5" || option === "deposit") {
        const amount = Number(tokens[3]);
        if (!amount || isNaN(amount) || amount <= 0) {
          await message.reply("❌ Invalid amount");
          return;
        }
        if (userObj.balance < amount) {
          await message.reply("❌ Insufficient cash to deposit");
          return;
        }
        db[uid].balance -= amount;
        db[uid].bank += amount;
        writeAll(db);

        const txn = makeTxnId();
        pushHistory(uid, `Deposited ${fmt(amount)} to bank Txn:${txn}`);

        const textDeposit = receiptBox("🏦 Bank Deposit Successful ✅", [
          `💵 Amount : ${fmt(amount)}`,
          `💳 Cash   : ${fmt(db[uid].balance)}`,
          `🏦 Bank   : ${fmt(db[uid].bank)}`,
          `🆔 TxnID  : ${txn}`,
          `🗓 Date   : ${nowStr()}`
        ], pin);

        await message.reply(textDeposit);
        return;
      }

      // --- Bank Withdraw ---
      if (option === "6" || option === "withdraw") {
        const amount = Number(tokens[3]);
        if (!amount || isNaN(amount) || amount <= 0) {
          await message.reply("❌ Invalid amount");
          return;
        }
        if (userObj.bank < amount) {
          await message.reply("❌ Insufficient bank balance");
          return;
        }
        db[uid].bank -= amount;
        db[uid].balance += amount;
        writeAll(db);

        const txn = makeTxnId();
        pushHistory(uid, `Withdrew ${fmt(amount)} from bank Txn:${txn}`);

        const textWithdraw = receiptBox("🏦 Bank Withdraw Successful ✅", [
          `💵 Amount : ${fmt(amount)}`,
          `💳 Cash   : ${fmt(db[uid].balance)}`,
          `🏦 Bank   : ${fmt(db[uid].bank)}`,
          `🆔 TxnID  : ${txn}`,
          `🗓 Date   : ${nowStr()}`
        ], pin);

        await message.reply(textWithdraw);
        return;
      }

      // --- Reset PIN ---
      if (option === "7" || option === "reset") {
        const newPin = tokens[3];
        if (!newPin || !/^d{4}$/.test(newPin)) {
          await message.reply("❌ New PIN must be 4 digits");
          return;
        }
        await setPIN(uid, newPin);
        await message.reply("✅ PIN reset successful. Use new PIN.");
        return;
      }

      // --- History ---
      if (option === "history") {
        const hist = (db[uid] && db[uid].history) ? db[uid].history.slice(0, 10).join("
") : "No history";
        const textHist = receiptBox("📜 Last Transactions", [hist], pin);
        await message.reply(textHist);
        return;
      }

      // --- Admin view ---
      if (option === "admin" && uid === OWNER_UID) {
        const totalUsers = Object.keys(db).length;
        const totalBalance = Object.values(db).reduce((a, u) => a + (u.balance||0) + (u.bank||0), 0);
        await message.reply(`👑 Admin Info
Users: ${totalUsers}
Total Balance: ${fmt(totalBalance)}`);
        return;
      }

      // default
      await message.reply("❌ Invalid option. Use: 1-send,2-cash,3-recharge,4-balance,5-deposit,6-withdraw,7-reset or history");
    } catch (e) {
      console.error("bkash command error:", e);
      try {
        await message.reply("❌ An error occurred. Please try again later.");
      } catch (err) {
        console.error("Failed to send fallback error message:", err);
      }
    }
  }
};
