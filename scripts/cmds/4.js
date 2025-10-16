// ===============================
// 🔐 bKash Offline System (Final Safe Version)
// Author: Imran | GoatBot v2 Style
// Version: 2.0-final
// Description: Offline bKash simulator with safeReply, persistent balance, and styled receipts.
// ===============================

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const DATA_FILE = path.join(__dirname, "bKashData.json");
const OWNER_UID = "100089926788317";
const OWNER_NAME = "Imran";

// --- Ensure data file exists
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));

// --- Utility functions
const readAll = () => {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};
const writeAll = (obj) => {
  const tmp = DATA_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2));
  fs.renameSync(tmp, DATA_FILE);
};
const computeFee = (amt) => Math.max(2, Math.min(100, Math.ceil((amt * 1.5) / 100)));
const fmt = (n) => `${Number(n).toLocaleString()} BDT`;
const nowStr = () => new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
const txn = () => Math.random().toString(36).substring(2, 10).toUpperCase();

function safeReply(message, text) {
  const content = (text && text.trim().length > 0) ? text : "✅ Transaction completed successfully.";
  return message.reply(String(content)).catch(e => console.log("safeReply error:", e));
}

// --- PIN handling
async function setPIN(uid, pin) {
  const db = readAll();
  const hash = await bcrypt.hash(pin, 10);
  db[uid] = db[uid] || { balance: 500, bank: 0, history: [] };
  db[uid].pin = hash;
  writeAll(db);
}
async function verifyPIN(uid, pin) {
  const db = readAll();
  if (!db[uid] || !db[uid].pin) return false;
  return bcrypt.compare(pin, db[uid].pin);
}
const hasPIN = (uid) => !!(readAll()[uid]?.pin);

function ensureUser(uid, name) {
  const db = readAll();
  if (!db[uid]) {
    db[uid] = { name, balance: 500, bank: 0, history: [] };
    writeAll(db);
  }
  return db[uid];
}
function addHistory(uid, text) {
  const db = readAll();
  db[uid].history.unshift(`[${nowStr()}] ${text}`);
  db[uid].history = db[uid].history.slice(0, 10);
  writeAll(db);
}
function receipt(title, lines, pin) {
  return [
    `📱 ${title}`,
    "──────────────────────────",
    ...lines,
    "──────────────────────────",
    `🔐 Back: .bkash ${pin}`
  ].join("\n");
}

