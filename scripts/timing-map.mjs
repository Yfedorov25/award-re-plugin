/* ============================================================
   TIMING-MAP EXTRACTOR (трек springs, S8b) — ЧАСОВІ переходи живого
   ------------------------------------------------------------
   Проблема (розкопки S8): вайпи wellness-слайдера — часові переходи
   ПРИ СТОЯЧОМУ одометрі (тригер = прихід на снап / крок слайдера),
   а page-rAF рекордер animation-map пише кадр ЛИШЕ коли одометр
   зрушив ≥0.5px — тому в s-картах перехід невидимий (3 випадкові
   кадри з 422), фінальний open-стан слайда не знятий, наш рендер
   тримає запечений closed-clip (слайд-фото зникає, s3760 38%).

   Метод: той самий CDP-жестовий драйвер, але рекордер пише кадр,
   коли БУДЬ-ЩО змінилось (проп цілі АБО одометр), зі штампом
   performance.now(). Драйвер ріже потік на БЛОКИ по жестах:
   блок = {номер жесту, input, осілий s, кадри з dt від першої
   зміни}. На плато снапу кожен жест = крок слайдера — блоки
   з тим самим s-бакетом нумеруються step 0,1,2…

   Вихід: extraction/<site>/timing-map-<sectionId>.json (merge вʼюпортів).

   Запуск:
     PLAYWRIGHT_FROM=... node scripts/timing-map.mjs springs-home wellness \
       [--vp desktop|mobile|both] [--gestures 40] [--range 6.5] [--origin URL]
   ============================================================ */
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { resolveChromium, SITES, VIEWPORTS, MOBILE_UA, sectionsForViewport } from './token-extractor.mjs';

const siteName = process.argv[2];
const sectionId = process.argv[3];
const site = SITES[siteName];
const sectionCfg = site?.sections.find((s) => s.id === sectionId);
if (!site || !sectionCfg) {
  console.error(`вкажи: node scripts/timing-map.mjs <${Object.keys(SITES).join('|')}> <sectionId> [--vp ...] [--gestures N] [--range H]`);
  process.exit(1);
}
const argOf = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const vpArg = argOf('--vp', 'desktop');
const origin = argOf('--origin', site.liveOrigin);
const MAX_GESTURES = parseInt(argOf('--gestures', '40'), 10);
const RANGE_VH = parseFloat(argOf('--range', '6.5'));

const chromium = await resolveChromium();
if (!chromium) { console.error('playwright не резолвиться (PLAYWRIGHT_FROM?)'); process.exit(1); }

/* цілі: ті ж квоти, що animation-map (S8), + слайдер-специфічні
   запити ПОПЕРЕДУ (слайди picture/img + підписи) */
