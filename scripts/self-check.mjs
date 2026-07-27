#!/usr/bin/env node
/*
  self-check.mjs v2 — авто self-check атома ПЕРЕД показом Єгору (Етап B S45, build-spec ради Fable 5).
  Етап A: напрям-wipe + геометрія. Етап B: 6+ вимірів, event-detection, дві смуги, freeze порогів.

  АРХІТЕКТУРА (вердикт ради Q1): ім'я файлу/звіту/команди НЕ міняються (hook-сумісність).
  Всередині жорсткий розкол ВИМІР/СУД:
    lib/trace.mjs      — браузер ТІЛЬКИ міряє (census → purity → sweep 500 точок → матриця сигналів)
    detectors/core.mjs — усі вердикти = чисті функції над трейсом (тестуються без Chromium)

  ПОРОГИ: НЕ в коді — scripts/thresholds.frozen.json (кожне число з src-формулою; зміна = підпис
  Єгора + пере-калібрація). Fail-closed: файл відсутній/битий → pass:false 'thresholds-unfrozen'.

  КАЛІБРАЦІЯ: scripts/calibrate.mjs ганяє 13 інжекторів (зламаних версій wellness) — детектори
  мусять зловити всі. calibration-report.json відсутній/застарілий (thresholdsSha/harnessHash
  mismatch) → pass:false 'calibration-stale'. Харнес без доведених зубів не мінтить зелене.

  ДВІ СМУГИ (вердикт Q5): checks[] = лише calibrated-виміри → pass судить їх.
  unchecked[] = некалібрований вимір / нецитований expect / waiver → видимі, треба ОКО Єгора.
  green = «нема СТАРИХ класів багів», НІКОЛИ не «правильно» — нове судить око.

  КОНФІГ (self-check.config.json поруч з атомом):
    { url, targets:[{id,sel,channel,unit?,mechanism,role,wipe?}], ignore:[{sel,reason}],
      media:{declared:'video'|'photo-placeholder', waiverSrc?} }
  ОЧІКУВАННЯ (expectations.json поруч з атомом): кожне число з обов'язковим src
  (SPEC.md:рядок / live:кадр / CHOREO-MAP:рядок). src='render-math...' → basis:'self'
  (регрес-guard, не «зелений-проти-live»).

  ЗАПУСК: node scripts/self-check.mjs --atom amenities-wellness
*/
import { resolveChromium } from './token-extractor.mjs';
import { censusMovers, assertPurity, captureTrace } from './lib/trace.mjs';
import { frameSurfaceMap, gutterBandTop, deriveGutterColor } from './lib/surface.mjs';
import { framesFromPNGs, extractTrack, computeZoneWindows, verdictsForWindows,
  tokens as ztTokens, classifyMechanic, shaFile as ztShaFile, contentBox } from './lib/zonetrack.mjs';
import { compareComposition } from './lib/composition.mjs';
import * as D from './detectors/core.mjs';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const ATOMS_DIR = path.join(REPO, 'library/techniques/atoms');
const PORT = 8879;

const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const shaFile = (p) => fs.existsSync(p) ? sha(fs.readFileSync(p)) : null;

// ── пороги: fail-closed ──────────────────────────────────────────────────────
export function loadThresholds(){
  const p = path.join(__dirname, 'thresholds.frozen.json');
  try {
    const raw = fs.readFileSync(p, 'utf8');
    const j = JSON.parse(raw);
    const TH = {};
    for (const [k, o] of Object.entries(j.values)) TH[k] = o.v;
    // sha ТІЛЬКИ по values: фліп статусу в реєстрі dimensions (після calibrate) не інвалідовує
    // калібрацію; зміна будь-якого ЧИСЛА — інвалідовує (курка-яйце розірвано, вердикт ради Q6)
    return { TH, dimensions: j.dimensions, version: j.version, sha: sha(JSON.stringify(j.values)) };
  } catch (e) { return { error: 'thresholds-unfrozen: ' + e.message }; }
}

export function harnessHash(){
  // S49: + lib/zonetrack.mjs — structure-parity залежить від екстрактора; без нього правка
  // екстрактора мовчки лишала б калібрацію «свіжою» (дірка анти-застарівання)
  return sha(['self-check.mjs', 'lib/trace.mjs', 'lib/surface.mjs', 'detectors/core.mjs', 'lib/zonetrack.mjs', 'lib/composition.mjs']
    .map(f => fs.readFileSync(path.join(__dirname, f))).join(''));
}

// ── media probe (окремий time-домен, поза scroll-трейсом) ────────────────────
export async function probeMediaType(page, TH){
  const r = await page.evaluate(async (waitMs) => {
    const v = document.querySelector('video');
    if (!v) return { hasVideo: false };
    const t0 = v.currentTime;
    await new Promise(res => setTimeout(res, waitMs));
    return { hasVideo: true, delta: v.currentTime - t0 };
  }, 400);
  if (!r.hasVideo) return { pass: false, detail: 'відео-елемент відсутній у DOM' };
  const pass = r.delta >= TH.mediaProbeMinDeltaS;
  return { pass, detail: `video.currentTime Δ=${r.delta.toFixed(2)}s за 400ms (≥${TH.mediaProbeMinDeltaS} = грає)` };
}

