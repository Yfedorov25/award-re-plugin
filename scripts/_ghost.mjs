import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
// at odo3, list EVERY element with opacity>0.05 that has a dark-green background OR is a card/panel
const r = await page.evaluate(()=>{ window.render(0.535);
  const suspects=['enjoy','cardTerr','cardSlide','cardHand','slideCap','natBody','placeBody','odo'];
  return suspects.map(id=>{const e=document.getElementById(id);if(!e)return {id,missing:1};const cs=getComputedStyle(e);const r=e.getBoundingClientRect();
    return {id, op:+cs.opacity, bg:cs.backgroundColor, clip:cs.clipPath.slice(0,20), y:Math.round(r.top), h:Math.round(r.height), vis:(+cs.opacity>0.05)};}).filter(x=>x.vis||x.op>0);
});
console.log(JSON.stringify(r,null,1));
await b.close();
