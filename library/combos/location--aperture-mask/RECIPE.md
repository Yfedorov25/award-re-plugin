---
id: location--aperture-mask
name: "Поруч (карта крізь слово)"
level: 2
kind: section-variant
section: location
status: candidate
map_style: "NIGHT-NEON"
composition: "TYPOGRAPHIC APERTURE (the live map seen through a giant serif word «ПОРУЧ» cut into a dark scrim)"
webgl: false
ease: air
meaning:
  what: "A NEW award COMPOSITION on top of the night-neon map style: the real dense night map of с. Агрономічне is seen BRIGHTEST through a giant serif word «ПОРУЧ» punched into a dark scrim (an SVG luminance mask); outside the word the same live map is dimmed to atmosphere. The word is the window. CONTROLLED-CLICK: the map reveals on scroll-in, then the USER clicks/hovers the 6 real POIs (map or the visible side list) and that draws the real Dijkstra route + honest minute badge. The aperture is pure SVG mask + a light parallax drift, so it never floats."
  when: "When the location beat should open with a typographic, gallery-grade gesture rather than a plain full-bleed map: the headline IS the viewport into the neighbourhood. The boldest display format of the location lane, distinct from the plain map variants by COMPOSITION not palette."
  lands: "A dark night field with the word ПОРУЧ glowing from within: through the letterforms the town's lit streets and the cyan highway show bright, the rest of the field sunk to mood. The visitor clicks a place and the amber route draws along the real streets with the honest minute, the lit window of the word framing it. It reads like a gallery title sequence, expensive and intentional."
source:
  grammar: "locmap-engine (the night-neon re-theme, identical realism to location--night-neon) under a typographic aperture: an SVG luminance <mask> punches the word «ПОРУЧ» out of a dark scrim so the live map glows through the glyphs; a hairline outline of the same word + a gentle scroll parallax give the cut depth. CONTROLLED-CLICK (the smarts model): pin-less, the map reveals on scroll-in, the visitor clicks/hovers the 6 real POIs to draw routes. The composition is the variant's own contribution; the map + interaction are the canon."
  recording: null
  registry_ref: ["locmap-canon", "SMARTS-location-etalon"]
uses:
  - { atom: locmap-engine, job: "owns_pin FALSE; bakes the dense real OSM night map into [data-lm-stage], fills the visible [data-lm-list] with clickable .lm-row rows two-way synced with the pins; on click/hover draws the real Dijkstra route + honest live minute badge. Re-themed night-neon + framed by the variant's SVG aperture mask purely in the variant skin (engine untouched). reveal on scroll-in; no pin." }
pin: { owner: none, count: 0 }
pin_killed: []
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "COMPOSITION is unmistakably a TYPOGRAPHIC APERTURE in one screenshot: the live night map glows through the letterforms of «ПОРУЧ» cut into a dark scrim; outside the word the map is dimmed. Realism identical to location--night-neon. Verified by screenshot."
  - "asset-truth: streets/footprints/green + 6 real POIs (Школа·садок 9хв, Нова Пошта 10хв, Траш! 9хв, Подорожник 10хв, Грош Експрес 15хв, Аврора 18хв) from osm.js. Coords 49.18N 28.33E. NOTHING invented."
  - "CONTROLLED-INTERACTIVE, PIN-LESS: 0 pins, NO scroll-stepping, NO scale-dive. Map reveals once, then the USER clicks/hovers a POI (map or list row) to draw its route; the scrim is pointer-events:none so clicks pass through. pins === 0."
  - "the side list is VISIBLE ([data-lm-list]) with >=6 clickable .lm-row rows, two-way synced; clicking a row draws that POI's real route + a real 'N хв · M м' badge."
  - "the aperture is pure SVG <mask> + transform/opacity parallax; NO WebGL, NO mix-blend, NO backdrop-filter, NO canvas, NO scale-from-origin on the map. Motion only transform/opacity/clip-path/filter/stroke-dashoffset."
  - "decode-guard: [data-render-surface] painted (the night field) at non-zero size from load; zero raster imagery."
  - "reduced-motion -> static map + aperture, rows clickable, __LAB_OK__ true; mobile 390px -> no overflow, __LAB_OK__ true. Zero real console errors."
  - "copy Ukrainian, Fedoriv voice; ZERO em-dash/en-dash anywhere."
gate:
  probe: "Serve library/ and open combos/location--aperture-mask/combo-lab.html. __LAB_OK__ true, pin count === 0. Scroll in: the night map reveals and the word «ПОРУЧ» lights as an aperture into it. Click a row/pin: the amber route draws with an honest badge. Confirm the typographic-aperture composition by screenshot + only real OSM data."
note: |
  NEW award COMPOSITION (display format), not a palette reskin: the night-neon map seen through a
  typographic aperture (the word «ПОРУЧ» as a luminance-masked window). One of three new composition
  variants on top of the fixed top-6 click-driven map styles (see PATTERNS map-style + the
  location-award-compositions memory). locmap-engine re-themed night-neon + framed entirely in the
  variant skin; CONTROLLED-CLICK, pin-less, no float (SVG mask + parallax, never scale-from-origin).
---

# location--aperture-mask · "Поруч" (typographic aperture into the night map)

A new composition on the night-neon map style: the real dense night map of с. Агрономічне seen
brightest through a giant serif «ПОРУЧ» cut into a dark scrim. Controlled-click: the map reveals,
then the visitor clicks the 6 real POIs to draw routes. Pure SVG mask + parallax, never floats.
