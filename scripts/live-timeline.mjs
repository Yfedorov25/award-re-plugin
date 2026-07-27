#!/usr/bin/env node
/*
  live-timeline.mjs — розклад подій із LIVE-відео ПЕРЕД кодом (Етап C1, S45-d).

  Мета: той болючий покадровий розбір що робився вручну на wellness (156 кадрів око-в-око),
  тепер емітить машина: вікна руху + напрям шва + сигнатура wipe-знизу. Я далі мапую вікна
  на scroll-% (якорі) і транскрибую в expectations.json з src="live:fNN@TT.Ts".

  ЯК МІРЯЄ (без залежностей: ffmpeg → сірі PGM-кадри → Node парсить байти):
  - per-кадр-пара: |Δ| по рядках → motionMag (сума) + centroidY (де живе рух);
  - вікна: motionMag > adaptive-поріг (mean×0.9) ≥4 кадри поспіль;
  - напрям вікна: дрейф centroidY (вгору = шов їде вгору = wipe знизу-вгору);
  - bottomEntry: частка руху в нижніх 20% на старті вікна (сигнатура «нове вилазить знизу»).

  ⚠️ ЧЕСНІ МЕЖІ: це TIME-домен (секунди відео), НЕ scroll-% — мапінг на scroll робить людина
  через якорі (початок/кінець секції). Камерні пани всередині медіа теж дають рух: вікна це
  КАНДИДАТИ подій для ока, не готові expectations. Око дивиться кадри вікон і підтверджує.

  node scripts/live-timeline.mjs --video <path.mp4> [--fps 12]
  → <video>.timeline.json + консоль-таблиця
*/
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const argVal = (f, d) => { const i = process.argv.indexOf(f); return i >= 0 ? process.argv[i + 1] : d; };
const VIDEO = argVal('--video');
const FPS = +argVal('--fps', 12);
if (!VIDEO || !fs.existsSync(VIDEO)) { console.error('вкажи --video <path.mp4>'); process.exit(2); }

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'lt-'));
execSync(`ffmpeg -y -i "${VIDEO}" -vf fps=${FPS},scale=98:-2,format=gray "${tmp}/f_%04d.pgm" -loglevel error`);
const files = fs.readdirSync(tmp).filter(f => f.endsWith('.pgm')).sort();
if (files.length < 8) { console.error('замало кадрів: ' + files.length); process.exit(2); }

// P5 PGM: "P5\n<w> <h>\n<max>\n" + сирі байти
function readPGM(p){
  const buf = fs.readFileSync(p);
  let pos = 0, fields = [];
  while (fields.length < 4) {
    while (buf[pos] === 32 || buf[pos] === 10 || buf[pos] === 13 || buf[pos] === 9) pos++;
    let s = pos; while (pos < buf.length && buf[pos] > 32) pos++;
    fields.push(buf.toString('ascii', s, pos));
  }
  pos++; // один whitespace після maxval
  const w = +fields[1], h = +fields[2];
  return { w, h, data: buf.subarray(pos, pos + w * h) };
}

const frames = files.map(f => readPGM(path.join(tmp, f)));
const { w, h } = frames[0];

// per-пара: рух по рядках
const samples = [];
for (let i = 1; i < frames.length; i++) {
  const a = frames[i - 1].data, b = frames[i].data;
  let mag = 0, wsum = 0, bottomMag = 0;
  const bottomFrom = Math.floor(h * 0.8);
  for (let y = 0; y < h; y++) {
    let row = 0;
    const off = y * w;
    for (let x = 0; x < w; x++) row += Math.abs(a[off + x] - b[off + x]);
    row /= w;
    mag += row; wsum += row * y;
    if (y >= bottomFrom) bottomMag += row;
  }
  samples.push({ f: i, mag, centroid: mag > 0.5 ? wsum / mag : null, bottomFrac: mag > 0.5 ? bottomMag / mag : 0 });
}

// adaptive-поріг + вікна
const mean = samples.reduce((s, x) => s + x.mag, 0) / samples.length;
const thr = mean * 0.9;
const windows = [];
let run = [];
const flush = () => {
  if (run.length >= 4) {
    const cs = run.map(x => x.centroid).filter(x => x != null);
    const d = cs.length >= 2 ? cs[cs.length - 1] - cs[0] : 0;
    const dpx = d / h;
    windows.push({
      f0: run[0].f, f1: run[run.length - 1].f,
      t0: +(run[0].f / FPS).toFixed(2), t1: +(run[run.length - 1].f / FPS).toFixed(2),
      dir: dpx < -0.05 ? 'UP (знизу-вгору)' : dpx > 0.05 ? 'DOWN' : 'static/crossfade?',
      centroidDrift: +(dpx * 100).toFixed(1),
      bottomEntry: +(run[0].bottomFrac).toFixed(2),
      magAvg: +(run.reduce((s, x) => s + x.mag, 0) / run.length).toFixed(1),
    });
  }
  run = [];
};
for (const s of samples) { if (s.mag > thr) run.push(s); else flush(); }
flush();

const out = { video: path.basename(VIDEO), fps: FPS, frames: frames.length,
  durationS: +(frames.length / FPS).toFixed(1), adaptiveThr: +thr.toFixed(1), windows,
  note: 'TIME-домен: вікна = КАНДИДАТИ подій для ока; мапінг на scroll-% через якорі вручну. dir=UP + bottomEntry>0.3 = сигнатура wipe-знизу-вгору.' };
const outPath = VIDEO.replace(/\.[^.]+$/, '') + '.timeline.json';
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
fs.rmSync(tmp, { recursive: true, force: true });

console.log(`\nlive-timeline ▸ ${out.video} (${out.durationS}s @ ${FPS}fps, ${frames.length} кадрів)`);
console.log(`  вікна руху (поріг ${out.adaptiveThr}):`);
for (const win of windows) console.log(`  f${win.f0}-${win.f1}  ${win.t0}s-${win.t1}s  ${win.dir}  centroidDrift ${win.centroidDrift}%h  bottomEntry ${win.bottomEntry}`);
console.log(`  → ${path.relative(process.cwd(), outPath)}`);
console.log(`  ⚠️ вікна = кандидати; підтверди КОЖНЕ оком по кадрах (12fps+ montage), тоді в expectations з src="live:fNN@TTs"`);
