// utils/cursive.js
module.exports = {
  normal: text => convert(text, cursive1),
  fancy: text => convert(text, cursive2),
  double: text => convert(text, cursive3),
  script: text => convert(text, cursive4),
  italic: text => convert(text, cursive5),
  boldItalic: text => convert(text, cursive6),
  outline: text => convert(text, cursive7),
  shadow: text => convert(text, cursive8),
  fairy: text => convert(text, cursive9),
  swirly: text => convert(text, cursive10),
  gothic: text => convert(text, cursive11),
  handwriting: text => convert(text, cursive12),
  underline: text => convert(text, cursive13),
  wave: text => convert(text, cursive14),
  mix: text => convert(text, cursive15)
};

// Helper function
function convert(text, map) {
  return text.split("").map(ch => map[ch] || ch).join("");
}

// Different cursive font maps
const base = "abcdefghijklmnopqrstuvwxyz";
const cursive1 = makeMap(base, "𝒶𝒷𝒸𝒹ℯ𝒻ℊ𝒽𝒾𝒿𝓀𝓁𝓂𝓃ℴ𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏");
const cursive2 = makeMap(base, "𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃");
const cursive3 = makeMap(base, "𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫");
const cursive4 = makeMap(base, "𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛");
const cursive5 = makeMap(base, "𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻");
const cursive6 = makeMap(base, "𝙖𝙗𝙘𝙙𝙚𝙛𝙜𝙝𝙞𝙟𝙠𝙡𝙢𝙣𝙤𝙥𝙦𝙧𝙨𝙩𝙪𝙫𝙬𝙭𝙮𝙯");
const cursive7 = makeMap(base, "𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫");
const cursive8 = makeMap(base, "𝖆𝖇𝖈𝖉𝖊𝖋𝖌𝖍𝖎𝖏𝖐𝖑𝖒𝖓𝖔𝖕𝖖𝖗𝖘𝖙𝖚𝖛𝖜𝖝𝖞𝖟");
const cursive9 = makeMap(base, "𝒶𝒷𝒸𝒹ℯ𝒻𝓰𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏");
const cursive10 = makeMap(base, "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ");
const cursive11 = makeMap(base, "𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷");
const cursive12 = makeMap(base, "𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇");
const cursive13 = makeMap(base, "a̲ b̲ c̲ d̲ e̲ f̲ g̲ h̲ i̲ j̲ k̲ l̲ m̲ n̲ o̲ p̲ q̲ r̲ s̲ t̲ u̲ v̲ w̲ x̲ y̲ z̲".split(" "));
const cursive14 = makeMap(base, "a~ b~ c~ d~ e~ f~ g~ h~ i~ j~ k~ l~ m~ n~ o~ p~ q~ r~ s~ t~ u~ v~ w~ x~ y~ z~".split(" "));
const cursive15 = makeMap(base, "卂乃匚ᗪ乇千ᘜ卄丨ﾌҜㄥ爪几ㄖ卩Ɋ尺丂ㄒㄩᐯ山乂ㄚ乙".split(""));

function makeMap(base, fancy) {
  const map = {};
  base.split("").forEach((ch, i) => map[ch] = fancy[i] || ch);
  base.toUpperCase().split("").forEach((ch, i) => map[ch] = fancy[i]?.toUpperCase?.() || ch);
  return map;
}
