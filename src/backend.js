/* ================= Backend: Supabase (auth by email code, saved progress, reports, classes, admin) =================
   Plain fetch against Supabase Auth and PostgREST, no third-party script.
   Runs only on https://ffmpa.com style hosts. On file://, the claude.ai preview or with ?demo, the app keeps the
   on-device prototype so it can still be shown and tested offline. */
const SB={url:"https://gqfxgkzetapivlbybamf.supabase.co", key:"sb_publishable_JbpNbD2Q0mKlCqnslmKOSw_q5byg4gs"};
const SB_ON=(()=>{ try{ const h=location.hostname, q=new URLSearchParams(location.search);
  if(location.protocol!=="https:"||q.has("demo")||q.has("sample")) return false;
  return /(^|\.)ffmpa\.com$|\.pages\.dev$/.test(h); }catch(e){ return false; } })();
const AUTH_KEY="ffmpa-auth", ADMIN_AUTH_KEY="ffmpa-admin-auth";
const SYNC_RE=/^ffmpa-(settings|stats|words|finds|comfort|class|read-\d{4}-\d{2}-\d{2})$/;
const signedIn=()=>!!(SB_ON&&session&&session.uid);

/* ---------- low level ---------- */
const _refreshing={};
function saveTok(key,d){ const t={access_token:d.access_token, refresh_token:d.refresh_token, expires_at:d.expires_at||Math.floor(Date.now()/1000)+(d.expires_in||3600), email:(d.user&&d.user.email)||"", uid:(d.user&&d.user.id)||""}; const old=store.get(key,null); if(old&&!t.email){ t.email=old.email; t.uid=old.uid; } store.set(key,t); return t; }
async function accessToken(key){ let t=store.get(key,null); if(!t) return null;
  if(Date.now()/1000 < t.expires_at-90) return t.access_token;
  if(!_refreshing[key]) _refreshing[key]=(async()=>{ try{ const d=await sbFetch("/auth/v1/token?grant_type=refresh_token",{method:"POST",body:{refresh_token:t.refresh_token},auth:false}); return saveTok(key,d).access_token; }
    catch(e){ if(e.status===400||e.status===401||e.status===403) store.del(key); return null; } finally{ setTimeout(()=>{ delete _refreshing[key]; },0); } })();
  return _refreshing[key]; }
async function sbFetch(path,o){ o=o||{}; const h={apikey:SB.key,"Content-Type":"application/json"}; Object.assign(h,o.headers||{});
  if(o.auth!==false){ const tk=await accessToken(o.as||AUTH_KEY); if(tk) h.Authorization="Bearer "+tk; else if(o.need){ const e=new Error("signed out"); e.status=401; throw e; } }
  const r=await fetch(SB.url+path,{method:o.method||"GET",headers:h,body:o.body==null?undefined:JSON.stringify(o.body),keepalive:!!o.keepalive});
  const txt=await r.text(); let data=null; try{ data=txt?JSON.parse(txt):null; }catch(e){ data=txt; }
  if(!r.ok){ const e=new Error((data&&(data.msg||data.message||data.error_description||data.error))||("HTTP "+r.status)); e.status=r.status; e.data=data; throw e; }
  return data; }
const rpc=(fn,args,o)=>sbFetch("/rest/v1/rpc/"+fn,Object.assign({method:"POST",body:args||{},need:true},o||{}));
function friendly(e){ const m=String((e&&e.message)||"");
  if(e&&e.status===429||/rate|seconds/i.test(m)) return "Please wait a minute, then ask for a new code.";
  if(/expired|invalid|otp/i.test(m)) return "That code did not match or has expired. Check the latest email from FFMPA, or send a new code.";
  if(/Failed to fetch|NetworkError|load failed/i.test(m)) return "We could not reach FFMPA. Check your internet connection and try again.";
  return "Something went wrong. Please try again in a moment."; }

