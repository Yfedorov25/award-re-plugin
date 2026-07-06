/* ============================================================
   REVOLVES-CAROUSEL · component.js (vanilla, нуль залежностей)
   ------------------------------------------------------------
   T-119-ПЕРЕКЛАД: єдина WebGL-карусель /about (carouselWebGl,
   UV-дисторсія на свапі) → CSS clip+scale+blur за законом no-WebGL
   (реєстр: «T-119 🔴 → CSS clip+scale переклад»; компенсація
   дисторсії = системний blur→sharp, закон T-M23).
   Живі факти (live-archive 2026-07-06): 3 фото 1176×672 над
   Vimeo-луп; thumbnails; cursor-стрілки ‹/›; desktop-only
   (is-hidden--sm-down; моб = mobile-scrollable стрічка — T-M23
   tap-режим уже закритий image-slider-wipe).

   СВАП (переклад дисторсії):
     вхідне фото: clip-path inset L→R (0 100% 0 0 → 0) + scale
       1.06→1 + blur 8px→0 — «хвиля» проходить кадром;
     вихідне: scale 1→0.97 + opacity 1→0 під ним.
     Темп: 1s ease-out (жива сім'я свапів contentAnimation).
   Лічильник свапається НА СТАРТІ (сімейний закон).

   РОЗМІТКА:
     <div data-rvc>
       <div data-rvc-stage><figure data-rvc-slide>×N</figure></div>
       <div data-rvc-thumbs></div>     ← движок будує з фото
       <button data-rvc-prev>/<button data-rvc-next>
       <span data-rvc-count>1</span><span data-rvc-total>/ N</span>

   RevolvesCarousel.create(root, opts?):
     swapMs (1000), blurPx (8), scaleFrom (1.06), touchMq
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
      swapMs: options.swapMs != null ? options.swapMs : 1000,
      blurPx: options.blurPx != null ? options.blurPx : 8,
      scaleFrom: options.scaleFrom != null ? options.scaleFrom : 1.06,
      touchMq: options.touchMq || '(pointer: coarse), (max-width: 768px)'
    };
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
      /* T-119-переклад: clip L→R (за напрямом) + scale + blur */
      var fromClip = dir > 0 ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
      var aIn = newS.animate(
        { clipPath: [fromClip, 'inset(0 0 0 0)'],
          transform: ['scale(' + opt.scaleFrom + ')', 'scale(1)'],
          filter: ['blur(' + opt.blurPx + 'px)', 'blur(0px)'] },
        { duration: opt.swapMs, easing: 'ease-out', fill: 'both' });
      aIn.onfinish = function () { newS.style.clipPath = ''; aIn.cancel(); };
      var aOut = oldS.animate(
        { transform: ['scale(1)', 'scale(0.97)'], opacity: [1, 0] },
        { duration: opt.swapMs, easing: 'ease-out', fill: 'both' });
      aOut.onfinish = function () {
        oldS.classList.add('is-off'); oldS.style.opacity = ''; aOut.cancel();
      };
      anims.push(aIn, aOut);
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
