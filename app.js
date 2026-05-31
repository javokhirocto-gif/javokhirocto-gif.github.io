/* TIB VA DAM Mini App */

const tg = window.Telegram?.WebApp || null;
if (tg) { tg.ready(); tg.expand(); tg.enableClosingConfirmation(); }

const API   = 'https://ruhiyat-production.up.railway.app';
const AUDIO = (typeof RUQIYA_AUDIO_URL !== 'undefined') ? RUQIYA_AUDIO_URL : '';

function send(action, payload = {}) {
  const d = JSON.stringify({ action, ...payload });
  if (tg && tg.sendData) tg.sendData(d);
  else console.log('[bot]', action, payload);
}

async function apiGet(path) {
  try {
    const r = await fetch(API + path, { signal: AbortSignal.timeout(10000) });
    return r.ok ? r.json() : null;
  } catch(e) { console.warn('apiGet', e.message); return null; }
}
async function apiPost(path, body) {
  try {
    const r = await fetch(API + path, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body), signal: AbortSignal.timeout(15000),
    });
    return r.ok ? r.json() : null;
  } catch(e) { console.warn('apiPost', e.message); return null; }
}

/* ── DATA ── */
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
const INFO_DATA = {
  domla: {
    title: 'Sayfulloh domla haqida',
    body: "O'zbekiston Xalq Tabobati Assotsiatsiyasining rasmiy a'zosi.\n\nOliy ma'lumotli mutaxassis — Misr, Saudiya Arabistoni, Turkiya, Moskva va Sankt-Peterburgda tahsil olgan.\n\n\"Ruhiy bezovtalik muolajasi\" sohasida ixtisoslashgan tajribali Roqiy.",
    map: false,
  },
  markaz: {
    title: 'TIB VA DAM markazi',
    body: "Yangi Toshkent, Gulzor MFY\nYangi Qo'yliq bozori, Food City ko'chasi\n\nQabul: Jumaday tashqari har kuni\n- Ertalab: 07:00\n- Kechqurun: 20:00",
    map: false,
  },
  manzil: {
    title: 'Manzil',
    body: "Yangi Toshkent, Gulzor MFY\nYangi Qo'yliq bozori, Food City ko'chasi\n\nJumaday tashqari har kuni: 07:00 va 20:00",
    map: true, lat: 41.3264, lon: 69.3728,
  },
};

/* ── STATE ── */
const S = {
  reg: false,
  phone: '',
  uyqu: new Set(), ongi: new Set(), xon: new Set(),
  labels: [], remaining: [],
  session: 0, resolved: new Set(),
  date: '', time: '',
  lastAnalysis: null,
  sessions: [],
  sessionNum: 0,
  currentFeelings: new Set(),
  sessionSymbols: new Set(),
  rag_answer: '',
};

function allLabels() {
  const o = [];
  UYQU.forEach(([l,k]) => S.uyqu.has(k) && o.push(l));
  ONGI.forEach(([l,k]) => S.ongi.has(k) && o.push(l));
  XON.forEach(([l,k])  => S.xon.has(k)  && o.push(l));
  return o;
}
function labelsOf(data, sel) { return data.filter(([,k]) => sel.has(k)).map(([l]) => l); }

function getSessions() {
  try { return JSON.parse(localStorage.getItem('tvd_s') || '[]'); } catch { return []; }
}
function saveSession(d) {
  const a = getSessions(); a.push(d);
  try { localStorage.setItem('tvd_s', JSON.stringify(a)); } catch {}
}