// ── swipe-strip стадія: хвіст-плитки = горизонтальна СВАЙП-СТРІЧКА (S47, баг Єгора) ──
// Інтерактивний вимір (не чиста функція над scroll-трейсом): читає геометрію треку +
// програмно зсуває scrollLeft і перевіряє що трек реально рухається. Повертає сирі числа;
// судить чистий D.detectSwipeStrip проти порогів. Реєструється УМОВНО (лише коли cfg.swipeStrip).
export async function probeSwipeStrip(page, cfg){
  const c = cfg?.swipeStrip;
  if (!c) return null;
  return await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return { found: false };
    const cs = getComputedStyle(el);
    const tiles = [...el.children];
    const snapType = cs.scrollSnapType || 'none';
    const snapX = /(^|\s)(x|both)(\s|$|\s)/.test(snapType) || /\bx\b/.test(snapType);
    let aligned = 0;
    for (const t of tiles) {
      const a = getComputedStyle(t).scrollSnapAlign || 'none';
      if (a && a !== 'none') aligned++;
    }
    const overflowPx = el.scrollWidth - el.clientWidth;
    // програмний свайп: штовхнути scrollLeft і зчитати реальний зсув (нативний scroll-snap
    // може доводити до найближчого slot — тому просимо 200, приймаємо будь-який суттєвий рух)
    const before = el.scrollLeft;
    el.scrollLeft = before + 200;
    const movedPx = Math.abs(el.scrollLeft - before);
    el.scrollLeft = before;                            // повернути (не мутувати стан для наступних стадій)
    return { found: true, tileCount: tiles.length, overflowPx, snapType, snapX,
      snapAlignAll: tiles.length > 0 && aligned === tiles.length, alignedTiles: aligned, swipeMovedPx: movedPx };
  }, c.sel);
}

// ── surface-parity стадія: наші скріншоти ↔ live-кадри на якір-станах ────────
// S46-c УНІВЕРСАЛЬНА Й БЕЗУМОВНА (мандат Єгора: неможливо обійти, для БУДЬ-ЯКОГО атома):
// - відео АВТО-відкривається з reference/ (config.liveAnchors лише НАЛАШТОВУЄ states/cuts,
//   ВИМКНУТИ стадію config НЕ МОЖЕ — поля skip не існує);
// - колір панелі АВТО-виводиться З LIVE-кадру (bottom-anchored solid-сегмент) — модель
//   не може підставити зручний собі колір чи «забути» його;
// - нема reference-відео → error (fail-closed; live-first-gate і так не дав би збудувати html).
export function findReferenceVideo(atomDir){
  const rdir = path.join(atomDir, 'reference');
  if (!fs.existsSync(rdir)) return null;
  const v = fs.readdirSync(rdir).find(f => /\.(mp4|mov|webm)$/i.test(f));
  return v ? path.join(rdir, v) : null;
}
export async function runSurfaceStage(page, cfg, atomDir, TH){
  const la = cfg.liveAnchors || {};
  const videoPath = la.video ? path.join(atomDir, la.video) : findReferenceVideo(atomDir);
  if (!videoPath || !fs.existsSync(videoPath)) return { error: 'reference live-відео відсутнє — surface-parity неможлива (поклади запис у reference/)' };
  const dur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${videoPath}"`).toString());
  const states = la.states || [0.25, 0.5, 0.75, 0.95];
  const cuts = { topCutPct: la.topCutPct ?? 0, botCutPct: la.botCutPct ?? 0 };
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'surf-stage-'));
  const gBase = { tol: TH.surfGutterTol, runMinPct: TH.surfRunMinPct,
    maxGapPct: TH.surfMaxGapPct, topSearchCutPct: TH.surfTopSearchCutPct, minCoveragePct: TH.surfMinCoveragePct };
  const ourShots = [], liveShots = [];
  for (const p of states) {
    await page.evaluate((v) => window.render(v), p);
    const ourPng = path.join(tmp, `our_${p}.png`);
    await page.screenshot({ path: ourPng });
    const t = Math.min(dur - 0.05, p * dur);
    const livePng = path.join(tmp, `live_${p}.png`);
    execSync(`ffmpeg -y -ss ${t.toFixed(2)} -i "${videoPath}" -frames:v 1 "${livePng}" -loglevel error`);
    // ПАНЕЛЬ: колір-кандидат АВТО з ҐАТТЕРА live (resolution-незалежно; S46-c v3 —
    // variance-метод був асиметричний до чіткості тексту). Config bandRGB лише override.
    const liveC = la.bandRGB || deriveGutterColor(livePng, { ...cuts, minCoveragePct: TH.surfMinCoveragePct });
    let liveTop = null, ourTop = null;
    if (liveC) {
      liveTop = gutterBandTop(livePng, { ...gBase, bandRGB: liveC, ...cuts });
      ourTop = gutterBandTop(ourPng, { ...gBase, bandRGB: liveC, topCutPct: 0, botCutPct: 0 });
    } else {
      // live без панелі → симетрія: у НАС теж не мусить бути стабільної ґаттер-панелі
      const ourC = deriveGutterColor(ourPng, { minCoveragePct: TH.surfMinCoveragePct });
      ourTop = ourC ? gutterBandTop(ourPng, { ...gBase, bandRGB: ourC, topCutPct: 0, botCutPct: 0 }) : null;
    }
    ourShots.push({ p, bandTop: ourTop });
    liveShots.push({ p, bandTop: liveTop });
  }
  await page.evaluate(() => window.render(0));
  fs.rmSync(tmp, { recursive: true, force: true });
  return { ourShots, liveShots };
}

