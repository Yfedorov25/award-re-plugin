import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
const r=await page.evaluate(()=>{window.render(0.52);
  const sc=document.getElementById('slideCap').getBoundingClientRect();
  const cs=document.getElementById('cardSlide').getBoundingClientRect();
  return {slideCap:{xL:(sc.left/1440*100).toFixed(1),w:(sc.width/1440*100).toFixed(1),yT:(sc.top/900*100).toFixed(1)},
    card:{xL:(cs.left/1440*100).toFixed(1),w:(cs.width/1440*100).toFixed(1),yT:(cs.top/900*100).toFixed(1),h:(cs.height/900*100).toFixed(1)}};});
console.log('OUR slideCap:',JSON.stringify(r.slideCap));
console.log('OUR slider-card:',JSON.stringify(r.card));
await b.close();
