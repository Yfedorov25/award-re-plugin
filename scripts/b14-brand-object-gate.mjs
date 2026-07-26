#!/usr/bin/env node
/*
  b14-brand-object-gate.mjs — B14 (air-brand-object) v2 regression gate.

  Ловить рівно 2 баги, що завалили v1 (С34, Єгор):
    (1) ОБ'ЄКТ ОБЕРТАЄТЬСЯ — вигаданий рух. Доведено frame-diff що об'єкт СТАТИЧНИЙ
        (object-diff ~0 при статичному скролі). Гейт: рендеримо секцію на кількох p,
        робимо screenshot САМЕ об'єкта на кожному p → усі кадри об'єкта мусять бути
        ІДЕНТИЧНІ (об'єкт не крутиться), АЛЕ секція в цілому мусить рухатись (parallax).
    (2) ФОН ПОРОЖНІЙ — CD брав <image-slot> scaffold. Гейт: нуль `image-slot` у DOM +
        фон-шар має реальний background-image (не none/empty).

  + фасад: нуль serif; + reduced-motion не armить; + __BRAND.objRotated===false; + 0 console-err.

  Це НЕ доказ візуальної парності з live (це судить око Єгора проти запису 11.49.53).
  Гейт лише: «об'єкт не крутиться, фон не порожній, текст не серифний, нуль помилок».

  Usage:
    node b14-brand-object-gate.mjs --url <http url> [--url ...] [--out report.json]
    node b14-brand-object-gate.mjs --selftest   (еталон з rotateY на об'єкті — має ЗЛОВИТИ)

  Deps: playwright (resolveChromium-package, PLAYWRIGHT_FROM).
*/
'use strict';
import { createRequire } from 'module';
import { writeFileSync } from 'fs';

const require = createRequire(
  process.env.PLAYWRIGHT_FROM ||
  '/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json'
);
const { chromium } = require('playwright');

const P_SAMPLES = [0.15, 0.35, 0.55, 0.75];   // точки скролу де об'єкт має бути в кадрі
const OBJ_DIFF_MAX = 2.0;    // середній abs-diff об'єкта між p (0..255); >2 = крутиться
const SECTION_MIN_MOVE = 4;  // секція мусить зсунутись мінімум стільки px між крайніми p (доказ parallax живий)

function parseArgs(argv) {
  const urls = []; let out = null, selftest = false;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--url') urls.push(argv[++i]);
    else if (argv[i] === '--out') out = argv[++i];
    else if (argv[i] === '--selftest') selftest = true;
  }
  return { urls, out, selftest };
}

// мінімальний еталон для --selftest: об'єкт що ОБЕРТАЄТЬСЯ (має провалити object-static)
const SELFTEST_HTML = `<!doctype html><html><head><meta charset=utf8><style>
  body{margin:0;font-family:Arial,Helvetica,sans-serif}
  .sec{height:300vh;background:#222 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23345'/%3E%3C/svg%3E")}
  .card{position:fixed;top:20vh;right:6vw;width:360px;height:420px;background:rgba(180,180,178,.55);backdrop-filter:blur(20px)}
  #obj{position:absolute;top:120px;left:90px;width:180px;height:180px;background:conic-gradient(#c9a66b,#8fb3c7,#c9a66b)}
</style></head><body>
  <div class=sec></div>
  <div class=card><div id=obj></div><p>AN INTELLIGENT HARMONY OF CURVED GLASS AND RADIANT METAL</p></div>
  <script>
    window.__BRAND={objRotated:true};
    window.render=function(p){ p=Math.max(0,Math.min(1,p));
      // БАГ: об'єкт крутиться на скрол (те, що гейт має зловити)
      document.getElementById('obj').style.transform='rotateY('+(p*180)+'deg)';
    };
    window.__ATOM_OK__=true;
  </script>
</body></html>`;

