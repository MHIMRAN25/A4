const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "upscale",
    version: "7.0",
    role: 0,
    author: "Imran",
    longDescription: "Upscale a replied image using Messenger Quick Replies (Low, Medium, High, 8K).",
    category: "image",
  },

  onStart: async function({ message, event }) {
    // চেক করা হচ্ছে reply করা ছবি আছে কিনা
    if (!event.messageReply?.attachments?.[0] || event.messageReply.attachments[0].type !== "photo") {
      return message.reply("⚠ Please reply to an image you want to upscale.");
    }

    const originalUrl = event.messageReply.attachments[0].url;

    // Quick Replies পাঠানো
    await message.reply({
      body: "📌 Choose the quality to upscale your image:",
      quick_replies: [
        { content_type: "text", title: "Low", payload: "QUALITY_LOW" },
        { content_type: "text", title: "Medium", payload: "QUALITY_MEDIUM" },
        { content_type: "text", title: "High", payload: "QUALITY_HIGH" },
        { content_type: "text", title: "8K", payload: "QUALITY_8K" }
      ]
    });

    // Quick Reply click handler (Messenger specific)
    global.handleQuickReply = async function(payload, userMessage) {
      const qualityMap = {
        QUALITY_LOW: "low",
        QUALITY_MEDIUM: "medium",
        QUALITY_HIGH: "high",
        QUALITY_8K: "8k"
      };

      const quality = qualityMap[payload] || "high";
      const filePath = path.join(__dirname, "temp", `upscale_${Date.now()}.jpg`);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      const processingMsg = await message.reply(`🔄 Upscaling your image to ${quality.toUpperCase()} quality...`);

      try {
        // API call
        const response = await axios.post(
          "https://api.upscale.media/api/v1/upscale",
          { image_url: originalUrl, scale: "auto", quality },
          { responseType: "arraybuffer", headers: { "Content-Type": "application/json" }, timeout: 60000 }
        );

        // Save image
        fs.writeFileSync(filePath, Buffer.from(response.data));

        // Send the upscaled image
        await message.reply({
          body: `✅ Your image has been successfully upscaled to ${quality.toUpperCase()} quality!`,
          attachment: fs.createReadStream(filePath)
        });

      } catch (error) {
        console.error("Upscale error:", error.response?.data || error.message || error);
        message.reply("❌ Failed to upscale the image. Please check console for details.");
      } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        message.unsend(processingMsg.messageID);
      }
    };
  }
};
