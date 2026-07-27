/* ============================================================
   MINUTES-BLOOM · component.js   (vanilla SVG + GSAP ScrollTrigger, NO WebGL)
   ------------------------------------------------------------
   Time is the hero, the map is a quiet backdrop. On desktop a pinned section steps through the
   daily places one at a time as you scroll: a HUGE editorial minute number counts up (0 -> N), the
   place name blooms, and on the faded illustrated map a single thin terracotta arc draws from the
   home to that place. The map never shouts; the felt distance is the number.

   STANDALONE illustrated map (no LocMap). In production the home + POI coords + real walk-minutes
   come from the SAME real-OSM bake as the smarts location map; here the geometry is hand-authored.

   FIDELITY (skeptic lessons): POI dots + labels are DOM nodes positioned by mapping each POI's
   viewBox coord through svg.getScreenCTM() — so they render OUTSIDE the slice-clipped SVG box and
   are NEVER cropped (the arc still lives in the SVG, to coords kept in a safe central band).
   preserveAspectRatio="slice" keeps circles round; matchMedia gives mobile + reduced-motion a
   static, fully-readable list (every place + its minutes), no pin/scrub.

   LAWS: SVG / transform / opacity / stroke-dashoffset only. NO canvas, NO WebGL, NO tiles, NO
   mix-blend, NO backdrop-filter. __LAB_OK__.

   MinutesBloom.create(target, { scrub, end })
   Returns { root, set(i), count(), relayout(), destroy }.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  var gsap = global.gsap;
  var ST = global.ScrollTrigger;
  var NS = 'http://www.w3.org/2000/svg';

  function create(target, options) {
    options = options || {};
    var root = !target ? null : (typeof target === 'string' ? doc.querySelector(target) : target);
    if (!root) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }
    var REDUCED = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var svg = root.querySelector('.mb-map');
    var stage = root.querySelector('.mb-stage') || (svg && svg.parentNode);
    var numEl = root.querySelector('[data-mb-num]');
    var nameEl = root.querySelector('[data-mb-name]');
    var unitEl = root.querySelector('[data-mb-unit]');
    var modeEl = root.querySelector('[data-mb-mode]');
    var leadEl = root.querySelector('[data-mb-lead]');
    var railEl = root.querySelector('[data-mb-rail]');
    var staticEl = root.querySelector('[data-mb-static]');

    var anchor = svg && svg.querySelector('[data-home-anchor]');
    var HX = anchor ? +anchor.getAttribute('data-cx') : 500;
    var HY = anchor ? +anchor.getAttribute('data-cy') : 420;

    var defPois = svg ? [].slice.call(svg.querySelectorAll('[data-poi]')) : [];
    var places = defPois.map(function (g) {
      return { id: g.getAttribute('data-poi'), tx: +g.getAttribute('data-tx'), ty: +g.getAttribute('data-ty'),
        min: +g.getAttribute('data-min'), name: g.getAttribute('data-name'), mode: g.getAttribute('data-mode') || 'пішки', node: g };
    });

    // the arc layer (lives in SVG; endpoint stays in the safe central band -> never clipped)
    var gArc = svg ? svg.querySelector('[data-mb-arc]') : null;
    var arc = doc.createElementNS(NS, 'path'); arc.setAttribute('class', 'mb-arc');
    var endDot = doc.createElementNS(NS, 'circle'); endDot.setAttribute('r', '5'); endDot.setAttribute('class', 'mb-arc__dot');
    if (gArc) { gArc.appendChild(arc); gArc.appendChild(endDot); }

    // DOM label nodes for each POI, positioned via CTM (never clipped by the slice box)
    var labels = {};
    places.forEach(function (p) {
      var d = doc.createElement('div'); d.className = 'mb-plabel'; d.dataset.id = p.id;
      d.innerHTML = '<span class="dot"></span><span class="t">' + p.name + '</span>';
      stage.appendChild(d); labels[p.id] = d;
    });

    // rail dots
    var railDots = [];
    function buildRail() {
      if (!railEl) return; railEl.innerHTML = ''; railDots = [];
      places.forEach(function (p, i) {
        var b = doc.createElement('button'); b.type = 'button'; b.className = 'mb-rail__dot'; b.dataset.i = i;
        b.setAttribute('aria-label', p.name + ', ' + p.min + ' хвилин ' + (p.mode === 'авто' ? 'автомобілем' : 'пішки'));
        railEl.appendChild(b); railDots.push(b);
      });
    }
    buildRail();

    function arcPath(p) {
      var dx = p.tx - HX, dy = p.ty - HY, dist = Math.hypot(dx, dy) || 1;
      var mx = (HX + p.tx) / 2, my = (HY + p.ty) / 2;
      var nx = -dy / dist, ny = dx / dist, bow = Math.min(36, dist * 0.12);
      return 'M' + HX + ' ' + HY + ' Q' + (mx + nx * bow) + ' ' + (my + ny * bow) + ' ' + p.tx + ' ' + p.ty;
    }

    var _pt = svg && svg.createSVGPoint ? svg.createSVGPoint() : null;
    function relayout() {
      if (!svg || !_pt) return;
      var ctm = svg.getScreenCTM(); if (!ctm) return;
      var srect = stage.getBoundingClientRect();
      places.forEach(function (p) {
        _pt.x = p.tx; _pt.y = p.ty; var sp = _pt.matrixTransform(ctm);
        var L = labels[p.id]; if (L) { L.style.left = (sp.x - srect.left) + 'px'; L.style.top = (sp.y - srect.top) + 'px'; }
      });
    }

    var cur = -1;
    function showStep(i, prog) {
      i = Math.max(0, Math.min(places.length - 1, i));
      var p = places[i];
      if (i !== cur) {
        cur = i;
        arc.setAttribute('d', arcPath(p)); arc.__len = arc.getTotalLength();
        endDot.setAttribute('cx', p.tx); endDot.setAttribute('cy', p.ty);
        if (nameEl) nameEl.textContent = p.name;
        if (unitEl) unitEl.textContent = 'хв';
        if (modeEl) modeEl.textContent = p.mode;
        places.forEach(function (q, k) { q.node.classList.toggle('is-active', k === i); var L = labels[q.id]; if (L) L.classList.toggle('is-active', k === i); });
        railDots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
      }
      var local = prog == null ? 1 : Math.max(0, Math.min(1, prog));
      if (numEl) numEl.textContent = Math.round(local * p.min);
      if (arc.__len != null) {
        var off = arc.__len * (1 - local);
        gsap ? gsap.set(arc, { strokeDasharray: arc.__len, strokeDashoffset: off }) : (arc.style.strokeDasharray = arc.__len, arc.style.strokeDashoffset = off);
      }
      endDot.style.opacity = local > 0.86 ? 1 : 0;
    }

    // ---- static state: a FULLY readable list of every place + minutes (mobile + reduced-motion) ----
    function renderStatic() {
      root.classList.add('mb-static');
      if (leadEl) leadEl.textContent = 'Кожне місце, що формує день, поряд з вашими дверима.';
      if (staticEl) {
        staticEl.innerHTML = places.map(function (p) {
          return '<li><span class="pn">' + p.name + '</span><span class="pm"><b>' + p.min + '</b> хв ' + (p.mode === 'авто' ? 'авто' : 'пішки') + '</span></li>';
        }).join('');
      }
      showStep(0, 1);
    }
    function clearStatic() { root.classList.remove('mb-static'); if (staticEl) staticEl.innerHTML = ''; }

    var st = null, mm = null, railClick = null;
    function buildScrub() {
      var N = places.length;
      relayout();
      st = ST.create({
        trigger: root, start: 'top top', end: options.end || '+=' + (N * 60) + '%',
        pin: true, scrub: options.scrub != null ? options.scrub : 0.6,
        onUpdate: function (self) {
          var t = self.progress * N, i = Math.min(N - 1, Math.floor(t)), local = t - i;
          showStep(i, Math.min(1, local / 0.8));
        },
        onRefresh: function () { relayout(); if (cur >= 0) { arc.setAttribute('d', arcPath(places[cur])); arc.__len = arc.getTotalLength(); } }
      });
      showStep(0, 0);
    }

    if (REDUCED || !gsap || !ST) {
      renderStatic();
    } else {
      mm = gsap.matchMedia();
      mm.add('(min-width: 940px)', function () { clearStatic(); buildScrub(); return function () { if (st) { st.kill(); st = null; } }; });
      mm.add('(max-width: 939px)', function () { renderStatic(); return function () { clearStatic(); }; });
      // rail jump -> settled point of the step (so the number matches the clicked label)
      if (railEl) { railClick = function (e) {
        var b = e.target.closest('.mb-rail__dot'); if (!b || !st || !global.scrollTo) return;
        var i = +b.dataset.i, N = places.length;
        var frac = (i + 0.78) / N;   // past the /0.8 settle -> the number shows its final value
        var tgt = st.start + (st.end - st.start) * frac;
        gsap.to(global, { scrollTo: tgt, duration: 0.7, ease: 'power2.inOut' });
      }; railEl.addEventListener('click', railClick); }
    }

    var onResize = function () { relayout(); };
    global.addEventListener && global.addEventListener('resize', onResize);

    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      root: root, relayout: relayout,
      set: function (i) { showStep(i, 1); },
      count: function () { return numEl ? numEl.textContent : null; },
      destroy: function () {
        if (st) st.kill(); if (mm) mm.revert();
        if (railEl && railClick) railEl.removeEventListener('click', railClick);
        global.removeEventListener && global.removeEventListener('resize', onResize);
        if (railEl) railEl.innerHTML = '';
        for (var id in labels) labels[id].remove();
        arc.remove(); endDot.remove();
        root.classList.remove('mb-static');
      }
    };
  }

  var api = { create: create };
  global.MinutesBloom = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
