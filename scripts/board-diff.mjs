/* ============================================================
   BOARD-DIFF — АВТО-ОКО по scrub-борду (сесія 19)
   ------------------------------------------------------------
   ПРОБЛЕМА яку закриває (вердикт Єгора «супербагато відмінностей»):
   sync-проба міряє лише ГРАНИЦІ секцій (7 анкорів), око дивиться
   ~10 пар з 240 — все МІЖ анкорами лишалось несканованим.
   Це авто-око жене піксель-diff по КОЖНІЙ парі live-NNN/ours-NNN,
   ранжує найгірші кадри, локалізує diff по вертикальних смугах
   і збирає findings.html (live | ours | diff-теплокарта).

   Запуск: PLAYWRIGHT_FROM=<pkg> node scripts/board-diff.mjs \
     --board library/boards/about-scrub-m390 [--serve http://localhost:8820] \
     [--top 24] [--threshold 40]
   Вихід: <board>/diff-report.json + <board>/findings.html
          + <board>/diff-NNN.png (теплокарти top-кадрів)
   ГЕЙТ: жоден борд НЕ показувати Єгору без прогону board-diff
   і розбору top-кадрів оком.
   ============================================================ */
import { readFileSync, writeFileSync } from 'fs';
import { resolve, basename } from 'path';
import { pathToFileURL } from 'url';

async function resolveChromium() {
  const { createRequire } = await import('node:module');
  const roots = [process.env.PLAYWRIGHT_FROM,
    '/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json'].filter(Boolean);
  for (const r of roots) {
    try { const req = createRequire(pathToFileURL(r)); const pw = req('playwright');
      if (pw && pw.chromium) return pw.chromium; } catch {}
  }
  try { return (await import('playwright')).chromium; } catch {}
  return null;
}
const chromium = await resolveChromium();
if (!chromium) { console.error('playwright не резолвиться'); process.exit(1); }

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const BOARD = resolve(arg('board'));
const SERVE = arg('serve', 'http://localhost:8820');
const TOP = +(arg('top', 24));
const THRESH = +(arg('threshold', 40));   /* поріг каналу 0-255: jpeg-шум/AA не рахуємо */
if (!arg('board')) { console.error('потрібен --board <dir>'); process.exit(1); }

const meta = JSON.parse(readFileSync(`${BOARD}/meta.json`, 'utf8'));
const N = meta.n;
const fracs = meta.fracs || Array.from({ length: N }, (_, i) => +(i / (N - 1)).toFixed(4));
const anchors = (meta.anchors || []).filter(a => !String(a.id).startsWith('sec'));
const boardUrl = `${SERVE}/boards/${basename(BOARD)}`;
const secOf = fr => { let s = '—'; for (const a of anchors) if (a.frac <= fr + 0.002) s = a.id; return s; };

const b = await chromium.launch();
const p = await b.newPage();
await p.goto(`${boardUrl}/board.html`, { waitUntil: 'domcontentloaded' });
await p.evaluate(() => { document.body.innerHTML = ''; scrollTo(0,0); });  /* same-origin: без CORS-заголовків crossOrigin-load валиться */

/* diff однієї пари в браузері: % пікселів з дельтою > поріг + розбивка
   по 6 горизонтальних смугах (локалізація: де саме на екрані різниця) */
