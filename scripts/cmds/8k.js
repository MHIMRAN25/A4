const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "8k",
    version: "8.0",
    role: 0,
    author: "Imran",
    longDescription: "Upscale Messenger images using Base64 (works with private URLs).",
    category: "image",
  },

  onStart: async function({ message, event }) {
    if (!event.messageReply?.attachments?.[0] || event.messageReply.attachments[0].type !== "photo") {
      return message.reply("⚠ Please reply to an image you want to upscale.");
    }

    const originalUrl = event.messageReply.attachments[0].url;
    const filePath = path.join(__dirname, `upscale_${Date.now()}.jpg`);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    const processingMsg = await message.reply("🔄 Upscaling your image (Base64)...");

    try {
      // Download image from Messenger CDN
      const imgResp = await axios.get(originalUrl, { responseType: "arraybuffer" });
      const base64Image = Buffer.from(imgResp.data, 'binary').toString('base64');

      // Send to Upscale.media API using base64
      const response = await axios.post(
        "https://api.upscale.media/api/v1/upscale",
        { image: base64Image, scale: "auto", quality: "high" },
        { responseType: "arraybuffer", headers: { "Content-Type": "application/json" }, timeout: 60000 }
      );

      fs.writeFileSync(filePath, Buffer.from(response.data));

      await message.reply({
        body: "✅ Your image has been successfully upscaled!",
        attachment: fs.createReadStream(filePath)
      });

    } catch (error) {
      console.error("Upscale Base64 error:", error.response?.data || error.message || error);
      message.reply("❌ Failed to upscale the image. Possibly Messenger CDN URL issue.");
    } finally {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      message.unsend(processingMsg.messageID);
    }
  }
};
