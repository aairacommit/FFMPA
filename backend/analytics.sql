-- FFMPA daily analytics for the admin portal (21 Nov 2026).
-- Run after schema.sql, push.sql and local-schedule.sql. Safe to run again.
--
-- Totals only. Everything is counted from data FFMPA already keeps to run the service
-- (family accounts and the reading progress a signed-in family saves to its account).
-- The app sends nothing new, nothing is stored per child, and only admins can read the totals.
-- Preview visitors (not signed in) and the grown-up website are not counted here.
--
-- pg_cron refreshes the totals every hour at 10 past. Each run recounts the last 4 days up to
-- today (IST), because a phone that was offline saves its progress later. A day is final once
-- 10:40 UTC (4:10 pm IST) the next day has passed, when it has ended everywhere families live;
-- until then its row is marked live. The app files reading under the edition date it showed and
-- keeps each family's story list for its last 5 reading days, so a day first counted more than
-- 4 days later can only see 3 story days and finished editions; such days are marked "approx"
-- (stories read may be undercounted). Days older than that are never recounted.

create table if not exists public.stats_daily (
  day date primary key,
  data jsonb not null check (pg_column_size(data) < 50000),
  computed_at timestamptz not null default now()
);
alter table public.stats_daily add column if not exists live boolean not null default false;
alter table public.stats_daily enable row level security;
revoke all on public.stats_daily from anon, authenticated;

-- a number from jsonb, or 0
create or replace function public.stats_num(v jsonb) returns numeric
language sql immutable set search_path = public as $$
  select case when jsonb_typeof(v) = 'number' then least(greatest(v::text::numeric, 0), 100000) else 0 end
$$;

-- stories a family read on a day (the app stores ids per edition date), at most 40
create or replace function public.stats_reads(p jsonb, d date) returns int
language sql immutable set search_path = public as $$
  select case when jsonb_typeof(p -> 'read' -> d::text) = 'array'
              then least(jsonb_array_length(p -> 'read' -> d::text), 40) else 0 end
$$;

-- a family was active on a day if it read a story, had a 3 story day, or finished an edition
create or replace function public.stats_active(p jsonb, d date) returns boolean
language sql immutable set search_path = public as $$
  select public.stats_reads(p, d) > 0
      or (jsonb_typeof(p -> 'stats' -> 'days') = 'object' and (p -> 'stats' -> 'days') ? d::text)
      or (jsonb_typeof(p -> 'stats' -> 'editions') = 'object' and (p -> 'stats' -> 'editions') ? d::text)
$$;

-- the days in [d0, d1] a family was active, as yyyy-mm-dd text (read once per family, no date casts)
create or replace function public.stats_days(p jsonb, d0 date, d1 date) returns setof text
language sql immutable set search_path = public as $$
  select k from (
    select e.key as k from jsonb_each(case when jsonb_typeof(p -> 'read') = 'object' then p -> 'read' else '{}'::jsonb end) e
      where jsonb_typeof(e.value) = 'array' and jsonb_array_length(e.value) > 0
    union
    select jsonb_object_keys(case when jsonb_typeof(p -> 'stats' -> 'days') = 'object' then p -> 'stats' -> 'days' else '{}'::jsonb end)
    union
    select jsonb_object_keys(case when jsonb_typeof(p -> 'stats' -> 'editions') = 'object' then p -> 'stats' -> 'editions' else '{}'::jsonb end)
  ) t
  where k ~ '^\d{4}-\d{2}-\d{2}$' and k between d0::text and d1::text
$$;

-- real families only: not admins, not the Google Play review account, not @ffmpa.com test addresses
create or replace function public.stats_families()
returns table (id uuid, settings jsonb, progress jsonb, joined date)
language sql stable security definer set search_path = public, auth as $$
  select p.id, p.settings, p.progress, (p.created_at at time zone 'Asia/Kolkata')::date
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.consent_at is not null
    and lower(coalesce(u.email, '')) not in (select a.email from public.admin_emails a)
    and lower(coalesce(u.email, '')) not like '%@ffmpa.com'
$$;

create or replace function public.stats_compute(p_day date) returns jsonb
language plpgsql stable security definer set search_path = public, auth as $$
declare
  ds text := p_day::text;
  today date := (now() at time zone 'UTC')::date;
  r jsonb;
  extra jsonb;
