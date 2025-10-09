const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "2.1",
    author: "Nirob + GPT5",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Premium styled dark help menu",
    },
    longDescription: {
      en: "Show all commands in premium dark menu style",
    },
    category: "info",
    guide: {
      en: "{pn} or {pn} [commandName]",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    // 🧭 If no command name given → Show full menu
    if (args.length === 0) {
      const categories = {};
      let msg = "╭───────────────★\n│ ⚡ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐌𝐄𝐍𝐔 ⚡\n│───────────────★";

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        const category = value.config.category || "Uncategorized";
        if (!categories[category]) categories[category] = [];
        categories[category].push(name);
      }

      Object.keys(categories).forEach(category => {
        msg += `\n\n╭─✦ ${category.toUpperCase()} ✦`;
        const names = categories[category].sort();
        for (let i = 0; i < names.length; i += 2) {
          const line = names.slice(i, i + 2).map(item => `⚡ ${item}`).join("    ");
          msg += `\n│ ${line}`;
        }
        msg += `\n╰─────────────★`;
      });

      const total = commands.size;
      msg += `\n\n╭─★ INFO ★\n│ 🔸 Total Commands: ${total}\n│ 🔸 Prefix: ${prefix}\n│ 🔸 Type "${prefix}help <cmd>" for details\n╰──────────────★\n\n✨ ᴅᴇsɪɢɴᴇᴅ ʙʏ ɴɪʀᴏʙ ✦`;

      // 🎬 Only your provided video link
      const helpListImage = "https://files.catbox.moe/xhw0uk.mp4";

      await message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL(helpListImage)
      });
    } 
    // 🧩 If command name given → Show detailed info
    else {
      const name = args[0].toLowerCase();
      const command = commands.get(name) || commands.get(aliases.get(name));
      if (!command) return message.reply(`❌ Command "${name}" not found.`);

      const conf = command.config;
      const usage = conf.guide?.en?.replace(/{pn}/g, prefix + conf.name) || "No usage info.";

      const info = `
╭───────────★
│ ⚙️ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗: ${conf.name}
│───────────────────★
│ 🧠 𝗗𝗲𝘀𝗰: ${conf.longDescription?.en || "No description"}
│ 👑 𝗔𝘂𝘁𝗵𝗼𝗿: ${conf.author || "Unknown"}
│ ⚙️ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: ${conf.version || "1.0"}
│ 🔰 𝗥𝗼𝗹𝗲: ${roleText(conf.role)}
│ 📘 𝗨𝘀𝗮𝗴𝗲: ${usage}
╰───────────★
⚡ ᴄᴏᴍᴍᴀɴᴅ ᴍᴇɴᴜ | ɴɪʀᴏʙ ✦`;

      await message.reply(info);
    }
  },
};

function roleText(role) {
  switch (role) {
    case 0: return "0 (Everyone)";
    case 1: return "1 (Group Admin)";
    case 2: return "2 (Bot Admin)";
    default: return "Unknown";
  }
}
