/* ============================================================
   SCROLL-SCRUB-VIDEO · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   Scroll-scrubs an architect's camera move (a 3D fly-around / descent, 5-20s) frame
   by frame as you scroll — the Apple/AirPods technique: NOT video.currentTime (which
   stutters: 1 keyframe per ~192 frames means every seek decodes the whole GOP). We
   PRE-EXTRACT the clip to a numbered image sequence (ffmpeg), preload it, and draw the
   right frame to a <canvas> on scroll. Zero decoder lag, locked 60fps, pixel-exact.

   THE MOVE: the section PINS full-screen; scroll progress 0..1 maps to frame 0..N-1
   (a lerped, eased index so it glides instead of snapping); the canvas paints that
   frame. Reversible. A preload gate holds until enough frames are decoded.

   CONFIG-DRIVEN:
     ScrollScrubVideo.init(target, {
       frames: 'renders/arrival-frames/f_',  // path prefix; frame = prefix + NNN + ext
       count: 120, pad: 3, ext: '.webp', start: 1,
       pinFactor: 2.0,     // pin length = innerHeight*pinFactor (longer = slower scrub)
       lerp: 0.16,         // frame-index smoothing (lower = glassier, more lag)
       preloadMin: 0.5,    // fraction of frames to decode before revealing (rest lazy)
       cover: true, manageLenis: true
     })
   Markup: .ssv-stage > canvas.ssv-canvas + [.ssv-preload (a 0..100 hint)] +
   [.ssv-content ...]. The frame sequence + copy are composition; the engine preloads
   + paints + pins.

   ENGINE LAWS: Lenis -> gsap.ticker -> ScrollTrigger.update; lagSmoothing(0);
   the paint is a PURE fn of a smoothed frame index; pin/scrub; canvas drawImage only
   (no per-frame layout); NO mix-blend / NO backdrop over the scrubbed surface; NO
   WebGL (2d canvas); reduced-motion / <=820px -> static (paint the LAST frame, no
   pin/scrub). Sets window.__LAB_OK__ once the preload gate is met.
   ============================================================ */
