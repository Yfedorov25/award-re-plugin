---
id: floorplan-smarts--ever-numeral
name: "Floorplan SMARTS ever-numeral (EVER light museum skin; ported from Claude Design 02; a giant thin ghost numeral swaps per floor hover + a bottom floor-ledger spine; full building->floor->unit drill on the real 54-apartment object)"
role: floorplan
kind: combo
status: base
family: floorplan-smarts
palette: ever-light
entry:
  call: "combo-lab.html - composes numbered-floorplate-select (L2) + veil-flat-detail-reveal (L3) over the real smarts facade (inline FBANDS L1, NOT the L1 atom). Data from _assets/floorplan/smarts-units.js via _shared/floorplan-helpers.js."
  module: section-variant
uses:
  - { atom: numbered-floorplate-select, job: "L2 clean redrawn numbered floorplate of the real floor-std-clean.svg (viewBox 100x44.08); per-unit footprints from units.json pos + centroid number pills; status-coded hover wash + top card" }
  - { atom: veil-flat-detail-reveal, job: "L3 calm two-tone flat-detail via the dark cover-hold-open veil; spec rail + plan canvas + floor-locator with THIS unit filled" }
meaning:
  what: "The conversion-core floorplan for the real SMARTS object (one entrance, 54 apartments), ported from a Claude Design composition onto our real engine. PALETTE = EVER LIGHT museum (slate gradient, terracotta #b9633c, ink #1f2429). Fraunces + Inter. FULL drill: L1 the real facade with hover floor-bands (the OFF-facade affordance never covers the building) -> click a floor -> L2 the clean redrawn numbered floorplate beside a persistent unit-list (nr/type/area/price/status, live free-counts, spec always visible) -> click a unit -> L3 the calm veil flat-detail. Controlled-click; 0 pins; NO-WebGL."
  when: "A multi-apartment residential building (one entrance, tens of units across floors) where the user must find a specific apartment. One of the four smarts floorplan compositions (ever-numeral / era-cinematic / ever-band / springs-twopane), same engine, distinct look."
  signature: "The giant thin Fraunces ghost numeral that swaps (fade+rise, expo.out) on every floor hover (L1), sits behind the plan (L2) and behind the apartment title (L3) - the museum-numeral thread. Bottom floor-ledger (реєстр поверхів) as the L1 spine."
  lands: "The real building on screen; move up its floors and the chosen level lights while an OFF-building affordance names its free count and from-price. Click and a clean redrawn plate of that floor arrives, each apartment marked by its number, a list beside it naming size, price and status. Click a number and the screen goes dark for a beat and lifts to the calm apartment page. A precise index of the whole building, the number doing the work."
source:
  grammar: "EVER visual-search L1-L3 on the real smarts building, re-skinned to this Claude Design composition. L1 facade floor-bands (shipped FBANDS, not the L1 atom); L2 numbered-floorplate-select + a persistent unit-list spine; L3 veil-flat-detail-reveal."
  recording: "claudedesign/Smarts Floor Selector Redesign1 (the approved LOOK) + apps/quadro/.award-re/teardowns/D_ever_visualsearch_video.md (the engine grammar)."
  registry_ref: ["ever-visual-search-drilldown", "smarts-floorplan-claude-design"]
asset_truth: "REAL. apps/smarts/data/units.json via _shared/floorplan-helpers.js (54 units, 18/floor on 2/3/m, types Смарт 27/24, $950/m2, statuses 35 available / 12 sold / 7 reserved). REAL floor-std-clean.svg + facade-commerce-clean.webp + type-27/24-clean.webp. Prices = area x 950. Nothing invented."
webgl: false
owns_pin: false
motion: "transform / opacity / clip-path / filter / stroke-dashoffset only. Reveal = clip-path inset + fade (scroll-in once). Drill L1->L2 = opacity swap (no scale-from-origin). L2->L3 = the veil cover-hold-open. award/power2/expo eases."
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "FULL drill building->floor->unit: L1 real facade + an OFF-building floor affordance (never covers the building, F-20); L2 the clean numbered floorplate + a persistent unit-list (nr/type/area/price/status); L3 the veil two-tone flat-detail. Verified by screenshot at every level."
  - "asset-truth: 54 real units from units.json via the shared helpers; types Смарт 27/24; $950/m2; statuses 35/12/7; real plan + facade + type-NN-clean. NOTHING invented."
  - "CONTROLLED-CLICK, PIN-LESS: 0 pins, no scroll-stepping, no scale-from-origin. Reveal once on scroll-in; the USER hovers/clicks to drill. pins === 0."
  - "PLAN IS HERO + SPEC VISIBLE: the unit spec (nr/type/area/price/status) is always visible, never hidden behind a click-only card. Prominent back at L2 + L3 (F-21). Filled flat-detail canvas (F-22). Interior-rich clean plan (F-23)."
  - "motion only transform/opacity/clip-path/filter/stroke-dashoffset; NO WebGL/mix-blend-as-fill/canvas/scale-from-origin. reduced-motion/<=820px -> a static plan picture + list. __LAB_OK__ true, 0 console errors."
  - "copy Ukrainian; ZERO em-dash/en-dash anywhere incl comments; $ prices (no ruble)."
gate:
  probe: "Open combo-lab. __LAB_OK__ true, 0 pins, 0 console errors, [data-render-surface] painted. Hover a floor band -> the composition affordance lights (never covers the building). Click a floor -> the clean numbered plate + a right unit-list with real nr/type/area/price + status. Click a unit -> the dark veil opens the two-tone flat-detail. Drive via real mouseenter/click; eyeball every level."
  expectPins: 0
  pinOwner: none
  atomsCited: [numbered-floorplate-select, veil-flat-detail-reveal]
---

# floorplan-smarts--ever-numeral

Ported from Claude Design onto our real engine (FBANDS L1 -> numbered-floorplate-select L2 -> veil-flat-detail-reveal L3) with the real 54-unit smarts data. PALETTE = EVER LIGHT museum (slate gradient, terracotta #b9633c, ink #1f2429). Fraunces + Inter.

SIGNATURE: The giant thin Fraunces ghost numeral that swaps (fade+rise, expo.out) on every floor hover (L1), sits behind the plan (L2) and behind the apartment title (L3) - the museum-numeral thread. Bottom floor-ledger (реєстр поверхів) as the L1 spine.