const SETUP_FN = (args) => {
  const { selector, extraProbeSelectors } = args;
  const sec = [...document.querySelectorAll(selector)].find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1 && getComputedStyle(el).display !== 'none';
  });
  if (!sec) return { error: `section not found: ${selector}` };
  const set = new Set([sec]);
  for (const el of sec.querySelectorAll('*')) {
    if (set.size >= 32) break;
    const cs = getComputedStyle(el);
    if (cs.transform !== 'none' || (cs.clipPath && cs.clipPath !== 'none')) set.add(el);
  }
  for (const [q, quota] of [
    ['[class*="slider"] img', 10], ['[class*="slider"] picture', 8],
    ['[class*="slider"] [class*="caption"]', 6], ['[class*="slide"]', 10],
    ['[data-parallax]', 8], ['[data-reveal]', 10],
    ['[class*="gradient"]', 6], ['[class*="background"]', 6],
    ['h1,h2,h3', 6], ['img', 10],
  ]) {
    let added = 0;
    for (const el of sec.querySelectorAll(q)) {
      if (added >= quota || set.size >= 80) break;
      if (!set.has(el)) { set.add(el); added++; }
    }
  }
  window.__TM_TARGETS__ = [...set];
  const probes = [sec];
  for (const s of extraProbeSelectors || []) {
    if (probes.length >= 8) break;
    const el = [...document.querySelectorAll(s)].find((e) => {
      const r = e.getBoundingClientRect();
      return r.height > 300 && getComputedStyle(e).display !== 'none';
    });
    if (el && !probes.includes(el)) probes.push(el);
  }
  window.__TM_PROBES__ = probes.map((el) => ({ el, t0: el.getBoundingClientRect().top }));
  const r1v = (v) => Math.round(v * 10) / 10;
  window.__TM_SAMPLE__ = () => ({
    probes: window.__TM_PROBES__.map(({ el, t0 }) => r1v(t0 - el.getBoundingClientRect().top)),
    targets: window.__TM_TARGETS__.map((t) => {
      const cs = getComputedStyle(t);
      const r = t.getBoundingClientRect();
      return {
        transform: cs.transform,
        opacity: cs.opacity,
        clipPath: cs.clipPath !== 'none' ? cs.clipPath : undefined,
        bg: cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? cs.backgroundColor : undefined,
        /* слайди слайдера свапаються display'єм (is-hidden) — без
           цього реплей не знає, який слайд активний на кроці */
        disp: cs.display === 'none' ? 'none' : undefined,
        top: r1v(r.top), left: r1v(r.left), w: r1v(r.width), h: r1v(r.height),
      };
    }),
  });
  /* рекордер ЗМІН: кадр пишеться, коли зрушив одометр АБО змінився
     будь-який анімований проп цілі (o/clip/transform/bg) — зі
     штампом performance.now(). Ключова різниця від animation-map. */
  window.__TM_REC__ = { buf: [], lastKey: null };
  const keyOf = (f) => f.probes.map((p) => Math.round(p)).join(',') + '|' +
    f.targets.map((t) => `${t.opacity}~${t.clipPath || ''}~${t.transform}~${t.bg || ''}~${t.disp || ''}`).join(';');
  (function recLoop() {
    const rec = window.__TM_REC__;
    if (rec.buf.length < 8000) {
      const f = window.__TM_SAMPLE__();
      const k = keyOf(f);
      if (k !== rec.lastKey) { rec.buf.push({ tMs: Math.round(performance.now() * 10) / 10, ...f }); rec.lastKey = k; }
    }
    requestAnimationFrame(recLoop);
  })();
  return {
    odometer: probes.map((el) => (el.className || '').toString().slice(0, 40)),
    targets: window.__TM_TARGETS__.map((el, i) => {
      const im = el.tagName === 'IMG' ? el : el.querySelector('img');
      let rawSrc = im ? (im.currentSrc || im.src || '') : '';
      if (rawSrc.startsWith('data:')) rawSrc = (im.getAttribute('data-src') || '');
      return {
        i,
        tag: el.tagName.toLowerCase(),
        cls: typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 5).join(' ') : '',
        text: (el.textContent || '').replace(/[^\S ]+/g, ' ').trim().slice(0, 40),
        src: rawSrc ? rawSrc.split('?')[0].split('/').pop() : undefined,
      };
    }),
  };
};

const DRAIN_FN = () => { const b = window.__TM_REC__.buf; window.__TM_REC__.buf = []; return b; };
const READ_ODO_FN = () => window.__TM_PROBES__.map(({ el, t0 }) =>
  Math.round((t0 - el.getBoundingClientRect().top) * 10) / 10);
const NOW_FN = () => Math.round(performance.now() * 10) / 10;

