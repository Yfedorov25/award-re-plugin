/* ============================================================
   DISTRICT-RADIATES · component.js   (vanilla SVG + GSAP, NO WebGL)
   ------------------------------------------------------------
   An EDITORIAL, hand-illustrated proximity map. Warm cream paper, a soft river curve, two park
   shapes, a few thin roads (NOT a 823-building OSM sea). The home is one elegant ringed marker;
   the daily places are named pins. On scroll-in the roads draw, the home blooms, then thin
   leader-threads RADIATE from the door to each place one by one as the minute labels rise. Hover a
   list row or a pin and its thread + label light; the rest calm.

   This is a STANDALONE illustrated map (no LocMap). In production the geometry comes from the SAME
   real-OSM bake as the smarts location map (Overpass -> projector -> viewBox px), just rendered as
   a SIMPLIFIED hand-drawn illustration (river + parks + key roads + real POIs) instead of the dense
   823-building view. Real streets, real walk-minutes, drawn light + premium.

   FIDELITY: pins are positioned by mapping their viewBox coords (data-tx/ty) -> screen px via the
   SVG getScreenCTM(), and the DOT is anchored exactly on that point. So pin and thread-end share ONE
   source of truth and align at every viewport, WITHOUT needing preserveAspectRatio="none" (which
   squashed every circle into an ellipse). We use "slice" (uniform scale, circles stay round) and
   re-place pins on resize.

   LAWS: SVG / transform / opacity / stroke-dashoffset only. NO canvas, NO WebGL, NO tiles, NO
   mix-blend, NO backdrop-filter. reduced-motion -> the final drawn state, no draw/stagger. __LAB_OK__.

   DistrictRadiates.create(target, { draw, stagger, duration, ease, start, once })
   Returns { root, play(), set(p), highlight(id,on), relayout(), destroy }.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  var gsap = global.gsap;
  var NS = 'http://www.w3.org/2000/svg';

  function create(target, options) {
    options = options || {};
    var root = !target ? null : (typeof target === 'string' ? doc.querySelector(target) : target);
    if (!root) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var REDUCED = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var opt = {
      draw: options.draw !== false,
      stagger: options.stagger != null ? options.stagger : 0.14,
      duration: options.duration != null ? options.duration : 0.9,
      ease: options.ease || 'power2.out',
      start: options.start || 'top 72%',
      once: options.once !== false
    };

    var svg = root.querySelector('.dr-map');
    var stage = root.querySelector('.dr-stage') || (svg && svg.parentNode);
    var roads = [].slice.call(root.querySelectorAll('[data-draw]'));
    var river = root.querySelector('[data-river]');
    var parks = [].slice.call(root.querySelectorAll('.dr-park'));
    var home = root.querySelector('[data-home]');
    var pois = [].slice.call(root.querySelectorAll('[data-poi]'));
    var rows = [].slice.call(root.querySelectorAll('[data-dr-row]'));

    var anchor = svg && svg.querySelector('[data-home-anchor]');
    var HX = anchor ? +anchor.getAttribute('data-cx') : 500;
    var HY = anchor ? +anchor.getAttribute('data-cy') : 380;

    // --- build a thread (leader-line) home -> each POI, bowed by ANGLE (graceful splay) ---
    var gThreads = svg ? svg.querySelector('[data-threads]') : null;
    var threadOf = {};
    // bowed quadratic path home -> (tx,ty), perpendicular to the radius, consistent handedness
    function threadPath(tx, ty) {
      var dx = tx - HX, dy = ty - HY, dist = Math.hypot(dx, dy) || 1;
      var mx = (HX + tx) / 2, my = (HY + ty) / 2;
      var px = -dy / dist, py = dx / dist;             // unit perpendicular (consistent handedness)
      var bow = Math.min(34, dist * 0.10);
      var cx = mx + px * bow, cy = my + py * bow;
      return 'M' + HX + ' ' + HY + ' Q' + cx + ' ' + cy + ' ' + tx + ' ' + ty;
    }
    pois.forEach(function (el) {
      var id = el.getAttribute('data-poi');
      var tx = +el.getAttribute('data-tx'), ty = +el.getAttribute('data-ty');
      var p = doc.createElementNS(NS, 'path');
      p.setAttribute('d', threadPath(tx, ty)); p.setAttribute('class', 'dr-thread'); p.setAttribute('data-thread', id);
      if (gThreads) gThreads.appendChild(p);
      // bx/by = BASE (authored) coords; tx/ty = EFFECTIVE coords (compressed toward home on narrow stages)
      threadOf[id] = { thread: p, poi: el, len: p.getTotalLength(), bx: tx, by: ty, tx: tx, ty: ty };
    });

    // --- position each pin by mapping its viewBox coord -> screen px via the SVG CTM, anchoring
    //     the DOT on the point. Shared source of truth with the thread end -> exact alignment. ---
    var _pt = svg && svg.createSVGPoint ? svg.createSVGPoint() : null;
    var PLACEMENTS = ['up', 'down', 'left', 'right'];   // candidate label sides (dot stays put)
    var _k = -1;                                         // current spread-compression factor
    var VBW = 1000, VBH = 760;                           // viewBox of .dr-map (kept in sync with markup)
    if (svg) { var vb = (svg.getAttribute('viewBox') || '').split(/\s+/).map(Number); if (vb.length === 4) { VBW = vb[2]; VBH = vb[3]; } }

    // GENERAL fidelity fix: 'slice' crops the longer axis, so on a narrow/short stage the POIs near the
    // viewBox edges fall OUTSIDE the visible window and get cut. Compute the visible viewBox rectangle
    // after the slice crop, then pull every POI toward the home (uniform factor) until all 6 sit inside
    // that window with margin for their labels. Threads are rebuilt to the SAME compressed end so the
    // dot + thread-end keep ONE source of truth (the CTM alignment contract still holds at <1px).
    function spreadFactor() {
      var sr = stage.getBoundingClientRect();
      if (!sr.width || !sr.height) return 1;
      // uniform scale that 'slice' applies (cover): the larger of the two ratios
      var scale = Math.max(sr.width / VBW, sr.height / VBH);
      // half-extent of the visible viewBox window around its center, minus a label margin (in vb units)
      var marginPx = 96;                                  // room for label width/height in screen px
      var halfX = (sr.width / scale) / 2 - marginPx / scale;
      var halfY = (sr.height / scale) / 2 - marginPx / scale;
      var k = 1;
      pois.forEach(function (el) {
        var t = threadOf[el.getAttribute('data-poi')]; if (!t) return;
        var ox = Math.abs(t.bx - HX), oy = Math.abs(t.by - HY);
        if (ox > halfX && halfX > 0) k = Math.min(k, halfX / ox);
        if (oy > halfY && halfY > 0) k = Math.min(k, halfY / oy);
      });
      return Math.max(0.42, Math.min(1, k));              // never collapse past 0.42 (keeps the splay readable)
    }
    function applySpread() {
      var k = spreadFactor();
      if (Math.abs(k - _k) < 0.001) return;
      _k = k;
      var drawn = root.classList.contains('is-drawn');
      pois.forEach(function (el) {
        var t = threadOf[el.getAttribute('data-poi')]; if (!t) return;
        t.tx = HX + (t.bx - HX) * k;
        t.ty = HY + (t.by - HY) * k;
        t.thread.setAttribute('d', threadPath(t.tx, t.ty));
        t.len = t.thread.getTotalLength();
        // keep the dash state coherent: if it has already drawn, leave it drawn; else re-arm to hidden
        if (gsap) gsap.set(t.thread, { strokeDasharray: t.len, strokeDashoffset: drawn ? 0 : t.len });
      });
    }

    // pick the label side that keeps its box fully on-stage; prefer the outward (authored) side first
    function placeLabel(el, lbl, srect) {
      var natural = null;
      el.className.split(/\s+/).forEach(function (c) {
        if (c.indexOf('dr-poi--') === 0) natural = c.slice(8);
      });
      var order = [natural].concat(PLACEMENTS.filter(function (p) { return p !== natural; }));
      var best = null, bestOverflow = Infinity;
      for (var i = 0; i < order.length; i++) {
        var side = order[i]; if (!side) continue;
        el.className = 'dr-poi dr-poi--' + side;
        var lr = lbl.getBoundingClientRect();
        var over = Math.max(0, srect.left - lr.left) + Math.max(0, lr.right - srect.right)
                 + Math.max(0, srect.top - lr.top) + Math.max(0, lr.bottom - srect.bottom);
        if (over <= 0.5) return;                          // fully on-stage -> keep this side
        if (over < bestOverflow) { bestOverflow = over; best = side; }
      }
      // none fully fits: use the least-overflowing side, then clamp the label inside the stage edges
      el.className = 'dr-poi dr-poi--' + (best || natural || 'up');
      var b = lbl.getBoundingClientRect();
      var curShift = parseFloat(lbl.getAttribute('data-shift-x') || '0');
      var dx = 0;
      if (b.right > srect.right) dx -= (b.right - srect.right) + 4;
      else if (b.left < srect.left) dx += (srect.left - b.left) + 4;
      if (dx) {
        lbl.style.marginLeft = (curShift + dx) + 'px';
        lbl.setAttribute('data-shift-x', String(curShift + dx));
      }
    }

    function relayout() {
      if (!svg || !_pt) return;
      // compress the POI spread toward home until all 6 fit inside the slice-cropped viewBox window
      // (works for BOTH the narrow 2-col stage and the short 1-col stage; geometry-driven, not a media query)
      applySpread();
      var ctm = svg.getScreenCTM(); if (!ctm) return;
      var srect = stage.getBoundingClientRect();
      pois.forEach(function (el) {
        var t = threadOf[el.getAttribute('data-poi')]; if (!t) return;
        var lbl = el.querySelector('.lbl');
        if (lbl) { lbl.style.marginLeft = ''; lbl.removeAttribute('data-shift-x'); }
        _pt.x = t.tx; _pt.y = t.ty;
        var sp = _pt.matrixTransform(ctm);
        // position relative to the stage; the .dot is anchored at the poi origin via CSS
        el.style.left = (sp.x - srect.left) + 'px';
        el.style.top = (sp.y - srect.top) + 'px';
        // flip/clamp the label so it never exits the stage edges (general, not POI-specific)
        if (lbl) placeLabel(el, lbl, srect);
      });
    }

    function arm() {
      if (!gsap) return;
      roads.forEach(function (r) { var l = r.getTotalLength(); gsap.set(r, { strokeDasharray: l, strokeDashoffset: l }); });
      if (river) { var rl = river.getTotalLength(); gsap.set(river, { strokeDasharray: rl, strokeDashoffset: rl }); }
      gsap.set(parks, { opacity: 0 });   // parks just fade in (scale-origin on SVG paths is fiddly)
      gsap.set(home, { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' });
      pois.forEach(function (el) { gsap.set(el, { opacity: 0, y: 8 }); var t = threadOf[el.getAttribute('data-poi')]; if (t) gsap.set(t.thread, { strokeDasharray: t.len, strokeDashoffset: t.len }); });
      gsap.set(rows, { opacity: 0, y: 10 });
    }

    function finalState() {
      if (gsap) {
        gsap.set(roads, { strokeDashoffset: 0 });
        if (river) gsap.set(river, { strokeDashoffset: 0 });
        gsap.set(parks, { opacity: 1 });
        gsap.set(home, { opacity: 1, scale: 1 });
        pois.forEach(function (el) { gsap.set(el, { opacity: 1, y: 0 }); var t = threadOf[el.getAttribute('data-poi')]; if (t) gsap.set(t.thread, { strokeDashoffset: 0 }); });
        gsap.set(rows, { opacity: 1, y: 0 });
      }
      root.classList.add('is-drawn');
    }

    var played = false;
    function play() {
      if (played) return;                                 // guard: ScrollTrigger + rAF must not double-fire
      played = true;
      relayout();
      if (REDUCED || !gsap) { finalState(); return; }
      var tl = gsap.timeline({ defaults: { ease: opt.ease } });
      if (river) tl.to(river, { strokeDashoffset: 0, duration: 1.2, ease: 'power1.inOut' }, 0);
      tl.to(roads, { strokeDashoffset: 0, duration: 1.0, stagger: 0.12, ease: 'power1.inOut' }, 0.15);
      tl.to(parks, { opacity: 1, duration: 0.9, stagger: 0.12 }, 0.3);
      tl.to(home, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.7)' }, 0.7)
        .add(function () { root.classList.add('is-drawn'); }, 0.7);
      pois.forEach(function (el, i) {
        var id = el.getAttribute('data-poi'); var t = threadOf[id];
        var at = 1.0 + i * opt.stagger;
        if (t) tl.to(t.thread, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.out' }, at);
        tl.to(el, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, at + 0.15);
        // pair each thread with its OWN legend row by id (DOM legend order != POI order)
        var row = root.querySelector('[data-dr-row="' + id + '"]');
        if (row) tl.to(row, { opacity: 1, y: 0, duration: 0.5 }, at + 0.1);
      });
      return tl;
    }

    function highlight(id, on) {
      root.querySelectorAll('[data-poi="' + id + '"],[data-dr-row="' + id + '"],[data-thread="' + id + '"]').forEach(function (e) {
        e.classList.toggle('is-hot', on);
      });
      root.classList.toggle('is-focusing', on);
    }
    // bound handlers we can remove on destroy
    var bound = [];
    pois.concat(rows).forEach(function (e) {
      var id = e.getAttribute('data-poi') || e.getAttribute('data-dr-row');
      var on = function () { highlight(id, true); }, off = function () { highlight(id, false); };
      e.addEventListener('mouseenter', on); e.addEventListener('mouseleave', off);
      e.addEventListener('focus', on); e.addEventListener('blur', off);
      bound.push([e, on, off]);
    });
    function onResize() { relayout(); }
    global.addEventListener && global.addEventListener('resize', onResize);

    // birth
    relayout();
    arm();
    if (REDUCED || !gsap || !global.ScrollTrigger) { finalState(); }
    else {
      // ScrollTrigger.onEnter fires for triggers already in view on create/refresh, so it covers the
      // load-already-visible case; the redundant rAF in-view check is dropped (the `played` guard also
      // protects against any double-fire). onRefresh re-lays-out after height changes.
      global.ScrollTrigger.create({ trigger: root, start: opt.start, once: opt.once, onEnter: play, onRefresh: relayout });
    }

    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      root: root, play: play, highlight: highlight, relayout: relayout,
      set: function (p) { if (p >= 1) finalState(); else arm(); },
      destroy: function () {
        global.removeEventListener && global.removeEventListener('resize', onResize);
        bound.forEach(function (b) { b[0].removeEventListener('mouseenter', b[1]); b[0].removeEventListener('mouseleave', b[2]); b[0].removeEventListener('focus', b[1]); b[0].removeEventListener('blur', b[2]); });
        for (var k in threadOf) threadOf[k].thread.remove();
      }
    };
  }

  var api = { create: create };
  global.DistrictRadiates = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
