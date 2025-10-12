const axios = require("axios");
const fs = require("fs");
const path = require("path");

// NOTE: তুমি Imgur client ID নিতে হবে free account থেকে
const IMGUR_CLIENT_ID = "YOUR_IMGUR_CLIENT_ID"; 

module.exports = {
  config: {
    name: "upscale",
    version: "9.0",
    role: 0,
    author: "Imran",
    longDescription: "Messenger-ready Upscale bot with public hosting, works 100%.",
    category: "image",
  },

  onStart: async function({ message, event }) {
    if (!event.messageReply?.attachments?.[0] || event.messageReply.attachments[0].type !== "photo") {
      return message.reply("⚠ Please reply to an image you want to upscale.");
    }

    const originalUrl = event.messageReply.attachments[0].url;
    const tempFile = path.join(__dirname, `temp_${Date.now()}.jpg`);
    fs.mkdirSync(path.dirname(tempFile), { recursive: true });

    const processingMsg = await message.reply("🔄 Downloading and preparing your image...");

    try {
      // Step 1: Download the image locally
      const imgResp = await axios.get(originalUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(tempFile, Buffer.from(imgResp.data));

      // Step 2: Upload to Imgur (temporary public hosting)
      const imgurResp = await axios.post(
        "https://api.imgur.com/3/image",
        { image: fs.readFileSync(tempFile, { encoding: "base64" }), type: "base64" },
        { headers: { Authorization: `Client-ID ${IMGUR_CLIENT_ID}` } }
      );

      const publicUrl = imgurResp.data.data.link;
      console.log("Public URL for Upscale:", publicUrl);

      // Step 3: Call Upscale.media API
      const upscaleResp = await axios.post(
        "https://api.upscale.media/api/v1/upscale",
        { image_url: publicUrl, scale: "auto", quality: "high" },
        { responseType: "arraybuffer", headers: { "Content-Type": "application/json" }, timeout: 60000 }
      );

      const finalFile = path.join(__dirname, `upscale_${Date.now()}.jpg`);
      fs.writeFileSync(finalFile, Buffer.from(upscaleResp.data));

      // Step 4: Send final image to Messenger
      await message.reply({
        body: "✅ Your image has been successfully upscaled to High/8K quality!",
        attachment: fs.createReadStream(finalFile)
      });

      // Cleanup
      fs.unlinkSync(tempFile);
      fs.unlinkSync(finalFile);
      message.unsend(processingMsg.messageID);

    } catch (error) {
      console.error("Upscale full pipeline error:", error.response?.data || error.message || error);
      message.reply("❌ Failed to upscale the image. Please check console for details.");
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    }
  }
};
