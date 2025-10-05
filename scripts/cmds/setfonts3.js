const { setFont, resetFont, getFontData } = require(".../utils/coustomFonts.js");

module.exports = {
  config: {
    name: "setfonts3.js",
    aliases: ["fontset", "changefont"],
    author: "MH-BOT TEAM",
    role: 1, // শুধু group admin / bot owner
    shortDescription: "Group এর জন্য font set/reset/show",
    longDescription: "এই কমান্ড দিয়ে group এর default font পরিবর্তন করতে পারবেন।",
    category: "Font",
    guide: {
      en: "{pn} [fontName | show | reset]"
    }
  },

  onStart: async function ({ message, event, args }) {
    const threadID = event.threadID;
    const fontsData = getFontData();

    if (args.length === 0) {
      return message.reply(
        "🎨 SET FONT MENU\n\n" +
        "🔹 {pn} show → বর্তমান ফন্ট দেখাও\n" +
        "🔹 {pn} reset → ডিফল্ট এ রিসেট\n" +
        "🔹 {pn} [fontName] → নতুন ফন্ট সেট\n\n" +
        "Example:\n{pn} gothic\n{pn} bubble\n{pn} fancy"
      );
    }

    const option = args[0].toLowerCase();

    if (option === "show") {
      const currentFont = fontsData[threadID] || "normal";
      return message.reply(`📌 এই গ্রুপে বর্তমানে সেট করা ফন্ট: ${currentFont}`);
    }

    if (option === "reset") {
      resetFont(threadID);
      return message.reply("✅ ফন্ট রিসেট করা হলো। এখন সব মেসেজ normal এ আসবে।");
    }

    // ফন্ট সেট করা
    const newFont = setFont(threadID, option);
    return message.reply(`✨ নতুন ফন্ট সেট হয়েছে: ${newFont}`);
  }
};
