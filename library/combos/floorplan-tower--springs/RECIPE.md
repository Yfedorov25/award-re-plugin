---
id: floorplan-tower--springs
name: "Floorplan TOWER springs (Springs cream sister of the EVER tower replica: warm sand plate + fine sepia plan strokes + oval cream number pills, with a fixed LEFT preview-pane mini-plan that slides in on pill hover; facade floor-hover -> numbered floorplate -> green-and-cream two-tone veil flat-detail; controlled-click, openly a demo project)"
role: floorplan
kind: combo
status: base
family: floorplan-tower
palette: springs-cream
section: floorplan
map_style: ""
composition: "TOWER full drill (Springs re-skin): korpus toggle + facade floor-hover (y-tracking cream tooltip) -> numbered floorplate (8 cream-pill units round a core) WITH a fixed left preview-pane mini-plan -> green-gradient + cream two-tone veil flat-detail"
webgl: false
ease: award
entry:
  call: "combo-lab.html - clean-floor-hover-select over the Higgsfield tower render (traced bands) + numbered-floorplate-select over the authored tower-floor-clean.svg (re-skinned cream/sepia) + veil-flat-detail-reveal (green-and-cream). The novel L2 left preview-pane mini-plan is wired combo-level on the built .nfp-pill[data-nr] (mouseenter -> slide TOWER_TYPE_PLANS[type] into the fixed left pane). Synthetic demo data from _shared/floorplan-helpers.js (TOWER_*) + _assets/floorplan tower vectors."
  module: section-variant
meaning:
  what: "The Springs cream sister of the EVER tower replica: the same full visual-search drill on a LARGE multi-korpus tower, re-skinned to Springs resort-soft (warm sand plate ~#e9e2cf, fine sepia plan strokes ~#8a7d63, oval-ish cream number pills, a green accent ~#3a5a2f). L1: a Higgsfield-generated tower render with a korpus A/B toggle and traced floor bands; hovering a floor tints it soft green + a left cream tooltip card y-tracks the hovered floor naming it and its free count. Click -> L2: a clean numbered floorplate of 8 cream-pill units round a central core (the authored tower-floor-clean.svg, plan strokes recoloured sepia) + a persistent unit list. THE SIGNATURE: a FIXED LEFT preview-pane that, on pill (or list-row) hover, slides that unit's mini type-plan into view (autoAlpha + x:-8->0, ~0.2s) WHILE the floorplate stays on the right. Click -> L3: a green-gradient left rail + cream plan canvas (the Springs two-tone) flat-detail with an authored clean type-plan. Controlled-click; 0 pins; NO-WebGL."
  when: "A large multi-korpus / many-floor tower wanting the full building->floor->unit->flat drill in a warm, resort-soft Springs register, where a left mini-plan preview adds calm previewing without leaving the floorplate. The cream member of the tower family; uses an openly synthetic demo dataset."
  signature: "The fixed LEFT preview-pane mini-plan slide: hover a number pill and that unit's mini type-plan slides into the fixed left pane while the plate stays put on the right (the one genuinely novel L2 move), inside the Springs cream-and-sepia skin with a green accent."
  lands: "A lit tower of two wings fills a sandy stage; move up it and a soft green band lights a floor's window row while a small cream card glides alongside naming the floor and its free count. Click and a cream plate of that floor arrives, eight apartments round the core each marked by an oval number; hover a number and its little plan slides into a pane on the left while the plate holds steady on the right, a list of all eight beside them. Click a number and the screen darkens for a beat and lifts to a calm apartment page, a green rail of name and price beside a cream canvas where the plan is drawn clean in fine sepia."
source:
  grammar: "Springs cream visual-search reproduced over the EVER tower-replica drill: clean-floor-hover-select (traced perspective bands + a y-tracking cream tooltip) -> numbered-floorplate-select (cream oval pills round a core, sepia plan) -> veil-flat-detail-reveal (green-gradient rail + cream canvas two-tone). Springs cream tokens (sand ~#e9e2cf, sepia ~#8a7d63, green ~#3a5a2f); the left preview-pane is the Springs L2 preview move."
  recording: "apps/quadro/.award-re/teardowns/D_era_springs_visualsearch_video.md (Springs cream palette + the left preview measurements) + D_ever_visualsearch_video.md (the L1-L3 drill it re-skins)."
  registry_ref: ["ever-visual-search-drilldown", "TOWER-1to1-replica", "springs-cream-preview-pane"]
uses:
  - { atom: clean-floor-hover-select, job: "L1 pick a floor on the Higgsfield tower render; perspective band quads traced off a coordinate grid (viewBox 3712x4608, fit contain); a left CREAM tooltip y-tracks the hovered floor; korpus A/B re-themes the bands; band wash recoloured soft green" }
  - { atom: numbered-floorplate-select, job: "L2 clean numbered floorplate of the authored tower-floor-clean.svg (viewBox 100x72, 8 unit footprints round a central core); cream oval number pills + sepia plan strokes + status hover wash; its built .nfp-pill[data-nr] drive the left preview-pane mini-plan" }
  - { atom: veil-flat-detail-reveal, job: "L3 Springs two-tone flat-detail via the dark-green veil: a green-gradient left rail (cream ink) + a cream plan canvas with fine sepia strokes; authored clean tower type-plan + spec rail + prominent back pill + floor-locator" }
