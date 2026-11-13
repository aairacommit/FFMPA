// node tests/schedule_test.mjs  (checks src/schedule.js against tests/schedule_cases.json)
import fs from "fs"; import vm from "vm";
const ctx={}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(new URL("../src/schedule.js",import.meta.url),"utf8")+";this.ffEditionFor=ffEditionFor;this.ffLocalDate=ffLocalDate;this.ffZoned=ffZoned;",ctx);
const C=JSON.parse(fs.readFileSync(new URL("./schedule_cases.json",import.meta.url),"utf8"));
let bad=0;
for(const c of C.cases){ const r=ctx.ffEditionFor(c.log||C.log,Date.parse(c.now),c.tz,"06:00","19:00");
  const ok=r&&r.id===c.id&&r.slot===c.slot; if(!ok){ bad++; console.log("FAIL",c.why,JSON.stringify(r)); } }
// grid dump for the Python cross-check
const tzs=["Asia/Kolkata","America/New_York","America/Los_Angeles","Europe/London","Europe/Berlin","Europe/Paris","Asia/Seoul","Australia/Sydney","Mars/Base"];
const out=[]; for(const tz of tzs){ for(let t=Date.parse("2026-11-11T00:00:00Z");t<=Date.parse("2026-11-15T00:00:00Z");t+=17*60*1000){ const r=ctx.ffEditionFor(C.log,t,tz,"06:00","19:00"); out.push([tz,t,r?r.id:null,r?r.slot:null]); } }
fs.writeFileSync("/tmp/schedule_grid.json",JSON.stringify(out));
console.log(`${C.cases.length-bad}/${C.cases.length} cases pass, ${out.length} grid points written`); if(bad) process.exit(1);

