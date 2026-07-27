/*
  zoom-fixtures.mjs — СИНТЕТИЧНИЙ ratchet брами Z (S51, закон B23: новий вимір → свій інжектор).

  Брама Z (`isScaleMotion` у lib/zonetrack.mjs) відрізняє ЗУМ (гомотетія = MEDIA-внутрішній рух)
  від НАКРИТТЯ. Без неї наш parking-свіп мінтив хибний COVERED-BY у photo-зоні (structure-parity
  4 діфи, S50). Цей ratchet не потребує ні відео, ні браузера: два синтетичні кадри-пари з
  ВІДОМОЮ відповіддю. Якщо хтось прибере/послабить браму (або зламає обидва напрямки гомотетії —
  при зумі-АУТ прообраз зони БІЛЬШИЙ за кадр), ці кейси впадуть ще до будь-якого атома.

  Детермінований LCG — без Math.random, щоб фікстура була відтворюваною назавжди.
*/
const W = 234, H = 500;
const lcg = (seed) => () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

// текстура зі СТРУКТУРОЮ (плями + смуги) — має відрізнятися на масштабі 12×12 БЛОКІВ,
// інакше блокові середні збігаються і фікстура-накриття вироджується (gridDist ~1).
function pattern(seed, { bias = 0, scale = 1 } = {}){
  const rnd = lcg(seed);
  const blobs = Array.from({ length: 24 }, () => ({ x: rnd() * W, y: rnd() * H, r: (12 + rnd() * 40) * scale, a: 60 + rnd() * 140 }));
  const f = { w: W, h: H, data: new Uint8Array(W * H) };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let v = 128 + bias + 40 * Math.sin(x / (17 * scale) + seed) + 30 * Math.sin(y / (23 * scale) - seed);
    for (const b of blobs) {
      const d = Math.hypot(x - b.x, y - b.y);
      if (d < b.r) v += (b.a - 128) * (1 - d / b.r);
    }
    f.data[y * W + x] = Math.max(0, Math.min(255, Math.round(v)));
  }
  return f;
}
// білінійна вибірка (для гомотетії)
const at = (f, x, y) => {
  const xi = Math.max(0, Math.min(f.w - 2, Math.floor(x))), yi = Math.max(0, Math.min(f.h - 2, Math.floor(y)));
  const tx = x - xi, ty = y - yi;
  const p = (a, b) => f.data[b * f.w + a];
  return p(xi, yi) * (1 - tx) * (1 - ty) + p(xi + 1, yi) * tx * (1 - ty) + p(xi, yi + 1) * (1 - tx) * ty + p(xi + 1, yi + 1) * tx * ty;
};

// ЗУМ-АУТ: B = A, масштабований на k про центр (cx,cy) — вміст ЗМЕНШУЄТЬСЯ (як parking k≈0.39)
function zoomed(a, k, cx, cy){
  const f = { w: W, h: H, data: new Uint8Array(W * H) };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++)
    f.data[y * W + x] = Math.round(at(a, cx + (x - cx) / k, cy + (y - cy) / k));
  return f;
}
// НАКРИТТЯ знизу: нижні `frac` кадру = ІНШИЙ вміст, верх недоторканий
function covered(a, other, frac){
  const f = { w: W, h: H, data: Uint8Array.from(a.data) };
  const y0 = Math.round(H * (1 - frac));
  for (let y = y0; y < H; y++) for (let x = 0; x < W; x++) f.data[y * W + x] = other.data[y * W + x];
  return f;
}

// зона = типова media-зона атома (фото зверху кадру)
export const ZOOM_RECT = { x0: 12, y0: 30, x1: 222, y1: 225 };

