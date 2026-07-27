#!/usr/bin/env node
/* gen-selfcontained.mjs — converts CD's Amenities.dc.html (DC/React) into
   variants/amenities-{a,b,c}.html + amenities-all.html (board).
   The DC file already ships a near-vanilla __SPRINGS_CTRL controller in <helmet>
   (parallax / reveal / card-settle / rule / kicker / header-theme). What it LACKS
   as a plain file is (1) the carousel state machine (step/go/paint, lens{a4,b3,c3})
   which lived only in the React DCLogic class, and (2) resolution of the {{ }}
   onClick/ref bindings. This converter:
     - strips <x-dc>, support.js, <helmet> wrapper tags (keeps their inner content),
     - fixes the font path fonts/ -> _fonts/,
     - rewrites onClick="{{ h }}" -> data-act="h" and ref="{{ refX }}" -> data-cref="x",
     - drops the trailing React <script>class Component…</script>,
     - appends ONE self-contained IIFE: carousel controller + {{ }} wiring + variant literal.
   Motion is left to the existing __SPRINGS_CTRL (already self-contained). */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, '..', 'variants');
mkdirSync(OUT, { recursive: true });

let dc = readFileSync(join(HERE, 'Amenities.dc.html'), 'utf8');

// 1. slice out the helmet inner (styles + scripts + controller) and the body markup.
const helmetInner = dc.match(/<helmet>([\s\S]*?)<\/helmet>/)[1];
// body = everything after </helmet> up to the trailing React class script
let body = dc.split('</helmet>')[1];
// drop the trailing DC React class script block entirely (from `<script>\nclass Component` to end)
body = body.replace(/<script>\s*class Component[\s\S]*$/m, '');
// close tags that the React block used to close
body = body.replace(/<\/x-dc>[\s\S]*$/m, '').replace(/<\/body>[\s\S]*$/m, '');

