---
id: floorplan-smarts--museum-daylight
name: "Floorplan SMARTS museum-daylight (EVER light skin; full building->floor->unit drill on the real 54-apartment smarts object: facade floor-bands -> clean redrawn numbered floorplate + a persistent unit list with live counts -> calm veil flat-detail; controlled-click, plan is hero AND the unit spec stays visible)"
role: floorplan
kind: combo
status: base
family: floorplan-smarts
palette: ever-light
entry:
  call: "combo-lab.html - composes numbered-floorplate-select (L2) + veil-flat-detail-reveal (L3) over the real smarts facade (inline FBANDS L1, NOT the L1 atom). Data from _assets/floorplan/smarts-units.js via _shared/floorplan-helpers.js."
  module: section-variant
uses:
  - { atom: numbered-floorplate-select, job: "L2 clean redrawn floorplate of the real floor-std-clean.svg (viewBox 100x44.08, 18 room rects); per-unit footprints from units.json pos + centroid number pills; status-coded hover wash + top card" }
  - { atom: veil-flat-detail-reveal, job: "L3 calm two-tone flat-detail reached via the dark cover-hold-open veil; neutral grey-blue spec rail + lighter plan canvas + floor-locator with THIS unit dark" }
meaning:
  what: "The conversion-core floorplan for the SMARTS-type object (one entrance, 54 apartments) in the EVER LIGHT museum-daylight skin. FULL drill: L1 the real facade-commerce-clean.webp with hover floor-bands (the hover card docks in an OFF-FACADE rail, never covering the building) -> click a floor -> L2 the clean redrawn numbered floorplate (the number is the UI) beside a persistent right unit-list carrying nr/type/area/price/status with live free-counts (the spec stays visible, never hidden) -> click a unit -> L3 the calm veil flat-detail (real type-NN-clean.webp plan + spec rail + floor-locator). Controlled-click throughout; 0 pins; NO-WebGL."
  when: "A multi-apartment residential building (one entrance, tens of units across floors) where the user must find a specific apartment. The reference-faithful EVER baseline of the floorplan family; the proven shipped quality bar (smarts FIX-2)."
  signature: "The persistent availability spine (real free-counts 11/12/12 per floor in the head + the always-visible unit list at L2) + the floor-locator breadcrumb in the L3 rail (THIS unit filled). Plan is hero, spec never hidden."
  lands: "A cool pale building with white number circles on its floors; move up it and a floor lights softly while a card OFF to the side names the floor, its free count and a from-price. Click and a clean redrawn plate of that floor arrives, every apartment marked by its number, a list beside it naming each one with its size, price and whether it is free, sold or held. Click a number and the screen goes dark for a beat and lifts to the calm apartment page: its name and price in air on the left, its clean plan on the right, a tiny floor map showing exactly which one it is. It reads as a precise, daylight index of the whole building, the number doing the work."
source:
  grammar: "EVER visual-search L1-L3 (the light museum skin) on the real smarts building. L1 facade floor-bands (the shipped FBANDS approach, not the L1 atom) with an OFF-facade hover card; L2 numbered-floorplate-select on the real clean vector + a persistent unit-list spine; L3 veil-flat-detail-reveal two-tone calm detail. Re-themed to EVER light tokens."
  recording: "apps/quadro/.award-re/teardowns/D_ever_visualsearch_video.md (L1-L3) + D_era_springs_visualsearch_video.md (palette family). Quality bar: apps/smarts/src/js/sections/units.js (FIX-2)."
  registry_ref: ["ever-visual-search-drilldown", "SMARTS-floorplan-etalon"]
