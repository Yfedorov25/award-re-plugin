#!/usr/bin/env node
/*
  link-ip-gate (G-LINK LinkIpGate) — Stop hook.

  Мета: зробити ФІЗИЧНО неможливим дати Єгору посилання на localhost-прототип
  через (а) mac hostname `.local` — у нього НЕ резолвиться (ERR_NAME_NOT_RESOLVED),
  або (б) ХАРДКОД/застарілий IP, що НЕ дорівнює поточному резолвленому IP машини
  (IP мережі плаває: був 192.168.0.101 → став 192.168.88.33).

  Пряма вказівка Єгора (2026-07-13):
    «більше не давай ніколи мак адресу ... саме резолвь поточний айпі адрес і його давай».
  Пам'ять: always-post-links-in-chat.

  Механізм (Claude Code Stop hook):
    stdin JSON має last_assistant_message (повний текст останньої відповіді).
    Fallback: transcript_path -> JSONL, останнє assistant-повідомлення.
    Блокування: stdout {"decision":"block","reason": "..."} + exit 0.
    Дозвіл: exit 0 без block.

  Спрацьовує ЛИШЕ якщо у відповіді є http(s)-URL на localhost-порт прототипу
  (:8879 / :8820 / :8000 / :5173 / localhost / 127.0.0.1 / 192.168.* / *.local).
  Якщо у відповіді немає таких посилань — гейт мовчить (exit 0).

  Fail-OPEN всюди: будь-яка помилка => дозволити (exit 0). Хук НЕ ламає роботу.
*/
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ── S45 розширення: self-check gate ─────────────────────────────────────────
// Жоден compare-URL атома (:8879 /atoms/<id>/…) без свіжого self-check-report.json
// поруч з атомом (свіжий <30хв, pass:true, atomId збіг). CLAUDE.md B18-B20.
// Народжено: wellness брав 7 ітерацій бо показувалось недороблене й чекалось поки
// Єгор зловить око. Суворість ЖОРСТКА (Єгор S45): нема звіту → нема відповіді.
const SELF_CHECK_MAX_AGE_MS = 30 * 60 * 1000; // 30 хв (рішення S45-d: лишити ПЛЮС inputsHash)
const ATOMS_ROOT = path.join(
  process.env.HOME || require('os').homedir(),
  'Downloads/award-re-springs/library/techniques/atoms'
);
// ── S45-d hooks-пакет (підпис Єгора «давай як рекомендуєш») ─────────────────
const crypto = require('crypto');
const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
// Завжди-обчислювані виміри: звіт без будь-якого з них = downgrade-атака → блок.
// Expectation-виміри (timing/ordering/parallelism/plateau/composition/typography/channel)
// вимагаються ЯКЩО expectations.json атома декларує відповідну секцію.
const REQUIRED_ALWAYS = ['render-api', 'purity', 'census', 'geometry', 'motion-direction', 'channel-identity', 'console-errors', 'http-status'];
const EXPECT_DIMS = { events: 'timing', ordering: 'ordering', overlap: 'parallelism', composition: 'composition-overlap', typography: 'typography-reveal' };

