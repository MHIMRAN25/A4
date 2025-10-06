const axios = require("axios");
require("dotenv").config();

module.exports = {
  config: {
    name: "4k",
    aliases: ["4k", "superhd"],
    version: "1.0",
    author: "MH-TEAM",
    countDown: 5,
    role: 0,
    shortDescription: "Enhance image to 4K using Real-ESRGAN",
    longDescription: "Uses the Hugging Face Real-ESRGAN model to upscale any image to 4x (4K quality).",
    category: "utility",
    guide: {
      en: "{pn} <image URL or reply with an image>"
    }
  },

  onStart: async function ({ event, message, args }) {
    try {
      let imageUrl;

      if (event.messageReply && event.messageReply.attachments && event.messageReply.attachments[0]?.url) {
        imageUrl = event.messageReply.attachments[0].url;
      } else if (args[0]) {
        imageUrl = args[0];
      } else {
        return message.reply("📸 Please reply to an image or provide a valid image URL!");
      }

      message.reply("🔄 Enhancing your image to 4K... please wait a few seconds!");

      const response = await axios({
        method: "POST",
        url: "https://api-inference.huggingface.co/models/caidas/swin2SR-classical-sr-x4-64",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify({ inputs: imageUrl }),
        responseType: "arraybuffer",
      });

      if (!response.data) return message.reply("❌ Failed to process the image. Try again later.");

      message.reply({
        body: "✅ Successfully enhanced your image to 4K quality!",
        attachment: Buffer.from(response.data, "binary"),
      });

    } catch (err) {
      console.error(err);
      message.reply("⚠️ Error while enhancing image! Please check your Hugging Face API token.");
    }
  }
};
