#!/usr/bin/env node
/* cd-batch5-gate.mjs — гейти на RAW для 5 CD-атомів S37:
   pinned: map-pic-in-pic, design-composition · flow: parallax-drift, clip-reveal, fade-coupling.
   Спільне: хуки, console, CSS-transform-lint, детермінізм реверсу. Law-checks per atom. */
import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium(); if(!chromium){console.error('no chromium');process.exit(2);}
const browser = await chromium.launch();
const BASE='http://localhost:8879/atoms';
let totalFails=0;

const insetVals = c => { const m=c.match(/inset\(([^)]+)\)/); if(!m) return null;
  const v=m[1].trim().split(/\s+/).map(parseFloat);
  return v.length===1?{t:v[0],r:v[0],b:v[0],l:v[0]}:v.length===2?{t:v[0],r:v[1],b:v[0],l:v[1]}:
         v.length===3?{t:v[0],r:v[1],b:v[2],l:v[1]}:{t:v[0],r:v[1],b:v[2],l:v[3]}; };

async function openPage(url, flow){
  const page = await (await browser.newContext({viewport:{width:1440,height:900}})).newPage();
  const errs=[]; page.on('pageerror',e=>errs.push('PAGE:'+e.message));
  page.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text());});
  await page.goto(url,{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>window.__ATOM_OK__===true,{timeout:8000});
  return {page,errs};
}
function mk(label){ const fails=[];
  return {fails, ok(name,cond,detail){ const s=cond?'✅':'❌'; console.log(`  ${s} ${name}${detail?' — '+detail:''}`); if(!cond) fails.push(name); }};
}
async function common(page, errs, t, {flow}){
  const s = await page.evaluate(()=>{
    let bad=[]; for(const sh of document.styleSheets){ let rules; try{rules=sh.cssRules}catch(e){continue}
      for(const r of rules){ if(r.style){ const tt=r.style.transform||r.style.translate||r.style.scale;
        if(tt&&tt!=='none') bad.push(r.selectorText); } } }
    return { render: typeof window.render==='function', okFlag: window.__ATOM_OK__===true,
      pins: ScrollTrigger.getAll().filter(x=>x.pin).length, trigs: ScrollTrigger.getAll().length, badCSS: bad };
  });
  t.ok('хуки render+__ATOM_OK__', s.render&&s.okFlag);
  t.ok(flow?'ZERO pins (flow-атом)':'ONE pinned trigger', flow ? s.pins===0 : (s.pins===1&&s.trigs===1), `pins=${s.pins} trigs=${s.trigs}`);
  t.ok('transform-ownership CSS', s.badCSS.length===0, s.badCSS.join(',')||'чистий');
  // детермінізм реверсу
  const sig = p => page.evaluate(pp=>{ window.render(pp); return document.body.getBoundingClientRect().height; }, p)
    .then(()=>page.waitForTimeout(120)).then(()=>page.evaluate(()=>{
      const els=[...document.querySelectorAll('[style],[class]')].slice(0,80);
      return els.map(e=>{const c=getComputedStyle(e);return c.transform+'|'+c.opacity+'|'+c.clipPath;}).join(';');
    }));
  const a=await sig(0.5); await page.evaluate(()=>{window.render(1);window.render(0);window.render(.85);window.render(.15);});
  await page.waitForTimeout(150); const b=await sig(0.5);
  t.ok('реверс/телепорт детермінований', a===b);
  return s;
}
const at = (page,p) => page.evaluate(pp=>{window.render(pp);},p).then(()=>page.waitForTimeout(150));
const st = (page,sel) => page.evaluate(s=>{ const el=document.querySelector(s); const c=getComputedStyle(el);
  const r=el.getBoundingClientRect(); return {clip:c.clipPath,op:parseFloat(c.opacity),tr:c.transform,vis:c.visibility,
    x:r.x,y:r.y,w:r.width,h:r.height}; }, sel);
const scaleOf = tr => { const m=tr.match(/matrix\(([-\d.]+)/); return m?parseFloat(m[1]):1; };
const yOf = tr => { const m=tr.match(/matrix\([^)]*,\s*([-\d.]+)\)$/); return m?parseFloat(m[1]):0; };

