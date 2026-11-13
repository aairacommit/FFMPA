# python3 tests/schedule_test.py  (checks cloudrun visible_edition against the same cases and the JS grid)
import json, os, sys, datetime as dt
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "cloudrun"))
from main import visible_edition
C = json.load(open(os.path.join(os.path.dirname(__file__), "schedule_cases.json")))
ts = lambda s: dt.datetime.fromisoformat(s.replace("Z", "+00:00")).timestamp()
bad = 0
for c in C["cases"]:
    r = visible_edition(c.get("log") or C["log"], ts(c["now"]), c["tz"])
    if not r or r["id"] != c["id"] or r["slot"] != c["slot"]:
        bad += 1; print("FAIL", c["why"], r)
grid = json.load(open("/tmp/schedule_grid.json")) if os.path.exists("/tmp/schedule_grid.json") else []
diff = 0
for tz, t, gid, gslot in grid:
    r = visible_edition(C["log"], t / 1000, tz)
    if (r["id"] if r else None) != gid or (r["slot"] if r else None) != gslot:
        diff += 1
        if diff < 5: print("GRID DIFF", tz, dt.datetime.fromtimestamp(t/1000, dt.timezone.utc), gid, gslot, r)
g2 = json.load(open("/tmp/schedule_grid2.json")) if os.path.exists("/tmp/schedule_grid2.json") else {"log": [], "grid": []}
for tz, t, gid, gslot in g2["grid"]:
    r = visible_edition(g2["log"], t / 1000, tz)
    if (r["id"] if r else None) != gid or (r["slot"] if r else None) != gslot:
        diff += 1
        if diff < 5: print("STEADY DIFF", tz, dt.datetime.fromtimestamp(t/1000, dt.timezone.utc), gid, gslot, r)
grid = grid + g2["grid"]
fz = json.load(open("/tmp/schedule_fuzz.json")) if os.path.exists("/tmp/schedule_fuzz.json") else []
for run in fz:
    for tz, t, gid, gslot, n in run["pts"]:
        lg = [e for e in run["log"] if ts(e["seen"]) * 1000 <= t][-20:]
        r = visible_edition(lg, t / 1000, tz)
        if (r["id"] if r else None) != gid or (r["slot"] if r else None) != gslot:
            diff += 1
            if diff < 5: print("FUZZ DIFF", tz, dt.datetime.fromtimestamp(t/1000, dt.timezone.utc), gid, gslot, r)
    grid = grid + [p[:4] for p in run["pts"]]
extra = json.load(open("/tmp/schedule_extra.json")) if os.path.exists("/tmp/schedule_extra.json") else []
for why, log, tz, now, gid, *times in extra:
    r = visible_edition(log, ts(now), tz, *(times or ["06:00", "19:00"]))
    if not r or r["id"] != gid:
        bad += 1; print("FAIL", why, r)
print(f"{len(C['cases'])-bad}/{len(C['cases'])} cases pass, {len(grid)-diff}/{len(grid)} grid points match JS")
sys.exit(1 if bad or diff else 0)
