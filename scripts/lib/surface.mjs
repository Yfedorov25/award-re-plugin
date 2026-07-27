/*
  lib/surface.mjs — СЕГМЕНТАЦІЯ ПОВЕРХОНЬ кадру (S46, народжено багом promenade).

  Корінь: я зробив body-copy НА ФОТО зі скримом, а в live текст лежить на ОКРЕМІЙ суцільній
  темно-зеленій ПАНЕЛІ, і шов (низ фото / верх панелі) ТРАВЕЛИТЬ вгору. Око Єгора зловило,
  моя самозвірка й харнес — ні: система міряла тайминг/канали, але НЕ «на якій поверхні лежить
  текст». Цей модуль робить композицію ЧИСЛОМ.

  МЕТОД (без залежностей: ffmpeg → P6 PPM → Node):
  - для кожного РЯДКА кадру: текстурна дисперсія (горизонтальна) + середній колір;
  - клас рядка: 'photo' (дисперсія ≥ порогу) або 'solid' (дисперсія < порогу; колір відомий);
  - згладити → сегменти поверхонь [{cls, fromPct, toPct, rgb}];
  - шов = межа segment[i].toPct між 'photo' та 'solid'.

  Використання:
  - live-бік: frameSurfaceMap(pngPath) — виміряти закон із live-кадрів (expectations src=live-вимір);
  - наш бік: той самий вимір на playwright-скріншотах → detectSurfaceParity порівнює числа.

  Межі чесності: текст на панелі трохи піднімає дисперсію рядка — поріг калібрується так, щоб
  «панель з текстом» лишалась 'solid', а фото ніколи. UI-бари (статусбар/браузер) зрізаються.
*/
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// P6 PPM parser → {w,h,data(RGB byte triplets)}
export function readPPM(p){
  const buf = fs.readFileSync(p);
  let pos = 0; const fields = [];
  while (fields.length < 4) {
    while (buf[pos] === 32 || buf[pos] === 10 || buf[pos] === 13 || buf[pos] === 9) pos++;
    if (buf[pos] === 35) { while (buf[pos] !== 10) pos++; continue; }   // # коментар
    let s = pos; while (pos < buf.length && buf[pos] > 32) pos++;
    fields.push(buf.toString('ascii', s, pos));
  }
  pos++;
  const w = +fields[1], h = +fields[2];
  return { w, h, data: buf.subarray(pos, pos + w * h * 3) };
}

// PNG/будь-що → PPM у tmp (scale до стандартної ширини для стабільних порогів)
export function toPPM(src, scaleW = 234){
  const tmp = path.join(os.tmpdir(), 'surf-' + Math.abs(src.split('').reduce((a, c) => a * 31 + c.charCodeAt(0) | 0, 7)) + '.ppm');
  execSync(`ffmpeg -y -i "${src}" -vf "scale=${scaleW}:-2" "${tmp}" -loglevel error`);
  return tmp;
}

// per-row профіль: {variance, r,g,b}
export function rowProfile(ppm){
  const { w, h, data } = ppm;
  const rows = [];
  for (let y = 0; y < h; y++) {
    let sr = 0, sg = 0, sb = 0, sl = 0, sl2 = 0;
    const off = y * w * 3;
    for (let x = 0; x < w; x++) {
      const r = data[off + x * 3], g = data[off + x * 3 + 1], b = data[off + x * 3 + 2];
      const l = 0.299 * r + 0.587 * g + 0.114 * b;
      sr += r; sg += g; sb += b; sl += l; sl2 += l * l;
    }
    const ml = sl / w;
    rows.push({ variance: Math.sqrt(Math.max(0, sl2 / w - ml * ml)), r: sr / w | 0, g: sg / w | 0, b: sb / w | 0 });
  }
  return rows;
}

