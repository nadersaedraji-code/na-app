# N&A — build spec (v2)

A private, installable app for a couple. Two people, two phones (iPhone + Android), one shared life.

---

## 1. Product in one line

**N&A** is a two-person app where each partner tracks their five daily prayers, plans their day, and logs how the day went — each sees the other's progress live, encourages them, and can walk back through any past day.

## 2. Users & access

- Exactly **two members**: N and A, in one shared couple space.
- Invite-only. No public sign-up, no third member, no discovery.
- Phone is primary; Mac is secondary. All three (two phones, one laptop) show the same data.
- Everything either person logs is visible to the other. Nothing is private inside the couple.

## 3. First run — enter your name and you're in

The app must feel like opening a gift, not filing a form.

- **First launch: one screen, one input — your name.** Large type, warm welcome ("Welcome. What should I call you?"), autofocused field, big continue button. Nothing else asked. No password, no email, no account creation, no verification email.
- Immediately after: pick an **accent colour + emoji avatar** (pre-selected defaults, one tap to accept) → land on the Prayer screen. Total time to first use: **under 30 seconds**.
- **Pairing is a separate, optional step.** In Settings → *Invite your partner* generates a short code / link. The second person installs the app, enters their name, pastes the code, and the two spaces merge into one couple. Before pairing, the app is fully usable solo — nothing is blocked behind the partner joining.
- No dead ends: if pairing isn't done yet, the partner column shows a gentle "Waiting for A to join" state with the invite button.
- Returning user never sees onboarding again — the name and device identity live in local storage and survive updates.

## 4. Delivery — an app on both phones, updated from this chat

**Both iPhone and Android must run this as a real app**, from the same URL, one codebase:

| | How it installs | What they get |
|---|---|---|
| **Android** | Chrome → *Install app* (or the in-app "Add to home screen" prompt) | Real icon, own window, splash, no browser bars, full push |
| **iPhone** | Safari → *Share* → *Add to Home Screen* | Same full-screen standalone app, own icon, offline, push on iOS 16.4+ |

- Also installable on Mac (Chrome/Edge) and usable in Safari as a site.
- Custom icon, maskable icon, splash colour, status-bar theming, safe-area handling — it must not look like a bookmarked webpage.

### The update contract (the important part)

- **Modifications requested here land in the app on both phones with no download, no reinstall, no store.** I change the code, publish, and the phones pick it up.
- Mechanism: versioned service worker + cache-busting. On launch (or when the app returns to foreground) it checks for a new build, downloads it quietly in the background, and activates it.
- **Never interrupts you.** The swap happens while you're not mid-action, keeps the tab you were on and your scroll position, and shows a single soft toast: *"Updated to v1.4."* No hard reload, no lost state.
- Version + "last updated" visible in Settings, plus a short "what changed" line, so it's obvious the new build arrived.
- **No native rebuilds.** Nothing in v1 requires an App Store / Play Store submission. (If a true store app is ever wanted, the exit path is a Capacitor wrapper around this same codebase — noted, not built.)
- Offline-first: the app opens with no network and shows the last known state immediately.

## 5. Data durability contract — an update must never cost a memory

This is a hard requirement, ranked above every feature: **past days are permanent**.

1. **User data and app code are separated.** All records live in IndexedDB locally and in Postgres remotely. The service worker only ever replaces code. A cache wipe can never touch a prayer, a task or a review.
2. **Every release is versioned** (`schema_version` + `app_version`). Storage upgrades run through explicit, ordered migrations — never an implicit wipe, never "clear storage and start fresh".
3. **Migrations are additive only.** Add tables, add columns, backfill. No `DROP`, no `TRUNCATE`, no destructive type changes, no silent renames. Removed features leave their data intact and unread.
4. **Snapshot before migrating.** The client copies local data to a versioned snapshot before upgrading. If a migration throws, it rolls back cleanly and the app keeps running on the previous version — data untouched.
5. **Idempotent and resumable.** Interrupted mid-update (closed app, dead battery, no signal)? The migration resumes or safely re-runs; it never half-applies.
6. **Forward and backward tolerant reads.** Unknown fields are ignored, missing fields get defaults. A newer build never breaks on old records; an old build never destroys new ones. Moving between schema versions in either direction is safe.
7. **Soft deletes.** Deleting an item writes a tombstone; nothing is hard-deleted from history. Destructive actions get an **8-second undo**; deleting a day's data requires a typed confirmation.
8. **Server-side safety net.** Daily automatic backups + point-in-time recovery on Postgres. Full JSON export at any time from Settings.
9. **Rehearsed, not hoped.** Every schema change is tested against a seed dataset of ≥60 days of realistic records, asserting row counts and checksums before/after. No release ships if any record changes unexpectedly.
10. **Import/export round-trips.** Export → import must reproduce the archive exactly, so a rebuild can always be seeded from real data.

