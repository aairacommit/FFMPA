-- FFMPA database schema (Supabase, project ffmpa, region ap-south-1 Mumbai)
-- Run in the Supabase SQL editor. Safe to run again: it only creates what is missing
-- and replaces functions and policies.
-- Principle: store the least possible. One row per family account, no child surname,
-- no birthday, no school, no photos. Teachers only ever see class totals.

create extension if not exists pgcrypto;

-- ---------- helpers ----------
create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end $$;

-- ---------- admins ----------
create table if not exists public.admin_emails (
  email text primary key check (email = lower(email))
);
alter table public.admin_emails enable row level security;
revoke all on public.admin_emails from anon, authenticated;
insert into public.admin_emails (email) values ('aairainvests@gmail.com') on conflict do nothing;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_emails a
    where a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------- family profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  settings jsonb not null default '{}'::jsonb check (pg_column_size(settings) < 20000),
  progress jsonb not null default '{}'::jsonb check (pg_column_size(progress) < 200000),
  consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon;
grant select, insert, update on public.profiles to authenticated;
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

drop policy if exists "profiles own select" on public.profiles;
drop policy if exists "profiles own insert" on public.profiles;
drop policy if exists "profiles own update" on public.profiles;
create policy "profiles own select" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles own insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles own update" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ---------- shared app settings (admin console) ----------
create table if not exists public.app_config (
  key text primary key check (key ~ '^[a-z0-9_-]{1,40}$'),
  value jsonb not null check (pg_column_size(value) < 200000),
  updated_at timestamptz not null default now()
);
alter table public.app_config enable row level security;
revoke all on public.app_config from anon, authenticated;
grant select on public.app_config to anon, authenticated;
grant insert, update, delete on public.app_config to authenticated;
drop trigger if exists app_config_touch on public.app_config;
create trigger app_config_touch before update on public.app_config
  for each row execute function public.touch_updated_at();

drop policy if exists "config read" on public.app_config;
drop policy if exists "config admin insert" on public.app_config;
drop policy if exists "config admin update" on public.app_config;
drop policy if exists "config admin delete" on public.app_config;
create policy "config read" on public.app_config for select to anon, authenticated using (true);
create policy "config admin insert" on public.app_config for insert to authenticated with check (public.is_admin());
create policy "config admin update" on public.app_config for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "config admin delete" on public.app_config for delete to authenticated using (public.is_admin());

-- ---------- Young reporters ----------
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  week date not null,
  headline text not null check (char_length(headline) between 8 and 90),
  body text not null default '' check (char_length(body) <= 280),
  age_band text not null check (age_band in ('x', 'o', 'n')),
  country text not null check (country ~ '^[A-Z]{2}$'),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists reports_week_status on public.reports (week, status);
create index if not exists reports_user on public.reports (user_id);
alter table public.reports enable row level security;
revoke all on public.reports from anon, authenticated;
grant select, delete on public.reports to authenticated;
grant insert (week, headline, body, age_band, country) on public.reports to authenticated;
grant update (status, reviewed_at) on public.reports to authenticated;

drop policy if exists "reports own insert" on public.reports;
drop policy if exists "reports own or admin select" on public.reports;
drop policy if exists "reports admin update" on public.reports;
drop policy if exists "reports own or admin delete" on public.reports;
create policy "reports own insert" on public.reports for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending');
create policy "reports own or admin select" on public.reports for select to authenticated
  using (user_id = auth.uid() or public.is_admin());
create policy "reports admin update" on public.reports for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "reports own or admin delete" on public.reports for delete to authenticated
  using (user_id = auth.uid() or public.is_admin());

create or replace function public.reports_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.week < current_date - 14 or new.week > current_date + 7 then
    raise exception 'week out of range';
  end if;
  if new.headline ~* '(https?:|www\.|@)' or new.body ~* '(https?:|www\.|@)'
     or regexp_replace(new.headline || new.body, '[\s-]', '', 'g') ~ '[0-9]{6,}' then
    raise exception 'no links, emails or phone numbers';
  end if;
  if (select count(*) from public.reports r where r.user_id = new.user_id and r.week = new.week) >= 5 then
    raise exception 'five reports a week is the limit';
  end if;
  return new;
end $$;
drop trigger if exists reports_guard on public.reports;
create trigger reports_guard before insert on public.reports
  for each row execute function public.reports_guard();

-- approved reports for Sunday's front page: no account id, no name
create or replace function public.get_public_reports(p_week date)
returns table (headline text, body text, age_band text, country text)
language sql stable security definer set search_path = public as $$
  select r.headline, r.body, r.age_band, r.country
  from public.reports r
  where r.week = p_week and r.status = 'approved'
  order by r.reviewed_at desc nulls last
  limit 12
$$;
revoke all on function public.get_public_reports(date) from public;
grant execute on function public.get_public_reports(date) to anon, authenticated;

-- ---------- Classroom mode ----------
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  teacher_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 24),
  level text not null default 'o' check (level in ('x', 'o', 'n')),
  created_at timestamptz not null default now()
);
alter table public.classes enable row level security;
revoke all on public.classes from anon, authenticated;
grant select, delete on public.classes to authenticated;
grant insert (code, name, level) on public.classes to authenticated;
grant update (name, level) on public.classes to authenticated;

