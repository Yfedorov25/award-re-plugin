/* ============================================================
   FAN-EDGE (с27) — кадровий екстрактор КРАЇВ фан-карток revolves.
   ------------------------------------------------------------
   ЧОМУ окремий скрипт (не motion-zone): живий фан = <canvas>
   (WebGL текстури) — DOM getBoundingClientRect НЕ бачить карток.
   Тому міряємо КРАЇ карток прямо в ПІКСЕЛЯХ: картка = яскравий
   прямокутник (небо/скло/бруківка, lum>THR_HI) на чорному фоні
   спіралі (lum<THR_LO). Ours фан = DOM-грід, але міряємо ТЕ САМЕ
   пікселями → live і ours прямо порівнювані.

   Метод (реюз drag+warmup з motion-zone-air): справжній mousedown-
   drag по .c-scrollbar_thumb + прогрів до незмінного тоталу, потім
   на КОЖНОМУ frac фан-зони: screenshot viewport → детект країв:
     • по рядку y0 (центр картки): яскраві горизонтальні пробіги
       → ліва/права межа кожної картки (центр + 2 бічні)
     • по колонці центру картки: верх/низ центр-картки
   Вивід: frac × [центр L R T B · лівий R · правий L] live vs ours
     + JSON library/boards/fan-edge-1440.json
   Наосліп фан НЕ правити (урок hq-чіпа) — спершу цей вимір.

   Запуск: PLAYWRIGHT_FROM=<pkg> node scripts/fan-edge-air.mjs \
     --ours http://localhost:8820/combos/about-air/combo-lab.html \
     [--from 0.255 --to 0.31 --steps 16] [--live https://aircenter.space/about]
   ============================================================ */
import { writeFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { createRequire } from 'node:module';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const LIVE = arg('live', 'https://aircenter.space/about');
const OURS = arg('ours', 'http://localhost:8820/combos/about-air/combo-lab.html');
const FROM = +arg('from', 0.255);   /* фан-вхід: борд #61 .2601 → #66 .2795 (беремо трохи ширше) */
const TO = +arg('to', 0.31);
const N = +arg('steps', 16);
const VP = { width: 1440, height: 820 };
const THR_HI = 90;   /* картка = lum > цього (небо/скло/бруківка) */
const THR_LO = 45;   /* фон/спіраль = lum < цього (чорне + темні стрічки) */

const req = createRequire(pathToFileURL(process.env.PLAYWRIGHT_FROM ||
  '/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json'));
const { chromium } = req('playwright');
const b = await chromium.launch();

/* ── детект країв карток у СКРІНШОТІ (виконується в браузері над <img>) ──
   Ідея: картки — яскраві прямокутники на чорному. Скануємо кілька рядків
   у центральній смузі, для кожного знаходимо ЯСКРАВІ пробіги (run lum>HI,
   довжиною > minRun), кластеризуємо їх у 3 картки (лівий/центр/правий) за
   x-центром. Вертикаль центр-картки — скан колонки її x-центру. */
function detectFromDataUrl(dataUrl, VP, THR_HI, THR_LO) {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => {
      const w = VP.width, h = VP.height;
      const c = new OffscreenCanvas(w, h); const x = c.getContext('2d');
      x.drawImage(im, 0, 0, w, h);
      const d = x.getImageData(0, 0, w, h).data;
      const lum = (i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      /* горизонтальні яскраві пробіги в рядку y */
      const runsAt = (y) => {
        const runs = []; let s = -1;
        for (let X = 0; X < w; X++) {
          const bright = lum((y * w + X) * 4) > THR_HI;
          if (bright && s < 0) s = X;
          else if (!bright && s >= 0) { if (X - s > 40) runs.push([s, X - 1]); s = -1; }
        }
        if (s >= 0 && w - s > 40) runs.push([s, w - 1]);
        return runs;
      };
      /* беремо смугу рядків навколо вертикального центру фану (~y400) і
         збираємо всі яскраві пробіги, потім кластеризуємо по x-центру */
      const ys = [];
      for (let y = 260; y <= 560; y += 10) ys.push(y);
      const segs = [];
      ys.forEach(y => runsAt(y).forEach(r => segs.push({ y, l: r[0], r: r[1], c: (r[0] + r[1]) / 2, wd: r[1] - r[0] })));
      /* кластери по x-центру (картки рознесені) */
      segs.sort((a, b) => a.c - b.c);
      const clusters = [];
      segs.forEach(s => {
        const last = clusters[clusters.length - 1];
        if (last && s.c - last.cAvg < 160) {
          last.items.push(s); last.cAvg = last.items.reduce((a, o) => a + o.c, 0) / last.items.length;
        } else clusters.push({ items: [s], cAvg: s.c });
      });
      /* картка = кластер з достатньою к-стю рядків; беремо медіанні L/R */
      const med = (arr) => { const a = [...arr].sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
      const cards = clusters.filter(cl => cl.items.length >= 6).map(cl => ({
        L: Math.round(med(cl.items.map(o => o.l))),
        R: Math.round(med(cl.items.map(o => o.r))),
        cx: Math.round(cl.cAvg), n: cl.items.length,
        wd: Math.round(med(cl.items.map(o => o.wd)))
      }));
      /* центр-картка = та, чий cx найближче до w/2 */
      let center = null, cd = 1e9;
      cards.forEach(c => { const dd = Math.abs(c.cx - w / 2); if (dd < cd) { cd = dd; center = c; } });
      /* вертикаль центр-картки: скан колонки cx, знайти перший/останній яскравий y */
      let T = null, B = null;
      if (center) {
        const cx = Math.max(0, Math.min(w - 1, center.cx));
        for (let y = 120; y < h - 60; y++) { if (lum((y * w + cx) * 4) > THR_HI) { T = y; break; } }
        for (let y = h - 60; y > 120; y--) { if (lum((y * w + cx) * 4) > THR_HI) { B = y; break; } }
      }
      resolve({ cards, center: center ? { L: center.L, R: center.R, cx: center.cx, T, B, wd: center.wd } : null });
    };
    im.onerror = () => resolve({ err: 'img load' });
    im.src = dataUrl;
  });
}

/* знімає скріншот viewport у сторінці як dataURL і детектить */
async function edgeOf(p) {
  const buf = await p.screenshot({ type: 'png' });
  const dataUrl = 'data:image/png;base64,' + buf.toString('base64');
  return await p.evaluate(({ dataUrl, VP, THR_HI, THR_LO, fn }) => {
    const detect = new Function('return (' + fn + ')')();
    return detect(dataUrl, VP, THR_HI, THR_LO);
  }, { dataUrl, VP, THR_HI, THR_LO, fn: detectFromDataUrl.toString() });
}

/* ─── LIVE: справжній драг + прогрів (механіка motion-zone-air) ─── */
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
    /* стабілізація секції (як motion-zone) */
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
    const e = await edgeOf(p);
    rows.push({ frac, ...e });
    process.stdout.write('.');
  }
  process.stdout.write('\n');
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
  await p.evaluate(async () => {
    const go = y => window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
    const max = () => document.body.scrollHeight - innerHeight;
    for (let k = 0; k <= 30; k++) { go(Math.round(max() * k / 30)); await new Promise(r => setTimeout(r, 50)); } go(0);
    await new Promise(r => setTimeout(r, 400));
  });
  const rows = [];
  for (let i = 0; i < N; i++) {
    const fr = FROM + (TO - FROM) * (i / (N - 1));
    await p.evaluate(async (fr) => {
      const go = y => window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y);
      const max = () => document.body.scrollHeight - innerHeight;
      go(Math.round(fr * max())); await new Promise(r => setTimeout(r, 240));
    }, fr);
    const e = await edgeOf(p);
    rows.push({ frac: fr, ...e });
    process.stdout.write('.');
  }
  process.stdout.write('\n');
  await ctx.close();
  return rows;
}

