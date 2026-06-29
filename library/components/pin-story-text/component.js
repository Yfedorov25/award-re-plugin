/* ============================================================================
   PIN-STORY-TEXT · component.js   (IIFE -> window.PinStoryText)
   ----------------------------------------------------------------------------
   A PINNED SCROLL-LOCK TEXT SEQUENCER. The section pins (pin:true,
   pinSpacing:true). As the visitor scrolls, a sequence of text BLOCKS arrives
   ONE AT A TIME in a clean, considered composition: block 1 settles, HOLDS,
   then leaves (rises + fades out) as block 2 enters (rises + fades in). NEVER
   two blocks overlapping, NEVER a bulky full-screen wall.

   BACKGROUND-AGNOSTIC: it owns the pin + the text story, NOT the media. Drop it
   over any render / video / colour field. (Distinct from media-step-switch,
   which couples its OWN two media layers.)

   API
     window.PinStoryText.create(target, {
       blocks: [
         { eyebrow, title, body, align:'left'|'center'|'lower-left', at:0..1 },
         ...
       ],
       end: '+=160%',     // pin length
       scrub: 1,          // ScrollTrigger scrub
       hold: 0.5,         // 0..1 fraction of a block's window it sits fully settled
       ease: 'air',       // named ease (CustomEase 'air' or any gsap ease)
       manageLenis: false // if true, drive its own Lenis -> gsap.ticker -> ST.update
     }) -> { set(p), trigger, destroy }

   ENGINE LAWS: motion ONLY transform(translateY) + opacity. NO width/height/
   top/left, NO mix-blend, NO backdrop-filter, NO WebGL. set(p) is a PURE fn of
   progress (idempotent, reverse-safe). owns_pin:true (exactly ONE pinned
   ScrollTrigger). reduced-motion -> a static stacked list of the blocks, no pin.
   Sets window.__LAB_OK__ once wired (or on the reduced-motion static branch).
   ============================================================================ */
