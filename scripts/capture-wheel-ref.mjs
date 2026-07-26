#!/usr/bin/env node
/*
  capture-wheel-ref.mjs — LIVE-FIRST capture via REAL WHEEL EVENTS (memory: live-first-before-visual).

  Why this exists: capture-live-ref.mjs uses window.scrollTo(), which does NOT trigger
  Locomotive/Barba virtual-scroll + pin transitions — the contact sheet "sticks" on one
  composition and lies about pin-section motion (documented in the memory §доповнення).
  This script drives the page with genuine mouse.wheel() deltas + settle pauses, so the
  virtual scroller actually advances and pin transitions play. After each wheel burst it
  records a frame AND reads the live section state (visible heading, its clip/transform,
  and any odometer/stat digits) so RESEARCH can be grounded in real motion, not JSON.

  Usage:
    node capture-wheel-ref.mjs --url https://springs.estate --name SO-3-nature-place-wheel \
         [--warmup 24000] [--bursts 26] [--delta 700] [--settle 650] [--vw 1440] [--vh 900] [--wait 4500]

    --warmup : total wheel distance (px) to fast-scroll THROUGH before we start sampling
               (gets us near the Nature→Place seam without recording the whole page)
    --bursts : how many sampled wheel bursts to record after warmup
    --delta  : px per wheel burst while sampling (small = fine-grained seam motion)
    --settle : ms to wait after each burst for Locomotive inertia to land before the shot

  Output (under the award-re-springs project, resolved from cwd or --out):
    extraction/live-ref/<name>/
      manifest.json  — url, viewport, wheel params, timestamp, per-frame section-state log
      sheet.png      — contact sheet of the transition (EYEBALL it)
      frame-*.png    — individual frames
*/
'use strict';
import fs from 'fs';
import path from 'path';

const HOME = process.env.HOME || '/Users/yehorfedorov';
const PW_CANDIDATES = [
  path.join(HOME, '.ssh/pdf-export-service/node_modules/playwright/index.mjs'),
  path.join(process.cwd(), 'node_modules/playwright/index.mjs'),
];
const pwPath = PW_CANDIDATES.find((p) => fs.existsSync(p));
if (!pwPath) { console.error('capture-wheel-ref: playwright not found. Checked:\n' + PW_CANDIDATES.join('\n')); process.exit(2); }
const { chromium } = await import(pwPath);

function arg(name, def) { const i = process.argv.indexOf('--' + name); return i > -1 ? process.argv[i + 1] : def; }
const url = arg('url'); const name = arg('name');
if (!url || !name) { console.error('capture-wheel-ref: --url and --name are required'); process.exit(2); }
const warmup = +arg('warmup', 24000), bursts = +arg('bursts', 26), delta = +arg('delta', 700);
const settle = +arg('settle', 650), vw = +arg('vw', 1440), vh = +arg('vh', 900), initWait = +arg('wait', 4500);

function findProjectRoot() {
  let d = process.cwd();
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(d, 'extraction')) || fs.existsSync(path.join(d, 'library'))) return d;
    const up = path.dirname(d); if (up === d) break; d = up;
  }
  return process.cwd();
}
const outRoot = arg('out', path.join(findProjectRoot(), 'extraction', 'live-ref', name));
fs.mkdirSync(outRoot, { recursive: true });

// Reads the live state of whatever big section is on screen right now: dominant heading,
// its computed clip/transform/opacity, plus any large digit runs (odometers/stats).
const readSectionState = () => {
  const vh = window.innerHeight, vw = window.innerWidth;
  const inView = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.top < vh * 0.85 && r.bottom > vh * 0.15;
  };
  const cs = (el, p) => getComputedStyle(el)[p];
  // dominant heading = largest-font visible h1/h2/h3/title with text
  const heads = [...document.querySelectorAll('h1,h2,h3,[class*="title"]')]
    .filter((el) => (el.textContent || '').trim() && inView(el))
    .map((el) => ({ el, t: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50),
                    fs: parseFloat(cs(el, 'fontSize')) || 0 }))
    .sort((a, b) => b.fs - a.fs);
  const dom = heads[0];
  const headState = dom ? {
    t: dom.t, fs: Math.round(dom.fs),
    opacity: +(+cs(dom.el, 'opacity')).toFixed(3),
    clipPath: cs(dom.el, 'clipPath'),
    transform: cs(dom.el, 'transform'),
  } : null;
  // stat/odometer digits currently rendered (Place has 3 / 9 / 16 running-scene metrics)
  const digitRuns = [...document.querySelectorAll('[class*="stat"],[class*="odometer"],[class*="number"],[class*="metric"],[class*="count"]')]
    .filter(inView)
    .map((el) => (el.textContent || '').replace(/\s+/g, ' ').trim())
    .filter((s) => /\d/.test(s)).slice(0, 8);
  // any element pinned to top (sticky/pin) right now
  const pinned = [...document.querySelectorAll('[class*="pin"],[class*="sticky"],[data-scroll-sticky]')]
    .map((el) => ({ c: (typeof el.className === 'string' ? el.className : '').slice(0, 40),
                    top: Math.round(el.getBoundingClientRect().top) }))
    .filter((x) => Math.abs(x.top) < 4).slice(0, 4);
  return { heading: headState, digitRuns, pinnedTop: pinned,
           scrollY: Math.round(window.scrollY),
           lsY: (window.__lenis && window.__lenis.scroll != null) ? Math.round(window.__lenis.scroll)
              : (window.locoScroll && window.locoScroll.scroll ? Math.round(window.locoScroll.scroll.instance.scroll.y) : null) };
};