/* ── NAV ── */
const PROGRESS = {
  's-menu':0,'s-uyqu':22,'s-ongi':40,'s-xon':58,
  's-complaint':72,'s-loading':77,'s-result':82,'s-ruqiya':84,
  's-check':88,'s-tracking':93,'s-history':60,
  's-offline':90,'s-info':5,'s-info-detail':5,'s-final':100,
  's-dashboard':5,'s-ruqiya-session':84,'s-calendar':60,
};
const BACK = {
  's-uyqu':'s-menu','s-ongi':'s-uyqu','s-xon':'s-ongi',
  's-complaint':'s-xon','s-result':'s-menu','s-ruqiya':'s-menu',
  's-check':'s-ruqiya','s-tracking':'s-ruqiya','s-history':'s-ruqiya',
  's-offline':'s-menu','s-info':'s-menu','s-info-detail':'s-info','s-final':'s-menu',
  's-dashboard':'s-menu','s-ruqiya-session':'s-dashboard','s-calendar':'s-dashboard',
};
let cur = '';
const $ = id => document.getElementById(id);

function go(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = $(id); if (!el) { console.error('Screen topilmadi:', id); return; }
  el.classList.add('active');
  cur = id;
  window.scrollTo({ top: 0 });
  const pct = PROGRESS[id] || 0;
  const pb = $('pbar'); if (pb) pb.style.width = pct + '%';
  const bb = $('back-bar'); if (bb) bb.style.display = id === 's-menu' ? 'none' : 'block';
  if (tg) id === 's-menu' ? tg.BackButton.hide() : tg.BackButton.show();

  if (id === 's-uyqu')     buildList('uyqu-list', UYQU, S.uyqu, 'uyqu-pill');
  if (id === 's-ongi')     buildList('ongi-list', ONGI, S.ongi, 'ongi-pill');
  if (id === 's-xon')      buildList('xon-list',  XON,  S.xon,  'xon-pill');
  if (id === 's-complaint') buildComplaint();
  if (id === 's-result')   buildResult();
  if (id === 's-tracking') buildTracking();
  if (id === 's-history')  buildHistory();
  if (id === 's-offline')  buildOffline();
  if (id === 's-dashboard') buildDashboard();
  if (id === 's-calendar') buildCalendar();
}

/* ── API HELPERS ── */
async function loadLastAnalysis() {
  if (!S.phone) return;
  const res = await apiGet('/api/last-analysis?phone=' + encodeURIComponent(S.phone));
  if (res && res.ok && res.analysis) {
    S.lastAnalysis = res.analysis;
    const syms = res.analysis.symptoms || [];
    S.labels = syms;
    S.remaining = [...syms];
  }
  const sessRes = await apiGet('/api/ruqiya-sessions?phone=' + encodeURIComponent(S.phone));
  if (sessRes && sessRes.ok) {
    S.sessions = sessRes.sessions || [];
    S.sessionNum = S.sessions.length;
    if (S.sessions.length > 0) {
      const last = S.sessions[0];
      const rem = last.remaining_symptoms;
      if (rem) S.remaining = Array.isArray(rem) ? rem : JSON.parse(rem);
    }
  }
}

