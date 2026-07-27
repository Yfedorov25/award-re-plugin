/* ============================================================
   SECTION-RISE-INTO-VIEW · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   crownd/finest's section entrance — a whole full-bleed MEDIA BLOCK rises up from below
   (translateY riseY -> 0) and fades in (0 -> 1) as it scrolls into view, ONCE, power3.out,
   with a hair of scale-settle. The simplest, lightest "rise": the WHOLE block moves as one,
   no per-element masking, no cover, no pin. Harvested from D_finest (F4: a full-bleed media
   block rises into view on the warm-paper page).

   DISTINCT from the two rise-cousins (RECIPE marks this):
   - scroll-clip-rise (Saisei): each ELEMENT rises from a bottom CLIP-MASK (image column +
     text LINE BY LINE). Element-level masked reveal.
   - panel-rise-over (11tanjung): a coloured PANEL slides OVER the previous section + theme-flip
     + rounded top, PINNED. A cover transition.
   - section-rise-into-view (this): the WHOLE block translateY+fade on enter. No mask, no cover,
     no theme-flip, no pin. The lightest of the three.

   THE MOVE: on enter (start ~'top 85%') each [data-rise-block] (or the target) plays once:
   opacity 0 -> 1 + translateY riseY -> 0 (+ optional scale 0.98 -> 1), power3.out, with an
   optional per-block stagger when there are several. set(p) is a PURE scrub for previews.

   CONFIG-DRIVEN:
     SectionRiseIntoView.create(target, {     // target wraps one/more [data-rise-block]
       riseY: 80, scaleFrom: 1, duration: 1.0, stagger: 0.12,
       ease: 'power3.out', start: 'top 85%', once: true, manageLenis: true
     })
   Markup: .sriv-stage > [data-rise-block] x N (each a full-bleed media block / section).
   Returns { triggers, set(p), play(), destroy }.

   ENGINE LAWS: transform(translateY, scale) + opacity only; GPU; NO clip-mask, NO mix-blend,
   NO WebGL; reduced-motion / <=820px -> shown. Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      riseY: options.riseY != null ? options.riseY : 80,
      scaleFrom: options.scaleFrom != null ? options.scaleFrom : 1,
      duration: options.duration != null ? options.duration : 1.0,
      stagger: options.stagger != null ? options.stagger : 0.12,
      ease: options.ease || 'power3.out',
      start: options.start || 'top 85%',
      once: options.once !== false,
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var blocks = [].slice.call(stage.querySelectorAll('[data-rise-block]'));
    if (!blocks.length) blocks = [stage];
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
    function efOut(t) { return opt.ease === 'expo.out' ? (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) : 1 - Math.pow(1 - t, 3); }

    // p 0 = below + invisible; p 1 = seated. Applies to ALL blocks (preview); per-block
    // staggered play is handled in the triggers below.
    function applyTo(el, p) {
      p = clamp01(p); var e = efOut(p);
      el.style.opacity = e.toFixed(3);
      var sc = opt.scaleFrom + (1 - opt.scaleFrom) * e;
      el.style.transform = 'translateY(' + ((1 - e) * opt.riseY).toFixed(1) + 'px) scale(' + sc.toFixed(4) + ')';
    }
    function set(p) { blocks.forEach(function (b) { applyTo(b, p); }); }
    set(0);

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      stage.classList.add('sriv-static'); set(1);
      try { global.__LAB_OK__ = true; } catch (e) {}
      return { static: true, set: set, play: function () { set(1); }, destroy: function () {} };
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

    var triggers = blocks.map(function (b, i) {
      var played = false;
      return ScrollTrigger.create({
        trigger: b, start: opt.start,
        onEnter: function () {
          if (played && opt.once) return; played = true;
          var o = { p: 0 };
          gsap.to(o, { p: 1, duration: opt.duration, delay: i * opt.stagger, ease: 'none',
            onUpdate: function () { applyTo(b, o.p); } });
        },
        onLeaveBack: opt.once ? null : function () { played = false; applyTo(b, 0); }
      });
    });
    set(0);

    global.addEventListener('resize', function () { ScrollTrigger.refresh(); });
    stage.classList.add('sriv-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      triggers: triggers, lenis: lenis, set: set, play: function () { set(1); },
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { triggers.forEach(function (t) { t.kill(); }); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.SectionRiseIntoView = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
