---
id: numbered-floorplate-select
name: "Numbered floorplate select (pick a unit on a CLEAN REDRAWN vector floor plan where the number IS the UI — per-unit footprint paths + number pills at COMPUTED centroids, status-coded hover wash + a floating spec card; NOT the developer raw plan image + text wall)"
level: 2
kind: component
status: official
entry:
  call: "NumberedFloorplateSelect.create(target, opts)  // target = .nfp-stage > .nfp-rail(...) + .nfp-stagecard( svg.nfp-plan (clean artwork) + svg.nfp-zones (built) + .nfp-card ). opts: { vbW, vbH, units:[{nr,type,area,price,status,points}], pillR, hoverFill, hoverDur, ease, fmtPrice, onSelect }."
  module: iife
  returns: "{ render(units), select(nr), setHover(nr), clear(), built, destroy }"
meaning:
  what: "EVER visual-search LEVEL 2 — pick a UNIT on a CLEAN REDRAWN vector floor plan where the NUMBER IS the UI. The substrate is inline SVG line-art (white room fills, hairline partitions, heavy perimeter, hatched columns); each apartment is a transparent footprint <path data-nr> in the SAME viewBox; each unit gets a NUMBER PILL at its footprint's COMPUTED centroid (never hand-placed). Hover -> footprint wash (live terracotta / sold cooler) + pill scale + a top spec card; dead units show the sold word + no '+', live units reveal a '+'. '+' click -> Level 3. The fix for the developer-raster-plan + text-wall."
  when: "The floor-plan step of a visual-search where the user picks a specific apartment. Use it instead of pasting the developer's plan PNG with a list of unit details beside it — redraw the plan as clean vector, mark each unit by its number on its footprint, and put the rich spec in a hover card + the opened detail. The fix for smarts' raw-image + text-wall floor view. Pairs after clean-floor-hover-select (Level 1) and before veil-flat-detail-reveal (Level 3)."
  lands: "A calm light plan of the floor — clean architectural linework, not a photocopy — with a small numbered circle sitting on each apartment. Move across it and the unit under you tints softly, its circle blooms to a '+', and a quiet card up top names the type, number, area and price. Sold units tint cooler and say so, with no way in. It reads as a precise index of the floor, the number doing the work, the detail arriving only when asked."
  not_when: "You only have (and must show) the developer's raster plan (then it's not this technique — the redraw IS the technique). A building/floor pick on a render (use clean-floor-hover-select). A single unit's detail page (use veil-flat-detail-reveal). When unit footprints can't be traced to real wall vectors (hover regions would miss rooms). A scroll section (this is a hover/click tool view)."
source:
  grammar: "EVER /visual-search/5/28: a clean light floorplate, apartments marked by number pills, hover highlights the footprint + a top card (type / Nº / area / price), 'Not on sale' for dead units; giant floor numeral + Floor selector + Back-to-housing + compass + site-locator left."
  recording: "apps/quadro/.award-re/teardowns/D_ever_visualsearch_video.md (§3; Brick B / Level 2 of the EVER visual-search harvest). Smarts retrofit: SMARTS_VS_UPGRADE_ever-model.md (FIX 2)."
  registry_ref: ["ever-numbered-floorplate-select"]
stack: "vanilla + GSAP 3.12.5 (no ScrollTrigger)"
webgl: false
motion_props: [fill-opacity, transform, opacity]
trigger: "hover/click (no scroll)"
timing_layer: [I-interactive, T-visual-search]
owns_pin: false
owns_scroll: false
page_beat: [visual-search, floor-plan, unit-select]
combines_with: [clean-floor-hover-select, veil-flat-detail-reveal, visual-search-engine]
anti_combos: [raw-developer-plan-image, scroll-driven, webgl-3d]
gated_by: [R_no_webgl, R_perf_limits]
variants: [isometric-building-unit-selector]
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a CLEAN REDRAWN vector floor-plan svg (white rooms, hairline partitions, heavy perimeter, hatched columns) — NOT an embedded developer raster"
  - "a .nfp-zones svg sharing the plan's viewBox; one transparent footprint <polygon data-nr> per unit, snapped to the wall vectors"
  - "each unit gets a NUMBER PILL placed at its footprint's COMPUTED centroid (area-weighted polygon centroid) — verified inside its footprint bbox, never hand-placed"
  - "hover a LIVE unit -> footprint wash 0->~0.12 terracotta + pill scale 1->1.1 + the number reveals a '+' + a top dark-translucent card (type/Nº/area/price) fades in"
  - "hover a SOLD/RESERVED unit -> cooler wash + no '+' + the card shows the sold word; data-status drives the fill class and whether '+'/click exists"
  - "'+'/click on a live unit fires onSelect(nr, unit) -> Level 3; SVG fill/stroke + transform + opacity only; NO mix-blend / NO WebGL"
  - "data join by data-nr (visual-search-engine pattern); reduced-motion or <=820px -> a unit list; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. The plan is a clean redrawn vector with a number pill on each apartment (pill at the footprint centroid, inside it). Hover a live unit: terracotta wash + pill '+' + a top card (type/Nº/area/price). Hover a sold unit: cooler wash, no '+', card shows the sold word. Click '+' fires onSelect. Verify the centroid pills, the shared viewBox, the status-coded hover, the floating card (no text wall), + fps. Drive hover via real mouseenter on .nfp-foot; only the hovered unit washes."
