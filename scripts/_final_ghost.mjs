import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
const total = await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
await page.evaluate(yy=>window.scrollTo(0,yy), Math.round(0.535*total));
await page.waitForTimeout(700);
// sample MANY points in the "second panel" region and report top element
const r = await page.evaluate(()=>{
  const pts=[[1000,730],[1100,760],[1200,800],[1050,820],[1150,700]];
  return pts.map(([x,y])=>{const el=document.elementFromPoint(x,y);
    return {pt:[x,y], el: el? (el.tagName+(el.id?'#'+el.id:'')+'.'+(typeof el.className==='string'?el.className:'')) : null,
      txt: el? el.textContent.slice(0,24):null,
      bg: el? getComputedStyle(el).backgroundColor : null};});
});
console.log(JSON.stringify(r,null,1));
await b.close();
