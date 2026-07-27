#!/usr/bin/env node
/*
  atom-probe.mjs — ЕТАП 1 ОДНІЄЮ КОМАНДОЮ (S55).

  НАВІЩО. За сесію S55 я пʼять разів будував одноразові вимірники під ті самі питання про
  live-запис, і половина провалила контроль. Кожен новий атом (і кожен НОВИЙ САЙТ) починався з
  нуля. Цей зонд відповідає на весь стандартний набір за один прогін.

  Що відповідає, і скільки це коштувало вручну:
   1. МЕЖІ ХРОМУ браузера      — два вимірники провалились (колірний ловив контент, часовий не
                                 знав що тулбар Safari напівпрозорий). Робочий шлях: геометрія
                                 хрому це властивість ПРИСТРОЮ, тому звіряємо смуги з еталоном.
   2. ПАУЗИ РУКИ               — де рука стояла; без цього темп читається як закон.
   3. ЧАСОВІ ЗОНИ (відео!)     — де вміст живе, ПОКИ СТОРІНКА СТОЇТЬ. Саме це питання зняло
                                 цілий фронт роботи на swim: «підміна медіа за скролом» була
                                 насправді монтажем ВІДЕО в картці.
   4. ПІНЕНО чи ні             — чи їде вміст зі сторінкою. Визначає, чи існує взагалі
                                 незалежна лінійка скролу (для пінених НЕ існує).
   5. ЗАКОН МАСШТАБУ           — чи зумиться медіа і довкола якої точки. На hero саме це
                                 показало, що закон був протилежний живому.

  🔴 ЦЕ ЗОНД, А НЕ ГЕЙТ. Він ОПИСУЄ запис числами для людини, нічого не судить і не мінтить
  вердиктів. Тому в нього НЕМА підписних порогів: пороги потрібні тим, хто судить.
  Числа звідси йдуть у CHOREO як розбір Етапу 1, і вже потім стають зонами/конфігом.

  node scripts/atom-probe.mjs --atom amenities-swim
  node scripts/atom-probe.mjs --control          # контроль на ВІДОМІЙ відповіді
*/
import fs from 'node:fs'; import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readPGM, grayFrames, affineFit, synth } from './lib/affine.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ATOMS = path.resolve(__dirname, '../library/techniques/atoms');
const W = 390, H = 844, FPS = 12;

// орієнтири-описи (НЕ пороги-судді): рівні, на яких людині варто придивитись
const QUIET = 1.2;      // медіанна зміна клітинки, нижче якої сторінка вважається нерухомою
const LIVE  = 3.0;      // зміна клітинки, вище якої вона «жива» при нерухомій сторінці
const GX = 5, GY = 9;

function findVideo(atom) {
  const rdir = path.join(ATOMS, atom, 'reference');
  if (!fs.existsSync(rdir)) return null;
  const v = fs.readdirSync(rdir).find(f => /\.(mp4|mov|webm)$/i.test(f));
  return v ? path.join(rdir, v) : null;
}

// ── 1. МЕЖІ ХРОМУ через тотожність ПРИСТРОЮ ─────────────────────────────────
// Еталон = атом з ВИМІРЯНИМИ вручну межами. Якщо смуги хрому збігаються, межі ті самі.
const REF = { atom: 'amenities-hero', topPct: 5.5, botPct: 11.4 };
function stripNCC(A, B, x0, x1, y0, y1) {
  let n = 0, sa = 0, sb = 0, aa = 0, bb = 0, ab = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const a = A.data[y * A.w + x], b = B.data[y * B.w + x];
    n++; sa += a; sb += b; aa += a * a; bb += b * b; ab += a * b;
  }
  const ma = sa / n, mb = sb / n;
  return (ab / n - ma * mb) / Math.sqrt((aa / n - ma * ma) * (bb / n - mb * mb) + 1e-9);
}
function probeCuts(F) {
  const rv = findVideo(REF.atom);
  if (!rv) return { note: 'еталонного запису нема, міряти вручну' };
  const g = grayFrames(rv, { fps: 1, w: W, h: H });
  const R = readPGM(g.files[Math.min(4, g.files.length - 1)]);
  const bar = +stripNCC(F, R, 200, W, 0, Math.round(H * REF.topPct / 100)).toFixed(3);
  const bot = +stripNCC(F, R, 0, W, Math.round(H * (1 - REF.botPct / 100)), H).toFixed(3);
  fs.rmSync(g.dir, { recursive: true, force: true });
  const same = bar >= 0.90 && bot >= 0.95;
  return { topPct: REF.topPct, botPct: REF.botPct, statusNCC: bar, toolbarNCC: bot, same,
           note: same ? `хром тотожний ${REF.atom} ⇒ межі ті самі`
                      : '🔴 хром ІНШИЙ — межі МІРЯТИ ВРУЧНУ, не переносити' };
}

