---
id: floorplan-smarts--copper-dusk
name: "Floorplan SMARTS copper-dusk (ERA DARK copper skin, the evening sister of museum-daylight; SAME full building->floor->unit drill on the real 54-apartment smarts object, only re-skinned navy+copper + ONE signature: copper wall-stroke draw-on at L2 + a photo-bleed L3; controlled-click, plan is hero AND the unit spec stays visible)"
role: floorplan
kind: combo
status: base
family: floorplan-smarts
palette: era-dark
entry:
  call: "combo-lab.html - composes numbered-floorplate-select (L2) + veil-flat-detail-reveal (L3) over the real smarts facade (inline FBANDS L1, NOT the L1 atom). Data from _assets/floorplan/smarts-units.js via _shared/floorplan-helpers.js. ERA-dark re-skin of floorplan-smarts--museum-daylight."
  module: section-variant
uses:
  - { atom: numbered-floorplate-select, job: "L2 clean redrawn floorplate of the real floor-std-clean.svg (viewBox 100x44.08, interior-rich walls); per-unit footprints from units.json pos + centroid number pills; status-coded hover wash + top card. SIGNATURE: the room-wall strokes ink in via stroke-dashoffset before the pills fade up" }
  - { atom: veil-flat-detail-reveal, job: "L3 calm two-tone flat-detail reached via the dark cover-hold-open veil; navy spec rail with a warm real interior photo bleeding behind the giant unit type + lighter plan canvas + copper floor-locator with THIS unit lit" }
meaning:
  what: "The conversion-core floorplan for the SMARTS-type object (one entrance, 54 apartments) in the ERA DARK copper-dusk skin (premium evening). FULL drill: L1 the real facade-commerce-clean.webp (dusk-graded) with hover floor-bands (the hover card docks in an OFF-FACADE rail, never covering the building) -> click a floor -> L2 the clean redrawn numbered floorplate where the room-wall strokes INK IN (stroke-dashoffset) before the number pills settle, beside a persistent right unit-list carrying nr/type/area/price/status with live free-counts (the spec stays visible, never hidden) -> click a unit -> L3 the calm veil flat-detail where a warm real interior photo bleeds softly behind the giant unit type on the left rail (behind the type only, never over the spec numbers), the real type-NN-clean.webp plan owning the right canvas + a copper floor-locator. Controlled-click throughout; 0 pins; NO-WebGL."
  when: "The same multi-apartment residential building as museum-daylight, presented as a premium EVENING showroom. Use when the brand reads dark/luxury (ERA, Springs night skin) rather than pale museum daylight. Same proven shipped structure (smarts FIX-2), only re-themed + one signature move."
  signature: "Copper wall-stroke draw-on: on each floor open the plate's room-wall strokes animate in via stroke-dashoffset 100->0 (the architect inking the plan) BEFORE the number pills fade up. PLUS the photo-bleed L3: a warm real interior bleeds behind the unit type on the left rail (decode-guarded, behind the type, never over the spec). The persistent availability spine + the copper floor-locator breadcrumb remain. Plan is hero, spec never hidden."
  lands: "A navy evening building with copper-lit number circles on its floors; move up it and a floor warms copper while a card OFF to the side names the floor, its free count and a from-price. Click and a clean plate of that floor draws itself in front of you, wall by wall in copper line, then every apartment lights up by its number, a list beside it naming each one with its size, price and whether it is free, sold or held. Click a number and the screen goes dark for a beat and lifts to the calm apartment page: its name and price in air on the left over a softly lit real room, its clean plan on the right, a tiny floor map in copper showing exactly which one it is. It reads as a warm, confident evening index of the whole building, the line and the number doing the work."
source:
  grammar: "EVER visual-search L1-L3 re-themed to the ERA DARK skin on the real smarts building. L1 facade floor-bands (the shipped FBANDS approach, not the L1 atom) with an OFF-facade hover card; L2 numbered-floorplate-select on the real clean vector with a copper stroke-dashoffset wall-ink intro + a persistent unit-list spine; L3 veil-flat-detail-reveal two-tone dark detail with a photo-bleed rail. Re-skinned to ERA dark/copper tokens."
  recording: "apps/quadro/.award-re/teardowns/D_era_springs_visualsearch_video.md (the ERA dark palette + L3 compositions) + D_ever_visualsearch_video.md (the L1-L3 drill grammar). Quality bar: apps/smarts/src/js/sections/units.js (FIX-2). Decode-guard: frame-scrub-img-decode-guard law."
  registry_ref: ["ever-visual-search-drilldown", "era-springs-dark-skin", "SMARTS-floorplan-etalon"]
