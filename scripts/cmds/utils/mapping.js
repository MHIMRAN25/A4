// utils/mapping.js
module.exports = {
  leet: text => mapText(text, leetMap),
  emoji: text => mapText(text, emojiMap),
  arrow: text => mapText(text, arrowMap),
  upsideDown: text => mapText(text, upsideDownMap),
  greek: text => mapText(text, greekMap),
  box: text => mapText(text, boxMap),
  circle: text => mapText(text, circleMap),
  math: text => mapText(text, mathMap),
  hearts: text => mapText(text, heartsMap),
  stars: text => mapText(text, starsMap),
  waves: text => mapText(text, wavesMap),
  dots: text => mapText(text, dotsMap),
  slashes: text => mapText(text, slashMap),
  binary: text => text.split("").map(ch => ch.charCodeAt(0).toString(2)).join(" "),
  morse: text => text.toLowerCase().split("").map(ch => morseMap[ch] || ch).join(" ")
};

// Helper function
function mapText(text, map) {
  return text.split("").map(ch => map[ch] || ch).join("");
}

// 🔡 Mapping Tables

const leetMap = { a: "@", e: "3", i: "1", o: "0", s: "$", t: "7" };
const emojiMap = { a: "😀", b: "😎", c: "🐱", d: "🐶", e: "🍎", f: "🔥", g: "⭐" };
const arrowMap = { a: "➡", b: "⬇", c: "⬆", d: "⬅", e: "↔" };
const upsideDownMap = { a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ" };
const greekMap = { a: "α", b: "β", c: "ς", d: "δ", e: "ε", f: "ϝ", g: "γ" };
const boxMap = { a: "🅰", b: "🅱", c: "🅲", d: "🅳", e: "🅴" };
const circleMap = { a: "ⓐ", b: "ⓑ", c: "ⓒ", d: "ⓓ", e: "ⓔ" };
const mathMap = { a: "∀", b: "𝔹", c: "ℂ", d: "𝔻", e: "∃" };
const heartsMap = { a: "♥a", b: "♥b", c: "♥c", d: "♥d", e: "♥e" };
const starsMap = { a: "★a", b: "★b", c: "★c", d: "★d", e: "★e" };
const wavesMap = { a: "〰a〰", b: "〰b〰", c: "〰c〰", d: "〰d〰", e: "〰e〰" };
const dotsMap = { a: "a·", b: "b·", c: "c·", d: "d·", e: "e·" };
const slashMap = { a: "/a/", b: "/b/", c: "/c/", d: "/d/", e: "/e/" };
const morseMap = {
  a: ".-", b: "-...", c: "-.-.", d: "-..", e: ".", f: "..-.", g: "--.",
  h: "....", i: "..", j: ".---", k: "-.-", l: ".-..", m: "--", n: "-.",
  o: "---", p: ".--.", q: "--.-", r: ".-.", s: "...", t: "-", u: "..-",
  v: "...-", w: ".--", x: "-..-", y: "-.--", z: "--..",
  "1": ".----", "2": "..---", "3": "...--", "4": "....-", "5": ".....",
  "6": "-....", "7": "--...", "8": "---..", "9": "----.", "0": "-----"
};
