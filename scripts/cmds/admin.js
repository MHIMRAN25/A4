const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "admin", // এখানে বদলালাম
    version: "1.0",
    author: "MH-BOT TEAM",
    role: 2, // শুধু Owner চালাতে পারবে
    shortDescription: "Manage bot admins",
    longDescription: "Owner bot admins add/remove করতে পারবে, list দেখতে পারবে",
    category: "system",
    guide: "{p}admin [add/remove/list] <uid>"
  },

  onStart: async function ({ event, args }) {
    const senderID = event.senderID;
    const configPath = path.join(__dirname, "../../..", "config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    function saveConfig() {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      delete require.cache[require.resolve("../../../config.json")];
      global.GoatBot.config = require("../../../config.json");
    }

    const action = args[0];
    const targetID = args[1];

    // ✅ ADD
    if (action === "add") {
      if (!targetID) return event.reply("⚠️ ব্যবহার: !admin add <uid>");
      if (config.BOT_ADMINS.includes(targetID)) return event.reply("⚠️ এই ইউজার আগেই Bot Admin!");

      config.BOT_ADMINS.push(targetID);
      saveConfig();
      return event.reply(`✅ UID ${targetID} এখন Bot Admin হয়েছে`);
    }

    // ✅ REMOVE
    if (action === "remove") {
      if (!targetID) return event.reply("⚠️ ব্যবহার: !admin remove <uid>");
      if (config.ADMIN_IDS.includes(targetID)) return event.reply("⛔ Owner কে remove করা যাবে না!");
      if (!config.BOT_ADMINS.includes(targetID)) return event.reply("⚠️ এই ইউজার Bot Admin না!");

      config.BOT_ADMINS = config.BOT_ADMINS.filter(id => id !== targetID);
      saveConfig();
      return event.reply(`✅ UID ${targetID} Bot Admin থেকে remove হলো`);
    }

    // ✅ LIST
    if (action === "list") {
      let ownerList = config.ADMIN_IDS.map(id => `⭐ Owner: ${id}`).join("\n");
      let adminList = config.BOT_ADMINS.length > 0 
        ? config.BOT_ADMINS.map(id => `👑 Bot Admin: ${id}`).join("\n") 
        : "❌ এখনো কোন Bot Admin নেই";

      return event.reply(`📋 Admin List:\n\n${ownerList}\n${adminList}`);
    }

    return event.reply("⚠️ ব্যবহার: !admin [add/remove/list] <uid>");
  }
};
