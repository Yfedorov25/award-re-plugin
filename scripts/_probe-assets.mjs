import { resolveChromium, SITES, VIEWPORTS } from './token-extractor.mjs';
const site=SITES['springs-home']; const vp=VIEWPORTS.desktop||{width:1440,height:900};
const chromium=await resolveChromium();
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:1});
const page=await ctx.newPage(); const cdp=await ctx.newCDPSession(page);
await page.goto(site.liveOrigin+site.livePath,{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForTimeout(6000);
for(const s of ['.js-cookie-consent-accept','button:has-text("ACCEPT")']){try{await page.click(s,{timeout:1200});break;}catch{}}
await page.waitForFunction(()=>{const p=document.querySelector('.js-preloader');return !p||getComputedStyle(p).display==='none';},{timeout:25000}).catch(()=>{});
await page.waitForTimeout(1500);
const TR=()=>{const el=document.querySelector('.l-nature'); if(!el)return 0; if(window.__T0__===undefined)window.__T0__=el.getBoundingClientRect().top; return window.__T0__-el.getBoundingClientRect().top;};
await page.evaluate(TR);
for(let i=0;i<12;i++){ await cdp.send('Input.synthesizeScrollGesture',{x:720,y:450,yDistance:-300,speed:1400,gestureSourceType:'mouse'}); await page.waitForTimeout(240); }
const info=await page.evaluate(()=>{
  const nat=document.querySelector('.l-nature'); if(!nat)return {err:'no .l-nature'};
  const imgs=[...nat.querySelectorAll('img')].map(im=>({cls:im.className.slice(0,50),src:(im.currentSrc||im.src).split('/').pop(),vis:im.getBoundingClientRect().width>1}));
  const bgs=[...nat.querySelectorAll('*')].filter(e=>{const bg=getComputedStyle(e).backgroundImage;return bg&&bg!=='none';}).map(e=>({cls:(e.className+'').slice(0,50),bg:(getComputedStyle(e).backgroundImage.match(/[^/]+\.webp/)||[])[0]}));
  return {imgCount:imgs.length,imgs:imgs.slice(0,15),bgCount:bgs.length,bgs:bgs.slice(0,15)};
});
console.log(JSON.stringify(info,null,1));
await b.close();
