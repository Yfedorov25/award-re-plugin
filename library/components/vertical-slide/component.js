/* ============================================================================
   vertical-slide/component.js — Vertical clean-slide (film advance)
   ----------------------------------------------------------------------------
   Recorded 1:1 from apps/quadro/public/slide-lab/vs3-parallax-depth-layers.html
   (the "vs3 · parallax depth layers" prototype, owner-rated 9/10, OVERLAP:NONE).

   THE TECHNIQUE — a VERTICAL CLEAN-SLIDE (film advance).
   ONE rigid .track (a flex column of slides, each = a big render frame + an
   atomic caption) translates UP via a single track.y (translateY) on a pinned
   scrub. Because PITCH (slide height = centre-to-centre travel) is LARGER than
   the frame height by more than one viewport, the outgoing cel fully exits the
   top edge BEFORE the incoming cel reaches centre => ZERO image overlap BY
   CONSTRUCTION. Per-slide three-plane parallax (frame / image / caption ride
   slightly different vertical rates = depth). The final terrace slide is the
   CLIMAX: the timeline HOLDS the column on it while the frame opens biggest.
   Reverse is the exact inverse (a single linear tween reversed).

   ── THE ZERO-OVERLAP GEOMETRY (the real proof — preserved EXACTLY from vs3) ──
     • PITCH (distance between two render CENTRES) = 200vh.   [CSS --pitch]
     • FRAME height (the photo)                   =  76vh.   [CSS --frameH]
     • clear void GAP = PITCH - FRAME = 200 - 76 = 124vh  >  one viewport (100vh).
     => 24vh of margin per side at rest. Worst case at climax: grown frame ≤94vh
        + image lag ≤2.4vh = reach ≤96.4vh < 124vh => still >100vh clear at peak.
     The JS pitch MUST equal the CSS --pitch: pitchPx() = innerHeight * 2.00.
     Do NOT change PITCH/frameH without re-proving the gap.

   STACK: vanilla + GSAP 3.12.5 + ScrollTrigger + CustomEase. No build step.
   Motion is transform/opacity ONLY on scrub (track.y + bounded inner offsets +
   the --peak climax). No clip-path / mix-blend / backdrop-filter as the swap.
   No video.currentTime. No WebGL.

   USAGE — window-global IIFE, faithful entry:
     VerticalSlide.init({
       stageSel: '#stage',         // the pinned stage (clean clip box)
       trackSel: '#track',         // the rigid column that translates on Y
       fillSel:  '#progFill',      // optional scroll-progress fill
       slides: [{                  // builds the vs3 DOM if stage is empty
         img, alt, eye, title, sub,        // render + atomic caption
         capSide:'left'|'right',           // caption corner
         brkNum, brkWord,                  // void ordinal + label (omit on s0)
         origin, kb0, kb1, par, cap, brk,  // the per-slide depth MODEL row
         climax:false                      // true on the held final slide
       }, ...],
       move: 0.80,                 // timeline fraction spent translating (rest = HOLD)
       scrub: 0.8,                 // ScrollTrigger smoothing (NOT snap)
       pitchVh: 2.00,              // pitch in viewport-heights (== CSS --pitch / 100vh)
       endMult: 1.55               // pin length = (N-1) * innerHeight * endMult
     });
   If `slides` is omitted, the engine drives whatever vs3-shaped DOM already
   exists inside the stage (the SMALLER faithful change). Either way the motion
   math below is byte-faithful to vs3.
   ========================================================================== */