begin
  with fam as (
    select f.* from public.stats_families() f where f.joined <= p_day
  ), x as (
    select f.*,
      upper(coalesce(f.settings ->> 'age', 'o')) as age_raw,
      case when coalesce(f.settings ->> 'country', '') ~ '^[A-Z]{2}$' then f.settings ->> 'country' else 'other' end as cty,
      public.stats_reads(f.progress, p_day) as reads,
      public.stats_active(f.progress, p_day) as act,
      coalesce((select max(k) from public.stats_days(f.progress, p_day - 29, p_day) k), '') as last_active
    from fam f
  )
  select jsonb_build_object(
    'v', 1,
    'approx', p_day < today - 4,
    'families', count(*),
    'new_families', count(*) filter (where joined = p_day),
    'active', count(*) filter (where act),
    'readers', count(*) filter (where reads > 0),
    'active_7d', count(*) filter (where last_active >= (p_day - 6)::text),
    'active_30d', count(*) filter (where last_active <> ''),
    'stories_read', coalesce(sum(reads), 0),
    'three_plus', count(*) filter (where jsonb_typeof(progress -> 'stats' -> 'days') = 'object' and (progress -> 'stats' -> 'days') ? ds),
    'finished', count(*) filter (where jsonb_typeof(progress -> 'stats' -> 'editions') = 'object' and (progress -> 'stats' -> 'editions') ? ds),
    'quiz_answered', coalesce(sum(public.stats_num(progress -> 'stats' -> 'qAns')), 0),
    'quiz_right', coalesce(sum(public.stats_num(progress -> 'stats' -> 'qRight')), 0),
    'explainers', coalesce(sum(public.stats_num(progress -> 'stats' -> 'explainers')), 0),
    'words', coalesce(sum(case when jsonb_typeof(progress -> 'words') = 'array' then least(jsonb_array_length(progress -> 'words'), 5000) else 0 end), 0),
    'age', jsonb_build_object(
      'x', count(*) filter (where age_raw = 'X'),
      'o', count(*) filter (where age_raw not in ('X', 'N')),
      'n', count(*) filter (where age_raw = 'N')),
    'age_active', jsonb_build_object(
      'x', count(*) filter (where act and age_raw = 'X'),
      'o', count(*) filter (where act and age_raw not in ('X', 'N')),
      'n', count(*) filter (where act and age_raw = 'N')),
    'd1', jsonb_build_object('n', count(*) filter (where joined = p_day - 1), 'back', count(*) filter (where joined = p_day - 1 and act)),
    'd7', jsonb_build_object('n', count(*) filter (where joined = p_day - 7), 'back', count(*) filter (where joined = p_day - 7 and act)),
    'countries', coalesce((select jsonb_object_agg(c.cty, c.n) from (select x2.cty, count(*) as n from x x2 group by x2.cty) c), '{}'::jsonb)
  ) into r
  from x;

  select jsonb_build_object(
    'alert_devices', (select count(*) from public.push_subs s
                      where (s.created_at at time zone 'Asia/Kolkata')::date <= p_day
                        and s.user_id in (select f.id from public.stats_families() f)),
    'classes', (select count(*) from public.classes c where (c.created_at at time zone 'Asia/Kolkata')::date <= p_day),
    'pupils', (select count(*) from public.class_members m where (m.joined_at at time zone 'Asia/Kolkata')::date <= p_day),
    'reports_sent', (select count(*) from public.reports rp where (rp.created_at at time zone 'Asia/Kolkata')::date = p_day),
    'editions', coalesce((
      select jsonb_agg(jsonb_build_object('id', e ->> 'id', 'seen', e ->> 'seen') order by e ->> 'id')
      from public.app_config c, jsonb_array_elements(case when jsonb_typeof(c.value) = 'array' then c.value else '[]'::jsonb end) e
      where c.key = 'edition_log' and coalesce(e ->> 'id', '') like ds || '-%'), '[]'::jsonb)
  ) into extra;

  return r || extra;
end $$;

-- recount the last 4 days up to today (IST); a day is final after 10:40 UTC the next day
drop function if exists public.stats_snapshot(int);
create or replace function public.stats_refresh() returns int
language plpgsql security definer set search_path = public as $$
declare d date; n int := 0; today date := (now() at time zone 'Asia/Kolkata')::date;
begin
  for d in select g::date from generate_series(today - 3, today, interval '1 day') g loop
    insert into public.stats_daily (day, data, live)
      values (d, public.stats_compute(d), now() < ((d + 1)::timestamp + interval '10 hours 40 minutes') at time zone 'UTC')
      on conflict (day) do update set data = excluded.data, live = excluded.live, computed_at = now();
    n := n + 1;
  end loop;
  return n;
end $$;

-- admins: the saved rows only (fast; the hourly job does the counting)
drop function if exists public.admin_stats(int);
create or replace function public.admin_stats(p_days int default 30)
returns table (day date, data jsonb, computed_at timestamptz, live boolean)
language plpgsql stable security definer set search_path = public as $$
declare span int := least(greatest(coalesce(p_days, 30), 1), 400);
begin
  if not public.is_admin() then raise exception 'admins only'; end if;
  return query
    select s.day, s.data, s.computed_at, s.live
    from public.stats_daily s
    where s.day > (now() at time zone 'Asia/Kolkata')::date - span
    order by s.day;
end $$;

do $$
declare f text;
begin
  foreach f in array array['stats_num(jsonb)', 'stats_reads(jsonb,date)', 'stats_active(jsonb,date)',
                           'stats_days(jsonb,date,date)', 'stats_families()', 'stats_compute(date)', 'stats_refresh()'] loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
  end loop;
end $$;
revoke all on function public.admin_stats(int) from public, anon;
grant execute on function public.admin_stats(int) to authenticated;

-- first run: fill every day since launch (11 Nov 2026) once; older days are marked approx
insert into public.stats_daily (day, data)
select g::date, public.stats_compute(g::date)
from generate_series(date '2026-11-11', (now() at time zone 'Asia/Kolkata')::date - 4, interval '1 day') g
on conflict (day) do nothing;
select public.stats_refresh();

-- hourly refresh at 10 past the hour
create extension if not exists pg_cron;
select cron.unschedule(jobid) from cron.job where jobname in ('ffmpa-stats-daily', 'ffmpa-stats-hourly');
select cron.schedule('ffmpa-stats-hourly', '10 * * * *', $cron$select public.stats_refresh()$cron$);
