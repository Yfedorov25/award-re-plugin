/*
  lib/zonetrack.mjs — ЗОННИЙ ТРЕК v2 (план ради S47, крок 2; МІНІМАЛЬНА версія за рішенням Єгора).

  Корінь S47: механіка вгадувалась ОКОМ зі статичного montage (strip/stack/swap там нерозрізнимі).
  Цей модуль відповідає на вимірні питання ДО написання CHOREO:
    «хто СТОЇТЬ, хто ЇДЕ (куди, скільки), кого НАКРИВАЮТЬ, у кого ЗАМІНЮЄТЬСЯ вміст».

  ВХІД: сірі кадри (ffmpeg → PGM; live-відео АБО скріншоти нашого render(p)) + зони,
  задекларовані ВРУЧНУ прямокутниками З LIVE-КАДРУ (не з нашого коду) у %-координатах
  КОНТЕНТ-ОБЛАСТІ (між site-chrome зверху і URL-баром знизу) — так live і наш render
  живуть в одній системі координат.

  ПЕР-ЗОНА СИГНАЛИ (все числа, нуль «бачу на montage»):
    cum[t]        — кумулятивний вертикальний зсув вмісту зони (cross-corr row-профілю, як
                    track.mjs на promenade) у % висоти контенту; conf[t] — довіра (пік кореляції
                    × дисперсія профілю; плоска зона → трекінг неможливий → UNKNOWN fail-closed);
    ink[t]        — кількість «чорнильних» рядків (дисперсія рядка > порогу) = текст-рядки
                    (ручний прототип ivy: 19→4→27 = SWAP);
    grid[t]       — 12×12 downsample зони (контент-відбиток; відстань між grid-ами = зміна вмісту);
    texVar[t]     — середня дисперсія рядків зони (є контент чи пусто).

  ВЕРДИКТИ (ЗАКРИТИЙ словник ради): STANDS / TRAVELS(dir,px) / SWAPS-CONTENT / COVERED-BY /
  ENTERS / EXITS / FADES / UNKNOWN. UNKNOWN = fail-closed (сигнали суперечать або зона
  нетрекабельна) → автоматичний борд-блокер, НЕ мовчазний пропуск.

  TIME-домен чесність: вікна тут = індекси кадрів (live: час; наш: p-стани). Порівняння
  live↔наш робиться ТІЛЬКИ в EVENT-домені (токени/порядок/лічильники) — diffTokens().
*/
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';

export const ZT_VOCAB = ['STANDS', 'TRAVELS', 'SWAPS-CONTENT', 'COVERED-BY', 'ENTERS', 'EXITS', 'FADES', 'MEDIA', 'UNKNOWN'];
// MEDIA (словник ради, крок 2): внутрішній рух медіа в зоні kind:'media' — НЕ структурна
// подія (грає відео/анімований рендер); виключається з diff як STANDS. Ідентичність медіа
// судять інші виміри (media-type, surface-parity).
export const MECHANIC_REGISTRY = ['strip', 'stack+cover', 'pin+swap', 'parallax-hero', 'fade', 'swipe-strip', 'OTHER'];

export const shaFile = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

// ── P5 PGM parser (той самий формат що live-timeline.mjs) ────────────────────
export function readPGM(p){
  const buf = fs.readFileSync(p);
  let pos = 0; const fields = [];
  while (fields.length < 4) {
    while (buf[pos] === 32 || buf[pos] === 10 || buf[pos] === 13 || buf[pos] === 9) pos++;
    if (buf[pos] === 35) { while (buf[pos] !== 10) pos++; continue; }
    let s = pos; while (pos < buf.length && buf[pos] > 32) pos++;
    fields.push(buf.toString('ascii', s, pos));
  }
  pos++;
  const w = +fields[1], h = +fields[2];
  return { w, h, data: buf.subarray(pos, pos + w * h) };
}

// відео → сірі кадри (caller видаляє tmpdir після використання)
export function framesFromVideo(video, { fps = 12, scaleW = 234 } = {}){
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zt-'));
  execSync(`ffmpeg -y -i "${video}" -vf fps=${fps},scale=${scaleW}:-2,format=gray "${tmp}/f_%04d.pgm" -loglevel error`);
  const files = fs.readdirSync(tmp).filter(f => f.endsWith('.pgm')).sort();
  return { frames: files.map(f => readPGM(path.join(tmp, f))), fps, tmpdir: tmp };
}

// скріншоти нашого render(p) → сірі кадри (той самий формат що live)
export function framesFromPNGs(paths, { scaleW = 234 } = {}){
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ztp-'));
  const frames = paths.map((p, i) => {
    const out = path.join(tmp, `f_${i}.pgm`);
    execSync(`ffmpeg -y -i "${p}" -vf scale=${scaleW}:-2,format=gray "${out}" -loglevel error`);
    return readPGM(out);
  });
  fs.rmSync(tmp, { recursive: true, force: true });
  return frames;
}

// ── контент-область: live має chrome зверху/знизу, наш render = весь кадр ────
// content = {topPx, botPx} у пікселях кадру; зони декларуються у % КОНТЕНТУ.
export function contentBox(frame, cuts){
  const topPx = Math.round(frame.h * (cuts?.topPct ?? 0) / 100);
  const botPx = Math.round(frame.h * (100 - (cuts?.botPct ?? 0)) / 100);
  return { topPx, botPx, hPx: botPx - topPx };
}

const zoneRectPx = (frame, box, rectPct) => ({
  x0: Math.round(frame.w * rectPct[0] / 100),
  y0: box.topPx + Math.round(box.hPx * rectPct[1] / 100),
  x1: Math.round(frame.w * rectPct[2] / 100),
  y1: box.topPx + Math.round(box.hPx * rectPct[3] / 100),
});

// row-профіль зони: середній gray per рядок (y0..y1 у px кадру)
function rowProf(frame, x0, y0, x1, y1){
  const prof = [];
  for (let y = y0; y < y1; y++) {
    let s = 0; const off = y * frame.w;
    for (let x = x0; x < x1; x++) s += frame.data[off + x];
    prof.push(s / (x1 - x0));
  }
  return prof;
}
// S53: КОЛОНКОВИЙ профіль (дзеркало rowProf). Потрібен, бо весь харнес був вертикальний
// ЗА КОНСТРУКЦІЄЮ: дрейф зони компенсувався лише по Y, а горизонтальна ПАНОРАМА (live parking
// -66% ширини за хід камери) робила КОЖЕН бенд «структурно зміненим» і читалась як накриття.
function colProf(frame, x0, y0, x1, y1){
  const prof = [];
  for (let x = x0; x < x1; x++) {
    let s = 0;
    for (let y = y0; y < y1; y++) s += frame.data[y * frame.w + x];
    prof.push(s / (y1 - y0));
  }
  return prof;
}
const variance = (v) => { const m = v.reduce((s, x) => s + x, 0) / v.length; return v.reduce((s, x) => s + (x - m) * (x - m), 0) / v.length; };

// нормалізована крос-кореляція профілю a проти b зі зсувом d ∈ [-maxD..maxD]
// повертає {d, peak} — peak ∈ [-1..1]; плоскі профілі → peak невизначений → conf 0
function bestShift(a, b, maxD){
  const norm = (v) => { const m = v.reduce((s, x) => s + x, 0) / v.length; return v.map(x => x - m); };
  const na = norm(a), nb = norm(b);
  const mag = (v) => Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  const ma = mag(na);
  let best = 0, bestScore = -Infinity;
  for (let d = -maxD; d <= maxD; d++) {
    let s = 0, cnt = 0, mb2 = 0;
    for (let i = 0; i < na.length; i++) {
      const j = i + d;
      if (j < 0 || j >= nb.length) continue;
      s += na[i] * nb[j]; mb2 += nb[j] * nb[j]; cnt++;
    }
    if (cnt < na.length * 0.5) continue;
    const den = ma * Math.sqrt(mb2);
    const score = den > 1e-6 ? s / den : 0;
    if (score > bestScore) { bestScore = score; best = d; }
  }
  return { d: best, peak: bestScore === -Infinity ? 0 : bestScore };
}

// 12×12 контент-відбиток зони
function zoneGrid(frame, x0, y0, x1, y1, n = 12){
  const g = new Array(n * n).fill(0);
  const cw = (x1 - x0) / n, ch = (y1 - y0) / n;
  for (let gy = 0; gy < n; gy++) for (let gx = 0; gx < n; gx++) {
    let s = 0, c = 0;
    for (let y = Math.floor(y0 + gy * ch); y < y0 + (gy + 1) * ch; y++)
      for (let x = Math.floor(x0 + gx * cw); x < x0 + (gx + 1) * cw; x++) { s += frame.data[y * frame.w + x]; c++; }
    g[gy * n + gx] = c ? s / c : 0;
  }
  return g;
}
export const gridDist = (a, b) => a.reduce((s, x, i) => s + Math.abs(x - b[i]), 0) / a.length;

