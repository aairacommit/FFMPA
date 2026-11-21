"""Checks backend/analytics.sql against a real local Postgres with a small stub of Supabase auth.

Usage: PGHOST=/tmp/pgt PGPORT=5499 PGUSER=postgres python3 backend/tests/analytics_sql_test.py
Creates and drops a scratch database called ffmpa_stats_test. pg_cron lines are left out locally.
"""
import json, os, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
DB = "ffmpa_stats_test"


def psql(sql, db=DB, check=True):
    r = subprocess.run(["psql", "-X", "-q", "-v", "ON_ERROR_STOP=1", "-At", "-d", db, "-c", sql],
                       capture_output=True, text=True)
    if check and r.returncode:
        raise SystemExit("SQL failed:\n" + r.stderr + "\n" + sql[:400])
    return r


def run_file(text):
    r = subprocess.run(["psql", "-X", "-q", "-v", "ON_ERROR_STOP=1", "-d", DB], input=text, capture_output=True, text=True)
    if r.returncode:
        raise SystemExit("file failed:\n" + r.stderr)


STUB = """
do $$ begin if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if; if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if; end $$;
create schema auth;
create table auth.users (id uuid primary key, email text, created_at timestamptz default now(), last_sign_in_at timestamptz);
create or replace function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('test.jwt', true), ''), '{}')::jsonb $$;
create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(auth.jwt() ->> 'sub', '')::uuid $$;
grant usage on schema auth to anon, authenticated;
"""
PUSH = """
create table if not exists public.push_subs (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique, p256dh text not null, auth text not null, country text, tz text, last_edition text,
  created_at timestamptz not null default now());
"""

checks = 0


def ok(cond, msg):
    global checks
    checks += 1
    if not cond:
        raise SystemExit("FAIL: " + msg)


