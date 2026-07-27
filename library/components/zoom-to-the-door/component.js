/* ============================================================
   ZOOM-TO-THE-DOOR · component.js   (vanilla SVG + GSAP ScrollTrigger, NO WebGL)
   ------------------------------------------------------------
   A three-act scroll cinema that DIVES from the region to your front gate. As you scroll the pinned
   section, three hand-illustrated frames MATCH-CUT through a shared focal point (the village dot ->
   the home -> the parcel, all authored at viewBox 500,300): the OUTGOING act scales up and out, the
   INCOMING act starts small and settles, so it reads as ONE continuous zoom, not three fades.
     ACT 1 МІСТО    — a sparse regional schematic. "12 хв до міста."
     ACT 2 РАЙОН    — the illustrated district. "4 щоденних місця пішки."
     ACT 3 ДІЛЯНКА  — the plot: a hatched parcel with dimension lines. "Ваша адреса."
   Each act warms in palette; a breadcrumb rail tracks + jumps the acts.

   PERF: separate light SVG layers cross-dissolved by opacity + scale (GPU-composited) — NOT a
   viewBox tween over a dense map. Each act is sparse, so the dissolve repaints little (0% jank @4x).

   STANDALONE illustrated map (no LocMap). In production the geometry comes from the SAME real-OSM
   bake as the smarts map (region / highway / district / parcel), drawn light.

   LAWS: SVG / transform / opacity / stroke-dashoffset only. NO canvas, NO WebGL, NO tiles, NO
   mix-blend, NO backdrop-filter. reduced-motion / mobile -> the three acts stacked as paired cards.
   __LAB_OK__.

   ZoomToTheDoor.create(target, { scrub, end })
   Returns { root, set(actIndex 0..2 [, local]), act(), destroy }.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  var gsap = global.gsap;
  var ST = global.ScrollTrigger;

  function create(target, options) {
    options = options || {};
    var root = !target ? null : (typeof target === 'string' ? doc.querySelector(target) : target);
    if (!root) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }
    var REDUCED = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var cards = [].slice.call(root.querySelectorAll('[data-card]'));
    var acts = cards.map(function (c) { return c.querySelector('[data-act]'); });
    var caps = cards.map(function (c) { return c.querySelector('[data-cap]'); });
    var railEl = root.querySelector('[data-ztd-rail]');
    var N = acts.length || 3;

    var drawsByAct = acts.map(function (a) { return [].slice.call(a.querySelectorAll('[data-draw]')); });

    // rail dots
    var railDots = [];
    function buildRail() {
      if (!railEl) return; railEl.innerHTML = ''; railDots = [];
      var labels = ['Місто', 'Район', 'Ділянка'];
      acts.forEach(function (a, i) {
        var b = doc.createElement('button'); b.type = 'button'; b.className = 'ztd-rail__dot'; b.dataset.i = i;
        b.innerHTML = '<span class="d"></span><span class="l">' + (labels[i] || ('Акт ' + (i + 1))) + '</span>';
        b.setAttribute('aria-label', 'Масштаб: ' + (labels[i] || ''));
        railEl.appendChild(b); railDots.push(b);
      });
    }
    buildRail();

    // ---- draws: re-armable so each act re-draws whenever it is (re-)entered, fwd OR back ----
    var armed = acts.map(function () { return false; });
    function armAct(i) {
      if (!gsap || armed[i]) return; armed[i] = true;
      drawsByAct[i].forEach(function (el) {
        if (el.getTotalLength) { var l = el.getTotalLength(); gsap.set(el, { strokeDasharray: l, strokeDashoffset: l }); }
        else gsap.set(el, { opacity: 0 });
      });
    }
    function drawAct(i) {
      if (!gsap || !armed[i]) return; armed[i] = false;   // consume the armed state -> draw once
      drawsByAct[i].forEach(function (el, k) {
        if (el.getTotalLength) gsap.to(el, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out', delay: k * 0.05, overwrite: true });
        else gsap.to(el, { opacity: 1, duration: 0.6, ease: 'power2.out', delay: k * 0.05, overwrite: true });
      });
    }

    var lastActive = -1;
    // render the dive at global position p (0..N-1). The focal point is shared, so we scale the
    // OUTGOING act up (zooming past the viewer) and bring the INCOMING act in from small.
    function render(p) {
      p = Math.max(0, Math.min(N - 1, p));
      var active = Math.round(p);
      acts.forEach(function (a, i) {
        var d = p - i;                 // >0 means act i is BEHIND us (passed), <0 ahead (incoming)
        var ad = Math.abs(d);
        var op = ad >= 1 ? 0 : 1 - ad; // cross-dissolve between the two neighbours
        var dc = Math.max(-1, Math.min(1, d));   // clamp so far acts (hidden) don't flip scale
        // dive scale: a passed act (dc>0) blows UP and out (1 -> ~2.6); an incoming act (dc<0)
        // comes IN from small (~0.45 -> 1). Both pivot on the shared focal point -> a real zoom.
        var sc = dc >= 0 ? 1 + dc * 1.6 : 1 + dc * 0.55;   // dc in [-1..1] -> sc ~ [0.45 .. 2.6]
        if (gsap) gsap.set(a, { opacity: op, scale: sc, transformOrigin: '50% 50%' });
        else { a.style.opacity = op; a.style.transform = 'scale(' + sc + ')'; }
        a.style.pointerEvents = (i === active) ? 'auto' : 'none';
      });
      // captions: simple cross-fade, no scale (kept legible); slight y to avoid ghost overlap
      caps.forEach(function (c, i) {
        var ad = Math.abs(p - i);
        var op = ad >= 0.5 ? 0 : 1 - ad / 0.5;
        if (gsap) gsap.set(c, { opacity: op, y: (i - p) * 16 }); else c.style.opacity = op;
        c.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
      });
      setActiveRail(active);
      root.setAttribute('data-ztd-act', active);
      if (active !== lastActive) {
        // re-arm the act we LEFT (so it re-draws next time), draw the act we ARRIVED at
        if (lastActive >= 0) armAct(lastActive);
        drawAct(active);
        lastActive = active;
      }
    }
    function setActiveRail(i) { railDots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); }); }

    // ---- static (mobile / reduced-motion): paired cards, every act + caption visible ----
    function renderStatic() {
      root.classList.add('ztd-static');
      acts.forEach(function (a, i) { a.style.opacity = 1; a.style.transform = 'none'; a.style.pointerEvents = 'auto';
        drawsByAct[i].forEach(function (el) { if (gsap) { if (el.getTotalLength) gsap.set(el, { strokeDashoffset: 0 }); else gsap.set(el, { opacity: 1 }); } }); });
      caps.forEach(function (c) { c.style.opacity = 1; c.style.transform = 'none'; });
    }

    // map raw scroll 0..1 -> act position with a DWELL on each act + a transition between
    function scrollToActPos(s) {
      var hold = 0.5 / N, trans = (1 - hold * N) / (N - 1), x = 0;
      for (var i = 0; i < N; i++) {
        if (s <= x + hold) return i; x += hold;
        if (i < N - 1) { if (s <= x + trans) return i + (s - x) / trans; x += trans; }
      }
      return N - 1;
    }

    var st = null, mm = null, railClick = null;
    function buildScrub() {
      acts.forEach(function (a, i) { armed[i] = false; armAct(i); });  // arm all, draw on arrival
      lastActive = -1;
      st = ST.create({
        trigger: root, start: 'top top', end: options.end || '+=' + (N * 115) + '%',
        pin: true, scrub: options.scrub != null ? options.scrub : 0.7,
        onUpdate: function (self) { render(scrollToActPos(self.progress)); }
      });
      render(0);
    }

    if (REDUCED || !gsap || !ST) {
      renderStatic();
    } else {
      mm = gsap.matchMedia();
      mm.add('(min-width: 880px)', function () { root.classList.remove('ztd-static'); buildScrub(); return function () { if (st) { st.kill(); st = null; } }; });
      mm.add('(max-width: 879px)', function () { renderStatic(); return function () { root.classList.remove('ztd-static'); }; });
      if (railEl) { railClick = function (e) {
        var b = e.target.closest('.ztd-rail__dot'); if (!b || !st || !global.scrollTo) return;
        var i = +b.dataset.i, hold = 0.5 / N, trans = (1 - hold * N) / (N - 1);
        var frac = i * (hold + trans) + hold * 0.5;   // centre of act i's dwell
        gsap.to(global, { scrollTo: st.start + (st.end - st.start) * frac, duration: 0.7, ease: 'power2.inOut' });
      }; railEl.addEventListener('click', railClick); }
    }

    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      root: root,
      set: function (i, local) { render(i + (local || 0)); },
      act: function () { return +(root.getAttribute('data-ztd-act') || 0); },
      destroy: function () {
        if (st) st.kill(); if (mm) mm.revert();
        if (railEl && railClick) railEl.removeEventListener('click', railClick);
        if (railEl) railEl.innerHTML = '';
        root.classList.remove('ztd-static'); root.removeAttribute('data-ztd-act');
      }
    };
  }

  var api = { create: create };
  global.ZoomToTheDoor = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
