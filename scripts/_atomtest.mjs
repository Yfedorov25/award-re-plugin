import { resolveChromium } from './token-extractor.mjs';
const chromium = await resolveChromium();
const b = await chromium.launch();
const page = await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
const errs=[];page.on('pageerror',e=>errs.push(e.message));page.on('console',m=>{if(m.type()==='error')errs.push('C:'+m.text());});
await page.goto('http://localhost:8879/atoms/_scaffold/atom-template.html',{waitUntil:'networkidle',timeout:20000}).catch(e=>errs.push('GOTO:'+e.message));
await page.waitForFunction(()=>window.__ATOM_OK__===true,{timeout:8000}).catch(()=>errs.push('no OK'));
const r=await page.evaluate(()=>{window.render(0.5);const c=document.getElementById('counter').textContent;window.render(1.0);const c2=document.getElementById('counter').textContent;
  return {ok:window.__ATOM_OK__,render:typeof window.render==='function',counterAt50:c,counterAt100:c2};});
console.log('scaffold:',JSON.stringify(r));
console.log('errors:',errs.length?errs.join(' | '):'NONE');
// render a shot to see it
await page.evaluate(()=>window.render(0.6)); await page.waitForTimeout(150);
await page.screenshot({path:'/private/tmp/claude-501/-Users-yehorfedorov-Downloads-KAI/c3be139d-c516-47c2-a8d3-42fb9aeac5b3/scratchpad/scaffold.png'});
await b.close();
