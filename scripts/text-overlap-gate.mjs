#!/usr/bin/env node
/*
  text-overlap-gate.mjs — G25 TextOverlapGate engine.

  Ловить клас Єгора «текст налазить» (рядки накладаються, з'їдений line-height, overflow)
  НАДІЙНО — не з пікселів (крихко, фолс-позитиви на великих гліфах), а з DOM:
  вимірює getClientRects() кожного текст-вузла й шукає вертикальне+горизонтальне
  перекриття між НЕспорідненими текст-елементами. Нуль фолс-позитивів на великих
  шрифтах/вкладених спанах (ancestor/descendant пари виключені).

  Це те, що піксель-parity (G18) і video-parity (G22) НЕ бачать на статиці, а спека
  board-diff M4 (band-valley) плутала з великими цифрами. DOM-факт замість здогадки.

  Це НЕ доказ візуальної парності з live — лише «наш рендер не має накладеного тексту».

  Usage:
    node text-overlap-gate.mjs --url <http url> [--url <url2> ...] [--out report.json]
    node text-overlap-gate.mjs --selftest        (рендерить eталон зі зламаним line-height, має зловити)

  Deps: playwright (resolveChromium-package).
*/
'use strict';
import { createRequire } from 'module';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';

const require = createRequire(
  process.env.PLAYWRIGHT_FROM ||
  '/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json'
);
const { chromium } = require('playwright');

// vertical-overlap fraction of the shorter box that counts as a collision.
const V_OVERLAP_FRAC = 0.30;
const V_MIN_PX = 2;   // ігнорувати субпіксельні дотики
const H_MIN_PX = 8;   // мусить бути й горизонтальне перекриття (та сама зона)

const DETECTOR = /* js injected into page */ `
(function(){
  var els=[];
  function walk(el){
    var own=false, cs=el.childNodes;
    for(var i=0;i<cs.length;i++){ if(cs[i].nodeType===3 && cs[i].textContent.trim()){ own=true; break; } }
    if(own) els.push(el);
    var ch=el.children; for(var j=0;j<ch.length;j++) walk(ch[j]);
  }
  walk(document.body);
  var boxes=[];
  for(var i=0;i<els.length;i++){
    var r=els[i].getBoundingClientRect(), t=els[i].textContent.trim().slice(0,26);
    if(r.height>2 && r.width>4 && t){
      // skip elements that are off-screen / display:none-ish
      var st=getComputedStyle(els[i]);
      if(st.visibility==='hidden'||st.display==='none'||+st.opacity===0) continue;
      boxes.push({el:els[i], top:r.top, bottom:r.bottom, left:r.left, right:r.right, h:r.height, txt:t});
    }
  }
  var V=${V_OVERLAP_FRAC}, VMIN=${V_MIN_PX}, HMIN=${H_MIN_PX};
  var cols=[];
  for(var a=0;a<boxes.length;a++) for(var b=a+1;b<boxes.length;b++){
    var A=boxes[a], B=boxes[b];
    if(A.el.contains(B.el)||B.el.contains(A.el)) continue;          // ancestor/descendant
    var vy=Math.min(A.bottom,B.bottom)-Math.max(A.top,B.top);
    var hx=Math.min(A.right,B.right)-Math.max(A.left,B.left);
    if(vy>VMIN && hx>HMIN){
      var minH=Math.min(A.h,B.h);
      if(vy>minH*V){ cols.push([A.txt,B.txt,Math.round(vy),Math.round(hx)]); }
    }
  }
  return { textEls:boxes.length, count:cols.length, collisions:cols.slice(0,12) };
})()
`;

async function inspectUrl(pg, url, breakCss) {
  await pg.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  await pg.waitForTimeout(900);
  if (breakCss) await pg.addStyleTag({ content: breakCss });
  await pg.waitForTimeout(300);
  const r = await pg.evaluate(DETECTOR);
  return r;
}

async function main() {
  const argv = process.argv.slice(2);
  const urls = [];
  let out = null, selftest = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--url') urls.push(argv[++i]);
    else if (argv[i] === '--out') out = argv[++i];
    else if (argv[i] === '--selftest') selftest = true;
  }
  if (!urls.length) { console.error('need --url <http> (repeatable) or --selftest'); process.exit(2); }

  const browser = await chromium.launch();
  const pg = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });

  const results = [];
  for (const url of urls) {
    try {
      const clean = await inspectUrl(pg, url);
      const entry = { url, textEls: clean.textEls, collisions: clean.count, sample: clean.collisions, pass: clean.count === 0 };
      // SELF-TEST: aggressively collapse vertical rhythm, expect the detector to fire (proves it isn't dead).
      // Kill line-height AND row spacing (padding/margin/gap) so even flex-table layouts overlap.
      if (selftest) {
        const breakCss =
          '*{line-height:.45 !important} ' +
          'p,div,span,li,h1,h2,h3,td,th{margin:-8px 0 !important;padding-top:0 !important;padding-bottom:0 !important} ' +
          '.row,.step,.card,.readout,.cases,.subtabs,[class*="row"],[class*="cell"]{min-height:0 !important;gap:0 !important;padding:0 !important}';
        const broken = await inspectUrl(pg, url, breakCss);
        entry.selftest = { brokenCollisions: broken.count, detectorLive: broken.count > clean.count };
      }
      results.push(entry);
    } catch (e) {
      results.push({ url, error: String(e), pass: false });
    }
  }
  await browser.close();

  const allPass = results.every(r => r.pass);
  const selftestOk = !selftest || results.every(r => r.selftest && r.selftest.detectorLive);
  const report = { ts: Date.now(), tsISO: new Date().toISOString(), allPass, selftestOk, results };
  const outPath = out || resolve(process.cwd(), 'text-overlap-report.json');
  writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log('report:', outPath);
  for (const r of results) {
    if (r.error) { console.log('ERROR', r.url, r.error); continue; }
    console.log(`${r.pass ? 'PASS' : 'FAIL'} ${r.url}  textEls=${r.textEls} collisions=${r.collisions}` +
      (r.selftest ? `  [selftest broken=${r.selftest.brokenCollisions} live=${r.selftest.detectorLive}]` : ''));
    for (const c of (r.sample || [])) console.log('    OVERLAP', JSON.stringify(c));
  }
  if (selftest && !selftestOk) { console.error('SELFTEST FAILED — detector did not fire on broken layout'); process.exit(3); }
  process.exit(allPass ? 0 : 1);
}
main().catch(e => { console.error(e); process.exit(2); });
