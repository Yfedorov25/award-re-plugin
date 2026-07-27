#!/usr/bin/env node
/*
  section-gates — примус законів конституції v1 (E10, A6/A7):
  1) BAN AskUserQuestion для текстових варіантів (закон E10): копі-варіанти
     подаються ПОВНИМИ секвенціями в чаті, вибір вільною відповіддю.
  2) PROTOTYPE-GATE (закони A6/A7): запис у src/ секції заблокований, поки в
     .award-re/state/section-*.yaml поточної секції нема stage: user-choice
     (тобто прототипи показані і юзер обрав). Працює, лише якщо state-файл
     цієї секції існує — тобто гейт вмикається пайплайном /section, а ручні
     точкові фікси поза пайплайном не блокуються.
*/
const fs = require("fs");
const path = require("path");

let input = "";
process.stdin.on("data", (d) => (input += d));
process.stdin.on("end", () => {
  let data = {};
  try { data = JSON.parse(input); } catch { process.exit(0); }
  const tool = data.tool_name || "";
  const args = data.tool_input || {};

  // ---- 1) ban AskUserQuestion-копі ----
  if (tool === "AskUserQuestion") {
    const text = JSON.stringify(args).toLowerCase();
    const copySignals = ["заголовок", "хедлайн", "hero-рядок", "titlelines", "копі", "слоган", "варіант тексту", "tagline"];
    const hasSignal = copySignals.some((s) => text.includes(s));
    const optionsLen = JSON.stringify((args.questions || []).flatMap((q) => q.options || [])).length;
    if (hasSignal && optionsLen > 160) {
      console.error("ЗАКОН E10: текстові/копі-варіанти НЕ подаються через AskUserQuestion-обривки. Подай повні секвенції в чаті з назвою прийому і одним рядком «чому працює»; вибір — вільною відповіддю юзера.");
      process.exit(2);
    }
    process.exit(0);
  }

  // ---- 2) prototype-gate ----
  if (!["Write", "Edit", "MultiEdit"].includes(tool)) process.exit(0);
  const fp = args.file_path || "";
  if (!fp || fp.includes("/.award-re/") || fp.includes("/tmp/")) process.exit(0);
  // тільки UI-файли проєкту
  if (!/\.(tsx|jsx|css|html|vue|svelte)$/.test(fp) && !/sections?\//.test(fp)) process.exit(0);

  // знайти корінь проєкту з .award-re
  let dir = path.dirname(fp);
  let root = null;
  for (let i = 0; i < 8 && dir !== "/"; i++) {
    if (fs.existsSync(path.join(dir, ".award-re"))) { root = dir; break; }
    dir = path.dirname(dir);
  }
  if (!root) process.exit(0);

  const stateDir = path.join(root, ".award-re", "state");
  if (!fs.existsSync(stateDir)) process.exit(0);

  // яка секція? грубий матч імені файла з імʼям state-файла
  const base = path.basename(fp).toLowerCase().replace(/\.\w+$/, "");
  const states = fs.readdirSync(stateDir).filter((f) => f.endsWith(".yaml"));
  // design-intent per-section: якщо пишемо секцію з state-файлом — у design-intent.md
  // мусить бути блок-заголовок цієї секції (зміст, а не розмір файла)
  const diPath = path.join(root, ".award-re", "design-intent.md");
  for (const sf of states) {
    const key = sf.replace(/^section-/, "").replace(/\.yaml$/, "").toLowerCase();
    if (!key || !base.includes(key.replace(/^\d+-/, ""))) continue;
    const y = fs.readFileSync(path.join(stateDir, sf), "utf-8");
    if (fs.existsSync(diPath)) {
      const di = fs.readFileSync(diPath, "utf-8").toLowerCase();
      const k = key.replace(/^\d+-/, "");
      if (!di.includes(k)) {
        console.error(`ЗАКОН A3: у design-intent.md нема блоку секції «${k}» (Лінзи 1-5 + 4 тести) — додай ПЕРЕД кодом.`);
        process.exit(2);
      }
    }
    const passed = /user-choice:\s*\S+/.test(y) || /stage:\s*(integrate|verify-dom|rollback-point|deploy|prod-check|log|done)/.test(y);
    if (!passed) {
      console.error(`ЗАКОН A6/A7: секція «${key}» ще не пройшла прототипи+вибір юзера (state/${sf} без user-choice). Збудуй 2-4 прототипи на локальному порту, дай юзеру обрати, запиши вибір у motion-score і state — тоді інтеграція відкриється.`);
      process.exit(2);
    }
  }
  process.exit(0);
});
