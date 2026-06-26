/* ============================================================
   GRID-SKELETON-DRAW · component.js  (vanilla, GSAP optional)
   ------------------------------------------------------------
   Saisei's grid skeleton — the next page's vertical column RULES (and edge margin ticks)
   stroke in (scaleY 0->1) on the interstitial, drawing the incoming page's layout grid
   before the content arrives ("the page sketches its skeleton"). draw() builds them in,
   undraw() retracts. Harvested from D_saisei (S3; interstitial grid build).

   THE MOVE: a set of vertical rules at given x% positions, each transform-origin top,
   scaleY 0->1 (or from both ends to the middle), staggered. undraw reverses.

   CONFIG-DRIVEN:
     GridSkeletonDraw.create(target, {       // injects rules into the target
       cols: [7, 50, 93], colour: '#2a2418', opacity: 0.18, width: 1,
       dur: 0.6, ease: 'power3.out', stagger: 0.08, origin: 'center'  // 'top' | 'center'
     })
   Returns { draw(), undraw(), set(p), destroy }.

   ENGINE LAWS: transform(scaleY) + opacity only; GPU; NO mix-blend / NO backdrop;
   NO WebGL; reduced-motion -> shown. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  function create(target, options) {
    options = options || {};
    var opt = {
      cols: options.cols || [7, 50, 93],
      colour: options.colour || '#2a2418',
      opacity: options.opacity != null ? options.opacity : 0.18,
      width: options.width != null ? options.width : 1,
      dur: options.dur != null ? options.dur : 0.6,
      ease: options.ease || 'power3.out',
      stagger: options.stagger != null ? options.stagger : 0.08,
      origin: options.origin || 'center'
    };
    var host = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!host) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gsap = global.gsap;
    var rules = opt.cols.map(function (x) {
      var r = doc.createElement('div');
      r.className = 'gsd-rule';
      r.style.cssText = 'position:absolute;top:0;bottom:0;left:' + x + '%;width:' + opt.width + 'px;background:' + opt.colour + ';opacity:' + opt.opacity + ';transform:scaleY(0);transform-origin:' + opt.origin + ';will-change:transform';
      host.appendChild(r); return r;
    });
    function set(p) { rules.forEach(function (r) { r.style.transform = 'scaleY(' + p + ')'; }); }
    function run(to, o) {
      o = o || {};
      if (reduced) { set(to); o.onComplete && o.onComplete(); return; }
      rules.forEach(function (r, i) {
        if (gsap) gsap.to(r, { scaleY: to, duration: opt.dur, ease: opt.ease, delay: i * opt.stagger, onComplete: i === rules.length - 1 ? o.onComplete : null });
        else setTimeout(function () { var from = parseFloat((r.style.transform.match(/scaleY\(([\d.]+)\)/) || [0, to === 1 ? 0 : 1])[1]); var t0 = null, ef = function (t) { return 1 - Math.pow(1 - t, 3); }; (function s(ts) { if (t0 == null) t0 = ts; var t = Math.min(1, (ts - t0) / (opt.dur * 1000)), e = ef(t); r.style.transform = 'scaleY(' + (from + (to - from) * e) + ')'; if (t < 1) global.requestAnimationFrame(s); else if (i === rules.length - 1 && o.onComplete) o.onComplete(); })(performance.now()); }, i * opt.stagger * 1000);
      });
    }
    try { global.__LAB_OK__ = true; } catch (e) {}
    return { draw: function (o) { run(1, o); }, undraw: function (o) { rules.forEach(function (r) { r.style.transformOrigin = opt.origin === 'top' ? 'bottom' : 'center'; }); run(0, o); }, set: set, rules: rules, destroy: function () { rules.forEach(function (r) { r.remove(); }); } };
  }
  var api = { create: create };
  global.GridSkeletonDraw = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
