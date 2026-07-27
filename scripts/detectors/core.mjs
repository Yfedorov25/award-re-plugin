/*
  detectors/core.mjs — СУД (чисті функції над трейсом; браузер сюди не заходить).
  Етап B S45, build-spec ради Fable 5. Кожен детектор → [{dimension,name,pass,detail,basis}].
  basis: 'live' (число з SPEC/CHOREO/live-таймкоду) | 'self' (render-math: регрес-guard,
  ніколи не «зелений-проти-live»). null-подія = FAIL (fail-closed), ніколи мовчазний skip.
*/
import { chan, activeWindow, plateaus, crossing, near, CH } from '../lib/trace.mjs';

const range = (v) => v && v.length ? Math.max(...v) - Math.min(...v) : 0;

// px→одиниця таргета
const toUnit = (px, unit, trace) => unit === 'dvh' ? px / trace.vh * 100 : px;

// ── події одного таргета: вікно руху + плато на primary-каналі ───────────────
export function computeEvents(trace, tmap, cfg, TH){
  const ev = {};
  for (const t of cfg.targets) {
    const sc = tmap[t.id];
    if (!sc) { ev[t.id] = null; continue; }
    const v = chan(trace, sc, t.channel);
    const w = activeWindow(v, TH.stepEpsPx);
    const settlePx = t.unit === 'dvh' ? TH.epsLeaveParkDvh * trace.vh / 100 : TH.epsLeaveParkPx;
    const pl = plateaus(v, settlePx, Math.round(TH.minPlateauLenP * trace.steps))
      .map(p => ({ startP: p.startI / trace.steps, endP: p.endI / trace.steps, val: toUnit(p.val, t.unit, trace) }));
    ev[t.id] = {
      window: w ? { startP: w.startI / trace.steps, endP: w.endI / trace.steps } : null,
      plateaus: pl,
      signal: v,
    };
  }
  return ev;
}

// ── motion-direction: UP-wipe / crossfade / wrong-dir (порт Етапу A на трейс) ─
export function detectMotionDirection(trace, tmap, cfg, TH){
  const out = [];
  for (const t of cfg.targets.filter(t => t.wipe)) {
    const sc = tmap[t.id];
    if (!sc) { out.push({ dimension: 'motion-direction', name: `wipe:${t.id}`, pass: false, detail: 'таргет не знайдено в DOM', basis: 'live' }); continue; }
    const ty = chan(trace, sc, 'ty'), ct = chan(trace, sc, 'clipTop'), op = chan(trace, sc, 'opacity');
    const vis = ty.map((y, i) => y + ct[i]);
    const delta = vis[vis.length - 1] - vis[0];
    const span = trace.vh;
    const opChanges = range(op) > TH.opacityChangeMin;
    const flat = Math.abs(delta) < TH.crossfadeFlatPx;
    let maxJit = 0;
    for (let i = 1; i < vis.length; i++) { const d = vis[i] - vis[i-1]; if (d > 0) maxJit = Math.max(maxJit, d); }
    let pass = false, detail = '';
    if (t.wipe === 'up') {
      if (flat && opChanges) detail = `CROSSFADE-баг: geo плоска (Δ${delta.toFixed(0)}px), opacity міняється на ${range(op).toFixed(2)}`;
      else if (delta > TH.crossfadeFlatPx) detail = `WRONG-DIR: їде вниз (Δ+${delta.toFixed(0)}px)`;
      else if (delta > -(span * TH.upDeltaMinFrac)) detail = `недостатній хід угору: Δ${delta.toFixed(0)}px (< ${(span*TH.upDeltaMinFrac).toFixed(0)}px)`;
      else if (maxJit > TH.monoJitterPx) detail = `зигзаг: сплеск униз ${maxJit.toFixed(1)}px (> ${TH.monoJitterPx}px)`;
      else { pass = true; detail = `UP-wipe: visible-top ${vis[0].toFixed(0)}→${vis[vis.length-1].toFixed(0)}px, jitter ${maxJit.toFixed(1)}px`; }
    } else { detail = `невідомий wipe="${t.wipe}"`; }
    out.push({ dimension: 'motion-direction', name: `wipe:${t.id}`, pass, detail, basis: 'live' });
  }
  return out;
}

