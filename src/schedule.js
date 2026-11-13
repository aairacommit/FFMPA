/* ===================== Local edition schedule =====================
   Editions are approved once (in India) but families see them on their own clock:
   at the morning time (06:00) and the evening time (19:00) in their own time zone,
   the app shows the newest edition that had been published by then. If nothing new
   had been published by a release time, the next edition appears the moment it is
   published, if it is the matching kind (a morning edition at the morning release, an evening edition at
   the evening one) and it lands within 3 hours of the release time. So India's editions, approved around
   6 am and 7 pm, appear as soon as they are ready, while other countries always get theirs at 6:00 and
   7:00. Only the last four days are considered. Release times must be between 04:00 and 23:59.

   log: [{id:"2026-11-13-pm", seen:"2026-11-13T14:44:37Z"}, ...] (from the Cloud Run newsroom)
   Returns {id, slot:"am"|"pm", at:<ms>} or null, where slot and at are the release at which that edition
   appeared for this family (so the label says Morning or Evening on their own clock).
   The same rules live in cloudrun/main.py (visible_edition); tests/schedule_cases.json checks both. */
const FF_LATE_MS=3*3600*1000; /* a late edition skips the queue only within 3 hours of a release time */
function ffTzOffset(ms,tz){
  const f=new Intl.DateTimeFormat("en-US",{timeZone:tz,hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"});
  const p={}; f.formatToParts(new Date(ms)).forEach(x=>{ p[x.type]=x.value; });
  return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour%24,+p.minute,+p.second)-Math.floor(ms/1000)*1000;
}
function ffLocalDate(ms,tz){
  const p={}; new Intl.DateTimeFormat("en-US",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date(ms)).forEach(x=>{ p[x.type]=x.value; });
  return [+p.year,+p.month,+p.day];
}
function ffZoned(y,m,d,hh,mm,tz){ /* local wall time in tz -> UTC ms (handles daylight saving) */
  const guess=Date.UTC(y,m-1,d,hh,mm); let t=guess-ffTzOffset(guess,tz); t=guess-ffTzOffset(t,tz); return t;
}
function ffValidTz(tz){ try{ new Intl.DateTimeFormat("en-US",{timeZone:tz}); return true; }catch(e){ return false; } }
function ffEditionFor(log,nowMs,tz,amTime,pmTime){
  if(!Array.isArray(log)||!log.length) return null;
  if(!tz||!ffValidTz(tz)) tz="Asia/Kolkata";
  /* release times before 04:00 are not allowed: they could fall in a daylight saving gap */
  const hm=s=>{ const m=/^(\d{1,2}):(\d{2})$/.exec(s||""); return m&&+m[1]>=4&&+m[1]<=23&&+m[2]<60?[+m[1],+m[2]]:null; };
  const am=hm(amTime)||[6,0], pm=hm(pmTime)||[19,0];
  const L=log.map(e=>({id:e.id,t:Date.parse(e.seen)})).filter(e=>e.id&&!isNaN(e.t)).sort((a,b)=>a.t-b.t);
  if(!L.length) return null;
  const bounds=[]; const [y,mo,d]=ffLocalDate(nowMs,tz);
  for(let back=0;back<=3;back++){ const dt=new Date(Date.UTC(y,mo-1,d-back));
    const Y=dt.getUTCFullYear(), M=dt.getUTCMonth()+1, D=dt.getUTCDate();
    bounds.push({t:ffZoned(Y,M,D,am[0],am[1],tz),slot:"am"},{t:ffZoned(Y,M,D,pm[0],pm[1],tz),slot:"pm"}); }
  const past=bounds.filter(b=>b.t<=nowMs).sort((a,b)=>a.t-b.t);
  if(!past.length) return null;
  const newest=t=>{ let r=null; for(const e of L){ if(e.t<=t) r=e; } return r; };
  /* Walk the release times in order. At each one, show the newest edition published by then if it is newer
     than what is showing. If nothing new arrived at this release, or what is showing is not of this release's
     kind, an edition of this release's kind published within 3 hours shows as soon as it lands. Requiring the
     matching kind is what stops a country from drifting into showing every edition the moment it lands. */
  let shown=null, rel=null;   /* rel: the release at which the edition now showing first appeared (gives the label) */
  for(let i=0;i<past.length;i++){
    const cand=newest(past[i].t);
    let changed=false; if(cand&&(!shown||cand.t>shown.t)){ shown=cand; rel=past[i]; changed=true; }
    if(!changed||!shown.id.endsWith("-"+past[i].slot)){
      const end=Math.min(i===past.length-1?nowMs:past[i+1].t-1, past[i].t+FF_LATE_MS);
      const sT=shown?shown.t:-Infinity;
      let late=null; for(const e of L){ if(e.t<=end&&e.t>sT&&e.id.endsWith("-"+past[i].slot)) late=e; }
      if(late){ shown=late; rel=past[i]; }
    }
  }
  return shown?{id:shown.id,slot:rel.slot,at:rel.t}:null;
}
