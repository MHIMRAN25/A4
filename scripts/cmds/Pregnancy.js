const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pregnancy",
    version: "2.7",
    author: "M H IMRAN", // ❌ কেউ পরিবর্তন করতে পারবে না
    countDown: 5,
    role: 2,
    shortDescription: "Pregnancy meme generator (anime template)",
    longDescription: "Anime-style pregnancy meme generator",
    category: "fun",
    guide: {
      en: "{pn} @tag অথবা রিপ্লাই করুন"
    }
  },

  langs: {
    bn: {
      noTag: "⚠️ আপনাকে অবশ্যই কাউকে ট্যাগ করতে হবে অথবা মেসেজে রিপ্লাই দিতে হবে!"
    },
    en: {
      noTag: "⚠️ You must tag or reply to someone!"
    }
  },

  onStart: async function ({ event, message, usersData, getLang, api }) {
    let pathSave;
    try {
      // 🔒 Author Protection
      if (module.exports.config.author !== "M H IMRAN") {
        return message.reply("❌ এই কমান্ডের author পরিবর্তন করা যাবে না!");
      }

      // 🎯 Target user select
      let uid2;
      if (Object.keys(event.mentions).length > 0) {
        uid2 = Object.keys(event.mentions)[0];
      } else if (event.messageReply) {
        uid2 = event.messageReply.senderID;
      }
      if (!uid2) return message.reply(getLang("noTag"));

      await message.reply("🔎 প্রেগন্যান্সি meme তৈরি হচ্ছে...");

      // 👤 User info
      const userData = await usersData.get(uid2);
      const userName = userData?.name || "User";
      const avatarURL = await usersData.getAvatarUrl(uid2);
      if (!avatarURL) return message.reply("⚠️ ইউজারের অ্যাভাটার আনা যাচ্ছে না!");
      const avatar = await Canvas.loadImage(avatarURL);

      // 🌐 Anime Template URL
      const templateURL = "https://i.postimg.cc/L8rRR828/pregnancy-template.png";
      const template = await Canvas.loadImage(templateURL);

      // 🎨 Canvas setup
      const canvas = Canvas.createCanvas(template.width, template.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

      // 🟣 Avatar placement (adjusted for your anime image)
      const avatarRadius = 120;   // circle radius
      const avatarSize = avatarRadius * 2;
      const avatarX = 585;        // horizontal position
      const avatarY = 340;        // vertical position

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.closePath();
      ctx.restore();

      // 📝 Output save
      const tmpDir = path.join(__dirname, "tmp");
      await fs.ensureDir(tmpDir);
      pathSave = path.join(tmpDir, `${uid2}_pregnancy.png`);
      fs.writeFileSync(pathSave, canvas.toBuffer());

      // 😂 Funny texts
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

      // 📤 Send result
      const sent = await message.reply({
        body: finalText,
        attachment: fs.createReadStream(pathSave),
        mentions: [{ tag: userName, id: uid2 }]
      });

      // 💬 Reacts
      ["🤰", "😂"].forEach(emoji =>
        api.setMessageReaction(emoji, sent.messageID, () => {}, true)
      );

    } catch (err) {
      console.error("❌ ERROR:", err);
      message.reply("⚠️ " + err.message);
    } finally {
      if (pathSave && await fs.pathExists(pathSave)) {
        await fs.remove(pathSave);
      }
    }
  }
};
