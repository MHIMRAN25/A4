const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pregnant",
    version: "2.3",
    author: "M H IMRAN", // ❌ কেউ পরিবর্তন করতে পারবে না
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

  onStart: async function ({ event, message, usersData, args, getLang, api }) {
    let pathSave;
    try {
      let uid2;

      
      if (Object.keys(event.mentions).length > 0) {
        uid2 = Object.keys(event.mentions)[0];
      } else if (event.messageReply) {
        uid2 = event.messageReply.senderID;
      }

      if (!uid2) return message.reply(getLang("noTag"));

      await message.reply("🔎 প্রেগন্যান্সি  meme তৈরি হচ্ছে...");

      
      const userData = await usersData.get(uid2);
      const userName = userData?.name || "User";
      const avatarURL = await usersData.getAvatarUrl(uid2);
      if (!avatarURL) return message.reply("⚠️ ইউজারের অ্যাভাটার আনা যাচ্ছে না!");
      const avatar = await Canvas.loadImage(avatarURL);

      
      const templatePath = path.join(__dirname, "assets", "pregnancy_template.png");
      if (!fs.existsSync(templatePath)) {
        return message.reply("⚠️ টেমপ্লেট ইমেজ খুঁজে পাওয়া যায়নি! Path: " + templatePath);
      }
      const template = await Canvas.loadImage(templatePath);

    
      const canvas = Canvas.createCanvas(template.width, template.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

    
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

    
      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#ff0066";
      ctx.textAlign = "center";
      ctx.fillText("", canvas.width / 2, canvas.height - 30);

      
      pathSave = `${__dirname}/tmp/${uid2}_pregnancy.png`;
      fs.writeFileSync(pathSave, canvas.toBuffer());

      
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

      const sent = await message.reply({
        body: finalText,
        attachment: fs.createReadStream(pathSave),
        mentions: [{ tag: userName, id: uid2 }]
      });

      
      let finalText;
      if (args.length > 0) {
      
        finalText = args.join(" ") + ` ${userName}`;
      } else {
        
        finalText = funnyTexts[Math.floor(Math.random() * funnyTexts.length)];
      }

      
      const sent = await message.reply({
        body: finalText,
        attachment: fs.createReadStream(pathSave),
        mentions: [{ tag: userName, id: uid2 }]
      });

    
      if (sent && sent.messageID) {
        api.setMessageReaction("🤰", sent.messageID, (err) => {
          if (err) console.error("Reaction error:", err);
        }, true);

        api.setMessageReaction("😂", sent.messageID, (err) => {
          if (err) console.error("Reaction error:", err);
        }, true);
      }

    } catch (err) {
      console.error("❌ ERROR:", err);
      message.reply("" + err.message);
    } finally {
      if (pathSave && await fs.pathExists(pathSave)) {
        await fs.remove(pathSave);
      }
    }
  }
};
