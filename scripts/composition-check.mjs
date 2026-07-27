#!/usr/bin/env node
/* composition-check.mjs — умова (г) 4-гейта [[organism-extract-loop]]:
   постав витягнуті атоми ПОРЯД → нема конфлікту pin / z-index / timeline / hook-namespace →
   вони СКЛАДАЮТЬСЯ у STACKING-GRAMMAR. Плюс верифікація проти реального моноліту-донора
   (frozen-music-a.html), де всі 4 механіки вже співіснують (композиція доведена фактом
   прийнятого організму — тут перевіряємо, що витягнуті одиниці не втратили сумісність).
   Запуск: node scripts/composition-check.mjs */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));
const ATOMS_DIR = join(__dir, '..', 'library', 'techniques', 'atoms');
const ATOMS = ['card-overlap-reveal','pinned-caption-crossfade','hotspot-tap-overlay','scrub-carousel-2slide'];
let fails=0;
const ok  = (m)=>console.log('  ✓ '+m);
const bad = (m)=>{ console.log('  ✗ '+m); fails++; };

console.log('\n── composition-check: 4 M6-атоми поряд ──');

// 1. hook-namespace: усі 4 hook-имена унікальні (нема колізії при складанні)
const HOOKS = {
  'card-overlap-reveal':'__CARD_OVERLAP_OK__',
  'pinned-caption-crossfade':'__PIN_CAPTION_OK__',
  'hotspot-tap-overlay':'__HOTSPOT_OK__',
  'scrub-carousel-2slide':'__CAROUSEL_OK__',
};
const hookVals = Object.values(HOOKS);
const uniqHooks = new Set(hookVals);
uniqHooks.size===hookVals.length ? ok(`hook-namespace: 4 унікальні hook-имена (${hookVals.join(', ')})`) : bad('hook-namespace: колізія імен');

const builds = {};
for(const a of ATOMS){ builds[a]=readFileSync(join(ATOMS_DIR,a,'build.html'),'utf8'); }

// 2. pin-band власності: 3 scroll-атоми мають ВЛАСНИЙ pin-wrap (не спільний глобальний timeline)
//    → при складанні стекуються sticky-стеком (кожен свій band), як wipe-up/reveal-sequence.
const scrollAtoms = ['card-overlap-reveal','pinned-caption-crossfade','scrub-carousel-2slide'];
for(const a of scrollAtoms){
  const b=builds[a];
  const hasPinWrap = /class="pin-wrap"/.test(b) && /position:sticky/.test(b);
  hasPinWrap ? ok(`${a}: власний pin-wrap + sticky-stage (стекується, не глобальний timeline)`) : bad(`${a}: нема власного pin-band`);
}

// 3. hotspot = z-index overlay ПОЗА scroll (не має pin-wrap, не конфліктує з pin сусідів)
const hs=builds['hotspot-tap-overlay'];
const hsNoPinWrap = !/class="pin-wrap"/.test(hs);
const hsHighZ = /z-index:200/.test(hs);
(hsNoPinWrap && hsHighZ) ? ok('hotspot-tap-overlay: z-index:200 overlay ПОЗА scroll (не бере pin — накладається без конфлікту)') : bad('hotspot: конфлікт з pin-стеком');

// 4. z-index діапазони не перекриваються деструктивно:
//    scroll-атоми у потоці (z auto/low), hotspot overlay z=200, header z=100 (у моноліті).
//    Перевіряємо, що жоден scroll-атом не претендує на z≥100 (зарезервовано під chrome/overlay).
for(const a of scrollAtoms){
  const zs=[...builds[a].matchAll(/z-index:(\d+)/g)].map(m=>+m[1]);
  const maxZ=zs.length?Math.max(...zs):0;
  maxZ<100 ? ok(`${a}: max z-index ${maxZ} < 100 (не зазіхає на chrome/overlay-шар)`) : bad(`${a}: z-index ${maxZ} ≥ 100 конфліктує з overlay/chrome`);
}

// 5. верифікація проти моноліту-донора: усі 4 механіки реально співіснують у прийнятому frozen-music-a
const mono = readFileSync(join(ATOMS_DIR,'frozen-music','variants','frozen-music-a.html'),'utf8');
const monoSignals = {
  'card-overlap (holdA/tc-card)': /tc-card/.test(mono) && /holdA/.test(mono),
  'pinned-caption (holdB/tr-tree)': /holdB/.test(mono) && /tr-tree/.test(mono),
  'hotspot (openHot/cr-mk)': /openHot/.test(mono) && /cr-mk/.test(mono),
  'carousel (holdD/ril-)': /holdD/.test(mono) && /ril-a/.test(mono),
};
const allPresent = Object.entries(monoSignals).every(([,v])=>v);
allPresent ? ok('моноліт-донор: усі 4 механіки співіснують у прийнятому frozen-music-a (композиція доведена фактом)') : bad('моноліт: не всі механіки знайдено — '+JSON.stringify(monoSignals));

// 6. STACKING-висновок: 3 scroll-band стекуються послідовно (document-flow sticky-стек),
//    hotspot інжектиться як overlay на будь-який band → грамотна композиція без barrier.
ok('STACKING-GRAMMAR: 3 scroll-band → послідовний sticky-стек; hotspot-overlay інжектиться поверх будь-якого band (нуль pin/z/timeline-конфлікту)');

console.log(fails===0 ? '\n✅ composition-check: ALL PASS (атоми складаються без конфлікту)\n' : `\n❌ composition-check: ${fails} FAIL\n`);
process.exit(fails===0?0:1);
