/* ============================================================
   TOKEN-EXTRACTOR v0 (сесія 20, МІКРО-2) — build-spec із АРХІВУ
   ------------------------------------------------------------
   Валідація ставки конвеєра: чи екстракція специфікації з
   архівного коду (HTML+CSS) дає точні числа для побудови секції
   без ручної розвідки.

   Секція v0: architecture-інтро на AIR /about
   (h2 «Architecture of efficiency» + 2 абзаци + 3-фото sticky-слайдер).

   Що робить:
   1. Піднімає skills/teardowns/live-archive/air/air-about.html у
      Playwright на фейковому origin через route-інтерсепт:
      /assets/stylesheets/* → локальні air-global.css / air-about.css,
      шрифти /assets/fonts/* → проксі з живого aircenter.space,
      /assets/javascripts/* → ПОРОЖНЄ (JS вимкнено → детермінований
      статичний лейаут без Locomotive/reveal).
   2. Нормалізує reveal-стан (opacity:.005 → 1) інʼєкцією CSS —
      opacity/transform/filter позначені як normalized-метрики.
   3. Для КОЖНОГО значущого елемента секції знімає: tag, класи,
      текст (80 симв.), bbox відносно секції (0.1px), computed styles
      (typography/color/box/layout/misc — див. STYLE_KEYS).
   4. Два вʼюпорти: desktop 1440x900 та mobile 390x844 (touch UA).
   5. Пише extraction/air-about/build-spec.json + самоперевірки
      (елементи >0, шрифт Onest завантажився, фото мають natural size).

   Запуск:
     PLAYWRIGHT_FROM=/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json \
       node scripts/token-extractor.mjs
   Верифікація проти живого: scripts/spec-verify.mjs (імпортує звідси).
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { pathToFileURL, fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
export const REPO = join(__dir, '..');
export const ARCHIVE_DIR = join(REPO, 'skills/teardowns/live-archive/air');
export const OUT_DIR = join(REPO, 'extraction/air-about');
export const LIVE_ORIGIN = 'https://aircenter.space';
export const FAKE_ORIGIN = 'http://air-archive.test';

export const VIEWPORTS = {
  desktop: { width: 1440, height: 900, mobile: false },
  mobile: { width: 390, height: 844, mobile: true },
};
export const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

/* reveal/анімаційна нормалізація — ОДНАКОВА для архіву й живого.
   Метрики opacity/transform/filter після неї = «нормалізований кінцевий
   стан», НЕ сирий анімаційний. */
