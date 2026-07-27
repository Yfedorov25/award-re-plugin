/* ============================================================
   BUILDING-FLOOR-DRILL · component.js (vanilla, нуль залежностей)
   ------------------------------------------------------------
   T-115 (фасад із ховер-плитами поверхів) + T-104-половина (двошаровий
   SVG-план + JSON, clickable = count>0) + T-M32 (моб-заглушка).
   Знято з ЖИВОГО /visual-search aircenter.space (2026-07-06):

   • Живий двигун: data-plugin="plan buildingPlan"; конфіг data-plan-plans:
     items = floors {ref:"b-f", building, floor, count, areaMin, areaMax,
     href, title} + markers {anchor, template:building, title:"B1"};
     state.clickable = count>0 ДОСЛІВНО (floor з count:0 → clickable:false).
   • SVG: групи <g data-hoverable="b-f"> — невидимі плити поверхів поверх
     фото-ізометрії. CSS (живий visual-search.css):
       transition fill/stroke/opacity 0.6s cubic-bezier(.25,.74,.22,.99);
       clickable: fill transparent → hover hsla(0,0%,100%,.4) + cursor;
       не-clickable hovered: rgba(primary,.15); disabled: fill 0.
   • Маркери веж B1/B2/B3 (живий buildingPlan): hover плити → маркер
     ЇЇ вежі active (set debounce 60ms, зняття delayed 120ms);
     active = інверсія (фон heading, текст background).
   • Tooltip picture--floor (живий шаблон): «Floor <h2>N</h2>» +
     «N offices» + площі; placement right від плити; 0.6s air.
   • T-M32: на тачі дрил НЕ існує — SVG-шар ховається, показується
     слот [data-bfd-mobile] («only on desktop» + list-заміна).

   РОЗМІТКА:
     <div data-bfd>
       <div data-bfd-photo>…фото/рендер ізометрії…</div>
       <svg data-bfd-svg>…<g data-hoverable="1-3">…</g>…</svg>
       <div data-bfd-markers></div>   ← движок ставить маркери
       <div data-bfd-tooltip></div>   ← движок керує (одна картка)
       <div data-bfd-mobile>…T-M32 заглушка…</div>

   BuildingFloorDrill.create(root, config, opts?)
     config: { floors: [{ref,building,floor,count,areaMin,areaMax,href}],
               markers: [{building,title,anchor}] }  // anchor = ref групи
                                                     // під маркером (bbox top)
     opts: { onSelect(floor) — замість переходу href; touchMq }
   Повертає { hover(ref), leave(), activeBuilding(), gate, destroy }

   ENGINE LAWS: стани = класи, рух = CSS transitions (жива крива);
   JS без таймлайнів, тільки debounce 60/120ms (живий buildingPlan);
   __LAB_OK__ не торкається (B15).
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function toEl(x) { return typeof x === 'string' ? doc.querySelector(x) : x; }

  function create(root, config, options) {
    root = toEl(root);
    options = options || {};
    if (!root || !config || !config.floors)
      return { error: 'потрібні root і config.floors' };
    var svg = root.querySelector('[data-bfd-svg]');
    var markersBox = root.querySelector('[data-bfd-markers]');
    var tooltipBox = root.querySelector('[data-bfd-tooltip]');
    var mobileSlot = root.querySelector('[data-bfd-mobile]');
    var touch = global.matchMedia &&
      global.matchMedia(options.touchMq || '(pointer: coarse), (max-width: 768px)').matches;

    var gate = { hovers: 0, selected: null, activeBuilding: null, clickBlocked: 0 };

    /* T-M32: на моб дрил не існує */
    if (touch) {
      root.classList.add('bfd-touch');
      if (mobileSlot) mobileSlot.removeAttribute('hidden');
      return { touch: true, gate: gate, destroy: function () {
        root.classList.remove('bfd-touch');
      } };
    }
    if (mobileSlot) mobileSlot.setAttribute('hidden', '');

    var byRef = {};
    config.floors.forEach(function (f) { byRef[f.ref] = f; });

    /* ---- плити: живі стани plan-hoverable ---- */
    var plates = Array.prototype.slice.call(svg.querySelectorAll('[data-hoverable]'));
    plates.forEach(function (g) {
      var f = byRef[g.getAttribute('data-hoverable')];
      var clickable = !!(f && f.count > 0);            /* живий закон: count>0 */
      g.classList.add('bfd-plate');
      g.classList.add(clickable ? 'bfd-clickable' : 'bfd-disabled');
    });

    /* ---- маркери веж (живий шаблон plan-marker--building) ---- */
    var markerEls = {};
    (config.markers || []).forEach(function (m) {
      var el = doc.createElement('div');
      el.className = 'bfd-marker';
      el.innerHTML = '<span class="bfd-marker-content">' + m.title + '</span>';
      var anchor = svg.querySelector('[data-hoverable="' + m.anchor + '"]')
                || svg.querySelector('[data-anchor="' + m.anchor + '"]'); /* живі маркери на data-anchor k1/k2/k3 */
      if (anchor && anchor.getBBox && svg.viewBox && svg.viewBox.baseVal.width) {
        var bb = anchor.getBBox();
        var vb = svg.viewBox.baseVal;
        el.style.left = ((bb.x + bb.width / 2) / vb.width * 100) + '%';
        el.style.top = (bb.y / vb.height * 100) + '%';   /* placement: top */
      }
      markersBox.appendChild(el);
      markerEls[String(m.building)] = el;
    });

    /* ---- активна вежа: живий buildingPlan (set 60ms, clear 120ms) ---- */
    var setTimer = null, clearTimer = null;
    function applyActive(b) {
      if (gate.activeBuilding === b) return;
      gate.activeBuilding = b;
      Object.keys(markerEls).forEach(function (k) {
        markerEls[k].classList.toggle('bfd-marker-active', k === String(b));
      });
    }
    function setActiveDebounced(b) {
      clearTimeout(clearTimer);
      clearTimeout(setTimer);
      setTimer = setTimeout(function () { applyActive(b); }, 60);   /* живий debounce */
    }
    function clearActiveDelayed() {
      clearTimeout(clearTimer);
      clearTimer = setTimeout(function () { applyActive(null); }, 120); /* живий delay */
    }

    /* ---- tooltip «Floor N · offices · м²» (живий шаблон floor) ---- */
    function fillTooltip(f) {
      var area = f.count > 0
        ? (f.areaMin === f.areaMax ? f.areaMin + ' m²'
           : f.areaMin + '–' + f.areaMax + ' m²')
        : '';
      tooltipBox.innerHTML =
        '<p class="bfd-tt-row"><span class="bfd-tt-label">Floor</span>' +
        '<span class="bfd-tt-num">' + f.floor + '</span></p>' +
        '<p class="bfd-tt-meta">' + f.count + ' office' + (f.count === 1 ? '' : 's') +
        (area ? '<br>' + area : '') + '</p>';
    }
    function placeTooltip(g) {
      var bb = g.getBBox();
      var vb = svg.viewBox.baseVal;
      tooltipBox.style.left = ((bb.x + bb.width) / vb.width * 100) + '%'; /* placement: right */
      tooltipBox.style.top = ((bb.y + bb.height / 2) / vb.height * 100) + '%';
    }

    function onOver(ev) {
      var g = ev.target.closest ? ev.target.closest('[data-hoverable]') : null;
      if (!g) return;
      var f = byRef[g.getAttribute('data-hoverable')];
      if (!f) return;
      gate.hovers++;
      plates.forEach(function (p) { p.classList.toggle('bfd-hovered', p === g); });
      setActiveDebounced(f.building);
      fillTooltip(f);
      placeTooltip(g);
      tooltipBox.classList.add('bfd-tt-on');
    }
    function onOut(ev) {
      var g = ev.target.closest ? ev.target.closest('[data-hoverable]') : null;
      if (!g) return;
      g.classList.remove('bfd-hovered');
      clearActiveDelayed();
      tooltipBox.classList.remove('bfd-tt-on');
    }
    function onClick(ev) {
      var g = ev.target.closest ? ev.target.closest('[data-hoverable]') : null;
      if (!g) return;
      var f = byRef[g.getAttribute('data-hoverable')];
      if (!f || !(f.count > 0)) { gate.clickBlocked++; return; }  /* живий закон */
      gate.selected = f.ref;
      if (options.onSelect) options.onSelect(f);
      else if (f.href) global.location.href = f.href;
    }
    svg.addEventListener('mouseover', onOver);
    svg.addEventListener('mouseout', onOut);
    svg.addEventListener('click', onClick);

    return {
      hover: function (ref) {  /* програмний хук для проб */
        var g = svg.querySelector('[data-hoverable="' + ref + '"]');
        if (g) onOver({ target: g });
      },
      leave: function () {
        plates.forEach(function (p) { p.classList.remove('bfd-hovered'); });
        clearActiveDelayed();
        tooltipBox.classList.remove('bfd-tt-on');
      },
      activeBuilding: function () { return gate.activeBuilding; },
      gate: gate,
      destroy: function () {
        svg.removeEventListener('mouseover', onOver);
        svg.removeEventListener('mouseout', onOut);
        svg.removeEventListener('click', onClick);
        clearTimeout(setTimer); clearTimeout(clearTimer);
        markersBox.innerHTML = '';
      }
    };
  }

  global.BuildingFloorDrill = { create: create };
}(window));
