/* ============================================================
   VERTICAL-CURTAIN-WIPE · engine.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + CustomEase + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   Copied from library/components/vertical-curtain-wipe/component.js (proven core),
   + two additive, opt-in dual-platform patches (forceMotion, manualDrive).

   Springs' section ENTRY wipe — a panel enters as a hard VERTICAL seam wiping
   left->right and PARKING at the 50% column split, while the outgoing full-bleed
   image CROP-ZOOMS (scale up + object-position shift) to recompose into the shrinking
   column. render(prog) is PURE; scroll-scrubbed, reversible.

   CONFIG-DRIVEN:
     VerticalCurtainWipe.init(target, {
       park: 50,            // where the seam stops (% from left) — the column split
       zoom: 0.12,          // outgoing image crop-zoom (scale 1 -> 1+zoom)
       lerp: 0.1, pinFactor: 0.8, manageLenis: true,
       forceMotion: false,  // opt-in: skip the <=820px static guard (dual wrapper owns mobile)
       manualDrive: false   // opt-in: expose render() WITHOUT the engine's own ScrollTrigger/pin
     })
   Markup: .vcw-stage > .vcw-out (img, the crop-zooming media) + .vcw-panel (the
   entering panel, clip-revealed L->R to park%).

   ENGINE LAWS: Lenis -> gsap.ticker -> ScrollTrigger.update; lagSmoothing(0);
   render(prog) PURE; pin/scrub; clip-path + transform only; GPU layers; NO mix-blend /
   NO backdrop over the scrubbed surface; NO WebGL; reduced-motion / <=820px -> static
   (panel at park, image composed). Sets window.__LAB_OK__.
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
    // forceMotion (dual-platform opt-in): the original component went static <=820px because
    // it had no mobile branch. The dual wrapper OWNS a mobile branch, so it keeps motion on.
    var narrow = !options.forceMotion && global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    var panel = stage.querySelector('.vcw-panel');
    var out = stage.querySelector('.vcw-out');
    var outImg = out ? out.querySelector('img') : null;

    // PURE render(prog): 0 = panel hidden / image full; 1 = panel at park / image crop-zoomed.
    // One source of truth (used by the engine ScrollTrigger AND by manualDrive).
    function makeRender() {
      return function render(prog) {
        // seam sweeps L->R: right inset goes 100% -> (100 - park)%
        var rightInset = (100 - opt.park * prog).toFixed(2);
        panel.style.clipPath = 'inset(0 ' + rightInset + '% 0 0)';
        // outgoing image crop-zooms as its visible column narrows (origin shifted toward the kept side)
        if (outImg) outImg.style.transform = 'scale(' + (1 + opt.zoom * prog).toFixed(4) + ')';
      };
    }

    // MOBILE render (Єгор): the SAME wipe technique, but the seam AXIS is rotated 90° to fit
    // the tall vertical screen. Desktop = horizontal seam sweeping L->R (parks at a vertical
    // split, because a wide screen splits vertically). Mobile = VERTICAL seam sweeping
    // BOTTOM->TOP: the full-WIDTH panel rises up covering the frame from below (text sits at
    // its bottom edge), the photo revealed above it. A side-by-side 2-col seam reads unnatural
    // when the phone is held vertically — the motion must run along the LONG axis.
    function makeMobileRender() {
      return function render(prog) {
        var p = Math.max(0, Math.min(1, prog));
        panel.style.opacity = '1';
        // top inset 100% -> (100 - park)% : panel rises from the bottom to park height
        var topInset = (100 - opt.park * p).toFixed(2);
        panel.style.clipPath = 'inset(' + topInset + '% 0 0 0)';
        if (outImg) outImg.style.transform = 'scale(' + (1 + opt.zoom * p).toFixed(4) + ')'; // bg scale-creep
      };
    }

    // manualDrive (dual-platform): expose render() WITHOUT the engine's own ScrollTrigger/pin,
    // so the dual wrapper can drive render(prog) from scroll on both platforms. Desktop uses
    // the clip-wipe render; mobile uses the crossfade render — exposed as renderMobile.
    if (options.manualDrive && panel) {
      panel.style.willChange = 'clip-path, opacity';
      panel.style.clipPath = 'inset(0 100% 0 0)';
      if (outImg) { outImg.style.willChange = 'transform'; outImg.style.transform = 'scale(1)'; }
      var renderM = makeRender();
      var renderMob = makeMobileRender();
      renderM(0);
      stage.classList.add('vcw-ready');
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { manual: true, render: renderM, renderMobile: renderMob, destroy: function () {} };
    }

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

    var render = makeRender();

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
