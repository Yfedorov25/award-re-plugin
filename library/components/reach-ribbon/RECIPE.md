---
id: reach-ribbon
name: "Reach ribbon (coverage, not distance: one soft organic walking-reach isochrone is drawn on an illustrated cream map, its outline stroking in and a warm fill flooding it, while every daily place INSIDE lights warm and named and the one or two just OUTSIDE stay faint with a +N хв note; a 5 / 10-minute toggle grows the ribbon and a live count says how much fits inside)"
level: 3
kind: section
status: official
since: base-92
tags: [map, location, proximity, isochrone, coverage, walk-time, illustrated, editorial, real-estate, no-webgl]
entry:
  call: "ReachRibbon.create(target, opts)  // target = .rr (a .rr-grid of a .rr-col editorial column [kicker + headline + a [data-rr-count] + a [data-rr-toggle] 5/10 group + a [data-rr-row] legend] and a .rr-stage with svg.rr-map). The SVG holds river/parks/roads, [data-ribbon=N] isochrone paths (one per reach), a [data-home-anchor] marker. POIs are .rr-poi[data-poi data-tx data-ty data-min data-name] DOM nodes. create() positions each pin on its viewBox coord via the SVG CTM, tests it inside/outside the active ribbon (point-in-polygon), lights the inside set + counts it, and on scroll-in strokes the ribbon outline, floods the fill, and staggers the inside places. opts: { reach, reveal }."
  module: iife
  returns: "{ root, setReach(min), highlight(id,on), relayout(), destroy }"
meaning:
  what: "The location beat reframed as COVERAGE rather than distance: instead of lines, a counter, or a zoom, one soft organic walking-reach isochrone is drawn on the illustrated map and you simply see how much life falls inside it. The ribbon outline strokes in, a warm fill floods the shape, and every daily place inside lights warm and named while the one or two just outside stay faint with a plus-minutes note. A live count says how many places sit in the warm zone, and a five-or-ten-minute toggle grows the ribbon so more places light as the reach widens. The inside/outside split is geometrically honest (a point-in-polygon test against the drawn shape), the places are placed so distance rises with their minutes, and the ribbon is a lobed authored isochrone, not a perfect oval. The distinct device of the illustrated-map family (district-radiates draws lines, minutes-bloom counts, zoom-to-the-door changes scale; this one is about area). Geometry from the same real-OSM bake as the smarts map, drawn light."
  when: "The location / proximity beat of a premium real-estate site where the pitch is how much daily life is reachable on foot, and you want a single felt image of coverage rather than a browsable map or a list. Use it when the warm-zone-versus-outside contrast is the argument ('almost everything that matters is inside ten minutes'), and when a reach toggle (five vs ten) adds a small interactive proof. Pairs with the other illustrated devices (district-radiates for the radiating overview, minutes-bloom for the per-place time, zoom-to-the-door for scale)."
  lands: "You reach the location and a soft warm shape blooms on a cream map, a hand-drawn ten-minute reach around your future door. Inside it, a park, a cafe, a school, a market, a pharmacy light up and name themselves; just outside, a couple of farther errands sit faint with a plus on their minutes. A big figure says five places inside the warm zone. Tap five minutes and the shape draws in, leaving only the closest two lit. The argument lands without a word: this much of your day is a short walk, inside the warm circle."
  not_when: "When the buyer needs a surveyed, pannable map with routes (use locmap-engine). When you want to show each place's exact walk one at a time (use minutes-bloom) or the radiating overview (district-radiates) or the scale story (zoom-to-the-door). When there is no real isochrone / reach data (the shape is a truth claim and must be authored from streets). A dark theme (recolour the tokens). When there are too many POIs to read inside/outside cleanly (keep ~6-8)."
source:
  grammar: "The editorial illustrated-map family (district-radiates, minutes-bloom, zoom-to-the-door, river-tinted-poi-map). reach-ribbon is the COVERAGE device: one lobed isochrone ribbon with an honest point-in-polygon inside/outside split, a live count, a 5/10 toggle, the inside places warm + the outside faint. Built in the light illustrated language after dark-OSM maps were rejected."
  recording: "apps/quadro/.award-re/teardowns/IDEAS_daynight_map_sections.md (the ten-minute / reach idea, reborn as the illustrated coverage dialect). Siblings: library/components/district-radiates, minutes-bloom, zoom-to-the-door."
  registry_ref: ["reach-ribbon", "walking-reach-isochrone", "coverage-inside-outside"]
