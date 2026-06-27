/* ============================================================
   COMPASS-ROSE-SECTION-DIVIDER · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   r1864's section-announce — a thin line-art COMPASS-ROSE / quatrefoil ornament (concentric
   circles + a 4-petal flower + N/S/E/W rays) that DRAWS + scales + fades in as a section
   announces itself, sitting above a small kicker, a giant serif display TITLE, body, and a
   framed CTA. The neoclassical "this is a new chapter" opener. Harvested from D_r1864
   (r18642 'В САМОМ СЕРДЦЕ МОСКВЫ'; r18644 /history 'ИСТОРИЯ МЕСТА').

   THE MOVE (scroll-into-view, one play, progress p 0..1):
     - ornament: opacity 0->1 + scale 0.55->1; its stroke paths DRAW (stroke-dashoffset)
       over the first ~60%; a subtle rotate (optional) settles to 0
     - kicker: fade in 0.35..0.55
     - title: fade + translateY 24->0 over 0.45..0.75 (optionally line-by-line)
     - body + CTA: fade + rise 0.70..1.0
   set(p) is a PURE scrub.

   CONFIG-DRIVEN:
     CompassRoseSectionDivider.create(target, {     // target = .crd-stage
       draw: true, scaleFrom: 0.55, rotateFrom: 0,
       duration: 1.1, ease: 'power3.out', start: 'top 78%', once: true, manageLenis: true
     })
   Markup: .crd-stage > svg.crd-rose ([data-draw] stroke paths) + .crd-kicker + .crd-title +
   .crd-body + .crd-cta. Returns { trigger, set(p), play(), destroy }.

   ENGINE LAWS: stroke-dashoffset + transform(scale,rotate,translateY) + opacity only; GPU;
   NO mix-blend; NO WebGL; reduced-motion / <=820px -> shown. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      draw: options.draw !== false,
      scaleFrom: options.scaleFrom != null ? options.scaleFrom : 0.55,
      rotateFrom: options.rotateFrom != null ? options.rotateFrom : 0,
      duration: options.duration != null ? options.duration : 1.1,
      ease: options.ease || 'power3.out',
      start: options.start || 'top 78%',
      once: options.once !== false,
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var rose = stage.querySelector('.crd-rose');
    var draws = [].slice.call(stage.querySelectorAll('.crd-rose [data-draw]'));
    var kicker = stage.querySelector('.crd-kicker');
    var title = stage.querySelector('.crd-title');
    var body = stage.querySelector('.crd-body');
    var cta = stage.querySelector('.crd-cta');
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function efOut(t) { return opt.ease === 'expo.out' ? (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) : 1 - Math.pow(1 - t, 3); }
    function sub01(p, a, b) { return clamp01((p - a) / (b - a)); }

    var lens = [];
    draws.forEach(function (p) {
      var L = 0; try { L = p.getTotalLength ? p.getTotalLength() : 0; } catch (e) { L = 0; }
      lens.push(L); if (L && opt.draw) { p.style.strokeDasharray = L; p.style.strokeDashoffset = L; }
    });

    function apply(p) {
      p = clamp01(p);
      // ornament 0..0.45 scale/opacity, draw 0..0.6, rotate settle
      var op = efOut(sub01(p, 0.0, 0.45));
      if (rose) {
        rose.style.opacity = op.toFixed(3);
        var sc = opt.scaleFrom + (1 - opt.scaleFrom) * op;
        var rot = opt.rotateFrom * (1 - op);
        rose.style.transform = 'scale(' + sc.toFixed(4) + ') rotate(' + rot.toFixed(2) + 'deg)';
      }
      if (opt.draw) {
        var dp = efOut(sub01(p, 0.0, 0.6));
        draws.forEach(function (pa, i) { if (lens[i]) pa.style.strokeDashoffset = (lens[i] * (1 - dp)).toFixed(1); });
      }
      // kicker
      if (kicker) kicker.style.opacity = efOut(sub01(p, 0.35, 0.55)).toFixed(3);
      // title
      if (title) {
        var tp = efOut(sub01(p, 0.45, 0.75));
        title.style.opacity = tp.toFixed(3);
        title.style.transform = 'translateY(' + ((1 - tp) * 24).toFixed(1) + 'px)';
      }
      // body + cta
      [body, cta].forEach(function (el) {
        if (!el) return;
        var bp = efOut(sub01(p, 0.70, 1.0));
        el.style.opacity = bp.toFixed(3);
        el.style.transform = 'translateY(' + ((1 - bp) * 16).toFixed(1) + 'px)';
      });
    }
    apply(0);

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      stage.classList.add('crd-static'); apply(1);
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
        gsap.to(o, { p: 1, duration: opt.duration, ease: 'none', onUpdate: function () { apply(o.p); } });
      },
      onLeaveBack: opt.once ? null : function () { played = false; apply(0); }
    });

    stage.classList.add('crd-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, set: apply, play: function () { apply(1); },
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.CompassRoseSectionDivider = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
