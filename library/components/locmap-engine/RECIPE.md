---
id: locmap-engine
name: "Location-map canon (real baked-OSM SVG district: dual casing+stroke roads, deterministic lit windows, the property parcel + walking ring, numbered POIs synced two-way with a side list, a Dijkstra route that draws along the real streets with a walking dot and a live minute counter, a 9-gate reveal, asymmetric parallax, and a dual places|infrastructure mode with a cluster badge)"
level: 3
kind: component
status: official
since: base-86
tags: [map, location, osm, svg, dijkstra, parallax, dual-mode, real-estate, no-webgl, etalon]
entry:
  call: "LocMap.create(target, opts)  // target = the section element (it must contain a [data-lm-stage] for the svg and optionally a [data-lm-list] for the synced side list). Bakes the SVG of opts.data (real OSM: green/buildings/roads/names/pois + optional infra) into the stage, wires POI<->row sync, the Dijkstra route, the reveal + parallax, and the loc|infra mode. opts: { data, site, mScale, walkMin, modes, flicker, reveal, parallax, route, ease, onSelect }."
  module: iife
  returns: "{ root, svg, select(id), clearSel(), setMode('loc'|'infra'), setCat(cat), reveal(), destroy }. select(id) draws the route + grows the live timer; setMode/setCat drive the dual-mode overlay."
meaning:
  what: "The award-grade location map, reduced to one engine: a hand-built SVG of REAL baked OpenStreetMap geography (roads as a dual casing+stroke hierarchy, building footprints with ~1/9 deterministically lit warm windows, green/water), the property anchored as a hatched parcel with dual pulse rings and a walking-radius ring at true metres-per-unit scale, numbered POIs that sync two-way with a side list, and a Dijkstra route that DRAWS along the actual street graph while a walking dot rides it and a LIVE minute counter grows to the destination. It births on scroll with a 9-gate staggered reveal and rides an asymmetric layer parallax, and it carries a dual MODE switch (named places vs infrastructure categories with a centroid cluster badge). It is the UNION of the two shipped maps: Smarts' motion + Quadro's information architecture."
  when: "The location section of any real-estate project where the pitch is proximity, time-to-everything, and a real address that should read as authentic geography, not a sketch. Use the loc mode for named landmarks with walk/drive times and animated routes; add the infra mode when buyers also care about category density (how many cafes, schools, banks within reach). Feed it baked OSM (Overpass -> projector -> generated data); never hand-draw. The etalon for a flagship project map."
  lands: "A dark, real district map fills the frame: streets in a believable hierarchy, building blocks with a scatter of warm-lit windows like a town at dusk, the property marked with a hatched parcel and a soft pulse inside a ten-minute walking ring. Numbered points sit on real places; click one and a route draws itself along the actual streets, a dot walks it, and a little badge counts the minutes up to the destination. A tap on the second mode swaps the named places for clouds of category pins with a single number telling you how many are near. It reads as a bespoke, surveyed map, the kind that costs money to make, not an embedded Google widget."
  not_when: "A brand-led boutique project that wants an illustrated or isometric map rather than surveyed geography (use a hand-drawn map dialect: line-art-location-map, river-tinted-poi-map, watercolor-svg-map). A single sales-office pin beside a contact panel (use themed-contact-map). A pre-launch project with no real address yet (use a minimal dot-grid abstract map). When you cannot bake OSM data (the authenticity is the whole point). When the page forbids any scroll-reveal/parallax."
source:
  grammar: "Smarts ran the etalon (apps/smarts/src/js/sections/location.js): SVG of real OSM (136 roads, 823 buildings) with a dual casing+stroke road hierarchy sorted by rank, lit windows via (i*2654435761>>>0)%9===0 (~11%), a hatched parcel + dim line + dual pulse rings, a walking ring at 833m/2.6-per-unit, POI collision-avoidance (O(n^2) hypot nudge), 44px coarse hit-circles, two-way pin<->row hover, a Dijkstra route that draws via stroke-dashoffset while a walker rides getPointAtLength and a live counter grows, a 9-gate ScrollTrigger reveal, and asymmetric parallax (green -1.2/1.2, buildings -2/2, pins -3/3). Quadro added the information architecture (apps/quadro/components/sections/DistrictMap.tsx): a dual loc|infra mode and category pins with a centroid cluster badge + count. The canon is Quadro's IA wearing Smarts' motion."
  recording: "apps/quadro/.award-re/teardowns/DISCOVERY_daynight_maps.md (Part B — the map canon + the 15-variation catalog). Seeds: apps/smarts/src/js/sections/location.js, apps/smarts/src/js/data/locmap.js, apps/smarts/src/styles/sections.css; apps/quadro/components/sections/DistrictMap.tsx, apps/quadro/lib/districtMap.generated.ts."
  registry_ref: ["locmap-canon", "SMARTS-location-etalon", "QUADRO-districtmap-dualmode"]
