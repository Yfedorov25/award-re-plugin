---
id: location--heritage-sepia
name: "Спадок на теплому папері"
level: 2
kind: section-variant
section: location
status: base
map_style: "SEPIA HERITAGE (aged warm-paper survey: cream field with a soft vignette, sepia-brown roads, umber footprints, a deep rust route accent)"
webgl: false
ease: air
meaning:
  what: "The LOCATION beat at the surveyed-route-map level of cartographic REALISM (the SAME dense baked OSM district of с. Агрономічне: real road hierarchy by class, 823 building footprints, the site parcel inside a true-scale 10-minute walking ring, real Dijkstra routes drawn along the actual streets with a walking dot and a live minute counter), re-rendered in a DIFFERENT cartographic TREATMENT: an aged warm-paper heritage survey. A cream aged-paper field with a soft corner vignette, sepia-brown road hierarchy over a lighter-paper halo casing, warm umber building footprints with NO lit windows (heritage daylight register), a brown dashed walking ring, ink-brown chrome, and the active route drawn in a deep rust/oxblood with the live minute counter. Same locmap-engine, same real data as the ideal; only the palette and line/fill treatment differ. CONTROLLED-INTERACTIVE model (the smarts Агрономічне model): the dense paper district REVEALS on scroll-in once, then there is NO pin and NO forced stepping. The USER clicks or hovers any of the 6 real POIs, on the map or in the VISIBLE side list, and THAT draws the real rust route along the streets, a rust dot walks it, and the honest live minute badge shows the walk-time. Two-way hover (pin <-> list row). The visitor drives; the paper never floats after the reveal."
  when: "When the LOCATION section wants a warm, established, premium-villa register: an old printed survey on aged stock where the district reads heritage and the rust line is the walk to each real place. The warm member of the map-style lane, distinct from the dark-dusk ideal and the stark black-on-white mono by being a cream sepia heritage treatment."
  lands: "An aged surveyed chart on warm paper fills the frame: the whole street grid and hundreds of building footprints in sepia and umber on cream, the thick brown highway cutting the diagonal, the property parcel hatched in oxblood inside its dashed walking ring, the paper darkening warm toward the edges. A short list of the real places sits in ink on the sheet. Click the school, the post office, the market, and a single deep-rust line draws itself along the real streets to it, a rust dot walking it while the honest minutes show. It reads warm, established and expensive, an heirloom plan rather than an embedded widget."
source:
  grammar: "locmap-engine (the map CANON: dual casing+stroke road hierarchy, Dijkstra draw + getPointAtLength walker + honest live timer, 9-gate reveal, asymmetric layer parallax, true-scale walking ring, two-way pin<->row sync) re-themed via CSS variables + class overrides into a sepia-heritage treatment (sepia-brown strokes over a lighter-paper halo casing, warm umber footprints with NO lit windows, oxblood parcel hatch, a deep rust route accent, a paper vignette layered onto the field background). The authored layer = the controlled-interactive read: the map reveals on scroll-in (engine, owns_pin FALSE) and the USER clicks/hovers POIs (on the map or in the visible list) to draw routes. Same medium as surveyed-route-map; the variant's own contribution is the sepia RE-THEME, which the lane's map-style taxonomy treats as a first-class variant (not a forbidden reskin)."
  recording: null
  registry_ref: ["locmap-canon", "SMARTS-location-etalon"]
uses:
  - { atom: locmap-engine, job: "owns_pin FALSE; reads the REAL baked OSM (osm.js) and bakes the dense district SVG into [data-lm-stage]; fills the VISIBLE [data-lm-list] with clickable .lm-row rows synced two-way with the map pins; on click/hover of a POI or row it calls select(id) and draws the dataset's real Dijkstra route via stroke-dashoffset while a walker rides getPointAtLength and a live badge reads the honest walk-time from frame 1. flicker.rate huge so NO windows light (heritage daylight has no warm glow). reveal:{start:'top 70%',once:true} so the 9-gate reveal plays on scroll-in. Re-themed to aged-paper sepia + a deep rust route accent purely by the variant CSS (engine code untouched). It owns NO pin; nothing animates the map after the reveal." }
