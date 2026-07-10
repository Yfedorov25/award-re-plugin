/* ============================================================
   SPRINGS-MIRROR (трек springs, S1) — дзеркало-стенд home
   ------------------------------------------------------------
   Консервує живий код https://springs.estate/ у
   skills/teardowns/live-archive/springs/ за зразком live-archive/air/:
   - springs-home.html   — СИРИЙ серверний HTML (до JS)
   - springs-global.css, springs-landing.css — всі стилі зі сторінки
   - fonts/*             — ВСІ шрифти, знайдені в CSS (url(...))
   - springs-shared.js, springs-landing.js, … — головні JS-бандли
   - manifest.json       — мапа URL → файл + дата знімка

   Юридично: лише внутрішній навчальний стенд; чужі асети в прод
   не переносяться.

   Запуск:
     PLAYWRIGHT_FROM=/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json \
       node scripts/springs-mirror.mjs
   ============================================================ */
import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join, basename } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dir, '..');
const OUT = join(REPO, 'skills/teardowns/live-archive/springs');
const ORIGIN = 'https://springs.estate';

async function resolveChromium() {
  const { createRequire } = await import('node:module');
  const roots = [process.env.PLAYWRIGHT_FROM,
    '/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json'].filter(Boolean);
  for (const r of roots) {
    try { const req = createRequire(pathToFileURL(r)); const pw = req('playwright');
      if (pw && pw.chromium) return pw.chromium; } catch {}
  }
  try { return (await import('playwright')).chromium; } catch {}
  return null;
}

const chromium = await resolveChromium();
if (!chromium) { console.error('playwright не резолвиться (PLAYWRIGHT_FROM?)'); process.exit(1); }

mkdirSync(join(OUT, 'fonts'), { recursive: true });
const manifest = { at: new Date().toISOString(), origin: ORIGIN, page: '/', files: {} };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

/* 1) сирий серверний HTML — окремим запитом, ЩОБ без JS-мутацій */
const rawResp = await ctx.request.get(ORIGIN + '/');
if (rawResp.status() !== 200) { console.error(`GET / → ${rawResp.status()}`); process.exit(1); }
const rawHtml = await rawResp.text();
writeFileSync(join(OUT, 'springs-home.html'), rawHtml);
manifest.files['/'] = 'springs-home.html';
console.log(`HTML: ${(rawHtml.length / 1024).toFixed(0)} KB → springs-home.html`);

/* 2) прогін сторінки — збираємо CSS і JS відповіді як їх бачить браузер */
const saved = new Map();
page.on('response', async (resp) => {
  try {
    const u = new URL(resp.url());
    if (u.origin !== ORIGIN || resp.status() !== 200) return;
    const p = u.pathname;
    let name = null;
    if (p.endsWith('.css')) name = `springs-${basename(p)}`;
    else if (p.endsWith('.js')) name = `springs-${basename(p)}`;
    if (!name || saved.has(p)) return;
    saved.set(p, name);
    const body = await resp.body();
    writeFileSync(join(OUT, name), body);
    manifest.files[p] = name;
    console.log(`  ${p} (${(body.length / 1024).toFixed(0)} KB) → ${name}`);
  } catch {}
});
await page.goto(ORIGIN + '/', { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
await page.waitForTimeout(3000);

/* 3) шрифти — парсимо ВСІ url(...) з збережених CSS і качаємо кожен */
const { readFileSync, readdirSync } = await import('fs');
const cssFiles = readdirSync(OUT).filter((f) => f.endsWith('.css'));
const fontUrls = new Set();
for (const f of cssFiles) {
  const css = readFileSync(join(OUT, f), 'utf8');
  for (const m of css.matchAll(/url\(["']?([^"')]+\.(?:woff2?|otf|ttf|eot))["']?\)/gi)) {
    let u = m[1];
    if (u.startsWith('data:')) continue;
    if (!u.startsWith('http')) u = new URL(u, ORIGIN + '/assets/stylesheets/').href;
    if (u.startsWith(ORIGIN)) fontUrls.add(u);
  }
}
let fontsOk = 0;
for (const u of fontUrls) {
  const name = basename(new URL(u).pathname);
  try {
    const r = await ctx.request.get(u, { timeout: 20000 });
    if (r.status() !== 200) { console.error(`  ШРИФТ ${name}: HTTP ${r.status()}`); continue; }
    const body = await r.body();
    writeFileSync(join(OUT, 'fonts', name), body);
    manifest.files[new URL(u).pathname] = `fonts/${name}`;
    fontsOk++;
    console.log(`  font ${name} (${(body.length / 1024).toFixed(0)} KB)`);
  } catch (e) { console.error(`  ШРИФТ ${name}: ${e.message}`); }
}

await browser.close();

/* самоперевірки — дзеркало не має брехати мовчки */
const cssCount = cssFiles.length;
const jsCount = readdirSync(OUT).filter((f) => f.endsWith('.js')).length;
const fail = [];
if (rawHtml.length < 100000) fail.push(`HTML підозріло малий: ${rawHtml.length}b`);
if (!/data-barba="container"/.test(rawHtml)) fail.push('немає data-barba="container"');
if (cssCount < 2) fail.push(`CSS файлів ${cssCount} < 2 (чекали global+landing)`);
if (jsCount < 2) fail.push(`JS файлів ${jsCount} < 2 (чекали shared+landing)`);
if (fontsOk < 3) fail.push(`шрифтів ${fontsOk} < 3 (чекали Victor Serif + TT Commons Pro сім'ю)`);
manifest.selfCheck = { htmlBytes: rawHtml.length, cssCount, jsCount, fontsOk, fail };
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));

if (fail.length) { console.error('САМОПЕРЕВІРКА ПРОВАЛЕНА:\n  ' + fail.join('\n  ')); process.exit(1); }
console.log(`OK: html + ${cssCount} css + ${jsCount} js + ${fontsOk} fonts → ${OUT}`);