const rows = [];
for (let i = 0; i < N; i++) {
  const id = String(i).padStart(3, '0');
  const r = await p.evaluate(async ({ boardUrl, id, THRESH }) => {
    const load = src => new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im); im.onerror = rej; im.src = src; });
    let a, z;
    try { [a, z] = await Promise.all([load(`${boardUrl}/live-${id}.jpg`), load(`${boardUrl}/ours-${id}.jpg`)]); }
    catch { return null; }
    const w = Math.min(a.width, z.width), h = Math.min(a.height, z.height);
    const c1 = new OffscreenCanvas(w, h), c2 = new OffscreenCanvas(w, h);
    const x1 = c1.getContext('2d'), x2 = c2.getContext('2d');
    x1.drawImage(a, 0, 0); x2.drawImage(z, 0, 0);
    const d1 = x1.getImageData(0, 0, w, h).data, d2 = x2.getImageData(0, 0, w, h).data;
    const bands = [0, 0, 0, 0, 0, 0]; let bad = 0;
    for (let y = 0; y < h; y++) {
      const band = Math.min(5, Math.floor(y / h * 6));
      for (let x = 0; x < w; x++) {
        const k = (y * w + x) * 4;
        const dr = Math.abs(d1[k] - d2[k]), dg = Math.abs(d1[k+1] - d2[k+1]), db = Math.abs(d1[k+2] - d2[k+2]);
        if (Math.max(dr, dg, db) > THRESH) { bad++; bands[band]++; }
      }
    }
    const px = w * h;

    /* ── с27 SSIM (перцептивна метрика, толерує ~2px текстурну фазу) ──
       grayscale → 8×8 блочний SSIM з shift-search ±SHIFT: для кожного
       ours-блока беремо НАЙКРАЩИЙ SSIM серед зсувів live у вікні ±SHIFT.
       Це і є просторова толерантність, якої нема у 40/255-порозі: 2px-фаза
       по фасаду/фото більше не флудить. ssimPct = 100·(1 − mean_SSIM). */
    const gray = (d) => { const g = new Float64Array(w * h);
      for (let p = 0, q = 0; p < d.length; p += 4, q++) g[q] = 0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2];
      return g; };
    /* 3×3 box-blur — гасить суб-піксельний/JPEG-шум ПЕРЕД SSIM (перцептивні
       метрики завжди згладжують; без цього текстура-фаза домінує) */
    const blur = (g) => { const o = new Float64Array(w * h);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let s = 0, n = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          const yy = y + dy, xx = x + dx;
          if (yy >= 0 && yy < h && xx >= 0 && xx < w) { s += g[yy * w + xx]; n++; }
        }
        o[y * w + x] = s / n;
      }
      return o; };
    const g1 = blur(gray(d1)), g2 = blur(gray(d2));
    /* SHIFT±8 калібровано на еталонах: hq#94 (композиція ІДЕНТИЧНА, чиста фаза)
       33%→18.7 (фаза толерується) vs fan#63 (РІЗНИЙ контент карток) лишається 37%
       (справжня різниця). Це і є розділення текстура-фаза ↔ реальний дефект,
       якого 40/255-поріг не давав. BS=8, крок 12 (розрідження = швидше). */
    const BS = 8, STEP = 12, SHIFT = 8, C1 = 6.5025, C2 = 58.5225;
    /* статистики блока ours на (bx,by) проти live-блока зсунутого на (sx,sy) */
    const ssimBlock = (bx, by, sx, sy) => {
      let mA = 0, mB = 0, n = 0;
      for (let yy = 0; yy < BS; yy++) for (let xx = 0; xx < BS; xx++) {
        const ax = bx + xx, ay = by + yy, lx = ax + sx, ly = ay + sy;
        if (lx < 0 || ly < 0 || lx >= w || ly >= h) return -1;
        mA += g1[ly * w + lx]; mB += g2[ay * w + ax]; n++;
      }
      mA /= n; mB /= n;
      let vA = 0, vB = 0, cov = 0;
      for (let yy = 0; yy < BS; yy++) for (let xx = 0; xx < BS; xx++) {
        const ax = bx + xx, ay = by + yy, lx = ax + sx, ly = ay + sy;
        const A = g1[ly * w + lx] - mA, B = g2[ay * w + ax] - mB;
        vA += A * A; vB += B * B; cov += A * B;
      }
      vA /= n; vB /= n; cov /= n;
      return ((2 * mA * mB + C1) * (2 * cov + C2)) / ((mA * mA + mB * mB + C1) * (vA + vB + C2));
    };
    let ssimSum = 0, ssimN = 0;
    const ssimBands = [0, 0, 0, 0, 0, 0], ssimBandN = [0, 0, 0, 0, 0, 0];
    for (let by = SHIFT; by + BS <= h - SHIFT; by += STEP) {
      const band = Math.min(5, Math.floor(by / h * 6));
      for (let bx = SHIFT; bx + BS <= w - SHIFT; bx += STEP) {
        /* coarse-to-fine: крок 2 по зсуву, потім уточнення ±1 навколо найкращого */
        let best = -1, bsx = 0, bsy = 0;
        for (let sy = -SHIFT; sy <= SHIFT; sy += 2) for (let sx = -SHIFT; sx <= SHIFT; sx += 2) {
          const s = ssimBlock(bx, by, sx, sy);
          if (s > best) { best = s; bsx = sx; bsy = sy; }
        }
        for (let sy = bsy - 1; sy <= bsy + 1; sy++) for (let sx = bsx - 1; sx <= bsx + 1; sx++) {
          const s = ssimBlock(bx, by, sx, sy);
          if (s > best) best = s;
        }
        ssimSum += best; ssimN++;
        ssimBands[band] += (1 - best); ssimBandN[band]++;
      }
    }
    const ssimPct = ssimN ? +(100 * (1 - ssimSum / ssimN)).toFixed(2) : 0;

    return { pct: +(100 * bad / px).toFixed(2), ssimPct,
      bands: bands.map(v => +(100 * v / (px / 6)).toFixed(1)),
      ssimBands: ssimBands.map((v, i) => ssimBandN[i] ? +(100 * v / ssimBandN[i]).toFixed(1) : 0), w, h };
  }, { boardUrl, id, THRESH });
  if (r) rows.push({ i, frac: fracs[i], sec: secOf(fracs[i]), ...r });
  if (i % 24 === 0) process.stdout.write('.');
}
process.stdout.write('\n');