export const NORMALIZE_CSS = `
*,*::before,*::after{animation:none!important;transition:none!important;}
[data-reveal]:not([data-reveal-visible]){opacity:1!important;pointer-events:all!important;}
[data-reveal],[data-reveal] *{filter:none!important;}
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
   архіву і живого (передається як function у page.evaluate) ---- */
export const SNAPSHOT_FN = () => {
  const r1 = (v) => Math.round(v * 10) / 10;
  /* секція: перший <section>, чий h1/h2 починається з "Architecture" */
  const sec = [...document.querySelectorAll('section')].find((s) => {
    const h = s.querySelector('h1,h2');
    return h && /^\s*architecture/i.test((h.textContent || '').replace(/ /g, ' ').trim());
  });
  if (!sec) return { error: 'architecture section not found' };

  const STYLE_KEYS = [
    'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing',
    'textTransform', 'textAlign', 'color', 'backgroundColor', 'backgroundImage',
    'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'display', 'position', 'flexDirection', 'justifyContent', 'alignItems',
    'gap', 'gridTemplateColumns', 'gridTemplateRows',
    'borderRadius', 'opacity', 'transform', 'objectFit', 'objectPosition', 'zIndex',
  ];
  const sr = sec.getBoundingClientRect();
  let count = 0;
  const build = (el, depth) => {
    if (count > 500 || depth > 12) return null;
    const r = el.getBoundingClientRect();
    /* пропустити порожні нульові гілки */
    if (r.width < 0.5 && r.height < 0.5 && !el.children.length) return null;
    const cs = getComputedStyle(el);
    const ownText = [...el.childNodes].filter((n) => n.nodeType === 3)
      .map((n) => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
    count++;
    const node = {
      tag: el.tagName.toLowerCase(),
      cls: typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 6).join(' ') : '',
      box: { x: r1(r.left - sr.left), y: r1(r.top - sr.top), w: r1(r.width), h: r1(r.height) },
      styles: {},
    };
    if (ownText) node.text = ownText.slice(0, 80);
    for (const k of STYLE_KEYS) {
      const v = cs[k];
      if (v !== undefined && v !== '') node.styles[k] = v;
    }
    if (el.tagName === 'IMG') {
      node.img = {
        src: decodeURIComponent((el.currentSrc || el.src || '').split('/').pop().split('?')[0]),
        naturalW: el.naturalWidth, naturalH: el.naturalHeight,
      };
    }
    const kids = [];
    for (const ch of el.children) {
      if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|LINK|SOURCE|BR)$/.test(ch.tagName)) continue;
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
    elementCount: count,
    selfCheck: {
      elements: count,
      fontOnestLoaded: document.fonts.check('16px Onest'),
      images: imgs.length,
      imagesWithNaturalSize: imgs.filter((i) => i.naturalWidth > 0).length,
      docReadyClasses: document.documentElement.className,
    },
    tree,
  };
};

/* ---- форс-довантаження lazy-картинок усередині секції ---- */
export const FORCE_IMAGES_FN = async () => {
  const sec = [...document.querySelectorAll('section')].find((s) => {
    const h = s.querySelector('h1,h2');
    return h && /^\s*architecture/i.test((h.textContent || '').replace(/ /g, ' ').trim());
  });
  if (!sec) return 0;
  const imgs = [...sec.querySelectorAll('img')];
  await Promise.all(imgs.map((img) => {
    img.loading = 'eager';
    if (!img.complete || !img.naturalWidth) {
      const s = img.src; img.src = ''; img.src = s;
    }
    return img.complete && img.naturalWidth ? null
      : new Promise((res) => { img.onload = img.onerror = res; setTimeout(res, 6000); });
  }));
  return imgs.filter((i) => i.naturalWidth > 0).length;
};

/* ---- зняти секцію з АРХІВУ в одному вʼюпорті ---- */
export async function snapshotArchive(browser, vpName) {
  const vp = VIEWPORTS[vpName];
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1,
    userAgent: vp.mobile ? MOBILE_UA : undefined,
    hasTouch: vp.mobile, isMobile: vp.mobile,
  });
  const html = readFileSync(join(ARCHIVE_DIR, 'air-about.html'), 'utf8');
  const cssGlobal = readFileSync(join(ARCHIVE_DIR, 'air-global.css'), 'utf8');
  const cssAbout = readFileSync(join(ARCHIVE_DIR, 'air-about.css'), 'utf8');
  await ctx.route(`${FAKE_ORIGIN}/**`, async (route) => {
    const u = new URL(route.request().url());
    if (u.pathname === '/about') {
      return route.fulfill({ contentType: 'text/html; charset=utf-8', body: html });
    }
    if (u.pathname.includes('/stylesheets/global.css')) {
      return route.fulfill({ contentType: 'text/css', body: cssGlobal });
    }
    if (u.pathname.includes('/stylesheets/about.css')) {
      return route.fulfill({ contentType: 'text/css', body: cssAbout });
    }
    if (u.pathname.startsWith('/assets/javascripts/')) {
      /* JS ВИМКНЕНО в архівному прогоні — статичний лейаут */
      return route.fulfill({ contentType: 'application/javascript', body: '' });
    }
    if (u.pathname.startsWith('/assets/') || u.pathname.startsWith('/media/')) {
      /* шрифти й дрібні асети — проксі з живого */
      try {
        const resp = await ctx.request.get(LIVE_ORIGIN + u.pathname + u.search, { timeout: 15000 });
        return route.fulfill({
          status: resp.status(), body: await resp.body(),
          contentType: resp.headers()['content-type'] || 'application/octet-stream',
        });
      } catch { return route.fulfill({ status: 404, body: '' }); }
    }
    return route.fulfill({ status: 404, body: '' });
  });
  const page = await ctx.newPage();
  await page.goto(`${FAKE_ORIGIN}/about`, { waitUntil: 'load', timeout: 60000 });
  await page.addStyleTag({ content: NORMALIZE_CSS });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(FORCE_IMAGES_FN);
  await page.waitForTimeout(800);
  const snap = await page.evaluate(SNAPSHOT_FN);
  await ctx.close();
  return snap;
}

/* ---- main: build-spec.json з архіву ---- */
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const chromium = await resolveChromium();
  if (!chromium) { console.error('playwright не резолвиться (PLAYWRIGHT_FROM?)'); process.exit(1); }
  const browser = await chromium.launch();
  const spec = {
    at: new Date().toISOString(),
    source: 'skills/teardowns/live-archive/air/air-about.html (+air-global.css, air-about.css; JS OFF; шрифти проксі з live)',
    section: 'architecture-intro: <section> з h2 "Architecture of efficiency" (h2 + 2 абзаци + 3-фото sticky-слайдер)',
    normalized: 'opacity/transform/filter приведені до кінцевого стану (NORMALIZE_CSS); НЕ сирий анімаційний стан',
    viewports: {},
  };
  for (const vpName of Object.keys(VIEWPORTS)) {
    console.log(`архів → ${vpName} ${VIEWPORTS[vpName].width}x${VIEWPORTS[vpName].height}…`);
    const snap = await snapshotArchive(browser, vpName);
    if (snap.error) { console.error(`  ПОМИЛКА: ${snap.error}`); process.exit(1); }
    const sc = snap.selfCheck;
    console.log(`  елементів: ${sc.elements} · Onest: ${sc.fontOnestLoaded} · фото з natural size: ${sc.imagesWithNaturalSize}/${sc.images}`);
    if (!sc.elements || !sc.fontOnestLoaded || sc.imagesWithNaturalSize === 0) {
      console.error('  САМОПЕРЕВІРКА ПРОВАЛЕНА — спека недостовірна'); process.exit(1);
    }
    spec.viewports[vpName] = snap;
  }
  await browser.close();
  mkdirSync(OUT_DIR, { recursive: true });
  const out = join(OUT_DIR, 'build-spec.json');
  writeFileSync(out, JSON.stringify(spec));
  console.log(`OK → ${out} (${(JSON.stringify(spec).length / 1024).toFixed(0)} KB)`);
}
