/* ============================================================
   puzzle-image / depth-fly-in — variant.js   (base-importing delta)
   ------------------------------------------------------------
   variant-as-delta. The BASE engine lives in ../../component.js
   (PuzzleImage = the flat CENTER-OUT assemble). This variant is the
   DEPTH / 3D-feeling reading of the SAME single-wide-cover beat,
   re-extracted BYTE-FAITHFULLY from the owner-approved prototype:
     apps/quadro/public/slide-lab/pz3-depth-fly-in.html

   WHY a variant.js (not params.json): the ASSEMBLE phase is a NEW DOM
   motion model — the tiles WAIT scattered in real CSS Z-DEPTH (near
   tiles large + soft + dim, far tiles small) and CONVERGE home from
   that depth onto the flat cover plane (z=0, blur 0). That is a new
   3D layer the base does not express, so per CONTRACT §3 it ships as a
   base-importing variant.js, NEVER a forked component.js.

   WHAT IS SHARED WITH THE BASE (../../component.js · PuzzleImage):
     • the SINGLE-SRC sprite-slice contract (every tile is a fragment of
       the SAME one wide render; the photo underneath is that same image),
     • the photo+scrim fade-under-at-seat (seams vanish, zero overlap),
     • the GROW phase — ONE modest transform:scale (~1.35x) of the whole
       .coverWrap unit so wordmark + captions scale WITH it,
     • the LEFT headline NEVER fading, reduced-motion / narrow → static,
     • transform / opacity / filter ONLY, no clip-path, no WebGL,
     • no mix-blend / backdrop over the scrubbed surface.

   WHAT THIS VARIANT OWNS (the delta):
     • a dark CINEMATIC field with CSS `perspective` on the stage,
     • per-tile depthStart(): deterministic Z scatter (Z_NEAR..Z_FAR),
       depth-coupled scale / blur / brightness / 3D card-tilt,
     • the Z-CONVERGE assemble: each tile tweens z->0, blur->0,
       brightness->1, with a small per-tile depth delay (near later) so
       the cloud converges from depth — all on the ONE air ease,
     • a thin progress cue line.

   It uses gsap.matchMedia so the reduced-motion / narrow branch is the
   static assembled cover — the same contract the base guarantees.

   ENTRY (declared in variant.recipe.md):
     PuzzleImageDepthFlyIn.init(opts)   // opts = { stage, coverWrap, photo,
       scrim, grid, wordmark, caption, cue, src, rows, cols, growPeak,
       assembleEnd, blurMax, zNear, zFar, pinVh, scrub } | drives existing DOM
   ============================================================ */
