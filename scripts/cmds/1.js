// commands/file2.js
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "file2",
    aliases: ["file2", "f2"],
    version: "1.3",
    author: "Imran",
    role: 0,
    shortDescription: "Send, add, remove & list files using message.reply",
    longDescription: "Usage:\n• file2 send <filename>\n• file2 add (reply to message)\n• file2 remove <filename>\n• file2 list\n• file2 info <filename>",
    category: "utility",
  },

  onStart: async ({ message, args, downloadReply, awaitReply }) => {
    try {
      const STORAGE_DIR = path.join(__dirname, '..', 'files');
      if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });

      if (!args || args.length === 0) {
        return await message.reply("ব্যবহার:\n• file2 send <filename>\n• file2 add\n• file2 remove <filename>\n• file2 list\n• file2 info <filename>");
      }

      const sub = args[0].toLowerCase();

      // --- LIST ---
      if (sub === "list") {
        const files = fs.readdirSync(STORAGE_DIR);
        if (files.length === 0) return await message.reply("কোনো ফাইল নেই।");
        return await message.reply(`📂 সার্ভারের ফাইলসমূহ:\n• ${files.join("\n• ")}`);
      }

      // --- INFO ---
      if (sub === "info") {
        const filename = args.slice(1).join(" ");
        if (!filename) return await message.reply("ফাইলের নাম দাও — উদাহরণ: `file2 info example.pdf`");
        const fullPath = path.join(STORAGE_DIR, filename);
        if (!fs.existsSync(fullPath)) return await message.reply(`ফাইল পাওয়া যায়নি: "${filename}"`);
        const stats = fs.statSync(fullPath);
        return await message.reply(`ℹ️ ফাইলের তথ্য:\n• নাম: ${filename}\n• সাইজ: ${(stats.size / 1024).toFixed(2)} KB\n• শেষ আপডেট: ${stats.mtime}`);
      }

      // --- SEND ---
      if (sub === "send" || sub === "get") {
        const filename = args.slice(1).join(" ");
        if (!filename) return await message.reply("ফাইলের নাম দাও — উদাহরণ: `file2 send example.pdf`");
        const fullPath = path.join(STORAGE_DIR, filename);
        if (!fs.existsSync(fullPath)) return await message.reply(`ফাইল পাওয়া যায়নি: "${filename}"`);
        return await message.reply({ document: fs.createReadStream(fullPath), fileName: filename });
      }

      // --- ADD ---
      if (sub === "add" || sub === "upload") {
        if (!message.reply || !message.reply.isMedia) {
          return await message.reply("ফাইল যোগ করতে হলে রিপ্লাই করে `file2 add` চালাও।");
        }
        const bufferOrStream = await downloadReply(message.reply);
        let originalName = (message.reply.fileName || message.reply.filename || `upload_${Date.now()}`).toString();
        originalName = originalName.replace(/[\/\\<>:"|?*]+/g, "_");
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
          return await message.reply("ফাইল ডাউনলোড করা যায়নি।");
        }

        return await message.reply(`✅ ফাইল যোগ করা হয়েছে:\n• ${originalName}`);
      }

      // --- REMOVE ---
      if (sub === "remove" || sub === "delete") {
        const filename = args.slice(1).join(" ");
        if (!filename) return await message.reply("মুছে দিতে ফাইলের নাম দাও — উদাহরণ: `file2 remove example.pdf`");
        const fullPath = path.join(STORAGE_DIR, filename);
        if (!fs.existsSync(fullPath)) return await message.reply(`ফাইল পাওয়া যায়নি: "${filename}"`);

        await message.reply(`⚠️ আপনি কি নিশ্চিত "${filename}" মুছে দিতে চান? (হ্যাঁ/না)`);
        const reply = await awaitReply(message.from, 30000);
        if (!reply || !["হ্যাঁ","yes"].includes(reply.text.toLowerCase())) {
          return await message.reply("❌ মুছে দেওয়া বাতিল করা হয়েছে।");
        }

        fs.unlinkSync(fullPath);
        return await message.reply(`✅ ফাইল মুছে দেওয়া হয়েছে:\n• ${filename}`);
      }

      return await message.reply("অজানা অপশন। ব্যবহার:\n• file2 send <filename>\n• file2 add\n• file2 remove <filename>\n• file2 list\n• file2 info <filename>");
    } catch (err) {
      console.error("file2 command error:", err);
      await message.reply("এরর হয়েছে: " + (err.message || err.toString()));
    }
  }
};
