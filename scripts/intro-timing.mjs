/* ============================================================
   INTRO-TIMING EXTRACTOR (трек springs, S12a) — ЧАСОВИЙ запис інтро-фази
   ------------------------------------------------------------
   Проблема (розкопки S11): інтро-морф hero має ЧАСОВУ компоненту —
   live НА ОСІЛОМУ input=150 значно попереду нашого інтро-стану
   (авто-програвання timed-переходу після жесту, той самий клас, що
   вайпи wellness, пастка 44). Інтро-криві animation-map зняті
   journey-контаміновано (кадри за input, поки грає час).

   Метод: rAF-рекордер ЗМІН (як timing-map) стартує ДО зникнення
   прелоадера → блок 'auto' (авто-фаза морфа після прелоадера);
   далі жести КАДЕНСОМ live-shots (dist 150 → подвоєння до 600,
   ті самі осілі input'и 0/150/450/1050, що й пікс-пози) — блок на
   кожен жест з кадрами за час і ОСІЛИМ фіналом. Вихід за інтро
   (одометр зрушив) = блок 'exit' (реальний iEnd-інпут).

   Цілі: піддерево .l-gallery-container (hero-gallery + gallery-split
   спільним записом — морф живе в ОБОХ), тег секції на кожній цілі.

   Вихід: extraction/<site>/intro-timing.json

   S12a-розкопка: фаза каруселі hero МІЖ прогонами не відтворюється
   (tx зсунуті глобальним дрейф-офсетом 258px + wrap-стрибки клітинок;
   анімація заякорена на клок прогону) — тому BASELINE-ШОТИ інтро-поз
   знімає ЦЕЙ ЖЕ прогін на dt≈SHOT_AT_MS усередині блоку і пише їх
   у shots-manifest з ТОЧНИМ idt (пози ?intro=I&idt=<dtShot>).

   Запуск: PLAYWRIGHT_FROM=... node scripts/intro-timing.mjs springs-home
     [--gestures 8] [--origin URL] [--no-shots]
   ============================================================ */
import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { resolveChromium, SITES, VIEWPORTS } from './token-extractor.mjs';

const siteName = process.argv[2];
const site = SITES[siteName];
if (!site) { console.error(`вкажи: node scripts/intro-timing.mjs <${Object.keys(SITES).join('|')}>`); process.exit(1); }
const argOf = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const origin = argOf('--origin', site.liveOrigin);
const MAX_GESTURES = parseInt(argOf('--gestures', '8'), 10);
const TAKE_SHOTS = !process.argv.includes('--no-shots');
const SHOT_AT_MS = 12000; /* пізня стабільна фаза (вайпи завершені, лишається ambient-дрейф) */
const liveDir = join(site.outDir, 'visual', 'live');

const chromium = await resolveChromium();
if (!chromium) { console.error('playwright не резолвиться (PLAYWRIGHT_FROM?)'); process.exit(1); }

/* цілі інтро-морфа: контейнер hero (l-gallery + сиблінг l-gallery__split);
   семпл ІДЕНТИЧНИЙ timing-map (transform/o/clip/bg/disp/bbox) */
