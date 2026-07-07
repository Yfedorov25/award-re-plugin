/* ============================================================
   GRAVITY-WELL · component.js  (vanilla, нуль залежностей)
   ------------------------------------------------------------
   T-509 gravity-well — м'який магнітний ДОВОДЧИК скролу (НЕ snap-trap).
   Механіка знята з живого air-shared.js (updateGravityWellLerp /
   updateGravityWellDelta, 2026-07-07):

   ЖИВЕ (webpack SmoothScroll): біля точки-свердловини lerp плавного
   скролу МЕНШАЄ (scroller.scroll.lerp *= factor) — скрол стає в'язкішим,
   виникає відчуття тяжіння; ціль скролу м'яко підтягується до центру
   (e.next -= l·i·(1−Pe.b)). Вільний скрол ЗАВЖДИ проходить наскрізь.
   Це В'ЯЗКІСТЬ, НЕ snap-jump. Рада: НЕ scroll-trap для RE — тільки на
   КОРОТКИХ index/map секціях, НІКОЛИ під довгим reveal (R_anti_combos).

   ⚠️ ТОЧНІ КОНСТАНТИ ТЯЖІННЯ (Pe.b/Pe.c/Pe.d) — ДІРА: заміфіковані у
   webpack-модулі за числовим індексом, не витягуються. Механізм живий,
   числа — консервативні дефолти (позначено law:"gap").

   НАШ ПЕРЕКЛАД (без володіння smooth-scroll, щоб не воювати з Lenis):
   довідник на нативному скролі. Коли швидкість скролу ~0 (користувач
   ВІДПУСТИВ) і scrollY у зоні свердловини [center ± radius], застосовуємо
   МІКРО-scrollBy до центру, масштабований дистанцією (ближче → сильніше,
   але завжди ніжно) через nudgeMax. Активне гортання (велика швидкість)
   НІКОЛИ не чіпається — anti-trap. На тачі ВИМКНЕНО (живий закон:
   на мобільному AIR снапів не спостерігається; enableTouch:false).

   РОЗМІТКА:
     <section data-gw-point>…коротка index/map секція…</section>
     (кілька точок — кілька свердловин; center = центр секції у в'юпорті)

   GravityWell.create(opts?) — усі опційні:
     radiusSvh: 42     // півширина зони впливу (частка svh) — law:gap (жива Pe.d невідома)
     nudgeMax: 3.2     // макс px/кадр доводки в центрі зони — консервативно
     settleVel: 6      // |px/кадр| нижче якого вважаємо «відпустив» (anti-trap поріг)
     minPull: 1.2      // px/кадр — нижче якого не смикаємо (мертва зона біля центру, щоб не «дзижчало»)
     enableTouch: false// живий закон: на тачі вимкнено
     scope: document
   Повертає { gate, points(), destroy }

   ENGINE LAWS: rAF ГЕЙТОВАНИЙ (працює лише коли є свердловини і не тач);
   зона впливу коротка; nudge ТІЛЬКИ на низькій швидкості (anti-trap);
   ніякого preventDefault на wheel; __LAB_OK__ не чіпається (B15).
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(options) {
    options = options || {};
    var scope = options.scope || doc;
    var radiusSvh = options.radiusSvh != null ? options.radiusSvh : 42;
    var nudgeMax  = options.nudgeMax  != null ? options.nudgeMax  : 3.2;
    var settleVel = options.settleVel != null ? options.settleVel : 6;
    var minPull   = options.minPull   != null ? options.minPull   : 1.2;
    var enableTouch = !!options.enableTouch;

    var isTouch = global.matchMedia &&
      global.matchMedia('(pointer: coarse), (max-width: 768px)').matches;

    var els = Array.prototype.slice.call(scope.querySelectorAll('[data-gw-point]'));
    var gate = { points: els.length, active: false, nudges: 0, lastPull: 0, disabled: false };

    if (!els.length || (isTouch && !enableTouch)) {
      gate.disabled = true;
      return { gate: gate, points: function () { return []; }, destroy: function () {} };
    }

    function svh() { return global.innerHeight; }         // 1svh ≈ innerHeight (лаба-наближення)
    function radiusPx() { return radiusSvh / 100 * svh(); }

    /* центр свердловини = центр секції у скрол-просторі (щоб при scrollY=center
       секція стояла по центру в'юпорта) */
    function wellCenter(el) {
      var r = el.getBoundingClientRect();
      var top = r.top + global.scrollY;
      return top + r.height / 2 - svh() / 2;
    }

    var lastY = global.scrollY, vel = 0, raf = null;

    function frame() {
      var y = global.scrollY;
      vel = y - lastY;
      lastY = y;

      /* anti-trap: смикаємо ТІЛЬКИ коли користувач майже зупинився */
      if (Math.abs(vel) <= settleVel) {
        var rad = radiusPx(), bestPull = 0, inWell = false;
        for (var i = 0; i < els.length; i++) {
          var c = wellCenter(els[i]);
          var d = y - c;                     // >0 нижче центру, <0 вище
          if (Math.abs(d) < rad) {
            inWell = true;
            /* сила ∝ (1 − |d|/rad): у центрі ~0 (мертва зона), на краю зони max,
               АЛЕ тягне ДО центру → знак −sign(d); близько центру не смикаємо */
            var t = 1 - Math.abs(d) / rad;    // 0 на краю … 1 у центрі
            var pull = -Math.sign(d) * nudgeMax * (1 - t) * (Math.abs(d) > minPull ? 1 : 0);
            if (Math.abs(pull) > Math.abs(bestPull)) bestPull = pull;
          }
        }
        gate.active = inWell;
        if (inWell && Math.abs(bestPull) >= minPull) {
          global.scrollBy(0, bestPull);
          gate.nudges++;
          gate.lastPull = Math.round(bestPull * 100) / 100;
        } else {
          gate.lastPull = 0;
        }
      } else {
        gate.active = false;
        gate.lastPull = 0;
      }
      raf = global.requestAnimationFrame(frame);
    }
    raf = global.requestAnimationFrame(frame);

    return {
      gate: gate,
      points: function () { return els.map(wellCenter); },
      /* тестовий хук: порахувати pull для заданих (y, vel) БЕЗ побічних ефектів */
      _pullAt: function (y, v) {
        if (Math.abs(v) > settleVel) return 0;
        var rad = radiusPx(), best = 0;
        for (var i = 0; i < els.length; i++) {
          var c = wellCenter(els[i]), d = y - c;
          if (Math.abs(d) < rad) {
            var t = 1 - Math.abs(d) / rad;
            var pull = -Math.sign(d) * nudgeMax * (1 - t) * (Math.abs(d) > minPull ? 1 : 0);
            if (Math.abs(pull) > Math.abs(best)) best = pull;
          }
        }
        return best;
      },
      destroy: function () {
        if (raf) global.cancelAnimationFrame(raf);
        raf = null;
      }
    };
  }

  global.GravityWell = { create: create };
}(window));
