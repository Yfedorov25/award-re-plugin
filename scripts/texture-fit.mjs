/* ============================================================
   TEXTURE-FIT EXTRACTOR (трек springs, S9a) — фреймінг канвас-текстур
   ------------------------------------------------------------
   Проблема: underlay з асетом мобільного варіанта (texture-map) МАЄ
   правильний вміст, але фреймінг канваса live ≠ center/cover (портретний
   xs-асет зумить обличчя 2×: диф 15.4→41.7).

   Метод (registration, числа З ДАНИХ): live-шот пози, де канвас займає
   вʼюпорт (плато wellness s45xx), звіряється з асетом перебором
   scale × (ox, oy): грубий свіп → уточнення; метрика = середня абсолютна
   різниця по сірому на даунсемплі (текстові оверлеї ~10% площі — MAE
   стійка). Вихід: fit у CSS-термінах underlay (background-size/position
   у % відносно бокса канваса).

   Запуск: PLAYWRIGHT_FROM=... node scripts/texture-fit.mjs springs-home \
     --section wellness --shot desktop-s4539.png [--origin http://localhost:8873]
   Пише fit у extraction/<site>/texture-map.json (секції --section).
   ============================================================ */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { resolveChromium, SITES } from './token-extractor.mjs';

const siteName = process.argv[2];
const site = SITES[siteName];
if (!site) { console.error('вкажи сайт'); process.exit(1); }
const argOf = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const secId = argOf('--section', 'wellness');
const shotName = argOf('--shot', null);
const origin = argOf('--origin', 'http://localhost:8873');
if (!shotName) { console.error('вкажи --shot <live png>'); process.exit(1); }

