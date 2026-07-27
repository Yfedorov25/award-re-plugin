#!/usr/bin/env node
/* ============================================================================
   capture-odometer.mjs — ATOM-FIRST simplified capture (S36).
   Scope: ONLY the springs odometer beat (3→9→16). Replaces the broad
   capture-live-motion.mjs which timed out (full-page wheel from top + heavy
   per-frame READ). Simplifications:
     1. Teleport (site's own smoothScroll.scrollTo) to just BEFORE the beat,
        then drive the band itself with REAL CDP wheel (springs ignores
        synthetic scroll — only CDP moves it).
     2. One evaluate per frame, tracking a FIXED small role-set discovered by
        an in-page probe: bg videos / card / digit / label.
     3. Hard time budget + stage logs; single capture.json (no 120 files).
   Output: library/techniques/atoms/odometer/capture.json
   Usage: node scripts/capture-odometer.mjs [--frames 140] [--wheel 140] [--budget 240]
============================================================================ */
import { resolveChromium, SITES, VIEWPORTS } from './token-extractor.mjs';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

function arg(n, d) { const i = process.argv.indexOf('--' + n); return i > -1 ? +process.argv[i + 1] : d; }
const FRAMES = arg('frames', 140);
const WHEEL = arg('wheel', 140);
const BUDGET = arg('budget', 240) * 1000;
const T0 = Date.now();
const left = () => BUDGET - (Date.now() - T0);
const site = SITES['springs-home'];
const vp = VIEWPORTS.desktop || { width: 1440, height: 900 };
const outDir = join(process.cwd(), 'library', 'techniques', 'atoms', 'odometer');
mkdirSync(outDir, { recursive: true });

const HEADED = process.argv.includes('--headed');
const chromium = await resolveChromium();
if (!chromium) { console.error('no chromium'); process.exit(2); }
const browser = await chromium.launch({ headless: !HEADED });
const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
const bail = async (msg) => { console.error('❌', msg); await browser.close(); process.exit(2); };

console.log('→ open', site.liveOrigin + site.livePath, `(budget ${BUDGET / 1000}s)`);
await page.goto(site.liveOrigin + site.livePath, { waitUntil: 'domcontentloaded', timeout: 60000 });
for (const sel of ['.js-cookie-consent-accept', 'button:has-text("ACCEPT")']) { try { await page.click(sel, { timeout: 1000 }); break; } catch { } }
await page.waitForFunction(() => { const p = document.querySelector('.js-preloader'); return !p || getComputedStyle(p).display === 'none' || parseFloat(getComputedStyle(p).opacity) < 0.05; }, { timeout: 20000 }).catch(() => { });
await page.waitForTimeout(1200);
console.log('  loaded in', ((Date.now() - T0) / 1000).toFixed(1), 's');

// smoothScroll instance: scrollTo for the APPROACH teleport, currentPos as axis
await page.evaluate(() => {
  const $ = window.jQuery || window.$; const inst = $ && $('body').data('smoothScroll');
  window.__DRV = inst || null; window.__AXF = null;
  if (inst) for (const k of ['currentPos', 'current', 'scrollPos', 'pos', 'y']) if (typeof inst[k] === 'number') { window.__AXF = k; break; }
});
const readAxis = () => page.evaluate(() => window.__DRV && window.__AXF ? window.__DRV[window.__AXF] : window.scrollY);
const wheelTick = async (dy) => {
  await cdp.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: vp.width / 2, y: vp.height / 2, deltaX: 0, deltaY: dy });
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
};

// in-page probe: the odometer digit box = visible element whose own text is exactly 3/9/16
const PROBE = () => page.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && r.bottom > 0 && r.top < innerHeight; };
  const own = (e) => [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
  const cand = [...document.querySelectorAll('body *')].filter(e => /^(3|9|16)$/.test(own(e)) && vis(e));
  if (!cand.length) return null;
  const digit = cand[0];
  const path = (e) => { const p = []; for (let n = e; n && n !== document.body && p.length < 6; n = n.parentElement) p.push(n.tagName.toLowerCase() + (n.className && typeof n.className === 'string' ? '.' + n.className.trim().split(/\s+/).join('.') : '')); return p; };
  return { text: own(digit), path: path(digit) };
});

