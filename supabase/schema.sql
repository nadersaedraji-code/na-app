-- ============================================================
-- N&A · sync schema, v1
-- Paste this whole file into the Supabase SQL editor once.
-- Safe to run again: every statement is idempotent.
--
-- Access model: the tables are closed to the public API. The only
-- way in is through three functions, each of which requires the
-- couple's secret key (a 256-bit string the app generates).
-- No user accounts, no passwords, nothing to expire.
-- ============================================================

create table if not exists couples (
  id         uuid primary key default gen_random_uuid(),
  key        text unique not null,
  name       text not null default 'N&A',
  created_at timestamptz not null default now()
);

create table if not exists members (
  id           text primary key,
  couple_id    uuid not null references couples(id) on delete cascade,
  display_name text not null,
  color        text,
  avatar       text,
  tz           text,
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);

create table if not exists prayers (
  id         text primary key,
  couple_id  uuid not null references couples(id) on delete cascade,
  member_id  text not null,
  day        date not null,
  prayer     text not null,
  status     text not null,
  logged_at  timestamptz,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists plan_items (
  id         text primary key,
  couple_id  uuid not null references couples(id) on delete cascade,
  member_id  text not null,
  day        date not null,
  title      text not null,
  time_label text,
  priority   text default 'normal',
  done       boolean default false,
  done_at    timestamptz,
  progress   text not null default 'todo',
  position   integer default 0,
  created_at timestamptz,
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists reviews (
  id           text primary key,
  couple_id    uuid not null references couples(id) on delete cascade,
  member_id    text not null,
  day          date not null,
  wins         text,
  productivity integer,
  happiness    integer,
  highlight    text,
  notes        jsonb not null default '[]'::jsonb,
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz,
  unique (member_id, day)
);

create table if not exists reactions (
  id          text primary key,
  couple_id   uuid not null references couples(id) on delete cascade,
  from_member text,
  target_type text,
  target_id   text,
  emoji       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

-- Deletions are shipped as tombstones, never as silence.
create table if not exists tombstones (
  couple_id  uuid not null references couples(id) on delete cascade,
  kind       text not null,
  row_id     text not null,
  deleted_at timestamptz not null default now(),
  primary key (couple_id, kind, row_id)
);

create index if not exists prayers_couple_updated on prayers (couple_id, updated_at);
create index if not exists plan_couple_updated on plan_items (couple_id, updated_at);
create index if not exists reviews_couple_updated on reviews (couple_id, updated_at);
create index if not exists reactions_couple_updated on reactions (couple_id, updated_at);
create index if not exists tombstones_couple_time on tombstones (couple_id, deleted_at);

-- Later additions, safe to run on an existing database.
alter table plan_items add column if not exists progress text not null default 'todo';

create table if not exists goals (
  id           text primary key,
  couple_id    uuid not null references couples(id) on delete cascade,
  member_id    text not null,
  scope        text not null default 'main',
  title        text not null,
  progress     integer not null default 0,
  created_at   timestamptz,
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);
create index if not exists goals_couple_updated on goals (couple_id, updated_at);
alter table goals enable row level security;
revoke all on goals from anon, authenticated;

-- Close the doors: the anon key alone can touch nothing.
alter table couples     enable row level security;
alter table members     enable row level security;
alter table prayers     enable row level security;
alter table plan_items  enable row level security;
alter table reviews     enable row level security;
alter table reactions   enable row level security;
alter table tombstones  enable row level security;

revoke all on couples, members, prayers, plan_items, reviews, reactions, tombstones from anon, authenticated;

-- ------------------------------------------------------------
-- na_join: create the couple on first use, or add the second
-- member to an existing one. Same call for both.
-- ------------------------------------------------------------
create or replace function na_join(p_key text, p_member jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid;
begin
  if p_key is null or length(p_key) < 24 then
    raise exception 'key too short';
  end if;

  insert into couples (key) values (p_key)
  on conflict (key) do update set key = excluded.key
  returning id into cid;

  insert into members (id, couple_id, display_name, color, avatar, tz, updated_at)
  values (
    p_member->>'id', cid, p_member->>'name', p_member->>'color',
    p_member->>'avatar', p_member->>'tz', now()
  )
  on conflict (id) do update
    set couple_id = cid,
        display_name = excluded.display_name,
        color = excluded.color,
        avatar = excluded.avatar,
        tz = excluded.tz,
        updated_at = now();

  return jsonb_build_object('couple_id', cid, 'server_time', now());
end;
$$;

-- ------------------------------------------------------------
-- na_pull: everything that changed since the last sync, plus
-- the tombstones that tell you what to remove.
-- ------------------------------------------------------------
create or replace function na_pull(p_key text, p_since timestamptz default 'epoch')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid;
begin
  select id into cid from couples where key = p_key;
  if cid is null then raise exception 'invalid key'; end if;

  return jsonb_build_object(
    'members',
      coalesce((select jsonb_agg(to_jsonb(m)) from members m
                where m.couple_id = cid), '[]'::jsonb),
    'prayers',
      coalesce((select jsonb_agg(to_jsonb(p)) from prayers p
                where p.couple_id = cid and p.updated_at > p_since), '[]'::jsonb),
    'plan',
      coalesce((select jsonb_agg(to_jsonb(p)) from plan_items p
                where p.couple_id = cid and p.updated_at > p_since), '[]'::jsonb),
    'reviews',
      coalesce((select jsonb_agg(to_jsonb(r)) from reviews r
                where r.couple_id = cid and r.updated_at > p_since), '[]'::jsonb),
    'reactions',
      coalesce((select jsonb_agg(to_jsonb(r)) from reactions r
                where r.couple_id = cid and r.updated_at > p_since), '[]'::jsonb),
    'goals',
      coalesce((select jsonb_agg(to_jsonb(g)) from goals g
                where g.couple_id = cid and g.updated_at > p_since), '[]'::jsonb),
    'deletes',
      coalesce((select jsonb_agg(jsonb_build_object('kind', t.kind, 'id', t.row_id)) from tombstones t
                where t.couple_id = cid and t.deleted_at > p_since), '[]'::jsonb),
    'server_time', now()
  );
end;
$$;

-- ------------------------------------------------------------
-- na_push: send writes and deletions. Last write wins, and the
-- server stamps updated_at so the other phone can ask for deltas.
-- ------------------------------------------------------------
create or replace function na_push(p_key text, p_data jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid;
  r jsonb;
  d jsonb;
  clock timestamptz := clock_timestamp();
begin
  select id into cid from couples where key = p_key;
  if cid is null then raise exception 'invalid key'; end if;

  if jsonb_typeof(p_data->'prayers') = 'array' then
    for r in select * from jsonb_array_elements(p_data->'prayers') loop
      insert into prayers (id, couple_id, member_id, day, prayer, status, logged_at, updated_at)
      values (r->>'id', cid, r->>'member_id', (r->>'day')::date, r->>'prayer',
              r->>'status', nullif(r->>'logged_at','')::timestamptz, clock)
      on conflict (id) do update
        set status = excluded.status,
            logged_at = excluded.logged_at,
            updated_at = clock,
            deleted_at = null;
    end loop;
  end if;

  if jsonb_typeof(p_data->'plan') = 'array' then
    for r in select * from jsonb_array_elements(p_data->'plan') loop
      insert into plan_items (id, couple_id, member_id, day, title, time_label, priority,
                              done, done_at, progress, position, created_at, updated_at)
      values (r->>'id', cid, r->>'member_id', (r->>'day')::date, r->>'title',
              r->>'time_label', coalesce(r->>'priority','normal'),
              coalesce((r->>'done')::boolean, false),
              nullif(r->>'done_at','')::timestamptz,
              coalesce(r->>'progress','todo'),
              coalesce((r->>'position')::int, 0),
              nullif(r->>'created_at','')::timestamptz, clock)
      on conflict (id) do update
        set title = excluded.title,
            time_label = excluded.time_label,
            priority = excluded.priority,
            done = excluded.done,
            done_at = excluded.done_at,
            progress = excluded.progress,
            position = excluded.position,
            updated_at = clock,
            deleted_at = null;
    end loop;
  end if;

  if jsonb_typeof(p_data->'reviews') = 'array' then
    for r in select * from jsonb_array_elements(p_data->'reviews') loop
      insert into reviews (id, couple_id, member_id, day, wins, productivity, happiness,
                           highlight, notes, updated_at)
      values (r->>'id', cid, r->>'member_id', (r->>'day')::date, r->>'wins',
              (r->>'productivity')::int, (r->>'happiness')::int, r->>'highlight',
              coalesce(r->'notes', '[]'::jsonb), clock)
      on conflict (id) do update
        set wins = excluded.wins,
            productivity = excluded.productivity,
            happiness = excluded.happiness,
            highlight = excluded.highlight,
            notes = excluded.notes,
            updated_at = clock,
            deleted_at = null;
    end loop;
  end if;

  if jsonb_typeof(p_data->'reactions') = 'array' then
    for r in select * from jsonb_array_elements(p_data->'reactions') loop
      insert into reactions (id, couple_id, from_member, target_type, target_id, emoji, updated_at)
      values (r->>'id', cid, r->>'from_member', r->>'target_type', r->>'target_id',
              r->>'emoji', clock)
      on conflict (id) do update
        set emoji = excluded.emoji,
            updated_at = clock,
            deleted_at = null;
    end loop;
  end if;

  if jsonb_typeof(p_data->'goals') = 'array' then
    for r in select * from jsonb_array_elements(p_data->'goals') loop
      insert into goals (id, couple_id, member_id, scope, title, progress, created_at, completed_at, updated_at)
      values (r->>'id', cid, r->>'member_id', coalesce(r->>'scope','main'), r->>'title',
              coalesce((r->>'progress')::int, 0),
              nullif(r->>'created_at','')::timestamptz,
              nullif(r->>'completed_at','')::timestamptz, clock)
      on conflict (id) do update
        set title = excluded.title,
            scope = excluded.scope,
            progress = excluded.progress,
            completed_at = excluded.completed_at,
            updated_at = clock,
            deleted_at = null;
    end loop;
  end if;

  if jsonb_typeof(p_data->'members') = 'array' then    for r in select * from jsonb_array_elements(p_data->'members') loop
      insert into members (id, couple_id, display_name, color, avatar, tz, updated_at)
      values (r->>'id', cid, r->>'name', r->>'color', r->>'avatar', r->>'tz', clock)
      on conflict (id) do update
        set display_name = excluded.display_name,
            color = excluded.color,
            avatar = excluded.avatar,
            updated_at = clock;
    end loop;
  end if;

  if jsonb_typeof(p_data->'deletes') = 'array' then
    for d in select * from jsonb_array_elements(p_data->'deletes') loop
      insert into tombstones (couple_id, kind, row_id, deleted_at)
      values (cid, d->>'kind', d->>'id', clock)
      on conflict (couple_id, kind, row_id) do update set deleted_at = clock;

      if d->>'kind' = 'prayers' then
        update prayers set deleted_at = clock, updated_at = clock where id = d->>'id' and couple_id = cid;
      elsif d->>'kind' = 'plan' then
        update plan_items set deleted_at = clock, updated_at = clock where id = d->>'id' and couple_id = cid;
      elsif d->>'kind' = 'reviews' then
        update reviews set deleted_at = clock, updated_at = clock where id = d->>'id' and couple_id = cid;
      elsif d->>'kind' = 'reactions' then
        update reactions set deleted_at = clock, updated_at = clock where id = d->>'id' and couple_id = cid;
      elsif d->>'kind' = 'goals' then
        update goals set deleted_at = clock, updated_at = clock where id = d->>'id' and couple_id = cid;
      end if;
    end loop;
  end if;

  return jsonb_build_object('ok', true, 'server_time', clock);
end;
$$;

grant execute on function na_join(text, jsonb) to anon;
grant execute on function na_pull(text, timestamptz) to anon;
grant execute on function na_push(text, jsonb) to anon;

-- Housekeeping: tombstones older than 120 days are no longer needed
-- by any device, since every device will have synced by then.
-- (Run occasionally by hand, or leave it — it is a few bytes per delete.)
