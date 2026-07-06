/* ============================================================
   TEXT-BLUR-REVEAL · component.js  (vanilla + GSAP 3.12.5)
   ------------------------------------------------------------
   ОСНОВНИЙ reveal-канон AIR (T-322; контракт D_AIR_invest_1to1
   §3.1/§6.1): текст в'їжджає filter blur(10px)->0 + opacity,
   БЕЗ y-зсуву. Каскад на СЕКЦІЮ за ордером (заголовок -> цифри ->
   параграфи) з лагом 0.18s, 0.3s на елемент, once по скрол-тригеру.

   Систематизація движка blur-reveal v3 з бойових invest-комбо
   (invest--quiet-depth + invest--strategy-machine, вердикт власника
   «топ» 2026-07-05) — закони НЕ переписані, перенесені 1-в-1:

   Д4(а) ОДИН каскад на секцію: елементи ордера йдуть РАЗОМ
     (delay = order * lag), не по-елементний стаґер.
   Д4(б) СТРИБОК/МІДСКРОЛ = settled МИТТЄВО: секція, досягнута
     стрибком (delta > jumpVh за одну scroll-подію), мідскрол-
     приходом або вже пройдена — рендериться в кінцевому стані
     БЕЗ анімації. Реальний тач/wheel дає <0.3vh на подію,
     0.45vh ловить і компактний мобільний стрибок.
   РЕЙС-СТІЙКІСТЬ (виміряно телеметрією): IO-колбек у headless
     приходить РАНІШЕ за scroll-подію того самого стрибка, тож
     рішення «каскад чи instant» відкладається на ОДИН кадр —
     scroll-кроки рендер-циклу відпрацьовують ДО rAF-колбеків.
   MAINTENANCE-ФІКС 2026-07-05: звичайний скрол-крок (delta>2px)
     СКАСОВУЄ стрибок-мітку — швидкий прохід більше не конвертує
     чесний каскад у хибний instant.
   DECODE-ГЕЙТ: озброєння чекає на decode() ключових медіа
     (opts.keyMedia) — reveal не стартує на пікселях, яких нема.
   D4-ВИНЯТОК (доктрина): blur не в списку transform/opacity/
     clip-path — дозволений СВІДОМО як one-shot <=0.3s/елемент,
     time-based, НІКОЛИ не scrub. Хто хоче скрабити блюр — іде
     переписувати конституцію, не цей файл.

   РОЗМІТКА:
     секція-група   = будь-який контейнер (аргумент sections)
     елемент        = [data-brv] всередині секції
     ордер          = data-brv-order="0|1|2|3" (дефолт 0)

   TextBlurReveal.create(sections, opts)
     sections: селектор | Element | Element[] — кожен = група-каскад
     opts (усі опційні): {
       duration: 0.3,      // s на елемент (контракт 0.3; НЕ scrub)
       lag: 0.18,          // s між ордерами (контракт 0.15-0.25)
       blurFrom: 10,       // стартовий blur px
       ease: 'out-quad',   // 'out-quad' | 'air'
       threshold: 0.18,    // IO-поріг запуску групи
       jumpVh: 0.45,       // частка vh: більша дельта = стрибок
       keyMedia: [],       // селектор|Element[] — decode-гейт
       autoArm: true       // false = озброїти вручну через .arm()
     }
   Повертає { groups, gate, log, arm, settled, destroy }
     (або { static:true, destroy } у reduced-motion / no-GSAP гілці —
     контент видимий одразу, нуль ховання).

   ENGINE LAWS: рух = filter+opacity ТІЛЬКИ, БЕЗ y-зсуву (контракт);
   ховання елементів відбувається ЛИШЕ коли GSAP живий і motion
   дозволений (no-JS/reduced бачать контент завжди); will-change
   ставиться перед твіном і чиститься onComplete (К1.4); once —
   група ніколи не перезапускається; __LAB_OK__ не торкається (B15).
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

  function toElements(x) {
    if (!x) return [];
    if (typeof x === 'string') return Array.prototype.slice.call(doc.querySelectorAll(x));
    if (x.nodeType === 1) return [x];
    return Array.prototype.slice.call(x);
  }

  function create(sections, options) {
    options = options || {};
    var roots = toElements(sections);
    if (!roots.length) return { error: 'no sections' };

    var opt = {
      duration: options.duration != null ? options.duration : 0.3,
      lag: options.lag != null ? options.lag : 0.18,
      blurFrom: options.blurFrom != null ? options.blurFrom : 10,
      ease: options.ease || 'out-quad',
      threshold: options.threshold != null ? options.threshold : 0.18,
      jumpVh: options.jumpVh != null ? options.jumpVh : 0.45,
      autoArm: options.autoArm !== false
    };
    var easeFn = EASES[opt.ease] || EASES['out-quad'];

    var hasGsap = !!(global.gsap && global.gsap.to);
    var reduced = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* reduced / no-GSAP гілка: контент видимий, нуль роботи */
    if (!hasGsap || reduced) {
      return { static: true, destroy: function () {} };
    }
    var gsap = global.gsap;

    var log = [];
    var gate = { decodeT: -1, firstRevealT: -1, groupRuns: {}, instant: [], armY: -1, armT: -1 };

    var groups = roots.map(function (root, i) {
      var els = Array.prototype.slice.call(root.querySelectorAll('[data-brv]'));
      els.forEach(function (el) { el.__order = +el.getAttribute('data-brv-order') || 0; });
      return { id: root.id || 'g' + i, root: root, els: els, runs: 0, io: null };
    }).filter(function (g) { return g.els.length; });

    /* ховаємо ЛИШЕ тут — коли точно відомо, що движок анімуватиме */
    groups.forEach(function (g) {
      g.els.forEach(function (el) {
        gsap.set(el, { opacity: 0, filter: 'blur(' + opt.blurFrom + 'px)', willChange: 'filter,opacity' });
      });
    });

    var keyMedia = toElements(options.keyMedia);

    /* Д4(б): миттєвий settled-рендер без анімації */
    function applyInstant(g) {
      gate.instant.push(g.id);
      g.els.forEach(function (el) {
        gsap.set(el, { opacity: 1, filter: 'blur(0px)', clearProps: 'will-change' });
      });
    }
    /* Д4(а): один каскад на секцію, лаг за ОРДЕРОМ */
    function applyCascade(g) {
      g.els.forEach(function (el) {
        gsap.to(el, {
          opacity: 1, filter: 'blur(0px)', duration: opt.duration,
          delay: el.__order * opt.lag, ease: easeFn,
          onStart: function () {
            var t = performance.now();
            if (gate.firstRevealT < 0) gate.firstRevealT = t;
            log.push({ g: g.id, order: el.__order, t: t });
          },
          onComplete: function () { gsap.set(el, { clearProps: 'will-change' }); }
        });
      });
    }
    /* ЄДИНА точка запуску групи; рішення відкладене на один кадр (рейс-стійкість) */
    function settle(g, mode) {
      if (g.runs > 0) return;
      g.runs++;
      gate.groupRuns[g.id] = g.runs;
      if (g.io) { g.io.disconnect(); g.io = null; }
      if (mode === 'instant') { applyInstant(g); return; }
      requestAnimationFrame(function () {
        if (lastJumpT > 0 && performance.now() - lastJumpT < 250) applyInstant(g);
        else applyCascade(g);
      });
    }

    var lastScrollY = 0, lastJumpT = -1;
    /* СИНХРОННО в scroll-події (НЕ rAF-дефер: IO-колбек виграє гонку) */
    function onScrollJump() {
      var y = global.scrollY, delta = Math.abs(y - lastScrollY);
      lastScrollY = y;
      var vhpx = global.innerHeight;
      if (delta > vhpx * opt.jumpVh) lastJumpT = performance.now();
      else if (delta > 2) lastJumpT = -1; /* maintenance-фікс: скрол-крок скасовує стрибок-мітку */
      var pending = groups.filter(function (g) { return g.runs === 0; });
      if (!pending.length) { global.removeEventListener('scroll', onScrollJump); return; }
      pending.forEach(function (g) {
        var r = g.root.getBoundingClientRect();
        if (r.bottom < 60) { settle(g, 'instant'); return; }              /* проскочена */
        if (delta > vhpx * opt.jumpVh && r.top < vhpx * 0.85 && r.bottom > 0) {
          settle(g, 'instant');                                           /* стрибок у секцію */
        }
      });
    }

    var armed = false;
    function arm() {
      if (armed) return;
      armed = true;
      var vhpx = global.innerHeight;
      var midScrollArrival = global.scrollY > vhpx * 0.5;                 /* Д4(б) */
      gate.armY = global.scrollY;
      gate.armT = Math.round(performance.now());
      groups.forEach(function (g) {
        var r = g.root.getBoundingClientRect();
        if (r.bottom < vhpx * 0.15) { settle(g, 'instant'); return; }
        if (midScrollArrival && r.top < vhpx * 0.85 && r.bottom > 0) { settle(g, 'instant'); return; }
        g.io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) { if (en.isIntersecting) settle(g, 'auto'); });
        }, { threshold: opt.threshold });
        g.io.observe(g.root);
      });
      lastScrollY = global.scrollY;
      global.addEventListener('scroll', onScrollJump, { passive: true });
    }

    function settled() {
      return groups.every(function (g) { return g.runs > 0; });
    }
    function destroy() {
      global.removeEventListener('scroll', onScrollJump);
      groups.forEach(function (g) {
        if (g.io) g.io.disconnect();
        g.els.forEach(function (el) {
          gsap.killTweensOf(el);
          gsap.set(el, { clearProps: 'opacity,filter,will-change' });
        });
      });
    }

    /* DECODE-ГЕЙТ: озброєння після decode() ключових медіа */
    if (opt.autoArm) {
      Promise.all(keyMedia.map(function (im) {
        return (im && im.decode) ? im.decode().catch(function () {}) : Promise.resolve();
      })).then(function () {
        gate.decodeT = performance.now();
        arm();
      });
    }

    return { groups: groups, gate: gate, log: log, arm: arm, settled: settled, destroy: destroy };
  }

  global.TextBlurReveal = { create: create };
}(window));
