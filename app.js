/* ============================================================
   N&A — app
   Vanilla JS, local-first. IndexedDB holds the truth; the UI
   renders optimistically and never waits on a network.
   ============================================================ */

import * as db from './db.js';
import * as sync from './sync.js';
import { BACKEND } from './config.js';
import {
  METHODS, PRAYER_ORDER, dayTimes, suggest, nextPrayer, fmtTime, fmtCountdown,
} from './prayertimes.js';

const APP_VERSION = '4.1.0';
const LOCALE = 'en-GB';
const FRESH_START_DAY = '2026-11-22';
const FRESH_START_CUTOFF = Date.parse('2026-11-22T20:15:52Z');

/* Sample history is off. A new space starts genuinely empty — no
   imaginary prayers from an imaginary partner. */
const SEED_SAMPLE = false;
const RELEASES = [
  { v: '4.1.0', at: '23 Nov 2026', notes: "Prayer streaks, interactive daily scores and weekly recaps; notifications are off." },
  { v: '4.0.1', at: '22 Nov 2026', notes: "Counting starts today; old entries are cleared locally and from shared history when online." },
  { v: '4.0.0', at: '22 Nov 2026', notes: "Two clear places: prayer and daily satisfaction and productivity scores." },
  { v: '3.9.1', at: '19 Nov 2026', notes: 'A blank notification can no longer leave your phone, and one day finally reads like one day.' },
  { v: '3.9.0', at: '19 Nov 2026', notes: 'Sixty-four more game prompts for the two of you, and the last small labels that were hiding in the dark.' },
  { v: '3.8.3', at: '19 Nov 2026', notes: 'The weekly recap fits together, the daily chat opens with the question, and long result prompts never hide under a label.' },
  { v: '3.8.2', at: '19 Nov 2026', notes: 'Thirty more questions for the quiet days, a clearer month, and Dhuhr that reads D.' },
  { v: '3.8.1', at: '19 Nov 2026', notes: 'Rounds remember where you were, the years say their names, and small gold text reads clearly.' },
  { v: '3.8.0', at: '19 Nov 2026', notes: 'The month reads at a glance, quiet reminders wait in Settings, and the app opens offline.' },
  { v: '3.7.2', at: '19 Nov 2026', notes: 'Quiet details: human notification ages, and one gold language for partly done.' },
  { v: '3.7.1', at: '19 Nov 2026', notes: 'A kinder first run: back, a picker that shows more, and honest disabled buttons.' },
  { v: '3.7.0', at: '19 Nov 2026', notes: 'Home opens with the day; the mosque is gold; the plan shows its middle state.' },
  { v: '3.6.2', at: '19 Nov 2026', notes: 'Counting now begins on 19 November.' },
  { v: '3.6.1', at: '17 Nov 2026', notes: 'Counting now begins on 18 November.' },
  { v: '3.6.0', at: '17 Nov 2026', notes: 'Halal Couple, softened and sharpened — a room that stays with you, gold details, and a journal that reads like a story.' },
  { v: '3.5.1', at: '16 Nov 2026', notes: 'A new cover appears in your little world immediately.' },
  { v: '3.5.0', at: '16 Nov 2026', notes: "Halal Couple: questions, games, memories and a little world for two." },
  { v: '3.4.2', at: '16 Nov 2026', notes: "Notification settings now say whether an alert was delivered or shown inside the app." },
  { v: '3.4.1', at: '16 Nov 2026', notes: "The bell now reaches the other phone — and waits there until they open the app." },
  { v: '3.4.0', at: '16 Nov 2026', notes: "The room follows the sky; the tab bar glides." },
  { v: '3.3.0', at: '16 Nov 2026', notes: "Custom messages, the day arc, and a kinder streak rule." },
  { v: '3.2.0', at: '16 Nov 2026', notes: "Period is a pink state on each prayer; the mosque is gold." },
  { v: '3.1.1', at: '16 Nov 2026', notes: "Theme switching is instant on iOS now." },
  { v: '3.1.0', at: '16 Nov 2026', notes: "The reminder bell lives on Home, and it travels through the app." },
  { v: '3.0.1', at: '16 Nov 2026', notes: "The period option is now inside the prayer sheet too." },
  { v: '3.0.0', at: '16 Nov 2026', notes: "Paper grain, deeper light, and the mosque, cycle and nudge options." },
  { v: '2.7.0', at: '16 Nov 2026', notes: "Reminders that say when they're blocked, and notifications worth tapping." },
  { v: '2.6.2', at: '16 Nov 2026', notes: "One tap to start counting tomorrow." },
  { v: '2.6.1', at: '16 Nov 2026', notes: "Goals travel too — and the sync queue now clears after every push." },
  { v: '2.6.0', at: '16 Nov 2026', notes: "Cloud sync is connected — two phones, one life." },
  { v: '2.5.1', at: '16 Nov 2026', notes: "One scroll container for the avatar picker, and a confirmation when it saves." },
  { v: '2.5.0', at: '16 Nov 2026', notes: "Forty-eight avatars, in a picker that scrolls." },
  { v: '2.4.1', at: '16 Nov 2026', notes: "A test button that fires the urgent Isha notification." },
  { v: '2.4.0', at: '15 Nov 2026', notes: "Reminders per prayer, with an urgent warning before the window closes." },
  { v: '2.3.0', at: '15 Nov 2026', notes: "The Qibla dial carries the Kaaba at its true direction." },
  { v: '2.2.2', at: '15 Nov 2026', notes: "The compass follows one sensor stream and paints once per frame." },
  { v: '2.2.1', at: '15 Nov 2026', notes: "Qibla renders correctly from the first paint, and assets are versioned." },
  { v: '2.2.0', at: '15 Nov 2026', notes: "A Qibla compass that points to the Kaaba." },
  { v: '2.1.3', at: '15 Nov 2026', notes: "The app now lives at a permanent address." },
  { v: '2.1.2', at: '15 Nov 2026', notes: "Check for updates now performs a true hard refresh." },
  { v: '2.1.1', at: '15 Nov 2026', notes: "The streak gets a face: a big number, the week, your best." },
  { v: '2.1.0', at: '15 Nov 2026', notes: "Streaks: five prayers on time, day after day." },
  { v: '2.0.0', at: '15 Nov 2026', notes: "A weekly recap that reads your week back to you — prayers, tasks, mood, the best day." },
  { v: '1.9.1', at: '15 Nov 2026', notes: "Serif sheet titles and warmer section labels." },
  { v: '1.9.0', at: '15 Nov 2026', notes: "Serif titles, a gradient ring, and small details that feel made." },
  { v: '1.8.1', at: '15 Nov 2026', notes: "Every objective can be renamed, moved, or deleted — with undo." },
  { v: '1.8.0', at: '15 Nov 2026', notes: "Objectives with progress bars, a two-tier shelf, and a calmer settings list." },
  { v: '1.7.0', at: '15 Nov 2026', notes: "Prayer times from Masjid Cluj-Napoca, and tasks that can be half-done." },
  { v: '1.6.1', at: '15 Nov 2026', notes: "Days before your start date can't be opened — no empty history to misread." },
  { v: '1.6.0', at: '15 Nov 2026', notes: "Partner stats, a trend graph, optional task times, and a verse to open the day." },
  { v: '1.5.0', at: '15 Nov 2026', notes: "Deeper ink, crisp white cards on blush, one dark anchor block." },
  { v: '1.4.1', at: '15 Nov 2026', notes: "Existing devices move to the new palette; a visible version and a manual refresh." },
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
  dhuhr: { name: 'Dhuhr', ar: 'الظهر', abbr: 'D' },
  asr: { name: 'Asr', ar: 'العصر', abbr: 'A' },
  maghrib: { name: 'Maghrib', ar: 'المغرب', abbr: 'M' },
  isha: { name: 'Isha', ar: 'العشاء', abbr: 'I' },
};

const STATUS_LABEL = {
  ontime: 'On time',
  late: 'Late',
  missed: 'Missed',
  period: 'Period',
  pending: 'Not logged',
};

const PALETTE = ['#DE5A87', '#A87FC0', '#E08A6E', '#7FB3D0', '#84BFA3', '#C98FB8'];
const AVATARS = [
  '🌙', '⭐', '🌟', '✨', '💫', '☄️',
  '🌿', '🍃', '🌱', '🍀', '🌵', '🌴',
  '🌸', '🌼', '🌷', '🌹', '🌺', '🌻',
  '🪷', '🍂', '🌾', '🪴', '☀️', '🌤️',
  '⛅', '🌈', '🔥', '🕯️', '🕊️', '🦋',
  '🐝', '🐞', '🐢', '🦢', '🦉', '🐚',
  '🐳', '🌊', '❤️', '🤍', '💛', '💚',
  '💜', '🫶', '🤲', '🧿', '📿', '🎈',
];

