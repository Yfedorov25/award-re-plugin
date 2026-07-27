/* ============================================================
   NUMERAL-FRAME-EXPAND-HERO · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   r1864's SIGNATURE hero — one continuous pinned scroll-narrative:
     (A) FRAME-EXPAND: giant outline NUMERALS ("1864") on warm-black with a small framed
         view (Kremlin-through-columns) sitting INSIDE the numeral row; on scroll the little
         frame EXPANDS outward to a full-bleed photograph (clip + scale + the inner image
         fades up) while the outline numerals fade out.
     (B) TITLE-IN: the serif display title (УРОВЕНЬ ЖИЗНИ / КЛАССА DE LUXE / БЕЗ
         КОМПРОМИССОВ) + sub-line fade + rise in over the photo.
     (C) PARALLAX-PAN: a slow vertical parallax of the background (the embankment drifts
         up) while the title holds.
     (D) EXIT-RISE: hero opacity -> 0 + translateY rise as the next (light) section arrives.
   Harvested from D_r1864 (r18642 hero: outline 1864 -> framed Kremlin -> full photo + serif
   title -> pan; r18641 x_001..x_020). Absorbs 4 reported hero fragments into one engine.

   THE MOVE (one pinned scroll-scrub, progress p 0..1):
     - 0.00..0.35 frame: clip-inset N%->0 + scale frameScale->1 on .nfe-frame; inner img
       opacity 0.4->1; numerals opacity 1->0 (gone by ~0.30)
     - 0.30..0.55 title: .nfe-title opacity 0->1 + translateY 30px->0; .nfe-sub a beat later
     - 0.55..0.90 pan: .nfe-bg translateY 0 -> -panY px (parallax drift)
     - 0.85..1.00 exit: .nfe-hero opacity 1->0 + translateY 0 -> -exitY px
   set(p) is a PURE scrub.

   CONFIG-DRIVEN:
     NumeralFrameExpandHero.create(target, {     // target = .nfe-hero
       frameInset: 34, frameScale: 0.62, panY: 120, exitY: 160,
       pinFactor: 2.4, ease: 'power2.out', manageLenis: true
     })
   Markup: .nfe-hero > .nfe-bg(.nfe-frame > img) + .nfe-numerals + .nfe-title + .nfe-sub.
   Returns { trigger, set(p), destroy }.

   ENGINE LAWS: clip-path inset + transform(scale,translateY) + opacity only; GPU; NO
   mix-blend over the scrubbed photo; NO WebGL; NEVER scrub video.currentTime; reduced-motion
   / <=820px -> final state (photo + title shown). owns_pin TRUE. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      frameInset: options.frameInset != null ? options.frameInset : 34,
      frameScale: options.frameScale != null ? options.frameScale : 0.62,
      panY: options.panY != null ? options.panY : 120,
      exitY: options.exitY != null ? options.exitY : 160,
      pinFactor: options.pinFactor != null ? options.pinFactor : 2.4,
      ease: options.ease || 'power2.out',
      manageLenis: options.manageLenis !== false
    };
    var hero = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!hero) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var bg = hero.querySelector('.nfe-bg');
    var frame = hero.querySelector('.nfe-frame');
    var img = frame && frame.querySelector('img');
    var numerals = hero.querySelector('.nfe-numerals');
    var title = hero.querySelector('.nfe-title');
    var sub = hero.querySelector('.nfe-sub');
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = !options.forceMotion && global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function ef(t) { return opt.ease === 'expo.out' ? (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) : 1 - Math.pow(1 - t, 2); }
    function sub01(p, a, b) { return clamp01((p - a) / (b - a)); }

    function apply(p) {
      p = clamp01(p);
      // (A) frame-expand 0..0.35
      var fp = ef(sub01(p, 0.0, 0.35));
      if (frame) {
        var ins = (1 - fp) * opt.frameInset;
        frame.style.clipPath = 'inset(' + ins.toFixed(2) + '% ' + ins.toFixed(2) + '% ' + ins.toFixed(2) + '% ' + ins.toFixed(2) + '%)';
        frame.style.webkitClipPath = frame.style.clipPath;
        var sc = opt.frameScale + (1 - opt.frameScale) * fp;
        frame.style.transform = 'scale(' + sc.toFixed(4) + ')';
      }
      if (img) img.style.opacity = (0.4 + 0.6 * fp).toFixed(3);
      if (numerals) numerals.style.opacity = (1 - ef(sub01(p, 0.0, 0.30))).toFixed(3);
      // (B) title-in 0.30..0.55 (+ sub a beat later)
      if (title) {
        var tp = ef(sub01(p, 0.30, 0.55));
        title.style.opacity = tp.toFixed(3);
        title.style.transform = 'translateY(' + ((1 - tp) * 30).toFixed(1) + 'px)';
      }
      if (sub) {
        var sp = ef(sub01(p, 0.42, 0.66));
        sub.style.opacity = sp.toFixed(3);
        sub.style.transform = 'translateY(' + ((1 - sp) * 18).toFixed(1) + 'px)';
      }
      // (C) parallax-pan 0.55..0.90
      if (bg) {
        var pp = ef(sub01(p, 0.55, 0.90));
        bg.style.transform = 'translateY(' + (-pp * opt.panY).toFixed(1) + 'px)';
      }
      // (D) exit-rise 0.85..1.00
      var xp = ef(sub01(p, 0.85, 1.0));
      hero.style.opacity = (1 - xp).toFixed(3);
      hero.style.transform = 'translateY(' + (-xp * opt.exitY).toFixed(1) + 'px)';
    }
    apply(0);

    if (!options.manualDrive && (reduced || narrow || !gsap || !ScrollTrigger)) {
      hero.classList.add('nfe-static'); apply(0.7); // photo + title shown, no exit
      hero.style.opacity = '1'; hero.style.transform = 'none';
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { static: true, set: apply, destroy: function () {} };
    }

    // manualDrive (dual-platform): expose set() without the engine's own pin/ScrollTrigger.
    if (options.manualDrive) {
      apply(0); try { global.__LAB_OK__ = true; } catch (e) {}
      return { manual: true, set: apply, destroy: function () {} };
    }

    if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
    if (gsap && gsap.ticker) gsap.ticker.lagSmoothing(0);
    var lenis = null;
    if (opt.manageLenis && !options.manualDrive && Lenis && ScrollTrigger) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      global.__lenis = lenis;
    }

    var trigger = ScrollTrigger.create({
      trigger: hero, start: 'top top',
      end: function () { return '+=' + Math.round(global.innerHeight * opt.pinFactor); },
      pin: true, pinSpacing: true, scrub: true,
      onUpdate: function (self) { apply(self.progress); }
    });
    apply(0);

    global.addEventListener('resize', function () { ScrollTrigger.refresh(); });
    hero.classList.add('nfe-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, set: apply,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.NumeralFrameExpandHero = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
