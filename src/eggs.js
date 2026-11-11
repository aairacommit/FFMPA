
/* ===================== Pass 3: comfort, feelings, hear-it, resume, hidden finds ===================== */
const coachNow=(text)=>{ document.querySelectorAll(".coach").forEach(x=>x.remove()); const el=document.createElement("div"); el.className="coach"; el.textContent=text; document.querySelector(".app").appendChild(el); setTimeout(()=>{ el.classList.add("out"); setTimeout(()=>el.remove(),350); },3600); };
const sayIt=(text,lang)=>{ try{ if(!("speechSynthesis" in window)) return false; speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); if(lang) u.lang=lang; u.rate=.85; speechSynthesis.speak(u); return true; }catch(e){ return false; } };
const canSpeak=()=>("speechSynthesis" in window) && settings.readAloud!==false;

/* ---- toasts wait for open sheets and sit above the bottom bar ---- */
nextToast=function(){ if(document.getElementById("sheetOv").classList.contains("open")){ toastOn=true; setTimeout(nextToast,500); return; }
  const t=toastQ.shift(); if(!t){ toastOn=false; return; } toastOn=true; const el=document.createElement("div"); el.className="toast"; el.style.setProperty("--tc2",t[1]||"#5B35E8"); el.setAttribute("role","status"); el.innerHTML=t[0]; document.querySelector(".app").appendChild(el); const tm=setTimeout(()=>{ curToast=null; el.classList.add("out"); setTimeout(()=>{ el.remove(); nextToast(); },350); },2600); curToast={t,el,tm,at:Date.now()}; };
let curToast=null;
function parkToast(){ if(!curToast||Date.now()-curToast.at>1500) return; clearTimeout(curToast.tm); curToast.el.remove(); toastQ.unshift(curToast.t); curToast=null; setTimeout(nextToast,500); }

/* ---- reading comfort: text size and line spacing, no PIN needed ---- */
let comfort=Object.assign({size:"m",space:"m"}, store.get("ffmpa-comfort",{}));
const SIZES={m:["Regular",1],l:["Large",1.12],xl:["Larger",1.25]};
function applyComfort(){ const base=settings.age==="x"?19:16.5; const r=document.documentElement; r.style.setProperty("--fs",(base*SIZES[comfort.size][1]).toFixed(1)+"px"); r.classList.toggle("airy",comfort.space==="l"); }
function openComfort(){
  openSheet(`<h2 id="shTitle">Reading <em class="v">comfort</em></h2><p class="sub">Pick what feels easiest on your eyes. It changes story text only.</p>
    <h4 class="h4">Text size</h4><div class="seg" id="cfS">${Object.entries(SIZES).map(([k,[l]])=>`<button class="press" data-v="${k}" aria-pressed="${comfort.size===k}">${l}</button>`).join("")}</div>
    <h4 class="h4">Line spacing</h4><div class="seg" id="cfL"><button class="press" data-v="m" aria-pressed="${comfort.space==="m"}">Regular</button><button class="press" data-v="l" aria-pressed="${comfort.space==="l"}">Roomy</button></div>
    <div class="cfprev cbody"><p>Astronauts train for years before they fly. They practise under water because floating there feels a little like floating in space.</p></div>`,
    sh=>{ const set=(id,key)=> sh.querySelectorAll("#"+id+" button").forEach(b=> b.onclick=()=>{ comfort[key]=b.dataset.v; store.set("ffmpa-comfort",comfort); applyComfort(); sh.querySelectorAll("#"+id+" button").forEach(x=>x.setAttribute("aria-pressed",x===b)); setTimeout(markMore,80); }); set("cfS","size"); set("cfL","space"); });
}

/* ---- how does this story feel? ---- */
const FEELS={curious:["Curious","bulb","Curiosity is how every reporter starts. Open More to dig deeper."],hopeful:["Hopeful","sun","Good news is real news too. Tell someone about this one."],surprised:["Surprised","sparkle","Surprising news is worth checking twice. Look at the source below."],worried:["Worried","shield",""]};
function feelHTML(id){ const f=STATS.feels&&STATS.feels[id];
  if(f&&FEELS[f]) return `<div class="feel done" data-feel="${id}"><span>${ico(FEELS[f][1])} This story made you feel <b>${FEELS[f][0].toLowerCase()}</b>.</span><button class="lk press" data-fc>Change</button>${FEELS[f][2]?`<p>${FEELS[f][2]}</p>`:`<p>That is okay. <button class="lk press" data-fw>See what helps</button></p>`}</div>`;
  return `<div class="feel" data-feel="${id}"><h4>How did this story feel?</h4><div class="feelrow">${Object.entries(FEELS).map(([k,[l,ic]])=>`<button class="press" data-f="${k}">${l}</button>`).join("")}</div></div>`; }
