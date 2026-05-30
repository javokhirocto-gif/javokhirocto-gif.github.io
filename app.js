/* TIB VA DAM Mini App — sendData only architecture */

const tg = window.Telegram?.WebApp || null;
if (tg) { tg.ready(); tg.expand(); tg.enableClosingConfirmation(); }

function send(action, payload = {}) {
  const d = JSON.stringify({ action, ...payload });
  if (tg) tg.sendData(d);
  else console.log('[bot]', action, payload);
}

const AUDIO = (typeof RUQIYA_AUDIO_URL !== 'undefined') ? RUQIYA_AUDIO_URL : '';
const BASE  = (typeof API_BASE !== 'undefined') ? API_BASE : '';

// Telegram user ID dan tg_id olish
function getTgId() {
  try {
    const raw = tg?.initDataUnsafe?.user?.id;
    if (raw) return raw;
    const match = (tg?.initData || '').match(/user=([^&]+)/);
    if (match) return JSON.parse(decodeURIComponent(match[1])).id || null;
  } catch {}
  return null;
}

// API call
async function api(path, method = 'GET', body = null) {
  if (!BASE) return null;
  const tgId = getTgId();
  try {
    const res = await fetch(BASE + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Tg-Id':      String(tgId || ''),
        'X-Init-Data':  tg?.initData || '',
      },
      body: body ? JSON.stringify(body) : null,
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) { console.error('API', res.status, path); return null; }
    return await res.json();
  } catch (e) {
    console.error('apiFetch', path, e.message);
    return null;
  }
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
    body: `O'zbekiston Xalq Tabobati Assotsiatsiyasining rasmiy a'zosi.

Oliy ma'lumotli mutaxassis — Misr, Saudiya Arabistoni, Turkiya, Moskva va Sankt-Peterburgda tahsil olgan.

"Ruhiy bezovtalik muolajasi" sohasida ixtisoslashgan tajribali Roqiy.`,
    map: false,
  },
  markaz: {
    title: 'TIB VA DAM markazi',
    body: `📍 Yangi Toshkent, Gulzor MFY\nYangi Qo'yliq bozori, Food City ko'chasi\n\n🕐 Jumaday tashqari har kuni\n• Ertalab: 07:00\n• Kechqurun: 20:00`,
    map: false,
  },
  manzil: {
    title: 'Manzil',
    body: `Yangi Toshkent, Gulzor MFY\nYangi Qo'yliq bozori, Food City ko'chasi\n\nJumaday tashqari har kuni: 07:00 va 20:00`,
    map: true, lat: 41.3264, lon: 69.3728,
  },
};

/* ── STATE ── */
const S = {
  reg: false,
  uyqu: new Set(), ongi: new Set(), xon: new Set(),
  labels: [], remaining: [],
  session: 0, resolved: new Set(),
  date: '', time: '',
};

function allLabels() {
  const o = [];
  UYQU.forEach(([l,k]) => S.uyqu.has(k) && o.push(l));
  ONGI.forEach(([l,k]) => S.ongi.has(k) && o.push(l));
  XON.forEach(([l,k])  => S.xon.has(k)  && o.push(l));
  return o;
}
function labelsOf(data, sel) { return data.filter(([,k]) => sel.has(k)).map(([l]) => l); }

function sessions() {
  try { return JSON.parse(localStorage.getItem('tvd_s') || '[]'); } catch { return []; }
}
function saveSession(d) {
  const a = sessions(); a.push(d);
  try { localStorage.setItem('tvd_s', JSON.stringify(a)); } catch {}
}

/* ── NAV ── */
const PROGRESS = {
  's-menu':0,'s-register':10,'s-uyqu':22,'s-ongi':40,'s-xon':58,
  's-complaint':72,'s-loading':77,'s-result':82,'s-ruqiya':84,
  's-check':88,'s-tracking':93,'s-history':60,
  's-offline':90,'s-info':5,'s-info-detail':5,'s-final':100,
};
const BACK = {
  's-register':'s-menu','s-uyqu':'s-menu','s-ongi':'s-uyqu','s-xon':'s-ongi',
  's-complaint':'s-xon','s-result':'s-menu','s-ruqiya':'s-menu',
  's-check':'s-ruqiya','s-tracking':'s-ruqiya','s-history':'s-ruqiya',
  's-offline':'s-menu','s-info':'s-menu','s-info-detail':'s-info','s-final':'s-menu',
};
let cur = '';