/* ---------- email code sign-in ---------- */
const sendCode=email=>sbFetch("/auth/v1/otp?redirect_to="+encodeURIComponent(location.origin+"/app/"),{method:"POST",auth:false,body:{email,create_user:true}});
/* The email also carries a sign-in link. If a grown-up taps it, Supabase sends them back here with the session in the address. */
async function sbHashLogin(){ const h=location.hash; if(!/access_token=|error_description=/.test(h)) return false; const q=new URLSearchParams(h.slice(1)); history.replaceState(null,"",location.pathname+location.search);
  if(!q.get("access_token")){ startWelcome("email"); setTimeout(()=>{ const e=$("#wErr"); if(e) e.textContent="That sign-in link has expired. Ask for a new code below."; },50); return true; }
  try{ const d={access_token:q.get("access_token"),refresh_token:q.get("refresh_token"),expires_in:+q.get("expires_in")||3600,expires_at:+q.get("expires_at")||0};
    const u=await fetch(SB.url+"/auth/v1/user",{headers:{apikey:SB.key,Authorization:"Bearer "+d.access_token}}).then(r=>r.json()); d.user=u; const tok=saveTok(AUTH_KEY,d);
    ob.email=tok.email; ob.tok=tok; const r=await afterSignIn(tok); if(r==="new") startWelcome("child"); }
  catch(e){ startWelcome("email"); }
  return true; }
/* Google Play reviewers cannot receive email codes, so one review address signs in with a password set by the owner in Supabase. */
const REVIEW_EMAIL="play-review@ffmpa.com";
async function passwordSignIn(email,pw){ const d=await sbFetch("/auth/v1/token?grant_type=password",{method:"POST",auth:false,body:{email,password:pw}}); return saveTok(AUTH_KEY,d); }
async function verifyCode(email,code,key){ const d=await sbFetch("/auth/v1/verify",{method:"POST",auth:false,body:{type:"email",email,token:code}}); return saveTok(key||AUTH_KEY,d); }

/* ---------- saved progress ---------- */
function snapshot(){ const read={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); const m=k&&k.match(/^ffmpa-read-(\d{4}-\d{2}-\d{2})$/); if(m) read[m[1]]=store.get(k,[]); }
  const keep=Object.keys(read).sort().slice(-5); const r2={}; keep.forEach(d=>r2[d]=read[d]);
  return {settings:store.get("ffmpa-settings",settings), progress:{stats:store.get("ffmpa-stats",null), words:store.get("ffmpa-words",[]), finds:store.get("ffmpa-finds",{}), comfort:store.get("ffmpa-comfort",null), klass:store.get("ffmpa-class",null), read:r2, v:1}}; }
function clearLocalProgress(){ const del=[]; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k&&(SYNC_RE.test(k)||k==="ffmpa-synced-at"||k==="ffmpa-headlines"||k==="ffmpa-reports")) del.push(k); } del.forEach(k=>store.del(k)); }
function applyRemote(p){ clearLocalProgress(); _sset("ffmpa-settings",Object.assign({},DEFAULT_SETTINGS,p.settings||{})); const g=p.progress||{};
  if(g.stats) _sset("ffmpa-stats",g.stats); if(g.words) _sset("ffmpa-words",g.words); if(g.finds) _sset("ffmpa-finds",g.finds); if(g.comfort) _sset("ffmpa-comfort",g.comfort); if(g.klass) _sset("ffmpa-class",g.klass);
  Object.entries(g.read||{}).forEach(([d,ids])=>_sset("ffmpa-read-"+d,ids)); _sset("ffmpa-synced-at",p.updated_at||new Date().toISOString()); }
let _syncT=null, _syncing=false, _dirty=false;
function queueSync(){ _dirty=true; clearTimeout(_syncT); _syncT=setTimeout(pushProfile,3500); }
async function pushProfile(keepalive){ if(!signedIn()||!_dirty) return; if(_syncing){ queueSync(); return; } _syncing=true; _dirty=false;
  try{ const s=snapshot(); const r=await sbFetch("/rest/v1/profiles?id=eq."+session.uid,{method:"PATCH",body:s,headers:{Prefer:"return=representation"},need:true,keepalive:!!keepalive});
    if(r&&r[0]) _sset("ffmpa-synced-at",r[0].updated_at); }
  catch(e){ _dirty=true; if(e.status===401){ sbSignedOut(); } } finally{ _syncing=false; } }
