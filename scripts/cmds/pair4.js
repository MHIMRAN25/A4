const axios = require("axios");
const fs = require("fs-extra");
module.exports = {
 config: {
   name: "pair4",
   countDown: 10,
   role: 0,
   shortDescription: {
     en: "Get to know your partner",
   },
   longDescription: {
     en: "Know your destiny and know who you will complete your life with",
   },
   category: "love",
   guide: {
     en: "{pn}"
   }
 },
 onStart: async function ({ api, args, message, event, threadsData, usersData }) {
   const { loadImage, createCanvas } = require("canvas");

   // === Paths ===
   let pathImg = __dirname + "/assets/background.png";
   let pathAvt1 = __dirname + "/assets/any.png";
   let pathAvt2 = __dirname + "/assets/avatar.png";

   // === User Data ===
   var id1 = event.senderID;
   var name1 = await usersData.getName(id1);
   var ThreadInfo = await api.getThreadInfo(event.threadID);
   var all = ThreadInfo.userInfo;
   for (let c of all) if (c.id == id1) var gender1 = c.gender;

   const botID = api.getCurrentUserID();
   let candidates = [];

   if (gender1 == "FEMALE") {
     for (let u of all)
       if (u.gender == "MALE" && u.id !== id1 && u.id !== botID)
         candidates.push(u.id);
   } else if (gender1 == "MALE") {
     for (let u of all)
       if (u.gender == "FEMALE" && u.id !== id1 && u.id !== botID)
         candidates.push(u.id);
   } else {
     for (let u of all)
       if (u.id !== id1 && u.id !== botID) candidates.push(u.id);
   }

   var id2 = candidates[Math.floor(Math.random() * candidates.length)];
   var name2 = await usersData.getName(id2);

   // === Random percentage ===
   var rd1 = Math.floor(Math.random() * 100) + 1;
   var cc = ["0", "-1", "99,99", "-99", "-100", "101", "0,01"];
   var rd2 = cc[Math.floor(Math.random() * cc.length)];
   var djtme = [`${rd1}`, `${rd1}`, `${rd1}`, `${rd1}`, `${rd1}`, `${rd2}`];
   var tile = djtme[Math.floor(Math.random() * djtme.length)];

   // === Background ===
   var background = ["https://files.catbox.moe/yt23ss.png"];

   let getAvt1 = (
     await axios.get(
       `https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
       { responseType: "arraybuffer" }
     )
   ).data;
   fs.writeFileSync(pathAvt1, Buffer.from(getAvt1, "utf-8"));

   let getAvt2 = (
     await axios.get(
       `https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
       { responseType: "arraybuffer" }
     )
   ).data;
   fs.writeFileSync(pathAvt2, Buffer.from(getAvt2, "utf-8"));

   let getBackground = (
     await axios.get(`${background}`, { responseType: "arraybuffer" })
   ).data;
   fs.writeFileSync(pathImg, Buffer.from(getBackground, "utf-8"));

   // === Canvas ===
   let baseImage = await loadImage(pathImg);
   let baseAvt1 = await loadImage(pathAvt1);
   let baseAvt2 = await loadImage(pathAvt2);

   let canvas = createCanvas(baseImage.width, baseImage.height);
   let ctx = canvas.getContext("2d");
   ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

   // ✅ Accurate heart positions (from Imran)
   ctx.drawImage(baseAvt1, 155, 140, 370, 420); // Left heart
   ctx.drawImage(baseAvt2, 625, 140, 370, 420); // Right heart

   // 💬 Author name
   ctx.font = "bold 28px Sans-serif";
   ctx.fillStyle = "white";
   ctx.textAlign = "center";
   ctx.fillText("Created by Imran 💫", canvas.width / 2, canvas.height - 40);

   const imageBuffer = canvas.toBuffer();
   fs.writeFileSync(pathImg, imageBuffer);
   fs.removeSync(pathAvt1);
   fs.removeSync(pathAvt2);

   return api.sendMessage(
     {
       body: `『💗』Congratulations ${name1}『💗』\n『❤️』Looks like your destiny brought you together with ${name2}『❤️』\n『🔗』Your link percentage is ${tile}%『🔗』\n\n👨‍🎨 Author: Imran`,
       mentions: [
         { tag: `${name2}`, id: id2 },
         { tag: `${name1}`, id: id1 },
       ],
       attachment: fs.createReadStream(pathImg),
     },
     event.threadID,
     () => fs.unlinkSync(pathImg),
     event.messageID
   );
 },
};
