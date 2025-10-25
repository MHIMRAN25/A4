const fs = require("fs-extra");
const Canvas = require("canvas");
const DIG = require("discord-image-generation");
const { getPrefix } = global.utils;

module.exports = {
  config: {
    name: "meter",
    aliases: ["gay", "gaymeter", "lesbu", "lesbumeter", "lesbian"],
    version: "3.0",
    author: "MH-TEAM",
    role: 0,
    shortDescription: "Funny gay or lesbu meter",
    longDescription: "Measures your gay or lesbu level with funny comments & colors",
    category: "fun",
    guide: "{pn} [gay | lesbu] <tag or reply>",
  },

  onStart: async function ({ message, args, event, usersData }) {
    try {
      // Detect command type
      const cmd = (args[0] || (event.body ? event.body.split(" ")[0].replace(".", "") : "gay")).toLowerCase();
      const type = cmd.includes("lesb") ? "lesbu" : "gay";

      // Target user
      let userID;
      if (event.messageReply) userID = event.messageReply.senderID;
      else if (args[1]) userID = args[1].replace(/[^0-9]/g, "");
      else userID = event.senderID;

      // Avatar URL
      let avatarURL = null;
      try { avatarURL = await usersData.getAvatarUrl(userID); } catch (e) { avatarURL = null; }

      // Generate DIG image
      let digBuffer;
      try {
        if(type === "gay") digBuffer = await new DIG.Gay().getImage(avatarURL);
        else digBuffer = await new DIG.Lesbian().getImage(avatarURL);
      } catch(e) { digBuffer = null; }

      // Random %
      const percent = Math.floor(Math.random() * 101);

      // Canvas setup
      const canvas = Canvas.createCanvas(500, 250);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // DIG image
      if(digBuffer) {
        const img = await Canvas.loadImage(digBuffer);
        ctx.drawImage(img, 0, 0, canvas.width, 150);
      }

      // Bar
      const barWidth = 350, barHeight = 35, barX = 75, barY = 180;
      ctx.fillStyle = "#222";
      ctx.fillRect(barX, barY, barWidth, barHeight);

      // Bar color by %
      let fillColor;
      if(percent < 30) fillColor = "#00FF00"; // green
      else if(percent < 50) fillColor = "#FFA500"; // orange
      else if(percent < 80) fillColor = "#FFD700"; // yellow
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

      // Title
      ctx.fillStyle = "#FFF";
      ctx.font = "26px Arial";
      ctx.textAlign = "center";
      ctx.fillText(type === "lesbu" ? "🌸 Lesbu Meter 🌸" : "🌈 Gay Meter 🌈", canvas.width/2, 40);

      // Funny comment
      let comment = "";
      if(type === "gay") {
        if(percent < 30) comment = "😎 Straight as a ruler—or so you claim!";
        else if(percent < 50) comment = "🤔 You're like 30% gay and 70% confused!";
        else if(percent < 80) comment = "✨ Not 100% gay... but definitely sparkle!";
        else comment = "🌈 Oh no bro, you just unlocked FULL mode! 🏳️‍🌈";
      } else {
        if(percent < 30) comment = "💅 Straight vibes detected... or are they?";
        else if(percent < 50) comment = "💖 A little fruity curiosity there!";
        else if(percent < 80) comment = "🌸 Soft lesbo energy radiating strong!";
        else comment = "💘 Girl, you unlocked LESBIAN LEGEND MODE!";
      }

      ctx.fillStyle = "#FFF";
      ctx.font = "20px Arial";
      ctx.fillText(`${percent}%`, canvas.width/2, 140);
      ctx.fillText(comment, canvas.width/2, 170);

      // Confetti
      for(let i=0;i<25;i++){
        ctx.fillStyle = `hsl(${Math.random()*360},100%,60%)`;
        ctx.beginPath();
        ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, Math.random()*6, 0, Math.PI*2);
        ctx.fill();
      }

      // Send
      const buffer = canvas.toBuffer();
      await message.reply({
        body: type === "lesbu"
          ? "💋 Lesbu Meter Result! Author: MH-TEAM"
          : "🌈 Gay Meter Result! Author: MH-TEAM",
        attachment: buffer
      });

    } catch(e) {
      console.error(e);
      await message.reply("❌ Something went wrong while generating the meter!");
    }
  }
};
