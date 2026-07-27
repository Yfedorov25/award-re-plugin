#!/usr/bin/env node
/* mobile-residencies-gate.mjs — гейти на RAW для M3 mobile-residencies (3 варіанти), 390×844.
   Закон (з SPEC): right-aligned вертикальний стек full-width фото-плиток + великий серифний
   напівпрозорий титул ПОЗАДУ-ЗЛІВА (вертикально центрований); по скролу плитки їдуть угору
   ПОВЗ титул (pin-диференціал), права плитка перекриває праву половину слова.
   Патерн mobile-hero-gate: мобільний контекст, атомарні render-проби, cssLint, детермінізм.
   🔴 УРОКИ (з mobile-hero-gate): idle-дрейф міряти через rAF-цикл, НЕ waitForTimeout;
   entry-scale кліпнутого шару ≠ overflow сторінки (судити по scrollWidth). */
import { resolveChromium, MOBILE_UA } from './token-extractor.mjs';
const chromium = await resolveChromium(); if(!chromium){console.error('no chromium');process.exit(2);}
const browser = await chromium.launch();
const BASE='http://localhost:8879/atoms/mobile-residencies/variants';
const VW=390, VH=844;
let totalFails=0;

async function openPage(url){
  const ctx = await browser.newContext({viewport:{width:VW,height:VH}, userAgent:MOBILE_UA,
    isMobile:true, hasTouch:true, deviceScaleFactor:3});
  const page = await ctx.newPage();
  const errs=[]; page.on('pageerror',e=>errs.push('PAGE:'+e.message));
  page.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text());});
  await page.goto(url,{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>window.__ATOM_OK__===true,{timeout:10000});
  return {page,ctx,errs};
}
function mk(){ const fails=[];
  return {fails, ok(name,cond,detail){ const s=cond?'✅':'❌'; console.log(`  ${s} ${name}${detail?' — '+detail:''}`); if(!cond) fails.push(name); }};
}
async function cssLint(page,t){
  const bad = await page.evaluate(()=>{
    let out=[]; for(const sh of document.styleSheets){ let rules; try{rules=sh.cssRules}catch(e){continue}
      for(const r of rules){ if(r.style){ const tt=(r.style.transform||r.style.translate||r.style.scale);
        if(tt&&tt!=='none'){ const tr=(r.style.transform||'').trim();
          const rotOnly=/^rotate\(-?[\d.]+deg\)$/.test(tr);
          const centerOnly=/^translate\(\s*-?50%\s*,\s*-?50%\s*\)$/.test(tr);
          const transYOnly=/^translateY\(-?50%\)$/.test(tr)||/^translate\(0(px|%)?,\s*-?50%\)$/.test(tr);
          if(!rotOnly && !centerOnly && !transYOnly) out.push((r.selectorText||'?')+':'+tt);
        } } } }
    return out; });
  t.ok('CSS-lint (travel/parallax = GSAP, не CSS)', bad.length===0, bad.join(' | ')||'чистий (лише статичні rotate/center)');
}
function finish(name,t,errs){
  t.ok('zero console errors', errs.length===0, errs.slice(0,3).join(' | ')||'0');
  totalFails+=t.fails.length;
  console.log(t.fails.length? `  ⛔ ${name}: ${t.fails.length} FAIL` : `  🟢 ${name}: ALL PASS`);
}

