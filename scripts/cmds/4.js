const fs = require("fs-extra");
const path = require("path");
const bcrypt = require("bcrypt");

// ---------------- Config ----------------
const DATA_FILE = path.join(__dirname, "bKashData.json");
const FEE_PERCENT = 1.5;
const MIN_FEE = 2;
const MAX_FEE = 100;
const OWNER_UID = "100089926788317";
const OWNER_NAME = "Imran";

// ---------------- Safe reply ----------------
async function safeReply(messageObj, text){
  if(!text || !String(text).trim()) text = "✅ Done";
  try {
    await messageObj.reply(text);
  } catch(e){
    console.error("[SafeReply] Failed:", e);
  }
}

// ---------------- Utilities ----------------
function computeFee(amount){
  const fee = Math.ceil((amount * FEE_PERCENT)/100);
  return Math.max(MIN_FEE, Math.min(MAX_FEE, fee));
}
function nowStr(){
  return new Date().toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
}
function fmt(n){ return `${Number(n).toLocaleString()} BDT`; }
function makeTxnId(){ return Math.random().toString(36).substring(2,10).toUpperCase(); }

// ---------------- Smart Cache ----------------
let dbCache = null;
function readAll(){
  if(!dbCache){
    try{
      if(!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE,"{}");
      dbCache = JSON.parse(fs.readFileSync(DATA_FILE,"utf8")||"{}");
      console.log("[Cache] Data loaded");
    }catch(e){ console.error("[Cache] Load failed:",e); dbCache={}; }
  }
  return dbCache;
}
function writeAll(obj){
  dbCache = obj;
  try{
    fs.writeFileSync(DATA_FILE,JSON.stringify(dbCache,null,2),"utf8");
    console.log("[Cache] Data saved");
  }catch(e){ console.error("[Cache] Save failed:",e); }
}

// ---------------- PIN ----------------
async function setPIN(uid,pin){
  const db = readAll();
  const hash = await bcrypt.hash(pin,10);
  if(!db[uid]) db[uid]={};
  db[uid].pinHash = hash;
  if(db[uid].balance===undefined) db[uid].balance=500;
  if(db[uid].bank===undefined) db[uid].bank=0;
  if(!db[uid].history) db[uid].history=[];
  writeAll(db);
}
async function verifyPIN(uid,pin){
  const db = readAll();
  if(!db[uid] || !db[uid].pinHash) return false;
  return bcrypt.compare(pin,db[uid].pinHash);
}
function hasPIN(uid){
  const db = readAll();
  return !!(db[uid] && db[uid].pinHash);
}

// ---------------- User Data ----------------
function ensureUser(uid,name="User"){
  const db = readAll();
  if(!db[uid]){
    db[uid]={name,balance:500,bank:0,history:[]};
    writeAll(db);
  }
  return db[uid];
}
function pushHistory(uid,text){
  const db = readAll();
  if(!db[uid]) db[uid]={balance:500,bank:0,history:[]};
  db[uid].history = db[uid].history||[];
  db[uid].history.unshift(`[${nowStr()}] ${text}`);
  db[uid].history=db[uid].history.slice(0,50);
  writeAll(db);
}

// ---------------- Receipt ----------------
function receiptBox(title,lines=[],pin="<PIN>"){
  const safeLines = Array.isArray(lines)? lines.filter(l=>l && String(l).trim().length>0):[];
  if(safeLines.length===0) safeLines.push("No details available");
  const lineSep="──────────────────────────";
  return [title,lineSep,...safeLines,lineSep,`Back to menu: .bkash ${pin}`].join("\n");
}

