#!/usr/bin/env node
/* ============================================================================
   drive-live.mjs — PROVE scrub-control on live springs (REPLICA-SYSTEM-PLAN).
   REWRITTEN S31+ (#19): the previous proof was a FALSE POSITIVE. It passed on
   moved>400 + monotonic + transforms-differ — all of which mere page TRANSLATION
   satisfies WITHOUT the pinned Nature timeline ever advancing. Result: the scraper
   read a frozen pre-reveal DOM at every phase and the whole answer-key was garbage.

   The real driver (cracked S31 #19): springs runs a bespoke jQuery SmoothScroll
   plugin whose live instance is $('body').data('smoothScroll'); calling .scrollTo(y)
   on it drives the real timeline. CDP gestures saturate before the pin; neutralising
   the lib kills the intra-pin timeline. Only the instance's own scrollTo works.

   NEW proof (must assert the REVEAL, not translation):
     • grab $('body').data('smoothScroll') — fail if absent
     • drive to a shallow Y and a deep Y inside the Nature pin
     • ASSERT nature-title opacity goes from ~0 (shallow) to ~1 (deep)  ← reveal fired
     • ASSERT the title settles INTO the viewport at the deep Y (top within 0..vp.height)
   Success = reveal fired + title on-screen. Exit 1 otherwise.

   Usage: node scripts/drive-live.mjs
============================================================================ */
import { resolveChromium, SITES, VIEWPORTS } from './token-extractor.mjs';

const site = SITES['springs-home'];
const vp = VIEWPORTS.desktop || { width:1440, height:900 };
const chromium = await resolveChromium();
if(!chromium){ console.error('no chromium'); process.exit(2); }

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport:{width:vp.width,height:vp.height}, deviceScaleFactor:1 });
const page = await ctx.newPage();

console.log('→ opening', site.liveOrigin+site.livePath);
await page.goto(site.liveOrigin+site.livePath,{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForTimeout(6000);
for(const sel of ['.js-cookie-consent-accept','button:has-text("ACCEPT")']){ try{await page.click(sel,{timeout:1200});break;}catch{} }
await page.waitForFunction(()=>{const p=document.querySelector('.js-preloader');return !p||getComputedStyle(p).display==='none'||parseFloat(getComputedStyle(p).opacity)<0.05;},{timeout:25000}).catch(()=>console.log('  WARN preloader'));
await page.waitForTimeout(1500);
await page.evaluate(()=>document.fonts&&document.fonts.ready);

const haveDriver = await page.evaluate(()=>{
  const $=window.jQuery||window.$; if(!$)return false;
  const inst=$('body').data('smoothScroll'); if(!inst||typeof inst.scrollTo!=='function')return false;
  window.__DRV=inst; return true;
});
if(!haveDriver){ console.error('❌ $(body).data(smoothScroll).scrollTo not found — cannot drive.'); await browser.close(); process.exit(1); }

const drive=async(y)=>{ await page.evaluate(yy=>window.__DRV.scrollTo(yy),y); await page.waitForTimeout(500); };
const readTitle=()=>page.evaluate(()=>{
  const t=[...document.querySelectorAll('.l-nature h2, .l-nature [class*="title"]')].find(e=>{const r=e.getBoundingClientRect();return r.width>1&&getComputedStyle(e).display!=='none';});
  if(!t)return null; const r=t.getBoundingClientRect();
  return { op:+parseFloat(getComputedStyle(t).opacity).toFixed(3), top:Math.round(r.top), text:(t.textContent||'').trim().slice(0,20) };
});

// shallow: before the Nature pin; deep: inside the pin (from band map ~9000-10000)
await drive(4000); const shallow=await readTitle();
// step in until the title reveals (op high) and is on-screen, up to a ceiling
let deep=null;
for(let y=8000;y<=12000;y+=500){ await drive(y); const s=await readTitle(); if(s && s.op>=0.9 && s.top> -50 && s.top<vp.height){ deep=s; break; } deep=s; }
await browser.close();

console.log('\n── probes ──');
console.log('  shallow (y=4000):', JSON.stringify(shallow));
console.log('  deep    (pin)   :', JSON.stringify(deep));

const revealFired = shallow && deep && shallow.op<0.2 && deep.op>=0.9;
const onScreen = deep && deep.top> -50 && deep.top < vp.height;
console.log('\n── verdict ──');
console.log(`  reveal fired (title op ${shallow?.op} → ${deep?.op}): ${revealFired}`);
console.log(`  title on-screen at pin (top ${deep?.top} within 0..${vp.height}): ${onScreen}`);
const pass = revealFired && onScreen;
console.log(`\n${pass?'✅ SCRUB-CONTROL PROVEN (reveal fires + title on-screen) — scraper viable.':'❌ SCRUB-CONTROL FAILED — the reveal did not fire; do NOT scrape (answer-key would be garbage).'}`);
process.exit(pass?0:1);
