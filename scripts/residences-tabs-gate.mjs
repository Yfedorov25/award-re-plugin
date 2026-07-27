#!/usr/bin/env node
/* residences-tabs-gate.mjs — гейт для конвертованого атома residences-tabs (390×844).
   Закон (з live springs Residences + DC-донора): full-bleed hero з табами FLATS/TOWNHOUSES/
   PENTHOUSES; тап свапає фото (crossfade), title/subtitle/button + 2 стати; fill-підкреслення
   активного табу; + intro-хедер «Residences». Self-contained: springs-шрифти, render(p)+__ATOM_OK__.
   Перевіряє ДАНІ (точні з live), інтерактив (реальний тап), springs-токени, детермінізм. */
import { resolveChromium, MOBILE_UA } from './token-extractor.mjs';
const chromium = await resolveChromium(); if(!chromium){console.error('no chromium');process.exit(2);}
const browser = await chromium.launch();
const BASE='http://localhost:8879/atoms/residences-tabs/variants';
const VW=390, VH=844;
let totalFails=0;

// точні дані з live (звірено з відео 10-35-50 + DC DATA)
const EXPECT=[
  {t:'Flats',      s:'Designer finishings', b:'Search flats',   s1n:'138', s2v:'3.1 m'},
  {t:'Townhouses', s:'Private patios',      b:'Available soon', s1n:'5',   s2v:'4.1 m'},
  {t:'Penthouses', s:'Green terraces',      b:'Available soon', s1n:'7',   s2v:'4.1 m'},
];