drop policy if exists "classes teacher all" on public.classes;
drop policy if exists "classes teacher select" on public.classes;
drop policy if exists "classes teacher insert" on public.classes;
drop policy if exists "classes teacher update" on public.classes;
drop policy if exists "classes teacher delete" on public.classes;
create policy "classes teacher select" on public.classes for select to authenticated using (teacher_id = auth.uid());
create policy "classes teacher insert" on public.classes for insert to authenticated
  with check (teacher_id = auth.uid() and (select count(*) from public.classes c where c.teacher_id = auth.uid()) < 10);
create policy "classes teacher update" on public.classes for update to authenticated using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());
create policy "classes teacher delete" on public.classes for delete to authenticated using (teacher_id = auth.uid());

create table if not exists public.class_members (
  class_id uuid not null references public.classes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, user_id)
);
create table if not exists public.class_progress (
  class_id uuid not null references public.classes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  week date not null,
  reads int not null default 0 check (reads between 0 and 500),
  quiz_right int not null default 0 check (quiz_right between 0 and 500),
  quiz_total int not null default 0 check (quiz_total between 0 and 500),
  updated_at timestamptz not null default now(),
  primary key (class_id, user_id, week)
);
alter table public.class_members enable row level security;
alter table public.class_progress enable row level security;
revoke all on public.class_members from anon, authenticated;
revoke all on public.class_progress from anon, authenticated;
-- no direct table access: pupils and teachers go through the functions below

create or replace function public.join_class(p_code text)
returns table (id uuid, name text, level text)
language plpgsql security definer set search_path = public as $$
declare c public.classes;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  select * into c from public.classes k where k.code = upper(regexp_replace(p_code, '\s', '', 'g'));
  if c.id is null then return; end if;
  if (select count(*) from public.class_members m where m.user_id = auth.uid()) >= 3
     and not exists (select 1 from public.class_members m where m.user_id = auth.uid() and m.class_id = c.id) then
    raise exception 'three classes is the limit';
  end if;
  insert into public.class_members (class_id, user_id) values (c.id, auth.uid()) on conflict do nothing;
  return query select c.id, c.name, c.level;
end $$;

create or replace function public.leave_class(p_class uuid) returns void
language sql security definer set search_path = public as $$
  delete from public.class_members where class_id = p_class and user_id = auth.uid();
  delete from public.class_progress where class_id = p_class and user_id = auth.uid();
$$;

create or replace function public.class_report(p_week date, p_reads int, p_right int, p_total int) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return; end if;
  if p_week < current_date - 14 or p_week > current_date + 7 then return; end if;
  insert into public.class_progress (class_id, user_id, week, reads, quiz_right, quiz_total)
  select m.class_id, auth.uid(), p_week,
         least(greatest(p_reads, 0), 500), least(greatest(p_right, 0), 500), least(greatest(p_total, 0), 500)
  from public.class_members m where m.user_id = auth.uid()
  on conflict (class_id, user_id, week) do update
    set reads = excluded.reads, quiz_right = excluded.quiz_right, quiz_total = excluded.quiz_total, updated_at = now();
end $$;

-- class totals only, never one child; hidden until 3 pupils have joined
create or replace function public.class_summary(p_class uuid, p_week date)
returns table (pupils int, reads int, quiz_avg int)
language plpgsql stable security definer set search_path = public as $$
declare n int;
begin
  if not exists (select 1 from public.classes c where c.id = p_class and c.teacher_id = auth.uid()) then
    raise exception 'not your class';
  end if;
  select count(*) into n from public.class_members m where m.class_id = p_class;
  return query
    select n,
           case when n >= 3 then coalesce(sum(p.reads), 0)::int else null end,
           case when n >= 3 and sum(p.quiz_total) > 0 then round(100.0 * sum(p.quiz_right) / sum(p.quiz_total))::int else null end
    from public.class_progress p where p.class_id = p_class and p.week = p_week;
end $$;

create or replace function public.class_goal(p_class uuid, p_week date)
returns table (name text, reads int)
language sql stable security definer set search_path = public as $$
  select c.name, coalesce((select sum(p.reads) from public.class_progress p where p.class_id = c.id and p.week = p_week), 0)::int
  from public.classes c
  where c.id = p_class
    and exists (select 1 from public.class_members m where m.class_id = c.id and m.user_id = auth.uid())
$$;

-- ---------- account deletion ----------
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  delete from auth.users where id = auth.uid();
end $$;

-- ---------- admin overview (counts only) ----------
create or replace function public.admin_overview()
returns table (families int, signed_in_7d int, reports_waiting int, classes int, pupils int)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then raise exception 'admins only'; end if;
  return query select
    (select count(*) from public.profiles)::int,
    (select count(*) from auth.users u where u.last_sign_in_at > now() - interval '7 days')::int,
    (select count(*) from public.reports r where r.status = 'pending')::int,
    (select count(*) from public.classes)::int,
    (select count(*) from public.class_members)::int;
end $$;

do $$
declare f text;
begin
  foreach f in array array[
    'join_class(text)', 'leave_class(uuid)', 'class_report(date,int,int,int)', 'class_summary(uuid,date)',
    'class_goal(uuid,date)', 'delete_my_account()', 'admin_overview()'
  ] loop
    execute format('revoke all on function public.%s from public, anon', f);
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;
end $$;
revoke all on function public.reports_guard() from public, anon, authenticated;
revoke all on function public.touch_updated_at() from public, anon, authenticated;
