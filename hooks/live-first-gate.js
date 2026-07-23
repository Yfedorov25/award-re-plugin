#!/usr/bin/env node
/*
  live-first-gate (G-LIVE) — PreToolUse on Write|Edit|MultiEdit.

  Memory: live-first-before-visual. Battle-lesson S22: SO-1 was built from
  extraction-JSON + text teardowns, so the seam mechanic was INVENTED (a clip-line
  "slicer" + act-word that springs does NOT have). Root cause: the pipeline let a
  visual section be built BEFORE observing the LIVE motion.

  This gate makes that physically hard: writing a suborganism visual file
  (suborganisms/<SO>/{seam,index}.html) is BLOCKED unless a FRESH live-reference
  capture exists for that suborganism:
     extraction/live-ref/<SO>/manifest.json   (age < LIVE_REF_MAX_DAYS)
  Produce it with:  node award-re-plugin/scripts/capture-live-ref.mjs --url <live> --name <SO>

  Fail-OPEN everywhere: any error / missing project => allow. The gate must never
  break unrelated work — it only fires on suborganism seam/index html writes.
*/
'use strict';
const fs = require('fs');
const path = require('path');

const LIVE_REF_MAX_DAYS = 14;              // a live-ref older than this is stale
const HOME = process.env.HOME || '/Users/yehorfedorov';

