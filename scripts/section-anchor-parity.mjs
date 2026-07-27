/* ============================================================
   SECTION-ANCHOR-PARITY (крок B, сесія 17)
   ------------------------------------------------------------
   Семантична звірка секцій по ЯКОРЯХ, не по рівномірному %
   (section-parity по % бреше при змінених висотах — урок сесії 16).

   Метод:
   1. LIVE (Locomotive): targetProgress якоря = docTop/(contentH−innerH),
      позиціонування DRAG-ом повзунка .c-scrollbar_thumb (±0.5%,
      wheel застрягає — урок сесії 17) → кадр.
   2. OURS (Lenis): reducedMotion:'reduce' (Lenis не стартує) →
      нативний two-pass scrollTo(top секції) → кадр.
   3. Canvas piксель-diff пар → % + diff-маска + борд.

   Запуск (з кореня award-re-plugin):
   PLAYWRIGHT_FROM=<path> node scripts/section-anchor-parity.mjs \
     --live https://aircenter.space/about \
     --ours http://localhost:8820/combos/about-air/combo-lab.html \
     --map  '[{"name":"revolves","liveIdx":4,"ours":"#revolves"},…]' \
     --out  scripts/anchor-parity/about-air
   map: liveIdx = індекс [data-scroll-section] живого; ours = наш селектор.
   ⚠️ Число тут — СИГНАЛ (фази reveal/parallax/відео різняться навіть при
   точному якорі). «Збіглось» вирішує око по борду + вердикт Єгора.
   ============================================================ */
import { mkdirSync, writeFileSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

/* resolve playwright (той самий патерн що visual-parity.mjs / PLAYWRIGHT_FROM) */
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
if (!chromium) { console.error('playwright не резолвиться (постав PLAYWRIGHT_FROM)'); process.exit(1); }

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const LIVE = arg('live'); const OURS = arg('ours');
const MAP = JSON.parse(arg('map', '[]'));
const OUT = resolve(arg('out', 'scripts/anchor-parity/out'));
const VP = { width: +(arg('vw', 1440)), height: +(arg('vh', 820)) };
if (!LIVE || !OURS || !MAP.length) { console.error('потрібні --live --ours --map'); process.exit(1); }
mkdirSync(OUT, { recursive: true });

const b = await chromium.launch();

/* ─── 1. LIVE: кадри по якорях (drag повзунка) ─── */
console.log('LIVE:', LIVE);
{
  const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  await p.goto(LIVE, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(4000);
  try { await p.click('button:has-text("ACCEPT")', { timeout: 1500 }); } catch (e) {}
  await p.waitForTimeout(400);

  /* targetProgress кожного якоря на progress 0 (rect.top = docTop, бо transform=0) */
  const anchors = await p.evaluate(() => {
    const secs = [...document.querySelectorAll('[data-scroll-section]')];
    const cont = document.querySelector('[data-scroll-container]') || document.body;
    const contentH = Math.max(cont.getBoundingClientRect().height, document.body.scrollHeight);
    const limit = contentH - window.innerHeight;
    return secs.map((s, i) => ({ i, id: s.id || '', top: Math.round(s.getBoundingClientRect().top + window.scrollY), frac: +( (s.getBoundingClientRect().top) / limit ).toFixed(4) }));
  });
  console.log('live anchors:', anchors.map(a => `${a.i}:${a.id || '·'}@${a.frac}`).join(' '));

  async function dragTo(frac) {
    const g = await p.evaluate(() => {
      const th = document.querySelector('.c-scrollbar_thumb'); const tr = document.querySelector('.c-scrollbar');
      if (!th || !tr) return null;
      const r = th.getBoundingClientRect(); const t = tr.getBoundingClientRect();
      return { thx: r.x + r.width / 2, thy: r.y + r.height / 2, tTop: t.y, tH: t.height, thH: r.height };
    });
    if (!g) return null;
    const ty = g.tTop + Math.min(Math.max(frac, 0), 1) * (g.tH - g.thH) + g.thH / 2;
    await p.mouse.move(g.thx, g.thy); await p.mouse.down();
    for (let i = 1; i <= 22; i++) { await p.mouse.move(g.thx, g.thy + (ty - g.thy) * i / 22); await p.waitForTimeout(22); }
    await p.mouse.up(); await p.waitForTimeout(1100);
    return await p.evaluate(() => {
      const th = document.querySelector('.c-scrollbar_thumb'); const tr = document.querySelector('.c-scrollbar');
      const m = new WebKitCSSMatrix(getComputedStyle(th).transform);
      return +(m.m42 / (tr.offsetHeight - th.offsetHeight)).toFixed(4);
    });
  }

  for (const m of MAP) {
    const a = anchors[m.liveIdx];
    if (!a) { console.log(`⚠️ ${m.name}: liveIdx ${m.liveIdx} відсутній`); continue; }
    /* петля точності: drag → міряти похибку → докрутити (thumb 1px ≈ 40px контенту,
       один drag дає ±0.02 на глибоких fracs — сесія 17, certificate 97% артефакт) */
    let actual = null, aim = a.frac;
    for (let t = 0; t < 4; t++) {
      actual = await dragTo(aim);
      if (actual === null || Math.abs(actual - a.frac) <= 0.003) break;
      aim += (a.frac - actual);  /* корекція систематичного зміщення drag */
    }
    await p.screenshot({ path: `${OUT}/live-${m.name}.png` });
    console.log(`live ${m.name}: target ${a.frac} actual ${actual}${Math.abs(actual - a.frac) > 0.003 ? ' ⚠️ tolerance miss' : ''}`);
  }
  await ctx.close();
}

/* ─── 2. OURS: кадри по селекторах (reduced → нативний скрол) ─── */
console.log('OURS:', OURS);
{
  const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(OURS, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1600);
  for (const m of MAP) {
    let ok = false;
    for (let k = 0; k < 2; k++) { /* two-pass проти зсуву lazy-images */
      ok = await p.evaluate((sel) => {
        const el = document.querySelector(sel); if (!el) return false;
        window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY); return true;
      }, m.ours);
      await p.waitForTimeout(500);
    }
    if (!ok) { console.log(`⚠️ ${m.name}: селектор ${m.ours} відсутній`); continue; }
    await p.screenshot({ path: `${OUT}/ours-${m.name}.png` });
    console.log(`ours ${m.name}: ok`);
  }
  await ctx.close();
}

/* ─── 3. DIFF пар (canvas у сторінці) ─── */
const results = [];
{
  const ctx = await b.newContext({ viewport: { width: 200, height: 200 } });
  const p = await ctx.newPage();
  for (const m of MAP) {
    let liveB64, oursB64;
    try {
      liveB64 = readFileSync(`${OUT}/live-${m.name}.png`).toString('base64');
      oursB64 = readFileSync(`${OUT}/ours-${m.name}.png`).toString('base64');
    } catch (e) { results.push({ name: m.name, error: 'missing frame' }); continue; }
    const r = await p.evaluate(async ({ a, b }) => {
      const load = (u) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = u; });
      const ia = await load('data:image/png;base64,' + a);
      const ib = await load('data:image/png;base64,' + b);
      const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height);
      const c1 = new OffscreenCanvas(w, h).getContext('2d'); c1.drawImage(ia, 0, 0);
      const c2 = new OffscreenCanvas(w, h).getContext('2d'); c2.drawImage(ib, 0, 0);
      const d1 = c1.getImageData(0, 0, w, h).data, d2 = c2.getImageData(0, 0, w, h).data;
      const cd = new OffscreenCanvas(w, h).getContext('2d');
      const out = cd.createImageData(w, h);
      let diff = 0;
      for (let i = 0; i < d1.length; i += 4) {
        const dr = Math.abs(d1[i] - d2[i]), dg = Math.abs(d1[i + 1] - d2[i + 1]), db = Math.abs(d1[i + 2] - d2[i + 2]);
        const bad = (dr + dg + db) > 90; /* поріг ~30/канал */
        if (bad) { diff++; out.data[i] = 255; out.data[i + 3] = 200; }
        else { out.data[i] = d2[i]; out.data[i + 1] = d2[i + 1]; out.data[i + 2] = d2[i + 2]; out.data[i + 3] = 60; }
      }
      cd.putImageData(out, 0, 0);
      const blob = await cd.canvas.convertToBlob({ type: 'image/png' });
      const buf = new Uint8Array(await blob.arrayBuffer());
      let s = ''; buf.forEach(x => s += String.fromCharCode(x));
      return { pct: +(100 * diff / (w * h)).toFixed(2), diffB64: btoa(s) };
    }, { a: liveB64, b: oursB64 });
    writeFileSync(`${OUT}/diff-${m.name}.png`, Buffer.from(r.diffB64, 'base64'));
    results.push({ name: m.name, pct: r.pct });
    console.log(`diff ${m.name}: ${r.pct}%`);
  }
  await ctx.close();
}
await b.close();

