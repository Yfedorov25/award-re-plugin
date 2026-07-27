/* ============================================================
   RENDER-SCROLL-SCALE · component.js  (DUAL-PLATFORM wrapper)
   ------------------------------------------------------------
   Springs' "the hero image breathes" primitive: one full-bleed render in a fixed
   clipping frame that scales up on scroll. Pure set(p) scrub of the scale (+drift).

   🔴 DUAL-PLATFORM (corrected S19g — springs scale-creep is SCROLL-tied on both, it
      accompanies an act by scroll-progress, not an endless timer-breathe):
     desktop → scrollScale() — set(p) scrubbed by scroll while the frame pins.
     mobile  → scrollScale() too — SAME scroll-tied scale, frame sticks full-bleed and
               the scale creeps by SCROLL-PROGRESS. Not a timer.
   Both scroll-pin the SAME set(p); difference = layout + pin-length. meta{differs}.
   Entry: RenderScrollScaleDual.init(target, opts) -> { platform, engine, driver }.
   ============================================================ */
(function (global) {
  'use strict';
  function resolvePlatform(o){ if(o==='desktop'||o==='mobile')return o;
    return (global.matchMedia&&global.matchMedia('(min-width:1024px)').matches)?'desktop':'mobile'; }
  function ease(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }

  function scrollScale(frame, engine) {
    var pin = frame.closest('.pin-wrap') || frame.parentElement || frame;
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
    var frame = typeof target==='string'?document.querySelector(target):target;
    if(!frame){ try{global.__LAB_OK__=true;}catch(e){} return {error:'no target'}; }
    if(!global.RenderScrollScale){ return {error:'engine (RenderScrollScale) not loaded'}; }
    var platform = resolvePlatform(options.platform||'auto');
    var reduced = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var engineOpts = { forceMotion:true };
    for(var k in options) if(options.hasOwnProperty(k)&&k!=='platform'&&k!=='cycleMs') engineOpts[k]=options[k];
    var engine = global.RenderScrollScale.create(target, engineOpts);
    if(!engine||!engine.set){ return {error:'engine set unavailable', engine:engine}; }
    frame.setAttribute('data-rss-platform', platform);
    var driver = null;
    if(reduced){ engine.set(0); }
    else { driver = scrollScale(frame, engine); }  /* both platforms scroll-pin */
    try{global.__LAB_OK__=true;}catch(e){}
    return { platform:platform, engine:engine, driver:driver };
  }
  var api={init:init}; global.RenderScrollScaleDual=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:this);
