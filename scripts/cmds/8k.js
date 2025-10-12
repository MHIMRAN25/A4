const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

module.exports = {
  config: {
    name: "8k",
    version: "1.0",
    role: 0,
    author: "Imran",
    countDown: 5,
    longDescription: "Upscale a replied image to 8K using public hosting + 8K API",
    category: "image",
    guide: {
      en: "{pn} reply to an image to upscale it to 8K."
    }
  },

  onStart: async function({ message, event }) {
    // Check if image is replied
    if (!event.messageReply?.attachments?.[0] || event.messageReply.attachments[0].type !== "photo") {
      return message.reply("⚠ Please reply to an image to upscale it.");
    }

    const originalUrl = event.messageReply.attachments[0].url;

    // 1️⃣ Download image temporarily
    const tempFilePath = path.join(__dirname, `temp_${Date.now()}.jpg`);
    const response = await axios.get(originalUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(tempFilePath, Buffer.from(response.data));

    // 2️⃣ Upload to Imgur (public URL)
    const form = new FormData();
    form.append("image", fs.createReadStream(tempFilePath));
    const imgurRes = await axios.post("https://api.imgur.com/3/image", form, {
      headers: {
        ...form.getHeaders(),
        Authorization: "Client-ID YOUR_IMGUR_CLIENT_ID" // replace with your free Imgur Client ID
      }
    });

    const publicUrl = imgurRes.data.data.link;
    fs.unlinkSync(tempFilePath); // delete temporary file

    await message.reply("🔄 Image uploaded to public URL. Now upscaling to 8K...");

    // 3️⃣ Call 8K upscale API
    try {
      const upscaleRes = await axios.post(
        "https://api.upscale.media/api/v1/upscale",
        { image_url: publicUrl, scale: "auto", quality: "8k" },
        { responseType: "arraybuffer", headers: { "Content-Type": "application/json" } }
      );

      // 4️⃣ Send result to Messenger
      const resultPath = path.join(__dirname, `upscaled_${Date.now()}.jpg`);
      fs.writeFileSync(resultPath, Buffer.from(upscaleRes.data));

      await message.reply({
        body: "✅ Here is your 8K upscaled image!",
        attachment: fs.createReadStream(resultPath)
      });

      fs.unlinkSync(resultPath); // cleanup
    } catch (err) {
      console.error("8K upscale error:", err.response?.data || err.message || err);
      message.reply("❌ Failed to upscale to 8K. Try again later.");
    }
  }
};
