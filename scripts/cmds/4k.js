const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "4k",
    aliases: ["hd", "upscale", "8k"],
    version: "3.5",
    author: "Imran x GPT-5",
    countDown: 5,
    role: 0,
    shortDescription: "ছবিকে 4K বা 8K তে রূপান্তর করে",
    longDescription: "AI ব্যবহার করে ছবির কোয়ালিটি উন্নত করে (HD, 4K, 8K পর্যন্ত)",
    category: "image",
    guide: {
      en: "{pn} (reply to image)",
    },
  },

  onStart: async function ({ api, event }) {
    const { messageReply, threadID, messageID } = event;

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
      return api.sendMessage("📸 অনুগ্রহ করে কোনো ছবিতে রিপ্লাই দাও এবং লিখো: .4k", threadID, messageID);
    }

    const attachment = messageReply.attachments[0];
    if (attachment.type !== "photo") {
      return api.sendMessage("❌ শুধু ছবিতে রিপ্লাই দাও!", threadID, messageID);
    }

    const imageURL = attachment.url;
    const outputPath = path.join(__dirname, `/cache/4k_${Date.now()}.jpg`);
    api.sendMessage("🔄 ছবিটি 4K/8K তে রূপান্তর হচ্ছে, অনুগ্রহ করে অপেক্ষা করো...", threadID, messageID);

    // === ৫টি API fallback ===
    const apis = [
      `https://image-upscaler-v2.vercel.app/api?url=${encodeURIComponent(imageURL)}`,
      `https://api-inference.huggingface.co/models/Sanster/Lama-Cleaner`,
      `https://api.deepai.org/api/torch-srgan`,
      `https://api.getimg.ai/v1/transform/upscale?image=${encodeURIComponent(imageURL)}`,
      `https://imageai.upscaler.workers.dev/?url=${encodeURIComponent(imageURL)}`
    ];

    let success = false;

    for (const apiURL of apis) {
      try {
        const res = await axios.get(apiURL, { responseType: "arraybuffer" });
        if (res.status === 200) {
          fs.writeFileSync(outputPath, Buffer.from(res.data));
          success = true;
          break;
        }
      } catch (err) {
        console.warn(`⚠️ Fallback failed on ${apiURL} - ${err.response?.status || err.message}`);
        continue;
      }
    }

    if (!success) {
      return api.sendMessage(
        "❌ ছবিটা 4K তে রূপান্তর করা যায়নি! সার্ভারগুলো ব্যস্ত বা ছবির লিংক মেয়াদোত্তীর্ণ। কিছুক্ষণ পর আবার চেষ্টা করো।",
        threadID,
        messageID
      );
    }

    // === ছবি সফলভাবে পাঠানো ===
    api.sendMessage(
      {
        body: "✅ এখানে তোমার 4K/8K সংস্করণ!",
        attachment: fs.createReadStream(outputPath),
      },
      threadID,
      () => fs.unlinkSync(outputPath)
    );
  },
};
