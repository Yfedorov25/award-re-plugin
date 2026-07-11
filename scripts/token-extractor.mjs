/* ============================================================
   TOKEN-EXTRACTOR v1 (трек springs, S1) — build-spec із АРХІВУ
   ------------------------------------------------------------
   v0 (сесія 20) був заточений під air-about і валідований проти
   живого: 96.5% desktop / 99.7% mobile точних метрик. v1 — той
   самий метод, узагальнений у конфіг-драйв: САЙТИ × СЕКЦІЇ.

   Метод (незмінний з v0):
   1. Піднімає архівний HTML у Playwright на фейковому origin через
      route-інтерсепт: CSS → локальні файли, шрифти → локальні або
      проксі з живого, JS → ПОРОЖНЄ (детермінований статичний лейаут
      без Locomotive/reveal), інші асети → проксі з живого.
   2. Нормалізує reveal-стан (NORMALIZE_CSS) — opacity/transform/filter
      позначені як normalized-метрики.
   3. Для КОЖНОГО значущого елемента секції: tag, класи, текст (80 симв.),
      bbox відносно секції (0.1px), computed styles (STYLE_KEYS).
   4. Два вʼюпорти: desktop 1440x900 + mobile 390x844 (touch UA).
   5. Пише extraction/<site>/build-spec.json + самоперевірки
      (елементи >0, шрифти завантажились, фото мають natural size).

   Формат спеки v1: viewports.<vp>.sections.<sectionId> = снапшот.
   Секція шукається або CSS-селектором (перший ВИДИМИЙ матч — бо
   у springs desktop/mobile варіанти блоків є окремими DOM-нодами),
   або регексом заголовка (спадок air-about).

   Запуск:
     PLAYWRIGHT_FROM=/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json \
       node scripts/token-extractor.mjs <site>        # air-about | springs-home
   Верифікація проти живого: scripts/spec-verify.mjs <site> (імпортує звідси).
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { pathToFileURL, fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
export const REPO = join(__dir, '..');
export const FAKE_ORIGIN = 'http://replica-archive.test';

export const VIEWPORTS = {
  desktop: { width: 1440, height: 900, mobile: false },
  mobile: { width: 390, height: 844, mobile: true },
};
export const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

/* модалки: детерміноване «відкрито» для секцій-у-модалках (однаково
   на архіві й живому — порівняння лишається яблука-до-яблук) */
export const MODAL_OPEN_CSS = `
.js-modal{height:auto!important;}
.js-modal .modal{display:block!important;}
`;

