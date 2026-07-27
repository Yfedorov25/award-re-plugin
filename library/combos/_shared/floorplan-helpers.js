/* ============================================================================
   floorplan-helpers.js - SHARED data + helpers for the 9 floorplan section variants.
   Written ONCE, imported by every floorplan-* combo-lab (ES module).
   ----------------------------------------------------------------------------
   Carries the REAL asset-truth data (smarts units.json + towns content.js, copied
   verbatim this session) + the converters/formatters/SVG builders the combos share.
   No engine internals here - this only PREPARES data the three atoms consume.
   LAWS: $ never the ruble default; zero invented data; zero em/en-dash anywhere.
   ============================================================================ */

/* ---- formatters + maps (every combo passes fmtPrice to override the atom default) ---- */
export const fmtPrice = (n) => '$' + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
export const STATUS = { available: 'sale', reserved: 'reserved', sold: 'sold' }; // data -> atom class
export const STATUS_WORD_F = { available: 'Вільна', reserved: 'Бронь', sold: 'Продана' };   // feminine (квартира)
export const STATUS_WORD_M = { available: 'Вільний', reserved: 'У броні', sold: 'Проданий' }; // masculine (таун, блок)

/* ============================================================================
   SMARTS - REAL, from apps/smarts/data/units.json (verified this session)
   54 units, 18 per floor on "2","3","m"; 2 types; $950/m2.
   pos {x,y,w,h} are PERCENT of the floorplate -> convert to numbered-floorplate
   points in the floor-std-clean.svg viewBox (100 x 44.08).
   ============================================================================ */
export const SMARTS_PRICE_PER_M2 = 950;
export const SMARTS_TYPE = {
  'smart-27': { label: 'Смарт 27 м²', m2: 27.06, planClean: '/assets/plans/type-27-clean.webp' },
  'smart-24': { label: 'Смарт 24 м²', m2: 23.76, planClean: '/assets/plans/type-24-clean.webp' },
};
export const SMARTS_FLOORS = [
  { id: '2', label: '2-й поверх' },
  { id: '3', label: '3-й поверх' },
  { id: 'm', label: 'Мансардний поверх' },
];
// the floorplate aspect (units.json floorPlanAspect 2.2685 -> viewBox 100 x 44.08)
export const SMARTS_VBW = 100, SMARTS_VBH = 44.08;

// pos% (y/h are percent of the plate height) -> viewBox-space polygon points string "x,y x,y ..."
export function posToPoints(pos, vbH = SMARTS_VBH) {
  const x = pos.x, w = pos.w, y = (pos.y / 100) * vbH, h = (pos.h / 100) * vbH;
  return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]]
    .map((p) => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ');
}

// build the numbered-floorplate units[] for one smarts floor from the raw units.json array
export function smartsUnitsForFloor(rawUnits, floorId) {
  return rawUnits.filter((u) => u.floor === floorId).map((u) => {
    const t = SMARTS_TYPE[u.type];
    return {
      nr: u.code.split('-')[1] || u.code,   // pill shows the position number (01..18); full code kept below
      code: u.code,
      type: t ? t.label : u.type,
      area: u.m2,
      price: Math.round(u.m2 * SMARTS_PRICE_PER_M2),
      status: STATUS[u.status] || 'sale',
      planClean: t ? t.planClean : null,
      floor: u.floor,
      points: posToPoints(u.pos),
    };
  });
}

// a mini floor-locator svg (this unit filled dark) reusing the real pos rects - for veil L3 floorChipSVG.
// NOT a Flip target (static svg); built per unit, active cell solid.
export function smartsFloorChip(rawUnits, floorId, activeCode) {
  const cells = rawUnits.filter((u) => u.floor === floorId).map((u) => {
    const x = u.pos.x, w = u.pos.w, y = (u.pos.y / 100) * SMARTS_VBH, h = (u.pos.h / 100) * SMARTS_VBH;
    const on = u.code === activeCode;
    return '<rect data-nr="' + u.code + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) +
      '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" ' +
      'fill="' + (on ? 'var(--fp-loc-on,#1e2227)' : 'none') + '" ' +
      'stroke="' + (on ? 'var(--fp-loc-on,#1e2227)' : 'var(--fp-loc-off,#aeb6bc)') + '" stroke-width="0.4"/>';
  }).join('');
  return '<svg viewBox="0 0 ' + SMARTS_VBW + ' ' + SMARTS_VBH + '" preserveAspectRatio="xMidYMid meet">' +
    '<rect x="0.4" y="0.4" width="' + (SMARTS_VBW - 0.8) + '" height="' + (SMARTS_VBH - 0.8) +
    '" fill="none" stroke="var(--fp-loc-off,#aeb6bc)" stroke-width="0.3"/>' + cells + '</svg>';
}