const sorted = [...rows].sort((x, y) => y.pct - x.pct);
const worst = sorted.slice(0, TOP);
const mean = +(rows.reduce((s, r) => s + r.pct, 0) / rows.length).toFixed(2);
const median = sorted[Math.floor(sorted.length / 2)].pct;
const ssimMean = +(rows.reduce((s, r) => s + (r.ssimPct || 0), 0) / rows.length).toFixed(2);

/* теплокарти для top-кадрів */
for (const w of worst) {
  const id = String(w.i).padStart(3, '0');
  const dataUrl = await p.evaluate(async ({ boardUrl, id, THRESH }) => {
    const load = src => new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im); im.onerror = rej; im.src = src; });
    const [a, z] = await Promise.all([load(`${boardUrl}/live-${id}.jpg`), load(`${boardUrl}/ours-${id}.jpg`)]);
    const w0 = Math.min(a.width, z.width), h0 = Math.min(a.height, z.height);
    const c1 = new OffscreenCanvas(w0, h0), c2 = new OffscreenCanvas(w0, h0), co = new OffscreenCanvas(w0, h0);
    const x1 = c1.getContext('2d'), x2 = c2.getContext('2d'), xo = co.getContext('2d');
    x1.drawImage(a, 0, 0); x2.drawImage(z, 0, 0);
    xo.globalAlpha = .35; xo.drawImage(z, 0, 0); xo.globalAlpha = 1;
    const d1 = x1.getImageData(0, 0, w0, h0).data, d2 = x2.getImageData(0, 0, w0, h0).data;
    const od = xo.getImageData(0, 0, w0, h0);
    for (let k = 0; k < d1.length; k += 4) {
      const m = Math.max(Math.abs(d1[k]-d2[k]), Math.abs(d1[k+1]-d2[k+1]), Math.abs(d1[k+2]-d2[k+2]));
      if (m > THRESH) { od.data[k] = 255; od.data[k+1] = 40; od.data[k+2] = 40; od.data[k+3] = 255; }
    }
    xo.putImageData(od, 0, 0);
    const blob = await co.convertToBlob({ type: 'image/png' });
    return await new Promise(res => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(blob); });
  }, { boardUrl, id, THRESH });
  writeFileSync(`${BOARD}/diff-${id}.png`, Buffer.from(dataUrl.split(',')[1], 'base64'));
}
await b.close();

writeFileSync(`${BOARD}/diff-report.json`, JSON.stringify({ board: basename(BOARD), n: N,
  threshold: THRESH, mean, median, ssimMean, at: new Date().toISOString(),
  worst: worst.map(w => ({ i: w.i, frac: w.frac, sec: w.sec, pct: w.pct, ssimPct: w.ssimPct, bands: w.bands, ssimBands: w.ssimBands })),
  all: rows.map(r => ({ i: r.i, frac: r.frac, pct: r.pct, ssimPct: r.ssimPct })) }, null, 1));

/* findings.html — топ-кадри: live | ours | diff */
writeFileSync(`${BOARD}/findings.html`, `<!doctype html><meta charset="utf-8">
<title>findings: ${basename(BOARD)}</title>
<style>body{background:#0f0f0e;color:#eee;font:13px/1.5 -apple-system,system-ui;padding:20px}
h1{font-size:16px} .row{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:22px 0;max-width:1500px}
img{width:100%;display:block;background:#111} .cap{grid-column:1/-1;font-family:ui-monospace,Menlo,monospace;font-size:12px;color:#c9a15e}
.lbl{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.1em}</style>
<h1>АВТО-ОКО: топ-${TOP} найгірших кадрів · ${basename(BOARD)} · mean ${mean}% · median ${median}%</h1>
${worst.map(w => { const id = String(w.i).padStart(3, '0');
  return `<div class="row"><div class="cap">#${id} · ${(w.frac*100).toFixed(1)}% · секція ${w.sec} · diff ${w.pct}% · смуги [${w.bands.join(' ')}]</div>
  <div><div class="lbl">живе</div><img loading="lazy" src="live-${id}.jpg"></div>
  <div><div class="lbl">наше</div><img loading="lazy" src="ours-${id}.jpg"></div>
  <div><div class="lbl">diff</div><img loading="lazy" src="diff-${id}.png"></div></div>`; }).join('\n')}`);

console.log(`\nБОРД: ${basename(BOARD)} · mean ${mean}% · median ${median}% · SSIM-mean ${ssimMean}% (перцептивна, толерує ~2px текстуру)`);
console.log('ТОП-' + Math.min(TOP, worst.length) + ' найгірших кадрів:');
for (const w of worst) console.log(
  `#${String(w.i).padStart(3,'0')}  ${(w.frac*100).toFixed(1).padStart(5)}%  ${String(w.sec).padEnd(14)} diff ${String(w.pct).padStart(6)}%  смуги [${w.bands.join(' ')}]`);
console.log('\nFINDINGS:', `${BOARD}/findings.html`);
