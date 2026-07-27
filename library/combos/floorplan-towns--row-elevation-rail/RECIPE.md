---
id: floorplan-towns--row-elevation-rail
name: "Floorplan TOWNS row-elevation-rail (ERA dark; pick 1 of 6 identical row-houses on the real front render; THE F-20 FIX: the hover spec card docks in an OFF-facade rail with a hairline tether so the row is never covered; click opens a deep two-tone town-detail with proportional real-area room tiles)"
role: floorplan
kind: combo
status: base
family: floorplan-towns
palette: era-dark
section: floorplan
map_style: ""
composition: "TOWNS shortened drill: real 6-house front render RIGHT + an OFF-facade reading rail LEFT (the spec lives here, never over a house) + a deep veil town-detail on click"
webgl: false
ease: award
entry:
  call: "combo-lab.html - clean-floor-hover-select over the real selector-row-6-day.png (flat front quads) with its tooltip suppressed; an off-facade rail card drives the spec; click -> veil-flat-detail-reveal town page. Data from _shared/floorplan-helpers.js (TOWNS_*)."
  module: section-variant
meaning:
  what: "The conversion-core floorplan for the TOWNS-type object (6 identical townhouses in a row) in the ERA dark skin, taking the live towns-zamkova site as the base and FIXING its two faults. SHORTENED drill (the unit IS the whole house): the real front render of the 6-house row sits RIGHT with flat per-house hover zones + number pins; the spec card lives in an OFF-facade LEFT rail and a hairline tether points to the hovered house, so the row of 6 is never covered (THE F-20 FIX, owner complaint #1). Click a house -> a deep two-tone veil town-detail: a giant 'Таунхаус №N' spec rail beside a plan canvas of PROPORTIONAL labelled room tiles built from the REAL room areas (owner complaint #2: the under-developed town page), with an honest 'візуалізація' caption + a row-locator showing THIS house. Controlled-click; 0 pins; NO-WebGL."
  when: "A small-inventory boutique development of a few identical units in a row (townhouses, a terrace) where position is the differentiator and there is no per-floor unit nesting. The faithful evolution of the shipped towns selector; the SAMPLE-FIRST for the towns family."
  signature: "The OFF-facade rail + hairline tether (the house is never covered, the F-20 fix) and the deep town-detail with proportional real-area room tiles (premium even with a placeholder plan)."
  lands: "A dark row of six identical townhouses fills the right; move across it and a house warms under a number while a card on the LEFT, off the building, names it: which position in the row, its size, rooms, yard and from-price, with a thin line pointing to the house so nothing is covered. Click and the screen lifts to a calm two-tone page: the townhouse name and price in air on the left, and on the right its rooms laid out as tiles sized to their real area across both floors, honestly marked a visualization. A small row map shows which of the six it is. It reads as choosing a specific home, not reading a list."
source:
  grammar: "EVER/ERA visual-search L1 (pick on a render) + L3 (veil two-tone detail), adapted to a 6-house row: clean-floor-hover-select with FLAT front quads (the render is near-orthographic, M2 gate) + an OFF-facade rail (the F-20 fix) + veil-flat-detail-reveal as the town page with proportional room tiles."
  recording: "apps/quadro/.award-re/teardowns/D_era_springs_visualsearch_video.md + D_ever_visualsearch_video.md. Base: the live towns-zamkova.vercel.app selector (apps/towns/src/js/sections/units.js calibrated ZONES)."
  registry_ref: ["ever-visual-search-drilldown", "TOWNS-row-selector"]
uses:
  - { atom: clean-floor-hover-select, job: "L1 pick a house on the REAL row render; FLAT front quads from the calibrated zones (viewBox 1920x814, fit contain); its built-in tooltip is suppressed (no .cfh-card) so the OFF-facade rail drives the spec (F-20 fix)" }
  - { atom: veil-flat-detail-reveal, job: "the deep town page reached on click; two-tone giant-type spec rail + a plan canvas of proportional real-area room tiles (drawPlan false, no invented footprint) + a row-locator with THIS house filled" }