## 6. Auth, identity & sync

- No passwords. On first run the device receives a secure anonymous identity token stored locally; it stays signed in indefinitely.
- Pairing links the two devices to one couple (`couple_id`), enforced by row-level security: each row readable only by its two members.
- **Real-time:** a change by one partner appears on the other's screen within 2 s, no pull-to-refresh.
- **Local-first writes:** every action saves to the device instantly, then syncs. The UI never waits on the network.
- **Offline queue:** writes made offline are kept in order and flushed on reconnect; nothing is dropped or duplicated (idempotency keys).
- **Day authority:** each user's local civil date (`YYYY-MM-DD`), rolling at local midnight, correct across different time zones.
- **Conflict rule:** per-field last-write-wins; the record's owner always wins over their partner's read.

## 7. Navigation

Five bottom tabs, thumb-reachable, safe-area aware, ≥44 px targets, with a translucent blurred bar:

**Prayer · Plan · Review · Us · Settings**

Home is **Prayer** — the ritual people open the app for.

## 8. Screen — Prayer

- Five prayers, fixed order: **Fajr, Dhuhr, Asr, Maghrib, Isha**, each with today's window from the user's location.
- Exactly one state per prayer:

  | State | Colour | Meaning |
  |---|---|---|
  | Pending | grey | not logged, window still open |
  | On time | **green** | prayed inside the window |
  | Late | **orange** | prayed, after the on-time boundary |
  | Missed | **red** | not prayed within the window |

- **Owner-only logging.** Tap a prayer → *On time* / *Late* / *Missed* → saved instantly. Tap again to correct. The partner is read-only and cannot alter the other's record.
- **Smart default:** the app pre-selects on-time or late from the clock, so the common case is one tap. Boundaries (configurable):
  - Fajr: on time until sunrise, late until Dhuhr
  - Dhuhr: on time until Asr, late until Maghrib
  - Asr: on time until Maghrib, late until Isha
  - Maghrib: on time until Isha, late until Fajr
  - Isha: on time until midnight, late until Fajr
- **Auto-miss at midnight**, still correctable up to 7 days back. Forgetting to tap is human; guilt is not a feature.
- Status is never colour alone — always label + icon (accessibility and colour-blind safety).
- **Partner column:** the partner's five states live, with their counter (e.g. 4/5).
- **Encouragement:** one tap-reaction per prayer per day (👏 ❤️ 💪 🤲), no free text, max one per prayer per person — anti-spam by design. The owner gets a quiet push.
- **Progress:** today's ring (x/5) and a **tap-to-open 7-day grid** of coloured squares.
- **Prayer times:** computed offline from device location (MWL / ISNA / Umm al-Qura / Egypt / Karachi), with per-prayer manual override in Settings.

## 9. Screen — Plan (today)

- Two lists: **Mine** and **Theirs** — side by side on Mac, segmented switch on phone, defaulting to Mine.
- Each person writes and edits **only their own** items; both see both lists live.
- Item: text (required) + optional time label + optional priority (normal / important).
- Checking completes it: strikethrough + fade, moves into a collapsed *Done* section with the completion time. Unchecking restores it.
- Drag to reorder, swipe to delete (with undo), long-press for a quick action sheet.
- Partner may react to an item with one emoji. No comments in v1.
- One-tap **"Pull in unfinished from yesterday"**.
- Header: "3 of 7 done" per person. Empty states invite ("What's on your plate today?"), never scold.

