#!/usr/bin/env node
/*
  calibrate.mjs — ДОКАЗ ЗУБІВ харнеса (Етап B S45, крок B3 — найважливіший крок довіри).

  Ганяє повний пайплайн детекторів проти:
  - БАЗИ (прийнятий wellness) → мусить бути all-green (нульовий рядок матриці);
  - 12 інжекторів зламаних версій → кожен: primary-вимір FAIL ∧ failed ⊆ primary∪expectedSecondary;
  - NEG-13 (доброякісний зсув під допуском) → усі виміри PASS (анти-надчутливість);
  - FIX-12 media-пара (синтетична) → probeMediaType: paused=FAIL, playing=PASS.

  Оракул що ніколи не відхиляє — марний. Харнес що пропустив хоч один відомий баг — не
  заслуговує довіри. Результат → calibration-report.json {matrix, thresholdsSha, harnessHash,
  baseInputsHash, ts}; self-check fail-closed без свіжого календаря цього звіту.

  Ганяти ЛИШЕ при зміні порогів / харнеса / бази — не щопрогін (бюджет виживання).
  node scripts/calibrate.mjs
*/
import { runPipeline, loadThresholds, harnessHash, probeMediaType } from './self-check.mjs';
import { resolveChromium } from './token-extractor.mjs';
import { INJECTORS } from './calibration/injectors.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const BASE_ATOM = 'amenities-wellness';
const ATOM_DIR = path.join(REPO, 'library/techniques/atoms', BASE_ATOM);
const PORT = 8879;
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

const thr = loadThresholds();
if (thr.error) { console.error('calibrate:', thr.error); process.exit(2); }
const { TH } = thr;

const cfgRaw = fs.readFileSync(path.join(ATOM_DIR, 'self-check.config.json'), 'utf8');
const expRaw = fs.readFileSync(path.join(ATOM_DIR, 'expectations.json'), 'utf8');
const baseCfg = () => JSON.parse(cfgRaw);   // свіжа копія на кожен прогін (runPipeline мутує ignoreSc)
const exp = JSON.parse(expRaw);
const url = `http://localhost:${PORT}/atoms/${BASE_ATOM}/${JSON.parse(cfgRaw).url}`;

const vdir = path.join(ATOM_DIR, 'variants');
const htmls = fs.readdirSync(vdir).filter(f => f.endsWith('.html')).sort().map(f => fs.readFileSync(path.join(vdir, f)));
const baseInputsHash = sha(Buffer.concat([...htmls, Buffer.from(sha(cfgRaw) + sha(expRaw))]));

const chromium = await resolveChromium();
if (!chromium) { console.error('calibrate: chromium не резолвиться'); process.exit(2); }
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const ctx2 = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });

async function runCase(inj){
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
  if (inj) await page.evaluate(inj.js);
  const pipe = await runPipeline(page, baseCfg(), exp, TH, ATOM_DIR);
  await page.close();
  const failed = [...new Set(pipe.results.filter(r => !r.pass).map(r => r.dimension))];
  return failed;
}

// ── S55: ЧЕРНЕТКОВИЙ РЕЖИМ --only ───────────────────────────────────────────
// Навіщо. Повна калібрація це ~34 прогони браузера і 35-40 хвилин. За додавання ОДНІЄЇ гілки
// в детектор я платив цю ціну повністю, і саме це змушувало уникати покращень вимірників,
// тобто система чинила опір власному розвитку (рада S55, пункт 1.3).
// --only <підрядок> ганяє лише кейси, чиї назви його містять.
// 🔴 ЦЕ ЛИШЕ ЧЕРНЕТКА. Звіт із неповної матриці НЕ пишеться на диск, тому self-check і далі
// вимагатиме ПОВНОГО прогону перед показом. Скоротити можна цикл розробки, не доказ.
const ONLY = (() => { const i = process.argv.indexOf('--only'); return i >= 0 ? process.argv[i + 1] : null; })();
const skip = (name) => ONLY && !name.toLowerCase().includes(ONLY.toLowerCase());

