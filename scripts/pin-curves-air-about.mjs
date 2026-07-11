/* ============================================================
   pin-curves-air-about.mjs — «чорна скринька» кривих ПІНІВ /about:
   скрол-степ по ЖИВОМУ і по НАШОМУ → на кожному кроці активний
   індекс кожного слайдера → JSON switch-точок (frac переключень).
   Ключ: живий бандл сам пише активний індекс у inline-стиль
   контейнера (--content-animation-index, air-shared.js counter),
   наш — у [data-isw-count]/[data-rvc-count].
   Це AIR-локальний передвісник animation-map (повний екстрактор
   будує springs-трек — цей файл його НЕ чіпає).

   Запуск:
     PLAYWRIGHT_FROM=<pkg> node scripts/pin-curves-air-about.mjs \
       [--steps 300] [--viewport 1440x900|390x844] \
       [--ours http://localhost:8820/combos/about-air/combo-lab.html] \
       [--json library/boards/pin-curves.json]
   Desktop live скролиться drag'ом .c-scrollbar_thumb (wheel застрягає),
   mobile live — контейнерним scrollTo (touch-UA).
   ============================================================ */
import { writeFileSync } from 'fs';
import { pathToFileURL } from 'url';

async function resolveChromium() {
  const { createRequire } = await import('node:module');
  const roots = [process.env.PLAYWRIGHT_FROM,
    '/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json'].filter(Boolean);
  for (const r of roots) {
    try { const req = createRequire(pathToFileURL(r)); const pw = req('playwright');
      if (pw && pw.chromium) return pw.chromium; } catch {}
  }
  throw new Error('playwright не знайдено; постав PLAYWRIGHT_FROM');
}
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const N = +arg('steps', 300);
const [VW, VH] = arg('viewport', '1440x900').split('x').map(Number);
const MOBILE = VW <= 500;
const LIVE = arg('live', 'https://aircenter.space/about');
const OURS = arg('ours', 'http://localhost:8820/combos/about-air/combo-lab.html');
const JSON_OUT = arg('json', `library/boards/pin-curves-${VW}.json`);
const UA_M = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

/* стан живого: усі контейнери з --content-animation-index + секція-власник
   + transform/opacity-криві ключових рухомих зон (віяло revolves · aplan · cert-фон) */
const LIVE_STATE = () => {
  const out = {};
  document.querySelectorAll('[style*="--content-animation-index"]').forEach((el) => {
    const sec = el.closest('[data-scroll-section]');
    const key = (sec && (sec.id || sec.querySelector('h1,h2,h3')?.textContent.trim().slice(0, 14))) || 'x';
    const v = el.style.getPropertyValue('--content-animation-index');
    if (v !== '') out[key] = Math.round(+v);
  });
  const tf = (sel, name) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const c = getComputedStyle(el);
    const m = new WebKitCSSMatrix(c.transform === 'none' ? '' : c.transform);
    const r = el.getBoundingClientRect();
    out['~' + name] = { x: +m.m41.toFixed(1), y: +m.m42.toFixed(1),
      o: +(+c.opacity).toFixed(2), top: Math.round(r.top) };
  };
  tf('#revolves picture, #revolves .image-slider-images picture', 'rv-fan');
  tf('#autonomy [data-plan-plans], #autonomy .about-automony-plan', 'aplan');
  tf('#certificate picture img, #certificate .background img', 'cert-bg');
  /* с22 стекінг-зони (sticky--under-next): пін-шари (плато top = пін,
     top<0 = реліз) + голови секцій, що заходять ПІД пін */
  tf('.image-slider-sticky--bg:not(.image-slider-sticky--headquarters) .image-slider-sticky__layer', 'arch-layer');
  tf('.image-slider-sticky--headquarters .image-slider-sticky__layer', 'hq-layer');
  tf('#revolves h2', 'rv-head');
  tf('#space .about-space-intro', 'splash');
  tf('#service h2', 'svc-head');
  return out;
};
/* стан нашого: лічильники isw + rvc + ті ж transform-криві */
const OURS_STATE = () => {
  const out = {};
  document.querySelectorAll('#isw-arch, #isw-hq, #isw-layout').forEach((r) => {
    const c = r.querySelector('[data-isw-count]');
    if (c) out[r.id] = (+c.textContent || 1) - 1;
  });
  const rv = document.querySelector('[data-rvc-count]');
  if (rv) out.rvc = (+rv.textContent || 1) - 1;
  const tf = (sel, name) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const c = getComputedStyle(el);
    const m = new WebKitCSSMatrix(c.transform === 'none' ? '' : c.transform);
    const r = el.getBoundingClientRect();
    out['~' + name] = { x: +m.m41.toFixed(1), y: +m.m42.toFixed(1),
      o: +(+c.opacity).toFixed(2), top: Math.round(r.top) };
  };
  tf('#rvc [data-rvc-slide]', 'rv-fan');
  tf('.aplan', 'aplan');
  tf('.cert-bg', 'cert-bg');
  /* с22 стекінг-зони — наші відповідники */
  tf('#isw-arch [data-isw-layer]', 'arch-layer');
  tf('#isw-hq [data-isw-layer]', 'hq-layer');
  tf('#revolves .rvc-head', 'rv-head');
  tf('#space-splash', 'splash');
  tf('#services .h1', 'svc-head');
  return out;
};

