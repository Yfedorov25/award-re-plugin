/* ============================================================================
   slicer-reveal/component.js — Slicer reveal (SAISEI horizontal slice)
   ----------------------------------------------------------------------------
   Recorded 1:1 from apps/quadro/public/slide-lab/slc-h2-split-reveal.html
   (the owner-approved, now-fixed "slc-h2 · split slicer reveal · horizontal ·
   cream" prototype).

   THE TECHNIQUE — a SAISEI-grade SLICER REVEAL (horizontal slice).
   Each CONTAINED render (~42-50vw) sits on a dominant cream field and is
   REVEALED by a hard-edged clip that opens LEFT->RIGHT:
       closed:  clip-path inset(0 100% 0 0)   (a 1px seam on clean cream)
       open:    clip-path inset(0 0 0 0)       (full contained render)
   A thin LIGHT line rides the leading edge while it travels; the image behind
   is STATIC in world-space (scale 1.06 -> 1.0 micro-parallax only). Eased
   expo.out, scroll-scrubbed. As the render opens, the opposite serif text-
   column resolves (eyebrow up, masked lines rise, body + meta up).

   ── STACKED NO-RECLOSE SCROLL (BUG-A FIX — preserved EXACTLY) ───────────────
   The page is THREE full-height acts stacked vertically. Each act owns its OWN
   scrubbed ScrollTrigger (start "top 82%", end "top 24%"). As an act enters,
   its render slices open ONCE, then STAYS OPEN / STATIC. Scrolling DOWN brings
   the next act up; the prior render NEVER re-closes. There is NO re-cover
   tween. Reverse scroll re-runs the SAME eased tween backward (natural scrub
   symmetry, not a forced re-close). DO NOT reintroduce a re-close.
   ZERO image overlap: each act is its own full-height band, so only one render
   is ever in its reveal window — no two render PHOTOS mid-slice at once.

   ── NO-PLATE FIX (BUG-B FIX — preserved EXACTLY) ───────────────────────────
   The slab/inset backing IS the page cream (--render-back:--cream), never a
   dark/beige plate. Closed slot reads clean cream; the photo slices in onto
   cream. Renders are eager-preloaded (new Image, loading=eager) so the slice
   opens on a PAINTED image — no grey/beige placeholder rectangle ever shows.

   ── CLIMAX big+small pairing ───────────────────────────────────────────────
   The last act is the climax: its main render slices open and HOLDS, then a
   SMALL inset detail render slices open L->R beside it (scheduled AFTER the
   main is full — never two mid-slice at the same instant). SAISEI two-scale.

   STACK: vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase. No build step.
   Motion is transform / opacity / clip-path ONLY on scrub. No mix-blend /
   backdrop-filter over the scrub. No video.currentTime. No WebGL.

   USAGE — window-global IIFE, faithful entry:
     SlicerReveal.init({
       stackSel: '#stack',          // the cream stack that holds the acts
       acts: [{                      // builds the slc-h2 DOM if the stack is empty
         img, alt, side:'left'|'right',   // contained render + which side it sits
         chip,                            // on-render eyebrow chip (e.g. "ФАСАД · РАНОК")
         eyebrow, lines:[a,b], body, meta,// the serif text-feature
         inset:{ img, alt, cap },         // climax act only: the small detail render
         climax:false                     // true on the held final act
       }, ...],
       start:    'top 82%',          // per-act reveal window start (top below fold)
       end:      'top 24%',          // per-act reveal window end   (act centred)
       scrub:    0.8,                // ScrollTrigger smoothing (NOT snap)
       sliceDur: 0.62,              // slice duration on the act timeline (0..1)
       parScale: 1.06               // micro-parallax start scale (-> 1.0)
     });
   If `acts` is omitted (or the stack already holds .act>.slab markup), the
   engine drives whatever slc-h2-shaped DOM is present (the SMALLER faithful
   change). Either way the motion math below is byte-faithful to slc-h2.
   ========================================================================== */
