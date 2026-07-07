/* ============================================================
   REVOLVES-CAROUSEL · component.js (vanilla, нуль залежностей)
   ------------------------------------------------------------
   T-119 desktop = SLIDE-PUSH (⚠️ виправлення інтерпретації №8,
   самостійна дозйомка живого desktop 2026-07-06: recon-20260706/
   carousel-midslide.jpg + AIR-REF--about-carousel-desktop.mp4):
   старий кадр їде вліво, новий заходить справа, між ними БІЛИЙ
   ҐЕП ~20px; всередині кожного кадру фото КОНТРПАРАЛАКСИТЬ
   (відстає від треку, як imageSliderImage); ~1.0–1.2s air-ease.
   Морфу НЕМАЄ — WebGL живого лише рендерить текстури (canvas),
   видимий рух чисто трековий. Попередній clip+blur переклад був
   з мобільних кадрів (T-M23) — лишається у моб-стрічці системним
   blur-reveal, а desktop тепер 1-в-1 живий.
   Живі факти (live-archive): 3 фото 1176×672; thumbnails;
   стрілки = cursor-зони T-432 (js-carousel-next display:none) —
   в лабі кнопки, у зборці їх веде cursor-follower.

   СВАП (slide-push, dir=+1):
     вхідний слайд: translateX(calc(100% + gap) → 0)
     вихідний:      translateX(0 → calc(-100% - gap))
     фото всередині: вхідне -parallax%→0, вихідне 0→+parallax%
     (фото 112% ширини, left -6% — запас на дрейф без країв).
   Лічильник свапається НА СТАРТІ (сімейний закон).

   РОЗМІТКА:
     <div data-rvc>
       <div data-rvc-stage><figure data-rvc-slide>×N</figure></div>
       <div data-rvc-thumbs></div>     ← движок будує з фото
       <button data-rvc-prev>/<button data-rvc-next>
       <span data-rvc-count>1</span><span data-rvc-total>/ N</span>

   RevolvesCarousel.create(root, opts?):
     swapMs (1100), gapPx (20), parallaxPct (6), touchMq
   API: { go(i), next(), prev(), index(), gate, destroy }
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  function toEl(x) { return typeof x === 'string' ? doc.querySelector(x) : x; }

  function create(root, options) {
    root = toEl(root);
    options = options || {};
    if (!root) return { error: 'no root' };
    var stage = root.querySelector('[data-rvc-stage]');
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-rvc-slide]'));
    if (!stage || slides.length < 2)
      return { error: 'потрібні [data-rvc-stage] і ≥2 [data-rvc-slide]' };
    var thumbsBox = root.querySelector('[data-rvc-thumbs]');
    var counter = root.querySelector('[data-rvc-count]');
    var total = root.querySelector('[data-rvc-total]');
    var N = slides.length;
    var opt = {
      swapMs: options.swapMs != null ? options.swapMs : 1100,
      gapPx: options.gapPx != null ? options.gapPx : 20,
      parallaxPct: options.parallaxPct != null ? options.parallaxPct : 6,
      touchMq: options.touchMq || '(pointer: coarse), (max-width: 768px)'
    };
    var EASE = 'cubic-bezier(.25,.74,.22,.99)'; /* air-крива */
    var reduced = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var touch = global.matchMedia && global.matchMedia(opt.touchMq).matches;
    var gate = { swaps: 0, idx: 0, mode: touch ? 'strip' : 'swap' };
    var idx = 0, anims = [];

    if (total) total.textContent = '/ ' + N;
    if (counter) counter.textContent = '1';

    /* моб: жива mobile-scrollable стрічка (T-M23-сім'я) */
    if (touch) {
      root.classList.add('rvc-strip');
      return { mode: 'strip', index: function () { return 0; }, gate: gate,
               destroy: function () { root.classList.remove('rvc-strip'); } };
    }
    slides.forEach(function (s, i) { if (i) s.classList.add('is-off'); });

    /* thumbnails з фото слайдів (живі carousel-thumbnails) */
    var thumbs = [];
    if (thumbsBox) {
      slides.forEach(function (s, i) {
        var img = s.querySelector('img');
        var t = doc.createElement('button');
        t.type = 'button';
        t.className = 'rvc-thumb' + (i === 0 ? ' is-active' : '');
        t.setAttribute('aria-label', 'slide ' + (i + 1));
        if (img) t.innerHTML = '<img alt="" src="' + img.src + '">';
        t.addEventListener('click', function () { go(i); });
        thumbsBox.appendChild(t);
        thumbs.push(t);
      });
    }

    function killAnims() {
      anims.forEach(function (a) { try { a.cancel(); } catch (e) {} });
      anims = [];
    }

    function go(next, dir) {
      next = ((next % N) + N) % N;
      if (next === idx) return;
      dir = dir || (next > idx ? 1 : -1);
      var cur = idx;
      idx = next;
      gate.swaps++; gate.idx = next;
      if (counter) counter.textContent = String(next + 1); /* на старті */
      thumbs.forEach(function (t, k) { t.classList.toggle('is-active', k === next); });
      killAnims();
      var oldS = slides[cur], newS = slides[next];
      newS.classList.remove('is-off');
      if (reduced || !newS.animate) {
        slides.forEach(function (s, i) { s.classList.toggle('is-off', i !== next); });
        return;
      }
      /* живий slide-push (виправлення №8): трек з ґепом + контрпаралакс фото */
      var off = 'calc(' + (dir > 0 ? '' : '-') + '100% + ' + (dir > 0 ? '' : '-') + opt.gapPx + 'px)';
      var offOut = 'calc(' + (dir > 0 ? '-' : '') + '100% + ' + (dir > 0 ? '-' : '') + opt.gapPx + 'px)';
      var timing = { duration: opt.swapMs, easing: EASE, fill: 'both' };
      var aIn = newS.animate(
        { transform: ['translateX(' + off + ')', 'translateX(0)'] }, timing);
      aIn.onfinish = function () { aIn.cancel(); };
      var aOut = oldS.animate(
        { transform: ['translateX(0)', 'translateX(' + offOut + ')'] }, timing);
      aOut.onfinish = function () { oldS.classList.add('is-off'); aOut.cancel(); };
      anims.push(aIn, aOut);
      /* фото відстає від треку (контрпаралакс, як imageSliderImage) */
      var newImg = newS.querySelector('img'), oldImg = oldS.querySelector('img');
      var px = opt.parallaxPct;
      if (newImg) {
        var pIn = newImg.animate(
          { transform: ['translateX(' + (dir > 0 ? -px : px) + '%)', 'translateX(0%)'] }, timing);
        pIn.onfinish = function () { pIn.cancel(); };
        anims.push(pIn);
      }
      if (oldImg) {
        var pOut = oldImg.animate(
          { transform: ['translateX(0%)', 'translateX(' + (dir > 0 ? px : -px) + '%)'] }, timing);
        pOut.onfinish = function () { pOut.cancel(); };
        anims.push(pOut);
      }
    }
    function next() { go(idx + 1, 1); }
    function prev() { go(idx - 1, -1); }
    var bN = root.querySelector('[data-rvc-next]');
    var bP = root.querySelector('[data-rvc-prev]');
    if (bN) bN.addEventListener('click', next);
    if (bP) bP.addEventListener('click', prev);

    return {
      go: go, next: next, prev: prev,
      index: function () { return idx; }, gate: gate,
      destroy: function () {
        killAnims();
        if (thumbsBox) thumbsBox.innerHTML = '';
      }
    };
  }

  global.RevolvesCarousel = { create: create };
}(window));
