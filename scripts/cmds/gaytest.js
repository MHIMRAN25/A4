const fs = require("fs-extra");
const Canvas = require("canvas");
const { getPrefix } = global.utils;

module.exports = {
  config: {
    name: "gaytest",
    version: "1.4",
    author: "MH-TEAM",
    role: 0,
    shortDescription: { en: "Fun gay test meter with avatar" },
    longDescription: { en: "Shows a personalized rainbow meter with user avatar and fun style" },
    category: "fun",
    guide: { en: "{pn} <tag or reply user>" },
  },

  onStart: async function({ message, args, event, api }) {
    const prefix = getPrefix(event.threadID);

    // Target user ID
    let userID;
    if (event.messageReply) userID = event.messageReply.senderID;
    else if (args[0]) userID = args[0].replace(/[^0-9]/g, "");
    else return message.reply(`😂 Tag a user or reply to their message.\nUsage: ${prefix}gaytest @user`);

    const avatarURL = `https://graph.facebook.com/${userID}/picture?type=large`;
    const percentage = Math.floor(Math.random() * 101);

    // Canvas setup
    const canvas = Canvas.createCanvas(500, 250);
    const ctx = canvas.getContext("2d");

    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, "#1a1a1a");
    bgGradient.addColorStop(1, "#111");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rainbow bar setup
    const barWidth = 350;
    const barHeight = 35;
    const barX = 75;
    const barY = 180;

    // Background bar
    ctx.fillStyle = "#222";
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Smooth rainbow gradient
    const rainbowGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
    rainbowGradient.addColorStop(0, "#FF0000");
    rainbowGradient.addColorStop(0.17, "#FF7F00");
    rainbowGradient.addColorStop(0.34, "#FFFF00");
    rainbowGradient.addColorStop(0.51, "#00FF00");
    rainbowGradient.addColorStop(0.68, "#0000FF");
    rainbowGradient.addColorStop(0.85, "#4B0082");
    rainbowGradient.addColorStop(1, "#8F00FF");

    const filledWidth = (percentage / 100) * barWidth;
    ctx.fillStyle = rainbowGradient;
    ctx.fillRect(barX, barY, filledWidth, barHeight);

    // Emoji accents on bar
    const emojis = ["🌈","🤢","✨","💎","😎"];
    for (let i = 0; i < Math.floor(filledWidth / 20); i++) {
      const e = emojis[Math.floor(Math.random() * emojis.length)];
      ctx.fillText(e, barX + i*20 + 10, barY + barHeight/1.5);
    }

    // Draw avatar with halo
    try {
      const avatar = await Canvas.loadImage(avatarURL);
      ctx.save();
      const avatarX = 75;
      const avatarY = 50;
      const avatarSize = 100;

      // Circular clip
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI*2, true);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      // Halo/glow
      const haloGradient = ctx.createRadialGradient(
        avatarX + avatarSize/2,
        avatarY + avatarSize/2,
        avatarSize/2,
        avatarX + avatarSize/2,
        avatarY + avatarSize/2,
        avatarSize
      );
      haloGradient.addColorStop(0, "rgba(255,255,0,0.4)");
      haloGradient.addColorStop(1, "rgba(255,0,255,0)");
      ctx.fillStyle = haloGradient;
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize, 0, Math.PI*2);
      ctx.fill();

      // Avatar border
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2 + 2, 0, Math.PI*2);
      ctx.stroke();

    } catch (e) {
      console.log("Avatar fetch failed, skipping avatar overlay.");
    }

    // Text overlay
    ctx.textAlign = "center";

    // Dynamic text color based on percentage
    let textColor = "#FFFFFF";
    if (percentage <= 20) textColor = "#FFFFFF";
    else if (percentage <= 50) textColor = "#FF69B4";
    else if (percentage <= 80) textColor = "#FF00FF";
    else textColor = "#FFD700";

    ctx.fillStyle = textColor;
    ctx.font = "28px Arial";
    ctx.fillText(`🌈 Gay Test Meter: ${percentage}%`, canvas.width/2, 40);

    // Comment text with emojis
    let comment = "";
    if (percentage > 80) comment = "🌈 Full rainbow vibes! 🤮✨";
    else if (percentage > 50) comment = "🤢 Pretty gay! 🌟";
    else if (percentage > 20) comment = "😏 Some gay vibes! 🌈";
    else comment = "😎 Totally straight vibes!";

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "20px Arial";
    ctx.fillText(comment, canvas.width/2, 150);

    // Confetti scatter
    for (let i = 0; i < 30; i++) {
      const confX = Math.random()*canvas.width;
      const confY = Math.random()*canvas.height;
      const confSize = Math.random()*8 + 4;
      const confColors = ["#FF0000","#FF7F00","#FFFF00","#00FF00","#0000FF","#4B0082","#8F00FF"];
      ctx.fillStyle = confColors[Math.floor(Math.random()*confColors.length)];
      ctx.beginPath();
      ctx.arc(confX, confY, confSize, 0, Math.PI*2);
      ctx.fill();
    }

    // Send result
    const buffer = canvas.toBuffer();
    await message.reply({ body: `👑 Gay Test Meter\n💌 Author: MH-TEAM`, attachment: buffer });
  }
};
