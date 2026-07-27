#!/usr/bin/env node
/* air-atom-gate.mjs — 4-умовний EXTRACT-гейт для AIR hero-атомів (S38).
   Той самий контракт що atom-gate.mjs (S43), але hero-клас РІЗНОРІДНИЙ (pin / IO / threshold / snap),
   тому детекція моделі + per-atom числові transfer-перевірки на РЕАЛЬНИХ механіках кожного атома.

   Умови ради [[organism-extract-loop]]:
     (а) ре-рендер під ЧУЖИМ (не-AIR) dummy-фасадом — build.html усіх hero-атомів = ARQ/TERRA/LAGUNA/generic (звірено S38).
     (б) mobile 390×844 — драйвимо scroll/IO, перевіряємо стани руху числами.
     (в) INDEX-звірка — окремо (INDEX.md вже має статуси).
     (г) composition — окремий air-composition-check.mjs (коли hero-organism зібрано).
   Цей скрипт ганяє (а-факт)+(б-числа) + per-atom transfer.
   Запуск: node scripts/air-atom-gate.mjs <atom-id>   (сервер 8879, atoms/<id>/build.html)
   Патерн resolveChromium — той самий, що atom-gate / frozen-music-gate. */
import { resolveChromium } from './token-extractor.mjs';

const ATOM = process.argv[2];
if(!ATOM){ console.error('usage: air-atom-gate.mjs <atom-id>'); process.exit(2); }
const chromium = await resolveChromium();
if(!chromium){ console.error('no chromium'); process.exit(2); }

const BASE = `http://localhost:8879/atoms/${ATOM}`;
const VW=390, VH=844;
let fails=0, warns=0;
const ok  = (m)=>console.log('  ✓ '+m);
const bad = (m)=>{ console.log('  ✗ '+m); fails++; };
const warn= (m)=>{ console.log('  ⚠ '+m); warns++; };

// matrix helpers
const matY = (t)=>{ if(!t||t==='none')return 0; const m=t.match(/matrix.*\(([^)]+)\)/); if(!m)return 0; const p=m[1].split(',').map(Number); return t.includes('matrix3d')?p[13]:p[5]; };
const matScale=(t)=>{ if(!t||t==='none')return 1; const m=t.match(/matrix\(([^)]+)\)/); if(!m)return 1; return +m[1].split(',')[0]; };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport:{width:VW,height:VH}, deviceScaleFactor:2,
  userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1', isMobile:true, hasTouch:true });
const page = await ctx.newPage();
const errs=[];
page.on('console', m=>{ if(m.type()==='error') errs.push(m.text().slice(0,140)); });
page.on('pageerror', e=>errs.push('PAGEERR: '+String(e).slice(0,140)));

// generic scroll driver (window-level; hero-атоми скролять body, не .scroller)
async function scrollToFrac(f){
  await page.evaluate((f)=>{
    const H=document.documentElement.scrollHeight-window.innerHeight;
    window.scrollTo(0, Math.round(H*f));
  }, f);
  await page.waitForTimeout(120);
}

console.log(`\n── air-atom-gate: ${ATOM} ── (390×844, foreign facade)`);

