#!/usr/bin/env node
/* ============================================================================
   combine-graph.mjs — build + validate the brick COMBINE graph -> library/COMBINE.json
   ----------------------------------------------------------------------------
   Classifies every combines_with / anti_combos / variants edge into:
     - real    : target is a real component id (a brick that exists)
     - to-build : combines_with target that is NOT a brick id and NOT a casing typo
                  (a forward-reference to a technique we have not harvested yet — a HARVEST SIGNAL)
     - anti    : anti_combos targets are an ANTI-PATTERN VOCABULARY (mix-blend-over-scroll,
                  second-pin, nested-pin, ...), NOT brick ids — kept as-is, never "fixed"
     - typo    : a combines_with/variants target that case-folds to a real id (a GENUINE BUG -> FAIL)
   Emits COMBINE.json: per-brick { lane, combinesReal[], toBuild[], anti[], variants[] } +
   reverse indexes (laneCombos, toBuildWanted) so an agent can resolve a composition.
   Exits non-zero ONLY on genuine typos (so the build can't regress real refs).
   Run:  node scripts/combine-graph.mjs        No deps.
   ========================================================================== */
import { readdirSync, statSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readRecipe } from './lib-frontmatter.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LIB = join(ROOT, 'library');
const COMPDIR = join(LIB, 'components');

function dirs(p) { return existsSync(p) ? readdirSync(p).filter(n => statSync(join(p, n)).isDirectory()) : []; }
function asArr(v) { return Array.isArray(v) ? v : (v == null ? [] : [v]); }

// ---- alias map from SECTIONS.yaml (beat -> lane) so we can tag each brick's lane ----
function loadAliases() {
  const txt = readFileSync(join(LIB, 'SECTIONS.yaml'), 'utf8').split('\n');
  const al = {}; let inA = false;
  for (const l of txt) {
    if (/^aliases:/.test(l)) { inA = true; continue; }
    if (/^[a-z_]+:/.test(l) && !/^\s/.test(l)) { inA = false; continue; }
    if (inA) { const m = l.match(/^\s*([A-Za-z0-9_-]+):\s*([A-Za-z0-9_-]+)\s*$/); if (m) al[m[1]] = m[2]; }
  }
  return al;
}
const ALIAS = loadAliases();

const ids = dirs(COMPDIR).filter(d => existsSync(join(COMPDIR, d, 'RECIPE.md')));
const idSet = new Set(ids);
const lcMap = new Map(ids.map(i => [i.toLowerCase(), i]));

const graph = {};
const typos = [];
const toBuildWanted = {};   // technique-name -> [bricks that want it]
const laneCombos = {};      // lane -> Set of real combo brick ids referenced within it

for (const id of ids) {
  const r = readRecipe(join(COMPDIR, id, 'RECIPE.md')) || {};
  const beats = asArr(r.page_beat).map(String);
  const lane = (beats.map(b => ALIAS[b.toLowerCase()]).find(t => t) ) || '_unsorted';
  const combinesReal = [], toBuild = [];
  for (const t0 of asArr(r.combines_with).map(String)) {
    const t = t0.trim();
    if (idSet.has(t)) combinesReal.push(t);
    else if (lcMap.has(t.toLowerCase())) typos.push(`${id}: combines_with "${t}" should be "${lcMap.get(t.toLowerCase())}"`);
    else { toBuild.push(t); (toBuildWanted[t] = toBuildWanted[t] || []).push(id); }
  }
  // variants: same typo check; keep names as-is
  const variants = asArr(r.variants).map(String).map(s => s.trim());
  for (const v of variants) if (!idSet.has(v) && lcMap.has(v.toLowerCase())) typos.push(`${id}: variants "${v}" should be "${lcMap.get(v.toLowerCase())}"`);
  // anti_combos: anti-pattern vocabulary, kept verbatim (NOT brick refs)
  const anti = asArr(r.anti_combos).map(String).map(s => s.trim());

  graph[id] = { lane, combinesReal, toBuild, anti, variants };
  (laneCombos[lane] = laneCombos[lane] || new Set());
  combinesReal.forEach(t => laneCombos[lane].add(t));
}

// finalize indexes
const laneCombosOut = Object.fromEntries(Object.entries(laneCombos).map(([k, v]) => [k, [...v].sort()]));
const toBuildSorted = Object.entries(toBuildWanted)
  .map(([name, wanters]) => ({ name, wanters: [...new Set(wanters)].sort(), count: new Set(wanters).size }))
  .sort((a, b) => b.count - a.count);

const out = {
  generated: 'scripts/combine-graph.mjs — do not hand-edit',
  brickCount: ids.length,
  graph,
  laneCombos: laneCombosOut,
  toBuild: toBuildSorted,           // the HARVEST SIGNAL: techniques bricks want but we lack, by demand
  antiVocabulary: [...new Set(Object.values(graph).flatMap(g => g.anti))].sort(),
};
writeFileSync(join(LIB, 'COMBINE.json'), JSON.stringify(out, null, 1));

const realEdges = Object.values(graph).reduce((n, g) => n + g.combinesReal.length, 0);
const toBuildEdges = Object.values(graph).reduce((n, g) => n + g.toBuild.length, 0);
console.log(`[combine-graph] wrote COMBINE.json — ${ids.length} bricks, ${realEdges} real combine edges, ${toBuildEdges} to-build refs (${toBuildSorted.length} distinct techniques wanted), ${out.antiVocabulary.length} anti-pattern terms`);
console.log(`[combine-graph] top to-build (most-wanted techniques to harvest): ${toBuildSorted.slice(0, 8).map(t => t.name + '(' + t.count + ')').join(', ')}`);
if (typos.length) {
  console.error(`[combine-graph] FAIL — ${typos.length} genuine casing typo(s):`);
  typos.forEach(t => console.error('  ' + t));
  process.exit(1);
}
console.log('[combine-graph] 0 genuine typos — graph integrity OK');
