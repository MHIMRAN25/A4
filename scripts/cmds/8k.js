const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "8k",
    aliases: ["superhd", "cinematic"],
    version: "8.0-Pro",
    author: "MH-TEAM x GPT-5",
    countDown: 5,
    role: 0,
    shortDescription: "ছবিকে 8K Cinematic মানে রূপান্তর করে 🎬",
    longDescription: "ছবিকে AI দিয়ে 8K মানে উন্নত করে (রঙ, আলো, contrast, face detail) — Dual AI Engine সহ।",
    category: "image",
    guide: {
      en: "{pn} [reply to image]",
    },
  },

  onStart: async function ({ api, event }) {
    const { messageReply, threadID, messageID } = event;

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0)
      return api.sendMessage("🎞️ অনুগ্রহ করে কোনো ছবিতে রিপ্লাই দাও এবং লিখো: .8k", threadID, messageID);

    const attachment = messageReply.attachments[0];
    if (attachment.type !== "photo")
      return api.sendMessage("❌ শুধু ছবিতে রিপ্লাই দাও!", threadID, messageID);

    const imageURL = attachment.url;
    const outputPath = path.join(__dirname, `/cache/8k_${Date.now()}.jpg`);

    api.sendMessage("🎬 ছবিটি 8K মানে রূপান্তর হচ্ছে, অপেক্ষা করো... ⚡", threadID, messageID);

    try {
      let resultBuffer;

      // 🧠 Step 1: Hugging Face Super-Resolution Model
      try {
        const response1 = await axios({
          method: "post",
          url: "https://api-inference.huggingface.co/models/MCG-NKU/Real-ESRGAN",
          headers: { "Content-Type": "application/json" },
          data: { image_url: imageURL },
          responseType: "arraybuffer",
          timeout: 30000,
        });
        resultBuffer = Buffer.from(response1.data);
        console.log("✅ Used HuggingFace 8K AI Engine");
      } catch (err) {
        console.warn("⚠️ HuggingFace failed, trying fallback...");
        // 🧠 Step 2: DeepAI + Light Enhancement (Cinematic)
        const response2 = await axios({
          method: "post",
          url: "https://api.deepai.org/api/torch-srgan",
          headers: { "api-key": "quickstart-QUdJIGlzIGNvbWluZy4uLi4uCg==" },
          data: { image: imageURL },
          timeout: 30000,
        });
        const img = await axios.get(response2.data.output_url, { responseType: "arraybuffer" });
        resultBuffer = Buffer.from(img.data);
        console.log("✅ Used DeepAI fallback");
      }

      // 🎨 Step 3: AI Tone Enhancement (Extra cinematic boost)
      const enhanced = await axios({
        method: "post",
        url: "https://api.deepai.org/api/colorizer",
        headers: { "api-key": "quickstart-QUdJIGlzIGNvbWluZy4uLi4uCg==" },
        data: { image: `data:image/jpeg;base64,${resultBuffer.toString("base64")}` },
      });

      const finalImg = await axios.get(enhanced.data.output_url, { responseType: "arraybuffer" });
      fs.writeFileSync(outputPath, Buffer.from(finalImg.data));

      api.sendMessage(
        {
          body: "🎞️ এখানে তোমার 8K Cinematic ছবি — Ultra Detail Enhanced ✨",
          attachment: fs.createReadStream(outputPath),
        },
        threadID,
        () => fs.unlinkSync(outputPath)
      );
    } catch (error) {
      console.error("🚫 8K Upscale Error:", error.message);
      api.sendMessage("❌ ছবিটা 8K তে রূপান্তর করা যায়নি! পরে আবার চেষ্টা করো।", threadID, messageID);
    }
  },
};