pin: { owner: none, count: 0 }
pin_killed: []
asset_truth: "OPENLY SYNTHETIC (a demo tower we have no real data for), carrying the legal line 'Демонстраційний проєкт. Дані наведено для прикладу.' The data is SELF-CONSISTENT (4 types area x flat rate $1450/m2 so price never contradicts area; 8 units/floor matching the authored 8 footprints; statuses spread by floor band). The tower render is Higgsfield-generated; floor bands are TRACED over the real render off a coordinate grid (not guessed). Floor count capped at the readable bands (B3 gate). The left preview mini-plans are the same authored clean type-plans (TOWER_TYPE_PLANS), recoloured sepia in CSS only."
webgl: false
owns_pin: false
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "FULL drill korpus+floor->unit->flat in the Springs cream skin: L1 traced facade bands (soft green wash) + a y-tracking left CREAM tooltip + korpus A/B toggle; L2 cream oval-pill floorplate of 8 units round a core + a unit list + the LEFT preview-pane mini-plan; L3 green-gradient rail + cream canvas flat-detail. Verified by screenshot at every level."
  - "SIGNATURE move present: hovering a number pill (or a list row) slides that unit's mini type-plan into the fixed LEFT pane (autoAlpha + x:-8->0, ~0.2s) while the floorplate stays on the right; the pane seeds the first unit's mini-plan at load so the render surface paints non-zero. Decode-safe (inline vector SVG, no async image)."
  - "OPENLY SYNTHETIC + self-consistent: carries 'Демонстраційний проєкт. Дані наведено для прикладу.'; prices = area x 1450 (never contradict area); 8 units match the 8 authored footprints; all 3 statuses render. NO claim of being real."
  - "CONTROLLED-CLICK, PIN-LESS: 0 pins, no scroll-stepping, no scale-from-origin. pins === 0."
  - "PLAN IS HERO + SPEC VISIBLE: the unit list (nr/type/area/price/status) is visible beside the plate; the left preview adds a second always-visible plan view; max 1 full flat-plan at a time at L3."
  - "F-21 prominent back (cream pill + circular arrow on green, hover swap); F-22 full canvas (big plan + a visible floor-locator with THIS unit highlighted via --fp-loc-on/off + a site/compass cluster); F-23 interior detail (authored tower-floor-clean.svg + type-plans keep walls, no empty boxes)."
  - "floor bands TRACED over the real render (read off a coordinate grid, not guessed); floor count capped at the readable bands (B3)."
  - "motion only transform/opacity/clip-path/stroke-dashoffset; NO WebGL/mix-blend/backdrop/canvas/scale-from-origin. decode-guard the render + plans. reduced-motion/<=900px -> floor + unit lists (preview pane hidden). __LAB_OK__ true, 0 console errors."
  - "copy Ukrainian; ZERO em-dash/en-dash anywhere; $ prices."
gate:
  probe: "Open combo-lab. __LAB_OK__ true, 0 pins, 0 console errors, render painted (the left preview seeds the first unit's mini-plan). Hover up the tower: a soft-green band lights a floor + a left cream tooltip y-tracks it; korpus A/B toggles re-theme the bands. Click a floor -> 8 cream oval-pill units round the core + a unit list (self-consistent demo data, all 3 statuses, $ prices) + a left preview-pane. Hover a pill -> its mini type-plan slides into the LEFT pane while the plate holds. Click a unit -> the dark-green veil opens the green-and-cream two-tone flat-detail (authored clean type-plan in fine sepia + spec + prominent back). Confirm the 'Демонстраційний проєкт' legal line. Eyeball every level."
files: [combo-lab.html, RECIPE.md]
note: |
  TOWER-1to1 family, the SPRINGS CREAM sister of floorplan-tower--ever. Same Higgsfield tower render
  (tower-front.png) + authored tower-floor-clean.svg (8 footprints round a core) + 4 authored clean
  type-plans + the self-consistent synthetic dataset (TOWER_* in floorplan-helpers). Re-skinned to
  Springs resort-soft: warm sand plate, fine sepia plan strokes, oval cream number pills, a green accent
  for the L3 two-tone rail. The one novel L2 move is the fixed LEFT preview-pane mini-plan slide. Openly
  a demo, with the legal line. Composes all THREE atoms. Sister variants: ever (EVER light, the faithful
  base replica) + era (dark copper + cinematic photo-bleed L3).
---

# floorplan-tower--springs - the Springs cream sister of the EVER tower replica

Springs cream. The full EVER tower drill re-skinned resort-soft: facade floor-hover with a y-tracking
cream tooltip + korpus A/B toggle -> a clean cream oval-pill floorplate of 8 units round a core, with
the SIGNATURE fixed LEFT preview-pane that slides a unit's mini type-plan in on pill hover -> a
green-gradient rail + cream canvas two-tone veil flat-detail. Openly a demo project (self-consistent
synthetic data + a legal line); controlled-click; NO-WebGL.

## Proven (the lab)
__LAB_OK__ true, 0 pins, 0 console errors, render painted (the left preview seeds the first unit's
mini-plan at load). Atoms ran: clean-floor-hover-select + numbered-floorplate-select +
veil-flat-detail-reveal. Drive: hover the tower -> a soft-green floor band + a left cream tooltip
("12 / поверх / 5 вільних · 8 квартир") that y-tracks; korpus A/B toggle; click a floor -> 8 cream
oval-pill units round the core + a list (01 3 спальні 96.5 м² $139 925, 02 Студія Продано, 04 Бронь ...)
all 3 statuses, $ prices scaled by area + a left preview pane; hover a pill -> its mini type-plan slides
into the left pane (autoAlpha + x:-8->0) while the plate holds on the right; click a unit -> the
dark-green veil opens the green-and-cream two-tone flat-detail (authored 3-спальні plan in fine sepia +
spec + Забронювати перегляд + a prominent cream back pill + the floor-locator with this unit lit).
Legal line present. Screens reviewed by eye.
