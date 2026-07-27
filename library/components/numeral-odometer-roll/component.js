/* ============================================================
   NUMERAL-ODOMETER-ROLL · component.js  (vanilla + guarded GSAP 3.12.5)
   ------------------------------------------------------------
   The PURE numeral ODOMETER-ROLL mechanic, EXTRACTED out of stat-odometer's own
   pinned ScrollTrigger so other atoms can borrow the roll WITHOUT importing
   stat-odometer's pin. (stat-odometer owns_pin AND minutes-bloom owns_pin — this
   sub-atom owns_pin:FALSE, so a host that already owns the pin can drive it.)

   THE MOVE (verbatim mechanic from stat-odometer S11, lines 88-92 + 146-150):
     a vertical strip of numbers (.nor-num, one per value) lives inside a
     one-number-tall overflow:hidden WINDOW. The column (.nor-col) is translated
     on Y so the active value sits in the window:
       translateY = -(index + f) * rowHeight     (f = 0..1 fraction between rows)
     The number visibly ROLLS — the old value slides up and out, the new rolls up
     from below. Pure transform; the window clips the rest.

   TWO DRIVERS (both PURE transform, reversible):
     · set(p)  — p 0..1 maps across the WHOLE value sequence (fpos = p*(N-1));
                 a host pin/scrub calls this every frame. No ScrollTrigger here.
     · to(n)   — animate the column to value n (GSAP tween of the same translateY,
                 or a CSS transition / instant snap when GSAP is absent).

   CONFIG-DRIVEN:
     NumeralOdometerRoll.create(target, {
       values: [9,10,6],   // the value sequence (or a single { value, digits })
       value: 9,           // start value (matched within values, else first)
       digits: 2,          // pad each value to this many chars (leading thin-space)
       ease: 'air',        // tween ease for to(); 'air' = power3.out-class glide
       dur: 0.6            // tween seconds for to()
     }) -> { to(n), set(p), value, index, destroy }

   Markup-first: if .nor-col already holds .nor-num children, those are the values
   (read from textContent). Otherwise the engine BUILDS the column from `values`.

   ENGINE LAWS: translateY (the column) only; overflow:hidden window; GPU layer;
   NO mix-blend / NO backdrop / NO WebGL / NO width/height/top/left animation.
   reduced-motion -> to() SNAPS (no tween). owns_pin:false (no ScrollTrigger of its
   own). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  // ease tokens -> gsap ease strings (a small, named set; 'air' is the house glide)
  var EASE = { air: 'power3.out', glide: 'power2.out', linear: 'none', snap: 'expo.out' };

  function create(target, options) {
    options = options || {};
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var gsap = global.gsap;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var col = stage.querySelector('.nor-col') || stage;
    var existing = [].slice.call(col.querySelectorAll('.nor-num'));

    var digits = options.digits != null ? options.digits : 0;
    function fmt(v) {
      var s = String(v);
      // pad with a thin space (visual alignment only, never a layout-shifting char)
      while (digits && s.length < digits) s = ' ' + s;
      return s;
    }

    // resolve the value sequence: explicit values[], or read from existing markup,
    // or a single value
    var values;
    if (options.values && options.values.length) {
      values = options.values.slice();
    } else if (existing.length) {
      values = existing.map(function (el) { return el.textContent.trim(); });
    } else if (options.value != null) {
      values = [options.value];
    } else {
      values = [0];
    }
    var N = values.length;

    // BUILD the column rows if markup didn't supply them
    if (!existing.length) {
      col.innerHTML = '';
      values.forEach(function (v) {
        var d = doc.createElement('div');
        d.className = 'nor-num';
        d.textContent = fmt(v);
        col.appendChild(d);
      });
    } else if (digits) {
      // re-pad existing rows to the requested width
      existing.forEach(function (el, i) { el.textContent = fmt(values[i]); });
    }
    var rows = [].slice.call(col.querySelectorAll('.nor-num'));

    function rowHeight() { return rows.length ? rows[0].getBoundingClientRect().height : 0; }

    // clamp the window to EXACTLY one row, whatever the font metrics report, so the
    // clip always shows a single number (CSS --nor-row is a hint; this is the truth).
    var windowEl = stage.classList && stage.classList.contains('nor-window') ? stage
      : (stage.querySelector ? stage.querySelector('.nor-window') : null);
    function syncWindow() {
      if (!windowEl) return;
      var h = rowHeight();
      if (h > 0) windowEl.style.height = h + 'px';
    }
    syncWindow();

    // PURE: place the column at a fractional index position (the roll). Reversible,
    // transform-only. fpos may be any real in [0, N-1].
    function place(fpos) {
      var h = rowHeight();
      col.style.transform = 'translateY(' + (-fpos * h).toFixed(2) + 'px)';
    }

    var idx = 0; // current integer value index
    // start value: match options.value within the sequence, else 0
    if (options.value != null) {
      var want = String(options.value);
      for (var k = 0; k < N; k++) { if (String(values[k]) === want) { idx = k; break; } }
    }
    place(idx);

    // set(p): host pin/scrub driver. p 0..1 across the WHOLE sequence. PURE.
    function set(p) {
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      var fpos = p * (N - 1);
      place(fpos);
      idx = Math.round(fpos);
      return fpos;
    }

    var activeTween = null;
    // to(n): animate the column to value n (by value, not index). Snaps under
    // reduced-motion or when GSAP is absent.
    function to(n) {
      var target = -1, want = String(n);
      for (var i = 0; i < N; i++) { if (String(values[i]) === want) { target = i; break; } }
      if (target < 0) return idx; // value not in the sequence -> no-op
      var h = rowHeight();
      if (activeTween && activeTween.kill) activeTween.kill();

      if (reduced || !gsap) {
        place(target);
        idx = target;
        return idx;
      }
      // tween the same translateY the pin would drive — the visible ROLL
      var from = { f: idx };
      activeTween = gsap.to(from, {
        f: target,
        duration: options.dur != null ? options.dur : 0.6,
        ease: EASE[options.ease] || options.ease || 'power3.out',
        onUpdate: function () { place(from.f); },
        onComplete: function () {
          place(target);
          col.style.willChange = 'auto'; // clear after the one-shot
        }
      });
      col.style.willChange = 'transform';
      idx = target;
      return idx;
    }

    // fonts can change the row height after create — re-clamp the window once ready
    if (doc.fonts && doc.fonts.ready && doc.fonts.ready.then) {
      doc.fonts.ready.then(function () { syncWindow(); place(idx); });
    }

    stage.classList.add('nor-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}

    return {
      el: stage, col: col, values: values,
      get value() { return values[idx]; },
      get index() { return idx; },
      set: set,
      to: to,
      reflow: function () { syncWindow(); place(idx); }, // re-measure after a resize/font swap
      destroy: function () {
        if (activeTween && activeTween.kill) activeTween.kill();
        col.style.transform = '';
        col.style.willChange = 'auto';
        if (windowEl) windowEl.style.height = '';
        stage.classList.remove('nor-ready');
      }
    };
  }

  var api = { create: create };
  global.NumeralOdometerRoll = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
