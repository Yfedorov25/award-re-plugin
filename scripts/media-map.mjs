// media-map.mjs — карта всіх Vimeo-оригіналів springs.estate + скачування еталонів.
// Продукт вердикту KAI/PIPELINE-10X-VERDICT.md (сесія A, S56).
//
// Що робить:
//   1. curl по сторінках сайту, витягує всі player.vimeo.com/video/<ID> з контекстом
//      (секція media/<page>/<N.name>, брейкпоінт desktop/mobile з класів is-hidden--*);
//   2. мапить ID на атоми (таблиця ATOM_MAP, звірена вручну S56 по заголовках секцій);
//   3. качає оригінали в library/techniques/atoms/<atom>/reference/ через yt-dlp
//      (формат динамічний, best[height<=1080], referer обовʼязковий);
//   4. пише library/techniques/atoms/media-map.json (карта + ffprobe кожного файлу).
//
// 🔴 ПРАВОВА МЕЖА (ATOM-PROTOCOL): скачане = чужий контент, живе ЛИШЕ в reference/
// як еталон для ока і вимірників. У білд, на борди, у деплой НІКОЛИ.
// reference/*.mp4 вже у .gitignore, у git ці файли не потрапляють.
//
// Запуск:  node scripts/media-map.mjs            (карта + скачування відсутніх)
//          node scripts/media-map.mjs --map-only (лише карта, без скачувань)
// Кадри з еталона діставати ТІЛЬКИ через -vf fps=12 (пастка live-video-fps-trap).

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ATOMS = join(ROOT, 'library/techniques/atoms');
const SITE = 'https://springs.estate';
const PAGES = ['', 'infrastructure', 'location', 'design', 'flats', 'about', 'gallery', 'visual-search'];
const MAP_ONLY = process.argv.includes('--map-only');

// ID → місце призначення. Звірено S56 по заголовках live-секцій:
//   /infrastructure 2.video = Wellness-центр (заголовок "Where Change Becomes Art",
//   список: басейн/фітнес/бʼюті/хамам — це і є монтажні склейки swim-картки);
//   7.forest = "Private Forest Land". location 2.video = відео секції локації.
// download:false = лише в карту (селектор /visual-search, 21 кліп, не в скоупі атомів).
const ATOM_MAP = {
  '1086359033': { atom: 'amenities-wellness', file: 'wellness-orig-mobile.mp4', note: 'infra 2.video mobile 9:16; ймовірно ЦЕЙ кліп грає і в картці swim (склейки бігун/руки/плавчиня/вода) — перевірити кадрами' },
  '1086359103': { atom: 'amenities-wellness', file: 'wellness-orig-desktop.mp4', note: 'infra 2.video desktop 16:9' },
  '1086359261': { atom: 'amenities-forest', file: 'forest-orig-mobile.mp4', note: 'infra 7.forest mobile 9:16' },
  '1086359303': { atom: 'amenities-forest', file: 'forest-orig-desktop.mp4', note: 'infra 7.forest desktop 16:9' },
  '1086359332': { atom: 'location-section', file: 'location-orig-mobile.mp4', note: 'location 2.video mobile 9:16' },
  '1086359361': { atom: 'location-section', file: 'location-orig-desktop.mp4', note: 'location 2.video desktop 16:9' },
  '1086359012': { atom: '_media-reference', file: 'home-nature-orig-square.mp4', note: 'home landing 3.nature, квадрат 1:1' },
  '1044257468': { atom: '_media-reference', file: 'home-place-sticky-1-orig.mp4', note: 'home PLACE sticky 1 (data-scroll-target l-place-sticky-1)' },
  '1044257440': { atom: '_media-reference', file: 'home-place-sticky-2-orig.mp4', note: 'home PLACE sticky 2' },
  '1086358928': { atom: '_media-reference', file: 'home-place-sticky-3-orig.mp4', note: 'home PLACE sticky 3' },
};

const fetchPage = (path) => {
  try { return execFileSync('curl', ['-s', '--max-time', '30', `${SITE}/${path}`], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 }); }
  catch { return ''; }
};