(function (global) {
  "use strict";

  function esc(s){
    return String(s == null ? "" : s)
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  /* eyebrow/lines/chip/cap may carry the slc-h2 <br>/<em> markup — pass through. */
  function rich(s){ return (s == null) ? "" : String(s); }

  /* Build one .act 1:1 with slc-h2 when the stack is empty. The caption text
     lives in .text-col opposite the render; the render is a .slab clip box. */
  function buildAct(d, i){
    var right  = (d.side === "right");
    var climax = !!d.climax;
    var lns = (d.lines || []).map(function(t){
      return '<span class="ln"><span>' + rich(t) + '</span></span>';
    }).join("");
    var slab = ''
      + '<figure class="slab" data-slab="' + i + '">'
      +   '<img src="' + esc(d.img) + '" alt="' + esc(d.alt || "") + '" loading="eager" decoding="async">'
      +   '<div class="grad"></div>'
      +   '<div class="edge"></div>'
      +   (d.chip ? '<div class="chip">' + rich(d.chip) + '</div>' : '')
      + '</figure>';
    var text = ''
      + '<div class="text-col">'
      +   (d.eyebrow ? '<span class="eyebrow">' + rich(d.eyebrow) + '</span>' : '')
      +   '<h2 class="beat-head">' + lns + '</h2>'
      +   (d.body ? '<p class="beat-body">' + rich(d.body) + '</p>' : '')
      +   (d.meta ? '<span class="beat-meta">' + rich(d.meta) + '</span>' : '')
      + '</div>';
    var inset = (climax && d.inset)
      ? '<figure class="inset" id="inset">'
        +   '<img src="' + esc(d.inset.img) + '" alt="' + esc(d.inset.alt || "") + '" loading="eager" decoding="async">'
        +   '<div class="edge"></div>'
        +   (d.inset.cap ? '<div class="cap">' + rich(d.inset.cap) + '</div>' : '')
        + '</figure>'
      : '';
    return '<section class="act' + (right ? ' act--right' : '') + '" data-act="' + i + '">'
      + slab + text + inset + '</section>';
  }

  function init(opts){
    opts = opts || {};
    var cfg = {
      stackSel: opts.stackSel || "#stack",
      acts:     opts.acts     || null,
      start:    opts.start    != null ? opts.start    : "top 82%",
      end:      opts.end      != null ? opts.end      : "top 24%",
      scrub:    opts.scrub    != null ? opts.scrub    : 0.8,    // smoothing, NOT snap
      sliceDur: opts.sliceDur != null ? opts.sliceDur : 0.62,   // slice duration (0..1)
      parScale: opts.parScale != null ? opts.parScale : 1.06    // micro-parallax start scale
    };

    try {
      if (!global.gsap || !global.ScrollTrigger) {
        if (global.console) console.warn("[slicer-reveal] gsap + ScrollTrigger required");
        global.__LAB_OK__ = false;
        return null;
      }
      gsap.registerPlugin(ScrollTrigger);
      if (global.CustomEase) gsap.registerPlugin(CustomEase);

      var E_AIR = global.CustomEase
        ? (gsap.parseEase("air") || CustomEase.create("air", "0.25,0.74,0.22,0.99"))
        : "power3.out";
      var E_SLICE = "expo.out"; // the slice decelerates into its final edge

      var stackEl = typeof cfg.stackSel === "string" ? document.querySelector(cfg.stackSel) : cfg.stackSel;
      if (!stackEl) { global.__LAB_OK__ = false; return null; }

      /* build the three acts from data ONLY if the stack is empty — otherwise
         drive the slc-h2-shaped DOM already present (the SMALLER faithful change). */
      if (cfg.acts && cfg.acts.length && stackEl.querySelectorAll(".act").length === 0) {
        stackEl.insertAdjacentHTML("beforeend", cfg.acts.map(buildAct).join(""));
        /* BUG-B: eager-preload + decode renders so the slice opens on a painted
           image — never a grey/beige placeholder rectangle. */
        cfg.acts.forEach(function(d){
          [d.img, (d.inset && d.inset.img)].forEach(function(src){
            if (!src) return;
            var im = new Image(); im.loading = "eager"; im.decoding = "async"; im.src = src;
          });
        });
      }

      var acts   = gsap.utils.toArray(stackEl.querySelectorAll(".act"));
      var slabs  = gsap.utils.toArray(stackEl.querySelectorAll(".slab"));
      var imgs   = slabs.map(function(s){ return s.querySelector("img"); });
      var edges  = slabs.map(function(s){ return s.querySelector(".edge"); });
      var inset  = stackEl.querySelector("#inset");
      var insetImg  = inset ? inset.querySelector("img") : null;
      var insetEdge = inset ? inset.querySelector(".edge") : null;
      var progEl = stackEl.querySelector("#prog") || stackEl.querySelector(".prog i");

      var slabsBuilt = slabs.length;
      var actsBuilt  = acts.length;
      var N = actsBuilt;

      var reduce = global.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches;
      var narrow = global.matchMedia && matchMedia("(max-width:820px)").matches;

      /* per-act text element groups, for the rise-and-fade choreography */
      function parts(actEl){
        return {
          eyebrow: actEl.querySelector(".eyebrow"),
          lns: gsap.utils.toArray(actEl.querySelectorAll("h2.beat-head .ln > span")),
          body: actEl.querySelector(".beat-body"),
          meta: actEl.querySelector(".beat-meta")
        };
      }
      var P = acts.map(parts);

      /* ============================================================
         STATIC PATH — reduced-motion OR narrow: no scrub, slices OPEN.
         ============================================================ */
      if (reduce || narrow) {
        stackEl.classList.add("is-static");
        global.__LAB_OK__ = (slabsBuilt >= 3) && (actsBuilt >= 3);
        if (global.console) console.log("[slicer-reveal] static path; slabs:", slabsBuilt, "acts:", actsBuilt, "__LAB_OK__:", global.__LAB_OK__);
        return { reduced:true, n:N, refresh:function(){ ScrollTrigger.refresh(); }, kill:function(){} };
      }

      /* ----- rest pose: every slab CLOSED, every text masked/hidden ----- */
      function setStart(){
        slabs.forEach(function(s,i){
          gsap.set(s, { clipPath:"inset(0 100% 0 0)" });
          gsap.set(imgs[i], { scale:cfg.parScale });
          gsap.set(edges[i], { opacity:0 });
        });
        if (inset) {
          gsap.set(inset, { clipPath:"inset(0 100% 0 0)" });
          gsap.set(insetImg, { scale:cfg.parScale });
          gsap.set(insetEdge, { opacity:0 });
        }
        P.forEach(function(p){
          gsap.set(p.eyebrow, { autoAlpha:0, y:8 });
          gsap.set(p.lns, { yPercent:112 });
          gsap.set(p.body, { autoAlpha:0, y:10 });
          gsap.set(p.meta, { autoAlpha:0, y:8 });
        });
      }
      setStart();

      /* ============================================================
         STACKED-SCROLL REVEAL (BUG-A FIX)
         ------------------------------------------------------------
         Each act gets its OWN scrubbed ScrollTrigger. As the act scrolls
         up into the viewport, a short timeline:
           - slices the render OPEN L->R (clip 100% -> 0), snapping pixel-
             exact full at the end (kills the expo asymptote),
           - rides the light edge across,
           - micro-parallaxes the image 1.06 -> 1.0,
           - resolves the text (eyebrow / masked lines / body / meta).
         Once open, the render STAYS OPEN / STATIC. There is NO re-cover
         tween — scrolling DOWN simply brings the next act into view; the
         prior act remains fully revealed above it. Reverse scroll re-runs
         the same eased tween backward (symmetric, never "snaps shut").
         ZERO OVERLAP: each act is its own full-height band, so only one
         render is ever in the active reveal window of the viewport.
         ============================================================ */
      var timelines = [];
      function buildActTl(i){
        var slab = slabs[i], img = imgs[i], edge = edges[i], p = P[i];
        var isClimax = (i === acts.length - 1) && !!inset;

        var at = gsap.timeline({
          defaults:{ ease:"none" },
          scrollTrigger:{
            trigger: acts[i],
            start: cfg.start,
            end:   cfg.end,
            scrub: cfg.scrub,
            invalidateOnRefresh:true
          }
        });

        // light edge appears as travel begins, rides the edge, fades at full open
        at.to(edge, { opacity:1, duration:0.02, ease:"none" }, 0.0);
        at.to(slab, { clipPath:"inset(0 0% 0 0)", duration:cfg.sliceDur, ease:E_SLICE }, 0.0);
        at.to(img,  { scale:1.0, duration:0.70, ease:E_AIR }, 0.0);
        // SNAP to exactly-full the instant the slice finishes — kills the expo
        // asymptotic tail so the render is pixel-exact open (no perpetual 99.5%).
        at.set(slab, { clipPath:"inset(0 0 0 0)" }, cfg.sliceDur);
        at.to(edge, { opacity:0, duration:0.06, ease:"none" }, 0.60);

        // text resolves WITH the slice
        at.to(p.eyebrow, { autoAlpha:1, y:0, duration:0.16, ease:E_AIR }, 0.10);
        if (p.lns[0]) at.to(p.lns[0], { yPercent:0, duration:0.26, ease:E_AIR }, 0.16);
        if (p.lns[1]) at.to(p.lns[1], { yPercent:0, duration:0.26, ease:E_AIR }, 0.24);
        at.to(p.body,    { autoAlpha:1, y:0, duration:0.22, ease:E_AIR }, 0.34);
        at.to(p.meta,    { autoAlpha:1, y:0, duration:0.18, ease:E_AIR }, 0.44);

        // climax pairing: the small inset slices open AFTER the main is full,
        // beside the settled main render (never mid-slice at the same instant).
        if (isClimax){
          at.to(insetEdge, { opacity:1, duration:0.02, ease:"none" }, 0.66);
          at.to(inset,     { clipPath:"inset(0 0% 0 0)", duration:0.26, ease:E_SLICE }, 0.66);
          at.to(insetImg,  { scale:1.0, duration:0.30, ease:E_AIR }, 0.66);
          at.set(inset,    { clipPath:"inset(0 0 0 0)" }, 0.92);
          at.to(insetEdge, { opacity:0, duration:0.06, ease:"none" }, 0.90);
        }
        timelines.push(at);
      }
      acts.forEach(function(_, i){ buildActTl(i); });

      /* ----- thin filmic progress line across the whole stack ----- */
      if (progEl) {
        ScrollTrigger.create({
          trigger: stackEl,
          start:"top top",
          end:"bottom bottom",
          onUpdate:function(self){ gsap.set(progEl, { scaleX:self.progress }); }
        });
      }

      /* ----- HOVER lift on slabs (non-scroll surface; subtle) ----- */
      slabs.forEach(function(s,i){
        s.addEventListener("mouseenter", function(){ gsap.to(imgs[i], { scale:1.03, duration:0.6, ease:E_AIR, overwrite:"auto" }); });
        s.addEventListener("mouseleave", function(){ gsap.to(imgs[i], { scale:1.0,  duration:0.6, ease:E_AIR, overwrite:"auto" }); });
      });

      /* ----- RESIZE: refresh ----- */
      var rT;
      global.addEventListener("resize", function(){
        clearTimeout(rT);
        rT = setTimeout(function(){ ScrollTrigger.refresh(); }, 180);
      });

      ScrollTrigger.refresh();

      /* ============================================================
         PROBE — engine wired + >=3 slabs + >=3 acts + scrubbed slicers built.
         ============================================================ */
      var sliced = ScrollTrigger.getAll().filter(function(s){
        return s.vars && s.vars.scrub;
      }).length;
      global.__LAB_OK__ = (slabsBuilt >= 3) && (actsBuilt >= 3) && (sliced >= 3);
      if (global.console) console.log("[slicer-reveal] scrubbed-slicers:", sliced, "slabs:", slabsBuilt, "acts:", actsBuilt, "__LAB_OK__:", global.__LAB_OK__);

      return {
        n: N,
        timelines: timelines,
        refresh: function(){ ScrollTrigger.refresh(); },
        kill: function(){
          timelines.forEach(function(t){ if (t.scrollTrigger) t.scrollTrigger.kill(); t.kill(); });
        }
      };

    } catch (err) {
      try {
        if (global.gsap && global.ScrollTrigger) {
          var okSlabs = document.querySelectorAll(".slab").length >= 3;
          var okActs  = document.querySelectorAll(".act").length >= 3;
          global.__LAB_OK__ = okSlabs && okActs;
        } else {
          global.__LAB_OK__ = false;
        }
      } catch(e){ global.__LAB_OK__ = false; }
      if (global.console) console.warn("[slicer-reveal] init guarded:", err && err.message);
      return null;
    }
  }

  global.SlicerReveal = { init: init };
})(typeof window !== "undefined" ? window : this);
