#!/usr/bin/env node
/* ============================================================================
   spec-scraper.mjs — the ANSWER KEY (council verdict, REPLICA-SYSTEM-PLAN step 2).
   REWRITTEN S31+ after the previous version produced a GARBAGE key (S31 #19):
   its "scrub-control PROVEN" was a false positive — it drove page TRANSLATION but
   the pinned Nature timeline never advanced, so all 51 frames had every element far
   below the viewport with the reveal never fired (opacity 0.005 everywhere).

   THE FIX — drive the site's OWN smooth-scroll instance (cracked S31 #19):
     springs uses a bespoke jQuery SmoothScroll plugin. The live instance is at
     $('body').data('smoothScroll') and exposes .scrollTo(y). Driving THAT advances
     the real timeline: title reveals (op 0.01→1), section pins into the viewport,
     geometry becomes viewport-relative and readable. CDP gestures / neutralising the
     lib both fail (gestures saturate before the pin; neutralise kills the timeline).

   Progress model: native document Y is the axis (the lib maps it to virtual scroll).
   We AUTO-DETECT the Nature→Place band [yStart..yEnd] (nature-title first reveals →
   place-title settled), then sample p∈[0..1] across it. Every sampled frame has the
   tracked elements ON-SCREEN (that's the whole point — a usable keyframe).

   Emits spec/frame-<pct>.json (viewport-relative bbox + computed style + real
   currentSrc) + spec/band.json (yStart,yEnd) + spec/assets-manifest.json.

   Usage: node scripts/spec-scraper.mjs [--steps 0.02]
============================================================================ */
import { resolveChromium, SITES, VIEWPORTS } from './token-extractor.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

function arg(n, d){ const i=process.argv.indexOf('--'+n); return i>-1?process.argv[i+1]:d; }
const STEP = parseFloat(arg('steps','0.02'));
const site = SITES['springs-home'];
const vp = VIEWPORTS.desktop || { width:1440, height:900 };
const outDir = join(process.cwd(),'spec');
mkdirSync(outDir,{recursive:true});

// element selectors to track in Nature→Place. The scraper records whichever exist and
// are VISIBLE. Slider selector targets the active slider-md photo specifically (the
// previous version grabbed the caption img by mistake).
const TRACK = [
  ['nature-section','.l-nature'],
  ['nature-title','.l-nature h2, .l-nature [class*="title"]'],
  ['nature-slider','.l-nature [class*="slider"]'],
  ['nature-slide-img','.l-nature img'],      // resolved to the active slider-md below
  ['nature-caption','.l-nature [class*="caption"]'],
  ['place-section','.l-place'],
  ['place-title','.l-place h2, .l-place [class*="title"]'],
  ['place-body','.l-place p'],
];

const chromium = await resolveChromium();
if(!chromium){ console.error('no chromium'); process.exit(2); }
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport:{width:vp.width,height:vp.height}, deviceScaleFactor:1 });
const page = await ctx.newPage();

