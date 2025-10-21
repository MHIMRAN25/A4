const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const CACHE_DIR = path.join(__dirname, "..", "..", "cache");
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

// ===== Helper: load cookie from account.txt =====
function loadCookieFromAccountFile() {
  const possiblePaths = [
    path.join(CACHE_DIR, "account.txt"),
    path.join(__dirname, "..", "..", "account.txt"),
    path.join(process.cwd(), "account.txt")
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, "utf8").trim();
        let state;
        try { state = JSON.parse(raw); } catch (e) { 
          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          if (jsonMatch) state = JSON.parse(jsonMatch[0]); else throw e;
        }
        if (Array.isArray(state)) return state.map(v => `${v.key}=${v.value}`).join("; ");
        if (state.cookies && Array.isArray(state.cookies)) return state.cookies.map(v => `${v.key}=${v.value}`).join("; ");
        if (typeof state === "object") return Object.keys(state).map(k => `${k}=${state[k]}`).join("; ");
        if (raw.includes("=") && raw.includes(";")) return raw;
      } catch (err) { console.error("Failed to parse account.txt:", err); }
    }
  }
  return null;
}

// ===== Helper: fetch page HTML =====
async function fetchPageHtml(url, cookie) {
  const res = await axios.get(url, { headers: { cookie, "User-Agent": "Mozilla/5.0" } });
  return res.data;
}

// ===== Helper: parse friends page =====
function parseFriendsPage(html) {
  const $ = cheerio.load(html);
  const list = [];
  $('a').each((i, el) => {
    const href = $(el).attr('href') || "";
    const text = $(el).text().trim();
    if (!text) return;
    const m1 = href.match(/\/profile\.php\?id=(\d+)/);
    if (m1) { list.push({ uid: m1[1], name: text }); return; }
    const m2 = href.match(/\/people\/[^\/]+\/(\d+)/);
    if (m2) { list.push({ uid: m2[1], name: text }); return; }
  });

  let next = null, prev = null;
  $('a').each((i, el) => {
    const t = $(el).text().trim().toLowerCase();
    const href = $(el).attr('href');
    if (!href) return;
    if (t.match(/see more|more|next|আরও|বলা/)) next = 'https://mbasic.facebook.com' + href.split('?')[0];
    if (t.match(/prev|previous|পূর্ববর্তী/)) prev = 'https://mbasic.facebook.com' + href.split('?')[0];
  });

  let totalCount = null;
  const mainText = $('div').first().text();
  const totalMatch = mainText.match(/Friends\s*·\s*([\d,]+)/i) || mainText.match(/বন্ধু[^\d]*(\d{1,3}(?:,\d{3})*)/);
  if (totalMatch) totalCount = parseInt(totalMatch[1].replace(/,/g, '')) || null;

  const uniqMap = new Map();
  list.forEach(f => { if (f.uid && !uniqMap.has(f.uid)) uniqMap.set(f.uid, f); });
  return { list: Array.from(uniqMap.values()), next, prev, totalCount };
}

