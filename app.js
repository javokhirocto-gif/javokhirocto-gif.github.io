/* ═══════════════════════════════════════════════════════════════════════════
   app.js — SHIFODUR Mini App  (to'liq qayta yozilgan)
   HTML id-lari: s-menu, s-register, s-uyqu, s-ongi, s-xonadon,
                 s-complaint, s-loading, s-result, s-zikr, s-zikr-detail,
                 s-ruqiya-intro, s-ruqiya-listen, s-ruqiya-check,
                 s-reaction-words, s-during-symptoms,
                 s-tracking, s-offline, s-malumot, s-malumot-detail,
                 s-savol, s-final
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── TELEGRAM SDK ──────────────────────────────────────────────────────────── */
const tg = window.Telegram?.WebApp || null;
if (tg) { tg.ready(); tg.expand(); tg.enableClosingConfirmation(); }

// ── API CONFIG ──────────────────────────────────────────────────────────────
// Railway API URL — HTML da API_BASE_URL o'zgaruvchisi orqali beriladi
const API_BASE = (typeof API_BASE_URL !== "undefined") ? API_BASE_URL : "";

// initData — Telegram dan keladi (foydalanuvchi kimligini tasdiqlaydi)
function getInitData() {
  return tg?.initData || "";
}

// Asosiy API chaqiruv funksiyasi
async function apiFetch(path, method = "GET", body = null) {
  if (!API_BASE || API_BASE === "SHU_YERGA_RAILWAY_URL_QOYING") {
    console.warn("⚠️ API_BASE_URL sozlanmagan — index.html da URL qo'ying");
    return null;
  }

  const initData = getInitData();
  // initData bo'sh bo'lsa (Telegram tashqarisida test) — dummy data
  const headerInitData = initData || "test_mode=1";

  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Init-Data":  headerInitData,
    },
  };
  if (body) opts.body = JSON.stringify(body);

  try {
    const resp = await fetch(API_BASE + path, opts);
    if (!resp.ok) {
      const errText = await resp.text().catch(() => "");
      console.error(`API xatolik [${resp.status}] ${path}:`, errText);
      return null;
    }
    return await resp.json();
  } catch(e) {
    console.error(`apiFetch [${method}] ${path} xatolik:`, e.message);
    return null;
  }
}

// Eski sendToBot — faqat fallback sifatida saqlanadi
function sendToBot(action, payload = {}) {
  const data = JSON.stringify({ action, ...payload });
  if (tg) tg.sendData(data);
  else console.log("[sendData fallback]", data);
}

