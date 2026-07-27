#!/usr/bin/env node
// interaction-check (S54) — СМУГА ХАРНЕСА ДЛЯ TAP-АТОМІВ (рішення Єгора S54).
//
// НАВІЩО. Увесь харнес судить лише scroll-атоми з чистою `render(p)`: свіп p → скріншоти →
// zone-track. Атоми, де закон драйвиться ТАПОМ (terraces hotspot, forest arrow-cycle), під це
// не підпадають у принципі. Ретрофіт scroll-гейтів на них дає ХИБНЕ ЗЕЛЕНЕ: у forest, наприклад,
// `render(p)` це ШИМ `p<0.34?0:(p<0.67?1:2)`, і гейт судив би шим, а не закон.
//
// ЩО СУДИТЬ ЦЯ СМУГА (три виміри, усі — про закон, не про пікселі):
//   1. reachability  — кожен оголошений стан ДОСЯЖНИЙ заявленою дією, без console-error;
//   2. state-diff    — стан РЕАЛЬНО відрізняється від дефолту (ознака: частка змінених пікселів
//                      у смузі медіа-зони ≥ порога) — інакше «тап нічого не робить» пройшов би;
//   3. toggle/return — повторна та сама дія (або дія-закриття) ПОВЕРТАЄ у дефолт
//                      (той самий кадр у межах допуску) — це і є закон toggle.
// Порівняння з LIVE тут НЕ робиться: у live-відео стани зняті рукою в довільні моменти, і
// прив'язка кадрів була б ручною декларацією, тобто підгонкою. Ідентичність станів live↔наш
// судить ОКО Єгора на компараторі. Ця смуга ловить СТАРІ КЛАСИ БАГІВ: мертвий тап, стан-двійник,
// зламаний toggle.
//
//   node scripts/interaction-check.mjs --atom amenities-terraces
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';

const REPO = path.resolve(import.meta.dirname, '..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };

function gray(png, w = 234) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ic-'));
  const o = path.join(tmp, 'a.pgm');
  execSync(`ffmpeg -y -v error -i "${png}" -vf "scale=${w}:-2,format=gray" "${o}"`);
  const b = fs.readFileSync(o); fs.rmSync(tmp, { recursive: true, force: true });
  let p = 0, tok = [];
  while (tok.length < 4) {
    while (b[p] === 32 || b[p] === 10 || b[p] === 13 || b[p] === 9) p++;
    let s = p; while (b[p] !== 32 && b[p] !== 10 && b[p] !== 13 && b[p] !== 9) p++;
    tok.push(b.toString('ascii', s, p));
  }
  p++;
  return { w: +tok[1], h: +tok[2], data: b.subarray(p) };
}
// частка пікселів, що змінились більше ніж на tol, у смузі [y0..y1]
function changedFrac(A, B, y0, y1, tol = 12) {
  let n = 0, c = 0;
  for (let y = y0; y < y1; y++) for (let x = 0; x < A.w; x++) {
    n++; if (Math.abs(A.data[y * A.w + x] - B.data[y * B.w + x]) > tol) c++;
  }
  return c / n;
}

const atomId = arg('--atom');
if (!atomId) { console.error('потрібен --atom <id>'); process.exit(2); }
const adir = path.join(REPO, 'library/techniques/atoms', atomId);
const cfg = JSON.parse(fs.readFileSync(path.join(adir, 'self-check.config.json'), 'utf8'));
if (!cfg.interaction) {
  console.error(`config.interaction відсутній у ${atomId} — оголоси стани (states[] з sel/act) і band`);
  process.exit(2);
}
const IC = cfg.interaction;
const TH = { stateDiffMin: IC.stateDiffMin ?? 0.03, returnDiffMax: IC.returnDiffMax ?? 0.01 };

