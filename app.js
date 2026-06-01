/* TIB VA DAM — Mini App */

const tg = window.Telegram?.WebApp || null;
if (tg) { tg.ready(); tg.expand(); tg.enableClosingConfirmation(); }

const API   = 'https://ruhiyat-production.up.railway.app';
const AUDIO = (typeof RUQIYA_AUDIO_URL !== 'undefined') ? RUQIYA_AUDIO_URL : '';

/* ── SYMPTOM DATA ─────────────────────────────────────────────────────── */
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

const FEELINGS = [
  {id:'yengil',  label:'😌 Yengil his qildim'},
  {id:'titroq',  label:'😰 Titroq yoki qo\'rquv'},
  {id:'terlash', label:'😓 Terlash'},
  {id:'uyqu',    label:'😴 Uyqum keldi'},
  {id:'bosh',    label:'🤕 Bosh og\'ridi'},
  {id:'normal',  label:'😐 O\'zgarish sezilmadi'},
  {id:'yig\'lash',label:'😢 Ko\'z yoshi keldi'},
  {id:'tinchlik',label:'🕊️ Tinchlik his qildim'},
];

const RUQIYA_SYMPTOMS = [
  "Ko'p achish", "Kekirish", "Ko'z yoshlanishi",
  "Yuz, jag' tortilishi", "Tananing bir tomonida uyushish, tortilish",
  "Bo'yin og'rig'i", "Qorin og'rig'i", "O'pka og'rig'i",
  "Qo'l og'rig'i", "Yelka, kurak og'rig'i",
  "Umurtqa og'riq to'lqin bo'lib kelishi", "Yurak sanchishi",
  "Qovuq, bel og'rig'i", "Oyoq og'rig'i", "Tomog'ga tiqilish",
  "Og'riq kuchayib yurishi", "Qaltiroq turishi",
  "Sovuqotish, junjikih, qizib ketish", "Yig'lab yuborish",
  "Kulgi kelishi", "Uyqusi kelishi", "G'azab kelishi",
  "'Domlaning kuchi yetmaydi' degan fikr kelishi",
  "Allohga ishonmaslik fikri kelishi", "Xoch (krest) ko'zga ko'rinishi",
];

const KALIMALAR = [
  "Sehr deganida", "Er-xotinni ajratish",
  "Farzand bo'lmasligi uchun", "Kasal bo'lishi uchun",
  "O'limga qilingan", "Aldab ozdirish", "Hasad",
  "Ishi yo'li", "Baxt bo'lmasligi", "Vasvasa",
  "O'z joniga qasd", "Qabrga ko'milgan", "Qabriston tuprog'i",
  "Mayyit suvi", "Kafanlik", "Qo'g'irchoq", "Rasm",
  "Qulf zanjir", "Tugunlar", "Qon va najasat",
  "Ism harf raqam", "Jinn deganida", "Marid deganida",
  "Yahudiy", "Kofir", "Azob", "O'lim",
  "Jannat kalimlari", "Iblis deganida",
  "Zino qilg'usi deganida", "Nasroniy", "Jahannam",
  "Qiyomat", "Hazo",
];

/* ── STATE ─────────────────────────────────────────────────────────────── */
const S = {
  phone: '',
  user: null,
  analysis: null,       // aktiv tahlil DB dan
  ruqiyaLogs: [],       // tinglash loglari
  progress: null,       // {max_day, total_listens}

  // Tahlil qilish uchun
  uyqu: new Set(), ongi: new Set(), xon: new Set(),
  rag_answer: '',

  // Ruqiya session uchun
  currentDayNum: 1,
  currentListenNum: 1,
  selectedFeelings: new Set(),
  removedSymptoms: new Set(),
  addedSymptoms: new Set(),
  activeSymptoms: [],   // joriy aktiv simptomlar

  // Oflayn
  date: '', time: '',
  loadingData: false,
  selectedRuqiyaSyms: new Set(),
  selectedAddCat: null,
  selectedKalimalar: new Set(),
};

