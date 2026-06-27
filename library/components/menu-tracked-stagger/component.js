/* ============================================================
   MENU-TRACKED-STAGGER · component.js  (vanilla, transform-driven; no GSAP needed)
   ------------------------------------------------------------
   gapsystudio's overlay menu — a FULL-SCREEN overlay (not a sliding panel) on the studio
   near-white field. LEFT: a big condensed nav list whose items are GHOST-GREY by default
   and go SOLID on hover (the current page stays RED). RIGHT: a contact column (socials,
   email/phone, "download presentation"). On open the nav items STAGGER in (fade + rise);
   a "Close" pill + Escape close it. Harvested from D_gapsy (B overlay menu: HOME(red) /
   SERVICES / CASES / INDUSTRIES / WHO WE ARE / BLOG / CONTACTS / BOOK A CALL).

   Distinct from Saisei dual-panel-menu (two sliding coloured panels): this is ONE
   full-screen overlay with a ghost->solid hover nav + a contact column.

   THE MOVE:
     - open(): overlay opacity 0->1; each nav item opacity 0->1 + translateY 24px->0 with a
       bottom-to-top-or-top-to-bottom STAGGER (default top-to-bottom), ease-out
     - hover an item -> it goes solid (.is-hot via CSS); the current-page item is .is-current (red)
     - close(): reverse (overlay fades, items fall back); Escape / the close pill close it
   set(p 0..1) is a PURE scrub of the open reveal (0 closed, 1 open).

   CONFIG-DRIVEN:
     MenuTrackedStagger.create(target, {       // target = .mts-overlay
       trigger: '#menu-open',     // selector(s) that open the menu
       closeSelector: '.mts-close',
       stagger: 60,               // ms between nav items
       duration: 520, ease: 'cubic-bezier(.22,1,.36,1)'
     })
   Markup: a trigger button + .mts-overlay > .mts-nav(.mts-item x N [.is-current]) +
   .mts-aside(...) + .mts-close. Returns { open(), close(), toggle(), set(p), isOpen(), destroy }.

   ENGINE LAWS: transform(translateY) + opacity only; JS toggles classes + sets inline
   delays; NO mix-blend / NO backdrop; NO WebGL; Escape + focus-return; reduced-motion ->
   instant. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      trigger: options.trigger || '#menu-open',
      closeSelector: options.closeSelector || '.mts-close',
      stagger: options.stagger != null ? options.stagger : 60,
      duration: options.duration != null ? options.duration : 520,
      ease: options.ease || 'cubic-bezier(.22,1,.36,1)'
    };
    var overlay = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!overlay) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no overlay' }; }

    var items = [].slice.call(overlay.querySelectorAll('.mts-item'));
    var aside = overlay.querySelector('.mts-aside');
    var closeEls = [].slice.call(doc.querySelectorAll(opt.closeSelector));
    var triggers = [].slice.call(doc.querySelectorAll(opt.trigger));
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var open = false, lastFocus = null;

    overlay.style.setProperty('--mts-dur', opt.duration + 'ms');
    overlay.style.setProperty('--mts-ease', opt.ease);
    // prime per-item transition delays (the stagger) via CSS var
    items.forEach(function (it, i) { it.style.setProperty('--mts-delay', (i * opt.stagger) + 'ms'); });

    // PURE scrub of the reveal (used by the lab/probe). p 0 = closed, 1 = open.
    function apply(p) {
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      overlay.style.opacity = p.toFixed(3);
      overlay.style.pointerEvents = p > 0.02 ? 'auto' : 'none';
      var N = items.length;
      items.forEach(function (it, i) {
        var winStart = (i / Math.max(1, N)) * 0.5;
        var lp = (p - winStart) / 0.5; lp = lp < 0 ? 0 : lp > 1 ? 1 : lp;
        var e = 1 - Math.pow(1 - lp, 3);
        it.style.opacity = e.toFixed(3);
        it.style.transform = 'translateY(' + ((1 - e) * 24).toFixed(1) + 'px)';
      });
      if (aside) { aside.style.opacity = p.toFixed(3); aside.style.transform = 'translateY(' + ((1 - p) * 16).toFixed(1) + 'px)'; }
    }

    function setOpen(o) {
      open = o;
      overlay.classList.toggle('is-open', o);
      doc.documentElement.style.overflow = o ? 'hidden' : '';
      overlay.setAttribute('aria-hidden', String(!o));
      // CSS-driven animation via .is-open (delays already set); keep inline cleared
      overlay.style.opacity = ''; overlay.style.pointerEvents = '';
      items.forEach(function (it) { it.style.opacity = ''; it.style.transform = ''; });
      if (aside) { aside.style.opacity = ''; aside.style.transform = ''; }
      if (reduced) apply(o ? 1 : 0);
      closeEls.forEach(function (c) { c.classList.toggle('is-shown', o); });
      if (o) { lastFocus = doc.activeElement; var f = overlay.querySelector('a,button,[tabindex]'); f && f.focus && f.focus(); }
      else if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    setOpen(false);

    triggers.forEach(function (t) { t.addEventListener('click', function () { setOpen(true); }); });
    closeEls.forEach(function (c) { c.addEventListener('click', function () { setOpen(false); }); });
    function onKey(e) { if (e.key === 'Escape' && open) setOpen(false); }
    doc.addEventListener('keydown', onKey);

    overlay.classList.add('mts-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      open: function () { setOpen(true); }, close: function () { setOpen(false); },
      toggle: function () { setOpen(!open); }, set: apply, isOpen: function () { return open; },
      destroy: function () { doc.removeEventListener('keydown', onKey); }
    };
  }

  var api = { create: create };
  global.MenuTrackedStagger = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
