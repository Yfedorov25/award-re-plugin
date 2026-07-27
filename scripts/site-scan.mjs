#!/usr/bin/env node
/* ============================================================================
   site-scan.mjs — the DYNAMIC (in-motion) site scanner for award-re. G20.

   HONEST DIVISION OF LABOR (the law):
     script  = HANDS + RULER. It walks every section, records video + frames on
               desktop AND mobile, measures pixel divergence live↔ours per-frame,
               and builds a board. It measures pixels/motion/numbers only.
     agent   = EYE + JUDGE. After the scan, the agent LOOKS at the frames and
               decides if the design is right. NO "design score" is baked in
               here as a threshold — only pixel %, motion, and counts.

   Reused (working, from visual-parity.mjs):
     - resolveChromium(): createRequire from PLAYWRIGHT_FROM (chromium resolve)
     - DIFF_IN_PAGE: a REAL function (NOT a template string — playwright's
       page.evaluate() silently drops the arg if you pass a string; that bug is
       already fixed, do not reintroduce it). Loads two PNGs as base64 data-URLs
       on an about:blank page (a http-origin page cannot load file:// <img>, so
       we diff on a blank page with data-URLs — solved in G15).
     - screenshot + report/board pattern.

   ZERO npm deps (no pixelmatch/pngjs, no package.json).

   What it does, per PAGE × per VIEWPORT, for BOTH live AND ours:
     1. Open the URL, apply the viewport, optional probe_bypass (mask
        navigator.webdriver) via addInitScript.
     2. Start video recording (recordVideo → <out>/<site>/video/), saved as
        <page>-<live|ours>-<vp>.webm.
     3. route "scroll": auto-walk top→bottom by scroll_step_ratio*viewportH,
        settle_ms pause + a frame screenshot at each step, until scrollY is
        stable (bottom reached).
        route "click-then-hold": run triggers (click selector, wait), then one
        frame of the resulting state (menus).
        triggers: [{action:"click", selector, wait_ms}] — run in order first.
        A selector may be a comma list → the first existing one is clicked.
     4. Close the context (finalizes the video).
     5. PER-FRAME DIFF: match live step-N with ours step-N, diffPct via
        DIFF_IN_PAGE. Unequal step counts → diff up to the min, flag mismatch.
        dynamic_masks: bounding boxes captured during the walk are painted BLACK
        in both frames before diffing (best-effort; see honest status below).
     6. Report <out>/<site>/scan-report.json.
     7. Board  <out>/<site>/scan-board.html (page→viewport→step rows + videos).
     8. stdout summary per page/vp.

   Usage:
     node scripts/site-scan.mjs --profile scripts/parity-profiles/aircenter.parity.json
       [--pages home,menu] [--viewports desktop,mobile] [--out scripts/scan/]
   ========================================================================== */
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, renameSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/* per-frame diff verdict threshold (percent) — color only, NOT a design gate */
const RED_THRESHOLD_PCT = 5;
/* per-pixel euclidean RGB distance threshold, 0..255 */
const PIXEL_THRESHOLD = 32;

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

if (!args.profile) {
  console.error('site-scan: missing --profile.');
  console.error('  node scripts/site-scan.mjs --profile scripts/parity-profiles/<site>.parity.json [--pages a,b] [--viewports desktop,mobile] [--out scripts/scan/]');
  process.exit(2);
}

const PROFILE_PATH = resolve(String(args.profile));
if (!existsSync(PROFILE_PATH)) {
  console.error(`site-scan: profile not found: ${PROFILE_PATH}`);
  process.exit(2);
}

let profile;
try {
  profile = JSON.parse(readFileSync(PROFILE_PATH, 'utf8'));
} catch (e) {
  console.error(`site-scan: profile is not valid JSON: ${e.message}`);
  process.exit(2);
}

const SITE = String(profile.site || 'site');
const LIVE_BASE = String(profile.live_base || '').replace(/\/+$/, '');
const OURS_BASE = String(profile.ours_base || '').replace(/\/+$/, '');
const PROBE_BYPASS = !!profile.probe_bypass;
// (scroll_step_ratio no longer used — the walk now drives to progress TARGETS,
// not fixed pixel steps. Kept in the profile for backward compat / docs.)
const SETTLE_MS = Number(profile.settle_ms) > 0 ? Number(profile.settle_ms) : 1200;
// Human-scroll cadence (measured from Yehor's Desktop-air.mp4): a step advances
// via MANY small wheel ticks, not one jump — looks human AND drives Locomotive/
// Lenis smooth-scroll (which dies on big jumps). ~350 px/s continuous + settle.
const TICK_PX = Number(profile.tick_px) > 0 ? Number(profile.tick_px) : 80;
const TICK_MS = Number(profile.tick_ms) > 0 ? Number(profile.tick_ms) : 16;

/* PROGRESS-GRID walk (G20 maturation, session 12) — the fix for the step
   desync that made the diff number invalid. Instead of "scroll N px, shoot,
   repeat until frozen" (which gave live=60 / ours=32 steps → step-N showed
   DIFFERENT page depths → 57% phantom diff), we walk BOTH sides to a SHARED
   grid of normalized scroll-progress targets [0.0 … 1.0]. step-K on live and
   step-K on ours are then the SAME % of page depth by construction, so
   index-matching is correct again.

   Progress axis is read universally in-page (see READ_PROGRESS): native/Lenis
   scrollY normalized by scrollHeight, with a Locomotive fallback that reads the
   custom scrollbar THUMB translateY / (trackH - thumbH) — because Locomotive
   keeps window.scrollY pinned at 0 and only the thumb reports progress. Proven
   on aircenter (thumb) + our combo-lab (native): both reach 0.1/0.2/…/1.0
   within ±1%. */
