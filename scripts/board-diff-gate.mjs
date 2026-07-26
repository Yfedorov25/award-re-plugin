#!/usr/bin/env node
/*
  board-diff-gate.mjs — G24 BoardDiffGate engine.

  Порівнює ДВА скріншоти секції: "наше" (чистий рендер) vs "live" (з хромом браузера).
  Ловить композиційні/масові/overlap-відмінності, які піксель-diff (G18) топить у
  різниці роздільності+тону+хрому, а video-parity (G22) не бачить на статиці.

  Це СТРУКТУРНИЙ фільтр, НЕ доказ піксельної парності (див. §E у спеці). Зелений = «маса,
  композиція, вирівнювання, проміжки — схожі», НЕ «виглядає 1-в-1». Останнє слово — око.

  Метрики (0=ідентично):
    M1 separator/quantile position   поріг < 0.12
    M2 ink distribution 4×4 (TV)      поріг < 0.18
    M3 left-edge alignment (Chamfer)  поріг < 0.15
    M4 text-overlap (line collision)  поріг < 0.08   [критична, однобічна]
    M5 edge-map ZNCC                   поріг < 0.35
  Fail: {M4 або M2} завалились, АБО ≥2 з {M1,M3,M5}. (див. §D)

  Usage:
    node board-diff-gate.mjs --ours <our.png|jpg> --live <live.png|jpg> --label <name>
       [--out <report.json>] [--board <board.html>] [--dump <dir>]
    node board-diff-gate.mjs --pairs pairs.json   (масив {label,ours,live})

  Deps: sharp (через resolveChromium-package). Fail-open на помилках читання.
*/
'use strict';
import { createRequire } from 'module';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, basename, resolve } from 'path';

const require = createRequire(
  process.env.PLAYWRIGHT_FROM ||
  '/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json'
);
const sharp = require('sharp');

// ─── live capture of a scroll-driven (Locomotive/springs) section via CDP wheel ───
// Regular wheel/scrollTo do NOT move these sites; CDP Input.dispatchMouseEvent(mouseWheel)
// drives the virtual scroll. Anchors on a text element, then shoots the viewport.
// (mechanism proven by capture-cdp-ref.mjs / S8-S12 timing extractor).
async function captureLiveSection(url, anchorText, jpgPath, opt = {}) {
  const { chromium } = require('playwright');
  const vw = opt.vw || 1440, vh = opt.vh || 900, dsr = opt.dsr || 1.5;
  const topLo = opt.topLo ?? 560, topHi = opt.topHi ?? 650;
  const b = await chromium.launch({ headless: true });
  const page = await b.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: dsr });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(4000);
    const client = await page.context().newCDPSession(page);
    // dismiss cookie ACCEPT
    try {
      await page.evaluate(() => {
        const els = [...document.querySelectorAll('a,button,span,div')];
        const btn = els.find(e => e.children.length === 0 && /^\s*ACCEPT\s*$/i.test(e.textContent || ''));
        if (btn) (btn.closest('button,a') || btn).click();
      });
    } catch { /* ignore */ }
    await page.waitForTimeout(600);
    const anchorTop = async () => page.evaluate((t) => {
      const el = [...document.querySelectorAll('*')].find(e => e.children.length === 0 && (e.textContent || '').trim().toUpperCase().includes(t));
      if (!el) return null; const r = el.getBoundingClientRect(); return { left: Math.round(r.left), top: Math.round(r.top) };
    }, anchorText.toUpperCase());
    let done = false;
    for (let i = 0; i < 260; i++) {
      await client.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 720, y: 450, deltaX: 0, deltaY: 50 });
      await page.waitForTimeout(28);
      const a = await anchorTop();
      if (a && a.left > 0 && a.top >= topLo && a.top <= topHi) {
        await page.waitForTimeout(450);
        const a2 = await anchorTop();
        if (a2 && a2.top >= topLo - 25 && a2.top <= topHi + 25) { await page.screenshot({ path: jpgPath, type: 'jpeg', quality: 92 }); done = true; break; }
      }
    }
    if (!done) await page.screenshot({ path: jpgPath, type: 'jpeg', quality: 92 });
    return done;
  } finally { await b.close(); }
}

