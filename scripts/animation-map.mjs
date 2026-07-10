/* ============================================================
   ANIMATION-MAP EXTRACTOR v0 (трек springs, S1) — криві руху з ЖИВОГО
   ------------------------------------------------------------
   Метод «чорна скринька» (вердикт ради, дослідження №2): сайт на
   Locomotive-style virtual scroll (lerp .1) + Barba — ScrollTrigger-
   дампа НЕ буде. Скрол-степ по живому → getComputedStyle → JSON
   «елемент → крива(scroll)».

   ДРАЙВЕР (розкопки S1): звичайний wheel движок ІГНОРУЄ
   (virtual-scroll + Lethargy-фільтр інерції відсіює синтетичні
   wheel/drag/keys, а home стартує з гейтованим інтро-слайдером hero,
   який тримає stop=true). Єдиний надійний спосіб — CDP
   Input.synthesizeScrollGesture: справжній жест із фізикою; перші
   1-2 жести «з'їдає» інтро-хореографія hero (це теж записується
   в кадри), далі кожен жест ~yDistance px.

   ОДОМЕТР: контейнер .page-content-wrapper__inner НЕ отримує
   transform (ty=0 завжди) — позицію скролу міряємо як зсув bbox.top
   далекого блока (odometerSelector, дефолт останній блок сторінки).
   Одометр монотонний, але НЕлінійний до інпуту в зонах sticky-травелів
   (там downstream-блоки стоять) — тому пишемо і кумулятивний інпут
   (gestureInput), і одометр (s).

   Вихід: extraction/<site>/animation-map-<sectionId>.json.
   Цим ЖЕ скриптом потім числово звіряється НАША сторінка
   (--origin http://localhost:8820/...).

   Самоперевірки: одометр реально просунувся; ≥1 ціль з НЕконстантною
   кривою; осідання lerp досягалось (не тільки таймаути).

   Запуск:
     PLAYWRIGHT_FROM=/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json \
       node scripts/animation-map.mjs springs-home hero-gallery [--vp desktop|mobile|both] \
         [--origin URL] [--steps 36] [--range 2.5]   # range у висотах вʼюпорта
   ============================================================ */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { resolveChromium, SITES, VIEWPORTS, MOBILE_UA } from './token-extractor.mjs';

const siteName = process.argv[2];
const sectionId = process.argv[3];
const site = SITES[siteName];
const sectionCfg = site?.sections.find((s) => s.id === sectionId);
if (!site || !sectionCfg) {
  console.error(`вкажи: node scripts/animation-map.mjs <${Object.keys(SITES).join('|')}> <sectionId> [--vp desktop|mobile|both] [--origin URL] [--steps N] [--range H]`);
  process.exit(1);
}
const argOf = (name, dflt) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : dflt;
};
const vpArg = argOf('--vp', 'both');
const origin = argOf('--origin', site.liveOrigin);
const STEPS = parseInt(argOf('--steps', '36'), 10);
const RANGE_VH = parseFloat(argOf('--range', '2.5'));

const chromium = await resolveChromium();
if (!chromium) { console.error('playwright не резолвиться (PLAYWRIGHT_FROM?)'); process.exit(1); }

/* ---- браузерний код ---- */

/* цілі всередині секції: анімаційно-значущі елементи, кап 48;
   одометр: останній «великий» блок сторінки або odometerSelector */
const SETUP_FN = (args) => {
  const { selector, odometerSelector } = args;
  const sec = [...document.querySelectorAll(selector)].find((el) => {
    const r = el.getBoundingClientRect();
    return r.width > 1 && r.height > 1 && getComputedStyle(el).display !== 'none';
  });
  if (!sec) return { error: `section not found: ${selector}` };
  const set = new Set([sec]);
  /* елементи, які движок ВЖЕ трансформує — головні носії кривих */
  for (const el of sec.querySelectorAll('*')) {
    if (set.size >= 32) break;
    const cs = getComputedStyle(el);
    if (cs.transform !== 'none' || (cs.clipPath && cs.clipPath !== 'none')) set.add(el);
  }
  for (const q of ['[data-parallax]', '[data-scroll-sticky]', '[data-reveal]', 'h1,h2,h3', 'img', '[class*="__title"]', '[class*="background"]']) {
    for (const el of sec.querySelectorAll(q)) { if (set.size < 48) set.add(el); }
  }
  window.__AM_TARGETS__ = [...set];
  /* ПРОБИ одометра: секція + сконфігурований блок + великі блоки сторінки.
     Хто з них реально їде — вирішується ПОСТ-ФАКТУМ (max range),
     бо на цьому сайті і контейнер, і частина блоків закріплені. */
  const probes = [sec];
  const cfgOdo = odometerSelector && document.querySelector(odometerSelector);
  if (cfgOdo && !probes.includes(cfgOdo)) probes.push(cfgOdo);
  const root = document.querySelector('[data-barba="container"]') || document.body;
  for (const el of root.querySelectorAll(':scope > *, :scope > * > *')) {
    if (probes.length >= 6) break;
    const r = el.getBoundingClientRect();
    if (r.height > 300 && !probes.includes(el)) probes.push(el);
  }
  window.__AM_PROBES__ = probes.map((el) => ({ el, t0: el.getBoundingClientRect().top }));
  return {
    odometer: probes.map((el) => (el.className || '').toString().slice(0, 40)),
    targets: window.__AM_TARGETS__.map((el, i) => ({
      i,
      tag: el.tagName.toLowerCase(),
      cls: typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 5).join(' ') : '',
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
      attrs: [...el.attributes].map((a) => a.name)
        .filter((n) => /^data-(parallax|scroll-sticky|reveal|scroll-snap)/.test(n)).slice(0, 6),
    })),
  };
};

