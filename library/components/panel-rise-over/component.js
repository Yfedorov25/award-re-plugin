/* ============================================================
   PANEL-RISE-OVER · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   11tanjung's section hand-off — the NEXT section is a coloured PANEL with a big
   rounded top edge (border-radius ~40-60px) that RISES from below (translateY 100% -> 0)
   and slides OVER the previous section, flipping the theme (brown <-> cream — the panel
   carries its own colour). The panel's content fades + lifts in DURING the rise, reaching
   readable by ~70% of the travel. Harvested from D_11tanjung (C4; scroll-linked ~2.1s).

   Distinct from Saisei center-seam-split (a clip-path COVER peeling from a centre line)
   and from scroll-clip-rise (elements rising from a bottom mask): here a REAL coloured
   panel element translates up over the outgoing section, with a rounded leading edge and
   a theme-flip. One pinned scroll-scrub.

   THE MOVE (one pinned scroll-scrub, progress p 0..1):
     - panel: translateY (100 - p*100)%  (starts fully below, only the rounded top shows;
       ends fully covering). ease applied to p.
     - panel content (.pro-rise): opacity 0 -> 1 + translateY 28px -> 0, mapped to the
       LAST stretch so the copy lands as the panel seats (readable ~p>=0.7).
     - the outgoing section behind it just holds (parallax-up optional, off by default).

   CONFIG-DRIVEN:
     PanelRiseOver.create(target, {        // target = .pro-stage (wraps .pro-prev + .pro-panel)
       radius: 52,            // px, the panel's top corner radius (the rounded leading edge)
       pinFactor: 1.2,        // pinned span = innerHeight * pinFactor (~2.1s of scroll)
       contentFrom: 0.45,     // p at which the panel content starts revealing
       prevParallax: 0,       // px the outgoing section drifts up as the panel covers it (0 = still)
       ease: 'power3.out', manageLenis: true
     })
   Markup: .pro-stage > .pro-prev(the outgoing section) + .pro-panel(.pro-rise content).
   Returns { trigger, set(p), destroy }.

   ENGINE LAWS: transform: translateY (panel + content) + opacity (content) + a static
   border-radius on the panel only; GPU; NO mix-blend / NO backdrop over the panel; NO
   WebGL; reduced-motion / <=820px -> panel seated (covering). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      radius: options.radius != null ? options.radius : 52,
      pinFactor: options.pinFactor != null ? options.pinFactor : 1.2,
      contentFrom: options.contentFrom != null ? options.contentFrom : 0.45,
      prevParallax: options.prevParallax != null ? options.prevParallax : 0,
      ease: options.ease || 'power3.out',
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var prev = stage.querySelector('.pro-prev');
    var panel = stage.querySelector('.pro-panel');
    var rises = [].slice.call(stage.querySelectorAll('.pro-rise'));
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    if (panel) panel.style.borderTopLeftRadius = panel.style.borderTopRightRadius = opt.radius + 'px';

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function ef(t) {
      switch (opt.ease) {
        case 'expo.out': return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        case 'power2.out': return 1 - Math.pow(1 - t, 2);
        default: return 1 - Math.pow(1 - t, 3); // power3.out
      }
    }

    // p 0 = panel fully below (only its rounded top peeks); p 1 = panel seated (covers prev)
    function apply(p) {
      p = clamp01(p);
      var e = ef(p);
      if (panel) panel.style.transform = 'translateY(' + (100 - e * 100).toFixed(2) + '%)';
      if (prev && opt.prevParallax) prev.style.transform = 'translateY(' + (-e * opt.prevParallax).toFixed(1) + 'px)';
      // content reveals over [contentFrom .. 1]
      var cr = clamp01((p - opt.contentFrom) / (1 - opt.contentFrom));
      var ce = ef(cr);
      rises.forEach(function (el) {
        el.style.opacity = ce.toFixed(3);
        el.style.transform = 'translateY(' + ((1 - ce) * 28).toFixed(1) + 'px)';
      });
    }
    apply(0);

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      stage.classList.add('pro-static'); apply(1);
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
    stage.classList.add('pro-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, set: apply,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.PanelRiseOver = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
