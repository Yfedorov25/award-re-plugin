---
id: apartment-day-grid
name: "Apartment day-grid (every room of the apartment shown at once in a grid, and one scroll drives the WHOLE grid through a single synchronized day from morning to night, so the lighting changes everywhere consistently at the same hour, never one room ahead of another)"
level: 3
kind: section
status: official
since: base-87
tags: [daynight, interior, grid, scroll, pin, synchronized, real-estate, no-webgl, section]
entry:
  call: "ApartmentDayGrid.create(target, opts)  // target = the section (must contain [data-grid]). Builds one daynight-engine instance per room cell and drives a SINGLE scroll t into EVERY cell's set(t) so the whole apartment lives one synchronized day. opts: { rooms:[{day,night,name}], scrub:{trigger,start,end,pin}, hours:[7,23], stagger, onProgress }. REQUIRES daynight-engine (+ GSAP+ScrollTrigger) loaded first."
  module: iife
  returns: "{ root, cells, set(t), get(), destroy }. set(t) is PURE (0..1) and is broadcast to every cell. onProgress(t, hour) feeds the clock/copy."
meaning:
  what: "MODEL A of the day/night interior question: ALL rooms on screen at once, in a grid, and one scroll (07:00 -> 23:00) drives EVERY room's lighting TOGETHER. At 11:00 every room is at 11:00; at 19:00 every room is at 19:00. Time equals lighting everywhere, simultaneously. The whole apartment lives a single day. It is the fix for the broken one-room-at-a-time reel where the clock ran globally while rooms played sequentially (which produced 'it is 11am but this room looks like midnight'). A thin orchestrator over daynight-engine: one instance per cell, one shared t."
  when: "The interior beat where you want to show the FULL apartment and its mood across a day in one glance, not a room-by-room walk. Best with 4-6 frame-matched day/night room pairs. Use it when the selling idea is 'every room is beautiful, morning to night' and you want the visitor to feel the whole home shift at once. The clock + a single headline carry the narrative."
  lands: "A grid of every room fills the screen, all in cool morning light. As you scroll, a small clock advances and the whole apartment warms together: by midday the rooms are bright, by golden hour they glow amber, by night every room has its lamps on at once. Nothing is out of step; the entire home breathes one day. It reads as a calm, expensive overview, not a slideshow."
  not_when: "A guided walk deeper into the apartment (use the room-walk model). A pick-one-room-then-scrub-its-day flow (use the room-pick model). A single hero room (use daynight-scroll-scrub). When rooms are not frame-matched (they jump). When you only have day renders (no night pair)."
source:
  grammar: "Reinvents the smarts/nahirna/towns interior sections, whose shared flaw is that day/night is a per-room control that resets on room change. Model A removes the room-axis entirely: show every room at once and synchronize a single time-of-day across all of them. Built on daynight-engine (one DayNight per cell, mode:'manual' reveal:'opacity' glow; one t broadcast to all set(t)). An optional tiny stagger makes the change read as a gentle wave room-to-room while staying consistent (a cell never leads/lags by more than the stagger)."
  recording: "apps/quadro/.award-re/teardowns/IDEAS_daynight_map_sections.md (the day/night SECTION models; Model A). Built on daynight-engine. Seeds: apps/smarts/src/js/sections/interiors.js, apps/nahirna/components/sections/04-Floorplan.tsx, apps/towns/src/js/sections/plan.js."
  registry_ref: ["A1a-apartment-day-grid", "daynight-engine"]
stack: "vanilla (drives window.DayNight) + GSAP 3.12.5 + ScrollTrigger (the pinned day)"
webgl: false
motion_props: [opacity, transform, custom-properties]
trigger: "pinned ScrollTrigger scrub; one t = time of day, broadcast to every cell"
timing_layer: [B-entrance, S-scrub]
owns_pin: true
owns_scroll: false
page_beat: [interior, apartment, overview]
combines_with: [daynight-engine, mask-up-title, theme-tween]
anti_combos: [second-cover, mix-blend-over-scroll, nested-pin]
gated_by: [R_no_webgl, R_perf_limits, R_pin_budget]
variants: [room-pick-day-scrub]
params_ref: tokens.json
files: [component.js, component.css, lab.html, RECIPE.md, tokens.json]
acceptance:
  - "create(target,{rooms}) builds one daynight-engine cell per room in [data-grid]; destroy() removes all cells + their engines"
  - "one pinned scroll t is broadcast to EVERY cell's set(t); at any t all cells sit at the same time-of-day (within an optional small stagger), so lighting == clock everywhere"
  - "no room ever shows night while the clock says morning (the desync the first reel had is gone)"
  - "the clock readout + phase + a fill bar ride the same t; the headline/sub swap by phase"
  - "opacity / transform / custom-properties only; per-night-layer will-change cleared (stacked cells perf); NO canvas, NO WebGL, NO mix-blend; frame-matched pairs only"
  - "prefers-reduced-motion -> static grid at a calm dusk, no pin/scrub; window.__LAB_OK__ on init"
gate:
  probe: "Open lab.html. __LAB_OK__ true. Scroll past the lead -> the section pins; a 2x2 grid of 4 distinct rooms goes from morning to night TOGETHER as the clock advances 07:00 -> 23:00. KEY: at any progress every cell's night-layer opacity is EQUAL (spread 0 at the default stagger:0) — cells never desync (no room at night while the clock says morning). reduced-motion freezes all cells at the SAME dusk (spread 0). NOTE: read the PINNED ScrollTrigger for progress. Smoothness PASS fps>=50, jank<8%. Verified: 4 cells, night-ops @14:12 all 0.45, @18:12 all 0.70, reduced-motion all 0.50 (spread 0 everywhere), 60fps/0% jank @4x, 0 console errors, 4 distinct rooms (no duplicates)."
note: |
  SECTION A1a / MODEL A — the synchronized-day grid. The thesis: show the WHOLE apartment and move
  ONE clock across ALL rooms at once, so time == lighting everywhere. It is the SELECTED grid model
  for the day/night-interior question (the alternative pick-a-room-then-scrub model is room-pick-day-scrub).
  Built thin on daynight-engine (one instance per cell, one broadcast t). LAWS: opacity/transform/CSS-props
  only, will-change cleared on stacked night layers (perf), frame-matched pairs only, reduced-motion ->
  static dusk grid. Real Higgsfield room pairs. Verified: synchronized (no desync), 60fps/0.6% jank, 0 errors.
---

# apartment-day-grid — Model A (synchronized day)

Every room at once; one scroll = one day for the whole apartment, in sync. See the frontmatter for the
full contract. Built on `daynight-engine` (one instance per cell, one broadcast t). The grid answer to the
day/night-interior question (the alternative is room-pick-day-scrub, pick a room then scrub its own day).
