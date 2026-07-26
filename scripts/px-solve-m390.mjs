/* ============================================================
   px-solve-m390.mjs (с27) — ХОЛІСТИЧНИЙ solver м390 /about.
   ------------------------------------------------------------
   УРОК с27 ([[m390-frac-coupling]]): послідовні trim+footer-компенсація
   б'ються через frac-шкалу. Рішення: виміряти ВСІ live @390 section
   doc-tops РАЗ, порахувати РЕГІОННУ висоту кожної секції, і дати
   таблицю «скільки px додати/зрізати у КОЖНІЙ зоні» щоб УСІ секції
   сіли на свій live-frac ОДНОЧАСНО (ours_limit → live_limit, тоді
   target doc-top[i] = live doc-top[i], а регіон-висота = live-регіон).

   Математика розв'язку frac-coupling:
     ціль: ours_y[i]/ours_limit == live_y[i]/live_limit ∀i
     якщо ours_limit == live_limit → target ours_y[i] == live_y[i]
     → target регіон-висота[i] = live_y[i+1] − live_y[i] (жива)
     → застосувати Δ у КОЖНІЙ зоні = live_регіон − ours_регіон,
       і total сходиться сам (сума регіонів = live_limit).

   Запуск: PLAYWRIGHT_FROM=<pkg> node scripts/px-solve-m390.mjs \
     [--ours http://localhost:8820/combos/about-air/combo-lab.html]
     [--skip-live] [--json library/boards/px-solve-m390.json]
   Вивід: Δpx по КОЖНІЙ зоні (те, що треба виправити) + порядок за |Δ|.
   ============================================================ */
