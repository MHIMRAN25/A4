const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "4k",
    aliases: ["hd", "upscale"],
    version: "3.2-Stable",
    author: "Imran x GPT-5",
    countDown: 5,
    role: 0,
    shortDescription: "ছবিকে 4K তে রূপান্তর করে",
    longDescription: "ফ্রি AI আপস্কেল সার্ভার ব্যবহার করে ছবির রেজোলিউশন বাড়ায় (HD/4K)।",
    category: "image",
    guide: {
      en: "{pn} [reply to image]",
    },
  },

  onStart: async function ({ api, event }) {
    const { messageReply, threadID, messageID } = event;

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0)
      return api.sendMessage("📸 অনুগ্রহ করে কোনো ছবিতে রিপ্লাই দাও এবং লিখো: .4k", threadID, messageID);

    const attachment = messageReply.attachments[0];
    if (attachment.type !== "photo")
      return api.sendMessage("❌ শুধু ছবিতে রিপ্লাই দাও!", threadID, messageID);

    const imageURL = attachment.url;
    const outputPath = path.join(__dirname, `/cache/4k_${Date.now()}.jpg`);

    api.sendMessage("🚀 ছবিটি AI দ্বারা 4K তে রূপান্তর হচ্ছে... অনুগ্রহ করে অপেক্ষা করো 💫", threadID, messageID);

    try {
      // ✅ Try API 1
      let response;
      try {
        response = await axios.get(
          `https://image-upscale-api.vercel.app/upscale?image=${encodeURIComponent(imageURL)}`,
          { responseType: "arraybuffer", timeout: 20000 }
        );
      } catch (e) {
        console.log("⚠️ API 1 failed, switching to backup...");
        // ✅ Try API 2 (Fallback)
        response = await axios.get(
          `https://api-inference.huggingface.co/models/Sanster/Lama-Cleaner`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            data: { image_url: imageURL },
            responseType: "arraybuffer",
            timeout: 25000,
          }
        );
      }

      fs.writeFileSync(outputPath, Buffer.from(response.data));
      api.sendMessage(
        {
          body: "✅ এখানে তোমার ছবির 4K সংস্করণ 💎",
          attachment: fs.createReadStream(outputPath),
        },
        threadID,
        () => fs.unlinkSync(outputPath)
      );
    } catch (error) {
      console.error("🚫 Upscale Error:", error.message);
      api.sendMessage("❌ ছবিটা 4K তে রূপান্তর করা যায়নি! সার্ভার ব্যস্ত বা ছবি মেয়াদোত্তীর্ণ হয়েছে।", threadID, messageID);
    }
  },
};
