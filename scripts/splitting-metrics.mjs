/* ============================================================
   SPLITTING-METRICS (трек springs, S13b) — гліф-позиції текстів
   ------------------------------------------------------------
   Проблема (розкопки S12): ~15px вертикальний ghost великих текстів
   (h1 hero, капшени wellness/nature) при ВЕРБАТИМ-ТОЧНОМУ bbox
   (h1: 593/660 live==ours). Корінь: live рендерить текст через
   span-чари splitting (рантайм ріже на .word/.char inline-block'и —
   ІНША лінійна метрика/line-box), скелет — плейн-текст з тим самим
   CSS. Зсув гліфів живе ВСЕРЕДИНІ боксу.

   Метод: обидва боки міряються Range API по ПЕРШОМУ видимому
   символу тексту: glyphRel = rangeRect.top − elementRect.top
   (і left). Поправка dy/dx = glyphRel_live − glyphRel_ours,
   матчинг за нормалізованим текст-префіксом (унікальний на сторінці).
   Жодного ручного числа — тільки виміряні дельти.

   Вихід: extraction/<site>/splitting-metrics.json
     { entries: [{text, tag, cls, dy, dx, liveRel, oursRel}] }
   Движок: el.style.translate = "dx dy" (КОМПОЗИТНИЙ канал — не
   конфліктує зі style.transform біндінгів).

   Запуск: PLAYWRIGHT_FROM=... node scripts/splitting-metrics.mjs \
     springs-home [--ours http://localhost:8873] [--origin URL]
   ============================================================ */
import { writeFileSync } from 'fs';
import { join } from 'path';
import { resolveChromium, SITES, VIEWPORTS } from './token-extractor.mjs';

const siteName = process.argv[2];
const site = SITES[siteName];
if (!site) { console.error(`вкажи: node scripts/splitting-metrics.mjs <${Object.keys(SITES).join('|')}>`); process.exit(1); }
const argOf = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const origin = argOf('--origin', site.liveOrigin);
const oursOrigin = argOf('--ours', 'http://localhost:8873');

const chromium = await resolveChromium();
if (!chromium) { console.error('playwright не резолвиться'); process.exit(1); }

/* live: всі splitting-елементи → glyphRel першого символу.
   Range по ПЕРШОМУ текст-вузлу вглиб (у splitting це текст у
   span.char); rect range = ascent-box гліфа. */
const LIVE_FN = () => {
  const out = [];
  const firstTextNode = (el) => {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    return w.nextNode();
  };
  for (const el of document.querySelectorAll('.splitting')) {
    const r = el.getBoundingClientRect();
    if (r.width < 5 || r.height < 5) continue;
    const tn = firstTextNode(el);
    if (!tn) continue;
    const rg = document.createRange();
    const raw = tn.textContent;
    const i0 = raw.search(/\S/);
    rg.setStart(tn, i0); rg.setEnd(tn, i0 + 1);
    const gr = rg.getBoundingClientRect();
    if (gr.height < 2) continue;
    const norm = (s) => s.replace(/\s+/g, ' ').trim();
    out.push({
      tag: el.tagName.toLowerCase(),
      cls: (el.className || '').toString().trim().split(/\s+/).slice(0, 6).join(' '),
      text: norm(el.textContent).slice(0, 60),
      relTop: Math.round((gr.top - r.top) * 10) / 10,
      relLeft: Math.round((gr.left - r.left) * 10) / 10,
      fs: getComputedStyle(el).fontSize,
      h: Math.round(r.height),
    });
  }
  return out;
};

/* ours: матчинг за текст-префіксом по ВСІХ елементах вʼюпорт-варіанта;
   беремо НАЙГЛИБШИЙ елемент, чий text починається з префікса */
