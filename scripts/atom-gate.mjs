#!/usr/bin/env node
/* atom-gate.mjs — 4-умовний EXTRACT-гейт для springs-mobile атомів (S43).
   Умови ради [[organism-extract-loop]]:
     (а) ре-рендер під ЧУЖИМ (не-springs) dummy-фасадом — build.html навмисне не-springs
     (б) mobile pinned-scroll 390×844 — драйвимо scroll, перевіряємо стани render(p)
     (в) INDEX-звірка — зроблена окремо (dedup-агенти), фіксується в SPEC (extends:)
     (г) composition-check — окремий прохід composition-check.mjs
   Цей скрипт ганяє (а)+(б) числами + TRANSFER-ГЕЙТ з SPEC кожного атома.
   Запуск: node scripts/atom-gate.mjs <atom-id>
   Патерн resolveChromium — той самий, що frozen-music-gate / location-section-gate. */
import { resolveChromium } from './token-extractor.mjs';

const ATOM = process.argv[2];
if(!ATOM){ console.error('usage: atom-gate.mjs <atom-id>'); process.exit(2); }
const chromium = await resolveChromium();
if(!chromium){ console.error('no chromium'); process.exit(2); }

const BASE = `http://localhost:8879/atoms/${ATOM}`;
const VW=390, VH=844;
let fails=0;
const ok  = (m)=>console.log('  ✓ '+m);
const bad = (m)=>{ console.log('  ✗ '+m); fails++; };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport:{width:VW,height:VH}, deviceScaleFactor:2,
  userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1', isMobile:true, hasTouch:true });
const page = await ctx.newPage();
const errs=[];
page.on('console', m=>{ if(m.type()==='error') errs.push(m.text()); });
page.on('pageerror', e=>errs.push(String(e)));

async function setHold(frac){
  // драйвимо .scroller до частки pin-band; повертаємо, коли render застосувався
  await page.evaluate((f)=>{
    const sc=document.querySelector('.scroller');
    const pw=document.querySelector('.pin-wrap');
    if(!sc||!pw) return;
    const vh=window.innerHeight;
    const span=pw.offsetHeight - vh;
    sc.scrollTop = pw.offsetTop + span*f;
    sc.dispatchEvent(new Event('scroll'));
  }, frac);
  await page.waitForTimeout(60);
}

console.log(`\n── atom-gate: ${ATOM} ── (390×844, dummy facade, pinned-scroll)`);

