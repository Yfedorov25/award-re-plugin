/* ============================================================================
   depth-stack/component.js — the SHARED FRAME (base engine, no per-frame math)
   ----------------------------------------------------------------------------
   This is the engine-AGNOSTIC scaffolding that BOTH depth variants share:
     · ONE pinned scroll-scrub ScrollTrigger (scrub:0.7) over the stage
     · signed continuous depth: prog = self.progress * (N - 1)  →  d = i - prog
     · honest snap to the N-1 frame slots (step = 1/(N-1), ease "air")
     · the SCROLL-DIRECTION LAW carrier — `end` budget grows with N so the deck
       advances in the SAME direction the wheel pushes (down the page, the V4 fix)
     · an ENTRY ScrollTrigger (start:"top bottom" → "top top", scrub:0.6) that
       hands the first frame in over the hero
     · the reduced-motion matchMedia branch (flat jump between frames, no drama)
     · CustomEase "air" = cubic-bezier(0.25,0.74,0.22,0.99)

   It owns NO per-frame transform math. Each variant ships its OWN engine as a
   base-importing `variants/<name>/variant.js` that supplies the per-frame fns:

     DepthStack.mount(root, {
       n,                          // frame count
       applyFrame(prog){...},      // REQUIRED: paint every frame for continuous prog
       entryFrame(progress){...},  // optional: paint frame 0 over the hero handoff
       updateChrome(prog){...},    // optional: rail / counter / hint
       revealHeadline(active){...},// optional: per-frame headline split-reveal
       reducedFrame(active){...},  // optional: flat paint for one active index
       endMult,                    // pin budget multiplier (deal-fan 0.95 / portal 1.0)
       scrub, entryScrub,          // scrub:0.7 main, 0.6 entry (the shared defaults)
       railFill, railMark          // optional chrome refs, passed back to updateChrome
     })

   Stack: vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase. No WebGL — the
   depth is pure CSS 3D (perspective + preserve-3d), supplied by the variant CSS.
   ========================================================================== */
(function (global) {
  "use strict";

  function ensureAir() {
    if (global.gsap && global.CustomEase && !gsap.parseEase("air")) {
      CustomEase.create("air", "0.25,0.74,0.22,0.99");
    }
  }

  /* The base mounts the shared frame. `root` is the pinned stage element (or a
     selector); `opts.applyFrame` is the variant's per-frame painter. */
  function mount(root, opts) {
    opts = opts || {};
    if (global.gsap && global.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger, global.CustomEase || {});
    }
    ensureAir();

    var stage = typeof root === "string" ? document.querySelector(root) : root;
    if (!stage) return null;

    var N = opts.n || (opts.cards && opts.cards.length) || 0;
    var applyFrame   = opts.applyFrame;                 // REQUIRED
    var entryFrame   = opts.entryFrame   || null;
    var updateChrome = opts.updateChrome || null;
    var revealHead   = opts.revealHeadline || null;
    var reducedFrame = opts.reducedFrame || null;
    var endMult      = (opts.endMult != null) ? opts.endMult : 1.0;
    var scrub        = (opts.scrub   != null) ? opts.scrub   : 0.7;
    var entryScrub   = (opts.entryScrub != null) ? opts.entryScrub : 0.6;
    var airEase      = (global.gsap && gsap.parseEase("air")) || function (x) { return x; };

    if (typeof applyFrame !== "function") {
      console.error("DepthStack.mount: opts.applyFrame(prog) is required");
      return null;
    }

    /* ---- INITIAL STATE: paint the rest frame so nothing flashes ---- */
    applyFrame(0);
    if (updateChrome) updateChrome(0);

    /* ---- ENTRY: hand the first frame in over the hero handoff ----
       Same shape in both engines: a scrub:0.6 ScrollTrigger from "top bottom"
       to "top top" feeding eased progress to the variant's entryFrame. */
    if (entryFrame) {
      ScrollTrigger.create({
        trigger: stage,
        start: "top bottom",
        end: "top top",
        scrub: entryScrub,
        onUpdate: function (self) {
          entryFrame(self.progress, airEase(self.progress));
          if (revealHead && self.progress > 0.55) revealHead(0);
        }
      });
    }

    /* ---- MAIN PINNED RELAY (no-preference) ---- */
    var mm = gsap.matchMedia();
    var controller = { kill: function () {}, refresh: function () { ScrollTrigger.refresh(); } };

    mm.add("(prefers-reduced-motion: no-preference)", function () {
      var st = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: function () { return "+=" + (window.innerHeight * N * endMult); },
        pin: true,
        scrub: scrub,
        snap: {
          snapTo: function (value) {
            var step = 1 / (N - 1);
            return Math.round(value / step) * step;
          },
          duration: { min: 0.18, max: 0.5 },
          ease: "air",
          inertia: false
        },
        onUpdate: function (self) {
          var prog = self.progress * (N - 1);   // 0..N-1 — grows as you scroll DOWN
          applyFrame(prog);
          if (updateChrome) updateChrome(prog);
          if (revealHead) revealHead(Math.round(prog));
        }
      });
      controller.kill = function () { st.kill(); };
      return function () { st.kill(); };
    });

    /* ---- reduced-motion: static, jump between frames, no depth drama ---- */
    mm.add("(prefers-reduced-motion: reduce)", function () {
      if (reducedFrame) reducedFrame(0);
      else applyFrame(0);
      if (updateChrome) updateChrome(0);
      var st = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: function () { return "+=" + (window.innerHeight * N); },
        pin: true,
        scrub: false,
        snap: 1 / (N - 1),
        onUpdate: function (self) {
          var a = Math.round(self.progress * (N - 1));
          if (reducedFrame) reducedFrame(a); else applyFrame(a);
          if (updateChrome) updateChrome(a);
          if (revealHead) revealHead(a);
        }
      });
      controller.kill = function () { st.kill(); };
      return function () { st.kill(); };
    });

    window.addEventListener("resize", function () { ScrollTrigger.refresh(); });

    controller.airEase = airEase;
    controller.n = N;
    return controller;
  }

  global.DepthStack = { mount: mount, ensureAir: ensureAir };
})(typeof window !== "undefined" ? window : this);
