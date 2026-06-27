/* ============================================================
   BLUR-REVEAL-STAGGER-TITLE · component.js  (vanilla, GSAP optional)
   ------------------------------------------------------------
   11tanjung's headline reveal — a multi-line display title MATERIALISES via a per-word
   gaussian blur(20px -> 0) + opacity(0 -> 1), staggered ~100ms per word, with NO
   translate (a frosted focus-pull, words sharpening into place where they sit). Distinct
   from a mask-up/rise reveal: here the words don't move, they come INTO FOCUS. Harvested
   from D_11tanjung (H3; a027 'A New' sharp first -> a033 'of Living' last).

   THE MOVE: each word starts filter: blur(20px) + opacity 0; on play they animate to
   blur(0) + opacity 1, staggered by word order (or a custom order), ease-out ~580ms.

   CONFIG-DRIVEN:
     BlurRevealStaggerTitle.create(target, {   // target = a heading el; its text is split into words
       blur: 20, stagger: 0.1, duration: 0.58, ease: 'power2.out',
       order: null     // optional array of word indices for a non-left-to-right order
     })
   Or split a string: pass a heading whose textContent is the title.
   Returns { play(o), set(p), reset(), destroy }.
   - play(): staggered focus-pull. set(p 0..1): PURE scrub of all words (scroll-drivable).

   ENGINE LAWS: filter(blur) + opacity only; GPU layer per word; NO mix-blend / NO
   backdrop; NO WebGL; reduced-motion -> shown sharp. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function splitWords(host) {
    // wrap each word in an inline-block span (preserve existing <br>/lines)
    var html = host.innerHTML;
    // split on whitespace but keep <br>
    var parts = html.split(/(<br\s*\/?>)/i);
    host.innerHTML = '';
    var words = [];
    parts.forEach(function (chunk) {
      if (/<br/i.test(chunk)) { host.appendChild(doc.createElement('br')); return; }
      chunk.split(/\s+/).forEach(function (w, i, arr) {
        if (!w) return;
        var span = doc.createElement('span');
        span.className = 'brst-word';
        span.style.display = 'inline-block';
        span.style.willChange = 'filter, opacity';
        span.textContent = w;
        host.appendChild(span); words.push(span);
        if (i < arr.length - 1) host.appendChild(doc.createTextNode(' '));
      });
    });
    return words;
  }

  function create(target, options) {
    options = options || {};
    var opt = {
      blur: options.blur != null ? options.blur : 20,
      stagger: options.stagger != null ? options.stagger : 0.1,
      duration: options.duration != null ? options.duration : 0.58,
      ease: options.ease || 'power2.out',
      order: options.order || null
    };
    var host = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!host) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var gsap = global.gsap;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var words = splitWords(host);

    function setWord(w, p) {
      var b = (opt.blur * (1 - p)).toFixed(2);
      w.style.filter = 'blur(' + b + 'px)';
      w.style.opacity = p.toFixed(3);
    }
    function setAll(p) { words.forEach(function (w) { setWord(w, p); }); }
    setAll(0);

    function efOut(name, t) {
      if (name === 'power3.out') return 1 - Math.pow(1 - t, 3);
      if (name === 'expo.out') return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      return 1 - Math.pow(1 - t, 2); // power2.out
    }

    function play(o) {
      o = o || {};
      if (reduced) { setAll(1); o.onComplete && o.onComplete(); return; }
      var order = opt.order || words.map(function (_, i) { return i; });
      order.forEach(function (idx, k) {
        var w = words[idx]; if (!w) return;
        var delay = k * (o.stagger != null ? o.stagger : opt.stagger);
        var dur = o.duration || opt.duration, ease = o.ease || opt.ease;
        if (gsap) {
          var proxy = { p: 0 }; setWord(w, 0);
          gsap.to(proxy, { p: 1, duration: dur, ease: ease, delay: delay,
            onUpdate: function () { setWord(w, proxy.p); },
            onComplete: k === order.length - 1 ? (o.onComplete || null) : null });
        } else {
          global.setTimeout(function () {
            var t0 = null, ms = dur * 1000;
            (function step(ts) { if (t0 == null) t0 = ts; var t = Math.min(1, (ts - t0) / ms); setWord(w, efOut(ease, t));
              if (t < 1) global.requestAnimationFrame(step); else if (k === order.length - 1 && o.onComplete) o.onComplete(); })(performance.now());
          }, delay * 1000);
        }
      });
    }

    try { global.__LAB_OK__ = true; } catch (e) {}
    return { words: words, play: play, set: setAll, reset: function () { setAll(0); }, destroy: function () {} };
  }

  var api = { create: create };
  global.BlurRevealStaggerTitle = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
