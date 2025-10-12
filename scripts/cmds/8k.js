const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "upscale",
    version: "2.0",
    role: 0,
    author: "Imran",
    longDescription: "Upscale a replied image to High/8K quality without buttons. Simple and reliable.",
    category: "image",
  },

  onStart: async function({ message, event }) {
    // চেক করা হচ্ছে ইউজার ছবিতে রিপ্লাই করেছে কিনা
    if (!event.messageReply?.attachments?.[0] || event.messageReply.attachments[0].type !== "photo") {
      return message.reply("⚠ অনুগ্রহ করে যে ছবিটি আপস্কেল করতে চান সেটিতে রিপ্লাই করুন।");
    }

    const originalUrl = event.messageReply.attachments[0].url;
    const filePath = path.join(__dirname, `temp_upscale_${Date.now()}.jpg`);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    // Processing মেসেজ দেখানো হচ্ছে
    const processingMsg = await message.reply("🔄 আপনার ছবি High/8K মানে আপস্কেল করা হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...");

    try {
      // Upscale.media API কল
      const response = await axios.post(
        "https://api.upscale.media/api/v1/upscale",
        { image_url: originalUrl, scale: "auto", quality: "high" },
        { responseType: "arraybuffer", headers: { "Content-Type": "application/json" }, timeout: 60000 }
      );

      // আপস্কেল করা ছবি সংরক্ষণ
      fs.writeFileSync(filePath, Buffer.from(response.data));

      // ফলাফল পাঠানো
      await message.reply({
        body: "✅ আপনার ছবি সফলভাবে High/8K মানে আপস্কেল করা হয়েছে!",
        attachment: fs.createReadStream(filePath)
      });

    } catch (error) {
      console.error("Upscale error:", error.response?.data || error.message || error);
      message.reply("❌ ছবিটি আপস্কেল করতে ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন।");
    } finally {
      // Temp ফাইল মুছে ফেলা
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      // Processing মেসেজ আনসেন্ড
      message.unsend(processingMsg.messageID);
    }
  }
};
