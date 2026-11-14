"""FFMPA newsroom service on Google Cloud Run.

Two jobs:
1. Edition alerts on each family's local clock. Cloud Scheduler calls POST /tasks/notify every 10 minutes.
   It records when each edition first appears on GitHub (app_config "edition_log", which the app also reads),
   works out which edition each device's time zone should be seeing now (6:00 am and 7:00 pm local release
   times, see visible_edition), and sends one web push when that changes. Pushes carry no data. Each device is
   claimed in the database before it is sent to, so overlapping runs never send twice, and a device is never moved
   back to an older edition. No alerts 9 pm to 6 am (held until the first run after 6 am). A rollback (newer edition files gone from main) must be seen on two runs 5 minutes apart.
2. Public story pages. GET /s/ lists the last three days of stories; GET /s/<id> shows one story at the
   Thinkers level (ages 10 to 12) with its word explainers, think question and sources, marked up as a
   NewsArticle for search engines. Data is read from the public editions folder on GitHub.

Secrets: SUPABASE_SECRET_KEY comes from Secret Manager. Nothing personal is stored here.
"""
import base64, datetime as dt, html, json, os, re, threading, time
import requests
from concurrent.futures import ThreadPoolExecutor
from zoneinfo import ZoneInfo
from flask import Flask, Response, abort, jsonify, request
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec, utils

SB = os.environ.get("SUPABASE_URL", "https://gqfxgkzetapivlbybamf.supabase.co")
SB_KEY = os.environ.get("SUPABASE_SECRET_KEY", "")
RAW = "https://raw.githubusercontent.com/aairacommit/FFMPA/main/editions/"
SITE = "https://ffmpa.com"
IST = dt.timezone(dt.timedelta(hours=5, minutes=30))
app = Flask(__name__)
http = requests.Session()


# ---------------------------------------------------------------- Supabase (service role, server side only)
def _sb_headers(extra=None):
    h = {"apikey": SB_KEY, "Content-Type": "application/json"}
    if SB_KEY.startswith("eyJ"):  # legacy JWT keys also go in Authorization
        h["Authorization"] = "Bearer " + SB_KEY
    h.update(extra or {})
    return h

def sb_get(table, query):
    r = http.get(f"{SB}/rest/v1/{table}?{query}", headers=_sb_headers(), timeout=20)
    r.raise_for_status()
    return r.json()

def sb_upsert(table, row):
    r = http.post(f"{SB}/rest/v1/{table}", headers=_sb_headers({"Prefer": "resolution=merge-duplicates,return=minimal"}),
                  data=json.dumps(row), timeout=20)
    r.raise_for_status()

def sb_insert(table, row):
    r = http.post(f"{SB}/rest/v1/{table}", headers=_sb_headers({"Prefer": "return=minimal"}), data=json.dumps(row), timeout=20)
    return r.ok

def sb_delete(table, query):
    r = http.delete(f"{SB}/rest/v1/{table}?{query}", headers=_sb_headers(), timeout=20)
    r.raise_for_status()


# ---------------------------------------------------------------- VAPID (web push signing)
def b64u(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()

def unb64u(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))

def load_keys():
    """Same key pair the app already uses (stored in Supabase push_keys); created on first run only."""
    rows = sb_get("push_keys", "id=eq.1&select=private_jwk,public_key")
    if not rows:
        k = ec.generate_private_key(ec.SECP256R1())
        n = k.private_numbers()
        jwk = {"kty": "EC", "crv": "P-256", "d": b64u(n.private_value.to_bytes(32, "big")),
               "x": b64u(n.public_numbers.x.to_bytes(32, "big")), "y": b64u(n.public_numbers.y.to_bytes(32, "big")),
               "ext": True, "key_ops": ["sign"]}
        pub = b64u(k.public_key().public_bytes(serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint))
        sb_insert("push_keys", {"id": 1, "private_jwk": jwk, "public_key": pub})
        rows = sb_get("push_keys", "id=eq.1&select=private_jwk,public_key")  # another run may have won the race
    row = rows[0]
    sb_upsert("app_config", {"key": "vapid_public", "value": row["public_key"]})
    priv = ec.derive_private_key(int.from_bytes(unb64u(row["private_jwk"]["d"]), "big"), ec.SECP256R1())
    return priv, row["public_key"]