// ── channel-identity: механізм руху той що задекларовано (clip vs translate vs scale) ──
// S55: додано 'scale'. Причина не зручність, а дірка: словник знав лише translate і clip,
// тому атом із ЗУМОМ медіа (hero: виміряно з live трьома незалежними шляхами) не мав як
// бути оголошеним чесно — лишалось або тримати хибне 'translate' (вічний червоний з
// неправильної причини), або зняти 'mechanism' (мовчки прибрати вимір). Обидва брехня.
// Порогових ЗНАЧЕНЬ не додано і не змінено: беруться ті самі chIdentClipMaxPx /
// chIdentTranslateMinPx. Канал bw/bh уже є в трейсі (bbox враховує transform).
export function detectChannelIdentity(trace, tmap, cfg, TH){
  const out = [];
  for (const t of cfg.targets.filter(t => t.mechanism)) {
    const sc = tmap[t.id];
    if (!sc) continue;
    const tyR = range(chan(trace, sc, 'ty')) + range(chan(trace, sc, 'tx'));
    const clipR = range(chan(trace, sc, 'clipTop')) + range(chan(trace, sc, 'clipBottom'))
                + range(chan(trace, sc, 'clipLeft')) + range(chan(trace, sc, 'clipRight'));
    let pass, detail;
    if (t.mechanism === 'translate') {
      pass = clipR <= TH.chIdentClipMaxPx && tyR >= TH.chIdentTranslateMinPx;
      detail = `translate-механізм: Δtranslate=${tyR.toFixed(0)}px (≥${TH.chIdentTranslateMinPx}), Δclip=${clipR.toFixed(1)}px (≤${TH.chIdentClipMaxPx})`;
    } else if (t.mechanism === 'clip') {
      pass = tyR <= TH.chIdentClipMaxPx && clipR >= TH.chIdentTranslateMinPx;
      detail = `clip-механізм: Δclip=${clipR.toFixed(0)}px (≥${TH.chIdentTranslateMinPx}), Δtranslate=${tyR.toFixed(1)}px (≤${TH.chIdentClipMaxPx})`;
    } else if (t.mechanism === 'scale') {
      const boxR = range(chan(trace, sc, 'bw')) + range(chan(trace, sc, 'bh'));
      pass = tyR <= TH.chIdentClipMaxPx && clipR <= TH.chIdentClipMaxPx && boxR >= TH.chIdentTranslateMinPx;
      detail = `scale-механізм: Δbbox=${boxR.toFixed(0)}px (≥${TH.chIdentTranslateMinPx}), Δtranslate=${tyR.toFixed(1)}px (≤${TH.chIdentClipMaxPx}), Δclip=${clipR.toFixed(1)}px (≤${TH.chIdentClipMaxPx})`;
    } else { pass = false; detail = `невідомий mechanism="${t.mechanism}"`; }
    out.push({ dimension: 'channel-identity', name: `mech:${t.id}`, pass, detail, basis: 'live' });
  }
  return out;
}

// ── timing: подія на очікуваному scroll-% (кожне число з src) ────────────────
export function detectTiming(events, exp, TH){
  const out = [];
  for (const e of (exp?.events || [])) {
    const [tid, kind, sub] = e.key.split('.');           // card.motion.start | card.plateau.value ...
    const te = events[tid];
    let measured = null;
    if (te) {
      if (kind === 'motion') measured = sub === 'start' ? te.window?.startP : te.window?.endP;
      else if (kind === 'plateau') {
        const pl = te.plateaus.find(p => e.val != null ? near(p.val, e.val, e.valTol ?? 2) : p.startP > 0.05);
        measured = sub === 'start' ? pl?.startP : sub === 'end' ? pl?.endP : pl?.val;
      }
    }
    const tol = e.tol ?? TH.tolEventP;
    const pass = sub === 'value' ? near(measured, e.val, e.valTol ?? 2) : near(measured, e.p, tol);
    const want = sub === 'value' ? e.val : e.p;
    out.push({ dimension: 'timing', name: `t:${e.key}`, pass: !!pass,
      detail: measured == null ? `подію НЕ знайдено (fail-closed); очікувалось ${want} [${e.src}]`
        : `виміряно ${(+measured).toFixed(3)} vs очікуване ${want} ±${sub==='value' ? (e.valTol ?? 2) : tol} [${e.src}]`,
      basis: e.basis || 'live' });
  }
  return out;
}