const PROGRESS_STEP = Number(profile.progress_step) > 0 ? Number(profile.progress_step) : 0.1;
const PROGRESS_GRID = Array.isArray(profile.progress_grid) && profile.progress_grid.length
  ? profile.progress_grid.map(Number).filter(n => n >= 0 && n <= 1).sort((a, b) => a - b)
  : (() => { const g = []; for (let t = 0; t <= 1.00001; t += PROGRESS_STEP) g.push(Math.round(t * 1000) / 1000); return g; })();
const PROGRESS_TOL = Number(profile.progress_tolerance) > 0 ? Number(profile.progress_tolerance) : 0.008;

/* --pages / --viewports filters (comma lists of names/tags) */
const PAGE_FILTER = args.pages ? String(args.pages).split(',').map(s => s.trim()).filter(Boolean) : null;
const VP_FILTER = args.viewports ? String(args.viewports).split(',').map(s => s.trim()).filter(Boolean) : null;

const ALL_VIEWPORTS = Array.isArray(profile.viewports) ? profile.viewports : [];
const VIEWPORTS = ALL_VIEWPORTS.filter(v => !VP_FILTER || VP_FILTER.includes(v.tag));

const ALL_PAGES = Array.isArray(profile.pages) ? profile.pages : [];
const PAGES = ALL_PAGES.filter(p => !PAGE_FILTER || PAGE_FILTER.includes(p.name));

if (VIEWPORTS.length === 0) { console.error('site-scan: no viewports selected.'); process.exit(2); }
if (PAGES.length === 0) { console.error('site-scan: no pages selected.'); process.exit(2); }

const OUT_DIR = args.out ? resolve(String(args.out)) : join(ROOT, 'scripts', 'scan');
const SITE_DIR = join(OUT_DIR, SITE);
const FRAMES_DIR = join(SITE_DIR, 'frames');
const VIDEO_DIR = join(SITE_DIR, 'video');
const REPORT_PATH = join(SITE_DIR, 'scan-report.json');
const BOARD_PATH = join(SITE_DIR, 'scan-board.html');

/* ---- resolve playwright chromium (same pattern as visual-parity.mjs) ---- */
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

/* ---- in-browser canvas diff. REAL function passed to page.evaluate (NEVER a
   string — a string arg is silently dropped). Loads two PNGs (data-URLs) into
   canvases, computes euclidean-RGB per-pixel diff, paints red mask. Optional
   maskRects [{x,y,w,h}] are filled BLACK in BOTH images before comparison so
   dynamic zones (Vimeo spiral, live photos) don't count as divergence.
   Pure browser JS only. ---- */
const DIFF_IN_PAGE = async (params) => {
  const { liveUrl, oursUrl, pixelThreshold, maskRects } = params;

  function load(url) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => rej(new Error('image load failed'));
      img.src = url;
    });
  }

  const [lImg, oImg] = await Promise.all([load(liveUrl), load(oursUrl)]);

  const liveSize = { w: lImg.naturalWidth, h: lImg.naturalHeight };
  const oursSize = { w: oImg.naturalWidth, h: oImg.naturalHeight };

  // common canvas = larger of the two per dimension; smaller stretched to fill.
  const W = Math.max(liveSize.w, oursSize.w);
  const H = Math.max(liveSize.h, oursSize.h);

  function toCtx(img) {
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, W, H);
    // black out dynamic-mask rects in BOTH frames (best-effort)
    if (maskRects && maskRects.length) {
      ctx.fillStyle = '#000';
      for (const r of maskRects) {
        ctx.fillRect(r.x || 0, r.y || 0, r.w || 0, r.h || 0);
      }
    }
    return ctx;
  }

  const b = toCtx(lImg).getImageData(0, 0, W, H);
  const o = toCtx(oImg).getImageData(0, 0, W, H);

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = W; maskCanvas.height = H;
  const mctx = maskCanvas.getContext('2d');
  const mask = mctx.createImageData(W, H);
  const md = mask.data;

  const bd = b.data, od = o.data;
  const total = W * H;
  let different = 0;
  const thr = pixelThreshold;

  for (let i = 0; i < total; i++) {
    const p = i * 4;
    const dr = bd[p] - od[p];
    const dg = bd[p + 1] - od[p + 1];
    const db = bd[p + 2] - od[p + 2];
    const dist = Math.sqrt(dr * dr + dg * dg + db * db) / Math.sqrt(3);
    if (dist > thr) {
      different++;
      md[p] = 255; md[p + 1] = 0; md[p + 2] = 0; md[p + 3] = 255;
    } else {
      md[p] = bd[p]; md[p + 1] = bd[p + 1]; md[p + 2] = bd[p + 2]; md[p + 3] = 70;
    }
  }

  mctx.putImageData(mask, 0, 0);
  const diffDataUrl = maskCanvas.toDataURL('image/png');

  return { diffRatio: different / total, different, total, liveSize, oursSize, diffDataUrl };
};

/* ---- in-page scroll-progress reader. REAL function (never a string arg).
   Returns normalized progress 0..1 usable to align live↔ours by page DEPTH,
   not by frame index. Two axes, tried in order:
     (1) native/Lenis: scrollY (or __lenis.scroll) / (scrollHeight - innerH).
     (2) Locomotive fallback: custom scrollbar thumb translateY / (trackH -
         thumbH) — Locomotive pins window.scrollY at 0 and only the thumb moves.
   If native is effectively 0 but the thumb has moved, we trust the thumb.
   Proven on aircenter (thumb) + our combo-lab (native). ---- */
