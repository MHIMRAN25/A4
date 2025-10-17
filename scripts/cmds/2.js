const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "bkash",
    version: "2.1",
    author: "Imran | GoatBot v2",
    description: "Offline bKash simulator with real receipt system",
    guide: {
      en: "{pn} send 017XXXXXXXX 500\n{pn} cashout 017XXXXXXXX 1000\n{pn} recharge 017XXXXXXXX 50"
    },
    category: "💸 Economy",
    countDown: 10,
    role: 0
  },

  onStart: async function ({ args, message, event, api }) {
    const dataPath = path.join(__dirname, "bKashData.json");

    if (!fs.existsSync(dataPath)) {
      fs.writeFileSync(dataPath, JSON.stringify({}), "utf8");
    }
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    const user = event.senderID;
    const userName = (await api.getUserInfo(user))[user].name;

    if (!data[user]) {
      data[user] = {
        name: userName,
        balance: 1000,
        pin: "1234",
        history: []
      };
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    }

    const userData = data[user];
    const command = args[0]?.toLowerCase();
    const target = args[1];
    const amount = parseFloat(args[2]);

    async function safeReply(text) {
      if (!text || text.trim() === "") text = "Error: Blank message prevented.";
      try {
        await message.reply(text);
      } catch (e) {
        console.error("Reply failed:", e);
      }
    }

    function receiptBox(details) {
      const now = new Date();
      const time = now.toLocaleString("en-BD", {
        timeZone: "Asia/Dhaka",
        hour12: true
      });
      const txnID = "TXN" + Math.floor(1000000 + Math.random() * 9000000);

      let receipt = "";
      receipt += "bKash\n";
      receipt += "Transaction Successful\n\n";
      receipt += `To: ${details.to}\n`;
      receipt += `Amount: ${details.amount.toFixed(2)} BDT\n`;
      if (details.charge) receipt += `Charge: ${details.charge.toFixed(2)} BDT\n`;
      receipt += `Reference: ${details.type}\n`;
      receipt += `Transaction ID: ${txnID}\n`;
      receipt += `Time: ${time}\n`;
      receipt += `Available Balance: ${userData.balance.toFixed(2)} BDT\n`;
      return receipt;
    }

    if (!command) {
      return safeReply(
        "bKash Menu\n\n1. Send Money\n2. Cash Out\n3. Mobile Recharge\n4. Deposit\n5. Withdraw\n6. Reset PIN\n7. History\n8. Balance\n\nExample:\n.bkash send 017XXXXXXXX 200"
      );
    }

    if (command === "send") {
      if (!target || isNaN(amount))
        return safeReply("Usage: .bkash send <number> <amount>");
      if (userData.balance < amount)
        return safeReply("Insufficient balance.");
      userData.balance -= amount;
      userData.history.push(`Sent ${amount} to ${target}`);
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      return safeReply(
        receiptBox({ to: target, amount, type: "Send Money" })
      );
    }

    if (command === "cashout") {
      if (!target || isNaN(amount))
        return safeReply("Usage: .bkash cashout <agent> <amount>");
      const charge = amount * 0.0185;
      const total = amount + charge;
      if (userData.balance < total)
        return safeReply("Not enough balance (include charge).");
      userData.balance -= total;
      userData.history.push(`Cash Out ${amount} to ${target}`);
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      return safeReply(
        receiptBox({ to: target, amount, charge, type: "Cash Out" })
      );
    }

    if (command === "recharge") {
      if (!target || isNaN(amount))
        return safeReply("Usage: .bkash recharge <number> <amount>");
      if (userData.balance < amount)
        return safeReply("Not enough balance.");
      userData.balance -= amount;
      userData.history.push(`Recharged ${amount} to ${target}`);
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      return safeReply(
        receiptBox({ to: target, amount, type: "Mobile Recharge" })
      );
    }

    if (command === "deposit") {
      if (isNaN(amount)) return safeReply("Enter a valid amount.");
      userData.balance += amount;
      userData.history.push(`Deposited ${amount}`);
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      return safeReply(
        receiptBox({ to: userData.name, amount, type: "Deposit" })
      );
    }

    if (command === "withdraw") {
      if (isNaN(amount)) return safeReply("Enter a valid amount.");
      if (userData.balance < amount)
        return safeReply("Not enough balance.");
      userData.balance -= amount;
      userData.history.push(`Withdrew ${amount}`);
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      return safeReply(
        receiptBox({ to: userData.name, amount, type: "Withdraw" })
      );
    }

    if (command === "resetpin") {
      const newPin = Math.floor(1000 + Math.random() * 9000).toString();
      userData.pin = newPin;
      userData.history.push(`PIN Reset to ${newPin}`);
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
      return safeReply(`Your new PIN: ${newPin}`);
    }

    if (command === "history") {
      if (userData.history.length === 0)
        return safeReply("No transaction history found.");
      return safeReply(
        "Recent Transactions:\n" + userData.history.slice(-10).reverse().join("\n")
      );
    }

    if (command === "balance") {
      return safeReply(`Available Balance: ${userData.balance.toFixed(2)} BDT`);
    }

    return safeReply("Invalid command. Use `.bkash` for options.");
  }
};
