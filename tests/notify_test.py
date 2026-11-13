# python3 tests/notify_test.py  (Cloud Run alert sender against a fake Supabase and fake push services)
import json, os, sys, re, datetime as dt
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "cloudrun"))
os.environ["SUPABASE_SECRET_KEY"] = "test"
import main

LOG = json.load(open(os.path.join(os.path.dirname(__file__), "schedule_cases.json")))["log"]
NOW = dt.datetime(2026, 11, 14, 0, 30, tzinfo=dt.timezone.utc).timestamp()  # 7:30 pm New York, 6:00 am India, 0:30 London
SUBS = {
    "a": {"tz": "America/New_York", "last_edition": "2026-11-13-am"},  # evening edition just released: alert
    "b": {"tz": "America/New_York", "last_edition": None},             # new device: remember quietly
    "c": {"tz": "Asia/Kolkata", "last_edition": "2026-11-13-pm"},      # already told: nothing
    "d": {"tz": "America/Los_Angeles", "last_edition": "2026-11-13-am"},  # 4:30 pm: still morning edition: nothing
    "f": {"tz": "Asia/Kolkata", "last_edition": "2026-11-14-am"},      # that edition was rolled back: update quietly
    "g": {"tz": "Australia/Sydney", "last_edition": "2026-11-13-am"},  # 11:30 am: evening edition from 6 am: alert
    "h": {"tz": "Europe/London", "last_edition": "2026-11-13-am"},     # 0:30 am: quiet hours: update, no alert
    "i": {"tz": None, "last_edition": "2026-11-13-am"},                # no time zone yet: treated as India
}
for k, v in SUBS.items():
    v["id"] = k; v["endpoint"] = f"https://push.example/{k}"
config = {"edition_log": list(LOG), "admin": {"amTime": "06:00", "pmTime": "19:00"}}
sent = []

def sb_get(table, q):
    if table == "app_config":
        key = re.search(r"key=eq\.([a-z_]+)", q).group(1)
        return [{"value": config[key]}] if key in config else []
    if table == "push_subs":
        return [dict(v) for v in SUBS.values()] if "offset=0" in q else []
    if table == "push_keys":
        return []
    raise AssertionError(table)

def sb_patch(table, q, body):
    ids = re.search(r"id=in\.\(([^)]*)\)", q).group(1).split(",")
    out = []
    for i in ids:
        row = SUBS[i]
        if "last_edition=is.null" in q and row["last_edition"] is not None:
            continue
        m = re.search(r"last_edition=lt\.([0-9a-z-]+)", q)
        if m and not (row["last_edition"] or "") < m.group(1):
            continue
        row["last_edition"] = body["last_edition"]; out.append(dict(row))
    return out

class R:
    def __init__(self, code): self.status_code = code; self.ok = code < 300
def post(url, headers=None, timeout=None):
    sent.append(url.rsplit("/", 1)[1]); return R(201)

main.sb_get = sb_get
main.sb_patch = sb_patch
main.sb_upsert = lambda t, row: config.__setitem__(row["key"], row["value"])
main.sb_insert = lambda t, row: True
main.sb_delete = lambda t, q: None
main.http.post = post
main.fetch_json = lambda url: {"date": "2026-11-13", "edition": "pm", "stories": [1] * 8}
main.time.time = lambda: NOW
main.load_keys = lambda: (main.ec.generate_private_key(main.ec.SECP256R1()), "pub")

ctx = main.app.test_request_context(); ctx.push()
res = main.notify().get_json()
expect_sent = {"a", "g", "i"}
checks = [
    ("alerts sent to a, g and i only", set(sent) == expect_sent),
    ("new device b remembered without alert", SUBS["b"]["last_edition"] == "2026-11-13-pm" and "b" not in sent),
    ("device on a rolled back edition is left alone, no alert", SUBS["f"]["last_edition"] == "2026-11-14-am" and "f" not in sent),
    ("London in quiet hours: updated, no alert", SUBS["h"]["last_edition"] == "2026-11-13-pm" and "h" not in sent),
    ("Los Angeles still on morning edition", SUBS["d"]["last_edition"] == "2026-11-13-am"),
    ("second run sends nothing", (sent.clear(), main.notify().get_json())[1]["sent"] == 0 and not sent),
    ("edition log unchanged", config["edition_log"] == LOG),
]
# roll back: latest.json goes back to the morning edition. One read is not enough (could be a stale cache).
main.fetch_json = lambda url: {"date": "2026-11-13", "edition": "am", "stories": [1] * 12}
main.notify()
checks.append(("one stale read does not cut the log", [e["id"] for e in config["edition_log"]][-1] == "2026-11-13-pm"))
main.notify()
checks.append(("a confirmed roll back removes the evening edition", [e["id"] for e in config["edition_log"]][-1] == "2026-11-13-am"))
checks.append(("no alert for a rolled back edition", not sent))
# the same edition is merged again: it keeps its original time and nobody is alerted twice
main.fetch_json = lambda url: {"date": "2026-11-13", "edition": "pm", "stories": [1] * 8}
main.notify()
checks.append(("re-merged edition keeps its original time", config["edition_log"][-1] == LOG[-1]))
checks.append(("nobody alerted twice after pm, am, pm", not sent))
for name, ok in checks:
    print("PASS" if ok else "FAIL", name)
print(json.dumps(res))
sys.exit(0 if all(ok for _, ok in checks) else 1)