// a mini SITE/STACK locator for the smarts veil L3: the 4 levels over the commerce plinth, THIS floor solid.
// Real data (SMARTS_FLOORS + the commerce plinth), reusing data-block so the atom's active-fill could also drive it.
// Static svg; the active level uses var(--fp-loc-on). NOT a Flip target.
export function smartsSiteChip(activeFloorId) {
  // levels top->bottom: мансарда (m), 3, 2, then the commerce plinth (not selectable)
  const levels = [
    { id: 'm', label: 'М' },
    { id: '3', label: '3' },
    { id: '2', label: '2' },
  ];
  const bandH = 9, gap = 1.4, plinthH = 7, w = 40;
  let y = 1.2, rows = '';
  levels.forEach((lv) => {
    const on = lv.id === activeFloorId;
    rows += '<rect data-block="' + lv.id + '" x="1.2" y="' + y.toFixed(1) + '" width="' + (w - 2.4) +
      '" height="' + bandH + '" rx="1" fill="' + (on ? 'var(--fp-loc-on,#1e2227)' : 'none') + '" ' +
      'stroke="' + (on ? 'var(--fp-loc-on,#1e2227)' : 'var(--fp-loc-off,#aeb6bc)') + '" stroke-width="0.5"/>';
    rows += '<text x="' + (w / 2) + '" y="' + (y + bandH / 2 + 1.5).toFixed(1) + '" text-anchor="middle" ' +
      'font-size="4.4" font-family="Inter, sans-serif" fill="' + (on ? '#fff' : 'var(--fp-loc-off,#8a949b)') + '">' + lv.label + '</text>';
    y += bandH + gap;
  });
  // the commerce plinth (always neutral, never the active unit)
  const ph = y;
  rows += '<rect x="1.2" y="' + ph.toFixed(1) + '" width="' + (w - 2.4) + '" height="' + plinthH +
    '" rx="1" fill="#e4e7ea" stroke="var(--fp-loc-off,#aeb6bc)" stroke-width="0.5"/>';
  rows += '<text x="' + (w / 2) + '" y="' + (ph + plinthH / 2 + 1.5).toFixed(1) +
    '" text-anchor="middle" font-size="3.4" font-family="Inter, sans-serif" fill="#8a949b" letter-spacing="0.5">КОМЕРЦІЯ</text>';
  const totalH = ph + plinthH + 1.2;
  return '<svg viewBox="0 0 ' + w + ' ' + totalH.toFixed(1) + '" preserveAspectRatio="xMidYMid meet">' + rows + '</svg>';
}

/* ============================================================================
   TOWNS - REAL, from apps/towns/data/content.js (verified this session)
   6 identical townhouses, the ONLY real differentiator is position (edge vs middle).
   ALL available (no invented sold/reserved). Plot 121..139 m2 stated ONCE as a range.
   Calibrated hit-zones copied verbatim from apps/towns/src/js/sections/units.js.
   selector render = selector-row-6-day.png, intrinsic 1920 x 814 (near-orthographic,
   FLAT front quads - no perspective side faces).
   ============================================================================ */
export const TOWNS_IMG = { w: 1920, h: 814 };
// calibrated zones from towns units.js (x/w in viewBox-100 over the render; px = pin center-of-mass)
export const TOWNS_ZONES = [
  { n: 1, x: 0.30, w: 16.36, px: 7.07 },
  { n: 2, x: 18.66, w: 14.16, px: 26.13 },
  { n: 3, x: 34.82, w: 14.13, px: 41.89 },
  { n: 4, x: 50.95, w: 14.42, px: 58.38 },
  { n: 5, x: 67.37, w: 14.30, px: 74.57 },
  { n: 6, x: 83.67, w: 16.03, px: 92.74 },
];
// the facade band y-extent on the render (units.js Y_TOP/Y_BOT), viewBox-100 vertical
export const TOWNS_BAND = { top: 22, bot: 92 };

