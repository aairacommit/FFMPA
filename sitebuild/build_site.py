import asyncio, json, os, re, shutil, html
from playwright.async_api import async_playwright
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC=ROOT+"/src"; OUT=ROOT+"/site"; BASE="https://ffmpa.com"
TITLE="FFMPA: Kids News App | Real News for Ages 5 to 15"
DESC="Real news made for kids aged 5 to 15. Short, calm stories at three reading levels, twice a day, checked by human editors. No links out, no tracking. Free to start."
if os.path.exists(OUT): shutil.rmtree(OUT)
os.makedirs(OUT+"/app"); os.makedirs(OUT+"/assets")
home=open(SRC+"/home.html").read(); app=open(SRC+"/index.html").read()
GA='''<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{analytics_storage:(function(){try{return localStorage.getItem('ffmpa-analytics')==='yes'?'granted':'denied'}catch(e){return 'denied'}})(),ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
gtag('js',new Date());gtag('config','G-JW4QZ308GS',{allow_google_signals:false,allow_ad_personalization_signals:false});</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-JW4QZ308GS"></script>'''
GA_BANNER='''<div id="gaAsk" hidden style="position:fixed;left:12px;right:12px;bottom:12px;z-index:999;max-width:560px;margin:0 auto;background:#0E0D12;color:#fff;border-radius:18px;padding:14px 16px;font:500 14px/1.45 Geist,system-ui,sans-serif;box-shadow:0 20px 50px -20px rgba(0,0,0,.5)">May we count visits to this website with Google Analytics? The kids' app is never tracked. <a href="/cookies/" style="color:#C9BEFF">Details</a>
<div style="display:flex;gap:8px;margin-top:10px"><button id="gaYes" style="border:0;border-radius:999px;padding:8px 16px;font:inherit;font-weight:700;background:#fff;color:#0E0D12;cursor:pointer">Allow</button><button id="gaNo" style="border:1px solid #55545F;border-radius:999px;padding:8px 16px;font:inherit;font-weight:600;background:transparent;color:#fff;cursor:pointer">No thanks</button></div></div>
<script>(function(){var k='ffmpa-analytics',v=null;try{v=localStorage.getItem(k)}catch(e){}var b=document.getElementById('gaAsk');if(!b)return;if(!v)b.hidden=false;function set(x){try{localStorage.setItem(k,x)}catch(e){}b.hidden=true;if(x==='yes')gtag('consent','update',{analytics_storage:'granted'});}
document.getElementById('gaYes').onclick=function(){set('yes')};document.getElementById('gaNo').onclick=function(){set('no')};})();</script>'''
ICONS='''<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/icon-192.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#FFFFFF">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-title" content="FFMPA">'''
def social(title,desc,path):
    u=BASE+path
    return f'''<link rel="canonical" href="{u}">
<meta property="og:type" content="website"><meta property="og:site_name" content="FFMPA">
<meta property="og:title" content="{html.escape(title)}"><meta property="og:description" content="{html.escape(desc)}">
<meta property="og:url" content="{u}"><meta property="og:image" content="{BASE}/assets/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="FFMPA, real news made for kids">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{html.escape(title)}"><meta name="twitter:description" content="{html.escape(desc)}"><meta name="twitter:image" content="{BASE}/assets/og.png">'''
# ---------- home
faqs=re.findall(r'<details><summary>(.*?)</summary><p>(.*?)</p></details>',home,flags=re.S)
strip=lambda t:re.sub(r'\s+',' ',re.sub(r'<[^>]+>','',t)).strip()
ld=[{"@context":"https://schema.org","@type":"Organization","@id":BASE+"/#org","name":"FFMPA","legalName":"Founderfreedom Ventures LLP","url":BASE+"/","logo":BASE+"/assets/icon-512.png","description":"FFMPA publishes real news for children aged 5 to 15.","address":{"@type":"PostalAddress","addressLocality":"Bengaluru","addressCountry":"IN"}},
 {"@context":"https://schema.org","@type":"WebSite","@id":BASE+"/#site","url":BASE+"/","name":"FFMPA","description":DESC,"inLanguage":"en","publisher":{"@id":BASE+"/#org"}},
 {"@context":"https://schema.org","@type":"WebApplication","name":"FFMPA Kids News","url":BASE+"/app/","applicationCategory":"EducationalApplication","operatingSystem":"Any (web browser), Android","inLanguage":"en","description":DESC,"isFamilyFriendly":True,"audience":{"@type":"PeopleAudience","suggestedMinAge":5,"suggestedMaxAge":15},"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},"featureList":["Three reading levels: Explorers 5 to 9, Thinkers 10 to 12, Navigators 13 to 15","Two short editions a day with only the last 3 days of news","Tap any word for an explainer","Hand-drawn sketch explainers","Big Story of the week","Classroom mode with weekly quiz and worksheet","Parent controls behind a PIN","No links to other websites"],"publisher":{"@id":BASE+"/#org"}},
 {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":strip(q),"acceptedAnswer":{"@type":"Answer","text":strip(a)}} for q,a in faqs]}]
h=home.replace('https://claude.ai/artifact/LZmmeGKXJ2qpBUN4LCK6Z7#','/app/#').replace('https://claude.ai/artifact/LZmmeGKXJ2qpBUN4LCK6Z7','/app/')
for k in ["privacy","terms","safety","cookies","contact"]: h=h.replace(f'/app/#{k}',f'/{k}/')
h=re.sub(r'<meta name="description"[^>]*>','',h)
h=h.replace('<title>FFMPA Home</title>',f'<title>{TITLE}</title>\n<meta name="description" content="{DESC}">\n<meta name="robots" content="index,follow,max-image-preview:large">\n'+social(TITLE,DESC,"/")+'\n'+ICONS+'\n<script type="application/ld+json">'+json.dumps(ld,ensure_ascii=False)+'</script>')
h=h.replace('<body>','<body>\n<div class="pvbar">Preview. The app shows a sample edition from 11 November while we get ready to launch.</div>',1)
h=h.replace('</style>','.pvbar{background:#0E0D12;color:#fff;text-align:center;font-size:13.5px;font-weight:500;padding:8px 14px}\n</style>',1)
# footer links for crawlers
if '<a href="/schools/">' not in h: h=h.replace('<nav aria-label="Legal">','<nav aria-label="Legal"><a href="/schools/">For schools</a>',1)
assert TITLE in h and 'application/ld+json' in h
h=h.replace('<a class="btn line" href="#get">Android and iPhone</a>','<a class="btn line" href="#get" id="instBtn">Add to home screen</a>',1)
h=h.replace('<p>The Android app is coming to Google Play. Until then, the web app works in Chrome and can be added to your home screen.</p>','<p>Open ffmpa.com in Chrome and tap <b>Add to home screen</b>. It opens full screen like an app. A Google Play version is coming.</p>',1)
INST='''<script>(function(){var ev=null,b=document.getElementById('instBtn');addEventListener('beforeinstallprompt',function(e){e.preventDefault();ev=e;if(b){b.textContent='Install the app';}});
if(b)b.addEventListener('click',function(e){if(ev){e.preventDefault();ev.prompt();ev=null;}});
if('serviceWorker' in navigator&&location.protocol==='https:')addEventListener('load',function(){navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(){});});})();</script>'''
h=h.replace('</head>',GA+'\n</head>',1).replace('</body>',INST+'\n'+GA_BANNER+'\n</body>',1)
open(OUT+"/index.html","w").write(h)
# ---------- app (kept out of search results: it is an app shell, not a page to land on)
a=app.replace(' · <a href="#admin">Admin console (staff prototype)</a>','')
a=a.replace('<title>FFMPA Kids News</title>','<title>FFMPA Kids News App</title>\n<meta name="description" content="Open FFMPA: today\'s news for kids, at three reading levels.">\n<meta name="robots" content="noindex,follow">\n<link rel="canonical" href="'+BASE+'/app/">\n'+ICONS.replace('<meta name="theme-color" content="#5B35E8">',''))
assert 'noindex,follow' in a
open(OUT+"/app/index.html","w").write(a)

PAGE_CSS=''':root{--ink:#0E0D12;--muted:#5F5E6B;--line:#ECECF0;--brand:#5B35E8}
*{box-sizing:border-box}html{color-scheme:light only}body{margin:0;font-family:Geist,ui-sans-serif,system-ui,sans-serif;color:var(--ink);background:#fff;line-height:1.6;-webkit-font-smoothing:antialiased}
.w{max-width:760px;margin:0 auto;padding:0 20px}header.t{border-bottom:1px solid var(--line)}header.t .w{display:flex;justify-content:space-between;align-items:center;height:68px;max-width:1100px}
.lg{font-family:Fredoka,Geist,sans-serif;font-weight:700;font-size:26px;text-decoration:none;color:var(--brand);letter-spacing:-.01em}
.btn{display:inline-block;background:var(--ink);color:#fff;text-decoration:none;border-radius:999px;padding:11px 20px;font-weight:600;font-size:15px}
main{padding:44px 0 70px}h1{font-size:clamp(32px,5vw,46px);line-height:1.05;letter-spacing:-.04em;margin:0 0 14px}h2{font-size:23px;letter-spacing:-.02em;margin:34px 0 8px}h3{font-size:18px;margin:22px 0 6px}
p,li{font-size:16.5px;color:#2B2A33}.lede{font-size:19px;color:var(--muted)}a{color:var(--brand)}.summary{font-size:18px}.draft{background:#FFF6E0;border-radius:14px;padding:12px 16px;font-size:14.5px}
.crumbs{font-size:14px;color:var(--muted);margin-bottom:18px}.crumbs a{color:var(--muted)}
.cards{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:18px 0}.cards div{border:1px solid var(--line);border-radius:20px;padding:18px}.cards h3{margin-top:0}
@media(max-width:640px){.cards{grid-template-columns:1fr}}
footer{border-top:1px solid var(--line);padding:26px 0;font-size:14px;color:var(--muted)}footer a{color:var(--muted);margin-right:14px}'''
def page(path,title,desc,body,ldx=None):
    os.makedirs(OUT+path,exist_ok=True)
    t=f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light only">
<title>{html.escape(title)}</title><meta name="description" content="{html.escape(desc)}"><meta name="robots" content="index,follow">
{social(title,desc,path)}
{ICONS}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Geist:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>{PAGE_CSS}</style>{GA}{'<script type="application/ld+json">'+json.dumps(ldx,ensure_ascii=False)+'</script>' if ldx else ''}</head>
<body><header class="t"><div class="w"><a class="lg" href="/" aria-label="FFMPA home">ffmpa</a><a class="btn" href="/app/">Open the app</a></div></header>
<main><div class="w"><p class="crumbs"><a href="/">FFMPA</a> / {html.escape(title.split(" | ")[0])}</p>{body}</div></main>
<footer><div class="w"><a href="/">Home</a><a href="/schools/">For schools</a><a href="/safety/">Content standards</a><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/cookies/">Cookies</a><a href="/contact/">Contact</a><p>© 2026 Founderfreedom Ventures LLP, Bangalore, India.</p></div></footer>{GA_BANNER}</body></html>'''
    open(OUT+path+"index.html","w").write(t)
SCHOOLS='''<h1>Kids news for the classroom</h1>
<p class="lede">FFMPA Classroom mode turns each week's news into a ready class pack for primary and middle school teachers. It is free during early access and holds no pupil names.</p>
<h2>What teachers get each week</h2>
<div class="cards">
<div><h3>A quiz for the big screen</h3><p>Five questions from that week's stories. Reveal each answer when the class is ready.</p></div>
<div><h3>A printable worksheet</h3><p>Questions, a word match, a draw-it box and a writing prompt, with an answer key.</p></div>
<div><h3>One Big Story to discuss</h3><p>A topic followed Monday to Friday, with a ten-minute discussion question that has no single right answer.</p></div>
<div><h3>A Young reporters assignment</h3><p>Pupils write a headline and a few sentences about something they saw: who did what, and where?</p></div>
</div>
<h2>Three reading levels in one class</h2>
<p>Every story is available for Explorers (ages 5 to 9), Thinkers (10 to 12) and Navigators (13 to 15), so mixed-ability classes read the same news at the right level. Hand-drawn sketch explainers make hard ideas such as smog, orbits and the greenhouse effect clear in three steps.</p>
<h2>Built for pupil privacy</h2>
<ul><li>A teacher creates a class and gets a six-character code.</li><li>Pupils join with the code and a grown-up's PIN. They never type a name, email or birthday.</li><li>Teachers see class totals only, never an individual child.</li><li>Nothing in FFMPA links to other websites, and there is no chat or comment section.</li></ul>
<h2>How to start</h2>
<ol><li>Open the app and sign in with your email.</li><li>Tap Play, then Classroom, then "I am a teacher".</li><li>Name your class, pick a reading level and share the code.</li></ol>
<p><a class="btn" href="/app/">Open the app</a></p>'''

async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path=os.environ.get("CHROME") or None,args=["--no-sandbox"])
        pg=await b.new_page(viewport={"width":1200,"height":630})
        await pg.goto("file://"+SRC+"/index.html"); await pg.wait_for_timeout(900)
        legal=await pg.evaluate("()=>Object.fromEntries(LEGAL_ORDER.map(k=>[k,{t:LEGAL[k].t,h:LEGAL[k].h}]))")
        descs={"safety":"How FFMPA writes and checks news for children: language rules, sources, sensitive topics, ads and what we never publish.","privacy":"What FFMPA collects about families and children, why, and the choices parents have.","terms":"The terms for using FFMPA, the kids news app from Founderfreedom Ventures LLP.","cookies":"How FFMPA uses cookies and on-device storage.","contact":"How to reach the FFMPA team, report a mistake or raise a concern."}
        for k,v in legal.items():
            body=f"<h1>{v['t']}</h1>"+re.sub(r'href="#(safety|privacy|terms|cookies|contact)"',r'href="/\1/"',v['h'])
            page(f"/{k}/", f"{v['t']} | FFMPA", descs[k], body)
        page("/schools/","Kids News for Schools and Classrooms | FFMPA","FFMPA Classroom mode: a weekly news quiz for the big screen, a printable worksheet and a discussion question, at three reading levels. No pupil names.",SCHOOLS)
        for f in os.listdir(SRC+"/assets"):
            shutil.copy(SRC+"/assets/"+f, OUT+("/favicon.ico" if f=="favicon.ico" else "/assets/"+f))
        await b.close()
asyncio.run(main())
json.dump({"id":"/app/","name":"FFMPA Kids News","short_name":"FFMPA","description":DESC,"start_url":"/app/?source=homescreen","scope":"/","display":"standalone","display_override":["standalone","minimal-ui"],"orientation":"portrait","background_color":"#FFFFFF","theme_color":"#FFFFFF","lang":"en","dir":"ltr","categories":["education","news","kids"],
 "icons":[{"src":"/assets/icon-192.png","sizes":"192x192","type":"image/png","purpose":"any"},{"src":"/assets/icon-512.png","sizes":"512x512","type":"image/png","purpose":"any"},{"src":"/assets/icon-maskable-192.png","sizes":"192x192","type":"image/png","purpose":"maskable"},{"src":"/assets/icon-maskable-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}],
 "screenshots":[{"src":f"/assets/screen-{k}.png","sizes":"780x1688","type":"image/png","form_factor":"narrow","label":l} for k,l in ((1,"Today's edition"),(2,"A story with tap-to-learn words"),(3,"A hand-drawn sketch explainer"))],
 "shortcuts":[{"name":"Today's edition","url":"/app/?source=shortcut","icons":[{"src":"/assets/icon-192.png","sizes":"192x192"}]}]},open(OUT+"/manifest.webmanifest","w"),indent=1)
open(OUT+"/sw.js","w").write('''/* FFMPA service worker: makes the app installable and keeps the last edition readable offline. */
const V="ffmpa-v1"; const SHELL=["/app/","/manifest.webmanifest","/assets/icon-192.png","/assets/icon-512.png"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  const u=new URL(r.url);
  if(u.hostname.includes("google-analytics")||u.hostname.includes("googletagmanager")) return;
  const fresh=r.mode==="navigate"||u.pathname.endsWith(".json")||u.hostname==="raw.githubusercontent.com";
  if(fresh){ e.respondWith(fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(V).then(c=>c.put(r,cp)); } return res; }).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match("/app/")))); return; }
  if(u.origin===location.origin||u.hostname.endsWith("gstatic.com")||u.hostname.endsWith("googleapis.com")){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{ if(res.ok||res.type==="opaque"){ const cp=res.clone(); caches.open(V).then(c=>c.put(r,cp)); } return res; })));
  }
});
''')
pages=["/","/schools/","/safety/","/privacy/","/terms/","/cookies/","/contact/"]
open(OUT+"/sitemap.xml","w").write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+"".join(f"<url><loc>{BASE}{p}</loc><lastmod>2026-11-11</lastmod></url>\n" for p in pages)+"</urlset>\n")
bots=["GPTBot","OAI-SearchBot","ChatGPT-User","ClaudeBot","Claude-SearchBot","Claude-User","PerplexityBot","Perplexity-User","Google-Extended","Applebot-Extended","CCBot","Bingbot","Googlebot"]
open(OUT+"/robots.txt","w").write("User-agent: *\nAllow: /\n\n"+"".join(f"User-agent: {b}\nAllow: /\n\n" for b in bots)+f"Sitemap: {BASE}/sitemap.xml\n")
open(OUT+"/llms.txt","w").write(f'''# FFMPA

> FFMPA (ffmpa.com) is a news app for children aged 5 to 15, made by Founderfreedom Ventures LLP in Bengaluru, India. It publishes short, calm, real news stories twice a day, written at three reading levels and approved by a human editor.

## Key facts
- Audience: children aged 5 to 15, with parents in control.
- Reading levels: Explorers (ages 5 to 9), Thinkers (10 to 12), Navigators (13 to 15).
- Editions: a morning and an evening edition in local time. Only news from the last 3 days is shown.
- Countries at launch: India, United States, United Kingdom, Australia, South Korea, Germany, France. Each child sees local news for their country plus world news.
- Language: English.
- Format: one story per screen, swipe for the next. Tap any highlighted word for an explainer. The edition ends; there is no endless feed.
- Learning features: hand-drawn sketch explainers, one history, geography or science idea a day, a Big Story followed through the week, a daily quiz, weekly puzzles and a Sunday craft.
- Wellbeing: a feelings check after every story. War and conflict stories never appear at the youngest level.
- Safety: nothing in the app links to other websites. No chat, comments or strangers. No ads based on the child and no sale of data.
- Parents: sign in with an email and a one-time code. A 4-digit PIN protects reading level, topics, sensitive news, limits and sharing.
- Schools: Classroom mode gives teachers a class code, a weekly quiz for the big screen and a printable worksheet. No pupil names are collected.
- Young reporters: children can write a short report each week. A grown-up's PIN is needed to send it and an editor reads it before it appears.
- Price: free during early access. Planned price: 100 rupees a year in India and 10 US dollars a year elsewhere.
- Platforms: web app in any browser, installable on iPhone and iPad from Safari. Android app planned for Google Play.
- Status: preview. The app currently shows a sample edition.

## Pages
- [Home]({BASE}/): what FFMPA is and why news matters for children
- [Open the app]({BASE}/app/)
- [For schools]({BASE}/schools/): Classroom mode for teachers
- [Content and safety standards]({BASE}/safety/): how stories are written and checked
- [Privacy policy]({BASE}/privacy/)
- [Terms of use]({BASE}/terms/)
- [Contact]({BASE}/contact/)
''')
open(OUT+"/_headers","w").write("/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n/assets/*\n  Cache-Control: public, max-age=604800\n/llms.txt\n  Content-Type: text/plain; charset=utf-8\n")
open(OUT+"/_redirects","w").write("/app /app/ 301\n/schools /schools/ 301\n/privacy /privacy/ 301\n/terms /terms/ 301\n/safety /safety/ 301\n/teachers /schools/ 301\n")
open(OUT+"/_redirects","w").write("/teachers /schools/ 301\n/school /schools/ 301\n")
os.system(f"cd {OUT} && rm -f ../ffmpa-site.zip && zip -qr ../ffmpa-site.zip . && ls -la ../ffmpa-site.zip")
