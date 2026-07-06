/* ============================================================
   BUDGET-PILLS-BRIDGE · component.js  (vanilla, нуль GSAP)
   ------------------------------------------------------------
   AIR /investment B4 «CHOOSE AN OFFICE»-міст (контракт D_AIR_invest_1to1
   §1 B4, живе підтвердження A-12/T-409): після КОЖНОЇ моделі стратегії -
   ряд із 2-3 кнопок бюджет-діапазонів, кожна = DEEP-LINK у каталог із
   пре-фільтром ціни: `?price[from]=F&price[to]=T` (у записі власника
   статус-бар показував `aircenter.space/offices?price[from]=…&price[to]=…`).
   Секція не «розповідає» - вона продає конкретний зріз інвентаря.

   ФОРМА: пілюлі (рішення координатора 2026-07-05 + C12 конституції: нуль
   прямокутних ghost-кнопок; контракт міряв прямокутники з малим радіусом -
   розбіжність задокументована в RECIPE, вердикт за власником). Габарити
   контрактні: висота ~4.4vh (моб >=44px тап-таргет), плюс-іконка праворуч.

   DEEP-LINK КОНТРАКТ (заглушка до появи каталога): href = base +
   'price[from]=F&price[to]=T'. base = data-bpb-base хоста або opts.base;
   поки каталог visual-search не збудований, base = '#каталог' - хеш-якір,
   який верифікується пробою за ФОРМАТОМ параметрів, не за приймачем.
   Числа діапазонів = ФІЛЬТР-МЕЖІ (інтерфейс), прив'язані до канон-якорів
   інвентаря (22 800 · 67 000), НЕ ринкові твердження (F1).

   MARKUP-FIRST:
     <nav data-bpb data-bpb-base="#каталог">
       <a data-bpb-pill data-from="0" data-to="30000">До 30 000 доларів</a>
       ...
     </nav>
   CaseAPI: BudgetPillsBridge.create(target, { base }) ->
     { root, pills, links(), destroy, ready }
   Компонент ЛИШЕ добудовує href-и і плюс-іконки; стани - CSS.
   __LAB_OK__ не торкається (B15).
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var host = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!host) return { error: 'no target' };
    var base = options.base || host.getAttribute('data-bpb-base') || '#каталог';

    var pills = Array.prototype.slice.call(host.querySelectorAll('[data-bpb-pill]'));
    var readyResolve;
    var ready = new Promise(function (res) { readyResolve = res; });

    host.classList.add('bpb');
    pills.forEach(function (a) {
      a.classList.add('bpb__pill');
      var from = a.getAttribute('data-from') || '0';
      var to = a.getAttribute('data-to') || '0';
      var sep = base.indexOf('?') >= 0 ? '&' : '?';
      // T-409-контракт дослівно: price[from]/price[to] (як в AIR статус-барі)
      a.setAttribute('href', base + sep + 'price[from]=' + from + '&price[to]=' + to);
      if (!a.querySelector('.bpb__plus')) {
        var plus = doc.createElement('span');
        plus.className = 'bpb__plus';
        plus.setAttribute('aria-hidden', 'true');
        plus.textContent = '+';
        a.appendChild(plus);
      }
    });

    var api = {
      root: host,
      pills: pills,
      links: function () {
        return pills.map(function (a) { return a.getAttribute('href'); });
      },
      ready: ready,
      destroy: function () {
        host.classList.remove('bpb');
        pills.forEach(function (a) {
          a.classList.remove('bpb__pill');
          var p = a.querySelector('.bpb__plus');
          if (p) p.parentNode.removeChild(p);
          a.removeAttribute('href');
        });
      }
    };
    readyResolve(api);
    return api;
  }

  var api = { create: create };
  global.BudgetPillsBridge = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
