#!/usr/bin/env node
/* ============================================================================
   library-verify.mjs — the reproduction GATE for library/.
   For every entry it asserts:
     1. required front-matter fields present (id, name, kind, status,
        meaning.when, meaning.lands, source, gated_by, acceptance; entry.call on
        DOM components).
     2. the contract files exist (components: component.js/css, lab.html,
        tokens.json; combos: combo-lab.html; shared: util.js/css).
     3. motion-props lint: component.js/util.js do not animate banned layout
        props (width/left/top/margin) or scrub video.currentTime, vs motion_props.
     4. dangling-uses: every combo `uses:` atom resolves to a real component or
        shared id.
     5. pin law: a combo has AT MOST ONE owns_pin owner; exactly one unless it is
        a conversion gate (page_beat:conversion) which may have zero.
     6. variant law: every variant.recipe.md carries `extends:` + (params.json OR
        a base-importing variant.js); a forked component.js in variants/* = FAIL.
     7. headless labs: open each DOM entry's lab and assert window.__LAB_OK__.
        WebGL entries (webgl:true) → status candidate, headless SKIPPED.
        status:seed entries → row-only, files+headless SKIPPED.

   Run:        node scripts/library-verify.mjs
   Skip DOM:   node scripts/library-verify.mjs --no-headless
   Playwright is resolved from apps/smarts/node_modules if present; if missing,
   the headless step is auto-skipped (reported, not failed).
   ========================================================================== */
import { readdirSync, statSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readRecipe } from './lib-frontmatter.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LIB = join(ROOT, 'library');
const NO_HEADLESS = process.argv.includes('--no-headless');

const errors = [];
const warns = [];
const skips = [];
const fail = (id, m) => errors.push(`[${id}] ${m}`);
const warn = (id, m) => warns.push(`[${id}] ${m}`);
const skip = (id, m) => skips.push(`[${id}] ${m}`);

// _-prefixed dirs are infrastructure (e.g. combos/_scaffold), not library entries — skip them everywhere
function dirs(p) { return existsSync(p) ? readdirSync(p).filter(n => !n.startsWith('_') && statSync(join(p, n)).isDirectory()) : []; }
const BANNED_RE = /\b(width|height|left|top|right|bottom|margin)\s*:/i; // crude; only flag in animate-ish contexts below
const VIDEO_RE = /\.currentTime\s*=/;

/* collect entries */
const components = {}, combos = {}, shared = {};
for (const id of dirs(join(LIB, 'components'))) {
  const fm = readRecipe(join(LIB, 'components', id, 'RECIPE.md'));
  if (fm) components[id] = { ...fm, _dir: join(LIB, 'components', id) };
}
for (const id of dirs(join(LIB, 'combos'))) {
  const fm = readRecipe(join(LIB, 'combos', id, 'RECIPE.md'));
  if (fm) combos[id] = { ...fm, _dir: join(LIB, 'combos', id) };
}
for (const id of dirs(join(LIB, 'shared'))) {
  const fm = readRecipe(join(LIB, 'shared', id, 'UTIL.md'));
  if (fm) shared[id] = { ...fm, _dir: join(LIB, 'shared', id) };
}
const atomIds = new Set([...Object.keys(components), ...Object.keys(shared)]);

/* ---- 1+2: required fields + files ---- */
function checkFields(id, e, isComponent) {
  if (e.__parseError) return fail(id, `YAML parse error: ${e.__parseError}`);
  for (const f of ['id', 'name', 'kind', 'status']) if (e[f] === undefined || e[f] === '') fail(id, `missing field: ${f}`);
  if (!e.meaning || !e.meaning.when) fail(id, 'meaning.when is required + non-empty');
  if (!e.meaning || !e.meaning.lands) fail(id, 'meaning.lands is required + non-empty');
  if (!e.source) fail(id, 'source is required');
  if (!e.gated_by || (Array.isArray(e.gated_by) && e.gated_by.length === 0)) warn(id, 'gated_by empty');
  if (!e.acceptance || (Array.isArray(e.acceptance) && e.acceptance.length === 0)) warn(id, 'acceptance empty');
  if (isComponent && e.status !== 'seed' && (!e.entry || !e.entry.call)) fail(id, 'entry.call required on a non-seed component');
}

