import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
const r = await page.evaluate(()=>{ window.render(0.535);
  return ['ph1','ph2','ph3'].map(id=>{const e=document.getElementById(id);const cs=getComputedStyle(e);const r=e.getBoundingClientRect();
    return {id, clip:cs.clipPath, x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height), bg:cs.backgroundImage.slice(-30)};});
});
console.log(JSON.stringify(r,null,1));
// screenshot JUST the odo region cropped
await page.evaluate(()=>window.render(0.535)); await page.waitForTimeout(120);
await page.screenshot({path:'/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/c3be139d-c516-47c2-a8d3-42fb9aeac5b3/scratchpad/odo-crop.png', clip:{x:900,y:150,width:540,height:700}});
await b.close();
