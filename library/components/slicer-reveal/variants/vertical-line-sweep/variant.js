/* ============================================================================
   slicer-reveal / vertical-line-sweep — variant.js  (base-family engine, NOT a fork)
   ----------------------------------------------------------------------------
   variant-as-delta of slicer-reveal. The base owns the SAISEI cream-paper
   restraint + the no-plate / eager-preload / reduced-motion family laws and the
   shared house ease "air"; this file owns the VERTICAL top→bottom LINE-SWEEP
   engine, recorded 1:1 (byte-faithful) from owner-chosen
   apps/quadro/public/slide-lab/slc-v3-topdown-line-sweep.html.

   It belongs to the slicer-reveal family: the lab loads the base
   `../../component.js` (→ window.SlicerReveal, registers CustomEase "air")
   BEFORE this file; this engine reuses that family ease and supplies the
   vertical line-sweep painter. It does NOT fork the horizontal-slice base
   `SlicerReveal.init` slab engine — it is the vertical cousin of that slice.

   THE MECHANIC (the star):
     A thin luminous WARM line descends from the top edge of each render to the
     bottom, and the image is REVEALED IN ITS WAKE — a scanner painting the
     render downward. The line rides the leading edge of a clip-path inset whose
     BOTTOM mask travels top→bottom. Above the line: bare cream / void. Below the
     line: the painted render. Serif caption resolves as the line finishes.

       Reveal = clip-path: inset(0 0 calc(--eff * 100%) 0)
         --sweep:1 → fully closed (line at the very top, render hidden)
         --sweep:0 → fully open   (line passed the bottom, render painted)
       --eff = max(--sweep, 1 - --active): an instant --active gate forces every
       non-active panel fully closed → ZERO-OVERLAP immune to scrub lag at seams.

   STACK: GSAP 3.12.5 + ScrollTrigger + CustomEase. transform/opacity/clip-path
   on scrub ONLY · no mix-blend / no backdrop-filter over scrub · no
   video.currentTime · no WebGL. reduced-motion + narrow → static, slices open.

   USAGE — window-global IIFE, faithful entry:
     SlicerLineSweep.init();   // drives the slc-v3-shaped DOM already present
   The slc-v3 prototype is markup-driven (5 .panel sections + an .outro + a
   .static fallback), so init() reads that DOM and wires the sweeps — the
   SMALLER faithful change. Engine numbers are byte-faithful to slc-v3.

   Base family reference (do NOT remove — the variant law asserts it):
     base engine: ../../component.js  (window.SlicerReveal)
   ========================================================================== */