function switches(rows) {
  /* rows: [{f, st:{key:idx}}] → {key: [{idx, from, to}]};
     ~ключі (криві transform) → масив точок {f,x,y,o,top}, епсилон-проріджений */
  const keys = [...new Set(rows.flatMap(r => Object.keys(r.st)))];
  const res = {};
  for (const k of keys) {
    if (k.startsWith('~')) {
      const pts = [];
      for (const r of rows) {
        const v = r.st[k];
        if (v == null) continue;
        const last = pts[pts.length - 1];
        if (!last || Math.abs(last.x - v.x) > 0.5 || Math.abs(last.y - v.y) > 0.5
          || Math.abs(last.o - v.o) > 0.015 || Math.abs(last.top - v.top) > 2)
          pts.push({ f: r.f, ...v });
      }
      res[k] = pts;
      continue;
    }
    const seq = [];
    for (const r of rows) {
      const v = r.st[k];
      if (v == null) continue;
      const last = seq[seq.length - 1];
      if (!last || last.idx !== v) seq.push({ idx: v, from: r.f, to: r.f });
      else last.to = r.f;
    }
    res[k] = seq;
  }
  return res;
}

const SKIP_LIVE = process.argv.includes('--skip-live');

const chromium = await resolveChromium();
const browser = await chromium.launch();

