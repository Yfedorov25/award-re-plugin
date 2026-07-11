/* ============================================================
   SHELL-BG EXTRACTOR (трек springs, S8a) — фарба оболонок секцій
   ------------------------------------------------------------
   Проблема: корінь секції для карт/спеки = рухомий вузол (l-gallery),
   а ФАРБА фону живе на його предках ПОЗА коренем (.l-gallery-container
   ui-dark #162d24, section.ui-dark) — спека секції її не бачить,
   каркас лишається білим (інтро-пози 72-95% дифу).
   Міняти корінь не можна: вісь одометра карт зламається (пастка 32).

   Метод: на живому, для кожного кореня секції піднімаємось до
   НАЙБЛИЖЧОГО ПОФАРБОВАНОГО предка (bgc непрозорий АБО bgi≠none),
   записуємо {bgc,bgi}; + фон body/сторінкової обгортки. Це СТАТИКА
   спокою (не крива) — окремий прогін без жестів, обидва вʼюпорти.

   Вихід: extraction/<site>/shell-bg.json
   Споживач: choreo-gen → scene.css (background на sk-vp обгортках).

   Запуск: PLAYWRIGHT_FROM=... node scripts/shell-bg.mjs springs-home
   ============================================================ */
import { writeFileSync } from 'fs';
import { join } from 'path';
import { resolveChromium, SITES, VIEWPORTS, MOBILE_UA, sectionsForViewport } from './token-extractor.mjs';

const siteName = process.argv[2];
const site = SITES[siteName];
if (!site) { console.error(`вкажи: node scripts/shell-bg.mjs <${Object.keys(SITES).join('|')}>`); process.exit(1); }

const chromium = await resolveChromium();
if (!chromium) { console.error('playwright не резолвиться (PLAYWRIGHT_FROM?)'); process.exit(1); }
const browser = await chromium.launch();

const result = { at: new Date().toISOString(), site: siteName, viewports: {} };
let failed = false;

for (const vpName of Object.keys(VIEWPORTS)) {
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
  /* прелоадер ховається на ~7с — його шари пофарбовані і брешуть */
  await page.waitForFunction(() => {
    const p = document.querySelector('.js-preloader');
    return !p || getComputedStyle(p).display === 'none' || parseFloat(getComputedStyle(p).opacity) < 0.05;
  }, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(500);

  const sections = sectionsForViewport(site, vpName).filter((s) => !s.preCss);
  const selectors = sections.map((s) => ({
    id: s.id,
    selector: s.selector && typeof s.selector === 'object' ? s.selector[vpName] : s.selector,
  }));
  const data = await page.evaluate((sels) => {
    const painted = (el) => {
      const cs = getComputedStyle(el);
      return (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none')
        && cs.display !== 'none' ? { bgc: cs.backgroundColor, bgi: cs.backgroundImage } : null;
    };
    const out = { sections: {}, body: null };
    for (const { id, selector } of sels) {
      const root = [...document.querySelectorAll(selector)].find((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 1 && getComputedStyle(el).display !== 'none';
      });
      if (!root) continue;
      /* сам корінь пофарбований → оболонці фарба не потрібна (спека бачить) */
      if (painted(root)) { out.sections[id] = { own: true }; continue; }
      let p = root.parentElement, hops = 0;
      while (p && p !== document.body && hops < 6) {
        const paint = painted(p);
        if (paint) {
          const r = p.getBoundingClientRect();
          out.sections[id] = {
            ...paint, ancCls: (p.className || '').toString().replace(/\s+/g, ' ').slice(0, 60),
            hops: hops + 1,
            /* bbox предка на live-споку: слаб-підкладка движка бере
               цю висоту (rest-h секції зі сцени включає травел і бреше) */
            h: Math.round(r.height),
            topRel: Math.round(r.top - root.getBoundingClientRect().top),
          };
          break;
        }
        p = p.parentElement; hops++;
      }
      if (!out.sections[id]) out.sections[id] = null;
    }
    /* базовий фон сторінки: body АБО найглибша фул-ширинна пофарбована
       обгортка контенту (page-content-wrapper ui-light-background) */
    const bodyPaint = painted(document.body);
    if (bodyPaint) out.body = bodyPaint;
    else {
      for (const el of document.querySelectorAll('body > div, body > div > div, main')) {
        const r = el.getBoundingClientRect();
        if (r.width >= innerWidth - 2) {
          const paint = painted(el);
          if (paint) { out.body = { ...paint, ancCls: (el.className || '').toString().slice(0, 60) }; break; }
        }
      }
    }
    return out;
  }, selectors);
  await ctx.close();

  const withPaint = Object.values(data.sections).filter((v) => v && !v.own).length;
  console.log(`${vpName}: секцій ${selectors.length}, фарба оболонки у ${withPaint}, body: ${data.body ? data.body.bgc : '—'}`);
  const fail = [];
  if (!data.body) fail.push('фон body не знайдено');
  if (Object.keys(data.sections).length === 0) fail.push('жодної секції не знайдено');
  if (fail.length) { console.error('  САМОПЕРЕВІРКА: ' + fail.join(' · ')); failed = true; }
  result.viewports[vpName] = data;
}
await browser.close();
const out = join(site.outDir, 'shell-bg.json');
writeFileSync(out, JSON.stringify(result, null, 1));
console.log(`OK → ${out}`);
process.exit(failed ? 1 : 0);
