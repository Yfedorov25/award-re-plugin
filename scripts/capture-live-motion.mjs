#!/usr/bin/env node
/* ============================================================================
   capture-live-motion.mjs — OPTION A (council #1 verdict: the real bottleneck is
   SOURCING, not rendering). The old spec-scraper drove $(body).data(smoothScroll)
   .scrollTo(y) + settled 420ms, then read bbox. That TELEPORTS past the pin's
   internal timeline, so pinned atoms (nature-title) freeze at one pose the whole
   band (y180 every frame = settled-capture artifact). Video shows they DO move.

   THE FIX: drive the page with REAL wheel deltas (CDP Input.dispatchMouseEvent
   'mouseWheel'), let the site's own SmoothScroll + pin timeline run, and read the
   tracked elements PER rAF as the motion actually plays. This records the LIVING
   choreography (where atoms are mid-flight), not just where they settle.

   Emits spec/motion/frame-<NNN>.json (per-rAF viewport bbox+style+src) + a
   motion-manifest.json (axis = live smoothScroll .currentPos, not document Y).

   Usage: node scripts/capture-live-motion.mjs [--frames 120] [--wheel 90]
============================================================================ */
import { resolveChromium, SITES, VIEWPORTS } from './token-extractor.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

function arg(n,d){ const i=process.argv.indexOf('--'+n); return i>-1?process.argv[i+1]:d; }
const FRAMES = parseInt(arg('frames','120'));   // rAF samples across the band
const WHEEL  = parseInt(arg('wheel','90'));     // px per wheel tick
const site = SITES['springs-home'];
const vp = VIEWPORTS.desktop || { width:1440, height:900 };
const outDir = join(process.cwd(),'spec','motion');
mkdirSync(outDir,{recursive:true});

