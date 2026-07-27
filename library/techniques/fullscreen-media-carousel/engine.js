/* ============================================================
   FULLSCREEN-MEDIA-CAROUSEL · engine.js  (proven core, copied from
   library/components/fullscreen-media-carousel/component.js — vanilla, transform-driven)
   ------------------------------------------------------------
   crownd/finest's interior gallery — a FULL-BLEED carousel where each slide fills the whole
   viewport EDGE-TO-EDGE (no card chrome, no peek), swiping one full width at a time via ‹ ›
   arrows / drag / wheel / keyboard. Slides can be IMAGES or VIDEO; a video slide plays only
   while active AND on-screen (pauses otherwise). Harvested from D_finest (F2: bedroom ->
   living -> bath -> pool, each filling the screen; some slides are video — "several photos,
   scroll/swipe, one fills the screen, with video").

   Distinct from horizontal-spec-carousel (ONE framed landscape card + edge-peek + per-card
   CTA + a swapping spec-row) and avatar-card-carousel (MANY portrait cards + name/role +
   progress-line): this is ONE FULL-VIEWPORT media slide at a time, no chrome around it.

   THE MOVE: the track translateX(-index * 100%); each slide is 100% wide. Arrows/drag/wheel/
   keys step by one. ease ~cubic-bezier(.22,1,.36,1). Optional counter "02 / 05". Video play/
   pause gated by active + IntersectionObserver. Drag uses the window-pointer F-08 law.

   CONFIG-DRIVEN:
     FullscreenMediaCarousel.create(target, {     // target = .fmc-stage
       duration: 700, ease: 'cubic-bezier(.22,1,.36,1)',
       loop: false, drag: true, wheel: false, index: 0
     })
   Markup: .fmc-stage > .fmc-track > .fmc-slide (each: img | video) x N ; + .fmc-prev /
   .fmc-next ; + optional .fmc-counter(.fmc-cur / .fmc-total). Returns { go, next, prev,
   index, count, destroy }.

   ENGINE LAWS: transform: translateX (track) only; GPU; NO mix-blend over the media; NO
   WebGL; videos muted+loop+playsinline, play only when active+on-screen; reduced-motion ->
   instant index. Sets window.__LAB_OK__.

   TECHNIQUE NOTE: this engine is imperative (go/next/prev), interaction-driven (arrows/drag/
   keys) — NOT scroll-scrub. It has NO narrow-guard that kills motion on phone width, so per
   FORMAT.md NO forceMotion patch is needed — go() works identically on any width. The dual
   wrapper (component.js) only chooses the INPUT surface: desktop arrows/keys, mobile swipe.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      duration: options.duration != null ? options.duration : 700,
      ease: options.ease || 'cubic-bezier(.22,1,.36,1)',
      loop: !!options.loop,
      drag: options.drag !== false,
      wheel: !!options.wheel,
      index: options.index || 0
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var track = stage.querySelector('.fmc-track');
    var slides = [].slice.call(stage.querySelectorAll('.fmc-slide'));
    var prevBtn = stage.querySelector('.fmc-prev');
    var nextBtn = stage.querySelector('.fmc-next');
    var curEl = stage.querySelector('.fmc-cur');
    var totEl = stage.querySelector('.fmc-total');
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!track || !slides.length) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no track' }; }

    var n = slides.length, idx = Math.max(0, Math.min(n - 1, opt.index));
    if (totEl) totEl.textContent = ('0' + n).slice(-2);

    // prep videos
    slides.forEach(function (s) {
      var v = s.querySelector('video');
      if (v) { v.muted = true; v.loop = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'metadata'; }
    });

    function syncVideo() {
      slides.forEach(function (s, k) {
        var v = s.querySelector('video'); if (!v) return;
        if (k === idx && !reduced && onScreen) { try { var p = v.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
        else { try { v.pause(); } catch (e) {} }
      });
    }
    function paint() {
      if (curEl) curEl.textContent = ('0' + (idx + 1)).slice(-2);
      slides.forEach(function (s, k) { s.classList.toggle('is-active', k === idx); });
      if (!opt.loop) { if (prevBtn) prevBtn.disabled = idx === 0; if (nextBtn) nextBtn.disabled = idx === n - 1; }
      syncVideo();
    }
    function layout(animate) {
      track.style.transition = animate && !reduced ? ('transform ' + opt.duration + 'ms ' + opt.ease) : 'none';
      track.style.transform = 'translateX(' + (-idx * 100) + '%)';
    }
    function go(i, animate) {
      if (opt.loop) i = (i + n) % n; else i = Math.max(0, Math.min(n - 1, i));
      idx = i; layout(animate !== false); paint();
    }
    function next() { go(idx + 1); }
    function prev() { go(idx - 1); }

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);
    stage.setAttribute('tabindex', stage.getAttribute('tabindex') || '0');
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    });

    if (opt.wheel) {
      var wlock = false;
      stage.addEventListener('wheel', function (e) {
        var dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
        if (!dx) return; e.preventDefault();
        if (wlock) return; wlock = true; setTimeout(function () { wlock = false; }, opt.duration);
        dx > 0 ? next() : prev();
      }, { passive: false });
    }

    // drag / swipe (window pointer, F-08)
    var drag = null, vw = function () { return stage.getBoundingClientRect().width || 1; };
    function dragMove(e) {
      if (!drag) return;
      drag.dx = e.clientX - drag.x; if (Math.abs(drag.dx) > 4) drag.moved = true;
      track.style.transform = 'translateX(calc(' + (-idx * 100) + '% + ' + drag.dx.toFixed(0) + 'px))';
    }
    function dragEnd() {
      if (!drag) return;
      var dx = drag.dx, moved = drag.moved; drag = null;
      global.removeEventListener('pointermove', dragMove);
      global.removeEventListener('pointerup', dragEnd);
      global.removeEventListener('pointercancel', dragEnd);
      var thresh = Math.max(60, vw() * 0.12);
      if (!moved) { layout(true); return; }
      if (dx <= -thresh) next(); else if (dx >= thresh) prev(); else go(idx);
    }
    if (opt.drag) {
      stage.addEventListener('pointerdown', function (e) {
        if (e.button != null && e.button !== 0) return;
        if (e.target.closest && e.target.closest('.fmc-prev,.fmc-next')) return;
        drag = { x: e.clientX, dx: 0, moved: false };
        track.style.transition = 'none';
        global.addEventListener('pointermove', dragMove);
        global.addEventListener('pointerup', dragEnd);
        global.addEventListener('pointercancel', dragEnd);
      });
      stage.addEventListener('dragstart', function (e) { e.preventDefault(); });
    }

    // pause videos off-screen
    var onScreen = true, io = null;
    if (global.IntersectionObserver) {
      io = new global.IntersectionObserver(function (ents) { onScreen = ents[0].isIntersecting; syncVideo(); }, { threshold: 0.2 });
      io.observe(stage);
    }

    go(idx, false);
    global.addEventListener('resize', function () { layout(false); });
    stage.classList.add('fmc-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      go: go, next: next, prev: prev, index: function () { return idx; }, count: n,
      destroy: function () {
        if (nextBtn) nextBtn.removeEventListener('click', next);
        if (prevBtn) prevBtn.removeEventListener('click', prev);
        global.removeEventListener('pointermove', dragMove);
        global.removeEventListener('pointerup', dragEnd);
        global.removeEventListener('pointercancel', dragEnd);
        if (io) io.disconnect();
      }
    };
  }

  var api = { create: create };
  global.FullscreenMediaCarousel = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
