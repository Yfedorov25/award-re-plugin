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
const FROM = +(arg('from', 0)); const TO = +(arg('to', 1));  /* діапазон прогресу (секційний скраб) */
const MAP = JSON.parse(arg('map', '[]'));  /* [{liveIdx, ours:"#id"}] → секційна синхронізація кадрів */
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
  const yA = g.tTop + g.thH / 2, yB = g.tTop + (g.tH - g.thH) + g.thH / 2;
  const y0 = yA + (yB - yA) * FROM, y1 = yA + (yB - yA) * TO;
  await p.mouse.move(g.thx, g.thy); await p.mouse.down();
  for (let i = 0; i < N; i++) {
    const ty = y0 + (y1 - y0) * (i / (N - 1));
    await p.mouse.move(g.thx, ty);
    /* с22: фіксовані вейти (130/800ms) ловили Locomotive у льоті/по-різному —
       label/пікселі розходились до ~200px і роздували перехідні зони diff.
       Детерміновано: чекати СТАБІЛЬНОСТІ КОНТЕНТУ (Δ<0.5px 2 такти по 120ms;
       НЕ повзунок — він липне до миші під час драгу) */
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
  /* ЧЕСНА зйомка (сесія 19): БЕЗ reducedMotion — reveal-анімації летять як у живого.
     Скрол через __lenis.scrollTo(immediate) мікрокроками (Lenis без reduce перехоплює
     нативний scrollTo). Fallback: нативний scrollTo якщо Lenis нема. */
  const ctx = await b.newContext({ viewport: VP, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(OURS, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1800);
  /* секційна синхронізація: пари (live-якір frac → наш-якір frac) → кусково-лінійний ремап.
     Без --map — тотожність (стара поведінка). */
  let remap = (f) => f;
  if (MAP.length) {
    const oursFr = await p.evaluate((sels) => {
      const limit = document.body.scrollHeight - window.innerHeight;
      return sels.map(sel => { const el = document.querySelector(sel);
        return el ? +( (el.getBoundingClientRect().top + window.scrollY) / limit ).toFixed(4) : null; });
    }, MAP.map(m => m.ours));
    const pairs = [[0, 0]];
    MAP.forEach((m, k) => { const la = anchors[m.liveIdx]; if (la && oursFr[k] !== null) pairs.push([la.frac, oursFr[k]]); });
    pairs.push([1, 1]);
    pairs.sort((a, b) => a[0] - b[0]);
    remap = (f) => { for (let k = 1; k < pairs.length; k++) { if (f <= pairs[k][0]) {
      const [a0, b0] = pairs[k - 1], [a1, b1] = pairs[k];
      return a1 === a0 ? b0 : b0 + (b1 - b0) * (f - a0) / (a1 - a0); } } return f; };
    console.log('section-sync pairs:', JSON.stringify(pairs));
  }
  for (let i = 0; i < N; i++) {
    await p.evaluate(async (fr) => {
      const limit = document.body.scrollHeight - window.innerHeight;
      const target = Math.round(fr * limit);
      const cur = () => (window.__lenis && typeof window.__lenis.scroll === 'number') ? window.__lenis.scroll : window.scrollY;
      const go = y => window.__lenis ? window.__lenis.scrollTo(y, { immediate: true }) : window.scrollTo(0, y);
      const from = cur(), steps = 10;
      for (let k = 1; k <= steps; k++) {
        go(Math.round(from + (target - from) * k / steps));
        await new Promise(r => setTimeout(r, 26));
      }
    }, remap(fracs[i]));
    await p.waitForTimeout(150);
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
body{background:#0f0f0e;color:#eee;font:13px/1.4 -apple-system,system-ui;height:${Math.max(N * 55, 8000)}px}
.stage{position:fixed;inset:0;display:grid;grid-template-columns:1fr 1fr;gap:2px;background:#000}
.pane{position:relative;overflow:hidden}
canvas{width:100%;height:100%;display:block;background:#111}
.tag{position:absolute;top:10px;left:10px;z-index:2;font-size:10px;letter-spacing:.1em;text-transform:uppercase;padding:4px 9px;border-radius:4px;background:rgba(0,0,0,.7);color:#eee}
.tag.l{background:rgba(201,161,94,.92);color:#111}
.hud{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:3;display:flex;gap:10px;align-items:center;background:rgba(15,15,14,.85);backdrop-filter:blur(8px);padding:8px 14px;border-radius:8px;font-family:ui-monospace,Menlo,monospace;font-size:11px}
.hud b{color:#c9a15e;min-width:52px}
.hud .sec{color:#999;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.jump{position:fixed;right:10px;top:50%;transform:translateY(-50%);z-index:3;display:flex;flex-direction:column;gap:4px}
.jump button{font-size:9px;letter-spacing:.06em;text-transform:uppercase;background:rgba(15,15,14,.8);color:#bbb;border:1px solid #333;border-radius:4px;padding:4px 7px;cursor:pointer}
.jump button:hover{color:#fff;border-color:#c9a15e}
@media(max-width:820px){.stage{grid-template-columns:1fr;grid-template-rows:1fr 1fr}.jump{display:none}}
</style>
<div class="stage">
  <div class="pane"><span class="tag l">живе aircenter</span><canvas id="CL"></canvas></div>
  <div class="pane"><span class="tag">наше 8820</span><canvas id="CR"></canvas></div>
</div>
<div class="hud"><b id="pct">0%</b><span class="sec" id="sec"></span><span style="color:#666" id="st">скрол = скраб</span></div>
<div class="jump" id="jump"></div>
<script>
const N=${N}, FRACS=${JSON.stringify(fracs)}, ANCHORS=${JSON.stringify(anchors)};
const FW=${VP.width}, FH=${VP.height};
const pad=i=>String(i).padStart(3,'0');
const CL=document.getElementById('CL'), CR=document.getElementById('CR');
const pct=document.getElementById('pct'), secEl=document.getElementById('sec'), st=document.getElementById('st');
/* canvas-рендер: жодних src-свапів у DOM — draw декодованих Image, фризи декодування прибрані
   вікном прогріву decode() навколо позиції + по напрямку скролу */
const L=Array(N), R=Array(N), ok=new Set();
function ensure(i){ if(i<0||i>=N) return;
  if(!L[i]){ const a=new Image(); a.src='live-'+pad(i)+'.jpg'; L[i]=a;
    const b=new Image(); b.src='ours-'+pad(i)+'.jpg'; R[i]=b;
    Promise.all([a.decode().catch(()=>{}),b.decode().catch(()=>{})]).then(()=>ok.add(i)); } }
function nearestReady(i){ if(ok.has(i))return i; for(let d=1;d<N;d++){ if(ok.has(i-d))return i-d; if(ok.has(i+d))return i+d; } return -1; }
function fit(c){ const r=c.parentElement.getBoundingClientRect(); const dpr=Math.min(devicePixelRatio||1,2);
  c.width=r.width*dpr; c.height=r.height*dpr; }
addEventListener('resize',()=>{fit(CL);fit(CR);last=-1;});
fit(CL); fit(CR);
function draw(c,img){ const x=c.getContext('2d'); const cw=c.width,ch=c.height;
  const s=Math.min(cw/FW,ch/FH), w=FW*s,h=FH*s;
  x.fillStyle='#111'; x.fillRect(0,0,cw,ch); x.drawImage(img,(cw-w)/2,(ch-h)/2,w,h); }
let cur=0,last=-1,dir=1,prevT=0;
function secName(fr){ let s=''; for(const a of ANCHORS){ if(a.frac<=fr+0.002) s=a.id; } return s; }
function loop(){
  const max=document.body.scrollHeight-innerHeight;
  const t=Math.max(0,Math.min(1,scrollY/max))*(N-1);
  dir = t>prevT?1:(t<prevT?-1:dir); prevT=t;
  cur += (t-cur)*0.25; if(Math.abs(t-cur)<0.4) cur=t;   /* lerp-згладжування */
  const i=Math.round(cur);
  /* вікно прогріву: позаду 4, попереду 30 у напрямку руху + кожен 12-й для стрибків */
  for(let k=-4;k<=30;k++) ensure(i+k*dir);
  for(let k=0;k<N;k+=12) ensure(k);
  const r=nearestReady(i);
  if(r>=0 && r!==last){ draw(CL,L[r]); draw(CR,R[r]); last=r;
    pct.textContent=(FRACS[r]*100).toFixed(1)+'%'; secEl.textContent=secName(FRACS[r]);
    st.textContent = ok.size<N? ('кеш '+Math.round(100*ok.size/N)+'%') : 'скрол = скраб'; }
  requestAnimationFrame(loop);
}
const jump=document.getElementById('jump');
ANCHORS.forEach(a=>{ if(!a.id.startsWith('sec')){ const b=document.createElement('button'); b.textContent=a.id;
  b.onclick=()=>{ const max=document.body.scrollHeight-innerHeight;
    /* мапа frac якоря → індекс кадру → скрол борда */
    let bi=0; for(let k=0;k<N;k++){ if(FRACS[k]<=a.frac) bi=k; }
    scrollTo(0,(bi/(N-1))*max); }; jump.appendChild(b); }});
requestAnimationFrame(loop);
</script>`);
console.log('BOARD:', `${OUT}/board.html`);
console.log('frames:', N, 'anchors:', anchors.filter(a => !a.id.startsWith('sec')).map(a => a.id).join(' '));
