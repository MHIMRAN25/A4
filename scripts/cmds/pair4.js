const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
 config: {
   name: "pair2",
   author: "imran",
   countDown: 10,
   role: 0,
   shortDescription: {
     en: "Get to know your partner",
   },
   longDescription : {
     en: "Know your destiny and know who you will complete your life with",
   },
   category: "love",
   guide: {
     en: "{pn}"
   }
 },
 onStart: async function ({ api, args, message, event, threadsData, usersData }) {
   const { loadImage, createCanvas } = require("canvas");
   let pathImg = __dirname + "/assets/background.png";
   let pathAvt1 = __dirname + "/assets/any.png";
   let pathAvt2 = __dirname + "/assets/avatar.png";

   var id1 = event.senderID;
   var name1 = await usersData.getName(id1);
   var ThreadInfo = await api.getThreadInfo(event.threadID);
   var all = ThreadInfo.userInfo
   for (let c of all) {
     if (c.id == id1) var gender1 = c.gender;
   };
   const botID = api.getCurrentUserID();
   let ungvien = [];
   if(gender1 == "FEMALE"){
     for (let u of all) {
       if (u.gender == "MALE") {
         if (u.id !== id1 && u.id !== botID) ungvien.push(u.id)
       }
     }
   }
   else if(gender1 == "MALE"){
     for (let u of all) {
       if (u.gender == "FEMALE") {
         if (u.id !== id1 && u.id !== botID) ungvien.push(u.id)
       }
     }
   }
   else {
     for (let u of all) {
       if (u.id !== id1 && u.id !== botID) ungvien.push(u.id)
     }
   }
   var id2 = ungvien[Math.floor(Math.random() * ungvien.length)];
   var name2 = await usersData.getName(id2);

   let getAvtmot = (
     await axios.get( `https://graph.facebook.com/${id1}/picture?width=322&height=337&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
     { responseType: "arraybuffer" }
     )
   ).data;
   fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot, "utf-8"));

   let getAvthai = (
     await axios.get( `https://graph.facebook.com/${id2}/picture?width=528&height=256&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
     { responseType: "arraybuffer" }
     )
   ).data;
   fs.writeFileSync(pathAvt2, Buffer.from(getAvthai, "utf-8"));

   let getbackground = (
     await axios.get("https://files.catbox.moe/yt23ss.png", {
       responseType: "arraybuffer",
     })
   ).data;
   fs.writeFileSync(pathImg, Buffer.from(getbackground, "utf-8"));

   let baseImage = await loadImage(pathImg);
   let baseAvt1 = await loadImage(pathAvt1);
   let baseAvt2 = await loadImage(pathAvt2);
   let canvas = createCanvas(baseImage.width, baseImage.height);
   let ctx = canvas.getContext("2d");
   ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

   // প্রথম avatar হার্ট শেইপে বসানো (x=41,y=50,width=322,height=337)
   ctx.drawImage(baseAvt1, 41, 50, 322, 337);
   // দ্বিতীয় avatar হার্ট শেইপে বসানো (x=0,y=256,width=528,height=256)
   ctx.drawImage(baseAvt2, 0, 256, 528, 256);

   // নিচের অংশ ব্লক করে পুরাতন লেখাগুলো নিশ্চিহ্ন করা
   ctx.fillStyle = "#f9d2cb";
   ctx.fillRect(200, 710, 1200, 100);

   // ইউজারদের নাম বসানো
   ctx.font = "bold 55px Arial";
   ctx.fillStyle = "#ffffff";
   ctx.textAlign = "center";

   ctx.fillText(name1, 600, 770);  // বামপাশের নাম
   ctx.fillText(name2, 1300, 770); // ডানপাশের নাম

   const imageBuffer = canvas.toBuffer();
   fs.writeFileSync(pathImg, imageBuffer);
   fs.removeSync(pathAvt1);
   fs.removeSync(pathAvt2);

   return api.sendMessage({
     body: `『💗』Congrats ${name1} and ${name2}!
💞 Your destiny brought you together!`,
     mentions: [{ tag: name2, id: id2 }, { tag: name1, id: id1 }],
     attachment: fs.createReadStream(pathImg)
   }, event.threadID, () => fs.unlinkSync(pathImg), event.messageID);
 }
};
