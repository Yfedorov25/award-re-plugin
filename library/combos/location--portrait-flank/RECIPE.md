---
id: location--portrait-flank
name: "Локація (портрет з двома флангами)"
level: 2
kind: section-variant
section: location
status: candidate
map_style: "BLUEPRINT"
composition: "SMARTS proportion re-planned: a CENTERED taller PORTRAIT map plate (framed, on a darker blue mat) with the title above it and the highway sign-guide below it, and the 6 real POIs split into TWO COLUMNS that FLANK the plate (3 left, 3 right), each row showing name + walk-time, visible immediately. The plate carries the parcel + a «22,5 сотки» dimension line + a «≈10 хв» ring."
webgl: false
ease: air
meaning:
  what: "A NEW composition that keeps the SMARTS Агрономічне reference's content + proportion (the reference this whole section was built from) but RE-PLANS the layout: the dense REAL blueprint map is a CENTERED, taller PORTRAIT plate (framed, not full-bleed) standing in the middle of the stage on a darker blue mat; the eyebrow + a serif title that rises line by line sit ABOVE it; the highway sign-guide sits BELOW it; and the six real POI orientation items are split into TWO COLUMNS that FLANK the plate, three on the LEFT and three on the RIGHT, each row showing the name + its walk-time, VISIBLE immediately (not hidden behind a click or a hover). The plate carries the property parcel with a «22,5 сотки» dimension line and a «≈10 хв» walking ring (how much space it takes, the metres written on the plate), exactly the smarts geometry. Elements appear ONE BY ONE on scroll-in (the staggered birth). CONTROLLED-CLICK: the visitor clicks a flank row or a map POI and the real Dijkstra route draws along the actual streets + an honest minute badge reads the true walk-time. Same content as the smarts reference, a fresh layout; orientation points + times are visible immediately, not hidden."
  when: "When the location beat should carry the FULL smarts content (map + a readable list of where-and-how-many-minutes + the dimensioned plot + the highway guide) but framed like a museum plate: the map centred as a portrait subject with the orientation list balanced on either side. The symmetric, plate-and-flanks member of the new composition set; distinct from the others by centring the map as a portrait and splitting the POI list into two flanking columns."
  lands: "A centred portrait plate of the dusk-cyan town stands on a deep blue mat, the lit parcel and its 22,5 сотки dimension at its heart; the title rises above it, the highway times read below it, and three orientation points with their minutes flank it on the left and three on the right. Click a place on either side and the route draws along the real streets in warm white. It reads like the smarts plate re-hung as a centred drawing, complete and legible."
source:
  grammar: "locmap-engine (the blueprint / cyanotype re-theme, identical realism to the surveyed-route-map ideal, palette lifted 1:1 from location--blueprint-survey) framed as a CENTERED PORTRAIT plate inside the SMARTS location proportion: the masthead carries the eyebrow + a line-rising title; the plate carries the dense real OSM map + the parcel + an authored «22,5 сотки» dimension line (the smarts loc-dim) + a corner stamp; the engine fills ONE [data-lm-list] which JS then distributes into two flank columns (first 3 rows left, last 3 right); a loc__sign highway guide + legal sit below. Staggered birth on scroll-in. CONTROLLED-CLICK (the smarts model): pin-less, click a row/POI to draw routes."
  recording: null
  registry_ref: ["locmap-canon", "SMARTS-location-etalon"]
uses:
  - { atom: locmap-engine, job: "owns_pin FALSE; bakes the dense real OSM blueprint map into [data-lm-stage], fills the hidden [data-lm-list] with 6 clickable .lm-row rows (name + walk-minutes) that the variant JS then distributes into the left flank (first 3) and right flank (last 3), draws the real Dijkstra route + honest badge on click/hover. The variant adds the authored «22,5 сотки» dimension line over the real parcel + the staggered masthead birth. reveal on scroll-in; no pin." }
pin: { owner: none, count: 0 }
pin_killed: []
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "COMPOSITION keeps the smarts content + proportion, re-planned: a CENTERED taller portrait map plate with the title above + the highway sign-guide below, and the 6-POI list split into two FLANK columns (3 left, 3 right), each row with its real walk-minutes, VISIBLE immediately (NOT hidden behind a click/hover). The plate carries the parcel + a «22,5 сотки» dimension line + a «≈10 хв» ring. Verified by screenshot."
  - "asset-truth: streets/footprints/green + 6 real POIs (Школа·садок 9хв, Нова Пошта 10хв, Траш! 9хв, Подорожник 10хв, Грош Експрес 15хв, Аврора 18хв) from osm.js; real facts вул. Перемоги, 22,5 сотки, Гніванське шосе, 5 хвилин від Вінниці. Coords 49.18N 28.33E. NOTHING invented."
  - "CONTROLLED-INTERACTIVE, PIN-LESS: 0 pins, NO scroll-stepping, NO scale-dive. Map reveals once with a staggered birth, then the USER clicks/hovers a POI (flank row or map disc) to draw its route + honest badge. pins === 0."
  - "the engine fills the [data-lm-list] with 6 clickable .lm-row rows; JS distributes them into the two flanks (>=6 visible rows total, two-way synced with the map POIs); the sign-guide shows the real highway times."
  - "the «22,5 сотки» dimension line is authored over the REAL parcel (the smarts loc-dim geometry); the map is not transformed, so it never floats."
  - "elements appear ONE BY ONE on scroll-in (masthead title lines rise, blocks fade in staggered, the engine 9-gate births the map + flank rows) like the smarts birth."
  - "motion only transform/opacity/clip-path/filter/stroke-dashoffset; NO WebGL, NO mix-blend, NO backdrop-filter, NO canvas, NO scale-from-origin. decode-guard: [data-render-surface] painted from load. reduced-motion -> static, __LAB_OK__ true; mobile 390px -> the flanks stack above and below the plate, no overflow, __LAB_OK__ true. Zero real console errors."
  - "copy Ukrainian, Fedoriv voice; ZERO em-dash/en-dash anywhere."
gate:
  probe: "Serve library/ and open combos/location--portrait-flank/combo-lab.html. __LAB_OK__ true, pin count === 0. Scroll in: the masthead births (title lines rise), the centred portrait plate shows the parcel with «22,5 сотки» + the ring, and the 6 POI rows with times are visible split 3 left / 3 right. Click a row/POI: the route draws with an honest badge. Confirm the smarts content is all visible in a fresh layout + only real OSM data."
note: |
  NEW composition (smarts content re-planned), the symmetric plate-and-flanks member of the new
  composition set: the smarts Агрономічне reference (map + visible POI list with times + dimensioned
  22,5 сотки parcel + highway guide) framed as a CENTERED taller PORTRAIT plate with the 6-POI list
  split into two flanking columns (3 left, 3 right). The rule that shaped this set: keep the smarts
  proportion and KEEP the orientation points + times VISIBLE (an earlier pass hid them and was
  rejected). locmap-engine BLUEPRINT / cyanotype + an authored dimension line; CONTROLLED-CLICK,
  pin-less, no float. Sibling of panel-left-survey, corner-card-night, spread-metric.
---

# location--portrait-flank · "Локація (портрет з двома флангами)"

The smarts Агрономічне content + proportion, re-planned: the dense blueprint map stands as a centred,
taller PORTRAIT plate on a deep blue mat, the title rising above it and the highway sign-guide below,
with the six orientation points and their walk-times split into two columns that flank it (three left,
three right). The parcel carries its «22,5 сотки» dimension line. Elements appear one by one; click a
place on either side to draw its route along the real streets. Everything the smarts reference shows,
in a fresh layout.
