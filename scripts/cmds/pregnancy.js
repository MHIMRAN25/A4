const Canvas = require("canvas");
const fs = require("fs-extra");

module.exports = {
	config: {
		name: "pregnant",
		version: "1.6",
		author: "your love",
		countDown: 5,
		role: 2, // ✅ শুধুমাত্র এডমিন চালাতে পারবে
		shortDescription: "Pregnancy meme generator",
		longDescription: "Make a pregnancy meme using custom template",
		category: "fun",
		guide: {
			en: "{pn} @tag or reply"
		}
	},

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

			// 👉 ট্যাগ করলে
			if (Object.keys(event.mentions).length > 0) {
				uid2 = Object.keys(event.mentions)[0];
			} 
			// 👉 রিপ্লাই করলে
			else if (event.messageReply) {
				uid2 = event.messageReply.senderID;
			}

			if (!uid2) return message.reply(getLang("noTag"));

			// ডিবাগ লগ
			await message.reply("🔎 Generating pregnancy meme...");

			// ইউজারের অ্যাভাটার লোড
			const avatarURL = await usersData.getAvatarUrl(uid2);
			if (!avatarURL) return message.reply("⚠️ Could not fetch user's avatar!");

			const avatar = await Canvas.loadImage(avatarURL);

			// ✅ টেমপ্লেট লোড
			const templatePath = __dirname + "/assets/pregnancy_template.png";
			if (!fs.existsSync(templatePath)) {
				return message.reply("⚠️ Template image not found! Path: " + templatePath);
			}
			const template = await Canvas.loadImage(templatePath);

			// ক্যানভাস সেটআপ
			const canvas = Canvas.createCanvas(template.width, template.height);
			const ctx = canvas.getContext("2d");

			// টেমপ্লেট আঁকা
			ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

			// 👉 অ্যাভাটার বসানো (গোল radius = 220px)
			const avatarRadius = 220; 
			const avatarSize = avatarRadius * 2; // 440px
			const avatarX = 164; 
			const avatarY = 40;  

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

			// টেক্সট (বাংলা + ইংরেজি মিশ্রণ)
			const funnyTexts = [
				// বাংলা
				`🤰 অভিনন্দন <@${uid2}>, তোমার রিপোর্ট পজিটিভ এসেছে!`,
				`😂 ওহ না… <@${uid2}> এখন মা/বাবা হতে যাচ্ছে!`,
				`👶 <@${uid2}> এক্সপেক্ট করছে! প্রস্তুত হও…`,
				`😳 ডাক্তার বলছে <@${uid2}> এর টেস্ট রেজাল্ট পজিটিভ!`,

				// English
				`🤰 Congrats <@${uid2}>, your pregnancy test came back POSITIVE!`,
				`😂 Oh no… <@${uid2}> is going to be a mom/dad soon!`,
				`👶 Breaking news: <@${uid2}> is EXPECTING a baby!`,
				`😳 Doctor confirmed, <@${uid2}> is officially PREGNANT!`,
				`🤣 Somebody get diapers ready, <@${uid2}> is on the way to parenthood!`,
				`💉 Pregnancy test result: <@${uid2}> = POSITIVE ✅`
			];

			const finalText = args.join(" ") || funnyTexts[Math.floor(Math.random() * funnyTexts.length)];

			// মেসেজ সেন্ড
			const sentMsg = await message.reply({
				body: finalText,
				attachment: fs.createReadStream(pathSave)
			});

			// ✅ মেসেজে 🤰 reaction যোগ করা
			if (sentMsg && sentMsg.messageID) {
				message.react("🤰", sentMsg.messageID);
			}

			// টেম্প ফাইল মুছে ফেলা
			fs.unlinkSync(pathSave);

		} catch (err) {
			console.error("❌ ERROR:", err);
			message.reply("⚠️ Error generating meme: " + err.message);
		}
	}
};
