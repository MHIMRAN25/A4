const fs = require("fs-extra");
const Canvas = require("canvas");

module.exports = {
  config: {
    name: "meter",
    aliases: ["gay", "gaymeter", "lesbu", "lesbumeter", "lesbian"],
    version: "2.4",
    author: "MH-TEAM",
    role: 0,
    shortDescription: "Funny gay or lesbu meter",
    longDescription: "Measures your gay or lesbu level with rainbow bar & funny comments",
    category: "fun",
    guide: "{pn} [gay | lesbu] <tag or reply>",
  },

  onStart: async function ({ message, args, event, usersData }) {
    try {
      // Detect command type
      let cmd = "gay";
      if (args && args[0]) cmd = args[0].toLowerCase();
      else if (event.body) cmd = event.body.split(" ")[0].replace(".", "").toLowerCase();

      const type = cmd.includes("lesb") ? "lesbu" : "gay";

      // Target user (reply > mention > sender)
      let userID = event.senderID;
      if (event.messageReply) userID = event.messageReply.senderID;
      else if (args && args[1]) userID = args[1].replace(/[^0-9]/g, "");

      // Avatar URL
      let avatarURL = null;
      try { avatarURL = await usersData.getAvatarUrl(userID); } 
      catch (e) { avatarURL = null; }

      // Random percentage
      const percent = Math.floor(Math.random() * 101);

      // Canvas setup
      const canvas = Canvas.createCanvas(500, 250);
      const ctx = canvas.getContext("2d");

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
      bg.addColorStop(0, "#1a1a1a");
      bg.addColorStop(1, "#000");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Rainbow Bar
      const barWidth = 350, barHeight = 35, barX = 75, barY = 180;
      ctx.fillStyle = "#222";
      ctx.fillRect(barX, barY, barWidth, barHeight);

      const rainbow = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
      rainbow.addColorStop(0, "#FF0000");
      rainbow.addColorStop(0.17, "#FF7F00");
      rainbow.addColorStop(0.34, "#FFFF00");
      rainbow.addColorStop(0.51, "#00FF00");
      rainbow.addColorStop(0.68, "#0000FF");
      rainbow.addColorStop(0.85, "#4B0082");
      rainbow.addColorStop(1, "#8F00FF");

      const filledWidth = (percent / 100) * barWidth;
      ctx.fillStyle = rainbow;
      ctx.fillRect(barX, barY, filledWidth, barHeight);

      // Avatar (optional)
      if (avatarURL) {
        try {
          const avatar = await Canvas.loadImage(avatarURL);
          const size = 100, x = 75, y = 50;
          ctx.save();
          ctx.beginPath();
          ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          ctx.drawImage(avatar, x, y, size, size);
          ctx.restore();
        } catch (e) { console.log("Avatar load failed"); }
      }

      // Title
      ctx.fillStyle = "#FFF";
      ctx.font = "26px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`${type === "lesbu" ? "🌸 Lesbu Meter 🌸" : "🌈 Gay Meter 🌈"}`, canvas.width / 2, 40);

      // Funny comments
      let comment = "";
      if (type === "gay") {
        if (percent < 30) comment = "😎 Straight as a ruler—or so you claim!";
        else if (percent < 50) comment = "🤔 You're like 30% gay and 70% confused!";
        else if (percent < 80) comment = "✨ Not fully gay... but sparkle detected!";
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

      // Send reply
      await message.reply({
        body: `${type === "lesbu" ? "💋 Lesbu Meter Result!" : "🌈 Gay Meter Result!"}\nAuthor: MH-TEAM`,
        attachment: canvas.toBuffer()
      });

    } catch (e) {
      console.error(e);
      await message.reply("❌ Something went wrong while generating the meter!");
    }
  }
};
