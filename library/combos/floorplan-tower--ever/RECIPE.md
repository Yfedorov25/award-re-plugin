---
id: floorplan-tower--ever
name: "Floorplan TOWER ever (almost 1:1 EVER replica on a large 2-korpus tower: facade floor-hover with the EVER y-tracking tooltip -> clean numbered floorplate of 8 units round a core -> calm veil flat-detail; controlled-click, openly a demo project)"
role: floorplan
kind: combo
status: base
family: floorplan-tower
palette: ever-light
section: floorplan
map_style: ""
composition: "TOWER full drill (EVER replica): korpus toggle + facade floor-hover (y-tracking tooltip) -> numbered floorplate (8 units round a central core) -> veil two-tone flat-detail"
webgl: false
ease: award
entry:
  call: "combo-lab.html — clean-floor-hover-select over the Higgsfield tower render (traced bands) + numbered-floorplate-select over the authored tower-floor-clean.svg + veil-flat-detail-reveal. Synthetic demo data from _shared/floorplan-helpers.js (TOWER_*) + _assets/floorplan tower vectors."
  module: section-variant
meaning:
  what: "An almost 1:1 EVER replica of the full visual-search drill on a LARGE multi-korpus tower, to prove the system reproduces award sites faithfully. L1: a Higgsfield-generated tower render with a korpus A/B toggle and traced floor bands; hovering a floor tints it terracotta + a left beige tooltip card y-tracks the hovered floor (the EVER move). Click -> L2: a clean numbered floorplate of 8 units round a central core (the authored tower-floor-clean.svg) + a persistent unit list with self-consistent demo data. Click -> L3: the calm veil two-tone flat-detail with an authored clean type-plan. Controlled-click; 0 pins; NO-WebGL."
  when: "A large multi-korpus / many-floor tower where the full EVER-grade building->floor->unit->flat drill is wanted, and a faithful reference replica is the goal. The showcase member of the family; uses an openly synthetic demo dataset (a tower we do not have real data for)."
  signature: "The EVER y-tracking left tooltip card on the traced tower facade + the korpus A/B toggle that re-themes the floor bands on the same render, faithful to the reference."
  lands: "A lit tower of two wings fills the stage; move up it and a clean terracotta band lights on a floor's window row while a small beige card glides alongside naming the floor and its free count. Click and a clean plate of that floor arrives, eight apartments round the core each marked by its number, a list beside them. Click a number and the screen darkens for a beat and lifts to the calm apartment page, its plan drawn clean beside its name and price. It reads exactly like the reference, on our own tower."
source:
  grammar: "EVER visual-search L1-L3 reproduced faithfully: clean-floor-hover-select (traced perspective bands + the y-tracking tooltip) -> numbered-floorplate-select (centroid number pills round a core) -> veil-flat-detail-reveal (two-tone calm detail). EVER light tokens + measurements (band fill ~0.4, hover wash 0.12)."
  recording: "apps/quadro/.award-re/teardowns/D_ever_visualsearch_video.md (L1-L3 measurements) + D_era_springs_visualsearch_video.md."
  registry_ref: ["ever-visual-search-drilldown", "TOWER-1to1-replica"]
uses:
  - { atom: clean-floor-hover-select, job: "L1 pick a floor on the Higgsfield tower render; perspective band quads traced off a coordinate grid (viewBox 3712x4608, fit contain); the EVER left tooltip y-tracks the hovered floor; korpus A/B re-themes the bands" }
  - { atom: numbered-floorplate-select, job: "L2 clean numbered floorplate of the authored tower-floor-clean.svg (viewBox 100x72, 8 unit footprints round a central core); centroid number pills + status hover wash + top card" }
  - { atom: veil-flat-detail-reveal, job: "L3 calm two-tone flat-detail via the dark veil; authored clean tower type-plan + spec rail" }
