// utils/textConvert.js
const customFonts = require("./customFonts");
const mapping = require("./mapping");
const symbol = require("./symbol");
const cursive = require("./cursive");

module.exports = {
  toCursive: text => cursive.fancy(text),
  toBold: text => customFonts.bold(text),
  toGothic: text => customFonts.gothic(text),
  toLeet: text => mapping.leet(text),
  toEmoji: text => mapping.emoji(text),
  toArrow: text => mapping.arrow(text),
  toSymbolStar: text => symbol.star(text),
  toSymbolHeart: text => symbol.heart(text),
  toBubble: text => customFonts.bubble(text),
  toDouble: text => customFonts.doubleStruck(text),
  toFancy: text => cursive.double(text),
  toUpsideDown: text => mapping.upsideDown(text),
  toBinary: text => mapping.binary(text),
  toMorse: text => mapping.morse(text),
  toSparkle: text => symbol.sparkle(text)
};
