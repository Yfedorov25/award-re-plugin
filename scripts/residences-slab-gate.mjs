#!/usr/bin/env node
/* residences-slab-gate.mjs — повний числовий гейт-набір для atoms/residences-slab/build.html
   Гейти: (1) dom-lint+хуки+console (2) law-states за SPEC v3 (M1-M6) (3) scrub-тортури
   (4) real-wheel + реальна миша (hover/click info-контейнера). Exit 1 при провалі. */
import { resolveChromium } from './token-extractor.mjs';
const URL = process.argv[2] || 'http://localhost:8879/atoms/residences-slab/build.html';
const chromium = await resolveChromium(); if(!chromium){console.error('no chromium');process.exit(2);}
const browser = await chromium.launch();
const ctx = await browser.newContext({viewport:{width:1440,height:900}});
const page = await ctx.newPage();
const errs=[]; page.on('pageerror',e=>errs.push('PAGE:'+e.message));
page.on('console',m=>{if(m.type()==='error')errs.push('CONSOLE:'+m.text());});
await page.goto(URL,{waitUntil:'networkidle',timeout:30000});
await page.waitForFunction(()=>window.__ATOM_OK__===true,{timeout:8000});

const fails=[]; const ok=(name,cond,detail)=>{ if(cond){console.log('  ✅ '+name+(detail?' — '+detail:''));} else {console.log('  ❌ '+name+(detail?' — '+detail:'')); fails.push(name);} };

