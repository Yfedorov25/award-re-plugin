/* ============================================================
   CIRCULAR-UI-LANGUAGE · component.js  (vanilla, no deps)
   ------------------------------------------------------------
   The interactive states for the circular UI vocabulary (the shapes live in CSS):
     - "+" expander toggles to × (.is-open) on click.
     - wordmark -> monogram collapse on first scroll (EVER/Springs header).
   Harvested from the live read (P21). Pairs with theme-tween (everything inherits
   currentColor) and with carousel/menu/map (the arrows/pins/POI chips).

   CONFIG-DRIVEN:
     CircularUI.init({
       plus: '.cui-plus',          // expanders to toggle (optional)
       brand: '.cui-brand',         // wordmark->monogram on scroll (optional)
       monoAt: 40                   // scrollY px after which the brand collapses
     })

   LAW: opacity + transform only (the CSS does the rotate/crossfade); no layout
   thrash. reduced-motion -> transitions still fine (short). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';

  function init(options) {
    options = options || {};
    var monoAt = options.monoAt != null ? options.monoAt : 40;

    // "+" expanders -> toggle .is-open (+ -> ×)
    var plusSel = options.plus || '.cui-plus';
    [].slice.call(document.querySelectorAll(plusSel)).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var open = btn.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (options.onToggle) options.onToggle(btn, open);
      });
    });

    // wordmark -> monogram on scroll
    var brands = [].slice.call(document.querySelectorAll(options.brand || '.cui-brand'));
    if (brands.length) {
      var pending = false;
      function update() {
        var mono = (global.scrollY || global.pageYOffset || 0) > monoAt;
        brands.forEach(function (b) { b.classList.toggle('is-mono', mono); });
      }
      global.addEventListener('scroll', function () {
        if (pending) return; pending = true;
        requestAnimationFrame(function () { pending = false; update(); });
      }, { passive: true });
      update();
    }

    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      collapseBrand: function (on) { brands.forEach(function (b) { b.classList.toggle('is-mono', !!on); }); }
    };
  }

  // tiny helper: build a ring button with an arrow / plus, returns the element
  function ring(kind, opts) {
    opts = opts || {};
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'cui-ring' + (opts.size ? ' cui-ring--' + opts.size : '');
    if (kind === 'plus') { b.classList.add('cui-plus'); b.setAttribute('aria-label', opts.label || 'розгорнути'); }
    else if (kind === 'prev' || kind === 'next') {
      var d = kind === 'next' ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7';
      b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="' + d + '"/></svg>';
      b.setAttribute('aria-label', kind === 'next' ? 'далі' : 'назад');
    }
    return b;
  }

  var api = { init: init, ring: ring };
  global.CircularUI = api;
  global.circularUI = function (o) { return init(o); };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
