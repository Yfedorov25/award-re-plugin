/* ============================================================
   LAYER-ACCORDION-REVEAL · component.js  (vanilla, GPU-only states; no GSAP needed)
   ------------------------------------------------------------
   The owner's exact ask: BIG renders as vertical slabs side by side, one open at a
   time. At rest each slab is a narrow STRIP; HOVER a slab and it EXPANDS to a near-
   full render of that component while the others compress to thin spines, its LABEL
   + material SPEC fade in. Move to the NEXT slab and that one opens while the
   previous collapses, in a smooth horizontal accordion flow. A building shown
   "у розрізі": Вінець / Пергола / Фасад / Основа, each panel IS that component.

   THE BAN-CLEAN MOVE (no width/left/flex tween - those are layout):
     Every panel is the SAME fixed full-stage-width layer (width never animated).
     The JS computes a layout (the open panel takes `openFlex` share, the rest split
     the remainder as strips) and writes TWO CSS vars per panel:
       --x : the panel's left edge, in % of the stage  -> applied as translateX()
       --w : the panel's VISIBLE width, in % of the stage -> applied as a
             clip-path inset(0 right 0 0) that shows only that band of the layer.
     CSS transitions --x (transform) and --w (clip-path) only. GPU-composited,
     reversible, buttery. The image inside is object-fit:cover so a strip shows a
     vertical SLICE of the SAME render and the open panel shows it near-full - no
     image swap, so no geometry jump, the slab you touched is the slab that opens.

   CONFIG-DRIVEN:
     LayerAccordionReveal.create(target, {        // target = the .lar-rack element
       panels: [{ img, label, spec, kicker, alt }],  // OR read existing .lar-slab markup
       openFlex: 0.62,        // the open slab's share of the rack width (0..1)
       defaultIndex: 0,       // which slab is open at rest (-1 = all even strips)
       seam: 3,               // px gap drawn between slabs (via inset, not margin)
       ease: 'cubic-bezier(.22,1,.36,1)',  // the house 'air' curve
       dur: 0.62, uiDur: 0.34 // content-open vs label/ui timings (s)
     })
   Markup the engine builds (or reads): .lar-rack > .lar-slab x N, each slab =
   .lar-shot(img) + .lar-spine(vertical index+label) + .lar-plate(.lar-kicker +
   .lar-label + .lar-spec). Returns { open(i), rest(), index, slabs, refresh, destroy }.

   ENGINE LAWS: transform + clip-path + opacity + filter only; GPU (will-change on the
   moving layers, dropped at rest); NO mix-blend; NO backdrop-filter; NO WebGL; NO
   width/height/top/left/margin tween. Hover + keyboard focus + click toggle parity.
   prefers-reduced-motion / no-hover(touch) -> a static labelled list (all slabs even,
   every label+spec shown, no clip/transform transitions). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  function create(target, options) {
    options = options || {};
    var opt = {
      panels: options.panels || null,
      openFlex: options.openFlex != null ? clamp(options.openFlex, 0.4, 0.82) : 0.62,
      defaultIndex: options.defaultIndex != null ? options.defaultIndex : 0,
      seam: options.seam != null ? options.seam : 3,
      ease: options.ease || 'cubic-bezier(.22,1,.36,1)',
      dur: options.dur != null ? options.dur : 0.62,
      uiDur: options.uiDur != null ? options.uiDur : 0.34
    };

    var rack = !target ? doc.querySelector('.lar-rack')
             : (typeof target === 'string' ? doc.querySelector(target) : target);
    if (!rack) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }
    rack.classList.add('lar-rack');

    // BUILD slabs from data if provided and none exist yet
    var slabs = [].slice.call(rack.querySelectorAll('.lar-slab'));
    if (!slabs.length && opt.panels && opt.panels.length) {
      opt.panels.forEach(function (p, i) {
        var slab = doc.createElement('div');
        slab.className = 'lar-slab';
        slab.setAttribute('tabindex', '0');
        slab.setAttribute('role', 'button');
        slab.setAttribute('aria-label', (p.label || ('шар ' + (i + 1))) + (p.spec ? '. ' + p.spec : ''));
        var num = String(i + 1).padStart(2, '0');
        slab.innerHTML =
          '<div class="lar-shot"><img src="' + p.img + '" alt="' + (p.alt || p.label || '') + '" decoding="async"></div>' +
          '<div class="lar-spine"><span class="lar-spine__n">' + num + '</span>' +
            '<span class="lar-spine__t">' + (p.label || '') + '</span></div>' +
          '<div class="lar-plate">' +
            (p.kicker ? '<span class="lar-kicker">' + p.kicker + '</span>' : '') +
            '<span class="lar-label">' + (p.label || '') + '</span>' +
            (p.spec ? '<span class="lar-spec">' + p.spec + '</span>' : '') +
          '</div>';
        rack.appendChild(slab);
      });
      slabs = [].slice.call(rack.querySelectorAll('.lar-slab'));
    }
    if (!slabs.length) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no slabs' }; }

    var N = slabs.length;
    rack.style.setProperty('--lar-ease', opt.ease);
    rack.style.setProperty('--lar-dur', opt.dur + 's');
    rack.style.setProperty('--lar-ui-dur', opt.uiDur + 's');

    var reduce = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // forceMotion (dual-platform opt-in): the original went static on hover:none (touch) because
    // it had no mobile branch. The dual wrapper OWNS a mobile branch (swipe-slider driving open(i)),
    // so it keeps the LIVE accordion on touch. reduced-motion is still honored (accessibility).
    var noHover = !options.forceMotion && global.matchMedia && global.matchMedia('(hover: none)').matches;

    // ---- STATIC fallback: a labelled list, all slabs shown evenly, no motion ----
    if (reduce || noHover) {
      rack.classList.add('lar-static');
      slabs.forEach(function (s, i) {
        var w = 100 / N;
        s.style.setProperty('--x', (w * i) + '%');
        s.style.setProperty('--w', w + '%');
        s.classList.add('is-open'); // labels visible in the static list
      });
      try { global.__LAB_OK__ = true; } catch (e) {}
      return {
        static: true, index: -1, slabs: slabs,
        open: function () {}, rest: function () {}, refresh: function () {}, destroy: function () {}
      };
    }

    // ---- LIVE accordion: layout writes --x/--w; CSS transitions transform+clip-path ----
    var seamPct = function () { var rw = rack.getBoundingClientRect().width || 1; return (opt.seam / rw) * 100; };
    var current = -1;

    function layout(openIdx) {
      var gap = seamPct();
      var total = 100 - gap * (N - 1);          // usable width after seams
      var openW, stripW, x = 0;
      if (openIdx < 0) {                         // resting-even (no slab open)
        openW = stripW = total / N;
      } else {
        openW = total * opt.openFlex;
        stripW = (total - openW) / (N - 1);
      }
      slabs.forEach(function (s, i) {
        var w = (openIdx < 0) ? openW : (i === openIdx ? openW : stripW);
        s.style.setProperty('--x', x + '%');
        s.style.setProperty('--w', w + '%');
        s.classList.toggle('is-open', i === openIdx);
        s.classList.toggle('is-strip', openIdx >= 0 && i !== openIdx);
        s.setAttribute('aria-expanded', String(i === openIdx));
        x += w + gap;
      });
      current = openIdx;
    }

    function open(i) { i = clamp(i | 0, 0, N - 1); if (i !== current) layout(i); }
    function rest() { layout(opt.defaultIndex === -1 ? -1 : clamp(opt.defaultIndex | 0, 0, N - 1)); }

    var handlers = [];
    slabs.forEach(function (slab, i) {
      var enter = function () { open(i); };
      var click = function () { open(i); }; // touch/click parity (single open at a time)
      var key = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } };
      slab.addEventListener('mouseenter', enter);
      slab.addEventListener('focusin', enter);
      slab.addEventListener('click', click);
      slab.addEventListener('keydown', key);
      handlers.push([slab, enter, click, key]);
    });
    // leaving the rack restores the default-open slab (never a flat dead row)
    var leave = function () { rest(); };
    rack.addEventListener('mouseleave', leave);

    // initial paint (default slab open)
    rest();

    // re-layout on resize (seam is px -> % drifts)
    var ro = null;
    if (global.ResizeObserver) { ro = new global.ResizeObserver(function () { layout(current); }); ro.observe(rack); }
    else global.addEventListener('resize', function () { layout(current); });

    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      open: open, rest: rest, refresh: function () { layout(current); },
      get index() { return current; }, slabs: slabs,
      destroy: function () {
        handlers.forEach(function (h) {
          h[0].removeEventListener('mouseenter', h[1]);
          h[0].removeEventListener('focusin', h[1]);
          h[0].removeEventListener('click', h[2]);
          h[0].removeEventListener('keydown', h[3]);
        });
        rack.removeEventListener('mouseleave', leave);
        if (ro) ro.disconnect();
      }
    };
  }

  var api = { create: create };
  global.LayerAccordionReveal = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
