const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "role",
    version: "2.1",
    author: "MH-BOT TEAM",
    role: 2, // শুধু Owner চালাতে পারবে
    shortDescription: "Manage bot admins",
    longDescription: "Owner bot admins promote/demote করতে পারবে, list দেখতে পারবে",
    category: "system",
    guide: "{p}admin [promote/demote/list] [uid/@tag]"
  },

  onStart: async function ({ event, args, message, usersData }) {
    const senderID = event.senderID;
    const configPath = path.join(__dirname, "../../..", "config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    function saveConfig() {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      delete require.cache[require.resolve("../../../config.json")];
      global.GoatBot.config = require("../../../config.json");
    }

    const action = args[0];
    let targetID = args[1];

    // যদি ইউজার কাউকে tag করে → সেই আইডি ধরবে
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    }

    // ✅ PROMOTE / ADD
    if (["promote", "add"].includes(action)) {
      if (!targetID) return message.reply("⚠️ ব্যবহার: !admin promote <uid/@tag>");
      if (config.BOT_ADMINS.includes(targetID)) return message.reply("⚠️ এই ইউজার আগেই Bot Admin!");

      config.BOT_ADMINS.push(targetID);
      saveConfig();

      const name = await usersData.getName(targetID);
      return message.reply(`✅ ${name} (${targetID}) এখন Bot Admin হয়েছে`);
    }

    // ✅ DEMOTE / REMOVE
    if (["demote", "remove"].includes(action)) {
      if (!targetID) return message.reply("⚠️ ব্যবহার: !admin demote <uid/@tag>");
      if (config.ADMIN_IDS.includes(targetID)) return message.reply("⛔ Owner কে remove করা যাবে না!");
      if (!config.BOT_ADMINS.includes(targetID)) return message.reply("⚠️ এই ইউজার Bot Admin না!");

      config.BOT_ADMINS = config.BOT_ADMINS.filter(id => id !== targetID);
      saveConfig();

      const name = await usersData.getName(targetID);
      return message.reply(`✅ ${name} (${targetID}) Bot Admin থেকে remove হলো`);
    }

    // ✅ LIST
    if (action === "list") {
      let ownerList = await Promise.all(config.ADMIN_IDS.map(async id => {
        const name = await usersData.getName(id);
        return `⭐ Owner: ${name} (${id})`;
      }));

      let adminList = await Promise.all(config.BOT_ADMINS.map(async id => {
        const name = await usersData.getName(id);
        return `👑 Bot Admin: ${name} (${id})`;
      }));

      if (adminList.length === 0) adminList = ["❌ এখনো কোন Bot Admin নেই"];

      return message.reply(`📋 Admin List:\n\n${ownerList.join("\n")}\n${adminList.join("\n")}`);
    }

    return message.reply("⚠️ ব্যবহার: !admin [promote/demote/list] [uid/@tag]");
  }
};
