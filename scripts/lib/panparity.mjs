// pan-parity: ГОРИЗОНТАЛЬНИЙ вимір парності (S54).
//
// НАВІЩО. Увесь харнес до S54 був вертикальний: structure-parity = EVENT-домен по вертикалі,
// surface-parity = панель/шов/колір, composition-static = статичні лінії. Горизонтального
// виміру НЕ ІСНУВАЛО НІДЕ — тому закон панорами parking загубився двічі (S52 при заміні
// механізму і S53 при підгонці під хибну величину), і жоден гейт цього не зловив.
//
// ЩО САМЕ МІРЯЄМО. НЕ `cumX` (один глобальний зсув вмісту, накопичений). У сцені з рухом
// камери горизонтальний потік НЕ однорідний: dx(x) = a + b·(x − W/2), де b — РОЗШИРЕННЯ
// (в кадр заходить більше сцени), a — ЧИСТА БІЧНА складова. Глобальний best-dx їх ЗЛИВАЄ,
// тому cumX ранжував відкинуту оком збірку ВИЩЕ за прийняту. Тут вони розділені:
//   sL(page), sR(page) — де стоять лівий і правий краї екрана В КООРДИНАТАХ СЦЕНИ
//                        (одиниця = ширина СТАРТОВОГО кадру)
//   G = sR − sL        — у скільки разів ШИРШЕ сцени влазить у кадр («зала відкривається»)
// Вердикт-словник: PAN:opens (G ≥ panOpensMin) · PAN:slides (G < panOpensMin, sL росте) · PAN:none
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
import { execSync } from 'node:child_process';

const W = 468;

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

export function grayFrames(src, { fps, crop, n }) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'panp-'));
  const vf = [crop, fps ? `fps=${fps}` : null, `scale=${W}:-2`, 'format=gray'].filter(Boolean).join(',');
  execSync(`ffmpeg -y -v error -i "${src}" -vf "${vf}" "${tmp}/f_%04d.pgm"`);
  const files = fs.readdirSync(tmp).filter(f => f.endsWith('.pgm')).sort().map(f => path.join(tmp, f));
  return { files, tmp, load: f => readPGM(f) };
}

export function grayFromImages(list) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'panp-'));
  const out = list.map((src, i) => {
    const o = path.join(tmp, `f_${String(i).padStart(4, '0')}.pgm`);
    execSync(`ffmpeg -y -v error -i "${src}" -vf "scale=${W}:-2,format=gray" "${o}"`);
    return o;
  });
  return { files: out, tmp, load: f => readPGM(f) };
}

function colProf(f, y0, y1) {
  const o = new Float64Array(f.w);
  for (let x = 0; x < f.w; x++) { let s = 0; for (let y = y0; y < y1; y++) s += f.data[y * f.w + x]; o[x] = s / (y1 - y0); }
  return o;
}

function segDX(PA, PB, xa, xb, maxD) {
  const L = PA.length, corr = new Map();
  const score = (d) => {
    const s = Math.max(xa, -d), e = Math.min(xb, L - d);
    if (e - s < (xb - xa) * 0.4) return -2;      // 0.4, не 0.6: інакше крайній блок з великим
    let ma = 0, mb = 0; const n = e - s;          // істинним зсувом відкидається за покриттям
    for (let i = s; i < e; i++) { ma += PA[i]; mb += PB[i + d]; }
    ma /= n; mb /= n;
    let sa = 0, sb = 0, sab = 0;
    for (let i = s; i < e; i++) { const u = PA[i] - ma, v = PB[i + d] - mb; sa += u * u; sb += v * v; sab += u * v; }
    return sab / Math.sqrt(sa * sb + 1e-9);
  };
  let best = { d: 0, p: -2 };
  for (let d = -maxD; d <= maxD; d++) { const p = score(d); corr.set(d, p); if (p > best.p) best = { d, p }; }
  const pm = corr.get(best.d - 1), pp = corr.get(best.d + 1);
  let sub = best.d;
  if (pm > -2 && pp > -2) { const den = pm - 2 * best.p + pp; if (Math.abs(den) > 1e-9) sub = best.d - 0.5 * (pp - pm) / den; }
  return { d: sub, p: best.p };
}

