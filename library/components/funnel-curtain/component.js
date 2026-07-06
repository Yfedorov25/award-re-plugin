/* ============================================================
   FUNNEL-CURTAIN · component.js  (vanilla, нуль залежностей)
   ------------------------------------------------------------
   T-M29 чорна wordmark-штора фунела + T-530 flash-перехід дрілу.
   Контракт: D_AIR_mobile_video (dense tr-05..32, виміряно по кадрах):
   тап [CHOOSE AN OFFICE ✛] → ЧОРНА панель їде знизу→вгору, у її
   ВЕРХНІЙ частині їде ГІГАНТСЬКИЙ розведений рядок wordmark (~1.7s
   підйом; плаваюча CTA-пілюля лишається видимою над кромкою) →
   покриття → свап → швидкий вихід (~0.3s, нова сторінка вже стоїть);
   повний ритуал ~2.2s. УТОЧНЕНО живим відео 2026-07-06 (2fps-розкладка
   t22.6–25.0 MOBILE-air-4): «A I R A I R» ×2 і довгий вихід з тірдауна
   НЕ підтвердились — один гігант-прохід, вихід швидкий.
   Це ДОВГИЙ брендовий ритуал входу у фунел — контраст зі швидкою
   білою міжсторінковою шторою T-M22 (~0.5s, окремий атом).

   T-530 (desktop, між рівнями visual-search дрілу): та сама машина,
   пресет mode:'flash' — короткий чорний блимок ~0.45s без wordmark
   (реєстр: «короткий чорний flash»; точний тайминг desktop не знятий —
   чесна примітка, дозйомка уточнить).

   FunnelCurtain.create(opts) — opts усі опційні:
     wordmark: 'AIR'        // рядок кромки (розведений, повторений)
     repeat: 2              // «A I R A I R» = 2 повтори
     bg: '#111110'          // чорна панель
     ink: '#f4f2ee'         // літери кромки
     riseMs: 1200           // підйом до покриття (тірдаун ~1.2s)
     holdMs: 180            // пауза повного покриття (свап тут)
     exitMs: 1050           // вихід угору (разом ~2.4s ∈ 2.2–2.5)
     flashMs: 450           // тривалість mode:'flash'
     zIndex: 15
   Повертає { play(swapFn, mode), destroy, gate }
     play('curtain') = повний ритуал; play(fn,'flash') = T-530 блимок.
     swapFn кличеться РІВНО в момент повного покриття (там міняєш
     контент/сторінку). Повертає Promise, що резолвиться по завершенні.
     Reduced-motion: swapFn одразу, нуль штори, Promise одразу.

   ENGINE LAWS: рух = transform ТІЛЬКИ (translateY панелі; літери
   їдуть РАЗОМ з панеллю бо живуть на її кромці — нуль окремих твінів);
   easing = сімейний перехідний bezier(.7,0,.3,1) (той самий, що
   вихід/вхід прелоадера — «одне дихання» бренду); паралельні play()
   ігноруються (одна штора за раз); панель після ритуалу ЗНІМАЄТЬСЯ
   з DOM; __LAB_OK__ не торкається (B15).
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;
  var EASE = 'cubic-bezier(.7,0,.3,1)';

  function create(options) {
    options = options || {};
    var opt = {
      wordmark: options.wordmark || 'AIR',
      repeat: options.repeat != null ? options.repeat : 1, /* живе відео: ОДИН гігант-прохід (A I R ×2 з тірдауна не підтвердився) */
      bg: options.bg || '#111110',
      ink: options.ink || '#f4f2ee',
      riseMs: options.riseMs != null ? options.riseMs : 1700, /* живе відео: підйом ~1.7s */
      holdMs: options.holdMs != null ? options.holdMs : 140,
      exitMs: options.exitMs != null ? options.exitMs : 320, /* живе відео: свап+вихід швидкий, список стоїть за ~0.3s */
      flashMs: options.flashMs != null ? options.flashMs : 450,
      zIndex: options.zIndex != null ? options.zIndex : 15
    };
    var reduced = global.matchMedia &&
      global.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var gate = { plays: 0, lastMode: null, coveredT: -1, doneT: -1 };
    var busy = false;

    function buildPanel(mode) {
      var panel = doc.createElement('div');
      panel.className = 'fcr fcr--' + mode;
      panel.setAttribute('aria-hidden', 'true');
      panel.style.cssText = 'position:fixed;inset:0;z-index:' + opt.zIndex +
        ';background:' + opt.bg + ';transform:translateY(100%);pointer-events:none';
      if (mode === 'curtain') {
        /* розведений рядок на ВЕРХНІЙ КРОМЦІ — їде разом з панеллю */
        var edge = doc.createElement('div');
        edge.className = 'fcr__edge';
        edge.style.cssText = 'position:absolute;top:0;left:0;right:0;' +
          'display:flex;justify-content:space-between;align-items:flex-start;' +
          'padding:5vh 4vw 0;pointer-events:none';
        var letters = String(opt.wordmark).replace(/\s+/g, '').split('');
        for (var r = 0; r < opt.repeat; r++) {
          letters.forEach(function (ch) {
            var s = doc.createElement('span');
            s.textContent = ch;
            s.style.cssText = 'font-weight:300;line-height:1;letter-spacing:.02em;' +
              'font-size:clamp(64px,21vw,220px);color:' + opt.ink; /* ГІГАНТ як на живих кадрах */
            edge.appendChild(s);
          });
        }
        panel.appendChild(edge);
      }
      doc.body.appendChild(panel);
      return panel;
    }

    /* один transition-крок: transform → цільове значення, await кінця */
    function step(el, transform, ms) {
      return new Promise(function (res) {
        el.style.transition = 'transform ' + ms + 'ms ' + EASE;
        requestAnimationFrame(function () { requestAnimationFrame(function () {
          el.style.transform = transform;
          setTimeout(res, ms + 40);
        }); });
      });
    }
    function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

    function play(swapFn, mode) {
      mode = mode || 'curtain';
      swapFn = typeof swapFn === 'function' ? swapFn : function () {};
      if (reduced) { swapFn(); return Promise.resolve('reduced'); }
      if (busy) return Promise.resolve('busy-ignored');
      busy = true;
      gate.plays++;
      gate.lastMode = mode;
      var panel = buildPanel(mode);
      var rise = mode === 'flash' ? Math.round(opt.flashMs / 2) : opt.riseMs;
      var exit = mode === 'flash' ? Math.round(opt.flashMs / 2) : opt.exitMs;
      var hold = mode === 'flash' ? 40 : opt.holdMs;
      return step(panel, 'translateY(0)', rise)          /* знизу → покриття */
        .then(function () {
          gate.coveredT = performance.now();
          swapFn();                                       /* свап під повним покриттям */
          return delay(hold);
        })
        .then(function () { return step(panel, 'translateY(-100%)', exit); }) /* далі вгору */
        .then(function () {
          if (panel.parentNode) panel.parentNode.removeChild(panel);
          gate.doneT = performance.now();
          busy = false;
          return 'done';
        });
    }

    function destroy() {
      var p = doc.querySelector('.fcr');
      if (p && p.parentNode) p.parentNode.removeChild(p);
      busy = false;
    }

    return { play: play, destroy: destroy, gate: gate };
  }

  global.FunnelCurtain = { create: create };
}(window));
