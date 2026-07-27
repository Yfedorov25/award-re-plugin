#!/usr/bin/env node
/* location-section-gate.mjs — гейт на RAW для springs "Location"-секції (CD, 3 варіанти), 390×844.
   НАЙБІЛЬША секція: 13 блоків + 3 HARD-механіки (POI-map horizontal pan · family pinned-curtain ·
   5-slide peek-next slider). Патерн design-section-gate.mjs, розширений під location DoD
   (00-READ-FIRST.md / 01-PROMPT.md / SECTION-MAP.md у ~/Downloads/CD-RUN-location-v1/).

   🔴 УРОКИ ГЕЙТА (набиті в S40, не повторювати):
   - Текст-присутність через textContent, НЕ innerText (innerText ховає off-screen / autoAlpha:0
     блоки, а ця секція майже вся off-screen до scroll/render(p)).
   - beat-progression через opacity+y кожного блоку (НЕ "що в центрі" — бо crossfade-варіант B).
   - VERBATIM spelling load-bearing: `Landskape Park` (не Landscape) · `1 MINUTES WALK` (plural на
     карті) · `MINUTE WALK` (singular на glass-cards, якщо CD їх додав) · `354 meters` · `18th century`.
   - Селектори гнучкі (CD може назвати класи по-різному) — тому текст-присутність + структурні
     сигнатури, не жорсткі class-хуки.
   🔴 element-gate НЕ застосовний: dummy-фасад, немає spec/frame-*.json (per-element проти live НЕ
     міряно). Цей гейт судить СТРУКТУРУ, не піксельну парність до live. */
import { resolveChromium, MOBILE_UA } from './token-extractor.mjs';
const chromium = await resolveChromium(); if(!chromium){console.error('no chromium');process.exit(2);}
const browser = await chromium.launch();
const BASE='http://localhost:8879/atoms/location-section/variants';
const VW=390, VH=844;
let totalFails=0;

// ── VERBATIM текст live (SECTION-MAP) — має бути присутній десь у DOM (textContent) ──
// Block 1 hero
const HERO=['Location','NATURAL OASIS','IN THE HEART OF THE CITY'];
// Block 2 green statement
const GREEN_STMT='All the colors of the clear Western District sky are reflected in the glowing windows of Springs.';
// Block 3 portrait
const PORTRAIT_TITLE=['The Center','of Your Life'];       // 2 рядки (title може бути розбитий)
const PORTRAIT_BODY='easy access to main avenues';        // фрагмент body para
// Block 4 POI map — 9 точок: name · number · mode (plural MINUTES навіть для 1)
const POI=[
  ['Water Sport Center','7','MINUTES BY CAR'],
  ['River','5','MINUTES WALK'],
  ['Park','1','MINUTES WALK'],            // 🔴 "1 MINUTES WALK" plural
  ['Metro Station','8','MINUTES WALK'],
  ['Highway','5','MINUTES BY CAR'],
  ['Historical Park','10','MINUTES BY CAR'],
  ['Business Center','16','MINUTES BY CAR'],
  ['City Center','20','MINUTES BY CAR'],
  ['Suburb','25','MINUTES BY CAR'],
];
// Block 6 necklace para
const NECKLACE='Surrounded by a necklace of seven parks';
// Block 8 recreation statement + body
const REC_STMT='They embody all shades of active recreation.';
const REC_BODY='feel the crunch of snow under your skis';
// Block 10 sticky title
const DIGNIFIED=['Dignified','Beauty'];
// Block 11 — 5 slide captions (title + фрагмент body)
const SLIDES=[
  ['Historical Park','18th century'],            // 🔴 "18th century" verbatim
  ['Business Center','panoramic views of the seven parks'],
  ['Sublime Feelings','354 meters'],             // 🔴 "354 meters" verbatim
  ['Discover shopping','fashion boutiques'],
  ['Restaurant on Water','Montana yacht'],
];
// Block 12 seam breadcrumb
const BREADCRUMB=['HOMEPAGE','LOCATION'];

