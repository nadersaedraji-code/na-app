/* ============================================================
   Service worker — code changes, never data.
   Strategy: network-first so a new build is picked up the
   moment it's online; cache is the offline fallback only.
   User data lives in IndexedDB and is never touched here.
   ============================================================ */

const VERSION = '1.9.1';
const CACHE = `na-shell-${VERSION}`;

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './db.js',
  './prayertimes.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await Promise.all(
        ASSETS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => {
            /* a single missing asset must not block the install */
          })
        )
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('na-shell-') && k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
      // Tell every open window which build is now live, so the page can
      // refresh itself in place and confirm the update with one quiet toast.
      const clients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
      for (const client of clients) client.postMessage({ type: 'NA_ACTIVATED', version: VERSION });
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        const fresh = await fetch(req, { cache: 'no-store' });
        if (fresh && fresh.ok) {
          cache.put(req, fresh.clone());
          return fresh;
        }
        throw new Error(`HTTP ${fresh.status}`);
      } catch {
        const hit = await cache.match(req, { ignoreSearch: true });
        if (hit) return hit;
        if (req.mode === 'navigate') {
          const shell = await cache.match('./index.html');
          if (shell) return shell;
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      }
    })()
  );
});
