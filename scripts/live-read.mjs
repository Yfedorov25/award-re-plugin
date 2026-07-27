// live-read.mjs — читалка живого сайту на віртуальному скролі (S56, екзамен ПРОЙДЕНО).
//
// Що це. Керований мобільний браузер робить СПРАВЖНІ тач-жести (CDP synthesizeScrollGesture)
// і читає числа хореографії прямо з DOM покадрово: rect-серії зафіксованих вузлів,
// object-fit/position, трансформи предків, стек elementsFromPoint. Телефонне відео Єгора
// лишається суддею для ока; читалка забирає витягування чисел.
//
// ЕКЗАМЕН НА ВІДОМІЙ ВІДПОВІДІ (S56, обидва зелені):
//   hero:    зум-аут ×2.00 (прийнято оком ×1.96, діф 2% = квантизація відео), точка сходу
//            40.0% висоти контенту (прийнято 39.9%, стабільна 265-270px на ВСІХ парах),
//            насичення і лінійне зчеплення з панеллю — читалка видала все САМА;
//            плюс справжня параметризація, якої відео не бачило: width 250vw→125vw,
//            асет 908×908, cover, object-position 50% 100%.
//   parking: PIN (bbox медіа застиг [0,0,1131,623] поки обгортка ui-dark їде) +
//            ZOOM-OUT (w 1131→390 = ×2.9, якір лівий край; у сценових координатах
//            sL=0, sR 0.345→1.0).
//
// 🔴 ПАСТКИ (усі спіймані на екзамені, не повторювати):
//   1. scrollY завжди 0 (віртуальний скрол) — судити ЛИШЕ по вмісту і числах;
//   2. вʼюпорт МАЄ мімікрувати запис ока: iPhone з видимим URL-баром ≈ 390×664.
//      На 390×844 закон hero ІНШИЙ (×1.65, драйвер object-fit:cover перемикається
//      з ширини на висоту посередині) — це не баг читалки, це viewport-залежність
//      справжнього закону через cover;
//   3. заголовки у virtual-scroll розкладці мають фантомні rect top=0 — «доїхали?»
//      судити по src видимої картинки (media/<page>/<N.name> у шляху), не по rect;
//   4. навігація недетермінована (снап може зʼїсти жест) — антизастрягання: якщо src
//      не міняється 5+ свайпів, один довгий жест;
//   5. текстовий walk-up від elementFromPoint у секціях без тексту тягне сторінковий
//      wrapper — для «хто на екрані» брати ПОВНИЙ стек elementsFromPoint;
//   6. рух у «піні» може бути СУСІДНЬОЮ секцією (stack+cover: terraces зʼїжджає над
//      пінованим parking) — перш ніж писати пан у закон, дивитись стек.
//
// Запуск:
//   node scripts/live-read.mjs --url https://springs.estate/infrastructure \
//     --section 9.parking --steps 16 --dy 70 [--out out.json] [--shots dir] [--vh 664]
//   --section '' = перша секція (без доїзду). Виходить JSON-серія на stdout або в --out.
// Це ОПИСУВАЧ (як atom-probe): підписних порогів не має, закони з нього виводяться
// окремо і звіряються оком/гейтами.

import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';

const req = createRequire(pathToFileURL('/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json'));
const { chromium } = req('playwright');

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const URL_ = arg('url', 'https://springs.estate/infrastructure');
const SECTION = arg('section', '');
const STEPS = +arg('steps', 16);
const DY = +arg('dy', 70);
const OUT = arg('out', null);
const SHOTS = arg('shots', null);
const VH = +arg('vh', 664); // iPhone з видимим URL-баром; НЕ міняти без причини (пастка 2)

