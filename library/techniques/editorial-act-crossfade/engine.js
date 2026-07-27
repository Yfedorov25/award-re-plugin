/* ============================================================
   EDITORIAL-ACT-CROSSFADE · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   11tanjung's editorial acts — a SINGLE pinned scroll-progress drives N "acts" that
   cross-fade through 4 synchronized layers at once:
     1) a full-bleed IMAGE that push-zooms scale(1 -> 1.12) across its own window and
        cross-fades (opacity) into the next act's image at the window boundary,
     2) a SPLIT-WORD HEADLINE on a 3-cell grid — two fixed italic words (left-mid,
        right-mid) + a large CENTRE word that SWAPS per act (opacity crossfade),
     3) a small TOPLINE label that swaps per act,
     4) a BODY paragraph that cross-fades per act.
   Harvested from D_11tanjung (C2 editorial-act-crossfade + C3 split-word-headline;
   "Live with Standard -> Style -> Uncompromised", ~3-3.5s scroll per act).

   THE MOVE (one pinned scroll-scrub, progress p 0..1, acts = N):
     - act index a = floor(p * N), local t = fract(p * N) (0..1 inside the act)
     - image[a]: opacity 1, scale (1 + t*0.12); the NEXT image cross-fades in over the
       last `xfade` of the window (image[a] opacity 1->0, image[a+1] 0->1)
     - centre word / topline / body for act a: visible; cross-fade to act a+1 on the seam
     - the two fixed words (left-mid, right-mid) never change (the grid is the constant)

   CONFIG-DRIVEN:
     EditorialActCrossfade.create(target, {     // target = .eac-stage
       xfade: 0.28,        // fraction of each act's window used for the crossfade tail
       zoom: 0.12,         // push-zoom amount per act (scale 1 -> 1+zoom)
       pinFactor: 3.0,     // pinned span = innerHeight * pinFactor (≈ 1 viewport per act)
       ease: 'power2.out', manageLenis: true
     })
   Markup: .eac-stage > .eac-images(.eac-img[data-act] x N img) +
           .eac-headline(.eac-fixed--l, .eac-centre(.eac-word[data-act] x N), .eac-fixed--r) +
           .eac-toplines(.eac-topline[data-act] x N) + .eac-bodies(.eac-body[data-act] x N).
   Returns { trigger, set(p), destroy }.

   ENGINE LAWS: opacity (crossfade) + transform scale (push-zoom) only; GPU; NO
   mix-blend / NO backdrop over the scrubbed images; NO WebGL; reduced-motion / <=820px
   -> first act shown static. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      xfade: options.xfade != null ? options.xfade : 0.28,
      zoom: options.zoom != null ? options.zoom : 0.12,
      pinFactor: options.pinFactor != null ? options.pinFactor : 3.0,
      ease: options.ease || 'power2.out',
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var images = [].slice.call(stage.querySelectorAll('.eac-img'));
    var words = [].slice.call(stage.querySelectorAll('.eac-centre .eac-word'));
    var toplines = [].slice.call(stage.querySelectorAll('.eac-topline'));
    var bodies = [].slice.call(stage.querySelectorAll('.eac-body'));
    var N = Math.max(images.length, words.length, 1);
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = !options.forceMotion && global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function efOut(t) { return opt.ease === 'expo.out' ? (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) : 1 - Math.pow(1 - t, 2); }

    // opacity of layer `i` given the global progress p (0..1) across N acts.
    // each act owns a window of width 1/N; the last `xfade` of a window cross-fades
    // act i -> act i+1.
    function layerOpacity(i, p) {
      var pos = p * N;                 // 0..N
      var a = Math.min(N - 1, Math.floor(pos));
      var t = pos - a;                 // 0..1 inside act a
      if (i === a) {
        // current act: full until the crossfade tail, then fades out (unless last act)
        if (a === N - 1) return 1;
        var into = (t - (1 - opt.xfade)) / opt.xfade; // 0..1 over the tail
        return into <= 0 ? 1 : 1 - efOut(clamp01(into));
      }
      if (i === a + 1) {
        // next act: fades in over the tail of act a
        var into2 = (t - (1 - opt.xfade)) / opt.xfade;
        return into2 <= 0 ? 0 : efOut(clamp01(into2));
      }
      return 0;
    }

    // push-zoom scale of image `i` — only meaningful while it's the live act; it ramps
    // 1 -> 1+zoom across its own window, and the incoming image starts at 1.
    function imageScale(i, p) {
      var pos = p * N, a = Math.min(N - 1, Math.floor(pos)), t = pos - a;
      if (i === a) return 1 + opt.zoom * t;
      if (i === a + 1) {
        var into = (t - (1 - opt.xfade)) / opt.xfade;
        return 1 + opt.zoom * (opt.xfade ? clamp01(into) * 0 : 0); // incoming starts at 1
      }
      return 1;
    }

    function apply(p) {
      p = clamp01(p);
      images.forEach(function (el, i) {
        el.style.opacity = layerOpacity(i, p).toFixed(3);
        el.style.transform = 'scale(' + imageScale(i, p).toFixed(4) + ')';
      });
      words.forEach(function (el, i) { el.style.opacity = layerOpacity(i, p).toFixed(3); });
      toplines.forEach(function (el, i) { el.style.opacity = layerOpacity(i, p).toFixed(3); });
      bodies.forEach(function (el, i) { el.style.opacity = layerOpacity(i, p).toFixed(3); });
    }
    apply(0);

    if (!options.manualDrive && (reduced || narrow || !gsap || !ScrollTrigger)) {
      stage.classList.add('eac-static'); apply(0);
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { static: true, set: apply, destroy: function () {} };
    }

    // manualDrive (dual-platform): expose set() without the engine's own pin/ScrollTrigger.
    if (options.manualDrive) {
      apply(0); try { global.__LAB_OK__ = true; } catch (e) {}
      return { manual: true, set: apply, acts: N, count: N, destroy: function () {} };
    }

    if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (gsap && gsap.ticker) gsap.ticker.lagSmoothing(0);
    var lenis = null;
    if (opt.manageLenis && !options.manualDrive && Lenis && ScrollTrigger) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      global.__lenis = lenis;
    }

    var trigger = ScrollTrigger.create({
      trigger: stage, start: 'top top',
      end: function () { return '+=' + Math.round(global.innerHeight * opt.pinFactor); },
      pin: true, pinSpacing: true, scrub: true,
      onUpdate: function (self) { apply(self.progress); }
    });
    apply(0);

    global.addEventListener('resize', function () { ScrollTrigger.refresh(); });
    stage.classList.add('eac-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, set: apply, acts: N,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.EditorialActCrossfade = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
