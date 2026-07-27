# Floorplan Patterns — the DRILL-DOWN taxonomy (building/site -> floor -> unit -> flat)

> A **pattern** is a named atom-composition that RECURS across the floorplan variants or
> GENERALIZES into a reusable shape. Each pattern fixes the one thing juniors get wrong: the
> **atom order**, the **pin-owner rule** (always 0, controlled-click), the **spec-owner rule**
> (the unit nr/type/area/price/status is ALWAYS visible, never hidden behind a click-only card),
> and the **asset-truth rule** (real plans + real unit data, or openly-synthetic with a legal line).
>
> The section is the CONVERSION CORE of a residential site: the visitor finds their specific
> apartment/house and goes to a lead. The reference bar is EVER / ERA / Springs visual-search
> (zero WebGL: static renders + hand-authored SVG overlays + DOM + GSAP). Teardowns:
> apps/quadro/.award-re/teardowns/D_ever_visualsearch_video.md + D_era_springs_visualsearch_video.md.

---

## 0. THE ONE SKELETON (all 9 variants share it; re-skin + re-compose, never re-engineer)

Three base atoms, composed, never forked:
1. **L1 pick a floor / a house** -> `clean-floor-hover-select` (over a real render: traced bands,
   viewBox locked to the render's intrinsic px, fit:contain). Its built-in `.cfh-card` tooltip
   y-tracks the hovered band; SUPPRESS it (omit `.cfh-card`) when you want an OFF-facade rail.
   EXCEPTION: the smarts FACADE uses the shipped FBANDS inline approach (not this atom), because
   the atom has no `fit:'fill'` path and the smarts facade geometry is hand-calibrated
   (memory `smarts-facade-geometry-dont-touch`).
2. **L2 pick a unit on a clean redrawn numbered plate** -> `numbered-floorplate-select` (per-unit
   footprint polygons + a number PILL at each footprint's COMPUTED centroid, in the plan's shared
   viewBox; status-coded hover wash + a top card). NEVER put a CSS transform on the pill `<g>`
   (it carries the centroid translate -> the pill jumps to origin; F-15).
3. **L3 the calm unit detail** -> `veil-flat-detail-reveal` (dark cover->hold->open veil into a
   TWO-TONE spec-rail + plan-canvas; a single fixed overlay, data swapped per unit, no router).

The shared data + helpers live in `combos/_shared/floorplan-helpers.js` (real smarts/towns data +
the synthetic tower demo data + converters + the $-`fmtPrice` + the floor/site locator builders).
Real plans + the authored tower vectors live in `library/_assets/floorplan/`.

LAWS for every variant: `expectPins:0` (controlled-click, reveal-then-user-clicks, never scroll-pin
auto-step); NO scale-from-origin on a content SVG (F-19; use clip-path/opacity/Flip-on-rasters);
the unit SPEC stays visible (F-20); the flat-detail canvas is FULL (F-22: big plan + visible
floor-locator with THIS unit highlighted + optional site chip + a similar-units strip); the back
control is a PROMINENT pill (F-21); the plate plan carries INTERIOR architecture, not empty boxes
(F-23); NO-WebGL; $ prices; ZERO em-dash/en-dash anywhere.

---

## 1. THE THREE FAMILIES (by object type) x THE PALETTE/COMPOSITION AXES

The section adapts to the OBJECT. Three families, each ~3 variants, differing by palette skin
(re-pointed CSS tokens, the engines never forked) + the L3 composition + ONE signature move.

### A. SMARTS family — one entrance, ~50 apartments, FULL drill (real units.json)
The classic full building->floor->unit->flat. Real clean vector `floor-std-clean.svg` (18 room
rects, interior-rich) + real facade + real type plans. 54 units, $950/m2, real statuses.
- **floorplan-smarts--museum-daylight** (EVER LIGHT): the reference-faithful baseline; signature =
  the persistent availability spine (real free-counts) + the morphing floor-locator breadcrumb. The
  family SAMPLE (owner-approved direction).
- **floorplan-smarts--copper-dusk** (ERA DARK): premium evening; signature = copper wall
  stroke-draw-on at L2 (the architect inking the plan via stroke-dashoffset) + a warm interior
  photo-bleed behind the giant type on L3 (decode-guarded, behind the type, never over the spec).
- **floorplan-smarts--compare-two** (EVER LIGHT + drafting-blue accent): the ONLY catalog-legal
  2-plans composition; signature = pin-to-compare (a 2-slot tray; when 2 picked, both plans side by
  side + a synced spec diff). Max 2 by construction (a 3rd pick shifts the oldest out).

### B. TOWNS family — a few identical houses in a row, SHORTENED drill (real content.js)
Pick 1 of 6 -> the deep town page (the unit IS the house; no floor->unit nesting). All available
(towns are for sale; inventing sold/reserved is dishonest). The town page = a deep two-tone veil
detail with PROPORTIONAL real-area room tiles (real areas, NO invented footprint, honest
"візуалізація" caption) since towns has no real plan PDF yet. The hover spec is ALWAYS off the
facade (F-20). Built on the live towns-zamkova site, elevated.
- **floorplan-towns--row-elevation-rail** (ERA DARK): the real 6-house render + an OFF-facade rail
  card + a hairline tether; signature = the row stays uncovered (the F-20 fix). The family SAMPLE.
- **floorplan-towns--street-ribbon** (EVER LIGHT): a numeral-dominant street-elevation; signature =
  GIANT ghosted numerals 1-6 in a reserved sky-band ARE the UI (the dimmed render is a substrate);
  a slim chip glides above the roofline, the spec in an off-facade column. A genuinely different
  HERO from the rail variant. (Layout law: the sky-band is a real top layout pad, start-aligned, so
  the numerals are always fully visible; the render may bleed past the bottom edge.)

### C. TOWER-1to1 family — a large multi-korpus tower, FULL drill (OPENLY SYNTHETIC demo)
The "we can do exactly what EVER/ERA/Springs do" showcase, on a Higgsfield-generated tower
(`tower-front.png`, ~9-10 traceable floors per the B3 cap) + an authored `tower-floor-clean.svg`
(8 footprints round a core) + authored type plans. Data is openly synthetic + self-consistent
(area x $1450 so price never contradicts area) + carries the legal line "Демонстраційний проєкт.
Дані наведено для прикладу." Floor bands TRACED over the real render off a coordinate grid.
- **floorplan-tower--ever** (EVER LIGHT): faithful EVER replica; signature = the EVER y-tracking
  floor tooltip + a korpus A/B toggle re-theming the bands on the same render. The family SAMPLE.
- **floorplan-tower--era** (ERA DARK): faithful ERA replica; signature = L3 cinematic photo-bleed
  (a warm `interior-evening.webp/png` behind a giant area numeral) + copper plate.
- **floorplan-tower--springs** (SPRINGS CREAM): faithful Springs replica; signature = the left
  preview-pane mini-plan slide on pill hover (the one genuinely novel L2 interaction) + green-rail
  cream-canvas L3. The preview pane seeds the first unit's mini-plan at load so the surface paints.

---

## 2. THE PALETTE RE-SKIN (token-only, the engines never forked)
- **EVER LIGHT**: cool pale plate `#e9ecee`, white plan, dark-on-white number pills, terracotta
  accent `#c2724e`. Museum-calm daylight.
- **ERA DARK**: navy stage `#16202c..#1c2733`, COPPER accent `#c08457`, light-grey pills, the plate
  can stay light or go copper-on-navy. Premium evening. L3 photo-bleed.
- **SPRINGS CREAM**: warm sand plate `#e9e2cf`, fine SEPIA strokes `#8a7d63`, oval cream pills,
  green accent for the L3 rail. Resort-soft.
All three are the SAME numbered plate / floor-hover / veil, re-pointed via CSS variables in the
variant `<style>` only.

---

## 3. THE L3 COMPOSITIONS (the flat-detail, three moods, same atom)
The `veil-flat-detail-reveal` atom is untouched; the three moods are per-combo markup + CSS:
- **neutral rail** (EVER): grey-blue rail + lighter plan canvas. museum-daylight, compare-two.
- **photo-bleed** (ERA): a warm interior image bleeds BEHIND the giant type/area numeral on the
  rail (decode-guarded; behind the type, never over the spec numbers); dark copper plan panel.
  copper-dusk, tower--era.
- **preview / green** (Springs): a green-gradient rail + cream plan canvas; the Springs L2 also has
  the left preview-pane mini-plan. tower--springs.
Always FILL the canvas (F-22): big plan + floor-locator (THIS unit `--fp-loc-on` terracotta/copper)
+ optional site chip + a similar-units strip. Always a PROMINENT back pill (F-21).

---

## 4. WHAT JUNIORS GET WRONG HERE (the gate laws, learned F-15..F-23)
- Empty unit boxes on the plate -> add interior walls + door swings (F-23).
- A small plan lost in a big empty canvas -> fill it (F-22).
- A faint text back link -> a prominent pill, Esc too (F-21).
- The hover card covering the very house/unit you point at -> off-facade rail / above-roofline chip
  (F-20).
- A CSS transform on the number-pill `<g>` -> the pill jumps to origin (F-15).
- Scaling a content SVG to "zoom" -> it swims, text bloats (F-19); use clip/opacity/Flip-on-raster.
- Inventing sold/reserved on real for-sale units, or an invented plan footprint -> asset-truth
  failure; show all-available + honest proportional tiles when there is no real plan.
- Raw HTML entities (`&middot;`, `&mdash;`) in a JS string that becomes textContent -> they render
  literally; use the real character (`·`) and never an em/en-dash.

## 5. MOBILE FACADE-HERO (the phone pattern for a facade floor-picker, learned F-41/F-42)
A landscape building render in a portrait phone can't be both big and fully shown at once, and the
desktop drill (hover bands, side panels, veil locators) breaks on touch. The pattern that works:
- **L1** — the WHOLE building shows (`object-fit:contain`, never cropped), as a STATIC image: no band
  contours, no tapping on the building (`.en-facade__svg { display:none }`). Floors are picked ONLY by
  big buttons docked at the bottom (`.en-ledger` as a bottom bar). Variants whose desktop picker isn't a
  ledger (a tracking tooltip, a green preview panel) hide that on mobile and show the ledger instead.
- **L2** — the spec + unit list must be OPAQUE with real contrast (light card `#fff` + dark text on light
  skins; a solid dark card `#12191f` + light text on a dark skin). `rgba(...,.4)` translucent = unreadable.
- **L3** — a REAL top-to-bottom scroll: `#fp-flat.vfd-overlay{overflow-y:auto}` +
  `.vfd-page{position:relative;inset:auto;display:flex;flex-direction:column;height:auto;min-height:100%;overflow:visible}`
  so children take natural height and the page overflows/scrolls. The rail (with the CTA) comes FIRST, the
  plan canvas BELOW it. Drop `.vfd-locators` + `.vfd-seed` (desktop-only chrome, noise on a phone).
- Drive it off CSS vars (`--en-ink/-accent/-muted`) so ONE mobile block auto-adapts to every skin; only a
  dark skin needs explicit bar/list overrides.
- The building geometry stays the live-smarts container (aspect-ratio 2.357 + cover) on desktop — see F-41;
  mobile switches that ONE combo to contain because the picker moves off the building to the bottom bar.

### 5b. MOBILE TOWNS ROW-PICK + TOWN-PAGE (the Claude Design phone grammar, verified live 2026-07-01)
When the object is a ROW of identical houses (TOWNS family), the phone splits into two page kinds, each a
distinct scroll model — do NOT make the row-pick scroll:
- **Row-pick = a FIXED `100dvh` app**, never scrolls: `.app{display:flex;flex-direction:column;height:100dvh}`.
  Big building render fills the middle (`.hero{flex:1;min-height:0}` + `img{object-fit:contain;max-height:100%}`
  = whole row shown, static, read-only pins over it). Pick is a docked 3-col grid of large buttons at the
  bottom (`.grid{grid-template-columns:repeat(3,1fr)}`, `.hbtn{min-height:60px}` showing №/82м²/status).
  Free tap → `setTimeout(180ms)` → `location.href=TOWN`; sold/reserved tap → an inline status card (never
  navigate). States painted with TRANSPARENT `backdrop-filter` washes (`grayscale` sold / `sepia` reserved),
  masked to the house strip — house stays visible (F-43). Verify signature: `scrollable=false`, hero
  `naturalWidth>0`, 6 picker buttons.
- **Town-page = single-column REAL scroll** (`scrollable=true`): sticky top (back/brand/Заявка), hero above
  the fold (№, 82м², від $67тис., full-width CTA), then a TAP-DRIVEN plan — `.floor-tabs` (Поверх 1/2), an
  SVG `.plansvg` whose room tap swaps a render in a `.viewer` BELOW the plan with its own per-room День/Вечір
  toggle; then an interiors `.stack` (each card its own day/night), yard, honest price row, form (inputs
  `font-size:16px;min-height:52px` so iOS doesn't zoom). ONE town-page template is reused across all
  directions — only the back-link, serif/palette tokens, and section headings differ. Verify signature:
  imgs≈15 all `naturalWidth>0`, plan rooms drawn, `scrollable=true`.
- Gallery index (`all-prototypes-mobile.html`) is a card/iframe list — expect `imgs=0, pickerBtns=0`; that's
  correct, not a failure.
- Assets the phone build needs: `assets/row/selector-row-6-day.png` (row render), `assets/interiors/*.jpg`
  (day+night pairs), `assets/yard/*.webp`. Confirm all three dirs before deploy.