/* ─── 4. Звіт + борд ─── */
const report = { at: new Date().toISOString(), live: LIVE, ours: OURS, viewport: VP, method: 'anchor-drag', results };
writeFileSync(`${OUT}/anchor-parity-report.json`, JSON.stringify(report, null, 2));
const rows = results.map(r => r.error
  ? `<section><h2>${r.name} — ERROR ${r.error}</h2></section>`
  : `<section><h2>${r.name} — <b>${r.pct}%</b></h2><div class="trio">
      <figure><figcaption>ours</figcaption><img src="ours-${r.name}.png"></figure>
      <figure><figcaption>live</figcaption><img src="live-${r.name}.png"></figure>
      <figure><figcaption>diff</figcaption><img src="diff-${r.name}.png"></figure>
    </div></section>`).join('\n');
writeFileSync(`${OUT}/anchor-parity-board.html`, `<!doctype html><meta charset="utf-8">
<title>anchor-parity</title>
<style>body{background:#111;color:#eee;font:14px/1.5 system-ui;padding:24px}
h2{font-weight:400;margin:28px 0 10px}h2 b{color:#c9a15e}
.trio{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
figure{margin:0}figcaption{font-size:11px;color:#999;margin-bottom:4px;text-transform:uppercase;letter-spacing:.08em}
img{width:100%;display:block;border:1px solid #333;border-radius:4px}</style>
<h1 style="font-weight:300">Anchor-parity: ${OURS.split('/').slice(-2)[0]} · ${new Date().toISOString()}</h1>
<p style="color:#999;max-width:80ch">Число = сигнал (фази reveal/parallax/відео різняться навіть при точному якорі). «Збіглось» вирішує око + вердикт Єгора.</p>
${rows}`);
console.log('\nREPORT:', `${OUT}/anchor-parity-report.json`);
console.log('BOARD:', `${OUT}/anchor-parity-board.html`);