/* ── HELPERS ────────────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

function allLabels() {
  const o = [];
  UYQU.forEach(([l,k]) => S.uyqu.has(k) && o.push(l));
  ONGI.forEach(([l,k]) => S.ongi.has(k) && o.push(l));
  XON.forEach(([l,k])  => S.xon.has(k)  && o.push(l));
  return o;
}
function labelsOf(data, sel) { return data.filter(([,k]) => sel.has(k)).map(([l]) => l); }

function showErr(id, msg) {
  const e = $(id); if (!e) return;
  e.textContent = msg; e.style.display = 'block';
  setTimeout(() => { e.style.display = 'none'; }, 4000);
}

async function apiGet(path) {
  try {
    const r = await fetch(API + path, { signal: AbortSignal.timeout(10000) });
    return r.ok ? r.json() : null;
  } catch(e) { console.warn('apiGet', path, e.message); return null; }
}
async function apiPost(path, body) {
  try {
    const r = await fetch(API + path, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body), signal: AbortSignal.timeout(30000),
    });
    return r.ok ? r.json() : null;
  } catch(e) { console.warn('apiPost', path, e.message); return null; }
}

/* ── NAV ────────────────────────────────────────────────────────────────── */
const BACK = {
  's-holat':   's-menu',
  's-uyqu':    's-holat',
  's-ongi':    's-uyqu',
  's-xon':     's-ongi',
  's-complaint':'s-xon',
  's-loading': 's-complaint',
  's-result':  's-menu',
  's-ruqiya':  's-menu',
  's-listen':  's-ruqiya',
  's-ruqiya-syms':  's-listen',
  's-kalima':       's-ruqiya-syms',
  's-after-listen': 's-kalima',
  's-offline': 's-menu',
  's-info':    's-menu',
  's-info-detail': 's-info',
  's-final':   's-menu',
};
const PROGRESS = {
  's-menu':0, 's-holat':5, 's-uyqu':20, 's-ongi':38, 's-xon':56,
  's-complaint':72, 's-loading':78, 's-result':85,
  's-ruqiya':10, 's-listen':40, 's-ruqiya-syms':55, 's-kalima':70, 's-after-listen':85,
  's-offline':30, 's-info':5, 's-info-detail':5, 's-final':100,
};
let cur = '';

function go(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = $(id); if (!el) { console.error('Screen topilmadi:', id); return; }
  el.classList.add('active'); cur = id;
  window.scrollTo({top:0});
  const pct = PROGRESS[id] || 0;
  const pb = $('pbar'); if (pb) pb.style.width = pct + '%';
  const bb = $('back-bar'); if (bb) bb.style.display = id === 's-menu' ? 'none' : 'block';
  if (tg) id === 's-menu' ? tg.BackButton.hide() : tg.BackButton.show();

  if (id === 's-holat')    buildHolat();
  if (id === 's-uyqu')     buildList('uyqu-list', UYQU, S.uyqu, 'uyqu-pill');
  if (id === 's-ongi')     buildList('ongi-list', ONGI, S.ongi, 'ongi-pill');
  if (id === 's-xon')      buildList('xon-list',  XON,  S.xon,  'xon-pill');
  if (id === 's-complaint') buildComplaint();
  if (id === 's-ruqiya')   buildRuqiyaMenu();
  if (id === 's-after-listen') buildAfterListen();
  if (id === 's-sym-update') buildSymUpdate();
  if (id === 's-offline')  buildOffline();
}

function showFinal(title, body, extra) {
  const t = $('final-title'), b = $('final-body'), e = $('final-extra');
  if (t) t.textContent = title;
  if (b) { b.textContent = body || ''; b.style.whiteSpace = 'pre-wrap'; }
  if (e) e.innerHTML = extra || '';
  go('s-final');
}

/* ── LOAD ON START ──────────────────────────────────────────────────────── */
async function loadUserData() {
  if (!S.phone) return;
  S.loadingData = true;
  const res = await apiGet('/api/analysis/active?phone=' + encodeURIComponent(S.phone));
  console.log('[loadUserData] phone:', S.phone, 'res:', JSON.stringify(res));
  if (res && res.ok) {
    S.analysis = res.analysis || null;
    S.ruqiyaLogs = res.logs || [];
    S.progress = res.progress || null;
    if (S.analysis) {
      S.activeSymptoms = S.analysis.all_symptoms || [];
      // Oxirgi logdan aktiv simptomlarni olish
      if (S.ruqiyaLogs.length > 0) {
        const last = S.ruqiyaLogs[S.ruqiyaLogs.length - 1];
        if (last.active_symptoms && last.active_symptoms.length > 0) {
          S.activeSymptoms = last.active_symptoms;
        }
      }
    }
  }
  S.loadingData = false;
  // Agar holat ekrani ochiq bo'lsa, yangilash
  if (typeof cur !== 'undefined' && cur === 's-holat') buildHolat();
}

