/* ============================================================
   DUAL-IMAGE-SPLIT-STAT · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   r1864's apartment-type gallery — a CAROUSEL where each slide is a DUAL-IMAGE SPLIT
   (left interior + right city-view, side by side) with a STAT-ROW OVERLAID across the bottom
   (площадь / спальни / высота) + a type TITLE; round ‹ › arrows (+ a "NN / N" counter) swap
   the WHOLE pair. On enter the active split clip-reveals from the centre seam outward + the
   stat-row rises. The "compare the type — inside vs the view" chapter. Harvested from D_r1864
   (r18641 /comfort + apartment types: a split text/stat panel beside a full interior, ‹ › 2/2).

   Distinct from: fullscreen-media-carousel (ONE full-bleed slide), center-seam-split (a
   seam-reveal, not a carousel), collection-tier-announce (a stacked ladder, not swappable).

   THE MOVE:
     A) ENTER (scroll-into-view scrub, p 0..1) — set(p):
        - active split: the two images clip-reveal from the CENTRE seam outward
          (left img inset-right 100%->0, right img inset-left 100%->0) over 0..0.6
        - title fade + translateY 24->0 over 0.25..0.55
        - stat-row: each stat fade + translateY 20->0 staggered over 0.45..1.0
        set(p) is a PURE scrub.
     B) SWAP (‹ › arrows / dots / drag) — cross-fade + slight scale between split pairs
        (eased, not scroll); the stat-row + title cross-fade to the new type; counter updates;
        finite (clamped) unless loop:true.

   CONFIG-DRIVEN:
     DualImageSplitStat.create(target, {           // target = .dss-stage
       start: 'top 72%', revealDur: 1.0, swapDur: 0.6, ease: 'power3.out',
       loop: true, once: true, manageLenis: true
     })
   Markup: .dss-stage > .dss-viewport ( .dss-slide[data-title][data-stats] x N, each =
   .dss-split( .dss-img.dss-img--l + .dss-img.dss-img--r ) ) + .dss-meta( .dss-title +
   .dss-stats( .dss-stat[ .dss-num + .dss-lab ] ) ) + .dss-nav( .dss-prev + .dss-counter + .dss-next ).
   Returns { trigger, set(p), play(), next(), prev(), go(i), destroy }.

   ENGINE LAWS: clip-path(inset) + transform + opacity only; GPU; NO mix-blend; NO WebGL;
   reduced-motion / <=820px -> shown (first split shown, stats visible). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      start: options.start || 'top 72%',
      revealDur: options.revealDur != null ? options.revealDur : 1.0,
      swapDur: options.swapDur != null ? options.swapDur : 0.6,
      ease: options.ease || 'power3.out',
      loop: options.loop !== false,
      once: options.once !== false,
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var slides = [].slice.call(stage.querySelectorAll('.dss-slide'));
    var title = stage.querySelector('.dss-title');
    var statsWrap = stage.querySelector('.dss-stats');
    var counter = stage.querySelector('.dss-counter');
    var nextBtn = stage.querySelector('.dss-next');
    var prevBtn = stage.querySelector('.dss-prev');
    var dots = [].slice.call(stage.querySelectorAll('.dss-dot'));
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    var N = slides.length || 1, cur = 0;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function efOut(t) { return opt.ease === 'expo.out' ? (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) : 1 - Math.pow(1 - t, 3); }
    function sub01(p, a, b) { return clamp01((p - a) / (b - a)); }
    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function partsOf(s) {
      return { l: s.querySelector('.dss-img--l'), r: s.querySelector('.dss-img--r') };
    }

    // render the meta (title + stat-row) for slide i
    function renderMeta(i) {
      var s = slides[i]; if (!s) return;
      if (title) title.textContent = s.getAttribute('data-title') || '';
      if (statsWrap) {
        var raw = s.getAttribute('data-stats') || '';
        // "105-165|Площадь, м² ; 1-2|Спальни ; 3,4|Высота, м"
        statsWrap.innerHTML = '';
        raw.split(';').forEach(function (pair) {
          pair = pair.trim(); if (!pair) return;
          var bits = pair.split('|');
          var el = doc.createElement('div'); el.className = 'dss-stat';
          var num = doc.createElement('div'); num.className = 'dss-num'; num.textContent = (bits[0] || '').trim();
          var lab = doc.createElement('div'); lab.className = 'dss-lab'; lab.textContent = (bits[1] || '').trim();
          el.appendChild(num); el.appendChild(lab); statsWrap.appendChild(el);
        });
      }
    }

    // ENTER scrub for the active split
    function apply(p) {
      p = clamp01(p);
      var s = slides[cur]; if (!s) return;
      var pr = partsOf(s);
      var rp = efOut(sub01(p, 0.0, 0.6));
      if (pr.l) { pr.l.style.clipPath = pr.l.style.webkitClipPath = 'inset(0 ' + ((1 - rp) * 100).toFixed(2) + '% 0 0)'; }
      if (pr.r) { pr.r.style.clipPath = pr.r.style.webkitClipPath = 'inset(0 0 0 ' + ((1 - rp) * 100).toFixed(2) + '%)'; }
      if (title) {
        var tp = efOut(sub01(p, 0.25, 0.55));
        title.style.opacity = tp.toFixed(3); title.style.transform = 'translateY(' + ((1 - tp) * 24).toFixed(1) + 'px)';
      }
      if (statsWrap) {
        var st = [].slice.call(statsWrap.querySelectorAll('.dss-stat'));
        st.forEach(function (e, k) {
          var a = 0.45 + k * 0.1;
          var sp = efOut(sub01(p, a, Math.min(1, a + 0.4)));
          e.style.opacity = sp.toFixed(3); e.style.transform = 'translateY(' + ((1 - sp) * 20).toFixed(1) + 'px)';
        });
      }
    }

    // SWAP between pairs
    var swapping = false;
    function go(i) {
      if (opt.loop) i = ((i % N) + N) % N; else i = i < 0 ? 0 : i > N - 1 ? N - 1 : i;
      if (i === cur || swapping) return;
      var outEl = slides[cur], inEl = slides[i];
      cur = i;
      if (counter) counter.textContent = pad(i + 1) + ' / ' + pad(N);
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === i); });
      renderMeta(i);
      // new split fully shown (no enter-clip on swap); animate the cross-fade
      var pr = partsOf(inEl);
      if (pr.l) pr.l.style.clipPath = pr.l.style.webkitClipPath = 'inset(0 0 0 0)';
      if (pr.r) pr.r.style.clipPath = pr.r.style.webkitClipPath = 'inset(0 0 0 0)';
      if (!gsap || reduced) {
        slides.forEach(function (s, k) { s.style.opacity = k === i ? '1' : '0'; s.style.zIndex = k === i ? '2' : '1'; });
        apply(1); return;
      }
      swapping = true;
      inEl.style.zIndex = '2'; outEl.style.zIndex = '1';
      gsap.fromTo(inEl, { opacity: 0, scale: 1.03 }, { opacity: 1, scale: 1, duration: opt.swapDur, ease: opt.ease, onComplete: function () { outEl.style.opacity = '0'; swapping = false; } });
      // bring stat-row/title in fresh
      apply(0);
      var o = { p: 0 };
      gsap.to(o, { p: 1, duration: opt.swapDur, ease: 'none', delay: opt.swapDur * 0.3, onUpdate: function () { apply(Math.max(o.p, 0.25)); } });
    }
    function next() { go(cur + 1); }
    function prev() { go(cur - 1); }

    // init
    slides.forEach(function (s, k) {
      s.style.opacity = k === 0 ? '1' : '0';
      s.style.zIndex = k === 0 ? '2' : '1';
      var pr = partsOf(s);
      if (pr.l) pr.l.style.clipPath = pr.l.style.webkitClipPath = 'inset(0 100% 0 0)';
      if (pr.r) pr.r.style.clipPath = pr.r.style.webkitClipPath = 'inset(0 0 0 100%)';
    });
    renderMeta(0);
    if (counter) counter.textContent = pad(1) + ' / ' + pad(N);
    if (dots[0]) dots[0].classList.add('is-active');
    apply(0);

    if (nextBtn) nextBtn.addEventListener('click', function (e) { e.preventDefault(); next(); });
    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.preventDefault(); prev(); });
    dots.forEach(function (d, k) { d.addEventListener('click', function (e) { e.preventDefault(); go(k); }); });

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      stage.classList.add('dss-static'); apply(1);
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
        gsap.to(o, { p: 1, duration: opt.revealDur, ease: 'none', onUpdate: function () { apply(o.p); } });
      },
      onLeaveBack: opt.once ? null : function () { played = false; apply(0); }
    });

    stage.classList.add('dss-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, set: apply, play: function () { apply(1); },
      next: next, prev: prev, go: go,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.DualImageSplitStat = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
