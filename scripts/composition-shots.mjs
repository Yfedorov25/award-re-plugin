/* ============================================================
   COMPOSITION-SHOTS (трек springs, S18 deploy) — галерея КОМПОЗИЦІЙ
   ------------------------------------------------------------
   Мета (запит Єгора): зняти КОЖНУ композицію springs-реплікату як
   реальний кадр (desktop + mobile), авто-підписати домінантною секцією,
   щоб зібрати артефакт-галерею «ось так виглядає кожен прийом У КОНТЕКСТІ».

   Драйвить НАШ рендер (serve-skeleton) через ?s=N (поза БЕЗ live-скролу,
   пастка 5), знімає віюпорт, і на кожному кадрі читає з DOM яка секція
   домінує (найбільша площа перетину з віюпортом) → підпис.

   НЕ гейт, НЕ звірка. Просто екстракція кадрів для документації.

   Запуск: node scripts/composition-shots.mjs
     --site springs-home|springs-gallery
     --port 8873
     --vp desktop|mobile
     --out <dir>
   ============================================================ */
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';

/* ---- resolve playwright chromium (same pattern as visual-parity.mjs) ---- */
async function resolveChromium() {
  let chromium;
  const { createRequire } = await import('node:module');
  const reqRoots = [
    process.env.PLAYWRIGHT_FROM,
    '/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json',
  ].filter(Boolean);
  for (const r of reqRoots) {
    try {
      const require = createRequire(pathToFileURL(r));
      const pw = require('playwright');
      if (pw && pw.chromium) { chromium = pw.chromium; break; }
    } catch {}
  }
  if (!chromium) { try { ({ chromium } = await import('playwright')); } catch {} }
  return chromium;
}
const chromium = await resolveChromium();
if (!chromium) { console.error('composition-shots: playwright chromium not resolvable (set PLAYWRIGHT_FROM).'); process.exit(1); }

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const site = arg('--site', 'springs-home');
const port = parseInt(arg('--port', '8873'), 10);
const vp = arg('--vp', 'desktop');
const outDir = arg('--out', join('/private/tmp/comp-shots', site, vp));
mkdirSync(outDir, { recursive: true });

const VP = vp === 'mobile' ? { width: 390, height: 844, isMobile: true } : { width: 1440, height: 900, isMobile: false };

/* рівномірний свіп 0..maxScroll; на кожному кадрі DOM каже яка секція домінує */
const N_SAMPLES = parseInt(arg('--n', '26'), 10);

const shots = [];
const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: VP.width, height: VP.height },
  deviceScaleFactor: 2,
  isMobile: VP.isMobile,
  hasTouch: VP.isMobile,
  userAgent: VP.isMobile
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    : undefined,
});
const page = await ctx.newPage();

/* дізнатись maxScroll із choreo через сторінку */
await page.goto(`http://127.0.0.1:${port}/?s=0`, { waitUntil: 'networkidle' });
const maxScroll = await page.evaluate(() => (window.__CHOREO_MAXSCROLL__ ?? (window.__choreo && window.__choreo.maxScroll) ?? 0));
const MAX = parseInt(arg('--max', ''), 10) || maxScroll || (vp === 'mobile' ? 11737 : 14399);
console.log(`${site}/${vp}: maxScroll=${MAX}, ${N_SAMPLES} кадрів`);

/* яка секція домінує у віюпорті (найбільша видима площа) */
const DOMINANT_FN = () => {
  const vh = window.innerHeight, vw = window.innerWidth;
  let best = null, bestArea = 0;
  const nodes = document.querySelectorAll('[data-sk-section]');
  for (const n of nodes) {
    if (n.offsetParent === null && getComputedStyle(n).display === 'none') continue;
    const r = n.getBoundingClientRect();
    const iw = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
    const ih = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    const area = iw * ih;
    if (area > bestArea) { bestArea = area; best = n.getAttribute('data-sk-section'); }
  }
  return best || 'header';
};

let seenFirst = {}; // перший кадр кожної секції — для галереї беремо саме його

/* MODE: element — доскролити КОЖНУ секцію у в'юпорт напряму (дістає хвіст,
   якого ladder-скрол через ?s=N не досягає: design/map/residences/interiors). */
if (arg('--mode', 'sweep') === 'element') {
  await page.goto(`http://127.0.0.1:${port}/?s=0`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  /* список секцій активного в'юпорта (видимі sk-vp) у DOM-порядку */
  const secList = await page.evaluate((vpName) => {
    const out = [];
    document.querySelectorAll(`.sk-vp-${vpName}[data-sk-section]`).forEach((n) => {
      const id = n.getAttribute('data-sk-section');
      if (getComputedStyle(n).display !== 'none' && !out.includes(id)) out.push(id);
    });
    return out;
  }, vp);
  console.log(`  element-mode: ${secList.length} секцій → ${secList.join(', ')}`);
  let i = 0;
  for (const id of secList) {
    const ok = await page.evaluate((sel) => {
      const n = document.querySelector(`.sk-vp-${sel.vp}[data-sk-section="${sel.id}"]`);
      if (!n) return false;
      n.scrollIntoView({ block: 'center' });
      return true;
    }, { vp, id });
    if (!ok) { console.log(`  [skip ${id}] not found`); continue; }
    await page.waitForTimeout(400);
    const file = `el${String(i).padStart(2, '0')}_${id}.png`;
    await page.screenshot({ path: join(outDir, file) });
    seenFirst[id] = seenFirst[id] || file;
    shots.push({ i, mode: 'element', section: id, file, firstOfSection: true });
    console.log(`  [el ${i}] ${id} → ${file}`);
    i++;
  }
} else {
  for (let i = 0; i < N_SAMPLES; i++) {
    const s = Math.round((MAX * i) / (N_SAMPLES - 1));
    await page.goto(`http://127.0.0.1:${port}/?s=${s}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(350); // дати анімації/шрифтам осісти
    const section = await page.evaluate(DOMINANT_FN);
    const file = `${String(i).padStart(2, '0')}_s${s}_${section}.png`;
    await page.screenshot({ path: join(outDir, file) });
    const firstOfSection = !(section in seenFirst);
    if (firstOfSection) seenFirst[section] = file;
    shots.push({ i, s, section, file, firstOfSection });
    console.log(`  [${i}] s=${s} → ${section}${firstOfSection ? '  ★first' : ''}`);
  }
}

writeFileSync(join(outDir, 'shots.json'), JSON.stringify({ site, vp, maxScroll: MAX, VP, shots, firstOfSection: seenFirst }, null, 2));
console.log(`OK → ${outDir} (${shots.length} кадрів, ${Object.keys(seenFirst).length} унік. секцій)`);
await browser.close();