const tmPath = join(site.outDir, 'texture-map.json');
const tm = JSON.parse(readFileSync(tmPath, 'utf8'));
const tx = tm.textures[secId];
if (!tx) { console.error(`нема секції ${secId} у texture-map`); process.exit(1); }
const shotPath = join(site.outDir, 'visual', 'live', shotName);
const shotB64 = readFileSync(shotPath).toString('base64');
/* асет БЕЗ мережі/CORS: файл проксі-кеша (ключ = шлях з / → _) */
const cacheKey = tx.asset.replace(/\//g, '_');
const assetPath = join(site.outDir, '.asset-cache', cacheKey);
const assetB64 = readFileSync(assetPath).toString('base64');
const assetMime = tx.asset.endsWith('.avif') ? 'image/avif' : (tx.asset.endsWith('.png') ? 'image/png' : 'image/webp');

const chromium = await resolveChromium();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 200, height: 200 } });
const result = await page.evaluate(async ({ shotB64, assetB64, assetMime }) => {
  const loadImg = (src) => new Promise((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });
  const shot = await loadImg('data:image/png;base64,' + shotB64);
  const asset = await loadImg('data:' + assetMime + ';base64,' + assetB64);
  const VW = shot.naturalWidth, VH = shot.naturalHeight;
  /* даунсемпл-сітка (256: градієнтам треба більше деталі, ніж MAE) */
  const GW = 256, GH = Math.round(GW * VH / VW);
  const gray = (ctx) => {
    const d = ctx.getImageData(0, 0, GW, GH).data;
    const g = new Float32Array(GW * GH);
    for (let i = 0; i < GW * GH; i++) g[i] = (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.6 + d[i * 4 + 2] * 0.1);
    return g;
  };
  /* ГРАДІЄНТНА метрика (S9a): MAE по сірому на темному блюрі давала
     хибний оптимум (scale≈cover зумив обличчя 2×) — форма живе у КРАЯХ.
     |dx|+|dy| і нормована кореляція: стійко до глобальної яскравості/
     тінту; «нічого не намалювати» = нуль країв проти країв шота = кара. */
  const gradMag = (g) => {
    const m = new Float32Array(GW * GH);
    for (let y = 1; y < GH - 1; y++) {
      for (let x = 1; x < GW - 1; x++) {
        const i = y * GW + x;
        m[i] = Math.abs(g[i + 1] - g[i - 1]) + Math.abs(g[i + GW] - g[i - GW]);
      }
    }
    return m;
  };
  const cnvS = new OffscreenCanvas(GW, GH);
  const cS = cnvS.getContext('2d', { willReadFrequently: true });
  cS.drawImage(shot, 0, 0, GW, GH);
  const mShot = gradMag(gray(cS));
  const cnvA = new OffscreenCanvas(GW, GH);
  const cA = cnvA.getContext('2d', { willReadFrequently: true });
  const aw = asset.naturalWidth, ah = asset.naturalHeight;
  const evalFit = (scale, ox, oy) => {
    /* scale: px асета → px вʼюпорта; (ox,oy) — зсув лівого верху асета
       у вʼюпорт-px. Малюємо в даунсемплі. err = 100·(1 − NCC градієнтів). */
    cA.fillStyle = '#000'; cA.fillRect(0, 0, GW, GH);
    const k = GW / VW;
    cA.drawImage(asset, ox * k, oy * k, aw * scale * k, ah * scale * k);
    const mA = gradMag(gray(cA));
    let ab = 0, aa = 0, bb = 0;
    for (let i = 0; i < GW * GH; i++) {
      ab += mA[i] * mShot[i]; aa += mA[i] * mA[i]; bb += mShot[i] * mShot[i];
    }
    const ncc = ab / (Math.sqrt(aa * bb) || 1);
    return 100 * (1 - ncc);
  };
  /* грубий свіп: scale так, щоб асет покривав від 60% висоти до 2.4× */
  let best = { err: 1e9 };
  const sMin = (VH * 0.6) / ah, sMax = (VH * 2.4) / ah;
  for (let s = sMin; s <= sMax; s *= 1.12) {
    const w = aw * s, h = ah * s;
    for (let ox = Math.min(0, VW - w); ox <= Math.max(0, VW - w) + 1; ox += Math.max(40, (Math.abs(VW - w) + 80) / 8)) {
      for (let oy = Math.min(0, VH - h); oy <= Math.max(0, VH - h) + 1; oy += Math.max(40, (Math.abs(VH - h) + 80) / 8)) {
        const err = evalFit(s, ox, oy);
        if (err < best.err) best = { err, s, ox, oy };
      }
    }
  }
  /* уточнення: 2 раунди локального пошуку */
  for (const [ds, dpx] of [[0.06, 30], [0.02, 10]]) {
    let improved = true;
    while (improved) {
      improved = false;
      for (const [s2, ox2, oy2] of [
        [best.s * (1 + ds), best.ox, best.oy], [best.s * (1 - ds), best.ox, best.oy],
        [best.s, best.ox + dpx, best.oy], [best.s, best.ox - dpx, best.oy],
        [best.s, best.ox, best.oy + dpx], [best.s, best.ox, best.oy - dpx],
      ]) {
        const err = evalFit(s2, ox2, oy2);
        if (err < best.err) { best = { err, s: s2, ox: ox2, oy: oy2 }; improved = true; }
      }
    }
  }
  return { ...best, VW, VH, aw, ah };
}, { shotB64, assetB64, assetMime });
await browser.close();

const { err, s, ox, oy, VW, VH, aw, ah } = result;
console.log(`fit: scale=${s.toFixed(4)} ox=${Math.round(ox)} oy=${Math.round(oy)} err=${err.toFixed(1)} (вʼюпорт ${VW}x${VH}, асет ${aw}x${ah})`);
/* CSS для underlay (бокс = канвас ≈ вʼюпорт на позі-якорі):
   background-size у px відносно бокса, position = зсув */
tx.fit = {
  sizePx: [Math.round(aw * s), Math.round(ah * s)],
  posPx: [Math.round(ox), Math.round(oy)],
  anchor: { shot: shotName, viewport: [VW, VH] },
  err: Math.round(err * 10) / 10,
};
writeFileSync(tmPath, JSON.stringify(tm, null, 1));
const fail = err > 45 ? `err ${err.toFixed(1)} > 45 — фіт непевний` : null;
console.log(`OK → ${tmPath}${fail ? ' · САМОПЕРЕВІРКА: ' + fail : ''}`);
process.exit(fail ? 1 : 0);
