/* ============================================================
   VENN-RING-PORTAL-REVEAL · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   11tanjung's signature portal — N outline circles sit in a row (overlapping = a venn).
   On scroll: the SIDE circles do a stroke-width radial fill -> hollow -> shrink to a dot
   and drift to the edges; the CENTRE circle becomes a clip-path: circle(r) mask whose
   radius scrubs 0 -> full, revealing a full-bleed render behind it (+ the render
   counter-scales 1.15 -> 1 as the mask opens). Harvested from D_11tanjung (C1; b024 thin
   rings -> b028 side donuts filled -> b033 side dots + centre portal opening -> b048 full).

   THE MOVE (one pinned scroll-scrub, progress p 0..1):
     - side rings: 0..0.4 fill (stroke grows to a disc), 0.4..1 hollow + shrink + drift out
     - centre: 0..1 clip-path circle radius 0% -> ~150% (covers viewport); render scale 1.15->1
     - the venn-labels (/01 /02 /03 + caption) fade out as the portal opens

   CONFIG-DRIVEN:
     VennRingPortalReveal.create(target, {     // target = .vrp-stage
       rings: 3, fillEnd: 0.4, pinFactor: 1.4, ease: 'power2.out', manageLenis: true
     })
   Markup: .vrp-stage > .vrp-render(img, the portal target) + .vrp-rings(.vrp-ring x N,
   the centre one is .vrp-ring--portal) + [.vrp-labels].
   Returns { trigger, set(p), destroy }.

   ENGINE LAWS: clip-path circle (centre) + stroke-width/border + transform(scale,translate)
   + opacity only; GPU; NO mix-blend / NO backdrop over the scrubbed render; NO WebGL;
   reduced-motion / <=820px -> portal open (render shown). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      fillEnd: options.fillEnd != null ? options.fillEnd : 0.4,
      pinFactor: options.pinFactor != null ? options.pinFactor : 1.4,
      ease: options.ease || 'power2.out',
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var render = stage.querySelector('.vrp-render');
    var rings = [].slice.call(stage.querySelectorAll('.vrp-ring'));
    var portal = stage.querySelector('.vrp-ring--portal') || rings[Math.floor(rings.length / 2)];
    var sideRings = rings.filter(function (r) { return r !== portal; });
    var labels = stage.querySelector('.vrp-labels');
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function efOut(t) { return opt.ease === 'expo.out' ? (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) : 1 - Math.pow(1 - t, 2); }

    // place side rings: remember their resting x to drift them outward
    sideRings.forEach(function (r, i) {
      var rect = r.getBoundingClientRect(), c = stage.getBoundingClientRect();
      r.__cx = (rect.left + rect.width / 2) - (c.left + c.width / 2); // offset from centre
    });

    // p 0 = three thin rings (closed); p 1 = centre portal full (render revealed)
    function apply(p) {
      // side rings: fill (0..fillEnd) then hollow+shrink+drift (fillEnd..1)
      sideRings.forEach(function (r) {
        if (p <= opt.fillEnd) {
          var f = p / opt.fillEnd;                 // 0..1 fill
          r.style.borderWidth = (1 + f * 60).toFixed(1) + 'px'; // stroke grows to a disc
          r.style.transform = 'translateX(0) scale(1)';
          r.style.opacity = '1';
        } else {
          var h = (p - opt.fillEnd) / (1 - opt.fillEnd); // 0..1 hollow+shrink+drift
          var e = efOut(h);
          r.style.borderWidth = (61 - e * 60).toFixed(1) + 'px';  // back to thin
          var sc = 1 - e * 0.85;                                   // shrink to a dot
          var drift = (r.__cx || 0) * e * 0.6;                     // drift outward
          r.style.transform = 'translateX(' + drift.toFixed(1) + 'px) scale(' + Math.max(0.06, sc).toFixed(3) + ')';
          r.style.opacity = (1 - e * 0.55).toFixed(3);
        }
      });
      // centre portal: the RENDER is clipped by a growing circle (radius 0 -> ~85% covers
      // the viewport). The portal RING stays a thin guide that fades as the render opens.
      var pr = clamp01(p);
      var rad = (efOut(pr) * 85).toFixed(1);
      if (render) {
        render.style.clipPath = 'circle(' + rad + '% at 50% 50%)';
        render.style.webkitClipPath = 'circle(' + rad + '% at 50% 50%)';
        render.style.transform = 'scale(' + (1.15 - efOut(pr) * 0.15).toFixed(4) + ')'; // counter-scale
      }
      if (portal) portal.style.opacity = (1 - clamp01(p / 0.6)).toFixed(3); // guide ring fades
      // labels fade out over the first half
      if (labels) labels.style.opacity = (1 - clamp01(p / 0.5)).toFixed(3);
    }
    apply(0);

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      stage.classList.add('vrp-static'); apply(1);
      try { global.__LAB_OK__ = true; } catch (e) {}
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

    var trigger = ScrollTrigger.create({
      trigger: stage, start: 'top top',
      end: function () { return '+=' + Math.round(global.innerHeight * opt.pinFactor); },
      pin: true, pinSpacing: true, scrub: true,
      onUpdate: function (self) { apply(self.progress); }
    });
    apply(0);

    global.addEventListener('resize', function () { ScrollTrigger.refresh(); });
    stage.classList.add('vrp-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, set: apply,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.VennRingPortalReveal = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
