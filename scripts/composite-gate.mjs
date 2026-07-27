// composite-gate.mjs — verifies the INLINE single-page composite (no iframes): all 7 sub-organisms
// present, 0 console errors, section advances PROPORTIONALLY to scroll (the fix for the iframe
// stutter where the page froze on SO-1 for ~9s then jumped), and each section reveals across scroll.
import { pathToFileURL } from 'url';
async function pw(){ const {createRequire}=await import('node:module');
  for(const r of ['/Users/yehorfedorov/.ssh/pdf-export-service/node_modules/playwright/package.json']){
    try{return (await import('node:module')).createRequire(pathToFileURL(r))('playwright').chromium;}catch{}}
  try{return (await import('playwright')).chromium;}catch{return null;} }
const chromium=await pw(); if(!chromium){console.error('no pw');process.exit(2);}
const URL='http://localhost:8879/suborganisms/COMPOSITE-home/index.html';
async function run(vp,label){
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1,isMobile:vp.width<600,hasTouch:vp.width<600});
  const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(String(e).slice(0,90)));
  p.on('console',m=>{if(m.type()==='error')errs.push('c:'+m.text().slice(0,90));});
  await p.goto(URL,{waitUntil:'load',timeout:45000});
  await p.waitForTimeout(2500);
  const compOk=await p.evaluate(()=>window.__COMPOSITE_OK__===true);
  const nSecs=await p.evaluate(()=>document.querySelectorAll('.so').length);
  const nTracks=await p.evaluate(()=>[1,2,3,4,5,6,7].filter(n=>document.getElementById('track'+n)).length);
  const H=await p.evaluate(()=>document.body.scrollHeight-window.innerHeight);
  // EVERY section's pin must actually stick (pinTop≈0, pinVisible) AND render real content (luma>=45),
  // not collapse to an empty text-only block. This catches the invalid-@media-scoping bug that made
  // SO-4..7 tracks collapse to 100vh so their pins never engaged (empty green + stray explainer text).
  const pins=[];
  for(let n=1;n<=7;n++){
    const y=await p.evaluate((n)=>{const t=document.getElementById('track'+n);return Math.round(t.getBoundingClientRect().top+window.scrollY+t.offsetHeight*0.45-window.innerHeight*0.5);},n);
    await p.evaluate(y=>window.scrollTo(0,y),y); await p.waitForTimeout(200);
    const st=await p.evaluate((n)=>{const t=document.getElementById('track'+n);const pin=document.querySelector('#so'+n+' .pin');const pr=pin.getBoundingClientRect();
      return {trackH:t.offsetHeight, pinTop:Math.round(pr.top), pinVisible: pr.top<=12&&pr.bottom>=window.innerHeight-12};},n);
    const buf=await p.screenshot();
    const luma=await p.evaluate(async b64=>{const img=new Image();img.src='data:image/png;base64,'+b64;await img.decode();const c=document.createElement('canvas');c.width=80;c.height=50;const g=c.getContext('2d');g.drawImage(img,0,0,80,50);const d=g.getImageData(0,0,80,50).data;let s=0,m=0;for(let k=0;k<d.length;k+=4){s+=0.299*d[k]+0.587*d[k+1]+0.114*d[k+2];m++;}return +(s/m).toFixed(0);},buf.toString('base64'));
    const tall=st.trackH>vp.height*1.5;
    // Per-section luma floor. SO-3 Nature is sampled mid-hold where the bg is a DARK MACRO-LEAF —
    // the LIVE springs frame measures ~35 there (evidence: scratchpad/live-nat/n02). A flat ≥45 would
    // force us BRIGHTER than live = parity regression. SO-3 floor = 30 (still catches a black/broken pin).
    const lumaFloor = (n===3) ? 30 : 45;
    pins.push({n, trackTall: tall, pinVisible: st.pinVisible, luma, floor:lumaFloor, ok: tall && st.pinVisible && luma>=lumaFloor});
  }
  const allPinsOk=pins.every(x=>x.ok);
  await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(200);
  // section must advance across scroll: sample 11 positions, collect distinct SO seen and check order
  const seq=[];
  for(let i=0;i<=20;i++){ await p.evaluate(y=>window.scrollTo(0,y),Math.round(H*i/20)); await p.waitForTimeout(50);
    const n=await p.evaluate(()=>{const t=document.getElementById('chud').textContent;return +t.match(/SO-(\d)/)[1];}); seq.push(n); }
  const distinct=[...new Set(seq)];
  const monotonic=seq.every((v,i)=>i===0||v>=seq[i-1]);  // never goes backwards
  // no single section may hog >55% of the scroll (the iframe bug pinned SO-1 for ~75%)
  const counts={}; seq.forEach(n=>counts[n]=(counts[n]||0)+1);
  const maxShare=Math.max(...Object.values(counts))/seq.length;
  await b.close();
  return {label,compOk,nSecs,nTracks,H,distinctCount:distinct.length,monotonic,maxShare:+maxShare.toFixed(2),allPinsOk,pins,errs:errs.length,el:errs.slice(0,3)};
}
for(const [vp,lbl] of [[{width:1440,height:900},'desktop'],[{width:390,height:844},'mobile']]){
  const r=await run(vp,lbl);
  const pass=r.compOk&&r.nSecs===7&&r.nTracks===7&&r.distinctCount===7&&r.monotonic&&r.maxShare<=0.55&&r.allPinsOk&&r.errs===0;
  const badPins=r.pins.filter(x=>!x.ok).map(x=>`SO-${x.n}(tall=${x.trackTall},vis=${x.pinVisible},luma=${x.luma})`);
  console.log(`[${r.label}] ${pass?'✅ PASS':'❌ FAIL'} ok=${r.compOk} secs=${r.nSecs} seen7=${r.distinctCount} monotonic=${r.monotonic} maxShare=${r.maxShare} allPins=${r.allPinsOk} errs=${r.errs} ${badPins.length?'BADPINS:'+badPins.join(','):''} ${r.el.join(';')}`);
}
