const Canvas = require("canvas");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "meter",
    aliases: ["gaymeter", "lesbu", "lesbumeter", "lesbian"],
    version: "2.0",
    author: "Imran ",
    countDown: 3,
    role: 0,
    shortDescription: "Funny gay/lesbu meter",
    longDescription: "Shows how gay or lesbu someone is with a funny comment",
    category: "fun",
  },

  onStart: async function ({ event, message, usersData, args }) {
    try {
      let mention = Object.keys(event.mentions);
      let uid;

      if (event.type === "message_reply") uid = event.messageReply.senderID;
      else if (mention[0]) uid = mention[0];
      else uid = event.senderID;

      let avatar = await usersData.getAvatarUrl(uid);
      if (!avatar) return message.reply("❌ Could not fetch avatar!");

      // Determine mode (gay or lesbu)
      const cmd = args[0] ? args[0].toLowerCase() : event.commandName.toLowerCase();
      const isLesbu = ["lesbu", "lesbumeter", "lesbian"].includes(cmd);

      // Random percent
      const percent = Math.floor(Math.random() * 101);

      // Funny text system
      let text = "";
      if (isLesbu) {
        if (percent < 30) text = "Straight as a pencil... or so you say 👀";
        else if (percent < 50) text = "30% lesbu and 70% mysterious 😏";
        else if (percent < 80) text = "You sparkle with a soft lesbu vibe 💅";
        else text = "🚺 Full power lesbian mode unlocked 🌈🔥";
      } else {
        if (percent < 30) text = "Straight as a ruler... or so you claim 😎";
        else if (percent < 50) text = "You're like 30% gay and 70% confused 😂";
        else if (percent < 80) text = "You're not 100% gay but definitely sparkle 💫";
        else text = "🌈 Oh no bro... you've unlocked the full gay mode! 💖";
      }

      // Color based on % 
      let color = "#00FF00"; // green
      if (percent >= 80) color = "#FF00FF"; // rainbow
      else if (percent >= 50) color = "#FFA500"; // orange
      else if (percent >= 30) color = "#FFFF00"; // yellow

      // Canvas setup
      const width = 700;
      const height = 400;
      const canvas = Canvas.createCanvas(width, height);
      const ctx = canvas.getContext("2d");

      // Background
      ctx.fillStyle = "#1e1e1e";
      ctx.fillRect(0, 0, width, height);

      // Avatar circle
      const img = await Canvas.loadImage(avatar);
      ctx.save();
      ctx.beginPath();
      ctx.arc(100, 200, 80, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 20, 120, 160, 160);
      ctx.restore();

      // Text
      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#fff";
      ctx.fillText(isLesbu ? "Lesbu Meter" : "Gay Meter", 250, 100);

      // Meter Bar
      ctx.fillStyle = "#333";
      ctx.fillRect(250, 150, 400, 50);
      ctx.fillStyle = color;
      ctx.fillRect(250, 150, (percent / 100) * 400, 50);

      // Percentage
      ctx.font = "30px Arial";
      ctx.fillStyle = "#fff";
      ctx.fillText(`${percent}%`, 420, 185);

      // Funny Comment
      ctx.font = "italic 24px Arial";
      ctx.fillStyle = "#ccc";
      ctx.fillText(text, 200, 280);

      const pathSave = `${__dirname}/tmp/meter_${uid}.png`;
      const buffer = canvas.toBuffer();
      fs.writeFileSync(pathSave, buffer);

      await message.reply({
        body: isLesbu ? `🌸 Lesbu meter result for ${event.mentions[uid] ? event.mentions[uid] : "you"}:` 
                      : `🌈 Gay meter result for ${event.mentions[uid] ? event.mentions[uid] : "you"}:`,
        attachment: fs.createReadStream(pathSave),
      });

      fs.unlinkSync(pathSave);
    } catch (e) {
      console.error(e);
      message.reply("❌ Something went wrong while generating the meter!");
    }
  },
};
