#!/usr/bin/env node
/* wellness-gate.mjs — механічний гейт для amenities-wellness (scroll-card-over-media, 4 фази).
   Закон РУХУ (глибока хореографія, підтв. Єгором):
     Ф1 картки нема (media only); Ф2 картка вилазить+P1 reveal→pin ~40%; Ф3 P2 reveal+новий фон;
     Ф4 ланцюг фонів slide-up, картка pin→рух→pin→вгору.
   Перевіряє: P1 reveal росте; P2 reveal ПІЗНІШЕ за P1; медіа-ланцюг rise; картка pin-фаза; 0 err/404.
   node scripts/wellness-gate.mjs */
import { resolveChromium } from './token-extractor.mjs';
const chromium=await resolveChromium();
if(!chromium){console.error('no chromium');process.exit(2);}
const BASE='http://localhost:8879/atoms/amenities-wellness/variants/wellness.html';
let fails=0;const ok=(m)=>console.log('  ✓ '+m);const bad=(m)=>{console.log('  ✗ '+m);fails++;};
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
const p=await ctx.newPage();
const errs=[],nf=[];
p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
p.on('pageerror',e=>errs.push(String(e)));
p.on('response',r=>{if(r.status()>=400)nf.push(r.status()+' '+r.url().split('/').pop());});
await p.goto(BASE,{waitUntil:'networkidle'});
const at=(pp)=>p.evaluate(v=>window.render(v),pp);
const read=()=>p.evaluate(()=>{
  const cs=getComputedStyle;
  const clipBottom=el=>{ const v=cs(el).clipPath||cs(el).webkitClipPath; const m=v&&v.match(/inset\(([^)]+)\)/); if(!m)return 0; const parts=m[1].split(' '); return parseFloat(parts[2]!==undefined?parts[2]:parts[0]); };
  const m=new DOMMatrix(cs(document.getElementById('card')).transform);
  const bgY=i=>{ const el=document.querySelectorAll('.bg')[i]; return new DOMMatrix(cs(el).transform).f; };
  return { p1clip:clipBottom(document.getElementById('p1')), p2clip:clipBottom(document.getElementById('p2')),
    cardTy:Math.round(m.f), m1y:Math.round(bgY(1)), m3y:Math.round(bgY(3)), m4y:Math.round(bgY(4)),
    cardOpacity:+cs(document.getElementById('card')).opacity };
});

await at(0.05); const s0=await read();
await at(0.28); const s2=await read();
await at(0.44); const s2b=await read();
await at(0.60); const s3=await read();
await at(1.0); const s4=await read();

// 1. P1 reveals during phase2 (clip decreases 100→0)
if(s0.p1clip>90 && s2b.p1clip<10) ok('P1 reveal (clip '+Math.round(s0.p1clip)+'→'+Math.round(s2b.p1clip)+'%)'); else bad('P1 reveal не спрацював '+[s0.p1clip,s2b.p1clip]);
// 2. P2 reveals LATER than P1 (still hidden at phase2, revealed at phase3)
if(s2b.p2clip>90 && s3.p2clip<40) ok('P2 reveal ПІЗНІШЕ за P1 (phase3)'); else bad('P2 timing невірний (p2clip @0.44='+Math.round(s2b.p2clip)+' @0.60='+Math.round(s3.p2clip)+')');
// 3. card pin phase: cardTy ~same between 0.44 and slightly later phase2 pin
await at(0.46); const pinA=await read(); await at(0.49); const pinB=await read();
if(Math.abs(pinA.cardTy-pinB.cardTy)<8) ok('картка PIN-фаза (застигає ~40%)'); else bad('pin не тримає '+[pinA.cardTy,pinB.cardTy]);
// 4. media chain rises: m1 rises by phase2, m3/m4 rise later
if(s0.m1y>300 && s3.m1y<50) ok('медіа m1 піднявся (slide-up)'); else bad('m1 не піднявся');
if(s2b.m4y>700 && s4.m4y<80) ok('медіа m4 (marble) піднявся ПІЗНІШЕ'); else bad('m4 timing '+[s2b.m4y,s4.m4y]);
// 5. card rises up-and-out at end (cardTy decreases)
if(s3.cardTy>s4.cardTy) ok('картка їде вгору наприкінці'); else bad('картка не йде вгору');
// 6. no opacity fade
if(s2b.cardOpacity>0.98) ok('картка 0 opacity-fade (reveal геометричний clip)'); else bad('opacity-fade '+s2b.cardOpacity);

if(errs.length===0) ok('0 console-error'); else bad(errs.length+' err: '+errs.slice(0,2).join(' | '));
if(nf.length===0) ok('0 HTTP>=400'); else bad(nf.length+' 404: '+nf.slice(0,3).join(' | '));

await b.close();
console.log(fails===0?'\nPASS ✅ amenities-wellness scroll-card-over-media (4 фази)':`\nFAIL ❌ ${fails}`);
process.exit(fails===0?0:1);