/* ── BUILD: HOLAT SCREEN ────────────────────────────────────────────────── */
function buildHolat() {
  const c = $('holat-content'); if (!c) return;

  // Agar hali yuklanyapti bo'lsa
  if (S.loadingData) {
    c.innerHTML = '<div style="text-align:center;padding:40px 0;color:#999">Yuklanmoqda...</div>';
    return;
  }

  if (!S.analysis) {
    // Tahlil yo'q — yangi tahlil qilish
    c.innerHTML =
      '<div class="notice n-info" style="margin-bottom:16px">' +
      'Holatingizni aniqlash uchun alomatlarni belgilang va ' +
      'o\'z so\'zlaringiz bilan tasvirlang.</div>' +
      '<button class="btn btn-black" id="btn-start-analysis">Tahlilni boshlash →</button>';
    $('btn-start-analysis').addEventListener('click', () => {
      S.uyqu = new Set(); S.ongi = new Set(); S.xon = new Set();
      go('s-uyqu');
    });
    return;
  }

  // Tahlil bor — ko'rsatish
  const syms = S.activeSymptoms || [];
  const logs = S.ruqiyaLogs || [];
  const day = S.progress ? S.progress.max_day || 0 : 0;

  let html = '<div class="res-card">';
  html += '<div class="res-label">Belgilangan alomatlar (' + syms.length + ' ta)</div>';
  if (syms.length) {
    html += '<div class="tags" style="margin-bottom:12px">' +
      syms.map(s => '<span class="tag">' + s + '</span>').join('') + '</div>';
  }
  html += '<div class="res-text" style="font-size:.82rem;color:#555;line-height:1.6">' +
    'Belgilangan alomatlar asosida holatingiz tahlil qilindi. ' +
    'Mutaxassis ko\'rigiga tashrif buyurish tavsiya etiladi. ' +
    'Imkon bo\'lmasa, onlayn ruqiyani 11 kun davomida tinglashingiz mumkin.' +
    '</div></div>';

  // Progress
  if (logs.length > 0) {
    const progressDay = S.progress ? (S.progress.max_day || 0) : 0;
    const pct = Math.min(Math.round(progressDay / 11 * 100), 100);
    html += '<div class="progress-card">' +
      '<div class="progress-header"><span class="progress-title">🎧 Ruqiya kursi</span>' +
      '<span class="progress-days">' + progressDay + ' / 11 kun</span></div>' +
      '<div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:' + pct + '%"></div></div>' +
      '</div>';
  }

  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">' +
    '<button class="btn btn-black" id="btn-go-ruqiya">🎧 Ruqiya tinglash</button>' +
    '<button class="btn btn-outline" id="btn-go-offline">📅 Tashrif yozish</button>' +
    '</div>' +
    '<button class="btn btn-outline" id="btn-new-analysis" style="margin-bottom:32px">🔄 Yangi tahlil</button>';

  c.innerHTML = html;

  // handlers via event delegation
}

/* ── BUILD: SYMPTOM LISTS ───────────────────────────────────────────────── */
function buildList(cid, data, sel, pillId) {
  const c = $(cid); if (!c) return;
  c.innerHTML = '';
  const upd = () => {
    const p = $(pillId); if (!p) return;
    if (sel.size) { p.textContent = sel.size + ' ta belgilandi'; p.className = 'count-pill active'; }
    else { p.textContent = 'Hech narsa belgilanmadi'; p.className = 'count-pill empty'; }
  };
  data.forEach(([lbl, key]) => {
    const row = document.createElement('div');
    row.className = 'sym-item' + (sel.has(key) ? ' checked' : '');
    row.innerHTML = '<div class="sym-box"><svg class="sym-check" viewBox="0 0 14 14" fill="none"><polyline points="2,7 5.5,10.5 12,3.5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span class="sym-text">' + lbl + '</span>';
    row.addEventListener('click', () => {
      sel.has(key) ? (sel.delete(key), row.classList.remove('checked'))
                   : (sel.add(key),    row.classList.add('checked'));
      upd();
    });
    c.appendChild(row);
  });
  upd();
}

function buildComplaint() {
  const lbl = allLabels();
  const t = $('complaint-tags'); if (!t) return;
  t.innerHTML = lbl.length
    ? lbl.map(l => '<span class="tag">' + l + '</span>').join('')
    : '<span class="tag" style="color:#999">Alomatlar belgilanmagan</span>';
}

/* ── BUILD: RUQIYA MENU ─────────────────────────────────────────────────── */
function buildRuqiyaMenu() {
  const c = $('ruqiya-content'); if (!c) return;

  // Tahlil yo'q → yo'naltirish
  if (!S.analysis) {
    c.innerHTML =
      '<div class="notice n-warn" style="margin-bottom:16px">' +
      '⚠️ Onlayn ruqiya tinglashdan oldin avval holatingizni aniqlang.' +
      '</div>' +
      '<button class="btn btn-black" id="btn-go-holat">Holatimni aniqlash →</button>';
    $('btn-go-holat').addEventListener('click', () => go('s-holat'));
    return;
  }

  const logs = S.ruqiyaLogs || [];
  const progress = S.progress || {max_day:0, total_listens:0};

  // Joriy kun: oxirgi log kunidan hisoblash
  // Har kun 2 marta tinglash kerak
  // Agar bugungi kun 2 marta tinglansa → ertaga o'tish
  let currentDay = progress.max_day || 0;
  const todayLogs = logs.filter(l => l.day_num === currentDay);
  const todayCount = todayLogs.length;

  let nextDay, nextListen;
  if (currentDay === 0) {
    // Birinchi marta
    nextDay = 1; nextListen = 1;
  } else if (todayCount < 2) {
    // Bugun yana tinglash mumkin
    nextDay = currentDay; nextListen = todayCount + 1;
  } else {
    // Bugun 2 marta bo'ldi — ertaga
    nextDay = currentDay + 1; nextListen = 1;
  }
  const canListen = nextDay <= 11;

  let html = '';

  // Joriy holat
  if (currentDay > 0) {
    const pct = Math.min(Math.round(currentDay/11*100),100);
    html += '<div class="progress-card" style="margin-bottom:14px">' +
      '<div class="progress-header"><span class="progress-title">🎧 Ruqiya kursi</span>' +
      '<span class="progress-days">' + currentDay + ' / 11 kun</span></div>' +
      '<div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:' + pct + '%"></div></div></div>';
  }

  if (canListen) {
    html += '<button class="btn btn-black" id="btn-start-listen" style="margin-bottom:8px">' +
      '▶ ' + nextDay + '-kun · ' + nextListen + '-tinglash</button>';
  } else {
    html += '<div class="notice n-info">✅ 11 kunlik kurs yakunlandi!</div>';
  }

  // Tarix
  if (logs.length > 0) {
    html += '<button class="btn btn-outline" id="btn-show-history" style="margin-bottom:32px">Tarixni ko\'rish</button>';
  }

  c.innerHTML = html;

  const listenBtn = $('btn-start-listen');
  if (listenBtn) {
    // handled via event delegation
    // store computed values in button dataset
    listenBtn.dataset.dayNum    = (todayLogs.length < 2) ? nextDay : nextDay;
    listenBtn.dataset.listenNum = (todayLogs.length < 2) ? nextListen : 1;
  }
}

