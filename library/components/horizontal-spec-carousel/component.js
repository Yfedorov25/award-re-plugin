/* ============================================================
   HORIZONTAL-SPEC-CAROUSEL · component.js  (vanilla, transform-driven)
   ------------------------------------------------------------
   11tanjung's plans carousel — a row of landscape cards on a track that translateX one
   step at a time, with EDGE-PEEK (the next card's edge shows past the active one). A
   VERTICAL-PILL arrow sits in the gap (next / prev); each card has its own CTA-pill; and
   a SPEC-ROW (title / sqft / rooms) swaps SYNCHRONOUSLY with the active card. Driven by
   the arrows, drag, wheel or keyboard. Harvested from D_11tanjung (C5).

   THE MOVE: the track translateX( -index * step )px where step = card width + gap; the
   active card is full-size, the neighbour peeks at the edge. On index change the spec-row
   fields crossfade to the active card's data-* (title/sqft/rooms) and the active card's
   CTA-pill shows. ease ~cubic-bezier(.4,0,.2,1) ~520ms.

   CONFIG-DRIVEN:
     HorizontalSpecCarousel.create(target, {     // target = .hsc-stage
       peek: 0.16,        // fraction of a card left visible as the edge-peek
       duration: 520, ease: 'cubic-bezier(.22,1,.36,1)',
       wheel: true, drag: true, loop: false, index: 0
     })
   Markup: .hsc-stage > .hsc-viewport > .hsc-track > .hsc-card[data-title][data-sqft][data-rooms]
           (each card may hold .hsc-cta) ; + .hsc-spec(.hsc-spec-title,-sqft,-rooms) ;
           + .hsc-prev / .hsc-next (the vertical-pill arrows) ; + .hsc-dots (optional).
   Returns { go(i), next(), prev(), index(), destroy }.

   ENGINE LAWS: transform: translateX (track) + opacity (spec crossfade, CTA) only; GPU;
   NO mix-blend / NO backdrop over the cards; NO WebGL; reduced-motion -> instant index
   (no slide). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      peek: options.peek != null ? options.peek : 0.16,
      duration: options.duration != null ? options.duration : 520,
      ease: options.ease || 'cubic-bezier(.22,1,.36,1)',
      wheel: options.wheel !== false,
      drag: options.drag !== false,
      loop: !!options.loop,
      index: options.index || 0
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var viewport = stage.querySelector('.hsc-viewport');
    var track = stage.querySelector('.hsc-track');
    var cards = [].slice.call(stage.querySelectorAll('.hsc-card'));
    var prevBtn = stage.querySelector('.hsc-prev');
    var nextBtn = stage.querySelector('.hsc-next');
    var dots = [].slice.call(stage.querySelectorAll('.hsc-dot'));
    var specTitle = stage.querySelector('.hsc-spec-title');
    var specSqft = stage.querySelector('.hsc-spec-sqft');
    var specRooms = stage.querySelector('.hsc-spec-rooms');
    var spec = stage.querySelector('.hsc-spec');
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!track || !cards.length) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no track' }; }

    var n = cards.length, idx = Math.max(0, Math.min(n - 1, opt.index));

    function step() {
      // card width is viewport width * (1 - peek); the gap comes from the CSS var
      var cw = cards[0].getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || '0') || 0;
      return cw + gap;
    }

    function paintSpec() {
      var c = cards[idx];
      if (spec) { spec.style.opacity = '0'; }
      // crossfade: blank -> set -> show (on the next frame)
      global.requestAnimationFrame(function () {
        if (specTitle) specTitle.textContent = c.getAttribute('data-title') || '';
        if (specSqft) specSqft.textContent = c.getAttribute('data-sqft') || '';
        if (specRooms) specRooms.textContent = c.getAttribute('data-rooms') || '';
        if (spec) spec.style.opacity = '1';
      });
      cards.forEach(function (cc, i) { cc.classList.toggle('is-active', i === idx); });
      dots.forEach(function (d, i) { d.classList.toggle('is-on', i === idx); });
      if (!opt.loop) {
        if (prevBtn) prevBtn.disabled = idx === 0;
        if (nextBtn) nextBtn.disabled = idx === n - 1;
      }
    }

    function layout(animate) {
      track.style.transition = animate && !reduced
        ? ('transform ' + opt.duration + 'ms ' + opt.ease) : 'none';
      track.style.transform = 'translateX(' + (-idx * step()) + 'px)';
    }

    function go(i, animate) {
      if (opt.loop) i = (i + n) % n; else i = Math.max(0, Math.min(n - 1, i));
      idx = i; layout(animate !== false); paintSpec();
    }
    function next() { go(idx + 1); }
    function prev() { go(idx - 1); }

    if (nextBtn) nextBtn.addEventListener('click', next);
    if (prevBtn) prevBtn.addEventListener('click', prev);
    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); }); });

    // keyboard
    stage.setAttribute('tabindex', stage.getAttribute('tabindex') || '0');
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    });

    // wheel (horizontal-intent or shift+wheel)
    if (opt.wheel && viewport) {
      var wlock = false;
      viewport.addEventListener('wheel', function (e) {
        var dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
        if (!dx) return;
        e.preventDefault();
        if (wlock) return; wlock = true; setTimeout(function () { wlock = false; }, opt.duration);
        dx > 0 ? next() : prev();
      }, { passive: false });
    }

    // drag / swipe
    var drag = null;
    if (opt.drag && viewport) {
      viewport.addEventListener('pointerdown', function (e) {
        drag = { x: e.clientX, base: -idx * step() };
        track.style.transition = 'none';
        viewport.setPointerCapture && viewport.setPointerCapture(e.pointerId);
      });
      viewport.addEventListener('pointermove', function (e) {
        if (!drag) return;
        track.style.transform = 'translateX(' + (drag.base + (e.clientX - drag.x)) + 'px)';
      });
      var end = function (e) {
        if (!drag) return;
        var dx = e.clientX - drag.x;
        drag = null;
        if (dx < -40) next(); else if (dx > 40) prev(); else go(idx);
      };
      viewport.addEventListener('pointerup', end);
      viewport.addEventListener('pointercancel', end);
    }

    go(idx, false);
    global.addEventListener('resize', function () { layout(false); });

    stage.classList.add('hsc-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      go: go, next: next, prev: prev, index: function () { return idx; }, count: n,
      destroy: function () {
        if (nextBtn) nextBtn.removeEventListener('click', next);
        if (prevBtn) prevBtn.removeEventListener('click', prev);
      }
    };
  }

  var api = { create: create };
  global.HorizontalSpecCarousel = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
