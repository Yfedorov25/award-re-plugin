/* ============================================================
   OFFICE-CARDS-LIST · component.js (vanilla, нуль залежностей)
   ------------------------------------------------------------
   Каталог /offices AIR: A-15 картки (план-превʼю + popover + ♡ +
   ціна) + T-409-фільтри (chips + двоповзунковий range + live-лічильник
   «Show N offices») + сорт + LIST/GRID + T-419 sticky-бар + ♡-частина
   T-408 (toggle + бейдж-лічильник у хедері).
   Знято з ЖИВОГО /offices (live-archive 2026-07-06):

   • Картка (живий .card-office): <a href=/office/AR-b-nr> → план-SVG
     540×420 (svg-fix) з popover-збільшенням right на hover · текст
     «office №N / area m² / Floor F / Building B» · ціна numberFormat
     пробілами · ♡ btn--square (data-plugin=favourite: active =
     is-active btn--primary — чорна заливка; бейдж у хедері).
   • Фільтри (живий js-filters): chips будівель + range area/price
     (живий data-plugin=range: price step 1 000 000, повний діапазон
     39 611 870–706 815 000) → live-лічильник js-filter-result-counter
     «Show N offices» (transchoice) БЕЗ перезавантаження.
   • Сорт (живий js-filters-sort): ціна ↑/↓.
   • LIST/GRID (живий js-view-switcher, data-view-style).
   • T-419 sticky-бар: [Clear | лічильник] прилипає знизу.

   РОЗМІТКА: движок ЗБИРАЄ картки сам з data (живі дані в лабі).
     <div data-ocl>
       <div data-ocl-filters>   ← chips [data-ocl-chip="b:1"] +
            2×range [data-ocl-range="area|price"] + [data-ocl-counter]
       <div data-ocl-sort><button data-ocl-sort-btn>
       <div data-ocl-view><button data-ocl-view-btn="list|grid">
       <ul data-ocl-list></ul>
       <div data-ocl-sticky>[data-ocl-clear] + [data-ocl-counter]
       <span data-ocl-fav-badge>   ← бейдж ♡ у хедері

   OfficeCardsList.create(root, offices, opts?)
     offices: [{nr, area, floor, building, price, plan, href, locked?, oldPrice?}]
     opts: { onFav(count) }
   Повертає { filter(), state(), gate, destroy }
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function toEl(x) { return typeof x === 'string' ? doc.querySelector(x) : x; }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  function create(root, offices, options) {
    root = toEl(root);
    options = options || {};
    if (!root || !offices) return { error: 'потрібні root і offices' };
    var list = root.querySelector('[data-ocl-list]');
    var counters = root.querySelectorAll('[data-ocl-counter]');
    var badge = doc.querySelector('[data-ocl-fav-badge]');

    var gate = { shown: 0, favs: 0, sort: 'asc', view: 'list' };
    var state = { buildings: {}, area: [0, Infinity], price: [0, Infinity] };
    var favs = {};

    /* ---- картки (живий card-office) ---- */
    function cardHtml(o) {
      var old = o.oldPrice
        ? '<del class="ocl-price-old">' + fmt(o.oldPrice) + '</del>' : '';
      var disc = o.oldPrice
        ? '<span class="ocl-badge-disc">−5%</span>' : '';
      var lock = o.locked ? '<span class="ocl-lock" aria-label="reserved">🔒</span>' : '';
      return '<li><a class="ocl-card' + (o.locked ? ' ocl-card-locked' : '') +
        '" href="' + (o.locked ? '#' : o.href) + '" data-nr="' + o.nr + '">' +
        '<span class="ocl-plan">' +
          '<img loading="lazy" width="540" height="420" alt="office №' + o.nr + '" src="' + o.plan + '">' +
          '<span class="ocl-plan-pop"><img loading="lazy" alt="" src="' + o.plan + '"></span>' + lock +
        '</span>' +
        '<span class="ocl-text">' +
          '<b>office №' + o.nr + '</b><span>' + o.area + ' m²</span>' +
          '<span>Floor ' + o.floor + '</span><span class="ocl-bshort">B' + o.building + '</span>' +
          '<span class="ocl-blong">Building ' + o.building + '</span>' +
        '</span>' +
        '<span class="ocl-price">' + disc + '<b>' + fmt(o.price) + '</b>' + old + '</span>' +
        '<button type="button" class="ocl-fav" data-fav="' + o.nr +
          '" aria-label="Add to favourites">♡</button>' +
        '</a></li>';
    }

    function visible() {
      var anyB = Object.keys(state.buildings).some(function (k) { return state.buildings[k]; });
      return offices.filter(function (o) {
        if (o._hidden) return false;
        if (anyB && !state.buildings[o.building]) return false;
        if (o.area < state.area[0] || o.area > state.area[1]) return false;
        if (o.price < state.price[0] || o.price > state.price[1]) return false;
        return true;
      });
    }

    function render() {
      var v = visible().slice().sort(function (a, b) {
        return gate.sort === 'asc' ? a.price - b.price : b.price - a.price;
      });
      gate.shown = v.length;
      list.innerHTML = v.map(cardHtml).join('');
      /* live-лічильник (живий js-filter-result-counter, transchoice) */
      Array.prototype.forEach.call(counters, function (c) {
        c.textContent = 'Show ' + v.length + ' office' + (v.length === 1 ? '' : 's');
      });
      /* ♡ стани відновлюються після ререндеру */
      Object.keys(favs).forEach(function (nr) {
        var b = list.querySelector('[data-fav="' + nr + '"]');
        if (b) { b.classList.add('is-active'); b.textContent = '♥'; }
      });
    }

    /* ---- ♡ (частина T-408: чорна заливка + бейдж) ---- */
    list.addEventListener('click', function (ev) {
      var f = ev.target.closest ? ev.target.closest('[data-fav]') : null;
      if (f) {
        ev.preventDefault();
        var nr = f.getAttribute('data-fav');
        if (favs[nr]) { delete favs[nr]; f.classList.remove('is-active'); f.textContent = '♡'; }
        else { favs[nr] = true; f.classList.add('is-active'); f.textContent = '♥'; }
        gate.favs = Object.keys(favs).length;
        if (badge) {
          badge.textContent = gate.favs > 9 ? '9+' : (gate.favs || '');
          badge.classList.toggle('on', gate.favs > 0);
        }
        if (options.onFav) options.onFav(gate.favs);
        return;
      }
      var locked = ev.target.closest ? ev.target.closest('.ocl-card-locked') : null;
      if (locked) ev.preventDefault();  /* 🔒 зайнятий: нікуди не веде */
    });

    /* ---- chips будівель ---- */
    Array.prototype.forEach.call(root.querySelectorAll('[data-ocl-chip]'), function (ch) {
      ch.addEventListener('click', function () {
        var b = ch.getAttribute('data-ocl-chip').split(':')[1];
        state.buildings[b] = !state.buildings[b];
        ch.classList.toggle('is-active', state.buildings[b]);
        render();
      });
    });

    /* ---- range-пари (живий data-plugin=range: 2 повзунки) ---- */
    Array.prototype.forEach.call(root.querySelectorAll('[data-ocl-range]'), function (rg) {
      var key = rg.getAttribute('data-ocl-range');
      var inputs = rg.querySelectorAll('input[type="range"]');
      var out = rg.querySelector('[data-ocl-range-out]');
      function apply() {
        var lo = Math.min(+inputs[0].value, +inputs[1].value);
        var hi = Math.max(+inputs[0].value, +inputs[1].value);
        state[key] = [lo, hi];
        if (out) out.textContent = fmt(lo) + ' – ' + fmt(hi);
        render();
      }
      inputs[0].addEventListener('input', apply);
      inputs[1].addEventListener('input', apply);
      apply();
    });

    /* ---- сорт (живий js-filters-sort) ---- */
    var sortBtn = root.querySelector('[data-ocl-sort-btn]');
    if (sortBtn) sortBtn.addEventListener('click', function () {
      gate.sort = gate.sort === 'asc' ? 'desc' : 'asc';
      sortBtn.textContent = gate.sort === 'asc' ? 'Ascending price ∨' : 'Descending price ∧';
      render();
    });

    /* ---- LIST/GRID (живий view-switcher) ---- */
    Array.prototype.forEach.call(root.querySelectorAll('[data-ocl-view-btn]'), function (vb) {
      vb.addEventListener('click', function () {
        gate.view = vb.getAttribute('data-ocl-view-btn');
        root.setAttribute('data-view-style', gate.view);
        Array.prototype.forEach.call(root.querySelectorAll('[data-ocl-view-btn]'), function (x) {
          x.classList.toggle('is-active', x === vb);
        });
      });
    });
    root.setAttribute('data-view-style', 'list');

    /* ---- clear (T-419 бар) ---- */
    var clearBtn = root.querySelector('[data-ocl-clear]');
    if (clearBtn) clearBtn.addEventListener('click', function () {
      state.buildings = {};
      Array.prototype.forEach.call(root.querySelectorAll('[data-ocl-chip]'), function (ch) {
        ch.classList.remove('is-active');
      });
      Array.prototype.forEach.call(root.querySelectorAll('[data-ocl-range]'), function (rg) {
        var inputs = rg.querySelectorAll('input[type="range"]');
        inputs[0].value = inputs[0].min;
        inputs[1].value = inputs[1].max;
        inputs[0].dispatchEvent(new Event('input'));
      });
    });

    render();

    return {
      filter: render,
      state: function () { return state; },
      gate: gate,
      destroy: function () { list.innerHTML = ''; }
    };
  }

  global.OfficeCardsList = { create: create };
}(window));