/* ── BUILD FUNCTIONS ── */
function buildList(cid, data, sel, pillId) {
  const c = $(cid); if (!c) return;
  c.innerHTML = '';
  const upd = () => {
    const p = $(pillId); if (!p) return;
    if (sel.size) { p.textContent = sel.size + ' ta belgilandi'; p.className = 'count-pill active'; }
    else          { p.textContent = 'Hech narsa belgilanmadi';  p.className = 'count-pill empty'; }
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
    : '<span class="tag">Alomatlar belgilanmagan</span>';
}

function buildResult() {
  const lbl = allLabels();
  S.labels = lbl;
  if (!S.remaining.length) S.remaining = [...lbl];
  const t = $('result-tags');
  if (t) t.innerHTML = lbl.length ? lbl.map(l => '<span class="tag">' + l + '</span>').join('') : '<span class="tag">-</span>';
  const s = $('result-sub');
  if (s) s.textContent = lbl.length + ' ta alomat aniqlandi';

  // Natijani ko'rsatish
  const body = $('result-body');
  if (body) {
    if (S.rag_answer) {
      body.textContent = S.rag_answer;
      body.style.whiteSpace = 'pre-wrap';
      body.style.fontSize = '.82rem';
    } else {
      body.textContent = 'Tahlil natijasi bot chatida ko\'rinadi.';
    }
  }
}

function buildTracking() {
  const rem = S.remaining.length ? S.remaining : S.labels;
  const sub = $('track-sub');
  if (sub) sub.textContent = S.session + '-seans - Qaysi alomatlar yo\'qoldi?';
  const stats = $('track-stats');
  if (stats) stats.innerHTML =
    '<div class="stat-box"><div class="stat-n">' + S.labels.length + '</div><div class="stat-l">Jami</div></div>' +
    '<div class="stat-box"><div class="stat-n g" id="res-num">' + S.resolved.size + '</div><div class="stat-l">Yo\'qoldi</div></div>' +
    '<div class="stat-box"><div class="stat-n r" id="rem-num">' + rem.length + '</div><div class="stat-l">Qolgan</div></div>';
  S.resolved = new Set();
  const c = $('track-list'); if (!c) return;
  c.innerHTML = '';
  if (!rem.length) {
    c.innerHTML = '<div class="notice notice-info">Barcha alomatlar yo\'qoldi! Allohga shukr!</div>';
    return;
  }
  rem.forEach((sym, i) => {
    const row = document.createElement('div');
    row.className = 'sym-item';
    row.innerHTML = '<div class="sym-box"><svg class="sym-check" viewBox="0 0 14 14" fill="none"><polyline points="2,7 5.5,10.5 12,3.5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span class="sym-text">' + sym + '</span>';
    row.addEventListener('click', () => {
      S.resolved.has(i) ? (S.resolved.delete(i), row.classList.remove('checked'))
                        : (S.resolved.add(i),    row.classList.add('checked'));
      const rn = $('res-num'), remn = $('rem-num');
      if (rn)   rn.textContent = S.resolved.size;
      if (remn) remn.textContent = rem.length - S.resolved.size;
    });
    c.appendChild(row);
  });
}

function buildHistory() {
  const c = $('history-list'); if (!c) return;
  const list = getSessions();
  const total = S.labels.length;
  if (!list.length) {
    c.innerHTML = '<div class="notice notice-plain" style="text-align:center">Hali hech qanday seans bo\'lmagan.</div>';
    return;
  }
  const allRes = new Set(list.flatMap(s => s.res || []));
  const pct = total > 0 ? Math.round(allRes.size / total * 100) : 0;
  let html = '<div class="hist-summary"><div class="hist-pct">' + pct + '%</div><div class="hist-lbl">Umumiy yaxshilanish - ' + allRes.size + ' ta alomat yo\'qoldi</div><div class="hist-bar"><div class="hist-bar-f" style="width:' + pct + '%"></div></div></div>';
  [...list].reverse().forEach((s, i) => {
    const num = list.length - i;
    const res = s.res || [], rem = s.rem || [];
    const date = s.date ? new Date(s.date).toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'}) : '-';
    const sp = total > 0 ? Math.round(res.length / total * 100) : 0;
    html += '<div class="hist-card"><div class="hist-head"><span class="hist-num">' + num + '-seans</span><span class="hist-date">' + date + '</span></div><div class="hist-prog"><div class="hist-prog-f" style="width:' + sp + '%"></div></div>';
    if (res.length) html += '<div class="tags">' + res.map(r => '<span class="tag tag-g">' + r + '</span>').join('') + '</div>';
    if (rem.length) html += '<div class="tags" style="margin-top:5px">' + rem.slice(0,4).map(r => '<span class="tag tag-r">' + r + '</span>').join('') + (rem.length>4?'<span class="tag tag-r">+' + (rem.length-4) + '</span>':'') + '</div>';
    html += '</div>';
  });
  c.innerHTML = html;
}

function buildOffline() {
  S.date = ''; S.time = '';
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
        btn.classList.add('sel');
        S.date = iso; updOffline();
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
      clone.classList.add('sel');
      S.time = clone.dataset.time; updOffline();
    });
  });
}

