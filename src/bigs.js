
/* ===================== v4: Big Story of the week, Classroom mode, Young reporters ===================== */
const bigNow=()=> (typeof BIGSTORY!=="undefined"&&BIGSTORY[mondayOf(TODAY())])||null;
const lvl=()=>settings.age==="x"?"x":"o";
function bigDay(){ const B=bigNow(); if(!B) return [0,0]; return [B.days.filter(x=>x.d<=TODAY()).length, B.days.length]; }
function bigSeen(){ const w=mondayOf(TODAY()); STATS.big=STATS.big||{}; STATS.big[w]=STATS.big[w]||{}; return STATS.big[w]; }
function openBig(){ const B=bigNow(); if(!B) return; const L=lvl(), [n,tot]=bigDay(), seen=bigSeen(), col=TC[B.cat]||"#0B7F75", tint=TT[B.cat]||"#E6F5F1";
  const newDays=B.days.filter(x=>x.d<=TODAY()&&!seen[x.d]); newDays.forEach(x=>seen[x.d]=1); saveStats();
  const poll=STATS.bigPoll&&STATS.bigPoll[mondayOf(TODAY())];
  openSheet(`<div class="bighead" style="--bc:${col};--bt:${tint}"><span class="mk">Big Story of the week · day ${n} of ${tot}</span><h2 id="shTitle">${esc(B.t)}</h2><p>${esc(B.sub)}</p>
      <div class="bigprog">${B.days.map(x=>`<i class="${x.d<TODAY()?"done":x.d===TODAY()?"now":""}"><span>${dOf(x.d).toLocaleDateString("en-GB",{weekday:"short"})}</span></i>`).join("")}</div></div>
    <div class="box where" style="margin-top:14px"><h4>Why it matters to you</h4><p>${esc(B[L].why)}</p></div>
    <div class="bigfacts">${B.facts.map(f=>`<div><b>${f[0]}</b><span>${esc(f[1])}</span></div>`).join("")}</div>
    ${B.sketch&&SKETCHES[B.sketch]?sketchBtnHTML(B.sketch):""}
    <h4 class="h4">The story so far</h4>
    <div class="bigline" style="--bc:${col}">${B.days.map(x=>{ const past=x.d<=TODAY(); return `<div class="bd ${past?(x.d===TODAY()?"now":"done"):"lock"}"><i></i><div><small>${shortDate(x.d)}${x.d===TODAY()?" · today":""}</small><b>${esc(x.h)}</b><p>${esc(past?x[L]:x.lock)}</p></div></div>`; }).join("")}</div>
    <h4 class="h4">Words to know</h4><div class="chips">${B.words.filter(k=>G[k]).map(k=>`<button class="chip press" data-k="${k}">${G[k][0]}</button>`).join("")}</div>
    <h4 class="h4">Your view</h4><div class="bigpoll" id="bgPoll"><p><b>${esc(B.poll.q)}</b></p>${B.poll.a.map((a,i)=>`<button class="press ${poll===i?"on":""}" data-bp="${i}">${esc(a[0])}</button>`).join("")}<p class="msg" id="bgMsg" aria-live="polite">${poll!=null?esc(B.poll.a[poll][1])+" There is no single right answer.":""}</p></div>
    <div class="box think"><h4>Talk about it at home or in class</h4><p>${esc(B.talk)}</p></div>
    <p class="sub" style="margin-top:12px">A new part arrives each school day. Come back tomorrow for the next one.</p>`,
    sh=>{ sh.querySelectorAll("[data-k]").forEach(b=> b.onclick=()=>openTerm(b.dataset.k)); wireSketch(sh);
      sh.querySelectorAll("[data-bp]").forEach(b=> b.onclick=()=>{ const i=+b.dataset.bp; STATS.bigPoll=STATS.bigPoll||{}; STATS.bigPoll[mondayOf(TODAY())]=i; saveStats(); sh.querySelectorAll("[data-bp]").forEach(x=>x.classList.toggle("on",x===b)); $("#bgMsg").textContent=B.poll.a[i][1]+" There is no single right answer."; }); });
  if(newDays.length){ toast(`${ico("globe")}<span><b>Big Story</b> · day ${n} of ${tot} read</span>`,col); checkAch(); }
}
const bigCount=()=>Object.values(STATS.big||{}).reduce((a,w)=>a+Object.keys(w).length,0);
ACH.push({id:"big", t:"Big picture", d:"Big Story parts followed", ic:"globe", c:"#0B7F75", tiers:[3,10,30], m:()=>bigCount()});

