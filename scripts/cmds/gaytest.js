const fs = require("fs-extra");
const path = require("path");
const Canvas = require("canvas");
const { getPrefix } = global.utils;

module.exports = {
  config: {
    name: "gaytest",
    version: "1.2",
    author: "MH-TEAM",
    role: 0,
    shortDescription: { en: "Fun gay test meter with avatar" },
    longDescription: { en: "Shows a personalized rainbow meter with user avatar" },
    category: "fun",
    guide: { en: "{pn} <tag or reply user>" },
  },

  onStart: async function({ message, args, event, api }) {
    const prefix = getPrefix(event.threadID);

    // 1️⃣ Get target user ID from tag or reply
    let userID;
    if (event.messageReply) userID = event.messageReply.senderID;
    else if (args[0]) userID = args[0].replace(/[^0-9]/g, "");
    else return message.reply(`😂 Tag a user or reply to their message.\nUsage: ${prefix}gaytest @user`);

    const avatarURL = `https://graph.facebook.com/${userID}/picture?type=large`;

    // 2️⃣ Random gay percentage
    const percentage = Math.floor(Math.random() * 101);

    // 3️⃣ Canvas setup
    const canvas = Canvas.createCanvas(400, 200);
    const ctx = canvas.getContext("2d");

    // Background (dark premium)
    ctx.fillStyle = "#0f0f0f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rainbow bar
    const barWidth = 300;
    const barHeight = 30;
    const barX = 50;
    const barY = 150;
    ctx.fillStyle = "#222";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    const rainbowColors = ["#FF0000","#FF7F00","#FFFF00","#00FF00","#0000FF","#4B0082","#8F00FF"];
    const filledWidth = (percentage / 100) * barWidth;
    for (let i = 0; i < rainbowColors.length; i++) {
      ctx.fillStyle = rainbowColors[i];
      ctx.fillRect(barX + (i * filledWidth / rainbowColors.length), barY, filledWidth / rainbowColors.length, barHeight);
    }

    // Draw avatar
    try {
      const avatar = await Canvas.loadImage(avatarURL);
      ctx.save();
      ctx.beginPath();
      ctx.arc(100, 75, 50, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 50, 25, 100, 100);
      ctx.restore();
    } catch (e) {
      console.log("Avatar fetch failed, skipping avatar overlay.");
    }

    // Text overlay
    ctx.fillStyle = "#FFD700";
    ctx.font = "20px Arial";
    ctx.fillText(`🌈 Gay Test Meter: ${percentage}%`, 50, 120);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "16px Arial";
    let comment = "";
    if (percentage > 80) comment = "🌈 Full rainbow vibes!";
    else if (percentage > 50) comment = "💖 Pretty gay!";
    else if (percentage > 20) comment = "😏 Some gay vibes!";
    else comment = "😎 Totally straight vibes!";
    ctx.fillText(comment, 50, 180);

    // Send result
    const buffer = canvas.toBuffer();
    await message.reply({ body: `👑 Gay Test Meter\n💌 Author: MH-TEAM`, attachment: buffer });
  }
};