/* ── LISTEN ─────────────────────────────────────────────────────────────── */
function setupAndStartListen(dataset) {
  S.currentDayNum    = parseInt(dataset.dayNum)    || 1;
  S.currentListenNum = parseInt(dataset.listenNum) || 1;
  S.selectedFeelings  = new Set();
  S.removedSymptoms   = new Set();
  S.addedSymptoms     = new Set();
  S.selectedRuqiyaSyms = new Set();
  S.selectedKalimalar  = new Set();
  startListen();
}

function startListen() {
  const label = $('listen-label');
  if (label) label.textContent = S.currentDayNum + '-kun · ' + S.currentListenNum + '-marta';
  const afterEl = $('listen-after');
  if (afterEl) afterEl.style.display = 'none';
  initListenAudio();
  go('s-listen');
}

function initListenAudio() {
  const audio = $('listen-audio'), btn = $('listen-btn');
  const play = $('listen-ico-play'), pause = $('listen-ico-pause');
  const fill = $('listen-fill'), time = $('listen-time');
  const afterEl = $('listen-after');
  if (!audio || !btn) return;
  audio.pause(); audio.currentTime = 0;
  if (AUDIO) audio.src = AUDIO;
  const fmt = s => { const m=Math.floor(s/60),sec=Math.floor(s%60); return m+':'+String(sec).padStart(2,'0'); };
  audio.onended = () => {
    if (play)  play.style.display  = '';
    if (pause) pause.style.display = 'none';
    if (afterEl) afterEl.style.display = 'block';
  };
  audio.ontimeupdate = () => {
    if (!audio.duration) return;
    if (fill) fill.style.width = (audio.currentTime/audio.duration*100)+'%';
    if (time) time.textContent = fmt(audio.currentTime)+' / '+fmt(audio.duration);
  };
  btn.onclick = () => {
    if (audio.paused) {
      audio.play();
      if (play)  play.style.display  = 'none';
      if (pause) pause.style.display = '';
    } else {
      audio.pause();
      if (play)  play.style.display  = '';
      if (pause) pause.style.display = 'none';
    }
  };
  // Agar audio yo'q bo'lsa ham "Proslushaldim" tugmasini ko'rsat
  if (!AUDIO) {
    if (afterEl) afterEl.style.display = 'block';
    btn.style.opacity = '.4';
  }
}

/* ── AFTER LISTEN ───────────────────────────────────────────────────────── */
function buildRuqiyaSyms() {
  // Label
  const lbl = $('ruqiya-syms-label');
  if (lbl) lbl.textContent = S.currentDayNum + '-kun ' + S.currentListenNum + '-marta';
  S.selectedRuqiyaSyms = new Set();
  const c = $('ruqiya-syms-list'); if (!c) return;
  c.innerHTML = '';
  RUQIYA_SYMPTOMS.forEach((sym, i) => {
    const div = document.createElement('div');
    div.className = 'sym-item';
    div.innerHTML = '<div class="sym-box"><svg class="sym-check" viewBox="0 0 14 14" fill="none"><polyline points="2,7 5.5,10.5 12,3.5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span class="sym-text">' + sym + '</span>';
    div.addEventListener('click', () => {
      S.selectedRuqiyaSyms.has(i) ? (S.selectedRuqiyaSyms.delete(i), div.classList.remove('checked'))
                                   : (S.selectedRuqiyaSyms.add(i),    div.classList.add('checked'));
    });
    c.appendChild(div);
  });
}