// ── SCALE-MOTION: ГОМОТЕТІЯ vs ТРАНСЛЯЦІЯ (S51, фікс сліпоти накопичувача до ЗУМУ) ──
// Корінь S50-провалу parking: накопичувач міряє «скільки зони перестало показувати свій
// якір» — а це і накриття, і ЗУМ, і потік. Поняття «затемнення» в ньому немає, тому
// pin+zoom-out мінтив хибний COVERED-BY у media-зоні (наш свіп) — structure-parity 4 діфи.
// ВБИТІ КАНДИДАТИ (числа в CHOREO amenities-parking, НЕ повторювати): span-drift скаляр
// (S50: справжні covers 13-17% = як артефакт); solidFront (промінад-накриття теж
// solidFront=0 — накриває ФОТО, не крем); split-drift верх/низ (зум 6.6% зони проти
// справжніх covers 11-15% = інверсія); 1-D scale-fit по row-профілю (2 вільні параметри
// на згладжений профіль = оверфіт: промінад ×0.39 зиску як зум).
// ЩО ПРАЦЮЄ: гомотетія про центр c з фактором k (y_cp = c + k·(y_anchor − c)) на 12×12
// zone-grid = 144 обмеження на 3 вільні параметри (оверфіту немає: k=1 перемагає всюди,
// де масштабу справді немає). ВАЖЛИВО: при зумі-АУТ прообраз зони БІЛЬШИЙ за кадр, тому
// беремо ОБИДВА напрямки — k<1 порівнює зону в i0 з її СТИСНУТИМ образом у i1, k>1 навпаки.
const ZOOM_K = [0.30, 0.35, 0.39, 0.45, 0.52, 0.60, 0.70, 0.80, 0.88, 1.14, 1.25, 1.43, 1.67, 1.92, 2.22, 2.56, 3.33];
export function bestZoomFit(frames, rect, i0, i1, n = 12){
  const { x0, y0, x1, y1 } = rect;
  const W = frames[0].w, H = frames[0].h;
  const gA = zoneGrid(frames[i0], x0, y0, x1, y1, n);
  const gB = zoneGrid(frames[i1], x0, y0, x1, y1, n);
  const dIdent = gridDist(gB, gA);
  let dTrans = dIdent;                                   // база: найкраща ЧИСТА трансляція
  const maxD = Math.round((y1 - y0) * 0.6);
  for (let dy = -maxD; dy <= maxD; dy += 2) {
    if (y0 - dy < 0 || y1 - dy > H) continue;
    const d = gridDist(gB, zoneGrid(frames[i0], x0, y0 - dy, x1, y1 - dy, n));
    if (d < dTrans) dTrans = d;
  }
  const base = Math.min(dIdent, dTrans);
  let best = { k: 1, xc: 0, yc: 0, d: base };
  const probe = (k, xc, yc) => {
    const f = k < 1 ? k : 1 / k;                          // сторона з БІЛЬШИМ вмістом стискається
    const qx0 = xc + (x0 - xc) * f, qx1 = xc + (x1 - xc) * f;
    const qy0 = yc + (y0 - yc) * f, qy1 = yc + (y1 - yc) * f;
    if (qx0 < 0 || qy0 < 0 || qx1 > W || qy1 > H || qx1 - qx0 < 10 || qy1 - qy0 < 10) return;
    const q = [Math.round(qx0), Math.round(qy0), Math.round(qx1), Math.round(qy1)];
    const d = k < 1 ? gridDist(gA, zoneGrid(frames[i1], ...q, n))
                    : gridDist(gB, zoneGrid(frames[i0], ...q, n));
    if (d < best.d) best = { k, xc, yc, d };
  };
  let stepX = Math.max(8, Math.round(W / 8)), stepY = Math.max(10, Math.round(H / 16));
  for (const k of ZOOM_K) for (let xc = -W; xc <= 2 * W; xc += stepX) for (let yc = -H; yc <= 2 * H; yc += stepY) probe(k, xc, yc);
  // ЛОКАЛЬНЕ УТОЧНЕННЯ (S51-b, знайдено синтетичним ratchet-ом): дискретна k-сітка лишає
  // РЕЗИДУАЛ навіть істинному зуму (синтетичний k=0.40 сідав на 0.45 → dScale 12.7 при
  // ztGridLow=12 = хибний пропуск). Два раунди звуження по k і центру навколо переможця.
  // Накриття це НЕ рятує (жодна гомотетія його не пояснює на будь-якій роздільності).
  if (best.k !== 1) {
    for (let round = 0; round < 2; round++) {
      const { k, xc, yc } = best;
      const dk = k * (round === 0 ? 0.08 : 0.03);
      for (const kk of [k - 2 * dk, k - dk, k, k + dk, k + 2 * dk]) {
        if (kk <= 0.1) continue;
        for (const dx of [-stepX / 2, 0, stepX / 2]) for (const dy of [-stepY / 2, 0, stepY / 2]) probe(kk, xc + dx, yc + dy);
      }
      stepX = Math.max(2, stepX / 2); stepY = Math.max(2, stepY / 2);
    }
  }
  return { kBest: +best.k.toFixed(3), dScale: +best.d.toFixed(1), dIdent: +dIdent.toFixed(1),
    dTrans: +dTrans.toFixed(1), gainRatio: +(base / Math.max(best.d, 0.1)).toFixed(2) };
}
// SCALE-MOTION = гомотетія пояснює обидва кінці як ТОЙ САМИЙ вміст (dScale < ztGridLow —
// існуючий поріг «вміст той самий») І має СПРАВЖНЮ перевагу над трансляцією (≥ztZoomGainMin).
// Обидві умови разом: parking-зум dScale 6.5 ×5.32 → scale-motion; parking live panel C1
// dScale 10.1 але ×1.17 → трансляція, НЕ scale (лишається); promenade/ivy dScale 17-37 → лишаються.
export function isScaleMotion(frames, rect, i0, i1, TH){
  const zf = bestZoomFit(frames, rect, i0, i1);
  return { ...zf, scaleMotion: zf.dScale < TH.ztGridLow && zf.gainRatio >= TH.ztZoomGainMin };
}