// ── composition-static стадія: СТАТИЧНА КОМПОЗИЦІЯ наша ↔ live у ЗОНАХ (S51-d) ──────
// БЕЗУМОВНА (як surface/structure): народжена з ОКА Єгора — спекс-блок parking мав 3 hairline
// проти 2 у live, текст притиснутий до лінії замість центру смуги, лінія в 1.6 раза темніша,
// і ЖОДЕН вимір цього не бачив (structure = EVENT-домен, surface = лише панель/шов/колір,
// решта = DOM+рух). Міряє те, ЩО НАМАЛЬОВАНО: розділювачі (кількість/позиція/вага) і
// текст-рядки (кількість/позиція) у декларованих зонах, на тих самих liveAnchors-станах.
// Fail-closed: нема зон або відео → error (не пропуск).
export async function runCompositionStage(page, cfg, atomDir, TH){
  const zr = loadZoneRef(atomDir);
  if (zr.error) return { error: zr.error };
  const la = cfg.liveAnchors || {};
  const videoPath = la.video ? path.join(atomDir, la.video) : findReferenceVideo(atomDir);
  if (!videoPath || !fs.existsSync(videoPath)) return { error: 'reference live-відео відсутнє' };
  const dur = parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${videoPath}"`).toString());
  const cuts = zr.zonesDecl.cuts || { topPct: 0, botPct: 0 };
  // ВЛАСНИЙ прямокутник (S51-d): EVENT-зони нарізані під трекінг руху і ріжуть статичні блоки
  // (спекс-блок parking починається ВИЩЕ зони panel). config.composition.rects — смуги КОНТЕНТУ,
  // де блок ПОВНІСТЮ видно на ОБОХ боках і немає сусідньої секції (урок borges). Дефолт = вся зона.
  const comp = cfg.composition || null;
  const states = comp?.states || la.compStates || [1.0];
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'comp-stage-'));
  const rows = [];
  for (const p of states) {
    await page.evaluate((v) => window.render(v), p);
    const ourPng = path.join(tmp, `our_${p}.png`);
    await page.screenshot({ path: ourPng });
    const t = Math.min(dur - 0.05, p * dur);
    const livePng = path.join(tmp, `live_${p}.png`);
    execSync(`ffmpeg -y -ss ${t.toFixed(2)} -i "${videoPath}" -frames:v 1 "${livePng}" -loglevel error`);
    const [ourF] = framesFromPNGs([ourPng], { scaleW: 585 });
    const [liveF] = framesFromPNGs([livePng], { scaleW: 585 });
    const ourBox = contentBox(ourF, { topPct: 0, botPct: 0 });
    const liveBox = contentBox(liveF, cuts);
    const zoneRect = (frame, box, r) => ({
      x0: Math.round(frame.w * r[0] / 100), y0: box.topPx + Math.round(box.hPx * r[1] / 100),
      x1: Math.round(frame.w * r[2] / 100), y1: box.topPx + Math.round(box.hPx * r[3] / 100) });
    const targets = comp?.rects?.length
      ? comp.rects.map(r => ({ id: r.id, rectPct: r.rectPct }))
      : zr.zonesDecl.zones.filter(z => z.kind !== 'media').map(z => ({ id: z.id, rectPct: z.rectPct }));
    for (const z of targets) {
      const cmp = compareComposition(ourF, liveF, zoneRect(ourF, ourBox, z.rectPct),
        zoneRect(liveF, liveBox, z.rectPct), TH, ourBox, liveBox);
      rows.push({ p, zone: z.id, ...cmp });
    }
  }
  await page.evaluate(() => window.render(0));
  fs.rmSync(tmp, { recursive: true, force: true });
  return { rows };
}

