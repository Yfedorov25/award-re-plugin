/* ============================================================
   MASKED-HERITAGE-SPLIT · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   r1864's /history split — a LEFT dark-green serif NARRATIVE panel (giant ALL-CAPS title
   + small sans body + an artwork CREDIT caption + a "1 / N" counter + a circular → arrow)
   beside a RIGHT full-bleed HERITAGE-ARTWORK panel that REVEALS by a vertical clip-path
   (top -> bottom) on enter; advancing the counter swaps the artwork + its caption.
   Museum-grade "the place has a past" chapter. Harvested from D_r1864 (r18644 /history:
   'ИСТОРИЯ "РЕЗИДЕНЦИИ 1864" С XV ВЕКА' + Vasnetsov plates, "Кремль при Иване III").

   THE MOVE:
     A) ENTER (scroll-into-view, one play, progress p 0..1) — set(p):
        - right artwork panel: clip-path inset top->bottom 100% -> 0% (a curtain drops the
          art into view) + a slight scale 1.06 -> 1 settle
        - left panel: title fade + translateY 28 -> 0 over 0.20..0.55; body 0.40..0.70;
          credit + counter + arrow 0.60..1.0 (staggered)
        set(p) is a PURE scrub.
     B) ADVANCE (the → arrow, or .mhs-dot) — swaps to slide i:
        outgoing art clips UP (inset bottom grows) while incoming art clips DOWN from top;
        the credit caption cross-fades; the counter updates. A short, eased transition
        (not scroll-driven). wraps N..1.

   CONFIG-DRIVEN:
     MaskedHeritageSplit.create(target, {            // target = .mhs-stage
       start: 'top 70%', revealDur: 1.1, swapDur: 0.7, ease: 'power3.out',
       clipFrom: 'top', scaleFrom: 1.06, once: true, autoAdvance: 0, manageLenis: true
     })
   Markup: .mhs-stage > .mhs-left ( .mhs-title + .mhs-body + .mhs-credit[data-credit] +
   .mhs-nav( .mhs-counter + .mhs-arrow ) ) + .mhs-right ( .mhs-slide[data-credit][data-credit-by] ... ).
   Returns { trigger, set(p), play(), go(i), next(), prev(), destroy }.

   ENGINE LAWS: clip-path(inset) + transform + opacity only; GPU; NO mix-blend; NO WebGL;
   reduced-motion / <=820px -> shown, slides stacked / first shown. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      start: options.start || 'top 70%',
      revealDur: options.revealDur != null ? options.revealDur : 1.1,
      swapDur: options.swapDur != null ? options.swapDur : 0.7,
      ease: options.ease || 'power3.out',
      clipFrom: options.clipFrom || 'top',           // top | bottom | left | right
      scaleFrom: options.scaleFrom != null ? options.scaleFrom : 1.06,
      once: options.once !== false,
      autoAdvance: options.autoAdvance != null ? options.autoAdvance : 0, // ms; 0 = off
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var left = stage.querySelector('.mhs-left');
    var title = stage.querySelector('.mhs-title');
    var body = stage.querySelector('.mhs-body');
    var credit = stage.querySelector('.mhs-credit');
    var creditBy = stage.querySelector('.mhs-credit-by');
    var nav = stage.querySelector('.mhs-nav');
    var counter = stage.querySelector('.mhs-counter');
    var arrow = stage.querySelector('.mhs-arrow');
    var prevBtn = stage.querySelector('.mhs-prev');
    var dots = [].slice.call(stage.querySelectorAll('.mhs-dot'));
    var slides = [].slice.call(stage.querySelectorAll('.mhs-slide'));
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    var N = slides.length || 1;
    var cur = 0;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function efOut(t) { return opt.ease === 'expo.out' ? (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) : 1 - Math.pow(1 - t, 3); }
    function sub01(p, a, b) { return clamp01((p - a) / (b - a)); }
    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    // clip-path inset where `hidden` 0..1 = how much of the panel is still curtained,
    // clipped from the `clipFrom` edge.
    function insetFor(hidden) {
      var h = (hidden * 100).toFixed(2) + '%';
      switch (opt.clipFrom) {
        case 'bottom': return 'inset(0 0 ' + h + ' 0)';
        case 'left': return 'inset(0 0 0 ' + h + ')';
        case 'right': return 'inset(0 ' + h + ' 0 0)';
        default: return 'inset(' + h + ' 0 0 0)'; // top
      }
    }

    function setSlideCredit(i) {
      if (!slides[i]) return;
      var c = slides[i].getAttribute('data-credit') || '';
      var by = slides[i].getAttribute('data-credit-by') || '';
      if (credit) credit.textContent = c;
      if (creditBy) creditBy.textContent = by;
    }

    // ----- A) ENTER reveal scrub --------------------------------------------
    function apply(p) {
      p = clamp01(p);
      // right artwork: curtain drops (hidden 1 -> 0) + scale settle, over 0..0.62
      var rp = efOut(sub01(p, 0.0, 0.62));
      var active = slides[cur];
      if (active) {
        active.style.clipPath = insetFor(1 - rp);
        active.style.webkitClipPath = insetFor(1 - rp);
        active.style.transform = 'scale(' + (opt.scaleFrom + (1 - opt.scaleFrom) * rp).toFixed(4) + ')';
        active.style.opacity = '1';
      }
      // left title
      if (title) {
        var tp = efOut(sub01(p, 0.20, 0.55));
        title.style.opacity = tp.toFixed(3);
        title.style.transform = 'translateY(' + ((1 - tp) * 28).toFixed(1) + 'px)';
      }
      // left body
      if (body) {
        var bp = efOut(sub01(p, 0.40, 0.70));
        body.style.opacity = bp.toFixed(3);
        body.style.transform = 'translateY(' + ((1 - bp) * 20).toFixed(1) + 'px)';
      }
      // credit + nav (counter + arrow)
      var np = efOut(sub01(p, 0.60, 1.0));
      [credit, creditBy, nav].forEach(function (el) {
        if (!el) return;
        el.style.opacity = np.toFixed(3);
        el.style.transform = 'translateY(' + ((1 - np) * 14).toFixed(1) + 'px)';
      });
    }

    // ----- B) ADVANCE swap (eased, not scroll) ------------------------------
    var swapping = false;
    function go(i) {
      i = ((i % N) + N) % N;
      if (i === cur || swapping) return;
      var outEl = slides[cur], inEl = slides[i];
      cur = i;
      setSlideCredit(i);
      if (counter) counter.textContent = pad(i + 1) + ' / ' + pad(N);
      dots.forEach(function (d, k) { d.classList.toggle('is-active', k === i); });

      if (!gsap || reduced) {
        slides.forEach(function (s, k) {
          s.style.clipPath = s.style.webkitClipPath = insetFor(k === i ? 0 : 1);
          s.style.opacity = k === i ? '1' : '0';
          s.style.transform = 'scale(1)';
        });
        return;
      }
      swapping = true;
      // incoming drops from the top; outgoing clips away upward (bottom grows)
      inEl.style.opacity = '1';
      inEl.style.zIndex = '2';
      outEl.style.zIndex = '1';
      gsap.set(inEl, { clipPath: insetFor(1), webkitClipPath: insetFor(1), scale: 1.04 });
      gsap.to(inEl, {
        duration: opt.swapDur, ease: opt.ease,
        clipPath: insetFor(0), webkitClipPath: insetFor(0), scale: 1,
        onComplete: function () {
          outEl.style.opacity = '0';
          outEl.style.clipPath = outEl.style.webkitClipPath = insetFor(1);
          swapping = false;
        }
      });
      // cross-fade the credit text
      if (credit) gsap.fromTo([credit, creditBy], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: opt.swapDur * 0.8, ease: opt.ease });
    }
    function next() { go(cur + 1); }
    function prev() { go(cur - 1); }

    // init slide states
    slides.forEach(function (s, k) {
      s.style.opacity = k === 0 ? '1' : '0';
      s.style.clipPath = s.style.webkitClipPath = insetFor(k === 0 ? 1 : 1); // all curtained until reveal
      s.style.transform = 'scale(' + opt.scaleFrom + ')';
    });
    setSlideCredit(0);
    if (counter) counter.textContent = pad(1) + ' / ' + pad(N);
    if (dots[0]) dots[0].classList.add('is-active');
    apply(0);

    // wiring
    if (arrow) arrow.addEventListener('click', function (e) { e.preventDefault(); next(); });
    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.preventDefault(); prev(); });
    dots.forEach(function (d, k) { d.addEventListener('click', function (e) { e.preventDefault(); go(k); }); });

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      stage.classList.add('mhs-static'); apply(1);
      try { global.__LAB_OK__ = true; } catch (e) {}
      return {
        static: true, set: apply, play: function () { apply(1); },
        go: go, next: next, prev: prev, destroy: function () {}
      };
    }

    gsap.registerPlugin(ScrollTrigger);
    gsap.ticker.lagSmoothing(0);
    var lenis = null;
    if (opt.manageLenis && Lenis) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      global.__lenis = lenis;
    }

    var played = false, timer = null;
    var trigger = ScrollTrigger.create({
      trigger: stage, start: opt.start,
      onEnter: function () {
        if (played && opt.once) return; played = true;
        var o = { p: 0 };
        gsap.to(o, {
          p: 1, duration: opt.revealDur, ease: 'none',
          onUpdate: function () { apply(o.p); },
          onComplete: function () {
            if (opt.autoAdvance > 0 && N > 1) timer = global.setInterval(next, opt.autoAdvance);
          }
        });
      },
      onLeaveBack: opt.once ? null : function () { played = false; apply(0); }
    });

    stage.classList.add('mhs-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, set: apply, play: function () { apply(1); },
      go: go, next: next, prev: prev,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { if (timer) global.clearInterval(timer); trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.MaskedHeritageSplit = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
