#!/bin/bash
echo "⚙️ Roast Bot Full Setup শুরু হচ্ছে..."

# 1. Node.js চেক
if ! command -v node &> /dev/null
then
    echo "❌ Node.js পাওয়া যায়নি! আগে Node.js ইনস্টল করো।"
    exit
fi

# 2. Modules/commands ফোল্ডার তৈরি
mkdir -p modules/commands

# 3. roast.js তৈরি
cat <<'EOT' > modules/commands/roast.js
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "roast",
  version: "3.0.0",
  role: 2,
  author: "M H IMRAN",
  description: "Tag roast (non-sexual) + moderation",
  category: "media",
  usages: "roast @mention",
  countDowns: 5,
  dependencies: {}
};

const expectedB64 = "TSAhIEhJTVJBTg=="; // "M H IMRAN"
const expectedAuthor = Buffer.from(expectedB64, "base64").toString("utf8");
const ROAST_FILE = path.join(__dirname, "roasts.json");

const SEXUAL_OBSCENE_KEYWORDS = [
  "চোদা","চুদা","চুদতে","ভুদা","লাওড়া","গু",
  "fuck","fucked","fucking","cunt","cock","pussy","sex","rape"
];
const KEYWORD_RE = new RegExp(
  SEXUAL_OBSCENE_KEYWORDS.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
  "i"
);

module.exports.onStart = async function ({ api, event }) {
  if (module.exports.config.author !== expectedAuthor) {
    return api.sendMessage("❌ Permission denied — author mismatch.", event.threadID);
  }

  var mention = Object.keys(event.mentions)[0];
  if (!mention) return api.sendMessage("⚠️ কাকে রোস্ট করবো? 1 জনকে @mention করো!", event.threadID);

  let name = event.mentions[mention];
  var arraytag = [{ id: mention, tag: name }];
  var a = msg => api.sendMessage(msg, event.threadID);

  let roastLines;
  try {
    roastLines = JSON.parse(fs.readFileSync(ROAST_FILE, "utf8"));
  } catch (e) {
    roastLines = ["⚠️ Roast list not found!"];
  }

  let selectedRoasts = roastLines.sort(() => 0.5 - Math.random()).slice(0, 7);

  let delay = 0;
  selectedRoasts.forEach(line => {
    setTimeout(() => a({ body: `${line} ${name}`, mentions: arraytag }), delay);
    delay += 4000;
  });
};

