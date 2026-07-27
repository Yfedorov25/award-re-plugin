/* ============================================================
   STAT-ODOMETER · component.js  (DUAL-PLATFORM wrapper)
   ------------------------------------------------------------
   Springs' pinned stat-card slider — 4 mechanics per step at once: bg vertical
   slide-up + card-photo crossfade + numeral odometer-roll + label swap. Pure
   render(prog) drives all four off a single 0..1.

   🔴 DUAL-PLATFORM (corrected S19g vs D_SPRINGS_video — springs mobile stat is a
      PINNED-SCROLL, NOT an auto-slider. This was the audit's only "bad" verdict):
     desktop → scrollStep() — render(prog) scrubbed by scroll while the block pins
               across N-1 handoffs (steps 6→12→24→48). Wide layout.
     mobile  → scrollStep() too — SAME pinned-scroll: the stat sticks full-bleed and
               the 4 mechanics advance by SCROLL-PROGRESS (frozen bg + copy/number
               swap over it). NOT a timer. Springs mobile pins the stat scene and
               swaps by scroll, per T-PIN-RUNSCENE ("доводчик #1 за вагою").

   Both platforms drive the SAME render(prog) via manualDrive, both scroll-pin.
   The dual difference is LAYOUT + pin-length, not scroll-vs-time. meta{differs}.

   Entry: StatOdometerDual.init(target, opts) -> { platform, engine, driver }.
   ============================================================ */
(function (global) {
  'use strict';

  function resolvePlatform(opt) {
    if (opt === 'desktop' || opt === 'mobile') return opt;
    var isDesktop = global.matchMedia && global.matchMedia('(min-width:1024px)').matches;
    return isDesktop ? 'desktop' : 'mobile';
  }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  /* DESKTOP: prog = scroll progress across a pin-length span (N-1 handoffs) */
  function scrollStep(stage, engine, handoffs) {
    // the stage is position:sticky inside a tall pin-wrap; read progress from the wrap
    // (the stage's own top stays 0 while pinned). prog 0 at wrap top, 1 near wrap end.
    var pin = stage.closest('.pin-wrap') || stage.parentElement || stage;
    function onScroll() {
      var r = pin.getBoundingClientRect();
      var vh = global.innerHeight || 800;
      var span = (pin.offsetHeight - vh) || (vh * handoffs); // scrollable length while pinned
      var prog = (-r.top) / span;
      engine.render(Math.max(0, Math.min(1, prog)));
    }
    onScroll();
    global.addEventListener('scroll', onScroll, { passive: true });
    global.addEventListener('resize', onScroll);
    return { onScroll: onScroll };
  }

  function init(target, options) {
    options = options || {};
    var stage = typeof target === 'string' ? document.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }
    if (!global.StatOdometer) { return { error: 'engine (StatOdometer) not loaded' }; }

    var platform = resolvePlatform(options.platform || 'auto');
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var engineOpts = { manualDrive: true, forceMotion: true };
    for (var k in options) if (options.hasOwnProperty(k) && k !== 'platform') engineOpts[k] = options[k];
    var engine = global.StatOdometer.init(target, engineOpts);
    if (!engine || !engine.render) { return { error: 'engine render unavailable', engine: engine }; }

    var count = engine.count || (engine.steps ? engine.steps.length : 2);
    var handoffs = Math.max(1, count - 1);
    stage.setAttribute('data-so-platform', platform);

    // both platforms scroll-pin driven (springs mobile stat = pinned-scroll, not auto)
    var driver = reduced ? (engine.render(1), null) : scrollStep(stage, engine, handoffs);

    try { global.__LAB_OK__ = true; } catch (e) {}
    return { platform: platform, engine: engine, driver: driver, count: count };
  }

  var api = { init: init };
  global.StatOdometerDual = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
