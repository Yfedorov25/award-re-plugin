// reference-guard.mjs — гейт правової межі скачаних оригіналів (S56, вердикт PIPELINE-10X).
//
// ПРАВИЛО: скачаний оригінал (Vimeo springs тощо) = чужий контент. Він живе ЛИШЕ в
// atoms/<id>/reference/ як еталон для ока і вимірників. У білд атома, на борди і в
// будь-який деплой він не потрапляє НІКОЛИ, ні файлом, ні лінком на player.vimeo.com.
//
// Що перевіряє:
//   1. variants/*.html усіх атомів (окрім compare*.html — компаратор і Є суддівський
//      інструмент, йому reference дозволений) не згадують: *-orig* файли, player.vimeo.com,
//      шляхи в reference/ на відео (.mp4/.mov/.webm);
//   2. жоден файл із патерном *-orig*.mp4 не лежить ПОЗА reference/ теками;
//   3. --dir <тека> (наприклад тека деплою перед vercel): та сама перевірка на вміст
//      і на самі файли. Гейт для ручного прогону ПЕРЕД кожним деплоєм.
//
// Запуск: node scripts/reference-guard.mjs [--dir <тека-деплою>]
// Вихід: 0 = чисто, 1 = порушення (список у stdout).

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ATOMS = join(ROOT, 'library/techniques/atoms');
const dirArgI = process.argv.indexOf('--dir');
const extraDir = dirArgI > -1 ? process.argv[dirArgI + 1] : null;

const violations = [];

const walk = (dir, cb) => {
  let entries = [];
  try { entries = readdirSync(dir); } catch { return; }
  for (const e of entries) {
    if (e === 'node_modules' || e === '.git') continue;
    const p = join(dir, e);
    let st; try { st = statSync(p); } catch { continue; }
    if (st.isDirectory()) walk(p, cb); else cb(p, st);
  }
};

const BAD_CONTENT = [
  [/[\w-]*-orig[\w-]*\.(mp4|mov|webm)/i, 'посилання на скачаний оригінал (*-orig*)'],
  [/player\.vimeo\.com/i, 'embed живого Vimeo springs'],
  [/reference\/[^"'\s)]+\.(mp4|mov|webm)/i, 'лінк на відео з reference/'],
];

const checkContent = (file, label) => {
  if (!/\.(html|css|js|mjs|json|md)$/i.test(file)) return;
  if (/compare[^/]*\.html$/i.test(file)) return; // компаратор = суддівський інструмент
  let txt; try { txt = readFileSync(file, 'utf8'); } catch { return; }
  for (const [re, why] of BAD_CONTENT) {
    const m = txt.match(re);
    if (m) violations.push(`${label}: ${file}\n    → ${why}: "${m[0]}"`);
  }
};

// 1. білди атомів (variants/)
walk(ATOMS, (p) => {
  if (p.includes('/variants/')) checkContent(p, 'БІЛД');
  // 2. оригінали поза reference/
  if (/-orig[\w-]*\.(mp4|mov|webm)$/i.test(basename(p)) && !dirname(p).endsWith('/reference')) {
    violations.push(`ФАЙЛ ПОЗА reference/: ${p}`);
  }
});

// 3. тека деплою (борди, індекси)
if (extraDir) {
  walk(extraDir, (p) => {
    checkContent(p, 'ДЕПЛОЙ');
    if (/-orig[\w-]*\.(mp4|mov|webm)$/i.test(basename(p))) violations.push(`ОРИГІНАЛ У ДЕПЛОЇ: ${p}`);
    if (/-live\.(mp4|mov)$/i.test(basename(p))) violations.push(`LIVE-ЗАПИС У ДЕПЛОЇ: ${p}`);
  });
}

if (violations.length) {
  console.log(`reference-guard: ЧЕРВОНИЙ, порушень ${violations.length}\n`);
  for (const v of violations) console.log('  ✗ ' + v);
  process.exit(1);
}
console.log(`reference-guard: PASS (білди атомів чисті${extraDir ? ', деплой чистий' : ''})`);
