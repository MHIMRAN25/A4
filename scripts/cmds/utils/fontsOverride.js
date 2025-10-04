const fs = require("fs-extra");
const path = require("path");

// সব font utils import করা
const customFonts = require("./customFonts.js");
const mapping = require("./mapping.js");
const symbol = require("./symbol.js");
const textConvert = require("./textConvert.js");
const cursive = require("./cursive.js");

// group font database path
const dbPath = path.join(__dirname, "../../database/fonts.json");

// fonts.json auto create যদি না থাকে
if (!fs.existsSync(dbPath)) fs.writeJsonSync(dbPath, {});

// JSON ডাটাবেস read/write হেল্পার
function getFontData() {
  try {
    return fs.readJsonSync(dbPath);
  } catch {
    return {};
  }
}

function saveFontData(data) {
  fs.writeJsonSync(dbPath, data, { spaces: 2 });
}

// ==== FONT APPLY FUNCTION ====
function applyFont(text, fontName) {
  if (!fontName || fontName === "normal") return text;

  // check কোন utils এ আছে
  const allFonts = {
    ...customFonts,
    ...mapping,
    ...symbol,
    ...textConvert,
    ...cursive
  };

  const selected = allFonts[fontName.toLowerCase()];
  return selected ? selected(text) : text;
}

// ==== FONT WRAPPER ====
function wrapMessageWithFont(message, threadID) {
  const fontsData = getFontData();
  const groupFont = fontsData[threadID] || "normal";

  const originalReply = message.reply;

  message.reply = async function (text, ...rest) {
    try {
      if (typeof text === "string") {
        text = applyFont(text, groupFont);
      } else if (Array.isArray(text) && typeof text[0] === "string") {
        text[0] = applyFont(text[0], groupFont);
      }
    } catch (e) {
      console.error("❌ Font override error:", e);
    }
    return originalReply.call(this, text, ...rest);
  };

  return message;
}

// ==== FONT SET/RESET ====
function setFont(threadID, fontName) {
  const fontsData = getFontData();
  fontsData[threadID] = fontName;
  saveFontData(fontsData);
  return fontName;
}

function resetFont(threadID) {
  const fontsData = getFontData();
  delete fontsData[threadID];
  saveFontData(fontsData);
}

// ==== EXPORT ====
module.exports = {
  wrapMessageWithFont,
  applyFont,
  setFont,
  resetFont,
  getFontData
};