// Пороги калібровані S34 на IDENTICAL(усі 0) + JITTER(той самий кадр +6-8px зсув) + OUR-vs-LIVE.
// M3 гіперчутливий до вертикального кадр-зсуву (0.56 навіть на ідентичному-зі-зсувом) → інформативний,
// НЕ блокуючий. M1/M2/M4/M5 калібровані: identical=0, jitter у межах, live-різниця над порогом.
const THRESH = { M1: 0.15, M2: 0.18, M3: 0.60, M4: 0.05, M5: 0.45 };
const WORK_W = 1000; // спільна робоча ширина

// ─────────────────────────── args ───────────────────────────
function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) { a[argv[i].slice(2)] = argv[i + 1]; i++; }
  }
  return a;
}

// ─────────────────────────── image io ───────────────────────
async function loadRaw(path) {
  const img = sharp(path);
  const meta = await img.metadata();
  const { data } = await img.raw().toBuffer({ resolveWithObject: true }).then(o => ({ data: o.data }));
  return { data, W: meta.width, H: meta.height, ch: meta.channels };
}

// ─────────────────────────── A) chrome crop ─────────────────
// повертає {top,bottom,left,right, usedFallback}
function detectContentRegion(raw) {
  const { data, W, H, ch } = raw;
  const rowStat = (y) => {
    let lum = 0, sat = 0, green = 0, n = 0;
    for (let x = 0; x < W; x += 3) {
      const i = (y * W + x) * ch, r = data[i], g = data[i + 1], b = data[i + 2];
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      lum += (r * 0.299 + g * 0.587 + b * 0.114);
      sat += mx === 0 ? 0 : (mx - mn) / mx;
      green += Math.max(0, g - Math.max(r, b));
      n++;
    }
    return { lum: lum / n, sat: sat / n, green: green / n };
  };
  const isContent = (s) => s.lum > 232 && s.sat < 0.05 && s.green < 12;
  // top: перша стійка (>=40px) світла нейтральна смуга у [0, .30H]
  let top = 0, usedFallback = false;
  const topLimit = Math.floor(H * 0.30);
  outerTop:
  for (let y = 0; y < topLimit; y++) {
    if (!isContent(rowStat(y))) continue;
    for (let k = 0; k < 40 && y + k < H; k++) { if (!isContent(rowStat(y + k))) { continue outerTop; } }
    top = y; break;
  }
  if (top === 0 && topLimit > 0) {
    // якщо нічого не знайшли, але кадр не має хрому (наш) — top=0 валідно; фолбек лише для «high H*.30 промах»
    // залишаємо top=0 (чистий кадр)
  }
  // bottom: найвищий y такий, що [y..H-1] — зелена смуга; інакше H-1
  let bottom = H - 1;
  const botLimit = Math.floor(H * 0.85);
  for (let y = H - 1; y > botLimit; y--) {
    const s = rowStat(y);
    const isGreen = s.green > 40 && s.sat > 0.25;
    if (!isGreen) { bottom = y; break; }
  }
  // бокові поля: консервативно НЕ ріжемо (щоб не з'їсти легітимну порожнечу макета)
  const left = 0, right = W;
  // валідація кропу
  const ar = (bottom - top) / (right - left);
  if (ar < 0.30 || ar > 1.1) { // за межами очікуваного → фолбек
    top = Math.round(H * 0.16); bottom = H - Math.round(H * 0.05); usedFallback = true;
  }
  return { top, bottom, left, right, usedFallback };
}