function wireFeel(root){ root.querySelectorAll(".feel").forEach(box=>{ const id=box.dataset.feel;
  const redo=html=>{ const t=document.createElement("div"); t.innerHTML=html; const n=t.firstElementChild; box.replaceWith(n); wireFeel(n.parentElement); setTimeout(markMore,60); };
  box.querySelectorAll("[data-f]").forEach(b=> b.onclick=e=>{ e.stopPropagation(); STATS.feels=STATS.feels||{}; STATS.feels[id]=b.dataset.f; saveStats(); redo(feelHTML(id)); if(b.dataset.f==="worried") openWorry(id); });
  const c=box.querySelector("[data-fc]"); if(c) c.onclick=e=>{ e.stopPropagation(); delete STATS.feels[id]; saveStats(); redo(feelHTML(id)); };
  const w=box.querySelector("[data-fw]"); if(w) w.onclick=e=>{ e.stopPropagation(); openWorry(id); };
}); }
function openWorry(id){
  const calm=["nature","culture","science","space","sports"]; const j=deck.findIndex((d,i)=>d.type==="story"&&d.s.id!==id&&calm.includes(d.s.cat)&&!readIds.has(d.s.id)); const k=j>=0?j:deck.findIndex(d=>d.type==="story"&&d.s.id!==id&&calm.includes(d.s.cat));
  openSheet(`<h2 id="shTitle">It is okay to feel <em class="v">worried.</em></h2><p class="sub">News sometimes tells us about hard things. Feeling worried shows that you care.</p>
    <div class="list">
      <div class="item"><b>Look for the helpers</b><p>In almost every hard story there are people working to fix it. Read the story again and spot them.</p></div>
      <div class="item"><b>Talk about it</b><p>Tell a grown-up you trust what you read and how it felt. Saying it out loud makes it smaller.</p></div>
      <div class="item"><b>Take a break</b><p>You do not have to read everything. Three slow breaths, then choose a different story.</p></div>
    </div>
    <div class="row" style="margin-top:14px">${k>=0?`<button class="btn sun press" id="wyGo">Show me a calmer story</button>`:""}<button class="btn ghost press" id="wyBk">Back to the story</button></div>`,
    ()=>{ $("#wyBk").onclick=closeSheet; const g=$("#wyGo"); if(g) g.onclick=()=>{ closeSheet(); go(k); }; });
}
function worryNoteHTML(){ const ids=Object.entries(STATS.feels||{}).filter(([,f])=>f==="worried").map(([i])=>i); const hit=deck.filter(d=>d.type==="story"&&ids.includes(d.s.id)).map(d=>v(d.s).t);
  return `<div class="box where" style="margin:0 0 14px"><h4>Feelings check</h4><p>${hit.length?`${esc(settings.name||"Your child")} marked ${hit.length===1?"this story":"these stories"} as worrying: ${hit.map(t=>"“"+t+"”").join(", ")}. A short chat may help.`:`No stories in this edition were marked as worrying. Children can tag how a story feels at the end of each story.`}</p></div>`; }

/* ---- decorate the deck after every render ---- */
const _renderDeck=renderDeck;
renderDeck=function(){ _renderDeck(); const d=$("#deck");
  d.querySelectorAll(".slide").forEach(sl=>{ const it=deck[+sl.dataset.i]; if(it&&it.type==="story"){ const b=sl.querySelector(".cbody"); if(b&&!b.querySelector(".feel")) b.insertAdjacentHTML("beforeend",feelHTML(it.s.id)); } });
  wireFeel(d); wireHold(d); applyComfort(); setTimeout(markMore,80); };

/* ---- press and hold helper (also blocks the click that follows) ---- */
let holdBlock=0;
function onHold(el,fn){ if(!el||el.dataset.hold) return; el.dataset.hold=1; let t=null; const stop=()=>{ clearTimeout(t); t=null; };
  el.addEventListener("pointerdown",()=>{ stop(); t=setTimeout(()=>{ holdBlock=Date.now(); fn(el); },520); });
  ["pointerup","pointerleave","pointercancel"].forEach(ev=>el.addEventListener(ev,stop));
  el.addEventListener("contextmenu",e=>e.preventDefault()); }
document.addEventListener("click",e=>{ if(Date.now()-holdBlock<700){ e.stopPropagation(); e.preventDefault(); } },true);
function wireHold(root){ root.querySelectorAll(".term").forEach(b=> onHold(b,()=>{ const g=G[b.dataset.k]; if(g&&canSpeak()){ sayIt(g[0]); coachNow("Saying: "+g[0]); } })); }

/* ---- word popup: hear it, and the hidden word ---- */
const _openTerm=openTerm;
openTerm=function(k){ _openTerm(k); const g=G[k], sh=$("#sheet"), row=sh.querySelector(".row"); if(!g||!row) return;
  if(canSpeak()){ const b=document.createElement("button"); b.className="btn ghost press"; b.id="tHear"; b.innerHTML=ico("headphones")+" Hear it"; b.onclick=()=>sayIt(g[0]); row.insertBefore(b,row.children[1]||null); }
  const hw=hiddenWord(); if(hw&&hw.k===k){ row.insertAdjacentHTML("beforebegin",`<div class="box find"><h4>${ico("sparkle")} Hidden word found</h4><p><b>Where the word comes from.</b> ${hw.o}</p></div>`); found("word"); } };
function hiddenWord(){ const list=(typeof HIDDEN_WORDS!=="undefined"&&HIDDEN_WORDS[TODAY()])||[]; const inDeck=new Set([...document.querySelectorAll("#deck .term")].map(b=>b.dataset.k)); const hit=list.find(h=>inDeck.has(h.k)&&G[h.k]); return hit||null; }

