/* ============================================================
   COMPONENT — slide-out-img-text  ("deck-fan reveal")
   ------------------------------------------------------------
   A pinned, scrubbed section. Cards start STACKED dead-centre
   (overlapped, rotated) behind a big serif headline. As the user
   scrolls, the cards fan OUT to four corner anchors (de-rotating,
   slightly de-scaling) while the centre headline + ghost text
   crossfade to a second caption and a CTA + scroll-dot appear.

   Requires (load before this file):
     - gsap 3.12.5
     - ScrollTrigger
     - CustomEase
   Self-contained: call SlideOutImgText.init(root, opts).
   ============================================================ */
(function (global) {
  "use strict";

  // single shared ease, registered once
  let SOFI_AIR = null;
  function ensureEase() {
    if (SOFI_AIR) return SOFI_AIR;
    if (global.CustomEase) {
      SOFI_AIR = CustomEase.create("sofiAir", "M0,0 C0.22,0.68 0.16,0.99 1,1");
    } else {
      SOFI_AIR = "power3.out";
    }
    return SOFI_AIR;
  }

  /* Default four-corner layout. Each entry is the END position of a
     card, expressed as a fraction of half the stage (so 0.9 = near
     the edge). JS multiplies by stage half-width/height at runtime so
     it stays responsive. rot/scl are absolute end values.
     Order matters: cards[i] gets layout[i]. */
  const DEFAULT_LAYOUT = [
    { fx: -0.74, fy: -0.36, rot: 0, scl: 0.86 }, // top-left
    { fx:  0.74, fy: -0.40, rot: 0, scl: 0.78 }, // top-right
    { fx: -0.70, fy:  0.40, rot: 0, scl: 0.80 }, // bottom-left
    { fx:  0.72, fy:  0.42, rot: 0, scl: 0.82 }  // bottom-right
  ];

  /* Start state — the stacked deck. Small fan of rotations so the
     stack reads as a hand of cards, not one flat plate. */
  const DEFAULT_START = [
    { tx: -14, ty: 0,  rot: -7, scl: 0.96 },
    { tx:  18, ty: -6, rot:  6, scl: 0.92 },
    { tx:  -6, ty: 10, rot: -3, scl: 0.98 },
    { tx:  10, ty: 4,  rot:  4, scl: 0.94 }
  ];

  function init(root, opts) {
    opts = opts || {};
    if (typeof root === "string") root = document.querySelector(root);
    if (!root) return;
    if (!global.gsap || !global.ScrollTrigger) {
      console.warn("[slide-out-img-text] gsap + ScrollTrigger required");
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const ease = ensureEase();
    const reduce = global.matchMedia &&
      matchMedia("(prefers-reduced-motion:reduce)").matches;
    const isMobile = matchMedia("(max-width:760px)").matches;

    const stage  = root.querySelector(".sofi__stage");
    const cards  = gsap.utils.toArray(root.querySelectorAll(".sofi__card"));
    const imgs   = cards.map(c => c.querySelector("img"));
    const capA   = root.querySelector(".sofi__cap-a");
    const capB   = root.querySelector(".sofi__cap-b");
    const ghostL = root.querySelector(".sofi__ghost-letter");
    const ghostW = root.querySelector(".sofi__ghost-word");
    const dot    = root.querySelector(".sofi__dot");

    const layout = opts.layout || DEFAULT_LAYOUT;
    const start  = opts.start  || DEFAULT_START;
    const travel = opts.travel != null ? opts.travel : 1;     // 0..1 dampener
    const scrub  = opts.scrub  != null ? opts.scrub  : 1;     // smoothing
    const endVH  = opts.endVH  || 130;                        // pin length %

    // compute corner pixel offsets from fractions of the stage half-box
    function targetFor(i) {
      const half = { w: stage.clientWidth / 2, h: stage.clientHeight / 2 };
      const L = layout[i % layout.length];
      // leave a margin so cards don't clip the edges
      const margin = 0.92 * travel;
      return {
        tx: L.fx * half.w * margin,
        ty: L.fy * half.h * margin,
        rot: isMobile ? 0 : L.rot,
        scl: L.scl
      };
    }

    // ---- place cards in the STACKED start state ----
    cards.forEach((card, i) => {
      const s = start[i % start.length];
      gsap.set(card, { "--tx": s.tx + "px", "--ty": s.ty + "px",
                       "--rot": (isMobile ? 0 : s.rot) + "deg", "--scl": s.scl });
    });
    gsap.set(capB, { autoAlpha: 0, y: 18 });
    gsap.set(ghostW, { autoAlpha: 0 });
    gsap.set(dot, { autoAlpha: 0 });

    // ---- reduced motion: jump straight to the end (fanned) state ----
    if (reduce) {
      cards.forEach((card, i) => {
        const t = targetFor(i);
        gsap.set(card, { "--tx": t.tx + "px", "--ty": t.ty + "px",
                         "--rot": t.rot + "deg", "--scl": t.scl });
      });
      gsap.set(capA, { autoAlpha: 0 });
      gsap.set(capB, { autoAlpha: 1, y: 0 });
      gsap.set(ghostL, { autoAlpha: 0 });
      gsap.set(ghostW, { autoAlpha: 0.06 });
      gsap.set(dot, { autoAlpha: 1 });
      return;
    }

    // ---- the pinned, scrubbed timeline ----
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: "+=" + endVH + "%",
        pin: true,
        scrub: scrub,
        anticipatePin: 1,
        invalidateOnRefresh: true   // recompute targets on resize
      }
    });

    // Phase 1 (0 → 0.6): cards fan out to corners, de-rotate, de-scale.
    // Stagger gives the "dealt out one by one" feel from the frames.
    cards.forEach((card, i) => {
      tl.to(card, {
        // function-based so resize recomputes via invalidateOnRefresh
        "--tx": () => targetFor(i).tx + "px",
        "--ty": () => targetFor(i).ty + "px",
        "--rot": () => targetFor(i).rot + "deg",
        "--scl": () => targetFor(i).scl,
        ease: ease,
        duration: 0.6
      }, 0 + i * 0.05);             // <- the deal-out stagger
    });

    // gentle inner-image counter-parallax for depth while they travel
    imgs.forEach((img, i) => {
      tl.fromTo(img, { scale: 1.12 }, { scale: 1, ease: ease, duration: 0.6 }, 0 + i * 0.05);
    });

    // Phase 2 (0.35 → 0.75): headline crossfade in place.
    tl.to(capA, { autoAlpha: 0, y: -14, ease: "none", duration: 0.25 }, 0.35);
    tl.fromTo(capB, { autoAlpha: 0, y: 18 },
                    { autoAlpha: 1, y: 0, ease: ease, duration: 0.35 }, 0.5);

    // Phase 2b: ghost letter dims out, ghost word fades up underneath.
    tl.to(ghostL, { autoAlpha: 0, ease: "none", duration: 0.4 }, 0.3);
    tl.to(ghostW, { autoAlpha: 0.06, ease: "none", duration: 0.4 }, 0.45);

    // Phase 3 (0.8 → 1): scroll-dot breathes in as the section settles.
    tl.to(dot, { autoAlpha: 1, ease: ease, duration: 0.2 }, 0.82);

    // keep targets correct across breakpoint flips
    let rT;
    global.addEventListener("resize", () => {
      clearTimeout(rT);
      rT = setTimeout(() => ScrollTrigger.refresh(), 200);
    });
  }

  global.SlideOutImgText = { init: init, DEFAULT_LAYOUT, DEFAULT_START };
})(window);