stack: "vanilla SVG DOM + GSAP 3.12.5 + ScrollTrigger (+ CustomEase for the 'award' ease if present). No tiles, no Mapbox/Leaflet/Deck, no canvas, no three."
webgl: false
motion_props: [opacity, transform, stroke-dashoffset]
trigger: "scroll-reveal (a once ScrollTrigger 9-gate timeline) + scrubbed parallax; interactions (click/hover) drive the route + mode"
timing_layer: [B-entrance, S-scrub, I-interaction]
owns_pin: false
owns_scroll: false
page_beat: [location, district, neighbourhood]
combines_with: [daynight-engine, theme-tween, mask-up-title]
anti_combos: [mix-blend-over-scroll, second-cover]
gated_by: [R_no_webgl, R_perf_limits]
variants: []
params_ref: tokens.json
files: [component.js, component.css, lab.html, RECIPE.md, tokens.json]
acceptance:
  - "create(target,{data}) bakes the SVG into [data-lm-stage]: green + building footprints (~1/flicker.rate lit) + dual casing+stroke roads sorted by rank + names + the parcel + walking ring; destroy() removes the svg"
  - "POIs render as numbered groups with 44px hit-circles on coarse pointers; they sync two-way with [data-lm-list] rows by data-id (hover + click highlight both)"
  - "select(id) draws the Dijkstra route along data.pois[].route via stroke-dashoffset, a walker rides getPointAtLength, and the live badge reads the HONEST destination 'N хв · M м' from the first frame (no fake count-through intermediates, so a scrubbed pin can never park it on a minute no POI has); clicking the active POI or the map background clears it"
  - "reveal() runs a 9-gate ScrollTrigger timeline (green -> buildings -> small roads -> big-roads draw -> big casing -> names -> ring -> site -> pins+rows) and asymmetric parallax (green/buildings/pins at different yPercent)"
  - "setMode('infra') swaps to category pins with a centroid cluster badge + count; setMode('loc') restores named POIs; setCat(cat) switches the category"
  - "SVG attributes + opacity + transform + stroke-dashoffset only; NO WebGL, NO canvas, NO tiles, NO mix-blend, NO backdrop-filter"
  - "prefers-reduced-motion -> final static state (no draw, no parallax, route shown static with its label); window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll in -> the district births gate by gate (green, then blocks, then roads draw in, ring, parcel pulses, numbered pins pop). 823 buildings, ~11% lit, 136 roads, 6 POIs + 6 synced rows, the parcel + ring present, .lm is-born. Click a POI/row -> a route draws along the real streets, the walker rides it, the live badge reads the honest 'N хв · M м' from the first frame (no fake count-through); clicking it again clears. Switch to Інфраструктура -> category pins + a cluster count badge; switch categories. NOTE: the reveal is a once-ScrollTrigger so scroll past the spacer first; the route/parallax are GPU props -> verify smoothness with a direct rAF probe over a reveal+route run, PASS fps>=50, jank<8%. Verified: 823 bld / 91 lit / 136 roads / 6 POI+rows / route+walker+live '15 хв · 1200 м' / infra cluster '38' / 0 console errors."
note: |
  THE MAP CANON — the etalon location map, the union of the two we shipped: SMARTS gives the
  motion (dual casing+stroke road hierarchy, (i*2654435761>>>0)%9 lit-window flicker, Dijkstra
  draw + getPointAtLength walker + growing live timer, 9-gate reveal, asymmetric parallax,
  44px touch zones, POI collision nudge, walking ring at real m/unit), QUADRO gives the IA
  (dual loc|infra mode + category pins + centroid cluster badge). Canon = Quadro's IA wearing
  Smarts' motion. Level 3 (rich reveal + interaction, but owns_pin false). DATA is baked OSM
  (Overpass -> projector -> generated; coords in viewBox units, scale-invariant) — never hand-draw
  (the F-24 authenticity lesson). The lab loads the REAL smarts OSM (136 roads, 823 buildings, 6
  POIs with Dijkstra routes) + a synthesized infra layer so it demos genuine geography. LAWS:
  SVG only, GPU props, no tiles/Mapbox/canvas/WebGL, reduced-motion -> static. Variations to
  build on it: M3 route-walker, M4 radial rings, M5 category-filter, M6 day/night map (ties to
  daynight-engine), M7 static-aerial + SVG pins, M12 dot-grid. Full 15-cell catalog in
  DISCOVERY_daynight_maps.md. Verified clean: full reveal, route+walker+live timer, dual mode,
  0 console errors.
---

# locmap-engine — the location-map canon

The award-grade location map as one reusable engine. See the frontmatter for the full contract.
Pairs naturally with `daynight-engine` (a day/night version of the map is variation M6) and
`theme-tween` (the map recolours with the page theme).
