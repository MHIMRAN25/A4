const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pair7",
    author: "Imran",
    role: 0,
    shortDescription: "Randomly pair two users 💞",
    longDescription: "Creates a fun love match card between two random users in the group.",
    category: "love",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    // React with a heart
    api.setMessageReaction("💝", event.messageID, () => {}, true);

    // File paths
    const pathImg = __dirname + "/cache/background.png";
    const pathAvt1 = __dirname + "/cache/avt1.png";
    const pathAvt2 = __dirname + "/cache/avt2.png";

    // Get sender info and group info
    const id1 = event.senderID;
    const ThreadInfo = await api.getThreadInfo(event.threadID);
    const all = ThreadInfo.userInfo;
    const botID = api.getCurrentUserID();

    // Sender user data
    const user1 = all.find(u => u.id === id1);
    const gender1 = user1?.gender || "UNKNOWN";

    // 🎯 Find partner (prefer opposite gender)
    let candidates = [];
    if (gender1 === "FEMALE")
      candidates = all.filter(u => u.gender === "MALE" && u.id !== id1 && u.id !== botID);
    else if (gender1 === "MALE")
      candidates = all.filter(u => u.gender === "FEMALE" && u.id !== id1 && u.id !== botID);
    else
      candidates = all.filter(u => u.id !== id1 && u.id !== botID);

    if (candidates.length === 0)
      return api.sendMessage("😅 No suitable partner found in this chat!", event.threadID, event.messageID);

    // Randomly pick a partner
    const partner = candidates[Math.floor(Math.random() * candidates.length)];
    const name1 = user1?.name || "User 1";
    const name2 = partner?.name || "User 2";

    // 🖼️ Download avatars
    const token = "6628568379|c1e620fa708a1d5696fb991c1bde5662";
    const getAvatar = async (id, path) => {
      const img = await axios.get(
        `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=${token}`,
        { responseType: "arraybuffer" }
      );
      fs.writeFileSync(path, Buffer.from(img.data, "utf-8"));
    };

    await Promise.all([
      getAvatar(id1, pathAvt1),
      getAvatar(partner.id, pathAvt2)
    ]);

    // 🌈 Download background
    const bgURL = "https://i.postimg.cc/ZYBTxDWw/received-677690628721083.png";
    const bgData = (await axios.get(bgURL, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(pathImg, Buffer.from(bgData, "utf-8"));

    // 🎨 Draw everything on canvas
    const base = await loadImage(pathImg);
    const avatar1 = await loadImage(pathAvt1);
    const avatar2 = await loadImage(pathAvt2);
    const canvas = createCanvas(base.width, base.height);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

    // Draw profile photos (your provided coordinates)
    ctx.drawImage(avatar1, 319, 355, 291, 301);
    ctx.drawImage(avatar2, 1021, 377, 291, 301);

    // ✨ Add text (names below avatars)
    ctx.font = "bold 38px Arial";
    ctx.fillStyle = "#ff4d6d"; // pink color
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 5;

    // Add names below each avatar
    ctx.fillText(name1, 319 + 145, 355 + 301 + 45);
    ctx.fillText(name2, 1021 + 145, 377 + 301 + 45);

    // Save final image
    const buffer = canvas.toBuffer();
    fs.writeFileSync(pathImg, buffer);

    // Random love percentage 💖
    const lovePercent = Math.floor(Math.random() * 100) + 1;

    // 💌 Send the final message
    api.sendMessage({
      body: `🥰 Successful pairing! 💞\n${name1} 💌 ${name2}\nLove Match: ${lovePercent}% ❤️`,
      mentions: [{ tag: name2, id: partner.id }],
      attachment: fs.createReadStream(pathImg)
    }, event.threadID, () => {
      fs.remove(pathImg);
      fs.remove(pathAvt1);
      fs.remove(pathAvt2);
    }, event.messageID);
  }
};
