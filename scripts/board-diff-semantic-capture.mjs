import { createRequire } from 'module';
const require = createRequire('/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json');
const { chromium } = require('playwright');
const OUT = process.argv[2];

// ---- OUR render: DOM-clip to panel sub-block (CASE tabs → table), EXCLUDE rail ----
async function captureOurs(){
  const b=await chromium.launch();
  const pg=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1.5});
  await pg.goto('http://localhost:8820/_transfer-tests/cd-b5r/RESULTS/air-b5r-invest-calculator.html',{waitUntil:'networkidle'});
  await pg.waitForTimeout(1000);
  const clip=await pg.evaluate(()=>{
    const cases=document.querySelector('.cases');            // CASE 1/2 tabs (top of panel content)
    const rows=[...document.querySelectorAll('.row')];       // table rows
    const lastRow=rows[rows.length-1];                       // TAX REGIME
    const panel=document.querySelector('.panel');
    const rc=cases.getBoundingClientRect(), rr=lastRow.getBoundingClientRect(), rp=panel.getBoundingClientRect();
    // x: panel left..right (exclude rail); y: cases top .. lastRow bottom
    return { x:Math.round(rp.left), y:Math.round(rc.top), w:Math.round(rp.right-rp.left), h:Math.round(rr.bottom-rc.top) };
  });
  await pg.screenshot({path:`${OUT}/sem-our.jpg`,type:'jpeg',quality:90,clip:{x:clip.x,y:clip.y,width:clip.w,height:clip.h}});
  console.log('ours clip',JSON.stringify(clip));
  await b.close();
  return clip;
}

// ---- LIVE: crack Locomotive, DOM-clip to SAME logical sub-block ----
async function captureLive(){
  const b=await chromium.launch();
  const pg=await b.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1.5});
  try{ await pg.goto('https://aircenter.space/investment',{waitUntil:'domcontentloaded',timeout:60000}); }catch{}
  await pg.waitForTimeout(4000);
  const client=await pg.context().newCDPSession(pg);
  try{ await pg.evaluate(()=>{const e=[...document.querySelectorAll('a,button,span,div')].find(x=>x.children.length===0&&/^\s*ACCEPT\s*$/i.test(x.textContent||''));if(e)(e.closest('button,a')||e).click();}); }catch{}
  await pg.waitForTimeout(600);
  const anchorTop=()=>pg.evaluate(()=>{const e=[...document.querySelectorAll('*')].find(x=>x.children.length===0&&(x.textContent||'').trim().toUpperCase().includes('CASE 1'));if(!e)return null;const r=e.getBoundingClientRect();return{left:Math.round(r.left),top:Math.round(r.top)};});
  let placed=false;
  for(let i=0;i<260;i++){
    await client.send('Input.dispatchMouseEvent',{type:'mouseWheel',x:720,y:450,deltaX:0,deltaY:50});
    await pg.waitForTimeout(28);
    const a=await anchorTop();
    if(a&&a.left>0&&a.top>=300&&a.top<=520){ await pg.waitForTimeout(400); placed=true; break; }
  }
  // DOM-clip: find CASE tabs container + TAX REGIME row in live DOM
  const clip=await pg.evaluate(()=>{
    const all=[...document.querySelectorAll('*')];
    const case1=all.find(e=>e.children.length===0&&(e.textContent||'').trim().toUpperCase().includes('CASE 1'));
    const tax=all.find(e=>e.children.length===0&&(e.textContent||'').trim().toUpperCase()==='TAX REGIME');
    if(!case1||!tax) return null;
    // panel = common ancestor spanning wide
    let panel=case1; for(let i=0;i<8&&panel.parentElement;i++){ if(panel.getBoundingClientRect().width>800) break; panel=panel.parentElement; }
    // find the CASE tabs row (ancestor of case1 that holds both CASE1 and CASE2)
    let tabRow=case1; for(let i=0;i<5&&tabRow.parentElement;i++){ if((tabRow.textContent||'').toUpperCase().includes('CASE 2')) break; tabRow=tabRow.parentElement; }
    const rc=tabRow.getBoundingClientRect(), rt=tax.getBoundingClientRect(), rp=panel.getBoundingClientRect();
    return { x:Math.max(0,Math.round(rp.left)), y:Math.max(0,Math.round(rc.top)), w:Math.round(Math.min(1440-rp.left,rp.width)), h:Math.round(rt.bottom-rc.top), placed:true };
  });
  if(clip && clip.w>100 && clip.h>100){
    await pg.screenshot({path:`${OUT}/sem-live.jpg`,type:'jpeg',quality:90,clip:{x:clip.x,y:clip.y,width:clip.w,height:clip.h}});
    console.log('live clip',JSON.stringify(clip));
  } else {
    console.log('live clip FAILED', JSON.stringify(clip), 'placed='+placed);
  }
  await b.close();
  return clip;
}

await captureOurs();
await captureLive();
