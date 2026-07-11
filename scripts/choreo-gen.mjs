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
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { SITES, REPO } from './token-extractor.mjs';

const siteName = process.argv[2];
const site = SITES[siteName];
if (!site) { console.error(`вкажи: node scripts/choreo-gen.mjs <${Object.keys(SITES).join('|')}>`); process.exit(1); }
const outDir = join(REPO, 'library/combos', siteName);
const scene = JSON.parse(readFileSync(join(site.outDir, 'scene-map.json'), 'utf8'));
const MAPPED = ['hero-gallery', 'intro', 'wellness'];
const maps = Object.fromEntries(MAPPED.map((id) => [
  id, JSON.parse(readFileSync(join(site.outDir, `animation-map-${id}.json`), 'utf8')),
]));

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
      const anim = t.moving.transform || t.moving.opacity || t.moving.clipPath;
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
        .map((x) => ({ s: r1(toPage(x.s)), top: x.top, left: x.left, w: x.w, h: x.h, o: +x.opacity, clip: x.clipPath, m: parseMatrix(x.transform) }));
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
      /* CLIP-ВАЙП (one-shot розкриття, transients ловлять весь сввіп
         полігона): closed→open один раз, монотонно — латч у СТЕП з
         ГЕОМЕТРИЧНИМ тригером (map-тригер journey-зсунутий): движок
         відкриє на вході у вʼюпорт. Немонотонні вайпи (wellness-слайди
         туди-сюди) не чіпаємо. */
      let clipStep = null;
      if (curve.length > 2) {
        const cFirst = curve[0].clip || 'none', cLast = curve[curve.length - 1].clip || 'none';
        if (cFirst !== cLast) {
          const firstNums = curve.map((x) => {
            const n = ((x.clip || '').match(/-?\d*\.?\d+/g) || []).map(Number);
            return n.length > 1 ? n[1] : null;
          }).filter((v) => v !== null);
          const mono = firstNums.every((v, i) => i === 0 || v <= firstNums[i - 1] + 0.5)
            || firstNums.every((v, i) => i === 0 || v >= firstNums[i - 1] - 0.5);
          if (mono) {
            clipStep = { closed: cFirst === 'none' ? null : cFirst, open: cLast === 'none' ? null : cLast };
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
        sig: { tag: t.tag, cls: t.cls, text: t.text, attrs: t.attrs || [] },
        moving: t.moving,
        seedTransform: restT && restT !== 'none' ? restT : null,
        restOpacity: t.samples[0] ? +t.samples[0].opacity : null,
        restClip: t.samples[0]?.clipPath || null,
        intro: intro.length > 1 ? intro : undefined,
        curve,
      });
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
  return {
    ladder: sc.ladder,
    bodyHeight: Math.round(bodyHeight),
    maxScroll: sc.ladder[sc.ladder.length - 1],
    sections, travels,
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

/* scene.css: документна геометрія — absolute офсети секцій обох вʼюпортів */
let css = '/* ГЕНЕРАТ choreo-gen.mjs зі scene-map.json — не редагувати руками */\n';
for (const [vp, mq] of [['desktop', '@media (min-width:1024px)'], ['mobile', '@media (max-width:1023px)']]) {
  const v = choreo.viewports[vp];
  if (!v) continue;
  css += `${mq}{\n`;
  css += `body{height:${v.bodyHeight}px;position:relative;margin:0;}\n`;
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