module.exports.onMessage = async function ({ api, event }) {
  try {
    const text = (event.body || "").toString();
    if (!text) return;

    const match = text.match(KEYWORD_RE);
    if (match) {
      const offenderId = event.senderID;
      let offenderName = "Unknown";

      try {
        const info = await api.getUserInfo(offenderId);
        offenderName = info[offenderId].name;
      } catch (e) {}

      const adminUID = "100089926788317"; 
      const msgLink = \`https://www.facebook.com/messages/t/\${event.threadID}/\${event.messageID}\`;

      api.sendMessage(
        "⚠️ এই মেসেজে অশ্লীল শব্দ শনাক্ত করা হয়েছে!",
        event.threadID,
        null,
        event.messageID
      );

      const notif = \`🚨 অশ্লীল/সেক্সুয়াল গালি শনাক্ত!\\n\\n👤 User: \${offenderName} (\${offenderId})\\n💬 Message: \${text}\\n🔑 Keyword: \${match[0]}\\n🧵 Thread: \${event.threadID}\\n📌 MessageID: \${event.messageID}\\n🔗 Link: \${msgLink}\`;

      api.sendMessage(notif, adminUID);
    }
  } catch (err) {
    console.error("❌ Moderation error:", err);
  }
};
EOT

# 4. addroast.js তৈরি
cat <<'EOT' > modules/commands/addroast.js
const fs = require("fs");
const path = require("path");
const ROAST_FILE = path.join(__dirname, "roasts.json");

module.exports.config = {
  name: "addroast",
  version: "1.0.0",
  role: 2,
  author: "M H IMRAN",
  description: "Add new roast line",
  category: "media",
  usages: "addroast <line>",
  countDowns: 5,
  dependencies: {}
};

module.exports.onStart = async function ({ api, event, args }) {
  if (!args[0]) return api.sendMessage("⚠️ নতুন roast লিখো!", event.threadID);

  let roastLines = [];
  try {
    roastLines = JSON.parse(fs.readFileSync(ROAST_FILE, "utf8"));
  } catch (e) {}

  const newLine = args.join(" ");
  roastLines.push(newLine);
  fs.writeFileSync(ROAST_FILE, JSON.stringify(roastLines, null, 2), "utf8");

  api.sendMessage("✅ নতুন roast অ্যাড হয়েছে!", event.threadID);
};
EOT

# 5. listroast.js তৈরি
cat <<'EOT' > modules/commands/listroast.js
const fs = require("fs");
const path = require("path");
const ROAST_FILE = path.join(__dirname, "roasts.json");

module.exports.config = {
  name: "listroast",
  version: "1.0.0",
  role: 0,
  author: "M H IMRAN",
  description: "List all roast lines",
  category: "media",
  usages: "listroast",
  countDowns: 5,
  dependencies: {}
};

module.exports.onStart = async function ({ api, event }) {
  let roastLines = [];
  try {
    roastLines = JSON.parse(fs.readFileSync(ROAST_FILE, "utf8"));
  } catch (e) {
    return api.sendMessage("⚠️ কোনো roast পাওয়া যায়নি!", event.threadID);
  }

  let msg = "🔥 Roast List 🔥\\n\\n";
  roastLines.forEach((line, i) => {
    msg += \`\${i+1}. \${line}\\n\`;
  });

  api.sendMessage(msg, event.threadID);
};
EOT

# 6. delroast.js তৈরি
cat <<'EOT' > modules/commands/delroast.js
const fs = require("fs");
const path = require("path");
const ROAST_FILE = path.join(__dirname, "roasts.json");

module.exports.config = {
  name: "delroast",
  version: "1.0.0",
  role: 2,
  author: "M H IMRAN",
  description: "Delete roast by index",
  category: "media",
  usages: "delroast <index>",
  countDowns: 5,
  dependencies: {}
};

module.exports.onStart = async function ({ api, event, args }) {
  if (!args[0]) return api.sendMessage("⚠️ কোন index ডিলিট করবো?", event.threadID);

  let roastLines = [];
  try {
    roastLines = JSON.parse(fs.readFileSync(ROAST_FILE, "utf8"));
  } catch (e) {
    return api.sendMessage("❌ Roast লিস্ট পাওয়া যায়নি!", event.threadID);
  }

  const index = parseInt(args[0]) - 1;
  if (isNaN(index) || index < 0 || index >= roastLines.length) {
    return api.sendMessage("❌ Invalid index!", event.threadID);
  }

  const removed = roastLines.splice(index, 1);
  fs.writeFileSync(ROAST_FILE, JSON.stringify(roastLines, null, 2), "utf8");

  api.sendMessage(\`✅ ডিলিট হয়েছে: \${removed[0]}\`, event.threadID);
};
EOT

# 7. roasts.json তৈরি (যদি না থাকে)
if [ ! -f modules/commands/roasts.json ]; then
    echo "📦 roasts.json তৈরি হচ্ছে..."
    cat <<EOT > modules/commands/roasts.json
[
  "😂 তুই এত ফালতু কেন?",
  "🤡 তোর মগজের স্পিড 2G নেটের থেকেও স্লো!",
  "📦 তোর ব্রেইন খালি কার্টনের মতো!",
  "🐸 তুই ব্যাঙের মতো লাফাস কিন্তু ব্রেইন নাই!",
  "🚮 তুই গ্রুপের ডাস্টবিন!",
  "🪑 তোর উপর ভরসা মানে ভাঙা চেয়ারে বসা!",
  "📺 তুই টিভির রিমোট ছাড়া সেটের মতো – একেবারে অকাজের!"
]
EOT
    echo "✅ roasts.json তৈরি হলো।"
fi

# 8. Dependencies install
echo "📦 Dependencies ইনস্টল হচ্ছে..."
npm install

echo "✅ সব ফাইল তৈরি + Setup Complete!"
echo "👉 এখন বট চালাও: npm start"
EOT