function buildKalima() {
  S.selectedKalimalar = new Set();
  const c = $('kalima-list'); if (!c) return;
  c.innerHTML = '';
  KALIMALAR.forEach((kal, i) => {
    const div = document.createElement('div');
    div.className = 'sym-item';
    div.innerHTML = '<div class="sym-box"><svg class="sym-check" viewBox="0 0 14 14" fill="none"><polyline points="2,7 5.5,10.5 12,3.5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span class="sym-text">' + kal + '</span>';
    div.addEventListener('click', () => {
      S.selectedKalimalar.has(i) ? (S.selectedKalimalar.delete(i), div.classList.remove('checked'))
                                  : (S.selectedKalimalar.add(i),    div.classList.add('checked'));
    });
    c.appendChild(div);
  });
}

function buildAfterListen() {
  buildSymRemove();
  buildSymAdd();
}

function buildSymRemove() {
  const active = S.activeSymptoms || [];
  const removeList = $('sym-remove-list');
  if (!removeList) return;
  removeList.innerHTML = '';
  S.removedSymptoms = new Set();
  if (active.length === 0) {
    removeList.innerHTML = '<div style="color:#999;font-size:.84rem;padding:8px 0">Aktiv alomatlar yoq</div>';
    return;
  }
  active.forEach((sym, i) => {
    const div = document.createElement('div');
    div.className = 'sym-item';
    div.innerHTML = '<div class="sym-box"><svg class="sym-check" viewBox="0 0 14 14" fill="none"><polyline points="2,7 5.5,10.5 12,3.5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span class="sym-text">' + sym + '</span>';
    div.addEventListener('click', () => {
      S.removedSymptoms.has(i) ? (S.removedSymptoms.delete(i), div.classList.remove('checked'))
                                : (S.removedSymptoms.add(i),   div.classList.add('checked'));
    });
    removeList.appendChild(div);
  });
}

function buildSymAdd() {
  S.addedSymptoms = new Set();
  S.selectedAddCat = null;
  // Ha/Yo'q tugmalari delegatsiya orqali ishlaydi
}

function buildSymAddCategory(cat) {
  S.selectedAddCat = cat;
  const active = S.activeSymptoms || [];
  const addSec = $('sym-add-section');
  if (!addSec) return;
  addSec.innerHTML = '';
  addSec.style.display = 'block';
  S.addedSymptoms = new Set();

  let items = [];
  if (cat === 'uyqu')   items = UYQU.filter(([lbl]) => !active.includes(lbl));
  if (cat === 'ongi')   items = ONGI.filter(([lbl]) => !active.includes(lbl));
  if (cat === 'xon')    items = XON.filter(([lbl])  => !active.includes(lbl));
  if (cat === 'ruqiya') items = RUQIYA_SYMPTOMS.filter(s => !active.includes(s)).map(s => [s, s]);
  if (cat === 'kalima') items = KALIMALAR.filter(k => !active.includes(k)).map(k => [k, k]);

  // Kategoriya tugmalarini highlight qilish
  document.querySelectorAll('.sym-cat-btn').forEach(b => {
    b.className = b.dataset.cat === cat
      ? 'btn btn-black sym-cat-btn'
      : 'btn btn-outline sym-cat-btn';
  });

  if (items.length === 0) {
    addSec.innerHTML = '<div style="color:#999;font-size:.84rem;padding:8px 0">Bu kategoriyada qo\'shish uchun alomat yo\'q</div>';
    return;
  }
  items.forEach(([lbl, key]) => {
    const div = document.createElement('div');
    div.className = 'sym-item';
    div.innerHTML = '<div class="sym-box"><svg class="sym-check" viewBox="0 0 14 14" fill="none"><polyline points="2,7 5.5,10.5 12,3.5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span class="sym-text">' + lbl + '</span>';
    div.addEventListener('click', () => {
      S.addedSymptoms.has(key) ? (S.addedSymptoms.delete(key), div.classList.remove('checked'))
                                : (S.addedSymptoms.add(key),   div.classList.add('checked'));
    });
    addSec.appendChild(div);
  });
}