const READ_PROGRESS = () => {
  const de = document.documentElement;
  const innerH = window.innerHeight || de.clientHeight || 1;
  let y = window.scrollY || window.pageYOffset || de.scrollTop || 0;
  try { if (window.__lenis && typeof window.__lenis.scroll === 'number') y = window.__lenis.scroll; } catch {}
  try { if (window.lenis && typeof window.lenis.scroll === 'number') y = window.lenis.scroll; } catch {}
  const scrollH = Math.max(de.scrollHeight, document.body ? document.body.scrollHeight : 0);
  const nativeDenom = Math.max(1, scrollH - innerH);
  const nativeProg = Math.min(1, Math.max(0, y / nativeDenom));

  let thumbProg = null;
  const thumb = document.querySelector('.c-scrollbar_thumb, [class*=scrollbar_thumb], [class*=scrollbar-thumb]');
  const track = document.querySelector('.c-scrollbar, [class*=scrollbar]:not([class*=thumb])');
  if (thumb && track) {
    const t = getComputedStyle(thumb).transform;
    let ty = 0;
    if (t && t.startsWith('matrix')) {
      const m = t.match(/matrix.*\(([^)]+)\)/);
      if (m) { const p = m[1].split(',').map(Number); ty = t.startsWith('matrix3d') ? (p[13] || 0) : (p[5] || 0); }
    }
    const trackH = track.getBoundingClientRect().height;
    const thumbH = thumb.getBoundingClientRect().height;
    const denom = Math.max(1, trackH - thumbH);
    thumbProg = Math.min(1, Math.max(0, Math.abs(ty) / denom));
  }

  // native barely moved but a smooth-scroll thumb did → trust the thumb.
  const useThumb = nativeProg < 0.002 && thumbProg != null;
  const progress = useThumb ? thumbProg : nativeProg;
  return { progress, nativeProg, thumbProg, axis: useThumb ? 'thumb' : 'native' };
};

/* ---- in-page section-anchor enumerator. REAL function. Returns each section's
   normalized target-progress (anchorTop / (scrollHeight - innerH)) so the walk
   can drive to SECTIONS instead of a uniform grid — matching the SAME content
   block on both sides even when page length / pin count differ. Prefers
   [data-scroll-section] (Locomotive's own marker); falls back to <section>.
   NOTE: on live Locomotive-desktop getBoundingClientRect().top does NOT track
   scroll (transform pins it), so we read each anchor's DOCUMENT offset from the
   top at rest and normalize by the scrollable height — a stable target that the
   thumb-progress driver can then reach. ---- */
const READ_ANCHORS = () => {
  const de = document.documentElement;
  const innerH = window.innerHeight || de.clientHeight || 1;
  const scrollH = Math.max(de.scrollHeight, document.body ? document.body.scrollHeight : 0);
  const denom = Math.max(1, scrollH - innerH);
  const sel = document.querySelectorAll('[data-scroll-section]').length ? '[data-scroll-section]' : 'section';
  const els = Array.from(document.querySelectorAll(sel));
  // absolute document offset = current viewport-top + how far we've scrolled.
  // At rest (top of page) getBoundingClientRect().top IS the document offset.
  return els.map((el, i) => {
    const r = el.getBoundingClientRect();
    const docTop = r.top + (window.scrollY || window.pageYOffset || de.scrollTop || 0);
    return {
      i, sel, tag: el.tagName,
      cls: (typeof el.className === 'string' ? el.className.slice(0, 48) : ''),
      docTop: Math.round(docTop), h: Math.round(r.height),
      targetProgress: Math.min(1, Math.max(0, docTop / denom)),
    };
  });
};

/* ---- walk ONE side (live or ours) of ONE page in ONE viewport.
   Returns { frames:[path...], progresses:[number...], maskRects:[[{x,y,w,h}]...],
   video:path|null, steps:number, error:string|null }. Never throws. ---- */
