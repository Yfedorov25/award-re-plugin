import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
const info = await page.evaluate(()=>{
  const els=[...document.querySelectorAll('*')].filter(e=>e.children.length===0 && /NATURE PARK/i.test(e.textContent));
  return els.map(e=>{
    // build a path
    let p=[], n=e;
    while(n && n!==document.body){ p.unshift(n.tagName+(n.id?'#'+n.id:'')+(n.className&&typeof n.className==='string'?'.'+n.className.split(' ').join('.'):'')); n=n.parentElement;}
    const r=e.getBoundingClientRect();
    return {path:p.join(' > '), y:Math.round(r.top), x:Math.round(r.left)};
  });
});
console.log(JSON.stringify(info,null,1));
// also: total .odo and #odo, and any [id] duplicates
const dupids = await page.evaluate(()=>{ const seen={},dups=[]; document.querySelectorAll('[id]').forEach(e=>{seen[e.id]=(seen[e.id]||0)+1;}); for(const k in seen)if(seen[k]>1)dups.push(k+'='+seen[k]); return dups;});
console.log('duplicate IDs:', dupids.length?dupids:'none');
await b.close();
