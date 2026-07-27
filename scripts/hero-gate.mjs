#!/usr/bin/env node
/* hero-gate.mjs — механічний гейт для amenities-hero (parallax-hero-fade).
   Закон РУХУ (scroll-driven):
     - facade parallax: transform рухається (drifts up) по скролу
     - title+hint FADE-out front-loaded (opacity 1→0 by p~0.5)
     - cream wipe-up: піднімається знизу (translateY 100%→0) по скролу
     - на p=1 cream повністю покриває (translateY ~0), title невидимий
     - 0 console-err, 0 404
   node scripts/hero-gate.mjs */
import { resolveChromium } from './token-extractor.mjs';
const chromium=await resolveChromium();
if(!chromium){ console.error('no chromium'); process.exit(2); }
const BASE='http://localhost:8879/atoms/amenities-hero/variants/hero.html';
let fails=0; const ok=(m)=>console.log('  ✓ '+m); const bad=(m)=>{console.log('  ✗ '+m);fails++;};
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const p=await ctx.newPage();
const errs=[],nf=[];
p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
p.on('pageerror',e=>errs.push(String(e)));
p.on('response',r=>{if(r.status()>=400)nf.push(r.status()+' '+r.url());});
await p.goto(BASE,{waitUntil:'networkidle'});

const state=()=>p.evaluate(()=>{
  const R=s=>document.querySelector(s);
  const cs=e=>getComputedStyle(e);
  const tb=R('#titleblock'), cream=R('#cream'), facade=R('#facade');
  return {
    titleOpacity:+cs(tb).opacity,
    hintOpacity:+cs(R('#hint')).opacity,
    creamTransform:cs(cream).transform,
    facadeTransform:cs(facade).transform,
    heroP:window.__HERO_API__.get()
  };
});
// drive via render(p) directly (deterministic)
const at=(pp)=>p.evaluate(v=>window.render(v),pp);

// p=0 start
await at(0); await p.waitForTimeout(60);
let s=await state();
if(s.titleOpacity>0.95) ok('p0: title видимий (opacity '+s.titleOpacity.toFixed(2)+')'); else bad('p0 title opacity '+s.titleOpacity);
if(s.creamTransform.includes('matrix')||s.creamTransform!=='none') ok('p0: cream трансформований (нижче екрана)'); else bad('p0 cream не трансформований');

// p=0.7 title should be faded
await at(0.7); await p.waitForTimeout(60);
s=await state();
if(s.titleOpacity<0.15) ok('p0.7: title зфейдився (opacity '+s.titleOpacity.toFixed(2)+')'); else bad('p0.7 title ще видимий '+s.titleOpacity.toFixed(2));

// monotonic cream rise: extract translateY at 3 points
async function creamY(pp){ await at(pp); await p.waitForTimeout(30);
  return p.evaluate(()=>{ const m=new DOMMatrix(getComputedStyle(document.getElementById('cream')).transform); return m.f; }); }
const y0=await creamY(0.1), y1=await creamY(0.5), y2=await creamY(0.95);
console.log('  ℹ cream translateY px @p0.1/0.5/0.95:',Math.round(y0),Math.round(y1),Math.round(y2));
if(y0>y1 && y1>y2) ok('cream ПІДНІМАЄТЬСЯ монотонно (знизу вгору wipe)'); else bad('cream rise не монотонний '+[y0,y1,y2].map(Math.round));
if(Math.abs(y2)<40) ok('p0.95: cream майже повністю покрив (y≈0)'); else bad('p0.95 cream не покрив, y='+Math.round(y2));

// facade parallax moves
async function facY(pp){ await at(pp); await p.waitForTimeout(30);
  return p.evaluate(()=>{ const m=new DOMMatrix(getComputedStyle(document.getElementById('facade')).transform); return m.f; }); }
const f0=await facY(0), f1=await facY(1);
if(f0!==f1) ok('facade parallax рухається (drift '+Math.round(f0-f1)+'px)'); else bad('facade не рухається');

// title fade coupled with hint
await at(0.3); const s3=await state();
if(Math.abs(s3.titleOpacity-s3.hintOpacity)<0.05) ok('title+hint fade coupled (разом)'); else bad('title/hint fade розсинхрон');

if(errs.length===0) ok('0 console-error'); else bad(errs.length+' err: '+errs.slice(0,2).join(' | '));
if(nf.length===0) ok('0 HTTP>=400'); else bad(nf.length+' bad: '+nf.slice(0,2).join(' | '));

await b.close();
console.log(fails===0?'\nPASS ✅ amenities-hero parallax-hero-fade':`\nFAIL ❌ ${fails}`);
process.exit(fails===0?0:1);
