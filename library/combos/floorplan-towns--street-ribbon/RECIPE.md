---
id: floorplan-towns--street-ribbon
name: "Floorplan TOWNS street-ribbon (EVER light; pick 1 of 6 identical row-houses where GIANT terracotta ghosted numerals 1-6 ARE the UI, set in a reserved sky-band above a dimmed row render so a numeral or chip never lands on the facade; the spec stays in an OFF-facade reading column; click opens the SAME deep two-tone town-detail with proportional real-area room tiles + a prominent back pill + a row-locator)"
role: floorplan
kind: combo
status: base
family: floorplan-towns
palette: ever-light
section: floorplan
map_style: ""
composition: "TOWNS shortened drill: a reserved top sky-band of GIANT numerals (the UI) over a dimmed low-contrast 6-house render LEFT + an OFF-facade reading column RIGHT (the spec lives here, never over a house) + the same deep veil town-detail on click"
webgl: false
ease: award
entry:
  call: "combo-lab.html - clean-floor-hover-select over the real selector-row-6-day.png (flat front quads, dimmed/desaturated substrate) with its tooltip suppressed; GIANT numerals 1-6 in a reserved sky-band ARE the controlled-click UI; an off-facade reading column drives the spec; click -> veil-flat-detail-reveal town page. Data from _shared/floorplan-helpers.js (TOWNS_*)."
  module: section-variant
meaning:
  what: "The conversion-core floorplan for the TOWNS-type object (6 identical townhouses in a row) in the EVER light skin - the NUMERAL-DOMINANT sister of row-elevation-rail. A genuinely different HERO answer: instead of highlighting on the photo, the 6 houses RECEDE to a low-contrast substrate (the real front render, dimmed + desaturated via CSS filter) and GIANT terracotta ghosted numerals 1-6 BECOME the UI, sitting in a RESERVED top sky-band - a real layout pad that is part of the composition, NOT borrowed from the image - so a numeral or its chip never lands on the facade at any width. Hovering a numeral LIFTS it + a SLIM chip glides ABOVE the roofline naming the house; the full spec lives in an OFF-facade reading column (the F-20 law, satisfied by design - nothing ever covers a house). Click a numeral -> the SAME deep two-tone veil town-detail as row-rail: a giant 'Таунхаус №N' spec rail beside a plan canvas of PROPORTIONAL labelled room tiles built from the REAL room areas, an honest 'візуалізація' caption, a prominent terracotta back pill (F-21) and a row-locator showing THIS house. Controlled-click; 0 pins; NO-WebGL."
  when: "A small-inventory boutique development of a few identical units in a row (townhouses, a terrace) where position is the differentiator and there is no per-floor unit nesting - and the brand wants an editorial, numeral-led hero rather than a photo-highlight selector. The numeral-dominant sister of the towns SAMPLE-FIRST."
  signature: "GIANT terracotta ghosted numerals 1-6 ARE the UI, set in a RESERVED sky-band above a dimmed row render (a different hero from row-rail's photo-highlight); the chip glides above the roofline, the spec stays off-facade, nothing covers a house. Same deep town-detail with proportional real-area room tiles."
  lands: "Six oversized ghosted numbers stand in a band of air across the top; below them the row of six townhouses sits quiet and desaturated, a backdrop. Move across a number and it lifts and warms, a thin slip of a label glides above the rooftops to name the house, and a card in the column to the right names it fully: which position in the row, its size, rooms, yard and from-price, with the building never touched. Click and the screen lifts to a calm two-tone page: the townhouse name and price in air on the left, its rooms laid out as tiles sized to their real area across both floors, honestly marked a visualization, a clear way back, and a small row map of which of the six it is. The number is the door."
source:
  grammar: "EVER/ERA visual-search L1 (pick on a render) + L3 (veil two-tone detail), adapted to a 6-house row with a numeral-led hero: clean-floor-hover-select with FLAT front quads over a DIMMED render substrate (the render is near-orthographic, M2 gate) + GIANT numerals in a reserved sky-band as the UI + an OFF-facade reading column (the F-20 fix, by design) + veil-flat-detail-reveal as the town page with proportional room tiles."
  recording: "apps/quadro/.award-re/teardowns/D_era_springs_visualsearch_video.md + D_ever_visualsearch_video.md. Base: the live towns-zamkova.vercel.app selector (apps/towns/src/js/sections/units.js calibrated ZONES)."
  registry_ref: ["ever-visual-search-drilldown", "TOWNS-row-selector"]
uses:
  - { atom: clean-floor-hover-select, job: "L1 pick a house on the REAL row render used as a DIMMED low-contrast substrate; FLAT front quads from the calibrated zones (viewBox 1920x814, fit contain) drive only a soft hover-wash; its built-in tooltip is suppressed (no .cfh-card) so the GIANT numerals are the UI and the OFF-facade column drives the spec" }
  - { atom: veil-flat-detail-reveal, job: "the deep town page reached on click (same as row-rail); two-tone giant-type spec rail + a plan canvas of proportional real-area room tiles (drawPlan false, no invented footprint) + a prominent terracotta back pill (F-21) + a row-locator with THIS house filled" }
