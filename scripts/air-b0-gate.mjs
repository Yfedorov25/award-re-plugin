#!/usr/bin/env node
/* air-b0-gate.mjs — 4-умовний foreign-facade гейт для B0 hero-wordmark атома (S40).
   🔴 ЧОМУ ОКРЕМИЙ ГЕЙТ, не гілка air-atom-gate:
   B0 = НОВИЙ закон (gigant impact-заставка + per-letter blur-stagger вхід + fan-arcs).
   Гілка air-kinetic-letters в air-atom-gate тестує СТАРИЙ FLIP-закон (гліфи летять у хедер-слот
   по скролу). Це РІЗНІ атоми. Старий FLIP build.html лишається недоторканим (використовується деінде).
   Цей гейт судить b0-<t>.html за ПРАВИЛЬНИМ законом.

   Умови ради [[organism-extract-loop]] на B0:
     (а) чужий фасад — VIK landscape studio, 0 aircenter/CLASS(A)-контенту;
     (б) mobile 390×844 — 0 горизонт. overflow; wordmark edge-to-edge всередині;
     (в) вхід-хореографія — per-letter blur-stagger спрацьовує (композиція fade-in), hook composed;
     (г) arcs — процедурні fan-blades відрендерені (не порожньо, не crop).
   Запуск: node scripts/air-b0-gate.mjs [1a|1b|1c]   (default 1a; сервер 8879). */
import { resolveChromium } from './token-extractor.mjs';

const T = process.argv[2] || '1a';
const chromium = await resolveChromium();
if(!chromium){ console.error('no chromium'); process.exit(2); }

const URL = `http://localhost:8879/atoms/air-kinetic-letters/variants/b0-${T}.html`;
const VW=390, VH=844;
let fails=0, warns=0;
const ok  = (m)=>console.log('  ✓ '+m);
const bad = (m)=>{ console.log('  ✗ '+m); fails++; };
const warn= (m)=>{ console.log('  ⚠ '+m); warns++; };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport:{width:VW,height:VH}, deviceScaleFactor:2,
  userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1', isMobile:true, hasTouch:true });
const page = await ctx.newPage();
const errs=[];
page.on('console', m=>{ if(m.type()==='error') errs.push(m.text().slice(0,140)); });
page.on('pageerror', e=>errs.push('PAGEERR: '+String(e).slice(0,140)));

console.log(`\n── air-b0-gate: b0-${T} ── (390×844, foreign facade = VIK)`);