const SETUP_FN = () => {
  const cont = document.querySelector('.l-gallery-container') || document.querySelector('.l-gallery')?.parentElement;
  if (!cont) return { error: 'l-gallery-container не знайдено' };
  const split = cont.querySelector('.l-gallery__split');
  const set = new Set([cont.querySelector('.l-gallery'), split].filter(Boolean));
  for (const el of cont.querySelectorAll('*')) {
    if (set.size >= 40) break;
    const cs = getComputedStyle(el);
    if (cs.transform !== 'none' || (cs.clipPath && cs.clipPath !== 'none')) set.add(el);
  }
  for (const [q, quota] of [
    ['.l-gallery__split *', 16], ['[class*="mask"]', 12],
    ['.js-gallery-item', 20], ['[class*="gradient"]', 4],
    ['[class*="title"]', 4], ['h1,h2', 3],
    ['picture', 12], ['img', 24], ['[data-reveal]', 6],
  ]) {
    let added = 0;
    for (const el of cont.querySelectorAll(q)) {
      if (added >= quota || set.size >= 140) break;
      if (!set.has(el)) { set.add(el); added++; }
    }
  }
  window.__IT_TARGETS__ = [...set];
  /* сторінковий s — корінь intro (чистий потік, як live-shots) */
  const sEl = [...document.querySelectorAll('.l-intro')].find((e) =>
    e.getBoundingClientRect().width > 1 && getComputedStyle(e).display !== 'none');
  window.__IT_S0__ = sEl ? sEl.getBoundingClientRect().top : null;
  window.__IT_S__ = () => (sEl && window.__IT_S0__ !== null
    ? Math.round((window.__IT_S0__ - sEl.getBoundingClientRect().top) * 10) / 10 : null);
  const r1v = (v) => Math.round(v * 10) / 10;
  window.__IT_SAMPLE__ = () => ({
    s: window.__IT_S__(),
    targets: window.__IT_TARGETS__.map((t) => {
      const cs = getComputedStyle(t);
      const r = t.getBoundingClientRect();
      return {
        transform: cs.transform,
        opacity: cs.opacity,
        clipPath: cs.clipPath !== 'none' ? cs.clipPath : undefined,
        bg: cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? cs.backgroundColor : undefined,
        disp: cs.display === 'none' ? 'none' : undefined,
        top: r1v(r.top), left: r1v(r.left), w: r1v(r.width), h: r1v(r.height),
      };
    }),
  });
  window.__IT_REC__ = { buf: [], lastKey: null };
  const keyOf = (f) => Math.round(f.s || 0) + '|' + f.targets.map((t) =>
    `${t.opacity}~${t.clipPath || ''}~${t.transform}~${t.bg || ''}~${t.disp || ''}~${Math.round(t.top)}`).join(';');
  (function recLoop() {
    const rec = window.__IT_REC__;
    if (rec.buf.length < 8000) {
      const f = window.__IT_SAMPLE__();
      const k = keyOf(f);
      if (k !== rec.lastKey) { rec.buf.push({ tMs: Math.round(performance.now() * 10) / 10, ...f }); rec.lastKey = k; }
    }
    requestAnimationFrame(recLoop);
  })();
  return {
    targets: window.__IT_TARGETS__.map((el, i) => {
      const im = el.tagName === 'IMG' ? el : el.querySelector('img');
      let rawSrc = im ? (im.currentSrc || im.src || '') : '';
      if (rawSrc.startsWith('data:')) rawSrc = (im.getAttribute('data-src') || '');
      return {
        i,
        sec: el.closest('.l-gallery__split') ? 'gallery-split' : 'hero-gallery',
        tag: el.tagName.toLowerCase(),
        cls: typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 5).join(' ') : '',
        text: (el.textContent || '').replace(/[^\S ]+/g, ' ').trim().slice(0, 40),
        src: rawSrc ? rawSrc.split('?')[0].split('/').pop() : undefined,
      };
    }),
  };
};

const DRAIN_FN = () => { const b = window.__IT_REC__.buf; window.__IT_REC__.buf = []; return b; };
const NOW_FN = () => Math.round(performance.now() * 10) / 10;

async function waitQuiet(page, maxMs = 7000, quietMs = 700) {
  const t0 = Date.now();
  let lastLen = -1, quietSince = Date.now();
  while (Date.now() - t0 < maxMs) {
    await page.waitForTimeout(180);
    const len = await page.evaluate(() => window.__IT_REC__.buf.length);
    if (len !== lastLen) { lastLen = len; quietSince = Date.now(); }
    else if (Date.now() - quietSince >= quietMs) break;
  }
}

const browser = await chromium.launch();
const vp = VIEWPORTS.desktop;
const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await page.goto(origin + site.livePath, { waitUntil: 'domcontentloaded', timeout: 60000 });
/* setup РАНО — рекордер має бачити авто-фазу морфа ПІСЛЯ прелоадера */
await page.waitForTimeout(1800);
const picked = await page.evaluate(SETUP_FN);
if (picked.error) { console.error(`ПОМИЛКА: ${picked.error}`); await browser.close(); process.exit(1); }
console.log(`цілей: ${picked.targets.length} (split: ${picked.targets.filter((t) => t.sec === 'gallery-split').length})`);