const $ = id => document.getElementById(id);

function go(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = $(id); if (!el) return;
  el.classList.add('active');
  cur = id;
  window.scrollTo({ top: 0 });
  const pct = PROGRESS[id] || 0;
  const pb = $('pbar'); if (pb) pb.style.width = pct + '%';
  const bb = $('back-bar'); if (bb) bb.style.display = id === 's-menu' ? 'none' : 'block';
  if (tg) id === 's-menu' ? tg.BackButton.hide() : tg.BackButton.show();
  if (id === 's-uyqu')    buildList('uyqu-list', UYQU, S.uyqu, 'uyqu-pill');
  if (id === 's-ongi')    buildList('ongi-list', ONGI, S.ongi, 'ongi-pill');
  if (id === 's-xon')     buildList('xon-list',  XON,  S.xon,  'xon-pill');
  if (id === 's-complaint') buildComplaint();
  if (id === 's-result')  buildResult();
  if (id === 's-tracking') buildTracking();
  if (id === 's-history') buildHistory();
  if (id === 's-offline') buildOffline();
}

function needReg(dest) {
  const REG_NEEDED = ['s-uyqu','s-ongi','s-xon','s-complaint','s-result',
    's-ruqiya','s-tracking','s-offline','s-history'];
  if (REG_NEEDED.includes(dest) && !S.reg) { go('s-register'); return true; }
  return false;
}