// ── ordering: crossing-тип (пізній шар стартує НЕ раніше за перетин раннім) ──
export function detectOrdering(trace, tmap, events, cfg, exp, TH){
  const out = [];
  for (const r of (exp?.ordering || [])) {
    const later = events[r.later]?.window?.startP;
    const t = cfg.targets.find(x => x.id === r.notBefore.target);
    const sc = tmap[r.notBefore.target];
    let crossP = null;
    if (t && sc) {
      const v = chan(trace, sc, t.channel);
      const valPx = r.notBefore.unit === 'dvh' ? r.notBefore.value * trace.vh / 100 : r.notBefore.value;
      const ci = crossing(v, valPx);
      crossP = ci != null ? ci / trace.steps : null;
    }
    const pass = later != null && crossP != null && later >= crossP - TH.tolEventP;
    out.push({ dimension: 'ordering', name: `ord:${r.later}-after-${r.notBefore.target}@${r.notBefore.value}${r.notBefore.unit}`,
      pass,
      detail: later == null || crossP == null
        ? `подія відсутня: later=${later} crossing=${crossP} (fail-closed) [${r.src}]`
        : `${r.later}.start=${later.toFixed(3)} vs перетин=${crossP.toFixed(3)} (gap ${(later-crossP).toFixed(3)}, ліміт −${TH.tolEventP}) [${r.src}]`,
      basis: r.basis || 'live' });
  }
  return out;
}

// ── parallelism: вікна мусять перекриватись (Jaccard для довгих, overlap для коротких)
export function detectParallelism(events, exp, TH){
  const out = [];
  for (const o of (exp?.overlap || [])) {
    const a = events[o.a]?.window, b = events[o.b]?.window;
    let pass = false, detail = '';
    if (!a || !b) detail = `вікно відсутнє: ${o.a}=${JSON.stringify(a)} ${o.b}=${JSON.stringify(b)} (fail-closed)`;
    else {
      const inter = Math.min(a.endP, b.endP) - Math.max(a.startP, b.startP);
      const lenA = a.endP - a.startP, lenB = b.endP - b.startP;
      if (Math.min(lenA, lenB) < TH.jaccardMinWindowP) {
        pass = inter >= TH.minOverlapP;
        detail = `коротке вікно: overlap=${inter.toFixed(3)} (≥${TH.minOverlapP}); A=[${a.startP.toFixed(2)},${a.endP.toFixed(2)}] B=[${b.startP.toFixed(2)},${b.endP.toFixed(2)}]`;
      } else {
        const union = Math.max(a.endP, b.endP) - Math.min(a.startP, b.startP);
        const jac = inter > 0 ? inter / union : 0;
        pass = jac >= TH.overlapJaccardMin;
        detail = `Jaccard=${jac.toFixed(2)} (≥${TH.overlapJaccardMin})`;
      }
    }
    out.push({ dimension: 'parallelism', name: `par:${o.a}×${o.b}`, pass, detail: detail + ` [${o.src}]`, basis: o.basis || 'live' });
  }
  return out;
}

// ── plateau: pin-фаза існує (анти locked-to-scroll) ──────────────────────────
export function detectPlateau(events, exp, TH, trace){
  const out = [];
  const c = exp?.composition?.cardPin;
  if (c) {
    const te = events[c.target || 'card'];
    const pl = te?.plateaus?.find(p => near(p.val, c.valueDvh, c.tolDvh) && p.startP > 0.05);
    out.push({ dimension: 'plateau', name: 'pin-плато', pass: !!pl,
      detail: pl ? `плато ${pl.val.toFixed(1)}dvh на [${pl.startP.toFixed(2)},${pl.endP.toFixed(2)}] (довж ${(pl.endP-pl.startP).toFixed(2)}≥${TH.minPlateauLenP}) [${c.src}]`
        : `pin-плато ${c.valueDvh}±${c.tolDvh}dvh НЕ знайдено (locked-to-scroll?); плато: ${JSON.stringify((te?.plateaus||[]).map(p=>({v:+p.val.toFixed(1),s:+p.startP.toFixed(2),e:+p.endP.toFixed(2)})))} [${c.src}]`,
      basis: c.basis || 'live' });
  }
  return out;
}

