const fonts = require('../utils/fonts.js');

module.exports = {
  config: {
    name: "setfont",
    description: "Change message font style",
    usage: "<style> <text>",
    cooldown: 3
  },

  onStart: async ({ event, args, message }) => {
    const style = args[0];
    const text = args.slice(1).join(" ");

    if (!fonts[style]) {
      return message.reply("❌ Unknown font style!\nAvailable: " + Object.keys(fonts).join(", "));
    }

    const result = fonts[style](text);
    return message.reply(result);
  }
};