/* ── MA'LUMOTLAR ───────────────────────────────────────────────────────────── */
const UYQU_SYMPTOMS = [
  ["Uyquга ketishi bilan choʻchib uyg'onish","uyqu_chochib"],
  ["Uyquda yurak havliqib uyg'onish","uyqu_yurak"],
  ["Ilon yoki ilonlarning hujum qilishi","uyqu_ilon"],
  ["It, mushuk (tushda)","uyqu_it_mushuk"],
  ["Sichqon, kalamush (tushda)","uyqu_sichqon"],
  ["Chayon, kaltakesak (tushda)","uyqu_chayon"],
  ["Tushunarsiz junli hayvonlar","uyqu_junli"],
  ["Hojatxona, ahlatxona (tushda)","uyqu_hojatxona"],
  ["Suqmoq yoʻllar (tushda)","uyqu_suqmoq"],
  ["Qabristonlar (tushda)","uyqu_qabriston"],
  ["Mayitlar, chaqaloqlar (tushda)","uyqu_mayit"],
  ["Loyqa suvlar (tushda)","uyqu_loyqa"],
  ["Yongʻin, falokat (tushda)","uyqu_yongin"],
  ["Suvga choʻkish (tushda)","uyqu_suvga"],
  ["Tushunarsiz tugamas yoʻllar","uyqu_tugamas"],
  ["Uyquda ovoz chiqarish","uyqu_ovoz"],
  ["Uyquda sovuq otish yoki terlash","uyqu_sovuq"],
  ["Pay yoki tomir tortib qolishi","uyqu_pay"],
  ["Zino qilish yoki zoʻrlash (tushda)","uyqu_zino"],
  ["Yalangʻoch erkak va ayollar (tushda)","uyqu_yalangoch"],
  ["Yaqinlari bilan yaqinlik (tushda)","uyqu_yaqinlik"],
  ["Yonida kimdir yotgandek tuyulishi","uyqu_yonida"],
  ["Uyquda nimadir bosishi","uyqu_bosish"],
  ["Bakirish, ovozi chiqmay qolishi","uyqu_bakirish"],
];
const ONGI_SYMPTOMS = [
  ["Maʼlum vaqtda bosh ogʻrigʻi","ongi_bosh"],
  ["Holsizlik, charchoq, tinimсiz uyqu kelishi","ongi_holsiz"],
  ["Tez asabiylashtish","ongi_asabiy"],
  ["Sababsiz yurak siqilishi","ongi_yurak"],
  ["Ogʻriqlar koʻchib yurishi","ongi_oghriq"],
  ["Yelka kuraklarda yuk bordek yurish","ongi_elka"],
  ["Koʻp esnash, kekirish","ongi_esnash"],
  ["Yurak atroflarida ogʻriq sanchiq","ongi_sanchiq"],
  ["Qoʻl-oyoq uyushish","ongi_uyush"],
  ["Er-xotin aloqasi buzilishi","ongi_aloqa"],
];
const XONADON_SYMPTOMS = [
  ["Ayrim xonalarda bezovtalik","xon_xona"],
  ["Yotoq xonada bezovtalik","xon_yotoq"],
  ["Hammom va hojatxonada qoʻrquv","xon_hammom"],
  ["Ishxonada bezovtalik","xon_ish"],
  ["Qoʻrquv turishi","xon_qorquv"],
  ["Yurak siqilishi (xonada)","xon_yurak"],
  ["Koʻzga sharpa koʻrinishi","xon_sharpa"],
  ["Ovoz eshitilishi (xonada)","xon_ovoz"],
  ["Tezroq chiqib ketgisi kelishi","xon_chiqish"],
  ["Koʻchada yaxshi, uyda yomon","xon_kuchada"],
];
const REACTION_WORDS = [
  ["Sehr deganda","rw_sehr"],["Er-xotinni ajratish","rw_tafriq"],
  ["Farzand boʻlmasligi uchun","rw_farzand"],["Kasal boʻlishi uchun","rw_kasal"],
  ["Oʻlimga qilingan","rw_olim"],["Aqldan ozdirish","rw_aql"],
  ["Hasad","rw_hasad"],["Ish yoʻli","rw_ish"],["Baxt yoʻli","rw_baxt"],
  ["Vas-vasa","rw_vasvasa"],["Oʻz joniga qasd","rw_qasd"],
  ["Qabrga koʻmilgan","rw_qabr"],["Qabriston tuprogʻi","rw_tuprog"],
  ["Mayit suvi","rw_mayit"],["Qafanlik","rw_qafan"],["Qoʻgʻirchoq","rw_qughir"],
  ["Rasm","rw_rasm"],["Qulf-zanjir","rw_qulf"],["Tugʻunlar","rw_tugon"],
  ["Qon va najosat","rw_qon"],["Ism, harf, raqam","rw_ism"],
  ["Jin deganda","rw_jin"],["Marid deganda","rw_marid"],["Yahudiy","rw_yahudiy"],
  ["Kofir","rw_kofir"],["Azob","rw_azob"],["Oʻlim","rw_olim2"],
  ["Jannat kalimlari","rw_jannat"],["Iblis deganda","rw_iblis"],
  ["Zino-fahsh deganda","rw_fahsh"],["Nasroniy","rw_nasro"],
  ["Jahannam","rw_jahannam"],["Qiyomat","rw_qiyomat"],["Jazo","rw_jazo"],
];
const DURING_SYMPTOMS = [
  ["Koʻp esnash","ds_esnash"],["Kekirish","ds_kekirish"],
  ["Koʻz yoshlanishi","ds_yosh"],["Yuz, jagʻ tortilishi","ds_yuz"],
  ["Tana bir tomonida uyushish","ds_uyush"],["Bosh ogʻrigʻi","ds_bosh"],
  ["Boʻyin qotib qolishi","ds_boyin"],["Oyoq ogʻrigʻi","ds_oyoq"],
  ["Qoʻl ogʻrigʻi","ds_qol"],["Yelka, kurak ogʻrigʻi","ds_elka"],
  ["Umurtqa ogʻriq-tolish","ds_umurtqa"],["Yurak sanchishi","ds_yurak"],
  ["Qovuq, bel ogʻrigʻi","ds_bel"],["Qorin ogʻrigʻi","ds_qorin"],
  ["Oʻpka ogʻrigʻi","ds_upka"],["Koʻngil ayinishi","ds_kongil"],
  ["Tomogʻa tiqilish","ds_tomoq"],["Ogʻriq koʻchib yurishi","ds_kochib"],
  ["Qaltiraq turishi","ds_qaltiraq"],["Sovuqotish / qizib ketish","ds_sovuq"],
  ["Oʻkiriq kelishi","ds_ukiriq"],["Yigʻlab kelishi","ds_yighlash"],
  ["Kulgi kelishi","ds_kulgi"],["Gʻazab kelishi","ds_gazab"],
  ["\"Domlaning kuchi yetmaydi\" fikri","ds_fikr1"],
  ["Allohga ishonmaslik fikri","ds_fikr2"],
  ["Xoch (krest) koʻzga koʻrinishi","ds_xoch"],
];

const ZIKR_DATA = {
  uyqu: {
    icon:"😴", title:"Uyqu uchun zikrlar",
    body:`• Uxlashdan oldin tahorat
• Oyatul-Kursiy — 1 marta
• Ixlos, Falaq, Nos — 3 martadan
• «Bismika Allohuma amutu va ahyo» — 1 marta`
  },
  bezovtalik: {
    icon:"😟", title:"Bezovtalik uchun zikrlar",
    body:`• «Hasbunallahu va nimal vakiyl» — koʻp marta
• «Astagʻfirulloh» — 100 marta
• Sura Fotiha — 7 marta
• Oyatul-Kursiy — kuniga 1–2 marta`
  },
  vasvasa: {
    icon:"🌀", title:"Vas-vasa uchun zikrlar",
    body:`• «Aʼuzu billahi minash-shaytonir-rojim» — 3 marta
• Sura Nos — 7 marta
• Sura Falaq — 7 marta
• Oyatul-Kursiy — 1–3 marta`
  },
  umumiy: {
    icon:"📿", title:"Umumiy zikrlar",
    body:`• Sura Fotiha — 7 marta
• Oyatul-Kursiy — 1–3 marta
• Ixlos, Falaq, Nos — 7 martadan
• Uyda Baqara surasini eshittirish — haftasiga 1 marta`
  },
  kunlik: {
    icon:"☀️", title:"Kunlik zikrlar",
    body:`• Bomdoddan keyin: Oyatul-Kursiy, Ixlos/Falaq/Nos — 3 martadan
• «Astagʻfirulloh» — 100 marta
• Uyqudan oldin: «Bismika Allohuma amutu va ahyo» — 1 marta`
  },
};