/* ---- resume where the reader stopped ---- */
function resumeReading(){ if(!session||session.preview||idx!==0||topic!=="all") return; const tot=deck.filter(d=>d.type==="story").length; if(!readIds.size||readIds.size>=tot) return; const j=deck.findIndex(d=>d.type==="story"&&!readIds.has(d.s.id)); if(j>1){ go(j); coachNow("Welcome back. Picking up where you stopped."); } }

/* ===================== Hidden finds ===================== */
const FINDS=[
  {id:"buddy", t:"Buddy's newsroom secret", r:"Someone at the very top likes company. Say hello five times, quickly.", how:"Tap the Buddy logo five times", learn:"One trick reporters use to check what is true", open:()=>openSecret()},
  {id:"word",  t:"The hidden word", r:"One highlighted word in today's edition is hiding the story of its own name.", how:"Tap the right highlighted word in a story", learn:"Where a word in the news comes from", open:()=>{ const h=hiddenWord(); if(h) _openTermPlus(h.k); }},
  {id:"hello", t:"Hello, world", r:"Press and hold the place you call home, and the world answers.", how:"Press and hold the country button", learn:"How to say hello in six languages", open:()=>openHello()},
  {id:"moon",  t:"Tonight's moon", r:"The sun or moon at the top of the screen knows the sky. Hold it for a moment.", how:"Press and hold the Morning or Evening button", learn:"The real shape of the moon tonight", open:()=>openMoon()},
  {id:"time",  t:"Time traveller", r:"What comes before the first card? Try to go back anyway. Then again. And again.", how:"On the first card, swipe back three times", learn:"Something that happened on this date long ago", open:()=>openBackThen()},
  {id:"report",t:"Be the reporter", r:"When you are all caught up, the moon is waiting. Three taps wake it.", how:"On the last card, tap the moon three times", learn:"How to write a headline about your own day", open:()=>openReporter()}
];
let finds=store.get("ffmpa-finds",{});
const findCount=()=>FINDS.filter(f=>finds[f.id]).length;
function found(id){ if(finds[id]) return; finds[id]=TODAY(); if(session&&!session.preview) store.set("ffmpa-finds",finds); const f=FINDS.find(x=>x.id===id); toast(`${ico("sparkle")}<span><b>Hidden find ${findCount()} of ${FINDS.length}</b> · ${f.t}</span>`,"#B5600F"); checkAch(); document.querySelectorAll("[data-finds] b").forEach(b=>b.textContent=findCount()+" of "+FINDS.length); }
ACH.push({id:"finder", t:"Sharp eyes", d:"Hidden finds discovered", ic:"sparkle", c:"#B5600F", tiers:[1,3,6], m:()=>findCount()});
function _openTermPlus(k){ openTerm(k); }
function openFinds(){
  openSheet(`<h2 id="shTitle">Hidden <em class="v">finds</em></h2><p class="sub">${findCount()} of ${FINDS.length} found. FFMPA has secrets tucked away, and each one teaches you something. The riddles are your clues.</p>
    <div class="list finds">${FINDS.map((f,i)=> finds[f.id]
      ? `<button class="item fd press" data-fo="${f.id}"><span class="fn">${ico("sparkle")}</span><div><b>${f.t}</b><p>${f.learn}. ${f.how}.</p></div></button>`
      : `<div class="item fd lock"><span class="fn">?</span><div><b>Riddle ${i+1}</b><p>${f.r}</p></div></div>`).join("")}</div>`,
    sh=> sh.querySelectorAll("[data-fo]").forEach(b=> b.onclick=()=> FINDS.find(f=>f.id===b.dataset.fo).open()));
}
function findsAdminHTML(){ return `<div class="panel"><h2>Hidden finds</h2><p class="note">Six discoveries children can stumble on. Each one teaches something. Daily content (secret, hidden word, on this date) comes from the pipeline.</p><div class="tablewrap"><table class="adm-table"><thead><tr><th>Find</th><th>How a child finds it</th><th>What it teaches</th></tr></thead><tbody>${FINDS.map(f=>`<tr><td>${f.t}</td><td>${f.how}</td><td>${f.learn}</td></tr>`).join("")}</tbody></table></div></div>`; }

/* 1. Buddy's newsroom secret: tap the logo five times */
let buddyTaps=[];
document.addEventListener("click",e=>{ if(!e.target.closest("#brand")) return; const n=Date.now(); buddyTaps=buddyTaps.filter(t=>n-t<2600); buddyTaps.push(n); const bd=document.querySelector("#brand .buddy"); if(bd){ bd.classList.remove("wig"); void bd.getBoundingClientRect(); bd.classList.add("wig"); } if(buddyTaps.length>=5){ buddyTaps=[]; openSecret(); } });
function openSecret(){ const i=dOf(TODAY()).getDay(), s=SECRETS[i%SECRETS.length];
  openSheet(`<span class="ttype" style="background:#FFF1D6;color:#8A4B00">Newsroom secret ${i+1} of ${SECRETS.length}</span><h2 id="shTitle" style="margin-top:8px">${s.t}</h2><p>${s.b}</p>
    <div class="box think"><h4>Try it today</h4><p>${s.try}</p></div><p class="sub" style="margin-top:12px">Buddy shares a different secret each day of the week.</p>`); found("buddy"); }