/* ---------- Young reporters ---------- */
const yrNow=()=> (typeof YR!=="undefined"&&YR[mondayOf(TODAY())])||null;
const reports=()=>store.get("ffmpa-reports",[]);
const yrBad=t=>/\d{6,}/.test(t.replace(/[\s-]/g,""))||/@|https?:|www\./i.test(t);
async function openYR(msg,bad){ const A=yrNow(); if(!A) return; let mine=[], pub=[];
  if(SB_ON){ if(!signedIn()){ askPin(()=>{}); return; } try{ [mine,pub]=await Promise.all([myReports(),publicReports()]); }catch(e){ if(!msg){ msg=friendly(e); bad=true; } } }
  else mine=reports().filter(r=>r.w===mondayOf(TODAY()));
  const featured=SB_ON?[]:mine.filter(r=>r.status==="approved"); const showSamples=!SB_ON||pub.length<2;
  const stLabel={pending:"Waiting for an editor",approved:"On Sunday's front page",rejected:"Not used this time"};
  openSheet(`<span class="ttype" style="background:#FFE9DF;color:#9B2C1F">Young reporters</span><h2 id="shTitle" style="margin-top:8px">This week's <em class="v">assignment</em></h2>
    <div class="yrtask"><b>${esc(A.t)}</b><p>${esc(A.why)}</p><div class="yrtips">${A.tips.map(t=>`<span>${esc(t)}</span>`).join("")}</div></div>
    ${msg?`<p class="msg ${bad?"":"ok"}" aria-live="polite">${esc(msg)}</p>`:""}
    ${mine.length?`<h4 class="h4">Your reports</h4><div class="list">${mine.map(r=>`<div class="item"><span class="yrst ${r.status}">${stLabel[r.status]}</span><b>${esc(r.h)}</b>${r.b?`<p>${esc(r.b)}</p>`:""}</div>`).join("")}</div>`:""}
    <h4 class="h4">${mine.length?"Write another":"Write your report"}</h4>
    <label class="field" for="yrH">Headline: who did what, and where?<input type="text" id="yrH" maxlength="90" autocomplete="off" placeholder="Example: Class 5 plants twelve trees behind the school"></label>
    <label class="field" for="yrB" style="margin-top:10px">What happened? Two or three sentences.<textarea id="yrB" maxlength="280" rows="3" placeholder="Tell it like a reporter: only what you saw or checked."></textarea></label>
    <ul class="yrrules"><li>First names only, or no names at all.</li><li>No school names, addresses, phone numbers or photos.</li><li>Only things that really happened.</li></ul>
    <button class="btn sun press" id="yrGo" style="width:100%">Ask a grown-up to send it</button><p class="msg" id="yrM" aria-live="polite"></p>
    <h4 class="h4">Sunday's front page</h4>
    <div class="yrpage">${featured.map(r=>`<div class="yrcard me"><b>${esc(r.h)}</b>${r.b?`<p>${esc(r.b)}</p>`:""}<small>You · chosen by the editors</small></div>`).join("")}${pub.map(r=>`<div class="yrcard"><b>${esc(r.headline)}</b>${r.body?`<p>${esc(r.body)}</p>`:""}<small>${ageName(r.age_band)}, ${esc(ctyName(r.country))}</small></div>`).join("")}${showSamples?A.sample.map(r=>`<div class="yrcard"><b>${esc(r.h)}</b><p>${esc(r.b)}</p><small>${esc(r.by)}${SB_ON?" · example":""}</small></div>`).join(""):""}</div>
    <p class="sub" style="margin-top:10px;font-size:12.5px">${SB_ON?"An editor reads every report before it appears. The front page shows age group and country only, never a name."+(showSamples?" Cards marked example show what a good report looks like.":""):"Prototype: the reports above are samples. Real reports are checked by an editor and show age and country only, never a name."}</p>`,
    ()=>{ $("#yrGo").onclick=()=>{ const h=$("#yrH").value.trim().replace(/\s+/g," "), b=$("#yrB").value.trim().replace(/\s+/g," ");
        if(h.length<8){ $("#yrM").textContent="Write a headline first: who did what, and where?"; return; }
        if(yrBad(h+" "+b)){ $("#yrM").textContent="Please take out phone numbers, emails and web addresses."; return; }
        if(SB_ON){ askPin(async()=>{ try{ await sendReport(h,b); STATS.reports=(STATS.reports||0)+1; saveStats(); openYR("Sent. An editor reads every report before it appears."); toast(`${PENCIL}<span><b>Report sent</b> · well done, reporter</span>`,"#D9481E"); checkAch(); }catch(e){ openYR(reportError(e),true); } }); return; }
        askPin(()=>{ const l=reports(); l.push({id:"r"+Date.now(),w:mondayOf(TODAY()),d:TODAY(),h,b,status:"pending",age:settings.age,country:settings.country}); store.set("ffmpa-reports",l.slice(-40)); STATS.reports=(STATS.reports||0)+1; saveStats(); openYR("Sent. An editor reads every report before it appears."); toast(`${PENCIL}<span><b>Report sent</b> · well done, reporter</span>`,"#D9481E"); checkAch(); }); }; });
}
ACH.push({id:"yr", t:"Young reporter", d:"Reports sent to the editors", ic:"doc", c:"#D9481E", tiers:[1,4,12], m:()=>STATS.reports||0});
const _points2=points; points=function(){ return _points2()+2*bigCount()+5*(STATS.reports||0); };
function yrAdminHTML(){ if(SB_ON){ setTimeout(loadAdminReports,0); return `<div class="panel"><h2>Young reporters · moderation queue</h2><p class="note">Reports from every family, newest waiting ones first. Check for full names, school names, places that identify a child and anything unkind. Readers see age group and country only.</p><div id="yrAdm"><p class="note">Loading reports…</p></div></div>`; }
  const l=reports(); const lab={pending:"Waiting",approved:"Approved",rejected:"Declined"};
  return `<div class="panel"><h2>Young reporters · moderation queue</h2><p class="note">Every report arrives with a grown-up's PIN already entered. Editors check for names, places and anything unkind before a report can appear. Readers see age and country only.</p>
    ${l.length?`<div class="tablewrap"><table class="adm-table"><thead><tr><th>Report</th><th>From</th><th>Status</th><th></th></tr></thead><tbody>${l.slice().reverse().map(r=>`<tr><td><b>${esc(r.h)}</b>${r.b?`<br><span style="color:var(--muted)">${esc(r.b)}</span>`:""}</td><td>${r.age==="x"?"Explorer":"Thinker"}, ${COUNTRIES[r.country]?COUNTRIES[r.country].name:r.country}</td><td>${lab[r.status]}</td><td style="white-space:nowrap"><button class="btn ghost press" data-yr="${r.id}:approved">Approve</button> <button class="btn ghost press" data-yr="${r.id}:rejected">Decline</button></td></tr>`).join("")}</tbody></table></div>`:`<p class="note">No reports yet on this device. Send one from the app (Play, then Young reporters) to see it arrive here.</p>`}</div>`; }
