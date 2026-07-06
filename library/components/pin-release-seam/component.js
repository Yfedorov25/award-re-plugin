/* ============================================================
   PIN-RELEASE-SEAM · component.js  (vanilla, нуль залежностей)
   ------------------------------------------------------------
   T-510 pin-then-release ланцюг. Механіка знята ДОСЛІВНО з живого
   shared.js AIR (патерни sectionToSticky / sectionFromSticky-
   HalfUnderNext + easing-модуль, витяг 2026-07-06):

   СТРУКТУРА (sticky-підкладка, НУЛЬ JS-піна):
     секція A загортається в раму (100+holdVh)vh; сама A =
     position:sticky top:0 height:100vh — «замерзає» і віддає
     скрол; наступна секція B підтягується margin-top:-100vh
     із вищим z-index і НАЇЖДЖАЄ ПОВЕРХ замерзлої A.

   ПАРАЛАКС-ШАРИ (тільки desktop; на тачі ВИМКНЕНО — живий JS:
   enableTouch:false на обох патернах = закон моб-тірдауна
   «пін = sticky-підкладка БЕЗ scroll-trap»):
     A-контент (HalfUnderNext, дослівні keyframes 200/150/100 →
       0 / −25svh / −75svh, easeSectionInverse = t²): поки B
       наїжджає, A тікає вгору ВДВІЧІ ПОВІЛЬНІШЕ — лишається
       видимою у щілині, глибина без WebGL;
     B-контент (sectionToSticky: −50svh → 0, easeSectionInverse):
       контент B «визирає» раніше за панель і доїжджає на місце.

   PinReleaseSeam.create(pinned, next, opts) — opts усі опційні:
     holdVh: 100        // скрол-простір заморозки (рама = 100+holdVh)
     releaseShift: 75   // svh відставання A (AIR keyframe −75svh)
     approachShift: 50  // svh напливу B-контенту (AIR −50svh)
     contentA/contentB: селектор шару паралакса (дефолт: перша
                        дитина секції; уся секція як шар — заборонено,
                        бо панель мусить їхати чесно)
     touchMq: '(pointer: coarse), (max-width: 768px)'
   Повертає { render(p), progress(), gate, destroy }
     (reduced-motion / touch: { staticParallax:true } — sticky-наїзд
      живе, паралакс-шари стоять).

   ENGINE LAWS: рух = transform ТІЛЬКИ (translateY, D4-чистий скраб);
   render(p) — чиста функція наїзду (reverse-safe); rAF-квантування
   зі skip-unchanged; sticky = CSS (нуль scroll-trap, свайп вільний);
   один pin-owner на біт (owns_pin: true); __LAB_OK__ не торкається.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function toEl(x) { return typeof x === 'string' ? doc.querySelector(x) : x; }
  function easeInQuad(t) { return t * t; }               /* easeSectionInverse AIR */

  function create(pinned, next, options) {
    options = options || {};
    var A = toEl(pinned), B = toEl(next);
    if (!A || !B) return { error: 'no sections' };
    var opt = {
      holdVh: options.holdVh != null ? options.holdVh : 100,
      releaseShift: options.releaseShift != null ? options.releaseShift : 75,
      approachShift: options.approachShift != null ? options.approachShift : 50,
      contentA: options.contentA || null,
      contentB: options.contentB || null,
      touchMq: options.touchMq || '(pointer: coarse), (max-width: 768px)'
    };
    var reduced = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var touch = global.matchMedia && global.matchMedia(opt.touchMq).matches;

    /* --- структура: рама + sticky + наїзд --- */
    var frame = doc.createElement('div');
    frame.className = 'prs__frame';
    frame.style.cssText = 'height:' + (100 + opt.holdVh) + 'vh;position:relative';
    A.parentNode.insertBefore(frame, A);
    frame.appendChild(A);
    A.style.position = 'sticky';
    A.style.top = '0';
    A.style.height = '100vh';
    A.style.overflow = 'clip';
    B.style.position = 'relative';
    B.style.zIndex = '2';
    B.style.marginTop = '-' + opt.holdVh + 'vh';

    var layerA = opt.contentA ? A.querySelector(opt.contentA) : A.firstElementChild;
    var layerB = opt.contentB ? B.querySelector(opt.contentB) : B.firstElementChild;
    var gate = { renders: 0, lastP: -1, parallax: !(reduced || touch) };

    /* прогрес наїзду B поверх A: 0 = B ще внизу, 1 = B повністю поверх */
    function progress() {
      var vh = global.innerHeight;
      var top = B.getBoundingClientRect().top;
      return Math.max(0, Math.min(1, (vh - top) / vh));
    }

    if (reduced || touch) {
      /* закон тача: sticky-наїзд живе, паралакс-шари СТОЯТЬ */
      return { staticParallax: true, progress: progress, gate: gate,
               destroy: function () { unwrap(); } };
    }

    var lastQ = -1;
    function render(p) {
      p = Math.max(0, Math.min(1, p));
      gate.lastP = p;
      var q = Math.round(p * 1000);
      if (q === lastQ) return;
      lastQ = q;
      gate.renders++;
      var e = easeInQuad(p);
      if (layerA) layerA.style.transform = 'translateY(' + (-e * opt.releaseShift) + 'svh)';
      if (layerB) layerB.style.transform = 'translateY(' + (-(1 - e) * opt.approachShift) + 'svh)';
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; render(progress()); });
    }
    if (layerA) layerA.style.willChange = 'transform';
    if (layerB) layerB.style.willChange = 'transform';
    global.addEventListener('scroll', onScroll, { passive: true });
    render(progress()); /* стрибок = правильний стан одразу */

    function unwrap() {
      if (frame.parentNode) {
        frame.parentNode.insertBefore(A, frame);
        frame.remove();
      }
      A.style.position = A.style.top = A.style.height = A.style.overflow = '';
      B.style.position = B.style.zIndex = B.style.marginTop = '';
      if (layerA) { layerA.style.transform = ''; layerA.style.willChange = ''; }
      if (layerB) { layerB.style.transform = ''; layerB.style.willChange = ''; }
    }
    function destroy() {
      global.removeEventListener('scroll', onScroll);
      unwrap();
    }
    return { render: render, progress: progress, gate: gate, destroy: destroy };
  }

  global.PinReleaseSeam = { create: create };
}(window));