def main():
    psql(f"drop database if exists {DB}", db="postgres")
    psql(f"create database {DB}", db="postgres")
    try:
        run_file(STUB)
        run_file((ROOT / "backend/schema.sql").read_text())
        run_file(PUSH)
        sql = (ROOT / "backend/analytics.sql").read_text()
        local = sql.split("-- hourly refresh at 10 past the hour")[0]
        ok("cron.schedule" in sql and "cron.schedule" not in local, "pg_cron schedule is in the file but cut locally")
        run_file(local)
        run_file(local)  # safe to run twice
        ok(psql("select count(*) from public.stats_daily").stdout.strip() != "", "backfill ran")

        today = psql("select (now() at time zone 'UTC')::date").stdout.strip()
        d = lambda n: psql(f"select (date '{today}' - {n})::text").stdout.strip()
        y = d(1)
        users = {
            "a": ("11111111-1111-1111-1111-111111111111", "mum@example.com"),
            "b": ("22222222-2222-2222-2222-222222222222", "dad@example.com"),
            "c": ("33333333-3333-3333-3333-333333333333", "teacher@example.com"),
            "adm": ("44444444-4444-4444-4444-444444444444", "aairainvests@gmail.com"),
            "play": ("55555555-5555-5555-5555-555555555555", "play-review@ffmpa.com"),
            "noconsent": ("66666666-6666-6666-6666-666666666666", "half@example.com"),
        }
        for k, (uid, em) in users.items():
            psql(f"insert into auth.users (id, email) values ('{uid}', '{em}')")
        prog = {
            # a: joined 2 days ago, read 4 stories yesterday, finished, 3 plus day, quiz
            "a": ({"age": "x", "country": "IN"}, {"read": {y: ["s1", "s2", "s3", "s4"]}, "stats": {"days": {y: True}, "editions": {y: 1}, "qAns": 5, "qRight": 4, "explainers": 7}, "words": ["orbit", "smog"]}, 2),
            # b: joined yesterday, read 1 story yesterday
            "b": ({"age": "n", "country": "GB"}, {"read": {y: ["s9"]}, "stats": {"qAns": "bad", "days": [y]}}, 1),
            # c: joined 8 days ago, active 6 days ago only, garbage shapes
            "c": ({"age": "o", "country": "nowhere"}, {"read": "oops", "stats": {"days": {d(6): True}}, "words": "x"}, 8),
            "adm": ({"age": "o", "country": "IN"}, {"read": {y: ["s1"]}}, 2),
            "play": ({"age": "o", "country": "IN"}, {"read": {y: ["s1"]}}, 2),
        }
        for k, (st, pr, ago) in prog.items():
            uid = users[k][0]
            psql(f"insert into public.profiles (id, settings, progress, consent_at, created_at) values ('{uid}', '{json.dumps(st)}', '{json.dumps(pr)}', now(), (date '{today}' - {ago} + time '12:00') at time zone 'Asia/Kolkata')")
        psql(f"insert into public.profiles (id, settings, progress) values ('{users['noconsent'][0]}', '{{}}', '{{}}')")
        psql(f"insert into public.push_subs (user_id, endpoint, p256dh, auth, created_at) values ('{users['a'][0]}', 'https://p/1', 'k', 'a', now() - interval '2 days'), ('{users['adm'][0]}', 'https://p/2', 'k', 'a', now() - interval '2 days')")
        psql(f"""insert into public.app_config (key, value) values ('edition_log', '[{{"id":"{y}-am","seen":"{y}T00:40:00Z"}},{{"id":"{y}-pm","seen":"{y}T11:50:00Z"}},{{"id":"{d(2)}-am","seen":"x"}}]')""")

        s = json.loads(psql(f"select public.stats_compute('{y}')").stdout)
        ok(s["families"] == 3, f"families yesterday: a, b and c, not admin, review or unconsented accounts (got {s['families']})")
        ok(s["new_families"] == 1, "b joined yesterday")
        ok(s["readers"] == 2 and s["stories_read"] == 5, f"readers and stories (got {s['readers']}, {s['stories_read']})")
        ok(s["active"] == 2, "both active yesterday")
        ok(s["three_plus"] == 1 and s["finished"] == 1, "a had a 3 plus day and finished; b's days list is ignored")
        ok(s["quiz_answered"] == 5 and s["quiz_right"] == 4 and s["explainers"] == 7, "quiz totals, bad values count as 0")
        ok(s["words"] == 2, "words")
        ok(s["age"] == {"x": 1, "o": 1, "n": 1} and s["age_active"] == {"x": 1, "o": 0, "n": 1}, f"age mix {s['age']}")
        ok(s["countries"] == {"IN": 1, "GB": 1, "other": 1}, f"countries {s['countries']}")
        ok(s["d1"] == {"n": 1, "back": 1} and s["d7"] == {"n": 1, "back": 0}, f"day 1: a came back; day 7: c did not ({s['d1']}, {s['d7']})")
        ok(s["active_7d"] == 3 and s["active_30d"] == 3, "7 and 30 day active include c")
        ok(s["alert_devices"] == 1, "admin alert device excluded")
        ok([e["id"] for e in s["editions"]] == [y + "-am", y + "-pm"], "editions that landed for that date")
        ok(s["approx"] is False, "yesterday is exact")

        t = json.loads(psql(f"select public.stats_compute('{today}')").stdout)
        ok(t["families"] == 3 and t["d1"] == {"n": 1, "back": 0}, "today: b joined yesterday and has not come back yet")
        ok(t["active_7d"] == 3, "active in the last 7 days: a, b and c (6 days ago)")
        c7 = json.loads(psql(f"select public.stats_compute('{d(6)}')").stdout)
        ok(c7["active"] == 1 and c7["families"] == 1 and c7["approx"] is True, "6 days ago: only c existed and was active; marked approx")
        ok(c7["countries"] == {"other": 1}, "an invalid country becomes other")

        # refresh recounts the last 4 days up to today (IST); today is live, older days final
        n = psql("select public.stats_refresh()").stdout.strip()
        ok(n == "4", f"refresh recounts 4 days (got {n})")
        ist = psql("select (now() at time zone 'Asia/Kolkata')::date").stdout.strip()
        ok(psql(f"select live from public.stats_daily where day = date '{ist}'").stdout.strip() == "t", "today is saved as live")
        ok(psql(f"select live from public.stats_daily where day = date '{ist}' - 3").stdout.strip() == "f", "3 days ago is final")
        old = psql(f"select computed_at from public.stats_daily where day = date '{ist}' - 6").stdout.strip()
        psql("select public.stats_refresh()")
        ok(psql(f"select computed_at from public.stats_daily where day = date '{ist}' - 6").stdout.strip() == old, "days older than 4 are never recounted")
        # values a family could tamper with are clamped
        psql(f"""update public.profiles set progress = jsonb_set(jsonb_set(progress, '{{stats,qAns}}', '1e300'), '{{stats,qRight}}', '-5') where id = '{users['b'][0]}'""")
        psql(f"""update public.profiles set progress = jsonb_set(progress, '{{read,{y}}}', (select jsonb_agg(g) from generate_series(1, 10000) g)) where id = '{users['b'][0]}'""")
        cl = json.loads(psql(f"select public.stats_compute('{y}')").stdout)
        ok(cl["quiz_answered"] == 5 + 100000 and cl["quiz_right"] == 4, f"quiz values clamped ({cl['quiz_answered']}, {cl['quiz_right']})")
        ok(cl["stories_read"] == 4 + 40, f"stories per family per day capped at 40 (got {cl['stories_read']})")
        # bad date keys never break the count
        psql(f"""update public.profiles set progress = jsonb_set(progress, '{{stats,days}}', '{{"2026-13-45": true, "x": true}}') where id = '{users['c'][0]}'""")
        ok(json.loads(psql(f"select public.stats_compute('{y}')").stdout)["families"] == 3, "invalid date keys are ignored")

        # admin only
        r = psql("select count(*) from public.admin_stats(30)", check=False)
        ok(r.returncode != 0 and "admins only" in r.stderr, "admin_stats refuses non admins")
        r = psql("set test.jwt = '{\"email\":\"Aairainvests@gmail.com\"}'; select count(*), sum(live::int) from public.admin_stats(30)")
        cnt, live = r.stdout.strip().split("|")
        ok(int(live) >= 1 and int(cnt) >= 4, "admins see saved rows, today marked live")
        r = psql("set role authenticated; select count(*) from public.stats_daily", check=False)
        ok(r.returncode != 0, "families cannot read the stats table")
        r = psql("set role authenticated; select public.stats_compute(current_date)", check=False)
        ok(r.returncode != 0, "families cannot call stats_compute")
        r = psql("set role authenticated; select public.stats_refresh()", check=False)
        ok(r.returncode != 0, "families cannot call stats_refresh")
        r = psql("set role anon; select * from public.admin_stats(5)", check=False)
        ok(r.returncode != 0, "anon cannot call admin_stats")
        # account deletion leaves only totals behind
        psql(f"delete from auth.users where id = '{users['a'][0]}'")
        s2 = json.loads(psql(f"select public.stats_compute('{y}')").stdout)
        ok(s2["families"] == 2, "deleted family disappears from fresh counts")
    finally:
        psql(f"drop database if exists {DB}", db="postgres", check=False)
    print(f"analytics_sql_test: {checks} checks passed")


if __name__ == "__main__":
    main()
