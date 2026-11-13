import base64, json
from playwright.sync_api import sync_playwright
S="/home/claude/store"
b64=lambda p: "data:image/png;base64,"+base64.b64encode(open(p,"rb").read()).decode()
FR=[("1_today","Real news,","made for kids","A calm daily edition for ages 5 to 15","#5B35E8","#2A1580"),
    ("2_story","Short stories,","checked by editors","Local and world news, twice a day","#0B7F75","#05433E"),
    ("3_word","Tap any word","to learn it","Build a word bank while you read","#D9481E","#7A2208"),
    ("4_sketch","Hard ideas,","drawn simply","Sketch explainers in three easy steps","#2D5BC0","#14306E"),
    ("5_big","One Big Story,","all week long","Follow it day by day, then decide what you think","#0F8A5F","#064A32"),
    ("6_play","Quizzes, puzzles","and crafts","A few minutes of thinking, then you are done","#C2367A","#6A1240"),
    ("7_parents","Parents stay","in control","Reading level, topics and limits behind a PIN","#1B1340","#0B0620"),
    ("8_class","Ready for","the classroom","Big screen quiz and worksheet. No pupil names","#B5600F","#5E2F04")]
CSS='''@font-face{font-family:G;src:local("Geist")} *{box-sizing:border-box;margin:0}
body{width:1080px;height:1920px;overflow:hidden;font-family:Geist,Inter,sans-serif;color:#fff}
.f{position:relative;width:1080px;height:1920px;background:radial-gradient(120% 80% at 50% 0%,var(--a),var(--b));overflow:hidden}
.f:before{content:"";position:absolute;inset:0;background:repeating-conic-gradient(from 0deg at 50% 18%,rgba(255,255,255,.06) 0 5deg,transparent 5deg 15deg)}
.cap{position:relative;padding:120px 80px 0;text-align:center}
.cap h1{font-size:96px;line-height:1.02;font-weight:800;letter-spacing:-.035em}
.cap h1 em{display:block;font-family:"Instrument Serif",serif;font-style:italic;font-weight:400;font-size:112px;color:#FFD84D;letter-spacing:-.01em}
.cap p{margin-top:28px;font-size:40px;line-height:1.25;opacity:.92;font-weight:500}
.ph{position:absolute;left:50%;top:640px;translate:-50% 0;width:780px;height:1386px;border-radius:72px;background:#0d0a1a;padding:18px;box-shadow:0 40px 90px rgba(0,0,0,.45),0 0 0 3px rgba(255,255,255,.15)}
.ph img{width:100%;height:100%;object-fit:cover;object-position:top;border-radius:56px;display:block}
.logo{position:absolute;left:50%;bottom:36px;translate:-50% 0;display:none}'''
with sync_playwright() as pw:
    b=pw.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
    p=b.new_page(viewport={"width":1080,"height":1920})
    for i,(f,h1,em,sub,a,bb) in enumerate(FR,1):
        p.set_content(f'<style>{CSS}</style><div class="f" style="--a:{a};--b:{bb}"><div class="cap"><h1>{h1}<em>{em}</em></h1><p>{sub}</p></div><div class="ph"><img src="{b64(S+"/raw/"+f+".png")}"></div></div>')
        p.wait_for_timeout(250); p.screenshot(path=f"{S}/out/phone_{i}.png")
    # feature graphic 1024x500
    p.set_viewport_size({"width":1024,"height":500})
    cards="".join(f'<i style="left:{x}px;top:{y}px;transform:rotate({r}deg)"><b>{e}</b><u style="background:{c}"></u><u style="background:{c};width:60%;opacity:.4"></u></i>' for e,c,x,y,r in [("🚀","#2D5BC0",640,40,-8),("🐘","#0F8A5F",870,70,9),("🌍","#0B7F75",760,250,-4),("🔬","#7A3FD1",900,300,7),("⚽","#D9481E",620,330,6)])
    fg=f'''<style>*{{margin:0;box-sizing:border-box}} body{{width:1024px;height:500px;overflow:hidden;font-family:Geist,sans-serif}}
    .g{{position:relative;width:1024px;height:500px;background:radial-gradient(90% 120% at 25% 50%,#3B1FA6,#24125F 60%,#140A38);color:#fff;overflow:hidden}}
    .g:before{{content:"";position:absolute;inset:0;background:repeating-conic-gradient(from 0deg at 25% 50%,rgba(255,255,255,.06) 0 5deg,transparent 5deg 15deg)}}
    .bl{{position:absolute;border-radius:50%;filter:blur(50px);opacity:.5}}
    .t{{position:absolute;left:70px;top:110px}} .t img{{width:120px;height:120px;border-radius:28px;box-shadow:0 14px 30px rgba(0,0,0,.35)}}
    .t h1{{font-size:84px;font-weight:800;letter-spacing:-.04em;margin-top:18px;line-height:1}} .t h1 b:nth-child(1){{color:#FFB020}}.t h1 b:nth-child(2){{color:#FF6A4D}}.t h1 b:nth-child(3){{color:#fff}}.t h1 b:nth-child(4){{color:#3DD9B4}}.t h1 b:nth-child(5){{color:#FFD84D}}
    .t p{{font-size:34px;margin-top:10px}} .t p em{{font-family:"Instrument Serif",serif;color:#FFD84D;font-size:40px}}
    i{{position:absolute;width:110px;height:128px;border-radius:22px;background:#fff;box-shadow:0 16px 30px rgba(0,0,0,.35);padding:14px;display:grid;align-content:start;gap:8px;font-style:normal}} i b{{font-size:40px}} i u{{display:block;height:9px;border-radius:5px}}</style>
    <div class="g"><div class="bl" style="width:420px;height:420px;background:#FF6A4D;left:-120px;top:-160px"></div><div class="bl" style="width:420px;height:420px;background:#3DD9B4;right:-80px;bottom:-200px"></div>
    <div class="t"><img src="{b64(S+"/icon-512.png")}"><h1><b>f</b><b>f</b><b>m</b><b>p</b><b>a</b></h1><p>Real news, <em>made for kids.</em></p></div>{cards}</div>'''
    p.set_content(fg); p.wait_for_timeout(300); p.screenshot(path=f"{S}/out/feature_1024x500.png")
    b.close()
