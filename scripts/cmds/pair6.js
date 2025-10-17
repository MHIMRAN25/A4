const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair6",
    author: "imran",
    role: 0,
    shortDescription: "",
    longDescription: "",
    category: "love",
    guide: "{pn}",
  },
  onStart: async function ({ api, event }) {
    api.setMessageReaction("💝", event.messageID, (err) => {}, true);

    let pathImg = __dirname + "/cache/background.png";
    let pathAvt1 = __dirname + "/cache/Avtmot.png";
    let pathAvt2 = __dirname + "/cache/Avthai.png";

    // Sender info
    var id1 = event.senderID;
    var ThreadInfo = await api.getThreadInfo(event.threadID);
    var all = ThreadInfo.userInfo;
    for (let c of all) {
      if (c.id == id1) var gender1 = c.gender;
    }
    const botID = api.getCurrentUserID();
    let ungvien = [];

    if (gender1 == "FEMALE") {
      for (let u of all) {
        if (u.gender == "MALE" && u.id !== id1 && u.id !== botID) ungvien.push(u.id);
      }
    } else if (gender1 == "MALE") {
      for (let u of all) {
        if (u.gender == "FEMALE" && u.id !== id1 && u.id !== botID) ungvien.push(u.id);
      }
    } else {
      for (let u of all) {
        if (u.id !== id1 && u.id !== botID) ungvien.push(u.id);
      }
    }

    var id2 = ungvien[Math.floor(Math.random() * ungvien.length)];
    var name1 = ""; 
    var name2 = "Uff ksto ramro jodi 💋"; 
    var rd1 = Math.floor(Math.random() * 100) + 1;
    var tile = rd1;

    // Background link
    var background = ["https://files.catbox.moe/6e65tm.png"];
    var rd = background[Math.floor(Math.random() * background.length)];

    // Download images
    let getAvtmot = (
      await axios.get(`https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
        responseType: "arraybuffer",
      })
    ).data;
    fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot, "utf-8"));

    let getAvthai = (
      await axios.get(`https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
        responseType: "arraybuffer",
      })
    ).data;
    fs.writeFileSync(pathAvt2, Buffer.from(getAvthai, "utf-8"));

    let getbackground = (
      await axios.get(`${rd}`, {
        responseType: "arraybuffer",
      })
    ).data;
    fs.writeFileSync(pathImg, Buffer.from(getbackground, "utf-8"));

    // Load all
    let baseImage = await loadImage(pathImg);
    let baseAvt1 = await loadImage(pathAvt1);
    let baseAvt2 = await loadImage(pathAvt2);

    let canvas = createCanvas(baseImage.width, baseImage.height);
    let ctx = canvas.getContext("2d");

    // Background draw
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    // Circular avatar drawing function
    function drawCircularImage(ctx, img, x, y, size) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();
    }

    // Draw avatars in heart holes
    drawCircularImage(ctx, baseAvt1, 280, 275, 220); // Left circle
    drawCircularImage(ctx, baseAvt2, 640, 275, 220); // Right circle

    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);
    fs.removeSync(pathAvt1);
    fs.removeSync(pathAvt2);

    return api.sendMessage(
      {
        body: `🥰Successful pairing! ${name1} 💌 Wish you two hundred years of happiness 💕 ${name2}. — The odds are ${tile}%`,
        mentions: [{ tag: `${name2}`, id: id2 }],
        attachment: fs.createReadStream(pathImg),
      },
      event.threadID,
      () => fs.unlinkSync(pathImg),
      event.messageID
    );
  },
};
