// bKash_full_final.js
// Final offline bKash simulator (Goat Bot v2 compatible)
// Features: PIN hashing (bcrypt), safe replies, chunking, receipts (real style), min/max transfer rule
// npm install bcrypt

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

// --------------- Config ---------------
const DATA_FILE = path.join(__dirname, "bKashData.json");
const BACKUP_FILE = path.join(__dirname, "bKashData_backup.json");
const OWNER_UID = "100089926788317";
const OWNER_NAME = "Imran";

const FEE_PERCENT = 1.5; // fee percentage
const MIN_FEE = 2;
const MAX_FEE = 100;
const MIN_TRANSFER = 1.00;
const MAX_TRANSFER = 30000.00;

const CACHE_SAVE_INTERVAL = 1000 * 60 * 5; // 5 minutes
const BACKUP_INTERVAL = 1000 * 60 * 60; // 1 hour
const CHUNK_MAX = 1800; // safe messenger chunk
const CHUNK_DELAY_MS = 600; // ms between chunks

// --------------- Persistence & Cache ---------------
let dbCache = null;
let lastSave = 0;

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2), "utf8");
}
ensureDataFile();

function readAll() {
  if (!dbCache) {
    try {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      dbCache = raw ? JSON.parse(raw) : {};
      console.log("[bkash] Data loaded.");
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
      const tmp = DATA_FILE + ".tmp";
      fs.writeFileSync(tmp, JSON.stringify(dbCache, null, 2), "utf8");
      fs.renameSync(tmp, DATA_FILE);
      lastSave = now;
      console.log("[bkash] Auto-saved.");
    } catch (e) {
      console.error("[bkash] writeAll error:", e);
    }
  }
}
function writeAllImmediate(obj) {
  dbCache = obj;
  try {
    const tmp = DATA_FILE + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(dbCache, null, 2), "utf8");
    fs.renameSync(tmp, DATA_FILE);
    lastSave = Date.now();
    console.log("[bkash] Immediate save done.");
  } catch (e) {
    console.error("[bkash] writeAllImmediate error:", e);
  }
}

// hourly backup
setInterval(() => {
  try {
    if (fs.existsSync(DATA_FILE)) fs.copyFileSync(DATA_FILE, BACKUP_FILE);
    console.log("[bkash] Hourly backup saved.");
  } catch (e) {
    console.error("[bkash] backup error:", e);
  }
}, BACKUP_INTERVAL);

// final save on exit
process.on("exit", () => {
  try {
    if (dbCache) {
      const tmp = DATA_FILE + ".tmp";
      fs.writeFileSync(tmp, JSON.stringify(dbCache, null, 2), "utf8");
      fs.renameSync(tmp, DATA_FILE);
      console.log("[bkash] Final save on exit.");
    }
  } catch (e) {
    console.error("[bkash] exit save error:", e);
  }
});

