---
id: location--corner-card-night
name: "Локація (нічна карта, кутова картка)"
level: 2
kind: section-variant
section: location
status: candidate
map_style: "NIGHT-NEON"
composition: "SMARTS proportion re-planned: a FULL-BLEED night map is the hero, and ALL the smarts content lives in one compact translucent GLASS card pinned in the bottom-left corner (eyebrow + short title + the VISIBLE 6-POI list with times + a highway sign-guide + legal); the map carries the parcel + a «22,5 сотки» dimension line + a «≈10 хв» walking ring"
webgl: false
ease: air
meaning:
  what: "A NEW composition that keeps the SMARTS Агрономічне reference's content + proportion (the reference this whole section was built from) but RE-PLANS the layout: the real dense NIGHT map is FULL-BLEED (it fills the stage, it is the hero), and ALL the smarts content sits in one compact translucent GLASS card pinned in the bottom-left CORNER, VISIBLE immediately, not hidden behind a click: the card holds the eyebrow + a short serif title that rises line by line + a hint + the VISIBLE list of the 6 real POIs with their walk-times + a highway sign-guide + a legal line. The map carries the property parcel with a «22,5 сотки» dimension line and a «≈10 хв» walking ring (how much space it takes, the metres written on the plate), exactly the smarts geometry. The card is a translucent dark panel with a hairline border (an rgba background, NO backdrop-filter). NIGHT-NEON treatment: a near-black field, the road grid GLOWING by rank (cyan highway, amber artery via filter drop-shadow) over a very dark casing, a low rate of warm-lit windows so the town reads as alive after dark, a hot-amber active route + parcel + walker. Elements appear ONE BY ONE on scroll-in (the staggered birth). CONTROLLED-CLICK: the visitor clicks a list row or a map pin and the real Dijkstra route draws + an honest minute badge. Same content as the smarts reference, a fresh layout; orientation points + times are visible immediately, not hidden."
  when: "When the location beat wants the MAP to dominate as the hero (full-bleed, the town lit at night) while still carrying the FULL smarts content (the readable list of where-and-how-many-minutes + the dimensioned plot + the highway guide) in a single self-contained glass card over one corner, instead of a full-height reading rail. The map-forward, card-condensed member of the new composition set; distinct from panel-left and portrait-flank by being a corner card over a full-bleed night map."
  lands: "A near-black aerial of the town fills the whole frame: streets glowing in a believable hierarchy, a scatter of warm-lit windows, the property marked with a luminous hatched parcel and its 22,5 сотки dimension inside a glowing ten-minute walking ring. Over the bottom-left corner a compact translucent card names the place, lists every nearby point with its minutes, and shows the highway times. Click a place (in the card or on the map) and a hot-amber route draws itself along the real streets with a glowing dot and an honest minute badge. The map is the hero; the card keeps the smarts plate complete and legible in one corner."
source:
  grammar: "locmap-engine (the map CANON, identical realism + routes to the surveyed-route-map ideal) re-themed entirely via CSS into a NIGHT-NEON treatment (near-black field, roads glowing by rank via filter drop-shadow over a very dark casing, warm-lit windows ON at flicker.rate 9, a hot-amber accent for the active route + parcel + walker), in a FULL-BLEED layout (the map fills the stage) with the smarts content condensed into one translucent GLASS card pinned bottom-left: eyebrow, a line-rising serif title, a hint, the engine's clickable [data-lm-list], a loc__sign highway guide, legal. The map carries the parcel + an authored «22,5 сотки» dimension line (the smarts loc-dim) + a corner stamp. Staggered birth on scroll-in. CONTROLLED-CLICK (the smarts model): pin-less, click a row/pin to draw routes. Engine code untouched; the card is rgba, NO backdrop-filter."
  recording: null
  registry_ref: ["locmap-canon", "SMARTS-location-etalon"]
uses:
  - { atom: locmap-engine, job: "owns_pin FALSE; bakes the dense real OSM night map into [data-lm-stage] (full-bleed), fills the glass card's [data-lm-list] with clickable .lm-row rows (name + walk-minutes) synced two-way with the numbered map pins, draws the real Dijkstra route + honest 'N хв · M м' badge on click/hover. flicker.rate 9 so a low rate of windows glow warm (the town lit at night); reveal once on scroll-in. The variant adds the authored «22,5 сотки» dimension line over the real parcel + the staggered card birth; re-themed to near-black neon purely by the variant CSS. No pin." }
