// utils/symbol.js
module.exports = {
  star: text => wrapText(text, "★", "★"),
  heart: text => wrapText(text, "♡", "♡"),
  crown: text => wrapText(text, "♛", "♛"),
  yinYang: text => wrapText(text, "☯", "☯"),
  music: text => wrapText(text, "♫", "♫"),
  fire: text => wrapText(text, "🔥", "🔥"),
  sparkle: text => wrapText(text, "✨", "✨"),
  skull: text => wrapText(text, "💀", "💀"),
  flower: text => wrapText(text, "🌸", "🌸"),
  diamond: text => wrapText(text, "♦", "♦"),
  arrow: text => wrapText(text, "➤", "➤"),
  wave: text => wrapText(text, "〰", "〰"),
  sun: text => wrapText(text, "☀", "☀"),
  moon: text => wrapText(text, "🌙", "🌙"),
  check: text => wrapText(text, "✔", "✔"),
  cross: text => wrapText(text, "✖", "✖"),
  circle: text => wrapText(text, "⭕", "⭕"),
  box: text => wrapText(text, "▢", "▢")
};

// Helper function
function wrapText(text, left, right) {
  return left + text.split("").join(right + left) + right;
}
