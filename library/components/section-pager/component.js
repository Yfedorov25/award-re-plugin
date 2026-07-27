/* ============================================================
   SECTION-PAGER · component.js   (vanilla, NO Lenis / NO GSAP / NO ScrollTrigger)
   ------------------------------------------------------------
   The wheel-hijack FULLPAGE PAGER engine, harvested ONE-TO-ONE from the live
   EVER site (ever-live-here.com) — read off its real landing.js + measured live.
   This is the engine BOTH EVER and most Vide-Infra "section curtain" sites run.

   IT IS NOT SCROLL-SCRUBBED. The page does not natively scroll. Stacked
   position:fixed full-viewport panes; one wheel / touch / key gesture = ONE
   section step, input LOCKED during the transition, a rAF tween moves TWO
   adjacent panes at once (the paired curtain):
       incoming  translateY  +100%  -> 0
       outgoing  translateY     0    -> -100%
   via easeOutQuart (verbatim from EVER's landing.js). TWO clocks per step:
   the short CURTAIN (panes) and a longer CONTENT settle (wordmark + per-line
   reveal + bg zoom) that OUTLASTS the curtain — that overhang is the luxury.

   CONFIG-DRIVEN (the whole point — re-fire on ANY content, not EVER's assets):
     SectionPager.init(target, {
       sections: [ ... ]            // optional: declarative section data (see below)
       curtainMs: 850,              // paired pane travel
       contentMs: 1700,             // wordmark + line reveal settle (outlasts curtain)
       bgZoomMs: 1700, bgZoom: 0.06,// incoming bg scale 1 -> 1+bgZoom
       ease: SectionPager.ease.easeOutQuart,
       lockPad: 90,                 // ms added to curtainMs for the input lock
       titleDelay: 0, copyDelay: 380,
       loop: false,
     })

   If `sections` is omitted, it pages whatever `.pane` children already live in
   the target (markup-first). If given, it BUILDS the panes from data. Either way
   the ENGINE (curtain + reveal + input) is identical — that is the reusable part.

   REVEAL is TRANSLATE-only (EVER barely fades): any element marked
   data-rise (or .rise) clipped-rises from below its overflow:hidden wrap over
   contentMs; data-rise-line wraps split into per-line spans each rising.

   SMOOTHNESS LAW: transform + opacity only, every pane its own GPU layer
   (translateZ(0)/will-change/backface-hidden/contain), NO mix-blend / NO
   backdrop-filter over a moving pane, NO clip-path on the moving pane (the
   curtain is pure translateY). prefers-reduced-motion / coarse-small -> the
   panes just stack and scroll normally (no hijack). Sets window.__LAB_OK__.
   ============================================================ */
