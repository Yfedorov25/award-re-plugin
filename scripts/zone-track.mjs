#!/usr/bin/env node
/*
  zone-track.mjs — CLI зонного треку v2 по LIVE-відео (план ради S47, крок 2; Етап 0 протоколу).

  «Правильна відповідь лежить у файлі ДО написання CHOREO»: цей інструмент кладе
  reference/<name>.zonetrack.json з вердиктами-кандидатами per зона × вікно + класом механіки
  З LIVE. CHOREO-CLAIMS далі МУСИТЬ цитувати ці числа (src=zonetrack:...), а structure-parity
  у self-check порівнює наш render(p) проти ЦИХ live-токенів у EVENT-домені.

  Зони: reference/zones.json — ВРУЧНУ прямокутники З LIVE-КАДРУ:
    { "declaredFrom": "<кадр/опис>",
      "cuts": { "topPct": <site-chrome+status зверху, % кадру>, "botPct": <URL-бар знизу> },
      "zones": [ { "id": "title", "rectPct": [x0,y0,x1,y1], "note": "..." } ] }
  rectPct = % КОНТЕНТ-області (між cuts) — так live і наш render в одній системі координат.

  UNKNOWN = fail-closed: exit 1 + вердикт у файлі; це автоматичний борд-блокер (не самооцінка).

  node scripts/zone-track.mjs --atom amenities-ivy [--fps 12]
  node scripts/zone-track.mjs --video <path.mp4> --zones <zones.json> [--out <path>]
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadThresholds } from './self-check.mjs';
import { framesFromVideo, extractTrack, computeZoneWindows, verdictsForWindows,
  tokens, classifyMechanic, shaFile } from './lib/zonetrack.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const argVal = (f, d) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };

const atomId = argVal('--atom');
let video = argVal('--video'), zonesPath = argVal('--zones'), outPath = argVal('--out');
if (atomId) {
  const rdir = path.join(REPO, 'library/techniques/atoms', atomId, 'reference');
  video ??= fs.existsSync(rdir) ? (f => f ? path.join(rdir, f) : null)(fs.readdirSync(rdir).find(f => /\.(mp4|mov|webm)$/i.test(f))) : null;
  zonesPath ??= path.join(rdir, 'zones.json');
}
if (!video || !fs.existsSync(video)) { console.error('zone-track: нема live-відео (--video або atoms/<id>/reference/*.mp4)'); process.exit(2); }
if (!zonesPath || !fs.existsSync(zonesPath)) { console.error(`zone-track: нема zones.json (${zonesPath}) — оголоси зони прямокутниками З LIVE-КАДРУ`); process.exit(2); }
outPath ??= video.replace(/\.[^.]+$/, '') + '.zonetrack.json';

const thr = loadThresholds();
if (thr.error) { console.error('zone-track:', thr.error); process.exit(2); }
const { TH } = thr;
const FPS = +argVal('--fps', 12);

const zonesDecl = JSON.parse(fs.readFileSync(zonesPath, 'utf8'));
const { frames, tmpdir } = framesFromVideo(video, { fps: FPS });
console.log(`zone-track ▸ ${path.basename(video)}: ${frames.length} кадрів @${FPS}fps, зон ${zonesDecl.zones.length}`);

const track = extractTrack(frames, zonesDecl, TH);
const windows = computeZoneWindows(frames, track, TH);
const verdicts = verdictsForWindows(frames, track, windows, TH);
// liveScope [t0Frac,t1Frac]: частка ролика що мапиться на render(p) 0..1 нашого атома
// (ролик навмисно ширший за атом — прологи/епілоги сусідів; scope декларується у zones.json
// з src-обґрунтуванням і видимий верифікатору). Без scope = весь ролик.
let scopeFrames = null, verdictsScoped = null;
if (zonesDecl.liveScope) {
  const [a, b] = zonesDecl.liveScope.range;
  scopeFrames = [Math.round(a * frames.length), Math.round(b * frames.length)];
  verdictsScoped = verdicts.filter(v => v.f0 < scopeFrames[1] && v.f1 > scopeFrames[0]);
}
const body = verdictsScoped ?? verdicts;               // тіло атома: клас/токени/UNKNOWN судяться в scope
const toks = tokens(body);
const toksScoped = verdictsScoped ? toks : null;
const mech = classifyMechanic(body, track, TH);
fs.rmSync(tmpdir, { recursive: true, force: true });

const unknowns = body.filter(v => v.verdict === 'UNKNOWN');
const out = {
  tool: 'zone-track.mjs', version: 1, ts: new Date().toISOString(),
  video: path.basename(video), videoSha: shaFile(video), zonesSha: shaFile(zonesPath),
  fps: FPS, frames: frames.length, thresholdsSha: thr.sha,
  cuts: zonesDecl.cuts, zones: zonesDecl.zones,
  liveScope: zonesDecl.liveScope || null, scopeFrames,
  windows, verdicts, verdictsScoped, tokens: verdictsScoped ? tokens(verdicts) : toks,
  tokensScoped: toksScoped, mechanicClass: mech,
  unknownCount: unknowns.length,
  note: 'вердикти-кандидати З LIVE (закритий словник). CHOREO-CLAIMS цитує ці числа (src=zonetrack:...). UNKNOWN = автоматичний борд-блокер Єгору. Порівняння з нашим render — ТІЛЬКИ EVENT-домен (structure-parity).',
};
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));

for (const v of verdicts) {
  const n = v.numbers;
  const extra = v.inkEvent ? `ink=${n.ink.join('→')} (ink-подія)` :
    n.accumulated ? `frontEnd=${n.frontEnd} (накопичений шов через ${v.f1 - v.f0} кадрів)` :
    `drift=${n.driftPct}% page=${n.pagePct}% bands=${n.bandsFrac} grid=${n.gridDist} ink=${n.ink.join('→')} conf=${n.confMin}`;
  console.log(`  f${String(v.f0).padStart(3)}-f${String(v.f1).padEnd(3)} t${(v.f0 / FPS).toFixed(1)}-${(v.f1 / FPS).toFixed(1)}s  ${v.zone.padEnd(8)} ${(v.verdict + (v.dir ? ':' + v.dir : '') + (v.movePct ? ` ${v.movePct}%` : '') + (v.pageLocked === true ? ' (page-locked)' : '')).padEnd(26)} ${extra}${v.reason ? '  ⚠️ ' + v.reason : ''}`);
}
console.log(`\n  клас механіки З LIVE: ${mech.class}  (${mech.evidence.join('; ')})`);
console.log(`  токени: ${JSON.stringify(toks.seq)}`);
console.log(`  → ${path.relative(process.cwd(), outPath)}`);
if (unknowns.length) { console.log(`\n  🔴 UNKNOWN ×${unknowns.length} — fail-closed: борд-блокер Єгору (зони/вікна цих вердиктів судить око)`); process.exit(1); }
