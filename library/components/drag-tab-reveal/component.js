/* ============================================================
   DRAG-TAB-REVEAL · component.js  (vanilla, transform-driven; no GSAP needed)
   ------------------------------------------------------------
   gapsystudio's "Pull Me" drawer — an edge-anchored PANEL sits mostly off-screen with a
   small GRAB-TAB ("Pull Me") on its visible edge. You DRAG the tab to pull the panel out
   (it follows the pointer 0..width); release past a threshold and it SNAPS open, otherwise
   it snaps back closed. Click the tab to toggle. The tab LABEL swaps (Pull Me <-> Close).
   Harvested from D_gapsy (C /about — the "Pull Me" tab on the far-left edge).

   THE MOVE: progress p 0..1 = how far the panel is pulled out (0 closed, 1 open).
     - while dragging: panel translateX follows the pointer delta, clamped 0..width
     - on release: snap to 0 or 1 (whichever side of `threshold` the drag ended) with a
       spring-ish CSS transition; a flick (fast drag) opens/closes regardless of distance
     - the tab rides the panel's edge; its label + chevron flip with the open state
   Pointer move/up are tracked on WINDOW (F-08 lesson: a drag leaving the tab still ends).

   CONFIG-DRIVEN:
     DragTabReveal.create(target, {       // target = .dtr-stage
       side: 'left',          // 'left' | 'right' — which edge the panel anchors to
       threshold: 0.4,        // release past this fraction => snap open
       duration: 460, ease: 'cubic-bezier(.22,1,.36,1)',
       openLabel: 'Close', closedLabel: 'Pull Me'
     })
   Markup: .dtr-stage > .dtr-panel(.dtr-tab(.dtr-tab-label) + .dtr-content). Returns
   { open(), close(), toggle(), set(p), isOpen(), destroy }.

   ENGINE LAWS: transform: translateX (panel) + opacity only; JS sets a CSS var/inline
   transform + toggles a class; NO mix-blend / NO backdrop; NO WebGL; touch via Pointer
   Events; reduced-motion -> instant snap. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      side: options.side === 'right' ? 'right' : 'left',
      threshold: options.threshold != null ? options.threshold : 0.4,
      duration: options.duration != null ? options.duration : 460,
      ease: options.ease || 'cubic-bezier(.22,1,.36,1)',
      openLabel: options.openLabel || 'Close',
      closedLabel: options.closedLabel || 'Pull Me'
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var panel = stage.querySelector('.dtr-panel');
    var tab = stage.querySelector('.dtr-tab');
    var label = stage.querySelector('.dtr-tab-label');
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!panel || !tab) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no panel/tab' }; }

    stage.classList.add('dtr--' + opt.side);
    var dir = opt.side === 'right' ? 1 : -1;   // closed = panel pushed off that edge
    var open = false;

    function width() { return panel.getBoundingClientRect().width || 1; }
    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

    // p 0 = closed (panel off-edge except the tab), p 1 = open (panel fully in)
    function apply(p, animate) {
      p = clamp01(p);
      panel.style.transition = (animate && !reduced)
        ? ('transform ' + opt.duration + 'ms ' + opt.ease) : 'none';
      // closed: translate the panel off its edge by (1-p)*width in the closing direction
      var off = (1 - p) * width() * dir;
      panel.style.transform = 'translateX(' + off.toFixed(1) + 'px)';
    }

    function setOpen(o) {
      open = o;
      apply(o ? 1 : 0, true);
      stage.classList.toggle('is-open', o);
      tab.setAttribute('aria-expanded', String(o));
      if (label) label.textContent = o ? opt.openLabel : opt.closedLabel;
    }
    setOpen(false);

    // ---- drag (pointer on window per F-08) ----
    var drag = null;
    function dragMove(e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      drag.dx = dx; if (Math.abs(dx) > 4) drag.moved = true;
      // base = current open px (0 when closed, width when open), add the drag in the open dir
      var px = drag.basePx + dx * (-dir);     // dragging toward the centre opens
      var p = clamp01(px / width());
      apply(p, false);
      drag.p = p;
    }
    function dragEnd(e) {
      if (!drag) return;
      var moved = drag.moved, p = drag.p != null ? drag.p : (open ? 1 : 0), dx = drag.dx || 0;
      drag = null;
      global.removeEventListener('pointermove', dragMove);
      global.removeEventListener('pointerup', dragEnd);
      global.removeEventListener('pointercancel', dragEnd);
      if (!moved) { setOpen(!open); return; }          // a tap on the tab = toggle
      var flick = Math.abs(dx) > 60;                    // a fast throw decides direction
      if (flick) setOpen((dx * (-dir)) > 0);
      else setOpen(p >= opt.threshold);
    }
    tab.addEventListener('pointerdown', function (e) {
      if (e.button != null && e.button !== 0) return;
      drag = { x: e.clientX, basePx: (open ? width() : 0), dx: 0, moved: false, p: open ? 1 : 0 };
      global.addEventListener('pointermove', dragMove);
      global.addEventListener('pointerup', dragEnd);
      global.addEventListener('pointercancel', dragEnd);
      e.preventDefault();
    });
    tab.addEventListener('dragstart', function (e) { e.preventDefault(); });
    // keyboard
    tab.setAttribute('tabindex', tab.getAttribute('tabindex') || '0');
    tab.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); }
    });

    global.addEventListener('resize', function () { apply(open ? 1 : 0, false); });

    stage.classList.add('dtr-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      open: function () { setOpen(true); }, close: function () { setOpen(false); },
      toggle: function () { setOpen(!open); }, set: apply, isOpen: function () { return open; },
      destroy: function () {
        global.removeEventListener('pointermove', dragMove);
        global.removeEventListener('pointerup', dragEnd);
        global.removeEventListener('pointercancel', dragEnd);
      }
    };
  }

  var api = { create: create };
  global.DragTabReveal = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