const _sset=store.set, _sdel=store.del;
store.set=function(k,v){ _sset(k,v); if(SYNC_RE.test(k)&&signedIn()) queueSync(); };
store.del=function(k){ _sdel(k); if(SYNC_RE.test(k)&&signedIn()) queueSync(); };
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="hidden"&&_dirty){ clearTimeout(_syncT); pushProfile(true); } });

/* After the code is checked: returning family restores everything, new family continues to the child steps. */
async function afterSignIn(tok){ const prev=store.get("ffmpa-session",null);
  const rows=await sbFetch("/rest/v1/profiles?select=settings,progress,consent_at,updated_at&id=eq."+tok.uid,{need:true});
  const p=rows&&rows[0];
  if(p&&p.consent_at){ applyRemote(p); _sset("ffmpa-session",{email:tok.email,uid:tok.uid}); location.reload(); return "done"; }
  /* keep this device's progress only if it belongs to the same email (people who used the early preview) */
  if(!(prev&&prev.email&&prev.email.toLowerCase()===tok.email.toLowerCase())) clearLocalProgress();
  return "new"; }
async function createProfile(){ const s=snapshot(); s.id=session.uid; s.consent_at=new Date().toISOString();
  await sbFetch("/rest/v1/profiles",{method:"POST",body:s,headers:{Prefer:"resolution=merge-duplicates,return=minimal"},need:true}); _sset("ffmpa-synced-at",new Date().toISOString()); }
function sbSignedOut(){ store.del(AUTH_KEY); if(session&&session.uid){ session=null; _sdel("ffmpa-session"); startWelcome("email"); } }
async function sbSignOut(){ await pushOff(); _sdel("ffmpa-alert-asked"); try{ await pushProfile(); await sbFetch("/auth/v1/logout",{method:"POST",need:true}); }catch(e){} _sdel(AUTH_KEY); clearLocalProgress(); }

/* Boot: refresh from the cloud if another device saved newer progress; load shared admin settings. */
async function sbBoot(){ if(!SB_ON) return;
  loadPublicConfig();
  if(await sbHashLogin()) return;
  if(!signedIn()) return;
  try{ const tk=await accessToken(AUTH_KEY); if(!tk){ sbSignedOut(); return; }
    const rows=await sbFetch("/rest/v1/profiles?select=settings,progress,consent_at,updated_at&id=eq."+session.uid,{need:true}); const p=rows&&rows[0];
    if(!p){ await createProfile(); return; }
    const mine=store.get("ffmpa-synced-at","");
    if(p.updated_at&&(!mine||p.updated_at>mine)&&!sessionStorage.getItem("ffmpa-pulled")){ sessionStorage.setItem("ffmpa-pulled","1"); applyRemote(p); location.reload(); return; }
    if(klass&&!klass.id){ klass=null; _sdel("ffmpa-class"); }
    classTick(); pushTzRefresh();
  }catch(e){ if(e.status===401) sbSignedOut(); } }