const resp = await page.goto(URL, { waitUntil:'load' }).catch(e=>({_e:e}));
if(!resp || resp._e || (resp.status && resp.status()>=400)){ bad(`b0-${T}.html не завантажився (${URL})`); }
else {
  // wait for fonts + arcs render + entrance to settle
  await page.evaluate(()=>document.fonts && document.fonts.ready).catch(()=>{});
  await page.waitForTimeout(1800);

  // (б) 0 horizontal overflow на 390px
  const sw = await page.evaluate(()=>document.documentElement.scrollWidth - document.documentElement.clientWidth);
  sw===0 ? ok('0 горизонт. overflow на 390px') : bad(`горизонт. overflow: ${sw}px`);

  // (а) чужий фасад: 0 aircenter/CLASS(A)/AIR-wordmark
  const html = await page.content();
  const airFacade = /aircenter\.space|CLASS \(A\)|PREMIUM BUSINESS CENTER/i.test(html);
  !airFacade ? ok('foreign facade: 0 AIR-контенту') : bad('містить AIR-фасад — не foreign-facade');
  const isVik = /VIK|LANDSCAPE|OPEN GROUND/i.test(html);
  isVik ? ok('foreign brand VIK присутній (перенос ЗАКОНУ на чужий фасад)') : warn('VIK-бренд не знайдено?');

  // (в) hook + композиція
  const hook = await page.evaluate(()=>window.__KINETIC && window.__KINETIC.composed===true);
  hook ? ok('hook window.__KINETIC.composed === true') : bad('hook __KINETIC.composed не true');

  // wordmark edge-to-edge всередині: 3 letters, span > 300px, обидва краї ≥12px від краю екрана
  const wm = await page.evaluate(()=>{
    const ls=[...document.querySelectorAll('[data-letter]')];
    if(ls.length<3) return null;
    const rs=ls.map(el=>el.getBoundingClientRect());
    const leftEdge=Math.min(...rs.map(r=>r.left)), rightEdge=Math.max(...rs.map(r=>r.right));
    return { n:ls.length, leftEdge:Math.round(leftEdge), rightEdge:Math.round(rightEdge), span:Math.round(rightEdge-leftEdge), rightMargin:Math.round(390-rightEdge), fw:getComputedStyle(ls[0]).fontWeight, fs:getComputedStyle(ls[0]).fontSize };
  });
  if(!wm){ bad('нема 3 [data-letter] гліфів'); }
  else {
    (wm.span>300) ? ok(`wordmark gigant edge-to-edge (span ${wm.span}px, ${wm.n} letters)`) : bad(`wordmark замалий (span ${wm.span}px)`);
    (wm.leftEdge>=10 && wm.rightMargin>=10) ? ok(`wordmark всередині екрана (leftEdge ${wm.leftEdge}, rightMargin ${wm.rightMargin} — не клипить)`) : bad(`wordmark клипить (leftEdge ${wm.leftEdge}, rightMargin ${wm.rightMargin})`);
    (wm.fw==='400') ? ok(`weight 400 (тонкий елегантний, не bold) — fs ${wm.fs}`) : bad(`weight ${wm.fw} (має бути 400, не bold)`);
  }

  // final opacity: після входу wordmark/kicker/caption видимі (opacity≈1)
  const vis = await page.evaluate(()=>{
    const g=s=>{const el=document.querySelector(s);return el?+getComputedStyle(el).opacity:null;};
    return { letter:g('[data-letter]'), kicker:g('[data-kicker]'), caption:g('[data-caption]'), arcs:g('[data-arcs]') };
  });
  (vis.letter>0.9 && vis.kicker>0.9 && vis.caption>0.9) ? ok(`вхід завершився: letter/kicker/caption opacity ${vis.letter?.toFixed(2)}/${vis.kicker?.toFixed(2)}/${vis.caption?.toFixed(2)}`) : bad(`вхід не завершився (opacity letter ${vis.letter} kicker ${vis.kicker} caption ${vis.caption})`);
  (vis.arcs>0.9) ? ok(`arcs проявились (opacity ${vis.arcs?.toFixed(2)})`) : warn(`arcs opacity ${vis.arcs}`);

  // (г) arcs процедурні: blades/creases відрендерені (не порожньо)
  const arc = await page.evaluate(()=>({
    blades: document.querySelectorAll('[data-arc-blades] polygon').length,
    creases: document.querySelectorAll('[data-arc-creases] line').length,
    shadows: document.querySelectorAll('[data-arc-shadows] polygon').length,
    img: document.querySelectorAll('[data-arcs] img').length
  }));
  (arc.blades>=40 && arc.creases>=40) ? ok(`arcs процедурні: ${arc.blades} blades + ${arc.creases} creases + ${arc.shadows} shadows (CSS/SVG, не crop)`) : bad(`arcs не відрендерені (blades ${arc.blades}, creases ${arc.creases})`);
  (arc.img===0) ? ok('0 растрових crop-зображень у arcs (процедурний вектор)') : warn(`${arc.img} img у arcs (очікується 0 — вектор)`);

  errs.length===0 ? ok('0 console-errors') : bad(`${errs.length} console-errors: ${errs.slice(0,2).join(' | ')}`);
}

await browser.close();
console.log(fails===0
  ? `\n✅ air-b0-gate b0-${T}: PASS${warns?` (${warns} warn)`:''}\n`
  : `\n❌ air-b0-gate b0-${T}: ${fails} FAIL${warns?`, ${warns} warn`:''}\n`);
process.exit(fails===0?0:1);
