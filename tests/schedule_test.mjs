// node tests/schedule_test.mjs  (checks src/schedule.js against tests/schedule_cases.json)
import fs from "fs"; import vm from "vm";
const ctx={}; vm.createContext(ctx); vm.runInContext(fs.readFileSync(new URL("../src/schedule.js",import.meta.url),"utf8")+";this.ffEditionFor=ffEditionFor;",ctx);
const C=JSON.parse(fs.readFileSync(new URL("./schedule_cases.json",import.meta.url),"utf8"));
let bad=0;
for(const c of C.cases){ const r=ctx.ffEditionFor(c.log||C.log,Date.parse(c.now),c.tz,"06:00","19:00");
  const ok=r&&r.id===c.id&&r.slot===c.slot; if(!ok){ bad++; console.log("FAIL",c.why,JSON.stringify(r)); } }
// grid dump for the Python cross-check
const tzs=["Asia/Kolkata","America/New_York","America/Los_Angeles","Europe/London","Europe/Berlin","Europe/Paris","Asia/Seoul","Australia/Sydney","Mars/Base"];
const out=[]; for(const tz of tzs){ for(let t=Date.parse("2026-11-11T00:00:00Z");t<=Date.parse("2026-11-15T00:00:00Z");t+=17*60*1000){ const r=ctx.ffEditionFor(C.log,t,tz,"06:00","19:00"); out.push([tz,t,r?r.id:null,r?r.slot:null]); } }
fs.writeFileSync("/tmp/schedule_grid.json",JSON.stringify(out));
console.log(`${C.cases.length-bad}/${C.cases.length} cases pass, ${out.length} grid points written`); if(bad) process.exit(1);

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
  const g2=[]; for(const tz of Object.keys(zones)) for(let t=Date.parse("2026-11-16T00:00:00Z"); t<=Date.parse("2026-11-23T00:00:00Z"); t+=13*60*1000){ const r=ctx.ffEditionFor(log,t,tz,"06:00","19:00"); g2.push([tz,t,r?r.id:null,r?r.slot:null]); }
  fs.writeFileSync("/tmp/schedule_grid2.json",JSON.stringify({log,grid:g2}));
  if(fails) process.exit(1);
}
