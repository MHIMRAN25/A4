const { fancySets, toFancy } = require("./utils/Fonts.js");

let currentFont = 1;

module.exports = {
  config: {
    name: "setfont",
    version: "2.0",
    author: "Imran",
    role: 2,
    shortDescription: "Change bot reply font",
    longDescription: "Select which fancy font style bot should use",
    category: "system",
    guide: "{p}setfont <number>"
  },

  onStart: async function ({ message, args }) {
    const num = parseInt(args[0]);

    // যদি number না দেয় → লিস্ট দেখাও
    if (!num || !fancySets[num]) {
      let demoWord = "Bot";
      let list = Object.keys(fancySets)
        .map(n => `${n}. ${toFancy(demoWord, n)}`)
        .join("\n");
      return message.reply("📌 Available Fancy Fonts:\n\n" + list + "\n\n👉 ব্যবহার: .setfont <number>");
    }

    // নাম্বার দিলে সেট করো
    currentFont = num;
    message.reply(`✅ Font style changed to: ${num}\n\nDemo: ${toFancy("Bot Activated", num)}`);
  },

  getFont: () => currentFont
};
