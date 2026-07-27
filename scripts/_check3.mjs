import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
const o='/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/c3be139d-c516-47c2-a8d3-42fb9aeac5b3/scratchpad/check3';
import('fs').then(fs=>fs.mkdirSync(o,{recursive:true}));
for(const [k,p] of Object.entries({nature:0.10, enjoy:0.33, terrace:0.40, slide2:0.58})){
  await page.evaluate(pp=>window.render(pp),p); await page.waitForTimeout(120);
  await page.screenshot({path:`${o}/${k}.png`});
}
await b.close();
