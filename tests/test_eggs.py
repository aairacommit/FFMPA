import asyncio
from playwright.async_api import async_playwright
from PIL import Image
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        pg=await b.new_page(viewport={"width":390,"height":844},device_scale_factor=1.5,has_touch=True)
        errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
        await pg.goto("file:///home/claude/ffmpa/index.html"); await pg.wait_for_timeout(500)
        await pg.evaluate("()=>{localStorage.clear();localStorage.setItem('ffmpa-coach-word','true');localStorage.setItem('ffmpa-coach-swipe','true');localStorage.setItem('ffmpa-session',JSON.stringify({email:'parent@example.com'})); localStorage.setItem('ffmpa-settings',JSON.stringify(Object.assign({},DEFAULT_SETTINGS,{name:'Aanya',age:'o',country:'IN',pin:'1234'}))); location.reload();}")
        await pg.wait_for_timeout(1500)
        n=[]
        async def shot(k): await pg.screenshot(path=f"/home/claude/e_{k}.png"); n.append(k)
        print("moon", await pg.evaluate("()=>JSON.stringify(moonInfo())"))
        print("hidden", await pg.evaluate("()=>hiddenWord()&&hiddenWord().k"))
        # 5 time traveller
        for i in range(3): await pg.keyboard.press("ArrowUp"); await pg.wait_for_timeout(320)
        await pg.wait_for_timeout(500); await shot("time"); await pg.evaluate("()=>closeSheet()")
        # 1 buddy
        for i in range(5): await pg.click("#brand"); await pg.wait_for_timeout(120)
        await pg.wait_for_timeout(500); await shot("buddy"); await pg.evaluate("()=>closeSheet()")
        # 3 hello (hold)
        bx=await pg.locator("#ctyPill").bounding_box(); await pg.mouse.move(bx["x"]+20,bx["y"]+10); await pg.mouse.down(); await pg.wait_for_timeout(700); await pg.mouse.up(); await pg.wait_for_timeout(500)
        print("hello title", await pg.evaluate("()=>document.querySelector('#shTitle').textContent")); await shot("hello"); await pg.evaluate("()=>closeSheet()")
        bx=await pg.locator("#edPill").bounding_box(); await pg.mouse.move(bx["x"]+20,bx["y"]+10); await pg.mouse.down(); await pg.wait_for_timeout(700); await pg.mouse.up(); await pg.wait_for_timeout(500)
        print("moon title", await pg.evaluate("()=>document.querySelector('#shTitle').textContent")); await shot("moon"); await pg.evaluate("()=>closeSheet()")
        # normal click on pills still works
        await pg.wait_for_timeout(800); await pg.click("#ctyPill"); await pg.wait_for_timeout(400); print("country click", await pg.evaluate("()=>document.querySelector('#shTitle').textContent")); await pg.evaluate("()=>closeSheet()")
        # 2 hidden word
        k=await pg.evaluate("()=>hiddenWord().k"); j=await pg.evaluate("(k)=>+document.querySelector(`#deck .term[data-k='${k}']`).closest('.slide').dataset.i",k)
        await pg.evaluate("(j)=>go(j)",j); await pg.wait_for_timeout(3500); await pg.evaluate("(k)=>document.querySelector(`#deck .slide.live .term[data-k='${k}']`).click()",k); await pg.wait_for_timeout(600); await shot("word"); await pg.evaluate("()=>closeSheet()")
        # feelings
        await pg.evaluate("()=>{const b=document.querySelector('.slide.live .cbody'); b.click(); b.scrollTo(0,9999)}"); await pg.wait_for_timeout(500); await shot("feel")
        await pg.click(".slide.live .feel [data-f=worried]"); await pg.wait_for_timeout(600); await shot("worry"); await pg.click("#wyGo"); await pg.wait_for_timeout(800)
        print("after calm idx", await pg.evaluate("()=>deck[idx].s&&deck[idx].s.cat"))
        await pg.evaluate("(j)=>go(j)",j); await pg.wait_for_timeout(600); await pg.evaluate("()=>document.querySelector('.slide.live .cbody').scrollTo(0,9999)"); await pg.wait_for_timeout(400); await shot("feeldone")
        # 6 reporter
        await pg.evaluate("()=>go(deck.length-1)"); await pg.wait_for_timeout(900); await shot("end")
        for i in range(3): await pg.click(".slide.live .endcard .moon"); await pg.wait_for_timeout(150)
        await pg.wait_for_timeout(500); await pg.fill("#rpT","Aanya finishes the whole morning edition in Bengaluru"); await pg.click("#rpS"); await pg.wait_for_timeout(500); await shot("report"); await pg.evaluate("()=>closeSheet()")
        await pg.wait_for_timeout(3500)
        print("finds", await pg.evaluate("()=>JSON.stringify(finds)"), await pg.evaluate("()=>findCount()"))
        await pg.evaluate("()=>openPlay()"); await pg.wait_for_timeout(500); await shot("play"); await pg.click("#hF"); await pg.wait_for_timeout(500); await shot("finds"); await pg.evaluate("()=>closeSheet()")
        await pg.evaluate("()=>openMenu()"); await pg.wait_for_timeout(400); await pg.click("#mC"); await pg.wait_for_timeout(400); await pg.click("#cfS [data-v=xl]"); await pg.click("#cfL [data-v=l]"); await pg.wait_for_timeout(300); await shot("comfort"); await pg.evaluate("()=>closeSheet()")
        await pg.evaluate("()=>go(1)"); await pg.wait_for_timeout(4500); await shot("bigtext")
        # resume after reload
        await pg.reload(); await pg.wait_for_timeout(2600); print("resume idx", await pg.evaluate("()=>idx"), await pg.evaluate("()=>readIds.size")); await shot("resume")
        # fresh: locked finds + parent note
        await pg.evaluate("()=>{store.del('ffmpa-finds'); finds={}; openFinds();}"); await pg.wait_for_timeout(500); await shot("locked"); await pg.evaluate("()=>closeSheet()")
        print(errs)
        for i in range(0,len(n),6):
            g=n[i:i+6]; W=Image.new('RGB',(585*len(g),1266),'grey')
            for jx,kk in enumerate(g): W.paste(Image.open(f"/home/claude/e_{kk}.png"),(jx*585,0))
            W.save(f"/home/claude/eg_{i//6}.png")
        print(n)
        await b.close()
asyncio.run(main())
