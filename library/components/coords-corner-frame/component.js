/* ============================================================
   COORDS-CORNER-FRAME · component.js  (vanilla + guarded GSAP 3.12.5)
   ------------------------------------------------------------
   A SURVEYED-DRAWING metadata frame over a full-bleed stage. Four draughting
   TICK-CORNERS (crosshair L-brackets) are drawn into place via stroke-dashoffset,
   then a small all-caps tracked readout layer reveals staggered: a COORDINATE
   readout (lat/long), a SCALE BAR (0 ... 500 m), a NORTH arrow, and up to four
   corner LABELS. The frame reads like a surveyor's plot or an architect's plate -
   precise, technical, authored.

   Distinct from corner-frame-meta (Saisei editorial corner LABELS: eyebrow /
   location / year / index, a pure fade). THIS is the surveyor/draughting frame:
   the corners are CROSSHAIR TICKS that DRAW (stroke-dashoffset), plus a coords
   readout + scale bar + north arrow. corner-frame-meta = captions; this = survey.

   THE MOVE:
     reveal() (one-shot): the four tick-corners draw in (stroke-dashoffset full ->
     0) then the readout items (coords, scale bar, north arrow, labels) fade + rise
     in staggered. set(p 0..1) is a PURE scrub of the same state (reversible): the
     tick draw fraction + the readout opacity/rise all driven by one progress.

   CONFIG-DRIVEN:
     CoordsCornerFrame.create(target, {        // target = the stage element
       coords: '49.84N 24.03E',                // the lat/long readout
       scale:  '0 ... 500 m',                  // the scale-bar caption
       north:  true,                           // draw the north arrow
       labels: { tl, bl, br, rc },             // optional corner labels
       ease:   'air',                          // reveal ease token
       stagger:0.08, dur:0.7, tick:0.55,       // timing knobs
       size:   34, inset:'4.2vmin'             // corner tick size + frame inset
     })
   The atom INJECTS its own overlay DOM into the target (an absolutely-positioned
   .ccf-overlay), so it works on ANY section without bespoke markup. Returns
   { reveal(), set(p), hide(), destroy }. owns_pin false.

   ENGINE LAWS: opacity + transform (translateY) for the readout, stroke-dashoffset
   for the tick draw. NO width/height/top/left. NO mix-blend / NO backdrop / NO
   WebGL / NO canvas. reduced-motion -> everything shown statically. GSAP optional
   (CSS-transition fallback when absent). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  var NS = 'http://www.w3.org/2000/svg';

  var EASES = {
    air: 'cubic-bezier(.22,1,.36,1)',
    soft: 'cubic-bezier(.4,0,.2,1)',
    expo: 'cubic-bezier(.16,1,.3,1)',
    none: 'linear'
  };

  function el(tag, cls) { var n = doc.createElement(tag); if (cls) n.className = cls; return n; }
  function svgEl(tag) { return doc.createElementNS(NS, tag); }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function create(target, options) {
    options = options || {};
    var opt = {
      coords: options.coords != null ? options.coords : '49.84N 24.03E',
      scale: options.scale != null ? options.scale : '0 ... 500 m',
      north: options.north !== false,
      labels: options.labels || {},
      ease: options.ease || 'air',
      stagger: options.stagger != null ? options.stagger : 0.08,
      dur: options.dur != null ? options.dur : 0.7,
      tick: options.tick != null ? options.tick : 0.55,
      size: options.size != null ? options.size : 34,
      inset: options.inset != null ? options.inset : '4.2vmin'
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var gsap = global.gsap;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var easeCss = EASES[opt.ease] || EASES.air;

    // ----- build the overlay --------------------------------------------------
    var overlay = el('div', 'ccf-overlay');
    overlay.style.setProperty('--ccf-inset', opt.inset);
    overlay.style.setProperty('--ccf-size', opt.size + 'px');

    // the four draughting tick-corners (crosshair L-brackets) - one SVG each, the
    // path draws via stroke-dashoffset.
    var CORNERS = ['tl', 'tr', 'bl', 'br'];
    var s = opt.size, r = 1.5; // tick arm length, stroke radius offset
    // path per corner: an L-bracket meeting the frame corner. drawn from the elbow out.
    var PATHS = {
      tl: 'M ' + s + ' ' + r + ' L ' + r + ' ' + r + ' L ' + r + ' ' + s,
      tr: 'M ' + (s - r) + ' ' + r + ' L ' + (s - r) + ' ' + r + ' L ' + (s - r) + ' ' + s, // overwritten below
      bl: '',
      br: ''
    };
    // build correct L-bracket paths (elbow at the actual frame corner)
    PATHS.tl = 'M ' + r + ' ' + s + ' L ' + r + ' ' + r + ' L ' + s + ' ' + r;
    PATHS.tr = 'M ' + (s - r) + ' ' + s + ' L ' + (s - r) + ' ' + r + ' L ' + (s - s) + ' ' + r;
    PATHS.bl = 'M ' + r + ' ' + (s - s) + ' L ' + r + ' ' + (s - r) + ' L ' + s + ' ' + (s - r);
    PATHS.br = 'M ' + (s - r) + ' ' + (s - s) + ' L ' + (s - r) + ' ' + (s - r) + ' L ' + (s - s) + ' ' + (s - r);

    var tickPaths = [];
    CORNERS.forEach(function (c) {
      var holder = el('div', 'ccf-tick ccf-tick--' + c);
      var svg = svgEl('svg');
      svg.setAttribute('viewBox', '0 0 ' + s + ' ' + s);
      svg.setAttribute('width', s); svg.setAttribute('height', s);
      var path = svgEl('path');
      path.setAttribute('d', PATHS[c]);
      path.setAttribute('class', 'ccf-tick-path');
      svg.appendChild(path);
      holder.appendChild(svg);
      overlay.appendChild(holder);
      tickPaths.push(path);
    });

    // measure path length for stroke-dashoffset draw
    tickPaths.forEach(function (p) {
      var L;
      try { L = p.getTotalLength(); } catch (e) { L = s * 2; }
      if (!L || !isFinite(L)) L = s * 2;
      p.style.strokeDasharray = L;
      p.style.strokeDashoffset = L;
      p.__len = L;
    });

    // ----- the readout layer (staggered fade+rise items) ----------------------
    var items = []; // { node }

    // corner labels (optional)
    var POS = { tl: 'tl', bl: 'bl', br: 'br', rc: 'rc' };
    Object.keys(POS).forEach(function (k) {
      var txt = opt.labels[k];
      if (!txt) return;
      var lab = el('div', 'ccf-label ccf-label--' + k);
      lab.textContent = txt;
      overlay.appendChild(lab);
      items.push(lab);
    });

    // coordinate readout (bottom-centre)
    var coordsNode = null;
    if (opt.coords) {
      coordsNode = el('div', 'ccf-coords');
      var dot = el('span', 'ccf-coords-dot');
      var ct = el('span', 'ccf-coords-text');
      ct.textContent = opt.coords;
      coordsNode.appendChild(dot);
      coordsNode.appendChild(ct);
      overlay.appendChild(coordsNode);
      items.push(coordsNode);
    }

    // scale bar (bottom-left, above the bl corner)
    var scaleNode = null;
    if (opt.scale) {
      scaleNode = el('div', 'ccf-scale');
      var bar = el('div', 'ccf-scale-bar');
      // four ticks for a surveyed scale bar
      for (var i = 0; i < 5; i++) { bar.appendChild(el('span', 'ccf-scale-tick')); }
      var cap = el('div', 'ccf-scale-cap');
      cap.textContent = opt.scale;
      scaleNode.appendChild(bar);
      scaleNode.appendChild(cap);
      overlay.appendChild(scaleNode);
      items.push(scaleNode);
    }

    // north arrow (top-right area, under the tr tick)
    var northNode = null;
    if (opt.north) {
      northNode = el('div', 'ccf-north');
      var nsvg = svgEl('svg');
      nsvg.setAttribute('viewBox', '0 0 24 40');
      nsvg.setAttribute('width', '20'); nsvg.setAttribute('height', '34');
      var needle = svgEl('path');
      // a slim survey north needle (filled top half, outline bottom)
      needle.setAttribute('d', 'M12 2 L19 22 L12 17 L5 22 Z');
      needle.setAttribute('class', 'ccf-north-needle');
      var stem = svgEl('path');
      stem.setAttribute('d', 'M12 17 L12 34');
      stem.setAttribute('class', 'ccf-north-stem');
      nsvg.appendChild(needle); nsvg.appendChild(stem);
      var nlab = el('span', 'ccf-north-n');
      nlab.textContent = 'N';
      northNode.appendChild(nlab);
      northNode.appendChild(nsvg);
      overlay.appendChild(northNode);
      items.push(northNode);
    }

    // ensure the stage can host the absolutely-positioned overlay
    var cs = global.getComputedStyle ? global.getComputedStyle(stage) : null;
    if (cs && cs.position === 'static') stage.style.position = 'relative';
    stage.appendChild(overlay);

    // initial hidden state for the readout items
    function setReadout(p) {
      // each item fades+rises in across its own slice of [0..1] given the stagger
      var n = items.length || 1;
      for (var i = 0; i < items.length; i++) {
        var start = Math.min(0.9, i * opt.stagger);
        var span = 1 - start;
        var local = clamp01((p - start) / (span || 1));
        items[i].style.opacity = local.toFixed(3);
        items[i].style.transform = 'translateY(' + ((1 - local) * 8).toFixed(2) + 'px)';
      }
    }
    // the tick draw: the corners draw across the FIRST `tick` fraction of progress
    function setTicks(p) {
      var local = clamp01(p / (opt.tick || 1));
      for (var i = 0; i < tickPaths.length; i++) {
        var L = tickPaths[i].__len;
        tickPaths[i].style.strokeDashoffset = (L * (1 - local)).toFixed(2);
      }
    }

    // PURE set(p) - fully reversible, transform/opacity/stroke-dashoffset only
    function set(p) {
      p = clamp01(p);
      setTicks(p);
      // readout begins after the ticks have started drawing (small overlap)
      var rp = clamp01((p - opt.tick * 0.5) / (1 - opt.tick * 0.5));
      setReadout(rp);
    }

    function showAll() {
      tickPaths.forEach(function (pn) { pn.style.strokeDashoffset = '0'; });
      items.forEach(function (it) { it.style.opacity = '1'; it.style.transform = 'translateY(0)'; });
    }
    function hide() {
      tickPaths.forEach(function (pn) { pn.style.strokeDashoffset = pn.__len; });
      items.forEach(function (it) { it.style.opacity = '0'; it.style.transform = 'translateY(8px)'; });
    }

    // initial state
    hide();

    if (reduced) {
      showAll();
      overlay.classList.add('ccf-static');
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { static: true, reveal: function () { showAll(); }, set: set, hide: hide, destroy: destroy };
    }

    var tl = null;
    // reveal() - the one-shot staggered intro
    function reveal() {
      if (gsap) {
        if (tl) tl.kill();
        // clear inline transitions (we drive via gsap here)
        items.forEach(function (it) { it.style.transition = ''; });
        var easeName = ({ air: 'power3.out', soft: 'power2.out', expo: 'expo.out', none: 'none' })[opt.ease] || 'power3.out';
        tl = gsap.timeline({
          onComplete: function () {
            tickPaths.forEach(function (pn) { pn.style.willChange = ''; });
            items.forEach(function (it) { it.style.willChange = ''; });
          }
        });
        tickPaths.forEach(function (pn) { pn.style.willChange = 'stroke-dashoffset'; });
        items.forEach(function (it) { it.style.willChange = 'transform, opacity'; });
        // ticks draw first (slight overlapping stagger)
        tl.to(tickPaths.map(function (pn) { return pn; }), {
          strokeDashoffset: 0, duration: opt.dur, ease: easeName, stagger: 0.06
        }, 0);
        // readout fades+rises staggered, beginning while the ticks finish
        tl.to(items, {
          opacity: 1, y: 0, duration: opt.dur, ease: easeName, stagger: opt.stagger
        }, opt.dur * 0.45);
        return tl;
      }
      // CSS fallback (no gsap): transition the offsets + opacity
      tickPaths.forEach(function (pn) {
        pn.style.transition = 'stroke-dashoffset ' + opt.dur + 's ' + easeCss;
        pn.style.strokeDashoffset = '0';
      });
      items.forEach(function (it, i) {
        var d = opt.dur * 0.45 + i * opt.stagger;
        it.style.transition = 'opacity ' + opt.dur + 's ' + easeCss + ' ' + d.toFixed(2) + 's, transform ' + opt.dur + 's ' + easeCss + ' ' + d.toFixed(2) + 's';
        it.style.opacity = '1';
        it.style.transform = 'translateY(0)';
      });
      // clear will-change after the animation window
      global.setTimeout(function () {
        items.forEach(function (it) { it.style.willChange = ''; });
        tickPaths.forEach(function (pn) { pn.style.willChange = ''; });
      }, (opt.dur + items.length * opt.stagger + 0.3) * 1000);
    }

    function destroy() {
      if (tl) tl.kill();
      if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }

    overlay.classList.add('ccf-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return { overlay: overlay, reveal: reveal, set: set, hide: hide, destroy: destroy };
  }

  var api = { create: create };
  global.CoordsCornerFrame = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
