# FFMPA product video: 1920x1080, 30 fps. One encoded file per scene, joined with the concat demuxer.
# Product video for the Play listing and YouTube (youtu.be/0R-2PqXafKM).
# python3 store/video.py [--sample]   (--sample writes one full-size frame per scene to out/sample_*.jpg)
import base64, os, subprocess, sys
from playwright.sync_api import sync_playwright

import os
HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.environ.get("FF_RAW", os.path.join(HERE, "raw"))
OUT = os.environ.get("FF_VIDEO_OUT", os.path.join(HERE, "out", "video"))
ICON = os.path.join(HERE, "..", "site", "assets", "icon-512.png")
FPS, W, H, INTRO = 30, 1920, 1080, 0.8
os.makedirs(OUT, exist_ok=True)
b64 = lambda p: "data:image/png;base64," + base64.b64encode(open(p, "rb").read()).decode()
ICON64 = b64(ICON)

BASE = """*{box-sizing:border-box;margin:0}
body{width:1920px;height:1080px;overflow:hidden;font-family:Geist,Inter,system-ui,sans-serif;color:#fff;background:#0F0B24}
.f{position:relative;width:1920px;height:1080px;overflow:hidden;background:radial-gradient(110% 90% at 30% 20%,var(--a),var(--b))}
.f:before{content:"";position:absolute;inset:0;background:repeating-conic-gradient(from 0deg at 72% 40%,rgba(255,255,255,.05) 0 5deg,transparent 5deg 15deg)}
.cap{position:absolute;left:150px;top:50%;width:820px;translate:0 -50%;animation:cap .8s cubic-bezier(.2,.8,.2,1) both}
.kick{font-size:30px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;opacity:.8;margin-bottom:26px}
h1{font-size:104px;line-height:1.02;font-weight:800;letter-spacing:-.035em}
h1 em{display:block;font-family:"Instrument Serif",Georgia,serif;font-style:italic;font-weight:400;font-size:118px;color:#FFD84D;letter-spacing:-.01em}
p{margin-top:34px;font-size:40px;line-height:1.3;font-weight:500;opacity:.92}
.ph{position:absolute;right:220px;top:70px;width:530px;height:942px;border-radius:64px;background:#0d0a1a;padding:14px;
  box-shadow:0 50px 100px rgba(0,0,0,.45),0 0 0 3px rgba(255,255,255,.16);animation:ph .8s cubic-bezier(.2,.8,.2,1) both}
.ph img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:52px;display:block}
.brand{position:absolute;left:150px;bottom:70px;display:flex;align-items:center;gap:16px;font-size:30px;font-weight:700;opacity:.9}
.brand img{width:52px;height:52px;border-radius:14px}
.center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;animation:cap .8s cubic-bezier(.2,.8,.2,1) both}
.center img.logo{width:190px;height:190px;border-radius:46px;box-shadow:0 30px 60px rgba(0,0,0,.4);margin-bottom:44px}
.center h1{font-size:120px} .center h1 em{font-size:134px} .center p{max-width:1200px}
.chips{display:flex;flex-wrap:wrap;gap:20px;margin-top:44px;justify-content:center}
.chips span{font-size:36px;font-weight:600;padding:18px 32px;border-radius:999px;background:rgba(255,255,255,.12);border:2px solid rgba(255,255,255,.22)}
.url{margin-top:46px;font-size:64px;font-weight:800;letter-spacing:-.02em;color:#FFD84D}
@keyframes cap{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:none}}
@keyframes ph{from{opacity:0;transform:translateY(80px) rotate(2deg)}to{opacity:1;transform:none}}
.center{animation-name:fadeup} @keyframes fadeup{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:none}}"""

BRAND = f'<div class="brand"><img src="{ICON64}">ffmpa.com</div>'

def phone(shot, a, b, kick, h1, em, sub):
    return (f'<div class="f" style="--a:{a};--b:{b}"><div class="cap"><div class="kick">{kick}</div><h1>{h1}<em>{em}</em></h1>'
            f'<p>{sub}</p></div><div class="ph"><img src="{b64(f"{RAW}/{shot}.png")}"></div>{BRAND}</div>')

