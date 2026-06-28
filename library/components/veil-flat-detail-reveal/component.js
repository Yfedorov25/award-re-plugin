/* ============================================================
   VEIL-FLAT-DETAIL-REVEAL · component.js  (vanilla + GSAP 3.12.5; no ScrollTrigger needed)
   ------------------------------------------------------------
   EVER visual-search LEVEL 3 — the calm single-unit detail, reached via a dark full-screen VEIL
   page-transition (close -> hold -> open), as a SINGLE-PAGE fixed-overlay MODAL (not a route).
   Two-tone layout: a neutral grey-blue LEFT data rail (big type 3E / area / spaced-thousands price
   / one dark Reserve pill / favourite+compare / Similar) beside a distinct LIGHTER plan canvas
   (the two-tone split IS the design). The plan = a clean inline SVG that fades-up (+ optional
   perimeter draw-in) AFTER the veil clears; locator chips (floor-plate wireframe with THIS unit
   dark + compass + site mini-map with THIS building dark, from the SAME path coords) + a sculptural
   seed straddling the seam fade in last. AIR is the luxury — no text wall. Harvested from
   D_ever_visualsearch_video.md (§4 / Level 3). The fix for the smarts modal text-wall.

   THE VEIL (the premium feel + hides the content swap):
     COVER ~400ms (power2.inOut) -> HOLD ~300ms (swap content UNSEEN, NO spinner/percent/logo) ->
     UNCOVER ~450ms (expo.out) -> then REVEAL: plan + rail fade-up (opacity 0->1 + y 12->0 +
     scale 0.985->1), locator chips + seed stagger in last. REVERSE (close / 'back to the floor')
     replays the veil and hides the overlay (no router).

   CONFIG-DRIVEN:
     VeilFlatDetailReveal.create(target, {         // target = .vfd-overlay (a fixed, hidden modal node)
       veilColor: '#2c343a', coverDur: 0.4, holdDur: 0.3, uncoverDur: 0.45, ease: 'expo.out',
       drawPlan: true, fmtPrice: fn(n), onReserve: fn(unit), onClose: fn()
     })
   open(unit): unit = { type, sub, areaM2, price, planSVG (string|id), floorChipSVG, siteChipSVG,
     crumbs, status }. Swaps the overlay's content per unit, replays the veil.
   Markup: .vfd-overlay > .vfd-veil + .vfd-page( .vfd-head + .vfd-rail(...) + .vfd-canvas( .vfd-plan +
   .vfd-locators( .vfd-floorchip + .vfd-compass + .vfd-sitechip ) + .vfd-seed ) ). The engine fills
   data slots by class. Returns { open(unit), close(), destroy }.

   ENGINE LAWS: transform + opacity (+ stroke-dashoffset for the optional plan draw) only; GPU; NO
   mix-blend; NO WebGL. ONE overlay node, data swapped per unit (never a DOM subtree per unit).
   reduced-motion -> no veil animation (instant swap) + no plan draw; still opens/closes. __LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      veilColor: options.veilColor || '#2c343a',
      coverDur: options.coverDur != null ? options.coverDur : 0.4,
      holdDur: options.holdDur != null ? options.holdDur : 0.3,
      uncoverDur: options.uncoverDur != null ? options.uncoverDur : 0.45,
      ease: options.ease || 'expo.out',
      drawPlan: options.drawPlan !== false,
      fmtPrice: typeof options.fmtPrice === 'function' ? options.fmtPrice : function (n) { return n != null ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽' : ''; },
      onReserve: typeof options.onReserve === 'function' ? options.onReserve : null,
      onClose: typeof options.onClose === 'function' ? options.onClose : null
    };
    var ov = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!ov) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var veil = ov.querySelector('.vfd-veil');
    var page = ov.querySelector('.vfd-page');
    var planWrap = ov.querySelector('.vfd-plan');
    var locators = ov.querySelector('.vfd-locators');
    var seed = ov.querySelector('.vfd-seed');
    var rail = ov.querySelector('.vfd-rail');
    var backBtn = ov.querySelector('.vfd-back');
    var reserveBtn = ov.querySelector('.vfd-reserve');
    var gsap = global.gsap;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var current = null, open = false;

    if (veil) veil.style.background = opt.veilColor;

    function fill(unit) {
      function set(sel, val) { var el = ov.querySelector(sel); if (el != null && val != null) el.textContent = val; }
      set('.vfd-type', unit.type);
      set('.vfd-sub', unit.sub);
      set('.vfd-area', unit.areaM2 != null ? unit.areaM2 + ' M²' : '');
      var priceEl = ov.querySelector('.vfd-price');
      if (priceEl) priceEl.textContent = unit.status === 'sold' ? 'Продано' : opt.fmtPrice(unit.price);
      set('.vfd-crumbs', unit.crumbs);
      // plan
      if (planWrap && unit.planSVG != null) {
        if (typeof unit.planSVG === 'string' && unit.planSVG.indexOf('<svg') === 0) planWrap.innerHTML = unit.planSVG;
        else if (typeof unit.planSVG === 'string') { var src = doc.getElementById(unit.planSVG); planWrap.innerHTML = src ? src.innerHTML : ''; }
      }
      // locator chips: inject + set active by data-nr / data-block
      var fc = ov.querySelector('.vfd-floorchip'); if (fc && unit.floorChipSVG) fc.innerHTML = unit.floorChipSVG;
      var sc = ov.querySelector('.vfd-sitechip'); if (sc && unit.siteChipSVG) sc.innerHTML = unit.siteChipSVG;
      // active fills (THIS unit / THIS building dark) by data-attr
      if (fc && unit.floorNr != null) { var cell = fc.querySelector('[data-nr="' + unit.floorNr + '"]'); if (cell) cell.classList.add('is-active'); }
      if (sc && unit.siteBlock != null) { var blk = sc.querySelector('[data-block="' + unit.siteBlock + '"]'); if (blk) blk.classList.add('is-active'); }
      if (reserveBtn) reserveBtn.classList.toggle('is-disabled', unit.status === 'sold');
    }

    // the reveal of the content after the veil clears
    function revealContent() {
      if (!gsap || reduced) {
        [planWrap, rail].forEach(function (el) { if (el) { el.style.opacity = '1'; el.style.transform = 'none'; } });
        if (locators) locators.style.opacity = '1'; if (seed) seed.style.opacity = '1';
        // optional perimeter draw skipped under reduced-motion
        return;
      }
      var tl = gsap.timeline();
      tl.fromTo([rail, planWrap], { autoAlpha: 0, y: 12, scale: 0.985 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: opt.ease, stagger: 0.05 }, 0);
      tl.fromTo([locators, seed].filter(Boolean), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: opt.ease, stagger: 0.08 }, 0.18);
      // optional perimeter draw-in of the plan
      if (opt.drawPlan && planWrap) {
        var peri = planWrap.querySelector('.vfd-plan__peri');
        if (peri && peri.getTotalLength) {
          var L = peri.getTotalLength();
          gsap.set(peri, { strokeDasharray: L, strokeDashoffset: L });
          gsap.to(peri, { strokeDashoffset: 0, duration: 0.6, ease: 'power1.inOut', delay: 0.1 });
        }
      }
    }

    function runVeil(swapFn, after) {
      if (!gsap || reduced) { swapFn && swapFn(); ov.style.visibility = 'visible'; ov.style.opacity = '1'; after && after(); return; }
      var tl = gsap.timeline();
      // COVER
      tl.set(ov, { visibility: 'visible', pointerEvents: 'auto' });
      tl.fromTo(veil, { yPercent: 100 }, { yPercent: 0, duration: opt.coverDur, ease: 'power2.inOut' });
      // HOLD (swap content unseen)
      tl.add(function () { swapFn && swapFn(); }, '+=0.02');
      tl.to({}, { duration: opt.holdDur });
      // UNCOVER
      tl.to(veil, { yPercent: -100, duration: opt.uncoverDur, ease: opt.ease });
      tl.add(function () { after && after(); });
    }

    function openUnit(unit) {
      current = unit; open = true;
      // pre-hide content so the reveal has somewhere to come from
      if (gsap && !reduced) gsap.set([rail, planWrap, locators, seed].filter(Boolean), { autoAlpha: 0 });
      ov.classList.add('is-open');
      runVeil(function () { fill(unit); }, function () { revealContent(); });
    }
    function close() {
      if (!open) return; open = false;
      if (!gsap || reduced) { ov.style.visibility = 'hidden'; ov.style.opacity = '0'; ov.classList.remove('is-open'); if (opt.onClose) opt.onClose(); return; }
      var tl = gsap.timeline();
      tl.fromTo(veil, { yPercent: 100 }, { yPercent: 0, duration: opt.coverDur, ease: 'power2.inOut' });
      tl.add(function () { ov.classList.remove('is-open'); ov.style.visibility = 'hidden'; ov.style.pointerEvents = 'none'; if (opt.onClose) opt.onClose(); });
      tl.to(veil, { yPercent: -100, duration: opt.uncoverDur, ease: opt.ease });
    }

    if (backBtn) backBtn.addEventListener('click', function (e) { e.preventDefault(); close(); });
    if (reserveBtn) reserveBtn.addEventListener('click', function (e) { e.preventDefault(); if (!reserveBtn.classList.contains('is-disabled') && opt.onReserve) opt.onReserve(current); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) close(); });

    // start hidden
    ov.style.visibility = 'hidden'; ov.style.pointerEvents = 'none';
    if (veil && gsap) gsap.set(veil, { yPercent: -100 });

    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      open: openUnit, close: close, get current() { return current; }, get isOpen() { return open; },
      destroy: function () {}
    };
  }

  var api = { create: create };
  global.VeilFlatDetailReveal = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
