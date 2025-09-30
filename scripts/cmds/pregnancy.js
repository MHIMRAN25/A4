from PIL import Image, ImageDraw, ImageFont

# ছবিটি ওপেন করো
img = Image.open("input.jpg")

# ড্রইং কনটেক্সট তৈরি করো
draw = ImageDraw.Draw(img)

# ফন্ট সেট করো (নিচেরটা তোমার সিস্টেমে থাকতে হবে, Windows এ সাধারণত 'arial.ttf' থাকে)
font = ImageFont.truetype("arial.ttf", 60)

# টেক্সট যেটা বসাতে চাও
text = "😜 ল্যাংটা বাবার শুভেচ্ছা 😜"

# ছবির সাইজ
W, H = img.size

# মুখের অংশের জন্য ছবির মাঝ বরাবর Y কো-অর্ডিনেট নেবো
# এখানে H এর প্রায় 0.35 গুণ নিচে নামিয়ে মুখের কাছাকাছি বসানো হচ্ছে
w, h = draw.textsize(text, font=font)
x = (W - w) // 2
y = int(H * 0.35)

# টেক্সট বসাও
draw.text((x, y), text, font=font, fill="red")

# ছবিটি সেভ করো
img.save("output.jpg")
print("✅ কাজ শেষ! output.jpg ফাইলে টেক্সট বসে গেছে।")
