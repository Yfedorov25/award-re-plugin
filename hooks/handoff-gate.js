#!/usr/bin/env node
/*
  handoff-gate (G22 HandoffGate) — Stop hook.

  ЗАКОН Єгора (memory session-handoff-rule + інцидент с22): заяви «хендоф
  записано / STATE оновлено / можна відкривати нову сесію» БЕЗ перевірки
  самого STATE.md — заборонені. G18/G21 дивляться лише на текст чату;
  цей гейт дивиться У ФАЙЛ.

  Тригер: відповідь містить хендоф-заяву (див. CLAIM_RE).
  Детерміновані перевірки шапки «## 🚀 ЯК ПОЧАТИ СЕСІЮ N» у KAI/STATE.md:
    1. Усі git-хеші (7-10 hex) із шапки існують у репо (git cat-file -e).
    2. HEAD (короткий хеш) згаданий у шапці — інакше шапка старіша за роботу.
    3. mtime STATE.md ≥ часу останнього коміту (хендоф писався ПІСЛЯ роботи).
    4. Номер сесії в першій шапці > усіх «ЯК ПОЧИНАЛАСЬ СЕСІЯ N» нижче.
  Блокування: {"decision":"block","reason":...}. Fail-OPEN на будь-якій помилці
  самого гейта (щоб не заблокувати роботу через власний баг).
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const STATE = path.join(process.env.HOME || '', 'Downloads', 'KAI', 'STATE.md');
const REPO = path.join(process.env.HOME || '', 'Downloads', 'award-re-plugin');

const CLAIM_RE = /(хендоф.{0,40}(записан|оновлен|виконан|готов)|STATE(\.md)?[^.\n]{0,60}(оновлен|записан|актуальн|несуперечлив)|можна відкривати нову сесію|кікоф[- ]повідомлення|все записано)/i;

function lastAssistantText(input) {
  if (typeof input.last_assistant_message === 'string' && input.last_assistant_message.trim()) {
    return input.last_assistant_message;
  }
  const tp = input.transcript_path || input.transcriptPath;
  if (tp && fs.existsSync(tp)) {
    try {
      const lines = fs.readFileSync(tp, 'utf8').split('\n').filter((l) => l.trim());
      for (let i = lines.length - 1; i >= 0; i--) {
        const j = JSON.parse(lines[i]);
        if (j.type === 'assistant' && j.message && Array.isArray(j.message.content)) {
          const t = j.message.content.filter((c) => c.type === 'text').map((c) => c.text).join('\n');
          if (t.trim()) return t;
        }
      }
    } catch (e) {}
  }
  return '';
}

function block(reason) {
  process.stdout.write(JSON.stringify({ decision: 'block', reason }));
  process.exit(0);
}

let input = {};
try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch (e) {}

let text = '';
try { text = lastAssistantText(input); } catch (e) {}
if (!text || !CLAIM_RE.test(text)) process.exit(0);
// самоцитата власного фідбеку гейта — не блокувати повторно
if (/G22 HandoffGate/.test(text)) process.exit(0);

try {
  const problems = [];
  const state = fs.readFileSync(STATE, 'utf8');

  // перша шапка «ЯК ПОЧАТИ СЕСІЮ N» до наступного '## '
  const m = state.match(/## 🚀 ЯК ПОЧАТИ СЕСІЮ (\d+)[\s\S]*?(?=\n## )/);
  if (!m) {
    problems.push('у STATE.md не знайдено шапки «## 🚀 ЯК ПОЧАТИ СЕСІЮ N»');
  } else {
    const head = m[0];
    const sessN = parseInt(m[1], 10);

    // 1) усі хеші з шапки існують у репо
    const hashes = [...new Set((head.match(/\b[0-9a-f]{7,10}\b/g) || []))]
      .filter((h) => /[0-9]/.test(h) && /[a-f]/.test(h)); // відсіяти слова типу 'deadline'
    for (const h of hashes) {
      try {
        execSync(`git -C "${REPO}" cat-file -e ${h}^{commit}`, { stdio: 'ignore' });
      } catch (e) { problems.push(`хеш «${h}» із шапки не існує в репо (одрук/застаріле)`); }
    }

    // 2) HEAD згаданий у шапці
    const headHash = execSync(`git -C "${REPO}" rev-parse --short=7 HEAD`, { encoding: 'utf8' }).trim();
    if (!head.includes(headHash.slice(0, 7))) {
      problems.push(`HEAD ${headHash} НЕ згаданий у шапці — вона старіша за останній коміт`);
    }

    // 3) STATE новіший за останній коміт
    const commitTs = parseInt(execSync(`git -C "${REPO}" log -1 --format=%ct`, { encoding: 'utf8' }).trim(), 10) * 1000;
    const stateTs = fs.statSync(STATE).mtimeMs;
    if (stateTs < commitTs - 60_000) {
      problems.push('STATE.md старіший за останній коміт — хендоф не переписаний після роботи');
    }

    // 4) номер сесії в шапці — максимальний у файлі
    const others = [...state.matchAll(/ЯК ПОЧИНАЛАСЬ СЕСІЯ (\d+)|ЯК ПОЧАТИ СЕСІЮ (\d+)/g)]
      .map((x) => parseInt(x[1] || x[2], 10));
    if (others.some((n) => n > sessN)) {
      problems.push(`шапка каже «СЕСІЮ ${sessN}», але нижче є більший номер — шапки переплутані`);
    }
  }

  if (problems.length) {
    block(
      'G22 HandoffGate: заява про готовий хендоф/оновлений STATE, але перевірка STATE.md впала:\n' +
      problems.map((p) => '  • ' + p).join('\n') +
      '\nВиправ STATE.md (шапка § ЯК ПОЧАТИ СЕСІЮ N: актуальні хеші включно з HEAD, свіжий mtime) і повтори відповідь.'
    );
  }
} catch (e) {
  // fail-open
}

process.exit(0);
