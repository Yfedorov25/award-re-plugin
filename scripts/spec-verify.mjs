/* ============================================================
   SPEC-VERIFY v0 (сесія 20, МІКРО-2) — звірка build-spec проти ЖИВОГО
   ------------------------------------------------------------
   Відкриває живий https://aircenter.space/about у тих же 2 вʼюпортах,
   знаходить ту ж architecture-секцію, знімає ті ж метрики ТИМ САМИМ
   кодом (SNAPSHOT_FN з token-extractor.mjs), і порівнює з
   extraction/air-about/build-spec.json.

   Живий скрол: сторінка на Locomotive — знімаємо БЕЗ скролу
   (computed styles і bbox-відносно-секції НЕ залежать від видимості).
   Reveal-стан нормалізується тим самим NORMALIZE_CSS + finish()
   всіх WAAPI-анімацій; lazy-фото форс-довантажуються.
   Метрики opacity/transform/filter — «нормалізовані», позначені
   у звіті як animation-sensitive.

   Вихід: extraction/air-about/verify-report.json + VERIFY.md.

   Запуск:
     PLAYWRIGHT_FROM=/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json \
       node scripts/spec-verify.mjs
   ============================================================ */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  resolveChromium, SNAPSHOT_FN, FORCE_IMAGES_FN, NORMALIZE_CSS,
  VIEWPORTS, MOBILE_UA, OUT_DIR,
} from './token-extractor.mjs';

const LIVE_URL = 'https://aircenter.space/about';
const ANIMATION_SENSITIVE = new Set(['opacity', 'transform']);

/* ---- знімок ЖИВОГО в одному вʼюпорті ---- */
async function snapshotLive(browser, vpName) {
  const vp = VIEWPORTS[vpName];
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1,
    userAgent: vp.mobile ? MOBILE_UA : undefined,
    hasTouch: vp.mobile, isMobile: vp.mobile,
  });
  const page = await ctx.newPage();
  await page.goto(LIVE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  try { await page.click('button:has-text("ACCEPT")', { timeout: 1500 }); } catch {}
  await page.addStyleTag({ content: NORMALIZE_CSS });
  /* WAAPI: докрутити всі анімації в кінець — reveal не тримає стан */
  await page.evaluate(() => {
    try { document.getAnimations().forEach((a) => { try { a.finish(); } catch { a.cancel(); } }); } catch {}
  });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(FORCE_IMAGES_FN);
  await page.waitForTimeout(1000);
  const snap = await page.evaluate(SNAPSHOT_FN);
  await ctx.close();
  return snap;
}

/* ---- матчинг дерев: за сигнатурою tag+класи+текст, у порядку.
   JS-стейт-класи (--ready, is-inited, is-active…) ігноруються —
   живий DOM їх додає в рантаймі, архів без JS — ні. ---- */
const STATE_CLS = /--ready$|^is-inited|^is-active|^is-visible|^is-revealed|^has-/;
const sig = (n) => `${n.tag}|${(n.cls || '').split(' ').filter((c) => c && !STATE_CLS.test(c)).slice(0, 3).join(' ')}|${(n.text || '').slice(0, 24)}`;

function matchTrees(a, b, path, out) {
  out.pairs.push({ path, a, b });
  const ak = a.children || [], bk = b.children || [];
  const usedB = new Set();
  ak.forEach((ac, i) => {
    let j = -1;
    if (bk[i] && !usedB.has(i) && sig(bk[i]) === sig(ac)) j = i;
    else j = bk.findIndex((bc, k) => !usedB.has(k) && sig(bc) === sig(ac));
    if (j === -1) j = bk.findIndex((bc, k) => !usedB.has(k) && bc.tag === ac.tag && bc.cls === ac.cls);
    if (j === -1) { out.onlyArchive.push(`${path}>${sig(ac)}`); return; }
    usedB.add(j);
    matchTrees(ac, bk[j], `${path}>${ac.tag}${i ? `[${i}]` : ''}`, out);
  });
  bk.forEach((bc, k) => { if (!usedB.has(k)) out.onlyLive.push(`${path}>${sig(bc)}`); });
}

