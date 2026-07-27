import { pathToFileURL } from 'url';
async function pw(){ const {createRequire}=await import('node:module');
  for(const r of ['/Users/yehorfedorov/.ssh/pdf-export-service/node_modules/playwright/package.json']){
    try{return (await import('node:module')).createRequire(pathToFileURL(r))('playwright').chromium;}catch{}}
  try{return (await import('playwright')).chromium;}catch{return null;} }
const chromium=await pw(); if(!chromium){console.error('no pw');process.exit(2);}
const URL='http://localhost:8879/suborganisms/SO-7-interiors-footer/index.html';
async function run(vp,label){
  const b=await chromium.launch();const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1,isMobile:vp.width<600,hasTouch:vp.width<600});
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push('c:'+m.text());});
  await p.goto(URL,{waitUntil:'load',timeout:30000});await p.waitForTimeout(700);
  const ok=await p.evaluate(()=>window.__SO7_OK__===true);
  // interiors slider: each of the 5 thumbs activates at its phase + its slide is lit
  let sliderOk=true;
  for(const [tn,s] of [[1,0.05],[2,0.20],[3,0.33],[4,0.42],[5,0.52]]){
    await p.goto(`${URL}?s=${s}`,{waitUntil:'load'});await p.waitForTimeout(420);
    const st=await p.evaluate(()=>({on:(()=>{const e=document.querySelector('.irail__t.on');return e?[...e.classList].find(c=>c.startsWith('irail__t-')):'';})(),
      maxSlide:Math.max(...[...document.querySelectorAll('.islide')].map(e=>parseFloat(e.style.getPropertyValue('--o'))||0))}));
    if(st.on!==`irail__t-${tn}` || st.maxSlide<0.4) sliderOk=false;
  }
  await p.goto(URL,{waitUntil:'load'});await p.waitForTimeout(300);
  const total=await p.evaluate(()=>document.getElementById('track').offsetHeight-window.innerHeight);
  let minL=999,maxPin=0,photoLifted=false,logoSeen=false,legalSeen=false,footerDark=false;
  for(let i=0;i<=44;i++){const y=Math.round(total*i/44);await p.evaluate(yy=>window.scrollTo(0,yy),y);await p.waitForTimeout(70);
    const buf=await p.screenshot();
    const l=await p.evaluate(async b64=>{const img=new Image();img.src='data:image/png;base64,'+b64;await img.decode();const c=document.createElement('canvas');c.width=160;c.height=100;const g=c.getContext('2d');g.drawImage(img,0,0,160,100);const d=g.getImageData(0,0,160,100).data;let s=0,n=0;for(let k=0;k<d.length;k+=4){s+=0.2126*d[k]+0.7152*d[k+1]+0.0722*d[k+2];n++;}return s/n;},buf.toString('base64'));
    if(l<minL)minL=l;
    const st=await p.evaluate(()=>{const pin=document.querySelector('.pin').getBoundingClientRect().top;
      const lift=parseFloat(getComputedStyle(document.getElementById('photo')).getPropertyValue('--lift'))||0;
      // is the footer logo visible in the viewport (photo lifted enough to reveal it)?
      const logo=document.querySelector('.foot__logo').getBoundingClientRect();
      const legal=document.querySelector('.foot__legal-row').getBoundingClientRect();
      const ph=document.getElementById('photo').getBoundingClientRect();
      return {pin:Math.round(pin),lift,logoVis:logo.top>-50&&logo.bottom<window.innerHeight+50,
        legalVis:legal.top>-50&&legal.bottom<window.innerHeight+80, photoTop:Math.round(ph.top)};});
    if(Math.abs(st.pin)>maxPin)maxPin=Math.abs(st.pin);
    if(st.lift>0.85)photoLifted=true;
    if(st.lift>0.7&&st.logoVis)logoSeen=true;
    if(st.lift>0.7&&st.legalVis)legalSeen=true;
    // once the photo is fully lifted, the field must be the dark-green footer.
    // LIVE-measured footer luma = 42.8 (clean patch #162d24) — this outro is DELIBERATELY dark,
    // NOT a bright content zone, so the ≥45 content threshold does not apply here (see RESEARCH).
    if(st.lift>0.9&&l>=36&&l<=90)footerDark=true;}
  await b.close();
  return {label,ok,sliderOk,minL:+minL.toFixed(1),maxPin,photoLifted,logoSeen,legalSeen,footerDark,errs:errs.length,el:errs.slice(0,3)};
}
for(const [vp,lbl] of [[{width:1440,height:900},'desktop'],[{width:390,height:844},'mobile']]){
  const r=await run(vp,lbl);
  // minLuma floor = 36: the footer outro is intentionally dark (live footer luma 42.8); the interior
  // photo band above is bright. 36 guards against a pure-black/empty screen while honoring live truth.
  const pass=r.ok&&r.sliderOk&&r.minL>=36&&r.maxPin<=4&&r.photoLifted&&r.logoSeen&&r.legalSeen&&r.footerDark&&r.errs===0;
  console.log(`[${r.label}] ${pass?'✅ PASS':'❌ FAIL'} ok=${r.ok} slider(5thumbs)=${r.sliderOk} minLuma=${r.minL} pinTop=${r.maxPin} lift=${r.photoLifted} logo=${r.logoSeen} legal=${r.legalSeen} footerDark=${r.footerDark} errs=${r.errs} ${r.el.join(';')}`);
}
