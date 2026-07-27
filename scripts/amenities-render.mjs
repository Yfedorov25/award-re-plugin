#!/usr/bin/env node
/* amenities-render.mjs — render each self-contained variant at 390x844, capture console
   errors + 404s, TEST that each carousel actually swaps on tap, and screenshot full page. */
import { resolveChromium } from './token-extractor.mjs';
import { mkdirSync } from 'node:fs';

const chromium = await resolveChromium();
if (!chromium) { console.error('no chromium (set PLAYWRIGHT_FROM)'); process.exit(2); }

const BASE = 'http://localhost:8879/atoms/amenities-detail/variants';
const OUTDIR = '/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/a3f9b9d5-6e92-4349-be21-53ca298b389f/scratchpad/amen-shots';
mkdirSync(OUTDIR, { recursive: true });

const browser = await chromium.launch();
const variant = process.argv[2] || 'a';
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();

const errors = [], failed = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('requestfailed', r => failed.push(r.url() + ' :: ' + (r.failure()?.errorText || '')));
page.on('response', r => { if (r.status() >= 400) failed.push(r.url() + ' :: HTTP ' + r.status()); });

await page.goto(`${BASE}/amenities-${variant}.html`, { waitUntil: 'load', timeout: 30000 });
await page.waitForFunction(() => window.__PAGE_OK__ === true, { timeout: 8000 }).catch(() => {});
await page.waitForTimeout(900);

// no horizontal overflow?
const noHOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);

// ── carousel tap tests: for each stage, click next twice, read which slide is opaque ──
async function testCarousel(cref) {
  return await page.evaluate((cref) => {
    const stage = document.querySelector(`[data-cref="${cref}"]`);
    if (!stage) return { cref, ok: false, why: 'no stage' };
    const slides = [...stage.querySelectorAll('[data-cslide]')];
    const caps = [...stage.querySelectorAll('[data-ccap]')];
    const opaque = () => slides.findIndex(s => parseFloat(getComputedStyle(s).opacity) > 0.5);
    const capOpaque = () => caps.findIndex(s => parseFloat(getComputedStyle(s).opacity) > 0.5);
    const start = opaque();
    // find the next button within this stage's section
    const sec = stage.closest('section') || stage;
    const nextBtn = sec.querySelector('[data-act$="Next"]');
    if (!nextBtn) return { cref, ok: false, why: 'no next btn', slides: slides.length };
    nextBtn.click();
    return new Promise(res => setTimeout(() => {
      const after1 = opaque();
      nextBtn.click();
      setTimeout(() => {
        const after2 = opaque();
        res({ cref, ok: after1 !== start && after2 !== after1, slides: slides.length,
              start, after1, after2, capSynced: capOpaque() === after2 });
      }, 520);
    }, 520));
  }, cref);
}
const cA = await testCarousel('a');
const cB = await testCarousel('b');
const cC = await testCarousel('c');

// tab test for carousel A (click HAMMAM tab -> slide 3)
const tabTest = await page.evaluate(() => {
  const stage = document.querySelector('[data-cref="a"]');
  const tabs = [...stage.querySelectorAll('[data-ctab]')];
  if (tabs.length < 4) return { ok:false, why:'tabs<4' };
  tabs[3].click();
  return new Promise(res => setTimeout(() => {
    const slides=[...stage.querySelectorAll('[data-cslide]')];
    const op = slides.findIndex(s=>parseFloat(getComputedStyle(s).opacity)>0.5);
    res({ ok: op===3, landedOn: op });
  }, 520));
});

// reset A to slide 0 for the screenshot, then full-page shot
await page.evaluate(() => { const s=document.querySelector('[data-cref="a"]'); const t=s&&s.querySelector('[data-ctab]'); if(t) t.click(); });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUTDIR}/amenities-${variant}-full.png`, fullPage: true });

console.log(JSON.stringify({
  variant, __PAGE_OK__: await page.evaluate(()=>window.__PAGE_OK__===true),
  noHOverflow, errors, failed,
  carouselA: cA, carouselB: cB, carouselC: cC, tabTest,
  shot: `${OUTDIR}/amenities-${variant}-full.png`
}, null, 2));

await browser.close();
