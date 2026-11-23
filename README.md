# N&A

A private, installable app for two people: five daily prayers and a daily
satisfaction/productivity review, each scored out of 10.

The Review tab shows both people’s scores over time, a full day-by-day prayer
history, and a completed-week recap with comparisons to earlier weeks. A prayer
streak counts a day only when all five are on time, at the mosque, or marked
period. The app does not send notifications.

Vanilla JS. No framework, no build step, no dependencies. Data lives in
IndexedDB on the device; the UI never waits on a network.

---

## Run it locally

```bash
cd na-app
node server/sync.mjs          # serves the app AND the sync API on :4173
```

Open <http://localhost:4173>. On a phone on the same Wi-Fi, use an HTTPS tunnel
(see *Getting it on the phones*) — installability requires a secure context.

Two devices on one Mac can be simulated by opening `localhost:4173` and
`127.0.0.1:4173`: different origins, separate storage, same sync server.

## Files

| File | Purpose |
|---|---|
| `index.html` | shell — the only page |
| `styles.css` | design tokens + components |
| `app.js` | state, views, sheets, onboarding, update plumbing |
| `db.js` | IndexedDB, versioned schema, additive migrations, snapshots |
| `prayertimes.js` | solar prayer-time maths, calculation methods |
| `sync.js` | two-phone sync: queue, pull, push, pairing |
| `server/sync.mjs` | dev server + sync API (same shape as Supabase) |
| `supabase/schema.sql` | the cloud schema, one paste into Supabase |
| `sw.js` | service worker — replaces *code* only, never data |
| `manifest.webmanifest` | install identity, icons, colours |
| `icons/` | generated from `tools/make-icons.py` |
| `SPEC.md` | the product spec this was built from |

## Two phones

1. On phone A: **Settings → Connect the other phone → Start a shared space.**
2. It shows a code like `NA-M476-6AMB-EABP-NE3P-BDRS`.
3. On phone B: **Settings → Connect the other phone → I have a code**, type it.
4. Prayers and reviews now move between them within ~3 seconds
   (polling, which is plenty for two people).

The code *is* the credential: 20 random characters, never sent anywhere except
your own database. Deletes travel as tombstones, so nothing resurrects.

The dev server keeps everything in `server/data.json` (gitignored). For a
permanent home, run `supabase/schema.sql` once and switch the config to
`mode: 'supabase'` with the project URL and anon key.

## How updates reach the phones

There is no app store and nothing to re-download.

1. A change is made here and published.
2. On next launch (or when the app returns to the foreground) the service
   worker fetches the new shell in the background.
3. It activates, tells the open page its version, and the page refreshes once —
   preserving the tab you were on — with a single toast: *"Updated to v1.2.0."*

To ship a change:

```bash
node tools/bump.mjs 1.2.0 "What changed, in one sentence"
```

Then publish. The version in `Settings → What's new` proves it landed.

## Your history is never collateral

- Records live in IndexedDB and (once cloud sync is connected) Postgres — never
  in the service worker cache, which only holds code.
- `db.ensureSchema()` snapshots everything before applying a migration, and
  restores the snapshot if a step throws.
- Migrations are additive only. No `DROP`, no `TRUNCATE`, no silent rewrites.
- A full export is one tap away in Settings. Older plans and other records remain
  in storage and backups even though their screens are no longer shown.

## Getting it on the phones

Both platforms install the same URL as a real app.

**Android (Chrome)** — open the URL → ⋮ → *Install app*.
**iPhone (Safari)** — open the URL → Share → *Add to Home Screen*.

### Hosting options

| Option | Cost | Notes |
|---|---|---|
| **GitHub Pages** | free | Point Pages at this folder (or `main` /docs). Stable URL, versioned, best long-term. |
| **Netlify Drop** | free | Drag the folder onto <https://app.netlify.com/drop>. Instant, no CLI. |
| **Cloudflare Pages** | free | Connect a repo, or `wrangler pages deploy`. |
| **Cloudflare quick tunnel** | free, temporary | `cloudflared tunnel --url http://localhost:4173` — perfect for trying it on a phone today, but the URL changes and dies with the laptop. |

## Data

- `Settings → Export a backup` writes a full JSON archive.
- `Settings → Restore from backup` replaces local data after confirmation.
- `Settings → Remove sample history` deletes the starter demo days only.

## Not in this build

Cloud sync between two phones (one free Supabase project turns it on), push
notifications, invite codes, French UI. See `SPEC.md` for the full contract.
