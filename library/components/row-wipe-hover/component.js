/* ============================================================
   ROW-WIPE-HOVER · component.js  (vanilla, CSS-driven states)
   ------------------------------------------------------------
   Saisei's list-row hover — hovering a nav row: a tan highlight BAND wipes left->right
   across the row, a baseline UNDERLINE grows from the left, and the row's ordinal glyph
   FLIPS to a theme-kanji (ordinal <-> theme). The shapes live in CSS (transform-origin
   left scaleX); this JS wires the hover state + the kanji swap. Harvested from D_saisei
   (S10).

   THE MOVE: on mouseenter add .is-hover (CSS wipes the band + grows the underline via
   scaleX from the left); swap the ordinal text to data-kanji; reverse on mouseleave.

   CONFIG-DRIVEN:
     RowWipeHover.create(target, { row: '.rwh-row' })
       // each .rwh-row has a .rwh-ordinal (text) with data-kanji for the swap.
   Returns { destroy }.

   ENGINE LAWS: CSS transform(scaleX) + opacity for the band/underline; JS only toggles a
   class + swaps text; NO mix-blend / NO backdrop; NO WebGL. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  function create(target, options) {
    options = options || {};
    var host = !target ? doc : (typeof target === 'string' ? doc.querySelector(target) : target);
    var rowSel = options.row || '.rwh-row';
    var rows = [].slice.call((host || doc).querySelectorAll(rowSel));
    var handlers = [];
    rows.forEach(function (row) {
      var ord = row.querySelector('.rwh-ordinal');
      var orig = ord ? ord.textContent : '';
      var kanji = ord ? (ord.getAttribute('data-kanji') || orig) : '';
      function on() { row.classList.add('is-hover'); if (ord) ord.textContent = kanji; }
      function off() { row.classList.remove('is-hover'); if (ord) ord.textContent = orig; }
      row.addEventListener('mouseenter', on); row.addEventListener('mouseleave', off);
      handlers.push([row, on, off]);
    });
    try { global.__LAB_OK__ = true; } catch (e) {}
    return { destroy: function () { handlers.forEach(function (h) { h[0].removeEventListener('mouseenter', h[1]); h[0].removeEventListener('mouseleave', h[2]); }); } };
  }
  var api = { create: create };
  global.RowWipeHover = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
