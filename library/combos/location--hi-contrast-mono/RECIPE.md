---
id: location--hi-contrast-mono
name: "Чорним по білому"
level: 2
kind: section-variant
section: location
status: base
map_style: "HI-CONTRAST MONO (pure black linework on white paper, one red route accent)"
webgl: false
ease: air
meaning:
  what: "The LOCATION beat at the surveyed-route-map level of cartographic REALISM (the SAME dense baked OSM district of с. Агрономічне: real road hierarchy by class, 823 building footprints, the site parcel inside a true-scale 10-minute walking ring, real Dijkstra routes drawn along the actual streets with a walking dot and a live minute counter), re-rendered in a DIFFERENT cartographic TREATMENT: a stark editorial plan in pure black linework on pure white paper, NO warm-lit windows, with ONE single red accent reserved for the active route. Same locmap-engine, same real data, same mechanic as the ideal; only the palette and line/fill treatment differ. CONTROLLED-INTERACTIVE: the map REVEALS once on scroll-in, then there is NO pin and NO forced stepping. The USER clicks or hovers any of the 6 real POIs, on the map or in the visible side list, and THAT draws the real red route + a red walking dot + an honest live minute badge; two-way hover between pin and list row. The visitor drives; the map never floats after the reveal."
  when: "When the LOCATION section wants a stark, modern, editorial register: a printed black-and-white survey where a single red line is the only colour, and that colour is the walk to each real place the visitor chooses to inspect. The most graphic, high-contrast member of the map-style lane, distinct from the dark-dusk ideal and the warm heritage treatment by being pure monochrome with one accent."
  lands: "A crisp printed plan: the whole street grid and hundreds of building footprints in black on white, the thick black highway cutting the diagonal, the property parcel hatched in ink inside its dashed walking ring. It reveals once as you scroll in, then it holds still. The visitor clicks the school, the post office, the market in any order, and each time a single red line draws itself along the real streets, a red dot walking it while the badge shows the honest minute. It reads engineered, expensive and graphic, not decorative."
source:
  grammar: "locmap-engine (the map CANON: dual casing+stroke road hierarchy, Dijkstra draw + getPointAtLength walker + honest live minute badge, 9-gate scroll-in reveal, asymmetric layer parallax, true-scale walking ring, two-way pin<->row sync) re-themed via CSS variables + class overrides into a hi-contrast monochrome treatment (black strokes over white halo casing, light-black footprints with NO lit windows, one red route accent). No authored scroll layer: the section is PIN-LESS (the smarts Агрономічне model) and uses the engine's native click/hover interaction to draw routes. Same composition + realism as surveyed-route-map; the variant's own contribution is the mono RE-THEME, which the lane's map-style taxonomy treats as a first-class variant (not a forbidden reskin)."
  recording: null
  registry_ref: ["locmap-canon", "SMARTS-location-etalon"]
uses:
  - { atom: locmap-engine, job: "owns_pin FALSE; reads the REAL baked OSM (osm.js -> osm-agronomichne) and bakes the dense district SVG into [data-lm-stage]; fills the visible [data-lm-list] with clickable .lm-row rows two-way synced with the map pins. On click/hover of any POI (map or row) draws the dataset's real Dijkstra route via stroke-dashoffset while a walker rides getPointAtLength and a live badge reads the honest minute from frame 1. flicker.rate huge so NO windows light (mono has no warm glow). Re-themed to black-on-white + one red accent purely by the variant CSS (engine code untouched). reveal:{start:'top 70%',once:true} so the 9-gate reveal plays on scroll-in; its reveal/parallax triggers do NOT pin." }
