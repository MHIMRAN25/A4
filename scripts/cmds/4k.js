const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "4k",
    aliases: ["hd", "8k", "upscale"],
    version: "4.0",
    author: "Imran x GPT-5",
    countDown: 5,
    role: 0,
    shortDescription: "ছবিকে HD/4K/8K তে রূপান্তর করে",
    longDescription: "১০টি fallback API ব্যবহার করে ছবির কোয়ালিটি উন্নত করে",
    category: "image",
    guide: {
      en: "{pn} (reply to image)",
    },
  },

  onStart: async function ({ api, event }) {
    const { messageReply, threadID, messageID } = event;

    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0)
      return api.sendMessage("📸 কোনো ছবিতে রিপ্লাই দাও এবং লিখো: .4k", threadID, messageID);

    const attachment = messageReply.attachments[0];
    if (attachment.type !== "photo")
      return api.sendMessage("❌ শুধু ছবিতে রিপ্লাই দাও!", threadID, messageID);

    const imageURL = attachment.url;
    const outputPath = path.join(__dirname, `/cache/4k_${Date.now()}.jpg`);
    api.sendMessage("🔄 ছবিটি 4K/8K তে রূপান্তর হচ্ছে, অনুগ্রহ করে অপেক্ষা করো...", threadID, messageID);

    // === প্রথমে ছবির ডেটা নিয়ে আসা (Buffer) ===
    let imgBuffer;
    try {
      const imgRes = await axios.get(imageURL, { responseType: "arraybuffer" });
      imgBuffer = Buffer.from(imgRes.data);
    } catch (err) {
      return api.sendMessage("❌ ছবিটি লোড করা যাচ্ছে না!", threadID, messageID);
    }

    // === ১০টি API fallback ===
    const apis = [
      `https://image-upscaler-v2.vercel.app/api`, // #1
      `https://imageai.upscaler.workers.dev/`,    // #2
      `https://photoai.upscale.workers.dev/`,     // #3
      `https://upscale-img.vercel.app/api`,       // #4
      `https://img-upscale.cyclic.app/api`,       // #5
      `https://cdn-ai-upscale.vercel.app/api`,    // #6
      `https://ai-image-upscale-1.vercel.app/api`,// #7
      `https://image-superres-api.vercel.app/api`,// #8
      `https://upscale-free-api.vercel.app/api`,  // #9
      `https://cf-image-upscale.workers.dev/`     // #10
    ];

    let success = false;

    for (const apiURL of apis) {
      try {
        const res = await axios.post(apiURL, imgBuffer, {
          headers: { "Content-Type": "application/octet-stream" },
          responseType: "arraybuffer",
        });
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
        "❌ ছবিটা 4K/8K তে রূপান্তর করা যায়নি! সব সার্ভার ব্যস্ত। পরে আবার চেষ্টা করো।",
        threadID,
        messageID
      );
    }

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
