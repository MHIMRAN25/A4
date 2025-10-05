const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "4k",
    aliases: ["hd", "upscale"],
    version: "1.0",
    author: "Imran x GPT-5",
    countDown: 5,
    role: 0,
    shortDescription: "ছবিকে HD/4K তে রূপান্তর করে",
    longDescription: "রিপ্লাই করা ছবিটাকে 4K কোয়ালিটিতে আপস্কেল করে পাঠায়",
    category: "image",
    guide: {
      en: "{pn} [reply to image]",
    },
  },

  onStart: async function ({ api, event }) {
    try {
      const { messageReply, threadID, messageID } = event;

      // ✅ Step 1: Check image
      if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
        return api.sendMessage("📸 অনুগ্রহ করে কোনো ছবিতে রিপ্লাই দাও এবং লিখো: .4k", threadID, messageID);
      }

      const attachment = messageReply.attachments[0];
      if (attachment.type !== "photo") {
        return api.sendMessage("❌ শুধু ছবিতে রিপ্লাই দাও!", threadID, messageID);
      }

      const imageURL = attachment.url;
      const outputPath = path.join(__dirname, `/cache/4k_${Date.now()}.jpg`);

      api.sendMessage("🔄 ছবিটি 4K তে রূপান্তর হচ্ছে, অনুগ্রহ করে অপেক্ষা করো...", threadID, messageID);

      // ✅ Step 2: Free AI Upscale API ব্যবহার
      const upscaleAPI = `https://api-inference.huggingface.co/models/Sanster/Lama-Cleaner`;

      const response = await axios({
        method: "post",
        url: upscaleAPI,
        headers: { "Content-Type": "application/json" },
        data: { image_url: imageURL },
        responseType: "arraybuffer",
      });

      fs.writeFileSync(outputPath, Buffer.from(response.data));

      // ✅ Step 3: Send the upscaled image
      api.sendMessage(
        {
          body: "✅ এখানে তোমার ছবির 4K সংস্করণ!",
          attachment: fs.createReadStream(outputPath),
        },
        threadID,
        () => fs.unlinkSync(outputPath)
      );
    } catch (error) {
      console.error(error);
      api.sendMessage("❌ ছবিটা 4K তে রূপান্তর করা যায়নি!", event.threadID, event.messageID);
    }
  },
};
