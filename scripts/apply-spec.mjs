#!/usr/bin/env node
/* apply-spec.mjs — the missing BUILD stage (council: "no apply-stage").
   Reads spec/<SO>/answer-key.json (live-extracted, discrete-class-toggle model) and emits
   spec/<SO>/beats.json: an ordered, viewport-NORMALIZED keyframe table the build renders directly.
   NO eyeball geometry, NO literal px. Each atom's geometry is % of the capture viewport, so it
   scales to any width (fixes the left:983px overflow: 983/1440 = 68.3%).

   Beat model: springs reveals atoms DISCRETELY at scroll thresholds (lastScrollPosition). We map each
   atom's revealPos onto a normalized band progress p∈[0..1], group atoms into sequential beats, and
   record each atom's settled geometry + real asset. The renderer shows atoms per beat (state), it does
   NOT continuously scrub (that was the wrong model that made mush).

   Usage: node scripts/apply-spec.mjs SO-3
*/
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const SO = process.argv[2] || 'SO-3';
const dir = join(process.cwd(), 'spec', SO);
const key = JSON.parse(readFileSync(join(dir, 'answer-key.json'), 'utf8'));
const vw = key.meta.vp.width, vh = key.meta.vp.height;

// atoms whose bbox is a clean readable element (DOM text/img). WebGL/video/block containers
// get VISUAL-LAYER treatment (asset + approximate placement), not precise geometry.
const CLEAN = new Set(['natTitle','natSub','natBody','placeTitle','placeSub','placeBody','runners',
  'natSlider','natSliderImg']);

const bandStartPos = key.steps[0].pos, bandEndPos = key.steps[key.steps.length-1].pos;
const span = Math.max(1, bandEndPos - bandStartPos);
const p = (pos) => +(Math.max(0, Math.min(1, (pos - bandStartPos) / span))).toFixed(3);

// For each atom: settled geometry (median of on&op>0.5 steps), revealP, type, asset, text
const atoms = {};
for (const name of Object.keys(key.atomsMeta)) {
  const m = key.atomsMeta[name];
  const vis = key.steps.filter(s => s.spec[name] && s.spec[name].op > 0.5 && s.spec[name].on);
  if (!vis.length) continue;
  const mid = vis[Math.floor(vis.length/2)].spec[name];
  const clean = CLEAN.has(name);
  atoms[name] = {
    type: m.type,
    revealP: m.revealPos != null ? p(m.revealPos) : 0,
    revealPos: m.revealPos,
    // normalized geometry (% of capture vp) — clean atoms only; others are visual layers
    geom: clean ? {
      xPct: +(mid.x/vw*100).toFixed(2), yPct: +(mid.y/vh*100).toFixed(2),
      wPct: +(mid.w/vw*100).toFixed(2), hPct: +(mid.h/vh*100).toFixed(2),
      // font-size as vw so it scales: fs(px)/vw*100
      fsVw: mid.fs ? +(parseFloat(mid.fs)/vw*100).toFixed(3) : null,
    } : null,
    motion: m.motion,
    asset: mid.srcBase ? mid.srcBase.replace(/%40/gi,'@') : null,
    text: clean ? (mid.text||'').trim() : null,
    z: mid.z,
  };
}

// order atoms into sequential beats by revealPos (discrete reveals)
const ordered = Object.entries(atoms).sort((a,b)=>(a[1].revealPos||0)-(b[1].revealPos||0));
// cluster reveals that are within ~400 pos of each other into one beat
const beats = []; let cur = null;
for (const [name, a] of ordered) {
  if (!cur || (a.revealPos - cur.pos) > 400) { cur = { pos: a.revealPos, p: a.revealP, atoms: [] }; beats.push(cur); }
  cur.atoms.push(name);
}

const out = {
  meta: { SO, sourceVp: key.meta.vp, model: key.meta.model, bandPos: [bandStartPos, bandEndPos],
    generatedFrom: 'answer-key.json', axis: key.meta.axis,
    note: 'geometry is % of sourceVp — normalize by width for any viewport. discrete beats, not scrub.' },
  beats: beats.map((b,i)=>({ i, p: b.p, revealPos: b.pos, atoms: b.atoms })),
  atoms,
};
writeFileSync(join(dir,'beats.json'), JSON.stringify(out,null,1));
console.log(`✅ beats.json: ${beats.length} beats, ${Object.keys(atoms).length} atoms (${[...CLEAN].filter(c=>atoms[c]).length} clean-geometry)`);
for (const b of out.beats) console.log(`  beat ${b.i} @p${b.p} (pos${b.revealPos}): ${b.atoms.join(', ')}`);
console.log('\nclean atom geometry (normalized %):');
for (const [n,a] of Object.entries(atoms)) if (a.geom) console.log(`  ${n.padEnd(12)} x${a.geom.xPct}% y${a.geom.yPct}% w${a.geom.wPct}% fs${a.geom.fsVw}vw ${a.text?'"'+a.text.slice(0,26)+'"':''}`);
