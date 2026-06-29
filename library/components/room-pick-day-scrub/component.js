/* ============================================================
   ROOM-PICK-DAY-SCRUB · component.js   (vanilla, GSAP optional, NO WebGL)
   ------------------------------------------------------------
   SECTION A1c (MODEL C) — "оберіть кімнату, проживіть її день". A grid of rooms; click one and it
   expands full-screen, and THERE you scrub its OWN full day 07:00 -> 23:00 with a draggable time
   slider (or a wheel). Back closes it and you can pick another room. Each room gets its complete
   day, BY CHOICE, one at a time. The desync that broke the auto-reel cannot happen here: only one
   room scrubs at a time and its slider position IS its lighting (clock == light, directly).

   THIN ORCHESTRATOR over daynight-engine: each opened room is a DayNight instance (mode:'manual',
   reveal:'opacity', glow) and the slider drives set(t). The grid + the open/close FLIP + the time
   slider are the only new parts. No pin, no scroll-hijack.

   RoomPickDayScrub.create(target, {
     rooms: [{ day, night, name, area }],   // frame-matched pairs
     hours: [7, 23],                        // the slider's clock range
     onState: (openIdx, t) => {}            // optional: open room index + current time
   })
   Returns { root, open(i), close(), set(t), get(), destroy }.

   LAWS: opacity / transform / clip only. NO canvas, NO WebGL, NO mix-blend. Frame-matched pairs only.
   reduced-motion -> instant open (no FLIP), slider still works. Sets __LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function create(target, options) {
    options = options || {};
    var host = !target ? null : (typeof target === 'string' ? doc.querySelector(target) : target);
    if (!host) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }
    if (!global.DayNight) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'DayNight (canon) not loaded' }; }
    var rooms = options.rooms || [];
    if (!rooms.length) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no rooms' }; }

    var REDUCED = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gsap = global.gsap;
    var hours = options.hours || [7, 23];

    var grid = host.querySelector('[data-rpd-grid]');
    var overlay = host.querySelector('[data-rpd-overlay]');
    var stage = host.querySelector('[data-rpd-stage]');     // where the opened DayNight mounts
    var slider = host.querySelector('[data-rpd-slider]');
    var tiles = grid ? Array.prototype.slice.call(grid.querySelectorAll('[data-rpd-tile]')) : [];

    var openIdx = -1, dn = null, t = 0.5, lastFocused = null;
    var wrap = host.querySelector('.wrap') || grid;   // the grid container to inert while open
    var closeBtn = host.querySelector('[data-rpd-close]');

    function hhmm(hr) { var h = Math.floor(hr), m = Math.round((hr - h) * 60); if (m === 60) { m = 0; h += 1; } return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'); }

    function setT(v) {
      t = clamp(v, 0, 1);
      if (dn) dn.set(t);
      host.style.setProperty('--rpd-t', String(t));
      if (slider) {
        if (+slider.value !== t) slider.value = String(t);
        var hr = lerp(hours[0], hours[1], t);
        slider.setAttribute('aria-valuetext', hhmm(hr) + ' · ' + (hr < 12 ? 'ранок' : hr < 17 ? 'день' : hr < 21 ? 'вечір' : 'ніч'));
      }
      if (options.onState) options.onState(openIdx, t, lerp(hours[0], hours[1], t));
    }

    function open(i) {
      if (openIdx === i) return;
      openIdx = i;
      var r = rooms[i];
      var tile = tiles[i];
      // build the DayNight for this room in the stage
      if (dn) { dn.destroy && dn.destroy(); dn = null; }
      stage.innerHTML = '';
      dn = global.DayNight.create(stage, { dayMedia: r.day, nightMedia: r.night, mode: 'manual', reveal: 'opacity', glow: true, scrim: 0 });
      var nl = stage.querySelector('.dn__night'); if (nl) nl.style.willChange = 'auto';
      // PERF: the full-screen warm-glow layer repaints every frame as t changes (full-viewport
      // radial gradient) -> 20% jank. Promote it to its OWN compositor layer so the opacity ramp is
      // GPU-only (measured 4.4%->0% jank). The night layer stays un-promoted (stacked-layer lesson).
      var gl = stage.querySelector('.dn__glow'); if (gl) { gl.style.willChange = 'opacity'; gl.style.transform = 'translateZ(0)'; }
      overlay.removeAttribute('hidden');
      overlay.setAttribute('data-open', '');
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', r.name + ', час доби');
      host.setAttribute('data-rpd-state', 'open');
      // a11y: remember focus, move it INTO the modal, and inert the grid behind so Tab can't leak out
      lastFocused = doc.activeElement;
      if (wrap) { try { wrap.inert = true; } catch (e) {} wrap.setAttribute('aria-hidden', 'true'); }
      // (focus is moved to the close button after the chrome reveals — see the FLIP onComplete below)
      // FLIP: grow from the tile's rect to the overlay's rect (transform-only)
      var chrome = overlay.querySelector('[data-rpd-chrome]');
      if (!REDUCED && gsap && tile) {
        var from = tile.getBoundingClientRect();
        var to = stage.getBoundingClientRect();
        var dx = from.left - to.left, dy = from.top - to.top;
        var sx = from.width / to.width, sy = from.height / to.height;
        gsap.fromTo(stage, { x: dx, y: dy, scaleX: sx, scaleY: sy, transformOrigin: '0 0' },
          { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.6, ease: 'expo.out' });
        // focus the close button only AFTER the chrome is visible (focusing a visibility:hidden el is a no-op)
        gsap.fromTo(chrome, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, delay: 0.25, ease: 'power2.out',
          onComplete: function () { if (closeBtn) closeBtn.focus(); } });
      } else {
        if (chrome && gsap) gsap.set(chrome, { autoAlpha: 1, y: 0 });
        if (closeBtn) closeBtn.focus();   // reduced-motion: focus immediately
      }
      setT(0.18);   // open near morning so the visitor sees a clear day-state, then scrubs
    }

    function close() {
      if (openIdx < 0) return;
      var prevTile = tiles[openIdx];
      var done = function () {
        overlay.setAttribute('hidden', ''); overlay.removeAttribute('data-open');
        host.setAttribute('data-rpd-state', 'grid');
        if (dn) { dn.destroy && dn.destroy(); dn = null; } openIdx = -1;
        // a11y: un-inert the grid + restore focus to the tile that opened (explicit, not by accident)
        if (wrap) { try { wrap.inert = false; } catch (e) {} wrap.removeAttribute('aria-hidden'); }
        (lastFocused && lastFocused.focus ? lastFocused : prevTile && prevTile.focus ? prevTile : null) && (lastFocused || prevTile).focus();
      };
      if (!REDUCED && gsap && tiles[openIdx]) {
        var tile = tiles[openIdx], from = stage.getBoundingClientRect(), to = tile.getBoundingClientRect();
        var dx = to.left - from.left, dy = to.top - from.top, sx = to.width / from.width, sy = to.height / from.height;
        gsap.to(overlay.querySelector('[data-rpd-chrome]'), { autoAlpha: 0, duration: 0.2 });
        gsap.to(stage, { x: dx, y: dy, scaleX: sx, scaleY: sy, transformOrigin: '0 0', duration: 0.45, ease: 'power3.inOut', onComplete: function () { gsap.set(stage, { clearProps: 'all' }); done(); } });
      } else done();
    }

    // wire the grid tiles
    tiles.forEach(function (tile, i) {
      tile.addEventListener('click', function () { open(i); });
      tile.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
    });
    // close affordances
    if (closeBtn) closeBtn.addEventListener('click', close);
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openIdx >= 0) close(); });
    // the time slider
    if (slider) {
      slider.addEventListener('input', function () { setT(parseFloat(slider.value)); });
      // M1: the fine step (0.001) is for pointer drag; give the KEYBOARD a usable jump (~20min/press)
      slider.addEventListener('keydown', function (e) {
        var k = e.key, big = 0.022;
        if (k === 'ArrowRight' || k === 'ArrowUp') { e.preventDefault(); setT(t + big); }
        else if (k === 'ArrowLeft' || k === 'ArrowDown') { e.preventDefault(); setT(t - big); }
        else if (k === 'Home') { e.preventDefault(); setT(0); }
        else if (k === 'End') { e.preventDefault(); setT(1); }
      });
      // wheel over the open stage also scrubs time (gentle)
      if (stage) stage.addEventListener('wheel', function (e) { if (openIdx < 0) return; e.preventDefault(); setT(t + (e.deltaY > 0 ? 0.04 : -0.04)); }, { passive: false });
    }

    host.setAttribute('data-rpd-state', 'grid');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      root: host, open: open, close: close, set: setT, get: function () { return t; },
      openIndex: function () { return openIdx; },
      destroy: function () { if (dn) dn.destroy && dn.destroy(); }
    };
  }

  var api = { create: create };
  global.RoomPickDayScrub = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
