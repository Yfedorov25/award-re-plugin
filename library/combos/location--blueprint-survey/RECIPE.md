---
id: location--blueprint-survey
name: "Креслення району"
level: 2
kind: section-variant
section: location
status: base
map_style: "BLUEPRINT / CYANOTYPE (click-driven)"
webgl: false
ease: award
meaning:
  what: "The LOCATION beat at the surveyed-route-map level of cartographic REALISM (the SAME dense baked OSM district of с. Агрономічне: real road hierarchy by class, 823 building footprints, the site parcel inside a true-scale 10-minute walking ring, real Dijkstra routes drawn along the actual streets with a walking dot and a live minute counter), re-rendered in a DIFFERENT cartographic TREATMENT: an architect's BLUEPRINT / CYANOTYPE. A deep cyan field carries a faint cyan blueprint grid; roads are pale-cyan and white linework over a darker casing; building footprints are thin white outlines with near-zero fill; the parcel, walking ring and POI discs are pale cyan; the one active route draws in WARM WHITE so it reads as the single drawn line. NO warm-lit windows. The model is the CONTROLLED-INTERACTIVE one (the smarts Агрономічне model): the dense real map REVEALS on scroll-in ONCE, then there is NO pin and NO forced stepping. The USER clicks or hovers any of the 6 real POIs, on the map or in the visible side list, and THAT draws the real Dijkstra route along the actual streets while a walking dot rides it and the live minute badge reads the honest walk-time. Two-way hover (pin to row, row to pin). Same locmap-engine, same real data, same interaction as the ideal; only the palette and line/fill treatment differ, re-themed purely by CSS."
  when: "When the LOCATION section wants a precise, engineered register that still reads as a real survey: an architect's blueprint of the town, where the buyer clicks any daily place and the walk draws itself along the real streets with the honest minutes. The blueprint member of the map-style lane, distinct from the dark-dusk ideal and the light cream-day editorial by being a cyanotype drawing on deep cyan, while sharing the exact same realism and the same click-to-route interaction."
  lands: "A real architect's blueprint fills the frame: a faint cyan grid under the whole street network, hundreds of building footprints as thin white outlines, the property parcel hatched in pale cyan inside its dashed walking ring. A short list to the side names the school, the post office, the markets with their honest minute figures. Click any place, on the map or in the list, and a warm-white line draws itself along the real streets to it while a dot walks the route and a small badge shows the real walk-time. The camera never moves and nothing floats; the visitor drives. It reads bespoke and engineered, the kind of drawing that costs money to make, not a sketch and not an embedded widget."
source:
  grammar: "locmap-engine (the map CANON: dual casing+stroke road hierarchy, deterministic lit windows, the property parcel + walking ring, numbered POIs synced two-way with a side list, a Dijkstra route that draws along the real streets with a walking dot and a live minute counter, a 9-gate reveal, asymmetric layer parallax, true-scale walking ring) re-themed via CSS variables + class overrides into a BLUEPRINT / CYANOTYPE treatment (deep cyan field with a faint cyan grid, pale-cyan and white road strokes over a darker cyan casing, building footprints as thin white outlines with near-zero fill, NO lit windows, the active route in warm white). The variant's own contribution is the cyanotype RE-THEME; the model and interaction are the engine's native controlled-interactive one (reveal once, then click or hover a POI to draw its route). The lane's map-style taxonomy treats this as a first-class variant, not a forbidden reskin: ONE realistic medium, MANY cartographic styles."
  recording: null
  registry_ref: ["locmap-canon", "SMARTS-location-etalon"]
