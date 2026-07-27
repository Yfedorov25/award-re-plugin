#!/usr/bin/env node
/* real-scroll-record.mjs — record OUR build ACTUALLY SCROLLING (not render(p) scan screenshots).
   Drives real wheel scroll through the pinned section and captures a video + evenly-spaced frames.
   This is the honest verification surface: watch the MOTION, compare to the original recording.
   Usage: node scripts/real-scroll-record.mjs <url> <outdir> */
import { resolveChromium } from './token-extractor.mjs';
import { mkdirSync } from 'fs';
const url = process.argv[2] || 'http://localhost:8879/suborganisms/SO-3-nature-place/index.html';
const outDir = process.argv[3] || '/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/56d9d2b3-037f-4fe4-b4ad-7a6e30d8174f/scratchpad/ours-scroll';
mkdirSync(outDir,{recursive:true});
const chromium = await resolveChromium(); if(!chromium){console.error('no chromium');process.exit(2);}
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport:{width:1440,height:900}, recordVideo:{dir:outDir,size:{width:1440,height:900}} });
const page = await ctx.newPage();
console.log('open',url);
await page.goto(url,{waitUntil:'networkidle',timeout:30000});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
await page.waitForTimeout(600);

// total scroll = pin end (+=1100% => ~12x viewport). scroll gradually with real wheel.
const total = await page.evaluate(()=>document.documentElement.scrollHeight - innerHeight);
console.log('scrollHeight-innerHeight =',total);
const STEPS=parseInt(process.argv[4]||'90'), dwell=90;
const every=parseInt(process.argv[5]||'15');
for(let i=0;i<=STEPS;i++){
  const y=Math.round((i/STEPS)*total);
  await page.evaluate(yy=>window.scrollTo(0,yy), y);
  await page.waitForTimeout(dwell);
  if(i%every===0){ const p=(i/STEPS).toFixed(2); await page.screenshot({path:outDir+`/f_${String(i).padStart(3,'0')}_p${p}.png`}); }
}
await page.waitForTimeout(400);
await ctx.close(); // finalizes video
await browser.close();
console.log('DONE → video + frames in',outDir);