(function (global) {
  'use strict';

  /* base-importing law: this variant REQUIRES the shared base engine to be
     loaded alongside it (../../component.js → window.PuzzleImage). The lab loads
     ../../component.js before this file; we cite it so the grow/sprite/static
     contract is the SHARED base contract, not a fork. */
  var BASE = global.PuzzleImage || null;   // ../../component.js (PuzzleImage)

  /* faithful pz3 defaults (byte-for-byte from pz3-depth-fly-in.html) */
  var D = {
    src:        'renders/day-front.webp',  // ONE wide cover (1920x1080, 16:9)
    rows:       4, cols: 7,                // 28 tiles — dense puzzle, calm at seat
    assembleEnd:0.58,                      // progress where the cover is seated
    growPeak:   1.35,                      // MODEST uniform scale to full-bleed
    blurMax:    17,                        // px (<=20) — depth-coupled, capped
    zNear:      260,                       // big, soft, dim — closest scattered tiles
    zFar:      -1180,                      // small, far back
    pinVh:      3.0,                       // pin scroll distance = 3.0 * innerHeight
    scrub:      0.8,
  };

  function PuzzleImageDepthFlyIn(opts) {
    opts = opts || {};
    var gsap = global.gsap, ST = global.ScrollTrigger, CE = global.CustomEase;
    if (!gsap || !ST) { return { ok:false, reason:'GSAP / ScrollTrigger missing' }; }
    gsap.registerPlugin(ST);
    if (CE) { gsap.registerPlugin(CE); CustomEaseSafe(CE); }
    var AIR = (CE && gsap.parseEase('air')) ? 'air' : 'power3.out';

    var cfg = Object.assign({}, D, opts);

    var sel = function (q, root) { return (root || document).querySelector(q); };
    var stage    = node(opts.stage)    || sel('#stage')     || sel('.stage');
    var coverWrap= node(opts.coverWrap)|| sel('#coverWrap') || sel('.coverWrap');
    var cover    = node(opts.cover)    || sel('#cover')     || sel('.cover');
    var photo    = node(opts.photo)    || sel('#photo')     || sel('.cover__photo');
    var scrim    = node(opts.scrim)    || sel('#scrim')     || sel('.cover__scrim');
    var grid     = node(opts.grid)     || sel('#grid')      || sel('.grid');
    var wordmark = node(opts.wordmark) || sel('#wordmark')  || sel('.cover__wordmark');
    var caption  = node(opts.caption)  || sel('#caption')   || sel('.cover__caption');
    var cueFill  = node(opts.cueFill)  || sel('#cueFill')   || sel('.cue i');
    var fbPhoto  = node(opts.fbPhoto)  || sel('#fbphoto');
    if (!coverWrap || !grid) { return { ok:false, reason:'cover not ready' }; }

    var SRC = cfg.src, ROWS = cfg.rows, COLS = cfg.cols;
    var ASSEMBLE_END = cfg.assembleEnd, GROW_PEAK = cfg.growPeak;
    var BLUR_MAX = cfg.blurMax, Z_NEAR = cfg.zNear, Z_FAR = cfg.zFar;

    /* eager-preload the cover + paint the fallback img (shares the ONE src) */
    (function preload(){
      var pre = new Image(); pre.decoding='async'; pre.loading='eager'; pre.src=SRC;
      if (photo) photo.src = SRC;
      if (fbPhoto) fbPhoto.src = SRC;
    })();

    /* ---- build the depth grid of sprite tiles (slices of the SAME src) ---- */
    var tiles = [];
    (function buildTiles(){
      grid.innerHTML = '';
      tiles.length = 0;
      var cw = 100/COLS, ch = 100/ROWS;
      for (var r=0;r<ROWS;r++){
        for (var c=0;c<COLS;c++){
          var t = document.createElement('div');
          t.className = 'tile';
          t.style.left   = (c*cw) + '%';
          t.style.top    = (r*ch) + '%';
          t.style.width  = cw + '%';
          t.style.height = ch + '%';
          t.style.backgroundImage = "url('" + SRC + "')";
          t.style.backgroundSize  = (COLS*100) + '% ' + (ROWS*100) + '%';
          var px = COLS>1 ? (c/(COLS-1))*100 : 0;
          var py = ROWS>1 ? (r/(ROWS-1))*100 : 0;
          t.style.backgroundPosition = px + '% ' + py + '%';
          t._c = c; t._r = r;
          grid.appendChild(t);
          tiles.push(t);
        }
      }
    })();

    /* deterministic scattered DEPTH start for each tile.
       near tiles (zNorm→1): large scale, more blur, dimmer, big offset.
       far tiles  (zNorm→0): small scale, less spread.
       Centre tiles converge LAST-ish via the per-tile depth delay. */
    function depthStart(t){
      var cx = (COLS-1)/2, cy = (ROWS-1)/2;
      var dx = t._c - cx, dy = t._r - cy;
      var len = Math.hypot(dx,dy) || 1;
      var seed = Math.sin(t._c*12.9898 + t._r*78.233) * 43758.5453;
      var rnd  = seed - Math.floor(seed);              // 0..1 stable per tile
      var rnd2 = (Math.sin(t._c*3.7 + t._r*9.1)+1)/2;  // 0..1
      var zNorm = rnd;                                 // 0 far .. 1 near
      var z = Z_FAR + (Z_NEAR - Z_FAR) * zNorm;
      var spread = 36 + zNorm*60;                      // near tiles fly from further out
      var ang = (rnd2 - 0.5) * 0.9;                    // small angular jitter
      var ux = dx/len, uy = dy/len;
      var jx = ux*Math.cos(ang) - uy*Math.sin(ang);
      var jy = ux*Math.sin(ang) + uy*Math.cos(ang);
      return {
        z: z,
        xPercent: jx * spread,
        yPercent: jy * spread,
        scale: 0.74 + zNorm*0.5,                       // 0.74 far .. 1.24 near
        blur: 5 + zNorm*(BLUR_MAX-5),                  // near = blurrier (DOF)
        bright: 0.55 + (1-zNorm)*0.18,                 // a touch dimmer up close
        rot: (rnd-0.5)*7,                              // gentle in-plane tilt
        rotX: (rnd2-0.5)*8,                            // slight 3D card tilt
        delay: zNorm                                   // near tiles seat slightly later
      };
    }

    var ran = false;
    var mm = gsap.matchMedia();

    /* ---- FULL EXPERIENCE: wide + motion allowed ---- */
    mm.add('(min-width:761px) and (prefers-reduced-motion: no-preference)', function(){

      gsap.set(coverWrap, { scale:1 });
      gsap.set([photo, scrim], { opacity:0 });
      gsap.set([wordmark, caption], { opacity:0 });

      // scatter the tiles into Z-depth (their START)
      tiles.forEach(function(t){
        var s = depthStart(t);
        t._s = s;
        gsap.set(t, {
          z: s.z,
          xPercent: s.xPercent, yPercent: s.yPercent,
          scale: s.scale, rotation: s.rot, rotationX: s.rotX,
          opacity: 0.0,
          filter: 'blur(' + s.blur.toFixed(1) + 'px) brightness(' + s.bright.toFixed(2) + ')',
          transformOrigin: '50% 50%'
        });
      });

      var END = Math.round(window.innerHeight * cfg.pinVh);
      var A = ASSEMBLE_END;

      var tl = gsap.timeline({
        defaults:{ ease:AIR },
        scrollTrigger:{
          trigger: stage,
          start:'top top',
          end:'+=' + END,
          pin:true,
          scrub:cfg.scrub,
          anticipatePin:1,
          invalidateOnRefresh:true
        }
      });

      /* PHASE 1 — ASSEMBLE: tiles fly home FROM Z-DEPTH, de-blur, opacity up.
         Per-tile delay (near later) gives a converging-from-depth feel, all
         eased with AIR so there is no pop and no jerk. */
      tiles.forEach(function(t){
        var s = t._s;
        var startAt = (s.delay * 0.16) * A;          // near tiles begin a hair later
        tl.to(t, {
          z:0, xPercent:0, yPercent:0,
          scale:1, rotation:0, rotationX:0,
          opacity:1,
          filter:'blur(0px) brightness(1)',
          duration: A - startAt,
          ease: AIR
        }, startAt);
      });

      /* seamless photo + scrim fade in UNDER the tiles so seams vanish at seat */
      tl.to([photo, scrim], { opacity:1, ease:'none', duration:0.12 }, A*0.82);

      /* ghost wordmark + captions emerge as the cover seats */
      if (wordmark) tl.to(wordmark, { opacity:1, ease:AIR, duration:0.22 }, A*0.66);
      if (caption)  tl.fromTo(caption, { opacity:0, y:10 }, { opacity:1, y:0, ease:AIR, duration:0.22 }, A*0.76);
      /* the LEFT headline + RIGHT meta are NEVER faded — they stay visible. */

      /* PHASE 2 — GROW: ONE modest transform:scale of the whole cover unit
         (the SHARED grow phase — same modest scale the base applies) */
      tl.to(coverWrap, { scale:GROW_PEAK, ease:AIR, duration: 1 - A }, A);

      /* progress cue across the whole pinned scroll */
      if (cueFill) gsap.to(cueFill, {
        scaleX:1, ease:'none',
        scrollTrigger:{ trigger: stage, start:'top top', end:'+='+END, scrub:true }
      });

      ran = true;

      return function(){
        gsap.set(tiles, { clearProps:'all' });
        gsap.set([coverWrap, photo, scrim, wordmark, caption], { clearProps:'all' });
      };
    });

    /* ---- REDUCED-MOTION (wide): assembled cover, NO scatter / pin / scrub ---- */
    mm.add('(min-width:761px) and (prefers-reduced-motion: reduce)', function(){
      gsap.set(tiles, { z:0, xPercent:0, yPercent:0, scale:1, rotation:0, rotationX:0, opacity:1, filter:'none' });
      gsap.set([photo, scrim, wordmark, caption], { opacity:1, y:0 });
      gsap.set(coverWrap, { scale:1 });
      if (grid) grid.style.display = 'none';   // photo layer carries the cover
      ran = true;
    });

    window.addEventListener('load', function(){ ST.refresh(); });

    var pinned = ST.getAll().some(function(s){ return s.pin; });
    return {
      ok: !!(tiles.length && (pinned || ran)),
      base: BASE,                 // cite the shared base engine
      tiles: tiles.length,
      grid: ROWS + 'x' + COLS,
      growPeak: GROW_PEAK,
      refresh: function(){ ST.refresh(); },
      destroy: function(){ mm.revert(); grid.innerHTML = ''; }
    };
  }

  /* register the air ease only once */
  function CustomEaseSafe(CE){
    try { if (!global.gsap.parseEase('air')) CE.create('air','0.25,0.74,0.22,0.99'); }
    catch(e){ CE.create('air','0.25,0.74,0.22,0.99'); }
  }
  function node(x){ return (x && x.nodeType === 1) ? x : (typeof x === 'string' ? document.querySelector(x) : null); }

  global.PuzzleImageDepthFlyIn = { init: PuzzleImageDepthFlyIn, base: BASE };
})(window);
