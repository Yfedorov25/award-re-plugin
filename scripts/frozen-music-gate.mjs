#!/usr/bin/env node
/* frozen-music-gate.mjs — гейт на RAW для springs "Frozen Music" (/design continuation, M6),
   CD 3 варіанти, 390×844. Патерн location-section-gate.mjs (S41) + M6-специфіка:
   4 HARD-механіки (A card-overlap · B pinned-caption crossfade ivy→tree · C hotspot-оверлеї
   USER-DRIVEN · D RIL scrub-карусель 2 слайди) + спіраль БЕЗ обертання (виміряно S42).
   Джерело правди: ~/Downloads/CD-RUN-frozen-music-v1/{00-READ-FIRST,01-PROMPT,SECTION-MAP}.md

   🔴 УРОКИ (S40/S41/S42):
   - textContent, НЕ innerText (off-screen біти невидимі для innerText).
   - Оверлей-тексти CAPS можуть бути через CSS text-transform → перевірка CASE-INSENSITIVE.
   - Селектори гнучкі (CD іменує класи довільно) — текст-якорі + структурні сигнатури.
   - Hotspot-оверлеї: render(p) НЕ сміє їх чіпати (відкрив тапом → render-sweep не закриває).
   - Спіраль: транзформ БЕЗ rotate/skew на всьому діапазоні (b,c ≈ 0).
   - Спойлер-чек: контент Flats (M8) НЕ має бути в M6.
   🔴 element-gate НЕ застосовний: dummy-фасад, per-element проти live НЕ міряно.
   Цей гейт судить СТРУКТУРУ/МЕХАНІКУ, не піксельну парність до live. */
import { resolveChromium, MOBILE_UA } from './token-extractor.mjs';
const chromium = await resolveChromium(); if(!chromium){console.error('no chromium');process.exit(2);}
const browser = await chromium.launch();
const BASE='http://localhost:8879/atoms/frozen-music/variants';
const VW=390, VH=844;
const VARIANTS=process.argv[2]?[process.argv[2]]:['a','b','c'];
let totalFails=0;

// ── VERBATIM (SECTION-MAP M6; case-sensitive якщо не сказано інше) ──
const V_CS=[
  // B1
  'Glowing building of limitless light resembles a lens refracting a kaleidoscope of reflections.',
  // B3
  'The architects','Tabanlioglu','masterfully frame the world','glistening buildings',
  // B4
  'The concept of Springs','is to merge architecture','within the optical focus','into tomorrow',
  // B5 caption
  'Ultra-transparent panoramic windows, aluminum panels with restrained luster, natural oak-framed loggias, marble flooring',
  // B6
  'Frozen Music','Springs resembles a waterfall that ceased flowing','How did we create this effect?',
  // B8 (em-dash перевіряється окремо)
  'Glass, metal, stone, and','the four','elements that define','an airy yet durable','structure.',
  // B10 (фрагмент без апострофа — типографія ' vs ' не має валити)
  'High-clarity glass makes our building appear levitating','again and again to admire the elegance that adorns your life',
  // B11
  'Rich','Interior','Life',
  'Imagine bathing in the crystal-clear pool','feeling pleasant coolness on your skin',
  'Our fitness center, offering state-of-the-art equipment','guarantee your full satisfaction',
  // B12
  'Art Gallery','of Your Life','Our viewing terraces will surround you with beauty of botanical sculptures.',
  // B13
  'Our Wellness center will greet you with beauty chiseled in marble and dissolved in water.',
];
const V_CI=[  // caps-блоки (можуть бути text-transform:uppercase у CSS)
  'CRYSTAL-CLEAR VISION',
  "BUREAU'S SIGNATURE PROJECTS",
  'ARISTOCRATIC QUARTET',
  'THE BALCONIES OF THE ASYMMETRICAL FACADE FOLLOW A CHESSBOARD PATTERN. THE NON-LINEAR ORDER CREATES A STRIKING, RECOGNIZABLE EFFECT.',
  'THE ARCHITECTS DIVIDED THE UNIFORM TRANSPARENT FACADE INTO THREE VERTICAL SECTIONS, WITH THE TERRACES SITUATED IN THE RECESSES. THIS IS HOW WE GRAFT RHYTHMIC BEAUTY WITH FUNCTIONAL ELEGANCE.',
];
const SPOILERS=['LIMITLESS VISION','138 view flats','GARDEN OF FULFILLED EXPECTATIONS']; // M8 — НЕ має бути

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

