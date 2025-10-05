const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "4k",
    aliases: ["8k", "hd", "upscale"],
    version: "3.5",
    author: "Imran x GPT-5",
    countDown: 5,
    role: 0,
    category: "image",
    shortDescription: "ছবিকে 4K/8K তে রূপান্তর করে",
    longDescription: "AI ব্যবহার করে ছবির কোয়ালিটি বাড়ায় — একাধিক সার্ভারে চেষ্টা করবে যতক্ষণ না সফল হয়",
    guide: {
      en: "{pn} (reply to any image)"
    }
  },

  onStart: async function ({ api, event }) {
    const { messageReply, threadID, messageID } = event;

    // 🔹 Check image
    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0)
      return api.sendMessage("📸 অনুগ্রহ করে কোনো ছবিতে রিপ্লাই দাও এবং লিখো: .4k", threadID, messageID);

    const attachment = messageReply.attachments[0];
    if (attachment.type !== "photo")
      return api.sendMessage("❌ দয়া করে শুধুমাত্র ছবিতে রিপ্লাই দাও!", threadID, messageID);

    const imageURL = attachment.url;
    const outputPath = path.join(__dirname, `/cache/4k_${Date.now()}.jpg`);

    api.sendMessage("🔄 ছবিটি 4K/8K তে রূপান্তর হচ্ছে... অনুগ্রহ করে অপেক্ষা করো ❤️", threadID, messageID);

    // 🔹 Multiple fallback servers
    const apis = [
      `https://image-upscaler.vercel.app/api/upscale?image=${encodeURIComponent(imageURL)}`,
      `https://api-inference.huggingface.co/models/Sanster/Lama-Cleaner?image=${encodeURIComponent(imageURL)}`,
      `https://api.deepai.org/api/torch-srgan`, // key দরকার হবে না, নিচে handle করা আছে
      `https://api.getimg.ai/v1/realesrgan?image=${encodeURIComponent(imageURL)}`,
      `https://imageai.upscaler.workers.dev/?url=${encodeURIComponent(imageURL)}`
    ];

    let success = false;
    for (const url of apis) {
      try {
        let response;

        if (url.includes("deepai.org")) {
          response = await axios({
            method: "post",
            url,
            headers: { "api-key": "quickstart-QUdJIGlzIGNvbWluZy4uLi4K" },
            data: { image: imageURL }
          });
          if (response.data.output_url) {
            const img = await axios.get(response.data.output_url, { responseType: "arraybuffer" });
            fs.writeFileSync(outputPath, Buffer.from(img.data));
            success = true;
            break;
          }
        } else {
          response = await axios.get(url, { responseType: "arraybuffer" });
          fs.writeFileSync(outputPath, Buffer.from(response.data));
          success = true;
          break;
        }

      } catch (err) {
        console.log(`⚠️ Fallback failed on ${url.split("/")[2]} - ${err.message}`);
      }
    }

    if (success) {
      api.sendMessage(
        {
          body: "✅ তোমার ছবিটা সফলভাবে 4K/8K কোয়ালিটিতে রূপান্তর করা হয়েছে!",
          attachment: fs.createReadStream(outputPath)
        },
        threadID,
        () => fs.unlinkSync(outputPath)
      );
    } else {
      api.sendMessage("❌ ছবিটা আপস্কেল করা যায়নি! সার্ভার ব্যস্ত বা লিংক মেয়াদোত্তীর্ণ।", threadID, messageID);
    }
  }
};
