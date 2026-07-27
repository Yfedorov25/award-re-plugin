/* ============================================================
   RENDER-SLICE-REVEAL · component.js  (vanilla, composes center-seam-split)
   ------------------------------------------------------------
   Saisei's render reveal — a NEW full-bleed render appears through a black centre SLICE
   that opens (centre->edges, power2.in: a hairline that dwells then rips), and a dark
   VEIL over the render CLEARS IN SYNC with the slice, so the render brightens from dark
   to full colour exactly as the slice grows. The render is FIXED behind; the slice +
   veil do the reveal. Harvested from D_saisei (the page-open render-slicer, t073-t080).

   THE MOVE: the render sits full-bleed under a dark veil (opacity = veil). A
   center-seam-split cover OPENS over it (power2.in), exposing the render as a growing
   centre slice; the seam's live progress drives the veil opacity veil -> 0, so the
   render surfaces dark->bright as the slice widens.

   COMPOSES center-seam-split (must be loaded first). NO WebGL.

   CONFIG-DRIVEN:
     RenderSliceReveal.create(target, {       // target wraps .rsr-render (img) + .rsr-veil
       veil: 0.78,           // starting darkness over the render
       fill: '#0e0e0c',      // the slice cover colour (the black that parts)
       duration: 0.93, ease: 'power2.in',     // Saisei open curve
       veilEase: 1.0,        // veil clears fully by this fraction of the slice (1 = in lockstep)
       z: 60
     })
   Returns { open(o), set(p), reset(), destroy }.
   - open(): runs the slice + veil clear. set(p 0..1): PURE scrub (slice + veil). reset(): re-cover + re-darken.

   ENGINE LAWS: clip-path inset (the slice, via center-seam-split) + opacity (the veil)
   only; GPU; NO mix-blend / NO backdrop over the render; NO WebGL; reduced-motion ->
   instant revealed. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      veil: options.veil != null ? options.veil : 0.78,
      fill: options.fill || '#0e0e0c',
      duration: options.duration != null ? options.duration : 0.93,
      ease: options.ease || 'power2.in',
      veilEase: options.veilEase != null ? options.veilEase : 1.0,
      z: options.z != null ? options.z : 60
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var CSS = global.CenterSeamSplit;
    var veilEl = stage.querySelector('.rsr-veil');
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setVeil(v) { if (veilEl) veilEl.style.opacity = String(v); }

    // the slice cover is injected over THIS stage by center-seam-split
    var seam = null;
    function ensureSeam() {
      if (seam) return seam;
      if (!CSS) return null;
      seam = CSS.create(stage, { fill: opt.fill, axis: 'x', z: opt.z, duration: opt.duration, ease: opt.ease });
      return seam;
    }

    // PURE scrub: p 0 = fully sliced shut + render dark; p 1 = fully open + render bright
    function set(p) {
      var s = ensureSeam(); if (s) s.set(p);
      // veil clears as the slice grows; veilEase<1 makes it clear earlier
      var vp = Math.min(1, p / opt.veilEase);
      setVeil(opt.veil * (1 - vp));
    }

    function reset() {
      var s = ensureSeam(); if (s) s.set(0);
      setVeil(opt.veil);
    }

    function open(o) {
      o = o || {};
      var s = ensureSeam();
      if (reduced || !s) { set(1); if (o.onComplete) o.onComplete(); return; }
      s.set(0); setVeil(opt.veil);
      s.open({
        duration: o.duration != null ? o.duration : opt.duration,
        ease: o.ease || opt.ease,
        onUpdate: function (p) { var vp = Math.min(1, p / opt.veilEase); setVeil(opt.veil * (1 - vp)); },
        onComplete: function () { setVeil(0); if (o.onComplete) o.onComplete(); }
      });
    }

    reset();
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      open: open, set: set, reset: reset,
      seam: function () { return seam; },
      destroy: function () { if (seam) seam.destroy(); }
    };
  }

  var api = { create: create };
  global.RenderSliceReveal = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
