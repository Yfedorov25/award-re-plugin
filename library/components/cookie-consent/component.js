/* ============================================================
   COOKIE-CONSENT · component.js (vanilla, нуль залежностей)
   ------------------------------------------------------------
   Жива cookie-пігулка aircenter.space (дозйомка 2026-07-06,
   live-archive: air-global.css .cookie-consent* + shared.js
   CookieConsent + recon-20260706/int-cookie-*.png):
   - fixed, bottom = safe-area + spacing-layout (20px), z-index 13,
     simple-варіант центрований, pointer-events: none/all (контейнер);
   - контейнер: radius 5px, shadow 0 0 80px rgba(0,0,0,.2),
     padding 10/10/10/20, gap layout, кнопка margin-left:auto;
   - ACCEPT (живий hide()): container.remove() МИТТЄВО (нуль фейду!)
     + кука на 356 днів (h.set(u,"1",356)) + html-клас
     with-cookie-consent знімається.

   РОЗМІТКА:
     <div data-cc>
       <div data-cc-box>
         <p>THIS WEBSITE USES <a href="#">COOKIES</a></p>
         <button data-cc-accept>ACCEPT</button>
       </div>
     </div>

   CookieConsent.create(root, opts?) → { visible(), accept(), gate, destroy }
   opts: { storageKey ('cc-status'), storage (localStorage-like|null),
           htmlClass ('with-cookie-consent') }
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  function toEl(x) { return typeof x === 'string' ? doc.querySelector(x) : x; }

  function create(root, options) {
    root = toEl(root);
    options = options || {};
    if (!root) return { error: 'no root' };
    var btn = root.querySelector('[data-cc-accept]');
    if (!btn) return { error: 'потрібна [data-cc-accept]' };
    var key = options.storageKey || 'cc-status';
    var store = options.storage !== undefined ? options.storage
      : (function () { try { return global.localStorage; } catch (e) { return null; } }());
    var htmlClass = options.htmlClass || 'with-cookie-consent';

    var gate = { shown: false, accepted: false, removed: false };

    /* живий флоу: якщо згода вже дана — банер не показується взагалі */
    var prior = null;
    if (store) { try { prior = store.getItem(key); } catch (e) {} }
    if (prior === '1') {
      root.remove();
      gate.removed = true;
      return { visible: function () { return false; }, accept: function () {},
               gate: gate, destroy: function () {} };
    }
    doc.documentElement.classList.add(htmlClass);
    gate.shown = true;

    function accept() {
      if (gate.accepted) return;
      gate.accepted = true;
      if (store) { try { store.setItem(key, '1'); } catch (e) {} }
      /* живий hide(): remove() миттєво, БЕЗ анімації */
      root.remove();
      doc.documentElement.classList.remove(htmlClass);
      gate.removed = true;
    }
    btn.addEventListener('click', accept);

    return {
      visible: function () { return !gate.removed; },
      accept: accept,
      gate: gate,
      destroy: function () {
        btn.removeEventListener('click', accept);
        doc.documentElement.classList.remove(htmlClass);
      }
    };
  }

  global.CookieConsent = { create: create };
}(window));
