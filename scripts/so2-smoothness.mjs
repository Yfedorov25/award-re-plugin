// so2-smoothness.mjs — measures INTRO→carousel smoothness of SO-2 via REAL scroll.
// The functional gate (so2-gate) is BLIND to jerk: it checks tab captions/luma at settled phases,
// not how frames flow between them. Yehor caught the intro title popping in/out by eye (rec 14.43).
// Method: load once, set window.__SCAN__ to freeze the rAF lerp, then drive window.render(s) at
// EXACT scroll-progress s in fine equal steps and measure per-step frame-diff (mean abs pixel delta
// on a downscaled canvas). This is the true frame-to-frame delta a CONTINUOUS scroll produces.
// (We tried window.scrollTo + lerp-settle first, but the 0.09 lerp undershoots inconsistently, so
// consecutive samples landed at variable `smooth` and injected phantom steps — a measurement
// artifact, not a real snap.) Smooth = a low ramp, no sawtooth spikes (the bug looked like 31→2→47→8).
import { pathToFileURL } from 'url';
async function pw(){ const {createRequire}=await import('node:module');
  for(const r of ['/Users/yehorfedorov/.ssh/pdf-export-service/node_modules/playwright/package.json']){
    try{return createRequire(pathToFileURL(r))('playwright').chromium;}catch{}}
  try{return (await import('playwright')).chromium;}catch{return null;} }
const chromium=await pw(); if(!chromium){console.error('no pw');process.exit(2);}
const URL='http://localhost:8879/suborganisms/SO-2-wellness-nature/index.html';
const N=74, PMAX=0.76;                 // intro reveal → hold → rise-out → rail/carousel entry → Spa solo → first FULL tab swap
async function run(vp,label){
  const b=await chromium.launch();const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1});
  const p=await ctx.newPage();
  await p.goto(URL,{waitUntil:'load'});
  await p.evaluate(async ()=>{ await Promise.all([1,2,3,4].map(n=>{const i=new Image();
    i.src=`media/wellness-tab-${n}-hd.webp`;return i.decode().catch(()=>{});})); });
  await p.evaluate(()=>{ window.__SCAN__=true; });   // freeze the rAF lerp; we drive render() at exact s
  await p.waitForTimeout(300);
  const diffs=[]; let prev=null;
  for(let i=0;i<=N;i++){
    const s=(i/N)*PMAX;
    // drive render() at EXACT progress s — deterministic, no lerp undershoot. This is what a
    // continuous scroll produces frame-to-frame; jump-scroll+lerp injected variable lag artifacts.
    await p.evaluate(v=>{ window.smooth=v; window.render(v); }, s);
    await p.waitForTimeout(90);
    const buf=await p.screenshot();
    const d=await p.evaluate(async b64=>{const img=new Image();img.src='data:image/png;base64,'+b64;await img.decode();
      const c=document.createElement('canvas');c.width=120;c.height=75;const g=c.getContext('2d');
      g.drawImage(img,0,0,120,75);return [...g.getImageData(0,0,120,75).data];},buf.toString('base64'));
    if(prev){let s2=0;for(let k=0;k<d.length;k+=4){s2+=Math.abs(d[k]-prev[k])+Math.abs(d[k+1]-prev[k+1])+Math.abs(d[k+2]-prev[k+2]);}
      diffs.push(+(s2/(d.length/4*3)).toFixed(2));}
    prev=d;
  }
  await b.close();
  const max=Math.max(...diffs), mean=+(diffs.reduce((a,c)=>a+c,0)/diffs.length).toFixed(2);
  const SPIKE=6; let saw=0;
  for(let i=1;i<diffs.length-1;i++){ const a=diffs[i-1],x=diffs[i],c=diffs[i+1];
    if((x-a>SPIKE&&x-c>SPIKE)||(a-x>SPIKE&&c-x>SPIKE)) saw++; }
  return {label,max,mean,saw,diffs};
}
// The DEFINING signature of the "appears/disappears/appears" bug is a SAWTOOTH spike (a lone frame
// that jumps far above BOTH neighbours) — so sawtooth===0 is the hard pass condition. maxStep is a
// secondary amplitude guard, and its ceiling is viewport-dependent: mobile tabs are full-bleed (100%
// width) vs desktop's 50%, so a legit full-screen cross-dissolve moves ~2× the pixels. Ceilings:
// desktop 16, mobile 28 — a smooth ramp under these with no sawtooth reads as a glide by eye.
// (Measured mobile Spa→Yoga full-bleed cross-dissolve peaks ~25/step as a monotonic ramp — verified
// smooth by eye in the entry filmstrip; sawtooth===0 is what actually rules out the "pop" bug.)
for(const [vp,lbl,ceil] of [[{width:1440,height:900},'desktop',16],[{width:390,height:844},'mobile',28]]){
  const r=await run(vp,lbl);
  const pass=r.max<=ceil && r.saw===0;
  console.log(`[${r.label}] ${pass?'✅ SMOOTH':'❌ JERKY'} maxStep=${r.max} (ceil ${ceil}) mean=${r.mean} sawtoothSpikes=${r.saw}`);
  console.log(`   series: ${r.diffs.join(' ')}`);
}
