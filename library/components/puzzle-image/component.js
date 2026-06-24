/* ============================================================
   puzzle-image — component.js   (framework-free, GSAP + ScrollTrigger)
   ------------------------------------------------------------
   Slices ONE decoded image into an R×C grid of CSS-sprite tiles and
   assembles them on scroll (scrub) or on enter (inview). The picture
   self-seats like a puzzle into a seamless full-bleed photo.

   USAGE
     import nothing — just include this file after GSAP + ScrollTrigger
     (+ optional CustomEase) and call:

       const pz = PuzzleImage(document.querySelector('.puzzle'), {
         src: '/renders/cover.webp',
         rows: 4, cols: 4,
         trigger: 'scrub',          // or 'inview'
         scatter: 1.8, staggerFrom: 'center',
       });

     Markup expected inside the root element:
       <section class="puzzle">
         <div class="puzzle__stage">
           <div class="puzzle__grid"></div>     <!-- tiles injected here -->
         </div>
       </section>

   RULES baked in
     • motion is transform/opacity/filter ONLY (home cells are static).
     • scrub mode: ONE timeline whose 0→1 IS scroll progress; each tile is
       placed at position=startP with duration=tileWindow — the per-tile EASE
       lives in the mapped sub-window, not a wall-clock duration.
     • blur runs at rest and eases to 0; filter set to 'none' + will-change
       removed onComplete (FPS).
     • seamFix outsets each tile so the seated state has no sub-pixel hairlines.
     • reduced-motion → instant seated state, no blur.
     • image is decoded BEFORE tiles are built (no empty flash).
   ============================================================ */

