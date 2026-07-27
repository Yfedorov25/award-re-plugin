/* ============================================================
   STROKE-DRAW-TITLE · component.js  (vanilla, GSAP optional)
   ------------------------------------------------------------
   Saisei's HOMEPAGE title reveal — the big serif word is drawn as OUTLINE STROKES that
   trace the letter contours (SVG stroke-dasharray / stroke-dashoffset full->0), then the
   FILL fades in, so the title writes itself onto the dark hero before becoming solid.
   Different from mask-up-title (which RISES the project title from a baseline); this one
   DRAWS the homepage title in place. Harvested from D_saisei (S5b; o_028-o_044).

   THE MOVE: an <svg><text> with the title, stroke = cream, no fill; stroke-dasharray =
   the path length so stroke-dashoffset animates length->0 (the outline traces on); then
   a fill-coloured copy fades in over it. The glyphs do NOT move — they draw in place.

   CONFIG-DRIVEN:
     StrokeDrawTitle.create(target, {        // target = a container; pass text + font via opts/markup
       text: 'SAISEI', font: 'Fraunces', weight: 300,
       stroke: '#f1ebd6', fill: '#f1ebd6', strokeWidth: 1,
       drawDur: 1.0, drawEase: 'power2.out',  // outline trace
       fillDelay: 0.5, fillDur: 0.6           // fill fade after the trace is underway
     })
   Returns { play(), set(p), reset(), destroy }.

   ENGINE LAWS: SVG stroke-dashoffset + opacity only; GPU; NO mix-blend / NO backdrop;
   NO WebGL; reduced-motion -> shown filled. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  var SVGNS = 'http://www.w3.org/2000/svg';

  function create(target, options) {
    options = options || {};
    var opt = {
      text: options.text || (typeof target === 'object' && target.getAttribute && target.getAttribute('data-text')) || 'SAISEI',
      font: options.font || 'Fraunces, Georgia, serif',
      weight: options.weight != null ? options.weight : 300,
      stroke: options.stroke || '#f1ebd6',
      fill: options.fill || '#f1ebd6',
      strokeWidth: options.strokeWidth != null ? options.strokeWidth : 1,
      drawDur: options.drawDur != null ? options.drawDur : 1.0,
      drawEase: options.drawEase || 'power2.out',
      fillDelay: options.fillDelay != null ? options.fillDelay : 0.5,
      fillDur: options.fillDur != null ? options.fillDur : 0.6
    };
    var host = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!host) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var gsap = global.gsap;

    // build the SVG: an outline <text> (stroke, draws on) + a fill <text> (fades in)
    var svg = doc.createElementNS(SVGNS, 'svg');
    svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    svg.style.cssText = 'display:block;overflow:visible';
    var common = function (t, isFill) {
      t.setAttribute('x', '50%'); t.setAttribute('y', '50%');
      t.setAttribute('text-anchor', 'middle'); t.setAttribute('dominant-baseline', 'central');
      t.style.fontFamily = opt.font; t.style.fontWeight = opt.weight;
      t.style.fontSize = options.fontSize || 'clamp(3rem, 13vw, 11rem)';
      t.style.letterSpacing = options.tracking || '-0.01em';
      t.textContent = opt.text;
      return t;
    };
    var outline = common(doc.createElementNS(SVGNS, 'text'));
    outline.setAttribute('fill', 'none'); outline.setAttribute('stroke', opt.stroke);
    outline.setAttribute('stroke-width', opt.strokeWidth);
    var fillT = common(doc.createElementNS(SVGNS, 'text'), true);
    fillT.setAttribute('fill', opt.fill); fillT.style.opacity = '0';
    svg.appendChild(outline); svg.appendChild(fillT);
    host.appendChild(svg);

    // measure the outline length for the dash trace
    var len = 0;
    try { len = outline.getComputedTextLength ? outline.getComputedTextLength() * 2.6 : 2000; } catch (e) { len = 2000; }
    if (!len || !isFinite(len)) len = 2000;
    outline.style.strokeDasharray = len; outline.style.strokeDashoffset = len; // fully un-drawn

    function setP(p) {
      // p 0 = nothing drawn; ~0..0.8 traces the outline; fill fades over the back half
      outline.style.strokeDashoffset = (len * (1 - p)).toFixed(1);
      var fillP = Math.max(0, (p - 0.5) / 0.5);
      fillT.style.opacity = Math.min(1, fillP).toFixed(3);
    }
    setP(0);

    function tween(setter, dur, easeName, done) {
      if (reduced || dur <= 0) { setter(1); if (done) done(); return; }
      if (gsap) { var o = { p: 0 }; gsap.to(o, { p: 1, duration: dur, ease: easeName, onUpdate: function () { setter(o.p); }, onComplete: function () { setter(1); if (done) done(); } }); return; }
      var ef = function (t) { return 1 - Math.pow(1 - t, 2); }, t0 = null, ms = dur * 1000;
      (function step(ts) { if (t0 == null) t0 = ts; var t = Math.min(1, (ts - t0) / ms); setter(ef(t)); if (t < 1) global.requestAnimationFrame(step); else { setter(1); if (done) done(); } })(performance.now());
    }

    function play(o) {
      o = o || {};
      if (reduced) { setP(1); o.onComplete && o.onComplete(); return; }
      // drive the outline trace; the fill is baked into setP over the back half
      tween(setP, o.drawDur || opt.drawDur, o.drawEase || opt.drawEase, o.onComplete);
    }

    try { global.__LAB_OK__ = true; } catch (e) {}
    return { svg: svg, play: play, set: setP, reset: function () { setP(0); }, destroy: function () { svg.remove(); } };
  }

  var api = { create: create };
  global.StrokeDrawTitle = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
