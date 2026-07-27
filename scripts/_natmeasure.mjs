import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:782}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
// visual-parity loads the page as-is (progress 0). measure natTitle there.
const r=await page.evaluate(()=>{const t=document.getElementById('natTitle').querySelector('.title').getBoundingClientRect();
  return {xL:(t.left/1440*100).toFixed(1),xR:((t.left+t.width)/1440*100).toFixed(1),w:(t.width/1440*100).toFixed(1),baseY:((t.top+t.height)/782*100).toFixed(1),top:(t.top/782*100).toFixed(1)};});
console.log('OUR natTitle @load(p0):',JSON.stringify(r));
await b.close();
