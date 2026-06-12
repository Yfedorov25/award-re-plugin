#!/usr/bin/env node
/*
  deploy-gate — закон A8/A10: деплой заборонений без СВІЖОГО verify-report.json
  (scripts/verify.mjs, DOM-факти). Свіжий = не старіший за 45 хвилин і не
  старіший за останній build-артефакт. Діє лише в проєктах з .award-re/.
*/
const fs = require("fs");
const path = require("path");
let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  let data = {};
  try { data = JSON.parse(input); } catch { process.exit(0); }
  if (data.tool_name !== "Bash") process.exit(0);
  const cmd = (data.tool_input && data.tool_input.command) || "";
  if (!/vercel\s+(--prod|deploy.*--prod)/.test(cmd)) process.exit(0);

  const cwd = data.cwd || process.cwd();
  let dir = cwd, root = null;
  // деплой-команди звичайно містять cd у проєкт — спробуємо витягти шлях
  const m = cmd.match(/cd\s+([^\s&;]+)/);
  const cand = m ? m[1].replace(/^["']|["']$/g, "") : cwd;
  for (const start of [cand, cwd]) {
    dir = start;
    for (let i = 0; i < 6 && dir && dir !== "/"; i++) {
      if (fs.existsSync(path.join(dir, ".award-re"))) { root = dir; break; }
      dir = path.dirname(dir);
    }
    if (root) break;
  }
  if (!root) process.exit(0);

  const rep = path.join(root, ".award-re", "state", "verify-report.json");
  if (!fs.existsSync(rep)) {
    console.error("ЗАКОН A8/A10: деплой без verify-report. Прожени scripts/verify.mjs (DOM-факти: рендер маршрутів, консоль, overflow, обидва шляхи даних) — звіт у .award-re/state/verify-report.json — і тоді деплой відкриється.");
    process.exit(2);
  }
  const age = (Date.now() - fs.statSync(rep).mtimeMs) / 60000;
  if (age > 45) {
    console.error(`ЗАКОН A8/A10: verify-report застарів (${Math.round(age)} хв). Перебілдь і прожени verify ще раз перед деплоєм.`);
    process.exit(2);
  }
  // якщо є дист — звіт мусить бути молодший за нього
  for (const d of ["dist", ".next", "build"]) {
    const dp = path.join(root, d);
    if (fs.existsSync(dp) && fs.statSync(dp).mtimeMs > fs.statSync(rep).mtimeMs) {
      console.error("ЗАКОН A8/A10: білд новіший за verify-report — верифікуй саме той артефакт, що деплоїш.");
      process.exit(2);
    }
  }
  process.exit(0);
});
