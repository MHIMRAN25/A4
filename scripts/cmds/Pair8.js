const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair8",
    author: "ɪᴍʀᴀɴ",
    role: 0,
    shortDescription: "Pair match photo generator (Landscape 1280x640)",
    longDescription: "Creates a love pair photo with mention or random match in landscape view",
    category: "love",
    guide: "{pn} [@mention (optional)]"
  },

  onStart: async function ({ api, event, args }) {
    api.setMessageReaction("💝", event.messageID, () => {}, true);

    // Paths
    const pathImg = __dirname + "/cache/background.png";
    const pathAvt1 = __dirname + "/cache/avt1.png";
    const pathAvt2 = __dirname + "/cache/avt2.png";

    const id1 = event.senderID;
    const threadInfo = await api.getThreadInfo(event.threadID);
    const all = threadInfo.userInfo;
    const botID = api.getCurrentUserID();

    // User gender
    let gender1;
    for (const u of all) if (u.id == id1) gender1 = u.gender;

    // Opposite gender filter
    const candidates = all.filter(u => 
      u.id !== id1 && u.id !== botID && u.gender && gender1 && u.gender !== gender1
    );

    if (candidates.length === 0) {
      return api.sendMessage("😅 Sorry! No suitable match found.", event.threadID, event.messageID);
    }

    // Mention or random match
    let id2;
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      id2 = Object.keys(event.mentions)[0];
    } else {
      id2 = candidates[Math.floor(Math.random() * candidates.length)].id;
    }

    // 🌈 Premium background links (direct)
    const backgrounds = [
      "https://i.postimg.cc/ZYBTxDWw/received-677690628721083.png",
      "https://i.postimg.cc/6qxNZDfG/love-bg-soft-hearts.png",
      "https://i.postimg.cc/FRcCRqVg/love-bg-sunset-couple.png",
      "https://i.postimg.cc/NMPTN0nv/love-bg-valentine-red.png",
      "https://i.postimg.cc/pdb47vYg/love-bg-dreamy-pink.png",
      "https://i.postimg.cc/T1yVL0db/love-bg-dark-hearts.png"
    ];
    const bgUrl = backgrounds[Math.floor(Math.random() * backgrounds.length)];

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

    // Download background
    const getBackground = (await axios.get(bgUrl, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathImg, Buffer.from(getBackground, "utf-8"));

    // Canvas setup
    const canvasWidth = 1280;
    const canvasHeight = 640;
    const baseImage = await loadImage(pathImg);
    const baseAvt1 = await loadImage(pathAvt1);
    const baseAvt2 = await loadImage(pathAvt2);
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    // Draw background (fit to 1280x640)
    ctx.drawImage(baseImage, 0, 0, canvasWidth, canvasHeight);

    // Shadow for avatars
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 15;

    // Avatar positions for landscape
    ctx.drawImage(baseAvt1, 180, 150, 280, 280);
    ctx.drawImage(baseAvt2, 820, 150, 280, 280);

    // Output buffer
    const finalBuffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, finalBuffer);

    // Cleanup
    fs.removeSync(pathAvt1);
    fs.removeSync(pathAvt2);

    // Send message
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