// ── сітка клітинок і покадрові зміни ────────────────────────────────────────
function cells(cut) {
  const y0 = Math.round(H * cut.topPct / 100), y1 = Math.round(H * (1 - cut.botPct / 100));
  const out = [];
  for (let gy = 0; gy < GY; gy++) for (let gx = 0; gx < GX; gx++)
    out.push({ gx, gy,
      x0: Math.round(gx * W / GX), x1: Math.round((gx + 1) * W / GX),
      y0: Math.round(y0 + gy * (y1 - y0) / GY), y1: Math.round(y0 + (gy + 1) * (y1 - y0) / GY) });
  return { list: out, y0, y1 };
}
const cellDiff = (A, B, c) => {
  let s = 0, n = 0;
  for (let y = c.y0; y < c.y1; y += 2) for (let x = c.x0; x < c.x1; x += 2) {
    s += Math.abs(A.data[y * A.w + x] - B.data[y * B.w + x]); n++;
  }
  return s / n;
};
const median = a => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };

// ── глобальний вертикальний зсув вмісту (чи їде сторінка) ───────────────────
function rowProfile(F, y0, y1) {
  const p = new Float64Array(y1 - y0);
  for (let y = y0; y < y1; y++) { let s = 0; for (let x = 20; x < W - 20; x += 3) s += F.data[y * F.w + x]; p[y - y0] = s; }
  return p;
}
function shiftY(A, B, y0, y1, maxD = 90) {
  const PA = rowProfile(A, y0, y1), PB = rowProfile(B, y0, y1), L = PA.length;
  let best = { d: 0, p: -2 };
  for (let d = -maxD; d <= maxD; d++) {
    const s = Math.max(0, -d), e = Math.min(L, L - d);
    if (e - s < L * 0.5) continue;
    let ma = 0, mb = 0; const n = e - s;
    for (let i = s; i < e; i++) { ma += PA[i]; mb += PB[i + d]; }
    ma /= n; mb /= n;
    let va = 0, vb = 0, ab = 0;
    for (let i = s; i < e; i++) { const u = PA[i] - ma, v = PB[i + d] - mb; va += u * u; vb += v * v; ab += u * v; }
    const p = ab / Math.sqrt(va * vb + 1e-9);
    if (p > best.p) best = { d, p };
  }
  return best;
}

