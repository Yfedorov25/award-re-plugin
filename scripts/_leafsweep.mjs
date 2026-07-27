import { resolveChromium } from './token-extractor.mjs';
import { readFileSync } from 'fs';
import { PNG } from 'pngjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:782}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
// load baseline
const base = PNG.sync.read(readFileSync('scripts/baselines/so3-nature-intro.png'));
function diff(shot){ const a=PNG.sync.read(shot); let d=0,t=0;
  const n=Math.min(a.data.length,base.data.length);
  for(let i=0;i<n;i+=4){ t++; const dr=Math.abs(a.data[i]-base.data[i])+Math.abs(a.data[i+1]-base.data[i+1])+Math.abs(a.data[i+2]-base.data[i+2]); if(dr>32)d++; }
  return (d/t*100); }
let best={off:'0 0',pct:100};
for(const ox of [-30,-20,-10,0,10,20,30]) for(const oy of [-40,-20,0,20,40]){
  await page.evaluate((o)=>{ document.getElementById('scNat').style.backgroundPosition=o; }, `calc(50% + ${ox}px) calc(50% + ${oy}px)`);
  await page.waitForTimeout(50);
  const shot=await page.screenshot();
  const p=diff(shot);
  if(p<best.pct) best={off:`${ox} ${oy}`,pct:+p.toFixed(2)};
}
console.log('best leaf offset:',best.off,'→ diff',best.pct+'%');
await b.close();