async function walkSide(browser, { page: pg, vp, side, sideGrid }) {
  const which = side; // 'live' | 'ours'
  const base = side === 'live' ? LIVE_BASE : OURS_BASE;
  const rel = side === 'live' ? pg.live : pg.ours;
  const url = base + (rel || '');
  const prefix = `${pg.name}-${which}-${vp.tag}`;
  const out = { frames: [], progresses: [], maskRects: [], video: null, steps: 0, error: null };

  let context;
  try {
    // recordVideo → dedicated per-run subdir so we can identify the file.
    const runVideoDir = join(VIDEO_DIR, prefix);
    let recordVideo = { dir: runVideoDir, size: { width: vp.w, height: vp.h } };
    context = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
      recordVideo,
    }).catch(async () => {
      // video may fail on some systems — degrade to no-video, keep frames.
      out.error = 'video recording unavailable (frames only)';
      return browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    });

    if (PROBE_BYPASS) {
      await context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
      });
    }

    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
    } catch {
      // networkidle can hang on live sites with long-poll/analytics — fall back.
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
    }
    await page.waitForTimeout(SETTLE_MS);

    // run triggers first (click-then-hold uses them AS the interaction; scroll
    // may use them to dismiss a cookie banner etc.)
    for (const t of (pg.triggers || [])) {
      if (t.action !== 'click') continue;
      const selectors = String(t.selector || '').split(',').map(s => s.trim()).filter(Boolean);
      for (const sel of selectors) {
        try {
          const el = page.locator(sel).first();
          if (await el.count() > 0) {
            await el.click({ timeout: 3000 }).catch(() => {});
            break; // first existing selector wins
          }
        } catch {}
      }
      await page.waitForTimeout(Number(t.wait_ms) > 0 ? Number(t.wait_ms) : 1000);
    }

    // capture dynamic-mask bounding boxes (viewport-relative) for later diffs.
    async function captureMasks() {
      const rects = [];
      for (const sel of (pg.dynamic_masks || [])) {
        try {
          const loc = page.locator(sel);
          const n = Math.min(await loc.count(), 8);
          for (let i = 0; i < n; i++) {
            const box = await loc.nth(i).boundingBox().catch(() => null);
            if (box && box.width > 0 && box.height > 0) {
              rects.push({ x: Math.round(box.x), y: Math.round(box.y), w: Math.round(box.width), h: Math.round(box.height) });
            }
          }
        } catch {}
      }
      return rects;
    }

    if (pg.route === 'click-then-hold') {
      // single frame of the held state (menu etc.) — progress irrelevant (0).
      const framePath = join(FRAMES_DIR, `${prefix}-step00.png`);
      out.maskRects.push(await captureMasks());
      await page.screenshot({ path: framePath });
      out.frames.push(framePath);
      out.progresses.push(0);
      out.steps = 1;
    } else {
      // route "scroll": walk top→bottom driving to a list of normalized-progress
      // TARGETS, shooting one frame at each. Two ways to build that target list:
      //
      //   align "grid" (default): a uniform SHARED grid [0.0 … 1.0]. Both sides
      //     hit the same % of page depth → step-K compares the same depth. This
      //     is the G20-maturation fix for the live=60/ours=32 index desync.
      //
      //   align "sections": targets = each SECTION anchor's progress (READ_ANCHORS
      //     → docTop/(scrollHeight-innerH)), selected per-side via the profile's
      //     section_map so step-K compares the SAME content block even when the
      //     two pages have different section counts / pin depth. `sideGrid` is
      //     precomputed by the caller and passed in.
      //
      // Progress axis is read in-page (READ_PROGRESS): native/Lenis scrollY, or
      // the Locomotive scrollbar-thumb fallback (Locomotive pins scrollY at 0).
      // Driving is HUMAN wheel ticks (TICK_PX/TICK_MS) — looks like a real person
      // AND lets smooth-scroll follow (big jumps get clamped/ignored). Proven:
      // both sides reach arbitrary targets (uniform or anchor) within ±1%.
      const vh = vp.h;
      const targets = (Array.isArray(sideGrid) && sideGrid.length) ? sideGrid : PROGRESS_GRID;
      // per-target guard: cap total ticks so a pinned/uncontrollable section
      // (progress refuses to advance to the next target) can't spin forever.
      const MAX_TICKS_PER_TARGET = Math.max(200, Math.ceil((vh * 12) / TICK_PX));

      // ensure top + park cursor over the content (wheel events hit the point
      // under the cursor; without this the wheel can land on chrome/scrollbar).
      await page.evaluate(() => { try { window.scrollTo(0, 0); } catch {} });
      await page.mouse.move(Math.round(vp.w / 2), Math.round(vp.h / 2));
      await page.waitForTimeout(SETTLE_MS);

      let stepIdx = 0;
      for (const target of targets) {
        // drive until in-page progress reaches this target (or we exhaust ticks /
        // progress stalls — meaning the page is shorter than the grid implies).
        let ticks = 0;
        let stallGuard = 0;
        let prevProg = -1;
        while (ticks < MAX_TICKS_PER_TARGET) {
          const cur = (await page.evaluate(READ_PROGRESS)).progress;
          if (cur >= target - PROGRESS_TOL) break;
          // detect a hard stall: progress not advancing across a run of ticks →
          // we've hit the real bottom before this target. Stop advancing; we'll
          // still shoot the current (max-depth) frame for this and remaining
          // targets so both sides keep the same step COUNT (grid length).
          if (Math.abs(cur - prevProg) < 0.0005) { stallGuard++; } else { stallGuard = 0; }
          if (stallGuard >= 40) break;
          prevProg = cur;
          await page.mouse.wheel(0, TICK_PX);
          ticks++;
          await page.waitForTimeout(TICK_MS);
        }
        await page.waitForTimeout(SETTLE_MS);

        const nn = String(stepIdx).padStart(2, '0');
        const framePath = join(FRAMES_DIR, `${prefix}-step${nn}.png`);
        out.maskRects.push(await captureMasks());
        await page.screenshot({ path: framePath });
        out.frames.push(framePath);
        out.progresses.push(Math.round((await page.evaluate(READ_PROGRESS)).progress * 1000) / 1000);
        stepIdx++;
      }
      out.steps = stepIdx;
    }

    // grab the video path (playwright names it after the page)
    try {
      const v = page.video();
      if (v) out.video = await v.path().catch(() => null);
    } catch {}
  } catch (e) {
    out.error = String(e && e.message ? e.message : e).slice(0, 300);
  } finally {
    // close context → finalizes video
    if (context) await context.close().catch(() => {});
  }

  // rename recorded video to a stable name
  if (out.video && existsSync(out.video)) {
    const stable = join(VIDEO_DIR, `${prefix}.webm`);
    try { renameSync(out.video, stable); out.video = stable; } catch { /* keep original */ }
  } else if (!out.video) {
    // fallback: find any .webm dropped in the per-run dir
    const runVideoDir = join(VIDEO_DIR, prefix);
    try {
      if (existsSync(runVideoDir)) {
        const f = readdirSync(runVideoDir).find(x => x.endsWith('.webm'));
        if (f) {
          const stable = join(VIDEO_DIR, `${prefix}.webm`);
          renameSync(join(runVideoDir, f), stable);
          out.video = stable;
        }
      }
    } catch {}
  }

  return out;
}

