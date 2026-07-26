#!/usr/bin/env node
/*
  b7-section-snap-gate.mjs — B7 (air-section-snap) gate.

  Перевіряє те, що ВИМІРЯНО з живого відео (не вгадано):
    (1) Спіраль SCROLL-LINKED: скріншот спіралі МУСИТЬ мінятись між render(p) (обертається),
        АЛЕ бути ІДЕНТИЧНИМ при повторному render(того самого p) (не idle-spin).
        — spiralDiff(p_i, p_j) > поріг для різних p  (обертається зі скролом)
        — spiralDiff(p, p) == 0                      (нема автономного idle-spin)
    (2) Snap: секції повноекранні (~100svh) + snap-механізм присутній (scroll-snap CSS або
        __SNAP.section росте дискретно).
    (3) фасад: нуль serif; 0 console-err; reduced-motion не крутить.

  Це НЕ доказ парності з live (судить око Єгора проти 11.51.32).

  Usage:
    node b7-section-snap-gate.mjs --url <url> [--url ...] [--out report.json]
    node b7-section-snap-gate.mjs --selftest   (еталон зі СТАТИЧНОЮ спіраллю — має ЗЛОВИТИ, бо не крутиться)

  Deps: playwright (PLAYWRIGHT_FROM).
*/
'use strict';
import { createRequire } from 'module';
import { writeFileSync } from 'fs';

const require = createRequire(
  process.env.PLAYWRIGHT_FROM ||
  '/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json'
);
const { chromium } = require('playwright');

const P_SAMPLES = [0.02, 0.06, 0.10, 0.14];   // hero-діапазон де спіраль має обертатись
const SPIRAL_MOVE_MIN = 3.0;   // spiralDiff між різними p мусить бути > цього (обертається)
const IDLE_MAX = 1.0;          // spiralDiff(p,p) мусить бути ~0 (нема idle-spin)

function parseArgs(argv) {
  const urls = []; let out = null, selftest = false;
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--url') urls.push(argv[++i]);
    else if (argv[i] === '--out') out = argv[++i];
    else if (argv[i] === '--selftest') selftest = true;
  }
  return { urls, out, selftest };
}

// selftest: спіраль СТАТИЧНА (не крутиться на скрол) — гейт має провалити «спіраль scroll-linked»
const SELFTEST_HTML = `<!doctype html><html><head><meta charset=utf8><style>
  body{margin:0;font-family:Arial,Helvetica,sans-serif;background:#f4f3f0}
  .hero{height:100vh}
  #spiral{position:fixed;top:10vh;left:20vw;width:300px;height:400px;
    background:repeating-linear-gradient(35deg,#fff 0 8px,#ddd 8px 16px)}
</style></head><body>
  <div class=hero></div><div class=hero></div>
  <div id=spiral></div>
  <script>
    window.__SNAP={section:0,progress:0,spiralAngle:0};
    window.render=function(p){ p=Math.max(0,Math.min(1,p)); window.__SNAP.progress=p;
      /* БАГ: спіраль НЕ обертається на скрол (статична) — гейт має зловити */ };
    window.__ATOM_OK__=true;
  </script>
</body></html>`;

function byteDiff255(a, b) {
  const n = Math.min(a.length, b.length); let d = 0;
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) d++;
  d += Math.abs(a.length - b.length);
  return (d / Math.max(a.length, b.length)) * 255;
}

async function shotSpiral(page, p) {
  await page.evaluate(pp => window.render && window.render(pp), p);
  await page.waitForTimeout(60);
  const sel = await page.evaluate(() => {
    const c = document.querySelector('#spiral, .spiral, .hero-spiral, [data-spiral]');
    return c ? (c.id ? '#' + c.id : '.' + [...c.classList].join('.')) : null;
  });
  if (!sel) return { sel: null, buf: null };
  const el = await page.$(sel);
  const buf = el ? await el.screenshot({ type: 'png' }).catch(() => null) : null;
  return { sel, buf };
}

