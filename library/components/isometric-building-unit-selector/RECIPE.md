---
id: isometric-building-unit-selector
name: "Isometric building unit-selector (the visual-search conversion core: a pre-rendered iso building + SVG hotspots + a filter bar + a live count + a hover info-card; filtering highlights matching units and dims the rest)"
level: 2
kind: component
status: official
entry:
  call: "IsometricBuildingUnitSelector.create(target, opts)  // target = .ibs-stage > .ibs-render(img + svg.ibs-hotspots[.ibs-unit[data-*]]) + .ibs-card + .ibs-count + .ibs-filters(.ibs-f[data-filter][data-value]) + .ibs-expand + .ibs-apply. opts: { dimOpacity, hotOpacity, matchOpacity, onSelect, onExpand }."
  module: iife
  returns: "{ applyFilter(state), count(), select(nr), reset(), units, destroy }"
meaning:
  what: "r1864's visual-search — the conversion core. A pre-rendered ISOMETRIC building image with an SVG overlay of unit/section hotspots, a horizontal filter bar (коллекция / секция / кол-во спален / площадь), a РАЗВЕРНУТЬ (expand) + ПОДБОР (apply) action, a live count, and a hover info-card (collection / section / floor / unit). Filtering highlights matching hotspots and dims the rest; hovering one lights it + fills the card; the count = matching AVAILABLE units."
  when: "The apartment / unit SELECTOR of a ЖК site — the page that turns a browser into a lead. Use it when you have a striking building render (aerial / isometric) and an inventory with filterable attributes (collection, section, bedrooms, area, floor) + availability. It reads as premium and spatial (you pick on the actual building, not a table), and it composes with the base 2D floor-plate drill-down (РАЗВЕРНУТЬ flips to the plate). The single highest-conversion beat on a residential site."
  lands: "You see the building from above, and a tray of filters along the foot. Tap a collection or a number of bedrooms and the building answers — only the matching apartments glow on the render, the rest fade back, and a big number in the corner tells you how many are available. Move over a glowing unit and a small card names it: collection, section, floor, number. Press 'select by parameters' and it takes you in. It feels like choosing your home on the actual building."
  not_when: "A site with no inventory / no filterable units (use a gallery). When a flat table or a 2D floor-plate alone suffices (use the base SVG-plate engine). When you have no building render to overlay. A live, rotatable 3D model is explicitly OUT (NO-WebGL) — this is a static render + hotspots."
source:
  grammar: "r18641 /plans: iso building render, a hover card 'ЧАСТНЫЕ / 2 СЕКЦИЯ / 6 ЭТАЖ / 605 НОМЕР', a filter bar КОЛЛЕКЦИЯ/СЕКЦИЯ/КОЛ-ВО СПАЛЕН/ПЛОЩАДЬ, ПОДБОР ПО ПАРАМЕТРАМ + РАЗВЕРНУТЬ ВИД."
  recording: "apps/quadro/.award-re/teardowns/D_r1864_video.md (Brick 2 of the r1864 harvest; the visual-search core)"
  registry_ref: ["r1864-isometric-building-unit-selector"]
stack: "vanilla (SVG hotspots + DOM filter UI; no GSAP, NO WebGL)"
webgl: false
motion_props: [opacity, transform]
trigger: "triggered (filter / hover / click / keyboard), not scroll"
timing_layer: [D-interaction]
owns_pin: false
owns_scroll: false
page_beat: [visual-search, apartment-selector, plans]
combines_with: [numeral-frame-expand-hero, collection-tier-announce, river-tinted-poi-map]
anti_combos: [live-webgl-3d, selector-over-scroll-surface]
gated_by: [R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, tokens.json]
acceptance:
  - "a pre-rendered iso building image (.ibs-render img) with an SVG hotspot overlay (.ibs-hotspots > .ibs-unit), each unit carrying data-nr + data-state (available/sold/reserved) + data-coll/sec/beds/area/floor"
  - "applyFilter(state) adds .is-match (lit) to matching hotspots + .is-dim (hidden) to the rest, ~300ms ease; the live count = matching AVAILABLE units (sold/reserved excluded)"
  - "hover/focus a hotspot -> .is-hot (lit stronger) + the info-card fills from its data (collection/section/floor/unit) and follows the cursor, clamped inside the stage"
  - "filter buttons toggle within their group (re-click clears); click a hotspot or ПОДБОР (first match) fires onSelect(unitData); РАЗВЕРНУТЬ fires onExpand (flip to the 2D plate)"
  - "SVG fill/stroke-opacity + DOM opacity/transform only; NO mix-blend over the render; NO WebGL (static pre-render, no rotation); hotspots keyboard-reachable (tabindex + Enter/Space)"
  - "reduced-motion -> no transitions; window.__LAB_OK__ on init"
  - "asset-substitution gate: OUR QUADRO building render + SVG hotspots + a Cyrillic filter bar + warm palette"
