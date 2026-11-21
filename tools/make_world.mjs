// Builds src/world.js from Natural Earth 110m (public domain) via the world-atlas npm package.
// Usage: npm i world-atlas@2 topojson-client@3 && node tools/make_world.mjs src/world.js
import fs from 'fs';
import {feature} from 'topojson-client';
const topo=JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-110m.json'));
const fc=feature(topo, topo.objects.countries);
const r=v=>Math.round(v*2)/2; // half degree
let paths=[];
for(const f of fc.features){
  const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;
  let d='';
  for(const poly of polys){ for(const ring of poly){
    // split a ring where it jumps across the 180 degree line, so no band is drawn across the map
    let last=null, pieces=[], cur=[];
    for(const [x,y] of ring){ const p=[r(x),r(-y)]; if(last&&p[0]===last[0]&&p[1]===last[1]) continue;
      if(last&&Math.abs(p[0]-last[0])>180){ pieces.push(cur); cur=[]; } cur.push(p); last=p; }
    pieces.push(cur);
    const split=pieces.length>1;
    for(const pc of pieces){ if(pc.length<3) continue; d+=pc.map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join('')+(split?'':'Z'); }
  }}
  if(d) paths.push({id:f.id, n:f.properties.name, d});
}
const out='/* Natural Earth 110m country outlines (public domain, via world-atlas), equirectangular, x=lon y=-lat, half degree */\nconst WORLD='+JSON.stringify(paths.map(p=>[p.id||'',p.d]))+';\n';
fs.writeFileSync(process.argv[2], out);
console.log(paths.length, out.length);
