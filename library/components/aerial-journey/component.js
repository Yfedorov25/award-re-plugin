/* ============================================================
   AERIAL-JOURNEY · component.js (vanilla, нуль залежностей)
   ------------------------------------------------------------
   T-121 (real-aerial база) + T-210 (color-zone оверлеї + хв-картки)
   + T-M27 (пінований аеро-журней: скрол = зум/пан).
   Знято з ЖИВОЇ /location #infrastructure (2026-07-06):

   • Пін sticky--full-height; ДВА живі парадакси (shared.js ДОСЛІВНО):
     Outer (locationInfrastructureVideoOuter): вхід scale(grid/viewport)
       + borderRadius 5px → scale(1) + radius 0 на піні — фрейм росте
       у fullbleed; easeInOutQuad; enableTouch:false.
     Inner (locationInfrastructureVideoInner): media scale 1.25 → 1 —
       аеро «сідає» зумом; touch-гілка: те саме на 50-0.
   • T-210: кольорові зони-полігони (SVG overlay) + хв-картки
     з'являються ПІСЛЯ посадки (p ≥ zonesAt) стаггером.

   РОЗМІТКА:
     <section>
       <div data-aj-layer>          ← sticky 100svh
         <div data-aj-outer>        ← фрейм (scale+radius)
           <div data-aj-inner>…<img/відео аеро…</div>
           <svg data-aj-zones>…<g data-aj-zone>полігон</g>…</svg>
           <div data-aj-cards>…<div data-aj-card>хв-картка</div>…</div>

   AerialJourney.create(section, opts?):
     spanSvh (120), innerFrom (1.25 — живий), zonesAt (0.55),
     cardStaggerMs (120), touchMq
   API: { render(p), progress(), gate, destroy }

   ENGINE LAWS: скраб = transform/borderRadius у rAF, skip-unchanged;
   зони/картки = класи (CSS transition 0.6s air); reverse-safe;
   reduced: все видиме одразу; __LAB_OK__ не торкається (B15).
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  function toEl(x) { return typeof x === 'string' ? doc.querySelector(x) : x; }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }
  function easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  function create(section, options) {
    options = options || {};
    var root = toEl(section);
    if (!root) return { error: 'no section' };
    var layer = root.querySelector('[data-aj-layer]');
    var outer = root.querySelector('[data-aj-outer]');
    var inner = root.querySelector('[data-aj-inner]');
    if (!layer || !outer || !inner)
      return { error: 'потрібні [data-aj-layer]/[data-aj-outer]/[data-aj-inner]' };
    var zones = Array.prototype.slice.call(root.querySelectorAll('[data-aj-zone]'));
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-aj-card]'));

    var opt = {
      spanSvh: options.spanSvh != null ? options.spanSvh : 120,
      innerFrom: options.innerFrom != null ? options.innerFrom : 1.25, /* живий */
      zonesAt: options.zonesAt != null ? options.zonesAt : 0.55,
      cardStaggerMs: options.cardStaggerMs != null ? options.cardStaggerMs : 120,
      touchMq: options.touchMq || '(pointer: coarse), (max-width: 768px)'
    };
    var reduced = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var touch = global.matchMedia && global.matchMedia(opt.touchMq).matches;

    var gate = { renders: 0, outerScale: 0, innerScale: 0, zonesOn: false };
    root.style.minHeight = 'calc(100svh + ' + opt.spanSvh + 'svh)';

    /* живий стартовий scale фрейма: грід-ширина/вьюпорт (~з відступами) */
    function outerFrom() {
      var pad = Math.max(24, global.innerWidth * 0.03) * 2;
      return (global.innerWidth - pad) / global.innerWidth;
    }

    cards.forEach(function (c, i) {
      c.style.transitionDelay = (i * opt.cardStaggerMs) + 'ms';
    });

    if (reduced) {
      outer.style.transform = 'scale(1)';
      inner.style.transform = 'scale(1)';
      root.classList.add('aj-zones-on');
      gate.zonesOn = true;
      return { static: true, gate: gate, destroy: function () {} };
    }

    function progress() {
      var r = root.getBoundingClientRect();
      var span = r.height - global.innerHeight;
      /* живий вимір: вхід (100-0) = наближення секції; тут одним p:
         перша половина = в'їзд (entry), решта = пін */
      var entry = clamp01((global.innerHeight - r.top) / global.innerHeight);
      var pin = span > 0 ? clamp01(-r.top / span) : 0;
      return { entry: entry, pin: pin };
    }

    var lastQ = -1;
    function render(p) {
      var q = Math.round(p.entry * 500) + Math.round(p.pin * 500) * 1000;
      if (q === lastQ) return;
      lastQ = q;
      gate.renders++;
      /* Outer: живий 100-0 → 0-0 (easeInOutQuad): грід-фрейм → fullbleed */
      var eo = easeInOutQuad(touch ? clamp01(p.entry * 2) : p.entry);
      var so = outerFrom() + (1 - outerFrom()) * eo;
      outer.style.transform = 'scale(' + so.toFixed(4) + ')';
      outer.style.borderRadius = (5 * (1 - eo)).toFixed(1) + 'px';
      gate.outerScale = so;
      /* Inner: живий 1.25 → 1 тим самим ходом */
      var si = opt.innerFrom - (opt.innerFrom - 1) * eo;
      inner.style.transform = 'scale(' + si.toFixed(4) + ')';
      gate.innerScale = si;
      /* T-210: зони після посадки (по прогресу піна) */
      var on = p.pin >= opt.zonesAt;
      if (on !== gate.zonesOn) {
        gate.zonesOn = on;
        root.classList.toggle('aj-zones-on', on);
      }
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      global.requestAnimationFrame(function () { ticking = false; render(progress()); });
    }
    global.addEventListener('scroll', onScroll, { passive: true });
    render(progress());

    return {
      render: render, progress: progress, gate: gate,
      destroy: function () {
        global.removeEventListener('scroll', onScroll);
        outer.style.transform = outer.style.borderRadius = '';
        inner.style.transform = '';
        root.classList.remove('aj-zones-on');
        root.style.minHeight = '';
      }
    };
  }

  global.AerialJourney = { create: create };
}(window));
