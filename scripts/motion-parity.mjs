/* ============================================================
   MOTION-PARITY GATE (сесія 17) — «зараховано» покриває ДВИЖОК
   ------------------------------------------------------------
   Піксель-diff сліпий до динаміки. Цей гейт міряє ЧИСЛА движка
   НАШОЇ сторінки і порівнює з живими константами AIR (джерело:
   RECON-about-full-rebuild.md / air-global.css розвідка):
   - reveal: word-by-word, stagger 60ms/слово, ease cubic-bezier(.25,.74,.22,.99),
     blur(10px)→0, тривалість 1s, колір #8d8d8d
   - fade-шов: opacity-driver 0→.5 (НЕ gradient)
   - glass: backdrop-filter blur (20-40px)
   - смуга прогресу/пін: наявність sticky/absolute pin-шарів у isw
   Запуск: PLAYWRIGHT_FROM=<pkg> node scripts/motion-parity.mjs \
     --ours http://localhost:8820/combos/about-air/combo-lab.html
   Вихід: таблиця PASS/FAIL + exit 1 якщо є FAIL (для пайплайна).
   ============================================================ */
import { pathToFileURL } from 'url';
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
if (!chromium) { console.error('playwright не резолвиться'); process.exit(1); }
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > -1 ? process.argv[i + 1] : d; };
const OURS = arg('ours');
if (!OURS) { console.error('потрібен --ours'); process.exit(1); }

/* живі константи (RECON/air-global.css) */
const LIVE = {
  ease: 'cubic-bezier(0.25, 0.74, 0.22, 0.99)',
  staggerMs: 60,
  revealDurS: 1,
  revealBlurPx: 10,
  revealColor: 'rgb(141, 141, 141)', /* #8d8d8d */
  seamMaxOpacity: 0.5,
};

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 820 } }); /* БЕЗ reduced: reveal має бути активний */
const p = await ctx.newPage();
await p.goto(OURS, { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(2000);

const res = await p.evaluate((LIVE) => {
  const out = [];
  const ok = (name, pass, got, want) => out.push({ name, pass: !!pass, got: String(got), want: String(want) });

  /* 1. reveal: слова обгорнуті, transition = ease/1s, stagger 60ms, blur 10 у armed-стані */
  /* семпл БЕЗ inline-кольору: живий патерн має і чорні h2-reveal (інтро),
     і сірі #8d8d8d — движковий чек кольору валідний лише на дефолтному */
  const rv = [...document.querySelectorAll('.reveal-text')]
    .find(e => !(e.getAttribute('style') || '').includes('color') && !e.classList.contains('h2r')) ||
    document.querySelector('.reveal-text');
  const w = rv && rv.querySelector('.rv-w');
  ok('reveal: word-split існує', !!w, w ? 'так' : 'нема .rv-w', 'слова обгорнуті');
  if (w) {
    const cs = getComputedStyle(w);
    ok('reveal: тривалість 1s', /(^|[^0-9])1s/.test(cs.transitionDuration), cs.transitionDuration, '1s');
    ok('reveal: ease живий', cs.transitionTimingFunction.includes('0.25, 0.74, 0.22, 0.99'),
      cs.transitionTimingFunction, LIVE.ease);
    /* stagger: делей слова з --rv-i=2 має бути 120ms */
    const w2 = [...rv.querySelectorAll('.rv-w')].find(x => x.style.getPropertyValue('--rv-i') === '2');
    if (w2) { const d = parseFloat(getComputedStyle(w2).transitionDelay);
      ok('reveal: stagger 60ms/слово', Math.abs(d - 0.12) < 0.005, d + 's @i=2', '0.12s'); }
    /* armed-стан: створити тестовий вузол зі станом rv-armed */
    rv.classList.add('rv-armed');
    const blur = getComputedStyle(w).filter;
    rv.classList.remove('rv-armed');
    ok('reveal: blur(10px) у прихованому стані', blur.includes('blur(10px)'), blur, 'blur(10px)');
    ok('reveal: колір #8d8d8d', getComputedStyle(rv).color === LIVE.revealColor,
      getComputedStyle(rv).color, LIVE.revealColor);
  }

  /* 2. fade-шов: driver існує, стеля opacity = 0.5 */
  const seam = document.querySelector('.fade-seam');
  ok('fade-шов: секції існують', !!seam, seam ? 'так' : 'нема', '.fade-seam');
  if (seam) {
    seam.style.setProperty('--seam-p', '1');
    const op = parseFloat(getComputedStyle(seam, '::after').opacity);
    seam.style.removeProperty('--seam-p');
    ok('fade-шов: стеля 0.5 (не gradient)', Math.abs(op - 0.5) < 0.02, op, '0.5');
  }

  /* 3. glass: backdrop-filter на картках */
  const glass = document.querySelector('.svc-lg, .cft, .isw-card');
  if (glass) { const bf = getComputedStyle(glass).backdropFilter || '';
    ok('glass: backdrop-filter blur', /blur\((1[0-9]|[2-4][0-9])px\)/.test(bf), bf, 'blur(10-40px)'); }

  /* 4. пін-шари isw: stage absolut/fixed fullbleed */
  const stage = document.querySelector('#isw-arch [data-isw-stage]');
  if (stage) { const cs = getComputedStyle(stage);
    ok('isw: fullbleed pin-шар', cs.position === 'absolute' || cs.position === 'sticky' || cs.position === 'fixed',
      cs.position, 'absolute/sticky'); }

  /* 5. sticky comfort-титул */
  const cft = document.querySelector('.cft-left h3');
  if (cft) ok('comfort: sticky-титул', getComputedStyle(cft).position === 'sticky',
    getComputedStyle(cft).position, 'sticky');

  return out;
}, LIVE);
await b.close();

let fails = 0;
console.log('\nMOTION-PARITY —', OURS);
for (const r of res) {
  if (!r.pass) fails++;
  console.log(` ${r.pass ? '✅' : '❌'} ${r.name}  · got: ${r.got}  · live: ${r.want}`);
}
console.log(fails ? `\nFAIL: ${fails} розбіжностей движка` : '\nPASS: числа движка відповідають живим');
process.exit(fails ? 1 : 0);
