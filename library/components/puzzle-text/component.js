/* ============================================================
   PUZZLE-TEXT  ·  component.js   (vanilla + GSAP 3.12.5)
   ------------------------------------------------------------
   Turns a block of copy into words that ASSEMBLE from a
   scattered state into their natural flow positions, driven by
   scroll (scrub) — reversible — or by in-view (one-shot).

   WHY IT LOOKS EXPENSIVE
   ----------------------
   1. We never move the LAYOUT. The browser lays the paragraph out
      normally; we read each word's resting box and animate FROM a
      random offset back to transform:none. Final line breaks are
      perfect because the browser authored them.
   2. Per-word offset is seeded but *coherent*: scale, x, y and a
      gray->ink color shift all ease on ONE curve, so 30 words read
      as one gesture, not 30 confetti pieces.
   3. Stagger flows in reading order (top-left -> bottom-right) but
      gently, so the eye is led, not strobed.

   DEPENDENCIES (load before this file):
     gsap 3.12.5, ScrollTrigger, (optional) CustomEase
   ============================================================ */

(function (global) {
  'use strict';

  /* ---- the one ease. registered if CustomEase is present ----- */
  var EASE = 'power3.out';
  if (global.CustomEase) {
    global.CustomEase.create('puzzleAir', '0.22,1,0.36,1'); // expo-ish settle
    EASE = 'puzzleAir';
  }

  var DEFAULTS = {
    /* --- granularity --- */
    split:        'word',     // 'word' only (this technique is word-level)

    /* --- scatter geometry (relative to each word's resting box) --- */
    maxX:         140,        // px, max horizontal scatter (+/-)
    maxY:         90,         // px, max vertical scatter (+/-)
    scaleFrom:    1.55,       // some words start larger (the "loose pieces")
    scaleJitter:  0.45,       // +/- random around scaleFrom toward 1
    rotate:       0,          // deg; keep 0 for editorial, try 4 for playful
    opacityFrom:  0.0,        // start opacity of scattered words

    /* --- color assembly (optional gray->ink) --- */
    ghostColor:   null,       // e.g. '#B9B6AE'. null = no color tween
    inkColor:     null,       // resting color; null = inherit from CSS

    /* --- choreography --- */
    duration:     0.9,        // per-word tween (in-view mode)
    stagger:      0.045,      // seconds between words, reading order
    ease:         EASE,
    seed:         1,          // change to reshuffle the scatter pattern

    /* --- trigger --- */
    trigger:      'scrub',    // 'scrub' (scroll-scrubbed, reversible)
                              // | 'inview' (one-shot when entered)
    start:        'top 80%',  // ScrollTrigger start
    end:          'top 30%',  // scrub end (ignored for inview)
    scrub:        0.6,        // scrub smoothing (sec) or true
    once:         false       // inview: animate only first time
  };

  /* deterministic PRNG so the scatter is stable across reloads
     (mulberry32) — seeded per word index. */
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* split an element's text into word spans + space spans, in place.
     Preserves spaces as their own inline-blocks so gaps never
     collapse while words are translated. Returns the word nodes. */
  function splitWords(el) {
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    var parts = text.split(' ');
    el.textContent = '';
    var words = [];
    parts.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'pt-word';
      span.textContent = w;
      el.appendChild(span);
      words.push(span);
      if (i < parts.length - 1) {
        var sp = document.createElement('span');
        sp.className = 'pt-space';
        sp.textContent = ' ';
        el.appendChild(sp);
      }
    });
    return words;
  }

  /* build the per-word "from" vars (the scattered piece). */
  function scatterVars(opt, rand) {
    var s = opt.scaleFrom + (rand() * 2 - 1) * opt.scaleJitter;
    var v = {
      x: (rand() * 2 - 1) * opt.maxX,
      y: (rand() * 2 - 1) * opt.maxY,
      scale: Math.max(0.6, s),
      opacity: opt.opacityFrom
    };
    if (opt.rotate) v.rotation = (rand() * 2 - 1) * opt.rotate;
    if (opt.ghostColor) v.color = opt.ghostColor;
    return v;
  }

  function init(el, userOpt) {
    if (!global.gsap) { console.warn('[puzzle-text] GSAP missing'); return; }
    var opt = Object.assign({}, DEFAULTS, userOpt || {});
    var gsap = global.gsap;

    var reduce = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var words = splitWords(el);
    if (opt.inkColor) el.style.setProperty('--pt-ink', opt.inkColor);

    /* reduced motion: simple, no scatter — just settle in place. */
    if (reduce) {
      gsap.set(words, { opacity: 1 });
      return { destroy: function () {} };
    }

    var rand = rng(opt.seed * 9301 + 49297);

    /* precompute a from-state per word (stable via seed). */
    var froms = words.map(function () { return scatterVars(opt, rand); });

    var to = { x: 0, y: 0, scale: 1, opacity: 1, rotation: 0, ease: opt.ease };
    if (opt.inkColor || opt.ghostColor) to.color = opt.inkColor || 'inherit';

    var st;

    if (opt.trigger === 'inview') {
      /* ONE-SHOT: tween each word from scattered -> rest, staggered
         in reading order. ScrollTrigger only fires the timeline. */
      gsap.set(words, { /* prime */ });
      words.forEach(function (w, i) { gsap.set(w, froms[i]); });

      var tl = gsap.timeline({ paused: true });
      tl.to(words, Object.assign({}, to, {
        duration: opt.duration,
        stagger: { each: opt.stagger, from: 0 } // 0 = DOM/reading order
      }));

      st = global.ScrollTrigger.create({
        trigger: el,
        start: opt.start,
        once: opt.once,
        onEnter: function () { tl.play(); },
        onLeaveBack: opt.once ? null : function () { tl.reverse(); }
      });

    } else {
      /* SCRUB (the Zera behavior): bind assembly progress to scroll.
         Each word gets the SAME tween but offset along the timeline
         so the stagger maps onto scroll distance -> reversible. */
      var tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: opt.start,
          end: opt.end,
          scrub: opt.scrub
        }
      });
      words.forEach(function (w, i) {
        gsap.set(w, froms[i]);
        tl2.to(w, Object.assign({}, to, { duration: opt.duration }),
               i * opt.stagger);  // position param = the scrub stagger
      });
      st = tl2.scrollTrigger;
    }

    return {
      timeline: st,
      words: words,
      destroy: function () {
        if (st && st.kill) st.kill();
        gsap.set(words, { clearProps: 'all' });
      }
    };
  }

  /* auto-init any [data-puzzle-text] on DOM ready, reading options
     from data-* attributes (numbers parsed, strings passed through). */
  function auto() {
    var nodes = document.querySelectorAll('[data-puzzle-text]');
    nodes.forEach(function (el) {
      var o = {};
      ['maxX','maxY','scaleFrom','scaleJitter','rotate','opacityFrom',
       'duration','stagger','seed','scrub'].forEach(function (k){
        var dv = el.dataset[k];
        if (dv != null) o[k] = parseFloat(dv);
      });
      ['trigger','start','end','ghostColor','inkColor'].forEach(function (k){
        var dv = el.dataset[k];
        if (dv != null) o[k] = dv;
      });
      if (el.dataset.once != null) o.once = el.dataset.once === 'true';
      init(el, o);
    });
  }

  global.PuzzleText = { init: init, auto: auto, DEFAULTS: DEFAULTS };

  if (document.readyState !== 'loading') auto();
  else document.addEventListener('DOMContentLoaded', auto);

})(window);