pin: { owner: none, count: 0 }
pin_killed: []
asset_truth: "REAL towns data (content.js): 6 houses, 82 м², дві спальні, свій двір, від $67 тис, status Вільний, position edge/middle (the ONLY real differentiator). ALL available (no invented sold/reserved). Room areas verbatim from CONTENT.plan.scenes. Calibrated zones verbatim from units.js. Real render selector-row-6-day.png. The plan is honest proportional tiles (no invented footprint) since towns has no real plan PDF yet."
webgl: false
owns_pin: false
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "F-20 FIX: hovering ANY house (incl the middle ones) shows the spec in an OFF-facade LEFT rail card + a hairline tether; the spec node never overlaps the house band. Verified by screenshot on a middle house."
  - "SHORTENED drill: pick 1 of 6 -> a deep veil town-detail (the unit IS the house; no floor->unit nesting). The town page = a two-tone spec rail + proportional real-area room tiles + an honest visualization caption + a row-locator."
  - "asset-truth: 6 real houses, 82 м², від $67 тис, дві спальні, свій двір, status Вільний, real positions; room areas verbatim from content.js. ALL available (nothing invented). Real render + calibrated zones. NO invented footprint/plan."
  - "CONTROLLED-CLICK, PIN-LESS: 0 pins, no scroll-stepping, no scale-from-origin. Reveal once on scroll-in; the USER hovers/clicks. pins === 0."
  - "FLAT front quads (the render is near-orthographic, M2 gate) NOT perspective chevrons; 6 number pins always visible; the row is the hero and stays uncovered."
  - "motion only transform/opacity/clip-path/stroke-dashoffset; NO WebGL/mix-blend/backdrop/canvas/scale-from-origin. decode-guard the render. reduced-motion/<=820px -> a house button list. __LAB_OK__ true, 0 console errors."
  - "copy Ukrainian; ZERO em-dash/en-dash anywhere; $ prices."
gate:
  probe: "Open combo-lab. __LAB_OK__ true, 0 pins, 0 console errors, render painted. Hover a MIDDLE house (3,4): the spec appears in the LEFT rail (off the facade) with a tether, the house is NOT covered. 6 number pins visible. Click a house: the veil opens a two-tone town-detail (giant 'Таунхаус №N' + 82 м² + від $67 тис + proportional room tiles across two floors + an honest caption + a row-locator with THIS house filled). Eyeball the F-20 fix + the deep page."
files: [combo-lab.html, RECIPE.md]
note: |
  Family SAMPLE-FIRST for TOWNS, built on the live towns-zamkova site and fixing its two owner faults:
  (1) F-20 hover-cover -> the spec card is docked OFF the facade in a left rail with a hairline tether,
  the row of 6 never gets covered; (2) the under-developed town page -> a deep veil two-tone detail
  with PROPORTIONAL real-area room tiles (real areas from content.js, NO invented footprint, honest
  'візуалізація' caption). FLAT front quads (the render is near-orthographic, M2 gate) via
  clean-floor-hover-select with its tooltip suppressed. All available (towns are for sale; inventing
  sold/reserved would be dishonest). Sister variant: street-ribbon (numeral-dominant). The real
  apps/towns/pages/town.html rebuild (vite) follows after owner approves this direction.
---

# floorplan-towns--row-elevation-rail - pick 1 of 6 with the spec OFF the facade (the F-20 fix) + a deep town page

ERA dark. The real 6-house front render with flat hover zones + number pins; the spec card lives in an
OFF-facade left rail with a hairline tether so the row is never covered (fixes the live site's
hover-cover fault). Click a house -> a deep two-tone town-detail with proportional real-area room tiles
(fixes the under-developed town page). All real towns data; honest placeholder plan; controlled-click.

## Proven (the lab)
__LAB_OK__ true, 0 pins, 0 console errors, render painted. Atoms ran: clean-floor-hover-select +
veil-flat-detail-reveal. Drive: hover middle house №3 -> spec card in the LEFT rail (off the facade,
NOT covering the house) + 6 number pins; click -> veil opens the town-detail (giant Таунхаус №3 · у
середині ряду · 82 м² · від $67 тис + room tiles Перший/Другий поверх with real areas 19,44 / 14,05 /
12,49 ... + honest caption + row-locator with №3 filled). Real data; $ price. Screens reviewed by eye.
