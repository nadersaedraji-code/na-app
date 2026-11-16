/* ============================================================
   Sync — two phones, one couple, no accounts.
   Every row travels as JSON; the server only stamps updated_at.
   Works against the local dev server (/api/*) or Supabase RPCs;
   the wire format is identical, so switching is a config change.
   ============================================================ */

import * as db from './db.js';

const SYNCED = new Set(['prayers', 'plan', 'reviews', 'reactions', 'members', 'goals', 'cycles', 'nudges', 'joy']);
const QUEUE_KEY = 'na:queue';

let cfg = null;            // { mode, key, base?, url?, apikey?, lastSync? }
let lastSync = null;
let pollTimer = null;
let pushTimer = null;
let busy = false;
let queue = emptyQueue();
let onChange = null;
let onStatus = null;
let state = 'off';

function emptyQueue() {
  return {
    prayers: new Map(), plan: new Map(), reviews: new Map(),
    reactions: new Map(), members: new Map(), goals: new Map(), cycles: new Map(), nudges: new Map(), joy: new Map(), deletes: new Map(),
  };
}

/* ---------- config ---------- */
export function config() { return cfg; }
export function isOn() { return !!cfg; }
export function status() { return state; }
export function lastSyncedAt() { return lastSync; }

export async function load() {
  const row = await db.get('meta', 'sync');
  const value = row?.value || null;
  if (value && value.key) {
    cfg = { ...value };
    lastSync = value.lastSync || null;
    restoreQueue();
  }
  return cfg;
}

export async function setConfig(next) {
  cfg = { ...next, lastSync: cfg?.lastSync || null };
  await db.put('meta', { key: 'sync', value: cfg });
}

export async function stop() {
  cfg = null;
  lastSync = null;
  clearInterval(pollTimer);
  pollTimer = null;
  localStorage.removeItem(QUEUE_KEY);
  queue = emptyQueue();
  await db.put('meta', { key: 'sync', value: { key: null, mode: null, lastSync: null } });
  setState('off');
}

/* ---------- wire mapping ---------- */
const iso = (v) => (v ? new Date(v).toISOString() : null);

function toWire(kind, r) {
  if (kind === 'prayers') {
    return { id: r.id, member_id: r.memberId, day: r.day, prayer: r.key, status: r.status, logged_at: iso(r.loggedAt) };
  }
  if (kind === 'plan') {
    return {
      id: r.id, member_id: r.memberId, day: r.day, title: r.title,
      time_label: r.timeLabel || '', priority: r.priority || 'normal',
      done: !!r.done, done_at: iso(r.doneAt), position: r.position || 0,
      created_at: iso(r.createdAt), progress: r.progress || (r.done ? 'done' : 'todo'),
    };
  }
  if (kind === 'reviews') {
    return {
      id: r.id, member_id: r.memberId, day: r.day, wins: r.wins || '',
      productivity: r.productivity ?? null, happiness: r.happiness ?? null,
      highlight: r.highlight || '', notes: r.notes || [],
    };
  }
  if (kind === 'reactions') {
    return { id: r.id, from_member: r.from, target_type: r.targetType, target_id: r.targetId, emoji: r.emoji };
  }
  if (kind === 'members') {
    return { id: r.id, name: r.name, color: r.color, avatar: r.avatar, tz: r.tz };
  }
  if (kind === 'goals') {
    return {
      id: r.id, member_id: r.memberId, scope: r.scope, title: r.title,
      progress: r.progress || 0, created_at: iso(r.createdAt), completed_at: iso(r.completedAt),
    };
  }
  if (kind === 'cycles') {
    return { id: r.id, member_id: r.memberId, day: r.day };
  }
  if (kind === 'nudges') {
    return { id: r.id, from_member: r.from, to_member: r.to, created_at: iso(r.createdAt), seen_at: iso(r.seenAt) };
  }
  if (kind === 'joy') {
    return {
      id: r.id, member_id: r.memberId || null, kind: r.kind, day: r.day || null,
      payload: r.payload || {},
    };
  }
  return null;
}

const when = (v) => (v ? new Date(v).getTime() : null);

