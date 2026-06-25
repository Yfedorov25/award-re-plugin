/* ============================================================
   MEDIA-STEP-SWITCH · component.js   (vanilla + GSAP 3.12.5 + ScrollTrigger
   + CustomEase + guarded Lenis 1.1.13)
   BASE = msw4a-film-quote  (owner-approved, gate-passing: "FILM + QUOTE")
   Re-extracted BYTE-FAITHFULLY from
     apps/quadro/public/slide-lab/msw4a-film-quote.html
   ------------------------------------------------------------
   A PINNED full-bleed MEDIA STEPPER. The full-bleed render/video is the WHOLE
   background; typographic text steps float OVER it. Each step is a DIFFERENT
   text TYPE (BIG STATEMENT / VIDEO BEAT / QUOTE / NUMBER-FACT), NOT a uniform
   "benefit 1-2-3" card. The sequence WEAVES photos with a looping VIDEO beat
   (the river clip = the emotional centre). Clean sequence per beat: the TEXT
   settles FIRST -> a clear PAUSE -> THEN the media crossfades.

   SWAP MECHANISM (zero ghost / zero blank / never a diptych):
     * TWO stacked FULL-BLEED <layer>s (A=even parity, B=odd) fill the IDENTICAL
       stage rect. OUTGOING sits underneath (z1) FULLY OPAQUE the whole beat;
       INCOMING sits on top (z2) and fades opacity 0 -> 1 over it. Underneath is
       always opaque => media never see-through (no blank). Same rect => overlap
       ~1 => a crossfade, NOT a seam/diptych. An OPACITY crossfade of two GPU
       layers (NOT a per-frame clip-path on a decoding video — that tanks fps).
     * The lite VIDEO (renders/clip-river-lite.mp4, ~5MB light decode) lives in
       layer B (the only odd slide that is a video = step 02). Layer B holds an
       <img> poster AND the <video>; we toggle which paints. We NEVER scrub
       video.currentTime — muted-autoplay-loop while on stage, PAUSE when off.

   SMOOTHNESS (engineered for the REAL retina machine, not just the gate):
     * EVERY full-bleed media layer is its OWN GPU compositor layer:
       will-change:transform; transform:translateZ(0); backface-visibility:hidden.
       We animate ONLY opacity (swap) + transform (a tiny monotonic ken-burns)
       => the layers never repaint on the main thread.
     * NO clip-path on the full-screen surface; NO backdrop-filter ANYWHERE over
       the moving media; the text blocks have NO live blur.
     * ONE smoother: Lenis 1.1.13 lerp 0.09 (heavier glide) -> gsap.ticker ->
       ScrollTrigger.update; lagSmoothing(0); window.__lenis exposed.
     * PINNED stage, scrub:1, GENEROUS pin length (innerHeight*(N-1)*1.6) so the
       per-frame delta is tiny = buttery. render(prog) is a PURE fn of progress
       from onUpdate + render(0) at init (reverse-safe, correct on load/jump).
     * QUANTIZED DOM writes with skip-unchanged caches (fewer style invalidations
       per frame). Eager img.decode() up front (no decode spikes on scroll).

   GSAP 3.12.5. Fraunces + Inter; bronze #c08a4e; cream. NO WebGL. NO
   mask-composite, NO mix-blend / backdrop over the scrubbed surface, NO
   video.currentTime. reduced-motion / <=820px -> static legible stack. Zero
   em-dashes in visible copy. window.__LAB_OK__ probe.

   ENTRY POINT (the REAL signature on disk — declared in RECIPE)
   ------------------------------------------------------------
     MediaStepSwitch.init(target, options)   (alias: mediaStepSwitch(target, options))
       target  — the pinned stage element OR a selector string (default '#pin').
                 The component BUILDS the full-bleed layers + the four text
                 moments + chrome INTO the target (it expects an empty pin host).
       options (all optional):
         { steps,         // [{media, video, poster, el, type, enter{x,y}, objPos,
                          //   title, sub}] — else DEFAULT_STEPS (the faithful
                          //   msw4a photo->VIDEO->quote->number sequence)
           lerp,          // Lenis smoothing (default 0.09)
           pinFactor,     // pin length = innerHeight*(N-1)*pinFactor (default 1.6)
           dwell,         // scroll fraction used before the last step lands (0.88)
           wipeStart, wipeEnd,   // media-crossfade window within a beat (0.50/0.82)
           kenFrom, kenStep,     // ken-burns base + growth (1.04 + 0.05*progress)
           manageLenis }  // false => caller owns Lenis/ticker (default true)
       Returns { trigger, moments, layers, lenis, refresh, destroy }
         (or { static:true, moments, destroy } in the reduced-motion / narrow branch).

   DEPENDENCIES (load before this file):
     gsap 3.12.5, ScrollTrigger, CustomEase, Lenis 1.1.13
   ============================================================ */

