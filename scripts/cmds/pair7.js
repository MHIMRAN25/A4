const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair7",
    author: "Imran",
    role: 0,
    shortDescription: "Pair with a specific or random opposite gender user",
    longDescription: "Creates a couple image with both profile pictures and names below them",
    category: "love",
    guide: "{pn} or {pn} @mention",
  },

  onStart: async function ({ api, event, args }) {
    api.setMessageReaction("💞", event.messageID, () => {}, true);

    const pathImg = __dirname + "/cache/bg.png";
    const pathAvt1 = __dirname + "/cache/avt1.png";
    const pathAvt2 = __dirname + "/cache/avt2.png";

    const id1 = event.senderID;
    const name1 = (await api.getUserInfo(id1))[id1].name;

    const ThreadInfo = await api.getThreadInfo(event.threadID);
    const allUsers = ThreadInfo.userInfo;
    const botID = api.getCurrentUserID();

    // Mention check
    let id2;
    if (Object.keys(event.mentions).length > 0) {
      id2 = Object.keys(event.mentions)[0];
    } else {
      // find opposite gender
      let gender1 = allUsers.find(u => u.id == id1)?.gender;
      let candidates = allUsers.filter(u => u.id !== id1 && u.id !== botID);
      if (gender1 === "MALE") candidates = candidates.filter(u => u.gender === "FEMALE");
      else if (gender1 === "FEMALE") candidates = candidates.filter(u => u.gender === "MALE");

      if (candidates.length === 0) {
        return api.sendMessage("😅 No suitable opposite gender found!", event.threadID, event.messageID);
      }
      id2 = candidates[Math.floor(Math.random() * candidates.length)].id;
    }

    const name2 = (await api.getUserInfo(id2))[id2].name;

    // Love percent
    const lovePercent = Math.floor(Math.random() * 100) + 1;

    // Download avatars
    const avt1 = (
      await axios.get(
        `https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )
    ).data;
    fs.writeFileSync(pathAvt1, Buffer.from(avt1, "utf-8"));

    const avt2 = (
      await axios.get(
        `https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
        { responseType: "arraybuffer" }
      )
    ).data;
    fs.writeFileSync(pathAvt2, Buffer.from(avt2, "utf-8"));

    // Background (your chosen PNG)
    const bgUrl = "https://i.postimg.cc/ZYBTxDWw/received-677690628721083.png"; // replace if you want
    const bgData = (await axios.get(bgUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathImg, Buffer.from(bgData, "utf-8"));

    // Draw all on canvas
    const base = await loadImage(pathImg);
    const avatar1 = await loadImage(pathAvt1);
    const avatar2 = await loadImage(pathAvt2);
    const canvas = createCanvas(base.width, base.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

    // Avatars position
    ctx.drawImage(avatar1, 109, 160, 320, 321);
    ctx.drawImage(avatar2, 851, 160, 320, 320);

    // Names under avatars
    ctx.font = "bold 35px Arial";
    ctx.fillStyle = "#ff4d6d";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 8;

    ctx.fillText(name1, 109 + 320 / 2, 160 + 321 + 45);
    ctx.fillText(name2, 851 + 320 / 2, 160 + 320 + 45);

    const buffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, buffer);

    fs.removeSync(pathAvt1);
    fs.removeSync(pathAvt2);

    return api.sendMessage(
      {
        body: `💞 Love Match 💞\n${name1} ❤️ ${name2}\nCompatibility: ${lovePercent}% 💘`,
        mentions: [
          { tag: name1, id: id1 },
          { tag: name2, id: id2 },
        ],
        attachment: fs.createReadStream(pathImg),
      },
      event.threadID,
      () => fs.unlinkSync(pathImg),
      event.messageID
    );
  },
};
