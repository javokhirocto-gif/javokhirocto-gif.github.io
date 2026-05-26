/* TIB VA DAM — Mini App
   Arxitektura: faqat tg.sendData() orqali bot bilan aloqa */

const tg = window.Telegram?.WebApp || null;
if (tg) { tg.ready(); tg.expand(); tg.enableClosingConfirmation(); }

function sendToBot(action, payload = {}) {
  const data = JSON.stringify({ action, ...payload });
  if (tg) tg.sendData(data);
  else console.log("[sendData]", action, payload);
}

const AUDIO_SRC = (typeof RUQIYA_AUDIO_URL !== "undefined") ? RUQIYA_AUDIO_URL : "";

/* ── MA'LUMOTLAR ── */
const UYQU = [
  ["Uyquga ketishi bilan cho'chib uyg'onish","u01"],
  ["Uyquda yurak havliqib uyg'onish","u02"],
  ["Ilon yoki ilonlarning hujum qilishi","u03"],
  ["It, mushuk (tushda)","u04"],
  ["Sichqon, kalamush (tushda)","u05"],
  ["Chayon, kaltakesak (tushda)","u06"],
  ["Tushunarsiz junli hayvonlar","u07"],
  ["Hojatxona, ahlatxona (tushda)","u08"],
  ["Suqmoq yo'llar (tushda)","u09"],
  ["Qabristonlar (tushda)","u10"],
  ["Mayitlar, chaqaloqlar (tushda)","u11"],
  ["Loyqa suvlar (tushda)","u12"],
  ["Yong'in, falokat (tushda)","u13"],
  ["Suvga cho'kish (tushda)","u14"],
  ["Tushunarsiz tugamas yo'llar","u15"],
  ["Uyquda ovoz chiqarish","u16"],
  ["Uyquda sovuq otish yoki terlash","u17"],
  ["Pay yoki tomir tortib qolishi","u18"],
  ["Zino qilish yoki zo'rlash (tushda)","u19"],
  ["Yalang'och erkak va ayollar (tushda)","u20"],
  ["Yaqinlari bilan yaqinlik (tushda)","u21"],
  ["Yonida kimdir yotgandek tuyulishi","u22"],
  ["Uyquda nimadir bosishi","u23"],
  ["Bakirish, ovozi chiqmay qolishi","u24"],
];
const ONGI = [
  ["Ma'lum vaqtda bosh og'rig'i","o01"],
  ["Holsizlik, charchoq, tinimsiz uyqu","o02"],
  ["Tez asabiylashtish","o03"],
  ["Sababsiz yurak siqilishi","o04"],
  ["Og'riqlar ko'chib yurishi","o05"],
  ["Yelka kuraklarda yuk bordek yurish","o06"],
  ["Ko'p esnash, kekirish","o07"],
  ["Yurak atroflarida og'riq sanchiq","o08"],
  ["Qo'l-oyoq uyushish","o09"],
  ["Er-xotin aloqasi buzilishi","o10"],
];
const XON = [
  ["Ayrim xonalarda bezovtalik","x01"],
  ["Yotoq xonada bezovtalik","x02"],
  ["Hammom va hojatxonada qo'rquv","x03"],
  ["Ishxonada bezovtalik","x04"],
  ["Qo'rquv turishi","x05"],
  ["Yurak siqilishi (xonada)","x06"],
  ["Ko'zga sharpa ko'rinishi","x07"],
  ["Ovoz eshitilishi (xonada)","x08"],
  ["Tezroq chiqib ketgisi kelishi","x09"],
  ["Ko'chada yaxshi, uyda yomon","x10"],
];
const INFO = {
  domla: {
    title: "Sayfulloh domla haqida",
    body: `O'zbekiston Xalq Tabobati Assotsiatsiyasining rasmiy a'zosi.

Oliy ma'lumotli mutaxassis — Misr, Saudiya Arabistoni, Turkiya, Moskva va Sankt-Peterburgda tahsil olgan.

"Ruhiy bezovtalik muolajasi" sohasida ixtisoslashgan tajribali Roqiy.`,
    map: false,
  },
  markaz: {
    title: "\"TIB VA DAM\" markazi",
    body: `📍 Yangi Toshkent, Gulzor MFY
Yangi Qo'yliq bozori, Food City ko'chasi

Qabul: Jumaday tashqari har kuni
• Ertalab: 07:00
• Kechqurun: 20:00`,
    map: false,
  },
  manzil: {
    title: "Manzil",
    body: `Yangi Toshkent, Gulzor MFY
Yangi Qo'yliq bozori, Food City ko'chasi

Jumaday tashqari har kuni: 07:00 va 20:00`,
    map: true, lat: 41.3264, lon: 69.3728,
  },
};

