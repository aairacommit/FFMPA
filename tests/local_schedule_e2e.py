# python3 tests/local_schedule_e2e.py
# Opens the built app (src/index.html) as ffmpa.com/app/ in Chrome with a fake clock and time zone, a fake
# edition_log from Supabase and fake edition files from GitHub, and checks which edition and label it shows.
import json, os, re, sys
from playwright.sync_api import sync_playwright

ROOT = os.path.join(os.path.dirname(__file__), "..")
APP = open(os.path.join(ROOT, "src", "index.html")).read()
LATEST = json.load(open(os.path.join(ROOT, "editions", "latest.json")))
AM = json.load(open(os.path.join(ROOT, "editions", "2026-11-13-am.json")))
LOG = json.load(open(os.path.join(ROOT, "tests", "schedule_cases.json")))["log"]
FILES = {"2026-11-13-am.json": AM, "2026-11-13-pm.json": LATEST, "latest.json": LATEST}

def run(tz, now_iso, expect_id, expect_label, log=LOG, last=None, sb_down=False, files=None, why=""):
    files = FILES if files is None else files
    with sync_playwright() as pw:
        b = pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
        c = b.new_context(timezone_id=tz, service_workers="block")
        def sb(route):
            u = route.request.url
            if sb_down:
                return route.abort()
            if route.request.method == "OPTIONS":
                return route.fulfill(status=200, headers={"access-control-allow-origin": "*", "access-control-allow-headers": "*"})
            body = []
            if "key=eq.edition_log" in u:
                body = [{"value": log}]
            route.fulfill(status=200, content_type="application/json", body=json.dumps(body), headers={"access-control-allow-origin": "*"})
        def gh(route):
            name = route.request.url.split("/editions/")[1].split("?")[0]
            if files.get(name) == "html":   # what an offline service worker used to hand back
                route.fulfill(status=200, content_type="text/html", body="<!doctype html><p>app</p>", headers={"access-control-allow-origin": "*"})
            elif name in files:
                route.fulfill(status=200, content_type="application/json", body=json.dumps(files[name]), headers={"access-control-allow-origin": "*"})
            else:
                route.fulfill(status=404, body="")
        c.route(re.compile(r"https://gqfxgkzetapivlbybamf\.supabase\.co/.*"), sb)
        c.route(re.compile(r"https://raw\.githubusercontent\.com/aairacommit/FFMPA/main/editions/.*"), gh)
        c.route(re.compile(r"https://ffmpa\.com/app/.*"), lambda r: r.fulfill(status=200, content_type="text/html", body=APP))
        c.route(re.compile(r"https://(?!ffmpa\.com|gqfxgkzetapivlbybamf|raw\.githubusercontent).*"), lambda r: r.abort())
        if last:
            c.add_init_script(f"try{{localStorage.setItem('ffmpa-ed-last','{last}')}}catch(e){{}}")
        p = c.new_page()
        p.clock.install(time=now_iso)
        p.goto("https://ffmpa.com/app/")
        p.wait_for_function("window.__edReady===true", timeout=15000)
        p.wait_for_timeout(500)
        got = p.evaluate("document.documentElement.dataset.edition||''")
        label = p.evaluate("(document.querySelector('#edPill .lbl')||{}).textContent||''")
        b.close()
    ok = got == expect_id and (expect_label is None or label == expect_label)
    print(("PASS" if ok else "FAIL"), why or "", tz, now_iso, "->", got or "(built-in edition)", label)
    return ok

results = [
    run("America/New_York", "2026-11-13T23:30:00Z", "2026-11-13-am", "Morning"),
    run("Australia/Sydney", "2026-11-13T20:00:00Z", "2026-11-13-pm", "Morning"),   # 7 am Sydney: India's evening file is their morning edition   # 6:30 pm ET: evening edition waits
    run("America/New_York", "2026-11-14T00:30:00Z", "2026-11-13-pm", "Evening"),   # 7:30 pm ET: released
    run("Asia/Kolkata", "2026-11-13T15:00:00Z", "2026-11-13-pm", "Evening"),       # 8:30 pm IST
    run("Europe/London", "2026-11-13T07:00:00Z", "2026-11-13-am", "Morning"),      # 7 am London
    run("Asia/Kolkata", "2026-11-13T15:00:00Z", "2026-11-13-pm", "Evening", log=None),  # no schedule: newest edition
    run("Asia/Kolkata", "2026-11-13T15:00:00Z", "2026-11-13-am", "Morning", last="2026-11-13-am", sb_down=True,
        files={"2026-11-13-am.json": AM, "latest.json": "html"}, why="offline: last edition this device showed"),
    run("America/New_York", "2026-11-13T23:30:00Z", "", None, files={"latest.json": LATEST},
        why="schedule says am, its file fails, latest.json is ahead: not shown early"),
    run("Asia/Kolkata", "2026-11-13T15:00:00Z", "", None, sb_down=True, files={"latest.json": "html"},
        why="offline, nothing cached: built-in edition, no crash"),
]
print(f"{sum(results)}/{len(results)} pass")
sys.exit(0 if all(results) else 1)