// ─────────────── препроцес: crop→gray→resize→tone-norm→ink ──────────────
async function toInk(path, region) {
  const { top, bottom, left, right } = region;
  const w = right - left, h = bottom - top;
  const buf = await sharp(path)
    .extract({ left, top, width: Math.max(1, w), height: Math.max(1, h) })
    .grayscale()
    .resize({ width: WORK_W, fit: 'fill' }) // height пропорційно нижче
    .raw().toBuffer({ resolveWithObject: true });
  const W = buf.info.width, H = buf.info.height, d = buf.data;
  // per-image tone norm за перцентилями p2/p98
  const hist = new Array(256).fill(0);
  for (let i = 0; i < d.length; i++) hist[d[i]]++;
  const total = d.length;
  const pct = (p) => { let acc = 0, tgt = total * p; for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= tgt) return v; } return 255; };
  const p2 = pct(0.02), p98 = pct(0.98), span = Math.max(1, p98 - p2);
  const ink = new Float32Array(W * H);
  for (let i = 0; i < d.length; i++) {
    let L = (d[i] - p2) / span; if (L < 0) L = 0; else if (L > 1) L = 1;
    ink[i] = 1 - L;
  }
  return { ink, W, H };
}

// ─────────────────────────── helpers ────────────────────────
function colInkProfile({ ink, W, H }) {
  const col = new Float32Array(W);
  for (let x = 0; x < W; x++) { let s = 0; for (let y = 0; y < H; y++) s += ink[y * W + x]; col[x] = s / H; }
  return col;
}
function rowInkProfile({ ink, W, H }) {
  const row = new Float32Array(H);
  for (let y = 0; y < H; y++) { let s = 0; for (let x = 0; x < W; x++) s += ink[y * W + x]; row[y] = s / W; }
  return row;
}
function quantilePositions(profile) {
  const N = profile.length; let tot = 0; for (let i = 0; i < N; i++) tot += profile[i];
  const q = { 0.25: 0, 0.5: 0, 0.75: 0 }; const targets = [0.25, 0.5, 0.75];
  let acc = 0, ti = 0;
  for (let i = 0; i < N && ti < targets.length; i++) {
    acc += profile[i];
    while (ti < targets.length && acc >= tot * targets[ti]) { q[targets[ti]] = i / N; ti++; }
  }
  return q;
}
function railPosition(colProfile) {
  // найсильніший стрибок кумулятивного профілю = межа маси рейл|панель
  const N = colProfile.length; let tot = 0; for (let i = 0; i < N; i++) tot += colProfile[i];
  let cum = 0, best = 0, bestX = 0.34;
  for (let i = 1; i < N; i++) {
    cum += colProfile[i];
    const step = colProfile[i]; // локальна маса як проксі різкості межі
    if (step > best) { best = step; bestX = i / N; }
  }
  return bestX;
}

// M1 ──────────────────────────────────────────────────────────
function metricM1(ao, al) {
  const co = colInkProfile(ao), cl = colInkProfile(al);
  const ro = rowInkProfile(ao), rl = rowInkProfile(al);
  const qxo = quantilePositions(co), qxl = quantilePositions(cl);
  const qyo = quantilePositions(ro), qyl = quantilePositions(rl);
  let dq = 0; for (const q of [0.25, 0.5, 0.75]) dq += (Math.abs(qxo[q] - qxl[q]) + Math.abs(qyo[q] - qyl[q])) / 2;
  dq /= 3;
  const dRail = Math.abs(railPosition(co) - railPosition(cl));
  let m1 = 0.5 * dq * 3 + 0.5 * dRail;
  return Math.max(0, Math.min(1, m1));
}

