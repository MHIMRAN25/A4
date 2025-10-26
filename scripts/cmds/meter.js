const DIG = require("discord-image-generation");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "meter",
    aliases: ["gaymeter", "lesbu", "lesbumeter", "lesbian"],
    version: "4.0", 
    author: "IMRAN",
    role: 0,
    shortDescription: "Funny gay or lesbu meter",
    longDescription: "Measures your gay or lesbu level using DIG overlay & funny comments. Image changes based on score.",
    category: "fun",
    guide: "{pn} <tag or reply>",
  },

  onStart: async function ({ message, args, event, usersData }) {
    try {
      
      const cmd = (args && args[0] || event.commandName || "gay").toLowerCase();
      const type = cmd.includes("lesb") ? "lesbu" : "gay";

      
      let userID = event.senderID;
      const mentionKeys = Object.keys(event.mentions);
      
      if (event.messageReply) {
          userID = event.messageReply.senderID;
      } else if (mentionKeys.length > 0) {
          userID = mentionKeys[0];
      }
      

      let avatarURL = null;
      try { 
          avatarURL = await usersData.getAvatarUrl(userID); 
      } catch (e) { 
          console.error("Avatar URL fetch failed:", e.message);
          return message.reply("❌ দুঃখিত! অ্যাভাটার ইউআরএল আনতে সমস্যা হচ্ছে।"); 
      }

      
      const percent = Math.floor(Math.random() * 101);

      let comments = [];
      if (type === "gay") {
        if (percent < 30) {
          comments = [
            "😎 Straight as a ruler—or so you claim!", 
            "🧱 কংক্রিটের মতো স্ট্রেইট। একটুও নড়বে না!", 
            "🤫 ইউজার প্রোফাইল বলছে স্ট্রেইট, কিন্তু ভেতরের খবর?", 
            "🥇 ১০০% স্ট্রেইট, এই রেঞ্জে আপনি চ্যাম্পিয়ন।"
          ];
        } else if (percent < 50) {
          comments = [
            "🌈 আপনি হয়তো ইদ্রিসের সাথে আইসক্রিম খেতে চান, ব্যস!", 
            "🤔 You're like 30% gay and 70% confused!", 
            "🚦 লাল আর হলুদ আলোর মাঝে দাঁড়িয়ে আছেন।", 
            "🤏 সামান্য বাঁক আছে, কিন্তু সাইকেল চালানো যায়।"
          ];
        } else if (percent < 80) {
          comments = [
            "✨ Not fully gay... but sparkle detected!", 
            "💖 আপনার পার্সে গ্লিটার পাওয়া গেছে, ব্যাখ্যা দিন।", 
            "🕺 প্রায় অর্ধেক পথ পেরিয়ে এসেছেন!", 
            "😇 আপনি গে নন, কিন্তু গে-দের 'বেস্ট ফ্রেন্ড'।"
          ];
        } else {
          comments = [
            "🌈 Oh no bro, you just unlocked FULL mode! 🏳️‍🌈", 
            "কি একটা অবস্থা গ্রুপে এরকম গে এড করে কে?😤", 
            "🚨 রেড অ্যালার্ট! পুরো টিম চলে এসেছে।", 
            "🏳️‍🌈 গে লেজেন্ড, আপনার হাতেই রেইনবোর চাবি।"
          ];
        }
      } else { // type === "lesbu"
        if (percent < 30) {
          comments = [                   
            "💅 Still in the friend zone, nothing to see here!", 
            "Just two girls being roommates. Totally platonic.", 
            "My meter is broken, or are you just straight?", 
            "😅 আপু, আপনি তো এখনো সেই 'আমরা শুধু বন্ধু' স্টেজে আছেন!"
          ];
        } else if (percent < 50) {
          comments = [
            "💖 A little fruity curiosity there!", 
            "😉 ওই, পাশের মেয়েটির দিকে আড়চোখে তাকানো চলছে!",
            "You accidentally made eye contact with a girl. That counts!", 
            "The rainbow is faint, but the vibe is there."
          ];
        } else if (percent < 80) {
          comments = [
            "🌸 Soft lesbo energy radiating strong!", 
            "Confirmed: You're halfway through the 'Girlfriend Application'.", 
            "🤫 কানাকানি শুনেছি, আপনারা কফি শপে ডেট করছেন!", 
            "Getting cozy under the Sapphic umbrella!"
          ];
        } else {
          comments = [
            "💘 Girl, you unlocked LESBIAN LEGEND MODE!", 
            "Welcome to the coven! You're 100% committed.", 
            "👑 আর লুকোচুরি নয়, এবার পুরো শহর আপনাদের ভালোবাসার রং দেখুক!", 
            "Warning: May spontaneously start building furniture with a partner."                      
          ];
        }
      }

      // কমেন্ট লিস্ট থেকে একটি র্যান্ডম কমেন্ট নির্বাচন
      const comment = comments[Math.floor(Math.random() * comments.length)];

      
      let finalImageBuffer;
      
      if (percent < 50) {
          
          finalImageBuffer = await new DIG.Grayscale().getImage(avatarURL);
      } else {
          
          finalImageBuffer = await new DIG.Gay().getImage(avatarURL); 
      }
      
      
      const pathSave = `${__dirname}/tmp/meter_result.png`;

      
      await fs.ensureDir(`${__dirname}/tmp`); 
      fs.writeFileSync(pathSave, Buffer.from(finalImageBuffer)); 

      
      const resultBody = `${type === "lesbu" ? "💋 Lesbu Meter Result!" : "🌈 Gay Meter Result!"}\n\n**Meter Score: ${percent}%**\nComment: ${comment}`;

      
      await message.reply({
        body: resultBody,
        attachment: fs.createReadStream(pathSave)
      }, () => fs.unlinkSync(pathSave)); 
    } catch (e) {
      console.error("METER COMMAND ERROR:", e);
      await message.reply("❌ Something went wrong while processing the meter! Check console for details.");
    }
  }
};
