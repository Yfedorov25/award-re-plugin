#!/usr/bin/env node
/* interiors-cycle-gate.mjs — гейти на RAW: закон SPEC v1 (M1-M8) + рейка реальною мишею. */
import { resolveChromium } from './token-extractor.mjs';
const URL = process.argv[2] || 'http://localhost:8879/atoms/interiors-cycle/build.html';
const chromium = await resolveChromium(); if(!chromium){console.error('no chromium');process.exit(2);}
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[]; page.on('pageerror',e=>errs.push('P:'+e.message));
page.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text());});
await page.goto(URL,{waitUntil:'networkidle',timeout:30000});
await page.waitForFunction(()=>window.__ATOM_OK__===true,{timeout:8000});
await page.evaluate(()=>document.fonts.ready.then(()=>ScrollTrigger.refresh()));
await page.waitForTimeout(600);
const fails=[]; const ok=(n,c,d)=>{console.log(`  ${c?'✅':'❌'} ${n}${d?' — '+d:''}`); if(!c)fails.push(n);};
// АТОМАРНО: render(p) + читання в ОДНОМУ evaluate — інакше Lenis-тік між викликами
// дає scrub стягнути прогрес назад до scroll-позиції (урок цього гейта)
const probe=(p,fn)=>page.evaluate(({pp,src})=>{window.render(pp);return eval('('+src+')')();},{pp:p,src:fn.toString()});
const at=p=>page.evaluate(pp=>{window.render(pp);},p).then(()=>page.waitForTimeout(150));
const iTop=c=>{const m=c.match(/inset\(([^)]+)\)/);if(!m)return c==='none'?0:NaN;
  const v=m[1].trim().split(/\s+/).map(parseFloat);return v[0];};

const s0=await page.evaluate(()=>({trigs:ScrollTrigger.getAll().length,pins:ScrollTrigger.getAll().filter(t=>t.pin).length,
  badCSS:(()=>{let bad=[];for(const sh of document.styleSheets){let r;try{r=sh.cssRules}catch(e){continue}
    for(const x of r){if(x.style){const t=x.style.transform||x.style.translate||x.style.scale;if(t&&t!=='none')bad.push(x.selectorText);}}}return bad;})()}));
ok('ONE pinned trigger', s0.trigs===1&&s0.pins===1, `trigs=${s0.trigs}`);
ok('transform-ownership CSS', s0.badCSS.length===0, s0.badCSS.join(',')||'чистий');

// M2 вхід (атомарні проби)
const intro=await probe(0.14,()=>({word:getComputedStyle(document.querySelector('#word')).transform,
  copyOp:parseFloat(getComputedStyle(document.querySelector('#introCopy')).opacity),
  sheet:getComputedStyle(document.querySelector('#sheet')).clipPath}));
ok('p.14 інтро: слово осіло',
  /matrix/.test(intro.word)===false||Math.abs(parseFloat((intro.word.match(/matrix\([^)]*,\s*([-\d.]+)\)$/)||[0,0])[1]))<2
  , intro.word.slice(0,40));
ok('p.14 абзац інтро видимий', intro.copyOp>0.9, `op=${intro.copyOp}`);
ok('p.14 sheet ще закритий', iTop(intro.sheet)>95, `top=${iTop(intro.sheet)}`);
// M3 накриття
const sh=await probe(0.24,()=>getComputedStyle(document.querySelector('#sheet')).clipPath);
ok('p.24 sheet межа в русі (wipe-up ОДНИМ шаром)', iTop(sh)>2&&iTop(sh)<98, `top=${iTop(sh).toFixed(1)}`);
// M4 цикл: свап 2 у русі всередині НЕРУХОМОЇ маски
const sw=await probe(0.40,()=>{const pl=document.querySelectorAll('.plate');const m=document.querySelector('#mask').getBoundingClientRect();
  return {p1:getComputedStyle(pl[1]).clipPath, maskX:m.x, maskW:m.width,
    active:[...document.querySelectorAll('.thumb')].findIndex(t=>t.classList.contains('active'))};});
