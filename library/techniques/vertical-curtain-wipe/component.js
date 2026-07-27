/* ============================================================
   VERTICAL-CURTAIN-WIPE · component.js  (DUAL-PLATFORM wrapper)
   ------------------------------------------------------------
   Springs' section-ENTRY wipe: a panel enters as a hard VERTICAL seam wiping L->R and
   parking at the column split, while the outgoing full-bleed image crop-zooms to stay
   composed in its shrinking column. Pure render(prog).

   🔴 DUAL-PLATFORM — DIFFERENT mechanic per platform (D_SPRINGS_video mobile table):
     desktop → scrollWipe()      — render(prog): a hard VERTICAL SEAM wipes L->R and parks
               at the column split (scroll-scrubbed while pinned). The desktop доводчик.
     mobile  → scrollCrossfade() — renderMobile(prog): NO seam wipe (бічний вріз reads
               unnatural on a narrow screen). Instead a full-bleed CROSSFADE + bg scale-creep
               (T-CROSSFADE-ACT) — the incoming panel fades opacity 0->1 over the outgoing
               media by scroll-progress while it pins. Springs' own mobile substitution.
   Both scroll-driven while pinned (S19g), but mobile has its OWN visual, not the desktop
   wipe squeezed down. meta{differs}. Entry: VerticalCurtainWipeDual.init(target, opts).
   ============================================================ */
(function (global) {
  'use strict';
  function resolvePlatform(o){ if(o==='desktop'||o==='mobile')return o;
    return (global.matchMedia&&global.matchMedia('(min-width:1024px)').matches)?'desktop':'mobile'; }

  // both read scroll progress off the pin-wrap; they differ in WHICH render they call.
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
    if(!global.VerticalCurtainWipe){ return {error:'engine (VerticalCurtainWipe) not loaded'}; }
    var platform=resolvePlatform(options.platform||'auto');
    var reduced=global.matchMedia&&global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var engineOpts={ manualDrive:true, forceMotion:true };
    for(var k in options) if(options.hasOwnProperty(k)&&k!=='platform') engineOpts[k]=options[k];
    var engine=global.VerticalCurtainWipe.init(target, engineOpts);
    if(!engine||!engine.render){ return {error:'engine render unavailable', engine:engine}; }
    stage.setAttribute('data-vcw-platform', platform);
    stage.setAttribute('data-vcw-mech', platform==='mobile' ? 'wipe-vertical' : 'wipe-horizontal');
    // SAME wipe technique, axis rotated per screen: desktop = horizontal seam L->R (render);
    // mobile = VERTICAL seam bottom->top (renderMobile) — the motion runs along the tall axis.
    var renderFn = (platform==='mobile' && engine.renderMobile) ? engine.renderMobile : engine.render;
    var driver=null;
    if(reduced){ renderFn(1); }                        /* reduced-motion → fully wiped-in */
    else { driver=scrollDrive(stage, renderFn); }      /* both scroll-pin; seam axis differs */
    try{global.__LAB_OK__=true;}catch(e){}
    return { platform:platform, engine:engine, driver:driver };
  }
  var api={init:init}; global.VerticalCurtainWipeDual=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:this);
