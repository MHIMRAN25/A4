const fs = require("fs");
const path = require("path");

const questionsFile = path.join(__dirname, "quizQuestions.json");
const banFile = path.join(__dirname, "quizBans.json");
const scoreFile = path.join(__dirname, "quizScore.json");

module.exports = {
  config: {
    name: "qz2",
    aliases: ["quiz"],
    version: "2.0",
    author: "Imran x GPT",
    countDown: 5,
    role: 0,
    description: "Play quiz game with category system",
    category: "game",
    guide: "{pn} → start quiz game"
  },

  onStart: async function ({ message, event, usersData }) {
    const userID = event.senderID;

    if (!fs.existsSync(banFile)) fs.writeFileSync(banFile, "{}");
    const bans = JSON.parse(fs.readFileSync(banFile));

    if (bans[userID]) {
      const diff = Date.now() - bans[userID];
      const banTime = 8 * 3600 * 1000;
      if (diff < banTime) {
        const remain = banTime - diff;
        const hr = Math.floor(remain / 3600000);
        const min = Math.floor((remain % 3600000) / 60000);
        return message.reply(`আপনি এখন কুইজ খেলতে পারবেন না। দয়া করে ${hr} ঘন্টা ${min} মিনিট পর চেষ্টা করুন।`);
      }
    }

    const msg = await message.reply("একটি ক্যাটাগরি নির্বাচন করুন:\n1) ইসলামিক\n2) ইতিহাস\n\nরিপ্লাই করুন 1 অথবা 2");

    global.GoatBot.onReply.set(msg.messageID, {
      type: "chooseCategory",
      commandName: this.config.name,
      author: userID
    });
  },

  onReply: async function ({ event, message, Reply, usersData }) {
    const userID = event.senderID;
    if (userID !== Reply.author) return;

    const type = Reply.type;

    // Category selection
    if (type === "chooseCategory") {
      const choice = event.body.trim();
      let category = null;
      if (choice === "1") category = "islamic";
      else if (choice === "2") category = "history";
      else return message.reply("দয়া করে শুধু 1 বা 2 লিখুন।");

      if (!fs.existsSync(questionsFile)) return message.reply("প্রশ্ন ফাইল পাওয়া যায়নি!");
      const allQ = JSON.parse(fs.readFileSync(questionsFile));
      const selected = allQ.filter(q => q.category === category);
      if (!selected.length) return message.reply("এই ক্যাটাগরিতে কোনো প্রশ্ন নেই।");

      const quiz = selected.sort(() => 0.5 - Math.random()).slice(0, 20);

      const session = { index: 0, score: 0, wrong: 0, category, quiz, userID };

      askQuestion(session, message);
    }

    // Answer question
    if (type === "answerQuestion") {
      const session = Reply.session;
      const ans = event.body.trim().toLowerCase();
      const q = session.quiz[session.index];

      if (!["a", "b", "c", "d"].includes(ans))
        return message.reply("দয়া করে শুধু a, b, c বা d লিখুন।");

      if (ans === q.answer.toLowerCase()) session.score++;
      else session.wrong++;

      session.index++;

      if (session.index >= session.quiz.length) finishQuiz(session, message, usersData);
      else askQuestion(session, message);
    }
  }
};

// Ask Question
async function askQuestion(session, message) {
  const q = session.quiz[session.index];
  const opts = q.options;

  const msg = await message.reply(
    `প্রশ্ন ${session.index + 1}/${session.quiz.length}
${q.question}

A) ${opts[0].slice(3)}
B) ${opts[1].slice(3)}
C) ${opts[2].slice(3)}
D) ${opts[3].slice(3)}

উত্তর দিন (a/b/c/d)`
  );

  global.GoatBot.onReply.set(msg.messageID, {
    type: "answerQuestion",
    commandName: "qz2",
    author: session.userID,
    session
  });
}

// Finish Quiz
async function finishQuiz(session, message, usersData) {
  const userID = session.userID;
  const correct = session.score;
  const wrong = session.wrong;
  const total = session.quiz.length;
  const moneyChange = correct * 200 - wrong * 100;

  const userData = await usersData.get(userID);
  userData.money += moneyChange;
  await usersData.set(userID, userData);

  // Save score
  let scores = {};
  if (fs.existsSync(scoreFile)) scores = JSON.parse(fs.readFileSync(scoreFile));
  scores[userID] = (scores[userID] || 0) + correct;
  fs.writeFileSync(scoreFile, JSON.stringify(scores, null, 2));

  // Set ban
  let bans = {};
  if (fs.existsSync(banFile)) bans = JSON.parse(fs.readFileSync(banFile));
  bans[userID] = Date.now();
  fs.writeFileSync(banFile, JSON.stringify(bans, null, 2));

  message.reply(
    `কুইজ শেষ!
সঠিক: ${correct}
ভুল: ${wrong}
আপনি পেয়েছেন: ${moneyChange} টাকা

আপনার ব্যান থাকবে ৮ ঘণ্টা।`
  );
}
