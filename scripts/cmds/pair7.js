const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair7",
    author: "ɪᴍʀᴀɴ",
    role: 0,
    shortDescription: "Pair match photo generator",
    longDescription: "Creates a love pair photo with random match",
    category: "love",
    guide: "{pn}"
  },

  onStart: async function ({ api, event, args }) {
    api.setMessageReaction("💝", event.messageID, () => {}, true);

    // Path setup
    const pathImg = __dirname + "/cache/background.png";
    const pathAvt1 = __dirname + "/cache/avt1.png";
    const pathAvt2 = __dirname + "/cache/avt2.png";

    // Get sender ID and random match
    const id1 = event.senderID;
    const threadInfo = await api.getThreadInfo(event.threadID);
    const all = threadInfo.userInfo;
    const botID = api.getCurrentUserID();

    // Find gender
    let gender1;
    for (const u of all) {
      if (u.id == id1) gender1 = u.gender;
    }

    // Filter opposite gender (no same gender match)
    const candidates = all.filter(u => 
      u.id !== id1 &&
      u.id !== botID &&
      u.gender &&
      gender1 &&
      u.gender !== gender1
    );

    if (candidates.length === 0) {
      return api.sendMessage("😅 Sorry! No suitable match found.", event.threadID, event.messageID);
    }

    // Pick random partner
    const id2 = candidates[Math.floor(Math.random() * candidates.length)].id;

    // Background image (you can add more later)
    const bgUrl = "https://i.postimg.cc/ZYBTxDWw/received-677690628721083.png";

    // Download images
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

    // Create canvas
    const baseImage = await loadImage(pathImg);
    const baseAvt1 = await loadImage(pathAvt1);
    const baseAvt2 = await loadImage(pathAvt2);
    const canvas = createCanvas(baseImage.width, baseImage.height);
    const ctx = canvas.getContext("2d");

    // Draw background and avatars
    ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseAvt1, 120,170,300,300);
    ctx.drawImage(baseAvt2, 861, 170, 300, 300);

    // Optional: soft shadow under avatars (for better depth)
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 10;

    const finalBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, finalBuffer);

    // Cleanup
    fs.removeSync(pathAvt1);
    fs.removeSync(pathAvt2);

    // Send final message
    return api.sendMessage(
      {
        body: `🥰 Successful pairing! 💌 Wishing you two hundred years of happiness 💕\n— The odds are ${Math.floor(Math.random() * 100)}%`,
        mentions: [{ tag: "Your Match", id: id2 }],
        attachment: fs.createReadStream(pathImg)
      },
      event.threadID,
      () => fs.unlinkSync(pathImg),
      event.messageID
    );
  }
};
