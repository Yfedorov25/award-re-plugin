/* ============================================================
   BRAND-OVERLAY-CROSSFADE · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   Springs' brand-tinted reveal — a new full-bleed photo fades in UNDER a
   brand-colour WASH whose opacity then animates to 0, so every photo gets a brief
   "brand tint" beat before it resolves to full colour. Harvested from D_springs
   (Place->Jogging SEAM-07, f099->f106: heavy green tint -> lighter -> full colour).

   THE MOVE: the section PINS full-screen on a full-bleed photo dipped in the brand
   colour; while pinned, the wash opacity scrubs wash% -> 0 ON THE WHOLE FRAME, so the
   tint drains off the full photo in place (not while it slides in). The photo is solid
   the whole time. Reversible. (Optional fadeImage also autoAlphas the image 0->1.)

   CONFIG-DRIVEN:
     BrandOverlayCrossfade.init(target, {
       wash: 1.0,           // starting wash opacity (1 = full brand cover -> tints to 0)
       fadeImage: false,    // default: photo is solid under the wash; the wash tints to 0 ON it (zero see-through, any background). true = also crossfade the image 0->1 (only on a brand-coloured backdrop)
       lerp: 0.1, pinFactor: 1.0, manageLenis: true
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
      wash: options.wash != null ? options.wash : 1.0,
      fadeImage: options.fadeImage === true,
      lerp: options.lerp != null ? options.lerp : 0.1,
      pinFactor: options.pinFactor != null ? options.pinFactor : 1.0,
      manageLenis: options.manageLenis !== false
    };

    var stage = typeof target === 'string' ? document.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // forceMotion (dual-platform opt-in): the original component went static <=820px because
    // it had no mobile branch. The dual wrapper OWNS a mobile branch, so it keeps motion on.
    var narrow = !options.forceMotion && global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    var img = stage.querySelector('.boc-img');
    var wash = stage.querySelector('.boc-wash');
    // push mode (desktop, Springs SEAM-07 doводчик акт→акт): a SECOND full-bleed photo
    // that slides in from BELOW over the first, over-travels past its target and settles
    // back (magnetic overshoot). This is the desktop "доводчик" — push-over смугою, not
    // the wash-drain. Present only when the markup includes .boc-img--next.
    var imgNext = stage.querySelector('.boc-img--next');

    // magnetic overshoot доводчик: prog 0..0.80 slides the next photo up from 100% to 0%
    // (arrives in place); prog 0.80..1.0 is the SETTLE — it over-travels PAST 0 (up, to a
    // small negative) then springs back to exactly 0. Reversible, ends flat on target.
    function pushY(prog) {
      var p = Math.max(0, Math.min(1, prog));
      var TRAVEL = 0.80, AMP = 7; // % of over-travel above the target at the settle peak
      if (p <= TRAVEL) return (1 - p / TRAVEL) * 100; // 100% -> 0% as it slides in
      var s = (p - TRAVEL) / (1 - TRAVEL);            // 0..1 across the settle
      // one damped bounce above the line: up to -AMP at the peak, back to 0 at s=1
      return -AMP * Math.sin(s * Math.PI) * (1 - s * 0.35);
    }

    // manualDrive (dual-platform): expose render() WITHOUT the engine's own ScrollTrigger/pin,
    // so the dual wrapper can drive render(prog) from scroll OR from a timed auto-play. The
    // wash/push mechanic stays HERE — one source of truth.
    if (options.manualDrive && (wash || imgNext)) {
      var pushMode = options.mode === 'push' && imgNext;
      if (pushMode) {
        // PUSH: img (below) stays solid full; imgNext slides up over it with overshoot.
        if (img) img.style.opacity = '1';
        if (wash) wash.style.opacity = '0';
        imgNext.style.willChange = 'transform';
        var renderP = function (prog) {
          imgNext.style.transform = 'translateY(' + pushY(prog).toFixed(3) + '%)';
        };
        renderP(0);
        stage.classList.add('boc-ready');
        try { global.__LAB_OK__ = true; } catch (e) {}
        return { manual: true, mode: 'push', render: renderP, destroy: function () {} };
      }
      if (img) { img.style.willChange = 'opacity'; img.style.opacity = opt.fadeImage ? '0' : '1'; }
      if (imgNext) imgNext.style.transform = 'translateY(0%)'; // next layer resting on top for wash mode
      wash.style.willChange = 'opacity'; wash.style.opacity = String(opt.wash);
      var renderM = function (prog) {
        if (img && opt.fadeImage) img.style.opacity = Math.min(1, prog * 2).toFixed(3);
        wash.style.opacity = (opt.wash * (1 - prog)).toFixed(3);
      };
      renderM(0);
      stage.classList.add('boc-ready');
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { manual: true, mode: 'wash', render: renderM, destroy: function () {} };
    }

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
      if (img && opt.fadeImage) img.style.opacity = Math.min(1, prog * 2).toFixed(3); // image fully in by mid-scroll (wash still ~0.5) so the composite never thins below opaque
      if (wash) wash.style.opacity = (opt.wash * (1 - prog)).toFixed(3);
    }

    // PIN the section full-screen, then scrub the wash 1->0 ON the full photo (Springs
    // SEAM-07): you arrive on a full-bleed shot dipped in the brand colour and, while
    // pinned, the tint drains off the WHOLE frame. pin length = innerHeight*pinFactor.
    var trigger = ScrollTrigger.create({
      trigger: stage, start: 'top top',
      end: function () { return '+=' + Math.round(global.innerHeight * opt.pinFactor); },
      pin: true, pinSpacing: true, scrub: true,
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
