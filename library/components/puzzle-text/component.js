/* ============================================================
   PUZZLE-TEXT  ·  component.js   (vanilla + GSAP 3.12.5)
   BASE = tx5-paired-with-render  (owner-approved, 9/10)
   Re-extracted BYTE-FAITHFULLY from
     apps/quadro/public/slide-lab/tx5-paired-with-render.html
   ------------------------------------------------------------
   SAISEI-style PAIRED composition. A big contained QUADRO render
   slab lives on ONE side (~45vw, portrait-cropped, fully painted,
   quietly present). The confident STATEMENT lives in the facing
   CREAM AIR COLUMN.

   THE MOVE (Zera portfolio6 technique #4, reused faithfully):
   the statement's WORDS start GRAY and displaced across BOTH axes
   — a wide diagonal scatter, some rotated / skewed / sized larger —
   and on a pinned, scrubbed (reversible) ScrollTrigger they CONVERGE
   to their natural flow positions on ONE air ease, color darkening
   gray -> ink as each word seats. The words are ALWAYS OPAQUE
   (opacity stays 1) so there is ZERO layout shift at rest.

   THE CHOREOGRAPHY VARIATION ("settle-into-the-column"):
   • The scatter is CONTAINED to the text side. Words spread wide on
     both axes but the horizontal spread is biased rightward / inward
     so the gray debris never crosses onto the render slab — the two
     halves stay legible as a pair.
   • Farther-from-home = lighter gray + larger + more rotate/skew.
   • Reading-order stagger: the eye watches the sentence crystallise
     top-to-bottom, one continuous gesture, not a random pop.
   • The render slab COUNTER-DRIFTS: a tiny GPU parallax (translate +
     scale, ~14px) that resolves to rest exactly as the last word
     seats — the photo "breathes" while the statement assembles.
   • A hairline rule + ordinal under the column draw on as the words
     finish.

   HARD LAWS (the technique — not negotiable)
   ------------------------------------------
   • Words are ALWAYS OPAQUE. opacity stays 1 the whole time.
     Assembly is transform + COLOR only (gray -> ink). Zero fade.
     => ZERO layout shift: the browser lays the paragraph out once;
     we animate each word FROM an offset back to transform:none, so
     final line-breaks are pixel-perfect.
   • Display = Fraunces serif, big. Body/eyebrow = Inter.
   • ONE ease everywhere: air = cubic-bezier(0.25,0.74,0.22,0.99).
   • GPU transform / opacity / color only. NO WebGL, NO video.currentTime,
     NO mix-blend / backdrop-filter over the scrubbed surface.
   • Pinned scroll-scrub, fully reversible (scroll back re-scatters).
   • prefers-reduced-motion OR narrow viewport => collapse to the
     static, readable paragraph (no scatter, render stacks above).

   ENTRY POINT (the REAL signature on disk — declared in RECIPE)
   ------------------------------------------------------------
     PuzzleText.mount(opts)
       opts (all optional — defaults drive the tx5 DOM ids):
         { stageSel, statementSel, slabSel, slabImgSel, eyebrowSel,
           ruleSel, ordSel,           // selectors (default tx5 ids)
           paragraph, renderSrc,       // override copy / render via JS
           renderSide,                 // 'left' (default) | 'right'
           ghostNear, ghostFar, inkColor,
           maxX, maxY, rotate, skew, scaleFar, xBias, xSpread,
           duration, stagger, seed, scrub, pinPct, ease }
       Returns { timeline, words, destroy } (or { static:true } in the
       reduced-motion / narrow branch).
   The lab/integration may instead just author the tx5 DOM and call
   PuzzleText.mount() with no args — the engine drives the existing DOM.

   DEPENDENCIES (load before this file):
     gsap 3.12.5, ScrollTrigger, (optional) CustomEase
   ============================================================ */