def vapid_header(endpoint, priv, pub, cache):
    aud = "/".join(endpoint.split("/")[:3])
    if aud not in cache:
        h = b64u(json.dumps({"typ": "JWT", "alg": "ES256"}).encode())
        p = b64u(json.dumps({"aud": aud, "exp": int(time.time()) + 12 * 3600, "sub": "mailto:hello@ffmpa.com"}).encode())
        der = priv.sign(f"{h}.{p}".encode(), ec.ECDSA(hashes.SHA256()))
        r, s = utils.decode_dss_signature(der)
        cache[aud] = f"{h}.{p}.{b64u(r.to_bytes(32, 'big') + s.to_bytes(32, 'big'))}"
    return f"vapid t={cache[aud]}, k={pub}"


# ---------------------------------------------------------------- editions (public, from GitHub)
_cache = {"at": 0.0, "eds": []}
_lock = threading.Lock()

def fetch_json(url):
    r = http.get(url, params={"h": int(time.time())}, timeout=15)
    return r.json() if r.ok else None

def editions():
    """Latest edition plus the last three days of archive files, newest first. Cached for 5 minutes."""
    with _lock:
        if time.time() - _cache["at"] < 300 and _cache["eds"]:
            return _cache["eds"]
        eds, seen = [], set()
        latest = fetch_json(RAW + "latest.json")
        if latest:
            eds.append(latest); seen.add((latest.get("date"), latest.get("edition")))
        today = dt.datetime.now(IST).date()
        for back in range(3):
            day = (today - dt.timedelta(days=back)).isoformat()
            for part in ("pm", "am"):
                if (day, part) in seen:
                    continue
                e = fetch_json(f"{RAW}{day}-{part}.json")
                if e:
                    eds.append(e); seen.add((day, part))
        _cache.update(at=time.time(), eds=eds)
        return eds

def stories():
    out, seen = [], set()
    for e in editions():
        for s in e.get("stories", []):
            if s.get("id") in seen or not s.get("o"):
                continue
            seen.add(s["id"])
            out.append((s, e))
    return out


# ---------------------------------------------------------------- local edition schedule
# Same rules as src/schedule.js (ffEditionFor). tests/schedule_cases.json checks both.
LATE_SECONDS = 3 * 3600  # a late edition landing up to 3 hours after a release shows as it lands
DAY = (6, 21)            # ...and so does one landing in the daytime, 06:00 to 20:59 local
EDITION_ID = re.compile(r"^\d{4}-\d{2}-\d{2}-(am|pm)\Z")

def _zone(tz):
    try:
        return ZoneInfo(tz) if tz else ZoneInfo("Asia/Kolkata")
    except Exception:
        return ZoneInfo("Asia/Kolkata")

def _hm(s, default):
    # release times must be 04:00 to 22:59: other hours can fall in a daylight saving gap or repeat
    m = re.fullmatch(r"(\d{1,2}):(\d{2})", s or "")
    return (int(m.group(1)), int(m.group(2))) if m and 4 <= int(m.group(1)) <= 22 and int(m.group(2)) < 60 else default

def _parse(ts):
    return dt.datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp()

