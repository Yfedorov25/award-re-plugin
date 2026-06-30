---
id: location--architects-sketch
name: "Схема від руки"
level: 2
kind: section-variant
section: location
status: base
medium: "PEN/INK DRAFTING (click-driven, real dense OSM)"
map_style: "PEN/INK DRAFTING (click-driven, real dense OSM)"
webgl: false
ease: award
meaning:
  what: "The realistic CONTROLLED-INTERACTIVE LOCATION section (the smarts Агрономічне model) drawn as an architect's hand site plan. The SAME dense, real baked OSM district of с. Агрономічне (true road hierarchy by class, the building footprints, the site anchored inside a true-scale 10-minute walking ring) is rendered as a PEN DRAWING: thin dark-ink strokes on warm drafting paper, the hierarchy by stroke-width only, building footprints as near-empty ink outlines (drawn, not blocked), the parcel as an ink hatch, the ring thin dashed ink, the POIs as small ink-ringed dots. NO filled blocks, NO colour photography, NO lit windows, NO Google / NO Mapbox / NO tiles. The plan REVEALS on scroll-in once (the 9-gate birth), then there is NO pin and NO forced stepping: the USER clicks (or hovers) any of the 6 real POIs, on the map or in the visible side list, and THAT draws the real Dijkstra route along the actual streets in slightly heavier ink while a walking dot rides it and a live minute badge reads the honest walk-time. Two-way hover (pin <-> list row). The visitor drives; the sheet never floats because nothing animates it after the reveal."
  when: "The LOCATION beat where the register should feel SURVEYED and authored, an austere monochrome drafting sheet, yet the buyer must still be able to answer 'can I live my life from here' by clicking a place and watching the real walk draw along real streets to the honest minute. The same dense real geography as the dark etalon, only the rendering is a pen on a drafting table, distinct from the raster / illustrated / isochrone / photo dialects."
  lands: "A drafting sheet fills the frame: the real streets ink in by stroke-width hierarchy, the building footprints drawn as thin empty outlines, the home hatched inside its ten-minute walking ring. Then you click the school, or the post office, or the market, in the list or on the plan, and its real route draws itself along the actual roads in heavier ink, a dot walks it, and a small badge reads the honest minutes (9 хв to the school, 18 хв to Аврора). It reads engineered and expensive, a site plan made by someone who knows the village, not a screenshot of a map."
source:
  grammar: "locmap-engine (the map CANON: SMARTS motion + QUADRO IA, harvested from apps/smarts/src/js/sections/location.js: dual casing+stroke road hierarchy, Dijkstra draw + getPointAtLength walker + growing live timer, 9-gate reveal, asymmetric layer parallax, true-scale walking ring, two-way pin<->row sync). The variant's authored layer = the PEN/INK rendering (a full CSS re-theme of the engine tokens and layer classes to dark ink on warm paper, lit windows off via flicker.rate 1e9) plus the controlled-click model: the map reveals once, then click/hover draws the route. No second engine, no forced stepping, no scale-dive."
  recording: null
  registry_ref: ["locmap-canon", "SMARTS-location-etalon"]
uses:
  - { atom: locmap-engine, job: "owns_pin FALSE. Bakes the SAME real с. Агрономічне OSM (osm.js) into [data-lm-stage] and fills the visible [data-lm-list] with clickable rows synced two-way with the map pins; the whole map is re-themed to PEN/INK on drafting paper purely by CSS (re-pointed --lm-* tokens + road/building/parcel/ring/POI/route class overrides), lit windows killed via flicker.rate 1e9. reveal {start:'top 70%', once:true} plays the 9-gate birth on scroll-in; after that select(id) draws the real Dijkstra route + walker + the honest live 'N хв · M м' badge on click/hover. NO showStep, NO SectionHarness.pin(), NO scale transform on the SVG." }
