const Canvas = require("canvas");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "meter",
    version: "2.3",
    author: "Tas33n + GPT",
    shortDescription: "Fun gay/lesbu meter with funny comments",
    longDescription: "Generates a colorful meter image with avatar, percentage, and witty comments.",
    category: "fun",
    guide: "{pn} [gay|lesbu] @mention or reply to a user",
    aliases: ["gaymeter","lesbumeter"]
  },

  onStart: async function({ event, message, usersData, args }) {
    try {
      // 1️⃣ Determine type
      const cmdName = event.commandName.toLowerCase();
      const argType = args[0]?.toLowerCase();
      const type = (argType === "lesbu" || argType === "lesbian" || cmdName.includes("lesbu")) ? "lesbu" : "gay";

      // 2️⃣ Determine target user
      let uid;
      if(event.type === "message_reply") uid = event.messageReply.senderID;
      else if(Object.keys(event.mentions).length > 0) uid = Object.keys(event.mentions)[0];
      else uid = event.senderID;

      // 3️⃣ Random percentage
      const percent = Math.floor(Math.random() * 101);

      // 4️⃣ Determine comment & bar color
      let comment="", barColor="#00FF00";
      if(type==="gay"){
        if(percent<30){ comment="Straight as a ruler... or so you claim!"; barColor="#00FF00"; }
        else if(percent<50){ comment="You’re like 30% gay and 70% confused!"; barColor="#FFA500"; }
        else if(percent<80){ comment="You’re not 100% gay but definitely sparkle ✨"; barColor="#FFD700"; }
        else{ comment="Oh no bro! You just unlocked the full mode. 🌈 Achievement unlocked!"; barColor="rainbow"; }
      } else {
        if(percent<30){ comment="Totally straight… or so you claim!"; barColor="#00FF00"; }
        else if(percent<50){ comment="You’re like 30% lesbu and 70% confused!"; barColor="#FFA500"; }
        else if(percent<80){ comment="You’re not 100% lesbu but definitely sparkle ✨"; barColor="#FFD700"; }
        else{ comment="Oh no! You just unlocked full lesbu mode! 🌈 Achievement unlocked!"; barColor="rainbow"; }
      }

      // 5️⃣ Load avatar with fallback
      let avatar;
      try {
        const avatarUrl = await usersData.getAvatarUrl(uid);
        avatar = await Canvas.loadImage(avatarUrl);
      } catch (e) {
        console.log("Avatar fetch failed, using default avatar.");
        avatar = await Canvas.loadImage("https://i.imgur.com/1Yc7GqP.png"); // default fallback image
      }

      // 6️⃣ Create canvas
      const canvas = Canvas.createCanvas(500,280);
      const ctx = canvas.getContext("2d");

      // 7️⃣ Background gradient
      const bg = ctx.createLinearGradient(0,0,0,canvas.height);
      bg.addColorStop(0,"#111"); bg.addColorStop(1,"#222");
      ctx.fillStyle = bg; ctx.fillRect(0,0,canvas.width,canvas.height);

      // 8️⃣ Draw avatar circle + border
      const aX=50, aY=50, aSize=120;
      ctx.save();
      ctx.beginPath();
      ctx.arc(aX+aSize/2,aY+aSize/2,aSize/2,0,Math.PI*2); ctx.closePath(); ctx.clip();
      ctx.drawImage(avatar,aX,aY,aSize,aSize); ctx.restore();
      ctx.strokeStyle="#FFD700"; ctx.lineWidth=5;
      ctx.beginPath(); ctx.arc(aX+aSize/2,aY+aSize/2,aSize/2+2,0,Math.PI*2); ctx.stroke();

      // 9️⃣ Draw meter bar
      const bX=200, bY=180, bW=250, bH=30;
      ctx.fillStyle="#333"; ctx.fillRect(bX,bY,bW,bH);
      const fillW=(percent/100)*bW;
      if(barColor==="rainbow"){
        const r=ctx.createLinearGradient(bX,bY,bX+bW,bY);
        r.addColorStop(0,"#FF0000"); r.addColorStop(0.2,"#FF7F00"); r.addColorStop(0.4,"#FFFF00");
        r.addColorStop(0.6,"#00FF00"); r.addColorStop(0.8,"#0000FF"); r.addColorStop(1,"#8F00FF");
        ctx.fillStyle=r;
      } else ctx.fillStyle=barColor;
      ctx.fillRect(bX,bY,fillW,bH);

      // 10️⃣ Percentage & comment
      ctx.font="26px Arial"; ctx.fillStyle="#FFF"; ctx.textAlign="center";
      ctx.fillText(`🌈 ${type.charAt(0).toUpperCase()+type.slice(1)} Meter: ${percent}%`, canvas.width/2, 40);
      ctx.font="20px Arial"; ctx.fillText(comment, canvas.width/2, 120);

      // 11️⃣ Confetti
      for(let i=0;i<25;i++){
        const x=Math.random()*canvas.width,y=Math.random()*canvas.height,s=Math.random()*5+2;
        const colors=["#FF0000","#FF7F00","#FFFF00","#00FF00","#0000FF","#8F00FF"];
        ctx.fillStyle=colors[Math.floor(Math.random()*colors.length)];
        ctx.beginPath(); ctx.arc(x,y,s,0,Math.PI*2); ctx.fill();
      }

      // 12️⃣ Send image
      const buffer = canvas.toBuffer("image/png");
      await message.reply({
        body:`👑 ${type.charAt(0).toUpperCase()+type.slice(1)} Meter Result\nAuthor: Tas33n + GPT`,
        attachment: buffer
      });

    } catch(err){
      console.error(err);
      message.reply("❌ Something went wrong while generating the meter!");
    }
  }
};
