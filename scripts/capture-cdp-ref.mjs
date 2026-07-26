#!/usr/bin/env node
/*
  capture-cdp-ref.mjs — LIVE-FIRST capture via CDP synthesizeScrollGesture.

  Why: springs.estate does NOT move under window.scrollTo() OR mouse.wheel() in headless
  (documentPhysical scrollHeight == viewport; the scene is progress-driven, not overflow-scrolled).
  The only headless driver that actually advances the live scene is CDP
  Input.synthesizeScrollGesture — proven by the S8–S12 timing-map extractor. This script
  reuses that driver purely to record VISUAL frames of a live seam so RESEARCH can be
  grounded in real motion (the eyeball artifact the timing-map JSON lacks).

  Usage:
    node capture-cdp-ref.mjs --url https://springs.estate --name SO-3-nature-place-cdp \
         [--warmupG 12] [--sampleG 22] [--dist 300] [--speed 1200] [--settle 700] \
         [--vw 1440] [--vh 900] [--wait 6000]

    --warmupG : gesture bursts to fast-scroll through (NOT recorded) to reach the seam
    --sampleG : gesture bursts to record (frame + section state after each settle)
    --dist    : px scrolled per gesture (small = fine seam sampling)

  Output: extraction/live-ref/<name>/{manifest.json, sheet.png, frame-*.png}
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
if (!pwPath) { console.error('capture-cdp-ref: playwright not found.'); process.exit(2); }
const { chromium } = await import(pwPath);

function arg(name, def) { const i = process.argv.indexOf('--' + name); return i > -1 ? process.argv[i + 1] : def; }
const url = arg('url'); const name = arg('name');
if (!url || !name) { console.error('capture-cdp-ref: --url and --name required'); process.exit(2); }
const warmupG = +arg('warmupG', 12), sampleG = +arg('sampleG', 22), dist = +arg('dist', 300);
const speed = +arg('speed', 1200), settle = +arg('settle', 700);
const vw = +arg('vw', 1440), vh = +arg('vh', 900), initWait = +arg('wait', 6000);

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

const readState = () => {
  const vh = window.innerHeight;
  const inView = (el) => { const r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.top < vh * 0.9 && r.bottom > vh * 0.1; };
  const cs = (el, p) => getComputedStyle(el)[p];
  const heads = [...document.querySelectorAll('h1,h2,h3,[class*="title"]')]
    .filter((el) => (el.textContent || '').trim() && inView(el))
    .map((el) => ({ el, t: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 46), fs: parseFloat(cs(el, 'fontSize')) || 0 }))
    .sort((a, b) => b.fs - a.fs);
  const dom = heads[0];
  const digits = [...document.querySelectorAll('[class*="stat"],[class*="odometer"],[class*="number"],[class*="metric"],[class*="count"],[class*="caption"]')]
    .filter(inView).map((el) => (el.textContent || '').replace(/\s+/g, ' ').trim()).filter((s) => /\d/.test(s)).slice(0, 10);
  // dominant visible section by l-* prefix and viewport-overlap area
  let domSec = null, best = 0;
  [...document.querySelectorAll('[class*="l-"]')].forEach((el) => {
    const c = typeof el.className === 'string' ? el.className : ''; const m = c.match(/\bl-[a-z-]+\b/); if (!m) return;
    const r = el.getBoundingClientRect(); const ov = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    if (ov > best) { best = ov; domSec = m[0]; }
  });
  return { heading: dom ? { t: dom.t, fs: Math.round(dom.fs), opacity: +(+cs(dom.el, 'opacity')).toFixed(3), clipPath: cs(dom.el, 'clipPath'), transform: cs(dom.el, 'transform') } : null,
           digits, dominantSection: domSec };
};

const b = await chromium.launch();
try {
  const ctx = await b.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(initWait);
  for (const sel of ['.js-cookie-consent-accept', 'button:has-text("ACCEPT")', 'text=ACCEPT']) {
    try { await p.click(sel, { timeout: 1200 }); break; } catch (_) {}
  }
  await p.waitForTimeout(600);

  const gesture = async (yDist) => {
    await cdp.send('Input.synthesizeScrollGesture', { x: vw / 2, y: vh / 2, xDistance: 0, yDistance: -yDist, speed, gestureSourceType: 'mouse' });
  };

  // WARMUP — reach the seam (not recorded)
  for (let i = 0; i < warmupG; i++) { await gesture(Math.round(vh * 0.9)); await p.waitForTimeout(220); }
  await p.waitForTimeout(900);

  // SAMPLE — record frame + state after each small gesture
  const frames = [];
  for (let i = 0; i < sampleG; i++) {
    const state = await p.evaluate(readState);
    const buf = await p.screenshot();
    const fn = `frame-${String(i).padStart(3, '0')}.png`;
    fs.writeFileSync(path.join(outRoot, fn), buf);
    frames.push({ i, file: fn, state, b64: buf.toString('base64') });
    await gesture(dist);
    await p.waitForTimeout(settle);
  }

  const cols = 4;
  const sheet = await b.newPage({ viewport: { width: 1500, height: 200 + Math.ceil(frames.length / cols) * 280 }, deviceScaleFactor: 2 });
  await sheet.setContent(`<body style="margin:0;background:#111;color:#ccc;font-family:sans-serif;padding:16px">
    <div style="font-size:16px;margin-bottom:8px">CDP-LIVE ${url} — ${name} (warmup ${warmupG}g, sample ${sampleG}×${dist}px)</div>
    <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:8px">
    ${frames.map((f) => { const h = f.state.heading; const d = f.state.digits.join(' ');
      const lbl = `${f.state.dominantSection || '—'} · ${h ? h.t + ' op' + h.opacity : '—'}${d ? ' · [' + d + ']' : ''}`;
      return `<div><img style="width:100%;border:1px solid #333;display:block" src="data:image/png;base64,${f.b64}"><div style="font-size:10px;line-height:1.3">#${f.i} ${lbl}</div></div>`; }).join('')}
    </div></body>`);
  await sheet.waitForTimeout(250);
  await sheet.screenshot({ path: path.join(outRoot, 'sheet.png'), fullPage: true });

  const manifest = { at: new Date().toISOString(), url, name, method: 'cdp-synthesizeScrollGesture',
    viewport: { vw, vh }, gesture: { warmupG, sampleG, dist, speed, settle }, pageErrors: errs.length,
    frames: frames.map((f) => ({ i: f.i, file: f.file, state: f.state })) };
  fs.writeFileSync(path.join(outRoot, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('CDP-REF OK →', outRoot, '\n  frames:', frames.length, 'errs:', errs.length);
  console.log('  sections seen:', [...new Set(frames.map((f) => f.state.dominantSection).filter(Boolean))].join(' · '));
  console.log('  headings seen:', [...new Set(frames.map((f) => f.state.heading && f.state.heading.t).filter(Boolean))].join(' · '));
  const dg = [...new Set(frames.flatMap((f) => f.state.digits))]; if (dg.length) console.log('  digits:', dg.join(' | '));
} catch (e) { console.error('capture-cdp-ref FAILED:', e.message); process.exit(1); }
finally { await b.close(); }