(function (global) {
  "use strict";

  function init(opts){
    opts = opts || {};
    try{
      if (!global.gsap || !global.ScrollTrigger || !global.CustomEase) {
        if (global.console) console.warn("[slicer-reveal/vertical-line-sweep] gsap + ScrollTrigger + CustomEase required");
        global.__LAB_OK__ = false;
        return null;
      }
      gsap.registerPlugin(ScrollTrigger, CustomEase);

      // BUG-B fix — EAGER PRELOAD every render up front (new Image()) so a photo
      // is never absent while its slot is on screen. The slot already paints the
      // page cream (not a plate), so the worst case is clean cream, never a beige
      // placeholder; this preload removes even that brief gap.
      Array.prototype.slice.call(document.querySelectorAll(".frame__img img")).forEach(function(img){
        var pre = new Image();
        pre.decoding = "async";
        try{ pre.loading = "eager"; }catch(e){}
        pre.src = img.currentSrc || img.src;
      });

      // family house ease "air" (the base registers it too; idempotent here).
      if (!gsap.parseEase("air")) CustomEase.create("air","0.25,0.74,0.22,0.99");
      // a soft, premium reveal ease for the line-sweep — decelerates into the bottom edge, no jerky crawl
      if (!gsap.parseEase("paint")) CustomEase.create("paint","0.30,0.00,0.10,1.00");

      var reduce = global.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches;
      var narrow = global.matchMedia && matchMedia("(max-width:820px)").matches;

      // ── STATIC PATH ─ no pin, slices fully open, legible. ──
      if(reduce || narrow){
        var sc = document.getElementById("scrolly");
        var st = document.getElementById("static");
        if (sc) sc.style.display = "none";
        if (st) st.style.display  = "block";
        probe();
        return { reduced:true, refresh:function(){ ScrollTrigger.refresh(); }, kill:function(){} };
      }

      var progFill = document.getElementById("progFill");

      /* ── one helper: build the top-down LINE-SWEEP for a single panel ──
         Each panel pins for `len` of scroll; the sweep runs 0→1 (closed→open)
         within the FIRST portion of the pin, then captions resolve, then it
         holds open before unpinning. Because the panel is pinned, its render
         is the only render on screen during this window → ZERO overlap. */
      function sweepPanel(o){
        var panel  = document.querySelector(o.sel);
        var pin    = panel.querySelector(".pin");
        var frames = Array.prototype.slice.call(panel.querySelectorAll(".frame"));
        var lines  = Array.prototype.slice.call(panel.querySelectorAll(".frame__line"));

        // initial closed state — line at the very top, render hidden
        frames.forEach(function(f,i){
          gsap.set(f, { "--sweep":1, "--kb":(o.kb0!=null?o.kb0:1.07), "--ky":"0%" });
        });
        if(o.onSet) o.onSet(pin);

        // --active gate (instant, NOT scrubbed): 1 only while this panel is the
        // active pinned one. Forces every other render fully closed → zero overlap,
        // immune to scrub lag at the hand-off seams (forward AND reverse).
        function setActive(on){ frames.forEach(function(f){ gsap.set(f, { "--active": on?1:0 }); }); }
        setActive(false); // start gated-closed; the pin's onToggle opens the gate

        var tl = gsap.timeline({
          scrollTrigger:{
            trigger:panel,
            start:"top top",
            end:"+="+(o.len||140)+"%",
            pin:pin,
            pinSpacing:true,
            scrub:0.85,                 // smoothing only — NOT snap; buttery on reverse too
            anticipatePin:1,
            invalidateOnRefresh:true,
            onToggle:function(self){ setActive(self.isActive); }
          }
        });

        // PHASE 1 — the line descends, painting the render in its wake.
        // The luminous line fades out exactly as it reaches the bottom (line "leaves" the frame).
        frames.forEach(function(f,idx){
          var delay = (o.stagger? idx*o.cascade : 0);
          tl.to(f, { "--sweep":0, "--kb":(o.kb1!=null?o.kb1:1.0),
                     duration:1.0, ease:"paint" }, delay);
        });
        lines.forEach(function(ln,idx){
          var delay = (o.stagger? idx*o.cascade : 0);
          tl.to(ln, { "--lineOn":0, duration:0.18, ease:"power1.out" }, delay+0.86);
        });

        // PHASE 2 — captions / overlays resolve as the line finishes
        if(o.onPaint) o.onPaint(tl, pin);

        // PHASE 3 — gentle hold (the render breathes / lingers before unpin)
        tl.to({}, { duration:(o.hold!=null?o.hold:0.35) });

        return tl;
      }

      /* 1 · HERO — the signature line-sweep as the ARRIVAL beat (one-time, on load).
         The visitor lands on a closed cream void (line at the top) and watches the
         luminous line descend, painting the facade in its wake. Autoplay + eased so
         the slicer is the star from frame one; the hero is then a normal full-bleed
         block that simply scrolls away (no pin → no seam with panel 2). */
      (function heroIntro(){
        var hero = document.querySelector("#hero");
        if (!hero) return;
        var frame = hero.querySelector(".frame");
        var line  = hero.querySelector(".frame__line");
        var rule  = hero.querySelector(".hero__rule");
        var title = hero.querySelector(".hero__title");
        var top   = hero.querySelector(".hero__top");
        var bot   = hero.querySelector(".hero__bot");

        gsap.set(frame, { "--sweep":1, "--active":1, "--kb":1.12, "--ky":"0%" }); // closed at top, gate open
        gsap.set(line,  { "--lineOn":1 });
        gsap.set(rule,  { scaleX:0 });
        gsap.set([title, top, bot], { autoAlpha:0, y:10 });

        var intro = gsap.timeline({ delay:0.18 });
        intro
          .to(top, { autoAlpha:1, y:0, duration:.7, ease:"air" }, 0)
          .to(rule, { scaleX:1, duration:.9, ease:"air" }, 0.1)
          // the LINE-SWEEP paints the hero downward
          .to(frame, { "--sweep":0, "--kb":1.0, duration:1.65, ease:"paint" }, 0.15)
          .to(line,  { "--lineOn":0, duration:.3, ease:"power1.out" }, 1.55)
          .to(title, { autoAlpha:1, y:0, duration:1.0, ease:"air" }, 0.65)
          .to(bot,   { autoAlpha:1, y:0, duration:.8, ease:"air" }, 1.0);

        // gentle scroll parallax as the hero leaves (no pin, just transform/opacity)
        gsap.to(hero.querySelector(".hero__meta"), {
          yPercent:-6, autoAlpha:0.0, ease:"none",
          scrollTrigger:{ trigger:hero, start:"top top", end:"bottom top", scrub:0.6 }
        });
        gsap.to(frame, {
          "--ky":"-3%", ease:"none",
          scrollTrigger:{ trigger:hero, start:"top top", end:"bottom top", scrub:0.6 }
        });

        // ZERO-OVERLAP GUARD for the hero: gate its render closed (--active:0) the
        // moment it scrolls out of view, re-open the gate when it returns to top.
        // Instant gate = immune to scrub lag; no paint alongside panel 2 ever.
        ScrollTrigger.create({
          trigger:hero, start:"bottom top", end:"bottom top",
          onLeave:function(){ gsap.set(frame, { "--active":0 }); },
          onEnterBack:function(){ gsap.set(frame, { "--active":1 }); }
        });
      })();

      /* 2 · CONTAINED COLUMN — big portrait + small inset cascade (the two-scale pairing).
         Two frames, but BOTH belong to ONE panel and ONE render-section — no other
         render-section is on screen. They share the cream field, not the photo plane. */
      if (document.querySelector("#col")) sweepPanel({
        sel:"#col", len:150, kb0:1.08, kb1:1.0, hold:0.40,
        stagger:true, cascade:0.16
      });

      /* 3 · BREATHER — night reset; caption resolves after the paint */
      if (document.querySelector("#breather")) sweepPanel({
        sel:"#breather", len:130, kb0:1.10, kb1:1.0, hold:0.34,
        onSet:function(pin){ gsap.set(pin, { "--sweep":1, "--cap":0 }); },
        onPaint:function(tl, pin){
          tl.fromTo(pin, { "--sweep":1 }, { "--sweep":0, duration:1.0, ease:"paint" }, 0); // veil
          tl.fromTo(pin, { "--cap":0 }, { "--cap":1, duration:.55, ease:"air" }, 0.78);
        }
      });

      /* 4 · SHOWPIECE — CLIMAX. The line lingers, the render breathes UP a touch,
         caption resolves. Biggest cream air; the single most important render. */
      if (document.querySelector("#show")) sweepPanel({
        sel:"#show", len:165, kb0:1.06, kb1:1.045, hold:0.55,
        onSet:function(pin){ gsap.set(pin, { "--cap":0 }); },
        onPaint:function(tl, pin){
          // a slow, deliberate breath UP for the showpiece as the line finishes
          tl.to(".show__frame .frame__img", { "--ky":"-2.4%", duration:.9, ease:"air" }, 0.55);
          tl.fromTo(pin, { "--cap":0 }, { "--cap":1, duration:.5, ease:"air" }, 0.92);
        }
      });

      /* 5 · DIM QUOTE — render paints, then dims back under the type; page closes on words */
      if (document.querySelector("#quote")) sweepPanel({
        sel:"#quote", len:150, kb0:1.08, kb1:1.0, hold:0.40,
        onSet:function(pin){ gsap.set(pin, { "--sweep":1, "--cap":0 }); },
        onPaint:function(tl, pin){
          tl.fromTo(pin, { "--sweep":1 }, { "--sweep":0, duration:1.0, ease:"paint" }, 0); // veil dims
          tl.fromTo(pin, { "--cap":0 }, { "--cap":1, duration:.6, ease:"air" }, 0.74);
        }
      });

      // progress spine
      if (progFill) ScrollTrigger.create({
        start:0, end:"max",
        onUpdate:function(self){ progFill.style.setProperty("--p", self.progress.toFixed(4)); }
      });

      ScrollTrigger.refresh();
      // re-refresh once hero render is decoded (correct pin metrics)
      var heroImg = document.querySelector("#hero .frame__img img");
      if(heroImg && !heroImg.complete){ heroImg.addEventListener("load", function(){ ScrollTrigger.refresh(); }, {once:true}); }

      probe();
      return { refresh:function(){ ScrollTrigger.refresh(); }, kill:function(){
        ScrollTrigger.getAll().forEach(function(s){ s.kill(); });
      } };
    }catch(e){
      global.__LAB_OK__ = false;
      if (global.console) console.error("[slicer-reveal/vertical-line-sweep] build failed", e);
      return null;
    }
  }

  function probe(){
    try{
      var ok = !!(global.gsap && global.ScrollTrigger && global.CustomEase &&
        document.querySelectorAll(".frame__img").length >= 5 &&
        document.querySelectorAll(".frame__line").length >= 5);
      global.__LAB_OK__ = ok;
    }catch(e){ global.__LAB_OK__ = false; }
  }

  global.SlicerLineSweep = { init: init };
})(typeof window !== "undefined" ? window : this);
