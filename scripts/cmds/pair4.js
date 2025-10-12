const axios = require("axios");
const fs = require("fs-extra");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "pair4",
    author: "imran",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Get to know your partner" },
    longDescription: { en: "Know your destiny and who will complete your life with" },
    category: "love",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event, usersData }) {
    try {
      const pathImg = __dirname + "/assets/background.png";
      const pathAvt1 = __dirname + "/assets/avt1.png";
      const pathAvt2 = __dirname + "/assets/avt2.png";

      const id1 = event.senderID;
      const name1 = await usersData.getName(id1);

      const ThreadInfo = await api.getThreadInfo(event.threadID);
      const all = ThreadInfo.userInfo;

      let gender1 = "";
      for (let c of all) {
        if (c.id === id1) { gender1 = c.gender; break; }
      }

      const botID = api.getCurrentUserID();

      // find pair candidate
      let candidates = [];
      if (gender1 === "FEMALE") {
        candidates = all.filter(u => u.gender === "MALE" && u.id !== id1 && u.id !== botID).map(u => u.id);
      } else if (gender1 === "MALE") {
        candidates = all.filter(u => u.gender === "FEMALE" && u.id !== id1 && u.id !== botID).map(u => u.id);
      } else {
        candidates = all.filter(u => u.id !== id1 && u.id !== botID).map(u => u.id);
      }

      if (candidates.length === 0) {
        return api.sendMessage("No matching pairs found.", event.threadID);
      }

      const id2 = candidates[Math.floor(Math.random() * candidates.length)];
      const name2 = await usersData.getName(id2);

      const backgroundURL = "https://files.catbox.moe/yt23ss.png";

      // fetch avatars
      const avatar1 = (
        await axios.get(`https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })
      ).data;
      fs.writeFileSync(pathAvt1, Buffer.from(avatar1));

      const avatar2 = (
        await axios.get(`https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })
      ).data;
      fs.writeFileSync(pathAvt2, Buffer.from(avatar2));

      // fetch background
      const bg = (
        await axios.get(backgroundURL, { responseType: "arraybuffer" })
      ).data;
      fs.writeFileSync(pathImg, Buffer.from(bg));

      // load images
      const baseImage = await loadImage(pathImg);
      const baseAvt1 = await loadImage(pathAvt1);
      const baseAvt2 = await loadImage(pathAvt2);

      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      // draw background
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // draw avatars in heart-shape (approximate)
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(160, 200);
      ctx.bezierCurveTo(160, 100, 400, 100, 400, 200);
      ctx.bezierCurveTo(400, 300, 160, 300, 160, 200);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(baseAvt1, 0, 0, 400, 400);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(560, 200);
      ctx.bezierCurveTo(560, 100, 800, 100, 800, 200);
      ctx.bezierCurveTo(800, 300, 560, 300, 560, 200);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(baseAvt2, 0, 0, 400, 400);
      ctx.restore();

      // draw names
      ctx.font = "bold 55px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(name1, canvas.width * 0.25, canvas.height - 100);
      ctx.fillText(name2, canvas.width * 0.75, canvas.height - 100);

      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, imageBuffer);

      // clean avatars
      fs.removeSync(pathAvt1);
      fs.removeSync(pathAvt2);

      // send message
      return api.sendMessage(
        {
          body: `💗 Congratulations ${name1} & ${name2}! Your destiny brought you together!`,
          mentions: [{ tag: name2, id: id2 }, { tag: name1, id: id1 }],
          attachment: fs.createReadStream(pathImg)
        },
        event.threadID,
        (err) => {
          fs.unlinkSync(pathImg);
          if(err) console.log("Send message error:", err);
        }
      );

    } catch (error) {
      console.error("Error in pair4 command:", error);
      return api.sendMessage("Sorry, something went wrong. Please try again later.", event.threadID);
    }
  }
};
