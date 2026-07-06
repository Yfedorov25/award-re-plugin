/* ============================================================
   PINNED-COUNTER-SLIDESHOW · component.js (vanilla, нуль залежностей)
   ------------------------------------------------------------
   T-513 pinned counter-slideshow «Format» (+T-M06 моб line-ticks).
   Механіка знята з ЖИВОГО DOM/JS aircenter.space #format (2026-07-06):

   • Пін: sticky sticky--full-height, --items-count: N; текст-слайди
     над ПОСТІЙНИМ медіа-фоном (у AIR — Vimeo-луп спіралі).
   • Той САМИЙ движок contentAnimation, що в слайдері Status:
     плагіни "controller events counter sticky" — index = floor(p·N),
     свап на порозі 1/N, direction = знак кроку.
   • Текст: changeShow "text" delay 0.25 → blur(10→0)+opacity, 1s
     ease-out, порядковий каскад 60ms/рядок (md-up); textOut без delay.
   • Лічильник «N / M»: text ставиться НА СТАРТІ свапу (живий counter).
   • Прогрес desktop = ОДИН безперервний бар через УВЕСЬ пін:
     живий parallax 0-0 → 200-100 (200 бо sticky--under-next):
     transform translateX(−100%) → translateX(0) лінійно за прогрес.
     В атомі (без under-next) — бар = −100%·(1−p).
   • Лічильник-віджет на hover-десктопі = CURSOR-FOLLOWER
     (живий клас cursor--counter + js-cursor-button): віджет липне
     до курсора з lerp; на no-hover — статичний у куті (той самий
     віджет у nav-шарі, is-hidden--hover).
   • МОБ (T-M06 підтверджено на AIR): той самий скрол-пін, лічильник
     схований (is-hidden--sm-down), прогрес = 2 LINE-TICKS з
     покроковим fill (progress-bar__item-inner, як у слайдера:
     fill_i = clamp(p·N − i)).

   РОЗМІТКА (все всередині section-аргументу):
     <div data-pcs-layer>            ← стає sticky-шаром 100svh
       <div data-pcs-bg>             ← постійний медіа-фон
       <div data-pcs-card>           ← текст-колонка (+tint = проєкт)
         <div data-pcs-text>×N
       <div data-pcs-widget>         ← лічильник-віджет (бар + N/M)
         <div data-pcs-bar-track><div data-pcs-bar></div></div>
         <span data-pcs-count>1</span><span data-pcs-total>/ N</span>
       <div data-pcs-ticks>          ← моб line-ticks (движок створить N)

   PinnedCounterSlideshow.create(section, opts) — opts опційні:
     stepSvh: 85          // скрол-крок на слайд
     textDelayMs: 250     // живий changeShow delay 0.25
     lineStaggerMs: 60    // закон §0
     blurPx: 10
     cursorCounter: true  // follower на hover-mq (живий cursor--counter)
     hoverMq: '(hover: hover) and (pointer: fine)'
     touchMq
   Повертає { render(p), progress(), index(), goTo(i), gate, destroy }

   ENGINE LAWS: скраб (бар/ticks) = прямий transform у rAF БЕЗ
   transition; свапи = WAAPI подіями; follower = transform-only з
   rAF-lerp; reduced-motion: свапи миттєві, follower вимкнений;
   render(p) чистий; __LAB_OK__ не торкається (B15).
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function toEl(x) { return typeof x === 'string' ? doc.querySelector(x) : x; }
  function all(root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); }
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  /* порядковий split (канон text-blur-reveal): слова → спани,
     рядок за offsetTop, розгортання після reveal */
  function splitLines(el) {
    var words = el.textContent.split(/(\s+)/);
    var html = '';
    for (var i = 0; i < words.length; i++) {
      html += /\S/.test(words[i])
        ? '<span class="pcs-w" style="display:inline-block">' + words[i] + '</span>'
        : words[i];
    }
    var saved = el.innerHTML;
    el.innerHTML = html;
    var spans = all(el, '.pcs-w');
    var tops = [], lineOf = [];
    for (var j = 0; j < spans.length; j++) {
      var t = spans[j].offsetTop;
      if (!tops.length || t - tops[tops.length - 1] > 2) tops.push(t);
      lineOf.push(tops.length - 1);
    }
    return { spans: spans, lineOf: lineOf,
             unwrap: function () { el.innerHTML = saved; } };
  }

  function create(section, options) {
    options = options || {};
    var root = toEl(section);
    if (!root) return { error: 'no section' };
    var layer = root.querySelector('[data-pcs-layer]');
    var texts = all(root, '[data-pcs-text]');
    if (!layer || texts.length < 2)
      return { error: 'потрібні [data-pcs-layer] і ≥2 [data-pcs-text]' };

    var widget = root.querySelector('[data-pcs-widget]');
    var bar = root.querySelector('[data-pcs-bar]');
    var counter = root.querySelector('[data-pcs-count]');
    var total = root.querySelector('[data-pcs-total]');
    var ticksBox = root.querySelector('[data-pcs-ticks]');

    var N = texts.length;
    var opt = {
      stepSvh: options.stepSvh != null ? options.stepSvh : 85,
      textDelayMs: options.textDelayMs != null ? options.textDelayMs : 250,
      lineStaggerMs: options.lineStaggerMs != null ? options.lineStaggerMs : 60,
      blurPx: options.blurPx != null ? options.blurPx : 10,
      cursorCounter: options.cursorCounter !== false,
      hoverMq: options.hoverMq || '(hover: hover) and (pointer: fine)',
      touchMq: options.touchMq || '(pointer: coarse), (max-width: 768px)'
    };
    var reduced = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var touch = global.matchMedia && global.matchMedia(opt.touchMq).matches;
    var hover = !touch && global.matchMedia &&
      global.matchMedia(opt.hoverMq).matches;

    var gate = { swaps: 0, lastDir: 0, renders: 0, follower: false };
    var idx = 0;
    var anims = [];
    var unwrapText = null;

    if (total) total.textContent = '/ ' + N;
    if (counter) counter.textContent = '1';
    texts.forEach(function (t, i) { if (i) t.classList.add('is-off'); });

    /* моб line-ticks: движок сам будує N (живий progress-bar 2px) */
    var tickFills = [];
    if (ticksBox) {
      ticksBox.innerHTML = '';
      for (var i = 0; i < N; i++) {
        var item = doc.createElement('div');
        item.className = 'pcs-tick';
        var fill = doc.createElement('div');
        fill.className = 'pcs-tick-fill';
        fill.style.transform = 'translateX(-100%)';
        item.appendChild(fill);
        ticksBox.appendChild(item);
        tickFills.push(fill);
      }
    }

    root.classList.add(touch ? 'pcs-touch' : 'pcs-desktop');
    root.style.minHeight = 'calc(100svh + ' + (N - 1) * opt.stepSvh + 'svh)';

    function killAnims() {
      anims.forEach(function (a) { try { a.cancel(); } catch (e) {} });
      anims = [];
      if (unwrapText) { unwrapText(); unwrapText = null; }
    }

    /* ---- текст-свап (лічильник — НА СТАРТІ, живий counter) ---- */
    function goTo(next, dir) {
      next = Math.max(0, Math.min(N - 1, next));
      if (next === idx) return;
      dir = dir || (next > idx ? 1 : -1);
      var cur = idx;
      idx = next;
      gate.swaps++; gate.lastDir = dir;
      if (counter) counter.textContent = String(next + 1); /* закон: на старті */
      root.style.setProperty('--pcs-index', String(next));

      killAnims();
      var oldT = texts[cur], newT = texts[next];

      if (reduced || !newT.animate) {
        texts.forEach(function (t, i) { t.classList.toggle('is-off', i !== next); });
        return;
      }
      var b = opt.blurPx;
      var aOut = oldT.animate(
        { filter: ['blur(0px)', 'blur(' + b + 'px)'], opacity: [1, 0] },
        { duration: 1000, easing: 'ease-out', fill: 'both' });
      aOut.onfinish = function () { oldT.classList.add('is-off'); aOut.cancel(); };
      anims.push(aOut);
      newT.classList.remove('is-off');
      if (!touch) {
        var sp = splitLines(newT);
        var done = 0;
        unwrapText = sp.unwrap;
        sp.spans.forEach(function (w, k) {
          var a = w.animate(
            { filter: ['blur(' + b + 'px)', 'blur(0px)'], opacity: [0, 1] },
            { duration: 1000, easing: 'ease-out', fill: 'both',
              delay: opt.textDelayMs + sp.lineOf[k] * opt.lineStaggerMs });
          a.onfinish = function () {
            a.cancel();
            if (++done === sp.spans.length && unwrapText === sp.unwrap) {
              sp.unwrap(); unwrapText = null;
            }
          };
          anims.push(a);
        });
      } else {
        var aIn = newT.animate(
          { filter: ['blur(' + b + 'px)', 'blur(0px)'], opacity: [0, 1] },
          { duration: 1000, easing: 'ease-out', fill: 'both',
            delay: opt.textDelayMs });
        aIn.onfinish = function () { aIn.cancel(); };
        anims.push(aIn);
      }
    }

    /* ---- скрол-драйвер (живий sticky-плагін) ---- */
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
      var want = Math.min(Math.floor(p * N), N - 1);
      if (want !== idx) goTo(want, want > idx ? 1 : -1);
      /* desktop: ОДИН бар безперервно за весь пін (живий 0-0→200-100,
         тут без under-next: −100% → 0%); моб: покрокові line-ticks */
      if (bar) bar.style.transform = 'translateX(' + (-100 * (1 - p)) + '%)';
      for (var i = 0; i < tickFills.length; i++)
        tickFills[i].style.transform =
          'translateX(' + (-100 * (1 - clamp01(p * N - i))) + '%)';
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; render(progress()); });
    }
    global.addEventListener('scroll', onScroll, { passive: true });
    render(progress());

    /* ---- cursor-follower (живий cursor--counter, hover-only) ---- */
    var fRaf = null, fOn = false;
    var mx = 0, my = 0, fx = 0, fy = 0;
    function fLoop() {
      fx += (mx - fx) * 0.18; /* lerp-хвіст курсорного віджета */
      fy += (my - fy) * 0.18;
      widget.style.transform = 'translate(' + fx + 'px, ' + fy + 'px)';
      fRaf = fOn ? global.requestAnimationFrame(fLoop) : null;
    }
    function onMove(ev) {
      mx = ev.clientX; my = ev.clientY;
      if (!fOn) {
        fOn = true; fx = mx; fy = my;
        widget.classList.add('pcs-widget-on');
        fLoop();
      }
    }
    function onLeave() {
      fOn = false;
      widget.classList.remove('pcs-widget-on');
    }
    if (widget && hover && opt.cursorCounter && !reduced) {
      gate.follower = true;
      widget.classList.add('pcs-widget-cursor');
      layer.addEventListener('mousemove', onMove);
      layer.addEventListener('mouseleave', onLeave);
    }

    return {
      render: render, progress: progress,
      index: function () { return idx; }, goTo: goTo, gate: gate,
      destroy: function () {
        global.removeEventListener('scroll', onScroll);
        if (widget) {
          layer.removeEventListener('mousemove', onMove);
          layer.removeEventListener('mouseleave', onLeave);
          if (fRaf) global.cancelAnimationFrame(fRaf);
          widget.classList.remove('pcs-widget-cursor', 'pcs-widget-on');
          widget.style.transform = '';
        }
        killAnims();
        root.classList.remove('pcs-touch', 'pcs-desktop');
        root.style.minHeight = '';
      }
    };
  }

  global.PinnedCounterSlideshow = { create: create };
}(window));
