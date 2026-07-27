import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
await page.addStyleTag({content:'.odo__panel{box-shadow:none!important} .odo{filter:none!important}'});
const total = await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
await page.evaluate(yy=>window.scrollTo(0,yy), Math.round(0.535*total));
await page.waitForTimeout(700);
await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
await page.screenshot({path:'/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/c3be139d-c516-47c2-a8d3-42fb9aeac5b3/scratchpad/odo-noshadow.png', clip:{x:900,y:150,width:540,height:700}});
// also check: is there a pin-spacer clone? count all elements containing "NATURE PARK" text
const cnt = await page.evaluate(()=>{ let n=0; document.querySelectorAll('*').forEach(e=>{if(e.children.length===0 && /NATURE PARK/i.test(e.textContent))n++;}); return n;});
console.log('elements containing NATURE PARK text:', cnt);
await b.close();
