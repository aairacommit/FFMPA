/* ===================== Local edition schedule =====================
   Editions are approved once (in India) but families see them on their own clock. Each edition has a due
   time in the family's time zone: edition D-am at the morning time (06:00) on day D, D-pm at the evening
   time (19:00) on day D. An edition shows at its due time if it has landed by then. If it lands after its
   due time, it shows the moment it lands when that is within 3 hours after one of the family's releases
   (so India sees editions as soon as they are approved), and otherwise at the family's next release. The family sees the
   newest edition that is showable. Nothing depends on history, so the answer only changes at a release or
   when an edition lands, never steps back (unless an edition is rolled back) and never changes at midnight.
   In normal operation every zone sees every edition; an edition merged so late that a newer one is due by
   the same release is superseded. Release times must be between 04:00 and 22:59, with the evening time 11 to 13 hours after the morning time.

   log: [{id:"2026-11-13-pm", seen:"2026-11-13T14:44:37Z"}, ...] (from the Cloud Run newsroom)
   Returns {id, slot:"am"|"pm", at:<ms>} or null: slot and at are the release the edition showed at on this
   family's clock (so the label says Morning or Evening for them).
   The same rules live in cloudrun/main.py (visible_edition); tests/schedule_cases.json checks both. */
const FF_LATE_MS=3*3600*1000; /* a late edition landing up to 3 hours after a release shows as it lands */
const FF_FMT={};
function ffTzOffset(ms,tz){
  const f=FF_FMT[tz]||(FF_FMT[tz]=new Intl.DateTimeFormat("en-US",{timeZone:tz,hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}));
  const p={}; f.formatToParts(new Date(ms)).forEach(x=>{ p[x.type]=x.value; });
  return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour%24,+p.minute,+p.second)-Math.floor(ms/1000)*1000;
}
function ffLocalDate(ms,tz){
  const p={}; (FF_FMT["d|"+tz]||(FF_FMT["d|"+tz]=new Intl.DateTimeFormat("en-US",{timeZone:tz,year:"numeric",month:"2-digit",day:"2-digit"}))).formatToParts(new Date(ms)).forEach(x=>{ p[x.type]=x.value; });
  return [+p.year,+p.month,+p.day];
}
function ffZoned(y,m,d,hh,mm,tz){ /* local wall time in tz -> UTC ms (handles daylight saving) */
  const guess=Date.UTC(y,m-1,d,hh,mm); let t=guess-ffTzOffset(guess,tz); t=guess-ffTzOffset(t,tz); return t;
}
function ffValidTz(tz){ try{ new Intl.DateTimeFormat("en-US",{timeZone:tz}); return true; }catch(e){ return false; } }
function ffEditionFor(log,nowMs,tz,amTime,pmTime){
  if(!Array.isArray(log)||!log.length) return null;
  if(!tz||!ffValidTz(tz)) tz="Asia/Kolkata";
  /* release times must be 04:00 to 22:59: other hours can fall in a daylight saving gap or repeat */
  const hm=s=>{ const m=/^(\d{1,2}):(\d{2})$/.exec(s||""); return m&&+m[1]>=4&&+m[1]<=22&&+m[2]<60?[+m[1],+m[2]]:null; };
  let am=hm(amTime)||[6,0], pm=hm(pmTime)||[19,0];
  /* the evening time must be 11 to 13 hours after the morning time, or every zone could not see every
     edition; anything else falls back to 06:00 and 19:00 (the admin form enforces the same) */
  const gap=(pm[0]*60+pm[1])-(am[0]*60+am[1]); if(gap<660||gap>780){ am=[6,0]; pm=[19,0]; }
  const rel=(Y,M,D,slot)=>{ const [h,mi]=slot==="am"?am:pm; return ffZoned(Y,M,D,h,mi,tz); };
  /* the release just before t and the first release at or after t, on this family's clock */
  const around=t=>{ const [y,m,d]=ffLocalDate(t,tz); let prev=null, next=null;
    for(let k=-1;k<=1;k++){ const q=new Date(Date.UTC(y,m-1,d+k));
      for(const slot of ["am","pm"]){ const r=rel(q.getUTCFullYear(),q.getUTCMonth()+1,q.getUTCDate(),slot);
        if(r<=t) prev={t:r,slot}; else if(!next) next={t:r,slot}; } }
    return [prev,next]; };
  let best=null;
  for(const e of log){
    const t=e&&Date.parse(e.seen), m=/^(\d{4})-(\d{2})-(\d{2})-(am|pm)$/.exec((e&&e.id)||"");
    if(!m||isNaN(t)||t>nowMs) continue;
    const dd=new Date(Date.UTC(+m[1],+m[2]-1,+m[3])); if(dd.getUTCMonth()!==+m[2]-1||dd.getUTCDate()!==+m[3]) continue; /* not a real date */
    const due=rel(+m[1],+m[2],+m[3],m[4]);
    let show, slot, at;
    if(t<=due){ show=due; slot=m[4]; at=due; }                       /* landed in time: shows when due */
    else { const [p,n]=around(t);
      if(t<=p.t+FF_LATE_MS){ show=t; slot=p.slot; at=p.t; }        /* within 3 hours of a release: shows as it lands */
      else { show=n.t; slot=n.slot; at=n.t; } }                     /* otherwise it waits for the next release */
    if(show<=nowMs&&(!best||e.id>best.id)) best={id:e.id,slot,at};
  }
  return best;
}