// ── composition: pin-значення + олив-канва + гео картинки-контейнера ─────────
export function detectComposition(statics, events, exp, TH){
  const out = [];
  const c = exp?.composition || {};
  if (c.cardPin) {
    const te = events[c.cardPin.target || 'card'];
    const pl = te?.plateaus?.find(p => p.startP > 0.05);
    const pass = pl != null && near(pl.val, c.cardPin.valueDvh, c.cardPin.tolDvh);
    out.push({ dimension: 'composition-overlap', name: 'card-pin-top', pass,
      detail: pl ? `pin=${pl.val.toFixed(1)}dvh vs ${c.cardPin.valueDvh}±${c.cardPin.tolDvh} [${c.cardPin.src}]` : `pin-плато не знайдено (fail-closed) [${c.cardPin.src}]`,
      basis: c.cardPin.basis || 'live' });
  }
  if (c.canvasColor && statics) {
    const got = statics.bgColor, want = c.canvasColor.rgb;
    const pass = got && want.every((w, i) => Math.abs(got[i] - w) <= TH.colorTolChan);
    out.push({ dimension: 'composition-overlap', name: 'олив-канва', pass: !!pass,
      detail: `bg=rgb(${got ? got.join(',') : '?'}) vs rgb(${want.join(',')}) ±${TH.colorTolChan}/канал [${c.canvasColor.src}]`, basis: c.canvasColor.basis || 'live' });
  }
  if (c.picBox && statics) {
    const pass = statics.picTopPct != null
      && near(statics.picTopPct, c.picBox.topPct, c.picBox.tolPct)
      && near(statics.picHeightPct, c.picBox.heightPct, c.picBox.tolPct);
    out.push({ dimension: 'composition-overlap', name: 'pic-контейнер-не-full-bleed', pass,
      detail: `pic top=${statics.picTopPct?.toFixed(1)}% h=${statics.picHeightPct?.toFixed(1)}% vs ${c.picBox.topPct}/${c.picBox.heightPct} ±${c.picBox.tolPct} [${c.picBox.src}]`,
      basis: c.picBox.basis || 'self' });
  }
  return out;
}

// ── typography: текст УХОДИТЬ (не пінится) + порядок reveal ──────────────────
export function detectTypography(trace, tmap, events, cfg, exp, TH){
  const out = [];
  const ty = exp?.typography || {};
  if (ty.exit) {
    const t = cfg.targets.find(x => x.id === ty.exit.target);
    const sc = tmap[ty.exit.target];
    if (t && sc) {
      const v = chan(trace, sc, t.channel);
      const iA = Math.round(ty.exit.afterP * trace.steps), iZ = trace.steps;
      const a = v[iA] / trace.vh * 100, z = v[iZ] / trace.vh * 100;
      const pass = z <= a - ty.exit.minTravelDvh;
      out.push({ dimension: 'typography-reveal', name: 'текст-уходить-не-пінится', pass,
        detail: `ty(${ty.exit.afterP})=${a.toFixed(1)}dvh → ty(1.0)=${z.toFixed(1)}dvh, хід ${(a-z).toFixed(1)}dvh (≥${ty.exit.minTravelDvh}) [${ty.exit.src}]`, basis: ty.exit.basis || 'live' });
    } else out.push({ dimension: 'typography-reveal', name: 'текст-уходить-не-пінится', pass: false, detail: 'exit-таргет не знайдено (fail-closed)', basis: 'live' });
  }
  if (ty.revealOrder) {
    const a = events[ty.revealOrder.first]?.window, b = events[ty.revealOrder.then]?.window;
    const pass = a && b && b.startP > a.startP + 0.02;
    out.push({ dimension: 'typography-reveal', name: `reveal-порядок:${ty.revealOrder.first}→${ty.revealOrder.then}`, pass: !!pass,
      detail: a && b ? `${ty.revealOrder.first}.start=${a.startP.toFixed(2)}, ${ty.revealOrder.then}.start=${b.startP.toFixed(2)} [${ty.revealOrder.src}]` : `вікно reveal відсутнє (fail-closed) [${ty.revealOrder.src}]`,
      basis: ty.revealOrder.basis || 'live' });
  }
  return out;
}

