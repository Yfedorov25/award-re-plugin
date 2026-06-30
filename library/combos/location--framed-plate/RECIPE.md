---
id: location--framed-plate
name: "Карта-експонат"
level: 2
kind: section-variant
section: location
status: candidate
map_style: "HERITAGE-SEPIA"
composition: "FRAMED EXHIBIT (the map as a framed plate on a warm mat + a surveyed corner frame; a caption strip below)"
webgl: false
ease: air
meaning:
  what: "A NEW award COMPOSITION on the heritage-sepia map style: the real dense sepia map of с. Агрономічне is presented as a framed PLATE (a thin inset border + soft shadow + a surveyed corner frame: coords, scale bar, north arrow, sheet labels) on a darker warm MAT with air around it, like an expensive map in a frame on a wall. NO big text over the map; the map is the hero and the frame makes it read costly. A thin caption strip of the 6 real POIs sits BELOW the plate. CONTROLLED-CLICK: reveals on scroll-in, then the USER clicks/hovers a POI (in the strip or on the map) and the real Dijkstra route draws + honest minute badge. Everything is a layout frame around the map (no transform on the map), so nothing floats."
  when: "When the location beat should read as a curated, gallery-grade artifact: a surveyed map presented like a framed exhibit, heritage/villa register. The map stays the subject; distinct from the plain variants by the framed-plate presentation, and from the inspector composition by keeping a visible caption strip and a surveyed corner frame."
  lands: "A warm dark wall with a single framed map on it: the sepia town under a thin border with corner survey ticks, coordinates and a scale bar, and below it a quiet line of the nearby places. Click one and the rust route draws along the real streets to the lit parcel. It reads like an expensive printed plate someone hung, not a web map."
source:
  grammar: "locmap-engine (the heritage-sepia re-theme, identical realism to location--heritage-sepia) presented as a framed plate: a CSS mat + inset border + shadow around the map, the coords-corner-frame atom injecting the surveyed corners (coords, scale bar, north, sheet labels), and a caption strip below carrying the eyebrow + title + the engine's clickable [data-lm-list] rows rendered as a thin horizontal strip. CONTROLLED-CLICK (the smarts model): pin-less, the map reveals on scroll-in, the visitor clicks/hovers the 6 real POIs to draw routes. The framed-exhibit composition is the variant's own contribution."
  recording: null
  registry_ref: ["locmap-canon", "SMARTS-location-etalon"]
uses:
  - { atom: locmap-engine, job: "owns_pin FALSE; bakes the dense real OSM sepia map into [data-lm-stage] inside the framed plate, fills the caption strip [data-lm-list] with clickable .lm-row rows; on click/hover draws the real Dijkstra route + honest live minute badge. Re-themed sepia in the variant skin; reveal on scroll-in; no pin." }
  - { atom: coords-corner-frame, job: "owns_pin FALSE; injects the surveyed corner frame onto the plate (four tick corners that draw, a 49.18N 28.33E coord readout, a 0...500 м scale bar, a north arrow, sheet labels), tinted ink-on-paper. Pure overlay; reveals with the map." }
pin: { owner: none, count: 0 }
pin_killed: []
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "COMPOSITION is unmistakably a FRAMED EXHIBIT in one screenshot: the sepia map sits as a bordered plate on a darker warm mat with air around it + a surveyed corner frame; NO big text over the map; a thin caption strip of POIs sits below. Realism identical to location--heritage-sepia. Verified by screenshot."
  - "asset-truth: streets/footprints/green + 6 real POIs (Школа·садок 9хв, Нова Пошта 10хв, Траш! 9хв, Подорожник 10хв, Грош Експрес 15хв, Аврора 18хв) from osm.js. Coords 49.18N 28.33E. NOTHING invented."
  - "CONTROLLED-INTERACTIVE, PIN-LESS: 0 pins, NO scroll-stepping, NO scale-dive. Map reveals once, then the USER clicks/hovers a POI (caption strip row or map pin) to draw its route + honest badge. pins === 0."
  - "the caption strip below the plate shows the engine's >=6 clickable .lm-row rows (number + name + minutes), two-way synced with the map pins; clicking one draws that POI's route."
  - "the framed plate carries the coords-corner-frame surveyed corners (coords + scale bar + north + sheet labels); the map is NOT transformed (the frame is layout/CSS only), so it never floats."
  - "motion only transform/opacity/clip-path/filter/stroke-dashoffset; NO WebGL, NO mix-blend, NO backdrop-filter, NO canvas, NO scale-from-origin on the map."
  - "decode-guard: [data-render-surface] painted (the aged paper) at non-zero size from load; zero raster imagery. reduced-motion -> static framed map + strip, __LAB_OK__ true; mobile 390px -> the caption strip stacks, no overflow, __LAB_OK__ true. Zero real console errors."
  - "copy Ukrainian, Fedoriv voice; ZERO em-dash/en-dash anywhere."
gate:
  probe: "Serve library/ and open combos/location--framed-plate/combo-lab.html. __LAB_OK__ true, pin count === 0. Scroll in: the sepia map reveals inside a framed plate on a warm mat with a surveyed corner frame; below it a thin POI caption strip. Click a strip row/pin: the rust route draws with an honest badge. Confirm the framed-exhibit composition (map as hero, no big text over it) by screenshot + only real OSM data."
note: |
  NEW award COMPOSITION (display format), map-first: the heritage-sepia map presented as a framed
  gallery plate on a warm mat + a surveyed corner frame, with a thin POI caption strip below. One of
  the new composition variants on top of the fixed top-6 click-driven map styles. The rule that shaped
  it: NO big text over the map (the map is the hero) (see FAILURES-LOG, the rejected aperture). The map
  is never transformed (the frame is CSS layout), so it never floats. locmap-engine sepia +
  coords-corner-frame; CONTROLLED-CLICK, pin-less.
---

# location--framed-plate · "Карта-експонат" (the map as a framed gallery exhibit)

A new composition on the heritage-sepia map style: the real dense sepia map of с. Агрономічне
presented as a framed plate on a warm mat, with a surveyed corner frame and a thin POI caption strip
below. The map stays the hero; clicking a place draws its rust route. No big text over the map.
