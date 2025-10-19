const fs = require("fs");
const path = require("path");

const questionsFile = "scripts/cmds/quizQuestions.json"; // প্রশ্নের JSON
const banFile = "scripts/cmds/quizBans.json"; // ৮ ঘন্টার ban
const scoreFile = "scripts/cmds/quizScore.json"; // leaderboard

module.exports = {
  config: {
    name: "qz2",
    version: "1.0",
    author: "Imran",
    countDown: 5,
    role: 0,
    description: "Play quiz and earn money",
    guide: "{pn}quiz : Start the quiz"
  },

  onStart: async function ({ message, usersData, event }) {
    const userID = event.senderID;

    // Load bans
    if (!fs.existsSync(banFile)) fs.writeFileSync(banFile, JSON.stringify({}));
    const bans = JSON.parse(fs.readFileSync(banFile, "utf8"));

    // Check ban
    if (bans[userID]) {
      const diff = Date.now() - bans[userID];
      if (diff < 8 * 3600 * 1000) {
        const remaining = 8 * 3600 * 1000 - diff;
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        return message.reply(`⛔ You are banned! Try again in ${hours}h ${minutes}m`);
      } else delete bans[userID]; // remove expired ban
    }

    // Ask category
    const reply = await message.reply(`Choose category:\n1. ইসলামিক\n2. ইতিহাস\nReply 1 or 2`);
    const category = await new Promise(resolve => {
      const handler = async (event2) => {
        if (event2.senderID !== userID) return;
        const choice = event2.body.trim();
        if (choice === "1" || choice === "2") {
          resolve(choice);
          return true; // stop listening
        }
      };
      global.replyHandlers = global.replyHandlers || {};
      global.replyHandlers[reply.messageID] = handler;
    });

    // Load questions
    if (!fs.existsSync(questionsFile)) return message.reply("Quiz questions not found!");
    const allQuestions = JSON.parse(fs.readFileSync(questionsFile, "utf8"));
    const selectedQuestions = allQuestions.filter(q => q.category === (category === "1" ? "islamic" : "history"));

    // Random 20 questions
    const quizQuestions = selectedQuestions.sort(() => 0.5 - Math.random()).slice(0, 20);

    let score = 0, current = 0;
    const userData = await usersData.get(userID);

    // Function to ask next question
    const askQuestion = async () => {
      if (current >= quizQuestions.length) {
        // quiz finished
        const wrong = quizQuestions.length - score;
        userData.money += score * 200 - wrong * 100; // update balance
        await usersData.set(userID, userData);

        // set ban
        bans[userID] = Date.now();
        fs.writeFileSync(banFile, JSON.stringify(bans, null, 2));

        // update leaderboard
        let leaderboard = {};
        if (fs.existsSync(scoreFile)) leaderboard = JSON.parse(fs.readFileSync(scoreFile, "utf8"));
        leaderboard[userID] = (leaderboard[userID] || 0) + score;
        fs.writeFileSync(scoreFile, JSON.stringify(leaderboard, null, 2));

        return message.reply(`Quiz finished! ✅
Correct: ${score}
Wrong: ${wrong}
Money balance: ${userData.money}`);
      }

      const q = quizQuestions[current];
      const qMsg = await message.reply(`Q${current + 1}: ${q.question}\n${q.options.join("\n")}\nReply a/b/c/d`);

      const answer = await new Promise(resolve => {
        const handler = async (event2) => {
          if (event2.senderID !== userID) return;
          const ans = event2.body.trim().toLowerCase();
          if (["a","b","c","d"].includes(ans)) {
            resolve(ans);
            return true;
          }
        };
        global.replyHandlers = global.replyHandlers || {};
        global.replyHandlers[qMsg.messageID] = handler;
      });

      if (answer === q.answer.toLowerCase()) score++;
      current++;
      setTimeout(askQuestion, 1000); // next question after 1s
    };

    askQuestion();
  }
};
