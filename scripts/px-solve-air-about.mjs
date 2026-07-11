/* ============================================================
   px-solve-air-about.mjs (с23) — doc-позиції анкорів /about:
   ЖИВИЙ (ПРОГРІТИЙ до незмінного тоталу) vs НАШ, у ПІКСЕЛЯХ
   документа (не фраках — фрак-шкала зсуває все при зміні тоталу).
   Дає: таблицю Δpx по анкорах + регіонні висоти + тотали.
   Це і є px-цілі ребалансу середини/хвоста (мікро-план с23 п.1г).

   Запуск: PLAYWRIGHT_FROM=<pkg> node scripts/px-solve-air-about.mjs \
     [--viewport 1440x820] [--skip-live] \
     [--ours http://localhost:8820/combos/about-air/combo-lab.html] \
     [--json library/boards/px-solve-1440.json]
   --skip-live: live-позиції з попереднього JSON (швидка ітерація).
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
  throw new Error('playwright не знайдено; постав PLAYWRIGHT_FROM');
}
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const [VW, VH] = arg('viewport', '1440x820').split('x').map(Number);
const LIVE = arg('live', 'https://aircenter.space/about');
const OURS = arg('ours', 'http://localhost:8820/combos/about-air/combo-lab.html');
const JSON_OUT = arg('json', `library/boards/px-solve-${VW}.json`);
const SKIP_LIVE = process.argv.includes('--skip-live');

/* пари анкорів live-id → наш селектор (порядок = порядок сторінки).
   live-ids рантаймні (anchors-звірка smoke с23); внутрішні під-анкори
   cert-зони додаються окремо в evaluate. */
const PAIRS = [
  ['next', '#a-intro'],
  ['sec2', '#architecture'],
  ['sec3', '#isw-arch'],
  ['revolves', '#revolves'],
  ['headquarters', '#headquarters'],
  ['space', '#space-splash'],
  ['autonomy', '#autonomy'],
  ['service', '#services'],
  ['certificate', '#certificate'],
  ['solutions', '#layout-splash'],
  /* live sec12 = ВЕСЬ layout-detail (metrics+stack+ata) — стартує з metrics-акту */
  ['sec12', '#layout-splash + section'],
  ['sec13', 'footer'],
];

const chromium = await resolveChromium();
const browser = await chromium.launch();

let live;
if (SKIP_LIVE) {
  live = JSON.parse(readFileSync(JSON_OUT, 'utf8')).live;
} else {
  const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(LIVE, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(4000);
  try { await p.click('button:has-text("ACCEPT")', { timeout: 1500 }); } catch {}
  await p.waitForTimeout(400);
  const g = await p.evaluate(() => {
    const th = document.querySelector('.c-scrollbar_thumb'); const tr = document.querySelector('.c-scrollbar');
    if (!th || !tr) return null;
    const r = th.getBoundingClientRect(); const t = tr.getBoundingClientRect();
    return { thx: r.x + r.width / 2, thy: r.y + r.height / 2, tTop: t.y, tH: t.height, thH: r.height };
  });
  if (!g) { console.error('нема .c-scrollbar_thumb'); process.exit(1); }
  const yA = g.tTop + g.thH / 2, yB = g.tTop + (g.tH - g.thH) + g.thH / 2;
  const total = () => p.evaluate(() => {
    const cont = document.querySelector('[data-scroll-container]') || document.body;
    return Math.round(Math.max(cont.getBoundingClientRect().height, document.body.scrollHeight));
  });
  /* прогрів до НЕЗМІННОГО тоталу (3 однакові заміри) — як у знімалках с23 */
  const totals = [];
  await p.mouse.move(g.thx, g.thy); await p.mouse.down();
  for (let pass = 0; pass < 8; pass++) {
    for (let k = 0; k <= 20; k++) { await p.mouse.move(g.thx, yA + (yB - yA) * k / 20); await p.waitForTimeout(160); }
    await p.waitForTimeout(1500);
    totals.push(await total());
    for (let k = 20; k >= 0; k--) { await p.mouse.move(g.thx, yA + (yB - yA) * k / 20); await p.waitForTimeout(70); }
    await p.waitForTimeout(1000);
    const L = totals.length;
    if (L >= 3 && totals[L - 1] === totals[L - 2] && totals[L - 2] === totals[L - 3]) break;
  }
  await p.mouse.up();
  await p.waitForTimeout(1200);
  console.log('live прогрів, тотали:', totals.join('→'));
  live = await p.evaluate(() => {
    /* позиції на scroll 0: rect.top = doc-Y (Locomotive transform уже 0) */
    const cont = document.querySelector('[data-scroll-container]') || document.body;
    const docH = Math.round(Math.max(cont.getBoundingClientRect().height, document.body.scrollHeight));
    const secs = [...document.querySelectorAll('[data-scroll-section]')].map((s, i) => ({
      i, id: s.id || ('sec' + i), y: Math.round(s.getBoundingClientRect().top),
      h: Math.round(s.getBoundingClientRect().height),
    }));
    return { docH, secs };
  });
  await ctx.close();
}

/* ─── OURS ─── */
const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(OURS, { waitUntil: 'networkidle', timeout: 60000 });
await p.waitForTimeout(1500);
const ours = await p.evaluate((sels) => {
  const docH = document.body.scrollHeight;
  const out = {};
  for (const sel of sels) {
    const el = document.querySelector(sel);
    out[sel] = el ? { y: Math.round(el.getBoundingClientRect().top + window.scrollY),
      h: Math.round(el.getBoundingClientRect().height) } : null;
  }
  return { docH, out };
}, PAIRS.map(x => x[1]).concat(['#stack-layout']));
await ctx.close();
await browser.close();

/* ─── таблиця ─── */
const liveBy = Object.fromEntries(live.secs.map(s => [s.id, s]));
const rows = [];
for (const [lid, osel] of PAIRS) {
  const l = liveBy[lid]; const o = ours.out[osel];
  if (!l || !o) { console.log(`⚠️ нема пари: ${lid} / ${osel}`); continue; }
  rows.push({ anchor: lid, liveY: l.y, oursY: o.y, d: o.y - l.y, liveH: l.h, oursH: o.h });
}
console.log('\n=== doc-Y анкорів (px), Δ = ours − live · праворуч висоти боксів ===');
for (const r of rows) console.log(` ${r.anchor.padEnd(14)} live ${String(r.liveY).padStart(6)} · ours ${String(r.oursY).padStart(6)} · Δ ${String(r.d).padStart(6)}   | h ${String(r.liveH).padStart(5)}/${String(r.oursH).padStart(5)} Δ${r.oursH - r.liveH}`);
console.log('\n=== регіонні висоти (px, між сусідніми анкорами) ===');
for (let i = 1; i < rows.length; i++) {
  const lh = rows[i].liveY - rows[i - 1].liveY, oh = rows[i].oursY - rows[i - 1].oursY;
  console.log(` ${rows[i - 1].anchor}→${rows[i].anchor}: live ${lh} · ours ${oh} · Δ ${oh - lh}`);
}
const lastL = rows[rows.length - 1], tailL = live.docH - lastL.liveY, tailO = ours.docH - lastL.oursY;
console.log(` ${lastL.anchor}→кінець: live ${tailL} · ours ${tailO} · Δ ${tailO - tailL}`);
console.log(`\nтотали: live ${live.docH} vs ours ${ours.docH} (Δ ${ours.docH - live.docH})`);
writeFileSync(JSON_OUT, JSON.stringify({ viewport: `${VW}x${VH}`, live, ours, rows, at: new Date().toISOString() }, null, 1));
console.log('JSON:', JSON_OUT);
