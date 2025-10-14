const config = require("../../../config.json");

function getRole(threadData, senderID) {
  if (!senderID) return 0;

  // Bot Owner
  if (config.adminBot.includes(senderID)) return 2;

  // Group Admin
  const adminBox = threadData ? threadData.adminIDs || [] : [];
  if (adminBox.includes(senderID)) return 1;

  // Normal user
  return 0;
}

module.exports = { getRole };
