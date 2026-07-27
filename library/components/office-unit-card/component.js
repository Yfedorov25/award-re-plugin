/* ============================================================
   OFFICE-UNIT-CARD · component.js (vanilla, нуль залежностей)
   ------------------------------------------------------------
   A-13 unit-сторінка AIR (ядро) + T-431 FURNISHED-toggle + T-523
   similar-handoff. Знято з ЖИВОЇ /office/AR-1-18 (live-archive
   2026-07-06):

   • Права колонка (живий office-tabs--vertical, data-plugin=tabs):
     три таби «Office plan / On the floor / Master plan» (role=tab,
     aria-controls/-selected) + мінімапа mini-plan-building у куті.
   • T-431 toggle НА табі Office plan (закон T-M31: живе ЛИШЕ там):
     UNFURNISHED ↔ FURNISHED = свап живих SVG
     plans/... ↔ plans-furnished/... (той самий юніт).
   • Ліва колонка: специфікація (№/Floor/Building/Area) + ціна
     numberFormat пробілами (+струк/знижка) + [♡] + [Reserve ✛].
   • T-523 handoff: грід similar-карток з ПЛАНАМИ-превʼю; клік →
     onHandoff(nr) — естафета юніт→юніт без списку.

   РОЗМІТКА: движок наповнює слоти з data:
     <div data-ouc>
       <div data-ouc-spec></div>  <div data-ouc-price></div>
       <button data-ouc-fav>♡</button> <button data-ouc-reserve>
       <nav data-ouc-tabs></nav>  <div data-ouc-panels></div>
       <div data-ouc-toggle></div>
       <ul data-ouc-similar></ul>

   OfficeUnitCard.create(root, office, opts?)
     office: { nr, code, area, floor, building, price, oldPrice?,
               plan, planFurnished, floorPlan?, masterPlan?,
               similar: [{nr, area, floor, price, plan, href}] }
     opts: { onReserve(office), onHandoff(nr), onFav(state) }
   API: { tab(id), furnished(bool), gate, destroy }
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  var TABS = [
    { id: 'plan', label: 'Office plan' },
    { id: 'floor', label: 'On the floor' },
    { id: 'genplan', label: 'Master plan' }
  ];

  function create(root, office, options) {
    root = typeof root === 'string' ? doc.querySelector(root) : root;
    options = options || {};
    if (!root || !office) return { error: 'потрібні root і office' };
    var gate = { tab: 'plan', furnished: false, reserved: 0, fav: false, handoffs: 0 };

    /* специфікація + ціна (живий лівий стовп) */
    var spec = root.querySelector('[data-ouc-spec]');
    if (spec) spec.innerHTML =
      '<h1 class="ouc-title">Office №' + office.nr + '</h1>' +
      '<dl class="ouc-dl">' +
      '<div><dt>Area</dt><dd>' + office.area + ' m²</dd></div>' +
      '<div><dt>Floor</dt><dd>' + office.floor + '</dd></div>' +
      '<div><dt>Building</dt><dd>' + office.building + '</dd></div>' +
      '<div><dt>Code</dt><dd>' + (office.code || ('AR-' + office.building + '-' + office.nr)) + '</dd></div>' +
      '</dl>';
    var price = root.querySelector('[data-ouc-price]');
    if (price) price.innerHTML =
      (office.oldPrice ? '<del>' + fmt(office.oldPrice) + '</del>' : '') +
      '<b>' + fmt(office.price) + '</b>';

    /* таби (живий office-tabs--vertical) */
    var tabsNav = root.querySelector('[data-ouc-tabs]');
    var panels = root.querySelector('[data-ouc-panels]');
    var toggleBox = root.querySelector('[data-ouc-toggle]');
    function planImg() {
      return '<img class="ouc-plan-img" alt="office №' + office.nr + '" src="' +
        (gate.furnished ? office.planFurnished : office.plan) + '">';
    }
    function panelHtml(id) {
      if (id === 'plan') return '<div class="ouc-stage">' + planImg() + '</div>';
      if (id === 'floor') return '<div class="ouc-stage">' +
        (office.floorPlan ? '<img class="ouc-plan-img" alt="floor plan" src="' + office.floorPlan + '">'
                          : '<p class="ouc-stub">On-floor план</p>') + '</div>';
      return '<div class="ouc-stage">' +
        (office.masterPlan ? '<img class="ouc-plan-img" alt="master plan" src="' + office.masterPlan + '">'
                           : '<p class="ouc-stub">Master plan</p>') + '</div>';
    }
    function renderTabs() {
      tabsNav.innerHTML = TABS.map(function (t) {
        return '<a role="tab" tabindex="0" data-ouc-tab="' + t.id +
          '" aria-selected="' + (gate.tab === t.id) + '"' +
          (gate.tab === t.id ? ' class="is-active"' : '') +
          '><span>' + t.label + '</span></a>';
      }).join('');
      panels.innerHTML = panelHtml(gate.tab);
      /* T-431 toggle живе ЛИШЕ на табі Office plan (закон T-M31) */
      if (toggleBox) {
        toggleBox.innerHTML = gate.tab === 'plan'
          ? '<button type="button" data-ouc-furn="0"' + (!gate.furnished ? ' class="is-active"' : '') + '>Unfurnished</button>' +
            '<button type="button" data-ouc-furn="1"' + (gate.furnished ? ' class="is-active"' : '') + '>Furnished</button>'
          : '';
      }
    }
    root.addEventListener('click', function (ev) {
      var t = ev.target.closest ? ev.target.closest('[data-ouc-tab]') : null;
      if (t) { gate.tab = t.getAttribute('data-ouc-tab'); renderTabs(); return; }
      var f = ev.target.closest ? ev.target.closest('[data-ouc-furn]') : null;
      if (f) { gate.furnished = f.getAttribute('data-ouc-furn') === '1'; renderTabs(); return; }
      var h = ev.target.closest ? ev.target.closest('[data-ouc-sim]') : null;
      if (h) {
        ev.preventDefault();
        gate.handoffs++;
        if (options.onHandoff) options.onHandoff(h.getAttribute('data-ouc-sim'));
        return;
      }
    });

    /* Reserve + ♡ */
    var reserve = root.querySelector('[data-ouc-reserve]');
    if (reserve) reserve.addEventListener('click', function () {
      gate.reserved++;
      if (options.onReserve) options.onReserve(office);
    });
    var fav = root.querySelector('[data-ouc-fav]');
    if (fav) fav.addEventListener('click', function () {
      gate.fav = !gate.fav;
      fav.classList.toggle('is-active', gate.fav);
      fav.textContent = gate.fav ? '♥' : '♡';
      if (options.onFav) options.onFav(gate.fav);
    });

    /* T-523 similar-грід (плани-превʼю, НЕ фото) */
    var sim = root.querySelector('[data-ouc-similar]');
    if (sim && office.similar) sim.innerHTML = office.similar.map(function (o) {
      return '<li><a class="ouc-sim" data-ouc-sim="' + o.nr + '" href="' + (o.href || '#') + '">' +
        '<img loading="lazy" alt="office №' + o.nr + '" src="' + o.plan + '">' +
        '<span><b>№' + o.nr + '</b> · ' + o.area + ' m² · Floor ' + o.floor + '</span>' +
        '<b class="ouc-sim-price">' + fmt(o.price) + '</b></a></li>';
    }).join('');

    renderTabs();

    return {
      tab: function (id) { gate.tab = id; renderTabs(); },
      furnished: function (b) { gate.furnished = !!b; renderTabs(); },
      gate: gate,
      destroy: function () {
        tabsNav.innerHTML = ''; panels.innerHTML = '';
        if (toggleBox) toggleBox.innerHTML = '';
        if (sim) sim.innerHTML = '';
      }
    };
  }

  global.OfficeUnitCard = { create: create };
}(window));
