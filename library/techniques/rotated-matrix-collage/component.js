/* ============================================================
   ROTATED-MATRIX-COLLAGE · component.js  (dual-platform, vanilla)
   ------------------------------------------------------------
   Springs' signature HERO — a grid of photo tiles rotated as ONE rigid plane
   (~-9deg), bound by a colour multiply wash, that DRIFTS as one plane. Harvested
   from D_springs_walkthrough (S1 hero) + the springs-engine mobile branch.

   🔴 DUAL-PLATFORM — the technique is ONE idea (a drifting rotated plane) but the
   TRIGGER differs by platform, and springs implements BOTH. This module keeps that
   split EXPLICIT in the code (not hidden inside matchMedia branches sprinkled
   through the logic):

     desktop  →  scrollDrift()  — the plane translates on SCROLL (scroll-linked).
                 Measured live: plane Y 0 → -121px across the hero as you scroll.
                 Depth is free: top-row tiles and bottom-row tiles travel a
                 different screen-Y because the whole plane is tilted.

     mobile   →  autoDrift()    — the plane drifts on its own over TIME (auto-play,
                 ambient), independent of scroll. Measured live (springs mobile):
                 item tx 531 → 766 → 1005 across ~12s of wall-time at s=0. Proven
                 to 1.99% pixel-parity via the same-run timing extractor (S18-F).

   Both branches share ONE static layout (the tilted, washed mosaic). Only the
   drift SOURCE (scroll position vs. wall-clock time) differs. See meta.json{differs}
   and README.md § "чим mobile відрізняється й чому".

   CONFIG-DRIVEN (same knobs both platforms):
     RotatedMatrixCollage.init(target, {
       tiles: ['a.webp', …],   // or read .rmc-tile img children
       cols: 4, rows: 3,        // grid shape
       angle: -9,               // plane rotation (deg, counter-clockwise)
       scale: 1.4,              // plane scale so corners over-cover after rotation
       wash: 0.55,              // multiply colour-wash opacity over the mosaic
       gutter: 8,               // px gap between tiles
       // desktop-only:
       parallax: 16,            // whole-plane yPercent drift across the scroll span
       // mobile-only:
       autoMs: 12000,           // one auto-drift cycle length (ms)
       autoDrift: 240,          // px the plane travels over one auto cycle
       platform: 'auto'         // 'auto' | 'desktop' | 'mobile' (force for demos)
     })

   LAW: transform (plane translate/rotate/scale) + opacity only. The wash uses
   mix-blend:multiply but it is BAKED INTO THE STATIC PLANE and the WHOLE plane
   transforms together — the blend is never recomputed over a separately-scrubbed
   surface (the one allowed mix-blend spot, per catalog P18). GPU layer on the plane.
   reduced-motion → no drift (static rotated mosaic) on BOTH platforms. NO WebGL.
   Sets window.__LAB_OK__ on init.
   ============================================================ */
(function (global) {
  'use strict';

  function resolvePlatform(opt) {
    if (opt === 'desktop' || opt === 'mobile') return opt;
    var isDesktop = global.matchMedia && global.matchMedia('(min-width:1024px)').matches;
    return isDesktop ? 'desktop' : 'mobile';
  }

  /* ---- shared: build the tiles + rotate/scale the plane into its rigid pose ---- */
  function layout(stage, cfg) {
    var plane = stage.querySelector('.rmc-plane');
    var grid = stage.querySelector('.rmc-grid');
    if (grid && cfg.tiles) {
      grid.innerHTML = '';
      cfg.tiles.forEach(function (src) {
        var t = document.createElement('div'); t.className = 'rmc-tile';
        var im = document.createElement('img'); im.src = src; im.alt = ''; im.decoding = 'async';
        t.appendChild(im); grid.appendChild(t);
      });
    }
    if (grid) {
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = 'repeat(' + cfg.cols + ', 1fr)';
      grid.style.gridTemplateRows = 'repeat(' + cfg.rows + ', 1fr)';
      grid.style.gap = cfg.gutter + 'px';
    }
    var wash = stage.querySelector('.rmc-wash');
    if (wash) wash.style.opacity = String(cfg.wash);
    // the rigid pose (rotate + scale) lives in a css var; drift only touches translateY
    plane.style.setProperty('--rmc-rot', cfg.angle + 'deg');
    plane.style.setProperty('--rmc-scale', String(cfg.scale));
    plane.style.setProperty('--rmc-y', '0px');
    plane.style.willChange = 'transform';
    plane.style.backfaceVisibility = 'hidden';
    return plane;
  }

  /* ---- DESKTOP: plane translateY is driven by SCROLL position ---- */
  function scrollDrift(stage, plane, cfg) {
    // span = px the plane travels across the hero's own scroll length
    var span = cfg.parallax / 100; // yPercent → fraction of plane height
    function onScroll() {
      var r = stage.getBoundingClientRect();
      var vh = global.innerHeight || 800;
      // progress 0 (hero top at viewport top) → 1 (hero bottom reaches viewport top)
      var p = clamp((-r.top) / (r.height + vh), 0, 1);
      var y = -(plane.offsetHeight * span) * p;
      plane.style.setProperty('--rmc-y', y.toFixed(1) + 'px');
    }
    onScroll();
    global.addEventListener('scroll', onScroll, { passive: true });
    global.addEventListener('resize', onScroll);
    return { onScroll: onScroll };
  }

  /* ---- MOBILE: plane translateY drifts on its OWN over wall-clock TIME ---- */
  function autoDrift(stage, plane, cfg) {
    var t0 = null, raf = 0;
    function frame(now) {
      if (t0 === null) t0 = now;
      var dt = (now - t0) % cfg.autoMs;          // loop the cycle
      var ph = dt / cfg.autoMs;                    // 0..1 within the cycle
      // ease in-out so the drift breathes rather than sawtooths (matches live feel)
      var e = ph < 0.5 ? 2 * ph * ph : 1 - Math.pow(-2 * ph + 2, 2) / 2;
      var y = -cfg.autoDrift * e;
      plane.style.setProperty('--rmc-y', y.toFixed(1) + 'px');
      raf = global.requestAnimationFrame(frame);
    }
    raf = global.requestAnimationFrame(frame);
    return { stop: function () { if (raf) global.cancelAnimationFrame(raf); } };
  }

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  function init(target, options) {
    options = options || {};
    var stage = typeof target === 'string' ? document.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var cfg = {
      tiles: options.tiles || null,
      cols: options.cols || 4,
      rows: options.rows || 3,
      angle: options.angle != null ? options.angle : -9,
      scale: options.scale != null ? options.scale : 1.4,
      wash: options.wash != null ? options.wash : 0.55,
      gutter: options.gutter != null ? options.gutter : 8,
      parallax: options.parallax != null ? options.parallax : 16,
      autoMs: options.autoMs != null ? options.autoMs : 12000,
      autoDrift: options.autoDrift != null ? options.autoDrift : 240
    };

    var platform = resolvePlatform(options.platform || 'auto');
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var plane = layout(stage, cfg);
    stage.setAttribute('data-rmc-platform', platform);

    var driver = null;
    if (!reduced) {
      // 🔴 THE dual-platform split — one line, explicit:
      driver = platform === 'desktop' ? scrollDrift(stage, plane, cfg)
                                       : autoDrift(stage, plane, cfg);
    }

    stage.classList.add('rmc-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return { platform: platform, plane: plane, driver: driver };
  }

  var api = { init: init };
  global.RotatedMatrixCollage = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
