/* ============================================================
   SCRAMBLE-SETTLE-TEXT · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   bydorr's signature text reveal — a multi-line passage that, on scroll, reveals CHARACTER
   BY CHARACTER from left to right: the settled head is solid, while the chars at the reveal
   EDGE are SCRAMBLED (each glyph rotated + offset + faded) and tumble into place as the
   scroll advances. A scroll-scrubbed per-glyph scramble-settle. Harvested from D_bydorr
   (the "Feel because you have a heart… laugh, love, and sleep." poem reveal).

   THE MOVE (one pinned scroll-scrub, progress p 0..1):
     - the text is split into per-character spans; each char i owns a window
       [i/N*spread .. i/N*spread + charWin] along p (left-to-right cascade)
     - inside its window a char eases from a SEEDED scrambled state
       (rotate r0, translate (dx0,dy0), opacity 0) to settled (0,0,0,1), power3.out
     - seeds are fixed per char at init (deterministic — no per-frame Math.random jitter)
   set(p) is a PURE scrub.

   CONFIG-DRIVEN:
     ScrambleSettleText.create(target, {     // target wraps the text (or .sst-text)
       chaos: 38,            // px max scramble offset; deg = chaos*0.7 rotation
       charWin: 0.10,        // fraction of p each char takes to settle
       pinFactor: 1.2, ease: 'power3.out', manageLenis: true,
       seed: 7               // deterministic scramble seed
     })
   Markup: .sst-stage > .sst-text (plain text or [data-line] blocks). The JS splits it.
   Returns { trigger, set(p), destroy }.

   ENGINE LAWS: transform(translate, rotate) + opacity per char only; GPU; NO filter / NO
   mix-blend; NO WebGL; reduced-motion / <=820px -> all settled. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      chaos: options.chaos != null ? options.chaos : 38,
      charWin: options.charWin != null ? options.charWin : 0.16,
      pinFactor: options.pinFactor != null ? options.pinFactor : 1.2,
      ease: options.ease || 'power3.out',
      seed: options.seed != null ? options.seed : 7,
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }
    var textEl = stage.querySelector('.sst-text') || stage;
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function efOut(t) { return opt.ease === 'expo.out' ? (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) : 1 - Math.pow(1 - t, 3); }
    // tiny deterministic PRNG (mulberry32-ish) so scramble seeds are stable per char
    var s = opt.seed >>> 0;
    function rnd() { s |= 0; s = (s + 0x6D2B79F5) | 0; var t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }

    // split each [data-line] (or the element) into per-char spans, preserving spaces/wrap
    var lines = [].slice.call(textEl.querySelectorAll('[data-line]'));
    if (!lines.length) lines = [textEl];
    var chars = [];
    lines.forEach(function (ln) {
      var txt = ln.textContent;
      ln.textContent = '';
      ln.style.display = ln.style.display || 'block';
      for (var k = 0; k < txt.length; k++) {
        var ch = txt[k];
        if (ch === ' ') { ln.appendChild(doc.createTextNode(' ')); continue; }
        var sp = doc.createElement('span');
        sp.className = 'sst-char';
        sp.textContent = ch;
        sp.style.display = 'inline-block';
        sp.style.willChange = 'transform, opacity';
        // seed a deterministic per-char jitter scalar [0,1] (used for organic, sub-px variety)
        sp.__k = rnd();
        ln.appendChild(sp);
        chars.push(sp);
      }
    });
    var N = chars.length || 1;
    var spread = 1 - opt.charWin;   // last char starts at p = spread

    function apply(p) {
      p = clamp01(p);
      for (var i = 0; i < N; i++) {
        var c = chars[i];
        var start = (i / N) * spread;
        var lp = efOut(clamp01((p - start) / opt.charWin));
        var inv = 1 - lp;
        // BASELINE-LOCKED HORIZONTAL COLLAPSE (the bydorr smear): the edge of the wave is a
        // translucent, slightly-shrunk, extra-tracked, rightward-drifted ghost that COLLAPSES
        // to settled as the wave reaches it. NO vertical move, NO rotation -> stable + liquid.
        var k = c.__k || 0;
        var smear = inv * inv;                       // tracking + x collapse faster than the fade
        var tx = inv * (opt.chaos * 0.13 + opt.chaos * 0.32 * k); // rightward only (x of translate3d)
        var ls = smear * (0.08 + 0.20 * k);          // extra letter-spacing on the unsettled tail (em)
        var sc = 1 - inv * (0.06 + 0.05 * k);        // slight shrink while unsettled, never > 1
        c.style.opacity = (0.10 + 0.90 * lp).toFixed(3);
        c.style.letterSpacing = ls.toFixed(4) + 'em';
        c.style.transform = 'translate3d(' + tx.toFixed(2) + 'px,0,0) scale(' + sc.toFixed(4) + ')';
      }
    }
    apply(0);

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      stage.classList.add('sst-static'); apply(1);
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { static: true, set: apply, destroy: function () {} };
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

    var trigger = ScrollTrigger.create({
      trigger: stage, start: 'top top',
      end: function () { return '+=' + Math.round(global.innerHeight * opt.pinFactor); },
      pin: true, pinSpacing: true, scrub: true,
      onUpdate: function (self) { apply(self.progress); }
    });
    apply(0);

    global.addEventListener('resize', function () { ScrollTrigger.refresh(); });
    stage.classList.add('sst-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, set: apply, chars: chars,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.ScrambleSettleText = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
