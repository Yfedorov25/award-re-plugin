/* ============================================================
   PLUS-TOGGLE-CARDS · component.js (vanilla, нуль залежностей)
   ------------------------------------------------------------
   T-M24 ✛-toggle картки (пара T-417). Живі факти /management-service
   (live-archive 2026-07-06): card-team--service з data-plugin=
   cardHover → клас card-team--is-active; контент (назва + контур-
   іконка + ✛ btn--rotation) ↔ попап (title + список) IN-PLACE;
   T-M24 закони: крос-фейд ~0.3–0.4с, ✛↔− (rotation 45°), СТАНИ
   НЕЗАЛЕЖНІ і живуть при свайпі.

   Активація: hover-пристрої = hover (живий cardHover) + клік-фіксація;
   тач = тап-toggle (T-M24).

   РОЗМІТКА:
     <div data-ptc>
       <article data-ptc-card>
         <div data-ptc-face>…назва+іконка+<span data-ptc-plus>✛</span>…</div>
         <div data-ptc-popup>…CAPS-текст/список…</div>
       </article> ×N

   PlusToggleCards.create(root, opts?) → { states(), gate, destroy }
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  function toEl(x) { return typeof x === 'string' ? doc.querySelector(x) : x; }

  function create(root, options) {
    root = toEl(root);
    options = options || {};
    if (!root) return { error: 'no root' };
    var cards = Array.prototype.slice.call(root.querySelectorAll('[data-ptc-card]'));
    if (!cards.length) return { error: 'потрібні [data-ptc-card]' };
    var touch = global.matchMedia &&
      global.matchMedia(options.touchMq || '(pointer: coarse), (max-width: 768px)').matches;
    var hover = !touch && global.matchMedia &&
      global.matchMedia('(hover: hover) and (pointer: fine)').matches;

    var gate = { toggles: 0, active: 0 };
    var pinned = new Map(); /* клік-фіксація на hover-пристроях */

    function setActive(card, on) {
      if (card.classList.contains('is-active') === on) return;
      card.classList.toggle('is-active', on);
      gate.toggles++;
      gate.active = root.querySelectorAll('[data-ptc-card].is-active').length;
    }
    function onClick(ev) {
      var card = ev.target.closest ? ev.target.closest('[data-ptc-card]') : null;
      if (!card) return;
      var on = !card.classList.contains('is-active');
      setActive(card, on);
      if (hover) pinned.set(card, on);
    }
    root.addEventListener('click', onClick);
    var overH = null, outH = null;
    if (hover) {
      overH = function (ev) {
        var card = ev.target.closest ? ev.target.closest('[data-ptc-card]') : null;
        if (card && !pinned.get(card)) setActive(card, true);
      };
      outH = function (ev) {
        var card = ev.target.closest ? ev.target.closest('[data-ptc-card]') : null;
        if (card && !pinned.get(card) &&
            !(ev.relatedTarget && card.contains(ev.relatedTarget)))
          setActive(card, false);
      };
      root.addEventListener('mouseover', overH);
      root.addEventListener('mouseout', outH);
    }

    return {
      states: function () {
        return cards.map(function (c) { return c.classList.contains('is-active'); });
      },
      gate: gate,
      destroy: function () {
        root.removeEventListener('click', onClick);
        if (overH) { root.removeEventListener('mouseover', overH);
                     root.removeEventListener('mouseout', outH); }
        cards.forEach(function (c) { c.classList.remove('is-active'); });
      }
    };
  }

  global.PlusToggleCards = { create: create };
}(window));
