/* ============================================================
   DE-BLEED · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + CustomEase + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   EVER's de-bleed / re-bleed — a full-bleed photo SCALES/INSETS into a contained
   editorial card (a giant wordmark sitting BEHIND it, revealed in the new gutters),
   and the reverse re-bleeds it back out (the lead-in to a gallery). Harvested from
   D_ever_walkthrough_video (SEAM B/D, the reverse at f_043).

   THE MOVE: as you scroll INTO the section, the full-bleed image shrinks from
   covering the viewport to a centred card (clip-path inset grows, or width/scale
   reduces), so the wordmark behind it and the editorial copy/decor around it appear
   in the freed margins. Scroll OUT (or trigger 'open') re-bleeds it back to
   full-bleed (the gallery-open animation). Scroll-scrubbed, reversible.

   CONFIG-DRIVEN:
     DeBleed.init(target, {
       insetX: 22, insetY: 12,   // final card inset (% of the stage) at de-bleed end
       lerp: 0.1, pinFactor: 1.0,
       siblings: '.db-around',    // editorial elements that fade/rise in as the card forms
       manageLenis: true
     })
   Markup: .db-stage > .db-media(img) + .db-word(behind) + [.db-around...]. The image
   de-bleeds from inset(0) to inset(insetY% insetX% ...), the word behind shows through.

   ENGINE LAWS (verbatim from slice-clip): Lenis 1.1.13 -> gsap.ticker ->
   ScrollTrigger.update; lagSmoothing(0); render(prog) PURE fn; pin/scrub; clip-path
   + transform + opacity only; GPU layers; NO mix-blend / NO backdrop over the
   scrubbed surface; NO WebGL; reduced-motion / <=820px -> static contained card.
   Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';

  function init(target, options) {
    options = options || {};
    var opt = {
      insetX: options.insetX != null ? options.insetX : 22,
      insetY: options.insetY != null ? options.insetY : 12,
      lerp: options.lerp != null ? options.lerp : 0.1,
      pinFactor: options.pinFactor != null ? options.pinFactor : 1.0,
      siblings: options.siblings || '.db-around',
      manageLenis: options.manageLenis !== false
    };

    var stage = typeof target === 'string' ? document.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, CustomEase = global.CustomEase, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    var media = stage.querySelector('.db-media');
    var word = stage.querySelector('.db-word');
    var around = [].slice.call(stage.querySelectorAll(opt.siblings));

    // static fallback: show the contained card + word + editorial (the resting pose)
    if (reduced || narrow || !gsap || !ScrollTrigger || !Lenis || !media) {
      stage.classList.add('db-static');
      if (media) media.style.clipPath = 'inset(' + opt.insetY + '% ' + opt.insetX + '% ' + opt.insetY + '% ' + opt.insetX + '%)';
      around.forEach(function (a) { a.style.opacity = '1'; a.style.transform = 'none'; });
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

    // init: full-bleed (inset 0), word behind hidden in the gutters (none yet), editorial down
    media.style.willChange = 'clip-path';
    media.style.clipPath = 'inset(0 0 0 0)';
    around.forEach(function (a) { a.style.willChange = 'transform,opacity'; a.style.opacity = '0'; a.style.transform = 'translateY(28px)'; });

    // PURE render(prog): 0 = full-bleed, 1 = contained card (de-bled)
    function render(prog) {
      var ey = (opt.insetY * prog).toFixed(2);
      var ex = (opt.insetX * prog).toFixed(2);
      media.style.clipPath = 'inset(' + ey + '% ' + ex + '% ' + ey + '% ' + ex + '%)';
      // the editorial elements fade/rise in over the back half of the de-bleed
      around.forEach(function (a, k) {
        var p = (prog - (0.4 + k * 0.06)) / 0.4; p = p < 0 ? 0 : p > 1 ? 1 : p;
        a.style.opacity = p.toFixed(3);
        a.style.transform = 'translateY(' + ((1 - p) * 28).toFixed(2) + 'px)';
      });
      // the word behind needs no transform — it is simply revealed as the media insets
    }

    var trigger = ScrollTrigger.create({
      trigger: stage, start: 'top top',
      end: '+=' + Math.round(global.innerHeight * opt.pinFactor),
      pin: true, pinSpacing: true, scrub: true,
      onUpdate: function (self) { render(self.progress); }
    });
    render(0);

    global.addEventListener('resize', function () { ScrollTrigger.refresh(); });
    stage.classList.add('db-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, render: render,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { init: init };
  global.DeBleed = api;
  global.deBleed = function (t, o) { return init(t, o); };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
