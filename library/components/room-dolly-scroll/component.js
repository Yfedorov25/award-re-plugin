/* ============================================================
   ROOM-DOLLY-SCROLL · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   gapsystudio's HOME camera-dolly — the whole homepage is one continuous 3D walk through a
   virtual studio, scroll = camera moving deeper into the room. This is the NO-WebGL
   APPROXIMATION: a pinned scroll-scrub drives a MULTI-LAYER PARALLAX that fakes a forward
   dolly — each layer carries a data-depth (0 far .. 1 near); on scroll the near layers GROW
   (scale) + rush past faster while far layers barely move, so the viewer reads as flying
   INTO the scene. A focal "wall" headline reveals as the camera arrives. Harvested from
   D_gapsy (A home studio-tour; basket B — fake-3D, done LAST and honestly).

   HONESTY: the gapsy original is live WebGL (a real 3D room + camera). We do NOT copy that.
   This is a layered-parallax illusion of a dolly, NOT a real 3D scene. For higher fidelity,
   feed a PRE-RENDERED fly-through frame sequence into the sibling `scroll-scrub-video`
   brick (frames -> canvas + ImageBitmap) instead of CSS layers.

   THE MOVE (one pinned scroll-scrub, progress p 0..1):
     - each [data-depth=d]: scale = 1 + p * dollyGain * d  (near grows most),
       translateY = p * driftY * (d - 0.5) * 2  (near rushes down/out, far drifts up),
       opacity for the nearest layers fades as they pass the camera (d close to 1, p high)
     - the focal headline [data-arrive]: reveals (opacity + rise) over [arriveAt .. 1]
   set(p) is a PURE scrub.

   CONFIG-DRIVEN:
     RoomDollyScroll.create(target, {     // target = .rds-stage
       dollyGain: 1.6,        // how much the near layers grow over the travel
       driftY: 120,           // px of vertical rush between far and near layers
       arriveAt: 0.55,        // p at which the focal headline starts arriving
       pinFactor: 1.8, ease: 'none', manageLenis: true
     })
   Markup: .rds-stage > .rds-layer[data-depth] x N (+ a [data-arrive] focal block).
   Returns { trigger, set(p), destroy }.

   ENGINE LAWS: transform: scale + translateY + opacity only; GPU; NO mix-blend over the
   layers; NO WebGL; reduced-motion / <=820px -> arrived state (focal shown). owns_pin TRUE.
   Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      dollyGain: options.dollyGain != null ? options.dollyGain : 1.6,
      driftY: options.driftY != null ? options.driftY : 120,
      arriveAt: options.arriveAt != null ? options.arriveAt : 0.55,
      pinFactor: options.pinFactor != null ? options.pinFactor : 1.8,
      ease: options.ease || 'none',
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var layers = [].slice.call(stage.querySelectorAll('.rds-layer'));
    var arrive = stage.querySelector('[data-arrive]');
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function efOut(t) { return 1 - Math.pow(1 - t, 3); }

    function apply(p) {
      p = clamp01(p);
      layers.forEach(function (el) {
        var d = parseFloat(el.getAttribute('data-depth'));
        if (isNaN(d)) d = 0.5;
        var scale = 1 + p * opt.dollyGain * d;
        var ty = p * opt.driftY * (d - 0.5) * 2;
        el.style.transform = 'translate3d(0,' + ty.toFixed(1) + 'px,0) scale(' + scale.toFixed(4) + ')';
        // the nearest layers (d>0.75) fade out as they rush past the camera near the end
        if (d > 0.75) el.style.opacity = (1 - clamp01((p - 0.78) / 0.22) * (d - 0.75) * 4).toFixed(3);
      });
      if (arrive) {
        var ap = efOut(clamp01((p - opt.arriveAt) / (1 - opt.arriveAt)));
        arrive.style.opacity = ap.toFixed(3);
        arrive.style.transform = 'translateY(' + ((1 - ap) * 30).toFixed(1) + 'px) scale(' + (0.96 + ap * 0.04).toFixed(3) + ')';
      }
    }
    apply(0);

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      stage.classList.add('rds-static'); apply(1);
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
    stage.classList.add('rds-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, set: apply,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.RoomDollyScroll = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
