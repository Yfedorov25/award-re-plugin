/* ============================================================
   SCROLL-SCRUB MOBILE @390 (сесія 18) — mobile-пари live↔ours
   ------------------------------------------------------------
   Живий AIR на mobile-в'юпорті НЕ має Locomotive/повзунка:
   скролиться внутрішній контейнер .page-content-wrapper__inner
   (touch UA обов'язковий, інакше desktop-верстка).
   Наше — нативний window-скрол.

   Запуск: PLAYWRIGHT_FROM=<pkg> node scripts/scroll-scrub-mobile.mjs \
     --live https://aircenter.space/about \
     --ours http://localhost:8820/combos/about-air/combo-lab.html \
     --steps 120 --out library/boards/about-scrub-m390
   Кадри: live-NNN.jpg / ours-NNN.jpg + meta.json (мобільні анкори живого)
   + board.html (canvas-вьювер, скрол = синхронний скраб — сесія 19).
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
const N = +(arg('steps', 120)); const OUT = resolve(arg('out', 'library/boards/scrub-m390'));
const Q = +(arg('quality', 52));
if (!LIVE || !OURS) { console.error('потрібні --live --ours'); process.exit(1); }
mkdirSync(OUT, { recursive: true });

const b = await chromium.launch();

/* ── LIVE @390: контейнерний скрол (touch UA) ── */
let anchors = { limit: 0, list: [] };
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Version/16.0 Mobile/15E148 Safari/604.1',
    hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  await p.goto(LIVE, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(5000);
  try { await p.click('button:has-text("ACCEPT")', { timeout: 1500 }); } catch (e) {}
  anchors = await p.evaluate(() => {
    const c = document.querySelector('.page-content-wrapper__inner');
    const limit = c.scrollHeight - c.clientHeight;
    const secs = [...document.querySelectorAll('[data-scroll-section], section[id]')];
    return { limit, list: secs.map((s, i) => ({ id: s.id || 'sec' + i,
      frac: +(((s.getBoundingClientRect().top + c.scrollTop)) / limit).toFixed(4) }))
      .filter(a => a.frac > 0 && a.frac <= 1) };
  });
  console.log('live limit', anchors.limit, 'anchors:',
    anchors.list.filter(a => !a.id.startsWith('sec')).map(a => a.id + '@' + a.frac).join(' '));
  for (let i = 0; i < N; i++) {
    const f = i / (N - 1);
    await p.evaluate((fr) => { const c = document.querySelector('.page-content-wrapper__inner');
      c.scrollTop = Math.round(fr * (c.scrollHeight - c.clientHeight)); }, f);
    await p.waitForTimeout(220);
    await p.screenshot({ path: `${OUT}/live-${String(i).padStart(3, '0')}.jpg`, type: 'jpeg', quality: Q });
    if (i % 20 === 0) console.log('live', i, '/', N);
  }
  await ctx.close();
}

/* ── OURS @390: ЧЕСНА зйомка (сесія 19) — touch-контекст БЕЗ reducedMotion:
   Lenis на touch не стартує (нативний скрол ок), а reveal-анімації ЛЕТЯТЬ
   як у живого. Доїзд до цілі МІКРОКРОКАМИ (не стрибок) — IntersectionObserver
   спрацьовує в польоті, кадр ловить ту саму blur-фазу що жива протяжка. ── */
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1,
    hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  await p.goto(OURS, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(2500);
  for (let i = 0; i < N; i++) {
    const f = i / (N - 1);
    await p.evaluate(async (fr) => {
      const limit = document.body.scrollHeight - innerHeight;
      const target = Math.round(fr * limit), from = scrollY, steps = 10;
      for (let k = 1; k <= steps; k++) {
        scrollTo(0, Math.round(from + (target - from) * k / steps));
        await new Promise(r => setTimeout(r, 28));
      }
    }, f);
    await p.waitForTimeout(140);
    await p.screenshot({ path: `${OUT}/ours-${String(i).padStart(3, '0')}.jpg`, type: 'jpeg', quality: Q });
    if (i % 20 === 0) console.log('ours', i, '/', N);
  }
  await ctx.close();
}
writeFileSync(`${OUT}/meta.json`, JSON.stringify({ n: N, anchors: anchors.list,
  limit: anchors.limit, live: LIVE, ours: OURS, at: new Date().toISOString() }, null, 1));

/* ─── board.html: той самий canvas-вьювер що в scroll-scrub-capture,
   портретні панелі 390×844, fracs рівномірні ─── */
const fracs = Array.from({ length: N }, (_, i) => +(i / (N - 1)).toFixed(4));
writeFileSync(`${OUT}/board.html`, `<!doctype html><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>scrub m390: ${basename(OUT)}</title>
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
@media(max-width:820px){.stage{grid-template-columns:1fr 1fr}.jump{display:none}}
</style>
<div class="stage">
  <div class="pane"><span class="tag l">живе @390</span><canvas id="CL"></canvas></div>
  <div class="pane"><span class="tag">наше @390</span><canvas id="CR"></canvas></div>
</div>
<div class="hud"><b id="pct">0%</b><span class="sec" id="sec"></span><span style="color:#666" id="st">скрол = скраб</span></div>
<div class="jump" id="jump"></div>
<script>
const N=${N}, FRACS=${JSON.stringify(fracs)}, ANCHORS=${JSON.stringify(anchors.list)};
const FW=390, FH=844;
const pad=i=>String(i).padStart(3,'0');
const CL=document.getElementById('CL'), CR=document.getElementById('CR');
const pct=document.getElementById('pct'), secEl=document.getElementById('sec'), st=document.getElementById('st');
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
  cur += (t-cur)*0.25; if(Math.abs(t-cur)<0.4) cur=t;
  const i=Math.round(cur);
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
    let bi=0; for(let k=0;k<N;k++){ if(FRACS[k]<=a.frac) bi=k; }
    scrollTo(0,(bi/(N-1))*max); }; jump.appendChild(b); }});
requestAnimationFrame(loop);
</script>`);
await b.close();
console.log('DONE', OUT, '· BOARD:', `${OUT}/board.html`);