document.addEventListener("click",e=>{ const b=e.target.closest("[data-yr]"); if(!b) return; const [id,st]=b.dataset.yr.split(":"); const l=reports(); const r=l.find(x=>x.id===id); if(r){ r.status=st; store.set("ffmpa-reports",l); renderAdmin(); } });

/* ---------- Classroom mode ---------- */
let klass=store.get("ffmpa-class",null);
function classQuiz(){ const pool=deck.filter(d=>d.type==="story"&&d.s.quiz).map(d=>d.s); const B=bigNow(); const first=B?pool.filter(s=>s.id===B.story):[]; return [...first,...pool.filter(s=>!first.includes(s))].slice(0,5); }
const newCode=()=>{ const a="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s=""; for(let i=0;i<6;i++) s+=a[Math.floor(Math.random()*a.length)]; return s; };
function openClassroom(){
  if(SB_ON&&!signedIn()){ askPin(()=>{}); return; }
  if(SB_ON&&klass&&!klass.id){ klass=null; store.del("ffmpa-class"); }
  if(klass&&klass.role==="teacher"){ openTeacher(); return; }
  if(klass&&klass.role==="pupil"){ openPupil(); return; }
  openSheet(`<span class="ttype" style="background:#E8EFFD;color:#1E3F8F">Classroom mode</span><h2 id="shTitle" style="margin-top:8px">Read the news <em class="v">as a class</em></h2><p class="sub">One class code. No pupil names, emails or accounts. The class sees totals only.</p>
    <div class="hub" style="grid-template-columns:1fr"><button id="clT" style="--hc:#2D5BC0"><span class="ic">${ico("book")}</span><b>I am a teacher</b><small>Set up a class, run the weekly quiz on the big screen and print a worksheet</small></button>
    <button id="clP" style="--hc:#0F8A5F"><span class="ic">${ico("star")}</span><b>I have a class code</b><small>Join your class with a grown-up's help</small></button></div>`,
    ()=>{ $("#clT").onclick=()=>askPin(()=>openTeacherSetup()); $("#clP").onclick=()=>openJoin(); });
}
function openTeacherSetup(){
  openSheet(`<h2 id="shTitle">Set up <em class="v">your class</em></h2><p class="sub">It takes one minute and asks nothing about your pupils.</p>
    <label class="field" for="tcN">Class name<input type="text" id="tcN" maxlength="24" placeholder="Class 5B"></label>
    <h4 class="h4">Reading level</h4><div class="seg" id="tcL"><button class="press" data-v="x" aria-pressed="false">Explorers</button><button class="press" data-v="o" aria-pressed="true">Thinkers</button><button class="press" data-v="n" aria-pressed="false">Navigators</button></div>
    <button class="btn sun press" id="tcGo" style="width:100%;margin-top:16px">Create class</button><p class="msg" id="tcM" aria-live="polite"></p>`,
    sh=>{ let lv="o"; sh.querySelectorAll("#tcL button").forEach(b=>b.onclick=()=>{ lv=b.dataset.v; sh.querySelectorAll("#tcL button").forEach(x=>x.setAttribute("aria-pressed",x===b)); });
      $("#tcGo").onclick=()=>{ const n=$("#tcN").value.trim(); if(n.length<2){ $("#tcM").textContent="Give the class a name, for example Class 5B."; return; } if(SB_ON){ const btn=$("#tcGo"); btn.disabled=true; createClass(n,lv).then(k=>{ klass=k; store.set("ffmpa-class",klass); openTeacher(); }).catch(e=>{ btn.disabled=false; $("#tcM").textContent=friendly(e); }); return; }
        klass={role:"teacher",name:n,level:lv,code:newCode()}; store.set("ffmpa-class",klass); openTeacher(); }; });
}
function openTeacher(){ const B=bigNow(), q=classQuiz();
  openSheet(`<span class="ttype" style="background:#E8EFFD;color:#1E3F8F">Classroom mode · teacher</span><h2 id="shTitle" style="margin-top:8px">${esc(klass.name)}</h2>
    <div class="clcode"><small>Class code</small><b>${klass.code.slice(0,3)} ${klass.code.slice(3)}</b><span>Pupils join from Play, then Classroom. They never type a name.</span></div>
    ${SB_ON?`<div class="pstats"><div><b id="tsP">…</b><span>pupils joined</span></div><div><b id="tsR">…</b><span>stories read this week</span></div><div><b id="tsQ">…</b><span>class quiz average</span></div></div>
    <p class="sub" id="tsN" style="font-size:12px;margin:6px 0 0">You only ever see class totals, never one child.</p>`:`<div class="pstats"><div><b>14</b><span>pupils joined</span></div><div><b>23</b><span>stories read this week</span></div><div><b>71%</b><span>class quiz average</span></div></div>
    <p class="sub" style="font-size:12px;margin:6px 0 0">Prototype: sample totals. You only ever see class totals, never one child.</p>`}
    <h4 class="h4">This week's class pack</h4>
    <div class="clpack">
      <button class="press" id="tcQ"><span class="ic" style="--hc:#C2367A">${ico("trophy")}</span><div><b>Class quiz on the big screen</b><small>${q.length} questions from this week's stories. Reveal each answer when the class is ready.</small></div>${ico("right")}</button>
      <button class="press" id="tcW"><span class="ic" style="--hc:#2D5BC0">${ico("doc")}</span><div><b>Printable worksheet</b><small>Questions, words of the week and a draw-it box, with an answer key for you.</small></div>${ico("right")}</button>
      ${B?`<button class="press" id="tcB"><span class="ic" style="--hc:#0B7F75">${ico("globe")}</span><div><b>Big Story: ${esc(B.t)}</b><small>Ten-minute discussion: “${esc(B.talk)}”</small></div>${ico("right")}</button>`:""}
      <button class="press" id="tcY"><span class="ic" style="--hc:#D9481E">${PENCIL}</span><div><b>Young reporters assignment</b><small>${esc((yrNow()||{t:"A new assignment arrives on Monday"}).t)}</small></div>${ico("right")}</button>
    </div>
    <button class="lk press" id="tcX" style="margin:16px 0 0">Close this class</button>`,
    ()=>{ $("#tcQ").onclick=()=>{ closeSheet(); openPresent(0,false); }; $("#tcW").onclick=()=>{ closeSheet(); openWorksheet(); }; const b=$("#tcB"); if(b) b.onclick=openBig; $("#tcY").onclick=()=>openYR();
      if(SB_ON&&klass.id) classSummary(klass).then(s=>{ if(!s||!$("#tsP")) return; $("#tsP").textContent=s.pupils; $("#tsR").textContent=s.reads==null?"·":s.reads; $("#tsQ").textContent=s.quiz_avg==null?"·":s.quiz_avg+"%"; if(s.pupils<3) $("#tsN").textContent="Totals appear once 3 pupils have joined, so no single child can be picked out."; }).catch(()=>{ const n=$("#tsN"); if(n) n.textContent="Could not load class totals right now."; });
      let sure=false; $("#tcX").onclick=()=>{ if(SB_ON&&!sure){ sure=true; $("#tcX").textContent="Tap again to close this class for every pupil"; return; } const k=klass; klass=null; store.del("ffmpa-class"); if(SB_ON&&k&&k.id) leaveClass(k); openClassroom(); }; });
}
function openJoin(msg){
  openSheet(`<h2 id="shTitle">Join <em class="v">your class</em></h2><p class="sub">Type the 6-letter code from your teacher. A grown-up needs to enter the PIN.</p>
    <label class="field" for="jcC">Class code<input type="text" id="jcC" maxlength="7" autocomplete="off" autocapitalize="characters" placeholder="ABC 123" style="letter-spacing:.2em;text-transform:uppercase;font-weight:700"></label>
    <button class="btn sun press" id="jcGo" style="width:100%;margin-top:14px">Join class</button><p class="msg" id="jcM" aria-live="polite">${esc(msg||"")}</p>`,
    ()=>{ $("#jcGo").onclick=()=>{ const c=$("#jcC").value.replace(/\s/g,"").toUpperCase(); if(!/^[A-Z0-9]{6}$/.test(c)){ $("#jcM").textContent="A class code has 6 letters or numbers."; return; } askPin(()=>{ if(SB_ON){ joinClass(c).then(k=>{ if(!k){ openJoin("We could not find that class code. Check it with your teacher."); return; } klass=k; store.set("ffmpa-class",klass); classTick(); openPupil(); }).catch(e=>openJoin(/three classes/i.test(e.message)?"You can be in three classes at most. Leave one first.":friendly(e))); return; }
      klass={role:"pupil",code:c,name:"Your class"}; store.set("ffmpa-class",klass); openPupil(); }); }; });
}
function openPupil(){ const q=classQuiz();
  openSheet(`<span class="ttype" style="background:#E4F6EE;color:#0B6B4F">Classroom mode</span><h2 id="shTitle" style="margin-top:8px">${esc(klass.name)}</h2><p class="sub">Class code ${klass.code.slice(0,3)} ${klass.code.slice(3)}. Your teacher sees class totals only, never your name.</p>
    ${SB_ON?`<div class="clgoal"><div><b>Class goal</b><span>Read 60 stories together this week</span></div><div class="lbar" style="--lc:#0F8A5F"><i id="puBar" style="width:0%"></i></div><small id="puG">Counting your class's stories…</small></div>`:`<div class="clgoal"><div><b>Class goal</b><span>Read 60 stories together this week</span></div><div class="lbar" style="--lc:#0F8A5F"><i style="width:${Math.min(100,Math.round((23+readIds.size)/60*100))}%"></i></div><small>${23+readIds.size} of 60 · your stories today count: ${readIds.size}</small></div>`}
    <div class="clpack"><button class="press" id="puQ"><span class="ic" style="--hc:#C2367A">${ico("trophy")}</span><div><b>This week's class quiz</b><small>${q.length} questions. Same ones your class will do together.</small></div>${ico("right")}</button></div>
    <button class="lk press" id="puX" style="margin:16px 0 0">Leave this class</button>`,
    ()=>{ $("#puQ").onclick=()=>{ quiz={qs:q,i:0,score:0,ans:false}; renderQuiz(); }; $("#puX").onclick=()=>{ const k=klass; klass=null; store.del("ffmpa-class"); if(SB_ON&&k&&k.id) leaveClass(k); openClassroom(); };
      if(SB_ON&&klass.id) classGoal(klass).then(g=>{ if(!g||!$("#puG")) return; const n=g.reads||0; $("#puBar").style.width=Math.min(100,Math.round(n/60*100))+"%"; $("#puG").textContent=`${n} of 60 · you read ${wkStats().reads} this week`; }).catch(()=>{ const x=$("#puG"); if(x) x.textContent="Could not load the class goal right now."; }); });
}
/* big-screen quiz */
function overlay(id,html){ let o=document.getElementById(id); if(!o){ o=document.createElement("div"); o.id=id; document.body.appendChild(o); } o.innerHTML=html; o.className="fullov open"; return o; }
function closeOverlay(id){ const o=document.getElementById(id); if(o) o.className="fullov"; document.body.classList.remove("printing"); }
function openPresent(i,show){ const qs=classQuiz(), L=klass?klass.level:lvl(); 
  if(i>=qs.length){ const B=bigNow(); const o=overlay("presentOv",`<div class="prs"><div class="prtop"><span>${esc(klass?klass.name:"Class quiz")} · FFMPA class quiz</span><button class="press" data-pc>Close</button></div><div class="prq"><small>Finished</small><h1>Well played. Now talk about it.</h1><p class="prtalk">${esc(B?B.talk:"Which story surprised you most this week, and why?")}</p></div><div class="prnav"><button class="btn ghost press" data-pp="0">Start again</button><button class="btn sun press" data-pc>Done</button></div></div>`); wirePresent(o); return; }
  const s=qs[i], q=s.quiz, t=(s[L]||s.o).t;
  const o=overlay("presentOv",`<div class="prs"><div class="prtop"><span>${esc(klass?klass.name:"Class quiz")} · question ${i+1} of ${qs.length}</span><button class="press" data-pc>Close</button></div>
    <div class="prq"><small>From: ${t}</small><h1>${esc(q.q)}</h1><div class="propts">${q.a.map((a,j)=>`<div class="${show&&j===q.c?"right":show?"dim":""}"><i>${"ABCD"[j]}</i>${esc(a)}</div>`).join("")}</div></div>
    <div class="prnav"><button class="btn ghost press" data-pp="${Math.max(0,i-1)}" ${i?"":"disabled"}>Back</button>${show?`<button class="btn sun press" data-pp="${i+1}">${i===qs.length-1?"Finish":"Next question"}</button>`:`<button class="btn sun press" data-ps="${i}">Show the answer</button>`}</div></div>`); wirePresent(o); }
function wirePresent(o){ o.querySelectorAll("[data-pc]").forEach(b=>b.onclick=()=>closeOverlay("presentOv")); o.querySelectorAll("[data-pp]").forEach(b=>b.onclick=()=>openPresent(+b.dataset.pp,false)); o.querySelectorAll("[data-ps]").forEach(b=>b.onclick=()=>openPresent(+b.dataset.ps,true)); const f=o.querySelector(".btn.sun"); if(f) f.focus(); }
/* printable worksheet */
function openWorksheet(){ const qs=classQuiz(), L=klass?klass.level:lvl(), B=bigNow(); const ws=(B?B.words:[]).filter(k=>G[k]).slice(0,4); const order=ws.map((k,i)=>i).sort((a,b)=>((a*7+3)%ws.length)-((b*7+3)%ws.length));
  const o=overlay("printView",`<div class="wsbar"><button class="btn ghost press" data-wc>Close</button><button class="btn sun press" data-wp>Print or save as PDF</button></div>
    <div class="ws"><div class="wshead"><div><b>ffmpa</b> class worksheet</div><div>Week of ${niceDate(mondayOf(TODAY()))}</div></div>
      <div class="wsname"><span>Name</span><i></i><span>Class</span><i class="s">${esc(klass?klass.name:"")}</i></div>
      <h2>1. What happened this week?</h2><ol class="wsq">${qs.map(s=>`<li><b>${esc(s.quiz.q)}</b><div>${s.quiz.a.map((a,j)=>`<span><i>${"ABCD"[j]}</i>${esc(a)}</span>`).join("")}</div></li>`).join("")}</ol>
      ${ws.length?`<h2>2. Words of the week</h2><p class="wsnote">Draw a line from each word to its meaning.</p><div class="wsmatch"><div>${ws.map(k=>`<span>${G[k][0]} <i></i></span>`).join("")}</div><div>${order.map(i=>`<span><i></i> ${esc(L==="x"?G[ws[i]][2]:G[ws[i]][3])}</span>`).join("")}</div></div>`:""}
      <h2>${ws.length?3:2}. Draw it</h2><p class="wsnote">${B&&B.sketch&&SKETCHES[B.sketch]?`Sketch “${esc(SKETCHES[B.sketch].t)}” in three steps, with one label on each.`:"Sketch the story you found most interesting, with three labels."}</p><div class="wsdraw"><i></i><i></i><i></i></div>
      <h2>${ws.length?4:3}. Think and write</h2><p class="wsnote">${esc(B?B.talk:"Which story surprised you most this week, and why?")}</p><div class="wslines"><i></i><i></i><i></i></div>
      <div class="wskey"><b>For the teacher.</b> Answers: ${qs.map((s,i)=>`${i+1} ${"ABCD"[s.quiz.c]}`).join(" · ")}. Sources for every story are listed in the app. FFMPA, real news made for kids · ffmpa.com</div></div>`);
  document.body.classList.add("printing");
  o.querySelector("[data-wc]").onclick=()=>closeOverlay("printView"); o.querySelector("[data-wp]").onclick=()=>{ try{ window.print(); }catch(e){} };
}
function classAdminHTML(){ const B=bigNow(), [n,tot]=bigDay(); return `${B?`<div class="panel"><h2>Big Story of the week</h2><p class="note"><b>${esc(B.t)}</b> · day ${n} of ${tot} · linked story ${B.story} · sketch: ${B.sketch?esc(SKETCHES[B.sketch].t):"none"}</p><div class="tablewrap"><table class="adm-table"><thead><tr><th>Day</th><th>Part</th><th>Status</th></tr></thead><tbody>${B.days.map(x=>`<tr><td>${shortDate(x.d)}</td><td>${esc(x.h)}</td><td>${x.d<TODAY()?"Published":x.d===TODAY()?"Live today":"Planned"}</td></tr>`).join("")}</tbody></table></div></div>`:""}
  <div class="panel"><h2>Classroom mode</h2><p class="note">Teachers create a class with a 6-character code. Children join with a grown-up's PIN and no name. Each week's class pack is built automatically from that week's stories: a 5-question big-screen quiz, a printable worksheet and the Big Story discussion question. Teachers see class totals only.</p></div>`+yrAdminHTML(); }
const _findsAdmin2=findsAdminHTML; findsAdminHTML=function(){ return classAdminHTML()+_findsAdmin2(); };

/* ---------- entry points: Today card, story chip, Play hub, menu ---------- */
const _todayHTML=todayHTML;
todayHTML=function(){ let h=_todayHTML(); const B=bigNow(); if(!B) return h; const [n,tot]=bigDay(), col=TC[B.cat]||"#0B7F75";
  const card=`<section class="mom bigmom" style="--mc:${col}"><span class="mbig ic" aria-hidden="true">${ico("globe")}</span><div class="mtxt"><span class="mk">Big Story of the week · day ${n} of ${tot}</span><h3>${esc(B.t)}</h3><p>${esc(B.sub)}</p><div class="mrow"><button class="btn press" data-big>Follow the story${ico("right")}</button></div></div></section>`;
  h=h.replace('aria-label="Today\'s cards. Swipe sideways.">','aria-label="Today\'s cards. Swipe sideways.">'+card);
  return h.replace('<div class="mdots" aria-hidden="true">','<div class="mdots" aria-hidden="true"><i class="on" data-md="0"></i>').replace('<i class="on" data-md="0"></i><i class="on" data-md="0"></i>','<i class="on" data-md="0"></i><i class="" data-md="x"></i>'); };
const _renderDeck4=renderDeck;
renderDeck=function(){ _renderDeck4(); const d=$("#deck"), B=bigNow();
  if(B){ const [n,tot]=bigDay(); d.querySelectorAll(".slide").forEach(sl=>{ const it=deck[+sl.dataset.i]; if(it&&it.type==="story"&&it.s.id===B.story){ const h=sl.querySelector(".cbody h2"); if(h&&!sl.querySelector(".bigchip")) h.insertAdjacentHTML("afterend",`<button class="bigchip press" data-big style="--bc:${TC[B.cat]||"#0B7F75"}">${ico("globe")}Big Story · day ${n} of ${tot}</button>`); } }); }
  d.querySelectorAll("[data-big]").forEach(b=> b.onclick=e=>{ e.stopPropagation(); openBig(); }); };
document.addEventListener("click",e=>{ if(e.target.closest("#hY")) openYR(); else if(e.target.closest("#hK")||e.target.closest("#mT")) openClassroom(); });


/* ===================== Navigators (13 to 15): deeper layer, quieter rewards ===================== */
function deepHTML(id){ const D=(typeof DEEP!=="undefined")&&DEEP[id]; if(!D) return ""; return `<div class="deep"><span class="dk">Navigators · go deeper</span>
  <div class="dsec"><h4>The bigger picture</h4><p>${esc(D.ctx)}</p></div>
  <div class="dsec ask"><h4>Worth arguing about</h4><p>${esc(D.ask)}</p></div>
  <div class="dsec"><h4>Who works on this</h4><div class="djobs">${D.jobs.map(j=>`<span>${esc(j)}</span>`).join("")}</div></div></div>`; }
const _renderDeck5=renderDeck;
renderDeck=function(){ document.documentElement.classList.toggle("navigators",settings.age==="n"); _renderDeck5(); if(settings.age!=="n") return; const d=$("#deck");
  d.querySelectorAll(".slide").forEach(sl=>{ const it=deck[+sl.dataset.i]; if(!it||it.type!=="story") return; const b=sl.querySelector(".cbody"); if(!b||b.querySelector(".deep")) return; const h=deepHTML(it.s.id); if(!h) return; const anchor=b.querySelector(".skbtn")||b.querySelector(".kbox")||b.querySelector(".feel"); if(anchor) anchor.insertAdjacentHTML("beforebegin",h); else b.insertAdjacentHTML("beforeend",h); });
  setTimeout(markMore,80); };


/* ===================== Live editions: load the latest approved edition from the FFMPA repository ===================== */
const EDITION_URL="https://raw.githubusercontent.com/aairacommit/FFMPA/main/editions/latest.json";
function applyEdition(E){
  if(!E||E.schema!==1||!Array.isArray(E.stories)||E.stories.length<5||!/^\d{4}-\d{2}-\d{2}$/.test(E.date||"")) return false;
  const bad=E.stories.find(s=>!s.id||!s.x||!s.o||!Array.isArray(s.x.b)||!Array.isArray(s.o.b)||!CATS[s.cat]); if(bad) return false;
  EDITION_DATE=E.date;
  S.splice(0,S.length,...E.stories);
  Object.assign(G,E.glossary||{});
  const swap=(obj,src)=>{ Object.keys(obj).forEach(k=>delete obj[k]); Object.assign(obj,src||{}); };
  swap(KEYS,E.keys); swap(XKEYS,E.xkeys); swap(DEEP,E.deep);
  if(E.today) ONTHISDAY[E.date]=E.today;
  if(E.learn) LEARN[E.date]=E.learn;
  Object.assign(SKETCHES,E.sketches||{}); swap(SKETCH_FOR,E.sketchFor);
  if(E.hiddenWords) HIDDEN_WORDS[E.date]=E.hiddenWords;
  if(E.backThen) BACKTHEN[E.date.slice(5)]=E.backThen;
  if(E.bigStory&&E.bigStory.week) BIGSTORY[E.bigStory.week]=E.bigStory;
  if(E.puzzles&&E.puzzles.week) PUZZLES[E.puzzles.week]=E.puzzles;
  if(E.reporters&&E.reporters.week) YR[E.reporters.week]=E.reporters;
  readIds=new Set(store.get("ffmpa-read-"+EDITION_DATE,[])); idx=0; topic="all"; typedIds.clear(); PZ=null;
  document.documentElement.dataset.edition=E.date+"-"+(E.edition||"am");
  renderAll(); return true;
}
async function loadLiveEdition(opts){
  if(!/^https?:$/.test(location.protocol)||/[?&]sample=1/.test(location.search)||/^(localhost|127\.)/.test(location.hostname)) return;
  try{
    const cur=document.documentElement.dataset.edition;
    /* Pick the edition for this family's own clock (6:00 am and 7:00 pm local, see schedule.js). */
    let pick=null, log=null;
    if(typeof SB_ON!=="undefined"&&SB_ON&&typeof sbEditionLog==="function"){
      log=await sbEditionLog(); if(log) pick=ffEditionFor(log,Date.now(),ffTz(),ADMIN.amTime,ADMIN.pmTime);
      if(!log&&cur) return;   /* schedule unreachable: keep what is showing rather than guess */
    }
    const get=async url=>{ const ctl=new AbortController(); const tm=setTimeout(()=>ctl.abort(),6000);
      try{ const r=await fetch(url+"?h="+Math.floor(Date.now()/3e5),{signal:ctl.signal,cache:"no-store"}); return r.ok?await r.json():null; }finally{ clearTimeout(tm); } };
    if(pick&&cur===pick.id){ if(window.FF_SLOT!==pick.slot){ window.FF_SLOT=pick.slot; renderTop(); } return; }
    /* never step back to an older edition unless the newer one was rolled back (no longer in the log) */
    if(pick&&cur&&cur>pick.id&&log.some(e=>e.id===cur)) return;
    let E=pick?await get(EDITION_URL.replace("latest.json",pick.id+".json")):null;
    if(!E||(E.date+"-"+(E.edition||"am"))!==(pick&&pick.id)){ if(cur||pick) return; E=await get(EDITION_URL); pick=null; }  /* latest.json only when there is no schedule and nothing showing */
    if(!E||!E.date) return;
    const id=E.date+"-"+(E.edition||"am");
    if(cur===id) return;
    if(!pick&&cur&&E.date<EDITION_DATE) return;
    /* a new edition while a child is in the middle of reading waits until the app is opened again */
    if(cur&&opts&&opts.background&&typeof idx!=="undefined"&&idx>0){ window.FF_PENDING=true; return; }
    window.FF_SLOT=pick?pick.slot:((E.edition==="pm")?"pm":"am"); window.FF_PENDING=false;
    applyEdition(E);
  }catch(e){}
}
/* keep an open app on time: check every five minutes (applied when the child is not mid story), and whenever the app comes back to the screen */
setInterval(()=>{ if(document.visibilityState==="visible") loadLiveEdition({background:true}); },5*60*1000);
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible") loadLiveEdition(); });
window.__edReady=false;
const _markReady=()=>{ if(window.__edReady) return; window.__edReady=true; dispatchEvent(new Event("ffmpa:edition")); };
setTimeout(()=>loadLiveEdition().finally(_markReady),50);

/* ===================== Launch screen ===================== */
(function(){ const el=document.getElementById("splash"); if(!el) return;
  const standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true||document.referrer.startsWith("android-app://");
  let seen=false; try{ seen=sessionStorage.getItem("ffmpa-splash")==="1"; sessionStorage.setItem("ffmpa-splash","1"); }catch(e){}
  if(seen&&!standalone){ el.classList.add("gone"); return; }
  const lines=["Waking up the newsroom…","Checking every fact twice…","Sharpening the pencils…","Asking the editor…","Spinning up the globe…","Finding today's big story…"];
  const ln=el.querySelector(".spline"), bar=el.querySelector(".spbar i"); let li=0;
  const tick=setInterval(()=>{ li=(li+1)%lines.length; if(ln) ln.textContent=lines[li]; },750);
  const t0=performance.now(), MIN=standalone?2300:1900, MAX=4200; let done=false;
  setTimeout(()=>{ if(bar) bar.style.width="70%"; },200);
  const finish=()=>{ if(done) return; done=true; clearInterval(tick); if(bar) bar.style.width="100%"; if(ln) ln.textContent=window.__edReady?"Today's edition is ready!":"Here's the latest edition";
    setTimeout(()=>{ el.classList.add("out"); setTimeout(()=>el.classList.add("gone"),750); },260); };
  const whenReady=()=>setTimeout(finish,Math.max(0,MIN-(performance.now()-t0)));
  if(window.__edReady) whenReady(); else addEventListener("ffmpa:edition",whenReady,{once:true});
  setTimeout(finish,MAX);
  el.addEventListener("click",()=>{ if(performance.now()-t0>600) finish(); });
})();


/* ===================== Install as an app ===================== */
let installEvt=null;
const isStandalone=()=>matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
window.addEventListener("beforeinstallprompt",e=>{ e.preventDefault(); installEvt=e; document.documentElement.classList.add("can-install"); });
window.addEventListener("appinstalled",()=>{ installEvt=null; document.documentElement.classList.remove("can-install"); toast(`${ico("rocket")}<span><b>FFMPA is on your home screen</b></span>`,"#5B35E8"); });
function openInstall(){
  if(isStandalone()){ openSheet(`<h2 id="shTitle">Already <em class="v">installed</em></h2><p class="sub">You are using FFMPA from your home screen.</p>`); return; }
  if(installEvt){ const ev=installEvt; installEvt=null; ev.prompt(); ev.userChoice.finally(()=>document.documentElement.classList.remove("can-install")); return; }
  const ios=isIOS();
  openSheet(`<h2 id="shTitle">Add FFMPA to your <em class="v">home screen</em></h2><p class="sub">It opens full screen like an app, with no browser bars.</p>
    <ol class="insteps">${ios?`<li>Open <b>ffmpa.com/app</b> in <b>Safari</b>.</li><li>Tap the <b>Share</b> button at the bottom of the screen.</li><li>Scroll down and tap <b>Add to Home Screen</b>, then <b>Add</b>.</li>`:`<li>Open <b>ffmpa.com/app</b> in <b>Chrome</b>.</li><li>Tap the <b>three dots</b> at the top right.</li><li>Tap <b>Add to Home screen</b> or <b>Install app</b>, then <b>Install</b>.</li>`}</ol>
    <p class="sub" style="font-size:12.5px">The Android app on Google Play is coming soon.</p>`);
}
document.addEventListener("click",e=>{ if(e.target.closest("#mA")){ e.stopPropagation(); openInstall(); } });
if("serviceWorker" in navigator && /^https:$/.test(location.protocol)) window.addEventListener("load",()=>{ navigator.serviceWorker.register("/sw.js",{scope:"/"}).catch(()=>{}); });