async function runViewport(browser, vpName) {
  if (sectionCfg.viewports && !sectionCfg.viewports.includes(vpName)) {
    return { error: `секція ${sectionId} існує лише на: ${sectionCfg.viewports.join(', ')}` };
  }
  const secSelector = sectionCfg.selector && typeof sectionCfg.selector === 'object'
    ? sectionCfg.selector[vpName] : sectionCfg.selector;
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

  const extraProbeSelectors = sectionsForViewport(site, vpName)
    .filter((s) => s.id !== sectionId && !s.preCss)
    .map((s) => s.selector).slice(0, 6);
  const picked = await page.evaluate(SETUP_FN, { selector: secSelector, extraProbeSelectors });
  if (picked.error) { await ctx.close(); return { error: picked.error }; }
  console.log(`  одометр: [${picked.odometer}] · цілей: ${picked.targets.length}`);
  await page.waitForTimeout(400);
  await page.evaluate(DRAIN_FN); /* скинути буфер setup-шуму */

  const gestureSourceType = vp.mobile ? 'touch' : 'mouse';
  const totalRange = Math.round(vp.height * RANGE_VH);
  const blocks = [];
  let dist = Math.round(vp.height * 0.18), gestures = 0;
  let odo = Math.max(...(await page.evaluate(READ_ODO_FN)));
  const s0 = odo;
  while (odo - s0 < totalRange && gestures < MAX_GESTURES) {
    const tG = await page.evaluate(NOW_FN);
    await cdp.send('Input.synthesizeScrollGesture', {
      x: Math.round(vp.width / 2), y: Math.round(vp.height / 2),
      yDistance: -dist, speed: 1200, gestureSourceType,
    });
    gestures++;
    /* чекати ТИШІ: і одометр осів, І пропи цілей не міняються ≥700мс
       (перехід може тривати ПІСЛЯ осідання одометра) */
    const t0 = Date.now();
    let lastLen = -1, quietSince = Date.now();
    while (Date.now() - t0 < 5000) {
      await page.waitForTimeout(180);
      const len = await page.evaluate(() => window.__TM_REC__.buf.length);
      if (len !== lastLen) { lastLen = len; quietSince = Date.now(); }
      else if (Date.now() - quietSince >= 700) break;
    }
    const frames = (await page.evaluate(DRAIN_FN)).filter((f) => f.tMs >= tG - 50);
    const odoNow = Math.max(...(await page.evaluate(READ_ODO_FN)));
    const moved = odoNow - odo;
    odo = odoNow;
    if (frames.length) {
      const tFirst = frames[0].tMs;
      blocks.push({
        g: gestures, inputDist: dist, sBefore: Math.round((odoNow - moved) * 10) / 10,
        sSettled: Math.round(odoNow * 10) / 10, movedPx: Math.round(moved * 10) / 10,
        durMs: Math.round((frames[frames.length - 1].tMs - tFirst) * 10) / 10,
        frames: frames.map((f) => ({ dt: Math.round((f.tMs - tFirst) * 10) / 10, probes: f.probes, targets: f.targets })),
      });
      console.log(`  жест ${gestures}: s ${Math.round(odoNow - moved)}→${Math.round(odoNow)} · кадрів ${frames.length} · перехід ${Math.round(frames[frames.length - 1].tMs - tFirst)}мс`);
    }
    /* застій = |рух|<60 (пастка 37: джитер плато ±20-50px маскує стоячий
       одометр, подвоєння не спрацьовувало і прогін висів на 4500) */
    dist = Math.abs(moved) < 60 ? Math.min(dist * 2, 1200) : Math.round(vp.height * 0.18);
  }
  await ctx.close();

  /* step-індекси: блоки з тим самим s-бакетом (плато) нумеруються 0,1,2… */
  const bucketCount = {};
  for (const b of blocks) {
    const bucket = Math.round(b.sSettled / 120);
    b.step = bucketCount[bucket] || 0;
    bucketCount[bucket] = b.step + 1;
  }
  /* самоперевірка: є блоки зі ЗМІНАМИ ЦІЛЕЙ при стоячому одометрі
     (саме те, чого не бачить animation-map) */
  const standingTransitions = blocks.filter((b) => Math.abs(b.movedPx) < 30 && b.frames.length >= 5).length;
  const selfCheck = {
    gestures, blocks: blocks.length, standingTransitions,
    sMax: Math.round(odo),
    fail: [
      blocks.length === 0 ? 'жодного блока з кадрами' : null,
      standingTransitions === 0 && !vp.mobile ? 'НЕМАЄ переходів при стоячому одометрі — метод не підтвердився' : null,
    ].filter(Boolean),
  };
  console.log(`  блоків ${blocks.length} · стоячих переходів ${standingTransitions} · sMax ${Math.round(odo)}`);
  return { viewport: vpName, section: sectionId, selector: secSelector, targets: picked.targets, blocks, selfCheck };
}

/* ---- main ---- */
const browser = await chromium.launch();
const vps = vpArg === 'both' ? Object.keys(VIEWPORTS) : [vpArg];
const result = {
  at: new Date().toISOString(), site: siteName, origin, section: sectionId,
  method: 'CDP-жести + rAF-рекордер ЗМІН (одометр АБО проп цілі) зі штампом performance.now(); блоки по жестах, step-індекси на плато',
  viewports: {},
};
let failed = false;
for (const vpName of vps) {
  console.log(`timing-map → ${vpName} (≤${MAX_GESTURES} жестів, діапазон ${RANGE_VH}vh)…`);
  const r = await runViewport(browser, vpName);
  if (r.error) { console.error(`  ПОМИЛКА: ${r.error}`); result.viewports[vpName] = { error: r.error }; failed = true; continue; }
  if (r.selfCheck.fail.length) { console.error(`  САМОПЕРЕВІРКА: ${r.selfCheck.fail.join(' · ')}`); failed = true; }
  result.viewports[vpName] = r;
}
await browser.close();
mkdirSync(site.outDir, { recursive: true });
const out = join(site.outDir, `timing-map-${sectionId}.json`);
/* merge вʼюпортів (пастка 30: НЕ затирати інші вʼюпорти) */
try {
  const prev = JSON.parse(readFileSync(out, 'utf8'));
  for (const [k, v] of Object.entries(prev.viewports || {})) {
    if (!result.viewports[k]) result.viewports[k] = v;
  }
} catch {}
writeFileSync(out, JSON.stringify(result));
console.log(`OK → ${out}`);
process.exit(failed ? 1 : 0);