/*
  surfaceMap: сегменти поверхонь у ВІДСОТКАХ висоти КОНТЕНТ-зони.
  opts: { varThr:поріг дисперсії photo/solid (дефолт 22 — панель з текстом ~8-18, фото 30-70),
          topCutPct/botCutPct: зрізати UI-бари (live-запис має статусбар+браузер-бар; наш скрін 0/0),
          minSegPct: мін висота сегмента (згладжування дрібниць) }
*/
export function surfaceMap(rows, opts = {}){
  const varThr = opts.varThr ?? 22, minSegPct = opts.minSegPct ?? 4;
  const topCut = Math.round((opts.topCutPct ?? 0) / 100 * rows.length);
  const botCut = Math.round((opts.botCutPct ?? 0) / 100 * rows.length);
  const zone = rows.slice(topCut, rows.length - botCut);
  const H = zone.length;
  const cls = zone.map(r => r.variance >= varThr ? 'photo' : 'solid');
  // медіанне згладжування 5
  const sm = cls.map((c, i) => {
    const win = cls.slice(Math.max(0, i - 2), i + 3);
    return win.filter(x => x === 'photo').length > win.length / 2 ? 'photo' : 'solid';
  });
  const segs = [];
  let s = 0;
  for (let i = 1; i <= H; i++) {
    if (i === H || sm[i] !== sm[s]) {
      const fromPct = s / H * 100, toPct = i / H * 100;
      if (toPct - fromPct >= minSegPct) {
        const mid = zone.slice(s, i);
        const avg = (k) => mid.reduce((a, r) => a + r[k], 0) / mid.length | 0;
        segs.push({ cls: sm[s], fromPct: +fromPct.toFixed(1), toPct: +toPct.toFixed(1), rgb: [avg('r'), avg('g'), avg('b')] });
      } else if (segs.length) segs[segs.length - 1].toPct = +(i / H * 100).toFixed(1); // влити дрібний у попередній
      s = i;
    }
  }
  return segs;
}

// шов photo→solid: toPct ПЕРШОГО photo-сегмента за яким іде solid (низ фото). null якщо нема пари.
export function photoSolidSeam(segs){
  for (let i = 0; i < segs.length - 1; i++) {
    if (segs[i].cls === 'photo' && segs[i + 1].cls === 'solid') return segs[i].toPct;
  }
  return null;
}

// повний вимір одного зображення
export function frameSurfaceMap(imgPath, opts = {}){
  const ppm = readPPM(toPPM(imgPath));
  const rows = rowProfile(ppm);
  const segs = surfaceMap(rows, opts);
  return { segs, seamPct: photoSolidSeam(segs) };
}

/*
  gutterBandTop — верх суцільної ПАНЕЛІ через ЛІВИЙ ҐАТТЕР (S46 v2, головний surface-метод).
  Чому ґаттер: рядкова дисперсія плутає текст/плитки НА панелі з фото. Ґаттер (x 0.3-1.2%)
  у панелі = чистий колір (padding), у фото = текстура. ВИМІРЯНО (probe S46):
  наш 80.0/46.9/21.4% = закон точно; live p0.5=79.1 (Δ0.9 від нашого).
  Пастки (виміряні): live-плитки торкаються ґаттера (перериви до 32% → chain maxGap 35%);
  хедер-скрим зверху = колір панелі (→ шукати нижче topSearchCut 15%).

  Алгоритм: рядки ґаттера → band-colored якщо maxΔ(rgb, bandRGB) ≤ tol; знизу вгору
  ланцюжок band-ранів (ран ≥ runMin% ; розрив ≤ maxGap%); верх найвищого рану = bandTopPct.
  opts: { bandRGB, tol=16, topCutPct/botCutPct (UI-бари), topSearchCutPct=15, runMinPct=3, maxGapPct=35 }
*/
export function gutterBandTop(imgPath, opts){
  const { bandRGB } = opts;
  const tol = opts.tol ?? 16, runMinPct = opts.runMinPct ?? 3, maxGapPct = opts.maxGapPct ?? 35;
  const topSearchCut = opts.topSearchCutPct ?? 15;
  const ppm = readPPM(toPPM(imgPath, 300));
  const { w, h, data } = ppm;
  const yFrom = Math.round(h * (opts.topCutPct ?? 0) / 100);
  const yTo = h - Math.round(h * (opts.botCutPct ?? 0) / 100);
  const H = yTo - yFrom;
  // v2: ДВІ під-смуги AND (виміряно S46): A ловить панель за padding-ом, B відсікає
  // темний лівий КРАЙ фото (він валить B) і плитки (валять B); AND = рядок панелі.
  const strips = [[0.004, 0.009], [0.012, 0.019]];
  const stripDist = (y, s0, s1) => {
    const xa = Math.max(1, Math.round(w * s0)), xb = Math.max(xa + 1, Math.round(w * s1));
    let sr = 0, sg = 0, sb = 0, n = 0;
    for (let x = xa; x <= xb; x++) { const o = (y * w + x) * 3; sr += data[o]; sg += data[o + 1]; sb += data[o + 2]; n++; }
    return Math.max(Math.abs(sr / n - bandRGB[0]), Math.abs(sg / n - bandRGB[1]), Math.abs(sb / n - bandRGB[2]));
  };
  const isBand = [];
  for (let y = yFrom; y < yTo; y++) {
    isBand.push(stripDist(y, strips[0][0], strips[0][1]) <= tol && stripDist(y, strips[1][0], strips[1][1]) <= tol);
  }
  // ранi band-рядків ≥ runMin%
  const runs = [];
  let s = -1;
  for (let i = 0; i <= H; i++) {
    if (i < H && isBand[i]) { if (s < 0) s = i; }
    else if (s >= 0) { if ((i - s) / H * 100 >= runMinPct) runs.push({ from: s, to: i - 1 }); s = -1; }
  }
  if (!runs.length) return null;
  // ланцюжок знизу вгору: старт = найнижчий ран що сягає низу (або близько), далі вгору поки розрив ≤ maxGap
  runs.sort((a, b) => b.to - a.to);
  const bottom = runs[0];
  if ((H - 1 - bottom.to) / H * 100 > 8) return null;            // низ кадру не панель → панелі нема
  let topRun = bottom;
  const chained = [bottom];
  const sorted = runs.sort((a, b) => a.from - b.from);
  for (let i = sorted.indexOf(topRun) - 1; i >= 0; i--) {
    const gap = (topRun.from - sorted[i].to) / H * 100;
    if (gap <= maxGapPct) { topRun = sorted[i]; chained.push(sorted[i]); } else break;
  }
  // мін-покриття ланцюжка (виміряно: віньєтка-хвіст 6.6% на p0.25, справжня панель ≥20%)
  const coverage = chained.reduce((a, r) => a + (r.to - r.from + 1), 0) / H * 100;
  if (coverage < (opts.minCoveragePct ?? 10)) return null;
  let topPct = topRun.from / H * 100;
  if (topPct < topSearchCut) {
    // верх у хедер-зоні: беремо наступний ран нижче межі пошуку (хедер-скрим ≠ панель)
    const below = sorted.find(r => r.from / H * 100 >= topSearchCut);
    if (!below) return null;
    topPct = below.from / H * 100;
  }
  return +topPct.toFixed(1);
}

