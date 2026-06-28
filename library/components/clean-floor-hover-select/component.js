/* ============================================================
   CLEAN-FLOOR-HOVER-SELECT · component.js  (vanilla + GSAP 3.12.5; no ScrollTrigger needed)
   ------------------------------------------------------------
   EVER visual-search LEVEL 1 — pick a FLOOR on a static near-elevation building render, with the
   razor-clean floor highlight EVER has (and our smarts lacks). THE ANTI-CROOKED CORE: one <svg>
   absolutely over the <img>, viewBox LOCKED to the render's intrinsic pixel size + preserveAspect
   MATCHING the img fit, so SVG user-units == image pixels at every screen size; each floor is a
   hand-traced PERSPECTIVE polygon (a corner-wrapping chevron of two quads — front face + side face
   sharing the near-corner edge), so the highlight RIDES the building's perspective instead of
   floating flat. Hover -> terracotta fill (~45%) + a darker red TOP-EDGE stroke; ONE left-anchored
   tooltip card whose y TWEENS to the hovered floor's centroid-Y (never re-mounted). Per-building
   dim so the chosen tower pops. Harvested from D_ever_visualsearch_video.md (§2 / Level 1).

   Distinct from isometric-building-unit-selector (axis-aligned <rect> hotspots, preserveAspect
   'none', filter bar, cursor-following card) — THIS is the per-floor perspective two-quad polygon
   with a y-tracking tooltip and the locked-viewBox anti-crooked guarantee.

   GEOMETRY LIVES IN DATA (not hand-typed HTML): bands = [{ floor, label, sub, status, points:'x,y x,y ...'
   (image-space), anchor:{x,y} (image-space; the tooltip's target, usually the band's left-edge mid) }].
   Trace the points ONCE over the real render in a vector editor / point-picker — never guess.

   CONFIG-DRIVEN:
     CleanFloorHoverSelect.create(target, {        // target = .cfh-stage
       imgW, imgH,                                  // the render's intrinsic px (sets the locked viewBox)
       bands,                                       // [{floor,label,sub,status,points,anchor}]
       fit: 'contain',                              // img object-fit; svg preserveAspectRatio matches
       fillOn: 0.45, hoverDur: 0.16, cardDur: 0.18, ease: 'power2.out',
       onSelect: fn(floor)                          // click a floor
     })
   Markup: .cfh-stage > .cfh-render( img.cfh-img + svg.cfh-floors ) + .cfh-card + .cfh-dim(optional).
   The engine BUILDS the <svg> floor polygons from `bands` (or reads existing .cfh-band[data-floor]).
   Returns { set(floor), select(floor), clear(), destroy }.

   ENGINE LAWS: SVG fill/stroke + DOM opacity/transform + GSAP only; GPU; NO mix-blend; NO WebGL.
   reduced-motion / <=820px -> a button list of floors (the render stays a visual; drill via buttons).
   Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  var SVGNS = 'http://www.w3.org/2000/svg';

  function create(target, options) {
    options = options || {};
    var opt = {
      imgW: options.imgW || 0,
      imgH: options.imgH || 0,
      bands: options.bands || null,
      fit: options.fit || 'contain',
      fillOn: options.fillOn != null ? options.fillOn : 0.45,
      hoverDur: options.hoverDur != null ? options.hoverDur : 0.16,
      cardDur: options.cardDur != null ? options.cardDur : 0.18,
      ease: options.ease || 'power2.out',
      onSelect: typeof options.onSelect === 'function' ? options.onSelect : null
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var render = stage.querySelector('.cfh-render');
    var img = stage.querySelector('.cfh-img');
    var svg = stage.querySelector('.cfh-floors');
    var card = stage.querySelector('.cfh-card');
    var dim = stage.querySelector('.cfh-dim');
    var gsap = global.gsap;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    // derive intrinsic size from the img if not given
    var W = opt.imgW || (img && (img.naturalWidth || +img.getAttribute('width'))) || 0;
    var H = opt.imgH || (img && (img.naturalHeight || +img.getAttribute('height'))) || 0;

    // THE ANTI-CROOKED GUARANTEE: lock the svg viewBox to image pixels + match the img fit.
    if (svg && W && H) {
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('preserveAspectRatio', opt.fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet');
    }

    // build polygons from data (or adopt existing ones)
    var bandEls = [];
    function polyCentroidY(pts) {
      var ys = pts.split(/\s+/).filter(Boolean).map(function (p) { return +p.split(',')[1]; });
      return ys.reduce(function (a, b) { return a + b; }, 0) / (ys.length || 1);
    }
    if (svg && opt.bands && opt.bands.length) {
      svg.innerHTML = '';
      opt.bands.forEach(function (b) {
        var pg = doc.createElementNS(SVGNS, 'polygon');
        pg.setAttribute('points', b.points);
        pg.setAttribute('class', 'cfh-band' + (b.status ? ' is-' + b.status : ''));
        pg.setAttribute('data-floor', b.floor);
        pg.setAttribute('vector-effect', 'non-scaling-stroke');
        svg.appendChild(pg);
        bandEls.push({ el: pg, data: b, cy: b.anchor && b.anchor.y != null ? b.anchor.y : polyCentroidY(b.points) });
      });
    } else if (svg) {
      [].slice.call(svg.querySelectorAll('.cfh-band')).forEach(function (pg) {
        bandEls.push({ el: pg, data: { floor: pg.getAttribute('data-floor') }, cy: polyCentroidY(pg.getAttribute('points') || '0,0') });
      });
    }

    var active = null;

    // map an image-space Y to a stage-px Y for the tooltip (account for the meet/letterbox fit)
    function imgYToStage(yImg) {
      if (!render || !W || !H) return 0;
      var rb = render.getBoundingClientRect();
      // contain/meet: the image is scaled by min(rbW/W, rbH/H) and centred
      var scale = opt.fit === 'cover' ? Math.max(rb.width / W, rb.height / H) : Math.min(rb.width / W, rb.height / H);
      var drawnH = H * scale;
      var offY = (rb.height - drawnH) / 2;
      return offY + yImg * scale;
    }

    function showCard(b, cy) {
      if (!card) return;
      var num = card.querySelector('.cfh-card__num');
      var lab = card.querySelector('.cfh-card__lab');
      var sub = card.querySelector('.cfh-card__sub');
      if (num) num.textContent = b.floor != null ? b.floor : '';
      if (lab) lab.textContent = b.label || 'FLOOR';
      if (sub) sub.textContent = b.sub || '';
      var y = imgYToStage(cy);
      if (gsap && !reduced) {
        gsap.to(card, { y: y, autoAlpha: 1, duration: opt.cardDur, ease: opt.ease, overwrite: 'auto' });
      } else { card.style.transform = 'translateY(' + y + 'px)'; card.style.opacity = '1'; card.style.visibility = 'visible'; }
    }
    function hideCard() {
      if (!card) return;
      if (gsap && !reduced) gsap.to(card, { autoAlpha: 0, duration: opt.cardDur * 0.8, ease: opt.ease, overwrite: 'auto' });
      else { card.style.opacity = '0'; card.style.visibility = 'hidden'; }
    }

    function setActive(floor) {
      var found = null;
      bandEls.forEach(function (b) {
        var on = String(b.data.floor) === String(floor);
        b.el.classList.toggle('is-hover', on);
        if (on) found = b;
      });
      active = floor;
      if (found) showCard(found.data, found.cy); else hideCard();
    }
    function clear() {
      bandEls.forEach(function (b) { b.el.classList.remove('is-hover'); });
      active = null; hideCard();
    }

    // wire hover/click on the polygons
    bandEls.forEach(function (b) {
      b.el.addEventListener('mouseenter', function () { setActive(b.data.floor); });
      b.el.addEventListener('click', function (e) { e.preventDefault(); if (opt.onSelect) opt.onSelect(b.data.floor, b.data); });
    });
    if (svg) svg.addEventListener('mouseleave', clear);

    if (card && gsap) gsap.set(card, { autoAlpha: 0 });

    // mobile / reduced-motion fallback: a floor button list (render stays a visual)
    if (reduced || narrow) {
      stage.classList.add('cfh-static');
      if (!stage.querySelector('.cfh-list') && bandEls.length) {
        var ul = doc.createElement('div'); ul.className = 'cfh-list';
        bandEls.forEach(function (b) {
          var btn = doc.createElement('button');
          btn.className = 'cfh-list__btn' + (b.data.status ? ' is-' + b.data.status : '');
          btn.type = 'button'; btn.setAttribute('data-floor', b.data.floor);
          btn.innerHTML = '<span class="cfh-list__num">' + (b.data.floor != null ? b.data.floor : '') + '</span>' +
                          '<span class="cfh-list__lab">' + (b.data.label || '') + '</span>' +
                          '<span class="cfh-list__sub">' + (b.data.sub || '') + '</span>';
          btn.addEventListener('click', function () { if (opt.onSelect) opt.onSelect(b.data.floor, b.data); });
          ul.appendChild(btn);
        });
        stage.appendChild(ul);
      }
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { static: true, set: setActive, select: function (f) { if (opt.onSelect) opt.onSelect(f); }, clear: clear, destroy: function () {} };
    }

    stage.classList.add('cfh-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      set: setActive, select: function (f) { var b = bandEls.filter(function (x) { return String(x.data.floor) === String(f); })[0]; if (b && opt.onSelect) opt.onSelect(f, b.data); },
      clear: clear, bands: bandEls,
      destroy: function () { if (svg) svg.removeEventListener('mouseleave', clear); }
    };
  }

  var api = { create: create };
  global.CleanFloorHoverSelect = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