function updOffline() {
  const c = $('offline-confirm'), s = $('offline-sel');
  if (c && s && S.date && S.time) {
    s.textContent = S.date + ' - ' + S.time;
    c.style.display = 'block';
  }
}

function buildDashboard() {
  if (!S.lastAnalysis) { go('s-uyqu'); return; }
  const dateEl = $('dash-date');
  if (dateEl && S.lastAnalysis.created_at) {
    const d = new Date(S.lastAnalysis.created_at);
    dateEl.textContent = d.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'});
  }
  const card = $('dash-result-card'), ansEl = $('dash-answer');
  if (card && ansEl && S.lastAnalysis.rag_answer) {
    ansEl.textContent = S.lastAnalysis.rag_answer.slice(0,600) + (S.lastAnalysis.rag_answer.length > 600 ? '...' : '');
    card.style.display = 'block';
  }
  const prog = $('dash-progress');
  if (prog && S.sessions.length > 0) {
    prog.style.display = 'block';
    const days = Math.min(S.sessions.length, 11);
    const pct = Math.round(days / 11 * 100);
    const bar = $('dash-bar');
    if (bar) bar.style.width = pct + '%';
    const daysEl = $('dash-days');
    if (daysEl) daysEl.textContent = days + ' / 11 kun';
    const allResolved = new Set();
    S.sessions.forEach(sess => {
      const res = Array.isArray(sess.resolved_symptoms) ? sess.resolved_symptoms : [];
      res.forEach(r => allResolved.add(r));
    });
    const resolvedEl = $('dash-resolved');
    if (resolvedEl) resolvedEl.textContent = allResolved.size + ' ta alomat yaxshilandi';
    const remEl = $('dash-remaining');
    if (remEl) remEl.textContent = S.remaining.length + ' ta qolgan';
  }
}

function buildCalendar() {
  const grid = $('calendar-grid'); if (!grid) return;
  grid.innerHTML = '';
  for (let d = 1; d <= 11; d++) {
    const div = document.createElement('div');
    div.className = 'cal-day';
    if (d <= S.sessions.length) {
      div.classList.add('done');
      div.innerHTML = '<div class="cal-day-num">' + d + '</div><div class="cal-day-dot"></div>';
      const sessForDay = S.sessions[S.sessions.length - d];
      if (sessForDay) {
        div.style.cursor = 'pointer';
        div.addEventListener('click', function() { showSessionDetail(sessForDay, d); });
      }
    } else if (d === S.sessions.length + 1) {
      div.classList.add('active');
      div.innerHTML = '<div class="cal-day-num">' + d + '</div>';
    } else {
      div.classList.add('future');
      div.innerHTML = '<div class="cal-day-num">' + d + '</div>';
    }
    grid.appendChild(div);
  }
  const summary = $('calendar-summary');
  if (summary && S.sessions.length > 0) {
    const allRes = new Set();
    S.sessions.forEach(sess => {
      const res = Array.isArray(sess.resolved_symptoms) ? sess.resolved_symptoms : [];
      res.forEach(x => allRes.add(x));
    });
    const total = S.labels.length || 1;
    const pct = Math.round(allRes.size / total * 100);
    summary.style.display = 'block';
    summary.innerHTML = '<strong>' + S.sessions.length + ' seans o\'tkazildi</strong> - ' + pct + '% yaxshilanish<br>- ' + allRes.size + ' ta alomat yo\'qoldi - ' + S.remaining.length + ' ta qoldi';
  }
}

function showSessionDetail(session, dayNum) {
  const res = Array.isArray(session.resolved_symptoms) ? session.resolved_symptoms : [];
  const rem = Array.isArray(session.remaining_symptoms) ? session.remaining_symptoms : [];
  const resLines = res.length ? res.map(function(r){ return '  - ' + r; }).join('\n') : '  --';
  const remLines = rem.slice(0,5).map(function(r){ return '  - ' + r; }).join('\n') || '  --';
  const body = "Yo'qolgan: " + res.length + " ta\n" + resLines + "\n\nQolgan: " + rem.length + " ta\n" + remLines;
  showFinal(dayNum + '-seans natijasi', body, '');
}

