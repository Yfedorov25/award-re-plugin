/* ============================================================
   EDITORIAL-ACT-CROSSFADE · component.js  (DUAL-PLATFORM wrapper)
   ------------------------------------------------------------
   Springs' pinned editorial: one scroll drives N acts that crossfade 4 layers at once
   (full-bleed image push-zoom + split-word headline centre-word swap + topline swap +
   body crossfade). Pure set(p) across the acts.

   🔴 DUAL-PLATFORM (corrected S19g against D_SPRINGS_video — springs mobile is a
      PINNED-SCROLL, NOT an auto-timer. T-PIN-RUNSCENE, "доводчик #1 за вагою"):
     desktop → scrollActs() — set(p) scrubbed by scroll while the stage pins (wide layout).
     mobile  → scrollActsMobile() — SAME scroll-pin crossfade, but the section sticks
               full-bleed single-column and the acts crossfade by SCROLL-PROGRESS (sticky
               media + copy crossfade over it). NOT auto-play — springs mobile pins the
               scene ~4 screens and swaps copy on scroll. Same set(p), scroll-driven both.
   The dual difference is now LAYOUT + pin-length, not scroll-vs-time. meta{differs}.
   Entry: EditorialActCrossfadeDual.init(target, opts) -> { platform, engine, driver }.
   ============================================================ */
(function (global) {
  'use strict';
  function resolvePlatform(o){ if(o==='desktop'||o==='mobile')return o;
    return (global.matchMedia&&global.matchMedia('(min-width:1024px)').matches)?'desktop':'mobile'; }
  function ease(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }

  // BOTH platforms are scroll-pin driven now — the section sticks and the acts
  // crossfade by scroll-progress through a tall pin-wrap. (springs mobile = the same
  // pinned-scroll dovodchik as desktop, per D_SPRINGS_video T-PIN-RUNSCENE.)
  function scrollActs(stage, engine){
    var pin = stage.closest('.pin-wrap') || stage.parentElement || stage;
    function onScroll(){ var r=pin.getBoundingClientRect(), vh=global.innerHeight||800;
      var span=(pin.offsetHeight-vh)||vh; engine.set(Math.max(0,Math.min(1,(-r.top)/span))); }
    onScroll(); global.addEventListener('scroll',onScroll,{passive:true}); global.addEventListener('resize',onScroll);
    return { onScroll:onScroll };
  }

  function init(target, options){
    options=options||{};
    var stage = typeof target==='string'?document.querySelector(target):target;
    if(!stage){ try{global.__LAB_OK__=true;}catch(e){} return {error:'no target'}; }
    if(!global.EditorialActCrossfade){ return {error:'engine (EditorialActCrossfade) not loaded'}; }
    var platform=resolvePlatform(options.platform||'auto');
    var reduced=global.matchMedia&&global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var engineOpts={ manualDrive:true, forceMotion:true };
    for(var k in options) if(options.hasOwnProperty(k)&&k!=='platform') engineOpts[k]=options[k];
    var engine=global.EditorialActCrossfade.create(target, engineOpts);
    if(!engine||!engine.set){ return {error:'engine set unavailable', engine:engine}; }
    var acts=engine.acts||engine.count||3;
    stage.setAttribute('data-eac-platform', platform);
    // both platforms scroll-pin driven (springs mobile = pinned-scroll, not auto)
    var driver = reduced ? (engine.set(0), null) : scrollActs(stage, engine);
    try{global.__LAB_OK__=true;}catch(e){}
    return { platform:platform, engine:engine, driver:driver, acts:acts };
  }
  var api={init:init}; global.EditorialActCrossfadeDual=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:this);
