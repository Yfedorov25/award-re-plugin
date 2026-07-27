#!/usr/bin/env node
/* air-motion-shots.mjs — знімає НАШІ кадри руху B0→B1 на 8 точках p для montage наш↔оригінал.
   Драйвить window.render(p) (реальний скрол, не лише __WM) → повний кадр 390×844 з вежею/швом.
   Вихід: scratchpad/our-b0b1/p_00..07.png */
import { resolveChromium } from './token-extractor.mjs';
import { mkdirSync } from 'node:fs';

const URL='http://localhost:8879/atoms/air-mobile-hero/b0b1-motion/b0b1-organism.html';
const OUT='/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/5bffecc2-1967-4d68-81f7-852263e7fdc0/scratchpad/our-b0b1';
mkdirSync(OUT,{recursive:true});
const P=[0,0.15,0.30,0.45,0.60,0.75,0.90,1.0];

const chromium=await resolveChromium();
const browser=await chromium.launch();
const ctx=await browser.newContext({viewport:{width:402,height:874},deviceScaleFactor:2,isMobile:true,hasTouch:true,
  userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'});
const page=await ctx.newPage();
await page.goto(URL,{waitUntil:'load'});
await page.evaluate(()=>document.fonts && document.fonts.ready).catch(()=>{});
await page.waitForTimeout(700);
for(let i=0;i<P.length;i++){
  await page.evaluate(p=>window.render(p), P[i]);
  await page.waitForTimeout(180);
  await page.screenshot({path:`${OUT}/p_${String(i).padStart(2,'0')}.png`});
}
await browser.close();
console.log('shots written to',OUT);