ok('p.40 плита 2 межа посеред маски (скраб)', iTop(sw.p1)>2&&iTop(sw.p1)<98, `top=${iTop(sw.p1).toFixed(1)}`);
ok('p.40 маска НЕРУХОМА зліва 50vw', Math.abs(sw.maskX)<2&&Math.abs(sw.maskW-720)<3, `x=${sw.maskX} w=${sw.maskW}`);
ok('p.40 рейка ще thumb1 (свап не досяг 80%)', sw.active===0, `active=${sw.active}`);
// M5 рейка = f(p)
const states=[];
for(const [p,exp] of [[0.32,0],[0.47,1],[0.61,2],[0.75,3],[0.92,4]]){
  const a=await probe(p,()=>[...document.querySelectorAll('.thumb')].findIndex(t=>t.classList.contains('active')));
  states.push([p,exp,a]);
}
ok('M5 рейка активна = чиста f(p) на 5 hold-ах', states.every(([,e,a])=>e===a), states.map(([p,e,a])=>`p${p}:${a}${a===e?'':'≠'+e}`).join(' '));
// M8 текст панелі постійний
const textConst=await page.evaluate(()=>{window.render(0.35);const t1=document.querySelector('#panelText').textContent;
  window.render(0.9);return t1===document.querySelector('#panelText').textContent;});
ok('M8 текст панелі НЕ змінюється весь цикл', textConst);
// M7 зум hold-а (атомарно)
const scRead=()=>parseFloat((getComputedStyle(document.querySelectorAll('.plate')[0].querySelector('.art')).transform.match(/matrix\(([-\d.]+)/)||[0,1])[1]);
const sc1=await probe(0.34,scRead), sc2=await probe(0.435,scRead);
ok('M7 живий зум на hold-і (росте)', sc2>sc1+0.005, `${sc1.toFixed(3)}→${sc2.toFixed(3)}`);
// реверс детермінізм (вся послідовність в одному evaluate)
const det=await page.evaluate(()=>{
  const sig=()=>[...document.querySelectorAll('.plate,.art,#sheet,#word')].map(e=>{const c=getComputedStyle(e);return c.clipPath+'|'+c.transform;}).join(';');
  window.render(0.55); const a=sig();
  window.render(1); window.render(0); window.render(.8); window.render(.2);
  window.render(0.55); return a===sig(); });
ok('телепорт/реверс детермінований', det);
// M6 клік по мініатюрі реальною мишею = jump тим самим годинником
// клік легітимний ЛИШЕ з cycle-стану (рейка живе всередині #sheet — до накриття вона clip-нута
// і не хіт-тестується; з інтро клікати нема по чому — це закон, не баг)
await page.evaluate(()=>{const st=ScrollTrigger.getAll()[0];
  window.scrollTo(0, st.start + 0.32*(st.end-st.start)); ScrollTrigger.update();});
await page.waitForTimeout(900);
const tb=await page.evaluate(()=>{const r=document.querySelectorAll('.thumb')[3].getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};});
await page.mouse.move(tb.x,tb.y); await page.waitForTimeout(120);
await page.mouse.click(tb.x,tb.y);
let after={prog:0,active:-1};
for(let i=0;i<40;i++){ await page.waitForTimeout(200);
  after=await page.evaluate(()=>{const tl=ScrollTrigger.getAll()[0];
    return {prog:(scrollY-tl.start)/(tl.end-tl.start),
      active:[...document.querySelectorAll('.thumb')].findIndex(t=>t.classList.contains('active'))};});
  if(Math.abs(after.prog-0.745)<0.03 && after.active===3) break; }
ok('M6 клік thumb4: jump у band кімнати 4 (той самий скрол-годинник)', Math.abs(after.prog-0.745)<0.06 && after.active===3, `prog=${after.prog.toFixed(3)} active=${after.active}`);
ok('zero console errors', errs.length===0, errs.slice(0,3).join('|'));
await b.close();
console.log(fails.length?`\n❌ FAIL: ${fails.join(' · ')}`:'\n✅ INTERIORS-CYCLE: ALL GATES PASS');
process.exit(fails.length?1:0);