/* ── HOLAT ── */
const S = {
  registered: false,
  uyqu: new Set(), ongi: new Set(), xon: new Set(),
  all_labels: [], remaining: [],
  session_num: 0,
  tr_resolved: new Set(),
  offline_date: "", offline_time: "",
};

function getAllLabels() {
  const out = [];
  UYQU.forEach(([l,k]) => { if (S.uyqu.has(k)) out.push(l); });
  ONGI.forEach(([l,k]) => { if (S.ongi.has(k)) out.push(l); });
  XON.forEach(([l,k])  => { if (S.xon.has(k))  out.push(l); });
  return out;
}
function getLabels(data, sel) { return data.filter(([,k]) => sel.has(k)).map(([l]) => l); }
function tagsHtml(arr) {
  if (!arr || !arr.length) return '<span class="muted-text">—</span>';
  return arr.map(l => `<span class="sym-tag">${l}</span>`).join("");
}

/* ── LOCAL STORAGE ── */
function loadSessions() {
  try { return JSON.parse(localStorage.getItem("tvd_sessions") || "[]"); } catch { return []; }
}
function addSession(d) {
  const s = loadSessions(); s.push(d); try { localStorage.setItem("tvd_sessions", JSON.stringify(s)); } catch {}
}

/* ── NAVIGATSIYA ── */
const PROGRESS = {
  "s-menu":0,"s-register":10,"s-uyqu":20,"s-ongi":38,"s-xon":55,
  "s-complaint":70,"s-loading":76,"s-result":82,"s-ruqiya":84,
  "s-check":88,"s-tracking":93,"s-history":60,"s-offline":90,
  "s-info":5,"s-info-detail":5,"s-final":100,
};
const BACK_MAP = {
  "s-register":"s-menu","s-uyqu":"s-menu","s-ongi":"s-uyqu","s-xon":"s-ongi",
  "s-complaint":"s-xon","s-result":"s-menu","s-ruqiya":"s-menu",
  "s-check":"s-ruqiya","s-tracking":"s-ruqiya","s-history":"s-ruqiya",
  "s-offline":"s-menu","s-info":"s-menu","s-info-detail":"s-info","s-final":"s-menu",
};
let cur = "";

function el(id) { return document.getElementById(id); }

function go(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const scr = el(id);
  if (!scr) { console.error("Screen yo'q:", id); return; }
  scr.classList.add("active");
  cur = id;
  window.scrollTo({ top: 0 });

  const pct = PROGRESS[id] || 0;
  document.querySelectorAll(".progress-fill").forEach(e => e.style.width = pct + "%");
  document.querySelectorAll(".progress-label").forEach(e => e.textContent = pct ? pct + "%" : "");

  const bb = el("back-bar");
  if (bb) bb.style.display = (id === "s-menu") ? "none" : "block";
  if (tg) id === "s-menu" ? tg.BackButton.hide() : tg.BackButton.show();

  /* render on open */
  if (id === "s-uyqu")     renderList("uyqu-list", UYQU, S.uyqu, "uyqu-count");
  if (id === "s-ongi")     renderList("ongi-list", ONGI, S.ongi, "ongi-count");
  if (id === "s-xon")      renderList("xon-list",  XON,  S.xon,  "xon-count");
  if (id === "s-complaint") renderComplaintSummary();
  if (id === "s-result")   renderResult();
  if (id === "s-tracking") renderTracking();
  if (id === "s-history")  renderHistory();
  if (id === "s-offline")  renderOffline();
}

if (tg) tg.BackButton.onClick(() => { const t = BACK_MAP[cur]; if (t) go(t); });

/* ── RENDER FUNKSIYALARI ── */
function renderList(containerId, data, sel, countId) {
  const c = el(containerId); if (!c) return;
  c.innerHTML = "";
  function upd() {
    const e = el(countId);
    if (e) e.textContent = sel.size ? `${sel.size} ta belgilandi` : "Hech narsa belgilanmadi";
  }
  data.forEach(([label, key]) => {
    const item = document.createElement("div");
    item.className = "symptom-item" + (sel.has(key) ? " checked" : "");
    item.innerHTML = `
      <span class="sym-box">
        <svg class="sym-check" viewBox="0 0 10 10" fill="none">
          <polyline points="1.5,5.5 4,8 8.5,2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="sym-label">${label}</span>`;
    item.addEventListener("click", () => {
      sel.has(key) ? (sel.delete(key), item.classList.remove("checked"))
                   : (sel.add(key),    item.classList.add("checked"));
      upd();
    });
    c.appendChild(item);
  });
  upd();
}

