import asyncio
from playwright.async_api import async_playwright
from PIL import Image
async def pin(pg):
    for d in "1234":
        await pg.click(f".keypad button:text-is('{d}')"); await pg.wait_for_timeout(120)
    await pg.wait_for_timeout(600)
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        pg=await b.new_page(viewport={"width":390,"height":844},device_scale_factor=1.5)
        errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
        await pg.goto("file:///home/claude/ffmpa/index.html"); await pg.wait_for_timeout(500)
        await pg.evaluate("()=>{localStorage.clear();localStorage.setItem('ffmpa-coach-word','true');localStorage.setItem('ffmpa-coach-swipe','true');localStorage.setItem('ffmpa-session',JSON.stringify({email:'parent@example.com'})); localStorage.setItem('ffmpa-settings',JSON.stringify(Object.assign({},DEFAULT_SETTINGS,{name:'Aanya',age:'o',country:'IN',pin:'1234'}))); location.reload();}")
        await pg.wait_for_timeout(1600); n=[]
        async def shot(k,full=False): await pg.screenshot(path=f"/home/claude/v_{k}.png"); n.append(k)
        await shot("today")
        await pg.click(".slide.live [data-big]"); await pg.wait_for_timeout(700); await shot("big1")
        await pg.evaluate("()=>document.querySelector('#sheet').scrollTo(0,560)"); await pg.wait_for_timeout(400); await shot("big2")
        await pg.evaluate("()=>document.querySelector('#sheet').scrollTo(0,9999)"); await pg.click("[data-bp='0']"); await pg.wait_for_timeout(400); await shot("big3")
        await pg.evaluate("()=>closeSheet()"); await pg.wait_for_timeout(300)
        j=await pg.evaluate("()=>deck.findIndex(d=>d.type==='story'&&d.s.id==='g-cop31')"); await pg.evaluate("(j)=>go(j)",j); await pg.wait_for_timeout(3200); await shot("chip")
        await pg.click(".slide.live .skchip"); await pg.wait_for_timeout(300); await pg.evaluate("()=>openSketch('greenhouse',2)"); await pg.wait_for_timeout(2600); await shot("green"); await pg.evaluate("()=>closeSheet()")
        await pg.evaluate("()=>openPlay()"); await pg.wait_for_timeout(500); await shot("hub")
        await pg.click("#hY"); await pg.wait_for_timeout(500); await shot("yr1")
        await pg.fill("#yrH","Aanya's neighbour waters the street trees every evening"); await pg.fill("#yrB","She carries two buckets from her house. Nobody asked her to do it."); await pg.click("#yrGo"); await pg.wait_for_timeout(400); await pin(pg); await shot("yr2")
        await pg.evaluate("()=>closeSheet()"); await pg.evaluate("()=>openClassroom()"); await pg.wait_for_timeout(400); await shot("cl0")
        await pg.click("#clT"); await pg.wait_for_timeout(400); await pin(pg); await pg.fill("#tcN","Class 5B"); await pg.click("#tcGo"); await pg.wait_for_timeout(500); await shot("cl1")
        await pg.click("#tcQ"); await pg.wait_for_timeout(500); await pg.click("[data-ps]"); await pg.wait_for_timeout(500); await shot("present")
        await pg.click("[data-pc]"); await pg.evaluate("()=>openWorksheet()"); await pg.wait_for_timeout(500); await shot("ws")
        await pg.pdf if False else None
        await pg.click("[data-wc]")
        # admin approve
        await pg.goto("file:///home/claude/ffmpa/index.html#admin"); await pg.wait_for_timeout(900); await pg.click("[data-s=extras]"); await pg.wait_for_timeout(400)
        await pg.click("[data-yr$=':approved']"); await pg.wait_for_timeout(400); print("status", await pg.evaluate("()=>reports()[0].status"))
        print(errs, n)
        for i in range(0,len(n),7):
            g=n[i:i+7]; W=Image.new('RGB',(585*len(g),1266),'grey')
            for jx,kk in enumerate(g): W.paste(Image.open(f"/home/claude/v_{kk}.png"),(jx*585,0))
            W.save(f"/home/claude/vv_{i//7}.png")
        # desktop present + worksheet
        pg2=await b.new_page(viewport={"width":1280,"height":720})
        await pg2.goto("file:///home/claude/ffmpa/index.html"); await pg2.wait_for_timeout(1200)
        await pg2.evaluate("()=>{klass={role:'teacher',name:'Class 5B',level:'o',code:'K7PQ2M'}; openPresent(0,true)}"); await pg2.wait_for_timeout(500); await pg2.screenshot(path="/home/claude/v_pdesk.png")
        await pg2.evaluate("()=>{closeOverlay('presentOv'); openWorksheet()}"); await pg2.wait_for_timeout(400); await pg2.emulate_media(media="print"); await pg2.pdf(path="/home/claude/ws.pdf") if False else None
        await pg2.screenshot(path="/home/claude/v_wsdesk.png", full_page=True)
        await b.close()
asyncio.run(main())