// ── ПАРАЛАКС: РУХ КАМЕРИ vs НАКРИТТЯ (S52) ───────────────────────────────────
// Третій член словника. Раніше вимірник знав лише {трансляція, гомотетія}, тому РУХ КАМЕРИ
// (проїзд сцени з глибиною) читався як накриття: у зоні «вміст перестав показувати якір
// прогресивним фронтом». Саме так наш parking після заміни механізму на секвенцію відʼїзду
// мінтив хибний COVERED-BY (panel f4-29: dScale 17.8 > ztGridLow, dTrans 60.2 ≫ ztGridLow,
// тобто ані гомотетія, ані трансляція зону не пояснюють, і обидві існуючі брами мовчать).
// ОЗНАКА, що це та сама сцена під камерою, а не новий вміст: БЛИЗЬКИЙ і ДАЛЕКИЙ плани зони
// вимагають РІЗНИХ масштабів, ПРИ ЦЬОМУ кожен сам по собі матчиться як той самий вміст.
// При будь-якому зумі статики це відношення рівно 1.00 ЗА ПОБУДОВОЮ (усе масштабується разом),
// а накриття не дає обом половинам малого резидуалу (новий вміст не пояснюється нічим).
// Ділимо зону по горизонталі навпіл (ліва/права), бо в перспективній сцені саме так лягає
// градієнт глибини (підтверджено на live parking: ліва половина ×3.33, права ×1.22).
//
// 🔴🔴 S52 СТАТУС: ІНЕРТНА. НУЛЬ місць виклику. НЕ ВМИКАТИ в coverEvents без нового
// розділення. ДВІ реалізації підряд ВБИТО числом на тих самих 10 накопичених кандидатах
// (5 атомів × 2 боки), і вони провалились ПРОТИЛЕЖНО:
//   (1) через bestZoomFit (груба 12×12 сітка + дискретні k): `bothFit=false` У ВСІХ, включно
//       з цільовим (наш parking panel s4-29: ratio 1.13, dL 19.0, dR 12.3 при ztGridLow=12).
//       На спані завдовжки з увесь хід камери жодна половина не лягає на один масштаб.
//   (2) через NCC-патч-матчинг (цей код): `bothFit=true` У ВСІХ, тобто умова стала ВАКУУМНОЮ
//       (NCC-пошук завжди знаходить якийсь найкращий матч навіть для НОВОГО вмісту), а сам
//       ratio НЕ РОЗДІЛЯЄ: наш parking panel 1.75 (рух камери, треба глушити) проти
//       promenade live f57-78 = 1.84 і ivy live f234-261 = 1.88 (СПРАВЖНІ накриття).
//       Будь-який поріг нижче 1.84 вбиває два справжні covers.
// УРОК: прототип S52 (числа 1.00 / 2.73 / 7.43) був ВИМІРЮВАЛЬНИМ інструментом на СЦЕНІ, ПРО
// ЯКУ ВЖЕ ВІДОМО, що вона один безперервний кадр. Проти справжніх накриттів його ніхто не
// перевіряв. Перетворення виміру на КЛАСИФІКАТОР вимагає розділення, і на цьому рівні його немає.
// НАСТУПНИЙ КАНДИДАТ (інший рівень, БЕЗ нового порога): чинити не в накопичувачі, а в ЗОНАХ.
// Зона `panel` існує щоб стежити за КРЕМ-панеллю; поки крему в прямокутнику ще немає, крізь
// нього тече чужий шар (фото під рухом камери), і події там не належать цій зоні взагалі.
// Тобто гейтити події зони наявністю її власного bgRGB (zones.json уже несе bgRGB). Це і є
// давній TODO з zones.json «(а) ink-події гейтити page-quiet», лише узагальнений.
// Прототипи-вимірники (корисні самі по собі) в scratchpad S52: parallax2.mjs, law.mjs, ourpar.mjs.
// патч-матчинг по NCC: у якому масштабі й де в кадрі i1 лежить вміст прямокутника з кадру i0.
// NCC (а не gridDist) бо він інваріантний до глобальної яскравості/контрасту, а зміна освітлення
// уздовж проїзду сцени саме така. Дрібний крок масштабу (0.02) обовʼязковий: дискретна k-сітка
// bestZoomFit вироджує ознаку (перша реалізація S52 дала bothFit=false на ВСІХ кандидатах).
const GXP = 40, GYP = 20;
function patchVec(f, x0, y0, w, h){
  const v = new Array(GXP * GYP);
  for (let j = 0; j < GYP; j++) for (let i = 0; i < GXP; i++) {
    const x = Math.max(0, Math.min(f.w - 1, Math.round(x0 + (i + 0.5) * w / GXP)));
    const y = Math.max(0, Math.min(f.h - 1, Math.round(y0 + (j + 0.5) * h / GYP)));
    v[j * GXP + i] = f.data[y * f.w + x];
  }
  return v;
}
function nccVec(a, b){
  const n = a.length; let ma = 0, mb = 0;
  for (let i = 0; i < n; i++) { ma += a[i]; mb += b[i]; }
  ma /= n; mb /= n;
  let sa = 0, sb = 0, sab = 0;
  for (let i = 0; i < n; i++) { const u = a[i] - ma, v = b[i] - mb; sa += u * u; sb += v * v; sab += u * v; }
  return sab / Math.sqrt(sa * sb + 1e-9);
}
export function bestPatchFit(frames, rect, i0, i1){
  const A = frames[i0], B = frames[i1];
  const pw = rect.x1 - rect.x0, ph = rect.y1 - rect.y0;
  const ref = patchVec(A, rect.x0, rect.y0, pw, ph);
  const stepX = Math.max(2, Math.round(B.w / 120)), stepY = Math.max(2, Math.round(B.h / 120));
  let best = { ncc: -2, scale: 1 };
  for (let sc = 0.14; sc <= 1.32; sc += 0.02) {
    const w = pw * sc, h = ph * sc;
    for (let x = -w * 0.25; x <= B.w - w * 0.75; x += stepX)
      for (let y = -h * 0.25; y <= B.h - h * 0.75; y += stepY) {
        const n = nccVec(ref, patchVec(B, x, y, w, h));
        if (n > best.ncc) best = { ncc: n, scale: sc };
      }
  }
  return { ncc: +best.ncc.toFixed(3), scale: +best.scale.toFixed(3), mag: +(1 / best.scale).toFixed(2) };
}
export function isParallaxMotion(frames, rect, i0, i1, TH){
  const xm = Math.round((rect.x0 + rect.x1) / 2);
  const L = bestPatchFit(frames, { ...rect, x1: xm }, i0, i1);
  const R = bestPatchFit(frames, { ...rect, x0: xm }, i0, i1);
  const ratio = Math.max(L.mag, R.mag) / Math.max(Math.min(L.mag, R.mag), 0.01);
  const bothFit = L.ncc >= TH.ztMinCorrPeak && R.ncc >= TH.ztMinCorrPeak;   // існуючий поріг, нового не треба
  return { ratio: +ratio.toFixed(2), magL: L.mag, magR: R.mag, nccL: L.ncc, nccR: R.ncc, bothFit,
    parallaxMotion: bothFit && ratio >= TH.ztParallaxMin };
}

// ── головний екстрактор ──────────────────────────────────────────────────────
// zonesDecl = { cuts:{topPct,botPct}, zones:[{id, rectPct:[x0,y0,x1,y1]}] } (y у % КОНТЕНТУ)
export function extractTrack(frames, zonesDecl, TH){
  const box = contentBox(frames[0], zonesDecl.cuts);
  const maxD = Math.max(4, Math.round(box.hPx * TH.ztMaxShiftFrac));
  const track = { n: frames.length, w: frames[0].w, h: frames[0].h, contentHPx: box.hPx, zones: {}, global: { cum: [0], mag: [0] } };

  // global: рух+зсув усієї контент-області (для вікон і pinned-класифікації)
  const gProfs = frames.map(f => rowProf(f, 0, box.topPx, f.w, box.botPx));
  for (let i = 1; i < frames.length; i++) {
    const { d } = bestShift(gProfs[i - 1], gProfs[i], maxD);
    track.global.cum.push(track.global.cum[i - 1] + d);
    let mag = 0;
    const a = frames[i - 1].data, b = frames[i].data;
    for (let y = box.topPx; y < box.botPx; y++) { const off = y * frames[i].w;
      for (let x = 0; x < frames[i].w; x += 2) mag += Math.abs(a[off + x] - b[off + x]); }
    track.global.mag.push(mag);
  }

  for (const z of zonesDecl.zones) {
    const r = zoneRectPx(frames[0], box, z.rectPct);
    const zt = { cum: [0], conf: [1], cumX: [0], confX: [1], ink: [], grid: [], texVar: [], rect: r, kind: z.kind || 'band' };
    const maxDX = Math.max(4, Math.round((r.x1 - r.x0) * TH.ztMaxShiftFrac));
    let prevProf = null, prevCol = null;
    for (let i = 0; i < frames.length; i++) {
      const f = frames[i];
      const prof = rowProf(f, r.x0, r.y0, r.x1, r.y1);
      // ink-рядки + текстура
      let inkRows = 0, tvSum = 0;
      for (let y = r.y0; y < r.y1; y++) {
        const row = [];
        for (let x = r.x0; x < r.x1; x++) row.push(f.data[y * f.w + x]);
        const tv = variance(row);
        tvSum += tv;
        if (tv > TH.ztInkVarThr) inkRows++;
      }
      zt.ink.push(inkRows);
      zt.texVar.push(tvSum / (r.y1 - r.y0));
      zt.grid.push(zoneGrid(f, r.x0, r.y0, r.x1, r.y1));
      const colp = colProf(f, r.x0, r.y0, r.x1, r.y1);        // S53: горизонтальний трек зони
      if (prevProf) {
        const pv = variance(prof);
        const { d, peak } = bestShift(prevProf, prof, maxD);
        const conf = pv < TH.ztMinProfVar ? 0 : peak;
        zt.cum.push(zt.cum[i - 1] + (conf >= TH.ztMinCorrPeak ? d : 0));
        zt.conf.push(conf);
        const cv = variance(colp);
        const rx = bestShift(prevCol, colp, maxDX);
        const confX = cv < TH.ztMinProfVar ? 0 : rx.peak;
        zt.cumX.push(zt.cumX[i - 1] + (confX >= TH.ztMinCorrPeak ? rx.d : 0));
        zt.confX.push(confX);
      }
      prevProf = prof; prevCol = colp;
    }
    track.zones[z.id] = zt;
  }
  return track;
}

// ── вікна руху: ПЕР-ЗОНА (S48 фікс: глобальний поріг топив дрібний title-swap
// на тлі великих рухів карток — swap №2 ivy випадав без вікна = подія зникала) ─
export function computeWindows(track, TH){
  const mags = track.global.mag.slice(1);
  const mean = mags.reduce((s, x) => s + x, 0) / mags.length;
  const thr = mean * (TH.ztWindowThrFactor ?? 0.9);
  const windows = []; let run = [];
  const flush = () => { if (run.length >= (TH.ztWindowMinRun ?? 3)) windows.push({ f0: run[0], f1: run[run.length - 1] }); run = []; };
  for (let i = 1; i < track.global.mag.length; i++) { if (track.global.mag[i] > thr) run.push(i); else flush(); }
  flush();
  return windows;
}

