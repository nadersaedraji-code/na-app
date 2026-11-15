/* ============================================================
   N&A — app
   Vanilla JS, local-first. IndexedDB holds the truth; the UI
   renders optimistically and never waits on a network.
   ============================================================ */

import * as db from './db.js';
import * as sync from './sync.js';
import {
  METHODS, PRAYER_ORDER, dayTimes, suggest, nextPrayer, fmtTime, fmtCountdown,
} from './prayertimes.js';

const APP_VERSION = '1.4.0';
const LOCALE = 'en-GB';

/* Sample history is off. A new space starts genuinely empty — no
   imaginary prayers from an imaginary partner. */
const SEED_SAMPLE = false;
const RELEASES = [
  { v: '1.4.0', at: '15 Nov 2026', notes: "Lighter, warmer, pinker — blush cream by day, soft plum by night." },
  { v: '1.3.0', at: '15 Nov 2026', notes: "Starts empty — no sample days, no imaginary prayers." },
  { v: '1.2.1', at: '15 Nov 2026', notes: "Resetting now forgets everything, including the pairing code." },
  { v: '1.2.0', at: '15 Nov 2026', notes: "A home of your own, and a softer look throughout." },
  { v: '1.1.4', at: '15 Nov 2026', notes: "Reset clears the whole space, as it should." },
  { v: '1.1.3', at: '15 Nov 2026', notes: "Background updates without touching your data." },
  { v: '1.1.2', at: '15 Nov 2026', notes: "Quieter first launch and reliable background updates." },
  { v: '1.1.1', at: '15 Nov 2026', notes: "Sync-ready groundwork and a calmer first launch." },
  { v: '1.1.0', at: '15 Nov 2026', notes: 'Updates land on their own — reopen the app and the new build is already there.' },
  { v: '1.0.1', at: '15 Nov 2026', notes: 'Prayer times refined, quieter motion, a real Undo button.' },
  { v: '1.0.0', at: '15 Nov 2026', notes: 'First light — prayers, plans, daily review, and a calendar of every day you share.' },
];

const PMETA = {
  fajr: { name: 'Fajr', ar: 'الفجر', abbr: 'F' },
  dhuhr: { name: 'Dhuhr', ar: 'الظهر', abbr: 'Z' },
  asr: { name: 'Asr', ar: 'العصر', abbr: 'A' },
  maghrib: { name: 'Maghrib', ar: 'المغرب', abbr: 'M' },
  isha: { name: 'Isha', ar: 'العشاء', abbr: 'I' },
};

const STATUS_LABEL = {
  ontime: 'On time',
  late: 'Late',
  missed: 'Missed',
  pending: 'Not logged',
};

const PALETTE = ['#E8749B', '#B98BC9', '#F0A48C', '#8FBFD9', '#9BC9AE', '#D9A0C2'];
const AVATARS = ['🌙', '⭐', '🌿', '🌸', '☀️', '🕊️', '🍃', '🔥', '🌊'];

const DEFAULTS = {
  lat: 48.8566,
  lng: 2.3522,
  place: 'Paris',
  method: 'MWL',
  theme: 'light',
  notif: { prayer: true, followup: true, review: true, partner: true },
  silent: [22, 7],
};

/* Best guess at where you are, from the device's own timezone.
   Wrong guesses are one tap from fixed in Settings. */
const TZ_CITY = {
  'Europe/Paris': ['Paris', 48.8566, 2.3522],
  'Europe/Brussels': ['Brussels', 50.8503, 4.3517],
  'Europe/London': ['London', 51.5072, -0.1276],
  'Europe/Madrid': ['Madrid', 40.4168, -3.7038],
  'Europe/Lisbon': ['Lisbon', 38.7223, -9.1393],
  'Europe/Rome': ['Rome', 41.9028, 12.4964],
  'Europe/Berlin': ['Berlin', 52.52, 13.405],
  'Europe/Amsterdam': ['Amsterdam', 52.3676, 4.9041],
  'Europe/Geneva': ['Geneva', 46.2044, 6.1432],
  'Europe/Zurich': ['Zurich', 47.3769, 8.5417],
  'Europe/Bucharest': ['Bucharest', 44.4268, 26.1025],
  'Europe/Athens': ['Athens', 37.9838, 23.7275],
  'Europe/Istanbul': ['Istanbul', 41.0082, 28.9784],
  'Africa/Casablanca': ['Casablanca', 33.5731, -7.5898],
  'Africa/Algiers': ['Algiers', 36.7538, 3.0588],
  'Africa/Tunis': ['Tunis', 36.8065, 10.1815],
  'Africa/Cairo': ['Cairo', 30.0444, 31.2357],
  'Africa/Dakar': ['Dakar', 14.7167, -17.4677],
  'Africa/Abidjan': ['Abidjan', 5.36, -4.0083],
  'Asia/Beirut': ['Beirut', 33.8938, 35.5018],
  'Asia/Amman': ['Amman', 31.9454, 35.9284],
  'Asia/Riyadh': ['Riyadh', 24.7136, 46.6753],
  'Asia/Dubai': ['Dubai', 25.2048, 55.2708],
  'Asia/Qatar': ['Doha', 25.2854, 51.531],
  'Asia/Karachi': ['Karachi', 24.8607, 67.0011],
  'Asia/Jakarta': ['Jakarta', -6.2088, 106.8456],
  'Asia/Kuala_Lumpur': ['Kuala Lumpur', 3.139, 101.6869],
  'America/New_York': ['New York', 40.7128, -74.006],
  'America/Chicago': ['Chicago', 41.8781, -87.6298],
  'America/Denver': ['Denver', 39.7392, -104.9903],
  'America/Los_Angeles': ['Los Angeles', 34.0522, -118.2437],
  'America/Toronto': ['Toronto', 43.6532, -79.3832],
  'America/Montreal': ['Montréal', 45.5019, -73.5674],
  'America/Vancouver': ['Vancouver', 49.2827, -123.1207],
  'America/Mexico_City': ['Mexico City', 19.4326, -99.1332],
  'America/Bogota': ['Bogotá', 4.711, -74.0721],
  'America/Sao_Paulo': ['São Paulo', -23.5505, -46.6333],
  'America/Argentina/Buenos_Aires': ['Buenos Aires', -34.6037, -58.3816],
  'Europe/Kyiv': ['Kyiv', 50.4501, 30.5234],
  'Europe/Warsaw': ['Warsaw', 52.2297, 21.0122],
  'Europe/Prague': ['Prague', 50.0755, 14.4378],
  'Europe/Vienna': ['Vienna', 48.2082, 16.3738],
  'Europe/Budapest': ['Budapest', 47.4979, 19.0402],
  'Europe/Sofia': ['Sofia', 42.6977, 23.3219],
  'Europe/Belgrade': ['Belgrade', 44.7866, 20.4489],
  'Europe/Zagreb': ['Zagreb', 45.815, 15.9819],
  'Europe/Stockholm': ['Stockholm', 59.3293, 18.0686],
  'Europe/Oslo': ['Oslo', 59.9139, 10.7522],
  'Europe/Copenhagen': ['Copenhagen', 55.6761, 12.5683],
  'Europe/Helsinki': ['Helsinki', 60.1699, 24.9384],
  'Europe/Dublin': ['Dublin', 53.3498, -6.2603],
  'Africa/Lagos': ['Lagos', 6.5244, 3.3792],
  'Africa/Nairobi': ['Nairobi', -1.2921, 36.8219],
  'Africa/Accra': ['Accra', 5.6037, -0.187],
  'Asia/Muscat': ['Muscat', 23.588, 58.3829],
  'Asia/Kuwait': ['Kuwait City', 29.3759, 47.9774],
  'Asia/Baghdad': ['Baghdad', 33.3152, 44.3661],
  'Asia/Tehran': ['Tehran', 35.6892, 51.389],
  'Asia/Kolkata': ['Delhi', 28.6139, 77.209],
  'Asia/Dhaka': ['Dhaka', 23.8103, 90.4125],
  'Asia/Singapore': ['Singapore', 1.3521, 103.8198],
  'Asia/Tokyo': ['Tokyo', 35.6762, 139.6503],
  'Australia/Sydney': ['Sydney', -33.8688, 151.2093],
  'Australia/Melbourne': ['Melbourne', -37.8136, 144.9631],
};

function detectLocation() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const hit = TZ_CITY[tz];
  if (hit) return { place: hit[0], lat: hit[1], lng: hit[2] };
  // Unknown zone: fall back to the middle of that timezone's meridian.
  const offset = -new Date().getTimezoneOffset() / 60;
  return { place: 'Approximate', lat: 30, lng: Math.max(-180, Math.min(180, offset * 15)) };
}

const S = {
  meta: {},
  members: [],
  prayers: [],
  plan: [],
  reviews: [],
  reactions: [],
  settings: { ...DEFAULTS },
  viewerId: null,
  viewingAs: null,
  view: 'home',
  planTab: 'mine',
  calMonth: null,
  scroll: {},
  justLogged: null,
  syncState: 'off',
  suppressAnim: false,
  pendingRemote: false,
  ready: false,
};

const timeCache = new Map();

/* ---------- small helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () =>
  crypto.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
const pad = (n) => String(n).padStart(2, '0');
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const haptic = (ms = 8) => { try { navigator.vibrate?.(ms); } catch { /* iOS */ } };

const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDay = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const dayLabel = (k) => parseDay(k).toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Still awake';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 22) return 'Good evening';
  return 'Good night';
}

/* ---------- state access ---------- */
const memberById = (id) => S.members.find((m) => m.id === id) || null;
const me = () => memberById(S.viewerId);
const actor = () => memberById(S.viewingAs || S.viewerId);
const other = (m) => S.members.find((x) => x.id !== m?.id) || null;
const isPreview = () => !!S.viewingAs && S.viewingAs !== S.viewerId;

const getPrayer = (memberId, day, key) =>
  S.prayers.find((p) => p.memberId === memberId && p.day === day && p.key === key) || null;
const planFor = (memberId, day) =>
  S.plan.filter((t) => t.memberId === memberId && t.day === day).sort((a, b) => a.position - b.position);
const reviewFor = (memberId, day) =>
  S.reviews.find((r) => r.memberId === memberId && r.day === day) || null;
const reactionFor = (from, type, targetId) =>
  S.reactions.find((r) => r.from === from && r.targetType === type && r.targetId === targetId) || null;

const times = (day) => {
  if (!timeCache.has(day)) timeCache.set(day, dayTimes(day, S.settings));
  return timeCache.get(day);
};

const isDue = (day, key) => {
  if (day !== dayKey()) return true;
  return new Date() >= times(day)[key];
};

