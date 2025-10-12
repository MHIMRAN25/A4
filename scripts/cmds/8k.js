const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "upscale",
    version: "4.0",
    role: 0,
    author: "Imran",
    countDown: 5,
    longDescription: "Upscale a replied image to low, medium, high, or 8K quality. Select quality with buttons.",
    category: "image",
    guide: {
      en: "{pn} reply to an image to upscale it interactively."
    }
  },

  onStart: async function({ message, event }) {
    // Check if a replied message contains a photo
    if (!event.messageReply?.attachments?.[0] || event.messageReply.attachments[0].type !== "photo") {
      return message.reply("⚠ Please reply to an image you want to upscale.");
    }

    const originalUrl = event.messageReply.attachments[0].url;

    // Send buttons to choose quality
    await message.reply({
      body: "📌 Choose the quality to upscale your image:",
      buttons: [
        { type: "reply", body: "Low", id: "quality_low" },
        { type: "reply", body: "Medium", id: "quality_medium" },
        { type: "reply", body: "High", id: "quality_high" },
        { type: "reply", body: "8K", id: "quality_8k" }
      ]
    });

    // Button click handler
    global.handleButtonClick = async function(buttonId, userMessage) {
      const qualityMap = {
        quality_low: "low",
        quality_medium: "medium",
        quality_high: "high",
        quality_8k: "8k"
      };

      const quality = qualityMap[buttonId] || "high";

      const filePath = path.join(__dirname, "temp", `upscale_${Date.now()}.jpg`);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      const processingMsg = await message.reply(`🔄 Upscaling your image to ${quality.toUpperCase()} quality... Please wait.`);

      try {
        // Call Upscale.media API
        const response = await axios.post(
          "https://api.upscale.media/api/v1/upscale",
          { image_url: originalUrl, scale: "auto", quality },
          { responseType: "arraybuffer", headers: { "Content-Type": "application/json" } }
        );

        // Save the upscaled image
        fs.writeFileSync(filePath, Buffer.from(response.data));

        // Send the result
        await message.reply({
          body: `✅ Your image has been successfully upscaled to ${quality.toUpperCase()} quality!`,
          attachment: fs.createReadStream(filePath)
        });

        fs.unlinkSync(filePath);
        message.unsend(processingMsg.messageID);

      } catch (error) {
        console.error("Upscale error:", error.response?.data || error.message || error);
        message.reply("❌ Failed to upscale the image. Please try again later.");
      }
    };
  }
};
