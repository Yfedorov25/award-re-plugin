---
id: location--spread-metric
name: "Локація (метрика веде)"
level: 2
kind: section-variant
section: location
status: candidate
map_style: "HI-CONTRAST MONO"
composition: "SMARTS proportion re-planned as a 60/40 spread: dense mono map LEFT (~60%), reading panel RIGHT (~40%) that LEADS WITH THE METRIC (big «22,5» сотки + «вул. Перемоги · фасад шосе» + «45 x 50 м» frontage), THEN the visible 6-POI list with times, THEN the highway sign-guide. The «22,5 сотки» dimension line also on the map."
webgl: false
ease: air
meaning:
  what: "A NEW composition that keeps the SMARTS Агрономічне reference's content + proportion (the reference this whole section was built from) but RE-PLANS the layout as a 60/40 spread that LEADS WITH THE METRIC. The dense real OSM map fills the LEFT ~60% as the hero (pure black linework on pure white paper, ONE red route accent). The RIGHT ~40% is a reading panel whose TOP is a big editorial metric block: a large «22,5» with «сотки» beside it, «вул. Перемоги · фасад шосе», and the «45 x 50 м» frontage. BELOW the metric the panel shows the VISIBLE list of the 6 real POIs with their walk-times, THEN a highway sign-guide, THEN a legal line. The map carries the property parcel with an authored «22,5 сотки» dimension line and a «≈10 хв» walking ring (how much space it takes, the metres written on the plate), exactly the smarts geometry. Elements appear ONE BY ONE on scroll-in (the staggered birth). CONTROLLED-CLICK: the visitor clicks a list row or a map POI and the real Dijkstra route draws + an honest minute badge. Same content as the smarts reference; the metric leads, but the orientation points + times are visible immediately below it, not hidden."
  when: "When the location beat should OPEN ON THE NUMBER, foregrounding the plot size as the hook while still carrying the FULL smarts content (map + a readable list of where-and-how-many-minutes + the dimensioned plot + the highway guide). The metric-forward member of the new composition set; distinct from the others by leading the panel with a large editorial plot figure in a stark mono register."
  lands: "The big town map fills the left in black on white; the right opens on a large 22,5 сотки with the frontage 45 x 50 м, then lists every nearby point with its minutes and the highway times. The plot parcel sits on the map with its own 22,5 сотки dimension line. Click a place and the red route draws along the real streets. It reads like the smarts plate re-hung around the number, complete and legible."
source:
  grammar: "locmap-engine (the hi-contrast mono re-theme, identical realism to the surveyed-route-map ideal) in the SMARTS location proportion re-planned as a 60/40 spread (map left ~60% / panel right ~40%): the panel LEADS WITH THE METRIC (a large «22,5» сотки editorial block + frontage facts) then carries the smarts content blocks below (eyebrow above, hint, the engine's clickable [data-lm-list], a loc__sign highway guide, legal); the map carries the parcel + an authored «22,5 сотки» dimension line (the smarts loc-dim) + a standing section label. Staggered birth on scroll-in. CONTROLLED-CLICK (the smarts model): pin-less, click a row/POI to draw routes."
  recording: null
  registry_ref: ["locmap-canon", "SMARTS-location-etalon"]
uses:
  - { atom: locmap-engine, job: "owns_pin FALSE; bakes the dense real OSM mono map into [data-lm-stage] (black-on-white, no lit windows, one red route accent), fills the panel's [data-lm-list] with clickable .lm-row rows (name + walk-minutes), draws the real Dijkstra route + honest badge on click/hover. The variant adds the leading «22,5» сотки metric block, the authored «22,5 сотки» dimension line over the real parcel, and the staggered panel birth. reveal on scroll-in; no pin." }
pin: { owner: none, count: 0 }
pin_killed: []
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "COMPOSITION keeps the smarts content + proportion, re-planned as a 60/40 spread: the dense mono map fills the LEFT ~60%, and the RIGHT ~40% panel LEADS WITH THE METRIC (big «22,5» сотки + «вул. Перемоги · фасад шосе» + «45 x 50 м» frontage) and BELOW it the visible 6-POI list (each with its real walk-minutes) + a highway sign-guide. The map shows the parcel + a «22,5 сотки» dimension line + a «≈10 хв» ring. The metric leads but the orientation points + times are visible immediately below it, NOT hidden. Verified by screenshot."
  - "asset-truth: streets/footprints/green + 6 real POIs (Школа·садок 9хв, Нова Пошта 10хв, Траш! 9хв, Подорожник 10хв, Грош Експрес 15хв, Аврора 18хв) from osm.js; real facts вул. Перемоги, 22,5 сотки, 45 x 50 м фасад, Гніванське шосе, 5 хвилин від Вінниці. Coords 49.18N 28.33E. NOTHING invented."
  - "CONTROLLED-INTERACTIVE, PIN-LESS: 0 pins, NO scroll-stepping, NO scale-dive. Map reveals once with a staggered panel birth, then the USER clicks/hovers a POI (list row or map disc) to draw its route + honest badge. pins === 0."
  - "the [data-lm-list] in the RIGHT panel is filled with >=6 clickable .lm-row rows, two-way synced with the map POIs; the sign-guide shows the real highway times."
  - "the «22,5 сотки» dimension line is authored over the REAL parcel (the smarts loc-dim geometry); the map is not transformed, so it never floats."
  - "elements appear ONE BY ONE on scroll-in (panel blocks fade in staggered) like the smarts birth."
  - "motion only transform/opacity/clip-path/filter/stroke-dashoffset; NO WebGL, NO mix-blend, NO backdrop-filter, NO canvas, NO scale-from-origin. decode-guard: [data-render-surface] painted (the white paper) from load. reduced-motion -> static, __LAB_OK__ true; mobile 390px -> map stacks above the panel, no overflow, __LAB_OK__ true. Zero real console errors."
  - "copy Ukrainian, Fedoriv voice; ZERO em-dash/en-dash anywhere."
gate:
  probe: "Serve library/ and open combos/location--spread-metric/combo-lab.html. __LAB_OK__ true, pin count === 0. Scroll in: the panel births (the metric block, then the blocks fade) showing the leading «22,5» сотки + frontage, the visible POI list with times + the highway guide; the left mono map shows the parcel with «22,5 сотки» + the ring. Click a row/POI: the red route draws with an honest badge. Confirm the smarts content is all visible in a fresh metric-led layout + only real OSM data."
note: |
  NEW composition (smarts content re-planned), the metric-forward member of the new composition set:
  the smarts Агрономічне content (map + visible POI list with times + dimensioned 22,5 сотки parcel +
  highway guide) re-hung as a 60/40 spread that OPENS ON THE NUMBER. The rule that shaped this set:
  keep the smarts proportion and KEEP the orientation points + times VISIBLE (an earlier pass hid them
  and was rejected). Here the big «22,5» сотки leads the panel but the list + times sit fully visible
  right below it. locmap-engine hi-contrast mono + an authored dimension line; CONTROLLED-CLICK,
  pin-less, no float. Sibling of panel-left-survey, portrait-flank, corner-card-night.
---

# location--spread-metric · "Локація (метрика веде)"

The smarts Агрономічне content + proportion, re-planned as a 60/40 spread that LEADS WITH THE METRIC:
the dense mono map fills the left ~60% as the hero, and the right ~40% panel opens on a large «22,5»
сотки with the «45 x 50 м» frontage, then the visible 6-POI list with walk-times, then the highway
sign-guide. The parcel carries its own «22,5 сотки» dimension line on the map. Elements appear one by
one; click a place to draw its red route. Everything the smarts reference shows, around the number.