function renderComplaintSummary() {
  const c = el("complaint-summary");
  if (c) c.innerHTML = tagsHtml(getAllLabels());
}

function renderResult() {
  const labels = getAllLabels();
  S.all_labels = labels;
  if (!S.remaining.length) S.remaining = [...labels];
  const c = el("result-symptoms"); if (c) c.innerHTML = tagsHtml(labels);
  const cnt = el("result-count"); if (cnt) cnt.textContent = `${labels.length} ta alomat aniqlandi`;
}

function renderTracking() {
  const remaining = S.remaining.length ? S.remaining : S.all_labels;
  const sub = el("tracking-sub");
  if (sub) sub.textContent = `${S.session_num}-seans • Qaysi alomatlar yo'qoldi?`;

  const stats = el("track-stats");
  if (stats) stats.innerHTML = `
    <div class="track-stat"><span class="track-stat-label">Jami alomatlar</span><span class="track-stat-val">${S.all_labels.length}</span></div>
    <div class="track-stat"><span class="track-stat-label">Hozircha qolgan</span><span class="track-stat-val track-remaining">${remaining.length}</span></div>`;

  S.tr_resolved = new Set();
  const c = el("track-list"); if (!c) return;
  c.innerHTML = "";

  if (!remaining.length) {
    c.innerHTML = `<div class="info-box">Barcha alomatlar yo'qoldi! Allohga shukr!</div>`;
    return;
  }

  function upd() {
    const stats2 = el("track-stats");
    if (stats2) stats2.innerHTML = `
      <div class="track-stat"><span class="track-stat-label">Jami alomatlar</span><span class="track-stat-val">${S.all_labels.length}</span></div>
      <div class="track-stat"><span class="track-stat-label">Belgilandi (yo'qoldi)</span><span class="track-stat-val track-resolved">${S.tr_resolved.size}</span></div>
      <div class="track-stat"><span class="track-stat-label">Qolgan</span><span class="track-stat-val track-remaining">${remaining.length - S.tr_resolved.size}</span></div>`;
  }

  remaining.forEach((sym, i) => {
    const item = document.createElement("div");
    item.className = "symptom-item";
    item.innerHTML = `
      <span class="sym-box">
        <svg class="sym-check" viewBox="0 0 10 10" fill="none">
          <polyline points="1.5,5.5 4,8 8.5,2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="sym-label">${sym}</span>`;
    item.addEventListener("click", () => {
      S.tr_resolved.has(i) ? (S.tr_resolved.delete(i), item.classList.remove("checked"))
                            : (S.tr_resolved.add(i),   item.classList.add("checked"));
      upd();
    });
    c.appendChild(item);
  });
  upd();
}

function renderHistory() {
  const c = el("history-list"); if (!c) return;
  const sessions = loadSessions();
  const total = S.all_labels.length;

  if (!sessions.length) {
    c.innerHTML = `<div class="history-empty">Hali hech qanday seans bo'lmagan.<br>Ruqiyani tinglashni boshlang.</div>`;
    return;
  }

  const allResolved = new Set(sessions.flatMap(s => s.resolved || []));
  const pct = total > 0 ? Math.round(allResolved.size / total * 100) : 0;

  c.innerHTML = `
    <div class="overall-progress-card">
      <div class="overall-big-num">${pct}%</div>
      <div class="overall-label">Umumiy yaxshilanish — ${allResolved.size} ta alomat yo'qoldi</div>
      <div class="progress-bar" style="margin-top:10px;height:1.5px">
        <div class="progress-fill" style="width:${pct}%"></div>
      </div>
    </div>`;

  [...sessions].reverse().forEach((s, idx) => {
    const num = sessions.length - idx;
    const resolved = s.resolved || [];
    const rem = s.remaining || [];
    const date = s.date ? new Date(s.date).toLocaleDateString("ru-RU", {day:"2-digit",month:"2-digit"}) : "—";
    const sPct = total > 0 ? Math.round(resolved.length / total * 100) : 0;
    const card = document.createElement("div");
    card.className = "history-card";
    card.innerHTML = `
      <div class="history-card-header">
        <span class="history-session-num">${num}-seans</span>
        <span class="history-date">${date}</span>
      </div>
      <div class="history-progress">
        <div class="history-progress-bar"><div class="history-progress-fill" style="width:${sPct}%"></div></div>
        <span class="history-progress-label">+${resolved.length} yo'qoldi</span>
      </div>
      ${resolved.length ? `<div class="history-tags">${resolved.map(r=>`<span class="history-tag-resolved">${r}</span>`).join("")}</div>` : ""}
      ${rem.length ? `<div class="history-tags" style="margin-top:4px">${rem.slice(0,4).map(r=>`<span class="history-tag-remaining">${r}</span>`).join("")}${rem.length>4?`<span class="history-tag-remaining">+${rem.length-4}</span>`:""}</div>` : ""}`;
    c.appendChild(card);
  });
}

