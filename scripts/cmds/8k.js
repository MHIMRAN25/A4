pregnancy const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
    config: {
        name: "role2",
        version: "1.1",
        author: "MH-BOT TEAM",
        role: 2,
        shortDescription: {
            en: "Admin management + group welcome",
            bn: "এডমিন নিয়ন্ত্রণ + গ্রুপ স্বাগতম"
        },
        longDescription: {
            en: "Manage bot admin role and send welcome message when added to group",
            bn: "বটের এডমিন নিয়ন্ত্রণ এবং গ্রুপে যোগ হলে স্বয়ংক্রিয় মেসেজ"
        },
        category: "owner",
        guide: {
            en: "{pn} [add | -a] <uid | @tag>\n{pn} [remove | -r] <uid | @tag>\n{pn} [list | -l]",
            bn: "{pn} [add | -a] <uid | @tag>\n{pn} [remove | -r] <uid | @tag>\n{pn} [list | -l]"
        }
    },

    langs: {
        en: {
            added: "✅ | Added admin role for %1 users:\n%2",
            alreadyAdmin: "\n⚠️ | %1 users already have admin role:\n%2",
            missingIdAdd: "⚠️ | Please enter ID or tag user to add admin role",
            removed: "✅ | Removed admin role of %1 users:\n%2",
            notAdmin: "⚠️ | %1 users don't have admin role:\n%2",
            missingIdRemove: "⚠️ | Please enter ID or tag user to remove admin role",
            listAdmin: "📋 | List of admins:\n%1",
            cannotRemoveSelf: "⛔ | You cannot remove your own admin role",
            cannotRemoveOwner: "⛔ | Cannot remove Owner from admin",
            welcome: "Thank you for adding me to this group! 🎉"
        },
        bn: {
            added: "✅ | %1 জন ব্যবহারকারীর জন্য এডমিন যুক্ত হয়েছে:\n%2",
            alreadyAdmin: "\n⚠️ | %1 জন ব্যবহারকারীর আগে থেকেই এডমিন রয়েছে:\n%2",
            missingIdAdd: "⚠️ | দয়া করে ID বা ব্যবহারকারী tag দিন যাতে এডমিন যুক্ত করা যায়",
            removed: "✅ | %1 জন ব্যবহারকারীর এডমিন পদ বহিষ্কার করা হয়েছে:\n%2",
            notAdmin: "⚠️ | %1 জন ব্যবহারকারীর এডমিন নেই:\n%2",
            missingIdRemove: "⚠️ | দয়া করে ID বা ব্যবহারকারী tag দিন যাতে এডমিন বহিষ্কার করা যায়",
            listAdmin: "📋 | এডমিন তালিকা:\n%1",
            cannotRemoveSelf: "⛔ | আপনি নিজের এডমিন পদ মুছে ফেলতে পারবেন না",
            cannotRemoveOwner: "⛔ | Owner কে remove করা যাবে না",
            welcome: "আমাকে গ্রুপে যুক্ত করার জন্য ধন্যবাদ! 🎉"
        }
    },

    onStart: async function ({ message, args, usersData, event, getLang }) {

        // ✅ ensure adminBot array
        config.adminBot = Array.isArray(config.adminBot) ? config.adminBot : [];

        // ----------------------
        // 1️⃣ Bot Admin Management
        // ----------------------
        if (args && args.length) {
            const action = args[0]?.toLowerCase();

            const getTargetUids = () => {
                if (event.mentions && Object.keys(event.mentions).length) return Object.keys(event.mentions);
                if (event.messageReply) return [event.messageReply.senderID];
                return args.slice(1).filter(arg => !isNaN(arg));
            };

            const saveConfig = () => writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

            const sendNamesList = async (uids) => {
                const names = await Promise.all(uids.map(uid => usersData.getName(uid).then(name => ({ uid, name }))));
                return names;
            };

            switch (action) {

                case "add":
                case "-a": {
                    const uids = getTargetUids();
                    if (!uids.length) return message.reply(getLang("missingIdAdd"));

                    const addedIds = [], alreadyIds = [];
                    for (const uid of uids) config.adminBot.includes(uid) ? alreadyIds.push(uid) : addedIds.push(uid);

                    config.adminBot.push(...addedIds);
                    config.adminBot = [...new Set(config.adminBot)];
                    saveConfig();

                    const names = await sendNamesList(uids);
                    return message.reply(
                        (addedIds.length ? getLang("added", addedIds.length, names.filter(u => addedIds.includes(u.uid)).map(u => `• ${u.name} (${u.uid})`).join("\n")) : "") +
                        (alreadyIds.length ? getLang("alreadyAdmin", alreadyIds.length, names.filter(u => alreadyIds.includes(u.uid)).map(u => `• ${u.name} (${u.uid})`).join("\n")) : "")
                    );
                }

                case "remove":
                case "-r": {
                    const uids = getTargetUids();
                    if (!uids.length) return message.reply(getLang("missingIdRemove"));

                    const removedIds = [], notAdminIds = [];
                    for (const uid of uids) {
                        if (!config.adminBot.includes(uid)) notAdminIds.push(uid);
                        else if (uid === event.senderID) return message.reply(getLang("cannotRemoveSelf"));
                        else if (config.ADMIN_IDS.includes(uid)) return message.reply(getLang("cannotRemoveOwner"));
                        else removedIds.push(uid);
                    }

                    removedIds.forEach(uid => {
                        const index = config.adminBot.indexOf(uid);
                        if (index !== -1) config.adminBot.splice(index, 1);
                    });
                    saveConfig();

                    const names = await sendNamesList(removedIds);
                    return message.reply(
                        (removedIds.length ? getLang("removed", removedIds.length, names.map(u => `• ${u.name} (${u.uid})`).join("\n")) : "") +
                        (notAdminIds.length ? getLang("notAdmin", notAdminIds.length, notAdminIds.map(uid => `• ${uid}`).join("\n")) : "")
                    );
                }

                case "list":
                case "-l": {
                    const ownerList = await Promise.all(config.ADMIN_IDS.map(uid => usersData.getName(uid).then(name => `⭐ ${name} (${uid})`)));
                    const adminList = await Promise.all(config.adminBot.map(uid => usersData.getName(uid).then(name => `👑 ${name} (${uid})`)));
                    const finalList = [...ownerList, ...adminList];
                    if (!finalList.length) finalList.push("❌ এখনো কোন এডমিন নেই");
                    return message.reply(getLang("listAdmin", finalList.join("\n")));
                }

                default:
                    return message.SyntaxError();
            }
        }

        // ----------------------
        // 2️⃣ Group Join Welcome (Safety Fix)
        // ----------------------
        if (event.type === "event" && event.logMessageType === "log:subscribe") {
            const meId = global.GoatBot.api.getCurrentUserID();
            const addedIds = Array.isArray(event.addedParticipants) 
                             ? event.addedParticipants.map(p => p.userFbId) 
                             : [];

            if (addedIds.includes(meId)) {
                await message.reply(getLang("welcome"));
            }
        }
    }
};