SCENES = [  # (name, seconds, html)
    ("01_title", 3.6, f'<div class="f" style="--a:#5B35E8;--b:#1E0F5C"><div class="center"><img class="logo" src="{ICON64}">'
     '<h1>Real news,<em>made for kids</em></h1><p>A calm morning and evening news edition for ages 5 to 15</p></div></div>'),
    ("02_today", 3.6, phone("1_today", "#5B35E8", "#2A1580", "Every day", "Two calm", "editions a day", "Morning and evening, on your family's own clock")),
    ("03_levels", 3.6, phone("2_story", "#0B7F75", "#05433E", "Three reading levels", "One story,", "at their level", "Explorers 5 to 9, Thinkers 10 to 12, Navigators 13 to 15")),
    ("04_word", 3.4, phone("3_word", "#D9481E", "#7A2208", "Learn as you read", "Tap any word", "to learn it", "Build a word bank while you read")),
    ("05_sketch", 3.4, phone("4_sketch", "#2D5BC0", "#14306E", "Sketch explainers", "Hard ideas,", "drawn simply", "Three easy steps make a big idea clear")),
    ("06_big", 3.4, phone("5_big", "#0F8A5F", "#064A32", "The Big Story", "One story,", "all week long", "Follow it day by day, then decide what you think")),
    ("07_play", 3.4, phone("6_play", "#C2367A", "#6A1240", "Play and grow", "Quizzes, puzzles", "and crafts", "A few minutes of thinking, then you are done")),
    ("08_parents", 3.4, phone("7_parents", "#3A2A8C", "#120B33", "For parents", "Parents stay", "in control", "Reading level, topics and limits behind a PIN")),
    ("09_class", 3.4, phone("8_class", "#B5600F", "#5E2F04", "For schools", "Ready for", "the classroom", "A big screen quiz and a worksheet. Teachers see totals, never names")),
    ("10_safe", 4.2, '<div class="f" style="--a:#1B1340;--b:#0B0620"><div class="center"><h1>Safe by design,<em>fact checked daily</em></h1>'
     '<p>Every story is checked against its sources and reviewed before it goes out</p>'
     '<div class="chips"><span>No ads</span><span>No links out</span><span>No chat or strangers</span><span>Only the last 3 days of news</span></div></div></div>'),
    ("11_end", 4.4, f'<div class="f" style="--a:#5B35E8;--b:#1E0F5C"><div class="center"><img class="logo" src="{ICON64}">'
     '<h1>Real news,<em>made for kids</em></h1><p>Free for families and schools</p><div class="url">ffmpa.com</div></div></div>'),
]

def frames(page, html, seconds):
    """Yield JPEG bytes for every frame: the intro animation frame by frame, then the final frame held."""
    page.set_content(f"<style>{BASE}</style>{html}")
    page.wait_for_timeout(400)
    page.evaluate("document.getAnimations().forEach(a=>a.pause())")
    n, n_in = round(seconds * FPS), round(INTRO * FPS)
    last = None
    for i in range(n_in + 1):
        page.evaluate(f"document.getAnimations().forEach(a=>a.currentTime={i * 1000 / FPS})")
        last = page.screenshot(type="jpeg", quality=92)
        if i < n_in:
            yield last
    for _ in range(n - n_in):
        yield last

def render(page, name, seconds, html):
    tmp, final = f"{OUT}/{name}.tmp.mp4", f"{OUT}/{name}.mp4"
    fade = f"fade=t=in:st=0:d=0.25:color=0x0F0B24,fade=t=out:st={seconds - 0.3:.2f}:d=0.3:color=0x0F0B24"
    p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(FPS), "-i", "-",
                          "-vf", f"{fade},format=yuv420p", "-c:v", "libx264", "-crf", "18", "-preset", "veryfast",
                          "-pix_fmt", "yuv420p", "-r", str(FPS), "-movflags", "+faststart", tmp], stdin=subprocess.PIPE)
    for jpg in frames(page, html, seconds):
        p.stdin.write(jpg)
    p.stdin.close()
    if p.wait() != 0:
        sys.exit(f"ffmpeg failed on {name}")
    os.replace(tmp, final)
    return final

with sync_playwright() as pw:
    b = pw.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    page = b.new_page(viewport={"width": W, "height": H})
    if "--sample" in sys.argv:
        for name, sec, html in SCENES:
            page.set_content(f"<style>{BASE}</style>{html}")
            page.wait_for_timeout(1500)
            page.screenshot(path=f"{OUT}/sample_{name}.jpg", type="jpeg", quality=85)
        print("samples written")
    else:
        files = [render(page, *s) for s in SCENES]
        with open(f"{OUT}/list.txt", "w") as f:
            f.writelines(f"file '{x}'\n" for x in files)
        tmp = f"{OUT}/ffmpa_product_video.tmp.mp4"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", f"{OUT}/list.txt",
                        "-c", "copy", "-movflags", "+faststart", tmp], check=True)
        os.replace(tmp, f"{OUT}/ffmpa_product_video.mp4")
        print("video written")
    b.close()
