import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
// render, then WAIT for two rafs + settle so compositor flushes; also disable will-change to kill ghost layers
await page.evaluate(()=>{ window.render(0.535);
  document.querySelectorAll('[style],.odo,.card,.scene,.morph').forEach(e=>e.style.willChange='auto');
});
await page.waitForTimeout(500);
await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
await page.screenshot({path:'/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/c3be139d-c516-47c2-a8d3-42fb9aeac5b3/scratchpad/odo-clean.png', clip:{x:900,y:150,width:540,height:700}});
// count actual painted cards by checking odo children
const r=await page.evaluate(()=>{const o=document.querySelectorAll('.odo').length;const num=document.querySelectorAll('.odo__num').length;const cap=document.querySelectorAll('.odo__cap').length;return {o,num,cap};});
console.log('DOM counts:',JSON.stringify(r));
await b.close();
