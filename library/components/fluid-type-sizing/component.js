/* ============================================================
   FLUID-TYPE-SIZING · component.js   (vanilla, no deps)
   ------------------------------------------------------------
   The giant-word SIZING ENGINE, harvested from the live EVER site.

   MEASURED LIVE (ever-live-here.com, 3 viewports):
     viewport 768  -> word width 728  (gutter 20)  94.8% vw
     viewport 1440 -> word width 1340 (gutter 50)  93.1% vw
     viewport 1920 -> word width 1780 (gutter 70)  92.7% vw
   So EVER's hero word = (viewport - 2*gutter) wide, ALWAYS. Its hero word is an
   SVG logo (fixed viewBox ratio 3.525) stretched to that width -> height follows
   the ratio. The word fills the line, never overflows, scales perfectly.

   The reusable MECHANISM (not EVER's specific letter): a single word/line is
   sized so it FILLS its container width minus gutters, at any viewport, for ANY
   word length. EVER did it with a vector logo (one fixed word). We need it to
   work for OUR varying words (quadro / архітектура / тераса), so this engine
   offers the same fill behaviour for live TEXT.

   TWO modes:
     mode:'fit'    (default) — measure the word's natural width at a probe size,
                    compute the font-size that makes it exactly fill
                    (containerWidth - 2*gutter), set it. Re-fits on resize and on
                    font load. Works for ANY word. This is OUR working case.
     mode:'vector' — a fixed-ratio brand mark (an <svg>/<img> word-logo): just set
                    width:(100% - gutters); height follows the intrinsic ratio.
                    This is exactly EVER's hero-logo behaviour. No JS needed beyond
                    keeping the gutter in sync.

   CONFIG-DRIVEN:
     FluidType.fit(el, { gutter, maxFontPx, minFontPx, fill })   // fill 0..1 of (w-2*gutter)
     FluidType.fitAll(selector, opts)
     FluidType.vector(el, { gutter })
   `gutter` accepts a number (px) or a fn(viewportWidth)->px (EVER's clamp:
     20 @768, 50 @1440, 70 @1920  ≈  clamp(20px, 3.6vw, 70px)).

   LAW: this only SIZES type (font-size / width). It does not animate. It pairs
   with section-pager + bleeding-wordmark. Re-fit is rAF-debounced on resize so it
   never thrashes layout. Sets window.__LAB_OK__ when at least one fit completes.
   ============================================================ */
(function (root) {
  'use strict';

  // EVER's measured gutter ramp as the default: ~clamp(20px, 3.6vw, 70px)
  function defaultGutter(vw) { return Math.max(20, Math.min(70, vw * 0.036)); }

  function resolveGutter(g, vw) {
    if (typeof g === 'function') return g(vw);
    if (typeof g === 'number') return g;
    return defaultGutter(vw);
  }

  // measure a single line's NATURAL width at a known probe font-size, via an
  // off-screen clone (NOT scrollWidth of the in-flow element — that is clamped by
  // the container, so all words would read the same width: the classic text-fit
  // trap). The clone copies the font properties that change advance width.
  function measureWidth(el, probePx) {
    var cs = getComputedStyle(el);
    var probe = document.createElement('span');
    probe.textContent = el.textContent;
    probe.style.cssText =
      'position:absolute;left:-99999px;top:-99999px;visibility:hidden;white-space:nowrap;display:inline-block;' +
      'font-family:' + cs.fontFamily + ';' +
      'font-weight:' + cs.fontWeight + ';' +
      'font-style:' + cs.fontStyle + ';' +
      'letter-spacing:' + cs.letterSpacing + ';' +
      'text-transform:' + cs.textTransform + ';' +
      'font-size:' + probePx + 'px;';
    document.body.appendChild(probe);
    var w = probe.getBoundingClientRect().width;
    document.body.removeChild(probe);
    return w;
  }

  // FIT: size `el`'s text so it fills (containerWidth - 2*gutter) * fill
  function fit(el, opts) {
    opts = opts || {};
    var fill = opts.fill != null ? opts.fill : 1;        // 1 = flush to the gutters
    var maxPx = opts.maxFontPx != null ? opts.maxFontPx : 100000;
    var minPx = opts.minFontPx != null ? opts.minFontPx : 8;
    var probe = opts.probePx || 100;

    var container = opts.container || el.parentElement || el;
    var cw = container.clientWidth || root.innerWidth;
    var gutter = resolveGutter(opts.gutter, root.innerWidth);
    // if the container already excludes gutters, pass gutter:0
    var target = (cw - 2 * gutter) * fill;
    if (target <= 0) return;

    el.style.whiteSpace = 'nowrap';
    // first pass: estimate size from a probe measurement
    var natural = measureWidth(el, probe);
    if (!natural) return;
    var size = probe * (target / natural);
    size = Math.max(minPx, Math.min(maxPx, size));
    el.style.fontSize = size.toFixed(2) + 'px';

    // second pass: em-based letter-spacing scales with font-size, so the first
    // estimate can over/undershoot. Measure the REAL rendered ink width at the
    // computed size and correct once (converges to <0.5% in practice).
    var range = document.createRange();
    range.selectNodeContents(el);
    var actual = range.getBoundingClientRect().width;
    if (actual > 0) {
      size = size * (target / actual);
      size = Math.max(minPx, Math.min(maxPx, size));
      el.style.fontSize = size.toFixed(2) + 'px';
    }

    el.__fluidFit = opts;     // remember so resize re-fits with the same config
    try { root.__LAB_OK__ = true; } catch (e) {}
    return size;
  }

  function fitAll(selector, opts) {
    var els = [].slice.call(document.querySelectorAll(selector));
    els.forEach(function (el) { fit(el, opts); });
    return els;
  }

  // VECTOR: a fixed-ratio word mark (svg/img) filling (100% - gutters). EVER's hero.
  function vector(el, opts) {
    opts = opts || {};
    var gutter = resolveGutter(opts.gutter, root.innerWidth);
    el.style.width = 'calc(100% - ' + (2 * gutter) + 'px)';
    el.style.height = 'auto';            // height follows the intrinsic ratio
    el.style.display = 'block';
    el.__fluidVector = opts;
    try { root.__LAB_OK__ = true; } catch (e) {}
    return el;
  }

  // re-fit everything we've sized, rAF-debounced, on resize / font load
  var pending = false, tracked = [];
  function track(el) { if (tracked.indexOf(el) < 0) tracked.push(el); }
  function refitAll() {
    tracked.forEach(function (el) {
      if (el.__fluidFit) fit(el, el.__fluidFit);
      else if (el.__fluidVector) vector(el, el.__fluidVector);
    });
  }
  function onResize() {
    if (pending) return; pending = true;
    requestAnimationFrame(function () { pending = false; refitAll(); });
  }

  // wrap fit/vector so they auto-track for resize
  function fitTracked(el, opts) { var r = fit(el, opts); track(el); return r; }
  function vectorTracked(el, opts) { var r = vector(el, opts); track(el); return r; }
  function fitAllTracked(sel, opts) {
    var els = [].slice.call(document.querySelectorAll(sel));
    els.forEach(function (el) { fitTracked(el, opts); });
    return els;
  }

  root.addEventListener('resize', onResize);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { refitAll(); });
  }

  var api = {
    fit: fitTracked,
    fitAll: fitAllTracked,
    vector: vectorTracked,
    measureWidth: measureWidth,
    defaultGutter: defaultGutter,
    refit: refitAll
  };
  root.FluidType = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
