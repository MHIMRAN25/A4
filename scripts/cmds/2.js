// bkash_full_dual_v5.js
// Full Dual Mode: Text + Button | GoatBot v2 compatible | PIN hashed | Cache JSON
// npm install bcrypt fs-extra

const fs = require("fs-extra");
const path = require("path");
const bcrypt = require("bcrypt");

// ---------------- Config / Metadata ----------------
module.exports = {
  config: {
    name: "2",
    aliases: ["2", "২", "BK"],
    version: "5.0",
    author: "Imran | GoatBot v2 Style",
    role: 0,
    category: "💰 Economy",
    shortDescription: "Offline bKash simulator (PIN hashed, file based).",
    longDescription: "Send Money, Cash Out, Recharge, Bank Deposit/Withdraw, History, Admin Panel with stylish receipt. Dual Text+Button mode.",
    guide: {
      en: "{pn} → show menu\n{pn} setpin <4-digit>\n{pn} <PIN> 1 <UID> <amt>\n{pn} <PIN> 2 <amt>\n{pn} <PIN> 3 <mobile> <amt>\n{pn} <PIN> 4 → balance\n{pn} <PIN> 5 <amt> → deposit\n{pn} <PIN> 6 <amt> → withdraw\n{pn} <PIN> 7 <newPIN> → reset\n{pn} <PIN> history\n{pn} <PIN> admin → owner only"
    }
  },

  onStart: async function({message, args, event}) { return; },

  run: async function({message, args, event}) {
    if(!message || !event) return console.error("Missing message/event object");

    const DATA_FILE = path.join(__dirname, "bKashData.json");
    if(!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE,"{}");
    const FEE_PERCENT = 1.5;
    const MIN_FEE = 2;
    const MAX_FEE = 100;
    const OWNER_UID = "100089926788317";
    const OWNER_NAME = "Imran";

    // ---------------- Utilities ----------------
    function fmt(n){ return `${Number(n).toLocaleString()} BDT`; }
    function nowStr(){ return new Date().toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}); }
    function computeFee(amount){ const raw=Math.ceil((amount*FEE_PERCENT)/100); return Math.max(MIN_FEE, Math.min(MAX_FEE, raw)); }
    function makeTxnId(){ return Math.random().toString(36).substring(2,10).toUpperCase(); }
    function receiptBox(title,lines=[],pin="<PIN>"){
      const safeLines = Array.isArray(lines)?lines.filter(l=>l && String(l).trim().length>0):[];
      if(safeLines.length===0) safeLines.push("No details available");
      const lineSep = "──────────────────────────";
      return [title,lineSep,...safeLines,lineSep,`Back to menu: .bkash ${pin}`].join("\n");
    }

    // ---------------- DB ----------------
    let db = JSON.parse(fs.readFileSync(DATA_FILE,"utf8") || "{}");
    const uid = String(event.senderID || message.senderID);
    const name = event.senderName || message.senderName || `User_${uid}`;

    if(!db[uid]) db[uid]={ name, balance:500, bank:0, history:[], pinHash:null };
    if(!db[OWNER_UID]) db[OWNER_UID]={ name:OWNER_NAME, balance:0, bank:0, history:[], pinHash:null };

    const tokens = (event.body||message.text||message.body||"").trim().split(/\s+/);
    const first = tokens[0];

    // ---------------- PIN ----------------
    async function setPIN(pin){ const hash = await bcrypt.hash(pin,10); db[uid].pinHash = hash; fs.writeFileSync(DATA_FILE,JSON.stringify(db,null,2),"utf8"); }
    async function verifyPIN(pin){ if(!db[uid].pinHash) return false; return bcrypt.compare(pin,db[uid].pinHash); }
    function hasPIN(){ return !!db[uid].pinHash; }

    try{
      // Set initial PIN
      if(!hasPIN()){
        const pinCandidate = tokens[1] || tokens[0];
        if(!pinCandidate || !/^\d{4}$/.test(pinCandidate)) return await message.reply("🔐 Set a 4-digit PIN first: .bkash 1234");
        await setPIN(pinCandidate); fs.writeFileSync(DATA_FILE,JSON.stringify(db,null,2),"utf8");
        return await message.reply("✅ PIN set successfully. Now use `.bkash <PIN>` to open menu.");
      }

      if(tokens.length<2) return await message.reply("🔐 Provide your 4-digit PIN. Example: .bkash 1234");
      const pin = tokens[1]; if(!/^\d{4}$/.test(pin)) return await message.reply("❌ PIN must be 4 digits.");
      const okPin = await verifyPIN(pin); if(!okPin) return await message.reply("❌ Incorrect PIN.");

      // ---------------- Menu ----------------
      if(tokens.length===2){
        const userObj = db[uid];
        const menuLines=[
          `💸 bKash Menu — ${userObj.name}`,
          `💰 Balance: ${fmt(userObj.balance)}`,
          `🏦 Bank  : ${fmt(userObj.bank)}`,
          `1️⃣ Send Money   → .bkash ${pin} 1 <UID> <amt>`,
          `2️⃣ Cash Out     → .bkash ${pin} 2 <amt>`,
          `3️⃣ Mobile Recharge→ .bkash ${pin} 3 <mobile> <amt>`,
          `4️⃣ Balance      → .bkash ${pin} 4`,
          `5️⃣ Bank Deposit → .bkash ${pin} 5 <amt>`,
          `6️⃣ Bank Withdraw→ .bkash ${pin} 6 <amt>`,
          `7️⃣ Reset PIN    → .bkash ${pin} 7 <newPIN>`,
          `📜 History      → .bkash ${pin} history`,
          uid===OWNER_UID ? `👑 Admin → .bkash ${pin} admin` : ""
        ].filter(Boolean).join("\n");
        return await message.reply(menuLines);
      }

      const option = tokens[2]?.toLowerCase() || "";
      const userObj = db[uid];

      // --- Send Money ---
      if(option==="1"||option==="send"){
        const receiver = tokens[3]; const amount = Number(tokens[4]);
        if(!receiver) return await message.reply("❌ Specify receiver UID.");
        if(!amount||isNaN(amount)||amount<=0) return await message.reply("❌ Invalid amount.");
        if(receiver===uid) return await message.reply("❌ Cannot send money to yourself.");
        const fee = computeFee(amount); const total = amount+fee;
        if(userObj.balance<total) return await message.reply(`❌ Not enough balance (fee included): ${fmt(total)}`);
        if(!db[receiver]) db[receiver]={ name:`User_${receiver}`, balance:0, bank:0, history:[], pinHash:null };
        db[uid].balance-=total; db[receiver].balance+=amount; db[OWNER_UID].balance+=fee;
        const txn = makeTxnId();
        userObj.history.unshift(`Sent ${fmt(amount)} to ${receiver} (Fee ${fmt(fee)}) Txn:${txn}`);
        db[receiver].history.unshift(`Received ${fmt(amount)} from ${uid} Txn:${txn}`);
        fs.writeFileSync(DATA_FILE,JSON.stringify(db,null,2),"utf8");
        return await message.reply(receiptBox("📱 Send Money Successful ✅",[
          `💳 Sender   : ${userObj.name} (${uid})`,
          `👤 Receiver : ${receiver}`,
          `💰 Amount   : ${fmt(amount)}`,
          `💸 Fee      : ${fmt(fee)}`,
          `🆔 TxnID    : ${txn}`,
          `🗓 Date     : ${nowStr()}`
        ],pin));
      }

      // --- Cash Out ---
      if(option==="2"||option==="cash"){
        const amount = Number(tokens[3]);
        if(!amount||isNaN(amount)||amount<=0) return await message.reply("❌ Invalid amount");
        const fee = computeFee(amount); const total=amount+fee;
        if(userObj.balance<total) return await message.reply("❌ Insufficient balance (fee included)");
        db[uid].balance-=total; db[OWNER_UID].balance+=total;
        const txn = makeTxnId(); userObj.history.unshift(`Cashed out ${fmt(amount)} (Fee ${fmt(fee)}) Txn:${txn}`);
        fs.writeFileSync(DATA_FILE,JSON.stringify(db,null,2),"utf8");
        return await message.reply(receiptBox("💵 Cash Out Successful ✅",[
          `💰 Amount   : ${fmt(amount)}`,
          `💸 Fee      : ${fmt(fee)}`,
          `🆔 TxnID    : ${txn}`,
          `🗓 Date     : ${nowStr()}`,
          `💳 Balance  : ${fmt(db[uid].balance)}`
        ],pin));
      }

      // --- Mobile Recharge ---
      if(option==="3"||option==="recharge"){
        const mobile = tokens[3]; const amount = Number(tokens[4]);
        if(!mobile) return await message.reply("❌ Provide mobile number");
        if(!amount||isNaN(amount)||amount<=0) return await message.reply("❌ Invalid amount");
        const fee = computeFee(amount); const total=amount+fee;
        if(userObj.balance<total) return await message.reply("❌ Insufficient balance (fee included)");
        db[uid].balance-=total; db[OWNER_UID].balance+=total;
        const txn=makeTxnId(); userObj.history.unshift(`Mobile recharge ${mobile} ${fmt(amount)} (Fee ${fmt(fee)}) Txn:${txn}`);
        fs.writeFileSync(DATA_FILE,JSON.stringify(db,null,2),"utf8");
        return await message.reply(receiptBox("📱 Mobile Recharge Successful ✅",[
          `📱 Mobile : ${mobile}`,
          `💰 Amount : ${fmt(amount)}`,
          `💸 Fee    : ${fmt(fee)}`,
          `🆔 TxnID  : ${txn}`,
          `🗓 Date  : ${nowStr()}`,
          `💳 Balance: ${fmt(db[uid].balance)}`
        ],pin));
      }

      // --- Balance ---
      if(option==="4"||option==="balance"){
        return await message.reply(receiptBox("💰 Your Balance",[
          `💵 Cash : ${fmt(db[uid].balance)}`,
          `🏦 Bank : ${fmt(db[uid].bank)}`
        ],pin));
      }

      // --- Bank Deposit ---
      if(option==="5"||option==="deposit"){
        const amount=Number(tokens[3]); if(!amount||isNaN(amount)||amount<=0) return await message.reply("❌ Invalid amount");
        if(userObj.balance<amount) return await message.reply("❌ Insufficient cash to deposit");
        db[uid].balance-=amount; db[uid].bank+=amount; const txn=makeTxnId();
        userObj.history.unshift(`Deposited ${fmt(amount)} to bank Txn:${txn}`); fs.writeFileSync(DATA_FILE,JSON.stringify(db,null,2),"utf8");
        return await message.reply(receiptBox("🏦 Bank Deposit Successful ✅",[
          `💵 Amount : ${fmt(amount)}`,
          `💳 Cash   : ${fmt(db[uid].balance)}`,
          `🏦 Bank   : ${fmt(db[uid].bank)}`,
          `🆔 TxnID  : ${txn}`,
          `🗓 Date   : ${nowStr()}`
        ],pin));
      }

      // --- Bank Withdraw ---
      if(option==="6"||option==="withdraw"){
        const amount=Number(tokens[3]); if(!amount||isNaN(amount)||amount<=0) return await message.reply("❌ Invalid amount");
        if(userObj.bank<amount) return await message.reply("❌ Insufficient bank balance");
        db[uid].bank-=amount; db[uid].balance+=amount; const txn=makeTxnId();
        userObj.history.unshift(`Withdrew ${fmt(amount)} from bank Txn:${txn}`); fs.writeFileSync(DATA_FILE,JSON.stringify(db,null,2),"utf8");
        return await message.reply(receiptBox("🏦 Bank Withdraw Successful ✅",[
          `💵 Amount : ${fmt(amount)}`,
          `💳 Cash   : ${fmt(db[uid].balance)}`,
          `🏦 Bank   : ${fmt(db[uid].bank)}`,
          `🆔 TxnID  : ${txn}`,
          `🗓 Date   : ${nowStr()}`
        ],pin));
      }

      // --- Reset PIN ---
      if(option==="7"||option==="reset"){
        const newPin = tokens[3]; if(!newPin||!/^\d{4}$/.test(newPin)) return await message.reply("❌ New PIN must be 4 digits");
        await setPIN(newPin); return await message.reply("✅ PIN reset successful. Use new PIN.");
      }

      // --- History ---
      if(option==="history"){
        const hist=db[uid]?.history?.slice(0,10).join("\n")||"No history";
        return await message.reply(receiptBox("📜 Last Transactions",[hist],pin));
      }

      // --- Admin / Owner Menu ---
      if(option==="admin"&&uid===OWNER_UID){
        const totalUsers = Object.keys(db).length;
        const totalBalance = Object.values(db).reduce((a,u)=>a+(u.balance||0)+(u.bank||0),0);
        return await message.reply(`👑 Admin Info\nUsers: ${totalUsers}\nTotal Balance: ${fmt(totalBalance)}`);
      }

      // --- Default ---
      return await message.reply("❌ Invalid option. Use: 1-send,2-cash,3-recharge,4-balance,5-deposit,6-withdraw,7-reset or history");

    }catch(e){ console.error("bkash command error:",e); try{await message.reply("❌ An error occurred. Please try again later.");}catch(err){console.error("Fallback message failed:",err);} }
  }
};