import { readFileSync, writeFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { createRequire } from 'node:module';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const LIVE = arg('live', 'https://aircenter.space/about');
const OURS = arg('ours', 'http://localhost:8820/combos/about-air/combo-lab.html');
const JSON_OUT = arg('json', 'library/boards/px-solve-m390.json');
const SKIP_LIVE = process.argv.includes('--skip-live');
const VP = { width: 390, height: 844 };

/* пари live-id → наш селектор (порядок сторінки). live @390 = контейнерний
   скрол .page-content-wrapper__inner; секції — [data-scroll-section] або [id]. */
const PAIRS = [
  ['revolves', '#revolves'],
  ['headquarters', '#headquarters'],
  ['space', '#space-splash'],
  ['autonomy', '#autonomy'],
  ['service', '#services'],  /* с28: live section id = "service" (singular!), НЕ "services" — інакше live.secs пропускає анкор */
  ['certificate', '#certificate'],
  ['solutions', '#layout-splash'],  /* с27: live "solutions" = наш #layout-splash (splash перед стеком), НЕ #stack-layout */
];

const req = createRequire(pathToFileURL(process.env.PLAYWRIGHT_FROM ||
  '/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json'));
const { chromium } = req('playwright');
const browser = await chromium.launch();

/* ─── LIVE @390 (прогрів контейнера до незмінного scrollHeight) ─── */
let live;
if (SKIP_LIVE) {
  live = JSON.parse(readFileSync(JSON_OUT, 'utf8')).live;
} else {
  const ctx = await browser.newContext({ viewport: VP, deviceScaleFactor: 1,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Version/16.0 Mobile/15E148 Safari/604.1',
    hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  await p.goto(LIVE, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(5000);
  try { await p.click('button:has-text("ACCEPT")', { timeout: 1500 }); } catch {}
  live = await p.evaluate((ids) => {
    const c = document.querySelector('.page-content-wrapper__inner');
    const H = () => c.scrollHeight;
    /* прогрів до незмінного тоталу */
    return (async () => {
      let tt = [];
      for (let pass = 0; pass < 6; pass++) {
        for (let k = 0; k <= 20; k++) { c.scrollTop = Math.round((c.scrollHeight - c.clientHeight) * k / 20); await new Promise(r => setTimeout(r, 60)); }
        tt.push(H()); c.scrollTop = 0; await new Promise(r => setTimeout(r, 300));
        if (tt.length >= 3 && tt.at(-1) === tt.at(-2) && tt.at(-2) === tt.at(-3)) break;
      }
      const limit = c.scrollHeight - c.clientHeight;
      const secs = {};
      document.querySelectorAll('section[id],[id]').forEach(e => {
        if (ids.includes(e.id) && !secs[e.id]) secs[e.id] = Math.round(e.getBoundingClientRect().top + c.scrollTop);
      });
      return { limit, scrollH: c.scrollHeight, tt, secs };
    })();
  }, PAIRS.map(x => x[0]));
  console.log('live @390 прогрів:', live.tt.join('→'), '| limit', live.limit);
  await ctx.close();
}

/* ─── OURS @390 (прогрів window до незмінного docH) ─── */
const octx = await browser.newContext({ viewport: VP, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
const op = await octx.newPage();
await op.goto(OURS, { waitUntil: 'networkidle', timeout: 60000 });
await op.waitForTimeout(1500);
const ours = await op.evaluate((sels) => {
  return (async () => {
    let tt = [];
    for (let pass = 0; pass < 6; pass++) {
      const max = () => document.body.scrollHeight - innerHeight;
      for (let k = 0; k <= 20; k++) { scrollTo(0, Math.round(max() * k / 20)); await new Promise(r => setTimeout(r, 60)); }
      tt.push(document.body.scrollHeight); scrollTo(0, 0); await new Promise(r => setTimeout(r, 300));
      if (tt.length >= 3 && tt.at(-1) === tt.at(-2) && tt.at(-2) === tt.at(-3)) break;
    }
    const docH = document.body.scrollHeight, limit = docH - innerHeight;
    const out = {};
    sels.forEach(sel => { const e = document.querySelector(sel); if (e) out[sel] = Math.round(e.getBoundingClientRect().top + scrollY); });
    return { docH, limit, tt, out };
  })();
}, PAIRS.map(x => x[1]));
console.log('ours @390 прогрів:', ours.tt.join('→'), '| limit', ours.limit, 'docH', ours.docH);
await octx.close();
await browser.close();

/* ─── розв'язок: ціль ours_y[i] == live_y[i] (при ours_limit→live_limit) ─── */
const rows = PAIRS.map(([lid, osel]) => ({
  zone: lid, liveY: live.secs[lid] ?? null, oursY: ours.out[osel] ?? null,
})).filter(r => r.liveY != null && r.oursY != null);

console.log('\n=== doc-top секцій @390 (px), Δ = ours − live ===');
rows.forEach(r => console.log(` ${r.zone.padEnd(14)} live ${String(r.liveY).padStart(6)} · ours ${String(r.oursY).padStart(6)} · Δ ${String(r.oursY - r.liveY).padStart(6)}`));

/* РЕГІОННІ висоти = справжня ціль (frac-coupling-safe): для КОЖНОЇ зони
   різниця живого регіону і нашого = скільки px додати(+)/зрізати(−) У ЦІЙ зоні */
console.log('\n=== РЕГІОН-ВИСОТИ (px між сусідніми секціями) — ЦІЛЬ РЕБАЛАНСУ ===');
console.log('   зона (від→до)         live   ours    Δ(треба у ЦІЙ зоні)');
const deltas = [];
for (let i = 1; i < rows.length; i++) {
  const lh = rows[i].liveY - rows[i - 1].liveY;
  const oh = rows[i].oursY - rows[i - 1].oursY;
  const d = lh - oh; /* + = наш регіон КОРОТШИЙ, треба додати; − = задовгий, зрізати */
  deltas.push({ region: `${rows[i - 1].zone}→${rows[i].zone}`, liveH: lh, oursH: oh, need: d });
  console.log(`   ${(rows[i - 1].zone + '→' + rows[i].zone).padEnd(20)} ${String(lh).padStart(5)} ${String(oh).padStart(6)}   ${d >= 0 ? '+' : ''}${d}`);
}
/* хвіст після останньої секції */
const tailLive = live.limit - rows[rows.length - 1].liveY;
const tailOurs = ours.limit - rows[rows.length - 1].oursY;
console.log(`   ${(rows[rows.length - 1].zone + '→кінець').padEnd(20)} ${String(tailLive).padStart(5)} ${String(tailOurs).padStart(6)}   ${tailLive - tailOurs >= 0 ? '+' : ''}${tailLive - tailOurs}`);
deltas.push({ region: `${rows[rows.length - 1].zone}→кінець`, liveH: tailLive, oursH: tailOurs, need: tailLive - tailOurs });

console.log('\n=== ПОРЯДОК РЕБАЛАНСУ (за |Δ|, найбільший важіль першим) ===');
[...deltas].sort((a, b) => Math.abs(b.need) - Math.abs(a.need)).forEach(d =>
  console.log(`   ${d.region.padEnd(22)} ${d.need >= 0 ? 'ДОДАТИ +' : 'ЗРІЗАТИ '}${Math.abs(d.need)}px  (live ${d.liveH} vs ours ${d.oursH})`));

console.log(`\nтотали @390: live limit ${live.limit} · ours limit ${ours.limit} · Δ ${ours.limit - live.limit} (ours ${ours.limit < live.limit ? 'КОРОТШИЙ' : 'довший'})`);
console.log('☝️ якщо всі регіони підігнати до live → total зійдеться сам = live_limit (frac-coupling вирішено).');

writeFileSync(JSON_OUT, JSON.stringify({ viewport: '390x844', live, ours, rows, deltas, at: new Date().toISOString() }, null, 1));
console.log('JSON:', JSON_OUT);
