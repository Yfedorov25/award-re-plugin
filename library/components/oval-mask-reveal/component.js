/* ============================================================
   OVAL-MASK-REVEAL · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   r1864's section media-reveal — an ARCHED / OVAL mask over a photo that REVEALS by ANIMATING
   the mask GEOMETRY on section enter: it starts as a thin centred vertical SLIT and GROWS
   outward into a full arch (rounded/pointed top + oval-soft bottom), unveiling the photo within;
   the media does a gentle parallax inside. A kicker + serif title settle over/under it. The
   "a window opens onto the surroundings" reveal. Harvested from D_r1864 (r18644 /location
   ОКРУЖЕНИЕ; the heritage arched-window imagery).

   Distinct from oval-mask (EVER): that mask shape is STATIC (media parallaxes inside a fixed
   oval). HERE the mask GEOMETRY itself animates open (slit -> arch) as the reveal — the
   animated counterpart.

   THE MOVE (scroll-into-view, progress p 0..1) — set(p), PURE scrub:
     - mask opens in two overlapping stages via clip-path inset with rounded corners:
         stage 1 (0..0.55): horizontal slit -> full width (inset left/right 50%->0)
         stage 2 (0.20..0.85): vertical    -> full height (inset top/bottom; bottom lags = a rising arch)
       the TOP corners stay strongly rounded (the arch); the bottom corners soft (oval)
     - inner media: scale 1.12 -> 1 (settle) + a small parallax yPercent as it reveals
     - kicker: fade 0.55..0.75 ; title: fade + translateY 26->0 over 0.65..1.0
   owns_pin OPTIONAL.

   CONFIG-DRIVEN:
     OvalMaskReveal.create(target, {               // target = .omr-stage
       start: 'top 76%', archTop: 48, archBottom: 14, mediaScaleFrom: 1.12,
       parallax: 6, duration: 1.1, ease: 'power3.out', once: true, pin: false, manageLenis: true
     })
   archTop/archBottom = corner-radius % (top = the arch crown, bottom = the oval foot).
   Markup: .omr-stage > .omr-frame ( .omr-media > img/video ) + .omr-kicker + .omr-title.
   Returns { trigger, set(p), play(), destroy }.

   ENGINE LAWS: clip-path(inset round) + transform + opacity only; GPU; NO mix-blend; NO WebGL;
   reduced-motion / <=820px -> shown (mask open, no parallax). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      start: options.start || 'top 76%',
      archTop: options.archTop != null ? options.archTop : 48,
      archBottom: options.archBottom != null ? options.archBottom : 14,
      mediaScaleFrom: options.mediaScaleFrom != null ? options.mediaScaleFrom : 1.12,
      parallax: options.parallax != null ? options.parallax : 6,
      duration: options.duration != null ? options.duration : 1.1,
      ease: options.ease || 'power3.out',
      once: options.once !== false,
      pin: !!options.pin,
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var frame = stage.querySelector('.omr-frame');
    var media = stage.querySelector('.omr-media');
    var kicker = stage.querySelector('.omr-kicker');
    var title = stage.querySelector('.omr-title');
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function efOut(t) { return opt.ease === 'expo.out' ? (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) : 1 - Math.pow(1 - t, 3); }
    function sub01(p, a, b) { return clamp01((p - a) / (b - a)); }

    // build a clip-path inset() with per-corner rounding: arch = big TOP radii, soft BOTTOM radii.
    // openX 0..1 = horizontal openness, openTop 0..1, openBottom 0..1
    function clipFor(openX, openTop, openBottom) {
      var lr = ((1 - openX) * 50).toFixed(2) + '%';      // left & right inset
      var t = ((1 - openTop) * 50).toFixed(2) + '%';     // top inset
      var b = ((1 - openBottom) * 50).toFixed(2) + '%';  // bottom inset
      // rounded: top-left top-right bottom-right bottom-left
      var rt = opt.archTop + '%';
      var rb = opt.archBottom + '%';
      return 'inset(' + t + ' ' + lr + ' ' + b + ' ' + lr + ' round ' + rt + ' ' + rt + ' ' + rb + ' ' + rb + ')';
    }

    function apply(p) {
      p = clamp01(p);
      var openX = efOut(sub01(p, 0.0, 0.55));
      var openTop = efOut(sub01(p, 0.20, 0.78));
      var openBottom = efOut(sub01(p, 0.30, 0.85)); // bottom lags -> a rising-arch feel
      if (frame) {
        var c = clipFor(openX, openTop, openBottom);
        frame.style.clipPath = c; frame.style.webkitClipPath = c;
      }
      if (media) {
        var mp = efOut(sub01(p, 0.0, 0.85));
        var sc = opt.mediaScaleFrom + (1 - opt.mediaScaleFrom) * mp;
        var py = (1 - mp) * opt.parallax; // small downward settle
        media.style.transform = 'scale(' + sc.toFixed(4) + ') translateY(' + py.toFixed(2) + '%)';
      }
      if (kicker) kicker.style.opacity = efOut(sub01(p, 0.55, 0.75)).toFixed(3);
      if (title) {
        var tp = efOut(sub01(p, 0.65, 1.0));
        title.style.opacity = tp.toFixed(3);
        title.style.transform = 'translateY(' + ((1 - tp) * 26).toFixed(1) + 'px)';
      }
    }
    apply(0);

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      stage.classList.add('omr-static'); apply(1);
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { static: true, set: apply, play: function () { apply(1); }, destroy: function () {} };
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

    var played = false;
    var conf = {
      trigger: stage, start: opt.start,
      onEnter: function () {
        if (played && opt.once) return; played = true;
        var o = { p: 0 };
        gsap.to(o, { p: 1, duration: opt.duration, ease: 'none', onUpdate: function () { apply(o.p); } });
      },
      onLeaveBack: opt.once ? null : function () { played = false; apply(0); }
    };
    if (opt.pin) { conf.pin = stage; conf.start = 'top top'; conf.end = '+=' + (global.innerHeight || 800); conf.pinSpacing = true; }
    var trigger = ScrollTrigger.create(conf);

    stage.classList.add('omr-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, set: apply, play: function () { apply(1); },
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.OvalMaskReveal = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
