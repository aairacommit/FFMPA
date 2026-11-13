/* FFMPA service worker: makes the app installable and keeps the last edition readable offline. */
const V="ffmpa-v3"; const SHELL=["/app/","/manifest.webmanifest","/assets/icon-192.png","/assets/icon-512.png"];
self.addEventListener("install",e=>{ e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener("activate",e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener("fetch",e=>{
  const r=e.request; if(r.method!=="GET") return;
  const u=new URL(r.url);
  if(u.hostname.includes("google-analytics")||u.hostname.includes("googletagmanager")) return;
  const fresh=r.mode==="navigate"||u.pathname.endsWith(".json")||u.hostname==="raw.githubusercontent.com";
  /* edition files are stored under their plain address (no ?h=), and only the three newest edition files are kept */
  const gh=u.hostname==="raw.githubusercontent.com", key=gh?u.origin+u.pathname:r;
  const ED=/\/editions\/\d{4}-\d{2}-\d{2}-(am|pm)\.json$/;
  const keep=c=>gh&&ED.test(u.pathname)?c.keys().then(ks=>{ const eds=ks.filter(k=>ED.test(new URL(k.url).pathname)).sort((a,b)=>a.url<b.url?-1:1);
    return Promise.all(eds.slice(0,-3).filter(k=>new URL(k.url).pathname!==u.pathname).map(k=>c.delete(k))); }):null;
  if(fresh){ e.respondWith(fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(V).then(c=>c.put(key,cp).then(()=>keep(c))); } return res; }).catch(()=>caches.match(key,{ignoreSearch:true}).then(m=>m||(gh?Response.error():caches.match("/app/"))))); return; }
  if(u.origin===location.origin||u.hostname.endsWith("gstatic.com")||u.hostname.endsWith("googleapis.com")){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{ if(res.ok||res.type==="opaque"){ const cp=res.clone(); caches.open(V).then(c=>c.put(r,cp)); } return res; })));
  }
});
/* Edition alerts: the push carries no data. Alerts arrive on the family's own clock (6 am and 7 pm),
   so the wording follows the local time rather than the newest file, which may not be released here yet. */
self.addEventListener("push",e=>{ e.waitUntil((async()=>{
  const h=new Date().getHours(); const pm=h>=16||h<4;
  const t=pm?"Your evening edition is ready":"Your morning edition is ready", b="Fresh stories, checked before they were published. Tap to read.";
  await self.registration.showNotification(t,{body:b,icon:"/assets/icon-192.png",badge:"/assets/badge-96.png",tag:"ffmpa-edition",renotify:true,data:{url:"/app/?source=alert"}});
})()); });
self.addEventListener("notificationclick",e=>{ e.notification.close(); const url=(e.notification.data&&e.notification.data.url)||"/app/";
  e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(ws=>{ for(const w of ws){ if(new URL(w.url).pathname.startsWith("/app")){ w.navigate(url).catch(()=>{}); return w.focus(); } } return clients.openWindow(url); })); });
