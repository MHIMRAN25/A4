// bkashFullBot.js
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const MONGO_DB = process.env.MONGO_DB || "bkash_sim";
const OWNER_UID = process.env.OWNER_UID || "owner_123";

const FEE_PERCENT = 1.5;
const MIN_FEE = 2;
const MAX_FEE = 100;

function computeFee(amount) {
  const raw = (amount * FEE_PERCENT)/100;
  const ceilRaw = Math.ceil(raw);
  return Math.max(MIN_FEE, Math.min(MAX_FEE, ceilRaw));
}

let client;
async function getDb() {
  if (!client) {
    client = new MongoClient(MONGO_URI, { useNewUrlParser:true, useUnifiedTopology:true });
    await client.connect();
  }
  return client.db(MONGO_DB);
}

const userSessions = {}; // userID => { step, data }

function nowStr() {
  const now = new Date();
  return now.toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
}

function fmt(n){return `${n} BDT`;}
function makeTxnId(){return Math.random().toString(36).substring(2,10).toUpperCase();}

// --- Helpers ---
async function getUser(db, uid){ return db.collection("users").findOne({_id:uid}); }
async function createUserIfNotExists(db, uid, name="User"){
  const users = db.collection("users");
  const exists = await users.findOne({_id:uid});
  if(!exists){ await users.insertOne({_id:uid,name,pinHash:null,balance:0}); return {_id:uid,name,pinHash:null,balance:0}; }
  return exists;
}
async function setPIN(db, uid, pin){ const hash = await bcrypt.hash(pin,10); await db.collection("users").updateOne({_id:uid},{ $set:{pinHash:hash} }); }
async function verifyPIN(db, uid, pin){ const user = await getUser(db, uid); if(!user||!user.pinHash) return false; return bcrypt.compare(pin,pinHash); }

// --- Menu ---
function getMenu(){ return "💸 bKash Menu\n1️⃣ Send Money\n2️⃣ Cash Out\n3️⃣ Mobile Recharge\n4️⃣ Reset PIN\n5️⃣ Bank Deposit\n6️⃣ Bank Withdraw\n7️⃣ Balance\nReply with number or use buttons."; }

// --- Transaction ---
async function performTransaction(db,senderID,receiverID,amount,fee){
  await db.collection("users").updateOne({_id:senderID},{ $inc:{balance:-amount-fee} });
  await db.collection("users").updateOne({_id:receiverID},{ $inc:{balance:amount} });
  await db.collection("users").updateOne({_id:OWNER_UID},{ $inc:{balance:fee} });
}

