/* ============================================================
   SCRIPT-OVERLINE-DISPLAY-PAIR · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   gapsystudio's services type-pair — a small HANDWRITTEN SCRIPT overline (in quotes) sits
   ABOVE a HUGE CONDENSED display title; on scroll-into-view the script fades + lifts in
   first, then the display title reveals LINE BY LINE from a bottom mask (clip/translateY),
   then the body + CTA fade-rise. The whole pair anchors one side of an alternating L/R
   section (text-left/visual-right, then swapped). Harvested from D_gapsy (D /services:
   "Mobile App Design", "Motion Design", "Brand Design", each with a script overline).

   THE MOVE (scroll-into-view, one play, progress p 0..1):
     - script overline: opacity 0->1 + translateY 12px->0 over 0.00..0.30
     - display title: each line rises from a bottom mask (inner translateY 100%->0) +
       opacity, line-stagger, over 0.15..0.80, power3.out
     - body + CTA: opacity 0->1 + translateY 16px->0 over 0.70..1.00
   set(p) is a PURE scrub.

   CONFIG-DRIVEN:
     ScriptOverlineDisplayPair.create(target, {     // target = .sodp-stage
       lineStagger: 0.12, duration: 1.0, ease: 'power3.out',
       start: 'top 80%', once: true, manageLenis: true
     })
   Markup: .sodp-stage > .sodp-copy(.sodp-script + .sodp-title([.sodp-line] x N) +
   .sodp-body + .sodp-cta) [+ .sodp-visual any aside]. Add class .sodp--rtl to swap sides.
   Returns { trigger, play(), set(p), destroy }.

   ENGINE LAWS: transform(translateY) + opacity + clip (line mask) only; GPU; NO mix-blend
   / NO backdrop; NO WebGL; reduced-motion / <=820px -> shown. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      lineStagger: options.lineStagger != null ? options.lineStagger : 0.12,
      duration: options.duration != null ? options.duration : 1.0,
      ease: options.ease || 'power3.out',
      start: options.start || 'top 80%',
      once: options.once !== false,
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var script = stage.querySelector('.sodp-script');
    var lines = [].slice.call(stage.querySelectorAll('.sodp-title .sodp-line'));
    var body = stage.querySelector('.sodp-body');
    var cta = stage.querySelector('.sodp-cta');
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function ef(t) {
      switch (opt.ease) {
        case 'expo.out': return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        case 'power2.out': return 1 - Math.pow(1 - t, 2);
        default: return 1 - Math.pow(1 - t, 3); // power3.out
      }
    }
    // wrap each line's text in a mask (overflow hidden) + an inner span that rises
    lines.forEach(function (ln) {
      if (ln.querySelector('.sodp-line-in')) return;
      var span = doc.createElement('span');
      span.className = 'sodp-line-in';
      while (ln.firstChild) span.appendChild(ln.firstChild);
      ln.appendChild(span);
    });
    var inners = [].slice.call(stage.querySelectorAll('.sodp-line-in'));

    function sub(p, a, b) { return clamp01((p - a) / (b - a)); }

    // PURE scrub: p 0 = hidden, p 1 = fully revealed
    function apply(p) {
      p = clamp01(p);
      // script overline 0.00..0.30
      if (script) {
        var sp = ef(sub(p, 0.0, 0.30));
        script.style.opacity = sp.toFixed(3);
        script.style.transform = 'translateY(' + ((1 - sp) * 12).toFixed(1) + 'px)';
      }
      // display lines 0.15..0.80, line-staggered
      var N = inners.length;
      inners.forEach(function (inn, i) {
        var winStart = 0.15 + (i / Math.max(1, N)) * 0.5;
        var lp = ef(sub(p, winStart, Math.min(1, winStart + 0.30)));
        inn.style.transform = 'translateY(' + ((1 - lp) * 100).toFixed(2) + '%)';
        inn.style.opacity = (0.15 + lp * 0.85).toFixed(3);
      });
      // body + CTA 0.70..1.00
      [body, cta].forEach(function (el) {
        if (!el) return;
        var bp = ef(sub(p, 0.70, 1.0));
        el.style.opacity = bp.toFixed(3);
        el.style.transform = 'translateY(' + ((1 - bp) * 16).toFixed(1) + 'px)';
      });
    }
    apply(0);

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      stage.classList.add('sodp-static'); apply(1);
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
        gsap.to(o, { p: 1, duration: opt.duration + opt.lineStagger * inners.length,
          ease: 'none', onUpdate: function () { apply(o.p); } });
      },
      onLeaveBack: opt.once ? null : function () { played = false; apply(0); }
    });

    stage.classList.add('sodp-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, set: apply, play: function () { apply(1); },
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.ScriptOverlineDisplayPair = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
