---
id: district-radiates
name: "District radiates (an editorial, hand-illustrated proximity map on warm cream paper: a soft river curve, sage parks, hair-thin roads, a terracotta home marker, and thin leader-threads that RADIATE from the door to ~6 named daily places with walk-minutes; river + roads draw on scroll, the home blooms, threads stitch out one by one, hover a row or pin to light its thread)"
level: 3
kind: section
status: official
since: base-92
tags: [map, location, proximity, illustrated, line-art, walk-time, editorial, real-estate, no-webgl]
entry:
  call: "DistrictRadiates.create(target, opts)  // target = .dr (a grid of .dr-col editorial column with a [data-dr-row] legend + .dr-stage holding svg.dr-map). The SVG carries [data-river], roads[data-draw], .dr-park shapes, a [data-home-anchor data-cx data-cy] marker, and an empty [data-threads] group. POIs are .dr-poi[data-poi] DOM nodes carrying data-tx/data-ty (viewBox coords) + a .dot and .lbl. create() builds a bowed leader-thread home->each POI, positions each pin on its thread end via the SVG CTM, and on scroll-in draws river+roads, blooms the home, and radiates the threads. opts: { draw, stagger, duration, ease, start, once }."
  module: iife
  returns: "{ root, play(), set(p 0|1), highlight(id,on), relayout(), destroy }"
meaning:
  what: "An editorial, hand-illustrated proximity map: the location section drawn as a concierge's note rather than a surveyed widget. Warm cream paper, a soft slate river, two sage parks, a few hair-thin roads (NOT a dense 823-building OSM view), a single terracotta ringed home marker, and thin leader-threads that radiate from the door to about six named daily places, each tagged with its walk-minutes. On scroll-in the river and roads draw themselves, the home blooms, and the threads stitch out one by one as the minute labels rise; a left editorial column (kicker + a Fraunces serif headline with a terracotta italic line + a lead + a readable legend) carries the words. Hover a legend row or a pin and its thread lights while the rest calm. In production the geometry comes from the SAME real-OSM bake as the smarts map (Overpass -> projector -> viewBox px), just rendered SIMPLIFIED and light: real streets, real walk-minutes, drawn premium."
  when: "The location / proximity beat of a premium, brand-led real-estate site where a dense surveyed map (locmap-engine) would read as a generic widget and you want the neighbourhood to feel hand-drawn and intimate. Use it when the pitch is 'everything your day needs is a few minutes from your door' and the brand wants warmth + air over cartographic density. The illustrated dialect (with river-tinted-poi-map and line-art-location-map) for when the map should feel composed and editorial, not satellite-accurate."
  lands: "You reach the location and a calm cream map composes itself: a river curves through, two soft parks settle, thin roads draw in, and a terracotta marker blooms at your future door. Then fine threads reach out one by one to a school, a market, a pharmacy, a park, each landing on a small pin with its minutes. The left column reads like a printed note: 'everything your day needs, drawn from your door,' and a legend of places and times. Hover a place and its thread warms while the others fade. It reads as a bespoke, drawn map a studio made for this home, not an embedded widget."
  not_when: "When the buyer needs a real, surveyed, pannable district with every street and a route engine (use locmap-engine). A dark-themed site (this dialect is light/warm; recolour the tokens or use river-tinted-poi-map for a warm-dark field). When there are too many POIs to place cleanly (keep it ~5-8 named places, the editorial point is curation). When the page forbids any scroll-reveal. When the brand wants satellite realism over illustration."
source:
  grammar: "The illustrated-map family (river-tinted-poi-map: warm field + drawn river + terracotta pins + a project disc; line-art-location-map: thin cream strokes + a target marker + leader-line POIs that ladder up). district-radiates composes a river + parks + roads base with a centered terracotta home and leader-threads that RADIATE to named places, the minutes as editorial figures. Built after two dense-OSM map sections were rejected as 'лендинг 2020 / дешева естетика' — the owner asked for the same real-data APPROACH (real OSM bake) with a different, illustrated DRAWING."
  recording: "apps/quadro/.award-re/teardowns/IDEAS_daynight_map_sections.md (Part B map-section wave; rebuilt as the illustrated dialect per owner direction). Reference dialects: library/components/river-tinted-poi-map, line-art-location-map."
  registry_ref: ["district-radiates", "illustrated-proximity-map", "leader-thread-radiate"]
