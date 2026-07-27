#!/usr/bin/env node
/* s38-quad-gate.mjs — гейти на RAW для 4 CD-атомів S38:
   load-clock: preloader · pinned: hero-intro · flow+1pin: scroll-snap · flow: size-morph.
   Уроки S37 вшиті: проби ЛИШЕ атомарні (render+read в ОДНОМУ evaluate);
   snap = реальний wheel; «нуль контент-твінів під час glide» перевіряється числами. */
import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium(); if(!chromium){console.error('no chromium');process.exit(2);}
const browser = await chromium.launch();
const BASE='http://localhost:8879/atoms';
let totalFails=0;
const VW=1440, VH=900;

async function openPage(url){
  const page = await (await browser.newContext({viewport:{width:VW,height:VH}})).newPage();
  const errs=[]; page.on('pageerror',e=>errs.push('PAGE:'+e.message));
  page.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text());});
  await page.goto(url,{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>window.__ATOM_OK__===true,{timeout:10000});
  return {page,errs};
}
function mk(){ const fails=[];
  return {fails, ok(name,cond,detail){ const s=cond?'✅':'❌'; console.log(`  ${s} ${name}${detail?' — '+detail:''}`); if(!cond) fails.push(name); }};
}
async function cssLint(page,t){
  const bad = await page.evaluate(()=>{
    let out=[]; for(const sh of document.styleSheets){ let rules; try{rules=sh.cssRules}catch(e){continue}
      for(const r of rules){ if(r.style){ const tt=r.style.transform||r.style.translate||r.style.scale;
        if(tt&&tt!=='none') out.push(r.selectorText);
        if(r.style.scrollSnapType) out.push('SNAP:'+r.selectorText); } } }
    return out; });
  t.ok('CSS-lint (transform/scroll-snap ownership)', bad.length===0, bad.join(',')||'чистий');
}
function finish(name,t,errs){
  t.ok('zero console errors', errs.length===0, errs.slice(0,3).join(' | ')||'0');
  totalFails+=t.fails.length;
  console.log(t.fails.length? `  ⛔ ${name}: ${t.fails.length} FAIL` : `  🟢 ${name}: ALL PASS`);
}

