/* ============================================================
   LOCMAP-ENGINE · component.js   (vanilla SVG + GSAP, NO WebGL)
   ------------------------------------------------------------
   The canonical award-grade location map: a hand-built SVG of REAL baked OSM geography
   (roads / buildings / green / water), the property anchored on it, numbered POIs that
   sync two-way with a side list, a Dijkstra route that DRAWS along the real street graph
   with a walking dot and a LIVE minute counter, a walking-radius ring, deterministic lit
   windows for nocturnal life, a 9-gate staggered reveal, asymmetric layer parallax, and a
   dual MODE switch (named places vs infrastructure categories with a cluster badge).

   It is the UNION of the two shipped maps:
     • SMARTS (the etalon — apps/smarts/src/js/sections/location.js): the motion —
       dual casing+stroke road hierarchy, the (i*2654435761>>>0)%9 lit-window flicker,
       the Dijkstra draw + getPointAtLength walker + growing live timer, the 9-gate reveal,
       the asymmetric parallax (green -1.2/1.2, buildings -2/2, pins -3/3), 44px touch zones,
       the POI collision-avoidance nudge, the walking ring at real m/unit scale.
     • QUADRO (apps/quadro/components/sections/DistrictMap.tsx): the information architecture
       — the dual MODE (loc | infra), the category pins + centroid CLUSTER badge with a count.

   Canon = Quadro's IA wearing Smarts' motion. opacity / transform / stroke-dashoffset / SVG
   attributes only. NO canvas, NO WebGL, NO tiles, NO Mapbox/Leaflet.

   LocMap.create(target, {
     data: MAP,                 // baked OSM (see shape below). No runtime fetch.
     site: {x,y,label,tag},     // the property anchor (defaults to data.site)
     mScale: 2.6,               // metres per viewBox unit (for the walking ring)
     walkMin: 10,               // ring = a walkMin-minute walk
     modes: ["loc","infra"],    // omit/“loc” only -> single mode (no tabs)
     roadRanks: ["faint","minor","mid","main","hwy"],
     flicker: { rate: 9 },      // ~1/rate of buildings light warm windows (deterministic)
     reveal: { start: "top 58%", once: true },  // the 9-gate timeline trigger
     parallax: { green: 1.2, buildings: 2, pins: 3 },  // asymmetric scrub offsets (0 = off)
     route: true,               // animate the Dijkstra draw + walker + live timer on select
     ease: "award",             // cubic-bezier(0.25,0.46,0.45,0.94)
     onSelect: (id)=>{},        // dual-axis sync hook
   })
   Returns { root, svg, select(id), clearSel(), setMode(m), setCat(cat), reveal(), destroy }.

   ENGINE LAWS: SVG DOM only; GPU transform/opacity/dashoffset; lazy-friendly; reduced-motion
   -> final static state, no draw/parallax. 44px tap zones on coarse pointers. Sets __LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  var NS = 'http://www.w3.org/2000/svg';
  global.gsap && global.gsap.registerPlugin && global.ScrollTrigger && global.gsap.registerPlugin(global.ScrollTrigger);

  // register the "award" ease once (smarts house curve) if GSAP is present
  if (global.gsap && global.CustomEase && !global.gsap.parseEase('award')) {
    try { global.CustomEase.create('award', '0.25,0.46,0.45,0.94'); } catch (e) {}
  }
  function ease(name) {
    if (global.gsap && global.gsap.parseEase(name)) return name;
    return 'power2.out'; // fallback when CustomEase absent
  }

  var ROAD_ORDER = { faint: 0, minor: 1, mid: 2, main: 3, hwy: 4 };

  function create(target, options) {
    options = options || {};
    var host = !target ? null : (typeof target === 'string' ? doc.querySelector(target) : target);
    if (!host) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }
    var data = options.data;
    if (!data) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no data' }; }

    var REDUCED = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var COARSE = global.matchMedia && global.matchMedia('(pointer: coarse)').matches;
    var gsap = global.gsap;

    var opt = {
      site: options.site || data.site,
      mScale: options.mScale != null ? options.mScale : 2.6,
      walkMin: options.walkMin != null ? options.walkMin : 10,
      modes: options.modes || (data.infra ? ['loc', 'infra'] : ['loc']),
      flicker: options.flicker || { rate: 9 },
      reveal: options.reveal || { start: 'top 58%', once: true },
      parallax: options.parallax || { green: 1.2, buildings: 2, pins: 3 },
      route: options.route !== false,
      ease: ease(options.ease || 'award'),
      onSelect: options.onSelect || null
    };
    var S = opt.site;

    function el(tag, attrs, parent) {
      var e = doc.createElementNS(NS, tag);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(e);
      return e;
    }

    // ---- SVG skeleton (z-order EXACTLY as smarts) ----
    var vb = data.viewBox || '120 -20 1060 660';
    var svg = el('svg', { class: 'lm__map', viewBox: vb, preserveAspectRatio: 'xMidYMid slice',
      role: 'img', 'aria-label': 'Карта локації за даними OpenStreetMap: вулиці, будівлі, обʼєкт і маршрути' });
    var defs = el('defs', {}, svg);
    var hatch = el('pattern', { id: 'lmHatch', width: 6, height: 6, patternTransform: 'rotate(45)', patternUnits: 'userSpaceOnUse' }, defs);
    el('rect', { width: 6, height: 6, fill: 'rgba(176,106,79,.25)' }, hatch);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: 'rgba(201,138,114,.85)', 'stroke-width': 1.6 }, hatch);
    var gGreen = el('g', { 'data-lm': 'green' }, svg);
    var gBld = el('g', { 'data-lm': 'bld' }, svg);
    var gRoads = el('g', { 'data-lm': 'roads' }, svg);
    var gNames = el('g', { 'data-lm': 'names' }, svg);
    var gRing = el('g', { 'data-lm': 'ring' }, svg);
    var gRoute = el('g', { 'data-lm': 'route' }, svg);
    var gSite = el('g', { 'data-lm': 'site' }, svg);
    var gPts = el('g', { 'data-lm': 'pts' }, svg);
    var gInfra = el('g', { 'data-lm': 'infra' }, svg);
    var gLive = el('g', { 'data-lm': 'live' }, svg);

    // ---- base from real OSM ----
    (data.green || []).forEach(function (g) { el('path', { d: g.d, class: 'lm-gw lm-gw--' + (g.cls || 'green') }, gGreen); });
    (data.buildings || []).forEach(function (d, i) {
      var lit = (i * 2654435761 >>> 0) % opt.flicker.rate === 0; // deterministic ~1/rate lit
      el('path', { d: d, class: lit ? 'lm-bld lm-bld--lit' : 'lm-bld' }, gBld);
    });
    var roads = (data.roads || []).slice().sort(function (a, b) { return ROAD_ORDER[a.cls] - ROAD_ORDER[b.cls]; });
    // casing pass (under), skip faint
    roads.forEach(function (r) {
      if (r.cls !== 'faint') el('polyline', { points: r.pts.map(function (p) { return p.join(','); }).join(' '), class: 'lm-rdc lm-rdc--' + r.cls }, gRoads);
    });
    // stroke pass (over) + collect the big roads to draw-in
    var drawRoads = [];
    roads.forEach(function (r) {
      var p = el('polyline', { points: r.pts.map(function (p2) { return p2.join(','); }).join(' '), class: 'lm-rd lm-rd--' + r.cls }, gRoads);
      if (r.cls === 'hwy' || r.cls === 'main') drawRoads.push({ p: p, cls: r.cls });
    });
    (data.names || []).forEach(function (n) {
      el('text', { x: n.x, y: n.y, class: 'lm-rdname', transform: n.a ? ('rotate(' + n.a + ' ' + n.x + ' ' + n.y + ')') : undefined }, gNames).textContent = n.n;
    });

    // ---- walking ring (smarts: ~833 m per 10 min / mScale m-per-unit) ----
    var R = Math.round((opt.walkMin / 10 * 833) / opt.mScale);
    var ring = el('circle', { cx: S.x, cy: S.y, r: R, class: 'lm-ring' }, gRing);
    el('text', { x: S.x - R * 0.5, y: S.y - R * 0.83, class: 'lm-ringt' }, gRing).textContent = '≈' + opt.walkMin + ' хв пішки';

    // ---- site parcel + dual pulse + dim line + tags ----
    el('path', { d: 'M' + (S.x - 15) + ' ' + (S.y - 9) + ' L' + (S.x + 9) + ' ' + (S.y - 14) + ' L' + (S.x + 14) + ' ' + (S.y + 7) + ' L' + (S.x - 9) + ' ' + (S.y + 13) + ' Z', class: 'lm-parcel' }, gSite);
    el('circle', { cx: S.x, cy: S.y, r: 24, class: 'lm-pulse', style: 'transform-origin:' + S.x + 'px ' + S.y + 'px' }, gSite);
    el('circle', { cx: S.x, cy: S.y, r: 24, class: 'lm-pulse lm-pulse--2', style: 'transform-origin:' + S.x + 'px ' + S.y + 'px' }, gSite);
    if (S.tag) el('text', { x: S.x, y: S.y - 24, 'text-anchor': 'middle', class: 'lm-sitetag' }, gSite).textContent = S.tag;

    // ---- POI collision-avoidance nudge (O(n^2) hypot) ----
    var pois = (data.pois || []).map(function (p) { return Object.assign({}, p); });
    for (var i = 0; i < pois.length; i++)
      for (var j = i + 1; j < pois.length; j++) {
        var a = pois[i], b = pois[j];
        if (Math.hypot(a.x - b.x, a.y - b.y) < 20) { b.x += 14; b.y += 12; a.x -= 10; a.y -= 8; }
      }

    // ---- POIs + side list (built into the host by the lab; we expose row binding) ----
    var listEl = host.querySelector('[data-lm-list]');
    pois.forEach(function (p, idx) {
      var g = el('g', { class: 'lm-pt', 'data-id': p.id, tabindex: 0, role: 'button',
        'aria-label': p.label + ': ' + (p.walk != null ? p.walk + ' хвилин пішки, ' : '') + (p.m != null ? p.m + ' метрів' : '') }, gPts);
      if (COARSE) el('circle', { cx: p.x, cy: p.y, r: 22, class: 'lm-hit' }, g);
      el('circle', { cx: p.x, cy: p.y, r: 11.5 }, g);
      el('text', { x: p.x, y: p.y + 0.5 }, g).textContent = idx + 1;
      if (listEl) {
        var row = doc.createElement('div');
        row.className = 'lm-row'; row.dataset.id = p.id;
        row.innerHTML = '<span class="n">' + String(idx + 1).padStart(2, '0') + '</span>' +
          '<span class="nm">' + p.label + '</span>' +
          '<span class="tm"><b>' + (p.walk != null ? p.walk + ' хв' : '') + '</b>' + (p.m != null ? ' пішки · ' + p.m + ' м' : '') + '</span>';
        listEl.appendChild(row);
      }
    });

    // ---- INFRA mode (quadro): category pins + centroid cluster badge ----
    var curCat = null;
    function clearInfra() { while (gInfra.firstChild) gInfra.removeChild(gInfra.firstChild); }
    function renderInfra(cat) {
      clearInfra();
      var c = data.infra && data.infra[cat];
      if (!c) return;
      var sx = 0, sy = 0;
      c.pins.forEach(function (pin) {
        el('rect', { x: pin.x - 4, y: pin.y - 4, width: 8, height: 8, rx: 2, class: 'lm-infra' }, gInfra);
        sx += pin.x; sy += pin.y;
      });
      var cx = sx / c.pins.length, cy = sy / c.pins.length;
      var bg = el('g', { class: 'lm-cluster', transform: 'translate(' + cx + ' ' + cy + ')' }, gInfra);
      el('circle', { r: 17, class: 'lm-cluster__bg' }, bg);
      el('text', { y: 1, class: 'lm-cluster__n' }, bg).textContent = c.count + (c.count >= 40 ? '+' : '');
    }

    // ---- route: draw along streets + walker + live timer (smarts) ----
    var cur = null, routeBits = [];
    function clearSel() {
      host.querySelectorAll('.lm-pt,.lm-row').forEach(function (e) { e.classList.remove('is-on'); });
      host.querySelectorAll('.lm-pt').forEach(function (e) { e.classList.remove('is-dim'); });
      routeBits.forEach(function (b) { if (gsap) gsap.to(b, { opacity: 0, duration: 0.25, onComplete: function () { b.remove(); } }); else b.remove(); });
      routeBits = []; cur = null;
    }
    function select(id) {
      if (cur === id) { clearSel(); return; }
      clearSel(); cur = id;
      var p = pois.find(function (q) { return q.id === id; });
      if (!p) return;
      host.querySelectorAll('[data-id="' + id + '"]').forEach(function (e) { e.classList.add('is-on'); });
      host.querySelectorAll('.lm-pt').forEach(function (e) { if (e.dataset.id !== id) e.classList.add('is-dim'); });
      if (opt.onSelect) opt.onSelect(id);
      if (!opt.route || !p.route || !p.route.length) return;
      var d = 'M' + p.route.map(function (pt) { return pt.join(' '); }).join(' L');
      var route = el('path', { d: d, class: 'lm-route' }, gRoute);
      var walker = el('circle', { r: 5, class: 'lm-walker', cx: p.route[0][0], cy: p.route[0][1] }, gRoute);
      var liveBg = el('rect', { x: 0, y: 0, width: 86, height: 24, class: 'lm-livebg', rx: 4 }, gLive);
      var live = el('text', { class: 'lm-livet' }, gLive);
      routeBits = [route, walker, liveBg, live];
      var len = route.getTotalLength();
      if (REDUCED || !gsap) {
        live.setAttribute('x', p.x + 18); live.setAttribute('y', p.y - 18);
        liveBg.setAttribute('x', p.x + 10); liveBg.setAttribute('y', p.y - 34); liveBg.setAttribute('width', 110);
        live.textContent = (p.walk != null ? p.walk + ' хв · ' : '') + (p.m != null ? p.m + ' м' : '');
        gsap && gsap.set(route, { strokeDasharray: len, strokeDashoffset: 0 });
        return;
      }
      var o = { t: 0 }, D = Math.min(2.2, 0.8 + len / 600);
      gsap.set(route, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(route, { strokeDashoffset: 0, duration: D, ease: 'power1.inOut' });
      gsap.to(o, { t: 1, duration: D, ease: 'power1.inOut',
        onUpdate: function () {
          var pt = route.getPointAtLength(o.t * len);
          walker.setAttribute('cx', pt.x); walker.setAttribute('cy', pt.y);
          liveBg.setAttribute('x', pt.x + 10); liveBg.setAttribute('y', pt.y - 12);
          live.setAttribute('x', pt.x + 18); live.setAttribute('y', pt.y + 4);
          live.textContent = Math.max(1, Math.round(o.t * (p.walk || 1))) + ' хв';
        },
        onComplete: function () { live.textContent = (p.walk != null ? p.walk + ' хв · ' : '') + (p.m != null ? p.m + ' м' : ''); liveBg.setAttribute('width', 110); }
      });
    }

    // ---- interactions: dual-axis hover + click + bg-clear ----
    host.appendChild ? null : null;
    host.addEventListener('click', function (e) {
      var tgt = e.target.closest('.lm-pt,.lm-row');
      if (tgt) { select(tgt.dataset.id); return; }
      if (e.target.closest('.lm__map')) clearSel();
    });
    function hover(id, on) { host.querySelectorAll('[data-id="' + id + '"]').forEach(function (e) { e.classList.toggle('is-on', on || cur === id); }); }
    host.querySelectorAll('.lm-row,.lm-pt').forEach(function (e) {
      e.addEventListener('mouseenter', function () { hover(e.dataset.id, true); });
      e.addEventListener('mouseleave', function () { hover(e.dataset.id, false); });
    });

    // ---- mode switch ----
    var mode = 'loc';
    function setMode(m) {
      mode = m;
      host.setAttribute('data-lm-mode', m);
      if (m === 'infra') { clearSel(); renderInfra(curCat || (data.infra && Object.keys(data.infra)[0])); }
      else { clearInfra(); }
    }
    function setCat(cat) { curCat = cat; if (mode === 'infra') renderInfra(cat); }

    // ---- mount svg ----
    var stage = host.querySelector('[data-lm-stage]') || host;
    stage.insertBefore(svg, stage.firstChild);

    // ---- birth: 9-gate staggered reveal + parallax ----
    function reveal() {
      if (REDUCED || !gsap || !global.ScrollTrigger) {
        host.classList.add('is-born');
        return;
      }
      gsap.set([gGreen, gBld, gNames], { opacity: 0 });
      gsap.set('.lm-rd,.lm-rdc', { opacity: 0 });
      drawRoads.forEach(function (o) { var l = o.p.getTotalLength(); gsap.set(o.p, { strokeDasharray: l, strokeDashoffset: l, opacity: 1 }); });
      gsap.set(ring, { opacity: 0 });
      gsap.set(gSite, { opacity: 0, scale: 0.7, transformOrigin: S.x + 'px ' + S.y + 'px' });
      gsap.set('.lm-pt', { opacity: 0, scale: 0.4, transformOrigin: 'center' });
      gsap.set('.lm-row', { opacity: 0 });

      global.ScrollTrigger.create({
        trigger: host, start: opt.reveal.start || 'top 58%', once: opt.reveal.once !== false,
        onEnter: function () {
          var tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });
          tl.to(gGreen, { opacity: 1, duration: 0.9 }, 0.1)                                                   // 1 green
            .to(gBld, { opacity: 1, duration: 1.2 }, 0.3)                                                     // 2 buildings
            .to('.lm-rd--mid,.lm-rd--minor,.lm-rd--faint,.lm-rdc--mid,.lm-rdc--minor', { opacity: 1, duration: 1.0 }, 0.5) // 3 small roads
            .add(function () { drawRoads.forEach(function (o, k) { gsap.to(o.p, { strokeDashoffset: 0, duration: o.cls === 'hwy' ? 1.4 : 1.1, delay: k * 0.12, ease: 'power2.inOut' }); }); }, 0.7) // 4 big roads draw
            .to('.lm-rdc--hwy,.lm-rdc--main', { opacity: 1, duration: 0.4 }, 0.7)                             // 5 big casing
            .to(gNames, { opacity: 1, duration: 0.7 }, 1.7)                                                   // 6 names
            .to(ring, { opacity: 1, duration: 0.9 }, 2.0)                                                     // 7 ring
            .to(gSite, { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }, 2.2)                      // 8 site
            .call(function () { host.classList.add('is-born'); })
            .to('.lm-pt', { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)', stagger: 0.07 }, 2.5) // 9 pins
            .to('.lm-row', { opacity: 1, duration: 0.5, stagger: 0.07 }, 2.5);
        }
      });

      // asymmetric parallax
      var P = opt.parallax;
      function lp(g, f) { if (!f) return; gsap.fromTo(g, { yPercent: -f }, { yPercent: f, ease: 'none', scrollTrigger: { trigger: host, start: 'top bottom', end: 'bottom top', scrub: true } }); }
      lp(gGreen, P.green); lp(gBld, P.buildings); lp(gPts, P.pins);
    }
    reveal();

    setMode('loc');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      root: host, svg: svg,
      select: select, clearSel: clearSel, setMode: setMode, setCat: setCat, reveal: reveal,
      destroy: function () { svg.remove(); }
    };
  }

  var api = { create: create };
  global.LocMap = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
