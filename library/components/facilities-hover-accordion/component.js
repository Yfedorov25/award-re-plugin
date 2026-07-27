/* ============================================================
   FACILITIES-HOVER-ACCORDION · component.js  (vanilla, CSS-driven states)
   ------------------------------------------------------------
   11tanjung's facilities row — N image cards in a flex row (flex: 1 1 0). Hovering a
   card makes it GROW (flex-grow ~3.5, width ~17% -> ~45%) while its neighbours shrink
   (~13%); the active card's LABEL fades in (opacity 0 -> 1) and it reveals a WIDER crop
   (object-position eases to centre). Default active = the centre card (so the row is
   never flat). transition flex + opacity ~350ms cubic-bezier(.4,0,.2,1). Harvested from
   D_11tanjung (D1).

   THE MOVE: it is a CSS accordion. The grow/shrink + label-fade live in CSS keyed off an
   .is-active class. This JS only: (1) sets the config grow factor as a CSS var, (2) marks
   the DEFAULT-active card (centre), (3) on mouseenter moves .is-active to the hovered card
   and on mouseleave restores the default, (4) keyboard focus mirrors hover (focusin), so
   it's reachable. No layout math in JS — the flex engine does the widths.

   CONFIG-DRIVEN:
     FacilitiesHoverAccordion.create(target, {   // target wraps .fha-card x N
       grow: 3.5,                 // flex-grow of the active card (neighbours stay 1)
       defaultIndex: 'center',    // 'center' | number | -1 (none active by default)
       card: '.fha-card'
     })
   Markup: .fha-row > .fha-card (each: .fha-media img + .fha-label). Returns { setActive(i),
   clearActive(), destroy }.

   ENGINE LAWS: CSS flex-grow + opacity + object-position transition only; JS toggles a
   class + sets a CSS var; NO mix-blend / NO backdrop; NO WebGL; touch/no-hover -> the
   default-active card stays (tap toggles). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      grow: options.grow != null ? options.grow : 3.5,
      defaultIndex: options.defaultIndex != null ? options.defaultIndex : 'center',
      card: options.card || '.fha-card'
    };
    var row = !target ? doc.body : (typeof target === 'string' ? doc.querySelector(target) : target);
    if (!row) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var cards = [].slice.call(row.querySelectorAll(opt.card));
    if (!cards.length) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no cards' }; }

    row.style.setProperty('--fha-grow', String(opt.grow));

    var defIdx = opt.defaultIndex === 'center' ? Math.floor((cards.length - 1) / 2)
               : (opt.defaultIndex === -1 ? -1 : Math.max(0, Math.min(cards.length - 1, opt.defaultIndex | 0)));

    function setActive(i) {
      cards.forEach(function (c, k) { c.classList.toggle('is-active', k === i); });
    }
    function clearActive() { setActive(defIdx); }
    clearActive();

    var handlers = [];
    cards.forEach(function (card, i) {
      var on = function () { setActive(i); };
      var off = function () { clearActive(); };
      card.addEventListener('mouseenter', on);
      card.addEventListener('mouseleave', off);
      card.addEventListener('focusin', on);   // keyboard parity
      card.addEventListener('focusout', off);
      // make the card focusable if it isn't a control already
      if (!card.hasAttribute('tabindex') && !card.querySelector('a,button')) card.setAttribute('tabindex', '0');
      handlers.push([card, on, off]);
    });

    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      setActive: setActive, clearActive: clearActive, cards: cards,
      destroy: function () {
        handlers.forEach(function (h) {
          h[0].removeEventListener('mouseenter', h[1]); h[0].removeEventListener('mouseleave', h[2]);
          h[0].removeEventListener('focusin', h[1]); h[0].removeEventListener('focusout', h[2]);
        });
      }
    };
  }

  var api = { create: create };
  global.FacilitiesHoverAccordion = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