// M2 ──────────────────────────────────────────────────────────
function metricM2(ao, al) {
  const grid = (a) => {
    const { ink, W, H } = a; const g = new Float32Array(16); let tot = 0;
    for (let y = 0; y < H; y++) { const gy = Math.min(3, (y * 4 / H) | 0);
      for (let x = 0; x < W; x++) { const gx = Math.min(3, (x * 4 / W) | 0); const v = ink[y * W + x]; g[gy * 4 + gx] += v; tot += v; } }
    if (tot > 0) for (let i = 0; i < 16; i++) g[i] /= tot;
    return g;
  };
  const po = grid(ao), pl = grid(al);
  let tv = 0; for (let i = 0; i < 16; i++) tv += Math.abs(po[i] - pl[i]);
  return 0.5 * tv;
}

// M3 ──────────────────────────────────────────────────────────
function leftEdges(a, N = 6) {
  const col = colInkProfile(a); const W = col.length;
  const rise = new Float32Array(W);
  let mean = 0; for (let x = 1; x < W; x++) { rise[x] = Math.max(0, col[x] - col[x - 1]); mean += rise[x]; }
  mean /= W; let sd = 0; for (let x = 1; x < W; x++) sd += (rise[x] - mean) ** 2; sd = Math.sqrt(sd / W);
  const thr = mean + 1.5 * sd; const cand = [];
  for (let x = 2; x < W - 1; x++) if (rise[x] > thr && rise[x] >= rise[x - 1] && rise[x] >= rise[x + 1]) cand.push({ x: x / W, s: rise[x] });
  cand.sort((p, q) => q.s - p.s);
  return cand.slice(0, N).map(c => c.x).sort((p, q) => p - q);
}
function metricM3(ao, al) {
  const Eo = leftEdges(ao), El = leftEdges(al);
  if (!Eo.length || !El.length) return 0.5; // недостатньо структури → нейтрально-підозріло
  const nearest = (v, arr) => Math.min(...arr.map(u => Math.abs(u - v)));
  // shift-tolerant: allow a small global x-offset (sub-alignment jitter shouldn't count as mismatch).
  // find the offset in [-0.03,0.03] that minimizes chamfer, then score at that offset.
  const chamferAt = (off) => {
    const Elo = El.map(u => u + off);
    const c1 = Eo.reduce((s, v) => s + nearest(v, Elo), 0) / Eo.length;
    const c2 = Elo.reduce((s, v) => s + nearest(v, Eo), 0) / Elo.length;
    return 0.5 * (c1 + c2);
  };
  let best = Infinity;
  for (let off = -0.03; off <= 0.03; off += 0.005) best = Math.min(best, chamferAt(off));
  return Math.max(0, Math.min(1, best * 8));
}

// M4 ──────────────────────────────────────────────────────────
function overlapScore(a) {
  const row = rowInkProfile(a); const H = row.length;
  // smooth
  const sm = new Float32Array(H);
  for (let y = 0; y < H; y++) { let s = 0, n = 0; for (let k = -1; k <= 1; k++) { const yy = y + k; if (yy >= 0 && yy < H) { s += row[yy]; n++; } } sm[y] = s / n; }
  let mx = 0; for (let y = 0; y < H; y++) if (sm[y] > mx) mx = sm[y];
  const tau = 0.15 * mx;
  // text bands
  const bands = []; let inB = false, start = 0;
  for (let y = 0; y < H; y++) {
    if (sm[y] > tau && !inB) { inB = true; start = y; }
    else if (sm[y] <= tau && inB) { inB = false; bands.push([start, y - 1]); }
  }
  if (inB) bands.push([start, H - 1]);
  if (bands.length < 2) return 0;
  // peak per band
  const peak = (b) => { let p = 0; for (let y = b[0]; y <= b[1]; y++) if (sm[y] > p) p = sm[y]; return p; };
  let collide = 0, transitions = 0;
  for (let i = 0; i < bands.length - 1; i++) {
    const p1 = peak(bands[i]), p2 = peak(bands[i + 1]);
    const gapMin = Math.min(...Array.from({ length: bands[i + 1][0] - bands[i][1] }, (_, k) => sm[bands[i][1] + 1 + k] ?? 0), sm[bands[i][1]]);
    const minPeak = Math.min(p1, p2);
    if (minPeak <= 0) continue;
    const valleyDepth = (minPeak - gapMin) / minPeak;
    transitions++;
    if (valleyDepth < 0.25) collide++;
  }
  return transitions ? collide / transitions : 0;
}
function metricM4(ao, al) {
  const so = overlapScore(ao), sl = overlapScore(al);
  return { m4: Math.max(0, Math.min(1, so - sl)), ours: so, live: sl }; // однобічна
}

