/* ============================================================
   ROTATED-MOSAIC-HERO · component.js  (vanilla; optional GSAP+ScrollTrigger+Lenis
   for the plane parallax; degrades to static)
   ------------------------------------------------------------
   Springs' signature HERO — a grid of photo tiles rotated as ONE rigid plane,
   bound by a colour multiply wash, drifting as one plane on scroll. Harvested from
   D_springs_walkthrough_video (S1 hero).

   MEASURED (teardown): ~9-12 photo tiles in a CSS grid, the whole grid rotated
   rigidly ~-8 to -10deg (counter-clockwise) and scaled up so its corners cover the
   viewport; thin gutters between tiles; a dark colour wash sits OVER the whole
   mosaic at ~55-65% (multiply) UNIFYING the disparate photos into one calm field;
   a solid colour bg behind. On scroll the ENTIRE rotated plane translates up as one
   (tiles do NOT counter-rotate). Depth comes from the rotation (top-row vs bottom-
   row tiles travel different screen-Y as the plane moves) — a free depth feel
   WITHOUT per-tile speed. Over it: a giant serif title (e.g. bottom-right) + a small
   eyebrow line.

   CONFIG-DRIVEN:
     RotatedMosaicHero.init(target, {
       tiles: ['a.webp','b.webp', …],   // or read .rmh-tile img children
       cols: 4, rows: 3,                 // grid shape
       angle: -9,                        // plane rotation (deg)
       scale: 1.35,                      // plane scale so corners cover after rotation
       wash: 0.6,                        // colour wash opacity over the mosaic
       parallax: 18,                     // whole-plane yPercent drift on scroll
       gutter: 8                         // px gap between tiles
     })
   Markup-first: if tiles omitted, uses .rmh-tile children. The wash colour + bg +
   title are composition (CSS/markup).

   LAW: transform (plane translate/rotate/scale) + opacity only; the wash uses
   mix-blend:multiply but it is BAKED INTO THE STATIC PLANE (the wash sits on the
   mosaic and the WHOLE plane transforms together — the blend is NOT recomputed over
   a separately-scrubbed surface, so it is safe; this is the one allowed mix-blend
   spot, like the catalog notes for P18). GPU layer on the plane. reduced-motion ->
   no parallax (static rotated mosaic). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';

  function init(target, options) {
    options = options || {};
    var stage = typeof target === 'string' ? document.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var cfg = {
      cols: options.cols || 4,
      rows: options.rows || 3,
      angle: options.angle != null ? options.angle : -9,
      scale: options.scale != null ? options.scale : 1.35,
      wash: options.wash != null ? options.wash : 0.6,
      parallax: options.parallax != null ? options.parallax : 18,
      gutter: options.gutter != null ? options.gutter : 8
    };

    var plane = stage.querySelector('.rmh-plane');
    var grid = stage.querySelector('.rmh-grid');
    // build tiles if a tiles array is given (else use existing .rmh-tile children)
    var tilesData = options.tiles || null;
    if (grid && tilesData) {
      grid.innerHTML = '';
      tilesData.forEach(function (src) {
        var t = document.createElement('div'); t.className = 'rmh-tile';
        var im = document.createElement('img'); im.src = src; im.alt = ''; im.decoding = 'async';
        t.appendChild(im); grid.appendChild(t);
      });
    }
    var tiles = grid ? [].slice.call(grid.querySelectorAll('.rmh-tile')) : [];

    // lay out the grid + rotate/scale the plane
    if (grid) {
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = 'repeat(' + cfg.cols + ', 1fr)';
      grid.style.gridTemplateRows = 'repeat(' + cfg.rows + ', 1fr)';
      grid.style.gap = cfg.gutter + 'px';
    }
    if (plane) {
      plane.style.transform = 'rotate(' + cfg.angle + 'deg) scale(' + cfg.scale + ')';
      plane.style.willChange = 'transform';
      plane.style.backfaceVisibility = 'hidden';
    }
    // wash opacity (the unifying colour layer over the mosaic, inside the plane)
    var wash = stage.querySelector('.rmh-wash');
    if (wash) wash.style.opacity = String(cfg.wash);

    // plane parallax: the WHOLE plane drifts up as one (keeps its rotation+scale)
    var planeTransform = 'rotate(' + cfg.angle + 'deg) scale(' + cfg.scale + ')';
    if (!reduced && gsap && ScrollTrigger && cfg.parallax) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.to(plane, {
        yPercent: -cfg.parallax, ease: 'none',
        scrollTrigger: { trigger: stage, start: 'top top', end: 'bottom top', scrub: true },
        // keep rotation+scale while yPercent drifts (gsap composes yPercent with the css transform)
      });
      // gsap.to with yPercent on an element that already has a CSS rotate/scale: set the
      // base via gsap so it composes cleanly
      gsap.set(plane, { rotation: cfg.angle, scale: cfg.scale });
    }

    stage.classList.add('rmh-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      tiles: tiles,
      refresh: function () { if (ScrollTrigger) ScrollTrigger.refresh(); }
    };
  }

  var api = { init: init };
  global.RotatedMosaicHero = api;
  global.rotatedMosaicHero = function (t, o) { return init(t, o); };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