/* 3. Hello, world: hold the country button */
function openHello(){ const me=settings.country;
  openSheet(`<h2 id="shTitle">Hello, <em class="v">world</em></h2><p class="sub">Children in every FFMPA country read the news today. Here is how they say hello.${canSpeak()?" Tap one to hear it.":""}</p>
    <div class="list hellos">${HELLOS.map((h,i)=>`<button class="item press" data-h="${i}"><div><b>${h.w}</b> <span class="say">${h.say}</span><p>${h.lang} · ${h.where.map(c=>COUNTRIES[c]?COUNTRIES[c].name:c).join(", ")}${h.where.includes(me)?" · your country":""}</p><p>${h.note}</p></div></button>`).join("")}</div>`,
    sh=> sh.querySelectorAll("[data-h]").forEach(b=> b.onclick=()=>{ const h=HELLOS[+b.dataset.h]; if(canSpeak()) sayIt(h.speak||h.w,h.code); })); found("hello"); }

/* 4. Tonight's moon: hold the edition button */
function moonInfo(){ const SYN=29.530588853, d=dOf(TODAY()); const t=Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),15); let age=((t-Date.UTC(2000,0,6,18,14))/DAY)%SYN; if(age<0) age+=SYN; const f=age/SYN, lit=(1-Math.cos(2*Math.PI*f))/2;
  const names=[[1.2,"New moon"],[6.4,"Waxing crescent"],[8.4,"First quarter"],[13.6,"Waxing gibbous"],[15.9,"Full moon"],[21.1,"Waning gibbous"],[23.1,"Last quarter"],[28.3,"Waning crescent"],[30,"New moon"]]; const name=names.find(n=>age<n[0])[1];
  let toFull=SYN/2-age; if(toFull<0) toFull+=SYN; return {age,f,lit,name,toFull:Math.round(toFull),waxing:f<.5}; }
function moonSVG(m,south){ const r=44,c=50, rx=Math.abs(Math.cos(2*Math.PI*m.f))*r, gib=m.lit>.5; const flip=(m.waxing?1:-1)*(south?-1:1);
  return `<svg viewBox="0 0 100 100" class="moonpic" role="img" aria-label="${m.name}"><circle cx="50" cy="50" r="${r}" fill="#1B1A2B"/><path transform="translate(50 0) scale(${flip} 1) translate(-50 0)" fill="#F3EFD8" d="M${c} ${c-r} A${r} ${r} 0 0 1 ${c} ${c+r} A${rx.toFixed(2)} ${r} 0 0 ${gib?1:0} ${c} ${c-r}Z"/><circle cx="50" cy="50" r="${r}" fill="none" stroke="#D9D6E8"/></svg>`; }
function openMoon(){ const m=moonInfo(), south=settings.country==="AU"; const pct=Math.round(m.lit*100);
  const why = m.name==="New moon"?"The moon is between Earth and the Sun, so its bright side faces away from us.":m.name==="Full moon"?"Earth is between the Sun and the moon, so we see the whole bright side.":m.waxing?"Each night this week you will see a little more of the bright side. That is called waxing.":"Each night this week you will see a little less of the bright side. That is called waning.";
  openSheet(`<span class="ttype" style="background:#E8E6FA;color:#3B2F8F">The sky tonight</span><h2 id="shTitle" style="margin-top:8px">${m.name}</h2>
    <div class="moonrow">${moonSVG(m,south)}<div><p><b>${pct}% lit.</b> ${why}</p><p class="sub" style="margin:0">Next full moon in about ${m.toFull} day${m.toFull===1?"":"s"}.</p></div></div>
    <div class="box think"><h4>Did you know?</h4><p>The moon makes no light of its own. It shines because sunlight bounces off it. ${south?"In Australia the moon looks upside down compared with how children in Europe see it.":"In Australia the same moon looks upside down, because people there stand the other way up on the globe."}</p></div>
    <p class="sub" style="margin-top:12px">Worked out for ${niceDate(TODAY())}. Look up after dark and check if it matches.</p>`); found("moon"); }

/* 5. Time traveller: try to go back before the first card, three times */
let backTries=[];
const _go=go;
go=function(n){ if(n<0&&idx===0&&!document.getElementById("sheetOv").classList.contains("open")){ const t=Date.now(); if(!backTries.length||t-backTries[backTries.length-1]>260){ backTries=backTries.filter(x=>t-x<6000); backTries.push(t); const c=document.querySelector("#deck .slide.live .card"); if(c){ c.classList.remove("nudge"); void c.offsetWidth; c.classList.add("nudge"); } if(backTries.length>=3){ backTries=[]; openBackThen(); } } return; } _go(n); };
function openBackThen(){ const d=dOf(TODAY()), key=String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); const b=(typeof BACKTHEN!=="undefined"&&BACKTHEN[key])||null; if(!b){ coachNow("Nothing before the first card today."); return; }
  openSheet(`<span class="ttype" style="background:#F3E7DA;color:#6B3F1D">You went back in time</span><h2 id="shTitle" style="margin-top:8px">${d.getDate()} ${d.toLocaleDateString("en-GB",{month:"long"})} ${b.y}</h2><p style="font-family:var(--display);font-weight:700;font-size:1.15em;margin:0 0 8px">${b.t}</p><p>${settings.age==="x"?b.x:b.o}</p>
    <div class="box think"><h4>Why it still matters</h4><p>${b.why}</p></div><p class="sub" style="margin-top:12px">${TODAY().slice(0,4)-b.y} years ago today. The news you read this morning will be history one day too.</p>`); found("time"); }

