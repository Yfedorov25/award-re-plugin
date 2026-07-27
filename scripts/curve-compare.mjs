/* ============================================================
   CURVE-COMPARE (трек springs, S3) — числова звірка кривих live↔ours
   ------------------------------------------------------------
   Пороги й метод зафіксовані ДО прогону в extraction/<site>/CURVES-GATE.md.
   Вхід: жива карта extraction/<site>/animation-map-<sec>.json
         наша карта extraction/<site>/ours/animation-map-<sec>.json
   Запуск: node scripts/curve-compare.mjs springs-home <sec> [--vp both]
   Вихід: код 0/1 + рядки звіту (пише CURVES-REPORT.json через --report)
   ============================================================ */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { SITES } from './token-extractor.mjs';

const siteName = process.argv[2];
const site = SITES[siteName];
const secId = process.argv[3];
if (!site || !secId) { console.error('вкажи: node scripts/curve-compare.mjs <site> <sectionId> [--vp both]'); process.exit(1); }
const argOf = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const vpArg = argOf('--vp', 'both');

const live = JSON.parse(readFileSync(join(site.outDir, `animation-map-${secId}.json`), 'utf8'));
const oursPath = join(site.outDir, 'ours', `animation-map-${secId}.json`);
if (!existsSync(oursPath)) { console.error(`немає нашої карти: ${oursPath}`); process.exit(1); }
const ours = JSON.parse(readFileSync(oursPath, 'utf8'));
const scene = JSON.parse(readFileSync(join(site.outDir, 'scene-map.json'), 'utf8'));

/* ---- нормалізація осі s → СТОРІНКОВИЙ скрол ----
   Одометр кожного прогону — власна max-range проба; якщо це корінь
   секції з власним травелом (hero пін 0..900), вісь зсунута на devFinal.
   Мапимо клас проби на секцію сцени і зсуваємо s>2 на devFinal. */
function axisShift(vpName, probeCls) {
  const sc = scene.viewports[vpName];
  if (!sc || !probeCls) return 0;
  const tok = probeCls.split(/\s+/)[0];
  const sec = sc.sections.find((x) => (x.cls || '').split(/\s+/)[0] === tok);
  if (!sec) return 0;
  const last = sec.samples[sec.samples.length - 1];
  const devFinal = last.top - (sec.top0 - last.s);
  return Math.abs(devFinal) > 1 ? devFinal : 0;
}
function normalizeMap(map, vpName) {
  const V = map.viewports[vpName];
  if (!V || V.error) return;
  const shift = axisShift(vpName, V.selfCheck?.odometerProbe || '');
  if (!shift) return;
  for (const t of V.targets) for (const x of t.samples) if (x.s > 2) x.s += shift;
  V._axisShift = shift;
}
for (const vp of ['desktop', 'mobile']) { normalizeMap(live, vp); normalizeMap(ours, vp); }

const TOL = { pos: 10, size: 8, sizePct: 0.02, opacity: 0.1, clipNum: 3 };
const GATE = { matchRatio: 0.8, curveScore: 0.9 };

const numsOf = (str) => ((str || '').match(/-?\d*\.?\d+/g) || []).map(Number);

function sigScore(a, b) {
  if (a.tag !== b.tag) return -1;
  const ca = new Set((a.cls || '').split(/\s+/).filter(Boolean));
  const cb = new Set((b.cls || '').split(/\s+/).filter(Boolean));
  let s = 0;
  for (const c of ca) if (cb.has(c)) s += 2;
  s -= Math.abs(ca.size - cb.size) * 0.1;
  if (a.text && a.text === b.text) s += 3;
  else if (a.text && b.text && a.text.slice(0, 15) === b.text.slice(0, 15)) s += 1;
  return s;
}

/* інтерполяція значення нашої цілі в точці x по ключу key */
function interpVal(samples, key, x, prop) {
  const arr = samples.filter((v) => Number.isFinite(v[key])).sort((p, q) => p[key] - q[key]);
  if (!arr.length) return undefined;
  if (x <= arr[0][key]) return arr[0][prop];
  const last = arr[arr.length - 1];
  if (x >= last[key]) return last[prop];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i][key] >= x) {
      const a = arr[i - 1], b = arr[i];
      const t = (x - a[key]) / (b[key] - a[key] || 1);
      const va = a[prop], vb = b[prop];
      if (typeof va === 'number' && typeof vb === 'number') return va + (vb - va) * t;
      return t < 0.5 ? va : vb; /* рядки (clip): ближчий */
    }
  }
  return last[prop];
}

