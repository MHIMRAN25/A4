// bkash_goat_final_safe_fixed.js
// Offline bKash-like command (file-based persistence, PIN hashed)
// Styled receipts, menu, emoji, Goat Bot v2 style
// npm install bcrypt

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

// ---------------- Config ----------------
const DATA_FILE = path.join(__dirname, "bKashData.json");
const FEE_PERCENT = 1.5;
const MIN_FEE = 2;
const MAX_FEE = 100;
const OWNER_UID = "100089926788317"; // Owner UID
const OWNER_NAME = "Imran";

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2), "utf8");

// ---------------- Utilities ----------------
function readAll() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8") || "{}"); }
  catch (err) { console.error("readAll error:", err); return {}; }
}
function writeAll(obj) {
  const tmp = DATA_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2), "utf8");
  fs.renameSync(tmp, DATA_FILE);
}
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

// ---------------- PIN ----------------
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
function hasPIN(uid) { const db = readAll(); return !!(db[uid] && db[uid].pinHash); }

// ---------------- User data ----------------
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

// ---------------- Receipt helpers ----------------
function receiptBox(title, lines = [], pin = "<PIN>") {
  // ensure lines is array of non-empty strings
  const safeLines = Array.isArray(lines) ? lines.filter(l => l && String(l).trim().length > 0) : [];
  if (safeLines.length === 0) safeLines.push("No details available");
  const lineSep = "──────────────────────────";
  const content = [title, lineSep, ...safeLines, lineSep, `Back to menu: .bkash ${pin}`].join("\n");
  // always return visible fallback (emoji) if for some reason content is empty
  return String(content).trim() || "✅ Transaction completed";
}

