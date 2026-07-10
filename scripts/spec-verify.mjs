/* ============================================================
   SPEC-VERIFY v1 (трек springs, S1) — звірка build-spec проти ЖИВОГО
   ------------------------------------------------------------
   v0 валідовано на air-about: 96.5% desktop / 99.7% mobile.
   v1 — конфіг-драйв (SITES з token-extractor), мультисекційний
   формат спеки: viewports.<vp>.sections.<id>.

   Відкриває живий сайт у тих же 2 вʼюпортах, знаходить ті ж секції,
   знімає ті ж метрики ТИМ САМИМ кодом (SNAPSHOT_FN), порівнює зі
   спекою. ЧИСЛОВИЙ ГЕЙТ: ≥95% метрик (точно або ≤1px) на КОЖНОМУ
   вʼюпорті — інакше exit 1.

   Живий скрол: Locomotive — знімаємо БЕЗ скролу (computed styles і
   bbox-відносно-секції НЕ залежать від видимості). Reveal-стан
   нормалізується тим самим NORMALIZE_CSS + finish() всіх WAAPI;
   lazy-фото форс-довантажуються.

   Матчинг дерев: класи ЖИВОГО фільтруються через МНОЖИНУ класів
   АРХІВУ — рантайм-стейт-класи (is-inited, --ready…) відпадають
   автоматично, без ручного регекса (пастка №2 AIR-валідації).

   Вихід: extraction/<site>/verify-report.json + VERIFY.md.

   Запуск:
     PLAYWRIGHT_FROM=/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json \
       node scripts/spec-verify.mjs <site>
   ============================================================ */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  resolveChromium, SNAPSHOT_FN, FORCE_IMAGES_FN, NORMALIZE_CSS,
  VIEWPORTS, MOBILE_UA, SITES, sectionsForViewport,
} from './token-extractor.mjs';
import { makeSig, matchTrees, compareNode, summarize } from './spec-compare-lib.mjs';

const GATE_PCT = 95;

/* ---- знімок ЖИВОГО: всі секції сайту в одному вʼюпорті ---- */
async function snapshotLive(browser, site, vpName) {
  const vp = VIEWPORTS[vpName];
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1,
    userAgent: vp.mobile ? MOBILE_UA : undefined,
    hasTouch: vp.mobile, isMobile: vp.mobile,
  });
  const page = await ctx.newPage();
  await page.goto(site.liveOrigin + site.livePath, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  for (const sel of ['.js-cookie-consent-accept', 'button:has-text("ACCEPT")']) {
    try { await page.click(sel, { timeout: 1200 }); break; } catch {}
  }
  await page.addStyleTag({ content: NORMALIZE_CSS });
  /* WAAPI: докрутити всі анімації в кінець — reveal не тримає стан */
  await page.evaluate(() => {
    try { document.getAnimations().forEach((a) => { try { a.finish(); } catch { a.cancel(); } }); } catch {}
  });
  await page.evaluate(() => document.fonts.ready);
  const sections = {};
  for (const s of sectionsForViewport(site, vpName)) {
    const args = { selector: s.selector, headingRegex: s.headingRegex, fontChecks: site.fontChecks };
    if (s.preCss) await page.addStyleTag({ content: s.preCss });
    await page.evaluate(FORCE_IMAGES_FN, args);
    await page.waitForTimeout(400);
    sections[s.id] = await page.evaluate(SNAPSHOT_FN, args);
  }
  await ctx.close();
  return sections;
}

/* матчинг/порівняння/підсумок — у spec-compare-lib.mjs (S2: спільна
   бібліотека, нею ж звіряє skeleton-verify) */

/* ---- main ---- */
const siteName = process.argv[2];
const site = SITES[siteName];
if (!site) { console.error(`вкажи сайт: node scripts/spec-verify.mjs <${Object.keys(SITES).join('|')}>`); process.exit(1); }
const spec = JSON.parse(readFileSync(join(site.outDir, 'build-spec.json'), 'utf8'));
const chromium = await resolveChromium();
if (!chromium) { console.error('playwright не резолвиться (PLAYWRIGHT_FROM?)'); process.exit(1); }
const browser = await chromium.launch();

