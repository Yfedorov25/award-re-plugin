/* ============================================================
   FocusRenderSwitch  —  reusable "FOCUS-ON-RENDER" pinned stepper
   ------------------------------------------------------------
   Big media LEFT, heading-stack RIGHT. Pin the section; scroll drives
   discrete steps. Per step: crossfade+scale the active render, tick the
   heading ticker (prev out / current in / next preview), sweep the
   current heading's words with an accent colour, bump a step counter.

   Deps (global): gsap, ScrollTrigger, (optional) CustomEase.
   No build step. No WebGL. Motion only on transform/opacity/colour.

     FocusRenderSwitch.init(target, options)

   target   CSS selector or Element of the section to pin.
   options  see DEFAULTS below.

   MARKUP CONTRACT (see lab.html):
     section
       .frs__media  > .frs__slide (one per step, first has .is-active) > img
       .frs__stack  > .frs__head  (one per step, count === slides)
       .frs__count  (optional step counter)
   ============================================================ */
(function (global) {
  "use strict";

  const DEFAULTS = {
    slideSel:  ".frs__slide",
    headSel:   ".frs__head",
    mediaSel:  ".frs__media",
    countSel:  ".frs__count",
    scrollPerStep: 0.9,   // vh of scroll per step → pin length = steps * this * 100vh
    stepHold:  0.78,      // 0..1 of a step's progress spent on the *current* render before swap
    crossfade: 0.55,      // seconds for the render crossfade
    kenBurns:  true,      // slow scale on the active slide while it's held
    kenBurnsFrom: 1.0,
    kenBurnsTo: 1.08,
    headRise:  34,        // px the heading travels as it ticks through the slot
    accent:    "#1aa6c7", // word-sweep colour (falls back to CSS --accent)
    ease:      "air",     // CustomEase name or any GSAP ease string
    markers:   false,
  };

  // register a single house ease once (matches the ref's soft out-curve)
  let easeReady = false;
  function ensureEase() {
    if (easeReady) return;
    if (global.CustomEase && global.CustomEase.create) {
      try { global.CustomEase.create("air", "0.22,0.61,0.20,1"); } catch (e) {}
    }
    easeReady = true;
  }

  // split a heading into word-spans so colour can sweep word-by-word
  function splitWords(head) {
    if (head.dataset.split) return;
    const words = head.textContent.trim().split(/\s+/);
    head.textContent = "";
    words.forEach((w, i) => {
      const span = document.createElement("span");
      span.className = "w";
      span.textContent = w + (i < words.length - 1 ? " " : "");
      head.appendChild(span);
    });
    head.dataset.split = "1";
  }

  function init(target, options) {
    const root = typeof target === "string" ? document.querySelector(target) : target;
    if (!root) return null;
    if (!global.gsap || !global.ScrollTrigger) {
      console.warn("[FocusRenderSwitch] gsap + ScrollTrigger required"); return null;
    }
    const o = Object.assign({}, DEFAULTS, options || {});
    ensureEase();
    global.gsap.registerPlugin(global.ScrollTrigger);

    const slides = Array.from(root.querySelectorAll(o.slideSel));
    const heads  = Array.from(root.querySelectorAll(o.headSel));
    const media  = root.querySelector(o.mediaSel);
    const counter = o.countSel ? root.querySelector(o.countSel) : null;
    const N = Math.min(slides.length, heads.length);
    if (N < 2) return null;

    const reduce = global.matchMedia &&
      global.matchMedia("(prefers-reduced-motion: reduce)").matches;

    heads.forEach(splitWords);
    if (o.accent) root.style.setProperty("--accent", o.accent);

    // -------- reduced motion: static, accessible, no pin --------
    if (reduce) {
      slides.forEach((s, i) => global.gsap.set(s, { opacity: i === 0 ? 1 : 0 }));
      heads.forEach(h => {
        global.gsap.set(h, { opacity: 1, position: "relative", top: "auto", y: 0, clearProps: "transform" });
        h.querySelectorAll(".w").forEach(w => w.classList.add("done"));
      });
      return { kill() {} };
    }

    /* -------- state helpers -------- */
    const setActiveSlide = (idx) => {
      slides.forEach((s, i) => {
        const on = i === idx;
        global.gsap.to(s, {
          opacity: on ? 1 : 0,
          duration: o.crossfade,
          ease: o.ease,
          overwrite: "auto",
        });
        s.classList.toggle("is-active", on);
        // restart ken-burns on the newly active slide
        const img = s.querySelector("img");
        if (img && on && o.kenBurns) {
          global.gsap.fromTo(img,
            { scale: o.kenBurnsFrom },
            { scale: o.kenBurnsTo, duration: o.scrollPerStep * 4, ease: "none", overwrite: "auto" });
        }
      });
      if (counter) counter.textContent = String(idx + 1).padStart(2, "0");
    };

    // place the heading ticker for a given fractional position `p` (0..N-1)
    // current index = round(p); we render prev/cur/next using distance.
    const layoutHeads = (p) => {
      heads.forEach((h, i) => {
        const d = i - p;                       // signed distance from focus
        const ad = Math.abs(d);
        let opacity, y, dim;
        if (ad >= 1.6) { opacity = 0;          y = d > 0 ? o.headRise : -o.headRise; dim = true; }
        else if (d > 0) {                       // upcoming (below)  -> faded preview
          opacity = global.gsap.utils.clamp(0, 1, 1 - ad);  y = d * o.headRise; dim = true;
        } else if (d < 0) {                     // past (above)      -> fading out
          opacity = global.gsap.utils.clamp(0, 1, 1 - ad);  y = d * o.headRise; dim = true;
        } else {                                // focused
          opacity = 1; y = 0; dim = false;
        }
        global.gsap.set(h, { opacity, yPercent: y });
        // colour: focused heading = ink; others = mid (preview)
        h.style.color = dim ? "var(--mid)" : "var(--ink)";
      });
    };

    // sweep the words of the focused heading according to sub-progress 0..1
    const sweepWords = (idx, sub) => {
      const words = heads[idx] ? heads[idx].querySelectorAll(".w") : [];
      const cut = sub * words.length;
      words.forEach((w, i) => {
        w.classList.toggle("done", i < cut - 1);          // passed → solid ink
        w.classList.toggle("lit",  i >= cut - 1 && i < cut); // the one being read → accent
      });
    };

    /* -------- the driver: one ScrollTrigger, scrubbed -------- */
    let lastIdx = -1;
    const st = global.ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: () => "+=" + (N * o.scrollPerStep) * global.innerHeight,
      pin: true,
      pinSpacing: true,
      scrub: true,
      markers: o.markers,
      onUpdate: (self) => {
        // global progress 0..1 across all steps
        const prog = self.progress * (N - 1);          // 0 .. N-1
        const idx  = Math.round(prog);
        const frac = prog - Math.floor(prog);          // 0..1 within the step

        // SWAP the render when we cross the hold threshold of a step.
        // stepHold = how long we sit on the current render before flipping.
        const wantIdx = frac > o.stepHold ? Math.ceil(prog) : Math.floor(prog);
        const clamped = global.gsap.utils.clamp(0, N - 1, wantIdx);
        if (clamped !== lastIdx) { setActiveSlide(clamped); lastIdx = clamped; }

        // ticker follows continuous progress (smooth, not snapped)
        layoutHeads(prog);

        // word sweep on the focused heading, mapped to its own sub-progress
        const focus = global.gsap.utils.clamp(0, N - 1, Math.round(prog));
        const sub = global.gsap.utils.clamp(0, 1,
          (prog - focus + 0.5));   // -0.5..+0.5 → 0..1 centred on the heading
        sweepWords(focus, sub);
      },
    });

    setActiveSlide(0);
    layoutHeads(0);
    sweepWords(0, 0.5);

    return {
      st,
      kill() {
        st.kill();
        global.gsap.killTweensOf(slides);
        global.gsap.killTweensOf(heads);
      },
      refresh() { global.ScrollTrigger.refresh(); },
    };
  }

  global.FocusRenderSwitch = { init, DEFAULTS };
})(typeof window !== "undefined" ? window : this);