const MALUMOT_DATA = {
  domla: {
    title:"👳 Sayfulloh domla haqida",
    body:`🔹 Oʻzbekiston Xalq Tabobati Assotsiatsiyasining rasmiy aʼzosi

🎓 Taʼlim va malaka:
Oliy maʼlumotli mutaxassis — Misr, Saudiya Arabistoni, Turkiya, Moskva va Sankt-Peterburgda tahsil olgan va malaka oshirgan.

🌟 Ixtisosligi:
Oʻziga xos uslubda "Ruhiy bezovtalik muolajasi" sohasida chuqur ilmiy izlanishlar olib boradi.

✅ Koʻzga koʻringan tajribali Roqiy sifatida eʼtirof etilgan.`,
    map: false,
  },
  markaz: {
    title:"🏥 \"TIB VA DAM\" markazi haqida",
    body:`📍 Yangi Toshkent, Gulzor MFY
Moʻljal: Yangi Qoʻyliq bozori, Food City koʻchasi

🕐 Qabul: Jumaday tashqari har kuni
• Ertalab: 07:00
• Kechqurun: 20:00`,
    map: false,
  },
  manzil: {
    title:"📍 Manzil va xarita",
    body:`Yangi Toshkent, Gulzor MFY
Moʻljal: Yangi Qoʻyliq bozori, Food City koʻchasi

🕐 Jumaday tashqari har kuni
• Ertalab: 07:00
• Kechqurun: 20:00`,
    map: true,
    lat: 41.3264, lon: 69.3728,
  },

};

/* ── HOLAT ──────────────────────────────────────────────────────────────────── */
const state = {
  registered:       false,
  uyqu_selected:    new Set(),
  ongi_selected:    new Set(),
  xonadon_selected: new Set(),
  complaint:        "",
  all_labels:       [],         // dastlabki tanlangan barcha alomatlar
  remaining_labels: [],         // hali yoʻqolmagan alomatlar
  rw_selected:      new Set(),
  ds_selected:      new Set(),
  tr_resolved:      new Set(),
  offline_date:     "",
  offline_time:     "",
  prev_screen:      "s-menu",
  // Server bilan sinxronizatsiya
  tg_id:              null,   // Telegram user ID
  analysis_id:        null,   // oxirgi tahlil ID (DB dan)
  ruqiya_session_id:  null,   // joriy sessiya ID (DB dan)
  // Audio seans kuzatuvi
  session_num:      0,          // necha marta tinglandi
  after_resolved:   new Set(),  // bu seansda yaxshilangan alomatlar indekslari
};

