/* ============================================================
   puzzle-text / converge-faithful — variant.js   (base-importing delta)
   ------------------------------------------------------------
   variant-as-delta. The BASE engine lives in ../../component.js
   (PuzzleText = the tx5 paired contained-scatter converge). This
   variant is the FAITHFUL Zera /portfolio6 read of the SAME
   scatter↔assemble beat, re-extracted BYTE-FAITHFULLY from the
   owner-approved prototype:
     apps/quadro/public/slide-lab/tx1-converge-faithful.html

   THE FAITHFUL READ: a confident SERIF statement whose WORDS start
   scattered — GRAY and displaced across the viewport on BOTH axes
   (wide diagonal spread, some rotated/skewed, sized larger) — and
   CONVERGE into the final readable paragraph on ONE shared air ease,
   darkening gray -> ink as each word seats. Calm, composed, on a
   LIGHT field, NO paired render. Pure text. That is the WHOLE move.

   WHY a variant.js (not params.json): the converge is staged as a
   READING-ORDER CASCADE computed from each word's RESTING x/y AFTER
   layout (not DOM index), and the scatter is biased OUTWARD from the
   paragraph's measured centre (centre words barely move + seat first,
   edge words fly from far corners + seat last). That measure-then-
   order step is a NEW DOM phase the base does not express, so per
   CONTRACT §3 it ships as a base-importing variant.js, NEVER a forked
   component.js.

   WHAT IS SHARED WITH THE BASE (../../component.js · PuzzleText):
     • the WORD-LEVEL split contract (word + space spans so gaps never
       collapse — same as PuzzleText.splitWords),
     • words ALWAYS OPAQUE (opacity NEVER touched) => ZERO layout shift;
       assembly is transform + COLOR (gray -> ink) only — no opacityFrom,
     • the browser lays the paragraph out; we animate each word FROM an
       offset back to transform:none, so final line-breaks are pixel-perfect,
     • farther-from-home = lighter gray + larger + more rotate/skew,
     • ONE air ease everywhere (0.25,0.74,0.22,0.99; fallback power3.out),
     • pinned + scrubbed => fully reversible (scroll back re-scatters),
     • transform / color ONLY — no WebGL, no mix-blend / backdrop over the
       scrub, no video.currentTime,
     • reduced-motion / narrow => static readable paragraph (no scatter /
       pin / scrub) — the same contract the base guarantees.

   WHAT THIS VARIANT OWNS (the delta):
     • a LIGHT field (pale calm paper) with a faint quiet structure grid,
     • a measured READING-ORDER cascade (top-row→bottom-row, left→right by
       resting x/y) so the paragraph "reads itself into place",
     • a scatter biased OUTWARD from the measured paragraph centre,
     • a quiet OPTIONAL companion render (lower-right) that resolves only
       AFTER the statement has seated; graceful-optional (hides if absent).

   ENTRY (declared in variant.recipe.md):
     PuzzleTextConvergeFaithful.init(opts)
       opts = { root, stage, statement, companion, eyebrow,
                maxX, maxY, centreCalm, rotate, skew, scaleFar,
                duration, cascade, scrub, pinLengthVh, seed }
       | drives existing DOM (tx1 ids/classes)
   ============================================================ */
