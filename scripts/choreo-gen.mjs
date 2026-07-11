/* ============================================================
   CHOREO-GEN (трек springs, S3) — хореографія каркаса З ЕКСТРАКТІВ
   ------------------------------------------------------------
   Вхід (ТІЛЬКИ вивід екстракторів, закон №2):
     extraction/<site>/scene-map.json            — сцена: офсети/травели/драбина
     extraction/<site>/animation-map-<sec>.json  — криві цілей 3 секцій
   Вихід:
     library/combos/<site>/choreo.json — дані движку (сцена, драбина,
       інтро-гейт, per-target криві по s та по інтро-інпуту)
     library/combos/<site>/scene.css   — документна геометрія секцій
       (absolute top з rest-сцени, обидва вʼюпорти)

   Виведені (НЕ ручні) величини:
     iEnd інтро-гейта = лінійна екстраполяція насичення карусельної
     кривої (два останні s=0-семпли → інпут, де крива досягає
     фінального значення першого пост-інтро кадру).
   ============================================================ */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { SITES, REPO } from './token-extractor.mjs';

const siteName = process.argv[2];
const site = SITES[siteName];
if (!site) { console.error(`вкажи: node scripts/choreo-gen.mjs <${Object.keys(SITES).join('|')}>`); process.exit(1); }
const outDir = join(REPO, 'library/combos', siteName);
const scene = JSON.parse(readFileSync(join(site.outDir, 'scene-map.json'), 'utf8'));
/* усі секції конфігу, для яких існує знята карта (S6: динамічно —
   header та майбутні секції підхоплюються без правки коду) */
const MAPPED = site.sections.map((s) => s.id)
  .filter((id) => existsSync(join(site.outDir, `animation-map-${id}.json`)));
const maps = Object.fromEntries(MAPPED.map((id) => [
  id, JSON.parse(readFileSync(join(site.outDir, `animation-map-${id}.json`), 'utf8')),
]));
console.log(`карти секцій: ${MAPPED.join(', ')}`);
const textureMapPath = join(site.outDir, 'texture-map.json');
const textureMap = existsSync(textureMapPath) ? JSON.parse(readFileSync(textureMapPath, 'utf8')) : null;
const shellDataPath = join(site.outDir, 'shell-bg.json');
const shellData = existsSync(shellDataPath) ? JSON.parse(readFileSync(shellDataPath, 'utf8')) : null;
/* timing-карти (S8b): часові переходи при стоячому одометрі (вайпи
   wellness-слайдера) — s-карти їх сліпі (рекордер пише лише при русі
   одометра). Блоки з timing-map вливаються в біндінги як timed-кроки. */
const TIMED = {};
for (const id of site.sections.map((s) => s.id)) {
  const p = join(site.outDir, `timing-map-${id}.json`);
  if (existsSync(p)) TIMED[id] = JSON.parse(readFileSync(p, 'utf8'));
}
if (Object.keys(TIMED).length) console.log(`timing-карти: ${Object.keys(TIMED).join(', ')}`);

const r1 = (v) => Math.round(v * 10) / 10;
/* ПОВНА 2D-матриця [a,b,c,d,tx,ty] — у hero є РОТАЦІЯ (S3-розкопка:
   content matrix(.883,-.469,.469,.883) = поворот ~28°, не scale) */
const parseMatrix = (t) => {
  const mm = (t || '').match(/matrix(3d)?\(([^)]+)\)/);
  if (!mm) return null;
  const v = mm[2].split(',').map(Number);
  return mm[1] ? [v[0], v[1], v[4], v[5], v[12], v[13]] : v.slice(0, 6);
};

