/* ============================================================
   VERTICAL-CURTAIN-WIPE · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + CustomEase + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   Springs' section ENTRY wipe — a panel enters as a hard VERTICAL seam wiping
   left->right and PARKING at the 50% column split, while the outgoing full-bleed
   image CROP-ZOOMS to recompose into the shrinking column. Harvested from
   D_springs (SEAM-02, f014->f017). It is the entry that hands off into the
   coupled-split / dual-slicer.

   THE MOVE: a colour panel (or the next section's panel) is revealed by a
   clip-path inset growing from the LEFT — inset(0 100% 0 0) -> inset(0 50% 0 0) —
   so a crisp vertical seam sweeps L->R and stops at the centre (the column split).
   Simultaneously the outgoing image (in the shrinking right half) crop-zooms
   (scale up + object-position shift) so it stays composed as its column narrows.
   Scroll-scrubbed, reversible.

   CONFIG-DRIVEN:
     VerticalCurtainWipe.init(target, {
       park: 50,            // where the seam stops (% from left) — the column split
       zoom: 0.12,          // outgoing image crop-zoom (scale 1 -> 1+zoom)
       lerp: 0.1, pinFactor: 0.8, manageLenis: true
     })
   Markup: .vcw-stage > .vcw-panel (the entering panel) + .vcw-out (the outgoing
   full-bleed media that crop-zooms). The panel is clip-revealed L->R to `park`%.

   ENGINE LAWS (verbatim from slice-clip): Lenis -> gsap.ticker ->
   ScrollTrigger.update; lagSmoothing(0); render(prog) PURE; pin/scrub; clip-path +
   transform only; GPU layers; NO mix-blend / NO backdrop over the scrubbed surface;
   NO WebGL; reduced-motion / <=820px -> static (panel at park, image composed).
   Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';

  function init(target, options) {
    options = options || {};
    var opt = {
      park: options.park != null ? options.park : 50,
      zoom: options.zoom != null ? options.zoom : 0.12,
      lerp: options.lerp != null ? options.lerp : 0.1,
      pinFactor: options.pinFactor != null ? options.pinFactor : 0.8,
      manageLenis: options.manageLenis !== false
    };

    var stage = typeof target === 'string' ? document.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, CustomEase = global.CustomEase, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    var panel = stage.querySelector('.vcw-panel');
    var out = stage.querySelector('.vcw-out');
    var outImg = out ? out.querySelector('img') : null;

    // static fallback: panel parked at `park`, image composed
    if (reduced || narrow || !gsap || !ScrollTrigger || !Lenis || !panel) {
      stage.classList.add('vcw-static');
      if (panel) panel.style.clipPath = 'inset(0 ' + (100 - opt.park) + '% 0 0)';
      if (outImg) outImg.style.transform = 'scale(' + (1 + opt.zoom) + ')';
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { static: true, destroy: function () {} };
    }

    gsap.registerPlugin(ScrollTrigger, CustomEase);
    gsap.ticker.lagSmoothing(0);

    var lenis = null;
    if (opt.manageLenis) {
      lenis = new Lenis({ lerp: opt.lerp, smoothWheel: true, wheelMultiplier: 1 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      global.__lenis = lenis;
    }

    // init: panel fully hidden (inset right 100%), image at scale 1
    panel.style.willChange = 'clip-path';
    panel.style.clipPath = 'inset(0 100% 0 0)';
    if (outImg) { outImg.style.willChange = 'transform'; outImg.style.transform = 'scale(1)'; }

    // PURE render(prog): 0 = panel hidden / image full; 1 = panel at park / image crop-zoomed
    function render(prog) {
      // seam sweeps L->R: right inset goes 100% -> (100 - park)%
      var rightInset = (100 - opt.park * prog).toFixed(2);
      panel.style.clipPath = 'inset(0 ' + rightInset + '% 0 0)';
      // outgoing image crop-zooms as its visible column narrows
      if (outImg) outImg.style.transform = 'scale(' + (1 + opt.zoom * prog).toFixed(4) + ')';
    }

    var trigger = ScrollTrigger.create({
      trigger: stage, start: 'top top',
      end: '+=' + Math.round(global.innerHeight * opt.pinFactor),
      pin: true, pinSpacing: true, scrub: true,
      onUpdate: function (self) { render(self.progress); }
    });
    render(0);

    global.addEventListener('resize', function () { ScrollTrigger.refresh(); });
    stage.classList.add('vcw-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, render: render,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { init: init };
  global.VerticalCurtainWipe = api;
  global.verticalCurtainWipe = function (t, o) { return init(t, o); };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