// --------------- Utilities ---------------
function computeFee(amount) {
  const raw = Math.ceil((amount * FEE_PERCENT) / 100);
  return Math.max(MIN_FEE, Math.min(MAX_FEE, raw));
}
function nowStr() {
  return new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
function fmt(n) { return `${Number(n).toLocaleString(undefined, {maximumFractionDigits:2})} BDT`; }
function makeTxnId() { return "TXN" + Math.random().toString(36).substring(2, 10).toUpperCase(); }

// --------------- PIN & User helpers ---------------
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

function ensureUser(uid, name = `User_${uid}`) {
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

// --------------- Safe Reply Chunks (prevent blank & long messages) ---------------
function chunkString(str, len = CHUNK_MAX) {
  const out = [];
  for (let i = 0; i < str.length; i += len) out.push(str.substring(i, i + len));
  return out;
}
async function safeReplyChunks(messageObj, text) {
  const base = String(text || "Transaction completed.");
  const parts = chunkString(base, CHUNK_MAX);
  for (const p of parts) {
    try {
      await messageObj.reply(p);
      await new Promise(r => setTimeout(r, CHUNK_DELAY_MS));
    } catch (e) {
      console.error("[bkash] reply chunk failed:", e);
      try { await messageObj.reply("⚠️ Message send failed, but transaction is recorded."); } catch (e2) { console.error("fallback failed:", e2); }
    }
  }
}

// --------------- Receipt formatting (real-style, no emoji) ---------------
function makeReceipt(details, balanceAfter) {
  // details: { to, amount, charge, type, txnId, timeStr, accountName (optional), bankBalance (optional) }
  const lines = [];
  lines.push("bKash");
  lines.push("Transaction Successful");
  lines.push("");
  if (details.accountName) {
    // bank deposit/withdraw style
    if (details.type === "Bank Deposit") {
      lines.push(`Account: ${details.accountName}`);
      lines.push(`Amount Deposited: ${details.amount.toFixed(2)} BDT`);
    } else if (details.type === "Bank Withdraw") {
      lines.push(`Account: ${details.accountName}`);
      lines.push(`Amount Withdrawn: ${details.amount.toFixed(2)} BDT`);
    } else {
      lines.push(`Account: ${details.accountName}`);
      lines.push(`Amount: ${details.amount.toFixed(2)} BDT`);
    }
  } else {
    lines.push(`To: ${details.to}`);
    lines.push(`Amount: ${details.amount.toFixed(2)} BDT`);
  }
  if (details.charge !== undefined) lines.push(`Charge: ${details.charge.toFixed(2)} BDT`);
  lines.push(`Reference: ${details.type}`);
  lines.push(`Transaction ID: ${details.txnId}`);
  lines.push(`Time: ${details.timeStr}`);
  if (balanceAfter !== undefined) lines.push(`Available Balance: ${Number(balanceAfter).toFixed(2)} BDT`);
  if (details.bankBalance !== undefined) {
    lines.push(`Bank Balance: ${Number(details.bankBalance).toFixed(2)} BDT`);
  }
  return lines.join("\n");
}

// --------------- Module export (Goat Bot V2 style) ---------------
module.exports = {
  config: {
    name: "bk",
    version: "7.1",
    author: "Imran",
    shortDescription: "Offline bKash simulator (real receipt, safe replies)",
    longDescription: "Send/CashOut/Recharge/Deposit/Withdraw/History/Reset PIN. Use .bkash <PIN> ...",
    category: "💰 Economy"
  },

  onStart: async function ({ message, args, event }) { return; },

  run: async function ({ message, args, event }) {
    if (!message || !event) { console.error("[bkash] missing message/event"); return; }

    const uid = String(event?.senderID || message?.senderID);
    const name = (event?.senderName || message?.senderName) || `User_${uid}`;
    ensureUser(uid, name);
    ensureUser(OWNER_UID, OWNER_NAME);

    const body = (event?.body) || (message?.text || message?.body) || "";
    const tokens = (typeof body === "string" && body.trim().length > 0) ? body.trim().split(/\s+/) : (args || []);

    try {
      // PIN setup if missing: accept .bkash 1234 to set
      if (!hasPIN(uid)) {
        const candidate = tokens[1] || tokens[0];
        if (!candidate || !/^\d{4}$/.test(candidate)) return safeReplyChunks(message, "Please set a 4-digit PIN first: .bkash 1234");
        await setPIN(uid, candidate);
        const d = readAll();
        if (d[uid].balance === 0) { d[uid].balance = 500; writeAllImmediate(d); }
        return safeReplyChunks(message, "PIN set successfully. Use `.bkash <PIN>` to open menu.");
      }

      if (tokens.length < 2) return safeReplyChunks(message, "Provide your 4-digit PIN. Example: .bkash 1234");
      const pin = tokens[1];
      if (!/^\d{4}$/.test(pin)) return safeReplyChunks(message, "PIN must be 4 digits.");
      const okPin = await verifyPIN(uid, pin);
      if (!okPin) return safeReplyChunks(message, "Incorrect PIN.");

      const db = readAll();
      const user = db[uid];

      // show menu if only PIN provided
      if (tokens.length === 2) {
        const lines = [
          "bKash Menu",
          "",
          `User: ${user.name}`,
          `Cash Balance: ${Number(user.balance).toFixed(2)} BDT`,
          `Bank Balance: ${Number(user.bank||0).toFixed(2)} BDT`,
          "",
          "1 Send Money  → .bkash <PIN> 1 <UID> <amt>",
          "2 Cash Out    → .bkash <PIN> 2 <amt>",
          "3 Recharge    → .bkash <PIN> 3 <mobile> <amt>",
          "4 Balance     → .bkash <PIN> 4",
          "5 Deposit     → .bkash <PIN> 5 <amt>",
          "6 Withdraw    → .bkash <PIN> 6 <amt>",
          "7 Reset PIN   → .bkash <PIN> 7 <newPIN>",
          "history       → .bkash <PIN> history",
          uid === OWNER_UID ? "admin         → .bkash <PIN> admin" : ""
        ].filter(Boolean).join("\n");
        return safeReplyChunks(message, lines);
      }

      const option = (tokens[2] || "").toLowerCase();

      // ---------- 1 Send Money ----------
      if (option === "1" || option === "send") {
        const receiver = tokens[3];
        const amountRaw = tokens[4];
        if (!receiver || !amountRaw) return safeReplyChunks(message, "Specify receiver UID and amount. Example: .bkash <PIN> 1 100");
        const amount = Number(amountRaw);
        if (isNaN(amount) || amount <= 0) return safeReplyChunks(message, "Invalid amount.");
        if (amount < MIN_TRANSFER) return safeReplyChunks(message, `Minimum transfer is ${MIN_TRANSFER.toFixed(2)} BDT.`);
        if (amount > MAX_TRANSFER) return safeReplyChunks(message, `Maximum per transfer is ${MAX_TRANSFER.toFixed(2)} BDT.`);
        if (receiver === uid) return safeReplyChunks(message, "You cannot send money to yourself.");

        const fee = computeFee(amount);
        const total = Number((amount + fee).toFixed(2));
        if (user.balance < total) return safeReplyChunks(message, `Insufficient balance. Need ${total.toFixed(2)} BDT (amount + fee).`);

        ensureUser(receiver, `User_${receiver}`);
        db[uid].balance = Number((db[uid].balance - total).toFixed(2));
        db[receiver].balance = Number(((db[receiver].balance || 0) + amount).toFixed(2));
        db[OWNER_UID].balance = Number(((db[OWNER_UID].balance || 0) + fee).toFixed(2));
        writeAllImmediate(db);

        const txnId = makeTxnId();
        pushHistory(uid, `Sent ${amount.toFixed(2)} BDT to ${receiver} (Fee ${fee.toFixed(2)}) Txn:${txnId}`);
        pushHistory(receiver, `Received ${amount.toFixed(2)} BDT from ${uid} Txn:${txnId}`);

        const receipt = makeReceipt({ to: receiver, amount, charge: fee, type: "Send Money", txnId, timeStr: nowStr() }, db[uid].balance);
        return safeReplyChunks(message, receipt);
      }

      // ---------- 2 Cash Out ----------
      if (option === "2" || option === "cash") {
        const amountRaw = tokens[3];
        if (!amountRaw) return safeReplyChunks(message, "Provide amount to cash out. Example: .bkash <PIN> 2 500");
        const amount = Number(amountRaw);
        if (isNaN(amount) || amount <= 0) return safeReplyChunks(message, "Invalid amount.");
        if (amount < MIN_TRANSFER) return safeReplyChunks(message, `Minimum cash out is ${MIN_TRANSFER.toFixed(2)} BDT.`);
        if (amount > MAX_TRANSFER) return safeReplyChunks(message, `Maximum cash out is ${MAX_TRANSFER.toFixed(2)} BDT.`);

        const fee = computeFee(amount);
        const total = Number((amount + fee).toFixed(2));
        if (user.balance < total) return safeReplyChunks(message, "Insufficient balance (fee included).");

        db[uid].balance = Number((db[uid].balance - total).toFixed(2));
        db[OWNER_UID].balance = Number(((db[OWNER_UID].balance || 0) + fee).toFixed(2));
        writeAllImmediate(db);

        const txnId = makeTxnId();
        pushHistory(uid, `Cashed out ${amount.toFixed(2)} BDT (Fee ${fee.toFixed(2)}) Txn:${txnId}`);

        const receipt = makeReceipt({ to: `CASH OUT`, amount, charge: fee, type: "Cash Out", txnId, timeStr: nowStr() }, db[uid].balance);
        return safeReplyChunks(message, receipt);
      }

      // ---------- 3 Recharge ----------
      if (option === "3" || option === "recharge") {
        const mobile = tokens[3];
        const amountRaw = tokens[4];
        if (!mobile || !amountRaw) return safeReplyChunks(message, "Provide mobile and amount. Example: .bkash <PIN> 3 017XXXXXXXX 100");
        const amount = Number(amountRaw);
        if (isNaN(amount) || amount <= 0) return safeReplyChunks(message, "Invalid amount.");
        if (amount < MIN_TRANSFER) return safeReplyChunks(message, `Minimum recharge is ${MIN_TRANSFER.toFixed(2)} BDT.`);
        if (amount > MAX_TRANSFER) return safeReplyChunks(message, `Maximum per recharge is ${MAX_TRANSFER.toFixed(2)} BDT.`);

        const fee = computeFee(amount);
        const total = Number((amount + fee).toFixed(2));
        if (user.balance < total) return safeReplyChunks(message, "Insufficient balance (fee included).");

        db[uid].balance = Number((db[uid].balance - total).toFixed(2));
        db[OWNER_UID].balance = Number(((db[OWNER_UID].balance || 0) + fee).toFixed(2));
        writeAllImmediate(db);

        const txnId = makeTxnId();
        pushHistory(uid, `Recharged ${amount.toFixed(2)} BDT to ${mobile} (Fee ${fee.toFixed(2)}) Txn:${txnId}`);

        const receipt = makeReceipt({ to: mobile, amount, charge: fee, type: "Mobile Recharge", txnId, timeStr: nowStr() }, db[uid].balance);
        return safeReplyChunks(message, receipt);
      }

      // ---------- 4 Balance ----------
      if (option === "4" || option === "balance") {
        const lines = [
          "bKash",
          "Balance Information",
          "",
          `Cash Balance: ${Number(db[uid].balance).toFixed(2)} BDT`,
          `Bank Balance: ${Number(db[uid].bank || 0).toFixed(2)} BDT`,
          `Last Updated: ${nowStr()}`
        ].join("\n");
        return safeReplyChunks(message, lines);
      }

      // ---------- 5 Deposit ----------
      if (option === "5" || option === "deposit") {
        const amountRaw = tokens[3];
        if (!amountRaw) return safeReplyChunks(message, "Provide amount. Example: .bkash <PIN> 5 1000");
        const amount = Number(amountRaw);
        if (isNaN(amount) || amount <= 0) return safeReplyChunks(message, "Invalid amount.");
        if (db[uid].balance < amount) return safeReplyChunks(message, "Insufficient cash to deposit.");

        db[uid].balance = Number((db[uid].balance - amount).toFixed(2));
        db[uid].bank = Number(((db[uid].bank || 0) + amount).toFixed(2));
        writeAllImmediate(db);

        const txnId = makeTxnId();
        pushHistory(uid, `Deposited ${amount.toFixed(2)} BDT to bank Txn:${txnId}`);

        const receipt = makeReceipt({ accountName: db[uid].name, amount, type: "Bank Deposit", txnId, timeStr: nowStr() }, db[uid].balance);
        // include bank balance
        const fullReceipt = receipt + `\nBank Balance: ${Number(db[uid].bank).toFixed(2)} BDT`;
        return safeReplyChunks(message, fullReceipt);
      }

      // ---------- 6 Withdraw ----------
      if (option === "6" || option === "withdraw") {
        const amountRaw = tokens[3];
        if (!amountRaw) return safeReplyChunks(message, "Provide amount. Example: .bkash <PIN> 6 500");
        const amount = Number(amountRaw);
        if (isNaN(amount) || amount <= 0) return safeReplyChunks(message, "Invalid amount.");
        if ((db[uid].bank || 0) < amount) return safeReplyChunks(message, "Insufficient bank balance.");

        db[uid].bank = Number(((db[uid].bank || 0) - amount).toFixed(2));
        db[uid].balance = Number(((db[uid].balance || 0) + amount).toFixed(2));
        writeAllImmediate(db);

        const txnId = makeTxnId();
        pushHistory(uid, `Withdrew ${amount.toFixed(2)} BDT from bank Txn:${txnId}`);

        const receipt = makeReceipt({ accountName: db[uid].name, amount, type: "Bank Withdraw", txnId, timeStr: nowStr() }, db[uid].balance);
        const fullReceipt = receipt + `\nBank Balance: ${Number(db[uid].bank).toFixed(2)} BDT`;
        return safeReplyChunks(message, fullReceipt);
      }

      // ---------- 7 Reset PIN ----------
      if (option === "7" || option === "reset") {
        const newPin = tokens[3];
        if (!newPin || !/^\d{4}$/.test(newPin)) return safeReplyChunks(message, "New PIN must be 4 digits. Example: .bkash <PIN> 7 1234");
        await setPIN(uid, newPin);
        return safeReplyChunks(message, "PIN reset successful. Use new PIN from now on.");
      }

      // ---------- history ----------
      if (option === "history") {
        const hist = (db[uid] && db[uid].history) ? db[uid].history.slice(0, 10).join("\n") : "No history";
        const text = ["bKash", "Recent Transactions", "", hist].join("\n");
        return safeReplyChunks(message, text);
      }

      // ---------- admin ----------
      if (option === "admin" && uid === OWNER_UID) {
        const totalUsers = Object.keys(db).length;
        const totalBalance = Object.values(db).reduce((a, u) => a + (u.balance || 0) + (u.bank || 0), 0);
        const adminText = `Admin Info\nUsers: ${totalUsers}\nTotal Balance: ${Number(totalBalance).toFixed(2)} BDT\nData file: ${DATA_FILE}`;
        return safeReplyChunks(message, adminText);
      }

      // default
      return safeReplyChunks(message, "Invalid option. Use: .bkash <PIN> (see menu).");
    } catch (err) {
      console.error("[bkash] command error:", err);
      return safeReplyChunks(message, "An unexpected error occurred. Try again later.");
    }
  }
};
