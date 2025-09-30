const Canvas = require("canvas");
const fs = require("fs-extra");

module.exports = {
	config: {
		name: "pregnancy",
		version: "1.2",
		author: "your love",
		countDown: 5,
		role: 2,
		shortDescription: "Pregnancy meme generator",
		longDescription: "Make a pregnancy meme using custom template",
		category: "fun",
		guide: {
			en: "{pn} @tag অথবা রিপ্লাই করুন"
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

	
			if (Object.keys(event.mentions).length > 0) {
				uid2 = Object.keys(event.mentions)[0];
			} 
		
			else if (event.messageReply) {
				uid2 = event.messageReply.senderID;
			}

			if (!uid2) return message.reply(getLang("noTag"));

	
			const avatarURL = await usersData.getAvatarUrl(uid2);
			const avatar = await Canvas.loadImage(avatarURL);


			const template = await Canvas.loadImage(__dirname + "/assets/pregnancy_template.png");


			const canvas = Canvas.createCanvas(template.width, template.height);
			const ctx = canvas.getContext("2d");

		
			ctx.drawImage(template, 0, 0, canvas.width, canvas.height);

	
			const avatarRadius = 160; 
			const avatarSize = avatarRadius * 2; 
			const avatarX = 210;   
			const avatarY = 40;   

			ctx.save();
			ctx.beginPath();
			ctx.arc(
				avatarX + avatarRadius, 
				avatarY + avatarRadius, 
				avatarRadius, 
				0, 
				Math.PI * 2, 
				true
			);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
			ctx.restore();


			const pathSave = `${__dirname}/tmp/${uid2}_pregnancy.png`;
			fs.writeFileSync(pathSave, canvas.toBuffer());

			
			const funnyTexts = [
				`🤰 অভিনন্দন <@${uid2}>, তোমার রিপোর্ট পজিটিভ এসেছে!`,
				`😂 ওহ না… <@${uid2}> এখন মা/বাবা হতে যাচ্ছে!`,
				`👶 <@${uid2}> এক্সপেক্ট করছে! প্রস্তুত হও…`,
				`😳 ডাক্তার বলছে <@${uid2}> এর টেস্ট রেজাল্ট পজিটিভ!`
			];

			const finalText = args.join(" ") || funnyTexts[Math.floor(Math.random() * funnyTexts.length)];

			await message.reply({
				body: finalText,
				attachment: fs.createReadStream(pathSave)
			});

			fs.unlinkSync(pathSave);

		} catch (err) {
			console.error(err);
			message.reply("⚠️ প্রেগন্যান্সি মিম তৈরি করতে সমস্যা হয়েছে।");
		}
	}
};