// ── fade: елемент РОЗЧИНЯЄТЬСЯ opacity 1→0 у вікні (title-fade, S46 promenade-клас) ──
export function detectFade(trace, tmap, exp, TH){
  const out = [];
  const f = exp?.fade?.title;
  if (!f) return out;
  const sc = tmap[f.target];
  if (!sc) { out.push({ dimension: 'fade', name: `fade:${f.target}`, pass: false, detail: 'fade-таргет не знайдено (fail-closed)', basis: 'live' }); return out; }
  const op = chan(trace, sc, 'opacity');
  // старт fade = перший p де opacity зійшла з 1 (нижче 1-eps); кінець = перший p де opacity ~0
  let startI = -1, endI = -1;
  for (let i = 0; i < op.length; i++) {
    if (startI < 0 && op[i] < 1 - TH.fadeStartEps) startI = i;
    if (endI < 0 && op[i] <= TH.fadeEndEps) { endI = i; break; }
  }
  const startP = startI >= 0 ? startI / trace.steps : null;
  const endP = endI >= 0 ? endI / trace.steps : null;
  const okStart = near(startP, f.startP, TH.tolEventP);
  const okEnd = near(endP, f.endP, TH.tolEventP);
  const pass = okStart && okEnd;
  out.push({ dimension: 'fade', name: `fade:${f.target}`, pass,
    detail: startP == null || endP == null
      ? `fade НЕ відбувся (opacity не досягла 0; ${startP == null ? 'не почався' : 'не завершився'}) — title не розчиняється? (fail-closed) [${f.src}]`
      : `opacity fade [${startP.toFixed(3)},${endP.toFixed(3)}] vs очікуване [${f.startP},${f.endP}] ±${TH.tolEventP} [${f.src}]`,
    basis: f.basis || 'live' });
  return out;
}

// ── surface-parity: КОМПОЗИЦІЯ наша ↔ live числом (S46, народжено багом promenade) ──
// Порівнює surface-map (сегментація фото/суцільна-панель) нашого скріншота проти live-кадру
// на ТОМУ Ж scroll-стані: (а) чи є суцільна панель коли вона є в live; (б) позиція шва ±tol;
// (в) колір панелі. Ловить клас «текст-на-фото-без-панелі / нема-шва» який пропустили і око,
// і DOM-трейс (DOM не знає ЩО НАМАЛЬОВАНО). ourShots/liveShots = [{p, segs, seamPct}].
export function detectSurfaceParity(ourShots, liveShots, TH, waivers){
  // v2 (S46): порівняння ВЕРХУ ПАНЕЛІ через лівий ґаттер (gutterBandTop) — виміряно-надійне
  // проти текст/плитки-на-панелі. shots = [{p, bandTop|null}]. null = панелі нема в кадрі.
  const out = [];
  for (let i = 0; i < liveShots.length; i++) {
    const L = liveShots[i], O = ourShots[i];
    const name = `surf@p${L.p}`;
    if (!O) { out.push({ dimension: 'surface-parity', name, pass: false, detail: 'наш скріншот відсутній (fail-closed)', basis: 'live' }); continue; }
    let pass = true, detail;
    if (L.bandTop != null && O.bandTop == null) { pass = false; detail = `live має панель (верх @${L.bandTop}%), у нас ПАНЕЛІ НЕМА — текст на фото/скримі?`; }
    else if (L.bandTop == null && O.bandTop != null) { pass = false; detail = `у нас панель @${O.bandTop}%, а в live на цьому стані панелі нема`; }
    else if (L.bandTop == null && O.bandTop == null) { detail = 'панелі нема в обох (full-bleed стан)'; }
    else {
      const d = Math.abs(L.bandTop - O.bandTop);
      if (d > TH.seamTolPct) { pass = false; detail = `верх панелі: наш ${O.bandTop}% vs live ${L.bandTop}% (Δ${d.toFixed(1)} > ${TH.seamTolPct})`; }
      else detail = `верх панелі ${O.bandTop}%↔${L.bandTop}% Δ${d.toFixed(1)} (≤${TH.seamTolPct})`;
    }
    // ЯВНИЙ waiver (підпис Єгора в expectations.surfaceWaivers, src обов'язковий):
    // fail → waived:true (матриця живе), АЛЕ видимо в unchecked КОЖНОГО звіту, ніколи не тихо
    const wv = (waivers || []).find(w => Math.abs(w.p - L.p) < 0.001);
    if (!pass && wv) { out.push({ dimension: 'surface-parity', name, pass: true, waived: true,
      detail: 'WAIVED (розбіжність зафіксована, судить Єгор): ' + detail + ' [' + wv.src + ']', basis: 'live' }); continue; }
    out.push({ dimension: 'surface-parity', name, pass, detail, basis: 'live' });
  }
  return out;
}

