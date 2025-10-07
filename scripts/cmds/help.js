const fs = require("fs");
const path = require("path");

module.exports.info = {
  name: "help",
  version: "16.5.0",
  description: "Royal Black-Gold Command Menu with Video + Audio Intro",
  example: "/help or /help <command>",
  credit: "MH-BOT TEAM + GPT-5",
  category: "⚙️ System",
  hasPermission: 0,
  cooldown: 3
};

module.exports.run = async (api, threadID, thread_type, { args }) => {
  try {
    // === 1️⃣ VIDEO + AUDIO PATH ===
    const videoPath = path.join(__dirname, "assists", "video", "menu.mp4");
    const audioPath = path.join(__dirname, "assists", "music", "royal_intro.mp3");

    // === 2️⃣ SEND VIDEO (if exists) ===
    if (fs.existsSync(videoPath)) {
      api.sendMessage({
        body: "👑 𝗠𝗛-𝗕𝗢𝗧 𝗥𝗢𝗬𝗔𝗟 𝗦𝗬𝗦𝗧𝗘𝗠 👑",
        attachment: fs.createReadStream(videoPath)
      }, threadID);
    }

    // === 3️⃣ PLAY MUSIC (if exists) ===
    if (fs.existsSync(audioPath)) {
      api.sendMessage({
        body: "🎵 𝗥𝗼𝘆𝗮𝗹 𝗜𝗻𝘁𝗿𝗼 𝗠𝘂𝘀𝗶𝗰 🎵",
        attachment: fs.createReadStream(audioPath)
      }, threadID);
    }

    // === 4️⃣ LOAD COMMANDS ===
    const CMD_DIR = path.join(__dirname, "/");
    const files = fs.readdirSync(CMD_DIR).filter(f => f.endsWith(".js"));
    const commands = [];

    for (const file of files) {
      const cmd = require(path.join(CMD_DIR, file));
      if (cmd.info && cmd.info.name !== "help") {
        commands.push({
          name: cmd.info.name,
          desc: cmd.info.description || "No description",
          category: cmd.info.category || "📦 Others",
          credit: cmd.info.credit || "Unknown",
          example: cmd.info.example || "No example"
        });
      }
    }

    const categories = {};
    for (const c of commands) {
      if (!categories[c.category]) categories[c.category] = [];
      categories[c.category].push(c);
    }

    if (args[0]) {
      const query = args[0].toLowerCase();
      const cmd = commands.find(c => c.name.toLowerCase() === query);
      if (!cmd) return api.sendMessage(`❌ "${query}" নামে কোনো command খুঁজে পাওয়া যায়নি!`, threadID);

      const detail = `
╭═══════════════════════╮
✨ 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐃𝐄𝐓𝐀𝐈𝐋 ✨
╰═══════════════════════╯
🔸 নাম: ${cmd.name}
📖 বিবরণ: ${cmd.desc}
🏷️ ক্যাটাগরি: ${cmd.category}
👑 ক্রেডিট: ${cmd.credit}
💡 উদাহরণ: ${cmd.example}
━━━━━━━━━━━━━━━━━━━
🖤 MH_BOT | Royal Gold Menu
`;
      return api.sendMessage(detail, threadID);
    }

    // === 5️⃣ COMMAND MENU ===
    let msg = `
╔═━──━──━──━──━──━═╗
👑 ＣＯＭＭＡＮＤ ＭＥＮＵ 👑
╚═━──━──━──━──━──━═╝
━━━━━━━━━━━━━━━━━━━
⚙️ Developer: MH-BOT TEAM
📜 Version: 16.5.0
💬 Use: /help <command>
━━━━━━━━━━━━━━━━━━━
`;

    const icons = ["💛", "⚜️", "👑", "💎", "🌟"];
    let i = 0;

    for (const [cat, cmds] of Object.entries(categories)) {
      const icon = icons[i % icons.length];
      msg += `\n${icon}  ${cat.toUpperCase()}  ${icon}\n`;
      msg += `━━━━━━━━━━━━━━━━━━━\n`;
      msg += cmds.map(c => `✨ ${c.name}`).join("   ");
      msg += `\n━━━━━━━━━━━━━━━━━━━\n`;
      i++;
    }

    msg += `
💎 Total Commands: ${commands.length}
👑 Credit: MH-BOT TEAM | Royal Black-Gold Edition
━━━━━━━━━━━━━━━━━━━
⚡ "Elegance in code, royalty in design."
`;

    api.sendMessage(msg, threadID);

  } catch (err) {
    api.sendMessage(`❌ Error in help command: ${err.message}`, threadID);
  }
};
