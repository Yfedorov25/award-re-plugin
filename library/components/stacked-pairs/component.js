/* ============================================================
   STACKED-PAIRS · component.js   (vanilla + GSAP 3.12.5 + ScrollTrigger
   + CustomEase + guarded Lenis 1.1.13)
   BASE = frs11-stacked-pairs  (owner-approved: "це залишаємо")
   Re-extracted BYTE-FAITHFULLY from
     apps/quadro/public/slide-lab/frs11-stacked-pairs.html
   ------------------------------------------------------------
   NOT a pinned stepper. A VERTICAL RHYTHM of distinct full-screen
   sections; each section = TEXT on the LEFT + a BIG contained RENDER on
   the RIGHT (the frs7 composition). You scroll from one PAIR to the
   NEXT. There is NO pin, NO swap, NO clip — a quiet editorial vertical
   sequence (the alternative to slice-clip / focus-render-switch).

   THE MOVE (what the eye sees), per section, AS IT ENTERS the viewport:
     • the render rises (y 46->0) + fades a touch (opacity 0->1; the IMG
       itself stays opaque), the far-left bronze rule fades + grows
       (scaleY 0.6->1), and the text bits (index, title, sub) rise in a
       gentle air-eased stagger.
     • the reveal completes by ~55% of the section's entrance travel and
       then HOLDS while the section is centred (it does NOT keep moving).
     • a SLOW continuous ken-burns runs on the render the whole time the
       section is on screen (scale 1.06 -> 1.12), monotonic across the
       section's full pass (top bottom -> bottom top). Image-only, never
       resets, never blanks.
     • Reverse-safe: scrubbing back runs the SAME pure render(progress)
       backward.

   WHY PURE render(progress) AND NOT toggleActions (the bug this fixes):
     The FIRST version of frs11 used a toggleActions tween and it FAILED
     to fire on load (sections already in view never got their "enter"
     callback). The FIX is a PURE function of the section's own viewport
     progress, driven from a scrubbed ScrollTrigger's onUpdate + painted
     ONCE at init from the trigger's current progress. Correct on load,
     on jump, and on reverse. DO NOT reintroduce toggleActions.

   THE TWO TRIGGERS PER SECTION (both scrub:true, no pin):
     1. REVEAL   — start "top 85%"  end "top 35%"  · onUpdate: render(p).
        p = 0 when the section top hits 85% of the viewport, 1 when it
        reaches 35% (i.e. as it rises into view). The reveal maps to p.
        An init ScrollTrigger is created, render() is called once at its
        current progress, then it is killed (correct first frame).
     2. KEN-BURNS — start "top bottom" end "bottom top" · gsap.fromTo the
        img scale 1.06 -> 1.12 ease "none". Monotonic across the WHOLE
        travel through the viewport; never resets.

   ENGINE LAWS (verbatim from frs11): ONE smoother — Lenis 1.1.13 lerp 0.1
     smoothWheel -> gsap.ticker -> ScrollTrigger.update; lagSmoothing(0).
     No raw native scrub. GSAP 3.12.5. CustomEase "air" = 0.25,0.74,0.22,0.99.
     Fraunces + Inter; bronze #c08a4e; transform / opacity ONLY; NO
     mask-composite; NO mix-blend / backdrop over the scrubbed surface; NO
     video.currentTime; NO WebGL; reduced-motion / <=820px -> static
     legible stack (no Lenis, no triggers); zero em-dashes in visible copy.

   ENTRY POINT (the REAL signature on disk — declared in RECIPE)
   ------------------------------------------------------------
     StackedPairs.init(target, options)
       target  — a container element OR a selector string (default
                 '#pairs'). If it already holds .pair sections they are
                 used as-is; otherwise the pairs are BUILT into it from
                 the slides array.
       options (all optional):
         { slides,        // [{src,tag,idx,title,sub,objPos}] — else DEFAULT_SLIDES
                          //   (only used to BUILD pairs when target is empty)
           lerp,          // Lenis smoothing (default 0.1)
           revealStart, revealEnd,   // reveal trigger bounds (defaults "top 85%" / "top 35%")
           kenStart, kenEnd,         // ken-burns trigger bounds (defaults "top bottom" / "bottom top")
           kenFrom, kenTo,           // ken-burns scale (defaults 1.06 -> 1.12)
           revealSpan, textSpan,     // reveal-window fractions (defaults 0.55 / 0.42)
           manageLenis }  // false => caller owns Lenis/ticker (default true)
       Returns { triggers, sections, lenis, refresh, destroy }
         (or { static:true, sections, destroy } in the reduced-motion /
         narrow branch).
   The lab/integration provides (or lets init build) the #pairs container
   and calls StackedPairs.init('#pairs', { ... }).

   DEPENDENCIES (load before this file):
     gsap 3.12.5, ScrollTrigger, CustomEase, Lenis 1.1.13
   ============================================================ */