function prayerCount(memberId, day) {
  let on = 0;
  for (const k of PRAYER_ORDER) {
    const r = getPrayer(memberId, day, k);
    if (r && r.status !== 'missed') on++;
  }
  return on;
}

/* ---------- persistence ---------- */
async function savePrayer(memberId, day, key, status) {
  const id = `${memberId}|${day}|${key}`;
  let rec = S.prayers.find((p) => p.id === id);
  if (!rec) {
    rec = { id, memberId, day, key, status, loggedAt: Date.now(), demo: false };
    S.prayers.push(rec);
  } else {
    rec.status = status;
    rec.loggedAt = Date.now();
    rec.demo = false;
  }
  await db.put('prayers', rec);
  return rec;
}

async function savePlan(item) {
  const i = S.plan.findIndex((t) => t.id === item.id);
  if (i >= 0) S.plan[i] = item;
  else S.plan.push(item);
  await db.put('plan', item);
  return item;
}

async function saveReview(rec) {
  const i = S.reviews.findIndex((r) => r.id === rec.id);
  if (i >= 0) S.reviews[i] = rec;
  else S.reviews.push(rec);
  await db.put('reviews', rec);
  return rec;
}

async function saveReaction(rec) {
  const i = S.reactions.findIndex((r) => r.id === rec.id);
  if (i >= 0) S.reactions[i] = rec;
  else S.reactions.push(rec);
  await db.put('reactions', rec);
  return rec;
}

/* ---------- boot ---------- */
async function boot() {
  try {
    await db.ensureSchema();
    await loadState();
    db.setHooks({
      onWrite: (store, rec) => sync.queueWrite(store, rec),
      onDelete: (store, id) => sync.queueDelete(store, id),
    });
    sync.attach({ onChange: onRemoteChange, onStatus: (s) => { S.syncState = s; } });
    await sync.load();
  } catch (err) {
    console.error(err);
    toast('Could not open local storage');
  }

  if (!S.members.length || !S.viewerId) {
    renderOnboarding();
  } else {
    showApp();
    if (sync.isOn()) {
      sync.startPolling();
      sync.pull();
    }
  }

  mountInstallPrompt();
  const updated = sessionStorage.getItem('na:updated');
  if (updated) {
    sessionStorage.removeItem('na:updated');
    setTimeout(() => toast(`Updated to v${updated}`), 700);
  }
  S.ready = true;
}

async function loadState() {
  const d = await db.loadAll();
  S.meta = d.meta || {};
  S.members = d.members || [];
  S.prayers = d.prayers || [];
  S.plan = d.plan || [];
  S.reviews = d.reviews || [];
  S.reactions = d.reactions || [];
  S.settings = { ...DEFAULTS, ...(S.meta.settings?.value || {}) };
  S.settings.notif = { ...DEFAULTS.notif, ...(S.settings.notif || {}) };
  S.viewerId = d.meta?.app?.viewerId || S.members[0]?.id || null;
  if (!S.calMonth) S.calMonth = new Date(getNow().getFullYear(), getNow().getMonth(), 1);
  applyTheme();
}

/* A single indirection so "today" is always fresh after midnight. */
function getNow() { return new Date(); }

function applyTheme() {
  const pref = S.settings.theme || 'light';
  const dark = pref === 'dark' || (pref === 'system' && !window.matchMedia('(prefers-color-scheme: light)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', dark ? '#191419' : '#FBF6F4');
}

function showApp() {
  $('#onboarding').hidden = true;
  $('#onboarding').innerHTML = '';
  $('#app').hidden = false;
  render();
}

/* ============================================================
   Onboarding — name, colour, partner. Under 30 seconds.
   ============================================================ */
const ob = { step: 1, name: '', color: PALETTE[0], avatar: AVATARS[0], partner: '' };

function renderOnboarding() {
  const root = $('#onboarding');
  root.hidden = false;
  $('#app').hidden = true;

  root.innerHTML = `
    <div class="onboard-inner">
      <div style="display:flex;justify-content:center;margin-bottom:44px">
        <div class="mark"><i></i><i></i><span>N &amp; A</span></div>
      </div>
      <div class="dot-row" id="ob-dots">
        <i class="on"></i><i></i><i></i>
      </div>

      <section class="step on" data-step="1">
        <h2>What should I<br>call you?</h2>
        <p class="lede">One name, nothing else. This space is yours and one other person's.</p>
        <input class="big" id="ob-name" placeholder="Your name" autocomplete="given-name" maxlength="18" enterkeyhint="continue">
        <div class="actions">
          <button class="btn primary wide" data-act="ob-next" disabled id="ob-name-btn">Continue</button>
        </div>
      </section>

      <section class="step" data-step="2">
        <h2>Pick your light</h2>
        <p class="lede">A colour that's yours across the app — your column, your ring, your line.</p>
        <div class="swatches" style="justify-content:center;margin-bottom:22px">
          ${PALETTE.map(
            (c, i) => `<button class="swatch" data-act="ob-color" data-color="${c}" aria-checked="${i === 0}" style="background:${c}"></button>`
          ).join('')}
        </div>
        <div class="avatars" style="margin-bottom:8px">
          ${AVATARS.map(
            (a, i) => `<button class="av-pick" data-act="ob-avatar" data-avatar="${a}" aria-checked="${i === 0}">${a}</button>`
          ).join('')}
        </div>
        <div class="actions">
          <button class="btn primary wide" data-act="ob-step" data-step="3">Continue</button>
        </div>
      </section>

      <section class="step" data-step="3">
        <h2>And the<br>other half?</h2>
        <p class="lede">Their name — so the app knows who it's cheering for. You can invite them properly later.</p>
        <input class="big" id="ob-partner" placeholder="Their name" maxlength="18" enterkeyhint="done">
        <div class="actions">
          <button class="btn primary wide" data-act="ob-finish">Enter</button>
          <button class="btn ghost wide" data-act="ob-finish" data-solo="1">Just me for now</button>
        </div>
      </section>
    </div>`;

  const nameInput = $('#ob-name');
  nameInput?.addEventListener('input', () => {
    ob.name = nameInput.value.trim();
    $('#ob-name-btn').disabled = !ob.name;
  });
  nameInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && ob.name) showObStep(2);
  });
  $('#ob-partner')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') completeOnboarding(false);
  });
  setTimeout(() => nameInput?.focus(), 260);
}

