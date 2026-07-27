/* SO-5 gate — cream-continues section. luma≥45 (never dark), cream stays high (maxLuma≥180),
   pinTop≈0, 0 err, both platforms. PLUS: manifesto + both architecture cards appear. */
import { pathToFileURL } from 'url';
async function pw(){ const {createRequire}=await import('node:module');
  for(const r of ['/Users/yehorfedorov/.ssh/pdf-export-service/node_modules/playwright/package.json']){
    try{const req=createRequire(pathToFileURL(r));return req('playwright').chromium;}catch{}}
  try{return (await import('playwright')).chromium;}catch{return null;} }
const chromium=await pw(); if(!chromium){console.error('no playwright');process.exit(2);}
const URL='http://localhost:8879/suborganisms/SO-5-location-residences/index.html';
const SAMPLES=46;

async function run(vp,label){
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1,isMobile:vp.width<600,hasTouch:vp.width<600});
  const p=await ctx.newPage();
  const errs=[]; p.on('pageerror',e=>errs.push(String(e))); p.on('console',m=>{if(m.type()==='error')errs.push('c:'+m.text());});
  await p.goto(URL,{waitUntil:'load',timeout:30000});
  await p.waitForTimeout(700);
  const ok=await p.evaluate(()=>window.__SO5_OK__===true);
  const total=await p.evaluate(()=>document.getElementById('track').offsetHeight-window.innerHeight);
  let minLuma=999,maxLuma=0,maxPinTop=0,card1Seen=false,card2Seen=false,manifestoSeen=false;
  for(let i=0;i<=SAMPLES;i++){
    const y=Math.round(total*i/SAMPLES);
    await p.evaluate(yy=>window.scrollTo(0,yy),y);
    await p.waitForTimeout(70);
    const buf=await p.screenshot();
    const luma=await p.evaluate(async(b64)=>{
      const img=new Image(); img.src='data:image/png;base64,'+b64; await img.decode();
      const c=document.createElement('canvas'); c.width=160;c.height=100;
      const g=c.getContext('2d'); g.drawImage(img,0,0,160,100);
      const d=g.getImageData(0,0,160,100).data; let s=0,n=0;
      for(let k=0;k<d.length;k+=4){s+=0.2126*d[k]+0.7152*d[k+1]+0.0722*d[k+2];n++;}
      return s/n;
    },buf.toString('base64'));
    if(luma<minLuma)minLuma=luma; if(luma>maxLuma)maxLuma=luma;
    const st=await p.evaluate(()=>{
      const pin=document.querySelector('.pin').getBoundingClientRect().top;
      const c1=+getComputedStyle(document.getElementById('card1')).opacity||0;
      const c2=+getComputedStyle(document.getElementById('card2')).opacity||0;
      const mO=+getComputedStyle(document.getElementById('manifesto')).opacity||0;
      return {pin:Math.round(pin),c1,c2,mO};
    });
    if(Math.abs(st.pin)>maxPinTop)maxPinTop=Math.abs(st.pin);
    if(st.c1>0.8)card1Seen=true; if(st.c2>0.8)card2Seen=true; if(st.mO>0.8)manifestoSeen=true;
  }
  await b.close();
  return {label,ok,minLuma:+minLuma.toFixed(1),maxLuma:+maxLuma.toFixed(1),maxPinTop,card1Seen,card2Seen,manifestoSeen,errs:errs.length,errList:errs.slice(0,4)};
}
const d=await run({width:1440,height:900},'desktop');
const m=await run({width:390,height:844},'mobile');
for(const r of [d,m]){
  const pass = r.ok && r.minLuma>=45 && r.maxLuma>=180 && r.maxPinTop<=4 && r.card1Seen && r.card2Seen && r.manifestoSeen && r.errs===0;
  console.log(`\n[${r.label}] ${pass?'✅ PASS':'❌ FAIL'}`);
  console.log(`  __SO5_OK__: ${r.ok}`);
  console.log(`  minLuma: ${r.minLuma} (≥45)  maxLuma: ${r.maxLuma} (≥180 cream)  maxPinTop: ${r.maxPinTop} (≤4)`);
  console.log(`  card1: ${r.card1Seen}  card2: ${r.card2Seen}  manifesto: ${r.manifestoSeen}`);
  console.log(`  errs: ${r.errs} ${r.errList.join(' ; ')}`);
}
