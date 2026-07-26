/* Build ONE self-contained verdict board: НАШЕ|ЖИВЕ section pairs, desktop + m390,
   images embedded as data-URIs. Єгор scrolls once, says ok/ні per section.
   No metric — his eye is the judge (rішення с29). */
import { readFileSync, writeFileSync, existsSync } from 'fs';

const SECTIONS = [
  ['hero / next', 'next'], ['intro', 'sec2'], ['architecture', 'sec3'],
  ['revolves', 'revolves'], ['headquarters', 'headquarters'], ['space', 'space'],
  ['comfort', 'sec7'], ['autonomy', 'autonomy'], ['services', 'service'],
  ['certificate', 'certificate'], ['solutions / layout', 'solutions'], ['stack / footer', 'sec12'],
];

function b64(path) {
  if (!existsSync(path)) return null;
  return 'data:image/jpeg;base64,' + readFileSync(path).toString('base64');
}
function frameFor(boardDir, anchorId) {
  const meta = JSON.parse(readFileSync(`${boardDir}/meta.json`, 'utf8'));
  const N = meta.n || 120;
  const a = (meta.anchors || []).find(x => x.id === anchorId);
  if (!a) return null;
  return Math.round(a.frac * (N - 1));
}
function pad3(n) { return String(n).padStart(3, '0'); }

function rowsFor(boardDir) {
  return SECTIONS.map(([label, anchor]) => {
    const f = frameFor(boardDir, anchor);
    if (f == null) return { label, anchor, missing: true };
    const live = b64(`${boardDir}/live-${pad3(f)}.jpg`);
    const ours = b64(`${boardDir}/ours-${pad3(f)}.jpg`);
    return { label, anchor, frame: f, live, ours, missing: !live || !ours };
  });
}

const desktop = rowsFor('library/boards/about-scrub-v6');
const m390 = rowsFor('library/boards/about-scrub-m390');

function renderRows(rows, vp) {
  return rows.map((r, i) => {
    if (r.missing) return `<div class="row"><div class="lbl">${i + 1}. ${r.label} <span class="miss">(кадр відсутній)</span></div></div>`;
    return `<div class="row" id="${vp}-${r.anchor}">
      <div class="lbl">${i + 1}. ${r.label} <span class="f">#${r.frame}</span>
        <span class="verdict"><button class="ok">✓ ok</button><button class="no">✗ ні</button></span></div>
      <div class="pair">
        <figure><figcaption>НАШЕ</figcaption><img loading="lazy" src="${r.ours}"></figure>
        <figure><figcaption>ЖИВЕ</figcaption><img loading="lazy" src="${r.live}"></figure>
      </div></div>`;
  }).join('\n');
}

const html = `<!doctype html><html lang="uk"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Verdict Board · /about · НАШЕ vs ЖИВЕ</title>
<style>
  :root{--bg:#0e0e10;--fg:#e8e8e6;--mut:#8a8a88;--line:#26262a;--ok:#2ea043;--no:#d13a3a}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg);font:14px/1.4 -apple-system,system-ui,sans-serif}
  header{position:sticky;top:0;z-index:10;background:#141416;border-bottom:1px solid var(--line);padding:14px 20px}
  h1{margin:0;font-size:17px;font-weight:600}
  .sub{color:var(--mut);font-size:12.5px;margin-top:4px}
  .tabs{display:flex;gap:8px;margin-top:10px}
  .tabs button{background:#1d1d20;color:var(--fg);border:1px solid var(--line);border-radius:6px;padding:6px 14px;cursor:pointer;font-size:13px}
  .tabs button.active{background:#2a2a30;border-color:#3a3a42}
  section.vp{display:none;padding:16px 20px 80px}
  section.vp.active{display:block}
  .row{border:1px solid var(--line);border-radius:10px;margin-bottom:18px;overflow:hidden;background:#161618}
  .lbl{display:flex;align-items:center;gap:12px;padding:10px 14px;background:#1b1b1e;border-bottom:1px solid var(--line);font-weight:600;font-size:14px}
  .lbl .f{color:var(--mut);font-weight:400;font-size:12px}
  .verdict{margin-left:auto;display:flex;gap:6px}
  .verdict button{border:1px solid var(--line);background:#222;color:var(--fg);border-radius:6px;padding:3px 10px;cursor:pointer;font-size:12px}
  .verdict .ok.on{background:var(--ok);border-color:var(--ok);color:#fff}
  .verdict .no.on{background:var(--no);border-color:var(--no);color:#fff}
  .pair{display:grid;grid-template-columns:1fr 1fr;gap:2px;background:var(--line)}
  figure{margin:0;background:#0b0b0d;position:relative}
  figcaption{position:absolute;top:8px;left:8px;background:rgba(0,0,0,.6);padding:2px 8px;border-radius:4px;font-size:11px;letter-spacing:.04em;color:#fff}
  img{display:block;width:100%;height:auto}
  .miss{color:var(--no);font-weight:400}
  .summary{position:fixed;right:16px;bottom:16px;background:#1b1b1e;border:1px solid var(--line);border-radius:8px;padding:10px 14px;font-size:12.5px;z-index:20}
  .summary b{color:var(--fg)}
</style></head><body>
<header>
  <h1>Verdict Board · /about · НАШЕ vs ЖИВЕ</h1>
  <div class="sub">Твоє око — суддя. Тисни ✓ok / ✗ні по кожній секції. Число внизу рахує саме себе. desktop = about-scrub-v6 · m390 = about-scrub-m390 (committed 91fe403).</div>
  <div class="tabs"><button data-vp="d" class="active">Desktop</button><button data-vp="m">Mobile 390</button></div>
</header>
<section class="vp active" id="d">${renderRows(desktop, 'd')}</section>
<section class="vp" id="m">${renderRows(m390, 'm')}</section>
<div class="summary" id="sum">вердикт: <b>0</b> ok · <b>0</b> ні · <span id="left"></span> лишилось</div>
<script>
  const tabs=[...document.querySelectorAll('.tabs button')];
  tabs.forEach(t=>t.onclick=()=>{tabs.forEach(x=>x.classList.remove('active'));t.classList.add('active');
    document.querySelectorAll('.vp').forEach(s=>s.classList.remove('active'));document.getElementById(t.dataset.vp).classList.add('active');});
  const state={};
  function refresh(){let ok=0,no=0,tot=0;document.querySelectorAll('.row').forEach(r=>{if(r.querySelector('.verdict')){tot++;const v=state[r.id];if(v==='ok')ok++;if(v==='no')no++;}});
    document.querySelector('#sum b:nth-of-type(1)').textContent=ok;document.querySelector('#sum b:nth-of-type(2)').textContent=no;document.getElementById('left').textContent=(tot-ok-no);}
  document.querySelectorAll('.row').forEach(r=>{const ok=r.querySelector('.ok'),no=r.querySelector('.no');if(!ok)return;
    ok.onclick=()=>{state[r.id]='ok';ok.classList.add('on');no.classList.remove('on');refresh();};
    no.onclick=()=>{state[r.id]='no';no.classList.add('on');ok.classList.remove('on');refresh();};});
  refresh();
</script>
</body></html>`;

writeFileSync('library/boards/about-verdict/index.html', html);
const sizeMB = (Buffer.byteLength(html) / 1048576).toFixed(1);
console.log('WROTE library/boards/about-verdict/index.html ·', sizeMB, 'MB');
console.log('desktop rows:', desktop.filter(r => !r.missing).length, '/ ', desktop.length);
console.log('m390 rows:', m390.filter(r => !r.missing).length, '/ ', m390.length);