/* ---- diff a matched pair of frames (live vs ours) via canvas ---- */
async function diffPair(context, liveFrame, oursFrame, maskRects) {
  const liveUrl = 'data:image/png;base64,' + readFileSync(liveFrame).toString('base64');
  const oursUrl = 'data:image/png;base64,' + readFileSync(oursFrame).toString('base64');
  const diffPage = await context.newPage();
  try {
    await diffPage.goto('about:blank');
    const result = await diffPage.evaluate(DIFF_IN_PAGE, {
      liveUrl, oursUrl, pixelThreshold: PIXEL_THRESHOLD, maskRects: maskRects || [],
    });
    return result;
  } finally {
    await diffPage.close().catch(() => {});
  }
}

/* ---- quick anchor read: open a page, enumerate section anchors, close. Used
   only for align:"sections" to build the per-side target grids up front. ---- */
async function readAnchors(browser, pg, vp, side) {
  const base = side === 'live' ? LIVE_BASE : OURS_BASE;
  const url = base + ((side === 'live' ? pg.live : pg.ours) || '');
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  if (PROBE_BYPASS) await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  const page = await ctx.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(SETTLE_MS);
    const anchors = await page.evaluate(READ_ANCHORS);
    return anchors;
  } catch { return []; }
  finally { await ctx.close().catch(() => {}); }
}

/* ---- build a section_map into two parallel target-progress lists. section_map
   is [[liveIdx, oursIdx], …] from the profile. Missing/short map → auto-pair by
   proportional index (liveIdx → round(liveIdx * (Nours-1)/(Nlive-1))). ---- */
function buildSectionGrids(liveAnchors, oursAnchors, sectionMap) {
  const clamp = (i, n) => Math.max(0, Math.min(n - 1, i));
  let pairs;
  if (Array.isArray(sectionMap) && sectionMap.length) {
    pairs = sectionMap
      .filter(p => Array.isArray(p) && p.length === 2)
      .map(([l, o]) => [clamp(l | 0, liveAnchors.length), clamp(o | 0, oursAnchors.length)]);
  } else {
    // proportional auto-pairing across the shorter side's count
    const nL = liveAnchors.length, nO = oursAnchors.length;
    const n = Math.max(nL, nO);
    pairs = [];
    for (let k = 0; k < n; k++) {
      const l = clamp(Math.round(k * (nL - 1) / Math.max(1, n - 1)), nL);
      const o = clamp(Math.round(k * (nO - 1) / Math.max(1, n - 1)), nO);
      pairs.push([l, o]);
    }
  }
  return {
    live: pairs.map(([l]) => liveAnchors[l] ? liveAnchors[l].targetProgress : 0),
    ours: pairs.map(([, o]) => oursAnchors[o] ? oursAnchors[o].targetProgress : 0),
    pairs,
  };
}

