const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "autoadhan",
    version: "1.5",
    author: "Imran x MH",
    description: "Send Azan video links for 5 daily prayers + Juma",
    category: "utility"
  },

  enabled: true, // true হলে চালু, false হলে বন্ধ

  onStart: async function({ api }) {
    const threadID = "YOUR_THREAD_ID"; // গ্রুপ/চ্যাট আইডি
    const tz = "Asia/Dhaka";

    // প্রতিটি ওয়াক্তের আজান ভিডিও লিংক
    const prayerTimes = [
      { name: "ফজর", time: "04:45", video: "https://catbox.moe/fajr.mp4" },
      { name: "যোহর", time: "13:00", video: "https://catbox.moe/zuhr.mp4" },
      { name: "আসর", time: "15:30", video: "https://catbox.moe/asr.mp4" },
      { name: "মাগরিব", time: "17:45", video: "https://catbox.moe/maghrib.mp4" },
      { name: "এশা", time: "19:45", video: "https://catbox.moe/isha.mp4" }
    ];

    // জুমা (শুক্রবার)
    const jumaTime = { name: "জুমা", time: "12:30", video: "https://catbox.moe/juma.mp4" };

    const sendAzan = async (prayer) => {
      api.sendMessage({
        body: `🕌 এখন ${prayer.name} এর সময় হয়েছে!\nভিডিও লিংক: ${prayer.video}`
      }, threadID);
    };

    // প্রতি মিনিটে চেক করে ভিডিও পাঠানো
    setInterval(() => {
      if (!module.exports.enabled) return; // বন্ধ থাকলে কিছু পাঠাবে না

      const now = moment().tz(tz).format("HH:mm");
      const today = moment().tz(tz).format("dddd");

      // শুক্রবার হলে জুমা পাঠাও
      if (today === "Friday" && now === jumaTime.time) sendAzan(jumaTime);

      // অন্যান্য ওয়াক্ত
      prayerTimes.forEach(prayer => {
        if (now === prayer.time) sendAzan(prayer);
      });

    }, 60000);

    console.log("oky");
  },

  // চালু/বন্ধ করার ফাংশন
  toggle: function(enable) {
    module.exports.enabled = enable;
    console.log(`🕌 Auto-Adhan এখন ${enable ? "চালু" : "বন্ধ"} আছে`);
  }
};