try {
  let raw = '';
  try { raw = fs.readFileSync(0, 'utf8'); } catch (_) { process.exit(0); }
  if (!raw.trim()) process.exit(0);
  let input; try { input = JSON.parse(raw); } catch (_) { process.exit(0); }

  const ti = input.tool_input || input.toolInput || {};
  const filePath = (ti.file_path || ti.path || '').replace(/\\/g, '/');
  if (!filePath) process.exit(0);

  // ── S45-d (Етап C2, підпис Єгора): live-first і на АТОМИ ────────────────────
  // Запис atoms/<id>/variants/*.html БЛОКОВАНО без live-референсу поруч:
  // atoms/<id>/reference/ мусить містити live-запис (mp4/mov/webm) або manifest.json.
  // Корінь: wellness перший атом був НЕВІРНИЙ бо будувався з припущень, не з live
  // (CHOREO-MAP: «Мій перший атом БУВ НЕВІРНИЙ»). Кадри перемагають ТЗ (forest-урок).
  const ma = filePath.match(/\/library\/techniques\/atoms\/([^/]+)\/variants\/[^/]+\.html$/i);
  if (ma) {
    const atomName = ma[1];
    const refDir = path.join(path.dirname(path.dirname(filePath)), 'reference');
    let hasRef = false, hasTimeline = false, hasChoreo = false;
    try {
      const rf = fs.existsSync(refDir) ? fs.readdirSync(refDir) : [];
      hasRef = rf.some((f) => /\.(mp4|mov|webm)$/i.test(f) || f === 'manifest.json');
      hasTimeline = rf.some((f) => f.endsWith('.timeline.json'));
      hasChoreo = fs.existsSync(path.join(path.dirname(path.dirname(filePath)), 'CHOREO.md'));
    } catch (_) {}
    // S46-c ПРОТОКОЛ (мандат Єгора): код атома ПИШЕТЬСЯ лише після ПОВНОГО live-розбору.
    // Обов'язкові артефакти: (1) live-запис; (2) machine-timeline (live-timeline.mjs);
    // (3) CHOREO.md — покадровий розбір ФАЗ з числами (full-res кадри, не клітинки монтажу).
    if (hasRef && hasTimeline && hasChoreo) process.exit(0);
    if (hasRef && (!hasTimeline || !hasChoreo)) {
      const missing = [];
      if (!hasTimeline) missing.push('reference/<name>.timeline.json — згенеруй: node scripts/live-timeline.mjs --video atoms/' + atomName + '/reference/<відео>');
      if (!hasChoreo) missing.push('CHOREO.md поруч зі SPEC.md — покадровий розбір фаз за ATOM-PROTOCOL.md (full-res кадри, числа подій, поверхні)');
      const reason2 =
        'G-LIVE live-first-gate (ПРОТОКОЛ S46-c): писати ' + path.basename(filePath) + ' для «' + atomName + '» ' +
        'ЗАБЛОКОВАНО — live-запис Є, але розбір НЕ завершений. Бракує:\n  - ' + missing.join('\n  - ') + '\n' +
        'ЗАКОН: код пишеться ПІСЛЯ повного live-розбору (корінь S46: панель прийнята за скрим бо розбір ' +
        'був по низькорез-клітинках). Протокол: award-re-springs/library/techniques/atoms/ATOM-PROTOCOL.md';
      process.stdout.write(JSON.stringify({ hookSpecificOutput: {
        hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason2 } }));
      process.exit(0);
    }
    const reason =
      'G-LIVE live-first-gate (atoms, S45-d): писати ' + path.basename(filePath) + ' для атома «' + atomName + '» ' +
      'ЗАБЛОКОВАНО — немає live-референсу.\n' +
      'ЗАКОН: перш ніж будувати атом — поклади live-запис секції в\n  atoms/' + atomName + '/reference/<name>-live.mp4\n' +
      '(запис Єгора або кроп з повного ролика ffmpeg-ом), розкадруй 12fps+ ПОКАДРОВО,\n' +
      'зроби timeline подій (scripts/live-timeline.mjs допомагає), і лише тоді пиши код.\n' +
      'Пам\'ять: live-first-before-visual · verify-dont-agree-analyze-every-frame.';
    process.stdout.write(JSON.stringify({ hookSpecificOutput: {
      hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason } }));
    process.exit(0);
  }

  // Only fire on a suborganism SEAM or INDEX html (the visual replica files).
  // suborganisms/<SO-name>/(seam|index).html
  const m = filePath.match(/\/suborganisms\/([^/]+)\/(seam|index)\.html$/i);
  if (!m) process.exit(0);
  const soName = m[1];

  // Find the project root (dir containing extraction/ or library/) walking up from the file.
  let dir = path.dirname(filePath);
  let root = null;
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, 'extraction')) || fs.existsSync(path.join(dir, 'library'))) { root = dir; break; }
    const up = path.dirname(dir); if (up === dir) break; dir = up;
  }
  if (!root) process.exit(0); // can't locate project => fail-open

  const manifestPath = path.join(root, 'extraction', 'live-ref', soName, 'manifest.json');
  let fresh = false;
  if (fs.existsSync(manifestPath)) {
    try {
      const mf = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const at = Date.parse(mf.at);
      if (!Number.isNaN(at)) {
        const ageDays = (Date.now() - at) / 86400000;
        fresh = ageDays >= 0 && ageDays < LIVE_REF_MAX_DAYS;
      }
    } catch (_) { /* unreadable => not fresh */ }
  }
  if (fresh) process.exit(0); // grounded in live => allow

  const capture = 'node award-re-plugin/scripts/capture-live-ref.mjs --url <LIVE_URL> --name ' + soName +
    ' --from 0 --to 2800 --step 140';
  const reason =
    'G-LIVE live-first-gate: писати ' + path.basename(filePath) + ' для під-організму «' + soName + '» ' +
    'ЗАБЛОКОВАНО — немає СВІЖОГО live-референсу.\n' +
    'ЗАКОН (пам\'ять live-first-before-visual): перш ніж будувати візуальну секцію-репліку — ' +
    'СПОЧАТКУ проскроль ЖИВИЙ сайт і зніми реальний рух. Дослідження «чому» = з live-кадрів, ' +
    'НЕ з extraction-JSON. (SO-1: вигадав слайсер/act-слово яких на springs НЕМАЄ.)\n' +
    'Зроби:\n  1) ' + capture + '\n' +
    '  2) РОЗДИВИСЬ extraction/live-ref/' + soName + '/sheet.png оком (як РЕАЛЬНО рухається перехід)\n' +
    '  3) тоді пиши RESEARCH.md/seam.html за live-механікою.\n' +
    'live-ref свіжий < ' + LIVE_REF_MAX_DAYS + ' днів. Fail-open лише поза suborganisms/.';

  const out = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  };
  process.stdout.write(JSON.stringify(out));
  process.exit(0);
} catch (_) {
  process.exit(0); // fail-open
}
