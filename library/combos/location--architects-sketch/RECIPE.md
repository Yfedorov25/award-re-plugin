---
id: location--architects-sketch
name: "Схема від руки"
level: 2
kind: section-variant
section: location
status: base
medium: "PEN-SKETCH (1px strokes, dashoffset draw)"
webgl: false
ease: air
meaning:
  what: "The LOCATION beat rendered as an architect's hand-sketch: a MONOCHROME pen drawing of с. Агрономічне, thin (~1px) cream strokes on a brown drafting field, NO fills, NO colour photography, NO Google / NO Mapbox / NO tiles. The REAL OSM streets DRAW in via stroke-dashoffset, a ringed survey crosshair marks the real site point, the 6 real POIs ladder up on hairline leader-lines with their real minutes, and as the section pins each POI's REAL Dijkstra walking route draws along the actual streets. A coords-corner-frame plate (49.18N 28.33E, scale bar, north arrow, sheet labels) frames it as a drafting table."
  when: "When the LOCATION section should feel SURVEYED and authored, not consumer-mapped: a quiet, austere, premium register that answers 'can I live my life from here' by literally drawing the walk to each real place. The medium reads as a studio's site plan, distinct from any raster / illustrated / isochrone / photo map."
  lands: "The plate draws itself in front of you like a hand on a drafting board: streets ink in, the survey crosshair finds the site, then one real walking route after another draws to the school, the post office, the market, while a single serif line names each place and its real minutes. It reads engineered and expensive, a sketch made by someone who knows the village, not a screenshot of a map."
source:
  grammar: "11tanjung's monochrome line-art WHERE beat (line-art-location-map, D_11tanjung D2) framed by a surveyor's drafting plate (coords-corner-frame). The pen-sketch medium + real-Dijkstra-route-per-step is the variant's own composition, not a re-theme of a tile/vector map engine."
  recording: null
  registry_ref: []
uses:
  - { atom: line-art-location-map, job: "owns_pin FALSE; reads our static [data-draw] REAL OSM road paths + [data-target] site crosshair + .lam-poi REAL POI markers and returns a PURE set(p) scrub of the whole pen-sketch reveal (roads draw via stroke-dashoffset 0..0.55, crosshair 0.30..0.62, POIs ladder bottom-to-top 0.45..1). Its own onEnter trigger is KILLED at wire-time so ONLY the harness pin drives set(p); no auto-play, no second trigger." }
  - { atom: coords-corner-frame, job: "owns_pin FALSE; injects the drafting plate overlay (four survey tick-corners that DRAW via stroke-dashoffset + a 49.18N 28.33E coordinate readout + a 0 ... 500 м scale bar + a north arrow + corner labels План локації / Масштаб / Аркуш 01 / OSM 2026). set(p) is a PURE scrub ridden on the same harness pin so the plate draws in with the sketch." }
pin: { owner: harness, count: 1 }
pin_killed: []
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "MEDIUM is unmistakably PEN-SKETCH: thin ~1px cream strokes on a brown drafting field, NO fills, NO colour photo, NO Google/Mapbox/tiles, NO canvas drawImage. Verified by screenshot."
  - "asset-truth: streets, walking routes, POI names and minutes are the REAL baked OSM of с. Агрономічне (osm.js -> osm-agronomichne.js): 80 real streets in-window, 6 real POIs (Школа·садок 9хв, Нова Пошта 10хв, Траш! 9хв, Подорожник 10хв, Грош Експрес 15хв, Аврора 18хв), real Dijkstra route per POI. NO invented streets/POIs/times. Coords 49.18N 28.33E (Вінниця), never another city."
  - "ONE pin only (harness owns it; line-art-location-map + coords-corner-frame are owns_pin FALSE, the map atom's own trigger is killed). Scroll-LOCK with pinSpacing while the mechanic plays. pins === 1 in the probe."
  - "pin-story text SEQUENCED: exactly one story block legible (opacity >= 0.85) at any scroll position, cross-faded; never two at once, never a full-screen wall. Verified across 7 scroll samples (blocksLegible === 1 each)."
  - "decode-guard: the [data-render-surface] field is a painted CSS background-image (drafting paper) at non-zero size from load; no undecoded <img>/tile flicker (the medium uses zero raster imagery)."
  - "motion ONLY stroke-dashoffset / transform / opacity / filter; NO WebGL, NO mix-blend, NO backdrop-filter, NO video.currentTime, NO animating width/height/top/left/margin. will-change cleared after one-shots."
  - "reduced-motion -> the full sketch + plate shown statically (80/80 roads drawn), text steppable, __LAB_OK__ true; mobile 390px -> no horizontal overflow, __LAB_OK__ true. Zero real console errors in all three modes."
  - "copy Ukrainian, Fedoriv voice, sparse, proof-not-promises; ZERO em-dash/en-dash anywhere in the file."
