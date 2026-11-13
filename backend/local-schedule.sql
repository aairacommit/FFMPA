-- 14 Nov 2026: editions and alerts follow each family's own clock (6:00 am and 7:00 pm local time).
-- Run after push.sql. Safe to run again.

-- Each alert device remembers its time zone and the last edition it was told about.
alter table public.push_subs add column if not exists tz text
  check (tz is null or (tz ~ '^[A-Za-z_]+(/[A-Za-z0-9_+-]+){0,2}$' and char_length(tz) < 64));
alter table public.push_subs add column if not exists last_edition text
  check (last_edition is null or last_edition ~ '^\d{4}-\d{2}-\d{2}-(am|pm)$');

-- save_push now also takes the device time zone. The 4 argument version stays for older app versions.
create or replace function public.save_push(p_endpoint text, p_p256dh text, p_auth text, p_country text, p_tz text)
returns void language plpgsql security definer set search_path = public as $$
declare v_tz text := case when p_tz ~ '^[A-Za-z_]+(/[A-Za-z0-9_+-]+){0,2}$' and char_length(p_tz) < 64 then p_tz end;
begin
  if auth.uid() is null then raise exception 'sign in first'; end if;
  if (select count(*) from public.push_subs where user_id = auth.uid()) >= 10
     and not exists (select 1 from public.push_subs where endpoint = p_endpoint) then
    raise exception 'too many devices';
  end if;
  insert into public.push_subs (user_id, endpoint, p256dh, auth, country, tz)
  values (auth.uid(), p_endpoint, p_p256dh, p_auth, nullif(p_country, ''), v_tz)
  on conflict (endpoint) do update
    set user_id = auth.uid(), p256dh = excluded.p256dh, auth = excluded.auth, country = excluded.country,
        tz = coalesce(excluded.tz, public.push_subs.tz);
end $$;
revoke all on function public.save_push(text, text, text, text, text) from public, anon;
grant execute on function public.save_push(text, text, text, text, text) to authenticated;

-- When each edition first appeared on main. The Cloud Run newsroom keeps this up to date every 10 minutes
-- (and drops an edition that was rolled back). Seeded from the merge times in git.
insert into public.app_config (key, value) values ('edition_log', '[
  {"id": "2026-11-11-am", "seen": "2026-11-11T17:34:57Z"},
  {"id": "2026-11-12-am", "seen": "2026-11-12T02:42:07Z"},
  {"id": "2026-11-13-am", "seen": "2026-11-13T02:45:09Z"},
  {"id": "2026-11-13-pm", "seen": "2026-11-13T14:44:37Z"}
]'::jsonb)
on conflict (key) do nothing;
