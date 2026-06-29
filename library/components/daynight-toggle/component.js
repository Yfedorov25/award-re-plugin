/* ============================================================
   DAYNIGHT-TOGGLE · component.js   (variation V1 — the TOWNS dialect)
   ------------------------------------------------------------
   The cleanest day<->night: a pill "День / Ніч" with a sliding accent THUMB that
   SNAPS the whole scene between day and night (opacity reveal). This is the Towns
   dialect, harvested 1:1 from apps/towns/src/js/sections/plan.js (setMode) +
   apps/towns/src/styles/app.css (.plan__daynight / .plan__dn-thumb).

   It does NOT re-implement the crossfade — it DRIVES the canon engine:
     1. window.DayNight.create(target, { mode:'manual', reveal:'opacity', glow:true, ... })
     2. inject the pill UI (two buttons + an absolute accent thumb)
     3. wire button clicks / Enter / Space -> dn.set(0|1) + thumb translateX(0|100%) + .is-on
     4. reduced-motion -> the thumb snaps with no transition (canon already statics the scene)

   The canon's "toggle" driver binds NOTHING (armToggle is a no-op) — so we use mode:'manual'
   and set(0|1) ourselves. set(t) on the canon is PURE; here we only ever ask for 0 or 1, and
   the OPACITY crossfade timing lives in the canon (the night layer fades to opacity t).

   DAYNIGHT-TOGGLE.create(target, {
     dayMedia,            // url | selector | element  (frame-matched day still)
     nightMedia,          // url | selector | element  (frame-matched night still)
     labels: ['День','Ніч'],   // [dayLabel, nightLabel] on the two buttons
     accent: '#c8a86b',        // the sliding thumb colour
     glow: true,               // warm window-glow rises with t (canon layer)
     start: 0                  // 0 = day on load (default) | 1 = night on load
   })
   Returns { root, set(t), get(), toggle(), pill, day(), night(), destroy }.

   ENGINE LAWS (inherited): opacity / transform / gradient only — NO WebGL, NO mix-blend,
   NO backdrop-filter. Keyboard accessible. prefers-reduced-motion respected.
   Requires the canon (window.DayNight) loaded FIRST. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var DN = global.DayNight;
    if (!DN || typeof DN.create !== 'function') {
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { error: 'daynight-engine (window.DayNight) must load before daynight-toggle' };
    }

    var host = !target ? doc.body : (typeof target === 'string' ? doc.querySelector(target) : target);
    if (!host) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var labels = (options.labels && options.labels.length === 2) ? options.labels : ['День', 'Ніч'];
    var accent = options.accent || '#c8a86b';
    var startNight = options.start === 1 || options.start === true;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1) the canon engine — manual driver, opacity reveal (Towns crossfade lives in the canon)
    var dn = DN.create(host, {
      dayMedia: options.dayMedia,
      nightMedia: options.nightMedia,
      mode: 'manual',
      reveal: 'opacity',
      glow: options.glow != null ? options.glow : true
    });

    // 2) the pill UI (1:1 with the Towns seed markup)
    var pill = doc.createElement('div');
    pill.className = 'dnt__pill';
    pill.setAttribute('role', 'group');
    pill.setAttribute('aria-label', 'День або ніч');

    var btnDay = doc.createElement('button');
    btnDay.type = 'button';
    btnDay.className = 'dnt__btn';
    btnDay.setAttribute('data-mode', 'day');
    btnDay.setAttribute('aria-pressed', startNight ? 'false' : 'true');
    btnDay.textContent = labels[0];

    var btnNight = doc.createElement('button');
    btnNight.type = 'button';
    btnNight.className = 'dnt__btn';
    btnNight.setAttribute('data-mode', 'night');
    btnNight.setAttribute('aria-pressed', startNight ? 'true' : 'false');
    btnNight.textContent = labels[1];

    var thumb = doc.createElement('span');
    thumb.className = 'dnt__thumb';
    thumb.setAttribute('aria-hidden', 'true');
    thumb.style.setProperty('--dnt-accent', accent);
    if (reduced) thumb.style.transition = 'none';

    pill.appendChild(btnDay);
    pill.appendChild(btnNight);
    pill.appendChild(thumb);
    host.appendChild(pill);

    // 3) the wiring — setMode flips .is-on, slides the thumb, drives the canon
    var mode = 'day';
    function setMode(m, focusBtn) {
      mode = (m === 'night') ? 'night' : 'day';
      var night = mode === 'night';
      btnDay.classList.toggle('is-on', !night);
      btnNight.classList.toggle('is-on', night);
      btnDay.setAttribute('aria-pressed', night ? 'false' : 'true');
      btnNight.setAttribute('aria-pressed', night ? 'true' : 'false');
      thumb.style.transform = 'translateX(' + (night ? '100%' : '0') + ')';
      dn.set(night ? 1 : 0);
      if (focusBtn) (night ? btnNight : btnDay).focus();
    }

    function onClick(e) {
      var b = e.target.closest('button[data-mode]');
      if (!b) return;
      setMode(b.getAttribute('data-mode'), false);
    }
    // 4) keyboard: Enter/Space on a button selects its mode; the buttons are real <button>s,
    // so native activation already fires click — but we also let ←/→ flip for arrow-key users.
    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setMode('night', true); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setMode('day', true); }
    }

    pill.addEventListener('click', onClick);
    pill.addEventListener('keydown', onKey);

    // initial state
    setMode(startNight ? 'night' : 'day', false);

    function destroy() {
      pill.removeEventListener('click', onClick);
      pill.removeEventListener('keydown', onKey);
      if (pill.parentNode) pill.parentNode.removeChild(pill);
      if (dn && dn.destroy) dn.destroy();
    }

    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      root: dn.root,
      pill: pill,
      set: function (t) { setMode(t >= 0.5 ? 'night' : 'day', false); },
      get: function () { return dn.get(); },
      toggle: function () { setMode(mode === 'night' ? 'day' : 'night', false); },
      day: function () { setMode('day', false); },
      night: function () { setMode('night', false); },
      destroy: destroy
    };
  }

  var api = { create: create };
  global.DayNightToggle = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
