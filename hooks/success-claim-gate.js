#!/usr/bin/env node
/*
  success-claim-gate (G18 SuccessClaimGate) — Stop hook.

  Мета: зробити ФІЗИЧНО неможливим написати «готово / 1-в-1 / закрито / parity /
  збіглось» про ВІЗУАЛЬНУ секцію без прикріпленого СВІЖОГО доказу піксельної звірки.
  Прямий аналог LifeOS SuccessClaimGate: «Block ungrounded success claims without
  evidence in the response itself».

  Механізм (Claude Code Stop hook):
    stdin JSON має поле last_assistant_message (повний текст останньої відповіді).
    Fallback: transcript_path -> JSONL, беремо останнє assistant-повідомлення.
    Блокування: stdout {"decision":"block","reason": "..."} + exit 0.
    Дозвіл: exit 0 без block.

  Fail-OPEN всюди: будь-яка помилка / неможливість прочитати => дозволити (exit 0).
  Хук НЕ має ламати роботу агента.
*/
'use strict';
const fs = require('fs');
const path = require('path');

// ── Константи ─────────────────────────────────────────────────────────────
const FRESH_WINDOW_MS = 30 * 60 * 1000; // «свіжий» доказ = < 30 хв
const PARITY_REPORT_PATH = path.join(
  process.env.HOME || '/Users/yehorfedorov',
  'Downloads', 'award-re-plugin', 'scripts', 'visual-parity-report.json'
);

// ── Читання останньої відповіді асистента ─────────────────────────────────
function lastAssistantText(input) {
  // 1) прямо з поля (канонічний шлях Claude Code Stop hook)
  if (typeof input.last_assistant_message === 'string' && input.last_assistant_message.trim()) {
    return input.last_assistant_message;
  }
  // 2) fallback: transcript_path (JSONL, одне повідомлення на рядок)
  const tp = input.transcript_path || input.transcriptPath;
  if (tp && fs.existsSync(tp)) {
    try {
      const lines = fs.readFileSync(tp, 'utf8').split('\n').filter((l) => l.trim());
      for (let i = lines.length - 1; i >= 0; i--) {
        let obj;
        try { obj = JSON.parse(lines[i]); } catch (_) { continue; }
        const role = obj.role || (obj.message && obj.message.role);
        if (role !== 'assistant') continue;
        const content = obj.content || (obj.message && obj.message.content);
        if (typeof content === 'string') return content;
        if (Array.isArray(content)) {
          const txt = content
            .map((c) => (typeof c === 'string' ? c : (c && c.text) || ''))
            .join(' ')
            .trim();
          if (txt) return txt;
        }
      }
    } catch (_) { /* fail-open */ }
  }
  return '';
}

// ── Детектор claim: «готово» ТІЛЬКИ в контексті візуальної роботи ──────────
function hasVisualSuccessClaim(text) {
  const t = text.toLowerCase();

  // Слова-заяви про завершеність/збіг (укр + англ).
  // «1-в-1 / 1 в 1» покриваємо окремим regex через дефіси/пробіли.
  const CLAIM = /(готов[оаий]|1\s*[-–]?\s*в\s*[-–]?\s*1|закрит[оаий]|parity|збігл[оа]сь|збіглися|збіг\b|\bdone\b|\bclosed\b|matches the live|pixel[-\s]?perfect|піксель[ -]?в[ -]?піксель)/i;
  if (!CLAIM.test(t)) return false;

  // Контекст ВІЗУАЛЬНОЇ роботи — інакше нейтральні «сервер готовий» не блокуємо.
  const VISUAL = /(hero|меню|\bmenu\b|funnel|секці|сторінк|скрін|screenshot|screen[-\s]?shot|\bpixel\b|піксель|parity|baseline|візуал|verstat|верстк|layout|макет|\bdiff\b)/i;
  if (!VISUAL.test(t)) return false;

  // ── Захист від FALSE-POSITIVE (сесія 11: хук блокував чесні звіти) ─────────
  // (1) Якщо це ЦИТАТА самого блок-меседжу хука (агент переказує чому заблоковано)
  //     — не блокувати рекурсивно.
  if (/successclaimgate|g18|без свіжого доказу піксельної звірки|заяви про «1-в-1» блокуються/i.test(t)) return false;

  // (2) Якщо claim-слово стоїть у ЗАПЕРЕЧЕННІ / поряд зі словами провалу/розбіжності
  //     — це чесний звіт «НЕ збіглось / fail / діри», а не заява про готовність.
  //     Блокуємо лише СТВЕРДЖУВАЛЬНИЙ claim.
  const NEGATION = /(\bне\b|нема|немає|\bnot\b|\bno\b|fail|провал|розбіжн|відмінност|передчасн|9\.77|діри|бреш|невалідн|розсинхрон|поки не|ще не|НЕ 1|не 1[-\s]?в[-\s]?1|не готов)/i;
  if (NEGATION.test(t)) return false;

  return true;
}

