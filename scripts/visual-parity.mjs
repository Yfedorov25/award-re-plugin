#!/usr/bin/env node
/* ============================================================================
   visual-parity.mjs — the PIXEL-PROOF gate for award-re.
   Turns the manual "snap our prototype, snap the live one, eyeball them
   side by side" ritual into ONE command that gives a machine number
   (% divergence) + an auto-board for the eye.

   Core rule of the system: no "done" status without pixel proof.

   What it does, per viewport:
     1. Opens --ours (our prototype URL) in headless Chromium, waits for
        network idle + 2.5s, screenshots to <out>/parity/<label>-ours-<vp>.png.
     2. Loads the --baseline PNG (the frozen live shot = "the truth").
        If sizes differ → warning (not a crash); scales the smaller up.
     3. Diffs INSIDE Chromium via <canvas> (ZERO npm deps): both PNGs go into
        canvas 2d, getImageData reads pixels, JS compares them. A pixel is
        "different" if euclidean RGB distance > threshold (default 32/255).
        diffRatio = different / total. Also renders a red diff-mask PNG.
     4. Writes/updates <out>/visual-parity-report.json (array of runs).
        verdict = "pass" if diffPct <= threshold (default 3%), else "fail".
     5. Generates <out>/parity/parity-board.html — one row per run:
        [ OURS | BASELINE-live | DIFF-mask ] + diffPct + pass/fail badge.
     6. Prints a stdout summary + board path. Exit code 1 if ANY run fails
        (so a CI/pre-deploy gate can block), 0 if all pass.

   Diff runs in-browser through <canvas> because pixelmatch/pngjs are NOT
   installed and award-re-plugin has no package.json — we stay dependency-free.

   Usage:
     node scripts/visual-parity.mjs --ours <URL> --baseline <PNG> [--label <name>]
        [--viewport 1440x820] [--out <dir>] [--threshold 3] [--pixel-threshold 32]
        [--mask "<css>,<css>"]

   --mask (same semantics as G20 dynamic_masks): comma-separated CSS selectors
   whose bounding boxes (measured on OUR settled page) are filled BLACK in BOTH
   images before comparison, so dynamic zones (the rotating Vimeo spiral, live
   photos) don't count as divergence. Our spiral box = live box ±3px (proven
   session 12), so masking by our rects masks the live one too.

   Multi-viewport (baseline path gets a -<width> suffix inserted before ext):
     node scripts/visual-parity.mjs --ours <URL> \
       --baseline .../hero.png --viewport 1440x820,390x844
     → loads .../hero-1440.png and .../hero-390.png

   Playwright chromium is resolved via createRequire from apps/smarts (same
   pattern as library-verify.mjs). Set PLAYWRIGHT_FROM=<dir>/package.json to
   override.
   ========================================================================== */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve, basename, extname, relative, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* ---- tiny CLI parser ---- */
function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) { out[key] = true; }
      else { out[key] = next; i++; }
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));

if (!args.ours || !args.baseline) {
  console.error('visual-parity: missing required flags.');
  console.error('  node scripts/visual-parity.mjs --ours <URL> --baseline <PNG> [--label <name>] [--viewport 1440x820[,390x844]] [--out <dir>] [--threshold 3]');
  process.exit(2);
}

const OURS_URL = String(args.ours);
const BASELINE = String(args.baseline);
const LABEL = args.label ? String(args.label) : basename(BASELINE, extname(BASELINE));
const OUT_DIR = args.out ? resolve(String(args.out)) : join(ROOT, 'scripts');
const PARITY_DIR = join(OUT_DIR, 'parity');
const REPORT_PATH = join(OUT_DIR, 'visual-parity-report.json');
const BOARD_PATH = join(PARITY_DIR, 'parity-board.html');

// verdict threshold in PERCENT (diffPct <= this = pass)
const THRESHOLD_PCT = args.threshold !== undefined ? Number(args.threshold) : 3;
// per-pixel euclidean RGB distance threshold, 0..255
const PIXEL_THRESHOLD = args['pixel-threshold'] !== undefined ? Number(args['pixel-threshold']) : 32;

// dynamic-mask CSS selectors (comma-separated), G20 semantics
const MASK_SELECTORS = args.mask
  ? String(args.mask).split(',').map(s => s.trim()).filter(Boolean)
  : [];

