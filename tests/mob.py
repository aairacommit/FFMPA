import asyncio,sys
from playwright.async_api import async_playwright
from PIL import Image
DEV=[("s",320,568,2),("a",360,740,3),("p",393,780,2.75),("i",390,664,3)]  # small, android with bars, pixel, iphone safari visible area
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        for name,w,h,dpr in DEV:
            ctx=await b.new_context(viewport={"width":w,"height":h},device_scale_factor=1.5,is_mobile=True,has_touch=True,user_agent="Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36")
            pg=await ctx.new_page(); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
            await pg.goto("file:///home/claude/ffmpa/index.html"); await pg.wait_for_timeout(800); shots=[]
            async def shot(k): f=f"/home/claude/mb_{name}_{k}.png"; await pg.screenshot(path=f); shots.append(f)
            await shot("welcome")
            await pg.evaluate("()=>{ob.email='p@example.com'; startWelcome('child')}"); await pg.wait_for_timeout(400); await shot("child")
            await pg.evaluate("()=>{ob.email='p@example.com'; startWelcome('country')}"); await pg.wait_for_timeout(400); await shot("country")
            await pg.evaluate("()=>{localStorage.clear();localStorage.setItem('ffmpa-coach-word','true');localStorage.setItem('ffmpa-coach-swipe','true');localStorage.setItem('ffmpa-session',JSON.stringify({email:'p@example.com'})); localStorage.setItem('ffmpa-settings',JSON.stringify(Object.assign({},DEFAULT_SETTINGS,{name:'Aanya',age:'o',country:'IN',pin:'1234'}))); location.reload();}")
            await pg.wait_for_timeout(1500); await shot("today")
            await pg.evaluate("()=>go(1)"); await pg.wait_for_timeout(4500); await shot("story")
            await pg.evaluate("()=>document.querySelector('.slide.live .term').click()"); await pg.wait_for_timeout(500); await shot("term"); await pg.evaluate("()=>closeSheet()")
            await pg.evaluate("()=>openSketch('smog',2)"); await pg.wait_for_timeout(2500); await shot("sketch"); await pg.evaluate("()=>closeSheet()")
            await pg.evaluate("()=>openPlay()"); await pg.wait_for_timeout(500); await shot("play"); await pg.evaluate("()=>closeSheet()")
            await pg.evaluate("()=>openPuzzles()"); await pg.wait_for_timeout(500); await shot("puz"); await pg.evaluate("()=>closeSheet()")
            li=await pg.evaluate("()=>deck.findIndex(d=>d.type==='learn')"); await pg.evaluate("(i)=>go(i)",li); await pg.wait_for_timeout(900); await shot("learn")
            await pg.evaluate("()=>go(6)"); await pg.wait_for_timeout(900); await shot("s6")
            await pg.evaluate("()=>go(deck.length-1)"); await pg.wait_for_timeout(900); await shot("end")
            print(name, errs, await pg.evaluate("()=>[innerWidth,innerHeight,document.documentElement.scrollWidth,document.body.scrollHeight]"))
            ims=[Image.open(s) for s in shots]; W=Image.new('RGB',(sum(i.width for i in ims[:6]),ims[0].height*2),'grey'); x=0
            for i,im in enumerate(ims): 
                if i==6: x=0
                W.paste(im,(x,0 if i<6 else im.height)); x+=im.width
            W.save(f"/home/claude/mob_{name}.png"); await ctx.close()
        await b.close()
asyncio.run(main())
