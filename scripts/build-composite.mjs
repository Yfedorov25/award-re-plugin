// build-composite.mjs — assemble the 7 sub-organisms into ONE inline single-page composite (no
// iframes). Each section's <style> is scoped under a unique wrapper (.soN), its #track becomes
// #trackN, its pin choreography keeps its own render(p) but ALL sections are driven from ONE shared
// scroll loop + ONE Lenis. This removes the iframe scroll/pin desync that caused the stutter.
//
// Method: read each section's index.html, pull the inner <style> and the .track…</div> markup and
// the render() body. Scope CSS by prefixing every rule with `#soN ` (except @media/@keyframes/:root
// which are handled specially), rename ids, and wrap markup in <section id="soN">.
import fs from 'fs';
import path from 'path';

const ROOT='/Users/yehorfedorov/Downloads/award-re-springs/library/techniques/suborganisms';
const OUT=path.join(ROOT,'COMPOSITE-home','index.html');
const SECTIONS=[
  {n:1,slug:'SO-1-hero-wellness',name:'Hero → Wellness'},
  {n:2,slug:'SO-2-wellness-nature',name:'Wellness → Nature'},
  {n:3,slug:'SO-3-nature-place',name:'Nature → Place'},
  {n:4,slug:'SO-4-place-location',name:'Place → Location'},
  {n:5,slug:'SO-5-location-residences',name:'Location → Residences'},
  {n:6,slug:'SO-6-residences-interiors',name:'Residences → Interiors'},
  {n:7,slug:'SO-7-interiors-footer',name:'Interiors → Footer'},
];