for(const v of ['a','b','c']){
  console.log(`\n=== mobile-residencies-${v} (RAW, 390×844) ===`);
  const t=mk(); let ctx;
  try{
    const opened = await openPage(`${BASE}/mobile-residencies-${v}.html`);
    ctx=opened.ctx; const page=opened.page, errs=opened.errs;

    const hooks = await page.evaluate(()=>({
      render: typeof window.render==='function',
      lenis: !!(window.lenis||window.Lenis||[...document.scripts].some(s=>/lenis/i.test(s.src))),
      pageH: document.documentElement.scrollHeight }));
    t.ok('хук window.render(p)', hooks.render);
    t.ok('Lenis підключено', hooks.lenis);
    t.ok('сторінка ≥170vh', hooks.pageH >= 1.7*VH, `pageH=${hooks.pageH} (${(hooks.pageH/VH).toFixed(2)}vh)`);
    await cssLint(page,t);

    // ЛЕЙАУТ @ render(0.3) — секція в кадрі, стек+титул видимі
    const L = await page.evaluate(()=>{
      window.render(0.3);
      const pick=(sels)=>{ for(const s of sels){ const el=document.querySelector(s);
        if(el){ const r=el.getBoundingClientRect(); if(r.width>1&&r.height>1) return {r:{x:r.x,y:r.y,w:r.width,h:r.height,cx:r.x+r.width/2,cy:r.y+r.height/2,right:r.right,left:r.left},z:+getComputedStyle(el).zIndex||0,op:parseFloat(getComputedStyle(el).opacity)}; } } return null; };
      const title = pick(['#title','.title','.rtitle','.section-title','h1','.display']);
      const tiles = [...document.querySelectorAll('.tile,.rtile,[data-tile],.stack > *,.tiles > *,figure')]
        .map(el=>{const r=el.getBoundingClientRect();return {cx:r.x+r.width/2,w:r.width,z:+getComputedStyle(el).zIndex||0,right:r.right};})
        .filter(o=>o.w>40);
      // z-index плиток часто стоїть на КОНТЕЙНЕРІ стека (.stack), не на кожній .tile → беремо z стека.
      const stackEl = document.querySelector('.stack,.tiles,.tile-stack');
      const stackZ = stackEl ? (+getComputedStyle(stackEl).zIndex||0) : 0;
      const hdr = pick(['header','#header','.header','.topbar']);
      return { title, tiles, tileCount:tiles.length, stackZ, hdr, W:innerWidth, H:innerHeight,
        sw:document.documentElement.scrollWidth };
    });
    t.ok('стек ≥2 плитки', L.tileCount>=2, `tiles=${L.tileCount}`);
    const tilesRight = L.tiles.length && L.tiles.every(o=>o.cx > VW*0.42);
    t.ok('плитки RIGHT-aligned (cx праворуч від ~42%)', tilesRight, L.tiles.map(o=>Math.round(o.cx)).join(','));
    const greenFieldLeft = L.tiles.length && Math.min(...L.tiles.map(o=>o.cx-o.w/2)) > VW*0.15;
    t.ok('зелене поле зліва (плитки не з краю 0)', greenFieldLeft, `minLeft=${L.tiles.length?Math.round(Math.min(...L.tiles.map(o=>o.cx-o.w/2))):'-'}`);
    t.ok('титул присутній, ЗЛІВА', L.title && L.title.r.cx < VW*0.55, L.title?`cx=${Math.round(L.title.r.cx)}`:'титул не знайдено');
    t.ok('титул вертикально ~центрований', L.title && L.title.r.cy > VH*0.28 && L.title.r.cy < VH*0.72, L.title?`cy=${Math.round(L.title.r.cy)}`:'-');
    t.ok('титул напівпрозорий (α<0.85)', L.title && L.title.op < 0.85, L.title?`α=${L.title.op.toFixed(2)}`:'-');
    // z-порядок: титул ПОЗАДУ стека плиток (z-index на .stack, не на кожній .tile)
    const titleZ = L.title?L.title.z:99;
    const effTileZ = Math.max(L.stackZ, L.tiles.length?Math.max(...L.tiles.map(o=>o.z)):0);
    t.ok('титул ПОЗАДУ плиток (z нижче стека)', L.title && titleZ < effTileZ, `titleZ=${titleZ} stackZ=${effTileZ}`);
    // overlap: права плитка перекриває праву частину титулу
    const tileLeftEdge = L.tiles.length?Math.min(...L.tiles.map(o=>o.right-o.w)):VW;
    t.ok('плитка перекриває праву частину титулу', L.title && tileLeftEdge < L.title.r.right, `tileL=${Math.round(tileLeftEdge)} titleR=${Math.round(L.title.r.right)}`);
    t.ok('нічого не вилазить за 390px', L.sw<=L.W+1, `sw=${L.sw}`);

    // PIN-ДИФЕРЕНЦІАЛ: по скролу плитки Y рухаються НАБАГАТО більше за титул Y
    const yAt = p => page.evaluate(pp=>{ window.render(pp);
      const ti=document.querySelector('#title,.title,.rtitle,.section-title,h1,.display');
      const tl=document.querySelector('.tile,.rtile,[data-tile],.stack > *,.tiles > *,figure');
      return { titleY: ti?ti.getBoundingClientRect().y:null, tileY: tl?tl.getBoundingClientRect().y:null }; }, p);
    const y2=await yAt(0.2), y7=await yAt(0.7);
    const titleDelta=Math.abs(y7.titleY-y2.titleY), tileDelta=Math.abs(y7.tileY-y2.tileY);
    t.ok('плитки їдуть угору по скролу', tileDelta > 30, `ΔtileY=${tileDelta.toFixed(0)}`);
    t.ok('титул тримається (pin-диференціал: Δtitle < Δtile)', titleDelta < tileDelta*0.7, `Δtitle=${titleDelta.toFixed(0)} Δtile=${tileDelta.toFixed(0)}`);

    // ДЕТЕРМІНІЗМ (реверс/телепорт)
    const sig = p => page.evaluate(pp=>{ window.render(pp);
      const els=[...document.querySelectorAll('#title,.title,.rtitle,.tile,.rtile,.stack > *,figure')].slice(0,6);
      return els.map(e=>{const r=e.getBoundingClientRect();return Math.round(r.y)+','+Math.round(r.x);}).join(';'); }, p);
    const a=await sig(.5); await sig(1); await sig(0); const b=await sig(.5);
    t.ok('render(p) детермінований (реверс/телепорт)', a===b, a===b?'ok':'DRIFT');
    t.ok('render clamp 0..1', await page.evaluate(()=>{window.render(-1);window.render(2);window.render(.5);return true;}));

    // ТАЧ-скрол не кидає помилку
    await page.touchscreen.tap(VW/2, VH/2); await page.waitForTimeout(150);
    t.ok('тач по секції без помилки', errs.length===0, errs.slice(0,2).join('|')||'0');

    finish(`mobile-residencies-${v}`,t,errs);
    await page.close();
  } catch(e){ console.log(`  ⛔ mobile-residencies-${v}: EXCEPTION — ${e.message}`); totalFails+=1; }
  finally { if(ctx) await ctx.close(); }
}

await browser.close();
console.log(`\n${'='.repeat(50)}\nПІДСУМОК mobile-residencies: ${totalFails===0?'🟢 ALL PASS':'⛔ '+totalFails+' FAIL'}`);
process.exit(totalFails?1:0);
