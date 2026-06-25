/* ============================================================
   SLICE-CLIP · component.js   (vanilla + GSAP 3.12.5 + ScrollTrigger
   + CustomEase + guarded Lenis 1.1.13)
   BASE = frs7-slice-lr-clip  (owner-approved, gate-passing)
   Re-extracted BYTE-FAITHFULLY from
     apps/quadro/public/slide-lab/frs7-slice-lr-clip.html
   ------------------------------------------------------------
   frs3 COMPOSITION: a numbered spec-RAIL on the LEFT (38%), a BIG
   contained fixed-size RENDER on the RIGHT (62%), ~2cm gap, bronze
   accent. Each beat the render SWAPS via a CLEAN CLIP-PATH WIPE.

   THE SLICE MECHANISM (zero ghosting, zero blank, one crisp edge):
     • TWO stacked <img> layers, BOTH always opacity:1 (never
       semi-transparent -> no double-exposure). The swap is a CLIP,
       not an opacity fade.
     • The OUTGOING photo sits underneath (zIndex 1), fully visible.
     • The INCOMING photo sits on top (zIndex 2) and is revealed by a
       clip-path INSET that opens along ONE axis: from fully-closed
       (inset 100% on the leading side) to fully-open (inset 0). During
       the wipe one side of the edge is the new photo, the other side
       the old — meeting at ONE hard travelling edge. No transparency,
       no tear.
     • Outside the short wipe window exactly one photo fills the frame
       (the media centre is always a photo — gate pixel-audit = 0 cream).
     • clip-path inset is GPU-composited in Chromium.

   THE ONE KNOB THAT MAKES THE 3 PROTOTYPES: dir = 'lr' | 'td' | 'bu'.
     • lr (BASE = frs7) — wipe LEFT->RIGHT.  closed inset(0 100% 0 0);
       open inset(0 0 0 0). Edge is a VERTICAL bronze light-line riding
       left:xe%. The base KEEPS its edge (edge:true default for lr).
     • td (frs8)        — wipe TOP->BOTTOM.  closed inset(100% 0 0 0);
       open inset(0 0 0 0). Horizontal edge would ride top:xe%.
     • bu (frs10)       — wipe BOTTOM->UP.   closed inset(0 0 100% 0);
       open inset(0 0 0 0). Horizontal edge would ride top:(100-xe)%.
     The td / bu VARIANTS ship edge:false on purpose — there the bronze
     edge-line travelled OPPOSITE the actual clip seam (a stray line from
     the wrong side), so it was removed. Do NOT re-enable it for td/bu.

   ENGINE LAWS (verbatim from frs3 v2): Lenis 1.1.13 lerp 0.1 smoothWheel
     -> gsap.ticker -> ScrollTrigger.update; lagSmoothing(0); render(prog)
     pure fn from onUpdate + once at init; pin/pinSpacing/scrub:true. GSAP
     3.12.5. Fraunces + Inter; bronze #c08a4e; transform / opacity /
     clip-path ONLY; NO mask-composite; NO mix-blend / backdrop over the
     scrubbed surface; NO video.currentTime; NO WebGL; reduced-motion /
     <=820px -> static stack; zero em-dashes in visible copy.

   ENTRY POINT (the REAL signature on disk — declared in RECIPE)
   ------------------------------------------------------------
     SliceClip.init(opts)
       opts (all optional; defaults drive the frs7 DOM ids):
         { dir, edge,                    // 'lr'|'td'|'bu'  ·  show bronze edge?
           slides,                       // [{src,tag,idx,name,title,sub,objPos}]
           pinSel, stageSel, listSel, markerSel,
           layerASel, layerBSel, imgASel, imgBSel,
           edgeSel, tagSel, countSel, hintSel, progFillSel, staticSel,
           dwell, hold, pinFactor, lerp } // timing knobs
       Returns { st, render, slides, destroy } (or { static:true } in the
       reduced-motion / narrow branch).
   The lab/integration authors the frs7 DOM and calls SliceClip.init({dir,...}).

   DEPENDENCIES (load before this file):
     gsap 3.12.5, ScrollTrigger, CustomEase, Lenis 1.1.13
   ============================================================ */