/* ── BUILD FUNCTIONS ── */
function buildList(cid, data, sel, pillId) {
  const c = $(cid); if (!c) return;
  c.innerHTML = '';
  const upd = () => {
    const p = $(pillId); if (!p) return;
    if (sel.size) { p.textContent = `${sel.size} ta belgilandi`; p.className = 'count-pill active'; }
    else          { p.textContent = 'Hech narsa belgilanmadi';   p.className = 'count-pill empty'; }
  };
  data.forEach(([lbl, key]) => {
    const row = document.createElement('div');
    row.className = 'sym-item' + (sel.has(key) ? ' checked' : '');
    row.innerHTML = `<div class="sym-box">
      <svg class="sym-check" viewBox="0 0 14 14" fill="none">
        <polyline points="2,7 5.5,10.5 12,3.5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div><span class="sym-text">${lbl}</span>`;
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
    ? lbl.map(l => `<span class="tag">${l}</span>`).join('')
    : '<span class="tag">Alomatlar belgilanmagan</span>';
}

function buildResult() {
  const lbl = allLabels();
  S.labels = lbl;
  if (!S.remaining.length) S.remaining = [...lbl];
  const t = $('result-tags');
  if (t) t.innerHTML = lbl.length ? lbl.map(l => `<span class="tag">${l}</span>`).join('') : '<span class="tag">—</span>';
  const s = $('result-sub');
  if (s) s.textContent = `${lbl.length} ta alomat aniqlandi`;
}

function buildTracking() {
  const rem = S.remaining.length ? S.remaining : S.labels;
  const sub = $('track-sub');
  if (sub) sub.textContent = `${S.session}-seans · Qaysi alomatlar yo'qoldi?`;

  const stats = $('track-stats');
  if (stats) stats.innerHTML = `
    <div class="stat-box"><div class="stat-n">${S.labels.length}</div><div class="stat-l">Jami</div></div>
    <div class="stat-box"><div class="stat-n g" id="res-num">${S.resolved.size}</div><div class="stat-l">Yo'qoldi</div></div>
    <div class="stat-box"><div class="stat-n r" id="rem-num">${rem.length}</div><div class="stat-l">Qolgan</div></div>`;

  S.resolved = new Set();
  const c = $('track-list'); if (!c) return;
  c.innerHTML = '';

  if (!rem.length) {
    c.innerHTML = '<div class="notice notice-info">🎉 Barcha alomatlar yo\'qoldi! Allohga shukr!</div>';
    return;
  }

  rem.forEach((sym, i) => {
    const row = document.createElement('div');
    row.className = 'sym-item';
    row.innerHTML = `<div class="sym-box">
      <svg class="sym-check" viewBox="0 0 14 14" fill="none">
        <polyline points="2,7 5.5,10.5 12,3.5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div><span class="sym-text">${sym}</span>`;
    row.addEventListener('click', () => {
      S.resolved.has(i) ? (S.resolved.delete(i), row.classList.remove('checked'))
                        : (S.resolved.add(i),    row.classList.add('checked'));
      const rn = $('res-num'), remn = $('rem-num');
      if (rn)   rn.textContent   = S.resolved.size;
      if (remn) remn.textContent = rem.length - S.resolved.size;
    });
    c.appendChild(row);
  });
}

function buildHistory() {
  const c = $('history-list'); if (!c) return;
  const list = sessions();
  const total = S.labels.length;

  if (!list.length) {
    c.innerHTML = '<div class="notice notice-plain" style="text-align:center">Hali hech qanday seans bo\'lmagan.<br>Ruqiyani tinglashni boshlang.</div>';
    return;
  }

  const allRes = new Set(list.flatMap(s => s.res || []));
  const pct = total > 0 ? Math.round(allRes.size / total * 100) : 0;

  let html = `<div class="hist-summary">
    <div class="hist-pct">${pct}%</div>
    <div class="hist-lbl">Umumiy yaxshilanish · ${allRes.size} ta alomat yo'qoldi</div>
    <div class="hist-bar"><div class="hist-bar-f" style="width:${pct}%"></div></div>
  </div>`;

  [...list].reverse().forEach((s, i) => {
    const num = list.length - i;
    const res = s.res || [];
    const rem = s.rem || [];
    const date = s.date ? new Date(s.date).toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'}) : '—';
    const sp = total > 0 ? Math.round(res.length / total * 100) : 0;
    html += `<div class="hist-card">
      <div class="hist-head">
        <span class="hist-num">${num}-seans</span>
        <span class="hist-date">${date}</span>
      </div>
      <div class="hist-prog"><div class="hist-prog-f" style="width:${sp}%"></div></div>
      ${res.length ? `<div class="tags">${res.map(r=>`<span class="tag tag-g">${r}</span>`).join('')}</div>` : ''}
      ${rem.length ? `<div class="tags" style="margin-top:5px">${rem.slice(0,4).map(r=>`<span class="tag tag-r">${r}</span>`).join('')}${rem.length>4?`<span class="tag tag-r">+${rem.length-4}</span>`:''}</div>` : ''}
    </div>`;
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
      btn.innerHTML = `<span class="pk">${d.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'})}</span><span class="ps">${WD[d.getDay()]}</span>`;
      btn.addEventListener('click', () => {
        document.querySelectorAll('#date-grid .pick').forEach(b => b.classList.remove('sel'));
        btn.classList.add('sel');
        S.date = iso; updOffline();
      });
      grid.appendChild(btn); n++;
    }
    d.setDate(d.getDate() + 1);
  }
  // reset time buttons
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
    s.textContent = `${S.date} — ${S.time}`;
    c.style.display = 'block';
  }
}

function showFinal(title, body, extra = '') {
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

/* ── AUDIO ── */
function initAudio() {
  const audio = $('ruqiya-audio');
  const btn   = $('audio-btn');
  const play  = $('ico-play');
  const pause = $('ico-pause');
  const fill  = $('audio-fill');
  const time  = $('audio-time');
  const miss  = $('audio-missing');
  if (!audio || !btn) return;

  if (!AUDIO) {
    if (miss) miss.style.display = 'block';
    btn.style.opacity = '.4'; btn.style.pointerEvents = 'none';
    return;
  }
  audio.src = AUDIO;

  const fmt = s => { const m = Math.floor(s/60), sec = Math.floor(s%60); return `${m}:${String(sec).padStart(2,'0')}`; };

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const p = audio.currentTime / audio.duration * 100;
    if (fill) fill.style.width = p + '%';
    if (time) time.textContent = `${fmt(audio.currentTime)} / ${fmt(audio.duration)}`;
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

/* ════════════════════════════════════
   DOMContentLoaded — ALL LISTENERS
   ════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  if (tg) tg.BackButton.onClick(() => { const t = BACK[cur]; if (t) go(t); });
  $('btn-back')?.addEventListener('click', () => { const t = BACK[cur]; if (t) go(t); });

  /* data-goto */
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-goto]');
    if (!el) return;
    const dest = el.dataset.goto;
    if (needReg(dest)) return;
    go(dest);
  });

  /* tiles (menu) */
  document.querySelectorAll('.tile[data-goto]').forEach(t => {
    t.addEventListener('click', () => {
      if (needReg(t.dataset.goto)) return;
      go(t.dataset.goto);
    });
  });

  /* REGISTER */
  $('btn-reg')?.addEventListener('click', async () => {
    const name   = $('reg-name')?.value.trim();
    const age    = $('reg-age')?.value.trim();
    const region = $('reg-region')?.value.trim();
    const phone  = $('reg-phone')?.value.trim();
    if (!name || name.length < 3)               return showErr('reg-err', "Ism kamida 3 ta harf bo'lsin");
    if (!age || isNaN(age) || +age < 5 || +age > 120) return showErr('reg-err', "Yoshni to'g'ri kiriting");
    if (!region)                                 return showErr('reg-err', 'Viloyatni kiriting');
    if (!phone)                                  return showErr('reg-err', 'Telefon raqamini kiriting');

    const btn = $('btn-reg');
    if (btn) { btn.disabled = true; btn.textContent = 'Saqlanmoqda...'; }

    const payload = {
      full_name: name, age: +age, region, phone,
      tg_id:    getTgId(),
      username: tg?.initDataUnsafe?.user?.username || '',
    };

    // API orqali DB ga saqlash
    const res = await api('/api/register', 'POST', payload);
    if (res?.ok) {
      console.log("✅ DB ga saqlandi:", res.user?.full_name);
    } else {
      console.warn("⚠️ API xatolik — faqat bot orqali saqlanadi");
    }

    if (btn) { btn.disabled = false; btn.textContent = 'Davom etish →'; }

    S.reg = true;
    send('register', payload); // Botga ham yuborish
    go('s-uyqu');
  });

  /* SYMPTOM NEXT */
  $('btn-uyqu')?.addEventListener('click', () => go('s-ongi'));
  $('btn-ongi')?.addEventListener('click', () => go('s-xon'));
  $('btn-xon')?.addEventListener('click',  () => go('s-complaint'));

  /* COMPLAINT → LOADING */
  $('btn-complaint')?.addEventListener('click', () => {
    const txt = $('complaint-text')?.value.trim();
    if (!txt || txt.length < 10) return showErr('complaint-err', 'Kamida 10 ta belgi kiriting');
    S.labels    = allLabels();
    S.remaining = [...S.labels];
    go('s-loading');

    send('analysis', {
      uyqu_symptoms:    labelsOf(UYQU, S.uyqu),
      ongi_symptoms:    labelsOf(ONGI, S.ongi),
      xonadon_symptoms: labelsOf(XON,  S.xon),
      all_symptoms:     S.labels,
      complaint:        txt,
    });

    const msgs = [
      ['Tahlil qilinmoqda',       'Bot javob tayyorlamoqda'],
      ['Alomatlar tekshirilmoqda', 'Biroz sabr qiling'],
      ['Deyarli tayyor',           'Natija chatda ko\'rinadi'],
    ];
    let mi = 0;
    const iv = setInterval(() => {
      mi = (mi + 1) % msgs.length;
      const t = $('load-title'), s = $('load-sub');
      if (t) t.textContent = msgs[mi][0];
      if (s) s.textContent = msgs[mi][1];
    }, 3000);
    setTimeout(() => { clearInterval(iv); go('s-result'); }, 9000);
  });

  /* RESULT buttons */
  $('btn-to-offline')?.addEventListener('click', () => go('s-offline'));
  $('btn-to-ruqiya')?.addEventListener('click',  () => go('s-ruqiya'));

  /* AFTER LISTEN */
  $('btn-after-listen')?.addEventListener('click', () => go('s-tracking'));

  /* 11 KUN EFFECT */
  document.querySelectorAll('.effect-item').forEach(item => {
    item.addEventListener('click', () => {
      const eff = item.dataset.effect;
      send('ruqiya_effect', { effect: eff });
      if (eff === 'yes') {
        showFinal('Allohga shukr!', 'Ruqiya ta\'sir qilmoqda — davom eting!\nAlomatlaringizni kuzatib boring.');
      } else if (eff === 'continue') {
        showFinal('Davom etmoqda', 'Ruqiyani davom ettiring. 11 kundan keyin qayta tekshiring.');
      } else {
        showFinal('Shaxsan tashrif tavsiya etiladi',
          'Onlayn ruqiya yordam bermagan bo\'lsa, TIB VA DAM markaziga tashrif buyuring.\n\n📍 Yangi Toshkent, Gulzor MFY\n🕐 Jumaday tashqari: 07:00 va 20:00',
          `<button class="btn btn-black" onclick="go('s-offline')" style="margin-top:10px">Tashrif yozish</button>`
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
      showFinal('Barcha alomatlar yo\'qoldi!',
        `Allohga shukr! Siz ${S.session} seans tingladi.\nAlloh taolo Sizi O'z rahmatida asrasin!`,
        `<button class="btn btn-outline" onclick="go('s-history')" style="margin-top:10px">Tarixni ko'rish</button>`
      );
    } else if (res.length) {
      showFinal(`${S.session}-seans saqlandi`,
        `✅ ${res.length} ta alomat yaxshilandi\n🔴 ${newR.length} ta alomat qoldi\n\nDavom eting. Alloh shifo bersin!`,
        `<button class="btn btn-black" onclick="go('s-ruqiya')" style="margin-top:10px">Yangi seans</button>
         <button class="btn btn-outline" onclick="go('s-history')" style="margin-top:8px">Tarixni ko'rish</button>`
      );
    } else {
      showFinal(`${S.session}-seans saqlandi`,
        'Bu seansda o\'zgarish sezilmadi. Davom eting.\n\nAlloh shifo bersin!',
        `<button class="btn btn-black" onclick="go('s-ruqiya')" style="margin-top:10px">Yangi seans</button>`
      );
    }
  });

  /* OFFLINE CONFIRM */
  $('btn-offline')?.addEventListener('click', () => {
    if (!S.date) return showErr('offline-err', 'Sanani tanlang');
    if (!S.time) return showErr('offline-err', 'Vaqtni tanlang');
    send('offline_visit', { visit_date: S.date, visit_time: S.time });
    showFinal('Tashrif tasdiqlandi!',
      `📅 ${S.date} — ⏰ ${S.time}\n📍 Yangi Toshkent, Gulzor MFY\n\nMenejer siz bilan bog'lanadi.`
    );
  });

  /* INFO ROWS */
  document.querySelectorAll('.info-row[data-info]').forEach(row => {
    row.addEventListener('click', () => {
      const data = INFO_DATA[row.dataset.info]; if (!data) return;
      const c = $('info-content');
      if (c) c.innerHTML = `<div class="res-label">${data.title}</div><div class="res-text">${data.body}</div>`;
      const mw = $('map-wrap'), mf = $('map-frame');
      if (mw && mf) {
        if (data.map) { mf.src = `https://maps.google.com/maps?q=${data.lat},${data.lon}&z=16&output=embed`; mw.style.display = 'block'; }
        else mw.style.display = 'none';
      }
      go('s-info-detail');
    });
  });

  /* CLOSE */
  $('btn-close')?.addEventListener('click', () => { if (tg) tg.close(); });

  /* START */
  initAudio();
  loadOnStart();
});

/* ── ЗАГРУЗКА ПРИ СТАРТЕ ── */
async function loadOnStart() {
  const tgId = getTgId();

  // Если нет API — просто открываем меню
  if (!BASE || !tgId) { go('s-menu'); return; }

  // Показываем loading пока проверяем
  go('s-loading');
  const lt = $('load-title'), ls = $('load-sub');
  if (lt) lt.textContent = 'Yuklanmoqda';
  if (ls) ls.textContent = 'Biroz sabr qiling';

  try {
    // Проверяем: зарегистрирован ли пользователь?
    const res = await api(`/api/user/${tgId}`);

    if (res?.ok && res.user) {
      // Уже зарегистрирован — прямо в меню
      S.reg = true;
      console.log('✅ Foydalanuvchi topildi:', res.user.full_name);

      // Загружаем последний анализ если есть
      const aRes = await api(`/api/analysis/${tgId}`);
      if (aRes?.ok && aRes.analysis) {
        S.labels    = aRes.analysis.symptoms || [];
        S.remaining = [...S.labels];
      }

      go('s-menu');
    } else {
      // Не зарегистрирован — показываем форму
      go('s-register');
    }
  } catch (e) {
    console.error('loadOnStart:', e);
    go('s-menu');
  }
}
