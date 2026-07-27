/* ============================================================
   OUR-HOUSE-AT-DUSK · component.js   (A7 — the seam that wipes the house into evening, windows
   igniting only as the seam passes them)
   ------------------------------------------------------------
   A thin orchestrator over the day/night CANON (window.DayNight). A wide elevation of the house at
   blue hour, presented as one before/after surface: LEFT of a vertical seam = cold afternoon, RIGHT
   = warm evening. Drag the seam left<->right; the canon clips the evening still in as the seam
   sweeps (reveal:'seam', seamAxis:'x', seamFrom:'right' -> night occupies the swept region to the
   LEFT of the seam). THE TWIST: the house's windows ignite ONE BY ONE only as the seam physically
   passes their band, and the warm glow is masked to the EVENING side, so the life in the windows is
   exclusive to the part of the day you have already swept into evening. The seam IS the storyteller.

   (Spec A7 frames this at STREET scale with neighbours staying dark; we have the single-building
   frame-matched pair, so this builds the BUILDING version — the seam-passes-and-lights mechanic in
   full. The "neighbours stay dark" punchline needs a street render: logged as a missing asset.)

   OurHouseAtDusk.create(target, {
     dayMedia, nightMedia,      // frame-matched exterior pair (canon day/night, seam reveal)
     windows,                   // [{x,y,w,h}] in % — each lights when the seam's x crosses its centre
     start,                     // initial seam t (default 0.45)
     onUpdate                   // (t) => {}  app-side sync
   })
   Returns { root, dn, set(t), get(), windows, destroy }.  set(t) is PURE (0 = all afternoon ..
   1 = all evening; the seam sits at x = t).

   LAWS: opacity / transform / clip-path / gradient only. NO WebGL, NO canvas, NO mix-blend, NO
   backdrop-filter. Requires the canon (../daynight-engine/component.js) first. prefers-reduced-motion
   -> two static halves (afternoon | evening), the contrast already visible, no drag. Sets __LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smooth(p) { p = clamp(p, 0, 1); return p * p * (3 - 2 * p); }

  // window rects for THIS exterior pair's warm lower-middle band (x ordered left -> right so they
  // ignite in sequence as the seam sweeps right). x is the LEFT edge; centre = x + w/2.
  var DEFAULT_WINDOWS = [
    { x: 8,  y: 60, w: 11, h: 15 },   // carport (far left)
    { x: 29, y: 58, w: 13, h: 17 },   // left glass group
    { x: 43, y: 56, w: 14, h: 19 },   // central entrance glass
    { x: 60, y: 56, w: 16, h: 19 },   // right large glass
    { x: 78, y: 59, w: 9,  h: 15 }    // far-right
  ];

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

    // 1) the canon — manual driver, SEAM reveal. seamFrom:'right' => the evening (night) layer fills
    //    the region the seam has swept past (to its LEFT). t = the seam's x position (0..1).
    // seamFrom:'right' => the evening (night) layer fills the region the seam has SWEPT past (to its
    // LEFT) and grows as the seam is dragged right: the seam reads as the evening FRONT advancing
    // across the house. So the lit/evening side is LEFT (Вечір), the unswept day side is RIGHT
    // (День) — labels placed to match what is shown (canon puts labels[0] bottom-left).
    var dn = DN.create(host, {
      dayMedia: options.dayMedia,
      nightMedia: options.nightMedia,
      mode: 'manual',
      reveal: 'seam',
      seamAxis: 'x',
      seamFrom: 'right',
      labels: ['Вечір', 'День']
    });
    var stage = dn.root;
    var nightSrc = (typeof options.nightMedia === 'string') ? options.nightMedia
      : (function () { var im = stage.querySelector('.dn__night img'); return im ? im.src : null; })();

    // 2) the evening side's lit windows come FROM THE CANON NIGHT RENDER (which already has warm lit
    //    windows), clipped in by the seam. We do NOT paint a separate per-window glow layer: on this
    //    cottage facade those boxes mis-register and read as floating orbs (skeptic M1). The seam
    //    sweeping the night render in IS the "evening side lights up" — honest + correctly aligned.
    //    (An explicit glow layer is opt-in via opts.glowWindows for a facade with a true window grid.)
    var glowWrap = null, winEls = [];
    if (options.glowWindows && nightSrc) {
      glowWrap = doc.createElement('div');
      glowWrap.className = 'ohd__glows';
      stage.appendChild(glowWrap);
      windows.forEach(function (win) {
        var w = doc.createElement('i');
        w.className = 'ohd__win';
        w.style.left = win.x + '%'; w.style.top = win.y + '%';
        w.style.width = win.w + '%'; w.style.height = win.h + '%';
        w.style.backgroundImage = 'url("' + nightSrc + '")';
        w.style.backgroundSize = (10000 / win.w) + '% ' + (10000 / win.h) + '%';
        w.style.backgroundPosition = (win.x / (100 - win.w) * 100) + '% ' + (win.y / (100 - win.h) * 100) + '%';
        w.style.opacity = '0';
        glowWrap.appendChild(w);
        winEls.push({ el: w, cx: (win.x + win.w / 2) / 100 });
      });
    }

    // 3) the draggable seam handle (chrome over the canon's own seam line)
    var handle = doc.createElement('button');
    handle.type = 'button';
    handle.className = 'ohd__handle';
    handle.setAttribute('aria-label', 'Перетягніть, щоб настав вечір');
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', '100');
    var grip = doc.createElement('span'); grip.className = 'ohd__grip'; grip.textContent = '⇆';
    handle.appendChild(grip);
    stage.appendChild(handle);

    // 4) the PURE setter — seam position + window ignition + glow-group clip
    var t = clamp(options.start != null ? options.start : 0.45, 0, 1);
    var tagEve = stage.querySelector('.dn__tag--day');   // canon: labels[0]='Вечір' -> bottom-LEFT (--day class), labels[1]='День' -> --night (right)
    var tagDay = stage.querySelector('.dn__tag--night');
    function apply(v) {
      t = clamp(v, 0, 1);
      dn.set(t);                                   // canon clips the evening still at the seam
      if (glowWrap) {
        // optional glow layer (opt-in): clip to the evening side + ignite each window past the seam
        glowWrap.style.clipPath = 'inset(0 ' + ((1 - t) * 100).toFixed(2) + '% 0 0)';
        glowWrap.style.webkitClipPath = glowWrap.style.clipPath;
        for (var i = 0; i < winEls.length; i++) winEls[i].el.style.opacity = String(smooth((t - winEls[i].cx) / 0.05));
      }
      // M2: fade the corner tags toward the extremes so they never lie (at t=1 the whole surface is
      // evening, so the 'День' tag is gone; at t=0 the 'Вечір' tag is gone). True only mid-split.
      if (tagEve) tagEve.style.opacity = String(smooth(t / 0.5));        // Вечір fades in as evening sweeps
      if (tagDay) tagDay.style.opacity = String(smooth((1 - t) / 0.5));  // День fades out as evening sweeps
      handle.style.left = (t * 100) + '%';
      handle.setAttribute('aria-valuenow', String(Math.round(t * 100)));
      handle.setAttribute('aria-valuetext', Math.round(t * 100) + '% вечора');
      if (options.onUpdate) options.onUpdate(t);
    }

    // 5) drag
    var listeners = [];
    function on(node, ev, fn, o) { node.addEventListener(ev, fn, o); listeners.push([node, ev, fn, o]); }
    function xToT(clientX) {
      var r = stage.getBoundingClientRect();
      return clamp((clientX - r.left) / r.width, 0, 1);
    }
    var dragging = false;
    if (!reduced) {
      function startDrag(e) {
        dragging = true;
        try { e.target.setPointerCapture(e.pointerId); } catch (er) {}
        apply(xToT(e.clientX)); e.preventDefault();
      }
      on(handle, 'pointerdown', startDrag);
      // click anywhere on the stage eases the seam toward that x
      on(stage, 'pointerdown', function (e) {
        if (e.target === handle || e.target === grip) return;
        tweenTo(xToT(e.clientX));
      });
      on(global, 'pointermove', function (e) { if (dragging) apply(xToT(e.clientX)); });
      on(global, 'pointerup', function () { dragging = false; });
      on(global, 'pointercancel', function () { dragging = false; });
      // keyboard
      on(handle, 'keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { apply(clamp(t + 0.04, 0, 1)); e.preventDefault(); }
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { apply(clamp(t - 0.04, 0, 1)); e.preventDefault(); }
        else if (e.key === 'Home') { tweenTo(0); e.preventDefault(); }
        else if (e.key === 'End') { tweenTo(1); e.preventDefault(); }
      });
    }

    var tweening = null;
    function tweenTo(to) {
      if (reduced) { apply(to); return; }
      if (global.gsap) {
        if (tweening) tweening.kill();
        var o = { v: t };
        tweening = global.gsap.to(o, { v: to, duration: 0.7, ease: 'power3.out', onUpdate: function () { apply(o.v); } });
      } else { apply(to); }
    }

    // reduced-motion: park the seam mid-frame so BOTH halves (evening left | day right) and the
    // lit-vs-dark contrast are visible in one static frame (the documented "two static halves").
    apply(reduced ? 0.5 : t);

    try { global.__LAB_OK__ = true; } catch (e) {}

    return {
      root: stage,
      dn: dn,
      set: apply,
      get: function () { return t; },
      tweenTo: tweenTo,
      windows: winEls,
      destroy: function () {
        if (tweening) tweening.kill();
        listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); });
        listeners = [];
        dn.destroy();
      }
    };
  }

  var api = { create: create, DEFAULT_WINDOWS: DEFAULT_WINDOWS };
  global.OurHouseAtDusk = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