// ── structure-parity стадія: МЕХАНІКА наша ↔ live у EVENT-домені (рада S47 крок 3) ──
// БЕЗУМОВНА як surface-parity: config вимкнути НЕ може, поля skip не існує.
// Той самий екстрактор (lib/zonetrack) по live-відео (кешований reference/*.zonetrack.json,
// звірений по videoSha/zonesSha) і по нашому render(p) (свіп ztSweepStates скріншотів).
// Fail-closed: нема zones.json / нема zonetrack.json / sha-розсинхрон = FAIL, не пропуск.
export function loadZoneRef(atomDir){
  const rdir = path.join(atomDir, 'reference');
  if (!fs.existsSync(rdir)) return { error: 'reference/ відсутній' };
  const zonesPath = path.join(rdir, 'zones.json');
  if (!fs.existsSync(zonesPath)) return { error: 'reference/zones.json відсутній — оголоси зони прямокутниками З LIVE-КАДРУ' };
  const ztFile = fs.readdirSync(rdir).find(f => f.endsWith('.zonetrack.json'));
  if (!ztFile) return { error: 'reference/*.zonetrack.json відсутній — запусти node scripts/zone-track.mjs --atom <id>' };
  const ref = JSON.parse(fs.readFileSync(path.join(rdir, ztFile), 'utf8'));
  const videoPath = findReferenceVideo(atomDir);
  if (!videoPath) return { error: 'reference live-відео відсутнє' };
  if (ref.videoSha !== ztShaFile(videoPath)) return { error: `zonetrack застарілий: videoSha mismatch (відео перезаписано після треку — перезапусти zone-track)` };
  if (ref.zonesSha !== ztShaFile(zonesPath)) return { error: 'zonetrack застарілий: zonesSha mismatch (зони змінені після треку — перезапусти zone-track)' };
  // S55: ДВІ дірки анти-застарівання, знайдені радою і підтверджені числом на живих файлах.
  // (1) FPS. Референс wellness був знятий на 30 fps, решта на 12, тому номери кадрів у
  //     zonetrack і timeline ТОГО САМОГО атома ставали незіставними ([[live-video-fps-trap]]).
  // (2) ПОРОГИ. thresholdsSha розійшлись у 4 з 5 референсів (89c59b1d і 88cd1cf7 проти чинного
  //     3c1e9249). Тобто ЖИВІ токени рахувались за скасованими правилами, а наш бік за чинними.
  //     Порівнювались різні лінійки, і жоден вимір цього не бачив.
  if (ref.fps !== 12) return { error: `zonetrack знято на ${ref.fps} fps замість 12 — номери кадрів незіставні з timeline; перезапусти: node scripts/zone-track.mjs --atom <id> --fps 12` };
  const curThr = loadThresholds().sha;
  if (ref.thresholdsSha !== curThr) return { error: `zonetrack рахований за СТАРИМИ порогами (${(ref.thresholdsSha || '—').slice(0, 8)} проти чинних ${curThr.slice(0, 8)}) — перезапусти node scripts/zone-track.mjs --atom <id>` };
  return { ref, zonesDecl: JSON.parse(fs.readFileSync(zonesPath, 'utf8')) };
}
export async function runStructureStage(page, atomDir, TH){
  const zr = loadZoneRef(atomDir);
  if (zr.error) return { error: zr.error };
  const N = TH.ztSweepStates;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'struct-'));
  const pngs = [];
  for (let i = 0; i < N; i++) {
    await page.evaluate((v) => window.render(v), i / (N - 1));
    const p = path.join(tmp, `s_${String(i).padStart(3, '0')}.png`);
    await page.screenshot({ path: p });
    pngs.push(p);
  }
  await page.evaluate(() => window.render(0));
  const frames = framesFromPNGs(pngs);
  fs.rmSync(tmp, { recursive: true, force: true });
  // наш render = чистий контент (без live-chrome) → cuts 0/0; зони ті САМІ з live-декларації
  const ourDecl = { cuts: { topPct: 0, botPct: 0 }, zones: zr.zonesDecl.zones };
  const track = extractTrack(frames, ourDecl, TH);
  const windows = computeZoneWindows(frames, track, TH);
  const verdicts = verdictsForWindows(frames, track, windows, TH);
  return { ref: zr.ref, ourTokens: ztTokens(verdicts),
    ourClass: classifyMechanic(verdicts, track, TH),
    ourUnknowns: verdicts.filter(v => v.verdict === 'UNKNOWN').length,
    ourVerdicts: verdicts };
}

