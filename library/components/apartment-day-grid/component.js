/* ============================================================
   APARTMENT-DAY-GRID · component.js   (vanilla, GSAP + ScrollTrigger, NO WebGL)
   ------------------------------------------------------------
   SECTION A1a (MODEL A) — "квартира проживає день". ALL rooms on screen at once, in a grid,
   and as you scroll 07:00 -> 23:00 EVERY room changes its lighting TOGETHER, consistently:
   at 11:00 every room is at 11:00 (morning), at 19:00 every room is at 19:00 (evening). Time ==
   lighting everywhere, simultaneously. This fixes the broken first attempt where rooms played
   one-at-a-time while the clock ran globally (giving "11am but the room looks like midnight").

   THIN ORCHESTRATOR over the verified daynight-engine: one DayNight instance per grid cell
   (mode:'manual', reveal:'opacity', glow), and a SINGLE scroll t drives EVERY cell's set(t) to
   the same value. The grid layout + the day-clock chrome are the only new parts.

   apartment-day-grid.create(target, {
     rooms: [{ day, night, name }],        // frame-matched pairs (any count; 4-6 reads best)
     scrub: { trigger, start, end, pin },  // the pinned day
     hours: [7, 23],                       // clock range mapped across the scroll
     stagger: 0.0,                         // optional tiny per-cell delay so the wave reads (0 = perfectly in sync)
     onProgress: (t, hour) => {}           // for the clock readout / copy
   })
   Returns { root, set(t), get(), destroy }.  set(t) is PURE (0..1) — drive from anything.

   LAWS: opacity / transform / CSS-prop only. NO canvas, NO WebGL, NO mix-blend. Frame-matched
   pairs only. reduced-motion -> static grid at a calm dusk, no pin/scrub. Sets __LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  if (global.gsap && global.ScrollTrigger && global.gsap.registerPlugin) global.gsap.registerPlugin(global.ScrollTrigger);

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
    // stagger: default 0 = perfectly synchronized (the whole point of Model A). Guard the formula so
    // the total spread can never exceed ~0.08 (≈1.3h) — beyond that it stops reading as one moment.
    var stagger = options.stagger != null ? options.stagger : 0;
    if (rooms.length > 1) stagger = Math.max(0, Math.min(stagger, 0.08 / (rooms.length - 1)));

    var grid = host.querySelector('[data-grid]') || host;

    // one DayNight per cell; all share one t (synchronous day)
    var cells = rooms.map(function (r, i) {
      var cell = doc.createElement('div');
      cell.className = 'adg__cell';
      grid.appendChild(cell);
      var media = doc.createElement('div'); media.className = 'adg__media'; media.setAttribute('aria-hidden', 'true'); cell.appendChild(media);
      cell.setAttribute('role', 'img');
      cell.setAttribute('aria-label', (r.name || 'Кімната') + ' протягом дня');
      var dn = global.DayNight.create(media, {
        dayMedia: r.day, nightMedia: r.night,
        mode: 'manual', reveal: 'opacity', glow: true, scrim: 0
      });
      // PERF: clear the engine's will-change on each night layer (N stacked layers under a scroll
      // churn the compositor; we drive opacity rarely). See master lessons.
      var nl = media.querySelector('.dn__night'); if (nl) nl.style.willChange = 'auto';
      // a per-cell room label
      if (r.name) { var lab = doc.createElement('span'); lab.className = 'adg__label'; lab.textContent = r.name; cell.appendChild(lab); }
      return { cell: cell, media: media, dn: dn, room: r };
    });

    var t = 0;
    function apply(v) {
      t = clamp(v, 0, 1);
      // EVERY cell gets the SAME time-of-day (a tiny optional stagger keeps it readable as a wave
      // but stays consistent: a cell's local time never leads/lags by more than `stagger`).
      for (var i = 0; i < cells.length; i++) {
        var lt = stagger > 0 ? clamp((t - i * stagger) / (1 - (cells.length - 1) * stagger), 0, 1) : t;
        cells[i].dn.set(lt);
      }
      host.style.setProperty('--adg-t', String(t));
      var hour = lerp(hours[0], hours[1], t);
      host.setAttribute('data-phase', t < 0.34 ? 'day' : t < 0.7 ? 'dusk' : 'night');
      if (options.onProgress) options.onProgress(t, hour);
    }
    apply(0);

    var st = null;
    if (REDUCED || !gsap || !global.ScrollTrigger) {
      // static calm dusk — EVERY cell at the SAME time (bypass stagger so the frozen frame is consistent)
      t = 0.5; cells.forEach(function (c) { c.dn.set(0.5); });
      host.style.setProperty('--adg-t', '0.5'); host.setAttribute('data-phase', 'dusk');
      if (options.onProgress) options.onProgress(0.5, lerp(hours[0], hours[1], 0.5));
    } else {
      var cfg = options.scrub || {};
      st = global.ScrollTrigger.create({
        trigger: cfg.trigger || host,
        start: cfg.start || 'top top',
        end: cfg.end || '+=180%',
        scrub: cfg.scrub != null ? cfg.scrub : true,
        pin: cfg.pin != null ? cfg.pin : true,
        pinSpacing: true,
        anticipatePin: 1,
        onUpdate: function (self) { apply(self.progress); }
      });
    }

    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      root: host, cells: cells,
      set: apply, get: function () { return t; },
      destroy: function () { if (st) st.kill(); cells.forEach(function (c) { c.dn.destroy && c.dn.destroy(); c.cell.remove(); }); }
    };
  }

  var api = { create: create };
  global.ApartmentDayGrid = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
