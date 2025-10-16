// bkash_v7.js
// bKash-like offline simulator (Goat Bot V2 compatible)
// Features: PIN (bcrypt), cache + auto-save, hourly backup, safe chunked replies, menu pagination, send, cashout, recharge, deposit, withdraw, history, reset pin, admin
// npm install bcrypt fs-extra

const fs = require("fs-extra");
const path = require("path");
const bcrypt = require("bcrypt");

// ---------------- Config ----------------
const DATA_FILE = path.join(__dirname, "bKashData.json");
const BACKUP_FILE = path.join(__dirname, "bKashData_backup.json");
const FEE_PERCENT = 1.5;
const MIN_FEE = 2;
const MAX_FEE = 100;
const OWNER_UID = "100089926788317"; // change if needed
const OWNER_NAME = "Imran";
const CACHE_SAVE_INTERVAL = 1000 * 60 * 5; // 5 minutes
const BACKUP_INTERVAL = 1000 * 60 * 60; // 1 hour
const CHUNK_MAX = 1800; // safe chunk length for messenger
const CHUNK_DELAY_MS = 600; // delay between chunk replies

// ---------------- Cache & Persistence ----------------
let dbCache = null;
let lastSave = 0;

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
  } catch (e) { console.error("ensureDataFile error:", e); }
}
ensureDataFile();

function readAll() {
  if (!dbCache) {
    try {
      dbCache = JSON.parse(fs.readFileSync(DATA_FILE, "utf8") || "{}");
      console.log("[bkash] Cache loaded from file.");
    } catch (e) {
      console.error("[bkash] readAll error:", e);
      dbCache = {};
    }
  }
  return dbCache;
}
function writeAll(obj) {
  dbCache = obj;
  const now = Date.now();
  if (now - lastSave > CACHE_SAVE_INTERVAL) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(dbCache, null, 2), "utf8");
      lastSave = now;
      console.log("[bkash] Cache saved to file.");
    } catch (e) { console.error("[bkash] writeAll error:", e); }
  }
}
// immediate save (call on critical operations if you want)
function writeAllImmediate(obj) {
  dbCache = obj;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dbCache, null, 2), "utf8");
    lastSave = Date.now();
    console.log("[bkash] Immediate save done.");
  } catch (e) { console.error("[bkash] writeAllImmediate error:", e); }
}

// hourly backup
setInterval(() => {
  try {
    if (fs.existsSync(DATA_FILE)) fs.copyFileSync(DATA_FILE, BACKUP_FILE);
    console.log("[bkash] Hourly backup done.");
  } catch (e) { console.error("[bkash] backup error:", e); }
}, BACKUP_INTERVAL);

// final save on exit
process.on("exit", () => {
  try {
    if (dbCache) fs.writeFileSync(DATA_FILE, JSON.stringify(dbCache, null, 2), "utf8");
    console.log("[bkash] Final save on exit.");
  } catch (e) { console.error("[bkash] exit save error:", e); }
});

// ---------------- Utilities ----------------
function computeFee(amount) {
  const raw = Math.ceil((amount * FEE_PERCENT) / 100);
  return Math.max(MIN_FEE, Math.min(MAX_FEE, raw));
}
function nowStr() {
  return new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
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
  writeAllImmediate(db);
}
async function verifyPIN(uid, pin) {
  const db = readAll();
  if (!db[uid] || !db[uid].pinHash) return false;
  try { return await bcrypt.compare(pin, db[uid].pinHash); } catch { return false; }
}
function hasPIN(uid) { const db = readAll(); return !!(db[uid] && db[uid].pinHash); }

// ---------------- User data ----------------
function ensureUser(uid, name = "User") {
  const db = readAll();
  if (!db[uid]) {
    db[uid] = { name, balance: 0, bank: 0, history: [] };
    writeAllImmediate(db);
  }
  return db[uid];
}
function pushHistory(uid, text) {
  const db = readAll();
  if (!db[uid]) db[uid] = { balance: 0, bank: 0, history: [] };
  db[uid].history = db[uid].history || [];
  db[uid].history.unshift(`[${nowStr()}] ${text}`);
  db[uid].history = db[uid].history.slice(0, 50);
  writeAllImmediate(db);
}