/* 6. Be the reporter: tap the moon on the last card three times */
let moonTaps=[];
document.addEventListener("click",e=>{ if(!e.target.closest(".endcard .moon")) return; const n=Date.now(); moonTaps=moonTaps.filter(t=>n-t<2400); moonTaps.push(n); const el=e.target.closest(".moon"); el.classList.remove("wig"); void el.offsetWidth; el.classList.add("wig"); if(moonTaps.length>=3){ moonTaps=[]; openReporter(); } });
function openReporter(){ const list=store.get("ffmpa-headlines",[]); const mine=list.find(h=>h.d===TODAY());
  openSheet(`<h2 id="shTitle">Be the <em class="v">reporter</em></h2><p class="sub">Every story you read today started with a headline. Now write one about your own day.</p>
    <div class="box think"><h4>A good headline answers three things</h4><p><b>Who?</b> <b>Did what?</b> <b>Where?</b> Keep it short and true. Example: “Class 5 plants twelve trees behind the school”.</p></div>
    <label class="field" for="rpT" style="margin-top:14px">Your headline for ${shortDate(TODAY())}<input type="text" id="rpT" maxlength="90" autocomplete="off" value="${esc(mine?mine.t:"")}" placeholder="Who did what, and where?"></label>
    <div class="row"><button class="btn sun press" id="rpS">Save my headline</button></div><p class="msg" id="rpM" aria-live="polite"></p>
    ${list.length?`<h4 class="h4">Your front page</h4><div class="list">${list.slice().reverse().map(h=>`<div class="item"><p class="sub" style="margin:0">${shortDate(h.d)}</p><b>${esc(h.t)}</b></div>`).join("")}</div>`:""}
    <p class="sub" style="margin-top:12px">Your headlines stay on this device. Nobody else can see them.</p>`,
    ()=>{ $("#rpS").onclick=()=>{ const t=$("#rpT").value.trim().replace(/\s+/g," "); if(t.length<4){ $("#rpM").textContent="Write a few words first: who did what?"; return; } const l=store.get("ffmpa-headlines",[]).filter(h=>h.d!==TODAY()); l.push({d:TODAY(),t}); store.set("ffmpa-headlines",l.slice(-30)); openReporter(); setTimeout(()=>{ const m=$("#rpM"); if(m) m.textContent="Saved. That is today's front page."; },50); }; }); found("report"); }

/* hooks: hold on the top buttons, comfort entry in the menu, parent note, first paint */
onHold(document.getElementById("ctyPill"),()=>openHello());
onHold(document.getElementById("edPill"),()=>openMoon());
document.addEventListener("click",e=>{ if(e.target.closest("#mC")){ openComfort(); } if(e.target.closest("#hF")||e.target.closest("[data-finds]")){ e.stopPropagation(); openFinds(); } });
const _openSheet=openSheet;
openSheet=function(html,cb){ if(html.indexOf('>Parent settings<')>0) html=html.replace('<div class="set">', worryNoteHTML()+'<div class="set">'); _openSheet(html,cb); parkToast(); const sh=document.getElementById("sheet"); if(sh){ sh.scrollTop=0; requestAnimationFrame(()=>{ sh.scrollTop=0; }); } };
applyComfort();
setTimeout(()=>{ try{ resumeReading(); }catch(e){} },900);

/* ===================== Pass 4: newsroom levels and a visual Today card ===================== */
const RANKS=[["Cub Reporter",0,"#0F8A5F"],["Reporter",25,"#2D5BC0"],["Correspondent",75,"#7A3FD1"],["Editor",175,"#C2367A"],["Chief Editor",350,"#D9481E"],["Editor in Chief",600,"#B5600F"]];
if(STATS.readTotal==null){ STATS.readTotal=Object.keys(STATS.days).length*4; }
const _recordRead=recordRead;
recordRead=function(s){ STATS.readTotal=(STATS.readTotal||0)+1; _recordRead(s); };
function points(){ const sum=o=>Object.values(o||{}).reduce((a,w)=>a+Object.keys(w).length,0);
  return (STATS.readTotal||0) + 2*Object.keys(STATS.learned||{}).length + 2*(STATS.qRight||0) + 3*Object.keys(STATS.editions||{}).length + 5*sum(STATS.puzzles) + 5*Object.keys(STATS.crafts||{}).length + 2*findCount() + words.size; }