// Reviewer cases (14 Nov): long logs, late editions, a one entry log
{
  const mk=(skipLate)=>{ const log=[]; for(let d=10; d<=19; d++){ const D=`2026-11-${d}`;
    log.push({id:`${D}-am`,seen:`${D}T00:45:00Z`}); log.push({id:`${D}-pm`,seen:(skipLate&&d===17)?`${D}T17:00:00Z`:`${D}T13:45:00Z`}); } return log; };
  const T=[
    ["India 20:00 IST with a 10 day log shows that evening's edition", mk(false), "Asia/Kolkata", "2026-11-17T14:30:00Z", "2026-11-17-pm"],
    ["India 07:00 IST with a 10 day log shows that morning's edition", mk(false), "Asia/Kolkata", "2026-11-18T01:30:00Z", "2026-11-18-am"],
    ["India: evening edition merged at 22:30 IST, next morning 07:00 shows the new morning edition", mk(true), "Asia/Kolkata", "2026-11-18T01:30:00Z", "2026-11-18-am"],
    ["India: the evening after a late evening edition is on time again", mk(true), "Asia/Kolkata", "2026-11-18T14:30:00Z", "2026-11-18-pm"],
    ["Sydney with a one entry log still shows it", [{id:"2026-11-13-pm",seen:"2026-11-13T14:00:00Z"}], "Australia/Sydney", "2026-11-14T03:00:00Z", "2026-11-13-pm"],
  ];
  // late morning edition (after three review rounds, 09:30 IST): shown as soon as merged? no, more than 3 hours late: at 19:00 it is shown
  const late=mk(false).map(e=>e.id==="2026-11-16-am"?{id:e.id,seen:"2026-11-16T04:00:00Z"}:e);
  T.push(["India: morning edition merged at 09:30 IST appears by the evening release", late, "Asia/Kolkata", "2026-11-16T13:31:00Z", "2026-11-16-am"]);
  T.push(["India: and the evening edition after it still arrives that evening", late, "Asia/Kolkata", "2026-11-16T14:30:00Z", "2026-11-16-pm"]);
  let b2=0; for(const [why,log,tz,now,id] of T){ const r=ctx.ffEditionFor(log,Date.parse(now),tz,"06:00","19:00"); if(!r||r.id!==id){ b2++; console.log("FAIL",why,JSON.stringify(r)); } }
  fs.writeFileSync("/tmp/schedule_extra.json",JSON.stringify(T));
  console.log(`${T.length-b2}/${T.length} reviewer cases pass`); if(b2) process.exit(1);
}
// Steady state: editions merged daily around 6:15 am and 7:15 pm IST (00:45Z, 13:45Z); the 18 Nov evening one is skipped.
{
  const log=[]; for(let d=14; d<=24; d++){ const D=`2026-11-${d}`;
    log.push({id:`${D}-am`,seen:`${D}T00:45:00Z`}); if(d!==18) log.push({id:`${D}-pm`,seen:`${D}T13:45:00Z`}); }
  const zones={"Asia/Kolkata":5.5,"America/New_York":-5,"America/Los_Angeles":-8,"Europe/London":0,"Europe/Berlin":1,"Asia/Seoul":9,"Australia/Sydney":11};
  let fails=0;
  for(const [tz,off] of Object.entries(zones)){
    let arrivals=0;  // how many times an edition appeared outside 6:00 / 7:00 local (+/- 1 minute)
    let prev=null;
    for(let t=Date.parse("2026-11-16T00:00:00Z"); t<=Date.parse("2026-11-23T00:00:00Z"); t+=60*1000){
      const r=ctx.ffEditionFor(log,t,tz,"06:00","19:00"); const id=r&&r.id;
      if(prev&&id!==prev){ const local=new Date(t+off*3600e3); const hm=local.getUTCHours()*60+local.getUTCMinutes();
        if(hm!==360&&hm!==1140) arrivals++; }
      prev=id;
    }
    const allowed=tz==="Asia/Kolkata"?14:2;  // India: editions land after 6:00 / 7:00 and show at once; elsewhere at most the skip
    if(arrivals>allowed){ fails++; console.log("STEADY FAIL",tz,"off-slot changes:",arrivals); }
    else console.log("steady",tz,"off-slot changes:",arrivals);
  }
  // Every zone sees every edition and never steps back, for several patterns of merge times (with jitter,
  // late merges and a skipped edition), including the far ends of the world.
  const allZones=[...Object.keys(zones),"Pacific/Honolulu","Pacific/Pago_Pago","Pacific/Auckland","Pacific/Kiritimati","America/Sao_Paulo","Asia/Dubai","Asia/Tokyo"];
  const patterns=[[45,825],[150,960],[200,1000]];  // minutes after 00:00Z for am and pm merges
  let seed=7; const rnd=()=>(seed=(seed*1103515245+12345)%2147483648)/2147483648;
  let covFails=0;
  for(const [am,pm] of patterns) for(const jitter of [0,40]){
    const L2=[]; for(let d=14; d<=24; d++){ const D=`2026-11-${d}`, base=Date.parse(`${D}T00:00:00Z`);
      const j=()=>Math.floor(rnd()*jitter)*60e3;
      L2.push({id:`${D}-am`,seen:new Date(base+am*60e3+j()).toISOString().replace(".000","")});
      if(d!==18) L2.push({id:`${D}-pm`,seen:new Date(base+pm*60e3+j()).toISOString().replace(".000","")}); }
    const must=L2.filter(e=>Date.parse(e.seen)>=Date.parse("2026-11-16T12:00:00Z")&&Date.parse(e.seen)<=Date.parse("2026-11-21T00:00:00Z")).map(e=>e.id);
    for(const tz of allZones){
      const seen=new Set(); let prev=null, back=0;
      // what shows can only change at a release (on the hour or half hour here) or when an edition lands
      const times=[]; for(let t=Date.parse("2026-11-16T00:00:00Z"); t<=Date.parse("2026-11-23T00:00:00Z"); t+=30*60*1000) times.push(t+1000);
      for(const e of L2) times.push(Date.parse(e.seen)+1000);
      for(const t of times.sort((a,b)=>a-b)){
        const r=ctx.ffEditionFor(L2,t,tz,"06:00","19:00"); const id=r&&r.id; if(!id) continue;
        if(prev&&id<prev) back++; seen.add(id); prev=id; }
      const missed=must.filter(x=>!seen.has(x));
      if(back||missed.length){ covFails++; console.log("COVERAGE FAIL",tz,am,pm,jitter,"back:",back,"missed:",missed.join(" ")); }
    }
  }
  console.log(`coverage: ${patterns.length*2*allZones.length-covFails}/${patterns.length*2*allZones.length} zone runs see every edition, never step back`);
  if(covFails) fails++;
  // Random logs (late, very late, early and skipped merges) across daylight saving changes and the far ends of
  // the world. Checks: never a step back, nothing missed, and no change except at a release or an arrival
  // (in particular never at local midnight). Points are dumped for the Python check.
  {
    const fz=["Asia/Kolkata","America/New_York","Europe/London","Australia/Sydney","Pacific/Kiritimati","Pacific/Tongatapu","Pacific/Pago_Pago","Pacific/Auckland","Asia/Kathmandu","America/St_Johns","Australia/Lord_Howe","America/Los_Angeles","Pacific/Chatham"];
    const wins=[["2026-10-28","2026-11-06"],["2026-10-20","2026-10-29"],["2027-03-31","2027-04-09"],["2026-09-30","2026-10-08"]];
    let sd=11; const rr=()=>(sd=(sd*1103515245+12345)%2147483648)/2147483648;
    const iso=ms=>new Date(ms).toISOString().replace(/\.\d+Z/,"Z");
    let bk=0, ms=0, sp=0, runs=0; const dump=[];
    for(let it=0; it<12; it++){
      const [a,b]=wins[it%wins.length], d0=Date.parse(a+"T00:00:00Z"), dEnd=Date.parse(b+"T00:00:00Z");
      const lg=[]; for(let t=d0; t<dEnd; t+=864e5){ const D=iso(t).slice(0,10);
        if(rr()>0.1) lg.push({id:D+"-am",seen:iso(t+(45+Math.floor(rr()<0.2?rr()*600:rr()*60))*60e3)});
        if(rr()>0.1) lg.push({id:D+"-pm",seen:iso(t+(825+Math.floor(rr()<0.2?rr()*500-200:rr()*60))*60e3)}); }
      lg.sort((x,y)=>x.seen<y.seen?-1:1);
      const st=d0+2*864e5, en=dEnd-864e5, arr=lg.map(e=>Date.parse(e.seen));
      const must=lg.filter(e=>Date.parse(e.seen)>=st+864e5&&Date.parse(e.seen)<=en-2*864e5).map(e=>e.id);
      const pts=[];
      for(const tz of fz){ runs++;
        let prev=null, prevT=null; const seenIds=new Set();
        for(let t=st; t<=en; t+=15*60e3){
          const r=ctx.ffEditionFor(lg,t,tz,"06:00","19:00"), id=r&&r.id;
          if(Math.floor(t/60e3)%45===0) pts.push([tz,t,id,r&&r.slot]);
          if(id) seenIds.add(id);
          if(prev!==null&&id!==prev){
            if(id<prev) bk++;
            const [y,m,dd]=ctx.ffLocalDate(t,tz); let rel=false;
            for(const back of [0,1]) for(const [h,mi] of [[6,0],[19,0]]){ const q=new Date(Date.UTC(y,m-1,dd-back)); const rt=ctx.ffZoned(q.getUTCFullYear(),q.getUTCMonth()+1,q.getUTCDate(),h,mi,tz); if(rt>prevT&&rt<=t) rel=true; }
            if(!rel&&!arr.some(x=>x>prevT&&x<=t)){ sp++; if(sp<4) console.log("SPURIOUS CHANGE",tz,iso(t),prev,"->",id); }
          }
          prev=id; prevT=t;
        }
        const missed=must.filter(x=>!seenIds.has(x)); if(missed.length){ ms++; if(ms<4) console.log("MISSED",tz,missed.join(" ")); }
      }
      dump.push({log:lg,pts});
    }
    fs.writeFileSync("/tmp/schedule_fuzz.json",JSON.stringify(dump));
    console.log(`fuzz: ${runs} zone runs, step backs ${bk}, missed ${ms}, changes outside a release or arrival ${sp}`);
    if(bk||ms||sp) fails++;
  }
  const g2=[]; for(const tz of Object.keys(zones)) for(let t=Date.parse("2026-11-16T00:00:00Z"); t<=Date.parse("2026-11-23T00:00:00Z"); t+=13*60*1000){ const r=ctx.ffEditionFor(log,t,tz,"06:00","19:00"); g2.push([tz,t,r?r.id:null,r?r.slot:null]); }
  fs.writeFileSync("/tmp/schedule_grid2.json",JSON.stringify({log,grid:g2}));
  if(fails) process.exit(1);
}