pin: { owner: none, count: 0 }
pin_killed: []
asset_truth: "REAL towns data (content.js): 6 houses, 82 м², дві спальні, свій двір, від $67 тис, status Вільний, position edge/middle (the ONLY real differentiator). ALL available (no invented sold/reserved). Room areas verbatim from CONTENT.plan.scenes. Calibrated zones verbatim from units.js. Real render selector-row-6-day.png (dimmed via CSS filter only, not altered data). The reserved sky-band is a layout pad, NOT borrowed sky from the image. The plan is honest proportional tiles (no invented footprint) since towns has no real plan PDF yet."
webgl: false
owns_pin: false
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "DIFFERENT HERO from row-rail: the 6 houses recede to a dimmed/desaturated substrate; GIANT terracotta numerals 1-6 in a RESERVED sky-band ARE the UI. The numeral/chip NEVER lands on the facade band at any width (the sky-band is a layout pad, not the image). Verified by screenshot at desktop + narrow."
  - "F-20 (nothing covers a house): the spec lives in an OFF-facade reading column; on hover a slim chip glides ABOVE the roofline only; hovering ANY house (incl middle 3,4) never overlaps the facade band. Verified on a middle numeral."
  - "SHORTENED drill: pick 1 of 6 -> the SAME deep veil town-detail as row-rail (the unit IS the house; no floor->unit nesting). The town page = a two-tone spec rail + proportional real-area room tiles + an honest visualization caption + a PROMINENT terracotta back pill (F-21) + a row-locator."
  - "asset-truth: 6 real houses, 82 м², від $67 тис, дві спальні, свій двір, status Вільний, real positions; room areas verbatim from content.js. ALL available (nothing invented). Real render (dimmed via filter only) + calibrated zones. NO invented footprint/plan; the sky-band is a composition pad, not borrowed image sky."
  - "CONTROLLED-CLICK, PIN-LESS: 0 pins, no scroll-stepping, no scale-from-origin (F-19). Reveal once on scroll-in; the USER hovers/clicks a numeral. pins === 0."
  - "FLAT front quads (the render is near-orthographic, M2 gate) NOT perspective chevrons; the row stays uncovered; the numerals are the hero."
  - "motion only transform/opacity/clip-path/filter; NO WebGL/mix-blend/backdrop/canvas/scale-from-origin. The render dim is a CSS filter (allowed). reduced-motion/<=900px -> the numerals stay a tappable button row. __LAB_OK__ true, 0 console errors."
  - "copy Ukrainian; ZERO em-dash/en-dash anywhere; $ prices."
gate:
  probe: "Open combo-lab. __LAB_OK__ true, 0 pins, 0 console errors, render painted. Six GIANT ghosted terracotta numerals sit in a reserved band ABOVE a dimmed 6-house render. Hover a MIDDLE numeral (3,4): it lifts, a slim chip glides above the roofline, the spec appears in the OFF-facade RIGHT column - the house is NOT covered. Click a numeral: the veil opens the deep two-tone town-detail (giant 'Таунхаус №N' + 82 м² + від $67 тис + proportional room tiles across two floors + an honest caption + a prominent back pill + a row-locator with THIS house filled). Eyeball the numeral-as-UI hero + the deep page."
files: [combo-lab.html, RECIPE.md]
note: |
  Numeral-dominant SISTER of the towns SAMPLE-FIRST (row-elevation-rail). Same real 6-house data and the
  SAME deep town-detail (proportional real-area room tiles, honest 'візуалізація' caption, prominent
  terracotta back pill F-21, row-locator) - COPIED wholesale. ONLY the HERO answer differs: instead of a
  photo-highlight selector, the 6 houses recede to a dimmed low-contrast substrate and GIANT terracotta
  ghosted numerals 1-6 BECOME the UI, set in a RESERVED sky-band (a real layout pad, NOT borrowed image
  sky) so a numeral or chip never touches a facade at any width - the F-20 law satisfied by design rather
  than by a tether. The render dim is a CSS filter only (data untouched). All available (towns are for
  sale; inventing sold/reserved would be dishonest). The real apps/towns/pages/town.html rebuild (vite)
  follows after owner approves a direction.
---

# floorplan-towns--street-ribbon - the numerals ARE the UI (a different towns hero) + the same deep town page

EVER light. The 6-house front render recedes to a dimmed, desaturated substrate; GIANT terracotta ghosted
numerals 1-6 in a RESERVED top sky-band become the UI. Hover a numeral: it lifts, a slim chip glides above
the roofline, the spec fills an OFF-facade reading column - nothing ever covers a house (the F-20 law, by
design, not a tether). Click a numeral -> the SAME deep two-tone town-detail as row-rail: proportional
real-area room tiles, honest placeholder caption, prominent back pill, row-locator. All real towns data;
controlled-click; a genuinely different hero from the photo-highlight sister.

## Proven (the lab)
__LAB_OK__ true, 0 pins, 0 console errors, render painted. Atoms ran: clean-floor-hover-select +
veil-flat-detail-reveal. Drive: hover middle numeral №3 -> it lifts, a chip glides above the rooftops,
the spec card fills in the RIGHT off-facade column (NOT covering the house); the numerals sit in a band
of air above the facade at every width. Click -> veil opens the town-detail (giant Таунхаус №3 · у
середині ряду · 82 м² · від $67 тис + room tiles Перший/Другий поверх with real areas 19,44 / 14,05 /
12,49 ... + honest caption + prominent back pill + row-locator with №3 filled). Real data; $ price.
Screens reviewed by eye.
