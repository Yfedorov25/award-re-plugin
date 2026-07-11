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
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { resolveChromium, SITES, VIEWPORTS, MOBILE_UA, sectionsForViewport } from './token-extractor.mjs';

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
/* --out: НЕ затирати живу карту, коли знімаємо нашу сторінку (--origin) */
const outPath = argOf('--out', null);

const chromium = await resolveChromium();
if (!chromium) { console.error('playwright не резолвиться (PLAYWRIGHT_FROM?)'); process.exit(1); }

/* ---- браузерний код ---- */

/* цілі всередині секції: анімаційно-значущі елементи, кап 48;
   одометр: останній «великий» блок сторінки або odometerSelector */
const SETUP_FN = (args) => {
  const { selector, odometerSelector, extraProbeSelectors } = args;
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
  for (const q of ['[data-parallax]', '[data-scroll-sticky]', '[data-reveal]', 'h1,h2,h3', 'img', '[class*="__title"]', '[class*="background"]', '[class*="gradient"]']) {
    for (const el of sec.querySelectorAll(q)) { if (set.size < 48) set.add(el); }
  }
  /* BODY як псевдо-ціль (S7): тема сторінки (ui-dark/ui-light) живе
     на body.background і фліпається хореографією між секціями —
     фон = така сама крива, як transform/opacity */
  set.add(document.body);
  window.__AM_TARGETS__ = [...set];
  /* ПРОБИ одометра: секція + сконфігурований блок + великі блоки сторінки.
     Хто з них реально їде — вирішується ПОСТ-ФАКТУМ (max range),
     бо на цьому сайті і контейнер, і частина блоків закріплені. */
  const probes = [sec];
  const cfgOdo = odometerSelector && document.querySelector(odometerSelector);
  if (cfgOdo && !probes.includes(cfgOdo)) probes.push(cfgOdo);
  /* корені ІНШИХ секцій конфігу (S6): для fixed-секцій (header) власний
     корінь і far-блоки мертві на desktop (пастка 6) — травелять лише
     sticky-корені контентних секцій */
  for (const s of extraProbeSelectors || []) {
    if (probes.length >= 8) break;
    const el = [...document.querySelectorAll(s)].find((e) => {
      const r = e.getBoundingClientRect();
      return r.height > 300 && getComputedStyle(e).display !== 'none';
    });
    if (el && !probes.includes(el)) probes.push(el);
  }
  const root = document.querySelector('[data-barba="container"]') || document.body;
  for (const el of root.querySelectorAll(':scope > *, :scope > * > *')) {
    if (probes.length >= 8) break;
    const r = el.getBoundingClientRect();
    if (r.height > 300 && !probes.includes(el)) probes.push(el);
  }
  window.__AM_PROBES__ = probes.map((el) => ({ el, t0: el.getBoundingClientRect().top }));
  /* спільна вимірювалка кадру (використовують і evaluate-семпли,
     і page-rAF рекордер) */
  window.__AM_SAMPLE__ = () => {
    const r1v = (v) => Math.round(v * 10) / 10;
    return {
      probes: window.__AM_PROBES__.map(({ el, t0 }) => r1v(t0 - el.getBoundingClientRect().top)),
      targets: window.__AM_TARGETS__.map((t) => {
        const cs = getComputedStyle(t);
        const r = t.getBoundingClientRect();
        return {
          transform: cs.transform,
          opacity: cs.opacity,
          clipPath: cs.clipPath !== 'none' ? cs.clipPath : undefined,
          bg: cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? cs.backgroundColor : undefined,
          top: r1v(r.top), left: r1v(r.left), w: r1v(r.width), h: r1v(r.height),
        };
      }),
    };
  };
  /* page-rAF РЕКОРДЕР (S6): evaluate-цикл (~130мс раунд-тріп) лишає
     діри 100-200px на швидких фазах лерпа — коліно піна інтерполюється
     через діру і бреше на ~15px. Пишемо КОЖЕН кадр, де одометр
     зрушив ≥0.5px, у буфер; драйвер дренує після кожного жесту. */
  window.__AM_REC__ = { buf: [], lastS: null };
  (function recLoop() {
    const rec = window.__AM_REC__;
    if (rec.buf.length < 4000) {
      const f = window.__AM_SAMPLE__();
      const s = Math.max(...f.probes);
      if (rec.lastS === null || Math.abs(s - rec.lastS) >= 0.5) { rec.buf.push(f); rec.lastS = s; }
    }
    requestAnimationFrame(recLoop);
  })();
  return {
    odometer: probes.map((el) => (el.className || '').toString().slice(0, 40)),
    targets: window.__AM_TARGETS__.map((el, i) => {
      /* src СЕБЕ або першого img-нащадка (S6, пастка 26): єдиний
         надійний дискримінатор однакових picture-груп — вміст */
      const im = el.tagName === 'IMG' ? el : el.querySelector('img');
      const rawSrc = im && (im.currentSrc || im.src || im.getAttribute('data-src') || '');
      return {
        i,
        tag: el.tagName.toLowerCase(),
        cls: typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 5).join(' ') : '',
        text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40),
        attrs: [...el.attributes].map((a) => a.name)
          .filter((n) => /^data-(parallax|scroll-sticky|reveal|scroll-snap)/.test(n)).slice(0, 6),
        src: rawSrc ? rawSrc.split('?')[0].split('/').pop() : undefined,
      };
    }),
  };
};

