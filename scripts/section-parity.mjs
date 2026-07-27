/* section-parity: знімає НАШ фолд на кожному прогресі живих fold-baselines і
   жене G15 попарно. Доказ parity НИЖНІХ секцій (не лише hero).
   Usage: node scripts/section-parity.mjs --combo <combo-name> --folds-dir <dir> [--viewport 1440x820]
   Живі fold-baselines у <dir>/fold-N-pXX.png (XX = прогрес %). Наш прогрес = scrollY/(scrollH-innerH).
   Пише scratchpad-secpar/<combo>-secN.png + виводить % кожної пари. */
import { readdirSync, mkdirSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';
const args={};for(let i=2;i<process.argv.length;i++){if(process.argv[i].startsWith('--'))args[process.argv[i].slice(2)]=process.argv[++i];}
const COMBO=args.combo, DIR=args['folds-dir'], VP=args.viewport||'1440x820';
const [W,H]=VP.split('x').map(Number);
const require=createRequire(pathToFileURL(process.env.PLAYWRIGHT_FROM));
const {chromium}=require('playwright');
const folds=readdirSync(DIR).filter(f=>/^fold-\d+-p\d+\.png$/.test(f)).sort();
mkdirSync('scratchpad-secpar',{recursive:true});
const br=await chromium.launch();const p=await br.newPage({viewport:{width:W,height:H}});
await p.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>false}));
await p.goto(`http://localhost:8820/combos/${COMBO}/combo-lab.html`,{waitUntil:'domcontentloaded'});
await p.waitForTimeout(2500);
const docH=await p.evaluate(()=>document.body.scrollHeight-innerHeight);
const results=[];
for(const f of folds){
  const pct=parseInt(f.match(/p(\d+)\.png/)[1],10)/100;
  await p.evaluate(y=>window.scrollTo(0,y),Math.round(docH*pct));
  await p.waitForTimeout(700);
  const our=`scratchpad-secpar/${COMBO}-${f}`;
  await p.screenshot({path:our});
  results.push({f,our,pct});
}
await br.close();
// G15 попарно (file:// ours проти живого baseline)
for(const r of results){
  let out='';
  try{ out=execSync(`node scripts/visual-parity.mjs --ours file://${process.cwd()}/${r.our} --baseline ${DIR}/${r.f} --label secpar-${r.f.replace('.png','')} --viewport ${VP} 2>&1`, {env:process.env}).toString(); }
  catch(e){ out=(e.stdout?e.stdout.toString():'')+(e.stderr?e.stderr.toString():''); }  // visual-parity exit!=0 при fail — беремо stdout
  const m=out.match(/([0-9.]+)% (pass|fail)/);
  console.log(`${r.f} (progress ${(r.pct*100)|0}%): ${m?m[1]+'% '+m[2]:'(no match)'}`);
}
