/* ═══════════════════════════════════════════════════════════════
   app.js — TIB VA DAM Mini App
   Barcha listeners DOMContentLoaded ichida — bu asosiy qoida
   ═══════════════════════════════════════════════════════════════ */

/* ── TELEGRAM ──────────────────────────────────────────────────── */
const tg = window.Telegram?.WebApp || null;
if (tg) { tg.ready(); tg.expand(); tg.enableClosingConfirmation(); }

function getInitData() { return tg?.initData || ""; }
function sendToBot(action, payload = {}) {
  if (tg) tg.sendData(JSON.stringify({ action, ...payload }));
  else console.log("[sendData]", action, payload);
}

/* ── API CONFIG ────────────────────────────────────────────────── */
const API_BASE = (typeof API_BASE_URL !== "undefined" &&
                  API_BASE_URL !== "SHU_YERGA_RAILWAY_URL_QOYING")
                  ? API_BASE_URL.replace(/\/$/, "") : "";

const AUDIO_SRC = (typeof RUQIYA_AUDIO_URL !== "undefined") ? RUQIYA_AUDIO_URL : "";

// Telegram user ID ni initData dan olish
function getTgId() {
  if (state.tg_id) return state.tg_id;
  try {
    const initData = getInitData();
    if (!initData) return null;
    const match = initData.match(/user=([^&]+)/);
    if (match) {
      const user = JSON.parse(decodeURIComponent(match[1]));
      state.tg_id = user.id || null;
      return state.tg_id;
    }
  } catch(e) {}
  return null;
}

async function apiFetch(path, method = "GET", body = null) {
  if (!API_BASE) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  // tg_id ni har doim body ga qo'shamiz
  const tgId = getTgId();
  const enrichedBody = body && tgId ? { ...body, _tg_id: tgId } : body;

  try {
    const resp = await fetch(API_BASE + path, {
      method,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-Init-Data":  getInitData() || "",
        "X-Tg-Id":      String(tgId || ""),
      },
      body: enrichedBody ? JSON.stringify(enrichedBody) : null,
    });
    clearTimeout(timer);
    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      console.error(`API [${resp.status}] ${path}:`, txt);
      return null;
    }
    return await resp.json();
  } catch(e) {
    clearTimeout(timer);
    if (e.name !== "AbortError") console.error("apiFetch", path, e.message);
    return null;
  }
}