function buildViewport(vpName) {
  const sc = scene.viewports[vpName];
  if (!sc) return null;
  const sections = {};
  for (const s of sc.sections) sections[s.id] = { top0: s.top0, h: s.h };
  /* per-section травел-криві з ВІДХИЛЕННЯМ від чистого потоку (hero-пін,
     place-bg параллакс): пишемо dev(s) там, де він ненульовий */
  const travels = {};
  for (const s of sc.sections) {
    const devs = s.samples.map((x) => ({ s: r1(x.s), dev: r1(x.top - (s.top0 - x.s)) }));
    if (devs.some((d) => Math.abs(d.dev) > 1)) {
      /* стискаємо: сортуємо по s, унікальні s */
      const seen = new Set();
      const arr = devs
        .sort((a, b) => a.s - b.s)
        .filter((d) => { const k = Math.round(d.s); if (seen.has(k)) return false; seen.add(k); return true; });
      /* КОЛІНО ПІНА: між семплом де dev≈s (елемент пінований) і семплом-плато
         лінійна інтерполяція ріже кут — вставляємо точку зламу (s=плато,
         dev=плато): значення виведене з даних, не руками */
      for (let i = arr.length - 1; i > 0; i--) {
        const a = arr[i - 1], b = arr[i];
        if (Math.abs(a.dev - a.s) < 2 && Math.abs(b.dev - b.s) > 4 && b.dev > a.s + 4 && b.dev < b.s) {
          arr.splice(i, 0, { s: b.dev, dev: b.dev });
        }
      }
      travels[s.id] = arr;
    }
  }

  /* прив'язки цілей з animation-map: криві по s (скрол-фаза) і по
     інтро-інпуту (кадри при s=0 ДО першого руху одометра) */
  const bindings = [];
  let iEnd = null;
  for (const secId of MAPPED) {
    const vpMap = maps[secId].viewports[vpName];
    if (!vpMap || vpMap.error) continue;
    /* НОРМАЛІЗАЦІЯ осі s карти → сторінковий скрол: одометр карти =
       корінь секції; якщо секція має власний травел (hero пін 0..900),
       зсув кореня = page - dev(page) → page = mapS + devFinal для mapS>2.
       (dev монотонний і виходить на плато devFinal — з scene-map.) */
    const tr = travels[secId];
    /* нормалізація лише якщо проба-одометр карти = САМ корінь секції
       (звіряємо перший класовий токен проби з класом кореня зі сцени) */
    const probeTok = (vpMap.selfCheck?.odometerProbe || '').split(/\s+/)[0];
    const rootTok = (sc.sections.find((x) => x.id === secId)?.cls || '').split(/\s+/)[0];
    const probeIsRoot = probeTok && probeTok === rootTok;
    const devFinal = tr && probeIsRoot ? tr[tr.length - 1].dev : 0;
    const toPage = (mapS) => (mapS > 2 ? mapS + devFinal : mapS);
    for (const t of vpMap.targets) {
      const anim = t.moving.transform || t.moving.opacity || t.moving.clipPath || t.moving.bg;
      const firstMove = t.samples.findIndex((x) => Math.abs(x.s) > 2);
      const introSamples = t.samples.filter((x, i) => Math.abs(x.s) <= 2 && (firstMove < 0 || i < firstMove));
      const intro = [];
      if (secId === 'hero-gallery' && introSamples.length > 1) {
        for (const x of introSamples) {
          intro.push({ input: x.input, top: x.top, left: x.left, w: x.w, h: x.h, o: +x.opacity, m: parseMatrix(x.transform) });
        }
      }
      /* скрол-фаза: семпли по s (осілі + transient), унікальні по s.
         ЧИСТКА самонеузгоджених кластерів (принцип = виняток 5 CURVES-GATE):
         на слайдер-плато джитер одометра ±50 змішує temporal- і s-порядок —
         суперечливі точки (розкид top >10px в межах ±12px s) не визначають
         криву і псують інтерп коліна піна. Викидаємо ВЕСЬ такий кластер. */
      const raw = t.samples.slice(firstMove < 0 ? t.samples.length : Math.max(0, firstMove - 1));
      /* кластер 2px: лише МАЙЖЕ ОДНАКОВІ s — крутий схил (12px кластер
         давав хибний «шум» і дірку в кривій, розкопка іт.10) */
      const clusters = {};
      for (const x of raw) (clusters[Math.round(x.s / 2)] = clusters[Math.round(x.s / 2)] || []).push(x);
      const noisy = new Set();
      for (const [k, arr] of Object.entries(clusters)) {
        const tops = arr.map((x) => x.top);
        if (Math.max(...tops) - Math.min(...tops) > 10) noisy.add(k);
      }
      const seen = new Set();
      const curve = raw
        .filter((x) => !noisy.has(String(Math.round(x.s / 2))))
        .sort((a, b) => a.s - b.s)
        .filter((x) => { const k = Math.round(x.s); if (seen.has(k)) return false; seen.add(k); return true; })
        .map((x) => ({ s: r1(toPage(x.s)), top: x.top, left: x.left, w: x.w, h: x.h, o: +x.opacity, clip: x.clipPath, bg: x.bg, m: parseMatrix(x.transform) }));
      /* REVEAL-ЛАТЧ (S5-розкопка): one-shot ревіл (opacity 0→1 і стоїть) —
         подія тригера + часовий перехід, НЕ функція s: карта ловить
         transient-середину і «заморожує» її. Латчимо ВЛАСТИВОСТІ по
         ступеню (до s_reveal = стартові, після = фінальні), НЕ криву:
         bbox-динаміка (піни/потік) лишається. m латчиться лише якщо
         він анімується ТІЛЬКИ у вікні ревілу (інакше це паралакс). */
      if (curve.length > 2) {
        const os = curve.map((x) => x.o);
        const isRevealIn = os[0] <= 0.15 && os[os.length - 1] >= 0.9;
        if (isRevealIn) {
          /* точка тригера — з СИРИХ семплів (перший, де o>0.05: момент
             старту переходу; dedupe лишає ранні transient-середини і
             зсуває поріг на сусідній снап) */
          const rawSorted = [...raw].sort((a, b) => a.s - b.s);
          const trig = rawSorted.find((x) => +x.opacity > 0.05 && x.s > 2);
          const at = trig ? { s: r1(toPage(trig.s)) } : null;
          if (at) {
            const first = curve[0], last = curve[curve.length - 1];
            const post = curve.filter((x) => x.o >= 0.95);
            const tySpread = (arr) => {
              const tys = arr.map((x) => (x.m ? x.m[5] : 0));
              return tys.length ? Math.max(...tys) - Math.min(...tys) : 0;
            };
            const mOnlyReveal = tySpread(post) < 5;
            for (const x of curve) {
              const after = x.s >= at.s;
              x.o = after ? last.o : first.o;
              x.clip = after ? last.clip : first.clip;
              if (mOnlyReveal) x.m = after ? last.m : first.m;
            }
          }
        }
      }
      /* WEBGL-ФАЗА + ВАЙП-ЕКСТРАПОЛЯЦІЯ (S8b-розкопка): вміст wellness
         у live малює канвас, DOM-колонки (no-js фолбеки) стоять із
         zero-area clip усю канвас-фазу; вайп у слайдер-фазу карта ловить
         лише 2-3 mid-кадрами (межа плато, пастка 19) і НЕ бачить
         відкритого фіналу — cLast = 99.9%-закритий, старий clipStep
         степив у «майже закрите» (басейн зникав). Правда з даних:
         свіп-парам монотонно тікає від closed-значення → ТЕРМІНАЛ = 0
         або 100 (бік більшої площі), sOpen = лінійна екстраполяція
         mid-тренду до терміналу (той самий клас генерату, що iEnd S3). */
      let clipStep = null;
      let surrogateClip = false;
      {
        const polyArea = (c) => {
          const pts = ((c || '').match(/-?\d*\.?\d+/g) || []).map(Number);
          if (pts.length < 6) return null;
          let a = 0;
          for (let i = 0; i < pts.length; i += 2) {
            const x1 = pts[i], y1 = pts[i + 1];
            const x2 = pts[(i + 2) % pts.length], y2 = pts[(i + 3) % pts.length];
            a += x1 * y2 - x2 * y1;
          }
          return Math.abs(a / 2);
        };
        const clips = curve.map((x) => x.clip).filter(Boolean);
        if (clips.length && clips.length >= curve.length * 0.9) {
          const areas = clips.map(polyArea);
          const zeroShare = areas.filter((a) => a !== null && a < 1).length / areas.length;
          if (zeroShare >= 0.9 && areas.every((a) => a !== null)) {
            const numsOf = (c) => ((c || '').match(/-?\d*\.?\d+/g) || []).map(Number);
            const closedClip = clips[areas.findIndex((a) => a < 1)];
            const closedNums = numsOf(closedClip);
            const mids = curve.filter((x) => x.clip && polyArea(x.clip) >= 1)
              .map((x) => ({ s: x.s, nums: numsOf(x.clip) }))
              .sort((a, b) => a.s - b.s);
            let si = -1;
            if (mids.length >= 2) {
              for (let i = 0; i < closedNums.length; i++) {
                if (mids.some((m) => Math.abs((m.nums[i] ?? closedNums[i]) - closedNums[i]) > 1)) { si = i; break; }
              }
            }
            if (si > -1) {
              const c0 = closedNums[si];
              const dir = mids[mids.length - 1].nums[si] < c0 ? -1 : 1;
              const terminal = dir < 0 ? 0 : 100;
              const a = mids[0], b = mids[mids.length - 1];
              const rate = (b.nums[si] - a.nums[si]) / (b.s - a.s || 1);
              const sOpen = Math.abs(rate) > 1e-4
                ? r1(b.s + (terminal - b.nums[si]) / rate) : r1(b.s);
              /* термінал ЛИШЕ для координат, що реально варіюються в mids
                 (структурні X=100 закритого полігона не чіпати — інакше
                 «відкритий» полігон дегенерує в нульову площу) */
              const varies = closedNums.map((v, i) =>
                mids.some((m) => Math.abs((m.nums[i] ?? v) - v) > 1));
              const openNums = closedNums.map((v, i) => (varies[i] ? terminal : v));
              let k = 0;
              const openClip = closedClip.replace(/-?\d*\.?\d+/g, () => String(openNums[k++]));
              clipStep = { closed: closedClip, open: openClip, sOpen };
              console.log(`  [${vpName}/${secId}] webgl-вайп: sOpen=${sOpen} термінал=${terminal} (${(t.cls || t.tag).slice(0, 30)})`);
            }
            for (const x of curve) x.clip = null;
            surrogateClip = true;
          }
        }
      }
      /* CLIP-ВАЙП (one-shot розкриття, transients ловлять весь сввіп
         полігона): closed→open один раз, монотонно — латч у СТЕП з
         ГЕОМЕТРИЧНИМ тригером (map-тригер journey-зсунутий): движок
         відкриє на вході у вʼюпорт. Немонотонні вайпи (wellness-слайди
         туди-сюди) не чіпаємо. */
      if (!surrogateClip && curve.length > 2) {
        const cFirst = curve[0].clip || 'none', cLast = curve[curve.length - 1].clip || 'none';
        if (cFirst !== cLast) {
          const numsPer = curve.map((x) => {
            const n = ((x.clip || '').match(/-?\d*\.?\d+/g) || []).map(Number);
            return n.length > 1 ? n[1] : null;
          });
          const firstNums = numsPer.filter((v) => v !== null);
          const mono = firstNums.every((v, i) => i === 0 || v <= firstNums[i - 1] + 0.5)
            || firstNums.every((v, i) => i === 0 || v >= firstNums[i - 1] - 0.5);
          /* S6 (rAF-щільні карти): монотонний вайп може бути S-СКРАБОМ
             (закритість = функція s на травелі, не час) — тоді латч
             ШКОДИТЬ (тригер-подія залежить від ритму прогону, пастка 14),
             а крива відтворює live точно і ран-інваріантно. Скраб =
             багато проміжних значень, розтягнутих по s. */
          const f0 = firstNums[0], fN = firstNums[firstNums.length - 1];
          const lo = Math.min(f0, fN), hi = Math.max(f0, fN);
          const mids = curve.filter((x, i) => numsPer[i] !== null
            && numsPer[i] > lo + 2 && numsPer[i] < hi - 2);
          const midSpan = mids.length
            ? Math.max(...mids.map((x) => x.s)) - Math.min(...mids.map((x) => x.s)) : 0;
          const scrub = mids.length >= 6 && midSpan >= 200;
          if (mono && !scrub) {
            /* тригер степу — З ДАНИХ live (S6-розкопка): DOM-геометрія
               нашого каркаса бреше для фулскрін-слайдів у пінованому
               шарі (nat.top=0 → «відкрито з s=0»). Правда = перший
               ОСІЛИЙ live-семпл, де clip уже у фінальному стані. */
            /* толерантний матч фіналу (числа полігона ±1): float-шум
               рендера ламав точну string-рівність і зсував sOpen на
               наступний снап */
            const numsOf = (c) => ((c || '').match(/-?\d*\.?\d+/g) || []).map(Number);
            const lastN = numsOf(cLast);
            const isOpen = (c) => {
              const n = numsOf(c);
              return n.length === lastN.length && n.every((v, i) => Math.abs(v - lastN[i]) <= 1);
            };
            const settledOpen = [...raw]
              .filter((x) => !x.t && x.s > 2)
              .sort((a, b) => a.s - b.s)
              .find((x) => isOpen(x.clipPath));
            const sOpen = settledOpen ? r1(toPage(settledOpen.s)) : null;
            clipStep = { closed: cFirst === 'none' ? null : cFirst, open: cLast === 'none' ? null : cLast, sOpen };
            for (const x of curve) x.clip = null;
          }
        }
      }
      /* SPLITTING-обгортки: живий анімує дочірні спани, обгортку гасить —
         у репліці спліта немає, тримаємо видимий фінал */
      if ((t.cls || '').match(/\bsplitting\b/)) {
        const lastM = curve.length ? curve[curve.length - 1].m : null;
        for (const x of curve) { x.o = 1; x.clip = null; x.m = lastM; }
      }
      /* БІНАРНИЙ ФЛІП o (1→0 без проміжних): «підготовка до ревілу»
         рантаймом — steady-правда живого = видимий потік; геометричний
         латч у движку (виняток 6 CURVES-GATE). Скраб-фейди (плавні
         проміжні значення, напр. l-intro__opening) НЕ чіпаємо. */
      const hasRevealAttr = (t.attrs || []).some((a) => a === 'data-reveal' || a === 'data-reveal-delay');
      const oLast = curve.length ? curve[curve.length - 1].o : 1;
      const oDistinct = new Set(curve.map((x) => Math.round((x.o ?? 1) * 10) / 10));
      const revealGeom = oLast <= 0.15 && oDistinct.size <= 2
        && (hasRevealAttr || (t.text || '').length > 2);
      if (revealGeom) for (const x of curve) { x.o = null; x.clip = null; x.m = null; }
      const restT = t.samples[0]?.transform;
      if (!anim && intro.length < 2 && !t.moving.viewportTop) continue;
      bindings.push({
        revealGeom: revealGeom || undefined,
        clipStep: clipStep || undefined,
        section: secId,
        sig: { tag: t.tag, cls: t.cls, text: t.text, attrs: t.attrs || [], src: t.src },
        moving: t.moving,
        seedTransform: restT && restT !== 'none' ? restT : null,
        restOpacity: t.samples[0] ? +t.samples[0].opacity : null,
        restClip: surrogateClip ? null : (t.samples[0]?.clipPath || null),
        intro: intro.length > 1 ? intro : undefined,
        curve,
      });
    }
    /* TIMED-КРОКИ (S8b, timing-map): часові переходи при стоячому
       одометрі (вайпи/свапи слайдера) — s-криві їх не бачать. Блок
       timing-map = один жест: цілі, чиї пропи ЗМІНИЛИСЬ у блоці,
       отримують timed-крок {s, step, final{o,clip,disp}}. Движок на
       позі застосовує фінал ПІСЛЯ s-кривих (перекриває контамінацію).
       Кадри переходу зберігаються в timing-map (реплей за часом —
       наступний шар; піксельний гейт міряє осілі фінали). */
    const tm = TIMED[secId]?.viewports?.[vpName];
    if (tm && !tm.error && tm.blocks && tm.targets) {
      for (let ti = 0; ti < tm.targets.length; ti++) {
        const steps = [];
        for (const blk of tm.blocks) {
          if (!blk.frames || blk.frames.length < 2) continue;
          const first = blk.frames[0].targets[ti];
          const last = blk.frames[blk.frames.length - 1].targets[ti];
          if (!first || !last) continue;
          /* фліп РОЗМІРУ = display-свап БАТЬКА (слайд-обгортка може не
             бути ціллю): у дитини disp лишається block, але bbox 0↔N */
          const sizeFlip = (first.w < 2 || first.h < 2) !== (last.w < 2 || last.h < 2);
          const changed = first.opacity !== last.opacity
            || (first.clipPath || '') !== (last.clipPath || '')
            || (first.disp || '') !== (last.disp || '')
            || sizeFlip;
          if (!changed) continue;
          const gone = last.disp === 'none' || last.w < 2 || last.h < 2;
          const was = first.disp === 'none' || first.w < 2 || first.h < 2;
          steps.push({
            s: r1(blk.sSettled), step: blk.step, durMs: blk.durMs,
            final: {
              o: +last.opacity,
              clip: last.clipPath || null,
              disp: gone ? 'none' : (was ? 'visible' : null),
            },
          });
        }
        if (!steps.length) continue;
        const t = tm.targets[ti];
        const sig = { tag: t.tag, cls: t.cls, text: t.text, attrs: [], src: t.src };
        const existing = bindings.find((b) => b.section === secId
          && b.sig.tag === sig.tag && b.sig.cls === sig.cls && (b.sig.src || '') === (sig.src || ''));
        if (existing) existing.timed = steps;
        else bindings.push({ section: secId, sig, moving: {}, seedTransform: null, restOpacity: null, restClip: null, curve: [], timed: steps });
      }
      const timedCount = bindings.filter((b) => b.section === secId && b.timed).length;
      console.log(`  [${vpName}/${secId}] timed-біндінгів: ${timedCount}`);
    }
    /* iEnd: екстраполяція насичення інтро-каруселі hero */
    if (secId === 'hero-gallery' && iEnd === null) {
      const cands = [];
      for (const b of bindings.filter((x) => x.section === secId && x.intro)) {
        const iv = b.intro;
        const last = iv[iv.length - 1], prev = iv[iv.length - 2];
        /* перший СПРАВЖНІЙ пост-інтро кадр (s>2) = фінальний стан каруселі */
        const post = b.curve.find((x) => x.s > 2);
        if (!last || !prev || !post) continue;
        const rate = (last.left - prev.left) / (last.input - prev.input);
        if (Math.abs(rate) > 0.01 && Math.abs(post.left - last.left) > 2) {
          cands.push(last.input + (post.left - last.left) / rate);
        }
      }
      if (cands.length) {
        cands.sort((a, b) => a - b);
        iEnd = Math.round(cands[Math.floor(cands.length / 2)]);
      }
    }
  }

  const footer = sections.footer;
  const bodyHeight = Math.max(...Object.values(sections).map((s) => s.top0 + s.h));
  /* фарба оболонок (shell-bg.json, S8a): слаби-підкладки створює движок —
     першою дитиною обгортки (успадковують травел), top у doc-координатах
     ПІСЛЯ бут-корекції обгортки, h = bbox предка на live-споку */
  const shellSections = {};
  if (shellData) {
    const sh = shellData.viewports?.[vpName];
    for (const [id, p] of Object.entries(sh?.sections || {})) {
      if (!p || p.own || id === 'header' || !sections[id]) continue;
      shellSections[id] = { bgc: p.bgc, bgi: p.bgi !== 'none' ? p.bgi : null, h: p.h };
    }
  }
  return {
    ladder: sc.ladder,
    bodyHeight: Math.round(bodyHeight),
    maxScroll: sc.ladder[sc.ladder.length - 1],
    sections, travels,
    shell: Object.keys(shellSections).length ? shellSections : null,
    /* канвас-текстури (S9a): вміст мертвого WebGL-канваса репліки =
       bg-асет мобільного варіанта тієї ж секції (texture-map.json).
       ЛИШЕ секції з fit (texture-fit.mjs registration: scale/offset з
       кореляції з live-шотом — числа з даних; голий cover зумив 2×) */
    /* Увімкнені СЕКЦІЇ текстур — рішення піксель-гейтом per-секція:
       nature ON (мертвий канвас оголює терасу-постер, листя лікує);
       wellness OFF (MAE-фіт на темному блюрі хибний: 21.9 > 15.5 бази —
       S9: edge-метрика). place-bg OFF (не діагностовано). */
    textures: textureMap
      ? Object.fromEntries(Object.entries(textureMap.textures)
          .filter(([id, t]) => t.fit && [].includes(id)))
      : null,
    introGate: iEnd ? { iEnd } : null,
    bindings,
    footerTop: footer ? footer.top0 : null,
  };
}