// ── головний прогін ─────────────────────────────────────────────────────────
function probe(atom) {
  const vid = findVideo(atom);
  if (!vid) { console.log(`${atom}: reference-відео нема`); return; }
  const g = grayFrames(vid, { fps: FPS, w: W, h: H });
  const F = g.files.map(readPGM);
  const cut = probeCuts(F[Math.min(20, F.length - 1)]);
  const cutUse = { topPct: cut.topPct ?? 0, botPct: cut.botPct ?? 0 };
  const { list, y0, y1 } = cells(cutUse);

  const STEP = 2;
  const pageMove = [], liveHits = new Map();
  for (let i = STEP; i < F.length; i += STEP) {
    const d = list.map(c => cellDiff(F[i - STEP], F[i], c));
    const page = median(d);
    pageMove.push({ i: i + 1, page });
    if (page < QUIET) for (let k = 0; k < d.length; k++)
      if (d[k] > LIVE) liveHits.set(k, (liveHits.get(k) || 0) + 1);
  }
  const stillN = pageMove.filter(p => p.page < QUIET).length;

  // вікна руху
  const win = []; let cur = null;
  for (const p of pageMove) {
    if (p.page >= QUIET) { if (!cur) cur = { f0: p.i, f1: p.i }; else cur.f1 = p.i; }
    else if (cur) { if (cur.f1 - cur.f0 >= 2) win.push(cur); cur = null; }
  }
  if (cur && cur.f1 - cur.f0 >= 2) win.push(cur);

  console.log(`\n═══ ${atom}  (${F.length} кадрів @${FPS}fps)`);
  console.log(`1. МЕЖІ ХРОМУ: top ${cutUse.topPct}%  bot ${cutUse.botPct}%   [статус-бар NCC ${cut.statusNCC} · тулбар NCC ${cut.toolbarNCC}]`);
  console.log(`   ${cut.note}`);
  console.log(`2. РУКА: ${win.length} вікон руху, ${stillN} з ${pageMove.length} проб сторінка СТОЇТЬ`);
  console.log(`   вікна: ${win.map(w => `f${w.f0}-${w.f1}`).join(' · ') || 'нема'}`);

  const live = [...liveHits.entries()].filter(([, n]) => n >= 3)
    .map(([k, n]) => ({ c: list[k], n })).sort((a, b) => b.n - a.n);
  console.log(`3. ЧАСОВІ ЗОНИ (живуть при НЕРУХОМІЙ сторінці ⇒ відео/автоанімація): ${live.length ? live.length + ' клітинок' : 'НЕМА'}`);
  if (live.length) {
    const rows = [...new Set(live.map(l => l.c.gy))].sort((a, b) => a - b);
    console.log(`   рядки сітки ${rows.join(',')} з ${GY} · топ: ${live.slice(0, 4).map(l => `[${l.c.gx},${l.c.gy}]×${l.n}`).join(' ')}`);
    console.log(`   🔴 медіа тут ЖИВЕ САМО. Зону оголошувати kind:'media', інакше zone-track`);
    console.log(`      мінтитиме SWAPS-CONTENT на кожній монтажній склейці.`);
  }

  console.log(`4. ПІНЕНО / ЇДЕ ЗІ СТОРІНКОЮ  ·  5. ЗАКОН МАСШТАБУ (по вікнах руху)`);
  const rect = { x0: Math.round(W * 0.05), x1: Math.round(W * 0.95), y0, y1 };
  let cum = 1; const motionRows = [];
  for (const w of win.slice(0, 6)) {
    const A = F[w.f0 - 1], B = F[Math.min(w.f1, F.length) - 1];
    const sh = shiftY(A, B, y0, y1);
    const af = affineFit(A, B, rect, { maxD: 110 });
    cum *= af.s;
    const pin = Math.abs(sh.d) < 8 ? 'ПІНЕНО (вміст не їде)' : `їде ${sh.d}px`;
    motionRows.push({ f0: w.f0, f1: w.f1, shiftPx: sh.d, pinned: Math.abs(sh.d) < 8,
                      scale: af.s, ncc: af.ncc, yFix: af.yFix });
    console.log(`   f${w.f0}-${w.f1}: ${pin.padEnd(24)} s=${af.s} (ncc ${af.ncc}) точка сходу y=${af.yFix ?? '—'}`);
  }
  if (win.length) console.log(`   НАКОПИЧЕНИЙ масштаб по вікнах: ×${cum.toFixed(3)}`);
  console.log(`   ⚠️ Якщо ПІНЕНО: незалежної лінійки скролу в кадрі НЕМА, і будь-яке порівняння`);
  console.log(`      «наше при p проти live на момент t» міряє неспостережуване. Порівнювати ЗЧЕПЛЕННЯ.`);
  fs.rmSync(g.dir, { recursive: true, force: true });

  // S55: артефакт на диск. Без нього будь-яка автоматизація поверх зонда стоїть на порожнечі:
  // числа доводилось переписувати з консолі руками.
  const out = {
    tool: 'atom-probe', version: 1, atom, video: path.basename(vid), frames: F.length, fps: FPS,
    cuts: { topPct: cutUse.topPct, botPct: cutUse.botPct, proof: cut },
    hand: { windows: win, stillProbes: stillN, totalProbes: pageMove.length },
    timeDriven: { cells: live.length,
      gridRows: [...new Set(live.map(l => l.c.gy))].sort((a, b) => a - b),
      rects: live.slice(0, 12).map(l => ({ gx: l.c.gx, gy: l.c.gy, hits: l.n, ...l.c })),
      verdict: live.length ? 'МЕДІА ЖИВЕ САМО (відео/автоанімація) ⇒ зона kind:media' : 'статика' },
    motion: motionRows,
    cumulativeScale: win.length ? +cum.toFixed(3) : null,
    _note: 'ЗОНД, не суддя: описує запис числами, вердиктів не мінтить і порогів не має',
  };
  fs.writeFileSync(path.join(ATOMS, atom, 'reference', 'probe.json'), JSON.stringify(out, null, 2));
  console.log(`   → reference/probe.json записано`);
  return out;
}

