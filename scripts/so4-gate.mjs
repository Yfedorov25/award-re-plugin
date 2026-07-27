/* SO-4 gate — colour-flip section. luma≥45 (never dark-empty), pinTop≈0, 0 err, both platforms.
   PLUS flip proof: Location phase must go LIGHT (maxLuma≥110 = cream flip actually happens) and
   dark-ink copy must be legible over cream (contrast check on the copy region). */
import { pathToFileURL } from 'url';
async function pw(){ const {createRequire}=await import('node:module');
  for(const r of ['/Users/yehorfedorov/.ssh/pdf-export-service/node_modules/playwright/package.json']){
    try{const req=createRequire(pathToFileURL(r));return req('playwright').chromium;}catch{}}
  try{return (await import('playwright')).chromium;}catch{return null;} }
const chromium=await pw(); if(!chromium){console.error('no playwright');process.exit(2);}
const URL='http://localhost:8879/suborganisms/SO-4-place-location/index.html';
const SAMPLES=46;

async function run(vp,label){
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1,isMobile:vp.width<600,hasTouch:vp.width<600});
  const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>{if(m.type()==='error')errs.push('c:'+m.text());});
  await p.goto(URL,{waitUntil:'load',timeout:30000});
  await p.waitForTimeout(700);
  const ok=await p.evaluate(()=>window.__SO4_OK__===true);
  const total=await p.evaluate(()=>document.getElementById('track').offsetHeight-window.innerHeight);
  let minLuma=999,maxLuma=0,maxPinTop=0,overlaps=0,copyLegibleFrames=0,locFramesChecked=0;
  for(let i=0;i<=SAMPLES;i++){
    const y=Math.round(total*i/SAMPLES);
    await p.evaluate(yy=>window.scrollTo(0,yy),y);
    await p.waitForTimeout(70);
    const buf=await p.screenshot();
    const stat=await p.evaluate(async(b64)=>{
      const img=new Image(); img.src='data:image/png;base64,'+b64; await img.decode();
      const c=document.createElement('canvas'); c.width=160;c.height=100;
      const g=c.getContext('2d'); g.drawImage(img,0,0,160,100);
      const d=g.getImageData(0,0,160,100).data; let s=0,n=0;
      for(let k=0;k<d.length;k+=4){s+=0.2126*d[k]+0.7152*d[k+1]+0.0722*d[k+2];n++;}
      const luma=s/n;
      // copy-region luma (top-left, where dark ink sits) — for contrast when Location is up
      let cs=0,cn=0;
      const ig=g.getImageData(6,10,64,40).data;
      for(let k=0;k<ig.length;k+=4){cs+=0.2126*ig[k]+0.7152*ig[k+1]+0.0722*ig[k+2];cn++;}
      return {luma, copyLuma:cs/cn};
    },buf.toString('base64'));
    if(stat.luma<minLuma)minLuma=stat.luma;
    if(stat.luma>maxLuma)maxLuma=stat.luma;
    const st=await p.evaluate(()=>{
      const pin=document.querySelector('.pin').getBoundingClientRect().top;
      const locO=+getComputedStyle(document.getElementById('loc')).opacity||0;
      const copyO=+getComputedStyle(document.getElementById('locCopy')).opacity||0;
      // overlap: place-tail lines AND location copy both strongly visible at once?
      const placeAvg=[].slice.call(document.querySelectorAll('#placeB .ln')).reduce((a,l)=>a+(+getComputedStyle(l).opacity||0),0)/4;
      return {pin:Math.round(pin),locO:+locO.toFixed(2),copyO:+copyO.toFixed(2),placeAvg:+placeAvg.toFixed(2)};
    });
    if(Math.abs(st.pin)>maxPinTop)maxPinTop=Math.abs(st.pin);
    if(st.locO>0.6 && st.placeAvg>0.35) overlaps++;   // cream up AND place text still strong = overlap
    // when Location copy is visible on cream, its region should be light enough that dark ink reads
    if(st.locO>0.7 && st.copyO>0.6){ locFramesChecked++; if(stat.copyLuma>=95) copyLegibleFrames++; }
  }
  await b.close();
  const creamLegible = locFramesChecked===0 ? true : (copyLegibleFrames/locFramesChecked)>=0.6;
  return {label,ok,minLuma:+minLuma.toFixed(1),maxLuma:+maxLuma.toFixed(1),maxPinTop,overlaps,creamLegible,locFramesChecked,copyLegibleFrames,errs:errs.length,errList:errs.slice(0,4)};
}

const d=await run({width:1440,height:900},'desktop');
const m=await run({width:390,height:844},'mobile');
for(const r of [d,m]){
  const pass = r.ok && r.minLuma>=45 && r.maxLuma>=110 && r.maxPinTop<=4 && r.overlaps===0 && r.errs===0 && r.creamLegible;
  console.log(`\n[${r.label}] ${pass?'✅ PASS':'❌ FAIL'}`);
  console.log(`  __SO4_OK__: ${r.ok}`);
  console.log(`  minLuma: ${r.minLuma} (≥45)  maxLuma: ${r.maxLuma} (≥110 = cream flip happened)`);
  console.log(`  maxPinTop: ${r.maxPinTop} (≤4)  overlaps: ${r.overlaps} (0)`);
  console.log(`  cream-legible: ${r.creamLegible} (${r.copyLegibleFrames}/${r.locFramesChecked} loc-copy frames light enough)`);
  console.log(`  errs: ${r.errs} ${r.errList.join(' ; ')}`);
}