// inputsHash: ТА САМА формула що в self-check.mjs (variants/*.html sorted + configSha + expectationsSha)
function computeInputsHash(dir) {
  const vdir = path.join(dir, 'variants');
  const htmls = fs.existsSync(vdir)
    ? fs.readdirSync(vdir).filter((f) => f.endsWith('.html')).sort().map((f) => fs.readFileSync(path.join(vdir, f)))
    : [];
  const cfgP = path.join(dir, 'self-check.config.json'), expP = path.join(dir, 'expectations.json');
  const cSha = fs.existsSync(cfgP) ? sha256(fs.readFileSync(cfgP)) : null;
  const eSha = fs.existsSync(expP) ? sha256(fs.readFileSync(expP)) : null;
  return sha256(Buffer.concat([...htmls, Buffer.from((cSha || '') + (eSha || ''))]));
}
// Дістати atomId зі шляху compare-URL: .../atoms/<atomId>/...
function atomIdFromUrl(url) {
  const m = url.match(/\/atoms\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}
// Перевірити self-check-report для атома. Повертає {ok, why}.
function checkSelfReport(atomId) {
  const dir = path.join(ATOMS_ROOT, atomId);
  if (!fs.existsSync(dir)) {
    // не наш атом (напр. air-mobile-hero у власному дереві) — не блокуємо цим правилом
    return { ok: true, why: 'no-atom-dir', skip: true };
  }
  const rp = path.join(dir, 'self-check-report.json');
  if (!fs.existsSync(rp)) return { ok: false, why: `нема self-check-report.json (запусти: node scripts/self-check.mjs --atom ${atomId})` };
  let rep;
  try { rep = JSON.parse(fs.readFileSync(rp, 'utf8')); }
  catch (e) { return { ok: false, why: `self-check-report.json не парситься (${e.message}) — перезапусти self-check` }; }
  if (rep.atomId !== atomId) return { ok: false, why: `atomId у звіті "${rep.atomId}" != "${atomId}" — звіт від іншого атома` };
  if (rep.pass !== true) {
    const failed = Array.isArray(rep.checks) ? rep.checks.filter((c) => !c.pass).map((c) => c.name) : [];
    return { ok: false, why: `self-check pass:false${failed.length ? ' (провалено: ' + failed.join(', ') + ')' : ''} — полагодь і перезапусти self-check` };
  }
  const ts = Date.parse(rep.ts || '');
  if (!ts) return { ok: false, why: 'у звіті нема валідного ts — перезапусти self-check' };
  const ageMs = Date.now() - ts;
  if (ageMs > SELF_CHECK_MAX_AGE_MS) {
    const mins = Math.round(ageMs / 60000);
    return { ok: false, why: `self-check застарілий (${mins}хв тому, ліміт 30хв) — перезапусти node scripts/self-check.mjs --atom ${atomId}` };
  }
  // ── S45-d: v2-вимоги ──
  if (rep.version !== 2 || !rep.inputsHash || !rep.coverage) {
    return { ok: false, why: 'звіт не v2 (нема inputsHash/coverage) — перезапусти актуальний self-check' };
  }
  // (б) inputsHash: атом змінено ПІСЛЯ self-check → старий зелений недійсний
  const nowHash = computeInputsHash(dir);
  if (nowHash !== rep.inputsHash) {
    return { ok: false, why: 'АТОМ ЗМІНЕНО після self-check (inputsHash mismatch) — перезапусти self-check на поточному стані' };
  }
  // (в) REQUIRED_DIMENSIONS анти-downgrade
  const ran = new Set((rep.coverage && rep.coverage.dimensionsRun) || []);
  const missing = REQUIRED_ALWAYS.filter((d) => !ran.has(d));
  const expP = path.join(dir, 'expectations.json');
  if (fs.existsSync(expP)) {
    try {
      const exp = JSON.parse(fs.readFileSync(expP, 'utf8'));
      for (const [sec, dim] of Object.entries(EXPECT_DIMS)) {
        const v = exp[sec];
        const declared = Array.isArray(v) ? v.length > 0 : v && Object.keys(v).filter((k) => k[0] !== '_').length > 0;
        if (declared && !ran.has(dim)) missing.push(dim + ' (задекларовано в expectations)');
      }
    } catch (_) { return { ok: false, why: 'expectations.json битий — полагодь' }; }
  }
  if (missing.length) {
    return { ok: false, why: `DOWNGRADE: звіт не містить обов'язкових вимірів: ${missing.join(', ')} — харнес урізано?` };
  }
  // (д) ledger порогів: калібрація мусить бути на ПІДПИСАНИХ порогах
  try {
    const ledger = JSON.parse(fs.readFileSync(path.join(__dirname, 'thresholds.ledger.json'), 'utf8'));
    if (rep.thresholdsSha !== ledger.sha) {
      return { ok: false, why: `ПОРОГИ ЗМІНЕНО без підпису (report.thresholdsSha ≠ ledger v${ledger.version}). Зміна порога = запис у THRESHOLD-CHANGELOG.md + підпис Єгора + оновлення hooks/thresholds.ledger.json + пере-калібрація` };
    }
  } catch (e) { return { ok: false, why: 'thresholds.ledger.json відсутній/битий у hooks/ — відновити з підписаної версії' }; }
  return { ok: true, why: `свіжий pass v2 (${Math.round(ageMs / 60000)}хв, inputsHash збіг, ${ran.size} вимірів)`, uncheckedCount: rep.uncheckedCount || 0, uncheckedDims: [...new Set((rep.unchecked || []).map((u) => u.dimension))] };
}

// ── Читання останньої відповіді асистента (той самий патерн, що success-claim-gate) ──
function lastAssistantText(input) {
  if (typeof input.last_assistant_message === 'string' && input.last_assistant_message.trim()) {
    return input.last_assistant_message;
  }
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
          return content.map((c) => (typeof c === 'string' ? c : (c && c.text) || '')).join('\n');
        }
      }
    } catch (_) {}
  }
  return '';
}

