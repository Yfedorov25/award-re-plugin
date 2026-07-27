import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const ctx = await b.newContext({viewport:{width:1440,height:900},bypassCSP:true});
const page = await ctx.newPage();
await page.route('**/*', r=>r.continue()); // no cache interference
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html?cb='+Math.floor(performance.now()),{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
await page.evaluate(()=>window.render(0.94));
await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
await page.waitForTimeout(300);
// report what scWater actually covers
const r=await page.evaluate(()=>{const w=document.getElementById('scWater');const cs=getComputedStyle(w);const rect=w.getBoundingClientRect();
  return {clip:cs.clipPath,bgSize:cs.backgroundSize,bgPos:cs.backgroundPosition,transform:cs.transform,rect:{y:Math.round(rect.top),h:Math.round(rect.height)}};});
console.log('scWater@0.94:',JSON.stringify(r));
await page.screenshot({path:'/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/c3be139d-c516-47c2-a8d3-42fb9aeac5b3/scratchpad/o9-clean.png'});
await b.close();
