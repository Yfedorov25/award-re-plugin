/* ============================================================
   SCROLL-SCRUB CAPTURE (сесія 17) — динамічне порівняння оком
   ------------------------------------------------------------
   Знімає ~N кадрів живого ОДНІЄЮ безперервною протяжкою повзунка
   Locomotive (drag, швидко) + наші кадри на ТИХ САМИХ виміряних
   прогресах → генерує scroll-scrub борд: скрол сторінки синхронно
   скрабить обидві сторони поруч (видно пінінг/reveal/динаміку).

   Запуск: PLAYWRIGHT_FROM=<pkg> node scripts/scroll-scrub-capture.mjs \
     --live https://aircenter.space/about \
     --ours http://localhost:8820/combos/about-air/combo-lab.html \
     --steps 80 --out library/boards/about-scrub
   Борд: <out>/board.html (сервер 8820 віддає library/).
   ============================================================ */
import { mkdirSync, writeFileSync } from 'fs';
import { resolve, basename } from 'path';
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
const LIVE = arg('live'); const OURS = arg('ours');
const N = +(arg('steps', 80)); const OUT = resolve(arg('out', 'library/boards/scrub'));
const VP = { width: +(arg('vw', 1440)), height: +(arg('vh', 820)) };
const Q = +(arg('quality', 52));
if (!LIVE || !OURS) { console.error('потрібні --live --ours'); process.exit(1); }
mkdirSync(OUT, { recursive: true });

const b = await chromium.launch();
const fracs = []; let anchors = [];

/* ─── 1. LIVE: одна безперервна протяжка повзунка, кадр на кожному кроці ─── */
{
  const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
  await p.goto(LIVE, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(4000);
  try { await p.click('button:has-text("ACCEPT")', { timeout: 1500 }); } catch (e) {}
  await p.waitForTimeout(400);
  anchors = await p.evaluate(() => {
    const secs = [...document.querySelectorAll('[data-scroll-section]')];
    const cont = document.querySelector('[data-scroll-container]') || document.body;
    const contentH = Math.max(cont.getBoundingClientRect().height, document.body.scrollHeight);
    const limit = contentH - window.innerHeight;
    return secs.map((s, i) => ({ i, id: s.id || ('sec' + i), frac: +((s.getBoundingClientRect().top) / limit).toFixed(4) }))
      .filter(a => a.frac >= 0 && a.frac <= 1);
  });
  const g = await p.evaluate(() => {
    const th = document.querySelector('.c-scrollbar_thumb'); const tr = document.querySelector('.c-scrollbar');
    if (!th || !tr) return null;
    const r = th.getBoundingClientRect(); const t = tr.getBoundingClientRect();
    return { thx: r.x + r.width / 2, thy: r.y + r.height / 2, tTop: t.y, tH: t.height, thH: r.height };
  });
  if (!g) { console.error('нема .c-scrollbar_thumb'); process.exit(1); }
  const y0 = g.tTop + g.thH / 2, y1 = g.tTop + (g.tH - g.thH) + g.thH / 2;
  await p.mouse.move(g.thx, g.thy); await p.mouse.down();
  for (let i = 0; i < N; i++) {
    const ty = y0 + (y1 - y0) * (i / (N - 1));
    await p.mouse.move(g.thx, ty);
    await p.waitForTimeout(160);  /* дати Locomotive догнати */
    const fr = await p.evaluate(() => {
      const th = document.querySelector('.c-scrollbar_thumb'); const tr = document.querySelector('.c-scrollbar');
      const m = new WebKitCSSMatrix(getComputedStyle(th).transform);
      return +(m.m42 / (tr.offsetHeight - th.offsetHeight)).toFixed(4);
    });
    fracs.push(fr);
    await p.screenshot({ path: `${OUT}/live-${String(i).padStart(3, '0')}.jpg`, type: 'jpeg', quality: Q });
    if (i % 10 === 0) console.log(`live ${i}/${N} @${fr}`);
  }
  await p.mouse.up();
  await ctx.close();
}

/* ─── 2. OURS: кадри на тих самих виміряних прогресах ─── */
{
  const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(OURS, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1800);
  for (let i = 0; i < N; i++) {
    await p.evaluate((fr) => {
      const limit = document.body.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.round(fr * limit));
    }, fracs[i]);
    await p.waitForTimeout(220);
    await p.screenshot({ path: `${OUT}/ours-${String(i).padStart(3, '0')}.jpg`, type: 'jpeg', quality: Q });
    if (i % 10 === 0) console.log(`ours ${i}/${N}`);
  }
  await ctx.close();
}
await b.close();