stack: "vanilla SVG DOM + GSAP 3.12.5 + ScrollTrigger. Pins via svg.getScreenCTM(); inside/outside via point-in-polygon. No LocMap, no tiles, no Mapbox, no canvas, no three."
webgl: false
motion_props: [stroke-dashoffset, opacity, transform]
trigger: "scroll-into-view reveal (once): ribbon outline draws, fill floods, inside places stagger; the 5/10 toggle re-applies the reach; hover/focus sync row<->pin"
timing_layer: [B-reveal, I-interaction, D-content]
owns_pin: false
owns_scroll: false
page_beat: [location, proximity, coverage]
combines_with: [district-radiates, minutes-bloom, zoom-to-the-door, river-tinted-poi-map]
anti_combos: [embedded-map-widget, locmap-engine, mix-blend-over-scroll]
gated_by: [R_no_webgl, R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, RECIPE.md, tokens.json]
acceptance:
  - "create() draws the active [data-ribbon] isochrone (outline strokes in, warm fill floods) and tests each POI inside/outside it by point-in-polygon against the live path; the lit set + the legend rows + the count all match the drawn shape; a 5/10 toggle grows the ribbon and re-lights / re-counts"
  - "POIs are placed so distance-from-home RISES with their minutes (no place contradicts its time), and the ribbon is a LOBED irregular isochrone (radial variation ~0.09, not a perfect oval) that follows the streets; the home sits near the centroid of the lit set"
  - "pins are DOM nodes positioned via svg.getScreenCTM() (0px align at every viewport); preserveAspectRatio is 'slice' (fill) on desktop and swaps to 'meet' (letterbox, nothing cropped) at <=940px so the south lobe + the farthest pins (gym/post) never clip off the narrower stage -- both modes keep the home + dots round; edge POIs anchor their label inward so it never clips the stage"
  - "the '+N хв' (outside) vs 'N хв' (inside) convention is driven from the LIVE inside/outside state on BOTH the map label and the legend row; the count has aria-live; the 5/10 toggle is a role=group with aria-pressed; the legend is role=list / role=listitem with aria-labels"
  - "under 940px the MAP comes first (in-fold) so the coverage shape is visible without a second scroll; reduced-motion -> the calm reached state (ribbon shown, places lit, count correct, no pulse/flood), toggle still usable"
  - "stroke-dashoffset + opacity + transform only; NO WebGL, NO canvas, NO tiles, NO Mapbox, NO mix-blend, NO backdrop-filter; all small text incl. outside labels + active toggle >= WCAG AA on cream; destroy() removes the toggle + hover listeners (no leak)"
  - "zero em-dash in visible copy; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll in: a lobed warm reach-ribbon draws + floods around ВАШ ДІМ; the 5 places inside (Парк/Кав'ярня/Школа/Супермаркет/Аптека) light warm + named, the 2 outside (Нова Пошта +13 хв, Спортзал +15 хв) stay faint; the count reads 5. Toggle '5 хвилин' -> the ribbon draws in, only Парк+Кав'ярня stay lit, count 2, the others switch to '+N хв'. Verify: the inside set matches the drawn shape (point-in-polygon), distance-from-home rises with minutes, the ribbon is lobed (not an oval), pins align 0px at 1440/1280/1024/390, ALL 7 pins + the full coverage ribbon stay framed at every width (desktop 'slice' fills; <=940px swaps to 'meet' so the south lobe + gym/post never crop off the stage), edge labels stay on-stage, outside labels + active toggle pass AA, mobile shows the map in-fold, reduced-motion shows the reached state, destroy clean. Smoothness over the reveal + a 10->5->10 toggle @4x CPU: fps>=50, jank<8%. Verified: inside sets 5 / 2, '+' convention live, monotonic placement, radial variation 0.09, 0px pins, meet-on-mobile keeps all 7 pins + ribbon lobes on-stage at 900px AND 390px (gym dot was 52px below the slice stage, now framed), edge labels on-stage, AA contrast (5.98 / 6.58), mobile in-fold, reduced-motion clean, 0.54% jank @ 59fps (meet) / 0.80% @ 59fps (slice), 0 console errors, 0 em-dash."
