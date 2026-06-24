/* ============================================================
   PUZZLE-TEXT  ·  component.js   (vanilla + GSAP 3.12.5)
   ------------------------------------------------------------
   ONE paragraph whose WORDS start scattered — GRAY and displaced
   across the viewport on BOTH axes (wide diagonal spread, some
   rotated, some skewed/italic-drifted, sized differently) — and
   converge into their natural flow positions on ONE shared
   expo-out ease, color darkening gray -> ink as each word seats.
   Scroll-scrubbed and fully reversible: scrolling back up
   re-scatters the words. That is the WHOLE technique.

   There is NO card, NO portrait, NO image finale, NO "next
   section" reveal. Those are not part of this move.

   HARD RULES (do not break — these are the technique)
   ---------------------------------------------------
   • Font is SANS grotesque (Helvetica Neue / system-ui), NOT serif.
   • Words NEVER go invisible. opacity STAYS 1; assembly is COLOR-only
     (gray -> ink) plus transform. There is NO opacityFrom.
   • Farther-from-home  =  LIGHTER gray  +  LARGER.
   • Scatter is WIDE DIAGONAL on BOTH axes + slight rotate/skew.
   • Ease = hard expo-out '0.16,1,0.3,1'. ONE ease everywhere.
   • We never animate LAYOUT. The browser lays the paragraph out; we
     animate each word FROM an offset back to transform:none, so the
     final line-breaks are pixel-perfect (zero reflow at rest).
   • No WebGL. transform/color only. prefers-reduced-motion = settled.

   TWO ENTRY POINTS
   ----------------
   1) PuzzleText.buildAssembly(el, timeline, position, opts)
        Splits `el` into words and appends the gray->ink assembly
        tweens onto YOUR timeline at `position`. Compose it with a
        pinned, scrubbed ScrollTrigger for the reversible scatter.
   2) PuzzleText.mount({ stage, paragraph, assembleOpts?, pinVH? })
        Self-contained: pins the stage and scrubs the scatter<->assemble
        move. Returns { timeline, destroy }.

   DEPENDENCIES (load before this file):
     gsap 3.12.5, ScrollTrigger, (optional) CustomEase
   ============================================================ */

(function (global) {
  'use strict';

  /* ---- the ONE ease: hard expo-out. registered if CustomEase present ---- */
  var EASE = 'power4.out';
  if (global.CustomEase) {
    global.CustomEase.create('puzzleAir', '0.16,1,0.3,1'); // hard expo-out
    EASE = 'puzzleAir';
  }

  var DEFAULTS = {
    /* scatter geometry — WIDE DIAGONAL on BOTH axes (source f_001) */
    maxX: 300, maxY: 170, rotate: 9, skew: 7,
    /* farther-from-home = LIGHTER + LARGER */
    scaleNear: 1.0, scaleFar: 1.42,
    ghostNear: '#B9B7AF', ghostFar: '#D4D2CA', inkColor: '#161614',
    /* choreography (positions on the timeline you pass in) */
    duration: 0.9, stagger: 0.045, ease: EASE, seed: 7
  };

  /* deterministic PRNG (mulberry32) — stable + reshuffleable scatter */
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* split an element's text into word spans + space spans (gaps never
     collapse while words translate). Returns the word nodes. */
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

  function hex(c) {
    c = c.replace('#', '');
    return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
  }
  function lerpHex(a, b, t) {
    var A = hex(a), B = hex(b), r = function (i) { return Math.round(A[i] + (B[i] - A[i]) * t); };
    return 'rgb(' + r(0) + ',' + r(1) + ',' + r(2) + ')';
  }

  /* per-word scattered "from" state — coherent, seeded.
     KEY: opacity is NEVER set (words always opaque).
     KEY: euclidean distance from home -> lighter color + larger scale.
     WIDE diagonal displacement on both axes + slight rotate/skew. */
  function scatterVars(opt, rand) {
    var dx = (rand() * 2 - 1);
    var dy = (rand() * 2 - 1);
    var x = dx * opt.maxX;
    var y = dy * opt.maxY;
    var dist = Math.min(1, Math.sqrt(dx * dx + dy * dy) / Math.SQRT2);
    var scale = opt.scaleNear + (opt.scaleFar - opt.scaleNear) * dist;
    var color = lerpHex(opt.ghostNear, opt.ghostFar, dist);
    var v = { x: x, y: y, scale: scale, color: color };
    if (opt.rotate) v.rotation = (rand() * 2 - 1) * opt.rotate;
    if (opt.skew) v.skewX = (rand() * 2 - 1) * opt.skew;   // italic-drift feel
    return v;
  }

  /* Append the ASSEMBLY (scatter -> home) onto a timeline you control.
     Returns { words }. opacity is intentionally never touched. */
  function buildAssembly(el, tl, position, userOpt) {
    if (!global.gsap) { console.warn('[puzzle-text] GSAP missing'); return { words: [] }; }
    var opt = Object.assign({}, DEFAULTS, userOpt || {});
    var gsap = global.gsap;
    var reduce = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var words = splitWords(el);
    el.style.color = opt.inkColor;

    if (reduce) {
      gsap.set(words, { x: 0, y: 0, scale: 1, skewX: 0, rotation: 0, color: opt.inkColor });
      return { words: words };
    }

    var rand = rng(opt.seed * 9301 + 49297);
    var froms = words.map(function () { return scatterVars(opt, rand); });

    /* scattered start state (opacity untouched = stays 1) */
    words.forEach(function (w, i) { gsap.set(w, froms[i]); });

    /* each word tweens home; reading-order stagger so the paragraph reads
       as ONE gesture. position maps the assembly onto SCROLL distance, so
       scrubbing back re-scatters the words. */
    var to = { x: 0, y: 0, scale: 1, rotation: 0, skewX: 0, color: opt.inkColor, ease: opt.ease, duration: opt.duration };
    words.forEach(function (w, i) {
      tl.to(w, to, (position || 0) + i * opt.stagger);
    });

    return { words: words };
  }

  /* Self-contained scene: the scatter <-> assemble move on one pinned,
     scrubbed (reversible) timeline. NOTHING follows the assemble.
     args: { stage, paragraph, assembleOpts?, pinVH? } */
  function mount(args) {
    if (!global.gsap || !global.ScrollTrigger) {
      console.warn('[puzzle-text] GSAP/ScrollTrigger missing'); return null;
    }
    var gsap = global.gsap;
    var stage = args.stage, p = args.paragraph;
    var reduce = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce) {
      var trivial = gsap.timeline();
      buildAssembly(p, trivial, 0, args.assembleOpts);
      return { timeline: trivial, destroy: function () { trivial.kill(); } };
    }

    var PIN = (args.pinVH || 1.8);

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage, start: 'top top',
        end: '+=' + (PIN * 100) + '%',
        scrub: 0.6, pin: true, pinSpacing: true,
        invalidateOnRefresh: true
      }
    });

    /* the entire move: scatter (set at 0) -> assemble home, gray -> ink,
       opacity always 1. Scrub reverses it (re-scatter). Nothing else. */
    buildAssembly(p, tl, 0, args.assembleOpts);

    return {
      timeline: tl,
      destroy: function () {
        if (tl.scrollTrigger) tl.scrollTrigger.kill();
        tl.kill();
      }
    };
  }

  global.PuzzleText = {
    buildAssembly: buildAssembly,
    mount: mount,
    splitWords: splitWords,
    DEFAULTS: DEFAULTS,
    EASE: EASE
  };

})(window);
