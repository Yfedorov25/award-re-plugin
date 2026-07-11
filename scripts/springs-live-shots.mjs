/* ============================================================
   SPRINGS-LIVE-SHOTS (S5) — кадри ЖИВОГО на осілих снап-станах
   ------------------------------------------------------------
   Desktop: CDP-жести (той самий драйвер, що animation-map) —
   на кожному НОВОМУ осілому стані скріншот; сторінковий s міряємо
   пробою-одометром (корінь intro — чистий потік, доведено сценою).
   Інтро-стани hero (s=0) — кадр на кожному осілому input.
   Mobile: чесний нативний скрол — пози через window.scrollTo
   (мобільні криві статичні по позі, доведено картами).

   Вихід: extraction/<site>/visual/live/<vp>-s<NNN>.png (+ -intro<I>)
          + shots-manifest.json (список поз для диф-прогону).

   Запуск: PLAYWRIGHT_FROM=... node scripts/springs-live-shots.mjs springs-home
     [--vp both] [--max-desktop 40]
   ============================================================ */
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { resolveChromium, SITES, VIEWPORTS, MOBILE_UA } from './token-extractor.mjs';

const siteName = process.argv[2];
const site = SITES[siteName];
if (!site) { console.error(`вкажи: node scripts/springs-live-shots.mjs <${Object.keys(SITES).join('|')}>`); process.exit(1); }
const argOf = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const vpArg = argOf('--vp', 'both');
const MAX_D = parseInt(argOf('--max-desktop', '40'), 10);
const outDir = join(site.outDir, 'visual', 'live');
mkdirSync(outDir, { recursive: true });

const chromium = await resolveChromium();
if (!chromium) { console.error('playwright не резолвиться'); process.exit(1); }
const browser = await chromium.launch();
const manifest = { at: new Date().toISOString(), site: siteName, poses: [] };

/* сторінковий s: зсув кореня intro (чистий потік) */
const PAGE_S_FN = () => {
  const el = [...document.querySelectorAll('.l-intro')].find((e) => {
    const r = e.getBoundingClientRect();
    return r.width > 1 && getComputedStyle(e).display !== 'none';
  });
  if (!el) return null;
  if (window.__T0__ === undefined) window.__T0__ = el.getBoundingClientRect().top;
  return Math.round((window.__T0__ - el.getBoundingClientRect().top) * 10) / 10;
};

async function openLive(vpName) {
  const vp = VIEWPORTS[vpName];
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1,
    userAgent: vp.mobile ? MOBILE_UA : undefined, hasTouch: vp.mobile, isMobile: vp.mobile,
  });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await page.goto(site.liveOrigin + site.livePath, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  for (const sel of ['.js-cookie-consent-accept', 'button:has-text("ACCEPT")']) {
    try { await page.click(sel, { timeout: 1200 }); break; } catch {}
  }
  await page.waitForTimeout(800);
  await page.evaluate(PAGE_S_FN); /* ініціалізує __T0__ */
  return { ctx, page, cdp, vp };
}

async function settle(page, maxMs = 3000) {
  let last = null, stable = 0;
  const t0 = Date.now();
  while (Date.now() - t0 < maxMs) {
    await page.waitForTimeout(150);
    const s = await page.evaluate(PAGE_S_FN);
    if (last !== null && Math.abs(s - last) < 0.5) { stable++; if (stable >= 3) return s; }
    else stable = 0;
    last = s;
  }
  return last;
}

async function shootDesktop() {
  const { ctx, page, cdp, vp } = await openLive('desktop');
  const seen = new Set();
  let input = 0, dist = 150, introShots = 0, stall = 0;
  /* стартовий кадр (інтро-стан 0) */
  await page.screenshot({ path: join(outDir, 'desktop-intro0.png') });
  manifest.poses.push({ vp: 'desktop', kind: 'intro', value: 0, file: 'desktop-intro0.png' });
  for (let g = 0; g < MAX_D; g++) {
    await cdp.send('Input.synthesizeScrollGesture', {
      x: Math.round(vp.width / 2), y: Math.round(vp.height / 2),
      yDistance: -dist, speed: 1200, gestureSourceType: 'mouse',
    });
    input += dist;
    const s = await settle(page);
    if (s === null) break;
    if (Math.abs(s) < 2) {
      /* інтро-фаза: кадр на кожному осілому input (до 4) */
      if (introShots < 4) {
        const f = `desktop-intro${input}.png`;
        await page.screenshot({ path: join(outDir, f) });
        manifest.poses.push({ vp: 'desktop', kind: 'intro', value: input, file: f });
        introShots++;
      }
      dist = Math.min(dist * 2, 600);
      continue;
    }
    const key = Math.round(s / 15);
    if (!seen.has(key)) {
      seen.add(key);
      const f = `desktop-s${Math.round(s)}.png`;
      await page.screenshot({ path: join(outDir, f) });
      manifest.poses.push({ vp: 'desktop', kind: 's', value: Math.round(s), file: f });
      console.log(`  desktop s=${Math.round(s)} → ${f}`);
      stall = 0;
      dist = 150;
    } else {
      stall++;
      dist = Math.min(dist * 2, 600);
      if (stall >= 8) { console.log(`  desktop: плато @${Math.round(s)} — стоп`); break; }
    }
  }
  await ctx.close();
}

async function shootMobile() {
  /* живий і на mobile віртуалізує скрол (scrollTo ігнорується) —
     тільки touch-жести, кадр на кожній осілій позі ~кожні vh */
  const { ctx, page, cdp, vp } = await openLive('mobile');
  const f0 = 'mobile-s0.png';
  await page.screenshot({ path: join(outDir, f0) });
  manifest.poses.push({ vp: 'mobile', kind: 's', value: 0, file: f0 });
  let lastShot = 0;
  for (let g = 0; g < 60; g++) {
    await cdp.send('Input.synthesizeScrollGesture', {
      x: Math.round(vp.width / 2), y: Math.round(vp.height / 2),
      yDistance: -Math.round(vp.height * 0.9), speed: 1200, gestureSourceType: 'touch',
    });
    const s = await settle(page);
    if (s === null || s > 5100) break;
    if (s - lastShot >= vp.height * 0.7) {
      lastShot = s;
      const f = `mobile-s${Math.round(s)}.png`;
      await page.screenshot({ path: join(outDir, f) });
      manifest.poses.push({ vp: 'mobile', kind: 's', value: Math.round(s), file: f });
      console.log(`  mobile s=${Math.round(s)} → ${f}`);
    }
  }
  await ctx.close();
}

if (vpArg === 'both' || vpArg === 'desktop') { console.log('live-shots desktop…'); await shootDesktop(); }
if (vpArg === 'both' || vpArg === 'mobile') { console.log('live-shots mobile…'); await shootMobile(); }
await browser.close();
/* merge: прогін одного вʼюпорта не стирає пози іншого */
try {
  const prev = JSON.parse((await import('fs')).readFileSync(join(outDir, 'shots-manifest.json'), 'utf8'));
  const shotVps = new Set(manifest.poses.map((p) => p.vp));
  for (const p of prev.poses || []) if (!shotVps.has(p.vp)) manifest.poses.push(p);
} catch {}
writeFileSync(join(outDir, 'shots-manifest.json'), JSON.stringify(manifest, null, 1));
const fail = manifest.poses.filter((p) => p.vp === 'desktop' && p.kind === 's').length < 4
  ? 'замало desktop-станів (<4)' : null;
console.log(`OK: ${manifest.poses.length} поз → ${outDir}${fail ? ' · САМОПЕРЕВІРКА: ' + fail : ''}`);
process.exit(fail ? 1 : 0);
