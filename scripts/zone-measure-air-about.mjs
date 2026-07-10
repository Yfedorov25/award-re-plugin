/* ============================================================
   zone-measure-air-about.mjs — точкові живі числа зон /about
   з ЛОКАЛЬНОГО АРХІВУ (JS-off, нормалізовано) методом token-extractor.
   Сесія 20: приклад на 3 зонах (aut-grid · hq-картка · comfort-інтро).
   Для нової зони: додай блок у page.evaluate за зразком.
   Запуск: PLAYWRIGHT_FROM=<pkg> node scripts/zone-measure-air-about.mjs
   (читає token-extractor.mjs як бібліотеку — НЕ редагувати його,
   він власність springs-треку). ============================================================ */
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  resolveChromium, ARCHIVE_DIR, LIVE_ORIGIN, FAKE_ORIGIN, NORMALIZE_CSS, FORCE_IMAGES_FN,
} from './token-extractor.mjs';

const chromium = await resolveChromium();
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const html = readFileSync(join(ARCHIVE_DIR, 'air-about.html'), 'utf8');
const cssGlobal = readFileSync(join(ARCHIVE_DIR, 'air-global.css'), 'utf8');
const cssAbout = readFileSync(join(ARCHIVE_DIR, 'air-about.css'), 'utf8');
await ctx.route(`${FAKE_ORIGIN}/**`, async (route) => {
  const u = new URL(route.request().url());
  if (u.pathname === '/about') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: html });
  if (u.pathname.includes('/stylesheets/global.css')) return route.fulfill({ contentType: 'text/css', body: cssGlobal });
  if (u.pathname.includes('/stylesheets/about.css')) return route.fulfill({ contentType: 'text/css', body: cssAbout });
  if (u.pathname.startsWith('/assets/javascripts/')) return route.fulfill({ contentType: 'application/javascript', body: '' });
  if (u.pathname.startsWith('/assets/') || u.pathname.startsWith('/media/')) {
    try {
      const resp = await ctx.request.get(LIVE_ORIGIN + u.pathname + u.search, { timeout: 15000 });
      return route.fulfill({ status: resp.status(), body: await resp.body(),
        contentType: resp.headers()['content-type'] || 'application/octet-stream' });
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

const data = await page.evaluate(() => {
  const rel = (el, root) => {
    const r = el.getBoundingClientRect(), b = root.getBoundingClientRect();
    return { x: +(r.left - b.left).toFixed(1), y: +(r.top - b.top).toFixed(1),
             w: +r.width.toFixed(1), h: +r.height.toFixed(1) };
  };
  const out = {};
  /* 1. AUTONOMY: секція #autonomy — фото-грід + coffee card */
  const aut = document.getElementById('autonomy');
  if (aut) {
    const pics = [...aut.querySelectorAll('picture img')].slice(0, 5).map(img => ({
      src: (img.currentSrc || img.src).split('/').pop().slice(0, 30),
      box: rel(img, aut),
    }));
    const card = aut.querySelector('.card-text');
    out.autonomy = { secW: aut.getBoundingClientRect().width, pics,
      card: card ? { box: rel(card, aut),
        pad: getComputedStyle(card).padding, bg: getComputedStyle(card).backgroundColor,
        radius: getComputedStyle(card).borderRadius,
        title: card.querySelector('.card-text__title') ? {
          fs: getComputedStyle(card.querySelector('.card-text__title')).fontSize,
          lh: getComputedStyle(card.querySelector('.card-text__title')).lineHeight,
          tt: getComputedStyle(card.querySelector('.card-text__title')).textTransform,
        } : null } : null };
  }
  /* 2. HEADQUARTERS: слайдер-картка (card-slider) */
  const hq = document.getElementById('headquarters');
  if (hq) {
    const card = hq.querySelector('[class*="card-slider"], [class*="slider-card"], .card');
    const cands = [...hq.querySelectorAll('div')].filter(d => {
      const c = getComputedStyle(d);
      return c.backdropFilter !== 'none' || (c.borderRadius !== '0px' && d.offsetHeight > 300);
    }).slice(0, 3).map(d => ({ cls: d.className.slice(0, 60), box: rel(d, hq),
      bg: getComputedStyle(d).backgroundColor, bf: getComputedStyle(d).backdropFilter,
      radius: getComputedStyle(d).borderRadius }));
    out.hq = { secH: hq.getBoundingClientRect().height, cands, hasCard: !!card };
  }
  /* 3. COMFORT-ІНТРО (about-space-top): метрики + HAAST */
  const st = document.querySelector('.about-space-top');
  if (st) {
    const dls = [...st.querySelectorAll('dl')].map(dl => ({
      num: dl.querySelector('.h1')?.textContent.trim(),
      box: rel(dl, st),
      numFs: getComputedStyle(dl.querySelector('.h1')).fontSize,
    }));
    const h2 = [...st.querySelectorAll('p.h2')].map(p => ({
      t: p.textContent.trim().slice(0, 30), box: rel(p, st),
      fs: getComputedStyle(p).fontSize }));
    out.comfort = { top: rel(st, document.body).y, h: st.getBoundingClientRect().height, dls, h2 };
  }
  return out;
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
