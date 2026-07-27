import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
async function dump(p, ids){
  const r = await page.evaluate((args)=>{ const [pp,idlist]=args; window.render(pp);
    return idlist.map(id=>{const el=document.getElementById(id);if(!el)return {id,missing:true};
      const cs=getComputedStyle(el), r=el.getBoundingClientRect();
      return {id, op:+cs.opacity, clip:cs.clipPath, y:Math.round(r.top), h:Math.round(r.height), tf:cs.transform.slice(0,30)};});
  },[p,ids]);
  console.log('\n=== p='+p+' ==='); r.forEach(x=>console.log(JSON.stringify(x)));
}
await dump(0.25,['cardSlide','slideCap','sliderNav','cardTerr','enjoy']);
await dump(0.53,['odo','ph1','ph2','ph3','odoNum']);
await b.close();