// --- MAIN COMMAND ---
module.exports = {
  config: {
    name: "bk",
    version: "2.0-final",
    author: "Imran | GoatBot v2 Style",
    category: "💰 Economy",
    shortDescription: "Offline bKash simulator",
    longDescription: "Set PIN, Send Money, Cash Out, Recharge, Bank Deposit/Withdraw, Balance, History — all offline and safe.",
    guide: {
      en: "{p}bkash 1234\n{p}bkash <PIN> 1 <UID> <amount>\n{p}bkash <PIN> 2 <amount>\n{p}bkash <PIN> 3 <mobile> <amount>\n{p}bkash <PIN> history"
    }
  },

  onStart: async function () {},

  run: async function ({ message, args, event }) {
    try {
      const uid = String(event.senderID);
      const name = event.senderName || `User_${uid}`;
      ensureUser(uid, name);

      const body = event.body || "";
      const tokens = body.trim().split(/\s+/);

      // 1️⃣ Set PIN if not exists
      if (!hasPIN(uid)) {
        const newPin = tokens[1];
        if (!newPin || !/^\d{4}$/.test(newPin))
          return safeReply(message, "🔐 প্রথমে ৪ সংখ্যার PIN সেট করুন: .bkash 1234");
        await setPIN(uid, newPin);
        return safeReply(message, "✅ PIN সফলভাবে সেট হয়েছে! এখন .bkash <PIN> লিখে মেনু খুলুন।");
      }

      if (tokens.length < 2) return safeReply(message, "🔐 আপনার PIN দিন। উদাহরণ: .bkash 1234");

      const pin = tokens[1];
      if (!/^\d{4}$/.test(pin)) return safeReply(message, "❌ PIN অবশ্যই ৪ সংখ্যার হতে হবে।");
      const ok = await verifyPIN(uid, pin);
      if (!ok) return safeReply(message, "❌ ভুল PIN দিয়েছেন।");

      const db = readAll();
      const user = db[uid];

      // 🏠 Menu
      if (tokens.length === 2) {
        const menu = [
          `💸 bKash Menu — ${user.name}`,
          `💰 Balance: ${fmt(user.balance)}`,
          `🏦 Bank: ${fmt(user.bank)}`,
          "",
          `1️⃣ Send Money   → .bkash ${pin} 1 <UID> <amt>`,
          `2️⃣ Cash Out     → .bkash ${pin} 2 <amt>`,
          `3️⃣ Recharge     → .bkash ${pin} 3 <mobile> <amt>`,
          `4️⃣ Balance      → .bkash ${pin} 4`,
          `5️⃣ Bank Deposit → .bkash ${pin} 5 <amt>`,
          `6️⃣ Withdraw     → .bkash ${pin} 6 <amt>`,
          `7️⃣ Reset PIN    → .bkash ${pin} 7 <newPIN>`,
          `📜 History      → .bkash ${pin} history`
        ].join("\n");
        return safeReply(message, menu);
      }

      const opt = tokens[2]?.toLowerCase();

      // --- Send Money ---
      if (opt === "1" || opt === "send") {
        const recv = tokens[3];
        const amt = Number(tokens[4]);
        if (!recv || !amt) return safeReply(message, "❌ রিসিভার UID এবং Amount দিন।");
        const fee = computeFee(amt), total = amt + fee;
        if (user.balance < total) return safeReply(message, "❌ পর্যাপ্ত ব্যালেন্স নেই।");

        ensureUser(recv, `User_${recv}`);
        db[uid].balance -= total;
        db[recv].balance += amt;
        db[OWNER_UID].balance += fee;
        writeAll(db);

        const tid = txn();
        addHistory(uid, `Sent ${fmt(amt)} to ${recv} Fee:${fmt(fee)} Txn:${tid}`);
        addHistory(recv, `Received ${fmt(amt)} from ${uid} Txn:${tid}`);
        return safeReply(message, receipt("💸 Send Money Successful ✅", [
          `👤 To: ${recv}`, `💰 Amount: ${fmt(amt)}`, `💸 Fee: ${fmt(fee)}`,
          `🆔 TxnID: ${tid}`, `🕓 ${nowStr()}`
        ], pin));
      }

      // --- Cash Out ---
      if (opt === "2" || opt === "cash") {
        const amt = Number(tokens[3]);
        if (!amt || amt <= 0) return safeReply(message, "❌ Invalid amount");
        const fee = computeFee(amt), total = amt + fee;
        if (user.balance < total) return safeReply(message, "❌ পর্যাপ্ত ব্যালেন্স নেই।");
        db[uid].balance -= total; db[OWNER_UID].balance += fee; writeAll(db);
        const tid = txn();
        addHistory(uid, `Cash Out ${fmt(amt)} Fee:${fmt(fee)} Txn:${tid}`);
        return safeReply(message, receipt("💵 Cash Out Successful ✅", [
          `💰 Amount: ${fmt(amt)}`, `💸 Fee: ${fmt(fee)}`, `🆔 TxnID: ${tid}`, `💳 Balance: ${fmt(db[uid].balance)}`
        ], pin));
      }

      // --- Recharge ---
      if (opt === "3" || opt === "recharge") {
        const mobile = tokens[3], amt = Number(tokens[4]);
        if (!mobile || !amt) return safeReply(message, "❌ মোবাইল নম্বর এবং Amount দিন।");
        const fee = computeFee(amt), total = amt + fee;
        if (user.balance < total) return safeReply(message, "❌ পর্যাপ্ত ব্যালেন্স নেই।");
        db[uid].balance -= total; db[OWNER_UID].balance += fee; writeAll(db);
        const tid = txn();
        addHistory(uid, `Recharge ${mobile} ${fmt(amt)} Fee:${fmt(fee)} Txn:${tid}`);
        return safeReply(message, receipt("📱 Recharge Successful ✅", [
          `📞 Mobile: ${mobile}`, `💰 Amount: ${fmt(amt)}`, `🆔 TxnID: ${tid}`
        ], pin));
      }

      // --- Balance ---
      if (opt === "4" || opt === "balance") {
        return safeReply(message, receipt("💰 Balance Info", [
          `💵 Cash: ${fmt(user.balance)}`,
          `🏦 Bank: ${fmt(user.bank)}`
        ], pin));
      }

      // --- Deposit ---
      if (opt === "5" || opt === "deposit") {
        const amt = Number(tokens[3]);
        if (!amt || amt <= 0) return safeReply(message, "❌ Invalid amount");
        if (user.balance < amt) return safeReply(message, "❌ পর্যাপ্ত ক্যাশ নেই।");
        user.balance -= amt; user.bank += amt; writeAll(db);
        const tid = txn();
        addHistory(uid, `Deposit ${fmt(amt)} Txn:${tid}`);
        return safeReply(message, receipt("🏦 Deposit Successful ✅", [
          `💵 Amount: ${fmt(amt)}`, `🏦 Bank: ${fmt(user.bank)}`
        ], pin));
      }

      // --- Withdraw ---
      if (opt === "6" || opt === "withdraw") {
        const amt = Number(tokens[3]);
        if (!amt || amt <= 0) return safeReply(message, "❌ Invalid amount");
        if (user.bank < amt) return safeReply(message, "❌ পর্যাপ্ত ব্যাংক ব্যালেন্স নেই।");
        user.bank -= amt; user.balance += amt; writeAll(db);
        const tid = txn();
        addHistory(uid, `Withdraw ${fmt(amt)} Txn:${tid}`);
        return safeReply(message, receipt("🏦 Withdraw Successful ✅", [
          `💵 Amount: ${fmt(amt)}`, `💳 Cash: ${fmt(user.balance)}`
        ], pin));
      }

      // --- Reset PIN ---
      if (opt === "7" || opt === "reset") {
        const newPin = tokens[3];
        if (!/^\d{4}$/.test(newPin)) return safeReply(message, "❌ নতুন PIN অবশ্যই ৪ সংখ্যার হতে হবে।");
        await setPIN(uid, newPin);
        return safeReply(message, "✅ PIN সফলভাবে পরিবর্তন হয়েছে!");
      }

      // --- History ---
      if (opt === "history") {
        const hist = user.history?.slice(0, 10).join("\n") || "No history yet.";
        return safeReply(message, receipt("📜 Transaction History", [hist], pin));
      }

      return safeReply(message, "❌ Invalid option. মেনু দেখতে: .bkash <PIN>");
    } catch (err) {
      console.error("bKash error:", err);
      safeReply(message, "⚠️ কোনো একটি ত্রুটি ঘটেছে। পরে চেষ্টা করুন।");
    }
  }
};