/* ── MA'LUMOTLAR ───────────────────────────────────────────────── */
const UYQU_SYMPTOMS = [
  ["Uyquга ketishi bilan choʻchib uyg'onish","uyqu_chochib"],
  ["Uyquda yurak havliqib uyg'onish","uyqu_yurak"],
  ["Ilon yoki ilonlarning hujum qilishi","uyqu_ilon"],
  ["It, mushuk (tushda)","uyqu_it"],
  ["Sichqon, kalamush (tushda)","uyqu_sichqon"],
  ["Chayon, kaltakesak (tushda)","uyqu_chayon"],
  ["Tushunarsiz junli hayvonlar","uyqu_junli"],
  ["Hojatxona, ahlatxona (tushda)","uyqu_hojat"],
  ["Suqmoq yoʻllar (tushda)","uyqu_suqmoq"],
  ["Qabristonlar (tushda)","uyqu_qabr"],
  ["Mayitlar, chaqaloqlar (tushda)","uyqu_mayit"],
  ["Loyqa suvlar (tushda)","uyqu_loyqa"],
  ["Yongʻin, falokat (tushda)","uyqu_yongin"],
  ["Suvga choʻkish (tushda)","uyqu_suv"],
  ["Tushunarsiz tugamas yoʻllar","uyqu_tugamas"],
  ["Uyquda ovoz chiqarish","uyqu_ovoz"],
  ["Uyquda sovuq otish yoki terlash","uyqu_sovuq"],
  ["Pay yoki tomir tortib qolishi","uyqu_pay"],
  ["Zino qilish yoki zoʻrlash (tushda)","uyqu_zino"],
  ["Yalangʻoch erkak va ayollar (tushda)","uyqu_yalang"],
  ["Yaqinlari bilan yaqinlik (tushda)","uyqu_yaqin"],
  ["Yonida kimdir yotgandek tuyulishi","uyqu_yonida"],
  ["Uyquda nimadir bosishi","uyqu_bosish"],
  ["Bakirish, ovozi chiqmay qolishi","uyqu_bakirish"],
];
const ONGI_SYMPTOMS = [
  ["Maʼlum vaqtda bosh ogʻrigʻi","ongi_bosh"],
  ["Holsizlik, charchoq, tinimсiz uyqu","ongi_holsiz"],
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
const MALUMOT_DATA = {
  domla: {
    title:"👳 Sayfulloh domla haqida",
    body:`🔹 Oʻzbekiston Xalq Tabobati Assotsiatsiyasining rasmiy aʼzosi

🎓 Taʼlim va malaka:
Oliy maʼlumotli mutaxassis — Misr, Saudiya Arabistoni, Turkiya, Moskva va Sankt-Peterburgda tahsil olgan.

🌟 Ixtisosligi:
"Ruhiy bezovtalik muolajasi" sohasida chuqur ilmiy izlanishlar.

✅ Koʻzga koʻringan tajribali Roqiy sifatida eʼtirof etilgan.`
  },
  markaz: {
    title:"🏥 \"TIB VA DAM\" markazi",
    body:`📍 Yangi Toshkent, Gulzor MFY
Moʻljal: Yangi Qoʻyliq bozori, Food City koʻchasi

🕐 Qabul: Jumaday tashqari har kuni
• Ertalab: 07:00
• Kechqurun: 20:00`
  },
  manzil: {
    title:"📍 Manzil",
    body:`Yangi Toshkent, Gulzor MFY
Moʻljal: Yangi Qoʻyliq bozori, Food City koʻchasi

🕐 Jumaday tashqari har kuni: 07:00 va 20:00`,
    map: true, lat: 41.3264, lon: 69.3728,
  },
};

/* ── HOLAT ─────────────────────────────────────────────────────── */
const state = {
  registered:        false,
  reg_data:          null,
  tg_id:             null,
  analysis_id:       null,
  ruqiya_session_id: null,
  uyqu_selected:     new Set(),
  ongi_selected:     new Set(),
  xonadon_selected:  new Set(),
  complaint:         "",
  all_labels:        [],
  remaining_labels:  [],
  rag_answer:        "",
  rw_selected:       new Set(),
  ds_selected:       new Set(),
  tr_resolved:       new Set(),
  offline_date:      "",
  offline_time:      "",
  session_num:       0,
  after_resolved:    new Set(),
};

/* ── NAVIGATSIYA ───────────────────────────────────────────────── */
const PROGRESS = {
  "s-menu":0,"s-register":10,"s-uyqu":22,"s-ongi":40,"s-xonadon":58,
  "s-complaint":72,"s-loading":77,"s-result":82,"s-ruqiya-intro":84,
  "s-ruqiya-listen":86,"s-ruqiya-check":88,"s-reaction-words":90,
  "s-during-symptoms":94,"s-tracking":95,"s-offline":95,
  "s-after-listen":97,"s-history":60,"s-malumot":5,
  "s-malumot-detail":5,"s-savol":5,"s-final":100,
};
const BACK = {
  "s-register":"s-menu","s-uyqu":"s-menu","s-ongi":"s-uyqu",
  "s-xonadon":"s-ongi","s-complaint":"s-xonadon","s-result":"s-menu",
  "s-ruqiya-intro":"s-menu","s-ruqiya-listen":"s-ruqiya-intro",
  "s-ruqiya-check":"s-ruqiya-intro","s-reaction-words":"s-ruqiya-intro",
  "s-during-symptoms":"s-reaction-words","s-tracking":"s-menu",
  "s-offline":"s-menu","s-after-listen":"s-ruqiya-listen",
  "s-history":"s-ruqiya-listen","s-malumot":"s-menu",
  "s-malumot-detail":"s-malumot","s-savol":"s-menu","s-final":"s-menu",
};
let currentScreen = "";

function el(id) { return document.getElementById(id); }

function go(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const next = el(id);
  if (!next) { console.error("Screen topilmadi:", id); return; }
  next.classList.add("active");
  currentScreen = id;
  window.scrollTo({ top:0 });
  const pct = PROGRESS[id] || 0;
  document.querySelectorAll(".progress-fill").forEach(e => e.style.width = pct + "%");
  document.querySelectorAll(".progress-label").forEach(e => e.textContent = pct ? pct+"%" : "");
  const bb = el("back-bar");
  if (bb) bb.style.display = id === "s-menu" ? "none" : "block";
  if (tg) id === "s-menu" ? tg.BackButton.hide() : tg.BackButton.show();
  // Render on open
  if (id === "s-uyqu")            renderSymptoms("uyqu-list",    UYQU_SYMPTOMS,    state.uyqu_selected,    "uyqu-count");
  if (id === "s-ongi")            renderSymptoms("ongi-list",    ONGI_SYMPTOMS,    state.ongi_selected,    "ongi-count");
  if (id === "s-xonadon")         renderSymptoms("xonadon-list", XONADON_SYMPTOMS, state.xonadon_selected, "xonadon-count");
  if (id === "s-complaint")       renderComplaintSummary();
  if (id === "s-result")          renderResult();
  if (id === "s-reaction-words")  renderChips("rw-grid", REACTION_WORDS,    state.rw_selected, "word-chip", "rw-count");
  if (id === "s-during-symptoms") renderChips("ds-grid", DURING_SYMPTOMS,   state.ds_selected, "chip",      "ds-count");
  if (id === "s-tracking")        renderTracking();
  if (id === "s-offline")         renderOffline();
  if (id === "s-after-listen")    renderAfterListen();
  if (id === "s-history")         renderHistory();
}

function requireReg(dest) {
  const needReg = ["s-uyqu","s-ongi","s-xonadon","s-complaint","s-result",
    "s-ruqiya-intro","s-ruqiya-listen","s-reaction-words",
    "s-during-symptoms","s-tracking","s-offline","s-after-listen","s-history"];
  if (needReg.includes(dest) && !state.registered) { go("s-register"); return true; }
  return false;
}

/* ── YORDAMCHI ─────────────────────────────────────────────────── */
function showErr(id, msg) {
  const e = el(id);
  if (!e) return;
  e.textContent = msg;
  e.style.display = "block";
  setTimeout(() => { e.style.display = "none"; }, 3500);
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

function tagsHtml(labels, cls = "sym-tag") {
  if (!labels || !labels.length) return '<span class="muted-text">—</span>';
  return labels.map(l => `<span class="${cls}">${l}</span>`).join("");
}

function getAvailableDates(n = 6) {
  const WD = ["Yak","Dush","Sesh","Chor","Pay","Jum","Shan"];
  const out = [], d = new Date();
  d.setDate(d.getDate() + 1);
  while (out.length < n) {
    if (d.getDay() !== 5) out.push({
      iso:   d.toISOString().slice(0,10),
      label: d.toLocaleDateString("ru-RU",{day:"2-digit",month:"2-digit"}),
      wd:    WD[d.getDay()],
    });
    d.setDate(d.getDate() + 1);
  }
  return out;
}

/* ── LOCAL STORAGE ─────────────────────────────────────────────── */
function loadSessions() {
  try { return JSON.parse(localStorage.getItem("ruqiya_sessions") || "[]"); }
  catch { return []; }
}
function saveSessions(s) {
  try { localStorage.setItem("ruqiya_sessions", JSON.stringify(s)); } catch{}
}
function addSession(data) {
  const s = loadSessions(); s.push(data); saveSessions(s); return s;
}

/* ── RENDER ────────────────────────────────────────────────────── */
function renderSymptoms(cid, data, sel, countId) {
  const c = el(cid); if (!c) return;
  c.innerHTML = "";
  function upd() {
    const e = el(countId);
    if (e) e.textContent = sel.size ? `${sel.size} ta belgilandi` : "Hech narsa belgilanmadi";
  }
  data.forEach(([label, key]) => {
    const item = document.createElement("div");
    item.className = "symptom-item" + (sel.has(key) ? " checked" : "");
    item.innerHTML = `<span class="sym-box"><svg class="sym-check" viewBox="0 0 10 10" fill="none">
      <polyline points="1.5,5.5 4,8 8.5,2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg></span><span class="sym-label">${label}</span>`;
    item.addEventListener("click", () => {
      sel.has(key) ? (sel.delete(key), item.classList.remove("checked"))
                   : (sel.add(key),    item.classList.add("checked"));
      upd();
    });
    c.appendChild(item);
  });
  upd();
}

function renderChips(cid, data, sel, chipClass, countId) {
  const c = el(cid); if (!c) return;
  c.innerHTML = "";
  function upd() {
    const e = el(countId);
    if (e) e.textContent = sel.size ? `${sel.size} ta belgilandi` : "Hech narsa belgilanmadi";
  }
  data.forEach(([label, key]) => {
    const chip = document.createElement("div");
    chip.className = chipClass + (sel.has(key) ? " selected" : "");
    chip.textContent = label;
    chip.addEventListener("click", () => {
      sel.has(key) ? (sel.delete(key), chip.classList.remove("selected"))
                   : (sel.add(key),    chip.classList.add("selected"));
      upd();
    });
    c.appendChild(chip);
  });
  upd();
}

function renderComplaintSummary() {
  const c = el("complaint-summary");
  if (c) c.innerHTML = tagsHtml(getAllLabels());
}

function renderResult() {
  const labels = getAllLabels();
  state.all_labels = labels;
  const c = el("result-symptoms");
  if (c) c.innerHTML = tagsHtml(labels);
  const cnt = el("result-symptoms-count");
  if (cnt) cnt.textContent = labels.length
    ? `${labels.length} ta alomat aniqlandi`
    : "Alomatlar belgilanmadi";
  const rb = el("result-body");
  if (rb && state.rag_answer) {
    rb.style.whiteSpace = "pre-wrap";
    rb.textContent = state.rag_answer;
  }
}

function renderTracking() {
  const all = state.all_labels.length ? state.all_labels : getAllLabels();
  state.tr_resolved = new Set();
  const c = el("track-list"); if (!c) return;
  c.innerHTML = "";
  const btn = el("btn-track-save");
  if (!all.length) {
    c.innerHTML = '<p class="muted-text" style="text-align:center">Alomatlar topilmadi. Avval tahlil oʻtkazing.</p>';
    if (btn) btn.style.display = "none"; return;
  }
  if (btn) btn.style.display = "";
  function upd() {
    const s = el("track-stats");
    if (s) s.innerHTML = `
      <div class="track-stat"><span class="track-stat-label">Jami</span><span class="track-stat-val">${all.length}</span></div>
      <div class="track-stat"><span class="track-stat-label">Yoʻqoldi</span><span class="track-stat-val track-resolved">${state.tr_resolved.size}</span></div>
      <div class="track-stat"><span class="track-stat-label">Qolgan</span><span class="track-stat-val track-remaining">${all.length - state.tr_resolved.size}</span></div>`;
  }
  all.forEach((sym, i) => {
    const item = document.createElement("div");
    item.className = "symptom-item";
    item.innerHTML = `<span class="sym-box"><svg class="sym-check" viewBox="0 0 10 10" fill="none">
      <polyline points="1.5,5.5 4,8 8.5,2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg></span><span class="sym-label">${sym}</span>`;
    item.addEventListener("click", () => {
      state.tr_resolved.has(i) ? (state.tr_resolved.delete(i), item.classList.remove("checked"))
                                : (state.tr_resolved.add(i),   item.classList.add("checked"));
      upd();
    });
    c.appendChild(item);
  });
  upd();
}

function renderOffline() {
  state.offline_date = ""; state.offline_time = "";
  const grid = el("date-grid"); if (!grid) return;
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
  if (c && state.offline_date && state.offline_time) {
    c.textContent = `📅 ${state.offline_date}  ⏰ ${state.offline_time}`;
    c.style.color = "var(--gold-soft)";
  }
}

function renderAfterListen() {
  const remaining = state.remaining_labels;
  const sub = el("after-listen-sub");
  if (sub) sub.textContent = `${state.session_num}-seans • Qaysi alomatlar yaxshilandi?`;
  const sessions = loadSessions();
  const allResolved = new Set(sessions.flatMap(s => s.resolved || []));
  const total = state.all_labels.length || getAllLabels().length;
  const stats = el("session-stats");
  if (stats) stats.innerHTML = `
    <div class="track-stat"><span class="track-stat-label">Jami seans</span><span class="track-stat-val">${state.session_num}</span></div>
    <div class="track-stat"><span class="track-stat-label">Dastlabki alomatlar</span><span class="track-stat-val">${total}</span></div>
    <div class="track-stat"><span class="track-stat-label">Hozircha yoʻqolgan</span><span class="track-stat-val track-resolved">${allResolved.size}</span></div>
    <div class="track-stat"><span class="track-stat-label">Qolgan</span><span class="track-stat-val track-remaining">${remaining.length}</span></div>`;
  state.after_resolved = new Set();
  const c = el("after-symptom-list"); if (!c) return;
  c.innerHTML = "";
  const countEl = el("after-resolved-count");
  function upd() {
    if (countEl) countEl.textContent = state.after_resolved.size
      ? `${state.after_resolved.size} ta yaxshilandi` : "Hech narsa belgilanmadi";
  }
  if (!remaining.length) {
    c.innerHTML = `<div class="info-box" style="background:rgba(82,183,136,.15);border-color:rgba(82,183,136,.3);color:var(--emerald-light)">🎉 Barcha alomatlar yoʻqoldi! Allohga shukr!</div>`;
    upd(); return;
  }
  remaining.forEach((sym, i) => {
    const item = document.createElement("div");
    item.className = "symptom-item";
    item.innerHTML = `<span class="sym-box"><svg class="sym-check" viewBox="0 0 10 10" fill="none">
      <polyline points="1.5,5.5 4,8 8.5,2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg></span><span class="sym-label">${sym}</span>`;
    item.addEventListener("click", () => {
      state.after_resolved.has(i) ? (state.after_resolved.delete(i), item.classList.remove("checked"))
                                   : (state.after_resolved.add(i),   item.classList.add("checked"));
      upd();
    });
    c.appendChild(item);
  });
  upd();
}

function renderHistory() {
  const c = el("history-list"); if (!c) return;
  c.innerHTML = "";
  const sessions = loadSessions();
  const total = state.all_labels.length || getAllLabels().length;
  if (!sessions.length) {
    c.innerHTML = `<div class="history-empty">Hali hech qanday seans boʻlmagan.<br>Ruqiyani tinglashni boshlang 🎧</div>`;
    return;
  }
  const allResolved = new Set(sessions.flatMap(s => s.resolved || []));
  const pct = total > 0 ? Math.round(allResolved.size / total * 100) : 0;
  c.innerHTML = `<div class="overall-progress-card">
    <div class="overall-big-num">${pct}%</div>
    <div class="overall-label">Umumiy yaxshilanish • ${allResolved.size} ta alomat yoʻqoldi</div>
    <div class="progress-bar" style="margin-top:10px"><div class="progress-fill" style="width:${pct}%"></div></div>
  </div>`;
  [...sessions].reverse().forEach((s, idx) => {
    const num = sessions.length - idx;
    const resolved = s.resolved || [];
    const rem = s.remaining || [];
    const date = s.date ? new Date(s.date).toLocaleDateString("ru-RU",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}) : "—";
    const sPct = total > 0 ? Math.round(resolved.length / total * 100) : 0;
    const card = document.createElement("div");
    card.className = "history-card";
    card.innerHTML = `
      <div class="history-card-header">
        <span class="history-session-num">🎧 ${num}-seans</span>
        <span class="history-date">${date}</span>
      </div>
      <div class="history-progress">
        <div class="history-progress-bar"><div class="history-progress-fill" style="width:${sPct}%"></div></div>
        <span class="history-progress-label">+${resolved.length} yoʻqoldi</span>
      </div>
      ${resolved.length ? `<div style="font-size:.72rem;color:var(--tg-hint);margin-bottom:4px">✅ Yaxshilandi:</div>
        <div class="history-tags">${resolved.map(r=>`<span class="history-tag-resolved">${r}</span>`).join("")}</div>` : ""}
      ${rem.length ? `<div style="font-size:.72rem;color:var(--tg-hint);margin:6px 0 4px">🔴 Qolgan:</div>
        <div class="history-tags">${rem.slice(0,5).map(r=>`<span class="history-tag-remaining">${r}</span>`).join("")}${rem.length>5?`<span class="history-tag-remaining">+${rem.length-5} ta</span>`:""}</div>`
        : `<div class="info-box" style="margin-top:8px;padding:8px 12px;font-size:.8rem">🎉 Shu seansda barcha alomatlar yoʻqoldi!</div>`}`;
    c.appendChild(card);
  });
}

function showFinal({ icon="✅", title="", body="", extra="" } = {}) {
  const fi = el("final-icon"); if (fi) fi.textContent = icon;
  const ft = el("final-title"); if (ft) ft.textContent = title;
  const fb = el("final-body"); if (fb) fb.textContent = body;
  const fe = el("final-extra"); if (fe) fe.innerHTML = extra;
  go("s-final");
}

/* ── TAHLIL (API orqali) ───────────────────────────────────────── */
const FALLBACK_ANSWER = `🤲 Tasvirlangan belgilar ruhiy va maʼnaviy jihatdan eʼtibor talab qiladi.

🔍 Mumkin boʻlgan sabablar:
Belgilangan alomatlar ruhiy va maʼnaviy jihatdan koʻrib chiqilishi lozim.

✅ Amaliy tavsiyalar:
  - Oyatul-Kursiy, Falaq va Nos suralarini oʻqing
  - Namoz va zikrni muntazam ado eting
  - Sabr va Allohga tavassal qiling

🌟 Online ruqiyani 11 kun davomida tong va kechqurun tinglash tavsiya etiladi.
Agar oʻzgarish sezilmasa, shaxsiy offline ruqiya seansiga yozilishingiz mumkin.
Alloh taolo shifo va baraka bersin.`;

async function runAnalysis(payload) {
  if (!API_BASE) return FALLBACK_ANSWER;
  const timeoutP = new Promise(r => setTimeout(() => r(null), 15000));
  try {
    const res = await Promise.race([apiFetch("/api/analyze","POST",payload), timeoutP]);
    if (res?.ok && res.answer) {
      if (res.analysis_id) state.analysis_id = res.analysis_id;
      return res.answer;
    }
    return FALLBACK_ANSWER;
  } catch(e) {
    return FALLBACK_ANSWER;
  }
}

/* ── AUDIO PLAYER ──────────────────────────────────────────────── */
function initAudioPlayer() {
  const audio     = el("ruqiya-audio");
  const playBtn   = el("audio-play-btn");
  const playIcon  = el("audio-play-icon");
  const pauseIcon = el("audio-pause-icon");
  const progress  = el("audio-progress");
  const timeEl    = el("audio-time");
  const noFile    = el("audio-no-file");
  if (!audio || !playBtn) return;
  if (!AUDIO_SRC) { if (noFile) noFile.style.display="block"; playBtn.style.opacity="0.3"; playBtn.style.pointerEvents="none"; return; }
  audio.src = AUDIO_SRC;
  function fmt(s) { const m=Math.floor(s/60),sec=Math.floor(s%60); return `${m}:${String(sec).padStart(2,"0")}`; }
  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const pct = audio.currentTime / audio.duration * 100;
    if (progress) progress.style.width = pct + "%";
    if (timeEl)   timeEl.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
  });
  audio.addEventListener("ended", () => {
    if (playIcon)  playIcon.style.display  = "";
    if (pauseIcon) pauseIcon.style.display = "none";
    if (progress)  progress.style.width    = "0%";
    state.session_num += 1;
    state.after_resolved = new Set();
    if (!state.remaining_labels.length) {
      state.remaining_labels = [...(state.all_labels.length ? state.all_labels : getAllLabels())];
    }
    go("s-after-listen");
  });
  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      if (playIcon)  playIcon.style.display  = "none";
      if (pauseIcon) pauseIcon.style.display = "";
    } else {
      audio.pause();
      if (playIcon)  playIcon.style.display  = "";
      if (pauseIcon) pauseIcon.style.display = "none";
    }
  });
  const bar = document.querySelector(".audio-progress-bar");
  if (bar) bar.addEventListener("click", e => {
    if (!audio.duration) return;
    const rect = bar.getBoundingClientRect();
    audio.currentTime = (e.clientX - rect.left) / rect.width * audio.duration;
  });
}

