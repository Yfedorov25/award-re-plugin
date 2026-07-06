/* ============================================================
   FLOOR-PLAN-SELECT · component.js (vanilla, нуль залежностей)
   ------------------------------------------------------------
   Рівень 2 visual-search дрілу AIR: T-104 (план поверху: SVG юнітів
   + JSON) + T-407 (попавер юніта З МІНІ-ПЛАНОМ + м² + ціна) + драбинка
   floor-nav. Знято з ЖИВОГО /visual-search/building/2/floor/18
   (знімок у live-archive 2026-07-06):

   • Живий конфіг data-plan-plans: items {nr, area, actualPrice,
     originalPrice, discountPrice, plan (міні-план SVG!), href, disabled};
     маркери plan-marker--office-fixed (номер на юніті);
     tooltip template "visual-search-floor" placement top.
   • Живий попавер: «<area> м² / <ціна numberFormat пробілами> /
     [<del>стара</del> якщо discount] + <img міні-план>» + triangle.
   • Драбинка (живий .floor-nav): items 1..N — <a> для живих поверхів,
     .is-disabled для мертвих («Floor not available for sale»),
     .is-active поточний; nav-info: «Building <h1>B</h1> / Floor <h1>F</h1>».
   • Темп: та сама жива крива 0.6s cubic-bezier(.25,.74,.22,.99).
   • Моб: T-M32 — як у building-floor-drill (заглушка).

   FloorPlanSelect.create(root, config, opts?)
     root: [data-fps-svg] (інлайн SVG з групами data-hoverable="nr")
           + [data-fps-markers] + [data-fps-tooltip] + [data-fps-nav]
           + [data-fps-info] + [data-fps-mobile]
     config: { building, floor, units:[…живий формат…],
               floors:[{floor, available, href}] }
     opts: { onSelect(unit), touchMq }
   Повертає { hover(nr), leave(), gate, destroy }
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function toEl(x) { return typeof x === 'string' ? doc.querySelector(x) : x; }
  function fmt(n) { /* живий numberFormat(0, '', ' ') */
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  function create(root, config, options) {
    root = toEl(root);
    options = options || {};
    if (!root || !config || !config.units)
      return { error: 'потрібні root і config.units' };
    var svg = root.querySelector('[data-fps-svg] svg') || root.querySelector('svg');
    var markersBox = root.querySelector('[data-fps-markers]');
    var tooltipBox = root.querySelector('[data-fps-tooltip]');
    var navBox = root.querySelector('[data-fps-nav]');
    var infoBox = root.querySelector('[data-fps-info]');
    var mobileSlot = root.querySelector('[data-fps-mobile]');
    var touch = global.matchMedia &&
      global.matchMedia(options.touchMq || '(pointer: coarse), (max-width: 768px)').matches;

    var gate = { hovers: 0, selected: null, clickBlocked: 0, navItems: 0 };

    if (touch) {
      root.classList.add('fps-touch');
      if (mobileSlot) mobileSlot.removeAttribute('hidden');
      return { touch: true, gate: gate, destroy: function () {
        root.classList.remove('fps-touch');
      } };
    }
    if (mobileSlot) mobileSlot.setAttribute('hidden', '');

    var byNr = {};
    config.units.forEach(function (u) { byNr[String(u.nr)] = u; });

    /* nav-info (живий visual-search-nav-info) */
    if (infoBox) {
      infoBox.innerHTML =
        '<p class="fps-info-item"><span class="fps-info-label">Building</span>' +
        '<span class="fps-info-num">' + config.building + '</span></p>' +
        '<p class="fps-info-item"><span class="fps-info-label">Floor</span>' +
        '<span class="fps-info-num">' + config.floor + '</span></p>';
    }

    /* драбинка (живий .floor-nav): a / is-disabled / is-active */
    if (navBox && config.floors) {
      navBox.innerHTML = '';
      config.floors.forEach(function (fl) {
        var el;
        if (fl.floor === config.floor) {
          el = doc.createElement('span');
          el.className = 'fps-nav-item is-active';
        } else if (fl.available) {
          el = doc.createElement('a');
          el.className = 'fps-nav-item';
          el.href = fl.href || '#';
        } else {
          el = doc.createElement('span');
          el.className = 'fps-nav-item is-disabled';
        }
        el.innerHTML = '<span class="fps-nav-num">' + fl.floor + '</span>';
        navBox.appendChild(el);
        gate.navItems++;
      });
    }

    /* юніти: стани плит + маркер-номер по центру bbox (office-fixed) */
    var vb = svg.viewBox.baseVal;
    var plates = Array.prototype.slice.call(svg.querySelectorAll('[data-hoverable]'));
    plates.forEach(function (g) {
      var u = byNr[g.getAttribute('data-hoverable')];
      var clickable = !!(u && !u.disabled);
      g.classList.add('fps-plate');
      g.classList.add(clickable ? 'fps-clickable' : 'fps-disabled');
      if (u && markersBox && g.getBBox) {
        var bb = g.getBBox();
        var m = doc.createElement('span');
        m.className = 'fps-unit-marker';
        m.textContent = u.nr;
        m.style.left = ((bb.x + bb.width / 2) / vb.width * 100) + '%';
        m.style.top = ((bb.y + bb.height / 2) / vb.height * 100) + '%';
        markersBox.appendChild(m);
        u._marker = m;
      }
    });

    /* T-407 попавер (живий шаблон visual-search-floor, placement top) */
    function fillTooltip(u) {
      var del = (u.discountPrice && u.discountPrice < u.originalPrice)
        ? '<del class="fps-tt-del">' + fmt(u.originalPrice) + '</del>' : '';
      tooltipBox.innerHTML =
        '<span class="fps-tt-triangle"></span>' +
        '<p class="fps-tt-text">' + u.area + ' м²<br>' +
        '<b>' + fmt(u.discountPrice || u.actualPrice) + '</b>' + del + '</p>' +
        (u.plan ? '<img class="fps-tt-plan" src="' + u.plan + '" alt="office №' + u.nr + '">' : '');
    }
    function placeTooltip(g) {
      var bb = g.getBBox();
      tooltipBox.style.left = ((bb.x + bb.width / 2) / vb.width * 100) + '%';
      tooltipBox.style.top = (bb.y / vb.height * 100) + '%';
    }

    function onOver(ev) {
      var g = ev.target.closest ? ev.target.closest('[data-hoverable]') : null;
      if (!g) return;
      var u = byNr[g.getAttribute('data-hoverable')];
      if (!u) return;
      gate.hovers++;
      plates.forEach(function (p) { p.classList.toggle('fps-hovered', p === g); });
      if (u._marker) u._marker.classList.add('fps-unit-marker-active');
      if (!u.disabled) { fillTooltip(u); placeTooltip(g); tooltipBox.classList.add('fps-tt-on'); }
    }
    function onOut(ev) {
      var g = ev.target.closest ? ev.target.closest('[data-hoverable]') : null;
      if (!g) return;
      g.classList.remove('fps-hovered');
      var u = byNr[g.getAttribute('data-hoverable')];
      if (u && u._marker) u._marker.classList.remove('fps-unit-marker-active');
      tooltipBox.classList.remove('fps-tt-on');
    }
    function onClick(ev) {
      var g = ev.target.closest ? ev.target.closest('[data-hoverable]') : null;
      if (!g) return;
      var u = byNr[g.getAttribute('data-hoverable')];
      if (!u || u.disabled) { gate.clickBlocked++; return; }
      gate.selected = String(u.nr);
      if (options.onSelect) options.onSelect(u);
      else if (u.href) global.location.href = u.href;
    }
    svg.addEventListener('mouseover', onOver);
    svg.addEventListener('mouseout', onOut);
    svg.addEventListener('click', onClick);

    /* ---- SELECT MULTIPLE (живий js-plan-multi-select + office-toggle) ---- */
    var multi = { on: false, sel: {} };
    var panel = root.querySelector('[data-fps-panel]');
    function fmtList() {
      if (!panel) return;
      var nrs = Object.keys(multi.sel);
      if (!nrs.length) {
        panel.innerHTML = '<p class="fps-panel-title">Your selection</p>' +
          '<p class="fps-panel-empty">Select offices on the floor plan</p>';
        return;
      }
      var rows = '', totalArea = 0, totalPrice = 0;
      nrs.forEach(function (nr) {
        var u = byNr[nr];
        totalArea += u.area;
        totalPrice += (u.discountPrice || u.actualPrice);
        rows += '<li><span>№' + u.nr + '</span><span>' + u.area + ' м²</span>' +
                '<span>' + fmt(u.discountPrice || u.actualPrice) + '</span></li>';
      });
      panel.innerHTML = '<p class="fps-panel-title">Your selection</p>' +
        '<ul class="fps-panel-list">' + rows + '</ul>' +
        '<p class="fps-panel-total"><span>Show ' + nrs.length + ' office' +
        (nrs.length === 1 ? '' : 's') + '</span><b>' +
        (Math.round(totalArea * 10) / 10) + ' м²</b>' +
        '<b>' + fmt(totalPrice) + '</b></p>';
      gate.multiTotalArea = Math.round(totalArea * 10) / 10;
    }
    function toggleUnit(nr) {
      var u = byNr[String(nr)];
      if (!u || u.disabled || !multi.on) return;
      if (multi.sel[u.nr]) { delete multi.sel[u.nr]; u._plus.classList.remove('fps-plus-active'); }
      else { multi.sel[u.nr] = true; u._plus.classList.add('fps-plus-active'); }
      gate.multiCount = Object.keys(multi.sel).length;
      fmtList();
    }
    function enterMulti() {
      if (multi.on) return;
      multi.on = true;
      root.classList.add('fps-multi');
      config.units.forEach(function (u) {
        if (u.disabled || u._plus) return;
        var g = svg.querySelector('[data-hoverable="' + u.nr + '"]');
        if (!g) return;
        var bb = g.getBBox();
        var p = doc.createElement('button');
        p.type = 'button';
        p.className = 'fps-plus';           /* живий office-toggle: ✛, active → 45° */
        p.innerHTML = '<i>+</i>';
        p.style.left = ((bb.x + bb.width / 2) / vb.width * 100) + '%';
        p.style.top = ((bb.y + bb.height / 4) / vb.height * 100) + '%';
        p.addEventListener('click', function (ev) { ev.stopPropagation(); toggleUnit(u.nr); });
        markersBox.appendChild(p);
        u._plus = p;
      });
      fmtList();
    }
    function exitMulti() {
      multi.on = false;
      root.classList.remove('fps-multi');
      multi.sel = {};
      gate.multiCount = 0;
      config.units.forEach(function (u) {
        if (u._plus) { u._plus.remove(); delete u._plus; }
      });
      if (panel) panel.innerHTML = '';
    }
    function selAll() {
      if (!multi.on) return;
      config.units.forEach(function (u) {
        if (!u.disabled && !multi.sel[u.nr]) toggleUnit(u.nr);
      });
    }
    function selNone() {
      Object.keys(multi.sel).forEach(function (nr) { toggleUnit(nr); });
    }
    Array.prototype.forEach.call(root.querySelectorAll('[data-fps-multi]'), function (btn) {
      var act = btn.getAttribute('data-fps-multi');
      btn.addEventListener('click', function () {
        if (act === 'show') enterMulti();
        else if (act === 'hide') exitMulti();
        else if (act === 'all') selAll();
        else if (act === 'none') selNone();
      });
    });

    /* ---- компас (живий .compass, кут інлайновим transform) ---- */
    var compass = root.querySelector('[data-fps-compass]');
    if (compass) {
      var deg = options.compassDeg != null ? options.compassDeg : -15; /* живий rotate(-15deg) */
      compass.innerHTML = '<i class="fps-compass-arrow"></i><i class="fps-compass-circle"></i>';
      compass.style.transform = 'rotate(' + deg + 'deg)';
    }

    return {
      multi: { enter: enterMulti, exit: exitMulti, toggle: toggleUnit,
               all: selAll, none: selNone,
               selection: function () { return Object.keys(multi.sel); } },
      hover: function (nr) {
        var g = svg.querySelector('[data-hoverable="' + nr + '"]');
        if (g) onOver({ target: g });
      },
      leave: function () {
        plates.forEach(function (p) { p.classList.remove('fps-hovered'); });
        Array.prototype.forEach.call(
          markersBox.querySelectorAll('.fps-unit-marker'),
          function (m) { m.classList.remove('fps-unit-marker-active'); });
        tooltipBox.classList.remove('fps-tt-on');
      },
      gate: gate,
      destroy: function () {
        svg.removeEventListener('mouseover', onOver);
        svg.removeEventListener('mouseout', onOut);
        svg.removeEventListener('click', onClick);
        markersBox.innerHTML = '';
        if (navBox) navBox.innerHTML = '';
      }
    };
  }

  global.FloorPlanSelect = { create: create };
}(window));