function showObStep(n) {
  ob.step = n;
  document.querySelectorAll('.onboard .step').forEach((s) => {
    s.classList.toggle('on', Number(s.dataset.step) === n);
  });
  document.querySelectorAll('#ob-dots i').forEach((d, i) => d.classList.toggle('on', i === n - 1));
  const last = document.querySelector(`.onboard .step[data-step="${n}"] h2`);
  last?.animate?.([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.22,1,.36,1)' });
}

async function completeOnboarding(solo) {
  const partnerName = solo ? '' : ($('#ob-partner')?.value || '').trim();
  const meId = uid();
  const myColor = ob.color;
  const partnersColor = PALETTE.find((c) => c !== myColor) || PALETTE[1];

  const members = [{
    id: meId,
    name: ob.name || 'Me',
    color: myColor,
    avatar: ob.avatar,
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    joinedAt: Date.now(),
  }];

  if (partnerName) {
    members.push({
      id: uid(),
      name: partnerName,
      color: partnersColor,
      avatar: AVATARS.find((a) => a !== ob.avatar) || '⭐',
      tz: members[0].tz,
      joinedAt: Date.now(),
    });
  }

  await db.putMany('members', members);
  const loc = detectLocation();
  const firstSettings = { ...DEFAULTS, ...loc, notif: { ...DEFAULTS.notif } };
  await db.put('meta', { key: 'settings', value: firstSettings });
  await db.saveMeta('app', { viewerId: meId, schemaVersion: db.SCHEMA_VERSION });
  if (SEED_SAMPLE) {
    try {
      await seedSample(members);
    } catch (err) {
      console.warn('Sample history could not be written', err);
    }
  }

  S.members = members;
  S.viewerId = meId;
  S.settings = firstSettings;
  await loadState();
  showApp();
  setTimeout(() => toast(`Welcome, ${members[0].name}`), 500);
}

/* Sample history so the calendar and partner column are alive
   from the first minute. Every row is flagged demo:true and can
   be removed from Settings without touching real entries. */
async function seedSample(members) {
  const existing = await db.get('meta', 'seeded');
  if (existing) return;

  const prayers = [];
  const plan = [];
  const reviews = [];
  const wins = [
    'Finished the thing I kept postponing.',
    'Long walk after work, head clear.',
    'Cooked something new — it worked.',
    'Called home.',
    'Read 30 pages, no phone in the room.',
    'Cleared the inbox, finally.',
    'Early night, woke up human.',
    'Fixed the shelf. Small victory.',
  ];
  const tasks = [
    'Morning walk', 'Reply to the emails', 'Deep work block', 'Groceries',
    'Call the bank', 'Clean the kitchen', 'Study for 40 minutes', 'Book the tickets',
    'Stretch before bed', 'Meal prep', 'Finish the report', 'Water the plants',
  ];

  const today = new Date();
  for (let back = 45; back >= 0; back--) {
    const day = dayKey(addDays(today, -back));
    const isToday = back === 0;

    for (const [mi, m] of members.entries()) {
      const isMe = mi === 0;

      // prayers — today is left empty for the owner (they log their own),
      // the partner's day starts partly filled so the app feels alive
      for (const key of PRAYER_ORDER) {
        if (isToday && isMe) continue;
        let status;
        if (isToday) {
          if (key === 'fajr') status = 'ontime';
          else if (key === 'dhuhr') status = 'late';
          else continue;
        } else {
          const r = Math.random();
          status = r < 0.7 ? 'ontime' : r < 0.88 ? 'late' : 'missed';
        }
        prayers.push({
          id: `${m.id}|${day}|${key}`,
          memberId: m.id,
          day,
          key,
          status,
          loggedAt: Date.now(),
          demo: true,
        });
      }

      // plan — every past day, plus the partner's today
      if (!(isToday && isMe)) {
        const n = 2 + Math.floor(Math.random() * 3);
        const picked = [...tasks].sort(() => Math.random() - 0.5).slice(0, n);
        for (let i = 0; i < n; i++) {
          plan.push({
            id: uid(),
            memberId: m.id,
            day,
            title: picked[i],
            timeLabel: '',
            priority: Math.random() < 0.18 ? 'important' : 'normal',
            done: !isToday && Math.random() < 0.72,
            doneAt: null,
            position: i,
            createdAt: Date.now(),
            demo: true,
          });
        }
      }

      // reviews — past days only
      if (!isToday) {
        if (Math.random() < 0.72) {
          reviews.push({
            id: `${m.id}|${day}`,
            memberId: m.id,
            day,
            wins: wins[Math.floor(Math.random() * wins.length)],
            productivity: 5 + Math.floor(Math.random() * 5),
            happiness: 5 + Math.floor(Math.random() * 6),
            highlight: '',
            notes: [],
            updatedAt: Date.now(),
            demo: true,
          });
        }
      }
    }
  }

  await db.putMany('prayers', prayers);
  await db.putMany('plan', plan);
  await db.putMany('reviews', reviews);
  await db.put('meta', { key: 'seeded', at: Date.now() });
}

/* ============================================================
   Render
   ============================================================ */
const TABS = [
  { id: 'home', label: 'Home', icon: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.4v-6H9.4v6H5a1 1 0 0 1-1-1Z"/>' },
  { id: 'prayer', label: 'Prayer', icon: '<path d="M21 12.8A8.6 8.6 0 1 1 11.2 3a6.8 6.8 0 0 0 9.8 9.8Z"/>' },
  { id: 'plan', label: 'Plan', icon: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>' },
  { id: 'review', label: 'Review', icon: '<path d="M12 20h9"/><path d="M16.6 3.4a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>' },
  { id: 'us', label: 'Us', icon: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>' },
];

function renderTabs() {
  const nav = $('#tabs');
  nav.innerHTML = `<div class="tabs-inner">${TABS.map(
    (t) => `<button class="tab" data-act="tab" data-view="${t.id}" ${S.view === t.id ? 'aria-current="page"' : ''}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${t.icon}</svg>
      <span>${t.label}</span>
    </button>`
  ).join('')}</div>`;
}

function render() {
  if (!S.members.length) return;
  const scr = $('#screen');
  const banner = isPreview()
    ? `<div style="display:flex;justify-content:center;padding:6px 0 2px"><button class="preview-bar" data-act="exit-preview">Previewing as ${esc(actor()?.name)} · tap to exit</button></div>`
    : '';
  scr.style.setProperty('--accent', actor()?.color || '#8AA7FF');
  document.documentElement.style.setProperty('--accent', actor()?.color || '#8AA7FF');
  scr.innerHTML = banner + `<div class="view${S.suppressAnim ? ' no-anim' : ''}">${VIEWS[S.view]()}</div>`;
  renderTabs();
}

function refresh() {
  const y = window.scrollY;
  render();
  requestAnimationFrame(() => window.scrollTo(0, y));
}

function go(view) {
  S.scroll[S.view] = window.scrollY;
  S.view = view;
  render();
  requestAnimationFrame(() => window.scrollTo(0, S.scroll[view] || 0));
}

/* ============================================================
   View — Home
   ============================================================ */
function viewHome() {
  const who = actor();
  if (!who) return '';
  const p = other(who);
  const today = dayKey();
  const t = times(today);
  const np = nextPrayer(t);
  const dateLine = new Date().toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });

  const side = (m, isMe) => {
    const count = prayerCount(m.id, today);
    const plan = planFor(m.id, today);
    const done = plan.filter((x) => x.done).length;
    const review = reviewFor(m.id, today);
    const dots = PRAYER_ORDER.map((k) => {
      const r = getPrayer(m.id, today, k);
      return `<i class="${r?.status || ''}"></i>`;
    }).join('');
    return `
      <div class="duo-side" style="--tint:${m.color}">
        <div class="duo-top"><span class="av">${m.avatar}</span><span class="nm">${isMe ? 'You' : esc(m.name)}</span></div>
        <div class="score"><b class="num">${count}</b><span class="num">/5</span></div>
        <div class="duo-dots">${dots}</div>
        <div class="duo-sub">${plan.length ? `${done} of ${plan.length} done` : 'Nothing planned'}${review ? ` · ${review.productivity}/10` : ''}</div>
      </div>`;
  };

  const partnerSide = p
    ? side(p, false)
    : `<div class="duo-side" style="--tint:var(--a)">
        <div class="duo-top"><span class="av">＋</span><span class="nm">Their side</span></div>
        <div class="pending-name">Connect the second phone and their day appears here.</div>
      </div>`;

  const myPlan = planFor(who.id, today);
  const myDone = myPlan.filter((x) => x.done).length;
  const myReview = reviewFor(who.id, today);
  const theirsReview = p ? reviewFor(p.id, today) : null;

  return `
    <header class="home-head">
      <div class="mark"><i></i><i></i><span>N &amp; A</span></div>
      <button class="icon-btn" data-act="open-settings" aria-label="Settings">
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 7h5M13 7h7M4 17h9M17 17h3"/><circle cx="11" cy="7" r="2"/><circle cx="15" cy="17" r="2"/>
        </svg>
      </button>
    </header>

    <div class="hello">
      <div class="eyebrow">${dateLine}</div>
      <h1>${greeting()},<br>${esc(who.name)}</h1>
    </div>

    <section class="duo card">
      ${side(who, true)}
      ${partnerSide}
    </section>

    <div class="next">
      <span class="dot"></span>
      <div>
        <div class="label">${np.tomorrow ? 'Tomorrow' : 'Next'}</div>
        <div class="who">${PMETA[np.key].name} <span class="num">${fmtTime(np.at)}</span></div>
      </div>
      <div class="in num">in <b>${fmtCountdown(np.at - new Date())}</b></div>
    </div>

    <div class="tiles">
      <button class="tile" data-act="tab" data-view="plan">
        <div class="k">Plan</div>
        <div class="v num">${myDone}<small> / ${myPlan.length}</small></div>
        <div class="d">${myPlan.length - myDone > 0 ? `${myPlan.length - myDone} left today` : 'All clear'}</div>
      </button>
      <button class="tile" data-act="tab" data-view="review">
        <div class="k">Review</div>
        <div class="v num">${myReview ? `${myReview.productivity}<small> · </small>${myReview.happiness}` : '—'}</div>
        <div class="d">${myReview ? 'Today is kept' : theirsReview ? `${esc(p.name)} logged theirs` : 'Close the day tonight'}</div>
      </button>
    </div>

    <p class="quiet">A quiet place for two.</p>
  `;
}

/* ============================================================
   View — Prayer
   ============================================================ */
function viewPrayer() {
  const who = actor();
  if (!who) return '';
  const p = other(who);
  const today = dayKey();
  const t = times(today);
  const recs = PRAYER_ORDER.map((k) => ({ k, rec: getPrayer(who.id, today, k) }));
  const onTime = recs.filter((x) => x.rec && x.rec.status !== 'missed').length;
  const np = nextPrayer(t);
  const C = 2 * Math.PI * 52;

  const ring = `
    <div class="ring-wrap">
      <svg class="ring" viewBox="0 0 128 128" aria-hidden="true">
        <circle class="bg" cx="64" cy="64" r="52"></circle>
        <circle class="fg" cx="64" cy="64" r="52"
          stroke-dasharray="${C.toFixed(1)}"
          stroke-dashoffset="${(C * (1 - onTime / 5)).toFixed(1)}"></circle>
      </svg>
      <div class="ring-label">
        <div class="big num">${onTime}<span style="color:var(--ink-3);font-size:18px">/5</span></div>
        <div class="small">prayers</div>
      </div>
    </div>`;

  const rows = PRAYER_ORDER.map((k) => {
    const rec = getPrayer(who.id, today, k);
    const state = rec?.status || 'pending';
    const fresh = S.justLogged === k && state !== 'pending' ? ' data-fresh="1"' : '';
    const flood = state === 'ontime' ? 'var(--ok)' : state === 'late' ? 'var(--late)' : state === 'missed' ? 'var(--miss)' : 'transparent';
    return `
      <button class="prow" data-act="log" data-key="${k}" data-state="${state}"${fresh} style="--flood:${flood}">
        <span class="glyph">${state === 'ontime' ? '✓' : state === 'late' ? '◔' : state === 'missed' ? '✕' : '○'}</span>
        <span class="meta">
          <span class="name">${PMETA[k].name}<span class="ar">${PMETA[k].ar}</span></span>
          <span class="window num">${fmtTime(t[k])} – ${fmtTime(t.onTimeEnd[k])}</span>
        </span>
        <span class="pill ${state}"><span class="dot"></span>${STATUS_LABEL[state]}</span>
      </button>`;
  }).join('');

  const partnerCard = p ? `
    <div class="card partner">
      <div class="who">
        <span class="avatar" style="box-shadow:0 0 0 2px ${p.color}44">${p.avatar}</span>
        <span>
          <span class="name">${esc(p.name)}</span>
          <span class="count num">${prayerCount(p.id, today)} of 5 · today</span>
        </span>
      </div>
      <div class="mini-prayers">
        ${PRAYER_ORDER.map((k) => {
          const r = getPrayer(p.id, today, k);
          const st = r?.status || 'pending';
          const react = r ? reactionFor(who.id, 'prayer', r.id) : null;
          return `<button class="mini" data-state="${st}" data-act="react-prayer" data-id="${r?.id || ''}" data-key="${k}"
            aria-label="${p.name} · ${PMETA[k].name} · ${STATUS_LABEL[st]}">
            ${PMETA[k].abbr}${react ? `<span class="react">${react.emoji}</span>` : ''}
          </button>`;
        }).join('')}
      </div>
    </div>` : `
    <div class="card card-pad" style="text-align:center">
      <div style="font-size:15px;font-weight:600;margin-bottom:4px">Room for one more</div>
      <div style="font-size:13.5px;color:var(--ink-3);line-height:1.55">Invite them in Settings and their five prayers will appear here, live.</div>
    </div>`;

  const week = lastSeven(who.id);

  return `
    <header class="head">
      <div>
        <div class="eyebrow">${new Date().toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        <h1>${greeting()},<br>${esc(who.name)}</h1>
      </div>
      <div class="head-avatar" style="box-shadow:0 0 0 3px ${who.color}30">${who.avatar}</div>
    </header>

    <div class="card hero">
      ${ring}
      <div class="hero-copy">
        <div class="next-label">${np.tomorrow ? 'Tomorrow' : 'Next'}</div>
        <div class="next-name">${PMETA[np.key].name} <span class="num" style="color:var(--ink-2);font-size:17px;font-weight:500">${fmtTime(np.at)}</span></div>
        <div class="next-meta num">in <b>${fmtCountdown(np.at - new Date())}</b>${np.tomorrow ? ' · new day' : ''}</div>
      </div>
    </div>

    <div class="prayers stagger">${rows}</div>

    <div class="section-title">${p ? 'Side by side' : 'Your partner'}</div>
    ${partnerCard}

    <div class="section-title">Last seven days <span class="link">${week.total}/35</span></div>
    <div class="card card-pad">
      ${week.html}
    </div>
  `;
}

function lastSeven(memberId) {
  const today = new Date();
  let total = 0;
  const cols = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(today, -i);
    const k = dayKey(d);
    const dots = PRAYER_ORDER.map((p) => {
      const r = getPrayer(memberId, k, p);
      if (r && r.status !== 'missed') total++;
      return `<i class="dot ${r?.status || ''}"></i>`;
    }).join('');
    cols.push(`<div class="col ${i === 0 ? 'today' : ''}">
      <span class="dow">${d.toLocaleDateString(LOCALE, { weekday: 'narrow' })}</span>${dots}
    </div>`);
  }
  return { html: `<div class="week">${cols.join('')}</div>`, total };
}

/* ============================================================
   View — Plan
   ============================================================ */
function viewPlan() {
  const who = actor();
  const p = other(who);
  const today = dayKey();
  const partnerExists = !!p;
  const shownMember = S.planTab === 'theirs' && partnerExists ? p : who;
  const editable = shownMember.id === who.id;
  const tasks = planFor(shownMember.id, today);
  const yesterday = dayKey(addDays(new Date(), -1));
  const carry = editable ? planFor(shownMember.id, yesterday).filter((t) => !t.done) : [];

  const list = tasks.length
    ? `<div class="tasks stagger">${tasks.map((t) => taskRow(t, editable)).join('')}</div>`
    : `<div class="empty"><b>${editable ? 'A clear page' : 'Nothing yet'}</b>${
        editable ? 'Add the one thing that would make today feel like a win.' : `${esc(shownMember.name)} hasn't written anything for today.`
      }</div>`;

  return `
    <header class="head">
      <div>
        <div class="eyebrow">Today · ${parseDay(today).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long' })}</div>
        <h1>The plan</h1>
        <div class="sub">${tasks.filter((t) => t.done).length} of ${tasks.length} done</div>
      </div>
    </header>

    <div class="seg" role="tablist">
      <button role="tab" aria-selected="${S.planTab === 'mine'}" data-act="plan-tab" data-tab="mine">Mine</button>
      <button role="tab" aria-selected="${S.planTab === 'theirs'}" data-act="plan-tab" data-tab="theirs" ${partnerExists ? '' : 'disabled'}>
        ${partnerExists ? esc(p.name) : 'Partner'}
      </button>
    </div>

    ${carry.length ? `<button class="chip" data-act="carry" style="margin-bottom:12px">↩ Pull in ${carry.length} unfinished from yesterday</button>` : ''}

    ${list}

    ${editable ? `
      <form class="add-task" data-form="add-task">
        <input name="title" placeholder="Add something to today…" maxlength="120" autocomplete="off">
        <button type="submit" aria-label="Add task">+</button>
      </form>` : ''}

    ${partnerExists && !editable ? `<p style="font-size:12.5px;color:var(--ink-3);margin-top:14px;line-height:1.6">You can cheer ${esc(p.name)} on — tap the heart on any item.</p>` : ''}
  `;
}

function taskRow(t, editable) {
  const react = reactionFor(actor().id, 'plan', t.id);
  return `
    <div class="task ${t.done ? 'done' : ''}" data-id="${t.id}">
      <button class="check" data-act="toggle-task" data-id="${t.id}" aria-label="${t.done ? 'Mark not done' : 'Mark done'}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0A0B0F" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      </button>
      <div class="body">
        <div class="title">${esc(t.title)}</div>
        ${t.timeLabel || t.react ? `<div class="meta">
          ${t.timeLabel ? `<span class="badge-time num">${esc(t.timeLabel)}</span>` : ''}
          ${t.priority === 'important' ? '<span class="prio"></span><span>important</span>' : ''}
        </div>` : ''}
        ${react ? `<div class="react-chip">Your ${react.emoji}</div>` : ''}
      </div>
      ${editable
        ? `<button class="icon-btn" data-act="task-menu" data-id="${t.id}" aria-label="More actions">⋯</button>`
        : `<button class="icon-btn" data-act="react-plan" data-id="${t.id}" aria-label="React">♥</button>`}
    </div>`;
}

/* ============================================================
   View — Review
   ============================================================ */
function viewReview() {
  const who = actor();
  const p = other(who);
  const today = dayKey();
  const mine = reviewFor(who.id, today);
  const theirs = p ? reviewFor(p.id, today) : null;
  const saved = !!mine;

  return `
    <header class="head">
      <div>
        <div class="eyebrow">${parseDay(today).toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        <h1>How was today?</h1>
        <div class="sub">Two numbers and a sentence. That's enough.</div>
      </div>
    </header>

    <form class="card card-pad" data-form="save-review">
      <div class="field">
        <div class="label">What I accomplished</div>
        <textarea class="area" name="wins" placeholder="One thing counts. Even a small one." maxlength="600">${esc(mine?.wins || '')}</textarea>
      </div>

      <div class="field slider">
        <div class="top"><div class="label" style="margin:0">Productivity</div><div class="big num"><span class="val">${mine?.productivity ?? 5}</span><span>/10</span></div></div>
        <input type="range" name="productivity" min="0" max="10" step="1" value="${mine?.productivity ?? 5}" style="--p:${(mine?.productivity ?? 5) * 10}">
      </div>

      <div class="field slider">
        <div class="top"><div class="label" style="margin:0">Happiness</div><div class="big num"><span class="val">${mine?.happiness ?? 5}</span><span>/10</span></div></div>
        <input type="range" name="happiness" min="0" max="10" step="1" value="${mine?.happiness ?? 5}" style="--p:${(mine?.happiness ?? 5) * 10}">
      </div>

      <div class="field">
        <div class="label">One moment worth keeping</div>
        <input class="line" name="highlight" placeholder="Optional" maxlength="120" value="${esc(mine?.highlight || '')}">
      </div>

      <button class="btn primary wide" type="submit">${saved ? 'Update today' : 'Save today'}</button>
      ${saved ? `<div style="text-align:center;font-size:12px;color:var(--ink-3);margin-top:10px">Saved · you can change it until the day ends</div>` : ''}
    </form>

    ${mine?.notes?.length ? mine.notes.map((n) => `
      <div class="note-from">
        <span class="av">${esc(memberById(n.from)?.avatar || '💬')}</span>
        <span>${esc(n.text)}<div style="font-size:11.5px;color:var(--ink-3);margin-top:3px">${esc(memberById(n.from)?.name || '')}</div></span>
      </div>`).join('') : ''}

    ${p ? `
      <div class="section-title">${esc(p.name)}'s day</div>
      <div class="card card-pad">
        ${theirs ? `
          <div style="display:flex;gap:10px;align-items:center;margin-bottom:14px">
            <span class="avatar" style="width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--card-hi);border:1px solid var(--line)">${p.avatar}</span>
            <div>
              <div style="font-size:14px;font-weight:600">${esc(p.name)}</div>
              <div style="font-size:12px;color:var(--ink-3)">logged ${new Date(theirs.updatedAt).toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
          ${theirs.wins ? `<div style="font-size:14.5px;line-height:1.55;color:var(--ink-2);margin-bottom:14px">${esc(theirs.wins)}</div>` : ''}
          <div class="rating-row">
            <div class="chip">Productivity <b style="color:var(--ink)">${theirs.productivity ?? '–'}</b></div>
            <div class="chip">Happiness <b style="color:var(--ink)">${theirs.happiness ?? '–'}</b></div>
          </div>
          ${theirs.highlight ? `<div style="font-size:13.5px;color:var(--ink-3);margin-top:12px">“${esc(theirs.highlight)}”</div>` : ''}
          <div style="display:flex;gap:8px;margin-top:16px">
            <button class="btn" data-act="react-review" data-id="${theirs.id}">React</button>
          </div>
          ${noteBlock(theirs, who, p)}
        ` : `<div class="empty" style="border:0;padding:14px"><b>Not written yet</b>${esc(p.name)} hasn't logged today. Give them time.</div>`}
      </div>` : ''}
  `;
}

function noteBlock(review, fromMember, toMember) {
  const existing = (review.notes || []).find((n) => n.from === fromMember.id);
  if (existing) {
    return `<div class="note-from"><span class="av">💬</span><span>${esc(existing.text)}</span></div>`;
  }
  return `
    <form data-form="add-note" data-review="${review.id}" style="margin-top:14px">
      <input class="line" name="note" placeholder="Leave ${esc(toMember.name)} a word…" maxlength="140">
      <button class="btn wide" type="submit" style="margin-top:8px">Send</button>
    </form>`;
}

/* ============================================================
   View — Us (calendar + history)
   ============================================================ */
function viewUs() {
  const a = me();
  const b = S.members.find((m) => m.id !== a?.id) || null;
  const stats = monthStats(S.calMonth);
  const cal = calendarHTML(S.calMonth, a, b);

  return `
    <header class="head">
      <div>
        <div class="eyebrow">${S.members.map((m) => esc(m.name)).join(' & ')}</div>
        <h1>Us</h1>
        <div class="sub">The shape of your days, side by side.</div>
      </div>
      <div class="head-avatar" style="display:flex;gap:2px">${S.members.map((m) => `<span style="font-size:17px">${m.avatar}</span>`).join('')}</div>
    </header>

    <div class="stats">
      <div class="stat">
        <div class="k">Prayers</div>
        <div class="v num">${stats.prayerPct}<small>%</small></div>
        <div class="bar" style="color:${a?.color || 'var(--n)'}"><i style="width:${stats.prayerPct}%"></i></div>
      </div>
      <div class="stat">
        <div class="k">Tasks</div>
        <div class="v num">${stats.taskPct}<small>%</small></div>
        <div class="bar" style="color:${b?.color || 'var(--a)'}"><i style="width:${stats.taskPct}%"></i></div>
      </div>
      <div class="stat">
        <div class="k">Happiness</div>
        <div class="v num">${stats.happiness}<small>/10</small></div>
        <div class="bar" style="color:${a?.color || 'var(--n)'}"><i style="width:${Number(stats.happiness) * 10 || 0}%"></i></div>
      </div>
    </div>

    <div class="section-title">Calendar <span class="link">tap any day</span></div>
    <div class="card card-pad">${cal}</div>

    <div class="legend">
      ${S.members.map((m) => `<span><i style="background:${m.color}"></i>${esc(m.name)}'s prayers</span>`).join('')}
    </div>

    <div class="section-title">This month</div>
    <div class="card card-pad" style="display:flex;justify-content:space-between;gap:12px">
      <div>
        <div class="k" style="font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);font-weight:650">Productivity</div>
        <div class="num" style="font-size:26px;font-weight:640;letter-spacing:-.04em;margin-top:4px">${stats.productivity}<span style="font-size:13px;color:var(--ink-3)">/10</span></div>
      </div>
      <div style="text-align:right">
        <div class="k" style="font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);font-weight:650">Days recorded</div>
        <div class="num" style="font-size:26px;font-weight:640;letter-spacing:-.04em;margin-top:4px">${stats.days}</div>
      </div>
    </div>
  `;
}

function monthStats(base) {
  const y = base.getFullYear();
  const m = base.getMonth();
  const lastDay = new Date(y, m + 1, 0).getDate();
  const today = new Date();
  let pOk = 0, pTot = 0, tDone = 0, tTot = 0, hap = 0, hapN = 0, prod = 0, prodN = 0, days = 0;

  for (let d = 1; d <= lastDay; d++) {
    const dt = new Date(y, m, d);
    if (dt > today) break;
    const day = dayKey(dt);
    let recorded = false;
    for (const mem of S.members) {
      for (const k of PRAYER_ORDER) {
        if (!isDue(day, k)) continue;
        const r = getPrayer(mem.id, day, k);
        pTot++;
        if (r && r.status !== 'missed') pOk++;
      }
      for (const t of planFor(mem.id, day)) { tTot++; if (t.done) tDone++; }
      const rv = reviewFor(mem.id, day);
      if (rv) {
        recorded = true;
        if (Number.isFinite(rv.happiness)) { hap += rv.happiness; hapN++; }
        if (Number.isFinite(rv.productivity)) { prod += rv.productivity; prodN++; }
      }
    }
    if (recorded) days++;
  }

  return {
    prayerPct: pTot ? Math.round((pOk / pTot) * 100) : 0,
    taskPct: tTot ? Math.round((tDone / tTot) * 100) : 0,
    happiness: hapN ? (hap / hapN).toFixed(1) : '–',
    productivity: prodN ? (prod / prodN).toFixed(1) : '–',
    days,
  };
}

function calendarHTML(base, a, b) {
  const y = base.getFullYear();
  const m = base.getMonth();
  const first = new Date(y, m, 1);
  const offset = (first.getDay() + 6) % 7; // Monday first
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const rows = Math.ceil((offset + daysInMonth) / 7);
  const today = dayKey();

  const dows = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => `<span class="dow">${d}</span>`).join('');

  let cells = '';
  for (let i = 0; i < rows * 7; i++) {
    const dnum = i - offset + 1;
    if (dnum < 1 || dnum > daysInMonth) {
      cells += `<div class="day other" aria-hidden="true"></div>`;
      continue;
    }
    const dt = new Date(y, m, dnum);
    const k = dayKey(dt);
    const future = dt > new Date();
    const marks = [a, b].filter(Boolean).map((mem) => {
      const n = prayerCount(mem.id, k);
      return `<i><b style="width:${(n / 5) * 100}%;background:${mem.color}"></b></i>`;
    }).join('');
    cells += `<button class="day ${k === today ? 'today' : ''} ${future ? 'other' : ''}" data-act="day" data-day="${k}" ${future ? 'disabled' : ''}>
      <span class="n num">${dnum}</span>
      <span class="marks">${marks}</span>
    </button>`;
  }

  return `
    <div class="cal-head">
      <div class="m">${base.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' })}</div>
      <div class="cal-nav">
        <button data-act="cal-move" data-d="-1" aria-label="Previous month">‹</button>
        <button data-act="cal-move" data-d="1" aria-label="Next month">›</button>
      </div>
    </div>
    <div class="cal">${dows}${cells}</div>`;
}

/* ============================================================
   View — Settings
   ============================================================ */
function viewSettings() {
  const who = me();
  const p = other(who);
  const installed = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const latest = RELEASES[0];

  const row = (act, icon, title, desc, value = '', extra = '') => `
    <button class="row" data-act="${act}" ${extra}>
      <span class="ico">${icon}</span>
      <span class="txt"><span class="t">${title}</span>${desc ? `<span class="d" style="display:block">${desc}</span>` : ''}</span>
      ${value ? `<span class="v">${value}</span>` : ''}
      <span class="chev">›</span>
    </button>`;

  const toggle = (key, title, desc) => `
    <button class="row" data-act="toggle" data-key="${key}">
      <span class="ico">🔔</span>
      <span class="txt"><span class="t">${title}</span><span class="d" style="display:block">${desc}</span></span>
      <span class="switch" role="switch" aria-checked="${!!S.settings.notif[key]}"></span>
    </button>`;

  return `
    <header class="head">
      <div>
        <button class="crumb" data-act="tab" data-view="home">‹ Home</button>
        <h1 style="margin-top:12px">Settings</h1>
        <div class="sub">Version ${APP_VERSION} · ${latest.at}</div>
      </div>
    </header>

    <div class="group">
      ${row('edit-name', '👤', 'Your name', esc(who?.name || ''), '')}
      ${row('edit-color', '🎨', 'Your colour', 'Used across the app', '', `style="--dot:${who?.color}"`)}
      ${row('edit-avatar', who?.avatar || '🌙', 'Your avatar', '', '')}
    </div>

    <div class="group">
      ${p ? row('edit-partner', '💞', 'Partner', `${esc(p.name)} · joined ${new Date(p.joinedAt).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' })}`) : ''}
      ${row('sync', sync.isOn() ? '🔗' : '📡', sync.isOn() ? 'Two phones connected' : 'Connect the other phone', syncLine())}
      ${p ? row('preview', isPreview() ? '↩' : '👁', isPreview() ? 'Exit partner view' : 'Preview as ' + esc(p.name), 'See the app from their side') : ''}
    </div>

    <div class="group">
      ${row('method', '🕌', 'Prayer calculation', METHODS[S.settings.method]?.label || 'Muslim World League')}
      ${row('location', '📍', 'Location', S.settings.place, '')}
      ${row('times-today', '🕰', "Today's times", '', '')}
    </div>

    <div class="group">
      ${toggle('prayer', 'Prayer reminder', 'A quiet nudge at each adhan')}
      ${toggle('followup', 'Still not logged', 'One follow-up, 45 minutes later')}
      ${toggle('review', 'Evening review', 'A prompt to close the day')}
      ${toggle('partner', 'From your partner', 'Reactions and notes')}
    </div>

    <div class="group">
      <div class="row" style="display:block">
        <div class="t" style="margin-bottom:10px">Appearance</div>
        <div class="seg" style="margin:0">
          ${['dark', 'light', 'system'].map((t) => `<button data-act="theme" data-theme="${t}" aria-selected="${(S.settings.theme || 'dark') === t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}
        </div>
      </div>
    </div>

    <div class="group">
      ${installed ? row('noop', '✓', 'Installed', 'Running as an app on this device') : row('install', '📲', 'Install on this device', 'Add to your home screen')}
      ${row('export', '⬇', 'Export a backup', 'Every day, as a JSON file')}
      ${row('import', '⬆', 'Restore from backup', 'Nothing is lost until you confirm')}
      ${row('clear-demo', '🧪', 'Remove sample history', 'Deletes only the demo days')}
      ${row('reset', '🗑', 'Reset everything', 'Erases this couple space on this device')}
    </div>

    <div class="group">
      ${row('about', 'ⓘ', 'What\'s new', latest.notes, `v${latest.v}`)}
    </div>

    <p style="text-align:center;font-size:11.5px;color:var(--ink-3);line-height:1.7;margin:22px 0 0">
      N&amp;A · v${APP_VERSION}<br>
      Local-first · your days stay on your devices
    </p>
  `;
}

/* ============================================================
   Together — pairing, remote merges, member reconciliation
   ============================================================ */
function makeKey() {
  const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  const body = Array.from(bytes, (b) => abc[b % abc.length]).join('');
  return `NA-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}-${body.slice(12, 16)}-${body.slice(16, 20)}`;
}

async function createSharedSpace() {
  if (!(await sync.probe())) {
    closeSheet();
    return toast('Cloud sync is not set up yet — ask me to finish it');
  }
  const key = makeKey();
  await sync.setConfig({ mode: 'local', key });
  closeSheet();
  toast('Creating your space…');
  await sync.begin(me());
  await loadState();
  refresh();
  setTimeout(() => sheetSync(), 500);
}

async function joinSharedSpace(code) {
  if (!(await sync.probe())) return toast('Cloud sync is not set up yet — ask me to finish it');
  await sync.setConfig({ mode: 'local', key: code });
  toast('Joining…');
  await sync.begin(me());
  await loadState();
  await reconcileMembers();
  S.suppressAnim = true;
  refresh();
  S.suppressAnim = false;
  toast('Connected');
}

function onRemoteChange() {
  const el = document.activeElement;
  if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) {
    S.pendingRemote = true;
    return;
  }
  applyRemoteChange();
}

async function applyRemoteChange() {
  S.pendingRemote = false;
  await loadState();
  await reconcileMembers();
  S.suppressAnim = true;
  refresh();
  S.suppressAnim = false;
}

/** Keep exactly two members: me, and the real other half.
    A member that came from the server always beats a local placeholder,
    no matter which one was created more recently. */
async function reconcileMembers() {
  const others = S.members.filter((m) => m.id !== S.viewerId);
  if (others.length <= 1) return;

  const remote = others.filter((m) => m.remote);
  const pool = remote.length ? remote : others;
  pool.sort((a, b) => (b.updatedAt || b.joinedAt || 0) - (a.updatedAt || a.joinedAt || 0));
  const keep = pool[0];

  for (const m of others) {
    if (m.id !== keep.id) await retireMember(m.id);
  }
}

/** Remove a placeholder member and everything that belonged to it. */
async function retireMember(id) {
  await db.mute(async () => {
    for (const store of ['prayers', 'plan', 'reviews']) {
      for (const row of await db.getAll(store)) {
        if (row.memberId === id) await db.del(store, row.id);
      }
    }
    for (const row of await db.getAll('reactions')) {
      if (row.from === id) await db.del('reactions', row.id);
    }
    await db.del('members', id);
  });
  S.members = S.members.filter((m) => m.id !== id);
  S.prayers = S.prayers.filter((r) => r.memberId !== id);
  S.plan = S.plan.filter((r) => r.memberId !== id);
  S.reviews = S.reviews.filter((r) => r.memberId !== id);
  S.reactions = S.reactions.filter((r) => r.from !== id);
}

/* ============================================================
   Sheets
   ============================================================ */
let sheetState = { dragging: false, startY: 0, dy: 0 };

function openSheet(html, onReady) {
  closeSheet(true);
  const root = $('#overlay-root');
  root.innerHTML = `<div class="scrim"></div><div class="sheet" role="dialog" aria-modal="true">${html}</div>`;

  const scrim = root.querySelector('.scrim');
  const sheet = root.querySelector('.sheet');

  requestAnimationFrame(() => {
    scrim.classList.add('open');
    sheet.classList.add('open');
  });

  scrim.addEventListener('click', () => closeSheet());

  sheet.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button, input, textarea, select, a, label')) return;
    sheetState = { dragging: true, startY: e.clientY, dy: 0 };
    sheet.classList.add('dragging');
    try { sheet.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  });
  sheet.addEventListener('pointermove', (e) => {
    if (!sheetState.dragging) return;
    sheetState.dy = Math.max(0, e.clientY - sheetState.startY);
    sheet.style.transform = `translate(-50%, ${sheetState.dy}px)`;
  });
  const end = () => {
    if (!sheetState.dragging) return;
    const dy = sheetState.dy;
    sheetState.dragging = false;
    sheet.classList.remove('dragging');
    sheet.style.transform = '';
    if (dy > 96) closeSheet();
  };
  sheet.addEventListener('pointerup', end);
  sheet.addEventListener('pointercancel', end);

  onReady?.(sheet);
}

function closeSheet(instant = false) {
  const root = $('#overlay-root');
  if (!root.firstElementChild) return;
  const sheet = root.querySelector('.sheet');
  const scrim = root.querySelector('.scrim');
  scrim?.classList.remove('open');
  sheet?.classList.remove('open');
  if (sheet) sheet.style.transform = '';
  const clear = () => { root.innerHTML = ''; };
  if (instant) clear();
  else setTimeout(clear, 340);
}

function sheetStatus(key) {
  const who = actor();
  const day = dayKey();
  const t = times(day);
  const rec = getPrayer(who.id, day, key);
  const sug = suggest(t, key, new Date());
  const opts = [
    ['ontime', 'On time', 'Inside the window', 'var(--ok)'],
    ['late', 'Late', 'Prayed, after the window', 'var(--late)'],
    ['missed', 'Missed', 'Not prayed in the window', 'var(--miss)'],
  ];

  openSheet(`
    <div class="grip"></div>
    <h3>${PMETA[key].name} <span style="color:var(--ink-3);font-size:14px;font-weight:400">${PMETA[key].ar}</span></h3>
    <p class="sheet-sub num">${fmtTime(t[key])} – ${fmtTime(t.onTimeEnd[key])} · ${sug === 'ontime' ? 'still on time' : sug === 'late' ? 'late now' : 'window closed'}</p>
    <div class="sheet-list">
      ${opts.map(([val, label, sub, color]) => `
        <button class="sheet-opt" data-act="set-status" data-key="${key}" data-status="${val}" ${rec?.status === val ? 'data-active="true"' : ''}>
          <span class="sw" style="background:${color}"></span>
          <span class="lbl">${label}<span class="sub">${sub}</span></span>
          ${rec?.status === val ? '<span style="color:var(--ink-2)">✓</span>' : ''}
        </button>`).join('')}
      <button class="sheet-opt cancel" data-act="close">Cancel</button>
    </div>
  `);
}

function sheetReact(type, targetId) {
  const who = actor();
  const existing = reactionFor(who.id, type, targetId);
  const emojis = ['👏', '❤️', '💪', '🤲'];
  openSheet(`
    <div class="grip"></div>
    <h3>Send a little love</h3>
    <p class="sheet-sub">One reaction. It lands quietly on their screen.</p>
    <div class="react-grid">
      ${emojis.map((e) => `<button data-act="set-react" data-type="${type}" data-target="${targetId}" data-emoji="${e}" data-active="${existing?.emoji === e}">${e}</button>`).join('')}
    </div>
    ${existing ? `<button class="btn ghost wide" style="margin-top:14px" data-act="clear-react" data-type="${type}" data-target="${targetId}">Remove reaction</button>` : ''}
  `);
}

function sheetDay(day) {
  const a = me();
  const b = other(a);

  const person = (m) => {
    const rv = reviewFor(m.id, day);
    return `
      <div class="person">
        <div class="person-head">
          <span class="av">${m.avatar}</span>
          <span class="nm">${esc(m.name)}</span>
          <span style="margin-left:auto;font-size:12px;color:var(--ink-3)">${prayerCount(m.id, day)}/5</span>
        </div>
        <div class="pills">
          ${PRAYER_ORDER.map((k) => {
            const r = getPrayer(m.id, day, k);
            const st = r?.status || 'pending';
            return `<span class="pill ${st}"><span class="dot"></span>${PMETA[k].name}</span>`;
          }).join('')}
        </div>
        ${planFor(m.id, day).length ? `<div class="mini-list">${planFor(m.id, day).map((t) => `<div class="${t.done ? 'done' : ''}">${t.done ? '✓' : '·'} ${esc(t.title)}</div>`).join('')}</div>` : ''}
        ${rv ? `
          <div class="scores">
            <span class="chip">Productivity <b style="color:var(--ink)">${rv.productivity ?? '–'}</b></span>
            <span class="chip">Happiness <b style="color:var(--ink)">${rv.happiness ?? '–'}</b></span>
          </div>
          ${rv.wins ? `<div class="review-line">${esc(rv.wins)}</div>` : ''}
          ${(rv.notes || []).map((n) => `<div class="note-from" style="margin-top:10px"><span class="av">💬</span><span>${esc(n.text)}</span></div>`).join('')}
        ` : `<div class="review-line" style="color:var(--ink-3)">No review that day.</div>`}
      </div>`;
  };

  openSheet(`
    <div class="grip"></div>
    <div class="day-sheet">
      <h3>${dayLabel(day)}</h3>
      <p class="sheet-sub">${day === dayKey() ? 'Today' : 'A day you kept'}</p>
      ${a ? person(a) : ''}
      ${b ? person(b) : ''}
      <button class="btn wide" style="margin-top:20px" data-act="close">Close</button>
    </div>
  `);
}

function sheetItem(id) {
  const t = S.plan.find((x) => x.id === id);
  if (!t) return;
  const who = actor();
  const mine = t.memberId === who.id;
  openSheet(`
    <div class="grip"></div>
    <h3>${esc(t.title)}</h3>
    <p class="sheet-sub">${mine ? 'Your task' : 'Their task'} · ${t.done ? 'done' : 'open'}</p>
    <div class="sheet-list">
      ${mine ? `
        <form data-form="rename-task" data-id="${t.id}">
          <input class="line" name="title" value="${esc(t.title)}" maxlength="120">
          <div style="display:flex;gap:8px;margin-top:8px">
            <input class="line" name="time" type="time" value="${esc(t.timeLabel || '')}" style="flex:1">
            <button class="btn" type="submit">Rename</button>
          </div>
        </form>
        <button class="sheet-opt" data-act="toggle-task" data-id="${t.id}">
          <span class="lbl">${t.done ? 'Mark as not done' : 'Mark as done'}</span>
        </button>
        <button class="sheet-opt" data-act="prio-task" data-id="${t.id}">
          <span class="lbl">${t.priority === 'important' ? 'Remove importance' : 'Mark important'}</span>
        </button>
        <button class="sheet-opt" data-act="delete-task" data-id="${t.id}" style="color:var(--miss-ink)">
          <span class="lbl">Delete</span>
        </button>
      ` : `<button class="sheet-opt" data-act="react-plan" data-id="${t.id}"><span class="lbl">Send a reaction</span></button>`}
      <button class="sheet-opt cancel" data-act="close">Close</button>
    </div>
  `);
}

function sheetName(memberId) {
  const m = memberById(memberId);
  openSheet(`
    <div class="grip"></div>
    <h3>Name</h3>
    <p class="sheet-sub">What the app calls them.</p>
    <form data-form="save-name" data-id="${memberId}">
      <input class="line" name="name" value="${esc(m?.name || '')}" maxlength="18" autofocus>
      <button class="btn primary wide" type="submit" style="margin-top:12px">Save</button>
    </form>
  `, (sheet) => sheet.querySelector('input')?.focus());
}

function sheetColor(memberId) {
  const m = memberById(memberId);
  openSheet(`
    <div class="grip"></div>
    <h3>Their colour</h3>
    <p class="sheet-sub">Identity across the app.</p>
    <div class="swatches" style="justify-content:center;padding:8px 0 18px">
      ${PALETTE.map((c) => `<button class="swatch" data-act="pick-color" data-id="${memberId}" data-color="${c}" aria-checked="${m?.color === c}" style="background:${c}"></button>`).join('')}
    </div>
  `);
}

function sheetAvatar(memberId) {
  const m = memberById(memberId);
  openSheet(`
    <div class="grip"></div>
    <h3>Avatar</h3>
    <div class="avatars" style="padding:8px 0 18px">
      ${AVATARS.map((a) => `<button class="av-pick" data-act="pick-avatar" data-id="${memberId}" data-avatar="${a}" aria-checked="${m?.avatar === a}">${a}</button>`).join('')}
    </div>
  `);
}

function sheetMethod() {
  openSheet(`
    <div class="grip"></div>
    <h3>Calculation</h3>
    <p class="sheet-sub">Angles used for Fajr and Isha.</p>
    <div class="sheet-list">
      ${Object.entries(METHODS).map(([key, m]) => `
        <button class="sheet-opt" data-act="pick-method" data-method="${key}" ${S.settings.method === key ? 'data-active="true"' : ''}>
          <span class="lbl">${m.label}<span class="sub">Fajr ${m.fajr}° · Isha ${typeof m.isha === 'number' && m.isha >= 60 ? m.isha + ' min' : m.isha + '°'}</span></span>
          ${S.settings.method === key ? '✓' : ''}
        </button>`).join('')}
    </div>
  `);
}

function sheetLocation() {
  openSheet(`
    <div class="grip"></div>
    <h3>Location</h3>
    <p class="sheet-sub">Times are computed on-device for this place. The nearest city is guessed from your timezone — set it exactly if you can.</p>
    <button class="btn wide" data-act="geolocate">Use my location</button>
    <div style="height:16px"></div>
    <form data-form="save-location">
      <div class="label">Place name</div>
      <input class="line" name="place" value="${esc(S.settings.place)}" placeholder="City" style="margin-bottom:12px">
      <div style="display:flex;gap:8px">
        <div style="flex:1"><div class="label">Latitude</div><input class="line num" name="lat" value="${S.settings.lat}" inputmode="decimal"></div>
        <div style="flex:1"><div class="label">Longitude</div><input class="line num" name="lng" value="${S.settings.lng}" inputmode="decimal"></div>
      </div>
      <button class="btn primary wide" type="submit" style="margin-top:14px">Save</button>
    </form>
  `);
}

function sheetTimes() {
  const t = times(dayKey());
  openSheet(`
    <div class="grip"></div>
    <h3>Today</h3>
    <p class="sheet-sub num">${S.settings.place} · ${METHODS[S.settings.method]?.label}</p>
    <div class="sheet-list">
      ${PRAYER_ORDER.map((k) => `
        <div class="sheet-opt" style="cursor:default">
          <span class="lbl">${PMETA[k].name}<span class="sub">${PMETA[k].ar}</span></span>
          <span class="num" style="color:var(--ink-2);font-size:14px">${fmtTime(t[k])}</span>
        </div>`).join('')}
      <div class="sheet-opt" style="cursor:default;opacity:.7">
        <span class="lbl">Sunrise<span class="sub">End of Fajr's on-time window</span></span>
        <span class="num" style="color:var(--ink-2);font-size:14px">${fmtTime(t.sunrise)}</span>
      </div>
    </div>
  `);
}

function sheetAbout() {
  openSheet(`
    <div class="grip"></div>
    <h3>What's new</h3>
    <p class="sheet-sub">Version ${APP_VERSION}</p>
    <div class="sheet-list">
      ${RELEASES.map((r) => `
        <div class="sheet-opt" style="cursor:default;align-items:flex-start">
          <span class="lbl" style="flex:1">${r.notes}<span class="sub">v${r.v} · ${r.at}</span></span>
        </div>`).join('')}
    </div>
    <p style="font-size:12px;color:var(--ink-3);line-height:1.7;margin-top:16px">
      Updates arrive on their own — reopen the app and it's there, with your history untouched.
    </p>
  `);
}

function sheetInstall() {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
  openSheet(`
    <div class="grip"></div>
    <h3>Install N&amp;A</h3>
    <p class="sheet-sub">${ios ? 'On iPhone, everything happens in Safari.' : 'One tap and it lives on your home screen.'}</p>
    <div class="sheet-list">
      ${ios ? `
        <div class="sheet-opt" style="cursor:default"><span class="sw" style="background:var(--n)"></span><span class="lbl">Open this page in Safari</span></div>
        <div class="sheet-opt" style="cursor:default"><span class="sw" style="background:var(--n)"></span><span class="lbl">Tap Share <span class="sub">The square with an arrow</span></span></div>
        <div class="sheet-opt" style="cursor:default"><span class="sw" style="background:var(--n)"></span><span class="lbl">Choose “Add to Home Screen”</span></div>
      ` : `
        <div class="sheet-opt" style="cursor:default"><span class="sw" style="background:var(--n)"></span><span class="lbl">Open the browser menu</span></div>
        <div class="sheet-opt" style="cursor:default"><span class="sw" style="background:var(--n)"></span><span class="lbl">Tap “Install app” or “Add to Home screen”</span></div>
      `}
      <button class="sheet-opt cancel" data-act="close">Got it</button>
    </div>
  `);
}

function sheetSync() {
  if (!sync.isOn()) {
    openSheet(`
      <div class="grip"></div>
      <h3>Two phones, one life</h3>
      <p class="sheet-sub">Start here, then enter the code on the other phone. Everything stays between the two of you.</p>
      <div class="sheet-list">
        <button class="sheet-opt" data-act="sync-create">
          <span class="sw" style="background:var(--ok)"></span>
          <span class="lbl">Start a shared space<span class="sub">Creates a code for your partner</span></span>
        </button>
        <button class="sheet-opt" data-act="sync-join">
          <span class="sw" style="background:var(--n)"></span>
          <span class="lbl">I have a code<span class="sub">Join the space your partner started</span></span>
        </button>
        <button class="sheet-opt cancel" data-act="close">Close</button>
      </div>
    `);
    return;
  }

  const key = sync.config().key;
  openSheet(`
    <div class="grip"></div>
    <h3>Connected</h3>
    <p class="sheet-sub">${syncLine()}</p>
    <div class="card card-pad" style="text-align:center;font-size:15px;letter-spacing:.06em;line-height:1.6">${esc(key)}</div>
    <button class="btn wide" style="margin-top:12px" data-act="copy-key">Copy the code</button>
    <p style="font-size:12.5px;color:var(--ink-3);line-height:1.65;margin:14px 0 0">
      On the other phone: Settings → Connect the other phone → I have a code.
    </p>
    <button class="sheet-opt cancel" data-act="sync-stop" style="margin-top:14px">Stop syncing on this phone</button>
  `);
}

function sheetJoin() {
  openSheet(`
    <div class="grip"></div>
    <h3>Enter the code</h3>
    <p class="sheet-sub">It looks like NA-XXXX-… and lives in Settings on the other phone.</p>
    <form data-form="join-space">
      <input class="line" name="code" placeholder="NA-XXXX-XXXX-XXXX-XXXX" autocapitalize="characters" autocomplete="off" spellcheck="false" style="text-align:center;letter-spacing:.08em">
      <button class="btn primary wide" type="submit" style="margin-top:12px">Join</button>
    </form>
  `, (sheet) => sheet.querySelector('input')?.focus());
}

function syncLine() {
  if (!sync.isOn()) return 'Share prayers and plans live';
  const s = S.syncState;
  if (s === 'gone') return 'Fresh start — reset this phone';
  if (s === 'error') return 'Offline — will retry';
  if (s === 'syncing') return 'Syncing…';
  if (s === 'live') return 'Synced · just now';
  return 'Connected';
}

function sheetConfirm(title, body, label, action) {
  openSheet(`
    <div class="grip"></div>
    <h3>${title}</h3>
    <p class="sheet-sub">${body}</p>
    <div class="sheet-list">
      <button class="sheet-opt" data-act="${action}" style="color:var(--miss-ink)"><span class="lbl">${label}</span></button>
      <button class="sheet-opt cancel" data-act="close">Keep everything</button>
    </div>
  `);
}

/* ============================================================
   Actions
   ============================================================ */
const VIEWS = {
  home: viewHome,
  prayer: viewPrayer,
  plan: viewPlan,
  review: viewReview,
  us: viewUs,
  settings: viewSettings,
};

const ACTIONS = {
  tab: (el) => go(el.dataset.view),
  close: () => closeSheet(),
  'open-settings': () => go('settings'),

  log: (el) => sheetStatus(el.dataset.key),

  'set-status': async (el) => {
    const { key, status } = el.dataset;
    const who = actor();
    el.closest('.sheet-opt')?.classList.add('pop');
    await savePrayer(who.id, dayKey(), key, status);
    haptic(10);
    S.justLogged = key;
    closeSheet();
    refresh();
    setTimeout(() => { S.justLogged = null; }, 950);
    setTimeout(() => toast(`${PMETA[key].name} · ${STATUS_LABEL[status].toLowerCase()}`), 140);
  },

  'clear-status': async (el) => {
    const who = actor();
    const id = `${who.id}|${dayKey()}|${el.dataset.key}`;
    S.prayers = S.prayers.filter((p) => p.id !== id);
    await db.del('prayers', id);
    closeSheet();
    refresh();
  },

  'react-prayer': (el) => {
    if (!el.dataset.id) return toast('Nothing to cheer yet');
    sheetReact('prayer', el.dataset.id);
  },
  'react-plan': (el) => sheetReact('plan', el.dataset.id),
  'react-review': (el) => sheetReact('review', el.dataset.id),

  'set-react': async (el) => {
    const who = actor();
    const { type, target, emoji } = el.dataset;
    const id = `${who.id}|${type}|${target}`;
    const rec = { id, from: who.id, targetType: type, targetId: target, emoji, day: dayKey(), createdAt: Date.now() };
    await saveReaction(rec);
    haptic(12);
    closeSheet();
    refresh();
    toast(`Sent ${emoji}`);
  },

  'clear-react': async (el) => {
    const who = actor();
    const id = `${who.id}|${el.dataset.type}|${el.dataset.target}`;
    S.reactions = S.reactions.filter((r) => r.id !== id);
    await db.del('reactions', id);
    closeSheet();
    refresh();
  },

  day: (el) => sheetDay(el.dataset.day),

  'cal-move': (el) => {
    const d = Number(el.dataset.d);
    S.calMonth = new Date(S.calMonth.getFullYear(), S.calMonth.getMonth() + d, 1);
    refresh();
  },

  'plan-tab': (el) => { S.planTab = el.dataset.tab; refresh(); },

  'toggle-task': async (el) => {
    const t = S.plan.find((x) => x.id === el.dataset.id);
    if (!t) return;
    t.done = !t.done;
    t.doneAt = t.done ? Date.now() : null;
    await savePlan(t);
    haptic(t.done ? 12 : 6);
    closeSheetIfOpen();
    refresh();
  },

  'task-menu': (el) => sheetItem(el.dataset.id),

  'prio-task': async (el) => {
    const t = S.plan.find((x) => x.id === el.dataset.id);
    if (!t) return;
    t.priority = t.priority === 'important' ? 'normal' : 'important';
    await savePlan(t);
    closeSheet();
    refresh();
  },

  'delete-task': async (el) => {
    const id = el.dataset.id;
    const removed = S.plan.find((t) => t.id === id);
    if (!removed) return;
    S.plan = S.plan.filter((t) => t.id !== id);
    await db.del('plan', id);
    closeSheet();
    refresh();
    haptic(18);
    toast('Task deleted', 6000, 'Undo', async () => {
      S.plan.push(removed);
      await db.put('plan', removed);
      refresh();
    });
  },

  carry: async () => {
    const who = actor();
    const y = dayKey(addDays(new Date(), -1));
    const open = planFor(who.id, y).filter((t) => !t.done);
    let pos = Math.max(0, ...planFor(who.id, dayKey()).map((t) => t.position));
    for (const t of open) {
      pos += 1;
      await savePlan({ ...t, id: uid(), day: dayKey(), position: pos, done: false, doneAt: null, demo: false });
    }
    haptic(8);
    refresh();
    toast(`${open.length} moved to today`);
  },

  'exit-preview': () => { S.viewingAs = null; refresh(); },

  'edit-name': () => sheetName(me().id),
  'edit-partner': () => sheetName(other(me()).id),
  'edit-color': () => sheetColor(me().id),
  'edit-avatar': () => sheetAvatar(me().id),
  sync: () => sheetSync(),
  'sync-create': () => createSharedSpace(),
  'sync-join': () => sheetJoin(),
  'copy-key': async () => {
    try {
      await navigator.clipboard.writeText(sync.config().key);
      toast('Code copied');
    } catch {
      toast('Copy it by hand — long press the code');
    }
  },
  'sync-stop': () => {
    closeSheet();
    setTimeout(() => sheetConfirm('Stop syncing?', 'This phone keeps everything it has. Changes just stop reaching the other phone.', 'Stop syncing', 'do-sync-stop'), 260);
  },
  'do-sync-stop': async () => {
    await sync.stop();
    await loadState();
    refresh();
    toast('Sync stopped on this phone');
  },
  preview: () => { S.viewingAs = isPreview() ? null : other(me()).id; S.planTab = 'mine'; refresh(); },

  method: () => sheetMethod(),
  location: () => sheetLocation(),
  'times-today': () => sheetTimes(),

  theme: async (el) => {
    S.settings.theme = el.dataset.theme;
    await db.put('meta', { key: 'settings', value: S.settings });
    applyTheme();
    refresh();
  },

  toggle: async (el) => {
    const key = el.dataset.key;
    S.settings.notif[key] = !S.settings.notif[key];
    await db.put('meta', { key: 'settings', value: S.settings });
    el.querySelector('.switch')?.setAttribute('aria-checked', String(!!S.settings.notif[key]));
    if (S.settings.notif[key] && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    toast(S.settings.notif[key] ? 'On' : 'Off');
  },

  export: async () => {
    const data = await db.dump();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `na-backup-${dayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast('Backup saved');
  },

  import: () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        await db.restore(data);
        toast('Restored');
        setTimeout(() => location.reload(), 700);
      } catch (err) {
        console.error(err);
        toast('That file could not be read');
      }
    };
    input.click();
  },

  'clear-demo': () =>
    sheetConfirm('Remove sample history?', 'Deletes the 45 demo days only. Everything you logged yourself stays.', 'Remove samples', 'do-clear-demo'),

  'do-clear-demo': async () => {
    for (const store of ['prayers', 'plan', 'reviews']) {
      const rows = (await db.getAll(store)).filter((r) => r.demo);
      for (const r of rows) await db.del(store, r.id);
    }
    await loadState();
    closeSheet();
    refresh();
    toast('Sample history removed');
  },

  reset: () =>
    sheetConfirm('Reset this space?', 'Every prayer, task and review is erased from this device. Export a backup first if unsure.', 'Erase everything', 'do-reset'),

  'do-reset': async () => {
    await db.wipeUserData();
    localStorage.clear();
    location.reload();
  },

  about: () => sheetAbout(),
  install: () => sheetInstall(),
  geolocate: () => {
    if (!navigator.geolocation) return toast('Location is not available here');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        S.settings.lat = Number(pos.coords.latitude.toFixed(4));
        S.settings.lng = Number(pos.coords.longitude.toFixed(4));
        S.settings.place = 'Current location';
        timeCache.clear();
        await db.put('meta', { key: 'settings', value: S.settings });
        closeSheet();
        refresh();
        toast('Location updated');
      },
      () => toast('Location permission denied'),
      { timeout: 8000 }
    );
  },
  'pick-method': async (el) => {
    S.settings.method = el.dataset.method;
    timeCache.clear();
    await db.put('meta', { key: 'settings', value: S.settings });
    closeSheet();
    refresh();
    toast(METHODS[el.dataset.method].label);
  },
  'pick-color': async (el) => {
    const m = memberById(el.dataset.id);
    if (!m) return;
    m.color = el.dataset.color;
    await db.put('members', m);
    closeSheet();
    refresh();
  },
  'pick-avatar': async (el) => {
    const m = memberById(el.dataset.id);
    if (!m) return;
    m.avatar = el.dataset.avatar;
    await db.put('members', m);
    closeSheet();
    refresh();
  },

  'ob-next': () => showObStep(2),
  'ob-step': (el) => showObStep(Number(el.dataset.step)),
  'ob-color': (el) => {
    ob.color = el.dataset.color;
    document.querySelectorAll('.onboard .swatch').forEach((s) => s.setAttribute('aria-checked', String(s === el)));
  },
  'ob-avatar': (el) => {
    ob.avatar = el.dataset.avatar;
    document.querySelectorAll('.onboard .av-pick').forEach((s) => s.setAttribute('aria-checked', String(s === el)));
  },
  'ob-finish': (el) => completeOnboarding(!!el.dataset.solo),
  noop: () => {},
};

function closeSheetIfOpen() {
  if ($('#overlay-root')?.firstElementChild) closeSheet();
}

/* ---------- events ---------- */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  const fn = ACTIONS[act];
  if (!fn) return;
  e.preventDefault();
  fn(el, e);
});

document.addEventListener('focusout', () => {
  if (!S.pendingRemote) return;
  setTimeout(() => {
    const el = document.activeElement;
    if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return;
    applyRemoteChange();
  }, 320);
});

document.addEventListener('input', (e) => {
  const range = e.target;
  if (range.matches('input[type="range"]')) {
    range.style.setProperty('--p', range.value * 10);
    const val = range.closest('.slider')?.querySelector('.val');
    if (val) val.textContent = range.value;
  }
});

document.addEventListener('submit', async (e) => {
  const form = e.target.closest('[data-form]');
  if (!form) return;
  e.preventDefault();
  const kind = form.dataset.form;
  const data = Object.fromEntries(new FormData(form).entries());

  if (kind === 'add-task') {
    const title = String(data.title || '').trim();
    if (!title) return;
    const who = actor();
    const list = planFor(who.id, dayKey());
    const item = {
      id: uid(),
      memberId: who.id,
      day: dayKey(),
      title,
      timeLabel: '',
      priority: 'normal',
      done: false,
      doneAt: null,
      position: list.length ? list[list.length - 1].position + 1 : 0,
      createdAt: Date.now(),
      demo: false,
    };
    await savePlan(item);
    haptic(8);
    form.reset();
    refresh();
    setTimeout(() => $('.add-task input')?.focus(), 60);
    return;
  }

  if (kind === 'save-review') {
    const who = actor();
    const day = dayKey();
    const existing = reviewFor(who.id, day);
    const rec = {
      id: existing?.id || `${who.id}|${day}`,
      memberId: who.id,
      day,
      wins: String(data.wins || '').trim(),
      productivity: clamp(Number(data.productivity), 0, 10),
      happiness: clamp(Number(data.happiness), 0, 10),
      highlight: String(data.highlight || '').trim(),
      notes: existing?.notes || [],
      updatedAt: Date.now(),
      demo: false,
    };
    await saveReview(rec);
    haptic(14);
    refresh();
    toast('Saved · today is kept');
    return;
  }

  if (kind === 'add-note') {
    const id = form.dataset.review;
    const rec = S.reviews.find((r) => r.id === id);
    const text = String(data.note || '').trim();
    if (!rec || !text) return;
    const who = actor();
    rec.notes = [...(rec.notes || []).filter((n) => n.from !== who.id), { from: who.id, text, at: Date.now() }];
    rec.updatedAt = Date.now();
    await saveReview(rec);
    refresh();
    toast('Sent');
    return;
  }

  if (kind === 'rename-task') {
    const t = S.plan.find((x) => x.id === form.dataset.id);
    if (!t) return;
    t.title = String(data.title || t.title).trim();
    t.timeLabel = String(data.time || '').trim();
    await savePlan(t);
    closeSheet();
    refresh();
    return;
  }

  if (kind === 'save-name') {
    const m = memberById(form.dataset.id);
    if (!m) return;
    m.name = String(data.name || '').trim() || m.name;
    await db.put('members', m);
    closeSheet();
    refresh();
    return;
  }

  if (kind === 'join-space') {
    const code = String(data.code || '').trim().toUpperCase().replace(/\s+/g, '');
    if (code.length < 20) return toast('That code looks short');
    closeSheet();
    await joinSharedSpace(code);
    return;
  }

  if (kind === 'save-location') {
    const lat = Number(data.lat);
    const lng = Number(data.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return toast('Those coordinates look off');
    S.settings.lat = lat;
    S.settings.lng = lng;
    S.settings.place = String(data.place || 'Custom').trim();
    timeCache.clear();
    await db.put('meta', { key: 'settings', value: S.settings });
    closeSheet();
    refresh();
    toast('Location saved');
  }
});

/* ============================================================
   Toast
   ============================================================ */
let toastTimer = null;
function toast(msg, ms = 2200, actionLabel = '', action = null) {
  const root = $('#toast-root');
  root.innerHTML = '';
  const el = document.createElement('div');
  el.className = 'toast';
  const label = document.createElement('span');
  label.textContent = msg;
  el.appendChild(label);

  clearTimeout(toastTimer);
  if (action && actionLabel) {
    const btn = document.createElement('button');
    btn.className = 'toast-action';
    btn.textContent = actionLabel;
    btn.addEventListener('click', () => {
      clearTimeout(toastTimer);
      root.innerHTML = '';
      action();
    });
    el.appendChild(btn);
  }

  root.appendChild(el);
  toastTimer = setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 320);
  }, ms);
}

/* ============================================================
   Install + updates
   ============================================================ */
let installPrompt = null;
function mountInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installPrompt = e;
  });
}

const originalInstall = ACTIONS.install;
const originalGeolocate = ACTIONS.geolocate;

// Give the install action real behaviour when the browser offers it.
ACTIONS.install = async (el) => {
  if (installPrompt) {
    installPrompt.prompt();
    const res = await installPrompt.userChoice;
    installPrompt = null;
    if (res.outcome === 'accepted') toast('Installing…');
    return;
  }
  originalInstall(el);
};

let sawController = !!navigator.serviceWorker?.controller;
try { sessionStorage.setItem('na:current', APP_VERSION); } catch { /* private mode */ }

function registerSW() {
  const start = async () => {
    try {
      const reg = await navigator.serviceWorker.register('./sw.js', { scope: './', updateViaCache: 'none' });

      const check = () => reg.update().catch(() => {});
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
      setInterval(check, 15 * 60 * 1000);

      navigator.serviceWorker.addEventListener('message', (event) => {
        const data = event.data;
        if (!data || data.type !== 'NA_ACTIVATED') return;

        const running = sessionStorage.getItem('na:current') || APP_VERSION;
        // Same build as the one already on screen — nothing to do.
        if (data.version === running) return;
        if (sessionStorage.getItem('na:reloaded') === data.version) return;

        sessionStorage.setItem('na:reloaded', data.version);
        sessionStorage.setItem('na:updated', data.version);
        location.reload();
      });
    } catch (err) {
      console.warn('Service worker unavailable', err);
    }
  };

  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
}

/* ---------- go ---------- */
if ('serviceWorker' in navigator && location.protocol !== 'file:') registerSW();
boot();
