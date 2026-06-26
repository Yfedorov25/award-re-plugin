/* ============================================================
   BRAND-OVERLAY-CROSSFADE · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   Springs' brand-tinted reveal — a new full-bleed photo fades in UNDER a
   brand-colour WASH whose opacity then animates to 0, so every photo gets a brief
   "brand tint" beat before it resolves to full colour. Harvested from D_springs
   (Place->Jogging SEAM-07, f099->f106: heavy green tint -> lighter -> full colour).

   THE MOVE: as the section enters, the image autoAlpha 0->1 AND a brand-colour
   overlay opacity wash% -> 0, on the SAME scrub. The image arrives already washed in
   the brand colour, then the wash clears to reveal the true photo. Reversible.

   CONFIG-DRIVEN:
     BrandOverlayCrossfade.init(target, {
       wash: 0.7,           // starting wash opacity (the brand-tint strength)
       fadeImage: true,     // also autoAlpha the image 0->1 (else just clear the wash)
       lerp: 0.1, pinFactor: 0.6, manageLenis: true
     })
   Markup: .boc-stage > .boc-img(img) + .boc-wash(brand-colour layer). The wash
   colour is set in CSS (var/background) = the brand/section colour.

   ENGINE LAWS: Lenis -> gsap.ticker -> ScrollTrigger.update; lagSmoothing(0);
   render(prog) PURE; pin/scrub (short); transform + opacity only; GPU layers; NO
   mix-blend / NO backdrop over the scrubbed surface; NO WebGL; reduced-motion /
   <=820px -> static (image full, wash 0). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';

  function init(target, options) {
    options = options || {};
    var opt = {
      wash: options.wash != null ? options.wash : 0.7,
      fadeImage: options.fadeImage !== false,
      lerp: options.lerp != null ? options.lerp : 0.1,
      pinFactor: options.pinFactor != null ? options.pinFactor : 0.6,
      manageLenis: options.manageLenis !== false
    };

    var stage = typeof target === 'string' ? document.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    var img = stage.querySelector('.boc-img');
    var wash = stage.querySelector('.boc-wash');

    // static fallback: image full, wash cleared
    if (reduced || narrow || !gsap || !ScrollTrigger || !Lenis || !wash) {
      stage.classList.add('boc-static');
      if (img) img.style.opacity = '1';
      if (wash) wash.style.opacity = '0';
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

    if (img) { img.style.willChange = 'opacity'; img.style.opacity = opt.fadeImage ? '0' : '1'; }
    if (wash) { wash.style.willChange = 'opacity'; wash.style.opacity = String(opt.wash); }

    // PURE render(prog): 0 = washed-in (image 0/wash full); 1 = resolved (image 1/wash 0)
    function render(prog) {
      if (img && opt.fadeImage) img.style.opacity = Math.min(1, prog * 1.4).toFixed(3); // image arrives a touch faster
      if (wash) wash.style.opacity = (opt.wash * (1 - prog)).toFixed(3);
    }

    var trigger = ScrollTrigger.create({
      trigger: stage, start: 'top bottom', end: 'top 30%',  // resolves as it enters the viewport
      scrub: true,
      onUpdate: function (self) { render(self.progress); }
    });
    render(0);

    global.addEventListener('resize', function () { ScrollTrigger.refresh(); });
    stage.classList.add('boc-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, render: render,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { init: init };
  global.BrandOverlayCrossfade = api;
  global.brandOverlayCrossfade = function (t, o) { return init(t, o); };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