gate:
  probe: "Serve library/ and open combos/location--architects-sketch/combo-lab.html. __LAB_OK__ true, ScrollTrigger pin count === 1. Scroll the pinned range: the REAL streets ink in by stroke-dashoffset, the survey crosshair finds the real site, the drafting plate (coords/scale/north/labels) draws in, then the section STEPS through the 6 real POIs, each drawing its REAL Dijkstra route along the streets with ONE serif story block (name + real minutes) legible at a time. Confirm the PEN-SKETCH medium by screenshot and that only real OSM data appears."
note: |
  Variant #8 of the location family (medium = PEN-SKETCH), distinct by MEDIUM from the
  other nine (illustrated map / typographic-minute / scale-zoom / isochrone-area /
  surveyed-vector-route / raster-tiles / video-no-map / photo-rail / arched-photo).
  Built from the REAL Агрономічне OSM dataset via a deterministic geometry pass (focus
  viewBox 255 35 600 560; 80 in-window streets sorted faint->prominent; one real Dijkstra
  route path per POI), so the geometry is asset-true, never hand-invented. The map atom is
  pinless and its onEnter trigger is killed so the single harness pin is the only scroll
  owner; coords-corner-frame rides the same pin. No pin-story-text atom is cited (its pin
  would be a second owner); the sequenced one-block-at-a-time read is hand-wired as a
  cross-fade, the surveyed-route-map pattern.
---

# location--architects-sketch · "Схема від руки" (pen-sketch location plate)

The LOCATION beat as a monochrome architect's hand-sketch of с. Агрономічне: thin cream
strokes on a brown drafting field (NO fills, NO colour, NO Google/Mapbox/tiles). The REAL
OSM streets draw in, a survey crosshair marks the real site, the drafting plate frames it
(49.18N 28.33E, scale bar, north), and as the section pins each of the 6 real POIs draws its
REAL Dijkstra walking route along the actual streets, one serif story line at a time.

## The single scroll (harness pin)
- 0 .. ~0.38: `line-art-location-map.set(p)` + `coords-corner-frame.set(p)` draw the pen-sketch
  and the plate in (stroke-dashoffset / opacity / transform only).
- ~0.38 .. 1: STEP through the 6 real POIs. The active POI's real Dijkstra route draws
  (stroke-dashoffset), the prior fades, and ONE story block (name + real minutes) cross-fades
  in. Never two blocks legible at once.

## Atoms (cite, never inline)
- `line-art-location-map` (owns_pin FALSE) is the monochrome strokes-draw + crosshair + POI ladder.
  Its own trigger is killed; the harness pin scrubs `set(p)`.
- `coords-corner-frame` (owns_pin FALSE) is the surveyor's drafting plate, scrubbed on the same pin.

## Data (asset-truth)
`osm.js -> osm-agronomichne.js`. 80 real in-window streets, 6 real POIs with verbatim names +
real minutes + real Dijkstra route paths. Coords 49.18N 28.33E. Nothing invented.

## Gate
`__LAB_OK__` true, pins === 1, blocksLegible === 1 across the scroll, full sketch under
reduced-motion, no overflow at 390px, zero console errors, zero em/en-dash.
