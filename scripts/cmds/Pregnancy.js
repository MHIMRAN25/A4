const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pregnancy",
    version: "4.1",
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

  onStart: async function ({ event, message, usersData, getLang, api }) {
    let pathSave, pathBg, pathAvatar;
    try {
      if (module.exports.config.author !== "M H IMRAN")
        return message.reply("❌ এই কমান্ডের author পরিবর্তন করা যাবে না!");

      await fs.ensureDir(__dirname + "/cache");

      let uid2;
      if (Object.keys(event.mentions).length > 0) uid2 = Object.keys(event.mentions)[0];
      else if (event.messageReply) uid2 = event.messageReply.senderID;
      if (!uid2) return message.reply(getLang("noTag"));

      await message.reply("🔎 প্রেগন্যান্সি meme তৈরি হচ্ছে...");

      pathAvatar = __dirname + `/cache/${uid2}_avatar.png`;
      pathBg = __dirname + `/cache/pregnancy_bg.png`;
      pathSave = __dirname + `/cache/${uid2}_pregnancy_result.png`;

      // 🟢 Get Avatar
      async function getUserAvatar(uid) {
        try {
          const graphURL = `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
          const res = await axios.get(graphURL, { responseType: "arraybuffer", timeout: 10000 });
          if (res.status === 200 && res.data.byteLength > 5000) return Buffer.from(res.data, "binary");
          throw new Error("Graph failed");
        } catch (e) {
          const fallbackURL = await usersData.getAvatarUrl(uid);
          const fallbackRes = await axios.get(fallbackURL, { responseType: "arraybuffer" });
          return Buffer.from(fallbackRes.data, "binary");
        }
      }

      const avatarBuffer = await getUserAvatar(uid2);
      fs.writeFileSync(pathAvatar, avatarBuffer);

      // 🟢 Background (Updated)
      const bgUrl = "https://i.postimg.cc/L8rRR828/pregnancy-template.png";
      const bgRes = await axios.get(bgUrl, { responseType: "arraybuffer", timeout: 15000 });
      fs.writeFileSync(pathBg, Buffer.from(bgRes.data, "binary"));

      // 🟢 Canvas
      const bg = await loadImage(pathBg);
      const avatar = await loadImage(pathAvatar);
      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // 🟢 Draw avatar
      const avatarRadius = 230;
      const avatarSize = avatarRadius * 2;
      const avatarX = 262;
      const avatarY = 295;

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      // 🟢 Text
      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#ff0066";
      ctx.textAlign = "center";
      ctx.fillText("প্রেগন্যান্সি টেস্ট রেজাল্ট", canvas.width / 2, canvas.height - 40);

      fs.writeFileSync(pathSave, canvas.toBuffer());

      // 🟢 Random funny text
      const funnyTexts = [
        `🤰 অভিনন্দন, রিপোর্ট পজিটিভ!`,
        `😂 ওহ না… এখন মা/বাবা হতে যাচ্ছে!`,
        `👶 এক্সপেক্ট করছে! প্রস্তুত হও…`,
        `😳 ডাক্তার বলছে টেস্ট পজিটিভ!`
      ];
      const finalText = funnyTexts[Math.floor(Math.random() * funnyTexts.length)];

      // 🟢 Send meme
      const sent = await message.reply({
        body: finalText,
        attachment: fs.createReadStream(pathSave)
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
};const { loadImage, createCanvas } = require("canvas");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "pregnancy",
    version: "4.1",
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

  onStart: async function ({ event, message, usersData, getLang, api }) {
    let pathSave, pathBg, pathAvatar;
    try {
      if (module.exports.config.author !== "M H IMRAN")
        return message.reply("❌ এই কমান্ডের author পরিবর্তন করা যাবে না!");

      await fs.ensureDir(__dirname + "/cache");

      let uid2;
      if (Object.keys(event.mentions).length > 0) uid2 = Object.keys(event.mentions)[0];
      else if (event.messageReply) uid2 = event.messageReply.senderID;
      if (!uid2) return message.reply(getLang("noTag"));

      await message.reply("🔎 প্রেগন্যান্সি meme তৈরি হচ্ছে...");

      pathAvatar = __dirname + `/cache/${uid2}_avatar.png`;
      pathBg = __dirname + `/cache/pregnancy_bg.png`;
      pathSave = __dirname + `/cache/${uid2}_pregnancy_result.png`;

      // 🟢 Get Avatar
      async function getUserAvatar(uid) {
        try {
          const graphURL = `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`;
          const res = await axios.get(graphURL, { responseType: "arraybuffer", timeout: 10000 });
          if (res.status === 200 && res.data.byteLength > 5000) return Buffer.from(res.data, "binary");
          throw new Error("Graph failed");
        } catch (e) {
          const fallbackURL = await usersData.getAvatarUrl(uid);
          const fallbackRes = await axios.get(fallbackURL, { responseType: "arraybuffer" });
          return Buffer.from(fallbackRes.data, "binary");
        }
      }

      const avatarBuffer = await getUserAvatar(uid2);
      fs.writeFileSync(pathAvatar, avatarBuffer);

      // 🟢 Background (Updated)
      const bgUrl = "https://i.postimg.cc/L8rRR828/pregnancy-template.png";
      const bgRes = await axios.get(bgUrl, { responseType: "arraybuffer", timeout: 15000 });
      fs.writeFileSync(pathBg, Buffer.from(bgRes.data, "binary"));

      // 🟢 Canvas
      const bg = await loadImage(pathBg);
      const avatar = await loadImage(pathAvatar);
      const canvas = createCanvas(bg.width, bg.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      // 🟢 Draw avatar
      const avatarRadius = 230;
      const avatarSize = avatarRadius * 2;
      const avatarX = 262;
      const avatarY = 295;

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
      ctx.restore();

      // 🟢 Text
      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#ff0066";
      ctx.textAlign = "center";
      ctx.fillText("প্রেগন্যান্সি টেস্ট রেজাল্ট", canvas.width / 2, canvas.height - 40);

      fs.writeFileSync(pathSave, canvas.toBuffer());

      // 🟢 Random funny text
      const funnyTexts = [
        `🤰 অভিনন্দন, রিপোর্ট পজিটিভ!`,
        `😂 ওহ না… এখন মা/বাবা হতে যাচ্ছে!`,
        `👶 এক্সপেক্ট করছে! প্রস্তুত হও…`,
        `😳 ডাক্তার বলছে টেস্ট পজিটিভ!`
      ];
      const finalText = funnyTexts[Math.floor(Math.random() * funnyTexts.length)];

      // 🟢 Send meme
      const sent = await message.reply({
        body: finalText,
        attachment: fs.createReadStream(pathSave)
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
};bkash 