const found = new Map(); // id → { pages:[], sections:Set, breakpoints:Set }
for (const p of PAGES) {
  const html = fetchPage(p);
  const re = /player\.vimeo\.com\/video\/(\d+)/g;
  let m;
  while ((m = re.exec(html))) {
    const id = m[1];
    const before = html.slice(Math.max(0, m.index - 800), m.index);
    const sec = [...before.matchAll(/media\/[a-z-]+\/(\d+\.[a-z-]+)/g)].at(-1)?.[1]
      ?? [...html.slice(0, m.index).matchAll(/media\/[a-z-]+\/(\d+\.[a-z-]+)/g)].at(-1)?.[1] ?? '?';
    const bp = /is-hidden--sm-down/.test(before.slice(-300)) ? 'desktop'
      : /is-hidden--md-up/.test(before.slice(-300)) ? 'mobile' : 'both';
    const rec = found.get(id) ?? { pages: new Set(), sections: new Set(), breakpoints: new Set() };
    rec.pages.add('/' + p); rec.sections.add(sec); rec.breakpoints.add(bp);
    found.set(id, rec);
  }
}

const probe = (file) => {
  try {
    const out = execFileSync('ffprobe', ['-v', 'quiet', '-print_format', 'json', '-show_streams', '-show_format', file], { encoding: 'utf8' });
    const j = JSON.parse(out); const v = (j.streams || []).find(s => s.codec_type === 'video') || {};
    return { w: v.width, h: v.height, fps: v.avg_frame_rate, dur: +(+j.format?.duration || 0).toFixed(1) };
  } catch { return null; }
};

const map = [];
let dl = 0, skip = 0, fail = 0;
for (const [id, rec] of [...found.entries()].sort()) {
  const dest = ATOM_MAP[id];
  const entry = {
    id,
    pages: [...rec.pages], sections: [...rec.sections], breakpoints: [...rec.breakpoints],
    url: `https://player.vimeo.com/video/${id}?background=1`,
    atom: dest?.atom ?? (rec.pages.has('/visual-search') ? 'visual-search (не качаємо, поза скоупом атомів)' : 'НЕЗМАПЛЕНО'),
    file: dest ? join('library/techniques/atoms', dest.atom, 'reference', dest.file) : null,
    note: dest?.note ?? null,
  };
  if (dest && !MAP_ONLY) {
    const abs = join(ATOMS, dest.atom, 'reference', dest.file);
    mkdirSync(dirname(abs), { recursive: true });
    if (existsSync(abs)) { skip++; }
    else {
      console.log(`↓ ${id} → ${dest.atom}/reference/${dest.file}`);
      try {
        // Формат ДИНАМІЧНИЙ: у Vimeo-background лише роздільні відео/аудіо HLS-потоки
        // (комбінованого "best" нема), а портретні кліпи мають height 1920 — тому
        // bv*+ba з сортуванням res:1080 (кап по меншій стороні), злиття в mp4.
        execFileSync('python3', ['-m', 'yt_dlp', '--referer', `${SITE}/`,
          '-f', 'bv*+ba/bv*/b', '-S', 'res:1080', '--merge-output-format', 'mp4',
          entry.url, '-o', abs, '--no-progress', '-q'], { stdio: 'inherit', timeout: 300000 });
        dl++;
      } catch (e) { console.error(`  ПРОВАЛ ${id}: ${e.message}`); fail++; }
    }
    entry.probe = probe(abs);
  }
  map.push(entry);
}

const out = { generated: 'S56 media-map', site: SITE, count: map.length, legal: 'reference-only етало́н; у білд/борд/деплой НІКОЛИ', videos: map };
writeFileSync(join(ATOMS, 'media-map.json'), JSON.stringify(out, null, 2));
console.log(`\nКарта: ${map.length} ID (${map.filter(v => v.file).length} до атомів, решта map-only).`);
console.log(`Скачано ${dl}, вже було ${skip}, провалів ${fail}. → atoms/media-map.json`);