// per-зона вікна: adaptive-поріг по власній міжкадровій зміні зони + абсолютний флор
// (пуста cream-зона не мінтить вікна з шуму). Повертає {zoneId: [{f0,f1}]}.
export function computeZoneWindows(frames, track, TH){
  const out = {};
  for (const [id, z] of Object.entries(track.zones)) {
    const { x0, y0, x1, y1 } = z.rect;
    const mags = [0];
    for (let i = 1; i < frames.length; i++) {
      const a = frames[i - 1].data, b = frames[i].data;
      let m = 0, cnt = 0;
      for (let y = y0; y < y1; y += 2) { const off = y * frames[i].w;
        for (let x = x0; x < x1; x += 2) { if (Math.abs(a[off + x] - b[off + x]) > TH.ztPixTol) m++; cnt++; } }
      mags.push(m / cnt);                                // частка змінених px зони (семпл 2×2)
    }
    const act = mags.filter(v => v > 0.005);
    const mean = act.length ? act.reduce((s, x) => s + x, 0) / act.length : 0;
    const thr = Math.max(TH.ztZoneMagFloor, mean * (TH.ztWindowThrFactor ?? 0.9) * 0.5);
    const ws = []; let run = [];
    const flush = () => { if (run.length >= (TH.ztWindowMinRun ?? 3)) ws.push({ f0: run[0] - 1, f1: run[run.length - 1] }); run = []; };
    for (let i = 1; i < mags.length; i++) { if (mags[i] > thr) run.push(i); else flush(); }
    flush();
    // merge вікон з розривом ≤3 кадри (0.25с @12fps): пауза руки Єгора ріже ОДИН
    // фізичний хід (cover) на фрагменти — фрагмент хибно класифікується (S48 ivy f128-169)
    const merged = [];
    for (const w of ws) {
      const last = merged[merged.length - 1];
      if (last && w.f0 - last.f1 <= 3) last.f1 = w.f1; else merged.push({ ...w });
    }
    out[id] = merged;
  }
  return out;
}

// зона «поїхала ЗІ сторінкою»? (seam-вікна: власний трек зони губиться бо вміст
// повністю замінюється ЧЕРЕЗ зону; перевіряємо чи вміст зони на f1 = вміст КАДРУ f0,
// зсунутий на глобальний page-shift) → чесний TRAVELS(page-locked) замість UNKNOWN
function pageLockedCheck(frames, rect, f0, f1, shiftPx){
  if (Math.abs(shiftPx) < 2) return null;
  const { x0, y0, x1, y1 } = rect;
  const h = frames[0].h;
  const sy0 = y0 - shiftPx, sy1 = y1 - shiftPx;          // де цей вміст був у f0
  if (sy0 < 0 || sy1 > h) return null;                   // джерело поза кадром — не перевірити
  const gNow = zoneGrid(frames[f1], x0, y0, x1, y1);
  const gSrc = zoneGrid(frames[f0], x0, Math.round(sy0), x1, Math.round(sy1));
  const gInPlace = zoneGrid(frames[f0], x0, y0, x1, y1);
  const dShift = gridDist(gNow, gSrc), dPlace = gridDist(gNow, gInPlace);
  return { dShift, dPlace, locked: dShift < dPlace * 0.55 && dShift < 25 };
}

// частка змінених px зони між кадрами i0..i1 (сира, для людини в numbers)
function changedStats(frames, rect, i0, i1, TH){
  const a = frames[i0], b = frames[i1];
  const { x0, y0, x1, y1 } = rect;
  let changed = 0, total = 0;
  for (let y = y0; y < y1; y++) {
    const off = y * a.w;
    for (let x = x0; x < x1; x++) { if (Math.abs(a.data[off + x] - b.data[off + x]) > TH.ztPixTol) changed++; total++; }
  }
  return { changedFrac: changed / total };
}

// ── DRIFT-КОМПЕНСОВАНІ БЕНДИ (S48 фікс: 1px-джитер текстурного фото робить
// «змінені» МАЙЖЕ ВСІ пікселі — сирі маски топлять фронт; тому зміну міряємо
// 24 горизонтальними бендами, компенсуючи виміряний зсув зони) ────────────────
const N_BANDS = 24;
// scale-модель старого шару (S49): y_f0 = zoneTop + (y_f1 - zoneTop - d)/s
// (recede = стискання вмісту до верху зони + зсув d; s=1 → чиста трансляція як S48)
function bandDists(frames, rect, i0, i1, driftPx, scale = 1, driftXPx = 0){
  const { x0, y0, x1, y1 } = rect;
  const f0 = frames[i0], f1 = frames[i1];
  const bh = (y1 - y0) / N_BANDS;
  const dists = [];
  for (let bi = 0; bi < N_BANDS; bi++) {
    const by0 = Math.round(y0 + bi * bh), by1 = Math.round(y0 + (bi + 1) * bh);
    const sy0 = Math.round(y0 + (by0 - y0 - driftPx) / scale),                // де цей бенд був у f0
          sy1 = Math.round(y0 + (by1 - y0 - driftPx) / scale);
    if (sy0 < 0 || sy1 > f0.h) { dists.push(null); continue; }                // джерело поза кадром
    // S53: компенсація по X рахується на ПЕРЕТИНІ (інакше при великому зсуві джерело виходить
    // за кадр і кандидат вироджується в null — саме на цьому спіткнулась перша версія патча)
    const sh = Math.round(driftXPx);
    const sLo = Math.max(0, x0 - sh), sHi = Math.min(f0.w, x1 - sh);
    const nLo = sLo + sh, nHi = sHi + sh;
    if (nHi - nLo < (x1 - x0) * 0.5 || nLo < 0 || nHi > f1.w) { dists.push(null); continue; }
    const gNow = zoneGrid(f1, nLo, by0, nHi, by1, 6);
    const gSrc = zoneGrid(f0, sLo, sy0, sHi, sy1, 6);
    dists.push(gridDist(gNow, gSrc));
  }
  return dists;
}

// ── SCALE-AWARE ПОШУК ТРАНСФОРМИ СТАРОГО ШАРУ (S49, фікс сліпоти до ПАРАЛЕЛЬНОГО cover) ──
// Корінь S48-провалу ivy: коли стара картка ПІД ЧАС cover сама recede-ить (scale-вгору,
// live f640-895: pod 329→309px паралельно з приходом playground), її top-бенди читались як
// «структурно змінені» → фронт з хибного боку (top) / MEDIA; код атома підганявся під сліпий
// вимірник (DRIFT_LAG). Фікс: перед пошуком фронту перебираємо малу сітку трансформ (s,d)
// старого шару і беремо ту, що НАЙКРАЩЕ пояснює бенди за робастним скором (середнє нижніх
// 60% — консенсус більшості бендів = старий шар; накриті бенди не пояснює ЖОДНА трансформа).
// Гістерезис: не-identity приймається ЛИШЕ якщо скор кращий ≥15% — «media міняється»
// (жодна трансформа не пояснює зону) чесно лишається MEDIA, справжні cover-фронти не гасяться.
const ZT_SCALES = [1, 0.97, 0.94, 0.91, 0.88];   // recede до −12% (live ivy: −6% за хвилю дрейфу)
const ZT_SHIFTS = [-8, -6, -4, -2, 0, 2];        // px додатково до seed-зсуву (recede = вгору)
const ZT_ACCEPT_RATIO = 0.85;                    // гістерезис прийняття не-identity трансформи
function robustScore(dists){
  const known = dists.filter(d => d != null).sort((a, b) => a - b);
  if (!known.length) return Infinity;
  const k = Math.max(1, Math.ceil(known.length * 0.6));
  return known.slice(0, k).reduce((s, x) => s + x, 0) / k;
}
function bestBandDists(frames, rect, i0, i1, seedDriftPx, driftXPx = 0){
  // S53: identity = БЕЗ горизонтальної компенсації. Виміряний горизонтальний дрейф зони це
  // лише КАНДИДАТ нарівні зі scale/shift, і приймається за тим самим гістерезисом
  // ZT_ACCEPT_RATIO. Без гістерезису він пояснював СПРАВЖНІ накриття (перевірено: зникали
  // live-covers wellness upper f273-311 і lower f9-48).
  const identity = bandDists(frames, rect, i0, i1, seedDriftPx, 1, 0);
  const idScore = robustScore(identity);
  let best = { dists: identity, s: 1, d: seedDriftPx, score: idScore };
  const DXS = Math.abs(driftXPx) >= 1 ? [0, driftXPx] : [0];
  for (const dx of DXS) for (const s of ZT_SCALES) for (const dd of ZT_SHIFTS) {
    if (s === 1 && dd === 0 && dx === 0) continue;
    const d = seedDriftPx + dd;
    const dists = bandDists(frames, rect, i0, i1, d, s, dx);
    const score = robustScore(dists);
    if (score < best.score) best = { dists, s, d, score };
  }
  // приймаємо не-identity лише зі значною перевагою (інакше S48-поведінка без змін)
  return best.score < idScore * ZT_ACCEPT_RATIO ? best : { dists: identity, s: 1, d: seedDriftPx, score: idScore };
}
function bandStats(dists, TH){
  const known = dists.filter(d => d != null);
  const on = dists.map(d => d != null && d > TH.ztBandDistThr);
  const changedBandsFrac = known.length ? on.filter(Boolean).length / dists.length : 0;
  let fromBottom = 0; for (let i = on.length - 1; i >= 0 && on[i] !== false; i--) if (on[i]) fromBottom++; else break;
  let fromTop = 0; for (let i = 0; i < on.length && on[i] !== false; i++) if (on[i]) fromTop++; else break;
  return { changedBandsFrac, frontBottomFrac: fromBottom / dists.length, frontTopFrac: fromTop / dists.length };
}

