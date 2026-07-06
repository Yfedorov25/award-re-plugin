/* ============================================================
   INVEST-CARD-REVEAL · component.js  (vanilla + GSAP 3.12.5)
   ------------------------------------------------------------
   AIR T-430 — темна картка переваги /investment: у спокої картка МОВЧИТЬ
   (індекс + короткий титул унизу), на ховері титул під'їжджає вгору і під ним
   РОЗКРИВАЄТЬСЯ повний текст (clip-path зверху-вниз + opacity) з тонкою
   лінією-волоском, що домальовується scaleX. Стриманість AIR: глибина
   відкривається на дотик, не кричить з екрана. На AIR це картки
   HIGH DEMAND / STRONG TENANT BASE / TENANTS CORE.

   T-M18 — мобільний закон (з РЕАЛЬНОГО телефонного запису AIR, /investment
   f169-180): ховер-розкриття на мобільному ВБИТЕ. Картки стають
   ГОРИЗОНТАЛЬНОЮ SCROLL-SNAP СТРІЧКОЮ морозних (frosted glass) карток
   поверх темного архітектурного макро-фото (фото = справа host-розмітки):
   заголовок зверху, ПОВНИЙ текст видимий ОДРАЗУ знизу картки, сусідня
   картка виглядає з-за краю як свайп-кью. Нема ні ховера, ні тапа для
   розкриття — свайп замість ховера. backdrop-filter над СТАТИЧНИМ фото =
   дозволений виняток D2 (реєстр T-M18 ✅).

   THE MOVE (desktop):
     - markup-first: картки вже в DOM ([data-icr-card] з [data-icr-title] і
       [data-icr-body]); компонент додає .icr-wired (абсолютна розкладка:
       титул притиснутий до низу, тіло сховане під ним) і створює .icr-rule
       (волосок) першим елементом тіла.
     - fonts.ready → measure(): висота тіла кожної картки (bbox, transform-и
       скинуті) → lift = bodyH + gap. НІКОЛИ не міряється в кадрі (D6).
     - open: title translateY(-lift) · body clip-path inset(0 0 100% 0) →
       inset(0 0 0% 0) + opacity 0→1 · rule scaleX 0→1. ТІЛЬКИ
       transform / opacity / clip-path (D4); house ease інлайновано (D13).
     - close: ті самі властивості назад. Картка НЕ міняє розмір і НЕ рухає
       сусідів — грід стабільний, bbox-перетин із сусідами = 0 (C28).
     - a11y: картка focusable (tabindex=0, якщо нема), aria-expanded;
       клавіатурний фокус розкриває так само, як ховер. Закриття лише коли
       картка і НЕ hovered, і НЕ focused.

   THE MOVE (mobile ≤768px, T-M18):
     - host отримує .icr-swipe (flex + overflow-x auto + scroll-snap-type x
       mandatory), кожна картка .icr-frost (морозне скло, текст відкритий).
     - нуль слухачів, нуль GSAP: стрічка = нативний снап-скрол.
     - open/close/toggle у цій гілці no-op (текст і так відкритий).

   CONFIG-DRIVEN:
     InvestCardReveal.create(target, {
       mode: 'auto',            // 'auto' (matchMedia) | 'desktop' | 'mobile'
       mobileBreakpoint: 768,   // ≤ цього = frosted-swipe гілка (T-M18)
       duration: 0.55,          // тривалість розкриття, s
       ease: 'air',             // 'air' | 'out-quad' | 'out-expo'
       gapPx: 18                // повітря між піднятим титулом і тілом, px
     })
   Markup:
     <div data-icr>
       <article data-icr-card>
         <span data-icr-index>01</span>
         <h3 data-icr-title>Оплата</h3>
         <p data-icr-body>Платите всю суму одразу та отримуєте знижку.</p>
       </article>
       ...
     </div>
   Повертає { cards, mode, track, open(i), close(i), toggle(i), isOpen(i),
              measure(), refresh(), destroy(), ready }.

   ENGINE LAWS: transform / opacity / clip-path ONLY (D4); нуль CSS transition
   на властивостях, якими керує GSAP (D3); нуль getComputedStyle у кадрі —
   геометрія в measure() (D6). Без JS / reduced-motion / no-GSAP картка =
   СТАТИЧНА ПРАВДА: повний текст видимий одразу (CSS-дефолт без .icr-wired).
   Компонент НЕ торкається __LAB_OK__ — гейт належить lab-у (B14/B15).
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

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
    'out-expo': cubicBezier(0.16, 1, 0.30, 1)
  };

  var CLIP_CLOSED = 'inset(0px 0px 100% 0px)';
  var CLIP_OPEN = 'inset(0px 0px 0% 0px)';

  function create(target, options) {
    options = options || {};
    var opt = {
      mode: options.mode || 'auto',
      mobileBreakpoint: options.mobileBreakpoint != null ? options.mobileBreakpoint : 768,
      duration: options.duration != null ? options.duration : 0.55,
      ease: options.ease || 'air',
      gapPx: options.gapPx != null ? options.gapPx : 18
    };
    var easeFn = EASES[opt.ease] || EASES.air;

    var host = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!host) return { error: 'no target' };

    var gsap = global.gsap;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mql = (opt.mode === 'auto' && global.matchMedia)
      ? global.matchMedia('(max-width: ' + opt.mobileBreakpoint + 'px)') : null;

    // картки: host сам є карткою або контейнером карток
    var cardEls = host.hasAttribute && host.hasAttribute('data-icr-card')
      ? [host]
      : Array.prototype.slice.call(host.querySelectorAll('[data-icr-card]'));

    var state = { mode: 'static', cards: [] };
    var readyResolve;
    var ready = new Promise(function (res) { readyResolve = res; });

    function isMobile() {
      if (opt.mode === 'mobile') return true;
      if (opt.mode === 'desktop') return false;
      return !!(mql && mql.matches);
    }

    function buildCard(el) {
      var c = {
        el: el,
        title: el.querySelector('[data-icr-title]'),
        body: el.querySelector('[data-icr-body]'),
        rule: null,
        lift: 0,
        open: false,
        hovered: false,
        focused: false,
        tl: null,
        hadTabindex: el.hasAttribute('tabindex'),
        listeners: []
      };
      if (!c.title || !c.body) return null;
      // волосок-лінія: перший елемент тіла, домальовується scaleX
      c.rule = doc.createElement('span');
      c.rule.className = 'icr-rule';
      c.rule.setAttribute('aria-hidden', 'true');
      c.body.insertBefore(c.rule, c.body.firstChild);
      return c;
    }

    // measure: transform-и скинуті → bbox тіла = CSS-правда. Ніколи в кадрі.
    // Потрібна лише десктоп-гілці (lift ховер-розкриття).
    function measure() {
      if (state.mode !== 'desktop') return;
      state.cards.forEach(function (c) {
        var prevT = c.title.style.transform;
        c.title.style.transform = '';
        var bodyH = c.body.getBoundingClientRect().height;
        c.title.style.transform = prevT;
        c.lift = Math.round(bodyH + opt.gapPx);
        if (c.open && gsap) {
          // тримаємо відкритий стан консистентним після ресайзу
          gsap.set(c.title, { y: -c.lift });
        }
      });
    }

    function animateTo(c, open) {
      c.open = open;
      c.el.setAttribute('aria-expanded', open ? 'true' : 'false');
      c.body.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (c.tl) c.tl.kill();
      var d = opt.duration;
      c.tl = gsap.timeline();
      if (open) {
        c.tl.to(c.title, { y: -c.lift, duration: d, ease: easeFn }, 0)
            .to(c.rule, { scaleX: 1, duration: d * 0.9, ease: easeFn }, 0.04)
            .to(c.body, { clipPath: CLIP_OPEN, opacity: 1, duration: d, ease: easeFn }, 0.06);
      } else {
        c.tl.to(c.body, { clipPath: CLIP_CLOSED, opacity: 0, duration: d * 0.8, ease: easeFn }, 0)
            .to(c.rule, { scaleX: 0, duration: d * 0.7, ease: easeFn }, 0)
            .to(c.title, { y: 0, duration: d, ease: easeFn }, 0.03);
      }
    }

    // бажаний стан десктопа = hovered АБО focused (a11y: фокус тримає відкритим)
    function sync(c) {
      var want = c.hovered || c.focused;
      if (want !== c.open) animateTo(c, want);
    }

    function on(c, ev, fn) {
      c.el.addEventListener(ev, fn);
      c.listeners.push([ev, fn]);
    }

    function wireDesktopCard(c) {
      c.el.classList.add('icr-wired');
      if (!c.hadTabindex) c.el.setAttribute('tabindex', '0');
      c.el.setAttribute('aria-expanded', 'false');
      c.body.setAttribute('aria-hidden', 'true');
      // закритий стан = CSS-правда .icr-wired; GSAP лише тюнить від неї
      gsap.set(c.body, { clipPath: CLIP_CLOSED, opacity: 0 });
      gsap.set(c.rule, { scaleX: 0 });
      on(c, 'mouseenter', function () { c.hovered = true; sync(c); });
      on(c, 'mouseleave', function () { c.hovered = false; sync(c); });
      on(c, 'focusin', function () { c.focused = true; sync(c); });
      on(c, 'focusout', function () { c.focused = false; sync(c); });
    }

    // T-M18: морозна свайп-стрічка — текст відкритий ОДРАЗУ, нуль слухачів,
    // нуль GSAP; снап-скрол нативний. Ховер/тап-розкриття тут НЕ ІСНУЄ.
    function wireMobileSwipe() {
      host.classList.add('icr-swipe');
      state.cards.forEach(function (c) {
        c.el.classList.add('icr-frost');
        c.open = true;
        c.body.setAttribute('aria-hidden', 'false');
        c.rule.style.transform = 'scaleX(1)';
      });
    }

    function wireStatic() {
      state.cards.forEach(function (c) {
        c.el.classList.add('icr-static');
        c.open = true;
        c.body.setAttribute('aria-hidden', 'false');
        c.rule.style.transform = 'scaleX(1)';
      });
    }

    function init() {
      var cards = [];
      cardEls.forEach(function (el) {
        var c = buildCard(el);
        if (c) cards.push(c);
      });
      state.cards = cards;
      if (!cards.length) { state.mode = 'static'; readyResolve(api); return; }

      if (isMobile()) {
        // T-M18: працює і без GSAP, і під reduced-motion (нуль руху всередині)
        state.mode = 'mobile';
        wireMobileSwipe();
        readyResolve(api);
        return;
      }

      if (reduced || !gsap) {
        // СТАТИЧНА ПРАВДА: повний текст видимий, нуль слухачів, нуль руху
        state.mode = 'static';
        wireStatic();
        readyResolve(api);
        return;
      }

      state.mode = 'desktop';
      cards.forEach(wireDesktopCard);
      var fontsReady = (doc.fonts && doc.fonts.ready) ? doc.fonts.ready : Promise.resolve();
      fontsReady.then(function () { measure(); readyResolve(api); },
                      function () { measure(); readyResolve(api); });
      global.addEventListener('resize', onResize);
    }

    var resizeT = null;
    function onResize() {
      clearTimeout(resizeT);
      resizeT = setTimeout(measure, 180);
    }

    function teardownCard(c) {
      c.listeners.forEach(function (p) { c.el.removeEventListener(p[0], p[1]); });
      c.listeners = [];
      if (c.tl) { c.tl.kill(); c.tl = null; }
      if (c.rule && c.rule.parentNode) c.rule.parentNode.removeChild(c.rule);
      c.el.classList.remove('icr-wired', 'icr-static', 'icr-frost');
      c.el.removeAttribute('aria-expanded');
      if (!c.hadTabindex) c.el.removeAttribute('tabindex');
      c.body.removeAttribute('aria-hidden');
      c.title.style.transform = '';
      c.body.style.opacity = '';
      c.body.style.clipPath = '';
      c.open = false; c.hovered = false; c.focused = false;
    }

    function teardownAll() {
      state.cards.forEach(teardownCard);
      host.classList.remove('icr-swipe');
      global.removeEventListener('resize', onResize);
    }

    function rebuild() { teardownAll(); init(); }

    // авто-перемикання гілки на перетині брейкпойнта (mode:'auto')
    function onMQ() { rebuild(); }
    if (mql) { mql.addEventListener ? mql.addEventListener('change', onMQ) : mql.addListener(onMQ); }

    var api = {
      get cards() { return state.cards; },
      get mode() { return state.mode; },
      get track() { return state.mode === 'mobile' ? host : null; },
      ready: null,
      open: function (i) { var c = state.cards[i]; if (state.mode === 'desktop' && c && !c.open) animateTo(c, true); },
      close: function (i) { var c = state.cards[i]; if (state.mode === 'desktop' && c && c.open) { c.hovered = false; c.focused = false; animateTo(c, false); } },
      toggle: function (i) { var c = state.cards[i]; if (state.mode === 'desktop' && c) animateTo(c, !c.open); },
      isOpen: function (i) { var c = state.cards[i]; return !!(c && c.open); },
      measure: measure,
      refresh: measure,
      destroy: function () {
        if (mql) { mql.removeEventListener ? mql.removeEventListener('change', onMQ) : mql.removeListener(onMQ); }
        teardownAll();
        state.cards = [];
      }
    };
    api.ready = ready;

    init();
    return api;
  }

  var api = { create: create };
  global.InvestCardReveal = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
