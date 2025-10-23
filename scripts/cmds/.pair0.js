const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pair0",
    version: "2.0",
    author: "M H IMRAN",
    countDown: 5,
    role: 2,
    shortDescription: "Funny love meme generator",
    longDescription: "Generate a funny unromantic or pairing meme using user avatars",
    category: "fun",
    guide: {
      en: "{pn} (for yourself) or {pn} @tag / reply (for others)"
    }
  },

  onStart: async function ({ event, message, usersData, api }) {
    let pathSave;
    try {
      const bgURL = "https://i.postimg.cc/nr5YDDQh/1000002169-with-bgc.png";
      const bg = await Canvas.loadImage(bgURL);

      let uid;
      let funnyText;

      // Tag or reply হলে অন্য text
      if (Object.keys(event.mentions).length > 0) {
        uid = Object.keys(event.mentions)[0];
        const userData = await usersData.get(uid);
        const name = userData?.name || "User";

        const pairTexts = [
          `😂 Pairing failed! Server responded with 404.\n(${name})`,
          `💔 ${name} disconnected from the love server.`,
          `😅 Love request to ${name} denied by system.`,
          `📴 ${name} is in airplane mode — no signals of love.`,
          `🤖 ${name}'s heart firewall blocked your request!`
        ];

        funnyText = pairTexts[Math.floor(Math.random() * pairTexts.length)];

      } else if (event.messageReply) {
        uid = event.messageReply.senderID;
        const userData = await usersData.get(uid);
        const name = userData?.name || "User";

        const replyTexts = [
          `😂 Pairing failed! Server responded with 404.\n(${name})`,
          `💔 ${name} refused to connect — try again later.`,
          `😅 ${name} turned off emotional mode.`,
          `📴 Love link to ${name} not found.`,
          `🤖 ${name} installed anti-romance software.`
        ];

        funnyText = replyTexts[Math.floor(Math.random() * replyTexts.length)];

      } else {
        // নিজের জন্য
        uid = event.senderID;

        const selfTexts = [
          `💔 Love Error 404\nUnromantic mode: ON!`,
          `😎 Love not found in system settings.`,
          `🤖 Emotion.exe stopped working.`,
          `🚫 Love driver missing — reinstall feelings.`,
          `🥶 Heart status: Frozen.`
        ];

        funnyText = selfTexts[Math.floor(Math.random() * selfTexts.length)];
      }

      // Avatar load
      const avatarURL = await usersData.getAvatarUrl(uid);
      const avatar = await Canvas.loadImage(avatarURL);

      const canvas = Canvas.createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // Avatar position
      const avatarX = 142;
      const avatarY = 8;
      const avatarW = 118;
      const avatarH = 119;

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        avatarX + avatarW / 2,
        avatarY + avatarH / 2,
        avatarW / 2,
        0,
        Math.PI * 2,
        true
      );
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarW, avatarH);
      ctx.restore();

      // Text styling (bottom title)
      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "#ff4d6d";
      ctx.textAlign = "center";
      ctx.fillText("Love System", canvas.width / 2, canvas.height - 30);

      // Save file
      pathSave = `${__dirname}/tmp/${uid}_love0.png`;
      fs.writeFileSync(pathSave, canvas.toBuffer());

      // Send message
      const sent = await message.reply({
        body: funnyText,
        attachment: fs.createReadStream(pathSave)
      });

      if (sent && sent.messageID) {
        api.setMessageReaction("💔", sent.messageID, () => {}, true);
      }

    } catch (err) {
      console.error(err);
      message.reply("⚠️ Error: " + err.message);
    } finally {
      if (pathSave && await fs.pathExists(pathSave)) {
        await fs.remove(pathSave);
      }
    }
  }
};
