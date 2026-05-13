/* ═══════════════════════════════════════════════════════════════════════════
   app.js — TIB va DAM Mini App
   Telegram WebApp SDK orqali bot bilan aloqa
   ═══════════════════════════════════════════════════════════════════════════ */

const tg = window.Telegram?.WebApp;

// ── TELEGRAM SETUP ───────────────────────────────────────────────────────────
if (tg) {
  tg.ready();
  tg.expand();
  tg.enableClosingConfirmation();
}

// ── ALOMATLAR MA'LUMOTLARI ────────────────────────────────────────────────────
const UYQU_SYMPTOMS = [
  ["Uyquga ketishi bilan choʻchib uyg'onish",       "uyqu_chochib"],
  ["Uyquda yurak havliqib uyg'onish",               "uyqu_yurak"],
  ["Ilon yoki ilonlarning hujum qilishi",           "uyqu_ilon"],
  ["It, mushuk (tushda)",                           "uyqu_it_mushuk"],
  ["Sichqon, kalamush (tushda)",                    "uyqu_sichqon"],
  ["Chayon, kaltakesak (tushda)",                   "uyqu_chayon"],
  ["Tushunarsiz junli hayvonlar",                   "uyqu_junli"],
  ["Hojatxona, ahlatxona (tushda)",                 "uyqu_hojatxona"],
  ["Suqmoq yoʻllar (tushda)",                       "uyqu_suqmoq"],
  ["Qabristonlar (tushda)",                         "uyqu_qabriston"],
  ["Mayitlar, chaqaloqlar (tushda)",                "uyqu_mayit"],
  ["Loyqa suvlar (tushda)",                         "uyqu_loyqa"],
  ["Yongʻin, falokat (tushda)",                     "uyqu_yongin"],
  ["Suvga choʻkish (tushda)",                       "uyqu_suvga"],
  ["Tushunarsiz tugamas yoʻllar",                   "uyqu_tugamas"],
  ["Uyquda ovoz chiqarish",                         "uyqu_ovoz"],
  ["Uyquda sovuq otish yoki terlash",               "uyqu_sovuq"],
  ["Pay yoki tomir tortib qolishi",                 "uyqu_pay"],
  ["Zino qilish yoki zoʻrlash (tushda)",            "uyqu_zino"],
  ["Yalangʻoch erkak va ayollar (tushda)",          "uyqu_yalangoch"],
  ["Yaqinlari bilan yaqinlik (tushda)",             "uyqu_yaqinlik"],
  ["Yonida kimdir yotgandek tuyulishi",             "uyqu_yonida"],
  ["Uyquda nimadir bosishi",                        "uyqu_bosish"],
  ["Bakirish, ovozi chiqmay qolishi",               "uyqu_bakirish"],
];

const ONGI_SYMPTOMS = [
  ["Maʼlum vaqtda bosh ogʻrigʻi",                  "ongi_bosh"],
  ["Holsizlik, charchoq, tinimсiz uyqu kelishi",    "ongi_holsiz"],
  ["Tez asabiylashtish",                            "ongi_asabiy"],
  ["Sababsiz yurak siqilishi",                      "ongi_yurak"],
  ["Ogʻriqlar koʻchib yurishi",                     "ongi_oghriq"],
  ["Yelka kuraklarda yuk bordek yurish",            "ongi_elka"],
  ["Koʻp esnash, kekirish",                         "ongi_esnash"],
  ["Yurak atroflarida ogʻriq sanchiq",              "ongi_sanchiq"],
  ["Qoʻl-oyoq uyushish",                            "ongi_uyush"],
  ["Er-xotin aloqasi buzilishi",                    "ongi_aloqa"],
];