/* ---- порівняння метрик одної пари ---- */
const PX = /^-?\d+(\.\d+)?px$/;
function compareNode(pair, deltas) {
  const { path, a, b } = pair;
  const label = `${path} ${a.text ? `"${a.text.slice(0, 30)}"` : a.cls.split(' ')[0]}`;
  for (const m of ['x', 'y', 'w', 'h']) {
    deltas.push({ path: label, metric: `box.${m}`, archive: a.box[m], live: b.box[m],
      delta: Math.round((a.box[m] - b.box[m]) * 10) / 10, kind: 'num' });
  }
  const keys = new Set([...Object.keys(a.styles), ...Object.keys(b.styles)]);
  for (const k of keys) {
    const av = a.styles[k], bv = b.styles[k];
    if (av === bv) { deltas.push({ path: label, metric: k, archive: av, live: bv, delta: 0, kind: 'num' }); continue; }
    if (PX.test(av || '') && PX.test(bv || '')) {
      deltas.push({ path: label, metric: k, archive: av, live: bv,
        delta: Math.round((parseFloat(av) - parseFloat(bv)) * 10) / 10, kind: 'num',
        anim: ANIMATION_SENSITIVE.has(k) || undefined });
    } else {
      deltas.push({ path: label, metric: k, archive: av, live: bv, delta: null, kind: 'str',
        anim: ANIMATION_SENSITIVE.has(k) || undefined });
    }
  }
  if (a.img && b.img) {
    deltas.push({ path: label, metric: 'img.src', archive: a.img.src, live: b.img.src,
      delta: a.img.src === b.img.src ? 0 : null, kind: a.img.src === b.img.src ? 'num' : 'str' });
    deltas.push({ path: label, metric: 'img.naturalW', archive: a.img.naturalW, live: b.img.naturalW,
      delta: a.img.naturalW - b.img.naturalW, kind: 'num' });
  }
}

function summarize(deltas) {
  const s = { exact: 0, within1px: 0, diverged: 0, strMismatch: 0, animSensitiveDiverged: 0 };
  for (const d of deltas) {
    if (d.kind === 'str' && d.delta === null) {
      s.strMismatch++; if (d.anim) s.animSensitiveDiverged++; continue;
    }
    const ad = Math.abs(d.delta || 0);
    if (ad <= 0.1) s.exact++;
    else if (ad <= 1) s.within1px++;
    else { s.diverged++; if (d.anim) s.animSensitiveDiverged++; }
  }
  s.total = deltas.length;
  s.okPct = Math.round(((s.exact + s.within1px) / s.total) * 1000) / 10;
  return s;
}

/* ---- main ---- */
const spec = JSON.parse(readFileSync(join(OUT_DIR, 'build-spec.json'), 'utf8'));
const chromium = await resolveChromium();
if (!chromium) { console.error('playwright не резолвиться (PLAYWRIGHT_FROM?)'); process.exit(1); }
const browser = await chromium.launch();