const OURS_FN = (args) => {
  const { wanted, vpCls } = args;
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const firstTextNode = (el) => {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    return w.nextNode();
  };
  const all = [...document.querySelectorAll(`.${vpCls} *`)];
  return wanted.map((w2) => {
    const pref = w2.text.slice(0, 24);
    let best = null;
    for (const el of all) {
      if (!norm(el.textContent).startsWith(pref)) continue;
      if (!best || el.contains(best) === false && best.contains(el)) best = el;
      else if (best.contains(el)) best = el; /* глибший */
    }
    if (!best) return null;
    const r = best.getBoundingClientRect();
    if (r.width < 5 || r.height < 2) return null;
    const tn = firstTextNode(best);
    if (!tn) return null;
    const rg = document.createRange();
    const raw = tn.textContent;
    const i0 = raw.search(/\S/);
    rg.setStart(tn, i0); rg.setEnd(tn, i0 + 1);
    const gr = rg.getBoundingClientRect();
    if (gr.height < 2) return null;
    return {
      relTop: Math.round((gr.top - r.top) * 10) / 10,
      relLeft: Math.round((gr.left - r.left) * 10) / 10,
      cls: (best.className || '').toString().slice(0, 60),
      h: Math.round(r.height),
    };
  });
};

const browser = await chromium.launch();
const result = { at: new Date().toISOString(), site: siteName, viewports: {} };
let failed = false;
for (const vpName of Object.keys(VIEWPORTS)) {
  const vp = VIEWPORTS[vpName];
  /* live */
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, hasTouch: vp.mobile, isMobile: vp.mobile });
  const page = await ctx.newPage();
  await page.goto(origin + site.livePath, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => {
    const p = document.querySelector('.js-preloader');
    return !p || getComputedStyle(p).display === 'none' || parseFloat(getComputedStyle(p).opacity) < 0.05;
  }, { timeout: 25000 }).catch(() => {});
  /* 12с: char-reveal live (ty=143 mid-фаза) осідає до ty=0 — міряти
     ЛИШЕ пізню фазу (та сама дисципліна, що інтро-пози, пастка 49) */
  await page.waitForTimeout(12000);
  const liveEntries = await page.evaluate(LIVE_FN);
  await ctx.close();
  /* ours */
  const ctx2 = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, hasTouch: vp.mobile, isMobile: vp.mobile });
  const page2 = await ctx2.newPage();
  /* splitfix=0: обгортки .sk-splitfix існують, translate нульовий — міряємо фінальну структуру */
  await page2.goto(`${oursOrigin}/?s=0&splitfix=0`, { waitUntil: 'load', timeout: 30000 });
  await page2.waitForTimeout(1500);
  const oursEntries = await page2.evaluate(OURS_FN, { wanted: liveEntries, vpCls: `sk-vp-${vpName}` });
  await ctx2.close();

  const entries = [];
  liveEntries.forEach((le, i) => {
    const oe = oursEntries[i];
    if (!oe) return;
    entries.push({
      tag: le.tag, cls: le.cls, text: le.text, fs: le.fs,
      liveRel: { top: le.relTop, left: le.relLeft },
      oursRel: { top: oe.relTop, left: oe.relLeft },
      dy: Math.round((le.relTop - oe.relTop) * 10) / 10,
      dx: Math.round((le.relLeft - oe.relLeft) * 10) / 10,
    });
  });
  const matched = entries.length;
  console.log(`${vpName}: splitting live=${liveEntries.length} · зматчено ${matched} · |dy|>2: ${entries.filter((e) => Math.abs(e.dy) > 2).length}`);
  for (const e of entries.filter((e2) => Math.abs(e2.dy) > 2).slice(0, 8)) {
    console.log(`  dy=${e.dy} dx=${e.dx} fs=${e.fs} · ${(e.text || '').slice(0, 40)}`);
  }
  if (!matched && liveEntries.length) failed = true;
  result.viewports[vpName] = { entries, liveCount: liveEntries.length };
}
await browser.close();
const out = join(site.outDir, 'splitting-metrics.json');
writeFileSync(out, JSON.stringify(result));
console.log(`OK → ${out}`);
process.exit(failed ? 1 : 0);
