#!/usr/bin/env node
/* air-real-scroll-shots.mjs — знімає РЕАЛЬНИЙ скрол (window.scrollTo по пікселях, не render(p)),
   як телефон. Ловить дубль/ривок/естафету що гейт на renderWM пропускає. 402×874. */
import { resolveChromium } from './token-extractor.mjs';
import { mkdirSync } from 'node:fs';

const URL='http://localhost:8879/atoms/air-mobile-hero/b0b1-motion/b0b1-organism.html';
const OUT='/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/5bffecc2-1967-4d68-81f7-852263e7fdc0/scratchpad/real-scroll';
mkdirSync(OUT,{recursive:true});

const chromium=await resolveChromium();
const browser=await chromium.launch();
const ctx=await browser.newContext({viewport:{width:402,height:874},deviceScaleFactor:2,isMobile:true,hasTouch:true,
  userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'});
const page=await ctx.newPage();
await page.goto(URL,{waitUntil:'load'});
await page.evaluate(()=>document.fonts && document.fonts.ready).catch(()=>{});
await page.waitForTimeout(800);
const maxY=await page.evaluate(()=>document.documentElement.scrollHeight-window.innerHeight);
const N=8;
for(let i=0;i<N;i++){
  const y=Math.round(maxY*i/(N-1));
  await page.evaluate(y=>window.scrollTo(0,y), y);
  await page.waitForTimeout(260); // дати rAF-драйверу домалювати
  await page.screenshot({path:`${OUT}/s_${String(i).padStart(2,'0')}.png`});
}
await browser.close();
console.log('real-scroll shots →',OUT,'maxY=',maxY);
