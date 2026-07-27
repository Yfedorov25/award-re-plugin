import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
await page.addStyleTag({content:'.odo{outline:3px solid red!important} .odo__cap{outline:2px solid cyan!important} #mapCap{outline:3px solid magenta!important} .odo__num{outline:2px solid yellow!important}'});
const total = await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
await page.evaluate(yy=>window.scrollTo(0,yy), Math.round(0.535*total));
await page.waitForTimeout(700);
await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
await page.screenshot({path:'/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/c3be139d-c516-47c2-a8d3-42fb9aeac5b3/scratchpad/odo-highlight.png', clip:{x:850,y:100,width:590,height:760}});
// report bounding of odo, mapCap, morph at this scroll
const r=await page.evaluate(()=>{ function bb(id){const e=document.getElementById(id);if(!e)return null;const b=e.getBoundingClientRect();const cs=getComputedStyle(e);return {id,x:Math.round(b.left),y:Math.round(b.top),w:Math.round(b.width),h:Math.round(b.height),op:cs.opacity,clip:cs.clipPath.slice(0,24)};}
  return ['odo','mapCap','morph','scLeaf','scWater'].map(bb);});
console.log(JSON.stringify(r,null,1));
await b.close();
