/* ============================================================
   POI-CAPTION-CAROUSEL · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   r1864's standalone POI card-rail — a horizontal row of place cards, EACH with its CAPTION
   directly UNDER the card (the caption travels WITH the card), advancing in a BIG STEP via round
   ‹ › arrows (page-by-page, not one card) with EDGE-PEEK of the next card. On enter the cards
   STAGGER up from below. The "what's nearby" rail. Harvested from D_r1864 (r18641 /location:
   НАБЕРЕЖНАЯ МОСКВЫ-РЕКИ / ПАРК «ЗАРЯДЬЕ» / ГУМ / РЕПИНСКИЙ СКВЕР / ТРЕТЬЯКОВСКАЯ ГАЛЕРЕЯ).

   Distinct from: horizontal-spec-carousel (11tanjung — a SWAPPING spec-row + vertical-pill arrows,
   one-step), map-dim-carousel-announce (this rail COMPOSED over a dimmed map + announce). This is
   the reusable standalone rail: per-card caption-under, big-step paging, active emphasis, drag.

   THE MOVE:
     A) ENTER (scroll-into-view scrub, p 0..1) — set(p):
        cards stagger fade + translateY 44->0, each offset, over 0.0..1.0 (PURE scrub).
     B) PAGE (round ‹ › arrows / drag / dots) — translateX the rail by pageStep card-steps
        (eased, not scroll), clamped at the ends unless loop. Active page's cards get full
        opacity; off-page cards dim (activeDim). EDGE-PEEK via track padding.

   CONFIG-DRIVEN:
     PoiCaptionCarousel.create(target, {           // target = .pcc-stage
       start: 'top 78%', pageStep: 0, ease: 'power3.out', slideDur: 0.7,
       loop: false, activeDim: 0.55, cardStagger: 0.1, once: true, manageLenis: true
     })
   pageStep 0 = auto (advance by the number of fully-visible cards). Markup: .pcc-stage >
   .pcc-rail-wrap ( .pcc-rail > .pcc-card( .pcc-card-img + .pcc-card-cap ) x N ) +
   .pcc-nav( .pcc-prev + .pcc-counter + .pcc-next ). Returns { trigger, set(p), play(), next(), prev(), go(i), destroy }.

   ENGINE LAWS: transform + opacity only; GPU; NO mix-blend; NO WebGL; reduced-motion / <=820px
   -> shown, rail scrolls native overflow-x. F-08 drag law: pointer move/up/cancel on WINDOW,
   settle always on end, step only if moved && past threshold. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      start: options.start || 'top 78%',
      pageStep: options.pageStep != null ? options.pageStep : 0, // 0 = auto (visible count)
      ease: options.ease || 'power3.out',
      slideDur: options.slideDur != null ? options.slideDur : 0.7,
      loop: !!options.loop,
      activeDim: options.activeDim != null ? options.activeDim : 0.55,
      cardStagger: options.cardStagger != null ? options.cardStagger : 0.1,
      once: options.once !== false,
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var railWrap = stage.querySelector('.pcc-rail-wrap');
    var rail = stage.querySelector('.pcc-rail');
    var cards = [].slice.call(stage.querySelectorAll('.pcc-card'));
    var counter = stage.querySelector('.pcc-counter');
    var nextBtn = stage.querySelector('.pcc-next');
    var prevBtn = stage.querySelector('.pcc-prev');
    var dots = [].slice.call(stage.querySelectorAll('.pcc-dot'));
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    var N = cards.length, page = 0;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function efOut(t) { return opt.ease === 'expo.out' ? (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) : 1 - Math.pow(1 - t, 3); }
    function sub01(p, a, b) { return clamp01((p - a) / (b - a)); }
    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function cardStep() {
      if (N < 2) return cards[0] ? cards[0].getBoundingClientRect().width : 0;
      var a = cards[0].getBoundingClientRect(), b = cards[1].getBoundingClientRect();
      return b.left - a.left;
    }
    function visibleCount() {
      var step = cardStep(); if (!step || !railWrap) return 1;
      return Math.max(1, Math.floor((railWrap.clientWidth + 1) / step));
    }
    function stepCards() { return opt.pageStep > 0 ? opt.pageStep : visibleCount(); }
    function pageCount() { return Math.max(1, Math.ceil(N / stepCards())); }
    function maxStartIndex() { return Math.max(0, N - visibleCount()); }

    // ENTER scrub: cards stagger up
    function apply(p) {
      p = clamp01(p);
      cards.forEach(function (c, i) {
        var a = i * opt.cardStagger * (0.7 / Math.max(1, N));
        var cp = efOut(sub01(p, a, Math.min(1, a + 0.5)));
        c.style.opacity = (cp * (isActiveIndex(i) ? 1 : opt.activeDim)).toFixed(3);
        c.style.transform = 'translateY(' + ((1 - cp) * 44).toFixed(1) + 'px)';
      });
    }

    function pageStartIndex(pg) { return Math.min(pg * stepCards(), maxStartIndex()); }
    function isActiveIndex(i) {
      var s = pageStartIndex(page); var vc = visibleCount();
      return i >= s && i < s + vc;
    }

    function applyDim() {
      cards.forEach(function (c, i) { c.style.opacity = isActiveIndex(i) ? '1' : String(opt.activeDim); });
    }

    function railX() {
      if (!rail) return;
      var x = -pageStartIndex(page) * cardStep();
      if (gsap && !reduced) gsap.to(rail, { x: x, duration: opt.slideDur, ease: opt.ease, onUpdate: applyDim, onComplete: applyDim });
      else { rail.style.transform = 'translateX(' + x + 'px)'; applyDim(); }
      if (counter) counter.textContent = pad(page + 1) + ' / ' + pad(pageCount());
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === page); });
    }
    function go(pg) {
      var pc = pageCount();
      if (opt.loop) pg = ((pg % pc) + pc) % pc; else pg = pg < 0 ? 0 : pg > pc - 1 ? pc - 1 : pg;
      stage.classList.add('pcc-paged'); // enable the dim-swap transition now that the enter is done
      if (pg === page) { applyDim(); return; }
      page = pg; railX();
    }
    function next() { go(page + 1); }
    function prev() { go(page - 1); }

    apply(0);
    if (counter) counter.textContent = pad(1) + ' / ' + pad(pageCount());
    if (dots[0]) dots[0].classList.add('is-active');

    if (nextBtn) nextBtn.addEventListener('click', function (e) { e.preventDefault(); next(); });
    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.preventDefault(); prev(); });
    dots.forEach(function (d, k) { d.addEventListener('click', function (e) { e.preventDefault(); go(k); }); });

    // ---- drag (F-08 law: window listeners, settle always) ----
    var dragging = false, startX = 0, baseX = 0, moved = 0;
    function curX() { if (gsap) return gsap.getProperty(rail, 'x') || 0; var m = /translateX\((-?[\d.]+)px\)/.exec(rail.style.transform); return m ? parseFloat(m[1]) : 0; }
    function onDown(e) {
      if (!rail) return; dragging = true; moved = 0;
      startX = (e.touches ? e.touches[0].clientX : e.clientX);
      baseX = curX(); if (gsap) gsap.killTweensOf(rail);
      global.addEventListener('pointermove', onMove); global.addEventListener('pointerup', onUp); global.addEventListener('pointercancel', onUp);
    }
    function onMove(e) {
      if (!dragging) return;
      var x = (e.touches ? e.touches[0].clientX : e.clientX);
      moved = x - startX;
      rail.style.transform = 'translateX(' + (baseX + moved) + 'px)';
    }
    function onUp() {
      if (!dragging) return; dragging = false;
      global.removeEventListener('pointermove', onMove); global.removeEventListener('pointerup', onUp); global.removeEventListener('pointercancel', onUp);
      var thresh = Math.max(60, cardStep() * 0.25);
      if (Math.abs(moved) >= thresh) { moved < 0 ? next() : prev(); }
      else railX(); // settle back
    }
    if (railWrap) railWrap.addEventListener('pointerdown', onDown);

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      stage.classList.add('pcc-static'); apply(1); applyDim();
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { static: true, set: apply, play: function () { apply(1); }, next: next, prev: prev, go: go, destroy: function () {} };
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
        gsap.to(o, { p: 1, duration: 1.0, ease: 'none', onUpdate: function () { apply(o.p); }, onComplete: applyDim });
      },
      onLeaveBack: opt.once ? null : function () { played = false; apply(0); }
    });

    var onResize = function () { railX(); };
    global.addEventListener('resize', onResize);

    stage.classList.add('pcc-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, set: apply, play: function () { apply(1); applyDim(); },
      next: next, prev: prev, go: go,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { global.removeEventListener('resize', onResize); trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.PoiCaptionCarousel = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
