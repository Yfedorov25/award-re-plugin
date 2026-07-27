import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[]; page.on('pageerror',e=>errs.push(e.message));
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
const slides=[];
for(const p of [0.46,0.52,0.58]){ await page.evaluate(pp=>window.render(pp),p); await page.waitForTimeout(80);
  const s=await page.evaluate(()=>document.getElementById('cardSlide').style.backgroundImage.split('/').pop().replace(/["')]/g,''));
  slides.push({p,slide:s}); }
console.log('slides across beat:',JSON.stringify(slides));
console.log('pageerrors:',errs.length?errs.join('|'):'NONE');
await b.close();