function rankInfo(){ const p=points(); let i=0; RANKS.forEach((r,k)=>{ if(p>=r[1]) i=k; }); const nx=RANKS[i+1]; return {p,i,name:RANKS[i][0],c:RANKS[i][2],next:nx?nx[0]:null,need:nx?nx[1]-p:0,pct:nx?Math.round((p-RANKS[i][1])/(nx[1]-RANKS[i][1])*100):100}; }
const _checkAch=checkAch;
checkAch=function(){ _checkAch(); const r=rankInfo(); if(STATS.rank==null){ STATS.rank=r.i; saveStats(); } else if(r.i>STATS.rank){ STATS.rank=r.i; saveStats(); toast(`${ico("trophy")}<span><b>Level ${r.i+1} · ${r.name}</b> · you moved up</span>`, r.c); } refreshLevel(); };
function weekDots(){ const si=streakInfo(), wk=mondayOf(TODAY()); return [0,1,2,3,4,5,6].map(i=>{ const d=addDays(wk,i), lab=dOf(d).toLocaleDateString("en-GB",{weekday:"narrow"}); const st=STATS.days[d]?"on":d===si.restDay?"rest":d>TODAY()?"future":d===TODAY()?"today":"off"; return `<span class="wd ${st}"><i></i>${lab}</span>`; }).join(""); }
function levelStripHTML(){ const r=rankInfo(), si=streakInfo();
  return `<button class="lvl press" data-open="progress" style="--lc:${r.c}" aria-label="Level ${r.i+1}, ${r.name}. ${si.n} day streak. Open progress">
    <span class="lvn"><small>Level</small><b>${r.i+1}</b></span>
    <span class="lvb"><b>${r.name}</b><span class="lbar"><i style="width:${Math.max(4,r.pct)}%"></i></span><small>${r.next?`${r.need} more to ${r.next}`:"Top level reached"}</small></span>
    <span class="lvs"><b>${si.n}</b><small>day streak</small></span></button>`; }
function refreshLevel(){ document.querySelectorAll("#deck .lvl").forEach(el=>{ const t=document.createElement("div"); t.innerHTML=levelStripHTML(); const n=t.firstElementChild; n.onclick=e=>{ e.stopPropagation(); openProgress(); }; el.replaceWith(n); }); }
function levelBlockHTML(){ const r=rankInfo();
  return `<div class="lvcard" style="--lc:${r.c}"><div class="lvtop"><span class="lvn"><small>Level</small><b>${r.i+1}</b></span><div><b>${r.name}</b><small>${r.p} points${r.next?` · ${r.need} more to become ${r.next}`:" · top level"}</small></div></div>
    <div class="ladder">${RANKS.map((x,k)=>`<span class="${k<r.i?"done":k===r.i?"now":""}"><i></i>${x[0]}</span>`).join("")}</div>
    <p class="sub" style="margin:10px 0 0;font-size:12.5px">Every story is 1 point. A learned idea, a right quiz answer or a hidden find is 2. A finished edition is 3. A puzzle or craft is 5.</p></div>`; }

/* visual Today card: sideways swipe cards */
const MOM_COL=[["#5B35E8","#EFEAFF","#DCD2FF"],["#0E7490","#E3F5F8","#C4E9F0"],["#C2367A","#FDEAF3","#F9CFE2"],["#B5600F","#FFF1DC","#FBDDB0"],["#2D5BC0","#E8EFFD","#CBDAFA"],["#0F8A5F","#E4F6EE","#C3EBD8"]];
const initials=n=>n.split(/\s+/).filter(Boolean).map(w=>w[0]).filter((c,i,a)=>i===0||i===a.length-1).join("").toUpperCase();
todayHTML=function(){
  const t=todayItems()||{days:[],born:[]}; const m=[];
  t.days.forEach(x=>m.push({k:"Day to know",big:ico("sparkle"),bigc:"ic",t:x.name,b:x.what}));
  t.born.forEach(x=>m.push({k:"Born on this day",big:initials(x.name),bigc:"mono",yr:x.year,t:x.name,b:x.what,sub:`${TODAY().slice(0,4)-x.year} years ago`}));
  if(t.week) m.push({k:"Coming up",big:ico("clock"),bigc:"ic",t:"Later this week",b:t.week});
  const L=learnToday(); if(L&&topic==="all"){ const lt=L[settings.age==="x"?"x":"o"]; m.push({k:"Learn one thing",big:"?",bigc:"mono",t:lt.t||L.t||"Today's big question",b:"Find the answer a few cards in. It takes one minute."}); }
  m.push({k:"This week",big:ico("puzzle"),bigc:"ic",t:"Puzzle and craft",b:"A mini sudoku, news words and something to make on Sunday.",extra:`<div class="mrow"><button class="btn ghost press" data-open="puzzles">${ico("puzzle")}Puzzle</button><button class="btn ghost press" data-open="craft">${ico("lamp")}Craft</button></div>`});
  return `<article class="card today v2" style="--acc:#5B35E8;--tint:#F3F0FF" aria-label="Today">
    <div class="acc" aria-hidden="true"></div>
    <div class="cbody"><p class="kicker">${niceDate(TODAY())}</p><h2>What's special <em class="v">today</em></h2>
      ${levelStripHTML()}
      <div class="moms" tabindex="0" aria-label="Today's cards. Swipe sideways.">${m.map((x,i)=>{ const c=MOM_COL[i%MOM_COL.length]; return `<section class="mom" style="--mc:${c[0]};--mb:${c[1]};--mb2:${c[2]}"><span class="mbig ${x.bigc}" aria-hidden="true">${x.big}</span>${x.yr?`<span class="myr" aria-hidden="true">${x.yr}</span>`:""}<div class="mtxt"><span class="mk">${x.k}${x.sub?` · ${x.sub}`:""}</span><h3>${esc(x.t)}</h3><p>${esc(x.b)}</p>${x.extra||""}</div></section>`; }).join("")}</div>
      <div class="mdots" aria-hidden="true">${m.map((x,i)=>`<i class="${i?"":"on"}" data-md="${i}"></i>`).join("")}<span>Swipe sideways</span></div>
    </div>
    <button class="srcbar" data-next><span>Swipe up for today's stories</span><span class="go">Start${ico("down")}</span></button>
  </article>`;
};
function wireToday(root){ root.querySelectorAll(".card.today.v2").forEach(card=>{ const sc=card.querySelector(".moms"), dots=[...card.querySelectorAll(".mdots i")]; if(!sc||sc.dataset.w) return; sc.dataset.w=1;
  const cur=()=>{ const w=sc.firstElementChild?sc.firstElementChild.offsetWidth+10:1; return Math.max(0,Math.min(dots.length-1,Math.round(sc.scrollLeft/w))); };
  sc.addEventListener("scroll",()=>{ const k=cur(); dots.forEach((d,i)=>d.classList.toggle("on",i===k)); if(k>0){ const h=card.querySelector(".mdots span"); if(h) h.style.opacity=0; } },{passive:true});
  const to=k=>{ const el=sc.children[k]; if(el) sc.scrollTo({left:el.offsetLeft-sc.offsetLeft,behavior:"smooth"}); };
  dots.forEach((d,i)=> d.onclick=e=>{ e.stopPropagation(); to(i); });
  sc.addEventListener("keydown",e=>{ if(e.key==="ArrowRight"){ e.stopPropagation(); to(cur()+1); } if(e.key==="ArrowLeft"){ e.stopPropagation(); to(cur()-1); } });
  sc.addEventListener("wheel",e=>{ if(Math.abs(e.deltaX)>Math.abs(e.deltaY)) e.stopPropagation(); },{passive:true});
  card.querySelectorAll(".lvl").forEach(b=> b.onclick=e=>{ e.stopPropagation(); openProgress(); });
}); }
const _renderDeck2=renderDeck;
renderDeck=function(){ _renderDeck2(); wireToday($("#deck")); };