pin: { owner: none, count: 0 }
pin_killed: []
asset_truth: "OPENLY SYNTHETIC (a demo tower we have no real data for), carrying the legal line 'Демонстраційний проєкт. Дані наведено для прикладу.' The data is SELF-CONSISTENT (4 types area x flat rate $1450/m2 so price never contradicts area; 8 units/floor matching the authored 8 footprints; statuses spread by floor band). The tower render is Higgsfield-generated; floor bands are TRACED over the real render off a coordinate grid (not guessed). Floor count capped at the readable bands (B3 gate)."
webgl: false
owns_pin: false
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "FULL drill korpus+floor->unit->flat, faithful EVER replica: L1 traced facade bands + y-tracking left tooltip + korpus A/B toggle; L2 numbered floorplate of 8 units round a core + a unit list; L3 veil two-tone flat-detail. Verified by screenshot at every level."
  - "OPENLY SYNTHETIC + self-consistent: carries 'Демонстраційний проєкт. Дані наведено для прикладу.'; prices = area x 1450 (never contradict area); 8 units match the 8 authored footprints; all 3 statuses render. NO claim of being real."
  - "CONTROLLED-CLICK, PIN-LESS: 0 pins, no scroll-stepping, no scale-from-origin. pins === 0."
  - "PLAN IS HERO + SPEC VISIBLE: the unit list (nr/type/area/price/status) is visible beside the plate; max 1 full plan at a time."
  - "floor bands TRACED over the real render (read off a coordinate grid, not guessed); floor count capped at the readable bands (B3)."
  - "motion only transform/opacity/clip-path/stroke-dashoffset; NO WebGL/mix-blend/backdrop/canvas/scale-from-origin. decode-guard the render + plans. reduced-motion/<=820px -> floor + unit lists. __LAB_OK__ true, 0 console errors."
  - "copy Ukrainian; ZERO em-dash/en-dash anywhere; $ prices."
gate:
  probe: "Open combo-lab. __LAB_OK__ true, 0 pins, 0 console errors, render painted. Hover up the tower: a terracotta band lights a floor + a left beige tooltip y-tracks it; korpus A/B toggles re-theme the bands. Click a floor -> 8 numbered units round the core + a unit list (self-consistent demo data, all 3 statuses, $ prices). Click a unit -> the veil opens the two-tone flat-detail (authored clean type-plan + spec). Confirm the 'Демонстраційний проєкт' legal line. Eyeball every level."
files: [combo-lab.html, RECIPE.md]
note: |
  TOWER-1to1 family SAMPLE-FIRST (the EVER replica). Higgsfield tower render (tower-front.png, two korpus
  meeting at an inner corner, ~9-10 readable floors per the B3 cap) + authored tower-floor-clean.svg (8
  footprints round a core) + 4 authored clean type-plans + a self-consistent synthetic dataset (TOWER_*
  in floorplan-helpers). Openly a demo, with the legal line. Composes all THREE atoms faithfully. Sister
  variants: era (dark copper + cinematic photo-bleed L3) + springs (cream sepia + left preview-pane).
---

# floorplan-tower--ever — an almost 1:1 EVER replica on our own multi-korpus tower

EVER light. Full drill on a Higgsfield tower: facade floor-hover with the EVER y-tracking tooltip +
korpus A/B toggle -> clean numbered floorplate of 8 units round a core -> calm veil two-tone
flat-detail. Openly a demo project (self-consistent synthetic data + a legal line); controlled-click.

## Proven (the lab)
__LAB_OK__ true, 0 pins, 0 console errors, render painted. Atoms ran: clean-floor-hover-select +
numbered-floorplate-select + veil-flat-detail-reveal. Drive: hover the tower -> terracotta floor band +
a left beige tooltip ("12 / поверх / 5 вільних · 8 квартир") that y-tracks; korpus A/B toggle; click a
floor -> 8 numbered units round the core + a list (01 3 спальні 96.5 м² $139 925, 02 Студія Продано, 04
Бронь ...) all 3 statuses, $ prices scaled by area; click a unit -> veil opens the two-tone flat-detail
(authored 3-спальні plan + spec + Забронювати перегляд). Legal line present. Screens reviewed by eye.
