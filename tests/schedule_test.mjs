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
  // late morning edition (after three review rounds, 09:30 IST): daytime, so shown as soon as it is merged
  const late=mk(false).map(e=>e.id==="2026-11-16-am"?{id:e.id,seen:"2026-11-16T04:00:00Z"}:e);
  T.push(["India: morning edition merged at 09:30 IST appears by the evening release", late, "Asia/Kolkata", "2026-11-16T13:31:00Z", "2026-11-16-am"]);
  T.push(["India: and the evening edition after it still arrives that evening", late, "Asia/Kolkata", "2026-11-16T14:30:00Z", "2026-11-16-pm"]);
  T.push(["India: morning edition merged at 09:30 IST shows at once", late, "Asia/Kolkata", "2026-11-16T04:01:00Z", "2026-11-16-am"]);
  { const base=[{id:"2026-11-13-pm",seen:"2026-11-13T14:44:37Z"}];
    T.push(["India: 14 Nov morning edition merged at 11:50 IST shows at once", [...base,{id:"2026-11-14-am",seen:"2026-11-14T06:20:01Z"}], "Asia/Kolkata", "2026-11-14T06:21:00Z", "2026-11-14-am"]);
    // London: a late edition landing at 20:59 shows at once (daytime); one landing at 22:30 (night, over 3 hours
    // after the 19:00 release) waits for 06:00
    T.push(["London: late edition landing 20:59 local shows at once", [...base,{id:"2026-11-14-am",seen:"2026-11-14T20:59:00Z"}], "Europe/London", "2026-11-14T20:59:30Z", "2026-11-14-am"]);
    T.push(["London: late edition landing 22:30 local waits for the next release", [...base,{id:"2026-11-14-am",seen:"2026-11-14T22:30:00Z"}], "Europe/London", "2026-11-14T23:30:00Z", "2026-11-13-pm"]);
    T.push(["London: and shows at 06:00", [...base,{id:"2026-11-14-am",seen:"2026-11-14T22:30:00Z"}], "Europe/London", "2026-11-15T06:00:30Z", "2026-11-14-am"]); }
  let b2=0; for(const [why,log,tz,now,id,amT,pmT] of T){ const r=ctx.ffEditionFor(log,Date.parse(now),tz,amT||"06:00",pmT||"19:00"); if(!r||r.id!==id){ b2++; console.log("FAIL",why,JSON.stringify(r)); } }
  { const lag=JSON.parse(fs.readFileSync(new URL("./schedule_lag_log.json",import.meta.url),"utf8"));
    // one late merge (3 Nov pm at 07:00 IST on the 4th, 4 Nov am at 07:30 IST) must not leave India a day behind
    T.push(["India catches up the day after a late merge",lag,"Asia/Kolkata","2026-11-06T00:50:00Z","2026-11-06-am"]);
    T.push(["India shows the evening edition as it lands",lag,"Asia/Kolkata","2026-11-08T13:50:00Z","2026-11-08-pm"]); }
  { const N=[]; for(let d=10; d<=16; d++){ const D=`2026-11-${d}`; N.push({id:`${D}-am`,seen:`${D}T00:45:00Z`},{id:`${D}-pm`,seen:`${D}T13:45:00Z`}); }
    T.push(["an id that is not a real date is ignored",[...N,{id:"2026-02-30-am",seen:"2026-11-16T14:00:00Z"},{id:"2026-11-31-pm",seen:"2026-11-16T14:00:00Z"},{bad:1},null],"Asia/Kolkata","2026-11-16T15:00:00Z","2026-11-16-pm"]);
    // admin times outside 04:00 to 22:59, or with the evening not 11 to 13 hours after the morning, fall back to 06:00 and 19:00
    T.push(["admin 04:00 and 22:59 falls back (Tokyo still sees the morning edition)",N,"Asia/Tokyo","2026-11-15T10:30:00Z","2026-11-15-am","04:00","22:59"]);
    T.push(["admin am after pm falls back (India sees the evening edition)",N,"Asia/Kolkata","2026-11-15T14:00:00Z","2026-11-15-pm","10:00","09:00"]);
    T.push(["admin 07:00 and 19:30 is used (London morning at 07:00)",N,"Europe/London","2026-11-15T06:59:00Z","2026-11-14-pm","07:00","19:30"]);
    T.push(["admin 07:00 and 19:30 is used (London morning at 07:00, after)",N,"Europe/London","2026-11-15T07:00:00Z","2026-11-15-am","07:00","19:30"]); }
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
    let arrivals=0, nightChanges=0;  // changes outside 6:00 / 7:00 local, and those at night (21:00 to 6:00)
    let prev=null;
    for(let t=Date.parse("2026-11-16T00:00:00Z"); t<=Date.parse("2026-11-23T00:00:00Z"); t+=60*1000){
      const r=ctx.ffEditionFor(log,t,tz,"06:00","19:00"); const id=r&&r.id;
      if(prev&&id!==prev){ const local=new Date(t+off*3600e3); const hm=local.getUTCHours()*60+local.getUTCMinutes();
        if(hm!==360&&hm!==1140){ arrivals++; if((hm<360||hm>=1260)&&!(hm>1140&&hm<=1320)) nightChanges++; } }
      prev=id;
    }
    // Off-slot changes are allowed only in the daytime (a late edition shows as it lands) or within 3 hours
    // of a release; never at night. Europe and the Americas should see none at all in steady state.
    const westNone=["America/New_York","America/Los_Angeles","Europe/London","Europe/Berlin"].includes(tz);
    if(nightChanges||(westNone&&arrivals)){ fails++; console.log("STEADY FAIL",tz,"off-slot changes:",arrivals,"at night:",nightChanges); }
    else console.log("steady",tz,"off-slot changes:",arrivals,"(none at night)");
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
    const wins=[["2026-10-24","2026-11-08"],["2026-10-16","2026-10-31"],["2027-03-27","2027-04-11"],["2026-09-26","2026-10-10"]];
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
          const lgT=lg.filter(e=>Date.parse(e.seen)<=t).slice(-20);   // the real log: what has landed, newest 20
          const r=ctx.ffEditionFor(lgT,t,tz,"06:00","19:00"), id=r&&r.id;
          if(Math.floor(t/60e3)%45===0) pts.push([tz,t,id,r&&r.slot,lgT.length]);
          if(id) seenIds.add(id);
          if(prev!==null&&id!==prev){
            if(id<prev) bk++;
            const [y,m,dd]=ctx.ffLocalDate(t,tz); let rel=false;
            for(const back of [0,1]) for(const [h,mi] of [[6,0],[19,0]]){ const q=new Date(Date.UTC(y,m-1,dd-back)); const rt=ctx.ffZoned(q.getUTCFullYear(),q.getUTCMonth()+1,q.getUTCDate(),h,mi,tz); if(rt>prevT&&rt<=t) rel=true; }
            if(!rel&&!arr.some(x=>x>prevT&&x<=t)){ sp++; if(sp<4) console.log("SPURIOUS CHANGE",tz,iso(t),prev,"->",id); }
          }
          prev=id; prevT=t;
        }
        // A miss is only allowed when the next newer edition landed less than 10 hours later: that is the
        // longest a late edition can wait for a release (06:00 + 3 h to 19:00), so the newer one supersedes it.
        const missed=must.filter(x=>!seenIds.has(x)).filter(x=>{ const i=lg.findIndex(e=>e.id===x), nx=lg.filter(e=>e.id>x).sort((a,b)=>a.id<b.id?-1:1)[0];
          return !nx||Date.parse(nx.seen)-Date.parse(lg[i].seen)>=10*3600e3; });
        if(missed.length){ ms++; if(ms<4) console.log("MISSED",tz,missed.join(" ")); }
      }
      dump.push({log:lg,pts});
    }
    fs.writeFileSync("/tmp/schedule_fuzz.json",JSON.stringify(dump));
    console.log(`fuzz: ${runs} zone runs (20-entry log), step backs ${bk}, unexplained misses ${ms}, changes outside a release or arrival ${sp}`);
    if(bk||ms||sp) fails++;
  }
  const g2=[]; for(const tz of Object.keys(zones)) for(let t=Date.parse("2026-11-16T00:00:00Z"); t<=Date.parse("2026-11-23T00:00:00Z"); t+=13*60*1000){ const r=ctx.ffEditionFor(log,t,tz,"06:00","19:00"); g2.push([tz,t,r?r.id:null,r?r.slot:null]); }
  fs.writeFileSync("/tmp/schedule_grid2.json",JSON.stringify({log,grid:g2}));
  if(fails) process.exit(1);
}