gate:
  probe: "Open lab.html. __LAB_OK__ true. The building shows with a filter bar + a live count. Pick a коллекция -> only matching units glow, the rest dim, the count updates (sold excluded). Hover a unit -> it lights + a card names it (collection/section/floor/number). ПОДБОР selects the first match; РАЗВЕРНУТЬ would flip to the 2D plate. Triggered (NOT scroll) -> verify count/filter/hover-card/reset + that sold units are excluded from the count, and run the TRIGGERED smoothness probe (filter+hover cycles)."
note: |
  Brick 2 of the r1864 harvest — the VISUAL-SEARCH conversion core, the biggest component. A
  pre-rendered iso building + SVG hotspots + filter bar + live count + hover card. SIBLING of
  the base visual-search SVG floor-PLATE drill-down (building->floor->unit): that is flat plates,
  this is an iso render + overlay hotspots + a filter bar — they COMPOSE (РАЗВЕРНУТЬ flips iso ->
  2D plate). NO-WEBGL honored: static render (Blender/QUADRO stand-in), no live 3D/rotation;
  units are SVG hotspots keyed to the base data-nr + available/sold/reserved model. SVG opacity +
  DOM = GPU-cheap. owns_pin false. Proven on a QUADRO render with 6 units: count excludes sold
  (Частная -> 1 available of 2), hover fills the card, reset restores; 0.5% jank @ 59.9fps, zero
  console errors. Real use: replace the render + author real hotspot polygons over each section/
  unit, wire data-nr to the inventory, РАЗВЕРНУТЬ -> the base 2D floor-plate.
---

# isometric-building-unit-selector — the visual-search conversion core (iso render + SVG hotspots + filter bar)

r1864's apartment selector: a pre-rendered isometric building with an SVG hotspot overlay, a
filter bar (collection / section / bedrooms / area), a live count, and a hover info-card.
Filtering lights matching units and dims the rest; hover names a unit; ПОДБОР selects; РАЗВЕРНУТЬ
flips to the 2D floor-plate. NO-WebGL (static render + hotspots), composes with the base plate engine.

## Markup + call
```html
<section class="ibs-stage" id="plans">
  <div class="ibs-render">
    <img src="building.webp">
    <svg class="ibs-hotspots" viewBox="0 0 1440 900" preserveAspectRatio="none">
      <rect class="ibs-unit" data-nr="605" data-coll="chastnaya" data-coll-label="Частные"
            data-sec="2" data-beds="3" data-area="180" data-floor="6" data-state="available"
            x="300" y="300" width="170" height="120"/>
      <!-- … more units … -->
    </svg>
  </div>
  <div class="ibs-card">… .ibs-card-coll/-sec/-floor/-nr …</div>
  <div class="ibs-count"><div class="num">0</div><div class="lbl">апартаментов</div></div>
  <button class="ibs-expand">↻ Развернуть вид</button>
  <button class="ibs-apply">Подбор по параметрам →</button>
  <div class="ibs-filters">… .ibs-f[data-filter="coll|sec|beds"][data-value] …</div>
</section>
```
```js
IsometricBuildingUnitSelector.create('#plans', { onSelect:d=>{…}, onExpand:()=>{…} });
```

## Proven (the lab)
QUADRO building render + 6 SVG hotspot units (filter data + available/sold/reserved). Measured
live: initial 6 units, count=4 available (606 sold + 313 reserved excluded). Filter Частная →
match 2 (605+606), dim 4, count 1 (606 sold excluded). + секция 2 → still 2. Hover 605 → card
"Частные / Этаж 6 / Номер 605". Reset → count 4. Screenshot (Пентхаусы + hover 701): lit copper
hotspot, card "Пентхаусы / 3 СЕКЦИЯ / 8 ЭТАЖ / 701 НОМЕР", count "1 АПАРТАМЕНТОВ", filter bar +
РАЗВЕРНУТЬ + ПОДБОР (matches r1864 /plans). Probe (4× CPU throttle, filter+hover cycles): 2/400
long frames (0.5%), 59.9fps → PASS. Zero console errors.
