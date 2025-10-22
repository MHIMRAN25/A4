const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pregnancy",
    version: "3.5",
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

  // 🔹 Avatar safely get করার জন্য function
  getUserAvatar: async function (uid, usersData) {
    try {
      // Try Graph API first
      const graphURL = `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
      const response = await axios.get(graphURL, { responseType: "arraybuffer" });
      if (response.status === 200) {
        return Buffer.from(response.data, "binary");
      } else throw new Error("Graph fail");
    } catch (e) {
      // Fallback to usersData
      const fallbackURL = await usersData.getAvatarUrl(uid);
      const fallbackRes = await axios.get(fallbackURL, { responseType: "arraybuffer" });
      return Buffer.from(fallbackRes.data, "binary");
    }
  },

  onStart: async function ({ event, message, usersData, getLang, api }) {
    let pathSave, pathBg, pathAvatar;
    try {
      if (module.exports.config.author !== "M H IMRAN")
        return message.reply("❌ এই কমান্ডের author পরিবর্তন করা যাবে না!");

      let uid2;
      if (Object.keys(event.mentions).length > 0)
        uid2 = Object.keys(event.mentions)[0];
      else if (event.messageReply)
        uid2 = event.messageReply.senderID;

      if (!uid2) return message.reply(getLang("noTag"));

      await message.reply("🔎 প্রেগন্যান্সি meme তৈরি হচ্ছে...");

      const userData = await usersData.get(uid2);
      const userName = userData?.name || "User";

      // Paths
      pathAvatar = __dirname + `/cache/${uid2}_avatar.png`;
      pathBg = __dirname + `/cache/pregnancy_bg.png`;
      pathSave = __dirname + `/cache/${uid2}_pregnancy_result.png`;

      const avatarBuffer = await this.getUserAvatar(uid2, usersData);
      fs.writeFileSync(pathAvatar, avatarBuffer);

      
      const bgUrl = "https://files.catbox.moe/k1drry.png";
      const bgRes = await axios.get(bgUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(pathBg, Buffer.from(bgRes.data, "binary"));

      
      const bg = await loadImage(pathBg);
      const avatar = await loadImage(pathAvatar);
      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      
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
      ctx.fillText("প্রেগন্যান্সি টেস্ট রেজাল্ট", canvas.width / 2, canvas.height - 40);

      fs.writeFileSync(pathSave, canvas.toBuffer());

      
      const funnyTexts = [
        `🤰 অভিনন্দন ${userName}, তোমার রিপোর্ট পজিটিভ এসেছে!`,
        `😂 ওহ না… ${userName} এখন মা/বাবা হতে যাচ্ছে!`,
        `👶 ${userName} এক্সপেক্ট করছে! প্রস্তুত হও…`,
        `😳 ডাক্তার বলছে ${userName} এর টেস্ট রেজাল্ট পজিটিভ!`
      ];
      const finalText = funnyTexts[Math.floor(Math.random() * funnyTexts.length)];

    
      const sent = await message.reply({
        body: finalText,
        attachment: fs.createReadStream(pathSave),
        mentions: [{ tag: userName, id: uid2 }]
      });

      if (sent?.messageID) {
        api.setMessageReaction("🤰", sent.messageID, () => {}, true);
        api.setMessageReaction("😂", sent.messageID, () => {}, true);
      }

    } catch (err) {
      console.error("❌ ERROR:", err);
      message.reply("⚠️ Error: " + err.message);
    } finally {
      if (pathSave && fs.existsSync(pathSave)) fs.unlinkSync(pathSave);
      if (pathAvatar && fs.existsSync(pathAvatar)) fs.unlinkSync(pathAvatar);
      if (pathBg && fs.existsSync(pathBg)) fs.unlinkSync(pathBg);
    }
  }
};
