/* ============================================================
   puzzle-text / word-blocks-depth — variant.js   (base-importing delta)
   ------------------------------------------------------------
   variant-as-delta. The BASE engine lives in ../../component.js
   (PuzzleText = the tx5 paired contained-scatter converge). This
   variant is the DEPTH / 3D-feeling reading of the SAME scatter↔assemble
   beat, re-extracted BYTE-FAITHFULLY from the owner-approved prototype:
     apps/quadro/public/slide-lab/tx3-word-blocks-depth.html

   WHY a variant.js (not params.json): the ASSEMBLE phase is a NEW DOM
   motion model — whole WORD-BLOCKS WAIT scattered in real CSS Z-DEPTH
   (translateZ + both-axis offset + blur + 3D card-tilt; near words start
   LARGE + heavily blurred + dim, far words small + distant) and CONVERGE
   home from that depth onto the flat readable plane (z=0, blur 0),
   de-blurring and darkening gray -> ink as each seats. That is a real 3D
   layer the base (flat in-plane converge) does not express, so per
   CONTRACT §3 it ships as a base-importing variant.js, NEVER a forked
   component.js.

   WHAT IS SHARED WITH THE BASE (../../component.js · PuzzleText):
     • the WORD-LEVEL split contract (word + space spans so gaps never
       collapse; the base's PuzzleText.splitWords is the same idea — this
       variant adds an <em> accent-aware split on top),
     • words ALWAYS OPAQUE (opacity NEVER touched) => ZERO layout shift,
       assembly is transform + filter(blur) + COLOR (gray -> ink) only,
     • the browser lays the paragraph out; we animate each word FROM an
       offset back to transform:none, so final line-breaks are pixel-perfect,
     • ONE air ease everywhere (0.25,0.74,0.22,0.99; fallback power3.out),
     • pinned + scrubbed => fully reversible (scroll back re-scatters),
     • transform / opacity-untouched / filter / color ONLY — no WebGL, no
       mix-blend / backdrop over the scrub, no video.currentTime,
     • reduced-motion / narrow => static readable statement (no scatter /
       pin / scrub) — the same contract the base guarantees.

   WHAT THIS VARIANT OWNS (the delta):
     • a dark CINEMATIC field with CSS `perspective` on the stage so the
       word-blocks fly home from real Z-depth (a quiet QUADRO render behind),
     • per-word depthStart(): deterministic Z scatter (Z_NEAR..Z_FAR),
       depth-coupled blur (near = blurrier DOF) + warm-gray ramp + 3D tilt,
     • the Z-CONVERGE assemble: each word tweens z->0, blur->0, gray->ink,
       on a reading-order cascade, all on the ONE air ease,
     • an <em> accent group that seats to the bronze accent ink,
     • a thin progress cue line (NOT a count-up).

   ENTRY (declared in variant.recipe.md):
     PuzzleTextWordBlocksDepth.init(opts)
       opts = { statement, bg, eyebrow, sig, cueFill, fbBg, src,
                assembleEnd, zNear, zFar, blurMax, spreadX, spreadY,
                pinVh, scrub, seed } | drives existing DOM (tx3 ids)
   ============================================================ */
