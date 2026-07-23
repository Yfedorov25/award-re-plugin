#!/usr/bin/env node
/*
  hooks-lock-guard (G-LOCK) — PreToolUse на Write|Edit|MultiEdit. S45-d, підпис Єгора.

  Замикає від правок Write/Edit-інструментами:
  1. Директорію award-re-plugin/hooks/ (усі файли) — гейти правляться ЛИШЕ за явною
     вказівкою Єгора в чаті (закон конституції). Процедура: Єгор каже «дозволяю правку
     хуків» → тимчасово прибрати цей guard із .claude/settings.json → правка → повернути.
  2. Будь-який self-check-report.json і scripts/calibration-report.json — звіти пише
     ТІЛЬКИ харнес (node self-check.mjs / calibrate.mjs через Bash); рукописний = підробка.

  Вердикт ради (Contrarian): кожен шлях обману мусить вимагати дії, яка в транскрипті
  читається як однозначний саботаж, а не «правдоподібна випадковість». Fail-open на
  помилках самого guard (він не сміє ламати сторонню роботу).
*/
'use strict';
const fs = require('fs');

try {
  let raw = '';
  try { raw = fs.readFileSync(0, 'utf8'); } catch (_) { process.exit(0); }
  if (!raw.trim()) process.exit(0);
  let input; try { input = JSON.parse(raw); } catch (_) { process.exit(0); }

  const ti = input.tool_input || input.toolInput || {};
  const fp = (ti.file_path || ti.path || '').replace(/\\/g, '/');
  if (!fp) process.exit(0);

  const isHooksDir = /\/award-re-plugin\/hooks\//.test(fp);
  const isReport = /\/self-check-report\.json$/.test(fp) || /\/scripts\/calibration-report\.json$/.test(fp);
  if (!isHooksDir && !isReport) process.exit(0);

  const reason = isHooksDir
    ? 'G-LOCK: правка ' + fp.split('/hooks/')[1] + ' у захищеній директорії hooks/ ЗАБЛОКОВАНА.\n' +
      'Гейти правляться лише за явною вказівкою Єгора В ЧАТІ цієї сесії. Якщо вказівка є:\n' +
      'тимчасово прибери hooks-lock-guard із .claude/settings.json → правка → поверни guard\n' +
      '(двокрокова дія видима в транскрипті — так і задумано, вердикт ради S45-d).'
    : 'G-LOCK: рукописний запис ' + fp.split('/').pop() + ' ЗАБЛОКОВАНО.\n' +
      'Звіти пише ТІЛЬКИ харнес: node scripts/self-check.mjs --atom <id> (звіт атома) або\n' +
      'node scripts/calibrate.mjs (калібраційний). Написаний руками звіт = підробка доказу.';

  process.stdout.write(JSON.stringify({ hookSpecificOutput: {
    hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason } }));
  process.exit(0);
} catch (_) {
  process.exit(0); // fail-open
}
