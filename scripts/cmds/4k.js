const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "4k",
    aliases: ["hd", "upscale"],
    version: "3.1-Free",
    author: "Imran x GPT-5 (Free API)",
    countDown: 5,
    role: 0,
    shortDescription: "ছবিকে 4K তে রূপান্তর করে (Free API)",
    longDescription: "ফ্রি AI আপস্কেল ইঞ্জিন ব্যবহার করে ছবির রেজোলিউশন বাড়ায় (HD / 4K)।",
    category: "image",
    guide: {
      en: "{pn} [reply to image]",
    },
  },

  onStart: async function ({ api, event }) {
    const { messageReply, threadID, messageID } = event;

    // ✅ Step 1: Check reply
    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0)
      return api.sendMessage("📸 অনুগ্রহ করে কোনো ছবিতে রিপ্লাই দাও এবং লিখো: .4k", threadID, messageID);

    const attachment = messageReply.attachments[0];
    if (attachment.type !== "photo")
      return api.sendMessage("❌ শুধু ছবিতে রিপ্লাই দাও!", threadID, messageID);

    const imageURL = attachment.url;
    const outputPath = path.join(__dirname, `/cache/4k_${Date.now()}.jpg`);

    api.sendMessage("অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করো 💫", threadID, messageID);

    try {
      // ✅ Step 2: Use Free AI Upscale API (No token needed)
      const apiURL = `https://image-upscale-api.vercel.app/upscale?image=${encodeURIComponent(imageURL)}`;
      const response = await axios.get(apiURL, { responseType: "arraybuffer" });

      // ✅ Step 3: Save 4K image
      fs.writeFileSync(outputPath, Buffer.from(response.data));

      // ✅ Step 4: Send result
      api.sendMessage(
        {
          body: "✅ এখানে তোমার ছবির 4K সংস্করণ (Free AI) ✨",
          attachment: fs.createReadStream(outputPath),
        },
        threadID,
        () => fs.unlinkSync(outputPath)
      );
    } catch (error) {
      console.error(error);
      api.sendMessage("❌ ছবিটা 4K তে রূপান্তর করা যায়নি! পরে আবার চেষ্টা করো।", threadID, messageID);
    }
  },
};
