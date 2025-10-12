const moment = require("moment-timezone");
const fs = require("fs");
const axios = require("axios");
const adhanStatusFile = __dirname + "/adhanStatus.json";

module.exports.config = {
  name: "azan",
  version: "9.0.0",
  author: "Imran x GPT-5",
  role: 0,
  description: "Auto Azan (Fixed time) + Live API timings + .azan command + daily schedule",
  category: "auto",
  cooldown: 5,
};

// 🎵 ভিডিও ও দোয়া
const duaAudio = "https://files.catbox.moe/2j0vpf.mp3";
const duaText = `🕋 দোয়া (আরবী) 🕋

اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلاَةِ القَائِمَةِ،
آتِ مُحَمَّدًا الوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا
الَّذِي وَعَدْتَهُ 🤲

বাংলা অর্থ:
হে আল্লাহ! এই পূর্ণ আহ্বান এবং নিয়মিত নামাজের জন্য আমাকে কবুল কর, মুহাম্মদ (সা:) কে মর্যাদা দাও এবং তাকে সেই সম্মানিত অবস্থায় পৌঁছে দাও যা তুমি তাকে অঙ্গীকার করেছ। 🤲`;

// জুমা স্পেশাল
const jumaTime = { name: "Juma", time: "12:30 PM", video: "https://files.catbox.moe/mic9dr.mp4" };

// 📁 ON/OFF স্ট্যাটাস
function saveStatus(status) {
  fs.writeFileSync(adhanStatusFile, JSON.stringify({ enabled: status }, null, 2));
}
function loadStatus() {
  if (!fs.existsSync(adhanStatusFile)) saveStatus(true);
  return JSON.parse(fs.readFileSync(adhanStatusFile)).enabled;
}

// 🔽 ভিডিও বা অডিও ডাউনলোড stream আকারে
async function getAttachment(url) {
  const res = await axios.get(url, { responseType: "stream" });
  return res.data;
}

// 🔔 আজান ফ্ল্যাগ (প্রতিটি নামাজ একবারের জন্য)
let sentFlags = {};

// নতুন দিন হলে ফ্ল্যাগ রিসেট
function resetFlags() {
  sentFlags = {};
}

// 🌙 নামাজের সময় API থেকে আনা (Live timings)
async function fetchPrayerTimes() {
  try {
    const res = await axios.get(
      "https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=2"
    );
    const t = res.data.data.timings;
    const times = {};
    Object.keys(t).forEach(k => {
      times[k] = moment.tz(t[k], "HH:mm", "Asia/Dhaka").format("hh:mm A");
    });
    return times;
  } catch (err) {
    console.error("API থেকে নামাজের সময় আনতে সমস্যা:", err);
    return null;
  }
}

// 🌙 Fixed Today timings (মসজিদের সময় অনুযায়ী আজান)
const fixedPrayerTimes = [
  { name: "Fajr", time: "04:45 AM", video: "https://files.catbox.moe/mic9dr.mp4" },
  { name: "Dhuhr", time: "01:00 PM", video: "https://files.catbox.moe/d6on4c.mp4" },
  { name: "Asr", time: "04:15 PM", video: "https://files.catbox.moe/dq3lvb.mp4" },
  { name: "Maghrib", time: "05:40 PM", video: "https://files.catbox.moe/d6on4c.mp4" },
  { name: "Isha", time: "07:30 PM", video: "https://files.catbox.moe/dq3lvb.mp4" },
];

// 🌙 মূল চেকার ফাংশন
module.exports.onLoad = async ({ api }) => {
  if (!fs.existsSync(adhanStatusFile)) saveStatus(true);

  // প্রতিদিন 00:01 AM-এ ফ্ল্যাগ রিসেট
  setInterval(() => {
    const now = moment().tz("Asia/Dhaka");
    if (now.format("HH:mm") === "00:01") {
      resetFlags();
      sendDailySchedule(api);
    }
  }, 60000);

  const checkAdhanTime = async () => {
    if (!loadStatus()) return setTimeout(checkAdhanTime, 60000);

    const now = moment().tz("Asia/Dhaka");
    const currentTime = now.format("hh:mm A");
    const day = now.format("dddd");

    // Fixed timings অনুযায়ী আজান পাঠানো
    for (const p of fixedPrayerTimes) {
      if (currentTime === p.time && !sentFlags[p.name]) {
        sentFlags[p.name] = true;
        console.log(`🔔 এখন ${p.name} নামাজের সময়!`);

        const allThreads = global.db.allThreadData.map(t => t.threadID);
        for (const [i, thread] of allThreads.entries()) {
          setTimeout(async () => {
            try {
              const video = await getAttachment(p.video);
              api.sendMessage({ body: `🕌 এখন ${p.name} নামাজের সময়!`, attachment: video }, thread);

              // ১৫ সেকেন্ড পরে দোয়া
              setTimeout(async () => {
                const dua = await getAttachment(duaAudio);
                api.sendMessage({ body: duaText, attachment: dua }, thread);
              }, 15000);

            } catch (e) {
              console.error("আজান পাঠানোর সময় সমস্যা:", e);
            }
          }, i * 2000);
        }
      }
    }

    // শুক্রবার ১২:৩০ PM জুমা আজান
    if (day === "Friday" && currentTime === jumaTime.time && !sentFlags.Juma) {
      sentFlags.Juma = true;
      const allThreads = global.db.allThreadData.map(t => t.threadID);
      for (const [i, thread] of allThreads.entries()) {
        setTimeout(async () => {
          try {
            const video = await getAttachment(jumaTime.video);
            api.sendMessage({ body: `🕌 এখন জুমা নামাজের সময়!`, attachment: video }, thread);
            setTimeout(async () => {
              const dua = await getAttachment(duaAudio);
              api.sendMessage({ body: duaText, attachment: dua }, thread);
            }, 15000);
          } catch (e) {
            console.error("জুমা পাঠানোর সময় সমস্যা:", e);
          }
        }, i * 2000);
      }
    }

    setTimeout(checkAdhanTime, 60000);
  };

  checkAdhanTime();
};