def visible_edition(log, now, tz, am_time="06:00", pm_time="19:00"):
    """log: [{id, seen}], now: unix seconds. Returns {"id", "slot", "at"} or None. Same rules as
    ffEditionFor in src/schedule.js: each edition is due at its own local release (D-am at the morning time
    on day D, D-pm at the evening time); it shows when due if it landed by then; if later, as it lands
    in the daytime (06:00 to 20:59 local) or within 3 hours after a release, otherwise at the next release.
    The newest showable edition wins."""
    z = _zone(tz)
    am, pm = _hm(am_time, (6, 0)), _hm(pm_time, (19, 0))
    # the evening time must be 11 to 13 hours after the morning time; otherwise use 06:00 and 19:00
    if not 660 <= (pm[0] * 60 + pm[1]) - (am[0] * 60 + am[1]) <= 780:
        am, pm = (6, 0), (19, 0)

    def rel(d, slot):
        h, mi = am if slot == "am" else pm
        return dt.datetime(d.year, d.month, d.day, h, mi).replace(tzinfo=z).timestamp()

    def around(t):
        """the release just before t and the first release after t, on this family's clock"""
        d0 = dt.datetime.fromtimestamp(t, z).date()
        prev = nxt = None
        for k in (-1, 0, 1):
            d = d0 + dt.timedelta(days=k)
            for slot in ("am", "pm"):
                r = rel(d, slot)
                if r <= t:
                    prev = (r, slot)
                elif nxt is None:
                    nxt = (r, slot)
        return prev, nxt

    best = None
    for e in log or []:
        try:
            eid, t = e.get("id") or "", _parse(e["seen"])
        except Exception:
            continue
        if not isinstance(eid, str) or not EDITION_ID.match(eid) or t > now:
            continue
        try:
            day = dt.date(int(eid[0:4]), int(eid[5:7]), int(eid[8:10]))
        except ValueError:                 # not a real date
            continue
        due = rel(day, eid[11:])
        if t <= due:                       # landed in time: shows when due
            show, slot, at = due, eid[11:], due
        else:
            (p_t, p_slot), (n_t, n_slot) = around(t)
            hour = dt.datetime.fromtimestamp(t, z).hour
            # late: shows as it lands in the daytime (06:00 to 20:59 local) or within 3 hours of a release
            if t <= p_t + LATE_SECONDS or DAY[0] <= hour < DAY[1]:
                show, slot, at = t, p_slot, p_t
            else:                          # otherwise it waits for the next release
                show, slot, at = n_t, n_slot, n_t
        if show <= now and (best is None or eid > best["id"]):
            best = {"id": eid, "slot": slot, "at": at}
    return best

def _cfg(key, default):
    row = sb_get("app_config", f"key=eq.{key}&select=value")
    return row[0]["value"] if row and row[0].get("value") is not None else default

def _valid_id(eid):
    if not isinstance(eid, str) or not EDITION_ID.match(eid):
        return False
    try:
        dt.date(int(eid[0:4]), int(eid[5:7]), int(eid[8:10]))
        return True
    except ValueError:
        return False

def _valid_entry(x):
    if not isinstance(x, dict) or not _valid_id(x.get("id")) or not isinstance(x.get("seen"), str):
        return False
    try:
        _parse(x["seen"])
        return True
    except Exception:
        return False

def _edition_file_state(eid):
    """True if editions/<eid>.json is on main, False if GitHub says it is gone (404), None if unsure."""
    try:   # plain requests.get: called from several threads at once
        r = requests.get(RAW + eid + ".json", params={"h": int(time.time())}, timeout=10)
    except requests.RequestException:
        return None
    return True if r.ok else (False if r.status_code == 404 else None)