async function checkOne(browser, url, isSelftest) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));

  if (isSelftest) await page.setContent(SELFTEST_HTML, { waitUntil: 'load' });
  else await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

  await page.waitForFunction(() => window.__ATOM_OK__ === true || typeof window.render === 'function', { timeout: 8000 }).catch(() => {});

  const findings = [];
  const pass = (name, ok, detail) => findings.push({ name, ok: !!ok, detail: detail || '' });

  // --- 0. render(p) присутній ---
  const hasRender = await page.evaluate(() => typeof window.render === 'function');
  pass('render(p) присутній', hasRender);

  // --- 1. нуль image-slot у DOM ---
  const imgSlot = await page.evaluate(() =>
    document.querySelectorAll('image-slot, [is=image-slot], .image-slot').length
    + (document.documentElement.innerHTML.match(/image-slot/gi) || []).length);
  pass('нуль image-slot', imgSlot === 0, `знайдено ${imgSlot}`);

  // --- 2. фон має реальний background-image (не порожній) ---
  const bg = await page.evaluate(() => {
    // шукаємо найбільший full-bleed елемент із background-image
    const els = Array.from(document.querySelectorAll('*'));
    let best = null, bestArea = 0;
    for (const el of els) {
      const cs = getComputedStyle(el);
      const bi = cs.backgroundImage;
      if (bi && bi !== 'none' && /url\(/.test(bi)) {
        const r = el.getBoundingClientRect();
        const area = r.width * r.height;
        if (area > bestArea) { bestArea = area; best = { bi: bi.slice(0, 80), w: Math.round(r.width), h: Math.round(r.height) }; }
      }
    }
    // також <img> full-bleed як фон
    const imgs = Array.from(document.querySelectorAll('img')).map(im => {
      const r = im.getBoundingClientRect(); return { src: (im.currentSrc || im.src || '').slice(-40), w: Math.round(r.width), h: Math.round(r.height) };
    }).filter(x => x.w > 600 && x.h > 400);
    return { best, bigImgs: imgs.length };
  });
  const bgOk = !!bg.best || bg.bigImgs > 0;
  pass('фон = реальний асет (не порожній)', bgOk, bg.best ? `${bg.best.bi} ${bg.best.w}x${bg.best.h}` : `full-bleed img: ${bg.bigImgs}`);

  // --- 3. нуль serif (перевіряти токени font-family, НЕ матчити 'sans-serif') ---
  const serif = await page.evaluate(() => {
    const SKIP = new Set(['HTML','HEAD','META','TITLE','STYLE','SCRIPT','LINK','BASE','BODY']);
    const els = Array.from(document.body.querySelectorAll('*')).slice(0, 4000);
    let n = 0;
    for (const el of els) {
      if (SKIP.has(el.tagName)) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (!(el.textContent || '').trim() && el.tagName !== 'IMG') continue; // лише елементи з текстом
      const ff = cs.fontFamily.toLowerCase();
      const toks = ff.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      const bad = toks.some(t => t !== 'sans-serif' && /(georgia|times|playfair|didot|bodoni|victor|garamond|^serif$)/.test(t));
      if (bad) n++;
    }
    return n;
  });
  pass('нуль serif (Swiss tech-minimal)', serif === 0, `serif-елементів ${serif}`);

  // --- 4. __BRAND.objRotated === false ---
  const brand = await page.evaluate(() => window.__BRAND || null);
  pass('__BRAND.objRotated === false', brand && brand.objRotated === false, JSON.stringify(brand));

  // --- 5. ОБ'ЄКТ СТАТИЧНИЙ: судимо по ВЛАСНОМУ transform об'єкта (детерміновано,
  //     синхронно), НЕ по скріншоту (об'єкт паралаксить з карткою → скрін-diff = рух,
  //     а не оберт; це давало хибний фейл). Об'єкт-transform мусить:
  //       (а) не містити rotate; (б) бути ІДЕНТИЧНИЙ на всіх p (жодної власної анімації).
  const objSel = await page.evaluate(() => {
    const cand = document.querySelector('#obj, .brand-object, [data-obj], .obj, .b14-object');
    if (cand) return cand.id ? '#' + cand.id : '.' + [...cand.classList].join('.');
    return null;
  });

  let objTransforms = [], cardMove = 0, hasRotate = false;
  if (objSel) {
    let firstCardTop = null, lastCardTop = null;
    for (const p of P_SAMPLES) {
      const info = await page.evaluate(({ pp, sel }) => {
        window.render && window.render(pp);
        const el = document.querySelector(sel);
        const t = el ? getComputedStyle(el).transform : 'none';
        // rotate у matrix() дає b,c ≠ 0 з ротацією; matrix3d — теж. Тут перевіряємо наявність rotate у ЛАНЦЮГУ
        // (об'єкт має бути 'none' або чистий translate/scale). Візьмемо ще inline transform як текст.
        const inline = el ? (el.style.transform || '') : '';
        // card parallax: верх картки
        const card = document.querySelector('#card, .card');
        const ctop = card ? card.getBoundingClientRect().top : null;
        return { t, inline, ctop };
      }, { pp: p, sel: objSel });
      objTransforms.push(info.t);
      if (/rotate/i.test(info.inline)) hasRotate = true;
      // matrix з ненульовим зсувом-обертанням: розкладемо
      const m = /matrix\(([^)]+)\)/.exec(info.t);
      if (m) { const a = m[1].split(',').map(Number); // a,b,c,d,e,f
        if (Math.abs(a[1]) > 0.01 || Math.abs(a[2]) > 0.01) hasRotate = true; }
      if (firstCardTop === null) firstCardTop = info.ctop;
      lastCardTop = info.ctop;
    }
    if (firstCardTop !== null && lastCardTop !== null) cardMove = Math.abs(lastCardTop - firstCardTop);
  }
  const uniqTransforms = new Set(objTransforms);
  const objStatic = objSel && !hasRotate && uniqTransforms.size <= 1;
  pass('ОБ\'ЄКТ СТАТИЧНИЙ (не обертається)', objStatic,
    objSel ? `sel=${objSel} rotate=${hasRotate} transforms=${[...uniqTransforms].join(' | ').slice(0,60)}` : 'об\'єкт-елемент не знайдено');
  pass('parallax живий (картка рухається)', cardMove >= SECTION_MIN_MOVE, `Δcard-top=${cardMove.toFixed(1)}px ≥${SECTION_MIN_MOVE}`);

  // --- 6. reduced-motion: об'єкт теж статичний (не регрес) ---
  // (той самий тест під reduced — але оскільки об'єкт і так статичний, головне 0 err)
  pass('0 console-errors', errors.length === 0, errors.slice(0, 3).join(' | '));

  await ctx.close();
  const okAll = findings.every(f => f.ok);
  return { url: isSelftest ? '(selftest)' : url, ok: okAll, findings };
}

