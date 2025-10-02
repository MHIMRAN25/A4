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

// ===== Regional (Noakhali, Sylhet, Dhaka, Chittagong, Barishal, Cumilla, Feni, Chandpur, Kishoreganj, Khulna, Others) =====
// (আগের 32 আঞ্চলিক + উপজাতি + প্রবাদ সব এখানে অ্যাড করা যাবে একই স্টাইলে)
"🐟 ${name}, তোরে দেহি নোয়াখালীর খালে পড়া ইলিশ।",
"🤣 ${name}, তুই হইছস কুমির দোয়াতলা—আওয়াজ বড়, কাম নাই।",
"🤣 ${name}, তুই এমন বেকুব, গরুরে পড়াইতে গেলেও গরু তোরে হেসে উড়িয়ে দিছে।",
"🐸 ${name}, তোরে দেইখ্যা মইনা পাখিও কয় – ‘ভাই, এইডা কি মানুষ?’",
"🐂 ${name}, তুই হইছস বরিশালের ষাঁড়।",
"🤡 ${name}, তোর ভয়েস বরিশালের লঞ্চের হর্ন।",
"🐔 ${name}, তুই হইছস কুমিল্লার নাটাই—ঘুরাইলে চলে, ছাইরা দিলেই মাটিতে।",
"🐟 ${name}, তুই হইছস কুমিল্লার রুই মাছ—আওয়াজ বড়, কাঁটা বেশি।",
"🐔 ${name}, তোকে দেহি মুরগির চাল—চিটচিটা, কাজের না।",
"🤣 ${name}, তুই হইছস শিঙাড়া—বাইরে মচমচে, ভিতরে আলু ছাড়া কিছু নাই।",
"🐔 ${name}, তুই চট্টগ্রামের মুরগি।",
"😂 ${name}, তুই কোরবানির হাটের গরু।",
"🐟 ${name}, তুই কক্সবাজারের শুকনা মাছ।",
"🐒 ${name}, তুই পাহাড়ি বানর।",
"🤣 ${name}, তুই পতেঙ্গার বাতাস।",
"🥥 ${name}, তুই চাকমাদের নারকেল—ভিতরে ফাঁকা।",
"🍌 ${name}, তুই গারোদের কাঁচা কলা।",
"🐔 ${name}, তুই সাঁওতালদের হাঁস।",
"😂 ${name}, তুই মণিপুরী নাচ—শব্দ বেশি, বোঝে কেউ না।",
"🐒 ${name}, তুই হইছস বানর গাছে উঠলেও কলা পায় না।",
"🐍 ${name}, তুই হইছস দুধ খাওয়া সাপ।",
"🤣 ${name}, তুই হইছস বাঘে ছুঁইলে না, শিয়ালে ছিঁড়ে খায়।",
"😂 ${name}, তুই হইছস নাচতে না জানলে উঠান বাঁকা।",
"🤡 ${name}, তুই হইছস আঙুর ফল টক।",
"🐢 ${name}, তুই হইছস ধীরস্থির কচ্ছপ—কিন্তু শেষ পর্যন্ত হারিস।"
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
    message.reply(line.replace(/\$\{name\}/g, name));
  }
};
