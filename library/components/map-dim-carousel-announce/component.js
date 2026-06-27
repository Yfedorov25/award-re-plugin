/* ============================================================
   MAP-DIM-CAROUSEL-ANNOUNCE · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   r1864's /location announce — a POI MAP that DIMS (opacity/brightness 1 -> ~0.3) to become a
   dark BACKDROP as the section enters, while a giant serif HEADLINE + sub rise over it and a
   RAIL of N location CARDS (photo + caption-under) STAGGERS in from below; a circular -> arrow
   advances the rail. On leave-back the carousel collapses and the map RECLAIMS full opacity.
   The "look where this sits" chapter, laid over a living map. Harvested from D_r1864 (r18641
   /location: 'ОДИН ИЗ САМЫХ ПРИВИЛЕГИРОВАННЫХ РАЙОНОВ СТОЛИЦЫ' + 5 cards over the dimmed map).
   Designed to compose OVER river-tinted-poi-map (Brick 3) as the backdrop.

   THE MOVE:
     A) ENTER (scroll-into-view scrub, progress p 0..1) — set(p):
        - map backdrop: opacity 1 -> dimTo (0.3) + scale 1 -> 1.04 (a slight push-back) over 0..0.5
        - headline: fade + translateY 30 -> 0 over 0.15..0.5; sub 0.30..0.6
        - cards: stagger fade + translateY 40 -> 0, each card offset by `cardStagger` of the
          remaining window (0.45..1.0)
        set(p) is a PURE scrub. owns_pin OPTIONAL (pin to hold the map while the announce plays).
     B) ADVANCE (the -> arrow / .mdc-prev / dots) — translateX the rail by one card-step
        (eased, not scroll); clamps at the ends (no wrap — it's a finite rail) unless loop:true.

   CONFIG-DRIVEN:
     MapDimCarouselAnnounce.create(target, {        // target = .mdc-stage
       start: 'top 75%', dimTo: 0.3, mapScaleTo: 1.04, cardStagger: 0.12,
       step: 1, loop: false, pin: false, revealDur: 1.1, slideDur: 0.6,
       ease: 'power3.out', once: true, manageLenis: true
     })
   Markup: .mdc-stage > .mdc-map (the dimmable backdrop: SVG/img) + .mdc-overlay
   ( .mdc-headline + .mdc-sub + .mdc-rail-wrap ( .mdc-rail > .mdc-card x N ) +
   .mdc-nav( .mdc-prev + .mdc-arrow ) ). Returns { trigger, set(p), play(), next(), prev(), go(i), destroy }.

   ENGINE LAWS: opacity + transform (translate/scale) only; GPU; NO mix-blend over the map; NO
   WebGL; reduced-motion / <=820px -> shown (map dimmed, cards visible, rail scrolls native).
   Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      start: options.start || 'top 75%',
      dimTo: options.dimTo != null ? options.dimTo : 0.3,
      mapScaleTo: options.mapScaleTo != null ? options.mapScaleTo : 1.04,
      cardStagger: options.cardStagger != null ? options.cardStagger : 0.12,
      step: options.step != null ? options.step : 1,
      loop: !!options.loop,
      pin: !!options.pin,
      revealDur: options.revealDur != null ? options.revealDur : 1.1,
      slideDur: options.slideDur != null ? options.slideDur : 0.6,
      ease: options.ease || 'power3.out',
      once: options.once !== false,
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var map = stage.querySelector('.mdc-map');
    var headline = stage.querySelector('.mdc-headline');
    var sub = stage.querySelector('.mdc-sub');
    var railWrap = stage.querySelector('.mdc-rail-wrap');
    var rail = stage.querySelector('.mdc-rail');
    var cards = [].slice.call(stage.querySelectorAll('.mdc-card'));
    var nav = stage.querySelector('.mdc-nav');
    var arrow = stage.querySelector('.mdc-arrow');
    var prevBtn = stage.querySelector('.mdc-prev');
    var dots = [].slice.call(stage.querySelectorAll('.mdc-dot'));
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function efOut(t) { return opt.ease === 'expo.out' ? (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) : 1 - Math.pow(1 - t, 3); }
    function sub01(p, a, b) { return clamp01((p - a) / (b - a)); }

    var N = cards.length || 1;
    var idx = 0;

    // ---- card-step geometry (for the rail translate) ----
    function cardStep() {
      if (N < 2) return 0;
      var a = cards[0].getBoundingClientRect(), b = cards[1].getBoundingClientRect();
      return b.left - a.left; // card width + gap
    }
    function maxIndex() {
      if (!railWrap || !rail) return N - 1;
      var step = cardStep(); if (!step) return N - 1;
      var visible = Math.max(1, Math.round(railWrap.clientWidth / step));
      return Math.max(0, N - visible);
    }

    // ---- A) ENTER reveal scrub ----
    function apply(p) {
      p = clamp01(p);
      // map dims + pushes back
      if (map) {
        var mp = efOut(sub01(p, 0.0, 0.5));
        map.style.opacity = (1 - (1 - opt.dimTo) * mp).toFixed(3);
        map.style.transform = 'scale(' + (1 + (opt.mapScaleTo - 1) * mp).toFixed(4) + ')';
      }
      // headline
      if (headline) {
        var hp = efOut(sub01(p, 0.15, 0.5));
        headline.style.opacity = hp.toFixed(3);
        headline.style.transform = 'translateY(' + ((1 - hp) * 30).toFixed(1) + 'px)';
      }
      // sub
      if (sub) {
        var sp = efOut(sub01(p, 0.30, 0.6));
        sub.style.opacity = sp.toFixed(3);
        sub.style.transform = 'translateY(' + ((1 - sp) * 22).toFixed(1) + 'px)';
      }
      // cards stagger 0.45..1.0
      cards.forEach(function (c, i) {
        var a = 0.45 + i * opt.cardStagger * (0.55 / Math.max(1, N));
        var cp = efOut(sub01(p, a, Math.min(1, a + 0.4)));
        c.style.opacity = cp.toFixed(3);
        c.style.transform = 'translateY(' + ((1 - cp) * 40).toFixed(1) + 'px)';
      });
      // nav appears with the cards
      if (nav) {
        var np = efOut(sub01(p, 0.7, 1.0));
        nav.style.opacity = np.toFixed(3);
      }
    }

    // ---- B) ADVANCE the rail ----
    function railX() {
      if (!rail) return;
      var x = -idx * cardStep();
      if (gsap && !reduced) gsap.to(rail, { x: x, duration: opt.slideDur, ease: opt.ease });
      else rail.style.transform = 'translateX(' + x + 'px)';
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === idx); });
    }
    function go(i) {
      var mx = maxIndex();
      if (opt.loop) { i = ((i % N) + N) % N; }
      else { i = i < 0 ? 0 : i > mx ? mx : i; }
      if (i === idx) return;
      idx = i; railX();
    }
    function next() { go(idx + opt.step); }
    function prev() { go(idx - opt.step); }

    apply(0);

    // wiring
    if (arrow) arrow.addEventListener('click', function (e) { e.preventDefault(); next(); });
    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.preventDefault(); prev(); });
    dots.forEach(function (d, k) { d.addEventListener('click', function (e) { e.preventDefault(); go(k); }); });

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      stage.classList.add('mdc-static'); apply(1);
      try { global.__LAB_OK__ = true; } catch (e) {}
      return {
        static: true, set: apply, play: function () { apply(1); },
        next: next, prev: prev, go: go, destroy: function () {}
      };
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
    var stConf = {
      trigger: stage, start: opt.start,
      onEnter: function () {
        if (played && opt.once) return; played = true;
        var o = { p: 0 };
        gsap.to(o, { p: 1, duration: opt.revealDur, ease: 'none', onUpdate: function () { apply(o.p); } });
      },
      onLeaveBack: opt.once ? null : function () { played = false; apply(0); }
    };
    if (opt.pin) { stConf.pin = stage; stConf.start = 'top top'; stConf.end = '+=' + (global.innerHeight || 800); stConf.pinSpacing = true; stConf.scrub = false; }
    var trigger = ScrollTrigger.create(stConf);

    var onResize = function () { railX(); };
    global.addEventListener('resize', onResize);

    stage.classList.add('mdc-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, set: apply, play: function () { apply(1); },
      next: next, prev: prev, go: go,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { global.removeEventListener('resize', onResize); trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.MapDimCarouselAnnounce = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
