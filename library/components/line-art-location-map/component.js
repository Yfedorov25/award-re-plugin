/* ============================================================
   LINE-ART-LOCATION-MAP · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   11tanjung's WHERE beat — a hand-authored, MONOCHROME line-art district map: thin
   (~1px) cream strokes on a brown field (NO Google / NO Mapbox, NO fills). Inline SVG
   roads draw in (stroke-dashoffset), a target-marker (a ringed dot / crosshair) marks
   the project, and POI labels connected by LEADER-LINES fade + rise in with a
   bottom-to-top STAGGER on scroll-into-view. Harvested from D_11tanjung (D1/D2).

   Distinct from Springs' watercolor-svg-map (a CREAM map with soft colour blobs that
   RISES from below then pins): this is a flat monochrome LINE drawing — strokes draw,
   the target pulses, and POIs ladder up by leader-lines. No rise-over, no fills.

   THE MOVE: on scroll-into-view (one play, reversible if you like):
     - the road paths [data-draw] draw via stroke-dashoffset (length -> 0), power2.out
     - the target-marker [data-target] scales/fades in (its ring can pulse)
     - the POIs [data-poi] (each = a leader-line + a dot + a label) reveal with a
       bottom-to-top stagger: opacity 0->1 + translateY 14px->0, the lowest first.
   set(p 0..1) is a PURE scrub of the whole reveal.

   CONFIG-DRIVEN:
     LineArtLocationMap.create(target, {     // target = .lam-stage (holds an inline <svg> + DOM POIs)
       draw: true,           // draw the road strokes (stroke-dashoffset)
       stagger: 0.09,        // seconds between POIs (bottom-to-top)
       duration: 0.7, ease: 'power2.out',
       start: 'top 78%', once: true, manageLenis: true
     })
   Markup: .lam-stage > svg.lam-map ([data-draw] paths, a [data-target] group) +
           [.lam-poi[data-poi] (a .lam-leader line + .lam-dot + .lam-label)].
   Returns { trigger, play(), set(p), destroy }.

   ENGINE LAWS: stroke-dashoffset (draw) + transform(translateY, scale) + opacity only;
   GPU; NO mix-blend / NO backdrop; NO WebGL; reduced-motion / <=820px -> shown. Sets
   window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      draw: options.draw !== false,
      stagger: options.stagger != null ? options.stagger : 0.09,
      duration: options.duration != null ? options.duration : 0.7,
      ease: options.ease || 'power2.out',
      start: options.start || 'top 78%',
      once: options.once !== false,
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var draws = [].slice.call(stage.querySelectorAll('[data-draw]'));
    // the project marker: either the SVG crosshair [data-target] (default look) OR the
    // street-variant's HTML label-pill .lam-pin. Both reveal the same way.
    var target0 = stage.querySelector('[data-target]');
    var pin = stage.querySelector('.lam-pin');
    // POIs sorted BOTTOM-to-TOP (lowest on screen reveals first)
    var pois = [].slice.call(stage.querySelectorAll('[data-poi]')).sort(function (a, b) {
      return b.getBoundingClientRect().top - a.getBoundingClientRect().top;
    });
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function efOut(t) { return 1 - Math.pow(1 - t, 2); }

    // prime stroke-dashoffset so the roads start undrawn
    var lens = [];
    draws.forEach(function (p) {
      var L = 0;
      try { L = p.getTotalLength ? p.getTotalLength() : 0; } catch (e) { L = 0; }
      lens.push(L);
      if (L) { p.style.strokeDasharray = L; p.style.strokeDashoffset = L; }
    });

    // PURE scrub: p 0 = nothing, p 1 = fully revealed.
    function apply(p) {
      p = clamp01(p);
      // roads draw over the first 55% of the scrub
      var dp = efOut(clamp01(p / 0.55));
      draws.forEach(function (pa, i) {
        if (lens[i]) pa.style.strokeDashoffset = (lens[i] * (1 - dp)).toFixed(1);
      });
      // target marker over 0.30..0.62 (SVG crosshair — scale-in-place via fill-box)
      var tp = efOut(clamp01((p - 0.30) / 0.32));
      if (target0) {
        target0.style.opacity = tp.toFixed(3);
        target0.style.transform = 'scale(' + (0.7 + tp * 0.3).toFixed(3) + ')';
        target0.style.transformOrigin = 'center';
        target0.style.transformBox = 'fill-box';
      }
      // street-variant label-pill marker — same window; HTML element, keep its translate(-50%,-50%)
      if (pin) {
        pin.style.opacity = tp.toFixed(3);
        pin.style.transform = 'translate(-50%,-50%) scale(' + (0.85 + tp * 0.15).toFixed(3) + ')';
      }
      // POIs ladder up over 0.45..1, each in its own window (bottom-to-top)
      var N = pois.length;
      pois.forEach(function (poi, i) {
        var winStart = 0.45 + (i / Math.max(1, N)) * 0.5;
        var local = efOut(clamp01((p - winStart) / 0.22));
        poi.style.opacity = local.toFixed(3);
        poi.style.transform = 'translateY(' + ((1 - local) * 14).toFixed(1) + 'px)';
        var leader = poi.querySelector('.lam-leader');
        if (leader) {
          // leader line grows from its anchored end (scaleY/​scaleX via CSS transform-origin)
          leader.style.transform = 'scaleY(' + local.toFixed(3) + ')';
        }
      });
    }
    apply(0);

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      stage.classList.add('lam-static'); apply(1);
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

    // a timeline that plays once on enter (the reveal), driven by progress so it stays PURE
    var played = false;
    var trigger = ScrollTrigger.create({
      trigger: stage, start: opt.start,
      onEnter: function () {
        if (played && opt.once) return; played = true;
        var o = { p: 0 };
        gsap.to(o, { p: 1, duration: opt.duration + opt.stagger * pois.length, ease: 'none',
          onUpdate: function () { apply(o.p); } });
      },
      onLeaveBack: opt.once ? null : function () { played = false; apply(0); }
    });

    stage.classList.add('lam-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, set: apply,
      play: function () { apply(1); },
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.LineArtLocationMap = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
