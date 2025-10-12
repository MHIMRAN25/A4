const moment = require("moment-timezone");
const fs = require("fs");
const axios = require("axios");
const adhanStatusFile = __dirname + "/adhanStatus.json";

module.exports.config = {
  name: "autoazan",
  version: "4.0.0",
  author: "Imran x GPT-5",
  role: 0,
  description: "Auto Azan broadcaster (Dhaka time + Friday Juma)",
  category: "auto",
  cooldown: 5,
};

// 🎵 ভিডিও ও দোয়া
const duaAudio = "https://files.catbox.moe/2j0vpf.mp3";
const duaText = `🕋 دُعَاءٌ بَعْدَ الأَذَان 🕋

اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلاَةِ القَائِمَةِ،
آتِ مُحَمَّدًا الوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا
الَّذِي وَعَدْتَهُ 🤲`;

// 🎥 আজান ভিডিও (তোমার ইচ্ছা হলে পাল্টাতে পারো)
const videos = {
  Fajr: "https://files.catbox.moe/mic9dr.mp4",
  Dhuhr: "https://files.catbox.moe/d6on4c.mp4",
  Asr: "https://files.catbox.moe/dq3lvb.mp4",
  Maghrib: "https://files.catbox.moe/d6on4c.mp4",
  Isha: "https://files.catbox.moe/dq3lvb.mp4",
  Juma: "https://files.catbox.moe/mic9dr.mp4",
};

// 📁 ON/OFF ফাইল সংরক্ষণ
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

// 🌅 প্রতিদিন API থেকে নামাজের সময় আনা
let todayPrayerTimes = {};

async function fetchPrayerTimes() {
  try {
    const res = await axios.get(
      "https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=2"
    );
    const t = res.data.data.timings;
    todayPrayerTimes = {
      Fajr: moment(t.Fajr, "HH:mm").format("hh:mm A"),
      Dhuhr: moment(t.Dhuhr, "HH:mm").format("hh:mm A"),
      Asr: moment(t.Asr, "HH:mm").format("hh:mm A"),
      Maghrib: moment(t.Maghrib, "HH:mm").format("hh:mm A"),
      Isha: moment(t.Isha, "HH:mm").format("hh:mm A"),
    };
    console.log("✅ আজানের সময় আপডেট হয়েছে:", todayPrayerTimes);
  } catch (err) {
    console.error("❌ আজানের সময় আনতে সমস্যা:", err);
  }
}

// 🌙 মূল চেকার ফাংশন
module.exports.onLoad = async ({ api }) => {
  if (!fs.existsSync(adhanStatusFile)) saveStatus(true);

  await fetchPrayerTimes(); // বট চালুর সময় একবার সময় নিয়ে নেবে

  // প্রতি ১২ ঘন্টায় সময় নতুন করে আনবে
  setInterval(fetchPrayerTimes, 12 * 60 * 60 * 1000);

  const checkAdhanTime = async () => {
    if (!loadStatus()) return setTimeout(checkAdhanTime, 60000);

    const now = moment().tz("Asia/Dhaka");
    const currentTime = now.format("hh:mm A");
    const day = now.format("dddd");

    let matchedPrayer = Object.keys(todayPrayerTimes).find(name => {
      const prayerTime = moment(todayPrayerTimes[name], "hh:mm A");
      return Math.abs(now.diff(prayerTime, "minutes")) <= 1;
    });

    // শুক্রবারে ১২:৩০ PM এ জুমা আজান
    if (day === "Friday" && currentTime === "12:30 PM") matchedPrayer = "Juma";

    if (matchedPrayer) {
      console.log(`🔔 এখন ${matchedPrayer} নামাজের সময়!`);
      fs.appendFileSync("azanLogs.txt", `${moment().format()} - Sent ${matchedPrayer}\n`);

      const allThreads = global.db.allThreadData.map(t => t.threadID);
      for (const [i, thread] of allThreads.entries()) {
        setTimeout(async () => {
          try {
            const video = await getAttachment(videos[matchedPrayer]);
            api.sendMessage(
              { body: `🕌 এখন ${matchedPrayer} নামাজের সময়!`, attachment: video },
              thread
            );

            // ১৫ সেকেন্ড পরে দোয়া পাঠানো হবে
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

    setTimeout(checkAdhanTime, 60000);
  };

  checkAdhanTime();
};

// 🧑‍💼 অ্যাডমিন অন/অফ কন্ট্রোল
module.exports.onStart = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const adminList = global.config.ADMINBOT || [];

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