// M5 ──────────────────────────────────────────────────────────
function sobelEdges(a) {
  const { ink, W, H } = a; const mag = new Float32Array(W * H);
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const gx = ink[(y - 1) * W + x + 1] + 2 * ink[y * W + x + 1] + ink[(y + 1) * W + x + 1]
      - ink[(y - 1) * W + x - 1] - 2 * ink[y * W + x - 1] - ink[(y + 1) * W + x - 1];
    const gy = ink[(y + 1) * W + x - 1] + 2 * ink[(y + 1) * W + x] + ink[(y + 1) * W + x + 1]
      - ink[(y - 1) * W + x - 1] - 2 * ink[(y - 1) * W + x] - ink[(y - 1) * W + x + 1];
    mag[y * W + x] = Math.hypot(gx, gy);
  }
  // бінаризація: поріг серед НЕНУЛЬОВИХ градієнтів (Swiss-minimal кадр = >85% фону з mag=0,
  // тому global-85% percentile = 0 → всі пікселі=1 → ZNCC вироджується). Беремо топ-краї серед реальних.
  const nz = [];
  for (let i = 0; i < mag.length; i++) if (mag[i] > 1e-4) nz.push(mag[i]);
  nz.sort((p, q) => p - q);
  const thr = nz.length ? (nz[Math.floor(nz.length * 0.55)] || 0) : Infinity; // медіана-краї серед ненульових
  const bin = new Float32Array(W * H);
  for (let i = 0; i < mag.length; i++) bin[i] = mag[i] >= thr && mag[i] > 1e-4 ? 1 : 0;
  return { bin, W, H };
}
// resample an edge-map to a target height (nearest-row) so ZNCC compares the same content rows
function resampleH(b, targetH) {
  if (b.H === targetH) return b;
  const out = new Float32Array(b.W * targetH);
  for (let y = 0; y < targetH; y++) { const sy = Math.min(b.H - 1, Math.round(y * b.H / targetH)); for (let x = 0; x < b.W; x++) out[y * b.W + x] = b.bin[sy * b.W + x]; }
  return { bin: out, W: b.W, H: targetH };
}
function znccShift(bo0, bl0, maxShiftFrac = 0.03) {
  // вирівняти висоти до спільної (semantic-crop дає різну висоту наше/live) перед кореляцією
  const Ht = Math.min(bo0.H, bl0.H);
  const bo = resampleH(bo0, Ht), bl = resampleH(bl0, Ht);
  const W = Math.min(bo.W, bl.W), H = Ht;
  const at = (b, x, y) => (x < 0 || y < 0 || x >= b.W || y >= b.H) ? 0 : b.bin[y * b.W + x];
  const sx = Math.round(W * maxShiftFrac), sy = Math.round(H * maxShiftFrac);
  let best = -1;
  for (let dy = -sy; dy <= sy; dy += Math.max(1, sy)) for (let dx = -sx; dx <= sx; dx += Math.max(1, sx)) {
    let so = 0, sl = 0, n = 0; for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) { so += at(bo, x, y); sl += at(bl, x + dx, y + dy); n++; }
    const mo = so / n, ml = sl / n; let num = 0, do_ = 0, dl = 0;
    for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) { const a = at(bo, x, y) - mo, b = at(bl, x + dx, y + dy) - ml; num += a * b; do_ += a * a; dl += b * b; }
    const denom = Math.sqrt(do_ * dl) || 1e-9; const z = num / denom;
    if (z > best) best = z;
  }
  return best;
}
function metricM5(ao, al) {
  const bo = sobelEdges(ao), bl = sobelEdges(al);
  const z = znccShift(bo, bl);
  return Math.max(0, Math.min(1, (1 - z) / 2));
}

