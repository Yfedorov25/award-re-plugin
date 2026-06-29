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
  what: "The LOCATION beat at the surveyed-route-map level of cartographic REALISM (the SAME dense baked OSM district of с. Агрономічне: real road hierarchy by class, 823 building footprints, the site parcel inside a true-scale 10-minute walking ring, real Dijkstra routes drawn along the actual streets with a walking dot and a live minute counter), re-rendered in a DIFFERENT cartographic TREATMENT: a stark editorial plan in pure black linework on pure white paper, NO warm-lit windows, with ONE single red accent reserved for the active route. Same locmap-engine, same real data, same mechanic as the ideal; only the palette and line/fill treatment differ. The section pins; scroll STEPS through the 6 real POIs one at a time, each drawing its real red route + live minutes; one clean story block per step, cross-faded so two are never legible at once."
  when: "When the LOCATION section wants a stark, modern, editorial register: a printed black-and-white survey where a single red line is the only colour, and that colour is the walk to each real place. The most graphic, high-contrast member of the map-style lane, distinct from the dark-dusk ideal and the warm heritage treatment by being pure monochrome with one accent."
  lands: "A crisp printed plan: the whole street grid and hundreds of building footprints in black on white, the thick black highway cutting the diagonal, the property parcel hatched in ink inside its dashed walking ring. As you scroll the camera holds; the only colour on the sheet is a single red line that draws itself along the real streets to the school, the post office, the market, a red dot walking it while the minutes count up to the honest number. It reads engineered, expensive and graphic, not decorative."
source:
  grammar: "locmap-engine (the map CANON: dual casing+stroke road hierarchy, Dijkstra draw + getPointAtLength walker + growing live timer, 9-gate reveal, asymmetric layer parallax, true-scale walking ring) re-themed via CSS variables + class overrides into a hi-contrast monochrome treatment (black strokes over white halo casing, light-black footprints with NO lit windows, one red route accent). The authored layer = the scroll-stepped POI tour: harness pin -> step index -> map.select() + one cross-faded story block per step. Same composition as surveyed-route-map; the variant's own contribution is the mono RE-THEME, which the lane's new map-style taxonomy treats as a first-class variant (not a forbidden reskin)."
  recording: null
  registry_ref: ["locmap-canon", "SMARTS-location-etalon"]
uses:
  - { atom: locmap-engine, job: "owns_pin FALSE; reads the REAL baked OSM (osm.js -> osm-agronomichne.js) and bakes the dense district SVG into [data-lm-stage]; on map.select(id) draws the dataset's real Dijkstra route via stroke-dashoffset while a walker rides getPointAtLength and a live badge counts minutes up to the real walk-time. flicker.rate huge so NO windows light (mono has no warm glow). Re-themed to black-on-white + one red accent purely by the variant CSS (engine code untouched). Its reveal/parallax triggers do NOT pin." }
pin: { owner: harness, count: 1 }
pin_killed: []
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "MAP-STYLE is unmistakably HI-CONTRAST MONO in one screenshot: pure black linework on white paper, NO lit windows, ONE red accent reserved for the active route. Realism is identical to the surveyed-route-map ideal (same dense real OSM: full street grid + 823 footprints + named streets + parcel + walking ring), distinct from the other map styles by TREATMENT not by medium. Verified by screenshot."
  - "asset-truth: streets, footprints, green, walking routes, POI names and minutes are the REAL baked OSM of с. Агрономічне (osm.js -> osm-agronomichne.js): 136 roads, 823 footprints, 6 real POIs (Школа·садок 9хв, Нова Пошта 10хв, Траш! 9хв, Подорожник 10хв, Грош Експрес 15хв, Аврора 18хв), real Dijkstra route per POI. NO invented streets/POIs/times. Coords 49.18N 28.33E (Вінниця), never another city."
  - "ONE pin only (harness owns it; locmap-engine is owns_pin FALSE). Scroll-LOCK with pinSpacing while the mechanic plays. pins === 1 in the probe."
  - "story text SEQUENCED: exactly one story block legible (opacity >= 0.85) at any scroll position, cross-faded; never two at once, never a full-screen wall. Verified across 5 scroll samples (zero overlapping text-bearing pairs)."
  - "decode-guard: the [data-render-surface] field is a painted CSS background (white paper grain) at non-zero size from load; no undecoded <img>/tile flicker (the medium uses zero raster imagery)."
  - "motion ONLY stroke-dashoffset / transform / opacity / filter; NO WebGL, NO mix-blend, NO backdrop-filter, NO video.currentTime, NO animating width/height/top/left/margin. will-change cleared after one-shots."
  - "reduced-motion -> the full map + first route shown statically, text steppable, __LAB_OK__ true; mobile 390px -> no horizontal overflow, __LAB_OK__ true. Zero real console errors."
  - "copy Ukrainian, Fedoriv voice, sparse, proof-not-promises; ZERO em-dash/en-dash anywhere in the file."
gate:
  probe: "Serve library/ and open combos/location--hi-contrast-mono/combo-lab.html. __LAB_OK__ true, ScrollTrigger pin count === 1. Scroll the pinned range: the dense black-on-white district reads as a real survey (full grid, 823 footprints, named streets, parcel, walking ring); the section STEPS through the 6 real POIs, each drawing its REAL red Dijkstra route along the streets with a red walker + live minute badge and ONE serif story block (name + real minutes) legible at a time. Confirm the HI-CONTRAST MONO treatment by screenshot and that only real OSM data appears."
note: |
  Map-style variant of the location lane: the SAME medium as the surveyed-route-map ideal
  (dense real OSM via locmap-engine, real Dijkstra routes, live minute counter), re-rendered
  in a hi-contrast monochrome treatment. This is the NEW lane taxonomy: ONE realistic medium,
  MANY cartographic styles (see PATTERNS/location-patterns.md MAP-STYLE section). The engine is
  re-themed purely by CSS variables + class overrides in the variant SKIN (engine code untouched):
  --lm-* re-pointed to black-on-white, road strokes set to black over white halo casing, lit
  windows killed via flicker.rate, and a single red --lm-accent for the active route. The map
  atom is pinless; the single harness pin is the only scroll owner; the one-block-at-a-time read
  is hand-wired as a cross-fade (the surveyed-route-map pattern). No theme-tween (mono is a fixed
  palette, not a dusk recolour).
---

# location--hi-contrast-mono · "Чорним по білому" (high-contrast monochrome map)

The LOCATION beat at the ideal's level of cartographic realism, re-rendered as a stark printed
plan: the dense real OSM of с. Агрономічне in pure black linework on white paper, NO lit windows,
with a single red line the only colour on the sheet, reserved for the active walking route.

## The single scroll (harness pin)
- The dense district is baked from the REAL OSM by locmap-engine (re-themed mono via CSS).
- Scroll STEPS through the 6 real POIs. Each step calls `map.select(id)`: the dataset's real
  Dijkstra route draws in red via stroke-dashoffset, a red walker rides it, and a live red badge
  counts the minutes up to the real walk-time. ONE serif story block (number + place + real
  minutes) is legible at a time, cross-faded so two are never readable at once.

## Map-style
Same engine, same real data, same mechanic as `surveyed-route-map`; the only difference is the
cartographic TREATMENT (hi-contrast monochrome + one red accent), achieved entirely in the variant
CSS. Pairs in the lane with the dark-dusk ideal, the warm heritage-sepia treatment, the pen-sketch,
and the reworked radiating-thread / scale-zoom variants, each a different-looking REAL map.
