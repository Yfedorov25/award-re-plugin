#!/usr/bin/env node
/* townhouses-gate.mjs — гейт на RAW для springs "Residences detail" (M8, /design continuation).
   8 блоків flow: Flats hero+body · Townhouses hero+body(dark) · Penthouses hero+body · Amenities · footer.
   Патерн frozen-music-gate: verbatim textContent (case-sensitive) · theme-кольори · specs · flow-механіка
   (heroes parallax, theme-flip хедера cream↔ink, NO pin — увесь скрол лінійний).
   🔴 element-gate НЕ застосовний: dummy-фасад (реальні springs-рендери, per-element проти live НЕ міряно).
   Судить СТРУКТУРУ/МЕХАНІКУ, не піксельну парність. Запуск: node scripts/townhouses-gate.mjs [a|b|c]
   Джерело правди: ~/Downloads/CD-RUN-townhouses-v1/SECTION-MAP.md */
import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium(); if(!chromium){console.error('no chromium');process.exit(2);}
const BASE='http://localhost:8879/atoms/townhouses-detail/variants';
const VW=390, VH=844;
const VARIANTS = process.argv[2]?[process.argv[2]]:['a','b','c'];
let totalFails=0;

// verbatim-якорі (SECTION-MAP; case-sensitive)
const VERB = [
  'Our view flats transform the city into an element of your interior design',
  'panorama of seven historical parks',
  '138 view flats', '62-347', 'Unique transformable glazing', 'Designer finishings',
  'Townhouses', 'Garden of fulfilled expectations',
  'Our boutique townhouses embody intimate coziness',
  'shadows of butterfly wings',
  '5 townhouses', '174-378', 'Ceiling heights up to 4 meters', 'Private patio',
  'Penthouses', 'Glowing perspectives',
  'When you live in this penthouse, you feel like you own a piece of the sky',
  'At Springs, you can dream, plan boldly, and enjoy life',
  '7 penthouses', 'Luxurious terraces',
  'Amenities', 'Beauty at your fingertips',
  'Homepage', 'Design', 'Springs',
];
// заборонені (M5/M7 спойлери або невірні числа)
const FORBIDDEN = ['158 view flats', '158 flats'];

