#!/usr/bin/env node
/* ============================================================================
   download-assets.mjs — pull the REAL full-res webp the live DOM resolves
   (REPLICA-SYSTEM-PLAN step 3). Kills the #1 root cause: substitute photos.

   Reads spec/assets-manifest.json (the currentSrc URLs the scraper captured on
   live) and downloads each into the section media/ under a clean local name
   derived from the URL basename. Writes spec/asset-map.json mapping
   live-basename → local file, so element-gate can assert src==live and apply-spec
   can wire the right file.

   Usage: node scripts/download-assets.mjs [--media <dir>]
   Default media dir: library/techniques/suborganisms/SO-3-nature-place/media
============================================================================ */
import { readFileSync, writeFileSync, existsSync, createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';
import https from 'node:https';

function arg(n,d){ const i=process.argv.indexOf('--'+n); return i>-1?process.argv[i+1]:d; }
const mediaDir = arg('media', join(process.cwd(),'library/techniques/suborganisms/SO-3-nature-place/media'));
const specDir  = join(process.cwd(),'spec');
mkdirSync(mediaDir,{recursive:true});

const manifestPath = join(specDir,'assets-manifest.json');
if(!existsSync(manifestPath)){ console.error('no spec/assets-manifest.json — run spec-scraper.mjs first'); process.exit(2); }
const urls = JSON.parse(readFileSync(manifestPath,'utf8'));

// clean local name: last path segment, URL-decoded, keep webp
function localName(u){
  let base = decodeURIComponent(u.split('/').pop().split('?')[0]);
  base = base.replace(/%40/gi,'@').replace(/[^\w.@-]/g,'_');
  return base;
}
function fetch(u,dest){
  return new Promise((res)=>{
    const f=createWriteStream(dest);
    https.get(u,{headers:{'User-Agent':'Mozilla/5.0'}},(r)=>{
      if(r.statusCode>=300&&r.statusCode<400&&r.headers.location){ f.close(); return fetch(r.headers.location,dest).then(res); }
      if(r.statusCode!==200){ f.close(); return res({ok:false,code:r.statusCode}); }
      r.pipe(f); f.on('finish',()=>{ f.close(()=>res({ok:true})); });
    }).on('error',(e)=>{ f.close(); res({ok:false,err:e.message}); });
  });
}

const map={}; let ok=0, fail=0;
for(const u of urls){
  const name=localName(u); const dest=join(mediaDir,name);
  const r=await fetch(u,dest);
  if(r.ok){ ok++; map[name]=u; console.log('  ✓',name); }
  else { fail++; console.log('  ✗',name,r.code||r.err); }
}
writeFileSync(join(specDir,'asset-map.json'), JSON.stringify(map,null,1));
console.log(`\n${fail===0?'✅':'⚠️'} downloaded ${ok}/${urls.length} real assets → ${mediaDir}`);
console.log('   asset-map.json written (live-basename → local file). Substitutes now replaceable.');
process.exit(fail>0?1:0);