// ── Поточний резолвлений IP машини ────────────────────────────────────────
function currentIp() {
  for (const iface of ['en0', 'en1', 'en2']) {
    try {
      const ip = execSync(`ipconfig getifaddr ${iface}`, { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString().trim();
      if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) return ip;
    } catch (_) {}
  }
  return null;
}

// ── Дістати всі host-и з localhost/LAN-посилань у тексті ──────────────────
// Повертає масив { host, url }. Ігнорує зовнішні домени (springs.estate, claude.ai, github…).
function localLinkHosts(text) {
  const out = [];
  const re = /https?:\/\/([^\/\s)"'<>]+)(?::(\d+))?[^\s)"'<>]*/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    const url = m[0];
    let host = m[1];
    // прибрати можливий :port якщо він потрапив у host (regex уже це розділяє, але про всяк)
    host = host.replace(/:\d+$/, '').toLowerCase();
    const isLocalish =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.endsWith('.local') ||
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(host);
    if (isLocalish) out.push({ host, url });
  }
  return out;
}

// ── Main ───────────────────────────────────────────────────────────────────
try {
  let raw = '';
  try { raw = fs.readFileSync(0, 'utf8'); } catch (_) { process.exit(0); }
  if (!raw.trim()) process.exit(0);

  let input;
  try { input = JSON.parse(raw); } catch (_) { process.exit(0); }

  const text = lastAssistantText(input);
  if (!text) process.exit(0);

  const hosts = localLinkHosts(text);
  if (hosts.length === 0) process.exit(0); // немає localhost/LAN-посилань — гейт не стосується

  const ip = currentIp();

  const badLocal = hosts.filter((h) => h.host.endsWith('.local'));
  const badLoopback = hosts.filter((h) => h.host === 'localhost' || h.host === '127.0.0.1');
  // застарілий/чужий IP: LAN-IP, що НЕ дорівнює поточному резолвленому
  const badStaleIp = ip
    ? hosts.filter((h) => /^(?:192\.168|10|172)\./.test(h.host) && h.host !== ip)
    : [];

  // ── S45 self-check gate: compare-URL атома вимагає свіжого self-check-report ──
  // Спрацьовує НЕЗАЛЕЖНО від IP-перевірки (навіть коректний IP блокується без звіту).
  // ЖОРСТКА суворість (Єгор): нема/старий/fail/mismatch → block.
  {
    const atomUrls = [];
    for (const h of hosts) {
      const id = atomIdFromUrl(h.url);
      if (id) atomUrls.push({ url: h.url, atomId: id });
    }
    const scProblems = [];
    const okReports = [];
    for (const a of atomUrls) {
      // (а) S45-d block-on-error: збій перевірки = БЛОК, не тихий fail-open
      let res;
      try { res = checkSelfReport(a.atomId); }
      catch (e) { res = { ok: false, why: 'checkSelfReport CRASH (' + e.message + ') — block-on-error, полагодь причину' }; }
      if (res.skip) continue;      // не наш атом (нема каталогу) — це правило пропускає
      if (!res.ok) scProblems.push({ ...a, why: res.why });
      else okReports.push({ ...a, ...res });
    }
    // (г) S45-d UNCHECKED-маркер-примус: якщо у звіті є unchecked-виміри, поруч з URL
    // в тексті відповіді МУСИТЬ стояти токен UNCHECKED з іменами вимірів (щоб зелене
    // не приспало око Єгора; смуга-2 не сміє помирати тихо)
    for (const r of okReports) {
      if (r.uncheckedCount > 0) {
        const hasToken = /UNCHECKED/i.test(text) && r.uncheckedDims.some((d) => text.includes(d));
        if (!hasToken) scProblems.push({ ...r, why: `у звіті ${r.uncheckedCount} UNCHECKED-вимірів (${r.uncheckedDims.join(', ')}) — додай поруч з URL текст "UNCHECKED: ${r.uncheckedDims.join(', ')}" щоб Єгор бачив що судить його око` });
      }
    }
    if (scProblems.length > 0) {
      const lines = scProblems
        .map((s) => `  • ${s.atomId}: ${s.why}\n    ${s.url}`)
        .join('\n');
      const reason =
        'G-SELFCHECK (CLAUDE.md B18): compare-URL атома без валідного self-check-report — ' +
        'ЗАБОРОНЕНО показувати Єгору недороблене й чекати поки він зловить око (корінь: ' +
        'wellness брав 7 ітерацій, S45).\n\n' +
        'Правило: для КОЖНОГО atomId у посиланні має існувати self-check-report.json ' +
        'поруч з атомом — свіжий (<30хв), pass:true, atomId збіг. Суворість ЖОРСТКА: ' +
        'нема звіту → нема відповіді.\n\n' +
        'Проблеми:\n' + lines + '\n\n' +
        'Дій: 1) переконайся сервер :8879 живий; 2) запусти для кожного атома\n' +
        '   node scripts/self-check.mjs --atom <id>\n' +
        '   (з ~/Downloads/award-re-springs, PLAYWRIGHT_FROM=.../smarts/package.json);\n' +
        '3) якщо self-check FAIL — полагодь атом (не звіт), перезапусти; 4) лише зі свіжим ' +
        'pass давай compare-URL. Пам\'ять: verify-dont-agree-analyze-every-frame.';
      process.stdout.write(JSON.stringify({ decision: 'block', reason }));
      process.exit(0);
    }
  }

  const problems = [...badLocal, ...badLoopback, ...badStaleIp];
  if (problems.length === 0) process.exit(0); // усі посилання = поточний IP → ок

  const uniq = [...new Set(problems.map((p) => p.url))].slice(0, 6);
  const ipLine = ip
    ? `Поточний резолвлений IP машини = ${ip}. Дай посилання як http://${ip}:<port>/...`
    : 'Не вдалось резолвити поточний IP (ipconfig getifaddr en0/en1). Зарезолв вручну і встав його.';

  const reason =
    'G-LINK LinkIpGate: у відповіді є посилання на локальний прототип через ' +
    'mac hostname `.local`, `localhost/127.0.0.1`, або ЗАСТАРІЛИЙ/чужий IP — Єгору ' +
    'вони НЕ відкриваються (ERR_NAME_NOT_RESOLVED / недосяжний хост).\n\n' +
    'Пряма вказівка Єгора: НІКОЛИ не давати .local і не хардкодити IP — щоразу ' +
    'РЕЗОЛВИТИ поточний IP і давати його.\n\n' +
    ipLine + '\n\n' +
    'Проблемні посилання:\n  ' + uniq.join('\n  ') + '\n\n' +
    'Перевір сервер живий: curl -s -o /dev/null -w "%{http_code}" http://<ip>:<port>/ (== 200), ' +
    'потім перепиши посилання у відповіді з поточним IP. Пам\'ять: always-post-links-in-chat.';

  process.stdout.write(JSON.stringify({ decision: 'block', reason }));
  process.exit(0);
} catch (_) {
  process.exit(0); // fail-open
}