/* ---------- shared admin settings ---------- */
function mergeAdmin(v){ ADMIN=Object.assign({},ADMIN_DEFAULT,v||{}); ADMIN.countries=Object.assign({},ADMIN_DEFAULT.countries,ADMIN.countries||{}); delete ADMIN.countries.CN; ADMIN.plan=Object.assign({},ADMIN_DEFAULT.plan,ADMIN.plan||{}); }
async function loadPublicConfig(){ try{ const r=await sbFetch("/rest/v1/app_config?select=value,updated_at&key=eq.admin",{auth:false}); if(r&&r[0]){ const before=JSON.stringify(ADMIN); mergeAdmin(r[0].value); _sset("ffmpa-admin",ADMIN); if(JSON.stringify(ADMIN)!==before){ if($("#adminView").classList.contains("open")) renderAdmin(); else if(session&&!$("#welcomeOv").classList.contains("open")) renderAll(); if(typeof loadLiveEdition==="function") loadLiveEdition({background:true}); } } }catch(e){} }
let _admT=null;
function pushAdminConfig(){ if(!SB_ON) return; clearTimeout(_admT); _admT=setTimeout(async()=>{ try{ await sbFetch("/rest/v1/app_config",{method:"POST",as:ADMIN_AUTH_KEY,need:true,body:{key:"admin",value:ADMIN},headers:{Prefer:"resolution=merge-duplicates,return=minimal"}}); admNote("Saved for every family."); }catch(e){ admNote("Could not save: "+(e.status===401?"please sign in again.":friendly(e)),true); } },900); }
function admNote(t,bad){ const n=$("#admSync"); if(n){ n.textContent=t; n.style.color=bad?"#FFD2C2":""; } }

/* ---------- admin sign-in ---------- */
let admIsAdmin=false, admStep={s:"email",email:""};
const _openAdmin0=openAdmin;
openAdmin=async function(){ if(!SB_ON){ _openAdmin0(); return; }
  const v=$("#adminView"); v.classList.add("open");
  const t=store.get(ADMIN_AUTH_KEY,null);
  if(t&&admIsAdmin){ _openAdmin0(); return; }
  if(t){ v.innerHTML=`<div class="admgate"><p>Checking your admin access…</p></div>`; try{ admIsAdmin=await rpc("is_admin",{}, {as:ADMIN_AUTH_KEY}); }catch(e){ admIsAdmin=false; }
    if(admIsAdmin){ _openAdmin0(); return; } store.del(ADMIN_AUTH_KEY); admStep={s:"email",email:"",msg:"That email is not an FFMPA admin."}; }
  renderAdmGate(); };
function renderAdmGate(){ const v=$("#adminView"); const s=admStep;
  v.innerHTML=`<div class="admgate"><div class="admcard"><b class="admlogo">FFMPA Admin</b>${s.s==="email"?`<h1>Sign in</h1><p>Admins sign in with a one-time code sent to their email. There is no password.</p>
      <form id="agF" novalidate><label class="field" for="agE">Admin email<input type="email" id="agE" autocomplete="email" value="${esc(s.email)}"></label><button class="btn sun press" type="submit">Email me a code</button></form>`
    :`<h1>Check your inbox</h1><p>We sent a 6-digit code to <b>${esc(s.email)}</b>.</p>
      <form id="agF" novalidate><label class="field" for="agC">Code<input class="codein" id="agC" inputmode="numeric" autocomplete="one-time-code" maxlength="6"></label><button class="btn sun press" type="submit">Sign in</button></form><button class="linkbtn" id="agB">Use a different email</button>`}
    <p class="err" id="agM" aria-live="polite">${esc(s.msg||"")}</p><a href="#" id="agX">Back to the app ›</a></div></div>`;
  $("#agX").onclick=e=>{ e.preventDefault(); history.replaceState(null,"",location.pathname+location.search); closeAdmin(); renderAll(); };
  const b=$("#agB"); if(b) b.onclick=()=>{ admStep={s:"email",email:s.email}; renderAdmGate(); };
  $("#agF").onsubmit=async e=>{ e.preventDefault(); const m=$("#agM"), btn=e.target.querySelector("button"); btn.disabled=true; m.textContent="";
    try{ if(s.s==="email"){ const em=$("#agE").value.trim().toLowerCase(); if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)){ m.textContent="Enter a valid email."; btn.disabled=false; return; } await sendCode(em); admStep={s:"code",email:em}; renderAdmGate(); $("#agC").focus(); }
      else { const c=$("#agC").value.replace(/\D/g,""); if(c.length!==6){ m.textContent="The code has 6 digits."; btn.disabled=false; return; } await verifyCode(s.email,c,ADMIN_AUTH_KEY); admIsAdmin=false; openAdmin(); } }
    catch(err){ m.textContent=friendly(err); btn.disabled=false; } };
  const f=v.querySelector("input"); if(f) f.focus(); }