/* ===================== Sketch explainers ===================== */
const PENCIL='<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z"/><path d="M14.5 6.5l3 3"/></svg>';
function sketchKey(id){ return (typeof SKETCH_FOR!=="undefined"&&SKETCH_FOR[id]&&SKETCHES[SKETCH_FOR[id]])?SKETCH_FOR[id]:null; }
function skRand(seed){ let s=seed>>>0; return ()=>{ s=(s*1664525+1013904223)>>>0; return s/4294967296-.5; }; }
function skShape(e,rnd){ const j=k=>(rnd()*k), f=n=>n.toFixed(1);
  const line=(x1,y1,x2,y2)=>{ const len=Math.hypot(x2-x1,y2-y1), w=Math.min(5,len*.035+.8); return `M${f(x1+j(1.4))} ${f(y1+j(1.4))} Q${f((x1+x2)/2+j(w*2))} ${f((y1+y2)/2+j(w*2))} ${f(x2+j(1.4))} ${f(y2+j(1.4))}`; };
  if(e.l) return [line(...e.l)];
  if(e.r){ const [x,y,w,h]=e.r; return [line(x-1.5,y,x+w+1.5,y)+" "+line(x+w,y-1.5,x+w,y+h+1.5)+" "+line(x+w+1.5,y+h,x-1.5,y+h)+" "+line(x,y+h+1.5,x,y-1.5)]; }
  if(e.c){ const [cx,cy,r]=e.c; return [`M${f(cx-r)} ${f(cy+j(2))} a${f(r)} ${f(r+j(1.5))} 0 1 1 ${f(2*r)} ${f(j(1.5))} a${f(r+j(1.5))} ${f(r)} 0 1 1 ${f(-2*r+1.5)} ${f(2+j(1))}`]; }
  if(e.p) return [e.p];
  if(e.a){ const [x1,y1,x2,y2]=e.a, an=Math.atan2(y2-y1,x2-x1), h=7; return [line(x1,y1,x2,y2), `M${f(x2-h*Math.cos(an-.5))} ${f(y2-h*Math.sin(an-.5))} L${f(x2)} ${f(y2)} L${f(x2-h*Math.cos(an+.5))} ${f(y2-h*Math.sin(an+.5))}`]; }
  return []; }
