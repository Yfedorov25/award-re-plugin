#!/usr/bin/env node
/*
  capture-live-ref.mjs — LIVE-FIRST capture (memory: live-first-before-visual).

  Purpose: before building/replicating ANY visual section, you must SCROLL the LIVE
  reference and record the real motion. This script does that and writes the artifact
  the live-first-gate checks for, so "look at live first" is one command.

  Usage:
    node capture-live-ref.mjs --url https://springs.estate --name SO-1-hero-wellness \
         [--from 0] [--to 2800] [--step 140] [--vw 1440] [--vh 900] [--wait 4000]

  Output (under the KAI/award-re-springs project, resolved from cwd or --out):
    extraction/live-ref/<name>/
      manifest.json          — url, viewport, scroll range, timestamp, frame list
      sheet.png              — contact sheet of the transition (eyeball it!)
      frame-*.png            — individual frames

  The gate treats a live-ref as FRESH if manifest.json.at is within LIVE_REF_MAX_DAYS.
  Fail-safe: prints a clear error and exits non-zero if the site can't be reached.
*/
'use strict';
import fs from 'fs';
import path from 'path';

// locate a playwright install (this repo has none; reuse the one in pdf-export-service)
const HOME = process.env.HOME || '/Users/yehorfedorov';
const PW_CANDIDATES = [
  path.join(HOME, '.ssh/pdf-export-service/node_modules/playwright/index.mjs'),
  path.join(process.cwd(), 'node_modules/playwright/index.mjs'),
];
const pwPath = PW_CANDIDATES.find((p) => fs.existsSync(p));
if (!pwPath) { console.error('capture-live-ref: playwright not found. Checked:\n' + PW_CANDIDATES.join('\n')); process.exit(2); }
const { chromium } = await import(pwPath);

// ── args ──
function arg(name, def) { const i = process.argv.indexOf('--' + name); return i > -1 ? process.argv[i + 1] : def; }
const url = arg('url'); const name = arg('name');
if (!url || !name) { console.error('capture-live-ref: --url and --name are required'); process.exit(2); }
const from = +arg('from', 0), to = +arg('to', 2800), step = +arg('step', 140);
const vw = +arg('vw', 1440), vh = +arg('vh', 900), settle = +arg('wait', 4000);

// resolve output root: prefer an extraction/ dir up the tree, else cwd
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

const b = await chromium.launch();
try {
  const p = await b.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(url, { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(settle);                         // preloader + WebGL settle
  try { await p.click('text=ACCEPT', { timeout: 1500 }); } catch (_) {}
  await p.waitForTimeout(600);

  const H = await p.evaluate(() => document.body.scrollHeight);

  // ── DOM-FACT pass (memory: live-first-before-visual §доповнення) ──
  // headless scrollTo can MISS pin-section transitions (Locomotive/Barba), so the visual
  // sheet may lie ("stuck on hero"). The DOM does NOT lie about which sections/headings exist.
  const domFacts = await p.evaluate(() => {
    const big = [...document.querySelectorAll('h1,h2,h3,.h0,.h1,[class*="title"]')]
      .map((el) => ({ t: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60),
                      fs: Math.round(parseFloat(getComputedStyle(el).fontSize)), tag: el.tagName }))
      .filter((x) => x.fs > 36 && x.t);
    const secPrefixes = {};
    [...document.querySelectorAll('[class]')].forEach((el) => {
      const c = typeof el.className === 'string' ? el.className : '';
      const m = c.match(/\bl-([a-z]+)\b/); if (m) secPrefixes[m[1]] = (secPrefixes[m[1]] || 0) + 1;
    });
    return { bigHeadings: big.slice(0, 40), sectionPrefixes: secPrefixes };
  });

  const frames = [];
  let idx = 0;
  for (let y = from; y <= Math.min(to, H); y += step, idx++) {
    await p.evaluate((yy) => window.scrollTo(0, yy), y);
    await p.waitForTimeout(500);
    const fn = `frame-${String(idx).padStart(3, '0')}-y${y}.png`;
    const buf = await p.screenshot();
    fs.writeFileSync(path.join(outRoot, fn), buf);
    frames.push({ y, file: fn, b64: buf.toString('base64') });
  }

  // contact sheet
  const cols = 4;
  const sheet = await b.newPage({ viewport: { width: 1500, height: 200 + Math.ceil(frames.length / cols) * 260 }, deviceScaleFactor: 2 });
  await sheet.setContent(`<body style="margin:0;background:#111;color:#ccc;font-family:sans-serif;padding:16px">
    <div style="font-size:16px;margin-bottom:8px">LIVE ${url} — ${name} (${from}→${to}px, step ${step})</div>
    <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:8px">
    ${frames.map((f) => `<div><img style="width:100%;border:1px solid #333;display:block" src="data:image/png;base64,${f.b64}"><div style="font-size:11px">y=${f.y}</div></div>`).join('')}
    </div></body>`);
  await sheet.waitForTimeout(250);
  await sheet.screenshot({ path: path.join(outRoot, 'sheet.png'), fullPage: true });

  const manifest = {
    at: new Date().toISOString(),      // NB: real wall-clock (script runs outside the workflow sandbox)
    url, name, viewport: { vw, vh }, scroll: { from, to, step }, scrollHeight: H,
    frames: frames.map((f) => ({ y: f.y, file: f.file })), pageErrors: errs.length,
    domFacts,                          // headings/sections that EXIST regardless of headless scroll
  };
  fs.writeFileSync(path.join(outRoot, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('LIVE-REF OK →', outRoot);
  console.log('  frames:', frames.length, ' sheet: sheet.png  errs:', errs.length);
  console.log('  DOM big headings:', domFacts.bigHeadings.map((h) => h.t).slice(0, 12).join(' · '));
  console.log('  👉 EYEBALL sheet.png AND check DOM headings above — headless scroll can miss pin-sections.');
} catch (e) {
  console.error('capture-live-ref FAILED:', e.message);
  process.exit(1);
} finally {
  await b.close();
}
