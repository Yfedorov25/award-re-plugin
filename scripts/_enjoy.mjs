import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
const r=await page.evaluate(()=>{window.render(0.33);
  const e=document.getElementById('enjoy').getBoundingClientRect();
  const oc=(()=>{window.render(0.90);return document.querySelector('.odo').getBoundingClientRect();})();
  return {enjoy:{xL:(e.left/1440*100).toFixed(1),w:(e.width/1440*100).toFixed(1),yT:(e.top/900*100).toFixed(1),yB:((e.top+e.height)/900*100).toFixed(1)},
    odo:{xL:(oc.left/1440*100).toFixed(1),w:(oc.width/1440*100).toFixed(1),yT:(oc.top/900*100).toFixed(1),yB:((oc.top+oc.height)/900*100).toFixed(1)}};});
console.log('OUR enjoy-panel:',JSON.stringify(r.enjoy),' live~ {xL:0,w:~40,yT:~15,yB:~50}');
console.log('OUR odo-card:',JSON.stringify(r.odo),' live~ {xL:60,w:40,yT:25,yB:~90}');
await b.close();