function PuzzleImage(root, userConfig){
  const DEF = {
    src: '',
    alt: '',
    rows: 4, cols: 4,
    rowsMobile: 3, colsMobile: 3,
    trigger: 'scrub',            // 'scrub' | 'inview'
    scatter: 1.8,                // in tile-widths
    scatterPattern: 'random',    // 'random' | 'edges-in' | 'ring' | 'rows'
    staggerFrom: 'center',       // 'center' | 'edges' | 'random' | 'rows'
    staggerAmount: 0.45,         // spread of per-tile starts across 0→1 progress
    tileWindow: 0.55,            // per-tile sub-window width
    scaleFrom: 0.65,
    opacityFrom: 0.0,
    blurFrom: 18,                // px (cap ≤20 for FPS)
    ease: 'air',                 // 'air' | 'expo'
    scrollDistance: '+=120%',
    pin: true,
    duration: 1.0,               // inview per-tile (s)
    totalStagger: 0.5,           // inview from-center stagger total (s)
    seed: 7,
    seamFix: 0.5,
    respectReducedMotion: true,
  };
  const C = Object.assign({}, DEF, userConfig || {});

  if (!window.gsap || !window.ScrollTrigger){
    console.warn('[puzzle-image] GSAP + ScrollTrigger required'); return null;
  }
  gsap.registerPlugin(ScrollTrigger);

  const AIR = (window.CustomEase)
    ? CustomEase.create('pzAir','M0,0 C0.25,0.74 0.22,0.99 1,1')
    : 'power4.out';
  const EASE = C.ease === 'expo' ? 'expo.out' : AIR;
  const reduce = C.respectReducedMotion &&
    window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  const isMobile = window.matchMedia('(max-width:760px)').matches;
  const ROWS = isMobile ? C.rowsMobile : C.rows;
  const COLS = isMobile ? C.colsMobile : C.cols;

  const stage = root.querySelector('.puzzle__stage');
  const grid  = root.querySelector('.puzzle__grid');
  if (!stage || !grid){ console.warn('[puzzle-image] missing .puzzle__stage/.puzzle__grid'); return null; }

  let tiles = [];
  let SEATED_SCALE = 1;
  let timeline = null, st = null;

  /* deterministic PRNG (mulberry32) — reproducible scatter per seed */
  function rngFrom(seed){
    let a = seed >>> 0;
    return function(){
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function preload(url){
    return new Promise((res)=>{
      const img = new Image();
      img.onload = ()=> (img.decode ? img.decode().then(res).catch(res) : res());
      img.onerror = res;
      img.src = url;
    });
  }

  function buildTiles(){
    grid.innerHTML = '';
    tiles = [];
    grid.style.setProperty('--img', `url("${C.src}")`);

    const tileW = 100 / COLS, tileH = 100 / ROWS;
    const cc = (COLS - 1) / 2, cr = (ROWS - 1) / 2;
    const maxDist = Math.hypot(cc, cr) || 1;

    for (let r = 0; r < ROWS; r++){
      for (let c = 0; c < COLS; c++){
        const el = document.createElement('div');
        el.className = 'puzzle__tile';
        el.dataset.row = r; el.dataset.col = c;
        el.style.left = (c*tileW)+'%';  el.style.top = (r*tileH)+'%';
        el.style.width = tileW+'%';     el.style.height = tileH+'%';
        el.style.setProperty('--c', c);   el.style.setProperty('--r', r);
        el.style.setProperty('--cols', COLS); el.style.setProperty('--rows', ROWS);
        el.style.setProperty('--colsm1', COLS-1); el.style.setProperty('--rowsm1', ROWS-1);
        grid.appendChild(el);
        tiles.push({ el, r, c, dist: Math.hypot(c-cc, r-cr)/maxDist });
      }
    }
    measureSeamFix();
  }

  function measureSeamFix(){
    const rect = stage.getBoundingClientRect();
    const tilePx = Math.min(rect.width/COLS, rect.height/ROWS) || 1;
    SEATED_SCALE = 1 + (C.seamFix * 2) / tilePx;     // rest scale of seated tile
  }

  function scatterOffset(t, rng, tWpx, tHpx){
    const amt = C.scatter;
    switch (C.scatterPattern){
      case 'edges-in': {
        const cx=(COLS-1)/2, cy=(ROWS-1)/2, vx=t.c-cx, vy=t.r-cy, m=Math.hypot(vx,vy)||1;
        return { dx:(vx/m)*amt*tWpx*(0.6+rng()), dy:(vy/m)*amt*tHpx*(0.6+rng()) };
      }
      case 'ring': {
        const ang=rng()*Math.PI*2;
        return { dx:Math.cos(ang)*amt*tWpx*1.4, dy:Math.sin(ang)*amt*tHpx*1.4 };
      }
      case 'rows': {
        const dir = (t.r%2===0)?-1:1;
        return { dx:dir*amt*tWpx*(1+rng()), dy:(rng()-0.5)*tHpx*0.4 };
      }
      default:
        return { dx:(rng()*2-1)*amt*tWpx, dy:(rng()*2-1)*amt*tHpx };
    }
  }

  function staggerStart(t){
    let key;
    switch (C.staggerFrom){
      case 'edges':  key = 1 - t.dist; break;
      case 'random': key = rngFrom(C.seed + (t.r*COLS+t.c))(); break;
      case 'rows':   key = t.r / Math.max(ROWS-1,1); break;
      default:       key = t.dist;            // center first
    }
    return key * C.staggerAmount;
  }

  function assemble(){
    if (reduce){
      tiles.forEach(t=> gsap.set(t.el,{x:0,y:0,scale:SEATED_SCALE,autoAlpha:1,filter:'blur(0px)'}));
      return;
    }
    const rect = stage.getBoundingClientRect();
    const tWpx = rect.width/COLS, tHpx = rect.height/ROWS;
    const rng = rngFrom(C.seed);

    tiles.forEach(t=>{
      const o = scatterOffset(t, rng, tWpx, tHpx);
      t.rx=o.dx; t.ry=o.dy; t.startP=staggerStart(t);
      gsap.set(t.el,{ x:t.rx, y:t.ry, scale:C.scaleFrom,
        autoAlpha:C.opacityFrom, filter:`blur(${C.blurFrom}px)`,
        willChange:'transform,opacity,filter' });
    });

    (C.trigger==='inview') ? inview() : scrub();
  }

  function scrub(){
    const tl = gsap.timeline();
    tiles.forEach(t=>{
      tl.fromTo(t.el,
        { x:t.rx, y:t.ry, scale:C.scaleFrom, autoAlpha:C.opacityFrom, filter:`blur(${C.blurFrom}px)` },
        { x:0, y:0, scale:SEATED_SCALE, autoAlpha:1, filter:'blur(0px)',
          duration:C.tileWindow, ease:EASE,
          onComplete(){ t.el.style.willChange='auto'; t.el.style.filter='none'; } },
        t.startP);
    });
    timeline = tl;
    st = ScrollTrigger.create({
      trigger:root, start:'top top', end:C.scrollDistance,
      scrub:true, pin:C.pin, anticipatePin:1, animation:tl,
    });
  }

  function inview(){
    const tl = gsap.timeline({ paused:true });
    tl.to(tiles.map(t=>t.el), {
      x:0, y:0, scale:SEATED_SCALE, autoAlpha:1, filter:'blur(0px)',
      duration:C.duration, ease:EASE,
      stagger:{ each:C.totalStagger/Math.max(tiles.length-1,1),
        from:(C.staggerFrom==='edges'?'edges':C.staggerFrom==='random'?'random':'center') },
      onComplete(){ tiles.forEach(t=>{ t.el.style.willChange='auto'; t.el.style.filter='none'; }); }
    });
    timeline = tl;
    st = ScrollTrigger.create({ trigger:root, start:'top 75%', once:true, onEnter(){ tl.play(); } });
  }

  async function boot(){
    await preload(C.src);
    buildTiles();
    assemble();
    ScrollTrigger.refresh();
  }
  boot();

  let rT;
  function onResize(){ clearTimeout(rT); rT=setTimeout(()=>{ measureSeamFix(); ScrollTrigger.refresh(); },200); }
  window.addEventListener('resize', onResize);

  return {
    timeline: ()=>timeline,
    scrollTrigger: ()=>st,
    refresh: ()=>ScrollTrigger.refresh(),
    destroy(){ window.removeEventListener('resize', onResize); st && st.kill(); timeline && timeline.kill(); grid.innerHTML=''; }
  };
}

if (typeof module !== 'undefined' && module.exports) module.exports = PuzzleImage;
