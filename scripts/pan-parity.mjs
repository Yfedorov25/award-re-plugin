#!/usr/bin/env node
// pan-parity ГЕЙТ (S54) — горизонтальна парність наш ↔ live.
//
//   node scripts/pan-parity.mjs --atom amenities-parking
//   node scripts/pan-parity.mjs --atom amenities-parking --seq <dir>   # прогнати чужу секвенцію
//   node scripts/pan-parity.mjs --control                              # контроль на ВІДОМІЙ відповіді
//
// ДВІ УМОВИ (обидві з таблиці розділення, не з голови):
//   1. G-парність: |G_наш − G_live| / G_live ≤ panGainTol   («зала відкривається так само»)
//   2. Хід правого краю: sR_наш ≥ sR_live − panReachTol      («правий край доїжджає»)
// ТАБЛИЦЯ РОЗДІЛЕННЯ на ВІДОМІЙ відповіді ока Єгора (parking, 5 збірок × той самий код):
//   live         sL 0.65 · sR 2.16 · G ×1.51   — ціль
//   C (обрана)   sL 1.43 · sR 2.96 · G ×1.53   ✅ обидві умови
//   B            sL 0.61 · sR 1.98 · G ×1.37   ✅ обидві умови
//   A (0.66)     sL 1.16 · sR 2.11 · G ×0.95   🔴 умова 1 (зала не відкривається)
//   0.19 (відк.) sL 0.72 · sR 1.65 · G ×0.93   🔴 обидві
//   0.00 (нег.)  sL 0.55 · sR 1.45 · G ×0.90   🔴 обидві  ← НЕГАТИВНИЙ ЕТАЛОН, мусить FAIL
// Розрив по G між «відкривається» і «повзе»: 0.95 … 1.37 — поріг 1.15 стоїть у середині.
// ⛔ sR НЕ гейтимо зверху: одиниця = ВЛАСНА стартова ширина збірки, тому тісніший старт дає
//    більший sR при тій самій фізиці. Зверху судить око на борді.
import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url';
import { grayFrames, grayFromImages, sceneWalk, panVerdict } from './lib/panparity.mjs';

const REPO = path.resolve(import.meta.dirname, '..');
// 🔒 Пороги ПІДПИСАНІ у thresholds.frozen.json v10 (S54, санкція Єгора в чаті) + ledger у
// plugin/hooks. Локальних чисел тут більше немає: змінити поріг можна лише двофайловим актом.
const { loadThresholds } = await import('./self-check.mjs');
const TH_ALL = loadThresholds().TH;
export const PAN_TH = {
  panGainTol: TH_ALL.panGainTol, panReachTol: TH_ALL.panReachTol,
  panOpensMin: TH_ALL.panOpensMin, panSlideMin: TH_ALL.panSlideMin,
};
for (const [k, v] of Object.entries(PAN_TH)) if (v === undefined) {
  console.error(`поріг ${k} відсутній у thresholds.frozen.json — підписний акт не застосовано`); process.exit(2);
}
// Смуга виміру береться з ОГОЛОШЕНОЇ media-зони атома (reference/zones.json), а не з
// фіксованих відсотків. S54: на ivy фіксована смуга 10-44% ловила зону ТЕКСТУ, а медіа-зона
// там лежить на 36-95% — гейт міряв не те і видав хибний борг.
// Всередині зони беремо 10-80% її висоти (краї зони шумлять на межах).
const ZONE_INSET = [0.10, 0.80];

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };

// rect у % КОНТЕНТ-області; для live контент = кадр мінус cuts, для нашого рендера cuts=0
function bandFromZone(hFrame, zd, isLive) {
  const media = (zd.zones || []).find(z => z.kind === 'media') || (zd.zones || [])[0];
  const [, ry0, , ry1] = media.rectPct;
  const t = isLive ? zd.cuts.topPct / 100 : 0, b = isLive ? zd.cuts.botPct / 100 : 0;
  const cH = 1 - t - b;
  const f = (r) => t + (r / 100) * cH;
  const z0 = f(ry0), z1 = f(ry1);
  const y0 = z0 + (z1 - z0) * ZONE_INSET[0], y1 = z0 + (z1 - z0) * ZONE_INSET[1];
  return { y0: Math.round(y0 * hFrame), y1: Math.round(y1 * hFrame), nb: 11, maxD: 40, _zone: media.id };
}