function renderOffline() {
  S.offline_date = ""; S.offline_time = "";
  const grid = el("date-grid"); if (!grid) return;
  grid.innerHTML = "";
  const WD = ["Yak","Dush","Sesh","Chor","Pay","Jum","Shan"];
  const d = new Date(); d.setDate(d.getDate() + 1);
  let found = 0;
  while (found < 7) {
    if (d.getDay() !== 5) {
      const iso = d.toISOString().slice(0,10);
      const btn = document.createElement("div");
      btn.className = "date-btn";
      btn.innerHTML = `<span class="date-day">${d.toLocaleDateString("ru-RU",{day:"2-digit",month:"2-digit"})}</span><span class="date-wd">${WD[d.getDay()]}</span>`;
      btn.addEventListener("click", () => {
        document.querySelectorAll("#date-grid .date-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        S.offline_date = iso;
        updateOfflineLabel();
      });
      grid.appendChild(btn);
      found++;
    }
    d.setDate(d.getDate() + 1);
  }
  document.querySelectorAll(".time-btn").forEach(btn => {
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
    clone.addEventListener("click", () => {
      document.querySelectorAll(".time-btn").forEach(b => b.classList.remove("selected"));
      clone.classList.add("selected");
      S.offline_time = clone.dataset.time;
      updateOfflineLabel();
    });
  });
}

function updateOfflineLabel() {
  const e = el("offline-selected");
  const block = el("offline-confirm-block");
  if (e && S.offline_date && S.offline_time) {
    e.textContent = `${S.offline_date} — ${S.offline_time}`;
    if (block) block.style.display = "block";
  }
}

function showFinal({ title="", body="", extra="" } = {}) {
  const fi = el("final-icon"); if (fi) fi.textContent = "";
  const ft = el("final-title"); if (ft) ft.textContent = title;
  const fb = el("final-body"); if (fb) fb.textContent = body;
  const fe = el("final-extra"); if (fe) fe.innerHTML = extra;
  go("s-final");
}

function showErr(id, msg) {
  const e = el(id);
  if (!e) return;
  e.textContent = msg; e.style.display = "block";
  setTimeout(() => { e.style.display = "none"; }, 3000);
}

/* ── AUDIO PLAYER ── */
function initAudio() {
  const audio    = el("ruqiya-audio");
  const playBtn  = el("audio-play-btn");
  const iconPlay = el("icon-play");
  const iconPause= el("icon-pause");
  const prog     = el("audio-prog");
  const timeEl   = el("audio-time");
  const noFile   = el("audio-no-file");
  if (!audio || !playBtn) return;

  if (!AUDIO_SRC) {
    if (noFile) noFile.style.display = "block";
    playBtn.style.opacity = "0.3";
    playBtn.style.pointerEvents = "none";
    return;
  }
  audio.src = AUDIO_SRC;

  function fmt(s) {
    const m = Math.floor(s/60), sec = Math.floor(s%60);
    return `${m}:${String(sec).padStart(2,"0")}`;
  }
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    if (prog) prog.style.width = (audio.currentTime / audio.duration * 100) + "%";
    if (timeEl) timeEl.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
  });
  audio.addEventListener("ended", () => {
    if (iconPlay)  iconPlay.style.display  = "";
    if (iconPause) iconPause.style.display = "none";
    if (prog) prog.style.width = "0%";
    // Seans tugadi — kuzatuv ekranini taklif qilish
    S.session_num += 1;
    S.tr_resolved = new Set();
    if (!S.remaining.length) S.remaining = [...S.all_labels];
    const btn = el("btn-after-listen");
    if (btn) btn.style.display = "block";
  });
  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      if (iconPlay)  iconPlay.style.display  = "none";
      if (iconPause) iconPause.style.display = "";
    } else {
      audio.pause();
      if (iconPlay)  iconPlay.style.display  = "";
      if (iconPause) iconPause.style.display = "none";
    }
  });
  const bar = document.querySelector(".audio-progress-bar");
  if (bar) bar.addEventListener("click", e => {
    if (!audio.duration) return;
    const r = bar.getBoundingClientRect();
    audio.currentTime = (e.clientX - r.left) / r.width * audio.duration;
  });
}