// ── SOLID-ФРОНТ (для kind:'media' зон, S48): жива відео-текстура міняє ВСІ бенди —
// band-front тоне в шумі. Але суцільна ПАНЕЛЬ що НАКРИВАЄ відео = ріст «гладких» бендів
// (низька дисперсія рядків) суцільним блоком від краю. Це і є wipe-cover по медіа. ──
function solidBands(frames, rect, i, TH){
  const f = frames[i];
  const { x0, y0, x1, y1 } = rect;
  const bh = (y1 - y0) / N_BANDS;
  const out = [];
  for (let bi = 0; bi < N_BANDS; bi++) {
    const by0 = Math.round(y0 + bi * bh), by1 = Math.round(y0 + (bi + 1) * bh);
    let tv = 0, rows = 0;
    for (let y = by0; y < by1; y++) {
      const row = [];
      for (let x = x0; x < x1; x += 2) row.push(f.data[y * f.w + x]);
      tv += variance(row); rows++;
    }
    out.push(tv / rows < TH.ztSolidBandVar);
  }
  return out;
}
function solidFrontGrowth(frames, rect, f0, f1, TH){
  const a = solidBands(frames, rect, f0, TH), b = solidBands(frames, rect, f1, TH);
  const suffix = (m) => { let n = 0; for (let i = m.length - 1; i >= 0 && m[i]; i--) n++; return n / m.length; };
  const prefix = (m) => { let n = 0; for (let i = 0; i < m.length && m[i]; i++) n++; return n / m.length; };
  const gB = suffix(b) - suffix(a), gT = prefix(b) - prefix(a);
  if (gB >= TH.ztSolidGrowMin && gB > gT) return { grew: true, dir: 'bottom', frontEnd: suffix(b), from: suffix(a) };
  if (gT >= TH.ztSolidGrowMin && gT > gB) return { grew: true, dir: 'top', frontEnd: prefix(b), from: prefix(a) };
  return { grew: false };
}

// прогресія фронту (S48 v2, вивірено на wellness f41-56): фронти на чекпоінтах 25/50/75/100%
// вікна БЕЗ drift-компенсації (cover = «яка частина зони більше не показує свій f0-вміст»).
// Напрямок веде сторона, чий фронт ЛІДИРУЄ ДО НАСИЧЕННЯ (q1+mid): коли заміна завершилась,
// обидва фронти = 1.0 і кінцевий стан напрямку не знає.
// S49 другий шлях доказу (run-based): edge-anchored фронт СЛІПИЙ до enter-and-settle cover
// (картка в полях: транзит лише ПРОХОДИТЬ низ зони, нижні бенди вертаються в крем → фронт
// від краю = 0; вивірено на ivy live f128-169 і нашому свіпі). Тому міряємо НАЙБІЛЬШИЙ
// СУЦІЛЬНИЙ БЛОК змінених бендів: верхній край блоку монотонно повзе ВГОРУ при значно
// стабільнішому нижньому = COVER:bottom (симетрично для :top). Recede-only і crossfade
// блоків з рухомим краєм не мають (краї статичні / нижній тікає) — не фаєрять.
function largestRun(dists, TH){
  const on = dists.map(d => d != null && d > TH.ztBandDistThr);
  for (let i = 1; i < on.length - 1; i++) if (!on[i] && on[i - 1] && on[i + 1]) on[i] = true; // міст 1-бендових дірок
  let best = null, s = -1;
  for (let i = 0; i <= on.length; i++) {
    if (i < on.length && on[i]) { if (s < 0) s = i; }
    else if (s >= 0) { if (!best || i - s > best.len) best = { top: s, bot: i - 1, len: i - s }; s = -1; }
  }
  return best;                                           // null = тихо
}
function frontProgressive(frames, rect, f0, f1, _driftMid, _driftEnd, TH){
  if (f1 - f0 < 3) return { progressive: false, dir: null };
  const cps = [0.25, 0.5, 0.75, 1].map(q => Math.max(f0 + 1, Math.round(f0 + (f1 - f0) * q)));
  // S49: scale-aware компенсація recede старого шару (bestBandDists) перед фронтом —
  // паралельний cover (стара масштабується вгору + нова наповзає знизу) читається фронтом
  // знизу, а не «top-бенди змінились». seed-зсув 0 (cover = «не показує свій f0-вміст»).
  const bd = cps.map(fc => bestBandDists(frames, rect, f0, fc, 0).dists);
  const st = bd.map(d => bandStats(d, TH));
  const lead = (side) => st[0][side] + st[1][side];                    // до насичення
  const leadB = lead('frontBottomFrac'), leadT = lead('frontTopFrac');
  const endB = st[3].frontBottomFrac, endT = st[3].frontTopFrac;
  const mono = (side) => st.every((s, i) => i === 0 || s[side] >= st[i - 1][side] - 0.05);
  if (leadB > leadT + 0.1 && st[1].frontBottomFrac >= 0.12 && endB >= 0.25 && mono('frontBottomFrac'))
    return { progressive: true, dir: 'bottom', mid: +st[1].frontBottomFrac.toFixed(2), end: +endB.toFixed(2) };
  if (leadT > leadB + 0.1 && st[1].frontTopFrac >= 0.12 && endT >= 0.25 && mono('frontTopFrac'))
    return { progressive: true, dir: 'top', mid: +st[1].frontTopFrac.toFixed(2), end: +endT.toFixed(2) };
  // run-based (S49): беремо чекпоінти з блоком ≥2 бендів; фінальний блок ≥ ztCoverBandsFrac
  const runs = bd.map(d => largestRun(d, TH)).map((r, i) => ({ r, i })).filter(x => x.r && x.r.len >= 2);
  const N = bd[0].length;
  if (runs.length >= 2) {
    const fin = runs[runs.length - 1].r;
    if (fin.len / N >= TH.ztCoverBandsFrac) {
      const tops = runs.map(x => x.r.top), bots = runs.map(x => x.r.bot);
      const monoTopUp = tops.every((t, i) => i === 0 || t <= tops[i - 1] + 1);
      const monoBotDown = bots.every((b, i) => i === 0 || b >= bots[i - 1] - 1);
      const topRise = tops[0] - tops[tops.length - 1];   // >0 = верхній край блоку йде вгору
      const botDrop = bots[bots.length - 1] - bots[0];   // >0 = нижній край блоку йде вниз
      if (monoTopUp && topRise >= 3 && topRise >= (bots[0] - bots[bots.length - 1]) + 2)
        return { progressive: true, dir: 'bottom', mid: +((runs[Math.floor(runs.length / 2)].r.len) / N).toFixed(2), end: +(fin.len / N).toFixed(2), runBased: true };
      if (monoBotDown && botDrop >= 3 && botDrop >= (tops[tops.length - 1] - tops[0]) + 2)
        return { progressive: true, dir: 'top', mid: +((runs[Math.floor(runs.length / 2)].r.len) / N).toFixed(2), end: +(fin.len / N).toFixed(2), runBased: true };
    }
  }
  return { progressive: false, dir: null };
}

