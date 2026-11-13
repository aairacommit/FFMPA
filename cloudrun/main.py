"""FFMPA newsroom service on Google Cloud Run.

Two jobs:
1. Edition alerts on each family's local clock. Cloud Scheduler calls POST /tasks/notify every 10 minutes.
   It records when each edition first appears on GitHub (app_config "edition_log", which the app also reads),
   works out which edition each device's time zone should be seeing now (6:00 am and 7:00 pm local release
   times, see visible_edition), and sends one web push when that changes. Pushes carry no data. Each device is
   claimed in the database before it is sent to, so overlapping runs never send twice. No alerts 9 pm to 6 am.
2. Public story pages. GET /s/ lists the last three days of stories; GET /s/<id> shows one story at the
   Thinkers level (ages 10 to 12) with its word explainers, think question and sources, marked up as a
   NewsArticle for search engines. Data is read from the public editions folder on GitHub.

Secrets: SUPABASE_SECRET_KEY comes from Secret Manager. Nothing personal is stored here.
"""
import base64, datetime as dt, html, json, os, re, threading, time
import requests
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
LATE_SECONDS = 3 * 3600  # a late edition skips the queue only within 3 hours of a release time
EDITION_ID = re.compile(r"^\d{4}-\d{2}-\d{2}-(am|pm)$")

def _zone(tz):
    try:
        return ZoneInfo(tz) if tz else ZoneInfo("Asia/Kolkata")
    except Exception:
        return ZoneInfo("Asia/Kolkata")

def _hm(s, default):
    m = re.match(r"^(\d{1,2}):(\d{2})$", s or "")
    return (int(m.group(1)), int(m.group(2))) if m else default

def _parse(ts):
    return dt.datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp()

def visible_edition(log, now, tz, am_time="06:00", pm_time="19:00"):
    """log: [{id, seen}], now: unix seconds. Returns {"id", "slot", "at"} or None."""
    L = []
    for e in log or []:
        try:
            if e.get("id"):
                L.append((_parse(e["seen"]), e["id"]))
        except Exception:
            pass
    if not L:
        return None
    L.sort()
    z = _zone(tz)
    am, pm = _hm(am_time, (6, 0)), _hm(pm_time, (19, 0))
    today = dt.datetime.fromtimestamp(now, z).date()
    bounds = []
    for back in range(4):
        d = today - dt.timedelta(days=back)
        for (h, mi), slot in ((am, "am"), (pm, "pm")):
            local = dt.datetime(d.year, d.month, d.day, h, mi)
            # resolve the wall time in this zone the same way the app does (earliest valid instant)
            t = local.replace(tzinfo=z).timestamp()
            bounds.append((t, slot))
    past = sorted(b for b in bounds if b[0] <= now)
    if not past:
        return None

    def newest(t):
        r = None
        for seen, eid in L:
            if seen <= t:
                r = eid
        return r

    shown = newest(past[0][0])
    for i in range(1, len(past)):
        cand = newest(past[i][0])
        waiting = (not cand) or (not shown) or cand == shown
        if not waiting:
            shown = cand
        else:
            end = min(now if i == len(past) - 1 else past[i + 1][0] - 0.001, past[i][0] + LATE_SECONDS)
            s_t = next((seen for seen, eid in L if eid == shown), float("-inf")) if shown else float("-inf")
            late = None
            for seen, eid in L:
                if seen <= end and seen > s_t and eid.endswith("-" + past[i][1]):
                    late = eid
            if late:
                shown = late
    if not shown:
        return None
    return {"id": shown, "slot": past[-1][1], "at": past[-1][0]}