pin: { owner: none, count: 0 }
pin_killed: []
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "MAP-STYLE is unmistakably HI-CONTRAST MONO in one screenshot: pure black linework on white paper, NO lit windows, ONE red accent reserved for the active route. Realism is identical to the surveyed-route-map ideal (same dense real OSM: full street grid + 823 footprints + named streets + parcel + walking ring), distinct from the other map styles by TREATMENT not by medium. Verified by screenshot."
  - "asset-truth: streets, footprints, green, walking routes, POI names and minutes are the REAL baked OSM of с. Агрономічне (osm.js -> osm-agronomichne): 136 roads, 823 footprints, 6 real POIs (Школа·садок 9хв, Нова Пошта 10хв, Траш! 9хв, Подорожник 10хв, Грош Експрес 15хв, Аврора 18хв), real Dijkstra route per POI. NO invented streets/POIs/times. Coords 49.18N 28.33E (Вінниця), never another city."
  - "CONTROLLED-INTERACTIVE, PIN-LESS: zero pins (locmap-engine owns_pin FALSE, harness owns none). NO scroll-stepping, NO scale-dive on the SVG. The map REVEALS once on scroll-in, then the USER clicks/hovers a POI (map or list row) to draw its route. pins === 0 in the probe."
  - "the side list is VISIBLE: [data-lm-list] in the rail is filled by the engine with >=6 clickable .lm-row rows, two-way synced with the map pins (hover one highlights the other). Clicking a row draws that POI's real red route + a red walker, and the .lm-livet badge reads a real 'N хв · M м'."
  - "decode-guard: the [data-render-surface] field is a painted CSS background (white paper grain) at non-zero size from load; no undecoded <img>/tile flicker (the medium uses zero raster imagery)."
  - "motion ONLY stroke-dashoffset / transform / opacity / filter; NO WebGL, NO mix-blend, NO backdrop-filter, NO video.currentTime, NO animating width/height/top/left/margin. will-change cleared after one-shots."
  - "reduced-motion -> the full map + first route shown statically, rows clickable, __LAB_OK__ true; mobile 390px -> no horizontal overflow, no pin, __LAB_OK__ true. Zero real console errors."
  - "copy Ukrainian, Fedoriv voice, sparse, proof-not-promises; ZERO em-dash/en-dash anywhere in the file."
gate:
  probe: "Serve library/ and open combos/location--hi-contrast-mono/combo-lab.html. __LAB_OK__ true, ScrollTrigger pin count === 0. Scroll the section in: the dense black-on-white district reveals gate by gate as a real survey (full grid, 823 footprints, named streets, parcel, walking ring), then holds still. The rail shows the eyebrow + serif 'Що поруч' + the hint + the visible list of 6 real POIs as clickable rows. Click any row or pin: its REAL red Dijkstra route draws along the streets with a red walker + an honest live minute badge ('9 хв · 800 м', '18 хв · 1500 м'). Confirm the HI-CONTRAST MONO treatment by screenshot and that only real OSM data appears."
note: |
  Map-style variant of the location lane: the SAME medium as the surveyed-route-map ideal
  (dense real OSM via locmap-engine, real Dijkstra routes, honest live minute badge), re-rendered
  in a hi-contrast monochrome treatment. This is the NEW lane taxonomy: ONE realistic medium,
  MANY cartographic styles (see PATTERNS/location-patterns.md MAP-STYLE section). The engine is
  re-themed purely by CSS variables + class overrides in the variant SKIN (engine code untouched):
  --lm-* re-pointed to black-on-white, road strokes set to black over white halo casing, lit
  windows killed via flicker.rate, a single red --lm-accent for the active route, and the .lm-row
  list rows re-skinned for the white sheet (dark ink, red active). CONTROLLED-INTERACTIVE (the
  smarts Агрономічне model): the section is PIN-LESS, the map reveals once on scroll-in, then the
  visitor clicks/hovers the 6 real POIs (map or the visible side list) to draw routes. No harness
  pin, no scroll-stepping, no scale-dive, no theme-tween (mono is a fixed palette, not a dusk
  recolour).
---

# location--hi-contrast-mono · "Чорним по білому" (high-contrast monochrome map)

The LOCATION beat at the ideal's level of cartographic realism, re-rendered as a stark printed
plan: the dense real OSM of с. Агрономічне in pure black linework on white paper, NO lit windows,
with a single red line the only colour on the sheet, reserved for the active walking route.

## Controlled-interactive (the smarts Агрономічне model)
- The dense district is baked from the REAL OSM by locmap-engine (re-themed mono via CSS) and
  REVEALS once on scroll-in (the 9-gate reveal). After that the section is PIN-LESS and holds
  still: no scroll-stepping, no scale-dive, nothing animates the map.
- The rail shows an eyebrow, the serif title `Що поруч`, a hint (`Натисніть місце, щоб побачити
  шлях і час пішки.`), the coords, and the VISIBLE list the engine fills with clickable `.lm-row`
  rows, two-way synced with the map pins.
- The USER clicks or hovers any of the 6 real POIs (map or row). That calls the engine's native
  `select(id)`: the dataset's real Dijkstra route draws in red via stroke-dashoffset, a red walker
  rides it, and a live red badge reads the honest minute (`N хв · M м`) from the first frame.

## Map-style
Same engine, same real data, same mechanic as `surveyed-route-map`; the only difference is the
cartographic TREATMENT (hi-contrast monochrome + one red accent), achieved entirely in the variant
CSS. Pairs in the lane with the dark-dusk ideal, the warm heritage-sepia treatment, the pen-sketch,
and the reworked radiating-thread / scale-zoom variants, each a different-looking REAL map.
