#!/usr/bin/env node
/* mobile-hero-coll.mjs — collision-check для M2 mobile-hero (3 варіанти), 390×844.
   Детектор text-collision (G22-родовід): текст-шари hero (титул / абзац / scroll-hint / хедер)
   НЕ налазять один на одного і НЕ вилазять за межі 390px. Перевіряємо на кількох render(p),
   бо parallax зсуває шари по скролу. */
import { resolveChromium, MOBILE_UA } from './token-extractor.mjs';
const chromium = await resolveChromium(); if(!chromium){console.error('no chromium');process.exit(2);}
const browser = await chromium.launch();
const BASE='http://localhost:8879/atoms/mobile-hero/variants';
const VW=390, VH=844;
let totalColl=0;

function overlap(a,b){ // площа перетину двох rect (0 якщо нема)
  if(!a||!b) return 0;
  const x=Math.max(0, Math.min(a.right,b.right)-Math.max(a.left,b.left));
  const y=Math.max(0, Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  return x*y;
}
function area(r){ return r?Math.max(0,(r.right-r.left))*(Math.max(0,r.bottom-r.top)):0; }

for(const v of ['a','b','c']){
  console.log(`\n=== mobile-hero-${v} collisions (390×844) ===`);
  const ctx = await browser.newContext({viewport:{width:VW,height:VH}, userAgent:MOBILE_UA, isMobile:true, hasTouch:true, deviceScaleFactor:3});
  const page = await ctx.newPage();
  try{
    await page.goto(`${BASE}/mobile-hero-${v}.html`,{waitUntil:'networkidle',timeout:30000});
    await page.waitForFunction(()=>window.__ATOM_OK__===true,{timeout:10000});
    let vColl=0;
    for(const p of [0, 0.5, 1]){
      const rects = await page.evaluate(pp=>{
        window.render(pp);
        const pick=(sels)=>{ for(const s of sels){ const el=document.querySelector(s);
          if(el){ const r=el.getBoundingClientRect(); if(r.width>1&&r.height>1) return {top:r.top,left:r.left,right:r.right,bottom:r.bottom}; } } return null; };
        return {
          title: pick(['#title','.title','#htitle','.hero-title','h1','.display']),
          para:  pick(['#para','.para','.paragraph','#lede','.lede','p.hero-para','.hero-copy']),
          hint:  pick(['#hint','.hint','.scroll-hint','#scrollhint','[data-hint]']),
          hdr:   pick(['header','#header','.header','#hdr','.topbar']),
          W:innerWidth, H:innerHeight, sw:document.documentElement.scrollWidth,
        };
      }, p);
      // пари текст-шарів, які НЕ мають перетинатися суттєво (>12% меншої площі = колізія)
      const pairs=[['title','para'],['title','hint'],['para','hint'],['hdr','title'],['hdr','para']];
      for(const [k1,k2] of pairs){
        const r1=rects[k1], r2=rects[k2]; if(!r1||!r2) continue;
        const ov=overlap(r1,r2); const minA=Math.min(area(r1),area(r2));
        const frac=minA>0?ov/minA:0;
        if(frac>0.12){ console.log(`  ❌ @render(${p}) COLLISION ${k1}×${k2}: ${(frac*100).toFixed(0)}% перекриття`); vColl++; }
      }
      // вихід за межі 390px = РЕАЛЬНИЙ горизонтальний overflow (документа), не проміжний scale.
      const realOverflow = rects.sw>rects.W+1;
      if(realOverflow){ console.log(`  ❌ @render(${p}) overflow-X: scrollWidth=${rects.sw} > ${rects.W}`); vColl++; }
      // шар лівіше 0 / правіше 390 РАХУЄМО лише коли є реальний overflow документа.
      // (entry scale-in масштабує кліпнутий шар за краї .hero{overflow:hidden} — це НЕ overflow сторінки.)
      if(realOverflow){
        for(const k of ['title','para','hint','hdr']){ const r=rects[k]; if(!r) continue;
          if(r.left<-2 || r.right>VW+2){ console.log(`  ❌ @render(${p}) ${k} за межами: L=${r.left.toFixed(0)} R=${r.right.toFixed(0)}`); vColl++; } }
      }
    }
    if(vColl===0) console.log(`  🟢 mobile-hero-${v}: 0 collisions`);
    else console.log(`  ⛔ mobile-hero-${v}: ${vColl} collisions`);
    totalColl+=vColl;
  } catch(e){ console.log(`  ⛔ mobile-hero-${v}: EXCEPTION — ${e.message}`); totalColl+=1; }
  finally { await ctx.close(); }
}

await browser.close();
console.log(`\n${'='.repeat(50)}\nCOLLISIONS: ${totalColl===0?'🟢 0 (ALL CLEAN)':'⛔ '+totalColl}`);
process.exit(totalColl?1:0);
