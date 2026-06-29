/* ============================================================
   DAYNIGHT-CURSOR-SEAM · component.js   (V3 — the SMARTS dialect)
   ------------------------------------------------------------
   A variation of the day↔night CANON (window.DayNight). It does NOT re-implement the
   reveal — it LOADS the canon and drives its cursor + seam path, then dresses it in the
   Smarts chrome (the ⇆ grip on the seam, "День"/"Вечір" corner tags, and a fading curtain
   hint). Move the mouse across the card and a vertical splitline wipes the evening in from
   the right; the round ⇆ handle rides the seam. On touch, drag the handle.

   Harvested 1:1 from apps/smarts/src/js/sections/interiors.js (the «ШТОРА день↔вечір»):
     const sp={v:55}; main.style.setProperty("--split", sp.v+"%");
     vTo = gsap.quickTo(sp,"v",{duration:0.5,ease:"power3.out"});
     moveSplit = clientX => vTo(clamp 6..94 of ((clientX-left)/width)*100);
     mousemove / touchmove -> moveSplit ; mouseleave -> vTo(55)
     hint fades after the first move.
   The canon's "cursor"+"seam" driver IS this (quickTo follow + clamp + reset-to-rest),
   so V3 = canon(mode:"cursor", reveal:"seam", seamAxis:"x", seamFrom:"right", ease:0.5,
   rest:0.45, labels:["День","Вечір"]) PLUS the fading hint. rest:0.45 ≈ Smarts' 55% split
   resting feel (cursor at left = day; at right = evening, so rest 0.45 sits the seam a touch
   past centre, like 55%).

   ENGINE LAWS (inherited): opacity / clip-path / transform / gradient only. NO WebGL,
   NO mix-blend, NO backdrop-filter. prefers-reduced-motion → static, driver disarmed.
   Requires the canon loaded first (../daynight-engine/component.js → window.DayNight).
   Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var host = !target ? doc.body : (typeof target === 'string' ? doc.querySelector(target) : target);
    var DayNight = global.DayNight;
    if (!host || !DayNight) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target or canon not loaded' }; }

    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- drive the CANON: cursor driver + seam reveal (the Smarts dialect) ---
    var dn = DayNight.create(host, {
      dayMedia: options.dayMedia,
      nightMedia: options.nightMedia,
      mode: 'cursor',
      reveal: 'seam',
      seamAxis: 'x',
      seamFrom: 'left',           // seam sits AT the cursor; sweeping left->right reveals the
                                  // evening following the cursor (the Smarts before/after curtain)
      ease: options.ease != null ? options.ease : 0.5,   // gsap.quickTo 0.5s power3.out
      rest: options.rest != null ? options.rest : 0.55,  // relax to a ~55% seam on leave
      labels: options.labels || ['День', 'Вечір']        // corner tags via the canon
    });

    // --- the fading curtain hint (Smarts: «проведіть, щоб настав вечір») ---
    var hintEl = null, hinted = false, hideTimer = null;
    var hintText = options.hint != null ? options.hint : 'Проведіть, щоб настав вечір';
    if (hintText) {
      hintEl = doc.createElement('span');
      hintEl.className = 'dncs__hint';
      hintEl.textContent = hintText;
      (dn.root || host).appendChild(hintEl);
      if (reduced) { hintEl.style.opacity = '0'; }   // no movement to invite → hide it
    }
    function hideHint() {
      if (hinted || !hintEl) return;
      hinted = true;
      hintEl.classList.add('is-gone');               // CSS opacity transition (chrome, not scroll)
    }
    var moveListeners = [];
    function onceMove(node, ev, fn) {
      var wrapped = function (e) { node.removeEventListener(ev, wrapped); fn(e); };
      node.addEventListener(ev, wrapped, { passive: true });
      moveListeners.push([node, ev, wrapped]);
    }
    if (hintEl && !reduced) {
      // first real move on the stage fades the hint (Smarts used a 1.5s delay; keep it gentle)
      onceMove(dn.root || host, 'mousemove', function () { hideTimer = global.setTimeout(hideHint, 1200); });
      onceMove(dn.root || host, 'touchmove', function () { hideTimer = global.setTimeout(hideHint, 1200); });
    }

    try { global.__LAB_OK__ = true; } catch (e) {}

    return {
      root: dn.root,
      dn: dn,                                    // the underlying canon instance (set/get/...)
      set: dn.set,                               // PURE: 0=day .. 1=evening
      get: dn.get,
      hideHint: hideHint,
      resetHint: function () {                   // lab "replay" affordance
        if (!hintEl) return;
        hinted = false; hintEl.classList.remove('is-gone');
      },
      destroy: function () {
        if (hideTimer) global.clearTimeout(hideTimer);
        moveListeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2]); });
        moveListeners = [];
        if (hintEl && hintEl.parentNode) hintEl.parentNode.removeChild(hintEl);
        dn.destroy();
      }
    };
  }

  var api = { create: create };
  global.DayNightCursorSeam = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
