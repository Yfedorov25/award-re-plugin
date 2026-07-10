/* ============================================================
   SKELETON-VERIFY (трек springs, S2c) — гейт КАРКАСА проти build-spec
   ------------------------------------------------------------
   Піднімає library/combos/<site>/index.html на тому ж фейковому
   origin (шрифти з дзеркала, фото проксі з живого), знімає ТИМ САМИМ
   SNAPSHOT_FN ті самі секції в тих самих 2 вʼюпортах і звіряє проти
   build-spec ТИМ САМИМ spec-compare-lib.

   ГЕЙТ ЖОРСТКІШИЙ, ніж у spec-verify: ≥95% НА КОЖНІЙ СЕКЦІЇ
   (каркас генерований зі спеки — розбіжність означає дірку генератора).

   Вихід: extraction/<site>/skeleton-report.json + SKELETON.md.
   Запуск:
     PLAYWRIGHT_FROM=/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json \
       node scripts/skeleton-verify.mjs <site>
   ============================================================ */
import { readFileSync, writeFileSync } from 'fs';
import { join, basename } from 'path';
import {
  resolveChromium, SNAPSHOT_FN, NORMALIZE_CSS, FAKE_ORIGIN, REPO,
  VIEWPORTS, MOBILE_UA, SITES, sectionsForViewport,
} from './token-extractor.mjs';
import { makeSig, matchTrees, compareNode, summarize } from './spec-compare-lib.mjs';

const GATE_PCT = 95;

const siteName = process.argv[2];
const site = SITES[siteName];
if (!site) { console.error(`вкажи сайт: node scripts/skeleton-verify.mjs <${Object.keys(SITES).join('|')}>`); process.exit(1); }
const spec = JSON.parse(readFileSync(join(site.outDir, 'build-spec.json'), 'utf8'));
const skelDir = join(REPO, 'library/combos', siteName);

const chromium = await resolveChromium();
if (!chromium) { console.error('playwright не резолвиться (PLAYWRIGHT_FROM?)'); process.exit(1); }
const browser = await chromium.launch();

async function snapshotSkeleton(vpName) {
  const vp = VIEWPORTS[vpName];
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1,
    userAgent: vp.mobile ? MOBILE_UA : undefined,
    hasTouch: vp.mobile, isMobile: vp.mobile,
  });
  const html = readFileSync(join(skelDir, 'index.html'), 'utf8');
  const css = readFileSync(join(skelDir, 'skeleton.css'), 'utf8');
  await ctx.route(`${FAKE_ORIGIN}/**`, async (route) => {
    const u = new URL(route.request().url());
    if (u.pathname === '/') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: html });
    if (u.pathname === '/skeleton.css') return route.fulfill({ contentType: 'text/css', body: css });
    if (site.archive.fontsLocalPrefix && u.pathname.startsWith(site.archive.fontsLocalPrefix)) {
      try {
        const body = readFileSync(join(site.archiveDir, 'fonts', basename(u.pathname)));
        return route.fulfill({ contentType: 'font/woff2', body });
      } catch { /* впадемо в проксі */ }
    }
    if (site.archive.proxyPrefixes.some((p) => u.pathname.startsWith(p))) {
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
  await page.goto(FAKE_ORIGIN + '/', { waitUntil: 'load', timeout: 60000 });
  await page.addStyleTag({ content: NORMALIZE_CSS });
  await page.evaluate(() => document.fonts.ready);
  /* дочекатись фото (проксі з живого) */
  await page.waitForTimeout(1500);
  const sections = {};
  for (const s of sectionsForViewport(site, vpName)) {
    const args = { selector: s.selector, headingRegex: s.headingRegex, fontChecks: site.fontChecks };
    if (s.preCss) await page.addStyleTag({ content: s.preCss });
    sections[s.id] = await page.evaluate(SNAPSHOT_FN, args);
  }
  await ctx.close();
  return sections;
}