async function ourFrames(atomId, seqDir, cfg) {
  if (seqDir) {
    const list = fs.readdirSync(seqDir).filter(f => /\.(webp|png)$/.test(f)).sort().map(f => path.join(seqDir, f));
    return grayFromImages(list);
  }
  const req = createRequire(pathToFileURL(process.env.PLAYWRIGHT_FROM || '/Users/yehorfedorov/Downloads/eruhomist/apps/smarts/package.json'));
  const { chromium } = req('playwright');
  const b = await chromium.launch();
  const page = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })).newPage();
  await page.goto(`http://localhost:8879/atoms/${atomId}/${cfg.url}`, { waitUntil: 'networkidle' });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'panp-our-'));
  const [r0, r1] = cfg.pan.ourRange, N = cfg.pan.states || 44, pngs = [];
  for (let i = 0; i < N; i++) {
    await page.evaluate(v => window.render(v), r0 + (r1 - r0) * i / (N - 1));
    const p = path.join(tmp, `s_${String(i).padStart(3, '0')}.png`);
    await page.screenshot({ path: p }); pngs.push(p);
  }
  await b.close();
  const g = grayFromImages(pngs); fs.rmSync(tmp, { recursive: true, force: true }); return g;
}

async function main() {
  if (process.argv.includes('--control')) return control();
  const atomId = arg('--atom');
  if (!atomId) { console.error('потрібен --atom <id>'); process.exit(2); }
  const adir = path.join(REPO, 'library/techniques/atoms', atomId);
  const rdir = path.join(adir, 'reference');
  const zd = JSON.parse(fs.readFileSync(path.join(rdir, 'zones.json'), 'utf8'));
  const cfg = JSON.parse(fs.readFileSync(path.join(adir, 'self-check.config.json'), 'utf8'));
  if (!cfg.pan) { console.error('config.pan відсутній — оголоси фазу ходу камери (ourRange/liveFrames)'); process.exit(2); }
  const vid = fs.readdirSync(rdir).find(f => /\.(mp4|mov|webm)$/i.test(f));

  const lvAll = grayFrames(path.join(rdir, vid), { fps: 12 });
  const [lf0, lf1] = cfg.pan.liveFrames;
  const lv = { ...lvAll, files: lvAll.files.slice(lf0 - 1, lf1) };
  const h0 = lv.load(lv.files[0]);
  const bl = bandFromZone(h0.h, zd, true);
  const L = sceneWalk(lv, bl);
  fs.rmSync(lvAll.tmp, { recursive: true, force: true });

  const seqDir = arg('--seq');
  const ov = await ourFrames(atomId, seqDir, cfg);
  const o0 = ov.load(ov.files[0]);
  const O = sceneWalk(ov, bandFromZone(o0.h, zd, false));
  fs.rmSync(ov.tmp, { recursive: true, force: true });

  const vl = panVerdict(L, PAN_TH), vo = panVerdict(O, PAN_TH);
  const gainErr = Math.abs(vo.G - vl.G) / vl.G;
  const c1 = gainErr <= PAN_TH.panGainTol;
  const c2 = vo.sR >= vl.sR - PAN_TH.panReachTol;

  console.log(`pan-parity ▸ ${atomId}${seqDir ? ' (секвенція ' + seqDir + ')' : ''}  · смуга з media-зони «${bl._zone}»`);
  console.log(`  live : sL ${vl.sL.toFixed(2)} · sR ${vl.sR.toFixed(2)} · зала ×${vl.G.toFixed(2)} → ${vl.verdict}`);
  console.log(`  наш  : sL ${vo.sL.toFixed(2)} · sR ${vo.sR.toFixed(2)} · зала ×${vo.G.toFixed(2)} → ${vo.verdict}`);
  console.log(`  ${c1 ? '✓' : '✗'} G-парність: розбіжність ${(gainErr * 100).toFixed(1)}% (допуск ${PAN_TH.panGainTol * 100}%)`);
  console.log(`  ${c2 ? '✓' : '✗'} хід правого краю: sR ${vo.sR.toFixed(2)} ≥ ${(vl.sR - PAN_TH.panReachTol).toFixed(2)}`);
  console.log(`  ${c1 && c2 ? 'PAN-PARITY PASS ✅' : 'PAN-PARITY FAIL ❌'}  вердикт наш=${vo.verdict} live=${vl.verdict}`);
  process.exit(c1 && c2 ? 0 : 1);
}

