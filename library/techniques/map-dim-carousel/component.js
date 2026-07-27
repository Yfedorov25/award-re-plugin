/* ============================================================
   MAP-DIM-CAROUSEL · component.js  (DUAL-PLATFORM wrapper)
   ------------------------------------------------------------
   Springs' /location "the center of your life" primitive: a POI map DIMS to a dark
   backdrop while a serif ANNOUNCE headline + sub rise over it and a RAIL of location
   beats advances. Pure set(p) scrub of the announce; the rail steps as p crosses gates.

   🔴 DUAL-PLATFORM (S19g law — MOBILE = PINNED-SCROLL, not a timer):
     desktop → scrollMap() — set(p) scrubbed by scroll while the stage pins (wide / 2-col).
     mobile  → scrollMap() too — SAME scroll-tied announce, stage sticks full-bleed and the
               map dims + rail advances by SCROLL-PROGRESS (single-col). Not a timer.
   Both scroll-pin the SAME set(p)/go(); difference = layout + pin-length. meta{differs}.
   The wrapper OWNS the scroll driver (engine built with manualDrive so its own ScrollTrigger
   is bypassed). Entry: MapDimCarouselDual.init(target, opts) -> { platform, engine, driver }.
   ============================================================ */
(function (global) {
  'use strict';
  function resolvePlatform(o){ if(o==='desktop'||o==='mobile')return o;
    return (global.matchMedia&&global.matchMedia('(min-width:1024px)').matches)?'desktop':'mobile'; }

  // The scroll driver: read progress off the pin-wrap (stage is sticky -> its top is always 0).
  // First ~60% of the scroll span reveals the announce (set(p)); the tail advances the rail.
  function scrollMap(stage, engine, opts) {
    var pin = stage.closest('.pin-wrap') || stage.parentElement || stage;
    var railStart = opts.railStart != null ? opts.railStart : 0.6; // p where rail-advance begins
    var steps = Math.max(1, opts.railSteps || 2);                   // how many rail nudges over the tail
    function onScroll(){
      var r = pin.getBoundingClientRect(), vh = global.innerHeight||800;
      var span = (pin.offsetHeight - vh) || vh;
      var prog = Math.max(0, Math.min(1, (-r.top)/span));
      // ENTER: map the first railStart of scroll onto the full 0..1 announce reveal.
      engine.set(Math.min(1, prog / railStart));
      // ADVANCE: the tail (railStart..1) steps the finite rail.
      if (engine.go) {
        var t = Math.max(0, (prog - railStart) / (1 - railStart));
        engine.go(Math.min(steps, Math.floor(t * (steps + 1))));
      }
    }
    onScroll(); global.addEventListener('scroll',onScroll,{passive:true}); global.addEventListener('resize',onScroll);
    return { onScroll: onScroll };
  }

  function init(target, options){
    options = options||{};
    var stage = typeof target==='string'?document.querySelector(target):target;
    if(!stage){ try{global.__LAB_OK__=true;}catch(e){} return {error:'no target'}; }
    if(!global.MapDimCarouselAnnounce){ return {error:'engine (MapDimCarouselAnnounce) not loaded'}; }
    var platform = resolvePlatform(options.platform||'auto');
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // wrapper owns the scroll driver -> forceMotion (skip narrow static-lock) + manualDrive
    // (skip the engine's own ScrollTrigger) + manageLenis:false (stage runs its own Lenis).
    var engineOpts = { forceMotion:true, manualDrive:true, manageLenis:false };
    for(var k in options) if(options.hasOwnProperty(k)&&k!=='platform'&&k!=='railStart'&&k!=='railSteps') engineOpts[k]=options[k];
    var engine = global.MapDimCarouselAnnounce.create(target, engineOpts);
    if(!engine||!engine.set){ return {error:'engine set unavailable', engine:engine}; }
    stage.setAttribute('data-mdc-platform', platform);
    var driver = null;
    if(reduced){ engine.set(1); if(engine.go)engine.go(0); }   // resolved state, no motion
    else { driver = scrollMap(stage, engine, options); }        // both platforms scroll-pin
    try{global.__LAB_OK__=true;}catch(e){}
    return { platform:platform, engine:engine, driver:driver };
  }
  var api={init:init}; global.MapDimCarouselDual=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:this);