const matrix = [];
console.log('\nКАЛІБРАЦІЯ харнеса на ' + BASE_ATOM + ' (база + ' + INJECTORS.length + ' інжекторів + media-пара)'
  + (ONLY ? `\n  ⚠️ ЧЕРНЕТКОВИЙ режим --only "${ONLY}": звіт НЕ пишеться, повний прогін усе одно потрібен` : '') + '\n');

// ── база: прийнятий атом мусить бути чистим ──────────────────────────────────
{
  const failed = await runCase(null);
  const ok = failed.length === 0;
  matrix.push({ name: 'BASE-accepted', primary: null, failed, ok });
  console.log(`  ${ok ? '✓' : '✗'} BASE-accepted: ${ok ? 'all-green' : 'FAIL у base?! ' + failed.join(',')}`);
}

// ── інжектори ────────────────────────────────────────────────────────────────
for (const inj of INJECTORS) {
  if (skip(inj.name)) continue;
  const failed = await runCase(inj);
  let ok, note;
  if (inj.primary === null) {          // NEG: усі мусять пройти
    ok = failed.length === 0;
    note = ok ? 'benign → all-pass (надчутливості нема)' : 'НАДЧУТЛИВІСТЬ: впало ' + failed.join(',');
  } else {
    const allowed = new Set([inj.primary, ...inj.expectedSecondary]);
    ok = failed.includes(inj.primary) && failed.every(d => allowed.has(d));
    note = failed.includes(inj.primary)
      ? (ok ? `зловлено ${inj.primary}` + (failed.length > 1 ? ` (+каскад: ${failed.filter(d => d !== inj.primary).join(',')})` : '')
            : `зловлено, АЛЕ невиправданий каскад: ${failed.filter(d => !allowed.has(d)).join(',')}`)
      : `ПРОПУЩЕНО ${inj.primary}! (впало: ${failed.join(',') || 'нічого'})`;
  }
  matrix.push({ name: inj.name, primary: inj.primary, failed, ok });
  console.log(`  ${ok ? '✓' : '✗'} ${inj.name}: ${note}`);
}

// ── FIX-12: media-пара (синтетика, окремий time-домен) ───────────────────────
{
  const page = await ctx.newPage();
  await page.setContent('<canvas id="c" width="64" height="64"></canvas><video id="v" muted></video>');
  // paused: відео з потоком, але БЕЗ play
  await page.evaluate(() => {
    const c = document.getElementById('c'), v = document.getElementById('v');
    const cx = c.getContext('2d');
    setInterval(() => { cx.fillStyle = '#' + (Math.random() * 0xfff | 0).toString(16).padStart(3, '0'); cx.fillRect(0, 0, 64, 64); }, 33);
    v.srcObject = c.captureStream(30);
  });
  const paused = await probeMediaType(page, TH);
  await page.evaluate(() => document.getElementById('v').play());
  await page.waitForTimeout(150);
  const playing = await probeMediaType(page, TH);
  await page.close();
  const ok = paused.pass === false && playing.pass === true;
  matrix.push({ name: 'FIX-12-media-pair', primary: 'media-type', failed: [], ok, detail: `paused:${paused.pass} playing:${playing.pass}` });
  console.log(`  ${ok ? '✓' : '✗'} FIX-12-media-pair: paused=${paused.pass ? 'PASS(?!)' : 'FAIL✓'} · playing=${playing.pass ? 'PASS✓' : 'FAIL(?!) ' + playing.detail}`);
}

