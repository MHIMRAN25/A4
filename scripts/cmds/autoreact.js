/*
  ======================================
   📌 Command + Event: Auto Reaction
   👨‍💻 Author: MH-BOT TEAM
   🔒 Credit lock: DO NOT REMOVE
  ======================================
*/

const fs = require("fs");
const settingFile = __dirname + "/../../autoreact.json";

module.exports = {
  config: {
    name: "autoreact",
    description: "Auto react to every message with custom emoji list",
    usage: ".autoreact [on/off/add/remove/list] [emoji]",
    cooldown: 3,
    category: "fun", // ✅ category fix
    author: "MH-BOT TEAM"
  },

  // ===== Command Handler =====
  onStart: async ({ api, event, args }) => {   // ✅ run → onStart
    if (!fs.existsSync(settingFile)) {
      fs.writeFileSync(settingFile, JSON.stringify({
        enable: false,
        emojis: ["😂", "❤️", "🔥", "👍", "🥰", "😎", "🤩", "🎉", "😢", "😡"]
      }, null, 2));
    }

    let settings = JSON.parse(fs.readFileSync(settingFile));
    let sub = args[0];

    switch (sub) {
      case "on":
        settings.enable = true;
        fs.writeFileSync(settingFile, JSON.stringify(settings, null, 2));
        return api.sendMessage("✅ Auto Reaction চালু হলো!", event.threadID, event.messageID);

      case "off":
        settings.enable = false;
        fs.writeFileSync(settingFile, JSON.stringify(settings, null, 2));
        return api.sendMessage("❌ Auto Reaction বন্ধ হলো!", event.threadID, event.messageID);

      case "add":
        if (!args[1]) return api.sendMessage("⚠️ একটি ইমোজি দিন!", event.threadID, event.messageID);
        if (!settings.emojis.includes(args[1])) settings.emojis.push(args[1]);
        fs.writeFileSync(settingFile, JSON.stringify(settings, null, 2));
        return api.sendMessage(`✅ ইমোজি '${args[1]}' লিস্টে যোগ হলো!`, event.threadID, event.messageID);

      case "remove":
        if (!args[1]) return api.sendMessage("⚠️ একটি ইমোজি দিন!", event.threadID, event.messageID);
        settings.emojis = settings.emojis.filter(e => e !== args[1]);
        fs.writeFileSync(settingFile, JSON.stringify(settings, null, 2));
        return api.sendMessage(`🗑️ ইমোজি '${args[1]}' লিস্ট থেকে রিমুভ হলো!`, event.threadID, event.messageID);

      case "list":
        return api.sendMessage(
          `📃 বর্তমান ইমোজি লিস্ট:\n${settings.emojis.join(" ")}\n\nStatus: ${settings.enable ? "ON ✅" : "OFF ❌"}`,
          event.threadID,
          event.messageID
        );

      default:
        return api.sendMessage(
          `ℹ️ ব্যবহার: ${this.config.usage}\nবর্তমান: ${settings.enable ? "ON ✅" : "OFF ❌"}`,
          event.threadID,
          event.messageID
        );
    }
  },

  // ===== Event Listener =====
  onChat: async ({ api, event }) => {   // ✅ handleEvent → onChat
    if (!fs.existsSync(settingFile)) return;
    let settings = JSON.parse(fs.readFileSync(settingFile));

    if (!settings.enable || !settings.emojis.length) return;

    // Random emoji from list
    const randomEmoji = settings.emojis[Math.floor(Math.random() * settings.emojis.length)];
    api.setMessageReaction(randomEmoji, event.messageID, (err) => {}, true);
  }
};