const url = `${BASE}/build.html`;
const resp = await page.goto(url, { waitUntil:'load' }).catch(e=>({_e:e}));
if(!resp || resp._e || (resp.status && resp.status()>=400)){ bad(`build.html не завантажився (${url})`); }
else {
  await page.waitForTimeout(140);

  // (б) hook + 0 overflow — базова готовність на mobile
  const okHook = await page.evaluate(()=>window.__CARD_OVERLAP_OK__===true
    || window.__PIN_CAPTION_OK__===true || window.__HOTSPOT_OK__===true || window.__CAROUSEL_OK__===true);
  okHook ? ok('hook __*_OK__ === true (атом ініціалізувався)') : bad('hook не піднявся');
  const sw = await page.evaluate(()=>document.documentElement.scrollWidth - document.documentElement.clientWidth);
  sw===0 ? ok('scrollWidth-clientWidth == 0 (нема горизонт. overflow на 390px)') : bad(`горизонт. overflow: ${sw}px`);

  // ── per-atom TRANSFER-ГЕЙТ ──
  if(ATOM==='card-overlap-reveal'){
    await setHold(0.0);
    const s0 = await page.evaluate(()=>{
      const c=document.querySelector('.card'), b=document.querySelector('.backdrop');
      const cs=getComputedStyle(c), bs=getComputedStyle(b);
      return { cardT:cs.transform, bdT:bs.transform };
    });
    // card на hold 0 має бути внизу (translateY ~100% → matrix e велике додатне по Y)
    const cardY0 = matY(s0.cardT);
    cardY0 > VH*0.6 ? ok(`hold0: card унизу (translateY ${cardY0.toFixed(0)}px > 0.6vh) — не наїхала`) : bad(`hold0: card не внизу (Y=${cardY0.toFixed(0)})`);
    const bdScale0 = matScale(s0.bdT);
    bdScale0 > 1.04 ? ok(`hold0: backdrop scale ${bdScale0.toFixed(3)} ≈ 1.06 (settle-старт)`) : bad(`hold0: backdrop scale ${bdScale0.toFixed(3)} != ~1.06`);

    await setHold(0.42);
    const bdScale42 = await page.evaluate(()=>{const b=document.querySelector('.backdrop');return getComputedStyle(b).transform;}).then(matScale);
    Math.abs(bdScale42-1.0)<0.01 ? ok(`hold0.42: backdrop scale ${bdScale42.toFixed(3)} ≈ 1.00 (settle завершено ДО наїзду)`) : bad(`hold0.42: scale ${bdScale42.toFixed(3)} != 1.00`);
    const cardY42 = await page.evaluate(()=>getComputedStyle(document.querySelector('.card')).transform).then(matY);
    cardY42 > VH*0.55 ? ok(`hold0.42: card ще внизу (Y=${cardY42.toFixed(0)}) — наїзд лише у [0.42,1]`) : bad(`hold0.42: card уже наїхала (Y=${cardY42.toFixed(0)})`);

    await setHold(1.0);
    const s1 = await page.evaluate(()=>{
      const c=document.querySelector('.card');
      const copy=document.querySelector('.card-copy');
      return { cardT:getComputedStyle(c).transform,
        cardLeft:c.getBoundingClientRect().left,
        copyTop:copy.getBoundingClientRect().top };
    });
    const cardY1 = matY(s1.cardT);
    Math.abs(cardY1) < 2 ? ok(`hold1: card наїхала повністю (Y=${cardY1.toFixed(1)} ≈ 0)`) : bad(`hold1: card не наїхала (Y=${cardY1.toFixed(1)})`);
    s1.cardLeft >= 8 ? ok(`hold1: слівер backdrop зліва видимий (card.left=${s1.cardLeft.toFixed(0)}px > 0)`) : bad(`hold1: нема слівера (card.left=${s1.cardLeft.toFixed(0)})`);

    // curtain-mask: masked-copy top НЕ рухається між hold 0.5 і 1.0 (маскує край, не рухає текст)
    await setHold(0.5);
    const copyTop50 = await page.evaluate(()=>document.querySelector('.card-copy').getBoundingClientRect().top);
    await setHold(1.0);
    const copyTop100 = await page.evaluate(()=>document.querySelector('.card-copy').getBoundingClientRect().top);
    // .card-copy рухається РАЗОМ з карткою (це нормально) — важливо, що текст не має ВЛАСНОЇ reveal-анімації.
    // Перевіряємо: різниця top == різниці зсуву картки (текст приклеєний до картки, curtain = край .card).
    const cardTop50 = await (async()=>{ await setHold(0.5); return page.evaluate(()=>document.querySelector('.card').getBoundingClientRect().top); })();
    await setHold(1.0);
    const cardTop100 = await page.evaluate(()=>document.querySelector('.card').getBoundingClientRect().top);
    const copyDelta = Math.abs((copyTop100-copyTop50));
    const cardDelta = Math.abs((cardTop100-cardTop50));
    Math.abs(copyDelta-cardDelta) < 3 ? ok(`curtain-mask: текст їде РАЗОМ з карткою (Δcopy=${copyDelta.toFixed(0)} ≈ Δcard=${cardDelta.toFixed(0)}), власної reveal-анімації нема`) : bad(`curtain-mask: текст рухається окремо від картки (Δcopy=${copyDelta.toFixed(0)} vs Δcard=${cardDelta.toFixed(0)})`);

    // телепорт: назад на 0 → коректний стан
    await setHold(0.0);
    const cardYback = await page.evaluate(()=>getComputedStyle(document.querySelector('.card')).transform).then(matY);
    cardYback > VH*0.6 ? ok('телепорт hold1→0: card повернулась униз (стан коректний)') : bad(`телепорт: card не повернулась (Y=${cardYback.toFixed(0)})`);
  }

  if(ATOM==='pinned-caption-crossfade'){
    await setHold(0.14);
    const o14 = await page.evaluate(()=>({a:+getComputedStyle(document.querySelector('.bg-a')).opacity, b:+getComputedStyle(document.querySelector('.bg-b')).opacity}));
    o14.b < 0.1 ? ok(`hold0.14: bg-b.opacity ${o14.b.toFixed(2)} ≈ 0 (crossfade ще не почався)`) : bad(`hold0.14: bg-b.opacity ${o14.b.toFixed(2)} != ~0`);

    await setHold(0.48);
    const o48 = await page.evaluate(()=>({a:+getComputedStyle(document.querySelector('.bg-a')).opacity, b:+getComputedStyle(document.querySelector('.bg-b')).opacity, s:getComputedStyle(document.querySelector('.bg-b')).transform}));
    (o48.b>0.9 && o48.a<0.1) ? ok(`hold0.48: перехрест (bg-b ${o48.b.toFixed(2)}↑, bg-a ${o48.a.toFixed(2)}↓)`) : bad(`hold0.48: нема перехресту (b=${o48.b.toFixed(2)} a=${o48.a.toFixed(2)})`);
    const sc48 = matScale(o48.s);
    Math.abs(sc48-1.0)<0.02 ? ok(`hold0.48: bg-b scale ${sc48.toFixed(3)} ≈ 1.00 (settle завершено)`) : bad(`hold0.48: bg-b scale ${sc48.toFixed(3)} != 1.00`);

    // held-caption: opacity==1 на всьому [0.2,0.8], НЕ рухається
    await setHold(0.3);
    const c30 = await page.evaluate(()=>({o:+getComputedStyle(document.querySelector('.caption')).opacity, t:document.querySelector('.caption').getBoundingClientRect().top, txt:document.querySelector('.caption p').textContent.trim()}));
    await setHold(0.7);
    const c70 = await page.evaluate(()=>({o:+getComputedStyle(document.querySelector('.caption')).opacity, t:document.querySelector('.caption').getBoundingClientRect().top, txt:document.querySelector('.caption p').textContent.trim()}));
    (c30.o>0.98 && c70.o>0.98) ? ok(`held-caption: opacity==1 на [0.3,0.7] (${c30.o.toFixed(2)}/${c70.o.toFixed(2)})`) : bad(`held-caption: не тримається (${c30.o.toFixed(2)}/${c70.o.toFixed(2)})`);
    Math.abs(c30.t-c70.t) < 2 ? ok(`held-caption: y не рухається (Δ${Math.abs(c30.t-c70.t).toFixed(1)}px) під crossfade`) : bad(`held-caption: y рухається (Δ${Math.abs(c30.t-c70.t).toFixed(1)}px)`);
    c30.txt===c70.txt ? ok('held-caption: той самий текст (не свапається)') : bad('held-caption: текст свапнувся');

    // capOut на релізі
    await setHold(1.0);
    const c100 = await page.evaluate(()=>+getComputedStyle(document.querySelector('.caption')).opacity);
    c100 < c70.o ? ok(`release: caption почав зникати (op ${c100.toFixed(2)} < ${c70.o.toFixed(2)})`) : bad(`release: caption не зникає (op ${c100.toFixed(2)})`);

    await setHold(0.0);
    const oback = await page.evaluate(()=>+getComputedStyle(document.querySelector('.bg-b')).opacity);
    oback < 0.1 ? ok('телепорт hold1→0: bg-b знову ~0 (стан коректний)') : bad(`телепорт: bg-b=${oback.toFixed(2)}`);
  }

  if(ATOM==='scrub-carousel-2slide'){
    await setHold(0.1);
    const s10 = await page.evaluate(()=>({h:document.querySelector('.heading').getBoundingClientRect().top, c:document.querySelector('.card').getBoundingClientRect().top, sa:+getComputedStyle(document.querySelector('.slide-a')).opacity, sb:+getComputedStyle(document.querySelector('.slide-b')).opacity, ca:+getComputedStyle(document.querySelector('.cap-a')).opacity, b0:getComputedStyle(document.querySelector('.bar-0')).backgroundColor, b1:getComputedStyle(document.querySelector('.bar-1')).backgroundColor}));
    await setHold(0.9);
    const s90 = await page.evaluate(()=>({h:document.querySelector('.heading').getBoundingClientRect().top, c:document.querySelector('.card').getBoundingClientRect().top, sa:+getComputedStyle(document.querySelector('.slide-a')).opacity, sb:+getComputedStyle(document.querySelector('.slide-b')).opacity, ca:+getComputedStyle(document.querySelector('.cap-a')).opacity, cb:+getComputedStyle(document.querySelector('.cap-b')).opacity, b0:getComputedStyle(document.querySelector('.bar-0')).backgroundColor, b1:getComputedStyle(document.querySelector('.bar-1')).backgroundColor}));

    Math.abs(s10.h-s90.h)<2 ? ok(`heading НЕ рухається (Δ${Math.abs(s10.h-s90.h).toFixed(1)}px — pinned поза карткою)`) : bad(`heading рухається (Δ${Math.abs(s10.h-s90.h).toFixed(1)}px)`);
    Math.abs(s10.c-s90.c)<2 ? ok(`card-mask НЕ рухається (Δ${Math.abs(s10.c-s90.c).toFixed(1)}px)`) : bad(`card рухається (Δ${Math.abs(s10.c-s90.c).toFixed(1)}px)`);
    (s10.sa>0.95 && s10.sb<0.05) ? ok(`hold0.1: slide-a видимий (${s10.sa.toFixed(2)}), slide-b схований (${s10.sb.toFixed(2)})`) : bad(`hold0.1: слайди не в старт-стані (a=${s10.sa.toFixed(2)} b=${s10.sb.toFixed(2)})`);
    (s90.sb>0.95 && s90.sa<0.05) ? ok(`hold0.9: перехрест — slide-b видимий (${s90.sb.toFixed(2)}), slide-a схований (${s90.sa.toFixed(2)})`) : bad(`hold0.9: нема перехресту (a=${s90.sa.toFixed(2)} b=${s90.sb.toFixed(2)})`);
    // caption синхронно зі слайдом
    (Math.abs(s10.ca-s10.sa)<0.1 && Math.abs(s90.cb-s90.sb)<0.1) ? ok('caption синхронно зі слайдом (op трекає)') : bad(`caption не синхронно (ca=${s10.ca.toFixed(2)} vs sa=${s10.sa.toFixed(2)})`);
    // progress-bars свапаються
    (s10.b0!==s10.b1 && s90.b0!==s90.b1 && s10.b0!==s90.b0) ? ok('progress-bars: активний свапається на переході') : bad('progress-bars: не свапаються');

    // реверсивність: телепорт 0.9→0.15 повертає slide-a
    await setHold(0.15);
    const rev = await page.evaluate(()=>+getComputedStyle(document.querySelector('.slide-a')).opacity);
    rev>0.9 ? ok(`реверсивність: телепорт 0.9→0.15 повернув slide-a (op ${rev.toFixed(2)}) — скраб, не таймер`) : bad(`реверсивність зламана (slide-a op ${rev.toFixed(2)})`);
  }

  if(ATOM==='hotspot-tap-overlay'){
    // 1. база: overlay opacity 0, маркери видимі
    const base = await page.evaluate(()=>{
      const ov=document.getElementById('ov');
      const mks=[].slice.call(document.querySelectorAll('.mk')).map(m=>{const r=m.getBoundingClientRect();return {w:r.width,h:r.height,inView:r.top>=0&&r.left>=0};});
      return { op:+getComputedStyle(ov).opacity, pe:getComputedStyle(ov).pointerEvents, mks };
    });
    (base.op===0 && base.pe==='none') ? ok('база: overlay opacity 0 + pointer-events none') : bad(`база: overlay op=${base.op} pe=${base.pe}`);
    (base.mks.length===2 && base.mks.every(m=>m.w>0&&m.inView)) ? ok(`база: ${base.mks.length} маркери видимі на фото`) : bad('база: маркери відсутні/невидимі');

    const scroll0 = await page.evaluate(()=>window.scrollY);
    // 3. панель top ДО open
    const panelTopClosed = await page.evaluate(()=>document.getElementById('panel').getBoundingClientRect().top);

    // 2. tap marker[0]
    await page.click('.mk[data-key="1"]');
    await page.waitForTimeout(420);
    const open1 = await page.evaluate(()=>({op:+getComputedStyle(document.getElementById('ov')).opacity, txt:document.getElementById('otext').textContent, chip:document.getElementById('chip').textContent, panelTop:document.getElementById('panel').getBoundingClientRect().top, scroll:window.scrollY}));
    open1.op>0.98 ? ok(`tap[1]: overlay opacity→1 (${open1.op.toFixed(2)})`) : bad(`tap[1]: overlay op=${open1.op.toFixed(2)}`);
    (open1.txt && open1.txt.includes('CANTILEVER')) ? ok('tap[1]: панель показала текст ключа 1') : bad('tap[1]: текст ключа 1 відсутній');
    open1.chip==='1' ? ok('tap[1]: чіп == 1') : bad(`tap[1]: чіп=${open1.chip}`);
    // 3. панель НЕ з'їжджає (top однаковий closed vs open — лише opacity)
    Math.abs(panelTopClosed - open1.panelTop) < 2 ? ok(`панель НЕ з'їжджає (top Δ${Math.abs(panelTopClosed-open1.panelTop).toFixed(1)}px — лише opacity)`) : bad(`панель з'їжджає (Δ${Math.abs(panelTopClosed-open1.panelTop).toFixed(1)}px)`);
    // 4. scroll-preserve
    open1.scroll===scroll0 ? ok(`scroll-preserve: scrollY незмінний під open (${scroll0})`) : bad(`scroll-preserve: scrollY змінився ${scroll0}→${open1.scroll}`);

    // 5. close (✕)
    await page.click('#close');
    await page.waitForTimeout(420);
    const closed = await page.evaluate(()=>({op:+getComputedStyle(document.getElementById('ov')).opacity, pe:getComputedStyle(document.getElementById('ov')).pointerEvents, scroll:window.scrollY}));
    closed.op<0.02 ? ok(`close(✕): overlay opacity→0 (${closed.op.toFixed(2)})`) : bad(`close: op=${closed.op.toFixed(2)}`);
    closed.pe==='none' ? ok('close: pointer-events→none після fade') : bad(`close: pe=${closed.pe}`);
    closed.scroll===scroll0 ? ok('scroll-preserve: scrollY незмінний після close') : bad(`scroll: ${closed.scroll}`);

    // 6. marker[1] — інший ключ, інший текст
    await page.click('.mk[data-key="2"]');
    await page.waitForTimeout(420);
    const open2 = await page.evaluate(()=>({txt:document.getElementById('otext').textContent, chip:document.getElementById('chip').textContent}));
    (open2.chip==='2' && open2.txt.includes('TITANIUM')) ? ok('tap[2]: панель свапнула контент по ключу 2') : bad(`tap[2]: контент не свапнувся (chip=${open2.chip})`);
    await page.evaluate(()=>window.__hotspotClose());
  }

  errs.length===0 ? ok('0 console-errors') : bad(`console-errors: ${errs.length} (${errs.slice(0,2).join(' | ')})`);
}

await browser.close();
console.log(fails===0 ? `\n✅ ${ATOM}: ALL PASS\n` : `\n❌ ${ATOM}: ${fails} FAIL\n`);
process.exit(fails===0?0:1);

// ── matrix helpers ──
function matParts(t){ if(!t||t==='none')return null; const m=t.match(/matrix\(([^)]+)\)/); if(m) return m[1].split(',').map(Number); const m3=t.match(/matrix3d\(([^)]+)\)/); if(m3){const a=m3[1].split(',').map(Number);return [a[0],a[1],a[4],a[5],a[12],a[13]];} return null; }
function matY(t){ const p=matParts(t); return p?p[5]:0; }
function matScale(t){ const p=matParts(t); return p?Math.sqrt(p[0]*p[0]+p[1]*p[1]):1; }