/* ---- process ONE page × ONE viewport (both sides + diffs). Returns rows. ---- */
async function scanPageViewport(browser, pg, vp) {
  const rows = [];
  const label = `${pg.name} ${vp.tag}`;

  // align:"sections" → precompute per-side target grids from section anchors.
  let liveGrid = null, oursGrid = null, sectionPairs = null;
  if (pg.align === 'sections' && pg.route !== 'click-then-hold') {
    console.log(`→ ${label}: reading section anchors…`);
    const [liveAnchors, oursAnchors] = await Promise.all([
      readAnchors(browser, pg, vp, 'live'),
      readAnchors(browser, pg, vp, 'ours'),
    ]);
    const grids = buildSectionGrids(liveAnchors, oursAnchors, pg.section_map);
    liveGrid = grids.live; oursGrid = grids.ours; sectionPairs = grids.pairs;
    console.log(`  ${label}: ${liveAnchors.length} live / ${oursAnchors.length} ours anchors → ${sectionPairs.length} matched section(s)`);
  }

  console.log(`→ ${label}: walking live…`);
  const live = await walkSide(browser, { page: pg, vp, side: 'live', sideGrid: liveGrid })
    .catch(e => ({ frames: [], progresses: [], maskRects: [], video: null, steps: 0, error: String(e).slice(0, 300) }));
  console.log(`→ ${label}: walking ours…`);
  const ours = await walkSide(browser, { page: pg, vp, side: 'ours', sideGrid: oursGrid })
    .catch(e => ({ frames: [], progresses: [], maskRects: [], video: null, steps: 0, error: String(e).slice(0, 300) }));

  const masksDeclared = (pg.dynamic_masks || []).length > 0;
  const nSteps = Math.min(live.frames.length, ours.frames.length);
  // With the shared progress grid both sides walk the SAME number of steps, so a
  // frame-COUNT mismatch is now the exception (only when a walk erred out early).
  const stepMismatch = live.frames.length !== ours.frames.length;
  const liveProg = live.progresses || [];
  const oursProg = ours.progresses || [];

  // reuse one context for all diffs of this pair (about:blank pages only)
  const diffContext = await browser.newContext();
  try {
    for (let s = 0; s < nSteps; s++) {
      const liveFrame = live.frames[s];
      const oursFrame = ours.frames[s];
      // union of both sides' masks for this step
      const maskRects = [
        ...((live.maskRects[s]) || []),
        ...((ours.maskRects[s]) || []),
      ];
      // alignment check. In "grid" mode both sides target the SAME depth for
      // step s → a progress delta >0.03 means a pin held one side back and the
      // diff compares different depths (flag + exclude). In "sections" mode the
      // two sides are DELIBERATELY at different depths (same section, different %
      // of page) — so progress delta is expected and NOT a misalignment; the
      // match is by section index, which is exact by construction.
      const sectionMode = pg.align === 'sections';
      const lp = typeof liveProg[s] === 'number' ? liveProg[s] : null;
      const op = typeof oursProg[s] === 'number' ? oursProg[s] : null;
      const progDelta = (lp != null && op != null) ? Math.round(Math.abs(lp - op) * 1000) / 1000 : null;
      const misaligned = !sectionMode && progDelta != null && progDelta > 0.03;
      const sectionPair = (sectionMode && sectionPairs && sectionPairs[s]) ? sectionPairs[s] : null;
      const row = {
        page: pg.name, viewport: vp.tag, step: s,
        align: sectionMode ? 'sections' : 'grid',
        section: sectionPair ? { live: sectionPair[0], ours: sectionPair[1] } : null,
        liveFrame, oursFrame,
        liveProgress: lp, oursProgress: op, progressDelta: progDelta, misaligned,
        diffPct: null, different: null, total: null,
        liveSize: null, oursSize: null,
        mismatch: stepMismatch,
        masksDeclared, masksApplied: maskRects.length > 0,
        diffFrame: null, error: null,
      };
      try {
        const r = await diffPair(diffContext, liveFrame, oursFrame, maskRects);
        row.diffPct = Math.round(r.diffRatio * 10000) / 100;
        row.different = r.different;
        row.total = r.total;
        row.liveSize = r.liveSize;
        row.oursSize = r.oursSize;
        // write diff mask PNG
        const diffPath = join(FRAMES_DIR, `${pg.name}-diff-${vp.tag}-step${String(s).padStart(2, '0')}.png`);
        const b64 = r.diffDataUrl.replace(/^data:image\/png;base64,/, '');
        writeFileSync(diffPath, Buffer.from(b64, 'base64'));
        row.diffFrame = diffPath;
      } catch (e) {
        row.error = String(e && e.message ? e.message : e).slice(0, 200);
      }
      rows.push(row);
    }
  } finally {
    await diffContext.close().catch(() => {});
  }

  // if one side has extra frames beyond the min, record them as unmatched rows
  const extraSide = live.frames.length > ours.frames.length ? 'live' : (ours.frames.length > live.frames.length ? 'ours' : null);
  if (extraSide) {
    const longer = extraSide === 'live' ? live : ours;
    for (let s = nSteps; s < longer.frames.length; s++) {
      rows.push({
        page: pg.name, viewport: vp.tag, step: s,
        liveFrame: extraSide === 'live' ? longer.frames[s] : null,
        oursFrame: extraSide === 'ours' ? longer.frames[s] : null,
        liveProgress: extraSide === 'live' ? (liveProg[s] ?? null) : null,
        oursProgress: extraSide === 'ours' ? (oursProg[s] ?? null) : null,
        progressDelta: null, misaligned: false,
        diffPct: null, different: null, total: null, liveSize: null, oursSize: null,
        mismatch: true, masksDeclared, masksApplied: false, diffFrame: null,
        error: `unmatched extra ${extraSide} frame (no counterpart to diff)`,
      });
    }
  }

  // group summary. avg/max now come from progress-ALIGNED rows only (misaligned
  // steps compare different depths → they'd inflate the number the way the old
  // index-matching did; exclude them from the headline, keep them visible in the
  // board flagged). alignedAvg is the number the agent should trust.
  const allDiffs = rows.map(r => r.diffPct).filter(x => typeof x === 'number');
  const alignedDiffs = rows.filter(r => typeof r.diffPct === 'number' && !r.misaligned).map(r => r.diffPct);
  const mean = a => a.length ? Math.round((a.reduce((x, y) => x + y, 0) / a.length) * 100) / 100 : null;
  const avg = mean(allDiffs);
  const alignedAvg = mean(alignedDiffs);
  const max = allDiffs.length ? Math.max(...allDiffs) : null;
  const misalignedSteps = rows.filter(r => r.misaligned).length;

  console.log(`  ${label}: ${nSteps} steps${stepMismatch ? ` (COUNT mismatch: live ${live.frames.length} / ours ${ours.frames.length})` : ''}, aligned-avg ${alignedAvg ?? '—'}% (all ${avg ?? '—'}%), max ${max ?? '—'}%${misalignedSteps ? `, ${misalignedSteps} misaligned step(s) excluded` : ''}`);
  if (live.error) console.warn(`  ! ${label} live: ${live.error}`);
  if (ours.error) console.warn(`  ! ${label} ours: ${ours.error}`);

  return {
    page: pg.name, viewport: vp.tag,
    liveVideo: live.video, oursVideo: ours.video,
    liveSteps: live.frames.length, oursSteps: ours.frames.length,
    stepMismatch, masksDeclared, misalignedSteps,
    liveError: live.error, oursError: ours.error,
    avgDiffPct: avg, alignedAvgDiffPct: alignedAvg, maxDiffPct: max,
    rows,
  };
}

