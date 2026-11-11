/* ================= Extras: card colours, today card, progress, puzzles, Sunday craft ================= */
/* Soft card colours: change with every swipe, differ by time of day, and the order shifts each weekday */
const PAL_AM=["#FFFFFF","#F6F9FF","#F5FBF8","#F9F7FF","#F4FAFB","#FFF8FA","#F7F8FF","#F8FBF4"];
const PAL_PM=["#F6F4FF","#F1F4FB","#FBF4F8","#F2F7F4","#F4F5FA","#F0F6FA","#F8F4FB","#F4F3F9"];
function palette(){ const pm = new Date().getHours() >= 16; return pm?PAL_PM:PAL_AM; }
function tintCards(root){ const p=palette(), shift=new Date().getDay()*3; root.querySelectorAll(".slide").forEach(sl=>{ const c=sl.querySelector(".card"); if(c) c.style.setProperty("--bg", p[(+sl.dataset.i+shift)%p.length]); }); }

/* ---------- dates ---------- */
const DAY=86400000;
const isoOf=d=>{ const z=new Date(d); return z.getFullYear()+"-"+String(z.getMonth()+1).padStart(2,"0")+"-"+String(z.getDate()).padStart(2,"0"); };
const dOf=s=>{ const [y,m,dd]=s.split("-").map(Number); return new Date(y,m-1,dd); };
const addDays=(s,n)=>isoOf(dOf(s).getTime()+n*DAY);
const mondayOf=s=>{ const d=dOf(s); const wd=(d.getDay()+6)%7; return isoOf(d.getTime()-wd*DAY); };
const TODAY=()=>EDITION_DATE;
const niceDate=s=>dOf(s).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
const shortDate=s=>dOf(s).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"});