/* ---- КОНФІГИ САЙТІВ ---- */
export const SITES = {
  'air-about': {
    archiveDir: join(REPO, 'skills/teardowns/live-archive/air'),
    outDir: join(REPO, 'extraction/air-about'),
    liveOrigin: 'https://aircenter.space',
    livePath: '/about',
    archive: {
      html: 'air-about.html',
      css: [
        { match: '/stylesheets/global.css', file: 'air-global.css' },
        { match: '/stylesheets/about.css', file: 'air-about.css' },
      ],
      jsOffPrefix: '/assets/javascripts/',
      fontsLocalPrefix: null, /* шрифти проксі з живого */
      proxyPrefixes: ['/assets/', '/media/'],
    },
    fontChecks: ['16px Onest'],
    sections: [
      { id: 'architecture-intro', headingRegex: '^\\s*architecture',
        note: 'h2 "Architecture of efficiency" + 2 абзаци + 3-фото sticky-слайдер' },
    ],
  },
  'springs-home': {
    archiveDir: join(REPO, 'skills/teardowns/live-archive/springs'),
    outDir: join(REPO, 'extraction/springs-home'),
    liveOrigin: 'https://springs.estate',
    livePath: '/',
    /* одометр animation-map: далекий блок, чий bbox.top = проксі скролу
       (.page-content-wrapper__inner НЕ отримує transform на цьому сайті) */
    odometerSelector: '.l-callback',
    archive: {
      html: 'springs-home.html',
      css: [
        { match: '/stylesheets/global.css', file: 'springs-global.css' },
        { match: '/stylesheets/landing.css', file: 'springs-landing.css' },
      ],
      jsOffPrefix: '/assets/javascripts/',
      fontsLocalPrefix: '/assets/fonts/', /* fonts/ у дзеркалі */
      proxyPrefixes: ['/assets/', '/media/'],
    },
    fontChecks: ['16px "Victor Serif"', '16px "TT Commons Pro"'],
    /* S2: ВСІ блоки home. selector = рядок АБО {desktop, mobile} (коли
       варіанти вʼюпортів мають РІЗНІ корені); viewports = обмеження,
       якщо блок існує лише на одному вʼюпорті (див. sectionsForViewport). */
    sections: [
      { id: 'hero-gallery', selector: '.l-gallery',
        note: 'desktop-hero: h1 "Splendor of Renewal" + сітка js-gallery-item',
        /* для animation-map: скрол заблоковано (stop=true), доки інтро-слайдер
           hero не пройдено кліками next (відкриття S1) */
        gate: { clickSelector: '.l-gallery-next', maxClicks: 8 } },
      { id: 'intro', selector: '.l-intro',
        note: 'sticky-інтро (на desktop видимий варіант без is-hidden--lg-up... якщо є); mobile-hero' },
      { id: 'wellness', selector: '.l-wellness',
        note: 'контентна: окремі desktop (is-hidden--md-down) і mobile (is-hidden--lg-up) DOM-варіанти — беремо ВИДИМИЙ' },
      { id: 'nature', selector: '.l-nature',
        note: 'окремі desktop (is-hidden--md-down) і mobile (is-hidden--lg-up) корені — перший видимий' },
      { id: 'place-bg', selector: '.l-nature-bg',
        note: 'сценографія place: bg-item/gradient/caption (WebGL-підкладка living map)' },
      { id: 'place', selector: { desktop: '.l-place', mobile: '.l-place-mobile' },
        note: 'desktop: .l-place sticky__layer усередині l-nature-bg; mobile: окремий .l-place-mobile' },
      { id: 'place-video', selector: { desktop: '.l-place-video-container', mobile: '.l-place-video' },
        note: 'desktop: sticky-контейнер відео; mobile: перший ВИДИМИЙ .l-place-video (в l-place-mobile)' },
      { id: 'map', selector: '.l-map',
        note: 'два корені (is-hidden--md-down / is-hidden--lg-up) — перший видимий' },
      { id: 'design-1', selector: '.l-design__slide--1', note: 'слайд design #1 (id="design"), desktop+mobile варіанти' },
      { id: 'design-2', selector: '.l-design__slide--2', note: 'слайд design #2' },
      { id: 'design-3', selector: '.l-design__slide--3', note: 'слайд design #3' },
      { id: 'design-4', selector: '.l-design__slide--4', viewports: ['mobile'],
        note: 'слайд design #4 існує ЛИШЕ mobile (is-hidden--lg-up, без desktop-варіанта)' },
      { id: 'residences', selector: { desktop: '.l-residences', mobile: '.l-residences__webgl-container' },
        note: 'desktop: єдиний .l-residences; mobile: webgl-контейнер (окремий корінь)' },
      { id: 'residences-slider', selector: '.l-residences__slider-container', viewports: ['mobile'],
        note: 'mobile-слайдер residences (на desktop цей контент всередині .l-residences)' },
      { id: 'interiors', selector: { desktop: '.l-interiors', mobile: '.l-interiors__intro' },
        note: 'desktop: єдиний .l-interiors; mobile: інтро-блок (окремий корінь is-hidden--lg-up)' },
      { id: 'interiors-slider', selector: '.l-interiors__slider', viewports: ['mobile'],
        note: 'mobile-слайдер interiors (на desktop цей контент всередині .l-interiors)' },
      { id: 'header', selector: 'header.header', note: 'sticky-хедер ui-dark header--landing (2 ноди — перший видимий)' },
      { id: 'footer', selector: 'footer.footer', note: 'футер section--no-overflow ui-dark' },
      /* callback/favorites живуть у МОДАЛКАХ (.js-modal h=0 > .modal display:none) —
         НЕ секції потоку (розкопка S2). Знімаємо в стані «модалка відкрита» через
         preCss, ІДЕНТИЧНИЙ на архіві й живому. Ставити ПІСЛЯ всіх flow-секцій:
         preCss лишається в документі до кінця прогону вʼюпорта. */
      { id: 'callback', selector: '.l-callback', preCss: MODAL_OPEN_CSS,
        note: 'форма callback У МОДАЛЦІ — знято з preCss(modal-open); одометр animation-map' },
      { id: 'favorites', selector: '.l-favorites', preCss: MODAL_OPEN_CSS,
        note: 'улюблені У МОДАЛЦІ — знято з preCss(modal-open)' },
    ],
  },
};

