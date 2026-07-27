/*
  composition.mjs — СТАТИЧНА КОМПОЗИЦІЯ зони (S51-d, дірка знайдена ОКОМ Єгора).

  ЧОМУ ЦЕ З'ЯВИЛОСЬ: Єгор зловив на parking спекс-блоці три розбіжності, яких НЕ БАЧИВ
  жоден вимір: у нас було 3 hairline (по одній НАД кожним рядком) проти 2 у live (лише МІЖ
  рядками), текст був притиснутий до лінії замість центру смуги, і лінія була в 1.6 раза
  темніша. Розбір дірки по воронці:
    Етап 1 (CLAIMS) — міряв ЛИШЕ офсети тексту (330/458/569px) і «нуль анімацій»; про
      розділювачі (скільки, де, якої ваги) в claims НЕ БУЛО НІЧОГО;
    SPEC — успадкував пропуск і додав ВИГАДАНЕ «hairline над кожним спекс-рядком»;
    код — сумлінно реалізував хибний SPEC;
    гейти — сліпі ЗА КОНСТРУКЦІЄЮ: structure-parity живе в EVENT-домені (статичний блок
      подій не генерує), surface-parity дивиться лише наявність панелі + позицію шва + колір
      через лівий ґаттер, решта вимірів (census/channel-identity/timing/purity/motion-direction)
      читають DOM і рух. Жоден не порівнював ЩО НАМАЛЬОВАНО всередині зони.

  ЩО МІРЯЄМО: два структурні статичні примітиви на КАДРІ (наш ↔ live) у межах прямокутника:
    1) HAIRLINE = рядок, темніший за околицю, з покриттям ≥ compLineCovMin по ширині
       (текст такого покриття не дає: між літерами світлий фон);
    2) ТЕКСТ-СМУГА = суцільний блок рядків, де є темні пікселі (літери) < покриття лінії.
  Далі порівнюємо СПИСКИ: кількість, позиції у %% висоти кадру, вага (глибина) ліній.
*/
'use strict';

// профіль: для рядка y повертає [покриття темних, середня глибина] проти локального фону
function rowStat(frame, y, x0, x1, gap = 7){
  const { w, data } = frame;
  let darker = 0, depth = 0, n = 0;
  for (let x = x0; x < x1; x += 2) {
    const cur = data[y * w + x];
    const bg = (data[(y - gap) * w + x] + data[(y + gap) * w + x]) / 2;
    if (bg - cur >= 2) darker++;
    depth += bg - cur; n++;
  }
  return { cov: n ? darker / n : 0, depth: n ? depth / n : 0 };
}

// ── HAIRLINE-и в прямокутнику: [{yPct, depth}] ───────────────────────────────
export function hairlines(frame, rect, TH, box){
  const { x0, y0, x1, y1 } = rect;
  const hits = [];
  for (let y = Math.max(y0, 8); y < Math.min(y1, frame.h - 8); y++) {
    const s = rowStat(frame, y, x0, x1);
    if (s.cov >= TH.compLineCovMin && s.depth >= TH.compLineDepthMin) hits.push({ y, depth: s.depth });
  }
  const out = [];
  for (const h of hits) {
    const prev = out[out.length - 1];
    if (prev && h.y - prev.y <= 5) { if (h.depth > prev.depth) { prev.y = h.y; prev.depth = h.depth; } }
    else out.push({ y: h.y, depth: h.depth });
  }
  const norm = (y) => box ? 100 * (y - box.topPx) / box.hPx : 100 * y / frame.h;
  return out.map(h => ({ yPct: +norm(h.y).toFixed(2), depth: +h.depth.toFixed(1) }));
}

