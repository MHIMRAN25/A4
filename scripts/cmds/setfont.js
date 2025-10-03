const fonts = require("../utils/fonts.js");
const fs = require("fs");
const path = require("path");

const configPath = path.join(__dirname, "../utils/fontConfig.json");

// load config
function loadConfig() {
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({ defaultFont: 1 }, null, 2));
  }
  return JSON.parse(fs.readFileSync(configPath));
}

// save config
function saveConfig(data) {
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

module.exports = {
  config: {
    name: "setfont",
    aliases: ["font"],
    version: "2.0",
    author: "Imran & GPT",
    countDown: 5,
    role: 0,
    shortDescription: "Change or preview fancy fonts",
    longDescription: "Show all fancy font styles, convert text, or set default font",
    category: "fun",
    guide: "{pn} demo | {pn} <number> <text> | {pn} default <number>"
  },

  onStart: async function ({ message, args }) {
    if (!args[0]) {
      return message.reply("⚡ Usage:\n.setfont demo\n.setfont <number> <text>\n.setfont default <number>");
    }

    // preview fonts
    if (args[0].toLowerCase() === "demo") {
      let preview = "🌟 Available Fonts 🌟\n\n";
      const sample = "Hello World";
      fonts.forEach((fn, i) => {
        preview += `${i + 1}. ${fn(sample)}\n`;
      });
      return message.reply(preview);
    }

    // set default font
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

    // convert text
    const fontIndex = parseInt(args[0]);
    if (isNaN(fontIndex) || fontIndex < 1 || fontIndex > fonts.length) {
      return message.reply("❌ Please choose a valid font number! (1 - " + fonts.length + ")");
    }

    const text = args.slice(1).join(" ");
    if (!text) return message.reply("⚠️ Please enter text to convert.");

    const styledText = fonts[fontIndex - 1](text);
    return message.reply(styledText);
  }
};
