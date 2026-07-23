#!/usr/bin/env node
/*
  cd-frame-parity-gate (G-CD DeepFrameParity) — Stop hook.

  WHY (S39, Yehor mandate, verbatim):
    «я не маю про це нагадувати кожну штуку яку робить клод дизайн треба максимально глибоко
     покадрово з купою кадрів перевіряти на шрифти на розміщення картинок і тексту на появу
     картинок і тексту на юай юікс на композиції на хореографію і так далі. все має бути рівно
     1 в 1. всі атоми повторені і молекули повторені на 100%. це правило хуки».
    Agent showed a CD result after checking only 3 beats ("structure better than skeleton") and
    asked Yehor what to do. That is NOT the agent's job — the agent must PROVE it to 100% itself,
    with a DEEP per-frame parity sweep across every axis, BEFORE showing Yehor.

  This gate makes it IMPOSSIBLE to describe a CD (Claude Design) result as done / good / matching /
  "structure right" / "close" / ready-to-accept without a FRESH (<30min) deep frame-parity report
  covering the whole scroll (a "dense" sweep, many frames) — not a 3-beat spot check.

  Pairs with [[deep-frame-parity-every-cd-result]] memory. Fail-OPEN on any error.
*/
'use strict';
const fs = require('fs');
const path = require('path');

const FRESH_MS = 30 * 60 * 1000;
const HOME = process.env.HOME || '/Users/yehorfedorov';

// where a deep dense-parity report is expected (agent writes it during the sweep)
const REPORT_CANDIDATES = [
  path.join(HOME, 'Downloads', 'KAI', 's39-boards', 'DENSE-PARITY-REPORT.json'),
  path.join(HOME, 'Downloads', 'award-re-springs', 'scripts', 'parity', 'cd-frame-parity-report.json'),
];

function readStdin() {
  try { return fs.readFileSync(0, 'utf8'); } catch (e) { return ''; }
}

function lastAssistantText(transcriptPath) {
  try {
    if (!transcriptPath || !fs.existsSync(transcriptPath)) return '';
    const lines = fs.readFileSync(transcriptPath, 'utf8').trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      let o; try { o = JSON.parse(lines[i]); } catch (e) { continue; }
      if (o && o.type === 'assistant' && o.message && Array.isArray(o.message.content)) {
        const txt = o.message.content.filter(c => c.type === 'text').map(c => c.text).join('\n');
        if (txt) return txt;
      }
    }
  } catch (e) {}
  return '';
}

function freshReportExists() {
  const now = Date.now();
  for (const p of REPORT_CANDIDATES) {
    try {
      const st = fs.statSync(p);
      if (now - st.mtimeMs < FRESH_MS) {
        const j = JSON.parse(fs.readFileSync(p, 'utf8'));
        // must be a DENSE sweep: many frames checked across all beats, not a spot-check
        const framesChecked = j.framesChecked || j.checked || 0;
        const beats = (j.beats && j.beats.length) || 0;
        if (framesChecked >= 20 && beats >= 6) return true;
      }
    } catch (e) {}
  }
  return false;
}

try {
  const input = readStdin();
  let data = {}; try { data = JSON.parse(input); } catch (e) {}
  const text = lastAssistantText(data.transcript_path) || '';
  if (!text) process.exit(0);

  const low = text.toLowerCase();

  // is this about a CD / Claude Design result?
  // only fires when there is an ACTUAL CD OUTPUT in hand (pulled / rendered / has a URL),
  // NOT when the text merely mentions "CD" in a plan / handoff / package description.
  const cdOutputInHand = /(cd видав|cd зробив|cd повернув|стягнув.*(dc|cd)|\.dc\.html.*(стягн|конверт|рендер)|organism-cd\/hero|DesignSync.*get_file|RAW.*(стягн|конверт))/i.test(text);
  if (!cdOutputInHand) process.exit(0);

  // does the text CLAIM that in-hand CD output is good / done / matching / ready?
  const claimsGood = /(структура (краща|правильна|вірна|добра)|виглядає (як треба|добре|правильно)|matches|збіглось|краще за кістяк|дуже близько|найкращий біт|порядок ✅|готов(о|ий) до прийма)/i.test(text);
  if (!claimsGood) process.exit(0);

  // exempt honest disclaimers (handoff/plan context, or explicit "not checked")
  const honestlyOpen = /(не звірен|НЕ звірив|не перевірен|0 checks|нічого не звірено|нічого не побудовано|лише вибірково|тільки \d+ біт|spot.?check|поки не звірив|це матеріали|вхідні матеріали|пакет.*(готов|preflight)|чекає (тебе|CD|Єгор)|твій хід)/i.test(text);
  if (honestlyOpen) process.exit(0);

  if (freshReportExists()) process.exit(0);

  const msg =
    'G-CD DeepFrameParity: описано CD-результат як добрий / правильний / близький / готовий-до-приймання, ' +
    'але немає СВІЖОГО (<30хв) ГЛИБОКОГО покадрового dense-parity звіту (20+ кадрів, усі 6+ бітів).\n\n' +
    'МАНДАТ Єгора (це правило): КОЖЕН CD-результат перевіряти САМ, максимально глибоко покадрово з купою кадрів — ' +
    'шрифти (px/вага/spacing/hex), розміщення тексту І фото, ПОЯВА тексту/фото по скролу, UI/UX, композиція, ' +
    'хореографія. Усе рівно 1-в-1, атоми й молекули повторені на 100%. Вибіркові 3 біти = НЕ звірка.\n\n' +
    'Зроби одне з двох:\n' +
    '  1) Прожени ГЛИБОКУ dense-звірку (десятки кадрів нашого↔live по всьому скролу, кожна вісь числами+око), ' +
    'запиши KAI/s39-boards/DENSE-PARITY-REPORT.json {framesChecked>=20, beats:[...6+]}, ' +
    'ВИПРАВ усі diff до 100% ПЕРЕД показом Єгору.\n' +
    '  2) АБО опиши ЧЕСНО що НЕ звірено (які біти/осі не перевірені) — без слів «правильно/близько/готово».\n\n' +
    'Не питай Єгора «що робити з X» поки не довів решту сам. Пам\'ять: deep-frame-parity-every-cd-result.';

  process.stdout.write(JSON.stringify({ decision: 'block', reason: msg }));
  process.exit(0);
} catch (e) {
  process.exit(0); // fail-open
}
