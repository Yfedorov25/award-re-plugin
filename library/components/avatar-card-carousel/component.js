/* ============================================================
   AVATAR-CARD-CAROUSEL · component.js  (vanilla, transform-driven)
   ------------------------------------------------------------
   gapsystudio's team carousel — a row of PORTRAIT cards (people / avatars), SEVERAL
   visible at once, that translateX one card at a time. Under each card: a NAME + ROLE
   caption. Below the row: a horizontal PROGRESS-LINE whose filled segment tracks the
   scroll position, flanked by <- -> arrows. Driven by arrows, drag, wheel, keyboard.
   Harvested from D_gapsy (C /about — Albina/Katya/Olena "UI/UX Designer" + a progress line).

   Distinct from horizontal-spec-carousel (ONE landscape card in focus + edge-peek +
   vertical-pill arrow + per-card CTA + a spec-row that swaps): here MANY portrait cards
   show at once, the caption is name+role UNDER the card, and the nav is a PROGRESS-LINE
   with end arrows (no edge-peek, no spec-row, no per-card CTA).

   THE MOVE: track translateX(-index * step)px, step = card width + gap; `perView` cards
   visible; the active card may lift (scale). The progress-line fill width = index /
   (count - perView). ease ~cubic-bezier(.22,1,.36,1) ~520ms.

   CONFIG-DRIVEN:
     AvatarCardCarousel.create(target, {     // target = .acc-stage
       perView: 3,            // cards visible at once (responsive: clamp to fit)
       duration: 520, ease: 'cubic-bezier(.22,1,.36,1)',
       wheel: true, drag: true, index: 0
     })
   Markup: .acc-stage > .acc-viewport > .acc-track > .acc-card(.acc-media img + .acc-name +
   .acc-role) ; + .acc-prev / .acc-next ; + .acc-progress(.acc-progress-fill).
   Returns { go(i), next(), prev(), index(), count, destroy }.

   ENGINE LAWS: transform: translateX (track) + scaleX (progress fill) + scale (active card)
   + opacity only; GPU; NO mix-blend / NO backdrop over the cards; NO WebGL; reduced-motion
   -> instant index. Drag move/up on WINDOW (F-08). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      perView: options.perView != null ? options.perView : 3,
      duration: options.duration != null ? options.duration : 520,
      ease: options.ease || 'cubic-bezier(.22,1,.36,1)',
      wheel: options.wheel !== false,
      drag: options.drag !== false,
      index: options.index || 0
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var viewport = stage.querySelector('.acc-viewport');
    var track = stage.querySelector('.acc-track');
    var cards = [].slice.call(stage.querySelectorAll('.acc-card'));
    var prevBtn = stage.querySelector('.acc-prev');
    var nextBtn = stage.querySelector('.acc-next');
    var fill = stage.querySelector('.acc-progress-fill');
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!track || !cards.length) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no track' }; }

    var n = cards.length;
    stage.style.setProperty('--acc-per', String(opt.perView));
    var maxIdx = Math.max(0, n - opt.perView);
    var idx = Math.max(0, Math.min(maxIdx, opt.index));

    function step() {
      var cw = cards[0].getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '0') || 0;
      return cw + gap;
    }
    function paint() {
      cards.forEach(function (c, i) { c.classList.toggle('is-active', i >= idx && i < idx + opt.perView); });
      if (fill) fill.style.transform = 'scaleX(' + (maxIdx ? (idx / maxIdx) : 1).toFixed(3) + ')';
      if (prevBtn) prevBtn.disabled = idx === 0;
      if (nextBtn) nextBtn.disabled = idx === maxIdx;
    }
    function layout(animate) {
      track.style.transition = animate && !reduced ? ('transform ' + opt.duration + 'ms ' + opt.ease) : 'none';
      track.style.transform = 'translateX(' + (-idx * step()) + 'px)';
    }
    function go(i, animate) {
      idx = Math.max(0, Math.min(maxIdx, i));
      layout(animate !== false); paint();
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

    if (opt.wheel && viewport) {
      var wlock = false;
      viewport.addEventListener('wheel', function (e) {
        var dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
        if (!dx) return; e.preventDefault();
        if (wlock) return; wlock = true; setTimeout(function () { wlock = false; }, opt.duration);
        dx > 0 ? next() : prev();
      }, { passive: false });
    }

    // drag (window pointer, F-08)
    var drag = null;
    function dragMove(e) {
      if (!drag) return;
      drag.dx = e.clientX - drag.x; if (Math.abs(drag.dx) > 4) drag.moved = true;
      track.style.transform = 'translateX(' + (drag.base + drag.dx) + 'px)';
    }
    function dragEnd() {
      if (!drag) return;
      var dx = drag.dx, moved = drag.moved; drag = null;
      global.removeEventListener('pointermove', dragMove);
      global.removeEventListener('pointerup', dragEnd);
      global.removeEventListener('pointercancel', dragEnd);
      var thresh = Math.max(40, step() * 0.18);
      if (!moved) { layout(true); return; }
      if (dx <= -thresh) next(); else if (dx >= thresh) prev(); else go(idx);
    }
    if (opt.drag && viewport) {
      viewport.addEventListener('pointerdown', function (e) {
        if (e.button != null && e.button !== 0) return;
        drag = { x: e.clientX, base: -idx * step(), dx: 0, moved: false };
        track.style.transition = 'none';
        global.addEventListener('pointermove', dragMove);
        global.addEventListener('pointerup', dragEnd);
        global.addEventListener('pointercancel', dragEnd);
      });
      viewport.addEventListener('dragstart', function (e) { e.preventDefault(); });
    }

    go(idx, false);
    global.addEventListener('resize', function () { layout(false); });
    stage.classList.add('acc-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      go: go, next: next, prev: prev, index: function () { return idx; }, count: n,
      destroy: function () {
        if (nextBtn) nextBtn.removeEventListener('click', next);
        if (prevBtn) prevBtn.removeEventListener('click', prev);
        global.removeEventListener('pointermove', dragMove);
        global.removeEventListener('pointerup', dragEnd);
        global.removeEventListener('pointercancel', dragEnd);
      }
    };
  }

  var api = { create: create };
  global.AvatarCardCarousel = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
