import { pathToFileURL } from 'url';
async function pw(){ const {createRequire}=await import('node:module');
  for(const r of ['/Users/yehorfedorov/.ssh/pdf-export-service/node_modules/playwright/package.json']){
    try{return (await import('node:module')).createRequire(pathToFileURL(r))('playwright').chromium;}catch{}}
  try{return (await import('playwright')).chromium;}catch{return null;} }
const chromium=await pw(); if(!chromium){console.error('no pw');process.exit(2);}
const URL='http://localhost:8879/suborganisms/SO-6-residences-interiors/index.html';
async function run(vp,label){
  const b=await chromium.launch();const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1,isMobile:vp.width<600,hasTouch:vp.width<600});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push('c:'+m.text());});
  await p.goto(URL,{waitUntil:'load',timeout:30000});await p.waitForTimeout(700);
  const ok=await p.evaluate(()=>window.__SO6_OK__===true);
  // residence cards swap correctly (Flats/Townhouses/Penthouses with their stats)
  let cardsOk=true;
  for(const [nm,s,n] of [['Flats',0.20,'138'],['Townhouses',0.34,'5'],['Penthouses',0.47,'7']]){
    await p.goto(`${URL}?s=${s}`,{waitUntil:'load'});await p.waitForTimeout(450);
    const st=await p.evaluate(()=>({nm:document.getElementById('rcardName').textContent,n:document.getElementById('rcardN').textContent}));
    if(st.nm!==nm||st.n!==n)cardsOk=false;
  }
  await p.goto(URL,{waitUntil:'load'});await p.waitForTimeout(300);
  const total=await p.evaluate(()=>document.getElementById('track').offsetHeight-window.innerHeight);
  let minL=999,maxPin=0,wordSeen=false,copySeen=false,photoSeen=false;
  for(let i=0;i<=44;i++){const y=Math.round(total*i/44);await p.evaluate(yy=>window.scrollTo(0,yy),y);await p.waitForTimeout(70);
    const buf=await p.screenshot();
    const l=await p.evaluate(async b64=>{const img=new Image();img.src='data:image/png;base64,'+b64;await img.decode();const c=document.createElement('canvas');c.width=160;c.height=100;const g=c.getContext('2d');g.drawImage(img,0,0,160,100);const d=g.getImageData(0,0,160,100).data;let s=0,n=0;for(let k=0;k<d.length;k+=4){s+=0.2126*d[k]+0.7152*d[k+1]+0.0722*d[k+2];n++;}return s/n;},buf.toString('base64'));
    if(l<minL)minL=l;
    const st=await p.evaluate(()=>{const pin=document.querySelector('.pin').getBoundingClientRect().top;
      return {pin:Math.round(pin),w:+getComputedStyle(document.getElementById('word')).opacity||0,c:+getComputedStyle(document.getElementById('copy')).opacity||0,ph:+getComputedStyle(document.getElementById('photo')).opacity||0};});
    if(Math.abs(st.pin)>maxPin)maxPin=Math.abs(st.pin);
    if(st.w>0.8)wordSeen=true;if(st.c>0.8)copySeen=true;if(st.ph>0.8)photoSeen=true;}
  await b.close();
  return {label,ok,cardsOk,minL:+minL.toFixed(1),maxPin,wordSeen,copySeen,photoSeen,errs:errs.length,el:errs.slice(0,3)};
}
for(const [vp,lbl] of [[{width:1440,height:900},'desktop'],[{width:390,height:844},'mobile']]){
  const r=await run(vp,lbl);
  const pass=r.ok&&r.cardsOk&&r.minL>=45&&r.maxPin<=4&&r.wordSeen&&r.copySeen&&r.photoSeen&&r.errs===0;
  console.log(`[${r.label}] ${pass?'✅ PASS':'❌ FAIL'} ok=${r.ok} cards=${r.cardsOk} minLuma=${r.minL} pinTop=${r.maxPin} word=${r.wordSeen} copy=${r.copySeen} photo=${r.photoSeen} errs=${r.errs} ${r.el.join(';')}`);
}
