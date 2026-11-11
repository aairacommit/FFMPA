/* FFMPA service worker: makes the app installable and keeps the last edition readable offline. */
const V="ffmpa-v1"; const SHELL=["/app/","/manifest.webmanifest","/assets/icon-192.png","/assets/icon-512.png"];
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