// ── повний вимір+суд одного завантаженого атома (без lane/pass — сирі результати)
// Використовується і main-ом, і calibrate.mjs (після ін'єкції багу). atomDir потрібен
// surface-стадії (live-відео поруч з атомом); без нього surface-parity пропускається.
export async function runPipeline(page, cfg, exp, TH, atomDir){
  const results = [];
  const hasRender = await page.evaluate(() => typeof window.render === 'function');
  if (!hasRender) {
    results.push({ dimension: 'render-api', name: 'render-api', pass: false, detail: 'window.render(p) відсутній — атом не render(p)-driven; scroll-драйвер = окремий етап', basis: 'live' });
    return { results, movers: [], trace: null };
  }
  results.push({ dimension: 'render-api', name: 'render-api', pass: true, detail: 'window.render(p) присутній', basis: 'live' });

  const movers = await censusMovers(page);
  const purity = await assertPurity(page);
  results.push({ dimension: 'purity', name: 'render-p-pure', pass: purity.pure && purity.transMovers.length === 0,
    detail: purity.pure && purity.transMovers.length === 0
      ? `render(p) чиста (снапшоти збігаються після стрибків; transition=0 на ${movers.length} мōверах)`
      : `НЕ чиста: snapEqual=${purity.pure}, transition на [${purity.transMovers.join(',')}] — семпли брехатимуть`, basis: 'live' });

  // мапа задекларованих таргетів/ignore → data-sc
  const tmap = await page.evaluate((sels) => {
    const out = {};
    for (const [id, sel] of sels) { const el = document.querySelector(sel); out[id] = el ? el.getAttribute('data-sc') : null; }
    return out;
  }, cfg.targets.map(t => [t.id, t.sel]));
  cfg.ignoreSc = await page.evaluate((sels) => sels.map(sel => document.querySelector(sel)?.getAttribute('data-sc')).filter(Boolean), (cfg.ignore || []).map(i => i.sel));

  results.push(...D.detectUndeclared(movers, tmap, cfg));

  const trace = await captureTrace(page, TH.steps);
  const events = D.computeEvents(trace, tmap, cfg, TH);

  // статика для composition (колір канви, гео контейнера) — міряємо на p=1
  const statics = await page.evaluate((c) => {
    window.render(1);
    const out = {};
    if (c.colorSel) { const el = document.querySelector(c.colorSel); if (el) { const m = getComputedStyle(el).backgroundColor.match(/\d+/g); out.bgColor = m ? m.slice(0, 3).map(Number) : null; } }
    if (c.picSel) { const pic = document.querySelector(c.picSel); const par = pic?.parentElement;
      if (pic && par) { out.picTopPct = pic.offsetTop / par.offsetHeight * 100; out.picHeightPct = pic.offsetHeight / par.offsetHeight * 100; } }
    window.render(0);
    return out;
  }, { colorSel: exp?.composition?.canvasColor?.sel, picSel: exp?.composition?.picBox?.sel });

  results.push(...D.detectMotionDirection(trace, tmap, cfg, TH));
  results.push(...D.detectGeometry(trace, tmap, cfg, TH));
  results.push(...D.detectChannelIdentity(trace, tmap, cfg, TH));
  results.push(...D.detectTiming(events, exp, TH));
  results.push(...D.detectOrdering(trace, tmap, events, cfg, exp, TH));
  results.push(...D.detectParallelism(events, exp, TH));
  results.push(...D.detectPlateau(events, exp, TH, trace));
  results.push(...D.detectComposition(statics, events, exp, TH));
  results.push(...D.detectTypography(trace, tmap, events, cfg, exp, TH));
  results.push(...D.detectFade(trace, tmap, exp, TH));

  // surface-parity: композиція наша ↔ live — БЕЗУМОВНО (S46-c, мандат Єгора: config
  // може налаштувати states/cuts, але НЕ вимкнути; нема reference-відео = FAIL fail-closed)
  if (atomDir) {
    const surf = await runSurfaceStage(page, cfg, atomDir, TH);
    if (surf?.error) results.push({ dimension: 'surface-parity', name: 'surf-stage', pass: false, detail: surf.error + ' (fail-closed)', basis: 'live' });
    else if (surf) results.push(...D.detectSurfaceParity(surf.ourShots, surf.liveShots, TH, exp?.surfaceWaivers));

    // structure-parity: МЕХАНІКА наша ↔ live у EVENT-домені — БЕЗУМОВНО (рада S47 крок 3:
    // єдиний вимір що розриває самоузгоджене коло — референт live, не мої expectations)
    const st = await runStructureStage(page, atomDir, TH);
    if (st?.error) results.push({ dimension: 'structure-parity', name: 'struct-stage', pass: false, detail: st.error + ' (fail-closed)', basis: 'live' });
    else {
      results.push(...D.detectStructureParity(st.ref, st.ourTokens, st.ourClass, st.ourUnknowns));
      // клас механіки визначає LIVE; config лише додає (рада S47 крок 5)
      results.push(...D.detectMechanicClass(st.ref, cfg, exp));
    }

    // composition-static: ЩО НАМАЛЬОВАНО в зонах (S51-d, дірка з ока Єгора) — БЕЗУМОВНО
    const cm = await runCompositionStage(page, cfg, atomDir, TH);
    if (cm?.error) results.push({ dimension: 'composition-static', name: 'comp-stage', pass: false,
      detail: cm.error + ' (fail-closed)', basis: 'live' });
    else for (const r of cm.rows) {
      const nm = `comp:${r.zone}@p${r.p}`;
      if (!r.diffs.length) results.push({ dimension: 'composition-static', name: nm, pass: true,
        detail: `композиція збігається: ${r.live.lines.length} розділювач(ів), ${r.live.rows.length} текст-рядк(ів)`
          + ` [лінії live ${r.live.lines.map(h => h.yPct + '%').join(', ') || '—'}]`, basis: 'live' });
      else for (const d of r.diffs) results.push({ dimension: 'composition-static', name: `${nm}:${d.kind}`,
        pass: false, detail: d.detail, basis: 'live' });
    }
  }

  // swipe-strip: хвіст-плитки = горизонтальна свайп-стрічка (S47, баг Єгора). УМОВНО від
  // config.swipeStrip: атом без стрічки → вимір не застосовний (порожній вихід, не FAIL).
  if (cfg.swipeStrip) {
    const strip = await probeSwipeStrip(page, cfg);
    results.push(...D.detectSwipeStrip(strip, cfg, TH));
  }

  return { results, movers, trace, events, statics };
}