note: |
  The coverage device of the illustrated-map family: one lobed walking-reach isochrone, the inside
  set lit warm + the outside faint, a live count + a 5/10 toggle. FOUR-plus skeptic lessons baked in:
  (1) the ribbon must be a LOBED authored isochrone that follows streets + pinches at the river, NOT a
  perfect oval (a circle reads as a sticker / лендинг-2020); (2) POIs must be placed so distance-from-
  home rises MONOTONICALLY with their minutes, else the map contradicts the times; (3) the inside/outside
  split is an honest point-in-polygon test against the live ribbon path, and the '+N хв' convention is
  driven from that live state on both label + legend (not hardcoded, which broke on toggle); (4) on mobile
  the MAP must come first (in-fold) so the coverage shape -- the whole signature -- is visible without a
  second scroll; plus the a11y pass (outside labels + active toggle to AA, toggle role=group + aria-pressed
  + aria-live count, legend role=list + aria-labels, edge labels anchored inward, a 32px hit box). Pins via
  getScreenCTM (0px); preserveAspectRatio is 'slice' (fill) on desktop and swaps to 'meet' (letterbox) at
  <=940px so the south lobe + the farthest pins (gym/post) never crop off the narrower stage, both modes
  keep circles round (CTM is isotropic). reduced-motion -> reached state, destroy clean. Verified: inside 5/2,
  lobed shape (radial var 0.09), monotonic placement, AA contrast, mobile in-fold, all 7 pins + ribbon lobes
  framed at 900px AND 390px under meet (gym was 52px off the slice stage), 0.54% jank @ 59fps, zero console
  errors, zero em-dash.
---

# reach-ribbon — coverage, not distance: what fits inside ten minutes

The location beat as coverage. One soft organic walking-reach isochrone is drawn on an illustrated
cream map: its outline strokes in, a warm fill floods it, every daily place inside lights warm and
named while the one or two just outside stay faint with a +N хв note. A live count says how much fits
inside, and a 5/10-minute toggle grows the ribbon. NO WebGL. The coverage device of the illustrated
map family (district-radiates draws lines, minutes-bloom counts, zoom-to-the-door scales).

## Markup + call
```html
<section class="rr"><div class="rr-grid">
  <div class="rr-col">
    <p class="rr-kicker">/ Поряд пішки</p>
    <h2 class="rr-h">Скільки життя вміщається <em>у кілька хвилин.</em></h2>
    <div class="rr-countline"><span class="rr-count" data-rr-count aria-live="polite">0</span><span class="rr-countcap">…</span></div>
    <div class="rr-toggle" data-rr-toggle role="group"><button data-min="5" aria-pressed="false">5 хвилин</button><button data-min="10" aria-pressed="true">10 хвилин</button></div>
    <div class="rr-legend" role="list"><div class="rr-row" data-rr-row="park" role="listitem" tabindex="0" aria-label="Парк біля річки, 4 хвилини пішки"><span class="mk"></span><span class="nm">Парк біля річки</span><span class="tm">4 хв</span></div>…</div>
  </div>
  <div class="rr-stage"><svg class="rr-map" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice">
    <path data-ribbon="5" class="rr-ribbon" d="…lobed…"/> <path data-ribbon="10" class="rr-ribbon" d="…lobed…"/>
    <g data-home-anchor data-cx="500" data-cy="400">…</g>
  </svg>
  <div class="rr-poi" data-poi="park" data-tx="560" data-ty="470" data-min="4" data-name="Парк"><span class="dot"></span><span class="lbl">Парк <span class="x">4 хв</span></span></div>
  </div>
</div></section>
```
```js
ReachRibbon.create('.rr', { reach: 10 });
```

## Proven (the lab)
A hand-authored district (river, 2 parks, 4 roads, home, 7 places). 10-min ribbon encloses
park/cafe/school/shop/apteka (count 5); 5-min draws in to park+cafe (count 2); post/gym stay outside
with '+13 хв' / '+15 хв'. Distance-from-home rises with minutes; the ribbon is lobed (radial variation
0.09, not an oval). Pins align 0px; edge labels anchored on-stage; outside labels 5.98:1, active toggle
6.58:1 (AA). Mobile: map in-fold. Reduced-motion: reached state, toggle usable. Smoothness over reveal +
toggle @4x CPU: 0.9% jank, 59fps. destroy()+recreate: 7 pois. Zero console errors, zero em-dash.
