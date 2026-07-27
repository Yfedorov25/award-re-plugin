#!/usr/bin/env node
/*
  dense-layers.mjs — ГУСТА покадрова серія шарів (ATOM-PROTOCOL Етап 1a-0, v3 після S49).

  Корінь S49 (ivy): ТЗ будувалось з вердиктів zone-track, а вікна вердиктів ріжуться по
  паузах РУКИ Єгора → «докрутка стосу» виявилась ХВОСТОМ в'їзду картки. Ліки: перед CHOREO
  зняти ТРАЄКТОРІЇ (кожен кадр × кожен видимий шар: top%/width%) і виводити закон руху З НИХ.

  Сегментація: у кожному кадрі по рядках рахується ширина не-фонового сегмента (фон =
  bgRGB із zones.json або cuts-ґаттер); краї шарів = стійкі стрибки ширини (шар стосу
  вужчий/ширший за сусіда). Це САМЕ той вимір, що зловив закон ivy (324 кадри, S49-b).

  node scripts/dense-layers.mjs --atom amenities-ivy [--fps 12] [--bg 244,227,202]
    → reference/dense-layers.json + консольний дамп кожного 2-го кадру
*/
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '..');
const argVal = (f, d) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };

const atomId = argVal('--atom');
if (!atomId) { console.error('dense-layers: вкажи --atom <id>'); process.exit(2); }
const rdir = path.join(REPO, 'library/techniques/atoms', atomId, 'reference');
const video = (f => f ? path.join(rdir, f) : null)(fs.existsSync(rdir) ? fs.readdirSync(rdir).find(f => /\.(mp4|mov|webm)$/i.test(f)) : null);
if (!video) { console.error('dense-layers: нема reference/*.mp4'); process.exit(2); }
const zonesPath = path.join(rdir, 'zones.json');
const zonesDecl = fs.existsSync(zonesPath) ? JSON.parse(fs.readFileSync(zonesPath, 'utf8')) : null;

const FPS = +argVal('--fps', 12);
const W = 585;
const bgArg = argVal('--bg', zonesDecl?.bgRGB?.join(',') || '244,227,202');
const BG = bgArg.split(',').map(Number);
const BG_TOL = 75;              // сумарна |Δrgb| до фону
const MIN_W = 50;               // мінімальна ширина шару, px @585
const EDGE_JUMP = 10;           // стрибок ширини = межа шару
const Y0 = 0.30, Y1 = 0.96;     // діапазон сканування, частка кадру

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dl-'));
execSync(`ffmpeg -y -i "${video}" -vf fps=${FPS},scale=${W}:-2 "${tmp}/f_%04d.png" -loglevel error`);
const files = fs.readdirSync(tmp).filter(f => f.endsWith('.png')).sort();
console.log(`dense-layers ▸ ${path.basename(video)}: ${files.length} кадрів @${FPS}fps, фон rgb(${BG})`);

function layersOf(png){
  const raw = execSync(`ffmpeg -i "${png}" -f rawvideo -pix_fmt rgb24 - -loglevel error`, { maxBuffer: 64 * 1024 * 1024 });
  const H = raw.length / (W * 3);
  const prof = [];
  for (let y = Math.round(H * Y0); y < H * Y1; y += 3) {
    let l = null, r = null;
    for (let x = 10; x < W - 10; x++) {
      const o = (y * W + x) * 3;
      if (Math.abs(raw[o] - BG[0]) + Math.abs(raw[o + 1] - BG[1]) + Math.abs(raw[o + 2] - BG[2]) > BG_TOL) { if (l === null) l = x; r = x; }
    }
    prof.push({ y, w: l === null ? 0 : r - l });
  }
  const out = [];
  let prevW = 0;
  for (let i = 0; i < prof.length; i++) {
    const { y, w } = prof[i];
    if (w - prevW > EDGE_JUMP && w > MIN_W) {
      const stable = prof.slice(i + 1, i + 4).every(p => Math.abs(p.w - w) < EDGE_JUMP + 2);
      if (stable) out.push({ topPct: +(y / H * 100).toFixed(1), wFrac: +(w / (W * 0.846)).toFixed(3) });
    }
    prevW = w;
  }
  return out;
}

const frames = files.map((f, i) => ({ f: i + 1, layers: layersOf(path.join(tmp, f)) }));
fs.rmSync(tmp, { recursive: true, force: true });

const out = { tool: 'dense-layers.mjs', ts: new Date().toISOString(), video: path.basename(video),
  fps: FPS, bgRGB: BG, note: 'ТЗ виводити З ЦИХ траєкторій (ATOM-PROTOCOL 1a-0); вердикти zone-track = лише індекс подій-кандидатів; питання до кожної події: «механіка чи пауза руки?»',
  frames };
fs.writeFileSync(path.join(rdir, 'dense-layers.json'), JSON.stringify(out));
for (const r of frames) if (r.f % 2 === 0)
  console.log(`  f${String(r.f).padStart(4)} ${r.layers.slice(0, 4).map(l => `${l.topPct}%/${l.wFrac}`).join('  ')}`);
console.log(`  → ${path.relative(process.cwd(), path.join(rdir, 'dense-layers.json'))}`);
