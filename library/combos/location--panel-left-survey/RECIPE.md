---
id: location--panel-left-survey
name: "Локація (панель зліва)"
level: 2
kind: section-variant
section: location
status: candidate
map_style: "DARK DUSK"
composition: "SMARTS proportion re-planned: reading panel LEFT (title + visible POI list with times + highway sign + legal), dense dusk map RIGHT with the parcel + «22,5 сотки» dimension line"
webgl: false
ease: air
meaning:
  what: "A NEW composition that keeps the SMARTS Агрономічне reference's content + proportion (the reference this whole section was built from) but RE-PLANS the layout: a reading PANEL on the LEFT (eyebrow + a serif title that rises line by line + intro + the VISIBLE list of the 6 real POIs with their walk-times + a highway sign-guide + a legal line) and the real dense DUSK map on the RIGHT. The map carries the property parcel with a «22,5 сотки» dimension line and a «≈10 хв» walking ring (how much space it takes, the metres written on the plate), exactly the smarts geometry. Elements appear ONE BY ONE on scroll-in (the staggered birth). CONTROLLED-CLICK: the visitor clicks a list row or a map pin and the real Dijkstra route draws + an honest minute badge. Same content as the smarts reference, a fresh layout; orientation points + times are visible immediately, not hidden."
  when: "When the location beat should carry the FULL smarts content (map + a readable list of where-and-how-many-minutes + the dimensioned plot + the highway guide) but in a fresh layout. The faithful, information-complete member of the new composition set; distinct from the others by putting the reading panel on the left."
  lands: "A reading panel on the left names the place, lists every nearby point with its minutes and the highway times, and beside it the dusk town fills the right with the lit parcel and its 22,5 сотки dimension. Click a place and the route draws along the real streets. It reads like the smarts plate re-hung, complete and legible."
source:
  grammar: "locmap-engine (the dark-dusk re-theme, identical realism to the surveyed-route-map ideal) in the SMARTS location proportion inverted (panel left / map right): the panel carries the smarts content blocks (eyebrow, line-rising title, intro, the engine's clickable [data-lm-list], a loc__sign highway guide, legal), the map carries the parcel + an authored «22,5 сотки» dimension line (the smarts loc-dim) + a corner stamp. Staggered birth on scroll-in. CONTROLLED-CLICK (the smarts model): pin-less, click a row/pin to draw routes."
  recording: null
  registry_ref: ["locmap-canon", "SMARTS-location-etalon"]
uses:
  - { atom: locmap-engine, job: "owns_pin FALSE; bakes the dense real OSM dusk map into [data-lm-stage], fills the panel's [data-lm-list] with clickable .lm-row rows (name + walk-minutes), draws the real Dijkstra route + honest badge on click/hover. The variant adds the authored «22,5 сотки» dimension line over the real parcel + the staggered panel birth. reveal on scroll-in; no pin." }
pin: { owner: none, count: 0 }
pin_killed: []
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "COMPOSITION keeps the smarts content + proportion, re-planned: a LEFT panel with the visible 6-POI list (each with its real walk-minutes) + a highway sign-guide, and the dense dusk map on the RIGHT with the parcel + a «22,5 сотки» dimension line + a «≈10 хв» ring. Orientation points + times are visible immediately, NOT hidden. Verified by screenshot."
  - "asset-truth: streets/footprints/green + 6 real POIs (Школа·садок 9хв, Нова Пошта 10хв, Траш! 9хв, Подорожник 10хв, Грош Експрес 15хв, Аврора 18хв) from osm.js; real facts вул. Перемоги, 22,5 сотки, Гніванське шосе, 5 хвилин від Вінниці. Coords 49.18N 28.33E. NOTHING invented."
  - "CONTROLLED-INTERACTIVE, PIN-LESS: 0 pins, NO scroll-stepping, NO scale-dive. Map reveals once with a staggered panel birth, then the USER clicks/hovers a POI (list row or map pin) to draw its route + honest badge. pins === 0."
  - "the [data-lm-list] in the LEFT panel is filled with >=6 clickable .lm-row rows, two-way synced with the map pins; the sign-guide shows the real highway times."
  - "the «22,5 сотки» dimension line is authored over the REAL parcel (the smarts loc-dim geometry); the map is not transformed, so it never floats."
  - "elements appear ONE BY ONE on scroll-in (title lines rise, panel blocks fade in staggered) like the smarts birth."
  - "motion only transform/opacity/clip-path/filter/stroke-dashoffset; NO WebGL, NO mix-blend, NO backdrop-filter, NO canvas, NO scale-from-origin. decode-guard: [data-render-surface] painted from load. reduced-motion -> static, __LAB_OK__ true; mobile 390px -> panel stacks above the map, no overflow, __LAB_OK__ true. Zero real console errors."
  - "copy Ukrainian, Fedoriv voice; ZERO em-dash/en-dash anywhere."
gate:
  probe: "Serve library/ and open combos/location--panel-left-survey/combo-lab.html. __LAB_OK__ true, pin count === 0. Scroll in: the left panel births (title lines rise, blocks fade) showing the visible POI list with times + the highway guide; the right dusk map shows the parcel with «22,5 сотки» + the ring. Click a row/pin: the route draws with an honest badge. Confirm the smarts content is all visible in a fresh layout + only real OSM data."
note: |
  NEW composition (smarts content re-planned), the faithful/information-complete member of the new
  composition set: the smarts Агрономічне reference (map + visible POI list with times + dimensioned
  22,5 сотки parcel + highway guide) in a fresh panel-left/map-right layout. The rule that shaped this
  set: keep the smarts proportion and KEEP the orientation points + times VISIBLE (an earlier pass hid
  them and was rejected). locmap-engine dark-dusk + an authored dimension line; CONTROLLED-CLICK,
  pin-less, no float. Template for the other three new compositions (portrait-flank, corner-card-night,
  spread-metric).
---

# location--panel-left-survey · "Локація (панель зліва)"

The smarts Агрономічне content + proportion, re-planned: a reading panel on the LEFT (title, the
visible 6-POI list with walk-times, a highway sign-guide) and the dense dusk map on the RIGHT with
the parcel and its «22,5 сотки» dimension line. Elements appear one by one; click a place to draw
its route. Everything the smarts reference shows, in a fresh layout.
