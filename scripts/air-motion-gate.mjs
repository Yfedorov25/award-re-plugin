#!/usr/bin/env node
/* air-motion-gate.mjs — MOTION-PARITY гейт для атомів РУХУ AIR (S41 розворот).
   🔴 ЧОМУ ЦЕЙ ГЕЙТ: air-b0-gate/air-b1-gate судять СТАТИЧНИЙ кадр. Поламаний рух S40 (букви
   стрибають + діагональ у лівий кут) пройшов усі ті гейти, бо жоден не драйвить скрол/путь.
   🔴 S41-fix#2: гейт тепер ганяє на КІЛЬКОХ ширинах (390/402/430) — попередня версія тестувала
   ЛИШЕ 390 і пропустила баги реального iPhone (лого зрізане, дубль-у-кут, перекриття caption
   через 390px-хардкод). Діра гейта = тест однієї ширини. Тепер + інваріанти viewport-safety.
   Корінь: KAI/AIR-MOTION-ROOTCAUSE-S40.md, motion-score KAI/AIR-B0B1-MOTION-SCORE-S41.md.

   Драйвить window.__WM.renderWM(p) на 8 p + перевіряє на КОЖНІЙ ширині:
     (1) scale монотонна вниз; (2) monoX кожен p (0 діагоналі-стрибка); (3) spread-колапс
     монотонний; (4) 0 position-jump (щільна сітка 0.02); (5) виїзд угору; (6) transform-only;
     (7) CLS<0.1 + 0 err; (8) фінал scale≈HEADER_SCALE; (9) лого центроване (Δполів<14);
     🆕 (10) 0 ВЕРТИКАЛЬНОГО ЗРІЗУ — на КОЖНОМУ p низ літер у межах viewport (top+height ≤ H);
     🆕 (11) 0 ДУБЛЬ-У-КУТ — на КОЖНОМУ p жодна літера не притиснута в кут (left ≥ -2 і не всі
             злиплі в одній точці), monoX-gap додатній.
   FAIL будь-чого на будь-якій ширині = НЕ віддавати. node scripts/air-motion-gate.mjs [URL] */
import { resolveChromium } from './token-extractor.mjs';

const URL = process.argv[2] ||
  'http://localhost:8879/atoms/air-mobile-hero/b0b1-motion/b0b1-organism.html';
const WIDTHS = [ {w:390,h:844}, {w:402,h:874}, {w:430,h:932} ]; // 390 lab · iPhone 14/15 · Pro Max
const P = [0, 0.15, 0.30, 0.45, 0.60, 0.75, 0.90, 1.0];
const PDENSE = Array.from({length:51}, (_,i)=> i/50);

let fails=0;
const chromium = await resolveChromium();
if(!chromium){ console.error('no chromium'); process.exit(2); }
const browser = await chromium.launch();

async function sampleAt(page, p){
  return await page.evaluate((p)=>{
    window.__WM.renderWM(p);
    const ls = window.__WM.letters;
    const H = window.innerHeight;
    const boxes = ls.map(el=>{
      const st = getComputedStyle(el);
      const m = new DOMMatrixReadOnly(st.transform==='none'?'matrix(1,0,0,1,0,0)':st.transform);
      const r = el.getBoundingClientRect();
      return { tx:m.m41, ty:m.m42, scale:m.a, left:r.left, right:r.right, top:r.top, bottom:r.bottom,
               position:st.position };
    });
    return { boxes, H, scale0: boxes[0].scale,
             rowW: boxes[boxes.length-1].right - boxes[0].left,
             leftFirst: boxes[0].left, rightLast: boxes[boxes.length-1].right,
             maxBottom: Math.max(...boxes.map(b=>b.bottom)),
             minLeft: Math.min(...boxes.map(b=>b.left)) };
  }, p);
}

