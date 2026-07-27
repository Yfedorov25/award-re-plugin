#!/usr/bin/env node
/* ============================================================================
   capture-live-baseline.mjs — freeze a live aircenter.space screenshot as a
   G15 baseline. Matches baselines.meta.json capture_method exactly:
   "playwright headless, navigator.webdriver=false, domcontentloaded + 3.5s".

   Use this to add baselines for Б-1.3 (about/location/investment/… + mobile
   viewports) so visual-parity has a frozen "truth" to diff against.

   Usage:
     node scripts/capture-live-baseline.mjs --url <live-url> --out <PNG> \
        [--viewport 1440x820] [--click "<css>"] [--wait 3500] [--click-wait 2000]

     --click  CSS selector clicked after load (open menu/panel before shot).
              Live mobile menu trigger = a.js-modal-toggle[href="#menu"].
     --viewport  WxH (mobile → adds isMobile+hasTouch + iPhone UA).

   Examples (session 14 baselines):
     --url https://aircenter.space/ --viewport 390x844 \
        --click 'a.js-modal-toggle[href="#menu"]' --out .../menu-390.png
     --url https://aircenter.space/visual-search --viewport 390x844 \
        --out .../funnel-390.png

   Playwright resolved via createRequire from apps/smarts (same as visual-parity).
   Reads only a public page — no mutation. Remember to add a matching entry to
   baselines.meta.json (shot_at = today) after capturing.
   ========================================================================== */
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2), n = argv[i + 1];
      if (n === undefined || n.startsWith('--')) out[k] = true;
      else { out[k] = n; i++; }
    }
  }
  return out;
}
const args = parseArgs(process.argv.slice(2));
if (!args.url || !args.out) {
  console.error('usage: --url <live-url> --out <PNG> [--viewport 1440x820] [--click "<css>"] [--wait 3500] [--click-wait 2000]');
  process.exit(2);
}
const [W, H] = String(args.viewport || '1440x820').split('x').map(Number);
const WAIT = args.wait !== undefined ? Number(args.wait) : 3500;
const CLICK_WAIT = args['click-wait'] !== undefined ? Number(args['click-wait']) : 2000;
const isMobile = W <= 500;

async function resolveChromium() {
  const reqRoots = [
    process.env.PLAYWRIGHT_FROM,
    join(ROOT, '..', 'eruhomist', 'apps', 'smarts', 'package.json'),
    '/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json',
  ].filter(Boolean);
  for (const r of reqRoots) {
    try {
      const require = createRequire(pathToFileURL(r));
      const pw = require('playwright');
      if (pw && pw.chromium) return pw.chromium;
    } catch {}
  }
  try { return (await import('playwright')).chromium; } catch {}
  return null;
}

const chromium = await resolveChromium();
if (!chromium) { console.error('playwright chromium not resolvable; set PLAYWRIGHT_FROM'); process.exit(1); }
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
  ...(isMobile ? {
    isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  } : {}),
});
await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
const page = await ctx.newPage();
console.log(`goto ${args.url} @ ${W}x${H}`);
await page.goto(String(args.url), { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(WAIT);
if (args.click) {
  console.log(`click ${args.click}`);
  try { await page.click(String(args.click), { timeout: 5000 }); }
  catch (e) {
    console.log(`click failed (${e.message}), JS-click fallback`);
    await page.evaluate((s) => { const el = document.querySelector(s); if (el) el.click(); }, String(args.click));
  }
  await page.waitForTimeout(CLICK_WAIT);
}
await page.screenshot({ path: String(args.out) });
console.log(`saved ${args.out}`);
await browser.close();
