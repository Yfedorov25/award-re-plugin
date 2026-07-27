#!/usr/bin/env node
/* air-b1-gate.mjs — foreign-facade гейт для B1 hero-біта (blur-reveal), S40.
   Судить b1-<t>.html за законом base-атома air-blur-reveal + композицією B1.
   Умови:
     (а) чужий фасад — VIK, 0 aircenter; tower.jpg (higgsfield, не aircenter-рендер);
     (б) mobile 390×844 — 0 горизонт. overflow; фото-зона 312px зверху;
     (в) blur-reveal закон — hook __RV_GATE; caption armed→resolved; transitionProperty=filter/opacity
         (нуль CLS!); stagger --rv-i каскад;
     (г) композиція — wordmark top-left поверх фото; heading 42px/400/-0.84px; caption 13px/500/#8d8d8d.
   Запуск: node scripts/air-b1-gate.mjs [1a|1b|1c]  (default 1a; сервер 8879). */
import { resolveChromium } from './token-extractor.mjs';

const T = process.argv[2] || '1a';
const chromium = await resolveChromium();
if(!chromium){ console.error('no chromium'); process.exit(2); }
const URL = `http://localhost:8879/atoms/air-blur-reveal/variants/b1-${T}.html`;
const VW=390, VH=844;
let fails=0, warns=0;
const ok=(m)=>console.log('  ✓ '+m);
const bad=(m)=>{ console.log('  ✗ '+m); fails++; };
const warn=(m)=>{ console.log('  ⚠ '+m); warns++; };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport:{width:VW,height:VH}, deviceScaleFactor:2,
  userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1', isMobile:true, hasTouch:true });
const page = await ctx.newPage();
const errs=[];
page.on('console', m=>{ if(m.type()==='error') errs.push(m.text().slice(0,140)); });
page.on('pageerror', e=>errs.push('PAGEERR: '+String(e).slice(0,140)));

