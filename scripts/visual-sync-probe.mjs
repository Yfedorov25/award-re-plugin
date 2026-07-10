/* ============================================================
   VISUAL-SYNC PROBE (сесія 19) — чесна звірка скрол-синхрону
   ------------------------------------------------------------
   МЕТОД (уроки сесії 18, кристалізовано в одну команду):
   • box-top sweep БРЕШЕ на секціях з fade-seam наїздом →
     правда = elementFromPoint(центр екрана) на кожному кроці:
     яка секція ВІЗУАЛЬНО домінує в центрі в'юпорта.
   • Частки НУЛЬ-СУМНІ: міряємо РЕГІОННІ бюджети у % між
     сусідніми анкорами, не абсолютні px (зріз середини
     піднімає всі пізні fracs).
   • Фазові зсуви «+1 слайд» = зсув СТАРТУ (висота ПЕРЕД
     фазою), не швидкості.

   Живі анкори беруться з meta.json scrub-борда (scroll-scrub-
   capture / scroll-scrub-mobile пишуть їх автоматично) АБО
   пере-пробиваються живцем (--live, лише mobile: контейнерний
   скрол .page-content-wrapper__inner + touch UA; desktop-live
   потребує Locomotive-drag — беріть meta.json).

   Запуск (mobile @390):
     PLAYWRIGHT_FROM=<pkg> node scripts/visual-sync-probe.mjs \
       --ours http://localhost:8820/combos/about-air/combo-lab.html \
       --anchors library/boards/about-scrub-m390/meta.json \
       --viewport 390x844 --step 0.005 \
       --map "space:space-splash,service:services,solutions:layout-splash"
   Desktop: --viewport 1440x900 --anchors <desktop meta.json>.
   Вихід: таблиця анкорів + регіонних бюджетів (live% vs ours% Δpp)
   і JSON-звіт (--json <path>).
   ============================================================ */
import { readFileSync, writeFileSync } from 'fs';
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
const OURS = arg('ours');
const ANCHORS_FILE = arg('anchors');
const LIVE = arg('live');
const [VW, VH] = arg('viewport', '390x844').split('x').map(Number);
const STEP = +(arg('step', 0.005));
const JSON_OUT = arg('json');
/* map: liveId:oursId через кому; неперелічені id мапляться сам-на-себе */
const MAP = Object.fromEntries((arg('map', '') || '').split(',').filter(Boolean)
  .map(pair => pair.split(':').map(s => s.trim())));
if (!OURS || (!ANCHORS_FILE && !LIVE)) {
  console.error('потрібно: --ours URL і (--anchors meta.json АБО --live URL)'); process.exit(1);
}

const b = await chromium.launch();

/* ── проба однієї сторінки: visual-start frac кожної section[id] ──
   scroller: 'window' (наше) | 'container' (живий mobile) */
async function probe(page, scroller) {
  const starts = {}; const timeline = [];
  const steps = Math.round(1 / STEP) + 1;
  for (let i = 0; i < steps; i++) {
    const f = Math.min(1, i * STEP);
    const id = await page.evaluate(({ fr, scroller }) => {
      if (scroller === 'container') {
        const c = document.querySelector('.page-content-wrapper__inner');
        c.scrollTop = Math.round(fr * (c.scrollHeight - c.clientHeight));
      } else {
        scrollTo(0, Math.round(fr * (document.body.scrollHeight - innerHeight)));
      }
      return null;
    }, { fr: f, scroller });
    await page.waitForTimeout(scroller === 'container' ? 200 : 90);
    const hit = await page.evaluate(() => {
      /* elementsFromPoint: перший елемент у стеку, що належить section[id] /
         [data-scroll-section] — ВІЗУАЛЬНО домінуюча секція в центрі екрана.
         + контент-сигнатура: ЩО саме в центрі (текст або ім'я асета) —
         таймлайн сигнатур обох сторін показує внутрішньо-секційні фази. */
      const els = document.elementsFromPoint(innerWidth / 2, innerHeight / 2);
      let secId = null, sig = '';
      for (const el of els) {
        const s = el.closest('section[id], [data-scroll-section][id]');
        if (s && s.id) { secId = s.id; break; }
      }
      for (const el of els) {
        if (el.tagName === 'IMG') { sig = 'img:' + (el.currentSrc || el.src).split('/').pop().split('?')[0]; break; }
        const t = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (t && t.length > 2 && el.childElementCount < 40 && el.offsetHeight < innerHeight * 1.5) {
          sig = 'txt:' + t.slice(0, 46).toUpperCase(); break; }
        const bg = getComputedStyle(el).backgroundImage;
        if (bg && bg !== 'none') { sig = 'bg:' + bg.split('/').pop().split('?')[0].slice(0, 40); break; }
      }
      return { secId, sig };
    });
    if (hit.secId && !(hit.secId in starts)) starts[hit.secId] = +f.toFixed(4);
    timeline.push({ f: +f.toFixed(4), sec: hit.secId, sig: hit.sig });
    if (i % 40 === 0) process.stdout.write('.');
  }
  process.stdout.write('\n');
  return { starts, timeline };
}

