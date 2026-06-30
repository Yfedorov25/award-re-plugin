---
id: floorplan-smarts--compare-two
name: "Floorplan SMARTS compare-two (EVER light skin + a cool drafting-blue 4th accent; the SMARTS family pin-to-compare composition: the real numbered floorplate + unit list as the entry, click two units into a 2-slot compare tray, then see BOTH clean plans side by side with a synced diff-highlighting spec table; max 2 plans by construction so it is catalog-legal; optional single-unit veil deep view)"
role: floorplan
kind: combo
status: base
family: floorplan-smarts
palette: ever-light
entry:
  call: "combo-lab.html - composes numbered-floorplate-select (the picker) + veil-flat-detail-reveal (optional single-unit deep view) over the real smarts floor plate; a bespoke 2-slot compare tray + two-column compare panel are the signature. Data from _assets/floorplan/smarts-units.js via _shared/floorplan-helpers.js."
  module: section-variant
uses:
  - { atom: numbered-floorplate-select, job: "the picker: clean redrawn floorplate of the real floor-std-clean.svg (viewBox 100x44.08, interior walls); per-unit footprints from units.json pos + centroid number pills; clicking a pill ADDS the unit to the 2-slot compare tray (not a flat open); status-coded hover wash" }
  - { atom: veil-flat-detail-reveal, job: "optional single-unit deep view: a Деталі button on a compare column opens the dark cover-hold-open veil with the real type-NN-clean.webp plan + spec rail + drafting-blue floor-locator (THIS unit)" }
meaning:
  what: "The SMARTS-family compare-two floorplan: the ONLY catalog-legal two-plans composition. ENTRY is the smarts L2 (numbered-floorplate-select on the real clean plate, default floor 3) beside a persistent unit list carrying nr/type/area/price/status (the spec stays visible). SIGNATURE = pin-to-compare: the user CLICKS a unit pill or list row to add it to a 2-SLOT compare tray; when 2 slots are full, both clean plans appear SIDE BY SIDE in a two-column panel with a synced spec table (тип / площа / ціна / поверх / статус) where the rows that DIFFER glow drafting-blue and carry a delta (різниця X м², різниця $Y). A 3rd pick shifts out the oldest, so it can NEVER show 3 plans (catalog-legal by construction). Each slot has a clear remove control + a Деталі button to the single-unit veil. Controlled-click; 0 pins; NO-WebGL."
  when: "A multi-apartment residential building where buyers decide BETWEEN two similar apartments (same type, different floor or footprint; or two types head to head). The catalog-legal compare member of the floorplan family: it is the variant that lets you show two plans together without violating the max-2-full-plans rule, because two is the hard ceiling of the composition."
  signature: "Pin-to-compare. The live pick-counter pip (вибрано N з 2) + the 2-slot compare tray + the two-column compare panel with a SYNCED spec table whose differing rows glow drafting-blue (the comparison IS the spec, fully visible). Max 2 plans by design; a 3rd pick swaps the oldest slot."
  lands: "A cool pale floor plate, every apartment marked by its number, a list beside it naming each one with its size, price and whether it is free, sold or held. Click a number and it drops into a slot in a little tray at the bottom; click a second and the tray lights up. Press the button and the screen lifts to two clean plans standing side by side, a slim table down the middle reading off площа, ціна, поверх, тип, статус line by line, the lines that differ glowing a quiet drafting-blue with the exact gap named. It reads as a precise side by side of exactly two homes, the difference doing the talking."
source:
  grammar: "EVER visual-search L2-L3 (the light museum skin) on the real smarts building, recomposed for comparison: the numbered floorplate is the picker, the bespoke 2-slot tray + two-column compare panel are the signature, the veil-flat-detail-reveal is the optional single-unit deep view. Drafting-blue is the 4th accent; the composition (not the skin) is the differentiator."
  recording: "apps/quadro/.award-re/teardowns/D_ever_visualsearch_video.md (L2-L3) + D_era_springs_visualsearch_video.md (palette family). Quality bar: apps/smarts/src/js/sections/units.js (FIX-2). Sibling: floorplan-smarts--museum-daylight (the full-drill EVER baseline)."
  registry_ref: ["ever-visual-search-drilldown", "SMARTS-floorplan-etalon"]
