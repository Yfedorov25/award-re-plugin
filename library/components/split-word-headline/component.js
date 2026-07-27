/* ============================================================
   SPLIT-WORD-HEADLINE · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   A PER-WORD split headline reveal. The atom takes an element holding a headline,
   splits it into per-word spans (each WORD wrapped in its own overflow:hidden clip row),
   and reveals the words with a wave stagger: each word RISES from under its own clip
   (yPercent 120 -> 0) + fades in. The words arrive one by one, with weight: a typographic
   hero primitive. Distinct from mask-up-title (whole-line mask), blur-reveal-stagger-title
   (per-char blur), and stroke-draw-title (SVG stroke): only THIS one does independent
   per-WORD travel.

   THE MOVE:
     - split the headline text into words; wrap each word in a .swh-clip (overflow hidden)
       holding a .swh-word inner span that carries the transform.
     - reveal each word: translateY(120% -> 0%) + opacity(0 -> 1), staggered by `stagger`
       seconds in a wave (trigger:'enter' = play once on scroll-in) OR driven by set(p) for
       a scrubbed reveal (each word gets its own slice of p so they cascade across 0..1).
     - multi-line: line breaks (\n in markup, or explicit <br>) start a new clip ROW so each
       line clips independently. Whitespace between words is preserved as plain text nodes.
   set(p) is a PURE function of progress (0..1, reversible): word i is fully revealed once
   p passes its slice; partial within its slice. Transform/opacity ONLY.

   CONFIG-DRIVEN:
     SplitWordHeadline.create(target, {        // target = an element holding a headline
       stagger: 0.08,                           // seconds between words (enter mode)
       from: { yPercent: 120, opacity: 0 },     // per-word start state
       ease: 'air',                             // 'air' | 'silk' | any gsap ease string
       trigger: 'enter',                        // 'enter' (play once on scroll-in) | 'progress' (driven by set(p))
       start: 'top 78%', dur: 0.9, manageLenis: false
     })
   Markup: <h1 data-swh>Дім, що дихає</h1>  (the atom splits the text). Use \n or <br> for lines.
   Returns { set(p), play(), destroy }.

   ENGINE LAWS: transform translateY(% via yPercent) + opacity on the inner word spans +
   overflow:hidden per-word clip only. NO layout-prop animation (no margin/top/width). GPU;
   NO mix-blend / NO backdrop; NO WebGL. will-change cleared after the one-shot. reduced-motion
   or <=560px -> all words shown (no travel). owns_pin false. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  // named ease tokens -> gsap ease strings (per-site overridable)
  var EASES = { air: 'expo.out', silk: 'cubic-bezier(.22,1,.36,1)', power: 'power3.out' };

  function create(target, options) {
    options = options || {};
    var from = options.from || {};
    var opt = {
      stagger: options.stagger != null ? options.stagger : 0.08,
      yPercent: from.yPercent != null ? from.yPercent : 120,
      opacityFrom: from.opacity != null ? from.opacity : 0,
      ease: options.ease || 'air',
      trigger: options.trigger || 'enter',
      start: options.start || 'top 78%',
      dur: options.dur != null ? options.dur : 0.9,
      manageLenis: options.manageLenis === true
    };
    var ease = EASES[opt.ease] || opt.ease;

    var host = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!host) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 560px)').matches;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

    // ---- split the headline into per-word clip rows (idempotent) -------------
    // Each LINE becomes a block-level row; each WORD inside becomes a .swh-clip
    // (overflow hidden) wrapping a .swh-word inner span (the transform target).
    // Lines are split on explicit <br> elements or \n in the text.
    function buildLines() {
      var lines = [];
      var current = [];
      function flush() { lines.push(current); current = []; }
      // walk childNodes once: text nodes -> words; <br> -> line break.
      Array.prototype.slice.call(host.childNodes).forEach(function (node) {
        if (node.nodeType === 1 && node.tagName === 'BR') { flush(); return; }
        var text = node.textContent != null ? node.textContent : '';
        text.split('\n').forEach(function (seg, i) {
          if (i > 0) flush();
          seg.split(/(\s+)/).forEach(function (tok) {
            if (tok === '') return;
            if (/^\s+$/.test(tok)) { current.push({ space: true }); }
            else { current.push({ word: tok }); }
          });
        });
      });
      flush();
      return lines.filter(function (ln) { return ln.length; });
    }

    var words = []; // the inner .swh-word spans (transform targets), in reveal order
    function render() {
      var lines = buildLines();
      host.textContent = '';
      host.classList.add('swh-host');
      lines.forEach(function (line) {
        var row = doc.createElement('span');
        row.className = 'swh-line';
        line.forEach(function (tok) {
          if (tok.space) { row.appendChild(doc.createTextNode(' ')); return; }
          var clip = doc.createElement('span');
          clip.className = 'swh-clip';
          var word = doc.createElement('span');
          word.className = 'swh-word';
          word.textContent = tok.word;
          clip.appendChild(word);
          row.appendChild(clip);
          words.push(word);
        });
        host.appendChild(row);
      });
    }
    render();

    // ---- pure progress -> per-word state -------------------------------------
    // Each word owns an equal slice of p; a small overlap (lead) gives the wave a
    // soft cascade rather than hard hand-offs. set(p) is pure: same p -> same frame.
    var n = words.length || 1;
    var overlap = 0.5; // each word's reveal spans (1+overlap) base-slices -> neighbours overlap
    // base slice + each word's start, scaled so the LAST word finishes exactly at p=1.
    var span = (1 + overlap) / (n + overlap);
    function apply(p) {
      p = clamp01(p);
      for (var i = 0; i < words.length; i++) {
        var startP = (i / (n + overlap)); // word i begins here; last word ends at p=1
        var wp = clamp01((p - startP) / span);
        var ty = opt.yPercent * (1 - wp);
        var op = opt.opacityFrom + (1 - opt.opacityFrom) * wp;
        words[i].style.transform = 'translateY(' + ty.toFixed(2) + '%)';
        words[i].style.opacity = op.toFixed(3);
      }
    }
    function showAll() {
      for (var i = 0; i < words.length; i++) {
        words[i].style.transform = 'translateY(0%)';
        words[i].style.opacity = '1';
      }
    }
    function hideAll() {
      for (var i = 0; i < words.length; i++) {
        words[i].style.transform = 'translateY(' + opt.yPercent + '%)';
        words[i].style.opacity = String(opt.opacityFrom);
      }
    }

    // reduced-motion / narrow / no-GSAP -> show all words, no travel
    if (reduced || narrow || !gsap) {
      host.classList.add('swh-static');
      showAll();
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { static: true, set: function (p) { showAll(); }, play: function () { showAll(); }, destroy: function () {} };
    }

    gsap.registerPlugin && ScrollTrigger && gsap.registerPlugin(ScrollTrigger);
    gsap.ticker.lagSmoothing(0);
    var lenis = null;
    if (opt.manageLenis && Lenis) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', function () { ScrollTrigger && ScrollTrigger.update(); });
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      global.__lenis = lenis;
    }

    // start hidden (below the clip)
    hideAll();
    words.forEach(function (w) { w.style.willChange = 'transform, opacity'; });

    var played = false;
    function play() {
      if (played) return; played = true;
      // fromTo so GSAP owns the whole transform track (yPercent start -> 0), avoiding any
      // ambiguity with the CSS base translateY(120%). clearProps on transform leaves the
      // word at identity (translateY(0%)), not a stale px matrix.
      gsap.fromTo(words,
        { yPercent: opt.yPercent, opacity: opt.opacityFrom },
        {
          yPercent: 0, opacity: 1, duration: opt.dur, ease: ease,
          stagger: opt.stagger,
          onComplete: function () {
            words.forEach(function (w) {
              w.style.willChange = 'auto';
              w.style.transform = 'translateY(0%)';
              w.style.opacity = '1';
            });
          }
        });
    }

    var st = null;
    if (opt.trigger === 'progress' && ScrollTrigger) {
      // scrubbed reveal: set(p) drives the cascade across the section's pass
      st = ScrollTrigger.create({
        trigger: host, start: 'top bottom', end: 'top 35%', scrub: true,
        onUpdate: function (self) { apply(self.progress); }
      });
      apply(0);
    } else if (ScrollTrigger) {
      // play once on enter
      st = ScrollTrigger.create({ trigger: host, start: opt.start, onEnter: play });
    } else {
      play();
    }

    global.addEventListener('resize', function () { ScrollTrigger && ScrollTrigger.refresh(); });
    host.classList.add('swh-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}

    return {
      words: words,
      trigger: st,
      lenis: lenis,
      set: apply,          // PURE p -> frame (use with trigger:'progress' or standalone)
      play: play,          // one-shot wave
      refresh: function () { ScrollTrigger && ScrollTrigger.refresh(); },
      destroy: function () {
        st && st.kill();
        if (lenis) lenis.destroy();
        words.forEach(function (w) { w.style.willChange = 'auto'; });
      }
    };
  }

  var api = { create: create };
  global.SplitWordHeadline = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
