import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium(); if(!chromium){console.error('no chromium');process.exit(2);}
const b = await chromium.launch();
const ctx = await b.newContext({viewport:{width:1440,height:900}});
const page = await ctx.newPage();
const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text());});
page.on('pageerror',e=>errs.push('PAGEERR: '+e.message));
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle',timeout:30000});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
// probe: at each progress p, which scene/atom is visible (opacity>0.5 & on-screen)
const probe = await page.evaluate(async ()=>{
  const ids=['scNat','cardHand','cardTerr','cardSlide','scPlace','morph','scRunners','scLeaf','scWater','scCity','scLoc','map',
    'natTitle','enjoy','slideCap','placeTitle','runners','odo'];
  function vis(id){const el=document.getElementById(id);if(!el)return 0;const s=getComputedStyle(el);
    const cp=s.clipPath||''; const clipped=/inset\((100|9\d)/.test(cp);
    return (parseFloat(s.opacity)>0.5 && !clipped)?1:0;}
  const out={};
  for(const p of [0.05,0.15,0.24,0.28,0.33,0.40,0.45,0.53,0.62,0.70,0.82,0.92]){
    window.render(p); await new Promise(r=>setTimeout(r,60));
    out['p'+p]=ids.filter(vis);
  }
  return out;
});
console.log('console errors:', errs.length? errs.join('\n') : 'NONE');
console.log('\n=== which atoms visible at each progress p ===');
for(const [k,v] of Object.entries(probe)) console.log(k.padEnd(7), v.join(', '));
await b.close();