// ── APPROACH: REAL wheel journey from the top (teleport scrollTo desyncs the
//    site's section state-machine → the place-video module never arms and the
//    caption clip reveals never fire — proven by runs 1-2). Big deltas until the
//    sticky container nears the viewport, then hand over to the fine capture. ──
console.log('→ approach: real wheel journey from top (big deltas) …');
const contTop = () => page.evaluate(() => { const c = document.querySelector('.l-place-video-container'); return c ? c.getBoundingClientRect().y : 99999; });
let cy = await contTop();
let jg = 0;
while (cy > vp.height * 1.4 && jg++ < 300 && left() > 90000) {
  await wheelTick(1400);
  if (jg % 10 === 0) { cy = await contTop(); if (jg % 30 === 0) console.log(`  … journey tick ${jg}, container ${Math.round(cy)}px below`); }
}
cy = await contTop();
if (cy > vp.height * 2.5) await bail('journey never reached the odometer container (contY=' + Math.round(cy) + ')');
console.log('  container near: contY=' + Math.round(cy) + ' after ' + jg + ' big ticks — settling …');
await page.waitForTimeout(1200); // let smooth-scroll inertia die before the fine pass

// ── CAPTURE: per-rAF role read while wheeling through the whole beat ──
const READ = () => page.evaluate(() => {
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1; };
  const own = (e) => [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
  const info = (e) => {
    if (!e) return null; const r = e.getBoundingClientRect(); const c = getComputedStyle(e);
    return { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1), op: +(+c.opacity).toFixed(3), tf: c.transform, clip: c.clipPath !== 'none' ? c.clipPath : (c.webkitClipPath || 'none'), z: c.zIndex };
  };
  // bg videos: big ones (≥70% viewport wide)
  const vids = [...document.querySelectorAll('video')].filter(vis).map(v => ({ src: (v.currentSrc || v.src || '').split('/').pop().split('?')[0], t: +v.currentTime.toFixed(2), ...info(v), big: v.getBoundingClientRect().width > innerWidth * 0.7 }));
  // digit boxes (during a roll there can be two glyphs)
  const digits = [...document.querySelectorAll('body *')].filter(e => /^\d{1,2}$/.test(own(e)) && vis(e) && e.getBoundingClientRect().top < innerHeight && e.getBoundingClientRect().bottom > 0)
    .slice(0, 4).map(e => ({ txt: own(e), ...info(e) }));
  // card = smallest ancestor of the digit that also contains an img/video (the photo card)
  let card = null, cardMedia = [];
  const d0 = [...document.querySelectorAll('body *')].find(e => /^\d{1,2}$/.test(own(e)) && vis(e));
  if (d0) {
    for (let n = d0.parentElement; n && n !== document.body; n = n.parentElement) {
      if (n.querySelector('img,video') && n.getBoundingClientRect().width < innerWidth * 0.6) { card = n; break; }
    }
    if (card) cardMedia = [...card.querySelectorAll('img,video')].slice(0, 3).map(m => ({ tag: m.tagName.toLowerCase(), src: (m.currentSrc || m.src || '').split('/').pop().split('?')[0], ...info(m), pclip: m.parentElement ? getComputedStyle(m.parentElement).clipPath : 'none' }));
  }
  // label: small uppercase text near the digit
  let label = null;
  if (d0) { const sib = [...(d0.parentElement?.parentElement || d0.parentElement).querySelectorAll('*')].find(e => /[A-Z]{4,}/.test(e.textContent || '') && (e.textContent || '').length < 60 && vis(e)); if (sib) label = { txt: (sib.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 50), ...info(sib) }; }
  // ── the LAW core: sticky band axis + per-item clip-path reveal boundary ──
  const cont = document.querySelector('.l-place-video-container');
  const contY = cont ? +cont.getBoundingClientRect().y.toFixed(1) : null;
  const items = [...document.querySelectorAll('.l-place-video__caption-item')]
    .filter(e => e.getBoundingClientRect().height > 10)
    .map(e => {
      const cp = getComputedStyle(e).clipPath;
      const m = cp && cp.match(/polygon\(\s*0%\s+([\d.]+)%/);
      return { digit: (e.querySelector('[class*="title"], .h0')?.textContent || '').trim(), reveal: cp === 'none' ? null : (m ? +(+m[1]).toFixed(2) : cp.slice(0, 40)) };
    });
  // bg hosts inside the sticky layer (video/picture full-bleed) — mount only with codecs (headed)
  const layer = document.querySelector('.l-place-video');
  const bgs = layer ? [...layer.children].filter(e => !/caption/.test(e.className)).map(e => {
    const c = getComputedStyle(e); const cp = c.clipPath; const m = cp && cp.match(/polygon\(\s*0%\s+([\d.]+)%/);
    const v = e.tagName === 'VIDEO' ? e : e.querySelector('video');
    return { cls: (typeof e.className === 'string' ? e.className : '').slice(0, 50), reveal: cp === 'none' ? null : (m ? +(+m[1]).toFixed(2) : cp.slice(0, 40)), vt: v ? +v.currentTime.toFixed(2) : null, vsrc: v ? (v.currentSrc || v.src || '').split('/').pop().split('?')[0] : null, ...info(e) };
  }) : [];
  return { contY, items, bgs, vids, digits, card: card ? { cls: (typeof card.className === 'string' ? card.className : '').slice(0, 60), ...info(card) } : null, cardMedia, label };
});

console.log('→ capture:', FRAMES, 'frames max, wheel', WHEEL, 'px/tick');
const frames = []; let seen16 = 0, gone = 0;
for (let i = 0; i < FRAMES && left() > 15000; i++) {
  await wheelTick(WHEEL);
  const ax = await readAxis();
  const s = await READ();
  frames.push({ i, ax, ...s });
  if (i % 10 === 0) console.log(`  f${i} contY=${s.contY === null ? '?' : Math.round(s.contY)} items=[${s.items.map(it => it.digit + ':' + (it.reveal === null ? 'on' : it.reveal))}] bgs=${s.bgs.length} vids=${s.vids.length}`);
  if (s.digits.some(d => d.txt === '16')) seen16++;
  if (seen16 > 3 && !s.digits.length) { gone++; if (gone > 6) { console.log('  16 shown & digits gone → beat over, stop at f' + i); break; } }
}
await browser.close();

writeFileSync(join(outDir, 'capture.json'), JSON.stringify({
  meta: { site: site.liveOrigin + site.livePath, vp, wheelPx: WHEEL, capturedAt: 'S36', axisField: 'smoothScroll', note: 'per-rAF CDP wheel capture of the odometer beat 3→9→16' },
  frames
}, null, 1));
console.log(`✅ ${frames.length} frames → ${join(outDir, 'capture.json')}`);

// law diagnostics: per-item reveal curve vs sticky-band position (contY)
// band progress: sticky holds while contY ∈ [-(H-vh), 0]; p = -contY / (H - vh)
const inBand = frames.filter(f => f.contY !== null && f.items.length);
for (const idx of [0, 1, 2]) {
  const pts = inBand.map(f => ({ p: (-f.contY / 2700).toFixed(3), r: f.items[idx]?.reveal })).filter(x => x.r !== null && x.r !== undefined && typeof x.r === 'number' && x.r > 0 && x.r < 100);
  console.log(`   item${idx} (${inBand[0]?.items[idx]?.digit}) mid-reveal points:`, pts.slice(0, 12).map(x => `p=${x.p}→${x.r}%`).join(' ') || '(instant or none captured)');
}
const bgSeen = new Set(); frames.forEach(f => (f.bgs || []).forEach(b => b.vsrc && bgSeen.add(b.vsrc)));
console.log('   bg videos seen:', [...bgSeen].join(', ') || 'none (headless: codecs absent — use --headed)');
