/* ============================================================
   DOM-DELTA (сесія 19) — рівень 1 авто-parity: СТРУКТУРНЕ порівняння
   ------------------------------------------------------------
   Замість «десь 90% пікселів різні» → таблиця по КОЖНОМУ зматченому
   елементу: Δx Δy Δw Δh Δfont-size + asset-mismatch. Матчинг
   живе↔наше за нормалізованим текстом (перші 40 символів) або
   basename асета.

   Рівень 0 всередині: перед виміром ЗАМОРОЖУЄМО анімації
   (CSS-ін'єкція animation/transition:none + форс кінцевого стану
   reveal) — міряємо ЛИШЕ верстку, без фазового шуму.

   Запуск: PLAYWRIGHT_FROM=<pkg> node scripts/dom-delta.mjs \
     --live https://aircenter.space/about \
     --ours http://localhost:8820/combos/about-air/combo-lab.html \
     --viewport 390x844 [--positions 25] [--json out.json] [--min 8]
   Desktop live на Locomotive: скрол контейнера недоступний scrollTo —
   інструмент підтримує лише mobile-live (контейнерний скрол) АБО
   ours-only проти збереженого live-інвентаря (--live-json).
   Вихід: таблиця найбільших дельт (|Δ| ≥ --min px) згрупована по зонах.
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
const LIVE = arg('live'); const OURS = arg('ours');
const LIVE_JSON = arg('live-json');
const [VW, VH] = arg('viewport', '390x844').split('x').map(Number);
const POS = +(arg('positions', 25));
const MIN = +(arg('min', 8));
const JSON_OUT = arg('json');
if (!OURS || (!LIVE && !LIVE_JSON)) { console.error('потрібно --ours і (--live | --live-json)'); process.exit(1); }

const FREEZE_CSS = `*,*::before,*::after{animation:none!important;transition:none!important;}
[data-reveal] *,.reveal-text,.reveal-text *{opacity:1!important;filter:none!important;transform:none!important;}`;

/* інвентар видимих елементів на позиції скролу */
const INVENTORY = `(() => {
  const cont = document.querySelector('.page-content-wrapper__inner');
  const sy = cont ? cont.scrollTop : scrollY;
  const out = [];
  const walk = (el) => {
    for (const ch of el.children) {
      const r = ch.getBoundingClientRect();
      if (r.width < 8 || r.height < 8 || r.bottom < -200 || r.top > innerHeight + 200) { continue; }
      const cs = getComputedStyle(ch);
      if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      let key = null, kind = null;
      if (ch.tagName === 'IMG') {
        key = 'img:' + decodeURIComponent((ch.currentSrc || ch.src).split('/').pop().split('?')[0]);
        kind = 'img';
      } else {
        /* текстовий вузол-лист: має власний текст і ≤2 блокових дітей */
        const ownText = [...ch.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' ').replace(/\\s+/g, ' ').trim();
        const t = (ownText.length > 3 ? ownText : (ch.childElementCount <= 30 && /H\\d|P|A|BUTTON|SPAN/.test(ch.tagName) ? ch.textContent : ''))
          .replace(/\\s+/g, ' ').trim();
        if (t.length > 3) { key = 'txt:' + t.slice(0, 40).toUpperCase(); kind = 'txt'; }
      }
      if (key) out.push({ key, kind, x: Math.round(r.left), y: Math.round(r.top + sy),
        vy: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height),
        fs: parseFloat(cs.fontSize) || 0 });
      if (ch.childElementCount) walk(ch);
    }
  };
  walk(document.body);
  return out;
})()`;