const req = createRequire(pathToFileURL(process.env.PLAYWRIGHT_FROM || '/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json'));
const { chromium } = req('playwright');
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const page = await ctx.newPage();
const errs = [];
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
page.on('pageerror', e => errs.push(String(e)));
await page.goto(`http://localhost:8879/atoms/${atomId}/${cfg.url}`, { waitUntil: 'networkidle' });

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'icshot-'));
const shot = async (name) => { const p = path.join(tmp, name + '.png'); await page.screenshot({ path: p }); return p; };
const reset = async () => { if (IC.resetSel) await page.click(IC.resetSel, { force: true }).catch(() => {}); await page.waitForTimeout(IC.settleMs ?? 600); };

await reset();
const base = gray(await shot('default'));
const band = { y0: Math.round((IC.band?.[0] ?? 0.10) * base.h), y1: Math.round((IC.band?.[1] ?? 0.90) * base.h) };
console.log(`interaction-check ▸ ${atomId}   станів ${IC.states.length}, смуга ${band.y0}..${band.y1} з ${base.h}`);

const results = [];
for (const st of IC.states) {
  await reset();
  let reach = true;
  try { await page.click(st.sel, { force: true }); } catch (e) { reach = false; }
  await page.waitForTimeout(IC.settleMs ?? 600);
  const f = gray(await shot('s_' + st.id));
  const d = changedFrac(base, f, band.y0, band.y1);
  // toggle: повторна та сама дія (або дія-закриття) мусить повернути у дефолт
  try { await page.click(st.closeSel || st.sel, { force: true }); } catch (_) {}
  await page.waitForTimeout(IC.settleMs ?? 600);
  const back = gray(await shot('b_' + st.id));
  const dBack = changedFrac(base, back, band.y0, band.y1);
  const okReach = reach, okDiff = d >= TH.stateDiffMin, okBack = dBack <= TH.returnDiffMax;
  results.push({ id: st.id, reach: okReach, diff: d, back: dBack, pass: okReach && okDiff && okBack });
  console.log(`  ${okReach && okDiff && okBack ? '✓' : '✗'} ${st.id.padEnd(12)} досяжний:${okReach ? 'так' : 'НІ'} · відмінність від дефолту ${(d * 100).toFixed(1)}% (треба ≥${TH.stateDiffMin * 100}%) · повернення ${(dBack * 100).toFixed(1)}% (треба ≤${TH.returnDiffMax * 100}%)`);
}
// стани мусять відрізнятись ОДИН ВІД ОДНОГО, а не лише від дефолту
for (let i = 0; i < IC.states.length; i++) for (let j = i + 1; j < IC.states.length; j++) {
  const A = gray(path.join(tmp, 's_' + IC.states[i].id + '.png')), B = gray(path.join(tmp, 's_' + IC.states[j].id + '.png'));
  const d = changedFrac(A, B, band.y0, band.y1);
  const ok = d >= TH.stateDiffMin;
  if (!ok) results.push({ id: `${IC.states[i].id}≠${IC.states[j].id}`, pass: false, diff: d });
  console.log(`  ${ok ? '✓' : '✗'} ${IC.states[i].id} ≠ ${IC.states[j].id}: ${(d * 100).toFixed(1)}%`);
}
console.log(`  ${errs.length === 0 ? '✓' : '✗'} console-error: ${errs.length}`);
await b.close(); fs.rmSync(tmp, { recursive: true, force: true });

const pass = results.every(r => r.pass !== false) && errs.length === 0;
fs.writeFileSync(path.join(adir, 'interaction-report.json'),
  JSON.stringify({ atomId, ts: new Date().toISOString(), pass, thresholds: TH, results, consoleErrors: errs }, null, 1));
console.log(`  ${pass ? 'INTERACTION PASS ✅' : 'INTERACTION FAIL ❌'}  → ${atomId}/interaction-report.json`);
console.log('  🟡 ІДЕНТИЧНІСТЬ станів live↔наш ця смуга НЕ судить — це око Єгора на компараторі.');
process.exit(pass ? 0 : 1);