(function (root) {
  'use strict';

  // ---- EVER easings, verbatim from their landing.js ----
  var ease = {
    linear:         function (t) { return t; },
    easeInOutQuad:  function (t) { return t < .5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2; },
    easeOutQuart:   function (t) { return 1 - (--t)*t*t*t; },                 // the curtain feel
    easeInOutQuart: function (t) { return t < .5 ? 8*t*t*t*t : 1 - 8*(--t)*t*t*t; },
    easeOutQuint:   function (t) { return 1 + (--t)*t*t*t*t; },
    easeInOutQuint: function (t) { return t < .5 ? 16*t*t*t*t*t : 1 + 16*(--t)*t*t*t*t; }
  };

  function el(sel, ctx) { return (ctx || document).querySelector(sel); }
  function all(sel, ctx) { return [].slice.call((ctx || document).querySelectorAll(sel)); }

  // rAF tween of a 0..1 progress, eased, with onUpdate(easedP, rawP) + onDone
  function tween(dur, easeFn, onUpdate, onDone) {
    var t0 = null;
    function frame(now) {
      if (t0 === null) t0 = now;
      var p = Math.min(1, (now - t0) / dur);
      onUpdate(easeFn(p), p);
      if (p < 1) requestAnimationFrame(frame);
      else if (onDone) onDone();
    }
    requestAnimationFrame(frame);
  }

  function init(target, opts) {
    opts = opts || {};
    var stage = typeof target === 'string' ? el(target) : target;
    if (!stage) { try { root.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var cfg = {
      curtainMs:  opts.curtainMs  != null ? opts.curtainMs  : 850,
      contentMs:  opts.contentMs  != null ? opts.contentMs  : 1700,
      bgZoomMs:   opts.bgZoomMs   != null ? opts.bgZoomMs   : 1700,
      bgZoom:     opts.bgZoom     != null ? opts.bgZoom     : 0.06,
      ease:       opts.ease       || ease.easeOutQuart,
      lockPad:    opts.lockPad    != null ? opts.lockPad    : 90,
      copyDelay:  opts.copyDelay  != null ? opts.copyDelay  : 380,
      loop:       !!opts.loop
    };

    var reduced = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var panes = all('.pane', stage);
    if (!panes.length) { try { root.__LAB_OK__ = true; } catch (e) {} return { error: 'no .pane children' }; }
    var N = panes.length, cur = 0, busy = false, wheelCD = 0;
    var LOCK = cfg.curtainMs + cfg.lockPad;

    // split any data-rise-line element into per-line rising spans (once)
    all('[data-rise-line]', stage).forEach(function (host) {
      if (host.__split) return; host.__split = true;
      var lines = host.innerHTML.split(/<br\s*\/?>(?![^<]*>)/i);
      host.innerHTML = lines.map(function (ln) {
        return '<span class="sp-ln"><span class="sp-ln__i">' + ln + '</span></span>';
      }).join('');
    });

    function risers(pane) {
      return all('[data-rise], .rise', pane)
        .concat(all('.sp-ln__i', pane));
    }
    function resetReveal(pane) {
      risers(pane).forEach(function (r) { r.style.transition = 'none'; r.style.transform = 'translateY(112%)'; });
      all('[data-fade]', pane).forEach(function (f) { f.style.transition = 'none'; f.style.opacity = '0'; f.style.transform = 'translateY(22px)'; });
    }
    function reveal(pane) {
      var rs = risers(pane);
      rs.forEach(function (r) { r.style.transform = 'translateY(112%)'; });
      // all risers settle over contentMs (outlasts the curtain), tiny per-item cascade
      tween(cfg.contentMs, cfg.ease, function (e) {
        rs.forEach(function (r, k) {
          var le = Math.min(1, e * (1 + k * 0.05));
          r.style.transform = 'translateY(' + ((1 - cfg.ease(le)) * 112) + '%)';
        });
      });
      // fades come a beat later (EVER uses these sparingly — sub copy)
      var fades = all('[data-fade]', pane);
      if (fades.length) setTimeout(function () {
        tween(900, cfg.ease, function (e) {
          fades.forEach(function (f) { f.style.transform = 'translateY(' + ((1 - e) * 22) + 'px)'; f.style.opacity = String(e); });
        });
      }, cfg.copyDelay);
    }

    function step(dir) {
      if (busy) return;
      var next = cur + dir;
      if (cfg.loop) next = (next + N) % N;
      if (next < 0 || next >= N) return;
      busy = true;
      stage.classList.add('is-moving');

      var outPane = panes[cur], inPane = panes[next];
      var H = root.innerHeight;
      var fromY = dir > 0 ? H : -H;
      var outToY = dir > 0 ? -H : H;

      inPane.style.transform = 'translate3d(0,' + fromY + 'px,0)';
      inPane.style.zIndex = 5; outPane.style.zIndex = 4;
      resetReveal(inPane);

      var bg = el('.bg img', inPane) || el('[data-bg]', inPane);
      if (bg) tween(cfg.bgZoomMs, cfg.ease, function (e) {
        bg.style.transform = 'translateZ(0) scale(' + (1 + cfg.bgZoom * e) + ')';
      });

      tween(cfg.curtainMs, cfg.ease, function (e) {
        inPane.style.transform  = 'translate3d(0,' + (fromY * (1 - e)) + 'px,0)';
        outPane.style.transform = 'translate3d(0,' + (outToY * e) + 'px,0)';
      }, function () {
        inPane.style.transform = 'translate3d(0,0,0)';
        outPane.style.transform = 'translate3d(0,' + outToY + 'px,0)';
        var ob = el('.bg img', outPane) || el('[data-bg]', outPane);
        if (ob) ob.style.transform = 'translateZ(0) scale(1)';
        cur = next; busy = false;
        stage.classList.remove('is-moving');
        if (opts.onStep) opts.onStep(cur, panes[cur]);
      });

      reveal(inPane);
    }

    // ---- input ----
    function onWheel(ev) {
      ev.preventDefault();
      var now = performance.now();
      if (busy || now < wheelCD || Math.abs(ev.deltaY) < 8) return;
      wheelCD = now + LOCK;
      step(ev.deltaY > 0 ? 1 : -1);
    }
    function onKey(ev) {
      if (ev.key === 'ArrowDown' || ev.key === 'PageDown' || ev.key === ' ') { ev.preventDefault(); step(1); }
      if (ev.key === 'ArrowUp' || ev.key === 'PageUp') { ev.preventDefault(); step(-1); }
    }
    var ty = 0;
    function onTouchStart(e) { ty = e.touches[0].clientY; }
    function onTouchEnd(e) { var dy = ty - e.changedTouches[0].clientY; if (Math.abs(dy) > 40) step(dy > 0 ? 1 : -1); }

    function mountStatic() {
      // reduced-motion / no-hijack: panes flow as normal stacked sections
      stage.classList.add('sp-static');
      panes.forEach(function (p) { p.style.position = 'relative'; p.style.transform = 'none'; });
      try { root.__LAB_OK__ = true; } catch (e) {}
      return { static: true, destroy: function () {} };
    }

    function start() {
      panes.forEach(function (p, i) {
        p.style.transform = i === 0 ? 'translate3d(0,0,0)' : 'translate3d(0,' + root.innerHeight + 'px,0)';
      });
      stage.classList.add('sp-ready');
      root.addEventListener('wheel', onWheel, { passive: false });
      root.addEventListener('keydown', onKey);
      root.addEventListener('touchstart', onTouchStart, { passive: true });
      root.addEventListener('touchend', onTouchEnd, { passive: true });
      try { root.__LAB_OK__ = true; } catch (e) {}
      if (opts.onStep) opts.onStep(0, panes[0]);
    }

    if (reduced) return mountStatic();
    if (document.readyState === 'complete' || document.readyState === 'interactive') start();
    else document.addEventListener('DOMContentLoaded', start);

    return {
      ease: ease,
      go: step,
      to: function (i) { step(i - cur); },
      current: function () { return cur; },
      destroy: function () {
        root.removeEventListener('wheel', onWheel);
        root.removeEventListener('keydown', onKey);
        root.removeEventListener('touchstart', onTouchStart);
        root.removeEventListener('touchend', onTouchEnd);
      }
    };
  }

  var api = { init: init, ease: ease };
  root.SectionPager = api;
  // alias to match the lower-camel convention some labs use
  root.sectionPager = function (t, o) { return init(t, o); };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
