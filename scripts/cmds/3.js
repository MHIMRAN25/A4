// bkash_full_module_v5.js
// Full-featured bKash simulator | GoatBot v2 | PIN hashed | JSON persistence
// npm install fs-extra bcrypt

const fs = require("fs-extra");
const path = require("path");
const bcrypt = require("bcrypt");

// ---------------- Config / Metadata ----------------
module.exports = {
  config: {
    name: "bkash3",
    aliases: ["bKash", "Bkash"],
    version: "5.0",
    author: "Imran | MH",
    role: 0,
    category: "💰 Economy",
    shortDescription: "Offline bKash simulator with PIN & transactions",
    longDescription: "Send Money, Cash Out, Mobile Recharge, Bank Deposit/Withdraw, Reset PIN, History, Admin panel with receipt formatting.",
    guide: {
      en: "{pn} → show menu\n{pn} setpin <4-digit>\n{pn} <PIN> 1 <UID> <amount>\n{pn} <PIN> 2 <amount>\n{pn} <PIN> 3 <mobile> <amount>\n{pn} <PIN> 4 → balance\n{pn} <PIN> 5 <amount> → deposit\n{pn} <PIN> 6 <amount> → withdraw\n{pn} <PIN> 7 <newPIN> → reset PIN\n{pn} <PIN> history\n{pn} <PIN> admin → owner"
    }
  },

  // ---------------- OnStart ----------------
  onStart: async function({ event, message, args, usersData }) {
    const dbPath = path.join(__dirname, "bKashData.json");
    if (!fs.existsSync(dbPath)) fs.writeJsonSync(dbPath, {});
  },

  // ---------------- Run Command ----------------
  run: async function({ message, event, args, usersData }) {
    const dbPath = path.join(__dirname, "bKashData.json");
    if (!fs.existsSync(dbPath)) fs.writeJsonSync(dbPath, {});
    let db = fs.readJsonSync(dbPath);

    const uid = String(event.senderID);
    let user = db[uid];
    if (!user) {
      const info = await usersData.get(uid);
      user = {
        name: info.name || `User_${uid}`,
        pinHash: null,
        balance: 500,
        bank: 0,
        history: []
      };
      db[uid] = user;
      fs.writeJsonSync(dbPath, db, { spaces: 2 });
    }

    const input = args.length ? args : (event.body ? event.body.trim().split(/\s+/) : []);
    const first = input[0]?.toLowerCase();

    // ---------------- Set PIN ----------------
    if (first === "setpin") {
      const newPin = input[1];
      if (!/^\d{4}$/.test(newPin)) return message.reply("🔐 PIN must be 4 digits. Example: .bkash setpin 1234");
      const hash = await bcrypt.hash(newPin, 10);
      user.pinHash = hash;
      fs.writeJsonSync(dbPath, db, { spaces: 2 });
      return message.reply(`✅ PIN set successfully. Your new PIN: ${newPin}`);
    }

    // ---------------- Require PIN ----------------
    if (!user.pinHash) return message.reply("🔐 You haven't set a PIN. Use: .bkash setpin <4-digit PIN>");
    const pin = input[0];
    const okPin = await bcrypt.compare(pin, user.pinHash);
    if (!okPin) return message.reply("❌ Incorrect PIN.");

    const cmd = input[1]?.toLowerCase() || "";

    // ---------------- Utilities ----------------
    function fmt(n) { return `${Number(n).toLocaleString()} BDT`; }
    function nowStr() { return new Date().toLocaleString("en-GB", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" }); }
    function txnId() { return Math.random().toString(36).substring(2,10).toUpperCase(); }
    function pushHistory(u, text) { u.history.unshift(`[${nowStr()}] ${text}`); u.history = u.history.slice(0,50); }
    function receiptBox(title, lines=[]) { const sep = "──────────────────────────"; return [title, sep, ...lines, sep, `Back to menu: .bkash ${pin}`].join("\n"); }
    function computeFee(amount) { const fee = Math.ceil(amount * 0.015); return Math.max(2, Math.min(100, fee)); }

    // ---------------- Commands ----------------

    // 1️⃣ Send Money
    if (cmd === "1") {
      const targetUID = input[2];
      const amount = Number(input[3]);
      if (!targetUID || isNaN(amount) || amount <=0) return message.reply("❌ Usage: .bkash <PIN> 1 <UID> <amount>");
      if (!db[targetUID]) {
        const info = await usersData.get(targetUID);
        db[targetUID] = { name: info.name||`User_${targetUID}`, pinHash:null, balance:500, bank:0, history:[] };
      }
      const fee = computeFee(amount);
      const total = amount+fee;
      if (user.balance < total) return message.reply(`❌ Insufficient balance (including fee ${fmt(fee)})`);
      user.balance -= total;
      db[targetUID].balance += amount;
      pushHistory(user, `Sent ${fmt(amount)} to ${db[targetUID].name} (Fee ${fmt(fee)})`);
      pushHistory(db[targetUID], `Received ${fmt(amount)} from ${user.name}`);
      fs.writeJsonSync(dbPath, db, { spaces:2 });
      return message.reply(receiptBox("📱 Send Money ✅", [`Sender: ${user.name}`, `Receiver: ${db[targetUID].name}`, `Amount: ${fmt(amount)}`, `Fee: ${fmt(fee)}`, `Balance: ${fmt(user.balance)}`]));
    }

    // 2️⃣ Cash Out
    if (cmd === "2") {
      const amount = Number(input[2]);
      if (!amount || isNaN(amount) || amount <=0) return message.reply("❌ Usage: .bkash <PIN> 2 <amount>");
      const fee = computeFee(amount);
      const total = amount+fee;
      if (user.balance < total) return message.reply(`❌ Insufficient balance (including fee ${fmt(fee)})`);
      user.balance -= total;
      pushHistory(user, `Cashed out ${fmt(amount)} (Fee ${fmt(fee)})`);
      fs.writeJsonSync(dbPath, db, { spaces:2 });
      return message.reply(receiptBox("💵 Cash Out ✅", [`Amount: ${fmt(amount)}`, `Fee: ${fmt(fee)}`, `Remaining Balance: ${fmt(user.balance)}`]));
    }

    // 3️⃣ Mobile Recharge
    if (cmd === "3") {
      const mobile = input[2];
      const amount = Number(input[3]);
      if (!mobile || !amount || isNaN(amount) || amount<=0) return message.reply("❌ Usage: .bkash <PIN> 3 <mobile> <amount>");
      const fee = computeFee(amount);
      const total = amount+fee;
      if (user.balance < total) return message.reply(`❌ Insufficient balance (including fee ${fmt(fee)})`);
      user.balance -= total;
      pushHistory(user, `Mobile recharge ${mobile} ${fmt(amount)} (Fee ${fmt(fee)})`);
      fs.writeJsonSync(dbPath, db, { spaces:2 });
      return message.reply(receiptBox("📱 Mobile Recharge ✅", [`Mobile: ${mobile}`, `Amount: ${fmt(amount)}`, `Fee: ${fmt(fee)}`, `Balance: ${fmt(user.balance)}`]));
    }

    // 4️⃣ Balance
    if (cmd === "4" || cmd === "balance") return message.reply(receiptBox("💰 Balance", [`Cash: ${fmt(user.balance)}`, `Bank: ${fmt(user.bank)}`]));

    // 5️⃣ Bank Deposit
    if (cmd === "5") {
      const amt = Number(input[2]);
      if (!amt || isNaN(amt) || amt <=0) return message.reply("❌ Usage: .bkash <PIN> 5 <amount>");
      if (user.balance < amt) return message.reply("❌ Insufficient cash");
      user.balance -= amt;
      user.bank += amt;
      pushHistory(user, `Deposited ${fmt(amt)} to bank`);
      fs.writeJsonSync(dbPath, db, { spaces:2 });
      return message.reply(receiptBox("🏦 Bank Deposit ✅", [`Amount: ${fmt(amt)}`, `Cash: ${fmt(user.balance)}`, `Bank: ${fmt(user.bank)}`]));
    }

    // 6️⃣ Bank Withdraw
    if (cmd === "6") {
      const amt = Number(input[2]);
      if (!amt || isNaN(amt) || amt <= 0) return message.reply("❌ Usage: .bkash <PIN> 6 <amount>");
      if (user.bank < amt) return message.reply("❌ Insufficient bank balance");
      user.bank -= amt;
      user.balance += amt;
      pushHistory(user, `Withdrew ${fmt(amt)} from bank`);
      fs.writeJsonSync(dbPath, db, { spaces: 2 });
      return message.reply(receiptBox("🏧 Bank Withdraw ✅", [
        `Amount: ${fmt(amt)}`,
        `Bank Balance: ${fmt(user.bank)}`,
        `Cash Balance: ${fmt(user.balance)}`
      ]));
    }

    // 7️⃣ Reset PIN
    if (cmd === "7" || cmd === "reset") {
      const newPin = input[2];
      if (!/^\d{4}$/.test(newPin)) return message.reply("❌ New PIN must be 4 digits");
      const hash = await bcrypt.hash(newPin, 10);
      user.pinHash = hash;
      fs.writeJsonSync(dbPath, db, { spaces: 2 });
      return message.reply(`✅ PIN reset successful. New PIN: ${newPin}`);
    }

    // 📜 History
    if (cmd === "history") {
      const hist = user.history.length ? user.history.slice(0, 10).join("\n") : "No recent transactions";
      return message.reply(receiptBox("📜 Transaction History", hist.split("\n")));
    }

    // 👑 Admin / Owner panel
    const OWNER_UID = "100089926788317"; // change to your UID
    if (cmd === "admin" && uid === OWNER_UID) {
      const totalUsers = Object.keys(db).length;
      const totalBalance = Object.values(db).reduce((sum, u) => sum + (u.balance || 0) + (u.bank || 0), 0);
      return message.reply(`👑 Admin Panel\nUsers: ${totalUsers}\nTotal Balance: ${fmt(totalBalance)}`);
    }

    // ---------------- Default Menu ----------------
    const menu = [
      `💸 bKash Menu — ${user.name}`,
      `💰 Cash: ${fmt(user.balance)}`,
      `🏦 Bank: ${fmt(user.bank)}`,
      `1️⃣ Send Money   → .bkash ${pin} 1 <UID> <amount>`,
      `2️⃣ Cash Out     → .bkash ${pin} 2 <amount>`,
      `3️⃣ Mobile Recharge → .bkash ${pin} 3 <mobile> <amount>`,
      `4️⃣ Balance      → .bkash ${pin} 4`,
      `5️⃣ Bank Deposit → .bkash ${pin} 5 <amount>`,
      `6️⃣ Bank Withdraw→ .bkash ${pin} 6 <amount>`,
      `7️⃣ Reset PIN    → .bkash ${pin} 7 <newPIN>`,
      `📜 History      → .bkash ${pin} history`,
      uid === OWNER_UID ? `👑 Admin → .bkash ${pin} admin` : ""
    ].filter(Boolean).join("\n");

    return message.reply(menu);
  }
};