/* ─── LIVE ─── */
const liveRows = [];
let liveTotals = [], liveDocH = 0, liveDocHAfter = 0, oursDocH = 0;
if (!SKIP_LIVE) {
  const ctx = await browser.newContext({ viewport: { width: VW, height: VH },
    isMobile: MOBILE, hasTouch: MOBILE, userAgent: MOBILE ? UA_M : undefined });
  const p = await ctx.newPage();
  /* networkidle недосяжний (Vimeo-фон тримає з'єднання) — load + фікс-пауза */
  await p.goto(LIVE, { waitUntil: 'load', timeout: 90000 });
  await p.waitForTimeout(5000);
  if (!MOBILE) {
    const g = await p.evaluate(() => {
      const th = document.querySelector('.c-scrollbar_thumb'); const tr = document.querySelector('.c-scrollbar');
      if (!th || !tr) return null;
      const r = th.getBoundingClientRect(); const t = tr.getBoundingClientRect();
      return { thx: r.x + r.width / 2, thy: r.y + r.height / 2, tTop: t.y, tH: t.height, thH: r.height };
    });
    if (!g) { console.error('нема .c-scrollbar_thumb'); process.exit(1); }
    const yA = g.tTop + g.thH / 2, yB = g.tTop + (g.tH - g.thH) + g.thH / 2;
    /* с23 прогрів ДО НЕЗМІННОГО ТОТАЛУ (див. scroll-scrub-capture): один драг
       вниз-вгору не добивав глибокий lazy — тотал плавав 33977↔34954 і фраки
       жили в різних масштабах. Степові проходи, стоп = 3 однакові заміри. */
    const total = () => p.evaluate(() => {
      const cont = document.querySelector('[data-scroll-container]') || document.body;
      return Math.round(Math.max(cont.getBoundingClientRect().height, document.body.scrollHeight));
    });
    await p.mouse.move(g.thx, g.thy); await p.mouse.down();
    for (let pass = 0; pass < 8; pass++) {
      for (let k = 0; k <= 20; k++) { await p.mouse.move(g.thx, yA + (yB - yA) * k / 20); await p.waitForTimeout(160); }
      await p.waitForTimeout(1500);
      liveTotals.push(await total());
      for (let k = 20; k >= 0; k--) { await p.mouse.move(g.thx, yA + (yB - yA) * k / 20); await p.waitForTimeout(70); }
      await p.waitForTimeout(1000);
      const L = liveTotals.length;
      if (L >= 3 && liveTotals[L - 1] === liveTotals[L - 2] && liveTotals[L - 2] === liveTotals[L - 3]) break;
    }
    liveDocH = liveTotals[liveTotals.length - 1];
    console.log('live прогрів, тотали:', liveTotals.join('→'));
    for (let i = 0; i < N; i++) {
      await p.mouse.move(g.thx, yA + (yB - yA) * (i / (N - 1)));
      /* с22: фіксовані вейти (90/600/900ms) давали РІЗНІ live-позиції — Locomotive
         доїжджає тривалісно. Детерміновано: чекати СТАБІЛЬНОСТІ КОНТЕНТУ
         (rect першої секції, Δ<0.5px 2 такти; НЕ повзунок — він липне до миші) */
      await p.evaluate(async () => {
        const y = () => { const s = document.querySelector('[data-scroll-section]');
          return s ? s.getBoundingClientRect().top : 0; };
        let prev = y(), calm = 0;
        for (let t = 0; t < 30 && calm < 2; t++) {
          await new Promise(r => setTimeout(r, 120));
          const cur = y();
          if (Math.abs(cur - prev) < 0.5) calm++; else calm = 0;
          prev = cur;
        }
      });
      const row = await p.evaluate((fn) => {
        const th = document.querySelector('.c-scrollbar_thumb'); const tr = document.querySelector('.c-scrollbar');
        const m = new WebKitCSSMatrix(getComputedStyle(th).transform);
        return { f: +(m.m42 / (tr.offsetHeight - th.offsetHeight)).toFixed(4), st: eval(fn)() };
      }, `(${LIVE_STATE.toString()})`);
      liveRows.push(row);
      if (i % 50 === 0) console.log(`live ${i}/${N} @${row.f}`);
    }
    await p.mouse.up();
    liveDocHAfter = await total();
    if (liveDocHAfter !== liveDocH)
      console.warn(`⚠️ live-тотал зріс ПІД ЧАС проби: ${liveDocH}→${liveDocHAfter} — фраки підозрілі, перезняти`);
  } else {
    /* mobile live: контейнерний скрол (scroll-scrub-mobile метод).
       ⚠️ ПРОГРІВ ОБОВ'ЯЗКОВИЙ: scrollHeight росте від lazy-секцій — без
       прогріву max занижений і всі live-фраки розтягнуті (пастка с21:
       «hq-свапи @0.47/0.53» були артефактом саме цього). */
    for (let k = 0; k < 25; k++) {
      const h = await p.evaluate(() => {
        const c = document.querySelector('.page-content-wrapper__inner') || document.scrollingElement;
        c.scrollTo(0, c.scrollHeight);
        return c.scrollHeight;
      });
      await p.waitForTimeout(700);
      liveTotals.push(h);
      const L = liveTotals.length;
      /* с23: стоп лише на 3 однакових послідовних замірах (1 збіг ловив недогрів) */
      if (L >= 3 && liveTotals[L - 1] === liveTotals[L - 2] && liveTotals[L - 2] === liveTotals[L - 3]) break;
    }
    liveDocH = liveTotals[liveTotals.length - 1];
    console.log('live-m прогрів, тотали:', liveTotals.join('→'));
    await p.evaluate(() => {
      const c = document.querySelector('.page-content-wrapper__inner') || document.scrollingElement;
      c.scrollTo(0, 0);
    });
    await p.waitForTimeout(1500);
    const limit = await p.evaluate(() => {
      const c = document.querySelector('.page-content-wrapper__inner') || document.scrollingElement;
      return { sel: c === document.scrollingElement ? null : '.page-content-wrapper__inner',
        max: c.scrollHeight - c.clientHeight };
    });
    for (let i = 0; i < N; i++) {
      const f = i / (N - 1);
      const row = await p.evaluate(({ f, sel, max, fn }) => {
        const c = sel ? document.querySelector(sel) : document.scrollingElement;
        c.scrollTo(0, Math.round(f * max));
        return { f: +f.toFixed(4), st: eval(fn)() };
      }, { f, sel: limit.sel, max: limit.max, fn: `(${LIVE_STATE.toString()})` });
      await p.waitForTimeout(70);
      liveRows.push(row);
      if (i % 50 === 0) console.log(`live-m ${i}/${N}`);
    }
    liveDocHAfter = await p.evaluate(() => {
      const c = document.querySelector('.page-content-wrapper__inner') || document.scrollingElement;
      return c.scrollHeight;
    });
    if (liveDocHAfter !== liveDocH)
      console.warn(`⚠️ live-m тотал зріс ПІД ЧАС проби: ${liveDocH}→${liveDocHAfter} — фраки підозрілі, перезняти`);
  }
  await ctx.close();
}