console.log('→ opening', site.liveOrigin+site.livePath);
await page.goto(site.liveOrigin+site.livePath,{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForTimeout(6000);
for(const sel of ['.js-cookie-consent-accept','button:has-text("ACCEPT")']){ try{await page.click(sel,{timeout:1200});break;}catch{} }
await page.waitForFunction(()=>{const p=document.querySelector('.js-preloader');return !p||getComputedStyle(p).display==='none'||parseFloat(getComputedStyle(p).opacity)<0.05;},{timeout:25000}).catch(()=>{});
await page.waitForTimeout(1500);
await page.evaluate(()=>document.fonts&&document.fonts.ready);

// ── grab the live smooth-scroll instance (the cracked driver) ─────────────────
const haveDriver = await page.evaluate(()=>{
  const $=window.jQuery||window.$; if(!$)return false;
  const inst=$('body').data('smoothScroll'); if(!inst||typeof inst.scrollTo!=='function')return false;
  window.__DRV=inst; return true;
});
if(!haveDriver){ console.error('❌ could not grab $(body).data(smoothScroll).scrollTo — driver crack failed'); await browser.close(); process.exit(2); }
const drive = async (y)=>{ await page.evaluate(yy=>window.__DRV.scrollTo(yy), y); await page.waitForTimeout(420); };

// ── AUTO-DETECT the Nature→Place band ────────────────────────────────────────
// coarse sweep: yStart = first Y where nature-title opacity ≥ 0.5 (reveal begins);
// yEnd = Y where place-title has settled near the top (op ≥ 0.9 AND its section top ≤ ~vp.height).
const probe = ()=>page.evaluate(()=>{
  const vis=(e)=>{const r=e.getBoundingClientRect();return r.width>1&&getComputedStyle(e).display!=='none';};
  const q=(s)=>[...document.querySelectorAll(s)].find(vis);
  const nt=q('.l-nature h2,.l-nature [class*="title"]');
  const pt=q('.l-place h2,.l-place [class*="title"]');
  const pgetop=(e)=>e?Math.round(e.getBoundingClientRect().top):null;
  return { natOp:nt?parseFloat(getComputedStyle(nt).opacity):0, natTop:pgetop(nt),
    plOp:pt?parseFloat(getComputedStyle(pt).opacity):0, plTop:pgetop(pt) };
});
console.log('→ detecting Nature→Place band …');
let yStart=null, yEnd=null;
for(let y=6000;y<=20000;y+=250){
  await drive(y); const s=await probe();
  if(yStart===null && s.natOp>=0.5) yStart=y;
  if(yStart!==null && s.plOp>=0.9 && s.plTop!==null && s.plTop<=vp.height){ yEnd=y; break; }
}
if(yStart===null){ console.error('❌ nature-title never revealed — driver/band detection failed'); await browser.close(); process.exit(2); }
// pad the band a little on each side so we catch pre-reveal + post-settle keyframes
yStart=Math.max(0,yStart-600); yEnd=(yEnd||yStart+4500)+600;
console.log(`  band: yStart=${yStart} yEnd=${yEnd} (${yEnd-yStart}px)`);
writeFileSync(join(outDir,'band.json'), JSON.stringify({yStart,yEnd,vp},null,1));

// ── READ per element (viewport-relative bbox + style + real currentSrc) ───────
const READ = (track)=>page.evaluate((track)=>{
  const abs=(u)=>{ try{return new URL(u,location.href).href;}catch{return u;} };
  const vis=(e)=>{const r=e.getBoundingClientRect();return r.width>1&&getComputedStyle(e).display!=='none';};
  const out={};
  for(const [name,sel] of track){
    let el;
    if(name==='nature-slide-img'){
      // the ACTIVE slider photo: a visible .l-nature img whose src is a slider-md, else first img
      const imgs=[...document.querySelectorAll('.l-nature img')].filter(vis);
      el = imgs.find(im=>/slider-md/.test((im.currentSrc||im.src||''))) || imgs[0];
    } else {
      el=[...document.querySelectorAll(sel)].find(vis);
    }
    if(!el){ out[name]=null; continue; }
    const r=el.getBoundingClientRect(); const c=getComputedStyle(el);
    let src=null;
    const grab=(node)=>{ if(node.tagName==='IMG'&&(node.currentSrc||node.src)) return node.currentSrc||node.src;
      const bg=getComputedStyle(node).backgroundImage; const m=bg&&bg.match(/url\(["']?(.*?)["']?\)/); return m?m[1]:null; };
    src=grab(el);
    if(!src){ for(const im of el.querySelectorAll('img')){ if(im.currentSrc||im.src){ src=im.currentSrc||im.src; break; } } }
    if(!src){ for(const node of el.querySelectorAll('*')){ const g=grab(node); if(g){ src=g; break; } } }
    out[name]={ tag:el.tagName.toLowerCase(),
      x:+r.x.toFixed(1), y:+r.y.toFixed(1), w:+r.width.toFixed(1), h:+r.height.toFixed(1),
      transform:c.transform, opacity:+parseFloat(c.opacity).toFixed(3),
      fontSize:c.fontSize, fontFamily:c.fontFamily.split(',')[0].replace(/["']/g,''), fontWeight:c.fontWeight,
      borderRadius:c.borderRadius, zIndex:c.zIndex,
      src: src? abs(src): null, srcBase: src? (abs(src).split('/').pop().split('?')[0]) : null,
      text:(el.textContent||'').trim().slice(0,80) };
  }
  return out;
},track);

// ── sample p∈[0..1] across the band, write a frame per step ──────────────────
const phases=[]; for(let p=0;p<=1.0001;p+=STEP) phases.push(+p.toFixed(3));
const assetSet=new Set(); let written=0, onscreen=0;
console.log('→ scraping', phases.length,'phases across the band …');
for(const p of phases){
  const y=Math.round(yStart+p*(yEnd-yStart));
  await drive(y);
  const spec=await READ(TRACK);
  // did at least one tracked element land on-screen? (validity signal per frame)
  const anyOn = Object.values(spec).some(e=>e && e.y> -e.h*0.5 && e.y < vp.height*0.98);
  if(anyOn) onscreen++;
  const allSrcs=await page.evaluate(()=>{
    const abs=(u)=>{try{return new URL(u,location.href).href;}catch{return u;}};
    const set=new Set();
    for(const sel of ['.l-nature','.l-place']){ const sec=document.querySelector(sel); if(!sec)continue;
      sec.querySelectorAll('img').forEach(im=>{ if(im.currentSrc||im.src) set.add(abs(im.currentSrc||im.src)); });
      sec.querySelectorAll('*').forEach(e=>{ const m=getComputedStyle(e).backgroundImage.match(/url\(["']?(.*?)["']?\)/); if(m)set.add(abs(m[1])); });
    }
    return [...set];
  });
  allSrcs.forEach(u=>assetSet.add(u));
  for(const k in spec){ if(spec[k]&&spec[k].src) assetSet.add(spec[k].src); }
  const pct=String(Math.round(p*100)).padStart(3,'0');
  writeFileSync(join(outDir,`frame-${pct}.json`), JSON.stringify({p,y,vp,spec},null,1));
  written++;
}
writeFileSync(join(outDir,'assets-manifest.json'), JSON.stringify([...assetSet].sort(),null,1));
await browser.close();
console.log(`\n✅ wrote ${written} frame specs (${onscreen} with an element on-screen) + ${assetSet.size} asset URLs → spec/`);
if(onscreen < written*0.5) console.log('  ⚠️ fewer than half the frames had an on-screen element — check band detection.');
console.log('   next: node scripts/download-assets.mjs && node scripts/element-gate.mjs');
