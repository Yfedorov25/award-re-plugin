#!/usr/bin/env node
/* ============================================================================
   library-gallery.mjs — emit library/GALLERY.html : every technique split by the
   SECTION it can play (lanes from SECTIONS.yaml), with coverage badges + a red GAP
   list, live iframe-card previews per brick. GENERATED-ONLY; never hand-edit output.
   Run:  node scripts/library-gallery.mjs   (then open library/GALLERY.html via the 8820 server)
   No deps (tiny YAML reader + the existing front-matter reader).
   ========================================================================== */
import { readdirSync, statSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readRecipe } from './lib-frontmatter.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LIB = join(ROOT, 'library');
const COMPDIR = join(LIB, 'components');

// ---- tiny YAML reader for SECTIONS.yaml (roles[], mechanic[], aliases{}) ----
function loadSections() {
  const txt = readFileSync(join(LIB, 'SECTIONS.yaml'), 'utf8').split('\n');
  const roles = [], mechanic = [], aliases = {};
  let mode = null, cur = null;
  for (let raw of txt) {
    const line = raw.replace(/\t/g, '  ');
    if (/^roles:/.test(line)) { mode = 'roles'; continue; }
    if (/^mechanic:/.test(line)) { mode = 'mechanic'; continue; }
    if (/^aliases:/.test(line)) { mode = 'aliases'; continue; }
    if (/^[a-z_]+:/.test(line) && !/^\s/.test(line)) { mode = null; continue; } // other top-level
    if (line.trim().startsWith('#') || !line.trim()) continue;
    if (mode === 'roles') {
      const m = line.match(/^\s*-\s*id:\s*(\S+)/);
      if (m) { cur = { id: m[1] }; roles.push(cur); continue; }
      const t = line.match(/^\s*(tier|title|job):\s*(.+)$/);
      if (t && cur) cur[t[1]] = t[2].trim();
    } else if (mode === 'mechanic') {
      const m = line.match(/^\s*-\s*(\S+)/); if (m) mechanic.push(m[1]);
    } else if (mode === 'aliases') {
      const m = line.match(/^\s*([A-Za-z0-9_-]+):\s*([A-Za-z0-9_-]+)\s*$/); if (m) aliases[m[1]] = m[2];
    }
  }
  return { roles, mechanic, aliases };
}

function dirs(p) { return existsSync(p) ? readdirSync(p).filter(n => statSync(join(p, n)).isDirectory()) : []; }

const SECTIONS = loadSections();
const roleById = Object.fromEntries(SECTIONS.roles.map(r => [r.id, r]));
const mechanicSet = new Set(SECTIONS.mechanic);

