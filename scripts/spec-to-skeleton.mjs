/* ============================================================
   SPEC-TO-SKELETON (трек springs, S2c) — генератор статичного каркаса
   ------------------------------------------------------------
   Вхід: extraction/<site>/build-spec.json (ЄДИНЕ джерело — закон №2:
   жодного числа руками). Вихід: library/combos/<site>/index.html +
   skeleton.css — статичний каркас БЕЗ JS (no-WebGL): кожен вузол спеки
   → елемент з оригінальними класами + генерований клас, кожен
   computed-стиль спеки → CSS-правило цього класа.

   Вʼюпорт-варіанти: desktop-дерево і mobile-дерево секції емітяться
   ОБИДВА (як на живому: is-hidden--md-down / is-hidden--lg-up) і
   перемикаються media query 1024px (спека знята на 1440/390).

   Модалки (callback/favorites): загорнуті в .js-modal > .modal
   (display:none) — та сама структура, що на живому, тож
   MODAL_OPEN_CSS гейта відкриває їх ідентично.

   @font-face: копіюються ВЕРБАТИМ з дзеркального global.css
   (офіційний файл, шляхи /assets/fonts/ — сервить гейт).

   Гейт: scripts/skeleton-verify.mjs — той самий SNAPSHOT_FN +
   spec-compare-lib проти build-spec, ≥95% НА КОЖНІЙ секції.

   Запуск: node scripts/spec-to-skeleton.mjs springs-home
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { SITES, REPO } from './token-extractor.mjs';

const siteName = process.argv[2];
const site = SITES[siteName];
if (!site) { console.error(`вкажи сайт: node scripts/spec-to-skeleton.mjs <${Object.keys(SITES).join('|')}>`); process.exit(1); }

const spec = JSON.parse(readFileSync(join(site.outDir, 'build-spec.json'), 'utf8'));
const outDir = join(REPO, 'library/combos', siteName);

/* порядок потоку сторінки (гейт порядку не вимагає — це для людини) */
const ORDER = ['header', 'hero-gallery', 'intro', 'wellness', 'wellness-slider', 'nature', 'place-bg',
  'place', 'place-video', 'map', 'design-1', 'design-2', 'design-3', 'design-4',
  'residences', 'residences-slider', 'interiors', 'interiors-slider', 'footer'];
const MODALS = ['callback', 'favorites'];

const VOID_TAGS = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'source', 'wbr', 'area', 'base', 'col', 'embed', 'track']);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => esc(s).replace(/"/g, '&quot;');

let cssRules = [];
let uid = 0;

/* вузол спеки → HTML + CSS-правило його generated-класа */
function renderNode(node, vpTag, indent) {
  const g = `g${vpTag}-${uid++}`;
  const cls = [node.cls, g].filter(Boolean).join(' ');
  const decls = [];
  for (const [k, v] of Object.entries(node.styles || {})) {
    const prop = k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
    decls.push(`${prop}:${v}`);
  }
  cssRules.push(`.${g}{${decls.join(';')}}`);
  const pad = ' '.repeat(indent);
  let attrs = ` class="${escAttr(cls)}"`;
  if (node.tag === 'img') {
    const src = node.img?.srcPath || '';
    attrs += ` src="${escAttr(src)}" alt=""`;
  }
  if (VOID_TAGS.has(node.tag)) return `${pad}<${node.tag}${attrs}>\n`;
  let inner = '';
  if (node.text) inner += esc(node.text);
  if (node.children?.length) {
    inner += '\n' + node.children.map((c) => renderNode(c, vpTag, indent + 1)).join('') + pad;
  }
  return `${pad}<${node.tag}${attrs}>${inner}</${node.tag}>\n`;
}

/* секція: обидва вʼюпорт-варіанти (той, якого нема в спеці вʼюпорта, — пропущено) */
function renderSection(id) {
  let html = `<!-- ===== ${id} ===== -->\n`;
  for (const [vp, vpTag] of [['desktop', 'd'], ['mobile', 'm']]) {
    const snap = spec.viewports[vp]?.sections?.[id];
    if (!snap || snap.error) continue;
    html += `<div class="sk-vp sk-vp-${vp}" data-sk-section="${id}" data-sk-vp="${vp}">\n`;
    html += renderNode(snap.tree, vpTag, 1);
    html += `</div>\n`;
  }
  return html;
}

/* ---- збірка ---- */
const fontsCss = (readFileSync(join(site.archiveDir, site.archive.css[0].file), 'utf8')
  .match(/@font-face\s*\{[^}]*\}/g) || []).join('\n');
console.log(`@font-face: ${(fontsCss.match(/@font-face/g) || []).length} правил з ${site.archive.css[0].file}`);

let body = '';
const known = new Set([...ORDER, ...MODALS]);
const allIds = site.sections.map((s) => s.id);
for (const id of [...ORDER, ...allIds.filter((x) => !known.has(x))]) body += renderSection(id);
/* модалки: та сама обгортка, що на живому — відкриває MODAL_OPEN_CSS гейта */
for (const id of MODALS) {
  body += `<div class="js-modal sk-modal">\n<div class="modal">\n${renderSection(id)}</div>\n</div>\n`;
}

const baseCss = `
${fontsCss}
html,body{margin:0;padding:0;}
.sk-modal{height:0;overflow:hidden;}
.sk-modal .modal{display:none;}
@media (max-width:1023px){.sk-vp-desktop{display:none!important;}}
@media (min-width:1024px){.sk-vp-mobile{display:none!important;}}
`;

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'skeleton.css'), baseCss + cssRules.join('\n'));
writeFileSync(join(outDir, 'index.html'), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>springs — статичний каркас ПО СПЕЦІ (S2c, генерат)</title>
<link rel="stylesheet" href="/skeleton.css">
<link rel="stylesheet" href="/scene.css">
<script defer src="/springs-engine.js"></script>
</head>
<body>
${body}</body>
</html>
`);
const kb = (f) => (readFileSync(join(outDir, f)).length / 1024).toFixed(0);
console.log(`OK → ${outDir}/index.html (${kb('index.html')} KB) + skeleton.css (${kb('skeleton.css')} KB) · вузлів ${uid}`);
