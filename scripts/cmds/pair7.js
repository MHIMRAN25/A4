const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair7",
    author: "ɪᴍʀᴀɴ",
    role: 0,
    shortDescription: "Beautiful love pair card with fancy styled names",
    longDescription: "Creates a romantic couple card with user avatars and glowing fancy names below each photo.",
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
      // Find opposite gender
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

    // Random love percent
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

    // Background
    const bgUrl = "https://i.postimg.cc/ZYBTxDWw/received-677690628721083.png";
    const bgData = (await axios.get(bgUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathImg, Buffer.from(bgData, "utf-8"));

    // 🧠 Fancy name converter
    function toFancy(text) {
      const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
      const fancy =
        "𝓐𝓑𝓒𝓓𝓔𝓕𝓖𝓗𝓘𝓙𝓚𝓛𝓜𝓝𝓞𝓟𝓠𝓡𝓢𝓣𝓤𝓥𝓦𝓧𝓨𝓩" +
        "𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃";
      return text
        .split("")
        .map(c => {
          const i = normal.indexOf(c);
          return i >= 0 ? fancy[i] : c;
        })
        .join("");
    }

    const fancyName1 = toFancy(name1);
    const fancyName2 = toFancy(name2);

    // Draw everything
    const base = await loadImage(pathImg);
    const avatar1 = await loadImage(pathAvt1);
    const avatar2 = await loadImage(pathAvt2);
    const canvas = createCanvas(base.width, base.height);
    const ctx = canvas.getContext("2d");

    ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

    // Avatars
    ctx.drawImage(avatar1, 109, 160, 318, 329);
    ctx.drawImage(avatar2, 851, 160, 318, 319);

    // ✨ Fancy names with glow effect
    ctx.font = "bold 52px 'Arial Black', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(255, 105, 180, 0.8)"; // pink glow
    ctx.shadowBlur = 18;

    ctx.fillText(fancyName1, 109 + 320 / 2, 160 + 321 + 60);
    ctx.fillText(fancyName2, 851 + 320 / 2, 160 + 320 + 60);

    const buffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, buffer);

    // Clean
    fs.removeSync(pathAvt1);
    fs.removeSync(pathAvt2);

    // ✅ Normal message body
    return api.sendMessage(
      {
        body: `🥰 Successful pairing! ${name1} 💌 Wish you two hundred years of happiness 💕 ${name2}.\n— The odds are ${lovePercent}% ❤️`,
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