// ── INK-ПОДІЇ по всій серії (S48 фікс: повільний title-крос-фейд не долазить до
// віконного порогу руху — SWAP детектиться АНАЛІТИЧНО по ink(t), як ручний
// прототип ivy 19→4→27). HIGH→LOW→HIGH = SWAPS-CONTENT; 0→HIGH = ENTERS;
// HIGH→0-і-лишилось = EXITS/FADES. Вимога: зона позиційно стоїть у цей час. ──
export function inkEvents(track, zoneId, TH){
  const z = track.zones[zoneId];
  const smooth = z.ink.map((v, i) => {
    const s = z.ink.slice(Math.max(0, i - 1), i + 2);
    return s.sort((a, b) => a - b)[Math.floor(s.length / 2)];               // 3-медіана
  });
  const events = [];
  const HIGH = (v) => v >= TH.ztMinInkRows;
  let state = HIGH(smooth[0]) ? 'high' : 'low';
  let lastHighEnd = state === 'high' ? 0 : -1, lastHighVal = smooth[0];
  for (let i = 1; i < smooth.length; i++) {
    if (state === 'high') {
      // провал ВІДНОСНИЙ до попереднього high (S48: crossfade-перекриття не падає до 0 —
      // ivy swap №3 провалюється лише до 7 при high 20)
      if (smooth[i] <= Math.max(TH.ztMinInkRows - 1, lastHighVal * TH.ztInkDipRatio)) { state = 'low'; lastHighEnd = i - 1; }
      else if (HIGH(smooth[i])) lastHighVal = Math.max(lastHighVal * 0.9, smooth[i]);
    } else if (HIGH(smooth[i]) && smooth[i] >= lastHighVal * 0.5) {
      // recovery 0.5×high, НЕ 0.7: наступний заголовок може бути коротшим (ivy: 3 рядки → 2)
      const f0 = Math.max(0, lastHighEnd), f1 = i;
      const driftPct = (z.cum[f1] - z.cum[Math.max(f0, 0)]) / track.contentHPx * 100;
      events.push({ zone: zoneId, f0, f1,
        verdict: lastHighEnd >= 0 ? 'SWAPS-CONTENT' : 'ENTERS',
        numbers: { ink: [z.ink[f0], Math.min(...z.ink.slice(f0, f1 + 1)), z.ink[f1]], driftPct: +driftPct.toFixed(1) },
        posStable: Math.abs(driftPct) < TH.ztStandsEpsPct });
      state = 'high'; lastHighVal = smooth[i];
    }
  }
  if (state === 'low' && lastHighEnd >= 0)
    events.push({ zone: zoneId, f0: lastHighEnd, f1: smooth.length - 1, verdict: 'EXITS',
      numbers: { ink: [z.ink[lastHighEnd], 0, z.ink[smooth.length - 1]] }, posStable: true });
  return events;
}

// ── COVER-НАКОПИЧУВАЧ (S48, вивірено на promenade f110-155): повільний шов, розрізаний
// паузами руки на КІЛЬКА вікон, у кожному фрагменті окремо фронтом не читається (нова
// смуга — в середині зони, не від краю). Міряємо фронт ВІДНОСНО ЯКОРЯ через вікна:
// росте монотонно ≥2 спостереження → COVERED-BY. TRAVELS-вікно (вміст поїхав) скидає якір.
// Стрибок 0→насичення за 1 крок = CUT, не фронт (це MEDIA — судять інші виміри). ──────
// v2 (S48): ПОКАДРОВА сітка чекпоінтів замість вікон — наш p-свіп суцільний (одне гігантське
// вікно, cover тонув у TRAVELS), а live фрагментований паузами руки. Один механізм для ОБОХ
// боків = симетрія екстракції (structure-parity порівнює яблука з яблуками).
// S51 ДВІ БРАМИ на виході накопичувача (обидві виведені числом на 5 атомах × 2 боки —
// таблиця в CHOREO amenities-parking «S51 РЕДИЗАЙН НАКОПИЧУВАЧА»):
//  Б) «cover ЗАМІТАЄ, а не сидить»: фронт мусить ВИРОСТИ на ≥ztCoverBandsFrac від значення
//     на відкритті. Артефакт page-locked ПОТОКУ рядків крізь прямокутник зони (live parking
//     panel f122-140: рядки жорсткого блока їдуть угору — перевірено оком) відкривався на 0.08
//     і замерзав рівно на підлозі 0.25 (пауза руки, 5 чекпоінтів) = growth 0.17; справжні
//     covers мають growth 0.37-0.92. Нового порога НЕ треба (той самий ztCoverBandsFrac).
//  T) «ТРАНСЛЯЦІЯ пояснює зону» (S51-c, вердикт Єгора «давай Б»): якщо НАЙКРАЩА ЧИСТА
//     ТРАНСЛЯЦІЯ пояснює обидва кінці як ТОЙ САМИЙ вміст (dTrans < ztGridLow), то вміст просто
//     ПРОЇХАВ крізь прямокутник зони, а накриття означає новий вміст, якого трансляція НЕ
//     пояснює. Ловить live parking panel f32-48 (dTrans 11.8: у прямокутнику фото + nameplate,
//     що їде крізь нього; крем-панель ще під низом — перевірено оком на кадрах body f30-50).
//     Розділення на всіх фікстурах: артефакти 0.9 і 11.8 проти справжніх covers 12.7 / 22.6 /
//     23.7 / 29.7 / 34.1 / 38.3 / 39.8 / 44.6 / 45.9. Нового порога НЕ треба (той самий ztGridLow).
//     ⚠️ Варіант «детектор на КОНТЕНТ-БОКСІ» (буква Б з борда) ВБИТО числом: на спані C1
//     контент-бокс дає dScale 16.3 / зиск ×2.22 (у боксі мішанина зумованого фото + плейта,
//     гомотетія не сходиться) — не ловить; а сусідні чекпоінти дають лише 3 з 78 пар (крок
//     зума ~0.95 не встигає побити трансляцію). Тому Б реалізовано ЦИМ дискримінатором.
//  Z) SCALE-MOTION у БУДЬ-ЯКІЙ зоні (S52, мікро-борд: вердикт Єгора «зняти media-обмеження»):
//     якщо гомотетія пояснює зону як ТОЙ САМИЙ вміст — це не накриття. Наш parking-свіп читав
//     зум-розширення фронтом (dScale 6.5, ×5.32) → хибний C у photo-зоні.
//     ІСТОРІЯ ОБМЕЖЕННЯ: у S51 брама діяла лише в kind:'media' (вердикт Єгора S50 — зум як
//     MEDIA-внутрішній рух). Передумова того вердикта (тримати parking-клас stack+cover) сама
//     виявилась артефактом і скасована в S51-c (клас З LIVE = strip). Обмеження лишало закон
//     ПІВСИМЕТРИЧНИМ: T діяла всюди, Z лише в media — і той самий фізичний зум крізь ТЕКСТОВИЙ
//     прямокутник судився по-різному на двох боках. Наш parking panel s2-s7: dScale 3.5 /
//     dTrans 29.1 / зиск ×8.37 (зум глибший за крок → T мовчить), проти live panel f32-48:
//     dScale 10.0 / dTrans 11.8 / ×1.17 (T ловить). Оком на кропах зони з обох боків: фото
//     зумиться-аут + nameplate їде крізь прямокутник, крем-панелі ще нема.
//     БЕЗПЕКА (10 накопичених кандидатів, 5 атомів × 2 боки): справжні covers мають
//     dScale 12.7-34.5 ПРИ зиску ×1.00-×2.73 — жоден не має обох умов; єдиний кандидат з
//     dScale<ztGridLow І зиском ≥ztZoomGainMin це наш parking panel. Пласке накриття не має
//     переваги масштабу над трансляцією (зиск ≈×1.00, як наш promenade), тому Z його не бере.
//     Ratchet: ZT-FIX-zoom-through-text (0 подій) + ZT-FIX-flat-cover-over-text (рівно 1) —
//     рівень coverEvents у зоні kind:'text' (наявні zoom-фікстури смикають isScaleMotion
//     НАПРЯМУ і kind-гейт не перевіряли взагалі).
export function coverEvents(frames, track, TH){
  const events = [];
  const n = frames.length;
  const step = Math.max(1, Math.round(n / 96));
  const DBG = !!process.env.ZT_DEBUG;
  for (const [id, z] of Object.entries(track.zones)) {
    const zoneH = z.rect.y1 - z.rect.y0;
    let anchor = 0, open = null, side = null, last = 0, obs = 0, openF = 0;
    const close = (atF) => {
      if (open != null && obs >= 3 && last >= TH.ztCoverBandsFrac) {
        const growth = last - openF;
        const zf = isScaleMotion(frames, z.rect, open, atF, TH);   // несе і dTrans, і scaleMotion
        const drop = growth < TH.ztCoverBandsFrac ? 'B:фронт СИДИТЬ (не замітає)'
          : zf.dTrans < TH.ztGridLow ? 'T:ТРАНСЛЯЦІЯ пояснює зону (потік крізь прямокутник, не накриття)'
          : zf.scaleMotion ? 'Z:SCALE-MOTION (гомотетія пояснює зону, не накриття)' : null;
        if (DBG) console.log(`  zt▸ ACC-C ${id}(${z.kind}) f${open}-${atF} dir=${side} `
          + `front ${openF.toFixed(2)}→${last.toFixed(2)} growth=${growth.toFixed(2)} obs=${obs}`
          + (zf ? ` zoom{k=${zf.kBest} dScale=${zf.dScale} dTrans=${zf.dTrans} gain×${zf.gainRatio}}` : '')
          + (drop ? `  ПРИДУШЕНО → ${drop}` : '  ← подія'));
        if (!drop) events.push({ zone: id, f0: open, f1: atF,
          verdict: 'COVERED-BY', dir: side, frontEnd: +last.toFixed(2),
          numbers: { front: side, frontEnd: +last.toFixed(2), frontStart: +openF.toFixed(2),
            growth: +growth.toFixed(2), accumulated: true,
            ...(zf ? { zoomK: zf.kBest, zoomDScale: zf.dScale, zoomGain: zf.gainRatio } : {}) } });
      }
      open = null; side = null; last = 0; obs = 0; openF = 0;
    };
    for (let cp = step; cp < n; cp += step) {
      const driftPx = z.cum[cp] - z.cum[anchor];
      if (Math.abs(driftPx) > zoneH * 0.5) { close(cp); anchor = cp; continue; }  // компенсація за межами
      // S49: scale-aware (bestBandDists) — recede старого шару не мінтить хибний top-фронт
      const rawDX = (z.cumX ? z.cumX[cp] - z.cumX[anchor] : 0);
      const driftXPx = Math.abs(rawDX) >= (z.rect.x1 - z.rect.x0) * TH.ztPanMinFrac ? rawDX : 0;
      const s = bandStats(bestBandDists(frames, z.rect, anchor, cp, driftPx, driftXPx).dists, TH);
      const cand = s.frontBottomFrac >= s.frontTopFrac ? 'bottom' : 'top';
      const f = cand === 'bottom' ? s.frontBottomFrac : s.frontTopFrac;
      if (open == null) {
        // старт: фронт з'явився поступово; стрибок одразу в насичення = cut/шум → новий якір
        if (f > 0.08 && f < 0.85) { open = Math.max(0, cp - step); side = cand; last = f; obs = 1; openF = f; }
        else if (f >= 0.85) { anchor = cp; }
      } else if (cand === side && f > last + 0.03) {
        last = f; obs++;
        if (f >= 0.95) { close(cp); anchor = cp; }
      } else if (f < last - 0.2) { close(cp); anchor = cp; }
    }
    close(n - 1);
  }
  return events;
}

