const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "8k",
    version: "2.0",
    role: 0,
    author: "Imran",
    countDown: 5,
    longDescription: "Upscale images up to 8K resolution using Upscale.media API (Free & No Key).",
    category: "image",
    guide: {
      en: "{pn} reply to an image to upscale it (optional: {pn} [low|medium|high])."
    }
  },

  onStart: async function ({ message, event, args }) {
    // Ensure an image is replied to
    if (
      !event.messageReply ||
      !event.messageReply.attachments ||
      !event.messageReply.attachments[0] ||
      event.messageReply.attachments[0].type !== "photo"
    ) {
      return message.reply("⚠ Please reply to an image you want to upscale to 8K.");
    }

    // Get the original image URL
    const originalUrl = event.messageReply.attachments[0].url;

    // Optional quality argument
    const quality = args[0] && ["low", "medium", "high"].includes(args[0].toLowerCase())
      ? args[0].toLowerCase()
      : "high";

    const apiUrl = "https://api.upscale.media/api/v1/upscale";
    const filePath = path.join(__dirname, `upscale8k_${Date.now()}.jpg`);

    // Send initial reply
    message.reply(`🔄 Upscaling your image to 8K (${quality} quality)... Please wait.`, async (err, info) => {
      try {
        // Call Upscale.media API
        const response = await axios.post(
          apiUrl,
          { image_url: originalUrl, scale: "auto", quality },
          { responseType: "arraybuffer" }
        );

        // Save enhanced image
        fs.writeFileSync(filePath, Buffer.from(response.data));

        // Send result
        await message.reply({
          body: `✅ Your image has been successfully enhanced to 8K (${quality} quality)!`,
          attachment: fs.createReadStream(filePath)
        });

        // Delete temp file
        fs.unlinkSync(filePath);

        // Unsend "Processing..." message
        message.unsend(info.messageID);
      } catch (error) {
        console.error("8k.onStart error:", error?.response?.data || error.message);
        message.reply("❌ Failed to upscale the image. Please try again later.");
      }
    });
  }
};