def _iso(t):
    return dt.datetime.fromtimestamp(t, dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def update_edition_log(now=None):
    """Record when each edition first appeared on main (app_config edition_log, read by the app).
    An edition is removed only when its file has been gone from main (a revert deletes it) for at least
    5 minutes across runs, whatever latest.json says, so a stale cached read or one false 404 never hides an
    edition, and a newer merge cannot cancel a rollback. An older edition than the newest logged one is added
    only after 5 minutes with nothing deleted (a late merge, at its first sighting time), or when a rollback
    is confirmed (then it shows at once everywhere). Logged times are never rewritten; an edition that comes
    back keeps its original time."""
    now = now or time.time()
    e = fetch_json(RAW + "latest.json") or {}
    lid = f"{e.get('date')}-{e.get('edition') or 'am'}"
    raw = _cfg("edition_log", [])
    log = [x for x in (raw if isinstance(raw, list) else []) if _valid_entry(x)]
    if not _valid_id(lid) or not e.get("stories"):
        if log != raw:   # write back a log with bad entries dropped
            sb_upsert("app_config", {"key": "edition_log", "value": log})
        return log, lid
    pending0 = _cfg("edition_log_pending", {}) or {}
    pending0 = pending0 if isinstance(pending0, dict) else {}
    removed0 = _cfg("edition_log_removed", []) or []
    removed0 = [x for x in removed0 if _valid_entry(x)] if isinstance(removed0, list) else []
    removed = list(removed0)
    # pending: {"gone": {id: first time its file was seen deleted}, "older": {id: first time it was current}}
    gone0 = pending0.get("gone") if isinstance(pending0.get("gone"), dict) else {}
    older0 = pending0.get("older") if isinstance(pending0.get("older"), dict) else {}
    def _t(v):
        try:
            return float(v)
        except (TypeError, ValueError):
            return None
    gone0 = {k: _t(v) for k, v in gone0.items() if _t(v) is not None}
    older0 = {k: _t(v) for k, v in older0.items() if _t(v) is not None}
    ids = [x["id"] for x in log]
    newer = sorted(i for i in ids if i > lid)
    # Which logged files to check this run: every id already suspected, and, when an older edition than the
    # newest logged one is current, all newer ids (normally just the newest one, one request).
    check = set(i for i in gone0 if i in ids)
    states = {}
    if newer:
        if not (lid not in ids or check):
            states[newer[-1]] = _edition_file_state(newer[-1])   # the gate: one request
        if lid not in ids or check or states.get(newer[-1]) is False:
            check |= set(newer)
    check = sorted(i for i in check if i not in states)
    if check:
        with ThreadPoolExecutor(max_workers=8) as ex:
            states.update(zip(check, ex.map(_edition_file_state, check)))
    # an id stays suspected while its file is deleted (or unsure); it is removed after 5 minutes deleted
    gone = {i: (gone0.get(i) or now) for i, st in states.items() if st is False or (st is None and i in gone0)}
    confirmed = [i for i, t0 in gone.items() if states.get(i) is False and now - t0 >= 300]
    new = log
    if confirmed:
        new = [x for x in log if x["id"] not in confirmed]
        removed = (removed + [x for x in log if x["id"] in confirmed])[-20:]
        for i in confirmed:
            gone.pop(i)
    older = {}
    cur_ids = [x["id"] for x in new]
    if lid not in cur_ids:
        back = next((x for x in removed if x.get("id") == lid), None)
        seen = None
        if back:
            # came back: keeps its original time, but only once its file is really on main again (a stale
            # latest.json naming a reverted edition must not bring it back)
            if lid not in confirmed and _edition_file_state(lid) is True:
                seen = back["seen"]
        elif confirmed and lid < min(confirmed):          # restored by a rollback: shows at once everywhere
            seen = _iso(dt.datetime(int(lid[0:4]), int(lid[5:7]), int(lid[8:10]), 12, tzinfo=dt.timezone.utc).timestamp() - 86400)
        elif not cur_ids or lid > max(cur_ids):           # a new edition
            seen = _iso(now)
        elif not gone and lid in older0 and now - older0[lid] >= 300 and all(states.get(i) is True for i in newer):
            seen = _iso(older0[lid])                      # an older edition merged late: every newer file is there
        else:
            older = {lid: older0.get(lid, now)}           # wait: could still be a rollback
        if seen:
            new = sorted(new + [{"id": lid, "seen": seen}], key=lambda x: x["seen"])[-20:]
            removed = [x for x in removed if x.get("id") != lid]
    pending = {k: v for k, v in (("gone", gone), ("older", older)) if v}
    if new != raw:   # also writes back a log with bad entries dropped
        sb_upsert("app_config", {"key": "edition_log", "value": new})
    if pending != pending0:
        sb_upsert("app_config", {"key": "edition_log_pending", "value": pending})
    if removed != removed0:
        sb_upsert("app_config", {"key": "edition_log_removed", "value": removed})
    return new, lid

def sb_patch(table, query, body):
    r = http.patch(f"{SB}/rest/v1/{table}?{query}", headers=_sb_headers({"Prefer": "return=representation"}),
                   data=json.dumps(body), timeout=20)
    r.raise_for_status()
    return r.json()


# ---------------------------------------------------------------- job 1: edition alerts
QUIET = (21, 6)  # no alerts from 9 pm to 6 am local time

@app.post("/tasks/notify")
def notify():
    if not SB_KEY:
        return jsonify(error="SUPABASE_SECRET_KEY is not set"), 500
    now = time.time()
    log, lid = update_edition_log(now)
    priv, pub = load_keys()
    adm = sb_get("app_config", "key=eq.admin&select=value")
    adm = (adm[0]["value"] if adm else None) or {}
    am_t, pm_t = adm.get("amTime") or "06:00", adm.get("pmTime") or "19:00"
    subs, start = [], 0
    while True:
        page_ = sb_get("push_subs", f"select=id,endpoint,tz,last_edition&order=id&offset={start}&limit=1000")
        subs += page_
        if len(page_) < 1000:
            break
        start += 1000
    groups = {}
    for s in subs:
        groups.setdefault(s.get("tz") or "Asia/Kolkata", []).append(s)
    sent = failed = quiet = 0
    gone, cache, zones = [], {}, 0
    for tz, members in groups.items():
        v = visible_edition(log, now, tz, am_t, pm_t)
        if not v:
            continue
        vid = v["id"]
        # never alert for an edition newer than what main currently serves (a rollback may be in progress)
        if EDITION_ID.match(lid or "") and vid > lid:
            continue
        zones += 1
        hour = dt.datetime.fromtimestamp(now, _zone(tz)).hour
        is_quiet = hour >= QUIET[0] or hour < QUIET[1]
        fresh = [m["id"] for m in members if not m.get("last_edition")]
        due = [m for m in members if m.get("last_edition") and m["last_edition"] != vid]
        for i in range(0, len(fresh), 100):  # new devices: remember what they see, no alert
            sb_patch("push_subs", "id=in.(" + ",".join(fresh[i:i + 100]) + ")&last_edition=is.null", {"last_edition": vid})
        # ids sort by date, then am before pm. A device is never moved back to an older edition (after a roll
        # back it simply waits for the next new one), so nobody is ever alerted twice for the same edition.
        newer = [m for m in due if vid > m["last_edition"]]
        if is_quiet:
            # hold the alert: these devices keep their old edition and are alerted at the first run after 6 am
            quiet += len(newer)
            continue
        for i in range(0, len(newer), 100):
            # claim first: only rows still on an older edition come back, so overlapping runs never both send
            claimed = sb_patch("push_subs", "id=in.(" + ",".join(m["id"] for m in newer[i:i + 100]) + f")&last_edition=lt.{vid}",
                               {"last_edition": vid})
            for c in claimed:
                try:
                    r = http.post(c["endpoint"], headers={"Authorization": vapid_header(c["endpoint"], priv, pub, cache),
                                                          "TTL": "7200", "Urgency": "normal", "Content-Length": "0"}, timeout=15)
                    if r.status_code in (404, 410):
                        gone.append(c["id"])
                    elif r.ok:
                        sent += 1
                    else:
                        failed += 1
                except requests.RequestException:
                    failed += 1
    for i in range(0, len(gone), 100):
        sb_delete("push_subs", "id=in.(" + ",".join(str(g) for g in gone[i:i + 100]) + ")")
    result = {"at": dt.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"), "by": "cloud-run", "latest": lid,
              "sent": sent, "failed": failed, "quiet": quiet, "removed": len(gone), "devices": len(subs), "zones": zones}
    if sent or failed or gone:  # held quiet-hour alerts alone do not rewrite the record every 10 minutes
        sb_upsert("app_config", {"key": "last_push", "value": result})
    return jsonify(result)


# ---------------------------------------------------------------- job 2: public story pages
WORD = re.compile(r"\[\[([^|\]]+)\|([^\]]+)\]\]")
CSS = """:root{--ink:#0E0D12;--muted:#5F5E6B;--line:#ECECF0;--brand:#5B35E8}*{box-sizing:border-box}
body{margin:0;font-family:Geist,ui-sans-serif,system-ui,sans-serif;color:var(--ink);background:#fff;line-height:1.65}
.w{max-width:720px;margin:0 auto;padding:0 20px}header{border-bottom:1px solid var(--line)}
header .w{display:flex;justify-content:space-between;align-items:center;height:64px}
.lg{font-family:Fredoka,Geist,sans-serif;font-weight:700;font-size:26px;text-decoration:none;color:var(--brand)}
.btn{display:inline-block;background:var(--ink);color:#fff;text-decoration:none;border-radius:999px;padding:10px 18px;font-weight:600;font-size:15px}
main{padding:36px 0 60px}h1{font-size:clamp(28px,5vw,40px);line-height:1.1;letter-spacing:-.03em;margin:8px 0 16px}
.meta{color:var(--muted);font-size:14px}p{font-size:18px}mark{background:#EFE9FF;border-radius:6px;padding:0 3px}
.box{border:1px solid var(--line);border-radius:18px;padding:16px 18px;margin:22px 0}.box h2{font-size:18px;margin:0 0 8px}
dl{margin:0}dt{font-weight:700}dd{margin:0 0 10px;color:#2B2A33}ul.list{list-style:none;padding:0}ul.list li{border-bottom:1px solid var(--line);padding:14px 0}
ul.list a{font-weight:600;color:var(--ink);text-decoration:none;font-size:18px}footer{border-top:1px solid var(--line);padding:22px 0;color:var(--muted);font-size:14px}
footer a{color:var(--muted);margin-right:14px}"""

def page(title, desc, path, body, ld=None, status=200):
    ldj = f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>' if ld else ""
    t = f"""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title><meta name="description" content="{html.escape(desc)}"><link rel="canonical" href="{SITE}{path}">
<meta property="og:title" content="{html.escape(title)}"><meta property="og:description" content="{html.escape(desc)}"><meta property="og:image" content="{SITE}/assets/og.png">
<link rel="icon" href="{SITE}/favicon.ico"><link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@700&family=Geist:wght@400;600;700&display=swap" rel="stylesheet">
<style>{CSS}</style>{ldj}</head><body><header><div class="w"><a class="lg" href="{SITE}/">ffmpa</a><a class="btn" href="{SITE}/app/">Open the app</a></div></header>
<main><div class="w">{body}</div></main><footer><div class="w"><a href="{SITE}/">Home</a><a href="{SITE}/s/">Today's stories</a><a href="{SITE}/safety/">Content standards</a><a href="{SITE}/privacy/">Privacy</a>
<p>Real news for kids aged 5 to 15, fact checked before it goes out. © 2026 Founderfreedom Ventures LLP, Bangalore, India.</p></div></footer></body></html>"""
    return Response(t, status=status, mimetype="text/html", headers={"Cache-Control": "public, max-age=300"})

def plain(text):
    return WORD.sub(lambda m: m.group(2), text)

def marked(text):
    """Escape a paragraph and highlight the explained words. WORD.split gives [text, id, word, text, ...]."""
    parts = WORD.split(text)
    return "".join(html.escape(p) if i % 3 == 0 else (f"<mark>{html.escape(p)}</mark>" if i % 3 == 2 else "")
                   for i, p in enumerate(parts))

def nice_date(d):
    try:
        return dt.date.fromisoformat(d).strftime("%-d %B %Y")
    except Exception:
        return d or ""

@app.get("/s/")
def story_index():
    items = stories()
    lis = "".join(f'<li><a href="/s/{html.escape(s["id"])}">{s.get("emoji","")} {html.escape(plain(s["o"]["t"]))}</a>'
                  f'<div class="meta">{"India" if s.get("scope")=="IN" else "World"} · {html.escape(s.get("cat",""))} · {nice_date(s.get("date"))}</div></li>'
                  for s, _ in items)
    body = (f'<p class="meta">Updated with every edition</p><h1>Today\'s news for kids</h1>'
            f'<p>Short, calm stories from the last three days, written for ages 10 to 12, fact checked and reviewed. '
            f'In the app every story also comes at an easier level for ages 5 to 9 and a deeper one for ages 13 to 15.</p>'
            f'<ul class="list">{lis or "<li>No stories right now. Please check back soon.</li>"}</ul>')
    ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "Today's news for kids", "url": f"{SITE}/s/",
          "publisher": {"@type": "Organization", "name": "FFMPA", "url": SITE}}
    return page("Today's News for Kids | FFMPA", "Real news for kids aged 5 to 15: short, calm stories from the last three days, fact checked and reviewed.", "/s/", body, ld)

