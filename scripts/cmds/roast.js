const roastLines = [
  // ===== Pure Bangla =====
  "🤣 ${name}, তোর মাথা এমন ফাঁকা—ভাড়া দিলে মেলার মাঠ বানানো যেতো।",
  "🐔 ${name}, তুই এমন মুরগি—ডিম দেয় না, শুধু ডাকাডাকি করে।",
  "🐒 ${name}, তুই এমন বানর—চিপস দেখলেই নাচতে শুরু করিস।",
  "😂 ${name}, তোর হাসি এমন—শোনার পর মানুষ রড দিয়ে কান বন্ধ করে।",
  "🥶 ${name}, তুই এমন fridge—ভেতরে কিছু নাই, শুধু ঠাণ্ডা বাতাস।",
  "🍵 ${name}, তুই এমন বাসি চা—খেলে পেট খারাপ, ফেলে দিলেও গন্ধ।",
  "🥔 ${name}, তুই এমন আলু—যেকোনো রান্নায় গুঁজে দেওয়া যায়, কাজ নাই।",
  "🐸 ${name}, তোর গলা এমন ব্যাঙের ডাক—কেউ ঘুম ভাঙে, কেউ লাফ দেয়।",
  "🪑 ${name}, তুই এমন চেয়ার—বসে আরামে থাকা যায় না, কাঁপে সবসময়।",
  "📦 ${name}, তোর মাথা হলো খালি বাক্স—ঠোকা দিলেই টুং শব্দ হয়।",
  "🕳️ ${name}, তুই এমন গর্ত—পা পড়লেই মানুষ ডুবে যায়, বের হতে পারে না।",
  "🤡 ${name}, তুই এমন পুতুল—মুখে রঙ, ভেতরে ফাঁকা কাঠ।",
  "🐍 ${name}, তুই এমন সাপ—বিষ নাই, শুধু ফোঁসফোঁস শব্দ।",
  "🐴 ${name}, তোর হাসি এমন ঘোড়া—শুনলে মানুষ দৌড় দেয়।",
  "📺 ${name}, তুই এমন টিভি—চ্যানেল পাল্টালেও একই বাজে অনুষ্ঠান।",
  "🪫 ${name}, তোর বুদ্ধি হলো dead battery—চার্জ দিলেও কাজ হয় না।",
  "🐢 ${name}, তুই এমন কচ্ছপ—পাহাড়ে উঠতে গিয়ে বয়স পার করে ফেলিস।",
  "🥕 ${name}, তুই এমন গাজর—বাইরে রঙিন, ভেতরে শুধু ফাঁকা।",
  "🧅 ${name}, তুই এমন পেঁয়াজ—কাটলেই শুধু চোখে জল আসে।",
  "🪞 ${name}, তুই এমন আয়না—দেখলেই নিজের মুখ দেখে ভয় পায়।",
  "😹 ${name}, তুই এমন বিড়াল—ম্যাঁও না বলে ‘হায় রে’ বলে ডাকিস।",
  "🥴 ${name}, তোর বুদ্ধি এমন খিচুড়ি—কোনো স্বাদ নেই, শুধু গুলমাল।",
  "🪙 ${name}, তুই এমন কয়েন—এপারও বাজে, ওপারও বাজে।",
  "🐂 ${name}, তোর জেদ এমন ষাঁড়—কাজ নাই, শুধু দৌড়াদৌড়ি।",
  "🦆 ${name}, তুই এমন হাঁস—ডানা মেলে উড়িস না, শুধু কুতকুত।",
  "🥦 ${name}, তুই এমন ব্রকোলি—দেখতে স্বাস্থ্যকর, খেতে জঘন্য।",
  "🍌 ${name}, তুই এমন কলা—বাইরে হলুদ, ভেতরে শুধু নরম।",
  "🛑 ${name}, তুই এমন সিগনাল—সবাই থামে, তবু কাজ হয় না।",
  "📯 ${name}, তোর গলা এমন হর্ন—শুনলে সবাই রাগে চুল ছিঁড়ে।",
  "🧱 ${name}, তুই এমন ইট—ভেতরে ঠাণ্ডা, বাইরে শুধু ধুলো।",
  "🌽 ${name}, তুই এমন ভুট্টা—চিবোলেও দাঁতে আটকে থাকে।",
  "🎃 ${name}, তুই এমন কুমড়া—আকারে বড়, ভেতরে ফাঁকা।",
  "🥳 ${name}, তুই এমন পার্টি—শুরু হবার আগে শেষ হয়ে যায়।",
  "🦐 ${name}, তুই এমন চিংড়ি—মাথায় ভর, শরীরে কিছু নাই।",
  "🛵 ${name}, তুই এমন স্কুটি—শব্দ বেশি, গতি কম।",

  // ===== Pure English =====
  "😂 ${name}, you’re like WiFi in the village—always weak!",
  "🤣 ${name}, you’re a software update—nobody wants you but still pop up.",
  "😜 ${name}, you’re like a keyboard without spacebar—totally useless.",
  "🐌 ${name}, you’re slower than free internet on rainy days.",
  "🪫 ${name}, you’re a dead battery—0% energy, 100% problem.",
  "🎈 ${name}, you’re a balloon—full of air, ready to burst.",
  "💻 ${name}, you’re a laggy PC—takes 10 years to respond.",
  "🥱 ${name}, you’re a boring Netflix show nobody finishes.",
  "🦖 ${name}, you’re a dinosaur—outdated and noisy.",
  "🧃 ${name}, you’re like watered juice—no taste at all.",
  "📎 ${name}, you’re a paperclip—extra but never needed.",
  "🌧️ ${name}, you’re like rain in exam days—always unwanted.",
  "🕸️ ${name}, you’re like Internet Explorer—slow and forgotten.",
  "📱 ${name}, you’re a fake iPhone—looks fine but useless.",
  "🤯 ${name}, you’re a glitch—confusing and annoying.",

  // ===== Banglish =====
  "😹 ${name}, tor matha ekdom 2GB RAM er moto—hang hoye thake.",
  "🤦 ${name}, tui ekdom calculator—battery chara kaj kore na.",
  "🔥 ${name}, tui emon charger—plug thake, charge dey na.",
  "🥴 ${name}, tor logic gula Windows XP’r error message er moto.",
  "🤣 ${name}, tui emon SIM card—network nai, value o nai.",
  "🐟 ${name}, tui emon machh—jel theke ber hoye gaspite maris.",
  "🚲 ${name}, tui emon cycle—bell bajay noise kore, speed nai.",
  "🧢 ${name}, tui emon cap—mathe porle beshi hasir lagay.",
  "🪀 ${name}, tui emon latoo—ghurai diye chere dile ghurtei thakis.",
  "📀 ${name}, tui emon CD—scratch pora, chalale hang kore.",
  "🧊 ${name}, tui emon ice—khub taratari ghorom e goliye jai.",
  "🎤 ${name}, tor kotha holo autotune chara gaan—ekdom be-shur.",
  "🕹️ ${name}, tui emon video game—first stage e stuck hoye thakis.",
  "🤖 ${name}, tui emon robot—command dile ulta kaj koris.",
  "🍔 ${name}, tui emon burger—dekhte boro, kinte gelo sirf lettuce.",
// বাংলা + ইংরেজি 
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
      `🤣 ${displayName}, তোর নাম শুনলেই লোকজন হাসে—কারণ তুমি walking joke।`,
  // ===== Mix =====
  "😂 ${name}, tor matha holo Google search—onek result, but kono kajer nai.",
  "🤣 ${name}, you’re like Bangla bus driver—always shouting, never on time.",
  "🐓 ${name}, tui holo chicken fry—bahire crispy, vitore half-boiled.",
  "😜 ${name}, you’re like Bangla cricket team—sudhu hope, result zero.",
  "🤡 ${name}, tor look holo circus clown—free entertainment.",
  "🐢 ${name}, you’re slower than Bangla internet on rainy day.",
  "📺 ${name}, tui holo old TV—chobi dekha jay na, noise shona jay.",
  "🥱 ${name}, you’re like Bangla serial—never ending but always boring.",
  "🐍 ${name}, tui holo half-charged power bank—promise onek, kaj kom.",
  "🧨 ${name}, you’re like Bangla fireworks—ekbar jollei finish.",

  // ===== Noakhali dialect =====
  "🐟 ${name}, তোরে দেহি নোয়াখালীর খালে পড়া ইলিশ, একটুখান ফটফটায়, তারপর চুপচাপ।",
  "🤣 ${name}, তুই হইছস কুমির দোয়াতলা, আওয়াজ বড়, কাম নাই।",
  "🐸 ${name}, তোর গলা দেহি খালে ডুবন্ত ব্যাঙের ডাক।",
  "😂 ${name}, তুই হইছস খালি টেপা দই—দেখতে মজা, খাইতে দাঁত ভাঙে।",
  "🌶️ ${name}, তুই হইছস মরিচের গুঁড়া—চোখে পড়লেই সবাই কাঁদে।",
  "🍵 ${name}, তুই হইছস চায়ের দোকানের ফালতু কাপ—ভাঙলে কেও কাঁদে না।",
  "🐢 ${name}, তুই হইছস কচ্ছপের গতি—একটা কদম দিতেই বর্ষা শেষ।",
  "😹 ${name}, তোরে দেহি নোয়াখালীর কই মাছ—ডাঙায় তুললেই ফটফটায়।",
  "🤡 ${name}, তোর কাণ্ড দেহি নোয়াখালীর হাটের জোকার।",
  "🐔 ${name}, তুই হইছস হাঁসের ডিম—না মুরগিরে মানে, না হাঁসেরে মানে।",

  // ===== Proverbs =====
  "🐒 ${name}, তুই হইছস বানর গাছে উঠলেও কলা পায় না।",
  "🐍 ${name}, তুই হইছস দুধ খাওয়া সাপ।",
  "🐔 ${name}, তুই হইছস ডিম আগে না মুরগি আগে—কোনোটাই না, শুধু ঝামেলা আগে।",
  "🤣 ${name}, তুই হইছস বাঘে ছুঁইলে না, শিয়ালে ছিঁড়ে খায়।",
  "😂 ${name}, তুই হইছস নাচতে না জানলে উঠান বাঁকা।",
  "🤡 ${name}, তুই হইছস আঙুর ফল টক।",
  "🐢 ${name}, তুই হইছস ধীরস্থির কচ্ছপ—কিন্তু শেষ পর্যন্ত হারিস।",
  "🐂 ${name}, তুই হইছস ষাঁড়ের লড়াইয়ের মাঝখানে দাঁড়ানো খুঁটি।",
  "🪫 ${name}, তুই হইছস জল ছাড়া মাছ।",
  "😜 ${name}, তুই হইছস শূন্য পাত্র—শব্দ বেশি, ভেতরে কিছু নাই।",

  // ===== Sylheti (7) =====
  "🤣 ${name}, তুই হইছস লইলাগড়া হাঁস।",
  "🐸 ${name}, তোর কতা শুনলেই লইচ্চা মাছের মতন লাফাইতে মন চায়।",
  "😂 ${name}, তুই হইছস কচুরি ফুল—দেহতে সুন্দর, কামে জিরো।",
  "🥴 ${name}, তোর মাথায় এত গুল, মনে হয় লইচ্চা ঝোলের মতন ভাসা ভাসা।",
  "🐔 ${name}, তুই হইছস সিলেটি মুরগি—ডিম দেয় না, শুধু ডাকাডাকি।",
  "😹 ${name}, তুই হইছস সিলেটি টক ঝাল—খাইলে পেটের আগুন লাগে।",
  "🐒 ${name}, তোর কাজ কাম সিলেটি বাঁদরের মতন—কাপড় চুরি, লাভ নাই।",

  // ===== Cumilla (2) =====
  "🤡 ${name}, তুই হইছস কুমিল্লার নাটাই—ঘুরাইলে চলে, ছাইরা দিলেই মাটিতে।",
  "🐟 ${name}, তুই হইছস কুমিল্লার রুই মাছ—আওয়াজ বড়, কাঁটা বেশি।",

  // ===== Old Dhaka (4) =====
  "🐔 ${name}, তোকে দেহি মুরগির চাল—চিটচিটা, কাজের না।",
  "🤣 ${name}, তুই হইছস শিঙাড়া—বাইরে মচমচে, ভিতরে আলু ছাড়া কিছু নাই।",
  "🥴 ${name}, তোরে দেহি পুরান ঢাকার হকার—চিৎকারে দোকান চলে না।",
  "😂 ${name}, তুই হইছস বুড়িগঙ্গার নৌকা—আধভাঙা, তবুও ভাড়া চাইস।",

  // ===== Barishal (10) =====
  "🐂 ${name}, তুই হইছস বরিশালের ষাঁড়।",
  "🤡 ${name}, তোর ভয়েস বরিশালের লঞ্চের হর্ন।",
  "😂 ${name}, তুই হইছস ঝালমুড়ির কাগজ।",
  "🥴 ${name}, তুই নদীর মাঝের বাঁশ।",
  "🐢 ${name}, তুই হইছস বরিশালের ফেরি।",
  "🐔 ${name}, তুই মুরগির খোপ।",
  "😹 ${name}, তুই বরিশালের বাতাস।",
  "🐸 ${name}, তুই খালের ব্যাঙ।",
  "🤯 ${name}, তুই লঞ্চঘাটের সিঁড়ি।",
  "🐟 ${name}, তুই বরিশালের ইলিশ।",

  // ===== Chittagong (5) =====
  "🐔 ${name}, তুই চট্টগ্রামের মুরগি।",
  "😂 ${name}, তুই কোরবানির হাটের গরু।",
  "🐟 ${name}, তুই কক্সবাজারের শুকনা মাছ।",
  "🐒 ${name}, তুই পাহাড়ি বানর।",
  "🤣 ${name}, তুই পতেঙ্গার বাতাস।",

  // ===== Other regional (6) =====
  "🐔 ${name}, তুই রাজশাহীর কচুপাতা।",
  "🤡 ${name}, তুই দিনাজপুরের লিচু।",
  "🥴 ${name}, তুই খুলনার লবণ।",
  "🐸 ${name}, তুই রংপুরের ব্যাঙ।",
  "😂 ${name}, তুই ময়মনসিংহের ইঁদুর।",
  "🐒 ${name}, তুই টাঙ্গাইলের গামছা।",

  // ===== Tribal (5) =====
  "🥥 ${name}, তুই চাকমাদের নারকেল—ভিতরে ফাঁকা।",
  "🐒 ${name}, তোর কাণ্ড মারমাদের পাহাড়ি বানর।",
  "🍌 ${name}, তুই গারোদের কাঁচা কলা।",
  "🐔 ${name}, তুই সাঁওতালদের হাঁস।",
  "😂 ${name}, তুই মণিপুরী নাচ—শব্দ বেশি, বোঝে কেউ না।"
];

module.exports = {
  config: {
    name: "roast",
    aliases: ["ro"],
    author: "M H IMRAN",
    role: 0,
    shortDescription: "Funny roast lines",
    longDescription: "Mention বা reply দিলে random roast line দেবে",
    category: "fun",
    guide: "{p}roast @mention অথবা {p}roast (reply করে)"
  },

  onStart: async function ({ message, event, usersData }) {
    let targetID;

    if (event.messageReply) {
      targetID = event.messageReply.senderID;
    } else if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    }

    if (!targetID) {
      return message.reply("👉 কাউকে mention বা reply করতে হবে!");
    }

    const userData = await usersData.get(targetID);
    const name = userData?.name || "এই লোক";

    // Random roast select
    const line = roastLines[Math.floor(Math.random() * roastLines.length)];
    message.reply(line.replace("${name}", name));
  }
};
