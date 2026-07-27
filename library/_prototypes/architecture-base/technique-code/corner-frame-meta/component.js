/* ============================================================
   CORNER-FRAME-META · component.js  (vanilla, GSAP optional)
   ------------------------------------------------------------
   Saisei's corner meta — small all-caps tracked labels placed at the FOUR CORNERS of a
   full-bleed frame (eyebrow top-left, location bottom-left, type/year bottom-right,
   index right-centre), fading in (staggered) on a baseline. The "framed" composition
   that makes a hero read as an authored plate, not a slide. Harvested from D_saisei (S8).

   THE MOVE: reveal() fades the corner labels in with a small stagger; set(p) scrubs them.
   The labels are positioned by CSS (the corners); the engine only fades them in.

   CONFIG-DRIVEN:
     CornerFrameMeta.create(target, {        // target contains [data-corner] labels
       sel: '[data-corner]', dur: 0.5, ease: 'power2.out', stagger: 0.08
     })
   Returns { reveal(), set(p), hide(), destroy }.

   ENGINE LAWS: opacity + tiny transform only; GPU; NO mix-blend / NO backdrop; NO WebGL;
   reduced-motion -> shown. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  function create(target, options) {
    options = options || {};
    var opt = {
      sel: options.sel || '[data-corner]',
      dur: options.dur != null ? options.dur : 0.5,
      ease: options.ease || 'power2.out',
      stagger: options.stagger != null ? options.stagger : 0.08
    };
    var host = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!host) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }
    var items = [].slice.call(host.querySelectorAll(opt.sel));
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gsap = global.gsap;
    items.forEach(function (el) { el.style.willChange = 'opacity, transform'; el.style.opacity = '0'; el.style.transform = 'translateY(6px)'; });
    function set(p) { items.forEach(function (el) { el.style.opacity = p; el.style.transform = 'translateY(' + ((1 - p) * 6).toFixed(1) + 'px)'; }); }
    function reveal(o) {
      o = o || {};
      if (reduced) { set(1); o.onComplete && o.onComplete(); return; }
      items.forEach(function (el, i) {
        if (gsap) gsap.to(el, { opacity: 1, y: 0, duration: opt.dur, ease: opt.ease, delay: i * opt.stagger, onComplete: i === items.length - 1 ? o.onComplete : null });
        else setTimeout(function () { var t0 = null, ef = function (t) { return 1 - Math.pow(1 - t, 2); }; (function s(ts) { if (t0 == null) t0 = ts; var t = Math.min(1, (ts - t0) / (opt.dur * 1000)), e = ef(t); el.style.opacity = e; el.style.transform = 'translateY(' + ((1 - e) * 6).toFixed(1) + 'px)'; if (t < 1) global.requestAnimationFrame(s); else if (i === items.length - 1 && o.onComplete) o.onComplete(); })(performance.now()); }, i * opt.stagger * 1000);
      });
    }
    try { global.__LAB_OK__ = true; } catch (e) {}
    return { reveal: reveal, set: set, hide: function () { set(0); }, destroy: function () {} };
  }
  var api = { create: create };
  global.CornerFrameMeta = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
