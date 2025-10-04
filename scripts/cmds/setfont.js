const { convertText, setFont, applyGroupFont } = require("../utils/fontOverride.js");

module.exports = {
  config: {
    name: "fonts",
    author: "MH-BOT TEAM",
    description: "Font menu + set/reset",
    category: "system"
  },

  onStart: async function({ message, event, args }) {
    const input = args.join(" ");

    // Menu show
    if (!input) {
      return message.reply(
        "📌 Font Menu\n\n" +
        "F1. One-time convert\n" +
        "F2. Reset font (group)\n" +
        "F3. Set persistent font (group)\n\n" +
        "Example:\n" +
        "fonts F1 gothic hello\n" +
        "fonts F2\n" +
        "fonts F3 bubble"
      );
    }

    // F1 → one-time convert
    if (args[0].toUpperCase() === "F1") {
      const style = args[1];
      const text = args.slice(2).join(" ");
      return message.reply(convertText(style, text));
    }

    // F2 → reset group font
    if (args[0].toUpperCase() === "F2") {
      setFont(event.threadID, "default");
      return message.reply("✅ Group font reset করা হয়েছে");
    }

    // F3 → set persistent group font
    if (args[0].toUpperCase() === "F3") {
      const style = args[1];
      setFont(event.threadID, style);
      return message.reply(`✅ Group font এখন থেকে "${style}" এ সেট করা হয়েছে`);
    }
  }
};
