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
const messages = [
  // ===================== PURE BANGLA (35) =====================
  `🤣 ${displayName}, তোর মাথা হলো পুরোনো রেডিও—ঘুরালেও শুধু noise আসে।`,
  `🐢 ${displayName}, তোর গতি এমন slow—ঘড়ি দেখে মনে হয় থেমে গেছে।`,
  `📦 ${displayName}, তুই হলো খালি বাক্স—শব্দ বেশি, ভেতরে কিছু নেই।`,
  `😂 ${displayName}, তুই এমন কৌতুক—হাসার আগেই মানুষ বিরক্ত হয়।`,
  `🪫 ${displayName}, তোর চার্জ শেষ—কাজে লাগে না, display তবু জ্বলে।`,
  `🎭 ${displayName}, তোর drama serial-এর থেকেও boring।`,
  `🍌 ${displayName}, তোর বুদ্ধি কলা—খোসা ফেললেই ফাঁকা।`,
  `🚪 ${displayName}, তুই এমন দরজা—খুললেই দেয়ালে ধাক্কা লাগে।`,
  `🥱 ${displayName}, তোর কথা শুনলেই মানুষ হাই তোলে।`,
  `🐸 ${displayName}, তুই এমন ব্যাঙ—বর্ষা ছাড়া কারো মনে পড়ে না।`,
  `📉 ${displayName}, তোর popularity chart শেয়ার বাজারের থেকেও নিচে নামে।`,
  `🍵 ${displayName}, তোর vibe হলো বাসি চা—স্বাদ নাই, গন্ধই কষ্টকর।`,
  `🤡 ${displayName}, তুই এমন জোকার—সার্কাসও তোরে নেবে না।`,
  `🕳️ ${displayName}, তুই হলো ফাঁকা কূপ—শব্দ দিলে প্রতিধ্বনি আসে, পানি না।`,
  `🔑 ${displayName}, তুই এমন চাবি—কোনো তালায় মেলে না।`,
  `🤣 ${displayName}, তোর মাথা এমন ফাঁকা—ভাড়া দিলে মেলার মাঠ বানানো যেতো।`,
  `🐔 ${displayName}, তুই এমন মুরগি—ডিম দেয় না, শুধু ডাকাডাকি করে।`,
  `🐒 ${displayName}, তুই এমন বানর—চিপস দেখলেই নাচতে শুরু করিস।`,
  `😂 ${displayName}, তোর হাসি এমন—শুনার পর মানুষ রড দিয়ে কান বন্ধ করে।`,
  `🥶 ${displayName}, তুই এমন fridge—ভেতরে কিছু নাই, শুধু ঠাণ্ডা বাতাস।`,
  `🍵 ${displayName}, তুই এমন বাসি চা—খেলে পেট খারাপ, ফেলে দিলেও গন্ধ।`,
  `🥔 ${displayName}, তুই এমন আলু—যেকোনো রান্নায় গুঁজে দেওয়া যায়, কাজ নাই।`,
  `🐸 ${displayName}, তোর গলা এমন ব্যাঙের ডাক—কেউ ঘুম ভাঙে, কেউ লাফ দেয়।`,
  `🪑 ${displayName}, তুই এমন চেয়ার—বসে আরামে থাকা যায় না, কাঁপে সবসময়।`,
  `📦 ${displayName}, তোর মাথা হলো খালি বাক্স—ঠোকা দিলেই টুং শব্দ হয়।`,
  `🕳️ ${displayName}, তুই এমন গর্ত—পা পড়লেই মানুষ ডুবে যায়, বের হতে পারে না।`,
  `🤡 ${displayName}, তুই এমন পুতুল—মুখে রঙ, ভেতরে ফাঁকা কাঠ।`,
  `🐍 ${displayName}, তুই এমন সাপ—বিষ নাই, শুধু ফোঁসফোঁস শব্দ।`,
  `🐴 ${displayName}, তোর হাসি এমন ঘোড়া—শুনলে মানুষ দৌড় দেয়।`,
  `📺 ${displayName}, তুই এমন টিভি—চ্যানেল পাল্টালেও একই বাজে অনুষ্ঠান।`,
  `🪫 ${displayName}, তোর বুদ্ধি হলো dead battery—চার্জ দিলেও কাজ হয় না।`,
  `🐢 ${displayName}, তুই এমন কচ্ছপ—পাহাড়ে উঠতে গিয়ে বয়স পার করে ফেলিস।`,
  `🥕 ${displayName}, তুই এমন গাজর—বাইরে রঙিন, ভেতরে শুধু ফাঁকা।`,
  `🧅 ${displayName}, তুই এমন পেঁয়াজ—কাটলেই শুধু চোখে জল আসে।`,
  `🪞 ${displayName}, তুই এমন আয়না—দেখলেই নিজের মুখ দেখে ভয় পায়।`,

  // ===================== PURE ENGLISH (15) =====================
  `😂 ${displayName}, your brain is like Internet Explorer—slow and useless.`,
  `📱 ${displayName}, you’re that 1% battery nobody wants to deal with.`,
  `🤣 ${displayName}, you’re like a pop-up ad—annoying every single time.`,
  `🐌 ${displayName}, your speed makes dial-up internet look fast.`,
  `🧃 ${displayName}, you’re an empty juice box—nothing inside, just noise.`,
  `🥱 ${displayName}, talking to you is like reading a 200-page manual.`,
  `🎮 ${displayName}, you’re a broken joystick—always stuck.`,
  `🧩 ${displayName}, you’re that missing puzzle piece—never fits anywhere.`,
  `📺 ${displayName}, you’re a rerun of a boring show—same nonsense daily.`,
  `🪫 ${displayName}, you’re a dead battery—completely useless.`,
  `🤡 ${displayName}, you’re a rejected clown—even kids don’t laugh.`,
  `🎤 ${displayName}, your voice is like auto-tune gone wrong.`,
  `🐸 ${displayName}, you’re the frog that thinks it’s a lion.`,
  `🕹️ ${displayName}, you’re lag incarnate—forever buffering.`,
  `📡 ${displayName}, your signal is lost—searching forever.`,

  // ===================== BANGLISH (15) =====================
  `🤣 ${displayName}, tor idea holo TikTok life hack—kajer cheye beshi damage kore।`,
  `😴 ${displayName}, tumi holo boring teacher—class e sobai ghumay।`,
  `🎧 ${displayName}, tui emon headphone—connect korlei “device not supported” bole।`,
  `😂 ${displayName}, tor matha holo old calculator—2+2 = 5 dei।`,
  `🐢 ${displayName}, tui holo slow motion video—skip marleo cholte chayna।`,
  `🎮 ${displayName}, gamer bole daabi korish but loading screen e rage quit korish।`,
  `🤡 ${displayName}, tui holo WhatsApp forward—20 bar pathaileo keu khule dekhe na।`,
  `📲 ${displayName}, tor connection holo 2G—kono kaaj shesh hoy na।`,
  `🥶 ${displayName}, tor reaction holo fridge—sob cold।`,
  `📢 ${displayName}, tor kotha holo broken speaker—sound beshi, sense kom।`,
  `🎬 ${displayName}, tui holo flop cinema—poster valo, content zero।`,
  `🔋 ${displayName}, tumi holo powerbank without charge—just weight.`,
  `🐍 ${displayName}, tumi holo plastic snake—dheki boleo kome na।`,
  `😬 ${displayName}, tor confidence holo Facebook event—RSVP beshi, ashe keu na।`,
  `🧊 ${displayName}, tui holo ice without freezer—melte deri lage na।`,

  // ===================== MIX (10) =====================
  `🤣 ${displayName}, tor brain holo Windows update—sudhu “Restart Required” dekhae।`,
  `🥲 ${displayName}, tumi holo Netflix trailer—hype beshi, content zero।`,
  `🐌 ${displayName}, tor speed holo buffering YouTube video—360p teo load hoy na।`,
  `😂 ${displayName}, tui holo spam mail—sobai delete kore, keu pore na।`,
  `🧃 ${displayName}, tor logic holo expired juice—taste beshi kharap।`,
  `🥱 ${displayName}, tumi holo PowerPoint slide—dekhei ghum dhore।`,
  `🎧 ${displayName}, tui holo Bluetooth device—connect hote 10 bar try korte hoy।`,
  `🐢 ${displayName}, tor progress holo GTA loading screen—shesh hoyna।`,
  `🤡 ${displayName}, tui holo circus e rejected clown—backup jodio tor kaaj nei।`,
  `📱 ${displayName}, tor vibe holo Nokia torchlight—light ache, smartness nai।`,
    // ==== (৫০টা বাংলা + English random roast লাইন with emoji) ====
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