asset_truth: "REAL. apps/smarts/data/units.json (54 units, 18/floor on 2/3/m, types Смарт 27 / Смарт 24, $950/m2, statuses 35 available / 12 sold / 7 reserved). REAL floor-std-clean.svg (interior-rich) + facade-commerce-clean.webp + type-27/24-clean.webp + real interior photo ev-rest.webp for the L3 bleed. Nothing invented; prices = area x 950."
webgl: false
owns_pin: false
motion: "transform / opacity / clip-path / filter / stroke-dashoffset only. Reveal = clip-path inset + fade (scroll-in once). SIGNATURE = room-wall stroke-dashoffset 100->0 (power1.inOut, ~0.55s, small stagger) then pills fade up. Hover = footprint wash 0.12 + top card. Drill L1->L2 = opacity swap (no scale-from-origin). L2->L3 = the veil cover-hold-open. Photo-bleed = opacity+scale fade-in (decode-guarded). award/power1/power2/expo eases."
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "FULL drill building->floor->unit: L1 real dusk-graded facade with copper-lit floor pills + OFF-facade hover card (never covers the building, the F-20 fix); L2 the clean numbered floorplate with the copper wall-ink intro + a persistent unit-list with nr/type/area/price/status; L3 the veil two-tone dark flat-detail with a photo-bleed rail. Verified by screenshot at every level."
  - "asset-truth: 54 real units from units.json (18/floor on 2/3/m), types Смарт 27/24, $950/m2, statuses 35 available / 12 sold / 7 reserved; real floor-std-clean.svg + facade + type-NN-clean.webp + ev-rest.webp interior. Prices = area x 950. NOTHING invented."
  - "CONTROLLED-CLICK, PIN-LESS: 0 pins, no scroll-stepping, no scale-from-origin. Reveal once on scroll-in; the USER hovers/clicks to drill. pins === 0."
  - "PLAN IS HERO + SPEC VISIBLE: the unit list (nr/type/area/price/status) is always visible beside the plate, never hidden behind a click-only card. The L3 photo bleeds BEHIND the type only, never over the spec numbers. Max 1 full plan at a time (catalog-safe)."
  - "SIGNATURE (F-19 safe): the wall-ink uses stroke-dashoffset on the plan strokes only, NEVER a scale-from-origin on the content svg; the geometry/footprints/pills are untouched. The photo-bleed is decode-guarded (img.decode() before reveal)."
  - "motion only transform/opacity/clip-path/filter/stroke-dashoffset; NO WebGL/mix-blend/backdrop/canvas/scale-from-origin. decode-guard the flat plan + facade + bleed. reduced-motion/<=820px -> unit list. __LAB_OK__ true, 0 console errors."
  - "copy Ukrainian; ZERO em-dash/en-dash anywhere incl comments; $ prices (no ruble)."
gate:
  probe: "Open combo-lab. __LAB_OK__ true, 0 pins, 0 console errors, [data-render-surface] painted. Facade is navy/dusk with copper floor pills (М/3/2); hovering a band tints it copper + fills an OFF-facade rail card (never covers the building). Click a floor -> the room walls ink in (copper stroke draw-on) then the numbered pills appear + a right unit-list with real nr/type/area/price + status dots. Click a unit -> the dark veil opens the two-tone flat-detail: a warm interior bleeds behind the type on the rail, the real plan + spec + copper floor-locator. Drive via real mouseenter/click; eyeball every level."
  expectPins: 0
  pinOwner: none
  atomsCited: [numbered-floorplate-select, veil-flat-detail-reveal]
files: [combo-lab.html, RECIPE.md]
note: |
  The ERA DARK sister of floorplan-smarts--museum-daylight. SAME atoms, SAME wiring, SAME real
  units.json data, the approved F-20/F-21/F-22/F-23 fixes carried verbatim; only the palette
  (navy #16202c..#1c2733 stage + copper #c08457 accent, replacing the EVER terracotta) and ONE
  signature differ. The L1 facade uses the SHIPPED FBANDS approach (inline polygons over the real
  facade in the render's own aspect-locked box, viewBox 0 0 100 42.4) NOT the clean-floor-hover-select
  atom (which has no fit:'fill' path) per smarts-facade-geometry-dont-touch. SIGNATURE = copper
  wall-stroke draw-on (stroke-dashoffset on the inlined floor-std-clean.svg walls, then the pills fade
  up) + a photo-bleed L3 (the real ev-rest.webp interior behind the unit type, decode-guarded, never
  over the spec). Sister variants: museum-daylight (EVER light) + compare-two. Reference:
  D_era_springs_visualsearch_video.md + D_ever_visualsearch_video.md.
---

# floorplan-smarts--copper-dusk - ERA dark full drill on the real 54-apartment building

The conversion-core floorplan in the ERA copper-dusk skin (premium evening): facade floor-bands
(off-facade hover card) -> clean redrawn numbered floorplate where the room walls INK IN before the
pills settle + a persistent unit list with live counts -> calm veil flat-detail with a warm interior
bleeding behind the unit type. Controlled-click, plan is hero, the unit spec stays visible. The
evening sister of museum-daylight; all real smarts data.

## Proven (the lab)
__LAB_OK__ true, 0 pins, 0 console errors, render surface painted. Atoms ran: numbered-floorplate-select
+ veil-flat-detail-reveal. Drive: navy/dusk facade -> copper pills М/3/2, band hover tints copper + an
off-facade rail card (does NOT cover the building); click floor 2 -> the room walls draw in copper line,
then 18 numbered units appear on the real clean plate + a right list (01 Смарт 27 м² $25 707 ... 03
Продана ... 06 Бронь) with status dots; click a unit -> the dark veil opens the two-tone flat-detail (a
warm interior bleeds behind the Смарт 27 м² type, real plan + 27.06 м² + $25 707 + copper floor
locator). Real data from units.json; $ prices (no ruble). Screens reviewed by eye.