// ── main ─────────────────────────────────────────────────────────────────────
const INTEGRITY = new Set(['render-api', 'purity', 'census', 'console-errors', 'http-status']);

// ── --init: авто-скелет config/expectations з ВИМІРЯНИХ подій (Етап C, S45-d) ─
// Для щойно збудованого атома: sweep → пропонує draft-конфіг (мōвери → таргети з
// авто-визначеним каналом/механізмом) + draft-очікування (виміряні події, src=FILL).
// Пише *.draft.json — НЕ перетирає реальні. Числа в src заповнюю ТІЛЬКИ з CHOREO/SPEC/live (B22).
async function initScaffold(atomId, atomDir, TH){
  const vdir = path.join(atomDir, 'variants');
  const html = fs.existsSync(vdir) ? fs.readdirSync(vdir).find(f => f.endsWith('.html') && f !== 'compare.html') : null;
  if (!html) { console.error('--init: нема variants/*.html — спершу збудуй атом (після live-ref!)'); process.exit(2); }
  const url = `http://localhost:${PORT}/atoms/${atomId}/variants/${html}`;
  const chromium = await resolveChromium();
  const b = await chromium.launch();
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })).newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
  if (!await page.evaluate(() => typeof window.render === 'function')) { console.error('--init: window.render(p) відсутній'); await b.close(); process.exit(2); }
  const movers = await censusMovers(page);
  const trace = await captureTrace(page, TH.steps);
  await b.close();
  const CHN = ['ty', 'clipTop', 'clipBottom', 'opacity'];
  const range = (v) => Math.max(...v) - Math.min(...v);
  const { chan, activeWindow } = await import('./lib/trace.mjs');
  const targets = [], events = [];
  for (const m of movers) {
    const ranges = CHN.map(ch => ({ ch, r: range(chan(trace, m.sc, ch)) }));
    const dom = ranges.sort((a, b) => b.r - a.r)[0];
    if (dom.r < 4) continue;
    const id = m.desc.replace(/^#/, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || m.sc;
    const mech = dom.ch === 'ty' ? 'translate' : (dom.ch === 'opacity' ? 'opacity' : 'clip');
    const ty = chan(trace, m.sc, 'ty'), ct = chan(trace, m.sc, 'clipTop');
    const vis = ty.map((y, i) => y + ct[i]);
    const wipeUp = (vis[vis.length - 1] - vis[0]) <= -(trace.vh * TH.upDeltaMinFrac);
    const t = { id, sel: m.desc, channel: dom.ch, mechanism: mech, role: 'FILL(card|media|text)' };
    if (wipeUp) t.wipe = 'up';
    targets.push(t);
    const w = activeWindow(chan(trace, m.sc, dom.ch), TH.stepEpsPx);
    if (w) {
      events.push({ key: `${id}.motion.start`, p: +(w.startI / trace.steps).toFixed(3), tol: TH.tolEventP, src: 'FILL: підтвердь із CHOREO-MAP/SPEC/live (виміряно з ВЛАСНОГО коду — без зовнішнього src лишиться basis self)' });
      events.push({ key: `${id}.motion.end`, p: +(w.endI / trace.steps).toFixed(3), tol: TH.tolEventP, src: 'FILL' });
    }
  }
  fs.writeFileSync(path.join(atomDir, 'self-check.config.draft.json'), JSON.stringify({
    _note: 'DRAFT від --init: перевір селектори/ролі, приберú зайве, перейменуй у self-check.config.json',
    url: `variants/${html}`, targets, ignore: [], media: { declared: 'FILL(video|photo-placeholder)' } }, null, 2));
  fs.writeFileSync(path.join(atomDir, 'expectations.draft.json'), JSON.stringify({
    _note: 'DRAFT від --init: числа ВИМІРЯНІ з власного рендера. ЗАКОН B22: підтвердь кожне з CHOREO-MAP/SPEC/live і встав src; без зовнішнього src вимір буде basis-self.',
    events, ordering: [], overlap: [], composition: {}, typography: {} }, null, 2));
  console.log(`--init ▸ ${atomId}: ${targets.length} таргетів, ${events.length} подій → *.draft.json (перевір і перейменуй)`);
  process.exit(0);
}

