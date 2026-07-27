import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
// KILL ScrollTrigger + unpin, render statically, screenshot
await page.evaluate(()=>{
  if(window.ScrollTrigger) ScrollTrigger.getAll().forEach(t=>t.kill(false));
  window.render(0.535);
});
await page.waitForTimeout(400);
await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
await page.screenshot({path:'/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/c3be139d-c516-47c2-a8d3-42fb9aeac5b3/scratchpad/odo-noST.png', clip:{x:900,y:150,width:540,height:700}});
// Also: what is painted at the second panel location? sample the DOM element at that point
const hit = await page.evaluate(()=>{ const el=document.elementFromPoint(1200,720); // second panel area
  let p=[],n=el; while(n&&n!==document.body){p.unshift(n.tagName+(n.id?'#'+n.id:'')+(n.className&&typeof n.className==='string'?'.'+n.className:''));n=n.parentElement;} 
  return p.join(' > ');});
console.log('element at second-panel point (1200,720):', hit);
await b.close();
