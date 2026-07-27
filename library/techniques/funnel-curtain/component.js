/* ============================================================
   FUNNEL-CURTAIN · component.js  (DUAL-PLATFORM wrapper)
   ------------------------------------------------------------
   Springs' lead-funnel / callback CTA "curtain": the conversion beat.
   Tap [SEARCH FLATS ✛] / [AVAILABLE SOON] → the black wordmark curtain
   rides up, covers, swaps the page UNDER full coverage, then rides out —
   the "you stepped into the funnel" ritual. Imperative engine (proven
   FunnelCurtain.create → play(swapFn, mode)): NOT scroll-driven, owns no
   pin, no narrow-guard (already responsive). So NO engine patch — same
   posture as portrait-carousel.

   🔴 DUAL-PLATFORM — the curtain MECHANIC is identical (the same
   FunnelCurtain.play drives translateY of the same panel on both). This
   is the INTERACTION-DRIVEN subtype (teardown: trigger = programmatic
   play() on a CTA tap, NOT scroll — RECIPE trigger, and mobile-is-
   pinned-scroll exception list: conversion CTA is a TAP beat, not a
   scroll-pin). The INPUT/PRESET + LAYOUT differ:

     desktop  →  tapFunnel('curtain')  — the CTA button drives the FULL
                 brand ritual (rise → billboard pause → cover → swap →
                 exit, ~2.25s). Springs desktop funnel hub is the wide
                 2-col beat; the drill between visual-search levels can
                 use mode:'flash' (short black blink, no wordmark).

     mobile   →  tapFunnel('curtain')  — the SAME CTA tap drives the SAME
                 curtain; springs mobile funnel is single-col full-bleed,
                 so the ritual reads over the whole phone. Same play(),
                 same swap-under-coverage contract.

   Both branches drive the SAME engine play(swapFn, mode) — only the
   LAYOUT + which preset differ. See meta.json{differs}.

   reduced-motion → the engine calls swapFn immediately, zero curtain
   (accessibility preserved by the core).

   Entry: FunnelCurtainDual.init(target, opts) -> { platform, engine, driver }.
   ============================================================ */
(function (global) {
  'use strict';

  function resolvePlatform(opt) {
    if (opt === 'desktop' || opt === 'mobile') return opt;
    var isDesktop = global.matchMedia && global.matchMedia('(min-width:1024px)').matches;
    return isDesktop ? 'desktop' : 'mobile';
  }

  /* Wire every [data-fc-cta] inside the stage to play the curtain.
     data-fc-swap = selector of the "next page" panel to reveal under
     coverage; data-fc-mode = 'curtain' (default) | 'flash'. Same for
     both platforms — the only difference is the surrounding layout. */
  function tapFunnel(stage, fc, opt) {
    var ctas = stage.querySelectorAll('[data-fc-cta]');
    function bind(btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-fc-mode') || opt.mode || 'curtain';
        var sel = btn.getAttribute('data-fc-swap');
        fc.play(function () {
          if (!sel) return;
          var cur = stage.querySelector('.fc-page.is-on');
          var nxt = stage.querySelector(sel);
          if (cur) cur.classList.remove('is-on');
          if (nxt) nxt.classList.add('is-on');
          stage.setAttribute('data-fc-swapped', '1');
        }, mode);
      });
    }
    for (var i = 0; i < ctas.length; i++) bind(ctas[i]);
    return { ctas: ctas.length, mode: opt.mode || 'curtain' };
  }

  function init(target, options) {
    options = options || {};
    var stage = typeof target === 'string' ? document.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }
    if (!global.FunnelCurtain) { return { error: 'engine (FunnelCurtain) not loaded' }; }

    var platform = resolvePlatform(options.platform || 'auto');

    /* engine opts = everything except wrapper-only keys */
    var engineOpts = {};
    for (var k in options) {
      if (options.hasOwnProperty(k) && k !== 'platform' && k !== 'mode') engineOpts[k] = options[k];
    }
    var fc = global.FunnelCurtain.create(engineOpts);
    if (!fc || !fc.play) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'engine play unavailable', engine: fc }; }

    stage.setAttribute('data-fc-platform', platform);

    /* SAME driver on both platforms — the curtain is a TAP beat, not a
       scroll-pin. The wrapper only wires CTAs to play(). Layout differs
       in the CSS/markup, not here. */
    var driver = tapFunnel(stage, fc, { mode: options.mode });

    try { global.__LAB_OK__ = true; } catch (e) {}
    return { platform: platform, engine: fc, driver: driver };
  }

  var api = { init: init };
  global.FunnelCurtainDual = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