const report = { at: new Date().toISOString(), live: LIVE_URL, specAt: spec.at, viewports: {} };
for (const vpName of Object.keys(VIEWPORTS)) {
  console.log(`live → ${vpName} ${VIEWPORTS[vpName].width}x${VIEWPORTS[vpName].height}…`);
  const liveSnap = await snapshotLive(browser, vpName);
  if (liveSnap.error) { console.error(`  ПОМИЛКА: ${liveSnap.error}`); process.exit(1); }
  const sc = liveSnap.selfCheck;
  console.log(`  елементів: ${sc.elements} · Onest: ${sc.fontOnestLoaded} · фото: ${sc.imagesWithNaturalSize}/${sc.images}`);
  const out = { pairs: [], onlyArchive: [], onlyLive: [] };
  matchTrees(spec.viewports[vpName].tree, liveSnap.tree, 'section', out);
  const deltas = [];
  for (const p of out.pairs) compareNode(p, deltas);
  const summary = summarize(deltas);
  const worst = deltas.filter((d) => (d.kind === 'num' && Math.abs(d.delta) > 1) || (d.kind === 'str' && d.delta === null))
    .sort((x, y) => Math.abs(y.delta || 0) - Math.abs(x.delta || 0));
  report.viewports[vpName] = {
    matchedElements: out.pairs.length,
    onlyArchive: out.onlyArchive, onlyLive: out.onlyLive,
    liveSelfCheck: sc, summary, divergences: worst,
  };
  console.log(`  зматчено ${out.pairs.length} елементів · метрик ${summary.total} · точно ${summary.exact} · ≤1px ${summary.within1px} · розійшлось ${summary.diverged + summary.strMismatch} (${summary.okPct}% ok)`);
}
await browser.close();

writeFileSync(join(OUT_DIR, 'verify-report.json'), JSON.stringify(report, null, 1));

/* ---- VERIFY.md ---- */
const md = [];
md.push('# VERIFY — build-spec (архів) vs живий aircenter.space/about');
md.push('');
md.push(`- Дата: ${report.at}`);
md.push(`- Секція: ${spec.section}`);
md.push(`- Метод: той самий SNAPSHOT_FN на обох; без скролу живого (computed styles/bbox-відносно-секції не залежать від видимості); reveal нормалізовано NORMALIZE_CSS + WAAPI finish(); lazy-фото форс-довантажені.`);
md.push(`- ⚠️ Метрики «забруднені» анімацією (порівнюються в нормалізованому стані): opacity, transform.`);
md.push('');
for (const [vpName, v] of Object.entries(report.viewports)) {
  const s = v.summary;
  md.push(`## ${vpName} (${VIEWPORTS[vpName].width}x${VIEWPORTS[vpName].height})`);
  md.push('');
  md.push(`Зматчено елементів: ${v.matchedElements} · лише-в-архіві: ${v.onlyArchive.length} · лише-в-живому: ${v.onlyLive.length}`);
  md.push(`Метрик всього: ${s.total} · точно (≤0.1): ${s.exact} · в межах 1px: ${s.within1px} · розійшлося числом (>1px): ${s.diverged} · розійшлося рядком: ${s.strMismatch} → **${s.okPct}% збіг**`);
  md.push('');
  md.push('Найбільші розбіжності:');
  md.push('');
  md.push('| елемент | метрика | архів | живе | Δ |');
  md.push('|---|---|---|---|---|');
  for (const d of v.divergences.slice(0, 20)) {
    const cut = (x) => String(x ?? '').length > 48 ? String(x).slice(0, 45) + '…' : String(x ?? '');
    md.push(`| ${cut(d.path).replace(/\|/g, '\\|')} | ${d.metric}${d.anim ? ' ⚠️anim' : ''} | ${cut(d.archive)} | ${cut(d.live)} | ${d.delta ?? '≠'} |`);
  }
  if (v.onlyArchive.length) { md.push(''); md.push(`Лише в архіві: ${v.onlyArchive.slice(0, 8).map((x) => `\`${x.slice(-60)}\``).join(', ')}`); }
  if (v.onlyLive.length) { md.push(`Лише в живому: ${v.onlyLive.slice(0, 8).map((x) => `\`${x.slice(-60)}\``).join(', ')}`); }
  md.push('');
}
md.push('## Вердикт');
md.push('');
md.push('_(заповнюється після аналізу розбіжностей — див. фінальний блок нижче)_');
md.push('');
writeFileSync(join(OUT_DIR, 'VERIFY.md'), md.join('\n'));
console.log(`OK → ${join(OUT_DIR, 'verify-report.json')} + VERIFY.md`);