/* ---- html board ---- */
function buildBoard(groups) {
  const sections = groups.map(g => {
    const liveVid = g.liveVideo ? relative(SITE_DIR, g.liveVideo) : '';
    const oursVid = g.oursVideo ? relative(SITE_DIR, g.oursVideo) : '';
    const videoBar = `
      <div class="videos">
        ${liveVid ? `<div class="vid"><span>LIVE</span><video controls preload="metadata" src="${liveVid}"></video></div>` : `<div class="vid missing">live video — none</div>`}
        ${oursVid ? `<div class="vid"><span>OURS</span><video controls preload="metadata" src="${oursVid}"></video></div>` : `<div class="vid missing">ours video — none</div>`}
      </div>`;
    const walkErr = (g.liveError || g.oursError)
      ? `<div class="err">walk: ${escapeHtml([g.liveError && ('live — ' + g.liveError), g.oursError && ('ours — ' + g.oursError)].filter(Boolean).join(' · '))}</div>`
      : '';
    const mismatch = g.stepMismatch
      ? `<div class="warn">step count mismatch — live ${g.liveSteps} / ours ${g.oursSteps} (diffed up to min)</div>`
      : '';

    const stepRows = g.rows.map(r => {
      const liveRel = r.liveFrame ? relative(SITE_DIR, r.liveFrame) : '';
      const oursRel = r.oursFrame ? relative(SITE_DIR, r.oursFrame) : '';
      const diffRel = r.diffFrame ? relative(SITE_DIR, r.diffFrame) : '';
      const hasPct = typeof r.diffPct === 'number';
      const over = hasPct && r.diffPct > RED_THRESHOLD_PCT;
      const badgeColor = !hasPct ? '#656d76' : (over ? '#cf222e' : '#1a7f37');
      const badgeBg = !hasPct ? '#eaeef2' : (over ? '#ffebe9' : '#dafbe1');
      const maskNote = r.masksDeclared
        ? `<span class="mask ${r.masksApplied ? 'on' : 'off'}">masks ${r.masksApplied ? 'applied' : 'declared·NOT applied'}</span>`
        : '';
      // section label (sections mode) — which section index on each side.
      const secNote = r.section
        ? `<span class="sec">section L#${r.section.live} ↔ O#${r.section.ours}</span>`
        : '';
      // progress label: where on the page (0..1) this frame sits on each side.
      const progNote = (typeof r.liveProgress === 'number' || typeof r.oursProgress === 'number')
        ? `<span class="prog">depth L ${r.liveProgress != null ? r.liveProgress.toFixed(2) : '—'} / O ${r.oursProgress != null ? r.oursProgress.toFixed(2) : '—'}</span>`
        : '';
      const misNote = r.misaligned
        ? `<span class="mis">misaligned Δ${r.progressDelta} — excluded from avg</span>`
        : '';
      const errNote = r.error ? `<span class="rowerr">${escapeHtml(r.error)}</span>` : '';
      const cell = (title, src) => `
        <figure>
          <figcaption>${title}</figcaption>
          ${src ? `<a href="${src}" target="_blank"><img src="${src}" loading="lazy"></a>` : `<div class="nomg">—</div>`}
        </figure>`;
      return `
      <div class="step${r.misaligned ? ' stepmis' : ''}">
        <div class="stephead">
          <strong>step ${r.step}</strong>
          <span class="badge" style="color:${badgeColor};background:${badgeBg}">${hasPct ? r.diffPct + '%' : 'n/a'}</span>
          ${secNote}${progNote}${misNote}${maskNote}${errNote}
        </div>
        <div class="grid">
          ${cell('LIVE', liveRel)}
          ${cell('OURS', oursRel)}
          ${cell('DIFF (red=divergence)', diffRel)}
        </div>
      </div>`;
    }).join('\n');

    return `
    <section class="group">
      <header>
        <h2>${escapeHtml(g.page)} <span class="vp">${escapeHtml(g.viewport)}</span></h2>
        <span class="gsum">${g.rows.length} step(s) · <b>aligned-avg ${g.alignedAvgDiffPct ?? '—'}%</b> · all-avg ${g.avgDiffPct ?? '—'}% · max ${g.maxDiffPct ?? '—'}%${g.misalignedSteps ? ` · ${g.misalignedSteps} misaligned` : ''}</span>
      </header>
      ${videoBar}
      ${mismatch}${walkErr}
      ${stepRows}
    </section>`;
  }).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>site-scan board — ${escapeHtml(SITE)}</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body { font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
         margin: 0; padding: 24px; background: #f6f8fa; color: #1f2328; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .top { margin-bottom: 20px; }
  .top .note { color: #656d76; font-size: 12px; max-width: 720px; }
  .group { background: #fff; border: 1px solid #d0d7de; border-radius: 10px; padding: 16px; margin-bottom: 22px; }
  .group header { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
  .group h2 { font-size: 17px; margin: 0; }
  .vp { font-weight: 400; color: #656d76; font-size: 13px; }
  .gsum { color: #656d76; font-size: 12px; }
  .videos { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
  @media (max-width: 900px) { .videos { grid-template-columns: 1fr; } }
  .vid { display: flex; flex-direction: column; gap: 4px; }
  .vid span { font-size: 11px; font-weight: 700; color: #656d76; }
  .vid video { width: 100%; border: 1px solid #d0d7de; border-radius: 6px; background: #000; }
  .vid.missing { color: #999; font-size: 12px; padding: 12px; border: 1px dashed #d0d7de; border-radius: 6px; }
  .warn { color: #9a6700; background: #fff8c5; padding: 6px 10px; border-radius: 6px; margin: 8px 0; font-size: 12px; }
  .err { color: #cf222e; background: #ffebe9; padding: 6px 10px; border-radius: 6px; margin: 8px 0; font-size: 12px; }
  .step { border-top: 1px solid #eaeef2; padding-top: 12px; margin-top: 12px; }
  .step.stepmis { background: #fff8c5; border-radius: 8px; padding: 12px; }
  .stephead { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 8px; }
  .badge { font-weight: 700; padding: 2px 9px; border-radius: 999px; font-size: 12px; white-space: nowrap; }
  .mask { font-size: 11px; padding: 1px 7px; border-radius: 999px; }
  .mask.on { color: #0a3069; background: #ddf4ff; }
  .mask.off { color: #9a6700; background: #fff8c5; }
  .prog { font-size: 11px; padding: 1px 7px; border-radius: 999px; color: #24292f; background: #eaeef2; font-variant-numeric: tabular-nums; }
  .sec { font-size: 11px; padding: 1px 7px; border-radius: 999px; color: #0a3069; background: #ddf4ff; font-weight: 600; }
  .mis { font-size: 11px; padding: 1px 7px; border-radius: 999px; color: #9a6700; background: #fff1b8; font-weight: 600; }
  .rowerr { font-size: 11px; color: #cf222e; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
  figure { margin: 0; }
  figcaption { font-size: 11px; font-weight: 600; color: #656d76; margin-bottom: 4px; }
  figure img { width: 100%; height: auto; border: 1px solid #d0d7de; border-radius: 6px;
               background: repeating-conic-gradient(#eee 0% 25%, #fff 0% 50%) 50% / 16px 16px; display: block; }
  .nomg { padding: 20px; text-align: center; color: #999; border: 1px dashed #d0d7de; border-radius: 6px; }
  a { color: inherit; }
</style>
</head>
<body>
  <div class="top">
    <h1>site-scan board — ${escapeHtml(SITE)}</h1>
    <div class="note">Hands + ruler only. Numbers are pixel divergence % (red &gt; ${RED_THRESHOLD_PCT}%), NOT a design verdict. The agent looks at the frames and judges. <b>Both sides walk a shared scroll-progress grid</b> (depth L/O per step) so step-N compares the same page depth; a step whose live/ours depth still diverged &gt;0.03 is flagged <b>misaligned</b> and excluded from aligned-avg. Generated ${escapeHtml(new Date().toISOString())}.</div>
  </div>
  ${sections}
</body>
</html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* ---- main ---- */
async function main() {
  mkdirSync(FRAMES_DIR, { recursive: true });
  mkdirSync(VIDEO_DIR, { recursive: true });

  const chromium = await resolveChromium();
  if (!chromium) {
    console.error('site-scan: playwright chromium not resolvable.');
    console.error('  set PLAYWRIGHT_FROM=<dir>/package.json to point at a playwright install.');
    process.exit(2);
  }

  console.log(`site-scan: ${SITE} · ${PAGES.length} page(s) × ${VIEWPORTS.length} viewport(s)`);
  console.log(`  live: ${LIVE_BASE}   ours: ${OURS_BASE}`);

  const browser = await chromium.launch();
  const groups = [];
  try {
    for (const pg of PAGES) {
      for (const vp of VIEWPORTS) {
        // one failed page×viewport must not kill the rest
        const g = await scanPageViewport(browser, pg, vp).catch(e => ({
          page: pg.name, viewport: vp.tag,
          liveVideo: null, oursVideo: null, liveSteps: 0, oursSteps: 0,
          stepMismatch: false, masksDeclared: (pg.dynamic_masks || []).length > 0, misalignedSteps: 0,
          liveError: String(e).slice(0, 300), oursError: null,
          avgDiffPct: null, alignedAvgDiffPct: null, maxDiffPct: null, rows: [],
        }));
        groups.push(g);
      }
    }
  } finally {
    await browser.close().catch(() => {});
  }

  // report: flat rows + per-group meta (videos, steps)
  const report = {
    site: SITE, generated: new Date().toISOString(),
    profile: PROFILE_PATH,
    redThresholdPct: RED_THRESHOLD_PCT, pixelThreshold: PIXEL_THRESHOLD,
    grid: PROGRESS_GRID, progressTolerance: PROGRESS_TOL,
    groups: groups.map(g => ({
      page: g.page, viewport: g.viewport,
      liveVideo: g.liveVideo, oursVideo: g.oursVideo,
      liveSteps: g.liveSteps, oursSteps: g.oursSteps,
      stepMismatch: g.stepMismatch, masksDeclared: g.masksDeclared, misalignedSteps: g.misalignedSteps,
      liveError: g.liveError, oursError: g.oursError,
      avgDiffPct: g.avgDiffPct, alignedAvgDiffPct: g.alignedAvgDiffPct, maxDiffPct: g.maxDiffPct,
    })),
    rows: groups.flatMap(g => g.rows),
  };
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  writeFileSync(BOARD_PATH, buildBoard(groups));

  console.log('\n=== site-scan summary (aligned-avg = trust this; misaligned steps excluded) ===');
  for (const g of groups) {
    console.log(`  ${g.page} ${g.viewport}: ${g.rows.length} step(s), aligned-avg ${g.alignedAvgDiffPct ?? '—'}% (all ${g.avgDiffPct ?? '—'}%), max ${g.maxDiffPct ?? '—'}%${g.misalignedSteps ? ` [${g.misalignedSteps} misaligned]` : ''}${g.stepMismatch ? ` [COUNT mismatch live ${g.liveSteps}/ours ${g.oursSteps}]` : ''}`);
  }
  console.log(`\nreport: ${REPORT_PATH}`);
  console.log(`board:  ${BOARD_PATH}`);
  console.log(`        ${pathToFileURL(BOARD_PATH).href}`);
}

main().catch(e => {
  console.error('site-scan: fatal —', e);
  process.exit(2);
});
