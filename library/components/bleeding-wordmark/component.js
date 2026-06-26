/* ============================================================
   BLEEDING-WORDMARK · component.js  (vanilla; optional GSAP+ScrollTrigger+Lenis
   for the parallax; degrades to static without them)
   ------------------------------------------------------------
   The oversized SECTION WORD that bleeds off the panel edge — the EVER/Springs
   "ARCHITECTURE / INTERIOR / TERRITORY", "Wellness / Nature / Place" signature.
   Harvested from the live read + teardown.

   THREE things make it read VI-grade (NOT just a big <h2>):
     1. FILL it to the line — the word spans (container width - gutters) at a giant
        scale via the fluid-type-sizing engine (composed in; any word, any length).
        EVER's is 108px @1440 / a vector logo filled to width; ours fills live text.
     2. CLIPPED REVEAL from the bottom edge — the word sits in an overflow:hidden
        wrap and rises (translateY 100%->0) into place. It is CLIPPED by the panel/
        viewport bottom, so it bleeds.
     3. MIRROR-LAW FILL — outline (`-webkit-text-stroke`, transparent fill) for one
        section, SOLID cream for the next. data-fill="outline" | "solid".
     + optional SLOW PARALLAX — the word drifts at ~0.5x the bg as you scroll
       through the section (depth), when GSAP+ScrollTrigger+Lenis are present.

   CONFIG-DRIVEN:
     BleedingWordmark.init(target, {
       fill: 'solid'|'outline',     // or read data-fill on the word
       gutter, fillRatio,           // passed to fluid-type-sizing
       reveal: true,                // clipped-rise on enter (default true)
       parallax: 0.5,               // word yPercent rate vs scroll (0 = none)
       strokePx: 1.6                // outline thickness
     })
   Markup: <div class="bwm" data-bleeding-wordmark data-fill="outline">
             <span class="bwm__i">архітектура</span></div>
   The wrap clips; .bwm__i is the rising/sized word. If FluidType is loaded it fills
   the line; else it falls back to the CSS font-size.

   LAW: transform + opacity only; GPU layer; NO mix-blend / NO backdrop. The reveal
   is an overflow:hidden clip + translateY (NOT clip-path on text). reduced-motion ->
   word shown at rest (no reveal/parallax). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';

  function init(target, options) {
    options = options || {};
    var els = typeof target === 'string'
      ? [].slice.call(document.querySelectorAll(target))
      : (target.length != null ? [].slice.call(target) : [target]);
    if (!els.length) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var FluidType = global.FluidType;
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var parallaxRate = options.parallax != null ? options.parallax : 0.5;
    var doReveal = options.reveal !== false;

    var made = els.map(function (wrap) {
      var word = wrap.querySelector('.bwm__i') || wrap.firstElementChild || wrap;
      var fill = options.fill || wrap.getAttribute('data-fill') || 'solid';

      // 1) mirror-law fill
      if (fill === 'outline') {
        word.style.color = 'transparent';
        word.style.webkitTextStroke = (options.strokePx != null ? options.strokePx : 1.6) + 'px currentColor';
        word.style.setProperty('-webkit-text-stroke-color', getComputedStyle(wrap).color || '#DCC5B7');
      }
      // 2) fill the line (compose with fluid-type-sizing if present)
      if (FluidType && FluidType.fit) {
        FluidType.fit(word, {
          container: options.container || wrap.parentElement || wrap,
          gutter: options.gutter != null ? options.gutter : 0,
          fill: options.fillRatio != null ? options.fillRatio : 1
        });
      }
      // 3) clipped-reveal init state
      if (doReveal && !reduced) { word.style.willChange = 'transform'; word.style.transform = 'translateY(110%)'; }
      return { wrap: wrap, word: word, fill: fill };
    });

    // reveal + parallax via ScrollTrigger if available, else reveal on load
    if (!reduced && gsap && ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      made.forEach(function (m) {
        if (doReveal) {
          gsap.to(m.word, {
            translateY: '0%', ease: 'power3.out', duration: 1.0,
            scrollTrigger: { trigger: m.wrap, start: 'top 88%', once: true }
          });
        }
        if (parallaxRate > 0) {
          gsap.fromTo(m.word, { yPercent: 0 }, {
            yPercent: -parallaxRate * 40, ease: 'none',
            scrollTrigger: { trigger: m.wrap, start: 'top bottom', end: 'bottom top', scrub: true }
          });
        }
      });
    } else if (!reduced) {
      // no ScrollTrigger: just reveal after a tick
      made.forEach(function (m) { if (doReveal) { m.word.style.transition = 'transform .9s cubic-bezier(.16,.84,.24,1)'; requestAnimationFrame(function(){ m.word.style.transform = 'translateY(0%)'; }); } });
    } else {
      made.forEach(function (m) { m.word.style.transform = 'none'; });
    }

    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      words: made,
      refit: function () { if (FluidType) made.forEach(function (m) { FluidType.refit && FluidType.refit(); }); }
    };
  }

  var api = { init: init };
  global.BleedingWordmark = api;
  global.bleedingWordmark = function (t, o) { return init(t, o); };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
