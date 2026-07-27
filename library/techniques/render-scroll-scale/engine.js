/* ============================================================
   RENDER-SCROLL-SCALE · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   The bare hero LAYER that breathes: a fixed clipping FRAME holding ONE full-bleed render
   (<img>/<video>). As progress goes 0 -> 1 the render SCALES scaleFrom -> scaleTo (a
   scroll-scrubbed push-in) with an optional small translateY drift; the frame is overflow:hidden
   so the scene grows but the frame box stays put — GPU-only (transform). This is the reusable
   "the hero image pushes as you scroll" primitive that several hero variants (wordmark-docks,
   split-word) compose in BEHIND their copy.

   Distinct from scroll-zoom-image-pair: THAT owns a 2-column L/R layout + a serif copy reveal
   (a section block). THIS is a bare scalable render layer with no copy and no layout — a hero
   background that other atoms stack a wordmark / split-word over.

   THE MOVE:
     - set(p) is PURE: render scale = scaleFrom + p*(scaleTo - scaleFrom); optional translateY
       drift = (p - 0.5) * 2 * drift. No side effects beyond transform on the render. Reversible.
     - by default this layer is driven by the HOST hero's pin/scrub (call set(p) from the host).
       Pass selfTrigger:true to own a plain (NOT pinned) ScrollTrigger over its own pass.

   CONFIG-DRIVEN:
     RenderScrollScale.create(target, {        // target = .rss-frame (overflow:hidden)
       scaleFrom: 1.0, scaleTo: 1.12, originY: '50%', drift: 0, ease: 'none',
       selfTrigger: false, start: 'top bottom', end: 'bottom top', manageLenis: false
     })
   Markup: .rss-frame > img.rss-render (or video.rss-render). Returns { set(p), trigger, destroy }.

   ENGINE LAWS: transform scale/translateY (the render) + overflow clip (the frame) only; GPU;
   NO mix-blend / NO backdrop / NO canvas / NO video.currentTime scrub; NO animating
   width/height/top/left/margin; NO WebGL. owns_pin false. reduced-motion / <=820px -> static
   (render at scaleFrom). DECODE-GUARD: the render is force-decoded before __LAB_OK__ so a hidden
   <img> never black-flickers on first paint. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      scaleFrom: options.scaleFrom != null ? options.scaleFrom : 1.0,
      scaleTo: options.scaleTo != null ? options.scaleTo : 1.12,
      originY: options.originY || '50%',
      drift: options.drift != null ? options.drift : 0,
      ease: options.ease || 'none',
      selfTrigger: options.selfTrigger === true,
      start: options.start || 'top bottom',
      end: options.end || 'bottom top',
      manageLenis: options.manageLenis === true
    };
    var frame = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!frame) { markReady(); return { error: 'no target' }; }

    var render = frame.querySelector('.rss-render') ||
      frame.querySelector('img,video') || frame.firstElementChild;
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // forceMotion (dual-platform): the dual wrapper drives set(p) itself, so skip the
    // narrow static-lock and keep the live scale on phones.
    var narrow = !options.forceMotion && global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

    // PURE function of progress 0..1 — reversible, only transform on the render.
    function apply(p) {
      p = clamp01(p);
      if (!render) return;
      var sc = opt.scaleFrom + p * (opt.scaleTo - opt.scaleFrom);
      var ty = opt.drift ? (p - 0.5) * 2 * opt.drift : 0;
      render.style.transform = 'translateY(' + ty.toFixed(1) + 'px) scale(' + sc.toFixed(4) + ')';
    }

    // DECODE-GUARD: never reveal an undecoded <img> (= black flicker). Force-decode first.
    function decodeThen(cb) {
      if (render && render.tagName === 'IMG') {
        var done = function () { cb(); };
        if (render.decode) { render.decode().then(done, done); }
        else if (render.complete) { done(); }
        else { render.addEventListener('load', done, { once: true });
               render.addEventListener('error', done, { once: true }); }
      } else { cb(); }
    }

    function markReady() { try { global.__LAB_OK__ = true; } catch (e) {} }

    if (render) { render.style.transformOrigin = '50% ' + opt.originY; }
    apply(0);

    // reduced-motion / narrow -> static layer at scaleFrom, still decode-guarded.
    if (reduced || narrow || !gsap || !ScrollTrigger) {
      frame.classList.add('rss-static'); apply(0);
      decodeThen(markReady);
      return { static: true, set: apply, destroy: function () {} };
    }

    gsap.registerPlugin(ScrollTrigger);
    gsap.ticker.lagSmoothing(0);

    var lenis = null;
    if (opt.manageLenis && Lenis) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      global.__lenis = lenis;
    }

    // by default this is a host-driven layer (host calls set(p)); selfTrigger gives it its own
    // plain (NOT pinned) scrub over its natural pass through the viewport.
    var scrub = null;
    if (opt.selfTrigger) {
      scrub = ScrollTrigger.create({
        trigger: frame, start: opt.start, end: opt.end, scrub: true,
        onUpdate: function (self) { apply(self.progress); }
      });
    }

    function onResize() { ScrollTrigger.refresh(); }
    global.addEventListener('resize', onResize);

    frame.classList.add('rss-ready');
    decodeThen(markReady);
    return {
      set: apply, trigger: scrub, lenis: lenis,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () {
        if (scrub) scrub.kill();
        if (lenis) lenis.destroy();
        global.removeEventListener('resize', onResize);
        if (render) render.style.willChange = '';
      }
    };
  }

  var api = { create: create };
  global.RenderScrollScale = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