async function admSignOut(){ try{ await sbFetch("/auth/v1/logout",{method:"POST",as:ADMIN_AUTH_KEY,need:true}); }catch(e){} store.del(ADMIN_AUTH_KEY); admIsAdmin=false; admStep={s:"email",email:""}; renderAdmGate(); }
function admHeaderNote(){ if(!SB_ON) return "Founderfreedom Ventures LLP · prototype, changes apply to this browser only"; const t=store.get(ADMIN_AUTH_KEY,{}); return `Signed in as ${esc(t.email||"")} · <span id="admSync">changes apply to every family</span> · <a href="#" id="admOut" style="color:inherit">Sign out</a>`; }
const _renderAdmin0=renderAdmin;
renderAdmin=function(){ _renderAdmin0(); const o=$("#admOut"); if(o) o.onclick=e=>{ e.preventDefault(); admSignOut(); };
  if(SB_ON&&admSection==="dashboard"){ const m=$("#admMain"); if(!m) return; const p=document.createElement("div"); p.className="panel"; p.innerHTML=`<h2>Families and classes (live)</h2><div class="kpis" id="admLive"><div class="kpi"><b>…</b><span>Loading</span></div></div>`; const h=m.querySelector(".kpis"); if(h) h.after(p); else m.prepend(p);
    rpc("admin_overview",{}, {as:ADMIN_AUTH_KEY}).then(r=>{ const x=(r&&r[0])||{}; const el=$("#admLive"); if(el) el.innerHTML=[["families","Family accounts"],["signed_in_7d","Signed in, last 7 days"],["reports_waiting","Young reporter reports waiting"],["classes","Classes"],["pupils","Pupils in classes"],["alert_devices","Devices with edition alerts"]].map(([k,l])=>`<div class="kpi"><b>${x[k]==null?"·":x[k]}</b><span>${l}</span></div>`).join(""); }).catch(()=>{ const el=$("#admLive"); if(el) el.innerHTML=`<p class="note">Could not load live numbers. Sign out and in again.</p>`; }); } };

/* ---------- Young reporters ---------- */
const mapReport=r=>({id:r.id,w:r.week,h:r.headline,b:r.body||"",status:r.status,age:r.age_band,country:r.country,at:r.created_at});
async function myReports(){ const w=mondayOf(TODAY()); const r=await sbFetch("/rest/v1/reports?select=id,week,headline,body,status,age_band,country,created_at&week=eq."+w+"&order=created_at.asc",{need:true}); return (r||[]).map(mapReport); }
async function publicReports(){ try{ return (await rpc("get_public_reports",{p_week:mondayOf(TODAY())},{need:false}))||[]; }catch(e){ return []; } }
async function sendReport(h,b){ await sbFetch("/rest/v1/reports",{method:"POST",need:true,headers:{Prefer:"return=minimal"},body:{week:mondayOf(TODAY()),headline:h,body:b,age_band:settings.age==="x"||settings.age==="n"?settings.age:"o",country:settings.country}}); }
function reportError(e){ const m=String(e&&e.message||""); if(/five reports/i.test(m)) return "That is five reports this week, the most you can send. Try again next Monday."; if(/links|phone/i.test(m)) return "Please take out phone numbers, emails and web addresses."; return friendly(e); }
const ageName=a=>a==="x"?"Explorer":a==="n"?"Navigator":"Thinker";
const ctyName=c=>COUNTRIES[c]?COUNTRIES[c].name:c;
async function loadAdminReports(){ const el=$("#yrAdm"); if(!el) return; try{ const since=isoOf(Date.now()-35*DAY);
    const r=(await sbFetch("/rest/v1/reports?select=id,week,headline,body,status,age_band,country,created_at&created_at=gte."+since+"&order=created_at.desc&limit=200",{as:ADMIN_AUTH_KEY,need:true})||[]).map(mapReport);
    const lab={pending:"Waiting",approved:"Approved",rejected:"Declined"}; const order={pending:0,approved:1,rejected:2}; r.sort((a,b)=>order[a.status]-order[b.status]);
    el.innerHTML=r.length?`<div class="tablewrap"><table class="adm-table"><thead><tr><th>Report</th><th>From</th><th>Week</th><th>Status</th><th></th></tr></thead><tbody>${r.map(x=>`<tr><td><b>${esc(x.h)}</b>${x.b?`<br><span style="color:var(--muted)">${esc(x.b)}</span>`:""}</td><td>${ageName(x.age)}, ${esc(ctyName(x.country))}</td><td>${shortDate(x.w)}</td><td>${lab[x.status]}</td><td style="white-space:nowrap">${x.status!=="approved"?`<button class="btn ghost press" data-yrs="${x.id}:approved">Approve</button>`:""} ${x.status!=="rejected"?`<button class="btn ghost press" data-yrs="${x.id}:rejected">Decline</button>`:""}</td></tr>`).join("")}</tbody></table></div>`:`<p class="note">No reports in the last five weeks.</p>`; }
  catch(e){ el.innerHTML=`<p class="note">Could not load reports (${esc(friendly(e))}).</p>`; } }
