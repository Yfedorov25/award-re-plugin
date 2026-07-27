import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
const d = await page.evaluate(()=> {
  // dig TL_END from closure isn't possible; instead reconstruct: find last tween end.
  // Expose via a temporary: we know CLK=100 and named ends; just report duration by scrubbing.
  return { note:'need TL_END exposed' };
});
console.log(d);
await b.close();
