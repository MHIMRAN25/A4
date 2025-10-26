const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "bkash",
    version: "5.3", // Added Cash In (Bank to bKash) feature
    author: "Imran | GoatBot v2 (Finalized OnReply Code)",
    description: "Offline bKash Simulator with persistent data and owner fee system.",
    category: "💸 Economy",
    countDown: 10,
    role: 0
  },

  onStart: async function ({ api, event, message, args }) {
    // --- Configuration & Data Paths ---
    const OWNER_UID = "100089926788317"; 
    const OWNER_NAME = "Bot Admin/Owner";
    const BKASH_DATA_PATH = path.join(__dirname, "bKashData.json"); // bKash Data
    const BANK_DATA_PATH = path.join(__dirname, "bankData.json");   // Bank Data (New)
    const FEE_PERCENT = 1.5; 

    // --- Utility Functions ---
    // Calculates the transaction fee (1.5% with a minimum of 5 BDT)
    function computeFee(amount) {
      const raw = Math.ceil((amount * FEE_PERCENT) / 100);
      return Math.max(5, raw); 
    }
    // Gets the current time in Dhaka time zone
    function getTimeNow() {
      const now = new Date();
      return now.toLocaleString("en-BD", {
        timeZone: "Asia/Dhaka",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
    }

    // --- Data Management (Load) ---
    // Ensure bKash data file exists and load it
    if (!fs.existsSync(BKASH_DATA_PATH)) {
      fs.writeFileSync(BKASH_DATA_PATH, JSON.stringify({}), "utf8");
    }
    const bkashData = JSON.parse(fs.readFileSync(BKASH_DATA_PATH, "utf8"));
    
    // Check if bankData.json exists for the new feature and create if not
    if (!fs.existsSync(BANK_DATA_PATH)) {
        fs.writeFileSync(BANK_DATA_PATH, JSON.stringify({}), "utf8");
    }
    const bankData = JSON.parse(fs.readFileSync(BANK_DATA_PATH, "utf8"));
    
    const user = event.senderID;
    const userName = (await api.getUserInfo(user))[user].name;

    // Initialize Owner and User Data (bKash)
    if (!bkashData[OWNER_UID]) {
      bkashData[OWNER_UID] = { name: OWNER_NAME, balance: 1000000, pin: "0000", history: [] };
      fs.writeFileSync(BKASH_DATA_PATH, JSON.stringify(bkashData, null, 2));
    }
    if (!bkashData[user]) {
      bkashData[user] = { name: userName, balance: 5000, pin: "1234", history: [] };
      fs.writeFileSync(BKASH_DATA_PATH, JSON.stringify(bkashData, null, 2));
    }
    // Initialize User Data (Bank - default balance 10000 if not exist)
    if (!bankData[user]) {
        bankData[user] = { balance: 10000 };
        fs.writeFileSync(BANK_DATA_PATH, JSON.stringify(bankData, null, 2));
    }
    
    const userData = bkashData[user];

    // --- MAIN MENU (ONREPLY ENTRY POINT) ---
    const menu = `📱 bKash Main Menu\n\n1️⃣ Send Money\n2️⃣ Cash Out\n3️⃣ Mobile Recharge\n4️⃣ Check Balance\n5️⃣ Show History\n6️⃣ Reset PIN\n7️⃣ 🏦 Cash In (Bank)\n\n💡 Charge: 1.5% (Minimum 5 BDT)\n\nPlease reply with the number of an option.`;
    
    // Send menu and set the onReply handler
    api.sendMessage(menu, event.threadID, (error, info) => {
        if (error) return console.error(error);

        global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: 'menu',
            author: event.senderID,
            bkashPath: BKASH_DATA_PATH,
            bankPath: BANK_DATA_PATH
        });
    }, event.messageID); 
  },


  onReply: async function ({ api, event, Reply }) {
    api.unsendMessage(Reply.messageID);
    
    // Only process reply if it's a message reply and from the original author
    if (event.type !== "message_reply" || event.senderID !== Reply.author) return;

    // Re-Load Data
    const bkashData = JSON.parse(fs.readFileSync(Reply.bkashPath, "utf8"));
    const bankData = JSON.parse(fs.readFileSync(Reply.bankPath, "utf8"));
    
    const user = event.senderID;
    const userData = bkashData[user];
    const bankUserData = bankData[user]; // Get user's bank data
    const OWNER_UID = "100089926788317";
    
    // Utility functions for onReply (re-declared for scope)
    function computeFee(amount) {
      const raw = Math.ceil((amount * 1.5) / 100);
      return Math.max(5, raw); 
    }
    function getTimeNow() {
      return new Date().toLocaleString("en-BD", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
    }

    // Function to save data (OnReply version)
    function saveAllData() {
        fs.writeFileSync(Reply.bkashPath, JSON.stringify(bkashData, null, 2));
        fs.writeFileSync(Reply.bankPath, JSON.stringify(bankData, null, 2)); // Save bank data too
    }

    // --- STEP 1: Process Menu Reply ---
    if (Reply.type === 'menu') {
        const option = parseInt(event.body);

        // Validation: option must be between 1 and 7
        if (isNaN(option) || option < 1 || option > 7) {
             return api.sendMessage("❌ Invalid option. Please provide a number between 1 and 7.", event.threadID, event.messageID);
        }

        let nextPrompt;
        let nextType;
        
        switch(option) {
            case 1: 
                nextPrompt = "Send Money: Please enter the UID and amount (BDT).\n\nExample: <uid> <amount>"; 
                nextType = 'send_input'; 
                break;
            case 2: 
                nextPrompt = "Cash Out: Please enter the cash out amount (BDT).\n\nExample: <amount>"; 
                nextType = 'cashout_input'; 
                break;
            case 3: 
                nextPrompt = "Mobile Recharge: Please enter the 11-digit number and amount (BDT).\n\nExample: <number> <amount>"; 
                nextType = 'recharge_input'; 
                break;
            case 4: // Check Balance
                const ownerBalance = bkashData[OWNER_UID].balance.toFixed(2);
                const bankBalance = bankUserData ? bankUserData.balance.toFixed(2) : "0.00"; // Display Bank Balance
                const balanceMsg = `💰 bKash Balance: ${userData.balance.toFixed(2)} BDT\n🏦 Bank Balance: ${bankBalance} BDT\n👑 Admin Fund: ${ownerBalance} BDT\n\n──────────────────────────────\n⏰ ${getTimeNow()}`;
                return api.sendMessage(balanceMsg, event.threadID, event.messageID);
            case 5: // Show History
                if (userData.history.length === 0) {
                    return api.sendMessage("📜 You have no transaction history.", event.threadID, event.messageID);
                }
                const historyMsg = `📜 Your last 5 transaction history items:\n\n${userData.history.slice(0, 5).join("\n\n")}`;
                return api.sendMessage(historyMsg, event.threadID, event.messageID);
            case 6: // Reset PIN
                nextPrompt = "Reset PIN: Please enter your 4-digit new PIN.\n\nExample: <4-digit pin>"; 
                nextType = 'reset_pin_input'; 
                break;
            case 7: // New: Cash In (Bank)
                nextPrompt = `🏦 Cash In (Bank to bKash):\nYour current Bank Balance: ${bankUserData.balance.toFixed(2)} BDT\n\nHow much money do you want to Cash In?\n\nExample: <amount>`;
                nextType = 'cashin_input'; 
                break;
        }

        // Set next onReply state
        api.sendMessage(nextPrompt, event.threadID, (error, info) => {
            if (error) return console.error(error);
            global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                type: nextType,
                author: event.senderID,
                bkashPath: Reply.bkashPath,
                bankPath: Reply.bankPath
            });
        }, event.messageID);

    // --- STEP 2: Process Transaction Input ---
    } else if (Reply.type === 'send_input' || Reply.type === 'cashout_input' || Reply.type === 'recharge_input' || Reply.type === 'reset_pin_input' || Reply.type === 'cashin_input') {
        const args = event.body.split(/\s+/);
        let message = "❌ Invalid format. Please try again.";
        let save = false;

        try {
            if (Reply.type === 'send_input') {
                const target = args[0];
                const amount = parseFloat(args[1]);
                if (!target || isNaN(amount) || amount <= 0) throw new Error("Format error");

                const fee = computeFee(amount);
                const totalCost = amount + fee; 

                if (userData.balance < totalCost) {
                     message = `❌ Insufficient balance. Required: ${totalCost.toFixed(2)} BDT (including fee of ${fee.toFixed(2)} BDT)`;
                } else if (target === user) {
                     message = "❌ Cannot send money to yourself.";
                } else {
                    // Initialize target user if they don't exist
                    if (!bkashData[target]) {
                        const userInfo = (await api.getUserInfo(target))[target];
                        if (!userInfo || !userInfo.name) throw new Error("Invalid UID");
                        bkashData[target] = { name: userInfo.name, balance: 0, pin: "1234", history: [] };
                    }
                    
                    // Execute transaction
                    userData.balance -= totalCost; 
                    bkashData[target].balance += amount; 
                    bkashData[OWNER_UID].balance += fee; // Owner/Admin collects the fee
                    
                    // Log transaction
                    const txn = "TXN" + Math.floor(1000000 + Math.random() * 9000000);
                    const time = getTimeNow();
                    userData.history.unshift(`[${time} | ${txn}] SEND: ${amount.toFixed(2)} BDT`);

                    message = `📱 bKash\n✅ Send Money Successful\n\n🎯 Recipient: ${bkashData[target].name}\n💸 Amount: ${amount.toFixed(2)} BDT\n💰 Fee: ${fee.toFixed(2)} BDT\n\n──────────────────────────────\n🆔 Transaction ID: ${txn}\n💳 Current Balance: ${userData.balance.toFixed(2)} BDT`;
                    save = true;
                }
            } else if (Reply.type === 'cashout_input') {
                const amount = parseFloat(args[0]);
                if (isNaN(amount) || amount <= 0) throw new Error("Format error");

                const fee = computeFee(amount);
                const totalCost = amount + fee;

                if (userData.balance < totalCost) {
                    message = `❌ Insufficient balance. Required: ${totalCost.toFixed(2)} BDT (including fee of ${fee.toFixed(2)} BDT)`;
                } else {
                    // Execute transaction
                    userData.balance -= totalCost;
                    bkashData[OWNER_UID].balance += fee; // Owner/Admin collects the fee
                    
                    // Log transaction
                    const txn = "TXN" + Math.floor(1000000 + Math.random() * 9000000);
                    const time = getTimeNow();
                    userData.history.unshift(`[${time} | ${txn}] CASHOUT: ${amount.toFixed(2)} BDT`);

                    message = `🏧 bKash\n✅ Cash Out Successful\n\n💵 Amount: ${amount.toFixed(2)} BDT\n💰 Fee: ${fee.toFixed(2)} BDT\n\n──────────────────────────────\n🆔 Transaction ID: ${txn}\n💳 Current Balance: ${userData.balance.toFixed(2)} BDT`;
                    save = true;
                }
            } else if (Reply.type === 'recharge_input') {
                const mobileNumber = args[0];
                const amount = parseFloat(args[1]);
                if (!mobileNumber || !/^\d{11}$/.test(mobileNumber) || isNaN(amount) || amount <= 0) throw new Error("Format error");

                if (userData.balance < amount) {
                    message = "❌ Insufficient balance.";
                } else {
                    // Execute transaction (No fee for recharge)
                    userData.balance -= amount;
                    
                    // Log transaction
                    const txn = "TXN" + Math.floor(1000000 + Math.random() * 9000000);
                    const time = getTimeNow();
                    userData.history.unshift(`[${time} | ${txn}] RECHARGE: ${amount.toFixed(2)} BDT`);

                    message = `📶 bKash\n✅ Mobile Recharge Successful\n\n📱 Number: ${mobileNumber}\n💸 Amount: ${amount.toFixed(2)} BDT\n\n──────────────────────────────\n🆔 Transaction ID: ${txn}\n💳 Current Balance: ${userData.balance.toFixed(2)} BDT`;
                    save = true;
                }
            } else if (Reply.type === 'reset_pin_input') {
                const newPin = args[0]; 
                if (!newPin || !/^\d{4}$/.test(newPin)) throw new Error("PIN format error");

                userData.pin = newPin;
                message = `✅ Your PIN has been successfully changed. New PIN: **${newPin}**`;
                save = true;
            } else if (Reply.type === 'cashin_input') {
                // *** New: Cash In (Bank to bKash) Logic ***
                const amount = parseFloat(args[0]);
                if (isNaN(amount) || amount <= 0) throw new Error("Format error");

                if (bankUserData.balance < amount) {
                    message = `❌ Insufficient balance in your bank account. Current Bank Balance: ${bankUserData.balance.toFixed(2)} BDT`;
                } else {
                    // Update Balances (No fee for cash-in)
                    bankUserData.balance -= amount; // Bank balance reduced
                    userData.balance += amount;    // bKash balance increased

                    // Log transaction
                    const txn = "TXN" + Math.floor(1000000 + Math.random() * 9000000);
                    const time = getTimeNow();
                    userData.history.unshift(`[${time} | ${txn}] CASH IN (Bank): ${amount.toFixed(2)} BDT`);

                    message = `🏦 Bank to bKash\n✅ Cash In Successful\n\n💸 Amount: ${amount.toFixed(2)} BDT\n\n──────────────────────────────\n🆔 Transaction ID: ${txn}\n💳 Current bKash Balance: ${userData.balance.toFixed(2)} BDT\n💵 Current Bank Balance: ${bankUserData.balance.toFixed(2)} BDT`;
                    save = true; // Save both bkash and bank data
                }
            }
        } catch(e) {
            if (e.message === "Invalid UID") {
                message = "❌ The recipient's UID is incorrect or not found.";
            } else if (e.message === "PIN format error") {
                message = "❌ The PIN must be 4 digits.";
            } else {
                message = `❌ Invalid input or format. Please try again. (${e.message})`;
            }
            save = false; // Never save on error
        }

        // Send final message and save data if needed
        if (save) saveAllData();

        api.sendMessage(message, event.threadID, event.messageID);
    }
  }
};