const b = await chromium.launch({ headless: true });
const ctx = await b.newContext({ viewport: { width: 390, height: VH }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Mobile/15E148 Safari/604.1' });
const page = await ctx.newPage();
await page.goto(URL_, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(3500);
const cdp = await ctx.newCDPSession(page);
const sw = (dy, speed = 700) => cdp.send('Input.synthesizeScrollGesture', { x: 195, y: 400, xDistance: 0, yDistance: dy, gestureSourceType: 'touch', speed });

const visSrc = () => page.evaluate(() => {
  let best = null, area = 0;
  for (const el of document.querySelectorAll('img')) {
    const r = el.getBoundingClientRect();
    if (r.top < 500 && r.bottom > 150 && r.width > 200 && r.width * r.height > area) { area = r.width * r.height; best = el; }
  }
  return best ? (best.currentSrc || best.src || '') : '';
});

// доїзд до секції за src-патерном (пастки 3, 4)
let rode = 0;
if (SECTION) {
  let prev = '', same = 0, ok = false;
  for (let i = 1; i <= 80; i++) {
    await sw(-450); await page.waitForTimeout(650);
    const s = await visSrc();
    if (s.includes(SECTION)) { rode = i; ok = true; break; }
    same = s === prev ? same + 1 : 0; prev = s;
    if (same >= 5) { await sw(-900, 900); await page.waitForTimeout(900); same = 0; }
  }
  if (!ok) { console.error(`НЕ ДОЇХАВ до ${SECTION} за 80 свайпів`); await b.close(); process.exit(1); }
  console.error(`доїхав до ${SECTION} за ${rode} свайпів`);
}

// зафіксувати вузли: найбільше видиме медіа (+ панель з непрозорим фоном, якщо є текст)
const picked = await page.evaluate((section) => {
  let media = null, area = 0;
  for (const el of document.querySelectorAll('img, video')) {
    const r = el.getBoundingClientRect();
    const okSec = !section || ((el.currentSrc || el.src || '').includes(section));
    if (okSec && r.top < 500 && r.bottom > 0 && r.width > 150 && r.width * r.height > area) { area = r.width * r.height; media = el; }
  }
  window.__lr = { media };
  if (!media) return null;
  const cs = getComputedStyle(media);
  return { tag: media.tagName, nW: media.naturalWidth || 0, nH: media.naturalHeight || 0,
    fit: cs.objectFit, pos: cs.objectPosition, src: (media.currentSrc || media.src || '').split('/').slice(-2).join('/') };
}, SECTION);
console.error('МЕДІА:', JSON.stringify(picked));

const snap = () => page.evaluate(() => {
  const { media } = window.__lr;
  const rect = el => { const x = el.getBoundingClientRect(); return [+x.top.toFixed(2), +x.left.toFixed(2), +x.width.toFixed(2), +x.height.toFixed(2)]; };
  const anc = [];
  if (media && media.isConnected)
    for (let p = media, i = 0; p && i < 6; p = p.parentElement, i++) {
      const t = p.style.transform || getComputedStyle(p).transform;
      if (t && t !== 'none') anc.push((p === media ? 'self' : 'up' + i) + ':' + t);
    }
  const stack = document.elementsFromPoint(195, 330).slice(0, 6).map(el => {
    const r = el.getBoundingClientRect();
    return el.tagName + '.' + String(el.className || '').split(' ')[0].slice(0, 24) + '[' + r.top.toFixed(0) + ',' + r.left.toFixed(0) + ',' + r.width.toFixed(0) + ',' + r.height.toFixed(0) + ']';
  });
  return { m: media && media.isConnected ? rect(media) : null,
    op: media && media.isConnected ? getComputedStyle(media).objectPosition : null,
    tf: anc.join(' '), stack };
});

const rows = [];
for (let i = 0; i <= STEPS; i++) {
  const s = await snap(); rows.push({ i, ...s });
  console.error(i, s.m ? `[${s.m.join(', ')}] op=${s.op} ${s.tf}` : 'медіа відчепилось');
  if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: `${SHOTS}/s${String(i).padStart(2, '0')}.png` }); }
  if (i < STEPS) { await sw(-DY, 400); await page.waitForTimeout(900); }
}
const result = { url: URL_, section: SECTION, viewport: { w: 390, h: VH }, rodeSwipes: rode, media: picked, rows };
if (OUT) fs.writeFileSync(OUT, JSON.stringify(result, null, 1)); else console.log(JSON.stringify(result, null, 1));
await b.close();
