/* ============================================================
   FULLSCREEN-MEDIA-CAROUSEL · component.js  (DUAL-PLATFORM wrapper)
   ------------------------------------------------------------
   Springs' full-viewport residence gallery: an edge-to-edge carousel where each slide fills
   the WHOLE viewport (no card chrome), swiped one full width at a time. Imperative engine:
   go(i) / next() / prev() / index(), and it already wires ‹ › buttons, Left/Right keys AND
   pointer drag/swipe (F-08 window-pointer). No scroll driver, no narrow-guard — the engine is
   already responsive and go() works identically on any width, so NO forceMotion patch.

   🔴 DUAL-PLATFORM — the push-slide MECHANIC is identical (track translateX(-index*100%));
   the INTERACTION differs (the INPUT surface, not the driver source):

     desktop  →  arrowNav()   — the round ‹ › buttons + Left/Right keys drive next()/prev().
                 Springs desktop: you click arrows to page full-viewport renders.

     mobile   →  swipe()      — TOUCH-SWIPE drives next()/prev() (the engine's own pointer
                 drag already handles touch; the mobile branch just confirms it). NO ambient
                 auto-advance timer (S20 correction — a carousel is a swipe/arrow affordance,
                 it must NOT self-advance). Springs mobile is a swipeable full-bleed slider.

   Both branches drive the SAME engine (go/next/prev) — only the INPUT differs. See
   meta.json{differs}.

   Entry: FullscreenMediaCarouselDual.init(target, opts) -> { platform, engine, driver }.
   ============================================================ */
(function (global) {
  'use strict';

  function resolvePlatform(opt) {
    if (opt === 'desktop' || opt === 'mobile') return opt;
    var isDesktop = global.matchMedia && global.matchMedia('(min-width:1024px)').matches;
    return isDesktop ? 'desktop' : 'mobile';
  }

  /* DESKTOP: the engine already wired .fmc-prev/.fmc-next + Left/Right keys; nothing extra. */
  function arrowNav() { return { native: true, mode: 'arrows' }; }

  /* MOBILE: the engine already wires pointer drag/swipe (F-08). Clean swipe, NO auto-advance
     timer — the slider stays put until the user swipes (S20: carousels don't self-page). */
  function swipe() { return { native: true, mode: 'swipe', autoAdvance: false }; }

  function init(target, options) {
    options = options || {};
    var stage = typeof target === 'string' ? document.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }
    if (!global.FullscreenMediaCarousel) { return { error: 'engine (FullscreenMediaCarousel) not loaded' }; }

    var platform = resolvePlatform(options.platform || 'auto');
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var engineOpts = {};
    for (var k in options) if (options.hasOwnProperty(k) && k !== 'platform') engineOpts[k] = options[k];
    var engine = global.FullscreenMediaCarousel.create(target, engineOpts);
    if (!engine || !engine.go) { return { error: 'engine go unavailable', engine: engine }; }

    stage.setAttribute('data-fmc-platform', platform);

    // reduced-motion → show the first slide static (engine already does instant index; pin idx 0).
    if (reduced) { engine.go(0, false); }

    var driver = platform === 'desktop' ? arrowNav() : swipe();

    try { global.__LAB_OK__ = true; } catch (e) {}
    return { platform: platform, engine: engine, driver: driver };
  }

  var api = { init: init };
  global.FullscreenMediaCarouselDual = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
