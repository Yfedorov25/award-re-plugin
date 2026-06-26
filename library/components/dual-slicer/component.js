/* ============================================================
   DUAL-SLICER · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + CustomEase + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   Springs' signature "Open the doors" COUPLED-SPLIT section, harvested from the
   frame-by-frame teardown of springs.estate (D_springs_dual_render_slicer_clip).

   THE MOVE (what makes it read "more custom than EVER"): ONE pinned scroll range
   drives TWO independent systems in one column-pair at once —
     RIGHT column = a vertical CLIP-PATH RENDER STRIP. A stack of >=2 renders; the
       incoming (lower) render is revealed UPWARD by shrinking its TOP inset
       (clip-path: inset(100% 0 0 0) -> inset(0)), scroll-scrubbed 1:1, reversible.
       Lower-render-covers-upper, a crisp full-width horizontal seam (NOT a fade,
       NOT two panels sliding opposite — a single-axis vertical clip reveal).
     LEFT column = SIMULTANEOUSLY: the heading reveals per-line (each line rises
       from under an overflow:hidden clip) AND a small inset photo rises from below
       the fold — both coupled to the SAME scroll. Then a sticky-media / scrolling-
       text finish.
   So multiple things move in one scroll beat off one scroll position. That is the
   "parallel" — not literally two opposite slides, but two decoupled scroll systems
   on one scrub. (The section can also enter via a vertical green curtain wipe; that
   entry is sequential and is the section-curtain-riseover/vertical-wipe primitive,
   not owned here.)

   CONFIG-DRIVEN:
     DualSlicer.init(target, {
       rightRenders: ['a.webp','b.webp','c.webp'],  // the strip (>=2). Or read from markup.
       lerp: 0.1, pinFactor: 1.4,
       headingLines: '.ds-head .ds-line',           // per-line reveal (optional)
       inset: '.ds-inset',                           // rising inset photo (optional)
       manageLenis: true
     })
   Markup-first: if rightRenders is omitted it uses the .ds-render children already
   in .ds-right. The strip handoffs are spread evenly across the pinned progress.

   ENGINE LAWS (verbatim from slice-clip): Lenis 1.1.13 lerp 0.1 smoothWheel ->
   gsap.ticker -> ScrollTrigger.update; lagSmoothing(0); render(prog) PURE fn from
   onUpdate + once at init; pin/pinSpacing/scrub:true; clip-path inset + transform
   + opacity only; GPU layers; NO mix-blend / NO backdrop over the scrubbed surface;
   NO video.currentTime; NO WebGL; reduced-motion / <=820px -> static stacked.
   Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';

  function init(target, options) {
    options = options || {};
    var opt = {
      lerp: options.lerp != null ? options.lerp : 0.1,
      pinFactor: options.pinFactor != null ? options.pinFactor : 1.4,
      headingLines: options.headingLines || '.ds-line',
      inset: options.inset || '.ds-inset',
      manageLenis: options.manageLenis !== false
    };

    var stage = typeof target === 'string' ? document.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, CustomEase = global.CustomEase, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    var right = stage.querySelector('.ds-right');
    var renders = [].slice.call(stage.querySelectorAll('.ds-render'));
    var lines = [].slice.call(stage.querySelectorAll(opt.headingLines));
    var inset = stage.querySelector(opt.inset);

    // static fallback
    if (reduced || narrow || !gsap || !ScrollTrigger || !Lenis || renders.length < 2) {
      stage.classList.add('ds-static');
      renders.forEach(function (r) { r.style.clipPath = 'none'; });
      lines.forEach(function (l) { var i = l.querySelector('.ds-line__i'); if (i) i.style.transform = 'none'; });
      if (inset) inset.style.transform = 'none';
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { static: true, destroy: function () {} };
    }

    gsap.registerPlugin(ScrollTrigger, CustomEase);
    if (!CustomEase.get || !CustomEase.get('dsGlide')) {
      try { CustomEase.create('dsGlide', '0.22,1,0.36,1'); } catch (e) {}
    }
    gsap.ticker.lagSmoothing(0);

    var lenis = null;
    if (opt.manageLenis) {
      lenis = new Lenis({ lerp: opt.lerp, smoothWheel: true, wheelMultiplier: 1 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      global.__lenis = lenis;
    }

    // initial state: every render above the first starts fully clipped (hidden, top inset 100%)
    renders.forEach(function (r, i) {
      r.style.willChange = 'clip-path';
      r.style.clipPath = i === 0 ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)';
    });
    lines.forEach(function (l) {
      var i = l.querySelector('.ds-line__i'); if (i) { i.style.willChange = 'transform'; i.style.transform = 'translateY(112%)'; }
    });
    if (inset) { inset.style.willChange = 'transform'; inset.style.transform = 'translateY(118%)'; }

    var N = renders.length;            // number of strip layers
    var handoffs = N - 1;              // number of seam sweeps

    // PURE render(prog): prog 0..1 over the whole pin
    function render(prog) {
      // RIGHT strip: spread the handoffs across the first ~70% of the pin, each
      // render i (>=1) reveals upward over its own slice. Lower covers upper.
      var stripEnd = 0.72;
      for (var i = 1; i < N; i++) {
        var segStart = (i - 1) / handoffs * stripEnd;
        var segEnd = i / handoffs * stripEnd;
        var p = (prog - segStart) / (segEnd - segStart);
        p = p < 0 ? 0 : p > 1 ? 1 : p;
        // top inset 100% -> 0% as p 0 -> 1  (seam travels UP)
        renders[i].style.clipPath = 'inset(' + ((1 - p) * 100).toFixed(2) + '% 0 0 0)';
      }
      // LEFT column, COUPLED to the SAME scroll. RULE (user): the left text must be
      // FULLY revealed by the time the FIRST render finishes opening. The first
      // render handoff completes at prog = stripEnd/handoffs (its segEnd). So the
      // whole left reveal (all heading lines + the inset) lands a hair BEFORE that.
      var firstHandoffEnd = stripEnd / handoffs;     // when render 1 is fully open
      var leftDone = firstHandoffEnd * 0.92;         // finish the text just before it
      var nLines = lines.length || 1;
      lines.forEach(function (l, k) {
        var i = l.querySelector('.ds-line__i'); if (!i) return;
        // stagger the lines across [0 .. leftDone], each line ~60% of the slice so
        // they overlap a touch; the LAST line still finishes by leftDone.
        var slice = leftDone / nLines;
        var ls = k * slice, le = ls + slice * 1.5;
        if (le > leftDone) le = leftDone;
        var p = (prog - ls) / (le - ls); p = p < 0 ? 0 : p > 1 ? 1 : p;
        i.style.transform = 'translateY(' + ((1 - p) * 112).toFixed(2) + '%)';
      });
      if (inset) {
        // inset also lands by leftDone (starts after the first line is moving)
        var p = (prog - sliceStart()) / (leftDone - sliceStart()); p = p < 0 ? 0 : p > 1 ? 1 : p;
        inset.style.transform = 'translateY(' + ((1 - p) * 118).toFixed(2) + '%)';
      }
      function sliceStart() { return (leftDone / nLines) * 0.5; }
    }

    var trigger = ScrollTrigger.create({
      trigger: stage,
      start: 'top top',
      end: '+=' + Math.round(global.innerHeight * opt.pinFactor * Math.max(1, handoffs)),
      pin: true,
      pinSpacing: true,
      scrub: true,
      onUpdate: function (self) { render(self.progress); }
    });
    render(0);

    global.addEventListener('resize', function () { ScrollTrigger.refresh(); });
    stage.classList.add('ds-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}

    return {
      trigger: trigger, lenis: lenis, render: render,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { init: init };
  global.DualSlicer = api;
  global.dualSlicer = function (t, o) { return init(t, o); };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
