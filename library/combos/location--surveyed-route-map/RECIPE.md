---
---
id: location--surveyed-route-map
name: "Маршрут по справжніх вулицях"
level: 2
kind: section-variant
section: location
status: base
meaning:
  what: "The realistic etalon of the LOCATION section (the smarts variant). A dark, baked OSM VECTOR district of с. Агрономічне rendered as real geography: road hierarchy by class (hwy / main / mid / minor / faint with dual casing+stroke), 823 building footprints with deterministic warm-lit windows so the town reads as alive at dusk, and the site anchored inside a true-scale 10-minute walking ring. The section pins; as you scroll, it STEPS through the 6 real POIs one at a time, and at each step a Dijkstra route DRAWS along the actual streets (route[] from the dataset) while a walking dot travels it and a LIVE minute counter grows to the real walk-time. theme-tween lerps the chrome toward a dusk tone across the same scroll. One clean pin-story block per step (number, place, real minutes), cross-faded so two are never legible at once."
  when: "The location beat where the buyer's real question is 'can I actually live my life from here'. This is the most authentic-geography answer: not a stylised illustration or a number, but the true street graph, with the walk to the school / pharmacy / Nova Poshta drawn along the streets you would really walk and timed to the real minute. The 'we surveyed it, here is the proof' register."
  lands: "It reads as a real survey at last light: a town of lit windows and named streets, the home pulsing inside its walking ring. As you scroll, the camera does not move; instead the route to each real place draws itself along the actual roads, a dot walks it, and the minute counter ticks up to the honest number (9 хв to the school, 18 хв to Аврора), one place at a time. It reads engineered and trustworthy, not decorative."
source:
  grammar: "locmap-engine (the map CANON: SMARTS motion + QUADRO IA, harvested from apps/smarts/src/js/sections/location.js — dual casing/stroke road hierarchy, (i*2654435761>>>0)%9 lit-window flicker, Dijkstra draw + getPointAtLength walker + growing live timer, 9-gate reveal, asymmetric layer parallax, true-scale walking ring). theme-tween (EVER per-section color engine: linear-RGB lerp of --bg/--ink/--accent toward the centred section). The variant's authored layer = the scroll-stepped POI tour: harness pin -> step index -> map.select() + one cross-faded story block per step."
  recording: null
  registry_ref: ["T-locmap-smarts\