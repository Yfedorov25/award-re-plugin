/* ============================================================
   IMAGE-SLIDER-WIPE · component.js  (vanilla, нуль залежностей)
   ------------------------------------------------------------
   T-512 (шов свапу фото в пін-слайдері) + слайдер 1/2 з лічильником
   (Status/HAAST, матриця §4 без-T-ID №7) + T-M23 tap-карусель.
   Механіка знята з ЖИВОГО shared.js/DOM aircenter.space (2026-07-06):

   ДЕСКТОП (image-slider-sticky, дослівно):
   • Секція: min-height = 100svh + (N−1)·step; шар sticky 100svh,
     контент притиснутий донизу (justify-content:flex-end).
   • Скрол-драйвер (плагін sticky contentAnimation):
     p піна (0..1) → index = min(floor(p·N), N−1); свап на порозі
     (для 2 слайдів = 0.5), direction = знак кроку.
   • T-512 wipe (анімації imageClipInVertical/OutVertical, ЖИВІ
     polygon-кліпи, 1s ease-out, duration title=1):
       вперед:  старе  full → лінія-ВГОРІ (колапс догори)
                нове   лінія-ВНИЗУ → full (розкриття знизу вгору)
       назад:   дзеркально (шов їде згори вниз)
     ⚠️ ЖИВА ПРАВДА ≠ реєстрова проза «смуга з центру»: обидві межі
     їдуть синхронно (той самий ease/тривалість) → ОДИН шов, що
     переїжджає кадр краєм-до-краю. Це виправлення інтерпретації №7.
   • Лічильник: text = index+1 ставиться НА СТАРТІ свапу (плагін
     counter: setCounter ДО анімацій; закон T-M23 підтверджений кодом).
   • Прогрес-бар: fill_i = clamp(p·N − i, 0, 1), безперервно скролом,
     transform: translateX(−100%·(1−fill)) — 2px смужки (живий CSS).
   • Текст картки: changeShow "text" delay 0.25 → blur(10→0)+opacity,
     1s ease-out, порядковий каскад 60ms/рядок (md-up: split-lines;
     небо-md: цілим блоком). changeHide "textOut" — blur(0→10), без delay.
   • CTA-слот: fadeIn delay 0.25 / fadeOut (по слайду).

   МОБ (T-M23 tap-карусель, живий компонент mobileScrollable):
   • Стрічка scroll-snap-type:x mandatory, item = ~9/12 колонок,
     gap 10px, snap-align center; [←] N/M [→] (btn--square).
   • Тап: лічильник свапається ОДРАЗУ (setCounter ДО scrollTo),
     потім smooth scroll (~0.4с) = push-wipe справа→наліво.
     Краї без loop: кнопка на краю отримує .is-disabled (живий links).
   • Свайп теж живий (нативний snap) — лічильник синхронується.
   • Альтернативна моб-гілка «pin» = жива моб-головна: той самий
     скрол-пін, лічильник схований, лишаються 2 line-ticks.

   РОЗМІТКА (усе всередині section-аргументу):
     <div data-isw-layer>              ← стає sticky-шаром
       <div data-isw-stage>            ← фото-вікно
         <figure data-isw-slide>×N
       <div data-isw-card>             ← glass-картка
         <div data-isw-ticks>          ← движок сам створить N смужок
         <p data-isw-counter><span data-isw-count>1</span>
            <span data-isw-total>/ N</span></p>
         <div data-isw-text>×N         ← тексти по слайдах
         [<div data-isw-extra>×N]      ← опційний CTA-слот
       [<button data-isw-prev> / <button data-isw-next>]  ← tap-режим

   ImageSliderWipe.create(section, opts) — opts усі опційні:
     stepSvh: 85          // скрол-крок на слайд (живий AIR:
                          // status-max-height ≈ 100svh−2·spacing−header)
     wipeMs: 1000         // живий JS AIR: duration title = 1s
     wipeEase: 'ease-out' // живий T.a.easeOut (НЕ air-bezier: свапи
                          // contentAnimation живуть на нативному ease-out)
     textDelayMs: 250     // changeShow delay 0.25
     lineStaggerMs: 60    // закон §0: 60ms/рядок
     blurPx: 10
     mobile: 'tap'        // 'tap' = T-M23 [← N/M →] · 'pin' = моб-головна
     touchMq
   Повертає { render(p), progress(), index(), goTo(i, dir), gate, destroy }

   ENGINE LAWS: рух = transform/clip-path/filter/opacity ТІЛЬКИ;
   скраб (ticks) = прямий transform у rAF БЕЗ transition; свапи =
   WAAPI-анімації подіями (не скрабом); render(p) чистий для ticks,
   свапи ідемпотентні за індексом (стрибок = правильний кінцевий стан);
   reduced-motion: свапи миттєві; __LAB_OK__ не торкається (B15).
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  /* живі polygon-кліпи AIR (imageClipIn/OutVertical, дослівно) */
  var FULL = 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)';
  var TOP_LINE = 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)';
  var BOTTOM_LINE = 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)';

  function toEl(x) { return typeof x === 'string' ? doc.querySelector(x) : x; }
  function all(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }


  function create(section, options) {
    options = options || {};
    var root = toEl(section);
    if (!root) return { error: 'no section' };
    var layer = root.querySelector('[data-isw-layer]');
    var stage = root.querySelector('[data-isw-stage]');
    var slides = all(root, '[data-isw-slide]');
    if (!layer || !stage || slides.length < 2)
      return { error: 'потрібні [data-isw-layer], [data-isw-stage], ≥2 [data-isw-slide]' };

    var texts = all(root, '[data-isw-text]');
    var extras = all(root, '[data-isw-extra]');
    var counter = root.querySelector('[data-isw-count]');
    var total = root.querySelector('[data-isw-total]');
    var ticksBox = root.querySelector('[data-isw-ticks]');
    var btnPrev = root.querySelector('[data-isw-prev]');
    var btnNext = root.querySelector('[data-isw-next]');

    var N = slides.length;
    var opt = {
      stepSvh: options.stepSvh != null ? options.stepSvh : 85,
      wipeMs: options.wipeMs != null ? options.wipeMs : 1000,
      wipeEase: options.wipeEase || 'ease-out',
      textDelayMs: options.textDelayMs != null ? options.textDelayMs : 250,
      lineStaggerMs: options.lineStaggerMs != null ? options.lineStaggerMs : 60,
      blurPx: options.blurPx != null ? options.blurPx : 10,
      /* живий imageSliderImage ДОСЛІВНО: фото 120% висоти, дрейф
         −16.666%→0 на вході піна і 0→−16.666% на виході */
      driftPct: options.driftPct != null ? options.driftPct : 16.666,
      mobile: options.mobile || 'tap',
      touchMq: options.touchMq || '(pointer: coarse), (max-width: 768px)'
    };
    var reduced = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var touch = global.matchMedia && global.matchMedia(opt.touchMq).matches;
    var tapMode = touch && opt.mobile === 'tap';

    var gate = { swaps: 0, lastDir: 0, renders: 0, mode: tapMode ? 'tap' : 'pin' };
    var idx = 0;
    var anims = []; /* активні WAAPI: скасовуємо перед новим свапом */

    if (total) total.textContent = '/ ' + N;
    if (counter) counter.textContent = '1';

    /* прогрес-смужки: движок сам будує N (живий progress-bar 2px) */
    var tickFills = [];
    if (ticksBox) {
      ticksBox.innerHTML = '';
      for (var i = 0; i < N; i++) {
        var item = doc.createElement('div');
        item.className = 'isw-tick';
        var fill = doc.createElement('div');
        fill.className = 'isw-tick-fill';
        fill.style.transform = 'translateX(-100%)';
        item.appendChild(fill);
        ticksBox.appendChild(item);
        tickFills.push(fill);
      }
    }

    slides.forEach(function (s, i) { if (i) s.classList.add('is-off'); });
    texts.forEach(function (t, i) { if (i) t.classList.add('is-off'); });
    extras.forEach(function (x, i) { if (i) x.classList.add('is-off'); });

    function killAnims() {
      anims.forEach(function (a) { try { a.cancel(); } catch (e) {} });
      anims = [];
    }

    /* ---- T-512 свап (живі кліпи; лічильник — НА СТАРТІ) ---- */
    function goTo(next, dir) {
      next = Math.max(0, Math.min(N - 1, next));
      if (next === idx) return;
      dir = dir || (next > idx ? 1 : -1);
      var cur = idx;
      idx = next;
      gate.swaps++; gate.lastDir = dir;
      if (counter) counter.textContent = String(next + 1); /* закон: свап на старті */
      root.style.setProperty('--isw-index', String(next));
      updateNav();

      killAnims();
      var oldS = slides[cur], newS = slides[next];
      var oldT = texts[cur], newT = texts[next];
      var oldX = extras[cur], newX = extras[next];
      newS.classList.remove('is-off');

      if (reduced || !newS.animate) {
        slides.forEach(function (s, i) {
          s.classList.toggle('is-off', i !== next);
          s.style.clipPath = '';
        });
        texts.forEach(function (t, i) { t.classList.toggle('is-off', i !== next); });
        extras.forEach(function (x, i) { x.classList.toggle('is-off', i !== next); });
        return;
      }

      /* фото: старе колапсує до краю, нове розкривається від протилежного —
         шов їде знизу↑ (вперед) / згори↓ (назад); 1s ease-out (живий JS) */
      var outClip = dir > 0 ? [FULL, TOP_LINE] : [FULL, BOTTOM_LINE];
      var inClip = dir > 0 ? [BOTTOM_LINE, FULL] : [TOP_LINE, FULL];
      var tOut = oldS.animate({ clipPath: outClip },
        { duration: opt.wipeMs, easing: opt.wipeEase, fill: 'both' });
      tOut.onfinish = function () { oldS.classList.add('is-off'); oldS.style.clipPath = ''; tOut.cancel(); };
      var tIn = newS.animate({ clipPath: inClip },
        { duration: opt.wipeMs, easing: opt.wipeEase, fill: 'both' });
      tIn.onfinish = function () { newS.style.clipPath = ''; tIn.cancel(); };
      anims.push(tOut, tIn);

      /* текст: out цілим блоком; in — порядковий каскад 60ms/рядок
         (md-up), delay 0.25s; на тачі цілим блоком (живий "text") */
      if (oldT && newT) {
        var b = opt.blurPx;
        var aOut = oldT.animate(
          { filter: ['blur(0px)', 'blur(' + b + 'px)'], opacity: [1, 0] },
          { duration: opt.wipeMs, easing: 'ease-out', fill: 'both' });
        aOut.onfinish = function () { oldT.classList.add('is-off'); aOut.cancel(); };
        anims.push(aOut);
        newT.classList.remove('is-off');
        /* свап ЦІЛИМ блоком (фікс-кол 4: спліт мерехтів шрифтом на свапі) */
        var aIn = newT.animate(
          { filter: ['blur(' + b + 'px)', 'blur(0px)'], opacity: [0, 1] },
          { duration: opt.wipeMs, easing: 'ease-out', fill: 'both',
            delay: opt.textDelayMs });
        aIn.onfinish = function () { aIn.cancel(); };
        anims.push(aIn);
      }

      /* CTA-слот: fadeOut / fadeIn delay 0.25 (живий контролер кнопок) */
      if (oldX && newX && oldX !== newX) {
        var fOut = oldX.animate({ opacity: [1, 0] },
          { duration: 400, easing: 'ease-out', fill: 'both' });
        fOut.onfinish = function () { oldX.classList.add('is-off'); fOut.cancel(); };
        newX.classList.remove('is-off');
        var fIn = newX.animate({ opacity: [0, 1] },
          { duration: 400, easing: 'ease-out', fill: 'both', delay: opt.textDelayMs });
        fIn.onfinish = function () { fIn.cancel(); };
        anims.push(fOut, fIn);
      }
    }

    function updateNav() {
      if (btnPrev) btnPrev.classList.toggle('is-disabled', idx === 0);
      if (btnNext) btnNext.classList.toggle('is-disabled', idx === N - 1);
    }

    /* ================= TAP-РЕЖИМ (T-M23) ================= */
    if (tapMode) {
      root.classList.add('isw-mode-tap');
      stage.classList.add('isw-strip');
      slides.forEach(function (s) { s.classList.remove('is-off'); });
      updateNav();

      /* snap-align:center → ціль скролу = слайд по центру вікна
         (жива стрічка центрує item бічними відступами) */
      function targetFor(i) {
        var sr = stage.getBoundingClientRect();
        var r = slides[i].getBoundingClientRect();
        var t = stage.scrollLeft + (r.left - sr.left) -
                (stage.clientWidth - r.width) / 2;
        return Math.max(0, Math.min(stage.scrollWidth - stage.clientWidth, t));
      }
      function nearestIdx() {
        var best = 0, bestD = Infinity;
        for (var i = 0; i < N; i++) {
          var d = Math.abs(targetFor(i) - stage.scrollLeft);
          if (d < bestD) { bestD = d; best = i; }
        }
        return best;
      }
      function tap(dir) {
        var next = Math.max(0, Math.min(N - 1, idx + dir));
        if (next === idx) return;
        idx = next;
        gate.swaps++; gate.lastDir = dir;
        if (counter) counter.textContent = String(next + 1); /* ДО скролу — на старті */
        updateNav();
        /* живий mobileScrollable: scrollIntoView (snap-центр) — push ~0.4с */
        slides[next].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth',
                                      block: 'nearest', inline: 'center' });
      }
      function onPrev(ev) { ev.preventDefault(); tap(-1); }
      function onNext(ev) { ev.preventDefault(); tap(1); }
      if (btnPrev) btnPrev.addEventListener('click', onPrev);
      if (btnNext) btnNext.addEventListener('click', onNext);

      var tick2 = false;
      function onStrip() {
        if (tick2) return;
        tick2 = true;
        requestAnimationFrame(function () {
          tick2 = false;
          var near = nearestIdx();
          if (near !== idx) { /* свайп пальцем: синхрон лічильника */
            idx = near;
            if (counter) counter.textContent = String(near + 1);
            updateNav();
          }
          if (tickFills.length) {
            var max = stage.scrollWidth - stage.clientWidth;
            var p = max > 0 ? clamp01(stage.scrollLeft / max) : 0;
            for (var i = 0; i < N; i++)
              tickFills[i].style.transform =
                'translateX(' + (-100 * (1 - clamp01(p * N - i))) + '%)';
          }
        });
      }
      stage.addEventListener('scroll', onStrip, { passive: true });
      onStrip();

      return {
        mode: 'tap', index: function () { return idx; },
        goTo: function (i) { tap(i - idx); },
        targetFor: targetFor, gate: gate,
        destroy: function () {
          if (btnPrev) btnPrev.removeEventListener('click', onPrev);
          if (btnNext) btnNext.removeEventListener('click', onNext);
          stage.removeEventListener('scroll', onStrip);
          root.classList.remove('isw-mode-tap');
          stage.classList.remove('isw-strip');
          killAnims();
        }
      };
    }

    /* ================= PIN-РЕЖИМ (десктоп + моб-головна) ================= */
    root.classList.add('isw-mode-pin');
    root.style.minHeight = 'calc(100svh + ' + (N - 1) * opt.stepSvh + 'svh)';

    /* дрейф фото (T-510-сім'я, живий imageSliderImage): на вході піна фото
       їде з +drift до 0, на виході 0 → −drift; всередині піна стоїть.
       Тільки desktop (сімейний закон enableTouch:false). */
    var driftImgs = opt.driftPct > 0 && !touch && !reduced
      ? slides.map(function (s) { return s.querySelector('img, .isw-fill'); })
      : [];
    if (driftImgs.length && driftImgs.every(Boolean)) root.classList.add('isw-drift');
    else driftImgs = [];
    function renderDrift() {
      if (!driftImgs.length) return;
      var r = root.getBoundingClientRect();
      var vh = global.innerHeight;
      var entry = clamp01((vh - r.top) / vh);          /* 0 → 1 доки пін чіпляється */
      var span = Math.max(1, r.height - vh);
      var sp = clamp01(-r.top / span);                 /* прогрес самого піна */
      var exit = clamp01((sp - 0.8) / 0.2);            /* останні 20% спану = відпускання */
      /* живі keyframes: вхід −16.666→0, вихід 0→−16.666; діапазон [−drift, 0] */
      var ty = Math.max(-opt.driftPct,
                        -opt.driftPct * ((1 - entry) + exit));
      gate.driftTy = Math.round(ty * 100) / 100;
      for (var i = 0; i < driftImgs.length; i++)
        driftImgs[i].style.transform = 'translateY(' + ty + '%)';
    }

    /* прогрес піна: 0 = шар прилип, 1 = шар відпускає (живий sticky-плагін) */
    function progress() {
      var r = root.getBoundingClientRect();
      var span = r.height - global.innerHeight;
      return span > 0 ? clamp01(-r.top / span) : 0;
    }

    var lastQ = -1;
    function render(p) {
      p = clamp01(p);
      var q = Math.round(p * 1000);
      if (q === lastQ) return;
      lastQ = q;
      gate.renders++;
      /* index = min(floor(p·N), N−1) — живий мапінг */
      var want = Math.min(Math.floor(p * N), N - 1);
      if (want !== idx) {
        /* гістерезис 1.5% спану: lerp-коливання довкола порога не дриґає свап */
        var boundary = (want > idx ? idx + 1 : idx) / N;
        if (Math.abs(p - boundary) > 0.015) goTo(want, want > idx ? 1 : -1);
      }
      /* ticks: безперервний fill скролом (transform-only, без transition) */
      for (var i = 0; i < tickFills.length; i++)
        tickFills[i].style.transform =
          'translateX(' + (-100 * (1 - clamp01(p * N - i))) + '%)';
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        render(progress());
        renderDrift(); /* дрейф живе і поза піном (вхід/вихід) */
      });
    }
    global.addEventListener('scroll', onScroll, { passive: true });
    render(progress());
    renderDrift();

    return {
      mode: 'pin', render: render, progress: progress,
      index: function () { return idx; }, goTo: goTo, gate: gate,
      destroy: function () {
        global.removeEventListener('scroll', onScroll);
        killAnims();
        root.classList.remove('isw-mode-pin');
        root.style.minHeight = '';
      }
    };
  }

  global.ImageSliderWipe = { create: create };
}(window));