/* ── LIVE-анкори: з meta.json або пере-проба живцем ── */
let liveAnchors; let liveSource; let liveTimeline = null;
if (LIVE) {
  const ctx = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Version/16.0 Mobile/15E148 Safari/604.1',
    hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  await p.goto(LIVE, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(5000);
  try { await p.click('button:has-text("ACCEPT")', { timeout: 1500 }); } catch {}
  console.log('пробиваю LIVE elementFromPoint…');
  const lp = await probe(p, 'container');
  liveTimeline = lp.timeline;
  liveAnchors = Object.entries(lp.starts).map(([id, frac]) => ({ id, frac }));
  liveSource = 'live-probe:' + LIVE;
  await ctx.close();
} else {
  const meta = JSON.parse(readFileSync(ANCHORS_FILE, 'utf8'));
  liveAnchors = meta.anchors.filter(a => !a.id.startsWith('sec') && a.id !== 'next');
  liveSource = 'meta:' + ANCHORS_FILE;
}

/* ── OURS: нативний скрол + elementFromPoint ── */
const ctx = await b.newContext({ viewport: { width: VW, height: VH },
  deviceScaleFactor: 1, reducedMotion: 'reduce' });
const p = await ctx.newPage();
await p.goto(OURS, { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(2500);
const oursLimit = await p.evaluate(() => document.body.scrollHeight - innerHeight);
console.log('пробиваю OURS elementFromPoint… (limit', oursLimit + 'px)');
const op = await probe(p, 'window');
const oursStarts = op.starts, oursTimeline = op.timeline;
await ctx.close(); await b.close();

/* ── звіт: анкори + регіонні бюджети (нуль-сумна математика) ── */
const rows = liveAnchors
  .map(a => ({ id: a.id, ourId: MAP[a.id] || a.id, live: a.frac,
    ours: oursStarts[MAP[a.id] || a.id] ?? null }))
  .filter(r => r.ours !== null)
  .sort((x, y) => x.live - y.live);

console.log('\n=== АНКОРИ (visual start, frac) ===');
console.log('id'.padEnd(16), 'live'.padStart(7), 'ours'.padStart(7), 'Δpp'.padStart(7));
for (const r of rows) {
  console.log(r.id.padEnd(16), r.live.toFixed(4).padStart(7), r.ours.toFixed(4).padStart(7),
    ((r.ours - r.live) * 100).toFixed(1).padStart(7));
}

const regions = [];
const pts = [{ id: '(top)', live: 0, ours: 0 }, ...rows, { id: '(end)', live: 1, ours: 1 }];
for (let i = 0; i < pts.length - 1; i++) {
  const a = pts[i], z = pts[i + 1];
  regions.push({ region: `${a.id}→${z.id}`,
    live: +((z.live - a.live) * 100).toFixed(2),
    ours: +((z.ours - a.ours) * 100).toFixed(2) });
}
console.log('\n=== РЕГІОННІ БЮДЖЕТИ (% від повного скролу; нуль-сумні!) ===');
console.log('регіон'.padEnd(30), 'live%'.padStart(7), 'ours%'.padStart(7), 'Δpp'.padStart(7), '≈px ours'.padStart(9));
for (const g of regions) {
  const d = g.ours - g.live;
  console.log(g.region.padEnd(30), g.live.toFixed(2).padStart(7), g.ours.toFixed(2).padStart(7),
    d.toFixed(2).padStart(7), Math.round(d / 100 * oursLimit).toString().padStart(9));
}
const worst = regions.reduce((m, g) => Math.max(m, Math.abs(g.ours - g.live)), 0);
const sumAbs = regions.reduce((s, g) => s + Math.abs(g.ours - g.live), 0);
console.log(`\nmax |Δ| регіону: ${worst.toFixed(2)}pp · сумарний |Δ|: ${sumAbs.toFixed(2)}pp` +
  ` · поріг закону: ≤2pp на регіон`);

if (liveTimeline) {
  console.log('\n=== КОНТЕНТ-ТАЙМЛАЙН (що в центрі екрана на тій самій частці) ===');
  console.log('frac'.padEnd(7), 'LIVE'.padEnd(52), 'OURS');
  for (let k = 0; k < Math.min(liveTimeline.length, oursTimeline.length); k++) {
    const L = liveTimeline[k], O = oursTimeline[k];
    const mark = (L.sig && O.sig && L.sig.slice(0, 18) === O.sig.slice(0, 18)) ? ' ' : '≠';
    console.log(mark + String(L.f).padEnd(6), String(L.sig || L.sec || '').slice(0, 50).padEnd(52),
      String(O.sig || O.sec || '').slice(0, 50));
  }
}

if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ ours: OURS, liveSource,
  liveTimeline, oursTimeline,
  viewport: `${VW}x${VH}`, step: STEP, oursLimit, anchors: rows, regions,
  worst: +worst.toFixed(2), sumAbs: +sumAbs.toFixed(2), at: new Date().toISOString() }, null, 1));