/* ---------- stats ---------- */
let STATS = store.get("ffmpa-stats", null);
if(!STATS){
  STATS={days:{},editions:{},explainers:0,more:0,perfect:0,qAns:0,qRight:0,cats:{},puzzles:{},crafts:{},unlocked:{},sample:true};
  /* prototype only: a few days of sample history so the streak and badges have something to show */
  ["2026-11-06","2026-11-07","2026-11-08","2026-11-10"].forEach(d=>STATS.days[d]=true);
  STATS.explainers=12; STATS.more=4; STATS.perfect=1; STATS.qAns=9; STATS.qRight=7;
  STATS.unlocked={"streak-0":1,"sharp-0":1};
}
function saveStats(){ store.set("ffmpa-stats",STATS); }
function recordRead(s){
  const wk=mondayOf(TODAY()); STATS.cats[wk]=STATS.cats[wk]||[]; if(!STATS.cats[wk].includes(s.cat)) STATS.cats[wk].push(s.cat);
  if(readIds.size>=3) STATS.days[TODAY()]=true;
  saveStats(); checkAch();
}
function recordEnd(){ if(!STATS.editions[TODAY()]){ STATS.editions[TODAY()]=1; saveStats(); checkAch(); } }
function statQ(ok){ STATS.qAns++; if(ok) STATS.qRight++; saveStats(); }
function streakInfo(){
  let d = STATS.days[TODAY()] ? TODAY() : addDays(TODAY(),-1), n=0; const rest={};
  for(let k=0;k<400;k++){
    if(STATS.days[d]){ n++; }
    else { const wk=mondayOf(d); if(rest[wk] || n===0 && d!==addDays(TODAY(),-1)) break; rest[wk]=d; }
    d=addDays(d,-1);
  }
  const wk=mondayOf(TODAY()), restThisWeek=Object.values(rest).find(x=>mondayOf(x)===wk);
  return {n, restUsed:!!restThisWeek, restDay:restThisWeek};
}
const ACH=[
  {id:"streak", t:"Reading streak", d:"Days in a row with 3 or more stories", ic:"sun", c:"#D9481E", tiers:[3,7,30], m:()=>streakInfo().n},
  {id:"edition", t:"Full edition", d:"Editions read all the way to the end", ic:"book", c:"#2D5BC0", tiers:[1,5,20], m:()=>Object.keys(STATS.editions).length},
  {id:"words", t:"Word collector", d:"Words saved to My words", ic:"star", c:"#B5600F", tiers:[10,25,50], m:()=>words.size},
  {id:"curious", t:"Curious mind", d:"Word explainers opened", ic:"bulb", c:"#7A3FD1", tiers:[20,50,100], m:()=>STATS.explainers},
  {id:"deep", t:"Deep reader", d:"Times you opened More to see why a story matters", ic:"doc", c:"#0E7490", tiers:[5,15,40], m:()=>STATS.more},
  {id:"sharp", t:"Sharp mind", d:"Perfect quiz scores", ic:"trophy", c:"#C2367A", tiers:[1,5,15], m:()=>STATS.perfect},
  {id:"rounded", t:"All-rounder", d:"Different topics read this week", ic:"globe", c:"#0F8A5F", tiers:[4,6,8], m:()=>(STATS.cats[mondayOf(TODAY())]||[]).length},
  {id:"puzzles", t:"Puzzle solver", d:"Weekly puzzles solved", ic:"puzzle", c:"#3E46C8", tiers:[1,4,12], m:()=>Object.values(STATS.puzzles).reduce((a,w)=>a+Object.keys(w).length,0)},
  {id:"maker", t:"Maker", d:"Sunday crafts made", ic:"lamp", c:"#4D7C0F", tiers:[1,4,12], m:()=>Object.keys(STATS.crafts).length}
];
const LEVELS=["Level 1","Level 2","Level 3"];
function achLevel(a){ const v=a.m(); let l=0; a.tiers.forEach(t=>{ if(v>=t) l++; }); return {v,l,next:a.tiers[l]}; }
function checkAch(){
  ACH.forEach(a=>{ const {l}=achLevel(a); for(let i=0;i<l;i++){ const k=a.id+"-"+i; if(!STATS.unlocked[k]){ STATS.unlocked[k]=1; saveStats(); toast(`${ico(a.ic)}<span><b>${a.t}</b> · ${LEVELS[i]} unlocked</span>`, a.c); } } });
}
let toastQ=[], toastOn=false;
function toast(html,c){ if(settings.rewards===false||settings.age==="n") return; toastQ.push([html,c]); if(!toastOn) nextToast(); }
function nextToast(){ const t=toastQ.shift(); if(!t){ toastOn=false; return; } toastOn=true; const el=document.createElement("div"); el.className="toast"; el.style.setProperty("--tc2",t[1]||"#5B35E8"); el.setAttribute("role","status"); el.innerHTML=t[0]; document.querySelector(".app").appendChild(el); setTimeout(()=>{ el.classList.add("out"); setTimeout(()=>{ el.remove(); nextToast(); },350); },2600); }

/* ---------- progress sheet ---------- */
function openProgress(){
  const si=streakInfo(), wk=mondayOf(TODAY());
  const days=[0,1,2,3,4,5,6].map(i=>{ const d=addDays(wk,i), lab=dOf(d).toLocaleDateString("en-GB",{weekday:"narrow"}); const st=STATS.days[d]?"on":d===si.restDay?"rest":d>TODAY()?"future":d===TODAY()?"today":"off"; return `<span class="wd ${st}"><i></i>${lab}</span>`; }).join("");
  const acc=STATS.qAns?Math.round(STATS.qRight/STATS.qAns*100):0;
  const achHTML=ACH.map(a=>{ const {v,l,next}=achLevel(a); const prev=l?a.tiers[l-1]:0; const pct=next?Math.min(100,Math.round((v-prev)/(next-prev)*100)):100;
    return `<div class="ach ${l?"got":""}" style="--ac:${a.c}"><span class="aic">${ico(a.ic)}</span><div class="abody"><b>${a.t}</b><small>${a.d}</small><div class="abar"><i style="width:${pct}%"></i></div><small class="anext">${next?`${Math.min(v,next)} of ${next} for ${LEVELS[l]}`:"All levels done"}</small></div><span class="alv">${[0,1,2].map(i=>`<i class="${i<l?"on":""}"></i>`).join("")}</span></div>`; }).join("");
  openSheet(`<h2 id="shTitle">Your <em class="v">progress</em></h2>
    ${levelBlockHTML()}
    <div class="streak"><div class="sn"><b>${si.n}</b><span>day streak</span></div><div class="week">${days}</div></div>
    <p class="sub" style="margin:8px 0 0">Read 3 stories a day to keep it going. One rest day a week won't break it${si.restUsed?" (used this week)":""}.</p>
    <div class="pstats"><div><b>${readIds.size}</b><span>stories today</span></div><div><b>${words.size}</b><span>words saved</span></div><div><b>${acc}%</b><span>quiz answers right</span></div></div>
    <h3 class="ph">Achievements</h3><div class="achs">${achHTML}</div>
    ${STATS.sample?`<p class="sub" style="font-size:12px;margin-top:12px">Prototype: includes a few days of sample history.</p>`:""}`);
}