// explicit mask rects "x,y,w,h;x,y,w,h" — for when the dynamic element's DOM box
// is full-bleed (hero Vimeo iframe = 1546x820) and masking by selector would eat
// the WHOLE frame (the session-11 fake-0% trap). Lets us mask just the visible
// spiral ring instead.
const MASK_RECTS_CLI = args['mask-rect']
  ? String(args['mask-rect']).split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const p = s.split(',').map(Number);
      if (p.length !== 4 || p.some(n => !Number.isFinite(n))) throw new Error(`bad --mask-rect "${s}" (expected x,y,w,h)`);
      return { x: p[0], y: p[1], w: p[2], h: p[3] };
    })
  : [];

// viewports: "1440x820" or "1440x820,390x844"
const VIEWPORTS = String(args.viewport || '1440x820')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
  .map(vp => {
    const m = vp.match(/^(\d+)\s*x\s*(\d+)$/i);
    if (!m) throw new Error(`bad --viewport value "${vp}" (expected WxH, e.g. 1440x820)`);
    return { w: Number(m[1]), h: Number(m[2]), tag: `${m[1]}x${m[2]}` };
  });

const MULTI_VP = VIEWPORTS.length > 1;

// for multi-viewport, insert -<width> before the baseline extension
function baselineFor(vp) {
  if (!MULTI_VP) return BASELINE;
  const ext = extname(BASELINE);
  const stem = BASELINE.slice(0, BASELINE.length - ext.length);
  return `${stem}-${vp.w}${ext}`;
}

/* ---- resolve playwright chromium (same pattern as library-verify.mjs) ---- */
async function resolveChromium() {
  let chromium;
  const { createRequire } = await import('node:module');
  const reqRoots = [
    process.env.PLAYWRIGHT_FROM,
    join(ROOT, '..', 'eruhomist', 'apps', 'smarts', 'package.json'),
    '/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json',
    join(ROOT, 'package.json'),
  ].filter(Boolean);
  for (const r of reqRoots) {
    try {
      const require = createRequire(pathToFileURL(r));
      const pw = require('playwright');
      if (pw && pw.chromium) { chromium = pw.chromium; break; }
    } catch {}
  }
  if (!chromium) { try { ({ chromium } = await import('playwright')); } catch {} }
  return chromium;
}

/* ---- in-browser canvas diff.
   Runs in the page context. Loads two PNGs (as file:// or data URLs) into
   canvases, reads pixels, computes euclidean-RGB per-pixel diff, and paints a
   red mask over a translucent baseline. Returns { diffRatio, sizes, diffDataUrl }.
   Everything here must be pure browser JS (no node). ---- */
const DIFF_IN_PAGE = async (params) => {
  const { baselineUrl, oursUrl, pixelThreshold, maskRects } = params;

  function load(url) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => rej(new Error('image load failed: ' + url));
      img.src = url;
    });
  }

  const [bImg, oImg] = await Promise.all([load(baselineUrl), load(oursUrl)]);

  const baselineSize = { w: bImg.naturalWidth, h: bImg.naturalHeight };
  const oursSize = { w: oImg.naturalWidth, h: oImg.naturalHeight };

  // common canvas = the larger of the two in each dimension; smaller is
  // scaled up to fill (drawImage stretches).
  const W = Math.max(baselineSize.w, oursSize.w);
  const H = Math.max(baselineSize.h, oursSize.h);

  function toData(img) {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, W, H);
    // black out dynamic-mask rects in BOTH frames (G20 semantics) so masked
    // zones always compare equal — they neither add red nor count as diff.
    if (maskRects && maskRects.length) {
      ctx.fillStyle = '#000';
      for (const r of maskRects) {
        ctx.fillRect(r.x || 0, r.y || 0, r.w || 0, r.h || 0);
      }
    }
    return ctx.getImageData(0, 0, W, H);
  }

  const b = toData(bImg);
  const o = toData(oImg);

  // diff mask: translucent baseline, red where different
  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = W; maskCanvas.height = H;
  const mctx = maskCanvas.getContext('2d');
  const mask = mctx.createImageData(W, H);
  const md = mask.data;

  const bd = b.data, od = o.data;
  const total = W * H;
  let different = 0;
  const thr = pixelThreshold; // 0..255

  for (let i = 0; i < total; i++) {
    const p = i * 4;
    const dr = bd[p] - od[p];
    const dg = bd[p + 1] - od[p + 1];
    const db = bd[p + 2] - od[p + 2];
    const dist = Math.sqrt(dr * dr + dg * dg + db * db) / Math.sqrt(3); // 0..255
    if (dist > thr) {
      different++;
      md[p] = 255; md[p + 1] = 0; md[p + 2] = 0; md[p + 3] = 255; // solid red
    } else {
      // translucent baseline underneath, dimmed
      md[p] = bd[p]; md[p + 1] = bd[p + 1]; md[p + 2] = bd[p + 2]; md[p + 3] = 70;
    }
  }

  mctx.putImageData(mask, 0, 0);
  const diffDataUrl = maskCanvas.toDataURL('image/png');

  return {
    diffRatio: different / total,
    different,
    total,
    baselineSize,
    oursSize,
    diffDataUrl,
  };
};