/* ---- секції конкретного вʼюпорта: фільтр viewports + резолв
   per-viewport селектора у плоский рядок ---- */
export function sectionsForViewport(site, vpName) {
  return site.sections
    .filter((s) => !s.viewports || s.viewports.includes(vpName))
    .map((s) => ({
      ...s,
      selector: s.selector && typeof s.selector === 'object' ? s.selector[vpName] : s.selector,
    }));
}

/* reveal/анімаційна нормалізація — ОДНАКОВА для архіву й живого.
   Метрики opacity/transform/filter після неї = «нормалізований кінцевий
   стан», НЕ сирий анімаційний. */
export const NORMALIZE_CSS = `
*,*::before,*::after{animation:none!important;transition:none!important;}
[data-reveal]:not([data-reveal-visible]){opacity:1!important;pointer-events:all!important;}
[data-reveal],[data-reveal] *{filter:none!important;}
.with-cookie-consent{--cookie-height:0px!important;}
`;

export async function resolveChromium() {
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

/* ---- знімок секції: ВИКОНУЄТЬСЯ В БРАУЗЕРІ, той самий код для
   архіву і живого. args = { selector?, headingRegex?, fontChecks } ---- */
export const SNAPSHOT_FN = (args) => {
  const { selector, headingRegex, fontChecks } = args;
  const r1 = (v) => Math.round(v * 10) / 10;
  const findSection = () => {
    if (selector) {
      /* перший ВИДИМИЙ матч: desktop/mobile варіанти блоків = окремі ноди */
      return [...document.querySelectorAll(selector)].find((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 1 && r.height > 1 && getComputedStyle(el).display !== 'none';
      }) || null;
    }
    const re = new RegExp(headingRegex, 'i');
    return [...document.querySelectorAll('section')].find((s) => {
      const h = s.querySelector('h1,h2');
      return h && re.test((h.textContent || '').replace(/ /g, ' ').trim());
    }) || null;
  };
  const sec = findSection();
  if (!sec) return { error: `section not found: ${selector || headingRegex}` };

  /* Нейтралізація INLINE-стилів JS-рантайму (параллакс тримає scale
     1.1-1.2 і translate НАВІТЬ У СПОКОЇ — bbox забруднений; пастка №8).
     Чіпаємо ЛИШЕ el.style.* (JS-set): в архіві JS off → no-op, отже
     трансформація симетрична і порівняння лишається яблука-до-яблук. */
  for (const el of [sec, ...sec.querySelectorAll('*')]) {
    if (!el.style) continue;
    if (el.style.transform) el.style.transform = 'none';
    if (el.style.opacity) el.style.opacity = '';
  }

  /* ANCESTOR-CLIP (S9): статичний CSS-clip живого на корені секції чи її
     предках (.sticky--under-next + .sticky--under-previous →
     inset(100svh 0 0)) ховає секцію до вайпа under-previous. Прунінг
     вкладених секцій (S9c-0) відриває піддерево від цієї механіки —
     знімаємо clip'и ДАНИМИ: computed clipPath від кореня вгору до body,
     перша inset-компонента резолвиться у px темп-дивом (браузер сам
     рахує calc/var/svh). ancClip у choreo → контр-тревел clip обгортки. */
  const ancestorClips = [];
  {
    const secR = sec.getBoundingClientRect();
    let el = sec;
    while (el && el !== document.documentElement) {
      const cp = getComputedStyle(el).clipPath;
      if (cp && cp !== 'none') {
        const r = el.getBoundingClientRect();
        let topPx = null;
        const m = cp.match(/^inset\((.*)\)$/);
        if (m) {
          let depth = 0, cut = m[1].length;
          for (let i = 0; i < m[1].length; i++) {
            const ch = m[1][i];
            if (ch === '(') depth++;
            else if (ch === ')') depth--;
            else if (ch === ' ' && depth === 0) { cut = i; break; }
          }
          const probe = document.createElement('div');
          probe.style.cssText = `position:absolute;visibility:hidden;height:${m[1].slice(0, cut)};`;
          el.appendChild(probe);
          topPx = r1(probe.getBoundingClientRect().height);
          probe.remove();
        }
        ancestorClips.push({
          cls: typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 4).join(' ') : '',
          clip: cp.slice(0, 120),
          topPx,
          dTop: r1(r.top - secR.top),
        });
      }
      el = el.parentElement;
    }
  }

  const STYLE_KEYS = [
    'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'lineHeight', 'letterSpacing',
    'textTransform', 'textAlign', 'color', 'backgroundColor', 'backgroundImage',
    'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'display', 'position', 'flexDirection', 'justifyContent', 'alignItems',
    'gap', 'gridTemplateColumns', 'gridTemplateRows',
    'borderRadius', 'opacity', 'transform', 'objectFit', 'objectPosition', 'zIndex',
    /* S2c: layout-повнота для каркаса ПО СПЕЦІ (генератор потребує
       використаних значень, не лише box) */
    'width', 'height', 'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
    'top', 'right', 'bottom', 'left',
    'flexGrow', 'flexShrink', 'flexBasis', 'overflowX', 'overflowY',
    'boxSizing', 'whiteSpace', 'verticalAlign',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'borderTopColor', 'borderTopStyle',
  ];
  const sr = sec.getBoundingClientRect();
  let count = 0;
  const build = (el, depth) => {
    if (count > 800 || depth > 14) return null;
    const r = el.getBoundingClientRect();
    if (r.width < 0.5 && r.height < 0.5 && !el.children.length) return null;
    const cs = getComputedStyle(el);
    /* NBSP зберігаємо (S6): \s матчить і \u00A0, а nbsp керує
       переносами live-заголовків ("Open the doors of Springs…") —
       колапсуємо лише звичайний whitespace */
    const ownText = [...el.childNodes].filter((n) => n.nodeType === 3)
      .map((n) => n.textContent).join(' ')
      .replace(/[^\S\u00A0]+/g, ' ').replace(/\u00A0+/g, '\u00A0').trim();
    count++;
    const node = {
      tag: el.tagName.toLowerCase(),
      cls: typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 8).join(' ') : '',
      box: { x: r1(r.left - sr.left), y: r1(r.top - sr.top), w: r1(r.width), h: r1(r.height) },
      styles: {},
    };
    if (ownText) node.text = ownText.slice(0, 400);
    for (const k of STYLE_KEYS) {
      const v = cs[k];
      if (v !== undefined && v !== '') node.styles[k] = v;
    }
    if (el.tagName === 'IMG') {
      let srcPath = '';
      try { srcPath = new URL(el.currentSrc || el.src, location.href).pathname; } catch {}
      node.img = {
        src: decodeURIComponent((el.currentSrc || el.src || '').split('/').pop().split('?')[0]),
        srcPath, /* повний pathname — для генератора каркаса */
        naturalW: el.naturalWidth, naturalH: el.naturalHeight,
      };
    }
    const kids = [];
    for (const ch of el.children) {
      if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|LINK|SOURCE|BR)$/.test(ch.tagName)) continue;
      /* ПРУНІНГ ВКЛАДЕНИХ СЕКЦІЙ (S9c-0): корінь іншої секції всередині
         цієї = ДУБЛЬ у скелеті (l-nature-bg жив і в nature-обгортці, і
         своєю секцією; пізніша копія малюється поверх, біндінги чіпляли
         невидиму — red-тест). Піддерево належить СВОЇЙ секції. */
      if (args.pruneSelectors && args.pruneSelectors.some((ps) => {
        try { return ch.matches(ps); } catch { return false; }
      })) continue;
      const k = build(ch, depth + 1);
      if (k) kids.push(k);
    }
    if (kids.length) node.children = kids;
    return node;
  };
  const tree = build(sec, 0);
  /* самоперевірки — екстрактор не має брехати мовчки */
  const imgs = [...sec.querySelectorAll('img')];
  return {
    sectionBox: { x: r1(sr.left + scrollX), y: r1(sr.top + scrollY), w: r1(sr.width), h: r1(sr.height) },
    ancestorClips,
    elementCount: count,
    selfCheck: {
      elements: count,
      fonts: Object.fromEntries((fontChecks || []).map((f) => [f, document.fonts.check(f)])),
      images: imgs.length,
      imagesWithNaturalSize: imgs.filter((i) => i.naturalWidth > 0).length,
      docReadyClasses: document.documentElement.className,
    },
    tree,
  };
};