export const TOWNS_HOUSES = [1, 2, 3, 4, 5, 6].map((n) => ({
  nr: String(n),
  area: '82 м²',
  rooms: 'дві спальні',
  yard: 'свій двір',
  plot: 'від 121 до 139 м²',
  priceFrom: 'від $67 тис.',
  pos: (n === 1 || n === 6) ? 'крайній у ряду' : 'у середині ряду',
  status: 'available',
}));

// the deep town-page room areas, copy-pasted VERBATIM from CONTENT.plan.scenes (the precise source).
// Tiles sized proportionally to real area; NO invented footprint/perimeter.
export const TOWNS_ROOMS = {
  floor1: [
    { name: 'Кухня-вітальня', m2: 19.44 },
    { name: 'Передпокій', m2: 5.93 },
    { name: 'Коридор і сходи', m2: 7.89 },
    { name: 'Гардероб', m2: 5.95 },
    { name: 'Санвузол', m2: 4.50 },
  ],
  floor2: [
    { name: 'Спальня', m2: 14.05 },
    { name: 'Спальня', m2: 12.49 },
    { name: 'Гардероб', m2: 5.00 },
    { name: 'Санвузол', m2: 4.50 },
    { name: 'Коридор', m2: 2.28 },
  ],
};
export const TOWNS_TRUST = [
  'Земля приватизована, документи на руках',
  'Старт будівництва: червень 2026',
  'Ключі: перший квартал 2027',
  'Газ, вода, каналізація на ділянці',
];
export const TOWNS_HONESTY = 'Повне планування покажемо у відповідь на заявку.';
export const TOWNS_PRICE_NOTE = '67 тисяч доларів це ціна на старті будівництва. Далі вона зростатиме.';

/* ============================================================================
   TOWER-1to1 - SYNTHETIC but self-consistent (openly a demo: "Демонстраційний проєкт").
   area x flat rate so price never contradicts area. 8 units per floor (matches the
   authored tower-floor-clean.svg 8 footprints). Two korpus. Status by floor band.
   ============================================================================ */
export const TOWER_RATE = 1450; // USD/m2 flat
export const TOWER_TYPE = {
  't-1s': { label: 'Студія', area: 38.0, rooms: 'студія' },
  't-1': { label: '1 спальня', area: 52.5, rooms: 'одна спальня' },
  't-2': { label: '2 спальні', area: 74.0, rooms: 'дві спальні' },
  't-3': { label: '3 спальні', area: 96.5, rooms: 'три спальні' },
};
// the floor plate: 8 units, corners are the 3-room (matches tower-floor-clean.svg footprint classes)
export const TOWER_PLATE = ['t-3', 't-1s', 't-1', 't-2', 't-2', 't-1', 't-1s', 't-3'];
export const TOWER_LEGAL = 'Демонстраційний проєкт. Дані наведено для прикладу.';

// build a representative tower floor's units[] (status spread so all 3 states render); points come
// from the authored tower-floor-clean.svg footprints (passed in), keyed by index.
export function towerUnitsForFloor(korpus, floor, footprintPoints) {
  // a deterministic status spread per floor: low floors mostly sold, mid mixed, top available.
  const band = floor <= 6 ? 'low' : floor <= 14 ? 'mid' : 'high';
  const spread = {
    low: ['sold', 'sold', 'reserved', 'sold', 'sold', 'available', 'sold', 'reserved'],
    mid: ['available', 'sold', 'available', 'reserved', 'available', 'sold', 'available', 'available'],
    high: ['available', 'available', 'reserved', 'available', 'available', 'available', 'sold', 'available'],
  }[band];
  return TOWER_PLATE.map((typeKey, i) => {
    const t = TOWER_TYPE[typeKey];
    const raw = spread[i % spread.length];
    const num = String(i + 1).padStart(2, '0');
    return {
      nr: num,
      code: korpus + String(floor).padStart(2, '0') + num, // e.g. A1203
      type: t.label,
      area: t.area,
      price: Math.round(t.area * TOWER_RATE),
      status: STATUS[raw],
      rooms: t.rooms,
      floor, korpus,
      points: footprintPoints && footprintPoints[i] ? footprintPoints[i] : null,
    };
  });
}
