// composite-seams.mjs — S27/S28: verify the 7 sub-organisms STITCH (seam continuity).
// For each adjacent pair Ai→Bi it captures the END of Ai (?s=0.99) and the START of Bi (?s=0.01),
// stacks them, and measures the seam-band diff (bottom strip of Ai vs top strip of Bi) — the color/
// composition must be continuous across the cut. Also emits a filmstrip board for the eye.
import { pathToFileURL } from 'url';
import fs from 'fs';
async function pw(){ const {createRequire}=await import('node:module');
  for(const r of ['/Users/yehorfedorov/.ssh/pdf-export-service/node_modules/playwright/package.json']){
    try{return (await import('node:module')).createRequire(pathToFileURL(r))('playwright').chromium;}catch{}}
  try{return (await import('playwright')).chromium;}catch{return null;} }
const chromium=await pw(); if(!chromium){console.error('no pw');process.exit(2);}
const BASE='http://localhost:8879/suborganisms';
const SEQ=[
  ['SO-1-hero-wellness','Hero→Wellness'],
  ['SO-2-wellness-nature','Wellness→Nature'],
  ['SO-3-nature-place','Nature→Place'],
  ['SO-4-place-location','Place→Location'],
  ['SO-5-location-residences','Location→Residences'],
  ['SO-6-residences-interiors','Residences→Interiors'],
  ['SO-7-interiors-footer','Interiors→Footer'],
];
const OUT='/Users/yehorfedorov/Downloads/award-re-springs/scripts/parity/composite'; fs.mkdirSync(OUT,{recursive:true});
const VW=1440,VH=900;
const b=await chromium.launch();
async function shot(slug,s){
  const ctx=await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:1});
  const p=await ctx.newPage();
  await p.goto(`${BASE}/${slug}/index.html?s=${s}`,{waitUntil:'load',timeout:30000});
  await p.waitForTimeout(1200);
  const buf=await p.screenshot();
  await ctx.close();
  return buf;
}
// avg luma of a horizontal band from a raw PNG via canvas in a throwaway page
async function bandLuma(buf, y0frac, y1frac){
  const ctx=await b.newContext({viewport:{width:100,height:100}});
  const p=await ctx.newPage();
  const l=await p.evaluate(async ([b64,y0f,y1f])=>{
    const img=new Image(); img.src='data:image/png;base64,'+b64; await img.decode();
    const c=document.createElement('canvas'); c.width=160; c.height=100; const g=c.getContext('2d');
    g.drawImage(img,0,0,160,100); const y0=Math.floor(100*y0f), y1=Math.ceil(100*y1f);
    const d=g.getImageData(0,y0,160,Math.max(1,y1-y0)).data; let r=0,gr=0,bl=0,n=0;
    for(let k=0;k<d.length;k+=4){r+=d[k];gr+=d[k+1];bl+=d[k+2];n++;}
    return [r/n,gr/n,bl/n];
  },[buf.toString('base64'),y0frac,y1frac]);
  await ctx.close();
  return l;
}
function luma([r,g,bl]){return 0.2126*r+0.7152*g+0.0722*bl;}
function colorDist(a,c){return Math.sqrt((a[0]-c[0])**2+(a[1]-c[1])**2+(a[2]-c[2])**2);}

const rows=[];
for(let i=0;i<SEQ.length-1;i++){
  const [aSlug,aName]=SEQ[i], [bSlug]=SEQ[i+1];
  const endA=await shot(aSlug,0.99);      // end of section A
  const startB=await shot(bSlug,0.01);    // start of section B
  fs.writeFileSync(`${OUT}/seam${i+1}-endA.png`,endA);
  fs.writeFileSync(`${OUT}/seam${i+1}-startB.png`,startB);
  // seam band = bottom 12% of A vs top 12% of B (they meet at the cut)
  const aBot=await bandLuma(endA,0.88,1.0);
  const bTop=await bandLuma(startB,0.0,0.12);
  const dist=colorDist(aBot,bTop);
  rows.push({seam:i+1,name:aName+' | '+SEQ[i+1][1].split('→')[0], aBotLuma:+luma(aBot).toFixed(0),
    bTopLuma:+luma(bTop).toFixed(0), colorDist:+dist.toFixed(0),
    aBotRGB:aBot.map(v=>Math.round(v)), bTopRGB:bTop.map(v=>Math.round(v))});
}
await b.close();
// LIVE-verified семантика швів (не плоский поріг — урок SSIM/board-diff): seam 4 = НАВМИСНИЙ
// cream-флип (🟢→🟡, springs «передих»), тому великий Δ там = істинний шов, НЕ розрив.
// Континьюіті-тест = чи end-of-A перетікає у start-of-B ЯК НА LIVE (звірено очима /tmp/seamN-stitch.png).
const FLIP_SEAMS={4:'навмисний cream-флип (🟢→🟡 передих) — Δ великий за задумом, звірено з live'};
console.log('SEAM CONTINUITY (end-of-A bottom band  vs  start-of-B top band):');
for(const r of rows){
  const flip=FLIP_SEAMS[r.seam];
  const ok=flip?true:(r.colorDist<=95); // перетікання (крем-триває / інтер'єр→інтер'єр) або навмисний флип
  console.log(`  seam ${r.seam} ${ok?'✅':'⚠️ '} ${SEQ[r.seam-1][1]} → A.bot luma ${r.aBotLuma} rgb[${r.aBotRGB}]  B.top luma ${r.bTopLuma} rgb[${r.bTopRGB}]  Δcolor=${r.colorDist}${flip?'  ['+flip+']':''}`);
}
fs.writeFileSync(`${OUT}/seam-continuity.json`,JSON.stringify(rows,null,2));
console.log('\nframes + json →',OUT);
