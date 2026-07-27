/* ============================================================
   FRAME-SCRUB-IMG · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   A scroll-scrubbed IMAGE SEQUENCE, the no-WebGL, no-canvas way to drive a true
   continuous camera move (a fly-around / arrival / construction timelapse) off one
   pinned scroll. ERA's /architecture intro is a 149-frame data-sequence scrub; Ever's
   /progress is a ~1333-frame scrub. This is that grammar harvested as a reusable atom.

   THE MOVE (one pinned scroll-scrub, progress p 0..1):
     - a single on-screen <img class="fsi-frame"> whose .src is SWAPPED to the frame
       nearest p (idx = round(p * (N-1))). Nothing is composited, one decoded bitmap
       paints to the screen at a time. The browser blits a pre-decoded same-size image,
       so there is no layout, no canvas, no per-pixel work.
     - EVERY frame is preloaded into an off-DOM Image[] and decode()'d up front, so the
       swap is a pointer change to an already-decoded source => no decode-jank on scroll.
     - the swap is rAF-THROTTLED + idx-DEDUPED: set(p) only touches the DOM when the
       integer frame index actually changes, and at most once per animation frame.
   set(p) is a PURE function of progress (reversible; scroll up = sequence plays back).

   WHY NOT canvas drawImage: BANNED (and unnecessary). An <img>.src swap between equal-
   size, already-decoded WebP frames is GPU-blitted by the compositor with no main-thread
   raster. The off-DOM decode() up front is what removes the only jank source.

   CONFIG-DRIVEN:
     FrameScrubImg.create(target, {        // target = the .fsi-stage element/selector
       framePath: 'renders/arrival-frames/', // dir holding the sequence
       pattern: 'f_###.webp',              // ### = zero-padded index, count from `from`
       count: 120, from: 1, pad: 3,        // 120 frames, f_001..f_120
       pinFactor: 2.4,                     // pin length = innerHeight * pinFactor
       hold: 0.06,                         // fraction of the END held on the last frame
       manageLenis: true
     })
   Markup: <div class="fsi-stage"><img class="fsi-frame" alt="..."></div>  (img optional;
   created if absent). The .fsi-frame element is the [data-render-surface] in a combo.
   Returns { trigger, set(p), ready (Promise), frames, destroy }.

   ENGINE LAWS: only the <img> src swaps; layout-stable (object-fit:cover, fixed box);
   NO canvas drawImage, NO video.currentTime, NO mix-blend, NO backdrop, NO WebGL.
   reduced-motion / <=820px -> last frame shown statically, no pin. owns_pin TRUE.
   Sets window.__LAB_OK__ once the engine is wired and the first frame has painted.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function pad(n, width) {
    var s = String(n);
    while (s.length < width) s = '0' + s;
    return s;
  }

  // build the N frame URLs from pattern 'f_###.webp' (### -> zero-padded index)
  function buildUrls(opt) {
    var urls = [];
    var hashes = (opt.pattern.match(/#+/) || ['###'])[0];
    var width = opt.pad != null ? opt.pad : hashes.length;
    for (var i = 0; i < opt.count; i++) {
      var num = pad(opt.from + i, width);
      var file = opt.pattern.replace(/#+/, num);
      urls.push(opt.framePath + file);
    }
    return urls;
  }

  function create(target, options) {
    options = options || {};
    var opt = {
      framePath: options.framePath || 'renders/arrival-frames/',
      pattern: options.pattern || 'f_###.webp',
      count: options.count != null ? options.count : 120,
      from: options.from != null ? options.from : 1,
      pad: options.pad,
      pinFactor: options.pinFactor != null ? options.pinFactor : 2.4,
      hold: options.hold != null ? options.hold : 0.06,
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var urls = buildUrls(opt);
    var N = urls.length;
    var lastIdx = -1; // dedupe: only swap when the integer frame index changes

    // the single on-screen frame element (created if the markup omits it). The .src swaps to
    // the frame nearest progress; an off-DOM decoded cache + a decode-guard (see applyNow)
    // ensures we only ever swap to an already-decoded frame, so the swap never shows black.
    var img = stage.querySelector('.fsi-frame');
    if (!img) {
      img = doc.createElement('img');
      img.className = 'fsi-frame';
      stage.appendChild(img);
    }
    img.setAttribute('decoding', 'async');
    if (!img.getAttribute('alt')) img.setAttribute('alt', 'Обліт будинку, кадр послідовності');

    // off-DOM decoded cache so a src swap is a pointer change to an ALREADY-DECODED bitmap.
    // cache[i].decoded flips true only after the browser has fully decoded the frame — the
    // swap guard below NEVER points img.src at an undecoded frame (that was the black-flicker
    // bug: a fast scroll jumped to a cold frame and the <img> blitted empty/black until decode).
    var cache = new Array(N);
    function preload(i) {
      if (cache[i]) return cache[i];
      var im = new Image();
      im.decoding = 'async';
      im.decoded = false;
      im.src = urls[i];
      var done = function () { im.decoded = true; };
      if (im.decode) im.decode().then(done)['catch'](function () { /* fall back to onload */ });
      im.addEventListener('load', done);
      cache[i] = im;
      return im;
    }
    // first frame eager (it is the painted surface the probe asserts) — into the front buffer
    var first = preload(0);
    img.src = urls[0];

    // up-front decode pass (the doc's promise): warm every frame off-DOM, low-priority,
    // so after the brief warm-up a fast scroll always lands on a decoded frame.
    for (var pi = 1; pi < N; pi++) preload(pi);

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function decodedAt(i) { return cache[i] && cache[i].decoded; }

    // PURE: map progress -> frame index (with an END hold on the last frame), swap src.
    var rafPending = false, pendingP = 0;
    function showIdx(idx) {
      if (idx === lastIdx) return;
      lastIdx = idx;
      // single-buffer swap to an ALREADY-DECODED source (the decode-guard in applyNow ensures
      // we only reach here for decoded frames -> no black gap). One <img>.src swap; the
      // compositor re-uploads a same-size already-decoded webp. (A double <img> buffer was
      // measured WORSE — two DOM decodes; ImageBitmap+canvas would be fastest but drawImage is banned.)
      img.src = urls[idx];
    }
    function applyNow(p) {
      p = clamp01(p);
      // remap so the last `hold` of the scroll sits on the final frame (a held climax)
      var t = opt.hold > 0 ? clamp01(p / (1 - opt.hold)) : p;
      var idx = Math.round(t * (N - 1));
      if (idx === lastIdx) return;
      var im = cache[idx] || preload(idx);
      if (decodedAt(idx)) {
        // GUARD: only swap to an already-decoded frame -> same-size GPU blit, never a black gap
        showIdx(idx);
      } else {
        // cold frame: keep the current frame on screen (no flicker) and swap the instant it
        // decodes — but only if it is STILL the latest requested index (avoids a stale catch-up).
        var want = idx;
        var swapWhenReady = function () { if (Math.round(clamp01(pendingP) / (opt.hold > 0 ? (1 - opt.hold) : 1) * (N - 1)) === want) showIdx(want); };
        if (im.decode) im.decode().then(swapWhenReady)['catch'](function () { showIdx(want); });
        else im.addEventListener('load', swapWhenReady);
      }
      // warm a small window of neighbours so a fast scroll keeps finding decoded frames
      for (var d = 1; d <= 3; d++) { if (idx + d < N) preload(idx + d); if (idx - d >= 0) preload(idx - d); }
    }
    // rAF throttle: collapse a burst of scroll deltas to one DOM touch per frame
    function set(p) {
      pendingP = p;
      if (rafPending) return;
      rafPending = true;
      global.requestAnimationFrame(function () { rafPending = false; applyNow(pendingP); });
    }

    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    // a ready promise that resolves once the first frame has decoded (probe-friendly)
    var ready = (first.decode ? first.decode() : Promise.resolve())['catch'](function () {})
      .then(function () { stage.classList.add('fsi-ready'); });

    // STATIC PATH, show the final (arrived) frame, no pin, no scrub.
    if (reduced || narrow || !gsap || !ScrollTrigger) {
      lastIdx = -1; applyNow(1);
      stage.classList.add('fsi-static');
      ready.then(function () { try { global.__LAB_OK__ = true; } catch (e) {} });
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { static: true, set: applyNow, ready: ready, frames: N, destroy: function () {} };
    }

    gsap.registerPlugin(ScrollTrigger);
    gsap.ticker.lagSmoothing(0);
    var lenis = null;
    if (opt.manageLenis && Lenis) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      global.__lenis = lenis;
    }

    var onUpdateExternal = null;
    var trigger = ScrollTrigger.create({
      trigger: stage, start: 'top top',
      end: function () { return '+=' + Math.round(global.innerHeight * opt.pinFactor); },
      pin: true, pinSpacing: true, anticipatePin: 1, scrub: true,
      onUpdate: function (self) { set(self.progress); if (onUpdateExternal) onUpdateExternal(self.progress, self); }
    });
    applyNow(0);

    global.addEventListener('resize', function () { ScrollTrigger.refresh(); });
    ready.then(function () { try { global.__LAB_OK__ = true; } catch (e) {} });

    var api = {
      trigger: trigger, lenis: lenis, set: set, ready: ready, frames: N,
      // let a combo couple captions to the SAME pin without creating a second one
      onUpdate: function (fn) { onUpdateExternal = fn; },
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
    return api;
  }

  var api = { create: create };
  global.FrameScrubImg = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