function fromWire(kind, w) {
  const base = { updatedAt: when(w.updated_at) || Date.now() };
  if (kind === 'prayers') {
    return { ...base, id: w.id, memberId: w.member_id, day: w.day, key: w.prayer, status: w.status, loggedAt: when(w.logged_at) };
  }
  if (kind === 'plan') {
    return {
      ...base, id: w.id, memberId: w.member_id, day: w.day, title: w.title,
      timeLabel: w.time_label || '', priority: w.priority || 'normal',
      done: !!w.done, doneAt: when(w.done_at), position: w.position || 0,
      createdAt: when(w.created_at), demo: false,
      progress: w.progress || (w.done ? 'done' : 'todo'),
    };
  }
  if (kind === 'reviews') {
    return {
      ...base, id: w.id, memberId: w.member_id, day: w.day, wins: w.wins || '',
      productivity: w.productivity ?? null, happiness: w.happiness ?? null,
      highlight: w.highlight || '', notes: w.notes || [], demo: false,
    };
  }
  if (kind === 'reactions') {
    return {
      ...base, id: w.id, from: w.from_member, targetType: w.target_type,
      targetId: w.target_id, emoji: w.emoji, day: w.day,
      createdAt: when(w.created_at) || when(w.updated_at) || Date.now(),
    };
  }
  if (kind === 'members') {
    return { ...base, id: w.id, name: w.name || w.display_name, color: w.color, avatar: w.avatar, tz: w.tz, joinedAt: when(w.updated_at) || Date.now(), remote: true };
  }
  if (kind === 'goals') {
    return {
      ...base, id: w.id, memberId: w.member_id, scope: w.scope || 'main', title: w.title,
      progress: w.progress || 0, createdAt: when(w.created_at), completedAt: when(w.completed_at), demo: false,
    };
  }
  if (kind === 'cycles') {
    return { ...base, id: w.id, memberId: w.member_id, day: w.day, createdAt: when(w.created_at) || Date.now() };
  }
  if (kind === 'nudges') {
    return { ...base, id: w.id, from: w.from_member, to: w.to_member, createdAt: when(w.created_at), seenAt: when(w.seen_at) };
  }
  if (kind === 'joy') {
    return {
      ...base, id: w.id, memberId: w.member_id || null, kind: w.kind,
      day: w.day || null, payload: w.payload || {},
      createdAt: when(w.created_at) || base.updatedAt,
    };
  }
  return null;
}