function buildSessionSymptoms() {
  const rem = S.remaining.length ? S.remaining : S.labels;
  const c = $('session-symptoms-list'); if (!c) return;
  c.innerHTML = '';
  S.sessionSymbols = new Set();
  rem.forEach((sym, i) => {
    const div = document.createElement('div');
    div.className = 'sym-item';
    div.innerHTML = '<div class="sym-box"><svg class="sym-check" viewBox="0 0 14 14" fill="none"><polyline points="2,7 5.5,10.5 12,3.5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div><span class="sym-text">' + sym + '</span>';
    div.addEventListener('click', () => {
      S.sessionSymbols.has(i) ? (S.sessionSymbols.delete(i), div.classList.remove('checked'))
                              : (S.sessionSymbols.add(i),    div.classList.add('checked'));
    });
    c.appendChild(div);
  });
}

function initSessionAudio() {
  const audio = $('session-audio'), btn = $('session-audio-btn');
  const play  = $('session-ico-play'), pause = $('session-ico-pause');
  const fill  = $('session-audio-fill'), time = $('session-audio-time');
  const afterEl = $('session-after-listen');
  if (!audio || !btn) return;
  if (AUDIO) audio.src = AUDIO;
  const fmt = s => { const m = Math.floor(s/60), sec = Math.floor(s%60); return m + ':' + String(sec).padStart(2,'0'); };
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    if (fill) fill.style.width = (audio.currentTime/audio.duration*100) + '%';
    if (time) time.textContent = fmt(audio.currentTime) + ' / ' + fmt(audio.duration);
  });
  audio.addEventListener('ended', () => {
    if (play)  play.style.display  = '';
    if (pause) pause.style.display = 'none';
    if (fill)  fill.style.width = '0%';
    if (afterEl) afterEl.style.display = 'block';
    buildSessionSymptoms();
  });
  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      if (play)  play.style.display  = 'none';
      if (pause) pause.style.display = '';
    } else {
      audio.pause();
      if (play)  play.style.display  = '';
      if (pause) pause.style.display = 'none';
    }
  });
  const bar = document.querySelector('#session-audio-bar');
  if (bar) bar.addEventListener('click', e => {
    if (!audio.duration) return;
    const r = bar.getBoundingClientRect();
    audio.currentTime = (e.clientX - r.left) / r.width * audio.duration;
  });
}

function showFinal(title, body, extra) {
  if (extra === undefined) extra = '';
  const t = $('final-title'), b = $('final-body'), e = $('final-extra');
  if (t) t.textContent = title;
  if (b) { b.textContent = body; b.style.whiteSpace = 'pre-wrap'; }
  if (e) e.innerHTML = extra;
  go('s-final');
}

function showErr(id, msg) {
  const e = $(id); if (!e) return;
  e.textContent = msg; e.style.display = 'block';
  setTimeout(() => { e.style.display = 'none'; }, 3500);
}

/* ── AUDIO (main ruqiya screen) ── */
function initAudio() {
  const audio = $('ruqiya-audio'), btn = $('audio-btn');
  const play  = $('ico-play'), pause = $('ico-pause');
  const fill  = $('audio-fill'), time = $('audio-time');
  const miss  = $('audio-missing');
  if (!audio || !btn) return;
  if (!AUDIO) {
    if (miss) miss.style.display = 'block';
    btn.style.opacity = '.4'; btn.style.pointerEvents = 'none';
    return;
  }
  audio.src = AUDIO;
  const fmt = s => { const m = Math.floor(s/60), sec = Math.floor(s%60); return m + ':' + String(sec).padStart(2,'0'); };
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    if (fill) fill.style.width = (audio.currentTime/audio.duration*100) + '%';
    if (time) time.textContent = fmt(audio.currentTime) + ' / ' + fmt(audio.duration);
  });
  audio.addEventListener('ended', () => {
    if (play)  play.style.display  = '';
    if (pause) pause.style.display = 'none';
    if (fill)  fill.style.width    = '0%';
    S.session++;
    if (!S.remaining.length) S.remaining = [...S.labels];
    const ab = $('btn-after-listen');
    if (ab) ab.style.display = 'block';
  });
  btn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      if (play)  play.style.display  = 'none';
      if (pause) pause.style.display = '';
    } else {
      audio.pause();
      if (play)  play.style.display  = '';
      if (pause) pause.style.display = 'none';
    }
  });
  const bar = document.querySelector('.audio-bar');
  if (bar) bar.addEventListener('click', e => {
    if (!audio.duration) return;
    const r = bar.getBoundingClientRect();
    audio.currentTime = (e.clientX - r.left) / r.width * audio.duration;
  });
}

