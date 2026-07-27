/* ============================================================
   FUNNEL-CURTAIN · component.js  (vanilla, нуль залежностей)
   ------------------------------------------------------------
   T-M29 чорна wordmark-штора фунела + T-530 flash-перехід дрілу.
   Контракт: D_AIR_mobile_video (dense tr-05..32, виміряно по кадрах):
   тап [CHOOSE AN OFFICE ✛] → ДВОФАЗНИЙ ритуал-білборд (side-by-side
   аналіз REF|ATOM 2026-07-06): (1) панель ШВИДКО вискакує до ~52%
   екрана (~0.42s), гігантський розведений wordmark сидить У ЦЕНТРІ
   видимої чорної зони; (2) БРЕНД-ПАУЗА ~1.15s — панель стоїть як
   білборд (це і є «~1.2с» тірдауна — пауза, не підйом; плаваюча
   CTA-пілюля видима над кромкою); (3) швидке докриття (~0.26s) →
   свап під покриттям → миттєвий вихід (~0.32s, нова сторінка вже
   стоїть). Повний ритуал ~2.25s. «A I R A I R» ×2 не підтвердився.
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
      rise1Ms: options.rise1Ms != null ? options.rise1Ms : 420,
      pauseMs: options.pauseMs != null ? options.pauseMs : 1150,
      pauseAt: options.pauseAt != null ? options.pauseAt : 0.52,
      rise2Ms: options.rise2Ms != null ? options.rise2Ms : 260,
      holdMs: options.holdMs != null ? options.holdMs : 100,
      exitMs: options.exitMs != null ? options.exitMs : 320,
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
        /* центр видимої зони при паузі: панель-топ на (1-pauseAt)·100vh,
           видима зона (1-pauseAt)..100vh, її центр мінус пів-літери */
        var padTop = ((1 - opt.pauseAt) / 2 * 100 - 10.5) + 'vh';
        edge.style.cssText = 'position:absolute;top:0;left:0;right:0;' +
          'display:flex;justify-content:space-between;align-items:flex-start;' +
          'padding:' + padTop + ' 4vw 0;pointer-events:none';
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
      if (mode === 'flash') {
        return step(panel, 'translateY(0)', Math.round(opt.flashMs / 2))
          .then(function () {
            gate.coveredT = performance.now();
            swapFn();
            return delay(40);
          })
          .then(function () { return step(panel, 'translateY(-100%)', Math.round(opt.flashMs / 2)); })
          .then(function () {
            if (panel.parentNode) panel.parentNode.removeChild(panel);
            gate.doneT = performance.now();
            busy = false;
            return 'done';
          });
      }
      /* ДВОФАЗНИЙ ритуал: вискок до паузи → білборд → докриття → свап → вихід */
      return step(panel, 'translateY(' + ((1 - opt.pauseAt) * 100) + '%)', opt.rise1Ms)
        .then(function () {
          gate.pausedT = performance.now();
          return delay(opt.pauseMs);                       /* бренд-пауза */
        })
        .then(function () { return step(panel, 'translateY(0)', opt.rise2Ms); }) /* докриття */
        .then(function () {
          gate.coveredT = performance.now();
          swapFn();                                       /* свап під повним покриттям */
          return delay(opt.holdMs);
        })
        .then(function () { return step(panel, 'translateY(-100%)', opt.exitMs); }) /* вихід */
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
