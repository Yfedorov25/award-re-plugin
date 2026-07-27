/* ============================================================
   ISOMETRIC-BUILDING-UNIT-SELECTOR · component.js  (vanilla, SVG-hotspot driven; NO WebGL)
   ------------------------------------------------------------
   r1864's visual-search — the conversion core. A pre-rendered ISOMETRIC building image with
   an SVG overlay of UNIT/SECTION hotspots, a horizontal FILTER BAR (коллекция / секция /
   кол-во спален / площадь), a РАЗВЕРНУТЬ (expand) + ПОДБОР (apply) action, a live COUNT, and
   a hover INFO-CARD (collection / section / floor / unit). Filtering highlights matching
   hotspots (full opacity/brightness) and dims the rest; hovering a hotspot lights it + shows
   the card. Harvested from D_r1864 (/plans).

   NO-WEBGL (honored): the building is a STATIC pre-rendered image (Blender export / QUADRO
   render stand-in). Units are SVG <path>/<rect> hotspots keyed to data — no live 3D, no
   rotation. Reuses the base visual-search data model: each hotspot has data-nr + a stateClass
   (available / sold / reserved) + filter attributes (data-coll, data-sec, data-beds, data-area).
   РАЗВЕРНУТЬ can flip to a 2D floor-plate (the base SVG-plate engine) — they compose.

   THE MOVE:
     - filter state {coll, sec, beds, areaMin, areaMax} from the bar; applyFilter() adds
       .is-match / .is-dim to each hotspot; the live count = number of matching available units
     - hover/focus a hotspot -> .is-hot (lit) + the info-card fills from its data + follows
     - click a hotspot (or ПОДБОР) -> onSelect(data) callback (open the unit / 2D plate)
     - the whole render dims to a base level; matches pop. transition ~300ms ease

   CONFIG-DRIVEN:
     IsometricBuildingUnitSelector.create(target, {     // target = .ibs-stage
       dimOpacity: 0.35, hotOpacity: 1, matchOpacity: 0.92,
       onSelect: fn, onExpand: fn
     })
   Markup: .ibs-stage > .ibs-render(img + svg.ibs-hotspots[.ibs-unit[data-*]]) +
   .ibs-card + .ibs-count + .ibs-filters(.ibs-f[data-filter]) + .ibs-expand + .ibs-apply.
   Returns { applyFilter(state), count(), select(nr), reset(), destroy }.

   ENGINE LAWS: SVG fill/opacity + DOM opacity/transform only; NO mix-blend over the render;
   NO WebGL; keyboard-reachable hotspots; reduced-motion -> no transitions. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      dimOpacity: options.dimOpacity != null ? options.dimOpacity : 0.35,
      hotOpacity: options.hotOpacity != null ? options.hotOpacity : 1,
      matchOpacity: options.matchOpacity != null ? options.matchOpacity : 0.92,
      onSelect: typeof options.onSelect === 'function' ? options.onSelect : null,
      onExpand: typeof options.onExpand === 'function' ? options.onExpand : null
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var units = [].slice.call(stage.querySelectorAll('.ibs-unit'));
    var card = stage.querySelector('.ibs-card');
    var countEl = stage.querySelector('.ibs-count .num') || stage.querySelector('.ibs-count');
    var filters = [].slice.call(stage.querySelectorAll('.ibs-f'));
    var expandBtn = stage.querySelector('.ibs-expand');
    var applyBtn = stage.querySelector('.ibs-apply');
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) stage.classList.add('ibs-reduced');

    var state = { coll: null, sec: null, beds: null, areaMin: null, areaMax: null };

    function matches(u) {
      if (state.coll && u.getAttribute('data-coll') !== state.coll) return false;
      if (state.sec && u.getAttribute('data-sec') !== String(state.sec)) return false;
      if (state.beds && u.getAttribute('data-beds') !== String(state.beds)) return false;
      var a = parseFloat(u.getAttribute('data-area'));
      if (state.areaMin != null && !isNaN(a) && a < state.areaMin) return false;
      if (state.areaMax != null && !isNaN(a) && a > state.areaMax) return false;
      return true;
    }
    function isAvailable(u) { return (u.getAttribute('data-state') || 'available') === 'available'; }

    function applyFilter(next) {
      if (next) { for (var k in next) if (next.hasOwnProperty(k)) state[k] = next[k]; }
      var n = 0;
      units.forEach(function (u) {
        var m = matches(u);
        u.classList.toggle('is-match', m);
        u.classList.toggle('is-dim', !m);
        if (m && isAvailable(u)) n++;
      });
      if (countEl) countEl.textContent = n;
      return n;
    }
    function count() { var n = 0; units.forEach(function (u) { if (matches(u) && isAvailable(u)) n++; }); return n; }

    function fillCard(u) {
      if (!card) return;
      var set = function (sel, v) { var e = card.querySelector(sel); if (e) e.textContent = v || ''; };
      set('.ibs-card-coll', u.getAttribute('data-coll-label') || u.getAttribute('data-coll') || '');
      set('.ibs-card-sec', u.getAttribute('data-sec') || '');
      set('.ibs-card-floor', u.getAttribute('data-floor') || '');
      set('.ibs-card-nr', u.getAttribute('data-nr') || '');
      card.classList.add('is-shown');
    }
    function hideCard() { if (card) card.classList.remove('is-shown'); }
    function moveCard(e) {
      if (!card) return;
      var r = stage.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top;
      // keep the card inside the stage
      var cw = card.offsetWidth, ch = card.offsetHeight;
      card.style.left = Math.min(r.width - cw - 12, Math.max(12, x + 18)) + 'px';
      card.style.top = Math.min(r.height - ch - 12, Math.max(12, y + 18)) + 'px';
    }

    var handlers = [];
    units.forEach(function (u) {
      if (!u.hasAttribute('tabindex')) u.setAttribute('tabindex', '0');
      var on = function (e) { u.classList.add('is-hot'); fillCard(u); if (e && e.clientX != null) moveCard(e); };
      var move = function (e) { moveCard(e); };
      var off = function () { u.classList.remove('is-hot'); hideCard(); };
      var click = function () { if (opt.onSelect) opt.onSelect(readData(u)); };
      u.addEventListener('pointerenter', on);
      u.addEventListener('pointermove', move);
      u.addEventListener('pointerleave', off);
      u.addEventListener('focus', on); u.addEventListener('blur', off);
      u.addEventListener('click', click);
      u.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); click(); } });
      handlers.push([u, on, move, off, click]);
    });

    function readData(u) {
      return { nr: u.getAttribute('data-nr'), coll: u.getAttribute('data-coll'),
        sec: u.getAttribute('data-sec'), beds: u.getAttribute('data-beds'),
        area: u.getAttribute('data-area'), floor: u.getAttribute('data-floor'),
        state: u.getAttribute('data-state') || 'available' };
    }

    // filter bar buttons: each .ibs-f has data-filter (coll|sec|beds) + data-value
    filters.forEach(function (f) {
      f.addEventListener('click', function () {
        var key = f.getAttribute('data-filter'), val = f.getAttribute('data-value');
        // toggle within its group
        var group = filters.filter(function (g) { return g.getAttribute('data-filter') === key; });
        var wasOn = f.classList.contains('is-on');
        group.forEach(function (g) { g.classList.remove('is-on'); });
        if (!wasOn) f.classList.add('is-on');
        var next = {}; next[key] = wasOn ? null : (key === 'coll' ? val : val);
        applyFilter(next);
      });
    });

    if (expandBtn && opt.onExpand) expandBtn.addEventListener('click', function () { opt.onExpand(); });
    if (applyBtn && opt.onSelect) applyBtn.addEventListener('click', function () {
      // ПОДБОР: select the first matching available unit
      var first = units.filter(function (u) { return matches(u) && isAvailable(u); })[0];
      if (first) opt.onSelect(readData(first));
    });

    applyFilter();  // initial paint (all match, count all available)
    stage.classList.add('ibs-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      applyFilter: applyFilter, count: count,
      select: function (nr) { var u = units.filter(function (x) { return x.getAttribute('data-nr') === String(nr); })[0]; if (u && opt.onSelect) opt.onSelect(readData(u)); },
      reset: function () { state = { coll: null, sec: null, beds: null, areaMin: null, areaMax: null }; filters.forEach(function (g) { g.classList.remove('is-on'); }); applyFilter(); },
      units: units,
      destroy: function () { handlers.forEach(function (h) { h[0].removeEventListener('pointerenter', h[1]); h[0].removeEventListener('pointermove', h[2]); h[0].removeEventListener('pointerleave', h[3]); h[0].removeEventListener('click', h[4]); }); }
    };
  }

  var api = { create: create };
  global.IsometricBuildingUnitSelector = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
