-- FFMPA edition alerts (web push). Run after schema.sql. Safe to run again.
-- Families opt in from parent settings. Subscriptions belong to the signed-in account.
-- The sender is the Edge Function `notify-edition`, called every 10 minutes by pg_cron.
-- It generates its own signing keys on first run, so no secret is ever typed or committed.

create table if not exists public.push_subs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique check (endpoint ~ '^https://' and char_length(endpoint) < 1000),
  p256dh text not null check (char_length(p256dh) < 200),
  auth text not null check (char_length(auth) < 100),
  country text check (country ~ '^[A-Z]{2}$'),
  created_at timestamptz not null default now()
);
create index if not exists push_subs_user on public.push_subs (user_id);
alter table public.push_subs enable row level security;
revoke all on public.push_subs from anon, authenticated;

create table if not exists public.push_keys (
  id int primary key check (id = 1),
  private_jwk jsonb not null,
  public_key text not null,
  created_at timestamptz not null default now()
);
alter table public.push_keys enable row level security;
revoke all on public.push_keys from anon, authenticated;

create or replace function public.save_push(p_endpoint text, p_p256dh text, p_auth text, p_country text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  if (select count(*) from public.push_subs where user_id = auth.uid()) >= 10
     and not exists (select 1 from public.push_subs where endpoint = p_endpoint) then
    raise exception 'too many devices';
  end if;
  insert into public.push_subs (user_id, endpoint, p256dh, auth, country)
  values (auth.uid(), p_endpoint, p_p256dh, p_auth, nullif(p_country, ''))
  on conflict (endpoint) do update
    set user_id = auth.uid(), p256dh = excluded.p256dh, auth = excluded.auth, country = excluded.country;
end $$;

create or replace function public.drop_push(p_endpoint text)
returns void language sql security definer set search_path = public as $$
  delete from public.push_subs where endpoint = p_endpoint and user_id = auth.uid();
$$;

revoke all on function public.save_push(text, text, text, text) from public, anon;
revoke all on function public.drop_push(text) from public, anon;
grant execute on function public.save_push(text, text, text, text) to authenticated;
grant execute on function public.drop_push(text) to authenticated;

-- admin overview gains the number of devices with alerts on
drop function if exists public.admin_overview();
create or replace function public.admin_overview()
returns table (families int, signed_in_7d int, reports_waiting int, classes int, pupils int, alert_devices int)
language plpgsql stable security definer set search_path = public, auth as $$
begin
  if not public.is_admin() then raise exception 'admins only'; end if;
  return query select
    (select count(*) from public.profiles)::int,
    (select count(*) from auth.users u where u.last_sign_in_at > now() - interval '7 days')::int,
    (select count(*) from public.reports r where r.status = 'pending')::int,
    (select count(*) from public.classes)::int,
    (select count(*) from public.class_members)::int,
    (select count(*) from public.push_subs)::int;
end $$;
revoke all on function public.admin_overview() from public, anon;
grant execute on function public.admin_overview() to authenticated;

-- every 10 minutes: send alerts if a new edition for today has been published
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.unschedule(jobid) from cron.job where jobname = 'notify-edition';
select cron.schedule('notify-edition', '*/10 * * * *', $cron$
  select net.http_post(
    url := 'https://gqfxgkzetapivlbybamf.supabase.co/functions/v1/notify-edition',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
$cron$);
