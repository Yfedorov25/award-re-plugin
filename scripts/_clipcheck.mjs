import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
const r = await page.evaluate(async ()=>{
  const out={};
  for(const p of [0.6,0.92]){
    window.render(p); await new Promise(r=>setTimeout(r,80));
    for(const id of ['scNat','cardTerr','scPlace','scRunners']){
      out['p'+p+'_'+id]=getComputedStyle(document.getElementById(id)).clipPath;
    }
  }
  return out;
});
console.log(JSON.stringify(r,null,1));
await b.close();
