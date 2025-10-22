const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pregnancy",
    version: "3.2",
    author: "M H IMRAN", // ❌ Author cannot be changed
    countDown: 5,
    role: 2,
    shortDescription: "Pregnancy meme generator",
    longDescription: "Generate a funny pregnancy meme using a custom template",
    category: "fun",
    guide: {
      en: "{pn} @tag or reply to someone"
    }
  },

  langs: {
    en: {
      noTag: "⚠️ You must tag or reply to someone!"
    }
  },

  onStart: async function ({ event, message, usersData, getLang, api }) {
    let pathSave;
    try {
      
      if (module.exports.config.author !== "M H IMRAN") {
        return message.reply("❌ The author of this command cannot be changed!");
      }

      
      let uid2;
      if (Object.keys(event.mentions).length > 0) {
        uid2 = Object.keys(event.mentions)[0];
      } else if (event.messageReply) {
        uid2 = event.messageReply.senderID;
      }

      if (!uid2) return message.reply(getLang("noTag"));

      await message.reply("oky...");

      const userData = await usersData.get(uid2);
      const userName = userData?.name || "User";
      const avatarURL = await usersData.getAvatarUrl(uid2);
      const avatar = await Canvas.loadImage(avatarURL);

      
      const templateURL = "https://i.postimg.cc/pTCyMNHq/1000002108-50.jpg";
      const template = await Canvas.loadImage(templateURL);

      const canvas = Canvas.createCanvas(template.width, template.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(template, 0, 0, canvas.width, canvas.height);


      const avatarX = 136;
      const avatarY = 154;
      const avatarWidth = 241;
      const avatarHeight = 242;
      const radius = avatarWidth / 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + radius, avatarY + radius, radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarWidth, avatarHeight);
      ctx.restore();

      
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

    
      if (sent && sent.messageID) {
        api.setMessageReaction("🤰", sent.messageID, () => {}, true);
        api.setMessageReaction("😂", sent.messageID, () => {}, true);
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