export function flowFit(A, B, { y0, y1, nb = 11, maxD = 40, pMin = 0.55 }) {
  const PA = colProf(A, y0, y1), PB = colProf(B, y0, y1);
  const pts = []; const bw = A.w / nb;
  for (let i = 0; i < nb; i++) {
    const xa = Math.round(i * bw), xb = Math.round((i + 1) * bw);
    const r = segDX(PA, PB, xa, xb, maxD);
    if (r.p >= pMin) pts.push({ x: (xa + xb) / 2, d: r.d, w: r.p });
  }
  if (pts.length < 4) return null;
  const cx = A.w / 2;
  const fit = (arr) => {
    let Sw = 0, Sx = 0, Sy = 0, Sxx = 0, Sxy = 0;
    for (const p of arr) { const X = p.x - cx, w = p.w; Sw += w; Sx += w * X; Sy += w * p.d; Sxx += w * X * X; Sxy += w * X * p.d; }
    const b = (Sw * Sxy - Sx * Sy) / ((Sw * Sxx - Sx * Sx) || 1e-9);
    const a0 = (Sy - b * Sx) / Sw;
    let res = 0; for (const p of arr) res += p.w * (p.d - (a0 + b * (p.x - cx))) ** 2;
    return { a: a0, b, res: Math.sqrt(res / Sw) };
  };
  let use = pts, r = fit(use);
  if (r.res > 0.8) {                                  // один прохід відкидання викидів:
    const keep = use.filter(p => Math.abs(p.d - (r.a + r.b * (p.x - cx))) <= 2.2 * r.res);
    if (keep.length >= 5 && keep.length < use.length) { use = keep; r = fit(use); }   // матчер збивається на
  }                                                   // повторюваних решітках паркінгу
  return { ...r, pts, used: use };
}

// потік НА КРАЯХ (саме він каже, що входить у кадр і що виходить)
function edgeFlow(A, B, band) {
  const r = flowFit(A, B, band);
  if (!r) return null;
  const p = r.pts.slice().sort((u, v) => u.x - v.x);
  const L = p.slice(0, 2), R = p.slice(-2);
  const mx = a => a.reduce((s, q) => s + q.x, 0) / a.length, md = a => a.reduce((s, q) => s + q.d, 0) / a.length;
  const xL = mx(L), dL = md(L), xR = mx(R), dR = md(R);
  const b = (dR - dL) / (xR - xL);
  return { d0: dL - b * xL, dW: dR + b * (W - xR), res: r.res };
}

// композиція: вікно екрана в координатах сцени
export function sceneWalk(src, band) {
  let s0 = 0, c = 1 / W;
  const out = [{ i: 0, sL: 0, sR: 1, G: 1 }];
  let A = src.load(src.files[0]);
  for (let i = 1; i < src.files.length; i++) {
    const B = src.load(src.files[i]);
    const e = edgeFlow(A, B, band);
    if (e) {
      const xa = -e.d0, xb = W - e.dW;
      const cNew = c * (xb - xa) / W;
      s0 = s0 + c * xa; c = cNew;
    }
    out.push({ i, sL: +s0.toFixed(4), sR: +(s0 + c * W).toFixed(4), G: +(c * W).toFixed(4) });
    A = B;
  }
  return out;
}

export function panVerdict(walk, TH) {
  const last = walk[walk.length - 1];
  if (last.G >= TH.panOpensMin) return { verdict: 'PAN:opens', ...last };
  if (Math.abs(last.sL) >= TH.panSlideMin) return { verdict: 'PAN:slides', ...last };
  return { verdict: 'PAN:none', ...last };
}