/* ---- html board ---- */
function buildBoard(runs) {
  const rows = runs.map(r => {
    const pass = r.verdict === 'pass';
    const badgeColor = pass ? '#1a7f37' : '#cf222e';
    const badgeBg = pass ? '#dafbe1' : '#ffebe9';
    const oursRel = r.oursShot ? relative(PARITY_DIR, r.oursShot) : '';
    const diffRel = r.diffShot ? relative(PARITY_DIR, r.diffShot) : '';
    const baselineHref = isAbsolute(r.baseline) ? pathToFileURL(r.baseline).href : r.baseline;
    const sizeWarn = r.sizeMismatch
      ? `<div class="warn">size mismatch — ours ${r.oursSize?.w}x${r.oursSize?.h} vs baseline ${r.baselineSize?.w}x${r.baselineSize?.h} (scaled)</div>`
      : '';
    const err = r.error ? `<div class="err">ERROR: ${escapeHtml(r.error)}</div>` : '';
    const maskNote = (r.maskSelectors && r.maskSelectors.length)
      ? `<div class="meta">masks: ${escapeHtml(r.maskSelectors.join(', '))} → ${r.maskRects?.length || 0} rect(s) ${r.maskRects?.length ? 'blacked out both sides' : '— NONE matched, unmasked!'}</div>`
      : '';
    const cell = (title, src) => `
        <figure>
          <figcaption>${title}</figcaption>
          ${src ? `<a href="${src}" target="_blank"><img src="${src}" loading="lazy"></a>` : `<div class="missing">— no image —</div>`}
        </figure>`;
    return `
    <section class="run ${pass ? 'ok' : 'bad'}">
      <header>
        <h2>${escapeHtml(r.label)} <span class="vp">${escapeHtml(r.viewport)}</span></h2>
        <span class="badge" style="color:${badgeColor};background:${badgeBg}">
          ${escapeHtml(String(r.diffPct))}% · ${r.verdict.toUpperCase()}
        </span>
      </header>
      <div class="meta">threshold ${THRESHOLD_PCT}% · ${r.different ?? '?'}/${r.total ?? '?'} px · ${escapeHtml(r.ts || '')}</div>
      <div class="meta url"><a href="${escapeHtml(r.oursUrl)}" target="_blank">${escapeHtml(r.oursUrl)}</a></div>
      ${err}${sizeWarn}${maskNote}
      <div class="grid">
        ${cell('OURS (prototype)', oursRel)}
        ${cell('BASELINE (live · truth)', baselineHref)}
        ${cell('DIFF (red = divergence)', diffRel)}
      </div>
    </section>`;
  }).join('\n');

  const anyFail = runs.some(r => r.verdict === 'fail');
  const summaryColor = anyFail ? '#cf222e' : '#1a7f37';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>visual-parity board — ${escapeHtml(LABEL)}</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body { font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
         margin: 0; padding: 24px; background: #f6f8fa; color: #1f2328; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .top { margin-bottom: 20px; }
  .top .status { font-weight: 700; color: ${summaryColor}; }
  .run { background: #fff; border: 1px solid #d0d7de; border-radius: 10px;
         padding: 16px; margin-bottom: 20px; }
  .run.bad { border-color: #cf222e; }
  .run header { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .run h2 { font-size: 16px; margin: 0; }
  .vp { font-weight: 400; color: #656d76; font-size: 13px; }
  .badge { font-weight: 700; padding: 4px 10px; border-radius: 999px; font-size: 13px; white-space: nowrap; }
  .meta { color: #656d76; font-size: 12px; margin-top: 4px; }
  .meta.url a { color: #0969da; text-decoration: none; word-break: break-all; }
  .warn { color: #9a6700; background: #fff8c5; padding: 6px 10px; border-radius: 6px; margin-top: 8px; font-size: 12px; }
  .err { color: #cf222e; background: #ffebe9; padding: 6px 10px; border-radius: 6px; margin-top: 8px; font-size: 12px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 12px; }
  @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
  figure { margin: 0; }
  figcaption { font-size: 12px; font-weight: 600; color: #656d76; margin-bottom: 6px; }
  figure img { width: 100%; height: auto; border: 1px solid #d0d7de; border-radius: 6px;
               background: repeating-conic-gradient(#eee 0% 25%, #fff 0% 50%) 50% / 16px 16px; display: block; }
  .missing { padding: 24px; text-align: center; color: #999; border: 1px dashed #d0d7de; border-radius: 6px; }
  a { color: inherit; }
</style>
</head>
<body>
  <div class="top">
    <h1>visual-parity board</h1>
    <div>${runs.length} run(s) · <span class="status">${anyFail ? 'FAIL' : 'PASS'}</span> · generated ${escapeHtml(new Date().toISOString())}</div>
  </div>
  ${rows}
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* ---- report merge: keep prior runs, replace matching (label+viewport) ---- */
function loadReport() {
  if (!existsSync(REPORT_PATH)) return [];
  try {
    const parsed = JSON.parse(readFileSync(REPORT_PATH, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

/* ---- one run ---- */
async function runOne(browser, vp) {
  const baselinePath = baselineFor(vp);
  const oursShot = join(PARITY_DIR, `${LABEL}-ours-${vp.tag}.png`);
  const diffShot = join(PARITY_DIR, `${LABEL}-diff-${vp.tag}.png`);
  const ts = new Date().toISOString();

  const rec = {
    label: LABEL, viewport: vp.tag, ts, oursUrl: OURS_URL, baseline: baselinePath,
    diffRatio: null, diffPct: null, verdict: 'fail',
    oursShot: null, diffShot: null,
    baselineSize: null, oursSize: null, sizeMismatch: false,
  };

  if (!existsSync(baselinePath)) {
    rec.error = `baseline PNG not found: ${baselinePath}`;
    console.warn(`  ! ${LABEL} ${vp.tag}: ${rec.error}`);
    return rec;
  }

  const context = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  // PROBE-bypass for aircenter: mask navigator.webdriver so the live/guarded
  // page doesn't detect the automation.
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
  const page = await context.newPage();

  try {
    await page.goto(OURS_URL, { waitUntil: 'networkidle', timeout: 45000 });
    // SETTLE before shooting: intro-reveal animations (e.g. the header slides
    // translateY(-70)→0 over ~2s via `transition: transform 2s`) are still in
    // flight at a fixed 2.5s wait, so a naive shot catches the header MID-FLIGHT
    // partly off-screen and every header pixel reads as divergence against a
    // baseline shot with the header at rest. Wait until the header's top stops
    // moving (3 stable samples) before shooting — like ANTI-ISC #11's "stability
    // window after animations", applied to the parity screenshot itself.
    await page.waitForTimeout(1200);
    await page.evaluate(async () => {
      const el = document.querySelector('header, [data-amo-header], [class*=header]');
      if (!el) return;
      const topNow = () => Math.round(el.getBoundingClientRect().top);
      let prev = null, stable = 0, guard = 0;
      while (stable < 3 && guard < 80) {           // ~80 * 75ms = 6s cap
        const t = topNow();
        if (prev !== null && Math.abs(t - prev) < 1) stable++; else stable = 0;
        prev = t;
        await new Promise(r => setTimeout(r, 75));
        guard++;
      }
    });
    await page.waitForTimeout(300);               // paint settle

    // capture dynamic-mask bounding boxes (viewport-relative), G20 captureMasks.
    const maskRects = [...MASK_RECTS_CLI];
    for (const sel of MASK_SELECTORS) {
      try {
        const loc = page.locator(sel);
        const n = Math.min(await loc.count(), 8);
        for (let i = 0; i < n; i++) {
          const box = await loc.nth(i).boundingBox().catch(() => null);
          if (box && box.width > 0 && box.height > 0) {
            maskRects.push({ x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.width), h: Math.round(box.height) });
          }
        }
      } catch {}
    }
    rec.maskSelectors = MASK_SELECTORS.length ? MASK_SELECTORS : (MASK_RECTS_CLI.length ? ['(explicit rects)'] : []);
    rec.maskRects = maskRects;
    if (MASK_SELECTORS.length && maskRects.length === MASK_RECTS_CLI.length) {
      console.warn(`  ! ${LABEL} ${vp.tag}: --mask declared but NO rects matched (${MASK_SELECTORS.join(', ')}) — diff runs unmasked`);
    }

    await page.screenshot({ path: oursShot });
    rec.oursShot = oursShot;

    // Diff on a BLANK page with base64 data-URLs — the prototype page is served
    // from http://localhost, and a http origin cannot load file:// <img> (blocked
    // as cross-origin), which made the in-page loads reject. Reading both PNGs as
    // base64 in Node and passing data-URLs to about:blank sidesteps all origin rules.
    const baselineUrl = 'data:image/png;base64,' + readFileSync(baselinePath).toString('base64');
    const oursUrl = 'data:image/png;base64,' + readFileSync(oursShot).toString('base64');

    const diffPage = await context.newPage();
    let result;
    try {
      await diffPage.goto('about:blank');
      result = await diffPage.evaluate(DIFF_IN_PAGE, {
        baselineUrl, oursUrl, pixelThreshold: PIXEL_THRESHOLD, maskRects,
      });
    } finally {
      await diffPage.close().catch(() => {});
    }

    rec.diffRatio = result.diffRatio;
    rec.diffPct = Math.round(result.diffRatio * 10000) / 100; // 2 decimals
    rec.different = result.different;
    rec.total = result.total;
    rec.baselineSize = result.baselineSize;
    rec.oursSize = result.oursSize;
    rec.sizeMismatch = result.baselineSize.w !== result.oursSize.w || result.baselineSize.h !== result.oursSize.h;
    rec.verdict = rec.diffPct <= THRESHOLD_PCT ? 'pass' : 'fail';

    // write diff mask PNG from the data URL
    const b64 = result.diffDataUrl.replace(/^data:image\/png;base64,/, '');
    writeFileSync(diffShot, Buffer.from(b64, 'base64'));
    rec.diffShot = diffShot;

    if (rec.sizeMismatch) {
      console.warn(`  ! ${LABEL} ${vp.tag}: size mismatch — ours ${rec.oursSize.w}x${rec.oursSize.h} vs baseline ${rec.baselineSize.w}x${rec.baselineSize.h} (scaled smaller → larger)`);
    }
  } catch (e) {
    rec.error = String(e && e.message ? e.message : e).slice(0, 300);
    console.warn(`  ! ${LABEL} ${vp.tag}: run threw — ${rec.error}`);
  } finally {
    await context.close().catch(() => {});
  }

  return rec;
}

/* ---- main ---- */
async function main() {
  mkdirSync(PARITY_DIR, { recursive: true });

  const chromium = await resolveChromium();
  if (!chromium) {
    console.error('visual-parity: playwright chromium not resolvable.');
    console.error('  set PLAYWRIGHT_FROM=<dir>/package.json to point at a playwright install.');
    process.exit(2);
  }

  const browser = await chromium.launch();
  const fresh = [];
  try {
    for (const vp of VIEWPORTS) {
      const rec = await runOne(browser, vp).catch(e => ({
        label: LABEL, viewport: vp.tag, ts: new Date().toISOString(),
        oursUrl: OURS_URL, baseline: baselineFor(vp),
        diffRatio: null, diffPct: null, verdict: 'fail',
        oursShot: null, diffShot: null, baselineSize: null, oursSize: null,
        sizeMismatch: false, error: String(e).slice(0, 300),
      }));
      fresh.push(rec);
    }
  } finally {
    await browser.close().catch(() => {});
  }

  // merge into report: drop prior runs with same label+viewport, append fresh
  const prior = loadReport().filter(
    r => !fresh.some(f => f.label === r.label && f.viewport === r.viewport)
  );
  const report = [...prior, ...fresh];
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  // board reflects the full report so old runs stay visible
  writeFileSync(BOARD_PATH, buildBoard(report));

  // stdout summary (this run only)
  console.log('\n=== visual-parity ===');
  let anyFail = false;
  for (const r of fresh) {
    if (r.error && r.diffPct === null) {
      console.log(`  ✗ ${r.label} ${r.viewport}: ERROR — ${r.error}`);
      anyFail = true;
      continue;
    }
    const mark = r.verdict === 'pass' ? '✓' : '✗';
    if (r.verdict === 'fail') anyFail = true;
    const maskInfo = (r.maskSelectors && r.maskSelectors.length)
      ? (r.maskRects && r.maskRects.length ? ` (masked ${r.maskRects.length} rect(s))` : ' (mask declared, 0 matched!)')
      : '';
    console.log(`  ${mark} ${r.label} ${r.viewport}: ${r.diffPct}% ${r.verdict}${r.sizeMismatch ? ' (size mismatch)' : ''}${maskInfo}`);
  }
  console.log(`\nreport: ${REPORT_PATH}`);
  console.log(`board:  ${BOARD_PATH}`);
  console.log(`        ${pathToFileURL(BOARD_PATH).href}`);

  process.exit(anyFail ? 1 : 0);
}

main().catch(e => {
  console.error('visual-parity: fatal —', e);
  process.exit(2);
});
