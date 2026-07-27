// so2-gate.mjs — SO-2 Wellness→Nature incl. the NEW inner CAROUSEL (Spa·Yoga·Fitness·Café).
// Verifies: pin sticks, screen never dark, all 4 tab captions appear with the right rail item active,
// each tab photo actually renders (luma), and the Nature seam still completes.
import { pathToFileURL } from 'url';
async function pw(){ const {createRequire}=await import('node:module');
  for(const r of ['/Users/yehorfedorov/.ssh/pdf-export-service/node_modules/playwright/package.json']){
    try{return (await import('node:module')).createRequire(pathToFileURL(r))('playwright').chromium;}catch{}}
  try{return (await import('playwright')).chromium;}catch{return null;} }
const chromium=await pw(); if(!chromium){console.error('no pw');process.exit(2);}
const URL='http://localhost:8879/suborganisms/SO-2-wellness-nature/index.html';
const TAB_PHASE=[['Spa',0.58],['Yoga',0.65],['Fitness',0.73],['Café',0.80]];
async function run(vp,label){
  const b=await chromium.launch();const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1,isMobile:vp.width<600,hasTouch:vp.width<600});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,90)));p.on('console',m=>{if(m.type()==='error')errs.push('c:'+m.text().slice(0,90));});
  await p.goto(URL,{waitUntil:'load',timeout:30000});await p.waitForTimeout(600);
  const ok=await p.evaluate(()=>window.__SO2_OK__===true);
  // check each tab: caption + active rail + screen lit
  let tabsOk=true, minTabLuma=999;
  for(const [name,s] of TAB_PHASE){
    await p.goto(`${URL}?s=${s}`,{waitUntil:'load'}); await p.waitForTimeout(500);
    const st=await p.evaluate(()=>({cap:document.getElementById('wcapName').textContent, on:[...document.querySelectorAll('.wrail__i.on')].map(e=>e.textContent)}));
    const buf=await p.screenshot();
    const luma=await p.evaluate(async b64=>{const img=new Image();img.src='data:image/png;base64,'+b64;await img.decode();const c=document.createElement('canvas');c.width=80;c.height=50;const g=c.getContext('2d');g.drawImage(img,0,0,80,50);const d=g.getImageData(0,0,80,50).data;let s=0,n=0;for(let k=0;k<d.length;k+=4){s+=0.299*d[k]+0.587*d[k+1]+0.114*d[k+2];n++;}return +(s/n).toFixed(0);},buf.toString('base64'));
    if(luma<minTabLuma)minTabLuma=luma;
    // Yoga tab is an intentionally dark/moody editorial photo (woman against a dark ground) — live
    // springs' yoga slide is equally dark. So the tab-luma floor is 30 here, not 45 (cf. SO-7 footer).
    if(st.cap!==name || st.on[0]!==name || luma<30) tabsOk=false;
  }
  // nature seam completes
  await p.goto(`${URL}?s=0.98`,{waitUntil:'load'}); await p.waitForTimeout(500);
  const natureOk=await p.evaluate(()=>{const nl=[...document.querySelectorAll('#natB .ln')];return nl.every(l=>parseFloat(getComputedStyle(l).getPropertyValue('--r'))>0.7);});
  // pin sticks across scroll
  let maxPin=0; const total=await p.evaluate(()=>document.getElementById('track').offsetHeight-window.innerHeight);
  for(let i=0;i<=20;i++){await p.evaluate(y=>window.scrollTo(0,y),Math.round(total*i/20));await p.waitForTimeout(40);
    const pt=await p.evaluate(()=>Math.round(document.querySelector('.pin').getBoundingClientRect().top));if(Math.abs(pt)>maxPin)maxPin=Math.abs(pt);}
  await b.close();
  return {label,ok,tabsOk,minTabLuma,natureOk,maxPin,errs:errs.length,el:errs.slice(0,3)};
}
for(const [vp,lbl] of [[{width:1440,height:900},'desktop'],[{width:390,height:844},'mobile']]){
  const r=await run(vp,lbl);
  const pass=r.ok&&r.tabsOk&&r.minTabLuma>=30&&r.natureOk&&r.maxPin<=4&&r.errs===0;
  console.log(`[${r.label}] ${pass?'✅ PASS':'❌ FAIL'} ok=${r.ok} tabs(Spa/Yoga/Fitness/Café)=${r.tabsOk} minTabLuma=${r.minTabLuma} natureSeam=${r.natureOk} pinTop=${r.maxPin} errs=${r.errs} ${r.el.join(';')}`);
}
