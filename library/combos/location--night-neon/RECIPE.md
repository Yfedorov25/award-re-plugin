---
id: location--night-neon
name: "Район уночі"
level: 2
kind: section-variant
section: location
status: base
map_style: "NIGHT-NEON (click-driven)"
webgl: false
ease: air
meaning:
  what: "The LOCATION beat at the surveyed-route-map level of cartographic REALISM (the SAME dense baked OSM district of с. Агрономічне: real road hierarchy by class, real building footprints, the site parcel at 746.3,324.9 inside a true-scale 10-minute walking ring, real Dijkstra routes drawn along the actual streets with a walking dot and a live minute counter), rendered ONCE by locmap-engine in a NIGHT-NEON treatment: a near-black field with a faint cool glow, the road grid GLOWING by rank (cyan on the highway, amber on the main artery) via filter drop-shadow over a very dark casing, a low rate of warm-lit windows so the town reads as alive after dark, and a hot-amber active route with a glowing walker. The CONTROLLED-INTERACTIVE model: the map REVEALS on scroll-in once, then there is NO pin and NO forced stepping and NO scale dive. The visitor clicks (or hovers) any of the 6 real POIs, on the map or in a visible side list, and THAT draws the real route along the actual streets while a dot walks it and a live badge shows the honest walk-time. Two-way hover (pin to list row and back). Same locmap-engine, same real data, same routes as the ideal; the DIFFERENT cartographic TREATMENT is the night-neon paint."
  when: "When the LOCATION section wants the town to read as a living grid lit up at night and lets the buyer drive: the most authentic-geography answer with a nocturnal mood, not a stylised illustration or a number, but the true street graph glowing after dark with the walk to the school, pharmacy, Nova Poshta drawn along the streets you would really walk and timed to the real minute on click. The NIGHT member of the map-style lane: the same dense real survey as the ideal, controlled by the visitor instead of scroll-stepped, distinct from the dark-dusk ideal and the slate-day and sepia treatments by being a near-black neon-lit night map."
  lands: "A near-black aerial of the town fills the frame: streets glowing in a believable hierarchy (cyan trunk, amber artery, cool side lanes), a scatter of warm-lit windows like lamps left on, the property marked with a luminous hatched parcel and a soft pulse inside a glowing ten-minute walking ring. Numbered points sit on real places; click one (on the map or in the side list) and a hot-amber route draws itself along the actual streets, a glowing dot walks it, and a little badge shows the honest minutes to the destination. The camera never moves and nothing animates the grid after it reveals, so it never floats; the visitor drives. It reads as a bespoke surveyed map seen at night, the kind that costs money to make, not an embedded widget."
source:
  grammar: "locmap-engine (the map CANON: dual casing+stroke road hierarchy, deterministic lit windows, Dijkstra draw + getPointAtLength walker + growing live minute timer, the property parcel + true-scale walking ring, numbered POIs synced two-way with a side list, a 9-gate reveal, asymmetric layer parallax) re-themed entirely via CSS variables + class overrides into a NIGHT-NEON treatment (near-black field, road strokes glowing by rank via filter drop-shadow over a very dark casing, warm-lit windows ON at a low flicker rate, a hot-amber accent for the active route + parcel + a glowing walker). The interaction is the engine's NATIVE controlled-interactive model: reveal once on scroll-in, then the visitor clicks/hovers a POI or a list row to draw its real route. Same medium and realism as surveyed-route-map; the variant's own contribution is the NIGHT-NEON map re-theme. Reworked from an earlier scale-zoom dive (it floated and the owner rejected it) into the pin-less click model on a night map."
  recording: null
  registry_ref: ["locmap-canon", "SMARTS-location-etalon"]
uses:
  - { atom: locmap-engine, job: "owns_pin FALSE; reads the REAL baked OSM (osm.js) and bakes the dense district SVG into [data-lm-stage]; fills the visible [data-lm-list] with clickable .lm-row rows synced two-way with the numbered map pins; on click/hover of a POI or row draws the dataset's real Dijkstra route via stroke-dashoffset while a walker rides getPointAtLength and a live badge reads the honest 'N хв · M м' from the first frame. flicker.rate 9 so a low rate of windows glow warm (the town lit at night); reveal once on scroll-in (start top 70%); asymmetric parallax green/buildings/pins. Re-themed to near-black + glowing neon roads + a hot-amber accent purely by the variant CSS (filter drop-shadow on the road/parcel/route/walker strokes). Engine code untouched; the section owns NO pin." }