// ── ТЕКСТ-СМУГИ в прямокутнику: [{yPct центру, hPx}] ────────────────────────
export function textBands(frame, rect, TH, box){
  const { x0, y0, x1, y1 } = rect;
  const on = [];
  for (let y = Math.max(y0, 8); y < Math.min(y1, frame.h - 8); y++) {
    const px = [];
    for (let x = x0; x < x1; x += 2) px.push(frame.data[y * frame.w + x]);
    const sorted = [...px].sort((a, b) => a - b);
    const bg = sorted[Math.floor(sorted.length * 0.9)];
    const ink = px.filter(v => bg - v > 25).length / px.length;
    on.push(ink > 0.02);
  }
  const bands = [];
  let s = -1;
  for (let i = 0; i <= on.length; i++) {
    if (i < on.length && on[i]) { if (s < 0) s = i; }
    else if (s >= 0) {
      const a = s + Math.max(y0, 8), b = i - 1 + Math.max(y0, 8);
      const c = (a + b) / 2;
      const yp = box ? 100 * (c - box.topPx) / box.hPx : 100 * c / frame.h;
      if (b - a >= 6) bands.push({ yPct: +yp.toFixed(2), hPx: b - a });
      s = -1;
    }
  }
  return bands;
}

// ── ПАРИТЕТ статичної композиції: наш кадр ↔ live-кадр у зоні ───────────────
// ⚠️ yPct нормується на КОНТЕНТ-БОКС, не на кадр: live має хром (у parking 5.5%% + 11.7%%),
// наш render — ні. Без цього позиції порівнювались у різних системах (S51-d, зловлено одразу).
export function compareComposition(ourFrame, liveFrame, ourRect, liveRect, TH, ourBox, liveBox){
  const oL = hairlines(ourFrame, ourRect, TH, ourBox), lL = hairlines(liveFrame, liveRect, TH, liveBox);
  const oB = textBands(ourFrame, ourRect, TH, ourBox), lB = textBands(liveFrame, liveRect, TH, liveBox);
  const diffs = [];
  if (oL.length !== lL.length)
    diffs.push({ kind: 'line-count', detail: `розділювачів (hairline): live=${lL.length} vs наш=${oL.length}`
      + ` [live ${lL.map(h => h.yPct + '%').join(', ') || '—'} · наш ${oL.map(h => h.yPct + '%').join(', ') || '—'}]` });
  else for (let i = 0; i < oL.length; i++) {
    const dy = Math.abs(oL[i].yPct - lL[i].yPct);
    if (dy > TH.compPosTolPct)
      diffs.push({ kind: 'line-pos', detail: `лінія №${i + 1}: live ${lL[i].yPct}% vs наш ${oL[i].yPct}% (Δ${dy.toFixed(2)} > ${TH.compPosTolPct})` });
    const dd = Math.abs(oL[i].depth - lL[i].depth) / Math.max(lL[i].depth, 1);
    if (dd > TH.compDepthTolFrac)
      diffs.push({ kind: 'line-weight', detail: `вага лінії №${i + 1}: live ${lL[i].depth} vs наш ${oL[i].depth} (Δ${(100 * dd).toFixed(0)}% > ${100 * TH.compDepthTolFrac}%)` });
  }
  if (oB.length !== lB.length)
    diffs.push({ kind: 'row-count', detail: `текст-рядків: live=${lB.length} vs наш=${oB.length}`
      + ` [live ${lB.map(b => b.yPct + '%').join(', ') || '—'} · наш ${oB.map(b => b.yPct + '%').join(', ') || '—'}]` });
  else for (let i = 0; i < oB.length; i++) {
    const dy = Math.abs(oB[i].yPct - lB[i].yPct);
    if (dy > TH.compPosTolPct)
      diffs.push({ kind: 'row-pos', detail: `текст-рядок №${i + 1}: live ${lB[i].yPct}% vs наш ${oB[i].yPct}% (Δ${dy.toFixed(2)} > ${TH.compPosTolPct})` });
  }
  return { diffs, ours: { lines: oL, rows: oB }, live: { lines: lL, rows: lB } };
}