// ── FADE-вимір на promenade-базі (S46: новий клас механіки title-fade) ───────
// wellness не має fade-таргета, тому fade калібрується на promenade (другий атом-база).
// БАЗА promenade all-green (для fade) + INJ-14 (title НЕ бліднути) → fade FAIL.
{
  const PROM = 'amenities-promenade';
  const pdir = path.join(REPO, 'library/techniques/atoms', PROM);
  if (fs.existsSync(path.join(pdir, 'self-check.config.json'))) {
    const pcfgRaw = fs.readFileSync(path.join(pdir, 'self-check.config.json'), 'utf8');
    const pexp = JSON.parse(fs.readFileSync(path.join(pdir, 'expectations.json'), 'utf8'));
    const purl = `http://localhost:${PORT}/atoms/${PROM}/${JSON.parse(pcfgRaw).url}`;
    const runProm = async (injJs) => {
      const page = await ctx2.newPage();
      await page.goto(purl, { waitUntil: 'networkidle', timeout: 20000 });
      if (injJs) await page.evaluate(injJs);
      const pipe = await runPipeline(page, JSON.parse(pcfgRaw), pexp, TH, pdir);
      await page.close();
      return [...new Set(pipe.results.filter(r => !r.pass).map(r => r.dimension))];
    };
    // база promenade: fade мусить пройти (title бліднути 0.48-0.62)
    const baseFailed = await runProm(null);
    const baseOk = baseFailed.length === 0;   // база promenade = ПОВНІСТЮ чиста (fade + surface + решта)
    matrix.push({ name: 'BASE-promenade', primary: null, failed: baseFailed, ok: baseOk });
    console.log(`  ${baseOk ? '✓' : '✗'} BASE-promenade: ${baseOk ? 'all-green' : 'FAIL у базі: ' + baseFailed.join(',')}`);
    // INJ-14: title НЕ бліднути (opacity лишається 1) → fade FAIL
    const inj14 = `(()=>{const o=window.render,t=document.getElementById('titleblock');
      window.render=function(p){o(p);t.style.opacity=1;};window.render(0);})()`;
    const f14 = await runProm(inj14);
    const ok14 = f14.includes('fade');
    matrix.push({ name: 'INJ-14-title-no-fade', primary: 'fade', failed: f14, ok: ok14 });
    console.log(`  ${ok14 ? '✓' : '✗'} INJ-14-title-no-fade: ${ok14 ? 'зловлено fade' : 'ПРОПУЩЕНО fade!'}`);
    // INJ-15-no-band (S46, баг ока Єгора як fixture): панель НЕ заходить → live має шов/панель,
    // у нас нема → surface-parity FAIL (+каскад: band-таргет не рухається → channel-identity, timing)
    const inj15 = `(()=>{const o=window.render,b=document.getElementById('band');
      window.render=function(p){o(p);b.style.transform='translateY(100dvh)';};window.render(0);})()`;
    const f15 = await runProm(inj15);
    // S49: + structure-parity — придушена панель = зникла COVER-подія зони; scale-aware
    // екстрактор (bestBandDists) тепер ловить це І структурно. Виправданий каскад
    // (та сама причина, суворіший детектор), не флап: BASE-promenade лишається all-green.
    const allowed15 = new Set(['surface-parity', 'channel-identity', 'timing', 'structure-parity']);
    const ok15 = f15.includes('surface-parity') && f15.every(d => allowed15.has(d));
    matrix.push({ name: 'INJ-15-no-band', primary: 'surface-parity', failed: f15, ok: ok15 });
    console.log(`  ${ok15 ? '✓' : '✗'} INJ-15-no-band: ${ok15 ? 'зловлено surface-parity' + (f15.length>1?' (+каскад: '+f15.filter(d=>d!=='surface-parity').join(',')+')':'') : 'ПРОПУЩЕНО surface-parity! (впало: ' + (f15.join(',') || 'нічого') + ')'}`);
    // INJ-16-static-tiles (S47, баг ока Єгора як fixture): хвіст-плитки = СТАТИЧНІ (не свайп-стрічка).
    // overflow-x:hidden → трек не переповнений + програмний scrollLeft не рухає → swipe-strip FAIL.
    // Це рівно баг ітерації-1 promenade (2 статичні картинки замість свайпового колажу).
    const inj16 = `(()=>{const el=document.getElementById('tiles');
      el.style.overflowX='hidden';el.style.scrollSnapType='none';el.scrollLeft=0;})()`;
    const f16 = await runProm(inj16);
    const ok16 = f16.includes('swipe-strip');
    matrix.push({ name: 'INJ-16-static-tiles', primary: 'swipe-strip', failed: f16, ok: ok16 });
    console.log(`  ${ok16 ? '✓' : '✗'} INJ-16-static-tiles: ${ok16 ? 'зловлено swipe-strip' + (f16.length>1?' (+каскад: '+f16.filter(d=>d!=='swipe-strip').join(',')+')':'') : 'ПРОПУЩЕНО swipe-strip! (впало: ' + (f16.join(',') || 'нічого') + ')'}`);
  }
}