/* ---------- today card ---------- */
function todayItems(){
  const t=ONTHISDAY[TODAY()]; if(!t) return null; const c=settings.country, fit=x=>!x.where||x.where.includes(c);
  return {born:t.born.filter(fit), days:t.days.filter(fit), week:t.week};
}
function todayHTML(){
  const t=todayItems();
  return `<article class="card today" style="--acc:#5B35E8;--tint:#F3F0FF" aria-label="Today">
    <div class="acc" aria-hidden="true"></div>
    <div class="cbody"><p class="kicker">Today · ${niceDate(TODAY())}</p><h2>What's special about today</h2>
      ${t.days.length?`<h3 class="th">${ico("sparkle")}Days to know</h3>${t.days.map(x=>`<div class="titem"><b>${esc(x.name)}</b><p>${esc(x.what)}</p></div>`).join("")}`:""}
      ${t.born.length?`<h3 class="th">${ico("star")}Born on this day</h3>${t.born.map(x=>`<div class="titem"><b>${esc(x.name)} <span>${x.year}</span></b><p>${esc(x.what)}</p></div>`).join("")}`:""}
      ${t.week?`<p class="tweek">${esc(t.week)}</p>`:""}
      <div class="row" style="margin-top:14px"><button class="btn ghost press" data-open="puzzles">${ico("puzzle")}This week's puzzle</button><button class="btn ghost press" data-open="craft">${ico("lamp")}Sunday craft</button></div>
    </div>
    <button class="srcbar" data-next><span>Swipe up for today's stories</span><span class="go">Start${ico("down")}</span></button>
  </article>`;
}
function craftIndex(sun){ return Math.round((dOf(sun)-dOf(CRAFT_START))/DAY/7); }
function nextSunday(s){ const d=dOf(s); return addDays(s,(7-d.getDay())%7); }
function craftCardHTML(){
  const sun=TODAY(), cr=CRAFTS[craftIndex(sun)]; if(!cr) return "";
  return `<article class="card" style="--acc:#4D7C0F;--tint:#F1F7E6"><div class="acc" aria-hidden="true"></div><div class="cbody"><p class="kicker">Sunday craft</p><h2>${esc(cr.t)}</h2><p>${esc(cr.th)}. You will need: ${cr.m.map(esc).join(", ")}.</p><div class="row"><button class="btn sun press" data-open="craft">See the steps</button></div></div></article>`;
}

