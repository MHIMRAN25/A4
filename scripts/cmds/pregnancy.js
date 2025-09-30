const Canvas = require("canvas");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pregnant",
    version: "1.8",
    author: "M H IMRAN", // 🔒 লকড
    countDown: 5,
    role: 2, // ✅ শুধুমাত্র এডমিন
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
      // 🔒 Author name check
      if (!module.exports.config.author.includes("M H IMRAN")) {
        throw new Error("❌ Author credit missing! Script locked by M H IMRAN");
      }

      let uid2;
      if (Object.keys(event.mentions).length > 0) {
        uid2 = Object.keys(event.mentions)[0];
      } else if (event.messageReply) {
        uid2 = event.messageReply.senderID;
      }
      if (!uid2) return message.reply(getLang("noTag"));

      await message.reply("🔎 w8 plz...");

      const avatarURL = await usersData.getAvatarUrl(uid2);
      if (!avatarURL) return message.reply("⚠️ ইউজারের অ্যাভাটার আনা যাচ্ছে না!");
      const avatar = await Canvas.loadImage(avatarURL);

  
      const templatePath = __dirname + "/assets/pregnancy_template.png";
      if (!fs.existsSync(templatePath)) {
        return message.reply("⚠️ টেমপ্লেট ইমেজ খুঁজে পাওয়া যায়নি! Path: " + templatePath);
      }
      const template = await Canvas.loadImage(templatePath);

      
      const canvas = Canvas.createCanvas(template.width, template.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

      
      const avatarRadius = 220;
      const avatarSize = avatarRadius * 2; // 440px
      const avatarX = 384 - avatarRadius;
      const avatarY = 350 - avatarRadius;

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      // 🎭 Funny signature (bottom text)
      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth = 4;
      ctx.textAlign = "center";
      ctx.strokeText("ল্যাংটা বাবার শুভেচ্ছা", canvas.width / 2, canvas.height - 40);
      ctx.fillText("ল্যাংটা বাবার শুভেচ্ছা", canvas.width / 2, canvas.height - 40);


      const pathSave = `${__dirname}/tmp/${uid2}_pregnancy.png`;
      fs.writeFileSync(pathSave, canvas.toBuffer());


      const funnyTexts = [
        `🤰 অভিনন্দন <@${uid2}>, তোমার রিপোর্ট পজিটিভ এসেছে!`,
        `😂 ওহ না… <@${uid2}> এখন মা/বাবা হতে যাচ্ছে!`,
        `👶 <@${uid2}> এক্সপেক্ট করছে! প্রস্তুত হও…`,
        `😳 ডাক্তার বলছে <@${uid2}> এর টেস্ট রেজাল্ট পজিটিভ!`,
        `🤰 Congratulations <@${uid2}>, the test came back positive!`,
        `👶 Looks like <@${uid2}> is expecting!`,
        `😂 Uh-oh… <@${uid2}> is going to be a parent!`,
        `😳 Doctor confirmed: <@${uid2}> is positive!`
      ];

      const finalText = args.join(" ") || funnyTexts[Math.floor(Math.random() * funnyTexts.length)];

      await message.reply({
        body: finalText,
        attachment: fs.createReadStream(pathSave)
      });

     
      await message.reaction("🤰");
      setTimeout(() => message.reaction("👶"), 1000);
      setTimeout(() => message.reaction("😂"), 2000);

      fs.unlinkSync(pathSave);

    } catch (err) {
      console.error("❌ ERROR:", err);
      message.reply("⚠️ meme তৈরি করতে সমস্যা হয়েছে: " + err.message);
    }
  }
};
