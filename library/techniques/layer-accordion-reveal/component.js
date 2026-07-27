/* ============================================================
   LAYER-ACCORDION-REVEAL · component.js  (DUAL-PLATFORM wrapper)
   ------------------------------------------------------------
   Springs' interiors accordion: N big renders as vertical slabs, one open at a time;
   at rest each is a narrow STRIP, the open one expands to a near-full render with its
   label+spec (clip-path inset + translateX, no width tween). Engine exposes open(i)/rest().

   🔴 DUAL-PLATFORM — the expand MECHANIC is identical; the INTERACTION differs:

     desktop  →  hoverNav()   — HOVER a slab → it opens (the engine already wires
                 mouseenter/focus/mouseleave). Springs desktop: hover to expand.

     mobile   →  swipeSlider() — there is no hover on touch. The dual branch keeps the
                 LIVE accordion (forceMotion) and turns it into a SWIPE-SLIDER: swipe
                 left/right → open the next/prev slab, plus an ambient auto-cycle. So
                 the same slabs become a self-advancing, swipeable slider — which is how
                 springs presents interiors on mobile (a slider, not a hover-rack).

   Both branches drive the SAME engine open(i) — only the INPUT differs. See
   meta.json{differs}.

   Entry: LayerAccordionRevealDual.init(target, opts) -> { platform, engine, driver }.
   ============================================================ */
(function (global) {
  'use strict';

  function resolvePlatform(opt) {
    if (opt === 'desktop' || opt === 'mobile') return opt;
    var isDesktop = global.matchMedia && global.matchMedia('(min-width:1024px)').matches;
    return isDesktop ? 'desktop' : 'mobile';
  }

  /* DESKTOP: the engine already wires hover/focus; nothing extra. */
  function hoverNav() { return { native: true }; }

  /* MOBILE: swipe to change the open slab + ambient auto-cycle */
  function swipeSlider(rack, engine, count, opt) {
    var i = 0;
    engine.open(0);
    var x0 = null, moved = false, THRESH = 36;
    function down(e) { x0 = (e.touches ? e.touches[0] : e).clientX; moved = false; hold(); }
    function movef(e) {
      if (x0 === null || moved) return;
      var x = (e.touches ? e.touches[0] : e).clientX;
      if (Math.abs(x - x0) > THRESH) {
        moved = true;
        i = (i + (x < x0 ? 1 : -1) + count) % count;   // swipe left → next
        engine.open(i);
      }
    }
    function up() { x0 = null; }
    rack.addEventListener('touchstart', down, { passive: true });
    rack.addEventListener('touchmove', movef, { passive: true });
    rack.addEventListener('touchend', up, { passive: true });

    var timer = null, paused = 0;
    function tick() { if (Date.now() >= paused) { i = (i + 1) % count; engine.open(i); } }
    function hold() { paused = Date.now() + (opt.autoMs || 0); }
    if (opt.autoMs) timer = global.setInterval(tick, opt.autoMs);
    return { stop: function () { if (timer) global.clearInterval(timer); } };
  }

  function init(target, options) {
    options = options || {};
    var rack = typeof target === 'string' ? document.querySelector(target) : target;
    if (!rack) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }
    if (!global.LayerAccordionReveal) { return { error: 'engine (LayerAccordionReveal) not loaded' }; }

    var platform = resolvePlatform(options.platform || 'auto');
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var engineOpts = {};
    for (var k in options) if (options.hasOwnProperty(k) && k !== 'platform' && k !== 'autoMs') engineOpts[k] = options[k];
    // mobile keeps the LIVE accordion (skip the hover:none static fallback)
    if (platform === 'mobile' && !reduced) engineOpts.forceMotion = true;
    var engine = global.LayerAccordionReveal.create(target, engineOpts);
    if (!engine || !engine.open) { return { error: 'engine open unavailable', engine: engine }; }

    var count = engine.slabs ? engine.slabs.length : 0;
    rack.setAttribute('data-lar-platform', platform);

    var driver = null;
    if (reduced) {
      // engine static list already shown; nothing to drive
    } else if (platform === 'desktop') {
      driver = hoverNav();
    } else {
      driver = swipeSlider(rack, engine, count, { autoMs: options.autoMs != null ? options.autoMs : 2600 });
    }

    try { global.__LAB_OK__ = true; } catch (e) {}
    return { platform: platform, engine: engine, driver: driver, count: count };
  }

  var api = { init: init };
  global.LayerAccordionRevealDual = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
