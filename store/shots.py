from playwright.sync_api import sync_playwright
import json
URL="file:///home/claude/repo-ffmpa/src/index.html?demo"
def boot(p, age="o"):
    p.goto(URL); p.wait_for_timeout(300)
    p.evaluate("document.getElementById('splash')&&document.getElementById('splash').classList.add('gone')")
    p.fill("#wE","parent@example.com"); p.click("#wF button[type=submit]"); p.fill("#wC","482913"); p.click("#wF button[type=submit]")
    p.fill("#wN","Aanya"); p.click(f'[data-a="{age}"]'); p.click("#wF button[type=submit]"); p.click("#wF button[type=submit]")
    p.fill("#wP","1234"); p.click("#wF button[type=submit]"); p.wait_for_timeout(1500)
with sync_playwright() as pw:
    b=pw.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
    def page():
        c=b.new_context(viewport={"width":412,"height":732},device_scale_factor=2.5); return c.new_page()
    p=page(); boot(p)
    p.screenshot(path="/home/claude/store/raw/1_today.png")
    p.evaluate("go(1)"); p.wait_for_timeout(2500); p.screenshot(path="/home/claude/store/raw/2_story.png")
    k=p.evaluate("(()=>{const e=document.querySelector('#deck .card.cur [data-k], #deck [data-k]'); if(e){e.click(); return e.dataset.k;} return null})()"); p.wait_for_timeout(900)
    p.screenshot(path="/home/claude/store/raw/3_word.png"); print("word",k)
    p.evaluate("closeSheet&&closeSheet()"); p.keyboard.press("Escape"); p.wait_for_timeout(300)
    sk=p.evaluate("Object.keys(SKETCHES)[0]"); p.evaluate(f"openSketch('{sk}',1)"); p.wait_for_timeout(1500); p.screenshot(path="/home/claude/store/raw/4_sketch.png")
    p.evaluate("closeSheet()"); p.wait_for_timeout(300); p.evaluate("openBig()"); p.wait_for_timeout(1200); p.screenshot(path="/home/claude/store/raw/5_big.png")
    p.evaluate("closeSheet()"); p.wait_for_timeout(300); p.evaluate("openPlay()"); p.wait_for_timeout(1200); p.screenshot(path="/home/claude/store/raw/6_play.png")
    p.evaluate("closeSheet()"); p.wait_for_timeout(300); p.evaluate("renderSettings()"); p.wait_for_timeout(900); p.screenshot(path="/home/claude/store/raw/7_parents.png")
    p.evaluate("closeSheet()"); p.wait_for_timeout(300); p.evaluate("klass={role:'teacher',name:'Class 5B',level:'o',code:'K7M2QX'}; openTeacher(); document.querySelectorAll('#sheet .sub').forEach(e=>{ if(/Prototype/.test(e.textContent)) e.textContent='You only ever see class totals, never one child.'; })"); p.wait_for_timeout(900); p.screenshot(path="/home/claude/store/raw/8_class.png")
    q=page(); boot(q,"x"); q.screenshot(path="/home/claude/store/raw/9_explorers.png")
    r=page(); boot(r,"n"); r.evaluate("go(1)"); r.wait_for_timeout(2500); r.screenshot(path="/home/claude/store/raw/10_navigators.png")
    b.close()