/* ---- форс-довантаження lazy-картинок усередині секції ---- */
export const FORCE_IMAGES_FN = async (args) => {
  const { selector, headingRegex } = args;
  const findSection = () => {
    if (selector) {
      return [...document.querySelectorAll(selector)].find((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 1 && r.height > 1 && getComputedStyle(el).display !== 'none';
      }) || null;
    }
    const re = new RegExp(headingRegex, 'i');
    return [...document.querySelectorAll('section')].find((s) => {
      const h = s.querySelector('h1,h2');
      return h && re.test((h.textContent || '').replace(/ /g, ' ').trim());
    }) || null;
  };
  const sec = findSection();
  if (!sec) return 0;
  /* lazy-движок тримає справжні URL у data-src/data-srcset, а в src —
     SVG-заглушку; активуємо і <source> всередині <picture> */
  for (const src of sec.querySelectorAll('source[data-srcset]')) {
    const cur = src.getAttribute('srcset') || '';
    if (!cur || cur.startsWith('data:')) src.srcset = src.dataset.srcset;
  }
  const imgs = [...sec.querySelectorAll('img')];
  await Promise.all(imgs.map((img) => {
    img.loading = 'eager';
    const placeholder = !img.getAttribute('src') || img.src.startsWith('data:');
    if (placeholder && img.dataset.src) img.src = img.dataset.src;
    const curSet = img.getAttribute('srcset') || '';
    if (img.dataset.srcset && (!curSet || curSet.startsWith('data:'))) img.srcset = img.dataset.srcset;
    if (!img.complete || !img.naturalWidth) {
      const s = img.src; if (s) { img.src = ''; img.src = s; }
    }
    return img.complete && img.naturalWidth ? null
      : new Promise((res) => { img.onload = img.onerror = res; setTimeout(res, 6000); });
  }));
  return imgs.filter((i) => i.naturalWidth > 0).length;
};