/* ── SERVER SYNC ───────────────────────────────────────────────── */
async function loadUserOnStart() {
  if (!API_BASE) return;
  const initData = getInitData();
  if (initData) {
    try {
      const match = initData.match(/user=([^&]+)/);
      if (match) state.tg_id = JSON.parse(decodeURIComponent(match[1])).id || null;
    } catch(e) { console.warn("initData parse:", e); }
  }
  if (!state.tg_id) return;
  try {
    const [userRes, analysisRes, trackRes] = await Promise.all([
      apiFetch(`/api/user/${state.tg_id}`),
      apiFetch(`/api/analysis/${state.tg_id}`),
      apiFetch(`/api/tracking/${state.tg_id}`),
    ]);
    if (userRes?.ok && userRes.user) {
      state.registered = true;
      if (analysisRes?.ok && analysisRes.analysis) {
        state.analysis_id = analysisRes.analysis.id;
        state.all_labels  = analysisRes.analysis.symptoms || [];
      }
      if (trackRes?.ok && trackRes.history?.length) {
        state.remaining_labels = trackRes.history[0].remaining_symptoms || [];
        state.session_num      = trackRes.history.length;
        saveSessions(trackRes.history.map((h,i) => ({
          session_num: i+1, date: h.tracked_at,
          resolved: h.resolved_symptoms || [], remaining: h.remaining_symptoms || [],
          total: state.all_labels.length,
        })));
      }
    }
  } catch(e) { console.warn("loadUserOnStart:", e); }
}

