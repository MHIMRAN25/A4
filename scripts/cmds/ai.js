const axios = require('axios');
const fs = require('fs');
const path = require('path');
const validUrl = require('valid-url');
const { v4: uuidv4 } = require('uuid');

const TMP_DIR = path.join(__dirname, 'tmp');
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);

// 🔹 ফাইল ডাউনলোড ফাংশন
const downloadFile = async (url, ext) => {
  const filePath = path.join(TMP_DIR, `${uuidv4()}.${ext}`);
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(filePath, Buffer.from(res.data));
  return filePath;
};

// 🔹 ফাইল ক্লিনআপ
const cleanupFiles = (files = []) => {
  for (const f of files) {
    try { fs.unlinkSync(f); } catch {}
  }
};

// 🔹 কনভারসেশন রিসেট
const resetConversation = async (api, event, message) => {
  api.setMessageReaction("♻️", event.messageID, () => {}, true);
  try {
    await axios.delete(`https://shizuai.vercel.app/chat/clear/${event.senderID}`);
    return message.reply(`✅ Conversation reset for UID: ${event.senderID}`);
  } catch (err) {
    console.error('❌ Reset Error:', err.message);
    return message.reply("❌ Reset failed. আবার চেষ্টা করুন।");
  }
};

// 🔹 মূল AI হ্যান্ডলার
const handleAIRequest = async (api, event, userInput, message) => {
  const userId = event.senderID;
  let msg = userInput;
  let imageUrl = null;
  api.setMessageReaction("⏳", event.messageID, () => {}, true);

  // ✅ রিপ্লাই ডেটা ধরছে
  if (event.messageReply) {
    const reply = event.messageReply;
    if (reply.senderID !== global.GoatBot?.botID && reply.body) {
      const trimmed = reply.body.length > 300 ? reply.body.slice(0, 300) + "..." : reply.body;
      msg += `\n\n📌 Reply:\n"${trimmed}"`;
    }
    const att = reply.attachments?.[0];
    if (att?.type === 'photo') imageUrl = att.url;
  }

  // ✅ URL থাকলে ইমেজ হিসেবে ধরবে
  const urlMatch = msg.match(/(https?:\/\/[^\s]+)/)?.[0];
  if (urlMatch && validUrl.isWebUri(urlMatch)) {
    imageUrl = urlMatch;
    msg = msg.replace(urlMatch, '').trim();
  }

  if (!msg && !imageUrl) {
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    return message.reply("💬 মেসেজ বা ছবি দিতে হবে।");
  }

  const downloadedFiles = [];

  try {
    // 🔹 GPT রেসপন্স (text)
    const gptRes = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      { model: "gpt-4o-mini", messages: [{ role: "user", content: msg }] },
      { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } }
    );
    const gptText = gptRes.data.choices[0].message.content;

    // 🔹 মিডিয়া AI রেসপন্স
    const aiRes = await axios.post(
      "https://shizuai.vercel.app/chat",
      { uid: userId, message: msg, image_url: imageUrl },
      { timeout: 60000 }
    );

    const {
      reply, image_url, music_data, video_data,
      shotti_data, lyrics_data
    } = aiRes.data;

    let finalReply = gptText || reply || "✅ AI উত্তর তৈরি হয়েছে।";
    const attachments = [];

    // 🔹 মিডিয়া ফাইল একসাথে ডাউনলোড
    const mediaTasks = [];

    if (image_url)
      mediaTasks.push(
        downloadFile(image_url, 'jpg').then(f => {
          downloadedFiles.push(f);
          attachments.push(fs.createReadStream(f));
        }).catch(() => finalReply += "\n🖼️ ছবি ডাউনলোড ব্যর্থ হয়েছে।")
      );

    if (music_data?.downloadUrl)
      mediaTasks.push(
        downloadFile(music_data.downloadUrl, 'mp3').then(f => {
          downloadedFiles.push(f);
          attachments.push(fs.createReadStream(f));
        }).catch(() => finalReply += "\n🎵 মিউজিক ডাউনলোড ব্যর্থ হয়েছে।")
      );

    if (video_data?.downloadUrl)
      mediaTasks.push(
        downloadFile(video_data.downloadUrl, 'mp4').then(f => {
          downloadedFiles.push(f);
          attachments.push(fs.createReadStream(f));
        }).catch(() => finalReply += "\n🎬 ভিডিও ডাউনলোড ব্যর্থ হয়েছে।")
      );

    if (shotti_data?.videoUrl)
      mediaTasks.push(
        downloadFile(shotti_data.videoUrl, 'mp4').then(f => {
          downloadedFiles.push(f);
          attachments.push(fs.createReadStream(f));
        }).catch(() => finalReply += "\n🎬 Shoti ভিডিও ডাউনলোড ব্যর্থ হয়েছে।")
      );

    await Promise.all(mediaTasks);

    // 🔹 লিরিক্স হ্যান্ডল
    if (lyrics_data) {
      const max = 1500;
      let lyr = lyrics_data.lyrics;
      if (lyr.length > max) lyr = lyr.substring(0, max) + '... [truncated]';
      finalReply += `\n\n🎵 "${lyrics_data.track_name}" এর লিরিক্স:\n${lyr}`;
    }

    // 🔹 মেসেজ পাঠানো
    const sent = await message.reply({
      body: finalReply,
      attachment: attachments.length ? attachments : undefined
    });

    if (sent?.messageID) {
      global.GoatBot.onReply.set(sent.messageID, {
        commandName: 'ai',
        messageID: sent.messageID,
        author: userId
      });
    }

    api.setMessageReaction("✅", event.messageID, () => {}, true);
  } catch (err) {
    console.error("❌ AI Error:", err.response?.data || err.message);
    api.setMessageReaction("❌", event.messageID, () => {}, true);
    message.reply("⚠️ AI ত্রুটি হয়েছে। আবার চেষ্টা করুন।");
  } finally {
    cleanupFiles(downloadedFiles);
  }
};

// 🔹 এক্সপোর্ট সেকশন (Metadata সহ)
module.exports = {
  config: {
    name: 'ai',
    aliases: ['gpt', 'smartai'],
    version: '3.1.0',
    author: 'IMRAN x GPT-5',
    role: 0,
    shortDescription: 'GPT + AI মিডিয়া চ্যাট (Full Version)',
    longDescription:
      'এই কমান্ডে GPT টেক্সট, ছবি, মিউজিক, ভিডিও, Shoti ভিডিও, লিরিক্স—সব একসাথে কাজ করবে।',
    category: 'ai',
    guide: {
      en: '{p}ai [message] - Ask AI anything\n{p}ai (reply) - Reply সহ ব্যবহার\n{p}reset - Conversation clear',
      bn: '{p}ai [message] - যেকোনো প্রশ্ন জিজ্ঞাসা করুন\n{p}ai (reply) - রিপ্লাই সহ ব্যবহার\n{p}reset - কথোপকথন রিসেট'
    }
  },

  onStart: async function ({ api, event, args, message }) {
    if (args[0] === 'reset') return resetConversation(api, event, message);
    const input = args.join(' ');
    await handleAIRequest(api, event, input, message);
  },

  onReply: async function ({ api, event, Reply, message }) {
    if (event.senderID !== Reply.author) return;
    await handleAIRequest(api, event, event.body, message);
  }
};
