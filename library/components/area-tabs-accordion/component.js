/* ============================================================
   AREA-TABS-ACCORDION · component.js (vanilla, нуль залежностей)
   ------------------------------------------------------------
   Акордеон площ /about (T-M25 + пара T-417/T-407). Живий DOM
   (live-archive 2026-07-06): data-plugin="tabs accordion" —
   ДУАЛЬНИЙ: md-up = TABS (заголовки площ 79/136.1/220.4/340 м²,
   role=tab, is-active), sm-down = ACCORDION (animate-height,
   auto-scroll до відкритої). Панель: план + гігант-число + CTA.
   ⚠️ Авто-закриття сусідів на моб живим НЕ ЗНЯТЕ (діра дозйомки) —
   multi-open дозволений, НЕ вигадуємо.

   РОЗМІТКА:
     <div data-ata>
       <nav data-ata-tabs></nav>            ← движок будує з панелей
       <section data-ata-panel data-ata-label="79 м²">…</section> ×N

   AreaTabsAccordion.create(root, opts?) → { open(i), mode(), gate, destroy }
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  function toEl(x) { return typeof x === 'string' ? doc.querySelector(x) : x; }

  function create(root, options) {
    root = toEl(root);
    options = options || {};
    if (!root) return { error: 'no root' };
    var panels = Array.prototype.slice.call(root.querySelectorAll('[data-ata-panel]'));
    var tabsNav = root.querySelector('[data-ata-tabs]');
    if (!panels.length || !tabsNav) return { error: 'потрібні [data-ata-tabs] і [data-ata-panel]' };
    var touch = global.matchMedia &&
      global.matchMedia(options.touchMq || '(pointer: coarse), (max-width: 768px)').matches;
    var gate = { mode: touch ? 'accordion' : 'tabs', opens: 0, active: 0 };
    var cur = 0;

    root.classList.add(touch ? 'ata-accordion' : 'ata-tabs');

    /* заголовки з панелей (живі office-tabs__headings) */
    panels.forEach(function (p, i) {
      var label = p.getAttribute('data-ata-label') || ('Панель ' + (i + 1));
      if (!touch) {
        var a = doc.createElement('a');
        a.setAttribute('role', 'tab');
        a.setAttribute('tabindex', '0');
        a.textContent = label;
        if (i === 0) a.classList.add('is-active');
        a.addEventListener('click', function () { openTab(i); });
        tabsNav.appendChild(a);
      } else {
        /* акордеон: кнопка-рядок перед панеллю (press-state) */
        var btn = doc.createElement('button');
        btn.type = 'button';
        btn.className = 'ata-acc-head';
        btn.innerHTML = '<span>' + label + '</span><i class="ata-acc-plus">✛</i>';
        btn.addEventListener('click', function () { toggleAcc(i, btn); });
        p.parentNode.insertBefore(btn, p);
        p.classList.add('ata-acc-panel');
        p.style.height = '0px';
      }
    });

    function openTab(i) {
      if (i === cur) return;
      cur = i;
      gate.opens++; gate.active = i;
      Array.prototype.forEach.call(tabsNav.children, function (a, k) {
        a.classList.toggle('is-active', k === i);
        a.setAttribute('aria-selected', String(k === i));
      });
      panels.forEach(function (p, k) { p.classList.toggle('ata-off', k !== i); });
    }
    if (!touch) panels.forEach(function (p, k) { if (k) p.classList.add('ata-off'); });

    /* T-M25: animate-height + auto-scroll (живий data-accordion-auto-scroll) */
    function toggleAcc(i, btn) {
      var p = panels[i];
      var open = !p.classList.contains('ata-open');
      gate.opens++;
      p.classList.toggle('ata-open', open);
      btn.classList.toggle('is-open', open);
      p.style.height = open ? p.scrollHeight + 'px' : '0px';
      if (open) {
        gate.active = i;
        global.setTimeout(function () {
          btn.scrollIntoView({ behavior: 'smooth', block: 'start' }); /* auto-scroll */
        }, 320);
      }
    }

    return {
      open: function (i) { touch ? toggleAcc(i, root.querySelectorAll('.ata-acc-head')[i]) : openTab(i); },
      mode: function () { return gate.mode; },
      gate: gate,
      destroy: function () {
        tabsNav.innerHTML = '';
        root.querySelectorAll('.ata-acc-head').forEach(function (b) { b.remove(); });
        panels.forEach(function (p) {
          p.classList.remove('ata-off', 'ata-open', 'ata-acc-panel');
          p.style.height = '';
        });
      }
    };
  }

  global.AreaTabsAccordion = { create: create };
}(window));
