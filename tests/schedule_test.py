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
        if diff < 5: print("GRID DIFF", tz, dt.datetime.utcfromtimestamp(t/1000), gid, gslot, r)
g2 = json.load(open("/tmp/schedule_grid2.json")) if os.path.exists("/tmp/schedule_grid2.json") else {"log": [], "grid": []}
for tz, t, gid, gslot in g2["grid"]:
    r = visible_edition(g2["log"], t / 1000, tz)
    if (r["id"] if r else None) != gid or (r["slot"] if r else None) != gslot:
        diff += 1
        if diff < 5: print("STEADY DIFF", tz, dt.datetime.utcfromtimestamp(t/1000), gid, gslot, r)
grid = grid + g2["grid"]
print(f"{len(C['cases'])-bad}/{len(C['cases'])} cases pass, {len(grid)-diff}/{len(grid)} grid points match JS")
sys.exit(1 if bad or diff else 0)
