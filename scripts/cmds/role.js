const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
    config: {
        name: "role",
        version: "4.2",
        author: "MH-BOT TEAM",
        role: 2,
        shortDescription: {
            en: "Manage admin role",
            bn: "এডমিন নিয়ন্ত্রণ",
            vi: "Quản lý quyền admin",
            hi: "एडमिन भूमिका प्रबंधित करें",
            ur: "ایڈمن رول کا انتظام کریں",
            ar: "إدارة دور المسؤول"
        },
        longDescription: {
            en: "Add, remove, view admin list",
            bn: "এডমিন যুক্ত/বহিষ্কার এবং তালিকা দেখুন",
            vi: "Thêm, xóa, xem danh sách admin",
            hi: "एडमिन जोड़ें, हटाएं और सूची देखें",
            ur: "ایڈمن شامل کریں، ہٹائیں اور فہرست دیکھیں",
            ar: "إضافة وإزالة وعرض قائمة المسؤولين"
        },
        category: "owner",
        guide: {
            en: "{pn} [add | -a] <uid | @tag>\n{pn} [remove | -r] <uid | @tag>\n{pn} [list | -l]",
            bn: "{pn} [add | -a] <uid | @tag>\n{pn} [remove | -r] <uid | @tag>\n{pn} [list | -l]",
            vi: "{pn} [add | -a] <uid | @tag>\n{pn} [remove | -r] <uid | @tag>\n{pn} [list | -l]",
            hi: "{pn} [add | -a] <uid | @tag>\n{pn} [remove | -r] <uid | @tag>\n{pn} [list | -l]",
            ur: "{pn} [add | -a] <uid | @tag>\n{pn} [remove | -r] <uid | @tag>\n{pn} [list | -l]",
            ar: "{pn} [add | -a] <uid | @tag>\n{pn} [remove | -r] <uid | @tag>\n{pn} [list | -l]"
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
            cannotRemoveOwner: "⛔ | Cannot remove Owner from admin"
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
            cannotRemoveOwner: "⛔ | Owner কে remove করা যাবে না"
        },
        vi: {
            added: "✅ | Đã thêm quyền admin cho %1 người dùng:\n%2",
            alreadyAdmin: "\n⚠️ | %1 người dùng đã có quyền admin:\n%2",
            missingIdAdd: "⚠️ | Vui lòng nhập ID hoặc tag người dùng để thêm quyền admin",
            removed: "✅ | Đã xóa quyền admin của %1 người dùng:\n%2",
            notAdmin: "⚠️ | %1 người dùng không có quyền admin:\n%2",
            missingIdRemove: "⚠️ | Vui lòng nhập ID hoặc tag người dùng để xóa quyền admin",
            listAdmin: "📋 | Danh sách admin:\n%1",
            cannotRemoveSelf: "⛔ | Bạn không thể xóa quyền admin của chính mình",
            cannotRemoveOwner: "⛔ | Không thể xóa quyền admin của Owner"
        },
        hi: {
            added: "✅ | %1 उपयोगकर्ताओं को एडमिन बनाया गया:\n%2",
            alreadyAdmin: "\n⚠️ | %1 उपयोगकर्ताओं के पास पहले से ही एडमिन है:\n%2",
            missingIdAdd: "⚠️ | कृपया ID या उपयोगकर्ता tag दें",
            removed: "✅ | %1 उपयोगकर्ताओं का एडमिन हटा दिया गया:\n%2",
            notAdmin: "⚠️ | %1 उपयोगकर्ता एडमिन नहीं हैं:\n%2",
            missingIdRemove: "⚠️ | कृपया ID या उपयोगकर्ता tag दें",
            listAdmin: "📋 | एडमिन सूची:\n%1",
            cannotRemoveSelf: "⛔ | आप अपना एडमिन नहीं हटा सकते",
            cannotRemoveOwner: "⛔ | Owner को हटाया नहीं जा सकता"
        },
        ur: {
            added: "✅ | %1 صارفین کو ایڈمن بنایا گیا:\n%2",
            alreadyAdmin: "\n⚠️ | %1 صارفین پہلے ہی ایڈمن ہیں:\n%2",
            missingIdAdd: "⚠️ | براہ کرم ID یا صارف کا tag دیں",
            removed: "✅ | %1 صارفین کا ایڈمن ہٹا دیا گیا:\n%2",
            notAdmin: "⚠️ | %1 صارفین ایڈمن نہیں ہیں:\n%2",
            missingIdRemove: "⚠️ | براہ کرم ID یا صارف کا tag دیں",
            listAdmin: "📋 | ایڈمن فہرست:\n%1",
            cannotRemoveSelf: "⛔ | آپ اپنا ایڈمن نہیں ہٹا سکتے",
            cannotRemoveOwner: "⛔ | Owner کو ہٹایا نہیں جا سکتا"
        },
        ar: {
            added: "✅ | تم إضافة دور المسؤول لـ %1 مستخدم:\n%2",
            alreadyAdmin: "\n⚠️ | %1 مستخدمين لديهم بالفعل صلاحية المسؤول:\n%2",
            missingIdAdd: "⚠️ | الرجاء إدخال معرف المستخدم أو الإشارة إليه",
            removed: "✅ | تم إزالة صلاحية المسؤول من %1 مستخدم:\n%2",
            notAdmin: "⚠️ | %1 مستخدمين ليس لديهم صلاحية المسؤول:\n%2",
            missingIdRemove: "⚠️ | الرجاء إدخال معرف المستخدم أو الإشارة إليه",
            listAdmin: "📋 | قائمة المسؤولين:\n%1",
            cannotRemoveSelf: "⛔ | لا يمكنك إزالة صلاحية المسؤول عن نفسك",
            cannotRemoveOwner: "⛔ | لا يمكن إزالة Owner"
        }
    },

    onStart: async function ({ message, args, usersData, event, getLang }) {
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
                saveConfig();

                const names = await sendNamesList(uids);
                return message.reply(
                    (addedIds.length ? getLang("added", addedIds.length, names.filter(u => addedIds.includes(u.uid)).map(u => `• ${u.name} (${u.uid})`).join("\n")) : "") +
                    (alreadyIds.length ? getLang("alreadyAdmin", alreadyIds.length, alreadyIds.map(uid => `• ${uid}`).join("\n")) : "")
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

                removedIds.forEach(uid => config.adminBot.splice(config.adminBot.indexOf(uid), 1));
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
};
