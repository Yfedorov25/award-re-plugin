/* ============================================================
   CENTER-SEAM-SPLIT · component.js  (vanilla, GSAP optional)
   ------------------------------------------------------------
   Saisei's signature primitive — a vertical centre seam that either OPENS
   (a fill splits from the centre outward, revealing what is behind it) or CLOSES
   (two halves slide in from the edges to a centre seam, covering what is behind).
   ONE engine, four uses across the site: the homepage preloader (black splits from
   centre), the page-enter (cream curtain splits to reveal the dark page), the
   menu-close inverse (cream converges to centre), and a focal-image reveal (a portrait
   opens through an expanding centre slit). Harvested from D_saisei (S1).

   THE MOVE (open):  the COVER fill is full, then clip-path inset peels it apart from
     the centre line outward (inset(0 50% 0 50%) is the closed seam; inset(0) gone) so
     the layer BEHIND it is revealed from the centre.
   THE MOVE (close): the inverse — the cover grows from the edges inward to a hairline
     centre seam, covering the layer behind.

   Two-phase colour is the "expensive" tell: a transition CLOSES in cream (brand bg)
   then re-OPENS in dark — so chain a close(cream) with an open(dark) for a page change.

   CONFIG-DRIVEN:
     CenterSeamSplit.create(target, {
       axis: 'x',            // 'x' = vertical seam (default, Saisei) | 'y' = horizontal
       fill: '#0e0e0c',      // the cover colour (cream to close a page, dark to reveal one)
       duration: 0.75, ease: 'expo.out',  // open default; close uses easeClose
       easeClose: 'power3.inOut',
       z: 9999, onComplete: fn
     })
   Returns { el, open(opts), close(opts), set(progress), destroy }.
   - el is the cover element it injects over the target (or document.body).
   - open(): seam peels centre->edges (reveal behind). close(): edges->centre (cover).
   - set(p): 0 = fully covering, 1 = fully open (PURE — drive it from a scrub if wanted).

   ENGINE LAWS: clip-path inset + opacity only; GPU layer; NO mix-blend / NO backdrop;
   NO WebGL; reduced-motion -> instant state (no animation). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';

  var doc = global.document;

  // closed seam = the cover fully hides the layer behind (inset 0 = full cover).
  // open seam   = the cover is split away from the centre line (inset 50% on the seam axis).
  // progress p: 0 = closed/covering, 1 = open/revealed.
  function insetFor(axis, p) {
    var half = (p * 50).toFixed(3) + '%';
    // axis x -> seam is vertical -> peel left & right edges inward to centre as p->1
    return axis === 'y' ? ('inset(' + half + ' 0 ' + half + ' 0)')
                        : ('inset(0 ' + half + ' 0 ' + half + ')');
  }

  function easeFn(name) {
    // tiny built-in easings (used when GSAP absent); names mirror GSAP where possible
    var map = {
      'linear': function (t) { return t; },
      'expo.out': function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); },
      'expo.in': function (t) { return t === 0 ? 0 : Math.pow(2, 10 * t - 10); },
      'power3.out': function (t) { return 1 - Math.pow(1 - t, 3); },
      'power3.inOut': function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
      'power2.out': function (t) { return 1 - Math.pow(1 - t, 2); },
      // Saisei OPEN curve: front-slow then accelerate (hairline dwells, then rips open)
      'power2.in': function (t) { return t * t; },
      'power4.out': function (t) { return 1 - Math.pow(1 - t, 4); }
    };
    return map[name] || map['expo.out'];
  }

  function create(target, options) {
    options = options || {};
    var opt = {
      axis: options.axis === 'y' ? 'y' : 'x',
      fill: options.fill || '#0e0e0c',
      // Saisei 1:1: OPEN = power2.in over ~0.93s (hairline dwells ~270ms, then rips
      // open accelerating) — NOT expo.out. CLOSE is the softer, faster move (~0.73s,
      // ease-in-out): the rule is "the entry is softer than the exit".
      duration: options.duration != null ? options.duration : 0.93,
      ease: options.ease || 'power2.in',
      durationClose: options.durationClose != null ? options.durationClose : 0.73,
      easeClose: options.easeClose || 'power3.inOut',
      z: options.z != null ? options.z : 9999,
      onComplete: options.onComplete
    };

    var host = !target ? doc.body
      : (typeof target === 'string' ? doc.querySelector(target) : target);
    if (!host) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    // the cover lives over the host; if host is body it is fixed full-viewport
    var cover = doc.createElement('div');
    cover.className = 'css-cover';
    var isBody = host === doc.body;
    cover.style.position = isBody ? 'fixed' : 'absolute';
    cover.style.left = '0'; cover.style.top = '0'; cover.style.right = '0'; cover.style.bottom = '0';
    if (!isBody && getComputedStyle(host).position === 'static') host.style.position = 'relative';
    cover.style.zIndex = String(opt.z);
    cover.style.background = opt.fill;
    cover.style.pointerEvents = 'none';
    cover.style.willChange = 'clip-path';
    host.appendChild(cover);

    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gsap = global.gsap;

    var prog = 0;             // 0 covering, 1 open
    function apply(p) { prog = p; cover.style.clipPath = insetFor(opt.axis, p); cover.style.webkitClipPath = insetFor(opt.axis, p); }
    apply(0);                 // start covering

    var rafId = null;
    function animateTo(toP, dur, easeName, done) {
      if (rafId) { global.cancelAnimationFrame(rafId); rafId = null; }
      if (reduced || dur <= 0) { apply(toP); if (done) done(); return; }
      if (gsap) {
        var o = { p: prog };
        gsap.to(o, { p: toP, duration: dur, ease: easeName,
          onUpdate: function () { apply(o.p); },
          onComplete: function () { apply(toP); if (done) done(); } });
        return;
      }
      // built-in rAF tween
      var fromP = prog, ef = easeFn(easeName), t0 = null, ms = dur * 1000;
      function step(ts) {
        if (t0 == null) t0 = ts;
        var t = Math.min(1, (ts - t0) / ms);
        apply(fromP + (toP - fromP) * ef(t));
        if (t < 1) rafId = global.requestAnimationFrame(step);
        else { rafId = null; apply(toP); if (done) done(); }
      }
      rafId = global.requestAnimationFrame(step);
    }

    function open(o) {
      o = o || {};
      animateTo(1, o.duration != null ? o.duration : opt.duration, o.ease || opt.ease,
        function () { if (o.onComplete) o.onComplete(); else if (opt.onComplete) opt.onComplete(); });
    }
    function close(o) {
      o = o || {};
      if (o.fill) { cover.style.background = o.fill; } // re-tint for the close phase (e.g. cream)
      animateTo(0, o.duration != null ? o.duration : opt.durationClose, o.ease || opt.easeClose,
        function () { if (o.onComplete) o.onComplete(); });
    }

    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      el: cover,
      open: open,
      close: close,
      set: apply,                                  // PURE: drive from a scrub if wanted
      get progress() { return prog; },
      destroy: function () { if (rafId) global.cancelAnimationFrame(rafId); cover.parentNode && cover.parentNode.removeChild(cover); }
    };
  }

  var api = { create: create, insetFor: insetFor };
  global.CenterSeamSplit = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
