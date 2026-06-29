---
id: minutes-bloom
name: "Minutes bloom (time is the hero, the map is a quiet backdrop: a pinned section steps through the daily places one at a time as you scroll; for each, a HUGE editorial minute number counts up 0 to N while a single thin terracotta arc draws from the home marker to that place on a faded illustrated map, with a step rail; mobile + reduced-motion fall back to a calm map + a full readable list of every place and its minutes)"
level: 3
kind: section
status: official
since: base-92
tags: [map, location, proximity, time, pinned, scroll-scrub, illustrated, editorial, real-estate, no-webgl]
entry:
  call: "MinutesBloom.create(target, opts)  // target = .mb (a .mb-wrap holding a .mb-grid of .mb-hero [the big [data-mb-num] + [data-mb-unit] + [data-mb-name] + [data-mb-mode] + [data-mb-lead] + a [data-mb-rail] + a [data-mb-static] list] and a .mb-stage with svg.mb-map). The SVG holds the river/parks/roads, a [data-home-anchor data-cx data-cy] marker, an empty [data-mb-arc] group, and [data-poi data-tx data-ty data-min data-name data-mode] dot groups. create() builds the scrub: on desktop it pins the section and scrubs through the places (number counts up + the arc draws); POI labels are DOM nodes placed via the SVG CTM; under 940px or reduced-motion it renders a static full list. opts: { scrub, end }."
  module: iife
  returns: "{ root, set(i), count(), relayout(), destroy }"
meaning:
  what: "The location beat with TIME as the hero instead of the map. A pinned section steps through the daily places one at a time as you scroll: for each, a huge editorial minute number counts up from zero to its value (nine, ten, six) while a single thin terracotta arc draws from the home marker to that place on a quiet, faded hand-illustrated map (river, parks, a few roads), and a step rail tracks progress. The map never shouts; the felt distance is the number you watch climb. It is the opposite emphasis to district-radiates (there the whole neighbourhood radiates on hover; here one scrubbed counter owns the screen). On mobile and for reduced-motion it falls back to a calm map backdrop plus a full readable list of every place and its minutes, so the content never depends on the scroll choreography. Geometry comes from the same real-OSM bake as the smarts map; drawn light and simplified."
  when: "The location / proximity beat of a premium real-estate site where you want ONE emphatic, cinematic statement of time-to-everything rather than a browsable map. Use it when the pitch is 'how few minutes your life actually is' and you want a pinned, scroll-scrubbed moment that makes each number land on its own beat. Pairs with a calmer overview map elsewhere (district-radiates / a full locmap). Reach for it when the brand wants editorial drama and big-type confidence over cartographic density."
  lands: "You scroll into the section and it holds: a giant serif number ticks up from zero while, on a soft cream map beside it, a fine terracotta line reaches out from your future door to a school, and the words say nine minutes, on foot. Scroll on and the number resets and climbs again to the market, the pharmacy, the park, each line drawing to its place. By the end you have felt, one beat at a time, that everything is a handful of minutes away. On a phone it settles into a quiet map and a clean list of every place and its time."
  not_when: "When the user needs a browsable, surveyed map with routes (use locmap-engine). When you want the whole neighbourhood shown at once rather than one-at-a-time (use district-radiates). When the page cannot afford a pinned scroll section, or a long pinned beat would crowd the page rhythm. When there are far more than ~6 places (the one-beat-per-place cadence wants curation). A dark theme (recolour the tokens)."
source:
  grammar: "The editorial illustrated-map family (river-tinted-poi-map, line-art-location-map, district-radiates). minutes-bloom inverts the emphasis: the map fades to a backdrop and a scroll-scrubbed minute counter + a single drawing arc carry the section, one place per pinned step. Built after dense-OSM map sections were rejected as cheap; same real-data approach, an editorial time-first drawing."
  recording: "apps/quadro/.award-re/teardowns/IDEAS_daynight_map_sections.md (map-section wave; the time-as-hero device). Sibling: library/components/district-radiates."
  registry_ref: ["minutes-bloom", "time-as-hero-map", "scroll-scrubbed-minute-counter"]