## 10. Screen — Review (today)

- **What I accomplished today** — free text plus optional bullet wins.
- **Productivity 0–10** and **Happiness 0–10** — sliders with big live numerals.
- Optional one-line highlight ("best moment").
- Explicit save; visible to the partner immediately; editable until end of day.
- Partner may add **one short note (≤140 chars)** and a reaction — the single place with words.
- An unlogged day reads "not logged", never as a zero.

## 11. Screen — Us (history & calendar)

The shared memory of the relationship — and the guarantee that nothing is forgotten.

- **Today at a glance:** both prayer rings, both plan progress, both ratings.
- **Month calendar**, the centrepiece:
  - Each day cell carries a compact signal: prayer completion (ring or density dots), plan progress, and the two ratings.
  - **Tap any past day → full read-only day view:** that day's five prayers per person, both plan lists with what got done, both reviews with wins and ratings, reactions received.
  - **Swipe horizontally** to step day by day; swipe the header to change month; "jump to today" always one tap away.
  - Filter by person (N / A / both). Months load instantly from local storage — no spinners while scrolling back two years.
  - Empty days are shown as empty, not as failures.
- **Week and month summaries:** prayer consistency %, tasks completed, average productivity and happiness — **side by side, never ranked**.
- Streaks and gentle trends ("your happiness is up 1.2 this week").
- **Rule of tone:** compare patterns, never people. No winners, no shame copy.

## 12. Interaction, motion & craft

The app must be genuinely pleasurable to touch — calm, tactile, modern. Not a form in a box.

