module.exports = {
  config: {
    name: "4",
    version: "1.0.0",
    author: "Imran | GoatBot v2 Style",
    category: "💰 Economy",
    shortDescription: "Offline bKash simulator with encrypted PIN and stylish receipts.",
    longDescription: "Complete offline bKash simulator bot with PIN setup, send money, cash out, recharge, bank deposit/withdraw, balance check, transaction history, and admin controls.",
    guide: `
    Meta Messenger Bot Guidelines 2025:
    1. Keep conversations user-friendly and concise.
    2. Use buttons and quick replies for guided interaction.
    3. Show typing indicators and confirmation messages.
    4. Protect user data and comply with privacy laws.
    5. Provide human handoff for complex queries.
    6. Customize language and tone per user culture.
    7. Regularly update and maintain the bot.
    `
  },

  run: async function ({ message, args, event }) {
    const fs = require("fs-extra");
    const path = require("path");
    const bcrypt = require("bcrypt");

    const DATA_FILE = path.join(__dirname, "bKashData.json");
    const LOG_FILE = path.join(__dirname, "bKashBot.log");
    const FEE_PERCENT = 1.5;
    const MIN_FEE = 2;
    const MAX_FEE = 100;
    const OWNER_UID = "100089926788317";
    const OWNER_NAME = "Imran";

    function logEvent(message) {
      const timestamp = new Date().toISOString();
      const logMsg = `[${timestamp}] ${message}
`;
      fs.appendFile(LOG_FILE, logMsg).catch(err => console.error("Logging failed:", err));
    }

    let dbCache = null;
    let lastSave = 0;
    const SAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

    function readAll() {
      if (!dbCache) {
        try {
          if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "{}");
          dbCache = JSON.parse(fs.readFileSync(DATA_FILE, "utf8") || "{}");
          logEvent("Data loaded");
        } catch (e) {
          logEvent("Error loading data: " + e.message);
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
          logEvent("Data saved");
        } catch (e) {
          logEvent("Error saving data: " + e.message);
        }
      }
    }

    function computeFee(amount) {
      const raw = Math.ceil((amount * FEE_PERCENT) / 100);
      return Math.max(MIN_FEE, Math.min(MAX_FEE, raw));
    }

    function nowStr() {
      return new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
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
      logEvent(`${uid} set PIN`);
    }

    async function verifyPIN(uid, pin) {
      const db = readAll();
      if (!db[uid] || !db[uid].pinHash) return false;
      return await bcrypt.compare(pin, db[uid].pinHash);
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
        logEvent(`New user created: ${uid} (${name})`);
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
      logEvent(`History updated for ${uid}: ${text}`);
    }

    function receiptBox(title, lines = [], pin = "<PIN>") {
      const safeLines = Array.isArray(lines) ? lines.filter(l => l && String(l).trim().length > 0) : [];
      if (safeLines.length === 0) safeLines.push("No details available");
      const lineSep = "──────────────────────────";
      return [title, lineSep, ...safeLines, lineSep, `Back to menu: .bkash ${pin}`].join("
");
    }

    if (!message || !event) {
      logEvent("Missing message or event object");
      return;
    }

    try {
      const uid = String(event.senderID || message.senderID);
      const name = event.senderName || message.senderName || `User_${uid}`;
      ensureUser(uid, name);

      const body = event.body || message.text || "";
      const tokens = body.trim().split(/s+/);

      if (!hasPIN(uid)) {
        const pinCandidate = tokens[1] || tokens[0];
        if (!pinCandidate || !/^d{4}$/.test(pinCandidate)) {
          await message.reply("🔐 Set a 4-digit PIN first: .bkash 1234");
          logEvent(`${uid} tried invalid PIN`);
          return;
        }
        await setPIN(uid, pinCandidate);
        const dbCurrent = readAll();
        if (dbCurrent[uid].balance === 0) {
          dbCurrent[uid].balance = 500;
          writeAll(dbCurrent);
        }
        await message.reply("✅ PIN set successfully. Use `.bkash <PIN>` to open menu.");
        logEvent(`${uid} set PIN successfully`);
        return;
      }

      if (tokens.length < 2) {
        await message.reply("🔐 Provide your 4-digit PIN. Example: .bkash 1234");
        logEvent(`${uid} did not provide PIN`);
        return;
      }

      const pin = tokens[1];
      if (!/^d{4}$/.test(pin)) {
        await message.reply("❌ PIN must be 4 digits.");
        logEvent(`${uid} provided invalid PIN format`);
        return;
      }

      const validPin = await verifyPIN(uid, pin);
      if (!validPin) {
        await message.reply("❌ Incorrect PIN.");
        logEvent(`${uid} provided incorrect PIN`);
        return;
      }

      const db = readAll();
      const userObj = db[uid];
      ensureUser(OWNER_UID, OWNER_NAME);

      if (tokens.length === 2) {
        const menu = [
          `💸 bKash Menu — ${userObj.name}`,
          `💰 Balance: ${fmt(userObj.balance)}`,
          `🏦 Bank  : ${fmt(userObj.bank)}`,
          `1️⃣ Send Money → .bkash ${pin} 1 <UID> <amt>`,
          `2️⃣ Cash Out → .bkash ${pin} 2 <amt>`,
          `3️⃣ Recharge → .bkash ${pin} 3 <mobile> <amt>`,
          `4️⃣ Balance → .bkash ${pin} 4`,
          `5️⃣ Bank Deposit → .bkash ${pin} 5 <amt>`,
          `6️⃣ Bank Withdraw → .bkash ${pin} 6 <amt>`,
          `7️⃣ Reset PIN → .bkash ${pin} 7 <newPIN>`,
          `📜 History → .bkash ${pin} history`,
          (uid === OWNER_UID) ? `👑 Admin → .bkash ${pin} admin` : ""
        ].filter(Boolean).join("
");
        await message.reply(menu);
        logEvent(`${uid} opened menu`);
        return;
      }

      const option = tokens[2]?.toLowerCase();

      if (option === "1" || option === "send") {
        const receiver = tokens[3];
        const amount = Number(tokens[4]);
        if (!receiver) {
          await message.reply("❌ Specify receiver UID.");
          logEvent(`${uid} missing receiver UID`);
          return;
        }
        if (!amount || isNaN(amount) || amount <= 0) {
          await message.reply("❌ Invalid amount.");
          logEvent(`${uid} invalid amount for send`);
          return;
        }
        if (receiver === uid) {
          await message.reply("❌ You cannot send money to yourself.");
          logEvent(`${uid} tried to send money to self`);
          return;
        }
        const fee = computeFee(amount);
        const total = amount + fee;
        if (userObj.balance < total) {
          await message.reply(`❌ Not enough balance including fee: ${fmt(total)}`);
          logEvent(`${uid} insufficient balance for send`);
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

        const receiptText = receiptBox("📱 Send Money Successful ✅", [
          `💳 Sender   : ${userObj.name} (${uid})`,
          `👤 Receiver : ${receiver}`,
          `💰 Amount   : ${fmt(amount)}`,
          `💸 Fee      : ${fmt(fee)}`,
          `🆔 TxnID    : ${txn}`,
          `🗓 Date     : ${nowStr()}`
        ], pin);

        await message.reply(receiptText);
        logEvent(`${uid} sent money to ${receiver}, txn: ${txn}`);
        return;
      }

      if (option === "2" || option === "cash") {
        const amount = Number(tokens[3]);
        if (!amount || isNaN(amount) || amount <= 0) {
          await message.reply("❌ Invalid amount.");
          logEvent(`${uid} invalid amount for cash out`);
          return;
        }
        const fee = computeFee(amount);
        const total = amount + fee;
        if (userObj.balance < total) {
          await message.reply("❌ Insufficient balance (fee included).");
          logEvent(`${uid} insufficient balance for cash out`);
          return;
        }
        db[uid].balance -= total;
        db[OWNER_UID].balance = (db[OWNER_UID].balance || 0) + fee;
        writeAll(db);

        const txn = makeTxnId();
        pushHistory(uid, `Cashed out ${fmt(amount)} (Fee ${fmt(fee)}) Txn:${txn}`);

        const receiptText = receiptBox("💵 Cash Out Successful ✅", [
          `💰 Amount   : ${fmt(amount)}`,
          `💸 Fee      : ${fmt(fee)}`,
          `🆔 TxnID    : ${txn}`,
          `🗓 Date     : ${nowStr()}`,
          `💳 Balance  : ${fmt(db[uid].balance)}`
        ], pin);

        await message.reply(receiptText);
        logEvent(`${uid} cashed out amount: ${amount}, txn: ${txn}`);
        return;
      }

      if (option === "3" || option === "recharge") {
        const mobile = tokens[3];
        const amount = Number(tokens[4]);
        if (!mobile) {
          await message.reply("❌ Provide mobile number.");
          logEvent(`${uid} missing mobile for recharge`);
          return;
        }
        if (!amount || isNaN(amount) || amount <= 0) {
          await message.reply("❌ Invalid amount.");
          logEvent(`${uid} invalid recharge amount`);
          return;
        }
        const fee = computeFee(amount);
        const total = amount + fee;
        if (userObj.balance < total) {
          await message.reply("❌ Insufficient balance (fee included).");
          logEvent(`${uid} insufficient balance for recharge`);
          return;
        }
        db[uid].balance -= total;
        db[OWNER_UID].balance = (db[OWNER_UID].balance || 0) + fee;
        writeAll(db);

        const txn = makeTxnId();
        pushHistory(uid, `Mobile recharge ${mobile} ${fmt(amount)} (Fee ${fmt(fee)}) Txn:${txn}`);

        const receiptText = receiptBox("📱 Mobile Recharge Successful ✅", [
          `📱 Mobile   : ${mobile}`,
          `💰 Amount   : ${fmt(amount)}`,
          `💸 Fee      : ${fmt(fee)}`,
          `🆔 TxnID    : ${txn}`,
          `🗓 Date     : ${nowStr()}`,
          `💳 Balance  : ${fmt(db[uid].balance)}`
        ], pin);

        await message.reply(receiptText);
        logEvent(`${uid} recharged mobile ${mobile}, txn: ${txn}`);
        return;
      }

      if (option === "4" || option === "balance") {
        const receiptText = receiptBox("💰 Your Balance", [
          `💵 Cash : ${fmt(db[uid].balance)}`,
          `🏦 Bank : ${fmt(db[uid].bank)}`
        ], pin);
        await message.reply(receiptText);
        logEvent(`${uid} checked balance`);
        return;
      }

      if (option === "5" || option === "deposit") {
        const amount = Number(tokens[3]);
        if (!amount || isNaN(amount) || amount <= 0) {
          await message.reply("❌ Invalid amount.");
          logEvent(`${uid} invalid amount for bank deposit`);
          return;
        }
        if (userObj.balance < amount) {
          await message.reply("❌ Insufficient cash to deposit.");
          logEvent(`${uid} insufficient cash for deposit`);
          return;
        }
        db[uid].balance -= amount;
        db[uid].bank += amount;
        writeAll(db);
        const txn = makeTxnId();
        pushHistory(uid, `Deposited ${fmt(amount)} to bank Txn:${txn}`);

        const receiptText = receiptBox("🏦 Bank Deposit Successful ✅", [
          `💵 Amount : ${fmt(amount)}`,
          `💳 Cash   : ${fmt(db[uid].balance)}`,
          `🏦 Bank   : ${fmt(db[uid].bank)}`,
          `🆔 TxnID  : ${txn}`,
          `🗓 Date   : ${nowStr()}`
        ], pin);

        await message.reply(receiptText);
        logEvent(`${uid} deposited to bank, txn: ${txn}`);
        return;
      }

      if (option === "6" || option === "withdraw") {
        const amount = Number(tokens[3]);
        if (!amount || isNaN(amount) || amount <= 0) {
          await message.reply("❌ Invalid amount.");
          logEvent(`${uid} invalid amount for bank withdraw`);
          return;
        }
        if (userObj.bank < amount) {
          await message.reply("❌ Insufficient bank balance.");
          logEvent(`${uid} insufficient bank balance`);
          return;
        }
        db[uid].bank -= amount;
        db[uid].balance += amount;
        writeAll(db);
        const txn = makeTxnId();
        pushHistory(uid, `Withdrew ${fmt(amount)} from bank Txn:${txn}`);

        const receiptText = receiptBox("🏦 Bank Withdraw Successful ✅", [
          `💵 Amount : ${fmt(amount)}`,
          `💳 Cash   : ${fmt(db[uid].balance)}`,
          `🏦 Bank   : ${fmt(db[uid].bank)}`,
          `🆔 TxnID  : ${txn}`,
          `🗓 Date   : ${nowStr()}`
        ], pin);

        await message.reply(receiptText);
        logEvent(`${uid} withdrew from bank, txn: ${txn}`);
        return;
      }

      if (option === "7" || option === "reset") {
        const newPin = tokens[3];
        if (!newPin || !/^d{4}$/.test(newPin)) {
          await message.reply("❌ New PIN must be 4 digits.");
          logEvent(`${uid} invalid PIN reset attempt`);
          return;
        }
        await setPIN(uid, newPin);
        await message.reply("✅ PIN reset successful. Use new PIN.");
        logEvent(`${uid} reset PIN`);
        return;
      }

      if (option === "history") {
        const hist = (db[uid] && db[uid].history) ? db[uid].history.slice(0, 10).join("
") : "No history available";
        const receiptText = receiptBox("📜 Last Transactions", [hist], pin);
        await message.reply(receiptText);
        logEvent(`${uid} viewed history`);
        return;
      }

      if (option === "admin" && uid === OWNER_UID) {
        const totalUsers = Object.keys(db).length;
        const totalBalance = Object.values(db).reduce((a,u) => a + (u.balance||0) + (u.bank||0), 0);
        await message.reply(`👑 Admin Info
Users: ${totalUsers}
Total Balance: ${fmt(totalBalance)}`);
        logEvent(`${uid} viewed admin info`);
        return;
      }

      // Default invalid option
      await message.reply("❌ Invalid option. Use: 1-send,2-cash,3-recharge,4-balance,5-deposit,6-withdraw,7-reset or history");
      logEvent(`${uid} sent invalid option: ${option}`);

    } catch (e) {
      logEvent("Error: " + e.message);
      try {
        await message.reply("❌ An error occurred. Please try again later.");
      } catch (err) {
        logEvent("Fallback message failed: " + err.message);
      }
    }
  }
};

// Receipt helper
function receiptBox(title, lines = [], pin = "<PIN>") {
  const safeLines = Array.isArray(lines) ? lines.filter(l=> l && String(l).trim().length > 0) : [];
  if (safeLines.length === 0) safeLines.push("No details available");
  const lineSep = "──────────────────────────";
  return [title, lineSep, ...safeLines, lineSep, `Back to menu: .bkash ${pin}`].join("
");
}