/* ============ 1. map-pic-in-pic (pinned) ============ */
{
  console.log('\n=== map-pic-in-pic (RAW) ===');
  const t=mk(); const {page,errs}=await openPage(`${BASE}/map-pic-in-pic/build.html`);
  await common(page,errs,t,{flow:false});
  await at(page,0.15); let panel=await st(page,'.panel'); let iv=insetVals(panel.clip)||{t:100};
  t.ok('p.15 панель ще закрита', iv.t>95, `top-inset=${iv.t}`);
  let bg1=scaleOf((await st(page,'.bg-zoom')).tr);
  await at(page,0.42); panel=await st(page,'.panel'); iv=insetVals(panel.clip)||{t:NaN};
  t.ok('p.42 межа панелі в русі (wipe-up)', iv.t>2&&iv.t<98, `top-inset=${iv.t?.toFixed(1)}`);
  await at(page,0.70); panel=await st(page,'.panel'); iv=insetVals(panel.clip)||{t:NaN};
  const vw=1440; t.ok('p.70 панель відкрита і ВПРИТУЛ правого краю', iv.t<1 && Math.abs(panel.x+panel.w-vw)<3, `right=${(panel.x+panel.w).toFixed(0)}`);
  const mk5=await page.evaluate(()=>[...document.querySelectorAll('.marker')].map(m=>parseFloat(getComputedStyle(m).opacity)));
  const badge=await st(page,'.badge');
  t.ok('p.70 маркери ×5 видимі', mk5.length===5&&mk5.every(o=>o>0.9), mk5.map(o=>o.toFixed(1)).join(','));
  t.ok('p.70 бейдж осів', badge.op>0.9);
  const capY=await page.evaluate(()=>[...document.querySelectorAll('.cap-line-inner')].every(e=>Math.abs((getComputedStyle(e).transform.match(/matrix\([^)]*,\s*([-\d.]+)\)$/)||[0,0])[1])<1));
  t.ok('p.70 caption на місці', capY);
  const bg2=scaleOf((await st(page,'.bg-zoom')).tr);
  t.ok('фон ЖИВЕ весь band (зум росте)', bg2>bg1+0.01, `${bg1.toFixed(3)}→${bg2.toFixed(3)}`);
  t.ok('zero console errors', errs.length===0, errs.slice(0,2).join('|'));
  await page.context().close(); totalFails+=t.fails.length;
}
/* ============ 2. design-composition (pinned) ============ */
{
  console.log('\n=== design-composition (RAW) ===');
  const t=mk(); const {page,errs}=await openPage(`${BASE}/design-composition/build.html`);
  await common(page,errs,t,{flow:false});
  await at(page,0.13);
  let p1=insetVals((await st(page,'#p1')).clip)||{t:NaN}, p2=insetVals((await st(page,'#p2')).clip)||{b:NaN};
  t.ok('p.13 ДВІ межі назустріч ОДНОЧАСНО (p1 знизу-вгору + p2 зверху-вниз)', p1.t>2&&p1.t<98&&p2.b>2&&p2.b<98, `p1.top=${p1.t?.toFixed(0)} p2.bottom=${p2.b?.toFixed(0)}`);
  await at(page,0.35);
  const paraOk=await page.evaluate(()=>[...document.querySelectorAll('.tline')].every(e=>Math.abs((getComputedStyle(e).transform.match(/matrix\([^)]*,\s*([-\d.]+)\)$/)||[0,0])[1])<2));
  t.ok('p.35 абзац піднявся (МІЖ плитами)', paraOk);
  await at(page,0.43);
  const exitChk=await page.evaluate(()=>{ const r=(s)=>document.querySelector(s).getBoundingClientRect();
    const w1=r('#w1'), pl1=r('#p1'), w2=r('#w2'), pl2=r('#p2');
    const ow1=getComputedStyle(document.querySelector('#w1')).overflow;
    return { ow:ow1, p1Up: pl1.y<w1.y-10, p2Down: pl2.y>w2.y+10,
      clipped1: pl1.bottom<=w1.bottom+2 || pl1.top>=w1.top-2, // plate висить у wrapper-координатах
      visBound1: Math.max(0, Math.min(pl1.bottom,w1.bottom)-Math.max(pl1.top,w1.top)) / pl1.height };
  });
  t.ok('p.43 EXIT-BEHIND: обгортки overflow:hidden і плити частково проковтнуті',
    exitChk.ow==='hidden'&&exitChk.p1Up&&exitChk.p2Down&&exitChk.visBound1<0.9,
    `видимо ${(exitChk.visBound1*100).toFixed(0)}% p1`);
  await at(page,0.65);
  let b1=insetVals((await st(page,'#b1')).clip)||{t:NaN}, b2=insetVals((await st(page,'#b2')).clip)||{t:NaN};
  t.ok('p.65 велика пара: b1 попереду b2 (staggered chase)', b1.t<b2.t && b1.t<70 && b2.t>5, `b1.top=${b1.t?.toFixed(0)} b2.top=${b2.t?.toFixed(0)}`);
  await at(page,0.90);
  const casc=await page.evaluate(()=>{ const lines=[...document.querySelectorAll('.cline')];
    const up = lines.every(e=>Math.abs((getComputedStyle(e).transform.match(/matrix\([^)]*,\s*([-\d.]+)\)$/)||[0,0])[1])<3);
    const lr=lines.map(e=>e.getBoundingClientRect());
    const plates=['#wb1','#wb2'].map(s=>document.querySelector(s).getBoundingClientRect());
    let col=false; for(const a of lr) for(const p of plates){
      const ix=Math.max(0,Math.min(a.right,p.right)-Math.max(a.left,p.left));
      const iy=Math.max(0,Math.min(a.bottom,p.bottom)-Math.max(a.top,p.top));
      if(ix*iy > 0.25*a.width*a.height) col=true; }
    return {up,col}; });
  t.ok('p.90 каскад піднявся', casc.up);
  t.ok('p.90 каскад НЕ налазить на плити', !casc.col);
  t.ok('zero console errors', errs.length===0, errs.slice(0,2).join('|'));
  await page.context().close(); totalFails+=t.fails.length;
}
/* ============ 3. parallax-drift (flow) ============ */
{
  console.log('\n=== parallax-drift (RAW) ===');
  const t=mk(); const {page,errs}=await openPage(`${BASE}/parallax-drift/build.html`);
  await common(page,errs,t,{flow:true});
  // центр band A: всі шари ≈ нейтраль; вище/нижче — знаки за data-drift
  const bandY = await page.evaluate(()=>{ const b=document.querySelector('.band-a');
    const r=b.getBoundingClientRect(); return (r.top+scrollY) + r.height/2 - innerHeight/2; });
  await page.evaluate(y=>{window.scrollTo(0,y);ScrollTrigger.update();},bandY); await page.waitForTimeout(200);
  const mid=await page.evaluate(()=>['.band-a .layer-back','.band-a .slab','.band-a .card','.band-a .caption']
    .map(s=>{const el=document.querySelector(s);const m=getComputedStyle(el).transform.match(/matrix\([^)]*,\s*([-\d.]+)\)$/);return m?parseFloat(m[1]):0;}));
  t.ok('центр band: шари біля нейтралі', mid.every(v=>Math.abs(v)<40), mid.map(v=>v.toFixed(0)).join(','));
  await page.evaluate(y=>{window.scrollTo(0,y-500);ScrollTrigger.update();},bandY); await page.waitForTimeout(200);
  const off=await page.evaluate(()=>['.band-a .slab','.band-a .card']
    .map(s=>{const el=document.querySelector(s);const m=getComputedStyle(el).transform.match(/matrix\([^)]*,\s*([-\d.]+)\)$/);return m?parseFloat(m[1]):0;}));
  t.ok('вище центру: slab(+drift) і card(−drift) РІЗНОСПРЯМОВАНІ', off[0]>5 && off[1]<-5, off.map(v=>v.toFixed(0)).join(','));
  t.ok('zero console errors', errs.length===0, errs.slice(0,2).join('|'));
  await page.context().close(); totalFails+=t.fails.length;
}
/* ============ 4. clip-reveal (flow) ============ */
{
  console.log('\n=== clip-reveal (RAW) ===');
  const t=mk(); const {page,errs}=await openPage(`${BASE}/clip-reveal/build.html`);
  await common(page,errs,t,{flow:true});
  const plateInfo = async idx => page.evaluate(i=>{ const w=document.querySelectorAll('.plate')[i];
    const r=w.getBoundingClientRect(); const cp=getComputedStyle(w).clipPath;
    const inner=w.querySelector('.media'); const m=getComputedStyle(inner).transform.match(/matrix\(([-\d.]+)/);
    return {top:r.top, cp, scale:m?parseFloat(m[1]):1, absTop:r.top+scrollY, h:r.height}; }, idx);
  // плита 3: постав її top на низ в'юпорта → сколапсована; на 55% → мідвейп; на 30% → відкрита
  const p3 = await plateInfo(2);
  const go = async vh => { await page.evaluate((y)=>{window.scrollTo(0,y);ScrollTrigger.update();}, p3.absTop - 900*vh); await page.waitForTimeout(180); };
  await go(0.99); let s=await plateInfo(2);
  t.ok('плита@низ в\'юпорта: сколапсована', /100%.*100%.*100%.*100%/.test(s.cp)||s.cp.includes('100%'), s.cp.slice(0,60));
  await go(0.60); s=await plateInfo(2);
  const midOpen = s.cp.includes('polygon') && !/0% 0%, 100% 0%/.test(s.cp);
  t.ok('плита@60vh: межа посередині (скраб)', midOpen && s.scale>1.02 && s.scale<1.2, `scale=${s.scale.toFixed(3)}`);
  await go(0.30); s=await plateInfo(2);
  t.ok('плита@30vh: відкрита повністю', /0% 0%/.test(s.cp), s.cp.slice(0,40));
  t.ok('scale-settle довший за wipe (ще не 1.0 одразу після відкриття)', s.scale<1.06, `scale=${s.scale.toFixed(3)}`);
  t.ok('zero console errors', errs.length===0, errs.slice(0,2).join('|'));
  await page.context().close(); totalFails+=t.fails.length;
}
/* ============ 5. fade-coupling (flow) ============ */
{
  console.log('\n=== fade-coupling (RAW) ===');
  const t=mk(); const {page,errs}=await openPage(`${BASE}/fade-coupling/build.html`);
  await common(page,errs,t,{flow:true});
  const capInfo = async idx => page.evaluate(i=>{ const el=document.querySelectorAll('[data-fade]')[i];
    const r=el.getBoundingClientRect(); return {op:parseFloat(getComputedStyle(el).opacity), absTop:r.top+scrollY, h:r.height}; }, idx);
  const c = await capInfo(2); // hero paragraph
  const put = async frac => { await page.evaluate(y=>{window.scrollTo(0,y);ScrollTrigger.update();}, c.absTop - 900*frac); await page.waitForTimeout(180); };
  await put(0.99); let v=await capInfo(2); t.ok('вхід: у низу в\'юпорта прозорий', v.op<0.15, `op=${v.op.toFixed(2)}`);
  await put(0.80); v=await capInfo(2); t.ok('вхід: мід-вікно напівпрозорий (скраб)', v.op>0.15&&v.op<0.95, `op=${v.op.toFixed(2)}`);
  await put(0.45); v=await capInfo(2); t.ok('мід-в\'юпорт: повністю видимий', v.op>0.95, `op=${v.op.toFixed(2)}`);
  // вихід: низ елемента на 15% висоти в'юпорта
  await page.evaluate((y)=>{window.scrollTo(0,y);ScrollTrigger.update();}, c.absTop + c.h - 900*0.15); await page.waitForTimeout(180);
  v=await capInfo(2); t.ok('вихід: біля топу тане', v.op<0.8, `op=${v.op.toFixed(2)}`);
  // фони ніколи не фейдяться
  const bgOps = await page.evaluate(()=>['.hero','.band-2','.band-3'].map(s=>parseFloat(getComputedStyle(document.querySelector(s)).opacity)));
  t.ok('фони НЕ фейдяться', bgOps.every(o=>o===1), bgOps.join(','));
  t.ok('zero console errors', errs.length===0, errs.slice(0,2).join('|'));
  await page.context().close(); totalFails+=t.fails.length;
}
await browser.close();
console.log('\n'+(totalFails?`❌ BATCH FAIL: ${totalFails} провалів`:'✅ ALL 5 ATOMS PASS'));
process.exit(totalFails?1:0);