document.addEventListener("click",async e=>{ const b=e.target.closest("[data-yrs]"); if(!b) return; const [id,st]=b.dataset.yrs.split(":"); b.disabled=true;
  try{ await sbFetch("/rest/v1/reports?id=eq."+id,{method:"PATCH",as:ADMIN_AUTH_KEY,need:true,headers:{Prefer:"return=minimal"},body:{status:st,reviewed_at:new Date().toISOString()}}); loadAdminReports(); }catch(err){ b.disabled=false; alertAdm(friendly(err)); } });
function alertAdm(t){ admNote(t,true); }

/* ---------- Classroom ---------- */
async function createClass(name,level){ for(let i=0;i<5;i++){ const code=newCode(); try{ const r=await sbFetch("/rest/v1/classes?select=id,code,name,level",{method:"POST",need:true,headers:{Prefer:"return=representation"},body:{code,name,level}}); const c=r[0]; return {role:"teacher",id:c.id,code:c.code,name:c.name,level:c.level}; }catch(e){ if(e.status!==409) throw e; } } throw new Error("Could not make a class code. Try again."); }
async function joinClass(code){ const r=await rpc("join_class",{p_code:code}); const c=r&&r[0]; if(!c) return null; return {role:"pupil",id:c.id,code,name:c.name,level:c.level}; }
async function leaveClass(k){ try{ if(k.role==="teacher") await sbFetch("/rest/v1/classes?id=eq."+k.id,{method:"DELETE",need:true}); else await rpc("leave_class",{p_class:k.id}); }catch(e){} }
const classSummary=k=>rpc("class_summary",{p_class:k.id,p_week:mondayOf(TODAY())}).then(r=>r&&r[0]);
const classGoal=k=>rpc("class_goal",{p_class:k.id,p_week:mondayOf(TODAY())}).then(r=>r&&r[0]);
/* weekly totals for the class (only sent while the child is in a class) */
function wkStats(){ const w=mondayOf(TODAY()); if(!STATS.wk||STATS.wk.w!==w) STATS.wk={w,reads:0,right:0,total:0}; return STATS.wk; }
let _clT=null;
function classTick(){ if(!signedIn()||!klass||klass.role!=="pupil"||!klass.id) return; clearTimeout(_clT); _clT=setTimeout(()=>{ const s=wkStats(); rpc("class_report",{p_week:s.w,p_reads:s.reads,p_right:s.right,p_total:s.total}).catch(()=>{}); },5000); }
const _recordRead0=recordRead; recordRead=function(s){ const k=wkStats(); k.reads++; _recordRead0(s); classTick(); };
const _statQ0=statQ; statQ=function(ok){ const k=wkStats(); k.total++; if(ok) k.right++; _statQ0(ok); classTick(); };

