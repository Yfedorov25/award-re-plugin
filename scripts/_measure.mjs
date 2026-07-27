import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await page.goto('http://localhost:8879/suborganisms/SO-3-nature-place/index.html',{waitUntil:'networkidle'});
await page.waitForFunction(()=>window.__SO3_OK__===true,{timeout:8000}).catch(()=>{});
function fmt(o){return `xL=${(o.x/1440*100).toFixed(1)}% xR=${((o.x+o.w)/1440*100).toFixed(1)}% w=${(o.w/1440*100).toFixed(1)}% baselineY=${((o.y+o.h)/900*100).toFixed(1)}% top=${(o.y/900*100).toFixed(1)}%`;}
const r = await page.evaluate(()=>{
  function m(id){window.render(id==='natTitle'?0.06:0.335);const t=document.getElementById(id).querySelector('.title');const b=t.getBoundingClientRect();return {x:b.left,y:b.top,w:b.width,h:b.height};}
  return {nat:m('natTitle'), place:m('placeTitle')};
});
console.log('OUR Nature:', fmt(r.nat));
console.log('OUR Place :', fmt(r.place));
await b.close();
