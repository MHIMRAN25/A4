const moment = require("moment-timezone");
const fs = require("fs");
const adhanStatusFile = __dirname + "/adhanStatus.json";

module.exports.config = {
  name: "autoazan",
  version: "3.0.0",
  author: "Imran x GPT-5",
  role: 0,
  description: "Auto Azan broadcaster with Dua, Friday Juma, admin control",
  category: "auto",
  cooldown: 5,
};

// Prayer schedule (Dhaka time)
const prayerTimes = [
  { name: "Fajr", time: "04:45 AM", video: "https://files.catbox.moe/mic9dr.mp4" },
  { name: "jhuhr", time: "01:00 PM", video: "https://files.catbox.moe/d6on4c.mp4" },
  { name: "Asr", time: "04:15 PM", video: "https://files.catbox.moe/dq3lvb.mp4" },
  { name: "Maghrib", time: "05:40 PM", video: "https://files.catbox.moe/d6on4c.mp4" },
  { name: "Isha", time: "07:30 PM", video: "https://files.catbox.moe/dq3lvb.mp4" },
];

// Juma Friday special
const jumaTime = { name: "Juma", time: "12:30 PM", video: "https://files.catbox.moe/mic9dr.mp4" };

const duaAudio = "https://files.catbox.moe/2j0vpf.mp3";
const duaText = `🕋 دُعَاءٌ بَعْدَ الأَذَان 🕋

اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلاَةِ القَائِمَةِ،
آتِ مُحَمَّدًا الوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا
الَّذِي وَعَدْتَهُ 🤲`;

// Save/load on/off status
function saveStatus(status) {
  fs.writeFileSync(adhanStatusFile, JSON.stringify({ enabled: status }, null, 2));
}
function loadStatus() {
  if (!fs.existsSync(adhanStatusFile)) saveStatus(true);
  return JSON.parse(fs.readFileSync(adhanStatusFile)).enabled;
}

// Core scheduler
module.exports.onLoad = async ({ api }) => {
  if (!fs.existsSync(adhanStatusFile)) saveStatus(true);

  const checkAdhanTime = async () => {
    if (!loadStatus()) return setTimeout(checkAdhanTime, 60000);

    const now = moment().tz("Asia/Dhaka");
    const dhakaTime = now.format("hh:mm A");
    const day = now.format("dddd");

    let matchedPrayer = prayerTimes.find(p => p.time === dhakaTime);

    // Friday special
    if (day === "Friday" && dhakaTime === jumaTime.time) matchedPrayer = jumaTime;

    if (matchedPrayer) {
      console.log(`🔔 ${matchedPrayer.name} prayer time! Sending Adhan...`);

      const allThreads = global.db.allThreadData.map(t => t.threadID);
      for (const thread of allThreads) {
        api.sendMessage(
          { body: `🕌 It's time for *${matchedPrayer.name}* prayer!`, attachment: matchedPrayer.video },
          thread
        );

        setTimeout(() => {
          api.sendMessage({ body: duaText, attachment: duaAudio }, thread);
        }, 15000);
      }
    }

    setTimeout(checkAdhanTime, 60000);
  };

  checkAdhanTime();
};

// Admin on/off control
module.exports.onStart = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const adminList = global.config.ADMINBOT || [];

  if (!adminList.includes(senderID)) {
    return api.sendMessage("sry", threadID, messageID);
  }

  const action = args[0]?.toLowerCase();
  if (!action || !["on", "off"].includes(action))
    return api.sendMessage("🕌 ব্যবহার: azan on / azan off", threadID, messageID);

  if (action === "on") {
    saveStatus(true);
    api.sendMessage("oky✅", threadID, messageID);
  } else {
    saveStatus(false);
    api.sendMessage("oky⛔", threadID, messageID);
  }
};
