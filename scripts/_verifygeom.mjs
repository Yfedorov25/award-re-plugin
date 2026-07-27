import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
const r=await page.evaluate(()=>{
  function g(id,p){window.render(p);const e=document.getElementById(id).getBoundingClientRect();
    return {xL:+(e.left/1440*100).toFixed(1),w:+(e.width/1440*100).toFixed(1),yT:+(e.top/900*100).toFixed(1)};}
  return {natBody:g('natBody',0.10), placeBody:g('placeBody',0.70), runners:g('runners',0.82)};});
console.log('natBody  ours',JSON.stringify(r.natBody),' live {xL:64.7,w:30.2,yT:75.2}');
console.log('placeBody ours',JSON.stringify(r.placeBody),' live {xL:4.3,w:30.1,yT:79.8}');
console.log('runners  ours',JSON.stringify(r.runners),' live {xL:55,w:39.9,yT:56.7}');
await b.close();
