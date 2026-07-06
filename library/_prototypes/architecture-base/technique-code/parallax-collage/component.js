/* ============================================================
   PARALLAX-COLLAGE · component.js   (vanilla, no deps)
   ------------------------------------------------------------
   The EVER "Architecture" editorial-collage ENGINE, harvested from the live site.

   MEASURED LIVE (ever-live-here.com Architecture section, 1440x900):
     - a static editorial GRID of media tiles with DIFFERENT masks:
         left tile  : 420x345  border-radius:50% (a round/oval tile)
         center tile: 420x730  rectangle (tall)
         gap 40px, left edge x=50.
     - a giant wordmark ("Architecture", 108px) sitting BEHIND the tiles as a
       depth plane (z below the tiles), showing through the gutters.
     - a meta layer: a small uppercase title group top-right (~40px @ 67% width),
       a "+" modal button, a gallery counter — all static.
     - 2 floating DECOR objects (textured spheres, PNG) that MOUSE-PARALLAX: each
       drifts a few px toward/away from the pointer, with its OWN amplitude
       (depth) and per-axis difference. Measured: sphere1 ~±4px, sphere2 ~±2px —
       different amplitudes = layered depth. (Pointer-parallax, NOT scroll.)

   So the engine = STATIC tile grid (mixed masks) + a wordmark depth-plane behind
   + floating decor that mouse-parallaxes at per-element depth amplitudes. The
   specific photos / sphere art / exact tile rects are COMPOSITION (config), not
   the engine. This builds the engine; you pass the composition.

   CONFIG-DRIVEN:
     ParallaxCollage.init(target, {
       wordmark: '.pc-word',           // selector of the behind-plane word (optional)
       decoSelector: '[data-deco]',    // floating decor elements (each reads data-depth)
       maxShiftPx: 26,                 // max pointer drift for depth=1
       ease: 0.08,                     // lerp toward target (buttery, frame-rate safe)
       wordmarkDepth: 0.12             // the wordmark plane drifts a touch too (depth)
     })
   Each [data-deco] element carries data-depth="0..1" (its parallax amplitude) and
   optional data-axis="0.6" (y amplitude vs x). Tiles + masks + positions live in
   the MARKUP/CSS (composition). The engine only drives the pointer-parallax of the
   decor (+ optionally the wordmark plane) via a single rAF lerp loop.

   LAW: transform-only, GPU layers, NO mix-blend / NO backdrop over moving decor.
   prefers-reduced-motion -> no parallax (static collage, still composed). Sets
   window.__LAB_OK__ once mounted.
   ============================================================ */
(function (root) {
  'use strict';

  function el(s, c) { return (c || document).querySelector(s); }
  function all(s, c) { return [].slice.call((c || document).querySelectorAll(s)); }

  function init(target, opts) {
    opts = opts || {};
    var stage = typeof target === 'string' ? el(target) : target;
    if (!stage) { try { root.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var cfg = {
      decoSelector: opts.decoSelector || '[data-deco]',
      wordmark: opts.wordmark || null,
      maxShiftPx: opts.maxShiftPx != null ? opts.maxShiftPx : 26,
      ease: opts.ease != null ? opts.ease : 0.08,
      wordmarkDepth: opts.wordmarkDepth != null ? opts.wordmarkDepth : 0.12
    };

    var reduced = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var decos = all(cfg.decoSelector, stage).map(function (d) {
      return {
        elx: d,
        depth: parseFloat(d.getAttribute('data-depth')) || 0.5,
        axis: d.getAttribute('data-axis') != null ? parseFloat(d.getAttribute('data-axis')) : 0.8,
        // preserve any baked transform offset (EVER's decor sit on a -tx,-ty base)
        baseX: parseFloat(d.getAttribute('data-base-x')) || 0,
        baseY: parseFloat(d.getAttribute('data-base-y')) || 0,
        curX: 0, curY: 0
      };
    });
    var wm = cfg.wordmark ? el(cfg.wordmark, stage) : null;
    var wmState = { curX: 0, curY: 0 };

    // promote decor + wordmark to their own GPU layers
    decos.forEach(function (d) {
      d.elx.style.willChange = 'transform';
      d.elx.style.backfaceVisibility = 'hidden';
    });
    if (wm) { wm.style.willChange = 'transform'; wm.style.backfaceVisibility = 'hidden'; }

    // pointer target in [-1, 1] from the stage centre
    var tx = 0, ty = 0;
    function onMove(ev) {
      var r = stage.getBoundingClientRect();
      var px = (ev.clientX - r.left) / r.width;
      var py = (ev.clientY - r.top) / r.height;
      tx = (px - 0.5) * 2;
      ty = (py - 0.5) * 2;
    }
    function onLeave() { tx = 0; ty = 0; }

    var raf = null;
    function loop() {
      decos.forEach(function (d) {
        var goalX = -tx * cfg.maxShiftPx * d.depth + d.baseX;
        var goalY = -ty * cfg.maxShiftPx * d.depth * d.axis + d.baseY;
        d.curX += (goalX - d.curX) * cfg.ease;
        d.curY += (goalY - d.curY) * cfg.ease;
        d.elx.style.transform = 'translate3d(' + d.curX.toFixed(2) + 'px,' + d.curY.toFixed(2) + 'px,0)';
      });
      if (wm) {
        var gx = -tx * cfg.maxShiftPx * cfg.wordmarkDepth;
        var gy = -ty * cfg.maxShiftPx * cfg.wordmarkDepth * 0.6;
        wmState.curX += (gx - wmState.curX) * cfg.ease;
        wmState.curY += (gy - wmState.curY) * cfg.ease;
        wm.style.transform = 'translate3d(' + wmState.curX.toFixed(2) + 'px,' + wmState.curY.toFixed(2) + 'px,0)';
      }
      raf = requestAnimationFrame(loop);
    }

    function mount() {
      // apply any baked base offset immediately so the resting composition is right
      decos.forEach(function (d) { d.elx.style.transform = 'translate3d(' + d.baseX + 'px,' + d.baseY + 'px,0)'; });
      stage.classList.add('pc-ready');
      try { root.__LAB_OK__ = true; } catch (e) {}
    }

    if (reduced) { mount(); return { static: true, destroy: function () {} }; }

    mount();
    stage.addEventListener('mousemove', onMove);
    stage.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(loop);

    return {
      destroy: function () {
        if (raf) cancelAnimationFrame(raf);
        stage.removeEventListener('mousemove', onMove);
        stage.removeEventListener('mouseleave', onLeave);
      }
    };
  }

  var api = { init: init };
  root.ParallaxCollage = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
