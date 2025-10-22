const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "love0",
    version: "1.1",
    author: "M H IMRAN", // ❌ Cannot be changed
    countDown: 5,
    role: 2,
    category: "fun",
    shortDescription: "Funny love attitude meme",
    longDescription: "Generate a meme with cool anti-love quotes",
    guide: { en: "{pn} @tag or reply" }
  },

  langs: { en: { noTag: "⚠️ You must tag or reply to someone!" } },

  onStart: async function ({ event, message, usersData, getLang, api }) {
    let pathSave;
    try {
      // 🔒 Author protection
      if (module.exports.config.author !== "M H IMRAN")
        return message.reply("❌ The author of this command cannot be changed!");

      // 👤 Target user
      const uid = Object.keys(event.mentions || {})[0] || event.messageReply?.senderID;
      if (!uid) return message.reply(getLang("noTag"));

      await message.reply("hmm w8");

      // 🧠 Get user info
      const name = (await usersData.get(uid))?.name || "User";
      const avatarURL = await usersData.getAvatarUrl(uid);

      // 🖼️ Load background & avatar
      const bgURL = "https://i.postimg.cc/nr5YDDQh/1000002169-with-bgc.png";
      const [bg, av] = await Promise.all([
        Canvas.loadImage(bgURL),
        Canvas.loadImage(avatarURL)
      ]);

      // 🎨 Canvas
      const canvas = Canvas.createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // 👤 Avatar placement
      const [x, y, w, h] = [444, 24, 392, 391];
      const r = w / 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + r, y + r, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(av, x, y, w, h);
      ctx.restore();

      // 💾 Save file
      const tmp = path.join(__dirname, "tmp");
      await fs.ensureDir(tmp);
      pathSave = path.join(tmp, `${uid}_love0.png`);
      fs.writeFileSync(pathSave, canvas.toBuffer());

      // 💬 Funny anti-love texts
      const texts = [
        `💔 Love is overrated.`,
        `😎 Love? Nah, not my thing.`,
        `😂 Too busy for love.`,
        `🚫 No love, no drama.`,
        `💤 Emotionless mode: ON.`,
        `💔 Love? Error 404 — not found.`,
        `😏 Single and proud.`,
        `💘 Love? Not today.`,
        `🤢 Allergic to love.`
      ];

      const finalText = texts[Math.floor(Math.random() * texts.length)];
      const sent = await message.reply({
        body: finalText,
        attachment: fs.createReadStream(pathSave),
        mentions: [{ tag: name, id: uid }]
      });

      // 💬 Auto reactions
      if (sent?.messageID) {
        api.setMessageReaction("💔", sent.messageID, () => {}, true);
        api.setMessageReaction("😎", sent.messageID, () => {}, true);
      }

    } catch (err) {
      console.error("❌ ERROR:", err);
      message.reply("⚠️ " + err.message);
    } finally {
      if (pathSave && await fs.pathExists(pathSave)) await fs.remove(pathSave);
    }
  }
};
