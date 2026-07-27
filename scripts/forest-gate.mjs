#!/usr/bin/env node
/* forest-gate.mjs — механічний гейт для amenities-forest (tap-arrow-cycle).
   Перевіряє закон РУХУ (не піксель-парність):
     - тап → міняє індекс (0→1→2)
     - loop wrap-around (2 →next→ 0 ; 0 →prev→ 2)
     - crossfade: рівно ОДИН .slide.is-active і ОДИН .capset.is-active завжди
     - вертикальний скрол НЕ міняє індекс
     - horizontal drag міняє індекс (свайп вліво = next)
     - 0 console-err, 0 404
   Запуск: node scripts/forest-gate.mjs */
import { resolveChromium } from './token-extractor.mjs';

const ATOM='amenities-forest';
const chromium = await resolveChromium();
if(!chromium){ console.error('no chromium'); process.exit(2); }
const BASE=`http://localhost:8879/atoms/${ATOM}/variants/forest.html`;
const VW=390, VH=844;
let fails=0;
const ok =(m)=>console.log('  ✓ '+m);
const bad=(m)=>{ console.log('  ✗ '+m); fails++; };

const browser=await chromium.launch();
const ctx=await browser.newContext({ viewport:{width:VW,height:VH}, deviceScaleFactor:2,
  isMobile:true, hasTouch:true });
const page=await ctx.newPage();
const errs=[], notfound=[];
page.on('console', m=>{ if(m.type()==='error') errs.push(m.text()); });
page.on('pageerror', e=>errs.push(String(e)));
page.on('response', r=>{ if(r.status()>=400) notfound.push(r.status()+' '+r.url()); });

await page.goto(BASE, {waitUntil:'networkidle'});

const idx = ()=>page.evaluate(()=>window.__FOREST_API__.get());
const activeCounts = ()=>page.evaluate(()=>({
  slides:document.querySelectorAll('.slide.current').length,   // wipe model: sole visible = .current
  caps:document.querySelectorAll('.capset.is-active').length,
  capText:(document.querySelector('.capset.is-active')||{}).textContent||''
}));
const tapNext = ()=>page.click('#next');
const tapPrev = ()=>page.click('#prev');
const settle = ()=>page.waitForTimeout(900);

// --- 1. стартовий стан ---
let c=await activeCounts();
if(await idx()===0) ok('старт idx=0'); else bad('старт idx!=0');
if(c.slides===1 && c.caps===1) ok('старт: рівно 1 active slide + 1 active cap'); else bad(`старт active: slides=${c.slides} caps=${c.caps}`);
if(/PRIVATE/.test(c.capText)) ok('старт cap = PRIVATE FOREST PARK'); else bad('старт cap != PRIVATE ('+c.capText.trim()+')');

// --- 2. тап next 0→1→2 ---
await tapNext(); await settle();
if(await idx()===1) ok('tap next: 0→1'); else bad('tap next не дав 1');
c=await activeCounts();
if(/MULTIPLE/.test(c.capText)) ok('idx1 cap = MULTIPLE FOREST LAYERS'); else bad('idx1 cap != MULTIPLE');
if(c.slides===1&&c.caps===1) ok('idx1: рівно 1 active кожного'); else bad(`idx1 active slides=${c.slides} caps=${c.caps}`);

await tapNext(); await settle();
if(await idx()===2) ok('tap next: 1→2'); else bad('tap next не дав 2');
c=await activeCounts();
if(/BLOSSOMS/.test(c.capText)) ok('idx2 cap = NEUTRAL PALETTE OF BLOSSOMS'); else bad('idx2 cap != BLOSSOMS');

// --- 3. loop wrap next 2→0 ---
await tapNext(); await settle();
if(await idx()===0) ok('LOOP wrap: 2 →next→ 0'); else bad('loop wrap next не завернув до 0');

// --- 4. loop wrap prev 0→2 ---
await tapPrev(); await settle();
if(await idx()===2) ok('LOOP wrap: 0 →prev→ 2'); else bad('loop wrap prev не завернув до 2');

// назад на 0
await tapNext(); await settle();
if(await idx()===0) ok('повернувся на 0'); else bad('не на 0');

// --- 5. вертикальний скрол НЕ міняє індекс ---
const before=await idx();
await page.mouse.wheel(0, 600); await page.waitForTimeout(200);
if(await idx()===before) ok('вертикальний скрол НЕ міняє слайд'); else bad('скрол змінив слайд (баг)');
await page.mouse.wheel(0,-600); await page.waitForTimeout(120);

// --- 6. horizontal drag = next (свайп вліво) ---
const box=await page.locator('#photo').boundingBox();
const cy=box.y+box.height/2, cxR=box.x+box.width*0.8, cxL=box.x+box.width*0.2;
const i0=await idx();
await page.mouse.move(cxR,cy); await page.mouse.down();
await page.mouse.move(cxL,cy,{steps:8}); await page.mouse.up();
await settle();
if(await idx()===(i0+1)%3) ok('drag вліво = next slide'); else bad('drag вліво не дав next (idx '+i0+'→'+(await idx())+')');

// --- 7. чистота ---
if(errs.length===0) ok('0 console-error'); else bad(errs.length+' console-error: '+errs.slice(0,3).join(' | '));
if(notfound.length===0) ok('0 HTTP>=400'); else bad(notfound.length+' bad responses: '+notfound.slice(0,3).join(' | '));

// --- геометрія картки (самозвірка числами) ---
const geo=await page.evaluate(()=>{
  const card=document.querySelector('.card').getBoundingClientRect();
  const photo=document.querySelector('.photo').getBoundingClientRect();
  const arr=document.querySelector('.arrows').getBoundingClientRect();
  const cap=document.querySelector('.capset.is-active').getBoundingClientRect();
  return { cardW:Math.round(card.width), cardH:Math.round(card.height),
    ratio:+(card.width/card.height).toFixed(3),
    photoRatio:+(photo.width/photo.height).toFixed(3),
    cardBottom:Math.round(card.bottom), inFrame:card.bottom<=844,
    arrowsOnPhoto: arr.top < photo.bottom - 1,          // стрілки НЕ мають налазити на фото
    capOnPhoto: cap.top < photo.bottom - 1,
    arrGapPhoto:Math.round(arr.top-photo.bottom),
    arrBtnW:Math.round(document.querySelector('.arrows button').getBoundingClientRect().width) };
});
console.log('  ℹ card', geo.cardW+'×'+geo.cardH, 'ratio', geo.ratio, '(live 0.777) · photoRatio', geo.photoRatio, '(live 0.851) · bottom', geo.cardBottom);
if(Math.abs(geo.ratio-0.777)<0.04) ok('card ratio ≈ live 0.777'); else bad('card ratio '+geo.ratio+' далеко від live 0.777');
if(geo.inFrame) ok('картка в межах viewport (bottom≤844)'); else bad('картка вилазить за низ: '+geo.cardBottom);
console.log('  ℹ arrows btnW',geo.arrBtnW,'· arrows gap→photo',geo.arrGapPhoto+'px');
if(!geo.arrowsOnPhoto) ok('стрілки НЕ налазять на фото (gap '+geo.arrGapPhoto+'px)'); else bad('стрілки НАЛАЗЯТЬ на фото (Єгор зловив!)');
if(!geo.capOnPhoto) ok('caption НЕ налазить на фото'); else bad('caption налазить на фото');

await browser.close();
console.log(fails===0 ? '\nPASS ✅ forest tap-arrow-cycle' : `\nFAIL ❌ ${fails} проблем`);
process.exit(fails===0?0:1);