/* ── SAVE SESSION ───────────────────────────────────────────────────────── */
async function saveSession() {
  const active = S.activeSymptoms || [];
  const removed = active.filter((_, i) => S.removedSymptoms.has(i));
  const added = [...UYQU, ...ONGI, ...XON]
    .filter(([, key]) => S.addedSymptoms.has(key))
    .map(([lbl]) => lbl);
  const newActive = active.filter((_, i) => !S.removedSymptoms.has(i)).concat(added);

  const btn = $('btn-save-session');
  if (btn) { btn.disabled = true; btn.textContent = 'Saqlanmoqda...'; }

  const ruqiyaSyms = RUQIYA_SYMPTOMS.filter((_, i) => S.selectedRuqiyaSyms.has(i));
  const kalimalar = KALIMALAR.filter((_, i) => S.selectedKalimalar.has(i));

  const res = await apiPost('/api/ruqiya/log', {
    phone: S.phone,
    day_num: S.currentDayNum,
    listen_num: S.currentListenNum,
    feelings: [...S.selectedFeelings],
    ayat_reactions: {
      ruqiya_symptoms: ruqiyaSyms,
      kalimalar: kalimalar,
    },
    active_symptoms: newActive,
    removed_symptoms: removed,
    added_symptoms: added,
  });

  if (btn) { btn.disabled = false; btn.textContent = 'Saqlash →'; }

  if (res && res.ok) {
    // State ni yangilash
    S.activeSymptoms = newActive;
    S.ruqiyaLogs.push({
      day_num: S.currentDayNum,
      listen_num: S.currentListenNum,
      active_symptoms: newActive,
      removed_symptoms: removed,
    });
    if (res.progress) S.progress = res.progress;

    // Natijani ko'rsatish
    const isAllDone = newActive.length === 0;
    const is11Days = S.currentDayNum >= 11 && S.currentListenNum >= 1;

    if (isAllDone) {
      // Analizni yopish — barcha alomatlar yo'qoldi
      if (S.phone) {
        apiPost('/api/analysis/close', { phone: S.phone }).then(() => {
          // State ni tozalash
          S.analysis = null;
          S.ruqiyaLogs = [];
          S.progress = null;
          S.activeSymptoms = [];
        });
      }
      showFinal(
        "Tabriklaymiz!",
        "Belgilangan barcha alomatlar ro'yxatdan chiqarildi.\n\n" +
        S.currentDayNum + "-kun, " + S.currentListenNum + "-marta tinglashdan so'ng barcha alomatlar yaxshilandi.\n\n" +
        "Alloh taolo shifo va baraka bersin! 🤲",
        ''
      );
    } else if (is11Days) {
      showFinal(
        "11 kunlik kurs yakunlandi",
        "Siz 11 kunlik ruqiya kursini yakunladingiz.\n\n" +
        (removed.length > 0 ? removed.length + " ta alomat yo'qoldi.\n" : '') +
        (newActive.length > 0 ? newActive.length + " ta alomat hali mavjud.\n\nMutaxassis ko'rigiga tashrif buyurish tavsiya etiladi." : ''),
        '<button class="btn btn-outline" onclick="go(\'s-holat\')" style="margin-top:10px">Holatni ko\'rish</button>'
      );
    } else {
      const msg = (removed.length > 0 ? removed.length + " ta alomat yaxshilandi\n" : "") +
        newActive.length + " ta alomat qoldi\n\nDavom eting. Alloh shifo bersin!";
      showFinal(
        S.currentDayNum + "-kun · " + S.currentListenNum + "-marta saqlandi",
        msg,
        '<button class="btn btn-black" onclick="go(\'s-ruqiya\')" style="margin-top:10px">Ruqiya menyusi</button>'
      );
    }
  } else {
    showFinal('Xatolik', "Saqlashda muammo bo'ldi. Keyinroq urinib ko'ring.", '');
  }
}

/* ── HISTORY ────────────────────────────────────────────────────────────── */
function showHistory() {
  const logs = S.ruqiyaLogs || [];
  if (!logs.length) { showFinal('Tarix', "Hali hech qanday seans bo'lmagan.", ''); return; }
  let body = '';
  const grouped = {};
  logs.forEach(l => {
    const key = l.day_num;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(l);
  });
  Object.keys(grouped).sort((a,b)=>a-b).forEach(day => {
    const dayLogs = grouped[day];
    body += day + '-kun:\n';
    dayLogs.forEach(l => {
      const rem = Array.isArray(l.removed_symptoms) ? l.removed_symptoms : [];
      body += '  ' + l.listen_num + '-marta: -' + rem.length + ' ta alomat\n';
    });
  });
  const initial = S.analysis ? (S.analysis.all_symptoms || []).length : 0;
  const current = S.activeSymptoms.length;
  const improved = initial - current;
  body += '\nJami: ' + initial + ' ta → ' + current + ' ta (' +
    (improved > 0 ? '-' + improved + ' ta' : 'o\'zgarish yo\'q') + ')';
  showFinal('Ruqiya tarixi (' + logs.length + ' seans)', body,
    '<button class="btn btn-outline" onclick="go(\'s-ruqiya\')" style="margin-top:10px">← Orqaga</button>');
}

/* ── OFFLINE ────────────────────────────────────────────────────────────── */
function buildOffline() {
  S.date = ''; S.time = '';
  const confirm = $('offline-confirm');
  if (confirm) confirm.style.display = 'none';
  const grid = $('date-grid'); if (!grid) return;
  grid.innerHTML = '';
  const WD = ['Yak','Dush','Sesh','Chor','Pay','Jum','Shan'];
  const d = new Date(); d.setDate(d.getDate() + 1);
  let n = 0;
  while (n < 7) {
    if (d.getDay() !== 5) {
      const iso = d.toISOString().slice(0,10);
      const btn = document.createElement('div');
      btn.className = 'pick';
      btn.innerHTML = '<span class="pk">' + d.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'}) + '</span><span class="ps">' + WD[d.getDay()] + '</span>';
      btn.addEventListener('click', () => {
        document.querySelectorAll('#date-grid .pick').forEach(b => b.classList.remove('sel'));
        btn.classList.add('sel'); S.date = iso; updOffline();
      });
      grid.appendChild(btn); n++;
    }
    d.setDate(d.getDate() + 1);
  }
  document.querySelectorAll('.time-pick').forEach(btn => {
    const clone = btn.cloneNode(true);
    btn.parentNode.replaceChild(clone, btn);
    clone.addEventListener('click', () => {
      document.querySelectorAll('.time-pick').forEach(b => b.classList.remove('sel'));
      clone.classList.add('sel'); S.time = clone.dataset.time; updOffline();
    });
  });
}