uses:
  - { atom: locmap-engine, job: "owns_pin FALSE; reads the REAL baked OSM (osm.js -> osm-agronomichne.js) and bakes the dense district SVG into [data-lm-stage]; fills the visible [data-lm-list] with the 6 clickable rows; on scroll-in runs the once 9-gate reveal. The USER then clicks or hovers a POI (on the map or in the list) and map.select(id) draws the dataset's real Dijkstra route via stroke-dashoffset while a walker rides getPointAtLength and a live badge reads the honest 'N хв · M м' from the first frame; clicking the active POI or the map clears it. Two-way pin<->row hover. flicker.rate huge so NO windows light (cyanotype has no warm glow). Re-themed to a deep cyan blueprint with pale-cyan/white linework and a warm-white active route purely by the variant CSS (engine code untouched). Its reveal/parallax triggers do NOT pin." }
pin: { owner: none, count: 0 }
pin_killed: []
gated_by: [R_no_webgl, R_perf_limits]
acceptance:
  - "MAP-STYLE is unmistakably BLUEPRINT / CYANOTYPE in one screenshot: a deep cyan field with a faint cyan blueprint grid, roads as pale-cyan and white linework over a darker casing, building footprints as thin white outlines with near-zero fill, the parcel and walking ring and POI discs in pale cyan, NO warm-lit windows, and the one active route in warm white. Realism is identical to the surveyed-route-map ideal (same dense real OSM: full street grid + 823 footprints + named streets + parcel + walking ring), distinct from the other map styles by TREATMENT (cyanotype palette) not by medium. Verified by screenshot."
  - "CONTROLLED-INTERACTIVE model: the dense real map reveals on scroll-in once, then the USER clicks (or hovers) the real POIs to draw routes. NO pin, NO forced scroll-stepping, NO scale-dive on the SVG. A visible clickable list of the 6 real POIs sits in the rail (data-lm-list); clicking a row or a pin draws that POI's route; clicking it again or the map clears it. pins === 0 in the probe (pin-less click section)."
  - "asset-truth: streets, footprints, green, walking routes, POI names and minutes are the REAL baked OSM of с. Агрономічне (osm.js -> osm-agronomichne.js): 136 roads, 823 footprints, site = OSM.site (746.3, 324.9), 6 real POIs (Школа, садок 9хв; Нова Пошта 10хв; Траш! 9хв; Подорожник 10хв; Грош Експрес 15хв; Аврора 18хв), a real Dijkstra route per POI. NO invented streets, POIs or times. Coords 49.18N 28.33E (Вінниця), never another city. Plot 22,5 сотки on вул. Перемоги."
  - "the live badge reads the HONEST 'N хв · M м' from the first frame and at every frame (engine fix); no fake count-up through minutes no POI has. The walker dot travels the route for kinetic interest while the number stays honest."
  - "decode-guard: the [data-render-surface] field is a painted CSS background (the deep cyan blueprint grid) at non-zero size from load; no undecoded <img>/tile flicker (the medium uses zero raster imagery)."
  - "motion ONLY stroke-dashoffset / transform / opacity / filter; NO WebGL, NO canvas, NO tiles, NO mix-blend, NO backdrop-filter, NO video.currentTime, NO animating width/height/top/left/margin. will-change cleared after one-shots (engine clears its own)."
  - "reduced-motion -> the full map shown statically, a POI route shown static with its label, list clickable, __LAB_OK__ true; mobile 390px -> no pin, no horizontal overflow, __LAB_OK__ true. Zero real console errors."
  - "copy Ukrainian, Fedoriv voice, sparse, proof-not-promises, real POI names and minutes only; ZERO em-dash/en-dash anywhere in the file."
gate:
  probe: "Serve library/ and open combos/location--concierge-radiate/combo-lab.html. __LAB_OK__ true, ScrollTrigger pin count === 0. Scroll in: the dense blueprint district reveals gate by gate (a real survey: full grid, 823 footprints, named streets, parcel, walking ring) on a deep cyan cyanotype field with a faint cyan grid, pale-cyan and white linework, NO lit windows. A visible side list names the 6 real POIs with their minutes. Click a row or a pin: a WARM-WHITE Dijkstra route draws along the real streets with a walker + a live badge reading the honest 'N хв · M м'; click again to clear. Two-way hover highlights both pin and row. Confirm the BLUEPRINT / CYANOTYPE treatment by screenshot and that only real OSM data appears, with no forced scroll-stepping."
