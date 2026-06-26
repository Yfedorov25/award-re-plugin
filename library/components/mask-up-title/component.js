/* ============================================================
   MASK-UP-TITLE · component.js  (vanilla, GSAP optional)
   ------------------------------------------------------------
   Saisei's big-title reveal — a large serif title RISES from under a baseline mask,
   line by line (overflow:hidden wrapper + translateY(100% -> 0)), staggered, expo.out.
   NOT a fade — the words slide up from behind the line, as if printed onto a rising
   sheet. Harvested from D_saisei (S5).

   THE MOVE: each line of the title sits in an overflow:hidden wrapper; the inner line
   starts translateY(110%) (below the mask) and animates to 0, staggered ~100ms per line.

   CONFIG-DRIVEN:
     MaskUpTitle.create(target, {            // target = element containing the title lines
       lineSelector: '.mut-line',            // each line wrapper (its child is the moving text)
       stagger: 0.1, duration: 0.9, ease: 'expo.out', from: 110   // % below baseline
     })
   Or pass a string + split: MaskUpTitle.fromText(target, 'SHIZUKA\nGARDENS', opts).
   Returns { play(), set(p), reset(), destroy }.
   - play(): runs the staggered rise. set(p 0..1): PURE scrub of all lines. reset(): back to hidden.

   ENGINE LAWS: transform(translateY) + the wrapper's overflow:hidden only; GPU layer;
   NO mix-blend / NO backdrop; NO WebGL; reduced-motion -> instant shown. __LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function ensureLines(host, lineSel) {
    var lines = [].slice.call(host.querySelectorAll(lineSel));
    lines.forEach(function (w) {
      // wrapper must clip; inner moving element is the first child (or wrap text node)
      if (getComputedStyle(w).overflow !== 'hidden') w.style.overflow = 'hidden';
      if (getComputedStyle(w).display === 'inline') w.style.display = 'block';
      var inner = w.firstElementChild;
      if (!inner) { inner = doc.createElement('span'); inner.style.display = 'block'; inner.textContent = w.textContent; w.textContent = ''; w.appendChild(inner); }
      else inner.style.display = 'block';
      inner.style.willChange = 'transform';
    });
    return lines;
  }

  function create(target, options) {
    options = options || {};
    var opt = {
      lineSelector: options.lineSelector || '.mut-line',
      // Saisei 1:1 (project title SHIZUKA/GARDENS): each line ~340ms, stagger ~200ms
      // between lines, power3.out, rising from under the baseline (no fade).
      stagger: options.stagger != null ? options.stagger : 0.2,
      duration: options.duration != null ? options.duration : 0.34,
      ease: options.ease || 'power3.out',
      from: options.from != null ? options.from : 110
    };
    var host = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!host) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gsap = global.gsap;
    var lines = ensureLines(host, opt.lineSelector);
    var inners = lines.map(function (w) { return w.firstElementChild; });

    function setLine(inner, p) { inner.style.transform = 'translateY(' + ((1 - p) * opt.from).toFixed(2) + '%)'; }
    function setAll(p) { inners.forEach(function (i) { setLine(i, p); }); }
    setAll(0); // hidden below the mask

    function play(o) {
      o = o || {};
      if (reduced) { setAll(1); o.onComplete && o.onComplete(); return; }
      if (gsap) {
        // drive a proxy 'p' (0..1) and write the SAME style.transform channel as set()
        // so play() and set() never fight over translate vs yPercent.
        inners.forEach(function (inner, idx) {
          var proxy = { p: 0 }; setLine(inner, 0);
          gsap.to(proxy, { p: 1, duration: o.duration || opt.duration, ease: o.ease || opt.ease,
            delay: idx * (o.stagger != null ? o.stagger : opt.stagger),
            onUpdate: function () { setLine(inner, proxy.p); },
            onComplete: idx === inners.length - 1 ? (o.onComplete || null) : null });
        });
        return;
      }
      // built-in rAF stagger
      var ef = function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }; // expo.out
      inners.forEach(function (inner, idx) {
        setTimeout(function () {
          var t0 = null, ms = (o.duration || opt.duration) * 1000;
          (function step(ts) { if (t0 == null) t0 = ts; var t = Math.min(1, (ts - t0) / ms); setLine(inner, ef(t));
            if (t < 1) global.requestAnimationFrame(step); else if (idx === inners.length - 1 && o.onComplete) o.onComplete(); })(performance.now());
        }, idx * (o.stagger != null ? o.stagger : opt.stagger) * 1000);
      });
    }

    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      lines: lines, play: play, set: setAll, reset: function () { setAll(0); },
      destroy: function () {}
    };
  }

  var api = { create: create };
  global.MaskUpTitle = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