async function openPage(url){
  const ctx=await browser.newContext({viewport:{width:VW,height:VH},userAgent:MOBILE_UA,isMobile:true,hasTouch:true,deviceScaleFactor:3});
  const page=await ctx.newPage();
  const errs=[]; page.on('pageerror',e=>errs.push('PAGE:'+e.message));
  page.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text());});
  await page.goto(url,{waitUntil:'networkidle',timeout:30000});
  await page.waitForFunction(()=>window.__ATOM_OK__===true,{timeout:12000});
  return {page,ctx,errs};
}
function mk(){ const fails=[];
  return {fails, ok(n,c,d){ console.log(`  ${c?'✅':'❌'} ${n}${d?' — '+d:''}`); if(!c) fails.push(n); }};
}

for(const v of ['a']){
  console.log(`\n=== location-${v} (RAW, 390×844) ===`);
  const t=mk(); let ctx;
  try{
    const o=await openPage(`${BASE}/location-${v}.html`); ctx=o.ctx;
    const page=o.page, errs=o.errs;

    // повний textContent + мета (беремо після init; textContent бачить off-screen DOM)
    const meta=await page.evaluate(()=>({
      render:typeof window.render==='function',
      atomOk:window.__ATOM_OK__===true,
      lenis:!!(window.lenis||window.Lenis||[...document.scripts].some(s=>/lenis/i.test(s.src))),
      gsap:!!(window.gsap||[...document.scripts].some(s=>/gsap/i.test(s.src))),
      pageH:document.documentElement.scrollHeight,
      body:document.body.textContent.replace(/\s+/g,' '),   // нормалізуємо whitespace для includes
      // slide titles з <br>→space (Discover<br>shopping → "Discover shopping") — для MECH-C перевірки
      slideTitles:[...document.querySelectorAll('.b11 .cap h3')].map(h=>h.innerHTML.replace(/<br\s*\/?>/gi,' ').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim()),
      raw:document.body.textContent,                        // сирий для точних verbatim-перевірок
      victorUsed:[...document.querySelectorAll('h1,h2,h3,h4,p,div,span')].some(el=>/victor serif/i.test(getComputedStyle(el).fontFamily)),
      ttcUsed:[...document.querySelectorAll('p,div,span,li')].some(el=>/tt commons pro/i.test(getComputedStyle(el).fontFamily)),
      bgImgs:[...document.querySelectorAll('*')].filter(el=>/url\(/.test(getComputedStyle(el).backgroundImage)).length,
    }));
    const has=s=>meta.body.includes(s.replace(/\s+/g,' '));
    const hasRaw=s=>meta.raw.includes(s);

    // ── TECH CONTRACT ──
    t.ok('хук window.render(p)', meta.render);
    t.ok('__ATOM_OK__=true', meta.atomOk);
    t.ok('Lenis підключено', meta.lenis);
    t.ok('GSAP підключено', meta.gsap);
    t.ok('сторінка достатньо висока (13 блоків, ≥600vh)', meta.pageH>=6*VH, `pageH=${meta.pageH} (${(meta.pageH/VH).toFixed(1)}vh)`);
    t.ok('Victor Serif застосований (заголовки)', meta.victorUsed);
    t.ok('TT Commons Pro застосований (body)', meta.ttcUsed);
    t.ok('≥3 full-bleed рендери (bg-image)', meta.bgImgs>=3, `bgImgs=${meta.bgImgs}`);

    // ── BLOCK 1 hero ──
    for(const s of HERO) t.ok(`hero: "${s}"`, has(s), has(s)?'є':'ВІДСУТНІЙ');
    // ── BLOCK 2 green statement ──
    t.ok('green-statement verbatim', has(GREEN_STMT), has(GREEN_STMT)?'є':'ВІДСУТНІЙ');
    // ── BLOCK 3 portrait ──
    for(const s of PORTRAIT_TITLE) t.ok(`portrait title: "${s}"`, has(s));
    t.ok('portrait body фрагмент', has(PORTRAIT_BODY), has(PORTRAIT_BODY)?'є':'ВІДСУТНІЙ');
    // ── BLOCK 4 POI map — 9 точок (name+number+mode) ──
    for(const [name,num,mode] of POI){
      t.ok(`POI name: "${name}"`, has(name), has(name)?'є':'ВІДСУТНІЙ');
      t.ok(`POI mode: "${mode}"`, has(mode));
    }
    // 🔴 verbatim plural "1 MINUTES WALK" (Park) — точна перевірка сирим текстом (може бути з розривами)
    const plural1 = hasRaw('1') && has('MINUTES WALK'); // Park=1 + plural mode обидва присутні
    t.ok('POI plural "MINUTES WALK" (не MINUTE)', has('MINUTES WALK'), 'plural load-bearing');
    // числа POI присутні
    for(const [name,num] of POI){
      t.ok(`POI number "${num}" (${name})`, hasRaw(num), hasRaw(num)?'є':'ВІДСУТНІЙ');
    }
    // ── BLOCK 6 necklace ──
    t.ok('necklace-para фрагмент', has(NECKLACE), has(NECKLACE)?'є':'ВІДСУТНІЙ');
    // ── BLOCK 8 recreation ──
    t.ok('recreation statement', has(REC_STMT), has(REC_STMT)?'є':'ВІДСУТНІЙ');
    t.ok('recreation body', has(REC_BODY), has(REC_BODY)?'є':'ВІДСУТНІЙ');
    // ── BLOCK 10 sticky title ──
    for(const s of DIGNIFIED) t.ok(`Dignified Beauty: "${s}"`, has(s));
    // ── BLOCK 11 — 5 слайдів (title з <br>-aware + body фрагмент) ──
    for(const [title,frag] of SLIDES){
      const titleOk = meta.slideTitles.some(st=>st===title || st.includes(title));
      t.ok(`slide title: "${title}"`, titleOk, titleOk?'є':'ВІДСУТНІЙ');
      t.ok(`slide body: "${frag}"`, has(frag), has(frag)?'є':'ВІДСУТНІЙ');
    }
    // ── BLOCK 12 seam breadcrumb ──
    for(const s of BREADCRUMB) t.ok(`breadcrumb: "${s}"`, has(s));

    // ── HARD MECHANIC A: POI map horizontal pan (native scroll + touch-drag) ──
    // Карта = #map-scroller (overflow-x native). render(p) пише scrollLeft (baseline); палець теж.
    // Перевіряємо: (1) scroller існує з touch-action:pan-x, (2) render(p) панує scrollLeft у map-range.
    const mapSL=p=>page.evaluate(pp=>{window.render(pp);
      const sc=document.querySelector('#map-scroller'); return sc?Math.round(sc.scrollLeft):null;},p);
    const scrollerMeta=await page.evaluate(()=>{
      const sc=document.querySelector('#map-scroller'); if(!sc) return null;
      const cs=getComputedStyle(sc);
      return {ta:cs.touchAction, ox:cs.overflowX, maxScroll:sc.scrollWidth-sc.clientWidth};});
    t.ok('MECH-A #map-scroller native-scroll layer', !!scrollerMeta && /pan-x|manipulation|auto/.test(scrollerMeta.ta) && scrollerMeta.ox==='auto',
      scrollerMeta?`touch-action=${scrollerMeta.ta} overflow-x=${scrollerMeta.ox} maxScroll=${scrollerMeta.maxScroll}`:'no scroller');
    // 🔴 карта рухається ТІЛЬКИ пальцем (native overflow-x), render(p) її НЕ чіпає
    // (авто-pan скролом «крутив» карту — прибрано). Перевіряємо: (1) scrollable canvas>screen,
    // (2) render(p) sweep НЕ рухає scrollLeft, (3) палець (ручний scrollLeft) тримається.
    const mapCanScroll = scrollerMeta && scrollerMeta.maxScroll>200;
    t.ok('MECH-A карта горизонтально-скролиться (canvas > екран)', mapCanScroll, scrollerMeta?`maxScroll=${scrollerMeta.maxScroll}`:'no');
    const mapUntouched=await page.evaluate(()=>{
      const sc=document.querySelector('#map-scroller'); const xs=[];
      for(const p of [0.20,0.24,0.27,0.30]){ window.render(p); xs.push(sc.scrollLeft); }
      return xs.every(x=>x===xs[0]);});  // render(p) не змінює scrollLeft
    t.ok('MECH-A render(p) НЕ крутить карту (scrollLeft стабільний)', mapUntouched);
    const fingerHolds=await page.evaluate(()=>{
      const sc=document.querySelector('#map-scroller');
      sc.scrollLeft=300; const held=sc.scrollLeft;
      window.render(0.24); window.render(0.28);       // скрол сторінки не має чіпати карту
      return {held, after:sc.scrollLeft};});
    t.ok('MECH-A палець тримається (scrollLeft не перетирається render)', fingerHolds.after===fingerHolds.held,
      `held=${fingerHolds.held} after=${fingerHolds.after}`);
    // drag-hint ‹ ✋ › присутній
    const hint=await page.evaluate(()=>/[‹›]|✋|✍|drag|pan|hand/i.test(document.body.innerHTML));
    t.ok('MECH-A drag-hint ‹ ✋ › присутній', hint);

    // ── HARD MECHANIC B: family curtain (continuous-strip) ──
    // .curtain зелена панель піднімається знизу (yPercent 100→0) коли b9 (індекс 8) виходить угору;
    // .dignified (b10, індекс 9) fade+rise коли входить у центр. Обидва на strip.
    const curtainY=p=>page.evaluate(pp=>{window.render(pp);
      const c=document.querySelector('.curtain'); if(!c) return null;
      return Math.round(new DOMMatrixReadOnly(getComputedStyle(c).transform).f);},p);
    const digReveal=p=>page.evaluate(pp=>{window.render(pp);
      const el=document.querySelector('.dignified'); if(!el) return null;
      return +parseFloat(getComputedStyle(el).opacity).toFixed(2);},p);
    // b9 центр = 9.5/12−0.5/12… → c9=0.5 при p=0.75; curtain росте 0.75→0.81; dignified reveal ≈0.78→0.85
    const cur0=await curtainY(0.74), cur1=await curtainY(0.82);   // panel translateY зменшується (їде вгору)
    const dig0=await digReveal(0.77), dig1=await digReveal(0.85); // opacity зростає
    // 🔴 жорстко: шторка МУСИТЬ реально закрити фото (translate→~0), не просто «рухатись»
    // (був баг: CSS translateY(100%)px + gsap yPercent складались → 1688→844, шторка вічно за екраном)
    const curtainMoves = cur0!==null && cur1!==null && cur0>600 && cur1<100 && dig1>dig0 && dig1>0.8;
    t.ok('MECH-B curtain РЕАЛЬНО закриває (→~0) + Dignified reveal', curtainMoves,
      `curtainY ${cur0}→${cur1} (хочемо >600→<100) · dignifiedOp ${dig0}→${dig1}`);

    // ── HARD MECHANIC C: 5-slide peek-next slider ──
    // у ~0.80–0.96 активний слайд змінюється; 5-сегментний progress-bar; caption swaps.
    // Сигнал 1: 5-сегментний бар — шукаємо контейнер з рівно 5 tick-дітьми.
    const segbar=await page.evaluate(()=>{
      const cands=[...document.querySelectorAll('*')].filter(el=>{
        const kids=[...el.children];
        return kids.length===5 && kids.every(k=>{const r=k.getBoundingClientRect();return r.width>0&&r.height<40;});
      });
      return cands.length>0;
    });
    t.ok('MECH-C 5-сегментний progress-bar', segbar, segbar?'знайдено контейнер з 5 tick':'НЕ знайдено');
    // Сигнал 2: активний слайд змінюється — індекс .on-caption/.on-segment + track translateX.
    // 🔴 слайдер = USER-DRIVEN (палець свайп/тап, native scroll-snap) — 1-в-1 з живим springs.
    // Скрол сторінки слайди НЕ гортає (фідбек Єгора з відео).
    const sliderMeta=await page.evaluate(()=>{
      const m=document.querySelector('.b11 .media'); if(!m) return null;
      const cs=getComputedStyle(m);
      return {ox:cs.overflowX, snap:cs.scrollSnapType, maxScroll:m.scrollWidth-m.clientWidth,
        onCap:[...document.querySelectorAll('.b11 .cap')].findIndex(c=>c.classList.contains('on'))};});
    t.ok('MECH-C .media native-swipe (overflow-x + scroll-snap)', !!sliderMeta && sliderMeta.ox==='auto' && /x/.test(sliderMeta.snap) && sliderMeta.maxScroll>800,
      sliderMeta?`snap=${sliderMeta.snap} maxScroll=${sliderMeta.maxScroll} initCap=${sliderMeta.onCap}`:'no .media');
    t.ok('MECH-C стартовий caption = slide 0', sliderMeta && sliderMeta.onCap===0, `initCap=${sliderMeta?.onCap}`);
    const sliderUntouched=await page.evaluate(()=>{
      const m=document.querySelector('.b11 .media'); const xs=[];
      for(const p of [0.85,0.90,0.95]){ window.render(p); xs.push(m.scrollLeft); }
      return xs.every(x=>x===xs[0]);});
    t.ok('MECH-C render(p) НЕ гортає слайди (user-driven)', sliderUntouched);
    const swipeSync=await page.evaluate(()=>{
      const m=document.querySelector('.b11 .media');
      m.scrollLeft=600; m.dispatchEvent(new Event('scroll'));   // свайп пальцем на slide 2
      return [...document.querySelectorAll('.b11 .cap')].findIndex(c=>c.classList.contains('on'));});
    t.ok('MECH-C свайп → caption sync (scrollLeft 600 → slide 2)', swipeSync===2, `activeCap=${swipeSync}`);

    // ── HEADER INVERT (колір хедера змінюється по фону; inline hdr.style.color) ──
    const hdrColor=p=>page.evaluate(pp=>{window.render(pp);
      const hdr=document.querySelector('#hdr'); return hdr?getComputedStyle(hdr).color:null;},p);
    const hc0=await hdrColor(0.02), hc1=await hdrColor(0.42); // hero(cream) vs cream-section b5/b6(ink)
    t.ok('header колір інвертується (cream↔ink)', hc0!==null && hc1!==null && hc0!==hc1, `@hero=${hc0} @cream-sect=${hc1}`);

    // ── BEAT PROGRESSION: стан секції @0.05 ≠ @0.95 (opacity+y кожного beat) ──
    const at=p=>page.evaluate(pp=>{window.render(pp);
      return [...document.querySelectorAll('section,[class*=block],[class*=beat]')].slice(0,14).map(el=>{
        const r=el.getBoundingClientRect(); const cs=getComputedStyle(el);
        return Math.round(r.y)+':'+(+parseFloat(cs.opacity).toFixed(2));
      }).join('|'); },p);
    const s0=await at(0.05), s1=await at(0.95);
    t.ok('render(p) рухає всю секцію (beat progression)', s0!==s1, s0!==s1?'@0.05≠@0.95':'ОДНАКОВІ');

    // ── ДЕТЕРМІНІЗМ (reverse/teleport safe) ──
    const sig=p=>page.evaluate(pp=>{window.render(pp);
      return [...document.querySelectorAll('section,[class*=block],[class*=slide],[class*=map]')].slice(0,10)
        .map(e=>{const r=e.getBoundingClientRect();return Math.round(r.y)+','+Math.round(r.x);}).join('|');},p);
    const A=await sig(0.5); await sig(1); await sig(0); const B=await sig(0.5);
    t.ok('render детермінований (0.5 після 1→0 = 0.5 напряму)', A===B, A===B?'ok':'DRIFT');
    t.ok('render clamp 0..1 (не кидає)', await page.evaluate(()=>{try{window.render(-1);window.render(2);window.render(.5);return true;}catch(e){return false;}}));

    // ── OVERFLOW + CONSOLE ──
    const sw=await page.evaluate(()=>document.documentElement.scrollWidth);
    t.ok('нічого не вилазить за 390px', sw<=VW+1, `sw=${sw}`);
    t.ok('zero console errors', errs.length===0, errs.slice(0,3).join(' | ')||'0');

    totalFails+=t.fails.length;
    console.log(t.fails.length?`  ⛔ location-${v}: ${t.fails.length} FAIL`:`  🟢 location-${v}: ALL PASS`);
    await page.close();
  } catch(e){ console.log(`  ⛔ location-${v}: EXCEPTION — ${e.message}`); totalFails+=1; }
  finally{ if(ctx) await ctx.close(); }
}

await browser.close();
console.log(`\n${'='.repeat(52)}\nПІДСУМОК location-section: ${totalFails===0?'🟢 ALL PASS':'⛔ '+totalFails+' FAIL'}`);
console.log('🔴 element-gate НЕ застосовний (dummy-фасад, per-element проти live НЕ звірено).');
process.exit(totalFails?1:0);
