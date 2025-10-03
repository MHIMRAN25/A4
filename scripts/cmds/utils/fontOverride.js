const { applyFont } = require("./font");

function wrapMessageWithFont(message, threadData) {
  const originalReply = message.reply;

  message.reply = async function (text, ...rest) {
    try {
      if (typeof text === "string") {
        const font = threadData?.data?.font || "normal";
        text = applyFont(text, font);
      } else if (Array.isArray(text) && typeof text[0] === "string") {
        const font = threadData?.data?.font || "normal";
        text[0] = applyFont(text[0], font);
      }
    } catch (e) {
      console.error("Font override error:", e);
    }

    return originalReply.call(this, text, ...rest);
  };

  return message;
}

module.exports = wrapMessageWithFont;