/* ═══════════════════════════════════════════════════════════════
   DOMContentLoaded — BARCHA LISTENERS
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {

  /* Telegram back */
  if (tg) tg.BackButton.onClick(() => { const t = BACK_MAP[cur]; if (t) go(t); });

  /* Native back button */
  el("btn-back")?.addEventListener("click", () => { const t = BACK_MAP[cur]; if (t) go(t); });

  /* data-goto */
  document.addEventListener("click", e => {
    const target = e.target.closest("[data-goto]");
    if (!target) return;
    const dest = target.dataset.goto;
    const needReg = target.dataset.needReg === "1";
    if (needReg && !S.registered) { go("s-register"); return; }
    go(dest);
  });

  /* REGISTER */
  el("btn-reg")?.addEventListener("click", () => {
    const name   = el("reg-name")?.value.trim();
    const age    = el("reg-age")?.value.trim();
    const region = el("reg-region")?.value.trim();
    const phone  = el("reg-phone")?.value.trim();
    if (!name || name.length < 3) return showErr("reg-error", "Ism kamida 3 ta harf bo'lsin");
    if (!age || isNaN(age) || +age < 5 || +age > 120) return showErr("reg-error", "Yoshni to'g'ri kiriting");
    if (!region) return showErr("reg-error", "Viloyatni kiriting");
    if (!phone)  return showErr("reg-error", "Telefon raqamini kiriting");
    S.registered = true;
    sendToBot("register", { full_name: name, age: +age, region, phone });
    go("s-uyqu");
  });

  /* UYQU → ONGI */
  el("btn-uyqu-next")?.addEventListener("click", () => go("s-ongi"));

  /* ONGI → XON */
  el("btn-ongi-next")?.addEventListener("click", () => go("s-xon"));

  /* XON → COMPLAINT */
  el("btn-xon-next")?.addEventListener("click", () => go("s-complaint"));

  /* COMPLAINT → LOADING → RESULT */
  el("btn-complaint")?.addEventListener("click", () => {
    const txt = el("complaint-text")?.value.trim();
    if (!txt || txt.length < 10)
      return showErr("complaint-error", "Kamida 10 ta belgi kiriting");

    S.all_labels = getAllLabels();
    S.remaining  = [...S.all_labels];
    go("s-loading");

    const payload = {
      uyqu_symptoms:    getLabels(UYQU, S.uyqu),
      ongi_symptoms:    getLabels(ONGI, S.ongi),
      xonadon_symptoms: getLabels(XON,  S.xon),
      all_symptoms:     S.all_labels,
      complaint:        txt,
    };

    sendToBot("analysis", payload);

    /* Loading animatsiyasi */
    const msgs = [
      ["Tahlil qilinmoqda","Bot javob tayyorlamoqda"],
      ["Alomatlar tekshirilmoqda","Biroz sabr qiling"],
      ["Deyarli tayyor","Natija chatda ko'rinadi"],
    ];
    let mi = 0;
    const iv = setInterval(() => {
      mi = (mi+1) % msgs.length;
      const lt = el("loading-text"), ls = el("loading-sub");
      if (lt) lt.textContent = msgs[mi][0];
      if (ls) ls.textContent = msgs[mi][1];
    }, 3000);

    setTimeout(() => { clearInterval(iv); go("s-result"); }, 9000);
  });

  /* RESULT → OFFLINE */
  el("btn-goto-offline")?.addEventListener("click", () => go("s-offline"));

  /* RESULT → RUQIYA */
  el("btn-goto-ruqiya")?.addEventListener("click", () => go("s-ruqiya"));

  /* SEANS TUGADI → TRACKING */
  el("btn-after-listen")?.addEventListener("click", () => go("s-tracking"));

  /* 11 KUN EFFECT */
  document.querySelectorAll(".effect-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const effect = btn.dataset.effect;
      sendToBot("ruqiya_effect", { effect });
      if (effect === "yes") {
        showFinal({
          title: "Allohga shukr!",
          body: "Ruqiya ta'sir qilmoqda — davom eting!\nAlomatlaringizni kuzatib boring.",
        });
      } else if (effect === "continue") {
        showFinal({
          title: "Davo jarayoni davom etmoqda",
          body: "Ruqiyani davom ettiring. 11 kundan keyin qayta tekshiring.",
        });
      } else {
        showFinal({
          title: "Shaxsan tashrif tavsiya etiladi",
          body: "Onlayn ruqiya yordam bermagan bo'lsa, TIB VA DAM markaziga tashrif buyuring.\n\n📍 Yangi Toshkent, Gulzor MFY\n🕐 Har kuni (jumaday tashqari): 07:00 va 20:00",
          extra: `<button class="btn btn-primary" onclick="go('s-offline')" style="margin-top:10px">Tashrif yozish</button>`,
        });
      }
    });
  });

  /* TRACKING — SAQLASH */
  el("btn-track-save")?.addEventListener("click", () => {
    const remaining = S.remaining.length ? S.remaining : S.all_labels;
    const resolved  = [...S.tr_resolved].map(i => remaining[i]).filter(Boolean);
    const newRem    = remaining.filter((_, i) => !S.tr_resolved.has(i));
    const status    = !newRem.length || resolved.length > 0 ? "better" : "same";

    S.remaining = newRem;
    addSession({
      session_num: S.session_num,
      date: new Date().toISOString(),
      resolved, remaining: newRem,
      total: S.all_labels.length,
    });
    sendToBot("symptom_tracking", {
      tracking_type: "online",
      session_num: S.session_num,
      resolved_symptoms: resolved,
      remaining_symptoms: newRem,
      overall_status: status,
    });

    if (!newRem.length) {
      showFinal({
        title: "Barcha alomatlar yo'qoldi!",
        body: `Allohga shukr! Siz ${S.session_num} seans tingladi.\nAlloh taolo Sizi O'z rahmatida asrasin!`,
        extra: `<button class="btn btn-secondary" onclick="go('s-history')" style="margin-top:10px">Tarixni ko'rish</button>`,
      });
    } else if (resolved.length) {
      showFinal({
        title: `${S.session_num}-seans saqlandi`,
        body: `✅ ${resolved.length} ta alomat yaxshilandi\n🔴 ${newRem.length} ta alomat qoldi\n\nRuqiyani tinglashni davom eting. Alloh shifo bersin!`,
        extra: `
          <button class="btn btn-primary" onclick="go('s-ruqiya')" style="margin-top:10px">Yangi seans</button>
          <button class="btn btn-secondary" onclick="go('s-history')" style="margin-top:6px">Tarixni ko'rish</button>`,
      });
    } else {
      showFinal({
        title: `${S.session_num}-seans saqlandi`,
        body: "Bu seansda o'zgarish sezilmadi. Davom eting — ruqiya vaqt talab qiladi.\n\nAlloh shifo bersin!",
        extra: `<button class="btn btn-primary" onclick="go('s-ruqiya')" style="margin-top:10px">Yangi seans</button>`,
      });
    }
  });

  /* OFFLINE — TASDIQLASH */
  el("btn-offline-confirm")?.addEventListener("click", () => {
    if (!S.offline_date) return showErr("offline-error", "Sanani tanlang");
    if (!S.offline_time) return showErr("offline-error", "Vaqtni tanlang");
    sendToBot("offline_visit", { visit_date: S.offline_date, visit_time: S.offline_time });
    showFinal({
      title: "Tashrif tasdiqlandi!",
      body: `📅 ${S.offline_date}  ⏰ ${S.offline_time}\n📍 Yangi Toshkent, Gulzor MFY\n\nMenejer siz bilan bog'lanadi.`,
    });
  });

  /* MA'LUMOTLAR */
  document.querySelectorAll(".info-card-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const data = INFO[btn.dataset.info];
      if (!data) return;
      const c = el("info-content");
      if (c) c.innerHTML = `
        <div class="result-title">${data.title}</div>
        <div class="result-body">${data.body}</div>`;
      const mw = el("map-wrap"), mf = el("map-frame");
      if (mw && mf) {
        if (data.map) {
          mf.src = `https://maps.google.com/maps?q=${data.lat},${data.lon}&z=16&output=embed`;
          mw.style.display = "block";
        } else {
          mw.style.display = "none";
        }
      }
      go("s-info-detail");
    });
  });

  /* YOPISH */
  el("btn-close")?.addEventListener("click", () => { if (tg) tg.close(); });

  /* ISHGA TUSHIRISH */
  go("s-menu");
  initAudio();
});