function compareViewport(vpName) {
  const L = live.viewports[vpName], O = ours.viewports[vpName];
  if (!L || L.error) return { skip: `live: ${L?.error || 'немає'}` };
  if (!O || O.error) return { fail: `ours: ${O?.error || 'немає'}` };

  /* матчинг цілей: групи ОДНАКОВИХ сигнатур паруються k↔k у порядку
     списку (SETUP_FN обходить документ детерміновано на обох сторонах);
     безкласові img/span матчаться в межах své tag-групи */
  /* ключ = tag + перший ЗМІСТОВНИЙ клас: генеровані (gd-/gm-) — наш
     артефакт каркаса, splitting/words/chars/is-inview/is-inited — додає
     рантайм живого (пастка 2), noscript-текст різниться — без тексту;
     близнюків розводить nearest-bbox пейринг */
  const RUNTIME_CLS = /^(g[dm]-\d+|is-inview|is-inited|splitting|words|chars|is-visible)$/;
  const sigKey = (t) => `${t.tag}|${((t.cls || '').trim().split(/\s+/).find((c) => c && !RUNTIME_CLS.test(c))) || ''}`;
  const groupBy = (targets) => {
    const g = {};
    targets.forEach((t) => (g[sigKey(t)] = g[sigKey(t)] || []).push(t));
    return g;
  };
  const gL = groupBy(L.targets), gO = groupBy(O.targets);
  const pairs = [];
  const usedO = new Set();
  /* у межах sig-групи паруємо по НАЙБЛИЖЧОМУ rest-bbox (індексне k↔k
     хрестило близнюків, коли списки різної довжини — розкопка іт.7) */
  /* глобально-жадібний пейринг (всі пари групи за зростанням відстані):
     по-цільовий greedy лишав останній live-цілі «недоїдок» (іт.16) */
  for (const [key, lts] of Object.entries(gL)) {
    const ots = gO[key] || [];
    /* S12: КОНТЕНТ-FIRST — унікальні src паруються напряму. rest-bbox
       каруселей РАН-ЗАЛЕЖНИЙ (наш інтро-стан тепер справжній зум-морф
       introT, live-карта journey-контамінована) — bbox-пейринг хрестив
       item'и: hero desktop 99.4→56.9, mobile 54.8. Розмірний суфікс
       нормалізується (@xs/@xxl — те саме фото, пастка 38). */
    const doneL = new Set();
    const norm = (v) => (v || '').replace(/(%40|@)[a-z0-9-]+\./i, '.');
    const bySrcL = {}, bySrcO = {};
    for (const lt of lts) { const k = norm(lt.src); if (k && !/svg%3E/.test(k)) (bySrcL[k] = bySrcL[k] || []).push(lt); }
    for (const ot of ots) { const k = norm(ot.src); if (k && !/svg%3E/.test(k)) (bySrcO[k] = bySrcO[k] || []).push(ot); }
    for (const [k, ls] of Object.entries(bySrcL)) {
      const os = (bySrcO[k] || []).filter((o) => !usedO.has(o.i));
      if (ls.length === 1 && os.length === 1) {
        pairs.push([ls[0], os[0]]);
        doneL.add(ls[0]); usedO.add(os[0].i);
      }
    }
    const all = [];
    for (const lt of lts) {
      if (doneL.has(lt)) continue;
      const lr = lt.samples[0];
      for (const ot of ots) {
        const or2 = ot.samples[0];
        all.push({ lt, ot, d: Math.abs(lr.top - or2.top) + Math.abs(lr.left - or2.left) });
      }
    }
    all.sort((a, b) => a.d - b.d);
    for (const { lt, ot } of all) {
      if (doneL.has(lt) || usedO.has(ot.i)) continue;
      doneL.add(lt); usedO.add(ot.i);
      pairs.push([lt, ot]);
    }
  }
  /* решта — колишній greedy по скору (сигнатури, що розійшлись класами) */
  for (const lt of L.targets) {
    if (pairs.some(([l]) => l === lt)) continue;
    let best = null, bestS = 0.5;
    for (const ot of O.targets) {
      if (usedO.has(ot.i)) continue;
      const s = sigScore(lt, ot);
      if (s > bestS) { bestS = s; best = ot; }
    }
    if (best) { usedO.add(best.i); pairs.push([lt, best]); }
  }
  const matchRatio = pairs.length / L.targets.length;

  let checks = 0, ok = 0, skipped = 0;
  const worst = [];
  for (const [lt, ot] of pairs) {
    /* точки порівняння: осілі семпли живої; ПЛАТО-ШУМ (wellness-зона: одна
       й та сама поза сторінки, знята ~100 разів із джитером одометра ±50)
       кластеризуємо по s — одна перевірка на кластер, не сто.
       Виняток 5 CURVES-GATE: кластер, де live САМ собі суперечить
       (розкид top > поріг) — незмірюваний, пропускається. */
    const allSettled = lt.samples.filter((x) => !x.t);
    /* виняток 5: самонеузгодженість міряється на МАЙЖЕ ОДНАКОВИХ s
       (2px бакети — 12px хибно ловив крутий схил); дедуп чеків — 12px */
    const fine = {};
    for (const x of allSettled) (fine[Math.round(x.s / 2)] = fine[Math.round(x.s / 2)] || []).push(x);
    const noisyFine = new Set();
    for (const [k, arr] of Object.entries(fine)) {
      const tops = arr.map((x) => x.top);
      if (Math.max(...tops) - Math.min(...tops) > TOL.pos) noisyFine.add(k);
    }
    const clusters = {};
    for (const x of allSettled) {
      if (noisyFine.has(String(Math.round(x.s / 2)))) { skipped++; continue; }
      (clusters[Math.round(x.s / 12)] = clusters[Math.round(x.s / 12)] || []).push(x);
    }
    const lSettled = Object.values(clusters).map((arr) => arr[0]);
    const oSamples = ot.samples;
    const introL = lSettled.filter((x) => Math.abs(x.s) <= 2);
    const scrollL = lSettled.filter((x) => Math.abs(x.s) > 2);
    const props = ['top', 'left', 'w', 'h'];
    /* виняток 6 CURVES-GATE: data-reveal — o/clip journey-контаміновані,
       їх steady-правду верифікує піксельний гейт */
    const isReveal = (lt.attrs || []).some((a) => a === 'data-reveal' || a === 'data-reveal-delay');
    if (lt.moving.opacity && !isReveal) props.push('opacity');
    if (lt.moving.clipPath && !isReveal) props.push('clipPath');
    const doCheck = (lx, key) => {
      /* виняток 4 CURVES-GATE: нульовий bbox живого (прихований no-js
         fallback під WebGL) — bbox-чеки пропускаються */
      const liveHidden = lx.w === 0 && lx.h === 0;
      for (const p of props) {
        if (liveHidden && p !== 'opacity' && p !== 'clipPath') continue;
        const lv = p === 'opacity' ? +lx.opacity : lx[p];
        let ov = interpVal(oSamples, key, lx[key], p === 'opacity' ? 'opacity' : p);
        if (p === 'opacity' && ov !== undefined) ov = +ov;
        checks++;
        let pass = false;
        if (p === 'clipPath') {
          const ln = numsOf(lv), on = numsOf(ov);
          pass = lv === ov || (ln.length === on.length && ln.every((v, i) => Math.abs(v - on[i]) <= TOL.clipNum));
        } else if (ov === undefined || lv === undefined) pass = false;
        else if (p === 'w' || p === 'h') pass = Math.abs(lv - ov) <= Math.max(TOL.size, Math.abs(lv) * TOL.sizePct);
        else if (p === 'opacity') pass = Math.abs(lv - ov) <= TOL.opacity;
        else pass = Math.abs(lv - ov) <= TOL.pos;
        if (pass) ok++;
        else worst.push({ t: `${lt.tag}.${(lt.cls || '').split(/\s+/)[0]}`, p, at: Math.round(lx[key]), live: typeof lv === 'number' ? Math.round(lv * 10) / 10 : String(lv).slice(0, 40), ours: typeof ov === 'number' ? Math.round(ov * 10) / 10 : String(ov).slice(0, 40) });
      }
    };
    /* інтро-фаза: по input (лише якщо і в нас є інтро-семпли) */
    for (const lx of introL) doCheck(lx, 'input');
    for (const lx of scrollL) doCheck(lx, 's');
  }
  const score = checks ? ok / checks : 0;
  const pass = matchRatio >= GATE.matchRatio && score >= GATE.curveScore;
  return {
    matchRatio: Math.round(matchRatio * 1000) / 10,
    curveScore: Math.round(score * 1000) / 10,
    checks, skipped, matched: pairs.length, liveTargets: L.targets.length,
    pass, worst: worst.slice(0, 12),
  };
}

let failed = false;
const report = { at: new Date().toISOString(), section: secId, gate: GATE, tol: TOL, viewports: {} };
for (const vp of (vpArg === 'both' ? ['desktop', 'mobile'] : [vpArg])) {
  const r = compareViewport(vp);
  report.viewports[vp] = r;
  if (r.skip) { console.log(`${secId} ${vp}: SKIP (${r.skip})`); continue; }
  if (r.fail) { console.log(`${secId} ${vp}: FAIL (${r.fail})`); failed = true; continue; }
  console.log(`${secId} ${vp}: match ${r.matchRatio}% (${r.matched}/${r.liveTargets}) · криві ${r.curveScore}% з ${r.checks} перевірок${r.skipped ? ` (${r.skipped} семплів пропущено — виняток 5)` : ''} → ${r.pass ? 'PASS' : 'FAIL'}`);
  if (!r.pass) {
    failed = true;
    for (const w of r.worst) console.log(`    ✗ ${w.t} ${w.p}@${w.at}: live=${w.live} ours=${w.ours}`);
  }
}
const repPath = argOf('--report', null);
if (repPath) writeFileSync(repPath, JSON.stringify(report, null, 1));
process.exit(failed ? 1 : 0);