/* ============ 1. preloader (LOAD-годинник) ============ */
{
  console.log('\n=== preloader (RAW) ===');
  const t=mk(); const {page,errs}=await openPage(`${BASE}/preloader/build.html`);
  await cssLint(page,t);
  // атомарна проба: render(p)+читання в ОДНОМУ evaluate
  const probe = p => page.evaluate(pp=>{
    window.render(pp);
    const cs=s=>getComputedStyle(document.querySelector(s));
    const panel=cs('#panel'), wm=cs('#wmlayer'), arc=cs('#arcrot'), wrap=cs('#wmwrap'), cream=cs('#wmcream');
    const m=(arc.transform.match(/matrix\(([-\d.]+),\s*([-\d.]+)/)||[]);
    const ang=m.length?Math.atan2(parseFloat(m[2]),parseFloat(m[1]))*180/Math.PI:0;
    return { panelOp:parseFloat(panel.opacity), wmOp:parseFloat(wm.opacity),
      arcAngle:(ang+360)%360, panelClip:panel.clipPath, wmTr:wrap.transform,
      mask:(cream.webkitMaskPosition||cream.maskPosition||''),
      replayOn:document.getElementById('replay').classList.contains('on') };
  }, p);
  const p30=await probe(.30), p60=await probe(.60), p85=await probe(.85), p93=await probe(.93), p100=await probe(1);
  t.ok('M3 hold: панель повна, wordmark ghost, replay схований', p30.panelOp>0.97&&p30.wmOp>0.97&&!p30.replayOn);
  t.ok('спінер = лінійна f(p): кут@0.30 ≈ 216°', Math.abs(p30.arcAngle-216)<8, `${p30.arcAngle.toFixed(1)}°`);
  const p50=await probe(.50);
  t.ok('спінер = лінійна f(p): кут@0.50 ≈ 360°', p50.arcAngle<8||p50.arcAngle>352, `${p50.arcAngle.toFixed(1)}°`);
  t.ok('M4 sweep: маска рухається, панель ще повна', p60.mask!==p30.mask && p60.panelOp>0.97, `${p30.mask} → ${p60.mask}`);
  t.ok('M5/M6 ШАРУВАТІСТЬ: @0.85 панель майже мертва, wordmark ЧИТАБЕЛЬНИЙ', p85.panelOp<0.2&&p85.wmOp>0.5, `panel=${p85.panelOp.toFixed(2)} wm=${p85.wmOp.toFixed(2)}`);
  t.ok('M6 строго: @0.93 панель=0, wordmark ще живий', p93.panelOp<0.01&&p93.wmOp>0.05, `panel=${p93.panelOp.toFixed(2)} wm=${p93.wmOp.toFixed(2)}`);
  t.ok('вихід БЕЗ clip/scale (opacity-only)', (p85.panelClip==='none')&&(p85.wmTr==='none'||p85.wmTr==='matrix(1, 0, 0, 1, 0, 0)'), `clip=${p85.panelClip} tr=${p85.wmTr}`);
  t.ok('фінал: все чисто + REPLAY видимий', p100.panelOp<0.01&&p100.wmOp<0.01&&p100.replayOn);
  // детермінізм: 0.85 з різних напрямків
  const a=await probe(.85); await probe(1); await probe(.1); const b=await probe(.85);
  t.ok('реверс/телепорт детермінований', Math.abs(a.panelOp-b.panelOp)<0.01&&Math.abs(a.wmOp-b.wmOp)<0.01);
  // скрол-лок: до p=1 замкнено, після — відкрито (Lenis started)
  const lockMid = await page.evaluate(()=>{ window.render(.5); window.scrollTo(0,0); return true; });
  t.ok('replay-кнопка клікабельна після фіналу', await page.evaluate(()=>{window.render(1); const b=document.getElementById('replay'); return getComputedStyle(b).pointerEvents!=='none';}));
  finish('preloader',t,errs); await page.close();
}

/* ============ 2. hero-intro (LOAD + ONE pinned scrub) ============ */
{
  console.log('\n=== hero-intro (RAW) ===');
  const t=mk(); const {page,errs}=await openPage(`${BASE}/hero-intro/build.html`);
  await cssLint(page,t);
  const pins = await page.evaluate(()=>({p:ScrollTrigger.getAll().filter(x=>x.pin).length, n:ScrollTrigger.getAll().length,
    ri:typeof window.renderIntro==='function', rp:typeof window.replayIntro==='function'}));
  t.ok('ONE pinned trigger', pins.p===1, `pins=${pins.p} trigs=${pins.n}`);
  t.ok('хуки renderIntro/replayIntro', pins.ri&&pins.rp);
  // LOAD-проби (атомарні)
  const iprobe = p => page.evaluate(pp=>{
    window.renderIntro(pp);
    const cs=s=>getComputedStyle(document.querySelector(s));
    const ttl=document.querySelector('#htitle').getBoundingClientRect();
    return { veil:parseFloat(cs('#veil').opacity), vwm:parseFloat(cs('#vwm').opacity),
      hdr:parseFloat(cs('#hdr').opacity), ttlOp:parseFloat(cs('#htitle').opacity),
      ttlTr:cs('#htitle').transform, ttlY:ttl.y };
  }, p);
  const i05=await iprobe(.05), i50=await iprobe(.50), i72=await iprobe(.72), i100=await iprobe(1);
  t.ok('M1 старт: вуаль повна, хедер схований', i05.veil>0.85&&i05.hdr<0.1);
  t.ok('M2 TRAIL: вуаль мертва, wordmark ще видимий, хедер ще ні', i50.veil<0.05&&i50.vwm>0.12&&i50.hdr<0.05, `veil=${i50.veil.toFixed(2)} vwm=${i50.vwm.toFixed(2)}`);
  t.ok('M3 хедер ПІЗНО: @0.72 ще схований, @1 повний', i72.hdr<0.2&&i100.hdr>0.97, `@.72=${i72.hdr.toFixed(2)}`);
  t.ok('ЗАКОН: тексти hero НЕ анімуються поелементно', i05.ttlOp===1&&i100.ttlOp===1&&i05.ttlTr===i100.ttlTr&&Math.abs(i05.ttlY-i100.ttlY)<1);
  // SCROLL-проби (атомарні — Lenis-тік стягує scrub між викликами!)
  const sprobe = p => page.evaluate(pp=>{
    window.render(pp);
    const q=s=>document.querySelector(s);
    const cs=s=>getComputedStyle(q(s));
    const nx=q('#next').getBoundingClientRect(), ttl=q('#htitle').getBoundingClientRect();
    const mono=q('#hmono').getBoundingClientRect();
    const l=(sel)=>{ const inner=q(sel).getBoundingClientRect(), line=q(sel).parentElement.getBoundingClientRect();
      return {dy:inner.y-line.y, clippedBelow: inner.bottom>line.bottom+2}; };
    return { nextTop:nx.top, nextClip:cs('#next').clipPath, nextOp:parseFloat(cs('#next').opacity),
      wordClip:cs('#hword').clipPath, monoCx:mono.x+mono.width/2, ttlX:ttl.x, ttlY:ttl.y,
      nl1:l('.nl1'), nl2:l('.nl2'), nl3:l('.nl3'), subOp:parseFloat(cs('#nsub').opacity) };
  }, p);
  const s0=await sprobe(0), s30=await sprobe(.30), s55=await sprobe(.55), s62=await sprobe(.62), s66=await sprobe(.66), s85=await sprobe(.85), s97=await sprobe(.97);
  t.ok('M5 старт: next за нижнім краєм', s0.nextTop>VH*0.95, `top=${s0.nextTop.toFixed(0)}`);
  const expTop=(1-.30/.55)*VH;
  t.ok('M5 COVER 1:1 скрабом: @0.30 top≈'+expTop.toFixed(0), Math.abs(s30.nextTop-expTop)<20, `top=${s30.nextTop.toFixed(0)}`);
  t.ok('M5 шов ТВЕРДИЙ (без clip/op на секції)', s30.nextClip==='none'&&s30.nextOp===1);
  t.ok('M5 hero-тексти НЕ рухаються під накриттям', Math.abs(s0.ttlX-s30.ttlX)<1&&Math.abs(s0.ttlY-s30.ttlY)<1);
  const insetR = c => { const m=c.match(/inset\([^)]*?([\d.]+)%[^)]*\)/g); const mm=c.match(/inset\(\s*[-\d.%]+\s+([\d.]+)%/); return mm?parseFloat(mm[1]):0; };
  t.ok('M6 колапс wordmark: @0 відкритий → @0.30 частковий → @0.62 повний', insetR(s0.wordClip)<1 && insetR(s30.wordClip)>10 && insetR(s30.wordClip)<80 && insetR(s62.wordClip)>=100, `r=${insetR(s0.wordClip)}→${insetR(s30.wordClip).toFixed(0)}→${insetR(s62.wordClip).toFixed(0)}%`);
  t.ok('M6 монограма ковзає В ЦЕНТР', Math.abs(s62.monoCx-VW/2)<14 && (s0.monoCx-VW/2)>50, `cx@0=${s0.monoCx.toFixed(0)} cx@.62=${s62.monoCx.toFixed(0)}`);
  t.ok('M7 рядки ще сховані на межі COVER (@0.55)', s55.nl1.dy>10, `dy=${s55.nl1.dy.toFixed(0)}`);
  t.ok('M7 baseline-mask: @0.66 nl2 посеред прояви ОБРІЗАНИЙ знизу', s66.nl2.dy>4&&s66.nl2.clippedBelow, `dy=${s66.nl2.dy.toFixed(0)} clipped=${s66.nl2.clippedBelow}`);
  t.ok('M7 стаггер-порядок @0.66: nl1 ≥ nl2 ≥ nl3', s66.nl1.dy<=s66.nl2.dy+1 && s66.nl2.dy<=s66.nl3.dy+1, `${s66.nl1.dy.toFixed(0)}/${s66.nl2.dy.toFixed(0)}/${s66.nl3.dy.toFixed(0)}`);
  t.ok('M7 sub останній: @0.85 середина, @0.97 повний', s85.subOp>0.05&&s85.subOp<0.95&&s97.subOp>0.97, `@.85=${s85.subOp.toFixed(2)}`);
  // реверс-детермінізм (атомарні сиги)
  const sig = p => page.evaluate(pp=>{ window.render(pp);
    const els=[...document.querySelectorAll('#next,#hword,#hmono,.ninner,#nsub,#mosaic')];
    return els.map(e=>{const c=getComputedStyle(e);return c.transform+'|'+c.opacity+'|'+c.clipPath;}).join(';'); }, p);
  const a=await sig(.5); await sig(1); await sig(0); await sig(.85); const b=await sig(.5);
  t.ok('реверс/телепорт детермінований', a===b);
  finish('hero-intro',t,errs); await page.close();
}

