// utils/customFonts.js
module.exports = {
  gothic: text => text.split("").map(ch => gothicMap[ch] || ch).join(""),
  bubble: text => text.split("").map(ch => bubbleMap[ch] || ch).join(""),
  bold: text => text.split("").map(ch => boldMap[ch] || ch).join(""),
  doublestruck: text => text.split("").map(ch => doubleMap[ch] || ch).join(""),
  smallcaps: text => text.split("").map(ch => smallCapsMap[ch] || ch).join(""),
  squares: text => text.split("").map(ch => squareMap[ch] || ch).join(""),
  underline: text => text.split("").map(ch => underlineMap[ch] || ch).join(""),
  strike: text => text.split("").map(ch => strikeMap[ch] || ch).join(""),
  script: text => text.split("").map(ch => scriptMap[ch] || ch).join(""),
  cursive: text => text.split("").map(ch => cursiveMap[ch] || ch).join(""),
  serif: text => text.split("").map(ch => serifMap[ch] || ch).join(""),
  thin: text => text.split("").map(ch => thinMap[ch] || ch).join(""),
  doubleUnderline: text => text.split("").map(ch => duMap[ch] || ch).join(""),
  fancyDots: text => text.split("").map(ch => dotMap[ch] || ch).join(""),
  inverted: text => text.split("").map(ch => invertMap[ch] || ch).join("")
};

// Example Font Maps (just demo)
const gothicMap = { a: "𝔞", b: "𝔟", c: "𝔠", d: "𝔡", e: "𝔢" };
const bubbleMap = { a: "ⓐ", b: "ⓑ", c: "ⓒ", d: "ⓓ", e: "ⓔ" };
const boldMap = { a: "𝗮", b: "𝗯", c: "𝗰", d: "𝗱", e: "𝗲" };
const doubleMap = { a: "𝕒", b: "𝕓", c: "𝕔", d: "𝕕", e: "𝕖" };
const smallCapsMap = { a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ" };
const squareMap = { a: "🄰", b: "🄱", c: "🄲", d: "🄳", e: "🄴" };
const underlineMap = { a: "a̲", b: "b̲", c: "c̲", d: "d̲", e: "e̲" };
const strikeMap = { a: "a̶", b: "b̶", c: "c̶", d: "d̶", e: "e̶" };
const scriptMap = { a: "𝒶", b: "𝒷", c: "𝒸", d: "𝒹", e: "𝑒" };
const cursiveMap = { a: "𝓪", b: "𝓫", c: "𝓬", d: "𝓭", e: "𝓮" };
const serifMap = { a: "𝐚", b: "𝐛", c: "𝐜", d: "𝐝", e: "𝐞" };
const thinMap = { a: "𝘢", b: "𝘣", c: "𝘤", d: "𝘥", e: "𝘦" };
const duMap = { a: "a̳", b: "b̳", c: "c̳", d: "d̳", e: "e̳" };
const dotMap = { a: "ạ", b: "ḅ", c: "ċ", d: "ḍ", e: "ẹ" };
const invertMap = { a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ" };