/* ─── OURS ─── */
const oursRows = [];
{
  const ctx = await browser.newContext({ viewport: { width: VW, height: VH },
    isMobile: MOBILE, hasTouch: MOBILE, userAgent: MOBILE ? UA_M : undefined });
  const p = await ctx.newPage();
  await p.goto(OURS, { waitUntil: 'networkidle', timeout: 60000 });
  await p.waitForTimeout(1500);
  const max = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  oursDocH = max + VH;
  for (let i = 0; i < N; i++) {
    const f = i / (N - 1);
    const row = await p.evaluate(({ f, max, fn }) => {
      const go = (y) => window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y);
      go(Math.round(f * max));
      return { f: +f.toFixed(4), st: eval(fn)() };
    }, { f, max, fn: `(${OURS_STATE.toString()})` });
    await p.waitForTimeout(50);
    oursRows.push(row);
    if (i % 50 === 0) console.log(`ours ${i}/${N}`);
  }
  await ctx.close();
}
await browser.close();

let liveSw;
if (SKIP_LIVE) {
  /* live беремо з попереднього JSON (швидка ітерація по наших таймингах) */
  const { readFileSync } = await import('fs');
  const prev = JSON.parse(readFileSync(JSON_OUT, 'utf8'));
  liveSw = prev.live;
  liveDocH = prev.liveDocH || 0; liveDocHAfter = prev.liveDocHAfter || 0; liveTotals = prev.liveTotals || [];
} else liveSw = switches(liveRows);
const oursSw = switches(oursRows);
const report = { viewport: `${VW}x${VH}`, steps: N,
  liveDocH, liveDocHAfter, liveTotals, oursDocH,
  live: liveSw, ours: oursSw, at: new Date().toISOString() };
writeFileSync(JSON_OUT, JSON.stringify(report, null, 1));
console.log(`тотали: live ${liveDocH}${liveDocHAfter && liveDocHAfter !== liveDocH ? '→' + liveDocHAfter + ' ⚠️' : ''} vs ours ${oursDocH} (Δ ${oursDocH - liveDocH})`);
const fmt = (k, seq) => k.startsWith('~')
  ? `${seq.length}тчк f ${seq[0]?.f}→${seq[seq.length - 1]?.f}`
  : seq.map(s => `[${s.idx}] ${s.from}→${s.to}`).join(' · ');
console.log('\n=== LIVE switch-точки (frac діапазони індексів) ===');
for (const [k, seq] of Object.entries(liveSw)) console.log(` ${k}: ` + fmt(k, seq));
console.log('=== OURS switch-точки ===');
for (const [k, seq] of Object.entries(oursSw)) console.log(` ${k}: ` + fmt(k, seq));
console.log('\nJSON:', JSON_OUT);