(function (global) {
  'use strict';

  /* faithful msw4a STEPS (byte-for-byte from msw4a-film-quote.html). FOUR steps,
     FOUR text TYPES. Step index 1 = the lite river VIDEO (emotional centre).
     Each step names its media + which .moment block it lights + its own entry
     direction. Ukrainian Fedoriv copy, zero em-dashes. Only used to BUILD the
     stage when the target is empty. */
  var DEFAULT_STEPS = [
    { media:"renders/day-front.webp", el:"mStatement", type:"BIG STATEMENT",
      enter:{x:-46,y:0}, title:"Дім, що дивиться <em>на власну воду</em>",
      sub:"Великі вікна й тераса розвернуті до берега." },
    { media:"renders/clip-river-lite.mp4", video:true, poster:"renders/clip-river-poster.webp",
      el:"mVideo", type:"VIDEO BEAT", enter:{x:0,y:26},
      title:"Тиша, яку чути",
      sub:"Вода тече за крок від тераси, і це єдиний звук навколо." },
    { media:"renders/terrace.webp", el:"mQuote", type:"QUOTE", objPos:"50% 46%",
      enter:{x:0,y:34}, title:"Кава над водою",
      sub:"Ранок починається не з будильника, а з того, як світло лягає на воду." },
    { media:"renders/aerial.webp", el:"mNumber", type:"NUMBER", objPos:"50% 40%",
      enter:{x:-40,y:0}, title:"0 метрів до власного берега",
      sub:"Вода починається там, де закінчується ваша ділянка." }
  ];

  var DEFAULTS = {
    steps: null,            // built into an empty target; else DEFAULT_STEPS
    lerp: 0.09,             // Lenis smoothing (heavier glide)
    pinFactor: 1.6,         // pin length = innerHeight*(N-1)*pinFactor (generous)
    dwell: 0.88,            // scroll fraction used before the last step lands
    wipeStart: 0.50,        // media-crossfade opens here within a beat (after a long matched hold)
    wipeEnd: 0.82,          // media-crossfade closes here (TIGHT window => two layers co-composite briefly)
    kenFrom: 1.04,          // ken-burns base scale
    kenStep: 0.05,          // ken-burns growth across the whole pin (monotonic)
    manageLenis: true       // false => caller already runs Lenis + gsap.ticker -> ScrollTrigger.update
  };

  function clamp01(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }

  /* the four text-type moment blocks, byte-faithful to msw4a markup. Keyed by
     the step's `el` id so DEFAULT_STEPS (or any author) maps cleanly. */
  var MOMENT_HTML = {
    mStatement:
        '<div class="moment m-statement" id="mStatement">'
      +   '<span class="eyebrow">QUADRO HOUSE</span>'
      +   '<h2>Дім, що дивиться <em>на власну воду</em></h2>'
      + '</div>',
    mVideo:
        '<div class="moment m-video" id="mVideo">'
      +   '<p>Вода тече за крок від тераси. І це єдиний звук навколо.</p>'
      + '</div>',
    mQuote:
        '<div class="moment m-quote" id="mQuote">'
      +   '<div class="rule"></div>'
      +   '<blockquote>Тут ранок починається не з будильника, а з того, як світло лягає на воду.</blockquote>'
      +   '<div class="rule"></div>'
      +   '<cite>життя на березі</cite>'
      + '</div>',
    mNumber:
        '<div class="moment m-number" id="mNumber">'
      +   '<span class="label">до власного берега</span>'
      +   '<div class="figure"><span class="num">0</span><span class="unit">метрів</span></div>'
      +   '<p class="foot">Вода починається там, де закінчується ваша ділянка.</p>'
      + '</div>'
  };
  function momentHTML(s){
    if (MOMENT_HTML[s.el]) return MOMENT_HTML[s.el];
    // generic fallback for a custom step id: a centred quote-style block
    return '<div class="moment m-quote" id="'+s.el+'"><blockquote>'+(s.title||'')+'</blockquote></div>';
  }

  /* build the full-bleed stage (two GPU layers + four moments + chrome) into an
     empty pin host. Byte-faithful to the msw4a DOM. */
  function buildStage(host, STEPS){
    var vstep = null;
    for (var i=0;i<STEPS.length;i++){ if (STEPS[i].video){ vstep = STEPS[i]; break; } }
    var imgA0 = STEPS[0] ? STEPS[0].media : 'renders/day-front.webp';
    var imgB0 = (function(){ for (var j=1;j<STEPS.length;j++){ if(!STEPS[j].video) return STEPS[j].media; } return STEPS[1] ? STEPS[1].media : ''; })();
    var html =
        '<div class="media" id="media">'
      +   '<div class="layer" id="layerA">'
      +     '<img id="imgA" src="'+imgA0+'" alt="QUADRO" fetchpriority="high" decoding="async">'
      +   '</div>'
      +   '<div class="layer" id="layerB">'
      +     '<img id="imgB" src="'+imgB0+'" alt="QUADRO" decoding="async">';
    if (vstep) {
      html +=
            '<video class="vid" id="vid" muted loop playsinline preload="auto" poster="'+(vstep.poster||'')+'">'
      +       '<source src="'+vstep.media+'" type="video/mp4">'
      +     '</video>';
    }
    html +=
          '</div>'
      +   '<div class="grade"></div>'
      +   '<div class="stage-text">'
      +     STEPS.map(momentHTML).join('')
      +   '</div>'
      +   '<span class="vtag" id="vtag">Відео</span>'
      +   '<div class="counter" id="counter">01 / 0'+STEPS.length+'</div>'
      +   '<div class="stepper" id="stepper"></div>'
      +   '<span class="credit">Візуалізація</span>'
      +   '<div class="progress"><div class="progress__fill" id="progFill"></div></div>'
      + '</div>';
    host.innerHTML = html;
  }

  /* static fallback deck (reduced-motion / narrow) — byte-faithful to msw4a buildStatic */
  function buildStatic(STEPS){
    var s = document.getElementById("static");
    if (!s) { s = document.createElement('div'); s.className = 'static'; s.id = 'static'; document.body.appendChild(s); }
    var N = STEPS.length;
    var html = '';
    STEPS.forEach(function(st,i){
      var media = st.video
        ? '<video src="'+st.media+'" poster="'+(st.poster||'')+'" autoplay muted loop playsinline></video>'
        : '<img src="'+st.media+'" alt="QUADRO" loading="lazy">';
      html += '<div class="static__shot">'+media+'<div class="grade"></div></div>'
            + '<div class="static__cap"><span class="static__kicker">0'+(i+1)+' / 0'+N+' · '+st.type+'</span>'
            + '<h2 class="static__title">'+st.title+'</h2>'
            + '<p class="static__sub">'+st.sub+'</p></div>';
    });
    s.innerHTML = html;
    return s;
  }

  function init(target, userOpts){
    var opt = Object.assign({}, DEFAULTS, userOpts || {});
    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, CustomEase = global.CustomEase, Lenis = global.Lenis;

    var host = (typeof target === 'string') ? document.querySelector(target)
             : (target && target.nodeType === 1) ? target
             : document.querySelector('#pin');

    var STEPS = (Array.isArray(opt.steps) && opt.steps.length) ? opt.steps : DEFAULT_STEPS;
    var N = STEPS.length;

    try {
      if (!host) throw new Error('media-step-switch: target pin host not found');
      gsap.registerPlugin(ScrollTrigger, CustomEase);
      CustomEase.create("air","0.25,0.74,0.22,0.99");
      CustomEase.create("glide","0.45,0.05,0.2,1");   // gentle ease-in-out for the crossfade

      var reduce = global.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches;
      var narrow = global.matchMedia && matchMedia("(max-width:820px)").matches;
      if (reduce || narrow){
        var sEl = buildStatic(STEPS);
        document.body.classList.add("is-static","ready");
        global.__LAB_OK__ = !!(sEl && sEl.querySelectorAll(".static__shot").length >= N);
        return { static:true, moments:[], destroy:function(){} };
      }

      // build the full-bleed stage into the (empty) pin host if it has no .media yet
      if (!host.querySelector('.media')) buildStage(host, STEPS);

      // ---- ONE smoother: Lenis lerp 0.09 (heavier glide) -> gsap.ticker -> ScrollTrigger.update ----
      var lenis = null, rafFn = null;
      if (opt.manageLenis) {
        gsap.ticker.lagSmoothing(0);
        lenis = new Lenis({ lerp:opt.lerp, smoothWheel:true, wheelMultiplier:1 });
        lenis.on("scroll", ScrollTrigger.update);
        rafFn = function(t){ lenis.raf(t*1000); };
        gsap.ticker.add(rafFn);
        global.__lenis = lenis;
      }

      var imgA=document.getElementById("imgA"), imgB=document.getElementById("imgB"), vid=document.getElementById("vid");
      var layerA=document.getElementById("layerA"), layerB=document.getElementById("layerB");
      var vtag=document.getElementById("vtag"), counter=document.getElementById("counter"), progFill=document.getElementById("progFill");

      // the four text blocks, in step order
      var moments = STEPS.map(function(s){ return document.getElementById(s.el); });

      // EAGERLY fetch AND decode every still up front (img.decode()) so NO image
      // decode happens on the main thread during the scroll => no decode spikes.
      STEPS.forEach(function(s){
        var im=new Image(); im.decoding="async"; im.src = s.video ? s.poster : s.media;
        if(im.decode) im.decode().catch(function(){});
      });

      // build the horizontal step ticks
      var stepper=document.getElementById("stepper"), ticks=[];
      for(var t0=0;t0<N;t0++){ var w=document.createElement("div"); w.className="tick"; var fill=document.createElement("i"); w.appendChild(fill); stepper.appendChild(w); ticks.push(fill); }

      // assign a render to a layer's <img>
      function applyImg(imgEl,i){ var s=STEPS[i]; if(imgEl.getAttribute("src")!==s.media) imgEl.setAttribute("src",s.media); imgEl.style.objectPosition=s.objPos||"50% 50%"; }
      // layer B may hold the VIDEO or a photo. The <video> sits OVER imgB; for the
      // video slide imgB shows the POSTER (a real frame behind the video => media
      // never blank). We never seek currentTime.
      function setBContent(i){
        if (STEPS[i].video && vid){ imgB.src=STEPS[i].poster; imgB.style.objectPosition="50% 50%"; vid.style.display="block"; playVid(); }
        else { if(vid) vid.style.display="none"; pauseVid(); applyImg(imgB,i); }
      }
      function playVid(){ if(vid && vid.paused){ var p=vid.play(); if(p&&p.catch) p.catch(function(){}); } }
      function pauseVid(){ if(vid && !vid.paused){ try{vid.pause();}catch(_){}} }

      // even steps -> layer A, odd steps -> layer B (parity). For beat i show
      // STEPS[i] (current) and prepare STEPS[i+1] (incoming) on the OTHER layer.
      function syncLayersFor(i){
        var evenIdx=(i%2===0)?i:i+1, oddIdx=(i%2===0)?i+1:i;
        if(evenIdx>N-1)evenIdx=N-1; if(oddIdx>N-1)oddIdx=N-1;
        applyImg(imgA,evenIdx);
        setBContent(oddIdx);
      }

      // initial: step 0 on layer A (opacity 1); layer B under at 0
      syncLayersFor(0);
      gsap.set(layerA,{opacity:1, zIndex:1});
      gsap.set(layerB,{opacity:0, zIndex:2});
      gsap.set(vtag,{opacity:0});
      // seed each moment hidden at its entry offset (transform only)
      moments.forEach(function(el,i){ if(el) gsap.set(el, { opacity:0, x:STEPS[i].enter.x, y:STEPS[i].enter.y }); });
      document.body.classList.add("ready");
      var onResize = function(){ ScrollTrigger.refresh(); };
      global.addEventListener("resize", onResize);

      var lastSync=-1, airEase=gsap.parseEase("air"), glide=gsap.parseEase("glide");
      // per-element caches so we only WRITE styles that actually changed (fewer
      // style invalidations per frame on the real GPU => fewer long frames).
      var kbLast=-1, vtagLast=-1, counterLast="", nxtOpLast=-1, tickLast=new Array(N).fill(-1);
      var momCache=moments.map(function(){ return {o:-1,x:99999,y:99999}; });
      function setMoment(idx,o,xv,yv){
        if(!moments[idx]) return;
        var c=momCache[idx]; o=Math.round(o*1000)/1000; xv=Math.round(xv*10)/10; yv=Math.round(yv*10)/10;
        if(c.o===o && c.x===xv && c.y===yv) return;
        c.o=o; c.x=xv; c.y=yv; gsap.set(moments[idx],{ opacity:o, x:xv, y:yv });
      }

      // PURE render(prog). The pin spans N-1 beats; within each beat i (step i -> i+1).
      // text + media swap IN TANDEM so they always describe the SAME step. A short
      // MATCHED HOLD opens each beat, then text fades and media crossfades together,
      // text a hair tighter so exactly one heading reads (no ghost double-exposure):
      //   f 0.00 -> 0.46  HOLD   — step i text + step i media both settled, MATCHED.
      //   f 0.40 -> 0.60  outgoing text i fades OUT.
      //   f 0.50 -> 0.82  media crossfade i -> i+1 (glide) — TIGHT window.
      //   f 0.58 -> 0.86  incoming text i+1 fades IN (from its own direction).
      //   f 0.86 -> 1.00  settled, MATCHED on step i+1.
      function render(prog){
        var DWELL=opt.dwell, pp=Math.min(1, prog/DWELL);
        var p=pp*(N-1), i=Math.floor(p); if(i>N-2)i=N-2;
        var f=p-i;
        var iIsA=(i%2===0);
        var curLayer=iIsA?layerA:layerB;   // OUTGOING — underneath, ALWAYS opacity 1
        var nxtLayer=iIsA?layerB:layerA;   // INCOMING — on top, fades 0 -> 1
        if(i!==lastSync){
          syncLayersFor(i); lastSync=i;
          // layer parity/stack only changes when the beat flips => set z + the
          // opaque outgoing ONCE here, not every frame.
          gsap.set(curLayer,{ opacity:1, zIndex:1 });
          gsap.set(nxtLayer,{ zIndex:2 });
          nxtOpLast=-1;
        }

        // ---- MEDIA crossfade: TIGHT window in the back third (after a long matched
        // hold) so two full-bleed layers only co-composite briefly ----
        var WSTART=opt.wipeStart, WEND=opt.wipeEnd;
        var x = clamp01((f-WSTART)/(WEND-WSTART));
        var xe = Math.round(glide(x)*1000)/1000;            // INCOMING opacity, quantized
        if(xe!==nxtOpLast){ nxtOpLast=xe; gsap.set(nxtLayer,{ opacity:xe }); }
        var active=(x>0.5)?i+1:i;          // which media dominates the frame

        // tiny monotonic ken-burns on the two layer imgs (transform only,
        // GPU-composited, never resets). QUANTIZED + cached. The hidden <video>
        // needs no per-frame write.
        var kb=Math.round((opt.kenFrom + opt.kenStep*pp)*1000)/1000;
        if(kb!==kbLast){ kbLast=kb; gsap.set(imgA,{scale:kb}); gsap.set(imgB,{scale:kb}); if(vid) gsap.set(vid,{scale:kb}); }

        // ---- TEXT: matched hold, then outgoing fades OUT before incoming reads ----
        for(var k=0;k<N;k++){
          var vis=0, ex=STEPS[k].enter.x, ey=STEPS[k].enter.y, tx=ex, ty=ey;
          if(k===i){
            // outgoing: held through 0.40, fully gone by ~0.60 (before incoming reads);
            // drifts opposite to its entry on exit (monotonic).
            var o=airEase(clamp01((f-0.40)/0.20));
            vis=1-o; tx=(-ex*0.45)*o; ty=(-ey*0.45)*o;
          } else if(k===i+1){
            // incoming: rises 0.58 -> 0.86 (after outgoing has left, synced with the
            // media crossfade), FROM its entry offset to settled — one heading at a time.
            var inn=airEase(clamp01((f-0.58)/0.28));
            vis=inn; tx=ex*(1-inn); ty=ey*(1-inn);
          }
          setMoment(k, vis, tx, ty);
        }

        // ---- VIDEO tag: lit only while the video step dominates ----
        var vIdx=-1; for(var vi=0;vi<N;vi++){ if(STEPS[vi].video){ vIdx=vi; break; } }
        var vOn=(active===vIdx && vIdx>=0)?1:0;
        if(vOn!==vtagLast){ vtagLast=vOn; gsap.set(vtag,{opacity:vOn}); }
        if (vIdx>=0 && (active===vIdx || (i+1)===vIdx || i===vIdx)) playVid(); else pauseVid();

        // ---- chrome: counter + step ticks + progress ----
        var ct="0"+(active+1)+" / 0"+N;
        if(ct!==counterLast){ counterLast=ct; counter.textContent=ct; }
        for(var s2=0;s2<N;s2++){
          var fillFrac;
          if(s2<active) fillFrac=1;
          else if(s2>active) fillFrac=0;
          else fillFrac = clamp01(f<WSTART ? (f/WSTART)*0.5 : 0.5+0.5*x); // current tick lives across the beat
          fillFrac=Math.round(fillFrac*100)/100;
          if(fillFrac!==tickLast[s2]){ tickLast[s2]=fillFrac; gsap.set(ticks[s2],{scaleX:fillFrac}); }
        }
        gsap.set(progFill,{ scaleY:prog });
      }

      var st=ScrollTrigger.create({
        trigger:host, start:"top top",
        end:"+="+Math.round(innerHeight*(N-1)*opt.pinFactor),
        pin:true, pinSpacing:true, scrub:1, anticipatePin:0,
        onUpdate:function(self){ render(self.progress); }
      });
      render(0);
      requestAnimationFrame(function(){ ScrollTrigger.refresh(); render(st.progress||0); });

      global.__LAB_OK__ = !!(global.gsap && global.ScrollTrigger && (!opt.manageLenis || global.Lenis) && st && moments.length>=N);

      return {
        trigger: st,
        moments: moments,
        layers: { A:layerA, B:layerB },
        lenis: lenis,
        refresh: function(){ ScrollTrigger.refresh(); },
        destroy: function(){
          if (st && st.kill) st.kill();
          global.removeEventListener("resize", onResize);
          pauseVid();
          if (lenis && rafFn) { gsap.ticker.remove(rafFn); lenis.destroy && lenis.destroy(); }
        }
      };
    } catch(e){
      global.__LAB_OK__ = false;
      try{ buildStatic(STEPS); document.body.classList.add("is-static","ready"); }catch(_){}
      if(global.console) console.error("[media-step-switch] build failed:", e);
      return { static:true, error:e, moments:[], destroy:function(){} };
    }
  }

  global.MediaStepSwitch = {
    init: init,
    DEFAULTS: DEFAULTS,
    DEFAULT_STEPS: DEFAULT_STEPS
  };
  // back-compat alias: the legacy ESM base exposed mediaStepSwitch(...) — keep a
  // callable window-global with the SAME (target, options) signature.
  global.mediaStepSwitch = init;

})(window);
