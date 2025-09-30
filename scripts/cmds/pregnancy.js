const Canvas = require("canvas");
const fs = require("fs-extra");

const config = {
	name: "pregnancy",
	version: "1.5",
	author: "M H IMRAN", // 🔒 লকড
	countDown: 5,
	role: 2, // ✅ শুধু এডমিন চালাতে পারবে
	shortDescription: "Pregnancy meme generator",
	longDescription: "Make a pregnancy meme using custom template",
	category: "fun",
	guide: {
		en: "{pn} @tag অথবা রিপ্লাই করুন"
	}
};

// 🔐 Author property লক
Object.defineProperty(config, "author", {
	value: "M H IMRAN",
	writable: false,
	configurable: false
});

module.exports = {
	config,

	langs: {
		bn: {
			noTag: "⚠️ আপনাকে অবশ্যই কাউকে ট্যাগ করতে হবে অথবা মেসেজে রিপ্লাই দিতে হবে!"
		},
		en: {
			noTag: "⚠️ You must tag or reply to someone!"
		}
	},

	onStart: async function ({ event, message, usersData, args, getLang }) {
		try {
			let uid2;

			// ট্যাগ করলে
			if (Object.keys(event.mentions).length > 0) {
				uid2 = Object.keys(event.mentions)[0];
			} 
			// রিপ্লাই করলে
			else if (event.messageReply) {
				uid2 = event.messageReply.senderID;
			}

			if (!uid2) return message.reply(getLang("noTag"));

			// ইউজারের নাম + অ্যাভাটার লোড
			const name2 = await usersData.getName(uid2);
			const avatarURL = await usersData.getAvatarUrl(uid2);
			if (!avatarURL) return message.reply("⚠️ ইউজারের অ্যাভাটার আনা যাচ্ছে না!");

			const avatar = await Canvas.loadImage(avatarURL);

			// ✅ টেমপ্লেট লোড
			const templatePath = __dirname + "/assets/pregnancy_template.png";
			if (!fs.existsSync(templatePath)) {
				return message.reply("⚠️ টেমপ্লেট ইমেজ খুঁজে পাওয়া যায়নি! Path: " + templatePath);
			}
			const template = await Canvas.loadImage(templatePath);

			// ক্যানভাস সেটআপ
			const canvas = Canvas.createCanvas(template.width, template.height);
			const ctx = canvas.getContext("2d");

			// টেমপ্লেট আঁকা
			ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

			// ✅ অ্যাভাটার বসানো (মুখ বরাবর ঠিক)
			const avatarRadius = 120; 
			const avatarSize = avatarRadius * 2; // 240px
			const avatarX = 265;  
			const avatarY = 180;  

			ctx.save();
			ctx.beginPath();
			ctx.arc(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
			ctx.restore();

			// ফাইল সেভ
			const pathSave = `${__dirname}/tmp/${uid2}_pregnancy.png`;
			fs.writeFileSync(pathSave, canvas.toBuffer());

			// ফানি টেক্সট (BN + EN)
			const funnyTexts = [
				`🤰 অভিনন্দন ${name2}, তোমার রিপোর্ট পজিটিভ এসেছে!`,
				`😂 ওহ না… ${name2} এখন মা/বাবা হতে যাচ্ছে!`,
				`👶 ${name2} এক্সপেক্ট করছে! প্রস্তুত হও…`,
				`😳 ডাক্তার বলছে ${name2} এর টেস্ট রেজাল্ট পজিটিভ!`,
				`🤣 Breaking News: ${name2} is officially PREGNANT!`,
				`📢 ALERT: ${name2} just tested POSITIVE! Baby incoming 👶`,
				`😂 OMG! ${name2} is now expecting... Congratulations!`
			];

			const finalText = (args.join(" ") || funnyTexts[Math.floor(Math.random() * funnyTexts.length)]) 
				+ `\n\n✨ ল্যাংটা বাবার শুভেচ্ছা 💌`;

			// রিপ্লাই সহ পাঠানো
			const sent = await message.reply({
				body: finalText,
				attachment: fs.createReadStream(pathSave)
			});

			// ✅ রিয়্যাকশন এড করা (multiple emojis)
			if (sent && sent.messageID) {
				const reactions = ["🤰", "😂", "👶"];
				for (const r of reactions) {
					message.react(r, sent.messageID);
				}
			}

			fs.unlinkSync(pathSave);

		} catch (err) {
			console.error("❌ ERROR:", err);
			message.reply("⚠️ মিম তৈরি করতে সমস্যা হয়েছে: " + err.message);
		}
	}
};
