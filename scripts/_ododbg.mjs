import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
const r = await page.evaluate(()=>{ window.render(0.535);
  const odos=[...document.querySelectorAll('.odo')];
  const panels=[...document.querySelectorAll('.odo__panel')];
  const caps=[...document.querySelectorAll('.odo__cap')];
  return {
    numOdo:odos.length, numPanel:panels.length, numCap:caps.length,
    odoRects: odos.map(e=>{const r=e.getBoundingClientRect();return {x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height),tf:getComputedStyle(e).transform.slice(0,40),op:getComputedStyle(e).opacity};}),
    capRects: caps.map(e=>{const r=e.getBoundingClientRect();return {x:Math.round(r.left),y:Math.round(r.top),txt:e.textContent.slice(0,20)};}),
  };
});
console.log(JSON.stringify(r,null,1));
await b.close();
