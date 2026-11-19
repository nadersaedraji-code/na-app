/* ============================================================
   Halal Couple — a little world inside N&A.
   Questions, games, memories, moods, notes and keepsakes.
   Original content only. Everything belongs to the two of you.
   ============================================================ */

import {
  JOY_CATEGORIES, DAILY_BY_CAT, DAILY_QUESTIONS, dailyQuestionFor,
  GAME_META, GAME_DECKS, MOODS, MILESTONES, WIDGETS,
} from './joy-content.js';
import { WORLD_PATH, WORLD_W, WORLD_H, project } from './joy-map.js';

const DEFAULTS = {
  anniversary: '',
  cover: 'preset:rose',
  dailyTime: '20:30',
  notify: true,
  freezeMonth: '',
};

const COVER_GRADIENTS = {
  'preset:rose': 'linear-gradient(145deg,#3F0F22 0%,#8F2748 46%,#E08A6A 100%)',
  'preset:sage': 'linear-gradient(145deg,#172E24 0%,#3D6B4F 52%,#B6C99A 100%)',
  'preset:amber': 'linear-gradient(145deg,#3C2111 0%,#9A5A2B 52%,#E7B678 100%)',
  'preset:plum': 'linear-gradient(145deg,#201024 0%,#5A2A5C 52%,#C28CA9 100%)',
  'preset:midnight': 'linear-gradient(145deg,#0D1420 0%,#243A54 52%,#9AA9B8 100%)',
};

const NOTE_CATS = ['Plans', 'Trips', 'Shopping', 'Du’a list', 'Ideas'];
const EVENT_COLORS = [
  { id: 'rose', value: '#C4476C' },
  { id: 'gold', value: '#B78A3E' },
  { id: 'sage', value: '#4F7A5F' },
  { id: 'plum', value: '#7A4E86' },
  { id: 'sky', value: '#4D7A93' },
  { id: 'clay', value: '#A75E45' },
];
const EVENT_EMOJIS = ['💞', '🎂', '🌙', '🎉', '🕌', '✈️', '🏡', '🌿'];

const SVG = {
  back: '<path d="m15 18-6-6 6-6"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  settings: '<path d="M4 7h5M13 7h7M4 17h9M17 17h3"/><circle cx="11" cy="7" r="2"/><circle cx="15" cy="17" r="2"/>',
  today: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  play: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><path d="m7.8 7.8 2.1 2.1M14.1 14.1l2.1 2.1M7.8 16.2l2.1-2.1M14.1 9.9l2.1-2.1"/><circle cx="12" cy="12" r="3.2"/>',
  journal: '<path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v20H7.5A2.5 2.5 0 0 1 5 19.5Z"/><path d="M5 17.5h14M9 7h6M9 11h4"/>',
  us: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  gift: '<path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7ZM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7Z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  camera: '<path d="M4 7h3l2-3h6l2 3h3v13H4z"/><circle cx="12" cy="13" r="4"/>',
  map: '<path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/>',
  note: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h4M9 12h6M9 16h4"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  flame: '<path d="M12 22c4 0 7-2.8 7-6.8 0-3.4-2.2-5.6-3.7-7.7C14.2 5.9 13.4 4.2 13 2c-1.6 2.3-2.6 4.4-2.6 6.4 0 1.4.5 2.4 1.2 3.3-.8-.2-1.6-.8-2.2-1.6-.7 1.3-1.4 2.7-1.4 4.6C8 19 9.8 22 12 22Z"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  share: '<path d="M12 16V3M7 8l5-5 5 5"/><path d="M5 13v7h14v-7"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/>',
  edit: '<path d="M12 20h9"/><path d="M16.6 3.4a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  spark: '<path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8Z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8Z"/>',
  chat: '<path d="M21 12a8 8 0 0 1-8 8H6l-3 2 1-4a8 8 0 1 1 17-6Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/>',
  wave: '<path d="M4 12c2 0 2-6 4-6s2 12 4 12 2-12 4-12 2 6 4 6"/>',
  pin: '<path d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/>',
};

