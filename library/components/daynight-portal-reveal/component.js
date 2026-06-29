/* ============================================================
   DAYNIGHT-PORTAL-REVEAL · component.js   (V9 — portal bloom from a click)
   ------------------------------------------------------------
   A variation of the day<->night CANON (window.DayNight). It does NOT re-implement the
   reveal — it LOADS the canon and drives its "portal" reveal (night clip-path =
   circle(t*145% at portalOrigin)), then turns it into a HANDS-ON moment: the evening
   blooms outward in a growing circle from the exact point the visitor touches. Touch the
   lit window (the pulsing hotspot invites the first touch); tap elsewhere and the night
   blooms from there instead; tap again to bloom the day back.

   The canon already paints reveal:"portal" 1:1 (clip-path circle from portalOrigin). The
   canon reads opt.portalOrigin at apply() time, so to RETARGET the origin per click we
   re-create the canon with the new portalOrigin (destroy+create is cheap, one <img> pair)
   while preserving the current direction (day->night or night->day). The bloom itself is a
   gsap tween of t 0..1 if GSAP is present, else a built-in rAF lerp.

   DAYNIGHT-PORTAL-REVEAL.create(target, {
     dayMedia,            // url | selector | element  (frame-matched day still)
     nightMedia,          // url | selector | element  (frame-matched night still, same frame)
     origin: '60% 62%',   // default hotspot / first-bloom centre (over a lit window)
     duration: 1.5,       // bloom seconds
     hotspot: true,       // pulsing dot at the default origin inviting the first touch
     labels: ['День','Вечір']
   })
   Returns { root, dn, bloomAt(xPct,yPct), reset, get(), destroy }.
     bloomAt(xPct,yPct) — re-centre the portal at (x%,y%) and bloom the OPPOSITE state in.
     reset()            — bloom the day back from the default origin.

   ENGINE LAWS (inherited): opacity / clip-path / transform / gradient only. NO WebGL,
   NO mix-blend, NO backdrop-filter, NO canvas drawImage. prefers-reduced-motion -> static
   night end state, no bloom, hotspot hidden. Requires the canon loaded first
   (../daynight-engine/component.js -> window.DayNight). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var host = !target ? doc.body : (typeof target === 'string' ? doc.querySelector(target) : target);
    var DayNight = global.DayNight;
    if (!host || !DayNight || typeof DayNight.create !== 'function') {
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { error: 'no target or canon (window.DayNight) not loaded first' };
    }

    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gsap = global.gsap;

    var dayMedia = options.dayMedia;
    var nightMedia = options.nightMedia;
    var origin = options.origin || '60% 62%';        // default hotspot, over a lit window
    var duration = options.duration != null ? options.duration : 1.5;
    var wantHotspot = options.hotspot !== false;
    var labels = (options.labels && options.labels.length === 2) ? options.labels : ['День', 'Вечір'];

    // --- 1) the CANON: manual driver + portal reveal, centred at the default origin ---
    function buildCanon(portalOrigin) {
      return DayNight.create(host, {
        dayMedia: dayMedia,
        nightMedia: nightMedia,
        mode: 'manual',
        reveal: 'portal',
        portalOrigin: portalOrigin,
        labels: labels
      });
    }
    var dn = buildCanon(origin);
    var curOrigin = origin;
    var t = 0;                 // mirror of the canon t so we can preserve state across re-create

    // --- 2) the pulsing hotspot dot inviting the FIRST touch (hides after use) ---
    var hotEl = null;
    function mountHotspot() {
      if (!wantHotspot || reduced) return;
      hotEl = doc.createElement('button');
      hotEl.type = 'button';
      hotEl.className = 'dnpr__hotspot';
      hotEl.setAttribute('aria-label', 'Увімкнути вечір');
      hotEl.style.left = curOrigin.split(' ')[0];
      hotEl.style.top = curOrigin.split(' ')[1] || '50%';
      (dn.root || host).appendChild(hotEl);
    }
    function hideHotspot() {
      if (!hotEl) return;
      hotEl.classList.add('is-gone');
      var el = hotEl; hotEl = null;
      global.setTimeout(function () { if (el && el.parentNode) el.parentNode.removeChild(el); }, 600);
    }
    mountHotspot();

    if (reduced) {
      // static night end state, no bloom, no hotspot (the canon already statics; ensure t=1)
      dn.set(1); t = 1;
    }

    // --- 3) the bloom: tween t 0<->1 from the (possibly new) origin ---
    var tween = null;
    function killTween() { if (tween) { tween.kill ? tween.kill() : (tween.cancelled = true); tween = null; } }

    function tweenTo(to, onDone) {
      killTween();
      if (reduced) { dn.set(to); t = to; if (onDone) onDone(); return; }
      if (gsap) {
        var o = { v: t };
        tween = gsap.to(o, {
          v: to, duration: duration, ease: 'power2.inOut',
          onUpdate: function () { dn.set(o.v); t = o.v; },
          onComplete: function () { t = to; tween = null; if (onDone) onDone(); }
        });
      } else {
        // built-in rAF lerp fallback (no GSAP)
        var raf = null, state = { cancelled: false };
        tween = state;
        (function tick() {
          if (state.cancelled) return;
          var d = to - t;
          if (Math.abs(d) < 0.004) { dn.set(to); t = to; tween = null; if (onDone) onDone(); return; }
          t += d * 0.10; dn.set(t);
          raf = global.requestAnimationFrame(tick);
        })();
      }
    }

    // re-centre the portal at a new origin, preserving the CURRENT t, then bloom the opposite state.
    function bloomAt(xPct, yPct, opts) {
      opts = opts || {};
      var newOrigin = xPct + '% ' + yPct + '%';
      hideHotspot();
      // re-create the canon with the new origin so circle() blooms from the touched point,
      // carrying the current t across (destroy + create is cheap: one frame-matched <img> pair).
      killTween();
      dn.destroy();
      dn = buildCanon(newOrigin);
      curOrigin = newOrigin;
      dn.set(t);                         // restore the live state at the new centre (no jump)
      var to = (opts.to != null) ? opts.to : (t < 0.5 ? 1 : 0);   // bloom the OPPOSITE in
      tweenTo(to);
      return to;
    }

    // --- 4) click / tap anywhere on the stage blooms from there ---
    var listeners = [];
    function on(node, ev, fn, o) { node.addEventListener(ev, fn, o); listeners.push([node, ev, fn, o]); }

    function pointAt(clientX, clientY) {
      var r = (dn.root || host).getBoundingClientRect();
      var x = ((clientX - r.left) / r.width) * 100;
      var y = ((clientY - r.top) / r.height) * 100;
      return [Math.max(0, Math.min(100, x)).toFixed(2), Math.max(0, Math.min(100, y)).toFixed(2)];
    }

    if (!reduced) {
      on(host, 'click', function (e) {
        // ignore clicks on the hotspot button itself bubbling twice — it lives in the stage,
        // its own coords are fine to bloom from (it IS the lit window).
        var p = pointAt(e.clientX, e.clientY);
        bloomAt(p[0], p[1]);
      });
    }

    function reset() {
      // bloom the DAY back from the default origin
      hideHotspot();
      bloomAt(parseFloat(origin), parseFloat(origin.split(' ')[1] || '50'), { to: 0 });
      // bloomAt above re-centres to the default origin and tweens to day
    }

    function destroy() {
      killTween();
      listeners.forEach(function (l) { l[0].removeEventListener(l[1], l[2], l[3]); });
      listeners = [];
      if (hotEl && hotEl.parentNode) hotEl.parentNode.removeChild(hotEl);
      if (dn && dn.destroy) dn.destroy();
    }

    try { global.__LAB_OK__ = true; } catch (e) {}

    return {
      root: dn.root,
      get dn() { return dn; },             // the underlying canon instance (re-created per bloom)
      bloomAt: function (x, y) { return bloomAt(x, y); },
      reset: reset,
      get: function () { return t; },
      destroy: destroy
    };
  }

  var api = { create: create };
  global.DayNightPortalReveal = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
