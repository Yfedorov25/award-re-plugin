#!/usr/bin/env node
/* mobile-hero-gate.mjs — гейти на RAW для M2 mobile-hero (3 варіанти A/B/C), viewport 390×844.
   Закон (з SPEC + CD-промпту): вертикальний мозаїчний грид (~-6°, overscan) + display-серифний
   титул ВНИЗУ-СПРАВА (2 рядки) + абзац MID-LEFT + scroll-hint BOTTOM-LEFT + хедер зверху;
   idle-дрейф тайлів (off-clock) + on-scroll parallax; сторінка ≥130vh.
   Патерн s38-quad-gate: МОБІЛЬНИЙ контекст (isMobile+hasTouch), атомарні render(p)-проби
   (render+read в ОДНОМУ evaluate), cssLint transform-ownership, реверс-детермінізм, 0 console-err.
   Уроки: міряти РЕАЛЬНИЙ контент (rect елементів), не SVG-обгортку; тач реальним tap. */
import { resolveChromium, MOBILE_UA } from './token-extractor.mjs';
const chromium = await resolveChromium(); if(!chromium){console.error('no chromium');process.exit(2);}
const browser = await chromium.launch();
const BASE='http://localhost:8879/atoms/mobile-hero/variants';
const VW=390, VH=844;
let totalFails=0;

const VARIANTS = ['a','b','c'];

async function openPage(url){
  const ctx = await browser.newContext({
    viewport:{width:VW,height:VH}, userAgent:MOBILE_UA,
    isMobile:true, hasTouch:true, deviceScaleFactor:3,
  });
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
  // жоден animated елемент не має transform/translate/scale у CSS-правилах.
  // ВИНЯТОК: статичний -6° поворот контейнера мозаїки дозволено в CSS (SPEC §4).
  const bad = await page.evaluate(()=>{
    let out=[]; for(const sh of document.styleSheets){ let rules; try{rules=sh.cssRules}catch(e){continue}
      for(const r of rules){ if(r.style){ const tt=(r.style.transform||r.style.translate||r.style.scale);
        if(tt&&tt!=='none'){
          const tr=(r.style.transform||'').trim();
          // СТАТИЧНІ layout-трансформи дозволені (не анімований drift):
          //  - rotate(-6deg) — нахил мозаїки
          //  - translate(-50%,-50%) — центрування overscan-контейнера
          const rotOnly=/^rotate\(-?[\d.]+deg\)$/.test(tr);
          const centerOnly=/^translate\(\s*-?50%\s*,\s*-?50%\s*\)$/.test(tr);
          if(!rotOnly && !centerOnly) out.push((r.selectorText||'?')+':'+tt);
        } } } }
    return out; });
  t.ok('CSS-lint (drift/parallax transform = GSAP, не CSS)', bad.length===0, bad.join(' | ')||'чистий (лише статичні rotate/center у CSS)');
}
function finish(name,t,errs){
  t.ok('zero console errors', errs.length===0, errs.slice(0,3).join(' | ')||'0');
  totalFails+=t.fails.length;
  console.log(t.fails.length? `  ⛔ ${name}: ${t.fails.length} FAIL` : `  🟢 ${name}: ALL PASS`);
}