const report = { at: new Date().toISOString(), site: siteName, skeleton: skelDir.replace(REPO + '/', ''), specAt: spec.at, gatePct: GATE_PCT, gateScope: 'per-section', viewports: {} };
let gateFailed = false;
for (const vpName of Object.keys(VIEWPORTS)) {
  console.log(`каркас → ${vpName} ${VIEWPORTS[vpName].width}x${VIEWPORTS[vpName].height}…`);
  const ourSections = await snapshotSkeleton(vpName);
  const vpReport = { sections: {} };
  const vpDeltas = [];
  for (const s of sectionsForViewport(site, vpName)) {
    const specSnap = spec.viewports[vpName].sections[s.id];
    const ourSnap = ourSections[s.id];
    if (!specSnap || specSnap.error || !ourSnap || ourSnap.error) {
      console.error(`  [${s.id}] ПОМИЛКА: spec=${specSnap?.error || 'ok'} ours=${ourSnap?.error || 'ok'}`);
      gateFailed = true;
      vpReport.sections[s.id] = { error: { spec: specSnap?.error, ours: ourSnap?.error } };
      continue;
    }
    const sig = makeSig(specSnap.tree, ourSnap.tree);
    const out = { pairs: [], onlyArchive: [], onlyLive: [] };
    matchTrees(specSnap.tree, ourSnap.tree, s.id, out, sig);
    const deltas = [];
    for (const p of out.pairs) compareNode(p, deltas);
    const summary = summarize(deltas);
    vpDeltas.push(...deltas);
    const worst = deltas.filter((d) => (d.kind === 'num' && Math.abs(d.delta) > 1) || (d.kind === 'str' && d.delta === null))
      .sort((x, y) => Math.abs(y.delta || 0) - Math.abs(x.delta || 0));
    const pass = summary.okPct >= GATE_PCT;
    if (!pass) gateFailed = true;
    vpReport.sections[s.id] = {
      matchedElements: out.pairs.length,
      specElements: specSnap.elementCount, ourElements: ourSnap.elementCount,
      onlySpec: out.onlyArchive, onlyOurs: out.onlyLive,
      summary, divergences: worst.slice(0, 40),
    };
    console.log(`  [${s.id}] зматчено ${out.pairs.length} (спека ${specSnap.elementCount}/наше ${ourSnap.elementCount}) · метрик ${summary.total} · розійшлось ${summary.diverged + summary.strMismatch} → ${summary.okPct}% ${pass ? '' : '❌'}`);
  }
  vpReport.summary = summarize(vpDeltas);
  report.viewports[vpName] = vpReport;
  console.log(`  ${vpName} РАЗОМ: ${vpReport.summary.okPct}%`);
}
await browser.close();

writeFileSync(join(site.outDir, 'skeleton-report.json'), JSON.stringify(report, null, 1));
const md = [];
md.push(`# SKELETON — каркас (генерат зі спеки) vs build-spec`);
md.push('');
md.push(`- Дата: ${report.at} · спека від: ${spec.at}`);
md.push(`- ГЕЙТ: ≥${GATE_PCT}% НА КОЖНІЙ секції (жорсткіший за spec-verify).`);
md.push('');
for (const [vpName, v] of Object.entries(report.viewports)) {
  md.push(`## ${vpName} — **${v.summary.okPct}%**`);
  md.push('');
  md.push('| секція | % | зматчено | розійшлось |');
  md.push('|---|---|---|---|');
  for (const [id, sec] of Object.entries(v.sections)) {
    if (sec.error) { md.push(`| ${id} | ПОМИЛКА | — | ${JSON.stringify(sec.error).slice(0, 60)} |`); continue; }
    md.push(`| ${id} | ${sec.summary.okPct}%${sec.summary.okPct >= GATE_PCT ? '' : ' ❌'} | ${sec.matchedElements}/${sec.specElements} | ${sec.summary.diverged + sec.summary.strMismatch}/${sec.summary.total} |`);
  }
  md.push('');
}
md.push(gateFailed ? '## ❌ ГЕЙТ НЕ ПРОЙДЕНО — дірки генератора, дивись divergences у skeleton-report.json' : `## ✅ Гейт ≥${GATE_PCT}% пройдено на КОЖНІЙ секції обох вʼюпортів.`);
writeFileSync(join(site.outDir, 'SKELETON.md'), md.join('\n'));
console.log(`OK → ${join(site.outDir, 'skeleton-report.json')} + SKELETON.md${gateFailed ? ' · ГЕЙТ FAIL' : ' · ГЕЙТ PASS'}`);
process.exit(gateFailed ? 1 : 0);
