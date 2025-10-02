module.exports.config = {
  name: "roast",
  version: "1.1.0",
  role: 2,
  author: "M H IMRAN", // লক করা আছে
  description: "tag roast (Bangla + English random roast lines with emoji)",
  category: "media",
  usages: "roast @mention",
  countDowns: 5,
  dependencies: {}
};

module.exports.onStart = async function({ api, event }) {
  try {
    // Author lock
    const expectedB64 = "TSBIIElNUkFO";
    const expectedAuthor = Buffer.from(expectedB64, "base64").toString("utf8");
    if (module.exports.config.author !== expectedAuthor) {
      return api.sendMessage("❌ Permission denied — author mismatch.", event.threadID);
    }

    const mentions = Object.keys(event.mentions || {});
    if (!mentions.length) {
      return api.sendMessage("👉 কাকে মুরগী বানাতে চান @mention করুন। (উদাহরণ: roast @username)", event.threadID);
    }

    const uid = mentions[0];
    const displayName = event.mentions[uid] || "তুমি";
    const mentionsArray = [{ id: uid, tag: displayName }];

    // ==== (৫০টা বাংলা + English random roast লাইন with emoji) ====
    const messages = [
      `🔥 ${displayName}, তুই এমন WiFi signal—strong দেখায়, কিন্তু কাজ করে না।`,
      `${displayName}, তোর আইডিয়া এত weak যে calculator ও divide by zero error দেয় 🤯`,
      `😂 ${displayName}, তুই এমন update যেটা install হতেই phone hang করে।`,
      `${displayName}, তোর presence হলো background app—কেউ খেয়ালই করে না 😴`,
      `🙄 ${displayName}, তুই এমন speech দিস যেটা YouTube skip button-ও শুনতে চাইবে না।`,
      `⚡ ${displayName}, তুই shortcut key হলে কাজের বদলে laptop restart হয়ে যেত।`,
      `🤡 ${displayName}, তোর logic হলো circus show—funny but useless।`,
      `${displayName}, তুই এমন motivation যে শুনলেই মানুষ demotivate হয় 📉`,
      `🚀 ${displayName}, তোর progress এমন slow যে traffic jam-ও তোকে হারিয়ে দেয়।`,
      `😑 ${displayName}, তোর decision হলো Google search—10টা result, কোনটাই কাজের না।`,
      `🥴 ${displayName}, তুই এমন app—open করলে crash হয়, বন্ধ করলে relief মেলে।`,
      `📉 ${displayName}, তোর skill graph সবসময় নিচেই পড়ে যায়।`,
      `${displayName}, তুই alarm clock হলেও snooze-এর আগেই ঘুম পাড়িয়ে দিতিস ⏰`,
      `🤔 ${displayName}, তোর চিন্তা হলো buffering video—চলবেই না।`,
      `😆 ${displayName}, তোর talent হলো free trial—সদা expire হয়ে যায়।`,
      `${displayName}, তুই এমন charger—plug ইন করলে ফোনের চার্জ কমে যায় 🔋`,
      `😒 ${displayName}, তুই এমন shortcut যেটা সবসময় error দেখায়।`,
      `🍿 ${displayName}, তোর কথা Netflix trailer-এর মতো—হাইপ বেশি, কন্টেন্ট শূন্য।`,
      `${displayName}, তুই এমন Google map—direction দিলেও মানুষ lost হয়ে যায় 🗺️`,
      `📶 ${displayName}, তোর connection হলো 2G network—সময় নষ্ট ছাড়া কিছু না।`,
      `😂 ${displayName}, তুই এমন plan দিস, যেটা শুনেই মানুষ হেসে পড়ে।`,
      `🙃 ${displayName}, তোর আচরণ হলো upside-down smiley—meaningless।`,
      `🎭 ${displayName}, তুই এমন drama দিস যেটার কোন climax নেই।`,
      `🤖 ${displayName}, তুই AI হলেও training data corrupted হতো।`,
      `${displayName}, তুই calculator হলেও 2+2 = 5 দিতিস 🧮`,
      `🚫 ${displayName}, তোর কথা হলো spam mail—সবাই delete করে।`,
      `😬 ${displayName}, তুই এমন search result—প্রথম ১০টা useless link।`,
      `🌧️ ${displayName}, তোর মেজাজ হলো rainy weather—মুড খারাপ ছাড়া কিছু না।`,
      `🤣 ${displayName}, তোর কনফিডেন্স হলো April Fool prank।`,
      `${displayName}, তুই এমন USB port—সবসময় not recognized দেখায় 💻`,
      `📺 ${displayName}, তোর কথা হলো old TV signal—noise ছাড়া কিছুই নেই।`,
      `😵 ${displayName}, তুই এমন road map যেটা সবসময় dead end এ নিয়ে যায়।`,
      `📢 ${displayName}, তোর speech volume বেশি, কিন্তু content 0।`,
      `🤦 ${displayName}, তুই এমন password—guess করতে সেকেন্ড লাগে।`,
      `💤 ${displayName}, তোর vibe এত boring যে ঘুমের ট্যাবলেটও fail করে।`,
      `${displayName}, তোর brain হলো 512MB RAM—একটু চাপ দিলেই hang হয় 🖥️`,
      `🙃 ${displayName}, তোর মুড হলো Windows error sound।`,
      `📡 ${displayName}, তোর IQ হলো broken antenna—signal আসে না।`,
      `😎 ${displayName}, তুই এমন hero যে movie release-এর আগেই flop।`,
      `🌀 ${displayName}, তুই এমন cyclone—noise বেশি, কাজ কম।`,
      `😏 ${displayName}, তোর vibe হলো forwarded WhatsApp msg—কেউ পড়তে চায় না।`,
      `⚙️ ${displayName}, তোর চিন্তা হলো loose screw—ঠিক জায়গায় বসে না।`,
      `${displayName}, তুই এমন wallpaper—nice দেখতে, কিন্তু কাজের কিছুই না 🖼️`,
      `😶 ${displayName}, তুই এমন app icon যেটা press করলে কিছুই খোলে না।`,
      `📉 ${displayName}, তোর IQ graph stock market crash-এর থেকেও দ্রুত পড়ে।`,
      `🕒 ${displayName}, তুই এমন clock যেটা সবসময় wrong time দেখায়।`,
      `😜 ${displayName}, তোর ভাবনা হলো cartoon episode—funny কিন্তু সিরিয়াস নয়।`,
      `🔋 ${displayName}, তোর energy হলো 1% battery mode—কোনো কাজের না।`,
      `🤣 ${displayName}, তোর নাম শুনলেই লোকজন হাসে—কারণ তুমি walking joke।`
    ];
    // ==========================================================

    const chosen = messages[Math.floor(Math.random() * messages.length)];
    return api.sendMessage({ body: chosen, mentions: mentionsArray }, event.threadID);

  } catch (err) {
    console.error(err);
    api.sendMessage("⚠️ কিছু সমস্যা হয়েছে কমান্ড চালাতে গিয়ে।", event.threadID);
  }
};
