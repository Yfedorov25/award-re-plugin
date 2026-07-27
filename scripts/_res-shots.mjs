import { resolveChromium } from './token-extractor.mjs';
const OUT = process.argv[2];
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/atoms/residences-slab/build.html',{waitUntil:'networkidle',timeout:30000});
await page.waitForFunction(()=>window.__ATOM_OK__===true,{timeout:8000});
for(const p of [0.05,0.16,0.30,0.44,0.57,0.70,0.88]){
  await page.evaluate(pp=>window.render(pp), p);
  await page.waitForTimeout(250);
  await page.screenshot({path:`${OUT}/build-p${String(p).replace('.','')}.jpg`, quality:80, type:'jpeg'});
}
await b.close();
console.log('shots done');