function sketchSVG(key, upto, animate){ const S=SKETCHES[key]; let out="", n=0;
  S.steps.forEach((st,si)=>{ if(si>upto) return; const live=si===upto&&animate, rnd=skRand(key.length*977+si*131+7);
    st.d.forEach(e=>{ const col=e.acc?S.c:"#1F1E2A";
      if(e.t){ out+=`<text x="${e.t[0]}" y="${e.t[1]}" fill="${col}" class="${live?"sktx":""}" style="${live?`animation-delay:${(n*.16+.2).toFixed(2)}s`:""}">${esc(e.t[2])}</text>`; if(live) n++; return; }
      skShape(e,rnd).forEach(d=>{ out+=`<path d="${d}" pathLength="1" stroke="${col}" class="${live?"skink":""}" style="${live?`animation-delay:${(n*.16).toFixed(2)}s`:""}${si<upto?";opacity:.55":""}"/>`; if(live) n++; }); }); });
  return `<svg viewBox="0 0 320 220" class="skboard" role="img" aria-label="${esc(S.t)}, step ${upto+1}"><defs><filter id="skw" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6"/></filter></defs><g filter="url(#skw)" fill="none" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">${out.replace(/<text/g,'<text stroke="none"')}</g></svg>`; }
function openSketch(key, step){ const S=SKETCHES[key]; if(!S) return; const i=step||0, st=S.steps[i], last=i===S.steps.length-1; const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  openSheet(`<span class="ttype" style="background:#F1F1F4;color:#3A3942">${PENCIL} Sketch it · step ${i+1} of ${S.steps.length}</span><h2 id="shTitle" style="margin-top:8px">${esc(S.t)}</h2>
    <button class="skpaper press" id="skRe" style="--sc:${S.c}" aria-label="Draw this step again">${sketchSVG(key,i,!reduce)}</button>
    <p class="skcap">${esc(settings.age==="x"?st.x:st.o)}</p>
    <div class="skdots" aria-hidden="true">${S.steps.map((x,k)=>`<i class="${k===i?"on":k<i?"done":""}"></i>`).join("")}</div>
    <div class="row"><button class="btn ghost press" id="skB" ${i?"":"disabled"}>Back</button><button class="btn sun press" id="skN" style="flex:1">${last?"Got it":"Next step"}</button></div>`,
    ()=>{ $("#skRe").onclick=()=>openSketch(key,i); $("#skB").onclick=()=>openSketch(key,i-1);
      $("#skN").onclick=()=>{ if(!last){ openSketch(key,i+1); return; } STATS.sketches=STATS.sketches||{}; const first=!STATS.sketches[key]; STATS.sketches[key]=1; saveStats(); closeSheet(); if(first) toast(`${PENCIL}<span><b>Sketch finished</b> · ${esc(S.t)}</span>`,S.c); checkAch(); document.querySelectorAll(`[data-sk="${key}"]`).forEach(b=>b.classList.add("seen")); };
      const f=$("#skN"); if(f) f.focus(); });
}
ACH.push({id:"sketch", t:"Visual thinker", d:"Sketch explainers finished", ic:"bulb", c:"#0B7F75", tiers:[3,10,30], m:()=>Object.keys(STATS.sketches||{}).length});
const _points=points; points=function(){ return _points()+2*Object.keys(STATS.sketches||{}).length; };
function sketchBtnHTML(key){ const S=SKETCHES[key], seen=STATS.sketches&&STATS.sketches[key]; return `<button class="skbtn press ${seen?"seen":""}" data-sk="${key}" style="--sc:${S.c}"><span class="skic">${PENCIL}</span><span><b>See it as a sketch</b><small>${esc(S.t)} · ${S.steps.length} steps</small></span>${ico("right")}</button>`; }
function wireSketch(root){ root.querySelectorAll("[data-sk]").forEach(b=> b.onclick=e=>{ e.stopPropagation(); openSketch(b.dataset.sk,0); }); }
const _renderDeck3=renderDeck;
renderDeck=function(){ _renderDeck3(); const d=$("#deck");
  d.querySelectorAll(".slide").forEach(sl=>{ const it=deck[+sl.dataset.i]; if(!it) return; const key=it.type==="story"?sketchKey(it.s.id):it.type==="learn"?sketchKey("learn:"+TODAY()):null; if(!key) return;
    const h=sl.querySelector(".cbody h2"); if(h&&!sl.querySelector(".skchip")) h.insertAdjacentHTML("afterend",`<button class="skchip press" data-sk="${key}">${PENCIL}Sketch it · ${SKETCHES[key].steps.length} steps</button>`);
    const b=sl.querySelector(".cbody"); if(b&&!b.querySelector(".skbtn")){ const anchor=b.querySelector(".kbox")||b.querySelector(".feel"); if(anchor) anchor.insertAdjacentHTML("beforebegin",sketchBtnHTML(key)); else b.insertAdjacentHTML("beforeend",sketchBtnHTML(key)); } });
  wireSketch(d); setTimeout(markMore,80); };
const _findsAdmin=findsAdminHTML;
findsAdminHTML=function(){ return `<div class="panel"><h2>Sketch explainers</h2><p class="note">Hand-drawn, step by step explainers attached to stories that need a concept made clear. Editors pick which stories get one; a sketch can be reused whenever the concept returns.</p><div class="tablewrap"><table class="adm-table"><thead><tr><th>Sketch</th><th>Steps</th><th>Attached to</th></tr></thead><tbody>${Object.entries(SKETCHES).map(([k,S])=>`<tr><td>${esc(S.t)}</td><td>${S.steps.length}</td><td>${Object.entries(SKETCH_FOR).filter(([,v])=>v===k).map(([id])=>id).join(", ")}</td></tr>`).join("")}</tbody></table></div></div>`+_findsAdmin(); };