const READ_ODO_FN = () => window.__AM_PROBES__.map(({ el, t0 }) =>
  Math.round((t0 - el.getBoundingClientRect().top) * 10) / 10);

/* знімок кадру: проби одометра + метрики цілей */
const SAMPLE_FN = () => {
  const r1 = (v) => Math.round(v * 10) / 10;
  return {
    probes: window.__AM_PROBES__.map(({ el, t0 }) => r1(t0 - el.getBoundingClientRect().top)),
    targets: window.__AM_TARGETS__.map((t) => {
      const cs = getComputedStyle(t);
      const r = t.getBoundingClientRect();
      return {
        transform: cs.transform,
        opacity: cs.opacity,
        clipPath: cs.clipPath !== 'none' ? cs.clipPath : undefined,
        top: r1(r.top), left: r1(r.left), w: r1(r.width), h: r1(r.height),
      };
    }),
  };
};

/* v0.1 (S2): TRANSIENT-СЕМПЛІНГ — v0 чекав осідання мовчки і знімав лише
   стани спокою, тож снап-зони «пролітали» проміжок. Тепер під час
   lerp-травела кожен ~130мс знімається ПОВНИЙ кадр (SAMPLE_FN),
   параметризований одометром (s) — крива заповнюється МІЖ снапами. */
async function settleAndSample(page, transientFrames, gestureInput, maxMs = 2600) {
  let last = null, stable = 0;
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    await page.waitForTimeout(130);
    const frame = await page.evaluate(SAMPLE_FN);
    const ys = frame.probes;
    if (last !== null && ys.every((y, i) => Math.abs(y - last[i]) < 0.5)) {
      stable++; if (stable >= 3) return { ys, settled: true };
    } else {
      stable = 0;
      /* одометр ще їде → це transient-кадр травела */
      if (last !== null) transientFrames.push({ input: gestureInput, transient: true, ...frame });
    }
    last = ys;
  }
  return { ys: last, settled: false };
}