/* прелоадер ховається ~7с (пастка 34) — блок 'auto' = кадри від його
   зникнення до тиші (авто-програвання інтро-морфа, якщо воно є) */
await page.waitForFunction(() => {
  const p = document.querySelector('.js-preloader');
  return !p || getComputedStyle(p).display === 'none' || parseFloat(getComputedStyle(p).opacity) < 0.05;
}, { timeout: 25000 }).catch(() => console.log('УВАГА: прелоадер не зник за 25с'));
const tHide = await page.evaluate(NOW_FN);
/* кукі-банер прибрати ДО шота */
for (const sel of ['.js-cookie-consent-accept', 'button:has-text("ACCEPT")']) {
  try { await page.click(sel, { timeout: 1000 }); break; } catch {}
}
/* авто-морф грає ~9.5с+ — чекаємо до пізньої стабільної фази, знімаємо
   baseline-шот ЦЬОГО прогону (той самий клок, що й кадри) */
if (TAKE_SHOTS) mkdirSync(liveDir, { recursive: true });
const shots = [];
const takeShot = async (name) => {
  if (!TAKE_SHOTS) return null;
  const t = await page.evaluate(NOW_FN);
  try { await page.screenshot({ path: join(liveDir, name), timeout: 45000 }); }
  catch (e) { console.log(`  ШОТ ПРОПУЩЕНО (${name}): ${String(e.message).split('\n')[0]}`); return null; }
  return { file: name, tShot: t };
};
await page.waitForTimeout(SHOT_AT_MS);
const shot0 = await takeShot('desktop-intro0.png');
if (shot0) shots.push({ ...shot0, input: 0 });
await page.waitForTimeout(1500);
const autoFramesAll = await page.evaluate(DRAIN_FN);
const autoFrames = autoFramesAll.filter((f) => f.tMs >= tHide - 100);
const blocks = [];
const mkBlock = (kind, input, frames) => {
  const t0f = frames.length ? frames[0].tMs : 0;
  return {
    kind, input, t0Ms: t0f,
    sSettled: frames.length ? frames[frames.length - 1].s : null,
    durMs: frames.length ? Math.round((frames[frames.length - 1].tMs - t0f) * 10) / 10 : 0,
    frames: frames.map((f) => ({ dt: Math.round((f.tMs - t0f) * 10) / 10, s: f.s, targets: f.targets })),
  };
};
/* блок 0: якщо авто-кадрів нема — все одно фіксуємо ОСІЛИЙ стан intro0 */
if (!autoFrames.length) {
  const one = await page.evaluate(() => window.__IT_SAMPLE__());
  autoFrames.push({ tMs: tHide, ...one });
}
blocks.push(mkBlock('auto', 0, autoFrames));
console.log(`блок auto: кадрів ${autoFrames.length} · тривалість ${blocks[0].durMs}мс`);

let input = 0, dist = 150, exited = false, introShots = 0;
for (let g = 1; g <= MAX_GESTURES && !exited; g++) {
  await page.evaluate(DRAIN_FN);
  const tG = await page.evaluate(NOW_FN);
  await cdp.send('Input.synthesizeScrollGesture', {
    x: Math.round(vp.width / 2), y: Math.round(vp.height / 2),
    yDistance: -dist, speed: 1200, gestureSourceType: 'mouse',
  });
  input += dist;
  await page.waitForTimeout(SHOT_AT_MS);
  const sMid = await page.evaluate(() => window.__IT_S__());
  if (sMid !== null && Math.abs(sMid) <= 2 && introShots < 3) {
    const sh = await takeShot(`desktop-intro${input}.png`);
    if (sh) { shots.push({ ...sh, input }); introShots++; }
  }
  await page.waitForTimeout(1500);
  const frames = (await page.evaluate(DRAIN_FN)).filter((f) => f.tMs >= tG - 50);
  const s = await page.evaluate(() => window.__IT_S__());
  if (s !== null && Math.abs(s) > 2) {
    exited = true;
    blocks.push(mkBlock('exit', input, frames));
    console.log(`жест ${g}: input=${input} → ВИХІД З ІНТРО (s=${s}) · кадрів ${frames.length}`);
  } else {
    /* якщо жест не дав ЖОДНОГО кадру — стан не змінився, все одно семпл */
    if (!frames.length) {
      const one = await page.evaluate(() => window.__IT_SAMPLE__());
      frames.push({ tMs: tG, ...one });
    }
    blocks.push(mkBlock('step', input, frames));
    console.log(`жест ${g}: input=${input} · кадрів ${frames.length} · перехід ${blocks[blocks.length - 1].durMs}мс · s=${s}`);
  }
  dist = Math.min(dist * 2, 600);
}
await browser.close();