// ===== Cache helpers =====
function saveCache(threadID, pageNum, data) {
  const file = path.join(CACHE_DIR, `friends_${threadID}_p${pageNum}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
function loadCache(threadID, pageNum) {
  const file = path.join(CACHE_DIR, `friends_${threadID}_p${pageNum}.json`);
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file));
  return null;
}

// ===== Unfriend helper =====
async function unfriendUid(uid, cookie) {
  try {
    await axios.post(
      "https://www.facebook.com/ajax/profile/removefriendconfirm.php?dpr=1",
      `uid=${uid}&__a=1`,
      { headers: { cookie, "content-type": "application/x-www-form-urlencoded", "User-Agent": "Mozilla/5.0" } }
    );
    return { ok: true };
  } catch (e) { return { ok: false, error: e.message }; }
}

// ===== Goat Bot v2 export =====
module.exports = {
  config: {
    name: "friends",
    aliases: ["flist", "fpage"],
    version: "3.0",
    author: "Imran x GPT",
    countDown: 10,
    role: 2,
    shortDescription: "Paginated friend list + unfriend",
    category: "system",
    guide: { en: "{pn} → show first page\nReply: next / prev / u <no> / u all / u <fb link>" }
  },

  onStart: async function({ api, event }) {
    let cookie = loadCookieFromAccountFile();
    if (!cookie) {
      try { cookie = api.getAppState().map(v => `${v.key}=${v.value}`).join("; "); }
      catch { return api.sendMessage("❌ No valid cookie. Place your appstate JSON into cache/account.txt", event.threadID); }
    }

    const baseUrl = "https://mbasic.facebook.com/me/friends";
    try {
      const html = await fetchPageHtml(baseUrl, cookie);
      const parsed = parseFriendsPage(html);
      const pageList = parsed.list.slice(0, 50);
      saveCache(event.threadID, 1, { list: pageList, next: parsed.next, prev: parsed.prev, totalCount: parsed.totalCount });

      let msg = `📋 𝗕𝗼𝘁 𝗙𝗿𝗶𝗲𝗻𝗱𝘀 — Page 1\n\n`;
      pageList.forEach((f, i) => msg += `${i+1}. ${f.name} — ${f.uid}\n`);
      if (parsed.totalCount) msg += `\n🔢 Total (approx): ${parsed.totalCount}\n`;
      msg += `\n• Reply: next / prev\n• u <no> — unfriend specific\n• u all — unfriend all\n• u <fb link> — unfriend by link`;

      api.sendMessage(msg, event.threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "friends",
          author: event.senderID,
          messageID: info.messageID,
          type: "reply",
          page: 1,
          cookie,
          next: parsed.next,
          prev: parsed.prev
        });
      });
    } catch(e) { api.sendMessage("⚠️ Error fetching friends: " + e.message, event.threadID); }
  },

  onReply: async function({ api, event, Reply }) {
    if (event.senderID != Reply.author) return;
    const input = event.body.trim();
    const cookie = Reply.cookie;
    let currentPage = Reply.page || 1;
    let cached = loadCache(event.threadID, currentPage) || { list: [], next: Reply.next, prev: Reply.prev, totalCount: null };

    // send page function
    async function sendPage(pageNum, list, nextUrl, prevUrl, totalCount) {
      saveCache(event.threadID, pageNum, { list, next: nextUrl, prev: prevUrl, totalCount });
      let msg = `📋 𝗕𝗼𝘁 𝗙𝗿𝗶𝗲𝗻𝗱𝘀 — Page ${pageNum}\n\n`;
      list.forEach((f, i) => msg += `${i+1}. ${f.name} — ${f.uid}\n`);
      if (totalCount) msg += `\n🔢 Total (approx): ${totalCount}\n`;
      msg += `\n• Reply: next / prev\n• u <no> — unfriend specific\n• u all — unfriend all\n• u <fb link> — unfriend by link`;
      api.sendMessage(msg, event.threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "friends",
          author: event.senderID,
          messageID: info.messageID,
          type: "reply",
          page: pageNum,
          cookie,
          next: nextUrl,
          prev: prevUrl
        });
      });
    }

    // ===== NAVIGATION =====
    if (/^next$/i.test(input)) {
      const pageMeta = cached.next ? { url: cached.next } : (Reply.next ? { url: Reply.next } : null);
      if (!pageMeta || !pageMeta.url) return api.sendMessage("➡️ No next page available.", event.threadID);
      const nextPageNum = currentPage + 1;
      const cachedNext = loadCache(event.threadID, nextPageNum);
      if (cachedNext) return sendPage(nextPageNum, cachedNext.list, cachedNext.next, cachedNext.prev, cachedNext.totalCount);
      try {
        const html = await fetchPageHtml(pageMeta.url, cookie);
        const parsed = parseFriendsPage(html);
        const pageList = parsed.list.slice(0, 50);
        return await sendPage(nextPageNum, pageList, parsed.next, parsed.prev, parsed.totalCount);
      } catch (e) { return api.sendMessage("⚠️ Error loading next page: " + e.message, event.threadID); }
    }

    if (/^prev$|^previous$/i.test(input)) {
      if (!cached.prev && !Reply.prev) return api.sendMessage("⬅️ No previous page available.", event.threadID);
      const prevUrl = cached.prev || Reply.prev;
      const prevPageNum = Math.max(1, currentPage - 1);
      const cachedPrev = loadCache(event.threadID, prevPageNum);
      if (cachedPrev) return sendPage(prevPageNum, cachedPrev.list, cachedPrev.next, cachedPrev.prev, cachedPrev.totalCount);
      try {
        const html = await fetchPageHtml(prevUrl, cookie);
        const parsed = parseFriendsPage(html);
        const pageList = parsed.list.slice(0, 50);
        return await sendPage(prevPageNum, pageList, parsed.next, parsed.prev, parsed.totalCount);
      } catch (e) { return api.sendMessage("⚠️ Error loading previous page: " + e.message, event.threadID); }
    }

    // ===== UNFRIEND SINGLE =====
    if (/^u\s+\d+$/i.test(input)) {
      const n = parseInt(input.split(/\s+/)[1], 10);
      if (!cached.list || !cached.list[n - 1]) return api.sendMessage("❌ Invalid number on this page.", event.threadID);
      const target = cached.list[n - 1];
      api.sendMessage(`🧹 Unfriending ${target.name} (${target.uid})...`, event.threadID);
      const res = await unfriendUid(target.uid, cookie);
      if (res.ok) api.sendMessage(`✅ Unfriended: ${target.name} (${target.uid})`, event.threadID);
      else api.sendMessage(`❌ Failed: ${target.name} (${target.uid}): ${res.error}`, event.threadID);
      return;
    }

    // ===== UNFRIEND BY LINK =====
    if (/^u\s+https?:\/\//i.test(input)) {
      const link = input.split(/\s+/)[1];
      const m = link.match(/(\d{6,})/);
      if (!m) return api.sendMessage("❌ Couldn't detect UID in link.", event.threadID);
      const uid = m[1];
      api.sendMessage(`🧹 Unfriending ${uid}...`, event.threadID);
      const res = await unfriendUid(uid, cookie);
      if (res.ok) api.sendMessage(`✅ Unfriended: ${uid}`, event.threadID);
      else api.sendMessage(`❌ Failed: ${res.error}`, event.threadID);
      return;
    }

    // ===== UNFRIEND ALL =====
    if (/^u\s+all$/i.test(input)) {
      if (!cached.list || cached.list.length === 0) return api.sendMessage("❌ No friends on this page to unfriend.", event.threadID);

      api.sendMessage(`🧹 Starting to unfriend all ${cached.list.length} friends on this page (2/min)...`, event.threadID);

      let count = 0;
      for (const f of cached.list) {
        const res = await unfriendUid(f.uid, cookie);
        if (res.ok) count++;
        else api.sendMessage(`❌ Failed to unfriend ${f.name} (${f.uid}): ${res.error}`, event.threadID);

        // Wait 30 seconds per friend → 2 per minute
        await new Promise(r => setTimeout(r, 30000));
      }

      api.sendMessage(`✅ Done. Total unfriended: ${count} / ${cached.list.length}`, event.threadID);
      return;
    }

    // ===== Default fallback =====
    api.sendMessage("❌ Unknown reply command. Use: next / prev / u <no> / u all / u <fb link>", event.threadID);
  }
};
