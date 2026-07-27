import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));page.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text().slice(0,80));});
await page.goto('http://localhost:8879/cd-test/prompt-4-full-section.html',{waitUntil:'networkidle',timeout:30000});
await page.waitForTimeout(1500);
const total = await page.evaluate(()=>document.documentElement.scrollHeight - innerHeight);
console.log('scroll total:',total,'errors so far:',errs.length?errs.join('|'):'NONE');
const o='/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/c3be139d-c516-47c2-a8d3-42fb9aeac5b3/scratchpad/cd4';
import('fs').then(fs=>fs.mkdirSync(o,{recursive:true}));
// beats per the code: nature 0.10, enjoy 0.32, terrace 0.40, slider1 0.48, slider2 0.56, slider3 0.63, place 0.75, placeExit 0.80, runners 0.85, odo3 0.90, odo9 0.925, odo16 0.955, location 0.99
const beats={nature:0.10, enjoy:0.32, terrace:0.40, slider2:0.56, place:0.75, runners:0.85, odo9:0.925, location:0.99};
for(const [k,p] of Object.entries(beats)){
  await page.evaluate((y)=>window.scrollTo(0,y), Math.round(p*total));
  await page.waitForTimeout(700); // let scrub settle
  await page.screenshot({path:`${o}/${k}.png`});
}
console.log('done. errors:',errs.length?errs.join('|'):'NONE');
await b.close();
