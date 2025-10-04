const { setFont, getFont, resetFont } = require("../utils/customFonts.js");
const { applyFont } = require("../utils/fontOverride.js");

module.exports = {
  config: {
    name: "fonts",
    author: "MH-BOT TEAM",
    role: 0,
    shortDescription: "Font system menu"
  },

  onStart: async function ({ event, message, args }) {
    const threadID = event.threadID;

    if (args[0] === "menu") {
      return message.reply("🎨 FONT MENU\n\nF1. Show Current\nF2. Reset\nF3. Change <fontName>");
    }

    if (args[0] === "F1") {
      const current = getFont(threadID) || "Default";
      return message.reply(`📌 Current font for this group: ${current}`);
    }

    if (args[0] === "F2") {
      resetFont(threadID);
      return message.reply("✅ Font reset to default for this group.");
    }

    if (args[0] === "F3") {
      const fontName = args[1];
      if (!fontName) return message.reply("⚠️ Please provide a font name!");
      setFont(threadID, fontName);
      return message.reply(`✅ Font changed to ${fontName}`);
    }
  }
};