const choreo = { at: new Date().toISOString(), site: siteName, viewports: {} };
for (const vp of ['desktop', 'mobile']) {
  const v = buildViewport(vp);
  if (v) choreo.viewports[vp] = v;
}

/* самоперевірки */
const fail = [];
const d = choreo.viewports.desktop;
if (!d) fail.push('немає desktop у scene-map');
else {
  if (!d.ladder || d.ladder.length < 5) fail.push(`драбина закоротка: ${d.ladder?.length}`);
  if (!d.introGate) fail.push('iEnd інтро-гейта не вивівся');
  if (d.bindings.length < 20) fail.push(`лише ${d.bindings.length} прив'язок desktop`);
  const withCurve = d.bindings.filter((b) => b.curve.length > 3).length;
  if (withCurve < 10) fail.push(`лише ${withCurve} прив'язок з кривими`);
}
if (!choreo.viewports.mobile) fail.push('немає mobile у scene-map');

/* scene.css: документна геометрія — absolute офсети секцій обох вʼюпортів.
   + базовий фон body (S8a, shell-bg.json). Фарба ОБОЛОНОК секцій — НЕ тут:
   вона мусить їхати з травелами обгорток і знати бут-корекції, тому
   слаби-підкладки створює ДВИЖОК з choreo.shell (S8a-розкопка: статична
   фарба на обгортці накрила s900 суцільною плитою — обгортка не travel-ить). */