console.log(`\n── air-b1-gate: b1-${T} ── (390×844, foreign facade = VIK)`);
const resp = await page.goto(URL,{waitUntil:'load'}).catch(e=>({_e:e}));
if(!resp||resp._e||(resp.status&&resp.status()>=400)){ bad(`b1-${T}.html не завантажився`); }
else {
  await page.evaluate(()=>document.fonts&&document.fonts.ready).catch(()=>{});

  // (в) hook + armed-стан ПЕРЕД reveal: перевіряємо ще до завершення (перший кадр)
  const hook = await page.evaluate(()=>window.__RV_GATE===true);
  hook ? ok('hook window.__RV_GATE === true') : bad('hook __RV_GATE не true');
  // transitionProperty = filter/opacity тільки (нуль CLS — головний інваріант)
  const tp = await page.evaluate(()=>{ const w=document.querySelector('.rv-w'); return w?getComputedStyle(w).transitionProperty:null; });
  (tp && /filter/.test(tp) && /opacity/.test(tp) && !/transform|top|left|width|height|margin/.test(tp))
    ? ok(`нуль-CLS: transitionProperty="${tp}" (тільки filter/opacity, layout не рухається)`)
    : bad(`CLS-ризик: transitionProperty="${tp}" (має бути тільки filter/opacity)`);
  // stagger --rv-i каскад (різні слова різний delay)
  const stag = await page.evaluate(()=>{ const ws=[...document.querySelectorAll('.rv-w')].slice(0,4);
    return ws.map(w=>w.style.transitionDelay || getComputedStyle(w).transitionDelay); });
  new Set(stag).size>1 ? ok(`stagger каскад: різні delay (${stag.join(', ')})`) : bad(`stagger відсутній (${stag.join(',')})`);

  // після settle: caption resolved (opacity 1, filter none)
  await page.waitForTimeout(2600);
  const resolved = await page.evaluate(()=>{ const ws=[...document.querySelectorAll('.rv-w')]; if(!ws.length)return null;
    return ws.every(w=>+getComputedStyle(w).opacity>0.95 && (getComputedStyle(w).filter==='none'||getComputedStyle(w).filter==='blur(0px)')); });
  resolved ? ok('caption повністю розкрилась (усі слова opacity 1, filter none)') : bad('caption не розкрилась повністю');

  // (б) 0 overflow + фото 312
  const sw = await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  sw===0 ? ok('0 горизонт. overflow на 390px') : bad(`overflow ${sw}px`);
  const photo = await page.evaluate(()=>{ const i=document.querySelector('[data-screen] img'); if(!i)return null; const r=i.getBoundingClientRect(); return {top:Math.round(r.top),h:Math.round(r.height),w:Math.round(r.width)}; });
  (photo && photo.top===0 && Math.abs(photo.h-312)<=4 && photo.w>=388) ? ok(`фото full-bleed зверху (top ${photo.top}, h ${photo.h}, w ${photo.w})`) : bad(`фото не як спец (${JSON.stringify(photo)})`);

  // (а) чужий фасад
  const html = await page.content();
  /aircenter\.space|CLASS \(A\)|PREMIUM BUSINESS CENTER|THE MOMENTUM|RISE HIGHER/i.test(html) ? bad('містить aircenter/AIR-контент') : ok('foreign facade: 0 AIR-контенту');
  /VIK|OUTLAST/i.test(html) ? ok('foreign brand VIK присутній') : warn('VIK не знайдено');
  const imgSrc = await page.evaluate(()=>{ const i=document.querySelector('[data-screen] img'); return i?i.getAttribute('src'):null; });
  (imgSrc && /tower\.jpg/.test(imgSrc)) ? ok(`tower asset = ${imgSrc} (higgsfield, не aircenter-рендер)`) : warn(`img src=${imgSrc}`);

  // (г) композиція: heading + caption числа
  const h = await page.evaluate(()=>{ const el=document.querySelector('h2'); const cs=getComputedStyle(el); const r=el.getBoundingClientRect();
    return {fs:cs.fontSize,fw:cs.fontWeight,ls:cs.letterSpacing,left:Math.round(r.left),top:Math.round(r.top),color:cs.color}; });
  (h.fs==='42px' && h.fw==='400' && h.color==='rgb(10, 10, 10)') ? ok(`heading 42px/400 #0a0a0a ls ${h.ls} left${h.left} (= live oracle, вага 400 не bold)`) : bad(`heading ${h.fs}/${h.fw}/${h.color} != live`);
  const cap = await page.evaluate(()=>{ const el=document.querySelector('[data-cap]'); const cs=getComputedStyle(el);
    return {fs:cs.fontSize,fw:cs.fontWeight,color:cs.color,align:cs.textAlign}; });
  (cap.fs==='13px' && cap.fw==='500' && cap.color==='rgb(141, 141, 141)' && cap.align==='center') ? ok(`caption 13px/500 #8d8d8d center (= live oracle)`) : bad(`caption ${cap.fs}/${cap.fw}/${cap.color}/${cap.align} != live`);
  const wm = await page.evaluate(()=>{ const el=[...document.querySelectorAll('[data-screen] > div')].find(d=>/^VIK$/.test(d.textContent.trim())); if(!el)return null; const cs=getComputedStyle(el); const r=el.getBoundingClientRect(); return {fw:cs.fontWeight,left:Math.round(r.left),top:Math.round(r.top),overPhoto:r.top<312}; });
  (wm && wm.fw==='400' && wm.overPhoto) ? ok(`wordmark VIK вага 400 поверх фото (left${wm.left} top${wm.top})`) : bad(`wordmark не як спец (${JSON.stringify(wm)})`);

  errs.length===0 ? ok('0 console-errors') : bad(`${errs.length} console-errors: ${errs.slice(0,2).join(' | ')}`);
}

await browser.close();
console.log(fails===0 ? `\n✅ air-b1-gate b1-${T}: PASS${warns?` (${warns} warn)`:''}\n` : `\n❌ air-b1-gate b1-${T}: ${fails} FAIL${warns?`, ${warns} warn`:''}\n`);
process.exit(fails===0?0:1);