/* A small, curated rotation. One verse a day, chosen by date. */
const VERSES = [
  { ref: '2:152', text: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.' },
  { ref: '2:186', text: 'And when My servants ask you concerning Me — indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.' },
  { ref: '2:216', text: 'Perhaps you hate a thing and it is good for you; and perhaps you love a thing and it is bad for you. And Allah knows, while you know not.' },
  { ref: '2:286', text: 'Allah does not charge a soul except with that within its capacity.' },
  { ref: '3:139', text: 'And do not weaken and do not grieve, and you will be superior if you are believers.' },
  { ref: '3:173', text: 'Sufficient for us is Allah, and He is the best Disposer of affairs.' },
  { ref: '9:51', text: 'Never will we be struck except by what Allah has decreed for us; He is our protector. And upon Allah let the believers rely.' },
  { ref: '13:28', text: 'Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.' },
  { ref: '14:7', text: 'If you are grateful, I will surely increase you in favour.' },
  { ref: '20:114', text: 'My Lord, increase me in knowledge.' },
  { ref: '29:69', text: 'And those who strive for Us — We will surely guide them to Our ways. And indeed, Allah is with the doers of good.' },
  { ref: '39:53', text: 'Do not despair of the mercy of Allah. Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful.' },
  { ref: '40:60', text: 'And your Lord says: call upon Me; I will respond to you.' },
  { ref: '55:60', text: 'Is the reward for good anything but good?' },
  { ref: '57:4', text: 'And He is with you wherever you are.' },
  { ref: '65:3', text: 'And whoever relies upon Allah — then He is sufficient for him.' },
  { ref: '94:5', text: 'For indeed, with hardship will be ease. Indeed, with hardship will be ease.' },
  { ref: '2:153', text: 'O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient.' },
  { ref: '16:97', text: 'Whoever does righteousness, whether male or female, while he is a believer — We will surely cause him to live a good life.' },
  { ref: '49:13', text: 'Indeed, the most noble of you in the sight of Allah is the most righteous of you.' },
  { ref: '93:5', text: 'And your Lord is going to give you, and you will be satisfied.' },
  { ref: '41:30', text: 'Indeed, those who have said, “Our Lord is Allah,” and then remained on a right course — the angels descend upon them: do not fear and do not grieve.' },
  { ref: '24:35', text: 'Allah is the Light of the heavens and the earth.' },
  { ref: '2:255', text: 'His Throne encompasses the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.' },
];

const DEFAULTS = {
  lat: 46.7612026,
  lng: 23.5781945,
  place: 'Cluj-Napoca',
  preset: null,
  method: 'MWL',
  theme: 'light',
  notif: {
    prayer: false,
    followup: false,
    review: false,
    partner: false,
    urgency: false,
    lead: 20,
    prayers: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
  },
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
  'Europe/Bucharest': ['Cluj-Napoca', 46.7612026, 23.5781945, 'cluj'],
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
  if (hit) return { place: hit[0], lat: hit[1], lng: hit[2], preset: hit[3] || null };
  // Unknown zone: fall back to the middle of that timezone's meridian.
  const offset = -new Date().getTimezoneOffset() / 60;
  return { place: 'Approximate', lat: 30, lng: Math.max(-180, Math.min(180, offset * 15)), preset: null };
}

const S = {
  meta: {},
  members: [],
  prayers: [],
  plan: [],
  reviews: [],
  reactions: [],
  goals: [],
  cycles: [],
  nudges: [],
  settings: { ...DEFAULTS },
  viewerId: null,
  viewingAs: null,
  view: 'prayer',
  trendMember: 'mine',
  historyDay: null,
  recapMember: 'mine',
  recapWeek: null,
  planTab: 'mine',
  goalTab: 'mine',
  calMonth: null,
  scroll: {},
  dir: 0,
  animateNext: true,
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

const dayOfYear = (d = new Date()) =>
  Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);

function verseCard() {
  const v = VERSES[dayOfYear() % VERSES.length];
  return `
    <section class="verse card">
      <div class="verse-label">Verse for today</div>
      <p>${esc(v.text)}</p>
      <div class="verse-rule"></div>
      <div class="verse-ref">Qur’an ${v.ref}</div>
    </section>`;
}

/** Calculations begin on this date. Set at onboarding, editable in Settings. */
const statsStart = () => S.settings.startDate || dayKey();

async function ensureStartDate() {
  if (S.settings.startDate) return;
  S.settings.startDate = dayKey();
  await db.put('meta', { key: 'settings', value: S.settings });
}

/** One requested fresh start. Keep identities, pairing and prayer preferences.
 * Tombstones are queued for synced rows so the other phone cannot restore them. */
async function resetHistoryForFreshStart() {
  if (!S.members.length) return;
  let reset = (await db.get('meta', 'history-reset'))?.value;
  if (!reset) {
    reset = { cutoff: FRESH_START_CUTOFF, resetDay: FRESH_START_DAY, pending: sync.isOn() };
    sync.discardHistoryWrites();
    for (const store of sync.HISTORY_STORES) {
      for (const row of await db.getAll(store)) {
        const timestamp = row.updatedAt || row.loggedAt || row.createdAt || 0;
        if (timestamp <= FRESH_START_CUTOFF || row.day < FRESH_START_DAY) {
          await db.del(store, row.id);
        }
      }
    }
    // Old migration snapshots can themselves contain a full copy of the history.
    await db.clear('snapshots');
    localStorage.removeItem('na:notified');
    localStorage.removeItem('na:lastNotif');
    localStorage.removeItem('na:pingsSeen');
    S.settings.startDate = FRESH_START_DAY;
    await db.put('meta', { key: 'settings', value: S.settings });
    await db.put('meta', { key: 'history-reset', value: reset });
    await loadState();
  }
  if (reset.pending) await sync.finishHistoryReset(reset.cutoff, reset.resetDay);
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
    if (prayerCounted(getPrayer(memberId, day, k))) on++;
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

/** Create or patch one prayer record (status, mosque, …). */
async function patchPrayer(memberId, day, key, patch) {
  const id = `${memberId}|${day}|${key}`;
  let rec = S.prayers.find((p) => p.id === id);
  if (!rec) {
    rec = { id, memberId, day, key, status: 'ontime', mosque: false, demo: false };
    S.prayers.push(rec);
  }
  Object.assign(rec, patch, { loggedAt: Date.now(), demo: false });
  await db.put('prayers', rec);
  return rec;
}

async function toggleCycleDay(memberId, day) {
  const existing = S.cycles.find((c) => c.memberId === memberId && c.day === day);
  if (existing) {
    S.cycles = S.cycles.filter((c) => c.id !== existing.id);
    await db.del('cycles', existing.id);
    return false;
  }
  const rec = { id: `${memberId}|${day}`, memberId, day, createdAt: Date.now() };
  S.cycles.push(rec);
  await db.put('cycles', rec);
  return true;
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
    await migrateTheme();
    await ensureStartDate();
    await disableNotifications();
    db.setHooks({
      onWrite: (store, rec) => sync.queueWrite(store, rec),
      onDelete: (store, id) => sync.queueDelete(store, id),
    });
    sync.attach({ onChange: onRemoteChange, onStatus: (s) => { S.syncState = s; } });
    await sync.load();
    await resetHistoryForFreshStart();
  } catch (err) {
    console.error(err);
    toast('Could not open local storage');
  }

  if (!S.members.length || !S.viewerId) {
    renderOnboarding();
  } else {
    showApp();
    const logParam = new URLSearchParams(location.search).get('log');
    if (logParam) {
      history.replaceState(null, '', location.pathname + location.hash);
      setTimeout(() => { go('prayer'); setTimeout(() => sheetStatus(logParam), 350); }, 400);
    }
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

  // The room changes light with the actual sky, even when the app stays open.
  applySky();
  setInterval(applySky, 4 * 60 * 1000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') applySky();
  });
}

async function disableNotifications() {
  const n = S.settings.notif;
  if (n.prayer || n.followup || n.review || n.partner || n.urgency) {
    S.settings.notif = { ...n, prayer: false, followup: false, review: false, partner: false, urgency: false };
    await db.put('meta', { key: 'settings', value: S.settings });
  }
  // Permission belongs to the browser; we stop sending and close alerts already shown.
  navigator.serviceWorker?.getRegistration?.()
    .then((reg) => reg?.getNotifications?.())
    .then((alerts) => alerts?.forEach((alert) => alert.close()))
    .catch(() => {});
}

/* One-time: devices onboarded before 1.4.0 saved "dark". Move them to the
   new blush palette once, then respect whatever they choose afterwards. */
async function migrateTheme() {
  if (!S.members.length) return;
  if (S.settings.themeV2) return;
  S.settings.theme = 'light';
  S.settings.themeV2 = true;
  await db.put('meta', { key: 'settings', value: S.settings });
  applyTheme();
}

async function loadState() {
  const d = await db.loadAll();
  S.meta = d.meta || {};
  S.members = d.members || [];
  S.prayers = d.prayers || [];
  S.plan = d.plan || [];
  S.reviews = d.reviews || [];
  S.reactions = d.reactions || [];
  S.goals = d.goals || [];
  S.cycles = d.cycles || [];
  S.nudges = d.nudges || [];
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
  if (meta) meta.setAttribute('content', dark ? '#151017' : '#F7EFF1');
  applySky();
}

/* The app's light follows the actual sky: night, dawn, day, dusk. */
const SKY = {
  night: ['rgba(158,152,220,.20)', 'rgba(202,156,205,.16)'],
  dawn: ['rgba(255,186,150,.34)', 'rgba(255,214,170,.26)'],
  day: ['rgba(176,203,255,.30)', 'rgba(255,226,220,.24)'],
  afternoon: ['rgba(255,204,150,.30)', 'rgba(255,172,158,.22)'],
  dusk: ['rgba(255,150,165,.34)', 'rgba(178,148,222,.26)'],
};

function skyPhase() {
  const t = times(dayKey());
  const now = new Date();
  if (now < t.fajr) return 'night';
  if (now < t.sunrise) return 'dawn';
  if (now < t.asr) return 'day';
  if (now < t.maghrib) return 'afternoon';
  if (now < t.isha) return 'dusk';
  return 'night';
}

function applySky() {
  const phase = skyPhase();
  const [a, b] = SKY[phase] || SKY.day;
  const root = document.documentElement;
  root.style.setProperty('--sky-a', a);
  root.style.setProperty('--sky-b', b);
  root.dataset.sky = phase;
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
        <button class="ob-back" data-act="ob-step" data-step="1" aria-label="Back">‹</button>
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
        <button class="ob-back" data-act="ob-step" data-step="2" aria-label="Back">‹</button>
        <h2>And the<br>other half?</h2>
        <p class="lede">Their name — so the app knows who it's cheering for. You can invite them properly later.</p>
        <input class="big" id="ob-partner" placeholder="Their name" maxlength="18" enterkeyhint="done">
        <div class="actions">
          <button class="btn primary wide" data-act="ob-finish" id="ob-enter-btn" disabled>Enter</button>
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
  const partnerInput = $('#ob-partner');
  const enterBtn = $('#ob-enter-btn');
  partnerInput?.addEventListener('input', () => {
    if (enterBtn) enterBtn.disabled = !partnerInput.value.trim();
  });
  partnerInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && partnerInput.value.trim()) completeOnboarding(false);
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
  if (n === 1) setTimeout(() => $('#ob-name')?.focus(), 60);
  if (n === 3) setTimeout(() => $('#ob-partner')?.focus(), 60);
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
  const firstSettings = {
    ...DEFAULTS,
    ...loc,
    preset: loc.preset || null,
    notif: { ...DEFAULTS.notif },
    startDate: dayKey(),
    countingFromMoved: '2026-11-19',
  };
  await db.put('meta', { key: 'settings', value: firstSettings });
  await db.put('meta', {
    key: 'history-reset',
    value: { cutoff: FRESH_START_CUTOFF, resetDay: FRESH_START_DAY, pending: false },
  });
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
/* One line-icon language for the whole settings list. */
const icon = (paths) =>
  `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.55" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

const I = {
  user: icon('<circle cx="12" cy="8.2" r="3.4"/><path d="M4.8 20c1.1-3.4 3.9-5.2 7.2-5.2s6.1 1.8 7.2 5.2"/>'),
  palette: icon('<path d="M12 3a9 9 0 1 0 0 18h1.4a2 2 0 0 0 0-4h-.8a1.6 1.6 0 0 1 0-3.2H17A4 4 0 0 0 21 9.8C21 6 17 3 12 3Z"/><circle cx="8" cy="9.4" r=".9" fill="currentColor" stroke="none"/><circle cx="11.4" cy="6.8" r=".9" fill="currentColor" stroke="none"/><circle cx="15.2" cy="7.6" r=".9" fill="currentColor" stroke="none"/>'),
  heart: icon('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>'),
  link: icon('<path d="M10.2 13.8a4.6 4.6 0 0 0 6.5 0l2.1-2.1a4.6 4.6 0 1 0-6.5-6.5l-1 1"/><path d="M13.8 10.2a4.6 4.6 0 0 0-6.5 0l-2.1 2.1a4.6 4.6 0 1 0 6.5 6.5l1-1"/>'),
  eye: icon('<path d="M2.8 12S6.5 5.8 12 5.8 21.2 12 21.2 12 17.5 18.2 12 18.2 2.8 12 2.8 12Z"/><circle cx="12" cy="12" r="2.7"/>'),
  mosque: icon('<path d="M4 20v-8.4a8 8 0 0 1 16 0V20"/><path d="M12 3.2v1.6"/><path d="M9.6 20v-3.6a2.4 2.4 0 0 1 4.8 0V20"/><path d="M3 20h18"/>'),
  sliders: icon('<path d="M4 7h4M12 7h8M4 17h10M18 17h2"/><circle cx="10" cy="7" r="2"/><circle cx="16" cy="17" r="2"/>'),
  pin: icon('<path d="M12 21s6.8-5.6 6.8-11A6.8 6.8 0 1 0 5.2 10c0 5.4 6.8 11 6.8 11Z"/><circle cx="12" cy="10" r="2.5"/>'),
  clock: icon('<circle cx="12" cy="12" r="8.4"/><path d="M12 7.4V12l3 1.8"/>'),
  bell: icon('<path d="M18 15.2V10a6 6 0 1 0-12 0v5.2L4.6 18h14.8Z"/><path d="M10 20.6a2 2 0 0 0 4 0"/>'),
  calendar: icon('<rect x="3.6" y="5.2" width="16.8" height="15" rx="3"/><path d="M8 3.2v4M16 3.2v4M3.6 10.2h16.8"/>'),
  refresh: icon('<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4.4v4h-4"/>'),
  info: icon('<circle cx="12" cy="12" r="8.4"/><path d="M12 11.2v5.2M12 7.9v.6"/>'),
  phone: icon('<rect x="6.4" y="2.6" width="11.2" height="18.8" rx="3"/><path d="M10.6 18.6h2.8"/>'),
  download: icon('<path d="M12 4.2v10.6"/><path d="m7.8 10.6 4.2 4.2 4.2-4.2"/><path d="M4.8 19.6h14.4"/>'),
  upload: icon('<path d="M12 15.4V4.8"/><path d="m7.8 9 4.2-4.2L16.2 9"/><path d="M4.8 19.6h14.4"/>'),
  flask: icon('<path d="M9.2 3h5.6M10.2 3v6.2L5.6 18a2 2 0 0 0 1.7 3h9.4a2 2 0 0 0 1.7-3l-4.6-8.8V3"/>'),
  trash: icon('<path d="M4.2 7h15.6M9.6 7V4.4h4.8V7M6.6 7l.9 13h9l.9-13"/>'),
  check: icon('<path d="M20 6 9 17l-5-5"/>'),
};

const TABS = [
  { id: 'prayer', label: 'Prayer', icon: '<path d="M21 12.8A8.6 8.6 0 1 1 11.2 3a6.8 6.8 0 0 0 9.8 9.8Z"/>' },
  { id: 'review', label: 'Review', icon: '<path d="M12 20h9"/><path d="M16.6 3.4a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>' },
];

function renderTabs() {
  const nav = $('#tabs');
  let inner = nav.querySelector('.tabs-inner');

  if (!inner) {
    nav.innerHTML = `<div class="tabs-inner">
      <span class="tab-pill" aria-hidden="true"></span>
      ${TABS.map(
      (t) => `<button class="tab" data-act="tab" data-view="${t.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${t.icon}</svg>
        <span>${t.label}</span>
      </button>`
    ).join('')}</div>`;
    inner = nav.querySelector('.tabs-inner');
    requestAnimationFrame(() => {
      positionTabPill();
      inner.classList.add('ready');
    });
    document.fonts?.ready.then(positionTabPill).catch(() => {});
  }

  for (const tab of nav.querySelectorAll('.tab')) {
    if (tab.dataset.view === S.view) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  }
  requestAnimationFrame(positionTabPill);
}

function positionTabPill() {
  const inner = document.querySelector('.tabs-inner');
  const active = inner?.querySelector('.tab[aria-current="page"]');
  const pill = inner?.querySelector('.tab-pill');
  if (!inner || !pill) return;
  if (!active) {
    pill.style.opacity = '0';
    return;
  }
  pill.style.opacity = '1';
  const r = active.getBoundingClientRect();
  const b = inner.getBoundingClientRect();
  pill.style.width = `${r.width}px`;
  pill.style.transform = `translateX(${r.left - b.left}px)`;
}

window.addEventListener('resize', positionTabPill);

function render() {
  if (!S.members.length) return;
  const scr = $('#screen');
  const banner = isPreview()
    ? `<div style="display:flex;justify-content:center;padding:6px 0 2px"><button class="preview-bar" data-act="exit-preview">Previewing as ${esc(actor()?.name)} · tap to exit</button></div>`
    : '';
  scr.style.setProperty('--accent', actor()?.color || '#8AA7FF');
  scr.style.setProperty('--dir', String(S.dir || 0));
  document.documentElement.style.setProperty('--accent', actor()?.color || '#8AA7FF');
  scr.innerHTML = banner + `<div class="view${S.animateNext ? '' : ' calm'}${S.suppressAnim ? ' no-anim' : ''}">${VIEWS[S.view]()}</div>`;
  S.animateNext = false;
  renderTabs();
}

function refresh() {
  const y = window.scrollY;
  render();
  requestAnimationFrame(() => window.scrollTo(0, y));
}

function go(view) {
  if (view === S.view) {
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
    return;
  }
  const from = TABS.findIndex((t) => t.id === S.view);
  const to = TABS.findIndex((t) => t.id === view);
  S.scroll[S.view] = window.scrollY;
  S.view = view;
  S.dir = from >= 0 && to >= 0 ? Math.sign(to - from) : 0;
  S.animateNext = true;
  render();
  window.scrollTo(0, S.scroll[view] || 0);
}

/** A day counts when all five are kept: on time, at the mosque, or period. */
const validPrayer = (rec) => !!rec && (rec.status === 'ontime' || rec.status === 'period' || rec.mosque === true);
const validPrayerCount = (memberId, day) =>
  PRAYER_ORDER.filter((key) => validPrayer(getPrayer(memberId, day, key))).length;

function perfectDays(memberId) {
  const days = new Set(S.prayers.filter((r) => r.memberId === memberId).map((r) => r.day));
  return new Set([...days].filter((day) =>
    PRAYER_ORDER.every((key) => validPrayer(getPrayer(memberId, day, key)))));
}

/** A day is excused when all five prayers are marked as period. */
const isExcused = (memberId, day) =>
  PRAYER_ORDER.every((k) => getPrayer(memberId, day, k)?.status === 'period');

function excusedDays(memberId) {
  const days = new Set();
  for (const p of S.prayers) {
    if (p.memberId === memberId && p.status === 'period') days.add(p.day);
  }
  const out = new Set();
  for (const d of days) if (isExcused(memberId, d)) out.add(d);
  return out;
}

const prayerKept = (r) => !!r && (r.status === 'ontime' || r.mosque === true);
const prayerCounted = (r) => !!r && (r.status === 'ontime' || r.status === 'late');

/**
 * A day joins the streak when all five are on time, at the mosque, or period.
 * Today never breaks a streak while it is still being lived —
 * the count falls back to yesterday until today is complete.
 */
function streakOf(memberId) {
  const perfect = perfectDays(memberId);
  const start = statsStart();
  const today = dayKey();

  let cursor = parseDay(today);
  if (!perfect.has(today)) cursor = addDays(cursor, -1);

  let current = 0;
  while (dayKey(cursor) >= start && perfect.has(dayKey(cursor))) {
    current++;
    cursor = addDays(cursor, -1);
  }

  let best = 0;
  let run = 0;
  for (let d = parseDay(start); dayKey(d) <= today; d = addDays(d, 1)) {
    if (perfect.has(dayKey(d))) {
      run++;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }

  return { current, best: Math.max(best, current), excusedToday: isExcused(memberId, today) };
}

const flameSvg = (size = 16) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c2.9 3.3 5 5.7 5 8.6a5 5 0 0 1-10 0C7 8.7 9.1 6.3 12 3Z"/><path d="M12 12.4c1 .9 1.6 1.8 1.6 2.7a1.6 1.6 0 1 1-3.2 0c0-.9.6-1.8 1.6-2.7Z"/></svg>`;

function streakPanel(member) {
  const streak = streakOf(member.id);
  const today = dayKey();
  const perfect = perfectDays(member.id);
  const progress = validPrayerCount(member.id, today);
  const week = Array.from({ length: 7 }, (_, i) => {
    const day = dayKey(addDays(parseDay(today), i - 6));
    const kept = validPrayerCount(member.id, day);
    const before = day < statsStart();
    return `<button class="streak-day ${perfect.has(day) ? 'complete' : ''} ${day === today ? 'today' : ''}"
      data-act="streak-day" data-day="${day}" ${before ? 'disabled' : ''}
      aria-label="${esc(dayLabel(day))}: ${before ? 'before counting' : `${kept} of 5 valid prayers${perfect.has(day) ? ', streak day' : ''}`}">
      <span>${parseDay(day).toLocaleDateString(LOCALE, { weekday: 'narrow' })}</span>
      <i>${perfect.has(day) ? '✦' : kept || '·'}</i>
    </button>`;
  }).join('');
  return `<section class="streak-panel card">
    <div class="streak-main">
      <div class="streak-symbol">${flameSvg(26)}</div>
      <div><div class="streak-label">${esc(member.name)}'s prayer streak</div>
        <div class="streak-number num">${streak.current}<span> ${streak.current === 1 ? 'day' : 'days'}</span></div>
        <div class="streak-detail">${perfect.has(today) ? 'All five count today — your streak grows.' : `${progress} of 5 valid today · on time, mosque or period`}</div>
      </div>
      <div class="streak-record">Best <b class="num">${streak.best}</b></div>
    </div>
    <div class="streak-days" aria-label="Last seven days">${week}</div>
    <p class="streak-rule">Each day counts only when all five prayers qualify. Tap a day to see both people’s details.</p>
  </section>`;
}

/* ============================================================
   Qibla — the bearing to the Kaaba, and a live compass
   ============================================================ */
const KAABA = { lat: 21.4225, lng: 39.8262 };
const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

function qiblaBearing(lat, lng) {
  const p1 = (lat * Math.PI) / 180;
  const p2 = (KAABA.lat * Math.PI) / 180;
  const dl = ((KAABA.lng - lng) * Math.PI) / 180;
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function kaabaDistanceKm(lat, lng) {
  const R = 6371;
  const p1 = (lat * Math.PI) / 180;
  const p2 = (KAABA.lat * Math.PI) / 180;
  const dp = p2 - p1;
  const dl = ((KAABA.lng - lng) * Math.PI) / 180;
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

let compassStop = null;
function stopCompass() {
  if (compassStop) { compassStop(); compassStop = null; }
}

const compassIcon = (size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.6"/><path d="m15.4 8.6-2.1 4.7-4.7 2.1 2.1-4.7 4.7-2.1Z"/></svg>`;

/** A tiny dial with a rose dot at the Qibla bearing. */
function miniCompass(bearing, size = 24) {
  const rad = (bearing * Math.PI) / 180;
  const x = 12 + Math.sin(rad) * 6.4;
  const y = 12 - Math.cos(rad) * 6.4;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity=".32" stroke-width="1.2"/>
    <path d="M12 3.6v2" stroke="currentColor" stroke-opacity=".55" stroke-width="1.2" stroke-linecap="round"/>
    <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5" fill="var(--pink)"/>
  </svg>`;
}

function qiblaStrip() {
  const { lat, lng } = S.settings;
  const bearing = qiblaBearing(lat, lng);
  const cardinal = CARDINALS[Math.round(bearing / 45) % 8];
  const km = Math.round(kaabaDistanceKm(lat, lng));
  return `
    <button class="qibla-strip" data-act="qibla">
      <span class="qs-ico">${miniCompass(bearing)}</span>
      <span class="qs-body">
        <span class="qs-k">Qibla</span>
        <span class="qs-d">${Math.round(bearing)}° ${cardinal} · ${km.toLocaleString(LOCALE)} km to Mecca</span>
      </span>
      <span class="qs-go">›</span>
    </button>`;
}

function sheetQibla() {
  const { lat, lng } = S.settings;
  const bearing = qiblaBearing(lat, lng);
  const cardinal = CARDINALS[Math.round(bearing / 45) % 8];
  const km = Math.round(kaabaDistanceKm(lat, lng));
  const rad = (bearing * Math.PI) / 180;
  const mx = 120 + Math.sin(rad) * 72;
  const my = 120 - Math.cos(rad) * 72;

  const ticks = Array.from({ length: 24 }, (_, i) => {
    const angle = i * 15;
    const long = i % 3 === 0;
    return `<line class="q-tick${long ? ' long' : ''}" stroke="currentColor" stroke-opacity=".18" stroke-linecap="round" x1="120" y1="${long ? 17 : 21}" x2="120" y2="28" transform="rotate(${angle} 120 120)"/>`;
  }).join('');

  openSheet(`
    <div class="grip"></div>
    <div class="qibla-sheet">
      <h3>Qibla</h3>
      <p class="sheet-sub">${esc(S.settings.place)} · ${km.toLocaleString(LOCALE)} km to Mecca</p>

      <div class="q-dial-wrap">
        <svg class="q-svg" viewBox="0 0 240 240" aria-hidden="true">
          <defs>
            <radialGradient id="qGlow" cx="50%" cy="42%" r="58%">
              <stop offset="0" stop-color="#E8749B" stop-opacity=".16"></stop>
              <stop offset="1" stop-color="#E8749B" stop-opacity="0"></stop>
            </radialGradient>
          </defs>

          <circle class="q-disc" cx="120" cy="120" r="105" fill="url(#qGlow)"/>
          <circle class="q-ring" cx="120" cy="120" r="112" fill="none" stroke="currentColor" stroke-opacity=".16"/>

          <g id="qDial">
            ${ticks}
            <text class="q-card" x="120" y="48" text-anchor="middle" fill="currentColor" opacity=".5">N</text>
            <text class="q-card" x="195" y="124.5" text-anchor="middle" fill="currentColor" opacity=".5">E</text>
            <text class="q-card" x="120" y="201" text-anchor="middle" fill="currentColor" opacity=".5">S</text>
            <text class="q-card" x="45" y="124.5" text-anchor="middle" fill="currentColor" opacity=".5">W</text>
            <g transform="rotate(${bearing} 120 120)">
              <path class="q-needle" fill="#E8749B" d="M120 62 L123.5 92 L120 88.5 L116.5 92 Z"/>
            </g>
          </g>

          <g id="qMarker" transform="translate(${mx.toFixed(1)} ${my.toFixed(1)})">
            <circle class="q-halo" r="17" fill="#E8749B" opacity="0"/>
            <g class="q-kaaba">
              <rect x="-9.5" y="-9.5" width="19" height="19" rx="3.4" fill="#191519" stroke="rgba(255,255,255,.3)" stroke-width="1"/>
              <rect x="-9.5" y="-3" width="19" height="2.5" fill="#C9A24B"/>
              <rect x="-2" y="1.8" width="4" height="6" rx=".8" fill="#C9A24B" opacity=".85"/>
            </g>
          </g>

          <circle class="q-hub" cx="120" cy="120" r="4.4" fill="currentColor"/>
        </svg>
      </div>

      <div class="q-readout"><b class="num">${Math.round(bearing)}°</b><span>${cardinal}</span></div>
      <div class="q-live" id="qLive">Hold the phone flat for live guidance</div>

      <button class="btn primary wide" id="qPerm" data-act="qibla-permission" hidden>Turn on the compass</button>

      <p class="q-note" id="qNote">The black cube is Mecca. Turn until it sits at the top of the dial.</p>
    </div>
  `, (sheet) => attachCompass(sheet, bearing));
}

function attachCompass(sheet, bearing) {
  const dial = sheet.querySelector('#qDial');
  const marker = sheet.querySelector('#qMarker');
  const wrap = sheet.querySelector('.q-dial-wrap');
  const live = sheet.querySelector('#qLive');
  const note = sheet.querySelector('#qNote');
  const perm = sheet.querySelector('#qPerm');

  let heard = false;
  let pending = null;
  let frame = 0;
  let lastText = '';
  let lastAligned = null;
  let lastAccuracy = '';

  const placeMarker = (heading) => {
    const rad = ((bearing - heading) * Math.PI) / 180;
    const x = 120 + Math.sin(rad) * 72;
    const y = 120 - Math.cos(rad) * 72;
    marker.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  };

  const paint = () => {
    frame = 0;
    if (pending == null) return;
    const heading = pending;
    pending = null;

    dial.setAttribute('transform', `rotate(${-heading.toFixed(1)} 120 120)`);
    placeMarker(heading);

    const delta = ((bearing - heading + 540) % 360) - 180;
    const abs = Math.abs(delta);
    const aligned = abs < 6;

    if (aligned !== lastAligned) {
      lastAligned = aligned;
      wrap.classList.toggle('aligned', aligned);
      live.classList.toggle('ok', aligned);
    }

    const text = aligned ? 'Facing the Qibla' : `Turn ${Math.round(abs)}° ${delta > 0 ? 'right' : 'left'}`;
    if (text !== lastText) {
      lastText = text;
      live.textContent = text;
    }
  };

  const onOrient = (e) => {
    // One source only: iOS's true heading, or Chrome's absolute alpha.
    // The ordinary `deviceorientation` alpha is relative and causes the
    // needle to fight itself — that was the lag.
    let heading = null;
    if (typeof e.webkitCompassHeading === 'number' && e.webkitCompassHeading >= 0) {
      heading = e.webkitCompassHeading;
    } else if (e.type === 'deviceorientationabsolute' || e.absolute === true) {
      if (typeof e.alpha === 'number' && e.alpha !== null) heading = 360 - e.alpha;
    }
    if (heading == null) return;

    heard = true;
    pending = ((heading % 360) + 360) % 360;
    if (!frame) frame = requestAnimationFrame(paint);

    const acc = e.webkitCompassAccuracy;
    if (typeof acc === 'number' && acc >= 0) {
      const msg = `Compass accuracy ±${Math.round(acc)}°`;
      if (msg !== lastAccuracy) {
        lastAccuracy = msg;
        note.textContent = msg;
      }
    }
  };

  window.addEventListener('deviceorientationabsolute', onOrient, { capture: true, passive: true });
  window.addEventListener('deviceorientation', onOrient, { capture: true, passive: true });

  compassStop = () => {
    window.removeEventListener('deviceorientationabsolute', onOrient, true);
    window.removeEventListener('deviceorientation', onOrient, true);
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  if (perm) perm.hidden = !(typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function');

  setTimeout(() => {
    if (!heard) {
      live.textContent = `The Qibla is ${Math.round(bearing)}° from north`;
      note.textContent = 'No compass reading on this device. Hold the phone flat and use the bearing above, or turn on the compass below.';
    }
  }, 1600);
}

/* ============================================================
   The day arc — five prayers on the sky, the sun at "now"
   ============================================================ */
function dayArc(who) {
  const day = dayKey();
  const t = times(day);
  const fajr = t.fajr.getTime();
  const isha = t.isha.getTime();
  const span = Math.max(60000, isha - fajr);
  const now = Date.now();
  const f = Math.min(1, Math.max(0, (now - fajr) / span));

  const P = (frac) => {
    const th = Math.PI * (1 - Math.min(1, Math.max(0, frac)));
    return [150 + 138 * Math.cos(th), 82 - 68 * Math.sin(th)];
  };

  const [x0, y0] = P(0);
  const [x1, y1] = P(1);
  const [xc, yc] = P(f);

  const dots = PRAYER_ORDER.map((k) => {
    const frac = (t[k].getTime() - fajr) / span;
    const [x, y] = P(frac);
    const r = getPrayer(who.id, day, k);
    const st = r?.mosque ? 'mosque' : r?.status || 'pending';
    return `<circle class="arc-dot" data-state="${st}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.3"></circle>`;
  }).join('');

  const np = nextPrayer(t);
  const night = now >= isha || now < fajr;

  return `
    <section class="dayarc">
      <div class="arc-head">
        <div>
          <div class="arc-k">${np.tomorrow ? 'Tomorrow' : 'Next'}</div>
          <div class="arc-next">${PMETA[np.key].name} <b class="num">${fmtTime(np.at)}</b></div>
        </div>
        <div class="arc-in num">in <b>${fmtCountdown(np.at - new Date())}</b></div>
      </div>

      <svg class="arc-svg" viewBox="0 0 300 104" aria-hidden="true">
        ${night ? `<defs><mask id="naMoonMask">
          <rect width="300" height="104" fill="#000"/>
          <circle cx="${xc.toFixed(1)}" cy="${yc.toFixed(1)}" r="5.9" fill="#fff"/>
          <circle cx="${(xc + 2.7).toFixed(1)}" cy="${(yc - 1.2).toFixed(1)}" r="5.1" fill="#000"/>
        </mask></defs>` : ''}
        <path class="arc-track" pathLength="1" d="M${x0.toFixed(1)} ${y0.toFixed(1)} A 138 68 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}"/>
        ${f > 0.003 ? `<path class="arc-fill" pathLength="1" d="M${x0.toFixed(1)} ${y0.toFixed(1)} A 138 68 0 0 1 ${xc.toFixed(1)} ${yc.toFixed(1)}"/>` : ''}
        ${dots}
        <circle class="arc-halo${night ? ' night' : ''}" cx="${xc.toFixed(1)}" cy="${yc.toFixed(1)}" r="11"></circle>
        ${night
          ? `<circle class="arc-moon" cx="${xc.toFixed(1)}" cy="${yc.toFixed(1)}" r="5.9" mask="url(#naMoonMask)"></circle>`
          : `<circle class="arc-sun" cx="${xc.toFixed(1)}" cy="${yc.toFixed(1)}" r="5.4"></circle>`}
      </svg>

      <div class="arc-foot">
        <span>Fajr <b class="num">${fmtTime(t.fajr)}</b></span>
        <span class="arc-now-label">now</span>
        <span>Isha <b class="num">${fmtTime(t.isha)}</b></span>
      </div>
    </section>`;
}

/* ============================================================
   Prayer reminders — per prayer, with an urgent warning
   ============================================================ */
const NOTIF_KEY = 'na:notified';

function notifiedSet() {
  try { return new Set(JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]')); } catch { return new Set(); }
}

function markNotified(key) {
  const set = notifiedSet();
  set.add(key);
  const today = dayKey();
  const keep = [...set].filter((k) => k.startsWith(today));
  try { localStorage.setItem(NOTIF_KEY, JSON.stringify(keep)); } catch { /* ignore */ }
}

function once(key, fn) {
  if (notifiedSet().has(key)) return;
  markNotified(key);
  fn();
}

async function notify(title, body, tag, extra = {}) {
  // Notifications were cancelled; this also guards older, no-longer-visible actions.
  return 'disabled';
  const url = new URL('./', location.href).href;
  const opts = {
    body,
    tag,
    renotify: true,
    icon: './icons/icon-192.png',
    badge: './icons/icon-192.png',
    image: './icons/notify-hero.png',
    vibrate: extra.urgent ? [120, 60, 120, 60, 200] : [60, 40, 60],
    requireInteraction: !!extra.urgent,
    data: { url, prayer: extra.prayer || null },
    actions: extra.urgent && extra.prayer ? [{ action: 'log', title: `Log ${PMETA[extra.prayer].name}` }] : [],
  };

  const mark = (result) => {
    try { localStorage.setItem('na:lastNotif', JSON.stringify({ title, at: Date.now(), result })); } catch { /* ignore */ }
  };

  if (!('Notification' in window) || Notification.permission !== 'granted') {
    mark('blocked');
    toast(`${title} — ${body}`, 5200);
    return 'blocked';
  }

  try {
    const reg = navigator.serviceWorker
      ? await Promise.race([
          navigator.serviceWorker.ready,
          new Promise((_, reject) => setTimeout(() => reject(new Error('sw timeout')), 4000)),
        ])
      : null;

    if (reg?.showNotification) {
      await reg.showNotification(title, opts);
      mark('sent');
      return 'sent';
    }
    new Notification(title, opts);
    mark('sent');
    return 'sent';
  } catch {
    try {
      new Notification(title, opts);
      mark('sent');
      return 'sent';
    } catch {
      mark('failed');
      toast(`${title} — ${body}`, 5200);
      return 'failed';
    }
  }
}

function checkPrayerNotifications() {
  if (!S.members.length) return;
  const n = S.settings.notif || {};
  if (!n.prayer) return;

  const prefs = n.prayers || {};
  const who = me();
  if (!who) return;

  const day = dayKey();
  if (isExcused(who.id, day)) return;

  const t = times(day);
  const now = new Date();
  const lead = n.lead || 20;

  for (const k of PRAYER_ORDER) {
    if (prefs[k] === false) continue;
    if (getPrayer(who.id, day, k)) continue;

    const start = t[k];
    const end = t.onTimeEnd[k];
    if (now < start || now >= end) continue; // only the window you are inside

    const mins = Math.round((end - now) / 60000);
    const urgentAt = new Date(end.getTime() - lead * 60000);

    if (n.urgency !== false && now >= urgentAt) {
      once(`${day}|${k}|urgent`, () =>
        notify(`${PMETA[k].name} ends in ${mins} min`, 'Still unlogged — pray before the window closes.', `urgent-${k}`, { urgent: true, prayer: k }));
    } else {
      once(`${day}|${k}|start`, () =>
        notify(`${PMETA[k].name} · ${fmtTime(start)}`, `The window closes at ${fmtTime(end)}.`, `start-${k}`, { prayer: k }));
    }
  }
}

let notifTimer = null;
function startPrayerWatch() {
  clearInterval(notifTimer);
  const run = () => {
    try { checkPrayerNotifications(); } catch (err) { console.warn('reminder check failed', err); }
  };
  run();
  notifTimer = setInterval(run, 30000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') run();
  });
}

/** The prayer whose on-time window closes soonest, if still unlogged. */
function closingSoon(memberId) {
  if (isExcused(memberId, dayKey())) return null;
  const t = times(dayKey());
  const now = new Date();
  for (const k of PRAYER_ORDER) {
    if (now < t[k]) continue;
    const mins = (t.onTimeEnd[k] - now) / 60000;
    if (mins > 0 && mins <= 30 && !getPrayer(memberId, dayKey(), k)) {
      return { k, mins: Math.round(mins) };
    }
  }
  return null;
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
  const streak = streakOf(who.id);
  const soon = closingSoon(who.id);
  const excused = isExcused(who.id, today);
  const C = 2 * Math.PI * 52;

  const capAngle = -Math.PI / 2 + (onTime / 5) * Math.PI * 2;
  const capX = 64 + Math.cos(capAngle) * 52;
  const capY = 64 + Math.sin(capAngle) * 52;

  const ring = `
    <div class="ring-wrap">
      <svg class="ring" viewBox="0 0 128 128" aria-hidden="true">
        <defs>
          <linearGradient id="naRingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style="stop-color:var(--accent)"></stop>
            <stop offset="1" style="stop-color:var(--pink)"></stop>
          </linearGradient>
        </defs>
        <circle class="bg" cx="64" cy="64" r="52"></circle>
        <circle class="fg" cx="64" cy="64" r="52"
          stroke-dasharray="${C.toFixed(1)}"
          stroke-dashoffset="${(C * (1 - onTime / 5)).toFixed(1)}"></circle>
        ${onTime > 0 ? `<circle class="cap" cx="${capX.toFixed(1)}" cy="${capY.toFixed(1)}" r="4.4"></circle>` : ''}
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
    const flood = state === 'ontime' ? 'var(--ok)' : state === 'late' ? 'var(--late)' : state === 'missed' ? 'var(--miss)' : state === 'period' ? 'var(--pink)' : 'transparent';
    return `
      <button class="prow" data-act="log" data-key="${k}" data-state="${state}" data-mosque="${rec?.mosque ? '1' : '0'}"${fresh} style="--flood:${flood}">
        <span class="glyph">${state === 'ontime' ? '✓' : state === 'late' ? '◔' : state === 'missed' ? '✕' : state === 'period' ? '—' : '○'}</span>
        <span class="meta">
          <span class="name">${PMETA[k].name}${rec?.mosque ? `<span class="mosque-tag">${I.mosque} Mosque</span>` : ''}<span class="ar">${PMETA[k].ar}</span></span>
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
           <span class="count num">${validPrayerCount(p.id, today)} of 5 valid · today</span>
        </span>
      </div>
      <div class="partner-prayers">
        ${PRAYER_ORDER.map((k) => {
          const r = getPrayer(p.id, today, k);
          const st = r?.status || 'pending';
          const react = r ? reactionFor(who.id, 'prayer', r.id) : null;
          return `<button class="partner-prayer" data-act="react-prayer" data-id="${r?.id || ''}" ${r ? '' : 'disabled'}
            aria-label="${esc(p.name)} · ${PMETA[k].name} · ${STATUS_LABEL[st]}${r?.mosque ? ' · mosque' : ''}${r ? ' · send a reaction' : ''}">
            <span class="partner-prayer-name">${PMETA[k].name}</span>
            <span class="pill ${st}"><span class="dot"></span>${STATUS_LABEL[st]}</span>
            ${r?.mosque ? `<span class="partner-mosque">${I.mosque} Mosque</span>` : ''}
            ${react ? `<span aria-hidden="true">${react.emoji}</span>` : ''}
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
       <button class="head-avatar" data-act="open-settings" aria-label="Settings" style="box-shadow:0 0 0 3px ${who.color}30">${who.avatar}</button>
    </header>

    ${soon ? `<button class="urgent" data-act="log" data-key="${soon.k}">
      <span class="dot"></span>
      <span>${PMETA[soon.k].name} ends in ${soon.mins} min — not logged yet</span>
    </button>` : ''}

    <div class="card hero">
      ${ring}
      <div class="hero-copy">
        <div class="next-label">${np.tomorrow ? 'Tomorrow' : 'Next'}</div>
        <div class="next-name">${PMETA[np.key].name} <span class="num" style="color:var(--ink-2);font-size:17px;font-weight:500">${fmtTime(np.at)}</span></div>
        <div class="next-meta num">in <b>${fmtCountdown(np.at - new Date())}</b>${np.tomorrow ? ' · new day' : ''}</div>
        ${streak.current ? `<div class="hero-streak">${flameSvg(13)} ${streak.current}-day streak</div>` : ''}
      </div>
    </div>

    <div class="prayers stagger">${rows}</div>
    <div class="section-title">Your streak</div>
    ${streakPanel(who)}

    ${qiblaStrip()}

    ${dayKey() < statsStart() ? `<div class="notice">Counting begins ${parseDay(statsStart()).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long' })} — today is yours, it just isn't averaged yet.</div>` : ''}

    <div class="section-title">${p ? 'Side by side' : 'Your partner'}</div>
    ${partnerCard}
    ${p ? streakPanel(p) : ''}

    <div class="section-title">Last seven days <span class="link">${week.total}/${week.possible}</span></div>
    <div class="card card-pad">
      ${week.html}
    </div>
  `;
}

function lastSeven(memberId) {
  const today = new Date();
  let total = 0;
  let possible = 0;
  const cols = [];
  for (let i = 6; i >= 0; i--) {
    const d = addDays(today, -i);
    const k = dayKey(d);
    if (k >= statsStart()) possible += 5;
    const dots = PRAYER_ORDER.map((p) => {
      const r = getPrayer(memberId, k, p);
      if (k >= statsStart() && validPrayer(r)) total++;
      return `<i class="dot ${r?.status || ''}"></i>`;
    }).join('');
    cols.push(`<div class="col ${i === 0 ? 'today' : ''}">
      <span class="dow">${d.toLocaleDateString(LOCALE, { weekday: 'narrow' })}</span>${dots}
    </div>`);
  }
  return { html: `<div class="week">${cols.join('')}</div>`, total, possible };
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

  const metric = (label, a, b) => `
    <div class="metric">
      <span class="lab">${label}</span>
      <b class="num">${a ?? '–'}</b>
      <b class="num">${b ?? '–'}</b>
    </div>`;

  const compare = p ? `
    <div class="card compare">
      <div class="compare-head">
        <span></span>
        <span class="you">You</span>
        <span class="them">${esc(p.name)}</span>
      </div>
       ${metric('Satisfaction', mine?.happiness, theirs?.happiness)}
       ${metric('Productivity', mine?.productivity, theirs?.productivity)}
    </div>
    <div style="height:14px"></div>` : '';

  return `
    <header class="head">
      <div>
        <div class="eyebrow">${parseDay(today).toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        <h1>How was today?</h1>
         <div class="sub">Rate your satisfaction and productivity out of 10.</div>
       </div>
       <button class="icon-btn" data-act="open-settings" aria-label="Settings">${I.sliders}</button>
    </header>

    ${compare}

    <form class="review-form" data-form="save-review">
      ${scoreControl('happiness', 'Satisfaction', mine?.happiness ?? 5, 'How happy did today feel?')}
      ${scoreControl('productivity', 'Productivity', mine?.productivity ?? 5, 'How much could you get done?')}
      <div class="card card-pad">
       <button class="btn primary wide" type="submit">${saved ? 'Update today' : 'Save today'}</button>
       ${saved ? `<div style="text-align:center;font-size:12px;color:var(--ink-3);margin-top:10px">Saved · you can change it until the day ends</div>` : ''}
      </div>
    </form>

    ${gradeTrend(who, p)}
    ${weeklyRecap(who, p)}
    ${dayHistory(who, p)}
  `;
}

const scoreDescription = (score, field) => field === 'productivity'
  ? (score <= 2 ? 'A slow day' : score <= 4 ? 'Finding focus' : score <= 6 ? 'Making progress' : score <= 8 ? 'Focused' : 'In full flow')
  : (score <= 2 ? 'A difficult day' : score <= 4 ? 'Room to breathe' : score <= 6 ? 'Finding a rhythm' : score <= 8 ? 'A good day' : 'Feeling bright');

function scoreControl(field, label, value, question) {
  const tone = field === 'happiness' ? 'satisfaction' : 'productivity';
  return `<section class="score-control card ${tone}" data-score-control="${field}" style="--score:${value}">
    <input type="hidden" name="${field}" value="${value}">
    <div class="score-top">
      <div><div class="score-label">${label}</div><p>${question}</p></div>
      <div class="score-dial" aria-hidden="true"><b class="num score-value">${value}</b><small>/ 10</small></div>
    </div>
    <div class="score-choices" role="radiogroup" aria-label="${label} out of 10">
      ${Array.from({ length: 11 }, (_, n) => `<button type="button" role="radio" data-act="score-pick" data-score="${n}"
        aria-label="${n} out of 10" aria-checked="${n === value}" tabindex="${n === value ? '0' : '-1'}"
        class="${n <= value ? 'filled' : ''}">${n}</button>`).join('')}
    </div>
    <div class="score-foot"><span>0 · Very low</span><strong class="score-description">${scoreDescription(value, field)}</strong><span>10 · Excellent</span></div>
  </section>`;
}

/** Plot only recorded scores. Missing days never become zero. */
function gradeTrend(who, partner) {
  const member = S.trendMember === 'partner' && partner ? partner : who;
  const today = dayKey();
  const start = statsStart();
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const day = dayKey(addDays(parseDay(today), -i));
    if (day >= start) days.push({ day, review: reviewFor(member.id, day) });
  }
  const w = 320, h = 146, left = 27, right = 10, top = 12, bottom = 22;
  const x = (i) => left + (i / Math.max(1, days.length - 1)) * (w - left - right);
  const y = (score) => top + ((10 - score) / 10) * (h - top - bottom);
  const line = (key) => {
    const recorded = days.map(({ review }, i) => {
      const score = review?.[key];
      return Number.isFinite(score) ? { i, score } : null;
    }).filter(Boolean);
    return recorded.map(({ i, score }, n) =>
      `${n ? 'L' : 'M'}${x(i).toFixed(1)} ${y(score).toFixed(1)}`).join(' ');
  };
  const points = (key, cls) => days.map(({ day, review }, i) =>
    Number.isFinite(review?.[key])
      ? `<circle class="${cls}" cx="${x(i).toFixed(1)}" cy="${y(review[key]).toFixed(1)}" r="3.3"><title>${esc(dayLabel(day))}: ${key === 'happiness' ? 'Satisfaction' : 'Productivity'} ${review[key]}/10</title></circle>`
      : '').join('');
  const hasGrades = days.some(({ review }) =>
    Number.isFinite(review?.happiness) || Number.isFinite(review?.productivity));

  return `
    <div class="section-title">Scores over time</div>
    <section class="card card-pad grade-trend">
      ${partner ? `<div class="seg" role="group" aria-label="Whose scores">
        <button data-act="trend-person" data-person="mine" aria-pressed="${member.id === who.id}">Mine</button>
        <button data-act="trend-person" data-person="partner" aria-pressed="${member.id === partner.id}">${esc(partner.name)}</button>
      </div>` : `<div class="grade-person">${esc(who.name)}</div>`}
      <div class="chart-legend"><span><i class="dot h"></i>Satisfaction</span><span><i class="dot p"></i>Productivity</span></div>
      ${hasGrades ? `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(member.name)}'s satisfaction and productivity scores over the last ${days.length} days, on a scale from 0 to 10">
        ${[0, 5, 10].map((n) => `<line class="grid" x1="${left}" x2="${w - right}" y1="${y(n)}" y2="${y(n)}"/><text class="axis" x="${left - 7}" y="${y(n) + 3}">${n}</text>`).join('')}
        <path class="grade-line satisfaction" d="${line('happiness')}"/>
        <path class="grade-line productivity" d="${line('productivity')}"/>
        ${points('happiness', 'satisfaction')}${points('productivity', 'productivity')}
      </svg>
      <div class="chart-x"><span>${days.length ? parseDay(days[0].day).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' }) : ''}</span><span>Today</span></div>
      <p class="chart-note">Only days with a saved score are plotted.</p>`
      : `<p class="empty-note">No scores yet. Your first review will appear here.</p>`}
    </section>`;
}

function weeklyRecap(who, partner) {
  const start = statsStart();
  const monday = (date) => addDays(date, -((date.getDay() + 6) % 7));
  const weeks = [];
  const lastSunday = addDays(monday(parseDay(dayKey())), -1);
  for (let date = monday(parseDay(start)); date <= lastSunday; date = addDays(date, 7)) {
    weeks.push({ from: dayKey(date), to: dayKey(addDays(date, 6)) });
  }
  if (!weeks.length) return `<div class="section-title">Weekly recap</div>
    <div class="card card-pad empty-note">Your first weekly recap appears after Sunday. No notification needed.</div>`;

  const index = S.recapWeek === null ? weeks.length - 1 : clamp(S.recapWeek, 0, weeks.length - 1);
  const week = weeks[index];
  const member = S.recapMember === 'partner' && partner ? partner : who;
  const previous = index > 0 ? weeks[index - 1] : null;
  const recap = (range) => {
    if (!range) return null;
    const days = [];
    for (let date = parseDay(range.from); dayKey(date) <= range.to; date = addDays(date, 1)) {
      const day = dayKey(date);
      if (day < start) continue;
      const review = reviewFor(member.id, day);
      const statuses = PRAYER_ORDER.map((key) => {
        const prayer = getPrayer(member.id, day, key);
        return prayer?.mosque ? 'mosque' : prayer?.status || 'pending';
      });
      days.push({ day, review, statuses });
    }
    const average = (field) => {
      const values = days.map((d) => d.review?.[field]).filter(Number.isFinite);
      return values.length ? values.reduce((sum, n) => sum + n, 0) / values.length : null;
    };
    const kept = days.reduce((n, d) => n + validPrayerCount(member.id, d.day), 0);
    return { days, kept, total: days.length * 5, satisfaction: average('happiness'), productivity: average('productivity') };
  };
  const current = recap(week);
  const prior = recap(previous);
  const pct = (data) => data?.total ? Math.round(data.kept / data.total * 100) : 0;
  const delta = (now, then, suffix = '') => {
    if (now == null || then == null) return '<span class="recap-delta neutral">No previous score</span>';
    const diff = now - then;
    return `<span class="recap-delta ${diff > 0.04 ? 'up' : diff < -0.04 ? 'down' : 'neutral'}">${diff > 0.04 ? '↑ +' : diff < -0.04 ? '↓ ' : '→ '}${Math.abs(diff) < 0.05 ? '0' : Math.abs(diff).toFixed(1)}${suffix} vs prior week</span>`;
  };
  const score = (key, label) => `<div class="recap-score">
    <span>${label}</span><b class="num">${current[key] == null ? '—' : current[key].toFixed(1)}<small>/10</small></b>
    ${delta(current[key], prior?.[key])}
  </div>`;
  const dayCards = current.days.map(({ day, statuses }) => `
    <button class="recap-day" data-act="streak-day" data-day="${day}" aria-label="${esc(dayLabel(day))}, ${validPrayerCount(member.id, day)} of 5 valid prayers; show full day">
      <span>${parseDay(day).toLocaleDateString(LOCALE, { weekday: 'short' })}<small>${parseDay(day).getDate()}</small></span>
      <span class="recap-marks">${statuses.map((state) => `<i class="${state}" title="${state === 'mosque' ? 'At the mosque' : STATUS_LABEL[state] || state}"></i>`).join('')}</span>
      <b class="num">${validPrayerCount(member.id, day)}/5</b>
    </button>`).join('');

  return `<div class="section-title">Weekly recap</div>
    <section class="card card-pad weekly-recap">
      <div class="recap-nav">
        <button data-act="recap-week" data-index="${index - 1}" aria-label="Previous week" ${index === 0 ? 'disabled' : ''}>‹</button>
        <div><span>WEEK ${index + 1} OF ${weeks.length}</span><h2>${parseDay(week.from).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' })} – ${parseDay(week.to).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' })}</h2></div>
        <button data-act="recap-week" data-index="${index + 1}" aria-label="Next week" ${index >= weeks.length - 1 ? 'disabled' : ''}>›</button>
      </div>
      ${partner ? `<div class="seg" role="group" aria-label="Whose weekly recap">
        <button data-act="recap-person" data-person="mine" aria-pressed="${member.id === who.id}">Mine</button>
        <button data-act="recap-person" data-person="partner" aria-pressed="${member.id === partner.id}">${esc(partner.name)}</button>
      </div>` : ''}
      <div class="recap-scores">${score('satisfaction', 'Satisfaction')}${score('productivity', 'Productivity')}</div>
      <div class="recap-prayer-total">
        <div><span>Prayers that counted</span><strong class="num">${current.kept}<small> / ${current.total}</small></strong></div>
        <div><b class="num">${pct(current)}%</b>${prior ? delta(pct(current), pct(prior), '%') : '<span class="recap-delta neutral">First week</span>'}</div>
      </div>
      <div class="recap-day-list">${dayCards}</div>
      <div class="recap-key"><i class="ontime"></i>On time <i class="mosque"></i>Mosque <i class="period"></i>Period <i class="late"></i>Late <i class="missed"></i>Missed</div>
      ${weeks.length > 1 ? `<div class="recap-timeline"><span>Earlier weeks</span>
        <div>${weeks.map((w, i) => `<button data-act="recap-week" data-index="${i}" aria-current="${i === index ? 'true' : 'false'}" aria-label="Week ${i + 1}, ${esc(w.to)}" title="${esc(w.from)} – ${esc(w.to)}"><i></i></button>`).join('')}</div>
      </div>` : ''}
    </section>`;
}

function dayHistory(who, partner) {
  const today = dayKey();
  const start = statsStart() > today ? today : statsStart();
  const selected = S.historyDay && S.historyDay >= start && S.historyDay <= today ? S.historyDay : today;
  const person = (member) => {
    const review = reviewFor(member.id, selected);
    const prayers = PRAYER_ORDER.map((key) => {
      const rec = getPrayer(member.id, selected, key);
      const state = rec?.status || 'pending';
      return `<div class="history-prayer">
        <span>${PMETA[key].name}</span>
        <span class="pill ${state}"><span class="dot"></span>${STATUS_LABEL[state]}</span>
        ${rec?.mosque ? `<small>${I.mosque} Mosque</small>` : ''}
      </div>`;
    }).join('');
    return `<div class="history-person">
      <div class="history-person-name"><span>${esc(member.avatar)}</span>${esc(member.name)}</div>
      <div class="their-scores">
        <div><span>Satisfaction</span><b class="num">${review?.happiness ?? '–'}</b><i>/10</i></div>
        <div><span>Productivity</span><b class="num">${review?.productivity ?? '–'}</b><i>/10</i></div>
      </div>
      <div class="history-prayers">${prayers}</div>
    </div>`;
  };
  return `
    <div class="section-title">A day in full</div>
    <section class="card card-pad day-history">
      <div class="history-date">
        <button data-act="history-prev" aria-label="Previous day" ${selected <= start ? 'disabled' : ''}>‹</button>
        <label for="history-day">Day <input id="history-day" type="date" min="${start}" max="${today}" value="${selected}"></label>
        <button data-act="history-next" aria-label="Next day" ${selected >= today ? 'disabled' : ''}>›</button>
      </div>
      ${person(who)}
      ${partner ? person(partner) : ''}
    </section>`;
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

  return `
    <header class="head">
      <div>
         <button class="crumb" data-act="tab" data-view="prayer">‹ Prayer</button>
        <h1 style="margin-top:12px">Settings</h1>
        <div class="sub">Version ${APP_VERSION} · ${latest.at}</div>
      </div>
    </header>

    <div class="settings-label">You</div>
    <div class="group">
      ${row('edit-name', I.user, 'Your name', esc(who?.name || ''), '')}
      ${row('edit-color', I.palette, 'Your colour', 'Used across the app', '', `style="--dot:${who?.color}"`)}
      ${row('edit-avatar', who?.avatar || '🌙', 'Your avatar', '', '')}
    </div>

    <div class="settings-label">The two of you</div>
    <div class="group">
      ${p ? row('edit-partner', I.heart, 'Partner', `${esc(p.name)} · joined ${new Date(p.joinedAt).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' })}`) : ''}
       ${row('sync', I.link, sync.isOn() ? 'Two phones connected' : 'Connect the other phone', syncLine())}
      ${p ? row('preview', I.eye, isPreview() ? 'Exit partner view' : 'Preview as ' + esc(p.name), 'See the app from their side') : ''}
    </div>

    <div class="settings-label">Faith &amp; place</div>
    <div class="group">
      ${row('source', I.mosque, 'Prayer times', S.settings.preset === 'cluj' ? 'Masjid Cluj-Napoca · Mawaqit' : `Calculated · ${METHODS[S.settings.method]?.label || ''}`)}
      ${!S.settings.preset ? row('method', I.sliders, 'Calculation method', METHODS[S.settings.method]?.label || 'Muslim World League') : ''}
      ${row('location', I.pin, 'Location', S.settings.place, '')}
      ${row('times-today', I.clock, "Today's times", '', '')}
    </div>

    <div class="settings-label">Appearance</div>
    <div class="group">
      <div class="row" style="display:block">
        <div class="seg" style="margin:0">
          ${['dark', 'light', 'system'].map((t) => `<button data-act="theme" data-theme="${t}" aria-selected="${(S.settings.theme || 'dark') === t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}
        </div>
      </div>
    </div>

    <div class="settings-label">This device</div>
    <div class="group">
      ${installed ? row('noop', I.check, 'Installed', 'Running as an app on this device') : row('install', I.phone, 'Install on this device', 'Add to your home screen')}
      ${row('export', I.download, 'Export a backup', 'Every day, as a JSON file')}
      ${row('import', I.upload, 'Restore from backup', 'Nothing is lost until you confirm')}
      ${row('clear-demo', I.flask, 'Remove sample history', 'Deletes only the demo days')}
      ${row('reset', I.trash, 'Reset everything', 'Erases this couple space on this device')}
    </div>

    <div class="settings-label">Counting &amp; updates</div>
    <div class="group">
      ${row('start-date', I.calendar, 'Counting from', new Date(parseDay(statsStart())).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' }))}
      ${row('check-updates', I.refresh, 'Check for updates', 'Reload the newest build', `v${APP_VERSION}`)}
      ${row('about', I.info, 'What\'s new', latest.notes, `v${latest.v}`)}
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

const targetBackend = () =>
  BACKEND ? { mode: 'supabase', url: BACKEND.url, apikey: BACKEND.apikey } : { mode: 'local' };

async function createSharedSpace() {
  const backend = targetBackend();
  if (!BACKEND && !(await sync.probe(backend))) {
    closeSheet();
    return toast('Cloud sync is not set up yet — ask me to finish it');
  }
  const key = makeKey();
  await sync.setConfig({ ...backend, key });
  closeSheet();
  toast('Creating your space…');
  await sync.begin(me());
  await loadState();
  refresh();
  setTimeout(() => sheetSync(), 500);
}

async function joinSharedSpace(code) {
  const backend = targetBackend();
  if (!BACKEND && !(await sync.probe(backend))) return toast('Cloud sync is not set up yet — ask me to finish it');
  await sync.setConfig({ ...backend, key: code });
  toast('Joining…');
  await sync.begin(me());
  await loadState();
  await reconcileMembers();
  S.suppressAnim = true;
  refresh();
  S.suppressAnim = false;
  toast('Connected');
}

async function onRemoteChange() {
  const el = document.activeElement;
  if (el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) {
    S.pendingRemote = true;
    await loadState();
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

/** A nudge arrives as the app speaking — never as the partner's name. */
async function sendNudge(message = '') {
  const text = String(message || '').trim();
  if (!text) return toast('Write something first');
  const who = me();
  const partner = other(who);
  if (!partner) return toast('No partner yet');
  if (!sync.isOn()) return toast('Pair the phones first — then it can travel');

  const rec = {
    id: uid(),
    from: who.id,
    targetType: 'ping',
    targetId: partner.id,
    emoji: text.slice(0, 140),
    day: dayKey(),
    createdAt: Date.now(),
  };
  S.reactions.push(rec);
  await db.put('reactions', rec);
  haptic(14);
  toast('Sent — quietly');
}

function sheetReminders() {
  const who = me();
  const received = S.reactions
    .filter((r) => r.targetType === 'ping' && r.targetId === who?.id && r.emoji)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 24);
  const when = (ts) => {
    const d = new Date(ts || Date.now());
    const day = dayKey(d);
    const today = dayKey();
    const yesterday = dayKey(addDays(new Date(), -1));
    const label = day === today ? 'Today' : day === yesterday ? 'Yesterday' : d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' });
    return `${label} · ${d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit' })}`;
  };
  openSheet(`
    <div class="grip"></div>
    <h3>Quiet reminders</h3>
    <p class="sheet-sub">Messages the app has carried between you — no names, no noise.</p>
    <div class="quiet-list">
      ${received.length ? received.map((r) => `<div class="quiet-msg"><span>${esc((r.emoji || '').slice(0, 140))}</span><small>${when(r.createdAt)}</small></div>`).join('') : `<div class="quiet-empty"><span>✉️</span><p>No reminders yet. The next one will wait here.</p></div>`}
    </div>
    <button class="btn primary wide" data-act="send-ping" style="margin-top:14px">${I.bell} Send one back</button>
    <button class="sheet-opt cancel" data-act="close" style="margin-top:8px">Close</button>
  `);
}

function sheetPing() {
  const partner = other(me());
  openSheet(`
    <div class="grip"></div>
    <h3>Send a notification</h3>
    <p class="sheet-sub">It arrives as the app speaking — your name stays out of it. It will find them the next time their app is open.</p>
    <form data-form="send-ping">
      <textarea class="area" name="message" id="ping-message" maxlength="140" placeholder="Write something…" style="min-height:86px"></textarea>
      <div class="ping-phrases">
        ${['Thinking of you', 'Pray for me', 'You’ve got this', 'Call me when you’re free']
          .map((p) => `<button type="button" class="chip" data-act="ping-phrase" data-text="${esc(p)}">${esc(p)}</button>`).join('')}
      </div>
      <button class="btn primary wide" type="submit" id="ping-send" style="margin-top:14px" disabled>Send</button>
    </form>
  `, (sheet) => {
    const area = sheet.querySelector('#ping-message');
    const btn = sheet.querySelector('#ping-send');
    const sync = () => { if (btn) btn.disabled = !area?.value.trim(); };
    area?.addEventListener('input', sync);
    area?.focus();
    sync();
  });
}

const PING_SEEN_KEY = 'na:pingsSeen';
const PING_WINDOW = 7 * 24 * 60 * 60 * 1000;

function seenPings() {
  try {
    const raw = JSON.parse(localStorage.getItem(PING_SEEN_KEY) || '[]');
    return new Set(Array.isArray(raw) ? raw : []);
  } catch {
    return new Set();
  }
}

function rememberPings(ids) {
  try {
    const all = [...seenPings(), ...ids].slice(-200);
    localStorage.setItem(PING_SEEN_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

/** Delivers a partner's ping as the app speaking — never with a name.
    Delivered ids are remembered, so a message is never lost to clock skew
    and one sent while the app was closed is waiting when it opens. */
async function deliverPings() {
  const who = me();
  if (!who) return;
  const seen = seenPings();
  const floor = Date.now() - PING_WINDOW;
  const at = (r) => r.createdAt || r.updatedAt || 0;
  const pings = S.reactions.filter((r) =>
    r.id &&
    r.targetType === 'ping' &&
    r.targetId === who.id &&
    !seen.has(r.id) &&
    (at(r) || Date.now()) >= floor
  );
  if (!pings.length) return;

  const latest = Math.max(...pings.map(at));
  const withText = pings
    .filter((r) => r.emoji && r.emoji.trim())
    .sort((a, b) => at(b) - at(a))[0];

  rememberPings(pings.map((r) => r.id));
  await notify('A quiet reminder', withText?.emoji?.slice(0, 140) || 'The app has a moment for you.', `ping-${latest || withText?.id || 'now'}`);
}

async function deliverNudges() { await deliverPings(); }

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
  stopCompass();
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
    ['period', 'Period', 'Excused — not counted', 'var(--pink)'],
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
      <button class="sheet-opt" data-act="toggle-mosque" data-key="${key}">
        <span class="sw" style="background:var(--gold)"></span>
        <span class="lbl">Prayed at the mosque<span class="sub">Counts for the streak even if late</span></span>
        <span class="switch" role="switch" aria-checked="${!!rec?.mosque}"></span>
      </button>
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

function sheetStartDate() {
  const tomorrow = dayKey(addDays(new Date(), 1));
  openSheet(`
    <div class="grip"></div>
    <h3>Counting from</h3>
    <p class="sheet-sub">Days before this date are left out of your averages and the graph. Change it any time.</p>
    <button class="sheet-opt" data-act="start-tomorrow" data-day="${tomorrow}" data-active="${statsStart() === tomorrow}">
      <span class="sw" style="background:var(--ok)"></span>
      <span class="lbl">Start tomorrow<span class="sub">${parseDay(tomorrow).toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' })}</span></span>
      ${statsStart() === tomorrow ? '✓' : ''}
    </button>
    <form data-form="save-start" style="margin-top:14px">
      <div class="label">Or pick a date</div>
      <input class="line" type="date" name="start" value="${statsStart()}">
      <button class="btn primary wide" type="submit" style="margin-top:10px">Save</button>
    </form>
  `);
}

function sheetSource() {
  const isCluj = S.settings.preset === 'cluj';
  openSheet(`
    <div class="grip"></div>
    <h3>Prayer times</h3>
    <p class="sheet-sub">Where the five times come from.</p>
    <div class="sheet-list">
      <button class="sheet-opt" data-act="pick-preset" data-preset="cluj" ${isCluj ? 'data-active="true"' : ''}>
        <span class="sw" style="background:var(--ok)"></span>
        <span class="lbl">Masjid Cluj-Napoca<span class="sub">Mawaqit timetable — the mosque's own times</span></span>
        ${isCluj ? '✓' : ''}
      </button>
      <button class="sheet-opt" data-act="pick-preset" data-preset="" ${!isCluj ? 'data-active="true"' : ''}>
        <span class="sw" style="background:var(--a)"></span>
        <span class="lbl">Calculated from my location<span class="sub">${esc(S.settings.place)} · ${METHODS[S.settings.method]?.label || ''}</span></span>
        ${!isCluj ? '✓' : ''}
      </button>
    </div>
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

function prayerNotifLine() {
  const n = S.settings.notif || {};
  const prefs = n.prayers || {};
  const on = PRAYER_ORDER.filter((k) => prefs[k] !== false).length;
  return `${on} of 5 on · messages too`;
}

function sheetPrayerNotifs() {
  const n = S.settings.notif || {};
  const prefs = n.prayers || {};
  const t = times(dayKey());
  const perm = 'Notification' in window ? Notification.permission : 'unsupported';

  let last = null;
  try { last = JSON.parse(localStorage.getItem('na:lastNotif') || 'null'); } catch { /* ignore */ }
  const minutesAgo = last?.at ? Math.max(1, Math.round((Date.now() - last.at) / 60000)) : null;
  const ago = minutesAgo == null ? 'earlier' : minutesAgo < 60 ? `${minutesAgo} min ago` : minutesAgo < 1440 ? `${Math.round(minutesAgo / 60)} h ago` : `${Math.round(minutesAgo / 1440)} d ago`;
  const lastLine = last
    ? `${last.result === 'sent' ? 'Delivered' : last.result === 'blocked' ? 'Shown in the app' : 'Could not show'} · ${ago}`
    : 'Nothing sent yet';
  const stateText = perm === 'granted'
    ? 'Notifications allowed'
    : perm === 'denied'
      ? 'Blocked in the browser'
      : perm === 'unsupported' ? 'Not supported here' : 'Not allowed yet';

  openSheet(`
    <div class="grip"></div>
    <h3>Notifications</h3>
    <p class="sheet-sub">One permission covers prayer reminders and quiet messages between the two of you.</p>

    <div class="notif-state ${perm}">
      <span class="dot"></span>
      <span class="txt">${stateText}<span class="sub">${lastLine}</span></span>
    </div>
    ${perm === 'default' ? `<button class="btn primary wide" style="margin-bottom:14px" data-act="ask-notif">Allow notifications</button>` : ''}
    ${perm === 'denied' ? `<p class="q-note" style="margin:0 0 14px">You dismissed the permission before. Re-allow notifications for this site in your browser settings, then reopen the app.</p>` : ''}

    <div class="sheet-list">
      ${PRAYER_ORDER.map((k) => `
        <button class="sheet-opt" data-act="toggle-prayer-notif" data-key="${k}">
          <span class="lbl">${PMETA[k].name}<span class="sub">${fmtTime(t[k])} – ${fmtTime(t.onTimeEnd[k])}</span></span>
          <span class="switch" role="switch" aria-checked="${prefs[k] !== false}"></span>
        </button>`).join('')}
      <button class="sheet-opt" data-act="toggle-urgency">
        <span class="lbl">Urgent warning<span class="sub">If it's still unlogged near the end</span></span>
        <span class="switch" role="switch" aria-checked="${n.urgency !== false}"></span>
      </button>
      <button class="sheet-opt" data-act="lead-cycle">
        <span class="lbl">Warn me before<span class="sub">Minutes before the window closes</span></span>
        <span class="v" style="font-size:13px;color:var(--ink-3)">${n.lead || 20} min</span>
      </button>
      <button class="sheet-opt" data-act="test-notif">
        <span class="lbl">Send a test notification<span class="sub">Isha · the urgent style, right now</span></span>
        <span class="v" style="font-size:13px;color:var(--pink);font-weight:600">Send</span>
      </button>
    </div>
    <p class="q-note">Alerts arrive while N&amp;A is open. If it's closed, your next reminder waits and appears when you return.</p>
  `);
}

function syncLine() {  if (!sync.isOn()) return 'Share prayers and daily reviews live';
  const s = S.syncState;
  if (s === 'gone') return 'Fresh start — reset this phone';
  if (s === 'error') return 'Offline — will retry';
  if (s === 'syncing') return 'Syncing…';
  if (s === 'live') return 'Synced · just now';
  return 'Connected';
}

function sheetConfirm(title, body, label, action) {  openSheet(`
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
  prayer: viewPrayer,
  review: viewReview,
  settings: viewSettings,
};

function pickScore(button) {
  const control = button.closest('[data-score-control]');
  if (!control) return;
  const value = Number(button.dataset.score);
  control.querySelector('input[type="hidden"]').value = value;
  control.style.setProperty('--score', value);
  control.querySelector('.score-value').textContent = value;
  control.querySelector('.score-description').textContent = scoreDescription(value, control.dataset.scoreControl);
  for (const option of control.querySelectorAll('[data-act="score-pick"]')) {
    const number = Number(option.dataset.score);
    option.setAttribute('aria-checked', String(number === value));
    option.tabIndex = number === value ? 0 : -1;
    option.classList.toggle('filled', number <= value);
  }
}

const ACTIONS = {
  tab: (el) => go(el.dataset.view),
  'score-pick': (el) => pickScore(el),
  'trend-person': (el) => {
    S.trendMember = el.dataset.person === 'partner' ? 'partner' : 'mine';
    refresh();
  },
  'recap-person': (el) => {
    S.recapMember = el.dataset.person === 'partner' ? 'partner' : 'mine';
    refresh();
  },
  'recap-week': (el) => {
    S.recapWeek = Number(el.dataset.index);
    refresh();
  },
  'streak-day': (el) => {
    S.historyDay = el.dataset.day;
    if (S.view === 'review') refresh();
    else go('review');
    requestAnimationFrame(() => document.querySelector('.day-history')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  },
  'history-prev': () => {
    const current = S.historyDay || dayKey();
    S.historyDay = dayKey(addDays(parseDay(current), -1));
    refresh();
  },
  'history-next': () => {
    const current = S.historyDay || dayKey();
    S.historyDay = dayKey(addDays(parseDay(current), 1));
    refresh();
  },
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

  'toggle-mosque': async (el) => {
    const who = actor();
    const key = el.dataset.key;
    const day = dayKey();
    const rec = getPrayer(who.id, day, key);
    const on = !rec?.mosque;
    await patchPrayer(who.id, day, key, { mosque: on, status: on && !rec ? 'ontime' : rec?.status || 'ontime' });
    el.querySelector('.switch')?.setAttribute('aria-checked', String(on));
    haptic(8);
    S.justLogged = key;
    refresh();
    setTimeout(() => { S.justLogged = null; }, 900);
  },

  'toggle-cycle': async () => {
    const who = actor();
    const on = await toggleCycleDay(who.id, dayKey());
    haptic(on ? 12 : 6);
    refresh();
    toast(on ? 'Excused today — prayers not counted' : 'Back to counting');
  },

  'toggle-cycle-sheet': async () => {
    const who = actor();
    const on = await toggleCycleDay(who.id, dayKey());
    haptic(on ? 12 : 6);
    closeSheet();
    refresh();
    toast(on ? 'Excused today — prayers not counted' : 'Back to counting');
  },

  'clear-status': async (el) => {    const who = actor();
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

  qibla: () => sheetQibla(),

  nudge: () => sheetPing(),
  'send-ping': () => sheetPing(),
  reminders: () => sheetReminders(),

  'ping-phrase': (el) => {
    const sheet = document.querySelector('.sheet');
    const area = sheet?.querySelector('textarea[name="message"]');
    if (area) {
      area.value = el.dataset.text;
      area.dispatchEvent(new Event('input', { bubbles: true }));
      area.focus();
    }
  },

  'prayer-notifs': () => sheetPrayerNotifs(),

  'toggle-prayer-notif': async (el) => {
    const key = el.dataset.key;
    const prefs = { ...(S.settings.notif.prayers || {}) };
    const on = prefs[key] === false; // currently off -> turning on
    prefs[key] = on;
    S.settings.notif = { ...S.settings.notif, prayers: prefs };
    await db.put('meta', { key: 'settings', value: S.settings });
    el.querySelector('.switch')?.setAttribute('aria-checked', String(on));
    if (on && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    haptic(6);
  },

  'toggle-urgency': async (el) => {
    const n = { ...S.settings.notif };
    n.urgency = n.urgency === false;
    S.settings.notif = n;
    await db.put('meta', { key: 'settings', value: S.settings });
    el.querySelector('.switch')?.setAttribute('aria-checked', String(n.urgency !== false));
    haptic(6);
  },

  'lead-cycle': async (el) => {
    const steps = [15, 20, 30, 45];
    const cur = S.settings.notif.lead || 20;
    const next = steps[(steps.indexOf(cur) + 1) % steps.length];
    S.settings.notif = { ...S.settings.notif, lead: next };
    await db.put('meta', { key: 'settings', value: S.settings });
    const v = el.querySelector('.v');
    if (v) v.textContent = `${next} min`;
    haptic(6);
  },

  'test-notif': async () => {
    if (!('Notification' in window)) return toast('This browser has no notifications');
    let perm = Notification.permission;
    if (perm === 'default') perm = await Notification.requestPermission();
    if (perm !== 'granted') return toast('Notifications are blocked — allow them in your browser settings');
    haptic(20);
    await notify(
      'Isha ends soon',
      'Still unlogged — pray before the window closes. (test)',
      `test-${Date.now()}`,
      { urgent: true, prayer: 'isha' }
    );
    toast('Sent — check your notification shade');
  },

  'ask-notif': async () => {
    if (!('Notification' in window)) return toast('This browser has no notifications');
    const res = await Notification.requestPermission();
    closeSheet();
    setTimeout(() => sheetPrayerNotifs(), 300);
    toast(res === 'granted' ? 'Notifications allowed' : 'Not allowed');
  },

  'qibla-permission': async () => {
    try {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res === 'granted') {
        toast('Compass on');
        document.querySelector('#qPerm')?.setAttribute('hidden', '');
      } else {
        toast('Compass permission denied');
      }
    } catch {
      toast('Compass unavailable on this device');
    }
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
  source: () => sheetSource(),
  'pick-preset': async (el) => {
    const preset = el.dataset.preset || null;
    S.settings.preset = preset;
    if (preset === 'cluj') {
      S.settings.place = 'Cluj-Napoca';
      S.settings.lat = 46.7612026;
      S.settings.lng = 23.5781945;
    }
    timeCache.clear();
    await db.put('meta', { key: 'settings', value: S.settings });
    closeSheet();
    refresh();
    toast(preset === 'cluj' ? 'Times from Masjid Cluj-Napoca' : 'Times calculated from location');
  },
  location: () => sheetLocation(),
  'start-date': () => sheetStartDate(),

  'start-tomorrow': async (el) => {
    const day = el.dataset.day;
    S.settings.startDate = day;
    await db.put('meta', { key: 'settings', value: S.settings });
    closeSheet();
    refresh();
    toast(`Counting from ${parseDay(day).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long' })}`);
  },
  'times-today': () => sheetTimes(),

  theme: async (el) => {
    S.settings.theme = el.dataset.theme;
    await db.put('meta', { key: 'settings', value: S.settings });
    applyTheme();
    document.querySelectorAll('[data-act="theme"]').forEach((b) => {
      b.setAttribute('aria-selected', String(b.dataset.theme === S.settings.theme));
    });
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
  'check-updates': async () => {
    toast('Forcing the newest build…');
    try {
      const reg = await navigator.serviceWorker?.getRegistration();
      await reg?.update();
    } catch { /* ignore */ }
    setTimeout(() => {
      const url = new URL(location.href);
      url.searchParams.set('fresh', String(Date.now()));
      location.replace(url.toString());
    }, 700);
  },
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
    toast('Colour updated');
  },
  'pick-avatar': async (el) => {
    const m = memberById(el.dataset.id);
    if (!m) return;
    m.avatar = el.dataset.avatar;
    await db.put('members', m);
    closeSheet();
    refresh();
    toast('Avatar updated');
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
  if (!range.matches('input[type="range"]')) return;
  range.style.setProperty('--p', range.value * 10);
  const val = range.closest('.slider')?.querySelector('.val');
  if (val) val.textContent = range.value;
});

document.addEventListener('change', (e) => {
  if (e.target.id !== 'history-day') return;
  const { min, max, value } = e.target;
  if (value >= min && value <= max) S.historyDay = value;
  refresh();
});

document.addEventListener('keydown', (e) => {
  const option = e.target.closest('[data-act="score-pick"]');
  if (!option) return;
  const delta = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 };
  if (!(e.key in delta) && e.key !== 'Home' && e.key !== 'End') return;
  e.preventDefault();
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? 10 : clamp(Number(option.dataset.score) + delta[e.key], 0, 10);
  const target = option.closest('.score-choices').querySelector(`[data-score="${next}"]`);
  pickScore(target);
  target.focus();
});

document.addEventListener('submit', async (e) => {
  const form = e.target.closest('[data-form]');
  if (!form) return;
  e.preventDefault();
  const kind = form.dataset.form;
  const data = Object.fromEntries(new FormData(form).entries());


  if (kind === 'save-review') {
    const who = actor();
    const day = dayKey();
    const existing = reviewFor(who.id, day);
    const rec = {
      ...existing,
      id: existing?.id || `${who.id}|${day}`,
      memberId: who.id,
      day,
      productivity: clamp(Number(data.productivity), 0, 10),
      happiness: clamp(Number(data.happiness), 0, 10),
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

  if (kind === 'save-name') {
    const m = memberById(form.dataset.id);
    if (!m) return;
    m.name = String(data.name || '').trim() || m.name;
    await db.put('members', m);
    closeSheet();
    refresh();
    return;
  }

  if (kind === 'save-start') {
    const v = String(data.start || '').trim();
    if (!v) return;
    S.settings.startDate = v;
    await db.put('meta', { key: 'settings', value: S.settings });
    closeSheet();
    refresh();
    toast(`Counting from ${v}`);
    return;
  }

  if (kind === 'send-ping') {
    const message = String(data.message || '').trim();
    if (!message) return toast('Write something first');
    closeSheet();
    await sendNudge(message);
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

        if (data && data.type === 'NA_LOG' && data.prayer) {
          setTimeout(() => {
            if (S.members.length) { go('prayer'); setTimeout(() => sheetStatus(data.prayer), 350); }
          }, 200);
          return;
        }

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
async function main() {
  // ?fresh — drop every cached copy of the *code*, keep every byte of data.
  if (new URLSearchParams(location.search).has('fresh')) {
    try {
      for (const reg of await navigator.serviceWorker.getRegistrations()) await reg.unregister();
      for (const key of await caches.keys()) await caches.delete(key);
    } catch { /* ignore */ }
    history.replaceState(null, '', location.pathname + location.hash);
  }

  if ('serviceWorker' in navigator && location.protocol !== 'file:') registerSW();
  await boot();
}

main();
