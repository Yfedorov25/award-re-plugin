#!/usr/bin/env node
/* design-hero-gate.mjs — гейт для атома design-hero (390×844), springs Design hero.
   Закон (з live d-01/03): full-bleed рендер вежі + великий напівпрозорий серифний «Design» +
   «INSPIRED ARCHITECTURE» + абзац знизу; intro fade-up + on-scroll parallax фото.
   Self-contained: springs-шрифти, реальний рендер (higgsfield), render(p)+__ATOM_OK__. */
import { resolveChromium, MOBILE_UA } from './token-extractor.mjs';
const chromium = await resolveChromium(); if(!chromium){console.error('no chromium');process.exit(2);}
const browser = await chromium.launch();
const BASE='http://localhost:8879/atoms/design-hero/variants';
const VW=390, VH=844;
let totalFails=0;

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

for(const v of ['a']){
  console.log(`\n=== design-hero-${v} (RAW, 390×844) ===`);
  const t=mk(); let ctx;
  try{
    const o=await openPage(`${BASE}/design-hero-${v}.html`); ctx=o.ctx;
    const page=o.page, errs=o.errs;

    const hooks=await page.evaluate(()=>({render:typeof window.render==='function',
      lenis:!!(window.lenis||window.Lenis||[...document.scripts].some(s=>/lenis/i.test(s.src))),
      pageH:document.documentElement.scrollHeight}));
    t.ok('хук window.render(p)', hooks.render);
    t.ok('Lenis підключено', hooks.lenis);
    t.ok('сторінка ≥130vh (parallax є куди)', hooks.pageH>=1.3*VH, `pageH=${hooks.pageH}`);

    // springs-шрифти + вміст
    const L=await page.evaluate(()=>{ window.render(0.4);
      const h1=document.querySelector('.title h1'), lede=document.querySelector('.lede'), caps=document.querySelector('.title .caps');
      const ff=el=>getComputedStyle(el).fontFamily.toLowerCase();
      const photo=document.querySelector('.photo');
      const bg=getComputedStyle(photo).backgroundImage;
      const r=el=>{const b=el.getBoundingClientRect();return {cx:b.x+b.width/2,cy:b.y+b.height/2,w:b.width,h:b.height};};
      return { h1ff:ff(h1), h1txt:h1.textContent.trim(), capsTxt:caps.textContent.trim(),
        ledeTxt:lede.textContent.trim().slice(0,30), bgHasImg:/url\(/.test(bg),
        title:r(document.querySelector('.title')), lede:r(lede), photoH:photo.getBoundingClientRect().height,
        sw:document.documentElement.scrollWidth };
    });
    t.ok('титул «Design» = Victor Serif', /victor serif/.test(L.h1ff)&&/design/i.test(L.h1txt), `${L.h1txt} / ${L.h1ff}`);
    t.ok('«INSPIRED ARCHITECTURE» присутнє', /inspired architecture/i.test(L.capsTxt), L.capsTxt);
    t.ok('абзац про crystal building', /standalone crystal|glassy waterfall|treetops/i.test(await page.evaluate(()=>document.querySelector('.lede').textContent)), L.ledeTxt+'…');
    t.ok('фото-рендер вежі (background-image)', L.bgHasImg, L.bgHasImg?'url present':'НЕМА фото');
    t.ok('фото покриває екран', L.photoH>=VH, `h=${L.photoH.toFixed(0)}`);
    t.ok('титул права-центр', L.title.cx>VW*0.4 && L.title.cy>VH*0.25 && L.title.cy<VH*0.7, `cx=${L.title.cx.toFixed(0)} cy=${L.title.cy.toFixed(0)}`);
    t.ok('абзац знизу', L.lede.cy>VH*0.72, `cy=${L.lede.cy.toFixed(0)}`);
    t.ok('нічого не вилазить за 390px', L.sw<=VW+1, `sw=${L.sw}`);

    // INTRO: title fade-up (render(0) прихований → render(0.4) видимий)
    const introChk=async p=>page.evaluate(pp=>{window.render(pp);
      return {tOp:parseFloat(getComputedStyle(document.querySelector('.title')).opacity),
              lOp:parseFloat(getComputedStyle(document.querySelector('.lede')).opacity)};},p);
    const i0=await introChk(0.02), i40=await introChk(0.4);
    t.ok('INTRO: титул+абзац прихований@старт → видимий@0.4', i0.tOp<0.4 && i40.tOp>0.9 && i40.lOp>0.85, `t ${i0.tOp.toFixed(2)}→${i40.tOp.toFixed(2)}`);

    // PARALLAX: фото рухається render(0.4)→render(1)
    const ph=async p=>page.evaluate(pp=>{window.render(pp);
      return getComputedStyle(document.querySelector('.photo')).transform;},p);
    const p40=await ph(0.4), p100=await ph(1);
    t.ok('on-scroll parallax: фото рухається @0.4→@1', p40!==p100, `${p40!==p100?'рух':'СТАТИКА'}`);

    // детермінізм
    const sig=p=>page.evaluate(pp=>{window.render(pp);
      return [...document.querySelectorAll('.photo,.title,.lede')].map(e=>{const c=getComputedStyle(e);return c.transform+'|'+c.opacity;}).join(';');},p);
    const a=await sig(0.5); await sig(1); await sig(0); const b=await sig(0.5);
    t.ok('render детермінований', a===b, a===b?'ok':'DRIFT');
    t.ok('render clamp 0..1', await page.evaluate(()=>{window.render(-1);window.render(2);window.render(.5);return true;}));

    t.ok('zero console errors', errs.length===0, errs.slice(0,3).join(' | ')||'0');
    totalFails+=t.fails.length;
    console.log(t.fails.length?`  ⛔ design-hero-${v}: ${t.fails.length} FAIL`:`  🟢 design-hero-${v}: ALL PASS`);
    await page.close();
  } catch(e){ console.log(`  ⛔ design-hero-${v}: EXCEPTION — ${e.message}`); totalFails+=1; }
  finally{ if(ctx) await ctx.close(); }
}

await browser.close();
console.log(`\n${'='.repeat(50)}\nПІДСУМОК design-hero: ${totalFails===0?'🟢 ALL PASS':'⛔ '+totalFails+' FAIL'}`);
process.exit(totalFails?1:0);
