/* ============================================================
   RASTER-TILE-REVEAL · component.js  (DUAL-PLATFORM wrapper)
   ------------------------------------------------------------
   Springs' section-entry "the aerial map assembles" primitive: a frozen mosaic of
   raster map tiles that force-decode up front, then fade + scale in tile-by-tile along
   a diagonal, after which real POI dots drop onto their spots. Pure set(p) scrub of the
   whole reveal (tiles finish by p~0.62, dots land by p=1). Reversible.

   🔴 DUAL-PLATFORM (MOBILE = PINNED-SCROLL law, editorial-act-crossfade eталon):
     desktop → scrollReveal() — set(p) scrubbed by scroll while the mosaic pins.
     mobile  → scrollReveal() too — SAME scroll-tied reveal; mosaic sticks full-bleed
               1-col and the tiles resolve by SCROLL-PROGRESS. Not a timer.
   Both scroll-pin the SAME set(p); difference = layout (mobile full-bleed 1-col) +
   pin-length, NOT scroll-vs-time. meta{differs}.
   Entry: RasterTileRevealDual.init(target, opts) -> { platform, engine, driver }.
   ============================================================ */
(function (global) {
  'use strict';
  function resolvePlatform(o){ if(o==='desktop'||o==='mobile')return o;
    return (global.matchMedia&&global.matchMedia('(min-width:1024px)').matches)?'desktop':'mobile'; }

  function scrollReveal(stage, engine) {
    var pin = stage.closest('.pin-wrap') || stage.parentElement || stage;
    function onScroll(){
      var r = pin.getBoundingClientRect(), vh = global.innerHeight||800;
      var span = (pin.offsetHeight - vh) || vh;
      engine.set(Math.max(0, Math.min(1, (-r.top)/span)));
    }
    onScroll(); global.addEventListener('scroll',onScroll,{passive:true}); global.addEventListener('resize',onScroll);
    return { onScroll: onScroll };
  }

  function init(target, options){
    options = options||{};
    var stage = typeof target==='string'?document.querySelector(target):target;
    if(!stage){ try{global.__LAB_OK__=true;}catch(e){} return {error:'no target'}; }
    if(!global.RasterTileReveal){ return {error:'engine (RasterTileReveal) not loaded'}; }
    var platform = resolvePlatform(options.platform||'auto');
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* auto:false — the wrapper OWNS the driver (scroll-pin), so the engine's own
       ScrollTrigger one-shot must NOT fire and steal control. */
    var engineOpts = { auto:false };
    for(var k in options) if(options.hasOwnProperty(k)&&k!=='platform') engineOpts[k]=options[k];
    var engine = global.RasterTileReveal.create(target, engineOpts);
    if(!engine||!engine.set){ return {error:'engine set unavailable', engine:engine}; }
    stage.classList.add('rtr-pinned');
    stage.setAttribute('data-rtr-platform', platform);
    var driver = null;
    if(reduced){ engine.set(1); }              /* reduced-motion → static, fully shown */
    else { driver = scrollReveal(stage, engine); }  /* both platforms scroll-pin */
    try{global.__LAB_OK__=true;}catch(e){}
    return { platform:platform, engine:engine, driver:driver };
  }
  var api={init:init}; global.RasterTileRevealDual=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:this);