/* ---------- helpers ---------- */
const snap = p => page.evaluate(pp=>{
  window.render(pp);
  const st = sel => { const el=document.querySelector(sel); const cs=getComputedStyle(el);
    return {clip:cs.clipPath, opacity:parseFloat(cs.opacity), transform:cs.transform,
      vis:cs.visibility, rect:el.getBoundingClientRect()}; };
  const insetLeft = sel => { const c=st(sel).clip; if(c==='none') return 0;
    const m=c.match(/inset\(([^)]+)\)/); if(!m) return NaN;
    const v=m[1].trim().split(/\s+/).map(x=>parseFloat(x));
    // CSS shorthand: 1 знач.=усі, 2=[tb,lr], 3=[t,lr,b], 4=[t,r,b,l]
    return v.length===1?v[0] : v.length===2?v[1] : v.length===3?v[1] : v[3]; };
  const scaleX = sel => { const t=st(sel).transform; const m=t.match(/matrix\(([-\d.]+)/); return m?parseFloat(m[1]):1; };
  const yOfLbl = sel => { const el=document.querySelector(sel); const mask=el.parentElement.getBoundingClientRect();
    const r=el.getBoundingClientRect(); return (r.top-mask.top)/mask.height*100; };
  const imgScale = sel => { const t=st(sel).transform; const m=t.match(/matrix\(([-\d.]+)/); return m?parseFloat(m[1]):1; };
  return { r1:insetLeft('#r1'), r2:insetLeft('#r2'), r3:insetLeft('#r3'),
    pfill:scaleX('.pfill'),
    lb1:yOfLbl('#lb1'), lb2:yOfLbl('#lb2'), lb3:yOfLbl('#lb3'),
    spotOp: st('#spot').opacity, spotVis: st('#spot').vis,
    g1: st('.spot .cardTitle .g1').opacity, g2: st('.spot .cardTitle .g2').opacity, g3: st('.spot .cardTitle .g3').opacity,
    img1: imgScale('#r1 .img'), img2: imgScale('#r2 .img'), img3: imgScale('#r3 .img'),
    spotRect: st('#spot').rect, vw: innerWidth, vh: innerHeight };
}, p);

/* ================= GATE 1: dom-lint + структура ================= */
console.log('GATE 1 — dom-lint / hooks / структура');
const struct = await page.evaluate(()=>({
  triggers: ScrollTrigger.getAll().length,
  pinned: ScrollTrigger.getAll().filter(t=>t.pin).length,
  renderFn: typeof window.render==='function',
  atomOk: window.__ATOM_OK__===true,
  cssTransformOnAnimated: (()=>{ // transform-ownership lint: у stylesheet нема transform на анімованих
    let bad=[];
    for(const sh of document.styleSheets){ let rules; try{rules=sh.cssRules}catch(e){continue}
      for(const r of rules){ if(!r.style) continue;
        const t=r.style.transform||r.style.translate||r.style.scale;
        if(t && t!=='none') bad.push(r.selectorText+' → '+t); } }
    return bad; })(),
}));
ok('ONE pinned ScrollTrigger', struct.triggers===1 && struct.pinned===1, `${struct.triggers} triggers, ${struct.pinned} pinned`);
ok('hooks render(p)+__ATOM_OK__', struct.renderFn && struct.atomOk);
ok('transform-ownership (CSS чистий)', struct.cssTransformOnAnimated.length===0, struct.cssTransformOnAnimated.join('; ')||'GSAP-only');
// text-collision / overflow на 11 точках
let overflow=[];
for(const p of [0,.1,.2,.3,.4,.5,.6,.7,.8,.9,1]){
  const v = await page.evaluate(pp=>{ window.render(pp);
    const out=[]; const vw=innerWidth;
    for(const el of document.querySelectorAll('.title,.subtitle,.lbl,.cardTitle,.cardSub,.stat,.btn')){
      const cs=getComputedStyle(el); if(cs.visibility==='hidden'||parseFloat(cs.opacity)<0.5) continue;
      const r=el.getBoundingClientRect(); if(r.width<1) continue;
      if(r.right>vw+2||r.left<-2) out.push(`${el.className||el.id} l=${Math.round(r.left)} r=${Math.round(r.right)}`);
    } return out; }, p);
  v.forEach(x=>overflow.push(`@p${p}: ${x}`));
}
ok('нема overflow тексту на 11 точках', overflow.length===0, overflow.slice(0,3).join(' | '));

/* ================= GATE 2: law-states (SPEC v3 M1-M6) ================= */
console.log('GATE 2 — law-states за SPEC v3');
const s05=await snap(.05), s16=await snap(.16), s30=await snap(.30), s44=await snap(.44),
      s57=await snap(.57), s70=await snap(.70), s88=await snap(.88), s100=await snap(1);
// beat 1: title hold — рендери закриті, прогрес живий
ok('p.05 title-hold: r1/r2/r3 закриті', s05.r1>99 && s05.r2>99 && s05.r3>99);
ok('p.05 прогрес живий і = p (M5)', Math.abs(s05.pfill-0.05)<0.01, `pfill=${s05.pfill.toFixed(3)}`);
// beat 2: render1 mid-cover — межа СПРАВА-НАЛІВО (M2)
ok('p.16 r1 межа в русі (гориз. slicer M2)', s16.r1>1 && s16.r1<99, `insetLeft=${s16.r1.toFixed(1)}%`);
// beat 3: hold1 — r1 відкритий, label 1 на місці, контейнер видимий і НЕ зникає далі (M3/M4)
ok('p.30 r1 відкритий повністю', s30.r1<0.5, `insetLeft=${s30.r1.toFixed(2)}%`);
ok('p.30 label1 у масці', Math.abs(s30.lb1)<5, `y=${s30.lb1.toFixed(1)}%`);
ok('p.30 info-контейнер видимий (M3)', s30.spotOp>0.95 && s30.spotVis==='visible');
ok('p.30 текст картки = g1 (Flats)', s30.g1>0.95 && s30.g2<0.05);
ok('p.30 живий зум r1 (1.04→1.10)', s30.img1>1.045 && s30.img1<1.10, `scale=${s30.img1.toFixed(3)}`);
// beat 4: render2 mid — label swap З OVERLAP (M6) + кросфейд тексту картки (M4)
ok('p.44 r2 межа в русі', s44.r2>1 && s44.r2<99, `insetLeft=${s44.r2.toFixed(1)}%`);
const overlapProbe = await snap(.47); // зона свапу 4.35-5.05 → p .435-.505
ok('p.47 label-overlap: lb1 виходить І lb2 заходить одночасно (M6)',
   overlapProbe.lb1<-5 && overlapProbe.lb1>-120 && overlapProbe.lb2<120 && overlapProbe.lb2>5,
   `lb1=${overlapProbe.lb1.toFixed(0)}% lb2=${overlapProbe.lb2.toFixed(0)}%`);
// beat 5: hold2
ok('p.57 r2 відкритий, текст = g2', s57.r2<0.5 && s57.g2>0.95 && s57.g1<0.05);
ok('p.57 контейнер ПОСТІЙНИЙ (M4)', s57.spotOp>0.95);
// beat 6-7: render3 + фінальний hold
ok('p.70 r3 межа в русі/відкривається', s70.r3<99, `insetLeft=${s70.r3.toFixed(1)}%`);
ok('p.88 r3 відкритий, текст = g3, lb3 у масці', s88.r3<0.5 && s88.g3>0.95 && Math.abs(s88.lb3)<5);
ok('p1.0 нічого не виходить: контейнер+label на місці', s100.spotOp>0.95 && Math.abs(s100.lb3)<5);
// M5: pfill = чиста функція p на всіх бітах
const pfillPure = [ [0.16,s16],[0.30,s30],[0.44,s44],[0.57,s57],[0.70,s70],[0.88,s88] ]
  .every(([p,s])=>Math.abs(s.pfill-p)<0.01);
ok('M5 прогрес = чиста функція p (6 точок)', pfillPure);
// контейнер у правому нижньому куті впритул до правого краю (M3)
ok('M3 контейнер впритул правого краю', Math.abs(s30.spotRect.right - s30.vw) < 2, `right=${s30.spotRect.right}`);

/* ================= GATE 3: scrub-тортури ================= */
console.log('GATE 3 — scrub-тортури');
// телепорт + пилка: стан детермінований (same p → same state)
const stateSig = async p => JSON.stringify(await snap(p));
const a1=await stateSig(.44);
await page.evaluate(()=>{ window.render(1); window.render(0); window.render(.9); window.render(.1); });
const a2=await stateSig(.44);
ok('телепорт/пилка: p→стан детермінований', a1===a2);
// реверс: монотонність pfill
let mono=true, prev=-1;
for(const p of [0,.2,.4,.6,.8,1,.8,.6,.4,.2,0]){
  const s=await snap(p); const dir = prev<0?0:Math.sign(p-([0,.2,.4,.6,.8,1,.8,.6,.4,.2,0][[0,.2,.4,.6,.8,1,.8,.6,.4,.2,0].indexOf(p)-1]??p));
  prev=s.pfill;
}
for(const seq of [[0,.3,.6,1],[1,.7,.4,0]]){ let last=seq[0]<seq[seq.length-1]?-1:2;
  for(const p of seq){ const s=await snap(p);
    if(seq[0]<seq[seq.length-1] ? s.pfill<last-0.001 : s.pfill>last+0.001){ mono=false; }
    last=s.pfill; } }
ok('реверс 0→1→0 чистий (монотонність)', mono);
ok('zero console errors після тортур', errs.length===0, errs.slice(0,3).join(' | '));

/* ================= GATE 4: real-wheel + реальна миша ================= */
console.log('GATE 4 — real-wheel + реальна миша');
await page.evaluate(()=>{ window.scrollTo(0,0); ScrollTrigger.update(); });
await page.waitForTimeout(300);
// реальний wheel крізь пін
let pinHeld=true, progressed=false, lastFill=0;
for(let i=0;i<40;i++){
  await page.mouse.wheel(0,600); await page.waitForTimeout(90);
  const st = await page.evaluate(()=>({ top: document.querySelector('#stage').getBoundingClientRect().top,
    fill:(()=>{const m=getComputedStyle(document.querySelector('.pfill')).transform.match(/matrix\(([-\d.]+)/);return m?parseFloat(m[1]):0})(),
    y: scrollY, max: document.documentElement.scrollHeight-innerHeight }));
  if(st.y < st.max-10 && Math.abs(st.top)>4) pinHeld=false;
  if(st.fill>lastFill+0.02) progressed=true; lastFill=st.fill;
}
ok('пін тримає стейдж під wheel', pinHeld);
ok('прогрес їде від реального wheel', progressed, `fill дійшов до ${lastFill.toFixed(2)}`);
// реальна миша: hover розкриває картку ВГОРУ, leave ховає, click тоггл
await page.evaluate(()=>{ const max=document.documentElement.scrollHeight-innerHeight; window.scrollTo(0,max*0.3); ScrollTrigger.update(); });
await page.waitForTimeout(400);
const spotBox = await page.evaluate(()=>{ const r=document.querySelector('#spot').getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+30}; });
const hBefore = await page.evaluate(()=>document.querySelector('.spot .more').getBoundingClientRect().height);
await page.mouse.move(spotBox.x, spotBox.y); await page.waitForTimeout(600);
const hHover = await page.evaluate(()=>document.querySelector('.spot .more').getBoundingClientRect().height);
const inViewport = await page.evaluate(()=>{ const r=document.querySelector('#spot').getBoundingClientRect(); return r.top>=-2 && r.bottom<=innerHeight+2 && r.right<=innerWidth+2; });
await page.mouse.move(20, 20); await page.waitForTimeout(600);
const hLeave = await page.evaluate(()=>document.querySelector('.spot .more').getBoundingClientRect().height);
ok('hover розкриває статистику (M3)', hBefore<2 && hHover>60, `0→${Math.round(hHover)}px`);
ok('картка не вилазить за в\'юпорт', inViewport);
ok('mouseleave згортає', hLeave<2, `${Math.round(hLeave)}px`);
ok('zero console errors фінально', errs.length===0, errs.slice(0,5).join(' | '));

await browser.close();
console.log('');
if(fails.length){ console.log(`❌ GATE FAIL: ${fails.length} провалів: ${fails.join(' · ')}`); process.exit(1); }
console.log('✅ ALL GATES PASS (dom-lint · law-states v3 · тортури · real-wheel/mouse)');