// --- Main Run ---
module.exports.run = async function({message,args}) {
  const db = await getDb();
  const uid = message.senderID;
  const name = message.senderName || "User";

  await createUserIfNotExists(db,uid,name);
  await createUserIfNotExists(db,OWNER_UID,"Bot Owner");

  let session = userSessions[uid] || {step:"checkPIN",data:{}};
  const user = await getUser(db,uid);

  // PIN setup
  if(!user.pinHash){
    if(!args[0]) return message.reply(`${name}, set 4-digit PIN: .bkash 1234`);
    const pin = args[0];
    if(!/^\d{4}$/.test(pin)) return message.reply("❌ PIN must be 4 digits.");
    await setPIN(db,uid,pin);
    userSessions[uid] = {step:null,data:{}};
    return message.reply("✅ PIN set! Use .bkash YOUR_PIN to open menu.");
  }

  const text = args[0] || message.text.trim();

  switch(session.step){
    case "checkPIN":
      if(!await verifyPIN(db,uid,text)) return message.reply("❌ Incorrect PIN!");
      session.step="menu";
      userSessions[uid]=session;
      return message.reply(getMenu());

    case "menu":
      switch(text){
        case "1": session.step="send_uid"; return message.reply("Enter receiver UID:");
        case "2": session.step="cash_amount"; return message.reply("Enter Cash Out amount:");
        case "3": session.step="recharge_mobile"; return message.reply("Enter mobile number:");
        case "4": session.step="reset_pin"; return message.reply("Enter new 4-digit PIN:");
        case "5": session.step="bank_deposit"; return message.reply("Enter deposit amount:");
        case "6": session.step="bank_withdraw"; return message.reply("Enter withdraw amount:");
        case "7": const fresh = await getUser(db,uid); session.step="menu"; userSessions[uid]=session; return message.reply(`💰 Balance: ${fmt(fresh.balance)}`);
        default: return message.reply("❌ Invalid option. Reply 1-7.");
      }

    // --- Send Money ---
    case "send_uid":
      session.data.receiverUID=text;
      session.step="send_amount";
      userSessions[uid]=session;
      return message.reply("Enter amount:");

    case "send_amount":
      const amt1=Number(text);
      if(isNaN(amt1)||amt1<=0) return message.reply("❌ Invalid amount.");
      session.data.amount=amt1;
      session.step="send_pin";
      userSessions[uid]=session;
      return message.reply("Enter PIN to confirm:");

    case "send_pin":
      if(!await verifyPIN(db,uid,text)) return message.reply("❌ Incorrect PIN.");
      const fee1=computeFee(session.data.amount);
      if(user.balance<session.data.amount+fee1) return message.reply("❌ Insufficient balance including fee.");
      const recv1 = await createUserIfNotExists(db,session.data.receiverUID);
      await performTransaction(db,uid,recv1._id,session.data.amount,fee1);
      const txn1=makeTxnId();
      userSessions[uid]={step:"menu",data:{}};
      return message.reply(`📱 Send Money\nSender: ${name}\nReceiver: ${recv1._id}\nAmount: ${fmt(session.data.amount)}\nFee: ${fmt(fee1)}\nTxnID: ${txn1}\nStatus: ✅\nDate: ${nowStr()}\n-------------------\n${getMenu()}`);

    // --- Cash Out ---
    case "cash_amount":
      const amt2=Number(text);
      if(isNaN(amt2)||amt2<=0) return message.reply("❌ Invalid amount.");
      session.data.amount=amt2;
      session.step="cash_pin";
      userSessions[uid]=session;
      return message.reply("Enter PIN to confirm:");

    case "cash_pin":
      if(!await verifyPIN(db,uid,text)) return message.reply("❌ Incorrect PIN.");
      const fee2=computeFee(session.data.amount);
      if(user.balance<session.data.amount+fee2) return message.reply("❌ Insufficient balance including fee.");
      await performTransaction(db,uid,OWNER_UID,session.data.amount,fee2);
      const txn2=makeTxnId();
      userSessions[uid]={step:"menu",data:{}};
      return message.reply(`💵 Cash Out\nAmount: ${fmt(session.data.amount)}\nFee: ${fmt(fee2)}\nTxnID: ${txn2}\nStatus: ✅\nDate: ${nowStr()}\n-------------------\n${getMenu()}`);

    // --- Mobile Recharge ---
    case "recharge_mobile":
      session.data.mobile=text;
      session.step="recharge_amount";
      userSessions[uid]=session;
      return message.reply("Enter recharge amount:");

    case "recharge_amount":
      const amt3=Number(text);
      if(isNaN(amt3)||amt3<=0) return message.reply("❌ Invalid amount.");
      session.data.amount=amt3;
      session.step="recharge_pin";
      userSessions[uid]=session;
      return message.reply("Enter PIN to confirm:");

    case "recharge_pin":
      if(!await verifyPIN(db,uid,text)) return message.reply("❌ Incorrect PIN.");
      const fee3=computeFee(session.data.amount);
      if(user.balance<session.data.amount+fee3) return message.reply("❌ Insufficient balance including fee.");
      await performTransaction(db,uid,OWNER_UID,session.data.amount,fee3);
      const txn3=makeTxnId();
      userSessions[uid]={step:"menu",data:{}};
      return message.reply(`📱 Mobile Recharge\nMobile: ${session.data.mobile}\nAmount: ${fmt(session.data.amount)}\nFee: ${fmt(fee3)}\nTxnID: ${txn3}\nStatus: ✅\nDate: ${nowStr()}\n-------------------\n${getMenu()}`);

    // --- Bank Deposit ---
    case "bank_deposit":
      const amt4=Number(text);
      if(isNaN(amt4)||amt4<=0) return message.reply("❌ Invalid amount.");
      session.data.amount=amt4;
      session.step="bank_deposit_pin";
      userSessions[uid]=session;
      return message.reply("Enter PIN to confirm deposit:");

    case "bank_deposit_pin":
      if(!await verifyPIN(db,uid,text)) return message.reply("❌ Incorrect PIN.");
      const fee4=computeFee(session.data.amount);
      if(user.balance<session.data.amount+fee4) return message.reply("❌ Insufficient balance including fee.");
      await performTransaction(db,uid,OWNER_UID,session.data.amount,fee4);
      const txn4=makeTxnId();
      userSessions[uid]={step:"menu",data:{}};
      return message.reply(`🏦 Bank Deposit\nAmount: ${fmt(session.data.amount)}\nFee: ${fmt(fee4)}\nTxnID: ${txn4}\nStatus: ✅\nDate: ${nowStr()}\n-------------------\n${getMenu()}`);

    // --- Bank Withdraw ---
    case "bank_withdraw":
      const amt5=Number(text);
      if(isNaN(amt5)||amt5<=0) return message.reply("❌ Invalid amount.");
      session.data.amount=amt5;
      session.step="bank_withdraw_pin";
      userSessions[uid]=session;
      return message.reply("Enter PIN to confirm withdraw:");

    case "bank_withdraw_pin":
      if(!await verifyPIN(db,uid,text)) return message.reply("❌ Incorrect PIN.");
      const fee5=computeFee(session.data.amount);
      if(user.balance<session.data.amount+fee5) return message.reply("❌ Insufficient balance including fee.");
      await performTransaction(db,uid,OWNER_UID,session.data.amount,fee5);
      const txn5=makeTxnId();
      userSessions[uid]={step:"menu",data:{}};
      return message.reply(`🏦 Bank Withdraw\nAmount: ${fmt(session.data.amount)}\nFee: ${fmt(fee5)}\nTxnID: ${txn5}\nStatus: ✅\nDate: ${nowStr()}\n-------------------\n${getMenu()}`);

    // --- Reset PIN ---
    case "reset_pin":
      if(!/^\d{4}$/.test(text)) return message.reply("❌ PIN must be 4 digits.");
      await setPIN(db,uid,text);
      session.step="menu";
      userSessions[uid]=session;
      return message.reply("✅ PIN reset successful.\n"+getMenu());

    default:
      session.step="checkPIN";
      userSessions[uid]=session;
      return message.reply("❌ Session error. Enter PIN to start.");
  }
};
