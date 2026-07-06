/* ============================================================
   PRELOADER-LOGO-CONVOY · component.js  (vanilla, нуль залежностей)
   ------------------------------------------------------------
   T-524 прелоадер AIR + T-M22-initial (зйомка pre-01..30) — механіка
   знята ДОСЛІВНО з живого aircenter.space global.css (2026-07-06):

   СТАДІЯ A (завантаження, драйвер = progress 0..1):
     - оверлей fixed z-14 на фоні сторінки;
     - прогрес-бар 2px зверху: translateX(p*100vw - 100vw);
     - КОНВОЙ з 3 копій wordmark: кожна їде зліва зі своїм зсувом
         logo-1: p_half*100vw - 100vw + (1-p_half)*76.6%
         logo-2: p     *100vw - 100vw + (1-p)     *38.5%
         logo-3: p     *100vw - 100vw
       (p_half = min(1, p*2)) — три проходи різними швидкостями,
       усі сходяться в 0 на p=1. Це «logo-parallax» реєстру і
       «zoom-тикер 3 проходи» мобільного тірдауна.
   СТАДІЯ B (вихід, коли p=1 і сторінка готова):
     - fade-out 2s cubic-bezier(.7,0,.3,1): контент оверлея opacity->0,
       бар доїжджає вправо (translateX(100%)); потім display:none.
   СТАДІЯ C (вхід сторінки, СИНХРОННО з B — «панелі роз'їжджаються»):
     - [data-plc-top]    (хедер):  translateY(-100%) -> 0
     - [data-plc-bottom] (низ):    translateY(100%)  -> 0
     - [data-plc-text]   (текст):  translateY(20px)  -> 0
     усе 2s тим САМИМ bezier(.7,0,.3,1).

   PreloaderLogoConvoy.create(opts) — opts усі опційні:
     wordmark: 'AIR'          // текст конвою (бренд проєкту)
     target: document.body    // куди монтувати оверлей
     bg: '#f4f2ee'            // фон оверлея (paper)
     ink: '#111110'           // колір wordmark/бара
     duration: 2              // s виходу/входу (живий CSS AIR)
     auto: true               // авто-прогрес: load-подія + decode img
     minShowMs: 900           // мінімальний показ (анти-блимання)
     sessionOnce: false       // true = показувати раз на sessionStorage
   Повертає { setProgress(p), done(), overlay, gate, destroy }
     ({ static:true } якщо reduced-motion / sessionOnce-повтор —
      оверлей НЕ монтується, вхідні елементи стоять на місцях).

   ENGINE LAWS: рух = transform + opacity ТІЛЬКИ (D4 чистий, без
   винятків); драйвер стадії A = прогрес ЗАВАНТАЖЕННЯ (не скрол);
   вихід/вхід = CSS transition (state-класи), не rAF; оверлей після
   виходу ЗНІМАЄТЬСЯ з DOM повністю; no-JS ніколи не бачить оверлей
   (він будується JS-ом); reduced-motion = нуль прелоадера;
   __LAB_OK__ не торкається (B15).
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  var EASE = 'cubic-bezier(.7,0,.3,1)'; /* живий CSS AIR */
  var KEY = 'plc-shown';

  function create(options) {
    options = options || {};
    var opt = {
      wordmark: options.wordmark || 'AIR',
      target: options.target || doc.body,
      bg: options.bg || '#f4f2ee',
      ink: options.ink || '#111110',
      duration: options.duration != null ? options.duration : 2,
      auto: options.auto !== false,
      minShowMs: options.minShowMs != null ? options.minShowMs : 900,
      sessionOnce: !!options.sessionOnce
    };
    var reduced = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var repeat = false;
    try { repeat = opt.sessionOnce && sessionStorage.getItem(KEY) === '1'; } catch (e) {}

    /* вхідні елементи сторінки (стадія C) */
    var tops = toArr('[data-plc-top]'), bottoms = toArr('[data-plc-bottom]'),
        texts = toArr('[data-plc-text]');
    function toArr(s) { return Array.prototype.slice.call(doc.querySelectorAll(s)); }

    if (reduced || repeat) {
      /* нуль прелоадера: сторінка як є, вхідні елементи на місцях */
      return { static: true, destroy: function () {} };
    }

    var gate = { t0: performance.now(), progress: 0, doneT: -1, removedT: -1 };

    /* --- вхідні елементи паркуються ДО першого кадру (анти-FOUC:
       create() кличеться синхронно в <head>/до контенту або одразу
       після розмітки) --- */
    function park(els, transform) {
      els.forEach(function (el) {
        el.style.transform = transform;
        el.style.transition = 'none';
      });
    }
    park(tops, 'translateY(-100%)');
    park(bottoms, 'translateY(100%)');
    park(texts, 'translateY(20px)');

    /* --- оверлей --- */
    var overlay = doc.createElement('div');
    overlay.className = 'plc';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:14;background:' + opt.bg +
      ';overflow:hidden;pointer-events:none';
    var bar = doc.createElement('div');
    bar.className = 'plc__bar';
    bar.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:2px;background:' +
      opt.ink + ';transform:translateX(-100vw)';
    overlay.appendChild(bar);
    var content = doc.createElement('div');
    content.className = 'plc__content';
    content.style.cssText = 'position:absolute;inset:0';
    var logos = [];
    for (var i = 1; i <= 3; i++) {
      var l = doc.createElement('div');
      l.className = 'plc__logo plc__logo--' + i;
      l.textContent = opt.wordmark;
      l.style.cssText = 'position:absolute;top:50%;left:4vw;width:92vw;' +
        'font-weight:300;letter-spacing:.02em;color:' + opt.ink + ';' +
        'font-size:14vw;line-height:1;transform:translate(-100vw,-50%);white-space:nowrap';
      content.appendChild(l);
      logos.push(l);
    }
    overlay.appendChild(content);
    opt.target.appendChild(overlay);

    /* --- стадія A: прогрес-рендер (transform only) --- */
    function render(p) {
      p = Math.max(0, Math.min(1, p));
      gate.progress = p;
      var ph = Math.min(1, p * 2);
      bar.style.transform = 'translateX(' + (p * 100 - 100) + 'vw)';
      logos[0].style.transform = 'translate(calc(' + (ph * 100 - 100) + 'vw + ' + ((1 - ph) * 76.6) + '%),-50%)';
      logos[1].style.transform = 'translate(calc(' + (p * 100 - 100) + 'vw + ' + ((1 - p) * 38.5) + '%),-50%)';
      logos[2].style.transform = 'translate(' + (p * 100 - 100) + 'vw,-50%)';
    }
    render(0);

    /* --- стадія B + C: вихід оверлея і в'їзд сторінки --- */
    var doneCalled = false;
    function done() {
      if (doneCalled) return;
      doneCalled = true;
      var wait = Math.max(0, opt.minShowMs - (performance.now() - gate.t0));
      setTimeout(function () {
        gate.doneT = performance.now();
        render(1);
        try { if (opt.sessionOnce) sessionStorage.setItem(KEY, '1'); } catch (e) {}
        var tr = 'transform ' + opt.duration + 's ' + EASE;
        /* B: контент гасне, бар доїжджає */
        content.style.transition = 'opacity ' + opt.duration + 's ' + EASE;
        bar.style.transition = tr;
        requestAnimationFrame(function () { requestAnimationFrame(function () {
          content.style.opacity = '0';
          bar.style.transform = 'translateX(100%)';
          /* C: панелі роз'їжджаються — синхронно, той самий bezier */
          [].concat(tops, bottoms, texts).forEach(function (el) {
            el.style.transition = tr;
            el.style.transform = 'translateY(0)';
          });
        }); });
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          [].concat(tops, bottoms, texts).forEach(function (el) {
            el.style.transition = ''; el.style.transform = '';
          });
          gate.removedT = performance.now();
        }, opt.duration * 1000 + 80);
      }, wait);
    }

    /* --- авто-прогрес: img-декоди сторінки + load-подія --- */
    var destroyed = false;
    if (opt.auto) {
      var imgs = Array.prototype.slice.call(doc.images || []).slice(0, 24);
      var totalN = imgs.length + 1, doneN = 0;
      var tick = function () {
        doneN++;
        if (!destroyed && !doneCalled) render(Math.min(0.95, doneN / totalN));
      };
      imgs.forEach(function (im) {
        (im.decode ? im.decode().catch(function () {}) : Promise.resolve()).then(tick);
      });
      if (doc.readyState === 'complete') { done(); }
      else global.addEventListener('load', function () { done(); }, { once: true });
    }

    function destroy() {
      destroyed = true;
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      [].concat(tops, bottoms, texts).forEach(function (el) {
        el.style.transition = ''; el.style.transform = '';
      });
    }

    return { setProgress: render, done: done, overlay: overlay, gate: gate, destroy: destroy };
  }

  global.PreloaderLogoConvoy = { create: create };
}(window));
