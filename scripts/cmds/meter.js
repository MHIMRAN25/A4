const fs = require("fs-extra");
const Canvas = require("canvas");
const { getPrefix } = global.utils;

module.exports = {
  config: {
    name: "meter",
    aliases: [ "gaymeter", "lesbu", "lesbumeter", "lesbian"],
    version: "2.2",
    author: "MH-TEAM",
    role: 0,
    shortDescription: "Funny gay or lesbian meter",
    longDescription: "Measures your gay or lesbu level with funny comments & colors",
    category: "fun",
    guide: "{pn} [gay | lesbu] <tag or reply>",
  },

  onStart: async function ({ message, args, event, usersData }) {
    try {
      // Detect command type safely
      const cmd = (args[0] || (event.body ? event.body.split(" ")[0].replace(".", "") : "gay")).toLowerCase();
      const type = cmd.includes("lesb") ? "lesbu" : "gay";

      // Target user
      let userID;
      if (event.messageReply) userID = event.messageReply.senderID;
      else if (args[1]) userID = args[1].replace(/[^0-9]/g, "");
      else userID = event.senderID;

      // Avatar URL
      let avatarURL = null;
      try {
        avatarURL = await usersData.getAvatarUrl(userID);
      } catch (e) {
        avatarURL = null;
      }

      // Random %
      const percent = Math.floor(Math.random() * 101);

      // Canvas setup
      const canvas = Canvas.createCanvas(500, 250);
      const ctx = canvas.getContext("2d");

      // Background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bgGradient.addColorStop(0, "#1a1a1a");
      bgGradient.addColorStop(1, "#000");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Bar
      const barWidth = 350, barHeight = 35, barX = 75, barY = 180;
      ctx.fillStyle = "#222";
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Color by percentage
      let fillColor;
      if (percent < 30) fillColor = "#00FF00"; // green
      else if (percent < 50) fillColor = "#FFA500"; // orange
      else if (percent < 80) fillColor = "#FFD700"; // yellow
      else {
        const rainbow = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
        rainbow.addColorStop(0, "#FF0000");
        rainbow.addColorStop(0.17, "#FF7F00");
        rainbow.addColorStop(0.34, "#FFFF00");
        rainbow.addColorStop(0.51, "#00FF00");
        rainbow.addColorStop(0.68, "#0000FF");
        rainbow.addColorStop(0.85, "#4B0082");
        rainbow.addColorStop(1, "#8F00FF");
        fillColor = rainbow;
      }

      const filledWidth = (percent / 100) * barWidth;
      ctx.fillStyle = fillColor;
      ctx.fillRect(barX, barY, filledWidth, barHeight);

      // Draw avatar
      if (avatarURL) {
        const avatar = await Canvas.loadImage(avatarURL);
        const size = 100;
        const x = 75, y = 50;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, x, y, size, size);
        ctx.restore();
      }

      // Title text
      ctx.fillStyle = "#FFF";
      ctx.font = "26px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`${type === "lesbu" ? "🌸 Lesbu Meter 🌸" : "🌈 Gay Meter 🌈"}`, canvas.width / 2, 40);

      // Funny comment system
      let comment = "";
      if (type === "gay") {
        if (percent < 30) comment = "😎 Straight as a ruler—or so you claim!";
        else if (percent < 50) comment = "🤔 You're like 30% gay and 70% confused!";
        else if (percent < 80) comment = "✨ Not 100% gay... but definitely sparkle!";
        else comment = "🌈 Oh no bro, you just unlocked FULL mode! 🏳️‍🌈";
      } else {
        if (percent < 30) comment = "💅 Straight vibes detected... or are they?";
        else if (percent < 50) comment = "💖 A little fruity curiosity there!";
        else if (percent < 80) comment = "🌸 Soft lesbo energy radiating strong!";
        else comment = "💘 Girl, you unlocked LESBIAN LEGEND MODE!";
      }

      ctx.fillStyle = "#FFF";
      ctx.font = "20px Arial";
      ctx.fillText(`${percent}%`, canvas.width / 2, 140);
      ctx.fillText(comment, canvas.width / 2, 170);

      // Confetti
      for (let i = 0; i < 25; i++) {
        ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 60%)`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 6, 0, Math.PI * 2);
        ctx.fill();
      }

      const buffer = canvas.toBuffer();
      const bodyText = type === "lesbu"
        ? "💋 Lesbu Meter Result! Author: MH-TEAM"
        : "🌈 Gay Meter Result! Author: MH-TEAM";

      await message.reply({
        body: bodyText,
        attachment: buffer
      });

    } catch (e) {
      console.error(e);
      await message.reply("❌ Something went wrong while generating the meter!");
    }
  },
};