// 2. fix font path in helmet styles: fonts/ -> _fonts/
let helmet = helmetInner.replace(/url\(fonts\//g, 'url(_fonts/');

// 3. rewrite {{ }} bindings in body -> data-act / data-cref
//    onClick="{{ aNext }}" -> data-act="aNext"
body = body.replace(/onClick="\{\{\s*([a-zA-Z0-9_]+)\s*\}\}"/g, 'data-act="$1"');
//    ref="{{ refA }}" -> data-cref="a"  (refA/refB/refC -> a/b/c)
body = body.replace(/ref="\{\{\s*ref([ABC])\s*\}\}"/g, (_m, L) => `data-cref="${L.toLowerCase()}"`);
// safety: any leftover {{ ... }} -> strip to empty attr value so nothing renders literally
body = body.replace(/"\{\{[\s\S]*?\}\}"/g, '"#"');

// 4. the self-contained carousel + wiring + variant IIFE
const CAROUSEL_IIFE = `
<script>
/* self-contained carousel controller (ported from DCLogic step/go/paint) + {{ }} wiring */
(function(){
  var LENS = { a:4, b:3, c:3 };
  var idx  = { a:0, b:0, c:0 };
  function stageOf(w){ return document.querySelector('[data-cref="'+w+'"]'); }
  function paint(w){
    var stage = stageOf(w); if(!stage) return;
    var i = idx[w];
    stage.querySelectorAll('[data-cslide]').forEach(function(el,k){ el.style.opacity = k===i?'1':'0'; });
    stage.querySelectorAll('[data-ccap]').forEach(function(el,k){ el.style.opacity = k===i?'1':'0'; });
    var tabs = stage.querySelectorAll('[data-ctab]');
    tabs.forEach(function(el,k){
      el.style.color = k===i ? '#e0d1b6' : 'rgba(224,209,182,.5)';
      el.style.fontWeight = k===i ? '500' : '400';
    });
    var und = stage.querySelector('[data-cunder]');
    if (und && tabs.length){ und.style.width = (100/tabs.length)+'%'; und.style.transform = 'translateX('+(i*100)+'%)'; }
    var cnt = stage.querySelector('[data-ccount]');
    if (cnt) cnt.textContent = '0'+(i+1)+' / 0'+LENS[w];
  }
  function step(w,dir){ var n=LENS[w]; idx[w]=(idx[w]+dir+n)%n; paint(w); }
  function go(w,i){ idx[w]=i; paint(w); }
  // map the {{ }} handler names to actions
  var ACT = {
    aPrev:function(){step('a',-1);}, aNext:function(){step('a',1);},
    aTab0:function(){go('a',0);}, aTab1:function(){go('a',1);}, aTab2:function(){go('a',2);}, aTab3:function(){go('a',3);},
    bPrev:function(){step('b',-1);}, bNext:function(){step('b',1);},
    cPrev:function(){step('c',-1);}, cNext:function(){step('c',1);},
    toTop:function(){ if(window.__SPRINGS_CTRL) window.__SPRINGS_CTRL.scrollTop(); else window.scrollTo({top:0,behavior:'smooth'}); },
    setA:function(){ if(window.__SPRINGS_CTRL) window.__SPRINGS_CTRL.setVariant('A'); },
    setB:function(){ if(window.__SPRINGS_CTRL) window.__SPRINGS_CTRL.setVariant('B'); },
    setC:function(){ if(window.__SPRINGS_CTRL) window.__SPRINGS_CTRL.setVariant('C'); }
  };
  function wire(){
    document.querySelectorAll('[data-act]').forEach(function(b){
      var fn = ACT[b.getAttribute('data-act')];
      if (fn && !b.__wired){ b.__wired=1; b.addEventListener('click', function(e){ e.preventDefault(); fn(); }); }
    });
    // keyboard ← / → on the carousel nearest viewport centre
    if (!window.__AMEN_KEY){ window.__AMEN_KEY=1; window.addEventListener('keydown', function(e){
      if (e.key!=='ArrowLeft' && e.key!=='ArrowRight') return;
      var dir = e.key==='ArrowRight'?1:-1, cy=window.innerHeight/2, best=null, bd=1e9;
      ['a','b','c'].forEach(function(w){ var el=stageOf(w); if(!el) return; var r=el.getBoundingClientRect();
        if (r.bottom>0 && r.top<window.innerHeight){ var d=Math.abs((r.top+r.bottom)/2-cy); if(d<bd){bd=d;best=w;} } });
      if (best){ e.preventDefault(); step(best,dir); }
    }); }
  }
  // reduced-motion: kill crossfade transition so slide swaps are instant
  try { if (matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.querySelectorAll('[data-cslide],[data-ccap]').forEach(function(el){ el.style.transition='none'; });
  } } catch(e){}
  function boot(){ wire(); paint('a'); paint('b'); paint('c'); }
  if (document.readyState!=='loading') boot(); else document.addEventListener('DOMContentLoaded', boot);
})();
</script>`;

// 5. per-variant: bake the variant literal so __SPRINGS_CTRL boots on the right take.
//    __SPRINGS_CTRL defaults to 'A'; we set C.variant before its wait() resolves by
//    injecting a tiny pre-script that seeds window.__AMEN_VARIANT and patching the
//    controller call. Simplest robust approach: after the controller script runs,
//    call setVariant(V) on load.
/* review-only variant switcher. Tiny pill, top-right under the header, so it never
   covers the bottom-anchored body copy. Hidden when the page is embedded in the board
   iframe (the board supplies its own per-column label). */
const SWITCHER = `
<div data-vswitch style="position:fixed;right:12px;top:56px;z-index:120;display:flex;align-items:center;gap:3px;padding:4px;border-radius:20px;background:rgba(14,36,29,.6);backdrop-filter:blur(8px);border:1px solid rgba(224,209,182,.2);font-family:var(--sans);opacity:.85;">
  <button data-vbtn="A" data-act="setA" style="border:none;border-radius:16px;padding:4px 10px;font-size:11px;font-weight:500;letter-spacing:.04em;cursor:pointer;background:#e0d1b6;color:#162d24;">A</button>
  <button data-vbtn="B" data-act="setB" style="border:none;border-radius:16px;padding:4px 10px;font-size:11px;font-weight:500;letter-spacing:.04em;cursor:pointer;background:transparent;color:#e0d1b6;">B</button>
  <button data-vbtn="C" data-act="setC" style="border:none;border-radius:16px;padding:4px 10px;font-size:11px;font-weight:500;letter-spacing:.04em;cursor:pointer;background:transparent;color:#e0d1b6;">C</button>
  <span data-vlabel style="font-size:10px;letter-spacing:.02em;color:rgba(224,209,182,.65);padding:0 7px 0 3px;white-space:nowrap;">A · Calm flow</span>
</div>
<script>/* hide switcher inside the board iframe */try{if(window.top!==window.self){var _s=document.querySelector('[data-vswitch]');if(_s)_s.style.display='none';}}catch(e){}</script>`;

function page(variant){
  const V = variant.toUpperCase();
  const seed = `
<script>
/* seed the variant for this file */
(function(){
  function apply(){ if (window.__SPRINGS_CTRL && window.__SPRINGS_CTRL.setVariant){ window.__SPRINGS_CTRL.setVariant('${V}'); return true; } return false; }
  if (!apply()){ var n=0, iv=setInterval(function(){ if(apply()||n++>200) clearInterval(iv); }, 30); }
})();
</script>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Springs · Amenities · variant ${V}</title>
${helmet}
</head>
<body>
${body}
${SWITCHER}
${CAROUSEL_IIFE}
${seed}
</body>
</html>`;
}

for (const v of ['a','b','c']) {
  writeFileSync(join(OUT, `amenities-${v}.html`), page(v), 'utf8');
}

// 6. assembly board: 3 iframes A/B/C labelled
const BOARD = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Springs · Amenities · A / B / C board</title>
<style>
  body{margin:0;background:#0e1512;color:#e0d1b6;font-family:-apple-system,Helvetica,Arial,sans-serif;}
  .row{display:flex;gap:28px;padding:28px;overflow-x:auto;align-items:flex-start;}
  .col{flex:none;}
  .lbl{font-size:13px;letter-spacing:.14em;text-transform:uppercase;opacity:.8;margin:0 0 10px 4px;}
  iframe{width:390px;height:844px;border:1px solid #2a3a33;border-radius:14px;background:#0e241d;box-shadow:0 20px 60px rgba(0,0,0,.45);}
</style>
</head>
<body>
<div class="row">
  <div class="col"><p class="lbl">A · Calm flow</p><iframe src="amenities-a.html" title="A"></iframe></div>
  <div class="col"><p class="lbl">B · Deeper parallax</p><iframe src="amenities-b.html" title="B"></iframe></div>
  <div class="col"><p class="lbl">C · Designer take</p><iframe src="amenities-c.html" title="C"></iframe></div>
</div>
</body>
</html>`;
writeFileSync(join(OUT, 'amenities-all.html'), BOARD, 'utf8');

console.log('wrote amenities-{a,b,c,all}.html to', OUT);
