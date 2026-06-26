/* ============================================================
   VERTICAL-AWARDS-RAIL · component.js  (vanilla, GSAP optional)
   ------------------------------------------------------------
   Saisei's awards rail — small award badges with VERTICAL text (writing-mode), pinned to
   the RIGHT edge, stacked, sliding IN from the right (translateX) after the page settles;
   on hover a badge can expand to show its full label. Harvested from D_saisei (S9).

   THE MOVE: reveal() slides .var-badge from translateX(100%) to 0, staggered; each badge
   is writing-mode: vertical-rl. Hover expands (CSS / optional width grow).

   CONFIG-DRIVEN:
     VerticalAwardsRail.create(target, {     // target contains .var-badge items
       sel: '.var-badge', dur: 0.45, ease: 'power3.out', stagger: 0.08, from: 100
     })
   Returns { reveal(), set(p), hide(), destroy }.

   ENGINE LAWS: transform(translateX) + opacity only; GPU; NO mix-blend / NO backdrop;
   NO WebGL; reduced-motion -> shown. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  function create(target, options) {
    options = options || {};
    var opt = {
      sel: options.sel || '.var-badge',
      dur: options.dur != null ? options.dur : 0.45,
      ease: options.ease || 'power3.out',
      stagger: options.stagger != null ? options.stagger : 0.08,
      from: options.from != null ? options.from : 100
    };
    var host = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!host) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }
    var items = [].slice.call(host.querySelectorAll(opt.sel));
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gsap = global.gsap;
    // set the hidden state THROUGH gsap when present (so gsap owns the transform channel
    // and gsap.to({xPercent:0}) lands exactly — else a stray inline translateX remains).
    items.forEach(function (el) { el.style.willChange = 'transform, opacity';
      if (gsap) gsap.set(el, { xPercent: opt.from, opacity: 0 });
      else { el.style.transform = 'translateX(' + opt.from + '%)'; el.style.opacity = '0'; } });
    function set(p) { items.forEach(function (el) { el.style.transform = 'translateX(' + ((1 - p) * opt.from).toFixed(1) + '%)'; el.style.opacity = p; }); }
    function reveal(o) {
      o = o || {};
      if (reduced) { set(1); o.onComplete && o.onComplete(); return; }
      items.forEach(function (el, i) {
        if (gsap) gsap.to(el, { xPercent: 0, opacity: 1, duration: opt.dur, ease: opt.ease, delay: i * opt.stagger, onComplete: i === items.length - 1 ? o.onComplete : null });
        else setTimeout(function () { var t0 = null, ef = function (t) { return 1 - Math.pow(1 - t, 3); }; (function s(ts) { if (t0 == null) t0 = ts; var t = Math.min(1, (ts - t0) / (opt.dur * 1000)), e = ef(t); el.style.transform = 'translateX(' + ((1 - e) * opt.from).toFixed(1) + '%)'; el.style.opacity = e; if (t < 1) global.requestAnimationFrame(s); else if (i === items.length - 1 && o.onComplete) o.onComplete(); })(performance.now()); }, i * opt.stagger * 1000);
      });
    }
    try { global.__LAB_OK__ = true; } catch (e) {}
    return { reveal: reveal, set: set, hide: function () { set(0); }, destroy: function () {} };
  }
  var api = { create: create };
  global.VerticalAwardsRail = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
