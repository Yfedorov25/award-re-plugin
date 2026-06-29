/* ============================================================================
   combo-scaffold.js — SectionHarness: the SHARED RAILS + the HONEST GATE for
   section-variant labs (library/combos/<id>/combo-lab.html).
   ----------------------------------------------------------------------------
   It does NOT wire atoms (that stays hand-authored per variant — CONTRACT law:
   "combos cite ids, never inline code; 5 different signatures, do NOT unify").
   It standardizes ONLY:
     - register GSAP plugins + the 'air' ease, once, from the one loaded source
     - SectionHarness.pin(stageSel, opts) -> the ONE section pin (refuses a 2nd if
       an engine atom already owns one -> the two-pins-fight guard)
     - SectionHarness.ranOK(name, fn) -> run a cited atom's wiring in try/catch,
       record {name, ok, threw, err} into window.__COMBO_RUN__
     - SectionHarness.declare({pinOwner, expectPins, atomsCited}) -> tell the probe
       the contract without it re-reading the RECIPE
     - the EXTENDED __LAB_OK__ probe (see assertions below), installed on load
   IIFE global: window.SectionHarness.   NO WebGL. transform/opacity/clip-path/filter only.
   ============================================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  global.__COMBO_RUN__ = global.__COMBO_RUN__ || [];

  // console.error shim (same allow-list spirit as the atom labs: file:// resource
  // misses are NOT code errors — a truly-missing render fails probe-4 loudly instead).
  var realErrs = [];
  var ALLOW = /Failed to load resource|ERR_FILE_NOT_FOUND|net::ERR|favicon/i;
  var _err = global.console && global.console.error ? global.console.error.bind(global.console) : function () {};
  if (global.console) global.console.error = function () {
    var msg = Array.prototype.map.call(arguments, String).join(' ');
    if (!ALLOW.test(msg)) realErrs.push(msg);
    _err.apply(null, arguments);
  };

  var _declared = null;        // { pinOwner, expectPins, atomsCited[] }
  var _harnessPin = null;      // the single section pin the harness created (if any)
  var _enginePinDeclared = false;

  function boot() {
    var g = global.gsap;
    if (g) {
      if (global.ScrollTrigger && g.registerPlugin) { try { g.registerPlugin(global.ScrollTrigger); } catch (e) {} }
      if (global.CustomEase && g.registerPlugin) { try { g.registerPlugin(global.CustomEase); } catch (e) {} }
      // the house 'air' ease, once
      if (global.CustomEase && !g.parseEase('air')) { try { global.CustomEase.create('air', '0.22,1,0.36,1'); } catch (e) {} }
    }
    return SectionHarness;
  }

  // run a cited atom's setup in try/catch; record the outcome for the honest probe
  function ranOK(name, fn) {
    var row = { name: name, ok: false, threw: false, err: null };
    try { fn(); row.ok = true; }
    catch (e) { row.threw = true; row.err = (e && e.message) || String(e); }
    global.__COMBO_RUN__.push(row);
    return row.ok;
  }

  // the ONE section pin. Refuses to create a second if an engine atom owns one.
  function pin(stageSel, opts) {
    opts = opts || {};
    if (_enginePinDeclared) throw new Error('SectionHarness.pin(): an engine atom already owns the pin — do not create a second');
    if (_harnessPin) return _harnessPin;
    var g = global.gsap;
    if (!g || !global.ScrollTrigger) return null;
    _harnessPin = global.ScrollTrigger.create({
      trigger: typeof stageSel === 'string' ? doc.querySelector(stageSel) : stageSel,
      start: opts.start || 'top top',
      end: opts.end || '+=120%',
      pin: true, pinSpacing: true, anticipatePin: 1,
      scrub: opts.scrub != null ? opts.scrub : true,
      onUpdate: function (self) { if (pin._onUpdate) pin._onUpdate(self.progress, self); }
    });
    // expose a settable onUpdate so the author writes `harness.pin(...).onUpdate = p => ...`
    Object.defineProperty(_harnessPin, 'onUpdate', { set: function (fn) { pin._onUpdate = fn; }, configurable: true });
    return _harnessPin;
  }

  function declare(d) {
    _declared = d || {};
    if (_declared.pinOwner && _declared.pinOwner !== 'harness' && _declared.pinOwner !== 'none') _enginePinDeclared = true;
  }

  // ---- the EXTENDED honest probe ----
  function reduced() { return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function realLoad(img) { return img && (img.complete ? img.naturalWidth > 0 : false); }
  function painted(el) {
    if (!el || !el.isConnected) return false;
    var r = el.getBoundingClientRect(); if (!(r.width > 1 && r.height > 1)) return false;
    // an <img> (self or descendant) decoded, OR a CSS background-image set
    if (el.tagName === 'IMG' && realLoad(el)) return true;
    var im = el.querySelector && el.querySelector('img'); if (im && realLoad(im)) return true;
    var bg = global.getComputedStyle(el).backgroundImage; if (bg && bg !== 'none') return true;
    // a <video> with a frame
    var v = el.tagName === 'VIDEO' ? el : (el.querySelector && el.querySelector('video'));
    if (v && (v.readyState >= 2 || v.videoWidth > 0)) return true;
    return false;
  }

  function evaluate() {
    var d = _declared || { expectPins: 1, atomsCited: [], pinOwner: 'harness' };
    var ST = global.ScrollTrigger;
    var pins = ST ? ST.getAll().filter(function (t) { return t.pin; }).length : 0;
    // 1 engine present
    if (!global.gsap) return false;
    // 2 pin budget honest (declared, <=1). sticky-CSS sections legally declare expectPins:0.
    var expect = d.expectPins != null ? d.expectPins : 1;
    if (expect > 1) return false;
    if (pins !== expect) return false;
    // 3 every cited REAL atom ran without throwing (stub atoms recorded but do not gate)
    var ran = global.__COMBO_RUN__;
    for (var i = 0; i < ran.length; i++) { if (ran[i].threw) return false; }
    // (the author wraps each REAL atom in ranOK; if it threw, fail. stubs aren't wrapped or are flagged.)
    // 4 a render painted at non-zero size
    var surf = doc.querySelector('[data-render-surface]');
    if (!painted(surf)) {
      // sticky-CSS section fallback: a [data-sticky-section] whose computed position is sticky/fixed counts
      var sticky = doc.querySelector('[data-sticky-section]');
      if (!(sticky && /sticky|fixed/.test(global.getComputedStyle(sticky).position) && painted(sticky))) return false;
    }
    // 5 zero real console errors
    if (realErrs.length) return false;
    return true;
  }

  function installProbe() {
    var tries = 0, MAX = 40;
    (function tick() {
      if (evaluate()) { try { global.__LAB_OK__ = true; } catch (e) {} return; }
      if (++tries < MAX) global.setTimeout(tick, 150);
      else { try { global.__LAB_OK__ = false; } catch (e) {} }   // stayed false -> gate reports why via __COMBO_RUN__ + realErrs
    })();
  }
  if (doc.readyState === 'complete') global.setTimeout(installProbe, 60);
  else global.addEventListener('load', function () { global.setTimeout(installProbe, 60); });

  var SectionHarness = { boot: boot, ranOK: ranOK, pin: pin, declare: declare,
    get errors() { return realErrs.slice(); }, get run() { return global.__COMBO_RUN__.slice(); } };
  global.SectionHarness = SectionHarness;
})(typeof window !== 'undefined' ? window : this);
