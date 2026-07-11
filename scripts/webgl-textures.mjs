/* ============================================================
   WEBGL-TEXTURES EXTRACTOR (трек springs, S9a) — справжні текстури канвасів
   ------------------------------------------------------------
   Розкопка S9a: xs-асет ≠ desktop-композиція (жінка wellness: xs —
   вузький портрет, desktop-канвас — ширша сцена; affine-фіт принципово
   наближення, MAE і градієнтна метрика обидві давали хибні оптимуми).
   Live WebGL вантажить ВЛАСНІ шари в просторі канваса 1:1:
     /assets/webgl/textures/<sec>/bg.avif        — задник (2880×1800 = 2× канваса)
     /assets/images/.../color-unc@md.avif        — колірний шар (жінка)
     /assets/webgl/textures/<sec>/alpha-*.avif   — альфа-маска шару
     depth-N, burash — карти зміщення параллакса (статиці не потрібні)
   Реєстрація не потрібна: текстурний простір = бокс канваса (cover).

   Метод: сніфер network-запитів живого при CDP-жестах через усі секції
   (пастка 5: тільки Input.synthesizeScrollGesture mouse). Класифікація
   шарів за іменами live (bg/color/alpha — семантика авторів сайту).

   Запуск: PLAYWRIGHT_FROM=... node scripts/webgl-textures.mjs springs-home
   Вихід: extraction/<site>/webgl-textures.json
   ============================================================ */
import { writeFileSync } from 'fs';
import { join } from 'path';
import { SITES, resolveChromium } from './token-extractor.mjs';

const siteName = process.argv[2];
const site = SITES[siteName];
if (!site) { console.error('вкажи сайт'); process.exit(1); }
const argOf = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? parseInt(process.argv[i + 1], 10) : d; };
const GESTURES = argOf('--gestures', 40);

const chromium = await resolveChromium();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const urls = new Set();
page.on('request', (r) => {
  const u = r.url();
  if (/\.(webp|avif|jpe?g|png|ktx2?|basis)(\?|$)/i.test(u) && u.startsWith(site.liveOrigin)) {
    urls.add(u.slice(site.liveOrigin.length));
  }
});
await page.goto(site.liveOrigin + site.livePath, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => {
  const p = document.querySelector('.js-preloader');
  return !p || getComputedStyle(p).display === 'none' || p.offsetParent === null;
}, { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(2500);
const cdp = await page.context().newCDPSession(page);
for (let i = 0; i < GESTURES; i++) {
  await cdp.send('Input.synthesizeScrollGesture', {
    x: 720, y: 450, xDistance: 0, yDistance: -900, speed: 3000, gestureSourceType: 'mouse',
  });
  await page.waitForTimeout(700);
}
await page.waitForTimeout(3000);
await browser.close();

/* класифікація: секція = ім'я папки webgl/textures/<sec>/ або landing/N.<sec>/ */
const sections = {};
const secOf = (u) => {
  let m = u.match(/\/webgl\/textures\/([a-z-]+)\//i);
  if (m) return m[1];
  m = u.match(/\/landing\/\d+\.([a-z-]+)\//i);
  return m ? m[1] : null;
};
for (const u of urls) {
  const sec = secOf(u);
  if (!sec) continue;
  const s = (sections[sec] = sections[sec] || { all: [] });
  s.all.push(u);
  const base = u.split('/').pop().toLowerCase();
  if (/^bg\./.test(base)) s.bg = u;
  else if (/^color/.test(base)) s.color = u;
  else if (/^alpha/.test(base)) s.alpha = u;
}
/* лишаємо лише секції зі справжніми webgl-текстурами */
const out = Object.fromEntries(Object.entries(sections)
  .filter(([, s]) => s.all.some((u) => u.includes('/webgl/textures/'))));

/* самоперевірка: екстрактор не бреше мовчки */
const total = Object.values(out).reduce((n, s) => n + s.all.length, 0);
if (!total) { console.error('жодної webgl-текстури не зловлено — жести не дійшли до канвас-секцій?'); process.exit(1); }
const outPath = join(site.outDir, 'webgl-textures.json');
writeFileSync(outPath, JSON.stringify({
  at: new Date().toISOString(), site: siteName, origin: site.liveOrigin,
  method: `CDP-жести ×${GESTURES}, сніф network image-запитів; класифікація за live-іменами (bg/color/alpha)`,
  sections: out,
}, null, 1));
for (const [sec, s] of Object.entries(out)) {
  console.log(`  [${sec}] webgl-текстур: ${s.all.length} · bg=${s.bg ? '✓' : '—'} color=${s.color ? '✓' : '—'} alpha=${s.alpha ? '✓' : '—'}`);
}
console.log(`OK → ${outPath}`);
