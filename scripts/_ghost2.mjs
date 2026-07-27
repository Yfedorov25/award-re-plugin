import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
await page.evaluate(()=>window.render(0.94));
await page.waitForTimeout(200);
// the "ghost panel" is around x1180 y720 (lower-right, below main card). probe it + list ALL elements with EMBANKMENT text
const r=await page.evaluate(()=>{
  const els=[...document.querySelectorAll('*')].filter(e=>e.children.length===0 && /EMBANKMENT/i.test(e.textContent));
  const info=els.map(e=>{const rect=e.getBoundingClientRect();const cs=getComputedStyle(e);
    return {id:e.id||e.className, x:Math.round(rect.left),y:Math.round(rect.top),op:cs.opacity,vis:rect.width>0};});
  const hit=document.elementFromPoint(1180,720);
  return {embankmentEls:info, ghostPoint: hit?(hit.tagName+'#'+hit.id+'.'+hit.className):null};
});
console.log(JSON.stringify(r,null,1));
await b.close();
