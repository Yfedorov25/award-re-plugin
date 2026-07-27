#!/usr/bin/env node
/*
  claims-diff.mjs — машинний diff CLAIMS-таблиць автора (CHOREO.md) і верифікатора
  (план ради S47, крок 4). Валідний ЛИШЕ diff незалежних ЧИСЕЛ — не рецензія тексту.

  Парсить ```claims-блок (формат atoms/_scaffold/CLAIMS-template.md):
    mechanic-class: <клас>
    | зона | вікно | вердикт | src |
  Порівнює: клас механіки; множину (зона, вікно→нормалізовано, вердикт-токени).
  БУДЬ-ЯКИЙ diff = борд-блокер Єгору (не «узгодити між собою»).

  node scripts/claims-diff.mjs --atom <id> --author <шлях CHOREO.md> --verifier <шлях таблиці>
    [--author-session <id> --verifier-session <id>]
  → atoms/<id>/TZ-VERDICT.json ; exit 0 = 0 diffs, 1 = є diffs (борд), 2 = формат невалідний
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const argVal = (f, d) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };

const atomId = argVal('--atom');
const authorPath = argVal('--author');
const verifierPath = argVal('--verifier');
if (!atomId || !authorPath || !verifierPath) { console.error('вкажи --atom --author --verifier'); process.exit(2); }

const VOCAB = ['STANDS', 'TRAVELS', 'SWAPS-CONTENT', 'COVERED-BY', 'COVERS', 'ENTERS', 'EXITS', 'FADES', 'MEDIA', 'OTHER', 'UNMEASURABLE'];

function parseClaims(p){
  const raw = fs.readFileSync(p, 'utf8');
  const m = raw.match(/```claims\n([\s\S]*?)```/);
  if (!m) return { error: `${p}: нема \`\`\`claims-блоку` };
  const body = m[1];
  const cls = (body.match(/mechanic-class:\s*(\S+)/) || [])[1];
  if (!cls) return { error: `${p}: нема mechanic-class` };
  const rows = [];
  for (const line of body.split('\n')) {
    const cells = line.split('|').map(s => s.trim()).filter((_, i, a) => i > 0 && i < a.length);
    if (cells.length < 4 || /^[-\s:]*$/.test(cells[0]) || cells[0] === 'зона') continue;
    const verdicts = VOCAB.filter(v => cells[2].toUpperCase().includes(v)).sort();
    if (!verdicts.length) return { error: `${p}: рядок «${cells[0]} | ${cells[2]}» — вердикт поза закритим словником` };
    const srcHasNumber = /\d/.test(cells[3]);
    if (!srcHasNumber) return { error: `${p}: рядок «${cells[0]}» — src без числа (CONFIRMED без власного числа = невалідний формат)` };
    rows.push({ zone: cells[0], window: cells[1].replace(/\s+/g, ''), verdicts, src: cells[3] });
  }
  if (!rows.length) return { error: `${p}: таблиця порожня` };
  return { cls, rows };
}

const A = parseClaims(authorPath), V = parseClaims(verifierPath);
if (A.error || V.error) { console.error('НЕВАЛІДНИЙ ФОРМАТ:', A.error || V.error); process.exit(2); }

const diffs = [];
if (A.cls !== V.cls) diffs.push({ kind: 'mechanic-class', author: A.cls, verifier: V.cls });

// матч рядків: зона + вікна що перекриваються (нормалізація fNN-NN); вердикти мусять збігатись
const winRange = (w) => { const m = w.match(/f?(\d+)[^\d]+f?(\d+)/); return m ? [+m[1], +m[2]] : null; };
const overlaps = (a, b) => { const ra = winRange(a), rb = winRange(b); return ra && rb ? ra[0] <= rb[1] && rb[0] <= ra[1] : a === b; };
for (const ar of A.rows) {
  const match = V.rows.filter(vr => vr.zone === ar.zone && overlaps(ar.window, vr.window));
  if (!match.length) { diffs.push({ kind: 'uncovered-by-verifier', zone: ar.zone, window: ar.window, author: ar.verdicts }); continue; }
  if (!match.some(vr => vr.verdicts.join('+') === ar.verdicts.join('+')))
    diffs.push({ kind: 'verdict', zone: ar.zone, window: ar.window, author: ar.verdicts, verifier: match.map(m => m.verdicts.join('+')) });
}
for (const vr of V.rows) {
  if (!A.rows.some(ar => ar.zone === vr.zone && overlaps(ar.window, vr.window)))
    diffs.push({ kind: 'uncovered-by-author', zone: vr.zone, window: vr.window, verifier: vr.verdicts });
}

const out = {
  tool: 'claims-diff.mjs', atomId, ts: new Date().toISOString(),
  authorFile: path.relative(REPO, path.resolve(authorPath)), verifierFile: path.relative(REPO, path.resolve(verifierPath)),
  authorSession: argVal('--author-session', null), verifierSession: argVal('--verifier-session', null),
  sameClass: A.cls === V.cls, mechanicClass: A.cls,
  diffs, pass: diffs.length === 0,
  note: 'pass=false → борд-блокер Єгору (розбіжність вирішує око, не переговори агентів)',
};
const outPath = path.join(REPO, 'library/techniques/atoms', atomId, 'TZ-VERDICT.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`claims-diff ▸ ${atomId}: клас ${A.cls}${A.cls === V.cls ? ' = ' : ' ≠ ' + V.cls}, diffs ${diffs.length}`);
for (const d of diffs) console.log('  ✗', JSON.stringify(d));
console.log(`→ ${path.relative(process.cwd(), outPath)}  ${out.pass ? 'PASS (0 diffs)' : 'БОРД-БЛОКЕР Єгору'}`);
process.exit(out.pass ? 0 : 1);