// ── swipe-strip: хвіст-плитки = ГОРИЗОНТАЛЬНА СВАЙП-СТРІЧКА, не статичні картинки ──
// S47 (баг Єгора: promenade-хвіст був 2 статичні плитки; live = ≥3 плитки, touch-swipe+snap).
// probe (браузерна стадія probeSwipeStrip) → {found, tileCount, overflowPx, snapX, snapAlignAll,
// swipeMovedPx}. Чистий суд проти порогів. Провал будь-якого критерію = STATIC-tiles регрес.
export function detectSwipeStrip(probe, cfg, TH){
  const c = cfg?.swipeStrip;
  if (!c) return [];                                    // немає стрічки в цьому атомі → вимір не застосовний
  const out = [];
  if (!probe || !probe.found) {
    out.push({ dimension: 'swipe-strip', name: `strip:${c.sel}`, pass: false,
      detail: `трек-контейнер ${c.sel} не знайдено в DOM (fail-closed) [${c.src || 'SPEC M7'}]`, basis: 'live' });
    return out;
  }
  const okTiles   = probe.tileCount >= TH.swipeMinTiles;
  const okOver    = probe.overflowPx >= TH.swipeMinOverflowPx;
  const okSnapX   = probe.snapX === true;
  const okAlign   = probe.snapAlignAll === true;
  const okMove    = probe.swipeMovedPx >= TH.swipeMoveMinPx;
  const pass = okTiles && okOver && okSnapX && okAlign && okMove;
  const fails = [];
  if (!okTiles) fails.push(`плиток ${probe.tileCount} (<${TH.swipeMinTiles})`);
  if (!okOver)  fails.push(`трек НЕ переповнений: overflow ${probe.overflowPx}px (<${TH.swipeMinOverflowPx}) — статичні плитки?`);
  if (!okSnapX) fails.push(`scroll-snap-type без 'x' ('${probe.snapType || 'none'}')`);
  if (!okAlign) fails.push(`не всі плитки snap-align (${probe.alignedTiles}/${probe.tileCount})`);
  if (!okMove)  fails.push(`програмний scrollLeft НЕ зсунув трек: рух ${probe.swipeMovedPx}px (<${TH.swipeMoveMinPx}) — свайп заблокований?`);
  out.push({ dimension: 'swipe-strip', name: `strip:${c.sel}`, pass,
    detail: pass
      ? `свайп-стрічка: ${probe.tileCount} плиток, overflow ${probe.overflowPx}px, snap-x ✓, всі snap-align ✓, swipe рухає ${probe.swipeMovedPx}px [${c.src || 'SPEC M7'}]`
      : `STATIC-tiles регрес: ${fails.join('; ')} [${c.src || 'SPEC M7'}]`,
    basis: 'live' });
  return out;
}