const TRACK = [
  ['nature-section','.l-nature'],
  ['nature-title','.l-nature h2, .l-nature [class*="title"]'],
  ['nature-slider','.l-nature [class*="slider"]'],
  ['nature-slide-img','.l-nature img'],
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
// CDP session for real wheel gestures (drives the site's OWN smooth-scroll physics)
const client = await ctx.newCDPSession(page);

console.log('→ opening', site.liveOrigin+site.livePath);
await page.goto(site.liveOrigin+site.livePath,{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForTimeout(6000);
for(const sel of ['.js-cookie-consent-accept','button:has-text("ACCEPT")']){ try{await page.click(sel,{timeout:1200});break;}catch{} }
await page.waitForFunction(()=>{const p=document.querySelector('.js-preloader');return !p||getComputedStyle(p).display==='none'||parseFloat(getComputedStyle(p).opacity)<0.05;},{timeout:25000}).catch(()=>{});
await page.waitForTimeout(1500);
await page.evaluate(()=>document.fonts&&document.fonts.ready);

// live smooth-scroll instance — used ONLY to READ the true scroll axis (.currentPos), NOT to drive.
const axisInfo = await page.evaluate(()=>{
  const $=window.jQuery||window.$; const inst=$&&$('body').data('smoothScroll');
  // discover a numeric "current position" field on the instance (varies by build)
  let field=null;
  if(inst){ for(const k of ['currentPos','current','scrollPos','lastScrollPosition','pos','y']){
    if(typeof inst[k]==='number'){ field=k; break; } } }
  window.__DRV = inst||null; window.__AXFIELD = field;
  return { hasInst: !!inst, field };
});
console.log('  axis:', axisInfo.hasInst? ('smoothScroll.'+(axisInfo.field||'(none found → using window.scrollY)')) : 'window.scrollY');

const readAxis = ()=>page.evaluate(()=>{
  if(window.__DRV && window.__AXFIELD) return window.__DRV[window.__AXFIELD];
  return window.scrollY;
});

// wheel one tick via CDP at viewport center, then wait one rAF so the smooth-scroll advances
async function wheelTick(dy){
  await client.send('Input.dispatchMouseEvent',{ type:'mouseWheel', x:vp.width/2, y:vp.height/2, deltaX:0, deltaY:dy });
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
}

const READ = (track)=>page.evaluate((track)=>{
  const abs=(u)=>{ try{return new URL(u,location.href).href;}catch{return u;} };
  const vis=(e)=>{const r=e.getBoundingClientRect();return r.width>1&&getComputedStyle(e).display!=='none';};
  const out={};
  for(const [name,sel] of track){
    let el;
    if(name==='nature-slide-img'){
      const imgs=[...document.querySelectorAll('.l-nature img')].filter(vis);
      el = imgs.find(im=>/slider-md/.test((im.currentSrc||im.src||''))) || imgs[0];
    } else { el=[...document.querySelectorAll(sel)].find(vis); }
    if(!el){ out[name]=null; continue; }
    const r=el.getBoundingClientRect(); const c=getComputedStyle(el);
    const grab=(node)=>{ if(node.tagName==='IMG'&&(node.currentSrc||node.src)) return node.currentSrc||node.src;
      const bg=getComputedStyle(node).backgroundImage; const m=bg&&bg.match(/url\(["']?(.*?)["']?\)/); return m?m[1]:null; };
    let src=grab(el);
    if(!src){ for(const im of el.querySelectorAll('img')){ if(im.currentSrc||im.src){ src=im.currentSrc||im.src; break; } } }
    out[name]={ tag:el.tagName.toLowerCase(),
      x:+r.x.toFixed(1), y:+r.y.toFixed(1), w:+r.width.toFixed(1), h:+r.height.toFixed(1),
      transform:c.transform, opacity:+parseFloat(c.opacity).toFixed(3),
      fontSize:c.fontSize, fontFamily:c.fontFamily.split(',')[0].replace(/["']/g,''),
      zIndex:c.zIndex, src: src?abs(src):null, srcBase: src?(abs(src).split('/').pop().split('?')[0]):null,
      text:(el.textContent||'').trim().slice(0,80) };
  }
  return out;
},track);

// ── find the band by real wheeling: wheel until nature-title reveals (op≥0.5) ──
console.log('→ wheeling to Nature reveal …');
let guard=0, revealed=false;
while(guard++ < 400){
  await wheelTick(WHEEL);
  const s=await page.evaluate(()=>{ const vis=(e)=>{const r=e.getBoundingClientRect();return r.width>1;};
    const nt=[...document.querySelectorAll('.l-nature h2,.l-nature [class*="title"]')].find(vis);
    return nt?parseFloat(getComputedStyle(nt).opacity):0; });
  if(s>=0.5){ revealed=true; break; }
}
if(!revealed){ console.error('❌ nature-title never revealed via wheel — check reachability/preloader'); await browser.close(); process.exit(2); }
const axStart = await readAxis();
console.log('  reveal reached at axis=',axStart,'(guard',guard,'ticks)');

// ── now sample PER rAF as we keep wheeling through Nature→Place ────────────────
console.log('→ capturing', FRAMES,'per-rAF motion frames …');
const manifest=[]; let placeSettled=0;
for(let i=0;i<FRAMES;i++){
  await wheelTick(WHEEL);
  const ax=await readAxis();
  const spec=await READ(TRACK);
  const pct=String(i).padStart(3,'0');
  writeFileSync(join(outDir,`frame-${pct}.json`), JSON.stringify({i,axis:ax,vp,spec},null,1));
  manifest.push({i,axis:ax});
  // stop early once Place has fully settled near top and started leaving
  const pt=spec['place-title'];
  if(pt && pt.opacity>0.9 && pt.y<vp.height*0.5) placeSettled++;
  if(placeSettled>8){ console.log('  Place settled+scrolling → stop at frame',i); break; }
}
writeFileSync(join(outDir,'motion-manifest.json'), JSON.stringify({
  axisField: axisInfo.field||'window.scrollY', wheelPx:WHEEL, frames:manifest.length,
  axisStart:axStart, vp, band:[manifest[0]?.axis, manifest[manifest.length-1]?.axis]
},null,1));
await browser.close();
console.log(`✅ captured ${manifest.length} per-rAF motion frames → spec/motion/`);

// quick diagnostic: did nature-title actually MOVE this time (vs frozen y180)?
import { readdirSync, readFileSync } from 'fs';
const mf=readdirSync(outDir).filter(f=>/^frame-\d+\.json$/.test(f)).sort();
const ys=mf.map(f=>{const s=JSON.parse(readFileSync(join(outDir,f),'utf8')).spec['nature-title'];return s?Math.round(s.y):null;}).filter(v=>v!=null);
const uniq=[...new Set(ys)];
console.log(`   nature-title y across band: ${uniq.length} distinct values (${Math.min(...ys)}..${Math.max(...ys)}) — ${uniq.length>3?'MOVES ✅ (living motion captured)':'FROZEN ❌ (still settled-capture — driver still teleporting)'}`);
