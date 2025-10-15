const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "3",
    aliases: ["٣", "3"],
    version: "3.0",
    author: "MH & GPT Fixed",
    role: 0,
    shortDescription: "Simulate bKash transactions (Goat Bot v2 safe)",
    longDescription: "A fun local bKash simulator with PIN, balance, and transaction system.",
    category: "fun",
    guide: {
      en: "{pn} → show menu\n{pn} setpin <4-digit>\n{pn} <PIN> 1 <UID> <amount>\n{pn} <PIN> 2 <amount>\n{pn} <PIN> balance"
    }
  },

  onStart: async function({ event, message, args, usersData }) {
    const { threadID, senderID, body } = event;
    const dbPath = path.join(__dirname, "bkashData.json");
    if (!fs.existsSync(dbPath)) fs.writeJsonSync(dbPath, {});
    const db = fs.readJsonSync(dbPath);
    const uid = String(senderID);

    if (!db[uid]) {
      const userInfo = await usersData.get(senderID);
      db[uid] = {
        name: userInfo.name || "Unknown User",
        pin: null,
        balance: 5000,
        bank: 0,
        history: []
      };
      fs.writeJsonSync(dbPath, db, { spaces: 2 });
    }

    const user = db[uid];
    const input = args.length ? args : (body ? body.trim().split(/\s+/) : []);
    const first = input[0] ? input[0].toLowerCase() : "";

    // Set PIN
    if (first === "setpin") {
      const newPin = input[1];
      if (!/^\d{4}$/.test(newPin))
        return message.reply("🔐 Please provide a valid 4-digit PIN.\nExample: .bkash setpin 1234");
      user.pin = newPin;
      fs.writeJsonSync(dbPath, db, { spaces: 2 });
      return message.reply(`✅ Your new PIN has been set successfully!\nPIN: ${newPin}`);
    }

    // Require PIN
    if (!user.pin)
      return message.reply("🔐 You haven’t set your PIN yet.\nUse: .bkash setpin <4-digit PIN>");

    const pin = input[0];
    if (pin !== user.pin)
      return message.reply("❌ Invalid PIN. Try again.");

    const cmd = input[1] ? input[1].toLowerCase() : "";

    // Commands
    if (cmd === "balance" || cmd === "bal") {
      return message.reply(`💰 Your current bKash balance is: ৳${user.balance}`);
    }

    if (cmd === "history") {
      const hist = user.history.length ? user.history.slice(-10).join("\n") : "No recent transactions.";
      return message.reply(`📜 Transaction History:\n${hist}`);
    }

    // Send money
    if (cmd === "1") {
      const targetUID = input[2];
      const amount = parseFloat(input[3]);
      if (!targetUID || isNaN(amount))
        return message.reply("⚠️ Usage: .bkash <PIN> 1 <receiverUID> <amount>");

      if (!db[targetUID]) {
        const receiverInfo = await usersData.get(targetUID);
        db[targetUID] = {
          name: receiverInfo.name || "Unknown User",
          pin: null,
          balance: 5000,
          bank: 0,
          history: []
        };
      }

      if (amount <= 0) return message.reply("❌ Invalid amount.");
      if (user.balance < amount) return message.reply("❌ Insufficient balance.");

      user.balance -= amount;
      db[targetUID].balance += amount;

      const note = `Sent ৳${amount} to ${db[targetUID].name} (${targetUID})`;
      user.history.push(note);
      db[targetUID].history.push(`Received ৳${amount} from ${user.name} (${uid})`);
      fs.writeJsonSync(dbPath, db, { spaces: 2 });

      return message.reply(receiptBox("💸 Money Sent", [
        `From: ${user.name}`,
        `To: ${db[targetUID].name}`,
        `Amount: ৳${amount}`,
        `New Balance: ৳${user.balance}`
      ], pin));
    }

    // Cash out
    if (cmd === "2") {
      const amount = parseFloat(input[2]);
      if (isNaN(amount) || amount <= 0)
        return message.reply("⚠️ Usage: .bkash <PIN> 2 <amount>");
      if (user.balance < amount) return message.reply("❌ Insufficient balance.");

      user.balance -= amount;
      const fee = amount * 0.018; // 1.8%
      user.history.push(`Cash Out ৳${amount} (Fee ৳${fee.toFixed(2)})`);
      fs.writeJsonSync(dbPath, db, { spaces: 2 });

      return message.reply(receiptBox("🏧 Cash Out Successful", [
        `Amount: ৳${amount}`,
        `Fee: ৳${fee.toFixed(2)}`,
        `Remaining Balance: ৳${user.balance}`
      ], pin));
    }

    // Bank deposit
    if (cmd === "5") {
      const amt = parseFloat(input[2]);
      if (isNaN(amt) || amt <= 0) return message.reply("⚠️ Usage: .bkash <PIN> 5 <amount>");
      if (user.balance < amt) return message.reply("❌ Insufficient balance.");
      user.balance -= amt;
      user.bank += amt;
      user.history.push(`Deposited ৳${amt} to bank`);
      fs.writeJsonSync(dbPath, db, { spaces: 2 });
      return message.reply(receiptBox("🏦 Bank Deposit Successful", [
        `Amount: ৳${amt}`,
        `Bank Balance: ৳${user.bank}`,
        `bKash Balance: ৳${user.balance}`
      ], pin));
    }

    // Bank withdraw
    if (cmd === "6") {
      const amt = parseFloat(input[2]);
      if (isNaN(amt) || amt <= 0) return message.reply("⚠️ Usage: .bkash <PIN> 6 <amount>");
      if (user.bank < amt) return message.reply("❌ Not enough money in bank.");
      user.bank -= amt;
      user.balance += amt;
      user.history.push(`Withdrew ৳${amt} from bank`);
      fs.writeJsonSync(dbPath, db, { spaces: 2 });
      return message.reply(receiptBox("🏧 Bank Withdraw Successful", [
        `Amount: ৳${amt}`,
        `Bank Balance: ৳${user.bank}`,
        `bKash Balance: ৳${user.balance}`
      ], pin));
    }

    // Default menu
    const menu = [
      `💸 bKash Menu — ${user.name}`,
      `💰 Balance: ৳${user.balance}`,
      `🏦 Bank   : ৳${user.bank}`,
      `1️⃣ Send Money   → .bkash ${pin} 1 <UID> <amt>`,
      `2️⃣ Cash Out     → .bkash ${pin} 2 <amt>`,
      `3️⃣ Balance      → .bkash ${pin} balance`,
      `4️⃣ History      → .bkash ${pin} history`,
      `5️⃣ Bank Deposit → .bkash ${pin} 5 <amt>`,
      `6️⃣ Bank Withdraw→ .bkash ${pin} 6 <amt>`,
    ].join("\n");

    return message.reply(menu);
  }
};

function receiptBox(title, lines = [], pin = "****") {
  const safeLines = Array.isArray(lines)
    ? lines.filter(l => l && String(l).trim().length > 0)
    : [];
  if (safeLines.length === 0) safeLines.push("No details available");
  const lineSep = "──────────────────────────";
  const content = [
    title,
    lineSep,
    ...safeLines,
    lineSep,
    `Back to menu: .bkash ${pin}`
  ].join("\n");
  return content;
          }