note: |
  Map-style variant of the location lane: the SAME medium as the surveyed-route-map ideal (dense
  real OSM via locmap-engine, real Dijkstra routes, honest live minute counter, the controlled-
  interactive click-to-route model), re-rendered in a BLUEPRINT / CYANOTYPE treatment. This is the
  lane taxonomy: ONE realistic medium, MANY cartographic styles (see PATTERNS/location-patterns.md
  MAP-STYLE section). The engine is re-themed purely by CSS variables + class overrides in the
  variant SKIN (engine code untouched): --lm-* re-pointed to a deep cyan field with pale-cyan/white
  linework, road strokes set to pale-cyan/white over a darker cyan casing, building footprints as
  thin white outlines, lit windows killed via flicker.rate, the active route + walker + live badge
  in warm white as the single drawn line. The model is the engine's native controlled-interactive
  one: the map reveals once on scroll-in, then the visitor clicks or hovers a POI (on the map or in
  the visible side list) to draw its route. PIN-LESS: 0 pins, no harness pin, no forced stepping,
  no scale-dive. No theme-tween (cyanotype is a fixed palette). REWORK of the earlier draft: the
  forced radiating-thread tour (a harness pin that scroll-stepped through the POIs while threads
  floated over the scrubbed map) was rejected by the owner and dropped; this rebuild is the dense
  blueprint with the controlled click-to-route model and a visible list.
---

# location--concierge-radiate · "Креслення району" (blueprint / cyanotype, click-driven)

The LOCATION beat at the ideal's level of cartographic realism, re-rendered as an architect's
blueprint: the dense real OSM of с. Агрономічне in pale-cyan and white linework on a deep cyan
cyanotype field with a faint cyan grid, NO lit windows, the one active route drawn in warm white.

## The model (controlled-interactive, pin-less)
- The dense district is baked from the REAL OSM by locmap-engine (re-themed cyanotype via CSS) and
  REVEALS on scroll-in once (the engine's 9-gate reveal).
- There is NO pin and NO forced stepping. A visible side list names the 6 real POIs with their
  honest minutes. The USER clicks or hovers any POI, on the map or in the list, and `map.select(id)`
  draws the dataset's real Dijkstra route in warm white via stroke-dashoffset, a walker rides it,
  and a live badge reads the honest 'N хв · M м' from the first frame. Clicking it again, or the
  map, clears it. Two-way hover highlights both pin and row.

## Map-style
Same engine, same real data, same controlled-interactive model as `surveyed-route-map`; the
difference is the cartographic TREATMENT (a deep cyan blueprint / cyanotype palette with pale-cyan
and white linework and a warm-white active route), done entirely in the variant CSS. Pairs in the
lane with the dark-dusk ideal and the light cream-day editorial, each a different-looking REAL map.

## Asset-truth (failure #1)
Geometry, names and minutes come from the REAL OSM bake (`import { OSM } from './osm.js'`). The site
is `OSM.site` = (746.3, 324.9). The 6 POIs are `OSM.pois` verbatim with their real walk-minutes
(Школа, садок 9; Нова Пошта 10; Траш! 9; Подорожник 10; Грош Експрес 15; Аврора 18). Nothing is
invented; the engine viewBox is `120 -20 1060 660`. Coords 49.18N 28.33E (Вінниця), never another
city. Plot 22,5 сотки on вул. Перемоги.

## Author notes
Swap only the cyanotype palette tokens to re-skin for another site's OSM bake; the model and the
visible clickable list are the engine's native controlled-interactive interaction. Keep ZERO pins
(no harness pin, no scale-dive, no forced stepping), keep the engine code untouched, and keep the
live badge reading the honest minutes from the first frame.
