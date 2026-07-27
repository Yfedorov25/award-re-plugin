/* ============================================================
   PRELOADER-BAND-COLLAPSE · component.js  (vanilla, GSAP optional)
   ------------------------------------------------------------
   11tanjung's intro — a dark full-screen preloader panel (brand wordmark centred, a
   fake 0->100 counter bottom-left) that, when ready, COLLAPSES VERTICALLY into a thin
   horizontal band and vanishes, revealing the hero SIMULTANEOUSLY from top AND bottom.
   The wordmark sits in a separate layer and stays put (optionally scale-hands-off into
   the hero), so it reads as one continuous element through the seam. Harvested from
   D_11tanjung (T1+T2+T3; d010 6% -> d014 collapsing -> d018 thin line -> gone).

   THE MOVE: the dark panel is clip-path: inset(0) (full cover); on reveal it animates to
   inset(50% 0 50% 0) (a zero-height band at the vertical centre) with expo.out ~1000ms,
   so the hero is uncovered from both edges toward the centre line. The wordmark layer is
   ABOVE the panel and is not clipped — it persists across the seam.

   Fake counter: a non-linear 0->100 that jumps to 100 at the end (load-complete cue),
   NOT a real % — pair with a min-hold + resolve-when-ready if you want a real gate.

   CONFIG-DRIVEN:
     PreloaderBandCollapse.create(target, {     // target wraps .pbc-panel + .pbc-mark + .pbc-counter
       bg: '#1e1a17', ink: '#f4f1ea',
       collapseDur: 1.0, collapseEase: 'expo.out',
       counter: true, counterDur: 1.1,
       markHandoff: null,   // {from:1, to:1} optional scale on the wordmark during collapse
       minHold: 600
     })
   Returns { run(onReveal), ready(), set(p), destroy }.
   - run(): plays the counter, then (on ready + minHold) collapses + reveals.
   - ready(): signal load done. set(p): PURE scrub of the collapse (0 covered, 1 revealed).

   ENGINE LAWS: clip-path inset + opacity + (optional) transform on the wordmark only;
   GPU; NO mix-blend on the panel; NO WebGL; reduced-motion -> instant reveal. __LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function easeFn(name) {
    var m = {
      'linear': function (t) { return t; },
      'expo.out': function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); },
      'power3.out': function (t) { return 1 - Math.pow(1 - t, 3); },
      'power2.out': function (t) { return 1 - Math.pow(1 - t, 2); }
    };
    return m[name] || m['expo.out'];
  }

  function create(target, options) {
    options = options || {};
    var opt = {
      bg: options.bg || '#1e1a17',
      ink: options.ink || '#f4f1ea',
      collapseDur: options.collapseDur != null ? options.collapseDur : 1.0,
      collapseEase: options.collapseEase || 'expo.out',
      counter: options.counter !== false,
      counterDur: options.counterDur != null ? options.counterDur : 1.1,
      markHandoff: options.markHandoff || null,
      minHold: options.minHold != null ? options.minHold : 600,
      z: options.z != null ? options.z : 9990
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var panel = stage.querySelector('.pbc-panel');
    var mark = stage.querySelector('.pbc-mark');
    var counterEl = stage.querySelector('.pbc-counter');
    var gsap = global.gsap;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // p: 0 = panel full cover, 1 = panel collapsed to a centre band (hero revealed)
    function apply(p) {
      var half = (p * 50).toFixed(2) + '%';
      if (panel) { panel.style.clipPath = 'inset(' + half + ' 0 ' + half + ' 0)'; panel.style.webkitClipPath = 'inset(' + half + ' 0 ' + half + ' 0)'; }
      if (panel && p > 0.92) panel.style.opacity = String(Math.max(0, (1 - p) / 0.08)); else if (panel) panel.style.opacity = '1';
      if (mark && opt.markHandoff) {
        var s = opt.markHandoff.from + (opt.markHandoff.to - opt.markHandoff.from) * p;
        mark.style.transform = 'scale(' + s.toFixed(3) + ')';
      }
    }
    apply(0);

    var shownAt = 0, isReady = false, rafId = null, done = false, revealCb = null;

    function tweenCollapse() {
      if (reduced) { apply(1); finish(); return; }
      if (gsap) {
        var o = { p: 0 };
        gsap.to(o, { p: 1, duration: opt.collapseDur, ease: opt.collapseEase, onUpdate: function () { apply(o.p); }, onComplete: function () { apply(1); finish(); } });
        return;
      }
      var ef = easeFn(opt.collapseEase), t0 = null, ms = opt.collapseDur * 1000;
      (function step(ts) { if (t0 == null) t0 = ts; var t = Math.min(1, (ts - t0) / ms); apply(ef(t)); if (t < 1) rafId = global.requestAnimationFrame(step); else { apply(1); finish(); } })(performance.now());
    }
    function finish() { done = true; if (revealCb) revealCb(); }

    function playCounter() {
      if (!opt.counter || !counterEl) return;
      // non-linear fake progress that jumps to 100 near the end
      var seq = [0, 6, 14, 23, 41, 58, 72, 100], i = 0;
      var stepMs = (opt.counterDur * 1000) / seq.length;
      (function tick() {
        if (i >= seq.length) return;
        counterEl.textContent = seq[i] + '%';
        i++;
        if (i < seq.length) global.setTimeout(tick, stepMs);
      })();
    }

    function maybeCollapse() {
      if (!isReady) return;
      var now = (global.performance && performance.now) ? performance.now() : Date.now();
      var left = opt.minHold - (now - shownAt);
      if (left <= 0) tweenCollapse(); else global.setTimeout(tweenCollapse, left);
    }

    function run(onReveal) {
      revealCb = onReveal || null;
      shownAt = (global.performance && performance.now) ? performance.now() : Date.now();
      playCounter();
      maybeCollapse();
    }
    function ready() { isReady = true; if (counterEl && opt.counter) counterEl.textContent = '100%'; maybeCollapse(); }

    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      run: run, ready: ready, set: apply,
      destroy: function () { if (rafId) global.cancelAnimationFrame(rafId); stage.parentNode && stage.parentNode.removeChild(stage); }
    };
  }

  var api = { create: create };
  global.PreloaderBandCollapse = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
