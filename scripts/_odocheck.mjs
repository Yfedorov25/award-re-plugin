import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
const outdir='/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/c3be139d-c516-47c2-a8d3-42fb9aeac5b3/scratchpad/render-static';
import('fs').then(fs=>fs.mkdirSync(outdir,{recursive:true}));
// static render at exact beat progresses (no scroll-record double-exposure)
const beats={ 'odo3':0.53, 'odo9':0.61, 'odo16':0.69, 'place':0.335, 'runners':0.45, 'slider':0.25, 'terrace':0.185, 'location':0.82, 'nature':0.06 };
for(const [k,p] of Object.entries(beats)){
  await page.evaluate(pp=>window.render(pp), p);
  await page.waitForTimeout(120);
  await page.screenshot({path:`${outdir}/r_${k}_p${p}.png`});
}
// also probe odo ph clip states at odo3
const st = await page.evaluate(()=>{ window.render(0.53);
  return ['ph1','ph2','ph3'].map(id=>({id,clip:getComputedStyle(document.getElementById(id)).clipPath}));});
console.log('odo3 ph states:',JSON.stringify(st));
await b.close();
console.log('static renders in',outdir);
