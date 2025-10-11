const axios = require("axios");
const fs = require("fs-extra");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "pair5",
    countDown: 10,
    role: 0,
    author: "MH Imran 💞",
    shortDescription: {
      en: "Get to know your partner",
    },
    longDescription: {
      en: "Know your destiny and know who you will complete your life with",
    },
    category: "love",
    guide: {
      en: "{pn}",
    },
  },

  onStart: async function ({ api, message, event, usersData }) {
    try {
      const bgLink = "https://files.catbox.moe/ej4f81.png";

      let pathImg = __dirname + "/assets/background.png";
      let pathAvt1 = __dirname + "/assets/any.png";
      let pathAvt2 = __dirname + "/assets/avatar.png";

      var id1 = event.senderID;
      var name1 = await usersData.getName(id1);
      var ThreadInfo = await api.getThreadInfo(event.threadID);
      var all = ThreadInfo.userInfo;

      for (let c of all) if (c.id == id1) var gender1 = c.gender;

      const botID = api.getCurrentUserID();
      let ungvien = [];

      if (gender1 == "FEMALE") {
        for (let u of all)
          if (u.gender == "MALE" && u.id !== id1 && u.id !== botID)
            ungvien.push(u.id);
      } else if (gender1 == "MALE") {
        for (let u of all)
          if (u.gender == "FEMALE" && u.id !== id1 && u.id !== botID)
            ungvien.push(u.id);
      } else {
        for (let u of all)
          if (u.id !== id1 && u.id !== botID) ungvien.push(u.id);
      }

      var id2 = ungvien[Math.floor(Math.random() * ungvien.length)];
      var name2 = await usersData.getName(id2);

      var rd1 = Math.floor(Math.random() * 100) + 1;
      var tile = rd1;

      // 🧍‍♂️ Avatar download
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

      // 🔲 Background download
      let getbackground = (
        await axios.get(bgLink, { responseType: "arraybuffer" })
      ).data;
      fs.writeFileSync(pathImg, Buffer.from(getbackground, "utf-8"));

      // 🖌️ Draw image
      let baseImage = await loadImage(pathImg);
      let baseAvt1 = await loadImage(pathAvt1);
      let baseAvt2 = await loadImage(pathAvt2);

      let canvas = createCanvas(baseImage.width, baseImage.height);
      let ctx = canvas.getContext("2d");
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // ✅ Updated Avatar Positions
      ctx.drawImage(baseAvt1, 690, 623, 764, 830); // avatar 1
      ctx.drawImage(baseAvt2, 522, -78, 606, 598); // avatar 2

      // ✍️ Author name
      ctx.font = "bold 28px Sans-serif";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("Created by MH Imran 💫", canvas.width / 2, canvas.height - 40);

      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, imageBuffer);

      fs.removeSync(pathAvt1);
      fs.removeSync(pathAvt2);

      return api.sendMessage(
        {
          body: `💞 Congratulations ${name1} 💞\n❤️ Looks like your destiny brought you together with ${name2} ❤️\n🔗 Love percentage: ${tile}% 🔗\n\n👨‍💻 Author: MH Imran 💘`,
          mentions: [
            { tag: `${name1}`, id: id1 },
            { tag: `${name2}`, id: id2 },
          ],
          attachment: fs.createReadStream(pathImg),
        },
        event.threadID,
        () => fs.unlinkSync(pathImg),
        event.messageID
      );
    } catch (e) {
      console.error(e);
      message.reply("❌ Sorry, something went wrong!");
    }
  },
};
