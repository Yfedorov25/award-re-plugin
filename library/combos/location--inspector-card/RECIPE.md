---
id: location--inspector-card
name: "Карта-інспектор"
level: 2
kind: section-variant
section: location
status: candidate
map_style: "NIGHT-NEON"
composition: "INSPECTOR (full-bleed map hero, no big text, no list; hover/click a pin -> a floating detail card + route)"
webgl: false
ease: air
meaning:
  what: "A NEW award COMPOSITION on the night-neon map style where the MAP IS THE HERO: the real dense night map of с. Агрономічне fills the whole frame with NO big text over it and NO side list. CONTROLLED-CLICK: the map reveals on scroll-in, then the USER hovers/clicks any of the 6 real POI pins and a small elegant DETAIL CARD floats up beside that pin (name, walk/drive minutes, metres from the plot) while the real Dijkstra route draws + an honest minute badge. Click empty map clears. Pure explore-the-map; the only chrome is a tiny corner label + a one-line hint. Nothing covers the map; the card is a DOM node projected at the pin via the SVG CTM (transform/opacity only), so nothing floats/swims."
  when: "When the location beat should keep the MAP fully visible as the subject and invite exploration, rather than framing it with typography. The cleanest map-first format, distinct from the plain variants by its hover-to-inspect card interaction; distinct from the other new compositions (framed plate, split) by being uncovered full-bleed."
  lands: "A night map fills the screen and holds still; the visitor moves across it and a quiet card lifts beside each place with its real minutes and metres, the amber route drawing along the real streets to the lit parcel. It reads like inspecting a real surveyed map, not reading a poster: the place itself is the interface."
source:
  grammar: "locmap-engine (the night-neon re-theme, identical realism to location--night-neon) with a DOM detail card driven by the engine's onSelect hook + a hover handler on .lm-pt: the active POI's viewBox coord is projected to screen px via svg.getScreenCTM() and the card is positioned beside the pin (transform only). CONTROLLED-CLICK (the smarts model): pin-less, the map reveals on scroll-in, the visitor hovers/clicks the 6 real POIs to preview/draw routes; the offscreen [data-lm-list] sink satisfies the engine's row creation while the composition shows NO visible list (the pins are the interface). The composition is the variant's own contribution."
  recording: null
  registry_ref: ["locmap-canon", "SMARTS-location-etalon"]
uses:
  - { atom: locmap-engine, job: "owns_pin FALSE; bakes the dense real OSM night map into [data-lm-stage]; on click/hover of a POI pin fires onSelect + draws the real Dijkstra route + honest live minute badge. Re-themed night-neon in the variant skin; the variant adds the floating detail card positioned at the pin via the SVG CTM. reveal on scroll-in; no pin, no list shown." }
pin: { owner: none, count: 0 }
pin_killed: []
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "COMPOSITION is unmistakably INSPECTOR in one screenshot: the night map fills the frame with NO big text over it and NO visible side list; the only chrome is a tiny corner label + hint. Realism identical to location--night-neon. Verified by screenshot."
  - "asset-truth: streets/footprints/green + 6 real POIs (Школа·садок 9хв, Нова Пошта 10хв, Траш! 9хв, Подорожник 10хв, Грош Експрес 15хв, Аврора 18хв) from osm.js. Coords 49.18N 28.33E. NOTHING invented; the card shows the real walk/drive minutes + metres."
  - "CONTROLLED-INTERACTIVE, PIN-LESS: 0 pins, NO scroll-stepping, NO scale-dive. Map reveals once, then hover/click a POI pin -> a detail card floats beside it + the route draws + honest badge; click empty map clears. pins === 0."
  - "the floating card is positioned by the SVG CTM at the active pin (transform/opacity only) and shows the real label + walk хв + drive хв + metres; it flips to the left near the right edge and clamps vertically so it never leaves the frame."
  - "motion only transform/opacity/clip-path/filter/stroke-dashoffset; NO WebGL, NO mix-blend, NO backdrop-filter, NO canvas, NO scale-from-origin on the map. The map never moves after the reveal (no float)."
  - "decode-guard: [data-render-surface] painted (the night field) at non-zero size from load; zero raster imagery."
  - "reduced-motion -> static map, card appears without transition, __LAB_OK__ true; mobile 390px -> no overflow, __LAB_OK__ true. Zero real console errors."
  - "copy Ukrainian, Fedoriv voice; ZERO em-dash/en-dash anywhere."
gate:
  probe: "Serve library/ and open combos/location--inspector-card/combo-lab.html. __LAB_OK__ true, pin count === 0, 6 .lm-pt pins, NO visible list, no big text over the map. Hover/click a pin: a detail card floats beside it with the real label + minutes + metres, and the amber route draws with an honest badge. Click empty map clears. Confirm the INSPECTOR composition (map fully visible, the place is the interface) by screenshot + only real OSM data."
note: |
  NEW award COMPOSITION (display format), map-first: the night-neon map kept fully visible as the
  hero, with a floating detail card on hover/click of each pin (the place is the interface). One of
  the new composition variants on top of the fixed top-6 click-driven map styles. Replaced an earlier
  aperture-mask idea that was rejected (a giant word «ПОРУЧ» over the map took all the attention and
  hid the map) — the rule learned: NO big text over the map; the map is the hero (see FAILURES-LOG).
  locmap-engine re-themed night-neon + the card built in the variant skin; CONTROLLED-CLICK, pin-less,
  no float (DOM card via SVG CTM, never scale-from-origin).
---

# location--inspector-card · "Карта-інспектор" (map-first inspector)

A new composition on the night-neon map style where the map is the hero: it fills the frame with no
big text and no list. Hover or click any of the 6 real POI pins and an elegant detail card floats up
beside it (real minutes + metres) while the route draws. The place itself is the interface.
