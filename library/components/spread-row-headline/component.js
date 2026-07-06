/* ============================================================
   SPREAD-ROW-HEADLINE · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   AIR T-310 — системний act-розділювач: 2-4 слова заголовка розведені по ВСІЙ
   ширині рядка (перше слово в лівий край, останнє в правий), і скрол з'їжджає /
   роз'їжджає їх по горизонталі (scrub, реверсивно). На AIR це 8+ ужитків:
   «THE MOMENTUM → TO RISE HIGHER», «A NEW · PREMIUM · FORMAT», «KEY → ADVANTAGES»…

   T-M01 — мобільний закон: spread по горизонталі ГИНЕ на портреті. ≤768px атом
   колапсує у ЛІВИЙ 2-рядковий wrap по СМИСЛОВІЙ парі ([data-srh-group]), без
   spread, без transform, без pin (C7). Роль act-розділювача на мобайлі перебирає
   інверсія фону (T-M07) — не цей атом.

   THE MOVE (desktop):
     - fonts.ready → split заголовка ПО СЛОВАХ (D12, ніколи по літерах);
       ряд = flex space-between → SPREAD-стан є CSS-ПРАВДОЮ (p=1, transform 0).
     - measure(): рект кожного слова в spread-стані + арифметична «зібрана фраза»
       (природні ширини + gap wordGapEm) біля convergeAnchor.
     - ПРОГРЕС = РЕАЛЬНИЙ ПРОХІД КРІЗЬ В'ЮПОРТ (C21, амплітудний фікс). Атом шукає
       секцію-пас ([data-srh-section] або opt.section, ~200vh) і скрабить її
       'top top' → 'bottom bottom' — це і є p=(-rect.top)/(rect.height-vh):
       слово-речення в'їжджає ЗІБРАНИМ і виходить ПОВНІСТЮ РОЗВЕДЕНИМ. Рух
       активний на всьому пассі, нуль мертвих зон (0-25% і 75-100% включно).
       Без секції — фолбек: пас самого ряду 'top bottom' → 'top 25%' (рух від
       першого видимого пікселя).
     - ВЕРТИКАЛЬНИЙ СУПРОВІД — справа host-розмітки, не атома: ряд (з kicker)
       кладеться в CSS sticky-обгортку 100vh усередині секції-пасу (top:0,
       grid-центр) і тримається по центру в'юпорта ВЕСЬ прохід — жодних
       порожніх смуг (C22-порожнеча). НЕ GSAP pin (owns_pin false, пін-бюджет
       цілий); sticky-тір 100vh = innerHeight (B14); предки sticky БЕЗ
       overflow-x:hidden (К1.7 — тільки clip, якщо треба обрізати).
     - apply(p): ЧИСТА функція прогресу. Кожне слово має власне зсунуте
       прогрес-вікно (stagger); всередині вікна — house ease (інлайн-солвер
       cubic-bezier, D13: ніякого gsap.utils.parseEase). Трек лишається 1:1 до
       скролбара (scrub:true), ease живе ТІЛЬКИ в персловному sub-window
       (R_timing_layers).
     - transform = translateX(px) ТІЛЬКИ. Нуль layout-props, нуль CSS transition
       на scroll-керованих властивостях (D3/D4). Вертикальний хід ряду крізь
       екран — природний потік документа, НЕ transform і НЕ pin.

   CONFIG-DRIVEN:
     SpreadRowHeadline.create(target, {
       section: null,             // елемент/селектор секції-пасу (C21). Дефолт:
                                  // host.closest('[data-srh-section]'). Секція знайдена →
                                  // scrub = її прохід крізь в'юпорт ('top top'→'bottom bottom')
       spreadWidth: 1,            // частка повного розведення (1 = край-до-краю)
       convergeAnchor: 0.5,       // де сидить зібрана фраза при p=0 (0 ліво … 1 право)
       stagger: 0.06,             // зсув прогрес-вікна на слово (частка p)
       wordGapEm: 0.14,           // міжслівний зазор зібраної фрази, em (майже впритул:
                                  // кластер читається як ОДНЕ зібране слово-речення)
       ease: 'air',               // 'air' | 'out-quad' | 'out-expo' | 'linear'
       direction: 'spread',       // 'spread' = зібрані → розведені на в'їзді (AIR-канон)
                                  // 'converge' = інверсія (розведені → зібрані)
       start: null, end: null,    // явний override вікна scrub-а (без нього — C21-пас
                                  // секції, або фолбек 'top bottom'→'top 25%' по ряду)
       trigger: 'scroll',         // 'scroll' (ScrollTrigger scrub) | 'progress' (ручний set(p))
       mode: 'auto',              // 'auto' (matchMedia) | 'desktop' | 'mobile'
       mobileBreakpoint: 768,
       manageLenis: false
     })
   Markup: <h2 data-srh>
             <span data-srh-group>МОМЕНТ</span>
             <span data-srh-group>ПІДНЯТИСЯ ВИЩЕ</span>
           </h2>
   Групи = СМИСЛОВІ пари T-M01 (мобільні рядки). Без груп — весь текст = 1 група.
   Повертає { words, groups, mode, trigger, set(p), measure, refresh, destroy, ready }.

   ENGINE LAWS: transform translateX ONLY на .srh-word. Нуль getComputedStyle у
   кадрі (метрики знімаються в measure(), не в apply()). owns_pin false — атом
   ніколи не пінить, мобайл тим паче (C7). Компонент НЕ торкається __LAB_OK__:
   гейт належить lab-у з гео-пробами (B14/B15 — гейт не бреше).
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  // ---- інлайн cubic-bezier солвер (D13: не покладаємось на gsap.utils.parseEase)
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
  // house-токени з library/tokens/_tokens.json
  var EASES = {
    air: cubicBezier(0.25, 0.74, 0.22, 0.99),
    'out-quad': cubicBezier(0.25, 0.46, 0.45, 0.94),
    'out-expo': cubicBezier(0.16, 1, 0.30, 1),
    linear: function (t) { return t; }
  };

  function create(target, options) {
    options = options || {};
    var opt = {
      section: options.section != null ? options.section : null,
      spreadWidth: options.spreadWidth != null ? options.spreadWidth : 1,
      convergeAnchor: options.convergeAnchor != null ? options.convergeAnchor : 0.5,
      stagger: options.stagger != null ? options.stagger : 0.06,
      wordGapEm: options.wordGapEm != null ? options.wordGapEm : 0.14,
      ease: options.ease || 'air',
      direction: options.direction === 'converge' ? 'converge' : 'spread',
      start: options.start || null,
      end: options.end || null,
      trigger: options.trigger || 'scroll',
      mode: options.mode || 'auto',
      mobileBreakpoint: options.mobileBreakpoint != null ? options.mobileBreakpoint : 768,
      manageLenis: options.manageLenis === true
    };
    var easeFn = EASES[opt.ease] || EASES.air;

    var host = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!host) return { error: 'no target' };

    // ---- секція-пас (C21): прогрес = реальний прохід секції крізь в'юпорт.
    // Явний opt.section > маркап [data-srh-section] > фолбек: пас самого ряду.
    var sectionEl = null;
    if (opt.section) {
      sectionEl = typeof opt.section === 'string' ? doc.querySelector(opt.section) : opt.section;
    }
    if (!sectionEl && host.closest) sectionEl = host.closest('[data-srh-section]');
    var passMode = !!(sectionEl && sectionEl !== host);

    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mql = (opt.mode === 'auto' && global.matchMedia)
      ? global.matchMedia('(max-width: ' + opt.mobileBreakpoint + 'px)') : null;

    // оригінальна розмітка = джерело правди для rebuild/destroy
    var originalHTML = host.innerHTML;

    // ---- смислові групи (T-M01): [data-srh-group] або весь текст однією групою
    function readGroups() {
      var out = [];
      var els = host.querySelectorAll('[data-srh-group]');
      if (els.length) {
        Array.prototype.forEach.call(els, function (el) {
          var ws = (el.textContent || '').trim().split(/\s+/).filter(Boolean);
          if (ws.length) out.push(ws);
        });
      } else {
        var ws = (host.textContent || '').trim().split(/\s+/).filter(Boolean);
        if (ws.length) out.push(ws);
      }
      return out;
    }
    var groups = readGroups();
    var totalWords = groups.reduce(function (n, g) { return n + g.length; }, 0);

    // ---- живий стан (перезаписується на rebuild) ----
    var state = { mode: 'static', words: [], lines: [], row: null, st: null, lenis: null };
    var xs = [], ws_ = [], conv = [], eff = [], lastP = 0;
    var readyResolve;
    var ready = new Promise(function (res) { readyResolve = res; });

    function isMobile() {
      if (opt.mode === 'mobile') return true;
      if (opt.mode === 'desktop') return false;
      return !!(mql && mql.matches);
    }

    // ================= МОБАЙЛ (T-M01): лівий стек по смисловій парі ============
    function buildMobile() {
      host.innerHTML = '';
      host.classList.add('srh-host', 'srh-stack', 'srh-static');
      state.mode = 'mobile';
      state.lines = groups.map(function (g) {
        var line = doc.createElement('span');
        line.className = 'srh-line';
        line.textContent = g.join(' ');
        host.appendChild(line);
        return line;
      });
    }

    // ================= ДЕСКТОП: spread-row + scrub-конвергенція ================
    function buildDesktopDOM() {
      host.innerHTML = '';
      host.classList.add('srh-host');
      var row = doc.createElement('span');
      row.className = 'srh-row';
      state.row = row;
      state.words = [];
      groups.forEach(function (g, gi) {
        g.forEach(function (txt) {
          var w = doc.createElement('span');
          w.className = 'srh-word';
          w.setAttribute('data-srh-g', String(gi));
          w.textContent = txt;
          row.appendChild(w);
          state.words.push(w);
        });
      });
      host.appendChild(row);
    }

    // measure: скидає transform-и (рект = CSS-правда spread), знімає геометрію,
    // рахує «зібрану фразу» арифметично. НІКОЛИ не викликається в кадрі.
    function measure() {
      var words = state.words;
      if (!words.length || !state.row) return;
      for (var i = 0; i < words.length; i++) words[i].style.transform = '';
      var rowRect = state.row.getBoundingClientRect();
      var W = rowRect.width;
      var fs = parseFloat(global.getComputedStyle(host).fontSize) || 16;
      var gap = fs * opt.wordGapEm;
      xs = []; ws_ = [];
      for (i = 0; i < words.length; i++) {
        var r = words[i].getBoundingClientRect();
        xs.push(r.left - rowRect.left);
        ws_.push(r.width);
      }
      var cluster = ws_.reduce(function (a, b) { return a + b; }, 0) + gap * (words.length - 1);
      var free = Math.max(0, W - cluster);
      var cLeft = Math.min(free, Math.max(0, opt.convergeAnchor * free));
      conv = []; eff = [];
      var acc = cLeft;
      for (i = 0; i < words.length; i++) {
        conv.push(acc);
        acc += ws_[i] + gap;
      }
      for (i = 0; i < words.length; i++)
        eff.push(conv[i] + (xs[i] - conv[i]) * opt.spreadWidth);
      apply(lastP);
    }

    // ЧИСТА функція прогресу: той самий p → той самий кадр (реверсивно).
    // Трек 1:1 до скролу; ease тільки в персловному sub-window (R_timing_layers).
    function apply(p) {
      lastP = p = clamp01(p);
      var words = state.words;
      var n = words.length;
      if (!n || !conv.length) return;
      var pe = opt.direction === 'converge' ? 1 - p : p;
      var s = n > 1 ? Math.min(opt.stagger, 0.6 / (n - 1)) : 0;
      var win = 1 - s * (n - 1);
      for (var i = 0; i < n; i++) {
        var wp = clamp01((pe - s * i) / win);
        var e = easeFn(wp);
        var targetX = conv[i] + (eff[i] - conv[i]) * e;
        words[i].style.transform = 'translateX(' + (targetX - xs[i]).toFixed(2) + 'px)';
      }
    }

    function wireDesktop() {
      measure();
      if (opt.trigger === 'scroll' && ScrollTrigger) {
        // C21: пас секції ('top top'→'bottom bottom' = p=(-rect.top)/(rect.height-vh))
        // тримає рух активним УВЕСЬ час, поки ряд перетинає екран — нуль мертвих зон.
        // Фолбек без секції: пас самого ряду від першого видимого пікселя.
        state.st = ScrollTrigger.create({
          trigger: passMode ? sectionEl : host,
          start: opt.start || (passMode ? 'top top' : 'top bottom'),
          end: opt.end || (passMode ? 'bottom bottom' : 'top 25%'),
          scrub: true,
          invalidateOnRefresh: true,
          onRefresh: function () { measure(); },
          onUpdate: function (self) { apply(self.progress); }
        });
        apply(state.st.progress || 0);
      } else {
        apply(0); // 'progress': інтегратор драйвить set(p) сам
      }
    }

    var resizeT = null;
    function onResize() {
      clearTimeout(resizeT);
      resizeT = setTimeout(function () {
        if (state.mode !== 'desktop') return;
        if (ScrollTrigger && state.st) ScrollTrigger.refresh(); // → onRefresh → measure (D16)
        else measure();
      }, 180);
    }

    function init() {
      if (isMobile()) {                 // T-M01: статичний лівий стек, нуль руху, нуль pin (C7)
        buildMobile();
        readyResolve(api);
        return;
      }
      if (totalWords < 2 || reduced || !gsap || !ScrollTrigger) {
        // статичний spread = CSS-правда (розведений ряд без руху)
        buildDesktopDOM();
        host.classList.add('srh-static');
        state.mode = 'static';
        readyResolve(api);
        return;
      }
      state.mode = 'desktop';
      gsap.registerPlugin && gsap.registerPlugin(ScrollTrigger);
      buildDesktopDOM();
      // fonts.ready ПЕРЕД вимірюванням: ширини слів залежать від шрифту (D12/D17)
      var fontsReady = (doc.fonts && doc.fonts.ready) ? doc.fonts.ready : Promise.resolve();
      fontsReady.then(function () { wireDesktop(); readyResolve(api); },
                      function () { wireDesktop(); readyResolve(api); });
      global.addEventListener('resize', onResize);
    }

    function teardown() {
      if (state.st) { state.st.kill(); state.st = null; }
      global.removeEventListener('resize', onResize);
      host.classList.remove('srh-host', 'srh-stack', 'srh-static');
      host.innerHTML = originalHTML;
      state.words = []; state.lines = []; state.row = null;
      xs = []; conv = []; eff = []; lastP = 0;
    }

    function rebuild() { teardown(); init(); }

    // авто-перемикання гілки на перетині брейкпойнта (mode:'auto')
    function onMQ() { rebuild(); }
    if (mql) { mql.addEventListener ? mql.addEventListener('change', onMQ) : mql.addListener(onMQ); }

    var lenis = null;
    if (opt.manageLenis && Lenis && gsap && !reduced) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', function () { ScrollTrigger && ScrollTrigger.update(); });
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
      state.lenis = lenis;
    }

    var api = {
      get words() { return state.words; },
      get lines() { return state.lines; },
      get mode() { return state.mode; },
      get trigger() { return state.st; },
      groups: groups,
      lenis: lenis,
      ready: null,          // проміс: резолвиться після fonts.ready + wire
      set: apply,           // ЧИСТИЙ p → кадр (для trigger:'progress' або вручну)
      measure: measure,
      refresh: function () { if (ScrollTrigger) ScrollTrigger.refresh(); else measure(); },
      destroy: function () {
        if (mql) { mql.removeEventListener ? mql.removeEventListener('change', onMQ) : mql.removeListener(onMQ); }
        teardown();
        if (state.lenis) { state.lenis.destroy(); state.lenis = null; }
      }
    };
    api.ready = ready;

    init();
    return api;
  }

  var api = { create: create };
  global.SpreadRowHeadline = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