(function (global) {
  'use strict';

  /* the ONE air ease (tx5: cubic-bezier 0.25,0.74,0.22,0.99) */
  var AIR_DEFAULT = 'power4.out';
  function registerAir() {
    if (global.CustomEase) {
      try { if (!global.gsap.parseEase('air')) global.CustomEase.create('air', '0.25,0.74,0.22,0.99'); }
      catch (e) { global.CustomEase.create('air', '0.25,0.74,0.22,0.99'); }
      return 'air';
    }
    return AIR_DEFAULT;
  }

  var DEFAULTS = {
    /* selectors — default to the tx5 DOM ids */
    stageSel: '#stage', statementSel: '#statement',
    slabSel: '#slab', slabImgSel: '#slabImg',
    eyebrowSel: '#eyebrow', ruleSel: '#rule', ordSel: '#ord',
    /* optional content overrides (else the DOM author's content is kept) */
    paragraph: null, renderSrc: null, renderSide: 'left',
    /* scatter palette + geometry (tx5) — gray -> ink, contained to the column */
    ghostNear: '#B7B3A8', ghostFar: '#D2CDC0', inkColor: '#171511',
    maxX: 220, maxY: 150, rotate: 11, skew: 8, scaleFar: 1.40,
    /* horizontal bias so the gray debris stays OFF the render slab
       (tx5: x = (dx*0.62 + 0.30) * MAXX). xSpread = the 0.62, xBias = the 0.30 */
    xSpread: 0.62, xBias: 0.30,
    /* choreography */
    duration: 0.85, stagger: 0.04, seed: 41,
    /* the pinned scrubbed scroll */
    scrub: 0.6, pinPct: 190, ease: null
  };

  /* deterministic seeded PRNG (mulberry32) — stable, reshuffleable scatter */
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* gray -> ink colour interpolation (near gray, far lighter gray, then ink) */
  function hex(c) { c = c.replace('#', ''); return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]; }
  function lerpHex(a, b, t) { var A = hex(a), B = hex(b); function r(i) { return Math.round(A[i] + (B[i] - A[i]) * t); } return 'rgb(' + r(0) + ',' + r(1) + ',' + r(2) + ')'; }

  /* split statement into opaque word + space spans (gaps never collapse) */
  function splitWords(el) {
    var text = el.textContent.replace(/\s+/g, ' ').trim();
    var parts = text.split(' ');
    el.textContent = '';
    var words = [];
    parts.forEach(function (token, i) {
      var w = document.createElement('span');
      w.className = 'w';
      w.textContent = token;
      el.appendChild(w);
      words.push(w);
      if (i < parts.length - 1) {
        var sp = document.createElement('span');
        sp.className = 'sp';
        sp.textContent = ' ';
        el.appendChild(sp);
      }
    });
    return words;
  }

  function node(x, root) {
    if (!x) return null;
    if (x.nodeType === 1) return x;
    return (root || document).querySelector(x);
  }

  /* ============================================================
     mount — the WHOLE tx5 paired scene on one pinned, scrubbed
     (reversible) timeline: a big contained render slab + the cream
     air column where the statement converges from a contained gray
     scatter into ink. Nothing follows the assemble.
     ============================================================ */
  function mount(userOpts) {
    var opt = Object.assign({}, DEFAULTS, userOpts || {});
    var gsap = global.gsap;

    var statement = node(opt.statementSel);
    var slab = node(opt.slabSel);
    var slabImg = node(opt.slabImgSel);
    var eyebrow = node(opt.eyebrowSel);
    var rule = node(opt.ruleSel);
    var ord = node(opt.ordSel);

    if (!statement) { console.warn('[puzzle-text] statement element not found'); return null; }

    /* optional JS-driven content (else keep the DOM author's content) */
    if (opt.paragraph) statement.textContent = opt.paragraph;
    if (opt.renderSrc && slabImg) {
      slabImg.style.backgroundImage = "url('" + opt.renderSrc + "')";
    }

    var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 880px)').matches;

    /* split the statement into opaque word + space spans */
    var words = splitWords(statement);

    var GHOST_NEAR = opt.ghostNear, GHOST_FAR = opt.ghostFar, INK = opt.inkColor;

    /* STATIC fallback: reduced-motion or narrow => readable paragraph, no pin. */
    if (reduce || narrow) {
      words.forEach(function (w) { w.style.color = INK; w.style.transform = 'none'; });
      if (eyebrow) { eyebrow.style.opacity = 1; eyebrow.style.transform = 'none'; }
      if (rule) rule.style.width = '100%';
      if (ord) ord.style.opacity = 1;
      return { static: true, words: words, destroy: function () {} };
    }

    if (!gsap || !global.ScrollTrigger) {
      /* graceful: leave the readable paragraph if libs failed to load */
      words.forEach(function (w) { w.style.color = INK; });
      return { static: true, words: words, destroy: function () {} };
    }

    gsap.registerPlugin(global.ScrollTrigger);
    var AIR = opt.ease || registerAir();

    /* SCATTER geometry — wide diagonal on BOTH axes, CONTAINED to the column.
       Horizontal spread biased inward (toward the column interior, away from the
       render slab) so gray words never cross onto the slab. Farther-from-home =
       lighter + larger + more rotate/skew. */
    var rand = rng(opt.seed);
    var MAXX = opt.maxX, MAXY = opt.maxY, ROT = opt.rotate, SKEW = opt.skew;
    /* renderSide 'left' (default) pushes the debris bias RIGHTWARD (positive);
       renderSide 'right' mirrors the bias LEFTWARD so it still stays off the slab. */
    var biasSign = (opt.renderSide === 'right') ? -1 : 1;

    var froms = words.map(function () {
      var dx = (rand() * 2 - 1);
      var dy = (rand() * 2 - 1);
      var x = (dx * opt.xSpread + biasSign * opt.xBias) * MAXX;
      var y = dy * MAXY;
      var dist = Math.min(1, Math.sqrt(dx * dx + dy * dy) / Math.SQRT2);
      var scale = 1.0 + (opt.scaleFar - 1.0) * dist;     // far = larger
      var color = lerpHex(GHOST_NEAR, GHOST_FAR, dist);
      return {
        x: x, y: y, scale: scale, color: color,
        rotation: (rand() * 2 - 1) * ROT,
        skewX: (rand() * 2 - 1) * SKEW
      };
    });

    /* set scattered start state — opacity untouched (stays 1, zero layout shift) */
    words.forEach(function (w, i) { gsap.set(w, froms[i]); });
    if (slabImg) gsap.set(slabImg, { x: -14 * biasSign, y: 8, scale: 1.05 });  // slab pre-breath
    if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 8 });
    if (rule) gsap.set(rule, { width: 0 });
    if (ord) gsap.set(ord, { opacity: 0 });

    /* ONE pinned, scrubbed (reversible) timeline */
    var tl = gsap.timeline({
      defaults: { ease: AIR },
      scrollTrigger: {
        trigger: opt.stageSel,
        start: 'top top',
        end: '+=' + opt.pinPct + '%',
        scrub: opt.scrub,
        pin: true,
        pinSpacing: true,
        invalidateOnRefresh: true
      }
    });

    /* render slab counter-drifts gently to rest as the statement resolves */
    if (slabImg) tl.to(slabImg, { x: 0, y: 0, scale: 1, duration: 1.0 }, 0);

    /* eyebrow draws in early-ish, leading the eye into the column */
    if (eyebrow) tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.5 }, 0.05);

    /* each word converges home on the air ease, gray -> ink, reading-order stagger.
       animating FROM offset back to transform:none => pixel-perfect final layout. */
    words.forEach(function (w, i) {
      tl.to(w, { x: 0, y: 0, scale: 1, rotation: 0, skewX: 0, color: INK, duration: opt.duration }, 0.12 + i * opt.stagger);
    });

    /* rule + ordinal seat as the sentence finishes */
    if (rule) tl.to(rule, { width: '100%', duration: 0.6 }, '>-0.2');
    if (ord) tl.to(ord, { opacity: 1, duration: 0.4 }, '<0.1');

    /* The scrubbed timeline OWNS the full range: progress 0 = scattered/gray,
       progress 1 = seated/ink. We never clearProps (that would wipe the scatter)
       and never animate layout — words travel from a transform offset back to
       transform:none, so the rest line-breaks stay pixel-perfect (zero reflow). */

    return {
      timeline: tl,
      words: words,
      destroy: function () {
        if (tl.scrollTrigger) tl.scrollTrigger.kill();
        tl.kill();
      }
    };
  }

  global.PuzzleText = {
    mount: mount,
    splitWords: splitWords,
    DEFAULTS: DEFAULTS
  };

})(window);
