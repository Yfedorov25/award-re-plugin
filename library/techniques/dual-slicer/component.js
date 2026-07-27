/* ============================================================
   DUAL-SLICER · component.js  (DUAL-PLATFORM wrapper)
   ------------------------------------------------------------
   Springs' coupled-split slicer: a right-column vertical render-strip that slices
   through N renders, per-line heading reveal on the left, and a rising inset photo —
   all coupled on one pinned scroll. Pure render(prog).

   🔴 DUAL-PLATFORM:
     desktop → scrollSlice() — render(prog) scrubbed by scroll while the stage pins.
     mobile  → scrollSlice() too — SAME scroll-pin slice; stage sticks (single-column
               layout) and the strip slices by SCROLL-PROGRESS. Not a timer (S19g).
   Both drive the SAME render(prog) via manualDrive. meta{differs}.
   Entry: DualSlicerDual.init(target, opts) -> { platform, engine, driver }.
   ============================================================ */
(function (global) {
  'use strict';
  function resolvePlatform(o){ if(o==='desktop'||o==='mobile')return o;
    return (global.matchMedia&&global.matchMedia('(min-width:1024px)').matches)?'desktop':'mobile'; }
  function ease(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }

  function scrollDrive(stage, renderFn){
    var pin = stage.closest('.pin-wrap') || stage.parentElement || stage;
    function onScroll(){ var r=pin.getBoundingClientRect(), vh=global.innerHeight||800;
      var span=(pin.offsetHeight-vh)||vh; renderFn(Math.max(0,Math.min(1,(-r.top)/span))); }
    onScroll(); global.addEventListener('scroll',onScroll,{passive:true}); global.addEventListener('resize',onScroll);
    return { onScroll:onScroll };
  }

  function init(target, options){
    options=options||{};
    var stage = typeof target==='string'?document.querySelector(target):target;
    if(!stage){ try{global.__LAB_OK__=true;}catch(e){} return {error:'no target'}; }
    if(!global.DualSlicer){ return {error:'engine (DualSlicer) not loaded'}; }
    var platform=resolvePlatform(options.platform||'auto');
    var reduced=global.matchMedia&&global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var engineOpts={ manualDrive:true, forceMotion:true };
    for(var k in options) if(options.hasOwnProperty(k)&&k!=='platform'&&k!=='holdMs'&&k!=='moveMs') engineOpts[k]=options[k];
    var engine=global.DualSlicer.init(target, engineOpts);
    if(!engine||!engine.render){ return {error:'engine render unavailable', engine:engine}; }
    var count=engine.count||2;
    stage.setAttribute('data-ds-platform', platform);
    stage.setAttribute('data-ds-mech', 'slice');
    // BOTH platforms = clip-slice strip (Єгор: слайсер на телефоні МАЄ бути такий самий як
    // на компі — для ЦЬОГО прийому слайс правильний і на вузькому). renderMobile не юзаємо.
    var driver=null;
    if(reduced){ engine.render(0); }
    else { driver=scrollDrive(stage, engine.render); }  /* both scroll-pin, same slice render */
    try{global.__LAB_OK__=true;}catch(e){}
    return { platform:platform, engine:engine, driver:driver, count:count };
  }
  var api={init:init}; global.DualSlicerDual=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:this);
