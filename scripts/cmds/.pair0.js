const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pair0",
    version: "3.5",
    author: "M H IMRAN", // ❌ Do not change
    countDown: 5,
    role: 2,
    category: "fun",
    shortDescription: "Funny anti-love or roast meme generator",
    longDescription: "Shows anti-love meme for yourself or funny unromantic roast meme for someone you tag or reply to.",
    guide: { en: "{pn} or {pn} @mention/reply" }
  },

  onStart: async function ({ event, message, usersData, api }) {
    let pathSave;
    try {
      const mention =
        Object.keys(event.mentions || {}).length > 0
          ? Object.keys(event.mentions)[0]
          : event.messageReply?.senderID;

      const uid = mention || event.senderID;

      await message.reply("💔 Generating meme...");

      const userData = await usersData.get(uid);
      const name = userData?.name || "User";
      const avatarURL = await usersData.getAvatarUrl(uid);

      const bgURL = "https://i.postimg.cc/s2PHSwcm/1761160815292.png";
      const [bg, av] = await Promise.all([
        Canvas.loadImage(bgURL),
        Canvas.loadImage(avatarURL)
      ]);

      const canvas = Canvas.createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      const [x, y, w, h] = [142, 8, 118, 119];
      const r = w / 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + r, y + r, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(av, x, y, w, h);
      ctx.restore();

      const tmp = path.join(__dirname, "tmp");
      await fs.ensureDir(tmp);
      pathSave = path.join(tmp, `${uid}_love0.png`);
      fs.writeFileSync(pathSave, canvas.toBuffer());

      // 💔 Anti-love text (for self)
      const antiLoveTexts = [
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

      // 😂 Roast / Unromantic text (for others)
      const roastTexts = [
        `😂 ${name} tried to fall in love but tripped!`,
        `💔 ${name}, love server crashed again!`,
        `😅 ${name} applied for love… rejected instantly!`,
        `🤣 ${name} thought it was love, turns out it was Wi-Fi lag!`,
        `🤡 ${name}, still buffering in relationship mode!`,
        `🚫 ${name}, love update failed — please try next century.`,
        `💀 ${name}, uninstalling love.exe...`,
        `😏 ${name}, unromantic pro max edition!`,
        `🍵 ${name}, chill bro, love isn’t your cup of tea!`
      ];

      const finalText = mention
        ? roastTexts[Math.floor(Math.random() * roastTexts.length)]
        : antiLoveTexts[Math.floor(Math.random() * antiLoveTexts.length)];

      const sent = await message.reply({
        body: finalText,
        attachment: fs.createReadStream(pathSave),
        mentions: mention ? [{ tag: name, id: uid }] : []
      });

      if (sent?.messageID) {
        const react = mention ? "😂" : "💔";
        api.setMessageReaction(react, sent.messageID, () => {}, true);
      }

    } catch (err) {
      console.error("❌ ERROR:", err);
      message.reply("⚠️ " + err.message);
    } finally {
      if (pathSave && await fs.pathExists(pathSave)) await fs.remove(pathSave);
    }
  }
};