export function zoomFixtures(){
  // B помітно ІНШИЙ на масштабі блоків (яскравіший + більші структури) = справжній новий вміст
  const A = pattern(3), B = pattern(91, { bias: 45, scale: 2.2 });
  return [
    { name: 'ZOOM-FIX-scale-out-k0.40', frames: [A, zoomed(A, 0.40, 37, 150)], mustBeScale: true,
      note: 'гомотетія k=0.40 про (37,150) = зум-аут як parking (прообраз БІЛЬШИЙ за кадр — ловить лише двонапрямний фіт)' },
    { name: 'ZOOM-FIX-scale-in-k1.9', frames: [A, zoomed(A, 1.9, 120, 260)], mustBeScale: true,
      note: 'гомотетія k=1.9 = зум-ін (другий напрямок фіту)' },
    { name: 'ZOOM-FIX-cover-bottom-60', frames: [A, covered(A, B, 0.6)], mustBeScale: false,
      note: 'НАКРИТТЯ знизу 60% іншим вмістом — жодна гомотетія не пояснює (брама Z НЕ сміє гасити)' },
    { name: 'ZOOM-FIX-translate-40px', frames: [A, (() => { const f = { w: W, h: H, data: new Uint8Array(W * H) }; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) f.data[y * W + x] = Math.round(at(A, x, y + 40)); return f; })()], mustBeScale: false,
      note: 'ЧИСТА ТРАНСЛЯЦІЯ 40px — той самий вміст, але БЕЗ масштабу (parking live panel C1: dScale 10.1 та ×1.17 → лишається подією)' },
  ];
}

/* ── S52: ratchet брами Z на рівні coverEvents у ТЕКСТОВІЙ зоні ────────────────
   Дірка, яку закривають ці два кейси: фікстури вище смикають isScaleMotion НАПРЯМУ,
   тому kind-гейт у coverEvents вони не перевіряли взагалі; а в 5 атомах немає жодного
   СПРАВЖНЬОГО накриття в text-зоні, тобто «Z безпечна поза media» живими даними не
   доводиться. Обидва кейси йдуть повним шляхом extractTrack → coverEvents.

   Кожен кейс несе САМОПЕРЕВІРКУ від вироджености (`aliveWithoutZ`): той самий вхід
   проганяється з вимкненою брамою Z (ztZoomGainMin = 1e9). Якщо і тоді подій нуль,
   фікстура нічого не доводить і мусить впасти. Без цього «0 подій» проходило б навіть
   на кадрах, де фронт узагалі не росте.                                            */
const COVER_ZONES = { cuts: { topPct: 0, botPct: 0 },
  zones: [{ id: 'txt', rectPct: [5, 52, 95, 84], kind: 'text' }] };   // прямокутник як parking panel

export const COVER_DECL = COVER_ZONES;

export function coverGateFixtures(){
  const N = 64;
  const A = pattern(3);
  // (1) ЗУМ-АУТ крізь ТЕКСТОВУ зону: вміст зменшується з ×2.65 до ×1.0 про origin
  //     біля лівого-верхнього кута (як parking origin 2%/20%). Накриття НЕМАЄ.
  const zoomThrough = Array.from({ length: N }, (_, i) =>
    zoomed(A, 2.65 + (1.0 - 2.65) * (i / (N - 1)), 0.02 * W, 0.20 * H));
  // (2) ПЛАСКЕ НАКРИТТЯ знизу вгору по тій самій текстовій зоні: крем-смуга (люма 230,
  //     як bgRGB 244/229/202) насувається на СТАТИЧНИЙ текстурований фон. Жодна
  //     гомотетія старого вмісту цього не пояснює, зиск масштабу ≈×1 → Z не сміє гасити.
  const flatCover = Array.from({ length: N }, (_, i) => {
    const f = { w: W, h: H, data: Uint8Array.from(A.data) };
    const bandTop = Math.round(H - (H * 0.55) * (i / (N - 1)));       // 0% → 55% висоти кадру
    for (let y = bandTop; y < H; y++) for (let x = 0; x < W; x++) f.data[y * W + x] = 230;
    return f;
  });
  return [
    { name: 'ZT-FIX-zoom-through-text', frames: zoomThrough, mustCover: 0,
      note: 'зум крізь ТЕКСТОВУ зону = не накриття (наш parking panel s2-s7: dScale 3.5 / зиск ×8.37). Брама Z мусить діяти поза kind:media' },
    { name: 'ZT-FIX-flat-cover-over-text', frames: flatCover, mustCover: 1,
      note: 'ПЛАСКА крем-смуга насувається на текстову зону = СПРАВЖНЄ накриття. Страховка: знята media-межа НЕ сміє з\'їдати накриття в тексті' },
  ];
}