function updOffline() {
  const c = $('offline-confirm'), s = $('offline-sel');
  if (c && s && S.date && S.time) { s.textContent = S.date + ' — ' + S.time; c.style.display = 'block'; }
}

/* ═══════════════════════════════════════════
   DOMContentLoaded
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  if (tg) tg.BackButton.onClick(() => { const t = BACK[cur]; if (t) go(t); });
  $('btn-back')?.addEventListener('click', () => { const t = BACK[cur]; if (t) go(t); });

  /* MENU tiles */
  document.querySelectorAll('.tile[data-goto]').forEach(t => {
    t.addEventListener('click', () => go(t.dataset.goto));
  });

  /* HOLATIMNI ANIQLASH tile override */
  const holatTile = document.querySelector('.tile[data-goto="s-holat"]');
  if (holatTile) {
    holatTile.addEventListener('click', () => go('s-holat'), true);
  }

  /* SYMPTOM NEXT */
  $('btn-uyqu')?.addEventListener('click', () => go('s-ongi'));
  $('btn-ongi')?.addEventListener('click', () => go('s-xon'));
  $('btn-xon')?.addEventListener('click',  () => go('s-complaint'));

  /* COMPLAINT */
  $('btn-complaint')?.addEventListener('click', async () => {
    const txt = $('complaint-text')?.value.trim();
    if (!txt || txt.length < 10) return showErr('complaint-err', 'Kamida 10 ta belgi kiriting');
    go('s-loading');

    const uyqu = labelsOf(UYQU, S.uyqu);
    const ongi = labelsOf(ONGI, S.ongi);
    const xon  = labelsOf(XON,  S.xon);
    const all  = allLabels();

    const msgs = [
      ['Tahlil qilinmoqda','GROQ AI javob tayyorlamoqda'],
      ['Alomatlar tekshirilmoqda','Biroz sabr qiling'],
      ['Natija tayorlanmoqda','Deyarli tayyor...'],
    ];
    let mi = 0;
    const iv = setInterval(() => {
      mi = (mi+1) % msgs.length;
      const t = $('load-title'), s = $('load-sub');
      if (t) t.textContent = msgs[mi][0];
      if (s) s.textContent = msgs[mi][1];
    }, 2500);

    const res = await apiPost('/api/analyze', {
      phone: S.phone,
      uyqu_symptoms: uyqu, ongi_symptoms: ongi,
      xonadon_symptoms: xon, all_symptoms: all,
      complaint: txt,
    });

    clearInterval(iv);

    if (res && res.ok) {
      S.rag_answer = res.answer || '';
      if (res.analysis_id) {
        // Yangidan yuklash
        await loadUserData();
      }
    }

    // Result ekranini qurish
    const rb = $('result-body');
    if (rb) {
      rb.textContent = S.rag_answer || 'Tahlil natijasi yuklanmadi.';
      rb.style.whiteSpace = 'pre-wrap';
      rb.style.fontSize = '.82rem';
    }
    const rt = $('result-tags');
    if (rt) rt.innerHTML = all.map(s => '<span class="tag">' + s + '</span>').join('') || '<span class="tag">-</span>';

    go('s-result');
  });

  /* RESULT buttons */
  $('btn-to-ruqiya')?.addEventListener('click', () => go('s-ruqiya'));
  $('btn-to-offline')?.addEventListener('click', () => go('s-offline'));

  /* RUQIYA STEPS — event delegation (dynamic screens) */
  document.addEventListener('click', e => {
    // data-goto universal handler
    const gotoEl = e.target.closest('[data-goto]');
    if (gotoEl && !e.target.classList.contains('tile')) { go(gotoEl.dataset.goto); return; }

    if (e.target.id === 'btn-to-kalima')    { buildKalima(); go('s-kalima'); }
    if (e.target.id === 'btn-to-sym-update') { buildSymRemove(); buildSymAdd(); go('s-after-listen'); }
    if (e.target.id === 'btn-start-analysis') { S.uyqu=new Set(); S.ongi=new Set(); S.xon=new Set(); go('s-uyqu'); }
    if (e.target.id === 'btn-go-ruqiya')    go('s-ruqiya');
    if (e.target.id === 'btn-go-offline')   go('s-offline');
    if (e.target.id === 'btn-new-analysis') { S.uyqu=new Set(); S.ongi=new Set(); S.xon=new Set(); go('s-uyqu'); }
    if (e.target.id === 'btn-go-holat')     go('s-holat');
    // Yangi alomat: ha/yo'q
    if (e.target.id === 'btn-new-sym-yes') {
      const sec = $('new-sym-section');
      if (sec) sec.style.display = 'block';
    }
    if (e.target.id === 'btn-new-sym-no') {
      const sec = $('new-sym-section');
      if (sec) sec.style.display = 'none';
      S.addedSymptoms = new Set();
    }
    // Kategoriya tanlash
    if (e.target.classList.contains('sym-cat-btn')) {
      buildSymAddCategory(e.target.dataset.cat);
    }
    if (e.target.id === 'btn-start-listen') { setupAndStartListen(e.target.dataset); }
    if (e.target.id === 'btn-show-history') showHistory();
  });

  /* LISTEN — proslushaldim */
  $('btn-listened')?.addEventListener('click', () => {
    if (S.currentDayNum === 1 && S.currentListenNum === 1) {
      buildRuqiyaSyms(); go('s-ruqiya-syms');
    } else {
      buildSymRemove(); buildSymAdd(); go('s-after-listen');
    }
  });

  /* s-after-listen da saqlash tugmasi to'g'ridan ishlatiladi */

  /* SAVE SESSION */
  $('btn-save-session')?.addEventListener('click', saveSession);

  /* OFFLINE */
  $('btn-offline')?.addEventListener('click', async () => {
    if (!S.date) return showErr('offline-err', 'Sanani tanlang');
    if (!S.time) return showErr('offline-err', 'Vaqtni tanlang');
    const btn = $('btn-offline');
    if (btn) { btn.disabled = true; btn.textContent = 'Saqlanmoqda...'; }
    const res = await apiPost('/api/offline', {
      phone: S.phone, visit_date: S.date, visit_time: S.time,
    });
    if (btn) { btn.disabled = false; btn.textContent = 'Tashrifga yozilish →'; }
    showFinal('Tashrifga yozilish tasdiqlandi!',
      S.date + ' — ' + S.time + '\nYangi Toshkent, Gulzor MFY\n\nMenejer siz bilan bog\'lanadi.',
      '');
  });

  /* INFO */
  const INFO = {
    domla: {
      title: 'Sayfulloh domla haqida',
      body: "O'zbekiston Xalq Tabobati Assotsiatsiyasi a'zosi.\n\nOliy ma'lumotli mutaxassis — Misr, Saudiya Arabistoni, Turkiya, Moskva va Sankt-Peterburgda tahsil olgan.\n\n'Ruhiy bezovtalik muolajasi' sohasida ixtisoslashgan tajribali Roqiy.",
    },
    markaz: {
      title: 'TIB VA DAM markazi',
      body: "Yangi Toshkent, Gulzor MFY\nYangi Qo'yliq bozori, Food City ko'chasi\n\nQabul: Jumaday tashqari har kuni\n- Ertalab: 07:00\n- Kechqurun: 20:00",
    },
    manzil: {
      title: 'Manzil',
      body: "Yangi Toshkent, Gulzor MFY\nYangi Qo'yliq bozori, Food City ko'chasi",
    },
  };
  document.querySelectorAll('.info-row[data-info]').forEach(row => {
    row.addEventListener('click', () => {
      const d = INFO[row.dataset.info]; if (!d) return;
      const c = $('info-content');
      if (c) c.innerHTML = '<div class="res-label">' + d.title + '</div><div class="res-text">' + d.body + '</div>';
      go('s-info-detail');
    });
  });

  /* CLOSE */
  $('btn-close')?.addEventListener('click', () => { if (tg) tg.close(); });

  /* ── START ── */
  setTimeout(async () => {
    try {
      // 1. localStorage dan foydalanuvchi
      const saved = localStorage.getItem('tvd_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u && u.full_name) {
          S.user = u;
          S.phone = u.phone || localStorage.getItem('tvd_phone') || '';
          if (S.phone) await loadUserData();
          // Menu sarlavhasini yangilash
          const title = $('menu-title');
          if (title) title.textContent = 'Assalomu alaykum, ' + u.full_name.split(' ')[0] + '!';
          go('s-menu');
          return;
        }
      }
      // 2. Telefon bilan tekshirish
      const phone = localStorage.getItem('tvd_phone');
      if (phone) {
        const res = await apiPost('/api/check-user', { phone });
        if (res && res.ok && res.exists) {
          S.user = res.user;
          S.phone = phone;
          try { localStorage.setItem('tvd_user', JSON.stringify({...res.user, phone})); } catch {}
          await loadUserData();
          const title = $('menu-title');
          if (title && res.user.full_name) title.textContent = 'Assalomu alaykum, ' + res.user.full_name.split(' ')[0] + '!';
          go('s-menu');
          return;
        }
      }
    } catch(e) { console.warn('start error:', e); }
    window.location.href = 'register.html';
  }, 100);
});
