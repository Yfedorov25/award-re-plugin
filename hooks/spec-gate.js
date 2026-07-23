#!/usr/bin/env node
/*
  spec-gate (G23 SpecGate) — Stop hook. Council verdict 2026-07-15.

  Мета: зробити ФІЗИЧНО неможливим заявити «1-в-1 / готово / збіглось / <3%» про
  секцію-репліку springs БЕЗ свіжого element-gate звіту, де НАСПРАВДІ щось звірено
  (checked>0) І все пройшло (pass=true). Це вбиває корінь «вгадую геометрію на око»:
  готово = числа з answer-key (spec/) звірені, не з голови.

  Правила що гейт вшиває:
    • «1-в-1/готово/parity» про spec-driven секцію → потрібен свіжий (<30хв)
      spec/element-gate-report.json з pass=true AND checked>0.
    • 0 checks НЕ є пас (нічого не звірено — MAP неповний або фаза не вирівняна).

  Fail-OPEN всюди (помилка читання → дозволити). Stop-hook: block через
  stdout {"decision":"block","reason":...} + exit 0.
*/
'use strict';
const fs = require('fs');
const path = require('path');

const FRESH_MS = 30 * 60 * 1000;
const REPORT = path.join(process.env.HOME || '/Users/yehorfedorov',
  'Downloads', 'award-re-springs', 'spec', 'element-gate-report.json');

// claim triggers (укр+англ) про ГОТОВНІСТЬ/ЗБІГ візуальної репліки
const CLAIM = /(1[\s-]?в[\s-]?1|1[\s-]?to[\s-]?1|піксель[а-я]*\s*(готов|збіг|1)|готов[аео]?\b.*(секці|nature|place|конвеєр|репліка)|(секці|nature|place|конвеєр|репліка).*готов|parity\s*(pass|збіг|готов)|збіг(лося|лись)|<\s*3\s*%|≤\s*3\s*%|досягн[а-я]*\s*(1-в-1|3%))/i;
// але НЕ блокувати якщо відповідь ЧЕСНО каже що НЕ звірено/не готово
const HONEST = /(не звірено|НЕ 1-в-1|ще не готов|не міряний|не досягн|element-gate.*(fail|0 checks|не пройш)|answer-key.*(доробити|далі))/i;

function lastText(input) {
  if (typeof input.last_assistant_message === 'string' && input.last_assistant_message.trim())
    return input.last_assistant_message;
  const tp = input.transcript_path || input.transcriptPath;
  if (tp && fs.existsSync(tp)) {
    try {
      const lines = fs.readFileSync(tp, 'utf8').split('\n').filter((l) => l.trim());
      for (let i = lines.length - 1; i >= 0; i--) {
        let o; try { o = JSON.parse(lines[i]); } catch { continue; }
        const role = o.role || (o.message && o.message.role);
        if (role !== 'assistant') continue;
        const c = o.content || (o.message && o.message.content);
        if (typeof c === 'string') return c;
        if (Array.isArray(c)) { const t = c.map((x) => typeof x === 'string' ? x : (x && x.text) || '').join(' ').trim(); if (t) return t; }
      }
    } catch { /* fail-open */ }
  }
  return '';
}

function main() {
  let input = {};
  try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { process.exit(0); }
  const text = lastText(input);
  if (!text) process.exit(0);

  // не про репліку springs — не наша справа
  if (!/spring|nature|place|конвеєр|репліка|section|секці/i.test(text)) process.exit(0);
  if (!CLAIM.test(text)) process.exit(0);      // не заявляє готовність — ок
  if (HONEST.test(text)) process.exit(0);       // чесно каже що НЕ готово — ок

  // потрібен свіжий element-gate report з pass=true, checked>0
  let ok = false, why = 'немає spec/element-gate-report.json';
  try {
    if (fs.existsSync(REPORT)) {
      const r = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
      const fresh = (Date.now() - (r.ts || 0)) < FRESH_MS;
      if (!fresh) why = 'element-gate звіт СТАРИЙ (>30хв) — прожени наново';
      else if (!(r.checked > 0)) why = `element-gate 0 checks — нічого не звірено (MAP неповний/фаза не вирівняна)`;
      else if (!r.pass) why = `element-gate FAIL (${r.fails} елементів поза допуском ${r.tolPx}px) — фікс по числах з spec/`;
      else ok = true;
    }
  } catch (e) { process.exit(0); /* fail-open on parse error */ }

  if (ok) process.exit(0);

  const reason =
    'G23 SpecGate: заявлено «1-в-1 / готово / <3%» про секцію-репліку, але немає свіжого ' +
    'element-gate доказу. ' + why + '.\n\n' +
    'Зроби одне з двох:\n' +
    '  1) node scripts/element-gate.mjs (має записати spec/element-gate-report.json з pass=true AND checked>0 за <30хв),\n' +
    '  2) АБО прибери заяву про готовність — опиши ЧЕСНО (що звірено проти spec/, що ще ні; 0 checks = не звірено).\n\n' +
    'ПРАВИЛО ради: готово = числа з answer-key (spec/frame-*.json) звірені per-element, НЕ вгадані на око. ' +
    'Субститут-асет (src != live) і eyeball-геометрія — заборонені.';
  process.stdout.write(JSON.stringify({ decision: 'block', reason }));
  process.exit(0);
}
try { main(); } catch { process.exit(0); }
