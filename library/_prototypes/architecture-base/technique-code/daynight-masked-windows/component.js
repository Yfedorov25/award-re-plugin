/* ============================================================
   DAYNIGHT-MASKED-WINDOWS · component.js   (V11 — the MASKED-WINDOW GLOW composite)
   ------------------------------------------------------------
   A composite of the day/night CANON (window.DayNight). The building stays in DAY the whole
   time; only the WINDOWS turn to night, each lighting at its own staggered threshold, like a
   house where the rooms switch their lamps on one by one at dusk. The most distinctive
   day/night cell.

   MECHANISM (NO WebGL, NO mask blending, NO canvas):
     - build the canon with mode:'manual', reveal:'opacity', then PIN the night layer at
       opacity 0. The night render never shows as a full layer; the day building stays visible.
     - for EACH window in the config, drop an absolutely-positioned <i class="dnw__win"> over
       the stage whose background IS the night render, sized to the WHOLE stage
       (background-size: 100% 100%) and the box positioned/cropped to the window's rect — so the
       window shows exactly the matching night crop, registered 1:1 over the day building.
     - set(t) fades each window's opacity 0->1 across its own band (t0 .. t0+band), eased, plus
       a soft warm glow (::after blur) that rises with it. Windows light in sequence as t rises.

   So the canon supplies the day/night layer plumbing + the PURE t; this composite owns the
   per-window thresholds and the lamp glow. reveal:'mask' in the canon doc points here.

   DAYNIGHT-MASKED-WINDOWS.create(target, {
     dayMedia,            // url | selector | element — the day still (canon bottom, stays lit)
     nightMedia,          // url | selector | element — the night still, identical composition
     windows,             // [{ x,y,w,h,t0 }] in % of the stage; each lights at t0..t0+band
     band,                // per-window light-up span in t (default 0.18)
     glow                 // warm lamp glow colour (default warm amber); false = no glow
   })
   Returns { root, dn, set(t), get(), windows, destroy }.
     set(t) — PURE: 0 = all dark (day), 1 = all windows lit (dusk).

   ENGINE LAWS (inherited): opacity / transform / gradient only. NO WebGL, NO mix-blend,
   NO backdrop-filter, NO canvas drawImage. prefers-reduced-motion -> static lit end state.
   Requires the canon loaded first (../daynight-engine/component.js -> window.DayNight).
   Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  // demo window layout for the exterior pair — the warm band across the lower-middle.
  var DEFAULT_WINDOWS = [
    { x: 9,  y: 60, w: 10, h: 14, t0: 0.00 },   // carport glow
    { x: 31, y: 58, w: 13, h: 18, t0: 0.12 },   // left group
    { x: 46, y: 57, w: 13, h: 20, t0: 0.28 },   // centre group
    { x: 62, y: 58, w: 15, h: 18, t0: 0.46 },   // right group
    { x: 79, y: 60, w: 8,  h: 14, t0: 0.62 }    // far-right
  ];

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  // smoothstep — gentle ease for a lamp warming up (no hard on/off)
  function ease(p) { p = clamp(p, 0, 1); return p * p * (3 - 2 * p); }

  // resolve a media spec to a URL we can use as a CSS background-image.
  function bgUrl(spec, host) {
    if (!spec) return null;
    if (typeof spec === 'string') {
      if (/\.(webp|jpg|jpeg|png|avif|gif)(\?|$)/i.test(spec)) return spec;
      var node = (host || doc).querySelector(spec);
      return node && node.tagName === 'IMG' ? node.currentSrc || node.src : null;
    }
    if (spec.tagName === 'IMG') return spec.currentSrc || spec.src;
    return null;
  }

  function create(target, options) {
    options = options || {};
    var DN = global.DayNight;
    var host = !target ? doc.body : (typeof target === 'string' ? doc.querySelector(target) : target);
    if (!host || !DN || typeof DN.create !== 'function') {
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { error: 'no target or canon (window.DayNight) not loaded' };
    }

    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var windows = (options.windows && options.windows.length) ? options.windows : DEFAULT_WINDOWS;
    var band = options.band != null ? options.band : 0.18;
    var glow = options.glow != null ? options.glow : 'rgba(247, 206, 142, 0.55)';

    // 1) the canon — manual driver, opacity reveal. We KEEP the night layer pinned at opacity 0
    //    so the daytime building stays visible; only the per-window crops will light up.
    var dn = DN.create(host, {
      dayMedia: options.dayMedia,
      nightMedia: options.nightMedia,
      mode: 'manual',
      reveal: 'opacity'
    });
    var stage = dn.root;
    var nightLayer = stage.querySelector('.dn__night');
    if (nightLayer) { nightLayer.style.opacity = '0'; nightLayer.style.willChange = 'auto'; }

    // the night render as a CSS background for the window crops (no extra <img> decode)
    var nightSrc = bgUrl(options.nightMedia, host) ||
      (nightLayer && nightLayer.querySelector('img') ? nightLayer.querySelector('img').src : null);

    // 2) one lit <i> per window, cropped to show the matching night slice over the day building
    var winEls = [];
    windows.forEach(function (win) {
      var wel = doc.createElement('i');
      wel.className = 'dnw__win';
      wel.style.left = win.x + '%';
      wel.style.top = win.y + '%';
      wel.style.width = win.w + '%';
      wel.style.height = win.h + '%';
      if (nightSrc) {
        wel.style.backgroundImage = 'url("' + nightSrc + '")';
        // size the night image to the WHOLE stage, then offset so this box shows ITS crop.
        wel.style.backgroundSize = (10000 / win.w) + '% ' + (10000 / win.h) + '%';
        wel.style.backgroundPosition =
          (win.x / (100 - win.w) * 100) + '% ' + (win.y / (100 - win.h) * 100) + '%';
      }
      wel.style.setProperty('--dnw-glow', glow);
      wel.style.opacity = '0';
      wel.style.willChange = 'opacity';
      stage.appendChild(wel);
      winEls.push({ el: wel, t0: win.t0 });
    });

    // 3) the PURE setter — light every window across its own band, eased.
    function apply(t) {
      var v = clamp(t, 0, 1);
      for (var i = 0; i < winEls.length; i++) {
        var w = winEls[i];
        var p = ease((v - w.t0) / band);   // 0 before t0, 1 once fully past t0+band
        w.el.style.opacity = String(p);
      }
      if (dn.get() !== 0) dn.set(0);        // keep the day building fully visible underneath
    }
    apply(0);

    if (reduced) apply(1);                  // static lit end state, no driver

    try { global.__LAB_OK__ = true; } catch (e) {}

    return {
      root: stage,
      dn: dn,                               // the underlying canon instance
      windows: winEls,
      set: apply,                           // PURE: 0 = dark, 1 = all lit
      get: function () {
        // recover t from the windows (the first window's progress is the cleanest proxy)
        var first = winEls[0];
        return first ? clamp(first.t0 + band * (parseFloat(first.el.style.opacity) || 0), 0, 1) : 0;
      },
      destroy: function () {
        winEls.forEach(function (w) { if (w.el.parentNode) w.el.parentNode.removeChild(w.el); });
        winEls = [];
        dn.destroy();
      }
    };
  }

  var api = { create: create, DEFAULT_WINDOWS: DEFAULT_WINDOWS };
  global.DayNightMaskedWindows = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