// ── structure-parity: МЕХАНІКА наша ↔ live у EVENT-домені (план ради S47, крок 3) ──
// ЄДИНИЙ вимір що розриває самоузгоджене коло: референт = live-токени zone-track
// (файл існує ДО CHOREO), НЕ мої expectations. Порівнює per-зона ПОСЛІДОВНОСТІ
// вердиктів (порядок), ЛІЧИЛЬНИКИ дискретних подій (N swaps / N covers) і КЛАС
// механіки. НЕ пікселі, НЕ time-домен (нелінійний темп руки). Поля skip не існує.
export function detectStructureParity(liveRef, ourTokens, ourClass, ourUnknowns){
  const out = [];
  const liveT = liveRef.tokensScoped || liveRef.tokens;
  const liveUnknown = (liveRef.verdictsScoped || liveRef.verdicts || []).filter(v => v.verdict === 'UNKNOWN').length;
  if (liveUnknown > 0) {
    out.push({ dimension: 'structure-parity', name: 'live-unknown', pass: false,
      detail: `live zone-track має ${liveUnknown} UNKNOWN — механіка live не визначена, борд Єгору (fail-closed)`, basis: 'live' });
    return out;
  }
  if (ourUnknowns > 0) out.push({ dimension: 'structure-parity', name: 'our-unknown', pass: false,
    detail: `наш render(p) дав ${ourUnknowns} UNKNOWN-вердиктів — механіка коду не читається екстрактором (fail-closed)`, basis: 'live' });

  // Обрізаємо ВЕДУЧІ/ЗАМИКАЮЧІ TRAVELS з ОБОХ боків: в'їзд/виїзд секції = шов сусідів
  // (у live це скрол-прохід, у нашому render(p) країв може не бути) — НЕ механіка атома.
  // TRAVELS ВСЕРЕДИНІ послідовності (докрутка стосу ivy між COVER-ами) зберігається.
  const trimEdges = (arr) => {
    let s = 0, e = arr.length;
    while (s < e && arr[s].startsWith('TRAVELS')) s++;
    while (e > s && arr[e - 1].startsWith('TRAVELS')) e--;
    return arr.slice(s, e);
  };
  const zones = new Set([...Object.keys(liveT.seq), ...Object.keys(ourTokens.seq)]);
  for (const z of zones) {
    const a = trimEdges(liveT.seq[z] || []), b = trimEdges(ourTokens.seq[z] || []);
    const pass = a.join('|') === b.join('|');
    // S55: ПОРОЖНЄ порівняння більше НЕ йде в зелену смугу. Якщо після trimEdges з обох боків
    // не лишилось жодної події, «збігається: []» це не доказ парності, а відсутність предмета
    // порівняння. Так parking (найдорожчий атом, пʼять сесій) мав ДВІ такі зелені клітинки.
    // Смуга UNCHECKED для цього й існує: вимір видно, він не бреше, і його судить око.
    if (pass && a.length === 0) {
      out.push({ dimension: 'structure-parity', name: `seq:${z}`, pass: true, unchecked: true,
        detail: `порівнювати НЕ БУЛО ЧОГО: у зоні ${z} подій нема з обох боків. Це не парність, `
          + `а порожній предмет. Судить ОКО.`, basis: 'live' });
      continue;
    }
    out.push({ dimension: 'structure-parity', name: `seq:${z}`, pass,
      detail: pass ? `послідовність подій збігається: [${a.join(', ')}]`
        : `механіка РОЗІЙШЛАСЬ: live=[${a.join(', ')}] vs наш=[${b.join(', ')}]`, basis: 'live' });
    const ca = liveT.counters[z] || {}, cb = ourTokens.counters[z] || {};
    for (const k of ['SWAPS-CONTENT', 'COVERED-BY', 'ENTERS', 'EXITS', 'FADES']) {
      if ((ca[k] || 0) === 0 && (cb[k] || 0) === 0) continue;
      const ok = (ca[k] || 0) === (cb[k] || 0);
      out.push({ dimension: 'structure-parity', name: `count:${z}.${k}`, pass: ok,
        detail: `${k} у зоні ${z}: live=${ca[k] || 0} vs наш=${cb[k] || 0}`, basis: 'live' });
    }
  }
  const classOk = liveRef.mechanicClass?.class === ourClass?.class;
  out.push({ dimension: 'structure-parity', name: 'mechanic-class-parity', pass: classOk,
    detail: classOk ? `клас механіки збігається: ${ourClass?.class}`
      : `КЛАС РОЗІЙШОВСЯ: live=${liveRef.mechanicClass?.class} (${(liveRef.mechanicClass?.evidence || []).join('; ')}) vs наш=${ourClass?.class}`, basis: 'live' });
  return out;
}

