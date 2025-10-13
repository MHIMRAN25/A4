const moment = require("moment-timezone");

// Simulated in-memory storage (replace with DB in production)
const lastTransactions = {};
const userPins = {}; // { userID: "1234" }

module.exports = {
  config: {
    name: "bkashfun",
    aliases: ["bkash"],
    version: "2.2",
    author: "Imran x GPT",
    countDown: 5,
    role: 0,
    shortDescription: "Interactive Fake bKash Fun Bot with PIN & reset",
    longDescription: "Simulate Send Money, Cash Out, Mobile Recharge with PIN verification, retries, agent/operator randomness, last transaction and PIN reset.",
    category: "fun",
  },

  onStart: async function({ event, message, usersData }) {
    try {
      const userID = event.senderID;
      const userName = await usersData.getName(userID) || "User";

      // Ensure user has a PIN (default 1234)
      ensureUserPin(userID);

      // Show menu
      await message.reply(
`Select an option:
1) Send Money
2) Cash Out
3) Mobile Recharge
4) Last Transaction
5) PIN Reset

Reply with 1, 2, 3, 4, or 5.`
      );

      const optionReply = await waitForReply(userID);
      const opt = (optionReply || "").trim().toLowerCase();

      if (["1","send"].includes(opt)) return await handleSendMoneyFlow(userID, userName, message);
      if (["2","cashout"].includes(opt)) return await handleCashOutFlow(userID, userName, message);
      if (["3","recharge"].includes(opt)) return await handleRechargeFlow(userID, userName, message);
      if (["4","last"].includes(opt)) {
        if (lastTransactions[userID]) return message.reply(lastTransactions[userID]);
        else return message.reply("No previous transaction found.");
      }
      if (["5","pin","pin reset","reset"].includes(opt) || opt === "5") return await handlePinResetFlow(userID, message);

      return message.reply("Invalid option selected.");
    } catch (err) {
      console.error(err);
      return message.reply("An error occurred. Please try again later.");
    }
  }
};

// ---------------------- Flows ----------------------

async function handleSendMoneyFlow(userID, userName, message) {
  await message.reply("Enter the amount (1-25,000) or type 'random':");
  const amountReply = await waitForReply(userID);
  let amount = parseAmountOrRandom(amountReply);
  if (amount === null) return message.reply("Invalid amount.");

  // PIN verification (3 attempts)
  const pinOk = await verifyPin(userID, message);
  if (!pinOk) return message.reply("PIN verification failed. Transaction cancelled.");

  const time = moment().tz("Asia/Dhaka").format("D MMMM YYYY, h:mm A");
  const receipt = buildSendMoneyReceipt(userName, amount, time);
  lastTransactions[userID] = receipt;
  return message.reply(`PIN Verified Successfully.\n\n${receipt}`);
}

async function handleCashOutFlow(userID, userName, message) {
  await message.reply("Enter the amount (1-25,000) or type 'random':");
  const amountReply = await waitForReply(userID);
  let amount = parseAmountOrRandom(amountReply);
  if (amount === null) return message.reply("Invalid amount.");

  // PIN verification (3 attempts)
  const pinOk = await verifyPin(userID, message);
  if (!pinOk) return message.reply("PIN verification failed. Transaction cancelled.");

  const time = moment().tz("Asia/Dhaka").format("D MMMM YYYY, h:mm A");
  const receipt = buildCashOutReceipt(userName, amount, time);
  lastTransactions[userID] = receipt;
  return message.reply(`PIN Verified Successfully.\n\n${receipt}`);
}

async function handleRechargeFlow(userID, userName, message) {
  await message.reply("Enter the recharge amount (1-25,000) or type 'random':");
  const amountReply = await waitForReply(userID);
  let amount = parseAmountOrRandom(amountReply);
  if (amount === null) return message.reply("Invalid amount.");

  // PIN verification (3 attempts)
  const pinOk = await verifyPin(userID, message);
  if (!pinOk) return message.reply("PIN verification failed. Transaction cancelled.");

  const time = moment().tz("Asia/Dhaka").format("D MMMM YYYY, h:mm A");
  const receipt = buildRechargeReceipt(userName, amount, time);
  lastTransactions[userID] = receipt;
  return message.reply(`PIN Verified Successfully.\n\n${receipt}`);
}

async function handlePinResetFlow(userID, message) {
  // Step 1: Ask to verify current PIN (3 attempts)
  await message.reply("To reset your PIN, please enter your CURRENT 4-digit PIN:");
  let verified = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const pinReply = await waitForReply(userID);
    if (!pinReply) return message.reply("No input received. PIN reset cancelled.");
    const pin = pinReply.trim();
    if (/^\d{4}$/.test(pin) && pin === getUserPin(userID)) {
      verified = true;
      break;
    } else {
      if (attempt < 3) await message.reply(`Incorrect PIN. You have ${3 - attempt} attempt(s) left.`);
    }
  }
  if (!verified) return message.reply("PIN verification failed. PIN reset cancelled.");

  // Step 2: Ask for new PIN twice
  await message.reply("Enter your NEW 4-digit PIN:");
  const newPinReply = await waitForReply(userID);
  if (!newPinReply) return message.reply("No input received. PIN reset cancelled.");
  const newPin = newPinReply.trim();
  if (!/^\d{4}$/.test(newPin)) return message.reply("Invalid PIN format. PIN must be exactly 4 digits.");

  await message.reply("Confirm your NEW 4-digit PIN:");
  const confirmPinReply = await waitForReply(userID);
  if (!confirmPinReply) return message.reply("No input received. PIN reset cancelled.");
  const confirmPin = confirmPinReply.trim();

  if (newPin !== confirmPin) return message.reply("PIN mismatch. PIN reset cancelled.");
  if (newPin === getUserPin(userID)) return message.reply("New PIN is same as old PIN. Choose a different PIN.");

  // Save new PIN
  setUserPin(userID, newPin);
  return message.reply("Your PIN has been reset successfully.");
}