asset_truth: "REAL. apps/smarts/data/units.json (54 units, 18/floor on 2/3/m, types Смарт 27 / Смарт 24, $950/m2, statuses 35 available / 12 sold / 7 reserved). REAL floor-std-clean.svg + facade-commerce-clean.webp + type-27/24-clean.webp. Nothing invented; prices = area x 950."
webgl: false
owns_pin: false
motion: "transform / opacity / clip-path / stroke-dashoffset only. Reveal = clip-path inset + fade (scroll-in once). Hover = footprint wash 0.12 + top card. Drill L1->L2 = opacity swap (no scale-from-origin). L2->L3 = the veil cover-hold-open. award/power2/expo eases."
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "FULL drill building->floor->unit: L1 real facade with white floor pills + OFF-facade hover card (never covers the building, the F-20 fix); L2 the clean numbered floorplate + a persistent unit-list with nr/type/area/price/status; L3 the veil two-tone flat-detail. Verified by screenshot at every level."
  - "asset-truth: 54 real units from units.json (18/floor on 2/3/m), types Смарт 27/24, $950/m2, statuses 35 available / 12 sold / 7 reserved; real floor-std-clean.svg + facade + type-NN-clean.webp. Prices = area x 950. NOTHING invented."
  - "CONTROLLED-CLICK, PIN-LESS: 0 pins, no scroll-stepping, no scale-from-origin. Reveal once on scroll-in; the USER hovers/clicks to drill. pins === 0."
  - "PLAN IS HERO + SPEC VISIBLE: the unit list (nr/type/area/price/status) is always visible beside the plate, never hidden behind a click-only card. Max 1 full plan at a time (catalog-safe)."
  - "motion only transform/opacity/clip-path/stroke-dashoffset; NO WebGL/mix-blend/backdrop/canvas/scale-from-origin. decode-guard the flat plan + facade. reduced-motion/<=820px -> unit list. __LAB_OK__ true, 0 console errors."
  - "copy Ukrainian; ZERO em-dash/en-dash anywhere incl comments; $ prices (no ruble)."
gate:
  probe: "Open combo-lab. __LAB_OK__ true, 0 pins, 0 console errors, [data-render-surface] painted. Facade shows white floor pills (М/3/2); hovering a band tints it + fills an OFF-facade rail card (never covers the building). Click a floor -> the clean numbered plate + a right unit-list with real nr/type/area/price + status dots. Click a unit -> the dark veil opens the two-tone flat-detail with the real plan + spec + floor-locator. Drive via real mouseenter/click; eyeball every level."
  expectPins: 0
  pinOwner: none
  atomsCited: [numbered-floorplate-select, veil-flat-detail-reveal]
files: [combo-lab.html, RECIPE.md]
note: |
  Family SAMPLE-FIRST for SMARTS. The L1 facade uses the SHIPPED FBANDS approach (inline polygons over
  the real facade in the render's own aspect-locked box, viewBox 0 0 100 42.4) NOT the clean-floor-hover
  -select atom (which has no fit:'fill' path) per smarts-facade-geometry-dont-touch. The hover card is
  docked OFF the facade in the left rail (the F-20 fix carried from location pivot-3). L2 = the
  numbered-floorplate-select atom on the real clean vector; the right list is the always-visible spec
  spine. L3 = veil-flat-detail-reveal with the real clean flat plans. Sister variants: copper-dusk (ERA
  dark) + compare-two. Reference: D_ever_visualsearch_video.md + D_era_springs_visualsearch_video.md.
---

# floorplan-smarts--museum-daylight - EVER light full drill on the real 54-apartment building

The conversion-core floorplan in the EVER museum-daylight skin: facade floor-bands (off-facade hover
card) -> clean redrawn numbered floorplate + a persistent unit list with live counts -> calm veil
flat-detail. Controlled-click, plan is hero, the unit spec stays visible. All real smarts data.

## Proven (the lab)
__LAB_OK__ true, 0 pins, 0 console errors, render surface painted 1371x790. Atoms ran:
numbered-floorplate-select + veil-flat-detail-reveal. Drive: facade -> white pills М/3/2, band hover
tints + off-facade rail card (does NOT cover the building); click floor 2 -> 18 numbered units on the
real clean plate + a right list (01 Смарт 27 м² $25 707 ... 03 Продана ... 06 Бронь) with status dots;
click a unit -> veil opens the two-tone flat-detail (real Смарт 27 м² plan + 27.06 м² + $25 707 + floor
locator). Real data from units.json; $ prices (no ruble). Screens reviewed by eye.
