const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "4k",
    aliases: ["hd", "upscale"],
    version: "2.0",
    author: "Imran x GPT-5",
    countDown: 5,
    role: 0,
    shortDescription: "ছবিকে 4K তে রূপান্তর করে",
    longDescription: "AI ব্যবহার করে ছবির রেজোলিউশন বাড়ায় (HD / 4K)",
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

    api.sendMessage("🔄 ছবিটি 4K তে রূপান্তর হচ্ছে, অনুগ্রহ করে অপেক্ষা করো...", threadID, messageID);

    try {
      // ✅ DeepAI Upscale API (free)
      const response = await axios({
        method: "post",
        url: "https://api.deepai.org/api/torch-srgan",
        headers: { "api-key": "quickstart-QUdJIGlzIGNvbWluZy4uLi4K" },
        data: { image: imageURL },
      });

      const resultURL = response.data.output_url;
      if (!resultURL) throw new Error("No output URL");

      const img = await axios.get(resultURL, { responseType: "arraybuffer" });
      fs.writeFileSync(outputPath, Buffer.from(img.data));

      api.sendMessage(
        { body: "✅ এখানে তোমার ছবির 4K সংস্করণ!", attachment: fs.createReadStream(outputPath) },
        threadID,
        () => fs.unlinkSync(outputPath)
      );
    } catch (err) {
      console.error(err);
      api.sendMessage("❌ ছবিটি 4K তে রূপান্তর করা যায়নি!", threadID, messageID);
    }
  },
};