// ── вердикти: зона × ЇЇ вікно → закритий словник + числа ─────────────────────
// zoneWindows = {zoneId:[{f0,f1}]} (per-зона, S48 фікс). Порядок правил вивірений
// покадрово на ivy-live: TRAVELS(власний трек) → TRAVELS(page-locked, seam) →
// SWAP(ink-провал) → ENTERS/EXITS → STANDS(grid-тотожність) → COVERED-BY(фронт) →
// SWAP(grid) → STANDS(дрібниця) → UNKNOWN(fail-closed).
export function verdictsForWindows(frames, track, zoneWindows, TH){
  const out = [];
  for (const [id, z] of Object.entries(track.zones)) {
    for (const w of (zoneWindows[id] || [])) {
      const pageShiftPx = track.global.cum[w.f1] - track.global.cum[w.f0];
      const pagePct = pageShiftPx / track.contentHPx * 100;
      const driftPx = z.cum[w.f1] - z.cum[w.f0];
      const driftPct = driftPx / track.contentHPx * 100;
      const mid = Math.floor((w.f0 + w.f1) / 2);
      const driftMidPx = z.cum[mid] - z.cum[w.f0];
      const confMin = Math.min(...z.conf.slice(Math.max(w.f0, 1), w.f1 + 1));
      const texA = z.texVar[w.f0], texZ = z.texVar[w.f1];
      const cs = changedStats(frames, z.rect, w.f0, w.f1, TH);
      // S49: scale-aware — вікно де стара картка ЛИШЕ recede-ить (без нової) читається
      // тихим (STANDS у EVENT-домені, як live: повільний дрейф не мінтить подій)
      const rawDX = (z.cumX ? z.cumX[w.f1] - z.cumX[w.f0] : 0);
      const driftXPx = Math.abs(rawDX) >= (z.rect.x1 - z.rect.x0) * TH.ztPanMinFrac ? rawDX : 0;
      const bb = bestBandDists(frames, z.rect, w.f0, w.f1, driftPx, driftXPx);
      const bs = bandStats(bb.dists, TH);
      const gd = gridDist(z.grid[w.f0], z.grid[w.f1]);
      const inkA = z.ink[w.f0], inkZ = z.ink[w.f1];
      const inkMin = Math.min(...z.ink.slice(w.f0, w.f1 + 1));
      const fp = frontProgressive(frames, z.rect, w.f0, w.f1, driftMidPx, driftPx, TH);
      const pl = pageLockedCheck(frames, z.rect, w.f0, w.f1, pageShiftPx);
      const numbers = { driftPct: +driftPct.toFixed(1), pagePct: +pagePct.toFixed(1), confMin: +confMin.toFixed(2),
        changedFrac: +cs.changedFrac.toFixed(2), bandsFrac: +bs.changedBandsFrac.toFixed(2),
        gridDist: +gd.toFixed(1), ink: [inkA, inkMin, inkZ],
        texVar: [Math.round(texA), Math.round(texZ)], front: fp.progressive ? fp.dir : null,
        oldLayerT: bb.s !== 1 ? { s: bb.s, dPx: bb.d } : null,   // S49: обрана трансформа старого шару
        pageLocked: pl ? +pl.dShift.toFixed(1) + '<' + +pl.dPlace.toFixed(1) : null };
      const row = { zone: id, f0: w.f0, f1: w.f1, numbers };
      const emptyStart = texA < TH.ztEmptyTexVar, emptyEnd = texZ < TH.ztEmptyTexVar;
      const inkDip = inkA >= TH.ztMinInkRows && inkZ >= TH.ztMinInkRows
        && inkMin <= Math.min(inkA, inkZ) * TH.ztInkDipRatio;

      const isMedia = z.kind === 'media';
      const sf = isMedia ? solidFrontGrowth(frames, z.rect, w.f0, w.f1, TH) : { grew: false };

      if (Math.abs(driftPct) >= TH.ztStandsEpsPct && confMin >= TH.ztMinCorrPeak) {
        row.verdict = 'TRAVELS'; row.dir = driftPct < 0 ? 'up' : 'down'; row.movePct = +Math.abs(driftPct).toFixed(1);
      } else if (pl?.locked && Math.abs(pagePct) >= TH.ztStandsEpsPct) {
        row.verdict = 'TRAVELS'; row.dir = pageShiftPx < 0 ? 'up' : 'down';
        row.movePct = +Math.abs(pagePct).toFixed(1); row.pageLocked = true;
      } else if (z.kind === 'text' && Math.abs(driftPct) < TH.ztStandsEpsPct && inkDip) {
        row.verdict = 'SWAPS-CONTENT';                   // текст пішов і прийшов новий (19→4→27)
      } else if (emptyStart && !emptyEnd) {
        row.verdict = 'ENTERS'; if (fp.dir) row.dir = fp.dir;
      } else if (!emptyStart && emptyEnd) {
        row.verdict = bs.changedBandsFrac >= TH.ztChangedLow && !fp.progressive ? 'FADES' : 'EXITS';
      } else if (fp.progressive && bs.changedBandsFrac >= TH.ztCoverBandsFrac) {
        // band-front ПЕРШИЙ (структурний, wellness wipe f41-56 = :bottom); solid-front лише
        // фолбек нижче — його «суцільність» плутають темні зони фото (хибний :top)
        row.verdict = 'COVERED-BY'; row.dir = fp.dir; row.frontEnd = +(fp.end ?? 0).toFixed(2);
      } else if (sf.grew) {                              // media: суцільна панель насувається по відео-шуму
        row.verdict = 'COVERED-BY'; row.dir = sf.dir; row.frontEnd = +sf.frontEnd.toFixed(2); row.solidFront = true;
      } else if (isMedia && bs.changedBandsFrac >= TH.ztCoverBandsFrac) {
        row.verdict = 'MEDIA';                           // внутрішній рух медіа без структурного фронту
      } else if (bs.changedBandsFrac < TH.ztChangedLow && Math.abs(driftPct) < TH.ztStandsEpsPct) {
        row.verdict = 'STANDS';                          // drift-компенсовані бенди тихі = стоїть
      } else if (z.kind !== 'media' && gd >= TH.ztGridSwap && !fp.progressive && Math.abs(driftPct) < TH.ztStandsEpsPct
                 && bs.changedBandsFrac >= TH.ztCoverBandsFrac) {
        row.verdict = 'SWAPS-CONTENT';
      } else if (gd < TH.ztGridSwap && !fp.progressive && Math.abs(driftPct) < TH.ztStandsEpsPct) {
        row.verdict = 'STANDS';                          // відбиток той самий, фронту нема = дифузний джитер
      } else if (bs.changedBandsFrac < TH.ztCoverBandsFrac) {
        row.verdict = 'STANDS';                          // локальна дрібниця (label/AA), не структурна подія
      } else {
        row.verdict = 'UNKNOWN';
        row.reason = `сигнали суперечать: drift=${driftPct.toFixed(1)}% conf=${confMin.toFixed(2)} bands=${bs.changedBandsFrac.toFixed(2)} grid=${gd.toFixed(1)} front=${fp.dir} ink=${inkA}→${inkMin}→${inkZ}`;
      }
      out.push(row);
    }
  }

  // ink-події (аналітичні, поза вікнами руху) — ЛИШЕ для kind:'text' зон (у фото/медіа
  // ink-рядки = текстура, серія не несе swap-семантики). Зливаємо: ink-SWAP при стабільній
  // позиції перекриває свої STANDS/SWAPS-фрагменти вікон; при русі travel-вердикт головніший
  for (const id of Object.keys(track.zones)) {
    if (track.zones[id].kind !== 'text') continue;
    for (const ev of inkEvents(track, id, TH)) {
      if (!ev.posStable) continue;
      const overlap = out.filter(v => v.zone === id && v.f0 <= ev.f1 && v.f1 >= ev.f0);
      if (overlap.some(v => v.verdict === 'TRAVELS' || v.verdict === 'COVERED-BY')) continue;
      for (const v of overlap) if (v.verdict === 'STANDS' || v.verdict === 'SWAPS-CONTENT') v.drop = true;
      out.push({ zone: id, f0: ev.f0, f1: ev.f1, verdict: ev.verdict, numbers: ev.numbers, inkEvent: true });
    }
  }
  // cover-накопичувач: повільні шви через кілька вікон (promenade f110-155). Віконний
  // COVERED головніший (точніші межі) — накопичувальний додається лише там де вікна промовчали
  for (const ev of coverEvents(frames, track, TH)) {
    const overlap = out.filter(v => v.zone === ev.zone && !v.drop && v.f0 <= ev.f1 && v.f1 >= ev.f0);
    if (overlap.some(v => v.verdict === 'COVERED-BY')) continue;
    for (const v of overlap) if (v.verdict === 'MEDIA' || v.verdict === 'STANDS') v.drop = true;
    out.push(ev);
  }

  const res = out.filter(v => !v.drop);
  res.sort((a, b) => a.f0 - b.f0 || a.zone.localeCompare(b.zone));

  // ── ENTER-CONTINUATION merge (S49-b, доведено ГУСТИМ виміром ivy 324 кадри):
  // пауза руки ПОСЕРЕД в'їзду нової картки розрізає ОДИН фізичний хід на COVERED-BY +
  // TRAVELS тим самим напрямком руху вмісту (ivy: f128-169 cover → пауза f170-178 →
  // f180-190 «докрутка» = playground 62.8%→42.7% ДОЇЖДЖАЄ свій в'їзд; те саме f254-263
  // для yoga). Це НЕ окремий лифт стосу — зливаємо у ОДИН cover. Розрив ≤ 24 кадри
  // (2с паузи руки @12fps); на нашому суцільному свіпі пар C+T не виникає (no-op).
  const CONT_DIR = { bottom: 'up', top: 'down' };
  for (const zid of new Set(res.map(v => v.zone))) {
    const zv = res.filter(v => v.zone === zid);
    for (let i = 0; i < zv.length - 1; i++) {
      const c = zv[i];
      while (c.verdict === 'COVERED-BY') {
        const t = zv[i + 1];
        if (!(t && t.verdict === 'TRAVELS' && CONT_DIR[c.dir] === t.dir && t.f0 - c.f1 <= 24)) break;
        c.f1 = t.f1; c.enterMerged = (c.enterMerged || 0) + 1; t.drop = true;
        zv.splice(i + 1, 1);
      }
    }
  }
  return res.filter(v => !v.drop);
}