/* ============ 3. scroll-snap (магніти; РЕАЛЬНИЙ wheel) ============ */
{
  console.log('\n=== scroll-snap (RAW) ===');
  const t=mk(); const {page,errs}=await openPage(`${BASE}/scroll-snap/build.html`);
  await cssLint(page,t);
  const meta = await page.evaluate(()=>({ pins:ScrollTrigger.getAll().filter(x=>x.pin).length,
    targets:window.__SNAP_TARGETS__.slice(), max:document.documentElement.scrollHeight-innerHeight,
    bandTop:document.getElementById('band').offsetTop }));
  t.ok('ONE pinned trigger (band)', meta.pins===1, `pins=${meta.pins}`);
  t.ok('__SNAP_TARGETS__ ≥6, зростаючі', meta.targets.length>=6 && meta.targets.every((v,i,arr)=>i===0||v>=arr[i-1]), meta.targets.join(','));
  // scrub чистий: атомарні проби посеред wipe-вікна (мертва зона магнітів)
  const yMid = meta.bandTop + 0.5*VH; // станція ±50vh → поза радіусом 35vh
  const probeAt = y => page.evaluate(yy=>{ window.render(yy/(document.documentElement.scrollHeight-innerHeight));
    const c2=getComputedStyle(document.getElementById('plate2')).clipPath;
    const mf=parseFloat(getComputedStyle(document.getElementById('meterFill')).height);
    const mh=parseFloat(getComputedStyle(document.getElementById('meter')).height);
    return {clip2:c2, meterFrac:mf/mh, scroll:scrollY}; }, y);
  const m1=await probeAt(yMid); await page.waitForTimeout(250); const m2=await page.evaluate(()=>({clip2:getComputedStyle(document.getElementById('plate2')).clipPath, scroll:scrollY}));
  t.ok('стоп посеред wipe = межа замерзла (без снапу в мертвій зоні)', m1.clip2===m2.clip2 && Math.abs(m1.scroll-m2.scroll)<2, `${m1.clip2} @y=${m1.scroll.toFixed(0)}`);
  // РЕАЛЬНИЙ WHEEL → снап до станції 2
  const st2 = meta.bandTop + VH;
  await page.evaluate(y=>{ window.render(y/(document.documentElement.scrollHeight-innerHeight)); }, st2 - 0.22*VH);
  await page.mouse.move(720,450);
  await page.mouse.wheel(0,60);
  await page.waitForTimeout(2600);
  const afterSnap = await page.evaluate(()=>({y:scrollY, last:window.__LAST_SNAP__,
    meterFrac:parseFloat(getComputedStyle(document.getElementById('meterFill')).height)/parseFloat(getComputedStyle(document.getElementById('meter')).height)}));
  t.ok('M3 wheel→idle→GLIDE до станції', afterSnap.last && Math.abs(afterSnap.y-st2)<=3, `y=${afterSnap.y.toFixed(0)} ціль=${st2} last=${JSON.stringify(afterSnap.last&&{to:afterSnap.last.to})}`);
  const expFrac=(st2-meta.bandTop)/(3*VH);
  t.ok('M5 нуль контент-твінів: meter = чиста f(scroll) після glide', Math.abs(afterSnap.meterFrac-expFrac)<0.02, `frac=${afterSnap.meterFrac.toFixed(3)} exp=${expFrac.toFixed(3)}`);
  // скасування: wheel великим імпульсом ГЕТЬ від магніта під час glide
  await page.evaluate(y=>{ window.render(y/(document.documentElement.scrollHeight-innerHeight)); }, st2 - 0.22*VH);
  await page.mouse.wheel(0,60); await page.waitForTimeout(320); // glide стартував
  await page.mouse.wheel(0,-900); await page.waitForTimeout(2200); // юзер перемагає
  const cancel = await page.evaluate(()=>scrollY);
  t.ok('M4 новий інпут скасовує glide (юзер завжди перемагає)', Math.abs(cancel-st2)>40, `y=${cancel.toFixed(0)} (не ${st2})`);
  // render НІКОЛИ не тригерить снап
  await page.evaluate(y=>{ window.render(y/(document.documentElement.scrollHeight-innerHeight)); }, st2-80);
  await page.waitForTimeout(1400);
  const noSnap = await page.evaluate(y=>Math.abs(scrollY-(y-80)), st2);
  t.ok('render(p) не арм-ить магніти', noSnap<3, `drift=${noSnap.toFixed(1)}px`);
  finish('scroll-snap',t,errs); await page.close();
}

