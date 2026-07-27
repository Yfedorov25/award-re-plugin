/* ============================================================
   SPLIT-WORD-HEADLINE · component.js  (DUAL-PLATFORM wrapper)
   ------------------------------------------------------------
   Springs' per-word headline reveal: each WORD rises from under its own
   overflow:hidden clip (yPercent 120 → 0) + fades, staggered in a wave.

   🔴 DUAL-PLATFORM — the reveal MECHANIC is identical; the TRIGGER differs:

     desktop  →  scrollReveal()  — the per-word cascade is SCRUBBED by scroll
                 progress as the headline enters (scroll-linked, reversible).
                 Springs desktop: the title resolves as you scroll into it.

     mobile   →  autoReveal()    — the cascade PLAYS ONCE on its own over time
                 when the headline mounts (auto-play, no scroll needed), matching
                 springs mobile where the hero title animates in on load.

   Both branches drive the SAME pure `set(p)` (0..1) that the engine exposes — only
   the source of p differs (scroll position vs. a timed tween). See meta.json{differs}.

   Engine: engine.js (proven component, trigger:'progress' so WE own the driver).
   Entry:  SplitWordHeadlineDual.init(target, opts) -> { platform, engine, driver }
   opts.platform 'auto'|'desktop'|'mobile'. Other opts pass through to the engine.
   ============================================================ */
(function (global) {
  'use strict';

  function resolvePlatform(opt) {
    if (opt === 'desktop' || opt === 'mobile') return opt;
    var isDesktop = global.matchMedia && global.matchMedia('(min-width:1024px)').matches;
    return isDesktop ? 'desktop' : 'mobile';
  }

  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  // overshoot (back-out): travels slightly past 1 then settles — spring feel for the
  // per-word rise (springs mobile act-word = overshoot-settle, T-OVERSHOOT-SERIF).
  function overshoot(t) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }

  /* DESKTOP: p = scroll progress of the headline through the viewport */
  function scrollReveal(stage, engine) {
    function onScroll() {
      var r = stage.getBoundingClientRect();
      var vh = global.innerHeight || 800;
      // headline top at 100% of viewport → p=0 (hidden, below fold); at 45% → p=1 (revealed).
      var p = (vh * 1.0 - r.top) / (vh * 0.55);
      engine.set(Math.max(0, Math.min(1, p)));
    }
    onScroll();
    global.addEventListener('scroll', onScroll, { passive: true });
    global.addEventListener('resize', onScroll);
    return { onScroll: onScroll };
  }

  /* MOBILE: reveal ONCE when the headline enters the viewport, with OVERSHOOT-settle
     (spring feel) — springs mobile act-word overshoots past target then settles back.
     Not a scroll-scrub (a short headline has no scrub room), not an ambient timer —
     tied to entering view, like the act appearing. (T-OVERSHOOT-SERIF.) */
  function revealOnView(stage, engine, playMs) {
    var played = false, raf = 0;
    function play() {
      if (played) return; played = true;
      var t0 = null;
      function frame(now) {
        if (t0 === null) t0 = now;
        var p = Math.min(1, (now - t0) / playMs);
        engine.set(overshoot(p));   // travels slightly past then settles
        if (p < 1) raf = global.requestAnimationFrame(frame);
      }
      raf = global.requestAnimationFrame(frame);
    }
    if (global.IntersectionObserver) {
      var io = new global.IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { play(); io.disconnect(); }
      }, { threshold: 0.3 });
      io.observe(stage);
    } else { play(); }
    return { stop: function () { if (raf) global.cancelAnimationFrame(raf); } };
  }

  function init(target, options) {
    options = options || {};
    var stage = typeof target === 'string' ? document.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }
    if (!global.SplitWordHeadline) { return { error: 'engine (SplitWordHeadline) not loaded' }; }

    var platform = resolvePlatform(options.platform || 'auto');
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // create the engine in progress mode so WE own the driver on both platforms
    var engineOpts = {};
    for (var k in options) if (options.hasOwnProperty(k) && k !== 'platform' && k !== 'playMs') engineOpts[k] = options[k];
    engineOpts.trigger = 'progress';
    // the original engine disables travel <=560px (it had no mobile branch); OUR mobile
    // branch drives an auto-play, so force the motion on. reduced-motion stays honored.
    if (platform === 'mobile' && !reduced) engineOpts.forceMotion = true;
    var engine = global.SplitWordHeadline.create(target, engineOpts);

    stage.setAttribute('data-swh-platform', platform);

    var driver = null;
    if (reduced) {
      engine.set(1); // all words shown, no travel
    } else if (platform === 'desktop') {
      driver = scrollReveal(stage, engine);
    } else {
      driver = revealOnView(stage, engine, options.playMs != null ? options.playMs : 1100);
    }

    try { global.__LAB_OK__ = true; } catch (e) {}
    return { platform: platform, engine: engine, driver: driver };
  }

  var api = { init: init };
  global.SplitWordHeadlineDual = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