const READ_ODO_FN = () => window.__AM_PROBES__.map(({ el, t0 }) =>
  Math.round((t0 - el.getBoundingClientRect().top) * 10) / 10);

/* знімок кадру: проби одометра + метрики цілей (вимірювалка — в SETUP_FN) */
const SAMPLE_FN = () => window.__AM_SAMPLE__();
/* дрейн буфера page-rAF рекордера (S6) */
const DRAIN_REC_FN = () => { const b = window.__AM_REC__.buf; window.__AM_REC__.buf = []; return b; };

/* v0.1 (S2): TRANSIENT-СЕМПЛІНГ — v0 чекав осідання мовчки і знімав лише
   стани спокою, тож снап-зони «пролітали» проміжок. Тепер під час
   lerp-травела кожен ~130мс знімається ПОВНИЙ кадр (SAMPLE_FN),
   параметризований одометром (s) — крива заповнюється МІЖ снапами. */
async function settleAndSample(page, transientFrames, gestureInput, maxMs = 2600) {
  /* transient-кадри тепер несе page-rAF рекордер (кожен кадр, без дір
     раунд-тріпа) — цикл лише детектить осідання по пробах одометра */
  let last = null, stable = 0, settled = false;
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    await page.waitForTimeout(130);
    const ys = await page.evaluate(READ_ODO_FN);
    if (last !== null && ys.every((y, i) => Math.abs(y - last[i]) < 0.5)) {
      stable++; if (stable >= 3) { settled = true; last = ys; break; }
    } else stable = 0;
    last = ys;
  }
  const drained = await page.evaluate(DRAIN_REC_FN);
  for (const f of drained) transientFrames.push({ input: gestureInput, transient: true, ...f });
  return { ys: last, settled };
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
  const extraProbeSelectors = sectionsForViewport(site, vpName)
    .filter((s) => s.id !== sectionId && !s.preCss)
    .map((s) => s.selector).slice(0, 6);
  const picked = await page.evaluate(SETUP_FN, { selector: secSelector, odometerSelector: site.odometerSelector, extraProbeSelectors });
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
  /* вибір проби (S7): НЕ чистий max-range — extras-проби (корені інших
     секцій) можуть мати більший рейндж, але їхня вісь ламає інтро-фазу
     (гейт hero: корінь intro рушає раніше за l-gallery → s>2 зарано,
     iEnd екстраполюється зі сміття). Пріоритет за ПОРЯДКОМ (секція →
     конфіг → extras): перша проба з рейнджем ≥60% максимуму. */
  const ranges = [];
  for (let i = 0; i < nProbes; i++) {
    const vals = frames.map((f) => f.probes[i]);
    ranges.push(Math.max(...vals) - Math.min(...vals));
  }
  const maxRange = Math.max(...ranges);
  /* пріоритет ЛИШЕ власному кореню секції (проба 0): його вісь тримає
     інтро-фазу гейта; якщо він мертвий/малий (fixed-хедер) — max-range */
  const odoIdx = ranges[0] >= maxRange * 0.6 ? 0 : ranges.indexOf(maxRange);
  for (const f of frames) f.scroll = f.probes[odoIdx];

  /* 3) криві: транспонувати кадри → на ціль */
  const targets = picked.targets.map((t, ti) => {
    const samples = frames.map((f) => ({
      input: f.input, s: f.scroll, t: f.transient || undefined,
      transform: f.targets[ti].transform,
      opacity: f.targets[ti].opacity,
      clipPath: f.targets[ti].clipPath,
      bg: f.targets[ti].bg,
      top: f.targets[ti].top, left: f.targets[ti].left, w: f.targets[ti].w, h: f.targets[ti].h,
    }));
    const moving = {
      transform: new Set(samples.map((x) => x.transform)).size > 1,
      opacity: new Set(samples.map((x) => x.opacity)).size > 1,
      clipPath: new Set(samples.map((x) => x.clipPath)).size > 1,
      bg: new Set(samples.map((x) => x.bg)).size > 1,
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
const out = outPath || join(site.outDir, `animation-map-${sectionId}.json`);
/* MERGE вʼюпортів (S6): частковий прогін (--vp desktop) не сміє
   затирати раніше зняті вʼюпорти того ж файлу */
if (existsSync(out)) {
  try {
    const prev = JSON.parse(readFileSync(out, 'utf8'));
    for (const [vp, data] of Object.entries(prev.viewports || {})) {
      if (!result.viewports[vp]) result.viewports[vp] = data;
    }
  } catch {}
}
writeFileSync(out, JSON.stringify(result));
console.log(`${failed ? 'НАПІВ-' : ''}OK → ${out} (${(JSON.stringify(result).length / 1024).toFixed(0)} KB)`);
process.exit(failed ? 1 : 0);