// ---------------------- PIN helpers ----------------------

function ensureUserPin(userID) {
  if (!userPins[userID]) {
    userPins[userID] = "1234"; // default PIN for new user
  }
}

function getUserPin(userID) {
  ensureUserPin(userID);
  return userPins[userID];
}

function setUserPin(userID, newPin) {
  userPins[userID] = newPin;
}

// verifyPin: interactively ask for PIN up to 3 attempts
async function verifyPin(userID, message) {
  await message.reply("Enter your 4-digit PIN:");
  for (let attempt = 1; attempt <= 3; attempt++) {
    const reply = await waitForReply(userID);
    if (!reply) {
      await message.reply("No input received. PIN verification cancelled.");
      return false;
    }
    const pin = reply.trim();
    if (/^\d{4}$/.test(pin) && pin === getUserPin(userID)) {
      return true;
    } else {
      if (attempt < 3) await message.reply(`Incorrect PIN. You have ${3 - attempt} attempt(s) left.`);
    }
  }
  return false;
}

// ---------------------- Utilities & Receipts (same as before) ----------------------

function generateTxnID(len = 12) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "";
  for (let i = 0; i < len; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
  return id;
}

function generateRefNo(len = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let ref = "";
  for (let i = 0; i < len; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length));
  return ref;
}

function generateMobileNumber() {
  const secondDigit = Math.floor(Math.random() * 10);
  const rest = Math.floor(Math.random() * 100000000).toString().padStart(8, "0");
  return `01${secondDigit}${rest}`;
}

function getRandomAmountInRange(min = 1, max = 25000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatWithCommas(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function calculateCharge(amount) {
  if (amount <= 10000) return 0;
  if (amount <= 20000) return 5;
  return 10;
}

function getRandomAgent() {
  const agents = ["bKash Agent 01", "bKash Agent 02", "bKash Agent 03", "Trusted Agent"];
  return agents[Math.floor(Math.random() * agents.length)];
}

function getRandomOperator() {
  const ops = ["GP", "Robi", "Banglalink", "Airtel", "Teletalk"];
  return ops[Math.floor(Math.random() * ops.length)];
}

// parse amount or random helper
function parseAmountOrRandom(input) {
  if (!input) return null;
  const t = input.trim();
  if (/^random$/i.test(t)) return getRandomAmountInRange(1, 25000);
  const num = parseInt(t.replace(/,/g, ""), 10);
  if (isNaN(num) || num < 1 || num > 25000) return null;
  return num;
}

// Receipts
function buildSendMoneyReceipt(userName, amount, time) {
  const txnID = generateTxnID();
  const refNo = generateRefNo();
  const charge = calculateCharge(amount);
  const total = amount + charge;
  const recipientMobile = generateMobileNumber();
  const paymentMethod = "bKash Wallet";

  return (
`========================
      bKash Send Money
========================

Recipient Name : ${userName}
Recipient Mobile : ${recipientMobile}

Transaction ID : ${txnID}
Reference No   : ${refNo}
Payment Method : ${paymentMethod}

Amount         : ${formatWithCommas(amount)} BDT
Charge         : ${formatWithCommas(charge)} BDT
Total          : ${formatWithCommas(total)} BDT

Date & Time    : ${time}

========================
This receipt is for fun only.
========================`
  );
}

function buildCashOutReceipt(userName, amount, time) {
  const txnID = generateTxnID();
  const refNo = generateRefNo();
  const agent = getRandomAgent();
  const charge = calculateCharge(amount);
  const total = amount + charge;

  return (
`========================
        bKash Cash Out
========================

Sender Name     : ${userName}
Agent           : ${agent}

Transaction ID  : ${txnID}
Reference No    : ${refNo}
Payment Method  : Cash Out

Amount          : ${formatWithCommas(amount)} BDT
Charge          : ${formatWithCommas(charge)} BDT
Total           : ${formatWithCommas(total)} BDT

Date & Time     : ${time}

========================
This receipt is for fun only.
========================`
  );
}

function buildRechargeReceipt(userName, amount, time) {
  const txnID = generateTxnID();
  const refNo = generateRefNo();
  const mobile = generateMobileNumber();
  const operator = getRandomOperator();
  const charge = 0;
  const total = amount;

  return (
`========================
      Mobile Recharge
========================

Subscriber Name : ${userName}
Mobile Number   : ${mobile}
Operator        : ${operator}

Transaction ID  : ${txnID}
Reference No    : ${refNo}
Payment Method  : bKash Wallet

Recharge Amount : ${formatWithCommas(amount)} BDT
Charge          : ${formatWithCommas(charge)} BDT
Total           : ${formatWithCommas(total)} BDT

Date & Time     : ${time}

========================
This receipt is for fun only.
========================`
  );
}

// ---------------------- Placeholder for waiting user reply ----------------------
// Implement this according to your bot platform: it should wait for next message from senderID and return the text.
async function waitForReply(senderID) {
  return new Promise((resolve) => {
    // Example: bind listener in your framework; when message from senderID arrives call resolve(text)
    // For now, this is a placeholder and must be implemented by you.
  });
        }
