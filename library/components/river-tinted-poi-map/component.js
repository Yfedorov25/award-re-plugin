/* ============================================================
   RIVER-TINTED-POI-MAP · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   r1864's drawn location map — the THIRD map dialect in the library. A hand-styled vector
   district map on a warm-taupe/near-black field: a winding slate-blue RIVER band, filled
   green PARK blobs, a thin road network, white LANDMARK GLYPHS with labels (Kremlin, cathedral,
   gallery), terracotta circular POI PINS with white category icons, and a big copper PROJECT
   DISC ("1864 / Софийская наб., 36") at the centre. NOT live Mapbox/Leaflet — inline SVG +
   positioned DOM. Harvested from D_r1864 (r18645 /location drawn map).

   Distinct from line-art-location-map (11tanjung: monochrome line-art, cream-on-brown, leader-
   line POIs) and watercolor-svg-map (Springs: painterly cream colour-blobs that rise+pin). This
   is a TINTED-DARK base + a river band + filled shapes + terracotta pins + landmark glyphs.

   THE MOVE (scroll-into-view reveal, one play):
     - the river path [data-river] draws (stroke-dashoffset) + park/footprint shapes fade in
     - landmark glyphs [data-glyph] fade + rise (small stagger)
     - POI pins [data-poi] pop in (scale 0->1 + opacity) bottom-to-top stagger
     - the project disc [data-disc] scales 0.7->1 + fades, with an optional ring pulse
     - hover a pin -> .is-hot (lift + label brighten)
   set(p) is a PURE scrub of the reveal.

   CONFIG-DRIVEN:
     RiverTintedPoiMap.create(target, {     // target = .rtm-stage
       draw: true, stagger: 0.06, duration: 1.0, ease: 'power2.out',
       start: 'top 78%', once: true, manageLenis: true
     })
   Markup: .rtm-stage > svg.rtm-map ([data-river], .rtm-park, .rtm-road, [data-glyph]) +
   .rtm-pin[data-poi] (icon + label) + .rtm-disc[data-disc]. Returns { trigger, set(p), destroy }.

   ENGINE LAWS: stroke-dashoffset + transform(scale,translateY) + opacity only; GPU; NO
   mix-blend; NO WebGL (hand-styled SVG, not Mapbox); reduced-motion / <=820px -> shown.
   Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      draw: options.draw !== false,
      stagger: options.stagger != null ? options.stagger : 0.06,
      duration: options.duration != null ? options.duration : 1.0,
      ease: options.ease || 'power2.out',
      start: options.start || 'top 78%',
      once: options.once !== false,
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var rivers = [].slice.call(stage.querySelectorAll('[data-river]'));
    var parks = [].slice.call(stage.querySelectorAll('.rtm-park, .rtm-road'));
    var glyphs = [].slice.call(stage.querySelectorAll('[data-glyph]'));
    // POIs sorted bottom-to-top (lowest first)
    var pois = [].slice.call(stage.querySelectorAll('[data-poi]')).sort(function (a, b) {
      return b.getBoundingClientRect().top - a.getBoundingClientRect().top;
    });
    var disc = stage.querySelector('[data-disc]');
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function efOut(t) { return opt.ease === 'expo.out' ? (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) : 1 - Math.pow(1 - t, 2); }

    var lens = [];
    rivers.forEach(function (p) {
      var L = 0; try { L = p.getTotalLength ? p.getTotalLength() : 0; } catch (e) { L = 0; }
      lens.push(L); if (L) { p.style.strokeDasharray = L; p.style.strokeDashoffset = L; }
    });

    function sub01(p, a, b) { return clamp01((p - a) / (b - a)); }

    function apply(p) {
      p = clamp01(p);
      // river draws 0..0.5 ; parks/roads fade 0..0.45
      var rp = efOut(sub01(p, 0.0, 0.5));
      rivers.forEach(function (pa, i) { if (lens[i]) pa.style.strokeDashoffset = (lens[i] * (1 - rp)).toFixed(1); });
      var pk = efOut(sub01(p, 0.0, 0.45));
      parks.forEach(function (el) { el.style.opacity = pk.toFixed(3); });
      // landmark glyphs 0.30..0.70, small stagger
      var Ng = glyphs.length;
      glyphs.forEach(function (g, i) {
        var gs = 0.30 + (i / Math.max(1, Ng)) * 0.25;
        var lp = efOut(sub01(p, gs, gs + 0.22));
        g.style.opacity = lp.toFixed(3);
        g.style.transform = 'translateY(' + ((1 - lp) * 10).toFixed(1) + 'px)';
      });
      // POI pins 0.45..1 ladder bottom-to-top
      var Np = pois.length;
      pois.forEach(function (poi, i) {
        var ps = 0.45 + (i / Math.max(1, Np)) * 0.45;
        var lp = efOut(sub01(p, ps, ps + 0.2));
        poi.style.opacity = lp.toFixed(3);
        poi.style.transform = 'scale(' + (0.5 + lp * 0.5).toFixed(3) + ')';
      });
      // project disc 0.55..0.85, scale + fade
      if (disc) {
        var dp = efOut(sub01(p, 0.55, 0.85));
        disc.style.opacity = dp.toFixed(3);
        disc.style.transform = 'translate(-50%,-50%) scale(' + (0.7 + dp * 0.3).toFixed(3) + ')';
      }
    }
    apply(0);

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      stage.classList.add('rtm-static'); apply(1);
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

    // hover pins
    pois.forEach(function (poi) {
      poi.addEventListener('pointerenter', function () { poi.classList.add('is-hot'); });
      poi.addEventListener('pointerleave', function () { poi.classList.remove('is-hot'); });
    });

    stage.classList.add('rtm-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, set: apply, play: function () { apply(1); },
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.RiverTintedPoiMap = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
