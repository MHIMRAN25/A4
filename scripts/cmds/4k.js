const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "4k",
    aliases: ["hd", "enhance"],
    version: "1.0",
    author: "MH-BOT TEAM",
    countDown: 5,
    role: 0,
    shortDescription: "Convert image to 4K HD",
    longDescription: "Upscale and enhance any image to 4K HD quality using AI API",
    category: "image",
    guide: {
      en: "{pn} [reply to image]"
    }
  },

  onStart: async function ({ api, event, message }) {
    const { threadID, messageID, type, messageReply } = event;

    if (type !== "message_reply" || !messageReply.attachments[0] || messageReply.attachments[0].type !== "photo") {
      return message.reply("⚠️ অনুগ্রহ করে কোনো ছবিতে reply করে কমান্ড দিন — উদাহরণ: 4k");
    }

    const imgUrl = messageReply.attachments[0].url;
    const msg = await message.reply("🛠️ ছবিটি 4K HD তে রূপান্তর করা হচ্ছে, একটু অপেক্ষা করুন...");

    try {
      // ✅ Use free upscaler API (replace if you have your own)
      const apiURL = `https://api-inference.huggingface.co/models/camenduru/esrgan`;
      const response = await axios.post(
        apiURL,
        { inputs: imgUrl },
        {
          headers: { Authorization: `Bearer hf_your_token_here` },
          responseType: "arraybuffer"
        }
      );

      const outputPath = path.join(__dirname, "cache", `4k_${Date.now()}.png`);
      fs.writeFileSync(outputPath, Buffer.from(response.data, "binary"));

      await message.reply({
        body: "✅ 4K HD Version Ready!",
        attachment: fs.createReadStream(outputPath)
      });

      fs.unlinkSync(outputPath);
    } catch (err) {
      console.error(err);
      message.reply("❌ দুঃখিত, ছবিটা আপস্কেল করা যায়নি!");
    } finally {
      api.unsendMessage(msg.messageID);
    }
  }
};
