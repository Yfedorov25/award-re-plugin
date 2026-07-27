import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
// REAL scroll to the exact Y for progress 0.535 and let ScrollTrigger settle (no render())
const total = await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
const y = Math.round(0.535*total);
await page.evaluate(yy=>window.scrollTo(0,yy), y);
await page.waitForTimeout(700); // let scrub settle
await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
await page.screenshot({path:'/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/c3be139d-c516-47c2-a8d3-42fb9aeac5b3/scratchpad/odo-truescroll.png', clip:{x:900,y:150,width:540,height:700}});
console.log('scrolled to y='+y+' of '+total);
await b.close();