const shellPath = join(site.outDir, 'shell-bg.json');
const shell = existsSync(shellPath) ? JSON.parse(readFileSync(shellPath, 'utf8')) : null;
let css = '/* ГЕНЕРАТ choreo-gen.mjs зі scene-map.json + shell-bg.json — не редагувати руками */\n';
for (const [vp, mq] of [['desktop', '@media (min-width:1024px)'], ['mobile', '@media (max-width:1023px)']]) {
  const v = choreo.viewports[vp];
  if (!v) continue;
  const sh = shell?.viewports?.[vp];
  css += `${mq}{\n`;
  const bodyBg = sh?.body?.bgc ? `background:${sh.body.bgc};` : '';
  css += `body{height:${v.bodyHeight}px;position:relative;margin:0;${bodyBg}}\n`;
  for (const [id, s] of Object.entries(v.sections)) {
    if (id === 'header') { css += `.sk-vp-${vp}[data-sk-section="header"]{position:fixed;top:0;left:0;right:0;z-index:50;}\n`; continue; }
    css += `.sk-vp-${vp}[data-sk-section="${id}"]{position:absolute;top:${s.top0}px;left:0;right:0;}\n`;
  }
  css += `}\n`;
}

writeFileSync(join(outDir, 'choreo.json'), JSON.stringify(choreo));
writeFileSync(join(outDir, 'scene.css'), css);
const kb = (o) => (JSON.stringify(o).length / 1024).toFixed(0);
console.log(`choreo.json: desktop bindings=${d?.bindings.length} (криві: ${d?.bindings.filter((b) => b.curve.length > 3).length}, інтро: ${d?.bindings.filter((b) => b.intro).length}) · iEnd=${d?.introGate?.iEnd} · драбина ${d?.ladder.length} · mobile bindings=${choreo.viewports.mobile?.bindings.length ?? '—'} (${kb(choreo)} KB)`);
if (fail.length) { console.error('САМОПЕРЕВІРКА: ' + fail.join(' · ')); process.exit(1); }
console.log('OK → choreo.json + scene.css');