@app.get("/s/<sid>")
def story(sid):
    found = next(((s, e) for s, e in stories() if s["id"] == sid), None)
    if not found:
        return page("Story not found | FFMPA", "This story is no longer available.", f"/s/{sid}",
                    '<h1>This story has moved on</h1><p>FFMPA only keeps the last three days of news. '
                    '<a href="/s/">See today\'s stories</a>.</p>', status=404)
    s, e = found
    o = s["o"]
    title, paras = plain(o["t"]), o.get("b", [])
    gl = e.get("glossary", {})
    words = []
    for p in paras:
        for wid, _ in WORD.findall(p):
            if wid in gl and wid not in [w for w, _ in words]:
                words.append((wid, gl[wid]))
    wl = "".join(f"<dt>{html.escape(g[0])}</dt><dd>{html.escape(g[2])}</dd>" for _, g in words if len(g) > 2)
    src = ", ".join(html.escape(x[0]) for x in s.get("src", []) if x)
    body = (f'<p class="meta">{s.get("emoji","")} {"India" if s.get("scope")=="IN" else "World"} · {html.escape(s.get("cat",""))} · {nice_date(s.get("date"))}</p>'
            f'<h1>{html.escape(title)}</h1>' + "".join(f"<p>{marked(p)}</p>" for p in paras)
            + (f'<div class="box"><h2>Words in this story</h2><dl>{wl}</dl></div>' if wl else "")
            + (f'<div class="box"><h2>Think about it</h2><p>{html.escape(s["think"])}</p></div>' if s.get("think") else "")
            + (f'<p class="meta">Sources: {src}. Written for children with AI assistance, then fact checked and reviewed.</p>' if src else "")
            + f'<p><a class="btn" href="{SITE}/app/?source=story">Read this at your level in the app</a></p><p><a href="/s/">More stories</a></p>')
    desc = plain(paras[0])[:155] if paras else title
    ld = {"@context": "https://schema.org", "@type": "NewsArticle", "headline": title[:110], "description": desc,
          "datePublished": s.get("date"), "dateModified": e.get("date"), "inLanguage": "en", "isAccessibleForFree": True,
          "audience": {"@type": "PeopleAudience", "suggestedMinAge": 10, "suggestedMaxAge": 12},
          "author": {"@type": "Organization", "name": "FFMPA"},
          "publisher": {"@type": "Organization", "name": "FFMPA", "url": SITE, "logo": {"@type": "ImageObject", "url": f"{SITE}/assets/icon-512.png"}},
          "mainEntityOfPage": f"{SITE}/s/{sid}"}
    return page(f"{title} | FFMPA kids news", desc, f"/s/{sid}", body, ld)

@app.get("/s/sitemap.xml")
def story_sitemap():
    urls = "".join(f"<url><loc>{SITE}/s/{html.escape(s['id'])}</loc><lastmod>{s.get('date','')}</lastmod></url>" for s, _ in stories())
    return Response(f'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
                    f'<url><loc>{SITE}/s/</loc></url>{urls}</urlset>', mimetype="application/xml")

@app.get("/")
def health():
    return jsonify(service="ffmpa-newsroom", ok=True, stories=len(stories()))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
