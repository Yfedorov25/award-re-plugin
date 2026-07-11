/* ============================================================
   MOTION-IB (с25) — drag-motion-екстрактор живого info-bottom /about.
   Справжній mousedown-drag по .c-scrollbar_thumb (Locomotive реагує ЛИШЕ
   на реальний драг — mouse.move без down дає СТАТИЧНІ top, урок с24).
   На кожному frac знімає viewport-top елементів info-bottom (2 фото, map,
   sticky-шар, cap-тексти) → крива ПРИТРИМАННЯ (sticky--under-next).
   Мета: репліка живого sticky на нашому info-bottom (НЕ padding).

   Запуск: PLAYWRIGHT_FROM=<pkg> node scripts/motion-ib-air.mjs \
     [--live https://aircenter.space/about] [--from 0.02 --to 0.20 --steps 24] \
     [--ours http://localhost:8820/combos/about-air/combo-lab.html]  (--ours: паралельна наша крива)
   Вивід: таблиця frac × top(elem) для live (і ours якщо задано) + JSON.
   ============================================================ */
import { writeFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { createRequire } from 'node:module';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const LIVE = arg('live', 'https://aircenter.space/about');
const OURS = arg('ours', null);
const FROM = +arg('from', 0.02), TO = +arg('to', 0.20), N = +arg('steps', 24);
const VP = { width: 1440, height: 820 };

const req = createRequire(pathToFileURL(process.env.PLAYWRIGHT_FROM ||
  '/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json'));
const { chromium } = req('playwright');
const b = await chromium.launch();

/* ─── LIVE: справжній драг + прогрів + крива ─── */
async function liveCurve() {
  const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  await p.goto(LIVE, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(4000);
  try { await p.click('button:has-text("ACCEPT")', { timeout: 1500 }); } catch {}
  await p.waitForTimeout(400);
  const g = await p.evaluate(() => {
    const th = document.querySelector('.c-scrollbar_thumb'), tr = document.querySelector('.c-scrollbar');
    const r = th.getBoundingClientRect(), t = tr.getBoundingClientRect();
    return { thx: r.x + r.width / 2, thy: r.y + r.height / 2, tTop: t.y, tH: t.height, thH: r.height };
  });
  const yA = g.tTop + g.thH / 2, yB = g.tTop + (g.tH - g.thH) + g.thH / 2;
  await p.mouse.move(g.thx, g.thy); await p.mouse.down();
  /* прогрів до незмінного тоталу */
  const total = () => p.evaluate(() => Math.round(Math.max(
    (document.querySelector('[data-scroll-container]') || document.body).getBoundingClientRect().height,
    document.body.scrollHeight)));
  const tt = [];
  for (let pass = 0; pass < 6; pass++) {
    for (let k = 0; k <= 20; k++) { await p.mouse.move(g.thx, yA + (yB - yA) * k / 20); await p.waitForTimeout(140); }
    await p.waitForTimeout(1200); tt.push(await total());
    for (let k = 20; k >= 0; k--) { await p.mouse.move(g.thx, yA + (yB - yA) * k / 20); await p.waitForTimeout(60); }
    await p.waitForTimeout(800);
    const L = tt.length; if (L >= 3 && tt[L - 1] === tt[L - 2] && tt[L - 2] === tt[L - 3]) break;
  }
  console.log('live прогрів, тотали:', tt.join('→'));
  const rows = [];
  for (let i = 0; i < N; i++) {
    const fr = FROM + (TO - FROM) * (i / (N - 1));
    await p.mouse.move(g.thx, yA + (yB - yA) * fr);
    /* стабільність контенту */
    await p.evaluate(async () => {
      const y = () => { const s = document.querySelector('[data-scroll-section]'); return s ? s.getBoundingClientRect().top : 0; };
      let prev = y(), calm = 0;
      for (let t = 0; t < 25 && calm < 2; t++) { await new Promise(r => setTimeout(r, 110)); const c = y(); if (Math.abs(c - prev) < 0.5) calm++; else calm = 0; prev = c; }
    });
    const d = await p.evaluate(() => {
      const th = document.querySelector('.c-scrollbar_thumb'), tr = document.querySelector('.c-scrollbar');
      const m = new WebKitCSSMatrix(getComputedStyle(th).transform);
      const frac = +(m.m42 / (tr.offsetHeight - th.offsetHeight)).toFixed(4);
      const sec = [...document.querySelectorAll('[data-scroll-section]')][2]; // info-bottom
      const top = s => { const e = sec.querySelector(s); return e ? Math.round(e.getBoundingClientRect().top) : null; };
      const stickyLayer = sec.querySelector('.sticky__layer--sticky');
      const tf = stickyLayer ? getComputedStyle(stickyLayer).transform : null;
      const m2 = tf && tf !== 'none' ? new WebKitCSSMatrix(tf) : null;
      return { frac, secTop: Math.round(sec.getBoundingClientRect().top),
        img1: top('img[src*="image-1"]'), img2: top('img[src*="image-2"]'),
        map: top('img[src*="map"]'), stickyDy: m2 ? Math.round(m2.m42) : 0 };
    });
    rows.push(d);
  }
  await p.mouse.up();
  await ctx.close();
  return rows;
}

/* ─── OURS: наш info-bottom по тих самих frac (звичайний scroll) ─── */
async function oursCurve() {
  const ctx = await b.newContext({ viewport: VP });
  const p = await ctx.newPage();
  await p.goto(OURS, { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(1200);
  await p.evaluate(async () => { const go = y => window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); const max = () => document.body.scrollHeight - innerHeight; for (let k = 0; k <= 30; k++) { go(Math.round(max() * k / 30)); await new Promise(r => setTimeout(r, 50)); } go(0); await new Promise(r => setTimeout(r, 400)); });
  const rows = [];
  for (let i = 0; i < N; i++) {
    const fr = FROM + (TO - FROM) * (i / (N - 1));
    await p.evaluate(async (fr) => {
      const go = y => window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
      const max = () => document.body.scrollHeight - innerHeight;
      go(Math.round(fr * max())); await new Promise(r => setTimeout(r, 220));
    }, fr);
    const d = await p.evaluate((fr) => {
      const ib = document.querySelector('#a-intro + .act');
      const top = s => { const e = ib.querySelector(s); return e ? Math.round(e.getBoundingClientRect().top) : null; };
      return { frac: fr, secTop: Math.round(ib.getBoundingClientRect().top),
        img1: top('img[src*="image-1"]'), img2: top('img[src*="image-2"]'), map: top('.ib-map, img[src*="map"]') };
    }, fr);
    rows.push(d);
  }
  await ctx.close();
  return rows;
}

const live = await liveCurve();
const ours = OURS ? await oursCurve() : null;
await b.close();

console.log('\n=== LIVE info-bottom motion (viewport-top px по frac) ===');
console.log('frac    secTop  img1  img2   map  stickyDy');
live.forEach(r => console.log(
  `${r.frac.toFixed(4)}  ${String(r.secTop).padStart(6)} ${String(r.img1).padStart(5)} ${String(r.img2).padStart(5)} ${String(r.map).padStart(5)} ${String(r.stickyDy).padStart(6)}`));
if (ours) {
  console.log('\n=== OURS info-bottom motion ===');
  console.log('frac    secTop  img1  img2   map');
  ours.forEach(r => console.log(
    `${r.frac.toFixed(4)}  ${String(r.secTop).padStart(6)} ${String(r.img1).padStart(5)} ${String(r.img2).padStart(5)} ${String(r.map).padStart(5)}`));
}
writeFileSync('library/boards/motion-ib-1440.json', JSON.stringify({ live, ours, from: FROM, to: TO, n: N, at: new Date().toISOString() }, null, 1));
console.log('\nJSON: library/boards/motion-ib-1440.json');