/* ---------- transport ---------- */
async function rpc(name, body) {
  const url = cfg.mode === 'supabase'
    ? `${(cfg.url || '').replace(/\/+$/, '')}/rest/v1/rpc/${name}`
    : `/api/${name.replace(/^na_/, '')}`;

  const headers = { 'Content-Type': 'application/json' };
  if (cfg.mode === 'supabase') {
    headers.apikey = cfg.apikey;
    headers.Authorization = `Bearer ${cfg.apikey}`;
  }

  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${name}: ${res.status} ${(await res.text()).slice(0, 180)}`);
  return res.json();
}

/* ---------- queue ---------- */
function persistQueue() {
  const plain = { deletes: [...queue.deletes.values()] };
  for (const k of ['prayers', 'plan', 'reviews', 'reactions', 'members', 'goals', 'cycles', 'nudges', 'joy']) {
    plain[k] = [...queue[k].values()];
  }
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(plain)); } catch { /* full/private */ }
}

function restoreQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return;
    const plain = JSON.parse(raw);
    for (const k of ['prayers', 'plan', 'reviews', 'reactions', 'members', 'goals', 'cycles', 'nudges', 'joy']) {
      for (const row of plain[k] || []) queue[k].set(row.id, row);
    }
    for (const d of plain.deletes || []) queue.deletes.set(`${d.kind}:${d.id}`, d);
  } catch { /* ignore */ }
}

export function queueWrite(store, rec) {
  if (!cfg || !SYNCED.has(store) || !rec?.id) return;
  if (rec.demo) return;                 // sample history never travels
  if (store === 'members' && rec.name) { /* still synced, for names */ }
  queue[store].set(rec.id, rec);
  queue.deletes.delete(`${store}:${rec.id}`);
  persistQueue();
  schedulePush();
}

export function queueDelete(store, id) {
  if (!cfg || !SYNCED.has(store) || !id) return;
  queue[store].delete(id);
  queue.deletes.set(`${store}:${id}`, { kind: store, id });
  persistQueue();
  schedulePush();
}

function schedulePush() {
  clearTimeout(pushTimer);
  pushTimer = setTimeout(flush, 500);
}

function buildPayload() {
  const payload = {
    prayers: [...queue.prayers.values()].map((r) => toWire('prayers', r)),
    plan: [...queue.plan.values()].map((r) => toWire('plan', r)),
    reviews: [...queue.reviews.values()].map((r) => toWire('reviews', r)),
    reactions: [...queue.reactions.values()].map((r) => toWire('reactions', r)),
    members: [...queue.members.values()].map((r) => toWire('members', r)),
    goals: [...queue.goals.values()].map((r) => toWire('goals', r)),
    cycles: [...queue.cycles.values()].map((r) => toWire('cycles', r)),
    nudges: [...queue.nudges.values()].map((r) => toWire('nudges', r)),
    joy: [...queue.joy.values()].map((r) => toWire('joy', r)),
    deletes: [...queue.deletes.values()],
  };
  const empty = !payload.prayers.length && !payload.plan.length && !payload.reviews.length
    && !payload.reactions.length && !payload.members.length && !payload.goals.length
    && !payload.cycles.length && !payload.nudges.length && !payload.joy.length && !payload.deletes.length;
  return empty ? null : payload;
}

export async function flush() {
  if (!cfg || busy || state === 'gone') return;
  const payload = buildPayload();
  if (!payload) return;

  busy = true;
  setState('syncing');
  try {
    await rpc('na_push', { p_key: cfg.key, p_data: payload });
    // only clear what we actually sent
    for (const k of ['prayers', 'plan', 'reviews', 'reactions', 'members', 'goals', 'cycles', 'nudges', 'joy']) {
      for (const row of payload[k]) queue[k].delete(row.id);
    }
    for (const d of payload.deletes) queue.deletes.delete(`${d.kind}:${d.id}`);
    persistQueue();
    setState('live');
    lastSync = new Date().toISOString();
  } catch (err) {
    console.warn('push failed', err.message);
    setState('error');
  } finally {
    busy = false;
  }
}

/* ---------- pull ---------- */
export async function pull() {
  if (!cfg) return null;
  setState('syncing');
  try {
    const since = lastSync || '1970-01-01T00:00:00.000Z';
    const data = await rpc('na_pull', { p_key: cfg.key, p_since: since });

    await db.mute(async () => {
      for (const kind of ['members', 'prayers', 'plan', 'reviews', 'reactions', 'goals', 'cycles', 'nudges', 'joy']) {
        for (const w of data[kind] || []) {
          const row = fromWire(kind, w);
          if (row) await db.put(kind, row);
        }
      }
      for (const d of data.deletes || []) {
        if (SYNCED.has(d.kind)) await db.del(d.kind, d.id);
      }
    });

    lastSync = data.server_time || new Date().toISOString();
    await db.put('meta', { key: 'sync', value: { ...cfg, lastSync } });
    setState('live');
    onChange?.();
    return data;
  } catch (err) {
    console.warn('pull failed', err.message);
    if (String(err.message).includes('400')) {
      // The space no longer exists on the server. Stop knocking.
      setState('gone');
      clearInterval(pollTimer);
      pollTimer = null;
    } else {
      setState('error');
    }
    return null;
  }
}

/* ---------- lifecycle ---------- */
function setState(next) {
  if (state === next) return;
  state = next;
  onStatus?.(next);
}

export async function begin(member) {
  if (!cfg) return;

  await rpc('na_join', {
    p_key: cfg.key,
    p_member: { id: member.id, name: member.name, color: member.color, avatar: member.avatar, tz: member.tz },
  });

  await pull();

  // Anything already on this device (that isn't sample data) goes up once.
  for (const store of ['prayers', 'plan', 'reviews', 'reactions', 'goals', 'cycles', 'nudges', 'joy']) {
    for (const row of await db.getAll(store)) {
      if (!row.demo) queue[store].set(row.id, row);
    }
  }
  queue.members.set(member.id, member);
  persistQueue();
  await flush();
  startPolling();
}

export function startPolling() {
  clearInterval(pollTimer);
  pollTimer = setInterval(() => {
    if (document.visibilityState === 'visible') pull();
  }, 3000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') pull();
  });
  flush();
}

export function attach(handlers) {
  onChange = handlers.onChange || null;
  onStatus = handlers.onStatus || null;
}

export function isBusy() { return busy; }

/** The backend this device will talk to. */
export function backend() {
  if (cfg && cfg.mode === 'supabase' && cfg.url) return { mode: 'supabase', url: cfg.url, apikey: cfg.apikey };
  if (cfg && cfg.mode === 'local') return { mode: 'local' };
  return null;
}

/** Is a sync backend actually reachable? */
export async function probe(candidate = cfg) {
  try {
    if (candidate?.mode === 'supabase') {
      const base = (candidate.url || '').replace(/\/+$/, '');
      const res = await fetch(`${base}/rest/v1/`, {
        headers: { apikey: candidate.apikey, Authorization: `Bearer ${candidate.apikey}` },
      });
      return res.ok || res.status === 401 || res.status === 404;
    }
    const res = await fetch('/api/ping', { method: 'POST' });
    return res.ok;
  } catch {
    return false;
  }
}