const XONADON_SYMPTOMS = [
  ["Ayrim xonalarda bezovtalik",                    "xon_xona"],
  ["Yotoq xonada bezovtalik",                       "xon_yotoq"],
  ["Hammom va hojatxonada qoʻrquv",                 "xon_hammom"],
  ["Ishxonada bezovtalik",                          "xon_ish"],
  ["Qoʻrquv turishi",                               "xon_qorquv"],
  ["Yurak siqilishi (xonada)",                      "xon_yurak"],
  ["Koʻzga sharpa koʻrinishi",                      "xon_sharpa"],
  ["Ovoz eshitilishi (xonada)",                     "xon_ovoz"],
  ["Tezroq chiqib ketgisi kelishi",                 "xon_chiqish"],
  ["Koʻchada yaxshi, uyda yomon",                   "xon_kuchada"],
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

// ── HOLAT ─────────────────────────────────────────────────────────────────────
const state = {
  // ro'yxatdan o'tish
  reg: { full_name: "", age: "", region: "", phone: "" },
  // alomatlar
  uyqu_selected:    new Set(),
  ongi_selected:    new Set(),
  xonadon_selected: new Set(),
  complaint: "",
  // tahlil natijasi
  analysis_id: null,
  rag_answer: "",
  // ruqiya
  rw_selected: new Set(),
  ds_selected: new Set(),
  ruqiya_session_id: null,
  // kuzatuv
  tr_resolved: new Set(),
  tracking_type: "online",
  // tashrif
  offline_date: "",
  offline_time: "",
};

// ── EKRANLAR ──────────────────────────────────────────────────────────────────
const screens = {};
document.querySelectorAll(".screen").forEach(el => {
  screens[el.id] = el;
});

let currentScreen = "screen-menu";

function showScreen(id, direction = "forward") {
  const prev = screens[currentScreen];
  const next = screens[id];
  if (!next) return;
  if (prev) prev.classList.remove("active");
  next.classList.add("active");
  currentScreen = id;
  window.scrollTo({ top: 0, behavior: "smooth" });
  updateProgress(id);

  // Telegram back button
  const noBack = ["screen-menu", "screen-register", "screen-result-final"];
  if (tg) {
    if (noBack.includes(id)) tg.BackButton.hide();
    else tg.BackButton.show();
  }
}

// ── PROGRESS ──────────────────────────────────────────────────────────────────
const PROGRESS_MAP = {
  "screen-menu": 0,
  "screen-register": 10,
  "screen-uyqu": 25,
  "screen-ongi": 45,
  "screen-xonadon": 60,
  "screen-complaint": 70,
  "screen-loading": 75,
  "screen-result": 80,
  "screen-ruqiya-intro": 82,
  "screen-reaction-words": 88,
  "screen-during-symptoms": 93,
  "screen-tracking": 95,
  "screen-offline": 97,
  "screen-result-final": 100,
};

function updateProgress(screenId) {
  const pct = PROGRESS_MAP[screenId] ?? 0;
  document.querySelectorAll(".progress-fill").forEach(el => {
    el.style.width = pct + "%";
  });
  document.querySelectorAll(".progress-label").forEach(el => {
    el.textContent = pct > 0 ? `${pct}%` : "";
  });
}

// ── BACK BUTTON ───────────────────────────────────────────────────────────────
const BACK_MAP = {
  "screen-register":       "screen-menu",
  "screen-uyqu":           "screen-menu",
  "screen-ongi":           "screen-uyqu",
  "screen-xonadon":        "screen-ongi",
  "screen-complaint":      "screen-xonadon",
  "screen-result":         "screen-menu",
  "screen-ruqiya-intro":   "screen-result",
  "screen-reaction-words": "screen-ruqiya-intro",
  "screen-during-symptoms":"screen-reaction-words",
  "screen-tracking":       "screen-result",
  "screen-offline":        "screen-result",
};

if (tg) {
  tg.BackButton.onClick(() => {
    const target = BACK_MAP[currentScreen];
    if (target) showScreen(target);
  });
}

// ── SYMPTOM LIST RENDERER ─────────────────────────────────────────────────────
function renderSymptomList(containerId, data, selectedSet, countId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  data.forEach(([label, key]) => {
    const item = document.createElement("label");
    item.className = "symptom-item" + (selectedSet.has(key) ? " checked" : "");
    item.innerHTML = `
      <input type="checkbox" ${selectedSet.has(key) ? "checked" : ""}>
      <span class="sym-box">
        <svg class="sym-check" viewBox="0 0 10 10" fill="none">
          <polyline points="1.5,5.5 4,8 8.5,2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="sym-label">${label}</span>`;
    item.addEventListener("click", () => {
      selectedSet.has(key) ? selectedSet.delete(key) : selectedSet.add(key);
      item.classList.toggle("checked");
      item.querySelector("input").checked = selectedSet.has(key);
      if (countId) {
        document.getElementById(countId).textContent = selectedSet.size
          ? `${selectedSet.size} ta belgilandi`
          : "Hech narsa belgilanmadi";
      }
    });
    container.appendChild(item);
  });
}

// ── CHIP/WORD RENDERER ────────────────────────────────────────────────────────
function renderChips(containerId, data, selectedSet, className = "chip") {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";
  data.forEach(([label, key]) => {
    const chip = document.createElement("div");
    chip.className = className + (selectedSet.has(key) ? " selected" : "");
    chip.textContent = label;
    chip.addEventListener("click", () => {
      selectedSet.has(key) ? selectedSet.delete(key) : selectedSet.add(key);
      chip.classList.toggle("selected");
    });
    container.appendChild(chip);
  });
}

// ── ALL LABELS ────────────────────────────────────────────────────────────────
function getAllLabels() {
  const labels = [];
  UYQU_SYMPTOMS.forEach(([l, k])    => { if (state.uyqu_selected.has(k))    labels.push(l); });
  ONGI_SYMPTOMS.forEach(([l, k])    => { if (state.ongi_selected.has(k))    labels.push(l); });
  XONADON_SYMPTOMS.forEach(([l, k]) => { if (state.xonadon_selected.has(k)) labels.push(l); });
  return labels;
}

function getSelectedLabels(data, selectedSet) {
  return data.filter(([, k]) => selectedSet.has(k)).map(([l]) => l);
}

// ── BOT BILAN ALOQA ───────────────────────────────────────────────────────────
function sendToBot(action, payload = {}) {
  if (tg) {
    tg.sendData(JSON.stringify({ action, ...payload }));
  } else {
    console.log("[sendData]", { action, ...payload });
  }
}

// ── DATE HELPERS ──────────────────────────────────────────────────────────────
function getAvailableDates(count = 7) {
  const days_uz = ["Yak","Dush","Sesh","Chor","Pay","Jum","Shan"];
  const dates = [];
  let d = new Date(); d.setDate(d.getDate() + 1);
  while (dates.length < count) {
    if (d.getDay() !== 5) { // not Friday
      dates.push({
        iso:   d.toISOString().slice(0,10),
        label: d.toLocaleDateString("uz-UZ", { day:"2-digit", month:"2-digit" }),
        wd:    days_uz[d.getDay()],
      });
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN INITIALIZERS
// ═══════════════════════════════════════════════════════════════════════════════

// ── MENU ──────────────────────────────────────────────────────────────────────
function initMenu() {
  document.getElementById("btn-menu-analysis")?.addEventListener("click", () => {
    renderSymptomList("uyqu-list", UYQU_SYMPTOMS, state.uyqu_selected, "uyqu-count");
    showScreen("screen-uyqu");
  });
  document.getElementById("btn-menu-ruqiya")?.addEventListener("click", () => {
    showScreen("screen-ruqiya-intro");
  });
  document.getElementById("btn-menu-offline")?.addEventListener("click", () => {
    initOfflineScreen();
    showScreen("screen-offline");
  });
  document.getElementById("btn-menu-tracking")?.addEventListener("click", () => {
    initTrackingScreen();
    showScreen("screen-tracking");
  });
}

// ── REGISTER ──────────────────────────────────────────────────────────────────
function initRegister() {
  document.getElementById("btn-register-submit")?.addEventListener("click", () => {
    const name  = document.getElementById("reg-name")?.value.trim();
    const age   = document.getElementById("reg-age")?.value.trim();
    const region= document.getElementById("reg-region")?.value.trim();
    const phone = document.getElementById("reg-phone")?.value.trim();

    if (!name || name.length < 3)  return showError("reg-error", "Ism kamida 3 ta harf boʻlsin");
    if (!age  || isNaN(age))        return showError("reg-error", "Yoshni toʻgʻri kiriting");
    if (!region)                    return showError("reg-error", "Viloyatni kiriting");
    if (!phone)                     return showError("reg-error", "Telefon raqamini kiriting");

    state.reg = { full_name: name, age: parseInt(age), region, phone };
    sendToBot("register", state.reg);
    // After register, go to analysis
    renderSymptomList("uyqu-list", UYQU_SYMPTOMS, state.uyqu_selected, "uyqu-count");
    showScreen("screen-uyqu");
  });
}

function showError(elId, msg) {
  const el = document.getElementById(elId);
  if (el) { el.textContent = msg; el.style.display = "block"; }
}

// ── UYQU ──────────────────────────────────────────────────────────────────────
function initUyqu() {
  renderSymptomList("uyqu-list", UYQU_SYMPTOMS, state.uyqu_selected, "uyqu-count");
  document.getElementById("btn-uyqu-next")?.addEventListener("click", () => {
    renderSymptomList("ongi-list", ONGI_SYMPTOMS, state.ongi_selected, "ongi-count");
    showScreen("screen-ongi");
  });
}

// ── ONGI ──────────────────────────────────────────────────────────────────────
function initOngi() {
  document.getElementById("btn-ongi-next")?.addEventListener("click", () => {
    renderSymptomList("xonadon-list", XONADON_SYMPTOMS, state.xonadon_selected, "xonadon-count");
    showScreen("screen-xonadon");
  });
}

// ── XONADON ───────────────────────────────────────────────────────────────────
function initXonadon() {
  document.getElementById("btn-xonadon-next")?.addEventListener("click", () => {
    // Show summary of selected
    const all = getAllLabels();
    const sumEl = document.getElementById("complaint-summary");
    if (sumEl) {
      sumEl.innerHTML = all.length
        ? all.map(s => `<span class="sym-tag">${s}</span>`).join("")
        : '<span style="color:var(--tg-hint);font-size:.82rem">Alomatlar belgilanmadi</span>';
    }
    showScreen("screen-complaint");
  });
}

// ── COMPLAINT ─────────────────────────────────────────────────────────────────
function initComplaint() {
  document.getElementById("btn-complaint-submit")?.addEventListener("click", () => {
    const txt = document.getElementById("complaint-text")?.value.trim();
    if (!txt || txt.length < 10) {
      return showError("complaint-error", "Batafsiroq tasvirlab bering (kamida 10 ta belgi)");
    }
    state.complaint = txt;
    showScreen("screen-loading");
    // Send to bot for analysis
    const payload = {
      uyqu_symptoms:    getSelectedLabels(UYQU_SYMPTOMS,    state.uyqu_selected),
      ongi_symptoms:    getSelectedLabels(ONGI_SYMPTOMS,    state.ongi_selected),
      xonadon_symptoms: getSelectedLabels(XONADON_SYMPTOMS, state.xonadon_selected),
      all_symptoms:     getAllLabels(),
      complaint:        txt,
    };
    sendToBot("analysis", payload);
    // Bot will respond via sendMessage; for now show waiting
    setTimeout(() => showScreen("screen-result"), 3000);
  });
}

// ── RESULT ────────────────────────────────────────────────────────────────────
function initResult() {
  // Summary
  const all = getAllLabels();
  const sumEl = document.getElementById("result-symptoms");
  if (sumEl) {
    sumEl.innerHTML = all.length
      ? all.map(s => `<span class="sym-tag">${s}</span>`).join("")
      : '<span style="color:var(--tg-hint)">—</span>';
  }

  document.getElementById("btn-result-ruqiya")?.addEventListener("click", () => {
    showScreen("screen-ruqiya-intro");
  });
  document.getElementById("btn-result-tracking")?.addEventListener("click", () => {
    initTrackingScreen();
    showScreen("screen-tracking");
  });
  document.getElementById("btn-result-offline")?.addEventListener("click", () => {
    initOfflineScreen();
    showScreen("screen-offline");
  });
}

// ── RUQIYA INTRO ──────────────────────────────────────────────────────────────
function initRuqiyaIntro() {
  document.getElementById("btn-ruqiya-reactions")?.addEventListener("click", () => {
    state.rw_selected = new Set();
    state.ds_selected = new Set();
    renderChips("rw-grid", REACTION_WORDS, state.rw_selected, "word-chip");
    showScreen("screen-reaction-words");
  });
  document.getElementById("btn-ruqiya-check")?.addEventListener("click", () => {
    showScreen("screen-result-final");
    document.getElementById("final-title").textContent = "Natijani tekshirish";
    document.getElementById("final-body").textContent =
      "Ruqiyani tinglagandan soʻng oʻzgarishlarni pastdagi kuzatuv tugmasi orqali belgilang.";
  });
}

// ── REACTION WORDS ────────────────────────────────────────────────────────────
function initReactionWords() {
  renderChips("rw-grid", REACTION_WORDS, state.rw_selected, "word-chip");
  document.getElementById("btn-rw-next")?.addEventListener("click", () => {
    renderChips("ds-grid", DURING_SYMPTOMS, state.ds_selected, "chip");
    showScreen("screen-during-symptoms");
  });
}

// ── DURING SYMPTOMS ───────────────────────────────────────────────────────────
function initDuringSymptoms() {
  document.getElementById("btn-ds-save")?.addEventListener("click", () => {
    const rwLabels = getSelectedLabels(REACTION_WORDS,  state.rw_selected);
    const dsLabels = getSelectedLabels(DURING_SYMPTOMS, state.ds_selected);
    sendToBot("ruqiya_reaction", {
      reaction_words:   rwLabels,
      during_symptoms:  dsLabels,
    });

    // Show summary screen
    const rEl = document.getElementById("final-rw");
    const dEl = document.getElementById("final-ds");
    if (rEl) rEl.innerHTML = rwLabels.length
      ? rwLabels.map(w => `<span class="sym-tag">🔴 ${w}</span>`).join("")
      : '<span style="color:var(--tg-hint)">—</span>';
    if (dEl) dEl.innerHTML = dsLabels.length
      ? dsLabels.map(w => `<span class="sym-tag">🟡 ${w}</span>`).join("")
      : '<span style="color:var(--tg-hint)">—</span>';

    document.getElementById("final-title").textContent = "✅ Natija saqlandi";
    document.getElementById("final-body").textContent =
      "11 kun davomida tong va kechqurun ruqiyani tinglang. Alloh shifo bersin! 🤲";
    showScreen("screen-result-final");
  });
}

// ── TRACKING ──────────────────────────────────────────────────────────────────
function initTrackingScreen() {
  const all = getAllLabels();
  state.tr_resolved = new Set();
  const container = document.getElementById("track-list");
  if (!container) return;
  container.innerHTML = "";

  if (!all.length) {
    container.innerHTML = '<p style="color:var(--tg-hint);font-size:.88rem;text-align:center">Alomatlar topilmadi. Avval tahlil oʻtkazing.</p>';
    return;
  }

  all.forEach((sym, i) => {
    const item = document.createElement("label");
    item.className = "symptom-item";
    item.innerHTML = `
      <input type="checkbox">
      <span class="sym-box">
        <svg class="sym-check" viewBox="0 0 10 10" fill="none">
          <polyline points="1.5,5.5 4,8 8.5,2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="sym-label">${sym}</span>`;
    item.addEventListener("click", () => {
      state.tr_resolved.has(i) ? state.tr_resolved.delete(i) : state.tr_resolved.add(i);
      item.classList.toggle("checked");
      updateTrackStats(all);
    });
    container.appendChild(item);
  });

  updateTrackStats(all);

  document.getElementById("btn-track-save")?.addEventListener("click", () => {
    const resolved  = all.filter((_, i) => state.tr_resolved.has(i));
    const remaining = all.filter((_, i) => !state.tr_resolved.has(i));
    const status    = remaining.length === 0 || resolved.length > remaining.length ? "better" : "same";
    sendToBot("symptom_tracking", {
      tracking_type:     state.tracking_type,
      resolved_symptoms: resolved,
      remaining_symptoms: remaining,
      overall_status:    status,
    });
    document.getElementById("final-title").textContent = "💾 Kuzatuv saqlandi";
    document.getElementById("final-rw").innerHTML =
      resolved.map(s => `<span class="sym-tag">✅ ${s}</span>`).join("") || '<span style="color:var(--tg-hint)">—</span>';
    document.getElementById("final-ds").innerHTML =
      remaining.map(s => `<span class="sym-tag">🔴 ${s}</span>`).join("") || '<span style="color:var(--tg-hint)">—</span>';
    document.getElementById("final-body").textContent =
      status === "better" ? "Allohga shukr! Ahvolingiz yaxshilanmoqda. ✅" : "Ruqiyani davom ettiring. ⏳";
    showScreen("screen-result-final");
  });
}

function updateTrackStats(all) {
  const res = state.tr_resolved.size;
  const rem = all.length - res;
  const el  = document.getElementById("track-stats");
  if (!el) return;
  el.innerHTML = `
    <div class="track-stat">
      <span class="track-stat-label">Jami alomatlar</span>
      <span class="track-stat-val">${all.length}</span>
    </div>
    <div class="track-stat">
      <span class="track-stat-label">Yoʻqoldi</span>
      <span class="track-stat-val track-resolved">${res}</span>
    </div>
    <div class="track-stat">
      <span class="track-stat-label">Qolgan</span>
      <span class="track-stat-val track-remaining">${rem}</span>
    </div>`;
}

// ── OFFLINE ───────────────────────────────────────────────────────────────────
function initOfflineScreen() {
  const dates = getAvailableDates(6);
  const grid  = document.getElementById("date-grid");
  if (!grid) return;
  grid.innerHTML = "";
  state.offline_date = "";
  state.offline_time = "";

  dates.forEach(({ iso, label, wd }) => {
    const btn = document.createElement("div");
    btn.className = "date-btn";
    btn.innerHTML = `<span class="date-day">${label}</span><span class="date-wd">${wd}</span>`;
    btn.addEventListener("click", () => {
      document.querySelectorAll(".date-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      state.offline_date = iso;
      updateOfflineConfirm();
    });
    grid.appendChild(btn);
  });

  document.querySelectorAll(".time-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".time-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      state.offline_time = btn.dataset.time;
      updateOfflineConfirm();
    });
  });

  document.getElementById("btn-offline-confirm")?.addEventListener("click", () => {
    if (!state.offline_date) return showError("offline-error", "Sanani tanlang");
    if (!state.offline_time) return showError("offline-error", "Vaqtni tanlang");
    sendToBot("offline_visit", {
      visit_date: state.offline_date,
      visit_time: state.offline_time,
    });
    document.getElementById("final-title").textContent = "✅ Tashrif tasdiqlandi!";
    document.getElementById("final-rw").innerHTML = "";
    document.getElementById("final-ds").innerHTML = "";
    document.getElementById("final-body").textContent =
      `📅 ${state.offline_date} | ⏰ ${state.offline_time}\n📍 Yangi Toshkent, Gulzor MFY\n\nMenejer siz bilan bogʻlanadi.`;
    showScreen("screen-result-final");
  });
}

function updateOfflineConfirm() {
  const el = document.getElementById("offline-confirm-text");
  if (!el) return;
  if (state.offline_date && state.offline_time) {
    el.textContent = `📅 ${state.offline_date} | ⏰ ${state.offline_time}`;
    el.style.color = "var(--gold-soft)";
  }
}

// ── FINAL SCREEN ──────────────────────────────────────────────────────────────
function initFinalScreen() {
  document.getElementById("btn-final-menu")?.addEventListener("click", () => {
    showScreen("screen-menu");
  });
  document.getElementById("btn-final-close")?.addEventListener("click", () => {
    if (tg) tg.close();
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initRegister();
  initUyqu();
  initOngi();
  initXonadon();
  initComplaint();
  initResult();
  initRuqiyaIntro();
  initReactionWords();
  initDuringSymptoms();
  initFinalScreen();

  // Start screen
  showScreen("screen-menu");
});