for(const v of VARIANTS){
  console.log(`\n=== frozen-music-${v} (RAW, 390×844) ===`);
  const t=mk(); let ctx;
  try{
    const o=await openPage(`${BASE}/frozen-music-${v}.html`); ctx=o.ctx;
    const page=o.page, errs=o.errs;

    const meta=await page.evaluate(()=>{
      // 🔴 <br>-aware: replace <br> with a space so "limitless<br>light" → "limitless light"
      // (textContent drops <br> giving "limitlesslight" — false verbatim-miss, набитий S42).
      const clone=document.body.cloneNode(true);
      clone.querySelectorAll('br').forEach(br=>br.replaceWith(' '));
      const bodyTxt=clone.textContent;
      return {
      render:typeof window.render==='function',
      atomOk:window.__ATOM_OK__===true,
      gsap:!!(window.gsap||[...document.scripts].some(s=>/gsap/i.test(s.src))),
      pageH:document.documentElement.scrollHeight,
      body:bodyTxt.replace(/\s+/g,' '),
      raw:bodyTxt,
      victorUsed:[...document.querySelectorAll('h1,h2,h3,h4,p,div,span')].some(el=>/victor serif/i.test(getComputedStyle(el).fontFamily)),
      ttcUsed:[...document.querySelectorAll('p,div,span,li')].some(el=>/tt commons pro/i.test(getComputedStyle(el).fontFamily)),
      bgImgs:[...document.querySelectorAll('*')].filter(el=>/url\(/.test(getComputedStyle(el).backgroundImage)).length
        + document.querySelectorAll('img[src]').length,
      emDash:document.body.textContent.includes('—'),
      // 🔴 нова CD-архітектура = sticky fm-stage + внутрішній fm-scroller/fm-track (documentElement лишається 1vh).
      // висоту секції беремо з .fm-track (або будь-якого *track/strip) якщо він є.
      trackH:(function(){const t=document.querySelector('.fm-track,[class*=track],[class*=strip]');return t?Math.round(t.getBoundingClientRect().height):0;})(),
      // 🔴 overlay-тексти можуть жити в JS-рядках (OTX), не в DOM до тапу — тому даємо гейту сирий HTML сторінки.
      html:document.documentElement.outerHTML,
    };});
    const has=s=>meta.body.includes(s.replace(/\s+/g,' '));
    const bodyCI=meta.body.toUpperCase();
    // CI-присутність: у DOM-тексті АБО в сирому HTML (охоплює JS-рядки overlay-текстів)
    const htmlCI=meta.html.toUpperCase();
    const hasCI=s=>{const n=s.replace(/\s+/g,' ').toUpperCase();return bodyCI.includes(n)||htmlCI.replace(/<BR\s*\/?>/g,' ').replace(/\s+/g,' ').includes(n);};

    // ── TECH CONTRACT ──
    t.ok('хук window.render(p)', meta.render);
    t.ok('__ATOM_OK__=true', meta.atomOk);
    t.ok('GSAP підключено', meta.gsap);
    // висота: documentElement АБО внутрішній fm-track (sticky-scroller архітектура)
    const effH=Math.max(meta.pageH, meta.trackH);
    t.ok('секція достатньо висока (13 блоків, ≥600vh — track або page)', effH>=6*VH, `pageH=${meta.pageH} trackH=${meta.trackH} → ${(effH/VH).toFixed(1)}vh`);
    t.ok('Victor Serif застосований', meta.victorUsed);
    t.ok('TT Commons Pro застосований', meta.ttcUsed);
    t.ok('≥6 фото-асетів (bg-image/img)', meta.bgImgs>=6, `imgs=${meta.bgImgs}`);
    t.ok('em-dash «—» присутній (B8 verbatim)', meta.emDash);

    // ── VERBATIM ──
    for(const s of V_CS) t.ok(`verbatim: "${s.length>48?s.slice(0,48)+'…':s}"`, has(s), has(s)?'є':'ВІДСУТНІЙ');
    for(const s of V_CI) t.ok(`verbatim-CI: "${s.length>48?s.slice(0,48)+'…':s}"`, hasCI(s), hasCI(s)?'є':'ВІДСУТНІЙ');
    for(const s of SPOILERS) t.ok(`СПОЙЛЕР M8 відсутній: "${s}"`, !hasCI(s), hasCI(s)?'ПРИСУТНІЙ (виріж — це Flats/M8)':'чисто');

    // ── MECH-B: pinned-caption crossfade ivy→tree (~p 0.31–0.38) ──
    // Caption y-стабільний посеред вікна, поки tree-шар набирає opacity.
    const mechB=await page.evaluate(()=>{
      const find=txt=>[...document.querySelectorAll('*')].find(el=>el.children.length===0&&el.textContent.includes(txt))
        ||[...document.querySelectorAll('*')].find(el=>el.textContent.includes(txt)&&el.textContent.length<300);
      const cap=find('Ultra-transparent panoramic windows');
      if(!cap) return {err:'caption not found'};
      const treeEl=[...document.querySelectorAll('*')].find(el=>{
        const bg=getComputedStyle(el).backgroundImage;
        return /tree-atrium/.test(bg)||(el.tagName==='IMG'&&/tree-atrium/.test(el.src||''));});
      const yAt=p=>{window.render(p);return cap.getBoundingClientRect().y;};
      const opAt=p=>{if(!treeEl)return null;window.render(p);
        let el=treeEl,op=1;while(el&&el!==document.body){op*=parseFloat(getComputedStyle(el).opacity);el=el.parentElement;}return +op.toFixed(2);};
      // 🔴 знайти вікно crossfade автоматично (де treeOp перетинає 0.1→0.9), тоді судити caption там.
      let pLow=null,pHigh=null;
      for(let i=0;i<=40;i++){ const pv=i/40; const o=opAt(pv); if(o!==null){ if(pLow===null&&o>0.1) pLow=pv; if(o>0.9){ pHigh=pv; break; } } }
      const pMid1=pLow!==null?Math.max(0,pLow):0.34, pMid2=pHigh!==null?pHigh:0.40;
      const y1=yAt(pMid1),y2=yAt((pMid1+pMid2)/2);   // caption y під час crossfade-холду
      const o1=opAt(Math.max(0,pMid1-0.02)),o2=opAt(pMid2);
      window.render(0);
      return {y1:Math.round(y1),y2:Math.round(y2),o1,o2,treeFound:!!treeEl,win:`${pMid1.toFixed(2)}-${pMid2.toFixed(2)}`};
    });
    t.ok('MECH-B tree-asset присутній', mechB.treeFound===true, mechB.err||`tree=${mechB.treeFound}`);
    t.ok('MECH-B caption pinned посеред вікна (|Δy|≤40px)', !mechB.err&&Math.abs(mechB.y2-mechB.y1)<=40, `y ${mechB.y1}→${mechB.y2}`);
    t.ok('MECH-B tree opacity зростає по вікну', mechB.o1!==null&&mechB.o2!==null&&mechB.o2>mechB.o1+0.2, `op ${mechB.o1}→${mechB.o2}`);

    // ── MECH-C: hotspot-оверлеї (USER-DRIVEN, render не чіпає) ──
    // 🔴 нова CD-архітектура: маркери = .cr-mk (data-txt 1/2); overlay = #fm-overlay (inline opacity 0→1);
    // текст ставиться в #fm-otext на openHot; закриття = #fm-close. Судимо по #fm-overlay opacity.
    const mechC=await page.evaluate(async()=>{
      const mk=[...document.querySelectorAll('.cr-mk,[data-txt],[data-hs]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.width<=140;});
      const m1=mk.find(e=>(e.getAttribute('data-txt')||e.getAttribute('data-hs')||e.textContent.trim())==='1'||(e.getAttribute('data-hs')==='0'));
      const m2=mk.find(e=>(e.getAttribute('data-txt')||e.getAttribute('data-hs')||e.textContent.trim())==='2'||(e.getAttribute('data-hs')==='1'));
      const ov=document.querySelector('#fm-overlay,[id*=overlay],[class*=overlay]');
      const otext=document.querySelector('#fm-otext,[id*=otext]');
      const closeb=document.querySelector('#fm-close,[id*=close],[class*=close]');
      if(!m1||!m2) return {err:`markers .cr-mk: found ${mk.length}`};
      if(!ov) return {err:'no #fm-overlay'};
      const ovVisible=()=>{ const cs=getComputedStyle(ov); return cs.visibility!=='hidden' && parseFloat(cs.opacity)>0.5; };
      const ovHasText=(frag)=>{ return otext ? otext.textContent.toUpperCase().includes(frag) : ov.textContent.toUpperCase().includes(frag); };
      window.render(0.47); await new Promise(r=>setTimeout(r,120));
      const scr0=window.__p;
      const before=ovVisible();
      m1.click();
      await new Promise(r=>setTimeout(r,700));
      const afterOpen=ovVisible()&&ovHasText('THE BALCONIES OF THE ASYMMETRICAL');
      const scrollSame=Math.abs((window.__p||0)-0.47)<0.001;    // render(p) не має змінитись від тапу
      // render-sweep НЕ сміє закрити відкритий оверлей
      window.render(0.45); window.render(0.49); window.render(0.47);
      await new Promise(r=>setTimeout(r,150));
      const afterSweep=ovVisible();
      if(closeb) closeb.click();
      await new Promise(r=>setTimeout(r,600));
      const afterClose=ovVisible();
      window.render(0);
      return {before,afterOpen,scrollSame,afterSweep,closeFound:!!closeb,afterClose,markers:{n:mk.length}};
    });
    t.ok('MECH-C 2 hotspot-маркери знайдено', !mechC.err, mechC.err||`.cr-mk×${mechC.markers?.n}`);
    t.ok('MECH-C оверлей закритий до тапу', !mechC.err&&mechC.before===false, `before=${mechC.before}`);
    t.ok('MECH-C тап → оверлей #1 видимий', !mechC.err&&mechC.afterOpen===true, `afterOpen=${mechC.afterOpen}`);
    t.ok('MECH-C скрол-позиція не зрушила', !mechC.err&&mechC.scrollSame===true);
    t.ok('MECH-C render-sweep НЕ закриває оверлей', !mechC.err&&mechC.afterSweep===true, `afterSweep=${mechC.afterSweep}`);
    t.ok('MECH-C ✕ знайдено і закриває', !mechC.err&&mechC.closeFound===true&&mechC.afterClose===false, `close=${mechC.closeFound} after=${mechC.afterClose}`);

    // ── MECH-D: RIL scrub-карусель (2 слайди, crossfade фото+текст у lockstep) ──
    const mechD=await page.evaluate(()=>{
      const find=txt=>[...document.querySelectorAll('*')].find(el=>el.children.length===0&&el.textContent.includes(txt));
      const effOp=el=>{if(!el)return null;let n=el,op=1;while(n&&n!==document.body){op*=parseFloat(getComputedStyle(n).opacity);n=n.parentElement;}return +op.toFixed(2);};
      const pa=()=>find('Imagine bathing'), pb=()=>find('Our fitness center');
      const at=p=>{window.render(p);return {a:effOp(pa()),b:effOp(pb())};};
      const early=at(0.72), late=at(0.83);
      // reverse-safe: повернення
      const back=at(0.72);
      window.render(0);
      return {early,late,back};
    });
    const dOK=x=>x&&x.a!==null&&x.b!==null;
    t.ok('MECH-D обидва RIL-параграфи в DOM', dOK(mechD.early), JSON.stringify(mechD.early));
    t.ok('MECH-D слайд A→B по вікну (a падає, b росте)', dOK(mechD.early)&&dOK(mechD.late)&&mechD.late.b>mechD.early.b+0.2&&mechD.early.a>mechD.late.a+0.2,
      `early a=${mechD.early?.a} b=${mechD.early?.b} · late a=${mechD.late?.a} b=${mechD.late?.b}`);
    t.ok('MECH-D reverse-safe (0.72 після 0.83 = 0.72 напряму)', dOK(mechD.back)&&Math.abs(mechD.back.a-mechD.early.a)<0.05&&Math.abs(mechD.back.b-mechD.early.b)<0.05,
      `back a=${mechD.back?.a} b=${mechD.back?.b}`);

    // ── СПІРАЛЬ: нуль обертання на всьому діапазоні ──
    const spiral=await page.evaluate(()=>{
      const el=[...document.querySelectorAll('img')].find(i=>/spiral/.test(i.src||''))
        ||[...document.querySelectorAll('*')].find(e=>/spiral/.test(getComputedStyle(e).backgroundImage));
      if(!el) return {err:'spiral asset not found'};
      let maxSkew=0;
      for(const p of [0.55,0.58,0.61,0.64,0.67]){
        window.render(p);
        let n=el;
        while(n&&n!==document.body){
          const tr=getComputedStyle(n).transform;
          if(tr&&tr!=='none'){const m=new DOMMatrixReadOnly(tr);maxSkew=Math.max(maxSkew,Math.abs(m.b),Math.abs(m.c));}
          n=n.parentElement;
        }
      }
      window.render(0);
      return {maxSkew:+maxSkew.toFixed(4)};
    });
    t.ok('СПІРАЛЬ без обертання (|b|,|c|<0.02 по діапазону)', !spiral.err&&spiral.maxSkew<0.02, spiral.err||`maxSkew=${spiral.maxSkew}`);

    // ── HEADER INVERT ──
    const hdrColor=p=>page.evaluate(pp=>{window.render(pp);
      const hdr=document.querySelector('header,#hdr,[class*=header],[class*=hdr]');
      return hdr?getComputedStyle(hdr).color:null;},p);
    // 🔴 p-точки нового двигуна (виміряно sweep): @0.03 glass=cream · @0.20 TA-картка=ink ·
    // @0.55 cream-run=ink · @0.95 wellness=cream. Беремо glass(cream) vs cream-run(ink).
    const hc0=await hdrColor(0.03), hc1=await hdrColor(0.55);
    t.ok('header колір інвертується (cream↔ink)', hc0!==null&&hc1!==null&&hc0!==hc1, `@glass=${hc0} @cream-run=${hc1}`);

    // ── BEAT PROGRESSION ──
    const at=p=>page.evaluate(pp=>{window.render(pp);
      return [...document.querySelectorAll('section,[class*=block],[class*=beat],[class*=bit]')].slice(0,14).map(el=>{
        const r=el.getBoundingClientRect(); const cs=getComputedStyle(el);
        return Math.round(r.y)+':'+(+parseFloat(cs.opacity).toFixed(2));
      }).join('|'); },p);
    const s0=await at(0.05), s1=await at(0.95);
    t.ok('render(p) рухає всю секцію (beat progression)', s0!==s1, s0!==s1?'@0.05≠@0.95':'ОДНАКОВІ');

    // ── ДЕТЕРМІНІЗМ ──
    const sig=p=>page.evaluate(pp=>{window.render(pp);
      return [...document.querySelectorAll('section,[class*=block],[class*=bit],[class*=beat]')].slice(0,10)
        .map(e=>{const r=e.getBoundingClientRect();return Math.round(r.y)+','+Math.round(r.x);}).join('|');},p);
    const A=await sig(0.5); await sig(1); await sig(0); const B=await sig(0.5);
    t.ok('render детермінований (0.5 після 1→0 = 0.5 напряму)', A===B, A===B?'ok':'DRIFT');
    t.ok('render clamp 0..1 (не кидає)', await page.evaluate(()=>{try{window.render(-1);window.render(2);window.render(.5);return true;}catch(e){return false;}}));

    // ── OVERFLOW + CONSOLE + touch-action ──
    const sw=await page.evaluate(()=>document.documentElement.scrollWidth);
    t.ok('нічого не вилазить за 390px', sw<=VW+1, `sw=${sw}`);
    const badTA=await page.evaluate(()=>[...document.querySelectorAll('*')].some(el=>{
      const cs=getComputedStyle(el); const r=el.getBoundingClientRect();
      return cs.touchAction==='pan-x'&&r.height>500;}));
    t.ok('немає touch-action:pan-x на full-screen шарах (блокує vert-скрол iOS)', !badTA);
    t.ok('zero console errors', errs.length===0, errs.slice(0,3).join(' | ')||'0');

    totalFails+=t.fails.length;
    console.log(t.fails.length?`  ⛔ frozen-music-${v}: ${t.fails.length} FAIL`:`  🟢 frozen-music-${v}: ALL PASS`);
    await page.close();
  } catch(e){ console.log(`  ⛔ frozen-music-${v}: EXCEPTION — ${e.message}`); totalFails+=1; }
  finally{ if(ctx) await ctx.close(); }
}

await browser.close();
console.log(`\n${'='.repeat(52)}\nПІДСУМОК frozen-music: ${totalFails===0?'🟢 ALL PASS':'⛔ '+totalFails+' FAIL'}`);
console.log('🔴 element-gate НЕ застосовний (dummy-фасад, per-element проти live НЕ звірено).');
process.exit(totalFails?1:0);
