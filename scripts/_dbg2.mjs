import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
const outdir='/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/c3be139d-c516-47c2-a8d3-42fb9aeac5b3/scratchpad/render-static2';
import('fs').then(fs=>fs.mkdirSync(outdir,{recursive:true}));
const probe = await page.evaluate(()=>{ const out=[];
  for(const p of [0.225,0.24,0.26,0.275,0.29,0.30]){ window.render(p);
    out.push({p, clip:getComputedStyle(document.getElementById('cardSlide')).clipPath}); } return out;});
const odo = await page.evaluate(()=>{ window.render(0.53);
  const o=document.getElementById('odo').getBoundingClientRect(), n=document.getElementById('odoNum').getBoundingClientRect();
  return {odoTop:Math.round(o.top),odoBottom:Math.round(o.bottom),numBottom:Math.round(n.bottom),vh:900};});
// PLACE geometry: exact bbox of placeTitle, placeEyebrow, placeBody + font
const place = await page.evaluate(()=>{ window.render(0.335);
  function m(id){const el=document.getElementById(id); const t=el.querySelector('.title')||el;
    const r=t.getBoundingClientRect(), cs=getComputedStyle(t);
    return {id, x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height),
      xPct:+(r.left/1440*100).toFixed(1), yPct:+(r.top/900*100).toFixed(1),
      font:cs.fontFamily.split(',')[0], fs:cs.fontSize, weight:cs.fontWeight};}
  return ['placeTitle','placeEyebrow','placeBody'].map(m);});
console.log('slider clip across band:'); probe.forEach(x=>console.log('  p'+x.p, x.clip));
console.log('odo fit:',JSON.stringify(odo));
console.log('\nPLACE geometry (ours @1440x900):'); place.forEach(x=>console.log('  '+JSON.stringify(x)));
for(const [k,p] of Object.entries({slider1:0.235, slider2:0.27, slider3:0.295, odo3:0.53, place:0.335})){
  await page.evaluate(pp=>window.render(pp),p); await page.waitForTimeout(100);
  await page.screenshot({path:`${outdir}/r_${k}.png`});
}
await b.close();