async function openPage(url){
  const ctx = await browser.newContext({viewport:{width:VW,height:VH},userAgent:MOBILE_UA,isMobile:true,hasTouch:true,deviceScaleFactor:3});
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

for(const v of ['a']){
  console.log(`\n=== residences-tabs-${v} (RAW, 390×844) ===`);
  const t=mk(); let ctx;
  try{
    const opened=await openPage(`${BASE}/residences-tabs-${v}.html`); ctx=opened.ctx;
    const page=opened.page, errs=opened.errs;

    // хуки
    const hooks=await page.evaluate(()=>({render:typeof window.render==='function',
      lenis:!!(window.lenis||window.Lenis||[...document.scripts].some(s=>/lenis/i.test(s.src)))}));
    t.ok('хук window.render(p)', hooks.render);
    t.ok('Lenis підключено', hooks.lenis);

    // springs-токени: Victor Serif реально застосований на титул
    const fonts=await page.evaluate(()=>{
      const h1=document.querySelector('.intro h1'), title=document.querySelector('#title'), caps=document.querySelector('.tools .caps');
      const ff=el=>getComputedStyle(el).fontFamily.toLowerCase();
      return {h1:ff(h1), title:ff(title), caps:ff(caps),
        cream:getComputedStyle(document.querySelector('#title')).color}; });
    t.ok('титул = Victor Serif (springs-шрифт, не Cormorant)', /victor serif/.test(fonts.h1)&&/victor serif/.test(fonts.title), fonts.h1);
    t.ok('лейбли = TT Commons Pro', /tt commons pro/.test(fonts.caps), fonts.caps);

    // 3 таби + intro
    const struct=await page.evaluate(()=>({
      tabs:document.querySelectorAll('.tab').length,
      slots:document.querySelectorAll('.slot').length,
      intro:!!document.querySelector('.intro h1'),
      introTxt:document.querySelector('.intro h1').textContent.trim() }));
    t.ok('3 таби', struct.tabs===3, `tabs=${struct.tabs}`);
    t.ok('3 фото-слоти (crossfade)', struct.slots===3, `slots=${struct.slots}`);
    t.ok('intro-хедер «Residences»', struct.intro&&/residenc/i.test(struct.introTxt), struct.introTxt);

    // початковий стан = Flats + точні дані
    const read=()=>page.evaluate(()=>({
      title:document.querySelector('#title').textContent.trim(),
      sub:document.querySelector('#subtitle').textContent.trim(),
      btn:document.querySelector('#btn').textContent.trim(),
      s1n:document.querySelector('#s1n').textContent.trim(),
      s2v:document.querySelector('#s2v').textContent.trim(),
      activeSlot:[...document.querySelectorAll('.slot')].findIndex(s=>s.classList.contains('on')),
      activeTab:[...document.querySelectorAll('.tab')].findIndex(x=>x.classList.contains('on')),
      fillOn:[...document.querySelectorAll('.tab')].map(x=>x.classList.contains('on')) }));
    let st=await read();
    t.ok('старт = Flats, дані точні (138 / 3.1 m)', st.title==='Flats'&&st.s1n==='138'&&st.s2v==='3.1 m', `${st.title} ${st.s1n}/${st.s2v}`);
    t.ok('старт: активний слот+таб = 0', st.activeSlot===0&&st.activeTab===0, `slot=${st.activeSlot} tab=${st.activeTab}`);

    // ТАП по кожному табу → свап фото + даних (реальний тач).
    // Таби лежать нижче першого екрана (intro+фото довші за 844) → спершу скролимо їх у в'юпорт,
    // як робив би користувач на телефоні; ПОТІМ реальний тач у видимий центр кнопки.
    for(let i=1;i<3;i++){
      await page.evaluate(n=>document.querySelectorAll('.tab')[n].scrollIntoView({block:'center'}), i);
      await page.waitForTimeout(120);
      const box=await page.evaluate(n=>{const r=document.querySelectorAll('.tab')[n].getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,inView:r.y>=0&&r.y<=844};}, i);
      t.ok(`таб ${i} у в'юпорті після скролу`, box.inView, `y=${box.y.toFixed(0)}`);
      await page.touchscreen.tap(box.x, box.y);
      await page.waitForTimeout(700); // > crossfade+swap
      st=await read();
      const e=EXPECT[i];
      t.ok(`тап таб ${i} (${e.t}): фото+дані свапнулись`,
        st.title===e.t&&st.sub===e.s&&st.btn===e.b&&st.s1n===e.s1n&&st.s2v===e.s2v&&st.activeSlot===i&&st.activeTab===i,
        `${st.title} ${st.s1n}/${st.s2v} slot=${st.activeSlot}`);
    }

    // render(p) мапінг на індекс табу
    const rp=async p=>{ await page.evaluate(pp=>window.render(pp),p); return (await read()).activeTab; };
    const r0=await rp(0), r05=await rp(0.5), r1=await rp(1);
    t.ok('render(p) мапить на індекс (0→0, .5→1, 1→2)', r0===0&&r05===1&&r1===2, `${r0}/${r05}/${r1}`);
    // детермінізм
    const a=await rp(0.5); await rp(1); await rp(0); const b=await rp(0.5);
    t.ok('render детермінований', a===b, `${a} vs ${b}`);

    // 0 overflow-X
    const sw=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,iw:innerWidth}));
    t.ok('нічого не вилазить за 390px', sw.sw<=sw.iw+1, `sw=${sw.sw}`);

    // тільки активний слот видимий (opacity). Спершу переключаємо на 1 (щоб render(0) точно
    // змінив active), потім чекаємо на .6s crossfade-transition перед вимірюванням.
    await page.evaluate(()=>window.render(0.5));   // active→1
    await page.waitForTimeout(120);
    await page.evaluate(()=>window.render(0));      // active→0
    await page.waitForTimeout(750);                 // > .6s crossfade
    const vis=await page.evaluate(()=>[...document.querySelectorAll('.slot')].map(s=>+parseFloat(getComputedStyle(s).opacity).toFixed(2)));
    t.ok('лише активний слот непрозорий (crossfade)', vis[0]>0.9&&vis[1]<0.1&&vis[2]<0.1, vis.join(','));

    t.ok('zero console errors', errs.length===0, errs.slice(0,3).join(' | ')||'0');
    totalFails+=t.fails.length;
    console.log(t.fails.length? `  ⛔ residences-tabs-${v}: ${t.fails.length} FAIL` : `  🟢 residences-tabs-${v}: ALL PASS`);
    await page.close();
  } catch(e){ console.log(`  ⛔ residences-tabs-${v}: EXCEPTION — ${e.message}`); totalFails+=1; }
  finally{ if(ctx) await ctx.close(); }
}

await browser.close();
console.log(`\n${'='.repeat(50)}\nПІДСУМОК residences-tabs: ${totalFails===0?'🟢 ALL PASS':'⛔ '+totalFails+' FAIL'}`);
process.exit(totalFails?1:0);