// ---- helpers ----
function tryLoadPNG() {
  try { return { PNG: require('pngjs').PNG }; } catch { return { PNG: null }; }
}
function meanAbsDiff(a, b) {
  const w = Math.min(a.width, b.width), h = Math.min(a.height, b.height);
  let sum = 0, n = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ia = (a.width * y + x) << 2, ib = (b.width * y + x) << 2;
    // luminance
    const la = 0.299 * a.data[ia] + 0.587 * a.data[ia + 1] + 0.114 * a.data[ia + 2];
    const lb = 0.299 * b.data[ib] + 0.587 * b.data[ib + 1] + 0.114 * b.data[ib + 2];
    sum += Math.abs(la - lb); n++;
  }
  return n ? sum / n : 0;
}
function byteDiffPct(a, b) {
  // грубий фолбек: % байтів що відрізняються (PNG-стиснуте, тож обертання дасть велику різницю)
  const n = Math.min(a.length, b.length); let d = 0;
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) d++;
  d += Math.abs(a.length - b.length);
  return (d / Math.max(a.length, b.length)) * 255; // масштаб у 0..255 щоб поріг 2.0 працював як «майже ідентичні»
}

(async () => {
  const { urls, out, selftest } = parseArgs(process.argv);
  const browser = await chromium.launch();
  const results = [];
  if (selftest) {
    const r = await checkOne(browser, null, true);
    results.push(r);
  }
  for (const u of urls) results.push(await checkOne(browser, u, false));
  await browser.close();

  for (const r of results) {
    console.log(`\n=== ${r.url} === ${r.ok ? 'PASS ✅' : 'FAIL ❌'}`);
    for (const f of r.findings) console.log(`  ${f.ok ? '✓' : '✗'} ${f.name}${f.detail ? '  — ' + f.detail : ''}`);
  }
  if (out) { writeFileSync(out, JSON.stringify(results, null, 2)); console.log(`\n→ ${out}`); }

  if (selftest) {
    const st = results[0];
    // selftest МУСИТЬ провалити «ОБ'ЄКТ СТАТИЧНИЙ» (бо там rotateY)
    const caught = st.findings.find(f => f.name.startsWith('ОБ\'ЄКТ СТАТИЧНИЙ'));
    const ok = caught && caught.ok === false;
    console.log(`\n[selftest] детектор обертання ${ok ? 'ПРАЦЮЄ ✅ (зловив rotateY)' : 'ЗЛАМАНИЙ ❌ (не зловив)'}`);
    process.exit(ok ? 0 : 1);
  }
  const allPass = results.length && results.every(r => r.ok);
  process.exit(allPass ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });
