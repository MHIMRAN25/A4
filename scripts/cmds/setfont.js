const { applyFont } = require("./utils/fontsOverride.js");
const customFonts = require("./utils/customFonts.js");
const mapping = require("./utils/mapping.js");
const symbol = require("./utils/symbol.js");
const textConvert = require("./utils/textConvert.js");
const cursive = require("./utils/cursive.js");

module.exports = {
  config: {
    name: "fonts",
    aliases: ["fontmenu"],
    author: "MH-BOT TEAM",
    role: 0,
    shortDescription: "Font System Menu",
    longDescription: "Font menu system: custom fonts, mapping, symbols, cursive, convert ইত্যাদি",
    category: "Font",
    guide: {
      en: "{pn} menu\n{pn} custom gothic Hello\n{pn} mapping leet Hello\n{pn} symbol star Hello\n{pn} cursive fancy Hello"
    }
  },

  onStart: async function ({ message, args }) {
    if (args.length === 0 || args[0].toLowerCase() === "menu") {
      return message.reply(
        "🎨 FONT MENU\n\n" +
        "A. Custom Fonts\n   Example: fonts custom gothic Hello\n" +
        "B. Mapping\n   Example: fonts mapping leet Hello\n" +
        "C. Symbols\n   Example: fonts symbol star Hello\n" +
        "D. Cursive\n   Example: fonts cursive fancy Hello\n" +
        "E. Text Convert (one-time)\n   Example: fonts convert bold Hello\n" +
        "F. SetFont (persistent group font)\n   Use: /setfont [name | show | reset]\n"
      );
    }

    const category = args[0].toLowerCase();
    const style = args[1] ? args[1].toLowerCase() : null;
    const inputText = args.slice(2).join(" ") || "Hello";

    let result;

    switch (category) {
      case "custom":
        if (customFonts[style]) {
          result = customFonts[style](inputText);
        } else {
          return message.reply("❌ Unknown custom font style!");
        }
        break;

      case "mapping":
        if (mapping[style]) {
          result = mapping[style](inputText);
        } else {
          return message.reply("❌ Unknown mapping style!");
        }
        break;

      case "symbol":
        if (symbol[style]) {
          result = symbol[style](inputText);
        } else {
          return message.reply("❌ Unknown symbol style!");
        }
        break;

      case "cursive":
        if (cursive[style]) {
          result = cursive[style](inputText);
        } else {
          return message.reply("❌ Unknown cursive style!");
        }
        break;

      case "convert":
        if (textConvert[style]) {
          result = textConvert[style](inputText);
        } else {
          return message.reply("❌ Unknown convert style!");
        }
        break;

      default:
        return message.reply("❌ Unknown category! Type fonts menu");
    }

    return message.reply(result);
  }
};
