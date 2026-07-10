/* ============================================================
   SCENE-MAP (трек springs, S3) — сцена сторінки ОДНИМ прогоном
   ------------------------------------------------------------
   Чому окремо від animation-map: у S2 з'ясувалось, що снап-позиції
   трьох прогонів НЕ збігаються (hero: 0→1170→2069→2671; intro:
   0→900→2070→2970) — кожен прогін бачить свою підмножину снапів
   і свій одометр, тож міжпрогінне порівняння неоднозначне.
   Scene-map знімає ВСІ корені секцій (SITES[..].sections) ОДНОЧАСНО:
   один прогін → консистентні (input, s, top кожної секції) — з цього
   виводяться: канонічна снап-драбина, документні офсети секцій у
   спокої, per-section криві травелу top(s) (хто їде швидше/повільніше
   за сторінку = власна хореографія виходу).

   Одометр сцени: проба з МАКСИМАЛЬНИМ діапазоном серед секцій-проб
   (пост-фактум, як у animation-map) — на живому це чистий page-flow
   блок (wellness/intro контейнери їдуть строго top = rest - s).

   Запуск:
     PLAYWRIGHT_FROM=... node scripts/scene-map.mjs springs-home \
       [--vp desktop|mobile|both] [--origin URL] [--step 150] [--max 70]
   Вихід: extraction/<site>/scene-map.json
   ============================================================ */
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { resolveChromium, SITES, VIEWPORTS, MOBILE_UA, sectionsForViewport } from './token-extractor.mjs';

const siteName = process.argv[2];
const site = SITES[siteName];
if (!site) { console.error(`вкажи: node scripts/scene-map.mjs <${Object.keys(SITES).join('|')}>`); process.exit(1); }
const argOf = (name, dflt) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : dflt; };
const vpArg = argOf('--vp', 'both');
const origin = argOf('--origin', site.liveOrigin);
const STEP = parseInt(argOf('--step', '150'), 10);
const MAX_GESTURES = parseInt(argOf('--max', '70'), 10);

const chromium = await resolveChromium();
if (!chromium) { console.error('playwright не резолвиться (PLAYWRIGHT_FROM?)'); process.exit(1); }

/* корені всіх секцій (перший ВИДИМИЙ матч селектора) + rest-геометрія */
const SCENE_SETUP_FN = (secs) => {
  const roots = [];
  for (const { id, selector } of secs) {
    const el = [...document.querySelectorAll(selector)].find((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 1 && r.height > 1 && getComputedStyle(e).display !== 'none';
    });
    if (el) roots.push({ id, el, t0: el.getBoundingClientRect().top });
  }
  window.__SCENE__ = roots;
  return roots.map(({ id, el, t0 }) => {
    const r = el.getBoundingClientRect();
    return { id, top0: Math.round(t0 * 10) / 10, h: Math.round(r.height * 10) / 10, cls: (el.className || '').toString().slice(0, 60) };
  });
};
const SCENE_SAMPLE_FN = () => window.__SCENE__.map(({ el }) =>
  Math.round(el.getBoundingClientRect().top * 10) / 10);

async function settle(page, frames, gestureInput, maxMs = 2600) {
  let last = null, stable = 0;
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    await page.waitForTimeout(130);
    const tops = await page.evaluate(SCENE_SAMPLE_FN);
    if (last !== null && tops.every((y, i) => Math.abs(y - last[i]) < 0.5)) {
      stable++; if (stable >= 3) return { tops, settled: true };
    } else {
      stable = 0;
      if (last !== null) frames.push({ input: gestureInput, t: true, tops });
    }
    last = tops;
  }
  return { tops: last, settled: false };
}