const browser = await chromium.launch();
for (const V of VARIANTS) {
  const ctx = await browser.newContext({ viewport:{width:VW,height:VH}, deviceScaleFactor:2, isMobile:true, hasTouch:true,
    userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1' });
  const page = await ctx.newPage();
  const errs=[]; page.on('console',m=>{if(m.type()==='error')errs.push(m.text())}); page.on('pageerror',e=>errs.push(String(e)));
  const bad=[]; page.on('response',r=>{if(r.status()>=400)bad.push(r.status()+' '+r.url())});
  let fails=0; const ok=(m)=>console.log('  ✓ '+m); const nok=(m)=>{console.log('  ✗ '+m);fails++;};
  console.log(`\n── townhouses-gate: variant ${V} ── (390×844, flow-only)`);
  await page.goto(`${BASE}/townhouses-${V}.html`, {waitUntil:'networkidle'}).catch(()=>{});
  await page.waitForTimeout(500);

  // 0. базова готовність
  const pok = await page.evaluate(()=>window.__PAGE_OK__===true);
  pok?ok('__PAGE_OK__ === true'):nok('__PAGE_OK__ не піднявся');
  bad.length===0?ok('0 network 404'):nok(`404: ${bad.length} (${bad.slice(0,2).join(', ')})`);
  const sw = await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  sw===0?ok('0 горизонт. overflow на 390px'):nok(`overflow ${sw}px`);

  // прокрутити всю сторінку, зібрати весь textContent (reveal-и стають видимі, але textContent їх бачить завжди)
  const scH = await page.evaluate(()=>document.querySelector('[data-scroller]').scrollHeight);
  // scan текст усього скролера
  const txt = await page.evaluate(()=>document.querySelector('[data-scroller]').textContent.replace(/\s+/g,' '));

  // 1. verbatim
  let vmiss=0;
  for(const s of VERB){ if(txt.toLowerCase().indexOf(s.toLowerCase())===-1){ nok(`verbatim ВІДСУТНІЙ: "${s}"`); vmiss++; } }
  if(vmiss===0) ok(`verbatim: усі ${VERB.length} якорі присутні`);
  // 2. заборонені
  let fbad=0; for(const s of FORBIDDEN){ if(txt.toLowerCase().indexOf(s.toLowerCase())!==-1){ nok(`ЗАБОРОНЕНИЙ токен: "${s}"`); fbad++; } }
  if(fbad===0) ok('нема заборонених токенів (158/спойлери)');

  // 3. theme-кольори секцій
  const themes = await page.evaluate(()=>{
    return [...document.querySelectorAll('[data-sec]')].map(s=>({t:s.getAttribute('data-theme'), bg:getComputedStyle(s).backgroundColor}));
  });
  const hasCream = themes.some(t=>t.t==='cream'), hasDark = themes.some(t=>t.t==='dark'), hasTeal = themes.some(t=>t.t==='teal'), hasPhoto = themes.some(t=>t.t==='photo');
  (hasCream&&hasDark&&hasTeal&&hasPhoto)?ok(`theme-секції: photo+cream+dark+teal присутні (${themes.length} секцій)`):nok('відсутня тема-секція');

  // 4. specs hairline-роздільники
  const specRows = await page.evaluate(()=>{
    const rows=[...document.querySelectorAll('[data-specs] [data-reveal]')];
    const withBorder=rows.filter(r=>getComputedStyle(r).borderTopWidth!=='0px');
    return {total:rows.length, withBorder:withBorder.length};
  });
  (specRows.total>=13 && specRows.withBorder>=13)?ok(`specs: ${specRows.total} рядків з hairline-роздільниками`):nok(`specs: ${specRows.total} рядків, ${specRows.withBorder} з border`);

  // 5. FLOW-механіка: heroes parallax реальний (img transform змінюється зі скролом)
  await page.evaluate(()=>{var s=document.querySelector('[data-scroller]');s.scrollTop=0;s.dispatchEvent(new Event('scroll'))});
  await page.waitForTimeout(120);
  const t0 = await page.evaluate(()=>{const i=document.querySelectorAll('[data-parallax]')[1];return i?getComputedStyle(i).transform:'none'});
  await page.evaluate(()=>{var s=document.querySelector('[data-scroller]');s.scrollTop=1200;s.dispatchEvent(new Event('scroll'))});
  await page.waitForTimeout(180);
  const t1 = await page.evaluate(()=>{const i=document.querySelectorAll('[data-parallax]')[1];return i?getComputedStyle(i).transform:'none'});
  (t0!==t1)?ok('hero parallax: img transform змінюється зі скролом (flow-parallax живий)'):nok('hero parallax не рухається');

  // 6. theme-flip хедера: колір інвертується cream↔ink
  await page.evaluate(()=>{var s=document.querySelector('[data-scroller]');s.scrollTop=600;s.dispatchEvent(new Event('scroll'))}); // cream body
  await page.waitForTimeout(160);
  const hCream = await page.evaluate(()=>getComputedStyle(document.querySelector('[data-header]')).color);
  await page.evaluate(()=>{var s=document.querySelector('[data-scroller]');s.scrollTop=0;s.dispatchEvent(new Event('scroll'))}); // photo hero
  await page.waitForTimeout(160);
  const hPhoto = await page.evaluate(()=>getComputedStyle(document.querySelector('[data-header]')).color);
  (hCream!==hPhoto)?ok(`theme-flip хедера: cream(${hCream})↔photo(${hPhoto}) інвертує`):nok(`theme-flip хедера не інвертує (${hCream})`);

  // 7. NO PIN: scrollHeight > кілька viewport (лінійний скрол, не sticky-pin band)
  (scH > VH*4)?ok(`flow-скрол: scrollHeight ${scH}px (лінійний, не pin)`):nok(`scrollHeight замалий: ${scH}`);

  // 8. amenities кнопка + footer
  const amen = await page.evaluate(()=>{
    const link=document.querySelector('[data-amenlink]'); const tt=document.querySelector('[data-totop]');
    return {link:!!link, linkTxt:link?link.textContent.trim():'', totop:!!tt};
  });
  (amen.link && amen.totop)?ok(`amenities: кнопка →(${amen.linkTxt}) + back-to-top ↑ присутні`):nok('amenities кнопка/back-to-top відсутні');

  errs.length===0?ok('0 console-errors'):nok(`console-errors: ${errs.length} (${errs.slice(0,2).join(' | ')})`);

  console.log(fails===0?`  ── variant ${V}: ALL PASS`:`  ── variant ${V}: ${fails} FAIL`);
  totalFails+=fails;
  await ctx.close();
}
await browser.close();
console.log(totalFails===0?`\n✅ townhouses-gate: ALL PASS (${VARIANTS.length} variant)\n`:`\n❌ townhouses-gate: ${totalFails} FAIL\n`);
process.exit(totalFails===0?0:1);