(function (global) {
  'use strict';

  /* base-importing law: this variant REQUIRES the shared base engine to be
     loaded alongside it (../../component.js → window.PuzzleText). The lab loads
     ../../component.js before this file; we cite it so the word-split + always-
     opaque + air-ease + reduced-motion contract is the SHARED base contract,
     not a fork. */
  var BASE = global.PuzzleText || null;   // ../../component.js (PuzzleText)

  /* faithful tx1 defaults (byte-for-byte from tx1-converge-faithful.html) */
  var D = {
    maxX:        0.46,   // scatter reach on X as a fraction of stage width  (WIDE, both axes)
    maxY:        0.40,   // scatter reach on Y as a fraction of stage height
    centreCalm:  0.18,   // centre words barely move; edge words fly far (outward bias)
    rotate:      11,     // deg, scales with distance from home
    skew:        8,      // deg italic-drift, scales with distance from home
    scaleFar:    1.46,   // farther-from-home = LARGER (near = 1.0)
    duration:    0.62,   // per-word seat duration (in timeline-progress units)
    cascade:     0.40,   // total reading-order cascade spread across the words
    scrub:       0.7,
    pinLengthVh: 260,
    seed:        7
  };

  /* deterministic PRNG (mulberry32) — coherent, reshuffleable scatter */
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hex(c) { c = c.replace('#', ''); return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)]; }
  function lerpHex(a, b, t) { var A = hex(a), B = hex(b), r = function (i) { return Math.round(A[i] + (B[i] - A[i]) * t); }; return 'rgb(' + r(0) + ',' + r(1) + ',' + r(2) + ')'; }

  var GHOST_NEAR = '#b7b4ab', GHOST_FAR = '#d6d4cc', INK = '#161614';

  /* split the statement into WORD + SPACE spans (gaps never collapse) —
     the same word-level contract as the base PuzzleText.splitWords. */
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

  function node(x) { return (x && x.nodeType === 1) ? x : (typeof x === 'string' ? document.querySelector(x) : null); }

  function PuzzleTextConvergeFaithful(opts) {
    opts = opts || {};
    var gsap = global.gsap, ST = global.ScrollTrigger, CE = global.CustomEase;
    var CFG = Object.assign({}, D, opts);

    var probe = {
      ok: false, reasons: [], words: 0, statements: 0, allOpaque: false,
      cascadeApplied: false, opacityTweened: false, reduced: false, base: BASE
    };
    function fail(msg) { probe.reasons.push(msg); }

    if (!gsap || !ST) { fail('GSAP / ScrollTrigger missing'); return probe; }
    gsap.registerPlugin(ST);

    // -- the ONE air ease (cubic-bezier 0.25,0.74,0.22,0.99) --
    var EASE = 'power3.out';
    if (CE) {
      gsap.registerPlugin(CE);
      try { if (!gsap.parseEase('air')) CE.create('air', '0.25,0.74,0.22,0.99'); } catch (e) { CE.create('air', '0.25,0.74,0.22,0.99'); }
      EASE = 'air';
    } else {
      fail('CustomEase missing (degraded to power3.out)');
    }

    var root      = node(opts.root)      || document.getElementById('puzzle');
    var stage     = node(opts.stage)     || (root && root.querySelector('.stage'));
    var statement = node(opts.statement) || document.getElementById('statement');
    var companion = node(opts.companion) || document.getElementById('companion');
    var compImg   = companion ? companion.querySelector('img') : null;
    if (!root || !stage || !statement) { fail('faithful DOM not found'); return probe; }

    probe.statements = document.querySelectorAll('.statement').length;

    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = matchMedia('(max-width: 720px)').matches;
    probe.reduced = reduce || narrow;

    var words = splitWords(statement);
    probe.words = words.length;
    statement.style.color = INK;

    // -- companion render: graceful-optional. hide if it fails to load --
    if (compImg) {
      compImg.addEventListener('error', function () { if (companion) companion.style.display = 'none'; }, { once: true });
    }

    // -- if no motion: settle to the static readable paragraph, no scatter, no pin --
    if (reduce || narrow) {
      gsap.set(words, { x: 0, y: 0, scale: 1, rotation: 0, skewX: 0, color: INK });
      if (companion) gsap.set(companion, { opacity: 1 });
      runProbe();
      ST.refresh();
      return probe;
    }

    // -- measure each word's RESTING centre (after layout) so we can:
    //    (a) bias the scatter OUTWARD from the paragraph centre,
    //    (b) order the converge as a READING-ORDER cascade (top->bottom, left->right). --
    function buildScene() {
      var stageRect = stage.getBoundingClientRect();
      var maxX = stageRect.width * CFG.maxX;
      var maxY = stageRect.height * CFG.maxY;
      var rand = rng(CFG.seed * 9301 + 49297);

      // paragraph centre (in viewport coords) for the outward bias
      var pRect = statement.getBoundingClientRect();
      var pcx = pRect.left + pRect.width / 2;
      var pcy = pRect.top + pRect.height / 2;
      var halfDiag = Math.hypot(pRect.width / 2, pRect.height / 2) || 1;

      var meta = words.map(function (w) {
        var r = w.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        // outward unit vector from paragraph centre + how far out this word lives
        var ox = cx - pcx, oy = cy - pcy;
        var olen = Math.hypot(ox, oy) || 1;
        var outFrac = Math.min(1, olen / halfDiag);          // 0 centre .. 1 edge
        return { w: w, cx: cx, cy: cy, ox: ox / olen, oy: oy / olen, outFrac: outFrac, rx: r.left, ry: r.top };
      });

      // READING-ORDER cascade index: sort by row (y) then column (x); rows bucketed so words
      // sharing a visual line cascade together left-to-right.
      var order = meta.slice().sort(function (a, b) {
        var dy = a.ry - b.ry;
        if (Math.abs(dy) > 14) return dy;   // different line
        return a.rx - b.rx;                 // same line: left to right
      });
      var orderIndex = new Map();
      order.forEach(function (m, i) { orderIndex.set(m.w, i); });
      probe.cascadeApplied = order.length === words.length && order[0].ry <= order[order.length - 1].ry;

      // SCATTER each word: signed wide-diagonal offset biased OUTWARD, lighter+larger+more
      // rotate/skew the farther it sits from home. opacity is NEVER touched (stays 1).
      meta.forEach(function (m) {
        // base random diagonal direction, then bias strongly outward for edge words
        var rx = (rand() * 2 - 1), ry = (rand() * 2 - 1);
        var bias = CFG.centreCalm + (1 - CFG.centreCalm) * m.outFrac;   // centre calm, edges far
        var dx = (rx * 0.42 + m.ox * 0.58) * maxX * bias;
        var dy = (ry * 0.42 + m.oy * 0.58) * maxY * bias;
        var dist = Math.min(1, Math.hypot(dx / maxX, dy / maxY) / Math.SQRT2);

        m.from = {
          x: dx, y: dy,
          scale: 1 + (CFG.scaleFar - 1) * dist,
          rotation: (rand() * 2 - 1) * CFG.rotate * dist,
          skewX: (rand() * 2 - 1) * CFG.skew * dist,
          color: lerpHex(GHOST_NEAR, GHOST_FAR, dist)
        };
      });

      // set the scattered start state (opacity untouched = stays 1)
      meta.forEach(function (m) { gsap.set(m.w, m.from); });
      if (companion) gsap.set(companion, { opacity: 0 });

      // -- ONE pinned, scrubbed timeline. Each word tweens HOME on the SAME air ease,
      //    sequenced by reading-order so the paragraph reads itself into place.
      //    Reverse scroll runs the identical tween backward -> re-scatter, no pop. --
      var to = { x: 0, y: 0, scale: 1, rotation: 0, skewX: 0, color: INK, ease: EASE, duration: CFG.duration };
      var N = words.length;

      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=' + CFG.pinLengthVh + '%',
          pin: true,
          scrub: CFG.scrub,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      meta.forEach(function (m) {
        var i = orderIndex.get(m.w);
        var at = (N > 1 ? (i / (N - 1)) : 0) * CFG.cascade;   // reading-order cascade position
        tl.to(m.w, to, at);
      });

      // the quiet companion render eases in only AFTER the statement has seated
      if (companion) {
        tl.to(companion, { opacity: 1, ease: EASE, duration: 0.22 }, CFG.cascade + CFG.duration * 0.7);
      }

      ST.refresh();
    }

    // -- boot: wait for fonts (so word boxes are measured at final metrics), then build --
    function boot() {
      buildScene();
      runProbe();
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(boot);
    } else {
      window.addEventListener('load', boot, { once: true });
    }

    window.addEventListener('load', function () { ST.refresh(); });
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        // re-measure + rebuild on resize so the scatter+cascade match the new layout
        if (ST.getAll) ST.getAll().forEach(function (s) { s.kill(); });
        gsap.killTweensOf(words);
        buildScene();
        ST.refresh();
      }, 200);
    });

    // -- probe --
    function runProbe() {
      if (probe.statements !== 1) fail('expected exactly one .statement, got ' + probe.statements);
      if (probe.words < 6) fail('statement too short to read as an assemble: ' + probe.words + ' words');

      // every word span must be OPAQUE at rest (color-only assembly, zero layout shift)
      probe.allOpaque = words.every(function (w) {
        var o = parseFloat(getComputedStyle(w).opacity);
        return o === 1;
      });
      if (!probe.allOpaque) fail('a word span is not fully opaque (must be color-only, no fade)');

      // assert we never animate opacity on the words (would be a pop / layout-shift smell)
      probe.opacityTweened = words.some(function (w) {
        return gsap.getTweensOf(w).some(function (tw) { return 'opacity' in (tw.vars || {}); });
      });
      if (probe.opacityTweened) fail('a word has an opacity tween (assembly must be color-only)');

      if (!probe.reduced && !probe.cascadeApplied) fail('reading-order cascade not applied');

      // no banned copy: em-dashes
      if (document.body.innerText.indexOf('—') !== -1) fail('em-dash found in visible copy');

      probe.ok = probe.reasons.length === 0 || probe.reasons.every(function (r) {
        return r.indexOf('CustomEase missing') === 0;   // tolerated graceful degrade
      });
      probe.ease = EASE;
      // eslint-disable-next-line no-console
      try { console.log('converge-faithful probe', probe); } catch (e) {}
    }

    return probe;
  }

  global.PuzzleTextConvergeFaithful = { init: PuzzleTextConvergeFaithful, base: BASE, splitWords: splitWords };
})(window);
