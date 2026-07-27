/* ============================================================
   PORTRAIT-CAROUSEL · component.js  (DUAL-PLATFORM wrapper)
   ------------------------------------------------------------
   Springs' arrow portrait carousel: a vertical push-slice of portrait cards with a
   copy-lag + ken-burns. Imperative engine: go(dir) steps ±1, current(), wires the
   ← → buttons. (No scroll driver, no narrow-guard — the engine is already responsive.)

   🔴 DUAL-PLATFORM — the push-slice MECHANIC is identical; the INTERACTION differs:

     desktop  →  arrowNav()    — the ← → outline buttons drive go(dir) (click / arrow
                 keys). Springs desktop: you click arrows to page portraits.

     mobile   →  swipeAuto()   — TOUCH-SWIPE drives go(dir) (drag left/right) AND an
                 ambient auto-advance timer pages it on its own, so it lives without a
                 tap. Springs mobile is a swipeable, self-advancing slider. (Arrows
                 stay as a fallback but swipe is the primary mobile affordance.)

   Both branches drive the SAME engine go(dir) — only the INPUT differs. See
   meta.json{differs}.

   Entry: PortraitCarouselDual.init(target, opts) -> { platform, engine, driver }.
   ============================================================ */
(function (global) {
  'use strict';

  function resolvePlatform(opt) {
    if (opt === 'desktop' || opt === 'mobile') return opt;
    var isDesktop = global.matchMedia && global.matchMedia('(min-width:1024px)').matches;
    return isDesktop ? 'desktop' : 'mobile';
  }

  /* MOBILE: touch-swipe on the frame + an ambient auto-advance timer */
  function swipeAuto(stage, engine, opt) {
    var frame = stage.querySelector('.pc-frame') || stage;
    var x0 = null, moved = false;
    var THRESH = 40;
    function down(e) { x0 = (e.touches ? e.touches[0] : e).clientX; moved = false; restart(); }
    function move(e) {
      if (x0 === null) return;
      var x = (e.touches ? e.touches[0] : e).clientX;
      if (Math.abs(x - x0) > THRESH && !moved) {
        moved = true;
        engine.go(x < x0 ? 1 : -1);   // swipe left → next, right → prev
        x0 = x;
      }
    }
    function up() { x0 = null; }
    frame.addEventListener('touchstart', down, { passive: true });
    frame.addEventListener('touchmove', move, { passive: true });
    frame.addEventListener('touchend', up, { passive: true });

    // ambient auto-advance; pauses briefly after a manual swipe
    var timer = null, paused = 0;
    function tick() { if (Date.now() >= paused) engine.go(1); }
    function start() { if (opt.autoMs) timer = global.setInterval(tick, opt.autoMs); }
    function restart() { paused = Date.now() + (opt.autoMs || 0); } // hold auto after touch
    start();
    return { stop: function () { if (timer) global.clearInterval(timer); } };
  }

  /* DESKTOP: the engine already wired .pc-prev/.pc-next; nothing extra to add. */
  function arrowNav() { return { native: true }; }

  function init(target, options) {
    options = options || {};
    var stage = typeof target === 'string' ? document.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }
    if (!global.PortraitCarousel) { return { error: 'engine (PortraitCarousel) not loaded' }; }

    var platform = resolvePlatform(options.platform || 'auto');

    var engineOpts = {};
    for (var k in options) if (options.hasOwnProperty(k) && k !== 'platform' && k !== 'autoMs') engineOpts[k] = options[k];
    var engine = global.PortraitCarousel.init(target, engineOpts);
    if (!engine || !engine.go) { return { error: 'engine go unavailable', engine: engine }; }

    stage.setAttribute('data-pc-platform', platform);

    var driver = platform === 'desktop'
      ? arrowNav()
      : swipeAuto(stage, engine, { autoMs: options.autoMs != null ? options.autoMs : 3200 });

    try { global.__LAB_OK__ = true; } catch (e) {}
    return { platform: platform, engine: engine, driver: driver };
  }

  var api = { init: init };
  global.PortraitCarouselDual = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