/* ---------- puzzles ---------- */
let PZ=null;
function pzWeek(){ return mondayOf(TODAY()); }
function pzInit(){
  const set=PUZZLES[pzWeek()]; if(!set) return null;
  const lv=settings.age==="x"?"x":(settings.age==="n"&&set.sudoku.n?"n":"o");
  if(!PZ || PZ.lv!==lv || PZ.week!==pzWeek()){
    const sd=set.sudoku[lv];
    PZ={lv, week:pzWeek(), tab:"sudoku", sd, grid:sd.p.map(r=>r.slice()), sel:null, err:[], solvedS:false, list:set.words[lv]||set.words.o, wi:0, picked:[], bad:false, solvedW:false};
    const done=STATS.puzzles[pzWeek()]||{}; if(done.sudoku){ PZ.solvedS=true; PZ.grid=sd.s.map(r=>r.slice()); } if(done.words){ PZ.solvedW=true; PZ.wi=PZ.list.length; }
  }
  return PZ;
}
function scramble(w){ const a=w.split(""); let seed=[...w].reduce((s,ch)=>s*31+ch.charCodeAt(0),7)>>>0; const rnd=()=>{ seed=(seed*1103515245+12345)>>>0; return seed/4294967296; }; for(let k=0;k<20;k++){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } if(a.join("")!==w) break; } return a; }
function openPuzzles(tab){
  const P=pzInit(); if(!P){ openSheet(`<h2 id="shTitle">Weekly puzzles</h2><p class="sub">New puzzles arrive every Monday.</p>`); return; }
  if(tab) P.tab=tab;
  renderPuzzles();
}
function puzzleSolved(kind){ const w=pzWeek(); STATS.puzzles[w]=STATS.puzzles[w]||{}; if(!STATS.puzzles[w][kind]){ STATS.puzzles[w][kind]=1; saveStats(); checkAch(); } }
function renderPuzzles(){
  const P=PZ, tabs=`<div class="pztabs"><button data-tab="sudoku" class="${P.tab==="sudoku"?"on":""}">Mini sudoku${P.solvedS?" ✓":""}</button><button data-tab="words" class="${P.tab==="words"?"on":""}">News words${P.solvedW?" ✓":""}</button></div>`;
  let body="";
  if(P.tab==="sudoku"){
    const {n,br,bc,p,s}=P.sd;
    const cells=[]; for(let r=0;r<n;r++) for(let c=0;c<n;c++){ const g=p[r][c]!==0, v=P.grid[r][c], sel=P.sel&&P.sel[0]===r&&P.sel[1]===c, same=P.sel&&v&&v===P.grid[P.sel[0]][P.sel[1]], err=P.err.some(e=>e[0]===r&&e[1]===c);
      const bt=r%br===0?2:1, bl=c%bc===0?2:1, bb=r===n-1?2:0, brr=c===n-1?2:0;
      cells.push(`<button type="button" class="cell ${g?"given":""} ${sel?"sel":""} ${same&&!sel?"same":""} ${err?"err":""}" data-r="${r}" data-c="${c}" style="border-top-width:${bt}px;border-left-width:${bl}px;border-bottom-width:${bb}px;border-right-width:${brr}px" aria-label="Row ${r+1}, column ${c+1}${v?", "+v:", empty"}">${v||""}</button>`); }
    body=`<p class="sub" style="margin:4px 0 10px">Fill the grid so every row, column and box has the numbers 1 to ${n} once.</p>
      <div class="sgrid" style="grid-template-columns:repeat(${n},1fr)">${cells.join("")}</div>
      ${P.solvedS?`<div class="pzdone">${ico("trophy")}<b>Solved!</b> Nice thinking. A new puzzle arrives on Monday.</div>`:`<div class="pad">${Array.from({length:n},(_,i)=>`<button type="button" data-v="${i+1}">${i+1}</button>`).join("")}<button type="button" data-v="0" aria-label="Erase">${ico("x")}</button></div><div class="row" style="margin-top:10px"><button class="btn ghost press" id="sdCheck">Check</button><span class="msg" id="sdMsg" aria-live="polite"></span></div>`}`;
  } else {
    if(P.solvedW){ body=`<div class="pzdone">${ico("trophy")}<b>All ${P.list.length} words solved!</b> They all came from this week's stories.</div>`; }
    else {
      const [w,hint]=P.list[P.wi], letters=scramble(w);
      const ans=P.picked.map(i=>letters[i]);
      body=`<p class="sub" style="margin:4px 0 10px">Unscramble words from this week's news. Word ${P.wi+1} of ${P.list.length}.</p>
        <div class="hint">${ico("bulb")}${esc(hint)}</div>
        <div class="slots ${P.bad?"bad":""}">${letters.map((_,i)=>`<button type="button" class="slot" data-u="${i}">${ans[i]||""}</button>`).join("")}</div>
        <div class="tiles">${letters.map((ch,i)=>`<button type="button" class="tile ${P.picked.includes(i)?"used":""}" data-t="${i}" ${P.picked.includes(i)?"disabled":""}>${ch}</button>`).join("")}</div>
        <div class="row" style="margin-top:12px"><button class="btn ghost press" id="wClear">Clear</button><button class="btn ghost press" id="wSkip">Show first letter</button></div>`;
    }
  }
  openSheet(`<h2 id="shTitle">Weekly <em class="v">puzzles</em></h2><p class="sub">Week of ${dOf(pzWeek()).toLocaleDateString("en-GB",{day:"numeric",month:"long"})} · ${LVL[settings.age][0]} level</p>${tabs}${body}`, sh=>{
    sh.querySelectorAll("[data-tab]").forEach(b=> b.onclick=()=>{ P.tab=b.dataset.tab; renderPuzzles(); });
    sh.querySelectorAll(".cell").forEach(b=> b.onclick=()=>{ if(b.classList.contains("given")) { P.sel=[+b.dataset.r,+b.dataset.c]; renderPuzzles(); return; } P.sel=[+b.dataset.r,+b.dataset.c]; P.err=[]; renderPuzzles(); });
    sh.querySelectorAll("[data-v]").forEach(b=> b.onclick=()=>{ if(!P.sel) return; const [r,c]=P.sel; if(P.sd.p[r][c]) return; P.grid[r][c]=+b.dataset.v; P.err=[];
      if(P.grid.every((row,ri)=>row.every((v,ci)=>v===P.sd.s[ri][ci]))){ P.solvedS=true; P.sel=null; puzzleSolved("sudoku"); }
      renderPuzzles(); });
    const ck=sh.querySelector("#sdCheck"); if(ck) ck.onclick=()=>{ P.err=[]; P.grid.forEach((row,r)=>row.forEach((v,c)=>{ if(v&&v!==P.sd.s[r][c]) P.err.push([r,c]); })); const empty=P.grid.flat().filter(v=>!v).length; renderPuzzles(); const m=document.getElementById("sdMsg"); if(m) m.textContent=P.err.length?`${P.err.length} to fix, shown in red.`:empty?`So far so good. ${empty} left.`:""; };
    sh.querySelectorAll(".tile").forEach(b=> b.onclick=()=>{ const [w]=P.list[P.wi]; P.picked.push(+b.dataset.t); P.bad=false;
      if(P.picked.length===w.length){ const letters=scramble(w), guess=P.picked.map(i=>letters[i]).join(""); if(guess===w){ renderPuzzles(); setTimeout(()=>{ P.wi++; P.picked=[]; if(P.wi>=P.list.length){ P.solvedW=true; puzzleSolved("words"); } renderPuzzles(); },550); return; } P.bad=true; renderPuzzles(); setTimeout(()=>{ P.picked=[]; P.bad=false; renderPuzzles(); },650); return; }
      renderPuzzles(); });
    sh.querySelectorAll(".slot").forEach(b=> b.onclick=()=>{ const i=+b.dataset.u; if(i<P.picked.length){ P.picked=P.picked.slice(0,i); renderPuzzles(); } });
    const cl=sh.querySelector("#wClear"); if(cl) cl.onclick=()=>{ P.picked=[]; renderPuzzles(); };
    const sk=sh.querySelector("#wSkip"); if(sk) sk.onclick=()=>{ const [w]=P.list[P.wi], letters=scramble(w); const i=letters.findIndex((ch,k)=>ch===w[0]); P.picked=[i]; renderPuzzles(); };
  });
}