// ---------------- Receipt & Message Helpers ----------------
function receiptBox(title, lines = [], pin = "<PIN>") {
  const safeLines = Array.isArray(lines) ? lines.filter(l => l && String(l).trim().length > 0) : [];
  if (safeLines.length === 0) safeLines.push("No details available");
  const sep = "──────────────────────────";
  const content = [title, sep, ...safeLines, sep, `Back to menu: .bkash ${pin}`].join("\n");
  return (content && String(content).trim()) ? content : "✅ Transaction completed";
}
function chunkString(str, len = CHUNK_MAX) {
  const out = [];
  for (let i = 0; i < str.length; i += len) out.push(str.substring(i, i + len));
  return out;
}
async function safeReplyChunks(messageObj, text) {
  const base = String(text || "✅ Transaction completed");
  const parts = chunkString(base, CHUNK_MAX);
  for (const p of parts) {
    try {
      await messageObj.reply(p);
      // small delay to avoid API throttling / sending race
      await new Promise(r => setTimeout(r, CHUNK_DELAY_MS));
    } catch (e) {
      console.error("[bkash] reply chunk failed:", e);
      try { await messageObj.reply("⚠️ Message send failed, but transaction recorded."); } catch (e2) { console.error("fallback reply failed:", e2); }
    }
  }
}