// ── КОНТРОЛЬ на ВІДОМІЙ відповіді: синтетичне вікно з заданим ходом і заданим розширенням ──
function control() {

  console.log('КОНТРОЛЬ pan-parity (синтетичне вікно з ВІДОМИМ ходом):');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'panp-ctl-'));
  const rdir = path.join(REPO, 'library/techniques/atoms/amenities-parking/reference');
  const vid = fs.readdirSync(rdir).find(f => /\.(mp4|mov|webm)$/i.test(f));
  execSync(`ffmpeg -y -v error -i "${path.join(rdir, vid)}" -vf "select=eq(n\\,60),scale=1400:-2" -frames:v 1 "${tmp}/big.png"`);
  const cases = [
    { name: 'вікно ЇДЕ вправо 0.60, розмір сталий', win: i => ({ x: 120 + 300 * i / 24, w: 500 }), eL: 0.60, eR: 1.60, eG: 1.00 },
    { name: 'вікно СТОЇТЬ, ширшає ×1.50', win: i => ({ x: 400 - 125 * i / 24, w: 500 * (1 + 0.5 * i / 24) }), eL: -0.25, eR: 1.25, eG: 1.50 },
    { name: 'ЇДЕ 0.30 і ШИРШАЄ ×1.30', win: i => ({ x: 200 + 150 * i / 24, w: 500 * (1 + 0.3 * i / 24) }), eL: 0.30, eR: 1.60, eG: 1.30 },
  ];
  let ok = true;
  for (const c of cases) {
    const list = [];
    for (let i = 0; i < 25; i++) {
      const wi = c.win(i), o = `${tmp}/s_${String(i).padStart(2, '0')}.png`;
      execSync(`ffmpeg -y -v error -i "${tmp}/big.png" -vf "crop=${Math.round(wi.w)}:${Math.round(wi.w * 1266 / 585)}:${Math.round(wi.x)}:200,scale=468:1013" "${o}"`);
      list.push(o);
    }
    const g = grayFromImages(list);
    const r = sceneWalk(g, { y0: 101, y1: 446, nb: 11, maxD: 40 });
    fs.rmSync(g.tmp, { recursive: true, force: true });
    const l = r[r.length - 1];
    const pass = Math.abs(l.sL - c.eL) < 0.05 && Math.abs(l.sR - c.eR) < 0.05;
    if (!pass) ok = false;
    console.log(`  ${c.name}\n     очік sL ${c.eL.toFixed(2)} sR ${c.eR.toFixed(2)} G ×${c.eG.toFixed(2)}` +
      `  ·  вим sL ${l.sL.toFixed(2)} sR ${l.sR.toFixed(2)} G ×${l.G.toFixed(2)}  ${pass ? '✓' : '🔴'}`);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`  ⇒ ${ok ? '✅ ІНСТРУМЕНТ ЧЕСНИЙ' : '🔴 НЕ ВІРИТИ'}`);
  process.exit(ok ? 0 : 1);
}
main();