/* ─── 3. Борд: скрол = синхронний скраб обох сторін ─── */
writeFileSync(`${OUT}/meta.json`, JSON.stringify({ n: N, fracs, anchors, live: LIVE, ours: OURS, at: new Date().toISOString() }, null, 1));
writeFileSync(`${OUT}/board.html`, `<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>scrub: ${basename(OUT)}</title>
<style>
*{margin:0;box-sizing:border-box}
body{background:#0f0f0e;color:#eee;font:13px/1.4 -apple-system,system-ui;height:${N * 140}px}
.stage{position:fixed;inset:0;display:grid;grid-template-columns:1fr 1fr;gap:2px;background:#000}
.pane{position:relative;overflow:hidden}
.pane img{width:100%;height:100%;object-fit:contain;display:block;background:#111}
.tag{position:absolute;top:10px;left:10px;z-index:2;font-size:10px;letter-spacing:.1em;text-transform:uppercase;padding:4px 9px;border-radius:4px;background:rgba(0,0,0,.7)}
.tag.l{background:rgba(201,161,94,.92);color:#111}
.hud{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:3;display:flex;gap:8px;align-items:center;background:rgba(15,15,14,.85);backdrop-filter:blur(8px);padding:8px 14px;border-radius:8px;font-family:ui-monospace,Menlo,monospace;font-size:11px}
.hud b{color:#c9a15e;min-width:52px}
.hud .sec{color:#999;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.jump{position:fixed;right:10px;top:50%;transform:translateY(-50%);z-index:3;display:flex;flex-direction:column;gap:4px}
.jump button{font-size:9px;letter-spacing:.06em;text-transform:uppercase;background:rgba(15,15,14,.8);color:#bbb;border:1px solid #333;border-radius:4px;padding:4px 7px;cursor:pointer}
.jump button:hover{color:#fff;border-color:#c9a15e}
@media(max-width:820px){.stage{grid-template-columns:1fr;grid-template-rows:1fr 1fr}.jump{display:none}}
</style>
<div class="stage">
  <div class="pane"><span class="tag l">живе aircenter</span><img id="L" alt=""></div>
  <div class="pane"><span class="tag">наше 8820</span><img id="R" alt=""></div>
</div>
<div class="hud"><b id="pct">0%</b><span class="sec" id="sec"></span><span style="color:#666">скрол = скраб обох</span></div>
<div class="jump" id="jump"></div>
<script>
const N=${N}, FRACS=${JSON.stringify(fracs)}, ANCHORS=${JSON.stringify(anchors)};
const L=document.getElementById('L'), R=document.getElementById('R');
const pct=document.getElementById('pct'), secEl=document.getElementById('sec');
const pad=i=>String(i).padStart(3,'0');
/* прелоад */
for(let i=0;i<N;i++){ new Image().src='live-'+pad(i)+'.jpg'; new Image().src='ours-'+pad(i)+'.jpg'; }
function secName(fr){ let s=''; for(const a of ANCHORS){ if(a.frac<=fr+0.002) s=a.id; } return s; }
function upd(){
  const max=document.body.scrollHeight-innerHeight;
  const p=Math.max(0,Math.min(1,scrollY/max));
  const i=Math.round(p*(N-1));
  L.src='live-'+pad(i)+'.jpg'; R.src='ours-'+pad(i)+'.jpg';
  pct.textContent=(FRACS[i]*100).toFixed(1)+'%';
  secEl.textContent=secName(FRACS[i]);
}
addEventListener('scroll',()=>requestAnimationFrame(upd),{passive:true});
const jump=document.getElementById('jump');
ANCHORS.forEach(a=>{ if(!a.id.startsWith('sec')){ const b=document.createElement('button'); b.textContent=a.id;
  b.onclick=()=>{ const max=document.body.scrollHeight-innerHeight; scrollTo(0,a.frac*max); }; jump.appendChild(b); }});
upd();
</script>`);
console.log('BOARD:', `${OUT}/board.html`);
console.log('frames:', N, 'anchors:', anchors.filter(a => !a.id.startsWith('sec')).map(a => a.id).join(' '));
