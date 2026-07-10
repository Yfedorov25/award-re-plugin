/* ============================================================
   SCROLL-SCRUB MOBILE @390 (сесія 18) — mobile-пари live↔ours
   ------------------------------------------------------------
   Живий AIR на mobile-в'юпорті НЕ має Locomotive/повзунка:
   скролиться внутрішній контейнер .page-content-wrapper__inner
   (touch UA обов'язковий, інакше desktop-верстка).
   Наше — нативний window-скрол.

   Запуск: PLAYWRIGHT_FROM=<pkg> node scripts/scroll-scrub-mobile.mjs \
     --live https://aircenter.space/about \
     --ours http://localhost:8820/combos/about-air/combo-lab.html \
     --steps 120 --out library/boards/about-scrub-m390
   Кадри: live-NNN.jpg / ours-NNN.jpg + meta.json (мобільні анкори живого).
   ============================================================ */
import { mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
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
const LIVE = arg('live'); const OURS = arg('ours');
const N = +(arg('steps', 120)); const OUT = resolve(arg('out', 'library/boards/scrub-m390'));
const Q = +(arg('quality', 52));
if (!LIVE || !OURS) { console.error('потрібні --live --ours'); process.exit(1); }
mkdirSync(OUT, { recursive: true });

const b = await chromium.launch();

/* ── LIVE @390: контейнерний скрол (touch UA) ── */
let anchors = { limit: 0, list: [] };
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Version/16.0 Mobile/15E148 Safari/604.1',
    hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  await p.goto(LIVE, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(5000);
  try { await p.click('button:has-text("ACCEPT")', { timeout: 1500 }); } catch (e) {}
  anchors = await p.evaluate(() => {
    const c = document.querySelector('.page-content-wrapper__inner');
    const limit = c.scrollHeight - c.clientHeight;
    const secs = [...document.querySelectorAll('[data-scroll-section], section[id]')];
    return { limit, list: secs.map((s, i) => ({ id: s.id || 'sec' + i,
      frac: +(((s.getBoundingClientRect().top + c.scrollTop)) / limit).toFixed(4) }))
      .filter(a => a.frac > 0 && a.frac <= 1) };
  });
  console.log('live limit', anchors.limit, 'anchors:',
    anchors.list.filter(a => !a.id.startsWith('sec')).map(a => a.id + '@' + a.frac).join(' '));
  for (let i = 0; i < N; i++) {
    const f = i / (N - 1);
    await p.evaluate((fr) => { const c = document.querySelector('.page-content-wrapper__inner');
      c.scrollTop = Math.round(fr * (c.scrollHeight - c.clientHeight)); }, f);
    await p.waitForTimeout(220);
    await p.screenshot({ path: `${OUT}/live-${String(i).padStart(3, '0')}.jpg`, type: 'jpeg', quality: Q });
    if (i % 20 === 0) console.log('live', i, '/', N);
  }
  await ctx.close();
}

/* ── OURS @390: нативний скрол ── */
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(OURS, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(2000);
  for (let i = 0; i < N; i++) {
    const f = i / (N - 1);
    await p.evaluate((fr) => { const limit = document.body.scrollHeight - innerHeight;
      scrollTo(0, Math.round(fr * limit)); }, f);
    await p.waitForTimeout(150);
    await p.screenshot({ path: `${OUT}/ours-${String(i).padStart(3, '0')}.jpg`, type: 'jpeg', quality: Q });
    if (i % 20 === 0) console.log('ours', i, '/', N);
  }
  await ctx.close();
}
writeFileSync(`${OUT}/meta.json`, JSON.stringify({ n: N, anchors: anchors.list,
  limit: anchors.limit, live: LIVE, ours: OURS, at: new Date().toISOString() }, null, 1));
await b.close();
console.log('DONE', OUT);
