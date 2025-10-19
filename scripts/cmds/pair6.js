const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair6",
    author: "ɪᴍʀᴀɴ",
    role: 0,
    shortDescription: "Love pair photo generator",
    longDescription: "Creates a love match with mention, reply, or random opposite-gender partner.",
    category: "love",
    guide: "{pn} [@mention or reply or none]"
  },

  onStart: async function ({ api, event, args }) {
    api.setMessageReaction("💘", event.messageID, () => {}, true);

    const pathImg = __dirname + "/cache/love_match.png";
    const pathAvt1 = __dirname + "/cache/avt1.png";
    const pathAvt2 = __dirname + "/cache/avt2.png";

    const id1 = event.senderID;
    const threadInfo = await api.getThreadInfo(event.threadID);
    const all = threadInfo.userInfo;
    const botID = api.getCurrentUserID();

    // Determine target (mention > reply > random)
    let id2;

    if (Object.keys(event.mentions).length > 0) {
      id2 = Object.keys(event.mentions)[0];
    } else if (event.messageReply) {
      id2 = event.messageReply.senderID;
    } else {
      // Gender-based random
      let gender1;
      for (const u of all) if (u.id == id1) gender1 = u.gender;

      const candidates = all.filter(u =>
        u.id !== id1 &&
        u.id !== botID &&
        u.gender &&
        gender1 &&
        u.gender !== gender1
      );

      if (candidates.length === 0)
        return api.sendMessage("😅 Sorry! No opposite-gender match found.", event.threadID, event.messageID);

      id2 = candidates[Math.floor(Math.random() * candidates.length)].id;
    }

    // Background
    const bgUrl = "https://files.catbox.moe/lshthw.jpg";

    // Download avatars
    const getAvt1 = (await axios.get(
      `https://graph.facebook.com/${id1}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    )).data;
    fs.writeFileSync(pathAvt1, Buffer.from(getAvt1, "utf-8"));

    const getAvt2 = (await axios.get(
      `https://graph.facebook.com/${id2}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    )).data;
    fs.writeFileSync(pathAvt2, Buffer.from(getAvt2, "utf-8"));

    const getBackground = (await axios.get(bgUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathImg, Buffer.from(getBackground, "utf-8"));

    // Canvas
    const baseImage = await loadImage(pathImg);
    const baseAvt1 = await loadImage(pathAvt1);
    const baseAvt2 = await loadImage(pathAvt2);
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowBlur = 10;
    ctx.drawImage(baseAvt1, 717, 202, 303, 303);
    ctx.drawImage(baseAvt2, 1103, 510, 300, 303);

    const finalBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, finalBuffer);

    fs.removeSync(pathAvt1);
    fs.removeSync(pathAvt2);

    const mentions = [
      { tag: "You", id: id1 },
      { tag: "Your Match 💞", id: id2 }
    ];

    const percent = Math.floor(Math.random() * 100);

    return api.sendMessage(
      {
        body: `💞 𝗟𝗼𝘃𝗲 𝗣𝗮𝗶𝗿 𝗠𝗮𝘁𝗰𝗵 💞\n\n💑 ${mentions[0].tag} × ${mentions[1].tag}\n❤️ Compatibility: ${percent}%\n\n💬 “When hearts connect, magic happens.” 💫`,
        mentions,
        attachment: fs.createReadStream(pathImg)
      },
      event.threadID,
      () => fs.unlinkSync(pathImg),
      event.messageID
    );
  }
};