// 🧑‍💼 অ্যাডমিন অন/অফ কন্ট্রোল
module.exports.onStart = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const adminList = config.ADMINBOT || [];

  if (!adminList.includes(senderID)) {
    return api.sendMessage("দুঃখিত ভাই, আপনি অ্যাডমিন না 😅", threadID, messageID);
  }

  const action = args[0]?.toLowerCase();
  if (!action || !["on", "off"].includes(action))
    return api.sendMessage("🕌 ব্যবহার: azan on / azan off", threadID, messageID);

  if (action === "on") {
    saveStatus(true);
    api.sendMessage("✅ অটো আজান চালু হয়েছে!", threadID, messageID);
  } else {
    saveStatus(false);
    api.sendMessage("⛔ অটো আজান বন্ধ করা হয়েছে!", threadID, messageID);
  }
};

// 🕌 .azan কমান্ড (API থেকে live timing)
module.exports.onMessage = async ({ api, event }) => {
  const { body, threadID } = event;
  if (body?.trim().toLowerCase() === ".azan") {
    const prayerTimes = await fetchPrayerTimes();
    if (!prayerTimes) return api.sendMessage("আজকের নামাজের সময় আনতে সমস্যা হয়েছে।", threadID);

    const prayerOrder = [
      { name: "Fajr", start: prayerTimes.Fajr, end: prayerTimes.Sunrise },
      { name: "Dhuhr", start: prayerTimes.Dhuhr, end: prayerTimes.Asr },
      { name: "Asr", start: prayerTimes.Asr, end: prayerTimes.Maghrib },
      { name: "Maghrib", start: prayerTimes.Maghrib, end: prayerTimes.Isha },
      { name: "Isha", start: prayerTimes.Isha, end: prayerTimes.Midnight },
      { name: "Sunrise", start: prayerTimes.Sunrise, end: prayerTimes.Dhuhr },
      { name: "Sunset", start: prayerTimes.Sunset, end: prayerTimes.Maghrib },
      { name: "Midnight", start: prayerTimes.Midnight, end: prayerTimes.Fajr },
    ];

    let message = "আজকের নামাজের সময় (ঢাকা) [শুরু - শেষ]:\n\n";
    prayerOrder.forEach(p => {
      message += `${p.name}: ${p.start} - ${p.end}\n`;
    });

    api.sendMessage(message, threadID);
  }
};

// 🔔 নতুন দিনের জন্য স্বয়ংক্রিয় থ্রেড পোস্ট ফাংশন
async function sendDailySchedule(api) {
  const prayerTimes = await fetchPrayerTimes();
  if (!prayerTimes) return;

  const prayerOrder = [
    { name: "Fajr", start: prayerTimes.Fajr, end: prayerTimes.Sunrise },
    { name: "Dhuhr", start: prayerTimes.Dhuhr, end: prayerTimes.Asr },
    { name: "Asr", start: prayerTimes.Asr, end: prayerTimes.Maghrib },
    { name: "Maghrib", start: prayerTimes.Maghrib, end: prayerTimes.Isha },
    { name: "Isha", start: prayerTimes.Isha, end: prayerTimes.Midnight },
    { name: "Sunrise", start: prayerTimes.Sunrise, end: prayerTimes.Dhuhr },
    { name: "Sunset", start: prayerTimes.Sunset, end: prayerTimes.Maghrib },
    { name: "Midnight", start: prayerTimes.Midnight, end: prayerTimes.Fajr },
  ];

  let message = "আজকের নামাজের সময় (ঢাকা) [শুরু - শেষ]:\n\n";
  prayerOrder.forEach(p => {
    message += `${p.name}: ${p.start} - ${p.end}\n`;
  });

  const allThreads = global.db.allThreadData.map(t => t.threadID);
  for (const thread of allThreads) {
    api.sendMessage(message, thread);
  }
}
