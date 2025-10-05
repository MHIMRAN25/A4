const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "4k",
    aliases: ["hd", "enhance"],
    version: "3.5",
    author: "Imran x GPT-5",
    countDown: 5,
    role: 0,
    shortDescription: "ছবিকে 4K মানে রূপান্তর করে",
    longDescription: "AI ব্যবহার করে ছবিকে 4K মানে উন্নত করে — তীক্ষ্ণতা, রঙ ও ডিটেইল সহ।",
    category: "image",
    guide: {
      en: "{pn} [reply to image]",
    },
  },

  onStart: async function ({ api, event }) {
    const { messageReply, threadID, messageID } = event;

    // ✅ Step 1: চেক করা হচ্ছে ছবি রিপ্লাই করা হয়েছে কি না
    if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0)
      return api.sendMessage("📸 অনুগ্রহ করে কোনো ছবিতে রিপ্লাই দাও এবং লিখো: .4k", threadID, messageID);

    const attachment = messageReply.attachments[0];
    if (attachment.type !== "photo")
      return api.sendMessage("❌ শুধুমাত্র ছবিতে রিপ্লাই দাও!", threadID, messageID);

    const imageURL = attachment.url;
    const outputPath = path.join(__dirname, `/cache/4k_${Date.now()}.jpg`);

    api.sendMessage("🧠 ছবিটি 4K মানে উন্নত করা হচ্ছে, একটু অপেক্ষা করো...", threadID, messageID);

    try {
      // ✅ Step 2: সক্রিয় ফ্রি 4K আপস্কেল API
      const upscaleAPI = `https://api.nyxbot.online/upscale?url=${encodeURIComponent(imageURL)}`;

      const response = await axios.get(upscaleAPI, { responseType: "arraybuffer", timeout: 60000 });

      fs.writeFileSync(outputPath, Buffer.from(response.data));

      // ✅ Step 3: ছবি পাঠানো
      api.sendMessage(
        {
          body: "✅ এখানে তোমার 4K ছবি! ✨",
          attachment: fs.createReadStream(outputPath),
        },
        threadID,
        () => fs.unlinkSync(outputPath)
      );
    } catch (error) {
      console.error("❌ 4K Error:", error.message);

      // 🔁 Step 4: Fallback API (যদি প্রথমটা ব্যর্থ হয়)
      try {
        const fallback = await axios.post(
          "https://api.deepai.org/api/torch-srgan",
          { image: imageURL },
          { headers: { "api-key": "quickstart-QUdJIGlzIGNvbWluZy4uLi4uCg==" } }
        );
        const img = await axios.get(fallback.data.output_url, { responseType: "arraybuffer" });
        fs.writeFileSync(outputPath, Buffer.from(img.data));

        api.sendMessage(
          {
            body: "✅ এখানে তোমার 4K ছবি (Backup AI থেকে তৈরি) 🎯",
            attachment: fs.createReadStream(outputPath),
          },
          threadID,
          () => fs.unlinkSync(outputPath)
        );
      } catch (err) {
        console.error("🚫 Fallback failed:", err.message);
        api.sendMessage("❌ ছবিটা 4K তে রূপান্তর করা যায়নি! পরে আবার চেষ্টা করো।", threadID, messageID);
      }
    }
  },
};
