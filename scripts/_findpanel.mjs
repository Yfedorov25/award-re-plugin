import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
await page.evaluate(()=>window.render(0.94));
await page.waitForTimeout(200);
// elementFromPoint at the SECOND caption location (~x1300 y765 in full 1440x900)
const r=await page.evaluate(()=>{
  const pts=[[1290,765],[1250,730],[1180,770]];
  const hits=pts.map(([x,y])=>{const e=document.elementFromPoint(x,y);
    let path=[],n=e;while(n&&n!==document.body){path.unshift(n.tagName+(n.id?'#'+n.id:'')+(typeof n.className==='string'&&n.className?'.'+n.className.split(' ')[0]:''));n=n.parentElement;}
    return {pt:[x,y],el:path.join('>'),txt:(e?e.textContent:'').slice(0,25)};});
  // also count total .odo and pin-spacer
  return {hits, odoCount:document.querySelectorAll('.odo').length, spacers:document.querySelectorAll('.pin-spacer').length,
    odoCapCount:document.querySelectorAll('.odo__cap').length};
});
console.log(JSON.stringify(r,null,1));
await b.close();
