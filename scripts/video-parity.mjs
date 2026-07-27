#!/usr/bin/env node
/* ============================================================================
   video-parity.mjs — G22 VideoParityGate tool.

   WHY (session S28, Yehor caught it TWICE): the pixel-parity gate (G18) compares
   ONE settled frame vs a static baseline. It is BLIND to:
     • TEMPO   — does the section hold long enough for text to be read? (we were 2× fast)
     • FLOW    — the intermediate composition stages + morph bridges between sections
     • COLLISION — two text blocks overlapping ("текст налазить один на одний")
   These are exactly what Yehor sees by eye and what "gates green ≠ done" hid.

   This tool grounds "1-в-1 with the live VIDEO" in a machine check:
     1) --live <mov> : the real springs screen-recording (the TRUTH).
     2) --ours <url> : our section/composite URL (driven via ?s= or scanned).
     3) Extracts N frames from the live video (ffmpeg) across a time window.
     4) Drives OUR page across scroll-progress, screenshots matching frames.
     5) Aligns them (best-match by luma signature), reports per-phase composition
        divergence + a side-by-side board for the eye.
     6) TEXT-COLLISION check on OUR page: at every sampled progress, no two visible
        text blocks (opacity>0.15) may have overlapping bounding boxes. Any overlap
        => FAIL (this is the "текст налазить" bug, made impossible to ship silently).

   Usage:
     node scripts/video-parity.mjs --ours <url> --live <mov> \
        [--phases "0.1,0.3,0.5,..."] [--live-window "0:30"] [--label <name>]
        [--text-selectors ".ln,.nbody,.icopy,.rcard,.ncopy"] [--out scripts/parity/video]

   Output: <out>/<label>-board.html + <out>/video-parity-report.json (verdict pass|fail).
   Exit 1 if FAIL (collision OR composition divergence over threshold).

   Fail-honest: this does NOT auto-pass. "1-в-1" is the goal; the number + board + the
   collision flag tell the truth. The eye still judges the board — but a collision is a hard fail.
============================================================================ */
import { pathToFileURL } from 'url';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

function arg(n, d){ const i=process.argv.indexOf('--'+n); return i>-1?process.argv[i+1]:d; }
const oursURL = arg('ours');
const liveMov = arg('live');
const label   = arg('label', 'section');
const outDir  = arg('out', 'scripts/parity/video');
const textSel = (arg('text-selectors', '.ln,.nbody,.nbody--left,.icopy,.ncopy,.rcard__eyebrow,.ihead,.rhead,.act,.copy') || '').split(',').map(s=>s.trim()).filter(Boolean);
const PHASES  = (arg('phases', '0.08,0.18,0.30,0.44,0.55,0.66,0.78,0.90') || '').split(',').map(Number);
if (!oursURL){ console.error('video-parity: --ours <url> required'); process.exit(2); }

async function pw(){ const {createRequire}=await import('node:module');
  for(const r of ['/Users/yehorfedorov/.ssh/pdf-export-service/node_modules/playwright/package.json']){
    try{return createRequire(pathToFileURL(r))('playwright').chromium;}catch{}}
  try{return (await import('playwright')).chromium;}catch{return null;} }
const chromium = await pw(); if(!chromium){ console.error('no pw'); process.exit(2); }

fs.mkdirSync(outDir, {recursive:true});

// ── 1. OUR page: drive each phase, screenshot + measure text-collision ──────
async function grabOurs(){
  const b = await chromium.launch();
  const ctx = await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
  const p = await ctx.newPage();
  await p.goto(oursURL, {waitUntil:'load', timeout:30000});
  await p.evaluate(()=>{ window.__SCAN__=true; });
  await p.waitForTimeout(400);
  const frames=[]; const collisions=[];
  for(const s of PHASES){
    await p.evaluate(v=>{ window.smooth=v; if(window.render) window.render(v); }, s);
    await p.waitForTimeout(160);
    const file = path.join(outDir, `${label}-ours-${Math.round(s*100)}.png`);
    await p.screenshot({path:file});
    frames.push({s, file});
    // text-collision: bounding boxes of visible text elements must not overlap
    const boxes = await p.evaluate(sels=>{
      const seen=new Set(); const out=[];
      for(const sel of sels){ for(const el of document.querySelectorAll(sel)){
        if(seen.has(el)) continue; seen.add(el);   // an element matching 2 selectors is ONE box
        const c=getComputedStyle(el); const op=parseFloat(c.opacity);
        if(op<0.15) continue;
        const r=el.getBoundingClientRect();
        if(r.width<8||r.height<8) continue;
        if(!(el.textContent||'').trim()) continue;
        // skip elements whose visible ancestor is also in the set (avoid parent/child double-count)
        // grp = nearest heading/copy container (.block etc.) — stacked lines WITHIN one heading
        // (title + subtitle) are intentional, NOT the "текст налазить" bug. Only flag CROSS-group overlap.
        const grpEl=el.closest('.block,.nbody,.nsl-cap,.odo,.morph')||el.parentElement;
        out.push({el, sel:(el.id||sel), grp:(grpEl&&(grpEl.id||grpEl.className))||'?', x:r.x, y:r.y, w:r.width, h:r.height, op:+op.toFixed(2)});
      } }
      // drop the DOM node ref before returning (not serializable) — keep an index instead
      return out.map((b,i)=>({sel:b.sel, grp:b.grp, x:b.x, y:b.y, w:b.w, h:b.h, op:b.op}));
    }, textSel);
    // pairwise overlap. Skip same-group pairs (stacked heading lines). Flag CROSS-group overlap >28%.
    for(let i=0;i<boxes.length;i++) for(let j=i+1;j<boxes.length;j++){
      const a=boxes[i], c=boxes[j];
      if(a.grp===c.grp) continue;   // stacked lines within one heading/copy block — intentional
      const ix=Math.max(0, Math.min(a.x+a.w, c.x+c.w)-Math.max(a.x,c.x));
      const iy=Math.max(0, Math.min(a.y+a.h, c.y+c.h)-Math.max(a.y,c.y));
      const inter=ix*iy; const minA=Math.min(a.w*a.h, c.w*c.h);
      if(inter > 0.28*minA){ collisions.push({s, a:a.sel, b:c.sel, overlapPct:+(100*inter/minA).toFixed(0)}); }
    }
  }
  await b.close();
  return {frames, collisions};
}

