---
id: location--concierge-radiate
name: "Все поруч"
level: 2
kind: section-variant
status: base
section: location
medium: "ILLUSTRATED MAP (radiating leader-threads)"
meaning: { what: "A hand-illustrated warm cream-paper map of the district whose language is LINES: thin leader-threads radiate from YOUR DOOR to the 6 real named daily places, each thread carrying its real walk-minute figure. On scroll the section locks, the roads draw, the door blooms, the threads splay one by one as the minutes rise; a sparse line per cluster arrives over the map.", when: "The LOCATION section of a house/ЖК site where the proof is proximity (can I live my life from here) and you have a real OSM bake with real POIs + real walk-minutes; you want a DRAWN, editorial, premium register rather than a literal tiles/survey map.", lands: "The visitor feels the daily life is already stitched to the door: not kilometres on a schematic but a few minutes on foot, drawn from the porch. The radiating thread is the section's unmistakable mark." }
source:
  grammar: "district-radiates: editorial illustrated proximity map, leader-threads radiate door->POI on a cream paper field"
  recording: null
  registry_ref: []
uses:
  - { atom: pin-story-text, job: "owns the ONE pin (scroll-lock); sequences a sparse line PER CLUSTER, one clean lower-left block at a time, never overlapping" }
  - { atom: district-radiates, job: "the MEDIUM: draws the cream-paper map (real OSM roads/parks), blooms the door, RADIATES a thin leader-thread door->each real POI as its real walk-minute label rises; hover-focuses a row/pin. Self-triggers, NON-pin" }
  - { atom: numeral-frame-expand-hero, job: "its set(p) NUMERAL treatment only (big editorial total '6' + caption, NO photo frame), driven off the ONE pin; its own pinned trigger is killed at wire-time" }
pin: { owner: pin-story-text, count: 1 }
pin_killed: [numeral-frame-expand-hero]
webgl: false
ease: air
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "asset-truth: door = OSM.site and every POI coord/name/walk-minute = OSM.pois VERBATIM (a module-island assertion proves Math.round(coord) match; window.__ASSET_TRUTH__.ok === true); zero invented streets/POIs/times"
  - "exactly ONE pinned ScrollTrigger (pin-story-text); the section scroll-LOCKS while the map plays (pin:true + pinSpacing); numeral-frame-expand-hero's pin is KILLED, district-radiates is NON-pin"
  - "pin-story-text blocks sequence one at a time: NEVER two text blocks at opacity>=0.85 at the same scroll position (verified maxConcurrent===1 across 25 scroll samples); never a full-screen wall"
  - "medium is unmistakable in a screenshot: hand-drawn cream paper + leader-threads radiating from one ringed door; NOTHING else draws connecting lines (not tiles, not survey-vector, not video)"
  - "6 leader-threads + 6 dots painted, each dot anchored on its thread end via the SVG CTM; threads have non-zero drawn length"
  - "motion only transform/opacity/clip-path/stroke-dashoffset; NO WebGL, NO mix-blend, NO backdrop-filter, NO canvas, NO video.currentTime; reduced-motion -> final drawn state + static text deck"
---

# location--concierge-radiate, "Все поруч"

A LOCATION section-variant on the SectionHarness binder. The MEDIUM is an **illustrated map**:
hand-drawn warm cream paper where the language is LINES. The signature mark is the **radiating
leader-thread** stitched from your door to each real daily place. Nothing else on the page draws
connecting lines, so a single screenshot reads instantly as a drawn proximity map, not a tiles
map, not a vector survey, not a video. This is the distinctness-by-medium gate: a different ROOT
mechanic from the other nine location variants, not a re-theme of one map engine.

## What it does

The cited **district-radiates** atom paints the cream-paper geography (real OSM roads + parks,
simplified to a hair-thin hand-drawn ink), blooms the one terracotta **ВАШ ДІМ** marker, then
RADIATES a thin bowed leader-thread from the door to each of the 6 real POIs, one by one, as its
real walk-minute label rises. Each pin's dot is mapped through the SVG `getScreenCTM()` so it
lands exactly on its thread end (one source of truth, no ellipse squash, aligns at every
viewport). Hovering a legend row or a pin lights that thread and calms the rest.

