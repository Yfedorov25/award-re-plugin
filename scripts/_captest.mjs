import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
// hide the ONE odoCap element; if BOTH texts vanish → single element painted twice (compositor). if one remains → 2 DOM.
await page.addStyleTag({content:'#odoCap{visibility:hidden!important}'});
await page.evaluate(()=>window.render(0.94));
await page.waitForTimeout(200);
await page.screenshot({path:'/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/c3be139d-c516-47c2-a8d3-42fb9aeac5b3/scratchpad/odo-nocap.png', clip:{x:930,y:150,width:510,height:700}});
await b.close();
