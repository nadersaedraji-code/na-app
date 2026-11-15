/**
 * N&A dev server — serves the app and a tiny sync API on one port.
 *
 *   node server/sync.mjs        (then open http://localhost:4173)
 *
 * The API mirrors the Supabase functions in supabase/schema.sql, so the
 * client cannot tell the difference. This is how you test two devices
 * before a database exists — and what the tunnel exposes.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const DATA = path.join(here, 'data.json');
const PORT = Number(process.env.PORT || 4173);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const EMPTY = { couples: {}, members: [], prayers: [], plan: [], reviews: [], reactions: [], goals: [], tombstones: [] };
let state = load();

function load() {
  try {
    return { ...EMPTY, ...JSON.parse(fs.readFileSync(DATA, 'utf8')) };
  } catch {
    return structuredClone(EMPTY);
  }
}

function save() {
  fs.writeFileSync(DATA, JSON.stringify(state));
}

const send = (res, code, body) => {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body ?? {}));
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 4_000_000) reject(new Error('too large'));
    });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function coupleFor(key) {
  if (!key || key.length < 20) return null;
  if (!state.couples[key]) {
    state.couples[key] = { id: randomUUID(), created_at: new Date().toISOString() };
    save();
  }
  return state.couples[key];
}

/* Reads and writes never create a space. Only a join does — so a phone
   holding a code for a space that was reset cannot resurrect it. */
function findCouple(key) {
  if (!key || key.length < 20) return null;
  return state.couples[key] || null;
}

const upsert = (table, row) => {
  const list = state[table];
  const i = list.findIndex((r) => r.id === row.id);
  if (i >= 0) list[i] = { ...list[i], ...row };
  else list.push(row);
};

function join(body) {
  const couple = coupleFor(body.p_key);
  if (!couple) throw new Error('invalid key');
  const m = body.p_member || {};
  upsert('members', {
    id: m.id,
    couple_id: couple.id,
    name: m.name,
    color: m.color,
    avatar: m.avatar,
    tz: m.tz,
    updated_at: new Date().toISOString(),
  });
  save();
  return { couple_id: couple.id, server_time: new Date().toISOString() };
}

function pull(body) {
  const couple = findCouple(body.p_key);
  if (!couple) throw new Error('invalid key');
  const since = new Date(body.p_since || 0).getTime();

  const changed = (table) =>
    state[table].filter((r) => r.couple_id === couple.id && new Date(r.updated_at).getTime() > since);

  return {
    members: changed('members'),
    prayers: changed('prayers'),
    plan: changed('plan'),
    reviews: changed('reviews'),
    reactions: changed('reactions'),
    goals: changed('goals'),
    deletes: state.tombstones
      .filter((t) => t.couple_id === couple.id && new Date(t.deleted_at).getTime() > since)
      .map((t) => ({ kind: t.kind, id: t.row_id })),
    server_time: new Date().toISOString(),
  };
}

function push(body) {
  const couple = findCouple(body.p_key);
  if (!couple) throw new Error('invalid key');
  const clock = new Date().toISOString();
  const data = body.p_data || {};

  const tables = [
    ['prayers', ['id', 'member_id', 'day', 'prayer', 'status', 'logged_at']],
    ['plan', ['id', 'member_id', 'day', 'title', 'time_label', 'priority', 'done', 'done_at', 'position', 'created_at', 'progress']],
    ['reviews', ['id', 'member_id', 'day', 'wins', 'productivity', 'happiness', 'highlight', 'notes']],
    ['reactions', ['id', 'from_member', 'target_type', 'target_id', 'emoji']],
    ['goals', ['id', 'member_id', 'scope', 'title', 'progress', 'created_at', 'completed_at']],
    ['members', ['id', 'name', 'color', 'avatar', 'tz']],
  ];

  for (const [table, fields] of tables) {
    for (const row of data[table] || []) {
      const clean = { couple_id: couple.id, updated_at: clock };
      for (const f of fields) if (row[f] !== undefined) clean[f] = row[f];
      upsert(table, clean);
    }
  }

  for (const d of data.deletes || []) {
    const key = `${couple.id}:${d.kind}:${d.id}`;
    if (!state.tombstones.some((t) => `${t.couple_id}:${t.kind}:${t.row_id}` === key)) {
      state.tombstones.push({ couple_id: couple.id, kind: d.kind, row_id: d.id, deleted_at: clock });
    } else {
      const t = state.tombstones.find((t) => `${t.couple_id}:${t.kind}:${t.row_id}` === key);
      t.deleted_at = clock;
    }
    const table = d.kind;
    if (state[table]) {
      const row = state[table].find((r) => r.id === d.id && r.couple_id === couple.id);
      if (row) { row.updated_at = clock; row.deleted_at = clock; }
    }
  }

  save();
  return { ok: true, server_time: clock };
}

async function api(req, res, name) {
  try {
    const body = await readBody(req);
    if (name === 'ping') return send(res, 200, { ok: true, mode: 'local' });
    if (name === 'join') return send(res, 200, join(body));
    if (name === 'pull') return send(res, 200, pull(body));
    if (name === 'push') return send(res, 200, push(body));
    return send(res, 404, { error: 'unknown endpoint' });
  } catch (err) {
    return send(res, 400, { error: String(err.message || err) });
  }
}

function serve(req, res, pathname) {
  let rel = decodeURIComponent(pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(root, rel);

  if (!file.startsWith(root)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(buf);
  });
}

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === 'POST' && url.pathname.startsWith('/api/')) {
      api(req, res, url.pathname.slice(5));
      return;
    }
    serve(req, res, url.pathname);
  })
  .listen(PORT, () => {
    console.log(`N&A → http://localhost:${PORT}`);
    console.log(`sync data → server/data.json`);
  });