const icon = (name, size = 20) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SVG[name] || ''}</svg>`;

export function createJoy(ctx) {
  const {
    S, db, me, other, esc, dayKey, addDays, parseDay, uid, haptic,
    toast, openSheet, closeSheet, notify, refresh, go, sendNudge, sync,
  } = ctx;

  const J = {
    tab: 'today',
    journalTab: 'memories',
    calendarMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    selectedDay: dayKey(),
    mapFilter: '',
    cityFilter: '',
    memoryDraft: null,
    noteDraft: null,
    eventDraft: null,
    game: null,
    stageOpen: false,
    stageTimer: null,
    counterTimer: null,
    chatTimer: null,
    doodle: null,
    draftStory: '',
    draftPhotos: [],
    placeResults: [],
    placeTimer: null,
    dirty: false,
    notifyStart: false,
    settingsOpen: false,
  };

  const who = () => me();
  const partner = () => {
    const m = who();
    return m ? other(m) : null;
  };
  const all = () => S.joy || [];
  const rows = (kind) => all().filter((r) => r.kind === kind);
  const member = (id) => S.members.find((m) => m.id === id) || null;
  const nameOf = (id) => member(id)?.name || 'them';
  const avatarOf = (id) => member(id)?.avatar || '🤍';
  const colorOf = (id) => member(id)?.color || 'var(--joy-rose)';
  const catOf = (id) => JOY_CATEGORIES.find((c) => c.id === id) || JOY_CATEGORIES[0];
  const today = () => dayKey();

  /* ------------------------------------------------------------
     Data
     ------------------------------------------------------------ */
  const settingsRow = () => all().find((r) => r.kind === 'settings' && r.id === 'settings|couple');
  const joySettings = () => ({ ...DEFAULTS, ...(settingsRow()?.payload || {}) });

  async function upsert(row) {
    row.updatedAt = Date.now();
    const i = all().findIndex((r) => r.id === row.id);
    if (i >= 0) S.joy[i] = row;
    else S.joy.push(row);
    J.dirty = true;
    await db.put('joy', row);
  }

  async function remove(id) {
    S.joy = all().filter((r) => r.id !== id);
    J.dirty = true;
    await db.del('joy', id);
  }

  async function saveSettings(patch) {
    const next = { ...joySettings(), ...patch };
    await upsert({ id: 'settings|couple', kind: 'settings', payload: next });
    return next;
  }

  const answerFor = (memberId, day) =>
    all().find((r) => r.kind === 'answer' && r.memberId === memberId && r.day === day) || null;

  const moodFor = (memberId, day) =>
    all().find((r) => r.kind === 'mood' && r.memberId === memberId && r.day === day) || null;

  const prefFor = (memberId, itemId) =>
    all().find((r) => r.kind === 'pref' && r.memberId === memberId && r.payload?.itemId === itemId) || null;

  const placeFor = (memberId) => {
    const row = all().find((r) => r.kind === 'place' && r.id === `place|${memberId}`);
    return row?.payload || { place: S.settings.place || '', lat: S.settings.lat, lng: S.settings.lng };
  };

  const frozen = (day) => all().some((r) => r.kind === 'freeze' && r.day === day);
  const bothAnswered = (day) => {
    const p = partner();
    return !!(p && answerFor(who()?.id, day) && answerFor(p.id, day));
  };

  function joyStreak() {
    const p = partner();
    const m = who();
    if (!p || !m) return { current: 0, best: 0, today: false, freezeAvailable: false };
    const good = new Set();
    for (const r of all()) {
      if (r.kind === 'freeze' && r.day) good.add(r.day);
    }
    for (const r of all()) {
      if (r.kind !== 'answer' || !r.day) continue;
      if (answerFor(m.id, r.day) && answerFor(p.id, r.day)) good.add(r.day);
    }
    const t = today();
    let cursor = parseDay(t);
    if (!good.has(t)) cursor = addDays(cursor, -1);
    let current = 0;
    while (good.has(dayKey(cursor)) && current < 3650) {
      current++;
      cursor = addDays(cursor, -1);
    }
    let best = 0;
    let run = 0;
    const first = [...good].sort()[0];
    if (first) {
      for (let d = parseDay(first); dayKey(d) <= t; d = addDays(d, 1)) {
        if (good.has(dayKey(d))) {
          run++;
          if (run > best) best = run;
        } else {
          run = 0;
        }
      }
    }
    return {
      current,
      best: Math.max(best, current),
      today: good.has(t),
      freezeAvailable: joySettings().freezeMonth !== t.slice(0, 7),
    };
  }

  function gameAnswerFor(sessionId, memberId, index) {
    return all().find((r) => r.kind === 'gameAnswer' && r.memberId === memberId && r.payload?.sessionId === sessionId && r.payload?.index === index) || null;
  }

  function sessionMeta(session) {
    const game = session?.payload?.game;
    if (game === 'topic') {
      const c = catOf(session.payload.category);
      return { ...GAME_META.deep, title: c.name, emoji: c.emoji, tint: c.tint, ink: c.ink, format: 'mixed', short: c.sub };
    }
    return GAME_META[game] || GAME_META.deep;
  }

  function contentItem(session, id) {
    const game = session?.payload?.game;
    if (game === 'topic') return DAILY_QUESTIONS.find((q) => q.id === id) || null;
    return (GAME_DECKS[game] || []).find((q) => q.id === id) || null;
  }

  function sessionDeck(session) {
    return (session?.payload?.deck || []).map((id) => contentItem(session, id)).filter(Boolean);
  }

  function questionPreview(item) {
    if (!item) return '';
    if (item.a?.text && item.b?.text) return `${item.a.text} or ${item.b.text}`;
    return item.prompt || '';
  }

  function sessionProgress(session, memberId) {
    const deck = sessionDeck(session);
    let done = 0;
    deck.forEach((q, i) => {
      if (gameAnswerFor(session.id, memberId, i)) done++;
    });
    return { done, total: deck.length };
  }

  function sessionComplete(session) {
    const p = partner();
    const m = who();
    if (!p || !m) return false;
    return sessionProgress(session, m.id).done >= sessionDeck(session).length
      && sessionProgress(session, p.id).done >= sessionDeck(session).length;
  }

  function answerLabels(session, item, answer) {
    if (!answer) return { mine: '—', theirs: '—' };
    if (answer.skipped) return { mine: 'Skipped', theirs: 'Skipped' };
    const game = session.payload.game;
    if (game === 'wml') return { mine: nameOf(answer.person), theirs: nameOf(answer.person) };
    if (game === 'nhie') return { mine: answer.choice === 0 ? 'I have' : 'I haven’t', theirs: answer.choice === 0 ? 'I have' : 'I haven’t' };
    if (game === 'wyr' || game === 'thisthat') {
      return { mine: answer.choice === 0 ? item.a?.text : item.b?.text, theirs: answer.choice === 0 ? item.a?.text : item.b?.text };
    }
    if (game === 'quiz' || (game === 'topic' && item.type === 'choice')) {
      return { mine: item.options?.[answer.choice] ?? '—', theirs: item.options?.[answer.choice] ?? '—' };
    }
    if (game === 'photo') return { mine: answer.photo ? 'A photo' : '—', theirs: answer.photo ? 'A photo' : '—' };
    return { mine: answer.text || '—', theirs: answer.text || '—' };
  }

  function sessionScore(session) {
    const deck = sessionDeck(session);
    const p = partner();
    const m = who();
    if (!p || !m) return { score: null, matches: 0, compared: 0, shared: 0 };
    let matches = 0;
    let compared = 0;
    let shared = 0;
    deck.forEach((item, i) => {
      const a = gameAnswerFor(session.id, m.id, i)?.payload;
      const b = gameAnswerFor(session.id, p.id, i)?.payload;
      if (!a || !b || a.skipped || b.skipped) return;
      const game = session.payload.game;
      if (['wyr', 'thisthat', 'nhie', 'quiz'].includes(game) || (game === 'topic' && item.type === 'choice')) {
        compared++;
        if (a.choice === b.choice) matches++;
      } else if (game === 'wml') {
        compared++;
        if (a.person === b.person) matches++;
      } else {
        shared++;
      }
    });
    return { score: compared ? Math.round((matches / compared) * 100) : null, matches, compared, shared };
  }

  function joyStats() {
    const answers = rows('answer').length + rows('gameAnswer').filter((r) => !r.payload?.skipped).length;
    const games = rows('game').filter((s) => sessionComplete(s)).length;
    const memories = rows('memory').length;
    const notes = rows('note').length;
    const moods = new Set(rows('mood').filter((r) => r.memberId === who()?.id).map((r) => r.day)).size;
    const places = new Set(rows('memory').map((m) => (m.payload?.place || '').split(',')[0].trim()).filter(Boolean)).size;
    const countries = new Set(rows('memory').map((m) => m.payload?.country).filter(Boolean)).size;
    const streak = joyStreak();
    return { answers, games, memories, notes, moods, places, countries, ...streak, bestStreak: streak.best, currentStreak: streak.current };
  }

  function levelInfo(stats) {
    const best = Number(stats.bestStreak ?? stats.best ?? 0) || 0;
    const xp = (Number(stats.answers) || 0) * 10 + (Number(stats.games) || 0) * 25 + (Number(stats.memories) || 0) * 15 + (Number(stats.notes) || 0) * 5 + best * 4 + (Number(stats.moods) || 0) * 3;
    const level = 1 + Math.floor(Math.sqrt(xp / 60));
    const floorXp = 60 * (level - 1) ** 2;
    const nextXp = 60 * level ** 2;
    const pct = Math.max(0, Math.min(100, Math.round(((xp - floorXp) / Math.max(1, nextXp - floorXp)) * 100)));
    return { xp, level, pct, nextXp };
  }

  function togetherParts(anniv) {
    if (!anniv) return null;
    const start = parseDay(anniv);
    const now = new Date();
    if (now < start) return null;
    let cursor = new Date(start);
    let years = 0;
    let months = 0;
    let days = 0;
    const addY = (d) => { const x = new Date(d); x.setFullYear(x.getFullYear() + 1); return x; };
    const addM = (d) => { const x = new Date(d); x.setMonth(x.getMonth() + 1); return x; };
    while (addY(cursor) <= now) { cursor = addY(cursor); years++; }
    while (addM(cursor) <= now) { cursor = addM(cursor); months++; }
    while (addDays(cursor, 1) <= now) { cursor = addDays(cursor, 1); days++; }
    const ms = now - cursor;
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return { years, months, days, hours, minutes, seconds, totalDays: Math.floor((now - start) / 86400000) };
  }

  function counterUnits(parts) {
    return [
      ['years', parts.years],
      ['months', parts.months],
      ['days', parts.days],
      ['hours', parts.hours],
      ['minutes', parts.minutes],
    ].map(([k, v]) => {
      const label = v === 1 ? k.slice(0, -1) : k;
      return `<div class="joy-unit"><b class="num" data-p="${k}">${v}</b><span data-pl="${k}">${label}</span></div>`;
    }).join('');
  }

  function startCounter() {
    clearInterval(J.counterTimer);
    J.counterTimer = setInterval(() => {
      const el = document.querySelector('[data-joy-counter]');
      if (!el) {
        clearInterval(J.counterTimer);
        J.counterTimer = null;
        return;
      }
      if (document.hidden) return;
      const s = joySettings();
      const parts = togetherParts(s.anniversary);
      if (!parts) return;
      for (const [k, v] of Object.entries(parts)) {
        el.querySelectorAll(`[data-p="${k}"]`).forEach((n) => { n.textContent = v; });
        el.querySelectorAll(`[data-pl="${k}"]`).forEach((n) => { n.textContent = v === 1 ? k.slice(0, -1) : k; });
      }
    }, 1000);
  }

  /* ------------------------------------------------------------
     Small UI helpers
     ------------------------------------------------------------ */
  const prettyDay = (day) => parseDay(day).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const longDay = (day) => parseDay(day).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const shortDay = (day) => parseDay(day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const monthLabel = (d) => d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const daysUntil = (day) => {
    const a = new Date(); a.setHours(0, 0, 0, 0);
    const b = parseDay(day); b.setHours(0, 0, 0, 0);
    return Math.round((b - a) / 86400000);
  };
  const countdownText = (n) => n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : n > 1 ? `in ${n} days` : `${Math.abs(n)} days ago`;
  function relative(ts) {
    if (!ts) return '';
    const m = Math.max(0, Math.floor((Date.now() - ts) / 60000));
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return shortDay(dayKey(new Date(ts)));
  }
  const coverHTML = (cover, cls = '') => {
    if (cover && /^data:image\//.test(cover)) return `<img class="joy-cover ${cls}" src="${esc(cover)}" alt="">`;
    return `<div class="joy-cover joy-cover-preset ${cls}" style="--cover:${COVER_GRADIENTS[cover] || COVER_GRADIENTS['preset:rose']}"></div>`;
  };
  const moodOf = (id) => MOODS.find((m) => m.id === id);
  const nextEventOccurrence = (e) => {
    if (!e?.date) return null;
    let d = parseDay(e.date);
    const now = parseDay(today());
    if (e.repeat === 'yearly') {
      d = new Date(now.getFullYear(), d.getMonth(), d.getDate());
      if (dayKey(d) < today()) d = new Date(now.getFullYear() + 1, d.getMonth(), d.getDate());
    }
    return dayKey(d);
  };
  const upcomingEvents = () => rows('event')
    .map((e) => ({ row: e, next: nextEventOccurrence(e.payload || {}) }))
    .filter((x) => x.next && dayKey(parseDay(x.next)) >= today())
    .sort((a, b) => a.next.localeCompare(b.next));
  const memoryList = () => rows('memory').sort((a, b) => {
    const da = a.payload?.date || '';
    const db = b.payload?.date || '';
    return db.localeCompare(da) || (b.payload?.createdAt || 0) - (a.payload?.createdAt || 0);
  });
  const latestStory = () => rows('story').sort((a, b) => (b.payload?.at || 0) - (a.payload?.at || 0))[0] || null;
  const notesList = () => rows('note').sort((a, b) => (b.payload?.updatedAt || 0) - (a.payload?.updatedAt || 0));
  const sessions = () => rows('game').sort((a, b) => (b.payload?.createdAt || 0) - (a.payload?.createdAt || 0));
  const memoryFor = (id) => all().find((r) => r.kind === 'memory' && r.id === id) || null;

  function connectionNote() {
    if (!partner()) {
      return `<button class="joy-connect" data-act="tab" data-view="settings"><span>Connect the other phone</span><small>Halal Couple needs both of you to bloom.</small></button>`;
    }
    if (!sync.isOn()) {
      return `<button class="joy-connect" data-act="tab" data-view="settings"><span>Sync is off</span><small>This little world is only on this phone for now.</small></button>`;
    }
    return '';
  }

  /* ------------------------------------------------------------
     Header, dock, welcome
     ------------------------------------------------------------ */
  function header() {
    return `<header class="joy-head">
      <button class="joy-round" data-act="joy" data-joy-act="exit" aria-label="Back to N&amp;A">${icon('back')}</button>
      <div class="joy-wordmark" role="heading" aria-level="1"><span class="joy-star" aria-hidden="true">✦</span><span>Halal Couple</span></div>
      <button class="joy-round" data-act="joy" data-joy-act="settings" aria-label="Halal Couple settings">${icon('settings', 18)}</button>
    </header>`;
  }

  function dock(tab) {
    const items = [
      ['today', 'Today', 'today'],
      ['play', 'Play', 'play'],
      ['journal', 'Journal', 'journal'],
      ['us', 'Us', 'us'],
      ['keepsakes', 'Keepsakes', 'gift'],
    ];
    return `<nav class="joy-dock" aria-label="Halal Couple">
      <div class="joy-dock-inner">
        <span class="joy-dock-pill" aria-hidden="true"></span>
        ${items.map(([id, label, ico]) => `<button class="joy-dock-btn" data-act="joy" data-joy-act="tab" data-joy-tab="${id}" ${J.tab === id ? 'aria-current="page"' : ''}>
          ${icon(ico, 20)}<span>${label}</span>
        </button>`).join('')}
      </div>
    </nav>`;
  }

  function positionDock() {
    const inner = document.querySelector('.joy-dock-inner');
    const active = inner?.querySelector('.joy-dock-btn[aria-current="page"]');
    const pill = inner?.querySelector('.joy-dock-pill');
    if (!inner || !active || !pill) return;
    const r = active.getBoundingClientRect();
    const b = inner.getBoundingClientRect();
    pill.style.width = `${r.width}px`;
    pill.style.transform = `translateX(${r.left - b.left}px)`;
    requestAnimationFrame(() => inner.classList.add('ready'));
  }

  function viewWelcome() {
    return `<div class="joy joy-welcome">
      <header class="joy-welcome-top">
        <button class="joy-round" data-act="joy" data-joy-act="exit" aria-label="Back to N&amp;A">${icon('back')}</button>
        <span class="joy-welcome-brand">✦ N&amp;A</span>
        <span style="width:38px"></span>
      </header>
      <section class="joy-welcome-hero">
        <div class="joy-welcome-orbit"><span>✦</span></div>
        <div class="joy-kicker">A little world for two</div>
        <h1>Halal<br>Couple</h1>
        <p>Questions that open you. Games that make you laugh. Memories you can hold. Everything modest, everything yours.</p>
        <button class="joy-btn joy-btn-light" data-act="joy" data-joy-act="begin">Begin</button>
        <div class="joy-welcome-verse">
          <p>“And He placed between you affection and mercy.”</p>
          <span>Qur’an 30:21</span>
        </div>
      </section>
      <div class="joy-welcome-features">
        <div><span>💞</span><b>Questions &amp; games</b><small>Little doorways into each other</small></div>
        <div><span>📸</span><b>Journal &amp; map</b><small>The ordinary days, kept</small></div>
        <div><span>🕯️</span><b>Moods &amp; notes</b><small>How your hearts are, today</small></div>
      </div>
      <p class="joy-welcome-foot">No ads. No paywalls. No explicit content.<br>Only what brings you closer.</p>
    </div>`;
  }

  /* ------------------------------------------------------------
     Today
     ------------------------------------------------------------ */
  function heroCard(s) {
    const p = partner();
    const m = who();
    const parts = s.anniversary ? togetherParts(s.anniversary) : null;
    const stats = joyStats();
    const lvl = levelInfo(stats);
    return `<section class="joy-hero">
      ${coverHTML(s.cover)}
      <div class="joy-hero-shade"></div>
      <div class="joy-hero-arch" aria-hidden="true"></div>
      <div class="joy-hero-inner">
        <div class="joy-hero-top">
          <span class="joy-hero-names">${esc(m?.name || 'you')} <i>&amp;</i> ${esc(p?.name || 'your person')}</span>
          <span class="joy-level">Level ${lvl.level}</span>
        </div>
        <div class="joy-hero-mid" aria-hidden="true">
          ${p ? `<div class="joy-hero-faces"><span class="joy-face" style="--tint:${colorOf(m?.id)}">${avatarOf(m?.id)}</span><span class="joy-face-star">✦</span><span class="joy-face" style="--tint:${colorOf(p?.id)}">${avatarOf(p?.id)}</span></div>` : `<span class="joy-hero-star">✦</span>`}
        </div>
        ${parts ? `
          <div class="joy-hero-kicker">Together for</div>
          <div class="joy-counter" data-joy-counter>${counterUnits(parts)}</div>
          <div class="joy-hero-since">since ${shortDay(s.anniversary)} ${parseDay(s.anniversary).getFullYear()} · ${parts.totalDays} days</div>
        ` : `
          <div class="joy-hero-kicker">Your story</div>
          <h1 class="joy-hero-empty">A little world<br>waiting for its date.</h1>
          <button class="joy-btn joy-btn-light small" data-act="joy" data-joy-act="begin">Set our anniversary</button>
        `}
      </div>
    </section>`;
  }

  function moodCard() {
    const p = partner();
    const m = who();
    if (!m) return '';
    const mine = moodFor(m.id, today());
    const theirs = p ? moodFor(p.id, today()) : null;
    const myMood = mine ? moodOf(mine.payload?.mood) : null;
    const theirMood = theirs ? moodOf(theirs.payload?.mood) : null;
    return `<section class="joy-card joy-mood-card">
      <div class="joy-card-head">
        <div><div class="joy-kicker">How is your heart?</div><h2>${myMood ? myMood.label : 'Check in with yourself'}</h2></div>
        ${p ? `<div class="joy-partner-mood">${theirMood ? `<span>${theirMood.emoji}</span><small>${esc(p.name)} · ${theirMood.label}</small>` : `<span class="joy-mood-empty">·</span><small>${esc(p.name)} · not yet</small>`}</div>` : ''}
      </div>
      <div class="joy-mood-row">
        ${MOODS.map((mood) => `<button class="joy-mood ${mine?.payload?.mood === mood.id ? 'on' : ''}" style="--tint:${mood.tint};--ink:${mood.ink}" data-act="joy" data-joy-act="mood" data-mood="${mood.id}" aria-label="${mood.label}" ${mine?.payload?.mood === mood.id ? 'aria-pressed="true"' : ''}>
          <span>${mood.emoji}</span>
        </button>`).join('')}
      </div>
      <div class="joy-mood-foot">
        <span>${mine ? `You chose <b>${myMood?.label}</b>` : 'A feeling is enough.'}</span>
        ${mine ? `<button class="joy-link" data-act="joy" data-joy-act="mood-note">${mine.payload?.note ? 'Edit your word' : 'Add a word'}</button>` : ''}
      </div>
    </section>`;
  }

  function dailyCard() {
    const day = today();
    const q = dailyQuestionFor(day);
    const c = catOf(DAILY_BY_CAT ? Object.keys(DAILY_BY_CAT).find((k) => DAILY_BY_CAT[k].some((x) => x.id === q.id)) : 'relationship');
    const m = who();
    const p = partner();
    const mine = m ? answerFor(m.id, day) : null;
    const theirs = p ? answerFor(p.id, day) : null;
    let kicker = 'Today’s question';
    let meta = c.name;
    let button = 'Answer today';
    let status = 'One question, answered separately, then revealed.';
    if (mine && theirs) {
      kicker = 'You both answered';
      const same = mine.payload?.choice != null && theirs.payload?.choice != null && mine.payload.choice === theirs.payload.choice;
      button = 'See your answers';
      status = mine.payload?.choice != null ? (same ? 'Same heart. Same little choice.' : 'Two answers. One conversation.') : 'Two answers, waiting for you to read them.';
    } else if (mine) {
      kicker = 'Your answer is in';
      button = 'Waiting for ' + (p?.name || 'them');
      status = 'It will reveal itself when they answer.';
    }
    return `<section class="joy-daily" style="--tint:${c.tint};--ink:${c.ink}">
      <div class="joy-daily-top"><span class="joy-pill">${c.emoji} ${kicker}</span><span class="joy-daily-cat">${meta}</span></div>
      <h2>${esc(q.prompt)}</h2>
      <p>${status}</p>
      <button class="joy-btn" data-act="joy" data-joy-act="daily">${button}</button>
      <div class="joy-daily-streak">${mine ? '🌱 Your answer is saved.' : '🌱 A small question. A softer day.'}</div>
    </section>`;
  }

  function streakCard() {
    const s = joyStreak();
    const p = partner();
    const days = [];
    for (let i = 6; i >= 0; i--) days.push(dayKey(addDays(new Date(), -i)));
    return `<section class="joy-card joy-streak">
      <div class="joy-card-head">
        <div class="joy-streak-figure"><span class="joy-flame">${icon('flame', 20)}</span><b class="num">${s.current}</b><span>day streak</span></div>
        <button class="joy-link" data-act="joy" data-joy-act="streak">See the days</button>
      </div>
      <div class="joy-week">
        ${days.map((d) => {
          const good = bothAnswered(d) || frozen(d);
          const isToday = d === today();
          return `<div class="joy-week-day ${good ? 'good' : ''} ${isToday ? 'today' : ''}"><span>${parseDay(d).toLocaleDateString('en-GB', { weekday: 'narrow' })}</span><i></i></div>`;
        }).join('')}
      </div>
      <div class="joy-streak-foot">
        <span>${p ? (bothAnswered(today()) ? `You both answered today · +1` : `${esc(p.name)} ${answerFor(p.id, today()) ? 'has answered' : 'hasn’t answered yet'}`) : 'Connect the other phone to share this streak.'}</span>
        ${s.freezeAvailable && s.current > 0 && !bothAnswered(today()) ? `<button class="joy-link" data-act="joy" data-joy-act="freeze">Use this month’s freeze</button>` : ''}
      </div>
    </section>`;
  }

  function eventsCard() {
    const events = upcomingEvents().slice(0, 4);
    return `<section class="joy-events">
      <div class="joy-section-head"><h2>Coming up</h2><button class="joy-link" data-act="joy" data-joy-act="event-new">Add a day</button></div>
      ${events.length ? `<div class="joy-event-row">${events.map(({ row, next }) => {
        const e = row.payload || {};
        const n = daysUntil(next);
        return `<button class="joy-event" data-act="joy" data-joy-act="event-edit" data-id="${row.id}" style="--dot:${e.color || '#C4476C'}">
          <span class="joy-event-date"><b>${parseDay(next).getDate()}</b><span>${parseDay(next).toLocaleDateString('en-GB', { month: 'short' })}</span></span>
          <span class="joy-event-body"><span class="joy-event-title"><i>${e.emoji || '💞'}</i><b>${esc(e.title || 'A day')}</b></span><small>${countdownText(n)}</small></span>
        </button>`;
      }).join('')}</div>` : `<div class="joy-empty-slim"><span>📅</span><div><b>No dates yet.</b><small>An anniversary, a birthday, a reunion — give the future a little shape.</small></div><button class="joy-link" data-act="joy" data-joy-act="event-new">Add</button></div>`}
    </section>`;
  }

  function storyCard() {
    const s = latestStory();
    const p = partner();
    return `<section class="joy-card joy-story ${s ? 'has' : ''}">
      <div class="joy-card-head"><div><div class="joy-kicker">A little note</div><h2>${s ? (s.memberId === who()?.id ? 'A note you left' : `From ${esc(nameOf(s.memberId))}`) : 'Leave something soft'}</h2></div><button class="joy-icon-btn" data-act="joy" data-joy-act="story-new" aria-label="Write a note">${icon('plus', 17)}</button></div>
      ${s ? `<div class="joy-story-body">
        ${s.payload?.drawing ? `<img class="joy-story-drawing" src="${esc(s.payload.drawing)}" alt="">` : ''}
        ${s.payload?.text ? `<p>${esc(s.payload.text)}</p>` : ''}
        <span>${esc(nameOf(s.memberId))} · ${relative(s.payload?.at)}</span>
      </div>` : `<p class="joy-soft">A thought, a line, a doodle. It will be waiting on their little home.</p>`}
    </section>`;
  }

  function memoryCard() {
    const m = memoryList()[0];
    return `<section class="joy-card joy-memory-card">
      <div class="joy-card-head"><div><div class="joy-kicker">Memory of the day</div><h2>${m ? esc(m.payload?.title || 'A day to keep') : 'Your first memory'}</h2></div><button class="joy-link" data-act="joy" data-joy-act="memory-new">${m ? 'New' : 'Add'}</button></div>
      ${m ? `<button class="joy-memory-preview" data-act="joy" data-joy-act="memory-view" data-id="${m.id}">
        ${m.payload?.photos?.[0] ? `<img src="${esc(m.payload.photos[0])}" alt="">` : `<div class="joy-memory-placeholder">${m.payload?.emoji || '📸'}</div>`}
        <span><b>${esc(m.payload?.place || 'Somewhere in our story')}</b><small>${shortDay(m.payload?.date || today())} · ${esc(m.payload?.body || 'A little piece of us.').slice(0, 72)}</small></span>
      </button>` : `<p class="joy-soft">The first photograph, the first place, the first ordinary day you want to keep.</p>`}
    </section>`;
  }

  function quickGames() {
    const list = ['wyr', 'wml', 'deep', 'photo'];
    return `<section class="joy-quick">
      <div class="joy-section-head"><h2>Play a little</h2><button class="joy-link" data-act="joy" data-joy-act="tab" data-joy-tab="play">All games</button></div>
      <div class="joy-quick-row">
        ${list.map((id) => {
          const g = GAME_META[id];
          return `<button class="joy-quick-card" data-act="joy" data-joy-act="game-new" data-game="${id}" style="--tint:${g.tint};--ink:${g.ink}">
            <span>${g.emoji}</span><b>${g.title}</b><small>${g.short}</small>
          </button>`;
        }).join('')}
      </div>
    </section>`;
  }

  function statsRow() {
    const st = joyStats();
    return `<section class="joy-stats-row">
      <div><b class="num">${st.answers}</b><span>answers</span></div>
      <div><b class="num">${st.memories}</b><span>memories</span></div>
      <div><b class="num">${st.games}</b><span>games</span></div>
      <button class="joy-link" data-act="joy" data-joy-act="tab" data-joy-tab="us">See us</button>
    </section>`;
  }

  function viewToday() {
    const s = joySettings();
    return `${heroCard(s)}
      ${connectionNote()}
      ${moodCard()}
      ${dailyCard()}
      ${streakCard()}
      ${eventsCard()}
      ${storyCard()}
      ${memoryCard()}
      ${quickGames()}
      ${statsRow()}`;
  }

  /* ------------------------------------------------------------
     Play
     ------------------------------------------------------------ */
  function sessionStatus(session) {
    const m = who();
    const p = partner();
    if (!m) return 'yours';
    const mine = sessionProgress(session, m.id);
    const theirs = p ? sessionProgress(session, p.id) : { done: 0, total: mine.total };
    if (mine.total && mine.done >= mine.total && p && theirs.done >= theirs.total) return 'results';
    if (mine.total && mine.done >= mine.total) return 'waiting';
    return 'yours';
  }

  function sessionCard(session) {
    const meta = sessionMeta(session);
    const mine = sessionProgress(session, who()?.id);
    const theirs = partner() ? sessionProgress(session, partner().id) : { done: 0 };
    const status = sessionStatus(session);
    const score = sessionScore(session);
    const deck = sessionDeck(session);
    const next = deck[mine.done];
    const preview = questionPreview(next);
    const title = status === 'yours' && preview ? preview : meta.title;
    const sub = status === 'results'
      ? `${score.score != null ? `${score.score}% overlap` : `${score.shared} shared answers`} · finished`
      : status === 'waiting'
        ? `Waiting for ${esc(nameOf(partner()?.id))}`
        : `${meta.title} · ${mine.done} of ${mine.total} answered`;
    return `<button class="joy-session" data-act="joy" data-joy-act="session" data-id="${session.id}">
      <span class="joy-session-emoji" style="background:${meta.tint}">${meta.emoji}</span>
      <span class="joy-session-copy"><b>${esc(title)}</b><small>${sub}</small></span>
      <span class="joy-session-state">${status === 'results' ? '↗' : status === 'waiting' ? '…' : mine.done ? 'Continue' : 'Play'}</span>
    </button>`;
  }

  function topicCompletion(catId) {
    const qs = DAILY_BY_CAT[catId] || [];
    if (!qs.length) return 0;
    let done = 0;
    for (const q of qs) {
      const dailyMine = all().some((r) => r.kind === 'answer' && r.memberId === who()?.id && r.payload?.questionId === q.id);
      const dailyTheirs = partner() && all().some((r) => r.kind === 'answer' && r.memberId === partner().id && r.payload?.questionId === q.id);
      const gameMine = all().some((r) => r.kind === 'gameAnswer' && r.memberId === who()?.id && r.payload?.questionId === q.id && !r.payload?.skipped);
      const gameTheirs = partner() && all().some((r) => r.kind === 'gameAnswer' && r.memberId === partner().id && r.payload?.questionId === q.id && !r.payload?.skipped);
      if ((dailyMine || gameMine) && (dailyTheirs || gameTheirs)) done++;
    }
    return Math.round((done / qs.length) * 100);
  }

  function viewPlay() {
    const p = partner();
    const list = sessions();
    const yours = list.filter((s) => sessionStatus(s) === 'yours').slice(0, 5);
    const waiting = list.filter((s) => sessionStatus(s) === 'waiting').slice(0, 4);
    const results = list.filter((s) => sessionStatus(s) === 'results').slice(0, 5);
    const games = Object.keys(GAME_META);
    return `<section class="joy-page-head">
      <div class="joy-kicker">A little play</div>
      <h1>Questions &amp; games</h1>
      <p>Everything halal, everything yours. Answer separately, then let the little reveal happen.</p>
    </section>
    ${dailyCard()}
    ${connectionNote()}
    ${yours.length ? `<section class="joy-list-block"><div class="joy-section-head"><h2>Your turn</h2><span>${yours.length}</span></div>${yours.map(sessionCard).join('')}</section>` : ''}
    ${waiting.length ? `<section class="joy-list-block"><div class="joy-section-head"><h2>Waiting for ${esc(p?.name || 'them')}</h2></div>${waiting.map(sessionCard).join('')}</section>` : ''}
    <section class="joy-list-block">
      <div class="joy-section-head"><h2>Choose a game</h2><span>${games.length} ways in</span></div>
      <div class="joy-game-grid">
        ${games.map((id) => {
          const g = GAME_META[id];
          return `<button class="joy-game-card" data-act="joy" data-joy-act="game-new" data-game="${id}" style="--tint:${g.tint};--ink:${g.ink}">
            <span class="joy-game-emoji">${g.emoji}</span>
            <b>${g.title}</b>
            <small>${g.short}</small>
            <span class="joy-game-play">Play →</span>
          </button>`;
        }).join('')}
      </div>
    </section>
    <section class="joy-list-block">
      <div class="joy-section-head"><h2>Topics</h2><span>Deeper by degrees</span></div>
      <div class="joy-topic-grid">
        ${JOY_CATEGORIES.map((c) => {
          const pct = topicCompletion(c.id);
          return `<button class="joy-topic" data-act="joy" data-joy-act="topic" data-cat="${c.id}" style="--tint:${c.tint};--ink:${c.ink}">
            <span class="joy-topic-emoji">${c.emoji}</span>
            <span class="joy-topic-copy"><b>${c.name}</b><small>${pct}% complete</small></span>
            <span class="joy-topic-bar"><i style="width:${pct}%"></i></span>
          </button>`;
        }).join('')}
      </div>
    </section>
    ${results.length ? `<section class="joy-list-block"><div class="joy-section-head"><h2>Finished</h2><span>${results.length}</span></div>${results.map(sessionCard).join('')}</section>` : ''}
    <div class="joy-note-card">🌿 Every question here is yours to answer honestly, and theirs to read with tenderness.</div>`;
  }

  /* ------------------------------------------------------------
     Journal
     ------------------------------------------------------------ */
  function journalTabs() {
    const tabs = [['memories', 'Memories'], ['map', 'Map'], ['days', 'Days'], ['notes', 'Notes']];
    return `<div class="joy-subtabs">${tabs.map(([id, label]) => `<button class="${J.journalTab === id ? 'on' : ''}" data-act="joy" data-joy-act="journal-tab" data-tab="${id}">${label}</button>`).join('')}</div>`;
  }

  function filterChips() {
    const places = [...new Set(memoryList().map((m) => m.payload?.country).filter(Boolean))];
    if (!places.length) return '';
    return `<div class="joy-chips"><button class="joy-chip ${!J.cityFilter ? 'on' : ''}" data-act="joy" data-joy-act="filter" data-filter="">All</button>${places.map((c) => `<button class="joy-chip ${J.cityFilter === c ? 'on' : ''}" data-act="joy" data-joy-act="filter" data-filter="${esc(c)}">${esc(c)}</button>`).join('')}</div>`;
  }

  function filteredMemories() {
    return memoryList().filter((m) => !J.cityFilter || m.payload?.country === J.cityFilter);
  }

  function memoryThumb(m) {
    if (m.payload?.photos?.[0]) return `<img src="${esc(m.payload.photos[0])}" alt="">`;
    return `<span class="joy-memory-placeholder">${m.payload?.emoji || '📸'}</span>`;
  }

  function memoriesView() {
    const list = filteredMemories();
    return `<section class="joy-page-head compact">
      <div class="joy-kicker">Our journal</div>
      <h1>Memories</h1>
      <p>${list.length ? `${list.length} ${list.length === 1 ? 'little piece' : 'little pieces'} of us.` : 'The days you want to keep.'}</p>
    </section>
    <div class="joy-add-row"><button class="joy-btn" data-act="joy" data-joy-act="memory-new">${icon('plus', 17)} Add a memory</button><span>${list.length ? 'Photographs and words' : ''}</span></div>
    ${filterChips()}
    ${list.length ? `<div class="joy-timeline">${list.map((m) => {
      const d = m.payload?.date || dayKey(new Date(m.payload?.createdAt || Date.now()));
      const photo = m.payload?.photos?.[0];
      return `<button class="joy-memory-entry" data-act="joy" data-joy-act="memory-view" data-id="${m.id}">
        <div class="joy-date-badge"><b>${parseDay(d).getDate()}</b><span>${parseDay(d).toLocaleDateString('en-GB', { month: 'short' })}</span><small>${parseDay(d).getFullYear()}</small></div>
        <div class="joy-memory-inner ${photo ? '' : 'no-photo'}">
          ${photo ? `<img src="${esc(photo)}" alt="">` : ''}
          <div class="joy-memory-text">
            <div class="joy-memory-title-row">
              ${photo ? '' : `<span class="joy-memory-emoji" style="--tint:${colorOf(m.memberId)}">${m.payload?.emoji || '📸'}</span>`}
              <b>${esc(m.payload?.title || 'A day to keep')}</b>
            </div>
            <p>${esc(m.payload?.body || '').slice(0, 130)}</p><span>${esc(m.payload?.place || '')}</span>
          </div>
        </div>
      </button>`;
    }).join('')}</div>` : `<div class="joy-empty"><span>📔</span><h2>No pages yet</h2><p>A photograph, a place, a sentence. The first page is the hardest and the sweetest.</p><button class="joy-btn" data-act="joy" data-joy-act="memory-new">Create a memory</button></div>`}`;
  }

  function mapView() {
    const list = filteredMemories().filter((m) => m.payload?.lat != null && m.payload?.lng != null);
    const allMemories = filteredMemories();
    const points = list.map((m) => ({ m, p: project(m.payload.lat, m.payload.lng) }));
    const countries = new Set(allMemories.map((m) => m.payload?.country).filter(Boolean));
    const cities = new Set(allMemories.map((m) => (m.payload?.place || '').split(',')[0].trim()).filter(Boolean));
    const countryLabel = `${countries.size} ${countries.size === 1 ? 'country' : 'countries'}`;
    const cityLabel = `${cities.size} ${cities.size === 1 ? 'place' : 'places'}`;
    const memoryLabel = `${allMemories.length} ${allMemories.length === 1 ? 'memory' : 'memories'}`;
    return `<section class="joy-page-head compact">
      <div class="joy-kicker">Our journal</div>
      <h1>Our map</h1>
      <p>${list.length ? `${countryLabel} · ${cityLabel} · ${memoryLabel}` : 'Put your first memory on the map.'}</p>
    </section>
    <div class="joy-map-card">
      ${list.length ? `<div class="joy-map-pills"><span>${countryLabel}</span><span>${cityLabel}</span></div>` : ''}
      <div class="joy-map">
        <svg class="joy-map-svg" viewBox="0 0 ${WORLD_W} ${WORLD_H}" aria-hidden="true">
          <path class="joy-map-land" d="${WORLD_PATH}" fill-rule="evenodd"></path>
          ${points.length > 1 ? `<polyline class="joy-map-route" points="${points.map(({ p }) => `${p.x},${p.y}`).join(' ')}"></polyline>` : ''}
        </svg>
        ${points.map(({ m, p }) => `<button class="joy-pin" style="left:${(p.x / WORLD_W) * 100}%;top:${(p.y / WORLD_H) * 100}%;--pin:${m.payload?.emoji || '📍'}" data-act="joy" data-joy-act="memory-view" data-id="${m.id}" title="${esc(m.payload?.title || 'Memory')}"><span>${m.payload?.emoji || '📍'}</span></button>`).join('')}
        ${!list.length ? `<div class="joy-map-empty"><span>🗺️</span><p>Add a place to a memory and it will appear here.</p><button class="joy-link" data-act="joy" data-joy-act="memory-new">Add a memory</button></div>` : ''}
      </div>
    </div>
    ${filterChips()}
    ${allMemories.length ? `<div class="joy-map-memories">${allMemories.slice(0, 6).map((m) => `<button class="joy-map-memory" data-act="joy" data-joy-act="memory-view" data-id="${m.id}">${memoryThumb(m)}<span><b>${esc(m.payload?.title || 'Memory')}</b><small>${esc(m.payload?.place || shortDay(m.payload?.date || today()))}</small></span></button>`).join('')}</div>` : `<div class="joy-empty"><span>🗺️</span><h2>Your map is quiet</h2><p>A place is a memory with a name. Add your first.</p></div>`}`;
  }

  function eventOnDay(e, day) {
    const p = e.payload || {};
    if (!p.date) return false;
    if (p.repeat === 'yearly') return p.date.slice(5) === day.slice(5);
    return p.date === day;
  }

  function eventsForDay(day) {
    return rows('event').filter((e) => eventOnDay(e, day)).sort((a, b) => (a.payload?.time || '').localeCompare(b.payload?.time || ''));
  }

  function daysView() {
    const month = J.calendarMonth;
    const y = month.getFullYear();
    const mo = month.getMonth();
    const first = new Date(y, mo, 1);
    const startOffset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(y, mo + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, mo, d));
    while (cells.length % 7) cells.push(null);
    const selected = J.selectedDay || today();
    const selectedEvents = eventsForDay(selected);
    const upcoming = upcomingEvents().slice(0, 5);
    return `<section class="joy-page-head compact">
      <div class="joy-kicker">Our journal</div>
      <h1>Days</h1>
      <p>The dates that make the year feel like yours.</p>
    </section>
    <div class="joy-card joy-calendar">
      <div class="joy-calendar-head"><button class="joy-icon-btn" data-act="joy" data-joy-act="cal-move" data-d="-1">${icon('back', 17)}</button><b>${monthLabel(month)}</b><button class="joy-icon-btn" data-act="joy" data-joy-act="cal-move" data-d="1">${icon('arrow', 17)}</button></div>
      <div class="joy-calendar-grid joy-calendar-labels">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d) => `<span>${d}</span>`).join('')}</div>
      <div class="joy-calendar-grid">${cells.map((d) => {
        if (!d) return '<span></span>';
        const k = dayKey(d);
        const ev = eventsForDay(k).length > 0;
        return `<button class="joy-cal-day ${k === selected ? 'on' : ''} ${k === today() ? 'today' : ''} ${ev ? 'has' : ''}" data-act="joy" data-joy-act="select-day" data-day="${k}"><span>${d.getDate()}</span>${ev ? '<i></i>' : ''}</button>`;
      }).join('')}</div>
    </div>
    <div class="joy-section-head"><h2>${selected === today() ? 'Today' : shortDay(selected)}</h2><button class="joy-link" data-act="joy" data-joy-act="event-new" data-day="${selected}">Add</button></div>
    ${selectedEvents.length ? selectedEvents.map((e) => {
      const p = e.payload || {};
      return `<button class="joy-event-full" data-act="joy" data-joy-act="event-edit" data-id="${e.id}" style="--dot:${p.color || '#C4476C'}"><span>${p.emoji || '💞'}</span><div><b>${esc(p.title || 'A day')}</b><small>${p.time || 'All day'}${p.repeat === 'yearly' ? ' · every year' : ''}</small></div>${icon('arrow', 16)}</button>`;
    }).join('') : `<p class="joy-soft joy-pad">Nothing on this day yet. A birthday, a first, a little plan.</p>`}
    <div class="joy-section-head"><h2>Looking forward</h2></div>
    <div class="joy-upcoming">${upcoming.length ? upcoming.map(({ row, next }) => `<button class="joy-upcoming-row" data-act="joy" data-joy-act="event-edit" data-id="${row.id}"><span>${row.payload?.emoji || '💞'}</span><div><b>${esc(row.payload?.title || 'A day')}</b><small>${longDay(next)}</small></div><em>${countdownText(daysUntil(next))}</em></button>`).join('') : `<div class="joy-empty-slim"><span>📅</span><div><b>No dates yet.</b><small>Add the ones you never want to forget.</small></div><button class="joy-link" data-act="joy" data-joy-act="event-new">Add</button></div>`}</div>`;
  }

  function notesView() {
    const list = notesList();
    return `<section class="joy-page-head compact">
      <div class="joy-kicker">Our journal</div>
      <h1>Shared notes</h1>
      <p>One place for the plans, the lists, the little promises.</p>
    </section>
    <div class="joy-add-row"><button class="joy-btn" data-act="joy" data-joy-act="note-new">${icon('plus', 17)} New note</button><span>${list.length ? `${list.length} ${list.length === 1 ? 'note' : 'notes'}` : ''}</span></div>
    ${list.length ? `<div class="joy-notes">${list.map((n) => {
      const items = n.payload?.items || [];
      const done = items.filter((i) => i.done).length;
      return `<div class="joy-note" data-id="${n.id}">
        <div class="joy-note-head"><span class="joy-note-cat">${esc(n.payload?.category || 'Plans')}</span><button class="joy-icon-btn" data-act="joy" data-joy-act="note-edit" data-id="${n.id}" aria-label="Edit note">${icon('edit', 16)}</button></div>
        <button class="joy-note-title" data-act="joy" data-joy-act="note-edit" data-id="${n.id}">${esc(n.payload?.title || 'Untitled note')}</button>
        ${items.length ? `<div class="joy-note-items">${items.map((it) => `<button class="joy-check ${it.done ? 'done' : ''}" data-act="joy" data-joy-act="note-toggle" data-note="${n.id}" data-item="${it.id}"><i>${it.done ? '✓' : ''}</i><span>${esc(it.text)}</span></button>`).join('')}</div>` : '<p class="joy-soft">An empty page, ready.</p>'}
        <div class="joy-note-foot">${items.length ? `${done}/${items.length} done` : 'Just words for now'}<span>${relative(n.payload?.updatedAt)}</span></div>
      </div>`;
    }).join('')}</div>` : `<div class="joy-empty"><span>✉️</span><h2>Nothing written yet</h2><p>A trip you keep talking about. A du’a list. A shopping list that makes you laugh.</p><button class="joy-btn" data-act="joy" data-joy-act="note-new">Write the first note</button></div>`}`;
  }

  function viewJournal() {
    return `${journalTabs()}
      ${J.journalTab === 'memories' ? memoriesView() : J.journalTab === 'map' ? mapView() : J.journalTab === 'days' ? daysView() : notesView()}`;
  }

  /* ------------------------------------------------------------
     Us
     ------------------------------------------------------------ */
  function usHero() {
    const s = joySettings();
    const parts = togetherParts(s.anniversary);
    const p = partner();
    return `<section class="joy-us-hero">
      ${coverHTML(s.cover)}
      <div class="joy-hero-shade"></div>
      <div class="joy-hero-arch joy-us-arch" aria-hidden="true"></div>
      <div class="joy-us-crest" aria-hidden="true">
        ${p ? `<span class="joy-face" style="--tint:${colorOf(who()?.id)}">${avatarOf(who()?.id)}</span><span class="joy-face-star">✦</span><span class="joy-face" style="--tint:${colorOf(p.id)}">${avatarOf(p.id)}</span>` : '<span class="joy-hero-star">✦</span>'}
      </div>
      <div class="joy-us-inner">
        <div class="joy-kicker">Us</div>
        <h1>${esc(who()?.name || 'you')} <span>&amp;</span> ${esc(p?.name || 'your person')}</h1>
        ${parts ? `<div class="joy-us-days"><b class="num">${parts.totalDays}</b><span>days together</span></div>` : '<p class="joy-soft">Set your anniversary in the little settings.</p>'}
        <div class="joy-us-counter" data-joy-counter>${parts ? counterUnits(parts) : ''}</div>
      </div>
    </section>`;
  }

  function statsGrid() {
    const st = joyStats();
    const items = [
      ['answers', st.answers, st.answers === 1 ? 'answer' : 'answers'],
      ['games', st.games, st.games === 1 ? 'game' : 'games'],
      ['memories', st.memories, st.memories === 1 ? 'memory' : 'memories'],
      ['notes', st.notes, st.notes === 1 ? 'note' : 'notes'],
      ['places', st.places, st.places === 1 ? 'place' : 'places'],
      ['streak', st.bestStreak, 'best streak'],
    ];
    return `<section class="joy-grid-stats">${items.map(([k, v, label]) => `<div><b class="num">${v}</b><span>${label}</span></div>`).join('')}</section>`;
  }

  function moodHistory() {
    const p = partner();
    const days = [];
    for (let i = 6; i >= 0; i--) days.push(dayKey(addDays(new Date(), -i)));
    return `<section class="joy-card joy-mood-history">
      <div class="joy-card-head">
        <div><div class="joy-kicker">Our week</div><h2>The weather between us</h2></div>
        <div class="joy-mood-legend">
          <span><i style="--tint:${colorOf(who()?.id)}">${avatarOf(who()?.id)}</i>You</span>
          ${p ? `<span><i style="--tint:${colorOf(p.id)}">${avatarOf(p.id)}</i>${esc(p.name)}</span>` : ''}
        </div>
      </div>
      <div class="joy-mood-days">${days.map((d) => {
        const mine = moodFor(who()?.id, d);
        const theirs = p ? moodFor(p.id, d) : null;
        const a = mine ? moodOf(mine.payload?.mood) : null;
        const b = theirs ? moodOf(theirs.payload?.mood) : null;
        return `<div class="joy-mood-day"><span>${parseDay(d).toLocaleDateString('en-GB', { weekday: 'narrow' })}</span><div><i class="${a ? 'has' : ''}" style="${a ? `background:${a.tint}` : ''}" title="You: ${a?.label || '—'}">${a?.emoji || ''}</i><i class="${b ? 'has' : ''}" style="${b ? `background:${b.tint}` : ''}" title="${esc(p?.name || 'them')}: ${b?.label || '—'}">${b?.emoji || ''}</i></div></div>`;
      }).join('')}</div>
    </section>`;
  }

  function prefsCard() {
    const p = partner();
    if (!p) return '';
    const mine = all().filter((r) => r.kind === 'pref' && r.memberId === who()?.id);
    const matches = mine.map((r) => {
      const theirs = all().find((x) => x.kind === 'pref' && x.memberId === p.id && x.payload?.itemId === r.payload?.itemId);
      if (!theirs) return null;
      const item = GAME_DECKS.thisthat.find((x) => x.id === r.payload?.itemId);
      if (!item) return null;
      return { item, mine: r.payload?.choice, theirs: theirs.payload?.choice };
    }).filter(Boolean).slice(0, 6);
    if (!matches.length) {
      return `<section class="joy-card"><div class="joy-card-head"><div><div class="joy-kicker">Our little profile</div><h2>This or that</h2></div><button class="joy-link" data-act="joy" data-joy-act="game-new" data-game="thisthat">Play</button></div><p class="joy-soft">Play a round of This or That and your little preferences will gather here.</p></section>`;
    }
    return `<section class="joy-card">
      <div class="joy-card-head"><div><div class="joy-kicker">Our little profile</div><h2>This or that</h2></div><button class="joy-link" data-act="joy" data-joy-act="game-new" data-game="thisthat">More</button></div>
      <div class="joy-prefs">${matches.map(({ item, mine: a, theirs: b }) => {
        const same = a === b;
        return `<div class="joy-pref"><span class="joy-pref-badge ${same ? 'same' : ''}">${same ? 'same' : 'different'}</span><div><small>You</small><b>${esc(a === 'a' ? item.a.text : item.b.text)}</b></div><div><small>${esc(p.name)}</small><b>${esc(b === 'a' ? item.a.text : item.b.text)}</b></div></div>`;
      }).join('')}</div>
    </section>`;
  }

  function milestonesCard() {
    const st = joyStats();
    return `<section class="joy-card">
      <div class="joy-card-head"><div><div class="joy-kicker">Little milestones</div><h2>How far we’ve come</h2></div><span class="joy-level-card">Level ${levelInfo(st).level}</span></div>
      <div class="joy-level-bar"><i style="width:${levelInfo(st).pct}%"></i></div>
      <div class="joy-milestones">${MILESTONES.map((m) => {
        const earned = m.test(st);
        return `<div class="joy-milestone ${earned ? 'earned' : ''}"><span>${m.emoji}</span><div><b>${m.title}</b><small>${m.desc}</small></div>${earned ? `<i>${icon('check', 15)}</i>` : ''}</div>`;
      }).join('')}</div>
    </section>`;
  }

  function placesCard() {
    const p = partner();
    const mine = placeFor(who()?.id);
    const theirs = p ? placeFor(p.id) : null;
    const km = theirs ? distanceKm(mine, theirs) : null;
    return `<section class="joy-card">
      <div class="joy-card-head"><div><div class="joy-kicker">Our places</div><h2>${km == null ? 'Where we are' : km < 1 ? 'The same sky' : `${Math.round(km)} km apart`}</h2></div><button class="joy-link" data-act="joy" data-joy-act="city" data-member="${who()?.id}">My city</button></div>
      <div class="joy-two-places">
        <div><b>${esc(mine.place || 'This place')}</b><small>you</small></div>
        <span class="joy-place-line">${km != null && km >= 1 ? `${Math.round(km)} km` : '🤍'}</span>
        <div><b>${esc(theirs?.place || 'Their place')}</b><small>${esc(p?.name || 'them')}</small><button class="joy-link" data-act="joy" data-joy-act="city" data-member="${p?.id || ''}">edit</button></div>
      </div>
    </section>`;
  }

  function viewUs() {
    return `${usHero()}
      ${statsGrid()}
      ${moodHistory()}
      ${milestonesCard()}
      ${prefsCard()}
      ${placesCard()}
      <section class="joy-card joy-about-card">
        <div class="joy-card-head"><div><div class="joy-kicker">Halal Couple</div><h2>Everything here is yours</h2></div><span class="joy-star">✦</span></div>
        <p class="joy-soft">No paywalls, no ads, no explicit questions. Just a quiet place to know each other more deeply, and to keep the ordinary days.</p>
        <div class="joy-about-actions"><button class="joy-btn ghost" data-act="joy" data-joy-act="settings">Settings</button><button class="joy-btn ghost" data-act="joy" data-joy-act="exit">Back to N&amp;A</button></div>
      </section>`;
  }

  /* ------------------------------------------------------------
     Keepsakes
     ------------------------------------------------------------ */
  function widgetPreview(type) {
    const s = joySettings();
    const parts = togetherParts(s.anniversary);
    const ev = upcomingEvents()[0];
    const mem = memoryList()[0];
    const p = partner();
    const note = latestStory();
    const st = joyStats();
    if (type === 'together') return `<div class="joy-widget wp-together"><span>Together for</span><b class="num">${parts ? parts.totalDays : 0}</b><small>${parts ? `${parts.years}y · ${parts.months}m · ${parts.days}d` : 'set your date'}</small></div>`;
    if (type === 'countdown') return `<div class="joy-widget wp-countdown"><span>Next</span><b>${ev ? ev.row.payload?.emoji || '💞' : '📅'}</b><small>${ev ? `${esc(ev.row.payload?.title || 'A day')} · ${countdownText(daysUntil(ev.next))}` : 'add a special day'}</small></div>`;
    if (type === 'memory') return `<div class="joy-widget wp-memory">${mem?.payload?.photos?.[0] ? `<img src="${esc(mem.payload.photos[0])}" alt="">` : '<span>📸</span>'}<b>${mem ? esc((mem.payload?.title || 'A memory').slice(0, 42)) : 'Your first memory'}</b></div>`;
    if (type === 'mood') {
      const a = moodFor(who()?.id, today());
      const b = p ? moodFor(p.id, today()) : null;
      return `<div class="joy-widget wp-mood"><span>Today</span><div><i>${a ? moodOf(a.payload?.mood)?.emoji : '·'}</i><i>${b ? moodOf(b.payload?.mood)?.emoji : '·'}</i></div><small>${a ? 'you' : 'check in'} · ${b ? esc(p.name) : 'waiting'}</small></div>`;
    }
    if (type === 'distance') {
      const mine = placeFor(who()?.id);
      const theirs = p ? placeFor(p.id) : null;
      const km = theirs ? distanceKm(mine, theirs) : null;
      return `<div class="joy-widget wp-distance"><span>Between us</span><b class="num">${km == null ? '—' : km < 1 ? '0' : Math.round(km)}</b><small>${km == null ? 'km' : km < 1 ? 'same sky' : 'km'}</small></div>`;
    }
    if (type === 'note') {
      if (note?.payload?.drawing) return `<div class="joy-widget wp-note has-drawing"><img src="${esc(note.payload.drawing)}" alt=""></div>`;
      return `<div class="joy-widget wp-note"><span>✉️</span><b>${note ? esc((note.payload?.text || 'A little note').slice(0, 78)) : 'Leave a note'}</b></div>`;
    }
    return `<div class="joy-widget wp-streak"><span>Our streak</span><b class="num">${st.current}</b><small>days of showing up</small></div>`;
  }

  function viewKeepsakes() {
    return `<section class="joy-page-head">
      <div class="joy-kicker">Little keepsakes</div>
      <h1>Things to hold</h1>
      <p>Home-screen widgets aren’t possible in a web app, so we made these little cards instead — save one, send one, keep one.</p>
    </section>
    <div class="joy-widget-grid">
      ${WIDGETS.map((w) => `<button class="joy-widget-card" data-act="joy" data-joy-act="widget" data-widget="${w.id}" style="--tint:${w.tint}">
        <div class="joy-widget-mini">${widgetPreview(w.id)}</div>
        <div class="joy-widget-copy"><b>${w.emoji} ${w.title}</b><small>${w.note}</small></div>
        <span class="joy-widget-share">${icon('share', 15)}</span>
      </button>`).join('')}
    </div>
    <section class="joy-card joy-notes-card">
      <div class="joy-card-head"><div><div class="joy-kicker">Little notes</div><h2>Words between you</h2></div><button class="joy-btn small" data-act="joy" data-joy-act="story-new">Write one</button></div>
      ${rows('story').length ? `<div class="joy-story-list">${rows('story').sort((a, b) => (b.payload?.at || 0) - (a.payload?.at || 0)).slice(0, 6).map((s) => `<button class="joy-story-row" data-act="joy" data-joy-act="story-view" data-id="${s.id}">${s.payload?.drawing ? `<img src="${esc(s.payload.drawing)}" alt="">` : `<span>✉️</span>`}<div><b>${esc(s.payload?.text || 'A little note').slice(0, 60)}</b><small>${esc(nameOf(s.memberId))} · ${relative(s.payload?.at)}</small></div></button>`).join('')}</div>` : `<p class="joy-soft">A line, a thought, a doodle. Leave one for the person you love.</p>`}
    </section>
    <div class="joy-note-card">Everything you make here stays between the two of you. No ads, no strangers, no noise.</div>`;
  }

  /* ------------------------------------------------------------
     Root view
     ------------------------------------------------------------ */
  function view() {
    const s = joySettings();
    if (!s.anniversary) return viewWelcome();
    if (!J.notifyStart) {
      markNotifyStart();
      J.notifyStart = true;
    }
    const body = J.tab === 'play' ? viewPlay() : J.tab === 'journal' ? viewJournal() : J.tab === 'us' ? viewUs() : J.tab === 'keepsakes' ? viewKeepsakes() : viewToday();
    requestAnimationFrame(() => {
      positionDock();
      startCounter();
    });
    return `<div class="joy joy-${J.tab}">
      ${header()}
      <div class="joy-page">${body}</div>
      ${dock(J.tab)}
    </div>`;
  }


  /* ------------------------------------------------------------
     Stages, answers, games, memories, notes and chat
     ------------------------------------------------------------ */
  function distanceKm(a, b) {
    if (!a || !b || a.lat == null || a.lng == null || b.lat == null || b.lng == null) return null;
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const la1 = (a.lat * Math.PI) / 180;
    const la2 = (b.lat * Math.PI) / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function markNotifyStart() {
    try {
      localStorage.setItem('na:joyNotifySince', String(Date.now()));
      const p = partner();
      if (p) {
        const ids = all().filter((r) => r.memberId === p.id).map((r) => r.id).slice(-200);
        localStorage.setItem('na:joyNotified', JSON.stringify(ids));
      }
    } catch { /* private mode */ }
  }

  function move(tab) {
    if (J.tab === tab) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    J.tab = tab;
    S.dir = 0;
    S.animateNext = true;
    window.scrollTo(0, 0);
    refresh();
  }

  function clearStageTimer() {
    clearInterval(J.stageTimer);
    J.stageTimer = null;
  }

  function openStage(html, cls = '', style = '') {
    clearStageTimer();
    clearInterval(J.chatTimer);
    J.chatTimer = null;
    const root = document.querySelector('#overlay-root');
    if (!root) return null;
    root.innerHTML = `<div class="joy-stage-scrim"></div><div class="joy-stage ${cls}" style="${style}" role="dialog" aria-modal="true">${html}</div>`;
    const stage = root.querySelector('.joy-stage');
    J.stageOpen = true;
    requestAnimationFrame(() => stage?.classList.add('open'));
    return stage;
  }

  function closeStage(instant = false) {
    clearStageTimer();
    clearInterval(J.chatTimer);
    J.chatTimer = null;
    const root = document.querySelector('#overlay-root');
    const stage = root?.querySelector('.joy-stage');
    const scrim = root?.querySelector('.joy-stage-scrim');
    J.stageOpen = false;
    J.game = null;
    J.memoryDraft = null;
    J.noteDraft = null;
    J.eventDraft = null;
    J.memoryId = null;
    J.noteId = null;
    J.eventId = null;
    scrim?.classList.remove('open');
    stage?.classList.remove('open');
    const done = () => {
      if (stage && stage.isConnected) {
        root.innerHTML = '';
        if (J.dirty) {
          J.dirty = false;
          refresh();
        }
      }
    };
    if (instant) done();
    else setTimeout(done, 300);
  }

  function startStagePoll(fn) {
    clearStageTimer();
    J.stageTimer = setInterval(() => {
      if (!document.querySelector('.joy-stage')) {
        clearStageTimer();
        return;
      }
      if (fn()) clearStageTimer();
    }, 2500);
  }

  function stageTop(kicker, title, progress = '') {
    return `<div class="joy-stage-top">
      <button class="joy-stage-x" data-act="joy" data-joy-act="stage-close" aria-label="Close">${icon('close', 18)}</button>
      <div class="joy-stage-title"><span>${esc(kicker)}</span><b>${esc(title)}</b></div>
      <div class="joy-stage-progress">${progress}</div>
    </div>`;
  }

  function stageConfirm(title, body, keepLabel, leaveLabel, onKeep, onLeave) {
    const stage = openStage(`<div class="joy-stage-confirm">
      <div class="joy-confirm-card">
        <span class="joy-confirm-star">✦</span>
        <h2>${esc(title)}</h2>
        <p>${esc(body)}</p>
        <button class="joy-btn" data-act="joy" data-joy-act="confirm-keep">${esc(keepLabel)}</button>
        <button class="joy-btn ghost" data-act="joy" data-joy-act="confirm-leave">${esc(leaveLabel)}</button>
      </div>
    </div>`, 'joy-stage-plain');
    J.confirmKeep = onKeep;
    J.confirmLeave = onLeave;
    return stage;
  }

  function requestCloseStage() {
    if (J.game) {
      const session = sessions().find((s) => s.id === J.game.sessionId);
      if (session) {
        const mine = sessionProgress(session, who()?.id);
        if (!sessionComplete(session) && mine.done > 0 && mine.done < mine.total) {
          stageConfirm('Leave this game?', 'Your answers are saved. You can pick it up again from Play whenever you like.', 'Keep playing', 'Leave for now', () => openGameStage(), () => closeStage());
          return;
        }
      }
    }
    closeStage();
  }

  /* ------------------------------------------------------------
     Daily question
     ------------------------------------------------------------ */
  function answerText(q, a) {
    if (!a) return '';
    if (a.payload?.type === 'text' || q?.type === 'text') return a.payload?.text || '';
    const opts = a.payload?.options || q?.options || [];
    return opts[a.payload?.choice] ?? '';
  }

  function openDaily() {
    const day = today();
    const q = dailyQuestionFor(day);
    const c = catOf((DAILY_BY_CAT ? Object.keys(DAILY_BY_CAT).find((k) => DAILY_BY_CAT[k].some((x) => x.id === q.id)) : 'relationship') || 'relationship');
    const m = who();
    const p = partner();
    const mine = m ? answerFor(m.id, day) : null;
    const theirs = p ? answerFor(p.id, day) : null;
    const style = '--stage-a:#2A0D1C;--stage-b:#7A2144;--stage-glow:#F0A36B';
    if (!mine) {
      const body = q.type === 'choice'
        ? `<div class="joy-daily-options">${q.options.map((o, i) => `<button class="joy-answer-option" data-act="joy" data-joy-act="daily-choice" data-index="${i}"><span>${i + 1}</span><b>${esc(o)}</b></button>`).join('')}</div>`
        : `<form data-form="joy-daily-text" class="joy-stage-form"><textarea class="joy-textarea" name="text" maxlength="600" placeholder="Write what is true for you…" required></textarea><button class="joy-btn" type="submit">Save my answer</button></form>`;
      openStage(`${stageTop(c.emoji + ' Today’s question', c.name, 'Daily')}
        <div class="joy-stage-body">
          <div class="joy-stage-kicker">${c.name}</div>
          <h1 class="joy-question">${esc(q.prompt)}</h1>
          <p class="joy-stage-sub">Answer on your own. It stays hidden until you have both answered.</p>
          ${body}
          <p class="joy-stage-hint">There is no right answer. Only yours.</p>
        </div>`, 'joy-stage-game joy-stage-daily', style);
      return;
    }
    if (!theirs) {
      openStage(`${stageTop('Your answer is in', q.prompt.slice(0, 38), 'Waiting')}
        <div class="joy-stage-body joy-waiting">
          <div class="joy-waiting-orb"><span>${c.emoji}</span><i></i><i></i><i></i></div>
          <h1>Now we wait<br>for ${esc(p?.name || 'them')}.</h1>
          <p>Your answer is safe. The moment they answer, this page will open like a letter.</p>
          <div class="joy-your-answer"><span>You said</span><b>${esc(answerText(q, mine))}</b></div>
          <button class="joy-btn ghost" data-act="joy" data-joy-act="nudge-daily">Send a gentle nudge</button>
          <button class="joy-btn" data-act="joy" data-joy-act="stage-close">Back to today</button>
        </div>`, 'joy-stage-game joy-stage-daily', style);
      startStagePoll(() => {
        if (partner() && answerFor(partner().id, day)) {
          openDaily();
          return true;
        }
        return false;
      });
      return;
    }
    openStage(dailyResultStage(q, c, mine, theirs, p), 'joy-stage-game joy-stage-daily joy-stage-results', style);
  }

  function dailyResultStage(q, c, mine, theirs, p) {
    const isChoice = (mine.payload?.type || q.type) === 'choice';
    const same = isChoice && mine.payload?.choice === theirs.payload?.choice;
    const opts = mine.payload?.options || q.options || [];
    const myText = answerText(q, mine);
    const theirText = answerText(q, theirs);
    return `${stageTop(c.emoji + ' Daily question', c.name, 'Revealed')}
      <div class="joy-stage-body">
        <div class="joy-result-heart">${same ? '💞' : '🤍'}</div>
        <div class="joy-stage-kicker">${same ? 'Same heart' : 'Two answers'}</div>
        <h1 class="joy-question">${esc(q.prompt)}</h1>
        <div class="joy-reveal ${isChoice ? 'choice' : 'text'}">
          <div class="joy-reveal-side">
            <div class="joy-reveal-who"><span style="--tint:${colorOf(who()?.id)}">${avatarOf(who()?.id)}</span><b>You</b>${same ? '<em>· same</em>' : ''}</div>
            ${isChoice ? `<div class="joy-reveal-choice">${esc(myText)}</div>` : `<div class="joy-reveal-quote">“${esc(myText)}”</div>`}
          </div>
          <div class="joy-reveal-side">
            <div class="joy-reveal-who"><span style="--tint:${colorOf(p?.id)}">${avatarOf(p?.id)}</span><b>${esc(p?.name || 'Them')}</b>${same ? '<em>· same</em>' : ''}</div>
            ${isChoice ? `<div class="joy-reveal-choice">${esc(theirText)}</div>` : `<div class="joy-reveal-quote">“${esc(theirText)}”</div>`}
          </div>
        </div>
        ${isChoice && !same ? `<p class="joy-result-note">Different choices, same table. Talk about what you picked.</p>` : `<p class="joy-result-note">${isChoice ? 'A little overlap in the ordinary. Keep it.' : 'Two honest answers. That is the whole point.'}</p>`}
        <div class="joy-streak-mini">🌱 ${joyStreak().current} day streak</div>
        <button class="joy-btn" data-act="joy" data-joy-act="chat" data-thread="daily|${today()}" data-title="Today’s question">${icon('chat', 17)} Talk about it</button>
        <button class="joy-btn ghost" data-act="joy" data-joy-act="stage-close">Done</button>
      </div>`;
  }

  async function saveDaily(choice, text) {
    const m = who();
    if (!m) return;
    const day = today();
    const q = dailyQuestionFor(day);
    const payload = {
      questionId: q.id, prompt: q.prompt, type: q.type, options: q.options || null,
      choice: choice ?? null, text: String(text || '').trim(), answeredAt: Date.now(),
    };
    await upsert({ id: `answer|${m.id}|${day}`, kind: 'answer', memberId: m.id, day, payload });
    haptic(10);
    openDaily();
  }

  /* ------------------------------------------------------------
     Games
     ------------------------------------------------------------ */
  function pickDeck(game, size) {
    const all = GAME_DECKS[game] || [];
    if (!all.length) return [];
    const recent = sessions().filter((s) => s.payload?.game === game).slice(0, 2).flatMap((s) => s.payload?.deck || []);
    let pool = all.filter((q) => !recent.includes(q.id));
    if (pool.length < size) pool = all.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, Math.min(size, pool.length));
  }

  async function startGame(gameId) {
    const p = partner();
    if (!p) return toast('Connect the other phone first');
    const meta = GAME_META[gameId];
    if (!meta) return;
    const unfinished = sessions().find((s) => s.payload?.game === gameId && sessionProgress(s, who().id).done < sessionDeck(s).length);
    if (unfinished) return openSession(unfinished.id);
    const deck = pickDeck(gameId, meta.size);
    if (!deck.length) return toast('This game is still being written');
    const session = {
      id: `game|${uid()}`, kind: 'game', memberId: who().id, day: today(),
      payload: { game: gameId, deck: deck.map((q) => q.id), createdAt: Date.now(), createdBy: who().id },
    };
    await upsert(session);
    haptic(8);
    J.game = { sessionId: session.id, index: 0 };
    openGameStage();
  }

  async function startTopic(catId) {
    const p = partner();
    if (!p) return toast('Connect the other phone first');
    const qs = DAILY_BY_CAT[catId] || [];
    if (!qs.length) return toast('This topic is still being written');
    const unfinished = sessions().find((s) => s.payload?.game === 'topic' && s.payload?.category === catId && sessionProgress(s, who().id).done < sessionDeck(s).length);
    if (unfinished) return openSession(unfinished.id);
    const session = {
      id: `game|${uid()}`, kind: 'game', memberId: who().id, day: today(),
      payload: { game: 'topic', category: catId, deck: qs.map((q) => q.id), createdAt: Date.now(), createdBy: who().id },
    };
    await upsert(session);
    haptic(8);
    J.game = { sessionId: session.id, index: 0 };
    openGameStage();
  }

  function openSession(id) {
    const session = sessions().find((s) => s.id === id);
    if (!session) return;
    J.game = { sessionId: id, index: 0 };
    openGameStage();
  }

  function gameQuestionHTML(session, meta, item, index, total) {
    const game = session.payload.game;
    const format = game === 'topic' ? (item.type || 'text') : meta.format;
    let body = '';
    if (format === 'binary') {
      const a = item.a?.text ?? 'I have';
      const b = item.b?.text ?? 'I haven’t';
      const ae = item.a?.emoji || (game === 'nhie' ? '🙋' : '✨');
      const be = item.b?.emoji || (game === 'nhie' ? '🙅' : '🌙');
      body = `<div class="joy-wyr">
        <button class="joy-choice-card tilt-l" data-act="joy" data-joy-act="game-choice" data-value="0"><span>${ae}</span><b>${esc(a)}</b></button>
        <span class="joy-or">OR</span>
        <button class="joy-choice-card tilt-r" data-act="joy" data-joy-act="game-choice" data-value="1"><span>${be}</span><b>${esc(b)}</b></button>
      </div>`;
    } else if (format === 'people') {
      const p = partner();
      body = `<div class="joy-people">
        <button class="joy-person-card" data-act="joy" data-joy-act="game-choice" data-person="${who()?.id}"><span style="--tint:${colorOf(who()?.id)}">${avatarOf(who()?.id)}</span><b>You</b></button>
        <span class="joy-or">OR</span>
        <button class="joy-person-card" data-act="joy" data-joy-act="game-choice" data-person="${p?.id || ''}"><span style="--tint:${colorOf(p?.id)}">${avatarOf(p?.id)}</span><b>${esc(p?.name || 'Them')}</b></button>
      </div>`;
    } else if (format === 'choice') {
      body = `<div class="joy-daily-options">${(item.options || []).map((o, i) => `<button class="joy-answer-option" data-act="joy" data-joy-act="game-choice" data-value="${i}"><span>${i + 1}</span><b>${esc(o)}</b></button>`).join('')}</div>`;
    } else if (format === 'photo') {
      body = `<form data-form="joy-game-photo" class="joy-stage-form">
        <label class="joy-photo-pick" data-photo-preview="game">
          ${J.game?.photo ? `<img src="${esc(J.game.photo)}" alt="">` : `<span>${icon('camera', 30)}<b>Choose a photo</b><small>One small glimpse of your day</small></span>`}
          <input type="file" accept="image/*" data-joy-file="game-photo">
        </label>
        <button class="joy-btn" type="submit" ${J.game?.photo ? '' : 'disabled'}>Share this photo</button>
      </form>`;
    } else {
      body = `<form data-form="joy-game-text" class="joy-stage-form"><textarea class="joy-textarea" name="text" maxlength="700" placeholder="Say it honestly…" required></textarea><button class="joy-btn" type="submit">Save &amp; next</button></form>`;
    }
    const prefix = game === 'wyr' ? 'Would you rather…' : game === 'wml' ? 'Who is more likely to…' : game === 'nhie' ? 'Never have I ever…' : game === 'thisthat' ? 'Pick one…' : '';
    const special = game === 'truthdare' ? `<div class="joy-td-type ${item.type}">${item.type === 'dare' ? 'Dare' : 'Truth'}</div>` : '';
    return `${stageTop(meta.emoji + ' ' + meta.title, meta.short || meta.title, `${index + 1} / ${total}`)}
      <div class="joy-game-progress"><i style="width:${Math.round(((index + 1) / total) * 100)}%"></i></div>
      <div class="joy-stage-body joy-game-body">
        ${prefix ? `<div class="joy-stage-kicker">${prefix}</div>` : ''}
        ${special}
        <h1 class="joy-question ${game === 'wyr' ? 'short' : ''}">${esc(item.prompt || '')}</h1>
        ${body}
        <button class="joy-skip" data-act="joy" data-joy-act="game-skip">Skip this one</button>
      </div>`;
  }

  function openGameStage() {
    if (!J.game) return;
    const session = sessions().find((s) => s.id === J.game.sessionId);
    if (!session) return;
    const meta = sessionMeta(session);
    const deck = sessionDeck(session);
    const total = deck.length;
    const mine = sessionProgress(session, who()?.id);
    if (mine.done >= total) {
      if (sessionComplete(session)) {
        openGameResults(session);
      } else {
        const p = partner();
        const theirs = p ? sessionProgress(session, p.id) : { done: 0, total };
        openStage(`${stageTop(meta.emoji + ' ' + meta.title, 'Your answers are safe', `${mine.done}/${total}`)}
          <div class="joy-stage-body joy-waiting">
            <div class="joy-waiting-orb"><span>${meta.emoji}</span><i></i><i></i><i></i></div>
            <h1>Now it’s<br>${esc(p?.name || 'their')}’s turn.</h1>
            <p>You answered all ${total}. The results will open the moment they finish.</p>
            <div class="joy-your-answer"><span>${esc(p?.name || 'They')} has answered</span><b>${theirs.done} of ${theirs.total}</b></div>
            <button class="joy-btn ghost" data-act="joy" data-joy-act="nudge-game">Send a gentle nudge</button>
            <button class="joy-btn" data-act="joy" data-joy-act="stage-close">Leave it here</button>
          </div>`, 'joy-stage-game joy-stage-results', `--stage-a:#2A0D1C;--stage-b:#7A2144;--stage-glow:${meta.tint}`);
        startStagePoll(() => {
          const fresh = sessions().find((s) => s.id === session.id);
          if (fresh && sessionComplete(fresh)) {
            openGameResults(fresh);
            return true;
          }
          return false;
        });
      }
      return;
    }
    let index = Math.max(0, J.game.index || 0);
    while (index < total && gameAnswerFor(session.id, who()?.id, index)) index++;
    if (index >= total) return openGameStage();
    J.game.index = index;
    const item = deck[index];
    openStage(gameQuestionHTML(session, meta, item, index, total), 'joy-stage-game', `--stage-a:#220D17;--stage-b:#6C1D3A;--stage-glow:${meta.tint}`);
  }

  async function answerGame(value) {
    if (!J.game) return;
    const session = sessions().find((s) => s.id === J.game.sessionId);
    if (!session) return;
    const deck = sessionDeck(session);
    const index = J.game.index || 0;
    const item = deck[index];
    if (!item) return;
    const payload = { sessionId: session.id, index, questionId: item.id, at: Date.now(), ...value };
    await upsert({
      id: `ga|${session.id}|${who().id}|${index}`, kind: 'gameAnswer', memberId: who().id, day: today(), payload,
    });
    if (session.payload.game === 'thisthat' && value.choice != null) {
      await upsert({
        id: `pref|${who().id}|${item.id}`, kind: 'pref', memberId: who().id, day: today(),
        payload: { itemId: item.id, choice: value.choice === 0 ? 'a' : 'b', at: Date.now() },
      });
    }
    haptic(9);
    J.game.photo = null;
    J.game.index = index + 1;
    openGameStage();
  }

  function openGameResults(session) {
    const meta = sessionMeta(session);
    const deck = sessionDeck(session);
    const score = sessionScore(session);
    const p = partner();
    const m = who();
    const cards = deck.map((item, i) => {
      const a = gameAnswerFor(session.id, m?.id, i)?.payload;
      const b = gameAnswerFor(session.id, p?.id, i)?.payload;
      const game = session.payload.game;
      const comparable = ['wyr', 'thisthat', 'nhie', 'quiz', 'wml'].includes(game) || (game === 'topic' && item.type === 'choice');
      const skipped = !a || !b || a.skipped || b.skipped;
      let same = false;
      if (comparable && !skipped) {
        same = game === 'wml' ? a.person === b.person : a.choice === b.choice;
      }
      const promptText = item.prompt || (item.a && item.b ? `${item.a.text} or ${item.b.text}?` : '');
      const answerForSide = (ans, whoId) => {
        if (!ans) return '—';
        if (ans.skipped) return 'Skipped';
        if (game === 'wml') return esc(nameOf(ans.person));
        if (game === 'nhie') return ans.choice === 0 ? 'I have' : 'I haven’t';
        if (game === 'wyr' || game === 'thisthat') return esc(ans.choice === 0 ? item.a?.text : item.b?.text);
        if (game === 'quiz' || (game === 'topic' && item.type === 'choice')) return esc(item.options?.[ans.choice] ?? '—');
        if (game === 'photo') return ans.photo ? `<img class="joy-result-photo" src="${esc(ans.photo)}" alt="">` : '—';
        return `“${esc(ans.text || '')}”`;
      };
      return `<div class="joy-result-card">
        <div class="joy-result-q">${esc(promptText)}</div>
        <div class="joy-result-answers">
          <div><span style="--tint:${colorOf(m?.id)}">${avatarOf(m?.id)}</span><p>${answerForSide(a, m?.id)}</p></div>
          <div><span style="--tint:${colorOf(p?.id)}">${avatarOf(p?.id)}</span><p>${answerForSide(b, p?.id)}</p></div>
        </div>
        ${comparable && !skipped ? `<div class="joy-match ${same ? 'same' : 'diff'}">${same ? '💞 Same' : '↔ Different'}</div>` : ''}
      </div>`;
    }).join('');
    openStage(`${stageTop(meta.emoji + ' ' + meta.title, 'The reveal', 'Finished')}
      <div class="joy-stage-body joy-results-body">
        <div class="joy-score">
          <div class="joy-score-ring" style="--p:${score.score ?? 0}"><b>${score.score != null ? score.score + '%' : '✦'}</b><span>${score.score != null ? 'overlap' : 'shared'}</span></div>
          <p>${score.score != null ? `${score.matches} of ${score.compared} choices landed on the same side.` : `${score.shared} answers shared between you.`}</p>
        </div>
        <div class="joy-result-list">${cards}</div>
        <button class="joy-btn" data-act="joy" data-joy-act="chat" data-thread="game|${session.id}" data-title="${esc(meta.title)}">${icon('chat', 17)} Talk about it</button>
        <button class="joy-btn ghost" data-act="joy" data-joy-act="replay" data-game="${session.payload.game}" data-cat="${session.payload.category || ''}">Play again</button>
        <button class="joy-btn ghost" data-act="joy" data-joy-act="stage-close">Done</button>
      </div>`, 'joy-stage-game joy-stage-results', `--stage-a:#260F1B;--stage-b:#6A1F3C;--stage-glow:${meta.tint}`);
  }

  /* ------------------------------------------------------------
     Memory editor + detail
     ------------------------------------------------------------ */
  function emptyMemory() {
    return { title: '', body: '', date: today(), place: '', lat: null, lng: null, country: '', photos: [], emoji: '💞' };
  }

  function photoStripHTML() {
    const photos = J.draftPhotos || [];
    return `<div class="joy-photo-strip" data-photo-strip>
      ${photos.map((p, i) => `<div class="joy-photo"><img src="${esc(p)}" alt=""><button data-act="joy" data-joy-act="memory-photo-remove" data-index="${i}" aria-label="Remove photo">×</button></div>`).join('')}
      ${photos.length < 3 ? `<label class="joy-photo-add">${icon('camera', 24)}<span>Add photo</span><input type="file" accept="image/*" data-joy-file="memory" multiple></label>` : ''}
    </div>`;
  }

  function openMemoryEditor(id = null) {
    const existing = id ? memoryFor(id) : null;
    const d = existing ? { ...emptyMemory(), ...(existing.payload || {}), photos: [...(existing.payload?.photos || [])] } : emptyMemory();
    J.memoryDraft = d;
    J.memoryId = id;
    J.draftPhotos = d.photos;
    J.placeResults = [];
    openStage(`<div class="joy-stage-top">
        <button class="joy-stage-x" data-act="joy" data-joy-act="stage-close" aria-label="Close">${icon('close', 18)}</button>
        <div class="joy-stage-title"><span>Our journal</span><b>${id ? 'Edit memory' : 'A new memory'}</b></div>
        <div class="joy-stage-progress"></div>
      </div>
      <form data-form="joy-memory" class="joy-editor">
        ${photoStripHTML()}
        <label class="joy-field"><span>Title</span><input class="joy-input" name="title" maxlength="80" placeholder="A day to keep" value="${esc(d.title)}"></label>
        <label class="joy-field"><span>The story</span><textarea class="joy-textarea" name="body" maxlength="900" placeholder="What happened? What did it feel like?">${esc(d.body)}</textarea></label>
        <div class="joy-field-row">
          <label class="joy-field"><span>Date</span><input class="joy-input" type="date" name="date" value="${esc(d.date || today())}"></label>
          <label class="joy-field"><span>Place</span><input class="joy-input" name="place" data-joy-input="place" autocomplete="off" placeholder="Where?" value="${esc(d.place)}"></label>
        </div>
        <input type="hidden" name="lat" value="${d.lat ?? ''}">
        <input type="hidden" name="lng" value="${d.lng ?? ''}">
        <input type="hidden" name="country" value="${esc(d.country || '')}">
        <div class="joy-place-results" data-place-results></div>
        <button type="button" class="joy-link joy-place-me" data-act="joy" data-joy-act="place-me">${icon('pin', 15)} Use my current location</button>
        <div class="joy-field"><span>A little mark</span><div class="joy-emoji-row">${['💞', '🏡', '✈️', '🤲', '🎉', '🌿'].map((e) => `<button type="button" class="joy-emoji-pick ${d.emoji === e ? 'on' : ''}" data-act="joy" data-joy-act="memory-emoji" data-emoji="${e}">${e}</button>`).join('')}</div></div>
        <button class="joy-btn" type="submit">${id ? 'Save changes' : 'Keep this memory'}</button>
        ${id ? `<button type="button" class="joy-btn ghost danger" data-act="joy" data-joy-act="memory-delete" data-id="${id}">Delete memory</button>` : ''}
      </form>`, 'joy-stage-editor', '--stage-a:#FFF9F3;--stage-b:#F8ECEF;--stage-glow:#F0D7DE');
  }

  function openMemoryDetail(id) {
    const m = memoryFor(id);
    if (!m) return;
    const p = m.payload || {};
    openStage(`<div class="joy-stage-top">
        <button class="joy-stage-x" data-act="joy" data-joy-act="stage-close" aria-label="Close">${icon('close', 18)}</button>
        <div class="joy-stage-title"><span>${shortDay(p.date || today())}</span><b>${esc(p.place || 'A memory')}</b></div>
        <button class="joy-icon-btn" data-act="joy" data-joy-act="memory-edit" data-id="${m.id}" aria-label="Edit">${icon('edit', 17)}</button>
      </div>
      <div class="joy-memory-detail">
        ${(p.photos || []).map((ph) => `<img src="${esc(ph)}" alt="">`).join('') || `<div class="joy-memory-detail-placeholder">${p.emoji || '📸'}</div>`}
        <h1>${esc(p.title || 'A day to keep')}</h1>
        <div class="joy-memory-meta"><span>${longDay(p.date || today())}</span>${p.place ? `<span>${esc(p.place)}</span>` : ''}</div>
        <p>${esc(p.body || '').replace(/\n/g, '<br>')}</p>
        <div class="joy-memory-actions">
          <button class="joy-btn ghost" data-act="joy" data-joy-act="memory-edit" data-id="${m.id}">${icon('edit', 16)} Edit</button>
          <button class="joy-btn ghost danger" data-act="joy" data-joy-act="memory-delete" data-id="${m.id}">Delete</button>
        </div>
      </div>`, 'joy-stage-detail', '--stage-a:#FFF9F3;--stage-b:#F7E9ED');
  }

  async function saveMemory(data, form) {
    const d = J.memoryDraft || emptyMemory();
    let lat = Number(data.lat);
    let lng = Number(data.lng);
    let country = String(data.country || '');
    const place = String(data.place || '').trim();
    if ((!Number.isFinite(lat) || !Number.isFinite(lng)) && place) {
      const hit = await geocode(place);
      if (hit) { lat = hit.lat; lng = hit.lng; country = hit.country; }
    }
    const existing = J.memoryId ? memoryFor(J.memoryId) : null;
    const row = {
      id: existing?.id || `memory|${uid()}`,
      kind: 'memory',
      memberId: who()?.id,
      day: data.date || today(),
      payload: {
        title: String(data.title || '').trim() || 'A day to keep',
        body: String(data.body || '').trim(),
        date: data.date || today(),
        place,
        lat: Number.isFinite(lat) ? lat : null,
        lng: Number.isFinite(lng) ? lng : null,
        country,
        photos: [...(J.draftPhotos || [])],
        emoji: d.emoji || '💞',
        createdAt: existing?.payload?.createdAt || Date.now(),
        updatedAt: Date.now(),
      },
    };
    await upsert(row);
    haptic(12);
    closeStage();
    toast('Memory kept');
  }

  async function removeMemory(id) {
    closeSheet(true);
    await remove(id);
    closeStage();
    toast('Memory removed');
  }

  /* ------------------------------------------------------------
     Events
     ------------------------------------------------------------ */
  function openEventEditor(id = null, day = null) {
    const existing = id ? rows('event').find((e) => e.id === id) : null;
    const e = existing?.payload || { title: '', date: day || J.selectedDay || today(), time: '', emoji: '💞', color: '#C4476C', repeat: 'yearly' };
    J.eventId = id;
    J.eventDraft = e;
    openStage(`<div class="joy-stage-top">
        <button class="joy-stage-x" data-act="joy" data-joy-act="stage-close" aria-label="Close">${icon('close', 18)}</button>
        <div class="joy-stage-title"><span>Our days</span><b>${id ? 'Edit a day' : 'A day to remember'}</b></div>
        <div class="joy-stage-progress"></div>
      </div>
      <form data-form="joy-event" class="joy-editor">
        <div class="joy-event-preview" style="--dot:${e.color || '#C4476C'}"><span>${e.emoji || '💞'}</span><div><b>${esc(e.title || 'A day to remember')}</b><small>${e.date ? longDay(e.date) : 'Choose a date'}</small></div></div>
        <label class="joy-field"><span>What is it?</span><input class="joy-input" name="title" maxlength="60" placeholder="Our anniversary" value="${esc(e.title || '')}" required></label>
        <div class="joy-field-row">
          <label class="joy-field"><span>Date</span><input class="joy-input" type="date" name="date" value="${esc(e.date || today())}" required></label>
          <label class="joy-field"><span>Time</span><input class="joy-input" type="time" name="time" value="${esc(e.time || '')}"></label>
        </div>
        <label class="joy-check-row"><input type="checkbox" name="repeat" ${e.repeat === 'yearly' ? 'checked' : ''}><span>Every year</span></label>
        <div class="joy-field"><span>Mark</span><div class="joy-emoji-row">${EVENT_EMOJIS.map((x) => `<button type="button" class="joy-emoji-pick ${e.emoji === x ? 'on' : ''}" data-act="joy" data-joy-act="event-emoji" data-emoji="${x}">${x}</button>`).join('')}</div></div>
        <div class="joy-field"><span>Colour</span><div class="joy-colors">${EVENT_COLORS.map((c) => `<button type="button" class="joy-color ${e.color === c.value ? 'on' : ''}" style="--c:${c.value}" data-act="joy" data-joy-act="event-color" data-color="${c.value}"></button>`).join('')}</div></div>
        <button class="joy-btn" type="submit">${id ? 'Save this day' : 'Add to our days'}</button>
        ${id ? `<button type="button" class="joy-btn ghost danger" data-act="joy" data-joy-act="event-delete" data-id="${id}">Delete this day</button>` : ''}
      </form>`, 'joy-stage-editor', '--stage-a:#FFF9F3;--stage-b:#F8ECEF');
  }

  async function saveEvent(data) {
    const e = J.eventDraft || {};
    const row = {
      id: J.eventId || `event|${uid()}`, kind: 'event', memberId: who()?.id, day: data.date,
      payload: {
        title: String(data.title || '').trim() || 'A day', date: data.date, time: data.time || '',
        emoji: e.emoji || '💞', color: e.color || '#C4476C', repeat: data.repeat ? 'yearly' : 'once',
        createdAt: e.createdAt || Date.now(), updatedAt: Date.now(),
      },
    };
    await upsert(row);
    haptic(9);
    closeStage();
    toast('A day to look forward to');
  }

  /* ------------------------------------------------------------
     Notes
     ------------------------------------------------------------ */
  function openNoteEditor(id = null) {
    const existing = id ? notesList().find((n) => n.id === id) : null;
    const n = existing?.payload || { title: '', category: 'Plans', items: [] };
    J.noteId = id;
    J.noteDraft = n;
    openStage(`<div class="joy-stage-top">
        <button class="joy-stage-x" data-act="joy" data-joy-act="stage-close" aria-label="Close">${icon('close', 18)}</button>
        <div class="joy-stage-title"><span>Shared notes</span><b>${id ? 'Edit note' : 'A new note'}</b></div>
        <div class="joy-stage-progress"></div>
      </div>
      <form data-form="joy-note" class="joy-editor">
        <label class="joy-field"><span>Title</span><input class="joy-input" name="title" maxlength="80" placeholder="Our next little plan" value="${esc(n.title || '')}" required></label>
        <div class="joy-field"><span>A place for it</span><div class="joy-chips">${NOTE_CATS.map((c) => `<button type="button" class="joy-chip ${n.category === c ? 'on' : ''}" data-act="joy" data-joy-act="note-cat" data-cat="${esc(c)}">${esc(c)}</button>`).join('')}</div></div>
        <input type="hidden" name="category" value="${esc(n.category || 'Plans')}">
        <label class="joy-field"><span>One thing per line</span><textarea class="joy-textarea" name="items" maxlength="2000" placeholder="Book the train&#10;Find a quiet hotel&#10;Make du’a together">${esc((n.items || []).map((i) => i.text).join('\n'))}</textarea></label>
        <button class="joy-btn" type="submit">${id ? 'Save note' : 'Write it down'}</button>
        ${id ? `<button type="button" class="joy-btn ghost danger" data-act="joy" data-joy-act="note-delete" data-id="${id}">Delete note</button>` : ''}
      </form>`, 'joy-stage-editor', '--stage-a:#FFF9F3;--stage-b:#F8ECEF');
  }

  async function saveNote(data) {
    const existing = J.noteId ? notesList().find((n) => n.id === J.noteId) : null;
    const old = new Map((existing?.payload?.items || []).map((i) => [i.text.trim(), i]));
    const lines = String(data.items || '').split('\n').map((l) => l.trim()).filter(Boolean);
    const items = lines.map((text) => {
      const prev = old.get(text);
      return { id: prev?.id || uid(), text, done: prev?.done || false };
    });
    const row = {
      id: existing?.id || `note|${uid()}`, kind: 'note', memberId: who()?.id, day: today(),
      payload: {
        title: String(data.title || '').trim() || 'Untitled note',
        category: String(data.category || 'Plans'),
        items,
        createdAt: existing?.payload?.createdAt || Date.now(),
        updatedAt: Date.now(),
        updatedBy: who()?.id,
      },
    };
    await upsert(row);
    haptic(9);
    closeStage();
    toast('Note saved');
  }

  async function toggleNote(noteId, itemId) {
    const note = all().find((r) => r.kind === 'note' && r.id === noteId);
    if (!note) return;
    const items = (note.payload?.items || []).map((i) => i.id === itemId ? { ...i, done: !i.done } : i);
    note.payload = { ...note.payload, items, updatedAt: Date.now(), updatedBy: who()?.id };
    await upsert(note);
    haptic(6);
    refresh();
  }

  /* ------------------------------------------------------------
     Stories / little notes
     ------------------------------------------------------------ */
  function openStoryComposer() {
    J.draftStory = '';
    J.doodleDirty = false;
    openStage(`<div class="joy-stage-top">
        <button class="joy-stage-x" data-act="joy" data-joy-act="stage-close" aria-label="Close">${icon('close', 18)}</button>
        <div class="joy-stage-title"><span>Little notes</span><b>Leave something soft</b></div>
        <div class="joy-stage-progress"></div>
      </div>
      <form data-form="joy-story" class="joy-editor joy-story-editor">
        <label class="joy-field"><span>A few words</span><textarea class="joy-textarea" name="text" maxlength="280" placeholder="A thought, a line, a little du’a…">${esc(J.draftStory)}</textarea></label>
        <div class="joy-field"><span>Or draw it</span>
          <div class="joy-doodle-wrap"><canvas id="joy-doodle" width="600" height="300"></canvas><button type="button" class="joy-link" data-act="joy" data-joy-act="doodle-clear">Clear</button><div class="joy-doodle-colors">${['#B23A5C', '#B78A3E', '#5D4B8A', '#2F6B4F'].map((c) => `<button type="button" class="joy-doodle-color" style="--c:${c}" data-act="joy" data-joy-act="doodle-color" data-color="${c}"></button>`).join('')}</div></div>
        </div>
        <button class="joy-btn" type="submit">Send this note</button>
      </form>`, 'joy-stage-editor', '--stage-a:#FFF9F3;--stage-b:#F8ECEF');
    initDoodle();
  }

  function initDoodle() {
    const canvas = document.querySelector('#joy-doodle');
    if (!canvas) return;
    const x = canvas.getContext('2d');
    x.fillStyle = '#FFF8F2';
    x.fillRect(0, 0, canvas.width, canvas.height);
    x.lineCap = 'round';
    x.lineJoin = 'round';
    x.lineWidth = 7;
    x.strokeStyle = '#B23A5C';
    J.doodle = { canvas, ctx: x, drawing: false, color: '#B23A5C' };
    const point = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * canvas.width, y: ((e.clientY - r.top) / r.height) * canvas.height };
    };
    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      const p = point(e);
      x.strokeStyle = J.doodle.color;
      x.beginPath();
      x.moveTo(p.x, p.y);
      J.doodle.drawing = true;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!J.doodle.drawing) return;
      e.preventDefault();
      const p = point(e);
      x.lineTo(p.x, p.y);
      x.stroke();
      J.doodleDirty = true;
    });
    const end = () => { J.doodle.drawing = false; };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
  }

  function openStoryView(id) {
    const s = all().find((r) => r.kind === 'story' && r.id === id);
    if (!s) return;
    const p = s.payload || {};
    openStage(`<div class="joy-stage-top">
        <button class="joy-stage-x" data-act="joy" data-joy-act="stage-close" aria-label="Close">${icon('close', 18)}</button>
        <div class="joy-stage-title"><span>${esc(nameOf(s.memberId))}</span><b>${relative(p.at)}</b></div>
        <div class="joy-stage-progress"></div>
      </div>
      <div class="joy-story-view">
        ${p.drawing ? `<img src="${esc(p.drawing)}" alt="">` : ''}
        ${p.text ? `<p>${esc(p.text)}</p>` : ''}
        ${s.memberId === who()?.id ? `<button class="joy-btn ghost danger" data-act="joy" data-joy-act="story-delete" data-id="${s.id}">Delete this note</button>` : ''}
      </div>`, 'joy-stage-detail', '--stage-a:#FFF9F3;--stage-b:#F8ECEF');
  }

  /* ------------------------------------------------------------
     Chat
     ------------------------------------------------------------ */
  function chatMessages(thread) {
    return rows('chat').filter((r) => r.payload?.thread === thread).sort((a, b) => (a.payload?.at || 0) - (b.payload?.at || 0));
  }

  function chatBodyHTML(thread) {
    const msgs = chatMessages(thread);
    if (!msgs.length) return `<div class="joy-chat-empty"><span>🤍</span><p>A quiet thread, just for this. Say the thing you would say if you were sitting together.</p></div>`;
    return msgs.map((m) => {
      const mine = m.memberId === who()?.id;
      return `<div class="joy-msg ${mine ? 'mine' : ''}">
        <span class="joy-msg-av" style="--tint:${colorOf(m.memberId)}">${avatarOf(m.memberId)}</span>
        <div class="joy-msg-bubble"><p>${esc(m.payload?.text || '').replace(/\n/g, '<br>')}</p><span>${relative(m.payload?.at)}</span></div>
      </div>`;
    }).join('');
  }

  function renderChat(thread) {
    const body = document.querySelector('[data-chat-body]');
    if (!body) return;
    const atBottom = body.scrollHeight - body.scrollTop - body.clientHeight < 60;
    body.innerHTML = chatBodyHTML(thread);
    if (atBottom) body.scrollTop = body.scrollHeight;
  }

  function openChat(thread, title) {
    openStage(`<div class="joy-stage-top">
        <button class="joy-stage-x" data-act="joy" data-joy-act="stage-close" aria-label="Close">${icon('close', 18)}</button>
        <div class="joy-stage-title"><span>Just the two of you</span><b>${esc(title || 'Talk about it')}</b></div>
        <div class="joy-stage-progress"></div>
      </div>
      <div class="joy-chat-stage">
        <div class="joy-chat-body" data-chat-body>${chatBodyHTML(thread)}</div>
        <form data-form="joy-chat" class="joy-chat-form">
          <input type="hidden" name="thread" value="${esc(thread)}">
          <div class="joy-chat-quick">${['Same here', 'Tell me more', 'That’s so you', '🤍'].map((q) => `<button type="button" class="joy-chip" data-act="joy" data-joy-act="chat-quick" data-thread="${esc(thread)}" data-text="${esc(q)}">${esc(q)}</button>`).join('')}</div>
          <div class="joy-chat-input"><textarea name="text" rows="1" maxlength="500" placeholder="Say it softly…"></textarea><button type="submit" aria-label="Send">${icon('arrow', 18)}</button></div>
        </form>
      </div>`, 'joy-stage-chat');
    const body = document.querySelector('[data-chat-body]');
    if (body) body.scrollTop = body.scrollHeight;
    let last = chatMessages(thread).length;
    J.chatTimer = setInterval(() => {
      if (!document.querySelector('[data-chat-body]')) {
        clearInterval(J.chatTimer);
        J.chatTimer = null;
        return;
      }
      const now = chatMessages(thread).length;
      if (now !== last) { last = now; renderChat(thread); }
    }, 2200);
  }

  async function sendChat(thread, text) {
    const t = String(text || '').trim();
    if (!t) return;
    await upsert({
      id: `chat|${uid()}`, kind: 'chat', memberId: who()?.id, day: today(),
      payload: { thread, text: t.slice(0, 500), at: Date.now() },
    });
    haptic(6);
    renderChat(thread);
  }


  /* ------------------------------------------------------------
     Widget images (the web-app equivalent of a home-screen widget)
     ------------------------------------------------------------ */
  const loadImg = (src) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  function drawCover(ctx, img, W, H) {
    const scale = Math.max(W / img.width, H / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function wrap(ctx, text, x, y, maxW, lineH, maxLines = 6, align = 'left') {
    const words = String(text || '').split(/\s+/);
    let line = '';
    let lines = 0;
    ctx.textAlign = align;
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, y + lines * lineH);
        lines++;
        line = word;
        if (lines >= maxLines) return y + lines * lineH;
      } else {
        line = test;
      }
    }
    if (line) {
      ctx.fillText(line, x, y + lines * lineH);
      lines++;
    }
    return y + lines * lineH;
  }

  function drawStar(ctx, cx, cy, r, color) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 8;
      const rr = i % 2 ? r * 0.32 : r;
      const x = Math.cos(a) * rr;
      const y = Math.sin(a) * rr;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  async function buildWidgetImage(type) {
    const W = 1080;
    const H = 1350;
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    const s = joySettings();
    const p = partner();
    const m = who();
    const parts = togetherParts(s.anniversary);
    const ev = upcomingEvents()[0];
    const mem = memoryList()[0];
    const note = latestStory();
    const st = joyStats();
    const preset = COVER_GRADIENTS[s.cover] ? s.cover : 'preset:rose';
    const palettes = {
      'preset:rose': ['#310B1B', '#8F2748', '#E08A6A'],
      'preset:sage': ['#12251C', '#3D6B4F', '#B6C99A'],
      'preset:amber': ['#2F180B', '#9A5A2B', '#E7B678'],
      'preset:plum': ['#1A0C1F', '#5A2A5C', '#C28CA9'],
      'preset:midnight': ['#0A1018', '#243A54', '#9AA9B8'],
    };
    const pal = palettes[preset] || palettes['preset:rose'];
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, pal[0]);
    g.addColorStop(0.55, pal[1]);
    g.addColorStop(1, pal[2]);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    if (/^data:image\//.test(s.cover)) {
      try {
        const img = await loadImg(s.cover);
        ctx.globalAlpha = 0.5;
        drawCover(ctx, img, W, H);
        ctx.globalAlpha = 1;
        const ov = ctx.createLinearGradient(0, 0, 0, H);
        ov.addColorStop(0, 'rgba(22,8,15,.18)');
        ov.addColorStop(0.55, 'rgba(22,8,15,.55)');
        ov.addColorStop(1, 'rgba(22,8,15,.9)');
        ctx.fillStyle = ov;
        ctx.fillRect(0, 0, W, H);
      } catch { /* keep the gradient */ }
    }

    // fine stars
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < 26; i++) {
      const x = (i * 397 + 83) % W;
      const y = (i * 211 + 41) % H;
      ctx.fillStyle = i % 3 ? '#F6D9A8' : '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x, y, i % 4 === 0 ? 2.4 : 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(255,248,242,.72)';
    ctx.font = '600 24px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
    ctx.letterSpacing = '4px';
    ctx.fillText('HALAL COUPLE', 78, 104);
    drawStar(ctx, W - 92, 94, 17, '#E7C88A');

    ctx.fillStyle = '#FFF8F2';
    ctx.textAlign = 'left';
    const names = `${m?.name || 'You'} & ${p?.name || 'your person'}`;

    if (type === 'together') {
      ctx.font = '600 34px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.fillStyle = 'rgba(255,248,242,.72)';
      ctx.fillText('TOGETHER FOR', 78, 360);
      ctx.font = '500 250px Georgia,serif';
      ctx.fillStyle = '#FFF8F2';
      ctx.fillText(String(parts?.totalDays ?? 0), 72, 570);
      ctx.font = '500 46px Georgia,serif';
      ctx.fillStyle = '#E7C88A';
      ctx.fillText((parts?.totalDays ?? 0) === 1 ? 'day' : 'days', 84, 665);
      ctx.font = '400 32px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.fillStyle = 'rgba(255,248,242,.82)';
      const yearsLabel = parts?.years === 1 ? 'year' : 'years';
      const monthsLabel = parts?.months === 1 ? 'month' : 'months';
      const daysLabel = parts?.days === 1 ? 'day' : 'days';
      ctx.fillText(parts ? `${parts.years} ${yearsLabel} · ${parts.months} ${monthsLabel} · ${parts.days} ${daysLabel}` : 'Set your anniversary', 84, 750);
      ctx.font = '400 30px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.fillStyle = 'rgba(255,248,242,.6)';
      wrap(ctx, 'Every ordinary day, kept.', 84, 830, 780, 42, 2);
    } else if (type === 'countdown') {
      ctx.font = '600 34px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.fillStyle = 'rgba(255,248,242,.72)';
      ctx.fillText('THE NEXT LITTLE DAY', 78, 360);
      ctx.font = '400 140px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.fillText(ev?.row.payload?.emoji || '📅', 78, 540);
      ctx.font = '500 86px Georgia,serif';
      ctx.fillStyle = '#FFF8F2';
      wrap(ctx, ev?.row.payload?.title || 'A day to look forward to', 78, 680, 880, 92, 2);
      ctx.font = '600 130px Georgia,serif';
      ctx.fillStyle = '#E7C88A';
      const n = ev ? daysUntil(ev.next) : 0;
      ctx.fillText(ev ? (n === 0 ? 'Today' : `${n}`) : '—', 78, 930);
      if (ev && n !== 0) {
        ctx.font = '400 34px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
        ctx.fillStyle = 'rgba(255,248,242,.76)';
        ctx.fillText('days to go', 84, 982);
      }
    } else if (type === 'memory') {
      const photo = mem?.payload?.photos?.[0];
      if (photo) {
        try {
          const img = await loadImg(photo);
          ctx.globalAlpha = 0.86;
          drawCover(ctx, img, W, H);
          ctx.globalAlpha = 1;
        } catch { /* gradient */ }
      }
      const ov = ctx.createLinearGradient(0, 0, 0, H);
      ov.addColorStop(0, 'rgba(18,8,14,.12)');
      ov.addColorStop(0.45, 'rgba(18,8,14,.2)');
      ov.addColorStop(1, 'rgba(18,8,14,.92)');
      ctx.fillStyle = ov;
      ctx.fillRect(0, 0, W, H);
      ctx.font = '600 34px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.fillStyle = 'rgba(255,248,242,.76)';
      ctx.fillText('A MEMORY OF OURS', 78, H - 430);
      ctx.font = '500 76px Georgia,serif';
      ctx.fillStyle = '#FFF8F2';
      wrap(ctx, mem?.payload?.title || 'Your first memory', 78, H - 330, 900, 82, 2);
      ctx.font = '400 32px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.fillStyle = 'rgba(255,248,242,.72)';
      ctx.fillText(`${mem ? longDay(mem.payload?.date || today()) : ''}${mem?.payload?.place ? ` · ${mem.payload.place}` : ''}`, 80, H - 205);
    } else if (type === 'mood') {
      const a = moodOf(moodFor(m?.id, today())?.payload?.mood);
      const b = p ? moodOf(moodFor(p.id, today())?.payload?.mood) : null;
      ctx.font = '600 34px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.fillStyle = 'rgba(255,248,242,.72)';
      ctx.fillText('HOW OUR HEARTS ARE', 78, 360);
      ctx.font = '400 190px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.fillText(a?.emoji || '·', 78, 620);
      ctx.fillText(b?.emoji || '·', 560, 620);
      ctx.font = '500 50px Georgia,serif';
      ctx.fillStyle = '#FFF8F2';
      ctx.fillText(a?.label || 'Not checked in', 84, 735);
      ctx.fillText(b?.label || 'Not checked in', 566, 735);
      ctx.font = '400 30px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.fillStyle = 'rgba(255,248,242,.66)';
      ctx.fillText(m?.name || 'You', 86, 790);
      ctx.fillText(p?.name || 'Them', 568, 790);
    } else if (type === 'distance') {
      const mine = placeFor(m?.id);
      const theirs = p ? placeFor(p.id) : null;
      const km = theirs ? distanceKm(mine, theirs) : null;
      ctx.font = '600 34px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.fillStyle = 'rgba(255,248,242,.72)';
      ctx.fillText('THE DISTANCE BETWEEN US', 78, 360);
      ctx.font = '500 220px Georgia,serif';
      ctx.fillStyle = '#FFF8F2';
      ctx.fillText(km == null ? '—' : km < 1 ? '0' : String(Math.round(km)), 72, 600);
      ctx.font = '500 44px Georgia,serif';
      ctx.fillStyle = '#E7C88A';
      ctx.fillText(km != null && km < 1 ? 'same sky' : 'kilometres', 84, 660);
      ctx.font = '400 34px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.fillStyle = 'rgba(255,248,242,.8)';
      ctx.fillText(mine.place || 'Your place', 84, 780);
      ctx.fillText('—', 84, 835);
      ctx.fillText(theirs?.place || 'Their place', 84, 890);
    } else if (type === 'note') {
      const drawing = note?.payload?.drawing;
      if (drawing) {
        try {
          const img = await loadImg(drawing);
          ctx.fillStyle = '#FFF8F2';
          roundRect(ctx, 72, 300, W - 144, 620, 40);
          ctx.fill();
          ctx.save();
          roundRect(ctx, 72, 300, W - 144, 620, 40);
          ctx.clip();
          drawCover(ctx, img, W - 144, 620);
          ctx.restore();
        } catch { /* ignore */ }
      } else {
        ctx.fillStyle = 'rgba(255,248,242,.1)';
        roundRect(ctx, 72, 300, W - 144, 500, 40);
        ctx.fill();
        ctx.font = '500 66px Georgia,serif';
        ctx.fillStyle = '#FFF8F2';
        wrap(ctx, note?.payload?.text || 'Leave a note for the one you love.', 112, 430, W - 224, 82, 5);
      }
      ctx.font = '500 60px Georgia,serif';
      ctx.fillStyle = '#FFF8F2';
      wrap(ctx, note?.payload?.text || 'A little note, waiting.', 78, 1060, W - 156, 74, 3);
      ctx.font = '400 30px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.fillStyle = 'rgba(255,248,242,.66)';
      ctx.fillText(note ? `From ${nameOf(note.memberId)}` : 'From you', 80, 1200);
    } else {
      ctx.font = '600 34px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.fillStyle = 'rgba(255,248,242,.72)';
      ctx.fillText('OUR LITTLE STREAK', 78, 360);
      ctx.font = '500 250px Georgia,serif';
      ctx.fillStyle = '#FFF8F2';
      ctx.fillText(String(st.current), 72, 600);
      ctx.font = '500 46px Georgia,serif';
      ctx.fillStyle = '#E7C88A';
      ctx.fillText(st.current === 1 ? 'day of showing up' : 'days of showing up', 84, 660);
      ctx.font = '400 34px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
      ctx.fillStyle = 'rgba(255,248,242,.72)';
      ctx.fillText(`Best: ${st.bestStreak} days`, 84, 760);
      const days = [];
      for (let i = 6; i >= 0; i--) days.push(dayKey(addDays(new Date(), -i)));
      days.forEach((d, i) => {
        ctx.beginPath();
        ctx.arc(110 + i * 135, 900, 24, 0, Math.PI * 2);
        ctx.fillStyle = bothAnswered(d) || frozen(d) ? '#E7C88A' : 'rgba(255,248,242,.2)';
        ctx.fill();
      });
    }

    // Footer
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,248,242,.6)';
    ctx.font = '400 28px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif';
    ctx.fillText(names, 78, H - 92);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#E7C88A';
    ctx.font = '500 28px Georgia,serif';
    ctx.fillText('✦', W - 86, H - 92);
    return c.toDataURL('image/jpeg', 0.9);
  }

  async function openWidget(type) {
    const w = WIDGETS.find((x) => x.id === type) || WIDGETS[0];
    openStage(`<div class="joy-stage-top">
        <button class="joy-stage-x" data-act="joy" data-joy-act="stage-close" aria-label="Close">${icon('close', 18)}</button>
        <div class="joy-stage-title"><span>Keepsakes</span><b>${esc(w.title)}</b></div>
        <div class="joy-stage-progress"></div>
      </div>
      <div class="joy-widget-stage">
        <div class="joy-widget-loading">${icon('spark', 26)}<span>Making something beautiful…</span></div>
      </div>`, 'joy-stage-detail', '--stage-a:#FFF9F3;--stage-b:#F7E9ED');
    try {
      const url = await buildWidgetImage(type);
      J.widgetUrl = url;
      const stage = document.querySelector('.joy-widget-stage');
      if (!stage) return;
      stage.innerHTML = `<img class="joy-widget-preview" src="${url}" alt="A Halal Couple keepsake">
        <button class="joy-btn" data-act="joy" data-joy-act="share-widget">${icon('share', 17)} Share this card</button>
        <button class="joy-btn ghost" data-act="joy" data-joy-act="save-widget">Save image</button>
        <p class="joy-stage-hint">A little card to keep, send, or set as a wallpaper. Home-screen widgets are not possible in a web app, so this is our version of one.</p>`;
    } catch (err) {
      console.warn(err);
      const stage = document.querySelector('.joy-widget-stage');
      if (stage) stage.innerHTML = '<p class="joy-soft">The card could not be made right now. Try again.</p>';
    }
  }

  async function shareWidgetImage(url) {
    if (!url) return;
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], 'halal-couple.jpg', { type: 'image/jpeg' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Halal Couple', text: 'A little piece of us.' });
        return;
      }
    } catch { /* fall through */ }
    downloadWidget(url);
  }

  function downloadWidget(url) {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = 'halal-couple.jpg';
    a.click();
  }

  /* ------------------------------------------------------------
     Intro, settings, city, streak, mood note
     ------------------------------------------------------------ */
  function openIntro() {
    const s = joySettings();
    J.introCover = s.cover || 'preset:rose';
    openStage(`<div class="joy-stage-top">
        <button class="joy-stage-x" data-act="joy" data-joy-act="stage-close" aria-label="Close">${icon('close', 18)}</button>
        <div class="joy-stage-title"><span>Halal Couple</span><b>The beginning</b></div>
        <div class="joy-stage-progress"></div>
      </div>
      <form data-form="joy-intro" class="joy-editor joy-intro">
        <div class="joy-intro-star">✦</div>
        <h1>When did<br>your story begin?</h1>
        <p>The day you became us. It will become the little counter on your home.</p>
        <label class="joy-field"><span>Our anniversary</span><input class="joy-input" type="date" name="anniversary" value="${esc(s.anniversary || today())}" required></label>
        <div class="joy-field"><span>Choose a cover</span>
          <div class="joy-cover-picks">${Object.keys(COVER_GRADIENTS).map((c) => `<button type="button" class="joy-cover-pick ${J.introCover === c ? 'on' : ''}" style="--cover:${COVER_GRADIENTS[c]}" data-act="joy" data-joy-act="intro-cover" data-cover="${c}" aria-label="Cover"></button>`).join('')}</div>
        </div>
        <input type="hidden" name="cover" value="${esc(J.introCover)}">
        <button class="joy-btn" type="submit">Enter our little world</button>
        <p class="joy-stage-hint">Everything here is private to the two of you. You can change all of this later.</p>
      </form>`, 'joy-stage-editor joy-stage-intro', '--stage-a:#FFF9F3;--stage-b:#F8ECEF');
  }

  function openJoySettings() {
    const s = joySettings();
    const p = partner();
    const mine = placeFor(who()?.id);
    const theirs = p ? placeFor(p.id) : null;
    openSheet(`<div class="grip"></div>
      <h3>Halal Couple</h3>
      <p class="sheet-sub">The little details of your little world.</p>
      <form data-form="joy-settings-date" class="joy-settings-form">
        <div class="label">Our story began</div>
        <div class="joy-inline"><input class="line" type="date" name="anniversary" value="${esc(s.anniversary || today())}"><button class="btn primary" type="submit">Save</button></div>
      </form>
      <div class="joy-settings-label">Cover</div>
      <div class="joy-cover-picks">${Object.keys(COVER_GRADIENTS).map((c) => `<button type="button" class="joy-cover-pick ${s.cover === c ? 'on' : ''}" style="--cover:${COVER_GRADIENTS[c]}" data-act="joy" data-joy-act="cover" data-cover="${c}" aria-label="Cover"></button>`).join('')}</div>
      <label class="joy-upload">${icon('camera', 18)} Upload a photo<input type="file" accept="image/*" data-joy-file="cover"></label>
      <div class="joy-settings-label">Daily question</div>
      <form data-form="joy-settings-time" class="joy-inline">
        <input class="line" type="time" name="time" value="${esc(s.dailyTime || '20:30')}"><button class="btn" type="submit">Save</button>
      </form>
      <button class="sheet-opt" data-act="joy" data-joy-act="notify-toggle"><span class="lbl">A gentle reminder<span class="sub">One quiet notification if the question is still waiting</span></span><span class="switch" role="switch" aria-checked="${!!s.notify}"></span></button>
      <div class="joy-settings-label">Our cities</div>
      <button class="sheet-opt" data-act="joy" data-joy-act="city" data-member="${who()?.id}"><span class="lbl">Your city<span class="sub">${esc(mine.place || 'Set a place')}</span></span><span class="v">Edit</span></button>
      ${p ? `<button class="sheet-opt" data-act="joy" data-joy-act="city" data-member="${p.id}"><span class="lbl">${esc(p.name)}’s city<span class="sub">${esc(theirs?.place || 'Set a place')}</span></span><span class="v">Edit</span></button>` : ''}
      <button class="sheet-opt" data-act="joy" data-joy-act="reset"><span class="lbl" style="color:var(--miss)">Reset Halal Couple<span class="sub">Removes your questions, games, memories and notes</span></span></button>
      <p class="q-note" style="margin-top:14px">Halal Couple is part of N&amp;A. Prayers, plans and reviews are never touched by a reset here.</p>
      <button class="sheet-opt cancel" data-act="close">Close</button>
    `);
  }

  async function openCitySheet(memberId) {
    const m = member(memberId);
    const place = placeFor(memberId);
    openSheet(`<div class="grip"></div>
      <h3>${esc(m?.name || 'Their')} city</h3>
      <p class="sheet-sub">Used only for the little distance card. It never leaves your space.</p>
      <form data-form="joy-city">
        <input type="hidden" name="member" value="${esc(memberId)}">
        <div class="label">Place</div>
        <input class="line" name="place" value="${esc(place.place || '')}" placeholder="City or town" autocomplete="off">
        <button class="btn wide" type="button" style="margin-top:10px" data-act="joy" data-joy-act="city-me">${icon('pin', 16)} Use my current location</button>
        <button class="btn primary wide" type="submit" style="margin-top:10px">Save this place</button>
      </form>
    `);
  }

  function openStreakSheet() {
    const st = joyStreak();
    const days = [];
    for (let i = 27; i >= 0; i--) days.push(dayKey(addDays(new Date(), -i)));
    openSheet(`<div class="grip"></div>
      <h3>Our little streak</h3>
      <p class="sheet-sub">A day counts when you have both answered the daily question. A freeze can protect one missed day each month.</p>
      <div class="joy-streak-sheet-figure"><span>🔥</span><b class="num">${st.current}</b><small>days now · ${st.best} best</small></div>
      <div class="joy-streak-month">${days.map((d) => `<i class="${bothAnswered(d) || frozen(d) ? 'good' : ''} ${d === today() ? 'today' : ''}" title="${shortDay(d)}"></i>`).join('')}</div>
      ${st.freezeAvailable ? `<button class="btn wide" data-act="joy" data-joy-act="freeze">${icon('spark', 16)} Use this month’s freeze</button>` : `<p class="q-note">This month’s freeze has already been used.</p>`}
      <button class="sheet-opt cancel" data-act="close" style="margin-top:10px">Close</button>
    `);
  }

  function openMoodNote() {
    const m = who();
    const cur = moodFor(m?.id, today());
    if (!cur) return toast('Choose a mood first');
    openSheet(`<div class="grip"></div>
      <h3>A word for today</h3>
      <p class="sheet-sub">Optional. A few words can say more than the mood on its own.</p>
      <form data-form="joy-mood-note">
        <textarea class="area" name="note" maxlength="180" placeholder="What is behind this feeling?">${esc(cur.payload?.note || '')}</textarea>
        <button class="btn primary wide" type="submit" style="margin-top:12px">Save the word</button>
      </form>
    `);
  }

  async function useFreeze() {
    const s = joySettings();
    if (s.freezeMonth === today().slice(0, 7)) return toast('This month’s freeze is already used');
    const st = joyStreak();
    if (!st.current) return toast('There is no streak to protect yet');
    const yesterday = dayKey(addDays(new Date(), -1));
    if (bothAnswered(yesterday) || frozen(yesterday)) return toast('Yesterday is already safe');
    await upsert({ id: `freeze|${yesterday}`, kind: 'freeze', day: yesterday, memberId: who()?.id, payload: { at: Date.now() } });
    await saveSettings({ freezeMonth: today().slice(0, 7) });
    closeSheet();
    refresh();
    toast('The streak is protected 🤍');
  }

  /* ------------------------------------------------------------
     Remote notifications and the daily reminder
     ------------------------------------------------------------ */
  async function remote() {
    if (!joySettings().anniversary) return;
    const since = Number(localStorage.getItem('na:joyNotifySince') || 0);
    if (!since) { markNotifyStart(); return; }
    const p = partner();
    if (!p) return;
    let seen = [];
    try { seen = JSON.parse(localStorage.getItem('na:joyNotified') || '[]'); } catch { /* ignore */ }
    if (!Array.isArray(seen)) seen = [];
    const seenSet = new Set(seen);
    const fresh = all().filter((r) => {
      if (r.memberId !== p.id || !r.updatedAt || r.updatedAt <= since || seenSet.has(r.id)) return false;
      if (r.kind === 'answer') return r.day === today();
      if (r.kind === 'memory' || r.kind === 'story') return true;
      if (r.kind === 'game') return true;
      if (r.kind === 'note') return r.payload?.updatedBy === p.id;
      return false;
    });
    if (!fresh.length) {
      try { localStorage.setItem('na:joyNotifySince', String(Date.now())); } catch { /* ignore */ }
      return;
    }
    const latest = fresh.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))[0];
    const body = latest.kind === 'answer'
      ? `${p.name} answered today’s question.`
      : latest.kind === 'memory'
        ? `${p.name} added a memory.`
        : latest.kind === 'story'
          ? `${p.name} left you a little note.`
          : latest.kind === 'game'
            ? `${p.name} started a little game.`
            : `${p.name} changed a shared note.`;
    try {
      const ids = [...seen, ...fresh.map((r) => r.id)].slice(-200);
      localStorage.setItem('na:joyNotified', JSON.stringify(ids));
      localStorage.setItem('na:joyNotifySince', String(Date.now()));
    } catch { /* ignore */ }
    await notify('A little joy', body, `joy-${latest.id}`);
  }

  function reminderTick() {
    if (!S.ready || !S.members.length) return;
    const s = joySettings();
    if (!s.anniversary || !s.notify) return;
    const p = partner();
    if (!p) return;
    if (answerFor(who()?.id, today())) return;
    const now = new Date();
    const [h, m] = String(s.dailyTime || '20:30').split(':').map(Number);
    if (now.getHours() * 60 + now.getMinutes() < h * 60 + m) return;
    if (localStorage.getItem('na:joyReminded') === today()) return;
    try { localStorage.setItem('na:joyReminded', today()); } catch { /* ignore */ }
    notify('A little question', 'Today’s question is waiting for you.', `joy-remind-${today()}`);
  }

  /* ------------------------------------------------------------
     Geocoding and file helpers
     ------------------------------------------------------------ */
  async function geocode(query) {
    const q = String(query || '').trim();
    if (!q) return null;
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`);
      const data = await res.json();
      const hit = data.results?.[0];
      if (!hit) return null;
      return {
        name: hit.name, place: hit.name, lat: hit.latitude, lng: hit.longitude,
        country: hit.country || '', admin1: hit.admin1 || '',
      };
    } catch {
      return null;
    }
  }

  function compressImage(file, max = 1200, quality = 0.72) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement('canvas');
          c.width = Math.max(1, Math.round(img.width * scale));
          c.height = Math.max(1, Math.round(img.height * scale));
          const x = c.getContext('2d');
          x.drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function renderPlaceResults() {
    const box = document.querySelector('[data-place-results]');
    if (!box) return;
    if (!J.placeResults.length) { box.innerHTML = ''; return; }
    box.innerHTML = J.placeResults.map((r, i) => `<button type="button" class="joy-place-hit" data-act="joy" data-joy-act="place-pick" data-index="${i}"><b>${esc(r.name)}</b><small>${esc([r.admin1, r.country].filter(Boolean).join(' · '))}</small></button>`).join('');
  }

  async function searchPlaces(q) {
    const hit = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`).then((r) => r.json()).catch(() => null);
    J.placeResults = (hit?.results || []).map((r) => ({ name: r.name, place: r.name, lat: r.latitude, lng: r.longitude, country: r.country, admin1: r.admin1 }));
    renderPlaceResults();
  }

  /* ------------------------------------------------------------
     Actions
     ------------------------------------------------------------ */
  const A = {
    exit: () => { closeSheet(true); closeStage(true); go('home'); },
    begin: () => openIntro(),
    settings: () => openJoySettings(),
    tab: (el) => move(el.dataset.joyTab),
    'journal-tab': (el) => { J.journalTab = el.dataset.tab; window.scrollTo(0, 0); refresh(); },
    'cal-move': (el) => {
      const d = Number(el.dataset.d);
      J.calendarMonth = new Date(J.calendarMonth.getFullYear(), J.calendarMonth.getMonth() + d, 1);
      refresh();
    },
    'select-day': (el) => { J.selectedDay = el.dataset.day; refresh(); },
    filter: (el) => { J.cityFilter = el.dataset.filter || ''; refresh(); },
    daily: () => openDaily(),
    'daily-choice': (el) => saveDaily(Number(el.dataset.index), null),
    mood: (el) => setMood(el.dataset.mood),
    'mood-note': () => openMoodNote(),
    streak: () => openStreakSheet(),
    freeze: () => useFreeze(),
    'nudge-daily': () => sendNudge('A question is waiting for you'),
    'nudge-game': () => sendNudge('A little game is waiting for you'),
    'event-new': (el) => openEventEditor(null, el.dataset.day || J.selectedDay || today()),
    'event-edit': (el) => openEventEditor(el.dataset.id),
    'event-emoji': (el) => {
      J.eventDraft.emoji = el.dataset.emoji;
      document.querySelectorAll('[data-joy-act="event-emoji"]').forEach((b) => b.classList.toggle('on', b.dataset.emoji === el.dataset.emoji));
      const prev = document.querySelector('.joy-event-preview span');
      if (prev) prev.textContent = el.dataset.emoji;
    },
    'event-color': (el) => {
      J.eventDraft.color = el.dataset.color;
      document.querySelectorAll('[data-joy-act="event-color"]').forEach((b) => b.classList.toggle('on', b.dataset.color === el.dataset.color));
      const prev = document.querySelector('.joy-event-preview');
      if (prev) prev.style.setProperty('--dot', el.dataset.color);
    },
    'event-delete': (el) => {
      openSheet(`<div class="grip"></div><h3>Delete this day?</h3><p class="sheet-sub">It will disappear for both of you.</p>
        <button class="sheet-opt" data-act="joy" data-joy-act="event-delete-yes" data-id="${el.dataset.id}"><span class="lbl" style="color:var(--miss)">Delete it</span></button>
        <button class="sheet-opt cancel" data-act="close">Keep it</button>`);
    },
    'event-delete-yes': async (el) => {
      await remove(el.dataset.id);
      closeSheet(true);
      closeStage(true);
      refresh();
      toast('Day removed');
    },
    'memory-new': () => openMemoryEditor(),
    'memory-view': (el) => openMemoryDetail(el.dataset.id),
    'memory-edit': (el) => openMemoryEditor(el.dataset.id),
    'memory-delete': (el) => {
      openSheet(`<div class="grip"></div><h3>Delete this memory?</h3><p class="sheet-sub">The photographs and words will be removed for both of you.</p>
        <button class="sheet-opt" data-act="joy" data-joy-act="memory-delete-yes" data-id="${el.dataset.id}"><span class="lbl" style="color:var(--miss)">Delete memory</span></button>
        <button class="sheet-opt cancel" data-act="close">Keep it</button>`);
    },
    'memory-delete-yes': async (el) => { await removeMemory(el.dataset.id); },
    'memory-photo-remove': (el) => {
      const i = Number(el.dataset.index);
      J.draftPhotos.splice(i, 1);
      const strip = document.querySelector('[data-photo-strip]');
      if (strip) strip.outerHTML = photoStripHTML();
    },
    'memory-emoji': (el) => {
      J.memoryDraft.emoji = el.dataset.emoji;
      document.querySelectorAll('[data-joy-act="memory-emoji"]').forEach((b) => b.classList.toggle('on', b.dataset.emoji === el.dataset.emoji));
    },
    'place-pick': (el) => {
      const r = J.placeResults[Number(el.dataset.index)];
      if (!r) return;
      const form = document.querySelector('form[data-form="joy-memory"]');
      if (!form) return;
      form.querySelector('[name="place"]').value = [r.name, r.admin1, r.country].filter(Boolean).join(', ');
      form.querySelector('[name="lat"]').value = r.lat;
      form.querySelector('[name="lng"]').value = r.lng;
      form.querySelector('[name="country"]').value = r.country || '';
      J.placeResults = [];
      renderPlaceResults();
    },
    'place-me': () => {
      if (!navigator.geolocation) return toast('Location is unavailable here');
      toast('Finding you…');
      navigator.geolocation.getCurrentPosition((pos) => {
        const form = document.querySelector('form[data-form="joy-memory"]');
        if (!form) return;
        form.querySelector('[name="lat"]').value = pos.coords.latitude;
        form.querySelector('[name="lng"]').value = pos.coords.longitude;
        form.querySelector('[name="place"]').value = 'Current location';
        form.querySelector('[name="country"]').value = '';
        toast('Location added');
      }, () => toast('Location was not allowed'), { enableHighAccuracy: false, timeout: 8000 });
    },
    'note-new': () => openNoteEditor(),
    'note-edit': (el) => openNoteEditor(el.dataset.id),
    'note-toggle': (el) => toggleNote(el.dataset.note, el.dataset.item),
    'note-cat': (el) => {
      J.noteDraft.category = el.dataset.cat;
      const form = document.querySelector('form[data-form="joy-note"]');
      if (form) form.querySelector('[name="category"]').value = el.dataset.cat;
      document.querySelectorAll('[data-joy-act="note-cat"]').forEach((b) => b.classList.toggle('on', b.dataset.cat === el.dataset.cat));
    },
    'note-delete': (el) => {
      openSheet(`<div class="grip"></div><h3>Delete this note?</h3><p class="sheet-sub">Both of you will lose it.</p>
        <button class="sheet-opt" data-act="joy" data-joy-act="note-delete-yes" data-id="${el.dataset.id}"><span class="lbl" style="color:var(--miss)">Delete note</span></button>
        <button class="sheet-opt cancel" data-act="close">Keep it</button>`);
    },
    'note-delete-yes': async (el) => { await remove(el.dataset.id); closeSheet(true); closeStage(true); refresh(); toast('Note removed'); },
    'story-new': () => openStoryComposer(),
    'story-view': (el) => openStoryView(el.dataset.id),
    'story-delete': (el) => {
      openSheet(`<div class="grip"></div><h3>Delete this note?</h3><p class="sheet-sub">It will disappear from your little world.</p>
        <button class="sheet-opt" data-act="joy" data-joy-act="story-delete-yes" data-id="${el.dataset.id}"><span class="lbl" style="color:var(--miss)">Delete note</span></button>
        <button class="sheet-opt cancel" data-act="close">Keep it</button>`);
    },
    'story-delete-yes': async (el) => { await remove(el.dataset.id); closeSheet(true); closeStage(true); refresh(); toast('Note removed'); },
    'doodle-color': (el) => {
      if (J.doodle) J.doodle.color = el.dataset.color;
      document.querySelectorAll('[data-joy-act="doodle-color"]').forEach((b) => b.classList.toggle('on', b.dataset.color === el.dataset.color));
    },
    'doodle-clear': () => {
      if (!J.doodle) return;
      const { ctx, canvas } = J.doodle;
      ctx.fillStyle = '#FFF8F2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      J.doodleDirty = false;
    },
    'game-new': (el) => startGame(el.dataset.game),
    topic: (el) => startTopic(el.dataset.cat),
    session: (el) => openSession(el.dataset.id),
    'game-choice': (el) => {
      if (el.dataset.person) answerGame({ person: el.dataset.person });
      else answerGame({ choice: Number(el.dataset.value) });
    },
    'game-skip': () => answerGame({ skipped: true }),
    replay: (el) => { const game = el.dataset.game; if (game === 'topic' && el.dataset.cat) startTopic(el.dataset.cat); else startGame(game); },
    chat: (el) => openChat(el.dataset.thread, el.dataset.title),
    'chat-quick': (el) => sendChat(el.dataset.thread, el.dataset.text),
    widget: (el) => openWidget(el.dataset.widget),
    'share-widget': () => shareWidgetImage(J.widgetUrl),
    'save-widget': () => downloadWidget(J.widgetUrl),
    city: (el) => openCitySheet(el.dataset.member),
    'city-me': () => {
      if (!navigator.geolocation) return toast('Location is unavailable here');
      toast('Finding you…');
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const form = document.querySelector('form[data-form="joy-city"]');
        if (!form) return;
        const place = await geocode(`${pos.coords.latitude},${pos.coords.longitude}`);
        form.querySelector('[name="place"]').value = place?.name || 'Current location';
        form.dataset.lat = pos.coords.latitude;
        form.dataset.lng = pos.coords.longitude;
        form.dataset.country = place?.country || '';
        toast('Location added — save it');
      }, () => toast('Location was not allowed'), { enableHighAccuracy: false, timeout: 8000 });
    },
    cover: async (el) => { await saveSettings({ cover: el.dataset.cover }); refresh(); closeSheet(true); openJoySettings(); toast('Cover changed'); },
    'notify-toggle': async () => {
      const s = joySettings();
      await saveSettings({ notify: !s.notify });
      closeSheet(true);
      openJoySettings();
      toast(!s.notify ? 'A gentle reminder is on' : 'Reminder off');
    },
    'intro-cover': (el) => {
      J.introCover = el.dataset.cover;
      const form = document.querySelector('form[data-form="joy-intro"]');
      if (form) form.querySelector('[name="cover"]').value = J.introCover;
      document.querySelectorAll('[data-joy-act="intro-cover"]').forEach((b) => b.classList.toggle('on', b.dataset.cover === J.introCover));
    },
    reset: () => {
      openSheet(`<div class="grip"></div><h3>Reset Halal Couple?</h3><p class="sheet-sub">Every question, game, mood, memory and note in this little world will be removed for both of you. N&amp;A’s prayers, plans and reviews stay exactly where they are.</p>
        <button class="sheet-opt" data-act="joy" data-joy-act="reset-yes"><span class="lbl" style="color:var(--miss)">Yes, start the little world again</span></button>
        <button class="sheet-opt cancel" data-act="joy" data-joy-act="reset-no">Keep everything</button>`);
    },
    'reset-no': () => openJoySettings(),
    'reset-yes': () => resetJoy(),
    'stage-close': () => requestCloseStage(),
    'confirm-keep': () => { const fn = J.confirmKeep; J.confirmKeep = null; J.confirmLeave = null; if (fn) fn(); },
    'confirm-leave': () => { const fn = J.confirmLeave; J.confirmKeep = null; J.confirmLeave = null; if (fn) fn(); else closeStage(); },
  };

  function action(name, el) {
    const fn = A[name];
    if (!fn) {
      console.warn('Unknown joy action', name);
      return;
    }
    fn(el);
  }

  async function setMood(id) {
    const m = who();
    if (!m) return;
    const mood = moodOf(id);
    const existing = moodFor(m.id, today());
    await upsert({
      id: `mood|${m.id}|${today()}`, kind: 'mood', memberId: m.id, day: today(),
      payload: { mood: id, note: existing?.payload?.note || '', at: Date.now() },
    });
    haptic(8);
    refresh();
    toast(mood ? `Feeling ${mood.label.toLowerCase()}` : 'Mood saved');
  }

  async function saveCity(data) {
    const memberId = data.member;
    const q = String(data.place || '').trim();
    if (!q) return toast('Type a place first');
    const form = document.querySelector('form[data-form="joy-city"]');
    let lat = Number(form?.dataset.lat);
    let lng = Number(form?.dataset.lng);
    let country = form?.dataset.country || '';
    let placeName = q;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      const hit = await geocode(q);
      if (!hit) return toast('I could not find that place');
      lat = hit.lat;
      lng = hit.lng;
      country = hit.country;
      placeName = [hit.name, hit.admin1, hit.country].filter(Boolean).join(', ');
    }
    await upsert({ id: `place|${memberId}`, kind: 'place', memberId, payload: { place: placeName, lat, lng, country, at: Date.now() } });
    closeSheet(true);
    refresh();
    toast('Place saved');
  }

  async function resetJoy() {
    closeSheet(true);
    closeStage(true);
    for (const row of [...all()]) {
      await db.del('joy', row.id);
    }
    S.joy = [];
    J.dirty = false;
    J.tab = 'today';
    J.journalTab = 'memories';
    try {
      localStorage.removeItem('na:joyNotifySince');
      localStorage.removeItem('na:joyNotified');
      localStorage.removeItem('na:joyReminded');
    } catch { /* ignore */ }
    closeSheet(true);
    closeStage(true);
    refresh();
    toast('A fresh little world');
  }

  /* ------------------------------------------------------------
     Forms
     ------------------------------------------------------------ */
  async function form(kind, data, formEl) {
    if (kind === 'joy-intro') {
      const anniversary = data.anniversary || today();
      await saveSettings({ anniversary, cover: data.cover || J.introCover || 'preset:rose' });
      markNotifyStart();
      closeStage(true);
      refresh();
      toast('Your little world is open');
      return;
    }
    if (kind === 'joy-daily-text') {
      await saveDaily(null, data.text);
      return;
    }
    if (kind === 'joy-game-text') {
      await answerGame({ text: String(data.text || '').trim() });
      return;
    }
    if (kind === 'joy-game-photo') {
      if (!J.game?.photo) return toast('Choose a photo first');
      await answerGame({ photo: J.game.photo });
      return;
    }
    if (kind === 'joy-memory') {
      await saveMemory(data, formEl);
      return;
    }
    if (kind === 'joy-event') {
      await saveEvent(data);
      return;
    }
    if (kind === 'joy-note') {
      await saveNote(data);
      return;
    }
    if (kind === 'joy-story') {
      const text = String(data.text || '').trim();
      let drawing = '';
      if (J.doodleDirty && J.doodle) {
        const c = document.createElement('canvas');
        c.width = J.doodle.canvas.width;
        c.height = J.doodle.canvas.height;
        const x = c.getContext('2d');
        x.fillStyle = '#FFF8F2';
        x.fillRect(0, 0, c.width, c.height);
        x.drawImage(J.doodle.canvas, 0, 0);
        drawing = c.toDataURL('image/jpeg', 0.82);
      }
      if (!text && !drawing) return toast('Write or draw something first');
      await upsert({
        id: `story|${uid()}`, kind: 'story', memberId: who()?.id, day: today(),
        payload: { text, drawing, at: Date.now() },
      });
      closeStage(true);
      refresh();
      toast('Note sent');
      return;
    }
    if (kind === 'joy-chat') {
      await sendChat(data.thread, data.text);
      formEl.querySelector('[name="text"]').value = '';
      formEl.querySelector('[name="text"]').focus();
      return;
    }
    if (kind === 'joy-city') {
      await saveCity(data);
      return;
    }
    if (kind === 'joy-settings-date') {
      await saveSettings({ anniversary: data.anniversary || today() });
      closeSheet(true);
      refresh();
      toast('Our date is set');
      return;
    }
    if (kind === 'joy-settings-time') {
      await saveSettings({ dailyTime: data.time || '20:30' });
      closeSheet(true);
      refresh();
      toast('Reminder time saved');
      return;
    }
    if (kind === 'joy-mood-note') {
      const m = who();
      const cur = moodFor(m?.id, today());
      if (!cur) return;
      cur.payload = { ...cur.payload, note: String(data.note || '').trim().slice(0, 180), at: Date.now() };
      await upsert(cur);
      closeSheet(true);
      refresh();
      toast('Word saved');
    }
  }

  /* ------------------------------------------------------------
     File changes & place search input
     ------------------------------------------------------------ */
  async function change(e) {
    const kind = e.target.dataset.joyFile;
    if (!kind) return;
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    if (kind === 'memory') {
      for (const file of files) {
        if ((J.draftPhotos || []).length >= 3) { toast('Three photos is the little limit'); break; }
        try {
          const data = await compressImage(file, 1100, 0.72);
          J.draftPhotos.push(data);
        } catch { toast('That photo could not be read'); }
      }
      const strip = document.querySelector('[data-photo-strip]');
      if (strip) strip.outerHTML = photoStripHTML();
      e.target.value = '';
      return;
    }
    if (kind === 'cover') {
      try {
        const data = await compressImage(files[0], 1600, 0.76);
        await saveSettings({ cover: data });
        refresh();
        closeSheet(true);
        openJoySettings();
        toast('Cover changed');
      } catch { toast('That photo could not be read'); }
      e.target.value = '';
      return;
    }
    if (kind === 'game-photo') {
      try {
        const data = await compressImage(files[0], 1000, 0.72);
        J.game.photo = data;
        const label = document.querySelector('[data-photo-preview="game"]');
        if (label) {
          label.innerHTML = `<img src="${data}" alt=""><input type="file" accept="image/*" data-joy-file="game-photo">`;
        }
        const btn = document.querySelector('form[data-form="joy-game-photo"] button[type="submit"]');
        if (btn) btn.disabled = false;
      } catch { toast('That photo could not be read'); }
      e.target.value = '';
    }
  }

  function input(e) {
    if (e.target.dataset.joyInput !== 'place') return;
    const q = e.target.value.trim();
    clearTimeout(J.placeTimer);
    if (q.length < 2) { J.placeResults = []; renderPlaceResults(); return; }
    J.placeTimer = setTimeout(() => searchPlaces(q), 380);
  }

  document.addEventListener('change', (e) => {
    if (e.target.matches?.('[data-joy-file]')) change(e);
  });
  document.addEventListener('input', (e) => {
    if (e.target.matches?.('[data-joy-input]')) input(e);
  });

  setInterval(reminderTick, 60 * 1000);

  /* __PART2C__ */

  return {
    view,
    action,
    form,
    change,
    input,
    remote,
    entry: () => {
      if (!J.notifyStart) markNotifyStart();
    },
    resetLocal: () => {
      J.tab = 'today';
      J.journalTab = 'memories';
      J.dirty = false;
    },
  };
}