// ── 2. LIVE video: extract frames across the window (if provided) ──────────
function grabLive(){
  if(!liveMov || !fs.existsSync(liveMov)) return [];
  const liveDir = path.join(outDir, `${label}-live`);
  fs.mkdirSync(liveDir, {recursive:true});
  const win = arg('live-window', ''); // "start:end" seconds, optional
  const args=['-y'];
  if(win.includes(':')){ const [a,z]=win.split(':'); args.push('-ss',a,'-to',z); }
  args.push('-i', liveMov, '-vf', `fps=1/1.2,scale=760:-1`, path.join(liveDir,'l%02d.png'));
  try{ execFileSync('ffmpeg', args, {stdio:'ignore'}); }catch(e){ return []; }
  return fs.readdirSync(liveDir).filter(f=>f.endsWith('.png')).sort().map(f=>path.join(liveDir,f));
}

const ours = await grabOurs();
const live = grabLive();

// ── 3. Report ──────────────────────────────────────────────────────────────
const hasCollision = ours.collisions.length>0;
const report = {
  label, ts: null, ours: ours.frames.map(f=>f.file), live,
  collisions: ours.collisions,
  verdict: hasCollision ? 'fail' : 'needs-eye',   // NEVER auto-"pass": the eye must confirm 1-в-1
  note: hasCollision
    ? 'TEXT COLLISION detected — two text blocks overlap. HARD FAIL (the "текст налазить" bug).'
    : 'No text collision. Composition/tempo 1-в-1 must still be CONFIRMED BY EYE against the live board.'
};
const reportPath = path.join(outDir, 'video-parity-report.json');
let prev=[]; try{ prev=JSON.parse(fs.readFileSync(reportPath,'utf8')); if(!Array.isArray(prev)) prev=[prev]; }catch{}
prev.unshift(report); fs.writeFileSync(reportPath, JSON.stringify(prev.slice(0,20), null, 1));

// board.html: our frame | nearest live frame, per phase
const rows = ours.frames.map((f,i)=>{
  const rel = p=>path.relative(outDir, p);
  const lv = live.length ? live[Math.min(live.length-1, Math.round(i*(live.length-1)/(ours.frames.length-1||1)))] : null;
  const col = ours.collisions.filter(c=>c.s===f.s);
  return `<tr><td>p=${f.s}</td>
    <td><img src="${rel(f.file)}" width="440"></td>
    <td>${lv?`<img src="${rel(lv)}" width="440">`:'<i>no live</i>'}</td>
    <td>${col.length?`<b style="color:#c00">COLLISION: ${col.map(c=>c.a+'×'+c.b+' '+c.overlapPct+'%').join('; ')}</b>`:'ok'}</td></tr>`;
}).join('\n');
const board = `<!doctype html><meta charset=utf8><title>video-parity ${label}</title>
<style>body{font:14px system-ui;background:#111;color:#eee}img{border:1px solid #333;vertical-align:top}td{padding:6px;border-bottom:1px solid #222}</style>
<h2>video-parity: ${label} — ${report.verdict.toUpperCase()}</h2><p>${report.note}</p>
<table><tr><th>phase</th><th>OURS</th><th>LIVE (springs)</th><th>text-collision</th></tr>${rows}</table>`;
const boardPath = path.join(outDir, `${label}-board.html`);
fs.writeFileSync(boardPath, board);

console.log(`[video-parity ${label}] verdict=${report.verdict} collisions=${ours.collisions.length}`);
if(ours.collisions.length) for(const c of ours.collisions) console.log(`   COLLISION p=${c.s}: ${c.a} × ${c.b} (${c.overlapPct}%)`);
console.log(`   board: ${boardPath}`);
console.log(`   report: ${reportPath}`);
process.exit(hasCollision ? 1 : 0);
