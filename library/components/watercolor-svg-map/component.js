/* ============================================================
   WATERCOLOR-SVG-MAP · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   Springs' LOCATION beat — a CREAM watercolor-style district map (inline SVG: soft
   park blobs, a blue river, thin roads) rises from below over a dark leaf bg, then
   PINS. Over it: a dark teardrop brand PIN (.cui-pin) and circular POI chips
   (.cui-poi) on absolute positions, dark-on-cream — the site's one inverted-contrast,
   lightest beat. Harvested from D_springs_walkthrough S12 (f163->f185) + SEAM-09.

   THE MOVE: as the section enters, the cream map panel slides UP from below (rise-over
   the dark bg) and settles; while pinned, the pin + POI chips fade/rise in on the
   settled map. NO WebGL, NO Google Maps — the map is hand-authored inline SVG, the
   chips are positioned DOM. Scroll-scrubbed along the pin, reversible.

   CONFIG-DRIVEN:
     WatercolorMap.init(target, {
       rise: 0.45,          // fraction of the scrub spent on the map rising (then pin+POI settle)
       pinFactor: 1.0,      // pin length = innerHeight*pinFactor
       lerp: 0.1, manageLenis: true
     })
   Markup: .wm-stage > .wm-bg(dark leaf) + .wm-panel(the cream SVG map) where
   .wm-panel contains <svg class="wm-map"> + [.wm-poi (a .cui-pin / .cui-poi placed by
   left/top)]. The map art + POI positions are composition; the engine drives the
   rise + the pin/POI reveal.

   ENGINE LAWS: Lenis -> gsap.ticker -> ScrollTrigger.update; lagSmoothing(0);
   render(prog) PURE; pin/scrub; transform + opacity only; GPU layers; NO mix-blend /
   NO backdrop over the scrubbed surface; NO WebGL; reduced-motion / <=820px -> static
   (map settled, pin + POI shown). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';

  function init(target, options) {
    options = options || {};
    var opt = {
      rise: options.rise != null ? options.rise : 0.45,
      pinFactor: options.pinFactor != null ? options.pinFactor : 1.0,
      lerp: options.lerp != null ? options.lerp : 0.1,
      manageLenis: options.manageLenis !== false
    };

    var stage = typeof target === 'string' ? document.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    var panel = stage.querySelector('.wm-panel');
    var pois = [].slice.call(stage.querySelectorAll('.wm-poi'));

    // static fallback: map settled, pin + POI shown
    function poseStatic() {
      if (panel) { panel.style.transform = 'translateY(0)'; panel.style.opacity = '1'; }
      pois.forEach(function (p) { p.style.opacity = '1'; p.style.transform = 'translateY(0)'; });
    }
    if (reduced || narrow || !gsap || !ScrollTrigger || !Lenis || !panel) {
      stage.classList.add('wm-static');
      poseStatic();
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { static: true, destroy: function () {} };
    }

    gsap.registerPlugin(ScrollTrigger);
    gsap.ticker.lagSmoothing(0);

    var lenis = null;
    if (opt.manageLenis) {
      lenis = new Lenis({ lerp: opt.lerp, smoothWheel: true, wheelMultiplier: 1 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      global.__lenis = lenis;
    }

    panel.style.willChange = 'transform, opacity';
    pois.forEach(function (p) { p.style.willChange = 'transform, opacity'; });

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

    // PURE render(prog):
    //  0..rise  -> the cream map slides up from below (translateY 100% -> 0) + fades in
    //  rise..1  -> the pin + POI chips rise/fade in, staggered, on the settled map
    function render(prog) {
      var rise = clamp01(prog / opt.rise);                 // 0..1 over the first leg
      panel.style.transform = 'translateY(' + ((1 - rise) * 100).toFixed(2) + '%)';
      panel.style.opacity = (0.2 + 0.8 * rise).toFixed(3);

      var settle = clamp01((prog - opt.rise) / (1 - opt.rise)); // 0..1 over the back leg
      var n = pois.length || 1;
      for (var i = 0; i < pois.length; i++) {
        // staggered: each POI gets a slice of the back leg
        var start = i / (n + 1);
        var local = clamp01((settle - start) / (1 - start));
        pois[i].style.opacity = local.toFixed(3);
        pois[i].style.transform = 'translateY(' + ((1 - local) * 12).toFixed(2) + 'px)';
      }
    }

    var trigger = ScrollTrigger.create({
      trigger: stage, start: 'top top',
      end: function () { return '+=' + Math.round(global.innerHeight * opt.pinFactor); },
      pin: true, pinSpacing: true, scrub: true,
      onUpdate: function (self) { render(self.progress); }
    });
    render(0);

    global.addEventListener('resize', function () { ScrollTrigger.refresh(); });
    stage.classList.add('wm-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, render: render,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { init: init };
  global.WatercolorMap = api;
  global.watercolorMap = function (t, o) { return init(t, o); };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
