import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
const o='/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/c3be139d-c516-47c2-a8d3-42fb9aeac5b3/scratchpad/beats-final';
import('fs').then(fs=>fs.mkdirSync(o,{recursive:true}));
// static settled progress for each beat (mid of each beat's hold)
const B={ N0_nature:0.06, N1_enjoy:0.14, N2_terrace:0.195, N3_slide1:0.235, N3_slide2:0.27, N3_slide3:0.295,
  M_place:0.355, P1_runners:0.46, P2a_odo3:0.535, P2b_odo9:0.61, P2c_odo16:0.69, L_location:0.83 };
for(const [k,p] of Object.entries(B)){
  await page.evaluate(pp=>window.render(pp),p); await page.waitForTimeout(130);
  await page.screenshot({path:`${o}/${k}.png`});
}
await b.close(); console.log('final beat renders in',o, Object.keys(B).length);