note: |
  Brick B of the EVER visual-search harvest (Level 2) — the first half of complaint #2: smarts shows
  the developer RAW PLAN IMAGE + a wall of text; EVER redraws the plan clean and marks apartments by
  NUMBER, status-coded, with the spec in a floating card. THE TECHNIQUE: a clean redrawn vector
  substrate (never the raster), per-unit footprint paths in the SAME viewBox snapped to the real wall
  vectors, and NUMBER PILLS at COMPUTED centroids (area-weighted polygon centroid, verified inside the
  footprint) so they stay glued under any scale — never hand-placed pixels. Keeps the
  visual-search-engine data-nr/stateClass join + the statuses; status drives the fill class + whether
  '+'/click exists. Marked relative (in `variants`): isometric-building-unit-selector (rect hotspots on
  a pre-render); also distinct from smarts units.js renderPlate (rect zones over the raw webp). Proven:
  12/12 pills inside footprints (centroids), shared viewBox, live wash 0.12 + '+' + top card, sold
  cooler + 'Продано' + no '+', onSelect; 0.63% jank; zero console errors. The direct fix for smarts
  FIX 2 (clean numbered plate). The lab's plan is an authored clean vector; in production redraw the
  developer DWG/PDF once to the EVER palette + extract footprints (PyMuPDF, à la smarts zone
  extraction). Accent terracotta #c2724e; plan #fff on #e9ecee; ground slate #2b343b.
---

# numbered-floorplate-select — apartments by NUMBER on a clean redrawn plan (kills the raw-image + text wall)

EVER visual-search Level 2: pick a unit on a clean redrawn vector floor plan where the number is the
UI — per-unit footprints + number pills at computed centroids, status-coded hover wash + a floating
spec card. The fix for the developer-raster-plan + text-wall floor view.

## Markup + call
```html
<section class="nfp-stage" id="fp">
  <div class="nfp-rail">… back · big floor numeral · Floor ⌄ · site-locator · compass …</div>
  <div class="nfp-stagecard">
    <svg class="nfp-plan" viewBox="0 0 1600 780">…clean redrawn walls/rooms/columns…</svg>
    <svg class="nfp-zones"></svg>   <!-- engine builds footprints + centroid pills here -->
    <div class="nfp-card"><span class="nfp-card__type"></span><span class="nfp-card__nr"></span><span class="nfp-card__area"></span><span class="nfp-card__price"></span></div>
  </div>
</section>
```
```js
NumberedFloorplateSelect.create('#fp', {
  vbW:1600, vbH:780,
  units:[ { nr:292, type:'3E', area:60.1, price:23330820, status:'sale', points:'42,42 291,42 291,353 42,353' }, /* … */ ],
  onSelect: (nr,u) => openFlat(nr,u)
});
```
Redraw the developer DWG/PDF to clean vector once; extract footprints (PyMuPDF). Pills auto-place at centroids.

## Proven (the lab)
A clean redrawn landscape floorplate (white rooms, hairline partitions, heavy perimeter, hatched
columns, central corridor) + 12 units (292-297 top, 286-291 bottom; sale/sold/reserved). STRUCT: plan
+ zones share viewBox `0 0 1600 780`; 12 footprints + 12 pills; **pillsInsideFootprint 12/12**
(centroids correct, not hand-placed). HOVER LIVE 292: footFill 0.12, pill is-hover, '+' opacity 1, top
card `3E / № 292 / 60.1 м² / 23 330 820 ₽`. HOVER SOLD 287: no '+', card `Продано`, is-dead. SELECT
297 fires onSelect → `№ 297 (1E)`. Zero console errors. Smoothness (4× CPU throttle, hover sweep ×10):
159 frames, 0.63% long → PASS. Screenshots: live 294 = terracotta wash + number pills + top card; sold
287 = cooler grey wash + 'Продано'.