/* шоти → shots-manifest: idt = ТОЧНИЙ dt шота відносно ПЕРШОГО КАДРУ
   блоку (та сама вісь, що introT-кадри) — той самий прогін, той самий клок */
if (TAKE_SHOTS && shots.length) {
  const manPath = join(liveDir, 'shots-manifest.json');
  let man = { poses: [] };
  try { man = JSON.parse(readFileSync(manPath, 'utf8')); } catch {}
  const blockByInput = Object.fromEntries(blocks.map((b) => [b.input, b]));
  const newPoses = [];
  for (const sh of shots) {
    const blk = blockByInput[sh.input];
    if (!blk || !blk.frames.length) continue;
    const dtShot = Math.round(sh.tShot - blk.t0Ms);
    newPoses.push({ vp: 'desktop', kind: 'intro', value: sh.input, file: sh.file, idt: dtShot });
    console.log(`шот ${sh.file}: idt=${dtShot}`);
  }
  man.poses = (man.poses || []).filter((p) => !(p.vp === 'desktop' && p.kind === 'intro')).concat(newPoses);
  writeFileSync(manPath, JSON.stringify(man, null, 1));
  console.log(`shots-manifest оновлено (${newPoses.length} інтро-поз)`);
}

/* самоперевірки: цілі є; осілі input'и пікс-поз (150, 450) записані;
   морф РЕАЛЬНО рухається (стан 150 ≠ стан 0) */
const stepInputs = blocks.filter((b) => b.kind === 'step').map((b) => b.input);
const settledOf = (inp) => blocks.find((b) => b.input === inp && b.kind !== 'exit');
const st0 = settledOf(0), st150 = settledOf(150);
const stateKey = (b) => b && b.frames.length
  ? b.frames[b.frames.length - 1].targets.map((t) => `${t.transform}~${t.clipPath || ''}~${t.opacity}`).join(';') : '';
const fail = [
  picked.targets.length < 10 ? `лише ${picked.targets.length} цілей` : null,
  !stepInputs.includes(150) || !stepInputs.includes(450) ? `нема осілих input 150/450 (є: ${stepInputs})` : null,
  st0 && st150 && stateKey(st0) === stateKey(st150) ? 'стан(150) == стан(0) — морф не зафіксовано' : null,
  !exited ? 'інтро не вийшло за ' + MAX_GESTURES + ' жестів — iEnd не підтверджено' : null,
].filter(Boolean);
const result = {
  at: new Date().toISOString(), site: siteName, origin,
  method: 'rAF-рекордер ЗМІН від domcontentloaded; блок auto після прелоадера; жести каденсом live-shots (150→подвоєння до 600); блок на жест; exit = вихід з інтро',
  viewports: { desktop: { targets: picked.targets, blocks, selfCheck: { gestures: blocks.length - 1, exited, exitInput: exited ? input : null, fail } } },
};
mkdirSync(site.outDir, { recursive: true });
const out = join(site.outDir, 'intro-timing.json');
writeFileSync(out, JSON.stringify(result));
console.log(`OK → ${out}${fail.length ? ' · САМОПЕРЕВІРКА: ' + fail.join(' · ') : ''}`);
process.exit(fail.length ? 1 : 0);
