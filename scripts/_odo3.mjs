import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
const o='/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/c3be139d-c516-47c2-a8d3-42fb9aeac5b3/scratchpad/odo3';
import('fs').then(fs=>fs.mkdirSync(o,{recursive:true}));
// odo3=0.88, odo9=0.93, odo16=0.965 — settle just after each
for(const [k,p] of Object.entries({o3:0.89, o9:0.94, o16:0.972})){
  await page.evaluate(pp=>window.render(pp),p); await page.waitForTimeout(150);
  await page.screenshot({path:`${o}/${k}.png`});
  // report odo state
  const st=await page.evaluate(()=>{const n=document.getElementById('odoNum').textContent;const c=document.getElementById('odoCap').textContent;
    const vis=['scLeaf','scWater','scCity'].filter(id=>{const cs=getComputedStyle(document.getElementById(id));return cs.opacity>0.5 && !/inset\((100|9\d)/.test(cs.clipPath);});
    return {num:n,cap:c.slice(0,30),bg:vis};});
  console.log(k,JSON.stringify(st));
}
await b.close();
