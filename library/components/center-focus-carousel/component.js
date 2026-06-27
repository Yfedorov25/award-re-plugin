/* ============================================================
   CENTER-FOCUS-CAROUSEL · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   r1864's /architecture + /comfort feature carousel — a row of vertical PANELS where the
   CENTRE panel is in FOCUS (slightly larger + full brightness, its caption lit) and the side
   panels are DIMMED peek-insets (smaller + darkened), with EDGE-PEEK of the next panel; round
   ‹ › arrows (+ a "N / TOTAL" counter) rotate WHICH panel is centred. Each panel = a full-
   height image + a caption at its bottom-left. On enter the panels stagger up. The "the
   building's qualities, one at a time, in focus" chapter. Harvested from D_r1864 (r18641
   /comfort: ЛИФТЫ / ОСТЕКЛЕНИЕ / ИНЖЕНЕРНЫЕ СИСТЕМЫ / БЕЗОПАСНОСТЬ / СЕРВИС / ПАРКИНГ, ‹ N/5 ›).

   Distinct from: fullscreen-media-carousel (ONE full-bleed slide, no focus/peek),
   center-seam-split (a seam-opener, not a carousel), poi-caption-carousel (a flat rail, no
   centre-focus emphasis). This is the 3-up CENTRE-FOCUS panel carousel.

   THE MOVE:
     A) ENTER (scroll-into-view scrub, p 0..1) — set(p):
        panels stagger fade + translateY 40->0 over 0..1 (PURE scrub), then layout() applies
        the focus geometry.
     B) ROTATE (‹ › arrows / drag / dots) — change the centred index; layout() re-positions:
        the active panel scales to 1 + brightness 1 + caption lit; neighbours scale to sideScale
        + brightness sideDim; the rail translateX so the active panel sits centred; counter
        updates; wraps (loop) or clamps.

   CONFIG-DRIVEN:
     CenterFocusCarousel.create(target, {          // target = .cfc-stage
       start: 'top 74%', sideScale: 0.9, sideDim: 0.5, slideDur: 0.7, ease: 'power3.out',
       loop: true, once: true, manageLenis: true
     })
   Markup: .cfc-stage > .cfc-viewport ( .cfc-rail > .cfc-panel( .cfc-panel-img + .cfc-panel-cap ) x N )
   + .cfc-nav( .cfc-prev + .cfc-counter + .cfc-next ). Returns { trigger, set(p), play(), next(), prev(), go(i), destroy }.

   ENGINE LAWS: transform + opacity + filter(brightness) only; GPU; NO mix-blend; NO WebGL;
   reduced-motion / <=820px -> shown, rail scrolls native. F-08 drag law (window listeners,
   settle always). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      start: options.start || 'top 74%',
      sideScale: options.sideScale != null ? options.sideScale : 0.9,
      sideDim: options.sideDim != null ? options.sideDim : 0.5,
      slideDur: options.slideDur != null ? options.slideDur : 0.7,
      ease: options.ease || 'power3.out',
      loop: options.loop !== false,
      once: options.once !== false,
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var viewport = stage.querySelector('.cfc-viewport');
    var rail = stage.querySelector('.cfc-rail');
    var panels = [].slice.call(stage.querySelectorAll('.cfc-panel'));
    var counter = stage.querySelector('.cfc-counter');
    var nextBtn = stage.querySelector('.cfc-next');
    var prevBtn = stage.querySelector('.cfc-prev');
    var dots = [].slice.call(stage.querySelectorAll('.cfc-dot'));
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    var N = panels.length, cur = 0;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function efOut(t) { return opt.ease === 'expo.out' ? (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) : 1 - Math.pow(1 - t, 3); }
    function sub01(p, a, b) { return clamp01((p - a) / (b - a)); }
    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function panelStep() {
      if (N < 2) return panels[0] ? panels[0].getBoundingClientRect().width : 0;
      var a = panels[0].getBoundingClientRect(), b = panels[1].getBoundingClientRect();
      return b.left - a.left;
    }

    // position the rail so the active panel is centred; set per-panel focus geometry
    function layout(animate) {
      if (!rail || !viewport) return;
      var step = panelStep();
      var pw = panels[0] ? panels[0].getBoundingClientRect().width : step;
      var centreOffset = (viewport.clientWidth - pw) / 2;
      var x = centreOffset - cur * step;
      var railProps = { x: x };
      if (gsap && animate && !reduced) gsap.to(rail, Object.assign({ duration: opt.slideDur, ease: opt.ease }, railProps));
      else rail.style.transform = 'translateX(' + x + 'px)';
      panels.forEach(function (pn, i) {
        var active = i === cur;
        var props = { scale: active ? 1 : opt.sideScale, filter: 'brightness(' + (active ? 1 : opt.sideDim) + ')' };
        var cap = pn.querySelector('.cfc-panel-cap');
        if (gsap && animate && !reduced) {
          gsap.to(pn, Object.assign({ duration: opt.slideDur, ease: opt.ease }, props));
          if (cap) gsap.to(cap, { opacity: active ? 1 : 0.0, duration: opt.slideDur, ease: opt.ease });
        } else {
          pn.style.transform = 'scale(' + props.scale + ')';
          pn.style.filter = props.filter;
          if (cap) cap.style.opacity = active ? '1' : '0';
        }
      });
      if (counter) counter.textContent = pad(cur + 1) + ' / ' + pad(N);
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === cur); });
    }

    // ENTER scrub: panels stagger up (opacity/translateY), focus geometry applied at the end
    function apply(p) {
      p = clamp01(p);
      panels.forEach(function (pn, i) {
        var a = i * 0.08;
        var cp = efOut(sub01(p, a, Math.min(1, a + 0.5)));
        pn.style.opacity = cp.toFixed(3);
        // during enter, keep translateY; layout() owns scale/filter post-enter
        var baseScale = i === cur ? 1 : opt.sideScale;
        pn.style.transform = 'translateY(' + ((1 - cp) * 40).toFixed(1) + 'px) scale(' + baseScale + ')';
        pn.style.filter = 'brightness(' + (i === cur ? 1 : opt.sideDim) + ')';
        var cap = pn.querySelector('.cfc-panel-cap');
        if (cap) cap.style.opacity = (i === cur ? cp : 0).toFixed(3);
      });
    }

    function go(i) {
      if (opt.loop) i = ((i % N) + N) % N; else i = i < 0 ? 0 : i > N - 1 ? N - 1 : i;
      if (i === cur) { layout(true); return; }
      cur = i; layout(true);
    }
    function next() { go(cur + 1); }
    function prev() { go(cur - 1); }

    // init
    panels.forEach(function (pn) { pn.style.opacity = '0'; });
    apply(0);

    if (nextBtn) nextBtn.addEventListener('click', function (e) { e.preventDefault(); next(); });
    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.preventDefault(); prev(); });
    panels.forEach(function (pn, i) { pn.addEventListener('click', function () { if (i !== cur) go(i); }); });
    dots.forEach(function (d, k) { d.addEventListener('click', function (e) { e.preventDefault(); go(k); }); });

    // ---- drag (F-08 law) ----
    var dragging = false, startX = 0, moved = 0;
    function onDown(e) {
      dragging = true; moved = 0;
      startX = (e.touches ? e.touches[0].clientX : e.clientX);
      global.addEventListener('pointermove', onMove); global.addEventListener('pointerup', onUp); global.addEventListener('pointercancel', onUp);
    }
    function onMove(e) { if (!dragging) return; moved = (e.touches ? e.touches[0].clientX : e.clientX) - startX; }
    function onUp() {
      if (!dragging) return; dragging = false;
      global.removeEventListener('pointermove', onMove); global.removeEventListener('pointerup', onUp); global.removeEventListener('pointercancel', onUp);
      var thresh = Math.max(50, panelStep() * 0.18);
      if (Math.abs(moved) >= thresh) { moved < 0 ? next() : prev(); } // else: no positional drag-follow; just settle (layout already correct)
    }
    if (viewport) viewport.addEventListener('pointerdown', onDown);

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      stage.classList.add('cfc-static'); apply(1); layout(false);
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { static: true, set: apply, play: function () { apply(1); layout(false); }, next: next, prev: prev, go: go, destroy: function () {} };
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
        gsap.to(o, { p: 1, duration: 1.0, ease: 'none', onUpdate: function () { apply(o.p); }, onComplete: function () { layout(false); } });
      },
      onLeaveBack: opt.once ? null : function () { played = false; apply(0); }
    });

    var onResize = function () { layout(false); };
    global.addEventListener('resize', onResize);

    stage.classList.add('cfc-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, set: apply, play: function () { apply(1); layout(false); },
      next: next, prev: prev, go: go,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { global.removeEventListener('resize', onResize); trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.CenterFocusCarousel = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