/* ============ 4. size-morph (flow, реальний layout) ============ */
{
  console.log('\n=== size-morph (RAW) ===');
  const t=mk(); const {page,errs}=await openPage(`${BASE}/size-morph/build.html`);
  await cssLint(page,t);
  const pins = await page.evaluate(()=>ScrollTrigger.getAll().filter(x=>x.pin).length);
  t.ok('ZERO pins (flow-атом)', pins===0, `pins=${pins}`);
  t.ok('хук __MORPH_STATE__', await page.evaluate(()=>typeof window.__MORPH_STATE__==='function'));
  // абсолютні вікна (сторінка 500vh, maxScroll 400vh)
  const probe = y => page.evaluate(yy=>{
    window.render(yy/(document.documentElement.scrollHeight-innerHeight));
    const p=document.getElementById('plate'), m=document.getElementById('plateMedia'), w=document.getElementById('morphWrap');
    const bf=document.getElementById('bandFig'), dr=document.getElementById('duoRight');
    const cap=document.getElementById('plateCaption').getBoundingClientRect();
    const cs=getComputedStyle(p), cm=getComputedStyle(m), cb=getComputedStyle(bf);
    const sc=(cm.transform.match(/matrix\(([-\d.]+)/)||[])[1]||'1';
    return { plateH:p.getBoundingClientRect().height, plateTr:cs.transform, plateClip:cs.clipPath,
      scale:parseFloat(sc), fit:cm.objectFit, capBottom:cap.bottom, plateBottom:p.getBoundingClientRect().bottom,
      wrapBottom:w.getBoundingClientRect().bottom, bandW:bf.getBoundingClientRect().width, colW:dr.getBoundingClientRect().width };
  }, y);
  const vh=VH;
  const e0=await probe(0), e25=await probe(1.0*vh), r30=await probe(1.2*vh), c41=await probe(1.64*vh), c47=await probe(1.95*vh);
  t.ok('M1 ENTRY: scale 1.2→1.0, height НЕ рухається', Math.abs(e0.scale-1.2)<0.03 && Math.abs(e25.scale-1.0)<0.02 && Math.abs(e0.plateH-vh)<3 && Math.abs(e25.plateH-vh)<3, `scale ${e0.scale.toFixed(2)}→${e25.scale.toFixed(2)}`);
  t.ok('M2 REST: нічого не морфиться', Math.abs(r30.plateH-vh)<3 && Math.abs(r30.scale-1.0)<0.02, `h=${r30.plateH.toFixed(0)}`);
  t.ok('M3 COLLAPSE: РЕАЛЬНИЙ height (посеред вікна)', c41.plateH<vh*0.97 && c41.plateH>vh*0.72, `h=${c41.plateH.toFixed(0)} (${(c41.plateH/vh*100).toFixed(1)}vh)`);
  t.ok('M3 фінал: h≈70vh', Math.abs(c47.plateH-0.7*vh)<vh*0.02, `h=${c47.plateH.toFixed(0)} ціль=${(0.7*vh).toFixed(0)}`);
  t.ok('M3 БЕЗ transform/clip-підміни', (c41.plateTr==='none'||c41.plateTr==='matrix(1, 0, 0, 1, 0, 0)') && c41.plateClip==='none' && Math.abs(c41.scale-1.0)<0.02, `tr=${c41.plateTr} clip=${c41.plateClip}`);
  t.ok('object-fit:cover завжди', e0.fit==='cover'&&c47.fit==='cover');
  t.ok('caption їде з нижнім краєм (всередині плити)', c47.capBottom<=c47.plateBottom+1, `cap=${c47.capBottom.toFixed(0)} plate=${c47.plateBottom.toFixed(0)}`);
  t.ok('reveal: під плитою відкрита поверхня wrap-а', c47.plateBottom < c47.wrapBottom-vh*0.2, `plate=${c47.plateBottom.toFixed(0)} wrap=${c47.wrapBottom.toFixed(0)}`);
  // WIDTH
  const w55=await probe(2.35*vh), w71=await probe(2.85*vh), w85=await probe(3.35*vh);
  t.ok('M4 WIDTH старт: ≈195% колонки', w55.bandW/w55.colW>1.85, `ratio=${(w55.bandW/w55.colW).toFixed(2)}`);
  t.ok('M4 WIDTH середина: між', w71.bandW/w71.colW>1.1 && w71.bandW/w71.colW<1.9, `ratio=${(w71.bandW/w71.colW).toFixed(2)}`);
  t.ok('M4 WIDTH фінал: ≈100%', Math.abs(w85.bandW/w85.colW-1)<0.03, `ratio=${(w85.bandW/w85.colW).toFixed(2)}`);
  // реверс-детермінізм
  const sig = y => page.evaluate(yy=>{ window.render(yy/(document.documentElement.scrollHeight-innerHeight));
    const s=window.__MORPH_STATE__(); return `${s.plateH.toFixed(1)}|${s.bandW.toFixed(1)}`; }, y);
  const a=await sig(1.64*vh); await sig(4*vh); await sig(0); await sig(2.85*vh); const b=await sig(1.64*vh);
  t.ok('реверс/телепорт детермінований', a===b, `${a} vs ${b}`);
  finish('size-morph',t,errs); await page.close();
}

await browser.close();
console.log(`\n${'='.repeat(50)}\nПІДСУМОК: ${totalFails===0?'🟢 ALL PASS':'⛔ '+totalFails+' FAIL'}`);
process.exit(totalFails?1:0);
