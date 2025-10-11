// commands/setfonts.js
module.exports = {
  config: {
    name: "fonts2",
    aliases: ["setfonts", "font"],
    version: "1.0",
    author: "Imran",
    countDown: 5,
    role: 0,
    shortDescription: "Change text font style",
    longDescription: "Change your message into different font styles like leet, emoji, box, greek, etc.",
    category: "fun",
    guide: "{pn} <style> <text>\n\nAvailable styles: leet, emoji, arrow, upsideDown, greek, box, circle, math"
  },

  onStart: async function ({ api, event, args }) {
    const mapping = require("../utils/mapping.js"); // তোমার আগের mapping.js use করবে

    if (args.length < 2) {
      return api.sendMessage(
        "⚡ Usage: setfont <style> <text>\n\nAvailable styles: leet, emoji, arrow, upsideDown, greek, box, circle, math",
        event.threadID,
        event.messageID
      );
    }

    const style = args[0].toLowerCase();
    const text = args.slice(1).join(" ");

    if (!mapping[style]) {
      return api.sendMessage(
        `❌ Unknown style: ${style}\n\nAvailable: leet, emoji, arrow, upsideDown, greek, box, circle, math`,
        event.threadID,
        event.messageID
      );
    }

    const result = mapping[style](text);
    return api.sendMessage(result, event.threadID, event.messageID);
  }
};
