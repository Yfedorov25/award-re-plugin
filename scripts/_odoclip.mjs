import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
// scan clip states of bg scenes across the odometer window to find where '9' is SETTLED (water full, leaf gone)
for(const p of [0.90,0.92,0.94,0.95,0.96,0.97]){
  const r=await page.evaluate((pp)=>{window.render(pp);
    const g=(id)=>getComputedStyle(document.getElementById(id)).clipPath;
    return {p:pp, leaf:g('scLeaf'), water:g('scWater'), city:g('scCity'), num:document.getElementById('odoNum').textContent};
  },p);
  console.log(JSON.stringify(r));
}
await b.close();