// ---------------- Command ----------------
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
    // Defensive: check message object
    if (!message || !event) {
      console.error("Missing message/event object");
      return;
    }

    const uid = String(event?.senderID || message?.senderID);
    const name = (event?.senderName || message?.senderName) || `User_${uid}`;
    ensureUser(uid, name);

    const body = (event?.body) || (message?.text || message?.body) || "";
    const tokens = (typeof body === "string" && body.trim().length > 0) ? body.trim().split(/\s+/) : (args || []);

    try {
      // PIN setup
      if (!hasPIN(uid)) {
        const pinCandidate = tokens[1] || tokens[0];
        if (!pinCandidate || !/^\d{4}$/.test(pinCandidate)) {
          return await message.reply(String("🔐 Set a 4-digit PIN first: .bkash 1234"));
        }
        await setPIN(uid, pinCandidate);
        const d = readAll();
        if (d[uid].balance === 0) { d[uid].balance = 500; writeAll(d); } // starter balance
        return await message.reply(String("✅ PIN set successfully. Now use `.bkash <PIN>` to open menu."));
      }

      if (tokens.length < 2) return await message.reply(String("🔐 Provide your 4-digit PIN. Example: .bkash 1234"));
      const pin = tokens[1];
      if (!/^\d{4}$/.test(pin)) return await message.reply(String("❌ PIN must be 4 digits."));
      const okPin = await verifyPIN(uid, pin);
      if (!okPin) return await message.reply(String("❌ Incorrect PIN."));

      const db = readAll();
      const userObj = db[uid];

      // Initialize owner account if missing
      ensureUser(OWNER_UID, OWNER_NAME);

      // Menu
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
          `📜 History      → .bkash ${pin} history`
        ].join("\n");
        return await message.reply(String(menu));
      }

      const option = tokens[2]?.toLowerCase() || "";

      // --- Send Money ---
      if (option === "1" || option === "send") {
        const receiver = tokens[3];
        const amount = Number(tokens[4]);
        if (!receiver) return await message.reply(String("❌ Specify receiver UID. Example: .bkash <PIN> 1 <UID> <amt>"));
        if (!amount || isNaN(amount) || amount <= 0) return await message.reply(String("❌ Invalid amount."));
        const fee = computeFee(amount); const total = amount + fee;
        if (userObj.balance < total) return await message.reply(String(`❌ Not enough balance to cover fee: ${fmt(total)}`));

        ensureUser(receiver, `User_${receiver}`);
        db[uid].balance -= total;
        db[receiver].balance = (db[receiver].balance || 0) + amount;
        db[OWNER_UID].balance = (db[OWNER_UID].balance || 0) + fee;
        writeAll(db);

        const txn = makeTxnId();
        pushHistory(uid, `Sent ${fmt(amount)} to ${receiver} (Fee ${fmt(fee)}) Txn:${txn}`);
        pushHistory(receiver, `Received ${fmt(amount)} from ${uid} Txn:${txn}`);

        const text = receiptBox("📱 Send Money Successful ✅", [
          `💳 Sender   : ${userObj.name} (${uid})`,
          `👤 Receiver : ${receiver}`,
          `💰 Amount   : ${fmt(amount)}`,
          `💸 Fee      : ${fmt(fee)}`,
          `🆔 TxnID    : ${txn}`,
          `🗓 Date     : ${nowStr()}`
        ], pin);

        console.log("DEBUG: send receipt length =", text.length);
        return await message.reply(String(text));
      }

      // --- Cash Out ---
      if (option === "2" || option === "cash") {
        const amount = Number(tokens[3]);
        if (!amount || isNaN(amount) || amount <= 0) return await message.reply(String("❌ Invalid amount"));
        const fee = computeFee(amount); const total = amount + fee;
        if (userObj.balance < total) return await message.reply(String("❌ Insufficient balance (fee included)"));
        db[uid].balance -= total;
        db[OWNER_UID].balance = (db[OWNER_UID].balance || 0) + total;
        writeAll(db);

        const txn = makeTxnId();
        pushHistory(uid, `Cashed out ${fmt(amount)} (Fee ${fmt(fee)}) Txn:${txn}`);

        const text = receiptBox("💵 Cash Out Successful ✅", [
          `💰 Amount   : ${fmt(amount)}`,
          `💸 Fee      : ${fmt(fee)}`,
          `🆔 TxnID    : ${txn}`,
          `🗓 Date     : ${nowStr()}`,
          `💳 Balance  : ${fmt(db[uid].balance)}`
        ], pin);

        console.log("DEBUG: cash receipt length =", text.length);
        return await message.reply(String(text));
      }

      // --- Mobile Recharge ---
      if (option === "3" || option === "recharge") {
        const mobile = tokens[3];
        const amount = Number(tokens[4]);
        if (!mobile) return await message.reply(String("❌ Provide mobile number"));
        if (!amount || isNaN(amount) || amount <= 0) return await message.reply(String("❌ Invalid amount"));
        const fee = computeFee(amount); const total = amount + fee;
        if (userObj.balance < total) return await message.reply(String("❌ Insufficient balance (fee included)"));
        db[uid].balance -= total;
        db[OWNER_UID].balance = (db[OWNER_UID].balance || 0) + total;
        writeAll(db);

        const txn = makeTxnId();
        pushHistory(uid, `Mobile recharge ${mobile} ${fmt(amount)} (Fee ${fmt(fee)}) Txn:${txn}`);

        const text = receiptBox("📱 Mobile Recharge Successful ✅", [
          `📱 Mobile   : ${mobile}`,
          `💰 Amount   : ${fmt(amount)}`,
          `💸 Fee      : ${fmt(fee)}`,
          `🆔 TxnID    : ${txn}`,
          `🗓 Date     : ${nowStr()}`,
          `💳 Balance  : ${fmt(db[uid].balance)}`
        ], pin);

        console.log("DEBUG: recharge receipt length =", text.length);
        return await message.reply(String(text));
      }

      // --- Balance ---
      if (option === "4" || option === "balance") {
        const text = receiptBox("💰 Your Balance", [
          `💵 Cash : ${fmt(db[uid].balance)}`,
          `🏦 Bank : ${fmt(db[uid].bank)}`
        ], pin);
        return await message.reply(String(text));
      }

      // --- Bank Deposit ---
      if (option === "5" || option === "deposit") {
        const amount = Number(tokens[3]);
        if (!amount || isNaN(amount) || amount <= 0) return await message.reply(String("❌ Invalid amount"));
        if (userObj.balance < amount) return await message.reply(String("❌ Insufficient cash to deposit"));
        db[uid].balance -= amount; db[uid].bank += amount; writeAll(db);
        const txn = makeTxnId(); pushHistory(uid, `Deposited ${fmt(amount)} to bank Txn:${txn}`);
        const text = receiptBox("🏦 Bank Deposit Successful ✅", [
          `💵 Amount : ${fmt(amount)}`,
          `💳 Cash   : ${fmt(db[uid].balance)}`,
          `🏦 Bank   : ${fmt(db[uid].bank)}`,
          `🆔 TxnID  : ${txn}`,
          `🗓 Date   : ${nowStr()}`
        ], pin);
        return await message.reply(String(text));
      }

      // --- Bank Withdraw ---
      if (option === "6" || option === "withdraw") {
        const amount = Number(tokens[3]);
        if (!amount || isNaN(amount) || amount <= 0) return await message.reply(String("❌ Invalid amount"));
        if (userObj.bank < amount) return await message.reply(String("❌ Insufficient bank balance"));
        db[uid].bank -= amount; db[uid].balance += amount; writeAll(db);
        const txn = makeTxnId(); pushHistory(uid, `Withdrew ${fmt(amount)} from bank Txn:${txn}`);
        const text = receiptBox("🏦 Bank Withdraw Successful ✅", [
          `💵 Amount : ${fmt(amount)}`,
          `💳 Cash   : ${fmt(db[uid].balance)}`,
          `🏦 Bank   : ${fmt(db[uid].bank)}`,
          `🆔 TxnID  : ${txn}`,
          `🗓 Date   : ${nowStr()}`
        ], pin);
        return await message.reply(String(text));
      }

      // --- Reset PIN ---
      if (option === "7" || option === "reset") {
        const newPin = tokens[3];
        if (!newPin || !/^\d{4}$/.test(newPin)) return await message.reply(String("❌ New PIN must be 4 digits"));
        await setPIN(uid, newPin);
        return await message.reply(String("✅ PIN reset successful. Use new PIN."));
      }

      // --- History ---
      if (option === "history") {
        const hist = (db[uid] && db[uid].history) ? db[uid].history.slice(0, 10).join("\n") : "No history";
        const text = receiptBox("📜 Last Transactions", [hist], pin);
        return await message.reply(String(text));
      }

      // default
      return await message.reply(String("❌ Invalid option. Use: 1-send,2-cash,3-recharge,4-balance,5-deposit,6-withdraw,7-reset or history"));
    } catch (e) {
      console.error("bkash command error:", e);
      // send a visible error message to user (avoid empty reply)
      try {
        return await message.reply(String("❌ An error occurred. Please try again later."));
      } catch (err) {
        console.error("Failed to send fallback error message:", err);
      }
    }
  }
};
