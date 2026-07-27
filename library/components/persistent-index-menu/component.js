/* ============================================================
   PERSISTENT-INDEX-MENU · component.js  (vanilla, no deps)
   ------------------------------------------------------------
   Springs' Wellness amenity menu (Spa / Yoga / Fitness / Café) — the award-rhythm
   list-index <-> (media + copy) binding. Harvested from D_springs_wellness_menu_clip.

   THE MOVE (the elegant upgrade over a full-bleed stepper):
     - SPLIT layout: media LEFT (a hard rectangle window), a PERSISTENT serif INDEX
       + body copy RIGHT. The index is ALWAYS visible.
     - The index is a FIXED stack of N words; the active one is bright, the rest
       dimmed (binary opacity ~1 / ~0.35). The list NEVER moves — only the
       highlight changes.
     - CLICK-DRIVEN (not scroll-jacked): clicking a list word advances activeIndex.
       The label LEADS — it lights instantly, then the media + copy follow.
     - MEDIA SWAP = a VERTICAL PUSH (not crossfade): a 2-layer stack translateY's by
       one frame-height — old exits UP, new enters from BELOW — ~0.6s eased.
     - BODY COPY swaps (fade+rise) a beat after, bottom-anchored (grows upward).
     - A constant gradient GLOW behind the copy NEVER changes (cohesion).

   One activeIndex drives three things in lockstep: (a) which label is lit,
   (b) which media rides the top of the push stack, (c) which copy shows.

   CONFIG-DRIVEN:
     PersistentIndexMenu.init(target, {
       items: [{ label, media, copy }, …],   // or read .pim-item children
       pushMs: 600, copyDelayMs: 120,
       activeOpacity: 1, dimOpacity: 0.35
     })
   Markup-first: .pim-item children carry data-label / data-media / data-copy. The
   engine builds the 2-layer media push stack, the index buttons, the copy.

   LAW: transform (media push) + opacity (index dim, copy) only; GPU layers; NO
   mix-blend / NO backdrop over the moving media; the glow is a STATIC gradient (set
   in CSS, never animated over a moving surface). reduced-motion -> hard swap (no
   push). Click/keyboard driven, accessible. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';

  function init(target, options) {
    options = options || {};
    var stage = typeof target === 'string' ? document.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var pushMs = options.pushMs != null ? options.pushMs : 600;
    var copyDelay = options.copyDelayMs != null ? options.copyDelayMs : 120;
    var dim = options.dimOpacity != null ? options.dimOpacity : 0.35;
    var act = options.activeOpacity != null ? options.activeOpacity : 1;

    // read items from markup or options
    var itemEls = [].slice.call(stage.querySelectorAll('.pim-item'));
    var items = options.items || itemEls.map(function (el) {
      return { label: el.getAttribute('data-label'), media: el.getAttribute('data-media'), copy: el.getAttribute('data-copy') };
    });
    var N = items.length;
    if (N < 2) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'need >=2 items' }; }

    var mediaWindow = stage.querySelector('.pim-media');
    var indexWrap = stage.querySelector('.pim-index');
    var copyEl = stage.querySelector('.pim-copy');

    // build the index buttons (fixed stack)
    if (indexWrap) {
      indexWrap.innerHTML = '';
      items.forEach(function (it, i) {
        var b = document.createElement('button');
        b.className = 'pim-word'; b.type = 'button'; b.textContent = it.label;
        b.style.opacity = i === 0 ? act : dim;
        b.addEventListener('click', function () { go(i); });
        indexWrap.appendChild(b);
      });
    }
    var words = indexWrap ? [].slice.call(indexWrap.querySelectorAll('.pim-word')) : [];

    // build the media push stack: two layers (A active, B incoming)
    if (mediaWindow) {
      mediaWindow.innerHTML = '';
      ['a', 'b'].forEach(function (k) {
        var l = document.createElement('div'); l.className = 'pim-layer pim-layer--' + k;
        var im = document.createElement('img'); im.alt = ''; im.decoding = 'async'; l.appendChild(im);
        mediaWindow.appendChild(l);
      });
    }
    var layerA = mediaWindow ? mediaWindow.querySelector('.pim-layer--a') : null;
    var layerB = mediaWindow ? mediaWindow.querySelector('.pim-layer--b') : null;
    function imgOf(layer) { return layer ? layer.querySelector('img') : null; }

    var cur = 0, busy = false, topIsA = true;
    if (imgOf(layerA)) imgOf(layerA).src = items[0].media || '';
    if (copyEl) copyEl.textContent = items[0].copy || '';

    function tween(dur, onU, onD) {
      var t0 = null;
      function f(now) { if (t0 === null) t0 = now; var p = Math.min(1, (now - t0) / dur); var e = 1 - Math.pow(1 - p, 3); onU(e); if (p < 1) requestAnimationFrame(f); else if (onD) onD(); }
      requestAnimationFrame(f);
    }

    function go(i) {
      if (busy || i === cur || i < 0 || i >= N) return;
      busy = true;
      // 1) label LEADS — light it instantly
      words.forEach(function (w, k) { w.style.opacity = k === i ? act : dim; });

      // 2) media vertical push: incoming layer = the one not on top, starts at 100%, rides up to 0
      var topLayer = topIsA ? layerA : layerB;
      var inLayer = topIsA ? layerB : layerA;
      var inImg = imgOf(inLayer);
      if (inImg) inImg.src = items[i].media || '';
      if (reduced) {
        // hard swap
        if (inLayer) { inLayer.style.transform = 'translateY(0)'; inLayer.style.zIndex = 2; }
        if (topLayer) { topLayer.style.zIndex = 1; }
        topIsA = !topIsA; afterCopy(i); busy = false;
      } else {
        if (inLayer) { inLayer.style.transform = 'translateY(100%)'; inLayer.style.zIndex = 2; }
        if (topLayer) topLayer.style.zIndex = 1;
        tween(pushMs, function (e) {
          if (inLayer) inLayer.style.transform = 'translateY(' + ((1 - e) * 100) + '%)';
          if (topLayer) topLayer.style.transform = 'translateY(' + (-e * 100) + '%)';
        }, function () {
          if (inLayer) inLayer.style.transform = 'translateY(0)';
          if (topLayer) topLayer.style.transform = 'translateY(0)'; // reset off-stage layer back to 0 underneath
          topIsA = !topIsA; busy = false;
        });
      }
      // 3) copy swap a beat after (fade out -> swap -> fade+rise in)
      afterCopy(i);
      cur = i;
      if (options.onChange) options.onChange(i, items[i]);
    }

    function afterCopy(i) {
      if (!copyEl) return;
      if (reduced) { copyEl.textContent = items[i].copy || ''; copyEl.style.opacity = '1'; return; }
      copyEl.style.transition = 'opacity .25s ease, transform .25s ease';
      copyEl.style.opacity = '0'; copyEl.style.transform = 'translateY(10px)';
      setTimeout(function () {
        copyEl.textContent = items[i].copy || '';
        copyEl.style.transition = 'opacity .5s ease, transform .6s cubic-bezier(.16,.84,.24,1)';
        copyEl.style.opacity = '1'; copyEl.style.transform = 'translateY(0)';
      }, copyDelay + 180);
    }

    // keyboard: up/down arrows cycle
    stage.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown') { ev.preventDefault(); go(Math.min(N - 1, cur + 1)); }
      if (ev.key === 'ArrowUp') { ev.preventDefault(); go(Math.max(0, cur - 1)); }
    });

    stage.classList.add('pim-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return { go: go, current: function () { return cur; }, items: items };
  }

  var api = { init: init };
  global.PersistentIndexMenu = api;
  global.persistentIndexMenu = function (t, o) { return init(t, o); };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
