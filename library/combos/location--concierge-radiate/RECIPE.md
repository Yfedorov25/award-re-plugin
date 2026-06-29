---
id: location--concierge-radiate
name: "Все поруч"
level: 2
kind: section-variant
section: location
status: base
map_style: "LIGHT EDITORIAL + RADIATING THREADS over a real dense map (cream paper, dark-ink roads, warm-grey footprints, terracotta accent + leader-threads)"
webgl: false
ease: air
meaning:
  what: "The LOCATION beat at the surveyed-route-map level of cartographic REALISM (the SAME dense baked OSM district of с. Агрономічне: real road hierarchy by class, 823 building footprints, the site parcel inside a true-scale 10-minute walking ring, real Dijkstra routes drawn along the actual streets with a walking dot and a live minute counter), re-rendered in a DIFFERENT cartographic TREATMENT: a light cream-day editorial plan (cream paper, dark-ink roads, warm-grey footprints, one terracotta accent), NO warm-lit windows. On TOP of that real dense map the section's SIGNATURE: thin terracotta leader-threads splay from the REAL site (OSM.site 746,325) to each of the 6 REAL POIs, each carrying its real walk-minute, drawn in the engine's own SVG coordinate space so they land exactly on the real POI coords. Same locmap-engine, same real data, same mechanic as the ideal; only the palette/line/fill treatment differs and the threads are added as an authored mark. The section pins; scroll radiates the threads in, then STEPS through the 6 real POIs one at a time, each drawing its real terracotta route + live minutes and lighting its thread; one clean story block per step, cross-faded so two are never legible at once."
  when: "When the LOCATION section wants a warm, light, editorial register that still reads as a real survey: a printed cream plan where a concierge mark stitches the door to every daily place with the minutes on it. The proximity-as-signature member of the map-style lane, distinct from the dark-dusk ideal and the hi-contrast mono by being a light cream-day sheet with radiating leader-threads."
  lands: "A real printed cream plan fills the frame: the whole street grid and hundreds of warm-grey building footprints, the thick artery cutting the diagonal, the property parcel hatched in terracotta inside its dashed walking ring. Thin terracotta threads fan out from the door to the school, the post office, the markets, each with its honest minute figure, so the daily life reads as already stitched to the porch. As you scroll the camera holds; one thread lights at a time as a terracotta route draws itself along the real streets to that place, a dot walking it while the minutes count up to the honest number. It reads bespoke, warm and editorial, not decorative and not a sketch."
source:
  grammar: "locmap-engine (the map CANON: dual casing+stroke road hierarchy, Dijkstra draw + getPointAtLength walker + growing live timer, 9-gate reveal, asymmetric layer parallax, true-scale walking ring) re-themed via CSS variables + class overrides into a light cream-day editorial treatment (dark-ink strokes over cream halo casing, warm-grey footprints with NO lit windows, one terracotta accent). The authored layer = the radiating leader-threads (one bowed quadratic per real POI from the real site, the smarts thread math, drawn in viewBox units so each lands on the real POI coord) PLUS the scroll-stepped POI tour: harness pin -> step index -> map.select() + thread-light + one cross-faded story block per step. Same composition as surveyed-route-map; the variant's own contribution is the cream-day RE-THEME and the radiating-thread mark, which the lane's map-style taxonomy treats as a first-class variant (not a forbidden reskin)."
  recording: null
  registry_ref: ["locmap-canon", "SMARTS-location-etalon"]
uses:
  - { atom: locmap-engine, job: "owns_pin FALSE; reads the REAL baked OSM (osm.js -> osm-agronomichne.js) and bakes the dense district SVG into [data-lm-stage]; on map.select(id) draws the dataset's real Dijkstra route via stroke-dashoffset while a walker rides getPointAtLength and a live badge counts minutes up to the real walk-time. flicker.rate huge so NO windows light (cream-day has no warm glow). Re-themed to ink-on-cream + one terracotta accent purely by the variant CSS (engine code untouched). After it bakes the SVG the variant queries map.svg and APPENDS a thin authored threads <g>: one bowed leader-thread per real POI from the real site, radiated in via stroke-dashoffset. Its reveal/parallax triggers do NOT pin." }
pin: { owner: harness, count: 1 }
pin_killed: []
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "MAP-STYLE is unmistakably LIGHT EDITORIAL + RADIATING THREADS in one screenshot: a light cream-paper plan with dark-ink roads and warm-grey footprints, NO lit windows, ONE terracotta accent, and thin terracotta leader-threads fanning from the one site marker to the real POIs with their minute figures. Realism is identical to the surveyed-route-map ideal (same dense real OSM: full street grid + 823 footprints + named streets + parcel + walking ring), distinct from the other map styles by TREATMENT (cream-day palette + the radiating-thread mark) not by medium. Verified by screenshot."
  - "asset-truth: streets, footprints, green, walking routes, POI names and minutes are the REAL baked OSM of с. Агрономічне (osm.js -> osm-agronomichne.js): 136 roads, 823 footprints, site = OSM.site (746,325), 6 real POIs (Школа·садок 9хв, Нова Пошта 10хв, Траш! 9хв, Подорожник 10хв, Грош Експрес 15хв, Аврора 18хв), real Dijkstra route per POI. The 6 leader-threads target the REAL POI coords (a module island re-derives each pin from its thread end and asserts Math.round match -> window.__ASSET_TRUTH__.ok). NO invented streets/POIs/times. Coords 49.18N 28.33E (Вінниця), never another city."
  - "ONE pin only (harness owns it; locmap-engine is owns_pin FALSE; the threads radiate on a NON-pin once-trigger). Scroll-LOCK with pinSpacing while the mechanic plays. pins === 1 in the probe."
  - "story text SEQUENCED: exactly one story block legible (opacity >= 0.85) at any scroll position, cross-faded + visibility-gated; never two at once, never a full-screen wall. Verified across 5 scroll samples (zero overlapping text-bearing pairs)."
  - "decode-guard: the [data-render-surface] field is a painted CSS background (cream paper grain) at non-zero size from load; no undecoded <img>/tile flicker (the medium uses zero raster imagery)."
  - "motion ONLY stroke-dashoffset / transform / opacity / filter; NO WebGL, NO mix-blend, NO backdrop-filter, NO video.currentTime, NO animating width/height/top/left/margin. will-change cleared after one-shots."
  - "reduced-motion -> the full map + threads + first route shown statically, text steppable, __LAB_OK__ true; mobile 390px -> no horizontal overflow, __LAB_OK__ true. Zero real console errors."
  - "copy Ukrainian, Fedoriv voice, sparse, proof-not-promises; ZERO em-dash/en-dash anywhere in the file."
