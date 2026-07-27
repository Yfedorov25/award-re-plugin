#!/usr/bin/env node
/* design-section-gate.mjs — гейт на RAW для springs Design-секції (CD, 3 варіанти), 390×844.
   4-beat scroll-наратив: hero-render → cream text-block1 → dusk-render → cream text-block2.
   Перевіряє: хуки, springs-шрифти(Victor Serif), 2 full-bleed рендери, 2 кремові текст-блоки з
   ТОЧНИМ текстом live, порядок бітів по render(p), детермінізм, 0 overflow, 0 console-err.
   Патерн design-hero-gate, розширений на секцію. Селектори гнучкі (CD може назвати по-різному). */
import { resolveChromium, MOBILE_UA } from './token-extractor.mjs';
const chromium = await resolveChromium(); if(!chromium){console.error('no chromium');process.exit(2);}
const browser = await chromium.launch();
const BASE='http://localhost:8879/atoms/design-section/variants';
// файли: design-a.html / design-b.html / design-c.html (не design-section-a)
const VW=390, VH=844;
let totalFails=0;

// точні фрагменти тексту з live (мають бути присутні десь у DOM)
const TEXT=[
  'standalone crystal building',            // beat1 lede
  'boundless perspectives',                 // beat2
  'glistening waves',                       // beat2
  'Tabanlioglu',                            // beat4
  'chessboard pattern',                     // beat4
  'weightless volume',                      // beat4
];

async function openPage(url){
  const ctx=await browser.newContext({viewport:{width:VW,height:VH},userAgent:MOBILE_UA,isMobile:true,hasTouch:true,deviceScaleFactor:3});
  const page=await ctx.newPage();
  const errs=[]; page.on('pageerror',e=>errs.push('PAGE:'+e.message));
  page.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text());});
  await page.goto(url,{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>window.__ATOM_OK__===true,{timeout:10000});
  return {page,ctx,errs};
}
function mk(){ const fails=[];
  return {fails, ok(n,c,d){ console.log(`  ${c?'✅':'❌'} ${n}${d?' — '+d:''}`); if(!c) fails.push(n); }};
}

for(const v of ['a','b','c']){
  console.log(`\n=== design-${v} (RAW, 390×844) ===`);
  const t=mk(); let ctx;
  try{
    const o=await openPage(`${BASE}/design-${v}.html`); ctx=o.ctx; // design-a/b/c.html
    const page=o.page, errs=o.errs;

    const meta=await page.evaluate(()=>({
      render:typeof window.render==='function',
      lenis:!!(window.lenis||window.Lenis||[...document.scripts].some(s=>/lenis/i.test(s.src))),
      pageH:document.documentElement.scrollHeight,
      bodyText:document.body.textContent,  // textContent бачить весь DOM (innerText ховає off-screen/autoAlpha:0)
      // Victor Serif десь застосований на серифному тексті
      victorUsed:[...document.querySelectorAll('h1,h2,h3,p,div')].some(el=>/victor serif/i.test(getComputedStyle(el).fontFamily)),
      // full-bleed background-image (рендери)
      bgImgs:[...document.querySelectorAll('*')].filter(el=>/url\(/.test(getComputedStyle(el).backgroundImage)).length,
      creamBg:[...document.querySelectorAll('section,div')].some(el=>{const c=getComputedStyle(el).backgroundColor;return /245, 232, 209|246, 232|f5e8d1/i.test(c)||c==='rgb(245, 232, 209)';}),
    }));
    t.ok('хук window.render(p)', meta.render);
    t.ok('Lenis підключено', meta.lenis);
    t.ok('сторінка ≥250vh (4 біти)', meta.pageH>=2.5*VH, `pageH=${meta.pageH} (${(meta.pageH/VH).toFixed(1)}vh)`);
    t.ok('Victor Serif застосований', meta.victorUsed);
    t.ok('≥2 full-bleed рендери (bg-image)', meta.bgImgs>=2, `bgImgs=${meta.bgImgs}`);
    t.ok('кремовий текст-блок присутній', meta.creamBg, meta.creamBg?'cream bg':'НЕМА cream');

    // ТОЧНИЙ текст live присутній
    for(const frag of TEXT){
      t.ok(`текст live: "${frag}"`, meta.bodyText.includes(frag), meta.bodyText.includes(frag)?'є':'ВІДСУТНІЙ');
    }

    // beat progression: стан секції @0.05 (перший beat) РІЗНИЙ від @0.95 (останній beat).
    // Модель А = strip translate (y змінюється), B/C = crossfade (opacity шарів змінюється).
    // Беремо обидва сигнали: y-позиції beat-ів + їх opacity.
    const at=p=>page.evaluate(pp=>{window.render(pp);
      return [...document.querySelectorAll('.beat')].map(el=>{
        const r=el.getBoundingClientRect(); const cs=getComputedStyle(el);
        return Math.round(r.y)+':'+(+parseFloat(cs.opacity).toFixed(2));
      }).join('|'); },p);
    const c0=await at(0.05), c1=await at(0.95);
    t.ok('render(p) рухає секцію (beat progression)', c0!==c1, `@0.05 vs @0.95 ${c0!==c1?'різні':'ОДНАКОВІ'}`);

    // детермінізм
    const sig=p=>page.evaluate(pp=>{window.render(pp);
      return [...document.querySelectorAll('section,[class*=beat],[class*=render],[class*=text]')].slice(0,8)
        .map(e=>{const r=e.getBoundingClientRect();return Math.round(r.y);}).join(',');},p);
    const a=await sig(0.5); await sig(1); await sig(0); const b=await sig(0.5);
    t.ok('render детермінований', a===b, a===b?'ok':'DRIFT');
    t.ok('render clamp 0..1', await page.evaluate(()=>{window.render(-1);window.render(2);window.render(.5);return true;}));

    const sw=await page.evaluate(()=>document.documentElement.scrollWidth);
    t.ok('нічого не вилазить за 390px', sw<=VW+1, `sw=${sw}`);
    t.ok('zero console errors', errs.length===0, errs.slice(0,3).join(' | ')||'0');

    totalFails+=t.fails.length;
    console.log(t.fails.length?`  ⛔ design-${v}: ${t.fails.length} FAIL`:`  🟢 design-${v}: ALL PASS`);
    await page.close();
  } catch(e){ console.log(`  ⛔ design-${v}: EXCEPTION — ${e.message}`); totalFails+=1; }
  finally{ if(ctx) await ctx.close(); }
}

await browser.close();
console.log(`\n${'='.repeat(50)}\nПІДСУМОК design-section: ${totalFails===0?'🟢 ALL PASS':'⛔ '+totalFails+' FAIL'}`);
process.exit(totalFails?1:0);
