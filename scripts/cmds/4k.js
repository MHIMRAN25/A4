const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "4k",
    aliases: ["hd", "8k", "upscale"],
    version: "3.0",
    author: "Imran x GPT-5",
    countDown: 5,
    role: 0,
    shortDescription: "ছবিকে 4K বা 8K তে রূপান্তর করে",
    longDescription: "AI ব্যবহার করে ছবির রেজোলিউশন বাড়ায় (HD / 4K / 8K)",
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
    const outputPath = path.join(__dirname, `/cache/upscaled_${Date.now()}.jpg`);

    const apis = [
      "https://image-upscale.vercel.app/api/upscale?url=",
      "https://ai-image-enhance.vercel.app/api?img=",
      "https://imgupscaler-free.vercel.app/api?image=",
      "https://free-upscale-api.vercel.app/upscale?image=",
      "https://hdimage-restoration.vercel.app/api?url=",
      "https://upscale-8k.vercel.app/api/upscale?img=",
      "https://photoenhancer-ai.vercel.app/api?image=",
      "https://imageboost.vercel.app/api/upscale?url=",
      "https://enhanceai-img.vercel.app/api?image=",
      "https://superresizer.vercel.app/api?url=",
      "https://imgai.vercel.app/upscale?image=",
      "https://sharpimage.vercel.app/api?img=",
      "https://clarifyai.vercel.app/api/upscale?url=",
      "https://picupscale.vercel.app/api?image=",
      "https://nextgen-upscale.vercel.app/api/upscale?url="
    ];

    api.sendMessage("🔄 ছবিটি 4K/8K তে রূপান্তর হচ্ছে, অনুগ্রহ করে অপেক্ষা করো...", threadID, messageID);

    let success = false;

    for (const link of apis) {
      try {
        const res = await axios.get(`${link}${encodeURIComponent(imageURL)}`, { responseType: "arraybuffer", timeout: 30000 });
        fs.writeFileSync(outputPath, Buffer.from(res.data));

        api.sendMessage(
          {
            body: "✅ এখানে তোমার ছবির 4K/8K সংস্করণ!",
            attachment: fs.createReadStream(outputPath),
          },
          threadID,
          () => fs.unlinkSync(outputPath)
        );

        success = true;
        break;
      } catch (err) {
        console.log(`❌ Failed: ${link}`);
      }
    }

    if (!success) {
      api.sendMessage("❌ ছবিটা 4K/8K তে রূপান্তর করা যায়নি! সব সার্ভার ব্যস্ত। কিছুক্ষণ পরে চেষ্টা করো।", threadID, messageID);
    }
  },
};