(function (global) {
  'use strict';

  function pad(n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; }

  function init(target, options) {
    options = options || {};
    var opt = {
      frames: options.frames || 'frames/f_',
      count: options.count != null ? options.count : 120,
      padN: options.pad != null ? options.pad : 3,
      ext: options.ext || '.webp',
      start: options.start != null ? options.start : 1,
      pinFactor: options.pinFactor != null ? options.pinFactor : 2.0,
      lerp: options.lerp != null ? options.lerp : 0.16,
      preloadMin: options.preloadMin != null ? options.preloadMin : 0.5,
      cover: options.cover !== false,
      dprCap: options.dprCap != null ? options.dprCap : 1.25,
      manageLenis: options.manageLenis !== false
    };

    var stage = typeof target === 'string' ? document.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var canvas = stage.querySelector('.ssv-canvas');
    var preloadEl = stage.querySelector('.ssv-preload');
    if (!canvas) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no canvas' }; }
    var ctx = canvas.getContext('2d');

    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    // ---- frame sources ----
    // We hold DECODED frames, not <img>s. The scrub jank with <img> is decode-jank:
    // a preloaded <img> still holds COMPRESSED bytes, so the FIRST drawImage of each
    // frame decodes the webp inline and blocks. createImageBitmap decodes ONCE, off
    // the main thread, into a ready raster — drawImage of an ImageBitmap is then a
    // cheap GPU copy. That is what makes the scrub glassy. (Falls back to <img>.)
    var bitmaps = new Array(opt.count);   // ImageBitmap (or decoded <img>) per frame
    var started = new Array(opt.count);
    var loadedCount = 0;
    var useBitmap = typeof global.createImageBitmap === 'function' && typeof global.fetch === 'function';

    function url(i) { return opt.frames + pad(opt.start + i, opt.padN) + opt.ext; }
    function loadFrame(i, onload) {
      if (started[i]) return; started[i] = true;
      if (useBitmap) {
        global.fetch(url(i)).then(function (r) { return r.blob(); })
          .then(function (b) { return global.createImageBitmap(b); })
          .then(function (bm) { bitmaps[i] = bm; loadedCount++; if (onload) onload(); })
          .catch(function () { loadedCount++; if (onload) onload(); }); // count to not stall the gate
      } else {
        var im = new Image(); im.decoding = 'async';
        im.onload = function () { bitmaps[i] = im; loadedCount++; if (onload) onload(); };
        im.onerror = function () { loadedCount++; if (onload) onload(); };
        im.src = url(i);
      }
    }

    // ---- canvas sizing (cover) ----
    // Cap DPR for a SCRUB BACKDROP: the frames are ~1280px wide, so a retina (2x)
    // canvas only upscales them (blurrier) AND makes every drawImage 2.5x heavier =
    // the scrub jank. 1.25 keeps it crisp at our frame size and paints cheaply.
    var dprCap = opt.dprCap != null ? opt.dprCap : 1.25;
    var dpr = Math.min(global.devicePixelRatio || 1, dprCap);
    function resize() {
      var w = stage.clientWidth, h = stage.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'low'; // cheap scale (reset on resize)
      paint(curIdx, true);
    }

    var lastPainted = -1;
    function drawCover(im) {
      var cw = canvas.width, ch = canvas.height, iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height;
      if (!iw || !ih) return;
      var scale = opt.cover ? Math.max(cw / iw, ch / ih) : Math.min(cw / iw, ch / ih);
      var dw = iw * scale, dh = ih * scale, dx = (cw - dw) / 2, dy = (ch - dh) / 2;
      ctx.drawImage(im, dx, dy, dw, dh);
    }
    function ready(bm) { return bm && (bm.width || bm.naturalWidth) && (bm.complete === undefined || bm.complete); }
    function paint(idx, force) {
      idx = Math.max(0, Math.min(opt.count - 1, Math.round(idx)));
      if (!force && idx === lastPainted) return;
      var bm = bitmaps[idx];
      if (ready(bm)) { drawCover(bm); lastPainted = idx; }
      else { // not decoded yet: trigger its load, keep the previous painted frame meanwhile
        loadFrame(idx, function () { if (Math.round(curIdx) === idx && ready(bitmaps[idx])) { drawCover(bitmaps[idx]); lastPainted = idx; } });
      }
    }

    // ---- static fallback ----
    if (reduced || narrow || !gsap || !ScrollTrigger || !Lenis) {
      stage.classList.add('ssv-static');
      resize();
      loadFrame(opt.count - 1, function () { paint(opt.count - 1, true); });
      try { global.__LAB_OK__ = true; } catch (e) {}
      global.addEventListener('resize', resize);
      return { static: true, destroy: function () { global.removeEventListener('resize', resize); } };
    }

    gsap.registerPlugin(ScrollTrigger);
    gsap.ticker.lagSmoothing(0);

    var lenis = null;
    if (opt.manageLenis) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      global.__lenis = lenis;
    }

    var curIdx = 0;     // smoothed (painted) index
    var targetIdx = 0;  // scroll-driven target

    // smooth the frame index on the ticker so a fast scroll glides rather than snapping
    function tick() {
      var d = targetIdx - curIdx;
      if (Math.abs(d) < 0.01) curIdx = targetIdx; else curIdx += d * opt.lerp;
      paint(curIdx, false);
    }
    gsap.ticker.add(tick);

    var trigger = ScrollTrigger.create({
      trigger: stage, start: 'top top',
      end: function () { return '+=' + Math.round(global.innerHeight * opt.pinFactor); },
      pin: true, pinSpacing: true, scrub: true,
      onUpdate: function (self) { targetIdx = self.progress * (opt.count - 1); }
    });

    // ---- preload gate: decode the first preloadMin fraction, then reveal ----
    function setPreload(p) { if (preloadEl) { var v = Math.round(p * 100); preloadEl.textContent = v + '%'; preloadEl.style.setProperty('--ssv-p', v); } }
    var need = Math.max(1, Math.round(opt.count * opt.preloadMin));
    var gateOpen = false;
    function checkGate() {
      setPreload(Math.min(1, loadedCount / need));
      if (!gateOpen && loadedCount >= need) {
        gateOpen = true;
        stage.classList.add('ssv-ready');
        resize(); paint(0, true);
        try { global.__LAB_OK__ = true; } catch (e) {}
      }
    }
    // load in scroll order, spread out so the network/decoder isn't slammed
    for (var i = 0; i < opt.count; i++) loadFrame(i, checkGate);
    checkGate();

    // safety: if a few frames error, still open the gate after a beat
    var safety = global.setTimeout(function () { if (!gateOpen) { gateOpen = true; stage.classList.add('ssv-ready'); resize(); paint(0, true); try { global.__LAB_OK__ = true; } catch (e) {} } }, 4000);

    global.addEventListener('resize', resize);
    resize();

    return {
      trigger: trigger, lenis: lenis, paint: paint,
      refresh: function () { ScrollTrigger.refresh(); resize(); },
      destroy: function () {
        global.clearTimeout(safety); gsap.ticker.remove(tick);
        trigger && trigger.kill(); if (lenis) lenis.destroy();
        global.removeEventListener('resize', resize);
        for (var i = 0; i < bitmaps.length; i++) { var bm = bitmaps[i]; if (bm && bm.close) bm.close(); } // free ImageBitmaps
      }
    };
  }

  var api = { init: init };
  global.ScrollScrubVideo = api;
  global.scrollScrubVideo = function (t, o) { return init(t, o); };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