// ── STRUCT-калібрація (S48 ratchet v2, план ради S47 крок 6) — калібрація рівня
// ІНТЕРПРЕТАЦІЇ, не реалізації. НЕГАТИВИ: архівні хибні ітерації ivy (довічні в git,
// negative-etalons/) МУСЯТЬ FAIL structure-parity проти live-токенів zone-track.
// ПОЗИТИВИ: прийняті атоми МУСЯТЬ PASS (анти-надчутливість). Правило назавжди:
// «вимір що не валить старі провали — не вимір».
{
  const { runStructureStage } = await import('./self-check.mjs');
  const D2 = await import('./detectors/core.mjs');
  const STRUCT_CASES = [
    { name: 'STRUCT-POS-borges', atom: 'amenities-borges', file: 'variants/borges.html', mustPass: true },
    { name: 'STRUCT-POS-promenade', atom: 'amenities-promenade', file: 'variants/promenade.html', mustPass: true },
    { name: 'STRUCT-POS-wellness', atom: 'amenities-wellness', file: 'variants/wellness.html', mustPass: true },
    { name: 'STRUCT-POS-ivy', atom: 'amenities-ivy', file: 'variants/ivy.html', mustPass: true },  // S49: прийнято оком («так, тепер ідеально») → позитивний еталон
    { name: 'STRUCT-NEG-ivy-it1-split', atom: 'amenities-ivy', file: 'negative-etalons/ivy-it1-split-title-hold.html', mustPass: false },
    { name: 'STRUCT-NEG-ivy-it2-strip', atom: 'amenities-ivy', file: 'negative-etalons/ivy-it2-continuous-strip.html', mustPass: false },
  ];
  for (const c of STRUCT_CASES) {
    const adir = path.join(REPO, 'library/techniques/atoms', c.atom);
    const page = await ctx.newPage();
    let ok = false, note = '';
    try {
      await page.goto(`http://localhost:${PORT}/atoms/${c.atom}/${c.file}`, { waitUntil: 'networkidle', timeout: 20000 });
      const st = await runStructureStage(page, adir, TH);
      if (st.error) { ok = false; note = 'stage error: ' + st.error; }
      else {
        const rs = D2.detectStructureParity(st.ref, st.ourTokens, st.ourClass, st.ourUnknowns);
        const allPass = rs.every(r => r.pass);
        ok = c.mustPass ? allPass : !allPass;
        note = c.mustPass
          ? (allPass ? 'прийнятий атом PASS проти live' : 'НАДЧУТЛИВІСТЬ: прийнятий FAIL: ' + rs.filter(r => !r.pass).map(r => r.name).join(','))
          : (allPass ? 'ПРОПУЩЕНО архівний провал (structure-parity беззубий!)' : 'архівний провал зловлено: ' + rs.filter(r => !r.pass).map(r => r.name).join(','));
      }
    } catch (e) { ok = false; note = 'crash: ' + e.message; }
    await page.close();
    matrix.push({ name: c.name, primary: 'structure-parity', failed: [], ok });
    console.log(`  ${ok ? '✓' : '✗'} ${c.name}: ${note}`);
  }
  // mechanic-class (чисті функції, без браузера): config без класу / з хибним класом → FAIL; вірний → PASS
  const liveRef = JSON.parse(fs.readFileSync(path.join(REPO, 'library/techniques/atoms/amenities-ivy/reference/ivy-live.zonetrack.json'), 'utf8'));
  const mcWrong = D2.detectMechanicClass(liveRef, { mechanicClass: 'strip' }, {});
  const mcNone = D2.detectMechanicClass(liveRef, {}, {});
  const mcRight = D2.detectMechanicClass(liveRef, { mechanicClass: 'pin+swap' }, {});
  const okMc = mcWrong.some(r => !r.pass) && mcNone.some(r => !r.pass) && mcRight.every(r => r.pass);
  matrix.push({ name: 'MC-class-vs-live-triplet', primary: 'mechanic-class', failed: [], ok: okMc });
  console.log(`  ${okMc ? '✓' : '✗'} MC-class-vs-live-triplet: wrong=FAIL ${mcWrong.some(r => !r.pass)} · none=FAIL ${mcNone.some(r => !r.pass)} · right=PASS ${mcRight.every(r => r.pass)}`);

  // ── ratchet виміру COMPOSITION-STATIC (S51-d, дірка з ОКА Єгора на спекс-блоці parking).
  // POS: виправлений атом мусить PASS. NEG: архівна версія «3 hairline + текст притиснутий до
  // лінії + вага .35» МУСИТЬ впасти. Правило назавжди: «вимір що не валить старий провал — не вимір».
  {
    const { runCompositionStage } = await import('./self-check.mjs');
    const adir = path.join(REPO, 'library/techniques/atoms/amenities-parking');
    const ccfg = JSON.parse(fs.readFileSync(path.join(adir, 'self-check.config.json'), 'utf8'));
    const COMP_CASES = [
      { name: 'COMP-POS-parking-spec', file: 'variants/parking.html', mustPass: true },
      { name: 'COMP-NEG-parking-3-hairlines', file: 'negative-etalons/parking-spec-3-hairlines.html', mustPass: false },
    ];
    for (const c of COMP_CASES) {
      const page = await ctx.newPage();
      let ok = false, note = '';
      try {
        await page.goto(`http://localhost:${PORT}/atoms/amenities-parking/${c.file}`, { waitUntil: 'networkidle', timeout: 20000 });
        const r = await runCompositionStage(page, ccfg, adir, TH);
        if (r.error) { ok = false; note = 'stage error: ' + r.error; }
        else {
          const diffs = r.rows.flatMap(x => x.diffs);
          ok = c.mustPass ? diffs.length === 0 : diffs.length > 0;
          note = c.mustPass
            ? (diffs.length === 0 ? 'виправлений спекс-блок PASS проти live' : 'НАДЧУТЛИВІСТЬ: ' + diffs.map(d => d.kind).join(','))
            : (diffs.length ? 'архівний провал зловлено: ' + [...new Set(diffs.map(d => d.kind))].join(',') : 'ПРОПУЩЕНО архівний провал (composition-static беззубий!)');
        }
      } catch (e) { ok = false; note = 'crash: ' + e.message; }
      await page.close();
      matrix.push({ name: c.name, primary: 'composition-static', failed: [], ok });
      console.log(`  ${ok ? '✓' : '✗'} ${c.name}: ${note}`);
    }
  }

  // ── ratchet брами Z (S51, закон B23: новий вимір → свій інжектор). СИНТЕТИЧНІ кадри з
  // ВІДОМОЮ відповіддю: зум-аут і зум-ін МУСЯТЬ читатись scale-motion, накриття і чиста
  // трансляція — НІ. Без відео й браузера. Ловить зняття/послаблення брами, злам двонапрямного
  // фіту (при зумі-аут прообраз зони БІЛЬШИЙ за кадр) і зняття локального уточнення —
  // ще до будь-якого атома. Саме так S51 і знайшов хибний пропуск істинного k=0.40.
  const { zoomFixtures, ZOOM_RECT, coverGateFixtures, COVER_DECL } = await import('./calibration/zoom-fixtures.mjs');
  const { isScaleMotion, extractTrack, coverEvents } = await import('./lib/zonetrack.mjs');
  for (const fx of zoomFixtures()) {
    const r = isScaleMotion(fx.frames, ZOOM_RECT, 0, 1, TH);
    const ok = r.scaleMotion === fx.mustBeScale;
    matrix.push({ name: fx.name, primary: 'structure-parity', failed: [], ok });
    console.log(`  ${ok ? '✓' : '✗'} ${fx.name}: scaleMotion=${r.scaleMotion} (очік ${fx.mustBeScale})`
      + ` k=${r.kBest} dScale=${r.dScale} dTrans=${r.dTrans} gain×${r.gainRatio}`
      + (ok ? '' : ` ← ${fx.note}`));
  }

  // ── S52 ratchet: брама Z на рівні coverEvents у ТЕКСТОВІЙ зоні (вердикт Єгора на
  // мікро-борді «зняти media-обмеження з Z»). Фікстури вище смикають isScaleMotion НАПРЯМУ,
  // тому kind-гейт не перевіряли взагалі, а живого накриття в text-зоні в 5 атомах немає.
  // Кейс з mustCover=0 додатково перевіряється НА ВИРОДЖЕНІСТЬ: з вимкненою Z той самий вхід
  // МУСИТЬ дати події (інакше «0 подій» нічого не доводить).
  for (const fx of coverGateFixtures()) {
    const run = (th) => coverEvents(fx.frames, extractTrack(fx.frames, COVER_DECL, th), th);
    const ev = run(TH).length;
    const evNoZ = fx.mustCover === 0 ? run({ ...TH, ztZoomGainMin: 1e9 }).length : null;
    const ok = ev === fx.mustCover && (evNoZ === null || evNoZ > 0);
    matrix.push({ name: fx.name, primary: 'structure-parity', failed: [], ok });
    console.log(`  ${ok ? '✓' : '✗'} ${fx.name}: подій=${ev} (очік ${fx.mustCover})`
      + (evNoZ === null ? '' : ` · без Z=${evNoZ} (антивиродженість: мусить бути >0)`)
      + (ok ? '' : ` ← ${fx.note}`));
  }
}

await b.close();

const pass = matrix.every(m => m.ok);
const report = { pass, ts: new Date().toISOString(), baseAtom: BASE_ATOM, thresholdsSha: thr.sha,
  harnessHash: harnessHash(), baseInputsHash, matrix };
// S55: у чернетковому режимі звіт НЕ пишеться. Інакше неповна матриця виглядала б для
// self-check як свіжий доказ, і --only став би дірою в анти-застарюванні замість зручності.
if (!ONLY) fs.writeFileSync(path.join(__dirname, 'calibration-report.json'), JSON.stringify(report, null, 2));

console.log(`\n${pass ? 'КАЛІБРАЦІЯ PASS ✅' : 'КАЛІБРАЦІЯ FAIL ❌'}  (${matrix.filter(m => m.ok).length}/${matrix.length})`
  + (ONLY ? '  ⚠️ ЧЕРНЕТКА, звіт не записано, потрібен ПОВНИЙ прогін' : ' → scripts/calibration-report.json'));
if (!pass) console.log('  🔴 харнесу НЕ можна довіряти поки матриця не зелена. Доробляй детектори/пороги (пороги = підпис Єгора).');
process.exit(pass ? 0 : 1);
