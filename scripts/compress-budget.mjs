#!/usr/bin/env node
// award-re — медіа-бюджет (закони D14/G: вага ассетів = перф-закон, не смак)
// Використання: node compress-budget.mjs <dir=public> [--json]
// Перевіряє КОЖЕН медіа-файл проти бюджету; FAIL → exit 1 (можна вішати в CI/гейт).
import { readdirSync, statSync } from "node:fs";
import { join, extname, relative } from "node:path";

const ROOT = process.argv[2] || "public";
const JSON_OUT = process.argv.includes("--json");

// Бюджети (KB) — з perf-доктрини: hero-постер ≤ 250, звичайний кадр ≤ 450,
// 4K-мастер на проді — заборонений (мастери живуть у _masters/, поза public).
const BUDGET_KB = {
  ".webp": 450, ".avif": 450, ".jpg": 450, ".jpeg": 450, ".png": 300,
  ".svg": 120, ".mp4": 6000, ".webm": 6000, ".gif": 0, // gif = завжди FAIL → перекодуй у mp4/webp
};
const TOTAL_BUDGET_MB = 14; // сумарна вага всіх медіа на сайт

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".") || name === "_masters" || name === "node_modules") continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (extname(name).toLowerCase() in BUDGET_KB)
      files.push({ path: relative(process.cwd(), p), kb: Math.round(st.size / 1024), ext: extname(name).toLowerCase() });
  }
})(ROOT);

const over = files.filter(f => f.kb > BUDGET_KB[f.ext]);
const totalMb = +(files.reduce((s, f) => s + f.kb, 0) / 1024).toFixed(1);
const result = {
  dir: ROOT, files: files.length, totalMb, totalBudgetMb: TOTAL_BUDGET_MB,
  pass: over.length === 0 && totalMb <= TOTAL_BUDGET_MB,
  over: over.sort((a, b) => b.kb - a.kb).map(f => ({ ...f, budgetKb: BUDGET_KB[f.ext] })),
};

if (JSON_OUT) console.log(JSON.stringify(result, null, 2));
else {
  console.log(`медіа: ${result.files} файлів · ${totalMb}MB / бюджет ${TOTAL_BUDGET_MB}MB`);
  for (const f of result.over)
    console.log(`  OVER  ${f.path}  ${f.kb}KB > ${f.budgetKb}KB  → пережми (sharp/ffmpeg) або перенеси в _masters/`);
  console.log(result.pass ? "PASS" : `FAIL: ${result.over.length} файл(ів) понад бюджет${totalMb > TOTAL_BUDGET_MB ? " + сумарна вага понад ліміт" : ""}`);
}
process.exit(result.pass ? 0 : 1);