gate:
  probe: "Serve library/ and open combos/location--concierge-radiate/combo-lab.html. __LAB_OK__ true, ScrollTrigger pin count === 1. Scroll the pinned range: the dense cream-on-ink district reads as a real survey (full grid, 823 footprints, named streets, parcel, walking ring); thin terracotta leader-threads radiate from the one site marker to the 6 real POIs with their minute figures; then the section STEPS through the 6 real POIs, each drawing its REAL terracotta Dijkstra route along the streets with a walker + live minute badge, lighting its thread, and ONE serif story block (name + real minutes) legible at a time. Confirm the LIGHT EDITORIAL + RADIATING THREADS treatment by screenshot and that only real OSM data appears."
note: |
  Map-style variant of the location lane: the SAME medium as the surveyed-route-map ideal
  (dense real OSM via locmap-engine, real Dijkstra routes, live minute counter), re-rendered
  in a light cream-day editorial treatment with an authored radiating-thread mark on top. This
  is the lane taxonomy: ONE realistic medium, MANY cartographic styles (see
  PATTERNS/location-patterns.md MAP-STYLE section). The engine is re-themed purely by CSS
  variables + class overrides in the variant SKIN (engine code untouched): --lm-* re-pointed to
  ink-on-cream, road strokes set to dark ink over cream halo casing, lit windows killed via
  flicker.rate, a single terracotta --lm-accent for the active route + parcel. The signature
  leader-threads are a thin AUTHORED layer appended into the engine's baked SVG (map.svg): one
  bowed quadratic per real POI from the real site, drawn in viewBox units so each lands exactly on
  the real POI coord (the smarts thread math), radiated in via stroke-dashoffset on a NON-pin
  once-trigger. The map atom is pinless; the single harness pin is the only scroll owner; the
  one-block-at-a-time read is hand-wired as a cross-fade with visibility gating. No theme-tween
  (cream-day is a fixed palette, not a dusk recolour). REWORK of the earlier illustrated-map draft:
  the sparse hand-drawn cream sketch was replaced with this dense real map + the threads kept as the
  signature on top.
---

# location--concierge-radiate · "Все поруч" (light editorial map + radiating threads)

The LOCATION beat at the ideal's level of cartographic realism, re-rendered as a warm printed
plan: the dense real OSM of с. Агрономічне in dark-ink linework on cream paper, NO lit windows,
with one terracotta accent, and thin terracotta leader-threads fanning from the door to every real
daily place with the minutes on them.

## The single scroll (harness pin)
- The dense district is baked from the REAL OSM by locmap-engine (re-themed light-editorial via CSS).
- On scroll-in the 6 leader-threads radiate from the real site to the real POIs (stroke-dashoffset,
  a NON-pin once-trigger), each carrying its real walk-minute.
- Scroll STEPS through the 6 real POIs. Each step calls `map.select(id)`: the dataset's real
  Dijkstra route draws in terracotta via stroke-dashoffset, a walker rides it, a live badge counts
  the minutes up to the real walk-time, and that POI's thread lights while the rest calm. ONE serif
  story block (number + place + real minutes) is legible at a time, cross-faded + visibility-gated
  so two are never readable at once.

## Map-style
Same engine, same real data, same mechanic as `surveyed-route-map`; the differences are the
cartographic TREATMENT (light cream-day palette) and the AUTHORED radiating-thread mark, both done
in the variant CSS + a thin appended SVG layer. Pairs in the lane with the dark-dusk ideal, the
hi-contrast mono, the heritage-sepia, and the pen-sketch variants, each a different-looking REAL map.

## Asset-truth (failure #1)
Geometry, names and minutes come from the REAL OSM bake (`import { OSM } from './osm.js'`). The site
is `OSM.site` = (746, 325). The 6 threads target `OSM.pois` verbatim with their real walk-minutes
(Школа·садок 9, Нова Пошта 10, Траш! 9, Подорожник 10, Грош Експрес 15, Аврора 18). A module island
re-derives each pin coord from its thread end and asserts `Math.round` match against the bake,
exposing `window.__ASSET_TRUTH__`. Nothing is invented; the engine viewBox is `120 -20 1060 660`.

## Author notes
Swap only the cream-day palette tokens, the POI ORDER, and the three story blocks to re-skin for
another site's OSM bake. The radiating thread is the identity: keep it as a thin authored layer in
viewBox units (never bolt the district-radiates atom onto the engine's SVG; their DOM contracts
differ). Keep ONE pin (the harness), keep the threads on a NON-pin trigger, and keep the engine code
untouched.