(function (global) {
  'use strict';
  var doc = global.document;

  function asEl(t) { return typeof t === 'string' ? doc.querySelector(t) : t; }
  function reduced() {
    return global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function narrow() {
    return global.matchMedia && global.matchMedia('(max-width: 720px)').matches;
  }

  // build one text block element from a spec
  function buildBlock(b) {
    var el = doc.createElement('article');
    el.className = 'pst__block pst__block--' + (b.align || 'left');
    if (b.eyebrow) {
      var e = doc.createElement('span');
      e.className = 'pst__eyebrow';
      e.textContent = b.eyebrow;
      el.appendChild(e);
    }
    if (b.title) {
      var h = doc.createElement('h2');
      h.className = 'pst__title';
      h.innerHTML = b.title; // allow <em> emphasis only (authored, trusted copy)
      el.appendChild(h);
    }
    if (b.body) {
      var p = doc.createElement('p');
      p.className = 'pst__body';
      p.textContent = b.body;
      el.appendChild(p);
    }
    return el;
  }

  function create(target, options) {
    options = options || {};
    var host = asEl(target);
    if (!host) throw new Error('PinStoryText: target not found');

    var blocks = options.blocks || [];
    var endStr = options.end || '+=160%';
    var scrub = options.scrub != null ? options.scrub : 1;
    var hold = options.hold != null ? options.hold : 0.5;   // settled fraction of each window
    var easeName = options.ease || 'air';
    var manageLenis = !!options.manageLenis;

    var gsap = global.gsap;
    var ST = global.ScrollTrigger;

    host.classList.add('pst');

    // ---- reduced-motion / narrow -> a static stacked list, NO pin ----
    if (reduced() || !gsap || !ST) {
      host.classList.add('pst--static');
      var deck = doc.createElement('div');
      deck.className = 'pst__deck';
      blocks.forEach(function (b) {
        var el = buildBlock(b);
        el.classList.add('pst__block--shown');
        deck.appendChild(el);
      });
      host.appendChild(deck);
      try { global.__LAB_OK__ = true; } catch (e) {}
      return {
        set: function () {},
        trigger: null,
        destroy: function () { try { host.removeChild(deck); } catch (e) {} }
      };
    }

    // register ease + plugin (idempotent)
    try { if (gsap.registerPlugin) gsap.registerPlugin(ST); } catch (e) {}
    if (global.CustomEase && gsap.registerPlugin) { try { gsap.registerPlugin(global.CustomEase); } catch (e) {} }
    if (global.CustomEase && gsap.parseEase && !gsap.parseEase('air')) {
      try { global.CustomEase.create('air', '0.22,1,0.36,1'); } catch (e) {}
    }
    var ease = (gsap.parseEase && gsap.parseEase(easeName)) || (gsap.parseEase && gsap.parseEase('power3.out')) || function (t) { return 1 - Math.pow(1 - t, 3); };

    // ---- build the stage: a fixed-rect text layer holding the stacked blocks ----
    var stage = doc.createElement('div');
    stage.className = 'pst__stage';
    var els = blocks.map(function (b, i) {
      var el = buildBlock(b);
      el.setAttribute('data-pst-i', String(i));
      // explicit window centre on the timeline; default = even distribution
      el.__at = (b.at != null) ? b.at : ((i + 0.5) / blocks.length);
      stage.appendChild(el);
      return el;
    });
    host.appendChild(stage);

    var n = els.length;
    var winW = 1 / Math.max(1, n);     // each block owns this slice of progress
    var ENTER = 28;                    // px rise on enter
    var EXIT = -34;                    // px rise on exit (leaves upward)

    // PURE set(p): map progress -> the single active block; transition with
    // transform + opacity only. No DOM reads, idempotent, reverse-safe.
    function set(p) {
      p = p < 0 ? 0 : (p > 1 ? 1 : p);
      for (var i = 0; i < n; i++) {
        var el = els[i];
        var c = el.__at;                       // window centre
        // local phase of this block: -inf..+inf around its centre, normalised by winW
        var d = (p - c) / winW;                // 0 at centre, -1 = one window before, +1 after
        // settled plateau: within +-hold/... of centre the block is fully shown
        var plateau = hold;                    // half-width (in window units) of the fully-settled zone
        var ad = Math.abs(d);
        var opacity, y;
        if (ad <= plateau) {
          opacity = 1; y = 0;                  // SETTLED — holds, alone, on stage
        } else {
          // transition zone: ramp from edge of plateau out to +-1 (then gone)
          var t = (ad - plateau) / (1 - plateau);  // 0..1 across the transition
          if (t > 1) t = 1;
          var k = 1 - ease(t);                 // 1 settled -> 0 gone
          opacity = k;
          // incoming (d<0) rises from +ENTER; outgoing (d>0) leaves toward EXIT
          y = (d < 0 ? ENTER : EXIT) * (1 - k);
        }
        // write only transform + opacity (GPU); guard against undecoded media (none here)
        el.style.opacity = opacity.toFixed(3);
        el.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
        // keep fully-hidden blocks out of the a11y tree + pointer path
        el.style.visibility = opacity < 0.01 ? 'hidden' : 'visible';
      }
    }

    // prime
    els.forEach(function (el) { el.style.willChange = 'transform, opacity'; });
    set(0);

    // ---- the ONE pinned ScrollTrigger (owns_pin:true) ----
    var trigger = ST.create({
      trigger: host,
      start: 'top top',
      end: endStr,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      scrub: scrub,
      onUpdate: function (self) { set(self.progress); },
      onRefresh: function (self) { set(self.progress); }
    });

    // optional self-managed Lenis (off by default so a host page owns the smoother)
    var lenis = null;
    if (manageLenis && global.Lenis) {
      try {
        lenis = new global.Lenis({ lerp: 0.09 });
        gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
        gsap.ticker.lagSmoothing(0);
        lenis.on('scroll', ST.update);
      } catch (e) { lenis = null; }
    }

    // settle will-change after first paint of the settled state (one-shot hint clear
    // is unsafe while scrubbing; keep it — scrub keeps these compositor layers hot).

    try { global.__LAB_OK__ = true; } catch (e) {}

    return {
      set: set,
      trigger: trigger,
      destroy: function () {
        try { trigger.kill(); } catch (e) {}
        try { host.removeChild(stage); } catch (e) {}
        if (lenis && lenis.destroy) { try { lenis.destroy(); } catch (e) {} }
        els.forEach(function (el) { el.style.willChange = ''; });
      }
    };
  }

  var api = { create: create };
  global.PinStoryText = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
