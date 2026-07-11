/* ============================================================
   SPRINGS-VISUAL-DIFF (S5) — оркестратор піксельної звірки
   ------------------------------------------------------------
   Читає visual/live/shots-manifest.json і на кожну позу ганяє
   scripts/visual-parity.mjs (canvas-diff AIR-гейта):
     ours = http://localhost:8873/?s=N (або ?intro=I)
     baseline = visual/live/<file>
   Пороги — extraction/<site>/VISUAL-GATE.md (≤2% @ erode 5).
   Вихід: extraction/<site>/visual/visual-parity-report.json (пише
   visual-parity), + VISUAL.md зведення + exit 0/1.

   Запуск: PLAYWRIGHT_FROM=... node scripts/springs-visual-diff.mjs springs-home
     [--origin http://localhost:8873] [--only desktop|mobile] [--limit N]
   ============================================================ */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execFileSync } from 'child_process';
import { SITES, VIEWPORTS } from './token-extractor.mjs';

const siteName = process.argv[2];
const site = SITES[siteName];
if (!site) { console.error(`вкажи: node scripts/springs-visual-diff.mjs <${Object.keys(SITES).join('|')}>`); process.exit(1); }
const argOf = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const origin = argOf('--origin', 'http://localhost:8873');
const only = argOf('--only', null);
const limit = parseInt(argOf('--limit', '0'), 10);

const visualDir = join(site.outDir, 'visual');
const manifest = JSON.parse(readFileSync(join(visualDir, 'live', 'shots-manifest.json'), 'utf8'));
const GATE_PCT = 2;
const ERODE = 5;

let poses = manifest.poses.filter((p) => !only || p.vp === only);
if (limit > 0) poses = poses.slice(0, limit);

const rows = [];
for (const p of poses) {
  const vp = VIEWPORTS[p.vp];
  const url = p.kind === 'intro' ? `${origin}/?intro=${p.value}` : `${origin}/?s=${p.value}`;
  const label = `${p.vp}-${p.kind}${p.value}`;
  const baseline = join(visualDir, 'live', p.file);
  if (!existsSync(baseline)) { console.log(`  ${label}: НЕМАЄ baseline ${p.file}`); continue; }
  let out = '';
  let code = 0;
  try {
    out = execFileSync('node', ['scripts/visual-parity.mjs',
      '--ours', url, '--baseline', baseline, '--label', label,
      '--viewport', `${vp.width}x${vp.height}`,
      '--threshold', String(GATE_PCT), '--erode', String(ERODE),
      '--out', visualDir,
    ], { encoding: 'utf8', timeout: 180000, env: process.env });
  } catch (e) {
    code = e.status ?? 1;
    out = (e.stdout || '') + (e.stderr || '');
  }
  const m = out.match(/diff\s*=?\s*([\d.]+)\s*%/i) || out.match(/([\d.]+)%/);
  const pct = m ? parseFloat(m[1]) : NaN;
  rows.push({ ...p, label, pct, pass: code === 0 });
  console.log(`  ${label}: diff=${Number.isFinite(pct) ? pct + '%' : '?'} → ${code === 0 ? 'PASS' : 'FAIL'}`);
}

const passed = rows.filter((r) => r.pass).length;
let md = `# VISUAL.md — піксельна звірка (VISUAL-GATE ≤${GATE_PCT}% @ erode ${ERODE})\n\n`;
md += `Прогін: ${new Date().toISOString()} · origin ${origin}\n\n`;
md += `| поза | diff% | вердикт |\n|---|---|---|\n`;
for (const r of rows) md += `| ${r.label} | ${Number.isFinite(r.pct) ? r.pct : '?'} | ${r.pass ? '✅ PASS' : '❌ FAIL'} |\n`;
md += `\n**РАЗОМ: ${passed}/${rows.length} PASS** · борд: visual/parity/parity-board.html\n`;
writeFileSync(join(site.outDir, 'VISUAL.md'), md);
console.log(`\nРАЗОМ ${passed}/${rows.length} PASS → ${join(site.outDir, 'VISUAL.md')}`);
process.exit(passed === rows.length ? 0 : 1);