(function (global) {
  'use strict';

  /* faithful frs7 SLIDES (byte-for-byte from frs7-slice-lr-clip.html).
     Honest Fedoriv copy, zero em-dashes. The lab/integration can override
     via opts.slides. */
  var DEFAULT_SLIDES = [
    { src:"renders/day-34-portrait.webp", tag:"Ранок",     idx:"01", name:"Ранок",    title:"Ранок приходить першим", sub:"Світло лягає на фасад раніше, ніж прокидається вулиця." },
    { src:"renders/night-front.webp",     tag:"Вечір",     idx:"02", objPos:"50% 42%", name:"Вечір", title:"Вечір теплішає", sub:"Світло вмикається зсередини, і дім видно здалеку." },
    { src:"renders/terrace-04.webp",      tag:"Тераса",    idx:"03", name:"Тераса",   title:"Кава над водою", sub:"Тераса, тиша і власний берег на відстані кроку." },
    { src:"renders/macro-roof.webp",      tag:"Матеріал",  idx:"04", name:"Матеріал", title:"Клінкер зблизька", sub:"Тепла цегла, обпалена вручну. Фактура, яку хочеться торкнути." },
    { src:"renders/aerial.webp",          tag:"Згори",     idx:"05", name:"Згори",    title:"Увесь дім з висоти", sub:"Крок назад, і ділянка читається цілою картиною." },
    { src:"renders/day-08.webp",          tag:"Всередині", idx:"06", name:"Інтерʼєр", title:"І життя всередині", sub:"За фасадом простір, у якому хочеться лишитися." }
  ];

  var DEFAULTS = {
    /* the ONE knob that makes the 3 prototypes */
    dir: 'lr',          // 'lr' (base frs7) | 'td' (frs8) | 'bu' (frs10)
    edge: null,         // bronze edge-line; null => true ONLY for lr (the base keeps it; td/bu remove it)
    /* content */
    slides: null,       // [{src,tag,idx,name,title,sub,objPos}] — else DEFAULT_SLIDES
    /* selectors — default to the frs7 DOM ids */
    pinSel:'#pin', stageSel:'#stage', listSel:'#list', markerSel:'#marker',
    layerASel:'#layerA', layerBSel:'#layerB', imgASel:'#imgA', imgBSel:'#imgB',
    edgeSel:'#edge', tagSel:'#tag', countSel:'#count', hintSel:'#hint',
    progFillSel:'#progFill', staticSel:'#static',
    /* timing (frs7 verbatim) */
    dwell: 0.86,        // fraction of progress used before the deck is fully advanced
    hold: 0.78,         // hold the current photo this fraction of a beat, wipe the last (1-hold)
    pinFactor: 1.4,     // pin length = innerHeight * (N-1) * pinFactor
    lerp: 0.1           // Lenis smoothing
  };

  /* per-direction clip geometry. Returns the closed-state inset (incoming layer
     fully hidden) and a fn that, given the eased wipe phase xe (0..1), yields the
     open-inset for the incoming layer. lr=left->right, td=top->down, bu=bottom->up. */
  function dirSpec(dir) {
    if (dir === 'td') {
      return {
        closed: 'inset(100% 0 0 0)',
        open: function (xe) { return 'inset(' + ((1 - xe) * 100).toFixed(2) + '% 0 0 0)'; },
        edgeAxis: 'top',
        edgePos: function (xe) { return xe * 100; }            // edge rides top, top->bottom
      };
    }
    if (dir === 'bu') {
      return {
        closed: 'inset(0 0 100% 0)',
        open: function (xe) { return 'inset(0 0 ' + ((1 - xe) * 100).toFixed(2) + '% 0)'; },
        edgeAxis: 'top',
        edgePos: function (xe) { return (1 - xe) * 100; }      // edge rides top, rising bottom->up
      };
    }
    /* lr (base / frs7) */
    return {
      closed: 'inset(0 100% 0 0)',
      open: function (xe) { return 'inset(0 ' + ((1 - xe) * 100).toFixed(2) + '% 0 0)'; },
      edgeAxis: 'left',
      edgePos: function (xe) { return xe * 100; }              // edge rides left, left->right
    };
  }

  function init(userOpts) {
    var opt = Object.assign({}, DEFAULTS, userOpts || {});
    var dir = (opt.dir === 'td' || opt.dir === 'bu') ? opt.dir : 'lr';
    var showEdge = (opt.edge === null || opt.edge === undefined) ? (dir === 'lr') : !!opt.edge;
    var spec = dirSpec(dir);
    var SLIDES = Array.isArray(opt.slides) && opt.slides.length ? opt.slides : DEFAULT_SLIDES;
    var N = SLIDES.length;

    var gsap = global.gsap, ScrollTrigger = global.ScrollTrigger, CustomEase = global.CustomEase, Lenis = global.Lenis;

    function $(sel){ return document.querySelector(sel); }

    function buildStatic(){
      var s = $(opt.staticSel); if (!s) return;
      var html='<section class="intro"><span class="intro__kicker">QUADRO HOUSE</span><h1 class="intro__title">Шість поглядів на <em>один дім</em>.</h1></section>';
      SLIDES.forEach(function(sl){ html+='<div class="static__shot"><img src="'+sl.src+'" alt="" loading="lazy"></div><div class="static__cap"><span class="static__idx">'+sl.idx+' / 0'+N+'</span><h2 class="static__title">'+sl.title+'</h2></div>'; });
      s.innerHTML=html;
    }

    try{
      gsap.registerPlugin(ScrollTrigger, CustomEase);
      CustomEase.create("air","0.25,0.74,0.22,0.99");
      CustomEase.create("glide","0.45,0.05,0.2,1");  // gentle ease-in-out for the wipe (smoother than air)
      var reduce = global.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches;
      var narrow = global.matchMedia && matchMedia("(max-width:820px)").matches;
      if (reduce || narrow){ buildStatic(); document.body.classList.add("is-static","ready"); return { static:true, slides:SLIDES, destroy:function(){} }; }

      gsap.ticker.lagSmoothing(0);
      var lenis = new Lenis({ lerp:opt.lerp, smoothWheel:true, wheelMultiplier:1 });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function(t){ lenis.raf(t*1000); });
      global.__lenis = lenis;

      var list=$(opt.listSel), marker=$(opt.markerSel);
      var rows=SLIDES.map(function(sl){ var r=document.createElement("div"); r.className="row";
        r.innerHTML='<div class="row__line"><span class="row__num">'+sl.idx+'</span><span class="row__name">'+sl.name+'</span></div><div class="row__sub"><span>'+sl.sub+'</span></div>';
        list.appendChild(r); return r; });
      var nums=rows.map(function(r){return r.querySelector(".row__num");});
      var names=rows.map(function(r){return r.querySelector(".row__name");});
      var subs=rows.map(function(r){return r.querySelector(".row__sub");});
      var subInner=subs.map(function(s){return s.querySelector("span");});

      var imgA=$(opt.imgASel), imgB=$(opt.imgBSel);
      var layerA=$(opt.layerASel), layerB=$(opt.layerBSel);
      var edge=$(opt.edgeSel), tag=$(opt.tagSel);
      var count=$(opt.countSel), hint=$(opt.hintSel), progFill=$(opt.progFillSel);

      /* tell the CSS which edge skin to use (vertical for lr, horizontal for td/bu) */
      var media = layerA && layerA.parentNode; if (media) media.setAttribute('data-dir', dir);

      SLIDES.forEach(function(s){ var im=new Image(); im.src=s.src; });

      function applyLayer(layerImg,i){ var s=SLIDES[i]; if(layerImg.getAttribute("src")!==s.src) layerImg.setAttribute("src",s.src); layerImg.style.objectPosition=s.objPos||"50% 48%"; }
      // layerA holds EVEN indices, layerB holds ODD — fixed parity, so during a
      // wipe from beat i to i+1 the two <img> already carry the right photos.
      function syncLayersFor(i){
        var evenIdx=(i%2===0)?i:i+1, oddIdx=(i%2===0)?i+1:i;
        if(evenIdx>N-1)evenIdx=N-1; if(oddIdx>N-1)oddIdx=N-1;
        applyLayer(imgA,evenIdx); applyLayer(imgB,oddIdx);
      }
      function setCounter(i){ var t=SLIDES[i].idx+" / 0"+N; count.textContent=t; hint.textContent=t; tag.textContent=SLIDES[i].tag; }

      var rowCenters=[], markerH=marker.offsetHeight||38;
      function measureRail(){ var lt=list.getBoundingClientRect().top; rowCenters=rows.map(function(r){var rb=r.getBoundingClientRect();return (rb.top-lt)+rb.height/2;}); markerH=marker.offsetHeight||38; }

      // initial: layerA shows slide 0 fully (clip open); layerB hidden (clip closed
      // on the leading side per the direction)
      syncLayersFor(0);
      gsap.set(layerA,{clipPath:"inset(0 0 0 0)", zIndex:1});
      gsap.set(layerB,{clipPath:spec.closed, zIndex:2});
      gsap.set(edge,{opacity:0});
      setCounter(0);
      document.body.classList.add("ready");
      measureRail();
      global.addEventListener("resize", function(){ measureRail(); ScrollTrigger.refresh(); });

      var lastSync=-1, airEase=gsap.parseEase("air"), glide=gsap.parseEase("glide");
      function lerp(a,b,t){return a+(b-a)*t;}
      function blend(a,b,t){var ar=(a>>16)&255,ag=(a>>8)&255,ab=a&255,br=(b>>16)&255,bg=(b>>8)&255,bb=b&255;return "rgb("+Math.round(ar+(br-ar)*t)+","+Math.round(ag+(bg-ag)*t)+","+Math.round(ab+(bb-ab)*t)+")";}

      function render(prog){
        var DWELL=opt.dwell, pp=Math.min(1, prog/DWELL);
        var p=pp*(N-1), i=Math.floor(p); if(i>N-2)i=N-2;
        var f=p-i;
        if(i!==lastSync){ syncLayersFor(i); lastSync=i; }

        // SLICE window: hold current ~hold of the beat, wipe over the last (1-hold).
        // The wipe uses a GENTLE ease-in-out (glide), so the slice edge starts and
        // ends softly instead of snapping = smoother than the air ease.
        var HOLD=opt.hold;
        var x = f<=HOLD ? 0 : (f-HOLD)/(1-HOLD);   // 0..1 wipe phase
        var xe = glide(x);

        // parity: which layer holds beat i (current) vs i+1 (incoming)?
        var iIsA=(i%2===0);
        var curLayer=iIsA?layerA:layerB;   // the OUTGOING photo (underneath)
        var nxtLayer=iIsA?layerB:layerA;   // the INCOMING photo (revealed along the axis)

        // CURRENT stays fully open underneath; INCOMING reveals via clip inset.
        gsap.set(curLayer,{ clipPath:"inset(0 0 0 0)", zIndex:1 });
        gsap.set(nxtLayer,{ clipPath:spec.open(xe), zIndex:2 });

        // bronze edge rides the clip boundary; visible only during the wipe — and
        // ONLY when this direction keeps its edge (lr base keeps it; td/bu removed
        // it on purpose, so showEdge is false and the edge stays hidden).
        if (showEdge) {
          var edgeOn = (x>0.001 && x<0.999);
          var ev = { opacity: edgeOn ? 1 : 0 };
          ev[spec.edgeAxis] = spec.edgePos(xe) + "%";
          gsap.set(edge, ev);
        }

        var active=(x>0.5)?i+1:i;
        setCounter(active);

        // ---- RAIL: marker glides CONTINUOUSLY to the active row (not a snap) ----
        if(rowCenters.length===N){ var mc=(i>=N-1)?rowCenters[N-1]:lerp(rowCenters[i],rowCenters[i+1],airEase(f)); gsap.set(marker,{y:mc-markerH/2}); }
        for(var k=0;k<N;k++){
          var d=Math.abs(k-p), w=d>=1?0:(1-d); w=w*w;
          names[k].style.color=blend(0xb4a892,0x1a1410,w);
          nums[k].style.color=blend(0xb4a892,0xc08a4e,w);
          var sh=(k===active)?Math.min(1,w*1.6+0.25):0;
          var natural=subInner[k]?subInner[k].offsetHeight:0;
          gsap.set(subs[k],{height:natural*sh, opacity:(k===active)?Math.min(1,sh*1.4):0});
        }
        gsap.set(progFill,{scaleY:prog});
      }

      var st=ScrollTrigger.create({ trigger:opt.pinSel, start:"top top", end:"+="+Math.round(global.innerHeight*(N-1)*opt.pinFactor), pin:true, pinSpacing:true, scrub:true, anticipatePin:0, onUpdate:function(self){ render(self.progress); } });
      render(0);                                    // correct first frame, no scroll needed
      requestAnimationFrame(function(){ measureRail(); ScrollTrigger.refresh(); render(st.progress||0); });

      return {
        st: st,
        render: render,
        slides: SLIDES,
        destroy: function(){ if(st) st.kill(); }
      };
    }catch(e){
      try{ buildStatic(); document.body.classList.add("is-static","ready"); }catch(_){}
      if(global.console) console.error("[slice-clip] build failed:", e);
      return { static:true, error:e, slides:SLIDES, destroy:function(){} };
    }
  }

  global.SliceClip = {
    init: init,
    DEFAULTS: DEFAULTS,
    DEFAULT_SLIDES: DEFAULT_SLIDES
  };

})(window);
