/* ============================================================
   REACH-RIBBON · component.js   (vanilla SVG + GSAP, NO WebGL)
   ------------------------------------------------------------
   Coverage, not distance. One soft organic RIBBON (the walking-reach isochrone) is drawn on an
   illustrated map: its outline strokes in, a warm fill floods it, and every daily place INSIDE the
   shape lights warm while the one or two just OUTSIDE stay faint with a "+N хв" note. The felt
   message lands at a glance: look how much life fits inside ten minutes. A 5/10-minute toggle grows
   the ribbon (more places light); hover a place to emphasise it.

   The distinct device of the illustrated-map family: district-radiates draws LINES, minutes-bloom
   COUNTS, zoom-to-the-door changes SCALE; this one is about AREA / what is reachable.

   STANDALONE illustrated map (no LocMap). In production the ribbon is a real isochrone (the walking
   reach from the smarts/OSM routing bake); here it is hand-authored as two organic blob paths.

   FIDELITY: places are DOM nodes positioned from their viewBox coord via getScreenCTM, and the
   inside/outside test uses the live ribbon polygon, so the lighting is geometrically honest.
   FIT: preserveAspectRatio "slice" fills the stage (desktop, >940px) and keeps the home + dots
   round; but slice CROPS the periphery, and below the 940px grid breakpoint the stage gets wider
   than the viewBox so slice would clip the south lobe + the farthest pins (gym/post) right off the
   visible stage. Since the "+N хв outside" proof is half the argument, no pin may vanish -> the
   component swaps to "meet" (letterbox, nothing cropped) at <=940px. CTM stays isotropic in both,
   so dots + the home stay round either way.

   LAWS: SVG / transform / opacity / stroke-dashoffset only. NO canvas, NO WebGL, NO tiles, NO
   mix-blend, NO backdrop-filter. reduced-motion -> the final reached state, no draw/flood. __LAB_OK__.

   ReachRibbon.create(target, { reach: 10, reveal })
   Returns { root, setReach(min), highlight(id,on), relayout(), destroy }.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  var gsap = global.gsap;

  function create(target, options) {
    options = options || {};
    var root = !target ? null : (typeof target === 'string' ? doc.querySelector(target) : target);
    if (!root) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }
    var REDUCED = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var svg = root.querySelector('.rr-map');
    var stage = root.querySelector('.rr-stage') || (svg && svg.parentNode);
    var ribbons = {};   // min -> { path, len }
    [].slice.call(svg ? svg.querySelectorAll('[data-ribbon]') : []).forEach(function (p) {
      var m = +p.getAttribute('data-ribbon'); ribbons[m] = { path: p, len: p.getTotalLength ? p.getTotalLength() : 0 };
    });
    var reaches = Object.keys(ribbons).map(Number).sort(function (a, b) { return a - b; });

    var pois = [].slice.call(root.querySelectorAll('[data-poi]'));
    var rows = [].slice.call(root.querySelectorAll('[data-rr-row]'));
    var countEl = root.querySelector('[data-rr-count]');
    var toggleEl = root.querySelector('[data-rr-toggle]');

    var anchor = svg && svg.querySelector('[data-home-anchor]');
    var HX = anchor ? +anchor.getAttribute('data-cx') : 500;
    var HY = anchor ? +anchor.getAttribute('data-cy') : 400;

    // ---- fit mode: 'slice' fills the stage but crops the periphery; below the 940px grid
    // breakpoint the stage gets wider-than-the-viewBox, so 'slice' clips the south lobe + the
    // farthest pins (gym/post) right off the visible stage -- and the "+N хв outside" contrast is
    // half the argument, so no proof-pin may vanish. Switch to 'meet' (letterbox, nothing cropped)
    // under <=940px; CTM is isotropic in both modes so dots + the home stay round either way.
    var fitMQ = global.matchMedia ? global.matchMedia('(max-width: 940px)') : null;
    function applyFit() {
      if (!svg) return;
      var meet = fitMQ ? fitMQ.matches : false;
      svg.setAttribute('preserveAspectRatio', meet ? 'xMidYMid meet' : 'xMidYMid slice');
    }
    applyFit();

    // ---- geometry: is a POI inside a ribbon path? (point-in-polygon on sampled outline) ----
    function polyOf(min) {
      var r = ribbons[min]; if (!r) return [];
      var n = 120, len = r.path.getTotalLength(), pts = [];
      for (var i = 0; i < n; i++) { var pt = r.path.getPointAtLength(i / n * len); pts.push([pt.x, pt.y]); }
      return pts;
    }
    function inside(poly, x, y) {
      var c = false;
      for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c;
      }
      return c;
    }

    var cur = reaches.length ? reaches[reaches.length - 1] : 10;
    var place = pois.map(function (el) {
      return { id: el.getAttribute('data-poi'), x: +el.getAttribute('data-tx'), y: +el.getAttribute('data-ty'),
        min: +el.getAttribute('data-min'), name: el.getAttribute('data-name'), node: el };
    });

    // ---- DOM positioning via CTM (dots land on their viewBox coord; never clipped) ----
    var _pt = svg && svg.createSVGPoint ? svg.createSVGPoint() : null;
    function relayout() {
      if (!svg || !_pt) return; var ctm = svg.getScreenCTM(); if (!ctm) return;
      var srect = stage.getBoundingClientRect();
      place.forEach(function (p) { _pt.x = p.x; _pt.y = p.y; var s = _pt.matrixTransform(ctm);
        p.node.style.left = (s.x - srect.left) + 'px'; p.node.style.top = (s.y - srect.top) + 'px'; });
    }

    // ---- apply a reach: light places inside, dim those outside, update count + ribbon ----
    function applyReach(min, animate) {
      cur = min;
      var poly = polyOf(min);
      var inN = 0;
      place.forEach(function (p) {
        var isIn = inside(poly, p.x, p.y);
        p.in = isIn; if (isIn) inN++;
        p.node.classList.toggle('is-in', isIn);
        p.node.classList.toggle('is-out', !isIn);
        // drive the "+N хв" convention from the LIVE state: inside = "N хв", outside = "+N хв"
        var x = p.node.querySelector('.lbl .x'); if (x) x.textContent = (isIn ? '' : '+') + p.min + ' хв';
        var row = rows.filter(function (r) { return r.getAttribute('data-rr-row') === p.id; })[0];
        if (row) { row.classList.toggle('is-in', isIn); row.classList.toggle('is-out', !isIn);
          var tm = row.querySelector('.tm'); if (tm) tm.textContent = (isIn ? '' : '+') + p.min + ' хв'; }
      });
      if (countEl) countEl.textContent = inN;
      // show only the active ribbon
      reaches.forEach(function (m) {
        var r = ribbons[m]; var on = m === min;
        r.path.classList.toggle('is-on', on);
        if (!on) { r.path.style.opacity = 0; }
      });
      drawRibbon(min, animate);
      if (toggleEl) toggleEl.querySelectorAll('button').forEach(function (b) {
        var on = +b.dataset.min === min; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
    }

    var drawnReach = -1;
    function drawRibbon(min, animate) {
      var r = ribbons[min]; if (!r || !gsap) { if (r) r.path.style.opacity = 1; return; }
      if (!animate || REDUCED) { gsap.set(r.path, { strokeDashoffset: 0, opacity: 1, fillOpacity: 1 }); return; }
      // outline strokes in, then the warm fill floods (one path -> cheap; the map is light)
      gsap.set(r.path, { strokeDasharray: r.len, strokeDashoffset: r.len, opacity: 1, fillOpacity: 0 });
      var tl = gsap.timeline();
      tl.to(r.path, { strokeDashoffset: 0, duration: 1.0, ease: 'power2.inOut' }, 0)
        .to(r.path, { fillOpacity: 1, duration: 0.7, ease: 'power1.out' }, 0.55)
        .add(function () { lightInsideStaggered(min); }, 0.5);
    }
    function lightInsideStaggered(min) {
      if (!gsap) return;
      var ins = place.filter(function (p) { return p.in; }).sort(function (a, b) {
        return Math.hypot(a.x - HX, a.y - HY) - Math.hypot(b.x - HX, b.y - HY);
      });
      ins.forEach(function (p, i) { gsap.fromTo(p.node, { opacity: 0.25 }, { opacity: 1, duration: 0.4, ease: 'power2.out', delay: i * 0.08 }); });
    }

    // hover sync (row <-> poi)
    function highlight(id, on) {
      root.querySelectorAll('[data-poi="' + id + '"],[data-rr-row="' + id + '"]').forEach(function (e) { e.classList.toggle('is-hot', on); });
    }
    pois.concat(rows).forEach(function (e) {
      var id = e.getAttribute('data-poi') || e.getAttribute('data-rr-row');
      var on = function () { highlight(id, true); }, off = function () { highlight(id, false); };
      e.addEventListener('mouseenter', on); e.addEventListener('mouseleave', off);
      e.addEventListener('focus', on); e.addEventListener('blur', off);
      e._rr = [on, off];
    });

    // reach toggle (5 / 10)
    var toggleClick = null;
    if (toggleEl) { toggleClick = function (ev) {
      var b = ev.target.closest('button[data-min]'); if (!b) return; applyReach(+b.dataset.min, true);
    }; toggleEl.addEventListener('click', toggleClick); }

    var onResize = function () { applyFit(); relayout(); };
    global.addEventListener && global.addEventListener('resize', onResize);
    // also react to crossing the breakpoint (covers DevTools / orientation changes without a resize event)
    if (fitMQ) { if (fitMQ.addEventListener) fitMQ.addEventListener('change', onResize); else if (fitMQ.addListener) fitMQ.addListener(onResize); }

    // birth
    relayout();
    function start() { root.classList.add('is-reached'); applyReach(cur, !REDUCED); }
    if (REDUCED || !gsap || !global.ScrollTrigger) { root.classList.add('is-reached'); applyReach(cur, false); }
    else {
      var started = false;
      global.ScrollTrigger.create({ trigger: root, start: (options.reveal && options.reveal.start) || 'top 70%', once: true,
        onEnter: function () { if (!started) { started = true; start(); } }, onRefresh: function () { applyFit(); relayout(); } });
      requestAnimationFrame(function () { var rb = root.getBoundingClientRect(); if (!started && rb.top < global.innerHeight * 0.5) { started = true; start(); } });
    }

    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      root: root, relayout: relayout,
      setReach: function (m) { applyReach(m, true); },
      highlight: highlight,
      destroy: function () {
        global.removeEventListener && global.removeEventListener('resize', onResize);
        if (fitMQ) { if (fitMQ.removeEventListener) fitMQ.removeEventListener('change', onResize); else if (fitMQ.removeListener) fitMQ.removeListener(onResize); }
        if (toggleEl && toggleClick) toggleEl.removeEventListener('click', toggleClick);
        pois.concat(rows).forEach(function (e) { if (e._rr) { e.removeEventListener('mouseenter', e._rr[0]); e.removeEventListener('mouseleave', e._rr[1]); e.removeEventListener('focus', e._rr[0]); e.removeEventListener('blur', e._rr[1]); } });
      }
    };
  }

  var api = { create: create };
  global.ReachRibbon = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