const report = { at: new Date().toISOString(), site: siteName, live: site.liveOrigin + site.livePath, specAt: spec.at, gatePct: GATE_PCT, viewports: {} };
let gateFailed = false;
for (const vpName of Object.keys(VIEWPORTS)) {
  console.log(`live → ${vpName} ${VIEWPORTS[vpName].width}x${VIEWPORTS[vpName].height}…`);
  const liveSections = await snapshotLive(browser, site, vpName);
  const vpReport = { sections: {} };
  const vpDeltas = [];
  for (const s of sectionsForViewport(site, vpName)) {
    const specSnap = spec.viewports[vpName].sections[s.id];
    const liveSnap = liveSections[s.id];
    if (!specSnap || specSnap.error || !liveSnap || liveSnap.error) {
      console.error(`  [${s.id}] ПОМИЛКА: spec=${specSnap?.error || 'ok'} live=${liveSnap?.error || 'ok'}`);
      gateFailed = true;
      vpReport.sections[s.id] = { error: { spec: specSnap?.error, live: liveSnap?.error } };
      continue;
    }
    const sig = makeSig(specSnap.tree, liveSnap.tree);
    const out = { pairs: [], onlyArchive: [], onlyLive: [] };
    matchTrees(specSnap.tree, liveSnap.tree, s.id, out, sig);
    const deltas = [];
    for (const p of out.pairs) compareNode(p, deltas);
    const summary = summarize(deltas);
    vpDeltas.push(...deltas);
    const worst = deltas.filter((d) => (d.kind === 'num' && Math.abs(d.delta) > 1) || (d.kind === 'str' && d.delta === null))
      .sort((x, y) => Math.abs(y.delta || 0) - Math.abs(x.delta || 0));
    vpReport.sections[s.id] = {
      matchedElements: out.pairs.length,
      specElements: specSnap.elementCount, liveElements: liveSnap.elementCount,
      onlyArchive: out.onlyArchive, onlyLive: out.onlyLive,
      liveSelfCheck: liveSnap.selfCheck, summary, divergences: worst.slice(0, 40),
    };
    console.log(`  [${s.id}] зматчено ${out.pairs.length} (архів ${specSnap.elementCount}/живе ${liveSnap.elementCount}) · метрик ${summary.total} · точно ${summary.exact} · ≤1px ${summary.within1px} · розійшлось ${summary.diverged + summary.strMismatch} → ${summary.okPct}%`);
  }
  const vpSummary = summarize(vpDeltas);
  vpReport.summary = vpSummary;
  report.viewports[vpName] = vpReport;
  const pass = vpSummary.okPct >= GATE_PCT;
  if (!pass) gateFailed = true;
  console.log(`  ${vpName} РАЗОМ: ${vpSummary.okPct}% (гейт ${GATE_PCT}%) → ${pass ? 'PASS' : 'FAIL'}`);
}
await browser.close();

writeFileSync(join(site.outDir, 'verify-report.json'), JSON.stringify(report, null, 1));

/* ---- VERIFY.md ---- */
const md = [];
md.push(`# VERIFY — build-spec (архів) vs живий ${report.live}`);
md.push('');
md.push(`- Дата: ${report.at}`);
md.push(`- Секції: ${Object.entries(spec.sections || {}).map(([k, v]) => `**${k}** (${v})`).join(' · ')}`);
md.push(`- Метод: той самий SNAPSHOT_FN на обох; без скролу живого; reveal нормалізовано NORMALIZE_CSS + WAAPI finish(); lazy-фото форс-довантажені; класи фільтруються через ПЕРЕТИН множин класів архіву й живого.`);
md.push(`- ⚠️ Метрики «забруднені» анімацією (порівнюються в нормалізованому стані): opacity, transform.`);
md.push(`- ЧИСЛОВИЙ ГЕЙТ: ≥${GATE_PCT}% (точно ≤0.1px або ≤1px) на кожному вʼюпорті.`);
md.push('');
for (const [vpName, v] of Object.entries(report.viewports)) {
  const s = v.summary;
  md.push(`## ${vpName} (${VIEWPORTS[vpName].width}x${VIEWPORTS[vpName].height}) — **${s.okPct}%** ${s.okPct >= GATE_PCT ? '✅ PASS' : '❌ FAIL'}`);
  md.push('');
  md.push(`Метрик всього: ${s.total} · точно (≤0.1): ${s.exact} · в межах 1px: ${s.within1px} · розійшлося числом (>1px): ${s.diverged} · розійшлося рядком: ${s.strMismatch}`);
  md.push('');
  for (const [secId, sec] of Object.entries(v.sections)) {
    if (sec.error) { md.push(`### ${secId} — ПОМИЛКА: ${JSON.stringify(sec.error)}`); md.push(''); continue; }
    const ss = sec.summary;
    md.push(`### ${secId} — ${ss.okPct}%`);
    md.push('');
    md.push(`Зматчено: ${sec.matchedElements} (архів ${sec.specElements} / живе ${sec.liveElements}) · лише-в-архіві: ${sec.onlyArchive.length} · лише-в-живому: ${sec.onlyLive.length} · метрик ${ss.total} · розійшлося ${ss.diverged + ss.strMismatch}`);
    md.push('');
    if (sec.divergences.length) {
      md.push('| елемент | метрика | архів | живе | Δ |');
      md.push('|---|---|---|---|---|');
      for (const d of sec.divergences.slice(0, 15)) {
        const cut = (x) => String(x ?? '').length > 48 ? String(x).slice(0, 45) + '…' : String(x ?? '');
        md.push(`| ${cut(d.path).replace(/\|/g, '\\|')} | ${d.metric}${d.anim ? ' ⚠️anim' : ''} | ${cut(d.archive)} | ${cut(d.live)} | ${d.delta ?? '≠'} |`);
      }
      md.push('');
    }
    if (sec.onlyArchive.length) md.push(`Лише в архіві: ${sec.onlyArchive.slice(0, 8).map((x) => `\`${x.slice(-60).replace(/\|/g, '·')}\``).join(', ')}`);
    if (sec.onlyLive.length) md.push(`Лише в живому: ${sec.onlyLive.slice(0, 8).map((x) => `\`${x.slice(-60).replace(/\|/g, '·')}\``).join(', ')}`);
    md.push('');
  }
}
md.push('## Вердикт');
md.push('');
md.push(gateFailed ? '❌ ГЕЙТ НЕ ПРОЙДЕНО — аналізуй розбіжності, добудовуй ЕКСТРАКТОР (не очі).' : `✅ Гейт ≥${GATE_PCT}% пройдено на всіх вʼюпортах.`);
md.push('');
writeFileSync(join(site.outDir, 'VERIFY.md'), md.join('\n'));
console.log(`OK → ${join(site.outDir, 'verify-report.json')} + VERIFY.md${gateFailed ? ' · ГЕЙТ FAIL' : ' · ГЕЙТ PASS'}`);
process.exit(gateFailed ? 1 : 0);