/*
  deriveGutterColor — АВТО-кандидат кольору панелі З САМОГО ҐАТТЕРА (S46-c, resolution-незалежно).
  Метод: рядки ґаттера в нижній зоні (bottomFrom%→низ); стабільні по вертикалі (|Δ next| ≤ 3)
  кластеризуються; найбільший кластер ≥ minCoverage% висоти = колір панелі. Фото в ґаттері
  нестабільне по вертикалі → кластера нема → null (панелі нема).
*/
export function deriveGutterColor(imgPath, opts = {}){
  const tol = opts.tol ?? 10, bottomFrom = opts.bottomFromPct ?? 45, minCov = opts.minCoveragePct ?? 10;
  const ppm = readPPM(toPPM(imgPath, 300));
  const { w, h, data } = ppm;
  const yFrom = Math.round(h * (opts.topCutPct ?? 0) / 100);
  const yTo = h - Math.round(h * (opts.botCutPct ?? 0) / 100);
  const H = yTo - yFrom;
  const x0 = Math.max(1, Math.round(w * 0.004)), x1 = Math.max(x0 + 1, Math.round(w * 0.009));
  const rows = [];
  for (let y = yFrom; y < yTo; y++) {
    let sr = 0, sg = 0, sb = 0, n = 0;
    for (let x = x0; x <= x1; x++) { const o = (y * w + x) * 3; sr += data[o]; sg += data[o + 1]; sb += data[o + 2]; n++; }
    rows.push([sr / n, sg / n, sb / n]);
  }
  const zoneFrom = Math.round(H * bottomFrom / 100);
  const stable = [];
  for (let i = zoneFrom; i < H - 1; i++) {
    const d = Math.max(Math.abs(rows[i][0] - rows[i + 1][0]), Math.abs(rows[i][1] - rows[i + 1][1]), Math.abs(rows[i][2] - rows[i + 1][2]));
    if (d <= 3) stable.push(rows[i]);
  }
  if (!stable.length) return null;
  // кластер: жадібно — найбільша група стабільних рядків у межах tol від свого центру
  let best = null;
  for (const c of stable) {
    const grp = stable.filter(r => Math.max(Math.abs(r[0] - c[0]), Math.abs(r[1] - c[1]), Math.abs(r[2] - c[2])) <= tol);
    if (!best || grp.length > best.length) best = grp;
  }
  if (!best || best.length / H * 100 < minCov) return null;
  const avg = (k) => Math.round(best.reduce((a, r) => a + r[k], 0) / best.length);
  return [avg(0), avg(1), avg(2)];
}
