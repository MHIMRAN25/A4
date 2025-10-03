const Fonts = require("./utils/fonts.js");

module.exports = {
  config: {
    name: "setfont",
    aliases: ["font", "fonts"],
    version: "1.0",
    author: "Your Name",
    countDown: 5,
    role: 0,
    shortDescription: "Change text style with fonts",
    longDescription: "Convert your normal text into stylish fonts",
    category: "fun",
    guide: {
      en: "{p}{n} [text]"
    }
  },

  onStart: async function ({ event, message, args }) {
    if (!args[0]) return message.reply("⚠️ Please provide some text!");
    const input = args.join(" ");
    const styled = Fonts.allFonts(input);

    let msg = "✨ Here are your styled texts:\n\n";
    styled.forEach((txt, i) => {
      msg += `${i + 1}. ${txt}\n`;
    });

    message.reply(msg);
  }
};
