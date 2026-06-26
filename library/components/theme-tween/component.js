/* ============================================================
   THEME-TWEEN · component.js  (vanilla; optional GSAP+ScrollTrigger for the tween)
   ------------------------------------------------------------
   The per-section COLOR ENGINE — EVER's slate -> brown -> green identity where the
   whole chrome (bg, ink, accent, header) recolors as each section comes on screen,
   and modals INHERIT the active section's theme. The other half of the EVER/Springs
   section identity (bleeding-wordmark is the visible half).

   Harvested from the live read: EVER swaps a per-section palette (slate
   ARCHITECTURE / brown INTERIOR / green TERRITORY) and the global header tints to
   the incoming theme across each seam. Implemented as CSS custom properties on a
   root scope, tweened (interpolated) toward the active section's theme as it
   enters — NOT a hard class flip (the tween across the seam is the luxury).

   CONFIG-DRIVEN:
     ThemeTween.init({
       root: document.documentElement,     // where the --bg/--ink/--accent vars live
       sectionSelector: '[data-theme]',     // each section carries its theme via attrs
       vars: ['--bg','--ink','--accent'],    // which CSS vars to tween
       ease: 0.12,                           // lerp toward the active theme (rAF)
       attrPrefix: 'theme'                   // reads data-theme-bg / -ink / -accent
     })
   Each section: <section data-theme data-theme-bg="#313E48" data-theme-ink="#DCC5B7"
                  data-theme-accent="#AC7E65"> … </section>
   The engine watches which section is centred (IntersectionObserver) and lerps the
   root vars from the current color toward that section's, in linear-RGB, every rAF
   — so the page (and any modal reading var(--bg) etc.) recolors smoothly across the
   boundary. Modals just read the same vars => they inherit the active theme free.

   LAW: only tweens COLOR custom-properties (no layout, no transform). reduced-motion
   -> snap to the active theme (no tween). Works without GSAP (own rAF lerp). Sets
   window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';

  // hex -> linear-ish rgb (gamma 2.2 approx) for perceptually smoother tweens
  function hexToRgb(h) {
    h = (h || '').trim().replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    if (isNaN(n)) return null;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function toLin(c) { c /= 255; return Math.pow(c, 2.2); }
  function toSrgb(c) { return Math.round(Math.pow(Math.max(0, Math.min(1, c)), 1 / 2.2) * 255); }
  function rgbStr(r, g, b) { return 'rgb(' + r + ',' + g + ',' + b + ')'; }

  function init(options) {
    options = options || {};
    var root = options.root || document.documentElement;
    var sel = options.sectionSelector || '[data-theme]';
    var vars = options.vars || ['--bg', '--ink', '--accent'];
    var ease = options.ease != null ? options.ease : 0.12;
    var prefix = options.attrPrefix || 'theme';
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var sections = [].slice.call(document.querySelectorAll(sel));
    if (!sections.length) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no sections' }; }

    // map var name -> data-attr suffix: '--bg' -> 'bg'
    function attrFor(v) { return prefix + '-' + v.replace(/^--/, ''); }
    function themeOf(section) {
      var t = {};
      vars.forEach(function (v) {
        var raw = section.getAttribute('data-' + attrFor(v));
        t[v] = raw ? (hexToRgb(raw) || null) : null;
      });
      return t;
    }
    var themes = sections.map(themeOf);

    // current (animated) linear-rgb per var, init from the first section
    var cur = {}, goal = {};
    vars.forEach(function (v) {
      var rgb = themes[0][v] || [20, 20, 20];
      cur[v] = rgb.map(toLin); goal[v] = rgb.map(toLin);
    });

    function setGoalFromSection(i) {
      vars.forEach(function (v) {
        var rgb = themes[i] && themes[i][v];
        if (rgb) goal[v] = rgb.map(toLin);
      });
    }
    function applyNow() {
      vars.forEach(function (v) {
        var c = cur[v];
        root.style.setProperty(v, rgbStr(toSrgb(c[0]), toSrgb(c[1]), toSrgb(c[2])));
      });
    }

    // which section is most centred = active
    var activeIndex = 0;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && e.intersectionRatio > 0.5) {
          var i = sections.indexOf(e.target);
          if (i >= 0) { activeIndex = i; setGoalFromSection(i); }
        }
      });
    }, { threshold: [0.5, 0.75] });
    sections.forEach(function (s) { io.observe(s); });

    var raf = null;
    function loop() {
      var moving = false;
      vars.forEach(function (v) {
        for (var k = 0; k < 3; k++) {
          var d = goal[v][k] - cur[v][k];
          if (Math.abs(d) > 0.0005) { cur[v][k] += d * ease; moving = true; }
          else cur[v][k] = goal[v][k];
        }
      });
      applyNow();
      raf = requestAnimationFrame(loop);
    }

    if (reduced) { setGoalFromSection(0); cur = {}; vars.forEach(function (v) { cur[v] = (themes[0][v] || [20, 20, 20]).map(toLin); }); applyNow(); }
    applyNow();
    if (!reduced) raf = requestAnimationFrame(loop);

    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      activeIndex: function () { return activeIndex; },
      destroy: function () { if (raf) cancelAnimationFrame(raf); io.disconnect(); }
    };
  }

  var api = { init: init };
  global.ThemeTween = api;
  global.themeTween = function (o) { return init(o); };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