/* ---------- account: download and delete ---------- */
function acctHTML(){ if(!signedIn()) return ""; return `<div class="set"><h3>Your account</h3><p class="note">Your family's settings and reading progress are saved to your account so they follow you to any device. We never store your child's photo, birthday or school.</p>
  <h4 class="h4" style="margin:14px 0 6px">Edition alerts</h4><div id="alBox"><p class="note">Checking…</p></div>
  <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn ghost press" id="acDl" type="button">Download my data</button><button class="btn ghost press" id="acDel" type="button" style="color:#B42318">Delete account</button></div><p class="msg" id="acM" aria-live="polite"></p></div>`; }
function wireAcct(){ const dl=$("#acDl"), del=$("#acDel"); if(!dl) return; renderAlerts();
  dl.onclick=async()=>{ try{ const [p,r]=await Promise.all([sbFetch("/rest/v1/profiles?select=*&id=eq."+session.uid,{need:true}),sbFetch("/rest/v1/reports?select=week,headline,body,status,age_band,country,created_at",{need:true})]);
    const blob=new Blob([JSON.stringify({account:session.email,profile:p&&p[0],reports:r},null,2)],{type:"application/json"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="ffmpa-my-data.json"; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),4000); }catch(e){ $("#acM").textContent=friendly(e); } };
  del.onclick=()=>{ $("#acM").innerHTML=`This deletes your account, your child's progress, reports and classes for good. <button class="btn press" id="acYes" type="button" style="background:#B42318;color:#fff;margin-top:8px">Yes, delete everything</button>`;
    $("#acYes").onclick=async()=>{ $("#acYes").disabled=true; try{ await pushOff(); await rpc("delete_my_account",{}); _sdel(AUTH_KEY); clearLocalProgress(); _sdel("ffmpa-session"); session=null; klass=null; closeSheet(); startWelcome("email"); }catch(e){ $("#acM").textContent=friendly(e); } }; }; }

/* ---------- edition alerts (web push) ---------- */
const pushOK=()=>SB_ON&&"serviceWorker" in navigator&&"PushManager" in window&&"Notification" in window;
/* isIOS() is defined in bigs.js (install help) */
const u8=s=>{ const b=atob((s+"=".repeat((4-s.length%4)%4)).replace(/-/g,"+").replace(/_/g,"/")); return Uint8Array.from(b,c=>c.charCodeAt(0)); };
function ffTz(){ try{ const z=Intl.DateTimeFormat().resolvedOptions().timeZone; return z&&ffValidTz(z)?z:"Asia/Kolkata"; }catch(e){ return "Asia/Kolkata"; } }
async function sbEditionLog(){ /* when each edition first appeared (written by the Cloud Run newsroom); public */
  try{ const r=await Promise.race([sbFetch("/rest/v1/app_config?select=value&key=eq.edition_log",{auth:false}),new Promise((_,j)=>setTimeout(()=>j(new Error("slow")),5000))]);
    return r&&r[0]&&Array.isArray(r[0].value)?r[0].value:null; }catch(e){ return null; } }
async function vapidKey(){ const r=await sbFetch("/rest/v1/app_config?select=value&key=eq.vapid_public",{auth:false}); return r&&r[0]&&r[0].value; }
async function pushReg(){ return (await navigator.serviceWorker.getRegistration("/"))||(await navigator.serviceWorker.register("/sw.js",{scope:"/"})); }
async function pushState(){ if(!pushOK()) return isIOS()?"ios":"unsupported"; if(Notification.permission==="denied") return "blocked";
  try{ const reg=await navigator.serviceWorker.getRegistration("/"); const sub=reg&&await reg.pushManager.getSubscription(); return sub&&Notification.permission==="granted"?"on":"off"; }catch(e){ return "off"; } }