const b = await chromium.launch();
try {
  const p = await b.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(url, { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(initWait);                        // preloader + WebGL settle
  try { await p.click('text=ACCEPT', { timeout: 1500 }); } catch (_) {}
  await p.waitForTimeout(600);

  // move mouse over the viewport centre so wheel events target the scroll surface
  await p.mouse.move(vw / 2, vh / 2);

  // ── WARMUP: fast-wheel through everything before the seam (not recorded) ──
  let warmed = 0;
  while (warmed < warmup) {
    const d = Math.min(1000, warmup - warmed);
    await p.mouse.wheel(0, d);
    warmed += d;
    await p.waitForTimeout(90);                             // let virtual scroller keep up
  }
  await p.waitForTimeout(900);                              // land inertia before sampling

  // ── SAMPLE: small wheel bursts, frame + section-state after each settle ──
  const frames = [];
  for (let i = 0; i < bursts; i++) {
    const state = await p.evaluate(readSectionState);
    const buf = await p.screenshot();
    const fn = `frame-${String(i).padStart(3, '0')}.png`;
    fs.writeFileSync(path.join(outRoot, fn), buf);
    frames.push({ i, file: fn, state, b64: buf.toString('base64') });
    await p.mouse.wheel(0, delta);
    await p.waitForTimeout(settle);
  }

  // contact sheet with the live heading label under each frame
  const cols = 4;
  const sheet = await b.newPage({ viewport: { width: 1500, height: 200 + Math.ceil(frames.length / cols) * 280 }, deviceScaleFactor: 2 });
  await sheet.setContent(`<body style="margin:0;background:#111;color:#ccc;font-family:sans-serif;padding:16px">
    <div style="font-size:16px;margin-bottom:8px">WHEEL-LIVE ${url} — ${name} (warmup ${warmup}px, ${bursts}×${delta}px bursts)</div>
    <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:8px">
    ${frames.map((f) => {
      const h = f.state.heading; const d = f.state.digitRuns.join(' ');
      const lbl = (h ? `${h.t} · op${h.opacity}` : '—') + (d ? ` · [${d}]` : '');
      return `<div><img style="width:100%;border:1px solid #333;display:block" src="data:image/png;base64,${f.b64}"><div style="font-size:10px;line-height:1.3">#${f.i} ${lbl}</div></div>`;
    }).join('')}
    </div></body>`);
  await sheet.waitForTimeout(250);
  await sheet.screenshot({ path: path.join(outRoot, 'sheet.png'), fullPage: true });

  const manifest = {
    at: new Date().toISOString(),
    url, name, method: 'wheel', viewport: { vw, vh },
    wheel: { warmup, bursts, delta, settle }, pageErrors: errs.length,
    frames: frames.map((f) => ({ i: f.i, file: f.file, state: f.state })),
  };
  fs.writeFileSync(path.join(outRoot, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('WHEEL-REF OK →', outRoot);
  console.log('  frames:', frames.length, ' errs:', errs.length);
  console.log('  headings seen:', [...new Set(frames.map((f) => f.state.heading && f.state.heading.t).filter(Boolean))].join(' · '));
  const digits = [...new Set(frames.flatMap((f) => f.state.digitRuns))];
  if (digits.length) console.log('  digit-runs seen:', digits.join(' | '));
  console.log('  👉 EYEBALL sheet.png — this used REAL wheel events, so pin transitions should actually move.');
} catch (e) {
  console.error('capture-wheel-ref FAILED:', e.message);
  process.exit(1);
} finally {
  await b.close();
}