/* ---------- Sunday craft ---------- */
function openCraft(date){
  const sun=date||nextSunday(TODAY()), i=craftIndex(sun), cr=CRAFTS[i];
  if(!cr){ openSheet(`<h2 id="shTitle">Sunday craft</h2><p class="sub">The next craft arrives on Sunday.</p>`); return; }
  const isToday=sun===TODAY(), done=STATS.crafts[sun];
  const upcoming=[1,2,3].map(k=>{ const d=addDays(sun,7*k), c=CRAFTS[craftIndex(d)]; return c?`<div class="item"><b>${esc(c.t)}</b><p>${shortDate(d)} · ${esc(c.th)}</p></div>`:""; }).join("");
  openSheet(`<span class="ttype" style="background:#F1F7E6;color:#4D7C0F">Sunday craft · ${shortDate(sun)}${isToday?"":" · coming up"}</span>
    <h2 id="shTitle" style="margin-top:8px">${esc(cr.t)}</h2><p class="sub">${esc(cr.th)} · craft ${i+1} of ${CRAFTS.length}</p>
    ${cr.g?`<div class="box think" style="margin-top:10px"><b>Ask a grown-up to help.</b> This one uses scissors or other tools.</div>`:""}
    <h3 class="ph">You will need</h3><ul class="mats">${cr.m.map(x=>`<li><label><input type="checkbox"> ${esc(x)}</label></li>`).join("")}</ul>
    <h3 class="ph">Steps</h3><ol class="steps">${cr.s.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>
    <div class="row" style="margin-top:12px"><button class="btn sun press" id="crDone" ${done?"disabled":""}>${done?"Made it!":"I made it!"}</button></div>
    <h3 class="ph">Coming Sundays</h3><div class="list">${upcoming}</div>`, sh=>{
    const b=sh.querySelector("#crDone"); if(b) b.onclick=()=>{ STATS.crafts[sun]=1; saveStats(); checkAch(); b.textContent="Made it!"; b.disabled=true; toast(`${ico("lamp")}<span><b>Nice work!</b> Show a grown-up what you made.</span>`,"#4D7C0F"); };
  });
}