// ── mechanic-class: клас визначає LIVE, config може лише ДОДАВАТИ (крок 5) ──
// Розбіжність «клас з live vs клас у config» = FAIL до всіх інших вимірів.
// Клас з live вмикає ОБОВ'ЯЗКОВІ детектори автоматично — «забути» їх у config неможливо.
export const CLASS_REQUIRED = {
  'swipe-strip': { cfg: ['swipeStrip'], exp: [] },
  'fade':        { cfg: [], exp: ['fade'] },
  // strip / stack+cover / pin+swap / parallax-hero: універсальний детектор = structure-parity (безумовний)
};
export function detectMechanicClass(liveRef, cfg, exp){
  const out = [];
  const liveClass = liveRef?.mechanicClass?.class;
  if (!liveClass) {
    out.push({ dimension: 'mechanic-class', name: 'live-class', pass: false,
      detail: 'live zone-track без класу механіки — запусти scripts/zone-track.mjs (fail-closed)', basis: 'live' });
    return out;
  }
  const declared = cfg.mechanicClass;
  const pass = declared === liveClass;
  out.push({ dimension: 'mechanic-class', name: 'class-vs-live', pass,
    detail: pass ? `config.mechanicClass="${declared}" = клас з live`
      : `MISMATCH: live визначив "${liveClass}", config декларує "${declared ?? 'НІЧОГО'}" — клас обирає live, не автор`, basis: 'live' });
  const req = CLASS_REQUIRED[liveClass];
  if (req) {
    for (const k of req.cfg) out.push({ dimension: 'mechanic-class', name: `required-cfg:${k}`, pass: !!cfg[k],
      detail: cfg[k] ? `клас "${liveClass}" вимагає config.${k} — присутній` : `клас "${liveClass}" ВИМАГАЄ config.${k} — відсутній (детектори замовляє live, не автор)`, basis: 'live' });
    for (const k of req.exp) out.push({ dimension: 'mechanic-class', name: `required-exp:${k}`, pass: !!exp?.[k],
      detail: exp?.[k] ? `клас "${liveClass}" вимагає expectations.${k} — присутній` : `клас "${liveClass}" ВИМАГАЄ expectations.${k} — відсутній`, basis: 'live' });
  }
  return out;
}

// ── census: незадекларований рухомий шар = FAIL; чистий census = явний PASS ──
export function detectUndeclared(movers, tmap, cfg){
  const declared = new Set(Object.values(tmap));
  const ignored = new Set((cfg.ignoreSc || []));
  const bad = movers.filter(m => !declared.has(m.sc) && !ignored.has(m.sc))
    .map(m => ({ dimension: 'census', name: `undeclared-mover:${m.desc}`, pass: false,
      detail: `рухомий елемент ${m.desc} не задекларований ні targets ні ignore (зайвий слайсер? забутий шар?)`, basis: 'live' }));
  if (bad.length) return bad;
  // явний PASS-запис: вимір census ЗАВЖДИ в dimensionsRun (анти-downgrade REQUIRED_DIMENSIONS)
  return [{ dimension: 'census', name: 'census-movers', pass: true,
    detail: `${movers.length} рухомих елементів, усі задекларовані (targets/ignore)`, basis: 'live' }];
}

// ── geometry: картка в межах viewport по горизонталі на всьому треку (порт Етапу A)
export function detectGeometry(trace, tmap, cfg, TH){
  const out = [];
  for (const t of cfg.targets.filter(x => x.role === 'card')) {
    const sc = tmap[t.id];
    if (!sc) { out.push({ dimension: 'geometry', name: `geo:${t.id}`, pass: false, detail: 'card-таргет не знайдено (fail-closed)', basis: 'live' }); continue; }
    const bx = chan(trace, sc, 'bx'), bw = chan(trace, sc, 'bw');
    let minL = Infinity, maxR = -Infinity;
    for (let i = 0; i < bx.length; i++) { minL = Math.min(minL, bx[i]); maxR = Math.max(maxR, bx[i] + bw[i]); }
    const pass = minL >= -2 && maxR <= trace.vw + 2;
    out.push({ dimension: 'geometry', name: `geo:${t.id}`, pass,
      detail: `горизонтальні межі на всьому треку: left ${minL.toFixed(0)}px (≥-2), right ${maxR.toFixed(0)}px (≤${trace.vw + 2})`, basis: 'live' });
  }
  if (!out.length) out.push({ dimension: 'geometry', name: 'geo:none', pass: true, detail: 'card-таргетів нема (атом без картки)', basis: 'live' });
  return out;
}
