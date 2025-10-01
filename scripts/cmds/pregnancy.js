const Canvas = require("canvas");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pregnancy",
    version: "1.5",
    author: "M H IMRAN", // ❌ কেউ চাইলে পরিবর্তন করতে পারবে না
    countDown: 5,
    role: 2,
    shortDescription: "Pregnancy meme generator",
    longDescription: "Make a pregnancy meme using custom template",
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

  onStart: async function ({ event, message, usersData, args, getLang }) {
    try {
      let uid2;

      if (Object.keys(event.mentions).length > 0) {
        uid2 = Object.keys(event.mentions)[0];
      } else if (event.messageReply) {
        uid2 = event.messageReply.senderID;
      }

      if (!uid2) return message.reply(getLang("noTag"));

      await message.reply("🔎 প্রেগন্যান্সি মিম তৈরি হচ্ছে...");

      const avatarURL = await usersData.getAvatarUrl(uid2);
      if (!avatarURL) return message.reply("⚠️ ইউজারের অ্যাভাটার আনা যাচ্ছে না!");

      const avatar = await Canvas.loadImage(avatarURL);

      // ✅ টেমপ্লেট লোড
      const templatePath = __dirname + "/assets/pregnancy_template.png";
      if (!fs.existsSync(templatePath)) {
        return message.reply("⚠️ টেমপ্লেট ইমেজ খুঁজে পাওয়া যায়নি! Path: " + templatePath);
      }
      const template = await Canvas.loadImage(templatePath);

      // ক্যানভাস সেটআপ
      const canvas = Canvas.createCanvas(template.width, template.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

      // 🎯 অ্যাভাটার বসানো → মেয়েটার মুখ বরাবর
      const avatarRadius = 230; 
      const avatarSize = avatarRadius * 2; 
      const avatarX = 265;  // X ঠিক করা হয়েছে
      const avatarY = 290;  // Y ঠিক করা হয়েছে

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

  
      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#ff0066";
      ctx.textAlign = "center";
      ctx.fillText("ল্যাংটা বাবার শুভেচ্ছা", canvas.width / 2, canvas.height - 30);

      // ফাইল সেভ
      const pathSave = `${__dirname}/tmp/${uid2}_pregnancy.png`;
      fs.writeFileSync(pathSave, canvas.toBuffer());

      // মজার টেক্সট
      const funnyTexts = [
        `🤰 অভিনন্দন <@${uid2}>, তোমার রিপোর্ট পজিটিভ এসেছে!`,
        `😂 ওহ না… <@${uid2}> এখন মা/বাবা হতে যাচ্ছে!`,
        `👶 <@${uid2}> এক্সপেক্ট করছে! প্রস্তুত হও…`,
        `😳 ডাক্তার বলছে <@${uid2}> এর টেস্ট রেজাল্ট পজিটিভ!`,
        `🤰 Congratulations <@${uid2}>, your test came out positive!`,
        `😂 Oh no… <@${uid2}> is going to be a parent now!`,
        `👶 Baby incoming! <@${uid2}> is expecting…`,
        `😳 Doctor just confirmed <@${uid2}>’s test result is positive!`
      ];

      const finalText = args.join(" ") || funnyTexts[Math.floor(Math.random() * funnyTexts.length)];

      const sent = await message.reply({
        body: finalText,
        attachment: fs.createReadStream(pathSave)
      });

      // ✅ Reaction Add
      if (sent && sent.messageID) {
        message.react("🤰","😂", sent.messageID);
      }

      fs.unlinkSync(pathSave);

    } catch (err) {
      console.error("❌ ERROR:", err);
      message.reply("⚠️ meme তৈরি করতে সমস্যা হয়েছে: " + err.message);
    }
  }
};