/* ---------- word-by-word body text ---------- */
const typedIds=new Set();
function typeIn(slide, id){
  const body=slide.querySelector(".cbody"); if(!body || body.dataset.typed) return;
  body.dataset.typed="1";
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduce || typedIds.has(id) || settings.typing===false) return;
  typedIds.add(id);
  const step = settings.age==="x" ? 0.075 : 0.055; /* seconds per word: quick enough to follow, slow enough to read along */
  let t=0.35, n=0;
  body.classList.add("typed");
  body.querySelectorAll(":scope > p:not(.kicker)").forEach(p=>{
    p.classList.add("tp");
    [...p.childNodes].forEach(node=>{
      if(node.nodeType===3){
        const frag=document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(part=>{ if(!part) return; if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(part)); return; } const s=document.createElement("span"); s.className="w"; s.style.setProperty("--d",(t+n*step).toFixed(3)+"s"); s.textContent=part; frag.appendChild(s); n++; });
        node.replaceWith(frag);
      } else if(node.nodeType===1){ node.classList.add("w"); node.style.setProperty("--d",(t+n*step).toFixed(3)+"s"); n++; }
    });
    t+=0.12;
  });
  const end=t+n*step;
  const kb=body.querySelector(".kbox"); if(kb){ kb.style.animationDelay=end.toFixed(2)+"s"; }
  /* tap anywhere in the story to show the rest at once */
  body.addEventListener("click", ()=> body.classList.add("all"), {once:true});
}