async function main(){
  const argVal = (f) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : null; };
  const atomId = argVal('--atom') || (process.cwd().match(/atoms\/([^/]+)/) || [])[1];
  if (!atomId) { console.error('self-check: не вказано --atom'); process.exit(2); }
  const atomDir = path.join(ATOMS_DIR, atomId);
  if (!fs.existsSync(atomDir)) { console.error('self-check: нема каталогу ' + atomDir); process.exit(2); }
  if (process.argv.includes('--init')) {
    const thrI = loadThresholds();
    if (thrI.error) { console.error(thrI.error); process.exit(2); }
    return initScaffold(atomId, atomDir, thrI.TH);
  }

  const thr = loadThresholds();
  const cfgPath = path.join(atomDir, 'self-check.config.json');
  const expPath = path.join(atomDir, 'expectations.json');
  const cfg = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, 'utf8')) : null;
  const exp = fs.existsSync(expPath) ? JSON.parse(fs.readFileSync(expPath, 'utf8')) : null;

  const checks = [], unchecked = [];
  const report = { atomId, ts: null, pass: false, url: null, tool: 'self-check.mjs', version: 2 };

  const finish = (code) => {
    report.ts = new Date().toISOString();
    // S55: детектор може позначити свій результат `unchecked:true` (наприклад structure-parity
    // на ПОРОЖНЬОМУ порівнянні). Такий результат ЗНІМАЄТЬСЯ із зеленої смуги і йде в жовту:
    // «вимір відбувся, але судити не було чого» це не те саме, що «сходиться».
    for (let i = checks.length - 1; i >= 0; i--) {
      if (checks[i].unchecked) {
        const c = checks.splice(i, 1)[0];
        unchecked.push({ dimension: c.dimension, target: c.name, reason: 'порожній предмет', detail: c.detail });
      }
    }
    report.checks = checks; report.unchecked = unchecked; report.uncheckedCount = unchecked.length;
    const out = path.join(atomDir, 'self-check-report.json');
    fs.writeFileSync(out, JSON.stringify(report, null, 2));
    console.log(`\nself-check ▸ ${atomId}  (v2)`);
    for (const c of checks) console.log(`  ${c.pass ? '✓' : '✗'} [${c.dimension}${c.basis === 'self' ? '·self' : ''}] ${c.name} — ${c.detail}`);
    if (unchecked.length) {
      console.log(`\n  🟡 UNCHECKED (${unchecked.length}) — треба ОКО Єгора:`);
      for (const u of unchecked) console.log(`     • [${u.dimension}] ${u.target}: ${u.reason} — ${u.detail}`);
    }
    console.log(`\n${report.pass ? 'PASS ✅ (green = нема СТАРИХ класів багів; нове судить око)' : 'FAIL ❌ — НЕ показувати compare-URL'}  → ${path.relative(REPO, out)}`);
    if (unchecked.length) console.log(`EYE-CHECK LIST (додай поруч з URL): UNCHECKED: ${[...new Set(unchecked.map(u => u.dimension))].join(', ')}`);
    process.exit(code);
  };

  if (thr.error) { report.summary = thr.error; checks.push({ dimension: 'thresholds', name: 'thresholds-frozen', pass: false, detail: thr.error, basis: 'live' }); return finish(1); }
  const { TH, dimensions } = thr;
  report.thresholdsVersion = thr.version; report.thresholdsSha = thr.sha; report.harnessHash = harnessHash();

  if (!cfg) { checks.push({ dimension: 'config', name: 'config-present', pass: false, detail: 'self-check.config.json відсутній — запусти --init або створи вручну', basis: 'live' }); return finish(1); }
  report.configSha = shaFile(cfgPath); report.expectationsSha = shaFile(expPath);

  // inputsHash: контент атома + конфіги (закриває дірку «pass → зламав → показав старий зелений»)
  const vdir = path.join(atomDir, 'variants');
  const htmls = fs.existsSync(vdir) ? fs.readdirSync(vdir).filter(f => f.endsWith('.html')).sort().map(f => fs.readFileSync(path.join(vdir, f))) : [];
  report.inputsHash = sha(Buffer.concat([...htmls, Buffer.from((report.configSha || '') + (report.expectationsSha || ''))]));

  // калібрація: свіжість проти порогів+харнеса (fail-closed)
  const calPath = path.join(__dirname, 'calibration-report.json');
  let calib = { ok: false, reason: 'calibration-report.json відсутній' };
  if (fs.existsSync(calPath)) {
    try {
      const c = JSON.parse(fs.readFileSync(calPath, 'utf8'));
      if (c.thresholdsSha !== thr.sha) calib = { ok: false, reason: 'калібрація зроблена з ІНШИМИ порогами (thresholdsSha mismatch)' };
      else if (c.harnessHash !== report.harnessHash) calib = { ok: false, reason: 'харнес змінився після калібрації (harnessHash mismatch)' };
      else if (!c.pass) calib = { ok: false, reason: 'остання калібрація FAIL' };
      else calib = { ok: true, ts: c.ts };
    } catch (e) { calib = { ok: false, reason: 'calibration-report битий: ' + e.message }; }
  }
  report.calibration = calib;

  const url = /^https?:/.test(cfg.url) ? cfg.url : `http://localhost:${PORT}/atoms/${atomId}/${(cfg.url || '').replace(/^\/+/, '')}`;
  report.url = url;

  const chromium = await resolveChromium();
  if (!chromium) { checks.push({ dimension: 'env', name: 'chromium', pass: false, detail: 'playwright не резолвиться (PLAYWRIGHT_FROM?)', basis: 'live' }); return finish(2); }
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errs = [], nf = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push(String(e)));
  page.on('response', r => { if (r.status() >= 400) nf.push(r.status() + ' ' + r.url().split('/').pop()); });

  try { await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 }); }
  catch (e) { checks.push({ dimension: 'env', name: 'page-load', pass: false, detail: `goto FAIL: ${e.message}`, basis: 'live' }); await b.close(); return finish(1); }

  const pipe = await runPipeline(page, cfg, exp, TH, atomDir);

  // media-вимір: окремий time-домен
  if (cfg.media?.declared === 'video') {
    const m = await probeMediaType(page, TH);
    pipe.results.push({ dimension: 'media-type', name: 'media-грає', pass: m.pass, detail: m.detail, basis: 'live' });
  } else if (cfg.media?.declared === 'photo-placeholder') {
    unchecked.push({ dimension: 'media-type', target: 'media', reason: 'waived', detail: `photo-first плейсхолдер до заміни на відео [${cfg.media.waiverSrc || 'src не вказано'}]` });
  }

  await b.close();

  pipe.results.push({ dimension: 'console-errors', name: 'console-errors', pass: errs.length === 0, detail: errs.length ? `${errs.length} err: ${errs.slice(0, 2).join(' | ')}` : '0 console-error', basis: 'live' });
  pipe.results.push({ dimension: 'http-status', name: 'http-status', pass: nf.length === 0, detail: nf.length ? `${nf.length} HTTP>=400: ${nf.slice(0, 3).join(' | ')}` : '0 HTTP>=400', basis: 'live' });

  // ── ДВІ СМУГИ: lane обчислюється з frozen-реєстру, поля skip НЕ існує ──────
  for (const r of pipe.results) {
    if (r.waived) unchecked.push({ dimension: r.dimension, target: r.name, reason: 'waived', detail: r.detail });
    const isIntegrity = INTEGRITY.has(r.dimension);
    const dimStatus = dimensions[r.dimension]?.status;
    if (isIntegrity || (dimStatus === 'calibrated' && calib.ok)) checks.push(r);
    else unchecked.push({ dimension: r.dimension, target: r.name, reason: dimStatus !== 'calibrated' ? 'no-fixture' : 'calibration-stale',
      detail: (r.pass ? 'вимір пройшов, але вимір НЕкалібрований → не рахується зеленим' : 'ВИМІР ПРОВАЛЕНО (некалібрований, але дивись!): ') + r.detail });
  }

  report.coverage = {
    dimensionsRun: [...new Set(pipe.results.map(r => r.dimension))],
    movers: pipe.movers.length,
    declared: cfg.targets.length,
    basisSelf: checks.filter(c => c.basis === 'self').length,
  };

  const checksPass = checks.every(c => c.pass);
  if (!calib.ok) {
    checks.push({ dimension: 'calibration', name: 'calibration-fresh', pass: false, detail: `fail-closed: ${calib.reason} → запусти node scripts/calibrate.mjs`, basis: 'live' });
    report.pass = false;
  } else report.pass = checksPass;
  report.summary = report.pass
    ? `green (live:${checks.filter(c => c.basis !== 'self').length} / self-regression:${checks.filter(c => c.basis === 'self').length}); unchecked:${unchecked.length} — нове судить око Єгора`
    : 'є провалені виміри — НЕ показувати compare-URL';
  finish(report.pass ? 0 : 1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(e => { console.error('self-check crash:', e); process.exit(2); });
}