(function (global) {
  "use strict";

  /* the recorded vs3 default per-slide depth MODEL (used when a slide omits its
     own row). kb = ken-burns scale; par = DEEP plane image lag (|par|<=2.4vh);
     cap = NEAR plane caption lead (|cap|<=1.6vh); brk = void ordinal parallax. */
  var DEFAULT_MODEL = [
    { origin:"50% 42%", kb0:1.10, kb1:1.03, par: 2.2, cap:-1.4, brk: 2.4 }, // aerial — portrait
    { origin:"44% 50%", kb0:1.08, kb1:1.02, par: 1.8, cap:-1.2, brk:-2.4 }, // day-front — landscape
    { origin:"52% 44%", kb0:1.09, kb1:1.03, par: 2.4, cap:-1.6, brk: 2.4 }, // night-pergola — deepest lag
    { origin:"50% 50%", kb0:1.07, kb1:1.02, par: 1.4, cap:-1.0, brk:-2.4 }, // macro-roof — detail
    { origin:"50% 40%", kb0:1.08, kb1:1.03, par: 2.0, cap:-1.3, brk: 2.4 }, // terrace-05 — golden
    { origin:"50% 36%", kb0:1.05, kb1:1.10, par: 2.4, cap:-1.6, brk:-2.4 }  // terrace-04 — CLIMAX, deepest push
  ];

  function esc(s){
    return String(s == null ? "" : s)
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }
  /* title/sub/eye may carry the vs3 <br> + <em> markup — pass them through. */
  function rich(s){ return (s == null) ? "" : String(s); }

  /* Build the vs3 slide markup 1:1 when the stage is empty. The caption lives
     INSIDE .frame => atomic with its render (rigid block). */
  function buildSlide(d, i){
    var climax = !!d.climax;
    var brk = (i === 0)
      ? '<div class="brk"><div class="brk__inner"><span class="brk__line"></span></div></div>'
      : '<div class="brk"><div class="brk__inner">'
          + (d.brkNum  ? '<span class="brk__num">' + esc(d.brkNum) + '</span>'   : '')
          + '<span class="brk__line"></span>'
          + (d.brkWord ? '<span class="brk__word">' + esc(d.brkWord) + '</span>' : '')
        + '</div></div>';
    var capClass = (d.capSide === "right") ? "cap is-right" : "cap";
    return ''
      + '<article class="slide' + (climax ? ' is-climax' : '') + '" data-i="' + i + '">'
      +   brk
      +   '<div class="frame">'
      +     '<img class="frame__img" src="' + esc(d.img) + '" alt="' + esc(d.alt || "") + '" '
      +          (i === 0 ? 'loading="eager" decoding="async" fetchpriority="high"' : 'loading="lazy" decoding="async"') + '>'
      +     '<div class="frame__shade"></div>'
      +     '<div class="frame__scrim"></div>'
      +     '<figure class="' + capClass + '">'
      +       '<figcaption class="cap__eye">' + rich(d.eye) + '</figcaption>'
      +       '<div class="cap__title">' + rich(d.title) + '</div>'
      +       (d.sub ? '<p class="cap__sub">' + rich(d.sub) + '</p>' : '')
      +     '</figure>'
      +   '</div>'
      + '</article>';
  }

  function init(opts){
    opts = opts || {};
    var cfg = {
      stageSel: opts.stageSel || "#stage",
      trackSel: opts.trackSel || "#track",
      fillSel:  opts.fillSel  || "#progFill",
      slides:   opts.slides   || null,
      move:     (opts.move    != null) ? opts.move    : 0.80,   // MOVE fraction
      scrub:    (opts.scrub   != null) ? opts.scrub   : 0.8,    // smoothing, NOT snap
      pitchVh:  (opts.pitchVh != null) ? opts.pitchVh : 2.00,   // == CSS --pitch/100vh
      endMult:  (opts.endMult != null) ? opts.endMult : 1.55    // pin-length multiplier
    };

    try{
      gsap.registerPlugin(ScrollTrigger, CustomEase);
      if (!gsap.parseEase("air")) CustomEase.create("air","0.25,0.74,0.22,0.99");

      var reduce = global.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches;
      var narrow = global.matchMedia && matchMedia("(max-width:760px)").matches;

      var stage = typeof cfg.stageSel === "string" ? document.querySelector(cfg.stageSel) : cfg.stageSel;
      var track = typeof cfg.trackSel === "string" ? document.querySelector(cfg.trackSel) : cfg.trackSel;
      if (!stage || !track) return null;

      /* build the rigid column from data ONLY if the track is empty — otherwise
         drive the vs3-shaped DOM already present (the SMALLER faithful change). */
      var modelFromData = null;
      if (cfg.slides && cfg.slides.length && track.querySelectorAll(".slide").length === 0){
        track.innerHTML = cfg.slides.map(buildSlide).join("");
        modelFromData = cfg.slides;
      }

      var slides = Array.prototype.slice.call(stage.querySelectorAll(".slide"));
      var imgs   = slides.map(function(s){ return s.querySelector(".frame__img"); });
      var frames = slides.map(function(s){ return s.querySelector(".frame"); });
      var caps   = slides.map(function(s){ return s.querySelector(".cap"); });
      var scrims = slides.map(function(s){ return s.querySelector(".frame__scrim"); });
      var brks   = slides.map(function(s){ return s.querySelector(".brk__inner"); });
      var fill   = typeof cfg.fillSel === "string" ? document.querySelector(cfg.fillSel) : cfg.fillSel;
      var N      = slides.length;

      /* the per-slide depth model: prefer the data row, else the recorded default. */
      var MODEL = slides.map(function(s, i){
        var d = modelFromData ? modelFromData[i] : null;
        var base = DEFAULT_MODEL[i] || DEFAULT_MODEL[DEFAULT_MODEL.length - 1];
        if (!d) return base;
        return {
          origin: d.origin != null ? d.origin : base.origin,
          kb0:    d.kb0    != null ? d.kb0    : base.kb0,
          kb1:    d.kb1    != null ? d.kb1    : base.kb1,
          par:    d.par    != null ? d.par    : base.par,
          cap:    d.cap    != null ? d.cap    : base.cap,
          brk:    d.brk    != null ? d.brk    : base.brk
        };
      });

      // STATIC PATH — collapse, no pin. Legible BIG-image stack from the CSS
      // @media fallback (the .static block in the DOM). No motion at all.
      if (reduce || narrow){
        stage.style.display = "none";
        document.body.classList.add("ready");
        global.__LAB_OK__ = !!(global.gsap && global.ScrollTrigger &&
          document.querySelectorAll(".static__shot").length >= 3);
        return { reduced:true, n:N, refresh:function(){ ScrollTrigger.refresh(); }, kill:function(){} };
      }

      // PITCH (centre-to-centre travel per step) in PIXELS. Must match the CSS
      // --pitch:200vh so the JS travel and the DOM layout agree exactly.
      function pitchPx(){ return global.innerHeight * cfg.pitchVh; }
      function centerOffset(){ return global.innerHeight/2 - pitchPx()/2; }

      slides.forEach(function(s,i){
        var m = MODEL[i];
        imgs[i].style.transformOrigin = m.origin;
        // start each at the "incoming" parallax extreme (image lagged down,
        // caption lifted up) with settle 0 (small scale-down).
        gsap.set(imgs[i],  { "--kb":m.kb0, "--par": (m.par)+"vh" });
        gsap.set(caps[i],  { "--capPar": (m.cap)+"vh" });
        gsap.set(frames[i],{ "--settle":0 });
        gsap.set(brks[i],  { "--brkPar": (m.brk)+"vh" });
        gsap.set(scrims[i],{ opacity: i===0 ? 1 : 0.85 });
      });
      gsap.set(track, { y:centerOffset() });      // first frame centred at start
      gsap.set(stage, { "--peak":0 });

      document.body.classList.add("ready");

      function travelEndY(){ return centerOffset() - (N - 1) * pitchPx(); }

      // TIMELINE SHAPE (total = 1.0):
      //   • MOVE (0 .. MOVE) — track translates at CONSTANT velocity. Pure
      //     linear scrub on ONE property => smooth, reversible, NO snap.
      //   • HOLD (MOVE .. 1) — track STATIONARY on the terrace; climax breath.
      var MOVE = cfg.move;
      var seg  = MOVE / (N - 1);

      var tl = gsap.timeline({
        defaults:{ ease:"none" },
        scrollTrigger:{
          trigger: stage,
          start:"top top",
          end:function(){ return "+=" + Math.round((N - 1) * global.innerHeight * cfg.endMult); },
          pin:true,
          pinSpacing:true,
          scrub:cfg.scrub,                     // smoothing only — NOT snap
          invalidateOnRefresh:true,
          onRefreshInit:function(){ gsap.set(track, { y:centerOffset() }); },
          onUpdate:function(self){
            if (fill) fill.style.transform = "scaleY(" + self.progress.toFixed(4) + ")";
            stage.classList.toggle("is-finished", self.progress > 0.04);
          }
        }
      });

      // THE advance: ONE linear tween on track.y, constant velocity, reversible.
      tl.to(track, { y:travelEndY, duration:MOVE, ease:"none" }, 0);

      // --peak ramps across the HOLD only (climax growth gated to stationary).
      tl.to(stage, { "--peak":1, ease:"power1.out", duration:(1 - MOVE) }, MOVE);

      // Per-slide depth choreography. Each slide's three planes resolve across
      // its own leg: the image parallax (--par) eases from the incoming extreme
      // THROUGH zero (at centre) to the opposite, the caption (--capPar) mirrors
      // it, the frame scale-SETTLES to 1 at centre, ken-burns eases kb0->kb1,
      // and the void ordinal parallaxes opposite. ALL bounded inner transforms —
      // none of them move WHICH frame is centred, so none can cause overlap.
      slides.forEach(function(s,i){
        var m = MODEL[i];
        var start = Math.max(0, (i - 0.5) * seg);
        var end   = Math.min(MOVE, (i + 0.5) * seg);
        if(i === N - 1) end = 1;              // climax keeps breathing in HOLD
        var dur = end - start;
        var half = dur / 2;

        // DEEP plane: image lags from +par (incoming) → 0 (centre) → -par (exit).
        tl.fromTo(imgs[i], { "--par": (m.par)+"vh" },
                           { "--par": (-m.par)+"vh", ease:"none", duration:dur }, start);
        // ken-burns scale settles over the same span.
        tl.fromTo(imgs[i], { "--kb":m.kb0 },
                           { "--kb":m.kb1, ease:"sine.inOut", duration:dur }, start);

        // NEAR plane: caption leads, mirror of the image (opposite sign).
        tl.fromTo(caps[i], { "--capPar": (m.cap)+"vh" },
                           { "--capPar": (-m.cap)+"vh", ease:"none", duration:dur }, start);

        // MASTER plane scale-SETTLE: 0 (incoming) → 1 (centre) → back toward 0.
        // Frame "lands" as it reaches the middle of its leg.
        tl.to(frames[i], { "--settle":1, ease:"sine.out", duration:half }, start);
        if(i !== N - 1){
          tl.to(frames[i], { "--settle":0.55, ease:"sine.in", duration:half }, start + half);
        }

        // void ordinal: parallax opposite the rise.
        tl.fromTo(brks[i], { "--brkPar": (m.brk)+"vh" },
                           { "--brkPar": (-m.brk)+"vh", ease:"none", duration:dur }, start);

        // scrim ramps in for caption legibility.
        tl.to(scrims[i], { opacity:1, ease:"sine.out", duration:Math.min(dur, seg) }, start);
      });

      ScrollTrigger.refresh();

      // ---- probe: assert engine, ONE moving surface, pinned, duration>0 ----
      var pinned = ScrollTrigger.getAll().some(function(st){ return st.pin; });
      var oneTrack = document.querySelectorAll(".track").length === 1;
      global.__LAB_OK__ = !!(global.gsap && global.ScrollTrigger &&
        slides.length >= 3 && oneTrack && pinned && tl.duration() > 0);

      return {
        n: N,
        timeline: tl,
        refresh: function(){ ScrollTrigger.refresh(); },
        kill: function(){
          if (tl.scrollTrigger) tl.scrollTrigger.kill();
          tl.kill();
        }
      };
    }catch(err){
      try{
        var ok = !!(global.gsap && global.ScrollTrigger &&
          document.querySelectorAll(".slide").length >= 3 &&
          document.querySelectorAll(".cap").length >= 3);
        global.__LAB_OK__ = ok;
        document.body.classList.add("ready");
      }catch(e){ global.__LAB_OK__ = false; }
      if(global.console) console.warn("[vertical-slide] init guarded:", err && err.message);
      return null;
    }
  }

  global.VerticalSlide = { init: init };
})(typeof window !== "undefined" ? window : this);
