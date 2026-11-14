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
    "h": {"tz": "Europe/London", "last_edition": "2026-11-13-am"},     # 0:30 am: quiet hours: alert held until 6 am
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
GONE = set()   # edition files deleted from main (a revert deletes them)
def get(url, params=None, timeout=None):
    return R(404 if url.rsplit("/", 1)[1][:-5] in GONE else 200)
main.http.get = get
main.requests.get = get   # the file check uses requests.get directly (thread safe)
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
    ("London in quiet hours: alert held, edition not consumed", SUBS["h"]["last_edition"] == "2026-11-13-am" and "h" not in sent),
    ("Los Angeles still on morning edition", SUBS["d"]["last_edition"] == "2026-11-13-am"),
    ("second run sends nothing", (sent.clear(), main.notify().get_json())[1]["sent"] == 0 and not sent),
    ("edition log unchanged", config["edition_log"] == LOG),
]
# a stale cached latest.json (older edition) while the evening file is still on main: never a rollback
main.fetch_json = lambda url: {"date": "2026-11-13", "edition": "am", "stories": [1] * 12}
main.notify(); main.time.time = lambda: NOW + 400; main.notify(); main.time.time = lambda: NOW
checks.append(("stale latest.json with the newer file still on main never cuts the log", config["edition_log"] == LOG and not config.get("edition_log_pending")))
# roll back: latest.json goes back to the morning edition and the evening file is deleted.
# One read is not enough (could be a stale cache).
GONE.add("2026-11-13-pm")
main.fetch_json = lambda url: {"date": "2026-11-13", "edition": "am", "stories": [1] * 12}
# a device that is still on the morning edition while the roll back is being confirmed must not be told about pm
SUBS["j"] = {"id": "j", "tz": "America/New_York", "last_edition": "2026-11-13-am", "endpoint": "https://push.example/j"}
main.notify()
checks.append(("one stale read does not cut the log", [e["id"] for e in config["edition_log"]][-1] == "2026-11-13-pm"))
checks.append(("no alert for an edition newer than main serves", "j" not in sent and SUBS["j"]["last_edition"] == "2026-11-13-am"))
main.time.time = lambda: NOW + 60
main.notify()
checks.append(("two reads a minute apart do not cut the log", [e["id"] for e in config["edition_log"]][-1] == "2026-11-13-pm"))
main.time.time = lambda: NOW + 360
main.notify()
checks.append(("a roll back seen 5 minutes later removes the evening edition", [e["id"] for e in config["edition_log"]][-1] == "2026-11-13-am"))
checks.append(("no alert for a rolled back edition", not sent))
# the same edition is merged again: it keeps its original time and nobody is alerted twice
GONE.clear()
main.fetch_json = lambda url: {"date": "2026-11-13", "edition": "pm", "stories": [1] * 8}
main.notify()
checks.append(("re-merged edition keeps its original time", config["edition_log"][-1] == LOG[-1]))
checks.append(("nobody alerted twice after pm, am, pm (only j, never told, gets pm once)", sent == ["j"]))
# 6:10 am London: the alert held overnight goes out once
sent.clear(); main.time.time = lambda: NOW + 5 * 3600 + 40 * 60
main.notify(); main.notify()
checks.append(("held London alert sent once after 6 am", sent.count("h") == 1 and SUBS["h"]["last_edition"] == "2026-11-13-pm"))
# malformed and impossible entries in the stored log never break a run
config["edition_log"] = config["edition_log"] + [{"id": "2026-02-30-am", "seen": "2026-11-13T15:00:00Z"}, "junk", {"id": "2026-11-13-am"}]
try:
    main.notify(); ok = True
except Exception as ex:
    ok = False; print("notify crashed:", ex)
