/* ============================================================
   FAVOURITES-PANEL · component.js (vanilla, нуль залежностей)
   ------------------------------------------------------------
   T-408 favourites-система (ядро) + T-M30 моб-закони.
   Знято з ЖИВОГО /offices + D_AIR_mobile_video §Р2.3 (2026-07-06):

   • Панель = modal--side--left --wide (desktop: слайд ЗЛІВА;
     моб T-M30: панель slide-down ЗВЕРХУ, список під нею темніє).
   • favouriteList: empty-стан «Your selected offices will appear
     here» + [Choose an office ✛]; list-стан: «Favorites» h1 +
     «N offices» (transchoice) + картки (№/м²/floor/ціна + ✕) +
     [Send by email ✉].
   • Email-шит (жива favourites-email + T-M30): поле email + consent
     + [SEND ✛]. Success-стан живим НЕ ЗНЯТИЙ (діра дозйомки) —
     скромне «Запит надіслано» за A-07-каноном тихих воріт.
   • Ритуал відкриття = сім'я modal (двофазність не потрібна:
     side-панель їде transform 0.8s cubic-bezier(.7,0,.3,1) — та
     сама жива крива modal-фаз).

   РОЗМІТКА:
     <div data-fvp>                ← панель (fixed)
       <button data-fvp-close>✕</button>
       <div data-fvp-empty>…</div>
       <div data-fvp-list-wrap hidden>
         <p data-fvp-count></p>
         <ul data-fvp-list></ul>
         <button data-fvp-email>Send by email ✉</button>
       </div>
       <form data-fvp-form hidden>
         <input data-fvp-mail type="email"> <label><input data-fvp-consent type="checkbox">…</label>
         <button data-fvp-send>Send ✛</button>
         <p data-fvp-done hidden>…</p>
       </form>

   FavouritesPanel.create(opts?) — { onSend(list) }
   API: { open(), close(), add(office), remove(nr), count(), gate, destroy }
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  function create(options) {
    options = options || {};
    var panel = doc.querySelector('[data-fvp]');
    if (!panel) return { error: 'потрібен [data-fvp]' };
    var empty = panel.querySelector('[data-fvp-empty]');
    var wrap = panel.querySelector('[data-fvp-list-wrap]');
    var countEl = panel.querySelector('[data-fvp-count]');
    var listEl = panel.querySelector('[data-fvp-list]');
    var form = panel.querySelector('[data-fvp-form]');
    var mail = panel.querySelector('[data-fvp-mail]');
    var consent = panel.querySelector('[data-fvp-consent]');
    var done = panel.querySelector('[data-fvp-done]');
    var touch = global.matchMedia &&
      global.matchMedia('(pointer: coarse), (max-width: 768px)').matches;

    var gate = { opens: 0, sends: 0, invalid: 0 };
    var items = {};
    var open = false;

    panel.classList.add(touch ? 'fvp-top' : 'fvp-left'); /* T-M30: моб зверху */
    panel.classList.add('fvp-closed');

    function renderList() {
      var nrs = Object.keys(items);
      var has = nrs.length > 0;
      if (empty) empty.toggleAttribute('hidden', has);
      if (wrap) wrap.toggleAttribute('hidden', !has);
      if (countEl) countEl.textContent = nrs.length + ' office' + (nrs.length === 1 ? '' : 's');
      if (listEl) listEl.innerHTML = nrs.map(function (nr) {
        var o = items[nr];
        return '<li><span class="fvp-i-nr">№' + o.nr + '</span>' +
          '<span>' + o.area + ' m²</span><span>Floor ' + o.floor + '</span>' +
          '<b>' + fmt(o.price) + '</b>' +
          '<button type="button" class="fvp-i-x" data-fvp-x="' + o.nr + '" aria-label="Remove">✕</button></li>';
      }).join('');
    }

    function doOpen() {
      if (open) return;
      open = true;
      gate.opens++;
      panel.classList.remove('fvp-closed');
      void panel.offsetWidth;
      panel.classList.add('fvp-open');
      doc.documentElement.classList.add('fvp-lock');
    }
    function doClose() {
      open = false;
      panel.classList.remove('fvp-open');
      doc.documentElement.classList.remove('fvp-lock');
      global.setTimeout(function () {
        if (!open) panel.classList.add('fvp-closed');
      }, 850);
      if (form) { form.setAttribute('hidden', ''); showListState(); }
    }
    function showListState() {
      if (wrap && Object.keys(items).length) wrap.removeAttribute('hidden');
      if (done) done.setAttribute('hidden', '');
    }

    panel.addEventListener('click', function (ev) {
      if (ev.target.closest('[data-fvp-close]')) { doClose(); return; }
      var x = ev.target.closest('[data-fvp-x]');
      if (x) {
        delete items[x.getAttribute('data-fvp-x')];
        renderList();
        return;
      }
      if (ev.target.closest('[data-fvp-email]')) {
        if (wrap) wrap.setAttribute('hidden', '');
        if (form) form.removeAttribute('hidden');
        return;
      }
    });
    doc.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && open) doClose();
    });

    if (form) form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var ok = mail && /.+@.+\..+/.test(mail.value) && consent && consent.checked;
      if (!ok) { gate.invalid++; form.classList.add('fvp-shake');
        global.setTimeout(function () { form.classList.remove('fvp-shake'); }, 500);
        return; }
      gate.sends++;
      if (done) done.removeAttribute('hidden');
      if (options.onSend) options.onSend(Object.keys(items));
    });

    renderList();

    return {
      open: doOpen, close: doClose,
      add: function (o) { items[String(o.nr)] = o; renderList(); },
      remove: function (nr) { delete items[String(nr)]; renderList(); },
      count: function () { return Object.keys(items).length; },
      isOpen: function () { return open; },
      gate: gate,
      destroy: function () {
        panel.classList.remove('fvp-open', 'fvp-closed', 'fvp-left', 'fvp-top');
        doc.documentElement.classList.remove('fvp-lock');
      }
    };
  }

  global.FavouritesPanel = { create: create };
}(window));