pin: { owner: none, count: 0 }
pin_killed: [zoom-to-the-door, dive-three-beats]
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "MAP-STYLE is unmistakably NIGHT-NEON in one screenshot: a near-black field with a faint cool glow, the road grid GLOWING by rank (cyan highway, amber artery via filter drop-shadow) over a very dark casing, a scatter of warm-lit windows, the luminous hatched parcel + glowing walking ring. Realism is identical to the surveyed-route-map ideal (same dense real OSM: full street grid + footprints + named streets + parcel + walking ring), distinct from the other map styles by TREATMENT, not by medium. Verified by screenshot."
  - "asset-truth: streets, footprints, green, walking routes, POI names and minutes are the REAL baked OSM of с. Агрономічне (osm.js): site at 746.3,324.9, 6 real POIs (Школа·садок 9хв, Нова Пошта 10хв, Траш! 9хв, Подорожник 10хв, Грош Експрес 15хв, Аврора 18хв), real Dijkstra route per POI; two real street labels (вул. Перемоги, вул. Грушевського). NO invented streets/POIs/times/geometry. Coords 49.18N 28.33E (Вінниця), never another city."
  - "CONTROLLED-INTERACTIVE model: the map REVEALS once on scroll-in (the 9-gate timeline), then there is NO pin, NO forced scroll-stepping, NO scale dive. The USER clicks (or hovers) any of the 6 real POIs on the map OR in the visible side list, and THAT draws the real route + walks the dot + grows the honest live minute badge. Two-way hover (pin to row and back). The visitor drives; nothing animates the map after the reveal."
  - "ZERO pins (pin-less click section): NO SectionHarness.pin(), NO scale transform on the SVG, NO scroll-stepping. pins === 0 in the probe; the side list is VISIBLE in the rail with >= 6 clickable .lm-row rows."
  - "the rail carries an eyebrow (Район уночі) + a serif title (Що поруч) + a hint (Натисніть місце, щоб побачити шлях і час пішки.) + the coords (49.18 Пн · 28.33 Сх · 5 хвилин від Вінниці) + the data-lm-list; on click a .lm-route appears and the .lm-livet badge reads a real 'N хв · M м'."
  - "decode-guard: the [data-render-surface] field is a painted CSS background (near-black night field with a cool glow) at non-zero size from load; no undecoded <img>/tile flicker (the medium uses zero raster imagery)."
  - "motion ONLY stroke-dashoffset / transform / opacity / filter; NO WebGL, NO mix-blend, NO backdrop-filter, NO video.currentTime, NO animating width/height/top/left/margin. will-change cleared after the reveal one-shots."
  - "reduced-motion -> the full map + a route shown statically, __LAB_OK__ true; mobile 390px -> no horizontal overflow, no pin, __LAB_OK__ true. Zero real console errors. Copy Ukrainian, Fedoriv voice, sparse, proof-not-promises; ZERO em-dash/en-dash anywhere in the file."
gate:
  probe: "Serve library/ and open combos/location--dive-to-the-gate/combo-lab.html. __LAB_OK__ true, ScrollTrigger pin count === 0. Scroll the map in: the dense near-black district REVEALS gate by gate (glowing roads, lit windows, the luminous parcel + walking ring, the numbered pins) and reads instantly as the town grid lit up at night. The side list shows 6 clickable rows. Click a POI or a row: a hot-amber Dijkstra route draws along the real streets, a glowing walker rides it, and the live badge reads the honest 'N хв · M м'; clicking it again clears. Confirm the NIGHT-NEON treatment by screenshot and that only real OSM data appears."
note: |
  Map-style variant of the location lane: the SAME medium as the surveyed-route-map ideal
  (dense real OSM via locmap-engine, real Dijkstra routes, live minute counter, visible synced
  side list), re-rendered in a NIGHT-NEON treatment and driven by the engine's NATIVE
  controlled-interactive model (reveal once, then the visitor clicks POIs to draw routes). This
  is the lane taxonomy: ONE realistic medium, MANY cartographic styles (see
  PATTERNS/location-patterns.md MAP-STYLE section). REWORK: an earlier build dived through three
  scale beats (a CSS scale transform on the SVG group across a harness pin); it floated and the
  owner rejected the dive. This rebuild DROPS the scale-zoom entirely and rebuilds as the pin-less
  click model on a night map. The engine is re-themed purely by CSS variables + class overrides in
  the variant SKIN (engine code untouched): --lm-* re-pointed to near-black + cool ink + a hot-amber
  accent, road strokes glowing by rank via filter drop-shadow over a very dark casing, warm-lit
  windows kept ON at a low flicker.rate (the town at night), the parcel + ring + route + walker
  luminous. The section owns NO pin (pinOwner none, expectPins 0); the visitor drives. Two real
  street names (вул. Перемоги, вул. Грушевського) ride the night map as real OSM labels.
---

# location--dive-to-the-gate · "Район уночі" (NIGHT-NEON, click-driven)

The LOCATION beat at the ideal's level of cartographic realism, rendered as the town grid lit up at
night: the dense real OSM of с. Агрономічне in a near-black neon treatment, revealed once on
scroll-in, then driven by the visitor.

## The controlled interaction (no pin)
- The dense district is baked from the REAL OSM by locmap-engine (re-themed near-black neon via CSS)
  and REVEALS once on scroll-in via the 9-gate timeline. After that nothing animates the map.
- The side list in the rail shows 6 clickable rows (the 6 real POIs), synced two-way with the
  numbered map pins. Click or hover a row OR a pin and the engine draws that POI's real Dijkstra
  route in hot amber with a glowing walker + a live minute badge reading the honest 'N хв · M м'.
- There is NO section pin, NO forced scroll-stepping, NO scale dive. The visitor drives; the map
  never floats because nothing transforms it after the reveal.

## Map-style
Same engine, same real data, same routes as `surveyed-route-map`; the difference is the cartographic
TREATMENT, a near-black NIGHT-NEON map (roads glowing by rank via filter drop-shadow over a very dark
casing, a low rate of warm-lit windows, a hot-amber route + parcel + walker), achieved entirely in
the variant CSS. Pairs in the lane with the dark-dusk ideal, the slate-blue day treatment, the
heritage sepia, and the pen-sketch, each a different-looking REAL map.
