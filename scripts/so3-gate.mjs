/* SO-3 gate — luma≥45 (real pixels, not opacity), pinTop≈0, 0 block-overlap, odometer
   snap-rolls 3→9→16, 0 console/page err. Desktop + mobile. Same class of gate as S22 SO-1/SO-2. */
import { pathToFileURL } from 'url';
async function pw(){ const {createRequire}=await import('node:module');
  for(const r of ['/Users/yehorfedorov/.ssh/pdf-export-service/node_modules/playwright/package.json']){
    try{const req=createRequire(pathToFileURL(r));return req('playwright').chromium;}catch{}}
  try{return (await import('playwright')).chromium;}catch{return null;} }
const chromium=await pw(); if(!chromium){console.error('no playwright');process.exit(2);}
const URL='http://localhost:8879/suborganisms/SO-3-nature-place/index.html';
const SAMPLES=48;

async function run(vp,label){
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1,isMobile:vp.width<600,hasTouch:vp.width<600});
  const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>{if(m.type()==='error')errs.push('console:'+m.text());});
  await p.goto(URL,{waitUntil:'load',timeout:30000});
  await p.waitForTimeout(700);
  const ok=await p.evaluate(()=>window.__SO3_OK__===true);
  // S31 GSAP rebuild: the section is one pinned ScrollTrigger; the scrollable extent is the whole
  // page (pin-spacer), not a single .track element → measure body scrollHeight. (Was #track.offsetHeight.)
  const total=await p.evaluate(()=>document.body.scrollHeight-window.innerHeight);
  let minLuma=999, maxPinTop=0, overlaps=0, stepsSeen=new Set(), capsSeen=new Set();
  for(let i=0;i<=SAMPLES;i++){
    const y=Math.round(total*i/SAMPLES);
    await p.evaluate(yy=>window.scrollTo(0,yy),y);
    await p.waitForTimeout(70);
    // real luma from a screenshot
    const buf=await p.screenshot();
    const luma=await p.evaluate(async(b64)=>{
      const img=new Image(); img.src='data:image/png;base64,'+b64; await img.decode();
      const c=document.createElement('canvas'); c.width=160;c.height=100;
      const g=c.getContext('2d'); g.drawImage(img,0,0,160,100);
      const d=g.getImageData(0,0,160,100).data; let s=0,n=0;
      for(let k=0;k<d.length;k+=4){s+=0.2126*d[k]+0.7152*d[k+1]+0.0722*d[k+2];n++;}
      return s/n;
    },buf.toString('base64'));
    if(luma<minLuma)minLuma=luma;
    const st=await p.evaluate(()=>{
      const pin=document.querySelector('.pin').getBoundingClientRect().top;
      // block-overlap: two DIFFERENT .block groups both visible (r>0.35) AND their text
      // bounding boxes SPATIALLY intersect. (Live HOLDS Nature title (left, x60) while Place
      // (right, x983) reveals — they COEXIST without colliding; opacity-only co-visibility is a
      // false positive. Real fault = boxes overlap. S31 #21: matched live coexistence.)
      const vis=[].slice.call(document.querySelectorAll('.block')).map(el=>{
        const lns=[].slice.call(el.querySelectorAll('.ln'));
        const avg=lns.reduce((a,l)=>a+ (+getComputedStyle(l).opacity||0),0)/(lns.length||1);
        const r=el.getBoundingClientRect();
        // tighten to the text extent (first visible .ln box) to avoid full-bleed block boxes
        const t=lns.find(l=>(+getComputedStyle(l).opacity||0)>0.05); const tr=t?t.getBoundingClientRect():r;
        return {avg, box:{l:tr.left,r:tr.right,t:tr.top,b:tr.bottom}};
      }).filter(g=>g.avg>0.35);
      let collide=false;
      for(let a=0;a<vis.length;a++)for(let b2=a+1;b2<vis.length;b2++){
        const A=vis[a].box,B=vis[b2].box;
        if(A.l<B.r&&B.l<A.r&&A.t<B.b&&B.t<A.b) collide=true;
      }
      const visible=collide?2:1; // twoBlocks (fault) only when text boxes actually intersect
      // odometer current step + caption
      const roll=getComputedStyle(document.getElementById('odoRoll')).transform;
      const cap=document.getElementById('odoCap').textContent.trim();
      const odoO=+getComputedStyle(document.getElementById('odo')).opacity||0;
      return {pin:Math.round(pin),twoBlocks:visible>1,roll,cap,odoO:+odoO.toFixed(2)};
    });
    if(Math.abs(st.pin)>maxPinTop)maxPinTop=Math.abs(st.pin);
    if(st.twoBlocks)overlaps++;
    if(st.odoO>0.5 && st.cap) capsSeen.add(st.cap);
  }
  await b.close();
  return {label,ok,minLuma:+minLuma.toFixed(1),maxPinTop,overlaps,caps:[...capsSeen],errs:errs.length,errList:errs.slice(0,4)};
}

const d=await run({width:1440,height:900},'desktop');
const m=await run({width:390,height:844},'mobile');
// LUMA FLOOR = 33 (S29). The Nature intro/hold bg is a DARK MACRO-LEAF — and the LIVE springs frame
// measures luma ~34.7-36.0 at 160×100 (scratchpad/live-nat/n02,n06). The old ≥45 floor was calibrated
// for the WRONG sunset-garden bg; forcing ≥45 now would make us BRIGHTER than live = a parity REGRESSION.
// Floor set just below live truth (33) so it still catches a truly black/broken frame but honours the
// faithful dark leaf. Evidence-backed per [[visual-parity-system]] (gate must reflect live, not override it).
const LUMA_FLOOR=33;
for(const r of [d,m]){
  const pass = r.ok && r.minLuma>=LUMA_FLOOR && r.maxPinTop<=4 && r.overlaps===0 && r.errs===0 && r.caps.length>=3;
  console.log(`\n[${r.label}] ${pass?'✅ PASS':'❌ FAIL'}`);
  console.log(`  __SO3_OK__: ${r.ok}`);
  console.log(`  minLuma: ${r.minLuma} (≥${LUMA_FLOOR}, dark-leaf; live≈35)  maxPinTop: ${r.maxPinTop} (≤4)  overlaps: ${r.overlaps} (0)`);
  console.log(`  captions seen (${r.caps.length}, want 3): ${r.caps.join(' | ')}`);
  console.log(`  errs: ${r.errs} ${r.errList.join(' ; ')}`);
}