async function runViewport(browser, vpName) {
  const vp = VIEWPORTS[vpName];
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1,
    userAgent: vp.mobile ? MOBILE_UA : undefined,
    hasTouch: vp.mobile, isMobile: vp.mobile,
  });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await page.goto(origin + site.livePath, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  for (const sel of ['.js-cookie-consent-accept', 'button:has-text("ACCEPT")']) {
    try { await page.click(sel, { timeout: 1200 }); break; } catch {}
  }
  await page.waitForTimeout(600);

  const secs = sectionsForViewport(site, vpName).filter((s) => !s.preCss); /* модалки не в потоці */
  const roots = await page.evaluate(SCENE_SETUP_FN, secs);
  console.log(`  коренів: ${roots.length}/${secs.length} · ${roots.map((r) => r.id).join(',')}`);

  const frames = [{ input: 0, tops: await page.evaluate(SCENE_SAMPLE_FN) }];
  const gestureSourceType = vp.mobile ? 'touch' : 'mouse';
  let gestureInput = 0, dist = STEP, settledCount = 0, stallStreak = 0;
  /* одометр на льоту: max зсув по всіх пробах */
  const odoOf = (f) => Math.max(...f.tops.map((t, i) => frames[0].tops[i] - t));
  for (let g = 0; g < MAX_GESTURES; g++) {
    await cdp.send('Input.synthesizeScrollGesture', {
      x: Math.round(vp.width / 2), y: Math.round(vp.height / 2),
      yDistance: -dist, speed: 1200, gestureSourceType,
    });
    gestureInput += dist;
    const st = await settle(page, frames, gestureInput);
    if (st.settled) settledCount++;
    const before = frames.length ? odoOf(frames[frames.length - 1]) : 0;
    frames.push({ input: gestureInput, tops: await page.evaluate(SCENE_SAMPLE_FN) });
    const moved = odoOf(frames[frames.length - 1]) - before;
    /* стоїмо (інтро-гейт або wellness-плато): подвоюємо до 600, після
       6 марних поспіль на планці — далі немає сенсу молотити */
    if (Math.abs(moved) < 2) { dist = Math.min(dist * 2, 600); stallStreak++; }
    else { dist = STEP; stallStreak = 0; }
    if (stallStreak >= 8) { console.log(`  зупинка: одометр стоїть 8 жестів поспіль (плато @${Math.round(before)})`); break; }
  }
  await ctx.close();

  /* одометр = проба з max діапазоном; снап-драбина = унікальні осілі s */
  let odoIdx = 0, best = -1;
  roots.forEach((_, i) => {
    const vals = frames.map((f) => f.tops[i]);
    const range = Math.max(...vals) - Math.min(...vals);
    if (range > best) { best = range; odoIdx = i; }
  });
  for (const f of frames) f.s = Math.round((frames[0].tops[odoIdx] - f.tops[odoIdx]) * 10) / 10;
  const settledS = [...new Set(frames.filter((f) => !f.t).map((f) => Math.round(f.s)))];
  /* кластеризація драбини (±12px) */
  const ladder = [];
  for (const s of settledS.sort((a, b) => a - b)) {
    if (!ladder.length || s - ladder[ladder.length - 1] > 12) ladder.push(s);
  }
  const sections = roots.map((r, i) => ({
    ...r,
    /* криві top(s): всі кадри */
    samples: frames.map((f) => ({ input: f.input, s: f.s, t: f.t || undefined, top: f.tops[i] })),
  }));
  const selfCheck = {
    odometer: roots[odoIdx].id,
    gestures: gestureInput / STEP, settled: settledCount,
    advancedPx: Math.round(frames[frames.length - 1].s),
    ladder,
    fail: [
      roots.length < secs.length * 0.8 ? `знайдено лише ${roots.length}/${secs.length} коренів` : null,
      frames[frames.length - 1].s < vp.height ? 'одометр не просунувся і на вʼюпорт' : null,
    ].filter(Boolean),
  };
  console.log(`  одометр=${selfCheck.odometer} · просунулось ${selfCheck.advancedPx}px · драбина: ${ladder.join(' → ')}`);
  return { viewport: vpName, sections, ladder, selfCheck };
}

const browser = await chromium.launch();
const result = {
  at: new Date().toISOString(), site: siteName, origin,
  method: 'один прогін, всі корені секцій одночасно: CDP-жести → (input, s, top кожної секції); одометр = max-range проба',
  viewports: {},
};
let failed = false;
for (const vpName of (vpArg === 'both' ? Object.keys(VIEWPORTS) : [vpArg])) {
  console.log(`scene-map → ${vpName} (крок ${STEP}px, max ${MAX_GESTURES} жестів)…`);
  const r = await runViewport(browser, vpName);
  if (r.selfCheck.fail.length) { console.error(`  САМОПЕРЕВІРКА: ${r.selfCheck.fail.join(' · ')}`); failed = true; }
  result.viewports[vpName] = r;
}
await browser.close();
mkdirSync(site.outDir, { recursive: true });
const out = join(site.outDir, 'scene-map.json');
/* merge: прогін одного вʼюпорта НЕ стирає інший */
if (existsSync(out)) {
  try {
    const prev = JSON.parse(readFileSync(out, 'utf8'));
    for (const [vpN, vpR] of Object.entries(prev.viewports || {})) {
      if (!result.viewports[vpN]) result.viewports[vpN] = vpR;
    }
  } catch {}
}
writeFileSync(out, JSON.stringify(result));
console.log(`${failed ? 'НАПІВ-' : ''}OK → ${out} (${(JSON.stringify(result).length / 1024).toFixed(0)} KB)`);
process.exit(failed ? 1 : 0);