// ---------------- Exposed Command (Goat Bot V2 style) ----------------
module.exports = {
  config: {
    name: "bk",
    version: "7.0",
    author: "Imran",
    shortDescription: "Offline bKash simulator (PIN hashed, cache, safe replies)",
    longDescription: "Send/Receive/CashOut/Recharge/Bank/History/Reset PIN. Use .bkash <PIN> ...",
    category: "💰 Economy"
  },

  onStart: async function ({ message, args, event }) { return; },

  run: async function ({ message, args, event }) {
    if (!message || !event) { console.error("[bkash] Missing message/event"); return; }

    const uid = String(event?.senderID || message?.senderID);
    const name = (event?.senderName || message?.senderName) || `User_${uid}`;
    ensureUser(uid, name);
    ensureUser(OWNER_UID, OWNER_NAME);

    // body parsing: support both ".bkash 1234 1 ..." and ".bkash 1234" etc
    const body = (event?.body) || (message?.text || message?.body) || "";
    const tokens = (typeof body === "string" && body.trim().length > 0) ? body.trim().split(/\s+/) : (args || []);

    try {
      // PIN setup if not set yet (support: .bkash 1234 to set)
      if (!hasPIN(uid)) {
        const candidate = tokens[1] || tokens[0];
        if (!candidate || !/^\d{4}$/.test(candidate)) return safeReplyChunks(message, "🔐 Set a 4-digit PIN first: .bkash 1234");
        await setPIN(uid, candidate);
        const d = readAll();
        if (d[uid].balance === 0) { d[uid].balance = 500; writeAllImmediate(d); } // starter
        return safeReplyChunks(message, "✅ PIN set successfully. Use `.bkash <PIN>` to open menu.");
      }

      if (tokens.length < 2) return safeReplyChunks(message, "🔐 Provide your 4-digit PIN. Example: .bkash 1234");
      const pin = tokens[1];
      if (!/^\d{4}$/.test(pin)) return safeReplyChunks(message, "❌ PIN must be 4 digits.");
      const okPin = await verifyPIN(uid, pin);
      if (!okPin) return safeReplyChunks(message, "❌ Incorrect PIN.");

      const db = readAll();
      const user = db[uid];

      // menu (paginate if many lines). if only pin provided -> show menu
      if (tokens.length === 2) {
        const lines = [
          `💸 bKash Menu — ${user.name}`,
          `💰 Balance: ${fmt(user.balance)}`,
          `🏦 Bank  : ${fmt(user.bank)}`,
          ``,
          `1️⃣ Send Money   → .bkash ${pin} 1 <UID> <amt>`,
          `2️⃣ Cash Out     → .bkash ${pin} 2 <amt>`,
          `3️⃣ Recharge     → .bkash ${pin} 3 <mobile> <amt>`,
          `4️⃣ Balance      → .bkash ${pin} 4`,
          `5️⃣ Bank Deposit → .bkash ${pin} 5 <amt>`,
          `6️⃣ Bank Withdraw→ .bkash ${pin} 6 <amt>`,
          `7️⃣ Reset PIN    → .bkash ${pin} 7 <newPIN>`,
          `📜 History      → .bkash ${pin} history`,
          uid === OWNER_UID ? `👑 Admin        → .bkash ${pin} admin` : ""
        ].filter(Boolean);
        // send menu in one or two parts
        const mid = Math.ceil(lines.length / 2);
        await safeReplyChunks(message, lines.slice(0, mid).join("\n"));
        if (mid < lines.length) await safeReplyChunks(message, lines.slice(mid).join("\n"));
        return;
      }

      const option = (tokens[2] || "").toLowerCase();

      // --- 1 Send Money ---
      if (option === "1" || option === "send") {
        const receiver = tokens[3];
        const amount = Number(tokens[4]);
        if (!receiver) return safeReplyChunks(message, "❌ Specify receiver UID. Example: .bkash <PIN> 1 <UID> <amt>");
        if (!amount || isNaN(amount) || amount <= 0) return safeReplyChunks(message, "❌ Invalid amount.");
        if (receiver === uid) return safeReplyChunks(message, "❌ You cannot send money to yourself.");
        const fee = computeFee(amount), total = amount + fee;
        if (user.balance < total) return safeReplyChunks(message, `❌ Not enough balance (need ${fmt(total)})`);

        ensureUser(receiver, `User_${receiver}`);
        db[uid].balance -= total;
        db[receiver].balance = (db[receiver].balance || 0) + amount;
        db[OWNER_UID].balance = (db[OWNER_UID].balance || 0) + fee;
        writeAllImmediate(db);

        const txn = makeTxnId();
        pushHistory(uid, `Sent ${fmt(amount)} to ${receiver} (Fee ${fmt(fee)}) Txn:${txn}`);
        pushHistory(receiver, `Received ${fmt(amount)} from ${uid} Txn:${txn}`);

        const text = receiptBox("📱 Send Money Successful ✅", [
          `💳 Sender   : ${user.name} (${uid})`,
          `👤 Receiver : ${receiver}`,
          `💰 Amount   : ${fmt(amount)}`,
          `💸 Fee      : ${fmt(fee)}`,
          `🆔 TxnID    : ${txn}`,
          `🗓 Date     : ${nowStr()}`
        ], pin);
        return safeReplyChunks(message, text);
      }

      // --- 2 Cash Out ---
      if (option === "2" || option === "cash") {
        const amount = Number(tokens[3]);
        if (!amount || isNaN(amount) || amount <= 0) return safeReplyChunks(message, "❌ Invalid amount");
        const fee = computeFee(amount), total = amount + fee;
        if (user.balance < total) return safeReplyChunks(message, "❌ Insufficient balance (fee included)");

        db[uid].balance -= total;
        db[OWNER_UID].balance = (db[OWNER_UID].balance || 0) + total;
        writeAllImmediate(db);

        const txn = makeTxnId();
        pushHistory(uid, `Cashed out ${fmt(amount)} (Fee ${fmt(fee)}) Txn:${txn}`);

        const text = receiptBox("💵 Cash Out Successful ✅", [
          `💰 Amount   : ${fmt(amount)}`,
          `💸 Fee      : ${fmt(fee)}`,
          `🆔 TxnID    : ${txn}`,
          `🗓 Date     : ${nowStr()}`,
          `💳 Balance  : ${fmt(db[uid].balance)}`
        ], pin);

        return safeReplyChunks(message, text);
      }

      // --- 3 Recharge ---
      if (option === "3" || option === "recharge") {
        const mobile = tokens[3];
        const amount = Number(tokens[4]);
        if (!mobile) return safeReplyChunks(message, "❌ Provide mobile number");
        if (!amount || isNaN(amount) || amount <= 0) return safeReplyChunks(message, "❌ Invalid amount");
        const fee = computeFee(amount), total = amount + fee;
        if (user.balance < total) return safeReplyChunks(message, "❌ Insufficient balance (fee included)");

        db[uid].balance -= total;
        db[OWNER_UID].balance = (db[OWNER_UID].balance || 0) + fee; // keep fee to owner (only fee, not total)
        writeAllImmediate(db);

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

        return safeReplyChunks(message, text);
      }

      // --- 4 Balance ---
      if (option === "4" || option === "balance") {
        const text = receiptBox("💰 Your Balance", [
          `💵 Cash : ${fmt(db[uid].balance)}`,
          `🏦 Bank : ${fmt(db[uid].bank)}`
        ], pin);
        return safeReplyChunks(message, text);
      }

      // --- 5 Bank Deposit ---
      if (option === "5" || option === "deposit") {
        const amount = Number(tokens[3]);
        if (!amount || isNaN(amount) || amount <= 0) return safeReplyChunks(message, "❌ Invalid amount");
        if (user.balance < amount) return safeReplyChunks(message, "❌ Insufficient cash to deposit");

        db[uid].balance -= amount; db[uid].bank += amount;
        writeAllImmediate(db);
        const txn = makeTxnId();
        pushHistory(uid, `Deposited ${fmt(amount)} to bank Txn:${txn}`);

        const text = receiptBox("🏦 Bank Deposit Successful ✅", [
          `💵 Amount : ${fmt(amount)}`,
          `💳 Cash   : ${fmt(db[uid].balance)}`,
          `🏦 Bank   : ${fmt(db[uid].bank)}`,
          `🆔 TxnID  : ${txn}`,
          `🗓 Date   : ${nowStr()}`
        ], pin);

        return safeReplyChunks(message, text);
      }

      // --- 6 Bank Withdraw ---
      if (option === "6" || option === "withdraw") {
        const amount = Number(tokens[3]);
        if (!amount || isNaN(amount) || amount <= 0) return safeReplyChunks(message, "❌ Invalid amount");
        if (user.bank < amount) return safeReplyChunks(message, "❌ Insufficient bank balance");

        db[uid].bank -= amount; db[uid].balance += amount;
        writeAllImmediate(db);
        const txn = makeTxnId();
        pushHistory(uid, `Withdrew ${fmt(amount)} from bank Txn:${txn}`);

        const text = receiptBox("🏦 Bank Withdraw Successful ✅", [
          `💵 Amount : ${fmt(amount)}`,
          `💳 Cash   : ${fmt(db[uid].balance)}`,
          `🏦 Bank   : ${fmt(db[uid].bank)}`,
          `🆔 TxnID  : ${txn}`,
          `🗓 Date   : ${nowStr()}`
        ], pin);

        return safeReplyChunks(message, text);
      }

      // --- 7 Reset PIN (while logged in) ---
      if (option === "7" || option === "reset") {
        const newPin = tokens[3];
        if (!newPin || !/^\d{4}$/.test(newPin)) return safeReplyChunks(message, "❌ New PIN must be 4 digits");
        await setPIN(uid, newPin);
        return safeReplyChunks(message, "✅ PIN reset successful. Use new PIN.");
      }

      // --- history ---
      if (option === "history") {
        const hist = (db[uid] && db[uid].history) ? db[uid].history.slice(0, 10).join("\n") : "No history";
        const text = receiptBox("📜 Last Transactions", [hist], pin);
        return safeReplyChunks(message, text);
      }

      // --- admin (owner only) ---
      if (option === "admin" && uid === OWNER_UID) {
        const totalUsers = Object.keys(db).length;
        const totalBalance = Object.values(db).reduce((a, u) => a + (u.balance || 0) + (u.bank || 0), 0);
        const adminText = `👑 Admin Info\nUsers: ${totalUsers}\nTotal Balance: ${fmt(totalBalance)}\nData file: ${DATA_FILE}`;
        return safeReplyChunks(message, adminText);
      }

      // default invalid
      return safeReplyChunks(message, "❌ Invalid option. Use the menu: `.bkash <PIN>` then choose commands.");

    } catch (err) {
      console.error("[bkash] Command error:", err);
      return safeReplyChunks(message, "❌ An unexpected error occurred. Try again later.");
    }
  }
};