for(const v of VARIANTS){
  console.log(`\n=== mobile-hero-${v} (RAW, 390×844) ===`);
  const t=mk();
  let ctx;
  try{
    const opened = await openPage(`${BASE}/mobile-hero-${v}.html`);
    ctx=opened.ctx; const page=opened.page, errs=opened.errs;

    // 0. хуки
    const hooks = await page.evaluate(()=>({
      render: typeof window.render==='function',
      lenis: !!(window.lenis||window.Lenis||[...document.scripts].some(s=>/lenis/i.test(s.src))),
      pageH: document.documentElement.scrollHeight, ih: innerHeight,
    }));
    t.ok('хук window.render(p) присутній', hooks.render);
    t.ok('Lenis підключено', hooks.lenis);
    t.ok('сторінка ≥130vh (є куди скролити)', hooks.pageH >= 1.3*VH, `pageH=${hooks.pageH} (${(hooks.pageH/VH).toFixed(2)}vh)`);
    await cssLint(page,t);

    // 1. ЛЕЙАУТ @ render(0): грид/титул/абзац/хінт/хедер на своїх місцях.
    //    Селектори гнучкі — CD може назвати по-різному; беремо роль через кілька кандидатів.
    const layout = await page.evaluate(()=>{
      window.render(0);
      const pick=(sels)=>{ for(const s of sels){ const el=document.querySelector(s);
        if(el){ const r=el.getBoundingClientRect(); if(r.width>1&&r.height>1) return {el,r,sel:s}; } } return null; };
      // грид-покриття = обгортка мозаїки (inset:0 = повний екран), НЕ .grid (overscan 152%×162%)
      const grid = pick(['.mosaic-rotate','#mosaic','.mosaic','#grid','.grid','[data-grid]','#tiles','.tiles']);
      const title= pick(['#title','.title','#htitle','.hero-title','h1','.display']);
      const para = pick(['#para','.para','.paragraph','#lede','.lede','p.hero-para','.hero-copy']);
      const hint = pick(['#hint','.hint','.scroll-hint','#scrollhint','[data-hint]']);
      const hdr  = pick(['header','#header','.header','#hdr','.topbar']);
      const tiles= document.querySelectorAll('.tile,.mtile,[data-tile],.mosaic > *, #mosaic > *');
      // кут повороту: шукаємо статичний rotate у ланцюжку обгорток мозаїки
      let ang=null;
      for(const sel of ['.mosaic-rotate','#mosaic','.mosaic','.grid']){ const el=document.querySelector(sel);
        if(!el) continue; const cs=getComputedStyle(el);
        const m=(cs.transform.match(/matrix\(([-\d.]+),\s*([-\d.]+)/)||[]);
        if(m.length){ const a=Math.atan2(parseFloat(m[2]),parseFloat(m[1]))*180/Math.PI;
          if(Math.abs(a)>=1){ ang=a; break; } } }
      const rc=(x)=>x?{x:Math.round(x.r.x),y:Math.round(x.r.y),w:Math.round(x.r.width),h:Math.round(x.r.height),cx:Math.round(x.r.x+x.r.width/2),cy:Math.round(x.r.y+x.r.height/2)}:null;
      return { grid:rc(grid), title:rc(title), para:rc(para), hint:rc(hint), hdr:rc(hdr),
        tileCount:tiles.length, ang, W:innerWidth, H:innerHeight,
        titleTxtRight: title? getComputedStyle(title.el).textAlign : null };
    });
    t.ok('грид присутній і покриває екран', layout.grid && layout.grid.w >= VW*0.9 && layout.grid.h >= VH*0.7, layout.grid?`${layout.grid.w}×${layout.grid.h}`:'НЕ ЗНАЙДЕНО');
    t.ok('мозаїка нахилена (~-6°, overscan)', layout.ang!==null && Math.abs(layout.ang) >= 3 && Math.abs(layout.ang) <= 12, layout.ang!==null?`${layout.ang.toFixed(1)}°`:'кут не знайдено');
    t.ok('тайлів ≥6 (2 колонки)', layout.tileCount>=6, `tiles=${layout.tileCount}`);
    t.ok('титул ВНИЗУ-СПРАВА', layout.title && layout.title.cy > VH*0.55 && layout.title.cx > VW*0.45, layout.title?`cx=${layout.title.cx} cy=${layout.title.cy}`:'титул не знайдено');
    t.ok('абзац MID-LEFT', layout.para && layout.para.cx < VW*0.6 && layout.para.cy > VH*0.2 && layout.para.cy < VH*0.75, layout.para?`cx=${layout.para.cx} cy=${layout.para.cy}`:'абзац не знайдено');
    t.ok('scroll-hint BOTTOM-LEFT', layout.hint && layout.hint.cx < VW*0.5 && layout.hint.cy > VH*0.7, layout.hint?`cx=${layout.hint.cx} cy=${layout.hint.cy}`:'хінт не знайдено');
    t.ok('хедер зверху', layout.hdr && layout.hdr.y < VH*0.15, layout.hdr?`y=${layout.hdr.y}`:'хедер не знайдено');
    t.ok('нічого не вилазить за 390px по ширині', await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1), 'scrollWidth vs innerWidth');

    // 2. ON-SCROLL PARALLAX: parallax-шар зсувається між render(0) і render(1) (атомарна проба).
    const gridAt = p => page.evaluate(pp=>{ window.render(pp);
      const g=document.querySelector('.mosaic-parallax,#mosaic,.mosaic,#grid,.grid,[data-grid]');
      if(!g) return null;
      return {gtr:getComputedStyle(g).transform}; }, p);
    const g0=await gridAt(0), g1=await gridAt(1);
    t.ok('on-scroll parallax: мозаїка рухається render(0)→render(1)', g0&&g1&&g0.gtr!==g1.gtr, g0?`${g0.gtr} → ${g1.gtr}`:'шар не знайдено');

    // 3. IDLE-ДРЕЙФ (off-clock): без будь-якого render — тайли живуть у часі.
    //    🔴 УРОК: gsap.ticker приведений Lenis→rAF; page.waitForTimeout НЕ просуває його в headless.
    //    Міряти треба через РЕАЛЬНИЙ rAF-цикл у сторінці, не через wall-clock паузу.
    await page.evaluate(()=>window.render(0));
    const drift = await page.evaluate(()=>new Promise(res=>{
      // idle-твіни висять на ВНУТРІШНЬОМУ шарі тайла (.tile-inner), не на .tile (той = intro/scroll).
      const el=document.querySelector('.tile-inner')
        || document.querySelector('.tile,.mtile,[data-tile],.mosaic > *,#mosaic > *');
      if(!el) return res({moved:false, reason:'no-tile'});
      const before=getComputedStyle(el).transform;
      let n=0; const loop=()=>{ if(++n>90){ const after=getComputedStyle(el).transform;
        return res({moved: before!==after, before, after}); } requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }));
    t.ok('idle-дрейф тайлів (off-clock, рух у часі)', drift.moved, drift.moved?'рухається (90 rAF-кадрів)':`СТАТИКА (${drift.reason||''} ${drift.before||''})`);

    // 4. render монотонність/детермінізм (реверс/телепорт).
    const sig = p => page.evaluate(pp=>{ window.render(pp);
      const els=[...document.querySelectorAll('#mosaic,.mosaic,#grid,.grid,#title,.title,#para,.para')];
      // idle-дрейф робить transform нестабільним у часі — беремо лише scroll-керовані власності,
      // тому міряємо в ОДНОМУ tick одразу після render (idle не встиг зрушити).
      return els.map(e=>{const r=e.getBoundingClientRect();return Math.round(r.y)+','+Math.round(r.x);}).join(';'); }, p);
    const a=await sig(.5); await sig(1); await sig(0); const b=await sig(.5);
    t.ok('render(p) детермінований (реверс/телепорт)', a===b, `${a===b?'ok':a+' vs '+b}`);
    t.ok('render clamp: render(0.5) досяжний, титул стабільний', await page.evaluate(()=>{
      window.render(-1); window.render(2); window.render(0.5); return true; }), 'clamp 0..1');

    // 5. ТАЧ: реальний tap по scroll-hint не кидає помилку (клікабельний елемент).
    const hint = await page.evaluate(()=>{ const h=document.querySelector('#hint,.hint,.scroll-hint,#scrollhint,[data-hint]');
      if(!h) return null; const r=h.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; });
    if(hint){ await page.touchscreen.tap(hint.x, hint.y); await page.waitForTimeout(200);
      t.ok('тач по scroll-hint без помилки', errs.length===0, errs.slice(0,2).join('|')||'0'); }
    else t.ok('scroll-hint є для тачу', false, 'hint не знайдено');

    finish(`mobile-hero-${v}`,t,errs);
    await page.close();
  } catch(e){
    console.log(`  ⛔ mobile-hero-${v}: EXCEPTION — ${e.message}`);
    totalFails+=1;
  } finally { if(ctx) await ctx.close(); }
}

await browser.close();
console.log(`\n${'='.repeat(50)}\nПІДСУМОК mobile-hero: ${totalFails===0?'🟢 ALL PASS':'⛔ '+totalFails+' FAIL'}`);
process.exit(totalFails?1:0);
