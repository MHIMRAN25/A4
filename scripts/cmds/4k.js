const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "4k",
    aliases: ["hd", "upscale"],
    version: "5.0-Stable",
    author: "MH-TEAM x GPT-5",
    countDown: 5,
    role: 0,
    shortDescription: "ছবিকে 4K তে রূপান্তর করে (Stable Dual Engine)",
    longDescription: "ছবিকে AI দিয়ে 4K / HD মানে রূপান্তর করে — Hugging Face + DeepAI fallback ব্যবহার করে।",
    category: "image",
    guide: {
      en: "{pn} [reply to image]",
    },
  },

  onStart: async function ({ api, event }) {
    const { messageReply, threadID, messageID } = event;

    // ✅ ১ম ধাপ: চেক করো ইউজার ছবিতে রিপ্লাই দিয়েছে কিনা
    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0)
      return api.sendMessage("📸 অনুগ্রহ করে কোনো ছবিতে রিপ্লাই দাও এবং লিখো: .4k", threadID, messageID);

    const attachment = messageReply.attachments[0];
    if (attachment.type !== "photo")
      return api.sendMessage("❌ শুধু ছবিতে রিপ্লাই দাও!", threadID, messageID);

    const imageURL = attachment.url;
    const outputPath = path.join(__dirname, `/cache/4k_${Date.now()}.jpg`);

    api.sendMessage("🚀 ছবিটি 4K মানে রূপান্তর হচ্ছে, অনুগ্রহ করে অপেক্ষা করো 💫", threadID, messageID);

    try {
      let resultBuffer;

      // ✅ API 1: Hugging Face (RealESRGAN model)
      try {
        const response1 = await axios({
          method: "post",
          url: "https://api-inference.huggingface.co/models/caidas/swin2SR-classical-sr-x4-64",
          headers: { "Content-Type": "application/json" },
          data: { image_url: imageURL },
          responseType: "arraybuffer",
          timeout: 25000,
        });
        resultBuffer = Buffer.from(response1.data);
        console.log("✅ Used HuggingFace upscale engine");
      } catch (err) {
        console.warn("⚠️ HuggingFace failed, trying DeepAI...");
        // ✅ API 2: DeepAI (Fallback)
        const response2 = await axios({
          method: "post",
          url: "https://api.deepai.org/api/torch-srgan",
          headers: { "api-key": "quickstart-QUdJIGlzIGNvbWluZy4uLi4K" },
          data: { image: imageURL },
          timeout: 25000,
        });
        const img = await axios.get(response2.data.output_url, { responseType: "arraybuffer" });
        resultBuffer = Buffer.from(img.data);
        console.log("✅ Used DeepAI fallback engine");
      }

      fs.writeFileSync(outputPath, resultBuffer);

      api.sendMessage(
        {
          body: "✅ এখানে তোমার ছবির 4K সংস্করণ (AI Enhanced) ✨",
          attachment: fs.createReadStream(outputPath),
        },
        threadID,
        () => fs.unlinkSync(outputPath)
      );
    } catch (error) {
      console.error("🚫 4K Upscale Error:", error.message);
      api.sendMessage("❌ ছবিটা 4K তে রূপান্তর করা যায়নি! পরে আবার চেষ্টা করো।", threadID, messageID);
    }
  },
};
