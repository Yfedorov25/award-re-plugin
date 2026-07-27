/* ============================================================
   COMPONENT — slide-out-img-text   ("slide-out deck handoff")
   ------------------------------------------------------------
   TRUE 1:1 of the ZERA STUDIO portfolio handoff, NAHIRNA voice.
   ONE pinned, scroll-scrubbed timeline drives the FULL 7-PHASE
   choreography (the old build only did the middle fan-out beat
   and used the wrong "air" ease):

     P1 0.00->0.12  DRAWER HANDOFF  prior plate slides UP+out,
                    stage crossfades light->black, rim/ghost fade
                    in, deck pre-staged COLLAPSED dead-centre.
     P2 0.12->0.26  HERO BEAT       centre portrait card rises
                    forward (scl .92->1, alpha .85->1), inner
                    img counter-parallax 1.12->1.0.
     P3 0.26->0.52  SLIDE-OUT       3 siblings deal OUT toward the
                    corners on straight diagonals (staggered),
                    hero drifts ~60% toward its TL anchor.
     P4 0.52->0.66  LOCK+OVERSHOOT  all 4 snap to corner anchors,
                    scale settles with back.out(1.4); ghost
                    state A -> state B crossfade.
     P5 0.66->0.82  CENTRE REVEAL   headline (y+24->0), rule
                    draws scaleX 0->1, CTA + scroll-dot fade in.
     P6 0.82->0.90  HOLD / READ     climax dwell, micro-parallax
                    only (cards ±, ghost ±).
     P7 0.90->1.00  EXIT / NEXT     whole pinned wrap translates
                    UP and out, next section rises in below.

   The ONE ease is the easeOutQuad-family "slideOut"
   (0.22,1,0.36,1 — fast-out, long-settle). "reveal" is the same
   family for the headline/rule; back.out(1.4) is scale-only at
   the P4 lock; ghost crossfades ride the scrub (ease:"none").

   Requires (load before this file):
     - gsap 3.12.5  - ScrollTrigger  - CustomEase
     - Lenis (optional; guarded)
   Self-contained: call SlideOutImgText.init(root, opts).

   NON-NEGOTIABLES
     - transform / opacity / clip-path ONLY. Never left/top/width.
     - Never scrub video.currentTime (no video here). max 2 decoders.
     - prefers-reduced-motion -> jump to settled climax, no scrub/pin.
     - will-change:transform on cards + inner imgs only.
     - ScrollTrigger.refresh() after height-affecting changes (D16).
   ============================================================ */
