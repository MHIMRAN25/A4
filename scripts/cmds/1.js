module.exports = {
  config: {
    name: "file2",
    aliases: ["file", "f"],
    version: "1.2",
    author: "Imran",
    role: 0,
    shortDescription: "Send, add, remove & list files",
    longDescription: "Usage:\n• file send <filename>\n• file add (reply to message)\n• file remove <filename)\n• file list\n• file info <filename>",
    category: "utility",
  },

  // মূল পরিবর্তন: run -> onStart
  onStart: async ({ message, args, sendMessage, downloadReply, awaitReply }) => {
    try {
      const fs = require('fs');
      const path = require('path');
      const STORAGE_DIR = path.join(__dirname, '..', 'files');
      if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });
      const chatId = message.chatId || message.from;

      if (!args || args.length === 0) {
        return await sendMessage(chatId, "ব্যবহার:\n• file send <filename>\n• file add\n• file remove <filename>\n• file list\n• file info <filename>");
      }

      const sub = args[0].toLowerCase();

      if (sub === "list") {
        const files = fs.readdirSync(STORAGE_DIR);
        if (files.length === 0) return await sendMessage(chatId, "কোনো ফাইল নেই।");
        return await sendMessage(chatId, `📂 ফাইলসমূহ:\n• ${files.join("\n• ")}`);
      }

      if (sub === "info") {
        const filename = args.slice(1).join(" ");
        if (!filename) return await sendMessage(chatId, "ফাইলের নাম দাও — উদাহরণ: `file info example.pdf`");
        const fullPath = path.join(STORAGE_DIR, filename);
        if (!fs.existsSync(fullPath)) return await sendMessage(chatId, `ফাইল পাওয়া যায়নি: "${filename}"`);
        const stats = fs.statSync(fullPath);
        return await sendMessage(chatId, `ℹ️ ফাইলের তথ্য:\n• নাম: ${filename}\n• সাইজ: ${(stats.size / 1024).toFixed(2)} KB\n• শেষ আপডেট: ${stats.mtime}`);
      }

      if (sub === "send" || sub === "get") {
        const filename = args.slice(1).join(" ");
        if (!filename) return await sendMessage(chatId, "ফাইলের নাম দাও — উদাহরণ: `file send example.pdf`");
        const fullPath = path.join(STORAGE_DIR, filename);
        if (!fs.existsSync(fullPath)) return await sendMessage(chatId, `ফাইল পাওয়া যায়নি: "${filename}"`);
        return await sendMessage(chatId, { document: fs.createReadStream(fullPath), fileName: filename });
      }

      if (sub === "add" || sub === "upload") {
        if (!message.reply || !message.reply.isMedia) {
          return await sendMessage(chatId, "ফাইল যোগ করতে হলে রিপ্লাই করে `file add` চালাও।");
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
          return await sendMessage(chatId, "ফাইল ডাউনলোড করা যায়নি।");
        }
        return await sendMessage(chatId, `✅ ফাইল যোগ করা হয়েছে:\n• ${originalName}`);
      }

      if (sub === "remove" || sub === "delete") {
        const filename = args.slice(1).join(" ");
        if (!filename) return await sendMessage(chatId, "মুছে দিতে ফাইলের নাম দাও — উদাহরণ: `file remove example.pdf`");
        const fullPath = path.join(STORAGE_DIR, filename);
        if (!fs.existsSync(fullPath)) return await sendMessage(chatId, `ফাইল পাওয়া যায়নি: "${filename}"`);

        await sendMessage(chatId, `⚠️ আপনি কি নিশ্চিত "${filename}" মুছে দিতে চান? (হ্যাঁ/না)`);
        const reply = await awaitReply(chatId, 30000);
        if (!reply || !["হ্যাঁ","yes"].includes(reply.text.toLowerCase())) {
          return await sendMessage(chatId, "❌ মুছে দেওয়া বাতিল করা হয়েছে।");
        }
        fs.unlinkSync(fullPath);
        return await sendMessage(chatId, `✅ ফাইল মুছে দেওয়া হয়েছে:\n• ${filename}`);
      }

      return await sendMessage(chatId, "অজানা অপশন। ব্যবহার:\n• file send <filename>\n• file add\n• file remove <filename>\n• file list\n• file info <filename>");
    } catch (err) {
      console.error("file command error:", err);
      const chatId = message.chatId || message.from;
      await sendMessage(chatId, "এরর হয়েছে: " + (err.message || err.toString()));
    }
  }
};
