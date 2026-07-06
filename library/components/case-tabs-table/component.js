/* ============================================================
   CASE-TABS-TABLE · component.js  (vanilla + GSAP 3.12.5)
   ------------------------------------------------------------
   AIR /investment MODEL-механіка (контракт D_AIR_invest_1to1 §1 B3 + §3.3):
   біла CASE-картка на світлій панелі: таби-клітинки (label 11px CAPS
   верх-ліво, актив = ЧОРНИЙ border-bottom 2px на всю клітинку), тіло =
   великий head зліва (1.9vw) + таблиця праворуч (label сірий зліва /
   значення чорне справа, hairline між рядками, крок ~5.6vh) + рядок-
   результат (пари label -> значення 1.9vw).

   МЕХАНІКА СВОПУ (§3.3, виміряно покадрово): клік таба свапає ЦІЛИЙ
   ДАТАСЕТ КРОСФЕЙДОМ 0.25-0.35s - на перехідних кадрах СТАРЕ й НОВЕ
   значення НАКЛАДЕНІ, нуль layout-зсуву. Реалізація: клон старого
   значення лягає абсолютним привидом поверх (right-aligned), нове
   в'їжджає opacity 0->1, привид гасне і зникає. ТІЛЬКИ opacity (D4).

   T-M19 (мобільний закон, D_AIR_mobile_video §5): слайдерів НЕМА - таби
   tap-свапають фіксований read-only датасет; таблиця full-width, числа
   right-aligned. Sticky-низ пара «1./2. МОДЕЛЬ» (scroll-spy) = справа
   КОМБО (навігація між моделями), не цього атома.

   ЧЕСНІСТЬ ДАНИХ (F1/F7): атом НЕ рахує дохідність/окупність - він
   показує ДАНІ, які йому дали. Лаба живиться ТІЛЬКИ канон-числами
   (22 800, 24/27 м², 2027...), нуль орендних ставок без даних замовника.

   CONFIG-DRIVEN (датасет = конфіг, бо своп цілого набору = суть прийому):
     CaseTabsTable.create(target, {
       cases: [ { tab: "24 метри", head: "Квартира 24 м²",
                  rows: [ { label: "Площа", value: "24 м²" }, ... ],
                  result: [ { label: "Вхід", value: "від 22 800 доларів" }, ... ] }, ... ],
       active: 0,
       duration: 0.3,        // кросфейд датасета (контракт 0.25-0.35s)
       ease: 'out-quad'
     })
   Лейбли рядків МУСЯТЬ збігатися між кейсами (контрактний своп міняє
   ЗНАЧЕННЯ, не структуру) - розбіжність = console.error (чесний фейл).
   Повертає { root, index, setCase(i), cases, els, destroy, ready }.

   ENGINE LAWS: рух = opacity ТІЛЬКИ (D4); нуль CSS transition на
   властивостях, якими керує GSAP (актив-таб border - state-стиль CSS,
   не твін); textContent пишеться лише при зміні (D6); reduced-motion /
   no-GSAP = миттєвий своп без привидів. __LAB_OK__ не торкається (B15).
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function cubicBezier(x1, y1, x2, y2) {
    var cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    var cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    function sx(t) { return ((ax * t + bx) * t + cx) * t; }
    function sy(t) { return ((ay * t + by) * t + cy) * t; }
    function dx(t) { return (3 * ax * t + 2 * bx) * t + cx; }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x, i, d;
      for (i = 0; i < 8; i++) { d = dx(t); if (Math.abs(d) < 1e-6) break; t -= (sx(t) - x) / d; }
      if (t < 0 || t > 1 || Math.abs(sx(t) - x) > 1e-4) {
        var lo = 0, hi = 1; t = x;
        while (hi - lo > 1e-5) { if (sx(t) < x) lo = t; else hi = t; t = (lo + hi) / 2; }
      }
      return sy(t);
    };
  }
  var EASES = {
    'out-quad': cubicBezier(0.25, 0.46, 0.45, 0.94),
    air: cubicBezier(0.25, 0.74, 0.22, 0.99)
  };

  function create(target, options) {
    options = options || {};
    var host = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!host) return { error: 'no target' };
    var cases = options.cases || [];
    if (cases.length < 2) { console.error('[case-tabs-table] потрібно >=2 кейсів'); return { error: 'cases<2' }; }

    // чесний контракт структури: лейбли рядків збігаються між кейсами
    var labels0 = cases[0].rows.map(function (r) { return r.label; });
    for (var ci = 1; ci < cases.length; ci++) {
      var same = cases[ci].rows.length === labels0.length &&
        cases[ci].rows.every(function (r, i) { return r.label === labels0[i]; });
      if (!same) { console.error('[case-tabs-table] лейбли рядків розбігаються між кейсами (своп = значення, не структура)'); }
    }

    var opt = {
      active: options.active || 0,
      duration: options.duration != null ? options.duration : 0.3,
      ease: options.ease || 'out-quad'
    };
    var easeFn = EASES[opt.ease] || EASES['out-quad'];
    var gsap = global.gsap;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var state = { index: opt.active, busy: false };
    var els = { tabs: [], head: null, values: [], resLabels: [], resValues: [] };
    var readyResolve;
    var ready = new Promise(function (res) { readyResolve = res; });

    /* ---------- побудова DOM (markup-first не працює для датасет-свопа:
       датасет = конфіг; хост порожній) ---------- */
    function build() {
      host.classList.add('ctt');
      var tabsRow = doc.createElement('div');
      tabsRow.className = 'ctt__tabs';
      tabsRow.setAttribute('role', 'tablist');
      cases.forEach(function (c, i) {
        var b = doc.createElement('button');
        b.type = 'button';
        b.className = 'ctt__tab';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', i === state.index ? 'true' : 'false');
        if (i === state.index) b.classList.add('is-active');
        var lbl = doc.createElement('span');
        lbl.className = 'ctt__tab-label';
        lbl.textContent = c.tab;
        b.appendChild(lbl);
        b.addEventListener('click', function () { setCase(i); });
        tabsRow.appendChild(b);
        els.tabs.push(b);
      });
      host.appendChild(tabsRow);

      var body = doc.createElement('div');
      body.className = 'ctt__body';
      var head = doc.createElement('div');
      head.className = 'ctt__head ctt-swap ctt-swap--left';
      var headCur = doc.createElement('span');
      headCur.className = 'ctt-cur';
      headCur.textContent = cases[state.index].head;
      head.appendChild(headCur);
      els.head = head;
      body.appendChild(head);

      var table = doc.createElement('div');
      table.className = 'ctt__table';
      cases[state.index].rows.forEach(function (r) {
        var row = doc.createElement('div');
        row.className = 'ctt__row';
        var l = doc.createElement('span');
        l.className = 'ctt__label';
        l.textContent = r.label;
        var v = doc.createElement('span');
        v.className = 'ctt__value ctt-swap';
        var vc = doc.createElement('span');
        vc.className = 'ctt-cur';
        vc.textContent = r.value;
        v.appendChild(vc);
        row.appendChild(l);
        row.appendChild(v);
        table.appendChild(row);
        els.values.push(v);
      });
      body.appendChild(table);
      host.appendChild(body);

      var res = doc.createElement('div');
      res.className = 'ctt__result';
      (cases[state.index].result || []).forEach(function (r) {
        var pair = doc.createElement('div');
        pair.className = 'ctt__res-pair';
        var l = doc.createElement('span');
        l.className = 'ctt__res-label';
        l.textContent = r.label;
        var v = doc.createElement('span');
        v.className = 'ctt__res-value ctt-swap';
        var rc = doc.createElement('span');
        rc.className = 'ctt-cur';
        rc.textContent = r.value;
        v.appendChild(rc);
        pair.appendChild(l);
        pair.appendChild(v);
        res.appendChild(pair);
        els.resLabels.push(l);
        els.resValues.push(v);
      });
      host.appendChild(res);
    }

    /* кросфейд одного слота: обгортка .ctt-swap (position:relative) тримає
       .ctt-cur (живий текст) + абсолютний привид старого поверх - нове 0->1,
       привид 1->0, накладені мід-флайт (контракт §3.3), нуль layout-зсуву.
       ТІЛЬКИ opacity (D4). */
    function swapText(wrap, next) {
      var cur = wrap.querySelector('.ctt-cur');
      if (!cur || cur.textContent === next) return;   // D6: пишемо лише при зміні
      if (!gsap || reduced) { cur.textContent = next; return; }
      var ghost = cur.cloneNode(true);
      ghost.classList.remove('ctt-cur');
      ghost.classList.add('ctt-ghost');
      ghost.setAttribute('aria-hidden', 'true');
      wrap.appendChild(ghost);
      cur.textContent = next;
      gsap.fromTo(cur, { opacity: 0 }, { opacity: 1, duration: opt.duration, ease: easeFn });
      gsap.to(ghost, {
        opacity: 0, duration: opt.duration, ease: easeFn,
        onComplete: function () { if (ghost.parentNode) ghost.parentNode.removeChild(ghost); }
      });
    }

    function setCase(i) {
      if (i === state.index || !cases[i]) return;
      state.index = i;
      els.tabs.forEach(function (t, ti) {
        t.classList.toggle('is-active', ti === i);   // актив = чорний border-bottom (CSS-стан)
        t.setAttribute('aria-selected', ti === i ? 'true' : 'false');
      });
      var c = cases[i];
      swapText(els.head, c.head);
      c.rows.forEach(function (r, ri) { if (els.values[ri]) swapText(els.values[ri], r.value); });
      (c.result || []).forEach(function (r, ri) {
        if (els.resLabels[ri]) swapText(els.resLabels[ri], r.label);
        if (els.resValues[ri]) swapText(els.resValues[ri], r.value);
      });
    }

    build();
    readyResolve && readyResolve(api);

    var api = {
      root: host,
      get index() { return state.index; },
      cases: cases,
      els: els,
      setCase: setCase,
      ready: ready,
      destroy: function () {
        host.innerHTML = '';
        host.classList.remove('ctt');
        els.tabs = []; els.values = []; els.resLabels = []; els.resValues = [];
      }
    };
    return api;
  }

  var api = { create: create };
  global.CaseTabsTable = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
