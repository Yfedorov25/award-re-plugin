/* ============================================================================
   slicer-reveal/component.js — Slicer reveal (SAISEI horizontal slice)
   ----------------------------------------------------------------------------
   Recorded 1:1 from the RESTORED, owner-approved
   apps/quadro/public/slide-lab/slc-h2-split-reveal.html — the CONTAINED ~50vw
   calm version (NOT the broken full-screen variant).

   THE TECHNIQUE — a SAISEI-grade SLICER REVEAL (horizontal slice).
   Each CONTAINED render (~50vw) sits on a dominant cream field and is REVEALED
   by a hard-edged clip that opens LEFT->RIGHT:
       closed:  clip-path inset(0 100% 0 0)   (a 1px seam on clean cream)
       open:    clip-path inset(0 0 0 0)       (full contained ~50vw render)
   A thin LIGHT line rides the leading edge while it travels; the image behind
   is STATIC in world-space (scale 1.06 -> 1.0 micro-parallax only). Eased
   expo.out, scroll-scrubbed (scrub:0.8) — calm, slow, premium, opening over a
   generous scroll band. NOT a snap. As the render opens, the opposite serif
   text-column resolves (eyebrow up, masked lines rise, body + meta up).

   ── STACKED NO-RECLOSE SCROLL (BUG-A FIX — preserved EXACTLY) ───────────────
   The page is THREE tall beat-sections (height:200vh) stacked vertically. Each
   section's inner STICKY stage (.beat-stage, 100vh) pins the contained render
   centred in the viewport while its band scrolls. Each beat owns its OWN
   scrubbed ScrollTrigger (start "top top", end "bottom bottom"); the slice
   plays ONCE over normalized 0.0 -> 0.55 of the band (~0.55 viewport of real
   scroll — calm, expo.out). Once open it STAYS OPEN / STATIC; the prior render
   simply scrolls away above as the next sticky stage scrolls in. There is NO
   re-cover tween. Reverse scroll re-runs the SAME eased tween backward (natural
   scrub symmetry, not a forced re-close). DO NOT reintroduce a re-close.
   ZERO image overlap: each beat is its own tall band + sticky stage, so only
   one contained render is ever in its reveal window — no two PHOTOS mid-slice.

   ── NO-PLATE FIX (BUG-B FIX — preserved EXACTLY) ───────────────────────────
   The slab/inset backing IS the page cream (--render-back:--cream), never a
   dark/beige plate. Closed slot reads clean cream; the photo slices in onto
   cream. Renders are eager-preloaded (new Image, loading=eager) so the slice
   opens on a PAINTED image — no grey/beige placeholder rectangle ever shows.

   ── CLIMAX big+small pairing ───────────────────────────────────────────────
   The last beat is the climax: its main render slices open and HOLDS, then a
   SMALL inset detail render slices open L->R beside it (scheduled at 0.62 —
   AFTER the main is full at sliceDur — never two mid-slice at the same instant).

   STACK: vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase. No build step.
   Motion is transform / opacity / clip-path ONLY on scrub. No mix-blend /
   backdrop-filter over the scrub. No video.currentTime. No WebGL.

   USAGE — window-global IIFE, faithful entry:
     SlicerReveal.init({
       stackSel: '#stack',          // the cream stack that holds the beats
       acts: [{                      // builds the slc-h2 DOM if the stack is empty
         img, alt, side:'left'|'right',   // contained render + which side it sits
         chip,                            // on-render eyebrow chip (e.g. "ФАСАД · РАНОК")
         eyebrow, lines:[a,b], body, meta,// the serif text-feature
         inset:{ img, alt, cap },         // climax act only: the small detail render
         climax:false                     // true on the held final act
       }, ...],
       start:    'top top',          // per-beat reveal window start (sticky locks)
       end:      'bottom bottom',    // per-beat reveal window end   (full tall band)
       scrub:    0.8,                // ScrollTrigger smoothing (NOT snap)
       sliceDur: 0.55,              // slice span on the beat timeline (0..1)
       parScale: 1.06               // micro-parallax start scale (-> 1.0)
     });
   If `acts` is omitted (or the stack already holds .beat>.slab markup), the
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

  /* Build one .beat 1:1 with slc-h2 when the stack is empty. The contained
     render lives in .render-col > .slab inside the sticky .beat-stage; the
     caption text lives in .text-col opposite it. */
  function buildBeat(d, i){
    var right  = (d.side === "right");
    var climax = !!d.climax;
    var lns = (d.lines || []).map(function(t){
      return '<span class="ln"><span>' + rich(t) + '</span></span>';
    }).join("");
    var renderCol = ''
      + '<div class="render-col">'
      +   '<figure class="slab" data-slab="' + i + '">'
      +     '<img src="' + esc(d.img) + '" alt="' + esc(d.alt || "") + '" loading="eager" decoding="async">'
      +     '<div class="grad"></div>'
      +     '<div class="edge"></div>'
      +     (d.chip ? '<div class="chip">' + rich(d.chip) + '</div>' : '')
      +   '</figure>'
      + '</div>';
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
    return '<section class="beat' + (right ? ' beat--right' : '') + '" data-beat="' + i + '">'
      + '<div class="beat-stage">' + renderCol + text + inset + '</div>'
      + '</section>';
  }

  function init(opts){
    opts = opts || {};
    var cfg = {
      stackSel: opts.stackSel || "#stack",
      acts:     opts.acts     || null,
      start:    opts.start    != null ? opts.start    : "top top",       // sticky stage locks at the top
      end:      opts.end      != null ? opts.end      : "bottom bottom",  // through the full tall band
      scrub:    opts.scrub    != null ? opts.scrub    : 0.8,    // smoothing, NOT snap
      sliceDur: opts.sliceDur != null ? opts.sliceDur : 0.55,   // slice span (0..1)
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
      var E_SLICE = "expo.out"; // the slice decelerates into its final edge — calm, slow, premium

      var stackEl = typeof cfg.stackSel === "string" ? document.querySelector(cfg.stackSel) : cfg.stackSel;
      if (!stackEl) { global.__LAB_OK__ = false; return null; }

      /* build the three beats from data ONLY if the stack is empty — otherwise
         drive the slc-h2-shaped DOM already present (the SMALLER faithful change). */
      if (cfg.acts && cfg.acts.length && stackEl.querySelectorAll(".beat").length === 0) {
        /* inject before the .prog cue if present, else at the end */
        var progWrap = stackEl.querySelector(".prog");
        var html = cfg.acts.map(buildBeat).join("");
        if (progWrap) progWrap.insertAdjacentHTML("beforebegin", html);
        else stackEl.insertAdjacentHTML("beforeend", html);
        /* BUG-B: eager-preload + decode renders so the slice opens on a painted
           image — never a grey/beige placeholder rectangle. */
        cfg.acts.forEach(function(d){
          [d.img, (d.inset && d.inset.img)].forEach(function(src){
            if (!src) return;
            var im = new Image(); im.loading = "eager"; im.decoding = "async"; im.src = src;
          });
        });
      }

      var beats  = gsap.utils.toArray(stackEl.querySelectorAll(".beat"));
      var slabs  = gsap.utils.toArray(stackEl.querySelectorAll(".slab"));
      var imgs   = slabs.map(function(s){ return s.querySelector("img"); });
      var edges  = slabs.map(function(s){ return s.querySelector(".edge"); });
      var inset  = stackEl.querySelector("#inset");
      var insetImg  = inset ? inset.querySelector("img") : null;
      var insetEdge = inset ? inset.querySelector(".edge") : null;
      var progEl = stackEl.querySelector("#prog") || stackEl.querySelector(".prog i");

      var slabsBuilt = slabs.length;
      var beatsBuilt = beats.length;
      var N = beatsBuilt;

      var reduce = global.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches;
      var narrow = global.matchMedia && matchMedia("(max-width:820px)").matches;

      /* per-beat text element groups, for the rise-and-fade choreography */
      function parts(beatEl){
        return {
          eyebrow: beatEl.querySelector(".eyebrow"),
          lns: gsap.utils.toArray(beatEl.querySelectorAll("h2.beat-head .ln > span")),
          body: beatEl.querySelector(".beat-body"),
          meta: beatEl.querySelector(".beat-meta")
        };
      }
      var P = beats.map(parts);

      /* ============================================================
         STATIC PATH — reduced-motion OR narrow: no sticky, slices OPEN.
         ============================================================ */
      if (reduce || narrow) {
        stackEl.classList.add("is-static");
        global.__LAB_OK__ = (slabsBuilt >= 3) && (beatsBuilt >= 3);
        if (global.console) console.log("[slicer-reveal] static path; slabs:", slabsBuilt, "beats:", beatsBuilt, "__LAB_OK__:", global.__LAB_OK__);
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
         STACKED-SCROLL REVEAL — the ONE behaviour change (no re-close)
         ------------------------------------------------------------
         Each beat gets its OWN scrubbed ScrollTrigger over its tall
         section. The sticky stage pins the contained render in the
         viewport while the band scrolls; the slice plays ONLY across
         normalized 0.0 -> sliceDur (~0.55) of the band — generously,
         over ~0.55 viewport of REAL scroll — so it opens SLOWLY and
         CALMLY with E_SLICE = expo.out (scrub:0.8). Once open, the
         render STAYS OPEN / STATIC for the rest of the band; there is
         NO re-cover tween. Scrolling DOWN carries the opened render
         away above as the next sticky stage scrolls in.
         ZERO OVERLAP: each beat owns its own tall band + sticky stage,
         so only one contained render is ever in view at a time.
         ============================================================ */
      var timelines = [];
      function buildBeatTl(i){
        var slab = slabs[i], img = imgs[i], edge = edges[i], p = P[i];
        var isClimax = (i === beats.length - 1) && !!inset;

        // trigger spans the section's scrollable band. The sticky stage pins
        // the contained render in the viewport while the band scrolls, so
        // normalized progress maps to ~one viewport of real scroll — the slice
        // opens over a generous ~0.55vp. Calm, scrubbed, no snap.
        var bt = gsap.timeline({
          defaults:{ ease:"none" },
          scrollTrigger:{
            trigger: beats[i],
            start: cfg.start,      // begin when the sticky stage locks at the top
            end:   cfg.end,        // through the full tall band
            scrub: cfg.scrub,
            invalidateOnRefresh:true
          }
        });

        // light edge appears as travel begins, rides the leading edge, fades at full open.
        bt.to(edge, { opacity:1, duration:0.02, ease:"none" }, 0.0);
        // THE SLICE — generous expo.out over normalized 0.0 -> sliceDur of the
        // band. The band's scrub-travel is ~one viewport (100vh), so the slice
        // opens over ~0.55 viewport of real scroll => slow, calm, premium. NOT
        // a snap, NOT hyper-fast. (Matches the restored unhurried expo.out open.)
        bt.to(slab, { clipPath:"inset(0 0% 0 0)", duration:cfg.sliceDur, ease:E_SLICE }, 0.0);
        bt.to(img,  { scale:1.0, duration:0.62, ease:E_AIR }, 0.0);
        // SNAP to exactly-full the instant the slice finishes — kills the expo
        // asymptotic tail so the render is pixel-exact open (no perpetual 99.5%).
        bt.set(slab, { clipPath:"inset(0 0 0 0)" }, cfg.sliceDur);
        bt.to(edge, { opacity:0, duration:0.05, ease:"none" }, cfg.sliceDur - 0.03);

        // text resolves WITH the slice (rise from mask + fade up)
        bt.to(p.eyebrow, { autoAlpha:1, y:0, duration:0.12, ease:E_AIR }, 0.10);
        if (p.lns[0]) bt.to(p.lns[0], { yPercent:0, duration:0.20, ease:E_AIR }, 0.15);
        if (p.lns[1]) bt.to(p.lns[1], { yPercent:0, duration:0.20, ease:E_AIR }, 0.22);
        bt.to(p.body,    { autoAlpha:1, y:0, duration:0.18, ease:E_AIR }, 0.30);
        bt.to(p.meta,    { autoAlpha:1, y:0, duration:0.14, ease:E_AIR }, 0.40);

        // climax pairing: the small inset slices open AFTER the main is
        // statically full, beside the settled main render (the two never slice
        // at the same instant).
        if (isClimax){
          bt.to(insetEdge, { opacity:1, duration:0.02, ease:"none" }, 0.62);
          bt.to(inset,     { clipPath:"inset(0 0% 0 0)", duration:0.22, ease:E_SLICE }, 0.62);
          bt.to(insetImg,  { scale:1.0, duration:0.26, ease:E_AIR }, 0.62);
          bt.set(inset,    { clipPath:"inset(0 0 0 0)" }, 0.84);
          bt.to(insetEdge, { opacity:0, duration:0.05, ease:"none" }, 0.82);
          // final micro-settle: main render breathes a hair (deep-plane life)
          bt.to(img, { scale:1.012, duration:0.12, ease:E_AIR }, 0.88);
        }
        timelines.push(bt);
      }
      beats.forEach(function(_, i){ buildBeatTl(i); });

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
         PROBE — engine wired + >=3 slabs + >=3 beats + scrubbed slicers built.
         ============================================================ */
      var sliced = ScrollTrigger.getAll().filter(function(s){
        return s.vars && s.vars.scrub;
      }).length;
      global.__LAB_OK__ = (slabsBuilt >= 3) && (beatsBuilt >= 3) && (sliced >= 3);
      if (global.console) console.log("[slicer-reveal] scrubbed-slicers:", sliced, "slabs:", slabsBuilt, "beats:", beatsBuilt, "__LAB_OK__:", global.__LAB_OK__);

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
          var okBeats = document.querySelectorAll(".beat").length >= 3;
          global.__LAB_OK__ = okSlabs && okBeats;
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
