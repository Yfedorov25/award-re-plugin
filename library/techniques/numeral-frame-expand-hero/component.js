/* ============================================================
   NUMERAL-FRAME-EXPAND-HERO · component.js  (DUAL-PLATFORM wrapper)
   ------------------------------------------------------------
   Springs' pinned hero-narrative: giant outline numerals with a small framed view
   inside; on scroll the frame expands to full-bleed, numerals fade, a serif title
   rises, a parallax pan, then exit-rise — one continuous pinned scroll story. Pure
   set(p) across the whole narrative.

   🔴 DUAL-PLATFORM:
     desktop → scrollHero() — set(p) scrubbed by scroll while the hero pins.
     mobile  → autoHero()   — set(p) plays the narrative 0→1 once over time on mount,
               then rests at the resolved frame (springs mobile plays it on load).
   Both drive the SAME set(p) via manualDrive. meta{differs}.
   Entry: NumeralFrameExpandHeroDual.init(target, opts) -> { platform, engine, driver }.
   ============================================================ */
(function (global) {
  'use strict';
  function resolvePlatform(o){ if(o==='desktop'||o==='mobile')return o;
    return (global.matchMedia&&global.matchMedia('(min-width:1024px)').matches)?'desktop':'mobile'; }
  function ease(t){ return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2; }

  function scrollHero(hero, engine){
    var pin = hero.closest('.pin-wrap') || hero.parentElement || hero;
    function onScroll(){ var r=pin.getBoundingClientRect(), vh=global.innerHeight||800;
      var span=(pin.offsetHeight-vh)||vh; engine.set(Math.max(0,Math.min(1,(-r.top)/span))); }
    onScroll(); global.addEventListener('scroll',onScroll,{passive:true}); global.addEventListener('resize',onScroll);
    return { onScroll:onScroll };
  }
  function autoHero(engine, playMs, restAt){
    // play 0 -> restAt once (the reveal/expand/title), holding before the exit beat
    var t0=null, raf=0;
    function frame(now){ if(t0===null)t0=now; var p=Math.min(1,(now-t0)/playMs);
      engine.set(ease(p)*restAt); if(p<1) raf=global.requestAnimationFrame(frame); }
    raf=global.requestAnimationFrame(frame);
    return { stop:function(){ if(raf)global.cancelAnimationFrame(raf); } };
  }

  function init(target, options){
    options=options||{};
    var hero = typeof target==='string'?document.querySelector(target):target;
    if(!hero){ try{global.__LAB_OK__=true;}catch(e){} return {error:'no target'}; }
    if(!global.NumeralFrameExpandHero){ return {error:'engine (NumeralFrameExpandHero) not loaded'}; }
    var platform=resolvePlatform(options.platform||'auto');
    var reduced=global.matchMedia&&global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var engineOpts={ manualDrive:true, forceMotion:true };
    for(var k in options) if(options.hasOwnProperty(k)&&k!=='platform'&&k!=='playMs'&&k!=='restAt') engineOpts[k]=options[k];
    var engine=global.NumeralFrameExpandHero.create(target, engineOpts);
    if(!engine||!engine.set){ return {error:'engine set unavailable', engine:engine}; }
    hero.setAttribute('data-nfe-platform', platform);
    var driver=null;
    if(reduced){ engine.set(0.7); } // resolved frame + title, no exit
    else if(platform==='desktop'){ driver=scrollHero(hero, engine); }
    else { driver=autoHero(engine, options.playMs!=null?options.playMs:2200, options.restAt!=null?options.restAt:0.8); }
    try{global.__LAB_OK__=true;}catch(e){}
    return { platform:platform, engine:engine, driver:driver };
  }
  var api={init:init}; global.NumeralFrameExpandHeroDual=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:this);
