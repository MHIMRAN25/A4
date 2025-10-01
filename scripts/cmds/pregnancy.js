const Canvas = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "pregnancy",
    version: "3.0",
    author: "M H IMRAN", // ❌ কেউ চাইলে পরিবর্তন করতে পারবে না
    countDown: 5,
    role: 2,
    shortDescription: "Pregnancy meme generator",
    longDescription: "Make a pregnancy meme using multiple configurable templates",
    category: "fun",
    guide: {
      en: "{pn} [template number] @tag অথবা রিপ্লাই করুন"
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

      // ✅ Mention / Reply থেকে UID বের করা
      if (Object.keys(event.mentions).length > 0) {
        uid2 = Object.keys(event.mentions)[0];
      } else if (event.messageReply) {
        uid2 = event.messageReply.senderID;
      }

      if (!uid2) return message.reply(getLang("noTag"));
      await message.reply("🔎 w8 plz...");

      // ✅ ইউজারের অ্যাভাটার আনা
      const avatarURL = await usersData.getAvatarUrl(uid2);
      if (!avatarURL) return message.reply("⚠️ ইউজারের অ্যাভাটার আনা যাচ্ছে না!");
      const avatar = await Canvas.loadImage(avatarURL);

      // ✅ ফন্ট রেজিস্টার (বাংলা + ইংরেজি)
      Canvas.registerFont(path.join(__dirname, "assets", "NotoSans-Bengali.ttf"), { family: "NotoSans" });

      // ✅ একাধিক টেমপ্লেট config
      const templates = [
        {
          file: path.join(__dirname, "assets/pregnancy_template.png"),
          avatar: { x: 262, y: 295, radius: 230 },
          text: { x: "center", y: -80 }
        },
        {
          file: path.join(__dirname, "assets/pregnancy_template2.png"),
          avatar: { x: 150, y: 200, radius: 180 },
          text: { x: "center", y: -60 }
        }
      ];

      // ✅ Template Select করা
      let templateIndex = parseInt(args[0]) - 1;
      if (isNaN(templateIndex) || templateIndex < 0 || templateIndex >= templates.length) {
        templateIndex = Math.floor(Math.random() * templates.length);
      }

      let chosen = templates[templateIndex];
      if (!(await fs.pathExists(chosen.file))) {
        // যদি টেমপ্লেট না থাকে, fallback অন্যটায় যাবে
        chosen = templates.find(t => fs.existsSync(t.file));
        if (!chosen) {
          return message.reply("⚠️ কোনো টেমপ্লেট পাওয়া যায়নি!");
        }
      }

      const template = await Canvas.loadImage(chosen.file);

      // 🖼️ ক্যানভাস সেটআপ
      const canvas = Canvas.createCanvas(template.width, template.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

      // 🎯 Avatar বসানো
      const { x, y, radius } = chosen.avatar;
      const size = radius * 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, x, y, size, size);
      ctx.restore();

      // 🎯 টেক্সট লেখা
      ctx.font = "bold 40px NotoSans";
      ctx.fillStyle = "#ff0066";
      ctx.textAlign = "center";
      ctx.fillText("Congratulations", canvas.width / 2, canvas.height + chosen.text.y);

      // ফাইল সেভ
      pathSave = `${__dirname}/tmp/${uid2}_pregnancy.png`;
      await fs.outputFile(pathSave, canvas.toBuffer());

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

      const finalText = args.slice(1).join(" ") || funnyTexts[Math.floor(Math.random() * funnyTexts.length)];

      const sent = await message.reply({
        body: finalText,
        attachment: fs.createReadStream(pathSave)
      });

      // ✅ fb-chat-api style reaction
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
      message.reply("⚠️ meme তৈরি করতে সমস্যা হয়েছে: " + err.message);
    } finally {
      if (pathSave && await fs.pathExists(pathSave)) {
        await fs.remove(pathSave);
      }
    }
  }
};