async function runViewport(browser, vpName) {
  /* per-viewport селектор (з S2 selector може бути {desktop, mobile}) +
     фільтр viewports: секцій, яких нема на цьому вʼюпорті, не знімаємо */
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

  /* 1) цілі + одометр */
  const picked = await page.evaluate(SETUP_FN, { selector: secSelector, odometerSelector: site.odometerSelector });
  if (picked.error) { await ctx.close(); return { error: picked.error }; }
  console.log(`  одометр: [${picked.odometer}] · цілей: ${picked.targets.length}`);

  /* 2) степ-цикл жестами. АДАПТИВНИЙ крок: снап-гейт інтро й снап-зони
     ковтають малі жести — при застої одометра дистанція жесту
     подвоюється (до 900), при русі скидається до базової. Перші
     великі жести «з'їдає» інтро-хореографія — кадри це чесно фіксують. */
  const totalRange = Math.round(vp.height * RANGE_VH);
  const stepPx = Math.round(totalRange / STEPS);
  const frames = [];
  let settledCount = 0, gestureInput = 0, dist = stepPx, gestures = 0;
  frames.push({ input: 0, ...(await page.evaluate(SAMPLE_FN)) });
  const odoOf = (f) => Math.max(...f.probes);
  let odo = odoOf(frames[0]);
  const MAX_GESTURES = STEPS * 3;
  /* desktop → mouse-жести (touch вимикає хореографію: data-parallax-
     enable-touch="false"); mobile → touch-жести (чесна mobile-поведінка) */
  const gestureSourceType = vp.mobile ? 'touch' : 'mouse';
  while (odo - odoOf(frames[0]) < totalRange && gestures < MAX_GESTURES) {
    await cdp.send('Input.synthesizeScrollGesture', {
      x: Math.round(vp.width / 2), y: Math.round(vp.height / 2),
      yDistance: -dist, speed: 1200, gestureSourceType,
    });
    gestureInput += dist;
    gestures++;
    const st = await settleAndSample(page, frames, gestureInput);
    if (st.settled) settledCount++;
    const frame = { input: gestureInput, ...(await page.evaluate(SAMPLE_FN)) };
    frames.push(frame);
    const moved = odoOf(frame) - odo;
    odo = odoOf(frame);
    dist = Math.abs(moved) < 2 ? Math.min(dist * 2, 900) : stepPx;
  }
  await ctx.close();

  /* одометр пост-фактум: проба з найбільшим пройденим діапазоном */
  const nProbes = frames[0].probes.length;
  let odoIdx = 0, bestRange = -1;
  for (let i = 0; i < nProbes; i++) {
    const vals = frames.map((f) => f.probes[i]);
    const range = Math.max(...vals) - Math.min(...vals);
    if (range > bestRange) { bestRange = range; odoIdx = i; }
  }
  for (const f of frames) f.scroll = f.probes[odoIdx];

  /* 3) криві: транспонувати кадри → на ціль */
  const targets = picked.targets.map((t, ti) => {
    const samples = frames.map((f) => ({
      input: f.input, s: f.scroll, t: f.transient || undefined,
      transform: f.targets[ti].transform,
      opacity: f.targets[ti].opacity,
      clipPath: f.targets[ti].clipPath,
      top: f.targets[ti].top, left: f.targets[ti].left, w: f.targets[ti].w, h: f.targets[ti].h,
    }));
    const moving = {
      transform: new Set(samples.map((x) => x.transform)).size > 1,
      opacity: new Set(samples.map((x) => x.opacity)).size > 1,
      clipPath: new Set(samples.map((x) => x.clipPath)).size > 1,
      viewportTop: new Set(samples.map((x) => Math.round(x.top))).size > 1,
    };
    return { ...t, moving, samples };
  });

  const advanced = frames[frames.length - 1].scroll - frames[0].scroll;
  const movingCount = targets.filter((t) => t.moving.transform || t.moving.opacity || t.moving.clipPath).length;
  const bboxMoving = targets.filter((t) => t.moving.viewportTop).length;
  const transientCount = frames.filter((f) => f.transient).length;
  const selfCheck = {
    odometerProbe: picked.odometer[odoIdx],
    gestureSourceType,
    scrollAdvancedPx: Math.round(advanced),
    gestureInputPx: gestureInput,
    settledSteps: `${settledCount}/${gestures}`,
    gestures,
    transientFrames: transientCount,
    targetsTotal: targets.length,
    targetsWithAnimatedProps: movingCount,
    targetsWithBboxMotion: bboxMoving,
    fail: [
      advanced < totalRange * 0.4 ? `одометр просунувся лише ${Math.round(advanced)}px при інпуті ${gestureInput}px` : null,
      /* на touch хореографія легітимно вимкнена — там достатньо bbox-руху */
      movingCount === 0 && gestureSourceType === 'mouse' ? 'ЖОДНА ціль не має анімованої кривої (mouse) — карта пуста' : null,
      movingCount === 0 && bboxMoving === 0 ? 'НІЧОГО не рухається взагалі' : null,
      /* v0.1: неосілий жест ОК, якщо його травел знято transient-кадрами;
         провал лише коли і осідання мало, І травел не зафіксований */
      settledCount < gestures * 0.7 && transientCount < gestures
        ? `осідання ${settledCount}/${gestures} І transient-кадрів лише ${transientCount} — травел не знято` : null,
    ].filter(Boolean),
  };
  console.log(`  одометр[${picked.odometer[odoIdx]}]: +${Math.round(advanced)}px (інпут ${gestureInput}px, жестів ${gestures}) · осіло ${settledCount}/${gestures} · transient-кадрів ${transientCount} · цілей ${targets.length}, анім-props ${movingCount}, bbox-рух ${bboxMoving}`);
  return { viewport: vpName, section: sectionId, selector: secSelector, stepPx, frames: frames.length, targets, selfCheck };
}

/* ---- main ---- */
const browser = await chromium.launch();
const vps = vpArg === 'both' ? Object.keys(VIEWPORTS) : [vpArg];
const result = {
  at: new Date().toISOString(), site: siteName, origin, section: sectionId,
  method: 'чорна скринька: CDP synthesizeScrollGesture-степ + lerp-осідання + getComputedStyle; одометр = зсув bbox.top далекого блока',
  viewports: {},
};
let failed = false;
for (const vpName of vps) {
  console.log(`animation-map → ${vpName} (${STEPS} кроків × діапазон ${RANGE_VH}vh)…`);
  const r = await runViewport(browser, vpName);
  if (r.error) { console.error(`  ПОМИЛКА: ${r.error}`); result.viewports[vpName] = { error: r.error }; failed = true; continue; }
  if (r.selfCheck.fail.length) { console.error(`  САМОПЕРЕВІРКА: ${r.selfCheck.fail.join(' · ')}`); failed = true; }
  result.viewports[vpName] = r;
}
await browser.close();
mkdirSync(site.outDir, { recursive: true });
const out = join(site.outDir, `animation-map-${sectionId}.json`);
writeFileSync(out, JSON.stringify(result));
console.log(`${failed ? 'НАПІВ-' : ''}OK → ${out} (${(JSON.stringify(result).length / 1024).toFixed(0)} KB)`);
process.exit(failed ? 1 : 0);
