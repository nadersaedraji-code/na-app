# N&A

A private, installable app for two people. Five prayers, today's plan, a daily
review, and a calendar of every day you share.

Vanilla JS. No framework, no build step, no dependencies. Data lives in
IndexedDB on the device; the UI never waits on a network.

---

## Run it locally

```bash
cd na-app
python3 -m http.server 4173
```

Open <http://localhost:4173>. On a phone on the same Wi-Fi, use an HTTPS tunnel
(see *Getting it on the phones*) — installability requires a secure context.

## Files

| File | Purpose |
|---|---|
| `index.html` | shell — the only page |
| `styles.css` | design tokens + components |
| `app.js` | state, views, sheets, onboarding, update plumbing |
| `db.js` | IndexedDB, versioned schema, additive migrations, snapshots |
| `prayertimes.js` | solar prayer-time maths, calculation methods |
| `sw.js` | service worker — replaces *code* only, never data |
| `manifest.webmanifest` | install identity, icons, colours |
| `icons/` | generated from `tools/make-icons.py` |
| `SPEC.md` | the product spec this was built from |

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
- Every delete is soft and undoable; a full export is one tap away in Settings.

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