// ---- read every brick ----
const unresolved = new Set();
const bricks = [];
for (const id of dirs(COMPDIR)) {
  const recPath = join(COMPDIR, id, 'RECIPE.md');
  if (!existsSync(recPath)) continue;
  const r = readRecipe(recPath) || {};
  const beats = Array.isArray(r.page_beat) ? r.page_beat : (r.page_beat ? [r.page_beat] : []);
  // resolve each beat -> a role id or a mechanic id; the brick's PRIMARY lane = first that resolves to a role
  let lane = null, isMechanic = false;
  const resolved = [];
  for (const b of beats) {
    const key = String(b).toLowerCase();
    const target = SECTIONS.aliases[key];
    if (!target) { unresolved.add(key); continue; }
    resolved.push(target);
    if (roleById[target] && !lane) lane = target;
  }
  if (!lane) {
    // no section role -> a mechanic, if any resolved beat is a mechanic
    if (resolved.some(t => mechanicSet.has(t))) { isMechanic = true; lane = '_mechanic'; }
    else { lane = '_unsorted'; }
  }
  bricks.push({
    id, lane, isMechanic, kind: r.kind || 'component', level: r.level || '',
    name: (r.name || id).replace(/^["']|["']$/g, ''),
    what: ((r.meaning && r.meaning.what) || '').replace(/^["']|["']$/g, '').slice(0, 220),
    hasLab: existsSync(join(COMPDIR, id, 'lab.html')),
  });
}

// ---- read every SECTION-VARIANT (library/combos/<id>/) — the assembled base units ----
// A combo declares its lane via front-matter `section:` (a role id). It is shown as a
// distinct "ВАРІАНТИ СЕКЦІЇ" strip at the TOP of that lane, above the atoms it is built from.
const COMBODIR = join(LIB, 'combos');
const variantsByLane = {};
for (const id of dirs(COMBODIR)) {
  const recPath = join(COMBODIR, id, 'RECIPE.md');
  if (!existsSync(recPath)) continue;
  const r = readRecipe(recPath) || {};
  // resolve the declared section in priority order:
  //  1) explicit `section:` field, 2) id prefix before `--` (new <role>--<variant> convention),
  //  3) `page_beat` alias-resolved (legacy combos predate the `--` convention)
  let laneId = r.section && roleById[r.section] ? r.section : null;
  if (!laneId) {
    const pre = id.split('--')[0].toLowerCase();
    laneId = roleById[pre] ? pre : (SECTIONS.aliases[pre] && roleById[SECTIONS.aliases[pre]] ? SECTIONS.aliases[pre] : null);
  }
  if (!laneId && r.page_beat) {
    const beats = Array.isArray(r.page_beat) ? r.page_beat : [r.page_beat];
    for (const b of beats) { const t = SECTIONS.aliases[String(b).toLowerCase()]; if (roleById[t]) { laneId = t; break; } }
  }
  if (!laneId) { unresolved.add(`combo:${id}`); laneId = '_unsorted'; }
  (variantsByLane[laneId] = variantsByLane[laneId] || []).push({
    id, lane: laneId,
    name: (r.name || id).replace(/^["']|["']$/g, ''),
    status: r.status || 'candidate',
    uses: Array.isArray(r.uses) ? r.uses.map(u => (typeof u === 'string' ? u : (u.id || u.atom || ''))).filter(Boolean) : [],
    what: ((r.meaning && r.meaning.what) || '').replace(/^["']|["']$/g, '').slice(0, 220),
    hasLab: existsSync(join(COMBODIR, id, 'combo-lab.html')),
  });
}

// ---- group by lane ----
const byLane = {};
for (const b of bricks) (byLane[b.lane] = byLane[b.lane] || []).push(b);

function badge(n) { return n >= 3 ? ['deep', 'deep'] : n >= 1 ? ['thin', 'thin'] : ['gap', 'GAP']; }
const EMOJI = { deep: '🟢', thin: '🟡', gap: '🔴' };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---- emit gap report ----
const tiers = { core: 'CORE', common: 'COMMON', custom: 'CUSTOM' };
const gap = { deep: [], thin: [], gap: [] };
for (const r of SECTIONS.roles) { const n = (byLane[r.id] || []).length; gap[badge(n)[0]].push(`${r.title}(${n})`); }

function card(b) {
  const lab = b.hasLab ? `components/${b.id}/lab.html` : '';
  const ribbon = b.kind === 'section' ? '<span class="rib rib--sec">секція</span>'
    : b.isMechanic ? '<span class="rib rib--mech">прийом-рев</span>' : '';
  return `<div class="card">
    <div class="prev">${lab ? `<iframe loading="lazy" src="${lab}" title="${esc(b.id)}"></iframe>` : '<div class="noprev">нема lab.html</div>'}</div>
    <div class="meta"><div class="id">${ribbon}<b>${esc(b.id)}</b></div><p>${esc(b.what)}</p>
      ${lab ? `<div class="acts"><a class="play" href="${lab}" target="_blank">відкрити ↗</a></div>` : ''}</div>
  </div>`;
}

// the assembled section-variant card — the actual base unit the owner judges on the board
function vcard(v) {
  const lab = v.hasLab ? `combos/${v.id}/combo-lab.html` : '';
  const st = v.status === 'base' ? '<span class="rib rib--base">БАЗА</span>'
    : v.status === 'candidate' ? '<span class="rib rib--cand">кандидат</span>' : '';
  const uses = v.uses.length ? `<div class="uses">${v.uses.map(u => `<span>${esc(u)}</span>`).join('')}</div>` : '';
  return `<div class="card card--variant">
    <div class="prev">${lab ? `<iframe loading="lazy" src="${lab}" title="${esc(v.id)}"></iframe>` : '<div class="noprev">нема combo-lab.html</div>'}</div>
    <div class="meta"><div class="id">${st}<b>${esc(v.name)}</b></div><p>${esc(v.what)}</p>${uses}
      ${lab ? `<div class="acts"><a class="play" href="${lab}" target="_blank">відкрити секцію ↗</a></div>` : ''}</div>
  </div>`;
}

function lane(role) {
  const list = (byLane[role.id] || []).sort((a, b) => (b.kind === 'section') - (a.kind === 'section'));
  const variants = (variantsByLane[role.id] || []).sort((a, b) => (b.status === 'base') - (a.status === 'base'));
  const [key, lbl] = badge(list.length);
  const vStrip = variants.length ? `<div class="vstrip">
      <div class="vstrip__hd">ВАРІАНТИ СЕКЦІЇ <span class="vcnt">${variants.length}</span> <span class="vstrip__hint">зібрані з прийомів нижче — це базові одиниці, які ти оцінюєш на борді</span></div>
      <div class="grid grid--variant">${variants.map(vcard).join('')}</div>
    </div>` : '';
  return `<section class="lane" data-tier="${role.tier}">
    <div class="lanehd">
      <h2>${esc(role.title)} <span class="cnt ${lbl}">${EMOJI[key]} ${list.length}</span>${variants.length ? ` <span class="vbadge">▣ ${variants.length} варіант${variants.length === 1 ? '' : 'и'}</span>` : ''}</h2>
      <span class="tier tier--${role.tier}">${tiers[role.tier]}</span>
      <p class="job">${esc(role.job)}</p>
    </div>
    ${vStrip}
    ${list.length ? `<div class="grid">${list.map(card).join('')}</div>` : `<div class="empty">🔴 Прогалина — жодного прийому. Сюди добираємо.</div>`}
  </section>`;
}

const mech = (byLane['_mechanic'] || []);
const unsorted = (byLane['_unsorted'] || []);
const total = bricks.length;
const variantTotal = Object.values(variantsByLane).reduce((n, a) => n + a.length, 0);

const html = `<!DOCTYPE html><html lang="uk"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>award-re · галерея прийомів по секціях</title>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{--cream:#f4efe6;--ink:#2c2620;--bg:#16130f;--card:#1c1813;--line:rgba(244,239,230,.12);--serif:'Fraunces',Georgia,serif;--sans:'Inter',system-ui,sans-serif;--brick:#b56a4a}
  *{margin:0;box-sizing:border-box}body{background:var(--bg);color:var(--cream);font-family:var(--sans);line-height:1.5}
  a{color:inherit}
  .head{padding:48px clamp(20px,5vw,72px) 22px;border-bottom:1px solid var(--line)}
  .head h1{font-family:var(--serif);font-weight:300;font-size:clamp(2rem,5vw,3.2rem);letter-spacing:-.01em}
  .head .sub{opacity:.6;margin-top:.5rem;max-width:80ch}
  .gapbar{margin-top:18px;font-size:.86rem;line-height:1.9;background:rgba(0,0,0,.25);border:1px solid var(--line);border-radius:8px;padding:14px 18px}
  .gapbar b{color:var(--brick);letter-spacing:.04em}
  .filters{position:sticky;top:0;z-index:30;background:rgba(22,19,15,.94);backdrop-filter:none;border-bottom:1px solid var(--line);padding:12px clamp(20px,5vw,72px);display:flex;gap:8px;flex-wrap:wrap}
  .filters button{font:600 .7rem/1 var(--sans);letter-spacing:.1em;text-transform:uppercase;color:var(--cream);background:transparent;border:1px solid var(--line);padding:.5rem .85rem;border-radius:999px;cursor:pointer}
  .filters button.on{background:var(--cream);color:var(--ink);border-color:var(--cream)}
  .lane{padding:30px clamp(20px,5vw,72px);border-bottom:1px solid var(--line)}
  .lanehd{display:grid;grid-template-columns:1fr auto;align-items:baseline;gap:8px 18px;margin-bottom:18px}
  .lanehd h2{font-family:var(--serif);font-weight:300;font-size:clamp(1.5rem,3vw,2.2rem)}
  .cnt{font-family:var(--sans);font-size:.9rem;margin-left:.5rem;opacity:.9}
  .cnt.GAP{color:#e0664c}.cnt.thin{color:#d9a441}
  .tier{font-size:.62rem;letter-spacing:.16em;text-transform:uppercase;padding:.35rem .7rem;border-radius:999px;border:1px solid var(--line);opacity:.85}
  .tier--core{color:#9ec0a0;border-color:rgba(158,192,160,.5)}
  .tier--common{color:#cdbf9a}
  .tier--custom{color:#c98a72;border-color:rgba(201,138,114,.5)}
  .job{grid-column:1/-1;opacity:.55;font-size:.9rem;margin-top:-4px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:20px}
  .card{border:1px solid var(--line);border-radius:6px;overflow:hidden;background:var(--card);display:flex;flex-direction:column}
  .prev{position:relative;aspect-ratio:16/10;overflow:hidden;background:#000}
  .prev iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
  .noprev{display:grid;place-items:center;height:100%;opacity:.4;font-size:.8rem}
  .meta{padding:13px 15px 16px}
  .meta .id{font-family:var(--serif);font-size:1.06rem}.meta .id b{font-weight:400}
  .meta p{font-size:.8rem;opacity:.62;margin-top:6px}
  .rib{font:600 .56rem/1 var(--sans);letter-spacing:.1em;text-transform:uppercase;padding:.3rem .5rem;border-radius:3px;margin-right:.5em;vertical-align:middle}
  .rib--sec{background:var(--brick);color:#fff}.rib--mech{background:rgba(244,239,230,.14);color:var(--cream)}
  .rib--base{background:#9ec0a0;color:var(--ink)}.rib--cand{background:rgba(181,106,74,.25);color:#d9a441;border:1px solid rgba(217,164,65,.5)}
  /* the section-variant strip — the assembled base units, set above the atoms */
  .vbadge{font:600 .7rem/1 var(--sans);letter-spacing:.06em;color:#9ec0a0;margin-left:.6rem}
  .vstrip{border:1px solid rgba(158,192,160,.35);background:linear-gradient(180deg,rgba(158,192,160,.06),rgba(0,0,0,.18));border-radius:10px;padding:16px 18px 20px;margin-bottom:22px}
  .vstrip__hd{font:600 .72rem/1.4 var(--sans);letter-spacing:.14em;text-transform:uppercase;color:#9ec0a0;margin-bottom:14px}
  .vstrip__hd .vcnt{background:#9ec0a0;color:var(--ink);border-radius:999px;padding:.1rem .5rem;font-size:.66rem}
  .vstrip__hint{display:block;text-transform:none;letter-spacing:0;font-weight:400;opacity:.55;color:var(--cream);margin-top:5px}
  .grid--variant{grid-template-columns:repeat(auto-fill,minmax(420px,1fr))}
  .card--variant{border-color:rgba(158,192,160,.4)}
  .card--variant .prev{aspect-ratio:16/9}
  .uses{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}
  .uses span{font:500 .6rem/1 var(--sans);letter-spacing:.02em;opacity:.7;border:1px solid var(--line);border-radius:3px;padding:.3rem .45rem}
  .acts{margin-top:11px}.acts .play{font:600 .66rem/1 var(--sans);letter-spacing:.1em;text-transform:uppercase;padding:.5rem .8rem;border:1px solid var(--line);border-radius:3px;text-decoration:none}
  .empty{padding:26px;border:1px dashed rgba(224,102,76,.5);border-radius:8px;color:#e0664c;font-size:.95rem}
  .foot{padding:24px clamp(20px,5vw,72px) 80px;opacity:.5;font-size:.82rem}
</style></head><body>
<div class="head">
  <h1>Галерея прийомів — по секціях</h1>
  <p class="sub">${variantTotal} зібран${variantTotal === 1 ? 'ий варіант секції' : 'их варіантів секцій'} + ${total} прийомів-цеглинок, розкладені по ${SECTIONS.roles.length} канонічних секціях нерухомості (CORE / COMMON / CUSTOM). Зелена смуга вгорі лейну — ВАРІАНТИ СЕКЦІЇ (базові одиниці, які ти оцінюєш). Нижче — прийоми, з яких вони зібрані. Кожна картка жива, відкрий щоб покрутити.</p>
  <div class="gapbar">
    <div>🟢 <b>ГЛИБОКО:</b> ${gap.deep.join(' · ') || '—'}</div>
    <div>🟡 <b>ТОНКО:</b> ${gap.thin.join(' · ') || '—'}</div>
    <div>🔴 <b>ПРОГАЛИНИ (добрати):</b> ${gap.gap.join(' · ') || '—'}</div>
  </div>
</div>
<div class="filters">
  <button class="on" data-f="all">усі</button>
  <button data-f="core">CORE</button>
  <button data-f="common">COMMON</button>
  <button data-f="custom">CUSTOM</button>
  <button data-f="gap">тільки прогалини</button>
</div>
${SECTIONS.roles.map(lane).join('')}
<section class="lane" data-tier="mech">
  <div class="lanehd"><h2>Прийоми-реви <span class="cnt">${mech.length}</span></h2>
  <span class="tier">МЕХАНІКА</span><p class="job">Переходи, прелоадери, меню, теми, абстрактні reveal — падають у будь-яку секцію, не є секцією самі.</p></div>
  <div class="grid">${mech.map(card).join('')}</div>
</section>
${unsorted.length ? `<section class="lane"><div class="lanehd"><h2>Нерозсортовані <span class="cnt thin">${unsorted.length}</span></h2></div><div class="grid">${unsorted.map(card).join('')}</div></section>` : ''}
<div class="foot">Згенеровано scripts/library-gallery.mjs зі SECTIONS.yaml + RECIPE-фронтматерів. Не редагувати вручну. Сервер: <code>cd library && python3 -m http.server 8820</code> → відкрий <code>http://localhost:8820/GALLERY.html</code> (так і прийоми <code>components/…</code>, і варіанти секцій <code>combos/…</code> завантажуються в картки).</div>
<script>
  var btns=[].slice.call(document.querySelectorAll('.filters button'));
  btns.forEach(function(b){b.addEventListener('click',function(){btns.forEach(function(x){x.classList.toggle('on',x===b)});var f=b.dataset.f;
    document.querySelectorAll('.lane').forEach(function(l){var t=l.dataset.tier;var n=+(l.querySelector('.cnt')||{}).textContent?.replace(/\\D/g,'')||0;
      var show = f==='all' ? true : f==='gap' ? (l.querySelector('.empty')!=null) : (t===f);
      l.style.display=show?'':'none';});});});
</script>
</body></html>`;

writeFileSync(join(LIB, 'GALLERY.html'), html);
console.log(`[library-gallery] wrote GALLERY.html — ${variantTotal} section-variant(s) + ${total} bricks across ${SECTIONS.roles.length} lanes + ${mech.length} mechanics${unsorted.length ? ' + ' + unsorted.length + ' UNSORTED' : ''}`);
if (variantTotal) console.log(`[library-gallery] variants by lane: ${Object.entries(variantsByLane).map(([k, a]) => `${k}(${a.length})`).join(', ')}`);
if (unresolved.size) console.log(`[library-gallery] WARNING unresolved beats (add to SECTIONS.yaml aliases): ${[...unresolved].sort().join(', ')}`);
console.log(`[library-gallery] GAP lanes (0 bricks): ${SECTIONS.roles.filter(r => !(byLane[r.id] || []).length).map(r => r.id).join(', ') || 'none'}`);
