/* ============================================================
   HERO-TITLE-TO-NAV-PILL · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   11tanjung's signature move — the full-screen cursive HERO WORDMARK scroll-scrubs
   scale + translateY DOWN into a small frosted-glass PILL fixed at top-centre. It is
   the SAME DOM node the whole way (no swap): giant title -> shrinks + rises -> docks in
   a backdrop-blur pill that becomes the persistent nav mark. A readability scrim under
   the title fades out as the title shrinks. Harvested from D_11tanjung (H1+H2; a016
   full title -> a024 docked pill).

   THE MOVE: one pinned scroll-scrub maps progress 0..1 to the wordmark's
   scale (1 -> pillScale) + translateY (0 -> pill y) + the pill chrome's opacity (0 -> 1
   so the frosted plate appears under the shrunk mark). The scrim under the big title
   fades 1 -> 0 over the first half.

   CONFIG-DRIVEN:
     HeroTitleToNavPill.create(target, {     // target = .htp-stage; contains .htp-mark (the wordmark),
       pillScale: 0.16,                       // .htp-pill (frosted plate), .htp-scrim (readability)
       pillY: -42,                            // vh from centre to the pill row (negative = up)
       pinFactor: 1.0, ease: 'power2.inOut',
       scrim: true, manageLenis: true
     })
   Markup: .htp-stage > .htp-render(img) + .htp-scrim + .htp-pill + .htp-mark(the moving wordmark).
   Returns { trigger, set(p), destroy }.

   ENGINE LAWS: transform(scale, translateY) on the mark + opacity on scrim/pill +
   backdrop-filter on the pill (static, not over a scrubbed surface) only; GPU; NO
   mix-blend over the scrubbed render; NO WebGL; reduced-motion / <=820px -> docked pill
   shown. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      pillScale: options.pillScale != null ? options.pillScale : 0.16,
      pillY: options.pillY != null ? options.pillY : -42,   // vh
      pinFactor: options.pinFactor != null ? options.pinFactor : 1.0,
      ease: options.ease || 'power2.inOut',
      scrim: options.scrim !== false,
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var mark = stage.querySelector('.htp-mark');
    var pill = stage.querySelector('.htp-pill');
    var scrim = stage.querySelector('.htp-scrim');
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    function easeP(name, t) {
      if (name === 'power2.inOut') return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      if (name === 'power3.out') return 1 - Math.pow(1 - t, 3);
      return t;
    }

    // p: 0 = giant centred title (scrim up), 1 = docked frosted pill (mark small, top-centre)
    function apply(p) {
      var e = easeP(opt.ease, p);
      if (mark) {
        var s = 1 + (opt.pillScale - 1) * e;
        var y = opt.pillY * e; // vh
        mark.style.transform = 'translateY(' + y.toFixed(2) + 'vh) scale(' + s.toFixed(4) + ')';
      }
      if (pill) pill.style.opacity = Math.min(1, Math.max(0, (e - 0.55) / 0.45)).toFixed(3); // plate appears late
      if (scrim && opt.scrim) scrim.style.opacity = (0.5 * (1 - Math.min(1, e / 0.6))).toFixed(3); // scrim fades over first 60%
    }
    apply(0);

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      stage.classList.add('htp-static'); apply(1);
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
    stage.classList.add('htp-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, set: apply,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.HeroTitleToNavPill = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