stack: "vanilla SVG DOM + GSAP 3.12.5 + ScrollTrigger. Pins positioned via svg.getScreenCTM(). No LocMap, no tiles, no Mapbox/Leaflet, no canvas, no three."
webgl: false
motion_props: [stroke-dashoffset, transform, opacity]
trigger: "scroll-into-view reveal (once); interactions are hover/focus (row <-> pin <-> thread sync)"
timing_layer: [B-reveal, D-content, I-interaction]
owns_pin: false
owns_scroll: false
page_beat: [location, proximity, neighbourhood]
combines_with: [river-tinted-poi-map, line-art-location-map, numeral-frame-expand-hero, collection-tier-announce]
anti_combos: [embedded-map-widget, locmap-engine, mix-blend-over-scroll]
gated_by: [R_no_webgl, R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, RECIPE.md, tokens.json]
acceptance:
  - "create() builds a bowed quadratic leader-thread home->each POI into [data-threads], and positions each .dr-poi on its thread END by mapping data-tx/ty through svg.getScreenCTM() (the .dot anchored on the point); pin and thread-end align to <1px at every viewport, re-laid-out on resize + ScrollTrigger.onRefresh"
  - "relayout() keeps the whole map FRAMED on any stage: it compresses the POI spread toward home (uniform factor) until all 6 pins fit inside the slice-cropped viewBox window, REBUILDING each thread to the same compressed end (alignment contract preserved), and flips/clamps each label so the FULL name + minutes stay on-stage; all 6 dots + full labels on-stage at 1440/1280/1024/940/900/430"
  - "preserveAspectRatio='xMidYMid slice' (uniform scale) so the home rings, pulse and parks stay ROUND (not ellipses); the SVG is a light hand-illustration (river + 2 parks + ~5 roads), NOT a dense building view"
  - "on scroll-in (fired ONCE via a played guard; ScrollTrigger.onEnter only, no redundant rAF): river + roads draw (stroke-dashoffset -> 0), the home blooms (scale + back.out), then threads radiate one-by-one (staggered) with each pin + its OWN legend row (looked up by id, not by index) rising; reduced-motion -> the final drawn state, no draw/stagger/pulse"
  - "hover or focus a legend row OR a pin -> its thread + pin + row light (is-hot, terracotta) and the section calms the other threads (is-focusing -> opacity 0.22); legend rows are role=listitem + aria-label + tabindex with a :focus-visible ring"
  - "stroke-dashoffset + transform + opacity only; NO WebGL, NO canvas, NO tiles, NO Mapbox, NO mix-blend, NO backdrop-filter"
  - "all small text >= WCAG AA on cream (kicker / hot label / minute units use the deeper terracotta + darkened greys); zero em-dash in visible copy; window.__LAB_OK__ on init; destroy() removes the resize + hover listeners and the thread paths (no leak on recreate)"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll in: the river + roads draw on cream paper, the terracotta home blooms at center, then six leader-threads radiate one by one to named places (Школа, Супермаркет, Аптека, Нова Пошта, Парк, Кав'ярня) with minutes, each thread paired with its OWN legend row; the reveal plays exactly once; the left column reads editorial. Hover a legend row -> its thread + pin light, the rest fade. Verify: pin dots sit EXACTLY on their thread ends at 1440/1280/1024/760 (CTM positioning, <1px), ALL 6 dots + FULL labels (incl. 'Нова Пошта 10 хв') stay on-stage at 1440/1280/1024/940/900/430 (spread-compress + label flip/clamp), home rings are ROUND (slice, w/h 1.0 not an ellipse), reduced-motion shows the drawn state with no errors, destroy+recreate leaves exactly 6 threads. Smoothness @4x CPU over a full play() + rapid hover toggling: PASS fps>=50, jank<8%. Verified: 0.02px max pin-align at 1440/1280/1024/760/430, all 6 pins+full labels framed at every width, each thread paired with its own row, reveal fires once, ringW/H 1.0, 0% jank @ 60fps @4x, 0 console errors, reduced-motion clean, listeners cleaned on destroy."
note: |
  The illustrated proximity map, built after two dense-OSM map sections were rejected as cheap /
  'лендинг 2020'. Same real-data APPROACH as the smarts location map (real OSM bake ->
  viewBox px) but a SIMPLIFIED, light, hand-drawn DRAWING: a river + 2 parks + a few roads + a
  terracotta home + leader-threads to ~6 named places. THREE lessons from an adversarial skeptic pass
  baked in: (1) position pins by mapping their viewBox coord through svg.getScreenCTM() and anchor the
  DOT on the point, so pin and thread-end share ONE source of truth (0px align at every viewport) —
  do NOT rely on left/top% over the box; (2) use preserveAspectRatio='slice' (uniform) so circles stay
  ROUND — 'none' squashed the home marker + parks into ellipses; (3) bow each thread perpendicular to
  its own radius with consistent handedness (NOT i%2 alternating) for a graceful even splay, and place
  POIs in a balanced radial spread with the home tag clear of the convergence. FOUR more fixes from a
  responsive + reveal skeptic pass: (4) relayout() compresses the spread toward home until all 6 POIs
  fit the slice-cropped viewBox window and rebuilds the threads to that compressed end, so edge POIs
  (post on the right, park/shop on the left) stay framed on the narrow 2-col stage AND the short 1-col
  stage instead of being cut; (5) each label is flipped/clamped to its on-stage side so the full name +
  minutes never exit an edge; (6) the reveal pairs each thread with its OWN legend row looked up by id
  (the DOM legend order is not the POI order, so the old rows[i] index pairing mismatched 5 of 6); (7)
  a played guard + dropping the redundant rAF make the reveal fire exactly once. Light cream/sage/slate/
  terracotta palette; all small text darkened to WCAG AA; legend is keyboard + SR accessible; listeners
  cleaned on destroy. Verified: 0.02px max pin alignment at 1440/1280/1024/760/430, all 6 pins + full
  labels framed at 1440/1280/1024/940/900/430, round circles, 0% jank @ 60fps @4x, reveal fires once,
  each thread paired with its own row, reduced-motion + a11y clean, zero console errors.
---

# district-radiates — an editorial illustrated proximity map: threads radiate from your door

The location beat drawn as a concierge's note, not a surveyed widget. Warm cream paper, a soft
river, sage parks, thin roads, a terracotta home marker, and leader-threads that radiate to ~6
named daily places with walk-minutes. River + roads draw on scroll, the home blooms, threads stitch
out one by one; hover a row or pin to light its thread. NO WebGL. The illustrated dialect (with
river-tinted-poi-map and line-art-location-map) for a premium, brand-led location section.

## Markup + call
```html
<section class="dr">
  <div class="dr-grid">
    <div class="dr-col">
      <p class="dr-kicker">/ Локація</p>
      <h2 class="dr-h">Усе, що потрібно дню,<br><em>намальовано від ваших дверей.</em></h2>
      <div class="dr-legend" role="list">
        <div class="dr-row" data-dr-row="school" role="listitem" tabindex="0" aria-label="Школа і садок, 9 хвилин пішки">…</div>
      </div>
    </div>
    <div class="dr-stage">
      <svg class="dr-map" viewBox="0 0 1000 760" preserveAspectRatio="xMidYMid slice">
        <path class="dr-park" d="…"/> <path data-river class="dr-river" d="…"/>
        <path data-draw class="dr-road" d="…"/>
        <g data-threads></g>
        <g data-home-anchor data-cx="500" data-cy="380"><g data-home transform="translate(500 380)">…</g></g>
      </svg>
      <div class="dr-poi dr-poi--down" data-poi="school" data-tx="330" data-ty="600"><span class="dot"></span><span class="lbl">Школа і садок <span class="m">9 хв</span></span></div>
    </div>
  </div>
</section>
```
```js
DistrictRadiates.create('.dr', { draw:true, stagger:0.14, duration:0.9, start:'top 72%', once:true });
```

## Proven (the lab)
A hand-authored district (river curve, 2 sage parks, 5 roads, a terracotta home, 6 named places:
Школа/Супермаркет/Аптека/Нова Пошта/Парк/Кав'ярня, minutes 9/9/10/10/6/7). Pin dots sit on their
thread ends to 0.02px max at 1440/1280/1024/760/430 (CTM positioning); home rings round (slice, w/h 1.0).
All 6 pins + full labels (incl. 'Нова Пошта 10 хв') stay framed at 1440/1280/1024/940/900/430 via the
relayout spread-compress + label flip/clamp. Each thread reveals with its OWN legend row (paired by id),
and the reveal fires exactly once (played guard, no redundant rAF). Smoothness @4x CPU over play() +
rapid hover toggling: 0% jank, 60fps. Reduced-motion -> drawn state, no errors. destroy()+recreate ->
exactly 6 threads (listeners cleaned). Zero console errors, zero em-dash in visible copy, WCAG AA small text.
