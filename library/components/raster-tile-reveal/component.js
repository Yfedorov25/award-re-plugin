/* ============================================================
   RASTER-TILE-REVEAL · component.js  (vanilla + guarded GSAP 3.12.5 / ScrollTrigger)
   ------------------------------------------------------------
   The first PHOTOGRAPHIC-map medium in the location family. Every other location atom is
   hand-drawn SVG or vector-baked OSM line-art; this one shows a REAL raster map — a pre-baked
   STATIC mosaic of map tiles (satellite-style imagery of the real coordinates) laid out as a
   grid of plain <img> tiles. NO live tile server / NO Leaflet / NO Mapbox / NO pan engine at
   runtime (stays no-WebGL, no second scroll owner — the mosaic is frozen, only the REVEAL moves).

   THE MOVE (the whole point = the DECODE-GUARD):
     - all tiles are loaded and FORCE-DECODED up front (img.decode()) BEFORE anything is shown —
       an undecoded <img> paints a black flicker, so we never reveal a tile that has not decoded.
     - on reveal() the decoded tiles fade + scale in (scaleFrom -> 1) with a small per-tile
       stagger across the grid; then real POI dots DROP onto their real positions (scale 0 -> 1,
       translateY small rise), one after another.
     - set(p) is a PURE function of progress 0..1 (reversible): it maps p across the grid so the
       early tiles are in by p~0.6 and the dots land by p=1. Drives the same look from a scrub.

   CONFIG-DRIVEN:
     RasterTileReveal.create(target, {     // target = .rtr-stage
       tiles: [{ src, col, row }, ...], cols: 4, rows: 4,
       pois:  [{ x, y, label }, ...],     // x,y in 0..100 (% of the mosaic box)
       stagger: 0.04, scaleFrom: 1.04, ease: 'air', auto: true
     })
   Markup: .rtr-stage > .rtr-mosaic (tiles + dots injected). Returns { reveal(), set(p), destroy }.

   ENGINE LAWS: transform (scale/translateY) + opacity + filter only — NO width/height/top/left,
   NO mix-blend, NO backdrop, NO WebGL, NO canvas (plain <img> tiles), NO video scrub. GPU.
   Decode-guard before every reveal/swap; will-change cleared after the one-shot.
   reduced-motion -> static (all tiles + dots shown, no motion). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  var EASES = {
    air: 'cubic-bezier(.22,1,.36,1)',
    out: 'cubic-bezier(.16,1,.3,1)',
    soft: 'cubic-bezier(.4,0,.2,1)',
    none: 'linear'
  };

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  // force-decode an <img>; resolves even if decode() is unsupported or fails (never blocks reveal)
  function decodeImg(img) {
    return new Promise(function (res) {
      if (!img) { res(); return; }
      var done = false, fin = function () { if (!done) { done = true; res(); } };
      if (typeof img.decode === 'function') {
        img.decode().then(fin).catch(function () {
          // decode() can reject on cached/cross-origin imgs — fall back to load events
          if (img.complete && img.naturalWidth > 0) fin();
          else { img.addEventListener('load', fin, { once: true }); img.addEventListener('error', fin, { once: true }); }
        });
      } else if (img.complete && img.naturalWidth > 0) { fin(); }
      else { img.addEventListener('load', fin, { once: true }); img.addEventListener('error', fin, { once: true }); }
    });
  }

  function create(target, options) {
    options = options || {};
    var opt = {
      tiles: options.tiles || [],
      cols: options.cols != null ? options.cols : 4,
      rows: options.rows != null ? options.rows : 4,
      pois: options.pois || [],
      stagger: options.stagger != null ? options.stagger : 0.04,
      scaleFrom: options.scaleFrom != null ? options.scaleFrom : 1.04,
      ease: options.ease || 'air',
      dur: options.dur != null ? options.dur : 0.7,
      auto: options.auto !== false
    };
    var ease = EASES[opt.ease] || opt.ease;
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ScrollTrigger = global.ScrollTrigger;

    // ---- build the mosaic ----------------------------------------------------
    var mosaic = stage.querySelector('.rtr-mosaic');
    if (!mosaic) { mosaic = doc.createElement('div'); mosaic.className = 'rtr-mosaic'; stage.appendChild(mosaic); }
    mosaic.style.setProperty('--rtr-cols', opt.cols);
    mosaic.style.setProperty('--rtr-rows', opt.rows);

    var tileEls = [];
    opt.tiles.forEach(function (t, i) {
      var cell = doc.createElement('div');
      cell.className = 'rtr-tile';
      cell.style.gridColumn = (t.col + 1);
      cell.style.gridRow = (t.row + 1);
      var img = doc.createElement('img');
      img.alt = '';
      img.decoding = 'async';
      img.src = t.src;
      // order index along a diagonal sweep so the stagger reads as a wave, not a row scan
      cell._ord = (t.row + t.col);
      cell.appendChild(img);
      mosaic.appendChild(cell);
      tileEls.push({ cell: cell, img: img });
    });
    var maxOrd = 1;
    tileEls.forEach(function (te) { if (te.cell._ord > maxOrd) maxOrd = te.cell._ord; });

    var dotEls = [];
    opt.pois.forEach(function (p) {
      var dot = doc.createElement('div');
      dot.className = 'rtr-dot';
      dot.style.left = clamp01(p.x / 100) * 100 + '%';
      dot.style.top = clamp01(p.y / 100) * 100 + '%';
      var label = doc.createElement('span');
      label.className = 'rtr-dot-label';
      label.textContent = p.label || '';
      dot.appendChild(label);
      mosaic.appendChild(dot);
      dotEls.push(dot);
    });

    // ---- state setters (PURE on progress) ------------------------------------
    // each tile occupies a normalized window [w0, w1] of progress based on its diagonal order;
    // set(p) maps p->local t per tile, transform scale + opacity only.
    function tileWindow(ord) {
      // tiles finish by ~0.62 of the timeline; later orders start later
      var span = 0.62;
      var w0 = (ord / (maxOrd + 1)) * (span * 0.7);
      var w1 = w0 + span * 0.5;
      return [w0, Math.min(w1, span)];
    }
    function setTile(te, p) {
      var win = tileWindow(te.cell._ord);
      var t = clamp01((p - win[0]) / (win[1] - win[0] || 1));
      te.cell.style.opacity = t;
      var sc = opt.scaleFrom + (1 - opt.scaleFrom) * t;
      te.img.style.transform = 'scale(' + sc.toFixed(4) + ')';
    }
    function setDot(dot, i, p) {
      // dots land in the last 0.38 of the timeline, staggered
      var n = dotEls.length || 1;
      var d0 = 0.62 + (i / n) * 0.30;
      var d1 = d0 + 0.16;
      var t = clamp01((p - d0) / (d1 - d0 || 1));
      dot.style.opacity = t;
      dot.style.transform = 'translate(-50%,-100%) translateY(' + ((1 - t) * 10).toFixed(1) + 'px) scale(' + (0.4 + 0.6 * t).toFixed(3) + ')';
    }

    function set(p) {
      p = clamp01(p);
      for (var i = 0; i < tileEls.length; i++) setTile(tileEls[i], p);
      for (var j = 0; j < dotEls.length; j++) setDot(dotEls[j], j, p);
    }

    function clearWill() {
      tileEls.forEach(function (te) { te.cell.style.willChange = ''; te.img.style.willChange = ''; });
      dotEls.forEach(function (d) { d.style.willChange = ''; });
    }
    function armWill() {
      tileEls.forEach(function (te) { te.cell.style.willChange = 'opacity'; te.img.style.willChange = 'transform'; });
      dotEls.forEach(function (d) { d.style.willChange = 'transform, opacity'; });
    }

    set(0); // hidden start (tiles are hidden -> they will not paint until decoded + revealed)

    // ---- reduced-motion / no-GSAP -> static after decode ---------------------
    function showStatic() {
      decodeAll().then(function () {
        stage.classList.add('rtr-static');
        tileEls.forEach(function (te) { te.cell.style.transition = 'none'; te.cell.style.opacity = 1; te.img.style.transform = 'none'; });
        dotEls.forEach(function (d) { d.style.transition = 'none'; d.style.opacity = 1; d.style.transform = 'translate(-50%,-100%) scale(1)'; });
        stage.classList.add('rtr-ready');
        try { global.__LAB_OK__ = true; } catch (e) {}
      });
    }

    // decode EVERY tile up front; only resolve once all are decoded (the decode-guard)
    function decodeAll() {
      return Promise.all(tileEls.map(function (te) { return decodeImg(te.img); }));
    }

    var revealed = false;
    // CSS-transition one-shot reveal (no GSAP needed for the reveal itself; GSAP only sequences)
    function reveal() {
      if (revealed) return Promise.resolve();
      revealed = true;
      return decodeAll().then(function () {
        // all tiles decoded — safe to paint. transition opacity (cell) + transform (img).
        armWill();
        stage.classList.add('rtr-revealing');
        var di = opt.dur, st = opt.stagger;
        tileEls.forEach(function (te) {
          var delay = te.cell._ord * st;
          te.cell.style.transition = 'opacity ' + di + 's ' + ease + ' ' + delay + 's';
          te.img.style.transition = 'transform ' + di + 's ' + ease + ' ' + delay + 's';
          te.cell.style.opacity = 1;
          te.img.style.transform = 'scale(1)';
        });
        // dots drop after the tiles are mostly in
        var tilesDone = (maxOrd * st) + di;
        dotEls.forEach(function (d, i) {
          var delay = tilesDone + i * 0.09;
          d.style.transition = 'opacity .5s ' + ease + ' ' + delay + 's, transform .5s ' + ease + ' ' + delay + 's';
          d.style.opacity = 1;
          d.style.transform = 'translate(-50%,-100%) scale(1)';
        });
        // clear will-change after the longest one-shot
        var total = (tilesDone + dotEls.length * 0.09 + 0.6) * 1000;
        global.setTimeout(clearWill, total);
        stage.classList.add('rtr-ready');
        try { global.__LAB_OK__ = true; } catch (e) {}
      });
    }

    if (reduced) { showStatic(); return { static: true, set: set, reveal: function () {}, destroy: function () {} }; }

    // DECODE-GUARD: decode EVERY tile up front the moment we mount, no matter when the reveal
    // fires. The reveal can then paint instantly with zero black flicker; the component is
    // "wired + ready" once all tiles have decoded.
    decodeAll().then(function () { try { global.__LAB_OK__ = true; } catch (e) {} });

    var trigger = null;
    if (opt.auto) {
      if (ScrollTrigger) {
        trigger = ScrollTrigger.create({
          trigger: stage, start: 'top 78%', once: true,
          onEnter: function () { reveal(); }
        });
        // if it is already in view on load, fire immediately
        var r = stage.getBoundingClientRect();
        if (r.top < (global.innerHeight || 800) * 0.78) reveal();
      } else {
        // no ScrollTrigger — reveal on next frame once mounted
        global.requestAnimationFrame(function () { reveal(); });
      }
    }
    // manual mode (auto:false): the up-front decodeAll above already armed the decode-guard;
    // the caller drives reveal()/set() — both are flicker-safe because the tiles are decoded.

    return {
      reveal: reveal,
      set: set,            // PURE scrub of the whole timeline (tiles + dots), 0..1, reversible
      trigger: trigger,
      decodeAll: decodeAll,
      refresh: function () { if (ScrollTrigger) ScrollTrigger.refresh(); },
      destroy: function () { if (trigger) trigger.kill(); clearWill(); }
    };
  }

  var api = { create: create };
  global.RasterTileReveal = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