/* ---- зняти ВСІ секції сайту з АРХІВУ в одному вʼюпорті ---- */
export async function snapshotArchive(browser, site, vpName) {
  const vp = VIEWPORTS[vpName];
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1,
    userAgent: vp.mobile ? MOBILE_UA : undefined,
    hasTouch: vp.mobile, isMobile: vp.mobile,
  });
  const A = site.archive;
  const html = readFileSync(join(site.archiveDir, A.html), 'utf8');
  const cssBodies = A.css.map((c) => ({ ...c, body: readFileSync(join(site.archiveDir, c.file), 'utf8') }));
  await ctx.route(`${FAKE_ORIGIN}/**`, async (route) => {
    const u = new URL(route.request().url());
    if (u.pathname === site.livePath) {
      return route.fulfill({ contentType: 'text/html; charset=utf-8', body: html });
    }
    const css = cssBodies.find((c) => u.pathname.includes(c.match));
    if (css) return route.fulfill({ contentType: 'text/css', body: css.body });
    if (A.jsOffPrefix && u.pathname.startsWith(A.jsOffPrefix)) {
      /* JS ВИМКНЕНО в архівному прогоні — статичний лейаут */
      return route.fulfill({ contentType: 'application/javascript', body: '' });
    }
    if (A.fontsLocalPrefix && u.pathname.startsWith(A.fontsLocalPrefix)) {
      try {
        const body = readFileSync(join(site.archiveDir, 'fonts', basename(u.pathname)));
        return route.fulfill({ contentType: 'font/woff2', body });
      } catch { /* нема локально → впадемо в проксі нижче */ }
    }
    if (A.proxyPrefixes.some((p) => u.pathname.startsWith(p))) {
      /* дрібні асети (картинки, іконки) — проксі з живого */
      try {
        const resp = await ctx.request.get(site.liveOrigin + u.pathname + u.search, { timeout: 15000 });
        return route.fulfill({
          status: resp.status(), body: await resp.body(),
          contentType: resp.headers()['content-type'] || 'application/octet-stream',
        });
      } catch { return route.fulfill({ status: 404, body: '' }); }
    }
    return route.fulfill({ status: 404, body: '' });
  });
  const page = await ctx.newPage();
  await page.goto(FAKE_ORIGIN + site.livePath, { waitUntil: 'load', timeout: 60000 });
  await page.addStyleTag({ content: NORMALIZE_CSS });
  await page.evaluate(() => document.fonts.ready);
  const sections = {};
  for (const s of sectionsForViewport(site, vpName)) {
    const args = { selector: s.selector, headingRegex: s.headingRegex, fontChecks: site.fontChecks,
      pruneSelectors: pruneSelectorsFor(site, vpName, s.id) };
    if (s.preCss) await page.addStyleTag({ content: s.preCss });
    await page.evaluate(FORCE_IMAGES_FN, args);
    await page.waitForTimeout(400);
    sections[s.id] = await page.evaluate(SNAPSHOT_FN, args);
  }
  await ctx.close();
  return sections;
}

