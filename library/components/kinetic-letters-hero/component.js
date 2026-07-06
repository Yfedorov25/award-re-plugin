/* ============================================================
   KINETIC-LETTERS-HERO · component.js  (vanilla, нуль залежностей)
   ------------------------------------------------------------
   T-311 kinetic nav-letters + T-M02 (мобільна гілка) + дзеркальний
   футер (A-16). Механіка знята ДОСЛІВНО з живого shared.js AIR
   (патерни landingIntroLogoA/I/R + *Mobile, витяг 2026-07-06):

   ХОРЕОГРАФІЯ (драйвер = скрол hero-секції, sticky-контейнер):
     p=0:    гігантський РОЗВЕДЕНИЙ wordmark по центру екрана
             (A···I···R на всю ширину, scale 1) — spread-канон;
     p=0.85: літери зібрались У ЛОГО ХЕДЕРА: scale 50/140 (≈0.357,
             = висота хедер-лого), виїзд угору (-50svh), зсув на
             2 грід-колонки вправо, spread СКОЛАПСУВАВ (у AIR:
             I на -193/1420, R на -388/1420 — ми рахуємо цілі
             з обмірів: літери пакуються впритул);
     p=0.85..1: hold (лого стоїть у хедері);
     далі:   sticky відпускає — секція їде геть природно.
     Reversible: чистий render(p), скрол назад = розбирання назад.
   easeOutQuad (= 'out-quad' сімʼї), clamp. Мобільний: та сама
   механіка (AIR: px-драйвер 248px, фінал 131.25px — у нас та сама
   пропорція через scale-параметр).

   ДЗЕРКАЛЬНИЙ ФУТЕР (A-16 + моб-закон f109-111): той самий
   розведений wordmark унизу сторінки; на вході у в'юпорт —
   scale-в'їзд 0.92→1 once (моб-тірдаун: «менший → гігант»).

   KineticLettersHero.create(section, opts) — hero-движок:
     section: елемент/селектор hero-секції (висота > 100vh, напр.
              180vh — простір скрабу дає сама секція)
     opts: {
       wordmark: 'AIR',
       headerScale: 50/140,      // фінальний масштаб (лого хедера)
       headerLeftVw: 16,         // зсув лого вправо (≈2 грід-колонки)
       headerTopVh: 3.2,         // верхній відступ лого
       assembleAt: 0.85,         // частка скрабу, де збірка завершена
       ink: '#111110'
     }
   Повертає { render(p), letters, gate, destroy }  (reduced-motion:
   { static:true } — розведений рядок стоїть, нуль скрабу).

   KineticLettersHero.footer(target, opts) — дзеркало у футері:
     { wordmark, ink, scaleFrom: 0.92 } — spread-рядок + scale-в'їзд.

   ENGINE LAWS: рух = transform ТІЛЬКИ (translate+scale, D4-чистий
   скраб); render(p) — ЧИСТА функція прогресу (reverse-safe, стрибок
   у середину = правильний стан одразу); transform-origin 0 0 (щоб
   scale не пливла позиція); rAF-квантування зі skip-unchanged;
   нуль пінів (sticky = CSS, не JS-pin); __LAB_OK__ не торкається.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function outQuad(t) { return 1 - (1 - t) * (1 - t); }
  function toEl(x) { return typeof x === 'string' ? doc.querySelector(x) : x; }

  function buildSpread(host, letters, ink, cls) {
    /* повноширинний розведений рядок: кожна літера на своїй частці */
    var spans = [];
    letters.forEach(function (ch, i) {
      var frac = letters.length === 1 ? 0 : i / (letters.length - 1);
      var s = doc.createElement('span');
      s.textContent = ch;
      s.className = cls;
      s.style.cssText = 'position:absolute;left:0;top:50%;' +
        'font-weight:300;line-height:1;letter-spacing:.02em;color:' + ink + ';' +
        'font-size:13.5vw;transform-origin:0 0;will-change:transform';
      s.__frac = frac;
      host.appendChild(s);
      spans.push(s);
    });
    return spans;
  }

  function create(section, options) {
    options = options || {};
    var root = toEl(section);
    if (!root) return { error: 'no section' };
    var opt = {
      wordmark: options.wordmark || 'AIR',
      headerScale: options.headerScale != null ? options.headerScale : 50 / 140,
      headerLeftVw: options.headerLeftVw != null ? options.headerLeftVw : 16,
      headerTopVh: options.headerTopVh != null ? options.headerTopVh : 3.2,
      assembleAt: options.assembleAt != null ? options.assembleAt : 0.85,
      ink: options.ink || '#111110'
    };
    var letters = String(opt.wordmark).replace(/\s+/g, '').split('');
    var reduced = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* sticky-сцена всередині секції */
    var stage = doc.createElement('div');
    stage.className = 'klh__stage';
    stage.style.cssText = 'position:sticky;top:0;height:100vh;overflow:clip;pointer-events:none';
    var band = doc.createElement('div');
    band.className = 'klh__band';
    band.style.cssText = 'position:absolute;top:0;left:4vw;right:4vw;bottom:0';
    stage.appendChild(band);
    root.insertBefore(stage, root.firstChild);

    var spans = buildSpread(band, letters, opt.ink, 'klh__letter');

    if (reduced) {
      /* статичний розведений рядок, нуль скрабу */
      spans.forEach(function (s) {
        var W = band.clientWidth, w = s.getBoundingClientRect().width;
        s.style.transform = 'translate(' + (s.__frac * (W - w)) + 'px,-50%)';
        s.style.willChange = '';
      });
      return { static: true, letters: spans, destroy: function () { stage.remove(); } };
    }

    /* обміри: spread-старт і компактна ціль (пакування впритул) */
    var geom = { W: 0, startX: [], targetX: [], startYpx: 0, targetYpx: 0 };
    function measure() {
      geom.W = band.clientWidth;
      var widths = spans.map(function (s) { return s.getBoundingClientRect().width; });
      /* СТАРТ: розведення — frac·(W−w), вертикаль center (top:50% + translateY(-50%)·scale…
         працюємо в px від top:0: старт y = 50vh − h/2 */
      var h = spans[0].getBoundingClientRect().height;
      geom.startYpx = global.innerHeight * 0.5 - h / 2;
      geom.targetYpx = global.innerHeight * (opt.headerTopVh / 100);
      geom.startX = spans.map(function (s, i) { return s.__frac * (geom.W - widths[i]); });
      var packGap = h * 0.06; /* повітря між літерами компактного лого */
      var cursor = global.innerWidth * (opt.headerLeftVw / 100) - band.getBoundingClientRect().left;
      geom.targetX = spans.map(function (s, i) {
        var x = cursor;
        cursor += widths[i] * opt.headerScale + packGap;
        return x;
      });
    }
    /* літери позиціонуємо від top:0 (не 50%) щоб масштаб не пливав */
    spans.forEach(function (s) { s.style.top = '0'; });
    measure();

    var gate = { renders: 0, lastP: -1 };
    var lastApplied = -1;
    function render(p) {
      p = Math.max(0, Math.min(1, p));
      gate.lastP = p;
      var t = outQuad(Math.min(1, p / opt.assembleAt)); /* 0..assembleAt → 0..1, далі hold */
      var q = Math.round(t * 1000);
      if (q === lastApplied) return; /* skip-unchanged */
      lastApplied = q;
      gate.renders++;
      var s = 1 + (opt.headerScale - 1) * t;
      spans.forEach(function (sp, i) {
        var x = geom.startX[i] + (geom.targetX[i] - geom.startX[i]) * t;
        var y = geom.startYpx + (geom.targetYpx - geom.startYpx) * t;
        sp.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + s + ')';
      });
    }

    /* драйвер: прогрес секції (rAF-квантований) */
    var ticking = false;
    function progress() {
      var r = root.getBoundingClientRect();
      var span = r.height - global.innerHeight;
      return span > 0 ? Math.max(0, Math.min(1, -r.top / span)) : 0;
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; render(progress()); });
    }
    function onResize() { measure(); lastApplied = -1; render(progress()); }
    global.addEventListener('scroll', onScroll, { passive: true });
    global.addEventListener('resize', onResize);
    render(progress()); /* стрибок/мідскрол = правильний стан одразу */

    function destroy() {
      global.removeEventListener('scroll', onScroll);
      global.removeEventListener('resize', onResize);
      stage.remove();
    }
    return { render: render, letters: spans, gate: gate, destroy: destroy };
  }

  /* ---- дзеркальний футер: spread-рядок + scale-в'їзд once ---- */
  function footer(target, options) {
    options = options || {};
    var host = toEl(target);
    if (!host) return { error: 'no target' };
    var opt = { wordmark: options.wordmark || 'AIR', ink: options.ink || '#f4f2ee',
                scaleFrom: options.scaleFrom != null ? options.scaleFrom : 0.92 };
    var letters = String(opt.wordmark).replace(/\s+/g, '').split('');
    var reduced = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    host.style.position = host.style.position || 'relative';
    var spans = buildSpread(host, letters, opt.ink, 'klh__footer-letter');
    function settle(scale) {
      var W = host.clientWidth;
      spans.forEach(function (s) {
        var w = s.getBoundingClientRect().width / (parseFloat(s.__curScale || 1));
        s.__curScale = scale;
        s.style.transform = 'translate(' + (s.__frac * (W - w) * scale) + 'px,-50%) scale(' + scale + ')';
      });
    }
    if (reduced) { settle(1); return { static: true, letters: spans, destroy: function () {} }; }
    spans.forEach(function (s) { s.style.transition = 'none'; });
    settle(opt.scaleFrom);
    var done = false;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting || done) return;
        done = true;
        io.disconnect();
        spans.forEach(function (s) {
          s.style.transition = 'transform 1s cubic-bezier(.25,.74,.22,.99)'; /* air-ease, 1s = reveal-канон */
        });
        requestAnimationFrame(function () { requestAnimationFrame(function () { settle(1); }); });
      });
    }, { threshold: 0.25 });
    io.observe(host);
    return { letters: spans, destroy: function () { io.disconnect(); } };
  }

  global.KineticLettersHero = { create: create, footer: footer };
}(window));
