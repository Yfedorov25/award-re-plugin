/* ============================================================
   GIANT-NUMBER-FACT · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger)
   ------------------------------------------------------------
   AIR T-422 — гігантське число-факт: «400 STORES», «3 MIN WALK» величезним
   кеглем (clamp ~20-28vw) з людським підписом. + T-304 (counter count-up):
   число докручується лічильником до значення, коли секція в'їжджає у
   в'юпорт. ОДИН раз (once) — число не смикається на кожному скролі.

   THE MOVE:
     - markup-first: [data-gnf] тримає [data-gnf-num data-gnf-value="22800"]
       (+ опційно data-gnf-decimals), [data-gnf-unit], [data-gnf-label].
       У markup стоїть ФІНАЛЬНЕ відформатоване число = no-JS/reduced-motion
       ПРАВДА без жодного скрипта.
     - wire (JS + motion): число скидається на format(0), блок ховається
       (opacity 0 + translateY slidePx). ScrollTrigger once:true на
       'top 78%' → play(): блок в'їжджає (transform/opacity) і проксі-твін
       докручує значення house ease-ом (інлайн-солвер, D13).
     - D6 (ЗАКОН ЛІЧИЛЬНИКА): onUpdate пише textContent ЛИШЕ коли
       відформатований рядок ЗМІНИВСЯ. stats = { ticks, writes } відкриті
       назовні — lab машинно доводить writes < ticks.
     - Формат чисел = копі-канон: тисячі через нерозривний пробіл
       (22 800), десяткові через кому (1,5). Реальні символи в JS-рядках,
       НІКОЛИ HTML-entities (B16/К7). tabular-nums проти тремтіння,
       негативний трекінг великого кегля (C27) — у component.css.

   CONFIG-DRIVEN:
     GiantNumberFact.create(target, {
       value: null,          // число; дефолт = data-gnf-value з markup
       decimals: null,       // знаків після коми; дефолт = data-gnf-decimals | 0
       duration: 1.6,        // тривалість докрутки, s (house dur-3)
       ease: 'air',          // 'air' | 'out-quad' | 'out-expo' | 'linear'
       slidePx: 80,          // в'їзд блока, px (transform only)
       start: 'top 78%',     // ScrollTrigger start (once:true завжди)
       trigger: 'scroll'     // 'scroll' | 'manual' (інтегратор кличе play())
     })
   Повертає { el, num, value, stats, played, play(), refresh(), destroy(), ready }.

   ENGINE LAWS: transform/opacity на блоці + textContent лічильника (D4/D6);
   нуль CSS transition на керованих властивостях (D3); нуль getComputedStyle
   у кадрі; once:true — число в'їжджає ОДИН раз і стоїть. Компонент НЕ
   торкається __LAB_OK__ — гейт належить lab-у з пробами (B14/B15).
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  // ---- інлайн cubic-bezier солвер (D13)
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
    air: cubicBezier(0.25, 0.74, 0.22, 0.99),
    'out-quad': cubicBezier(0.25, 0.46, 0.45, 0.94),
    'out-expo': cubicBezier(0.16, 1, 0.30, 1),
    linear: function (t) { return t; }
  };

  // формат канону: тисячі нерозривним пробілом, десяткові через кому (B16: реальні символи)
  function format(v, decimals) {
    var neg = v < 0;
    var s = Math.abs(v).toFixed(decimals);
    var parts = s.split('.');
    var intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return (neg ? '-' : '') + intPart + (parts[1] ? ',' + parts[1] : '');
  }

  function create(target, options) {
    options = options || {};
    var host = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!host) return { error: 'no target' };
    var num = host.querySelector('[data-gnf-num]') || host;

    var opt = {
      value: options.value != null ? options.value
        : parseFloat(num.getAttribute('data-gnf-value') || 'NaN'),
      decimals: options.decimals != null ? options.decimals
        : parseInt(num.getAttribute('data-gnf-decimals') || '0', 10),
      duration: options.duration != null ? options.duration : 1.6,
      ease: options.ease || 'air',
      slidePx: options.slidePx != null ? options.slidePx : 80,
      start: options.start || 'top 78%',
      trigger: options.trigger || 'scroll'
    };
    var easeFn = EASES[opt.ease] || EASES.air;

    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var finalText = format(isNaN(opt.value) ? 0 : opt.value, opt.decimals);
    var stats = { ticks: 0, writes: 0 };
    var state = { played: false, st: null, tweens: [] };
    var readyResolve;
    var ready = new Promise(function (res) { readyResolve = res; });

    function play() {
      if (state.played) return;
      state.played = true;
      var proxy = { v: 0 };
      var last = null;
      // в'їзд блока: transform + opacity only (D4)
      state.tweens.push(gsap.to(host, {
        y: 0, opacity: 1, duration: Math.min(opt.duration, 1.1), ease: easeFn
      }));
      // докрутка: DOM пишеться ЛИШЕ при зміні відформатованого рядка (D6)
      state.tweens.push(gsap.to(proxy, {
        v: opt.value,
        duration: opt.duration,
        ease: easeFn,
        onUpdate: function () {
          stats.ticks++;
          var txt = format(proxy.v, opt.decimals);
          if (txt !== last) { num.textContent = txt; stats.writes++; last = txt; }
        },
        onComplete: function () {
          var txt = format(opt.value, opt.decimals);
          if (txt !== last) { num.textContent = txt; stats.writes++; }
        }
      }));
    }

    function init() {
      if (isNaN(opt.value) || reduced || !gsap ||
          (opt.trigger === 'scroll' && !ScrollTrigger)) {
        // СТАТИЧНА ПРАВДА: фінальне число з markup стоїть як є, нуль руху
        host.classList.add('gnf-static');
        num.textContent = finalText; // нормалізуємо формат, один запис
        state.played = true;
        readyResolve(api);
        return;
      }
      // старт-стан: число на нулі, блок схований (transform/opacity)
      num.textContent = format(0, opt.decimals);
      gsap.set(host, { y: opt.slidePx, opacity: 0 });
      if (opt.trigger === 'scroll') {
        gsap.registerPlugin && gsap.registerPlugin(ScrollTrigger);
        state.st = ScrollTrigger.create({
          trigger: host,
          start: opt.start,
          once: true,           // число в'їжджає ОДИН раз
          onEnter: play
        });
      }
      var fontsReady = (doc.fonts && doc.fonts.ready) ? doc.fonts.ready : Promise.resolve();
      fontsReady.then(function () { readyResolve(api); },
                      function () { readyResolve(api); });
    }

    var api = {
      el: host,
      num: num,
      value: opt.value,
      stats: stats,
      get played() { return state.played; },
      play: play,               // trigger:'manual' — інтегратор кличе сам
      refresh: function () { if (ScrollTrigger) ScrollTrigger.refresh(); },
      destroy: function () {
        if (state.st) { state.st.kill(); state.st = null; }
        state.tweens.forEach(function (t) { t.kill(); });
        state.tweens = [];
        host.classList.remove('gnf-static');
        host.style.transform = '';
        host.style.opacity = '';
        num.textContent = finalText;
      }
    };
    api.ready = ready;

    init();
    return api;
  }

  var api = { create: create, format: format };
  global.GiantNumberFact = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
