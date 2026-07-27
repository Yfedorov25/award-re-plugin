/* ============================================================
   SCROLL-CLIP-RISE · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   Saisei's text+image SECTION reveal (S6) — as the section scrolls into view, each
   element RISES from under a bottom mask: a vertical portrait photo grows up like a
   column on the LEFT, and the body copy on the RIGHT reveals LINE BY LINE. The axis is
   Y (bottom->top), scroll-driven, asymmetric — the OPPOSITE engine to center-seam-split
   (X, centre-out, timeline). Harvested from D_saisei (S6 / the project INFO section).

   THE MOVE: every [data-rise] element starts clip-path: inset(100% 0 0 0) (clipped from
   the bottom) + translateY(12px) + scale(1.04) + opacity 0; on scroll-into-view it
   animates to inset(0) / 0 / 1 / 1, power3.out. Body text is split into masked lines
   (overflow:hidden + the line translateY 100%->0) with a ~40ms per-line stagger.

   CONFIG-DRIVEN:
     ScrollClipRise.create(target, {
       riseSelector: '[data-rise]',   // elements that rise as a whole
       lineSelector: '[data-rise-lines]', // containers whose TEXT splits into masked lines
       duration: 0.8, ease: 'power3.out', stagger: 0.08,  // between rise elements
       lineStagger: 0.04, start: 'top 80%', once: true, manageLenis: true
     })
   Returns { trigger, play(), set(p), destroy }.

   ENGINE LAWS: clip-path inset (bottom) + transform(translateY, scale) + opacity only;
   GPU; NO mix-blend / NO backdrop over the scrubbed surface; NO WebGL; reduced-motion
   / <=820px -> shown. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function splitLines(el) {
    // wrap each visual line in an overflow:hidden mask + an inner moving span.
    // simple word-wrap: measure line tops to group words into lines.
    var text = el.textContent.trim();
    el.textContent = '';
    var words = text.split(/\s+/);
    var probe = [];
    words.forEach(function (w, i) {
      var s = doc.createElement('span'); s.textContent = w + (i < words.length - 1 ? ' ' : '');
      s.style.display = 'inline-block'; el.appendChild(s); probe.push(s);
    });
    // group by offsetTop
    var lines = [], cur = null, top = null;
    probe.forEach(function (s) {
      if (top === null || Math.abs(s.offsetTop - top) > 2) { cur = []; lines.push(cur); top = s.offsetTop; }
      cur.push(s.textContent);
    });
    el.textContent = '';
    var inners = [];
    lines.forEach(function (lineWords) {
      var mask = doc.createElement('span'); mask.style.cssText = 'display:block;overflow:hidden';
      var inner = doc.createElement('span'); inner.style.cssText = 'display:block;will-change:transform';
      inner.textContent = lineWords.join('');
      mask.appendChild(inner); el.appendChild(mask); inners.push(inner);
    });
    return inners;
  }

  function create(target, options) {
    options = options || {};
    var opt = {
      riseSelector: options.riseSelector || '[data-rise]',
      lineSelector: options.lineSelector || '[data-rise-lines]',
      duration: options.duration != null ? options.duration : 0.8,
      ease: options.ease || 'power3.out',
      stagger: options.stagger != null ? options.stagger : 0.08,
      lineStagger: options.lineStagger != null ? options.lineStagger : 0.04,
      start: options.start || 'top 80%',
      once: options.once !== false,
      manageLenis: options.manageLenis !== false
    };
    var host = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!host) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    var risers = [].slice.call(host.querySelectorAll(opt.riseSelector));
    var lineHosts = [].slice.call(host.querySelectorAll(opt.lineSelector));
    var lineInners = [];
    lineHosts.forEach(function (h) { lineInners = lineInners.concat(splitLines(h)); });

    function hide() {
      // When GSAP is present, set the hidden state THROUGH gsap so gsap owns the
      // transform channel — otherwise gsap.to({y:0}) doesn't know we started at 12px /
      // 110% and the elements stall mid-rise (same class of bug as mask-up-title).
      if (gsap) {
        risers.forEach(function (el) { el.style.willChange = 'clip-path, transform, opacity';
          gsap.set(el, { clipPath: 'inset(100% 0 0 0)', webkitClipPath: 'inset(100% 0 0 0)', y: 12, scale: 1.04, opacity: 0 }); });
        lineInners.forEach(function (i) { gsap.set(i, { yPercent: 110 }); });
        return;
      }
      risers.forEach(function (el) {
        el.style.willChange = 'clip-path, transform, opacity';
        el.style.clipPath = 'inset(100% 0 0 0)'; el.style.webkitClipPath = 'inset(100% 0 0 0)';
        el.style.transform = 'translateY(12px) scale(1.04)'; el.style.opacity = '0';
      });
      lineInners.forEach(function (i) { i.style.transform = 'translateY(110%)'; });
    }
    function showAll() {
      risers.forEach(function (el) { el.style.clipPath = 'inset(0 0 0 0)'; el.style.webkitClipPath = 'inset(0 0 0 0)'; el.style.transform = 'none'; el.style.opacity = '1'; });
      lineInners.forEach(function (i) { i.style.transform = 'translateY(0)'; });
    }

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      host.classList.add('scr-static'); showAll();
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { static: true, destroy: function () {} };
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

    hide();
    function play() {
      risers.forEach(function (el, i) {
        gsap.to(el, { clipPath: 'inset(0% 0 0 0)', webkitClipPath: 'inset(0% 0 0 0)', y: 0, scale: 1, opacity: 1,
          duration: opt.duration, ease: opt.ease, delay: i * opt.stagger });
      });
      lineInners.forEach(function (inner, i) {
        gsap.to(inner, { yPercent: 0, duration: opt.duration, ease: opt.ease, delay: i * opt.lineStagger });
      });
    }

    var trigger = ScrollTrigger.create({
      trigger: host, start: opt.start, once: opt.once,
      onEnter: play
    });

    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: trigger, lenis: lenis, play: play, hide: hide,
      destroy: function () { trigger && trigger.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.ScrollClipRise = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
