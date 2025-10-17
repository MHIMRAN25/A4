const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair6",
    author: "imran",
    role: 0,
    shortDescription: "Love pair maker",
    longDescription: "Generate a love pair image with glowing heart frame",
    category: "love",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, args, usersData, threadsData }) {
    api.setMessageReaction("💝", event.messageID, (err) => {}, true);

    // Cache paths
    const pathImg = __dirname + "/cache/background.png";
    const pathAvt1 = __dirname + "/cache/Avtmot.png";
    const pathAvt2 = __dirname + "/cache/Avthai.png";

    // Get sender info
    const id1 = event.senderID;
    const ThreadInfo = await api.getThreadInfo(event.threadID);
    const all = ThreadInfo.userInfo;

    let gender1 = null;
    for (let c of all) {
      if (c.id == id1) gender1 = c.gender;
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

    const id2 = ungvien[Math.floor(Math.random() * ungvien.length)];

    const name1 = ""; 
    const name2 = "Uff ksto ramro jodi 💋"; 

    const rd1 = Math.floor(Math.random() * 100) + 1;
    const cc = ["0", "-1", "99,99", "-99", "-100", "101", "0,01"];
    const rd2 = cc[Math.floor(Math.random() * cc.length)];
    const djtme = [rd1, rd1, rd1, rd1, rd1, rd2, rd1, rd1, rd1, rd1];
    const tile = djtme[Math.floor(Math.random() * djtme.length)];

    const background = [
      "https://files.catbox.moe/6e65tm.png" // তোমার নতুন heart ফ্রেমের লিংক
    ];

    const rd = background[Math.floor(Math.random() * background.length)];

    // Get avatars
    const getAvtmot = (
      await axios.get(`https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
        responseType: "arraybuffer",
      })
    ).data;
    fs.writeFileSync(pathAvt1, Buffer.from(getAvtmot, "utf-8"));

    const getAvthai = (
      await axios.get(`https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, {
        responseType: "arraybuffer",
      })
    ).data;
    fs.writeFileSync(pathAvt2, Buffer.from(getAvthai, "utf-8"));

    const getbackground = (
      await axios.get(`${rd}`, { responseType: "arraybuffer" })
    ).data;
    fs.writeFileSync(pathImg, Buffer.from(getbackground, "utf-8"));

    // Load images
    const baseImage = await loadImage(pathImg);
    const baseAvt1 = await loadImage(pathAvt1);
    const baseAvt2 = await loadImage(pathAvt2);

    // Create canvas
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");

    // Draw background
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

    // Make circular clips for avatars
    ctx.save();
    ctx.beginPath();
    ctx.arc(430, 360, 110, 0, Math.PI * 2, true); // left circle center + radius
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(baseAvt1, 320, 250, 220, 220);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(720, 360, 110, 0, Math.PI * 2, true); // right circle center + radius
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(baseAvt2, 610, 250, 220, 220);
    ctx.restore();

    // Save final image
    const imageBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, imageBuffer);

    fs.removeSync(pathAvt1);
    fs.removeSync(pathAvt2);

    return api.sendMessage(
      {
        body: `🥰 Successful pairing! ${name1}\n💌 Wish you two hundred years of happiness 💕 ${name2}.\n— The odds are ${tile}%`,
        mentions: [{ tag: `${name2}`, id: id2 }],
        attachment: fs.createReadStream(pathImg),
      },
      event.threadID,
      () => fs.unlinkSync(pathImg),
      event.messageID
    );
  },
};