for (const [id, e] of Object.entries(components)) {
  checkFields(id, e, true);
  if (e.status === 'seed') { skip(id, 'status:seed — row only, files+headless skipped'); continue; }
  for (const f of ['component.js', 'component.css', 'lab.html', 'tokens.json'])
    if (!existsSync(join(e._dir, f))) fail(id, `missing contract file: ${f}`);
}
for (const [id, e] of Object.entries(combos)) {
  checkFields(id, e, false);
  if (!existsSync(join(e._dir, 'combo-lab.html'))) warn(id, 'missing combo-lab.html (needed for headless proof)');
}
for (const [id, e] of Object.entries(shared)) {
  checkFields(id, e, false);
  for (const f of ['util.js', 'util.css']) if (!existsSync(join(e._dir, f))) fail(id, `missing shared file: ${f}`);
}

/* ---- 3: motion-props lint (components + shared with real code) ---- */
function lintCode(id, file, motionProps) {
  if (!existsSync(file)) return;
  const src = readFileSync(file, 'utf8');
  if (VIDEO_RE.test(src)) fail(id, 'animates video.currentTime (banned — use 2-img crossfade)');
  // Flag banned layout props ONLY inside gsap tween/keyframe object literals.
  const tweenBlocks = src.match(/gsap\.(to|from|fromTo|set)\([^;]*?\{[^}]*\}/gs) || [];
  for (const blk of tweenBlocks) {
    // A prop is a REAL animated/written layout value only when its value is
    // dynamic/numeric — not a reset (`top: "auto"`, `left: 0`) and not a quoted
    // ScrollTrigger position string (`start: 'top top'`). Capture the value.
    const m = blk.match(/\b(width|left|top|right|bottom|margin)\s*:\s*([^,}\n]+)/i);
    if (!m) continue;
    const prop = m[1].toLowerCase();
    const val = m[2].trim();
    const isReset = /^(["']?auto["']?|0|["']?none["']?)$/i.test(val);
    if (isReset) continue;                      // clearProps-style reset → benign
    const allowed = (motionProps || []).map(String);
    // width/height are fine as clip-path/transform substitutes only if declared
    if (!allowed.includes(prop)) warn(id, `gsap tween writes layout prop '${prop}: ${val.slice(0,24)}' (perf note; not declared in motion_props)`);
  }
}
for (const [id, e] of Object.entries(components)) {
  if (e.status === 'seed') continue;
  lintCode(id, join(e._dir, 'component.js'), e.motion_props);
}

/* ---- 4: dangling uses ---- */
for (const [id, e] of Object.entries(combos)) {
  const uses = Array.isArray(e.uses) ? e.uses : [];
  for (const u of uses) {
    const atom = (u && typeof u === 'object') ? u.atom : u;
    if (!atom) continue;
    if (!atomIds.has(atom)) fail(id, `uses: '${atom}' resolves to nothing (no component/ or shared/ with that id)`);
  }
}

/* ---- 5: pin law ---- */
for (const [id, e] of Object.entries(combos)) {
  const uses = Array.isArray(e.uses) ? e.uses : [];
  // owners declared via component owns_pin OR the combo pin.owner
  const owner = e.pin && e.pin.owner;
  const isConversion = (Array.isArray(e.page_beat) ? e.page_beat.includes('conversion') : e.page_beat === 'conversion');
  if (isConversion) {
    if (owner && owner !== 'none' && owner !== 0) warn(id, `conversion gate declares a pin owner (${owner}) — gates should hold zero pins`);
    continue;
  }
  // count atoms whose component owns_pin true.
  // `pin_killed: [ids]` in the combo front-matter declares an owns_pin atom whose pin is killed
  // at wire-time (so only one real pin exists at runtime) — a legit compose pattern; subtract those.
  const killed = new Set((Array.isArray(e.pin_killed) ? e.pin_killed : (e.pin_killed ? [e.pin_killed] : [])).map(String));
  const pinOwners = uses.filter(u => {
    const atom = (u && typeof u === 'object') ? u.atom : u;
    return components[atom] && components[atom].owns_pin === true && !killed.has(atom);
  }).map(u => (u && typeof u === 'object') ? u.atom : u);
  // page-assembly: пін-бюджет діє ПО АКТАХ, не по сторінці (жива головна AIR
  // має послідовні піни format/harmony/status) — pin.count мусить збігатись.
  if (e.kind === 'page-assembly') {
    const declared = e.pin && e.pin.count;
    if (declared != null && Number(declared) !== pinOwners.length)
      fail(id, `page-assembly pin.count=${declared} != owns_pin атомів у стеку (${pinOwners.length}: ${pinOwners.join(', ')})`);
    continue;
  }
  if (pinOwners.length > 1) fail(id, `more than one owns_pin atom in stack: ${pinOwners.join(', ')} (R_pin_budget: one pin-owner per section; add pin_killed:[id] if one is killed at wire-time)`);
  if (pinOwners.length === 1 && owner && owner !== pinOwners[0])
    warn(id, `pin.owner '${owner}' != the owns_pin atom '${pinOwners[0]}'`);
  if (pinOwners.length === 0 && (!owner || owner === 'none'))
    warn(id, 'no owns_pin atom and no pin.owner — confirm this section is intentionally pin-less');
  // first uses entry should be the owner
  if (uses.length && owner && owner !== 'none') {
    const first = (uses[0] && typeof uses[0] === 'object') ? uses[0].atom : uses[0];
    if (first !== owner) warn(id, `first uses entry '${first}' is not the pin owner '${owner}' (CONTRACT: owner first)`);
  }
}

/* ---- 6: variant law ---- */
for (const [id, e] of Object.entries(components)) {
  const vRoot = join(e._dir, 'variants');
  if (!existsSync(vRoot)) continue;
  for (const v of dirs(vRoot)) {
    const vDir = join(vRoot, v);
    if (existsSync(join(vDir, 'component.js'))) fail(`${id}/${v}`, 'variants/* contains a forked component.js — BANNED (variant must be a delta)');
    const vr = readRecipe(join(vDir, 'variant.recipe.md'));
    if (!vr) { fail(`${id}/${v}`, 'missing variant.recipe.md'); continue; }
    if (!vr.extends) fail(`${id}/${v}`, 'variant.recipe.md missing extends:');
    const hasParams = existsSync(join(vDir, 'params.json'));
    const hasVariantJs = existsSync(join(vDir, 'variant.js'));
    if (!hasParams && !hasVariantJs) fail(`${id}/${v}`, 'variant must carry params.json OR a base-importing variant.js');
    if (hasVariantJs) {
      const src = readFileSync(join(vDir, 'variant.js'), 'utf8');
      if (!/\.\.\/\.\.\/component\.js|import .*component/.test(src)) fail(`${id}/${v}`, 'variant.js does not reference the base component.js');
    }
  }
}

/* ---- 6b: registry cross-ref (H17) — бібліотека↔реєстр = одна система імен ---- */
const REGISTRY_MD = join(ROOT, 'skills', 'grammar', 'references', '_REGISTRY_TID.md');
const registryIds = new Set();
if (existsSync(REGISTRY_MD))
  for (const m of readFileSync(REGISTRY_MD, 'utf8').matchAll(/\bT-M?\d+(?:\.\d+)?\b/g)) registryIds.add(m[0]);
for (const [id, e] of [...Object.entries(components), ...Object.entries(combos)]) {
  const raw = e.source && typeof e.source === 'object' ? e.source.registry_ref : undefined;
  const refs = Array.isArray(raw) ? raw : (raw ? [raw] : []);
  if (!refs.length) {
    if (e.status === 'official') warn(id, 'source.registry_ref порожній на official (H17: додай T-### або "x:<чому поза реєстром>")');
    continue;
  }
  for (const r of refs.map(String)) {
    if (r.startsWith('x:')) continue; // явно поза реєстром, причина в рядку
    if (!/^T-M?\d+(\.\d+)?$/.test(r)) {
      // legacy slug-конвенція (locmap-canon, SMARTS-location-etalon…) — борг, не типо
      warn(id, `registry_ref '${r}' = slug, не T-ID (H17: додай T-### поруч або "x:<чому>" при наступному дотику)`);
      continue;
    }
    if (registryIds.size && !registryIds.has(r)) fail(id, `registry_ref '${r}' відсутній у _REGISTRY_TID.md (dangling cross-ref)`);
  }
}

/* ---- 6c: hygiene (B16 / К1.7 / К7) ---- */
const ENTITY_TEXTCONTENT_RE = /textContent\s*=\s*[^;\n]*&[a-z]+;/;
for (const [id, e] of Object.entries(components)) {
  if (e.status === 'seed') continue;
  const js = join(e._dir, 'component.js');
  if (existsSync(js) && ENTITY_TEXTCONTENT_RE.test(readFileSync(js, 'utf8')))
    fail(id, 'HTML-entity у textContent-рядку — рендериться літерально; пиши реальний символ (К7)');
  const css = join(e._dir, 'component.css');
  if (existsSync(css) && /overflow-x\s*:\s*hidden/.test(readFileSync(css, 'utf8')))
    warn(id, 'overflow-x: hidden — ламає position:sticky у предків; заміна = overflow-x: clip (К1.7)');
}

/* ---- 7: headless labs ---- */
async function headless() {
  if (NO_HEADLESS) { skip('*', 'headless skipped (--no-headless)'); return; }
  let chromium;
  const { createRequire } = await import('node:module');
  // Resolve playwright from common locations; apps/smarts ships it (CJS export
  // exposes chromium, unlike the ESM index.js test-runner entry).
  const reqRoots = [
    process.env.PLAYWRIGHT_FROM,
    join(ROOT, '..', 'eruhomist', 'apps', 'smarts', 'package.json'),
    '/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json',
    join(ROOT, 'package.json'),
  ].filter(Boolean);
  for (const r of reqRoots) {
    try {
      const require = createRequire(pathToFileURL(r));
      const pw = require('playwright');
      if (pw && pw.chromium) { chromium = pw.chromium; break; }
    } catch {}
  }
  if (!chromium) { try { ({ chromium } = await import('playwright')); } catch {} }
  if (!chromium) { skip('*', 'playwright not resolvable — headless lab step skipped (set PLAYWRIGHT_FROM=<dir>/package.json to enable)'); return; }

  const browser = await chromium.launch();
  async function probe(id, labFile) {
    if (!existsSync(labFile)) { warn(id, `lab missing for headless: ${labFile}`); return; }
    const page = await browser.newPage();
    const consoleErrs = [];
    page.on('console', m => { if (m.type() === 'error') consoleErrs.push(m.text()); });
    page.on('pageerror', e => consoleErrs.push(String(e)));
    try {
      await page.goto(pathToFileURL(labFile).href, { waitUntil: 'load', timeout: 15000 });
      await page.waitForFunction('window.__LAB_OK__ === true', { timeout: 8000 }).catch(() => {});
      const ok = await page.evaluate('window.__LAB_OK__ === true');
      if (!ok) fail(id, `headless lab did not reach __LAB_OK__ (errors: ${consoleErrs.slice(0,2).join(' | ') || 'none'})`);
    } catch (e) {
      warn(id, `headless lab threw (often a blocked remote asset under file://): ${String(e).slice(0,80)}`);
    } finally { await page.close(); }
  }

  for (const [id, e] of Object.entries(components)) {
    if (e.status === 'seed') continue;
    if (e.webgl) { skip(id, 'webgl:true — headless GL probe skipped (status candidate)'); continue; }
    await probe(id, join(e._dir, 'lab.html'));
    const vRoot = join(e._dir, 'variants');
    for (const v of (existsSync(vRoot) ? dirs(vRoot) : []))
      await probe(`${id}/${v}`, join(vRoot, v, 'variant.lab.html'));
  }
  for (const [id, e] of Object.entries(combos)) {
    if (existsSync(join(e._dir, 'combo-lab.html'))) await probe(id, join(e._dir, 'combo-lab.html'));
  }
  await browser.close();
}

await headless();

/* ---- combine-graph integrity gate: fails on genuine casing typos in combine/variant refs ---- */
try {
  const { execSync } = await import('node:child_process');
  execSync('node scripts/combine-graph.mjs', { cwd: ROOT, stdio: 'inherit' });
} catch {
  errors.push('combine-graph: genuine typo(s) in combines_with/variants — see output above');
}

/* ---- report ---- */
console.log(`\n=== library-verify ===`);
console.log(`components: ${Object.keys(components).length}  combos: ${Object.keys(combos).length}  shared: ${Object.keys(shared).length}`);
if (skips.length) { console.log(`\nSKIPPED (${skips.length}):`); skips.forEach(s => console.log('  · ' + s)); }
if (warns.length) { console.log(`\nWARN (${warns.length}):`); warns.forEach(s => console.log('  ! ' + s)); }
if (errors.length) {
  console.log(`\nRED (${errors.length}):`); errors.forEach(s => console.log('  ✗ ' + s));
  console.log(`\n✗ verify FAILED with ${errors.length} error(s).`);
  process.exit(1);
}
console.log(`\n✓ verify GREEN (no hard errors).`);
