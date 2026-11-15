# Getting N&A online — three things to send me

Everything is built. Two accounts are the only thing standing between this
folder and an app on both phones.

---

## 1. A GitHub repo (for the app itself)

1. Open <https://github.com/new>
2. Name: **na-app**. Visibility: **Public**. Do **not** add a README.
3. Click *Create repository*.
4. Create a token so I can push: <https://github.com/settings/tokens/new>
   - Note: `N&A deploy`
   - Expiration: **7 days** (you can revoke it after)
   - Scopes: tick **`repo`** only
   - Generate, then copy the `ghp_…` string

Send me:

```
repo:  your-username/na-app
token: ghp_…
```

I'll push, turn on Pages, and reply with the URL. You can revoke the token
right after — updates from that point only need the repo to exist.

---

## 2. A Supabase project (for the two phones to share data)

1. <https://supabase.com/dashboard> → *New project*
   - Name: `na`
   - Region: the one closest to you
   - Password: anything, you won't need it
2. **SQL Editor** → *New query* → paste the whole of `supabase/schema.sql`
   from this folder → **Run**. It should end with "Success. No rows returned".
3. **Project Settings → API** → copy two values:
   - *Project URL* — `https://xxxx.supabase.co`
   - *anon public* key — the long `eyJ…` string

Send me:

```
supabase url:  https://xxxx.supabase.co
supabase key:  eyJ…
```

That anon key is designed to be public — it can't read anything on its own.
The tables are closed; the only way in is with your couple's secret key.

---

## What happens next

- I wire the sync layer, generate your couple key, and test pull/push against
  your project.
- You open the Pages URL on the phone, type your name, and enter the same key
  on the second phone. From then on both phones see the same prayers, plans
  and reviews within a couple of seconds.
- Every change you ask for afterwards: I edit, run `tools/deploy.mjs`, and the
  app updates itself on both phones on next open — no reinstall, no lost days.
