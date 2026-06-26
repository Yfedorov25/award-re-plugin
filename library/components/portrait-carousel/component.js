/* ============================================================
   PORTRAIT-CAROUSEL · component.js  (vanilla, no deps)
   ------------------------------------------------------------
   Springs' terrace CAROUSEL — an arrow-driven portrait carousel where slides
   change by a VERTICAL SLICE/PUSH inside a fixed frame, copy crossfading a beat
   behind, each slide Ken-Burns drifting. Harvested from D_springs_nature_and_carousel.

   MEASURED (teardown):
     - a fixed portrait IMAGE FRAME (overflow:hidden, ~0.66-1.0 ratio), image inside
       larger than the frame, slow Ken-Burns drift.
     - NEXT (->): incoming image slides UP from the BOTTOM (translateY 100%->0),
       outgoing rides up and off; PREV (<-): incoming enters from the TOP.
       It is a vertical PUSH, NOT a crossfade / horizontal / clip wipe. ~0.7-0.85s.
     - COPY (caption) crossfades a beat AFTER the image (the picture lands first,
       the words confirm second).
     - two outline circular ← → controls (1px stroke), hover-brighten.

   CONFIG-DRIVEN:
     PortraitCarousel.init(target, {
       slides: [{ image, copy }, …],   // or read .pc-slide children
       pushMs: 780, copyLagMs: 120, loop: true, kenBurns: true
     })
   Markup-first: .pc-slide children carry data-image / data-copy; engine builds the
   2-layer push frame, the copy, wires the .pc-prev / .pc-next buttons.

   LAW: transform (image push + ken-burns) + opacity (copy crossfade) only; GPU
   layers; NO mix-blend / NO backdrop over the moving image. reduced-motion -> hard
   swap + no ken-burns. Click + keyboard (arrows). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';

  function init(target, options) {
    options = options || {};
    var stage = typeof target === 'string' ? document.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var pushMs = options.pushMs != null ? options.pushMs : 780;
    var copyLag = options.copyLagMs != null ? options.copyLagMs : 120;
    var loop = options.loop !== false;
    var kenBurns = options.kenBurns !== false && !reduced;

    var slideEls = [].slice.call(stage.querySelectorAll('.pc-slide'));
    var slides = options.slides || slideEls.map(function (el) {
      return { image: el.getAttribute('data-image'), copy: el.getAttribute('data-copy') };
    });
    var N = slides.length;
    if (N < 2) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'need >=2 slides' }; }

    var frame = stage.querySelector('.pc-frame');
    var copyEl = stage.querySelector('.pc-copy');
    var prevBtn = stage.querySelector('.pc-prev');
    var nextBtn = stage.querySelector('.pc-next');

    // build the 2-layer push frame
    if (frame) {
      frame.innerHTML = '';
      ['a', 'b'].forEach(function (k) {
        var l = document.createElement('div'); l.className = 'pc-layer pc-layer--' + k;
        var im = document.createElement('img'); im.alt = ''; im.decoding = 'async'; l.appendChild(im);
        frame.appendChild(l);
      });
    }
    var layerA = frame ? frame.querySelector('.pc-layer--a') : null;
    var layerB = frame ? frame.querySelector('.pc-layer--b') : null;
    function imgOf(l) { return l ? l.querySelector('img') : null; }
    if (kenBurns) { if (layerA) layerA.classList.add('pc-kb'); if (layerB) layerB.classList.add('pc-kb'); }

    var cur = 0, busy = false, topIsA = true;
    if (imgOf(layerA)) imgOf(layerA).src = slides[0].image || '';
    if (copyEl) copyEl.textContent = slides[0].copy || '';

    function tween(dur, onU, onD) {
      var t0 = null;
      function f(now) { if (t0 === null) t0 = now; var p = Math.min(1, (now - t0) / dur); var e = 1 - Math.pow(1 - p, 3); onU(e); if (p < 1) requestAnimationFrame(f); else if (onD) onD(); }
      requestAnimationFrame(f);
    }

    function go(dir) {
      if (busy) return;
      var next = cur + dir;
      if (loop) next = (next + N) % N;
      if (next < 0 || next >= N || next === cur) { busy = false; return; }
      busy = true;

      var topLayer = topIsA ? layerA : layerB;
      var inLayer = topIsA ? layerB : layerA;
      var inImg = imgOf(inLayer);
      if (inImg) inImg.src = slides[next].image || '';
      // NEXT: incoming from BELOW (100%->0); PREV: incoming from ABOVE (-100%->0)
      var from = dir > 0 ? 100 : -100;
      var outTo = dir > 0 ? -100 : 100;

      if (reduced) {
        if (inLayer) { inLayer.style.transform = 'translateY(0)'; inLayer.style.zIndex = 2; }
        if (topLayer) topLayer.style.zIndex = 1;
        topIsA = !topIsA; swapCopy(next); cur = next; busy = false;
      } else {
        if (inLayer) { inLayer.style.transform = 'translateY(' + from + '%)'; inLayer.style.zIndex = 2; }
        if (topLayer) topLayer.style.zIndex = 1;
        tween(pushMs, function (e) {
          if (inLayer) inLayer.style.transform = 'translateY(' + (from * (1 - e)) + '%)';
          if (topLayer) topLayer.style.transform = 'translateY(' + (outTo * e) + '%)';
        }, function () {
          if (inLayer) inLayer.style.transform = 'translateY(0)';
          if (topLayer) topLayer.style.transform = 'translateY(0)';
          topIsA = !topIsA; cur = next; busy = false;
        });
        swapCopy(next);
      }
      if (options.onChange) options.onChange(next, slides[next]);
    }

    function swapCopy(i) {
      if (!copyEl) return;
      if (reduced) { copyEl.textContent = slides[i].copy || ''; copyEl.style.opacity = '1'; return; }
      // copy lags the image: fade out, swap, fade+rise in a beat after
      setTimeout(function () {
        copyEl.style.transition = 'opacity .28s ease, transform .28s ease';
        copyEl.style.opacity = '0'; copyEl.style.transform = 'translateY(8px)';
        setTimeout(function () {
          copyEl.textContent = slides[i].copy || '';
          copyEl.style.transition = 'opacity .5s ease, transform .6s cubic-bezier(.16,.84,.24,1)';
          copyEl.style.opacity = '1'; copyEl.style.transform = 'translateY(0)';
        }, 200);
      }, copyLag);
    }

    if (nextBtn) nextBtn.addEventListener('click', function () { go(1); });
    if (prevBtn) prevBtn.addEventListener('click', function () { go(-1); });
    stage.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowRight') { ev.preventDefault(); go(1); }
      if (ev.key === 'ArrowLeft') { ev.preventDefault(); go(-1); }
    });

    stage.classList.add('pc-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return { go: go, current: function () { return cur; }, slides: slides };
  }

  var api = { init: init };
  global.PortraitCarousel = api;
  global.portraitCarousel = function (t, o) { return init(t, o); };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