const url = `${BASE}/build.html`;
const resp = await page.goto(url, { waitUntil:'load' }).catch(e=>({_e:e}));
if(!resp || resp._e || (resp.status && resp.status()>=400)){ bad(`build.html не завантажився (${url})`); }
else {
  await page.waitForTimeout(300);

  // (б) базова готовність: 0 horizontal overflow на 390px
  const sw = await page.evaluate(()=>document.documentElement.scrollWidth - document.documentElement.clientWidth);
  sw===0 ? ok('scrollWidth-clientWidth == 0 (нема горизонт. overflow на 390px)') : bad(`горизонт. overflow: ${sw}px`);

  // (а-факт) чужий фасад: build не містить aircenter/CLASS(A)-фасаду AIR
  const html = await page.content();
  const airFacade = /aircenter\.space|CLASS \(A\)|PREMIUM BUSINESS CENTER/i.test(html);
  !airFacade ? ok('foreign facade: build не несе AIR-контенту (перенос ЗАКОНУ, не фасаду)') : warn('build містить AIR-фасад — це не foreign-facade тест');

  // ── per-atom TRANSFER-ГЕЙТ ──
  if(ATOM==='air-blur-reveal'){
    // закон air-rv-1: слова blur(10px)→0 + opacity 0→1 по входу у в'юпорт (IO threshold .25)
    const hook = await page.evaluate(()=>!!window.__RV_GATE);
    hook ? ok('hook window.__RV_GATE присутній') : bad('hook __RV_GATE відсутній');
    // поза в'юпортом (низ сторінки не в фокусі) слова armed=blur; після скролу у в'юпорт — filter=none
    await scrollToFrac(0);
    const wBefore = await page.evaluate(()=>{
      const w=document.querySelector('.reveal-text .rv-w'); if(!w)return null;
      return { f:getComputedStyle(w).filter, o:+getComputedStyle(w).opacity };
    });
    if(!wBefore){ bad('нема .rv-w слів'); }
    else {
      // проскролити reveal-text у в'юпорт
      await page.evaluate(()=>{ const t=document.querySelector('.reveal-text'); if(t) t.scrollIntoView({block:'center'}); });
      await page.waitForTimeout(1300); // 1s transition + запас
      const wAfter = await page.evaluate(()=>{
        const w=document.querySelector('.reveal-text .rv-w');
        return { f:getComputedStyle(w).filter, o:+getComputedStyle(w).opacity };
      });
      (wAfter.f==='none'||wAfter.f==='blur(0px)') && wAfter.o>0.9
        ? ok(`blur-reveal: слово розкрилось у в'юпорті (filter=${wAfter.f}, opacity=${wAfter.o.toFixed(2)})`)
        : bad(`blur-reveal: слово не розкрилось (filter=${wAfter.f}, opacity=${wAfter.o})`);
      // stagger: різні слова мають різний --rv-i (transition-delay каскад)
      const staggered = await page.evaluate(()=>{
        const ws=[...document.querySelectorAll('.reveal-text .rv-w')].slice(0,3);
        return ws.map(w=>w.style.getPropertyValue('--rv-i')||getComputedStyle(w).getPropertyValue('--rv-i'));
      });
      new Set(staggered).size>1 ? ok(`stagger: слова мають різний --rv-i (${staggered.join(',')})`) : warn(`stagger: --rv-i однаковий (${staggered.join(',')})`);
    }
  }

  else if(ATOM==='reveal-sequence'){
    const hook = await page.evaluate(()=>window.__ATOM_OK__===true);
    hook ? ok('hook window.__ATOM_OK__ === true') : bad('hook __ATOM_OK__ не true');
    // ScrollTrigger scrub: clipPath картки inset(100%..)→inset(0..) + y 40→0 по скролу
    await scrollToFrac(0.02);
    const s0raw = await page.evaluate(()=>{ const c=document.getElementById('card'); if(!c)return null; const cs=getComputedStyle(c); return { clip:cs.clipPath, tf:cs.transform }; });
    const s0 = s0raw ? { clip:s0raw.clip, y:matY(s0raw.tf) } : null;
    if(!s0){ bad('нема #card'); }
    else {
      await scrollToFrac(0.55);
      const s1raw = await page.evaluate(()=>{ const c=document.getElementById('card'); const cs=getComputedStyle(c); return { clip:cs.clipPath, tf:cs.transform }; });
      const s1={ clip:s1raw.clip, y:matY(s1raw.tf) };
      // на прогресі картка має РОЗКРИТИСЬ (clip зменшується) або y→0
      const revealed = /inset\(0/.test(s1.clip) || Math.abs(s1.y)<10 || s1.clip!==s0.clip;
      revealed ? ok(`reveal-sequence: card розкривається по скролу (clip ${s0.clip.slice(0,18)}→${s1.clip.slice(0,18)}, y ${s0.y.toFixed(0)}→${s1.y.toFixed(0)})`) : bad(`reveal-sequence: card не змінюється (clip=${s1.clip})`);
      // bg2Inner parallax scale (1.08 старт)
      const bgTf = await page.evaluate(()=>{ const b=document.getElementById('bg2Inner'); return b?getComputedStyle(b).transform:'none'; });
      const bgScale = matScale(bgTf);
      bgScale>1.0 ? ok(`bg2Inner parallax scale ${bgScale.toFixed(3)} > 1.0 (ken-burns)`) : warn(`bg2Inner scale ${bgScale.toFixed(3)} == 1`);
    }
  }

  else if(ATOM==='air-theme-flip'){
    const hook = await page.evaluate(()=>window.__PAGE_OK__===true);
    hook ? ok('hook window.__PAGE_OK__ === true') : bad('hook __PAGE_OK__ не true');
    // scroll → --bg swap по хедер-лінії; зібрати distinct-стани
    const bgs=[];
    for(let i=0;i<=8;i++){ await scrollToFrac(i/8); await page.waitForTimeout(1400);
      bgs.push(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--bg').trim())); }
    const distinct=[...new Set(bgs.filter(Boolean))];
    distinct.length>=2 ? ok(`theme-flip: --bg свапається по скролу (${distinct.length} станів: ${distinct.slice(0,4).join(' ')})`) : bad(`theme-flip: --bg не свапається (${distinct.join(',')})`);
    // color-only: transition не містить transform/layout
    const tp = await page.evaluate(()=>getComputedStyle(document.body).transitionProperty);
    !/transform|top|left|width|height/.test(tp) ? ok(`color-only transition (${tp.slice(0,40)})`) : bad(`transition містить layout/transform (${tp})`);
  }

  else if(ATOM==='air-kinetic-letters'){
    // pin+FLIP: .letter гліфи летять у хедер-слот по скролу; .act2 заходить translateY(100vh)→0
    const hasHook = await page.evaluate(()=>typeof window.__KINETIC==='object' && typeof window.__KINETIC.p==='function');
    hasHook ? ok('hook window.__KINETIC {p,composed,footerQ} присутній') : bad('hook __KINETIC відсутній');
    // FLIP = переважно SCALE (гліф стискається у хедер-слот), рух у вікні p∈[0,0.4] — НЕ лінійний [[live-tempo-nonlinear]].
    // Семпли в реальному вікні руху (0 і 0.2), звіряємо scale + reflow-позицію, не лише translateY.
    await scrollToFrac(0);
    const l0tf = await page.evaluate(()=>{ const l=document.querySelector('.letterPos .letter'); return l?getComputedStyle(l).transform:'__none__'; });
    if(l0tf==='__none__'){ bad('нема .letter'); }
    else {
      const l0s=matScale(l0tf);
      const r0 = await page.evaluate(()=>{const r=document.querySelector('.letterPos .letter').getBoundingClientRect();return {top:Math.round(r.top),left:Math.round(r.left)};});
      await scrollToFrac(0.2); // p≈0.56 — середина руху
      const l1tf = await page.evaluate(()=>getComputedStyle(document.querySelector('.letterPos .letter')).transform);
      const l1s=matScale(l1tf);
      const r1 = await page.evaluate(()=>{const r=document.querySelector('.letterPos .letter').getBoundingClientRect();return {top:Math.round(r.top),left:Math.round(r.left)};});
      const scaleMoved = Math.abs(l1s-l0s)>0.05;
      const posMoved = Math.abs(r1.top-r0.top)>20;
      (scaleMoved||posMoved) ? ok(`kinetic-letters: FLIP переносить гліф на mobile (scale ${l0s.toFixed(2)}→${l1s.toFixed(2)}, top ${r0.top}→${r1.top})`) : bad(`kinetic-letters: гліф статичний (scale ${l0s.toFixed(2)}→${l1s.toFixed(2)}, top ${r0.top}→${r1.top})`);
      // прогрес рахується (hook)
      const pv = await page.evaluate(()=>window.__KINETIC?+window.__KINETIC.p().toFixed(2):null);
      pv>0 ? ok(`__KINETIC.p()=${pv} рахується по скролу`) : warn(`p=${pv}`);
    }
  }

  else if(ATOM==='air-wipe-pin-slider'){
    const hasHook = await page.evaluate(()=>Object.keys(window).some(k=>/__.*OK__|__ISW|__.*GATE/.test(k)));
    hasHook ? ok('hook присутній') : bad('hook __*_OK__ відсутній (потрібен; + hero потребує mobile:scroll-pin — INDEX ✅~ УМОВНО)');
    // pin: спіраль/слайд має бути sticky у pin-band; counter свапається
    await scrollToFrac(0);
    const c0 = await page.evaluate(()=>{ const c=document.querySelector('[data-role="count"], .isw-counter, #counter'); return c?c.textContent.trim():null; });
    await scrollToFrac(0.6);
    const c1 = await page.evaluate(()=>{ const c=document.querySelector('[data-role="count"], .isw-counter, #counter'); return c?c.textContent.trim():null; });
    if(c0!==null && c1!==null){ c0!==c1 ? ok(`wipe-pin: counter свапається по скролу (${c0}→${c1})`) : warn(`counter не змінився (${c0}→${c1}) — можливо tap-режим на mobile (потрібна scroll-pin гілка)`); }
    else warn('counter-елемент не знайдено (селектор?) — перевір DOM');
  }

  else { warn(`per-atom transfer-перевірки для «${ATOM}» ще не написані — лише базові (overflow/facade)`); }

  errs.length===0 ? ok('0 console-errors') : bad(`${errs.length} console-errors: ${errs.slice(0,2).join(' | ')}`);
}

await browser.close();
console.log(fails===0
  ? `\n✅ air-atom-gate ${ATOM}: PASS${warns?` (${warns} warn)`:''}\n`
  : `\n❌ air-atom-gate ${ATOM}: ${fails} FAIL${warns?`, ${warns} warn`:''}\n`);
process.exit(fails===0?0:1);