def update_edition_log(now=None):
    """Record when each edition was first seen on main. A rolled back edition drops out of the log."""
    now = now or time.time()
    e = fetch_json(RAW + "latest.json") or {}
    lid = f"{e.get('date')}-{e.get('edition') or 'am'}"
    row = sb_get("app_config", "key=eq.edition_log&select=value")
    log = list(row[0]["value"]) if row and isinstance(row[0].get("value"), list) else []
    if not EDITION_ID.match(lid) or not e.get("stories"):
        return log, lid
    ids = [x.get("id") for x in log]
    if lid in ids:
        new = log[:ids.index(lid) + 1]
    else:
        new = (log + [{"id": lid, "seen": dt.datetime.fromtimestamp(now, dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}])[-20:]
    if new != log:
        sb_upsert("app_config", {"key": "edition_log", "value": new})
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
    gone, cache, shown = [], {}, {}
    for tz, members in groups.items():
        v = visible_edition(log, now, tz, am_t, pm_t)
        if not v:
            continue
        vid = v["id"]
        shown[tz] = vid
        hour = dt.datetime.fromtimestamp(now, _zone(tz)).hour
        is_quiet = hour >= QUIET[0] or hour < QUIET[1]
        fresh = [m["id"] for m in members if not m.get("last_edition")]
        due = [m for m in members if m.get("last_edition") and m["last_edition"] != vid]
        for i in range(0, len(fresh), 100):  # new devices: remember what they see, no alert
            sb_patch("push_subs", "id=in.(" + ",".join(fresh[i:i + 100]) + ")&last_edition=is.null", {"last_edition": vid})
        newer = [m for m in due if vid > m["last_edition"]]   # ids sort by date then am < pm
        older = [m["id"] for m in due if vid <= m["last_edition"]]  # after a roll back: update quietly
        for i in range(0, len(older), 100):
            sb_patch("push_subs", "id=in.(" + ",".join(older[i:i + 100]) + f")&last_edition=neq.{vid}", {"last_edition": vid})
        for i in range(0, len(newer), 100):
            # claim first: only rows still not on this edition come back, so two runs never both send
            claimed = sb_patch("push_subs", "id=in.(" + ",".join(m["id"] for m in newer[i:i + 100]) + f")&last_edition=neq.{vid}",
                               {"last_edition": vid})
            if is_quiet:
                quiet += len(claimed)
                continue
            for c in claimed:
                try:
                    r = http.post(c["endpoint"], headers={"Authorization": vapid_header(c["endpoint"], priv, pub, cache),
                                                          "TTL": "21600", "Urgency": "normal", "Content-Length": "0"}, timeout=15)
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
              "sent": sent, "failed": failed, "quiet": quiet, "removed": len(gone), "devices": len(subs), "showing": shown}
    if sent or failed or quiet or gone:
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
<p>Real news for kids aged 5 to 15, checked by an editor. © 2026 Founderfreedom Ventures LLP, Bangalore, India.</p></div></footer></body></html>"""
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
            f'<p>Short, calm stories from the last three days, written for ages 10 to 12 and checked by an editor. '
            f'In the app every story also comes at an easier level for ages 5 to 9 and a deeper one for ages 13 to 15.</p>'
            f'<ul class="list">{lis or "<li>No stories right now. Please check back soon.</li>"}</ul>')
    ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": "Today's news for kids", "url": f"{SITE}/s/",
          "publisher": {"@type": "Organization", "name": "FFMPA", "url": SITE}}
    return page("Today's News for Kids | FFMPA", "Real news for kids aged 5 to 15: short, calm stories from the last three days, checked by an editor.", "/s/", body, ld)

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
            + (f'<p class="meta">Sources: {src}. Written for children and approved by an FFMPA editor.</p>' if src else "")
            + f'<p><a class="btn" href="{SITE}/app/?source=story">Read this at your level in the app</a></p><p><a href="/s/">More stories</a></p>')
    desc = plain(paras[0])[:155] if paras else title
    ld = {"@context": "https://schema.org", "@type": "NewsArticle", "headline": title[:110], "description": desc,
          "datePublished": s.get("date"), "dateModified": e.get("date"), "inLanguage": "en", "isAccessibleForFree": True,
          "audience": {"@type": "PeopleAudience", "suggestedMinAge": 10, "suggestedMaxAge": 12},
          "author": {"@type": "Organization", "name": "FFMPA editors"},
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