const live = await liveCurve();
const ours = await oursCurve();
await b.close();

const fcard = (c) => c ? `L${String(c.L).padStart(4)} R${String(c.R).padStart(4)} T${String(c.T).padStart(3)} B${String(c.B).padStart(3)} w${String(c.R - c.L).padStart(4)}` : '        —        ';
const frow = (r) => {
  const cs = (r.cards || []).map(c => `[${c.L}-${c.R}]`).join(' ');
  return `${r.frac.toFixed(4)}  center ${fcard(r.center)}  |  cards ${cs}`;
};
console.log('\n=== LIVE фан-краї (пікс) ===');
live.forEach(r => console.log('  ' + frow(r)));
console.log('\n=== OURS фан-краї (пікс) ===');
ours.forEach(r => console.log('  ' + frow(r)));

/* прямий live−ours дельта по центр-картці (спаровано по індексу frac-кроку) */
console.log('\n=== Δ (ours − live) центр-картки ===');
console.log('  frac     ΔL    ΔR    ΔT    ΔB    Δw');
for (let i = 0; i < N; i++) {
  const l = live[i]?.center, o = ours[i]?.center;
  if (l && o) console.log(`  ${live[i].frac.toFixed(4)}  ${String(o.L - l.L).padStart(4)}  ${String(o.R - l.R).padStart(4)}  ${String((o.T ?? 0) - (l.T ?? 0)).padStart(4)}  ${String((o.B ?? 0) - (l.B ?? 0)).padStart(4)}  ${String((o.R - o.L) - (l.R - l.L)).padStart(4)}`);
  else console.log(`  ${(live[i]?.frac ?? ours[i]?.frac ?? 0).toFixed(4)}  (live ${l ? 'ok' : 'MISS'} / ours ${o ? 'ok' : 'MISS'})`);
}

const out = 'library/boards/fan-edge-1440.json';
writeFileSync(out, JSON.stringify({ live, ours, from: FROM, to: TO, n: N, thr: { hi: THR_HI, lo: THR_LO }, at: new Date().toISOString() }, null, 1));
console.log('\nJSON: ' + out);