/* ===== review pass ===== */
function markMore(){ document.querySelectorAll("#deck .slide").forEach(sl=>{ const c=sl.querySelector(".card"), b=sl.querySelector(".cbody"); if(!c||!b) return; const upd=()=>c.classList.toggle("has-more", b.scrollHeight-b.scrollTop-b.clientHeight>24); if(!b.dataset.mc){ b.dataset.mc=1; b.addEventListener("scroll",upd,{passive:true}); } upd(); }); }
function coach(text, key){ if(store.get("ffmpa-coach-"+key,false)) return; store.set("ffmpa-coach-"+key,true); document.querySelectorAll(".coach").forEach(x=>x.remove()); const el=document.createElement("div"); el.className="coach"; el.textContent=text; document.querySelector(".app").appendChild(el); setTimeout(()=>{ el.classList.add("out"); setTimeout(()=>el.remove(),350); },4200); }
function afterMoveExtras(it){
  document.querySelector(".app").classList.toggle("reading", idx>0 && it && it.type!=="end");
  setTimeout(markMore, 60);
  const ef=document.getElementById("edFill"); if(ef){ const tot=deck.filter(d=>d.type==="story").length, pos=deck.slice(0,idx+1).filter(d=>d.type==="story").length; ef.style.width=(it&&it.type==="end"?100:tot?Math.round(pos/tot*100):0)+"%"; ef.parentElement.style.setProperty("--edc", it&&it.type==="story"?(TC[it.s.cat]||"#5B35E8"):"#5B35E8"); }
  if(!session || session.preview) return;
  const nth=deck.slice(0,idx+1).filter(d=>d.type==="story").length;
  if(it && it.type==="story"){ if(nth===1) setTimeout(()=>coach("Tap a highlighted word to learn it","word"),1800); else if(nth===2) setTimeout(()=>coach("Swipe up for the next story","swipe"),2500); }
}
function endSummaryHTML(){ const n=readIds.size, si=streakInfo(); return `<div class="endsum"><div><b>${n}</b><span>stories read</span></div><div><b>${words.size}</b><span>words saved</span></div><div><b>${si.n}</b><span>day streak</span></div></div><button class="findline press" data-finds>Hidden finds: <b>${findCount()} of ${FINDS.length}</b>. Keep your eyes open.</button>`; }
function openPlay(){
  const cr=CRAFTS[craftIndex(nextSunday(TODAY()))];
  openSheet(`<h2 id="shTitle">Play and <em class="v">grow</em></h2><p class="sub">A few minutes of thinking, then you're done.</p>
    <div class="hub">
      <button id="hQ" style="--hc:#C2367A"><span class="ic">${ico("trophy")}</span><b>Today's quiz</b><small>3 questions from today's stories</small></button>
      <button id="hZ" style="--hc:#3E46C8"><span class="ic">${ico("puzzle")}</span><b>Weekly puzzles</b><small>Mini sudoku and news words</small></button>
      <button id="hC" style="--hc:#4D7C0F"><span class="ic">${ico("lamp")}</span><b>Sunday craft</b><small>${esc(cr?cr.t:"Coming soon")}</small></button>
      <button id="hG" style="--hc:#D9481E"><span class="ic">${ico("sun")}</span><b>Your progress</b><small>${streakInfo().n}-day streak and achievements</small></button>
      <button id="hY" style="--hc:#D9481E"><span class="ic">${ico("doc")}</span><b>Young reporters</b><small>${esc((typeof yrNow==="function"&&yrNow()||{t:"Write for FFMPA"}).t)}</small></button>
      <button id="hK" style="--hc:#2D5BC0"><span class="ic">${ico("book")}</span><b>Classroom</b><small>${typeof klass!=="undefined"&&klass?esc(klass.name):"Join a class or set one up"}</small></button>
      <button id="hF" class="wide" style="--hc:#B5600F"><span class="ic">${ico("sparkle")}</span><b>Hidden finds</b><small>${findCount()} of ${FINDS.length} found</small></button>
    </div>`, ()=>{ $("#hQ").onclick=openQuiz; $("#hZ").onclick=()=>openPuzzles(); $("#hC").onclick=()=>openCraft(); $("#hG").onclick=openProgress; });
}
function shareText(title, text){
  if(settings.sharing===false){ openSheet(`<h2 id="shTitle">Sharing is off</h2><p class="sub">A grown-up has turned sharing off for this account.</p>`); return; }
  const url="https://ffmpa.com";
  const guard = settings.age==="x" ? `<p class="box think" style="margin-top:0"><b>Ask a grown-up first.</b> This sends a message to someone outside FFMPA.</p>` : "";
  openSheet(`<h2 id="shTitle">${title}</h2><p class="sub">Only this message is shared. Your name and settings are never included.</p>${guard}
    <div class="linkbox"><span style="flex:1">${esc(text)} ${url}</span></div>
    <div class="row" style="margin-top:12px"><button class="btn sun press" id="stCopy">Copy message</button><button class="btn ghost press" id="stMore">Share to…</button></div><p class="msg" id="stMsg" aria-live="polite"></p>`, ()=>{
    $("#stCopy").onclick=async()=>{ try{ await navigator.clipboard.writeText(text+" "+url); $("#stMsg").textContent="Copied. Paste it in a message."; }catch(e){ $("#stMsg").textContent="Copying is blocked here. Press and hold the message to copy it."; } };
    $("#stMore").onclick=async()=>{ try{ if(!navigator.share) throw 0; await navigator.share({title:"FFMPA",text,url}); }catch(e){ $("#stMsg").textContent="Your device's share menu is not available here. Use Copy message instead."; } };
  });
}