// ── Свіжий доказ у самій відповіді (посилання на артефакт звірки) ──────────
function responseCitesParityArtifact(text) {
  const t = text.toLowerCase();
  // S55, за прямим дозволом Єгора в чаті. Для АТОМА чесний доказ це його self-check-report.json
  // або probe.json, а не піксельний борд СЕКЦІЇ: такого борда на атомній роботі не буває.
  // Старий список вимагав звітів, яких не існує, і тому вчив ослаблювати формулювання.
  const PROOF = /(parity-board\.html|-diff-|-ours-|baselines\/|visual-parity-report\.json|parity[-_/]board|self-check-report\.json|self-check\.mjs|atom-probe|probe\.json)/i;
  return PROOF.test(t);
}

// ── Свіжий доказ на диску: visual-parity-report.json ───────────────────────
function freshParityReportPasses() {
  try {
    if (!fs.existsSync(PARITY_REPORT_PATH)) return false;
    const stat = fs.statSync(PARITY_REPORT_PATH);
    const now = Date.now();
    if (now - stat.mtimeMs > FRESH_WINDOW_MS) return false; // файл застарілий

    const raw = fs.readFileSync(PARITY_REPORT_PATH, 'utf8');
    let data;
    try { data = JSON.parse(raw); } catch (_) { return false; }

    // Зібрати всі прогони незалежно від точної форми звіту.
    let runs = [];
    if (Array.isArray(data)) runs = data;
    else if (Array.isArray(data.runs)) runs = data.runs;
    else if (Array.isArray(data.results)) runs = data.results;
    else runs = [data]; // одиничний прогін як обʼєкт

    const cutoff = now - FRESH_WINDOW_MS;
    for (const r of runs) {
      if (!r || typeof r !== 'object') continue;
      const verdict = String(r.verdict || r.status || r.result || '').toLowerCase();
      if (verdict !== 'pass') continue;
      // час прогону: ts / timestamp / time / at (ms, s, або ISO). Якщо нема — беремо mtime файлу.
      const tsRaw = r.ts || r.timestamp || r.time || r.at || r.date;
      let tsMs = null;
      if (typeof tsRaw === 'number') tsMs = tsRaw < 1e12 ? tsRaw * 1000 : tsRaw;
      else if (typeof tsRaw === 'string') { const p = Date.parse(tsRaw); if (!Number.isNaN(p)) tsMs = p; }
      if (tsMs === null) tsMs = stat.mtimeMs; // немає власного часу — довіряємо свіжості файлу
      if (tsMs >= cutoff) return true;
    }
    return false;
  } catch (_) {
    return false; // fail-open на боці «нема доказу», але не кидаємо помилку
  }
}

// ── Main ───────────────────────────────────────────────────────────────────
try {
  let raw = '';
  try { raw = fs.readFileSync(0, 'utf8'); } catch (_) { process.exit(0); }
  if (!raw.trim()) process.exit(0);

  let input;
  try { input = JSON.parse(raw); } catch (_) { process.exit(0); }

  const text = lastAssistantText(input);
  if (!text) process.exit(0); // не змогли прочитати відповідь -> пропускаємо

  if (!hasVisualSuccessClaim(text)) process.exit(0); // нема заяви про візуальну готовність

  // Заява Є. Чи є свіжий доказ?
  if (responseCitesParityArtifact(text) || freshParityReportPasses()) process.exit(0);

  // Заява Є, доказу НЕМА -> блокуємо з actionable-причиною.
  const reason =
    'G18 SuccessClaimGate: у відповіді заявлено «готово / 1-в-1 / parity / збіглось» про ' +
    'ВІЗУАЛЬНУ секцію, але немає СВІЖОГО доказу піксельної звірки (< 30 хв).\n\n' +
    'Зроби одне з двох:\n' +
    '  1) Прожени звірку і додай звіт/борд:\n' +
    '     node scripts/visual-parity.mjs --ours <url> --baseline <baseline> --label <name>\n' +
    '     (має записати scripts/visual-parity-report.json з verdict:"pass" за останні 30 хв,\n' +
    '      або пошли в відповіді шлях на parity-board.html / -diff- / -ours- / baselines/),\n' +
    '  2) АБО прибери заяву про готовність/збіг — опиши стан чесно (що зроблено, що НЕ звірено).\n\n' +
    'Без свіжого доказу піксельної звірки заяви про «1-в-1» блокуються.';

  process.stdout.write(JSON.stringify({ decision: 'block', reason }));
  process.exit(0);
} catch (_) {
  process.exit(0); // fail-open: будь-яка помилка -> дозволити
}
