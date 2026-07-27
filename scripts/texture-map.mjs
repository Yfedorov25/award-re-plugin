/* ============================================================
   TEXTURE-MAP EXTRACTOR (трек springs, S9a) — текстури мертвих канвасів
   ------------------------------------------------------------
   Проблема: у live вміст деяких секцій малює WebGL-канвас (wellness:
   фулскрін-жінка), DOM-фолбеки поруч стоять сурогатами (пастка 35).
   Наша репліка no-WebGL — канвас мертвий/прозорий, замість жінки темний
   фон (s3888 ~40%, плато 45xx ~15%).

   Правило (закон 4, нуль ручних чисел): мобільний варіант ТІЄЇ Ж секції
   на live малює той самий вміст ЗВИЧАЙНИМ <picture>/bg (wellness-bg-xs) —
   для кожного js-канваса desktop беремо bg-АСЕТ мобільного варіанта
   секції і його bbox-слот. Асети вже у дзеркалі (проксі-кеш).

   Метод: live, ОБИДВА вʼюпорти по черзі; на desktop збираємо канваси
   секцій (bbox, селектор-шлях у межах секції); на mobile — перший
   значущий picture/img БЕЗ слайдерності (background-роль: предок з
   'background' у класі) тієї ж секції → src.

   Вихід: extraction/<site>/texture-map.json
   Споживач: choreo-gen → viewport.textures → движок: underlay-div
   (bg cover) ПІД канвасом.

   Запуск: PLAYWRIGHT_FROM=... node scripts/texture-map.mjs springs-home
   ============================================================ */
import { writeFileSync } from 'fs';
import { join } from 'path';
import { resolveChromium, SITES, VIEWPORTS, MOBILE_UA, sectionsForViewport } from './token-extractor.mjs';

const siteName = process.argv[2];
const site = SITES[siteName];
if (!site) { console.error(`вкажи: node scripts/texture-map.mjs <${Object.keys(SITES).join('|')}>`); process.exit(1); }
const chromium = await resolveChromium();
if (!chromium) { console.error('playwright не резолвиться'); process.exit(1); }
const browser = await chromium.launch();

async function openLive(vpName) {
  const vp = VIEWPORTS[vpName];
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1,
    userAgent: vp.mobile ? MOBILE_UA : undefined, hasTouch: vp.mobile, isMobile: vp.mobile,
  });
  const page = await ctx.newPage();
  await page.goto(site.liveOrigin + site.livePath, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  for (const sel of ['.js-cookie-consent-accept', 'button:has-text("ACCEPT")']) {
    try { await page.click(sel, { timeout: 1200 }); break; } catch {}
  }
  await page.waitForFunction(() => {
    const p = document.querySelector('.js-preloader');
    return !p || getComputedStyle(p).display === 'none' || parseFloat(getComputedStyle(p).opacity) < 0.05;
  }, { timeout: 25000 }).catch(() => {});
  await page.waitForTimeout(800);
  return { ctx, page };
}

const secList = (vpName) => sectionsForViewport(site, vpName)
  .filter((s) => !s.preCss)
  .map((s) => ({ id: s.id, selector: s.selector && typeof s.selector === 'object' ? s.selector[vpName] : s.selector }));

/* desktop: канваси в межах секцій */
const d = await openLive('desktop');
const canvases = await d.page.evaluate((sels) => {
  const out = {};
  for (const { id, selector } of sels) {
    const root = [...document.querySelectorAll(selector)].find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 1 && getComputedStyle(el).display !== 'none';
    });
    if (!root) continue;
    const cvs = [...root.querySelectorAll('canvas')].filter((c) => {
      const r = c.getBoundingClientRect();
      return r.width > 200 && r.height > 200;
    });
    if (!cvs.length) continue;
    out[id] = cvs.map((c) => {
      const r = c.getBoundingClientRect();
      /* шлях до канваса: клас самого канваса (js-*-canvas стабільний) */
      return {
        canvasCls: (c.className || '').toString().trim().split(/\s+/).slice(0, 3).join(' '),
        parentCls: (c.parentElement?.className || '').toString().trim().split(/\s+/).slice(0, 3).join(' '),
        w: Math.round(r.width), h: Math.round(r.height),
      };
    });
  }
  return out;
}, secList('desktop'));
await d.ctx.close();

/* mobile: перший background-picture/img секції → src */
const m = await openLive('mobile');
const mobAssets = await m.page.evaluate((sels) => {
  const out = {};
  for (const { id, selector } of sels) {
    const root = [...document.querySelectorAll(selector)].find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 1 && getComputedStyle(el).display !== 'none';
    });
    if (!root) continue;
    /* background-роль: img у предку з 'background' у класі; беремо
       ПЕРШИЙ видимий зі справжнім src (data: → data-src) */
    for (const img of root.querySelectorAll('[class*="background"] img, picture img')) {
      let src = img.currentSrc || img.src || '';
      if (src.startsWith('data:')) src = img.getAttribute('data-src') || '';
      if (!src) continue;
      const r = img.getBoundingClientRect();
      if (r.width < 100) continue;
      out[id] = { src: src.replace(location.origin, ''), imgW: Math.round(r.width) };
      break;
    }
  }
  return out;
}, secList('mobile'));
await m.ctx.close();
await browser.close();

/* поєднання: лише секції, де desktop МАЄ канвас і mobile МАЄ асет */
const textures = {};
for (const [id, cvs] of Object.entries(canvases)) {
  if (!mobAssets[id]) { console.log(`  ${id}: канвас є, mobile-асета НЕМА — пропуск`); continue; }
  textures[id] = { canvases: cvs, asset: mobAssets[id].src };
  console.log(`  ${id}: канвасів ${cvs.length} → асет ${mobAssets[id].src.split('/').pop()}`);
}
const fail = Object.keys(textures).length === 0 ? 'жодної пари канвас↔асет' : null;
const out = { at: new Date().toISOString(), site: siteName, textures };
writeFileSync(join(site.outDir, 'texture-map.json'), JSON.stringify(out, null, 1));
console.log(`OK → ${join(site.outDir, 'texture-map.json')}${fail ? ' · САМОПЕРЕВІРКА: ' + fail : ''}`);
process.exit(fail ? 1 : 0);
