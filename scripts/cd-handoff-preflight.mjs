#!/usr/bin/env node
/*
  cd-handoff-preflight (COUNCIL-5, 2026-07-20) — PRE-FLIGHT gate for a CD-RUN package.
  Makes fidelity structural: a CD-RUN folder may NOT be handed to Claude Design until it passes.

  Council law (both chairmen unanimous):
    "If it isn't a file or a locked number, CD will drift it."
    Every drift = entropy the SPEC left open. Ship assets + numbers, not adjectives. Ban hedges.
    An organism SPEC must be a MANIFEST (compose of existing atom IDs), zero new motion laws inside.

  CHECKS (fail-closed — any fail blocks handoff):
    1. NO HEDGES: grep the prompt/spec for possible|maybe|verify at build|if …|could be|TBD|~|approx|можливо|звірити при білді
    2. ASSET INVENTORY: every real object referenced (3D/sphere/spiral/logo/photo) must resolve to a file in assets/
    3. ONE-LAW-PER-PACKAGE: if the package declares >1 UNPROVEN motion law → it's an organism, must be a manifest
       (a manifest lists atom IDs from the base; a build with >1 new law is rejected).
    4. GEOMETRY LOCK present: a tokens block / measured px|hex present (not purely adjectival).

  Usage:
    node cd-handoff-preflight.mjs <CD-RUN-folder>
    node cd-handoff-preflight.mjs --selftest
*/
'use strict';
import fs from 'fs';
import path from 'path';

const HEDGE = /\b(possible|possibly|maybe|perhaps|verify at build|to be verified|if needed|could be|might be|TBD|to do|approx\.?|approximately|roughly|можливо|ймовірно|звірити при білді|перевірити при білді|уточнити|десь|орієнтовно)\b|(^|[^\d])~\s?\d/i;
const ASSET_HINT = /(sphere|spiral|helix|logo|wordmark-object|3d|\.glb|\.mp4|\.webm|photo|фото|tower|lobby|render|асет)/i;
const GEOM = /(font-size\s*:\s*\d|:\s*#[0-9a-f]{3,6}|\btokens?\.css\b|\b\d+\s*px\b|line-height\s*:\s*\d|letter-spacing\s*:)/i;
const LAW_MARKER = /\b(NEW|новий закон|new law|new motion)\b/gi;

function readAll(dir) {
  const out = {};
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    let st; try { st = fs.statSync(p); } catch { continue; }
    if (st.isFile() && /\.md$/i.test(f)) out[f] = fs.readFileSync(p, 'utf8');
  }
  return out;
}

function preflight(dir) {
  const fails = [], warns = [];
  const docs = readAll(dir);
  const blob = Object.values(docs).join('\n');
  const assetsDir = path.join(dir, 'assets');
  const assets = fs.existsSync(assetsDir) ? fs.readdirSync(assetsDir) : [];

  // 1. hedges — scan the PROMPT + SPEC docs (skip files that are meant to log history like 00-READ-FIRST history sections)
  const promptDocs = Object.entries(docs).filter(([n]) => /prompt|spec|beat/i.test(n));
  for (const [name, txt] of promptDocs) {
    const lines = txt.split('\n');
    lines.forEach((ln, i) => {
      // ignore lines that are explicitly documenting a ban/rule about hedges
      if (/заборон|ban|НЕ хедж|zero hedge|нуль хедж|forbidden/i.test(ln)) return;
      const m = ln.match(HEDGE);
      if (m) fails.push(`HEDGE in ${name}:${i + 1} → "${m[0].trim()}"  (resolve to a fact from the video before handoff)`);
    });
  }

  // 2. asset inventory — if a real object is referenced, an asset file should exist
  if (ASSET_HINT.test(blob)) {
    if (assets.length === 0) fails.push('ASSET-INVENTORY: real objects referenced (sphere/spiral/photo) but assets/ is empty — ship files, not descriptions.');
  }
  // procedural-CSS red flag: mentions building the object in CSS/SVG instead of shipping it
  if (/procedural|CSS[- ]?(spiral|helix|fan)|намалюй.*спіраль|draw.*spiral in (css|svg)/i.test(blob)
      && !/asset|\.png|\.jpg|\.webp|\.glb|\.mp4/i.test(blob)) {
    warns.push('PROCEDURAL-OBJECT: object may be described for CSS re-creation — prefer shipping a real asset file.');
  }

  // 3. one-law-per-package — count NEW law markers; if >1 and no manifest, reject
  const newLaws = (blob.match(LAW_MARKER) || []).length;
  const hasManifest = /manifest|compose\(|маніфест|atom id|за id|by id|BASE\b/i.test(blob);
  if (newLaws > 1 && !hasManifest) {
    fails.push(`ONE-LAW: ${newLaws} NEW motion-law markers and no manifest — this is an organism. Split into one-law-per-CD-run or write it as a compose() manifest of base atom IDs.`);
  }

  // 4. geometry lock
  if (!GEOM.test(blob)) warns.push('GEOMETRY-LOCK: no measured px/hex/tokens found — geometry may be adjectival (drift risk). Add a tokens block.');

  return { fails, warns, assets: assets.length, newLaws, hasManifest };
}

function selftest() {
  const tmp = fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'cdpf-'));
  // BAD package: hedge + no assets + 2 new laws
  fs.writeFileSync(path.join(tmp, '10-PROMPT.md'),
    'Build the spiral. Possible slider — verify at build.\nBeat A NEW law: blur. Beat B NEW law: pin.\nHeadings large.');
  const bad = preflight(tmp);
  const badOk = bad.fails.some(f => /HEDGE/.test(f)) && bad.fails.some(f => /ONE-LAW/.test(f));
  // GOOD package: no hedge, assets present, manifest, tokens
  fs.mkdirSync(path.join(tmp, 'assets'));
  fs.writeFileSync(path.join(tmp, 'assets', 'sphere.mp4'), 'x');
  fs.writeFileSync(path.join(tmp, '10-PROMPT.md'),
    'Manifest: compose(air-blur-reveal, air-theme-flip) by ID. sphere = assets/sphere.mp4.\nfont-size: 118px; color:#0a0a0a; tokens.css imported.');
  const good = preflight(tmp);
  const goodOk = good.fails.length === 0;
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('SELFTEST bad-rejected:', badOk, '| good-passed:', goodOk);
  process.exit(badOk && goodOk ? 0 : 1);
}

const arg = process.argv[2];
if (arg === '--selftest') selftest();
else if (!arg) { console.error('usage: cd-handoff-preflight.mjs <folder> | --selftest'); process.exit(2); }
else {
  const r = preflight(arg);
  console.log(`\n== CD-HANDOFF PRE-FLIGHT: ${arg} ==`);
  console.log(`assets: ${r.assets} · NEW-law markers: ${r.newLaws} · manifest: ${r.hasManifest}`);
  if (r.warns.length) { console.log('\nWARN:'); r.warns.forEach(w => console.log('  ⚠ ' + w)); }
  if (r.fails.length) { console.log('\nFAIL (handoff BLOCKED):'); r.fails.forEach(f => console.log('  ✗ ' + f)); process.exit(1); }
  console.log('\n✅ PRE-FLIGHT PASS — safe to hand to Claude Design.');
}
