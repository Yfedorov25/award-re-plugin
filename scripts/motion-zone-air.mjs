/* ============================================================
   MOTION-ZONE (с26) — узагальнення motion-ib-air.mjs на БУДЬ-ЯКУ зону
   /about: справжній mousedown-drag по .c-scrollbar_thumb (Locomotive
   реагує ЛИШЕ на реальний драг) + прогрів до незмінного тоталу →
   viewport-top + transform-dY названих елементів зони по frac →
   жива motion-крива (пін = top завмирає; parallax = top дрейфує повільно).

   Зони (пресети селекторів): hq · autonomy · space · next-photos
   Запуск: PLAYWRIGHT_FROM=<pkg> node scripts/motion-zone-air.mjs --zone hq \
     [--from 0.30 --to 0.45 --steps 24] \
     [--ours http://localhost:8820/combos/about-air/combo-lab.html]
   Вивід: таблиця frac × top/dY live (і ours) + JSON
     library/boards/motion-<zone>-1440.json
   ============================================================ */
import { writeFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { createRequire } from 'node:module';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const ZONE = arg('zone', 'hq');
const LIVE = arg('live', 'https://aircenter.space/about');
const OURS = arg('ours', null);
const VP = { width: 1440, height: 820 };

/* Пресет: sec = корінь зони; track = ім'я → селектор ВІД sec.
   Для кожного трека знімаємо viewport-top, transform-dY (WebKitCSSMatrix m42)
   і height (щоб бачити реальний розмір фото). */
const ZONES = {
  hq: {
    from: 0.30, to: 0.45, steps: 24,
    live: {
      sec: '.image-slider-sticky--headquarters',
      track: { layer: '.sticky__layer--sticky', bg: '.about-headquarters-bg', img: '.about-headquarters-bg img' }
    },
    ours: {
      sec: '#isw-hq',
      track: { layer: '[data-isw-layer]', slide1: '[data-isw-slide]', img: '[data-isw-slide] img' }
    }
  },
  autonomy: {
    /* пік diff #154-155 → frac .637-.642; live пін плану f .626→.662 (с21) —
       беремо .58-.70 щоб бачити вхід у пін і реліз */
    from: 0.58, to: 0.70, steps: 24,
    live: {
      sec: '#autonomy',
      track: { layer: '.sticky__layer--sticky', plan: 'img[src*="map@"], img[src*="map%40"]', title: 'img[src*="map-title"]' }
    },
    ours: {
      sec: '#autonomy',
      track: { layer: '.aplan', plan: '.aplan-map', title: '.aplan-title img' }
    }
  },
  space: {
    from: 0.40, to: 0.58, steps: 28,
    live: {
      sec: '.about-space',
      track: { layer: '.sticky__layer--sticky', bg: 'img[src*="7.space"]' }
    },
    ours: {
      sec: '#space-splash',
      track: { bg: 'img[src*="7.space"]' }
    }
  }
};
const Z = ZONES[ZONE];
if (!Z) { console.error('невідома зона', ZONE, '— є:', Object.keys(ZONES).join(' ')); process.exit(1); }
const FROM = +arg('from', Z.from), TO = +arg('to', Z.to), N = +arg('steps', Z.steps);

const req = createRequire(pathToFileURL(process.env.PLAYWRIGHT_FROM ||
  '/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json'));
const { chromium } = req('playwright');
const b = await chromium.launch();

/* знімок одного кроку: top+dY+h кожного трека (виконується в сторінці) */
const snap = (cfg) => `(() => {
  const sec = document.querySelector(${JSON.stringify(cfg.sec)});
  if (!sec) return { err: 'no sec' };
  const out = { secTop: Math.round(sec.getBoundingClientRect().top) };
  const tr = ${JSON.stringify(cfg.track)};
  for (const [name, sel] of Object.entries(tr)) {
    const e = sec.querySelector(sel);
    if (!e) { out[name] = null; continue; }
    const r = e.getBoundingClientRect();
    const tf = getComputedStyle(e).transform;
    const m = tf && tf !== 'none' ? new WebKitCSSMatrix(tf) : null;
    out[name] = { top: Math.round(r.top), dy: m ? Math.round(m.m42) : 0, h: Math.round(r.height) };
  }
  return out;
})()`;

/* ─── LIVE: справжній драг + прогрів + крива (механіка = motion-ib-air) ─── */
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
    await p.evaluate(async () => {
      const y = () => { const s = document.querySelector('[data-scroll-section]'); return s ? s.getBoundingClientRect().top : 0; };
      let prev = y(), calm = 0;
      for (let t = 0; t < 25 && calm < 2; t++) { await new Promise(r => setTimeout(r, 110)); const c = y(); if (Math.abs(c - prev) < 0.5) calm++; else calm = 0; prev = c; }
    });
    const frac = await p.evaluate(() => {
      const th = document.querySelector('.c-scrollbar_thumb'), tr = document.querySelector('.c-scrollbar');
      const m = new WebKitCSSMatrix(getComputedStyle(th).transform);
      return +(m.m42 / (tr.offsetHeight - th.offsetHeight)).toFixed(4);
    });
    const d = await p.evaluate(snap(Z.live));
    rows.push({ frac, ...d });
  }
  await p.mouse.up();
  await ctx.close();
  return rows;
}

/* ─── OURS: наша крива по тих самих frac (Lenis immediate) ─── */
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
    const d = await p.evaluate(snap(Z.ours));
    rows.push({ frac: fr, ...d });
  }
  await ctx.close();
  return rows;
}

const fmt = (rows, names) => {
  console.log('frac    secTop  ' + names.map(n => `${n}.top ${n}.dy ${n}.h`).join('  '));
  rows.forEach(r => console.log(
    `${r.frac.toFixed(4)}  ${String(r.secTop).padStart(6)}  ` +
    names.map(n => r[n] ? `${String(r[n].top).padStart(6)} ${String(r[n].dy).padStart(5)} ${String(r[n].h).padStart(5)}` : '     —     —     —').join('  ')));
};

const live = await liveCurve();
const ours = OURS ? await oursCurve() : null;
await b.close();

console.log(`\n=== LIVE ${ZONE} motion (viewport-top px по frac) ===`);
fmt(live, Object.keys(Z.live.track));
if (ours) {
  console.log(`\n=== OURS ${ZONE} motion ===`);
  fmt(ours, Object.keys(Z.ours.track));
}
const out = `library/boards/motion-${ZONE}-1440.json`;
writeFileSync(out, JSON.stringify({ zone: ZONE, live, ours, from: FROM, to: TO, n: N, at: new Date().toISOString() }, null, 1));
console.log('\nJSON: ' + out);