// ─────────────────────────── run one pair ───────────────────
async function runPair(label, oursPath, livePath, dumpDir) {
  const rawO = await loadRaw(oursPath), rawL = await loadRaw(livePath);
  const regO = detectContentRegion(rawO), regL = detectContentRegion(rawL);
  const ao = await toInk(oursPath, regO), al = await toInk(livePath, regL);

  const M1 = metricM1(ao, al);
  const M2 = metricM2(ao, al);
  const M3 = metricM3(ao, al);
  const m4o = metricM4(ao, al), M4 = m4o.m4;
  const M5 = metricM5(ao, al);

  const fails = [];
  if (M4 >= THRESH.M4) fails.push('M4');
  if (M2 >= THRESH.M2) fails.push('M2');
  if (M1 >= THRESH.M1) fails.push('M1');
  if (M3 >= THRESH.M3) fails.push('M3');
  if (M5 >= THRESH.M5) fails.push('M5');
  // агрегація §D: fail якщо {M4|M2} впали АБО ≥2 з {M1,M3,M5}
  // Агрегація (калібрована S34): критичні = {M2 маса, M4 налізання} — найдовіреніші, будь-який fail = fail.
  // soft = {M1 композиція, M5 edge-структура} — fail якщо ОБИДВА впали. M3 інформативний (не блокує:
  // гіперчутливий до вертикального кадр-зсуву — див. калібрування), лише логується.
  const crit = fails.includes('M4') || fails.includes('M2');
  const softCount = ['M1', 'M5'].filter(m => fails.includes(m)).length;
  const pass = !(crit || softCount >= 2);

  if (dumpDir) {
    if (!existsSync(dumpDir)) mkdirSync(dumpDir, { recursive: true });
    await sharp(oursPath).extract({ left: regO.left, top: regO.top, width: regO.right - regO.left, height: regO.bottom - regO.top }).toFile(`${dumpDir}/${label}-ours-crop.png`);
    await sharp(livePath).extract({ left: regL.left, top: regL.top, width: regL.right - regL.left, height: regL.bottom - regL.top }).toFile(`${dumpDir}/${label}-live-crop.png`);
  }

  return {
    label, pass,
    metrics: { M1: +M1.toFixed(3), M2: +M2.toFixed(3), M3: +M3.toFixed(3), M4: +M4.toFixed(3), M5: +M5.toFixed(3) },
    thresholds: THRESH,
    fails,
    overlap: { ours: +m4o.ours.toFixed(3), live: +m4o.live.toFixed(3) },
    crop: { ours: regO, live: regL },
    note: 'СТРУКТУРНИЙ фільтр, НЕ піксельна парність. Зелений = маса/композиція/вирівнювання/проміжки схожі; фінальне слово — око по live.'
  };
}

