/* ============================================================
   Storage — IndexedDB, versioned, additive-only migrations.
   A shipped update must never cost a memory: nothing here
   deletes or rewrites a record unless a migration says so,
   and a failed migration rolls back to its snapshot.
   ============================================================ */

const DB_NAME = 'na-app';
const DB_VERSION = 4;

export const SCHEMA_VERSION = 1;

const STORES = [
  ['meta', { keyPath: 'key' }],
  ['members', { keyPath: 'id' }],
  ['prayers', { keyPath: 'id', indexes: [['day', 'day'], ['memberId', 'memberId']] }],
  ['plan', { keyPath: 'id', indexes: [['day', 'day'], ['memberId', 'memberId']] }],
  ['reviews', { keyPath: 'id', indexes: [['day', 'day'], ['memberId', 'memberId']] }],
  ['reactions', { keyPath: 'id' }],
  ['goals', { keyPath: 'id', indexes: [['memberId', 'memberId']] }],
  ['cycles', { keyPath: 'id', indexes: [['day', 'day'], ['memberId', 'memberId']] }],
  ['nudges', { keyPath: 'id', indexes: [['to', 'to']] }],
  ['snapshots', { keyPath: 'key' }],
];

/**
 * Migrations, applied in order. Rules:
 *   - additive only: add stores, add fields, backfill values
 *   - never drop a store, column or record
 *   - each step must be safe to run twice
 * Example (future):
 *   2: async () => { for (const r of await getAll('reviews')) if (!('mood' in r)) await put('reviews', { ...r, mood: null }); },
 */
const MIGRATIONS = {};

let dbp = null;

export function open() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      const tx = req.transaction;
      for (const [name, def] of STORES) {
        let store;
        if (!db.objectStoreNames.contains(name)) {
          store = db.createObjectStore(name, { keyPath: def.keyPath });
        } else {
          store = tx.objectStore(name);
        }
        for (const [idx, path] of def.indexes || []) {
          if (!store.indexNames.contains(idx)) store.createIndex(idx, path);
        }
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('Database is blocked by another tab'));
  });
  return dbp;
}

async function run(storeName, mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let result;
    try {
      result = fn(store);
    } catch (err) {
      reject(err);
      return;
    }
    tx.oncomplete = () => resolve(result && 'result' in result ? result.result : result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('Transaction aborted'));
  });
}

export const getAll = (store) => run(store, 'readonly', (s) => s.getAll()).then((r) => r || []);
export const get = (store, key) => run(store, 'readonly', (s) => s.get(key)).then((r) => r || null);

/* ---- sync hooks -------------------------------------------------
   Every write and delete notifies the sync layer, unless we are
   applying data that came *from* the server (muted), so nothing
   gets echoed back in a loop.
   ---------------------------------------------------------------- */
let hooks = null;
let muteDepth = 0;

export function setHooks(h) { hooks = h; }

export async function mute(fn) {
  muteDepth++;
  try { return await fn(); } finally { muteDepth--; }
}

const notifyWrite = (store, rec) => {
  if (muteDepth || !hooks?.onWrite) return;
  hooks.onWrite(store, rec);
};
const notifyDelete = (store, key) => {
  if (muteDepth || !hooks?.onDelete) return;
  hooks.onDelete(store, key);
};

export async function put(store, rec) {
  const out = await run(store, 'readwrite', (s) => s.put(rec));
  notifyWrite(store, rec);
  return out;
}

export async function del(store, key) {
  const out = await run(store, 'readwrite', (s) => s.delete(key));
  notifyDelete(store, key);
  return out;
}

export const clear = (store) => run(store, 'readwrite', (s) => s.clear());

export async function putMany(store, recs) {
  if (!recs.length) return;
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const s = tx.objectStore(store);
    for (const r of recs) s.put(r);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadAll() {
  const names = STORES.map(([n]) => n).filter((n) => n !== 'snapshots');
  const rows = await Promise.all(names.map((n) => getAll(n)));
  const bag = Object.fromEntries(names.map((n, i) => [n, rows[i] || []]));
  return {
    meta: Object.fromEntries((bag.meta || []).map((m) => [m.key, m])),
    members: bag.members,
    prayers: bag.prayers,
    plan: bag.plan,
    reviews: bag.reviews,
    reactions: bag.reactions,
    goals: bag.goals,
    cycles: bag.cycles,
    nudges: bag.nudges,
  };
}

export async function dump() {
  const stores = {};
  for (const [name] of STORES) {
    if (name === 'snapshots') continue;
    stores[name] = await getAll(name);
  }
  return { app: 'N&A', schemaVersion: SCHEMA_VERSION, exportedAt: new Date().toISOString(), stores };
}

/** Replace every record with the contents of a dump. Used by import + rollback. */
export async function restore(data) {
  if (!data || !data.stores) throw new Error('That file is not an N&A backup');
  const db = await open();
  const names = STORES.map(([n]) => n).filter((n) => n !== 'snapshots');
  await new Promise((resolve, reject) => {
    const tx = db.transaction(names, 'readwrite');
    for (const name of names) {
      const s = tx.objectStore(name);
      s.clear();
      const rows = data.stores[name];
      if (Array.isArray(rows)) for (const row of rows) s.put(row);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Bring the database up to SCHEMA_VERSION.
 * Snapshot first; on any failure restore and rethrow so the app
 * keeps running on the previous data rather than a half-upgrade.
 */
export async function ensureSchema() {
  const metaRow = await get('meta', 'app');
  const from = metaRow?.schemaVersion ?? 0;

  if (!metaRow) {
    await put('meta', {
      key: 'app',
      schemaVersion: SCHEMA_VERSION,
      createdAt: Date.now(),
      installedAt: Date.now(),
    });
    return { from: 0, to: SCHEMA_VERSION, ran: false };
  }

  if (from >= SCHEMA_VERSION) return { from, to: SCHEMA_VERSION, ran: false };

  const snapshot = await dump();
  const key = `pre-v${SCHEMA_VERSION}-${Date.now()}`;
  await put('snapshots', { key, schemaVersion: from, at: Date.now(), data: snapshot });

  try {
    for (let v = from + 1; v <= SCHEMA_VERSION; v++) {
      const step = MIGRATIONS[v];
      if (step) await step();
    }
    await put('meta', { ...metaRow, key: 'app', schemaVersion: SCHEMA_VERSION });
    return { from, to: SCHEMA_VERSION, ran: true };
  } catch (err) {
    console.error('Migration failed — restoring snapshot', err);
    await restore(snapshot);
    throw err;
  }
}

export async function saveMeta(key, value) {
  const row = (await get('meta', key)) || { key };
  await put('meta', { ...row, ...value, key });
}

export async function wipeUserData() {
  for (const name of ['members', 'prayers', 'plan', 'reviews', 'reactions', 'goals', 'cycles', 'nudges']) {
    await clear(name);
  }
  for (const key of ['app', 'seeded', 'settings', 'sync']) {
    await del('meta', key);
  }
}
