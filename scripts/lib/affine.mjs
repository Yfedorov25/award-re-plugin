/*
  lib/affine.mjs — АФІННИЙ ВИМІРНИК зони (S55).

  Навіщо. Питання «а чи не МАСШТАБУЄТЬСЯ тут вміст?» вставало в S54 (promenade) і S55 (hero),
  і щоразу вимірник будувався заново в scratchpad. На hero саме він показав, що закон медіа
  був ПРОТИЛЕЖНИЙ живому (зум-аут замість parallax-травелу вгору). Тому він тут, а не в чернетці.

  Модель: B(x') = A(x), де x' = c + s·(x − c) + d — скейл довкола довільного початку
  (початок поглинається трансляцією). Шукаємо (s, dx, dy) максимумом NCC.

  🔴 КОНТРОЛЬ ОБОВʼЯЗКОВИЙ і живе поруч: `node scripts/atom-probe.mjs --control`.
  Історія: контроль цього вимірника спершу дав 2/5, і винен був НЕ вимірник, а моє ОЧІКУВАННЯ
  (еталон масштабував довкола центру КАДРУ, вимірник довкола центру ЗОНИ; різниця початку це
  рівно (s−1)·(cyЗони − cyКадру)). Перш ніж викидати інструмент — перевір очікування.
*/
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
import { execSync } from 'node:child_process';

export function readPGM(file) {
  const b = fs.readFileSync(file);
  let p = 0, tok = [];
  while (tok.length < 4) {
    while (b[p] === 32 || b[p] === 10 || b[p] === 13 || b[p] === 9) p++;
    if (b[p] === 35) { while (b[p] !== 10) p++; continue; }
    let s = p; while (b[p] !== 32 && b[p] !== 10 && b[p] !== 13 && b[p] !== 9) p++;
    tok.push(b.toString('ascii', s, p));
  }
  p++;
  const w = +tok[1], h = +tok[2];
  return { w, h, data: b.subarray(p, p + w * h) };
}

/** Сірі кадри відео у PGM. Повертає {files, dir} — dir прибирати самому. */
export function grayFrames(video, { fps = 12, w = 390, h = 844 } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'affine-'));
  execSync(`ffmpeg -y -v error -i "${video}" -vf "fps=${fps},scale=${w}:${h},format=gray" "${dir}/f_%04d.pgm"`);
  return { dir, files: fs.readdirSync(dir).filter(f => f.endsWith('.pgm')).sort().map(f => path.join(dir, f)) };
}

function sample(F, x, y) {
  if (x < 0 || y < 0 || x >= F.w - 1 || y >= F.h - 1) return null;
  const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0, i = y0 * F.w + x0;
  return F.data[i] * (1 - fx) * (1 - fy) + F.data[i + 1] * fx * (1 - fy)
       + F.data[i + F.w] * (1 - fx) * fy + F.data[i + F.w + 1] * fx * fy;
}

function ncc(A, B, pts, cx, cy, s, dx, dy) {
  let n = 0, sa = 0, sb = 0, aa = 0, bb = 0, ab = 0;
  for (const [x, y] of pts) {
    const va = sample(A, x, y);
    const vb = sample(B, cx + s * (x - cx) + dx, cy + s * (y - cy) + dy);
    if (va == null || vb == null) continue;
    n++; sa += va; sb += vb; aa += va * va; bb += vb * vb; ab += va * vb;
  }
  if (n < pts.length * 0.6) return -2;
  const ma = sa / n, mb = sb / n;
  return (ab / n - ma * mb) / Math.sqrt((aa / n - ma * ma) * (bb / n - mb * mb) + 1e-9);
}

/** Найкраща (s, dx, dy) між кадрами A і B у прямокутнику rect={x0,y0,x1,y1}. */
export function affineFit(A, B, rect, opt = {}) {
  const [sLo, sHi] = opt.sRange || [0.55, 1.45];
  const maxD = opt.maxD ?? 100, step = opt.step || 3, inset = opt.inset ?? 0.15;
  const cx = (rect.x0 + rect.x1) / 2, cy = (rect.y0 + rect.y1) / 2;
  const w = rect.x1 - rect.x0, h = rect.y1 - rect.y0, pts = [];
  for (let y = rect.y0 + h * inset; y <= rect.y1 - h * inset; y += step)
    for (let x = rect.x0 + w * inset; x <= rect.x1 - w * inset; x += step) pts.push([x, y]);
  let best = { p: -2, s: 1, dx: 0, dy: 0 };
  for (let s = sLo; s <= sHi + 1e-9; s += 0.02)
    for (let dy = -maxD; dy <= maxD; dy += 4)
      for (let dx = -24; dx <= 24; dx += 4) {
        const p = ncc(A, B, pts, cx, cy, s, dx, dy);
        if (p > best.p) best = { p, s, dx, dy };
      }
  for (let s = best.s - 0.02; s <= best.s + 0.02 + 1e-9; s += 0.005)
    for (let dy = best.dy - 4; dy <= best.dy + 4; dy++)
      for (let dx = best.dx - 4; dx <= best.dx + 4; dx++) {
        const p = ncc(A, B, pts, cx, cy, s, dx, dy);
        if (p > best.p) best = { p, s, dx, dy };
      }
  // нерухома точка зуму по вертикалі: dy(y) = (s−1)(y − yFix)
  const yFix = Math.abs(best.s - 1) > 0.01 ? cy - best.dy / (best.s - 1) : null;
  return { s: +best.s.toFixed(3), dx: +best.dx.toFixed(1), dy: +best.dy.toFixed(1),
           ncc: +best.p.toFixed(3), yFix: yFix == null ? null : Math.round(yFix) };
}

/** Синтетичний кадр з ВІДОМОЮ трансформою (для контролю). Скейл довкола центру КАДРУ. */
export function synth(A, s, dx, dy) {
  const cx = A.w / 2, cy = A.h / 2;
  const out = { w: A.w, h: A.h, data: Buffer.alloc(A.w * A.h) };
  for (let y = 0; y < A.h; y++) for (let x = 0; x < A.w; x++) {
    const v = sample(A, cx + (x - cx - dx) / s, cy + (y - cy - dy) / s);
    out.data[y * A.w + x] = v == null ? 0 : Math.round(v);
  }
  return out;
}