pin: { owner: none, count: 0 }
pin_killed: []
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "COMPOSITION keeps the smarts content + proportion, re-planned: a FULL-BLEED night map (the hero) with the parcel + a «22,5 сотки» dimension line + a «≈10 хв» ring, and ALL the smarts content in one compact translucent GLASS card pinned bottom-left: the visible 6-POI list (each with its real walk-minutes) + a highway sign-guide. Orientation points + times are visible immediately IN THE CARD, NOT hidden behind a click. Verified by screenshot."
  - "asset-truth: streets/footprints/green + 6 real POIs (Школа·садок 9хв, Нова Пошта 10хв, Траш! 9хв, Подорожник 10хв, Грош Експрес 15хв, Аврора 18хв) from osm.js; real facts вул. Перемоги, 22,5 сотки, Гніванське шосе, 5 хвилин від Вінниці. Coords 49.18N 28.33E. NOTHING invented."
  - "CONTROLLED-INTERACTIVE, PIN-LESS: 0 pins, NO scroll-stepping, NO scale-dive. Map reveals once with a staggered card birth, then the USER clicks/hovers a POI (list row or map pin) to draw its route + honest badge. pins === 0."
  - "the [data-lm-list] in the GLASS card is filled with >=6 clickable .lm-row rows, two-way synced with the map pins; the sign-guide shows the real highway times."
  - "the «22,5 сотки» dimension line is authored over the REAL parcel (the smarts loc-dim geometry); the map is not transformed, so it never floats."
  - "the card is a translucent dark panel with a hairline border (rgba background), NO backdrop-filter; MAP-STYLE is unmistakably NIGHT-NEON (near-black field, roads glowing by rank, warm-lit windows, luminous parcel + ring)."
  - "elements appear ONE BY ONE on scroll-in (title lines rise, card blocks fade in staggered) like the smarts birth."
  - "motion only transform/opacity/clip-path/filter/stroke-dashoffset; NO WebGL, NO mix-blend, NO backdrop-filter, NO canvas, NO scale-from-origin. decode-guard: [data-render-surface] painted from load. reduced-motion -> static, __LAB_OK__ true; mobile 390px -> the card spans the bottom edge, no overflow, __LAB_OK__ true. Zero real console errors."
  - "copy Ukrainian, Fedoriv voice; ZERO em-dash/en-dash anywhere."
gate:
  probe: "Serve library/ and open combos/location--corner-card-night/combo-lab.html. __LAB_OK__ true, pin count === 0. Scroll in: the full-bleed night map reveals gate by gate (glowing roads, lit windows, the luminous parcel with «22,5 сотки» + the ring) and the bottom-left glass card births (title lines rise, blocks fade) showing the visible POI list with times + the highway guide. Click a row/pin: a hot-amber route draws with an honest badge. Confirm the smarts content is all visible in the card over a full-bleed night map + only real OSM data."
note: |
  NEW composition (smarts content re-planned), the map-forward/card-condensed member of the new
  composition set: the smarts Агрономічне reference (map + visible POI list with times + dimensioned
  22,5 сотки parcel + highway guide) in a fresh FULL-BLEED night map / corner glass-card layout. The
  rule that shaped this set: keep the smarts proportion and KEEP the orientation points + times
  VISIBLE (an earlier pass hid them and was rejected). locmap-engine night-neon (re-themed by CSS,
  engine untouched) + an authored dimension line; CONTROLLED-CLICK, pin-less, no float. The card is
  rgba translucent with a hairline border, NO backdrop-filter. Sibling to panel-left-survey,
  portrait-flank, and spread-metric.
---

# location--corner-card-night · "Локація (нічна карта, кутова картка)"

The smarts Агрономічне content + proportion, re-planned: the real dense NIGHT map is full-bleed (the
hero), and all the smarts content lives in one compact translucent glass card pinned in the bottom-left
corner: the title, the visible 6-POI list with walk-times, and the highway sign-guide. The map carries
the parcel with its «22,5 сотки» dimension line and the «≈10 хв» ring. Elements appear one by one;
click a place to draw its route. Everything the smarts reference shows, in a fresh layout.