/* селектори ІНШИХ секцій вʼюпорта — для прунінгу вкладених дублів */
export const pruneSelectorsFor = (site, vpName, selfId) =>
  sectionsForViewport(site, vpName)
    .filter((x) => x.id !== selfId && !x.preCss)
    .map((x) => (x.selector && typeof x.selector === 'object' ? x.selector[vpName] : x.selector))
    .filter(Boolean);

/* ---- main: build-spec.json з архіву ---- */
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const siteName = process.argv[2];
  const site = SITES[siteName];
  if (!site) { console.error(`вкажи сайт: node scripts/token-extractor.mjs <${Object.keys(SITES).join('|')}>`); process.exit(1); }
  const chromium = await resolveChromium();
  if (!chromium) { console.error('playwright не резолвиться (PLAYWRIGHT_FROM?)'); process.exit(1); }
  const browser = await chromium.launch();
  const spec = {
    at: new Date().toISOString(),
    site: siteName,
    source: `${site.archiveDir.replace(REPO + '/', '')}/${site.archive.html} (+${site.archive.css.map((c) => c.file).join(', ')}; JS OFF; шрифти ${site.archive.fontsLocalPrefix ? 'локальні' : 'проксі з live'})`,
    sections: Object.fromEntries(site.sections.map((s) => [s.id, s.note || s.selector || s.headingRegex])),
    normalized: 'opacity/transform/filter приведені до кінцевого стану (NORMALIZE_CSS); НЕ сирий анімаційний стан',
    viewports: {},
  };
  let failed = false;
  for (const vpName of Object.keys(VIEWPORTS)) {
    console.log(`архів → ${vpName} ${VIEWPORTS[vpName].width}x${VIEWPORTS[vpName].height}…`);
    const sections = await snapshotArchive(browser, site, vpName);
    for (const [id, snap] of Object.entries(sections)) {
      if (snap.error) { console.error(`  [${id}] ПОМИЛКА: ${snap.error}`); failed = true; continue; }
      const sc = snap.selfCheck;
      const fontsOk = Object.values(sc.fonts).every(Boolean);
      console.log(`  [${id}] елементів: ${sc.elements} · шрифти: ${fontsOk ? 'ok' : JSON.stringify(sc.fonts)} · фото з natural size: ${sc.imagesWithNaturalSize}/${sc.images}`);
      if (!sc.elements || !fontsOk || (sc.images > 0 && sc.imagesWithNaturalSize === 0)) {
        console.error(`  [${id}] САМОПЕРЕВІРКА ПРОВАЛЕНА — спека недостовірна`); failed = true;
      }
    }
    spec.viewports[vpName] = { sections };
  }
  await browser.close();
  if (failed) process.exit(1);
  mkdirSync(site.outDir, { recursive: true });
  const out = join(site.outDir, 'build-spec.json');
  writeFileSync(out, JSON.stringify(spec));
  console.log(`OK → ${out} (${(JSON.stringify(spec).length / 1024).toFixed(0)} KB)`);
}