/* ═══════════════════════════════════════════════════════════════
   DOMContentLoaded — BARCHA LISTENERS SHU YERDA
   ═══════════════════════════════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", () => {

  /* Telegram back button */
  if (tg) tg.BackButton.onClick(() => { const t = BACK[currentScreen]; if (t) go(t); });

  /* Nativе Orqaga tugmasi */
  el("btn-back-native")?.addEventListener("click", () => { const t = BACK[currentScreen]; if (t) go(t); });

  /* data-goto universal listener */
  document.addEventListener("click", e => {
    const target = e.target.closest("[data-goto]");
    if (!target) return;
    const dest = target.dataset.goto;
    if (requireReg(dest)) return;
    go(dest);
  });

  /* Menu kartalar */
  document.querySelectorAll(".menu-card[data-goto]").forEach(card => {
    card.addEventListener("click", () => {
      if (requireReg(card.dataset.goto)) return;
      go(card.dataset.goto);
    });
  });

  /* REGISTER */
  el("btn-reg-submit")?.addEventListener("click", () => {
    const name   = el("reg-name")?.value.trim();
    const age    = el("reg-age")?.value.trim();
    const region = el("reg-region")?.value.trim();
    const phone  = el("reg-phone")?.value.trim();
    if (!name || name.length < 3) return showErr("reg-error", "Ism kamida 3 ta harf boʻlsin");
    if (!age || isNaN(age) || +age < 5 || +age > 120) return showErr("reg-error", "Yoshni toʻgʻri kiriting");
    if (!region) return showErr("reg-error", "Viloyatni kiriting");
    if (!phone)  return showErr("reg-error", "Telefon raqamini kiriting");
    state.registered = true;
    state.reg_data   = { full_name:name, age:+age, region, phone };
    const tgId = getTgId();
    apiFetch("/api/register","POST",{
      ...state.reg_data,
      tg_id:    tgId,
      username: tg?.initDataUnsafe?.user?.username || "",
    }).then(r => {
      if (r?.ok) {
        state.tg_id = r.user?.telegram_id || tgId;
        console.log("✅ Roʻyxatdan oʻtish saqlandi, tg_id:", state.tg_id);
      } else {
        console.warn("⚠️ Register API xatolik");
      }
    });
    go("s-uyqu");
  });

  /* COMPLAINT / TAHLIL */
  el("btn-complaint-submit")?.addEventListener("click", () => {
    const txt = el("complaint-text")?.value.trim();
    if (!txt || txt.length < 10) return showErr("complaint-error", "Kamida 10 ta belgi kiriting");
    state.complaint  = txt;
    state.all_labels = getAllLabels();
    go("s-loading");

    const payload = {
      uyqu_symptoms:    getLabels(UYQU_SYMPTOMS,    state.uyqu_selected),
      ongi_symptoms:    getLabels(ONGI_SYMPTOMS,    state.ongi_selected),
      xonadon_symptoms: getLabels(XONADON_SYMPTOMS, state.xonadon_selected),
      all_symptoms:     state.all_labels,
      complaint:        txt,
    };

    // Loading matnini o'zgartirish
    const msgs = [
      ["Tahlil qilinmoqda...","Biroz sabr qiling"],
      ["Maʼlumotlar tahlil qilinmoqda...","10-15 soniya ketishi mumkin"],
      ["Javob shakllantirilmoqda...","Deyarli tayyor..."],
    ];
    let mi = 0;
    const iv = setInterval(() => {
      mi = (mi+1) % msgs.length;
      const lt = el("loading-text"), ls = el("loading-sub");
      if (lt) lt.textContent = msgs[mi][0];
      if (ls) ls.textContent = msgs[mi][1];
    }, 4000);

    runAnalysis(payload).then(answer => {
      clearInterval(iv);
      state.rag_answer = answer;
      go("s-result");
    }).catch(() => {
      clearInterval(iv);
      state.rag_answer = FALLBACK_ANSWER;
      go("s-result");
    });
  });

  /* RUQIYA */
  el("btn-ruqiya-listen")?.addEventListener("click", () => go("s-ruqiya-listen"));
  el("btn-ruqiya-11kun")?.addEventListener("click",  () => go("s-ruqiya-check"));
  el("btn-ruqiya-check")?.addEventListener("click",  () => go("s-ruqiya-check"));

  /* 11 kun effect */
  document.querySelectorAll(".effect-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const effect = btn.dataset.effect;
      apiFetch("/api/tracking","POST",{ tracking_type:"online", overall_status: effect==="yes"?"better":effect==="no"?"worse":"same", resolved_symptoms:[], remaining_symptoms:[], analysis_id: state.analysis_id });
      if (effect === "yes") {
        showFinal({ icon:"✅", title:"Allohga shukr!", body:"Ruqiya taʼsir qilmoqda — davom eting!\nAlomatlaringizni kuzatib boring." });
      } else if (effect === "continue") {
        showFinal({ icon:"⏳", title:"Davo jarayoni davom etmoqda", body:"Ruqiyani davom ettiring. 11 kundan keyin qayta tekshiring." });
      } else {
        showFinal({
          icon:"🏥", title:"Shaxsan tashrif tavsiya etiladi",
          body:"Onlayn ruqiya yordam bermagan boʻlsa, shaxsiy offline ruqiya seansiga yoziling.\n\n📍 Yangi Toshkent, Gulzor MFY\n🕐 Jumaday tashqari har kuni: 07:00 va 20:00",
          extra:`<button class="btn btn-primary" onclick="go('s-offline')" style="margin-top:12px">📅 Tashrif yozilish</button>`,
        });
      }
    });
  });

  /* REACTION WORDS — ds-save */
  el("btn-ds-save")?.addEventListener("click", () => {
    const rwLabels = getLabels(REACTION_WORDS,  state.rw_selected);
    const dsLabels = getLabels(DURING_SYMPTOMS, state.ds_selected);
    apiFetch("/api/session","POST",{
      analysis_id: state.analysis_id, session_type:"online",
      reaction_words: rwLabels, during_symptoms: dsLabels,
    }).then(r => { if (r?.ok) state.ruqiya_session_id = r.session_id; });
    showFinal({
      icon:"✅", title:"Ruqiya natijasi saqlandi",
      body:"11 kun davomida tong va kechqurun tinglang.\nAlloh shifo bersin! 🤲",
      extra: [
        rwLabels.length ? `<div style="margin-bottom:8px"><div class="card-title" style="font-size:.72rem;color:var(--gold);margin-bottom:6px">🔴 REAKTSIYA KALIMLARI</div><div class="sym-summary">${tagsHtml(rwLabels)}</div></div>` : "",
        dsLabels.length ? `<div><div class="card-title" style="font-size:.72rem;color:var(--gold);margin-bottom:6px">🟡 RUQIYA PAYTIDAGI ALOMATLAR</div><div class="sym-summary">${tagsHtml(dsLabels)}</div></div>` : "",
      ].join(""),
    });
  });

  /* TRACKING save */
  el("btn-track-save")?.addEventListener("click", () => {
    const all = state.all_labels.length ? state.all_labels : getAllLabels();
    const resolved  = all.filter((_,i) => state.tr_resolved.has(i));
    const remaining = all.filter((_,i) => !state.tr_resolved.has(i));
    const status    = !remaining.length || resolved.length > remaining.length ? "better" : "same";
    apiFetch("/api/tracking","POST",{
      tracking_type:"online", resolved_symptoms:resolved,
      remaining_symptoms:remaining, overall_status:status,
      analysis_id: state.analysis_id,
    });
    showFinal({
      icon: status==="better"?"📈":"📊",
      title:"Kuzatuv saqlandi",
      body: status==="better" ? "Allohga shukr! Ahvolingiz yaxshilanmoqda. ✅" : "Ruqiyani davom ettiring. ⏳",
      extra:`
        <div style="margin-bottom:8px"><div class="card-title" style="font-size:.72rem;color:var(--gold);margin-bottom:6px">✅ YOʻQOLGAN (${resolved.length})</div><div class="sym-summary">${tagsHtml(resolved)}</div></div>
        <div><div class="card-title" style="font-size:.72rem;color:var(--gold);margin-bottom:6px">🔴 QOLGAN (${remaining.length})</div><div class="sym-summary">${tagsHtml(remaining)}</div></div>
        ${remaining.length?`<button class="btn btn-secondary" onclick="go('s-offline')" style="margin-top:12px">📅 Offlayn tashrif</button>`:""}`,
    });
  });

  /* AFTER LISTEN save */
  el("btn-after-save")?.addEventListener("click", () => {
    const remaining = state.remaining_labels;
    const resolved  = [...state.after_resolved].map(i => remaining[i]).filter(Boolean);
    const newRem    = remaining.filter((_,i) => !state.after_resolved.has(i));
    state.remaining_labels = newRem;
    const status = !newRem.length || resolved.length > 0 ? "better" : "same";
    const sessionData = { session_num:state.session_num, date:new Date().toISOString(), resolved, remaining:newRem, total:state.all_labels.length||getAllLabels().length };
    addSession(sessionData);
    apiFetch("/api/tracking","POST",{
      tracking_type:"online", session_num:state.session_num,
      resolved_symptoms:resolved, remaining_symptoms:newRem,
      overall_status:status, analysis_id:state.analysis_id,
      ruqiya_session_id:state.ruqiya_session_id,
    });
    if (!newRem.length) {
      showFinal({ icon:"🎉", title:"Barcha alomatlar yoʻqoldi!", body:`Allohga shukr! Siz ${state.session_num} seans tingladi.\nAlloh taolo Sizi Oʻz rahmatida asrasin! 🤲`,
        extra:`<button class="btn btn-secondary" onclick="go('s-history')" style="margin-top:12px">📈 Tarixni koʻrish</button>` });
    } else if (resolved.length) {
      showFinal({ icon:"📈", title:`${state.session_num}-seans saqlandi!`,
        body:`✅ ${resolved.length} ta alomat yaxshilandi\n🔴 ${newRem.length} ta alomat qoldi\n\nRuqiyani tinglashni davom eting. Alloh shifo bersin! 🤲`,
        extra:`<button class="btn btn-primary" onclick="go('s-ruqiya-listen')" style="margin-top:12px">🎧 Keyingi seans</button>
               <button class="btn btn-secondary" onclick="go('s-history')" style="margin-top:8px">📈 Tarixni koʻrish</button>` });
    } else {
      showFinal({ icon:"⏳", title:`${state.session_num}-seans saqlandi`,
        body:"Bu seansda oʻzgarish sezilmadi. Davom eting — ruqiya vaqt talab qiladi.\n\nAlloh shifo bersin! 🤲",
        extra:`<button class="btn btn-primary" onclick="go('s-ruqiya-listen')" style="margin-top:12px">🎧 Keyingi seans</button>` });
    }
  });

  /* OFFLINE confirm */
  el("btn-offline-confirm")?.addEventListener("click", () => {
    if (!state.offline_date) return showErr("offline-error", "Sanani tanlang");
    if (!state.offline_time) return showErr("offline-error", "Vaqtni tanlang");
    apiFetch("/api/offline","POST",{ visit_date:state.offline_date, visit_time:state.offline_time, analysis_id:state.analysis_id });
    showFinal({ icon:"✅", title:"Tashrif tasdiqlandi!",
      body:`📅 ${state.offline_date}  ⏰ ${state.offline_time}\n📍 Yangi Toshkent, Gulzor MFY\n\nMenejer siz bilan bogʻlanadi.` });
  });

  /* SAVOL */
  el("btn-savol-submit")?.addEventListener("click", () => {
    const txt = el("savol-text")?.value.trim();
    if (!txt || txt.length < 5) return showErr("savol-error", "Savolingizni kiriting");
    apiFetch("/api/savol","POST",{ question:txt });
    el("savol-text").value = "";
    showFinal({ icon:"📨", title:"Savolingiz yuborildi!", body:"Menejerimiz yaqin orada javob beradi." });
  });

  /* MA'LUMOTLAR */
  document.querySelectorAll(".info-card-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const data = MALUMOT_DATA[btn.dataset.info];
      if (!data) return;
      const c = el("malumot-content");
      if (c) c.innerHTML = `<div class="result-title">${data.title}</div>
        <div class="result-body" style="white-space:pre-line">${data.body}</div>`;
      const mw = el("map-container"), mf = el("map-iframe");
      if (mw && mf) {
        if (data.map) { mf.src=`https://maps.google.com/maps?q=${data.lat},${data.lon}&z=16&output=embed`; mw.style.display="block"; }
        else mw.style.display = "none";
      }
      go("s-malumot-detail");
    });
  });

  /* ONLINE RUQIYA — natija ekranidan */
  el("btn-choose-online")?.addEventListener("click", () => go("s-ruqiya-intro"));

  /* YOPISH */
  el("btn-close")?.addEventListener("click", () => { if (tg) tg.close(); });

  /* ISHGA TUSHIRISH */
  loadUserOnStart();
  go("s-menu");
  initAudioPlayer();
});