async function pushOn(){ const key=await vapidKey(); if(!key) throw new Error("Alerts are being set up. Try again in a few minutes.");
  const perm=await Notification.requestPermission(); if(perm!=="granted") return "blocked";
  const reg=await pushReg(); await navigator.serviceWorker.ready; let sub=await reg.pushManager.getSubscription();
  const want=u8(key); const same=sub&&sub.options&&sub.options.applicationServerKey&&new Uint8Array(sub.options.applicationServerKey).join()===want.join();
  if(sub&&!same){ await sub.unsubscribe(); sub=null; }
  if(!sub) sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:want});
  const j=sub.toJSON(); await rpc("save_push",{p_endpoint:j.endpoint,p_p256dh:j.keys.p256dh,p_auth:j.keys.auth,p_country:settings.country,p_tz:ffTz()}); store.set("ffmpa-push-tz",ffTz()); return "on"; }
async function pushTzRefresh(){ /* alerts follow the device's time zone; update it if the family has travelled or moved */
  try{ if(!pushOK()||Notification.permission!=="granted"||store.get("ffmpa-push-tz","")===ffTz()) return;
    const reg=await navigator.serviceWorker.getRegistration("/"); const sub=reg&&await reg.pushManager.getSubscription(); if(!sub) return;
    const j=sub.toJSON(); await rpc("save_push",{p_endpoint:j.endpoint,p_p256dh:j.keys.p256dh,p_auth:j.keys.auth,p_country:settings.country,p_tz:ffTz()}); store.set("ffmpa-push-tz",ffTz()); }catch(e){} }
async function pushOff(){ try{ const reg=await navigator.serviceWorker.getRegistration("/"); const sub=reg&&await reg.pushManager.getSubscription(); if(sub){ try{ if(signedIn()) await rpc("drop_push",{p_endpoint:sub.endpoint}); }catch(e){} await sub.unsubscribe(); } }catch(e){} return "off"; }
const ALERT_TXT={on:"On. You get one alert when each edition is ready, morning and evening.",off:"Off. Get one alert when each edition is ready, morning and evening.",blocked:"Blocked in this browser's settings. Allow notifications for ffmpa.com, then try again.",ios:"On iPhone and iPad, first add FFMPA to your Home Screen (Share, then Add to Home Screen), open it from there, then turn alerts on here.",unsupported:"This browser cannot show alerts. Try Chrome, or install the app."};
async function renderAlerts(){ const box=$("#alBox"); if(!box) return; const st=await pushState();
  box.innerHTML=`<p class="note" style="margin:0 0 8px">${ALERT_TXT[st]}</p>${st==="on"?`<button class="btn ghost press" id="alOff" type="button">Turn off alerts</button>`:st==="off"?`<button class="btn sun press" id="alOn" type="button">Turn on edition alerts</button>`:""}`;
  const on=$("#alOn"), off=$("#alOff");
  if(on) on.onclick=async()=>{ on.disabled=true; try{ await pushOn(); }catch(e){ box.insertAdjacentHTML("beforeend",`<p class="msg">${esc(e.message&&/set up/.test(e.message)?e.message:friendly(e))}</p>`); } renderAlerts(); };
  if(off) off.onclick=async()=>{ off.disabled=true; await pushOff(); renderAlerts(); }; }
/* one gentle offer, the first time a child reaches the end of an edition */
const _recordEnd0=recordEnd; recordEnd=function(){ _recordEnd0(); if(!signedIn()||store.get("ffmpa-alert-asked",false)) return;
  pushState().then(st=>{ if(st!=="off"&&st!=="ios") return; _sset("ffmpa-alert-asked",true);
    setTimeout(()=>openSheet(`<span class="ttype" style="background:#EDE7FF;color:#4B21A6">New</span><h2 id="shTitle" style="margin-top:8px">Know when the <em class="v">next edition</em> lands</h2><p class="sub">One alert in the morning and one in the evening, only when fresh stories are ready. Nothing else, ever.</p>
      <button class="btn sun press" id="alAsk" style="width:100%">Ask a grown-up to turn it on</button><button class="lk press" id="alNo" style="margin-top:12px">Not now</button>`,
      ()=>{ $("#alNo").onclick=closeSheet; $("#alAsk").onclick=()=>askPin(()=>{ openSheet(`<h2 id="shTitle">Edition <em class="v">alerts</em></h2><div id="alBox"></div>`,()=>renderAlerts()); }); }),1400); }); };