checks.append(("bad log entries are dropped, run does not crash", ok and all(isinstance(x, dict) and x["id"] != "2026-02-30-am" for x in config["edition_log"])))
# roll back to an edition that is no longer in the log: confirmed after 5 minutes, newer entries removed
config["edition_log"] = [{"id": f"2026-11-{d:02d}-{k}", "seen": f"2026-11-{d:02d}T{'00:45' if k == 'am' else '13:45'}:00Z"} for d in range(4, 14) for k in ("am", "pm")]
config.pop("edition_log_pending", None); config.pop("edition_log_removed", None)
main.fetch_json = lambda url: {"date": "2026-11-03", "edition": "pm", "stories": [1] * 8}
GONE.update(e["id"] for e in config["edition_log"])
T0 = NOW + 7 * 3600
main.time.time = lambda: T0; main.notify()
first = [e["id"] for e in config["edition_log"]][-1]
main.time.time = lambda: T0 + 400; main.notify()
ids = [e["id"] for e in config["edition_log"]]
checks.append(("roll back to an edition older than the log is detected and confirmed", first == "2026-11-13-pm" and ids == ["2026-11-03-pm"]))
vis = [main.visible_edition(config["edition_log"], T0 + 400, z) for z in ("Asia/Kolkata", "America/New_York", "Pacific/Kiritimati", "Pacific/Pago_Pago")]
checks.append(("the restored edition shows at once in every zone", all(v and v["id"] == "2026-11-03-pm" for v in vis)))
# an older edition merged late (a held morning PR merged after the evening one) is added, nothing removed
GONE.clear(); config.pop("edition_log_pending", None); config.pop("edition_log_removed", None)
config["edition_log"] = [x for x in LOG if x["id"] != "2026-11-13-am"]
main.fetch_json = lambda url: {"date": "2026-11-13", "edition": "am", "stories": [1] * 12}
main.time.time = lambda: T0; main.notify(); main.time.time = lambda: T0 + 400; main.notify()
ids = [e["id"] for e in config["edition_log"]]
checks.append(("an older edition merged late is added and the newer one kept", "2026-11-13-am" in ids and "2026-11-13-pm" in ids))
# roll back while GitHub still serves the deleted file from its cache on the first run: the restored edition
# (never logged) must still show at once once the rollback is confirmed
GONE.clear(); config.pop("edition_log_pending", None); config.pop("edition_log_removed", None)
config["edition_log"] = [x for x in LOG if x["id"] != "2026-11-13-am"]
main.fetch_json = lambda url: {"date": "2026-11-13", "edition": "am", "stories": [1] * 12}
T1 = dt.datetime(2026, 11, 13, 14, 30, tzinfo=dt.timezone.utc).timestamp() + 86400 * 0
main.time.time = lambda: T1; main.notify()            # cached 200 for 13-pm
GONE.add("2026-11-13-pm")
main.time.time = lambda: T1 + 400; main.notify()      # now 404: wait 5 more minutes
main.time.time = lambda: T1 + 800; main.notify()      # still 404: confirmed
ids = [e["id"] for e in config["edition_log"]]
vis = [main.visible_edition(config["edition_log"], T1 + 800, z) for z in ("America/New_York", "Europe/London", "Asia/Kolkata")]
checks.append(("rollback with a cached deleted file: restored edition shows at once", "2026-11-13-pm" not in ids and all(v and v["id"] == "2026-11-13-am" for v in vis)))
# a file seen gone only once (a false 404) never removes anything
GONE.clear(); config.pop("edition_log_pending", None)
config["edition_log"] = list(LOG)
main.time.time = lambda: T1; GONE.add("2026-11-13-pm"); main.notify()
GONE.clear(); main.time.time = lambda: T1 + 400; main.notify()
checks.append(("a single false 404 removes nothing", config["edition_log"] == LOG))
# revert 13-pm, then 14-am is merged before the rollback is confirmed: 13-pm is still removed
GONE.clear(); config.pop("edition_log_pending", None); config.pop("edition_log_removed", None)
config["edition_log"] = [{"id": "2026-11-13-am", "seen": "2026-11-13T00:10:00Z"}, {"id": "2026-11-13-pm", "seen": "2026-11-13T13:00:00Z"}]
main.fetch_json = lambda url: {"date": "2026-11-13", "edition": "am", "stories": [1] * 12}
GONE.add("2026-11-13-pm"); main.time.time = lambda: T1; main.notify()
main.fetch_json = lambda url: {"date": "2026-11-14", "edition": "am", "stories": [1] * 12}
main.time.time = lambda: T1 + 600; main.notify(); main.time.time = lambda: T1 + 1200; main.notify()
checks.append(("a newer merge does not cancel a rollback", [x["id"] for x in config["edition_log"]] == ["2026-11-13-am", "2026-11-14-am"]))
# a rollback never rewrites the time of an edition already in the log
GONE.clear(); config.pop("edition_log_pending", None); config.pop("edition_log_removed", None)
config["edition_log"] = [{"id": "2026-11-12-pm", "seen": "2026-11-12T13:30:00Z"}, {"id": "2026-11-13-am", "seen": "2026-11-13T10:00:00Z"}, {"id": "2026-11-13-pm", "seen": "2026-11-13T13:00:00Z"}]
main.fetch_json = lambda url: {"date": "2026-11-13", "edition": "am", "stories": [1] * 12}
GONE.add("2026-11-13-pm"); main.time.time = lambda: T1; main.notify(); main.time.time = lambda: T1 + 600; main.notify()
checks.append(("a rollback keeps the logged time of the restored edition", config["edition_log"] == [{"id": "2026-11-12-pm", "seen": "2026-11-12T13:30:00Z"}, {"id": "2026-11-13-am", "seen": "2026-11-13T10:00:00Z"}]))
# a malformed pending value never crashes a run
config["edition_log_pending"] = {"rollback_to": "2026-11-13-am", "at": "x"}
try:
    main.notify(); ok = True
except Exception as ex:
    ok = False; print("crash:", ex)
checks.append(("malformed pending value does not crash", ok))
for name, ok in checks:
    print("PASS" if ok else "FAIL", name)
print(json.dumps(res))
sys.exit(0 if all(ok for _, ok in checks) else 1)