async function checkWidth(dim){
  const { w:VW, h:VH } = dim;
  const ok  = (m)=>console.log(`    ✓ ${m}`);
  const bad = (m)=>{ console.log(`    ✗ ${m}`); fails++; };
  console.log(`\n  ── width ${VW}×${VH} ──`);

  const ctx = await browser.newContext({ viewport:{width:VW,height:VH}, deviceScaleFactor:2,
    userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    isMobile:true, hasTouch:true });
  const page = await ctx.newPage();
  const errs=[];
  page.on('console', m=>{ if(m.type()==='error') errs.push(m.text().slice(0,140)); });
  page.on('pageerror', e=>errs.push('PAGEERR: '+String(e).slice(0,140)));

  const resp = await page.goto(URL, { waitUntil:'load' }).catch(e=>({_e:e}));
  if(!resp || resp._e || (resp.status && resp.status()>=400)){ bad(`не завантажився`); await ctx.close(); return; }
  await page.evaluate(()=>document.fonts && document.fonts.ready).catch(()=>{});
  await page.waitForTimeout(400);
  await page.evaluate(()=>{ if(window.__WM && window.__WM.remeasure) window.__WM.remeasure(); });

  const hasWM = await page.evaluate(()=> !!(window.__WM && window.__WM.renderWM && window.__WM.letters));
  if(!hasWM){ bad('window.__WM.renderWM відсутній'); await ctx.close(); return; }

  await page.evaluate(()=>{ window.__cls=0; try{
    new PerformanceObserver(l=>{ l.getEntries().forEach(e=>{ if(!e.hadRecentInput) window.__cls+=e.value; }); })
      .observe({type:'layout-shift', buffered:true}); }catch(e){} });

  const S=[]; for(const p of P){ S.push({ p, ...(await sampleAt(page,p)) }); }

  // (1) scale монотонна вниз
  let mono=true; for(let i=1;i<S.length;i++){ if(S[i].scale0 > S[i-1].scale0 + 0.002) mono=false; }
  mono ? ok(`scale монотонна: ${S.map(s=>s.scale0.toFixed(3)).join('→')}`) : bad(`scale НЕ монотонна: ${S.map(s=>s.scale0.toFixed(3)).join('→')}`);

  // (2) monoX + gap додатній (0 перетинів, 0 злипання в кут)
  let monoX=true, badP=null;
  for(const s of S){ for(let i=1;i<s.boxes.length;i++){ if(s.boxes[i].left <= s.boxes[i-1].left+1){ monoX=false; badP=s.p; } } }
  monoX ? ok('monoX кожен p (0 перетинів/злипання)') : bad(`monoX ПОРУШЕНО p=${badP} (перетин/дубль-у-кут)`);

  // (3) spread-колапс монотонний
  let coll=true; for(let i=1;i<S.length;i++){ if(S[i].rowW > S[i-1].rowW + 0.5) coll=false; }
  coll ? ok(`spread-колапс: rowW ${S.map(s=>Math.round(s.rowW)).join('→')}px`) : bad(`spread НЕ колапсує: ${S.map(s=>Math.round(s.rowW)).join('→')}`);

  // (4) 0 position-jump щільна сітка
  const D=[]; for(const p of PDENSE){ D.push({ p, ...(await sampleAt(page,p)) }); }
  const fullDX=Math.abs(D[D.length-1].leftFirst-D[0].leftFirst)||1;
  let maxStep=0,jp=null; for(let i=1;i<D.length;i++){ const d=Math.abs(D[i].leftFirst-D[i-1].leftFirst); if(d>maxStep){maxStep=d;jp=D[i].p;} }
  (maxStep/fullDX)<0.20 ? ok(`0 position-jump: макс ${maxStep.toFixed(1)}px/Δp0.02 (${(maxStep/fullDX*100).toFixed(0)}%)`) : bad(`POSITION-JUMP ${maxStep.toFixed(1)}px=${(maxStep/fullDX*100).toFixed(0)}% p=${jp.toFixed(2)}`);

  // (5) виїзд угору
  let up=true; for(let i=1;i<S.length;i++){ if(S[i].boxes[0].ty > S[i-1].boxes[0].ty + 0.5) up=false; }
  up ? ok(`виїзд угору: ty ${S.map(s=>Math.round(s.boxes[0].ty)).join('→')}`) : bad(`ty НЕ угору: ${S.map(s=>Math.round(s.boxes[0].ty)).join('→')}`);

  // (6) transform-only — літери absolute/fixed + рух через transform (scale АБО ty міняється,
  // не layout). tx першої літери може майже не рухатись (фінал лівий кут ≈ старт-ліво), тому
  // перевіряємо scale+ty (вони точно змінюються при колапсі).
  const fx=S[0].boxes.every(b=>b.position==='fixed'||b.position==='absolute');
  const scaleMv=Math.abs(S[S.length-1].boxes[0].scale-S[0].boxes[0].scale)>0.05;
  const tyMv=Math.abs(S[S.length-1].boxes[0].ty-S[0].boxes[0].ty)>5;
  (fx&&scaleMv&&tyMv)?ok('transform-only (scale+ty рух, absolute)'):bad(`transform-only (fixed=${fx} scaleMv=${scaleMv} tyMv=${tyMv})`);

  // (7) CLS + errors
  const cls=await page.evaluate(()=>window.__cls||0);
  cls<0.1?ok(`CLS=${cls.toFixed(3)}`):bad(`CLS=${cls.toFixed(3)}≥0.1`);
  errs.length===0?ok('0 console errors'):bad(`errors ${errs.length}: ${errs[0]}`);

  // (8) фінал scale
  const HS=await page.evaluate(()=>window.__WM.HEADER_SCALE);
  const fin=S[S.length-1];
  Math.abs(fin.scale0-HS)<0.02?ok(`фінал scale=${fin.scale0.toFixed(3)}≈HS ${HS.toFixed(3)}`):bad(`фінал scale=${fin.scale0.toFixed(3)}≠HS ${HS.toFixed(3)}`);

  // (9) фінал у ЛІВОМУ куті (S41-c): leftFirst малий (< 12% ширини), лого притиснуте зліва-вгорі
  const mL=fin.leftFirst;
  (mL>=-2 && mL < VW*0.12) ? ok(`фінал у лівому куті: L=${mL.toFixed(0)}px (<${(VW*0.12).toFixed(0)})`)
                           : bad(`фінал НЕ у лівому куті: L=${mL.toFixed(0)}px`);

  // 🆕 (10) 0 вертикального зрізу — низ літер у межах viewport на КОЖНОМУ p (+8px допуск)
  let clip=null; for(const s of S){ if(s.maxBottom > s.H + 8){ clip=s; break; } }
  clip ? bad(`ЗРІЗ вертикальний p=${clip.p}: низ літер ${clip.maxBottom.toFixed(0)}px > viewport ${clip.H}px`)
       : ok(`0 зрізу: макс низ ${Math.max(...S.map(s=>s.maxBottom)).toFixed(0)}px ≤ H`);

  // 🆕 (11) 0 дубль-у-кут — жодна літера не за лівим краєм (left ≥ -2) на КОЖНОМУ p
  let corner=null; for(const s of S){ if(s.minLeft < -2){ corner=s; break; } }
  corner ? bad(`ДУБЛЬ/КУТ p=${corner.p}: літера за лівим краєм (minLeft=${corner.minLeft.toFixed(0)}px)`)
         : ok(`0 дубль-у-кут: minLeft ≥ ${Math.min(...S.map(s=>s.minLeft)).toFixed(0)}px`);

  // 🆕 (12) 0 СТРИБКА СТАРТУ — стан p=0 стабільний після reflow (fonts.ready перерахунок).
  // Знімаємо startX ДО reflow (стан при першому measure) і ПІСЛЯ повторного reflow — не має стрибати.
  const startPre = await page.evaluate(()=>{ window.__WM.renderWM(0);
    return window.__WM.letters.map(el=>el.getBoundingClientRect().left); });
  await page.evaluate(()=>{ if(window.__WM.remeasure) window.__WM.remeasure(); window.__WM.renderWM(0); });
  await page.waitForTimeout(120);
  const startPost = await page.evaluate(()=> window.__WM.letters.map(el=>el.getBoundingClientRect().left));
  const drift = Math.max(...startPre.map((v,i)=>Math.abs(v-startPost[i])));
  drift < 3 ? ok(`0 стрибка старту: p=0 стабільний (drift ${drift.toFixed(1)}px)`)
            : bad(`СТРИБОК СТАРТУ: p=0 зсунувся на ${drift.toFixed(1)}px після reflow (fonts?)`);

  await ctx.close();
}

console.log(`\n── air-motion-gate (multi-width) ──  ${URL}`);
for(const dim of WIDTHS){ await checkWidth(dim); }
await browser.close();
console.log(fails===0 ? '\n✅ air-motion-gate PASS (усі ширини)\n' : `\n❌ air-motion-gate FAIL (${fails})\n`);
process.exit(fails===0?0:1);
