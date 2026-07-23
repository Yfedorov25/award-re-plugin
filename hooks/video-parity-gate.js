#!/usr/bin/env node
/*
  video-parity-gate (G22 VideoParityGate) — Stop hook.

  WHY (S28, Yehor caught "неготове" TWICE after gates were green):
    G18 checks ONE settled frame vs a static baseline. It is BLIND to tempo, flow,
    intermediate composition stages, morph-bridges, and — critically — TEXT COLLISION
    ("текст налазить один на одний"). Those are exactly what Yehor sees by eye and what
    "gates green ≠ done" hid. So we were shipping unfinished inner-section work.

  This gate makes it IMPOSSIBLE to claim an INNER SECTION / composition is
  "built / done / 1-в-1 / matches live" without a FRESH video-parity run
  (scripts/video-parity.mjs) that (a) found ZERO text collisions and (b) produced a
  board the eye can confirm against the live springs video.

  It does NOT auto-pass "1-в-1" — video-parity never returns "pass" on its own; the
  eye must confirm the board. But a claim of done + no fresh zero-collision report = BLOCK.

  Fail-OPEN on any error (never break the agent).
*/
'use strict';
const fs = require('fs');
const path = require('path');

const FRESH_MS = 30 * 60 * 1000;
const HOME = process.env.HOME || '/Users/yehorfedorov';
const REPORT_CANDIDATES = [
  path.join(HOME, 'Downloads', 'award-re-springs', 'scripts', 'parity', 'video', 'video-parity-report.json'),
];

function lastAssistantText(input) {
  if (typeof input.last_assistant_message === 'string' && input.last_assistant_message.trim())
    return input.last_assistant_message;
  const tp = input.transcript_path || input.transcriptPath;
  if (tp && fs.existsSync(tp)) {
    try {
      const lines = fs.readFileSync(tp, 'utf8').split('\n').filter((l) => l.trim());
      for (let i = lines.length - 1; i >= 0; i--) {
        let obj; try { obj = JSON.parse(lines[i]); } catch { continue; }
        const role = obj.role || (obj.message && obj.message.role);
        if (role !== 'assistant') continue;
        const content = obj.content || (obj.message && obj.message.content);
        if (typeof content === 'string') return content;
        if (Array.isArray(content)) {
          const txt = content.map((c) => (typeof c === 'string' ? c : (c && c.text) || '')).join(' ').trim();
          if (txt) return txt;
        }
      }
    } catch { /* fail-open */ }
  }
  return '';
}

// Claim that an INNER SECTION / composition is finished or 1-в-1 with the live video.
function claimsInnerSectionDone(text) {
  const t = text.toLowerCase();
  // must be a completion/parity claim...
  const CLAIM = /(готов[оаий]|1\s*[-–]?\s*в\s*[-–]?\s*1|закрит[оаий]|matches the live|1-в-1|побудован|збудован|\bdone\b|еталон нутра)/i;
  if (!CLAIM.test(t)) return false;
  // ...about inner-section / composition / tempo work (the class Yehor flagged)
  const INNER = /(нутро|карусель|слайдер|картк|композиц|темп|hover-пін|під-організм|suborganism|SO-\d|модалк|перехід|поєднан|section inner|inner section|нутра)/i;
  if (!INNER.test(t)) return false;
  // honest reports (negations / "not done" / "needs eye") are allowed
  const NEG = /(\bне\b|нема|немає|\bnot\b|нужно|треба|ще не|поки не|needs-eye|needs eye|потребу|не 1|не готов|видаю неготове|неготове|провал|fail|розбіжн|відмінност|collision|налазить|розсинхрон|не заявля|не досяга)/i;
  if (NEG.test(t)) return false;
  // quoting THIS gate's own message must not recurse
  if (/videoparitygate|g22|video-parity/i.test(t)) return false;
  return true;
}

function responseCitesVideoParity(text) {
  return /(video-parity|SO-\d+-\w+-board\.html|video-parity-report\.json|video-board|so3-video-board)/i.test(text);
}

function freshZeroCollisionReport() {
  for (const P of REPORT_CANDIDATES) {
    try {
      if (!fs.existsSync(P)) continue;
      const stat = fs.statSync(P);
      if (Date.now() - stat.mtimeMs > FRESH_MS) continue;
      let data = JSON.parse(fs.readFileSync(P, 'utf8'));
      if (!Array.isArray(data)) data = [data];
      const latest = data[0];
      if (latest && Array.isArray(latest.collisions) && latest.collisions.length === 0) return true;
    } catch { /* fail-open */ }
  }
  return false;
}

try {
  let raw = ''; try { raw = fs.readFileSync(0, 'utf8'); } catch { process.exit(0); }
  if (!raw.trim()) process.exit(0);
  let input; try { input = JSON.parse(raw); } catch { process.exit(0); }
  const text = lastAssistantText(input);
  if (!text) process.exit(0);
  if (!claimsInnerSectionDone(text)) process.exit(0);
  if (responseCitesVideoParity(text) || freshZeroCollisionReport()) process.exit(0);

  const reason =
    'G22 VideoParityGate: заявлено «нутро/секція побудовано / 1-в-1 / готово» про ВНУТРІШНЮ секцію ' +
    '(карусель/слайдер/картки/темп/композиція), але немає СВІЖОГО (<30хв) video-parity-звіту з 0 collisions.\n\n' +
    'Це той клас помилок що Єгор ловить оком (текст налазить, темп 2× швидший, композицій менше, ' +
    'поєднаність не та) і якого технічні гейти + G18-pixel-parity НЕ бачать.\n\n' +
    'Зроби одне з двох:\n' +
    '  1) Прожени video-parity проти ЖИВОГО відео і додай борд у відповідь:\n' +
    '     node scripts/video-parity.mjs --ours <url> --live "<live springs .mov>" \\\n' +
    '        --live-window "<start:end>" --label <name> --phases "0.08,0.18,...,0.90"\n' +
    '     (має дати collisions=0 у scripts/parity/video/video-parity-report.json + борд наше-vs-live),\n' +
    '     ТОДІ ЗВІР БОРД ОКОМ проти live і лише якщо 1-в-1 — заявляй. Гейт НЕ авто-пасить «1-в-1».\n' +
    '  2) АБО прибери заяву про готовність — опиши ЧЕСНО: що зроблено, які відмінності від live лишились.\n\n' +
    'Пам’ять [[live-first-before-visual]] #13: технічні гейти СЛІПІ до темпу/композиції/накладання. ' +
    'Live-ВІДЕО = істина. Не віддавай неготове.';

  process.stdout.write(JSON.stringify({ decision: 'block', reason }));
  process.exit(0);
} catch { process.exit(0); }
