import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
const o='/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/c3be139d-c516-47c2-a8d3-42fb9aeac5b3/scratchpad/ours100';
import('fs').then(fs=>fs.mkdirSync(o,{recursive:true}));
// 100 frames p=0..1. force odo videos to a frame for visibility.
for(let i=0;i<100;i++){ const p=i/99;
  await page.evaluate(pp=>window.render(pp),p);
  await page.evaluate(()=>{document.querySelectorAll('.scene video').forEach(v=>{try{v.currentTime=2;}catch(e){}});});
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  await page.waitForTimeout(30);
  await page.screenshot({path:`${o}/p_${String(i).padStart(3,'0')}.png`});
}
await b.close(); console.log('100 ours frames done');