pin: { owner: none, count: 0 }
pin_killed: ["harness scroll-step POI tour replaced by the controlled-click model (smarts Агрономічне): reveal-once + USER clicks POIs, no forced stepping, no scale-dive"]
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "MAP-STYLE is unmistakably SEPIA HERITAGE in one screenshot: a cream aged-paper field with a soft vignette, sepia-brown roads, warm umber footprints, NO lit windows, a deep rust accent reserved for the active route. Realism is identical to the surveyed-route-map ideal (same dense real OSM: full street grid + 823 footprints + parcel + walking ring), distinct from the other map styles by TREATMENT not by medium. Verified by screenshot."
  - "asset-truth: streets, footprints, green, walking routes, POI names and minutes are the REAL baked OSM of с. Агрономічне (osm.js): 136 roads, 823 footprints, 6 real POIs (Школа · садок 9хв, Нова Пошта 10хв, Супермаркет «Траш!» 9хв, Аптека «Подорожник» 10хв, «Грош Експрес» 15хв, Маркет «Аврора» 18хв), real Dijkstra route per POI. NO invented streets/POIs/times. Coords 49.18N 28.33E (Вінниця), never another city."
  - "ZERO pins (pin-less click section): locmap-engine is owns_pin FALSE and the harness creates NO pin. No scale-dive, no scroll-stepping. pins === 0 in the probe (declare expectPins:0, pinOwner:'none')."
  - "the side list is VISIBLE in the rail (>=6 .lm-row rows the engine filled) under an eyebrow + a serif title (Що поруч) + a hint (Натисніть місце, щоб побачити шлях і час пішки.) + the coords. Rows are two-way synced with the map pins (hover + click highlight both)."
  - "controlled interaction: the map REVEALS on scroll-in once (engine 9-gate timeline). Clicking a .lm-row or a map POI draws its REAL rust Dijkstra route via stroke-dashoffset while a rust walker rides it and the .lm-livet badge reads the honest 'N хв · M м' from the first frame (no fake count-up). Clicking the active POI/row or the map background clears it."
  - "decode-guard: the [data-render-surface] field is a painted CSS background (aged paper + vignette) at non-zero size from load; no undecoded <img>/tile flicker (the medium uses zero raster imagery)."
  - "motion ONLY stroke-dashoffset / transform / opacity / filter; NO WebGL, NO mix-blend, NO backdrop-filter, NO video.currentTime, NO animating width/height/top/left/margin. will-change cleared after one-shots."
  - "reduced-motion -> the full map + the selected route shown statically, list still clickable, __LAB_OK__ true; mobile 390px -> no horizontal overflow, no pin, __LAB_OK__ true. Zero real console errors."
  - "copy Ukrainian, Fedoriv voice, sparse, proof-not-promises; ZERO em-dash/en-dash anywhere in the file."
gate:
  probe: "Serve library/ and open combos/location--heritage-sepia/combo-lab.html. __LAB_OK__ true, ScrollTrigger pin count === 0. Scroll the section in: the dense aged-paper district reveals gate by gate and reads as a real survey (full grid, 823 footprints, parcel, walking ring), with >=6 clickable rows in the rail. Click a row (or a map POI): its REAL rust Dijkstra route draws along the streets with a rust walker + a live minute badge reading the honest 'N хв · M м'. Confirm the SEPIA HERITAGE treatment by screenshot and that only real OSM data appears. No forced stepping, no scale-dive, the map never floats after the reveal."
note: |
  Map-style variant of the location lane: the SAME medium as the surveyed-route-map ideal
  (dense real OSM via locmap-engine, real Dijkstra routes, honest live minute badge), re-rendered
  in an aged warm-paper heritage treatment. This is the lane taxonomy: ONE realistic medium,
  MANY cartographic styles (see PATTERNS/location-patterns.md MAP-STYLE section). The engine is
  re-themed purely by CSS variables + class overrides in the variant SKIN (engine code untouched):
  --lm-* re-pointed to aged paper + ink-brown, road strokes set to sepia-brown over a lighter-paper
  halo casing, lit windows killed via flicker.rate, the #lmHatch defs re-coloured to oxblood, a
  paper vignette layered onto the field background, and a single deep rust --lm-accent for the
  active route. CONTROLLED-INTERACTIVE model (the smarts Агрономічне model): the map is pin-less
  (owns_pin FALSE, the harness creates NO pin), reveals once on scroll-in, and the USER clicks or
  hovers the 6 real POIs (on the map or in the VISIBLE list) to draw routes. No forced stepping, no
  scale-dive, no theme-tween (sepia is a fixed heritage palette). The .lm-row rows are re-skinned
  for the cream field (sepia-ink text, rust active).
---

# location--heritage-sepia · "Спадок на теплому папері" (aged warm-paper heritage map)

The LOCATION beat at the ideal's level of cartographic realism, re-rendered as an aged survey:
the dense real OSM of с. Агрономічне on cream heritage paper with a soft vignette, sepia-brown
roads and warm umber footprints, NO lit windows, with a single deep rust line drawing along the
real streets to each place as the only saturated colour on the sheet.

## The controlled interaction (no pin)
- The dense district is baked from the REAL OSM by locmap-engine (re-themed sepia via CSS) and
  REVEALS once on scroll-in via the engine's 9-gate timeline. After that nothing animates the map.
- The rail shows an eyebrow + a serif title (Що поруч) + a hint (Натисніть місце, щоб побачити
  шлях і час пішки.) + the coords + a VISIBLE list of the 6 real places the engine filled.
- The USER clicks (or hovers) a row or a map POI. `select(id)` draws the dataset's real Dijkstra
  route in deep rust via stroke-dashoffset, a rust walker rides it, and a rust badge reads the
  honest minutes from the first frame. Two-way hover (pin <-> list row). Clicking the active one or
  the map background clears it. The visitor drives; the map never floats after the reveal.

## Map-style
Same engine, same real data, same controlled-click mechanic as `surveyed-route-map`; the only
difference is the cartographic TREATMENT (aged warm-paper heritage + a deep rust accent), achieved
entirely in the variant CSS. Pairs in the lane with the dark-dusk ideal, the stark hi-contrast-mono
treatment, the pen-sketch, and the reworked radiating-thread / scale-zoom variants, each a
different-looking REAL map.