asset_truth: "REAL. apps/smarts/data/units.json (54 units, 18/floor on 2/3/m, types Смарт 27 / Смарт 24, $950/m2, statuses available / sold / reserved). REAL floor-std-clean.svg (interior walls) + type-27-clean.webp + type-24-clean.webp. Prices = area x 950; $ (no ruble). Only available units are pickable. Nothing invented."
webgl: false
owns_pin: false
motion: "transform / opacity / clip-path / stroke-dashoffset only. Reveal = clip-path inset + fade (scroll-in once). Hover = footprint wash 0.12. Pick = tray slot + pip fill (opacity/background). Picker -> compare = opacity swap + staggered column rise (no scale-from-origin, F-19). Compare column -> veil = the cover-hold-open. award/power2/expo eases."
gated_by: [R_pin_budget, R_perf_limits, R_no_webgl]
acceptance:
  - "ENTRY = the smarts numbered floorplate (default floor 3) + a persistent unit list with nr/type/area/price/status; the floor index IS the entry (no L1 facade). Verified by screenshot."
  - "SIGNATURE pin-to-compare: clicking a pill or row adds an AVAILABLE unit to a 2-slot tray (the pip shows вибрано N з 2); a 3rd pick shifts out the oldest so picks length is always <= 2; clear + per-slot remove work. With 2 picks the compare panel shows BOTH clean plans side by side + a synced spec table whose differing rows glow drafting-blue with a named delta. MAX 2 plans by construction (catalog-legal). Verified by screenshot."
  - "asset-truth: real units.json (18/floor on 2/3/m), types Смарт 27/24, $950/m2; real floor-std-clean.svg + type-27/24-clean.webp. Prices = area x 950. Only available units pickable. NOTHING invented."
  - "CONTROLLED-CLICK, PIN-LESS: 0 pins, no scroll-stepping, no scale-from-origin. Reveal once on scroll-in; the USER picks/compares. pins === 0."
  - "PLAN IS HERO + SPEC VISIBLE: the unit list (nr/type/area/price/status) is always visible while picking; the compare panel shows the two plans large with the spec table beside them, never hidden behind a click-only card. F-21 prominent back pill; F-22 columns fill the canvas, no dead space; F-23 interior-detail plate."
  - "motion only transform/opacity/clip-path/stroke-dashoffset; NO WebGL/mix-blend/backdrop/canvas/scale-from-origin. <=980px -> stacked compare. __LAB_OK__ true, 0 console errors."
  - "copy Ukrainian; ZERO em-dash/en-dash anywhere incl comments; $ prices (no ruble)."
gate:
  probe: "Open combo-lab. __LAB_OK__ true, 0 pins, 0 console errors, [data-render-surface] painted. The plate shows numbered units on floor 3 + a right list with real nr/type/area/price + status dots + a 2-slot tray. Click two available units (pill or row) -> the pip reads вибрано 2 з 2, both slots fill, the CTA enables. Press Показати поруч -> the compare panel shows both clean plans side by side + a synced spec table with differing rows in drafting-blue + named deltas. A 3rd click never yields a 3rd plan. Деталі on a column opens the veil deep view. Drive via real mouse clicks; eyeball every state."
  expectPins: 0
  pinOwner: none
  atomsCited: [numbered-floorplate-select, veil-flat-detail-reveal]
files: [combo-lab.html, RECIPE.md]
note: |
  Family member S3: the catalog-legal COMPARE composition for SMARTS. It is the variant licensed to put
  two full plans on screen, because two is the structural ceiling: picks is capped at 2 and a 3rd pick
  shifts out the oldest, so a 3rd plan can never render (the max-2-full-plans catalog rule is satisfied by
  construction, not by discipline). Entry reuses the family L2 (numbered-floorplate-select on the real
  floor-std-clean.svg + the persistent unit list) with NO L1 facade; the floor index is the entry, default
  floor 3. The SIGNATURE is pin-to-compare: a 2-slot tray + a two-column compare panel + a SYNCED spec
  table whose differing rows glow the drafting-blue 4th accent (#2f6f8f) with a named delta, so the spec
  is not just visible but the whole point. The veil-flat-detail-reveal is the optional single-unit deep
  view from a Деталі button (one overlay, data swapped). Skin = EVER light + drafting-blue; the
  COMPOSITION is the differentiator. Siblings: museum-daylight (full-drill EVER baseline) + copper-dusk
  (ERA dark). Reference: D_ever_visualsearch_video.md + D_era_springs_visualsearch_video.md.
---

# floorplan-smarts--compare-two - EVER light pin-to-compare, the catalog-legal two-plans member

The SMARTS family compare composition: the real numbered floorplate + unit list as the entry, click two
units into a 2-slot tray, then see BOTH clean plans side by side with a synced spec table that highlights
exactly what differs in drafting-blue. Max two plans by construction (a 3rd pick swaps the oldest), so it
is catalog-legal. Controlled-click, plan is hero, the spec is the whole point and stays visible. All real
smarts data; $ prices.

## Proven (the lab)
__LAB_OK__ true, 0 pins, 0 console errors, render surface painted. Atoms ran: numbered-floorplate-select
(the picker) + veil-flat-detail-reveal (optional deep view). Drive: floor 3 plate -> 18 numbered units +
a right list (01 Смарт 27 м² $25 707 ... status dots) + a 2-slot tray reading вибрано 0 з 2; click two
available units -> both slots fill, pip reads вибрано 2 з 2, CTA enables; Показати поруч -> two clean
plans side by side + a center spec table (Тип / Площа / Ціна / Поверх / Статус) with the differing rows
in drafting-blue carrying named deltas (різниця X м², різниця $Y); a 3rd click shifts the oldest slot so
a 3rd plan never renders; Деталі on a column opens the veil. Real data from units.json; $ prices (no
ruble). Screens reviewed by eye.