// ── EVENT-домен: токени/лічильники/клас ──────────────────────────────────────
// токен вікна: verdict[:dir] ; STANDS-вікна стискаються (не подія). Порядок = порядок вікон.
export function tokens(verdicts){
  const perZone = {};
  for (const v of verdicts) (perZone[v.zone] ??= []).push(v);
  const seq = {};
  const counters = {};
  for (const [id, vs] of Object.entries(perZone)) {
    // STANDS = не подія; MEDIA = внутрішній рух медіа (структурно нейтральний, судять
    // media-type/surface-parity) — обидва виключаються з EVENT-послідовності
    const ev = vs.filter(v => v.verdict !== 'STANDS' && v.verdict !== 'MEDIA');
    const toks = [];
    for (const v of ev) {
      // ПАРИТЕТ-токен: напрямок ТІЛЬКИ для TRAVELS (структурний вектор руху). Напрямок
      // COVERED/ENTERS у паритеті НЕ порівнюється — композитні вікна (travel+wipe разом)
      // дають лотерею top/bottom; напрямок задекларованих wipe-ів судить калібрований
      // motion-direction. У вердиктах (для CHOREO-CLAIMS) напрямок лишається.
      const t = v.verdict === 'TRAVELS' ? `TRAVELS:${v.dir}` : v.verdict;
      const prev = toks[toks.length - 1];
      // ЗАКОН S48: безперервно-фронтові події (TRAVELS, COVERED-BY) колапсуються між
      // СУСІДАМИ (паузи руки/докрутки фрагментують їх недетерміновано на live-боці);
      // дискретні контент-події (SWAPS/ENTERS/EXITS/FADES) стабільні — рахуються ТОЧНО.
      if (prev && t === prev.t && (t.startsWith('TRAVELS') || t === 'COVERED-BY')) continue;
      toks.push({ t });
    }
    seq[id] = toks.map(x => x.t);
    counters[id] = {};
    for (const t of seq[id]) counters[id][t.split(':')[0]] = (counters[id][t.split(':')[0]] || 0) + 1;
  }
  return { seq, counters };
}

// клас механіки З LIVE (закритий реєстр; config може лише ДОДАВАТИ детектори)
export function classifyMechanic(verdicts, track, TH){
  const all = verdicts.filter(v => v.verdict !== 'UNKNOWN' && v.verdict !== 'MEDIA');
  const zones = [...new Set(verdicts.map(v => v.zone))];
  const has = (pred) => all.some(pred);
  const evidence = [];
  const pageMoves = track ? Math.abs(track.global.cum[track.global.cum.length - 1]) / track.contentHPx * 100 : null;

  if (verdicts.some(v => v.verdict === 'UNKNOWN')) return { class: 'OTHER', evidence: ['є UNKNOWN-зони — клас невизначений (fail-closed)'] };

  const swaps = has(v => v.verdict === 'SWAPS-CONTENT');
  const covers = has(v => v.verdict === 'COVERED-BY') || has(v => v.verdict === 'ENTERS' && v.dir);
  const bigTravel = all.filter(v => v.verdict === 'TRAVELS' && v.movePct >= TH.ztTravelBigPct);
  const allTravel = zones.length > 0 && zones.every(id => all.some(v => v.zone === id && v.verdict === 'TRAVELS'));
  const fades = has(v => v.verdict === 'FADES');

  if (swaps && (covers || pageMoves < TH.ztStandsEpsPct)) {
    evidence.push('текст-зона SWAPS на місці' + (covers ? ' + картки COVER/ENTER' : '') + `; page-зсув ${pageMoves?.toFixed(1)}%`);
    return { class: 'pin+swap', evidence };
  }
  if (covers && !swaps) { evidence.push('зона COVERED-BY/ENTERS без swap-тексту'); return { class: 'stack+cover', evidence }; }
  if (allTravel && bigTravel.length) { evidence.push('усі зони TRAVELS разом'); return { class: 'strip', evidence }; }
  if (fades && !bigTravel.length) { evidence.push('FADES без великого travel'); return { class: 'fade', evidence }; }
  if (!bigTravel.length && all.some(v => v.verdict === 'TRAVELS')) {
    evidence.push(`малий drift ≤${TH.ztTravelBigPct}% (parallax-подих) без swap/cover`);
    return { class: 'parallax-hero', evidence };
  }
  if (!all.length || all.every(v => v.verdict === 'STANDS')) { evidence.push('нуль подій — статичний hold'); return { class: 'parallax-hero', evidence }; }
  return { class: 'OTHER', evidence: ['патерн не з реєстру: ' + JSON.stringify(tokens(verdicts).seq)] };
}

// ── diff в EVENT-домені (structure-parity): live-токени ↔ наші токени ────────
export function diffTokens(live, ours){
  const diffs = [];
  const zones = new Set([...Object.keys(live.seq), ...Object.keys(ours.seq)]);
  for (const z of zones) {
    const a = live.seq[z] || [], b = ours.seq[z] || [];
    if (a.join('|') !== b.join('|')) diffs.push({ zone: z, live: a, ours: b, kind: 'sequence' });
    const ca = live.counters[z] || {}, cb = ours.counters[z] || {};
    for (const k of new Set([...Object.keys(ca), ...Object.keys(cb)])) {
      if (k === 'STANDS') continue;
      if ((ca[k] || 0) !== (cb[k] || 0)) diffs.push({ zone: z, kind: 'counter', token: k, live: ca[k] || 0, ours: cb[k] || 0 });
    }
  }
  return { same: diffs.length === 0, diffs };
}
