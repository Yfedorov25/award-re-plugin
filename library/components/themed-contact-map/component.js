/* ============================================================
   THEMED-CONTACT-MAP · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   r1864's /contacts map — the river-tinted-poi-map DIALECT stripped to a SINGLE destination:
   the warm-taupe drawn district map (river + parks + roads + a couple of orienting landmark
   glyphs) carries ONE pin — the "ОФИС ПРОДАЖ" (sales office) — that DROPS + PULSES on enter,
   beside (or over) a CONTACT PANEL (address / phone / hours / a framed CTA). The "where to find
   us" map. The third map dialect's CONTACT variant. Harvested from D_r1864 (r18645 /location
   map dialect; r1864 /contacts: single ОФИС ПРОДАЖ pill).

   Distinct from river-tinted-poi-map (the FULL POI atlas: many pins + the 1864 disc) and
   map-dim-carousel-announce (the map DIMMED as a backdrop for a card rail). HERE: one focused
   pin + a contact block, the map at full presence.

   THE MOVE (scroll-into-view scrub, p 0..1) — set(p), PURE:
     - map: fade 0->1 + a tiny scale 1.03->1 over 0..0.5
     - the 1864 disc (the residence marker): fade + scale 0.6->1 over 0.30..0.6
     - the ОФИС-ПРОДАЖ pin: DROP (translateY -22->0) + fade over 0.45..0.75, then a looping PULSE
       (a ring scales 1->1.8 + fades) starts once revealed
     - contact panel: fade + translateY 24->0, lines staggered, over 0.55..1.0
   owns_pin OPTIONAL.

   CONFIG-DRIVEN:
     ThemedContactMap.create(target, {             // target = .tcm-stage
       start: 'top 76%', pulse: true, pulseDur: 2.0, duration: 1.1, ease: 'power3.out',
       once: true, pin: false, manageLenis: true
     })
   Markup: .tcm-stage > .tcm-map ( svg + .tcm-disc[data-disc] + .tcm-pin[data-pin]( .tcm-pin-ring
   + .tcm-pin-dot + .tcm-pin-lbl ) ) + .tcm-panel ( .tcm-line x N + .tcm-cta ).
   Returns { trigger, set(p), play(), destroy }.

   ENGINE LAWS: transform + opacity only; GPU; NO mix-blend; NO WebGL; reduced-motion / <=820px
   -> shown, no pulse. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      start: options.start || 'top 76%',
      pulse: options.pulse !== false,
      pulseDur: options.pulseDur != null ? options.pulseDur : 2.0,
      duration: options.duration != null ? options.duration : 1.1,
      ease: options.ease || 'power3.out',
      once: options.once !== false,
      pin: !!options.pin,
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var map = stage.querySelector('.tcm-map');
    var mapSvg = stage.querySelector('.tcm-map svg');
    var disc = stage.querySelector('.tcm-disc');
    var pin = stage.querySelector('.tcm-pin');
    var ring = stage.querySelector('.tcm-pin-ring');
    var panel = stage.querySelector('.tcm-panel');
    var lines = [].slice.call(stage.querySelectorAll('.tcm-line, .tcm-cta'));
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function efOut(t) { return opt.ease === 'expo.out' ? (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) : 1 - Math.pow(1 - t, 3); }
    function sub01(p, a, b) { return clamp01((p - a) / (b - a)); }

    function apply(p) {
      p = clamp01(p);
      if (mapSvg) {
        var mp = efOut(sub01(p, 0.0, 0.5));
        mapSvg.style.opacity = mp.toFixed(3);
        mapSvg.style.transform = 'scale(' + (1.03 + (1 - 1.03) * mp).toFixed(4) + ')';
      }
      if (disc) {
        var dp = efOut(sub01(p, 0.30, 0.6));
        disc.style.opacity = dp.toFixed(3);
        disc.style.transform = 'translate(-50%, -50%) scale(' + (0.6 + 0.4 * dp).toFixed(3) + ')';
      }
      if (pin) {
        var pp = efOut(sub01(p, 0.45, 0.75));
        pin.style.opacity = pp.toFixed(3);
        // drop in: the pin anchors at its bottom; translateY from -22 to 0
        pin.style.transform = 'translate(-50%, -100%) translateY(' + ((1 - pp) * -22).toFixed(1) + 'px)';
      }
      lines.forEach(function (el, i) {
        var a = 0.55 + i * 0.06;
        var lp = efOut(sub01(p, a, Math.min(1, a + 0.4)));
        el.style.opacity = lp.toFixed(3);
        el.style.transform = 'translateY(' + ((1 - lp) * 24).toFixed(1) + 'px)';
      });
    }
    apply(0);

    var pulseTween = null;
    function startPulse() {
      if (!opt.pulse || !ring || !gsap || reduced || pulseTween) return;
      gsap.set(ring, { scale: 1, opacity: 0.5, transformOrigin: '50% 50%' });
      pulseTween = gsap.to(ring, {
        scale: 1.8, opacity: 0, duration: opt.pulseDur, ease: 'power1.out', repeat: -1
      });
    }

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      stage.classList.add('tcm-static'); apply(1);
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
    var conf = {
      trigger: stage, start: opt.start,
      onEnter: function () {
        if (played && opt.once) return; played = true;
        var o = { p: 0 };
        gsap.to(o, { p: 1, duration: opt.duration, ease: 'none', onUpdate: function () { apply(o.p); }, onComplete: startPulse });
      },
      onLeaveBack: opt.once ? null : function () { played = false; apply(0); if (pulseTween) { pulseTween.kill(); pulseTween = null; } }
    };
    if (opt.pin) { conf.pin = stage; conf.start = 'top top'; conf.end = '+=' + (global.innerHeight || 800); conf.pinSpacing = true; }
    var trigger = ScrollTrigger.create(conf);

    stage.classList.add('tcm-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, set: apply, play: function () { apply(1); startPulse(); },
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { if (pulseTween) pulseTween.kill(); trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.ThemedContactMap = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