/* ── LOCAL STORAGE — SEANSLAR TARIXI ──────────────────────────────────────── */
// Barcha seanslarni brauzerda saqlaymiz, botga ham yuboramiz
function loadSessions() {
  try {
    const raw = localStorage.getItem("ruqiya_sessions");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSessions(sessions) {
  try { localStorage.setItem("ruqiya_sessions", JSON.stringify(sessions)); }
  catch(e) { console.warn("localStorage xatolik:", e); }
}

function addSession(sessionData) {
  const sessions = loadSessions();
  sessions.push(sessionData);
  saveSessions(sessions);
  return sessions;
}

/* ── NAVIGATSIYA ────────────────────────────────────────────────────────────── */
const PROGRESS_MAP = {
  "s-menu":0,"s-register":10,"s-malumot":5,"s-malumot-detail":5,"s-savol":5,
  "s-uyqu":20,"s-ongi":40,"s-xonadon":58,"s-complaint":72,
  "s-loading":77,"s-result":82,
  "s-ruqiya-intro":84,"s-ruqiya-listen":86,"s-ruqiya-check":88,
  "s-reaction-words":90,"s-during-symptoms":94,
  "s-tracking":95,"s-offline":95,"s-after-listen":97,"s-history":60,"s-final":100,
};

// Back map: bu ekranda geri tugma bosila qayerga borish kerak
const BACK_MAP = {
  "s-register":        "s-menu",
  "s-uyqu":            "s-menu",
  "s-ongi":            "s-uyqu",
  "s-xonadon":         "s-ongi",
  "s-complaint":       "s-xonadon",
  "s-result":          "s-menu",
  "s-ruqiya-intro":    "s-menu",
  "s-ruqiya-listen":   "s-ruqiya-intro",
  "s-ruqiya-check":    "s-ruqiya-intro",
  "s-reaction-words":  "s-ruqiya-intro",
  "s-during-symptoms": "s-reaction-words",
  "s-tracking":        "s-menu",
  "s-offline":         "s-menu",
  "s-after-listen":    "s-ruqiya-listen",
  "s-history":         "s-ruqiya-listen",
  "s-malumot":         "s-menu",
  "s-malumot-detail":  "s-malumot",
  "s-savol":           "s-menu",
  "s-final":           "s-menu",
};

let currentScreen = "";

function go(id) {
  // Barcha screen-larni yashirish
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const next = document.getElementById(id);
  if (!next) { console.error("Screen topilmadi:", id); return; }
  next.classList.add("active");
  state.prev_screen = currentScreen || "s-menu";
  currentScreen = id;
  window.scrollTo({ top:0 });

  // Progress
  const pct = PROGRESS_MAP[id] ?? 0;
  document.querySelectorAll(".progress-fill").forEach(el => el.style.width = pct + "%");
  document.querySelectorAll(".progress-label").forEach(el => el.textContent = pct ? pct+"%" : "");

  // Telegram back button
  if (tg) {
    if (id === "s-menu") tg.BackButton.hide();
    else tg.BackButton.show();
  }

  // Orqaga tugmasi
  const backBar = document.getElementById("back-bar");
  if (backBar) backBar.style.display = (id === "s-menu") ? "none" : "block";

  // Ekran ochilganda kerakli narsalarni render qilish
  if (id === "s-uyqu")            renderSymptoms("uyqu-list", UYQU_SYMPTOMS, state.uyqu_selected, "uyqu-count");
  if (id === "s-ongi")            renderSymptoms("ongi-list", ONGI_SYMPTOMS, state.ongi_selected, "ongi-count");
  if (id === "s-xonadon")         renderSymptoms("xonadon-list", XONADON_SYMPTOMS, state.xonadon_selected, "xonadon-count");
  if (id === "s-complaint")       renderComplaintSummary();
  if (id === "s-result")          renderResult();
  if (id === "s-reaction-words")  renderChips("rw-grid", REACTION_WORDS, state.rw_selected, "word-chip", "rw-count");
  if (id === "s-during-symptoms") renderChips("ds-grid", DURING_SYMPTOMS, state.ds_selected, "chip", "ds-count");
  if (id === "s-tracking")        renderTracking();
  if (id === "s-after-listen")    renderAfterListen();
  if (id === "s-history")         renderHistory();
  if (id === "s-offline")         renderOffline();
}

// Telegram back button
if (tg) {
  tg.BackButton.onClick(() => {
    const target = BACK_MAP[currentScreen];
    if (target) go(target);
  });
}

// Нативная кнопка "Orqaga" (HTML кнопка, работает и без Telegram)
document.addEventListener("click", e => {
  if (e.target.closest("#btn-back-native")) {
    const target = BACK_MAP[currentScreen];
    if (target) go(target);
  }
});

/* ── YORDAMCHI ──────────────────────────────────────────────────────────────── */
function el(id) { return document.getElementById(id); }

function showFieldError(id, msg) {
  const e = el(id);
  if (!e) return;
  e.textContent = msg;
  e.style.display = "block";
  setTimeout(() => { e.style.display = "none"; }, 3000);
}

function getAllLabels() {
  const out = [];
  UYQU_SYMPTOMS.forEach(([l,k])    => { if (state.uyqu_selected.has(k))    out.push(l); });
  ONGI_SYMPTOMS.forEach(([l,k])    => { if (state.ongi_selected.has(k))    out.push(l); });
  XONADON_SYMPTOMS.forEach(([l,k]) => { if (state.xonadon_selected.has(k)) out.push(l); });
  return out;
}

function getLabels(data, sel) {
  return data.filter(([,k]) => sel.has(k)).map(([l]) => l);
}

function tagsHtml(labels, emoji = "") {
  if (!labels.length) return '<span class="muted-text">—</span>';
  return labels.map(l => `<span class="sym-tag">${emoji}${l}</span>`).join("");
}

function getAvailableDates(n = 6) {
  const WD = ["Yak","Dush","Sesh","Chor","Pay","Jum","Shan"];
  const out = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (out.length < n) {
    if (d.getDay() !== 5) {
      out.push({
        iso:   d.toISOString().slice(0,10),
        label: d.toLocaleDateString("ru-RU",{day:"2-digit",month:"2-digit"}),
        wd:    WD[d.getDay()],
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/* ── RENDER FUNKSIYALARI ────────────────────────────────────────────────────── */

// Symptom list — div asosida, label emas (double-fire bugidan xoli)
function renderSymptoms(containerId, data, selectedSet, countId) {
  const container = el(containerId);
  if (!container) return;
  container.innerHTML = "";

  function upd() {
    const c = el(countId);
    if (c) c.textContent = selectedSet.size
      ? `${selectedSet.size} ta belgilandi` : "Hech narsa belgilanmadi";
  }

  data.forEach(([label, key]) => {
    const item = document.createElement("div");
    item.className = "symptom-item" + (selectedSet.has(key) ? " checked" : "");
    item.innerHTML = `
      <span class="sym-box">
        <svg class="sym-check" viewBox="0 0 10 10" fill="none">
          <polyline points="1.5,5.5 4,8 8.5,2" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="sym-label">${label}</span>`;
    item.addEventListener("click", () => {
      if (selectedSet.has(key)) { selectedSet.delete(key); item.classList.remove("checked"); }
      else { selectedSet.add(key); item.classList.add("checked"); }
      upd();
    });
    container.appendChild(item);
  });
  upd();
}

// Chips (word-chip yoki chip class bilan)
function renderChips(containerId, data, selectedSet, chipClass, countId) {
  const container = el(containerId);
  if (!container) return;
  container.innerHTML = "";

  function upd() {
    const c = el(countId);
    if (c) c.textContent = selectedSet.size
      ? `${selectedSet.size} ta belgilandi` : "Hech narsa belgilanmadi";
  }

  data.forEach(([label, key]) => {
    const chip = document.createElement("div");
    chip.className = chipClass + (selectedSet.has(key) ? " selected" : "");
    chip.textContent = label;
    chip.addEventListener("click", () => {
      if (selectedSet.has(key)) { selectedSet.delete(key); chip.classList.remove("selected"); }
      else { selectedSet.add(key); chip.classList.add("selected"); }
      upd();
    });
    container.appendChild(chip);
  });
  upd();
}

// Shikoyat ekranidagi xulosa
function renderComplaintSummary() {
  const labels = getAllLabels();
  const c = el("complaint-summary");
  if (c) c.innerHTML = labels.length ? tagsHtml(labels) :
    '<span class="muted-text">Alomatlar belgilanmadi</span>';
}

// Tahlil natijasi ekrani
function renderResult() {
  const labels = getAllLabels();
  state.all_labels = labels;
  const c = el("result-symptoms");
  if (c) c.innerHTML = labels.length ? tagsHtml(labels) :
    '<span class="muted-text">—</span>';
  // RAG javobini ko'rsatish
  const rb = el("result-body");
  if (rb && state.rag_answer) {
    rb.style.whiteSpace = "pre-wrap";
    rb.textContent = state.rag_answer;
  }
}

// Kuzatuv ekrani
function renderTracking() {
  const all = state.all_labels.length ? state.all_labels : getAllLabels();
  state.tr_resolved = new Set();
  const container = el("track-list");
  if (!container) return;
  container.innerHTML = "";

  if (!all.length) {
    container.innerHTML = '<p class="muted-text" style="text-align:center">Alomatlar topilmadi. Avval tahlil oʻtkazing.</p>';
    el("btn-track-save").style.display = "none";
    return;
  }
  el("btn-track-save").style.display = "";

  function upd() {
    const res = state.tr_resolved.size;
    const rem = all.length - res;
    const s = el("track-stats");
    if (s) s.innerHTML = `
      <div class="track-stat"><span class="track-stat-label">Jami alomatlar</span><span class="track-stat-val">${all.length}</span></div>
      <div class="track-stat"><span class="track-stat-label">Yoʻqoldi</span><span class="track-stat-val track-resolved">${res}</span></div>
      <div class="track-stat"><span class="track-stat-label">Qolgan</span><span class="track-stat-val track-remaining">${rem}</span></div>`;
  }

  all.forEach((sym, i) => {
    const item = document.createElement("div");
    item.className = "symptom-item";
    item.innerHTML = `
      <span class="sym-box">
        <svg class="sym-check" viewBox="0 0 10 10" fill="none">
          <polyline points="1.5,5.5 4,8 8.5,2" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="sym-label">${sym}</span>`;
    item.addEventListener("click", () => {
      if (state.tr_resolved.has(i)) { state.tr_resolved.delete(i); item.classList.remove("checked"); }
      else { state.tr_resolved.add(i); item.classList.add("checked"); }
      upd();
    });
    container.appendChild(item);
  });
  upd();
}

// Offline ekrani
function renderOffline() {
  state.offline_date = "";
  state.offline_time = "";
  const grid = el("date-grid");
  if (!grid) return;
  grid.innerHTML = "";

  getAvailableDates(6).forEach(({ iso, label, wd }) => {
    const btn = document.createElement("div");
    btn.className = "date-btn";
    btn.innerHTML = `<span class="date-day">${label}</span><span class="date-wd">${wd}</span>`;
    btn.addEventListener("click", () => {
      document.querySelectorAll("#date-grid .date-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      state.offline_date = iso;
      updateOfflineText();
    });
    grid.appendChild(btn);
  });

  // Vaqt tugmalari — har render da listener qayta bog'lanmasligi uchun clone
  document.querySelectorAll(".time-btn").forEach(btn => {
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
    clone.addEventListener("click", () => {
      document.querySelectorAll(".time-btn").forEach(b => b.classList.remove("selected"));
      clone.classList.add("selected");
      state.offline_time = clone.dataset.time;
      updateOfflineText();
    });
  });
}

function updateOfflineText() {
  const c = el("offline-confirm-text");
  if (!c) return;
  if (state.offline_date && state.offline_time) {
    c.textContent = `📅 ${state.offline_date}  ⏰ ${state.offline_time}`;
    c.style.color = "var(--gold-soft)";
  }
}

/* ── FINAL EKRAN ────────────────────────────────────────────────────────────── */
function showFinal({ icon="✅", title="", body="", extra="" } = {}) {
  const fi = el("final-icon"); if (fi) fi.textContent = icon;
  const ft = el("final-title"); if (ft) ft.textContent = title;
  const fb = el("final-body"); if (fb) fb.textContent = body;
  const fe = el("final-extra"); if (fe) fe.innerHTML = extra;
  go("s-final");
}

/* ── NAVIGATSIYA: data-goto tugmalari ─────────────────────────────────────── */
// Barcha data-goto atributli elementlar uchun universal listener
document.addEventListener("click", e => {
  const target = e.target.closest("[data-goto]");
  if (!target) return;
  const dest = target.dataset.goto;

  // Roʻyxatdan oʻtish tekshiruvi
  if (["s-uyqu","s-ongi","s-xonadon","s-complaint","s-result",
       "s-ruqiya-intro","s-ruqiya-listen","s-reaction-words",
       "s-during-symptoms","s-tracking","s-offline"].includes(dest)) {
    if (!state.registered) { go("s-register"); return; }
  }
  go(dest);
});

/* ── REGISTER ────────────────────────────────────────────────────────────────── */
el("btn-reg-submit")?.addEventListener("click", () => {
  const name   = el("reg-name")?.value.trim();
  const age    = el("reg-age")?.value.trim();
  const region = el("reg-region")?.value.trim();
  const phone  = el("reg-phone")?.value.trim();

  if (!name || name.length < 3) return showFieldError("reg-error", "Ism kamida 3 ta harf boʻlsin");
  if (!age || isNaN(age) || +age < 5 || +age > 120) return showFieldError("reg-error", "Yoshni toʻgʻri kiriting (5–120)");
  if (!region) return showFieldError("reg-error", "Viloyatni kiriting");
  if (!phone)  return showFieldError("reg-error", "Telefon raqamini kiriting");

  // Darhol state ga saqlaymiz — API javobini kutmaymiz
  state.registered = true;
  state.reg_data   = { full_name: name, age: +age, region, phone };

  // API ga yuborish (fonda, bloklamasdan)
  apiFetch("/api/register", "POST", { full_name: name, age: +age, region, phone })
    .then(res => {
      if (res?.ok) {
        state.tg_id = res.user?.telegram_id;
        console.log("✅ Roʻyxatdan oʻtish saqlandi");
      } else {
        console.warn("⚠️ API saqlashda xatolik, keyinroq uriniladi");
      }
    })
    .catch(e => console.warn("Register API xatolik:", e));

  // Darhol keyingi ekranga o'tamiz
  go("s-uyqu");
});

/* ── COMPLAINT ───────────────────────────────────────────────────────────────── */
el("btn-complaint-submit")?.addEventListener("click", () => {
  const txt = el("complaint-text")?.value.trim();
  if (!txt || txt.length < 10)
    return showFieldError("complaint-error", "Batafsiroq tasvirlab bering (kamida 10 belgi)");

  state.complaint = txt;
  state.all_labels = getAllLabels();
  go("s-loading");

  const analysisPayload = {
    uyqu_symptoms:    getLabels(UYQU_SYMPTOMS,    state.uyqu_selected),
    ongi_symptoms:    getLabels(ONGI_SYMPTOMS,    state.ongi_selected),
    xonadon_symptoms: getLabels(XONADON_SYMPTOMS, state.xonadon_selected),
    all_symptoms:     state.all_labels,
    complaint:        txt,
  };

  // Anthropic API orqali tahlil olish (bot kabi)
  runAnalysis(analysisPayload).then(answer => {
    state.rag_answer = answer;
    go("s-result");
  });
});

/* ZIKR bo'limi olib tashlandi */

/* ── RUQIYA ──────────────────────────────────────────────────────────────────── */
el("btn-ruqiya-listen")?.addEventListener("click", () => go("s-ruqiya-listen"));

el("btn-ruqiya-11kun")?.addEventListener("click",  () => go("s-ruqiya-check"));
el("btn-ruqiya-check")?.addEventListener("click",  () => go("s-ruqiya-check"));

// 11 kun taʼsir tugmalari
document.querySelectorAll(".effect-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const effect = btn.dataset.effect;
    sendToBot("ruqiya_effect", { effect });

    if (effect === "yes") {
      showFinal({
        icon:"✅", title:"Allohga shukr!",
        body:"Ruqiya taʼsir qilmoqda — davom eting!\nAlomatlaringizni kuzatib boring.",
      });
    } else if (effect === "continue") {
      showFinal({
        icon:"⏳", title:"Davo jarayoni davom etmoqda",
        body:"Ruqiyani davom ettiring. 11 kundan keyin qayta tekshiring.",
      });
    } else {
      // effect === "no" — shaxsan tashrif tavsiya
      showFinal({
        icon:"🏥", title:"Shaxsan tashrif tavsiya etiladi",
        body:"Onlayn ruqiya yordam bermagan boʻlsa, shaxsiy offlayn ruqiya seansiga yozilishingiz tavsiya etiladi.\n\n📍 Yangi Toshkent, Gulzor MFY\n🕐 Jumaday tashqari har kuni: 07:00 va 20:00",
        extra:`<button class="btn btn-primary" onclick="go('s-offline')" style="margin-top:12px">📅 Tashrif yozilish</button>`,
      });
    }
  });
});

/* ── REAKTSIYA + DURING SYMPTOMS ─────────────────────────────────────────────── */
el("btn-ds-save")?.addEventListener("click", () => {
  const rwLabels = getLabels(REACTION_WORDS,  state.rw_selected);
  const dsLabels = getLabels(DURING_SYMPTOMS, state.ds_selected);

  // API orqali sessiya saqlash
  apiFetch("/api/session", "POST", {
    analysis_id:     state.analysis_id || null,
    session_type:    "online",
    reaction_words:  rwLabels,
    during_symptoms: dsLabels,
  }).then(r => {
    if (r?.ok) state.ruqiya_session_id = r.session_id;
  });

  const note = (rwLabels.length || dsLabels.length)
    ? "Bu maʼlumotlar — davo jarayoni borligidan dalolat beradi.\nAlloh shifo bersin! 🤲"
    : "Alloh shifo bersin! 🤲";

  showFinal({
    icon:"✅",
    title:"Ruqiya natijasi saqlandi",
    body:"11 kun davomida tong va kechqurun ruqiyani tinglang.\n\n" + note,
    extra: [
      rwLabels.length ? `<div style="margin-bottom:8px"><div class="card-title" style="font-size:.72rem;letter-spacing:.1em;color:var(--gold);margin-bottom:6px">🔴 REAKTSIYA KALIMLARI</div><div class="sym-summary">${tagsHtml(rwLabels)}</div></div>` : "",
      dsLabels.length ? `<div><div class="card-title" style="font-size:.72rem;letter-spacing:.1em;color:var(--gold);margin-bottom:6px">🟡 RUQIYA PAYTIDAGI ALOMATLAR</div><div class="sym-summary">${tagsHtml(dsLabels)}</div></div>` : "",
    ].join(""),
  });
});

/* ── TRACKING ────────────────────────────────────────────────────────────────── */
el("btn-track-save")?.addEventListener("click", () => {
  const all      = state.all_labels.length ? state.all_labels : getAllLabels();
  const resolved  = all.filter((_, i) => state.tr_resolved.has(i));
  const remaining = all.filter((_, i) => !state.tr_resolved.has(i));
  const status    = !remaining.length || resolved.length > remaining.length ? "better" : "same";

  apiFetch("/api/tracking", "POST", {
    tracking_type:      "online",
    resolved_symptoms:  resolved,
    remaining_symptoms: remaining,
    overall_status:     status,
    analysis_id:        state.analysis_id || null,
  });

  showFinal({
    icon: status === "better" ? "📈" : "📊",
    title:"Kuzatuv saqlandi",
    body: status === "better"
      ? "Allohga shukr! Ahvolingiz yaxshilanmoqda. ✅"
      : "Ruqiyani davom ettiring. ⏳",
    extra: `
      <div style="margin-bottom:8px">
        <div class="card-title" style="font-size:.72rem;letter-spacing:.1em;color:var(--gold);margin-bottom:6px">✅ YOʻQOLGAN ALOMATLAR (${resolved.length})</div>
        <div class="sym-summary">${tagsHtml(resolved)}</div>
      </div>
      <div>
        <div class="card-title" style="font-size:.72rem;letter-spacing:.1em;color:var(--gold);margin-bottom:6px">🔴 QOLGAN ALOMATLAR (${remaining.length})</div>
        <div class="sym-summary">${tagsHtml(remaining)}</div>
      </div>
      ${remaining.length ? `<button class="btn btn-secondary" onclick="go('s-offline')" style="margin-top:12px">📅 Offlayn tashrif</button>` : ""}`,
  });
});

/* ── OFFLINE ─────────────────────────────────────────────────────────────────── */
el("btn-offline-confirm")?.addEventListener("click", () => {
  if (!state.offline_date) return showFieldError("offline-error", "Sanani tanlang");
  if (!state.offline_time) return showFieldError("offline-error", "Vaqtni tanlang");

  apiFetch("/api/offline", "POST", {
    visit_date:  state.offline_date,
    visit_time:  state.offline_time,
    analysis_id: state.analysis_id || null,
  });

  showFinal({
    icon:"✅",
    title:"Tashrif tasdiqlandi!",
    body:`📅 ${state.offline_date}  ⏰ ${state.offline_time}\n📍 Yangi Toshkent, Gulzor MFY\n\nMenejer siz bilan bogʻlanadi.`,
  });
});

/* ── MA'LUMOTLAR ─────────────────────────────────────────────────────────────── */
document.querySelectorAll(".info-card-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const key  = btn.dataset.info;
    const data = MALUMOT_DATA[key];
    if (!data) return;
    const c = el("malumot-content");
    if (c) c.innerHTML = `
      <div class="result-title">${data.title}</div>
      <div class="result-body" style="white-space:pre-line">${data.body}</div>`;

    const mapWrap  = el("map-container");
    const mapFrame = el("map-iframe");
    if (mapWrap && mapFrame) {
      if (data.map) {
        mapFrame.src = `https://maps.google.com/maps?q=${data.lat},${data.lon}&z=16&output=embed`;
        mapWrap.style.display = "block";
      } else {
        mapWrap.style.display = "none";
      }
    }
    go("s-malumot-detail");
  });
});

/* ── SAVOL-JAVOB ─────────────────────────────────────────────────────────────── */
el("btn-savol-submit")?.addEventListener("click", () => {
  const txt = el("savol-text")?.value.trim();
  if (!txt || txt.length < 5) return showFieldError("savol-error", "Savolingizni kiriting");
  apiFetch("/api/savol", "POST", { question: txt });
  el("savol-text").value = "";
  showFinal({
    icon:"📨",
    title:"Savolingiz yuborildi!",
    body:"Menejerimiz yaqin orada javob beradi.\nBogʻlanish uchun: @manager_username",
  });
});

/* ── YOPISH TUGMASI ──────────────────────────────────────────────────────────── */
el("btn-close")?.addEventListener("click", () => { if (tg) tg.close(); });

/* ── MENU KARTALAR ───────────────────────────────────────────────────────────── */
// data-goto bilan ishlaydi, lekin "s-uyqu" bosilganda register tekshiruvi kerak
// Bu yuqoridagi universal listener orqali ishlaydi


/* ── AUDIO PLAYER ─────────────────────────────────────────────────────────── */
// AUDIO_URL — env dan yoki bot orqali berilgan URL
// Bot admin audio faylini yuklaydi, URL ni env AUDIO_RUQIYA_URL da saqlanadi
const AUDIO_URL = (typeof RUQIYA_AUDIO_URL !== "undefined") ? RUQIYA_AUDIO_URL : "";

function initAudioPlayer() {
  const audio     = document.getElementById("ruqiya-audio");
  const playBtn   = document.getElementById("audio-play-btn");
  const playIcon  = document.getElementById("audio-play-icon");
  const pauseIcon = document.getElementById("audio-pause-icon");
  const progress  = document.getElementById("audio-progress");
  const timeEl    = document.getElementById("audio-time");
  const noFile    = document.getElementById("audio-no-file");

  if (!audio || !playBtn) return;

  if (!AUDIO_URL) {
    if (noFile) noFile.style.display = "block";
    playBtn.style.opacity = "0.3";
    playBtn.style.pointerEvents = "none";
    return;
  }

  audio.src = AUDIO_URL;

  function fmt(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2,"0")}`;
  }

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    if (progress) progress.style.width = pct + "%";
    if (timeEl)   timeEl.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
  });

  audio.addEventListener("ended", () => {
    playIcon.style.display  = "";
    pauseIcon.style.display = "none";
    if (progress) progress.style.width = "0%";

    // Seans tugadi — alomatlar tanlov ekraniga o'tamiz
    onAudioEnded();
  });

  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      playIcon.style.display  = "none";
      pauseIcon.style.display = "";
    } else {
      audio.pause();
      playIcon.style.display  = "";
      pauseIcon.style.display = "none";
    }
  });

  // Progress bar click — seek
  const bar = document.querySelector(".audio-progress-bar");
  if (bar) {
    bar.addEventListener("click", e => {
      if (!audio.duration) return;
      const rect = bar.getBoundingClientRect();
      const pct  = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });
  }
}


/* ── TAHLIL — /api/analyze orqali (GROQ kaliti faqat serverda) ──────────── */
async function runAnalysis(payload) {
  const { all_symptoms, complaint } = payload;

  const FALLBACK = `🤲 Tasvirlangan belgilar ruhiy va maʼnaviy jihatdan eʼtibor talab qiladi.

🔍 Mumkin boʻlgan sabablar:
Belgilangan alomatlar (${all_symptoms.length} ta) ruhiy va maʼnaviy jihatdan koʻrib chiqilishi lozim.

✅ Amaliy tavsiyalar:
  - Oyatul-Kursiy, Falaq va Nos suralarini oʻqing
  - Namoz va zikrni muntazam ado eting
  - Sabr va Allohga tavassal qiling

🌟 Online ruqiyani 11 kun davomida tong va kechqurun tinglash tavsiya etiladi.
Agar oʻzgarish sezilmasa, shaxsiy offline ruqiya seansiga yozilishingiz mumkin.
Alloh taolo shifo va baraka bersin.`;

  try {
    // GROQ Railway serverda — kalit frontendga chiqmaydi
    const res = await apiFetch("/api/analyze", "POST", payload);
    if (res?.ok && res.answer) {
      if (res.analysis_id) state.analysis_id = res.analysis_id;
      return res.answer;
    }
    return FALLBACK;
  } catch(e) {
    console.error("runAnalysis xatolik:", e);
    return FALLBACK;
  }
}


/* ── BOSHLASH ────────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  // Foydalanuvchini Telegram ID orqali yuklash
  loadUserOnStart();
  go("s-menu");
  initAudioPlayer();
});

// Sahifa ochilganda foydalanuvchi va uning ma'lumotlarini yuklash
async function loadUserOnStart() {
  // API mavjud emasligida — shunchaki davom etamiz
  if (!API_BASE) {
    console.log("API_BASE_URL aniqlanmagan — offline rejim");
    return;
  }

  // initData dan tg_id olish
  const initData = getInitData();
  if (initData) {
    try {
      const match   = initData.match(/user=([^&]+)/);
      const tgUser  = match ? JSON.parse(decodeURIComponent(match[1])) : {};
      state.tg_id   = tgUser.id || null;
    } catch(e) {
      console.warn("initData parse xatolik:", e);
    }
  }

  // tg_id yo'q bo'lsa — to'xtaymiz (xatolik chiqarmaymiz)
  if (!state.tg_id) {
    console.log("tg_id topilmadi — Telegram ichida ochish kerak");
    return;
  }

  try {
    // Foydalanuvchi mavjudmi?
    const userRes = await apiFetch(`/api/user/${state.tg_id}`);
    if (!userRes?.ok) return; // Yangi foydalanuvchi — ro'yxatdan o'tish kerak

    state.registered = true;
    console.log("✅ Foydalanuvchi topildi:", userRes.user?.full_name);

    // Parallel yuklash — tezroq
    const [analysisRes, trackRes] = await Promise.all([
      apiFetch(`/api/analysis/${state.tg_id}`),
      apiFetch(`/api/tracking/${state.tg_id}`),
    ]);

    if (analysisRes?.ok && analysisRes.analysis) {
      state.analysis_id = analysisRes.analysis.id;
      state.all_labels  = analysisRes.analysis.symptoms || [];
      console.log("✅ Tahlil yuklandi:", state.all_labels.length, "ta alomat");
    }

    if (trackRes?.ok && trackRes.history?.length) {
      const last = trackRes.history[0];
      state.remaining_labels = last.remaining_symptoms || [];
      state.session_num      = trackRes.history.length;
      syncHistoryFromServer(trackRes.history);
      console.log("✅ Tarix yuklandi:", state.session_num, "seans");
    }

  } catch(e) {
    // API xatolik — foydalanuvchi ishini to'xtatmaymiz
    console.warn("loadUserOnStart xatolik (kritik emas):", e);
  }
}

// Server tarixini localStorage ga sinxronlashtirish
function syncHistoryFromServer(history) {
  const sessions = history.map((h, i) => ({
    session_num: i + 1,
    date:        h.tracked_at,
    resolved:    h.resolved_symptoms || [],
    remaining:   h.remaining_symptoms || [],
    total:       state.all_labels.length,
  }));
  saveSessions(sessions);
}