/* listen: show when it is reading, tap again to stop */
(function(){ const b=document.getElementById("dListen"); if(!b||!("speechSynthesis" in window)) return; const orig=b.onclick;
  b.onclick=()=>{ if(speechSynthesis.speaking){ speechSynthesis.cancel(); b.classList.remove("on"); return; } orig&&orig(); b.classList.add("on"); const t=setInterval(()=>{ if(!speechSynthesis.speaking&&!speechSynthesis.pending){ b.classList.remove("on"); clearInterval(t); } },400); };
})();

/* ---------- one new thing a day ---------- */
function learnToday(){ return (typeof LEARN!=="undefined") ? LEARN[TODAY()] : null; }
function learnHTML(sel){
  const L=learnToday(); if(!L) return ""; const t=L[settings.age==="x"?"x":"o"]; const done=STATS.learned&&STATS.learned[TODAY()];
  const c=sel==null?-1:sel;
  const check = done&&sel==null ? `<div class="pzdone" style="animation:none;background:var(--tint);color:var(--acc)">${ico("star")}<span><b>Learned today.</b> A new one arrives tomorrow.</span></div>`
    : `<div class="kbox" data-learn><span class="kh">Check yourself</span><b style="font-size:.95em">${esc(t.q)}</b><div class="opts2" style="flex-wrap:wrap">${t.a.map((x,i)=>`<button type="button" data-lv="${i}" class="${c===i?(i===t.c?"ok":"no"):""}">${esc(x)}</button>`).join("")}</div><span class="fb" style="color:${c<0?"var(--muted)":c===t.c?"#15803D":"#B91C1C"}">${c<0?"Tap an answer":c===t.c?"Right! That's your new thing for today.":"Not quite. Read it once more!"}</span></div>`;
  return `<article class="card learn" style="--acc:${TC[L.cat]||"#0E7490"};--tint:${TT[L.cat]||"#E3F4F7"}" aria-label="Learn one thing">
    <div class="acc" aria-hidden="true"></div>
    <div class="img"><div class="tags"><span class="tag topic">Learn one thing · ${esc(L.subject)}</span><span class="tag">${esc(L.link)}</span></div></div>
    <div class="cbody"><h2>${esc(t.t)}</h2>${t.b.map(p=>`<p>${esc(p)}</p>`).join("")}
      <div class="remember"><span>${ico("bulb")}Remember this</span><p>${esc(t.remember)}</p></div>
      <div data-learnbox>${check}</div></div>
  </article>`;
}
function wireLearn(root){
  root.querySelectorAll("[data-lv]").forEach(b=> b.onclick=e=>{ e.stopPropagation(); const L=learnToday(), t=L[settings.age==="x"?"x":"o"], v=+b.dataset.lv; const card=b.closest(".card"); const tmp=document.createElement("div"); tmp.innerHTML=learnHTML(v); const nb=tmp.querySelector("[data-learnbox]"); const box=card.querySelector("[data-learnbox]"); box.replaceWith(nb); wireLearn(nb);
    if(v===t.c){ STATS.learned=STATS.learned||{}; if(!STATS.learned[TODAY()]){ STATS.learned[TODAY()]=1; saveStats(); checkAch(); } nb.querySelectorAll("button").forEach(x=>x.disabled=true); } });
}
ACH.push({id:"learn", t:"One new thing", d:"Daily concepts learned in history, geography and science", ic:"flask", c:"#0E7490", tiers:[3,10,30], m:()=>Object.keys(STATS.learned||{}).length});