- **Motion language:** spring-based, interruptible, 60 fps. Duration 180–320 ms. Nothing bounces like a toy; everything settles like a physical object.
- **Haptics:** light impact on prayer confirm, selection on tab change, soft tick on checkbox (Android `navigator.vibrate`; on iOS a visual pulse substitutes where haptics aren't available).
- **Signature moment — logging a prayer:** the tile floods with its colour from the tap point, a soft scale bounce, the ring arc animates forward, and a one-word confirmation (*"Fajr · on time"*) fades through. Satisfying enough to make you want to log the next one.
- **Micro-interactions everywhere:** every tappable surface has a press state (scale 0.97, 90 ms). Cards lift on touch. Sheets drag to dismiss with rubber-banding. Tab switches cross-fade with per-tab scroll memory.
- **Progressive reveals:** ring and chart animations trigger on scroll into view; calendar cells stagger in when a month opens; numbers count up, never snap.
- **No spinners over 300 ms** — skeletons and optimistic UI instead. Every write feels instant because it is, locally.
- **Cards & depth:** one elevated "today" hero card with a soft two-tone gradient; layer with blur and 1 px inner highlights rather than heavy borders.
- **Custom icon set** (1.5 px stroke, rounded caps), hand-tuned for the 24 px grid. No emoji as primary UI icons.
- **Sound:** off by default, never required.
- **Restraint:** no confetti, no badges shouting, no gamified noise. Beauty here means quiet confidence.
- **Accessibility:** labelled controls, visible focus, reduced-motion honoured (all animation collapses to instant state changes), high-contrast mode, works at 200 % text zoom.

## 13. Design system

- **Feeling:** warm, intimate, modern — a shared journal, not a productivity dashboard.
- **Two accents, one per person**, used as identity everywhere: their column, avatar ring, chart line, reaction badges. Deep, slightly desaturated tones that work on dark and light.
- **Status palette, fixed:** green `#2E9E63`, orange `#E08B2D`, red `#D14B4B`, pending grey — tuned for WCAG AA in both themes.
- **Type:** system stack (SF / Inter), clear scale (32 / 24 / 17 / 15 / 13), generous line height, tabular numerals for scores.
- **Space & shape:** 4/8 px spacing scale, 18–24 px radii, generous breathing room, one primary action per screen.
- **Themes:** dark by default (deep neutral, not pure black), light available, follows the OS.
- **Responsive:** mobile-first single column; on Mac, two-column layouts that use the width instead of stretching a phone UI.
- **Safe areas, notches, home indicator** handled on every screen and in every sheet.

## 14. Notifications

- Web push for installed PWAs (Android full support; iOS 16.4+ from the home screen — documented limitation).
- Triggers: prayer reminder at adhan time, follow-up if still pending 45 min later, evening review prompt at a chosen hour, partner reactions and nudges.
- Each trigger individually opt-in, silent hours respected, never more than 3 pushes a day by default.

## 15. Privacy & security

- Visible only to the two members; rows isolated per couple at the database level.
- No analytics, no ads, no third-party trackers, no data sold or shared.
- Encrypted in transit (HTTPS) and at rest.
- Invite codes are single-use, expiring, and revocable. Devices can be listed and revoked.
- Full JSON export and full account/data deletion from Settings.

## 16. Tech

- **Frontend:** static PWA — HTML, CSS, vanilla JS modules. No framework, no build step. Fast to change, cheap to host, nothing to rot.
- **Storage:** IndexedDB locally (source of truth for the UI), with a write-through sync layer.
- **Backend:** Supabase — Postgres + row-level security + realtime + anonymous device identity.
- **Hosting:** static HTTPS host with a stable URL both phones install from.
- **Files:** `index.html`, `styles.css`, `app.js`, `db.js`, `sync.js`, `ui.js`, `manifest.webmanifest`, `sw.js`, `icons/`, `migrations/`.

### Data model

```
couple     (id, name, invite_code, created_at)
member     (couple_id, device_id, display_name, accent, avatar, tz, joined_at)
prayer_log (id, couple_id, member_id, day, prayer, status, logged_at, deleted_at)
             status ∈ 'ontime' | 'late' | 'missed'
plan_item  (id, couple_id, member_id, day, title, time_label, priority,
            done, done_at, position, deleted_at)
review     (id, couple_id, member_id, day, wins, productivity, happiness,
            highlight, note_from_partner, updated_at)
reaction   (id, couple_id, from_member, target_type, target_id, emoji, created_at)
snapshot   (id, device_id, schema_version, payload, created_at)
```

`day` is always the user's local civil date. One `prayer_log` per `(member, day, prayer)`; one `review` per `(member, day)`. `deleted_at` makes every delete soft.

## 17. Acceptance criteria

**Onboarding**
1. Fresh install → name → in the app in under 30 s, on both iPhone and Android.
2. Second device joins by code and both see the same couple data within 5 s.

**App-like delivery**
3. Installs from the same URL on Android (Chrome) and iPhone (Safari), launches standalone with a custom icon and no browser chrome.
4. A change pushed here appears on both phones after reopening, with no reinstall, no lost tab, no reload flash.
5. The Settings version stamp and "what changed" reflect the new build.

**Core behaviour**
6. N logs Fajr *on time* → A sees it green within 2 s, no refresh.
7. Unlogged prayers turn red at midnight; yesterday's Isha is still correctable.
8. Each partner can read but not edit the other's plan or prayers.
9. A review of productivity 8 / happiness 6 reaches the partner with its wins text intact.
10. Airplane mode: app opens, writes queue, reconnect flushes with no duplicates.

**History**
11. Every past day is browsable from the calendar, with prayers, plan and review intact.
12. Two years of history scrolls without a spinner.

**Data safety**
13. Ship a schema-changing update over 60+ days of seeded data → zero records lost, checksums verified.
14. A failed migration leaves the app running with data untouched.
15. Delete an item → undo within 8 s restores it exactly.
16. Export → import reproduces the archive byte-for-byte.

**Craft**
17. Lighthouse: installable PWA, performance ≥ 90 mobile, accessibility ≥ 95.
18. Motion runs at 60 fps on a mid-range Android; reduced-motion collapses everything cleanly.
19. No layout shift on load; no spinners over 300 ms; all targets ≥ 44 px.

## 18. Out of scope for v1

Chat thread, photos, voice notes, more than two members, App Store / Play Store submission, leaderboards, streak-shaming, finance tracking, calendar integrations, widgets.
