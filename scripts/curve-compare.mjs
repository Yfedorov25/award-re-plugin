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
  const sigKey = (t) => `${t.tag}|${(t.cls || '').trim()}|${(t.text || '').slice(0, 25)}`;
  const groupBy = (targets) => {
    const g = {};
    targets.forEach((t) => (g[sigKey(t)] = g[sigKey(t)] || []).push(t));
    return g;
  };
  const gL = groupBy(L.targets), gO = groupBy(O.targets);
  const pairs = [];
  const usedO = new Set();
  for (const [key, lts] of Object.entries(gL)) {
    const ots = gO[key] || [];
    for (let k = 0; k < lts.length && k < ots.length; k++) {
      pairs.push([lts[k], ots[k]]);
      usedO.add(ots[k].i);
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

  let checks = 0, ok = 0;
  const worst = [];
  for (const [lt, ot] of pairs) {
    /* точки порівняння: осілі семпли живої; ПЛАТО-ШУМ (wellness-зона: одна
       й та сама поза сторінки, знята ~100 разів із джитером одометра ±50)
       кластеризуємо по s — одна перевірка на кластер, не сто */
    const seenS = new Set();
    const lSettled = lt.samples.filter((x) => !x.t).filter((x) => {
      const k = Math.round(x.s / 12);
      if (seenS.has(k)) return false;
      seenS.add(k); return true;
    });
    const oSamples = ot.samples;
    const introL = lSettled.filter((x) => Math.abs(x.s) <= 2);
    const scrollL = lSettled.filter((x) => Math.abs(x.s) > 2);
    const props = ['top', 'left', 'w', 'h'];
    if (lt.moving.opacity) props.push('opacity');
    if (lt.moving.clipPath) props.push('clipPath');
    const doCheck = (lx, key) => {
      for (const p of props) {
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
    checks, matched: pairs.length, liveTargets: L.targets.length,
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
  console.log(`${secId} ${vp}: match ${r.matchRatio}% (${r.matched}/${r.liveTargets}) · криві ${r.curveScore}% з ${r.checks} перевірок → ${r.pass ? 'PASS' : 'FAIL'}`);
  if (!r.pass) {
    failed = true;
    for (const w of r.worst) console.log(`    ✗ ${w.t} ${w.p}@${w.at}: live=${w.live} ours=${w.ours}`);
  }
}
const repPath = argOf('--report', null);
if (repPath) writeFileSync(repPath, JSON.stringify(report, null, 1));
process.exit(failed ? 1 : 0);
