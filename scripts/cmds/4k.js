const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "4k",
    aliases: ["enhance", "hd"],
    version: "1.0",
    author: "Imran | GPT-5",
    countDown: 10,
    role: 0,
    shortDescription: "Enhance image to 4K quality",
    longDescription: "Enhance a low-quality image into 4K using DeepAI API",
    category: "image",
    guide: {
      en: "{pn} (reply to an image)"
    }
  },

  onStart: async function ({ message, event }) {
    if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
      return message.reply("⚠️ Please reply to an image you want to enhance to 4K.");
    }

    const attachment = event.messageReply.attachments[0];
    if (!attachment.url) {
      return message.reply("❌ Could not find image URL. Please try again.");
    }

    const apiKey = "9231304c-17b4-4fd9-aae1-ab8604bea33f"; // DeepAI API key
    const imageUrl = attachment.url;
    const outputPath = path.join(__dirname, "4k_result.jpg");

    message.reply("🔄 Enhancing your image to 4K... please wait.");

    try {
      const response = await axios.post(
        "https://api.deepai.org/api/torch-srgan",
        { image: imageUrl },
        { headers: { "api-key": apiKey } }
      );

      const imageResp = await axios.get(response.data.output_url, { responseType: "arraybuffer" });
      fs.writeFileSync(outputPath, Buffer.from(imageResp.data, "binary"));

      await message.reply({ body: "✅ Image enhanced to 4K successfully!", attachment: fs.createReadStream(outputPath) });
      fs.unlinkSync(outputPath);
    } catch (error) {
      console.error(error);
      message.reply("❌ Failed to enhance image. Please check your API key or try again later.");
    }
  }
};
