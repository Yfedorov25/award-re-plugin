/* ============================================================
   NUMBERED-FLOORPLATE-SELECT · component.js  (vanilla + GSAP 3.12.5; no ScrollTrigger needed)
   ------------------------------------------------------------
   EVER visual-search LEVEL 2 — pick a UNIT on a CLEAN REDRAWN vector floor plan where the NUMBER
   IS the UI. NOT the developer raw plan image + a wall of text (which is the smarts mistake). The
   substrate is inline SVG line-art (white room fills, hairline partitions, heavy perimeter); each
   apartment is a transparent footprint <path data-nr ...> in the SAME viewBox as the artwork; each
   unit gets a small NUMBER PILL placed at its footprint's COMPUTED CENTROID (never hand-placed
   pixels) so it stays glued under any scale. Hover -> footprint wash (live ~0.12 / sold darker) +
   pill scales 1->1.08 + a top dark-translucent info card (type + Nº + area + price) fades/slides in;
   dead units show 'Not on sale', live units reveal a '+'. '+' click -> Level 3 (onSelect). Left rail
   = giant floor numeral + Floor dropdown + back + site-locator + compass. Harvested from
   D_ever_visualsearch_video.md (§3 / Level 2).

   Distinct from smarts units.js renderPlate (axis-aligned <rect> zones over the RAW floor webp,
   preserveAspectRatio='none', bare number) and isometric-building-unit-selector (rect hotspots on a
   pre-render). THIS keeps the visual-search-engine data-nr/stateClass join but swaps the substrate
   to a clean vector + centroid-placed number pills.

   DATA: units = [{ nr, type, area, price, status('sale'|'sold'|'reserved'), points:'x,y x,y ...'
   (image-space footprint) }]. The clean plan artwork is authored inline in lab.html (or passed as
   `planSVG`); footprints + pills are built by the engine in the artwork's viewBox.

   CONFIG-DRIVEN:
     NumberedFloorplateSelect.create(target, {     // target = .nfp-stage
       vbW, vbH,                                    // the plan artwork's viewBox size (shared coord space)
       units,                                       // [{nr,type,area,price,status,points}]
       fmtPrice: fn(n), pillR: 15, hoverFill: 0.12, hoverDur: 0.18, ease: 'power2.out',
       onSelect: fn(nr, unit)                       // '+' click -> Level 3
     })
   Markup: .nfp-stage > .nfp-rail(...) + .nfp-stagecard( svg.nfp-plan (artwork) + svg.nfp-zones (built) )
   + .nfp-card(top info, built/seeded). Returns { render(units), select(nr), clear(), destroy }.

   ENGINE LAWS: SVG fill/stroke + DOM opacity/transform + GSAP only; GPU; NO mix-blend; NO WebGL.
   Pills derive from footprint centroid in SVG space (glued under scale). reduced-motion / <=820px ->
   a unit list (number + type + area + price + status). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  var SVGNS = 'http://www.w3.org/2000/svg';

  function create(target, options) {
    options = options || {};
    var opt = {
      vbW: options.vbW || 0,
      vbH: options.vbH || 0,
      units: options.units || [],
      pillR: options.pillR != null ? options.pillR : 15,
      hoverFill: options.hoverFill != null ? options.hoverFill : 0.12,
      hoverDur: options.hoverDur != null ? options.hoverDur : 0.18,
      ease: options.ease || 'power2.out',
      fmtPrice: typeof options.fmtPrice === 'function' ? options.fmtPrice : function (n) { return (n != null ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽' : ''); },
      onSelect: typeof options.onSelect === 'function' ? options.onSelect : null
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var plan = stage.querySelector('.nfp-plan');     // the clean redrawn artwork svg
    var zones = stage.querySelector('.nfp-zones');   // the footprint + pill layer (built here)
    var card = stage.querySelector('.nfp-card');     // top info card
    var gsap = global.gsap;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    var W = opt.vbW || (plan && (plan.viewBox && plan.viewBox.baseVal && plan.viewBox.baseVal.width)) || 0;
    var H = opt.vbH || (plan && (plan.viewBox && plan.viewBox.baseVal && plan.viewBox.baseVal.height)) || 0;

    // lock the zones svg to the SAME viewBox as the artwork (shared coord space = no drift)
    if (zones && W && H) { zones.setAttribute('viewBox', '0 0 ' + W + ' ' + H); zones.setAttribute('preserveAspectRatio', 'xMidYMid meet'); }
    if (plan && W && H && !plan.getAttribute('viewBox')) plan.setAttribute('viewBox', '0 0 ' + W + ' ' + H);

    // polygon centroid (area-weighted) — pills derive from this, NEVER hand-placed
    function centroid(ptsStr) {
      var pts = ptsStr.trim().split(/\s+/).map(function (p) { var a = p.split(',').map(Number); return { x: a[0], y: a[1] }; });
      var A = 0, cx = 0, cy = 0;
      for (var i = 0; i < pts.length; i++) {
        var j = (i + 1) % pts.length;
        var cross = pts[i].x * pts[j].y - pts[j].x * pts[i].y;
        A += cross; cx += (pts[i].x + pts[j].x) * cross; cy += (pts[i].y + pts[j].y) * cross;
      }
      A *= 0.5;
      if (Math.abs(A) < 1e-6) { // degenerate -> bbox center
        var xs = pts.map(function (p) { return p.x; }), ys = pts.map(function (p) { return p.y; });
        return { x: (Math.min.apply(null, xs) + Math.max.apply(null, xs)) / 2, y: (Math.min.apply(null, ys) + Math.max.apply(null, ys)) / 2 };
      }
      return { x: cx / (6 * A), y: cy / (6 * A) };
    }

    var built = [];

    function fillCard(u) {
      if (!card) return;
      card.querySelector('.nfp-card__type') && (card.querySelector('.nfp-card__type').textContent = u.type || '');
      card.querySelector('.nfp-card__nr') && (card.querySelector('.nfp-card__nr').textContent = u.nr != null ? '№ ' + u.nr : '');
      card.querySelector('.nfp-card__area') && (card.querySelector('.nfp-card__area').textContent = u.area != null ? u.area + ' м²' : '');
      var priceEl = card.querySelector('.nfp-card__price');
      if (priceEl) priceEl.textContent = u.status === 'sale' ? opt.fmtPrice(u.price) : (u.status === 'sold' ? 'Продано' : 'Не в продажу');
      card.classList.toggle('is-dead', u.status !== 'sale');
    }
    function showCard(u) { fillCard(u); if (gsap && !reduced) gsap.to(card, { autoAlpha: 1, y: 0, duration: opt.hoverDur, ease: opt.ease, overwrite: 'auto' }); else if (card) { card.style.opacity = '1'; card.style.visibility = 'visible'; } }
    function hideCard() { if (!card) return; if (gsap && !reduced) gsap.to(card, { autoAlpha: 0, duration: opt.hoverDur * 0.9, ease: opt.ease, overwrite: 'auto' }); else { card.style.opacity = '0'; card.style.visibility = 'hidden'; } }

    function clearHover() { built.forEach(function (b) { b.foot.classList.remove('is-hover'); b.pill.classList.remove('is-hover'); }); hideCard(); }

    function render(units) {
      units = units || opt.units;
      if (!zones) return;
      zones.innerHTML = ''; built = [];
      units.forEach(function (u) {
        // footprint
        var foot = doc.createElementNS(SVGNS, 'polygon');
        foot.setAttribute('points', u.points);
        foot.setAttribute('class', 'nfp-foot is-' + (u.status || 'sale'));
        foot.setAttribute('data-nr', u.nr);
        zones.appendChild(foot);
        // pill at COMPUTED centroid
        var c = centroid(u.points);
        var g = doc.createElementNS(SVGNS, 'g');
        g.setAttribute('class', 'nfp-pill is-' + (u.status || 'sale'));
        g.setAttribute('data-nr', u.nr);
        g.setAttribute('transform', 'translate(' + c.x.toFixed(1) + ' ' + c.y.toFixed(1) + ')');
        var circ = doc.createElementNS(SVGNS, 'circle'); circ.setAttribute('r', opt.pillR); circ.setAttribute('class', 'nfp-pill__bg');
        var txt = doc.createElementNS(SVGNS, 'text'); txt.setAttribute('class', 'nfp-pill__nr'); txt.setAttribute('text-anchor', 'middle'); txt.setAttribute('dy', '0.34em'); txt.textContent = u.nr;
        g.appendChild(circ); g.appendChild(txt);
        // live units get a '+' affordance (hidden until hover)
        if ((u.status || 'sale') === 'sale') {
          var plus = doc.createElementNS(SVGNS, 'text'); plus.setAttribute('class', 'nfp-pill__plus'); plus.setAttribute('text-anchor', 'middle'); plus.setAttribute('dy', '0.34em'); plus.textContent = '+';
          g.appendChild(plus);
        }
        zones.appendChild(g);

        var rec = { u: u, foot: foot, pill: g, c: c };
        built.push(rec);

        function on() { foot.classList.add('is-hover'); g.classList.add('is-hover'); showCard(u); }
        function off() { foot.classList.remove('is-hover'); g.classList.remove('is-hover'); hideCard(); }
        function open(e) { e.preventDefault(); if ((u.status || 'sale') === 'sale' && opt.onSelect) opt.onSelect(u.nr, u); }
        foot.addEventListener('mouseenter', on); foot.addEventListener('mouseleave', off);
        g.addEventListener('mouseenter', on); g.addEventListener('mouseleave', off);
        foot.addEventListener('click', open); g.addEventListener('click', open);
      });
    }

    if (card && gsap) gsap.set(card, { autoAlpha: 0, y: -10 });

    // mobile / reduced-motion: a unit list
    if (reduced || narrow) {
      stage.classList.add('nfp-static');
      if (!stage.querySelector('.nfp-list')) {
        var wrap = doc.createElement('div'); wrap.className = 'nfp-list';
        (opt.units || []).forEach(function (u) {
          var b = doc.createElement('button'); b.className = 'nfp-list__row is-' + (u.status || 'sale'); b.type = 'button'; b.setAttribute('data-nr', u.nr);
          b.innerHTML = '<span class="nfp-list__nr">' + u.nr + '</span><span class="nfp-list__t">' + (u.type || '') + '</span>' +
            '<span class="nfp-list__a">' + (u.area != null ? u.area + ' м²' : '') + '</span>' +
            '<span class="nfp-list__p">' + (u.status === 'sale' ? opt.fmtPrice(u.price) : (u.status === 'sold' ? 'Продано' : 'Не в продажу')) + '</span>';
          if ((u.status || 'sale') === 'sale') b.addEventListener('click', function () { if (opt.onSelect) opt.onSelect(u.nr, u); });
          else b.disabled = true;
          wrap.appendChild(b);
        });
        stage.appendChild(wrap);
      }
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { static: true, render: function () {}, select: function (nr) { var u = (opt.units || []).filter(function (x) { return String(x.nr) === String(nr); })[0]; if (u && opt.onSelect) opt.onSelect(nr, u); }, clear: function () {}, destroy: function () {} };
    }

    render(opt.units);
    if (zones) zones.addEventListener('mouseleave', clearHover);

    stage.classList.add('nfp-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      render: render, built: built,
      select: function (nr) { var b = built.filter(function (x) { return String(x.u.nr) === String(nr); })[0]; if (b && b.u.status === 'sale' && opt.onSelect) opt.onSelect(nr, b.u); },
      setHover: function (nr) { var b = built.filter(function (x) { return String(x.u.nr) === String(nr); })[0]; if (b) { b.foot.classList.add('is-hover'); b.pill.classList.add('is-hover'); showCard(b.u); } },
      clear: clearHover,
      destroy: function () { if (zones) zones.removeEventListener('mouseleave', clearHover); }
    };
  }

  var api = { create: create };
  global.NumberedFloorplateSelect = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
