const {
  customFonts,
  mappingFonts,
  symbolFonts,
  cursiveFonts
} = require("../utils/fontOverride.js");

const setFont = require("../utils/setfont.js");

module.exports = {
  config: {
    name: "fonts",
    author: "MH-BOT TEAM",
    description: "Font Menu System with setfont",
    category: "fun"
  },

  onStart: async function({ message, event, args }) {
    const inputText = args.slice(1).join(" ") || "hello"; // ফন্ট টেস্ট করার টেক্সট

    // যদি args না থাকে → মেনু দেখাবে
    if (!args[0]) {
      return message.reply(
        `🎨 FONT MENU\n\n` +
        `A. Custom Fonts\n` +
        `   1. Gothic\n   2. Bubble\n   3. Bold\n   4. DoubleStruck\n\n` +
        `B. Mapping\n` +
        `   1. Leet\n   2. Emoji\n   3. Arrow\n\n` +
        `C. Symbol Styles\n` +
        `   1. Star\n   2. Heart\n   3. Crown\n\n` +
        `D. Cursive Fonts\n` +
        `   1. Normal\n   2. Fancy\n   3. Double\n\n` +
        `F. SET FONT\n` +
        `   1. Show Current\n   2. Reset\n   3. Change → Example: fonts F3 bubble\n\n` +
        `👉 Example: fonts A2 hello`
      );
    }

    const option = args[0].toUpperCase();
    let output = "";

    // Custom Fonts
    if (option === "A1") output = customFonts.gothic(inputText);
    else if (option === "A2") output = customFonts.bubble(inputText);
    else if (option === "A3") output = customFonts.bold(inputText);
    else if (option === "A4") output = customFonts.doubleStruck(inputText);

    // Mapping
    else if (option === "B1") output = mappingFonts.leet(inputText);
    else if (option === "B2") output = mappingFonts.emoji(inputText);
    else if (option === "B3") output = mappingFonts.arrow(inputText);

    // Symbol
    else if (option === "C1") output = symbolFonts.star(inputText);
    else if (option === "C2") output = symbolFonts.heart(inputText);
    else if (option === "C3") output = symbolFonts.crown(inputText);

    // Cursive
    else if (option === "D1") output = cursiveFonts.normal(inputText);
    else if (option === "D2") output = cursiveFonts.fancy(inputText);
    else if (option === "D3") output = cursiveFonts.double(inputText);

    // --- F. SET FONT ---
    else if (option === "F1") {
      const current = setFont.getFont(event.threadID);
      output = `📌 Current font for this group: ${current}`;
    }
    else if (option === "F2") {
      setFont.resetFont(event.threadID);
      output = "✅ Font has been reset to default.";
    }
    else if (option === "F3") {
      const fontName = args[1];
      if (!fontName) return message.reply("❌ Please specify a font name. Example: fonts F3 bubble");
      setFont.setFont(event.threadID, fontName);
      output = `✅ Font has been changed to: ${fontName}`;
    }

    else {
      output = "❌ Invalid option! Use fonts to see menu.";
    }

    return message.reply(output);
  }
};
    // Show demo preview
    if (args[0].toLowerCase() === "demo") {
      let preview = "🌟 Available Fonts 🌟\n\n";
      const sample = "Hello World";
      fonts.forEach((fn, i) => {
        preview += `${i + 1}. ${fn(sample)}\n`;
      });
      return message.reply(preview);
    }

    // Set default font
    if (args[0].toLowerCase() === "default") {
      const fontIndex = parseInt(args[1]);
      if (isNaN(fontIndex) || fontIndex < 1 || fontIndex > fonts.length) {
        return message.reply("❌ Please choose a valid font number! (1 - " + fonts.length + ")");
      }
      const config = loadConfig();
      config.defaultFont = fontIndex;
      saveConfig(config);
      return message.reply(`✅ Default font set to #${fontIndex}: ${fonts[fontIndex - 1]("Hello")}`);
    }

    // Convert text with selected font
    const fontIndex = parseInt(args[0]);
    if (isNaN(fontIndex) || fontIndex < 1 || fontIndex > fonts.length) {
      return message.reply("❌ Please choose a valid font number! (1 - " + fonts.length + ")");
    }

    const text = args.slice(1).join(" ");
    if (!text) return message.reply("⚠️ Please enter text to convert.");

    const styledText = fonts[fontIndex - 1](text);
    return message.reply(styledText);
  },

  // Auto apply default font to bot replies
  onReply: async function ({ message, event }) {
    const config = loadConfig();
    const fontIndex = config.defaultFont || 1;
    if (fontIndex > 0 && fontIndex <= fonts.length) {
      message.body = fonts[fontIndex - 1](message.body);
    }
  }
};