// ─────────────────────────── board html ─────────────────────
function makeBoard(results, dumpDirRel) {
  const rows = results.map(r => {
    const chips = Object.entries(r.metrics).map(([k, v]) => {
      const bad = r.fails.includes(k);
      return `<span class="m ${bad ? 'bad' : 'ok'}">${k} ${v} <em>&lt;${r.thresholds[k]}</em></span>`;
    }).join(' ');
    const imgs = dumpDirRel
      ? `<div class="pair"><img src="${dumpDirRel}/${r.label}-ours-crop.png"><img src="${dumpDirRel}/${r.label}-live-crop.png"></div>
         <div class="cap"><span>наше (crop)</span><span>live (crop, хром відрізано)</span></div>` : '';
    return `<h2>${r.label} — ${r.pass ? '<span class="pass">PASS</span>' : '<span class="fail">FAIL</span>'}</h2>
      ${imgs}
      <div class="metrics">${chips}</div>
      <div class="ov">overlap ours=${r.overlap.ours} live=${r.overlap.live} · crop ours[${r.crop.ours.top}..${r.crop.ours.bottom}]${r.crop.ours.usedFallback ? ' (fallback!)' : ''} live[${r.crop.live.top}..${r.crop.live.bottom}]${r.crop.live.usedFallback ? ' (fallback!)' : ''}</div>`;
  }).join('\n');
  return `<!doctype html><html lang="uk"><head><meta charset="utf-8">
<title>G24 BoardDiffGate — наше ↔ live</title>
<style>body{background:#111;color:#eee;font:13px/1.5 -apple-system,sans-serif;margin:0;padding:22px}
h1{font-size:17px}h2{font-size:14px;margin:22px 0 6px}
.pass{color:#4ad07a}.fail{color:#ff6a6a}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:6px}.pair img{width:100%;display:block;border:1px solid #333}
.cap{display:grid;grid-template-columns:1fr 1fr;gap:6px;color:#888;font-size:11px;margin:3px 0 8px}
.metrics{margin:6px 0}.m{display:inline-block;padding:3px 8px;margin:2px;border-radius:4px;font-size:12px}
.m.ok{background:#16301f;border:1px solid #2a5}.m.bad{background:#3a1616;border:1px solid #a33}
.m em{opacity:.6;font-style:normal}
.ov{color:#999;font-size:11px}
.note{background:#1a1a2a;border:1px solid #446;padding:10px 14px;margin:14px 0;border-radius:6px;color:#bcd}</style></head><body>
<h1>G24 BoardDiffGate — структурна різниця наше ↔ live AIR</h1>
<div class="note">⚠️ Це СТРУКТУРНИЙ фільтр (маса/композиція/вирівнювання/проміжки-рядків), НЕ піксельна парність.
Зелений ≠ «виглядає однаково». Ловить грубі композиційні/overlap-баги, які піксель-diff топить у різниці
роздільності+тону+хрому. Фінальне слово про фасад — око по живому AIR.</div>
${rows}
</body></html>`;
}

// ─────────────────────────── main ───────────────────────────
async function main() {
  const a = parseArgs(process.argv.slice(2));
  let pairs = [];
  if (a.pairs) {
    const { readFileSync } = await import('fs');
    pairs = JSON.parse(readFileSync(a.pairs, 'utf8'));
  } else if (a.ours && a.live) {
    pairs = [{ label: a.label || 'pair', ours: a.ours, live: a.live }];
  } else {
    console.error('need --ours+--live+--label OR --pairs pairs.json'); process.exit(2);
  }
  const dumpDir = a.dump || null;
  const results = [];
  for (const p of pairs) {
    try { results.push(await runPair(p.label, resolve(p.ours), resolve(p.live), dumpDir)); }
    catch (e) { results.push({ label: p.label, pass: false, error: String(e), metrics: {}, fails: ['error'] }); }
  }
  const allPass = results.every(r => r.pass);
  const report = { ts: Date.now(), tsISO: new Date().toISOString(), allPass, results };
  const out = a.out || resolve(dirname(pairs[0].ours), 'board-diff-report.json');
  writeFileSync(out, JSON.stringify(report, null, 2));
  console.log('report:', out);
  if (a.board) {
    const rel = dumpDir ? require('path').relative(dirname(a.board), dumpDir) : null;
    writeFileSync(a.board, makeBoard(results, rel));
    console.log('board:', a.board);
  }
  for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'} ${r.label}`, JSON.stringify(r.metrics), r.fails.length ? 'fails=' + r.fails.join(',') : '');
  process.exit(allPass ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(2); });
