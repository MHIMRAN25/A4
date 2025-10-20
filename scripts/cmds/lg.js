module.exports = {
  config: {
    name: "listgroup",
    aliases: ["groupslist", "lg"],
    version: "7.3",
    author: "Saif + Imran Edit",
    countDown: 5,
    role: 2,
    shortDescription: "Show active groups, leave groups, pagination, and safe groups",
    longDescription: "Displays all groups where the bot is currently active. Supports pagination with next/prev, safe groups, and confirmation before leaving all groups.",
    category: "admin",
    guide: "{p}listgroup [page]"
  },

  onStart: async function ({ api, event, args }) {
    try {
      const page = parseInt(args[0]) || 1;
      const limit = 20;
      const start = (page - 1) * limit;
      const end = start + limit;

      const threadList = await api.getThreadList(200, null, ["INBOX"]);
      const groups = threadList.filter(t => t.isGroup);

      let activeGroups = [];
      for (const g of groups) {
        try {
          const info = await api.getThreadInfo(g.threadID);
          if (info.participantIDs.includes(api.getCurrentUserID())) {
            activeGroups.push({
              name: g.name || "Unnamed Group",
              threadID: g.threadID
            });
          }
        } catch (err) {
          console.error("Error checking thread:", g.threadID, err);
        }
      }

      if (activeGroups.length === 0)
        return api.sendMessage("❌ The bot is not currently in any groups.", event.threadID);

      const totalGroups = activeGroups.length;
      const totalPages = Math.ceil(totalGroups / limit);
      const currentPage = activeGroups.slice(start, end);

      let msg = `📋 **Groups where the bot is currently in (Page ${page}/${totalPages})**\n📊 Total groups: ${totalGroups}\n\n`;
      currentPage.forEach((g, i) => {
        msg += `${start + i + 1}. ${g.name} (TID: ${g.threadID})\n`;
      });

      msg += `\n👉 Reply with index numbers (e.g. 2 or 1 3 5) to leave specific groups.\n💣 Type 'all' to leave every group.\n💠 Type 'all but safe(1,5,7)' to leave all except selected groups.\n⬅️ 'prev' | ➡️ 'next'`;

      return api.sendMessage(msg, event.threadID, (err, info) => {
        if (err) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          groups: activeGroups,
          page,
          limit
        });
      });

    } catch (e) {
      console.error(e);
      return api.sendMessage("⚠️ Failed to fetch active group list.", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const { author, groups, page, limit } = Reply;
    if (event.senderID !== author)
      return api.sendMessage("❌ You are not authorized to reply to this command.", event.threadID);

    const body = event.body.trim().toLowerCase();
    const totalGroups = groups.length;
    const totalPages = Math.ceil(totalGroups / limit);

    // 🔹 Pagination: next / prev
    if (body === "next" || body === "prev") {
      let newPage = page + (body === "next" ? 1 : -1);
      if (newPage < 1 || newPage > totalPages)
        return api.sendMessage("⚠️ No more pages.", event.threadID);

      const start = (newPage - 1) * limit;
      const end = start + limit;
      const currentPage = groups.slice(start, end);

      let msg = `📋 **Groups (Page ${newPage}/${totalPages})**\n📊 Total groups: ${totalGroups}\n\n`;
      currentPage.forEach((g, i) => {
        msg += `${start + i + 1}. ${g.name} (TID: ${g.threadID})\n`;
      });

      msg += `\n👉 Reply with index numbers (e.g. 2 or 1 3 5) to leave specific groups.\n💣 Type 'all' to leave every group.\n💠 Type 'all but safe(1,5,7)'\n⬅️ 'prev' | ➡️ 'next'`;

      return api.sendMessage(msg, event.threadID, (err, info) => {
        if (err) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName: Reply.commandName,
          messageID: info.messageID,
          author,
          groups,
          page: newPage,
          limit
        });
      });
    }

    // 🔹 Leave all groups (confirmation)
    if (body === "all") {
      return api.sendMessage(
        `⚠️ Are you sure you want to leave **all groups**? Reply 'yes' to confirm or 'no' to cancel.`,
        event.threadID,
        (err, info) => {
          if (err) return;
          global.GoatBot.onReply.set(info.messageID, {
            commandName: Reply.commandName,
            messageID: info.messageID,
            author,
            groups,
            confirmAll: true
          });
        }
      );
    }

    // 🔹 Leave all except safe
    if (body.startsWith("all but safe")) {
      const match = body.match(/safe\(([^)]+)\)/);
      let safeIndexes = [];
      if (match && match[1]) {
        safeIndexes = match[1].split(",").map(n => parseInt(n.trim()) - 1);
      }

      const targets = groups.filter((g, i) => !safeIndexes.includes(i));

      if (targets.length === 0)
        return api.sendMessage("⚠️ Nothing to leave, all selected groups are safe.", event.threadID);

      return api.sendMessage(
        `⚠️ Are you sure you want to leave all groups except the safe ones? Reply 'yes' to confirm.`,
        event.threadID,
        (err, info) => {
          if (err) return;
          global.GoatBot.onReply.set(info.messageID, {
            commandName: Reply.commandName,
            messageID: info.messageID,
            author,
            groups: targets,
            confirmAll: true
          });
        }
      );
    }

    // 🔹 Confirmation for 'all' or 'all but safe'
    if (Reply.confirmAll) {
      if (body === "yes") {
        let results = [];
        for (const target of groups) {
          try {
            await api.removeUserFromGroup(api.getCurrentUserID(), target.threadID);
            results.push(`✅ Left '${target.name}'`);
          } catch (e) {
            results.push(`❌ Failed to leave '${target.name}'`);
          }
        }
        return api.sendMessage(results.join("\n"), event.threadID);
      } else if (body === "no") {
        return api.sendMessage("❎ Cancelled leaving groups.", event.threadID);
      } else {
        return api.sendMessage("⚠️ Please type 'yes' or 'no'.", event.threadID);
      }
    }

    // 🔹 Leave selected indexes
    const indexes = body.split(/\s+/).map(n => parseInt(n) - 1);
    const invalid = indexes.some(i => isNaN(i) || i < 0 || i >= groups.length);
    if (invalid)
      return api.sendMessage("⚠️ Invalid index number(s). Please try again.", event.threadID);

    const targets = indexes.map(i => groups[i]);
    let results = [];
    for (const target of targets) {
      try {
        await api.removeUserFromGroup(api.getCurrentUserID(), target.threadID);
        results.push(`✅ Left '${target.name}'`);
      } catch (e) {
        results.push(`❌ Failed to leave '${target.name}'`);
      }
    }

    await api.sendMessage(results.join("\n"), event.threadID);
    await api.unsendMessage(Reply.messageID);
  }
};
