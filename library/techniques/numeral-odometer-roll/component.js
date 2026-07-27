/* ============================================================
   NUMERAL-ODOMETER-ROLL · component.js  (DUAL-PLATFORM wrapper)
   ------------------------------------------------------------
   Springs' number ODOMETER: a vertical strip of numerals inside a one-number-tall
   overflow:hidden window; the column translateY so the active value sits in frame —
   the number ROLLS (old slides up/out, new rolls up from below). Pure set(p) across
   the value sequence. (This engine owns_pin:FALSE and has NO narrow-guard — set(p)
   is pure translateY at any width, so NO engine patch is needed.)

   🔴 DUAL-PLATFORM (corrected S19g — springs mobile number is a ONE-SHOT counter-
      settle on scroll-into-view, a rhythm-beat between acts, NOT an endless cycle):

     desktop  →  scrollRoll()   — set(p) scrubbed by scroll (reversible).

     mobile   →  settleOnView() — set(p) rolls 0→1 ONCE when the number scrolls into
                 view (counter-settle, eased), then rests. Not a loop, not a timer-only
                 ambient — it's tied to entering the viewport. Springs = T-ACTNUM-COUNTER.

   Both branches drive the SAME pure set(p) — only the source of p differs.
   Entry: NumeralOdometerRollDual.init(target, opts) -> { platform, engine, driver }.
   ============================================================ */
(function (global) {
  'use strict';

  function resolvePlatform(opt) {
    if (opt === 'desktop' || opt === 'mobile') return opt;
    var isDesktop = global.matchMedia && global.matchMedia('(min-width:1024px)').matches;
    return isDesktop ? 'desktop' : 'mobile';
  }

  /* DESKTOP: p = scroll progress of the stage across a span */
  function scrollRoll(stage, engine) {
    function onScroll() {
      var r = stage.getBoundingClientRect();
      var vh = global.innerHeight || 800;
      var p = (vh * 0.7 - r.top) / (vh * 0.7);
      engine.set(Math.max(0, Math.min(1, p)));
    }
    onScroll();
    global.addEventListener('scroll', onScroll, { passive: true });
    global.addEventListener('resize', onScroll);
    return { onScroll: onScroll };
  }

  /* MOBILE: one-shot counter-settle — roll 0→1 ONCE when the number enters the
     viewport, then rest (a rhythm-beat, T-ACTNUM-COUNTER). Not a loop. */
  function settleOnView(stage, engine, rollMs) {
    var played = false, raf = 0;
    function playOnce() {
      if (played) return; played = true;
      var t0 = null;
      function frame(now) {
        if (t0 === null) t0 = now;
        var p = Math.min(1, (now - t0) / rollMs);
        var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        engine.set(e);
        if (p < 1) raf = global.requestAnimationFrame(frame);
      }
      raf = global.requestAnimationFrame(frame);
    }
    if (global.IntersectionObserver) {
      var io = new global.IntersectionObserver(function (ents) {
        if (ents.some(function (e) { return e.isIntersecting; })) { playOnce(); io.disconnect(); }
      }, { threshold: 0.4 });
      io.observe(stage);
    } else { playOnce(); }
    return { stop: function () { if (raf) global.cancelAnimationFrame(raf); } };
  }

  function init(target, options) {
    options = options || {};
    var stage = typeof target === 'string' ? document.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }
    if (!global.NumeralOdometerRoll) { return { error: 'engine (NumeralOdometerRoll) not loaded' }; }

    var platform = resolvePlatform(options.platform || 'auto');
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var engineOpts = {};
    for (var k in options) if (options.hasOwnProperty(k) && k !== 'platform' && k !== 'rollMs') engineOpts[k] = options[k];
    var engine = global.NumeralOdometerRoll.create(target, engineOpts);
    if (!engine || !engine.set) { return { error: 'engine set unavailable', engine: engine }; }

    stage.setAttribute('data-nor-platform', platform);

    var driver = null;
    if (reduced) {
      engine.set(1); // rest on the final value
    } else if (platform === 'desktop') {
      driver = scrollRoll(stage, engine);
    } else {
      driver = settleOnView(stage, engine, options.rollMs != null ? options.rollMs : 900);
    }

    try { global.__LAB_OK__ = true; } catch (e) {}
    return { platform: platform, engine: engine, driver: driver };
  }

  var api = { init: init };
  global.NumeralOdometerRollDual = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
