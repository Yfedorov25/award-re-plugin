/* ============================================================
   BRAND-OVERLAY-CROSSFADE · component.js  (DUAL-PLATFORM wrapper)
   ------------------------------------------------------------
   Springs' brand-tinted reveal: a full-bleed photo sits under a brand-colour WASH
   whose opacity drains wash→0, so the photo gets a brief "brand tint" beat before it
   resolves to full colour. Pure render(prog): wash opacity = wash*(1-prog).

   🔴 DUAL-PLATFORM — desktop and mobile use DIFFERENT seam mechanics (this is how
   Springs itself behaves — D_SPRINGS_video: the доводчик акт→акт splits by boundary):

     desktop  →  scrollPush()   — the SEAM-07 доводчик: a SECOND full-bleed photo is
                 PUSHED OVER the first from below, over-travels past its target and
                 settles back (magnetic overshoot). render(prog) = translateY of the
                 next layer, SCRUBBED by scroll while the frame pins (reversible).
                 Springs desktop resolves acts with push-over смугою + settle.

     mobile   →  autoDrain()    — on a narrow screen the side/bottom push вріз reads
                 unnatural, so Springs mobile replaces it with a long CROSSFADE: the
                 brand wash drains wash→0 over time on mount (opacity-tween 0.6-0.8s,
                 no вріз). This is the audited mobile behaviour, not a guess.

   Same engine, TWO modes: mode:'push' (desktop, next-layer translateY) vs mode:'wash'
   (mobile, wash*(1-prog)) — both via manualDrive (no engine ScrollTrigger). The
   difference is empirical (D_SPRINGS_video seam table). See meta.json{differs}.

   Engine: engine.js (proven; manualDrive exposes render without its own pin).
   Entry:  BrandOverlayCrossfadeDual.init(target, opts) -> { platform, engine, driver }
   ============================================================ */
(function (global) {
  'use strict';

  function resolvePlatform(opt) {
    if (opt === 'desktop' || opt === 'mobile') return opt;
    var isDesktop = global.matchMedia && global.matchMedia('(min-width:1024px)').matches;
    return isDesktop ? 'desktop' : 'mobile';
  }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

  /* DESKTOP: prog = scroll progress of the stage across a pin-length span.
     In push-mode engine.render(prog) drives the next-layer translateY (push-over). */
  function scrollPush(stage, engine) {
    // the stage is position:sticky inside a tall pin-wrap; read progress from the wrap
    // so the frame stays pinned while the next photo pushes over it (it does NOT scroll away).
    var pin = stage.closest('.pin-wrap') || stage.parentElement || stage;
    function onScroll() {
      var r = pin.getBoundingClientRect();
      var vh = global.innerHeight || 800;
      var span = (pin.offsetHeight - vh) || vh;
      var prog = (-r.top) / span;
      engine.render(Math.max(0, Math.min(1, prog)));
    }
    onScroll();
    global.addEventListener('scroll', onScroll, { passive: true });
    global.addEventListener('resize', onScroll);
    return { onScroll: onScroll };
  }

  /* MOBILE: prog ramps 0→1 once over drainMs on mount */
  function autoDrain(engine, drainMs) {
    var t0 = null, raf = 0;
    function frame(now) {
      if (t0 === null) t0 = now;
      var p = Math.min(1, (now - t0) / drainMs);
      engine.render(ease(p));
      if (p < 1) raf = global.requestAnimationFrame(frame);
    }
    raf = global.requestAnimationFrame(frame);
    return { stop: function () { if (raf) global.cancelAnimationFrame(raf); } };
  }

  function init(target, options) {
    options = options || {};
    var stage = typeof target === 'string' ? document.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }
    if (!global.BrandOverlayCrossfade) { return { error: 'engine (BrandOverlayCrossfade) not loaded' }; }

    var platform = resolvePlatform(options.platform || 'auto');
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // desktop = push-over (mode:'push'), mobile = wash-crossfade (mode:'wash')
    var mode = platform === 'desktop' ? 'push' : 'wash';

    // build the engine in manualDrive so WE own the driver on both platforms
    var engineOpts = { manualDrive: true, forceMotion: true, mode: mode };
    for (var k in options) if (options.hasOwnProperty(k) && k !== 'platform' && k !== 'drainMs' && k !== 'mode') engineOpts[k] = options[k];
    var engine = global.BrandOverlayCrossfade.init(target, engineOpts);
    if (!engine || !engine.render) { return { error: 'engine render unavailable', engine: engine }; }

    stage.setAttribute('data-boc-platform', platform);
    stage.setAttribute('data-boc-mode', mode);

    var driver = null;
    if (reduced) {
      engine.render(1); // fully resolved (desktop: next photo settled in; mobile: no tint)
    } else if (platform === 'desktop') {
      driver = scrollPush(stage, engine);
    } else {
      driver = autoDrain(engine, options.drainMs != null ? options.drainMs : 1500);
    }

    try { global.__LAB_OK__ = true; } catch (e) {}
    return { platform: platform, engine: engine, driver: driver };
  }

  var api = { init: init };
  global.BrandOverlayCrossfadeDual = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
