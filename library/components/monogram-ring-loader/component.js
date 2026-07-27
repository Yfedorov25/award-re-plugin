/* ============================================================
   MONOGRAM-RING-LOADER · component.js  (vanilla, GSAP optional)
   ------------------------------------------------------------
   Saisei's interstitial loader — a centred brand monogram (木 / a logo glyph) fades in,
   a thin SVG ring strokes ON around it (stroke-dashoffset full->0, drawn from ~7 o'clock),
   and the NEXT page's grid skeleton (vertical column rules) strokes in top->down. It is
   NOT a timed flourish — it is a real NETWORK-WAIT GATE: it holds for a min time AND
   until the page signals ready, then retracts (ring un-draws, rules recede, monogram
   fades). Harvested from D_saisei (S2 + S3 grid-skeleton).

   THE CONTRACT: show() -> hold (min-hold elapses AND ready() resolves) -> hide().
   This is the crux: a reusable loader must be min-hold + resolve-when-ready, never a
   hardcoded ms, or the skeleton-draw desyncs from real content readiness.

   CONFIG-DRIVEN:
     MonogramRingLoader.create(target, {
       glyph: '木',          // monogram (text) — or pass markup via opts.html
       bg: '#f0e9d2', ink: '#13130e',
       ringR: 30, grid: [7, 50, 93],   // vertical rule positions (% of width); [] = no skeleton
       minHold: 700,         // ms the loader is guaranteed to stay
       z: 9997
     })
   Returns { el, show(), ready(), hide(), whenDone(cb), destroy }.
   - show(): builds + animates the loader in (monogram fade, ring stroke-on, rules draw).
   - ready(): signal the page is loaded; hide() runs once BOTH minHold elapsed AND ready.
   - hide(): force the out animation (ring un-draws, rules recede, monogram fades), resolves whenDone.

   ENGINE LAWS: opacity + SVG stroke-dashoffset + transform(scaleY) only; NO mix-blend /
   NO backdrop; NO WebGL; reduced-motion -> instant in/out. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  var SVGNS = 'http://www.w3.org/2000/svg';

  function create(target, options) {
    options = options || {};
    var opt = {
      glyph: options.glyph || '木',
      html: options.html || null,
      bg: options.bg || '#f0e9d2',
      ink: options.ink || '#13130e',
      ringR: options.ringR != null ? options.ringR : 30,
      grid: options.grid || [7, 50, 93],
      minHold: options.minHold != null ? options.minHold : 700,
      z: options.z != null ? options.z : 9997
    };

    var host = !target ? doc.body : (typeof target === 'string' ? doc.querySelector(target) : target);
    if (!host) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }
    var isBody = host === doc.body;
    if (!isBody && getComputedStyle(host).position === 'static') host.style.position = 'relative';

    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gsap = global.gsap;

    // ---- build DOM ----
    var root = doc.createElement('div');
    root.className = 'mrl-root';
    root.style.cssText = 'position:' + (isBody ? 'fixed' : 'absolute') + ';inset:0;z-index:' + opt.z +
      ';background:' + opt.bg + ';display:grid;place-items:center;pointer-events:none;opacity:0';

    // grid skeleton (vertical rules) — drawn behind the monogram
    var rules = [];
    opt.grid.forEach(function (xPct) {
      var r = doc.createElement('div');
      r.className = 'mrl-rule';
      r.style.cssText = 'position:absolute;top:0;bottom:0;left:' + xPct + '%;width:1px;background:' +
        opt.ink + ';opacity:.18;transform:scaleY(0);transform-origin:top';
      root.appendChild(r); rules.push(r);
    });

    // monogram + ring (centred)
    var center = doc.createElement('div');
    center.className = 'mrl-center';
    center.style.cssText = 'position:relative;display:grid;place-items:center;width:' + (opt.ringR * 2 + 28) + 'px;height:' + (opt.ringR * 2 + 28) + 'px';

    var svg = doc.createElementNS(SVGNS, 'svg');
    var sz = opt.ringR * 2 + 8;
    svg.setAttribute('width', sz); svg.setAttribute('height', sz);
    svg.setAttribute('viewBox', '0 0 ' + sz + ' ' + sz);
    svg.style.cssText = 'position:absolute;inset:0;margin:auto;transform:rotate(135deg)'; // start the stroke at ~7 o'clock
    var ring = doc.createElementNS(SVGNS, 'circle');
    ring.setAttribute('cx', sz / 2); ring.setAttribute('cy', sz / 2); ring.setAttribute('r', opt.ringR);
    ring.setAttribute('fill', 'none'); ring.setAttribute('stroke', opt.ink); ring.setAttribute('stroke-width', '1');
    var circ = 2 * Math.PI * opt.ringR;
    ring.style.strokeDasharray = circ; ring.style.strokeDashoffset = circ; // fully un-drawn
    svg.appendChild(ring); center.appendChild(svg);

    var mono = doc.createElement('div');
    mono.className = 'mrl-mono';
    mono.style.cssText = 'font-family:var(--mrl-serif,"Fraunces",Georgia,serif);color:' + opt.ink +
      ';font-size:' + Math.round(opt.ringR * 0.95) + 'px;line-height:1;opacity:0';
    if (opt.html) mono.innerHTML = opt.html; else mono.textContent = opt.glyph;
    center.appendChild(mono);
    root.appendChild(center);
    host.appendChild(root);

    var shownAt = 0, isReady = false, hidden = false, doneCbs = [];
    function fireDone() { doneCbs.forEach(function (c) { try { c(); } catch (e) {} }); doneCbs = []; }

    function tween(obj, to, dur, ease, onUpd, onDone) {
      if (reduced || dur <= 0) { Object.assign(obj, to); onUpd && onUpd(); onDone && onDone(); return; }
      if (gsap) { var p = Object.assign({}, to); p.duration = dur; p.ease = ease; p.onUpdate = onUpd; p.onComplete = onDone; gsap.to(obj, p); return; }
      var keys = Object.keys(to), from = {}; keys.forEach(function (k) { from[k] = obj[k]; });
      var t0 = null; function ef(t) { return 1 - Math.pow(1 - t, 3); } // power3.out
      (function step(ts) { if (t0 == null) t0 = ts; var t = Math.min(1, (ts - t0) / (dur * 1000));
        keys.forEach(function (k) { obj[k] = from[k] + (to[k] - from[k]) * ef(t); }); onUpd && onUpd();
        if (t < 1) global.requestAnimationFrame(step); else { onDone && onDone(); } })(performance.now());
    }

    function show() {
      shownAt = (global.performance && performance.now) ? performance.now() : Date.now();
      root.style.opacity = '1';
      // Saisei 1:1 build ORDER: 木 fade (~130ms) -> ring strokes on (start ~130ms,
      // ~270ms) -> grid rules grow from both ends toward centre (start ~270ms, ~730ms).
      // 1) monogram fade-in
      var m = { o: 0 };
      tween(m, { o: 1 }, 0.13, 'power2.out', function () { mono.style.opacity = m.o; });
      // 2) ring strokes ON (after the glyph)
      var rg = { off: circ };
      setTimeout(function () { tween(rg, { off: 0 }, 0.27, 'power2.out', function () { ring.style.strokeDashoffset = rg.off; }); }, 130);
      // 3) grid rules draw from both ends toward the horizontal middle (centre-origin scaleY)
      rules.forEach(function (r) { r.style.transformOrigin = 'center'; });
      setTimeout(function () {
        rules.forEach(function (r, i) {
          var s = { v: 0 };
          setTimeout(function () { tween(s, { v: 1 }, 0.7, 'power3.out', function () { r.style.transform = 'scaleY(' + s.v + ')'; }); }, i * 60);
        });
      }, 270);
    }

    function doHide() {
      if (hidden) return; hidden = true;
      // ring un-draws, rules recede, monogram fades, then root fades
      var rg = { off: 0 };
      tween(rg, { off: circ }, 0.4, 'power2.in', function () { ring.style.strokeDashoffset = rg.off; });
      rules.forEach(function (r, i) { var s = { v: 1 }; setTimeout(function () { tween(s, { v: 0 }, 0.4, 'power3.in', function () { r.style.transform = 'scaleY(' + s.v + ')'; r.style.transformOrigin = 'bottom'; }); }, i * 60); });
      var m = { o: 1 }; tween(m, { o: 0 }, 0.3, 'power2.in', function () { mono.style.opacity = m.o; });
      var ro = { o: 1 };
      setTimeout(function () { tween(ro, { o: 0 }, 0.35, 'power2.inOut', function () { root.style.opacity = ro.o; }, function () { fireDone(); }); }, 260);
    }

    // hide only when BOTH minHold elapsed AND ready signalled
    function maybeHide() {
      if (!isReady) return;
      var now = (global.performance && performance.now) ? performance.now() : Date.now();
      var waited = now - shownAt, left = opt.minHold - waited;
      if (left <= 0) doHide(); else setTimeout(doHide, left);
    }
    function ready() { isReady = true; maybeHide(); }

    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      el: root, show: show, ready: ready, hide: doHide,
      whenDone: function (cb) { if (hidden && root.style.opacity === '0') cb(); else doneCbs.push(cb); },
      destroy: function () { root.parentNode && root.parentNode.removeChild(root); }
    };
  }

  var api = { create: create };
  global.MonogramRingLoader = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
