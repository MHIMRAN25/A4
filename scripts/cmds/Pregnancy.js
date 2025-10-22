const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "pregnancy",
    version: "8.0",
    author: "M H IMRAN",
    countDown: 5,
    role: 2,
    shortDescription: "Pregnancy meme generator",
    longDescription: "Generate a funny pregnancy meme with tagged user's avatar",
    category: "fun",
    guide: "{pn} @tag অথবা রিপ্লাই করুন"
  },

  langs: {
    bn: {
      noTag: "⚠️ আপনাকে অবশ্যই কাউকে ট্যাগ করতে হবে অথবা মেসেজে রিপ্লাই দিতে হবে!"
    },
    en: {
      noTag: "⚠️ You must tag or reply to someone!"
    }
  },

  onStart: async function ({ event, message, usersData, api }) {
    let pathSave, pathBg;
    try {
      if (module.exports.config.author !== "M H IMRAN")
        return message.reply("❌ এই কমান্ডের author পরিবর্তন করা যাবে না!");

      await fs.ensureDir(__dirname + "/cache");

      let uid2;
      if (Object.keys(event.mentions).length > 0) uid2 = Object.keys(event.mentions)[0];
      else if (event.messageReply) uid2 = event.messageReply.senderID;
      if (!uid2) return message.reply(this.langs.bn.noTag);

      const userData = await usersData.get(uid2);
      const userName = userData?.name || "User";

      pathBg = __dirname + `/cache/pregnancy_bg.png`;
      pathSave = __dirname + `/cache/${uid2}_pregnancy_result.png`;

      // Download avatar
      const avatarURL = await usersData.getAvatarUrl(uid2);
      if (!avatarURL) return message.reply("⚠️ ইউজারের অ্যাভাটার আনা যাচ্ছে না!");
      const avatar = await Canvas.loadImage(avatarURL);

      // Download background
      const bgUrl = "https://i.postimg.cc/L8rRR828/pregnancy-template.png";
      const bgRes = await axios.get(bgUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(pathBg, Buffer.from(bgRes.data, "binary"));
      const template = await Canvas.loadImage(pathBg);

      // Canvas
      const canvas = Canvas.createCanvas(template.width, template.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

      // Avatar circular crop
      const avatarRadius = 230;
      const avatarSize = avatarRadius * 2;
      const avatarX = 262;
      const avatarY = 295;

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      // Save image
      fs.writeFileSync(pathSave, canvas.toBuffer());

      // Funny texts
      const funnyTexts = [
        `🤰 অভিনন্দন ${userName}, তোমার রিপোর্ট পজিটিভ এসেছে!`,
        `😂 ওহ না… ${userName} এখন মা/বাবা হতে যাচ্ছে!`,
        `👶 ${userName} এক্সপেক্ট করছে! প্রস্তুত হও…`,
        `😳 ডাক্তার বলছে ${userName} এর টেস্ট রেজাল্ট পজিটিভ!`,
        `🤰 Congratulations ${userName}, your test came out positive!`,
        `😂 Oh no… ${userName} is going to be a parent now!`,
        `👶 Baby incoming! ${userName} is expecting…`,
        `😳 Doctor just confirmed ${userName}’s test result is positive!`
      ];
      const finalText = funnyTexts[Math.floor(Math.random() * funnyTexts.length)];

      // Send meme with text in body
      const sent = await message.reply({
        body: finalText,
        attachment: fs.createReadStream(pathSave)
      });

      if (api && sent) {
        api.setMessageReaction("🤰", sent.messageID || event.messageID, () => {}, true);
        api.setMessageReaction("😂", sent.messageID || event.messageID, () => {}, true);
      }

    } catch (err) {
      console.error("❌ ERROR:", err);
      message.reply("⚠️ Error: " + err.message);
    } finally {
      if (pathSave && fs.existsSync(pathSave)) fs.unlinkSync(pathSave);
      if (pathBg && fs.existsSync(pathBg)) fs.unlinkSync(pathBg);
    }
  }
};
