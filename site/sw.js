/* FFMPA service worker: makes the app installable and keeps the last edition readable offline. */
const V="ffmpa-v2"; const SHELL=["/app/","/manifest.webmanifest","/assets/icon-192.png","/assets/icon-512.png"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  const u=new URL(r.url);
  if(u.hostname.includes("google-analytics")||u.hostname.includes("googletagmanager")) return;
  const fresh=r.mode==="navigate"||u.pathname.endsWith(".json")||u.hostname==="raw.githubusercontent.com";
  if(fresh){ e.respondWith(fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(V).then(c=>c.put(r,cp)); } return res; }).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match("/app/")))); return; }
  if(u.origin===location.origin||u.hostname.endsWith("gstatic.com")||u.hostname.endsWith("googleapis.com")){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{ if(res.ok||res.type==="opaque"){ const cp=res.clone(); caches.open(V).then(c=>c.put(r,cp)); } return res; })));
  }
});
/* Edition alerts: the push carries no data; we read the newest edition to write the message. */
const EDITION="https://raw.githubusercontent.com/aairacommit/FFMPA/main/editions/latest.json";
self.addEventListener("push",e=>{ e.waitUntil((async()=>{
  let t="Today's news is ready", b="Fresh stories, checked by an editor. Tap to read.";
  try{ const d=await fetch(EDITION+"?h="+Date.now(),{cache:"no-store"}).then(r=>r.json()); const n=(d.stories||[]).length; const top=(d.stories||[])[0];
    t=d.edition==="pm"?"Your evening edition is ready":"Your morning edition is ready";
    b=n+" new stories, checked by an editor."+(top?" First up: "+((top.o&&top.o.t)||top.t||""):""); }catch(_){}
  await self.registration.showNotification(t,{body:b,icon:"/assets/icon-192.png",badge:"/assets/badge-96.png",tag:"ffmpa-edition",renotify:true,data:{url:"/app/?source=alert"}});
})()); });
self.addEventListener("notificationclick",e=>{ e.notification.close(); const url=(e.notification.data&&e.notification.data.url)||"/app/";
  e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(ws=>{ for(const w of ws){ if(new URL(w.url).pathname.startsWith("/app")){ w.navigate(url).catch(()=>{}); return w.focus(); } } return clients.openWindow(url); })); });