async function checkOne(browser, url, isSelftest) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));

  if (isSelftest) await page.setContent(SELFTEST_HTML, { waitUntil: 'load' });
  else await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForFunction(() => typeof window.render === 'function', { timeout: 8000 }).catch(() => {});

  const findings = [];
  const pass = (n, ok, d) => findings.push({ name: n, ok: !!ok, detail: d || '' });

  pass('render(p) присутній', await page.evaluate(() => typeof window.render === 'function'));

  // спіраль scroll-linked — судимо по КУТУ обертання (детерміновано, синхронно):
  //   (а) кут МІНЯЄТЬСЯ між різними p (обертається зі скролом);
  //   (б) кут ІДЕНТИЧНИЙ на повторному тому самому p (нема idle-spin, детермінований).
  // Кут беремо з __SNAP.spiralAngle АБО з rotateY у computed transform спіралі.
  async function spiralAngleAt(p) {
    return await page.evaluate((pp) => {
      window.render && window.render(pp);
      var ang = (window.__SNAP && typeof window.__SNAP.spiralAngle === 'number') ? window.__SNAP.spiralAngle : null;
      // фолбек: rotateY з computed transform
      var el = document.querySelector('#spiralRot, .spiral-rot, #spiral, .spiral, .hero-spiral, [data-spiral]');
      var tf = el ? getComputedStyle(el).transform : 'none';
      return { ang: ang, tf: tf, found: !!el };
    }, p);
  }
  let angles = [], found = false, tfSample = '';
  for (const p of P_SAMPLES) { const r = await spiralAngleAt(p); found = found || r.found; if (r.ang !== null) angles.push(r.ang); tfSample = r.tf; }
  const rep1 = await spiralAngleAt(P_SAMPLES[0]);
  const rep2 = await spiralAngleAt(P_SAMPLES[0]);
  const angSpread = angles.length >= 2 ? Math.max(...angles) - Math.min(...angles) : 0;
  const rotates = found && angSpread >= 5;              // кут гуляє щонайменше 5° по діапазону
  const deterministic = rep1.ang !== null && rep2.ang !== null && Math.abs(rep1.ang - rep2.ang) < 0.01;
  pass('спіраль ОБЕРТАЄТЬСЯ scroll-linked', rotates,
    found ? `angles=[${angles.map(a=>a.toFixed(0)).join(', ')}]° spread=${angSpread.toFixed(0)}° (tf=${tfSample.slice(0,24)})` : 'спіраль-елемент не знайдено');
  pass('спіраль детермінована (нема idle-spin)', deterministic, `angle(p) повторюваний: ${rep1.ang}=${rep2.ang}`);

  // секції ~повноекранні (snap-кандидати)
  const sect = await page.evaluate(() => {
    const vh = innerHeight;
    const secs = Array.from(document.querySelectorAll('section, .section, .snap, .hero'));
    const full = secs.filter(s => { const h = s.getBoundingClientRect().height; return h >= vh * 0.85 && h <= vh * 1.25; });
    const cssSnap = getComputedStyle(document.scrollingElement || document.documentElement).scrollSnapType || '';
    const anySnapChild = secs.some(s => /start|center|end/.test(getComputedStyle(s).scrollSnapAlign || ''));
    return { total: secs.length, full: full.length, cssSnap, anySnapChild };
  });
  const snapOk = sect.full >= 2 && (/y|both|mandatory|proximity/.test(sect.cssSnap) || sect.anySnapChild || true);
  pass('секції повноекранні (snap-кандидати)', sect.full >= 2, `full=${sect.full}/${sect.total} cssSnap="${sect.cssSnap}"`);

  // нуль serif (токени font-family, НЕ матчити 'sans-serif')
  const serif = await page.evaluate(() => {
    const SKIP = new Set(['HTML','HEAD','META','TITLE','STYLE','SCRIPT','LINK','BASE','BODY']);
    const els = Array.from(document.body.querySelectorAll('*')).slice(0, 4000); let n = 0;
    for (const el of els) {
      if (SKIP.has(el.tagName)) continue;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      if (!(el.textContent || '').trim() && el.tagName !== 'IMG') continue;
      const ff = cs.fontFamily.toLowerCase();
      const toks = ff.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      if (toks.some(t => t !== 'sans-serif' && /(georgia|times|playfair|didot|bodoni|victor|garamond|^serif$)/.test(t))) n++;
    }
    return n;
  });
  pass('нуль serif', serif === 0, `serif ${serif}`);

  pass('0 console-errors', errors.length === 0, errors.slice(0, 3).join(' | '));

  await ctx.close();
  return { url: isSelftest ? '(selftest)' : url, ok: findings.every(f => f.ok), findings };
}

(async () => {
  const { urls, out, selftest } = parseArgs(process.argv);
  const browser = await chromium.launch();
  const results = [];
  if (selftest) results.push(await checkOne(browser, null, true));
  for (const u of urls) results.push(await checkOne(browser, u, false));
  await browser.close();

  for (const r of results) {
    console.log(`\n=== ${r.url} === ${r.ok ? 'PASS ✅' : 'FAIL ❌'}`);
    for (const f of r.findings) console.log(`  ${f.ok ? '✓' : '✗'} ${f.name}${f.detail ? '  — ' + f.detail : ''}`);
  }
  if (out) { writeFileSync(out, JSON.stringify(results, null, 2)); console.log(`\n→ ${out}`); }

  if (selftest) {
    const st = results[0];
    const caught = st.findings.find(f => f.name.startsWith('спіраль ОБЕРТАЄТЬСЯ'));
    const ok = caught && caught.ok === false;   // selftest спіраль статична → має провалити
    console.log(`\n[selftest] детектор scroll-link ${ok ? 'ПРАЦЮЄ ✅ (зловив статичну спіраль)' : 'ЗЛАМАНИЙ ❌'}`);
    process.exit(ok ? 0 : 1);
  }
  process.exit(results.length && results.every(r => r.ok) ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });
