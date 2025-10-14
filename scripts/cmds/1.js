// commands/file2.js
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "file2",
    aliases: ["file2", "f2"],
    version: "1.7",
    author: "Imran",
    role: 0,
    shortDescription: "Send, add, remove & list files using message.reply",
    longDescription: "Usage:\n• file2 send <filename>\n• file2 add (reply to message)\n• file2 remove <filename>\n• file2 list\n• file2 info <filename>",
    category: "utility",
  },

  onStart: async ({ message, args, downloadReply, awaitReply, sendButtons }) => {
    try {
      // --- Storage directory ---
      const STORAGE_DIR = path.join(__dirname, '..', 'files'); // home page/scripts/cmds/files
      if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });

      if (!args || args.length === 0) {
        return await message.reply("Usage:\n• file2 send <filename>\n• file2 add\n• file2 remove <filename>\n• file2 list\n• file2 info <filename>");
      }

      const sub = args[0].toLowerCase();

      // --- LIST with Messenger buttons ---
      if (sub === "list") {
        const files = fs.readdirSync(STORAGE_DIR);
        if (files.length === 0) return await message.reply("No files found.");

        const pageSize = 10;
        let page = parseInt(args[1]) || 1;
        const totalPages = Math.ceil(files.length / pageSize);
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        const sendPage = async (pageNum, replyMessageId) => {
          const start = (pageNum - 1) * pageSize;
          const pageFiles = files.slice(start, start + pageSize);
          const listText = pageFiles.map(f => `• ${f}`).join("\n") || "No files found.";

          const buttons = [];
          if (pageNum > 1) buttons.push({ type: "postback", title: "⬅ Previous", payload: `file2_list_${pageNum-1}` });
          if (pageNum < totalPages) buttons.push({ type: "postback", title: "Next ➡", payload: `file2_list_${pageNum+1}` });

          await sendButtons(listText + `\n\nPage ${pageNum}/${totalPages}`, buttons, replyMessageId);
        };

        return await sendPage(page, null);
      }

      // --- Button callback for Messenger ---
      if (sub.startsWith("callback")) {
        const cbData = args[1]; // ex: file2_list_2
        if (cbData && cbData.startsWith("file2_list_")) {
          const pageNum = parseInt(cbData.split("_")[2]);
          const files = fs.readdirSync(path.join(__dirname, '..', 'files'));
          const totalPages = Math.ceil(files.length / 10);
          if (pageNum >= 1 && pageNum <= totalPages) {
            const start = (pageNum - 1) * 10;
            const pageFiles = files.slice(start, start + 10);
            const listText = pageFiles.map(f => `• ${f}`).join("\n") || "No files found.";

            const buttons = [];
            if (pageNum > 1) buttons.push({ type: "postback", title: "⬅ Previous", payload: `file2_list_${pageNum-1}` });
            if (pageNum < totalPages) buttons.push({ type: "postback", title: "Next ➡", payload: `file2_list_${pageNum+1}` });

            return await sendButtons(listText + `\n\nPage ${pageNum}/${totalPages}`, buttons, message.replyMessageId);
          }
        }
      }

      // --- INFO ---
      if (sub === "info") {
        const filename = args.slice(1).join(" ");
        if (!filename) return await message.reply("Please provide a file name — e.g., `file2 info example.pdf`");
        const fullPath = path.join(STORAGE_DIR, filename);
        if (!fs.existsSync(fullPath)) return await message.reply(`File not found: "${filename}"`);
        const stats = fs.statSync(fullPath);
        return await message.reply(`ℹ️ File Info:\n• Name: ${filename}\n• Size: ${(stats.size / 1024).toFixed(2)} KB\n• Last Modified: ${stats.mtime}`);
      }

      // --- SEND ---
      if (sub === "send" || sub === "get") {
        const filename = args.slice(1).join(" ");
        if (!filename) return await message.reply("Please provide a file name — e.g., `file2 send example.pdf`");
        const fullPath = path.join(STORAGE_DIR, filename);
        if (!fs.existsSync(fullPath)) return await message.reply(`File not found: "${filename}"`);
        return await message.reply({ document: fs.createReadStream(fullPath), fileName: filename });
      }

      // --- ADD ---
      if (sub === "add" || sub === "upload") {
        if (!message.reply || !message.reply.isMedia) {
          return await message.reply("To add a file, reply to a message containing a file and use `file2 add`.");
        }

        const bufferOrStream = await downloadReply(message.reply);
        let originalName = (message.reply.fileName || message.reply.filename || `upload_${Date.now()}`).toString();
        originalName = originalName.replace(/[\/\\<>:"|?*]+/g, "_").trim();
        const savePath = path.join(STORAGE_DIR, originalName);

        if (Buffer.isBuffer(bufferOrStream)) fs.writeFileSync(savePath, bufferOrStream);
        else if (bufferOrStream.pipe) {
          const ws = fs.createWriteStream(savePath);
          bufferOrStream.pipe(ws);
          await new Promise((res, rej) => { ws.on('finish', res); ws.on('error', rej); });
        } else if (typeof bufferOrStream === "string") {
          const base64 = bufferOrStream.split(',').pop();
          fs.writeFileSync(savePath, Buffer.from(base64, 'base64'));
        } else {
          return await message.reply("Failed to download the file.");
        }

        return await message.reply(`✅ File added successfully:\n• ${originalName}\n📂 Saved at: ${savePath}`);
      }

      // --- REMOVE ---
      if (sub === "remove" || sub === "delete") {
        const filename = args.slice(1).join(" ");
        if (!filename) return await message.reply("Please provide a file name to delete — e.g., `file2 remove example.pdf`");
        const fullPath = path.join(STORAGE_DIR, filename);
        if (!fs.existsSync(fullPath)) return await message.reply(`File not found: "${filename}"`);

        await message.reply(`⚠️ Are you sure you want to delete "${filename}"? (Yes/No)`);
        const reply = await awaitReply(message.from, 30000);
        if (!reply || !["yes"].includes(reply.text.toLowerCase())) {
          return await message.reply("❌ File deletion cancelled.");
        }

        fs.unlinkSync(fullPath);
        return await message.reply(`✅ File deleted successfully:\n• ${filename}`);
      }

      return await message.reply("Unknown option. Usage:\n• file2 send <filename>\n• file2 add\n• file2 remove <filename>\n• file2 list\n• file2 info <filename>");
    } catch (err) {
      console.error("file2 command error:", err);
      await message.reply("Error: " + (err.message || err.toString()));
    }
  }
};