async function harvest(url, isLive) {
  const ctx = await b.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1,
    userAgent: isLive && VW < 700 ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Version/16.0 Mobile/15E148 Safari/604.1' : undefined,
    hasTouch: VW < 700, isMobile: VW < 700 });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(isLive ? 6000 : 2500);
  try { await p.click('button:has-text("ACCEPT")', { timeout: 1200 }); } catch {}
  await p.addStyleTag({ content: FREEZE_CSS });
  /* WAAPI: докрутити всі анімації в кінець */
  await p.evaluate(() => { try { document.getAnimations().forEach(a => { try { a.finish(); } catch { a.cancel(); } }); } catch {} });
  const seen = new Map();  /* key → перший запис (найраніший по y) */
  for (let i = 0; i < POS; i++) {
    const f = i / (POS - 1);
    await p.evaluate((fr) => {
      const c = document.querySelector('.page-content-wrapper__inner');
      if (c) c.scrollTop = Math.round(fr * (c.scrollHeight - c.clientHeight));
      else scrollTo(0, Math.round(fr * (document.body.scrollHeight - innerHeight)));
    }, f);
    await p.waitForTimeout(isLive ? 260 : 130);
    const inv = await p.evaluate(INVENTORY);
    for (const e of inv) if (!seen.has(e.key)) seen.set(e.key, { ...e, f: +f.toFixed(3) });
    process.stdout.write('.');
  }
  process.stdout.write('\n');
  const limit = await p.evaluate(() => {
    const c = document.querySelector('.page-content-wrapper__inner');
    return c ? c.scrollHeight - c.clientHeight : document.body.scrollHeight - innerHeight;
  });
  await ctx.close();
  return { limit, els: [...seen.values()] };
}

const b = await chromium.launch();
let liveInv;
if (LIVE_JSON) liveInv = JSON.parse(readFileSync(LIVE_JSON, 'utf8'));
else { console.log('інвентар LIVE…'); liveInv = await harvest(LIVE, true); }
console.log('інвентар OURS…');
const oursInv = await harvest(OURS, false);
await b.close();

/* матчинг за key */
const oursMap = new Map(oursInv.els.map(e => [e.key, e]));
const rows = [];
for (const le of liveInv.els) {
  const oe = oursMap.get(le.key);
  if (!oe) { rows.push({ key: le.key, miss: 'ours' , live: le }); continue; }
  rows.push({ key: le.key, live: le, ours: oe,
    dx: oe.x - le.x, dy: oe.y - le.y, dw: oe.w - le.w, dh: oe.h - le.h,
    dfs: +(oe.fs - le.fs).toFixed(1),
    /* Δ докум. позиції у частках нуль-сумно порівнювати не можна (різні limit) —
       тому Δy тут = у ЧАСТКАХ прогресу переведене в px нашого limit */
    dyf: Math.round((oe.y / oursInv.limit - le.y / liveInv.limit) * oursInv.limit) });
}
const liveKeys = new Set(liveInv.els.map(e => e.key));
for (const oe of oursInv.els) if (!liveKeys.has(oe.key)) rows.push({ key: oe.key, miss: 'live', ours: oe });

const matched = rows.filter(r => !r.miss);
const flag = matched.filter(r => Math.abs(r.dx) >= MIN || Math.abs(r.dw) >= MIN ||
  Math.abs(r.dh) >= MIN || Math.abs(r.dfs) >= 1 || Math.abs(r.dyf) >= MIN * 6)
  .sort((a, b) => (a.live.y / liveInv.limit) - (b.live.y / liveInv.limit));

console.log(`\nзматчено ${matched.length} · лише-live ${rows.filter(r=>r.miss==='ours').length} · лише-ours ${rows.filter(r=>r.miss==='live').length} · дельти ≥порога: ${flag.length}`);
console.log('\nfrac  key'.padEnd(52), 'Δx'.padStart(6), 'Δw'.padStart(6), 'Δh'.padStart(6), 'Δfs'.padStart(6), 'Δy-фазн(px)'.padStart(12));
for (const r of flag) {
  console.log((r.live.f + ' ' + r.key.slice(0, 46)).padEnd(52),
    String(r.dx).padStart(6), String(r.dw).padStart(6), String(r.dh).padStart(6),
    String(r.dfs).padStart(6), String(r.dyf).padStart(12));
}
const missOurs = rows.filter(r => r.miss === 'ours' && r.live.kind === 'txt').slice(0, 20);
if (missOurs.length) {
  console.log('\nЖИВІ елементи БЕЗ пари в нас (перші 20):');
  for (const r of missOurs) console.log(' ', r.live.f, r.key.slice(0, 70));
}
if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify({ at: new Date().toISOString(),
  viewport: `${VW}x${VH}`, liveLimit: liveInv.limit, oursLimit: oursInv.limit,
  matched, missOurs: rows.filter(r => r.miss === 'ours'), missLive: rows.filter(r => r.miss === 'live') }, null, 1));
console.log('\nlimits: live', liveInv.limit, '· ours', oursInv.limit);