// ── КОНТРОЛЬ на ВІДОМІЙ відповіді ───────────────────────────────────────────
function control() {
  console.log('КОНТРОЛЬ atom-probe (без відомої відповіді зонду вірити не можна)\n');
  const vid = findVideo(REF.atom);
  const g = grayFrames(vid, { fps: 1, w: W, h: H });
  const A = readPGM(g.files[2]);
  const cyZ = (Math.round(H * 0.105) + Math.round(H * 0.429)) / 2, cyF = H / 2;
  const rect = { x0: 20, x1: 370, y0: Math.round(H * 0.105), y1: Math.round(H * 0.429) };
  let pass = 0, total = 0;
  for (const [name, s, dy] of [['нуль', 1.00, 0], ['трансляція −20px', 1.00, -20],
                               ['зум-ін ×1.10', 1.10, 0], ['зум-аут ×0.85', 0.85, 0]]) {
    const B = synth(A, s, 0, dy);
    const r = affineFit(A, B, rect, { maxD: 120 });
    const expDy = dy + (s - 1) * (cyZ - cyF);          // різниця початку скейлу, не помилка
    const ok = Math.abs(r.s - s) <= 0.02 && Math.abs(r.dy - expDy) <= 3;
    total++; if (ok) pass++;
    console.log(`  ${ok ? '✅' : '❌'} афінний ${name.padEnd(18)} → s=${r.s} dy=${r.dy} (чекали s=${s} dy=${expDy.toFixed(1)})`);
  }
  fs.rmSync(g.dir, { recursive: true, force: true });
  // часові зони: swim МАЄ відео в картці (доведено S55), promenade — статичне фото
  for (const [atom, want] of [['amenities-swim', true], ['amenities-promenade', false]]) {
    const v = findVideo(atom); if (!v) continue;
    const gg = grayFrames(v, { fps: FPS, w: W, h: H });
    const FF = gg.files.map(readPGM);
    const { list } = cells({ topPct: REF.topPct, botPct: REF.botPct });
    const hits = new Map();
    for (let i = 2; i < FF.length; i += 2) {
      const d = list.map(c => cellDiff(FF[i - 2], FF[i], c));
      if (median(d) < QUIET) for (let k = 0; k < d.length; k++) if (d[k] > LIVE) hits.set(k, (hits.get(k) || 0) + 1);
    }
    const got = [...hits.values()].filter(n => n >= 3).length > 0;
    total++; if (got === want) pass++;
    console.log(`  ${got === want ? '✅' : '❌'} часові зони ${atom.padEnd(20)} → ${got ? 'Є' : 'нема'} (чекали ${want ? 'Є' : 'нема'})`);
    fs.rmSync(gg.dir, { recursive: true, force: true });
  }
  console.log(`\nКОНТРОЛЬ: ${pass}/${total}`);
  process.exit(pass === total ? 0 : 1);
}

const args = process.argv.slice(2);
if (args.includes('--control')) control();
else {
  const i = args.indexOf('--atom');
  // S55: НЕ фільтр по назві (він ховав 24 атоми air-* у цьому ж репо), а наявність запису
  const list = i >= 0 ? [args[i + 1]]
    : fs.readdirSync(ATOMS).filter(a => fs.existsSync(path.join(ATOMS, a, 'reference')) && findVideo(a));
  for (const a of list) probe(a);
}