Over the pinned map, **pin-story-text** sequences a sparse line PER CLUSTER, one clean lower-left
block at a time (the engine guarantees exactly one block at opacity 1, so there is never an
overlap or a full-screen wall): the daily cluster (хліб, пошта, аптека за 9 to 10 хв), the school
cluster (школа і садок за 9 хв), then the bigger-market cluster (Грош за 15, Аврора за 18). A big
editorial **6** (numeral-frame-expand-hero's set(p), photo frame absent) holds top-left and exits
with the composition on the one scroll driver.

## Asset-truth (failure #1)

Geometry, names and minutes come from the REAL OSM bake of с. Агрономічне
(`import { OSM } from './osm.js'`). The door is `OSM.site` = (746, 325). The 6 POIs are
`OSM.pois` verbatim, with their real labels and real walk-minutes:

| place | label (verbatim) | coord (OSM) | walk |
|---|---|---|---|
| school | Школа · садок | (540, 380) | 9 хв |
| trash | Супермаркет «Траш!» | (564, 491) | 9 хв |
| np | Нова Пошта | (535, 499) | 10 хв |
| apteka | Аптека «Подорожник» | (481, 268) | 10 хв |
| grosh | «Грош Експрес» | (457, 126) | 15 хв |
| avrora | Маркет «Аврора» | (343, 263) | 18 хв |

The arteries are real named streets (вул. Перемоги / Грушевського / Елітна) simplified; the parks
are real OSM green shapes. A module-island runs an assertion at load: `Math.round(coord)` of the
door and every POI in the markup must equal the OSM bake, exposing `window.__ASSET_TRUTH__`.
Nothing is invented. The viewBox `193 6 703 612` is the real OSM window around the cluster.

## Pin ownership (the load-bearing rule)

**pin-story-text owns the single pinned ScrollTrigger** (`pin:true`, `pinSpacing:true`, `scrub:1`,
`end:'+=240%'`) on `#loc`, so the section scroll-LOCKS while the map plays and the cluster lines
arrive in sequence. The lab therefore does NOT call `SectionHarness.pin()`; it
`declare({ pinOwner:'pin-story-text', expectPins:1, atomsCited:[...] })`.

- **district-radiates** self-triggers a NON-pinned ScrollTrigger (`start:'top 78%'`, `once:true`)
  to play the draw, so it does not contend for the pin.
- **numeral-frame-expand-hero** owns_pin, so its mechanic is borrowed the law-sanctioned way: we
  call `create()` to get its `set(p)`, then `trigger.kill()` it (`pin_killed`) and drive `set(p)`
  off pin-story-text's `onUpdate`. Net pinned triggers = 1.

`[data-render-surface]` sits on `.dr-stage`; its warm cream paper `radial-gradient` is the medium's
own look AND a non-"none" `backgroundImage`, so the honest probe asserts a painted surface without
faking an `<img>`.

## Skin / motion

- The map, threads, door marker, legend rows and tokens come from `district-radiates/component.css`.
- The sequenced text comes from `pin-story-text/component.css`, inverted to INK on cream
  (`--pst-ink`, `--pst-accent`) and constrained to lower-left so it never covers the threads.
- The numeral plate is `numeral-frame-expand-hero/component.css` re-skinned from a full-bleed dark
  hero into a CONTAINED cream plate (ink outline stroke, no photo layer); it hides under 940px so
  the 1-col layout yields to the legend.
- Motion is SVG / transform / opacity / clip-path / stroke-dashoffset only. Ease: **air**.
  Reduced-motion -> district-radiates renders the final drawn state and pin-story-text renders a
  static stacked deck (no pin), both atom-native.
- Copy: Ukrainian, Fedoriv-voice, sparse, proof-not-promises. Zero em/en-dashes anywhere visible.

## Author notes

Swap only the legend rows, the `data-poi` coords/minutes, the door anchor and the three cluster
`blocks` to re-skin for another site's OSM bake. Keep coords mapped FROM the bake (copy-paste,
never typed) and keep the asset-truth assertion. Keep clusters to 2 to 4 places each and one
sparse line per cluster. The radiating thread is the identity: do not add a second connecting-line
mechanic and do not let any cluster line cover the convergence point at the door.
