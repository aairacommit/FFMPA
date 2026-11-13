"""Product Hunt gallery images (1270 x 760) for the Nov 20 Cloud Run 'Build for Good' launch."""
import base64
from playwright.sync_api import sync_playwright

S = "/home/claude/store"
OUT = "/home/claude/repo-ffmpa/store/out"
b64 = lambda p: "data:image/png;base64," + base64.b64encode(open(p, "rb").read()).decode()

BASE = '''*{box-sizing:border-box;margin:0} body{width:1270px;height:760px;overflow:hidden;font-family:Geist,Inter,system-ui,sans-serif;color:#fff}
.f{position:relative;width:1270px;height:760px;background:radial-gradient(110% 120% at 20% 10%,var(--a),var(--b));overflow:hidden}
.f:before{content:"";position:absolute;inset:0;background:repeating-conic-gradient(from 0deg at 18% 30%,rgba(255,255,255,.05) 0 5deg,transparent 5deg 15deg)}
.cap{position:absolute;left:70px;top:0;bottom:0;width:470px;display:flex;flex-direction:column;justify-content:center}
.cap h1{font-size:64px;line-height:1.02;font-weight:800;letter-spacing:-.035em}
.cap h1 em{display:block;font-family:"Instrument Serif",Georgia,serif;font-style:italic;font-weight:400;font-size:74px;color:#FFD84D}
.cap p{margin-top:20px;font-size:25px;line-height:1.35;opacity:.93}
.cap .lg{font-family:Fredoka,Geist,sans-serif;font-weight:700;font-size:34px;margin-bottom:22px;opacity:.95}
.ph{position:absolute;width:300px;height:620px;border-radius:44px;background:#0d0a1a;padding:11px;box-shadow:0 30px 70px rgba(0,0,0,.45),0 0 0 2px rgba(255,255,255,.15)}
.ph img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:34px;display:block}'''

def phones(shots, xs=(560, 880), ys=(80, 60), rot=(-3, 3)):
    return "".join(f'<div class="ph" style="left:{x}px;top:{y}px;transform:rotate({r}deg)"><img src="{b64(S + "/raw/" + s + ".png")}"></div>'
                   for s, x, y, r in zip(shots, xs, ys, rot))

SLIDES = [
    ("1_hero", "#5B35E8", "#1E0F5C", '<div class="lg">ffmpa</div>', "Real news,", "made for kids",
     "A calm morning and evening edition for ages 5 to 15. Every story checked by a human editor.", ["1_today", "2_story"]),
    ("2_levels", "#0B7F75", "#05433E", "", "One story,", "three reading levels",
     "Explorers (5 to 9), Thinkers (10 to 12) and Navigators (13 to 15) read the same news at the right depth.", ["9_explorers", "10_navigators"]),
    ("3_learn", "#D9481E", "#6E1E07", "", "News that", "explains itself",
     "Tap any word for a kid-friendly explainer. Sketch explainers make hard ideas clear in three steps.", ["3_word", "4_sketch"]),
    ("4_safe", "#1B1340", "#0B0620", "", "Safe by", "design",
     "No ads, no links out, no chat, no endless feed. Parents control topics and limits behind a PIN.", ["7_parents", "6_play"]),
    ("5_class", "#B5600F", "#5E2F04", "", "Free for", "classrooms",
     "A class code, a big screen quiz and a printable worksheet each week. Teachers see totals, never names.", ["8_class", "5_big"]),
]

ARCH = '''<style>*{box-sizing:border-box;margin:0}body{width:1270px;height:760px;overflow:hidden;font-family:Geist,Inter,system-ui,sans-serif;background:#0F0B24;color:#fff}
h1{position:absolute;left:50px;top:34px;font-size:40px;font-weight:800;letter-spacing:-.03em}h1 span{color:#FFD84D}
.sub{position:absolute;left:50px;top:86px;font-size:20px;opacity:.75}
.b{position:absolute;border-radius:18px;padding:16px 18px;font-size:17px;line-height:1.35;background:#1C1640;border:2px solid #3A2F7A}
.b h3{font-size:20px;margin-bottom:6px}.b small{opacity:.75;font-size:15px;display:block}
.run{background:linear-gradient(135deg,#1A73E8,#0B4FB3);border-color:#8AB4F8;box-shadow:0 0 0 6px rgba(138,180,248,.15)}
.tag{display:inline-block;background:#FFD84D;color:#1B1340;font-weight:800;font-size:13px;border-radius:99px;padding:3px 10px;margin-bottom:8px}
svg{position:absolute;inset:0}</style>
<h1>How FFMPA works <span>on Google Cloud Run</span></h1><div class="sub">Twice a day: draft, human approval, publish, alert. Nothing personal leaves the database.</div>
<svg width="1270" height="760"><defs><marker id="a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#8AB4F8"/></marker></defs>
<g stroke="#8AB4F8" stroke-width="3" fill="none" marker-end="url(#a)">
<path d="M290 225 H360"/><path d="M590 225 H660"/><path d="M780 305 V338"/><path d="M660 425 H560"/><path d="M900 425 H980"/><path d="M780 520 V588"/><path d="M445 588 V530"/><path d="M1100 365 V335"/></g></svg>
<div class="b" style="left:50px;top:150px;width:240px"><h3>Daily draft</h3>Scheduled agent gathers news from the last 3 days, writes 3 reading levels, runs fact and safety checks<small>5:10 am and 5:10 pm IST</small></div>
<div class="b" style="left:360px;top:150px;width:230px"><h3>Editor approval</h3>Draft opens a pull request on GitHub. A human merges it to publish<small>editions/latest.json</small></div>
<div class="b" style="left:660px;top:150px;width:240px"><h3>Cloud Scheduler</h3>Calls the newsroom every 10 minutes<small>idempotent: each edition sent once</small></div>
<div class="b run" style="left:660px;top:340px;width:240px;height:180px"><span class="tag">CLOUD RUN</span><h3>ffmpa-newsroom</h3>Python service: edition alerts and public story pages<small>asia-south1, scales to zero</small></div>
<div class="b" style="left:330px;top:340px;width:230px;height:190px"><h3>Supabase (Mumbai)</h3>Families, progress, classes and push subscriptions, protected by row level security</div>
<div class="b" style="left:980px;top:150px;width:240px;height:185px"><h3>Web app + Android</h3>ffmpa.com/app on Cloudflare Pages, Trusted Web Activity on Google Play</div>
<div class="b" style="left:980px;top:365px;width:240px"><h3>Web push</h3>Morning and evening alerts to phones, signed with VAPID<small>no personal data in the push</small></div>
<div class="b" style="left:660px;top:588px;width:240px"><h3>/s/ story pages</h3>NewsArticle pages and sitemap for search engines</div>
<div class="b" style="left:330px;top:588px;width:230px"><h3>Secret Manager</h3>Holds the one database key Cloud Run needs</div>'''

with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    p = b.new_page(viewport={"width": 1270, "height": 760})
    for f, a, bb, logo, h1, em, sub, shots in SLIDES:
        p.set_content(f'<style>{BASE}</style><div class="f" style="--a:{a};--b:{bb}"><div class="cap">{logo}<h1>{h1}<em>{em}</em></h1><p>{sub}</p></div>{phones(shots)}</div>')
        p.wait_for_timeout(300)
        p.screenshot(path=f"{OUT}/ph_{f}.png")
    p.set_content(ARCH); p.wait_for_timeout(300); p.screenshot(path=f"{OUT}/ph_6_architecture.png")
    b.close()
print("done")
