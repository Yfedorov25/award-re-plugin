/* ============================================================
   STICKY-CARD-PARALLAX · component.js  (vanilla, нуль залежностей)
   ------------------------------------------------------------
   T-215 sticky-card-over-parallax + T-M17 (мобільне ДЗЕРКАЛО).
   Механіка знята з живого shared.js AIR (витяг 2026-07-06):

   DESKTOP (T-215, патерн landingHarmonyBackground ДОСЛІВНО):
     картка ЗАМЕРЗАЄ (CSS sticky по центру екрана), а фон ПЛИВЕ:
     translateY(-40svh) → translateY(+40svh) ЛІНІЙНО за повний
     прохід секції крізь в'юпорт (keyframes parallax-100-0 →
     parallax-0-100, без easing = linear). 80svh дрейфу глибини
     без WebGL.

   MOBILE (T-M17, дзеркало з тірдауна відео власника):
     ролі ОБЕРТАЮТЬСЯ — ФОТО замерзає (sticky full-viewport),
     glass-КАРТКА їде поверх звичайним потоком. Нуль паралакс-
     трансформів на тачі (сімейний закон enableTouch:false;
     frosted-glass над СТАТИЧНИМ фото = дозвіл D2).

   РОЗМІТКА:
     <section>            ← аргумент; висота = heightVh
       <div data-scp-bg>  ← фон-медіа (img/відео/рендер)
       <div data-scp-card>← картка (glass/paper)
     </section>

   StickyCardParallax.create(section, opts) — opts усі опційні:
     driftSvh: 40         // амплітуда дрейфу фону (живий CSS AIR)
     heightVh: 200        // висота секції (скрол-простір)
     touchMq: '(pointer: coarse), (max-width: 768px)'
   Повертає { render(p), progress(), gate, destroy }
     (mobile/reduced: { mirror:true } — дзеркальна структура без
      скрабу; reduced на desktop: і фон стоїть).

   ENGINE LAWS: рух = transform ТІЛЬКИ (translateY фону, D4-чистий
   скраб); render(p) — чиста функція (reverse-safe); rAF-квантування
   зі skip-unchanged; sticky = CSS (нуль JS-піна, нуль scroll-trap);
   фон отримує запас ±driftSvh висоти, щоб дрейф не оголяв країв;
   __LAB_OK__ не торкається (B15).
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function toEl(x) { return typeof x === 'string' ? doc.querySelector(x) : x; }

  function create(section, options) {
    options = options || {};
    var root = toEl(section);
    if (!root) return { error: 'no section' };
    var bg = root.querySelector('[data-scp-bg]');
    var card = root.querySelector('[data-scp-card]');
    if (!bg || !card) return { error: 'потрібні [data-scp-bg] і [data-scp-card]' };
    var opt = {
      driftSvh: options.driftSvh != null ? options.driftSvh : 40,
      heightVh: options.heightVh != null ? options.heightVh : 200,
      touchMq: options.touchMq || '(pointer: coarse), (max-width: 768px)'
    };
    var reduced = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var touch = global.matchMedia && global.matchMedia(opt.touchMq).matches;

    root.style.position = 'relative';
    root.style.height = opt.heightVh + 'vh';
    var gate = { renders: 0, lastP: -1, mirror: false };

    /* прогрес: повний прохід секції крізь в'юпорт (вхід знизу → вихід угору) */
    function progress() {
      var r = root.getBoundingClientRect();
      var vh = global.innerHeight;
      var total = r.height + vh;
      return Math.max(0, Math.min(1, (vh - r.top) / total));
    }

    if (touch) {
      /* T-M17 ДЗЕРКАЛО: фото замерзає, картка їде поверх */
      gate.mirror = true;
      bg.style.position = 'sticky';
      bg.style.top = '0';
      bg.style.height = '100vh';
      bg.style.overflow = 'clip';
      card.style.position = 'relative';
      card.style.zIndex = '2';
      card.style.marginTop = '-40vh'; /* картка наїжджає на замерзле фото */
      return { mirror: true, progress: progress, gate: gate,
               destroy: function () { unstyle(); } };
    }

    /* DESKTOP T-215: картка sticky по центру, фон пливе */
    bg.style.position = 'absolute';
    bg.style.left = '0';
    bg.style.right = '0';
    /* запас ±driftSvh, щоб дрейф не оголяв країв */
    bg.style.top = 'calc(' + (-opt.driftSvh) + 'svh)';
    bg.style.bottom = 'calc(' + (-opt.driftSvh) + 'svh)';
    bg.style.overflow = 'clip';
    card.style.position = 'sticky';
    card.style.top = '50vh';
    card.style.transform = 'translateY(-50%)';
    card.style.zIndex = '2';

    if (reduced) {
      return { static: true, progress: progress, gate: gate,
               destroy: function () { unstyle(); } };
    }

    bg.style.willChange = 'transform';
    var lastQ = -1;
    function render(p) {
      p = Math.max(0, Math.min(1, p));
      gate.lastP = p;
      var q = Math.round(p * 1000);
      if (q === lastQ) return;
      lastQ = q;
      gate.renders++;
      /* живий CSS AIR: -40svh → +40svh, ЛІНІЙНО */
      var ty = -opt.driftSvh + 2 * opt.driftSvh * p;
      bg.style.transform = 'translateY(' + ty + 'svh)';
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; render(progress()); });
    }
    global.addEventListener('scroll', onScroll, { passive: true });
    render(progress());

    function unstyle() {
      root.style.position = root.style.height = '';
      bg.style.cssText = '';
      card.style.cssText = '';
    }
    function destroy() {
      global.removeEventListener('scroll', onScroll);
      unstyle();
    }
    return { render: render, progress: progress, gate: gate, destroy: destroy };
  }

  global.StickyCardParallax = { create: create };
}(window));
