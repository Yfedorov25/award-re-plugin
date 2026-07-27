/* ============================================================
   DAYNIGHT-CENTER-SEAM · component.js   (V5 — the SAISEI centre-seam dialect)
   ------------------------------------------------------------
   A variation of the day↔night CANON (window.DayNight). The canon's "seam" reveal peels
   the night from ONE edge; this composite parts the frame from the CENTRE — a vertical
   centre line opens outward and the EVENING render is revealed in the widening centre gap.
   The Saisei centre-seam split, applied to the day/night pair.

   The canon's single-edge seam cannot do a SYMMETRIC double-clip, so V5 supplies its OWN
   reveal: it builds the canon in mode:"manual", reveal:"opacity" (so the canon stacks day +
   night for us and hands us .dn__night), then OVERRIDES the night layer's clip-path on each t
   with a centre-parting inset:
       night.clipPath = inset(0  (1-t)*50%  0  (1-t)*50%)
   so at t=0 the night is a hairline at the centre (inset 50% on both sides) and at t=1 it is
   full (inset 0). The evening is born at the centre and grows outward to both edges. A 2px
   centre seam line sits on the parting and fades as the gap opens.

       set(t)  — PURE: 0 = day (centre closed), 1 = evening (fully revealed).

   ENGINE LAWS (inherited): opacity / clip-path / transform / gradient only. NO WebGL,
   NO mix-blend, NO backdrop-filter, NO canvas drawImage. prefers-reduced-motion -> static.
   Requires the canon loaded first (../daynight-engine/component.js -> window.DayNight).
   Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function create(target, options) {
    options = options || {};
    var host = !target ? doc.body : (typeof target === 'string' ? doc.querySelector(target) : target);
    var DayNight = global.DayNight;
    if (!host || !DayNight) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target or canon not loaded' }; }

    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- drive the CANON in manual + opacity: it stacks day + night and gives us .dn__night.
    //     We do NOT use the canon's reveal; we override the night clip-path on each t below. ---
    var dn = DayNight.create(host, {
      dayMedia: options.dayMedia,
      nightMedia: options.nightMedia,
      mode: 'manual',
      reveal: 'opacity',
      labels: options.labels || ['Вдень', 'Ввечері']     // corner tags via the canon
    });

    var nightLayer = dn.root.querySelector('.dn__night');
    if (nightLayer) {
      nightLayer.style.opacity = '1';                    // night fully painted; the clip-path reveals it
      nightLayer.style.willChange = 'clip-path';
    }

    // --- the 2px centre seam line that rides the parting and fades as the gap opens ---
    var seamEl = doc.createElement('i');
    seamEl.className = 'dncenter__seam';
    dn.root.appendChild(seamEl);

    // --- the single reveal: centre-parting inset on the night layer ---
    var t = 0;
    function setT(v) {
      t = clamp(v, 0, 1);
      var side = ((1 - t) * 50).toFixed(3) + '%';        // 50% closed (hairline) -> 0% open (full)
      if (nightLayer) {
        var cp = 'inset(0 ' + side + ' 0 ' + side + ')';
        nightLayer.style.clipPath = cp;
        nightLayer.style.webkitClipPath = cp;
      }
      // seam sits on the parting (centre) and fades from solid (closed) to gone (open)
      seamEl.style.opacity = (1 - t).toFixed(3);
      if (options.onUpdate) options.onUpdate(t);
    }

    if (reduced) { setT(1); }                            // static end state: evening fully revealed
    else { setT(0); }                                    // start closed (pure day)

    try { global.__LAB_OK__ = true; } catch (e) {}

    return {
      root: dn.root,
      dn: dn,                                            // the underlying canon instance
      set: setT,                                         // PURE: 0 = day .. 1 = evening (centre-parting)
      get: function () { return t; },
      destroy: function () {
        if (seamEl && seamEl.parentNode) seamEl.parentNode.removeChild(seamEl);
        dn.destroy();
      }
    };
  }

  var api = { create: create };
  global.DayNightCenterSeam = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
