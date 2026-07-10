#!/usr/bin/env node
/*
  progress-report-gate (G21 ProgressReportGate) — Stop hook.

  ЗАКОН Єгора (сесія 17, memory progress-report-rule):
  1. Після кожного ШМАТКА РОБОТИ відповідь МУСИТЬ містити прогрес-дашборд
     (видимий % прогресу) і контекст-метр (% використаного контексту).
  2. Коли контекст ≥ 85% — відповідь МУСИТЬ містити хендоф-блок для нової
     сесії прямо в чаті (+ STATE оновлюється — це перевіряється м'якше,
     нагадуванням у reason).

  Механізм: як G18 (success-claim-gate). stdin JSON: last_assistant_message
  або transcript_path. Контекст оцінюється РОЗМІРОМ transcript JSONL
  (~4 байти/токен, вікно 1M токенів → поріг 85% ≈ 3.4e9*0.85 байт... насправді
  transcript містить і base64-зображення — оцінка ГРУБА, тому поріг щедрий).
  Блокування: {"decision":"block","reason":...}. Fail-OPEN на будь-якій помилці.
*/
'use strict';
const fs = require('fs');

// ── налаштування ──────────────────────────────────────────────────────────
const CTX_WINDOW_TOKENS = 1_000_000;      // Opus 1M
const BYTES_PER_TOKEN = 4;                // груба оцінка
const HANDOFF_THRESHOLD = 0.85;           // 85% → вимагати хендоф
// маркери «була робота» (щоб не чіпати короткі розмовні відповіді)
const WORK_RE = /закоміч|коміт|commit|GREEN|прийнято|застосовано|переробле|збудовано|виправлено|зафікшено|배?PASS|запущено у фоні|агент(-| )?(звіту|заверш)/i;
// маркери що дашборд/метр присутні
const DASH_RE = /▓|ПРОГРЕС-ДАШБОРД|прогрес-дашборд/;
const METER_RE = /КОНТЕКСТ-МЕТР|[Кк]онтекст[:\s].{0,12}%|контекст.{0,20}(використано|заповнено)/;
// маркер хендоф-блоку
const HANDOFF_RE = /ХЕНДОФ|ЯК ПОЧАТИ НАСТУПН|наступн(а|ій) сесі(я|ї).{0,80}(перш|почат|крок)/is;

function lastAssistantText(input) {
  if (typeof input.last_assistant_message === 'string' && input.last_assistant_message.trim()) {
    return input.last_assistant_message;
  }
  const tp = input.transcript_path || input.transcriptPath;
  if (tp && fs.existsSync(tp)) {
    try {
      const lines = fs.readFileSync(tp, 'utf8').split('\n').filter((l) => l.trim());
      for (let i = lines.length - 1; i >= 0; i--) {
        let obj; try { obj = JSON.parse(lines[i]); } catch (_) { continue; }
        const role = obj.role || (obj.message && obj.message.role);
        if (role !== 'assistant') continue;
        const content = obj.content || (obj.message && obj.message.content);
        if (typeof content === 'string') return content;
        if (Array.isArray(content)) {
          const txt = content.map((c) => (typeof c === 'string' ? c : (c && c.text) || '')).join(' ').trim();
          if (txt) return txt;
        }
      }
    } catch (_) {}
  }
  return '';
}

function contextPct(input) {
  try {
    const tp = input.transcript_path || input.transcriptPath;
    if (!tp || !fs.existsSync(tp)) return null;
    // base64-зображення роздувають transcript (перший прогін дав «723%») —
    // рахуємо лише НЕ-base64 текст: довгі A-Za-z0-9+/= послідовності викидаємо.
    const raw = fs.readFileSync(tp, 'utf8');
    const textOnly = raw.replace(/[A-Za-z0-9+\/=]{500,}/g, '');
    const pct = textOnly.length / BYTES_PER_TOKEN / CTX_WINDOW_TOKENS;
    return Math.min(pct, 0.99); // clamp — оцінка, не факт
  } catch (_) { return null; }
}

function block(reason) {
  process.stdout.write(JSON.stringify({ decision: 'block', reason }));
  process.exit(0);
}

let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch (_) { process.exit(0); }
// анти-луп: якщо це вже повторний прохід після нашого block — пропустити
if (input.stop_hook_active) process.exit(0);
const text = lastAssistantText(input);
if (!text) process.exit(0);

const pct = contextPct(input);

// 1) хендоф на високому контексті: вимагаємо хендоф-блок у ЧАТІ
if (pct !== null && pct >= HANDOFF_THRESHOLD && !HANDOFF_RE.test(text)) {
  block(
    'G21 ProgressReportGate: контекст ≈ ' + Math.round(pct * 100) + '% (поріг 85%). ' +
    'ЗАКОН Єгора: додай у відповідь ХЕНДОФ-блок для нової сесії прямо в чат ' +
    '(заголовок «ХЕНДОФ ДЛЯ НОВОЇ СЕСІЇ»: що зроблено · перший крок нової сесії · ключові URL/команди) ' +
    '+ фінальний прогрес-дашборд, і переконайся що STATE.md § ЯК ПОЧАТИ оновлений.'
  );
}

// 2) після роботи: дашборд + метр обов'язкові
if (WORK_RE.test(text) && text.length > 400) {
  const missing = [];
  if (!DASH_RE.test(text)) missing.push('прогрес-дашборд (бари ▓░ з % по осях Б-1/Б-2 + «за сесію»)');
  if (!METER_RE.test(text)) missing.push('контекст-метр («Контекст: ~X% використано»)');
  if (missing.length) {
    block(
      'G21 ProgressReportGate: у відповіді є завершена робота, але бракує: ' + missing.join(' та ') + '. ' +
      'ЗАКОН Єгора (memory progress-report-rule): кожен підсумок роботи = видимий прогрес у % + контекст-метр.' +
      (pct !== null ? ' Довідково: контекст ≈ ' + Math.round(pct * 100) + '%.' : '')
    );
  }
}

process.exit(0);