// ---------------- Module Export ----------------
module.exports={
  config:{
    name:"4",
    aliases:["4","5"],
    version:"4.0",
    author:"Imran | GoatBot v2 Style",
    role:0,
    shortDescription:"Offline bKash simulator (PIN hashed, file based).",
    longDescription:"Send Money, Cash Out, Recharge, Bank Deposit/Withdraw, History, Admin Panel with receipt style. Safe dual Text+Button mode.",
    category:"💰 Economy",
    guide:{
      en:"{pn} → show menu\n{pn} setpin <4-digit>\n{pn} <PIN> 1 <UID> <amt>\n{pn} <PIN> 2 <amt>\n{pn} <PIN> 3 <mobile> <amt>\n{pn} <PIN> balance"
    }
  },

  onStart: async function({message,event,args}){ return; },

  run: async function({message,event,args}){
    try{
      if(!message||!event) return console.error("[BKash] Missing message/event");

      const uid = String(event.senderID||message.senderID);
      const name = event.senderName||message.senderName||`User_${uid}`;
      ensureUser(uid,name);

      const db = readAll();
      ensureUser(OWNER_UID,OWNER_NAME);

      const body = event.body||message.text||"";
      const tokens = body.trim().split(/\s+/);

      // ---------- Set PIN ----------
      if(!hasPIN(uid)){
        const pinCandidate = tokens[1]||tokens[0];
        if(!pinCandidate||!/^\d{4}$/.test(pinCandidate)) return safeReply(message,"🔐 Set a 4-digit PIN first: .bkash 1234");
        await setPIN(uid,pinCandidate);
        return safeReply(message,"✅ PIN set successfully. Now use `.bkash <PIN>` to open menu.");
      }

      if(tokens.length<2) return safeReply(message,"🔐 Provide your 4-digit PIN. Example: .bkash 1234");

      const pin = tokens[1];
      if(!/^\d{4}$/.test(pin)) return safeReply(message,"❌ PIN must be 4 digits.");
      const okPin = await verifyPIN(uid,pin);
      if(!okPin) return safeReply(message,"❌ Incorrect PIN.");

      const userObj = db[uid];

      // ---------- Menu ----------
      if(tokens.length===2){
        const menuLines = [
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
          `📜 History      → .bkash ${pin} history`,
          uid===OWNER_UID?`👑 Admin → .bkash ${pin} admin`:""
        ].filter(Boolean).join("\n");
        return safeReply(message,menuLines);
      }

      const option = tokens[2]?.toLowerCase()||"";

      // ---------------- Command Cases ----------------
      if(option==="1"||option==="send"){
        const receiver = tokens[3];
        const amount = Number(tokens[4]);
        if(!receiver||!amount||amount<=0) return safeReply(message,"❌ Invalid receiver or amount.");
        if(receiver===uid) return safeReply(message,"❌ Cannot send to yourself.");
        const fee = computeFee(amount);
        const total = amount+fee;
        if(userObj.balance<total) return safeReply(message,`❌ Not enough balance (fee included: ${fmt(total)})`);

        ensureUser(receiver,`User_${receiver}`);
        db[uid].balance-=total;
        db[receiver].balance=(db[receiver].balance||0)+amount;
        db[OWNER_UID].balance=(db[OWNER_UID].balance||0)+fee;
        writeAll(db);

        const txn = makeTxnId();
        pushHistory(uid,`Sent ${fmt(amount)} to ${receiver} (Fee ${fmt(fee)}) Txn:${txn}`);
        pushHistory(receiver,`Received ${fmt(amount)} from ${uid} Txn:${txn}`);

        const textSend = receiptBox("📱 Send Money Successful ✅",[
          `💳 Sender   : ${userObj.name} (${uid})`,
          `👤 Receiver : ${receiver}`,
          `💰 Amount   : ${fmt(amount)}`,
          `💸 Fee      : ${fmt(fee)}`,
          `🆔 TxnID    : ${txn}`,
          `🗓 Date     : ${nowStr()}`
        ],pin);

        return safeReply(message,textSend);
      }

      // --- Other commands: Cash Out, Bank Deposit/Withdraw, History, Reset PIN, Admin --- 
      // (Structure same as Send Money: verify input, update balances, push history, safeReply with receiptBox)
      // You can add them using similar pattern

    }catch(e){
      console.error("[BKash] Run error:",e);
      await safeReply(message,"❌ An error occurred. Check console log.");
    }
  }
};