pin: { owner: none, count: 0 }
pin_killed: []
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "MAP-STYLE is unmistakably PEN/INK DRAFTING in one screenshot: thin dark-ink strokes on warm drafting paper, road hierarchy by stroke-width only, building footprints as near-empty ink outlines (not filled blocks), parcel an ink hatch, ring thin dashed ink, POIs small ink-ringed dots, NO colour photo, NO Google/Mapbox/tiles, NO canvas, NO lit windows. Realism is identical to the dark etalon: the SAME dense real OSM, only the rendering differs."
  - "CONTROLLED-INTERACTIVE model: the map REVEALS on scroll-in once (9-gate birth), then the USER clicks (or hovers) any of the 6 real POIs on the plan OR in the visible side list and THAT draws the real Dijkstra route along the actual streets with a walking dot and a live honest minute badge. NO forced scroll-stepping, NO scale-dive, NO pin. Two-way hover (pin <-> list row)."
  - "asset-truth: streets, footprints, walking routes, POI names and minutes are the REAL baked OSM of с. Агрономічне (osm.js): the real road graph in-window, 6 real POIs (Школа·садок 9хв, Нова Пошта 10хв, Траш! 9хв, Подорожник 10хв, Грош Експрес 15хв, Аврора 18хв), real Dijkstra route per POI. NO invented streets/POIs/times. Coords 49.18° Пн · 28.33° Сх (Вінниця), plot 22,5 сотки on вул. Перемоги, never another city."
  - "ZERO pins (pin-less click section): SectionHarness.declare expectPins 0, pinOwner none; no SectionHarness.pin(), no engine pin. The live badge reads the HONEST 'N хв · M м' from the first frame (engine fix), never a count-up. pins === 0 in the probe, >= 6 .lm-row rows; click a row -> a .lm-route appears and the badge reads a real 'N хв · M м'."
  - "decode-guard: the [data-render-surface] field is a painted CSS background-image (drafting paper) at non-zero size from load; zero raster imagery (SVG map), no undecoded <img>/tile flicker."
  - "motion ONLY stroke-dashoffset / transform / opacity / filter; NO WebGL, NO canvas, NO mix-blend, NO backdrop-filter, NO video.currentTime, NO animating width/height/top/left/right/bottom/margin. will-change cleared after one-shots."
  - "reduced-motion -> the full plan + the selected route shown statically, __LAB_OK__ true; mobile 390px -> no pin, no horizontal overflow, __LAB_OK__ true. Zero real console errors in all modes. Copy Ukrainian, Fedoriv voice, sparse, proof-not-promises; ZERO em-dash/en-dash anywhere."
gate:
  probe: "Serve library/ and open combos/location--architects-sketch/combo-lab.html. __LAB_OK__ true, ScrollTrigger pin count === 0. Scroll the section in: the drafting plan births gate by gate (footprints, then the ink road hierarchy draws in, ring, parcel, ink-ringed POI dots) with >= 6 synced clickable .lm-row rows. Click a POI or a row -> a real Dijkstra route draws along the actual streets in heavier ink, a walker rides it, and the live badge reads the honest 'N хв · M м' from the first frame; click it again clears. Confirm the PEN/INK DRAFTING map-style by screenshot (unmistakable in one shot) and that only real OSM data appears, and that there is no forced stepping and no scale-dive."
note: |
  Variant of the location family REBUILT onto the map CANON (locmap-engine) for the
  CONTROLLED-INTERACTIVE click model (the smarts Агрономічне model). It is the SAME dense
  real OSM district as the dark etalon (location--surveyed-route-map) wearing a PEN/INK
  DRAFTING skin: a full CSS re-theme of the engine tokens + layer classes to thin dark ink
  on warm drafting paper, lit windows off (flicker.rate 1e9), building footprints as
  near-empty outlines, roads ranked by stroke-width only. The map reveals once on scroll-in,
  then the visitor clicks any of the 6 real POIs (on the plan or in the visible side list) to
  draw the real route + the honest minute badge; the side list is two-way synced with the
  pins. PIN-LESS: pinOwner none, expectPins 0 (correct and passes the gate). No second
  engine, no forced scroll-stepping, no scale transform. This replaces the earlier scroll-only
  pen-sketch (line-art-location-map + coords-corner-frame, no click) so the variant also
  supports click-to-route while keeping the austere drafting-sheet look. DATA is baked OSM
  (osm.js) shared with the etalon, never hand-invented (the F-24 authenticity lesson). LAWS:
  SVG only, GPU props, no tiles/Mapbox/canvas/WebGL, reduced-motion -> static.
---

# location--architects-sketch · "Схема від руки" (PEN/INK drafting plan, click-driven)

The LOCATION beat as an architect's hand site plan of с. Агрономічне drawn on the map CANON:
the SAME dense real OSM as the dark etalon, rendered as thin dark-ink strokes on warm drafting
paper (NO fills, NO colour, NO Google/Mapbox/tiles, NO lit windows). The plan reveals once on
scroll-in; then the visitor drives.

## The interaction (controlled-interactive, the smarts model)
- The plan REVEALS on scroll-in once (locmap-engine's 9-gate birth). After that nothing animates
  the map: no pin, no forced stepping, no scale-dive.
- The USER clicks (or hovers) any of the 6 real POIs, on the plan OR in the visible side list, and
  THAT draws the real Dijkstra route along the actual streets in heavier ink, a dot walks it, and a
  live badge reads the honest minutes. Two-way hover (pin <-> list row). Click again clears.

## Atom (cite, never inline)
- `locmap-engine` (owns_pin FALSE) bakes the real OSM and wires the route + the synced side list.
  The PEN/INK look is a pure CSS re-theme of its tokens and layer classes; lit windows are killed
  with `flicker.rate: 1e9`. The harness owns NO pin.

## Data (asset-truth)
`osm.js` (shared with the etalon). The real in-window streets, 6 real POIs with verbatim names +
real minutes + real Dijkstra route paths. Coords 49.18° Пн · 28.33° Сх. Plot 22,5 сотки on вул.
Перемоги. Nothing invented.

## Gate
`__LAB_OK__` true, pins === 0, >= 6 clickable `.lm-row` rows, click draws a `.lm-route` with the
honest `N хв · M м` badge, PEN/INK map-style unmistakable in one screenshot, full plan under
reduced-motion, no overflow at 390px, zero console errors, zero em/en-dash.
