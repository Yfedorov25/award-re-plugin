import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
const o='/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/c3be139d-c516-47c2-a8d3-42fb9aeac5b3/scratchpad/trans';
import('fs').then(fs=>fs.mkdirSync(o,{recursive:true}));
// Place→runners transition: p 0.70 to 0.82, 6 steps — is it smooth or hard-cut?
let i=0;
for(const p of [0.70,0.73,0.76,0.79,0.81,0.83]){
  await page.evaluate(pp=>window.render(pp),p); await page.waitForTimeout(80);
  await page.screenshot({path:`${o}/t_${i++}_p${p}.png`});
}
await b.close();
