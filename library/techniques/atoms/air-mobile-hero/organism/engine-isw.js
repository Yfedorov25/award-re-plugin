/* ============================================================
   IMAGE-SLIDER-WIPE · component.js — VERBATIM law copy from
   air-isw-fullbleed-pin. CD-RUN scroll-pin deltas marked [CD]/[M9].
   Loaded as an external <script> so the browser parses it natively.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  var FULL = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
  var TOP_LINE = 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)';
  var BOTTOM_LINE = 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)';

  function toEl(x) { return typeof x === 'string' ? doc.querySelector(x) : x; }
  function all(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  function create(section, options) {
    options = options || {};
    var root = toEl(section);
    if (!root) return { error: 'no section' };
    var layer = root.querySelector('[data-isw-layer]');
    var stage = root.querySelector('[data-isw-stage]');
    var slides = all(root, '[data-isw-slide]');
    if (!layer || !stage || slides.length < 2)
      return { error: 'need [data-isw-layer], [data-isw-stage], >=2 [data-isw-slide]' };

    var texts = all(root, '[data-isw-text]');
    var extras = all(root, '[data-isw-extra]');
    var counter = root.querySelector('[data-isw-count]');
    var total = root.querySelector('[data-isw-total]');
    var ticksBox = root.querySelector('[data-isw-ticks]');
    var btnPrev = root.querySelector('[data-isw-prev]');
    var btnNext = root.querySelector('[data-isw-next]');

    var N = slides.length;
    var opt = {
      stepSvh: options.stepSvh != null ? options.stepSvh : 85,
      wipeMs: options.wipeMs != null ? options.wipeMs : 1000,
      wipeEase: options.wipeEase || 'ease-out',
      textDelayMs: options.textDelayMs != null ? options.textDelayMs : 250,
      lineStaggerMs: options.lineStaggerMs != null ? options.lineStaggerMs : 60,
      blurPx: options.blurPx != null ? options.blurPx : 10,
      driftPct: options.driftPct != null ? options.driftPct : 16.666,
      mobile: options.mobile || 'tap',
      touchMq: options.touchMq || '(pointer: coarse), (max-width: 768px)'
    };
    var reduced = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var touch = global.matchMedia && global.matchMedia(opt.touchMq).matches;
    var tapMode = touch && opt.mobile === 'tap';   /* [CD] scroll-pin -> tapMode=false -> PIN branch */

    var gate = { swaps: 0, lastDir: 0, renders: 0, mode: tapMode ? 'tap' : 'pin' };
    var idx = 0;
    var anims = [];

    if (total) total.textContent = '/ ' + N;
    if (counter) counter.textContent = '1';

    var tickFills = [];
    if (ticksBox) {
      ticksBox.innerHTML = '';
      for (var i = 0; i < N; i++) {
        var item = doc.createElement('div');
        item.className = 'isw-tick';
        var fill = doc.createElement('div');
        fill.className = 'isw-tick-fill';
        fill.style.transform = 'translateX(-100%)';
        item.appendChild(fill);
        ticksBox.appendChild(item);
        tickFills.push(fill);
      }
    }

    slides.forEach(function (s, i) { if (i) s.classList.add('is-off'); });
    texts.forEach(function (t, i) { if (i) t.classList.add('is-off'); });
    extras.forEach(function (x, i) { if (i) x.classList.add('is-off'); });

    function killAnims() {
      anims.forEach(function (a) { try { a.cancel(); } catch (e) {} });
      anims = [];
      slides.forEach(function (s) { s.style.willChange = ''; });   /* [M9] drop will-change after swap */
    }

    function goTo(next, dir) {
      next = Math.max(0, Math.min(N - 1, next));
      if (next === idx) return;
      dir = dir || (next > idx ? 1 : -1);
      var cur = idx;
      idx = next;
      gate.swaps++; gate.lastDir = dir;
      if (counter) counter.textContent = String(next + 1);   /* M6 counter swaps at START */
      root.style.setProperty('--isw-index', String(next));
      updateNav();

      killAnims();
      var oldS = slides[cur], newS = slides[next];
      var oldT = texts[cur], newT = texts[next];
      var oldX = extras[cur], newX = extras[next];
      newS.classList.remove('is-off');
      oldS.style.willChange = 'transform';   /* [M9] only during active swap */
      newS.style.willChange = 'transform';

      if (reduced || !newS.animate) {
        slides.forEach(function (s, i) {
          s.classList.toggle('is-off', i !== next);
          s.style.clipPath = '';
        });
        texts.forEach(function (t, i) { t.classList.toggle('is-off', i !== next); });
        extras.forEach(function (x, i) { x.classList.toggle('is-off', i !== next); });
        return;
      }

      var outClip = dir > 0 ? [FULL, TOP_LINE] : [FULL, BOTTOM_LINE];
      var inClip = dir > 0 ? [BOTTOM_LINE, FULL] : [TOP_LINE, FULL];
      var tOut = oldS.animate({ clipPath: outClip },
        { duration: opt.wipeMs, easing: opt.wipeEase, fill: 'both' });
      tOut.onfinish = function () { oldS.classList.add('is-off'); oldS.style.clipPath = ''; oldS.style.willChange = ''; tOut.cancel(); };
      var tIn = newS.animate({ clipPath: inClip },
        { duration: opt.wipeMs, easing: opt.wipeEase, fill: 'both' });
      tIn.onfinish = function () { newS.style.clipPath = ''; newS.style.willChange = ''; tIn.cancel(); };
      anims.push(tOut, tIn);

      if (oldT && newT) {
        var b = opt.blurPx;
        var aOut = oldT.animate(
          { filter: ['blur(0px)', 'blur(' + b + 'px)'], opacity: [1, 0] },
          { duration: opt.wipeMs, easing: 'ease-out', fill: 'both' });
        aOut.onfinish = function () { oldT.classList.add('is-off'); aOut.cancel(); };
        anims.push(aOut);
        newT.classList.remove('is-off');
        var aIn = newT.animate(
          { filter: ['blur(' + b + 'px)', 'blur(0px)'], opacity: [0, 1] },
          { duration: opt.wipeMs, easing: 'ease-out', fill: 'both',
            delay: opt.textDelayMs });
        aIn.onfinish = function () { aIn.cancel(); };
        anims.push(aIn);
      }

      if (oldX && newX && oldX !== newX) {
        var fOut = oldX.animate({ opacity: [1, 0] },
          { duration: 400, easing: 'ease-out', fill: 'both' });
        fOut.onfinish = function () { oldX.classList.add('is-off'); fOut.cancel(); };
        newX.classList.remove('is-off');
        var fIn = newX.animate({ opacity: [0, 1] },
          { duration: 400, easing: 'ease-out', fill: 'both', delay: opt.textDelayMs });
        fIn.onfinish = function () { fIn.cancel(); };
        anims.push(fOut, fIn);
      }
    }

    function updateNav() {
      if (btnPrev) btnPrev.classList.toggle('is-disabled', idx === 0);
      if (btnNext) btnNext.classList.toggle('is-disabled', idx === N - 1);
    }

    /* ================= TAP MODE (kept verbatim; unused when mobile:'scroll-pin') ================= */
    if (tapMode) {
      root.classList.add('isw-mode-tap');
      stage.classList.add('isw-strip');
      slides.forEach(function (s) { s.classList.remove('is-off'); });
      updateNav();

      function targetFor(i) {
        var sr = stage.getBoundingClientRect();
        var r = slides[i].getBoundingClientRect();
        var t = stage.scrollLeft + (r.left - sr.left) -
                (stage.clientWidth - r.width) / 2;
        return Math.max(0, Math.min(stage.scrollWidth - stage.clientWidth, t));
      }
      function nearestIdx() {
        var best = 0, bestD = Infinity;
        for (var i = 0; i < N; i++) {
          var d = Math.abs(targetFor(i) - stage.scrollLeft);
          if (d < bestD) { bestD = d; best = i; }
        }
        return best;
      }
      function tap(dir) {
        var next = Math.max(0, Math.min(N - 1, idx + dir));
        if (next === idx) return;
        idx = next;
        gate.swaps++; gate.lastDir = dir;
        if (counter) counter.textContent = String(next + 1);
        updateNav();
        slides[next].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth',
                                      block: 'nearest', inline: 'center' });
      }
      function onPrev(ev) { ev.preventDefault(); tap(-1); }
      function onNext(ev) { ev.preventDefault(); tap(1); }
      if (btnPrev) btnPrev.addEventListener('click', onPrev);
      if (btnNext) btnNext.addEventListener('click', onNext);

      var tick2 = false;
      function onStrip() {
        if (tick2) return;
        tick2 = true;
        requestAnimationFrame(function () {
          tick2 = false;
          var near = nearestIdx();
          if (near !== idx) {
            idx = near;
            if (counter) counter.textContent = String(near + 1);
            updateNav();
          }
          if (tickFills.length) {
            var max = stage.scrollWidth - stage.clientWidth;
            var p = max > 0 ? clamp01(stage.scrollLeft / max) : 0;
            for (var i = 0; i < N; i++)
              tickFills[i].style.transform =
                'translateX(' + (-100 * (1 - clamp01(p * N - i))) + '%)';
          }
        });
      }
      stage.addEventListener('scroll', onStrip, { passive: true });
      onStrip();

      return {
        mode: 'tap', index: function () { return idx; },
        goTo: function (i) { tap(i - idx); },
        targetFor: targetFor, gate: gate,
        destroy: function () {
          if (btnPrev) btnPrev.removeEventListener('click', onPrev);
          if (btnNext) btnNext.removeEventListener('click', onNext);
          stage.removeEventListener('scroll', onStrip);
          root.classList.remove('isw-mode-tap');
          stage.classList.remove('isw-strip');
          killAnims();
        }
      };
    }

    /* ================= PIN MODE ================= */
    root.classList.add('isw-mode-pin');
    root.style.minHeight = 'calc(100svh + ' + (N - 1) * opt.stepSvh + 'svh)';   /* M1 */

    var driftImgs = opt.driftPct > 0 && !touch && !reduced
      ? slides.map(function (s) { return s.querySelector('img, .isw-fill'); })
      : [];
    if (driftImgs.length && driftImgs.every(Boolean)) root.classList.add('isw-drift');
    else driftImgs = [];
    function renderDrift() {
      if (!driftImgs.length) return;
      var r = root.getBoundingClientRect();
      var vh = global.innerHeight;
      var entry = clamp01((vh - r.top) / vh);
      var span = Math.max(1, r.height - vh);
      var sp = clamp01(-r.top / span);
      var exit = clamp01((sp - 0.8) / 0.2);
      var ty = Math.max(-opt.driftPct,
                        -opt.driftPct * ((1 - entry) + exit));
      gate.driftTy = Math.round(ty * 100) / 100;
      for (var i = 0; i < driftImgs.length; i++)
        driftImgs[i].style.transform = 'translateY(' + ty + '%)';
    }

    function progress() {   /* M2 */
      var r = root.getBoundingClientRect();
      var span = r.height - global.innerHeight;
      return span > 0 ? clamp01(-r.top / span) : 0;
    }

    var lastQ = -1;
    function render(p) {   /* M3 index-law + M7 ticks scrub */
      p = clamp01(p);
      var q = Math.round(p * 1000);
      if (q === lastQ) return;
      lastQ = q;
      gate.renders++;
      var want = Math.min(Math.floor(p * N), N - 1);
      if (want !== idx) {
        var boundary = (want > idx ? idx + 1 : idx) / N;
        if (Math.abs(p - boundary) > 0.015) goTo(want, want > idx ? 1 : -1);
      }
      for (var i = 0; i < tickFills.length; i++)
        tickFills[i].style.transform =
          'translateX(' + (-100 * (1 - clamp01(p * N - i))) + '%)';
    }

    var ticking = false;
    function onScroll() {   /* rAF on native scroll — NO Lenis */
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        render(progress());
        renderDrift();
      });
    }
    global.addEventListener('scroll', onScroll, { passive: true });
    render(progress());
    renderDrift();

    global.__ISW_OK__ = true;   /* [CD] air-atom-gate hook */

    return {
      mode: 'pin', render: render, progress: progress,
      index: function () { return idx; }, goTo: goTo, gate: gate,
      destroy: function () {
        global.removeEventListener('scroll', onScroll);
        killAnims();
        root.classList.remove('isw-mode-pin');
        root.style.minHeight = '';
      }
    };
  }

  global.ImageSliderWipe = { create: create };
}(window));