(function (global) {
  "use strict";

  /* ----- config: corner anchors as FRACTIONS of the stage half-box.
     fx/fy: -1 = full left/top edge, +1 = full right/bottom edge.
     keyed by data-role so card order in the DOM is free. ----- */
  var DEFAULT_CONFIG = {
    anchors: {
      hero: { fx: -0.66, fy: -0.50, scl: 1.00 },  // TL, largest (tall)
      tr:   { fx:  0.62, fy: -0.58, scl: 0.92 },  // TR (wide)
      bl:   { fx: -0.58, fy:  0.60, scl: 0.90 },  // BL (port)
      br:   { fx:  0.60, fy:  0.58, scl: 0.92 }   // BR (wide)
    },
    /* per-card progress offset for the deal-out stagger (TR, BL, BR) */
    stagger: { tr: 0.00, bl: 0.06, br: 0.12 },

    scrub: 1,
    endVH: 220,        // pin length % of viewport (7 phases need room)
    innerZoom: 1.12,
    ghostWmPeak: 0.22, // state A wordmark peak
    ghostWm2Peak: 0.10,// state B wordmark peak
    rimPeak: 0.13
  };

  function deepMerge(base, over) {
    var out = {};
    for (var k in base) out[k] = base[k];
    if (!over) return out;
    for (var j in over) {
      if (over[j] && typeof over[j] === "object" && !Array.isArray(over[j])) {
        out[j] = deepMerge(base[j] || {}, over[j]);
      } else {
        out[j] = over[j];
      }
    }
    return out;
  }

  function init(root, opts) {
    if (typeof root === "string") root = document.querySelector(root);
    if (!root) return;
    if (!global.gsap || !global.ScrollTrigger) {
      console.warn("[slide-out-img-text] gsap + ScrollTrigger required");
      return;
    }
    var CONFIG = deepMerge(DEFAULT_CONFIG, opts);

    gsap.registerPlugin(ScrollTrigger);

    /* the ONE site ease: easeOutQuad family. "reveal" is the same
       family; both registered once, guarded if CustomEase missing. */
    var E_SLIDE  = global.CustomEase
      ? CustomEase.create("slideOut", "0.22,1,0.36,1") : "power2.out";
    var E_REVEAL = global.CustomEase
      ? CustomEase.create("reveal", "0.25,1,0.3,1") : "power2.out";

    var reduce = global.matchMedia &&
      matchMedia("(prefers-reduced-motion:reduce)").matches;
    var isMobile = function () { return matchMedia("(max-width:760px)").matches; };

    var stage = root.querySelector(".sofi__stage");
    var cardEls = {
      hero: root.querySelector('[data-role="hero"]'),
      tr:   root.querySelector('[data-role="tr"]'),
      bl:   root.querySelector('[data-role="bl"]'),
      br:   root.querySelector('[data-role="br"]')
    };
    var order = ["hero", "tr", "bl", "br"];
    var innerImgs = order.map(function (r) {
      return cardEls[r] ? cardEls[r].querySelector("img") : null;
    });

    var q = function (sel) { return root.querySelector(sel); };

    /* Half-box of the stage -> turns fractions into px target offsets. */
    function halfBox() {
      var r = stage.getBoundingClientRect();
      var pad = Math.min(r.width, r.height) * 0.18;
      return { hx: r.width / 2 - pad, hy: r.height / 2 - pad };
    }
    function anchorPx(role) {
      var a = CONFIG.anchors[role];
      var b = halfBox();
      var mob = isMobile();
      var fx = mob ? Math.sign(a.fx) * 0.5 : a.fx;   // mobile: tighter 2x2
      var fy = mob ? Math.sign(a.fy) * 0.62 : a.fy;
      return { tx: fx * b.hx, ty: fy * b.hy, scl: a.scl };
    }

    /* ---- START pose: all cards collapsed dead-centre ---- */
    function setStart() {
      gsap.set(cardEls.hero, { "--tx": "0px", "--ty": "0px", "--scl": 0.92, autoAlpha: 0.85 });
      gsap.set([cardEls.tr, cardEls.bl, cardEls.br], { "--tx": "0px", "--ty": "0px", "--scl": 0.85, autoAlpha: 0.30 });
      gsap.set(innerImgs, { scale: CONFIG.innerZoom });
    }
    setStart();

    /* ============================================================
       REDUCED MOTION: jump straight to the settled climax (P5/P6)
       ============================================================ */
    if (reduce) {
      order.forEach(function (role) {
        var t = anchorPx(role);
        gsap.set(cardEls[role], { "--tx": t.tx + "px", "--ty": t.ty + "px", "--scl": t.scl, autoAlpha: 1 });
      });
      gsap.set(innerImgs, { scale: 1 });
      gsap.set(q("#drawer") || ".sofi__drawer", { y: "-110%", autoAlpha: 0 });
      gsap.set(q("#bgLight") || ".sofi__bg-light", { autoAlpha: 0 });
      gsap.set(root.querySelectorAll(".sofi__rim"), { opacity: CONFIG.rimPeak * 0.7 });
      gsap.set(q(".sofi__ghost-letter"), { autoAlpha: 0 });
      gsap.set(q(".sofi__ghost-wm"), { opacity: 0 });
      gsap.set(q(".sofi__ghost-wm2"), { opacity: CONFIG.ghostWm2Peak });
      gsap.set([q(".sofi__center h2"), q(".sofi__cta-wrap")], { autoAlpha: 1, y: 0 });
      gsap.set(q(".sofi__rule"), { scaleX: 1 });
      gsap.set(q(".sofi__dot"), { autoAlpha: 1 });
      return;
    }

    /* ----------------------------------------------------------
       ONE pinned, scrubbed timeline. progress 0..1 == scroll.
       ---------------------------------------------------------- */
    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: "+=" + CONFIG.endVH + "%",
        pin: true,
        scrub: CONFIG.scrub,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });

    var drawer    = q(".sofi__drawer");
    var bgLight   = q(".sofi__bg-light");
    var rims      = root.querySelectorAll(".sofi__rim");
    var ghostL    = q(".sofi__ghost-letter");
    var ghostWm   = q(".sofi__ghost-wm");
    var ghostWm2  = q(".sofi__ghost-wm2");
    var headline  = q(".sofi__center h2");
    var ctaWrap   = q(".sofi__cta-wrap");
    var rule      = q(".sofi__rule");
    var cta       = q(".sofi__cta");
    var dot       = q(".sofi__dot");
    var center    = q(".sofi__center");

    /* ===== P1 0.00->0.12 — DRAWER HANDOFF ===== */
    tl.to(drawer,  { y: "-110%", autoAlpha: 0, duration: 0.12, ease: E_SLIDE }, 0.00);
    tl.to(bgLight, { autoAlpha: 0, duration: 0.12 }, 0.00);
    tl.to(rims,    { opacity: CONFIG.rimPeak, duration: 0.12 }, 0.00);
    tl.to(ghostL,  { autoAlpha: 0.10, duration: 0.12 }, 0.00);
    tl.fromTo(ghostWm, { opacity: 0, scale: 1.0 }, { opacity: CONFIG.ghostWmPeak, duration: 0.12 }, 0.00);
    tl.to(cardEls.hero, { autoAlpha: 0.92, duration: 0.12, ease: E_SLIDE }, 0.00);

    /* ===== P2 0.12->0.26 — HERO BEAT ===== */
    tl.to(cardEls.hero, { "--scl": 1.0, autoAlpha: 1.0, duration: 0.14, ease: E_SLIDE }, 0.12);
    tl.fromTo(innerImgs[0], { scale: CONFIG.innerZoom }, { scale: 1.0, duration: 0.14, ease: E_SLIDE }, 0.12);
    tl.to(ghostWm, { opacity: 0.12, scale: 1.04, duration: 0.14 }, 0.12);

    /* ===== P3 0.26->0.52 — SLIDE-OUT (siblings deal toward corners) ===== */
    ["tr", "bl", "br"].forEach(function (role) {
      var at = 0.26 + CONFIG.stagger[role];
      var card = cardEls[role];
      var idx = order.indexOf(role);
      tl.to(card, {
        "--tx": function () { return anchorPx(role).tx + "px"; },
        "--ty": function () { return anchorPx(role).ty + "px"; },
        "--scl": 0.95,
        autoAlpha: 0.85,
        duration: 0.22, ease: E_SLIDE
      }, at);
      tl.fromTo(innerImgs[idx], { scale: CONFIG.innerZoom }, { scale: 1.0, duration: 0.22, ease: E_SLIDE }, at);
    });
    // hero drifts ~60% toward its TL anchor (finishes in P4)
    tl.to(cardEls.hero, {
      "--tx": function () { return anchorPx("hero").tx * 0.6 + "px"; },
      "--ty": function () { return anchorPx("hero").ty * 0.6 + "px"; },
      duration: 0.26, ease: E_SLIDE
    }, 0.26);
    tl.to(ghostWm, { opacity: 0.04, duration: 0.26 }, 0.26);

    /* ===== P4 0.52->0.66 — LOCK to corners (overshoot scale settle) ===== */
    ["tr", "bl", "br"].forEach(function (role) {
      var card = cardEls[role];
      tl.to(card, {
        "--tx": function () { return anchorPx(role).tx + "px"; },
        "--ty": function () { return anchorPx(role).ty + "px"; },
        autoAlpha: 1.0,
        duration: 0.14, ease: E_SLIDE
      }, 0.52);
      tl.to(card, { "--scl": function () { return anchorPx(role).scl; }, duration: 0.14, ease: "back.out(1.4)" }, 0.52);
    });
    tl.to(cardEls.hero, {
      "--tx": function () { return anchorPx("hero").tx + "px"; },
      "--ty": function () { return anchorPx("hero").ty + "px"; },
      duration: 0.14, ease: E_SLIDE
    }, 0.52);
    tl.to(cardEls.hero, { "--scl": function () { return anchorPx("hero").scl; }, duration: 0.14, ease: "back.out(1.4)" }, 0.52);
    // ghost crossfade: state A out, state B in
    tl.to(ghostWm,  { opacity: 0, duration: 0.14 }, 0.52);
    tl.to(ghostL,   { autoAlpha: 0, duration: 0.14 }, 0.52);
    tl.fromTo(ghostWm2, { opacity: 0 }, { opacity: CONFIG.ghostWm2Peak, duration: 0.14 }, 0.52);

    /* ===== P5 0.66->0.82 — CENTRE CONTENT reveal ===== */
    tl.fromTo(headline, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.12, ease: E_REVEAL }, 0.66);
    tl.to(ctaWrap, { autoAlpha: 1, duration: 0.10 }, 0.70);
    tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.12, ease: E_REVEAL }, 0.70);
    tl.fromTo(cta, { autoAlpha: 0, y: 8 }, { autoAlpha: 0.82, y: 0, duration: 0.10, ease: E_REVEAL }, 0.74);
    tl.fromTo(dot, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.10, ease: E_REVEAL }, 0.76);

    /* ===== P6 0.82->0.90 — HOLD / READ (micro-parallax only) ===== */
    tl.to(cardEls.hero, { yPercent: -1.4, duration: 0.08 }, 0.82);
    tl.to(cardEls.tr,   { yPercent: 1.0,  duration: 0.08 }, 0.82);
    tl.to(cardEls.bl,   { yPercent: -1.0, duration: 0.08 }, 0.82);
    tl.to(cardEls.br,   { yPercent: 1.4,  duration: 0.08 }, 0.82);
    tl.to(ghostWm2,     { yPercent: -2.0, duration: 0.08 }, 0.82);

    /* ===== P7 0.90->1.00 — EXIT (whole wrap leaves, next enters) ===== */
    tl.to([cardEls.hero, cardEls.tr], { yPercent: "-=120", duration: 0.10, ease: E_SLIDE }, 0.90);
    tl.to([cardEls.bl, cardEls.br],   { yPercent: "-=110", duration: 0.10, ease: E_SLIDE }, 0.905);
    tl.to([center, dot],              { autoAlpha: 0, y: -60, duration: 0.10, ease: E_SLIDE }, 0.90);
    tl.to([ghostWm2].concat(gsap.utils.toArray(rims)), { autoAlpha: 0, duration: 0.08 }, 0.90);

    /* next section bust + ghost wordmark rise in from below.
       these targets live OUTSIDE root (the following section), so
       they are resolved against the document, not root. */
    var next = (opts && opts.next) || document.querySelector(".next");
    if (next) {
      var bust = next.querySelector(".next__bust");
      var nextWm = next.querySelector(".next__wm");
      if (bust) gsap.fromTo(bust,
        { y: 60, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, ease: E_SLIDE,
          scrollTrigger: { trigger: next, start: "top 85%", end: "top 30%", scrub: 1 } });
      if (nextWm) gsap.fromTo(nextWm,
        { y: 80, autoAlpha: 0 },
        { y: 0, autoAlpha: 0.16, ease: E_SLIDE,
          scrollTrigger: { trigger: next, start: "top 90%", end: "top 35%", scrub: 1 } });
    }

    /* ============================================================
       HOVER (non-scroll): cards lift 1.0 -> 1.03, power2.out 0.4s
       ============================================================ */
    if (!isMobile()) {
      order.forEach(function (role) {
        var card = cardEls[role];
        if (!card) return;
        card.addEventListener("mouseenter", function () { gsap.to(card, { "--hv": 1.03, duration: 0.4, ease: "power2.out" }); });
        card.addEventListener("mouseleave", function () { gsap.to(card, { "--hv": 1.0,  duration: 0.4, ease: "power2.out" }); });
      });
    }

    /* ============================================================
       RESIZE: re-pose start, refresh ScrollTrigger (D16)
       ============================================================ */
    var rT;
    global.addEventListener("resize", function () {
      clearTimeout(rT);
      rT = setTimeout(function () {
        setStart();
        ScrollTrigger.refresh();
      }, 180);
    });
  }

  /* ============================================================
     OPTIONAL guarded Lenis — call once per page, not per component.
     ============================================================ */
  function initLenis() {
    if (global.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    if (typeof global.Lenis === "undefined") return;
    var lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    return lenis;
  }

  global.SlideOutImgText = { init: init, initLenis: initLenis, DEFAULT_CONFIG: DEFAULT_CONFIG };
})(window);