function goCalendar() { buildCalendar(); go('s-calendar'); }

/* ════════════════════════════════
   DOMContentLoaded
   ════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  if (tg) tg.BackButton.onClick(() => { const t = BACK[cur]; if (t) go(t); });
  $('btn-back')?.addEventListener('click', () => { const t = BACK[cur]; if (t) go(t); });

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-goto]');
    if (!el) return;
    go(el.dataset.goto);
  });

  /* tiles */
  document.querySelectorAll('.tile[data-goto]').forEach(t => {
    t.addEventListener('click', () => {
      const dest = t.dataset.goto;
      if (dest === 's-uyqu' && S.lastAnalysis) {
        buildDashboard(); go('s-dashboard'); return;
      }
      go(dest);
    });
  });

  /* SYMPTOM NEXT */
  $('btn-uyqu')?.addEventListener('click', () => go('s-ongi'));
  $('btn-ongi')?.addEventListener('click', () => go('s-xon'));
  $('btn-xon')?.addEventListener('click',  () => go('s-complaint'));

  /* COMPLAINT */
  $('btn-complaint')?.addEventListener('click', async () => {
    const txt = $('complaint-text')?.value.trim();
    if (!txt || txt.length < 10) return showErr('complaint-err', 'Kamida 10 ta belgi kiriting');
    S.labels    = allLabels();
    S.remaining = [...S.labels];
    go('s-loading');

    const payload = {
      uyqu_symptoms:    labelsOf(UYQU, S.uyqu),
      ongi_symptoms:    labelsOf(ONGI, S.ongi),
      xonadon_symptoms: labelsOf(XON,  S.xon),
      all_symptoms:     S.labels,
      complaint:        txt,
    };

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

    try {
      const userData = (() => { try { return JSON.parse(localStorage.getItem('tvd_user') || '{}'); } catch { return {}; } })();
      const phone = userData.phone || localStorage.getItem('tvd_phone') || '';
      const res = await fetch(API + '/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, phone }),
        signal: AbortSignal.timeout(35000),
      });
      clearInterval(iv);
      if (res.ok) {
        const data = await res.json();
        if (data.ok && data.answer) S.rag_answer = data.answer;
      }
    } catch(e) {
      console.warn('API analyze xatolik:', e.message);
    }

    clearInterval(iv);
    go('s-result');
  });

  /* RESULT */
  $('btn-to-offline')?.addEventListener('click', () => go('s-offline'));
  $('btn-to-ruqiya')?.addEventListener('click',  () => go('s-ruqiya'));

  /* AFTER LISTEN */
  $('btn-after-listen')?.addEventListener('click', () => go('s-tracking'));

  /* EFFECT items */
  document.querySelectorAll('.effect-item').forEach(item => {
    item.addEventListener('click', () => {
      const eff = item.dataset.effect;
      send('ruqiya_effect', { effect: eff });
      if (eff === 'yes') {
        showFinal("Allohga shukr!", "Ruqiya ta'sir qilmoqda - davom eting!\nAlomatlaringizni kuzatib boring.");
      } else if (eff === 'continue') {
        showFinal('Davom etmoqda', 'Ruqiyani davom ettiring. 11 kundan keyin qayta tekshiring.');
      } else {
        showFinal('Shaxsan tashrif tavsiya etiladi',
          "Onlayn ruqiya yordam bermagan bo'lsa, TIB VA DAM markaziga tashrif buyuring.\n\nYangi Toshkent, Gulzor MFY\nJumaday tashqari: 07:00 va 20:00",
          '<button class="btn btn-black" onclick="go(\'s-offline\')" style="margin-top:10px">Tashrif yozish</button>'
        );
      }
    });
  });

  /* TRACKING SAVE */
  $('btn-track-save')?.addEventListener('click', () => {
    const rem = S.remaining.length ? S.remaining : S.labels;
    const res = [...S.resolved].map(i => rem[i]).filter(Boolean);
    const newR = rem.filter((_, i) => !S.resolved.has(i));
    const status = !newR.length || res.length > 0 ? 'better' : 'same';
    S.remaining = newR;
    saveSession({ session: S.session, date: new Date().toISOString(), res, rem: newR, total: S.labels.length });
    send('symptom_tracking', { tracking_type:'online', session_num:S.session, resolved_symptoms:res, remaining_symptoms:newR, overall_status:status });
    if (!newR.length) {
      showFinal("Barcha alomatlar yo'qoldi!", "Allohga shukr! Siz " + S.session + " seans tingladi.\nAlloh taolo Sizi O'z rahmatida asrasin!",
        '<button class="btn btn-outline" onclick="go(\'s-history\')" style="margin-top:10px">Tarixni ko\'rish</button>');
    } else if (res.length) {
      showFinal(S.session + "-seans saqlandi",
        res.length + " ta alomat yaxshilandi\n" + newR.length + " ta alomat qoldi\n\nDavom eting. Alloh shifo bersin!",
        '<button class="btn btn-black" onclick="go(\'s-ruqiya\')" style="margin-top:10px">Yangi seans</button><button class="btn btn-outline" onclick="go(\'s-history\')" style="margin-top:8px">Tarixni ko\'rish</button>');
    } else {
      showFinal(S.session + "-seans saqlandi",
        "Bu seansda o'zgarish sezilmadi. Davom eting.\n\nAlloh shifo bersin!",
        '<button class="btn btn-black" onclick="go(\'s-ruqiya\')" style="margin-top:10px">Yangi seans</button>');
    }
  });

  /* OFFLINE */
  $('btn-offline')?.addEventListener('click', () => {
    if (!S.date) return showErr('offline-err', 'Sanani tanlang');
    if (!S.time) return showErr('offline-err', 'Vaqtni tanlang');
    send('offline_visit', { visit_date: S.date, visit_time: S.time });
    showFinal('Tashrifga yozilish tasdiqlandi!', S.date + ' - ' + S.time + '\nYangi Toshkent, Gulzor MFY\n\nMenejer siz bilan bog\'lanadi.');
  });

  /* INFO */
  document.querySelectorAll('.info-row[data-info]').forEach(row => {
    row.addEventListener('click', () => {
      const data = INFO_DATA[row.dataset.info]; if (!data) return;
      const c = $('info-content');
      if (c) c.innerHTML = '<div class="res-label">' + data.title + '</div><div class="res-text">' + data.body + '</div>';
      const mw = $('map-wrap'), mf = $('map-frame');
      if (mw && mf) {
        if (data.map) { mf.src = 'https://maps.google.com/maps?q=' + data.lat + ',' + data.lon + '&z=16&output=embed'; mw.style.display = 'block'; }
        else mw.style.display = 'none';
      }
      go('s-info-detail');
    });
  });

  /* DASHBOARD buttons */
  $('dash-btn-ruqiya')?.addEventListener('click', () => {
    S.sessionNum = S.sessions.length + 1;
    const lbl = $('session-num-label');
    if (lbl) lbl.textContent = S.sessionNum + '-seans';
    const afterEl = $('session-after-listen');
    if (afterEl) afterEl.style.display = 'none';
    S.currentFeelings = new Set();
    initSessionAudio();
    go('s-ruqiya-session');
  });
  $('dash-btn-offline')?.addEventListener('click', () => go('s-offline'));
  $('dash-btn-new')?.addEventListener('click', () => {
    S.uyqu = new Set(); S.ongi = new Set(); S.xon = new Set();
    S.rag_answer = '';
    go('s-uyqu');
  });

  /* FEELINGS */
  document.querySelectorAll('.feeling-item').forEach(item => {
    item.addEventListener('click', () => {
      const f = item.dataset.feeling;
      if (S.currentFeelings.has(f)) { S.currentFeelings.delete(f); item.classList.remove('active'); }
      else { S.currentFeelings.add(f); item.classList.add('active'); }
    });
  });

  /* SESSION SAVE */
  $('btn-session-save')?.addEventListener('click', async () => {
    const rem = S.remaining.length ? S.remaining : S.labels;
    const resolved  = rem.filter((_, i) => S.sessionSymbols.has(i));
    const remaining = rem.filter((_, i) => !S.sessionSymbols.has(i));
    S.remaining = remaining;

    const btn = $('btn-session-save');
    if (btn) { btn.disabled = true; btn.textContent = 'Saqlanmoqda...'; }

    const res = await apiPost('/api/ruqiya-track', {
      phone: S.phone,
      session_num: S.sessionNum,
      resolved_symptoms: resolved,
      remaining_symptoms: remaining,
      feelings: [...S.currentFeelings].join(', '),
    });

    if (res && res.ok) {
      S.sessions.unshift({ resolved_symptoms: resolved, remaining_symptoms: remaining, overall_status: resolved.length > 0 ? 'better' : 'same' });
      S.sessionNum++;
    }
    if (btn) { btn.disabled = false; btn.textContent = 'Seansni saqlash ->'; }

    if (S.remaining.length === 0 || S.sessions.length >= 11) {
      showFinal(
        S.remaining.length === 0 ? "Barcha alomatlar yo'qoldi!" : "11 kunlik kurs yakunlandi!",
        S.remaining.length === 0 ? "Allohga shukr! Siz " + S.sessions.length + " ta seans o'tkazdingiz.\nAlloh taolo Sizi O'z rahmatida asrasin!" : S.sessions.length + " seans o'tkazildi.\nMutaxassis ko'rigiga tashrif buyurish tavsiya etiladi.",
        '<button class="btn btn-outline" onclick="goCalendar()" style="margin-top:10px">Kalendarni ko\'rish</button>'
      );
    } else {
      showFinal(
        (S.sessionNum - 1) + "-seans yakunlandi",
        resolved.length + " ta alomat yaxshilandi\n" + remaining.length + " ta qolgan\n\nDavom eting. Alloh shifo bersin!",
        '<button class="btn btn-black" onclick="goCalendar()" style="margin-top:10px">Kalendarni ko\'rish</button>'
      );
    }
  });

  /* CALENDAR */
  $('btn-start-session')?.addEventListener('click', () => {
    S.sessionNum = S.sessions.length + 1;
    const lbl = $('session-num-label');
    if (lbl) lbl.textContent = S.sessionNum + '-seans';
    const afterEl = $('session-after-listen');
    if (afterEl) afterEl.style.display = 'none';
    S.currentFeelings = new Set();
    initSessionAudio();
    go('s-ruqiya-session');
  });

  /* CLOSE */
  $('btn-close')?.addEventListener('click', () => { if (tg) tg.close(); });

  /* START */
  initAudio();

  setTimeout(async () => {
    try {
      const saved = localStorage.getItem('tvd_user');
      if (saved) {
        const u = JSON.parse(saved);
        if (u && u.full_name) {
          S.reg = true;
          S.phone = u.phone || localStorage.getItem('tvd_phone') || '';
          if (S.phone) await loadLastAnalysis();
          go('s-menu');
          return;
        }
      }
    } catch(e) { console.warn('[TVD] start error:', e); }
    window.location.href = 'register.html';
  }, 100);
});