(function (global) {
  'use strict';

  /* base-importing law: this variant REQUIRES the shared base engine to be
     loaded alongside it (../../component.js → window.PuzzleText). The lab loads
     ../../component.js before this file; we cite it so the word-split + always-
     opaque + air-ease + reduced-motion contract is the SHARED base contract,
     not a fork. */
  var BASE = global.PuzzleText || null;   // ../../component.js (PuzzleText)

  /* faithful tx3 defaults (byte-for-byte from tx3-word-blocks-depth.html) */
  var D = {
    src:         'renders/aerial.webp',  // ONE quiet wide aerial render behind
    assembleEnd: 0.86,                    // timeline progress where the statement is fully seated
    zNear:       520,                     // word flies in from CLOSE to viewer (large + blurred + dim)
    zFar:       -1080,                    // word flies in from far back (small + distant)
    blurMax:     18,                      // px (<=20) cap — depth-coupled DOF on near words
    spreadX:     0.42,                    // fraction of viewport width a word can be displaced
    spreadY:     0.40,                    // fraction of viewport height
    pinVh:       3.0,                     // pin scroll distance = pinVh * innerHeight
    scrub:       0.8,
    seed:        73
  };

  /* deterministic PRNG (mulberry32) — stable, reshuffleable scatter */
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* gray -> ink colour ramp helpers (so each word DARKENS as it seats) */
  function hex(c) { c = c.replace('#', ''); return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]; }
  function lerpHex(a, b, t) { var A = hex(a), B = hex(b), r = function (i) { return Math.round(A[i] + (B[i] - A[i]) * t); }; return 'rgb(' + r(0) + ',' + r(1) + ',' + r(2) + ')'; }

  /* split the statement into word + space spans (gaps never collapse).
     Preserves the <em> accent: words inside <em> get the .pt-em flag so they
     seat to the bronze accent ink instead of the paper ink. (Extends the base
     PuzzleText.splitWords word-level contract with <em> grouping.) */
  function spaceSpan() { var s = document.createElement('span'); s.className = 'pt-space'; s.textContent = ' '; return s; }
  function splitWords(root) {
    var words = [];
    var frag = document.createDocumentFragment();
    // walk top-level nodes so we keep <em> grouping
    Array.prototype.forEach.call(root.childNodes, function (n) {
      var isEm = n.nodeType === 1 && n.tagName === 'EM';
      var raw = n.textContent || '';
      var lead = /^\s/.test(raw);
      var trail = /\s$/.test(raw);
      var parts = raw.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
      if (lead && words.length) { frag.appendChild(spaceSpan()); }
      parts.forEach(function (w, i) {
        var span = document.createElement('span');
        span.className = 'pt-word' + (isEm ? ' pt-em' : '');
        span.textContent = w;
        frag.appendChild(span);
        words.push(span);
        if (i < parts.length - 1) { frag.appendChild(spaceSpan()); }
      });
      if (trail) { frag.appendChild(spaceSpan()); }
    });
    root.textContent = '';
    root.appendChild(frag);
    return words;
  }

  function node(x) { return (x && x.nodeType === 1) ? x : (typeof x === 'string' ? document.querySelector(x) : null); }

  function PuzzleTextWordBlocksDepth(opts) {
    opts = opts || {};
    var gsap = global.gsap, ST = global.ScrollTrigger, CE = global.CustomEase;
    var cfg = Object.assign({}, D, opts);

    var ASSEMBLE_END = cfg.assembleEnd;
    var Z_NEAR = cfg.zNear, Z_FAR = cfg.zFar, BLUR_MAX = cfg.blurMax;
    var SPREAD_X = cfg.spreadX, SPREAD_Y = cfg.spreadY;
    var BG_SRC = cfg.src;

    var statement = node(opts.statement) || document.getElementById('statement');
    var bg        = node(opts.bg)        || document.getElementById('bg');
    var eyebrow   = node(opts.eyebrow)   || document.getElementById('eyebrow');
    var sig       = node(opts.sig)       || document.getElementById('sig');
    var cueFill   = node(opts.cueFill)   || document.getElementById('cueFill');
    var fbBg      = node(opts.fbBg)      || document.getElementById('fbbg');
    if (!statement) { return { ok: false, reason: 'statement not found' }; }

    /* eager-preload + paint the quiet render into both surfaces */
    (function preload() {
      var pre = new Image(); pre.decoding = 'async'; pre.loading = 'eager'; pre.src = BG_SRC;
      if (bg) bg.src = BG_SRC;
      if (fbBg) fbBg.src = BG_SRC;
    })();

    var words = splitWords(statement);

    /* per-word scattered DEPTH start (deterministic).
       near words (z>0, toward viewer): MORE blur, LIGHTER warm gray, big offset.
       far words  (z<0, away): pushed back (small apparent), LIGHTER gray.
       all share the ONE air ease on the way home. opacity untouched. */
    function depthStart(rand) {
      var zNorm = rand();                       // 0 far .. 1 near
      var z = (zNorm > 0.5)
        ? (Z_NEAR * (zNorm - 0.5) * 2)          // near half -> toward viewer (+)
        : (Z_FAR * (0.5 - zNorm) * 2);          // far half  -> away (-)
      var nearness = Math.abs(z) / Math.max(Z_NEAR, Math.abs(Z_FAR)); // 0 home .. 1 deep
      // both-axis displacement, radiating with jitter
      var ang = rand() * Math.PI * 2;
      var rad = 0.35 + rand() * 0.65;           // 0.35 .. 1.0 of the spread box
      var x = Math.cos(ang) * rad * (window.innerWidth * SPREAD_X);
      var y = Math.sin(ang) * rad * (window.innerHeight * SPREAD_Y);
      // near (toward viewer) words read big + blurred; depth gives DOF blur
      var blur = BLUR_MAX * (0.30 + 0.70 * (z > 0 ? zNorm : nearness * 0.7));
      var color = lerpHex('#2A2622', (z > 0 ? '#615B52' : '#7E776B'), 0.65 + 0.35 * nearness);
      var rot = (rand() * 2 - 1) * 6;           // gentle in-plane tilt
      var rotX = (rand() * 2 - 1) * 9;          // slight 3D card tilt
      var rotY = (rand() * 2 - 1) * 9;
      return { z: z, x: x, y: y, blur: blur, color: color, rot: rot, rotX: rotX, rotY: rotY };
    }

    try {
      if (!gsap || !ST) { throw new Error('GSAP missing'); }
      gsap.registerPlugin(ST);
      if (CE) { try { if (!gsap.parseEase('air')) CE.create('air', '0.25,0.74,0.22,0.99'); } catch (e) { CE.create('air', '0.25,0.74,0.22,0.99'); } }
      var AIR = (CE && gsap.parseEase('air')) ? 'air' : 'power3.out';

      // the SEATED ink each word lands on (accent words -> bronze ink)
      var INK_BASE = getComputedStyle(document.documentElement).getPropertyValue('--type-ink').trim() || '#F3ECE0';
      var INK_ACCENT = getComputedStyle(document.documentElement).getPropertyValue('--bronze').trim() || '#B5895A';
      function seatInk(w) { return w.classList.contains('pt-em') ? INK_ACCENT : INK_BASE; }

      var ran = false;
      var mm = gsap.matchMedia();

      /* ---- FULL EXPERIENCE: wide + motion allowed ---- */
      mm.add('(min-width:761px) and (prefers-reduced-motion: no-preference)', function () {

        var rand = rng(cfg.seed);   // stable seed -> identical scatter every load
        var starts = words.map(function () { return depthStart(rand); });

        // rest state of meta
        gsap.set([eyebrow, sig], { opacity: 0 });
        if (bg) gsap.set(bg, { opacity: 0.16, scale: 1.06 });

        // SCATTER each word into Z-depth (its START). opacity is NEVER set -> stays 1.
        words.forEach(function (w, i) {
          var s = starts[i];
          gsap.set(w, {
            z: s.z, x: s.x, y: s.y,
            rotation: s.rot, rotationX: s.rotX, rotationY: s.rotY,
            color: s.color,
            filter: 'blur(' + s.blur.toFixed(1) + 'px)',
            transformPerspective: 1250
          });
        });

        var END = Math.round(window.innerHeight * cfg.pinVh);
        var A = ASSEMBLE_END;

        var tl = gsap.timeline({
          defaults: { ease: AIR },
          scrollTrigger: {
            trigger: '#stage',
            start: 'top top',
            end: '+=' + END,
            pin: true,
            scrub: cfg.scrub,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });

        /* ASSEMBLE — every word flies home from Z-depth, de-blurs, gray -> ink.
           Reading-order stagger so the statement reads as ONE gesture; each
           tween shares the AIR ease so there is NO pop and NO jerk. Words stay
           opaque the whole time => zero layout shift. */
        words.forEach(function (w, i) {
          var startAt = (i / words.length) * (A * 0.34);    // gentle reading-order cascade
          tl.to(w, {
            z: 0, x: 0, y: 0,
            rotation: 0, rotationX: 0, rotationY: 0,
            color: seatInk(w),
            filter: 'blur(0px)',
            duration: A - startAt,
            ease: AIR
          }, startAt);
        });

        /* the quiet render settles (very subtle) as the words seat */
        if (bg) tl.to(bg, { scale: 1.0, ease: AIR, duration: A }, 0);

        /* eyebrow + signature emerge ONLY as the statement seats */
        if (eyebrow) tl.to(eyebrow, { opacity: 1, ease: AIR, duration: 0.18 }, A * 0.72);
        if (sig) tl.fromTo(sig, { opacity: 0, y: 10 }, { opacity: 1, y: 0, ease: AIR, duration: 0.20 }, A * 0.80);

        /* progress cue across the whole pinned scroll */
        if (cueFill) gsap.to(cueFill, {
          scaleX: 1, ease: 'none',
          scrollTrigger: { trigger: '#stage', start: 'top top', end: '+=' + END, scrub: true }
        });

        ran = true;

        return function () {
          gsap.set(words, { clearProps: 'all' });
          gsap.set([eyebrow, sig, bg], { clearProps: 'all' });
        };
      });

      /* ---- REDUCED-MOTION (wide): seated statement, NO scatter / pin / scrub ---- */
      mm.add('(min-width:761px) and (prefers-reduced-motion: reduce)', function () {
        words.forEach(function (w) {
          gsap.set(w, { z: 0, x: 0, y: 0, rotation: 0, rotationX: 0, rotationY: 0, filter: 'none', color: seatInk(w) });
        });
        gsap.set([eyebrow, sig], { opacity: 1, y: 0 });
        if (bg) gsap.set(bg, { opacity: 0.16, scale: 1 });
        ran = true;
      });

      /* ---- NARROW: the CSS collapses to the static readable statement (.fallback).
         We do NOT scatter or pin; this branch just marks the variant as correctly
         mounted in its valid static-fallback state. ---- */
      mm.add('(max-width:760px)', function () {
        ran = true;
      });

      // keep ScrollTrigger honest on resize / late load
      window.addEventListener('load', function () { ST.refresh(); });

      var pinned = ST.getAll().some(function (st) { return st.pin; });
      return {
        ok: !!(gsap && ST && words.length && (pinned || ran)),
        base: BASE,                 // cite the shared base engine
        words: words.length,
        refresh: function () { ST.refresh(); },
        destroy: function () { mm.revert(); }
      };

    } catch (err) {
      try { console.warn('[puzzle-text/word-blocks-depth] init issue:', err && err.message); } catch (e) {}
      return { ok: false, reason: err && err.message, base: BASE };
    }
  }

  global.PuzzleTextWordBlocksDepth = { init: PuzzleTextWordBlocksDepth, base: BASE, splitWords: splitWords };
})(window);