(function (global) {
  'use strict';

  /* faithful frs11 SLIDES (byte-for-byte from frs11-stacked-pairs.html).
     Honest Fedoriv copy, zero em-dashes. Only used to BUILD pairs when the
     target container is empty; the lab/integration can override via
     options.slides or by authoring the .pair markup directly. */
  var DEFAULT_SLIDES = [
    { src:"renders/day-34-portrait.webp", tag:"Ранок", idx:"01",
      title:"Ранок <em>приходить</em> першим", sub:"Світло лягає на фасад раніше, ніж прокидається вулиця." },
    { src:"renders/night-front.webp", tag:"Вечір", idx:"02", objPos:"50% 42%",
      title:"Вечір <em>теплішає</em>", sub:"Світло вмикається зсередини, і дім видно здалеку." },
    { src:"renders/terrace-04.webp", tag:"Тераса", idx:"03",
      title:"Кава над <em>водою</em>", sub:"Тераса, тиша і власний берег на відстані кроку." },
    { src:"renders/macro-roof.webp", tag:"Матеріал", idx:"04",
      title:"Клінкер <em>зблизька</em>", sub:"Тепла цегла, обпалена вручну. Фактура, яку хочеться торкнути." },
    { src:"renders/aerial.webp", tag:"Згори", idx:"05",
      title:"Увесь дім <em>з висоти</em>", sub:"Крок назад, і ділянка читається цілою картиною." },
    { src:"renders/day-08.webp", tag:"Всередині", idx:"06",
      title:"І життя <em>всередині</em>", sub:"За фасадом простір, у якому хочеться лишитися." }
  ];

  var DEFAULTS = {
    slides: null,                 // built into the target only if it has no .pair children
    lerp: 0.1,                    // Lenis smoothing
    revealStart: 'top 85%',       // reveal trigger: p=0 when section top hits 85% of viewport
    revealEnd: 'top 35%',         //                 p=1 when it reaches 35%
    kenStart: 'top bottom',       // ken-burns trigger: full pass through the viewport
    kenEnd: 'bottom top',
    kenFrom: 1.06,                // ken-burns scale start
    kenTo: 1.12,                  // ken-burns scale end (monotonic, never resets)
    revealSpan: 0.55,             // the render/bar reveal completes by this fraction of the travel, then holds
    textSpan: 0.42,               // each text bit reveals over this fraction (staggered later per bit)
    manageLenis: true             // false => caller already runs Lenis + gsap.ticker -> ScrollTrigger.update
  };

  function clamp01(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }

  /* the section markup (byte-faithful to frs11 pairHTML) — only used when
     the target container is empty and we build from a slides array. */
  function pairHTML(s, N){
    return '<section class="pair">'
         +   '<div class="pair__bar"></div>'
         +   '<div class="pair__text">'
         +     '<span class="pair__idx">'+s.idx+' / 0'+N+'</span>'
         +     '<h2 class="pair__title">'+s.title+'</h2>'
         +     '<p class="pair__sub">'+s.sub+'</p>'
         +   '</div>'
         +   '<div class="pair__media">'
         +     '<img src="'+s.src+'" alt="QUADRO" loading="lazy" decoding="async" style="object-position:'+(s.objPos||"50% 48%")+'">'
         +     '<div class="grade"></div><span class="pair__tag">'+s.tag+'</span>'
         +   '</div>'
         + '</section>';
  }

  function init(target, userOpts) {
    var opt = Object.assign({}, DEFAULTS, userOpts || {});
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, CustomEase = global.CustomEase, Lenis = global.Lenis;

    var host = (typeof target === 'string') ? document.querySelector(target)
             : (target && target.nodeType === 1) ? target
             : document.querySelector('#pairs');

    try {
      if (!host) throw new Error('stacked-pairs: target container not found');
      gsap.registerPlugin(ScrollTrigger, CustomEase);
      CustomEase.create("air","0.25,0.74,0.22,0.99");

      // Build the pairs from slides ONLY if the host has no .pair children yet
      // (otherwise the authored markup is used verbatim).
      var existing = host.querySelectorAll('.pair');
      var SLIDES = (Array.isArray(opt.slides) && opt.slides.length) ? opt.slides : DEFAULT_SLIDES;
      if (existing.length === 0) {
        var N = SLIDES.length;
        host.innerHTML = SLIDES.map(function(s){ return pairHTML(s, N); }).join("");
      }

      var sections = Array.prototype.slice.call(host.querySelectorAll('.pair'));
      var N2 = sections.length;

      var reduce = global.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches;
      var narrow = global.matchMedia && matchMedia("(max-width:820px)").matches;
      if (reduce || narrow) {
        document.body.classList.add("is-static","ready");
        global.__LAB_OK__ = !!(N2 >= 1);
        return { static:true, sections:sections, destroy:function(){} };
      }

      // ---- ONE smoother: Lenis lerp 0.1 -> gsap.ticker -> ScrollTrigger.update ----
      var lenis = null, rafFn = null;
      if (opt.manageLenis) {
        gsap.ticker.lagSmoothing(0);
        lenis = new Lenis({ lerp:opt.lerp, smoothWheel:true, wheelMultiplier:1 });
        lenis.on("scroll", ScrollTrigger.update);
        rafFn = function(t){ lenis.raf(t*1000); };
        gsap.ticker.add(rafFn);
        global.__lenis = lenis;
      }

      document.body.classList.add("ready");

      var airEase = gsap.parseEase("air");
      var triggers = [];

      // Each section is driven by a PURE function of its own viewport progress
      // (reverse-safe, correct on load/jump — NO toggleActions). The reveal
      // plays as the section rises into the lower-middle of the screen and is
      // fully settled by the time it is centred; it stays settled while centred.
      sections.forEach(function(sec){
        var bar = sec.querySelector(".pair__bar");
        var media = sec.querySelector(".pair__media");
        var img = sec.querySelector(".pair__media img");
        var bits = [ sec.querySelector(".pair__idx"), sec.querySelector(".pair__title"), sec.querySelector(".pair__sub") ];

        function render(self){
          // self.progress: 0 when section top hits revealStart of viewport, 1 when
          // it reaches revealEnd (i.e. as it rises into view). Reveal maps to this.
          var p = self.progress;
          var rev = airEase(clamp01(p / opt.revealSpan));   // reveal completes by revealSpan of the travel, then holds
          // media rises + fades in (opacity only 0->1; the IMG itself is opaque)
          if (media) gsap.set(media, { y:(1-rev)*46, opacity:rev });
          if (bar)   gsap.set(bar,   { opacity:rev, scaleY:0.6 + 0.4*rev, transformOrigin:"50% 50%" });
          // text stagger: each bit reveals on a slightly later slice of rev
          for (var k=0;k<bits.length;k++){
            if (!bits[k]) continue;
            var br = airEase(clamp01((p - 0.06 - k*0.05) / opt.textSpan));
            gsap.set(bits[k], { y:(1-br)*26, opacity:br });
          }
          // slow continuous ken-burns across the WHOLE pass of the section
          // (monotonic on full viewport progress, separate trigger below).
        }

        var stReveal = ScrollTrigger.create({
          trigger:sec, start:opt.revealStart, end:opt.revealEnd, scrub:true,
          onUpdate:render
        });
        triggers.push(stReveal);
        // initial paint at this section's current progress (correct on load)
        var stInit = ScrollTrigger.create({ trigger:sec, start:opt.revealStart, end:opt.revealEnd });
        render({ progress: stInit.progress });
        stInit.kill();

        // ken-burns: monotonic scale across the section's full travel through
        // the viewport (top bottom -> bottom top). Image-only, never resets.
        if (img) {
          gsap.set(img, { scale:opt.kenFrom });
          var tw = gsap.fromTo(img, { scale:opt.kenFrom }, {
            scale:opt.kenTo, ease:"none",
            scrollTrigger:{ trigger:sec, start:opt.kenStart, end:opt.kenEnd, scrub:true }
          });
          if (tw.scrollTrigger) triggers.push(tw.scrollTrigger);
        }
      });

      global.__LAB_OK__ = !!(global.gsap && global.ScrollTrigger && (!opt.manageLenis || global.Lenis) && N2 >= 1);
      requestAnimationFrame(function(){ ScrollTrigger.refresh(); });

      return {
        triggers: triggers,
        sections: sections,
        lenis: lenis,
        refresh: function(){ ScrollTrigger.refresh(); },
        destroy: function(){
          triggers.forEach(function(t){ if (t && t.kill) t.kill(); });
          if (lenis && rafFn) { gsap.ticker.remove(rafFn); lenis.destroy && lenis.destroy(); }
        }
      };
    } catch(e) {
      global.__LAB_OK__ = false;
      try { document.body.classList.add("is-static","ready"); } catch(_){}
      if (global.console) console.error("[stacked-pairs] build failed:", e);
      return { static:true, error:e, sections:[], destroy:function(){} };
    }
  }

  global.StackedPairs = {
    init: init,
    DEFAULTS: DEFAULTS,
    DEFAULT_SLIDES: DEFAULT_SLIDES
  };

})(window);