stack: "vanilla SVG DOM + GSAP 3.12.5 + ScrollTrigger + ScrollToPlugin + gsap.matchMedia. POI labels positioned via svg.getScreenCTM(). No LocMap, no tiles, no Mapbox, no canvas, no three."
webgl: false
motion_props: [stroke-dashoffset, transform, opacity]
trigger: "pinned scroll-scrub (a ScrollTrigger pin at top top, scrubbed through N steps); rail click jumps via ScrollToPlugin; matchMedia gives mobile/reduced-motion a static state"
timing_layer: [S-scrub, B-pin, D-content]
owns_pin: true
owns_scroll: false
page_beat: [location, proximity, time]
combines_with: [district-radiates, river-tinted-poi-map, numeral-frame-expand-hero]
anti_combos: [second-cover, locmap-engine, mix-blend-over-scroll]
gated_by: [R_no_webgl, R_perf_limits, R_pin_budget]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, RECIPE.md, tokens.json]
acceptance:
  - "on desktop (>=940px) the section pins at top top and scrubs through N places: per step the minute number counts up 0->min in lockstep with a terracotta arc drawing home->place (strokeDashoffset), settling via local/0.8; a step rail marks the active step"
  - "POI labels are DOM nodes positioned via svg.getScreenCTM() so they render OUTSIDE the slice-clipped SVG box and are NEVER cropped; POI coords sit in a safe central band so the arc endpoint stays on the map; the arc endpoint + its dot align to <1px"
  - "preserveAspectRatio='slice' keeps the home rings + parks ROUND; the arc endpoint dot fades in only as the arc completes"
  - "rail dots are buttons (>=24px hit area, keyboard + aria-label); clicking one jumps (ScrollToPlugin) to the step's SETTLED point so the number matches the clicked label"
  - "under 940px OR reduced-motion: gsap.matchMedia renders a STATIC state (no pin/scrub) with a calm map backdrop + a FULL list of every place and its minutes, and the lead copy is swapped off the scroll instruction (no content withheld)"
  - "stroke-dashoffset + transform + opacity only; NO WebGL, NO canvas, NO tiles, NO Mapbox, NO mix-blend, NO backdrop-filter; destroy() kills the trigger + matchMedia, removes the rail + labels + listeners (no leak on recreate)"
  - "all small text >= WCAG AA on cream, including IDLE (non-active) POI labels which carry the other places' names: they hold >= AA at opacity 0.78 via a darker muted ink (--mb-label-idle #453f37, ~4.96 on the cream label chip) while staying quieter than the active terracotta label; zero em-dash in visible copy; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll: the section pins and a giant serif number counts 0->9 while a terracotta arc draws from ВАШ ДІМ to Школа; scroll on and it steps the market, pharmacy, park, cafe, city centre (12 / авто), each number climbing with its arc; the active map label + the active POI lift. Click a rail dot -> it jumps to that step with the number matching. Verify: every active label + the arc endpoint stay ON-SCREEN at 1440 across ALL steps incl. the last (Центр), home rings ROUND, smoothness over a full pinned scrub @4x CPU (fps>=50, jank<8%). Shrink to <=390px OR enable reduced-motion -> a static calm map + a full list of all 6 places + minutes, lead not 'Прокрутіть'. destroy()+recreate -> exactly 6 rail dots + 6 labels (no leak). Verified: all labels/arc on-screen incl. final step, idle (non-active) labels stay >= AA legible (not faded to 0.5), rail lands on the matching number, 0% jank @60fps, mobile + reduced-motion full list, destroy clean, 0 console errors."
note: |
  The time-as-hero map: the location beat where the MAP fades to a backdrop and a scroll-scrubbed
  minute counter + a single drawing arc carry it, one place per pinned step. The editorial-illustrated
  sibling to district-radiates (opposite emphasis: radiate-all-on-hover vs count-one-at-a-time).
  SIX skeptic lessons baked in: (1) POI labels are DOM placed via getScreenCTM so they render OUTSIDE
  the slice box and are never clipped (baked-in <text> got cropped off-screen on the last step); (2)
  POI coords kept in a safe central band so the arc endpoint always stays on the map; (3) gsap.matchMedia
  gives a real mobile composition (the pinned 2-col stack was incoherent under 940px) AND reduced-motion
  a full readable list (was hiding 5 of 6 places' minutes); (4) the rail jump targets the step's settled
  point so the number matches the label you clicked (was landing mid-count); (5) destroy() clears the
  rail dots + labels + listeners (was leaking on recreate); (6) rail hit area >=24px; (7) idle POI
  labels carry the other places' names, so they hold >= WCAG AA (darker muted ink at opacity 0.78,
  ~4.96 on cream) instead of fading the soft ink below AA at 0.5, while staying quieter than the
  active terracotta label. Verified: all
  labels + arc on-screen incl. the final step, round circles, 0% jank @ 60fps, mobile + reduced-motion
  full content, destroy clean, zero console errors, zero em-dash.
---

# minutes-bloom — time is the hero: a giant minute counts up while an arc draws to each place

The location beat with TIME as the hero. A pinned section steps through the daily places one at a
time as you scroll: a huge editorial minute number counts up 0 -> N while a single terracotta arc
draws from the home to that place on a quiet illustrated map, with a step rail. Mobile + reduced-motion
fall back to a calm map + a full list of every place and its minutes. NO WebGL. The editorial
illustrated sibling to district-radiates (opposite emphasis).

## Markup + call
```html
<section class="mb"><div class="mb-wrap"><div class="mb-grid">
  <div class="mb-hero">
    <p class="mb-kicker">/ Скільки хвилин до життя</p>
    <div class="mb-read"><span class="mb-num" data-mb-num>0</span><span class="mb-unit" data-mb-unit>хв</span></div>
    <p class="mb-name" data-mb-name>Школа і садок</p><p class="mb-mode" data-mb-mode>пішки</p>
    <p class="mb-lead" data-mb-lead>Прокрутіть. …</p>
    <div class="mb-rail" data-mb-rail></div>
    <ul class="mb-static-list" data-mb-static></ul>
  </div>
  <div class="mb-stage"><svg class="mb-map" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid slice">
    <path class="mb-river" d="…"/> … <g data-mb-arc></g>
    <g class="mb-poi" data-poi="school" data-tx="430" data-ty="600" data-min="9" data-name="Школа і садок" data-mode="пішки"><circle cx="430" cy="600" r="5.5"/></g>
    <g data-home-anchor data-cx="500" data-cy="420"><g data-home transform="translate(500 420)">…</g></g>
  </svg></div>
</div></div></section>
```
```js
MinutesBloom.create('.mb', { scrub: 0.6 });
```

## Proven (the lab)
A hand-authored district (river, 2 parks, 4 roads, home, 6 places: Парк 6 / Кав'ярня 7 / Школа 9 /
Супермаркет 9 / Аптека 10 / Центр 12 авто). Desktop: pins + scrubs, the number counts up in lockstep
with the arc draw, every active label + arc endpoint stay ON-SCREEN incl. the final Центр step, home
rings round. Rail click lands on the matching number. <940px / reduced-motion: a calm map + a full
list of all 6 places + minutes, lead swapped. Smoothness @4x CPU over a full pinned scrub: 0% jank,
60fps. destroy()+recreate: 6 rail + 6 labels (no leak). Zero console errors, zero em-dash, WCAG AA.