// --- tiny CSS scoper: prefix each top-level selector with `scope `. Leaves @media/@keyframes/:root/*
//     rules handled: :root vars are hoisted global (shared), * reset dropped (one global reset), @media
//     bodies are recursively scoped. ---
function scopeCss(css, scope){
  // strip comments
  css = css.replace(/\/\*[\s\S]*?\*\//g,'');
  let out=[]; let i=0;
  while(i<css.length){
    // find next '{' or '@'
    if(css[i]==='@'){
      // at-rule: read until matching block or ';'
      const at=css.slice(i);
      const mediaM=at.match(/^@media[^{]*\{/i);
      const kfM=at.match(/^@keyframes[^{]*\{/i);
      if(mediaM){
        const head=mediaM[0];
        // find matching close brace for this @media block
        let depth=0,j=i+head.length-1,start=i+head.length;
        for(j=i+head.length-1;j<css.length;j++){ if(css[j]==='{')depth++; else if(css[j]==='}'){depth--; if(depth===0)break;} }
        const inner=css.slice(start,j);
        out.push(head+scopeCss(inner,scope)+'}');
        i=j+1; continue;
      } else if(kfM){
        // keep keyframes global but rename to avoid collisions: soN-keyframename
        let depth=0,j;
        for(j=i+kfM[0].length-1;j<css.length;j++){ if(css[j]==='{')depth++; else if(css[j]==='}'){depth--; if(depth===0)break;} }
        out.push(css.slice(i,j+1)); i=j+1; continue;
      } else {
        // other at-rule up to ;
        const semi=css.indexOf(';',i); out.push(css.slice(i,semi+1)); i=semi+1; continue;
      }
    }
    const brace=css.indexOf('{',i);
    if(brace<0){ break; }
    const sel=css.slice(i,brace).trim();
    // GUARD: an @media/@keyframes may appear here if it wasn't at css[i] exactly (leading whitespace
    // after a prior rule). Never prefix a selector onto an at-rule — that produces invalid CSS
    // (`#so4 @media{...}`) which corrupts the parser and collapses following rules (the SO-4..7
    // track-height bug). Recurse on its inner block instead.
    if(/^@media/i.test(sel)){
      let depth=0,j; for(j=brace;j<css.length;j++){ if(css[j]==='{')depth++; else if(css[j]==='}'){depth--; if(depth===0)break;} }
      const inner=css.slice(brace+1,j);
      out.push(sel+'{'+scopeCss(inner,scope)+'}'); i=j+1; continue;
    }
    if(/^@keyframes/i.test(sel)){
      let depth=0,j; for(j=brace;j<css.length;j++){ if(css[j]==='{')depth++; else if(css[j]==='}'){depth--; if(depth===0)break;} }
      out.push(css.slice(i,j+1).trim()); i=j+1; continue;
    }
    const close=css.indexOf('}',brace);
    const body=css.slice(brace+1,close);
    if(sel===':root'){
      // hoist root vars to a global :root (they are identical across sections → fine)
      out.push(':root{'+body+'}');
    } else if(sel==='*'){
      // drop per-section universal reset (one global reset covers it)
    } else if(sel==='html'||sel==='body'||sel==='html,body'){
      // The section's html/body rule sets bg/color/font on its wrapper — KEEP those, but STRIP any
      // `overflow*` declaration: overflow on the #soN wrapper creates a scroll/clip container that
      // BREAKS position:sticky for the .pin inside it (memory pastka #3). The composite <body> owns
      // overflow-x globally. This is the bug that made SO-4..7 pins fail to stick.
      const cleaned=body.split(';').filter(d=>!/^\s*overflow/i.test(d)).join(';');
      out.push(scope+'{'+cleaned+'}');
    } else {
      // scope each comma-separated selector
      const scoped=sel.split(',').map(s=>{
        s=s.trim();
        return scope+' '+s;
      }).join(', ');
      out.push(scoped+'{'+body+'}');
    }
    i=close+1;
  }
  return out.join('\n');
}

function extract(html){
  const style=(html.match(/<style>([\s\S]*?)<\/style>/i)||[])[1]||'';
  // body markup: from first `<div class="track"` to the matching cue/below — grab everything in <body>
  const bodyM=html.match(/<body>([\s\S]*?)<script/i);
  let body=bodyM?bodyM[1]:'';
  // the inline <script> block(s)
  const scripts=[...html.matchAll(/<script(?:\s+src="([^"]*)")?\s*>([\s\S]*?)<\/script>/gi)];
  const headLinks=[...html.matchAll(/<link rel="stylesheet" href="([^"]*)">/gi)].map(m=>m[1]);
  const headScripts=[...html.matchAll(/<script src="([^"]*)"><\/script>/gi)].map(m=>m[1]);
  return {style,body,scripts,headLinks,headScripts};
}

let styleAll='', bodyAll='', initAll='';
const externalCss=new Set(), externalJs=new Set();

for(const S of SECTIONS){
  const file=path.join(ROOT,S.slug,'index.html');
  const html=fs.readFileSync(file,'utf8');
  const {style,body,headLinks,headScripts,scripts}=extract(html);
  const scope='#so'+S.n;
  // collect external deps (resolve relative to that section dir → relative to composite dir)
  headLinks.forEach(h=>{ if(!/lenis/.test(h)) externalCss.add(rel(S.slug,h)); });
  headScripts.forEach(h=>{ if(!/lenis/i.test(h)) externalJs.add(rel(S.slug,h)); });
  // scope + fix relative asset urls inside the section CSS (media/ → SO-x/media/)
  let scss=scopeCss(style,scope);
  scss=fixUrls(scss,S.slug);
  styleAll+=`\n/* ===== ${S.slug} ===== */\n`+scss+'\n';

  // body: rename id="track" → id="trackN", fix relative urls in inline styles/src, wrap
  let b=body.replace(/id="track"/g,`id="track${S.n}"`);
  b=fixUrls(b,S.slug);
  bodyAll+=`\n<section id="so${S.n}" class="so" data-n="${S.n}" data-name="${S.name}">\n${b}\n</section>\n`;

  // the render/init inline script: wrap in an IIFE that exposes render+els; strip its own rAF/Lenis/jump.
  const inline=scripts.filter(m=>!m[1]).map(m=>m[2]).join('\n');
  const wrapped=wrapInit(inline,S.n,S.slug);
  initAll+=`\n/* ---- ${S.slug} ---- */\n`+wrapped+'\n';
}

function rel(slug,h){
  // h is relative to the section dir (e.g. ../../rotated-matrix-collage/x.css). Composite is one dir
  // deeper sibling (COMPOSITE-home/), so the same ../.. depth applies (both are direct children of
  // suborganisms/). So relative paths are IDENTICAL. Return as-is.
  return h;
}
function fixUrls(s,slug){
  // rewrite url('media/...') and src="media/..." and href="media/..." to point into the section folder
  s=s.replace(/url\((['"]?)media\//g,(m,q)=>`url(${q}../${slug}/media/`);
  s=s.replace(/(src|href)=(['"])media\//g,(m,a,q)=>`${a}=${q}../${slug}/media/`);
  return s;
}
function wrapInit(code,n,slug){
  // Remove each section's own driver tail: requestAnimationFrame(frame), the ?s jump block, and Lenis.
  // Keep var decls + render(p) + helper fns. We re-drive render(progress) from the shared loop.
  // Strategy: expose the section's render + its track element under COMP[n].
  // The section code defines `function render(p)` and `function frame(){...}` and `var track=...`.
  // We keep render + everything above it, drop frame()+its call+the qs/Lenis tail.
  let c=code;
  // cut everything from `function frame(` onward
  const fi=c.indexOf('function frame(');
  if(fi>=0) c=c.slice(0,fi);
  // Repoint DOM lookups into this section's scope. Handle the leading `document.` uniformly so we
  // never produce `document.document`.
  // 1) getElementById('track') → getElementById('trackN')  (keep as document.getElementById)
  c=c.replace(/document\.getElementById\('track'\)/g,`document.getElementById('track${n}')`);
  // 2) document.querySelector('.pin') / '.rmc-plane' → scoped
  c=c.replace(/document\.querySelector\('\.pin'\)/g,`document.querySelector('#so${n} .pin')`);
  c=c.replace(/document\.querySelector\('\.rmc-plane'\)/g,`document.querySelector('#so${n} .rmc-plane')`);
  // 3) document.querySelectorAll('#foo .bar') → scoped under section
  c=c.replace(/document\.querySelectorAll\('#([A-Za-z0-9_]+)([^']*)'\)/g,`document.querySelectorAll('#so${n} #$1$2')`);
  // 4) document.getElementById('someId') (not trackN) → document.querySelector('#soN #someId')
  c=c.replace(/document\.getElementById\('([A-Za-z0-9_]+)'\)/g,(m,id)=>{
    if(id==='track'+n) return m; return `document.querySelector('#so${n} #${id}')`;
  });
  // 5) bare getElementById(...) without document. prefix → same, with document.
  c=c.replace(/([^.])getElementById\('([A-Za-z0-9_]+)'\)/g,(m,pre,id)=>{
    if(id==='track'+n) return `${pre}document.getElementById('track${n}')`;
    return `${pre}document.querySelector('#so${n} #${id}')`;
  });
  // 6) RotatedMatrixCollage.init('#collage'...) → scope the selector
  c=c.replace(/\.init\('#([A-Za-z0-9_]+)'/g,`.init('#so${n} #$1'`);
  return `COMP[${n}]=(function(){\n${c}\n return {render:render, track:document.getElementById('track${n}')};\n})();`;
}

const externalCssTags=[...externalCss].map(h=>`<link rel="stylesheet" href="${h}">`).join('\n');
const externalJsTags=[...externalJs].map(h=>`<script src="${h}"></script>`).join('\n');

const page=`<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>springs.estate — КОМПОЗИТ головної (SO-1..SO-7, inline single-page)</title>
<link rel="stylesheet" href="../../_springs-tokens.css">
${externalCssTags}
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js"></script>
<style>
  /* COMPOSITE (inline single-page) — one document, one scroll, one Lenis, one rAF. Each section is
     scoped under #soN so its verbatim CSS can't collide. Drives every section's own render(progress)
     from the shared loop by each section's real scroll position → smooth, springs-like pacing. */
  *{margin:0;padding:0;box-sizing:border-box}
  html{scroll-behavior:auto}
  body{background:#0e241d;color:#efe9dd;font-family:var(--spr-sans);overflow-x:clip}
  .so{ position:relative; }
  .so .track{ position:relative; }
  .so .pin{ position:sticky; top:0; height:100vh; overflow:hidden; }
${styleAll}
  .chud{ position:fixed; left:16px; bottom:16px; z-index:99; font:600 11px/1.4 system-ui,sans-serif;
    letter-spacing:.12em; text-transform:uppercase; color:#e6ded0; background:rgba(14,36,29,.7);
    padding:8px 12px; border:1px solid rgba(230,224,208,.25); border-radius:20px; backdrop-filter:blur(6px); }
  .chud b{ color:#fff; }
</style>
</head>
<body>
${bodyAll}
  <div class="chud">springs композит — <b id="chud">SO-1 · Hero → Wellness</b></div>

${externalJsTags}
<script>
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  var COMP={};
${initAll}
  // shared scroll loop: for each section compute its own progress from its real position, call render.
  var secs=[].slice.call(document.querySelectorAll('.so'));
  var chud=document.getElementById('chud');
  function frame(){
    var vh=window.innerHeight, mid=window.scrollY+vh/2, curName='SO-1 · Hero → Wellness';
    for(var n=1;n<=7;n++){ var c=COMP[n]; if(!c||!c.track) continue;
      var r=c.track.getBoundingClientRect(), total=c.track.offsetHeight-vh;
      var p=clamp((-r.top)/total,0,1);
      c.render(p);
      var top=r.top+window.scrollY; if(mid>=top){ var s=secs[n-1]; if(s) curName='SO-'+s.dataset.n+' · '+s.dataset.name; }
    }
    chud.textContent=curName;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  if(window.Lenis){ var lenis=new Lenis({lerp:0.1,smoothWheel:true});
    requestAnimationFrame(function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }); }
  window.__COMPOSITE_OK__=true;
</script>
</body>
</html>`;

fs.writeFileSync(OUT,page);
console.log('wrote',OUT,'\nsections:',SECTIONS.length,'externalCss:',[...externalCss],'externalJs:',[...externalJs]);
