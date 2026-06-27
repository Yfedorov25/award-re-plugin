/* ============================================================
   SCROLL-ZOOM-IMAGE-PAIR · component.js  (vanilla + GSAP 3.12.5 + ScrollTrigger
   + guarded Lenis 1.1.13)
   ------------------------------------------------------------
   crownd/finest's editorial pair — a portrait RENDER in a fixed clipping FRAME on one side
   + a serif HEADING/body on the other. As the section passes through the viewport the image
   SCALES UP within its frame (a scroll-scrubbed Ken-Burns bound to the frame: the frame clips,
   the image grows ~1.0 -> ~1.14) while the copy holds. The copy optionally rises in once on
   enter. Harvested from D_finest (F3: "Architektur vom Allerfeinsten" render + copy, render
   zooms on scroll).

   Distinct from a bare hero Ken-Burns: here the zoom is BOUND TO A FRAME (overflow clip) and
   paired L/R with held editorial copy — a section block, not a full-bleed hero.

   THE MOVE:
     - scroll scrub over the section's pass through the viewport (start 'top bottom', end
       'bottom top'); the image scale = zoomFrom + p*(zoomTo-zoomFrom). Optional subtle
       translateY drift for parallax.
     - the copy [data-zoomcopy] reveals ONCE on enter (opacity + translateY), power3.out.
   set(p) is a PURE scrub of the zoom.

   CONFIG-DRIVEN:
     ScrollZoomImagePair.create(target, {     // target = .szp-stage
       zoomFrom: 1.0, zoomTo: 1.14, drift: 0, ease: 'none',
       revealCopy: true, start: 'top bottom', end: 'bottom top', manageLenis: true
     })
   Markup: .szp-stage > .szp-figure(.szp-frame > img) + .szp-copy([data-zoomcopy]). Add
   .szp--rtl to swap sides. Returns { trigger, set(p), destroy }.

   ENGINE LAWS: transform scale/translateY (the image) + opacity/translateY (copy reveal) +
   overflow clip (the frame) only; GPU; NO mix-blend / NO backdrop; NO WebGL; reduced-motion /
   <=820px -> static (image at zoomFrom, copy shown). Sets window.__LAB_OK__.
   ============================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function create(target, options) {
    options = options || {};
    var opt = {
      zoomFrom: options.zoomFrom != null ? options.zoomFrom : 1.0,
      zoomTo: options.zoomTo != null ? options.zoomTo : 1.14,
      drift: options.drift != null ? options.drift : 0,
      ease: options.ease || 'none',
      revealCopy: options.revealCopy !== false,
      start: options.start || 'top bottom',
      end: options.end || 'bottom top',
      manageLenis: options.manageLenis !== false
    };
    var stage = typeof target === 'string' ? doc.querySelector(target) : target;
    if (!stage) { try { global.__LAB_OK__ = true; } catch (e) {} return { error: 'no target' }; }

    var img = stage.querySelector('.szp-frame img') || stage.querySelector('.szp-frame > *');
    var copy = stage.querySelector('[data-zoomcopy]');
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, Lenis = global.Lenis;
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var narrow = global.matchMedia && global.matchMedia('(max-width: 820px)').matches;

    function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

    function apply(p) {
      p = clamp01(p);
      if (img) {
        var sc = opt.zoomFrom + p * (opt.zoomTo - opt.zoomFrom);
        var ty = opt.drift ? (p - 0.5) * 2 * opt.drift : 0;
        img.style.transform = 'translateY(' + ty.toFixed(1) + 'px) scale(' + sc.toFixed(4) + ')';
      }
    }
    function showCopy(on) {
      if (!copy) return;
      copy.style.opacity = on ? '1' : '0';
      copy.style.transform = on ? 'translateY(0)' : 'translateY(26px)';
    }
    apply(0); if (opt.revealCopy) showCopy(false); else showCopy(true);

    if (reduced || narrow || !gsap || !ScrollTrigger) {
      stage.classList.add('szp-static'); apply(0); showCopy(true);
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

    // the zoom scrubs across the whole pass of the section through the viewport
    var scrub = ScrollTrigger.create({
      trigger: stage, start: opt.start, end: opt.end, scrub: true,
      onUpdate: function (self) { apply(self.progress); }
    });
    // the copy reveals once when the section is comfortably in view
    var played = false;
    var reveal = opt.revealCopy ? ScrollTrigger.create({
      trigger: stage, start: 'top 72%',
      onEnter: function () {
        if (played) return; played = true;
        if (copy) {
          copy.style.transition = 'opacity .9s cubic-bezier(.22,1,.36,1), transform .9s cubic-bezier(.22,1,.36,1)';
          showCopy(true);
        }
      }
    }) : null;
    apply(0);

    global.addEventListener('resize', function () { ScrollTrigger.refresh(); });
    stage.classList.add('szp-ready');
    try { global.__LAB_OK__ = true; } catch (e) {}
    return {
      trigger: scrub, reveal: reveal, lenis: lenis, set: apply,
      refresh: function () { ScrollTrigger.refresh(); },
      destroy: function () { scrub && scrub.kill(); reveal && reveal.kill(); if (lenis) lenis.destroy(); }
    };
  }

  var api = { create: create };
  global.ScrollZoomImagePair = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
