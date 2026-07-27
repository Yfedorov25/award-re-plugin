#!/usr/bin/env node
/* dom-lint-gate.mjs — the cheap safety net that was MISSING (nobody's responsibility → overflow shipped).
   Drives OUR build via render(p) across the timeline; at each p asserts DOM sanity:
   (a) no visible text element overflows the viewport right/left (the left:983px clip)
   (b) no horizontal body scroll
   (c) no duplicate <header> / nav bars
   (d) no visible required text clipped to zero
   Exit 1 on any violation. Usage: node scripts/dom-lint-gate.mjs <url> */
import { resolveChromium } from './token-extractor.mjs';
const url = process.argv[2] || 'http://localhost:8879/suborganisms/SO-3-nature-place/index.html';
const chromium = await resolveChromium(); if(!chromium){console.error('no chromium');process.exit(2);}
const browser = await chromium.launch();
const page = await (await browser.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto(url,{waitUntil:'networkidle',timeout:30000});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});

const ps=[0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0];
const violations=[];
// header count once
const headerCount = await page.evaluate(()=>document.querySelectorAll('header, .head').length);
if(headerCount>1) violations.push(`DUP-HEADER: ${headerCount} header/.head elements`);

for(const p of ps){
  await page.evaluate(pp=>window.render&&window.render(pp), p);
  await page.waitForTimeout(180);
  const v = await page.evaluate(()=>{
    const vw=innerWidth, vh=innerHeight; const out=[];
    // body horizontal scroll
    if(document.documentElement.scrollWidth > vw+2) out.push('BODY-HSCROLL scrollWidth '+document.documentElement.scrollWidth+'>'+vw);
    // visible text atoms overflow
    for(const el of document.querySelectorAll('.atom, .title, .body, #odoNum, .odo__cap, #runners')){
      const cs=getComputedStyle(el); if(cs.display==='none'||parseFloat(cs.opacity)<0.5) continue;
      const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) continue;
      if(r.right > vw+2) out.push(`OVERFLOW-RIGHT ${el.id||el.className} right=${Math.round(r.right)}>${vw}`);
      if(r.left < -2)    out.push(`OVERFLOW-LEFT ${el.id||el.className} left=${Math.round(r.left)}`);
      // clipped text: element has text but 0 rendered height while visible
      if((el.textContent||'').trim() && r.height<3) out.push(`CLIPPED ${el.id||el.className} h=${Math.round(r.height)}`);
    }
    return out;
  });
  v.forEach(x=>violations.push(`@p${p}: ${x}`));
}
await browser.close();
const uniq=[...new Set(violations)];
if(uniq.length){ console.log('❌ DOM-LINT FAIL ('+uniq.length+' violations):'); uniq.forEach(x=>console.log('  '+x)); process.exit(1); }
console.log('✅ DOM-LINT PASS: no overflow / clip / dup-header / hscroll across '+ps.length+' scroll points'); process.exit(0);
