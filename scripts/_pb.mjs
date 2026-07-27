import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
function m(id,p){return `render ${p}`;}
const r=await page.evaluate(()=>{window.render(0.70);const e=document.getElementById('placeBody').getBoundingClientRect();
  window.render(0.82);const rn=document.getElementById('runners').getBoundingClientRect();
  return {pb:{xL:(e.left/1440*100).toFixed(1),w:(e.width/1440*100).toFixed(1),yT:(e.top/900*100).toFixed(1),yB:((e.top+e.height)/900*100).toFixed(1)},
    run:{xL:(rn.left/1440*100).toFixed(1),w:(rn.width/1440*100).toFixed(1),yT:(rn.top/900*100).toFixed(1),yB:((rn.top+rn.height)/900*100).toFixed(1)}};});
console.log('OUR place-body:',JSON.stringify(r.pb));
console.log('OUR runners(fixed):',JSON.stringify(r.run));
await b.close();
